'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔧 开始添加检查中心权限...');

    // 1. 检查是否已存在检查中心主菜单
    const [existingInspectionMain] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE code = 'inspection_center'`
    );

    let inspectionMainId;

    if (existingInspectionMain.length === 0) {
      // 创建检查中心主菜单
      await queryInterface.bulkInsert('permissions', [
        {
          name: 'Inspection Center',
          chinese_name: '检查中心',
          code: 'inspection_center',
          type: 'category',
          parent_id: null,
          path: '/inspection-center',
          component: 'Layout',
          permission: null,
          icon: 'DocumentChecked',
          sort: 60,
          status: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);

      const [newInspectionMain] = await queryInterface.sequelize.query(
        `SELECT id FROM permissions WHERE code = 'inspection_center'`
      );
      inspectionMainId = newInspectionMain[0].id;
      console.log(`✅ 创建检查中心主菜单，ID: ${inspectionMainId}`);
    } else {
      inspectionMainId = existingInspectionMain[0].id;
      console.log(`ℹ️  检查中心主菜单已存在，ID: ${inspectionMainId}`);
    }

    // 2. 检查中心子权限
    const inspectionPermissions = [
      // 文档模板中心
      {
        name: 'Document Templates',
        chinese_name: '文档模板中心',
        code: 'inspection_center:document_templates',
        type: 'menu',
        parent_id: inspectionMainId,
        path: '/inspection-center/document-templates',
        component: 'pages/inspection-center/DocumentTemplateCenter.vue',
        permission: 'INSPECTION_DOCUMENT_TEMPLATE_VIEW',
        icon: 'Document',
        sort: 10,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // 文档实例列表
      {
        name: 'Document Instances',
        chinese_name: '文档实例列表',
        code: 'inspection_center:document_instances',
        type: 'menu',
        parent_id: inspectionMainId,
        path: '/inspection-center/document-instances',
        component: 'pages/inspection-center/DocumentInstanceList.vue',
        permission: 'INSPECTION_DOCUMENT_INSTANCE_VIEW',
        icon: 'Files',
        sort: 20,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // 文档统计分析
      {
        name: 'Document Statistics',
        chinese_name: '文档统计分析',
        code: 'inspection_center:document_statistics',
        type: 'menu',
        parent_id: inspectionMainId,
        path: '/inspection-center/document-statistics',
        component: 'pages/inspection-center/DocumentStatistics.vue',
        permission: 'INSPECTION_DOCUMENT_STATISTICS_VIEW',
        icon: 'DataAnalysis',
        sort: 30,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // 检查类型管理
      {
        name: 'Inspection Types',
        chinese_name: '检查类型管理',
        code: 'inspection_center:inspection_types',
        type: 'menu',
        parent_id: inspectionMainId,
        path: '/inspection-center/inspection-types',
        component: 'pages/inspection-center/InspectionTypes.vue',
        permission: 'INSPECTION_TYPE_MANAGE',
        icon: 'List',
        sort: 40,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // 检查计划管理
      {
        name: 'Inspection Plans',
        chinese_name: '检查计划管理',
        code: 'inspection_center:inspection_plans',
        type: 'menu',
        parent_id: inspectionMainId,
        path: '/inspection-center/inspection-plans',
        component: 'pages/inspection-center/InspectionPlans.vue',
        permission: 'INSPECTION_PLAN_MANAGE',
        icon: 'Calendar',
        sort: 50,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // 检查任务管理
      {
        name: 'Inspection Tasks',
        chinese_name: '检查任务管理',
        code: 'inspection_center:inspection_tasks',
        type: 'menu',
        parent_id: inspectionMainId,
        path: '/inspection-center/inspection-tasks',
        component: 'pages/inspection-center/InspectionTasks.vue',
        permission: 'INSPECTION_TASK_MANAGE',
        icon: 'Checked',
        sort: 60,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // 3. 检查并插入不存在的权限
    for (const permission of inspectionPermissions) {
      const [existingPermission] = await queryInterface.sequelize.query(
        `SELECT id FROM permissions WHERE code = '${permission.code}'`
      );

      if (existingPermission.length === 0) {
        await queryInterface.bulkInsert('permissions', [permission]);
        console.log(`✅ 添加权限: ${permission.code} (${permission.chinese_name})`);
      } else {
        console.log(`ℹ️  权限已存在: ${permission.code}`);
      }
    }

    // 4. 为admin角色分配所有检查中心权限
    const [adminRole] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE code = 'admin' OR name = 'admin' OR name = '管理员' LIMIT 1`
    );

    if (adminRole.length > 0) {
      const adminRoleId = adminRole[0].id;
      console.log(`📋 为admin角色(ID: ${adminRoleId})分配检查中心权限...`);

      // 获取所有检查中心相关权限ID
      const [inspectionPermissionIds] = await queryInterface.sequelize.query(
        `SELECT id FROM permissions WHERE code LIKE 'inspection_center%'`
      );

      for (const perm of inspectionPermissionIds) {
        // 检查是否已存在角色权限关联
        const [existingRolePermission] = await queryInterface.sequelize.query(
          `SELECT id FROM role_permissions WHERE role_id = ${adminRoleId} AND permission_id = ${perm.id}`
        );

        if (existingRolePermission.length === 0) {
          await queryInterface.bulkInsert('role_permissions', [
            {
              role_id: adminRoleId,
              permission_id: perm.id,
              created_at: new Date(),
              updated_at: new Date()
            }
          ]);
          console.log(`  ✅ 分配权限ID: ${perm.id}`);
        } else {
          console.log(`  ℹ️  权限ID ${perm.id} 已分配`);
        }
      }
    } else {
      console.log('⚠️  未找到admin角色，跳过权限分配');
    }

    console.log('✅ 检查中心权限添加完成！');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔧 开始删除检查中心权限...');

    // 删除角色权限关联
    await queryInterface.sequelize.query(
      `DELETE FROM role_permissions WHERE permission_id IN (
        SELECT id FROM permissions WHERE code LIKE 'inspection_center%'
      )`
    );

    // 删除权限
    await queryInterface.sequelize.query(
      `DELETE FROM permissions WHERE code LIKE 'inspection_center%'`
    );

    console.log('✅ 检查中心权限删除完成！');
  }
};

