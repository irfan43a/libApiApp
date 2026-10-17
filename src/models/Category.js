const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define(
  'Category',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nama_kategori: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Nama kategori sudah ada',
      },
      validate: {
        notEmpty: { msg: 'Nama kategori tidak boleh kosong' },
      },
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'categories',
    timestamps: true,
  }
);

module.exports = Category;
