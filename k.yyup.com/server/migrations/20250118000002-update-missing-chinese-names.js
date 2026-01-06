'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 补充缺失的中文名称
    const updates = [
      // 主要菜单项
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
      
      // 活动管理
      { code: 'activity-create', chinese_name: '创建活动' },
      { code: 'activity-list', chinese_name: '活动列表' },
      { code: 'activity-detail', chinese_name: '活动详情' },
      { code: 'activity-edit', chinese_name: '编辑活动' },
      { code: 'activity-analytics', chinese_name: '活动分析' },
      { code: 'activity-evaluation', chinese_name: '活动评估' },
      
      // 招生管理
      { code: 'enrollment-plans', chinese_name: '招生计划' },
      { code: 'enrollment-applications', chinese_name: '招生申请' },
      { code: 'enrollment-analytics', chinese_name: '招生分析' },
      { code: 'automated-follow-up', chinese_name: '自动跟进' },
      { code: 'funnel-analytics', chinese_name: '漏斗分析' },
      { code: 'personalized-strategy', chinese_name: '个性化策略' },
      
      // 系统管理
      { code: 'user-management', chinese_name: '用户管理' },
      { code: 'role-management', chinese_name: '角色管理' },
      { code: 'permission-management', chinese_name: '权限管理' },
      { code: 'system-settings', chinese_name: '系统设置' },
      { code: 'system-logs', chinese_name: '系统日志' },
      { code: 'backup-management', chinese_name: '备份管理' }
    ];

    // 批量更新中文名称（基于code字段）
    for (const update of updates) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET chinese_name = :chinese_name WHERE code = :code AND chinese_name IS NULL',
        {
          replacements: update,
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // 基于name字段的更新（对于没有code或code不匹配的情况）
    const nameUpdates = [
      { name: '用户管理', chinese_name: '用户管理' },
      { name: '招生管理', chinese_name: '招生管理' },
      { name: '活动管理', chinese_name: '活动管理' },
      { name: '学生管理', chinese_name: '学生管理' },
      { name: '教师管理', chinese_name: '教师管理' },
      { name: '家长管理', chinese_name: '家长管理' },
      { name: '班级管理', chinese_name: '班级管理' },
      { name: '系统管理', chinese_name: '系统管理' },
      { name: '招生计划', chinese_name: '招生计划' },
      { name: '招生申请', chinese_name: '招生申请' },
      { name: '用户账户', chinese_name: '用户账户' },
      { name: '角色管理', chinese_name: '角色管理' },
      { name: '权限管理', chinese_name: '权限管理' },
      
      // 英文名称转中文
      { name: 'Dashboard', chinese_name: '仪表板' },
      { name: 'User', chinese_name: '用户管理' },
      { name: 'Role', chinese_name: '角色管理' },
      { name: 'Permission', chinese_name: '权限管理' },
      { name: 'Student', chinese_name: '学生管理' },
      { name: 'Teacher', chinese_name: '教师管理' },
      { name: 'Parent', chinese_name: '家长管理' },
      { name: 'Class', chinese_name: '班级管理' },
      { name: 'Activity', chinese_name: '活动管理' },
      { name: 'Enrollment', chinese_name: '招生管理' },
      { name: 'Marketing', chinese_name: '营销管理' },
      { name: 'Statistics', chinese_name: '统计报表' },
      { name: 'Analytics', chinese_name: '数据分析' },
      { name: 'Chat', chinese_name: '聊天' },
      { name: 'AIAssistantPage', chinese_name: 'AI助手' },
      { name: 'ActivityCreate', chinese_name: '创建活动' },
      { name: 'ActivityList', chinese_name: '活动列表' },
      { name: 'ActivityDetail', chinese_name: '活动详情' },
      { name: 'ActivityEdit', chinese_name: '编辑活动' },
      { name: 'ActivityAnalytics', chinese_name: '活动分析' },
      { name: 'ActivityEvaluation', chinese_name: '活动评估' },
      { name: 'StudentDetail', chinese_name: '学生详情' },
      { name: 'StudentList', chinese_name: '学生列表' },
      { name: 'TeacherDetail', chinese_name: '教师详情' },
      { name: 'TeacherList', chinese_name: '教师列表' },
      { name: 'ParentDetail', chinese_name: '家长详情' },
      { name: 'ParentList', chinese_name: '家长列表' },
      { name: 'ClassDetail', chinese_name: '班级详情' },
      { name: 'PlanList', chinese_name: '计划列表' },
      { name: 'PlanDetail', chinese_name: '计划详情' },
      { name: 'ApplicationList', chinese_name: '申请列表' },
      { name: 'ApplicationDetail', chinese_name: '申请详情' }
    ];

    // 批量更新中文名称（基于name字段）
    for (const update of nameUpdates) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET chinese_name = :chinese_name WHERE name = :name AND chinese_name IS NULL',
        {
          replacements: update,
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // 清空新添加的中文名称
    await queryInterface.sequelize.query(
      'UPDATE permissions SET chinese_name = NULL WHERE chinese_name IS NOT NULL'
    );
  }
};
