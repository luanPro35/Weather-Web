/**
 * Models Index
 * 
 * This file initializes all Sequelize models and sets up associations.
 */

const fs = require('fs');
const path = require('path');
const initDatabase = require('../../config/database');

const sequelize = initDatabase();
const db = {};

// Import all model files
fs.readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && 
               (file !== 'index.js') && 
               (file.slice(-3) === '.js');
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize);
        db[model.name] = model;
    });

// Set up associations
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;

module.exports = db;