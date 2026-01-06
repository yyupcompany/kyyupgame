const mysql = require('mysql2/promise');
require('dotenv').config();

async function testSixDimensionMemoryActivation() {
  let connection;

  try {
    console.log('🧠 测试六维记忆系统激活状态...');

    // 连接数据库
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: process.env.DB_PORT || 43906,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kargerdensales',
      charset: 'utf8mb4'
    });

    console.log('✅ 数据库连接成功');

    // 1. 检查激活前的六维记忆表数据
    console.log('\n📊 检查六维记忆表激活前状态...');

    const sixDimensionTables = [
      'core_memories',
      'episodic_memories',
      'semantic_memories',
      'procedural_memories',
      'resource_memories',
      'knowledge_vault'
    ];

    const beforeCounts = {};
    for (const tableName of sixDimensionTables) {
      try {
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        beforeCounts[tableName] = countResult[0].count;
        console.log(`📋 ${tableName}: ${beforeCounts[tableName]} 条记录`);
      } catch (error) {
        console.log(`❌ ${tableName}: 表不存在 - ${error.message}`);
        beforeCounts[tableName] = 0;
      }
    }

    // 2. 测试六维记忆API端点
    console.log('\n🔍 测试六维记忆API端点...');

    const baseUrl = 'http://localhost:3000';
    const apiEndpoints = [
      '/api/ai/memory/stats',
      '/api/ai/memory/context',
      '/api/ai/memory/core/default'
    ];

    for (const endpoint of apiEndpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${endpoint}: ${data.success ? '正常' : '异常'} - ${data.message || ''}`);
        } else {
          console.log(`⚠️ ${endpoint}: HTTP ${response.status} - ${response.statusText}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint}: 连接失败 - ${error.message}`);
      }
    }

    // 3. 模拟AI对话测试六维记忆记录功能
    console.log('\n🎯 测试AI对话记忆记录功能...');

    try {
      const testMessage = {
        conversationId: 'test-conversation-' + Date.now(),
        userId: 1,
        content: '你好，这是一个测试消息，用于验证六维记忆系统是否正常工作。'
      };

      const response = await fetch(`${baseUrl}/api/ai/message/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(testMessage)
      });

      if (response.ok) {
        console.log('✅ AI对话消息发送成功');
      } else {
        console.log(`⚠️ AI对话消息发送失败: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ AI对话测试失败: ${error.message}`);
    }

    // 4. 等待2秒让六维记忆系统处理
    console.log('\n⏳ 等待六维记忆系统处理...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. 检查激活后的数据变化
    console.log('\n📈 检查六维记忆表激活后状态...');

    const afterCounts = {};
    let totalNewRecords = 0;

    for (const tableName of sixDimensionTables) {
      try {
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        afterCounts[tableName] = countResult[0].count;
        const newRecords = afterCounts[tableName] - beforeCounts[tableName];
        totalNewRecords += newRecords;

        if (newRecords > 0) {
          console.log(`📈 ${tableName}: ${beforeCounts[tableName]} → ${afterCounts[tableName]} (+${newRecords} 条新记录)`);
        } else {
          console.log(`📋 ${tableName}: ${beforeCounts[tableName]} → ${afterCounts[tableName]} (无变化)`);
        }
      } catch (error) {
        console.log(`❌ ${tableName}: 查询失败 - ${error.message}`);
      }
    }

    // 6. 测试结果总结
    console.log('\n🎯 六维记忆系统激活测试结果:');
    console.log(`📊 总新记录数: ${totalNewRecords}`);

    if (totalNewRecords > 0) {
      console.log('✅ 六维记忆系统已激活并正常工作！');
      console.log('🧠 AI对话现在会被记录到六维记忆系统中');
    } else {
      console.log('⚠️ 六维记忆系统可能未完全激活');
      console.log('💡 建议检查后端服务日志以确认六维记忆系统状态');
    }

    // 7. 检查最近的记忆记录
    if (totalNewRecords > 0) {
      console.log('\n🔍 查看最新的记忆记录...');

      try {
        const [recentMemories] = await connection.execute(`
          SELECT user_id, event_type, summary, occurred_at
          FROM episodic_memories
          ORDER BY created_at DESC
          LIMIT 3
        `);

        if (recentMemories.length > 0) {
          console.log('📝 最新的情节记忆记录:');
          recentMemories.forEach((memory, index) => {
            console.log(`  ${index + 1}. [${memory.user_id}] ${memory.event_type}: ${memory.summary.substring(0, 50)}... (${memory.occurred_at})`);
          });
        }
      } catch (error) {
        console.log('❌ 查询最新记忆记录失败:', error.message);
      }
    }

    console.log('\n✅ 六维记忆系统激活测试完成!');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testSixDimensionMemoryActivation();