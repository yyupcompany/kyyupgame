/**
 * 分析家长权限 - 找出不应该有的权限
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

async function analyzeParentPermissions() {
  try {
    console.log('🔍 分析家长权限 - 找出不应该有的权限\n');

    // 1. 获取家长角色
    const [parentRole] = await sequelize.query(`
      SELECT id FROM roles WHERE code = 'parent' LIMIT 1
    `) as any[];

    const parentRoleId = parentRole[0].id;

    // 2. 获取家长的所有权限
    const [parentPermissions] = await sequelize.query(`
      SELECT rp.permission_id, p.code, p.name, p.chinese_name, p.type
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ? AND p.status = 1
      ORDER BY p.code ASC
    `, { replacements: [parentRoleId] }) as any[];

    console.log(`📊 家长角色权限总数: ${parentPermissions.length}\n`);

    // 3. 分类权限
    const parentPermissionCodes = parentPermissions.map((p: any) => p.code);
    
    // 应该有的权限前缀
    const allowedPrefixes = ['PARENT_'];
    
    // 不应该有的权限前缀
    const forbiddenPrefixes = ['SYSTEM_', 'ADMIN_', 'TEACHER_', 'PRINCIPAL_'];

    // 4. 找出不应该有的权限
    const inappropriatePermissions = parentPermissions.filter((p: any) => {
      return forbiddenPrefixes.some(prefix => p.code.startsWith(prefix));
    });

    console.log(`❌ 不应该有的权限 (${inappropriatePermissions.length}个):`);
    inappropriatePermissions.forEach((p: any) => {
      console.log(`  - ${p.code} (${p.chinese_name || p.name})`);
    });

    // 5. 找出通用权限（不以PARENT_开头，但也不是禁止的）
    const genericPermissions = parentPermissions.filter((p: any) => {
      return !p.code.startsWith('PARENT_') && 
             !forbiddenPrefixes.some(prefix => p.code.startsWith(prefix));
    });

    console.log(`\n⚠️ 通用权限 (${genericPermissions.length}个):`);
    genericPermissions.forEach((p: any) => {
      console.log(`  - ${p.code} (${p.chinese_name || p.name})`);
    });

    // 6. 找出应该有的权限
    const appropriatePermissions = parentPermissions.filter((p: any) => {
      return p.code.startsWith('PARENT_');
    });

    console.log(`\n✅ 应该有的权限 (${appropriatePermissions.length}个):`);
    appropriatePermissions.forEach((p: any) => {
      console.log(`  - ${p.code} (${p.chinese_name || p.name})`);
    });

    // 7. 建议
    console.log('\n💡 建议:');
    if (inappropriatePermissions.length > 0) {
      console.log(`❌ 需要从家长角色中移除 ${inappropriatePermissions.length} 个权限:`);
      inappropriatePermissions.forEach((p: any) => {
        console.log(`   - ${p.code}`);
      });
    }

    console.log('\n✅ 分析完成');
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await sequelize.close();
  }
}

analyzeParentPermissions();

