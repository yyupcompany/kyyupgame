/**
 * 验证家长权限修复
 */

import { Sequelize, Op } from 'sequelize';
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

async function verifyParentPermissionFix() {
  try {
    console.log('✅ 验证家长权限修复\n');

    // 1. 获取家长角色
    const [parentRole] = await sequelize.query(`
      SELECT id FROM roles WHERE code = 'parent' LIMIT 1
    `) as any[];

    const parentRoleId = parentRole[0].id;

    // 2. 检查是否还有SYSTEM权限
    const [systemPermissions] = await sequelize.query(`
      SELECT COUNT(*) as count FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ? AND p.code IN ('SYSTEM_CENTER', 'SYSTEM_MANAGEMENT_CATEGORY')
    `, { replacements: [parentRoleId] }) as any[];

    console.log(`📊 家长角色SYSTEM权限数: ${systemPermissions[0].count}`);

    if (systemPermissions[0].count === 0) {
      console.log('✅ 验证成功：SYSTEM权限已完全移除\n');
    } else {
      console.log('❌ 验证失败：仍然存在SYSTEM权限\n');
      return;
    }

    // 3. 获取家长的所有权限
    const [allPermissions] = await sequelize.query(`
      SELECT p.code, p.chinese_name FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ? AND p.status = 1
      ORDER BY p.code ASC
    `, { replacements: [parentRoleId] }) as any[];

    console.log(`📋 家长角色权限总数: ${allPermissions.length}\n`);

    // 4. 统计权限类型
    const parentPermissions = allPermissions.filter((p: any) => p.code.startsWith('PARENT_'));
    const genericPermissions = allPermissions.filter((p: any) => !p.code.startsWith('PARENT_'));

    console.log(`✅ PARENT_权限: ${parentPermissions.length}个`);
    console.log(`⚠️ 通用权限: ${genericPermissions.length}个`);

    // 5. 检查是否有不应该有的权限
    const forbiddenPrefixes = ['SYSTEM_', 'ADMIN_', 'TEACHER_', 'PRINCIPAL_'];
    const inappropriatePermissions = allPermissions.filter((p: any) => {
      return forbiddenPrefixes.some(prefix => p.code.startsWith(prefix));
    });

    if (inappropriatePermissions.length === 0) {
      console.log('✅ 验证成功：没有不应该有的权限\n');
    } else {
      console.log(`❌ 验证失败：仍然有 ${inappropriatePermissions.length} 个不应该有的权限:`);
      inappropriatePermissions.forEach((p: any) => {
        console.log(`  - ${p.code}`);
      });
    }

    console.log('✅ 验证完成');
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await sequelize.close();
  }
}

verifyParentPermissionFix();

