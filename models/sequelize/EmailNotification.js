/**
 * Email Notification Model
 * 
 * This model stores user email notification preferences.
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const EmailNotification = sequelize.define('EmailNotification', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        dailyEnabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        dailyTime: {
            type: DataTypes.TIME,
            defaultValue: '08:00:00'
        },
        dailyFrequency: {
            type: DataTypes.ENUM('daily', 'weekdays', 'weekends'),
            defaultValue: 'daily'
        },
        weeklyEnabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        weeklyDay: {
            type: DataTypes.INTEGER, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            defaultValue: 1 // Monday
        },
        weeklyTime: {
            type: DataTypes.TIME,
            defaultValue: '08:00:00'
        },
        severeWeatherEnabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        severeWeatherTypes: {
            type: DataTypes.JSON, // Store array of weather types: ['storm', 'heavyRain', 'heat', 'fog']
            defaultValue: []
        },
        lastSent: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'email_notifications',
        timestamps: true
    });

    EmailNotification.associate = (models) => {
        EmailNotification.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
    };

    return EmailNotification;
};