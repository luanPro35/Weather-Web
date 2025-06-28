/**
 * Database Initialization
 * 
 * This file initializes the database and creates tables if they don't exist.
 */

const db = require('./sequelize');

async function initializeDatabase() {
    try {
        // Sync all models with database
        await db.sequelize.sync({ alter: true });
        console.log('Đã đồng bộ hóa cơ sở dữ liệu thành công.');
    } catch (error) {
        console.error('Không thể đồng bộ hóa cơ sở dữ liệu:', error);
    }
}

module.exports = initializeDatabase;