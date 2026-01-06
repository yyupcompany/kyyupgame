'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 重新组织菜单结构，确保主要功能模块有丰富的二级菜单

    // 1. 将学生管理、教师管理、家长管理、班级管理提升为一级菜单
    await queryInterface.sequelize.query(
      'UPDATE permissions SET parent_id = NULL, sort = 15 WHERE id = 1259', // 学生管理
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );
    
    await queryInterface.sequelize.query(
      'UPDATE permissions SET parent_id = NULL, sort = 16 WHERE id = 1260', // 教师管理
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );
    
    await queryInterface.sequelize.query(
      'UPDATE permissions SET parent_id = NULL, sort = 17 WHERE id = 1261', // 家长管理
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );
    
    await queryInterface.sequelize.query(
      'UPDATE permissions SET parent_id = NULL, sort = 18 WHERE id = 1262', // 班级管理
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 2. 为招生管理添加更多二级菜单
    const enrollmentMenus = [
      // 从现有的招生相关页面中选择合适的作为二级菜单
      { id: 1166, parent_id: 1257, sort: 3, chinese_name: '自动跟进' }, // Automated-follow-up
      { id: 1167, parent_id: 1257, sort: 4, chinese_name: '漏斗分析' }, // Funnel-analytics
      { id: 1169, parent_id: 1257, sort: 5, chinese_name: '个性化策略' }, // Personalized-strategy
      { id: 1170, parent_id: 1257, sort: 6, chinese_name: '计划详情' }, // PlanDetail
      { id: 1173, parent_id: 1257, sort: 7, chinese_name: '计划列表' }, // PlanList
      { id: 1176, parent_id: 1257, sort: 8, chinese_name: '统计报表' }, // Statistics
      { id: 1177, parent_id: 1257, sort: 9, chinese_name: 'AI预测' }, // Ai-forecasting
      { id: 1178, parent_id: 1257, sort: 10, chinese_name: '招生分析' }, // Enrollment-analytics
    ];

    for (const menu of enrollmentMenus) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET parent_id = :parent_id, sort = :sort, chinese_name = :chinese_name WHERE id = :id',
        {
          replacements: menu,
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // 3. 为学生管理添加二级菜单（从现有的学生相关页面中选择）
    const studentMenus = [
      { id: 1222, parent_id: 1259, sort: 1, chinese_name: '学生概览' }, // Student主页
      { id: 1219, parent_id: 1259, sort: 2, chinese_name: '学生详情' }, // StudentDetail
      { id: 1216, parent_id: 1259, sort: 3, chinese_name: '学生分析' }, // StudentAnalytics
      { id: 1218, parent_id: 1259, sort: 4, chinese_name: '学生评估' }, // StudentAssessment
      { id: 1221, parent_id: 1259, sort: 5, chinese_name: '学生成长' }, // StudentGrowth
    ];

    for (const menu of studentMenus) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET parent_id = :parent_id, sort = :sort, chinese_name = :chinese_name WHERE id = :id',
        {
          replacements: menu,
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // 4. 为教师管理添加二级菜单
    const teacherMenus = [
      { id: 1251, parent_id: 1260, sort: 1, chinese_name: '教师概览' }, // Teacher主页
      { id: 1247, parent_id: 1260, sort: 2, chinese_name: '教师列表' }, // TeacherList
      { id: 1245, parent_id: 1260, sort: 3, chinese_name: '教师详情' }, // TeacherDetail
      { id: 1246, parent_id: 1260, sort: 4, chinese_name: '编辑教师' }, // TeacherEdit
      { id: 1248, parent_id: 1260, sort: 5, chinese_name: '添加教师' }, // Add
      { id: 1249, parent_id: 1260, sort: 6, chinese_name: '教师发展' }, // TeacherDevelopment
      { id: 1250, parent_id: 1260, sort: 7, chinese_name: '教师评估' }, // TeacherEvaluation
      { id: 1252, parent_id: 1260, sort: 8, chinese_name: '教师绩效' }, // TeacherPerformance
    ];

    for (const menu of teacherMenus) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET parent_id = :parent_id, sort = :sort, chinese_name = :chinese_name WHERE id = :id',
        {
          replacements: menu,
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // 5. 为家长管理添加二级菜单
    const parentMenus = [
      { id: 1201, parent_id: 1261, sort: 1, chinese_name: '家长概览' }, // Parent主页
      { id: 1196, parent_id: 1261, sort: 2, chinese_name: '家长列表' }, // ParentList
      { id: 1194, parent_id: 1261, sort: 3, chinese_name: '家长详情' }, // ParentDetail
      { id: 1195, parent_id: 1261, sort: 4, chinese_name: '编辑家长' }, // ParentEdit
      { id: 1192, parent_id: 1261, sort: 5, chinese_name: '儿童列表' }, // ChildrenList
      { id: 1191, parent_id: 1261, sort: 6, chinese_name: '儿童成长' }, // ChildGrowth
      { id: 1193, parent_id: 1261, sort: 7, chinese_name: '跟进记录' }, // FollowUp
      { id: 1200, parent_id: 1261, sort: 8, chinese_name: '家长反馈' }, // ParentFeedback
    ];

    for (const menu of parentMenus) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET parent_id = :parent_id, sort = :sort, chinese_name = :chinese_name WHERE id = :id',
        {
          replacements: menu,
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // 6. 为班级管理添加二级菜单
    const classMenus = [
      { id: 1139, parent_id: 1262, sort: 1, chinese_name: '班级概览' }, // Class主页
      { id: 1137, parent_id: 1262, sort: 2, chinese_name: '班级详情' }, // ClassDetail
      { id: 1134, parent_id: 1262, sort: 3, chinese_name: '班级分析' }, // ClassAnalytics
      { id: 1140, parent_id: 1262, sort: 4, chinese_name: '班级优化' }, // ClassOptimization
      { id: 1141, parent_id: 1262, sort: 5, chinese_name: '智能管理' }, // SmartManagement
    ];

    for (const menu of classMenus) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET parent_id = :parent_id, sort = :sort, chinese_name = :chinese_name WHERE id = :id',
        {
          replacements: menu,
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // 7. 删除现在空的用户管理分类
    await queryInterface.sequelize.query(
      'DELETE FROM permissions WHERE id = 1256', // 删除用户管理分类
      { type: queryInterface.sequelize.QueryTypes.DELETE }
    );

    // 8. 为活动管理确保有完整的二级菜单（之前已经设置过，这里确认一下）
    const activityMenus = [
      { id: 1098, parent_id: 1258, sort: 1, chinese_name: '创建活动' },
      { id: 1102, parent_id: 1258, sort: 2, chinese_name: '活动列表' },
      { id: 1099, parent_id: 1258, sort: 3, chinese_name: '活动详情' },
      { id: 1100, parent_id: 1258, sort: 4, chinese_name: '编辑活动' },
      { id: 1103, parent_id: 1258, sort: 5, chinese_name: '活动分析' },
      { id: 1106, parent_id: 1258, sort: 6, chinese_name: '活动评估' },
      { id: 1108, parent_id: 1258, sort: 7, chinese_name: '活动优化' },
      { id: 1109, parent_id: 1258, sort: 8, chinese_name: '活动规划' },
    ];

    for (const menu of activityMenus) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET parent_id = :parent_id, sort = :sort, chinese_name = :chinese_name WHERE id = :id',
        {
          replacements: menu,
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // 9. 为系统管理添加更多二级菜单
    const systemMenus = [
      { id: 1233, parent_id: 1255, sort: 4, chinese_name: '用户管理' }, // User
      { id: 1231, parent_id: 1255, sort: 5, chinese_name: '角色管理' }, // Role
      { id: 1230, parent_id: 1255, sort: 6, chinese_name: '权限管理' }, // Permission
      { id: 1225, parent_id: 1255, sort: 7, chinese_name: '系统备份' }, // Backup
      { id: 1228, parent_id: 1255, sort: 8, chinese_name: '系统日志' }, // Log
      { id: 1232, parent_id: 1255, sort: 9, chinese_name: '安全设置' }, // Security
    ];

    for (const menu of systemMenus) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET parent_id = :parent_id, sort = :sort, chinese_name = :chinese_name WHERE id = :id',
        {
          replacements: menu,
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // 回滚操作
    console.log('回滚菜单结构...');
  }
};
