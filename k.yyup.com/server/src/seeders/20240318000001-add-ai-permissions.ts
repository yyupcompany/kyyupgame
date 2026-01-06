import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // 添加AI功能相关权限
    const aiPermissions = [
      // AI助手主菜单
      {
        name: 'AI助手',
        code: 'ai',
        type: 'menu',
        parent_id: null,
        path: '/ai',
        component: 'Layout',
        permission: null,
        icon: 'ChatDotRound',
        sort: 40,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // 获取刚创建的AI主菜单ID
    await queryInterface.bulkInsert('permissions', aiPermissions);
    
    // 获取AI主菜单的ID
    const [aiMainPermission] = await queryInterface.sequelize.query(`SELECT id FROM permissions WHERE code = 'ai'`);
    const aiMainId = aiMainPermission.length > 0 ? (aiMainPermission[0] as any).id : null;

    if (aiMainId) {
      // AI子菜单
      const aiSubPermissions = [
        {
          name: 'AI对话',
          code: 'ai:chat',
          type: 'menu',
          parent_id: aiMainId,
          path: 'chat-interface',
          component: 'pages/ai/ChatInterface.vue',
          permission: null,
          icon: 'ChatDotRound',
          sort: 1,
          status: 1,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'AI模型管理',
          code: 'ai:model',
          type: 'menu',
          parent_id: aiMainId,
          path: 'model-management',
          component: 'pages/ai/ModelManagementPage.vue',
          permission: null,
          icon: 'Setting',
          sort: 2,
          status: 1,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'AI记忆管理',
          code: 'ai:memory',
          type: 'menu',
          parent_id: aiMainId,
          path: 'memory-management',
          component: 'pages/ai/MemoryManagementPage.vue',
          permission: null,
          icon: 'FolderOpened',
          sort: 3,
          status: 1,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: '专家咨询',
          code: 'ai:expert',
          type: 'menu',
          parent_id: aiMainId,
          path: 'expert-consultation',
          component: 'pages/ai/ExpertConsultationPage.vue',
          permission: null,
          icon: 'User',
          sort: 4,
          status: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      await queryInterface.bulkInsert('permissions', aiSubPermissions);

      // 获取所有AI权限的ID
      const [aiPermissionIds] = await queryInterface.sequelize.query(`SELECT id FROM permissions WHERE code LIKE 'ai%'`);
      const permissionIds = (aiPermissionIds as any[]).map(p => p.id);

      if (permissionIds.length > 0) {
        // 为admin角色添加AI权限
        const [adminRole] = await queryInterface.sequelize.query(`SELECT id FROM roles WHERE code = 'admin'`);
        const adminRoleId = adminRole.length > 0 ? (adminRole[0] as any).id : null;

        if (adminRoleId) {
          // 检查已存在的权限关联，避免重复
          const rolePermissions = [];
          for (const permissionId of permissionIds) {
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
            console.log(`✅ 为admin角色添加了${rolePermissions.length}个新的AI权限`);
          } else {
            console.log('ℹ️  admin角色已拥有所有AI权限');
          }
        }
      }
    }

    console.log('✅ AI功能权限添加完成');
  },

  down: async (queryInterface: QueryInterface) => {
    // 删除AI相关权限
    await queryInterface.sequelize.query(`DELETE FROM role_permissions WHERE permission_id IN (SELECT id FROM permissions WHERE code LIKE 'ai%')`);
    await queryInterface.sequelize.query(`DELETE FROM permissions WHERE code LIKE 'ai%'`);
  }
};