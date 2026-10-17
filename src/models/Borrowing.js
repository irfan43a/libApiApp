const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Borrowing = sequelize.define(
  'Borrowing',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    kode_pinjam: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Kode pinjam harus unik',
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'ID Anggota wajib diisi' },
      },
    },
    buku_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'ID Buku wajib diisi' },
      },
    },
    tanggal_pinjam: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    tanggal_jatuh_tempo: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    tanggal_kembali: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('DIPINJAM', 'DIKEMBALIKAN', 'TERLAMBAT', 'HILANG'),
      defaultValue: 'DIPINJAM',
    },
    catatan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'borrowings',
    timestamps: true,
  }
);

module.exports = Borrowing;
