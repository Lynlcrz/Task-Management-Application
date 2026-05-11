import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

// Creates a group of reusable connections to MySQL
// No need to create a new connection every single request
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;