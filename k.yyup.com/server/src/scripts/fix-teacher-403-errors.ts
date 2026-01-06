/**
 * 修复教师角色403错误 - 全面权限配置修复
 * 解决客户池统计、AI助手、教师工作台等403权限问题
 */

import { sequelize } from '../init';

async function fixTeacher403Errors() {
  try {
    console.log('开始修复教师角色403错误...');

    // 获取教师角色ID
    const [teacherRole] = await sequelize.query(`
      SELECT id FROM roles WHERE name = 'teacher'
    `);

    if (!teacherRole.length) {
      console.error('❌ 未找到教师角色');
      return;
    }

    const teacherRoleId = (teacherRole[0] as any).id;
    console.log(`教师角色ID: ${teacherRoleId}`);

    // 1. 教师需要的基础权限列表
    const teacherRequiredPermissions = [
      // 客户池权限 - 已有但确保完整性
      'CUSTOMER_POOL_CENTER',
      'CUSTOMER_POOL_CENTER_VIEW',
      'CUSTOMER_POOL_CENTER_MANAGE',
      'CUSTOMER_POOL_CENTER_CUSTOMER_VIEW',
      'CUSTOMER_POOL_CENTER_CUSTOMER_CREATE',
      'CUSTOMER_POOL_CENTER_CUSTOMER_UPDATE',
      'CUSTOMER_POOL_CENTER_FOLLOWUP_VIEW',
      'CUSTOMER_POOL_CENTER_FOLLOWUP_CREATE',
      'CUSTOMER_POOL_CENTER_FOLLOWUP_UPDATE',
      'CUSTOMER_POOL_CENTER_DATA_ANALYTICS',
      'CUSTOMER_POOL_CENTER_DATA_EXPORT',
      'CUSTOMER_POOL_CENTER_ANALYTICS',

      // AI助手权限 - 解决AI会话403问题
      'AI_ASSISTANT_VIEW',
      'AI_ASSISTANT_QUERY',
      'AI_ASSISTANT_CONVERSATION',
      'AI_ASSISTANT_MESSAGE',
      'AI_ASSISTANT_CHAT',
      'AI_CONVERSATION_CREATE',
      'AI_CONVERSATION_VIEW',
      'AI_MESSAGE_CREATE',
      'AI_MESSAGE_VIEW',

      // 教师工作台权限
      'TEACHER_DASHBOARD_VIEW',
      'TEACHER_DASHBOARD_STATISTICS',
      'TEACHER_DASHBOARD_TASKS',
      'TEACHER_DASHBOARD_COURSES',
      'TEACHER_DASHBOARD_NOTIFICATIONS',

      // 基础权限
      'DASHBOARD_VIEW',
      'STATISTICS_VIEW',
      'NOTIFICATIONS_VIEW',
      'TASKS_VIEW',
      'SCHEDULE_VIEW',

      // 教学中心权限
      'TEACHING_CENTER_VIEW',
      'TEACHING_CENTER_COURSES',
      'TEACHING_CENTER_STUDENTS',

      // 活动中心权限
      'ACTIVITY_CENTER_VIEW',
      'ACTIVITY_PARTICIPATION',

      // 人员中心权限
      'PERSONNEL_CENTER_VIEW',
      'PERSONNEL_CENTER_TEACHER_VIEW'
    ];

    console.log('\n开始检查和添加教师权限...');

    let addedCount = 0;
    let existingCount = 0;
    let missingCount = 0;

    for (const permissionCode of teacherRequiredPermissions) {
      // 检查权限是否存在于数据库
      const [permissionExists] = await sequelize.query(`
        SELECT id FROM permissions WHERE code = '${permissionCode}'
      `);

      if (!permissionExists.length) {
        console.log(`⚠️ 权限 ${permissionCode} 不存在于数据库，跳过`);
        missingCount++;
        continue;
      }

      const permissionId = (permissionExists[0] as any).id;

      // 检查教师角色是否已有此权限
      const [rolePermissionExists] = await sequelize.query(`
        SELECT id FROM role_permissions
        WHERE role_id = ${teacherRoleId} AND permission_id = ${permissionId}
      `);

      if (rolePermissionExists.length) {
        console.log(`✅ 权限 ${permissionCode} 已存在`);
        existingCount++;
        continue;
      }

      // 添加权限给教师角色
      await sequelize.query(`
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        VALUES (${teacherRoleId}, ${permissionId}, NOW(), NOW())
      `);

      console.log(`🆕 添加权限: ${permissionCode}`);
      addedCount++;
    }

    // 2. 检查并创建缺失的关键AI权限
    const aiPermissionsToCreate = [
      {
        code: 'AI_ASSISTANT_VIEW',
        name: 'AI助手查看',
        description: 'AI助手基础查看权限'
      },
      {
        code: 'AI_ASSISTANT_CONVERSATION',
        name: 'AI助手会话',
        description: 'AI助手会话管理权限'
      },
      {
        code: 'AI_CONVERSATION_CREATE',
        name: 'AI会话创建',
        description: '创建AI会话权限'
      },
      {
        code: 'AI_CONVERSATION_VIEW',
        name: 'AI会话查看',
        description: '查看AI会话权限'
      }
    ];

    console.log('\n检查并创建缺失的AI权限...');

    for (const permission of aiPermissionsToCreate) {
      // 检查权限是否已存在
      const [exists] = await sequelize.query(`
        SELECT id FROM permissions WHERE code = '${permission.code}'
      `);

      if (!exists.length) {
        // 创建权限
        await sequelize.query(`
          INSERT INTO permissions (code, name, description, created_at, updated_at)
          VALUES ('${permission.code}', '${permission.name}', '${permission.description}', NOW(), NOW())
        `);
        console.log(`🆕 创建权限: ${permission.code}`);

        // 获取新创建的权限ID并分配给教师角色
        const [newPermission] = await sequelize.query(`
          SELECT id FROM permissions WHERE code = '${permission.code}'
        `);

        if (newPermission.length) {
          const newPermissionId = (newPermission[0] as any).id;
          await sequelize.query(`
            INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
            VALUES (${teacherRoleId}, ${newPermissionId}, NOW(), NOW())
          `);
          console.log(`✅ 权限 ${permission.code} 已分配给教师角色`);
          addedCount++;
        }
      } else {
        console.log(`✅ 权限 ${permission.code} 已存在`);
      }
    }

    // 3. 验证最终结果
    console.log('\n验证修复结果...');
    const [finalPermissions] = await sequelize.query(`
      SELECT p.id, p.code, p.name
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN roles r ON rp.role_id = r.id
      WHERE r.name = 'teacher' AND (
        p.code LIKE '%CUSTOMER%' OR
        p.code LIKE '%AI_%' OR
        p.code LIKE '%TEACHER%' OR
        p.code LIKE '%DASHBOARD%'
      )
      ORDER BY p.code
    `);

    console.log('\n修复后教师角色关键权限:');
    (finalPermissions as any[]).forEach(perm => {
      console.log(`  - ${perm.code}: ${perm.name}`);
    });

    // 4. 统计报告
    console.log('\n📊 修复统计:');
    console.log(`  🆕 新增权限: ${addedCount} 个`);
    console.log(`  ✅ 已有权限: ${existingCount} 个`);
    console.log(`  ⚠️ 缺失权限: ${missingCount} 个`);
    console.log(`  📋 总权限数: ${(finalPermissions as any[]).length} 个`);

    console.log('\n✅ 教师角色403错误修复完成');
    console.log('\n🎯 修复内容:');
    console.log('   - 确保客户池完整权限');
    console.log('   - 添加AI助手必需权限');
    console.log('   - 补充教师工作台权限');
    console.log('   - 创建缺失的AI权限');
    console.log('\n📝 应该解决的403错误:');
    console.log('   - /customer-pool/stats (客户池统计)');
    console.log('   - /customer-pool (客户数据列表)');
    console.log('   - /ai/conversations (AI会话创建)');
    console.log('   - /teacher/dashboard (教师工作台)');

  } catch (error) {
    console.error('❌ 修复教师403错误失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

fixTeacher403Errors();