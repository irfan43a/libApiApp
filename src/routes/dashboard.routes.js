const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken, isStaffOrAdmin } = require('../middlewares/auth.middleware');

router.get('/stats', verifyToken, isStaffOrAdmin, dashboardController.getStats);

module.exports = router;
