const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { errorResponse } = require('../utils/response');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Akses ditolak. Token autentikasi tidak ditemukan.', null, 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_perpustakaan_2026');

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return errorResponse(res, 'User dengan token ini sudah tidak terdaftar.', null, 401);
    }

    if (user.status !== 'aktif') {
      return errorResponse(res, 'Akun Anda dinonaktifkan. Silakan hubungi admin.', null, 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Token tidak valid.', error.message, 401);
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token sudah kedaluwarsa. Silakan login kembali.', error.message, 401);
    }
    return errorResponse(res, 'Gagal memverifikasi token.', error.message, 500);
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return errorResponse(res, 'Akses terlarang. Hanya admin yang memiliki izin.', null, 403);
  }
  next();
};

const isStaffOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'petugas')) {
    return errorResponse(res, 'Akses terlarang. Hanya admin atau petugas yang memiliki izin.', null, 403);
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isStaffOrAdmin,
};
