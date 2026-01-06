const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function findNotificationCenter() {
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
    console.log('🔍 查找通知中心权限');
    console.log('='.repeat(70) + '\n');

    // 查找所有可能的通知中心权限
    const [permissions] = await connection.execute(`
      SELECT id, name, chinese_name, code, path, type
      FROM permissions
      WHERE (
        name LIKE '%Notification%' OR
        chinese_name LIKE '%通知%' OR
        code LIKE '%NOTIFICATION%' OR
        code LIKE '%notification%' OR
        path LIKE '%notification%'
      )
      AND type = 'category'
      ORDER BY path
    `);

    console.log(`找到 ${permissions.length} 个通知相关权限:\n`);
    permissions.forEach((perm, index) => {
      console.log(`${index + 1}. ${perm.chinese_name || perm.name}`);
      console.log(`   ID: ${perm.id}`);
      console.log(`   代码: ${perm.code}`);
      console.log(`   路径: ${perm.path}`);
      console.log(`   类型: ${perm.type}\n`);
    });

    // 检查园长是否已有这些权限
    if (permissions.length > 0) {
      console.log('=' .repeat(70));
      console.log('检查园长是否已有这些权限:\n');
      
      for (const perm of permissions) {
        const [existing] = await connection.execute(`
          SELECT id FROM role_permissions 
          WHERE role_id = 2 AND permission_id = ?
        `, [perm.id]);
        
        const status = existing.length > 0 ? '✅ 已有' : '❌ 没有';
        console.log(`${status} - ${perm.chinese_name || perm.name} (ID: ${perm.id})`);
      }
    }

    console.log('\n' + '=' .repeat(70));

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

findNotificationCenter();
