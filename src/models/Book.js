const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define(
  'Book',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    judul: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Judul buku wajib diisi' },
      },
    },
    penulis: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Penulis buku wajib diisi' },
      },
    },
    penerbit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tahun_terbit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: { msg: 'Tahun terbit harus berupa angka integer' },
      },
    },
    isbn: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: {
        msg: 'ISBN sudah terdaftar',
      },
    },
    jumlah_halaman: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    stok: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: {
          args: [0],
          msg: 'Stok tidak boleh kurang dari 0',
        },
      },
    },
    tersedia: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: {
          args: [0],
          msg: 'Jumlah tersedia tidak boleh kurang dari 0',
        },
      },
    },
    lokasi_rak: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cover_gambar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kategori_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'books',
    timestamps: true,
  }
);

module.exports = Book;
