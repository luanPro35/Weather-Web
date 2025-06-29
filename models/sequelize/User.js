/**
 * User Model (Sequelize)
 * 
 * This file defines the User model for MySQL using Sequelize.
 * Supports both Google OAuth and local email/password authentication.
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        googleId: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        displayName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true
        },
        favoriteCities: {
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                const value = this.getDataValue('favoriteCities');
                return value ? JSON.parse(value) : [];
            },
            set(value) {
                this.setDataValue('favoriteCities', JSON.stringify(value));
            }
        },
        emailNotifications: {
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                const value = this.getDataValue('emailNotifications');
                return value ? JSON.parse(value) : {
                    enabled: false,
                    email: '',
                    dailyWeather: {
                        enabled: false,
                        time: '07:00',
                        frequency: 'daily'
                    },
                    weeklyReport: {
                        enabled: false,
                        day: 'monday',
                        time: '08:00'
                    },
                    severeWeather: {
                        enabled: false,
                        conditions: ['storm', 'heavy-rain', 'extreme-heat', 'fog']
                    }
                };
            },
            set(value) {
                this.setDataValue('emailNotifications', JSON.stringify(value));
            }
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'users',
        timestamps: true,
        hooks: {
            beforeCreate: async (user) => {
                // Chỉ hash mật khẩu nếu người dùng đăng ký bằng email/password
                if (user.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
            beforeUpdate: async (user) => {
                // Chỉ hash mật khẩu nếu mật khẩu được cập nhật
                if (user.changed('password') && user.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            }
        }
    });

    // Phương thức để so sánh mật khẩu
    User.prototype.comparePassword = async function(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
    };

    return User;
};