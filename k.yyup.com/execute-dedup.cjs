const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

async function executeDedupSQL() {
  console.log('=== 执行permissions表去重脚本 ===\n');
  
  let connection;
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: process.env.DB_PORT || 43906,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'kargerdensales',
      multipleStatements: true // 允许执行多条SQL语句
    });

    console.log('✅ 数据库连接成功\n');

    // 读取SQL文件
    const sqlContent = await fs.readFile(path.join(__dirname, 'safe-permissions-dedup.sql'), 'utf8');
    
    // 分割SQL语句（按分号分割，但忽略注释中的分号）
    const statements = sqlContent
      .split(/;(?=(?:[^']*'[^']*')*[^']*$)/)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));

    console.log(`📋 准备执行 ${statements.length} 条SQL语句\n`);

    // 逐条执行SQL语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // 跳过纯注释语句
      if (statement.startsWith('--') || statement.startsWith('/*')) {
        continue;
      }
      
      // 显示正在执行的语句类型
      let stmtType = 'UNKNOWN';
      if (statement.toUpperCase().startsWith('CREATE TABLE')) stmtType = 'CREATE TABLE';
      else if (statement.toUpperCase().startsWith('START TRANSACTION')) stmtType = 'START TRANSACTION';
      else if (statement.toUpperCase().startsWith('DELETE')) stmtType = 'DELETE';
      else if (statement.toUpperCase().startsWith('UPDATE')) stmtType = 'UPDATE';
      else if (statement.toUpperCase().startsWith('SELECT')) stmtType = 'SELECT';
      else if (statement.toUpperCase().startsWith('COMMIT')) stmtType = 'COMMIT';
      
      console.log(`执行 ${i + 1}/${statements.length}: ${stmtType}...`);
      
      try {
        const [results] = await connection.execute(statement);
        
        // 如果是SELECT语句，显示结果
        if (stmtType === 'SELECT' && Array.isArray(results)) {
          console.table(results);
        } else if (results && results.affectedRows !== undefined) {
          console.log(`   影响行数: ${results.affectedRows}`);
        }
      } catch (err) {
        console.error(`   ❌ 错误: ${err.message}`);
        // 如果出错，回滚事务
        if (i > 2) { // 已经开始事务
          console.log('   执行回滚...');
          await connection.execute('ROLLBACK');
          throw err;
        }
      }
    }
    
    console.log('\n✅ 所有SQL语句执行完成！\n');
    
    // 执行最终验证查询
    console.log('📊 最终验证结果:\n');
    
    // 统计结果
    const [permCount] = await connection.execute('SELECT COUNT(*) as count FROM permissions');
    console.log(`当前权限总数: ${permCount[0].count}`);
    
    const [rolePermCount] = await connection.execute('SELECT COUNT(*) as count FROM role_permissions');
    console.log(`角色权限关联数: ${rolePermCount[0].count}`);
    
    // 检查重复
    const [pathDup] = await connection.execute(`
      SELECT COUNT(*) as count FROM (
        SELECT path FROM permissions 
        WHERE path IS NOT NULL AND path != '' 
        GROUP BY path HAVING COUNT(*) > 1
      ) t
    `);
    console.log(`路径重复数: ${pathDup[0].count}`);
    
    const [nameDup] = await connection.execute(`
      SELECT COUNT(*) as count FROM (
        SELECT name FROM permissions 
        WHERE name IS NOT NULL 
        GROUP BY name HAVING COUNT(*) > 1
      ) t
    `);
    console.log(`名称重复数: ${nameDup[0].count}`);
    
    // 检查[已清理]记录
    const [cleanedCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM permissions 
      WHERE name LIKE '[已清理]%' OR name LIKE '[已清理-空]%'
    `);
    console.log(`[已清理]标记记录数: ${cleanedCount[0].count}`);

  } catch (error) {
    console.error('\n❌ 执行失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

// 运行脚本
executeDedupSQL();