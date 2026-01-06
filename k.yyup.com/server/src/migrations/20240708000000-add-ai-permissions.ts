import { QueryInterface, DataTypes, Op } from 'sequelize';

/**
 * 添加AI助手相关权限
 * 这个迁移文件添加了AI助手页面所需的权限配置
 */
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    try {
      // 添加AI助手主权限
      await queryInterface.bulkInsert('permissions', [
        {
          name: 'AI助手',
          code: 'AI_ASSISTANT_USE',
          type: 'menu',
          parentId: null,
          path: '/ai',
          component: 'Layout',
          permission: null,
          icon: 'ChatDotRound',
          sort: 5,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'AI对话',
          code: 'AI_ASSISTANT_CHAT',
          type: 'menu',
          parentId: null, // 将在运行时更新为AI助手的ID
          path: '/ai',
          component: 'ai/AIAssistantPage',
          permission: null,
          icon: 'ChatRound',
          sort: 1,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'AI模型管理',
          code: 'AI_MODEL_MANAGE',
          type: 'menu',
          parentId: null, // 将在运行时更新为AI助手的ID
          path: '/ai/model',
          component: 'ai/ModelManagementPage',
          permission: null,
          icon: 'Setting',
          sort: 2,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: '智能分析',
          code: 'AI_ANALYSIS',
          type: 'menu',
          parentId: null, // 将在运行时更新为AI助手的ID
          path: '/ai/analysis',
          component: 'ai/AnalysisPage',
          permission: null,
          icon: 'DataAnalysis',
          sort: 3,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: '专家咨询',
          code: 'AI_EXPERT_CONSULTATION',
          type: 'menu',
          parentId: null, // 将在运行时更新为AI助手的ID
          path: '/ai/expert',
          component: 'ai/ExpertConsultationPage',
          permission: null,
          icon: 'User',
          sort: 4,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);

      // 查询AI助手主权限的ID
      const [aiMainPermissions] = await queryInterface.sequelize.query(
        "SELECT id FROM permissions WHERE code = 'AI_ASSISTANT_USE' LIMIT 1"
      );
      
      if (aiMainPermissions.length > 0) {
        const aiMainPermissionId = (aiMainPermissions[0] as any).id;
        
        // 更新子权限的parentId
        await queryInterface.bulkUpdate(
          'permissions',
          { parentId: aiMainPermissionId },
          { 
            code: { 
              [Op.in]: [
                'AI_ASSISTANT_CHAT',
                'AI_MODEL_MANAGE', 
                'AI_ANALYSIS',
                'AI_EXPERT_CONSULTATION'
              ]
            }
          }
        );
      }

      // 查询管理员角色ID
      const [adminRoles] = await queryInterface.sequelize.query(
        "SELECT id FROM roles WHERE code = 'admin' LIMIT 1"
      );

      if (adminRoles.length > 0) {
        const adminRoleId = (adminRoles[0] as any).id;
        
        // 查询新添加的AI权限IDs
        const [aiPermissions] = await queryInterface.sequelize.query(
          `SELECT id FROM permissions WHERE code IN (
            'AI_ASSISTANT_USE', 
            'AI_ASSISTANT_CHAT', 
            'AI_MODEL_MANAGE', 
            'AI_ANALYSIS', 
            'AI_EXPERT_CONSULTATION'
          )`
        );

        // 为管理员角色添加AI权限
        const rolePermissionsData = (aiPermissions as any[]).map(permission => ({
          roleId: adminRoleId,
          permissionId: permission.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        await queryInterface.bulkInsert('role_permissions', rolePermissionsData);
      }

      console.log('✅ AI权限添加成功');
      
    } catch (error) {
      console.error('❌ 添加AI权限失败:', error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface) => {
    try {
      // 删除AI权限相关的角色权限关联
      await queryInterface.sequelize.query(
        `DELETE FROM role_permissions WHERE permissionId IN (
          SELECT id FROM permissions WHERE code IN (
            'AI_ASSISTANT_USE', 
            'AI_ASSISTANT_CHAT', 
            'AI_MODEL_MANAGE', 
            'AI_ANALYSIS', 
            'AI_EXPERT_CONSULTATION'
          )
        )`
      );

      // 删除AI相关权限
      await queryInterface.bulkDelete('permissions', {
        code: {
          [Op.in]: [
            'AI_ASSISTANT_USE',
            'AI_ASSISTANT_CHAT',
            'AI_MODEL_MANAGE',
            'AI_ANALYSIS',
            'AI_EXPERT_CONSULTATION'
          ]
        }
      });

      console.log('✅ AI权限删除成功');
      
    } catch (error) {
      console.error('❌ 删除AI权限失败:', error);
      throw error;
    }
  }
};