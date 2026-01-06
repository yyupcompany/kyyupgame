const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function checkRolePermissions() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('\n📋 检查角色权限:\n');
    
    // 查找园长角色(ID: 2)的系统中心权限
    const [principalPerms] = await connection.execute(`
      SELECT 
        rp.id AS role_permission_id,
        p.id AS permission_id,
        p.name,
        p.chinese_name,
        p.code,
        p.path,
        p.type
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = 2
      AND (
        p.name LIKE '%System Center%'
        OR p.chinese_name LIKE '%系统中心%'
        OR p.code LIKE '%SYSTEM_CENTER%'
        OR p.code LIKE '%system_center%'
      )
    `);
    
    console.log('园长角色(ID: 2)的系统中心权限:\n');
    if (principalPerms.length === 0) {
      console.log('   ✅ 没有系统中心权限\n');
    } else {
      console.log(`   ⚠️  有 ${principalPerms.length} 个系统中心权限:\n`);
      principalPerms.forEach((perm, index) => {
        console.log(`   ${index + 1}. ${perm.chinese_name || perm.name}`);
        console.log(`      权限ID: ${perm.permission_id}`);
        console.log(`      代码: ${perm.code}`);
        console.log(`      路径: ${perm.path || '-'}`);
        console.log(`      类型: ${perm.type}`);
        console.log(`      关联ID: ${perm.role_permission_id}\n`);
      });
    }
    
    // 查找admin角色(ID: 1)的系统中心权限
    const [adminPerms] = await connection.execute(`
      SELECT 
        rp.id AS role_permission_id,
        p.id AS permission_id,
        p.name,
        p.chinese_name,
        p.code
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = 1
      AND (
        p.name LIKE '%System Center%'
        OR p.chinese_name LIKE '%系统中心%'
        OR p.code LIKE '%SYSTEM_CENTER%'
      )
    `);
    
    console.log('管理员角色(ID: 1)的系统中心权限:\n');
    if (adminPerms.length === 0) {
      console.log('   ⚠️  没有系统中心权限\n');
    } else {
      console.log(`   ✅ 有 ${adminPerms.length} 个系统中心权限\n`);
    }
    
    // 统计两个角色的总权限数
    const [counts] = await connection.execute(`
      SELECT 
        r.id,
        r.name,
        r.code,
        COUNT(rp.id) AS permission_count
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      WHERE r.id IN (1, 2)
      GROUP BY r.id, r.name, r.code
    `);
    
    console.log('角色权限总数对比:\n');
    console.log('| 角色ID | 角色名称 | 角色代码 | 权限数量 |');
    console.log('|--------|----------|----------|----------|');
    counts.forEach(c => {
      console.log(`| ${c.id} | ${c.name} | ${c.code} | ${c.permission_count} |`);
    });
    console.log('\n');

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkRolePermissions();
