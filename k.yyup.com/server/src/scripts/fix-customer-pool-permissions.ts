/**
 * 修复客户池权限配置不匹配问题
 * 将路由权限要求与数据库权限统一
 */

import { sequelize } from '../init';

async function fixCustomerPoolPermissions() {
  try {
    console.log('开始修复客户池权限配置...');

    // 1. 检查教师角色当前权限
    console.log('1. 检查教师角色当前客户池权限...');
    const [teacherPermissions] = await sequelize.query(`
      SELECT p.id, p.code, p.name
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN roles r ON rp.role_id = r.id
      WHERE r.name = 'teacher' AND p.code LIKE '%CUSTOMER%'
      ORDER BY p.code
    `);

    console.log('教师角色当前客户池权限:');
    (teacherPermissions as any[]).forEach(perm => {
      console.log(`  - ${perm.code}: ${perm.name}`);
    });

    // 2. 检查数据库中所有客户池相关权限
    console.log('\n2. 检查数据库中所有客户池权限...');
    const [allCustomerPermissions] = await sequelize.query(`
      SELECT id, code, name FROM permissions WHERE code LIKE '%CUSTOMER%' ORDER BY code
    `);

    console.log('数据库中所有客户池权限:');
    (allCustomerPermissions as any[]).forEach(perm => {
      console.log(`  - ${perm.code}: ${perm.name}`);
    });

    // 3. 确认CUSTOMER_POOL_CENTER_MANAGE权限存在
    const [managePermission] = await sequelize.query(`
      SELECT id, code, name FROM permissions WHERE code = 'CUSTOMER_POOL_CENTER_MANAGE'
    `);

    if (!managePermission.length) {
      console.log('\n⚠️ CUSTOMER_POOL_CENTER_MANAGE权限不存在，需要创建...');

      // 创建核心管理权限
      await sequelize.query(`
        INSERT INTO permissions (code, name, category, description, created_at, updated_at)
        VALUES ('CUSTOMER_POOL_CENTER_MANAGE', '客户池中心管理', 'customer_pool', '客户池中心核心管理权限', NOW(), NOW())
      `);

      console.log('✅ 已创建 CUSTOMER_POOL_CENTER_MANAGE 权限');
    } else {
      console.log(`\n✅ CUSTOMER_POOL_CENTER_MANAGE 权限已存在: ${(managePermission[0] as any).name}`);
    }

    // 4. 获取教师角色ID
    const [teacherRole] = await sequelize.query(`
      SELECT id FROM roles WHERE name = 'teacher'
    `);

    if (!teacherRole.length) {
      console.error('❌ 未找到教师角色');
      return;
    }

    const teacherRoleId = (teacherRole[0] as any).id;
    console.log(`\n教师角色ID: ${teacherRoleId}`);

    // 5. 确保教师角色有CUSTOMER_POOL_CENTER_MANAGE权限
    const [managePermissionId] = await sequelize.query(`
      SELECT id FROM permissions WHERE code = 'CUSTOMER_POOL_CENTER_MANAGE'
    `);

    const permissionId = (managePermissionId[0] as any).id;

    // 检查是否已经分配给教师角色
    const [rolePermissionExists] = await sequelize.query(`
      SELECT id FROM role_permissions
      WHERE role_id = ${teacherRoleId} AND permission_id = ${permissionId}
    `);

    if (!rolePermissionExists.length) {
      // 添加权限
      await sequelize.query(`
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        VALUES (${teacherRoleId}, ${permissionId}, NOW(), NOW())
      `);

      console.log('✅ 已为教师角色添加 CUSTOMER_POOL_CENTER_MANAGE 权限');
    } else {
      console.log('✅ 教师角色已有 CUSTOMER_POOL_CENTER_MANAGE 权限');
    }

    // 6. 验证最终结果
    console.log('\n3. 验证修复结果...');
    const [finalPermissions] = await sequelize.query(`
      SELECT p.id, p.code, p.name
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN roles r ON rp.role_id = r.id
      WHERE r.name = 'teacher' AND p.code LIKE '%CUSTOMER%'
      ORDER BY p.code
    `);

    console.log('修复后教师角色客户池权限:');
    (finalPermissions as any[]).forEach(perm => {
      console.log(`  - ${perm.code}: ${perm.name}`);
    });

    // 7. 检查关键权限是否存在
    const requiredPermissions = [
      'CUSTOMER_POOL_CENTER_MANAGE',
      'CUSTOMER_POOL_CENTER_VIEW',
      'CUSTOMER_POOL_CENTER_CUSTOMER_VIEW',
      'CUSTOMER_POOL_CENTER_CUSTOMER_UPDATE'
    ];

    console.log('\n4. 检查关键权限状态...');
    for (const reqPerm of requiredPermissions) {
      const hasPermission = (finalPermissions as any[]).some(p => p.code === reqPerm);
      console.log(`  ${hasPermission ? '✅' : '❌'} ${reqPerm}`);
    }

    console.log('\n✅ 客户池权限配置修复完成');
    console.log('📝 修复内容:');
    console.log('   - 确保CUSTOMER_POOL_CENTER_MANAGE权限存在');
    console.log('   - 为教师角色分配核心管理权限');
    console.log('   - 权限配置与API路由要求保持一致');

  } catch (error) {
    console.error('❌ 修复客户池权限失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

fixCustomerPoolPermissions();