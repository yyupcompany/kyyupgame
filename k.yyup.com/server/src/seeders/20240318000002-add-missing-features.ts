import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // 添加缺失的招生管理和海报管理功能
    
    // 1. 获取现有的招生管理主菜单ID
    const [enrollmentMenuResult] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE code = 'enrollment' AND type = 'menu'`
    );
    const enrollmentMenuId = enrollmentMenuResult.length > 0 ? (enrollmentMenuResult[0] as any).id : null;
    
    // 2. 获取现有的系统管理主菜单ID
    const [systemMenuResult] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE code = 'system' AND type = 'menu'`
    );
    const systemMenuId = systemMenuResult.length > 0 ? (systemMenuResult[0] as any).id : null;
    
    // 3. 添加招生管理的缺失功能
    const enrollmentSubFeatures = [];
    
    if (enrollmentMenuId) {
      // 招生仿真模拟
      enrollmentSubFeatures.push({
        name: '招生仿真模拟',
        code: 'enrollment:simulation',
        type: 'menu',
        parent_id: enrollmentMenuId,
        path: 'simulation/enrollment-simulation',
        component: 'pages/enrollment-plan/simulation/enrollment-simulation.vue',
        permission: null,
        icon: 'Monitor',
        sort: 3,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      // 招生预测分析
      enrollmentSubFeatures.push({
        name: '招生预测分析',
        code: 'enrollment:forecast',
        type: 'menu',
        parent_id: enrollmentMenuId,
        path: 'forecast/enrollment-forecast',
        component: 'pages/enrollment-plan/forecast/enrollment-forecast.vue',
        permission: null,
        icon: 'TrendCharts',
        sort: 4,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      // 招生策略管理
      enrollmentSubFeatures.push({
        name: '招生策略管理',
        code: 'enrollment:strategy',
        type: 'menu',
        parent_id: enrollmentMenuId,
        path: 'strategy/enrollment-strategy',
        component: 'pages/enrollment-plan/strategy/enrollment-strategy.vue',
        permission: null,
        icon: 'Operation',
        sort: 5,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      // 招生数据分析
      enrollmentSubFeatures.push({
        name: '招生数据分析',
        code: 'enrollment:analytics',
        type: 'menu',
        parent_id: enrollmentMenuId,
        path: 'analytics/enrollment-analytics',
        component: 'pages/enrollment-plan/analytics/enrollment-analytics.vue',
        permission: null,
        icon: 'DataAnalysis',
        sort: 6,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      // 报名详情管理
      enrollmentSubFeatures.push({
        name: '报名详情管理',
        code: 'enrollment:application-detail',
        type: 'menu',
        parent_id: enrollmentMenuId,
        path: 'application-detail',
        component: 'pages/application/ApplicationDetail.vue',
        permission: null,
        icon: 'Document',
        sort: 7,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      // 报名审核管理
      enrollmentSubFeatures.push({
        name: '报名审核管理',
        code: 'enrollment:application-review',
        type: 'menu',
        parent_id: enrollmentMenuId,
        path: 'application-review',
        component: 'pages/application/review/ApplicationReview.vue',
        permission: null,
        icon: 'Select',
        sort: 8,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      // 面试管理
      enrollmentSubFeatures.push({
        name: '面试管理',
        code: 'enrollment:interview',
        type: 'menu',
        parent_id: enrollmentMenuId,
        path: 'interview',
        component: 'pages/application/interview/ApplicationInterview.vue',
        permission: null,
        icon: 'User',
        sort: 9,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    // 4. 检查并添加海报管理主菜单
    const [posterMenuExist] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE code = 'poster' AND type = 'menu'`
    );
    
    let posterMenuId = null;
    if (posterMenuExist.length === 0) {
      const posterMainMenu = [{
        name: '海报管理',
        code: 'poster',
        type: 'menu',
        parent_id: null,
        path: '/poster',
        component: 'Layout',
        permission: null,
        icon: 'Picture',
        sort: 50,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }];
      
      await queryInterface.bulkInsert('permissions', posterMainMenu);
      console.log('✅ 海报管理主菜单已添加');
    } else {
      console.log('ℹ️  海报管理主菜单已存在');
    }
    
    // 5. 检查并添加营销管理主菜单
    const [marketingMenuExist] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE code = 'marketing' AND type = 'menu'`
    );
    
    let marketingMenuId = null;
    if (marketingMenuExist.length === 0) {
      const marketingMainMenu = [{
        name: '营销管理',
        code: 'marketing',
        type: 'menu',
        parent_id: null,
        path: '/marketing',
        component: 'Layout',
        permission: null,
        icon: 'Promotion',
        sort: 60,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }];
      
      await queryInterface.bulkInsert('permissions', marketingMainMenu);
      console.log('✅ 营销管理主菜单已添加');
    } else {
      console.log('ℹ️  营销管理主菜单已存在');
    }
    
    // 先添加招生管理的缺失功能
    if (enrollmentSubFeatures.length > 0) {
      console.log(`添加 ${enrollmentSubFeatures.length} 个招生管理子功能...`);
      await queryInterface.bulkInsert('permissions', enrollmentSubFeatures);
    }
    
    // 获取主菜单ID
    const [posterMenuResult] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE code = 'poster' AND type = 'menu'`
    );
    posterMenuId = posterMenuResult.length > 0 ? (posterMenuResult[0] as any).id : null;
    
    const [marketingMenuResult] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE code = 'marketing' AND type = 'menu'`
    );
    marketingMenuId = marketingMenuResult.length > 0 ? (marketingMenuResult[0] as any).id : null;
    
    // 6. 添加海报管理子功能
    const posterSubFeatures = [];
    
    if (posterMenuId) {
      // 海报模板管理
      posterSubFeatures.push({
        name: '海报模板管理',
        code: 'poster:templates',
        type: 'menu',
        parent_id: posterMenuId,
        path: 'templates',
        component: 'pages/principal/PosterTemplates.vue',
        permission: null,
        icon: 'CollectionTag',
        sort: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      // 海报编辑器
      posterSubFeatures.push({
        name: '海报编辑器',
        code: 'poster:editor',
        type: 'menu',
        parent_id: posterMenuId,
        path: 'editor',
        component: 'pages/principal/PosterEditor.vue',
        permission: null,
        icon: 'Edit',
        sort: 2,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      // 海报生成器
      posterSubFeatures.push({
        name: '海报生成器',
        code: 'poster:generator',
        type: 'menu',
        parent_id: posterMenuId,
        path: 'generator',
        component: 'pages/principal/PosterGenerator.vue',
        permission: null,
        icon: 'Magic',
        sort: 3,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    // 7. 添加营销管理子功能
    const marketingSubFeatures = [];
    
    if (marketingMenuId) {
      // 营销分析
      marketingSubFeatures.push({
        name: '营销分析',
        code: 'marketing:analysis',
        type: 'menu',
        parent_id: marketingMenuId,
        path: 'analysis',
        component: 'pages/principal/MarketingAnalysis.vue',
        permission: null,
        icon: 'DataAnalysis',
        sort: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      // 营销活动管理
      marketingSubFeatures.push({
        name: '营销活动管理',
        code: 'marketing:campaigns',
        type: 'menu',
        parent_id: marketingMenuId,
        path: 'campaigns',
        component: 'pages/marketing.vue',
        permission: null,
        icon: 'Campaign',
        sort: 2,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    // 添加子功能到数据库
    if (posterSubFeatures.length > 0) {
      console.log(`添加 ${posterSubFeatures.length} 个海报管理子功能...`);
      await queryInterface.bulkInsert('permissions', posterSubFeatures);
    }
    
    if (marketingSubFeatures.length > 0) {
      console.log(`添加 ${marketingSubFeatures.length} 个营销管理子功能...`);
      await queryInterface.bulkInsert('permissions', marketingSubFeatures);
    }
    
    // 8. 为admin角色添加所有新权限
    const [adminRoleResult] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE code = 'admin'`
    );
    const adminRoleId = adminRoleResult.length > 0 ? (adminRoleResult[0] as any).id : null;
    
    if (adminRoleId) {
      // 获取所有新添加的权限ID
      const [newPermissionsResult] = await queryInterface.sequelize.query(
        `SELECT id FROM permissions WHERE 
         code IN ('enrollment:simulation', 'enrollment:forecast', 'enrollment:strategy', 'enrollment:analytics', 
                 'enrollment:application-detail', 'enrollment:application-review', 'enrollment:interview',
                 'poster', 'poster:templates', 'poster:editor', 'poster:generator',
                 'marketing', 'marketing:analysis', 'marketing:campaigns')`
      );
      
      const newPermissionIds = (newPermissionsResult as any[]).map(p => p.id);
      
      if (newPermissionIds.length > 0) {
        const rolePermissions = [];
        
        for (const permissionId of newPermissionIds) {
          // 检查是否已存在
          const [existingResult] = await queryInterface.sequelize.query(
            `SELECT id FROM role_permissions WHERE role_id = ${adminRoleId} AND permission_id = ${permissionId}`
          );
          
          if (existingResult.length === 0) {
            rolePermissions.push({
              role_id: adminRoleId,
              permission_id: permissionId,
              created_at: new Date(),
              updated_at: new Date()
            });
          }
        }
        
        if (rolePermissions.length > 0) {
          await queryInterface.bulkInsert('role_permissions', rolePermissions);
          console.log(`✅ 为admin角色添加了${rolePermissions.length}个新权限`);
        }
      }
    }
    
    console.log('✅ 缺失功能权限添加完成');
  },
  
  down: async (queryInterface: QueryInterface) => {
    // 删除所有新添加的权限
    await queryInterface.sequelize.query(
      `DELETE FROM role_permissions WHERE permission_id IN 
       (SELECT id FROM permissions WHERE code IN 
        ('enrollment:simulation', 'enrollment:forecast', 'enrollment:strategy', 'enrollment:analytics', 
         'enrollment:application-detail', 'enrollment:application-review', 'enrollment:interview',
         'poster', 'poster:templates', 'poster:editor', 'poster:generator',
         'marketing', 'marketing:analysis', 'marketing:campaigns'))`
    );
    
    await queryInterface.sequelize.query(
      `DELETE FROM permissions WHERE code IN 
       ('enrollment:simulation', 'enrollment:forecast', 'enrollment:strategy', 'enrollment:analytics', 
        'enrollment:application-detail', 'enrollment:application-review', 'enrollment:interview',
        'poster', 'poster:templates', 'poster:editor', 'poster:generator',
        'marketing', 'marketing:analysis', 'marketing:campaigns')`
    );
  }
};