'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 基于正确的业务逻辑重新组织权限结构

    // 1. 清理现有结构，重新开始
    await queryInterface.sequelize.query(
      'UPDATE permissions SET parent_id = NULL WHERE parent_id IS NOT NULL',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 删除之前创建的不合理的菜单项
    await queryInterface.sequelize.query(
      'DELETE FROM permissions WHERE id > 1270', // 删除我之前创建的虚构菜单
      { type: queryInterface.sequelize.QueryTypes.DELETE }
    );

    // 2. 创建园长工作台 - 决策和管理中心
    await queryInterface.sequelize.query(
      'UPDATE permissions SET chinese_name = "园长工作台", sort = 10, path = "/principal", component = "Layout", icon = "Crown" WHERE id = 1202',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 园长的核心功能 - 只更新确实存在的记录
    const principalModules = [
      // 园长专属 - 决策和全局管理
      { id: 1205, parent_id: 1202, sort: 1, chinese_name: '园长仪表板' },
      { id: 1207, parent_id: 1202, sort: 2, chinese_name: '全员绩效管理' },
      { id: 1208, parent_id: 1202, sort: 3, chinese_name: '绩效规则设置' },
      { id: 1206, parent_id: 1202, sort: 20, chinese_name: '全园数据分析' },
      { id: 1204, parent_id: 1202, sort: 30, chinese_name: '客户池总览' },
      { id: 1212, parent_id: 1202, sort: 40, chinese_name: '智能决策支持' },
    ];

    for (const module of principalModules) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET parent_id = :parent_id, sort = :sort, chinese_name = :chinese_name WHERE id = :id',
        {
          replacements: module,
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // 单独处理招生管理等大模块
    await queryInterface.sequelize.query(
      'UPDATE permissions SET parent_id = 1202, sort = 10, chinese_name = "招生计划管理" WHERE id = 1257',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    await queryInterface.sequelize.query(
      'UPDATE permissions SET parent_id = 1202, sort = 50, chinese_name = "学生信息审核" WHERE id = 1259',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    await queryInterface.sequelize.query(
      'UPDATE permissions SET parent_id = 1202, sort = 60, chinese_name = "教师信息审核" WHERE id = 1260',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    await queryInterface.sequelize.query(
      'UPDATE permissions SET parent_id = 1202, sort = 70, chinese_name = "家长信息审核" WHERE id = 1261',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 3. 创建教师工作台 - 执行者工作中心
    await queryInterface.sequelize.query(`
      INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at)
      VALUES ('教师工作台', '教师工作台', 'teacher-workspace', 'menu', NULL, '/teacher-workspace', 'Layout', 'Avatar', 20, 1, NOW(), NOW())
    `, { type: queryInterface.sequelize.QueryTypes.INSERT });

    // 获取教师工作台ID
    const [teacherWorkspace] = await queryInterface.sequelize.query(
      'SELECT id FROM permissions WHERE code = "teacher-workspace" ORDER BY id DESC LIMIT 1',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const teacherWorkspaceId = teacherWorkspace.id;

    // 教师的核心功能
    const teacherRealModules = [
      // 个人绩效和排行
      { name: '我的绩效', chinese_name: '我的绩效', code: 'my-performance', path: '/teacher/performance/TeacherPerformance', component: 'pages/teacher/performance/TeacherPerformance.vue', sort: 1 },
      { name: '绩效排行榜', chinese_name: '绩效排行榜', code: 'performance-ranking', path: '/teacher/performance/ranking', component: 'pages/teacher/performance/ranking.vue', sort: 2 },
      
      // 招生执行工作
      { name: '我的招生任务', chinese_name: '我的招生任务', code: 'my-enrollment-tasks', path: '/teacher/enrollment/tasks', component: 'pages/teacher/enrollment/tasks.vue', sort: 10 },
      { name: '家长跟进记录', chinese_name: '家长跟进记录', code: 'parent-follow-up', path: '/parent/FollowUp', component: 'pages/parent/FollowUp.vue', sort: 11 },
      { name: '客户管理', chinese_name: '我的客户', code: 'my-customers', path: '/teacher/customers', component: 'pages/teacher/customers.vue', sort: 12 },
      
      // 宣传材料制作
      { name: '海报管理', chinese_name: '海报管理', code: 'poster-management', path: '/teacher/posters', component: 'pages/teacher/posters.vue', sort: 20 },
      { name: '活动列表', chinese_name: '活动列表', code: 'activity-list', path: '/activity/ActivityList', component: 'pages/activity/ActivityList.vue', sort: 21 },
      { name: '活动创建', chinese_name: '创建活动', code: 'activity-create', path: '/activity/ActivityCreate', component: 'pages/activity/ActivityCreate.vue', sort: 22 },
      
      // 信息录入（供园长审核）
      { name: '录入学生信息', chinese_name: '录入学生信息', code: 'input-student-info', path: '/teacher/student-input', component: 'pages/teacher/student-input.vue', sort: 30 },
      { name: '录入家长信息', chinese_name: '录入家长信息', code: 'input-parent-info', path: '/teacher/parent-input', component: 'pages/teacher/parent-input.vue', sort: 31 },
      
      // 个人发展
      { name: '个人发展', chinese_name: '个人发展', code: 'personal-development', path: '/teacher/development/TeacherDevelopment', component: 'pages/teacher/development/TeacherDevelopment.vue', sort: 40 },
      { name: '培训记录', chinese_name: '培训记录', code: 'training-records', path: '/teacher/training', component: 'pages/teacher/training.vue', sort: 41 },
    ];

    for (const module of teacherRealModules) {
      await queryInterface.sequelize.query(`
        INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at)
        VALUES (:name, :chinese_name, :code, 'menu', ${teacherWorkspaceId}, :path, :component, 'Document', :sort, 1, NOW(), NOW())
      `, {
        replacements: module,
        type: queryInterface.sequelize.QueryTypes.INSERT
      });
    }

    // 4. 创建家长中心 - 服务对象门户
    await queryInterface.sequelize.query(`
      INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at)
      VALUES ('家长中心', '家长中心', 'parent-center', 'menu', NULL, '/parent-center', 'Layout', 'User', 30, 1, NOW(), NOW())
    `, { type: queryInterface.sequelize.QueryTypes.INSERT });

    // 获取家长中心ID
    const [parentCenter] = await queryInterface.sequelize.query(
      'SELECT id FROM permissions WHERE code = "parent-center" ORDER BY id DESC LIMIT 1',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const parentCenterId = parentCenter.id;

    // 家长的核心功能
    const parentRealModules = [
      // 报名申请
      { name: '在线报名', chinese_name: '在线报名', code: 'online-registration', path: '/parent/registration', component: 'pages/parent/registration.vue', sort: 1 },
      { name: '报名状态查询', chinese_name: '报名状态查询', code: 'registration-status', path: '/parent/registration-status', component: 'pages/parent/registration-status.vue', sort: 2 },
      
      // 活动参与
      { name: '近期活动', chinese_name: '近期活动', code: 'recent-activities', path: '/parent/activities', component: 'pages/parent/activities.vue', sort: 10 },
      { name: '活动报名', chinese_name: '活动报名', code: 'activity-registration', path: '/parent/AssignActivity', component: 'pages/parent/AssignActivity.vue', sort: 11 },
      { name: '我的活动', chinese_name: '我的活动', code: 'my-activities', path: '/parent/my-activities', component: 'pages/parent/my-activities.vue', sort: 12 },
      
      // 孩子信息
      { name: '孩子信息', chinese_name: '孩子信息', code: 'child-info', path: '/parent/ChildrenList', component: 'pages/parent/ChildrenList.vue', sort: 20 },
      { name: '成长记录', chinese_name: '成长记录', code: 'growth-records', path: '/parent/ChildGrowth', component: 'pages/parent/ChildGrowth.vue', sort: 21 },
      
      // 沟通反馈
      { name: '与老师沟通', chinese_name: '与老师沟通', code: 'teacher-communication', path: '/parent/communication/SmartHub', component: 'pages/parent/communication/SmartHub.vue', sort: 30 },
      { name: '意见反馈', chinese_name: '意见反馈', code: 'feedback', path: '/parent/feedback/ParentFeedback', component: 'pages/parent/feedback/ParentFeedback.vue', sort: 31 },
    ];

    for (const module of parentRealModules) {
      await queryInterface.sequelize.query(`
        INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at)
        VALUES (:name, :chinese_name, :code, 'menu', ${parentCenterId}, :path, :component, 'Document', :sort, 1, NOW(), NOW())
      `, {
        replacements: module,
        type: queryInterface.sequelize.QueryTypes.INSERT
      });
    }

    // 5. 保持管理员模块不变（技术配置）
    await queryInterface.sequelize.query(
      'UPDATE permissions SET chinese_name = "系统管理(Admin)", sort = 999 WHERE id = 1255',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 6. 保留首页
    await queryInterface.sequelize.query(
      'UPDATE permissions SET chinese_name = "首页", sort = 1, parent_id = NULL WHERE id = 1254',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );
  },

  async down(queryInterface, Sequelize) {
    console.log('回滚基于业务逻辑的权限重组...');
    
    // 删除新创建的角色模块
    await queryInterface.sequelize.query(
      'DELETE FROM permissions WHERE code IN ("teacher-workspace", "parent-center")',
      { type: queryInterface.sequelize.QueryTypes.DELETE }
    );
  }
};
