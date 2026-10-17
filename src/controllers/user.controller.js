const { Op } = require('sequelize');
const { User, Borrowing, Book, Fine } = require('../models');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/response');

/**
 * Get all users / members with filtering & pagination
 * GET /api/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { nama: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { telepon: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      order: [['createdAt', 'DESC']],
    });

    const totalPages = Math.ceil(count / Number(limit));

    return paginatedResponse(res, 'Daftar pengguna berhasil diambil', rows, {
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
 * Get user by ID with borrowing and fine details
 * GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [
        {
          model: Borrowing,
          as: 'borrowings',
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
        },
        {
          model: Fine,
          as: 'fines',
        },
      ],
    });

    if (!user) {
      return errorResponse(res, 'Pengguna tidak ditemukan', null, 404);
    }

    return successResponse(res, 'Detail pengguna berhasil diambil', user);
  } catch (error) {
    next(error);
  }
};

/**
 * Create user (Admin only)
 * POST /api/users
 */
const createUser = async (req, res, next) => {
  try {
    const { nama, email, password, telepon, alamat, role, status } = req.body;

    if (!nama || !email || !password) {
      return errorResponse(res, 'Nama, email, dan password wajib diisi', null, 400);
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'Email sudah terdaftar', null, 409);
    }

    const user = await User.create({
      nama,
      email,
      password,
      telepon,
      alamat,
      role: role || 'member',
      status: status || 'aktif',
    });

    return successResponse(res, 'Pengguna berhasil dibuat', user, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user
 * PUT /api/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama, email, telepon, alamat, role, status, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, 'Pengguna tidak ditemukan', null, 404);
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return errorResponse(res, 'Email sudah digunakan pengguna lain', null, 409);
      }
      user.email = email;
    }

    if (nama) user.nama = nama;
    if (telepon !== undefined) user.telepon = telepon;
    if (alamat !== undefined) user.alamat = alamat;
    if (role) user.role = role;
    if (status) user.status = status;
    if (password) user.password = password;

    await user.save();

    return successResponse(res, 'Data pengguna berhasil diperbarui', user);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, 'Pengguna tidak ditemukan', null, 404);
    }

    // Check if user has active borrowings
    const activeBorrowings = await Borrowing.count({
      where: {
        user_id: id,
        status: { [Op.in]: ['DIPINJAM', 'TERLAMBAT'] },
      },
    });

    if (activeBorrowings > 0) {
      return errorResponse(
        res,
        'Pengguna tidak dapat dihapus karena masih memiliki peminjaman buku yang aktif/belum dikembalikan.',
        null,
        400
      );
    }

    await user.destroy();

    return successResponse(res, 'Pengguna berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
