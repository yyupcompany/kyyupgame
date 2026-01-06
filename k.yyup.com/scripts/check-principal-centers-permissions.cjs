const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function checkPrincipalCentersPermissions() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('\n' + '='.repeat(70));
    console.log('🔍 检查园长角色的 /centers/* 权限');
    console.log('='.repeat(70) + '\n');

    // 查询园长角色的所有 /centers/* 权限
    const [principalCenters] = await connection.execute(`
      SELECT 
        p.id,
        p.name,
        p.chinese_name,
        p.code,
        p.path,
        p.type
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = 2
      AND p.path LIKE '/centers/%'
      AND p.type = 'category'
      ORDER BY p.sort, p.id
    `);

    console.log(`园长角色的 /centers/* 权限 (${principalCenters.length}个):\n`);
    principalCenters.forEach((perm, index) => {
      console.log(`${index + 1}. ${perm.chinese_name || perm.name}`);
      console.log(`   路径: ${perm.path}`);
      console.log(`   代码: ${perm.code}`);
      console.log(`   ID: ${perm.id}\n`);
    });

    // 查询园长角色的所有 /teacher-center/* 权限
    const [principalTeacher] = await connection.execute(`
      SELECT 
        p.id,
        p.name,
        p.chinese_name,
        p.code,
        p.path,
        p.type
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = 2
      AND p.path LIKE '/teacher-center/%'
      AND p.type = 'category'
      ORDER BY p.sort, p.id
    `);

    console.log('=' .repeat(70));
    console.log(`园长角色的 /teacher-center/* 权限 (${principalTeacher.length}个):\n`);
    
    if (principalTeacher.length === 0) {
      console.log('   ✅ 无教师层权限 (正确)\n');
    } else {
      console.log('   ⚠️  有教师层权限 (应删除):\n');
      principalTeacher.forEach((perm, index) => {
        console.log(`${index + 1}. ${perm.chinese_name || perm.name}`);
        console.log(`   路径: ${perm.path}`);
        console.log(`   代码: ${perm.code}`);
        console.log(`   ID: ${perm.id}\n`);
      });
    }

    // 对比admin的 /centers/* 权限
    const [adminCenters] = await connection.execute(`
      SELECT 
        p.id,
        p.name,
        p.chinese_name,
        p.code,
        p.path
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = 1
      AND p.path LIKE '/centers/%'
      AND p.type = 'category'
      ORDER BY p.sort, p.id
    `);

    console.log('=' .repeat(70));
    console.log('📊 对比分析:\n');
    console.log(`  管理员 /centers/* : ${adminCenters.length}个`);
    console.log(`  园长 /centers/* : ${principalCenters.length}个`);
    console.log(`  差异: ${adminCenters.length - principalCenters.length}个\n`);

    // 找出园长缺少的 /centers/* 权限
    const principalIds = new Set(principalCenters.map(p => p.id));
    const missing = adminCenters.filter(p => !principalIds.has(p.id));

    if (missing.length > 0) {
      console.log('园长缺少的 /centers/* 权限:\n');
      missing.forEach((perm, index) => {
        console.log(`${index + 1}. ${perm.chinese_name || perm.name}`);
        console.log(`   路径: ${perm.path}`);
        console.log(`   代码: ${perm.code}`);
        console.log(`   ID: ${perm.id}\n`);
      });
    }

    console.log('=' .repeat(70));

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkPrincipalCentersPermissions();
