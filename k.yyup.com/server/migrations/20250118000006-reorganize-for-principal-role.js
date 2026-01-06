'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 重新组织权限结构，以园长为核心业务负责人

    // 1. 将所有主要业务功能移到园长功能下
    // 首先更新园长功能为主要的业务管理中心
    await queryInterface.sequelize.query(
      'UPDATE permissions SET chinese_name = "业务管理", sort = 5, path = "/principal", component = "Layout" WHERE id = 1202',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 2. 将学生管理作为园长功能的子模块
    await queryInterface.sequelize.query(
      'UPDATE permissions SET parent_id = 1202, sort = 10, chinese_name = "学生管理" WHERE id = 1259',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 3. 将教师管理作为园长功能的子模块
    await queryInterface.sequelize.query(
      'UPDATE permissions SET parent_id = 1202, sort = 20, chinese_name = "教师管理" WHERE id = 1260',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 4. 将家长管理作为园长功能的子模块
    await queryInterface.sequelize.query(
      'UPDATE permissions SET parent_id = 1202, sort = 30, chinese_name = "家长管理" WHERE id = 1261',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 5. 将班级管理作为园长功能的子模块
    await queryInterface.sequelize.query(
      'UPDATE permissions SET parent_id = 1202, sort = 40, chinese_name = "班级管理" WHERE id = 1262',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 6. 将招生管理作为园长功能的子模块
    await queryInterface.sequelize.query(
      'UPDATE permissions SET parent_id = 1202, sort = 50, chinese_name = "招生管理" WHERE id = 1257',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 7. 将活动管理作为园长功能的子模块
    await queryInterface.sequelize.query(
      'UPDATE permissions SET parent_id = 1202, sort = 60, chinese_name = "活动管理" WHERE id = 1258',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 8. 将营销管理作为园长功能的子模块
    await queryInterface.sequelize.query(
      'UPDATE permissions SET parent_id = 1202, sort = 70, chinese_name = "营销管理" WHERE id = 1187',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 9. 重新整理园长专属功能
    const principalSpecificMenus = [
      { id: 1205, parent_id: 1202, sort: 1, chinese_name: '园长仪表板' }, // Dashboard
      { id: 1207, parent_id: 1202, sort: 2, chinese_name: '绩效管理' }, // Performance
      { id: 1208, parent_id: 1202, sort: 3, chinese_name: '绩效规则' }, // PerformanceRules
      { id: 1206, parent_id: 1202, sort: 4, chinese_name: '营销分析' }, // MarketingAnalysis
      { id: 1204, parent_id: 1202, sort: 5, chinese_name: '客户池管理' }, // CustomerPool
      { id: 1203, parent_id: 1202, sort: 6, chinese_name: '园长活动' }, // Activities
      { id: 1212, parent_id: 1202, sort: 7, chinese_name: '智能决策' }, // Intelligent-dashboard
    ];

    for (const menu of principalSpecificMenus) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET parent_id = :parent_id, sort = :sort, chinese_name = :chinese_name WHERE id = :id',
        {
          replacements: menu,
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // 10. 将系统管理标记为Admin专用（添加特殊标记）
    await queryInterface.sequelize.query(
      'UPDATE permissions SET chinese_name = "系统管理(Admin)", sort = 999 WHERE id = 1255',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 11. 创建一个新的仪表板作为园长的主入口
    await queryInterface.sequelize.query(
      'UPDATE permissions SET chinese_name = "园长仪表板", sort = 1 WHERE id = 1254',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 12. 添加一些其他分类的标记，表明它们是技术性的
    const adminOnlyCategories = [
      { id: 1113, chinese_name: 'AI助手(调试)' }, // AI助手
      { id: 1223, chinese_name: '系统管理(调试)' }, // 系统管理分类
      { id: 1150, chinese_name: '仪表板(调试)' }, // 仪表板分类
      { id: 1165, chinese_name: '招生管理(调试)' }, // 招生管理分类
      { id: 1133, chinese_name: '班级管理(调试)' }, // 班级管理分类
      { id: 1189, chinese_name: '家长管理(调试)' }, // 家长管理分类
    ];

    for (const category of adminOnlyCategories) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET chinese_name = :chinese_name WHERE id = :id',
        {
          replacements: category,
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // 13. 为园长角色创建一个专门的权限组
    // 这里可以根据需要添加角色权限的分配逻辑
  },

  async down(queryInterface, Sequelize) {
    // 回滚操作：将业务功能重新设为一级菜单
    const businessModules = [1259, 1260, 1261, 1262, 1257, 1258, 1187];
    
    for (const moduleId of businessModules) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET parent_id = NULL WHERE id = :id',
        {
          replacements: { id: moduleId },
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }
    
    console.log('回滚园长角色权限组织...');
  }
};
