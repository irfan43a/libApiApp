const express = require('express');
const router = express.Router();
const borrowingController = require('../controllers/borrowing.controller');
const { verifyToken, isStaffOrAdmin } = require('../middlewares/auth.middleware');

// Specific routes before param routes
router.get('/my-borrowings', verifyToken, borrowingController.getMyBorrowings);
router.get('/', verifyToken, isStaffOrAdmin, borrowingController.getAllBorrowings);
router.get('/:id', verifyToken, borrowingController.getBorrowingById);

// Borrow a book (Member can borrow for themselves, Admin/Staff can borrow for any member)
router.post('/', verifyToken, borrowingController.borrowBook);

// Process return (Staff / Admin)
router.post('/:id/return', verifyToken, isStaffOrAdmin, borrowingController.returnBook);

module.exports = router;
