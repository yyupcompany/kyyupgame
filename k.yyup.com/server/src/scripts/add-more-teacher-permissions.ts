/**
 * 添加更多教师角色客户池权限
 */

import { sequelize } from '../init';

async function addMoreTeacherPermissions() {
  try {
    console.log('开始添加更多教师角色客户池权限...');

    // 获取教师角色ID
    const [teacherRole] = await sequelize.query(`
      SELECT id FROM roles WHERE name = 'teacher'
    `);

    if (!teacherRole.length) {
      console.error('❌ 未找到教师角色');
      return;
    }

    const teacherRoleId = (teacherRole[0] as any).id;
    console.log('教师角色ID:', teacherRoleId);

    // 教师需要的客户池权限（基于数据库中实际存在的权限代码）
    const teacherPermissions = [
      'CUSTOMER_POOL_CENTER',
      'CUSTOMER_POOL_CENTER_VIEW',
      'CUSTOMER_POOL_CENTER_CUSTOMER_VIEW',
      'CUSTOMER_POOL_CENTER_CUSTOMER_UPDATE',
      'CUSTOMER_POOL_CENTER_CUSTOMER_CREATE',     // 🔧 添加：客户创建权限
      'CUSTOMER_POOL_CENTER_FOLLOWUP_VIEW',
      'CUSTOMER_POOL_CENTER_FOLLOWUP_CREATE',
      'CUSTOMER_POOL_CENTER_FOLLOWUP_UPDATE',
      'CUSTOMER_POOL_CENTER_MANAGE',              // 🔧 添加：客户池中心管理权限（API路由需要）
      'CUSTOMER_POOL_CENTER_DATA_ANALYTICS',      // 🔧 添加：数据分析权限
      'CUSTOMER_POOL_CENTER_DATA_EXPORT'          // 🔧 添加：数据导出权限
    ];

    console.log('开始添加教师权限...');

    for (const permissionCode of teacherPermissions) {
      // 检查权限是否存在
      const [permissionExists] = await sequelize.query(`
        SELECT id FROM permissions WHERE code = '${permissionCode}'
      `);

      if (!permissionExists.length) {
        console.log(`⚠️ 权限 ${permissionCode} 不存在，跳过`);
        continue;
      }

      const permissionId = (permissionExists[0] as any).id;

      // 检查是否已经分配给教师角色
      const [rolePermissionExists] = await sequelize.query(`
        SELECT id FROM role_permissions
        WHERE role_id = ${teacherRoleId} AND permission_id = ${permissionId}
      `);

      if (rolePermissionExists.length) {
        console.log(`✅ 权限 ${permissionCode} 已存在`);
        continue;
      }

      // 添加权限
      await sequelize.query(`
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        VALUES (${teacherRoleId}, ${permissionId}, NOW(), NOW())
      `);

      console.log(`✅ 添加权限: ${permissionCode}`);
    }

    // 验证修复结果
    console.log('验证修复结果...');
    const [updatedPermissions] = await sequelize.query(`
      SELECT p.id, p.code, p.name
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN roles r ON rp.role_id = r.id
      WHERE r.name = 'teacher' AND p.code LIKE '%CUSTOMER%'
      ORDER BY p.code
    `);

    console.log('修复后教师角色所有客户池权限:');
    (updatedPermissions as any[]).forEach(perm => {
      console.log(`  - ${perm.code}: ${perm.name}`);
    });

    console.log('✅ 教师角色客户池权限完整性修复完成');

  } catch (error) {
    console.error('❌ 添加教师权限失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

addMoreTeacherPermissions();