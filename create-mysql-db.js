/**
 * Create MySQL Database
 * 
 * This script creates the MySQL database if it doesn't exist.
 */

const mysql = require('mysql2/promise');
const config = require('./config');

async function createDatabase() {
    try {
        // Create connection without database name
        const connection = await mysql.createConnection({
            host: config.database.host,
            user: config.database.username,
            password: config.database.password
        });

        // Create database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database.name}`);
        console.log(`Đã tạo cơ sở dữ liệu '${config.database.name}' thành công (nếu chưa tồn tại).`);

        // Close connection
        await connection.end();
    } catch (error) {
        console.error('Lỗi khi tạo cơ sở dữ liệu:', error);
    }
}

// Execute if this file is run directly
if (require.main === module) {
    createDatabase().then(() => {
        console.log('Hoàn tất quá trình tạo cơ sở dữ liệu.');
        process.exit(0);
    }).catch(err => {
        console.error('Lỗi:', err);
        process.exit(1);
    });
}

module.exports = createDatabase;