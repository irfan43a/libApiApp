const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler.middleware');

const app = express();

// Global Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (covers, etc.)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Health check & Welcome API route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Selamat datang di API Sistem Manajemen Perpustakaan (Library Management System)',
    version: '1.0.0',
    documentation: '/api/docs or README.md',
    server_time: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', routes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
