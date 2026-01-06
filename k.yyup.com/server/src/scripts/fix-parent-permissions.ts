/**
 * 修复家长权限 - 移除不应该有的权限
 */

import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

dotenv.config({ path: 'server/.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'pwk5ls7j',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906'),
    dialect: 'mysql',
    logging: false
  }
);

async function fixParentPermissions() {
  try {
    console.log('🔧 修复家长权限 - 移除不应该有的权限\n');

    // 1. 获取家长角色
    const [parentRole] = await sequelize.query(`
      SELECT id FROM roles WHERE code = 'parent' LIMIT 1
    `) as any[];

    const parentRoleId = parentRole[0].id;
    console.log(`✅ 家长角色ID: ${parentRoleId}\n`);

    // 2. 获取需要移除的权限ID
    const [permissionsToRemove] = await sequelize.query(`
      SELECT p.id, p.code
      FROM permissions p
      WHERE p.code IN ('SYSTEM_CENTER', 'SYSTEM_MANAGEMENT_CATEGORY')
      AND p.status = 1
    `) as any[];

    if (permissionsToRemove.length === 0) {
      console.log('✅ 没有需要移除的权限');
      return;
    }

    console.log(`❌ 需要移除的权限 (${permissionsToRemove.length}个):`);
    permissionsToRemove.forEach((p: any) => {
      console.log(`  - ${p.code} (ID: ${p.id})`);
    });

    // 3. 从role_permissions表中删除这些权限
    const permissionIds = permissionsToRemove.map((p: any) => p.id);
    
    const deleteResult = await sequelize.query(`
      DELETE FROM role_permissions
      WHERE role_id = ? AND permission_id IN (${permissionIds.join(',')})
    `, { replacements: [parentRoleId] });

    console.log(`\n✅ 已从家长角色中移除 ${permissionsToRemove.length} 个权限\n`);

    // 4. 验证修复结果
    const [remainingPermissions] = await sequelize.query(`
      SELECT COUNT(*) as count FROM role_permissions
      WHERE role_id = ?
    `, { replacements: [parentRoleId] }) as any[];

    console.log(`📊 修复后家长角色权限总数: ${remainingPermissions[0].count}`);

    // 5. 验证不应该有的权限已被移除
    const [stillHasSystemPermissions] = await sequelize.query(`
      SELECT COUNT(*) as count FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ? AND p.code IN ('SYSTEM_CENTER', 'SYSTEM_MANAGEMENT_CATEGORY')
    `, { replacements: [parentRoleId] }) as any[];

    if (stillHasSystemPermissions[0].count === 0) {
      console.log('✅ 验证成功：SYSTEM权限已完全移除');
    } else {
      console.log('❌ 验证失败：仍然存在SYSTEM权限');
    }

    console.log('\n✅ 修复完成');
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await sequelize.close();
  }
}

fixParentPermissions();

