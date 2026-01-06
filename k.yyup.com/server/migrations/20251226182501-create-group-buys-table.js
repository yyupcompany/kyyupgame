'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('group_buys', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      activity_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'activities',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      group_leader_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '开团者用户ID',
      },
      group_code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        comment: '团购唯一标识码',
      },
      target_people: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2,
        comment: '成团目标人数',
      },
      current_people: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '当前参团人数（含开团者）',
      },
      max_people: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 50,
        comment: '最大参团人数',
      },
      group_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: '团购价格',
      },
      original_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: '原价',
      },
      price_steps: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '阶梯价格配置JSON: [{"people": 2, "price": 99}, {"people": 5, "price": 89}]',
      },
      deadline: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: '团购截止时间',
      },
      status: {
        type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'failed', 'expired'),
        allowNull: false,
        defaultValue: 'pending',
        comment: '团购状态',
      },
      share_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '分享次数',
      },
      view_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '浏览次数',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // 添加索引
    await queryInterface.addIndex('group_buys', ['activity_id']);
    await queryInterface.addIndex('group_buys', ['group_leader_id']);
    await queryInterface.addIndex('group_buys', ['group_code'], { unique: true });
    await queryInterface.addIndex('group_buys', ['status']);
    await queryInterface.addIndex('group_buys', ['deadline']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('group_buys');
  }
};
