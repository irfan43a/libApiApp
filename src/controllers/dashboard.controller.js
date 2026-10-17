const { Op } = require('sequelize');
const { Book, User, Category, Borrowing, Fine } = require('../models');
const { successResponse } = require('../utils/response');

/**
 * Get library dashboard summary statistics
 * GET /api/dashboard/stats
 */
const getStats = async (req, res, next) => {
  try {
    // 1. Books stats
    const totalTitles = await Book.count();
    const totalCopies = (await Book.sum('stok')) || 0;
    const availableCopies = (await Book.sum('tersedia')) || 0;
    const borrowedCopies = totalCopies - availableCopies;

    // 2. Categories & Users
    const totalCategories = await Category.count();
    const totalMembers = await User.count({ where: { role: 'member' } });

    // 3. Borrowing stats
    const totalBorrowings = await Borrowing.count();
    const activeBorrowings = await Borrowing.count({ where: { status: 'DIPINJAM' } });
    const overdueBorrowings = await Borrowing.count({ where: { status: 'TERLAMBAT' } });
    const returnedBorrowings = await Borrowing.count({ where: { status: 'DIKEMBALIKAN' } });

    // 4. Fine stats
    const unpaidFinesAmount = (await Fine.sum('total_denda', { where: { status_pembayaran: 'BELUM_LUNAS' } })) || 0;
    const paidFinesAmount = (await Fine.sum('total_denda', { where: { status_pembayaran: 'LUNAS' } })) || 0;
    const unpaidFinesCount = await Fine.count({ where: { status_pembayaran: 'BELUM_LUNAS' } });

    // 5. Recent 5 borrowings
    const recentBorrowings = await Borrowing.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Book, as: 'book', attributes: ['id', 'judul', 'cover_gambar'] },
        { model: User, as: 'user', attributes: ['id', 'nama', 'email'] },
      ],
    });

    const stats = {
      buku: {
        total_judul: totalTitles,
        total_eksemplar: totalCopies,
        tersedia: availableCopies,
        dipinjam: borrowedCopies,
      },
      kategori: {
        total: totalCategories,
      },
      anggota: {
        total_member: totalMembers,
      },
      peminjaman: {
        total_transaksi: totalBorrowings,
        sedang_dipinjam: activeBorrowings,
        terlambat: overdueBorrowings,
        sudah_kembali: returnedBorrowings,
      },
      denda: {
        total_denda_lunas: paidFinesAmount,
        total_denda_tertunggak: unpaidFinesAmount,
        jumlah_kasus_tertunggak: unpaidFinesCount,
      },
      peminjaman_terbaru: recentBorrowings,
    };

    return successResponse(res, 'Statistik perpustakaan berhasil diambil', stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
};
