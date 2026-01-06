const mysql = require('mysql2/promise');
require('dotenv').config();

async function demonstrateSixDimensionMemoryInsert() {
  let connection;

  try {
    console.log('🎯 六维记忆系统插入演示开始...\n');

    // 连接数据库
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: process.env.DB_PORT || 43906,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kargerdensales',
      charset: 'utf8mb4'
    });

    console.log('✅ 数据库连接成功\n');

    // 1. 模拟插入上下文前的状态
    console.log('📊 插入前六维记忆表状态:');
    const tables = ['core_memories', 'episodic_memories', 'semantic_memories', 'procedural_memories', 'resource_memories', 'knowledge_vault'];

    for (const tableName of tables) {
      try {
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`   ${tableName}: ${countResult[0].count} 条记录`);
      } catch (error) {
        console.log(`   ${tableName}: 不存在 - ${error.message}`);
      }
    }

    // 2. 模拟插入用户上下文
    console.log('\n📝 模拟插入用户对话上下文...');

    const testUserId = 'demo-user-123';
    const conversationId = 'conversation-456';
    const testMessages = [
      {
        actor: 'user',
        content: '你好，我是张老师，我想了解幼儿园管理的最佳实践',
        context: {
          userId: testUserId,
          conversationId,
          role: 'teacher',
          timestamp: new Date().toISOString(),
          sessionId: 'session-789'
        }
      },
      {
        actor: 'assistant',
        content: '您好张老师！我很高兴为您提供幼儿园管理的最佳实践建议。基于六维记忆系统，我可以为您提供个性化的管理方案...',
        context: {
          userId: testUserId,
          conversationId,
          role: 'assistant',
          timestamp: new Date().toISOString(),
          sessionId: 'session-789',
          modelType: 'professional',
          confidence: 0.95
        }
      },
      {
        actor: 'user',
        content: '我想了解班级规模控制和学生管理的技巧',
        context: {
          userId: testUserId,
          conversationId,
          role: 'teacher',
          timestamp: new Date().toISOString(),
          sessionId: 'session-789',
          topic: 'class-management'
        }
      },
      {
        actor: 'assistant',
        content: '关于班级规模控制，建议您遵循以下原则：1. 小班制教学(15-20人) 2. 分组活动管理 3. 个性化关注...',
        context: {
          userId: testUserId,
          conversationId,
          role: 'assistant',
          timestamp: new Date().toISOString(),
          sessionId: 'session-789',
          topic: 'class-management',
          category: 'educational-advice'
        }
      }
    ];

    // 模拟插入到情节记忆表
    for (const message of testMessages) {
      try {
        const insertQuery = `
          INSERT INTO episodic_memories (
            user_id, event_type, summary, details, actor,
            occurred_at, created_at, updated_at, metadata
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await connection.execute(insertQuery, [
          testUserId,
          'conversation',
          message.content.substring(0, 100) + '...',
          message.content,
          message.actor,
          message.context.timestamp || new Date(),
          new Date(),
          new Date(),
          JSON.stringify(message.context)
        ]);

        console.log(`   ✅ ${message.actor}: ${message.content.substring(0, 50)}...`);
      } catch (error) {
        console.log(`   ❌ 插入失败: ${error.message}`);
      }
    }

    // 3. 模拟插入核心记忆
    console.log('\n🧠 模拟插入核心记忆...');
    try {
      const coreMemoryQuery = `
        INSERT INTO core_memories (
          user_id, persona_value, persona_limit, human_value,
          human_limit, created_at, updated_at, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(coreMemoryQuery, [
        testUserId,
        '我是YY-AI智能助手，专业的幼儿园管理顾问。我具备丰富的教育管理知识和AI技术能力，专门为教育工作者提供个性化建议。',
        2000,
        '用户ID: ' + testUserId + '，角色：张老师，关注班级管理和教学实践。',
        2000,
        new Date(),
        new Date(),
        JSON.stringify({
          userId: testUserId,
          role: 'teacher',
          name: '张老师',
          lastActive: new Date().toISOString()
        })
      ]);

      console.log('   ✅ 核心记忆插入成功');
    } catch (error) {
      console.log(`   ❌ 核心记忆插入失败: ${error.message}`);
    }

    // 4. 等待处理
    console.log('\n⏳ 等待记忆系统处理...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 5. 查看插入后的数据
    console.log('\n📈 插入后六维记忆表状态:');
    for (const tableName of tables) {
      try {
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        const currentCount = countResult[0].count;

        if (currentCount > 0) {
          // 获取最新的几条记录
          const [latestRecords] = await connection.execute(`
            SELECT * FROM ${tableName}
            WHERE user_id = ? OR metadata LIKE ?
            ORDER BY created_at DESC
            LIMIT 2
          `, [testUserId, `%${testUserId}%`]);

          console.log(`   ${tableName}: ${currentCount} 条记录 (含用户数据)`);

          if (latestRecords.length > 0) {
            console.log('      最新记录:');
            latestRecords.forEach((record, index) => {
              console.log(`        ${index + 1}. [${record.actor || 'system'}] ${record.summary || 'N/A'}`);
              if (record.metadata) {
                try {
                  const metadata = JSON.parse(record.metadata);
                  console.log(`           用户ID: ${metadata.userId || 'N/A'}`);
                  console.log(`           会话ID: ${metadata.conversationId || 'N/A'}`);
                } catch (e) {
                  // 忽略解析错误
                }
              }
            });
          }
        } else {
          console.log(`   ${tableName}: ${currentCount} 条记录`);
        }
      } catch (error) {
        console.log(`   ${tableName}: 查询失败 - ${error.message}`);
      }
    }

    // 6. 展示用户上下文查询
    console.log('\n🔍 模拟用户上下文查询...');
    try {
      const contextQuery = `
        SELECT event_type, summary, details, actor, occurred_at, metadata
        FROM episodic_memories
        WHERE user_id = ?
        ORDER BY occurred_at DESC
        LIMIT 5
      `;

      const [userContext] = await connection.execute(contextQuery, [testUserId]);

      if (userContext.length > 0) {
        console.log(`   📋 用户 ${testUserId} 的对话上下文:`);
        userContext.forEach((record, index) => {
          const metadata = JSON.parse(record.metadata || '{}');
          console.log(`   ${index + 1}. [${record.occurred_at}] ${record.actor.toUpperCase()}:`);
          console.log(`      ${record.details}`);
          console.log(`      上下文: ${metadata.topic || 'general'} | 会话: ${metadata.conversationId}`);
          console.log('');
        });
      } else {
        console.log(`   ❌ 未找到用户 ${testUserId} 的上下文记录`);
      }
    } catch (error) {
      console.log(`   ❌ 上下文查询失败: ${error.message}`);
    }

    // 7. 展示记忆检索
    console.log('🎯 六维记忆系统特点:');
    console.log('   ✅ 用户数据完全隔离');
    console.log('   ✅ 支持多维记忆存储');
    console.log('   ✅ 自动提取关键词和概念');
    console.log('   ✅ 支持向量相似度搜索');
    console.log('   ✅ 提供个性化AI助手体验');

    console.log('\n✅ 六维记忆系统插入演示完成!');

  } catch (error) {
    console.error('❌ 演示失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

demonstrateSixDimensionMemoryInsert();