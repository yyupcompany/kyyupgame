'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 添加AI助手优化相关权限
    await queryInterface.bulkInsert('permissions', [
      // AI助手优化主菜单
      {
        id: 4001,
        name: 'AI Assistant Optimized',
        chinese_name: 'AI助手优化',
        code: 'AI_ASSISTANT_OPTIMIZED',
        type: 'menu',
        parent_id: 3006, // AI Center
        path: '/ai-assistant-optimized',
        component: 'ai-assistant/OptimizedAssistant',
        permission: 'AI_ASSISTANT_OPTIMIZED_VIEW',
        icon: 'el-icon-cpu',
        sort: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },

      // AI助手优化查询权限
      {
        id: 4002,
        name: 'AI Assistant Query',
        chinese_name: 'AI助手查询',
        code: 'AI_ASSISTANT_OPTIMIZED_QUERY',
        type: 'button',
        parent_id: 4001,
        path: '',
        component: null,
        permission: 'AI_ASSISTANT_OPTIMIZED_QUERY',
        icon: 'el-icon-chat-dot-round',
        sort: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },

      // AI助手性能监控权限
      {
        id: 4003,
        name: 'AI Assistant Performance',
        chinese_name: 'AI助手性能监控',
        code: 'AI_ASSISTANT_OPTIMIZED_PERFORMANCE',
        type: 'button',
        parent_id: 4001,
        path: '',
        component: null,
        permission: 'AI_ASSISTANT_OPTIMIZED_PERFORMANCE',
        icon: 'el-icon-data-analysis',
        sort: 2,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },

      // AI助手配置管理权限
      {
        id: 4004,
        name: 'AI Assistant Config',
        chinese_name: 'AI助手配置管理',
        code: 'AI_ASSISTANT_OPTIMIZED_CONFIG',
        type: 'button',
        parent_id: 4001,
        path: '',
        component: null,
        permission: 'AI_ASSISTANT_OPTIMIZED_CONFIG',
        icon: 'el-icon-setting',
        sort: 3,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },

      // AI助手测试权限
      {
        id: 4005,
        name: 'AI Assistant Test',
        chinese_name: 'AI助手测试',
        code: 'AI_ASSISTANT_OPTIMIZED_TEST',
        type: 'button',
        parent_id: 4001,
        path: '',
        component: null,
        permission: 'AI_ASSISTANT_OPTIMIZED_TEST',
        icon: 'el-icon-cpu',
        sort: 4,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // 为admin角色添加这些权限
    const adminRoleId = 1; // 假设admin角色ID为1
    await queryInterface.bulkInsert('role_permissions', [
      {
        role_id: adminRoleId,
        permission_id: 4001,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role_id: adminRoleId,
        permission_id: 4002,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role_id: adminRoleId,
        permission_id: 4003,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role_id: adminRoleId,
        permission_id: 4004,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role_id: adminRoleId,
        permission_id: 4005,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    // 删除角色权限关联
    await queryInterface.bulkDelete('role_permissions', {
      permission_id: [4001, 4002, 4003, 4004, 4005]
    }, {});

    // 删除权限
    await queryInterface.bulkDelete('permissions', {
      id: [4001, 4002, 4003, 4004, 4005]
    }, {});
  }
};
