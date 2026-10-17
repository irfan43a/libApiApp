require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const dialect = process.env.DB_DIALECT || 'sqlite';

let sequelize;

if (dialect === 'sqlite') {
  const storagePath = path.resolve(process.env.DB_STORAGE || './src/database/library.sqlite');
  const dbDir = path.dirname(storagePath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });
} else if (dialect === 'mysql') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'library_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
} else if (dialect === 'postgres') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'library_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
} else {
  throw new Error(`Unsupported database dialect: ${dialect}`);
}

module.exports = sequelize;
