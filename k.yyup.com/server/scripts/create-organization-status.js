const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function createOrganizationStatusTable() {
  let connection;
  
  try {
    // 创建数据库连接（使用.env配置）
    connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'kargerdensales',
      multipleStatements: true
    });

    console.log('✅ 数据库连接成功');

    // 读取SQL文件
    const sqlFilePath = path.join(__dirname, 'create-organization-status-table.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📄 开始执行SQL脚本...');

    // 执行SQL
    const [results] = await connection.query(sql);

    console.log('✅ SQL脚本执行成功');
    console.log('📊 执行结果:', results);

    // 验证表是否创建成功
    const [tables] = await connection.query("SHOW TABLES LIKE 'organization_status'");
    if (tables.length > 0) {
      console.log('✅ organization_status 表创建成功');
    } else {
      console.log('❌ organization_status 表创建失败');
    }

    // 验证数据是否插入成功
    const [rows] = await connection.query('SELECT * FROM organization_status WHERE kindergarten_id = 1');
    if (rows.length > 0) {
      console.log('✅ 示例数据插入成功');
      console.log('📊 数据详情:', JSON.stringify(rows[0], null, 2));
    } else {
      console.log('❌ 示例数据插入失败');
    }

  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 执行脚本
createOrganizationStatusTable()
  .then(() => {
    console.log('🎉 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 脚本执行失败:', error);
    process.exit(1);
  });

