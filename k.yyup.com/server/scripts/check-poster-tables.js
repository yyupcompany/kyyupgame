const mysql = require('mysql2/promise');

async function checkPosterTables() {
  let connection;
  
  try {
    // 连接到远程数据库
    connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'kargerdensales'
    });

    console.log('✅ 数据库连接成功');

    // 检查 poster_templates 表是否存在
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = 'kargerdensales'
      AND TABLE_NAME LIKE '%poster%'
    `);

    console.log('\n📋 海报相关表列表:');
    if (tables.length === 0) {
      console.log('❌ 没有找到海报相关的表');
    } else {
      tables.forEach(table => {
        console.log(`  - ${table.TABLE_NAME}`);
      });
    }

    // 如果 poster_templates 表存在，检查表结构
    const posterTemplatesExists = tables.some(table => table.TABLE_NAME === 'poster_templates');
    
    if (posterTemplatesExists) {
      console.log('\n📊 poster_templates 表结构:');
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'kargerdensales'
        AND TABLE_NAME = 'poster_templates'
        ORDER BY ORDINAL_POSITION
      `);

      columns.forEach(col => {
        console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} - ${col.COLUMN_COMMENT || '无注释'}`);
      });

      // 检查表中的数据
      const [rows] = await connection.execute('SELECT COUNT(*) as count FROM poster_templates');
      console.log(`\n📈 poster_templates 表数据量: ${rows[0].count} 条记录`);

      if (rows[0].count > 0) {
        const [sampleData] = await connection.execute('SELECT * FROM poster_templates LIMIT 3');
        console.log('\n📝 示例数据:');
        sampleData.forEach((row, index) => {
          console.log(`  ${index + 1}. ID: ${row.id}, 名称: ${row.name}, 分类: ${row.category}, 状态: ${row.status}`);
        });
      }
    }

    // 检查 poster_elements 表
    const posterElementsExists = tables.some(table => table.TABLE_NAME === 'poster_elements');
    
    if (posterElementsExists) {
      console.log('\n📊 poster_elements 表结构:');
      const [elemColumns] = await connection.execute(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'kargerdensales'
        AND TABLE_NAME = 'poster_elements'
        ORDER BY ORDINAL_POSITION
      `);

      elemColumns.forEach(col => {
        console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} - ${col.COLUMN_COMMENT || '无注释'}`);
      });

      const [elemRows] = await connection.execute('SELECT COUNT(*) as count FROM poster_elements');
      console.log(`\n📈 poster_elements 表数据量: ${elemRows[0].count} 条记录`);
    }

    // 检查相关的海报生成表
    const posterGenerationsExists = tables.some(table => table.TABLE_NAME === 'poster_generations');
    
    if (posterGenerationsExists) {
      const [genRows] = await connection.execute('SELECT COUNT(*) as count FROM poster_generations');
      console.log(`\n📈 poster_generations 表数据量: ${genRows[0].count} 条记录`);
    }

  } catch (error) {
    console.error('❌ 数据库操作失败:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 运行检查
if (require.main === module) {
  checkPosterTables()
    .then(() => {
      console.log('\n✅ 数据库检查完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ 检查失败:', error);
      process.exit(1);
    });
}

module.exports = { checkPosterTables };
