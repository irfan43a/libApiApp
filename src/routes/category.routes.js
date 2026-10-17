const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { verifyToken, isAdmin, isStaffOrAdmin } = require('../middlewares/auth.middleware');

// Public endpoints
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Protected endpoints
router.post('/', verifyToken, isStaffOrAdmin, categoryController.createCategory);
router.put('/:id', verifyToken, isStaffOrAdmin, categoryController.updateCategory);
router.delete('/:id', verifyToken, isAdmin, categoryController.deleteCategory);

module.exports = router;
