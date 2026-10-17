const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin, isStaffOrAdmin } = require('../middlewares/auth.middleware');

router.get('/', verifyToken, isStaffOrAdmin, userController.getAllUsers);
router.get('/:id', verifyToken, isStaffOrAdmin, userController.getUserById);
router.post('/', verifyToken, isAdmin, userController.createUser);
router.put('/:id', verifyToken, isAdmin, userController.updateUser);
router.delete('/:id', verifyToken, isAdmin, userController.deleteUser);

module.exports = router;
