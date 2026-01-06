const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSixDimensionalMemoryData() {
  let connection;

  try {
    console.log('🔗 连接远端MySQL数据库...');

    // 连接远端数据库
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: process.env.DB_PORT || 43906,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kargerdensales',
      charset: 'utf8mb4'
    });

    console.log('✅ 数据库连接成功');

    // 1. 检查所有AI相关表
    console.log('\n📊 检查AI相关表的数据...');

    const aiTables = [
      'ai_conversations',
      'ai_messages',
      'ai_model_configs',
      'ai_model_usage',
      'ai_feedback',
      'ai_user_permissions',
      'ai_query_history',
      'ai_tool_calls',
      'ai_memory_vectors'
    ];

    for (const tableName of aiTables) {
      try {
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        const count = countResult[0].count;
        console.log(`📋 ${tableName}: ${count} 条记录`);

        if (count > 0) {
          const [sampleData] = await connection.execute(`
            SELECT * FROM ${tableName}
            ORDER BY created_at DESC, id DESC
            LIMIT 3
          `);
          console.log(`   📝 最新3条记录:`);
          sampleData.forEach((row, index) => {
            console.log(`   ${index + 1}. ${JSON.stringify(row, null, 4)}`);
          });
        }
      } catch (error) {
        console.log(`❌ ${tableName}: 表不存在或查询失败 - ${error.message}`);
      }
    }

    // 2. 检查六维记忆系统表（如果存在的话）
    console.log('\n🧠 检查六维记忆系统表...');

    const memoryTables = [
      'user_memories',
      'conversation_memories',
      'knowledge_memories',
      'context_memories',
      'emotion_memories',
      'preference_memories',
      'pattern_memories',
      'memory_embeddings',
      'memory_search_index'
    ];

    for (const tableName of memoryTables) {
      try {
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        const count = countResult[0].count;
        console.log(`🧠 ${tableName}: ${count} 条记录`);

        if (count > 0 && count <= 5) {
          const [sampleData] = await connection.execute(`
            SELECT * FROM ${tableName}
            ORDER BY created_at DESC, id DESC
            LIMIT 2
          `);
          console.log(`   📝 最新2条记录:`);
          sampleData.forEach((row, index) => {
            console.log(`   ${index + 1}. ${JSON.stringify(row, null, 3)}`);
          });
        } else if (count > 5) {
          console.log(`   📊 数据较多，显示概览...`);
          const [structure] = await connection.execute(`DESCRIBE ${tableName}`);
          console.log(`   📋 表字段: ${structure.map(row => row.Field).join(', ')}`);
        }
      } catch (error) {
        console.log(`❌ ${tableName}: 表不存在或查询失败 - ${error.message}`);
      }
    }

    // 3. 检查是否有其他的记忆或AI相关表
    console.log('\n🔍 搜索所有包含ai、memory、conversation关键词的表...');

    const [allTables] = await connection.execute(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND (table_name LIKE '%ai%'
           OR table_name LIKE '%memory%'
           OR table_name LIKE '%conversation%'
           OR table_name LIKE '%chat%'
           OR table_name LIKE '%message%')
      ORDER BY table_name
    `);

    console.log(`📋 找到 ${allTables.length} 个相关表:`);
    allTables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    // 4. 统计总数据量
    console.log('\n📈 数据统计汇总:');
    let totalAiRecords = 0;
    let totalMemoryRecords = 0;

    for (const tableName of aiTables) {
      try {
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        totalAiRecords += countResult[0].count;
      } catch (error) {
        // 忽略不存在的表
      }
    }

    for (const tableName of memoryTables) {
      try {
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        totalMemoryRecords += countResult[0].count;
      } catch (error) {
        // 忽略不存在的表
      }
    }

    console.log(`🤖 AI相关表总记录数: ${totalAiRecords}`);
    console.log(`🧠 记忆相关表总记录数: ${totalMemoryRecords}`);
    console.log(`📊 总计: ${totalAiRecords + totalMemoryRecords} 条记录`);

    console.log('\n✅ 六维记忆系统数据检查完成!');

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkSixDimensionalMemoryData();