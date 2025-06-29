'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('email_notifications', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      dailyEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      dailyTime: {
        type: Sequelize.TIME,
        defaultValue: '08:00:00'
      },
      dailyFrequency: {
        type: Sequelize.ENUM('daily', 'weekdays', 'weekends'),
        defaultValue: 'daily'
      },
      weeklyEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      weeklyDay: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      weeklyTime: {
        type: Sequelize.TIME,
        defaultValue: '08:00:00'
      },
      severeWeatherEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      severeWeatherTypes: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      lastSent: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add unique index on userId
    await queryInterface.addIndex('email_notifications', ['userId'], {
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('email_notifications');
  }
};