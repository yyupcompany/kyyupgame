const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function verifyPrincipalFinal() {
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
    console.log('✅ 验证园长角色的最终权限配置');
    console.log('='.repeat(70) + '\n');

    // 查询园长的所有 /centers/* 权限
    const [principalCenters] = await connection.execute(`
      SELECT 
        p.id,
        p.name,
        p.chinese_name,
        p.code,
        p.path
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = 2
      AND p.path LIKE '/centers/%'
      AND p.type = 'category'
      ORDER BY p.path
    `);

    console.log(`园长角色的 /centers/* 中心 (${principalCenters.length}个):\n`);
    
    const hasSystemCenter = principalCenters.some(p => p.code === 'SYSTEM_CENTER');
    
    principalCenters.forEach((perm, index) => {
      const icon = perm.code === 'SYSTEM_CENTER' ? '❌' : '✅';
      console.log(`${icon} ${index + 1}. ${perm.chinese_name || perm.name}`);
      console.log(`     路径: ${perm.path}`);
      console.log(`     代码: ${perm.code}\n`);
    });

    console.log('=' .repeat(70));
    console.log('🎯 验证结果:\n');
    console.log(`  系统中心 (System Center): ${hasSystemCenter ? '❌ 有 (错误)' : '✅ 无 (正确)'}`);
    console.log(`  /centers/* 总数: ${principalCenters.length}个`);
    console.log(`  预期数量: 10个 (管理员13个 - 系统中心 - 业务中心 - 督查中心)`);
    
    if (principalCenters.length === 10 && !hasSystemCenter) {
      console.log('\n  ✅ 权限配置正确！\n');
    } else {
      console.log('\n  ⚠️  权限配置需要调整\n');
    }

    console.log('=' .repeat(70));

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

verifyPrincipalFinal();
