const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');
const { verifyToken, isAdmin, isStaffOrAdmin } = require('../middlewares/auth.middleware');
const { uploadCover } = require('../middlewares/upload.middleware');

// Public endpoints
router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);

// Protected endpoints (Staff/Admin)
router.post('/', verifyToken, isStaffOrAdmin, uploadCover.single('cover'), bookController.createBook);
router.put('/:id', verifyToken, isStaffOrAdmin, uploadCover.single('cover'), bookController.updateBook);
router.delete('/:id', verifyToken, isAdmin, bookController.deleteBook);

module.exports = router;
