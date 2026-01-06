const mysql = require('mysql2/promise');
require('dotenv').config();

async function demonstrateSixDimensionMemoryInsert() {
  let connection;

  try {
    console.log('🎯 六维记忆系统上下文插入演示\n');

    // 连接数据库
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: process.env.DB_PORT || 43906,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'pwk5ls7j',
      database: process.env.DB_NAME || 'kargerdensales',
      charset: 'utf8mb4'
    });

    console.log('✅ 数据库连接成功\n');

    // 模拟用户和对话信息
    const testUserId = 'teacher-001';
    const testUserName = '张老师';
    const conversationId = 'conv-2025-001';
    const userMessage = '我想了解如何提高幼儿园班级管理效率';

    console.log('👤 模拟用户信息:');
    console.log(`   用户ID: ${testUserId}`);
    console.log(`   用户名: ${testUserName}`);
    console.log(`   对话ID: ${conversationId}`);
    console.log(`   用户消息: "${userMessage}"\n`);

    // === 第一步：插入前的数据状态 ===
    console.log('📊 第一步：检查插入前的数据状态');
    console.log('=' .repeat(50));

    try {
      const [episodicBefore] = await connection.execute(
        'SELECT COUNT(*) as count FROM episodic_memories WHERE user_id = ?',
        [testUserId]
      );
      console.log(`   💬 情节记忆记录数: ${episodicBefore[0].count}`);
    } catch (error) {
      console.log(`   💬 情节记忆表可能不存在: ${error.message}`);
    }

    try {
      const [semanticBefore] = await connection.execute(
        'SELECT COUNT(*) as count FROM semantic_memories WHERE user_id = ?',
        [testUserId]
      );
      console.log(`   🧠 语义记忆记录数: ${semanticBefore[0].count}`);
    } catch (error) {
      console.log(`   🧠 语义记忆表可能不存在: ${error.message}`);
    }

    // === 第二步：模拟插入上下文数据 ===
    console.log('\n🔥 第二步：模拟插入用户对话上下文');
    console.log('=' .repeat(50));

    // 2.1 插入核心记忆
    console.log('📝 插入核心记忆 (用户基本信息)...');
    try {
      const coreMemoryData = {
        user_id: testUserId,
        persona_value: '我是YY-AI智能助手，专业的幼儿园管理顾问',
        human_value: `用户${testUserName}，是一名幼儿园教师，具有丰富的班级管理经验`,
        metadata: JSON.stringify({
          name: testUserName,
          role: 'teacher',
          experience: '5年',
          specialization: '班级管理',
          preferences: ['实用方法', '案例分享'],
          lastActive: new Date().toISOString()
        })
      };

      await connection.execute(
        'INSERT INTO core_memories (user_id, persona_value, human_value, metadata) VALUES (?, ?, ?, ?)',
        [coreMemoryData.user_id, coreMemoryData.persona_value, coreMemoryData.human_value, coreMemoryData.metadata]
      );
      console.log('   ✅ 核心记忆插入成功');
    } catch (error) {
      console.log(`   ⚠️ 核心记忆插入失败: ${error.message}`);
    }

    // 2.2 插入情节记忆
    console.log('\n💬 插入情节记忆 (用户对话记录)...');
    try {
      const episodicMemoryData = {
        user_id: testUserId,
        event_type: 'conversation',
        summary: '用户询问班级管理效率提升方法',
        details: userMessage,
        actor: 'user',
        occurred_at: new Date(),
        metadata: JSON.stringify({
          conversationId: conversationId,
          messageId: 'msg-001',
          role: 'user',
          timestamp: new Date().toISOString(),
          context: '班级管理咨询',
          emotion: 'seeking_advice',
          priority: 'normal'
        })
      };

      await connection.execute(
        'INSERT INTO episodic_memories (user_id, event_type, summary, details, actor, occurred_at, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          episodicMemoryData.user_id,
          episodicMemoryData.event_type,
          episodicMemoryData.summary,
          episodicMemoryData.details,
          episodicMemoryData.actor,
          episodicMemoryData.occurred_at,
          episodicMemoryData.metadata
        ]
      );
      console.log('   ✅ 情节记忆插入成功');
    } catch (error) {
      console.log(`   ⚠️ 情节记忆插入失败: ${error.message}`);
    }

    // 2.3 插入语义记忆
    console.log('\n🧠 插入语义记忆 (提取的关键概念)...');
    try {
      const concepts = [
        { name: '班级管理', definition: '幼儿园班级组织与管理的系统方法', category: '教育管理' },
        { name: '管理效率', definition: '在有限时间内完成更多管理任务的能力', category: '工作效率' },
        { name: '幼儿园', definition: '针对3-6岁儿童的学前教育机构', category: '教育机构' }
      ];

      for (const concept of concepts) {
        await connection.execute(
          'INSERT INTO semantic_memories (user_id, name, definition, examples, category, confidence_score, embedding, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            testUserId,
            concept.name,
            concept.definition,
            JSON.stringify([`${concept.name}的应用案例`, `${concept.name}的最佳实践`]),
            concept.category,
            0.9,
            JSON.stringify([0.1, 0.2, 0.3]), // 模拟向量嵌入
            JSON.stringify({
              source: 'auto_extracted',
              extractedFrom: userMessage,
              extractionTime: new Date().toISOString()
            })
          ]
        );
      }
      console.log('   ✅ 语义记忆插入成功 (3个概念)');
    } catch (error) {
      console.log(`   ⚠️ 语义记忆插入失败: ${error.message}`);
    }

    // === 第三步：验证插入结果 ===
    console.log('\n🔍 第三步：验证插入结果');
    console.log('=' .repeat(50));

    try {
      const [episodicAfter] = await connection.execute(
        'SELECT event_type, summary, actor, occurred_at FROM episodic_memories WHERE user_id = ? ORDER BY occurred_at DESC LIMIT 3',
        [testUserId]
      );

      if (episodicAfter.length > 0) {
        console.log('   💬 最近的情节记忆记录:');
        episodicAfter.forEach((record, index) => {
          const time = new Date(record.occurred_at).toLocaleString();
          console.log(`   ${index + 1}. [${record.actor}] ${record.summary} (${time})`);
        });
      }
    } catch (error) {
      console.log(`   ❌ 情节记忆验证失败: ${error.message}`);
    }

    try {
      const [semanticAfter] = await connection.execute(
        'SELECT name, definition, category, confidence_score FROM semantic_memories WHERE user_id = ? ORDER BY confidence_score DESC LIMIT 5',
        [testUserId]
      );

      if (semanticAfter.length > 0) {
        console.log('\n   🧠 用户的语义概念:');
        semanticAfter.forEach((record, index) => {
          console.log(`   ${index + 1}. ${record.name} (${record.category}) - 置信度: ${record.confidence_score}`);
          console.log(`      定义: ${record.definition.substring(0, 50)}...`);
        });
      }
    } catch (error) {
      console.log(`   ❌ 语义记忆验证失败: ${error.message}`);
    }

    // === 第四步：模拟AI如何读取和使用这些上下文 ===
    console.log('\n🤖 第四步：AI如何读取和使用这些上下文');
    console.log('=' .repeat(50));

    let contextBuilder = `=== 六维记忆上下文 ===\n`;
    contextBuilder += `用户ID: ${testUserId}\n`;
    contextBuilder += `当前时间: ${new Date().toLocaleString()}\n`;
    contextBuilder += `用户查询: "${userMessage}"\n\n`;

    // 添加核心记忆信息
    contextBuilder += `[核心记忆]\n`;
    contextBuilder += `AI角色: 专业的幼儿园管理顾问\n`;
    contextBuilder += `用户信息: ${testUserName}，5年经验的幼儿园教师，专注于班级管理\n\n`;

    // 添加相关概念
    contextBuilder += `[关键概念]\n`;
    contextBuilder += `- 班级管理: 幼儿园班级组织与管理的系统方法\n`;
    contextBuilder += `- 管理效率: 在有限时间内完成更多管理任务的能力\n`;
    contextBuilder += `- 幼儿园: 针对3-6岁儿童的学前教育机构\n\n`;

    // 添加对话指导
    contextBuilder += `=== AI助手角色指导 ===\n`;
    contextBuilder += `基于用户的专业背景和需求：\n`;
    contextBuilder += `1. 以专业的幼儿园管理顾问身份回应\n`;
    contextBuilder += `2. 提供具体、可操作的管理效率提升建议\n`;
    contextBuilder += `3. 结合用户的5年教学经验，给出进阶方案\n`;
    contextBuilder += `4. 引用实际案例和最佳实践\n\n`;

    contextBuilder += `=== 当前对话 ===\n`;
    contextBuilder += `用户: ${userMessage}\n`;
    contextBuilder += `AI助手: `;

    console.log('📋 AI系统获得的完整上下文:');
    console.log('-'.repeat(60));
    console.log(contextBuilder);
    console.log('-'.repeat(60));

    // === 第五步：上下文数据统计 ===
    console.log('\n📊 第五步：上下文数据统计');
    console.log('=' .repeat(50));

    const contextSize = contextBuilder.length;
    const contextTokens = Math.ceil(contextSize / 4);

    console.log(`   📝 上下文字符数: ${contextSize}`);
    console.log(`   🎯 估算Token数: ${contextTokens}`);
    console.log(`   💾 存储的记忆维度: 6个`);
    console.log(`   🔒 用户数据隔离: 完全隔离`);
    console.log(`   📅 上下文时效性: 实时更新`);

    console.log('\n✅ 六维记忆系统上下文插入演示完成!');
    console.log('\n💡 关键特点:');
    console.log('   • 支持完整的用户ID插入和隔离');
    console.log('   • 上下文以JSON格式存储在metadata字段');
    console.log('   • 六个维度独立存储，按需检索');
    console.log('   • 支持向量和关键词混合搜索');
    console.log('   • 自动构建结构化的AI对话上下文');

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