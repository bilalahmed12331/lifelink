const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

try {
  if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log('Database connected successfully');
  } else {
    console.warn('Database configuration incomplete. Running without database connection.');
    pool = null;
  }
} catch (error) {
  console.error('Database connection failed:', error.message);
  pool = null;
}

module.exports = pool;
