/**
 * 修复教师角色客户池权限
 */

import { sequelize } from '../init';
import { QueryInterface, Sequelize, DataTypes } from 'sequelize';

async function fixTeacherPermissions() {
  try {
    console.log('开始修复教师角色客户池权限...');

    const queryInterface = sequelize.getQueryInterface();

    // 1. 查询当前教师角色的权限
    console.log('1. 查询当前教师角色权限...');
    const [teacherPermissions] = await sequelize.query(`
      SELECT p.id, p.code, p.name
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN roles r ON rp.role_id = r.id
      WHERE r.name = 'teacher' AND p.code LIKE '%CUSTOMER%'
    `);

    console.log('教师角色当前客户池权限:', teacherPermissions);

    // 2. 查询所有客户池相关权限
    console.log('2. 查询所有客户池相关权限...');
    const [allCustomerPermissions] = await sequelize.query(`
      SELECT id, code, name FROM permissions WHERE code LIKE '%CUSTOMER%'
    `);

    console.log('所有客户池权限:', allCustomerPermissions);

    // 3. 获取教师角色ID
    const [teacherRole] = await sequelize.query(`
      SELECT id FROM roles WHERE name = 'teacher'
    `);

    if (!teacherRole.length) {
      console.error('❌ 未找到教师角色');
      return;
    }

    const teacherRoleId = (teacherRole[0] as any).id;
    console.log('教师角色ID:', teacherRoleId);

    // 4. 需要添加的权限列表
    const requiredPermissions = [
      'CUSTOMER_POOL_CENTER_VIEW',
      'CUSTOMER_POOL_MANAGE',
      'CUSTOMER_POOL_VIEW',
      'CUSTOMER_POOL_CREATE',
      'CUSTOMER_POOL_UPDATE'
    ];

    console.log('3. 开始添加缺失的权限...');

    for (const permissionCode of requiredPermissions) {
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

    // 5. 验证修复结果
    console.log('4. 验证修复结果...');
    const [updatedPermissions] = await sequelize.query(`
      SELECT p.id, p.code, p.name
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN roles r ON rp.role_id = r.id
      WHERE r.name = 'teacher' AND p.code LIKE '%CUSTOMER%'
    `);

    console.log('修复后教师角色客户池权限:', updatedPermissions);

    console.log('✅ 教师角色客户池权限修复完成');

  } catch (error) {
    console.error('❌ 修复教师权限失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

fixTeacherPermissions();