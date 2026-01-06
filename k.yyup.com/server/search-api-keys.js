/**
 * 搜索数据库中所有可能包含API密钥的表和字段
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function searchApiKeys() {
  let connection;

  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 搜索数据库中的API密钥');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kargerdensales',
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('✅ 数据库连接成功');

    // 查找所有表
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);

    console.log(`📊 找到 ${tableNames.length} 个表，开始搜索API密钥...`);

    let potentialApiKeys = [];

    for (const tableName of tableNames) {
      try {
        // 查找表结构
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);

        // 查找可能包含API密钥的字段
        const keyFields = columns.filter(col =>
          col.Field.toLowerCase().includes('key') ||
          col.Field.toLowerCase().includes('token') ||
          col.Field.toLowerCase().includes('secret') ||
          col.Field.toLowerCase().includes('api')
        );

        if (keyFields.length > 0) {
          console.log(`\n🔍 检查表: ${tableName}`);

          for (const field of keyFields) {
            try {
              const [rows] = await connection.execute(`
                SELECT ${field.Field} as fieldValue
                FROM ${tableName}
                WHERE ${field.Field} IS NOT NULL
                AND ${field.Field} != ''
                AND ${field.Field} NOT LIKE '%your-%-here%'
                AND LENGTH(${field.Field}) >= 20
                LIMIT 5
              `);

              if (rows.length > 0) {
                console.log(`  📋 字段 ${field.Field}: 找到 ${rows.length} 个可能的密钥`);

                rows.forEach((row, index) => {
                  const value = row.fieldValue;
                  const length = value.length;
                  const preview = length > 20 ?
                    value.substring(0, 8) + '...' + value.substring(length - 8) :
                    value;

                  // 检查格式
                  const startsWithArk = value.startsWith('ark-');
                  const isUuidFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
                  const isLongKey = length >= 30;

                  let format = '未知格式';
                  let isUsable = false;

                  if (startsWithArk) {
                    format = 'ark-格式';
                    isUsable = true;
                  } else if (isUuidFormat) {
                    format = 'UUID格式';
                    isUsable = true;
                  } else if (isLongKey) {
                    format = '长密钥格式';
                    isUsable = true;
                  }

                  console.log(`    ${index + 1}. ${preview} (${format}, ${length}字符)`);

                  if (isUsable) {
                    potentialApiKeys.push({
                      table: tableName,
                      field: field.Field,
                      value: value,
                      format: format,
                      length: length,
                      preview: preview
                    });
                  }
                });
              }
            } catch (err) {
              console.log(`  ⚠️ 查询字段 ${field.Field} 失败: ${err.message}`);
            }
          }
        }
      } catch (err) {
        console.log(`⚠️ 检查表 ${tableName} 失败: ${err.message}`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 API密钥搜索结果:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (potentialApiKeys.length > 0) {
      console.log(`✅ 找到 ${potentialApiKeys.length} 个可用的API密钥:`);

      potentialApiKeys.forEach((key, index) => {
        console.log(`\n${index + 1}. 表: ${key.table}.${key.field}`);
        console.log(`   格式: ${key.format}`);
        console.log(`   长度: ${key.length}`);
        console.log(`   预览: ${key.preview}`);
        console.log(`   完整值: ${key.value}`);
      });

      console.log('\n💡 建议操作:');
      console.log('可以使用以上找到的API密钥更新doubao flash模型配置');

      if (potentialApiKeys.length > 0) {
        const firstKey = potentialApiKeys[0];
        console.log('\n📝 更新SQL语句:');
        console.log(`UPDATE ai_model_configs`);
        console.log(`SET apiKey = '${firstKey.value}'`);
        console.log(`WHERE name = 'doubao-seed-1-6-flash-250715';`);
      }

    } else {
      console.log('❌ 未找到可用的API密钥');
      console.log('💡 建议:');
      console.log('1. 检查是否有其他表包含API密钥');
      console.log('2. 或者需要手动添加有效的豆包API密钥');
    }

  } catch (error) {
    console.error('❌ 搜索失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行搜索
if (require.main === module) {
  searchApiKeys();
}

module.exports = { searchApiKeys };