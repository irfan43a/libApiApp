const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const { Book, Category, Borrowing, sequelize } = require('../models');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/response');

/**
 * Helper to delete cover image file from filesystem
 */
const removeCoverFile = (coverPath) => {
  if (!coverPath) return;
  // If it's a local upload relative path like /uploads/covers/filename.ext
  if (coverPath.startsWith('/uploads/covers/')) {
    const filename = path.basename(coverPath);
    const fullPath = path.resolve(__dirname, '../../public/uploads/covers', filename);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (err) {
        console.error('Gagal menghapus file gambar lama:', err.message);
      }
    }
  }
};

/**
 * Get all books with pagination, search, & category filter
 * GET /api/books
 */
const getAllBooks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      kategori_id,
      tersedia_hanya,
      sort_by = 'createdAt',
      order = 'DESC',
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const where = {};

    if (kategori_id) {
      where.kategori_id = Number(kategori_id);
    }

    if (tersedia_hanya === 'true' || tersedia_hanya === '1') {
      where.tersedia = { [Op.gt]: 0 };
    }

    if (search) {
      const likeOp = sequelize.getDialect() === 'postgres' ? Op.iLike : Op.like;
      where[Op.or] = [
        { judul: { [likeOp]: `%${search}%` } },
        { penulis: { [likeOp]: `%${search}%` } },
        { penerbit: { [likeOp]: `%${search}%` } },
        { isbn: { [likeOp]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Book.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      order: [[sort_by, order.toUpperCase()]],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'nama_kategori'],
        },
      ],
    });

    const totalPages = Math.ceil(count / Number(limit));

    return paginatedResponse(res, 'Daftar buku berhasil diambil', rows, {
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
 * Get book by ID
 * GET /api/books/:id
 */
const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const book = await Book.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'nama_kategori', 'deskripsi'],
        },
      ],
    });

    if (!book) {
      return errorResponse(res, 'Buku tidak ditemukan', null, 404);
    }

    return successResponse(res, 'Detail buku berhasil diambil', book);
  } catch (error) {
    next(error);
  }
};

/**
 * Create Book (with cover image upload)
 * POST /api/books
 */
const createBook = async (req, res, next) => {
  try {
    const {
      judul,
      penulis,
      penerbit,
      tahun_terbit,
      isbn,
      jumlah_halaman,
      stok,
      lokasi_rak,
      deskripsi,
      kategori_id,
    } = req.body;

    if (!judul || !penulis) {
      // If file was uploaded during failed request, remove it
      if (req.file) {
        removeCoverFile(`/uploads/covers/${req.file.filename}`);
      }
      return errorResponse(res, 'Judul dan Penulis buku wajib diisi', null, 400);
    }

    if (kategori_id) {
      const categoryExists = await Category.findByPk(kategori_id);
      if (!categoryExists) {
        if (req.file) removeCoverFile(`/uploads/covers/${req.file.filename}`);
        return errorResponse(res, 'Kategori tidak ditemukan', null, 404);
      }
    }

    if (isbn) {
      const existingIsbn = await Book.findOne({ where: { isbn } });
      if (existingIsbn) {
        if (req.file) removeCoverFile(`/uploads/covers/${req.file.filename}`);
        return errorResponse(res, 'ISBN sudah terdaftar pada buku lain', null, 409);
      }
    }

    const totalStok = stok !== undefined ? Number(stok) : 1;
    let cover_gambar = null;
    if (req.file) {
      cover_gambar = `/uploads/covers/${req.file.filename}`;
    }

    const book = await Book.create({
      judul,
      penulis,
      penerbit,
      tahun_terbit: tahun_terbit ? Number(tahun_terbit) : null,
      isbn,
      jumlah_halaman: jumlah_halaman ? Number(jumlah_halaman) : null,
      stok: totalStok,
      tersedia: totalStok,
      lokasi_rak,
      deskripsi,
      cover_gambar,
      kategori_id: kategori_id ? Number(kategori_id) : null,
    });

    const bookWithCategory = await Book.findByPk(book.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'nama_kategori'],
        },
      ],
    });

    return successResponse(res, 'Buku berhasil ditambahkan', bookWithCategory, 201);
  } catch (error) {
    if (req.file) {
      removeCoverFile(`/uploads/covers/${req.file.filename}`);
    }
    next(error);
  }
};

/**
 * Update Book (with optional new cover image upload)
 * PUT /api/books/:id
 */
const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      judul,
      penulis,
      penerbit,
      tahun_terbit,
      isbn,
      jumlah_halaman,
      stok,
      tersedia,
      lokasi_rak,
      deskripsi,
      kategori_id,
    } = req.body;

    const book = await Book.findByPk(id);
    if (!book) {
      if (req.file) removeCoverFile(`/uploads/covers/${req.file.filename}`);
      return errorResponse(res, 'Buku tidak ditemukan', null, 404);
    }

    if (isbn && isbn !== book.isbn) {
      const existingIsbn = await Book.findOne({ where: { isbn } });
      if (existingIsbn) {
        if (req.file) removeCoverFile(`/uploads/covers/${req.file.filename}`);
        return errorResponse(res, 'ISBN sudah terdaftar pada buku lain', null, 409);
      }
      book.isbn = isbn;
    }

    if (kategori_id) {
      const categoryExists = await Category.findByPk(kategori_id);
      if (!categoryExists) {
        if (req.file) removeCoverFile(`/uploads/covers/${req.file.filename}`);
        return errorResponse(res, 'Kategori tidak ditemukan', null, 404);
      }
      book.kategori_id = Number(kategori_id);
    }

    if (judul) book.judul = judul;
    if (penulis) book.penulis = penulis;
    if (penerbit !== undefined) book.penerbit = penerbit;
    if (tahun_terbit !== undefined) book.tahun_terbit = tahun_terbit ? Number(tahun_terbit) : null;
    if (jumlah_halaman !== undefined) book.jumlah_halaman = jumlah_halaman ? Number(jumlah_halaman) : null;
    if (lokasi_rak !== undefined) book.lokasi_rak = lokasi_rak;
    if (deskripsi !== undefined) book.deskripsi = deskripsi;

    // Handle stock changes
    if (stok !== undefined) {
      const newStok = Number(stok);
      const currentlyBorrowed = book.stok - book.tersedia;
      if (newStok < currentlyBorrowed) {
        if (req.file) removeCoverFile(`/uploads/covers/${req.file.filename}`);
        return errorResponse(
          res,
          `Stok tidak boleh kurang dari jumlah buku yang sedang dipinjam (${currentlyBorrowed} buku sedang dipinjam).`,
          null,
          400
        );
      }
      book.stok = newStok;
      book.tersedia = newStok - currentlyBorrowed;
    }

    if (tersedia !== undefined) {
      book.tersedia = Number(tersedia);
    }

    // Handle image update
    if (req.file) {
      // Remove old image if exists
      if (book.cover_gambar) {
        removeCoverFile(book.cover_gambar);
      }
      book.cover_gambar = `/uploads/covers/${req.file.filename}`;
    }

    await book.save();

    const updatedBook = await Book.findByPk(book.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'nama_kategori'],
        },
      ],
    });

    return successResponse(res, 'Buku berhasil diperbarui', updatedBook);
  } catch (error) {
    if (req.file) {
      removeCoverFile(`/uploads/covers/${req.file.filename}`);
    }
    next(error);
  }
};

/**
 * Delete Book
 * DELETE /api/books/:id
 */
const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    const book = await Book.findByPk(id);
    if (!book) {
      return errorResponse(res, 'Buku tidak ditemukan', null, 404);
    }

    // Check if book has active borrowings or history
    const activeBorrowings = await Borrowing.count({
      where: {
        buku_id: id,
        status: { [Op.in]: ['DIPINJAM', 'TERLAMBAT'] },
      },
    });

    if (activeBorrowings > 0) {
      return errorResponse(
        res,
        `Buku tidak dapat dihapus karena masih ada ${activeBorrowings} peminjaman aktif. Pastikan semua buku telah dikembalikan terlebih dahulu.`,
        null,
        400
      );
    }

    const totalBorrowings = await Borrowing.count({
      where: { buku_id: id },
    });

    if (totalBorrowings > 0) {
      return errorResponse(
        res,
        'Buku tidak dapat dihapus permanen karena memiliki riwayat transaksi peminjaman. Untuk mengarsipkan buku, Anda dapat mengubah stok menjadi 0.',
        null,
        400
      );
    }

    // Remove cover image from disk if exists
    if (book.cover_gambar) {
      removeCoverFile(book.cover_gambar);
    }

    await book.destroy();

    return successResponse(res, 'Buku berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
