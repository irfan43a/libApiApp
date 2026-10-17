const { Category, Book } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get all categories
 * GET /api/categories
 */
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Book,
          as: 'books',
          attributes: ['id'],
        },
      ],
      order: [['nama_kategori', 'ASC']],
    });

    const result = categories.map((cat) => {
      const data = cat.toJSON();
      data.total_buku = data.books ? data.books.length : 0;
      delete data.books;
      return data;
    });

    return successResponse(res, 'Daftar kategori berhasil diambil', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by ID
 * GET /api/categories/:id
 */
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Book,
          as: 'books',
        },
      ],
    });

    if (!category) {
      return errorResponse(res, 'Kategori tidak ditemukan', null, 404);
    }

    return successResponse(res, 'Detail kategori berhasil diambil', category);
  } catch (error) {
    next(error);
  }
};

/**
 * Create Category
 * POST /api/categories
 */
const createCategory = async (req, res, next) => {
  try {
    const { nama_kategori, deskripsi } = req.body;

    if (!nama_kategori) {
      return errorResponse(res, 'Nama kategori wajib diisi', null, 400);
    }

    const category = await Category.create({
      nama_kategori,
      deskripsi,
    });

    return successResponse(res, 'Kategori berhasil dibuat', category, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Category
 * PUT /api/categories/:id
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama_kategori, deskripsi } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return errorResponse(res, 'Kategori tidak ditemukan', null, 404);
    }

    if (nama_kategori) category.nama_kategori = nama_kategori;
    if (deskripsi !== undefined) category.deskripsi = deskripsi;

    await category.save();

    return successResponse(res, 'Kategori berhasil diperbarui', category);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Category
 * DELETE /api/categories/:id
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return errorResponse(res, 'Kategori tidak ditemukan', null, 404);
    }

    const bookCount = await Book.count({ where: { kategori_id: id } });
    if (bookCount > 0) {
      return errorResponse(
        res,
        `Kategori tidak dapat dihapus karena masih digunakan oleh ${bookCount} buku. Silakan ubah kategori buku terlebih dahulu.`,
        null,
        400
      );
    }

    await category.destroy();

    return successResponse(res, 'Kategori berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
