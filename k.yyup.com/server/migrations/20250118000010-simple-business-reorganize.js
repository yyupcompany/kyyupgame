'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 简单的基于业务逻辑的重组

    // 1. 确保园长工作台存在并正确配置
    await queryInterface.sequelize.query(
      'UPDATE permissions SET chinese_name = "园长工作台", sort = 10 WHERE id = 1202',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 2. 将主要业务模块归到园长工作台下
    const businessModules = [
      { id: 1205, chinese_name: '园长仪表板', sort: 1 },
      { id: 1207, chinese_name: '全员绩效管理', sort: 2 },
      { id: 1208, chinese_name: '绩效规则设置', sort: 3 },
      { id: 1257, chinese_name: '招生计划管理', sort: 10 },
      { id: 1259, chinese_name: '学生信息审核', sort: 20 },
      { id: 1260, chinese_name: '教师信息审核', sort: 30 },
      { id: 1261, chinese_name: '家长信息审核', sort: 40 },
      { id: 1206, chinese_name: '全园数据分析', sort: 50 },
      { id: 1204, chinese_name: '客户池总览', sort: 60 },
      { id: 1212, chinese_name: '智能决策支持', sort: 70 },
    ];

    for (const module of businessModules) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET parent_id = 1202, sort = :sort, chinese_name = :chinese_name WHERE id = :id',
        {
          replacements: { id: module.id, sort: module.sort, chinese_name: module.chinese_name },
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // 3. 创建教师工作台
    await queryInterface.sequelize.query(`
      INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at)
      VALUES ('教师工作台', '教师工作台', 'teacher-workspace', 'menu', NULL, '/teacher-workspace', 'Layout', 'Avatar', 20, 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE chinese_name = '教师工作台'
    `, { type: queryInterface.sequelize.QueryTypes.INSERT });

    // 4. 创建家长中心
    await queryInterface.sequelize.query(`
      INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at)
      VALUES ('家长中心', '家长中心', 'parent-center', 'menu', NULL, '/parent-center', 'Layout', 'User', 30, 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE chinese_name = '家长中心'
    `, { type: queryInterface.sequelize.QueryTypes.INSERT });

    // 5. 获取新创建的ID并添加子功能
    const [teacherWorkspace] = await queryInterface.sequelize.query(
      'SELECT id FROM permissions WHERE code = "teacher-workspace" LIMIT 1',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const [parentCenter] = await queryInterface.sequelize.query(
      'SELECT id FROM permissions WHERE code = "parent-center" LIMIT 1',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (teacherWorkspace.length > 0) {
      const teacherWorkspaceId = teacherWorkspace[0].id;
      
      // 添加教师核心功能（基于实际存在的页面）
      const teacherFunctions = [
        { name: '我的绩效', path: '/teacher/performance/TeacherPerformance', component: 'pages/teacher/performance/TeacherPerformance.vue', sort: 1 },
        { name: '家长跟进', path: '/parent/FollowUp', component: 'pages/parent/FollowUp.vue', sort: 2 },
        { name: '活动管理', path: '/activity/ActivityList', component: 'pages/activity/ActivityList.vue', sort: 3 },
        { name: '个人发展', path: '/teacher/development/TeacherDevelopment', component: 'pages/teacher/development/TeacherDevelopment.vue', sort: 4 },
      ];

      for (const func of teacherFunctions) {
        await queryInterface.sequelize.query(`
          INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at)
          VALUES (:name, :name, :code, 'menu', :parent_id, :path, :component, 'Document', :sort, 1, NOW(), NOW())
        `, {
          replacements: {
            name: func.name,
            code: func.name.toLowerCase().replace(/\s+/g, '-'),
            parent_id: teacherWorkspaceId,
            path: func.path,
            component: func.component,
            sort: func.sort
          },
          type: queryInterface.sequelize.QueryTypes.INSERT
        });
      }
    }

    if (parentCenter.length > 0) {
      const parentCenterId = parentCenter[0].id;
      
      // 添加家长核心功能（基于实际存在的页面）
      const parentFunctions = [
        { name: '在线报名', path: '/parent/registration', component: 'pages/parent/registration.vue', sort: 1 },
        { name: '活动报名', path: '/parent/AssignActivity', component: 'pages/parent/AssignActivity.vue', sort: 2 },
        { name: '孩子信息', path: '/parent/ChildrenList', component: 'pages/parent/ChildrenList.vue', sort: 3 },
        { name: '成长记录', path: '/parent/ChildGrowth', component: 'pages/parent/ChildGrowth.vue', sort: 4 },
        { name: '意见反馈', path: '/parent/feedback/ParentFeedback', component: 'pages/parent/feedback/ParentFeedback.vue', sort: 5 },
      ];

      for (const func of parentFunctions) {
        await queryInterface.sequelize.query(`
          INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at)
          VALUES (:name, :name, :code, 'menu', :parent_id, :path, :component, 'Document', :sort, 1, NOW(), NOW())
        `, {
          replacements: {
            name: func.name,
            code: func.name.toLowerCase().replace(/\s+/g, '-'),
            parent_id: parentCenterId,
            path: func.path,
            component: func.component,
            sort: func.sort
          },
          type: queryInterface.sequelize.QueryTypes.INSERT
        });
      }
    }

    // 6. 确保系统管理保持在最后
    await queryInterface.sequelize.query(
      'UPDATE permissions SET sort = 999 WHERE id = 1255',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );
  },

  async down(queryInterface, Sequelize) {
    console.log('回滚简单的业务逻辑重组...');
    
    // 删除新创建的角色模块
    await queryInterface.sequelize.query(
      'DELETE FROM permissions WHERE code IN ("teacher-workspace", "parent-center")',
      { type: queryInterface.sequelize.QueryTypes.DELETE }
    );
  }
};
