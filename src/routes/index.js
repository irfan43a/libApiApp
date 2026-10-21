const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const categoryRoutes = require('./category.routes');
const bookRoutes = require('./book.routes');
const borrowingRoutes = require('./borrowing.routes');
const fineRoutes = require('./fine.routes');
const dashboardRoutes = require('./dashboard.routes');
const docsRoutes = require('./docs.routes');

// Swagger API Documentation
router.use('/docs', docsRoutes);

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/books', bookRoutes);
router.use('/borrowings', borrowingRoutes);
router.use('/fines', fineRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
