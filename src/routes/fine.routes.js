const express = require('express');
const router = express.Router();
const fineController = require('../controllers/fine.controller');
const { verifyToken, isStaffOrAdmin } = require('../middlewares/auth.middleware');

// Specific routes first
router.get('/my-fines', verifyToken, fineController.getMyFines);
router.get('/check-overdue', verifyToken, isStaffOrAdmin, fineController.checkOverdueBorrowings);
router.get('/', verifyToken, isStaffOrAdmin, fineController.getAllFines);
router.get('/:id', verifyToken, fineController.getFineById);

// Pay fine (Staff / Admin verification)
router.post('/:id/pay', verifyToken, isStaffOrAdmin, fineController.payFine);

module.exports = router;
