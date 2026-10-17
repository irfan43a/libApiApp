const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Generate JWT Token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'supersecretjwtkey_perpustakaan_2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

/**
 * Register Member
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { nama, email, password, telepon, alamat } = req.body;

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
      role: 'member',
    });

    const token = generateToken(user);

    return successResponse(
      res,
      'Registrasi berhasil',
      {
        user,
        token,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Login User (Member / Admin / Petugas)
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email dan password wajib diisi', null, 400);
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return errorResponse(res, 'Email atau password salah', null, 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Email atau password salah', null, 401);
    }

    if (user.status !== 'aktif') {
      return errorResponse(res, 'Akun Anda dinonaktifkan. Hubungi admin.', null, 403);
    }

    const token = generateToken(user);

    return successResponse(res, 'Login berhasil', {
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Profile of logged in user
 * GET /api/auth/profile
 */
const getProfile = async (req, res, next) => {
  try {
    return successResponse(res, 'Data profil berhasil diambil', req.user);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { nama, telepon, alamat, password } = req.body;
    const user = req.user;

    if (nama) user.nama = nama;
    if (telepon) user.telepon = telepon;
    if (alamat) user.alamat = alamat;
    if (password) user.password = password;

    await user.save();

    return successResponse(res, 'Profil berhasil diperbarui', user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
