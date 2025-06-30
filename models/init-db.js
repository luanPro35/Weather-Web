/**
 * Database Initialization
 * 
 * This file initializes the database and creates tables if they don't exist.
 */

const db = require('./sequelize');

async function initializeDatabase() {
    try {
        // Sync all models with database
        // Sử dụng force: false để không xóa bảng hiện có
        // và alter: false để không thay đổi cấu trúc bảng hiện có
        await db.sequelize.sync({ force: false, alter: false });
        if (process.env.NODE_ENV !== 'production') {
            console.log('Đã đồng bộ hóa cơ sở dữ liệu thành công.');
        }
    } catch (error) {
        console.error('Không thể đồng bộ hóa cơ sở dữ liệu:', error);
    }
}

module.exports = initializeDatabase;