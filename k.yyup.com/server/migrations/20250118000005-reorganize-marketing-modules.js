'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 重新组织营销相关的功能模块

    // 1. 首先创建一个主要的营销管理菜单（如果不存在的话，更新现有的）
    await queryInterface.sequelize.query(
      'UPDATE permissions SET chinese_name = "营销管理", sort = 25 WHERE id = 1187',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 2. 将广告管理作为营销管理的子菜单
    await queryInterface.sequelize.query(
      'UPDATE permissions SET parent_id = 1187, sort = 1, chinese_name = "广告管理" WHERE id = 1111',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 将Advertisement作为广告管理的子项
    await queryInterface.sequelize.query(
      'UPDATE permissions SET parent_id = 1111, sort = 1, chinese_name = "广告投放" WHERE id = 1112',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 3. 创建海报管理作为营销管理的子菜单
    // 首先创建海报管理分类
    await queryInterface.sequelize.query(`
      INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at)
      VALUES ('海报管理', '海报管理', 'poster-management', 'category', 1187, '#poster', NULL, 'Picture', 2, 1, NOW(), NOW())
    `, { type: queryInterface.sequelize.QueryTypes.INSERT });

    // 获取刚创建的海报管理ID
    const [posterCategory] = await queryInterface.sequelize.query(
      'SELECT id FROM permissions WHERE code = "poster-management" ORDER BY id DESC LIMIT 1',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const posterCategoryId = posterCategory.id;

    // 将海报相关功能移到海报管理下
    const posterMenus = [
      { id: 1209, parent_id: posterCategoryId, sort: 1, chinese_name: '海报编辑器' }, // PosterEditor
      { id: 1210, parent_id: posterCategoryId, sort: 2, chinese_name: '海报生成器' }, // PosterGenerator
      { id: 1211, parent_id: posterCategoryId, sort: 3, chinese_name: '海报模板' }, // PosterTemplates
    ];

    for (const menu of posterMenus) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET parent_id = :parent_id, sort = :sort, chinese_name = :chinese_name WHERE id = :id',
        {
          replacements: menu,
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // 4. 将客户管理作为营销管理的子菜单
    await queryInterface.sequelize.query(
      'UPDATE permissions SET parent_id = 1187, sort = 3, chinese_name = "客户管理" WHERE id = 1145',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 整理客户管理的子菜单
    const customerMenus = [
      { id: 1148, parent_id: 1145, sort: 1, chinese_name: '客户概览' }, // Customer
      { id: 1147, parent_id: 1145, sort: 2, chinese_name: '客户详情' }, // CustomerDetail
      { id: 1146, parent_id: 1145, sort: 3, chinese_name: '客户分析' }, // CustomerAnalytics
      { id: 1149, parent_id: 1145, sort: 4, chinese_name: '智能管理' }, // Intelligent-management
    ];

    for (const menu of customerMenus) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET parent_id = :parent_id, sort = :sort, chinese_name = :chinese_name WHERE id = :id',
        {
          replacements: menu,
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // 5. 将数据分析作为营销管理的子菜单
    await queryInterface.sequelize.query(
      'UPDATE permissions SET parent_id = 1187, sort = 4, chinese_name = "数据分析" WHERE id = 1123',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 整理数据分析的子菜单
    const analyticsMenus = [
      { id: 1125, parent_id: 1123, sort: 1, chinese_name: '数据概览' }, // Analytics
      { id: 1124, parent_id: 1123, sort: 2, chinese_name: '报表构建' }, // ReportBuilder
    ];

    for (const menu of analyticsMenus) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET parent_id = :parent_id, sort = :sort, chinese_name = :chinese_name WHERE id = :id',
        {
          replacements: menu,
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // 6. 重新组织园长功能
    await queryInterface.sequelize.query(
      'UPDATE permissions SET chinese_name = "园长功能", sort = 35 WHERE id = 1202',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 整理园长功能的子菜单
    const principalMenus = [
      { id: 1205, parent_id: 1202, sort: 1, chinese_name: '园长仪表板' }, // Dashboard
      { id: 1207, parent_id: 1202, sort: 2, chinese_name: '绩效管理' }, // Performance
      { id: 1208, parent_id: 1202, sort: 3, chinese_name: '绩效规则' }, // PerformanceRules
      { id: 1206, parent_id: 1202, sort: 4, chinese_name: '营销分析' }, // MarketingAnalysis
      { id: 1204, parent_id: 1202, sort: 5, chinese_name: '客户池管理' }, // CustomerPool
      { id: 1203, parent_id: 1202, sort: 6, chinese_name: '活动管理' }, // Activities
      { id: 1212, parent_id: 1202, sort: 7, chinese_name: '智能决策' }, // Intelligent-dashboard
    ];

    for (const menu of principalMenus) {
      await queryInterface.sequelize.query(
        'UPDATE permissions SET parent_id = :parent_id, sort = :sort, chinese_name = :chinese_name WHERE id = :id',
        {
          replacements: menu,
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // 7. 添加智能引擎作为营销管理的直接子菜单
    await queryInterface.sequelize.query(
      'UPDATE permissions SET parent_id = 1187, sort = 5, chinese_name = "智能引擎" WHERE id = 1188',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );

    // 8. 创建营销活动管理作为营销管理的子菜单
    await queryInterface.sequelize.query(`
      INSERT INTO permissions (name, chinese_name, code, type, parent_id, path, component, icon, sort, status, created_at, updated_at)
      VALUES ('营销活动', '营销活动', 'marketing-activities', 'category', 1187, '#marketing-activities', NULL, 'Calendar', 6, 1, NOW(), NOW())
    `, { type: queryInterface.sequelize.QueryTypes.INSERT });

    // 获取营销活动ID
    const [marketingActivity] = await queryInterface.sequelize.query(
      'SELECT id FROM permissions WHERE code = "marketing-activities" ORDER BY id DESC LIMIT 1',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const marketingActivityId = marketingActivity.id;

    // 将一些活动相关的功能移到营销活动下（如果需要的话）
    // 这里可以根据实际需要添加

    // 9. 更新营销管理主菜单的路径和组件
    await queryInterface.sequelize.query(
      'UPDATE permissions SET path = "/marketing", component = "Layout", type = "menu" WHERE id = 1187',
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );
  },

  async down(queryInterface, Sequelize) {
    // 回滚操作
    console.log('回滚营销模块组织...');
    
    // 删除新创建的分类
    await queryInterface.sequelize.query(
      'DELETE FROM permissions WHERE code IN ("poster-management", "marketing-activities")',
      { type: queryInterface.sequelize.QueryTypes.DELETE }
    );
  }
};
