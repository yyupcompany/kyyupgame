'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 按照角色重新组织权限结构：园长、教师、家长、管理员

    // 1. 清理现有结构，重新开始
    await queryInterface.sequelize.query(
      'UPDATE permissions SET parent_id = NULL WHERE parent_id IS NOT NULL',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 2. 创建四个主要角色模块
    
    // === 园长模块 (Principal) - 业务核心管理 ===
    await queryInterface.sequelize.query(
      'UPDATE permissions SET chinese_name = "园长工作台", sort = 10, path = "/principal", component = "Layout", icon = "Crown" WHERE id = 1202',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 园长的主要功能模块
    const principalModules = [
      // 园长专属功能
      { id: 1205, parent_id: 1202, sort: 1, chinese_name: '园长仪表板', path: '/principal/dashboard' },
      { id: 1207, parent_id: 1202, sort: 2, chinese_name: '绩效管理', path: '/principal/performance' },
      { id: 1208, parent_id: 1202, sort: 3, chinese_name: '绩效规则', path: '/principal/performance-rules' },
      
      // 业务管理
      { id: 1259, parent_id: 1202, sort: 10, chinese_name: '学生管理', path: '/principal/students' },
      { id: 1260, parent_id: 1202, sort: 20, chinese_name: '教师管理', path: '/principal/teachers' },
      { id: 1261, parent_id: 1202, sort: 30, chinese_name: '家长管理', path: '/principal/parents' },
      { id: 1262, parent_id: 1202, sort: 40, chinese_name: '班级管理', path: '/principal/classes' },
      
      // 招生和营销
      { id: 1257, parent_id: 1202, sort: 50, chinese_name: '招生管理', path: '/principal/enrollment' },
      { id: 1258, parent_id: 1202, sort: 60, chinese_name: '活动管理', path: '/principal/activities' },
      { id: 1187, parent_id: 1202, sort: 70, chinese_name: '营销管理', path: '/principal/marketing' },
      
      // 决策支持
      { id: 1206, parent_id: 1202, sort: 80, chinese_name: '营销分析', path: '/principal/marketing-analysis' },
      { id: 1204, parent_id: 1202, sort: 90, chinese_name: '客户池管理', path: '/principal/customer-pool' },
      { id: 1212, parent_id: 1202, sort: 100, chinese_name: '智能决策', path: '/principal/intelligent-dashboard' },
    ];

    for (const module of principalModules) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET parent_id = :parent_id, sort = :sort, chinese_name = :chinese_name, path = :path WHERE id = :id',
        {
          replacements: module,
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // 3. 创建教师模块
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

    // 教师专属功能
    const teacherModules = [
      { name: '我的班级', chinese_name: '我的班级', code: 'my-classes', path: '/teacher/my-classes', sort: 1 },
      { name: '学生管理', chinese_name: '我的学生', code: 'my-students', path: '/teacher/my-students', sort: 2 },
      { name: '课程管理', chinese_name: '课程管理', code: 'course-management', path: '/teacher/courses', sort: 3 },
      { name: '作业管理', chinese_name: '作业管理', code: 'homework-management', path: '/teacher/homework', sort: 4 },
      { name: '成绩管理', chinese_name: '成绩管理', code: 'grade-management', path: '/teacher/grades', sort: 5 },
      { name: '家长沟通', chinese_name: '家长沟通', code: 'parent-communication', path: '/teacher/parent-communication', sort: 6 },
      { name: '教学资源', chinese_name: '教学资源', code: 'teaching-resources', path: '/teacher/resources', sort: 7 },
      { name: '个人发展', chinese_name: '个人发展', code: 'personal-development', path: '/teacher/development', sort: 8 },
    ];

    for (const module of teacherModules) {
      await queryInterface.sequelize.query(`
        INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at)
        VALUES (:name, :chinese_name, :code, 'menu', ${teacherWorkspaceId}, :path, 'pages/teacher/' || :code || '.vue', 'Document', :sort, 1, NOW(), NOW())
      `, {
        replacements: module,
        type: queryInterface.sequelize.QueryTypes.INSERT
      });
    }

    // 4. 创建家长模块
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

    // 家长专属功能
    const parentModules = [
      { name: '孩子概况', chinese_name: '孩子概况', code: 'child-overview', path: '/parent/child-overview', sort: 1 },
      { name: '学习进度', chinese_name: '学习进度', code: 'learning-progress', path: '/parent/learning-progress', sort: 2 },
      { name: '成绩查看', chinese_name: '成绩查看', code: 'grade-view', path: '/parent/grades', sort: 3 },
      { name: '作业查看', chinese_name: '作业查看', code: 'homework-view', path: '/parent/homework', sort: 4 },
      { name: '老师沟通', chinese_name: '老师沟通', code: 'teacher-communication', path: '/parent/teacher-communication', sort: 5 },
      { name: '活动报名', chinese_name: '活动报名', code: 'activity-registration', path: '/parent/activity-registration', sort: 6 },
      { name: '缴费记录', chinese_name: '缴费记录', code: 'payment-records', path: '/parent/payments', sort: 7 },
      { name: '成长档案', chinese_name: '成长档案', code: 'growth-records', path: '/parent/growth-records', sort: 8 },
      { name: '家长反馈', chinese_name: '意见反馈', code: 'parent-feedback', path: '/parent/feedback', sort: 9 },
    ];

    for (const module of parentModules) {
      await queryInterface.sequelize.query(`
        INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at)
        VALUES (:name, :chinese_name, :code, 'menu', ${parentCenterId}, :path, 'pages/parent/' || :code || '.vue', 'Document', :sort, 1, NOW(), NOW())
      `, {
        replacements: module,
        type: queryInterface.sequelize.QueryTypes.INSERT
      });
    }

    // 5. 管理员模块 (Admin Only - 技术配置)
    await queryInterface.sequelize.query(
      'UPDATE permissions SET chinese_name = "系统管理(Admin)", sort = 999, path = "/admin", component = "Layout" WHERE id = 1255',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 管理员专属功能保持不变，但标记为Admin专用
    const adminModules = [
      { id: 1265, parent_id: 1255, sort: 1, chinese_name: '用户账户管理' },
      { id: 1266, parent_id: 1255, sort: 2, chinese_name: '角色权限管理' },
      { id: 1267, parent_id: 1255, sort: 3, chinese_name: '权限配置' },
      { id: 1225, parent_id: 1255, sort: 4, chinese_name: '系统备份' },
      { id: 1228, parent_id: 1255, sort: 5, chinese_name: '系统日志' },
      { id: 1232, parent_id: 1255, sort: 6, chinese_name: '安全设置' },
    ];

    for (const module of adminModules) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET parent_id = :parent_id, sort = :sort, chinese_name = :chinese_name WHERE id = :id',
        {
          replacements: module,
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // 6. 将其他调试用的分类标记为隐藏或删除
    const debugCategories = [1113, 1223, 1150, 1165, 1133, 1189, 1085];
    for (const categoryId of debugCategories) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET status = 0 WHERE id = :id', // 设为不可用状态
        {
          replacements: { id: categoryId },
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // 7. 保留一个通用的仪表板入口
    await queryInterface.sequelize.query(
      'UPDATE permissions SET chinese_name = "首页", sort = 1, path = "/dashboard", parent_id = NULL WHERE id = 1254',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );
  },

  async down(queryInterface, Sequelize) {
    // 回滚操作
    console.log('回滚基于角色的权限结构...');
    
    // 删除新创建的角色模块
    await queryInterface.sequelize.query(
      'DELETE FROM permissions WHERE code IN ("teacher-workspace", "parent-center")',
      { type: queryInterface.sequelize.QueryTypes.DELETE }
    );
    
    // 恢复调试分类的状态
    const debugCategories = [1113, 1223, 1150, 1165, 1133, 1189, 1085];
    for (const categoryId of debugCategories) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET status = 1 WHERE id = :id',
        {
          replacements: { id: categoryId },
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }
  }
};
