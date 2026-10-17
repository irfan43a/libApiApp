const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Book = require('./Book');
const Borrowing = require('./Borrowing');
const Fine = require('./Fine');

// Relationships

// Category <-> Book (1 to Many)
Category.hasMany(Book, {
  foreignKey: 'kategori_id',
  as: 'books',
  onDelete: 'SET NULL',
});
Book.belongsTo(Category, {
  foreignKey: 'kategori_id',
  as: 'category',
});

// User <-> Borrowing (1 to Many)
User.hasMany(Borrowing, {
  foreignKey: 'user_id',
  as: 'borrowings',
  onDelete: 'CASCADE',
});
Borrowing.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Book <-> Borrowing (1 to Many)
Book.hasMany(Borrowing, {
  foreignKey: 'buku_id',
  as: 'borrowings',
  onDelete: 'RESTRICT',
});
Borrowing.belongsTo(Book, {
  foreignKey: 'buku_id',
  as: 'book',
});

// Borrowing <-> Fine (1 to 1)
Borrowing.hasOne(Fine, {
  foreignKey: 'peminjaman_id',
  as: 'fine',
  onDelete: 'CASCADE',
});
Fine.belongsTo(Borrowing, {
  foreignKey: 'peminjaman_id',
  as: 'borrowing',
});

// User <-> Fine (1 to Many)
User.hasMany(Fine, {
  foreignKey: 'user_id',
  as: 'fines',
  onDelete: 'CASCADE',
});
Fine.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

module.exports = {
  sequelize,
  User,
  Category,
  Book,
  Borrowing,
  Fine,
};
