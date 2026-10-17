const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.resolve(__dirname, '../../public/uploads/covers');

// Ensure destination folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `book-${uniqueSuffix}${ext}`);
  },
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|gif/;
  const isExtValid = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const isMimeValid = allowedExtensions.test(file.mimetype) || file.mimetype.startsWith('image/');

  if (isExtValid && isMimeValid) {
    return cb(null, true);
  }
  cb(new Error('Hanya file gambar (jpg, jpeg, png, webp, gif) yang diperbolehkan!'));
};

const uploadCover = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3 MB max
  },
});

module.exports = {
  uploadCover,
};
