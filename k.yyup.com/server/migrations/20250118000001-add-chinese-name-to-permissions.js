'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 添加中文名称字段
    await queryInterface.addColumn('permissions', 'chinese_name', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: '中文名称',
      after: 'name'
    });

    // 更新现有数据的中文名称
    const updates = [
      // 主菜单
      { code: 'dashboard', chinese_name: '仪表板' },
      { code: 'user-management', chinese_name: '用户管理' },
      { code: 'enrollment-management', chinese_name: '招生管理' },
      { code: 'activity-management', chinese_name: '活动管理' },
      { code: 'marketing', chinese_name: '营销管理' },
      { code: 'ai-assistant', chinese_name: 'AI助手' },
      { code: 'system-management', chinese_name: '系统管理' },
      { code: 'principal-functions', chinese_name: '园长功能' },
      
      // 用户管理子菜单
      { code: 'student-management', chinese_name: '学生管理' },
      { code: 'teacher-management', chinese_name: '教师管理' },
      { code: 'parent-management', chinese_name: '家长管理' },
      { code: 'class-management', chinese_name: '班级管理' },
      
      // 招生管理子菜单
      { code: 'enrollment-plans', chinese_name: '招生计划' },
      { code: 'enrollment-applications', chinese_name: '招生申请' },
      { code: 'enrollment-analytics', chinese_name: '招生分析' },
      { code: 'automated-follow-up', chinese_name: '自动跟进' },
      { code: 'funnel-analytics', chinese_name: '漏斗分析' },
      { code: 'personalized-strategy', chinese_name: '个性化策略' },
      { code: 'plan-detail', chinese_name: '计划详情' },
      { code: 'plan-edit', chinese_name: '编辑计划' },
      { code: 'plan-form', chinese_name: '计划表单' },
      { code: 'plan-list', chinese_name: '计划列表' },
      { code: 'quota-manage', chinese_name: '配额管理' },
      { code: 'quota-management', chinese_name: '配额管理' },
      { code: 'statistics', chinese_name: '统计报表' },
      { code: 'ai-forecasting', chinese_name: 'AI预测' },
      { code: 'plan-evaluation', chinese_name: '计划评估' },
      { code: 'enrollment-forecast', chinese_name: '招生预测' },
      { code: 'plan-management', chinese_name: '计划管理' },
      
      // 活动管理子菜单
      { code: 'activity-create', chinese_name: '创建活动' },
      { code: 'activity-list', chinese_name: '活动列表' },
      { code: 'activity-detail', chinese_name: '活动详情' },
      { code: 'activity-edit', chinese_name: '编辑活动' },
      { code: 'activity-analytics', chinese_name: '活动分析' },
      { code: 'activity-evaluation', chinese_name: '活动评估' },
      
      // 营销管理子菜单
      { code: 'intelligent-engine', chinese_name: '智能引擎' },
      
      // 家长管理子菜单
      { code: 'assign-activity', chinese_name: '分配活动' },
      { code: 'child-growth', chinese_name: '儿童成长' },
      { code: 'children-list', chinese_name: '儿童列表' },
      { code: 'follow-up', chinese_name: '跟进记录' },
      { code: 'parent-detail', chinese_name: '家长详情' },
      { code: 'parent-edit', chinese_name: '编辑家长' },
      { code: 'parent-list', chinese_name: '家长列表' },
      { code: 'smart-hub', chinese_name: '智能中心' },
      { code: 'parent-feedback', chinese_name: '家长反馈' },
      
      // 系统管理子菜单
      { code: 'user-management', chinese_name: '用户管理' },
      { code: 'role-management', chinese_name: '角色管理' },
      { code: 'permission-management', chinese_name: '权限管理' },
      { code: 'system-settings', chinese_name: '系统设置' },
      { code: 'system-logs', chinese_name: '系统日志' },
      { code: 'backup-management', chinese_name: '备份管理' }
    ];

    // 批量更新中文名称
    for (const update of updates) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET chinese_name = :chinese_name WHERE code = :code',
        {
          replacements: update,
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // 删除中文名称字段
    await queryInterface.removeColumn('permissions', 'chinese_name');
  }
};
