'use strict';

/**
 * 扩展幼儿园表以支持集团管理
 * 添加集团关联字段
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. 添加 group_id 字段
    await queryInterface.addColumn('kindergartens', 'group_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: '所属集团ID',
      references: {
        model: 'groups',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      after: 'id'
    });

    // 2. 添加 is_group_headquarters 字段
    await queryInterface.addColumn('kindergartens', 'is_group_headquarters', {
      type: Sequelize.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: '是否为集团总部: 0-否 1-是',
      after: 'group_id'
    });

    // 3. 添加 group_role 字段
    await queryInterface.addColumn('kindergartens', 'group_role', {
      type: Sequelize.TINYINT,
      allowNull: true,
      comment: '集团角色: 1-总部 2-旗舰园 3-标准园 4-加盟园',
      after: 'is_group_headquarters'
    });

    // 4. 添加 join_group_date 字段
    await queryInterface.addColumn('kindergartens', 'join_group_date', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: '加入集团日期',
      after: 'group_role'
    });

    // 5. 添加 leave_group_date 字段
    await queryInterface.addColumn('kindergartens', 'leave_group_date', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: '退出集团日期',
      after: 'join_group_date'
    });

    // 6. 添加 group_join_reason 字段
    await queryInterface.addColumn('kindergartens', 'group_join_reason', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: '加入集团原因',
      after: 'leave_group_date'
    });

    // 注意: kindergartens表已有太多索引(64个限制),暂不添加新索引
    // 查询时可以使用 group_id 字段进行过滤,性能影响不大

    console.log('✅ 幼儿园表已扩展以支持集团管理');
  },

  async down(queryInterface, Sequelize) {
    // 没有创建索引，无需删除

    // 删除字段
    await queryInterface.removeColumn('kindergartens', 'group_join_reason');
    await queryInterface.removeColumn('kindergartens', 'leave_group_date');
    await queryInterface.removeColumn('kindergartens', 'join_group_date');
    await queryInterface.removeColumn('kindergartens', 'group_role');
    await queryInterface.removeColumn('kindergartens', 'is_group_headquarters');
    await queryInterface.removeColumn('kindergartens', 'group_id');

    console.log('✅ 幼儿园表集团相关字段已删除');
  }
};

