const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function checkUserRoles() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('\n📋 检查用户角色关联:\n');
    
    // 查找principal和admin用户
    const [users] = await connection.execute(`
      SELECT id, username, role, email 
      FROM users 
      WHERE username IN ('principal', 'admin')
      ORDER BY username
    `);
    
    console.log('用户信息:');
    console.log('| 用户ID | 用户名 | role字段 | 邮箱 |');
    console.log('|--------|--------|----------|------|');
    users.forEach(u => {
      console.log(`| ${u.id} | ${u.username} | ${u.role} | ${u.email || '-'} |`);
    });
    
    console.log('\n');
    
    // 查找用户的角色关联
    for (const user of users) {
      console.log(`\n📍 ${user.username} (ID: ${user.id}) 的角色关联:\n`);
      
      const [userRoles] = await connection.execute(`
        SELECT 
          ur.id AS user_role_id,
          r.id AS role_id,
          r.name AS role_name,
          r.code AS role_code,
          r.description
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ?
      `, [user.id]);
      
      if (userRoles.length === 0) {
        console.log('   ⚠️  没有角色关联（user_roles表中无记录）\n');
      } else {
        console.log('   角色列表:');
        userRoles.forEach((ur, index) => {
          console.log(`   ${index + 1}. ${ur.role_name} (code: ${ur.role_code || '-'})`);
          console.log(`      角色ID: ${ur.role_id}`);
          console.log(`      描述: ${ur.description || '-'}\n`);
        });
      }
    }

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkUserRoles();
