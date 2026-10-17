const multer = require('multer');
const { errorResponse } = require('../utils/response');

const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Rute ${req.originalUrl} tidak ditemukan`, null, 404);
};

const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err);

  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'Ukuran file gambar terlalu besar. Maksimum 3MB.', err.message, 400);
    }
    return errorResponse(res, `Upload error: ${err.message}`, err.message, 400);
  }

  // Multer file filter custom error
  if (err.message && err.message.includes('Hanya file gambar')) {
    return errorResponse(res, err.message, null, 400);
  }

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message).join(', ');
    return errorResponse(res, `Validasi gagal: ${messages}`, err.errors, 400);
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map((e) => e.message).join(', ');
    return errorResponse(res, `Data duplikat: ${messages}`, err.errors, 409);
  }

  // Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return errorResponse(res, 'Operasi gagal: Data referensi relasi tidak valid atau sedang digunakan.', err.message, 400);
  }

  // Default fallback
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan pada server';
  return errorResponse(res, message, process.env.NODE_ENV === 'development' ? err.stack : null, statusCode);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
