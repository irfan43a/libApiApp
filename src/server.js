require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Authenticate with SQL Database
    await sequelize.authenticate();
    console.log(`[Database] Terhubung ke database SQL (${sequelize.getDialect()}) berhasil.`);

    // Sync models (creates tables automatically if not present)
    await sequelize.sync({ alter: false });
    console.log('[Database] Sinkronisasi tabel model berhasil.');

    // Start listening
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Perpustakaan API Server running on port ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌐 Dialect: ${sequelize.getDialect().toUpperCase()}`);
      console.log(`📁 Uploads: http://localhost:${PORT}/uploads/covers`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('[Server Error] Gagal menjalankan server:', error);
    process.exit(1);
  }
};

startServer();
