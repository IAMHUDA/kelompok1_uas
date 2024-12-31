const mysql = require('mysql2/promise'); // Menggunakan promise
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Menguji koneksi dengan fungsi async
async function testConnection() {
    try {
        const connection = await pool.getConnection(); // Mendapatkan koneksi
        console.log('Connected to the MySQL database.');
        connection.release(); // Mengembalikan koneksi ke pool
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
}

testConnection();

module.exports = pool; // Mengekspor pool
