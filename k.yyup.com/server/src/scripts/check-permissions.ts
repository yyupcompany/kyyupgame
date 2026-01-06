/**
 * 检查数据库中的权限
 */

import { sequelize } from '../init';

async function checkPermissions() {
  try {
    console.log('检查数据库中的权限...');

    const [customerResults] = await sequelize.query(`
      SELECT code, name FROM permissions WHERE code LIKE '%CUSTOMER%' ORDER BY code
    `);
    console.log('数据库中的客户池相关权限:');
    (customerResults as any[]).forEach(perm => console.log(`  - ${perm.code}: ${perm.name}`));

    const [manageResults] = await sequelize.query(`
      SELECT code, name FROM permissions WHERE code LIKE '%MANAGE%' ORDER BY code
    `);
    console.log('\n数据库中的MANAGE权限:');
    (manageResults as any[]).forEach(perm => console.log(`  - ${perm.code}: ${perm.name}`));

    // 查看所有权限代码模式
    const [allResults] = await sequelize.query(`
      SELECT code, name FROM permissions WHERE code LIKE '%POOL%' ORDER BY code
    `);
    console.log('\n数据库中包含POOL的权限:');
    (allResults as any[]).forEach(perm => console.log(`  - ${perm.code}: ${perm.name}`));

    await sequelize.close();
  } catch (error) {
    console.error('❌ 查询权限失败:', error);
    throw error;
  }
}

checkPermissions();