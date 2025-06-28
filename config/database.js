/**
 * Database Configuration
 * 
 * This file configures the MySQL connection using Sequelize.
 */

const { Sequelize } = require('sequelize');
const config = require('./index');

const sequelize = new Sequelize(
    config.database.name,
    config.database.username,
    config.database.password,
    {
        host: config.database.host,
        dialect: 'mysql',
        logging: config.app.environment === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

module.exports = function() {
    // Test the connection
    sequelize.authenticate()
        .then(() => {
            console.log('Kết nối đến MySQL thành công.');
        })
        .catch(err => {
            console.error('Không thể kết nối đến MySQL:', err);
        });

    // Handle application termination
    process.on('SIGINT', () => {
        console.log('MySQL connection closed due to application termination');
        process.exit(0);
    });
    
    return sequelize;
};