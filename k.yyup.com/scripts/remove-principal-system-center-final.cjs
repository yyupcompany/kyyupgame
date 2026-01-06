const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function removePrincipalSystemCenter() {
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
    console.log('🔧 删除园长角色的系统中心权限');
    console.log('='.repeat(70) + '\n');

    // 删除权限关联
    const [result] = await connection.execute(`
      DELETE FROM role_permissions 
      WHERE id = 4649
    `);

    console.log(`✅ 删除成功！影响行数: ${result.affectedRows}\n`);

    // 验证
    const [check] = await connection.execute(`
      SELECT COUNT(*) AS count
      FROM role_permissions
      WHERE role_id = 2 AND permission_id = 2013
    `);

    if (check[0].count === 0) {
      console.log('✅ 验证成功！园长角色已无系统中心权限\n');
    } else {
      console.log(`⚠️  验证失败！仍有 ${check[0].count} 个系统中心权限\n`);
    }

    // 统计
    const [counts] = await connection.execute(`
      SELECT COUNT(*) AS count
      FROM role_permissions
      WHERE role_id = 2
    `);

    console.log(`📊 园长角色剩余权限数: ${counts[0].count}个\n`);
    console.log('=' .repeat(70));

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

removePrincipalSystemCenter();
