const { Op } = require('sequelize');
const { sequelize, Borrowing, Book, User, Fine, Category } = require('../models');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/response');
const { addDays, calculateDaysLate, calculateFine } = require('../utils/dateHelper');

/**
 * Helper to generate unique borrow code (e.g. PJ-20261017-1234)
 */
const generateBorrowCode = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `PJ-${dateStr}-${randomSuffix}`;
};

/**
 * Borrow Book (Peminjaman)
 * POST /api/borrowings
 */
const borrowBook = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { buku_id, user_id, durasi_hari, catatan } = req.body;

    // Determine target user
    let targetUserId = req.user.id;
    if (['admin', 'petugas'].includes(req.user.role) && user_id) {
      targetUserId = Number(user_id);
    }

    // 1. Verify User
    const borrower = await User.findByPk(targetUserId, { transaction: t });
    if (!borrower) {
      await t.rollback();
      return errorResponse(res, 'Peminjam (user) tidak ditemukan', null, 404);
    }

    if (borrower.status !== 'aktif') {
      await t.rollback();
      return errorResponse(res, 'Akun peminjam sedang nonaktif', null, 403);
    }

    // 2. Check Unpaid Fines
    const unpaidFinesCount = await Fine.count({
      where: {
        user_id: targetUserId,
        status_pembayaran: 'BELUM_LUNAS',
      },
      transaction: t,
    });

    if (unpaidFinesCount > 0) {
      await t.rollback();
      return errorResponse(
        res,
        `Peminjaman ditolak. Pengguna masih memiliki ${unpaidFinesCount} denda yang belum dilunasi. Harap lunasi denda terlebih dahulu.`,
        null,
        400
      );
    }

    // 3. Check Active Borrow Limit
    const maxLimit = Number(process.env.MAX_BORROW_LIMIT || 3);
    const activeBorrowingsCount = await Borrowing.count({
      where: {
        user_id: targetUserId,
        status: { [Op.in]: ['DIPINJAM', 'TERLAMBAT'] },
      },
      transaction: t,
    });

    if (activeBorrowingsCount >= maxLimit) {
      await t.rollback();
      return errorResponse(
        res,
        `Peminjaman ditolak. Batas maksimal peminjaman (${maxLimit} buku) telah tercapai. Harap kembalikan buku yang dipinjam sebelumnya.`,
        null,
        400
      );
    }

    // 4. Verify Book & Stock
    if (!buku_id) {
      await t.rollback();
      return errorResponse(res, 'ID Buku wajib disertakan', null, 400);
    }

    const book = await Book.findByPk(buku_id, { transaction: t });
    if (!book) {
      await t.rollback();
      return errorResponse(res, 'Buku tidak ditemukan', null, 404);
    }

    if (book.tersedia <= 0) {
      await t.rollback();
      return errorResponse(
        res,
        `Buku "${book.judul}" saat ini tidak tersedia untuk dipinjam (stok sedang kosong).`,
        null,
        400
      );
    }

    // 5. Calculate Dates
    const duration = durasi_hari ? Number(durasi_hari) : Number(process.env.LOAN_DURATION_DAYS || 7);
    const today = new Date();
    const dueDate = addDays(today, duration);

    // Format DATEONLY as YYYY-MM-DD
    const tanggalPinjam = today.toISOString().split('T')[0];
    const tanggalJatuhTempo = dueDate.toISOString().split('T')[0];

    // 6. Create Borrowing Record
    const kode_pinjam = generateBorrowCode();
    const borrowing = await Borrowing.create(
      {
        kode_pinjam,
        user_id: targetUserId,
        buku_id: book.id,
        tanggal_pinjam: tanggalPinjam,
        tanggal_jatuh_tempo: tanggalJatuhTempo,
        status: 'DIPINJAM',
        catatan,
      },
      { transaction: t }
    );

    // 7. Decrement available stock
    book.tersedia = book.tersedia - 1;
    await book.save({ transaction: t });

    await t.commit();

    const result = await Borrowing.findByPk(borrowing.id, {
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'judul', 'penulis', 'isbn', 'cover_gambar'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nama', 'email', 'telepon'],
        },
      ],
    });

    return successResponse(res, 'Peminjaman buku berhasil dicatat', result, 201);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

/**
 * Return Book (Pengembalian & Hitung Denda Otomatis)
 * POST /api/borrowings/:id/return
 */
const returnBook = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { catatan_pengembalian, tanggal_kembali_custom } = req.body;

    const borrowing = await Borrowing.findByPk(id, {
      include: [
        { model: Book, as: 'book' },
        { model: User, as: 'user', attributes: ['id', 'nama', 'email'] },
      ],
      transaction: t,
    });

    if (!borrowing) {
      await t.rollback();
      return errorResponse(res, 'Data peminjaman tidak ditemukan', null, 404);
    }

    if (borrowing.status === 'DIKEMBALIKAN') {
      await t.rollback();
      return errorResponse(res, 'Buku untuk transaksi ini sudah dikembalikan sebelumnya', null, 400);
    }

    // Determine actual return date
    const actualReturnDate = tanggal_kembali_custom
      ? new Date(tanggal_kembali_custom)
      : new Date();
    const returnDateStr = actualReturnDate.toISOString().split('T')[0];

    // Calculate Days Late
    const daysLate = calculateDaysLate(borrowing.tanggal_jatuh_tempo, returnDateStr);
    const fineRate = Number(process.env.FINE_PER_DAY || 1000);
    const totalDenda = calculateFine(daysLate, fineRate);

    // Update borrowing status
    borrowing.tanggal_kembali = returnDateStr;
    borrowing.status = 'DIKEMBALIKAN';
    if (catatan_pengembalian) {
      borrowing.catatan = borrowing.catatan
        ? `${borrowing.catatan} | Pengembalian: ${catatan_pengembalian}`
        : `Pengembalian: ${catatan_pengembalian}`;
    }
    await borrowing.save({ transaction: t });

    // Restore book availability
    const book = await Book.findByPk(borrowing.buku_id, { transaction: t });
    if (book) {
      book.tersedia = Math.min(book.stok, book.tersedia + 1);
      await book.save({ transaction: t });
    }

    let createdFine = null;
    if (daysLate > 0 && totalDenda > 0) {
      // Create or update Fine record
      createdFine = await Fine.create(
        {
          peminjaman_id: borrowing.id,
          user_id: borrowing.user_id,
          jumlah_hari_terlambat: daysLate,
          tarif_per_hari: fineRate,
          total_denda: totalDenda,
          status_pembayaran: 'BELUM_LUNAS',
          catatan: `Keterlambatan pengembalian ${daysLate} hari (Jatuh tempo: ${borrowing.tanggal_jatuh_tempo})`,
        },
        { transaction: t }
      );
    }

    await t.commit();

    const responseData = {
      peminjaman: borrowing,
      keterlambatan: {
        terlambat_hari: daysLate,
        tarif_per_hari: fineRate,
        total_denda: totalDenda,
        status_denda: createdFine ? 'BELUM_LUNAS' : 'TIDAK_ADA_DENDA',
      },
      fine: createdFine,
    };

    const message = daysLate > 0
      ? `Buku berhasil dikembalikan. Terdapat denda keterlambatan sebesar Rp ${totalDenda.toLocaleString('id-ID')} (${daysLate} hari).`
      : 'Buku berhasil dikembalikan tepat waktu tanpa denda.';

    return successResponse(res, message, responseData);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

/**
 * Get all borrowings (Admin / Staff)
 * GET /api/borrowings
 */
const getAllBorrowings = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      user_id,
      buku_id,
      dari_tanggal,
      sampai_tanggal,
      search,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const where = {};

    if (status) where.status = status;
    if (user_id) where.user_id = Number(user_id);
    if (buku_id) where.buku_id = Number(buku_id);

    if (dari_tanggal && sampai_tanggal) {
      where.tanggal_pinjam = { [Op.between]: [dari_tanggal, sampai_tanggal] };
    }

    if (search) {
      const likeOp = sequelize.getDialect() === 'postgres' ? Op.iLike : Op.like;
      where.kode_pinjam = { [likeOp]: `%${search}%` };
    }

    const { count, rows } = await Borrowing.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'judul', 'penulis', 'isbn', 'cover_gambar'],
          include: [{ model: Category, as: 'category', attributes: ['id', 'nama_kategori'] }],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nama', 'email', 'telepon'],
        },
        {
          model: Fine,
          as: 'fine',
        },
      ],
    });

    const totalPages = Math.ceil(count / Number(limit));

    return paginatedResponse(res, 'Daftar peminjaman berhasil diambil', rows, {
      totalItems: count,
      totalPages,
      currentPage: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current logged in member's borrowings
 * GET /api/borrowings/my-borrowings
 */
const getMyBorrowings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = { user_id: req.user.id };

    if (status) where.status = status;

    const borrowings = await Borrowing.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'judul', 'penulis', 'isbn', 'cover_gambar'],
        },
        {
          model: Fine,
          as: 'fine',
        },
      ],
    });

    return successResponse(res, 'Riwayat peminjaman saya berhasil diambil', borrowings);
  } catch (error) {
    next(error);
  }
};

/**
 * Get borrowing detail by ID
 * GET /api/borrowings/:id
 */
const getBorrowingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const borrowing = await Borrowing.findByPk(id, {
      include: [
        {
          model: Book,
          as: 'book',
          include: [{ model: Category, as: 'category' }],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nama', 'email', 'telepon', 'alamat'],
        },
        {
          model: Fine,
          as: 'fine',
        },
      ],
    });

    if (!borrowing) {
      return errorResponse(res, 'Data peminjaman tidak ditemukan', null, 404);
    }

    // Authorization check for regular members
    if (req.user.role === 'member' && borrowing.user_id !== req.user.id) {
      return errorResponse(res, 'Akses ditolak ke data peminjaman pengguna lain', null, 403);
    }

    return successResponse(res, 'Detail peminjaman berhasil diambil', borrowing);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  borrowBook,
  returnBook,
  getAllBorrowings,
  getMyBorrowings,
  getBorrowingById,
};
