'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 重新组织菜单层级结构，让路径更加直观

    // 1. 活动管理重组
    // 删除重复的活动管理项，保留主要的
    await queryInterface.sequelize.query(
      'DELETE FROM permissions WHERE id = 1107', // 删除重复的 /activity
      { type: queryInterface.sequelize.QueryTypes.DELETE }
    );

    // 更新活动相关页面的层级关系
    const activityUpdates = [
      // 主活动管理页面
      { id: 1258, parent_id: null, sort: 30 }, // 活动管理作为主菜单
      
      // 活动基础功能作为一级子菜单
      { id: 1098, parent_id: 1258, sort: 1, chinese_name: '创建活动' }, // ActivityCreate
      { id: 1102, parent_id: 1258, sort: 2, chinese_name: '活动列表' }, // ActivityList
      { id: 1099, parent_id: 1258, sort: 3, chinese_name: '活动详情' }, // ActivityDetail
      { id: 1100, parent_id: 1258, sort: 4, chinese_name: '编辑活动' }, // ActivityEdit
      
      // 活动分析作为二级子菜单
      { id: 1103, parent_id: 1099, sort: 1, chinese_name: '活动分析' }, // ActivityAnalytics
      { id: 1104, parent_id: 1099, sort: 2, chinese_name: '智能分析' }, // Intelligent-analysis
      
      // 活动详情页面
      { id: 1105, parent_id: 1099, sort: 3, chinese_name: '详情页面' }, // _id
      
      // 活动评估和优化
      { id: 1106, parent_id: 1258, sort: 5, chinese_name: '活动评估' }, // ActivityEvaluation
      { id: 1108, parent_id: 1258, sort: 6, chinese_name: '活动优化' }, // ActivityOptimizer
      { id: 1109, parent_id: 1258, sort: 7, chinese_name: '活动规划' }, // ActivityPlanner
      { id: 1110, parent_id: 1258, sort: 8, chinese_name: '报名管理' }, // RegistrationDashboard
    ];

    for (const update of activityUpdates) {
      let sql = 'UPDATE permissions SET parent_id = :parent_id, sort = :sort';
      if (update.chinese_name) {
        sql += ', chinese_name = :chinese_name';
      }
      sql += ' WHERE id = :id';
      
      await queryInterface.sequelize.query(sql, {
        replacements: update,
        type: queryInterface.sequelize.QueryTypes.UPDATE
      });
    }

    // 2. 学生管理重组
    const studentUpdates = [
      // 学生基础功能
      { id: 1222, parent_id: 1259, sort: 1, chinese_name: '学生概览' }, // Student主页
      { id: 1219, parent_id: 1259, sort: 2, chinese_name: '学生详情' }, // StudentDetail
      { id: 1220, parent_id: 1219, sort: 1, chinese_name: '详情页面' }, // :id详情页
      
      // 学生分析
      { id: 1216, parent_id: 1259, sort: 3, chinese_name: '学生分析' }, // StudentAnalytics
      { id: 1217, parent_id: 1216, sort: 1, chinese_name: '分析详情' }, // analytics/:id
      
      // 学生评估和成长
      { id: 1218, parent_id: 1259, sort: 4, chinese_name: '学生评估' }, // StudentAssessment
      { id: 1221, parent_id: 1259, sort: 5, chinese_name: '学生成长' }, // StudentGrowth
    ];

    for (const update of studentUpdates) {
      let sql = 'UPDATE permissions SET parent_id = :parent_id, sort = :sort';
      if (update.chinese_name) {
        sql += ', chinese_name = :chinese_name';
      }
      sql += ' WHERE id = :id';
      
      await queryInterface.sequelize.query(sql, {
        replacements: update,
        type: queryInterface.sequelize.QueryTypes.UPDATE
      });
    }

    // 3. 教师管理重组
    const teacherUpdates = [
      // 教师基础功能
      { id: 1251, parent_id: 1260, sort: 1, chinese_name: '教师概览' }, // Teacher主页
      { id: 1247, parent_id: 1260, sort: 2, chinese_name: '教师列表' }, // TeacherList
      { id: 1245, parent_id: 1260, sort: 3, chinese_name: '教师详情' }, // TeacherDetail
      { id: 1246, parent_id: 1260, sort: 4, chinese_name: '编辑教师' }, // TeacherEdit
      { id: 1248, parent_id: 1260, sort: 5, chinese_name: '添加教师' }, // Add
      
      // 教师发展和评估
      { id: 1249, parent_id: 1260, sort: 6, chinese_name: '教师发展' }, // TeacherDevelopment
      { id: 1250, parent_id: 1260, sort: 7, chinese_name: '教师评估' }, // TeacherEvaluation
      { id: 1252, parent_id: 1260, sort: 8, chinese_name: '教师绩效' }, // TeacherPerformance
      { id: 1253, parent_id: 1252, sort: 1, chinese_name: '绩效详情' }, // performance/:id
    ];

    for (const update of teacherUpdates) {
      let sql = 'UPDATE permissions SET parent_id = :parent_id, sort = :sort';
      if (update.chinese_name) {
        sql += ', chinese_name = :chinese_name';
      }
      sql += ' WHERE id = :id';
      
      await queryInterface.sequelize.query(sql, {
        replacements: update,
        type: queryInterface.sequelize.QueryTypes.UPDATE
      });
    }

    // 4. 删除空的分类，因为现在内容都重新组织了
    await queryInterface.sequelize.query(
      'DELETE FROM permissions WHERE id IN (1097, 1215, 1244)', // 删除旧的分类
      { type: queryInterface.sequelize.QueryTypes.DELETE }
    );

    // 5. 更新一些其他页面的中文名称
    const otherUpdates = [
      { id: 1105, chinese_name: '活动详情页' },
      { id: 1217, chinese_name: '学生分析详情' },
      { id: 1220, chinese_name: '学生详情页' },
      { id: 1253, chinese_name: '教师绩效详情' },
    ];

    for (const update of otherUpdates) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET chinese_name = :chinese_name WHERE id = :id',
        {
          replacements: update,
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // 回滚操作：恢复原来的层级结构
    // 这里可以根据需要实现回滚逻辑
    console.log('回滚菜单层级结构...');
  }
};
