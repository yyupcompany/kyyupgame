const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });

  // 检查表是否存在
  const [tables] = await conn.execute(`
    SELECT TABLE_NAME 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = 'kargerdensales' 
    AND TABLE_NAME LIKE 'sop_%'
  `);

  console.log('SOP相关表：', tables.map(t => t.TABLE_NAME));

  // 如果表存在，检查数据
  if (tables.length > 0) {
    const [templates] = await conn.execute('SELECT * FROM sop_templates');
    console.log('模板数量：', templates.length);
    
    if (templates.length > 0) {
      const [nodes] = await conn.execute('SELECT * FROM sop_template_nodes');
      console.log('节点数量：', nodes.length);
    }
  }

  await conn.end();
})().catch(console.error);
