'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('activity_templates', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '模板名称',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: '模板描述',
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: '模板分类',
      },
      coverImage: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '封面图片路径',
      },
      usageCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '使用次数',
      },
      templateData: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: '模板配置数据',
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
        comment: '状态',
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '创建者ID',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 添加索引
    await queryInterface.addIndex('activity_templates', ['category']);
    await queryInterface.addIndex('activity_templates', ['status']);
    await queryInterface.addIndex('activity_templates', ['createdBy']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('activity_templates');
  }
};
