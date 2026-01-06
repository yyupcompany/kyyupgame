/**
 * 清理测试角色
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

async function cleanupTestRoles() {
  try {
    console.log('🧹 开始清理测试角色...\n');

    // 获取所有测试角色
    const [testRoles] = await sequelize.query(`
      SELECT id, code FROM roles
      WHERE code LIKE '%TEST%' 
         OR code LIKE '%test%'
         OR code LIKE '%debug%'
         OR code LIKE '%DUPLICATE%'
         OR code LIKE '%STATUS%'
         OR code LIKE '%SEARCH%'
         OR code LIKE '%PERMISSION%'
         OR code LIKE '%ERROR%'
         OR code LIKE '%BATCH%'
         OR code LIKE '%role_a%'
         OR code LIKE '%role_b%'
         OR code LIKE '%role_c%'
         OR code IN ('123', '1', 'test_code', 'test_role')
         OR code LIKE '%xss%'
         OR code LIKE '%passwd%'
         OR code LIKE '%emoji%'
         OR code = ''
      ORDER BY id ASC
    `) as any[];

    console.log(`📊 找到 ${testRoles.length} 个测试角色\n`);

    if (testRoles.length === 0) {
      console.log('✅ 没有测试角色需要清理');
      return;
    }

    // 显示要删除的角色
    console.log('要删除的角色:');
    testRoles.slice(0, 10).forEach((role: any, i: number) => {
      console.log(`  ${i + 1}. ${role.code} (ID: ${role.id})`);
    });
    if (testRoles.length > 10) {
      console.log(`  ... 还有 ${testRoles.length - 10} 个`);
    }

    // 删除测试角色的权限关联
    const roleIds = testRoles.map((r: any) => r.id);
    const placeholders = roleIds.map(() => '?').join(',');

    const [deletePerms] = await sequelize.query(`
      DELETE FROM role_permissions
      WHERE role_id IN (${placeholders})
    `, { replacements: roleIds }) as any[];

    console.log(`\n✅ 删除了 ${deletePerms.affectedRows} 条权限关联`);

    // 删除测试角色
    const [deleteRoles] = await sequelize.query(`
      DELETE FROM roles
      WHERE id IN (${placeholders})
    `, { replacements: roleIds }) as any[];

    console.log(`✅ 删除了 ${deleteRoles.affectedRows} 个测试角色`);

    console.log(`\n📊 清理完成:`);
    console.log(`  ✅ 删除权限关联: ${deletePerms.affectedRows}条`);
    console.log(`  ✅ 删除测试角色: ${deleteRoles.affectedRows}个`);

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await sequelize.close();
  }
}

cleanupTestRoles();

