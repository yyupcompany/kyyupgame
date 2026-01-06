/**
 * 检查中心的中文名称字段
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkChineseNames() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ 数据库连接成功\n');

    // 查询所有活跃的中心
    const [centers] = await connection.execute(`
      SELECT id, name, chinese_name, code, status 
      FROM permissions 
      WHERE type='category' AND parent_id IS NULL AND status=1
      ORDER BY sort
    `);

    console.log(`📋 找到 ${centers.length} 个活跃的中心：\n`);
    console.table(centers);

    // 找出chinese_name为NULL的中心
    const nullChineseNames = centers.filter(c => !c.chinese_name);
    
    if (nullChineseNames.length > 0) {
      console.log(`\n⚠️  发现 ${nullChineseNames.length} 个中心的chinese_name为NULL：\n`);
      console.table(nullChineseNames);
    } else {
      console.log('\n✅ 所有中心都有chinese_name字段');
    }

    // 找出包含英文字符的chinese_name
    const englishChineseNames = centers.filter(c => 
      c.chinese_name && /[A-Za-z]/.test(c.chinese_name)
    );
    
    if (englishChineseNames.length > 0) {
      console.log(`\n⚠️  发现 ${englishChineseNames.length} 个中心的chinese_name包含英文字符：\n`);
      console.table(englishChineseNames);
    } else {
      console.log('\n✅ 所有chinese_name都是纯中文');
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

checkChineseNames().catch(console.error);

