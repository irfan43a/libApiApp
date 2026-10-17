const { Op } = require('sequelize');
const { Fine, Borrowing, User, Book } = require('../models');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/response');
const { calculateDaysLate, calculateFine } = require('../utils/dateHelper');

/**
 * Get all fines with pagination & filters
 * GET /api/fines
 */
const getAllFines = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status_pembayaran,
      user_id,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const where = {};

    if (status_pembayaran) {
      where.status_pembayaran = status_pembayaran.toUpperCase();
    }

    if (user_id) {
      where.user_id = Number(user_id);
    }

    const { count, rows } = await Fine.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nama', 'email', 'telepon'],
        },
        {
          model: Borrowing,
          as: 'borrowing',
          attributes: ['id', 'kode_pinjam', 'tanggal_pinjam', 'tanggal_jatuh_tempo', 'tanggal_kembali', 'status'],
          include: [
            {
              model: Book,
              as: 'book',
              attributes: ['id', 'judul', 'penulis', 'isbn'],
            },
          ],
        },
      ],
    });

    const totalPages = Math.ceil(count / Number(limit));

    // Calculate sum of unpaid fines
    const totalUnpaidAmount = await Fine.sum('total_denda', {
      where: { status_pembayaran: 'BELUM_LUNAS' },
    }) || 0;

    return paginatedResponse(res, 'Daftar denda berhasil diambil', rows, {
      totalItems: count,
      totalPages,
      currentPage: Number(page),
      limit: Number(limit),
      totalUnpaidAmount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get fine by ID
 * GET /api/fines/:id
 */
const getFineById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const fine = await Fine.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nama', 'email', 'telepon', 'alamat'],
        },
        {
          model: Borrowing,
          as: 'borrowing',
          include: [
            {
              model: Book,
              as: 'book',
            },
          ],
        },
      ],
    });

    if (!fine) {
      return errorResponse(res, 'Data denda tidak ditemukan', null, 404);
    }

    // Role verification: members can only see their own fine
    if (req.user.role === 'member' && fine.user_id !== req.user.id) {
      return errorResponse(res, 'Akses ditolak ke rincian denda ini', null, 403);
    }

    return successResponse(res, 'Detail denda berhasil diambil', fine);
  } catch (error) {
    next(error);
  }
};

/**
 * Get current logged-in member's fines
 * GET /api/fines/my-fines
 */
const getMyFines = async (req, res, next) => {
  try {
    const { status_pembayaran } = req.query;
    const where = { user_id: req.user.id };

    if (status_pembayaran) {
      where.status_pembayaran = status_pembayaran.toUpperCase();
    }

    const fines = await Fine.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Borrowing,
          as: 'borrowing',
          include: [
            {
              model: Book,
              as: 'book',
              attributes: ['id', 'judul', 'penulis', 'isbn'],
            },
          ],
        },
      ],
    });

    const totalUnpaid = fines
      .filter((f) => f.status_pembayaran === 'BELUM_LUNAS')
      .reduce((sum, f) => sum + f.total_denda, 0);

    return successResponse(res, 'Daftar denda saya berhasil diambil', {
      totalUnpaidAmount: totalUnpaid,
      fines,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Pay fine (Pelunasan Denda)
 * POST /api/fines/:id/pay
 */
const payFine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { metode_pembayaran = 'TUNAI', catatan } = req.body;

    const fine = await Fine.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'nama', 'email'] },
      ],
    });

    if (!fine) {
      return errorResponse(res, 'Data denda tidak ditemukan', null, 404);
    }

    if (fine.status_pembayaran === 'LUNAS') {
      return errorResponse(
        res,
        `Denda ini sudah lunas pada ${new Date(fine.tanggal_bayar).toLocaleDateString('id-ID')}`,
        null,
        400
      );
    }

    const allowedMethods = ['TUNAI', 'TRANSFER', 'QRIS', 'LAINNYA'];
    const selectedMethod = allowedMethods.includes(metode_pembayaran.toUpperCase())
      ? metode_pembayaran.toUpperCase()
      : 'TUNAI';

    fine.status_pembayaran = 'LUNAS';
    fine.tanggal_bayar = new Date();
    fine.metode_pembayaran = selectedMethod;
    if (catatan) {
      fine.catatan = fine.catatan ? `${fine.catatan} | Bayar: ${catatan}` : catatan;
    }

    await fine.save();

    return successResponse(
      res,
      `Pembayaran denda sebesar Rp ${fine.total_denda.toLocaleString('id-ID')} berhasil diverifikasi (LUNAS)`,
      fine
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Check and flag overdue borrowings
 * GET /api/fines/check-overdue
 */
const checkOverdueBorrowings = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Find active borrowings past due date
    const overdueBorrowings = await Borrowing.findAll({
      where: {
        status: 'DIPINJAM',
        tanggal_jatuh_tempo: {
          [Op.lt]: today,
        },
      },
      include: [
        { model: Book, as: 'book', attributes: ['id', 'judul', 'penulis'] },
        { model: User, as: 'user', attributes: ['id', 'nama', 'email'] },
      ],
    });

    const fineRate = Number(process.env.FINE_PER_DAY || 1000);
    const updatedList = [];

    for (const loan of overdueBorrowings) {
      loan.status = 'TERLAMBAT';
      await loan.save();

      const daysLate = calculateDaysLate(loan.tanggal_jatuh_tempo, today);
      const estimatedFine = calculateFine(daysLate, fineRate);

      updatedList.push({
        id: loan.id,
        kode_pinjam: loan.kode_pinjam,
        buku: loan.book?.judul,
        peminjam: loan.user?.nama,
        tanggal_pinjam: loan.tanggal_pinjam,
        tanggal_jatuh_tempo: loan.tanggal_jatuh_tempo,
        hari_terlambat: daysLate,
        estimasi_denda: estimatedFine,
      });
    }

    return successResponse(
      res,
      `Berhasil memeriksa peminjaman. Terdapat ${updatedList.length} peminjaman yang telah melewati jatuh tempo.`,
      {
        total_terlambat: updatedList.length,
        items: updatedList,
      }
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllFines,
  getFineById,
  getMyFines,
  payFine,
  checkOverdueBorrowings,
};
