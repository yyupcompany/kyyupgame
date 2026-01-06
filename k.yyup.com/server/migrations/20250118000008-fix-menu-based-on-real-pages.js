'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 基于实际存在的前端页面来修正菜单结构

    // 1. 删除我之前创建的虚构菜单
    // 先获取要删除的父级ID
    const parentCenterIds = await queryInterface.sequelize.query(
      'SELECT id FROM permissions WHERE code IN ("parent-center", "teacher-workspace")',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // 删除子菜单
    if (parentCenterIds && parentCenterIds.length > 0) {
      for (const parent of parentCenterIds) {
        await queryInterface.sequelize.query(
          'DELETE FROM permissions WHERE parent_id = :parentId',
          {
            replacements: { parentId: parent.id },
            type: queryInterface.sequelize.QueryTypes.DELETE
          }
        );
      }
    }

    // 删除父级菜单
    await queryInterface.sequelize.query(
      'DELETE FROM permissions WHERE code IN ("parent-center", "teacher-workspace")',
      { type: queryInterface.sequelize.QueryTypes.DELETE }
    );

    // 2. 重新整理园长工作台下的实际功能
    // 基于实际存在的页面来创建菜单

    // 家长管理功能（基于实际存在的页面）
    const realParentPages = [
      { name: 'ParentList', chinese_name: '家长列表', path: '/parent/ParentList', component: 'pages/parent/ParentList.vue' },
      { name: 'ParentDetail', chinese_name: '家长详情', path: '/parent/ParentDetail', component: 'pages/parent/ParentDetail.vue' },
      { name: 'ParentEdit', chinese_name: '编辑家长', path: '/parent/ParentEdit', component: 'pages/parent/ParentEdit.vue' },
      { name: 'ChildrenList', chinese_name: '儿童列表', path: '/parent/ChildrenList', component: 'pages/parent/ChildrenList.vue' },
      { name: 'ChildGrowth', chinese_name: '儿童成长', path: '/parent/ChildGrowth', component: 'pages/parent/ChildGrowth.vue' },
      { name: 'AssignActivity', chinese_name: '分配活动', path: '/parent/AssignActivity', component: 'pages/parent/AssignActivity.vue' },
      { name: 'FollowUp', chinese_name: '跟进记录', path: '/parent/FollowUp', component: 'pages/parent/FollowUp.vue' },
      { name: 'SmartHub', chinese_name: '智能中心', path: '/parent/communication/SmartHub', component: 'pages/parent/communication/SmartHub.vue' },
      { name: 'ParentFeedback', chinese_name: '家长反馈', path: '/parent/feedback/ParentFeedback', component: 'pages/parent/feedback/ParentFeedback.vue' },
    ];

    // 获取家长管理的ID（应该在园长工作台下）
    const [parentManagement] = await queryInterface.sequelize.query(
      'SELECT id FROM permissions WHERE id = 1261', // 家长管理
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (parentManagement.length > 0) {
      const parentManagementId = parentManagement[0].id;
      
      // 为家长管理添加实际存在的子页面
      for (let i = 0; i < realParentPages.length; i++) {
        const page = realParentPages[i];
        await queryInterface.sequelize.query(`
          INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at)
          VALUES (:name, :chinese_name, :code, 'menu', :parent_id, :path, :component, 'Document', :sort, 1, NOW(), NOW())
        `, {
          replacements: {
            name: page.name,
            chinese_name: page.chinese_name,
            code: page.name.toLowerCase().replace(/([A-Z])/g, '-$1').substring(1),
            parent_id: parentManagementId,
            path: page.path,
            component: page.component,
            sort: i + 1
          },
          type: queryInterface.sequelize.QueryTypes.INSERT
        });
      }
    }

    // 教师管理功能（基于实际存在的页面）
    const realTeacherPages = [
      { name: 'TeacherList', chinese_name: '教师列表', path: '/teacher/TeacherList', component: 'pages/teacher/TeacherList.vue' },
      { name: 'TeacherDetail', chinese_name: '教师详情', path: '/teacher/TeacherDetail', component: 'pages/teacher/TeacherDetail.vue' },
      { name: 'TeacherEdit', chinese_name: '编辑教师', path: '/teacher/TeacherEdit', component: 'pages/teacher/TeacherEdit.vue' },
      { name: 'TeacherAdd', chinese_name: '添加教师', path: '/teacher/add', component: 'pages/teacher/add.vue' },
      { name: 'TeacherDevelopment', chinese_name: '教师发展', path: '/teacher/development/TeacherDevelopment', component: 'pages/teacher/development/TeacherDevelopment.vue' },
      { name: 'TeacherEvaluation', chinese_name: '教师评估', path: '/teacher/evaluation/TeacherEvaluation', component: 'pages/teacher/evaluation/TeacherEvaluation.vue' },
      { name: 'TeacherPerformance', chinese_name: '教师绩效', path: '/teacher/performance/TeacherPerformance', component: 'pages/teacher/performance/TeacherPerformance.vue' },
    ];

    // 获取教师管理的ID（应该在园长工作台下）
    const [teacherManagement] = await queryInterface.sequelize.query(
      'SELECT id FROM permissions WHERE id = 1260', // 教师管理
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (teacherManagement.length > 0) {
      const teacherManagementId = teacherManagement[0].id;
      
      // 为教师管理添加实际存在的子页面
      for (let i = 0; i < realTeacherPages.length; i++) {
        const page = realTeacherPages[i];
        await queryInterface.sequelize.query(`
          INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at)
          VALUES (:name, :chinese_name, :code, 'menu', :parent_id, :path, :component, 'Document', :sort, 1, NOW(), NOW())
        `, {
          replacements: {
            name: page.name,
            chinese_name: page.chinese_name,
            code: page.name.toLowerCase().replace(/([A-Z])/g, '-$1').substring(1),
            parent_id: teacherManagementId,
            path: page.path,
            component: page.component,
            sort: i + 1
          },
          type: queryInterface.sequelize.QueryTypes.INSERT
        });
      }
    }

    // 3. 确保其他模块也基于实际页面
    // 活动管理（基于实际存在的页面）
    const realActivityPages = [
      { name: 'ActivityCreate', chinese_name: '创建活动', path: '/activity/ActivityCreate', component: 'pages/activity/ActivityCreate.vue' },
      { name: 'ActivityList', chinese_name: '活动列表', path: '/activity/ActivityList', component: 'pages/activity/ActivityList.vue' },
      { name: 'ActivityDetail', chinese_name: '活动详情', path: '/activity/ActivityDetail', component: 'pages/activity/ActivityDetail.vue' },
      { name: 'ActivityEdit', chinese_name: '编辑活动', path: '/activity/ActivityEdit', component: 'pages/activity/ActivityEdit.vue' },
    ];

    // 清理活动管理的子菜单，重新添加
    await queryInterface.sequelize.query(
      'DELETE FROM permissions WHERE parent_id = 1258',
      { type: queryInterface.sequelize.QueryTypes.DELETE }
    );

    for (let i = 0; i < realActivityPages.length; i++) {
      const page = realActivityPages[i];
      await queryInterface.sequelize.query(`
        INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at)
        VALUES (:name, :chinese_name, :code, 'menu', 1258, :path, :component, 'Document', :sort, 1, NOW(), NOW())
      `, {
        replacements: {
          name: page.name,
          chinese_name: page.chinese_name,
          code: page.name.toLowerCase().replace(/([A-Z])/g, '-$1').substring(1),
          path: page.path,
          component: page.component,
          sort: i + 1
        },
        type: queryInterface.sequelize.QueryTypes.INSERT
      });
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('回滚基于真实页面的菜单修正...');
  }
};
