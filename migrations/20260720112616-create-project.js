'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Projects', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      clientId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      translatorId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      sourceLanguageId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      targetLanguageId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      wordCount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      specializationId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      budget: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      durationDays: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      completionDeadline: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM("WAITING_PAYMENT","OPEN","IN_PROGRESS","OVERDUE","WAITING_REVIEW","COMPLETED","CANCELLED","FAILED"),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Projects');
  }
};