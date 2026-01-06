import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // 添加海报管理和营销管理的子功能
    
    // 1. 获取海报管理主菜单ID
    const [posterMenuResult] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE code = 'poster' AND type = 'menu'`
    );
    const posterMenuId = posterMenuResult.length > 0 ? (posterMenuResult[0] as any).id : null;
    
    // 2. 获取营销管理主菜单ID - 使用大写的MARKETING
    const [marketingMenuResult] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE code = 'MARKETING' AND type = 'menu'`
    );
    const marketingMenuId = marketingMenuResult.length > 0 ? (marketingMenuResult[0] as any).id : null;
    
    // 3. 添加海报管理子功能
    if (posterMenuId) {
      const posterSubFeatures = [];
      
      // 检查是否已存在海报模板管理
      const [posterTemplatesExist] = await queryInterface.sequelize.query(
        `SELECT id FROM permissions WHERE code = 'poster:templates'`
      );
      
      if (posterTemplatesExist.length === 0) {
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
      }
      
      // 检查是否已存在海报编辑器
      const [posterEditorExist] = await queryInterface.sequelize.query(
        `SELECT id FROM permissions WHERE code = 'poster:editor'`
      );
      
      if (posterEditorExist.length === 0) {
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
      }
      
      // 检查是否已存在海报生成器
      const [posterGeneratorExist] = await queryInterface.sequelize.query(
        `SELECT id FROM permissions WHERE code = 'poster:generator'`
      );
      
      if (posterGeneratorExist.length === 0) {
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
      
      if (posterSubFeatures.length > 0) {
        console.log(`添加 ${posterSubFeatures.length} 个海报管理子功能...`);
        await queryInterface.bulkInsert('permissions', posterSubFeatures);
      } else {
        console.log('ℹ️  海报管理子功能已存在');
      }
    }
    
    // 4. 添加营销管理子功能
    if (marketingMenuId) {
      const marketingSubFeatures = [];
      
      // 检查是否已存在营销分析
      const [marketingAnalysisExist] = await queryInterface.sequelize.query(
        `SELECT id FROM permissions WHERE code = 'marketing:analysis'`
      );
      
      if (marketingAnalysisExist.length === 0) {
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
      }
      
      // 检查是否已存在营销活动管理
      const [marketingCampaignsExist] = await queryInterface.sequelize.query(
        `SELECT id FROM permissions WHERE code = 'marketing:campaigns'`
      );
      
      if (marketingCampaignsExist.length === 0) {
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
      
      if (marketingSubFeatures.length > 0) {
        console.log(`添加 ${marketingSubFeatures.length} 个营销管理子功能...`);
        await queryInterface.bulkInsert('permissions', marketingSubFeatures);
      } else {
        console.log('ℹ️  营销管理子功能已存在');
      }
    }
    
    // 5. 为admin角色添加所有新权限
    const [adminRoleResult] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE code = 'admin'`
    );
    const adminRoleId = adminRoleResult.length > 0 ? (adminRoleResult[0] as any).id : null;
    
    if (adminRoleId) {
      // 获取所有新添加的权限ID
      const [newPermissionsResult] = await queryInterface.sequelize.query(
        `SELECT id FROM permissions WHERE 
         code IN ('poster:templates', 'poster:editor', 'poster:generator',
                 'marketing:analysis', 'marketing:campaigns')`
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
        } else {
          console.log('ℹ️  admin角色已拥有所有新权限');
        }
      }
    }
    
    console.log('✅ 海报管理和营销管理功能权限添加完成');
  },
  
  down: async (queryInterface: QueryInterface) => {
    // 删除新添加的权限
    await queryInterface.sequelize.query(
      `DELETE FROM role_permissions WHERE permission_id IN 
       (SELECT id FROM permissions WHERE code IN 
        ('poster:templates', 'poster:editor', 'poster:generator',
         'marketing:analysis', 'marketing:campaigns'))`
    );
    
    await queryInterface.sequelize.query(
      `DELETE FROM permissions WHERE code IN 
       ('poster:templates', 'poster:editor', 'poster:generator',
        'marketing:analysis', 'marketing:campaigns')`
    );
  }
};