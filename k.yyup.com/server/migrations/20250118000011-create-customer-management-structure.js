'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 创建正确的客户管理结构

    // 1. 确保园长工作台下有客户池管理
    // 园长的客户池总览已经存在 (id: 1204)，更新其功能描述
    await queryInterface.sequelize.query(
      'UPDATE permissions SET chinese_name = "全园客户池管理", path = "/principal/customer-pool" WHERE id = 1204',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 2. 为园长客户池添加子功能
    const principalCustomerFunctions = [
      { name: '客户池总览', chinese_name: '客户池总览', path: '/principal/customer-pool/overview', sort: 1 },
      { name: '客户分配管理', chinese_name: '客户分配管理', path: '/principal/customer-pool/assignment', sort: 2 },
      { name: '全园客户统计', chinese_name: '全园客户统计', path: '/principal/customer-pool/statistics', sort: 3 },
      { name: '客户来源分析', chinese_name: '客户来源分析', path: '/principal/customer-pool/source-analysis', sort: 4 },
    ];

    for (const func of principalCustomerFunctions) {
      await queryInterface.sequelize.query(`
        INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at)
        VALUES (:name, :chinese_name, :code, 'menu', 1204, :path, :component, 'Document', :sort, 1, NOW(), NOW())
      `, {
        replacements: {
          name: func.name,
          chinese_name: func.chinese_name,
          code: func.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
          path: func.path,
          component: `pages/principal/customer-pool/${func.name.toLowerCase().replace(/\s+/g, '-')}.vue`,
          sort: func.sort
        },
        type: queryInterface.sequelize.QueryTypes.INSERT
      });
    }

    // 3. 创建教师工作台（如果不存在）
    await queryInterface.sequelize.query(`
      INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at)
      VALUES ('教师工作台', '教师工作台', 'teacher-workspace', 'menu', NULL, '/teacher-workspace', 'Layout', 'Avatar', 20, 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE chinese_name = '教师工作台'
    `, { type: queryInterface.sequelize.QueryTypes.INSERT });

    // 获取教师工作台ID
    const [teacherWorkspace] = await queryInterface.sequelize.query(
      'SELECT id FROM permissions WHERE code = "teacher-workspace" LIMIT 1',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (teacherWorkspace.length > 0) {
      const teacherWorkspaceId = teacherWorkspace[0].id;

      // 4. 为教师工作台创建客户中心
      await queryInterface.sequelize.query(`
        INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at)
        VALUES ('我的客户中心', '我的客户中心', 'my-customer-center', 'category', :parent_id, '#my-customers', NULL, 'User', 10, 1, NOW(), NOW())
      `, {
        replacements: { parent_id: teacherWorkspaceId },
        type: queryInterface.sequelize.QueryTypes.INSERT
      });

      // 获取客户中心ID
      const [customerCenter] = await queryInterface.sequelize.query(
        'SELECT id FROM permissions WHERE code = "my-customer-center" ORDER BY id DESC LIMIT 1',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (customerCenter.length > 0) {
        const customerCenterId = customerCenter[0].id;

        // 5. 为教师客户中心添加具体功能
        const teacherCustomerFunctions = [
          { 
            name: '我的客户', 
            chinese_name: '我的客户', 
            path: '/teacher/customers/my-customers', 
            component: 'pages/teacher/customers/my-customers.vue',
            description: '教师自己添加的客户',
            sort: 1 
          },
          { 
            name: '分配给我的客户', 
            chinese_name: '分配给我的客户', 
            path: '/teacher/customers/assigned-customers', 
            component: 'pages/teacher/customers/assigned-customers.vue',
            description: '园长从客户池分配的客户',
            sort: 2 
          },
          { 
            name: '客户跟进记录', 
            chinese_name: '客户跟进记录', 
            path: '/parent/FollowUp', 
            component: 'pages/parent/FollowUp.vue',
            description: '所有客户的跟进记录',
            sort: 3 
          },
          { 
            name: '添加新客户', 
            chinese_name: '添加新客户', 
            path: '/teacher/customers/add-customer', 
            component: 'pages/teacher/customers/add-customer.vue',
            description: '教师主动添加潜在客户',
            sort: 4 
          },
        ];

        for (const func of teacherCustomerFunctions) {
          await queryInterface.sequelize.query(`
            INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at)
            VALUES (:name, :chinese_name, :code, 'menu', :parent_id, :path, :component, 'Document', :sort, 1, NOW(), NOW())
          `, {
            replacements: {
              name: func.name,
              chinese_name: func.chinese_name,
              code: func.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
              parent_id: customerCenterId,
              path: func.path,
              component: func.component,
              sort: func.sort
            },
            type: queryInterface.sequelize.QueryTypes.INSERT
          });
        }
      }

      // 6. 为教师工作台添加其他核心功能
      const otherTeacherFunctions = [
        { 
          name: '我的绩效', 
          chinese_name: '我的绩效', 
          path: '/teacher/performance/TeacherPerformance', 
          component: 'pages/teacher/performance/TeacherPerformance.vue',
          sort: 1 
        },
        { 
          name: '绩效排行榜', 
          chinese_name: '绩效排行榜', 
          path: '/teacher/performance/ranking', 
          component: 'pages/teacher/performance/ranking.vue',
          sort: 2 
        },
        { 
          name: '我的招生任务', 
          chinese_name: '我的招生任务', 
          path: '/teacher/enrollment/tasks', 
          component: 'pages/teacher/enrollment/tasks.vue',
          sort: 20 
        },
        { 
          name: '海报管理', 
          chinese_name: '海报管理', 
          path: '/teacher/posters', 
          component: 'pages/teacher/posters.vue',
          sort: 30 
        },
        { 
          name: '活动管理', 
          chinese_name: '活动管理', 
          path: '/activity/ActivityList', 
          component: 'pages/activity/ActivityList.vue',
          sort: 31 
        },
        { 
          name: '个人发展', 
          chinese_name: '个人发展', 
          path: '/teacher/development/TeacherDevelopment', 
          component: 'pages/teacher/development/TeacherDevelopment.vue',
          sort: 40 
        },
      ];

      for (const func of otherTeacherFunctions) {
        await queryInterface.sequelize.query(`
          INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at)
          VALUES (:name, :chinese_name, :code, 'menu', :parent_id, :path, :component, 'Document', :sort, 1, NOW(), NOW())
        `, {
          replacements: {
            name: func.name,
            chinese_name: func.chinese_name,
            code: func.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
            parent_id: teacherWorkspaceId,
            path: func.path,
            component: func.component,
            sort: func.sort
          },
          type: queryInterface.sequelize.QueryTypes.INSERT
        });
      }
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('回滚客户管理结构...');
    
    // 删除新创建的教师相关菜单
    await queryInterface.sequelize.query(
      'DELETE FROM permissions WHERE code IN ("teacher-workspace", "my-customer-center")',
      { type: queryInterface.sequelize.QueryTypes.DELETE }
    );
  }
};
