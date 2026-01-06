'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('script_templates', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: '话术标题',
      },
      category: {
        type: Sequelize.ENUM('greeting', 'introduction', 'qa', 'invitation', 'closing', 'other'),
        allowNull: false,
        defaultValue: 'other',
        comment: '分类：greeting(问候)、introduction(介绍)、qa(答疑)、invitation(邀约)、closing(结束)、other(其他)',
      },
      keywords: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: '关键词（逗号分隔）',
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: '话术内容',
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5,
        comment: '优先级（1-10，数字越大优先级越高）',
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
        comment: '状态',
      },
      usageCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '使用次数',
      },
      successRate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: '成功率（0-100）',
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '创建人ID',
      },
      updatedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '更新人ID',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // 添加索引
    await queryInterface.addIndex('script_templates', ['category'], {
      name: 'idx_category',
    });

    await queryInterface.addIndex('script_templates', ['status'], {
      name: 'idx_status',
    });

    await queryInterface.addIndex('script_templates', ['priority'], {
      name: 'idx_priority',
    });

    // 添加全文索引（MySQL）
    await queryInterface.sequelize.query(
      'ALTER TABLE script_templates ADD FULLTEXT INDEX idx_keywords (keywords)'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('script_templates');
  }
};
