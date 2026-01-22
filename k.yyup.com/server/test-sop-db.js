const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });

  console.log('Connected to database');

  // 创建表
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS sop_templates (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      type ENUM('course', 'sales', 'activity') NOT NULL,
      description TEXT,
      icon VARCHAR(50),
      color VARCHAR(20) DEFAULT '#409EFF',
      is_system BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      sort_order INT DEFAULT 0,
      created_by INT,
      tenant_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_type (type),
      INDEX idx_tenant (tenant_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  console.log('Table sop_templates created');

  await connection.end();
  console.log('Done');
}

testConnection().catch(console.error);
