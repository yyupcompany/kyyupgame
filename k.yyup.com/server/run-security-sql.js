/**
 * 执行安全页面修复SQL脚本
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 数据库配置
const config = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  database: 'kargerdensales',
  user: 'root',
  password: 'Aa123456',
  multipleStatements: true
};

async function runSecuritySQL() {
  let connection;
  
  try {
    console.log('🔧 连接数据库...');
    connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功');

    // 读取SQL文件
    const sqlFilePath = path.join(__dirname, 'fix-security-simple.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📄 执行SQL脚本...');
    
    // 分割SQL语句并逐个执行
    const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          console.log(`执行语句 ${i + 1}/${statements.length}...`);
          await connection.execute(statement);
        } catch (error) {
          console.log(`⚠️  语句 ${i + 1} 执行失败 (可能已存在): ${error.message}`);
        }
      }
    }
    
    console.log('✅ SQL脚本执行完成');
    
    // 验证表是否创建成功
    console.log('🔍 验证表创建...');
    const [tables] = await connection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ? AND table_name LIKE 'security_%'
    `, [config.database]);
    
    console.log('📊 安全相关表:', tables.map(t => t.table_name));
    
    // 验证权限是否添加成功
    const [permissions] = await connection.execute(`
      SELECT name, chineseName FROM permissions WHERE name LIKE 'SECURITY_%'
    `);
    
    console.log('🔐 安全权限:', permissions);
    
  } catch (error) {
    console.error('❌ 执行失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 运行脚本
if (require.main === module) {
  runSecuritySQL();
}

module.exports = { runSecuritySQL };
