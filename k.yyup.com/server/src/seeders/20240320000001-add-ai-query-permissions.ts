import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    console.log('🌱 开始添加AI查询系统权限...');
    
    // 检查是否已存在AI主菜单
    const [aiMainPermissionResult] = await queryInterface.sequelize.query(`SELECT id FROM permissions WHERE code = 'ai'`);
    let aiMainId = null;
    
    if (aiMainPermissionResult.length === 0) {
      // 创建AI主权限
      await queryInterface.bulkInsert('permissions', [
        {
          name: 'AI助手',
          chinese_name: 'AI助手使用',
          code: 'ai',
          type: 'menu',
          parent_id: null,
          path: '/ai',
          component: null,
          permission: 'AI_ASSISTANT_USE',
          icon: 'ChatDotRound',
          sort: 40,
          status: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);
      
      const [newAiMainResult] = await queryInterface.sequelize.query(`SELECT id FROM permissions WHERE code = 'ai'`);
      aiMainId = newAiMainResult.length > 0 ? (newAiMainResult[0] as any).id : null;
    } else {
      aiMainId = (aiMainPermissionResult[0] as any).id;
    }

    // AI查询系统专用权限
    const aiQueryPermissions = [
      {
        name: 'AI智能查询',
        chinese_name: 'AI查询执行',
        code: 'ai:query',
        type: 'menu',
        parent_id: aiMainId,
        path: '/ai/query',
        component: 'pages/ai/AIQueryInterface.vue',
        permission: 'AI_QUERY_EXECUTE',
        icon: 'DataAnalysis',
        sort: 10,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // 检查并插入不存在的权限
    for (const permission of aiQueryPermissions) {
      const [existingPermission] = await queryInterface.sequelize.query(
        `SELECT id FROM permissions WHERE code = '${permission.code}'`
      );
      
      if (existingPermission.length === 0) {
        await queryInterface.bulkInsert('permissions', [permission]);
        console.log(`✅ 添加权限: ${permission.code} (${permission.permission})`);
      } else {
        console.log(`ℹ️  权限已存在: ${permission.code}`);
      }
    }

    // 获取所有AI查询权限的ID
    const [aiQueryPermissionIds] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE code LIKE 'ai%' AND permission LIKE 'AI_QUERY_%'`
    );
    const queryPermissionIds = (aiQueryPermissionIds as any[]).map(p => p.id);

    if (queryPermissionIds.length > 0) {
      // 为admin角色添加AI查询权限
      const [adminRole] = await queryInterface.sequelize.query(`SELECT id FROM roles WHERE name = 'admin'`);
      const adminRoleId = adminRole.length > 0 ? (adminRole[0] as any).id : null;

      if (adminRoleId) {
        console.log(`📋 为admin角色添加AI查询权限...`);
        
        // 检查已存在的权限关联，避免重复
        const rolePermissions = [];
        for (const permissionId of queryPermissionIds) {
          const [existing] = await queryInterface.sequelize.query(
            `SELECT id FROM role_permissions WHERE role_id = ${adminRoleId} AND permission_id = ${permissionId}`
          );
          if (existing.length === 0) {
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
          console.log(`✅ 为admin角色添加了${rolePermissions.length}个新的AI查询权限`);
        } else {
          console.log('ℹ️  admin角色已拥有所有AI查询权限');
        }
      }

      // 为principal角色添加基础AI查询权限
      const [principalRole] = await queryInterface.sequelize.query(`SELECT id FROM roles WHERE name = 'principal'`);
      const principalRoleId = principalRole.length > 0 ? (principalRole[0] as any).id : null;

      if (principalRoleId) {
        console.log(`👨‍💼 为principal角色添加AI查询权限...`);
        
        // 园长可以使用基础AI查询功能
        const principalQueryPermissions = await queryInterface.sequelize.query(
          `SELECT id FROM permissions WHERE permission = 'AI_QUERY_EXECUTE'`
        );
        const principalPermissionIds = (principalQueryPermissions[0] as any[]).map(p => p.id);

        const principalRolePermissions = [];
        for (const permissionId of principalPermissionIds) {
          const [existing] = await queryInterface.sequelize.query(
            `SELECT id FROM role_permissions WHERE role_id = ${principalRoleId} AND permission_id = ${permissionId}`
          );
          if (existing.length === 0) {
            principalRolePermissions.push({
              role_id: principalRoleId,
              permission_id: permissionId,
              created_at: new Date(),
              updated_at: new Date()
            });
          }
        }

        if (principalRolePermissions.length > 0) {
          await queryInterface.bulkInsert('role_permissions', principalRolePermissions);
          console.log(`✅ 为principal角色添加了${principalRolePermissions.length}个AI查询权限`);
        }
      }
    }

    // 动态路由功能暂不可用，跳过路由创建
    console.log(`ℹ️  跳过动态路由创建（表不存在）`);

    console.log('🎉 AI查询系统权限和路由添加完成！');
  },

  down: async (queryInterface: QueryInterface) => {
    console.log('🗑️  删除AI查询系统权限...');
    
    // 删除AI查询相关的角色权限关联
    await queryInterface.sequelize.query(
      `DELETE FROM role_permissions WHERE permission_id IN (SELECT id FROM permissions WHERE code LIKE 'ai%')`
    );
    
    // 删除AI查询权限
    await queryInterface.sequelize.query(
      `DELETE FROM permissions WHERE code = 'ai:query'`
    );
    
    // 跳过动态路由删除（表不存在）
    
    console.log('✅ AI查询系统权限删除完成');
  }
};