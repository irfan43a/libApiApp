const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Fine = sequelize.define(
  'Fine',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    peminjaman_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: {
        msg: 'Denda untuk transaksi peminjaman ini sudah ada',
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jumlah_hari_terlambat: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    tarif_per_hari: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1000,
    },
    total_denda: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status_pembayaran: {
      type: DataTypes.ENUM('BELUM_LUNAS', 'LUNAS'),
      defaultValue: 'BELUM_LUNAS',
    },
    tanggal_bayar: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metode_pembayaran: {
      type: DataTypes.ENUM('TUNAI', 'TRANSFER', 'QRIS', 'LAINNYA'),
      allowNull: true,
    },
    catatan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'fines',
    timestamps: true,
  }
);

module.exports = Fine;
