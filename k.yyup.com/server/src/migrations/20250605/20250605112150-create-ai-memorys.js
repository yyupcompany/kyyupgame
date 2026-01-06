'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ai_memories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '用户ID'
      },
      conversation_id: {
        type: Sequelize.STRING(36),
        allowNull: false,
        comment: '会话ID'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: '记忆内容'
      },
      embedding: {
        type: Sequelize.BLOB,
        allowNull: true,
        comment: '向量嵌入'
      },
      importance: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0.5,
        comment: '重要性评分'
      },
      memory_type: {
        type: Sequelize.ENUM('immediate', 'short_term', 'long_term'),
        allowNull: false,
        comment: '记忆类型(即时/短期/长期)'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: '过期时间'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ai_memories');
  }
};
