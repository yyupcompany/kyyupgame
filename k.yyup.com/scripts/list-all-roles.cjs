const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function listAllRoles() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('\n📋 数据库中的所有角色:\n');
    
    const [roles] = await connection.execute('SELECT * FROM roles ORDER BY id');
    
    console.log('| ID | 角色名称 | 描述 |');
    console.log('|----|----------|------|');
    roles.forEach(role => {
      console.log(`| ${role.id} | ${role.name} | ${role.description || '-'} |`);
    });
    
    console.log(`\n总计: ${roles.length} 个角色\n`);

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

listAllRoles();
