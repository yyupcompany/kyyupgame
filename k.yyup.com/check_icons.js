const mysql = require('mysql2/promise');

async function checkIcons() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Yyup@2024',
    database: process.env.DB_NAME || 'kindergarten_management'
  });

  try {
    const [rows] = await connection.query(`
      SELECT id, name, chinese_name, code, type, icon, sort
      FROM permissions
      WHERE type = 'category' AND parent_id IS NULL AND status = 1
      ORDER BY sort
    `);

    console.log('\n📋 所有一级菜单的icon字段值：\n');
    rows.forEach(row => {
      console.log(`ID: ${row.id}, 名称: ${row.chinese_name || row.name}, Icon: "${row.icon || '(空)'}"`);
    });
  } finally {
    await connection.end();
  }
}

checkIcons().catch(console.error);
