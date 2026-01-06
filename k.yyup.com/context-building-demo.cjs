const mysql = require('mysql2/promise');
require('dotenv').config();

async function demonstrateContextBuilding() {
  let connection;

  try {
    console.log('🧠 演示六维记忆系统如何构建AI对话上下文...\n');

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

    const testUserId = 'demo-user-123';

    // 1. 模拟用户发送新消息："我想了解班级管理的技巧"
    console.log('📝 用户发送新消息："我想了解班级管理的技巧"');
    console.log(`👤 用户ID: ${testUserId}\n`);

    // 2. AI助手需要构建上下文 - 从六维记忆系统中检索相关信息
    console.log('🔍 AI助手开始构建上下文 - 从六维记忆系统检索...\n');

    let contextData = {
      userId: testUserId,
      message: "我想了解班级管理的技巧",
      retrievedMemories: {},
      builtContext: ""
    };

    // 3. 检索核心记忆 - 用户的基本信息和偏好
    console.log('📊 检索核心记忆 (用户基本信息和偏好)...');
    try {
      const [coreMemories] = await connection.execute(`
        SELECT persona_value, human_value, metadata
        FROM core_memories
        WHERE user_id = ? OR metadata LIKE ?
        ORDER BY created_at DESC
        LIMIT 1
      `, [testUserId, `%"${testUserId}"%`]);

      if (coreMemories.length > 0) {
        const core = coreMemories[0];
        contextData.retrievedMemories.core = {
          persona: core.persona_value,
          userInfo: core.human_value,
          metadata: JSON.parse(core.metadata || '{}')
        };
        console.log(`   ✅ 找到核心记忆: ${core.persona_value.substring(0, 50)}...`);
        console.log(`   👤 用户信息: ${core.human_value.substring(0, 50)}...`);
      }
    } catch (error) {
      console.log(`   ❌ 核心记忆检索失败: ${error.message}`);
    }

    // 4. 检索情节记忆 - 历史对话记录
    console.log('\n💬 检索情节记忆 (历史对话记录)...');
    try {
      const [episodicMemories] = await connection.execute(`
        SELECT event_type, summary, details, actor, occurred_at, metadata
        FROM episodic_memories
        WHERE user_id = ? OR metadata LIKE ?
        ORDER BY occurred_at DESC
        LIMIT 5
      `, [testUserId, `%"${testUserId}"%`]);

      if (episodicMemories.length > 0) {
        contextData.retrievedMemories.episodic = episodicMemories.map(mem => ({
          eventType: mem.event_type,
          summary: mem.summary,
          content: mem.details.substring(0, 100) + '...',
          actor: mem.actor,
          timestamp: mem.occurred_at,
          metadata: JSON.parse(mem.metadata || '{}')
        }));
        console.log(`   ✅ 找到 ${episodicMemories.length} 条历史对话记录`);
        episodicMemories.forEach((mem, index) => {
          console.log(`   ${index + 1}. [${mem.actor}] ${mem.summary}`);
        });
      }
    } catch (error) {
      console.log(`   ❌ 情节记忆检索失败: ${error.message}`);
    }

    // 5. 检索语义记忆 - 相关概念和知识
    console.log('\n🎯 检索语义记忆 (班级管理相关知识)...');
    try {
      const keywords = ['班级管理', '教学', '幼儿园', '管理技巧'];
      const keywordConditions = keywords.map(() => `content LIKE ?`).join(' OR ');
      const keywordParams = keywords.map(keyword => `%${keyword}%`);

      const [semanticMemories] = await connection.execute(`
        SELECT concept, definition, examples, category, confidence_score
        FROM semantic_memories
        WHERE (${keywordConditions})
        ORDER BY confidence_score DESC
        LIMIT 3
      `, keywordParams);

      if (semanticMemories.length > 0) {
        contextData.retrievedMemories.semantic = semanticMemories.map(mem => ({
          concept: mem.concept,
          definition: mem.definition,
          examples: mem.examples,
          category: mem.category,
          confidence: mem.confidence_score
        }));
        console.log(`   ✅ 找到 ${semanticMemories.length} 条相关语义记忆`);
        semanticMemories.forEach((mem, index) => {
          console.log(`   ${index + 1}. ${mem.concept} (置信度: ${mem.confidence_score})`);
        });
      }
    } catch (error) {
      console.log(`   ❌ 语义记忆检索失败: ${error.message}`);
    }

    // 6. 检索程序记忆 - 相关的操作流程
    console.log('\n⚙️ 检索程序记忆 (管理流程和操作)...');
    try {
      const [proceduralMemories] = await connection.execute(`
        SELECT procedure_name, steps, context, success_rate
        FROM procedural_memories
        WHERE (context LIKE ? OR context LIKE ?)
        ORDER BY success_rate DESC
        LIMIT 2
      `, ['%班级%', '%管理%']);

      if (proceduralMemories.length > 0) {
        contextData.retrievedMemories.procedural = proceduralMemories.map(mem => ({
          name: mem.procedure_name,
          steps: JSON.parse(mem.steps || '[]'),
          context: mem.context,
          successRate: mem.success_rate
        }));
        console.log(`   ✅ 找到 ${proceduralMemories.length} 条程序记忆`);
        proceduralMemories.forEach((mem, index) => {
          console.log(`   ${index + 1}. ${mem.procedure_name} (成功率: ${mem.success_rate}%)`);
        });
      }
    } catch (error) {
      console.log(`   ❌ 程序记忆检索失败: ${error.message}`);
    }

    // 7. 构建最终上下文 - 这是写入AI对话的内容
    console.log('\n🎯 构建最终AI对话上下文...');

    let builtContext = `=== 用户上下文信息 ===\n`;
    builtContext += `用户ID: ${testUserId}\n`;
    builtContext += `当前时间: ${new Date().toLocaleString()}\n`;
    builtContext += `用户查询: "我想了解班级管理的技巧"\n\n`;

    // 添加用户基本信息
    if (contextData.retrievedMemories.core) {
      builtContext += `=== 用户基本信息 ===\n`;
      builtContext += `角色: ${contextData.retrievedMemories.core.metadata.role || '未知'}\n`;
      builtContext += `姓名: ${contextData.retrievedMemories.core.metadata.name || '未知'}\n`;
      builtContext += `特征: ${contextData.retrievedMemories.core.userInfo}\n\n`;
    }

    // 添加历史对话摘要
    if (contextData.retrievedMemories.episodic && contextData.retrievedMemories.episodic.length > 0) {
      builtContext += `=== 历史对话摘要 ===\n`;
      contextData.retrievedMemories.episodic.slice(0, 3).forEach((mem, index) => {
        builtContext += `${index + 1}. [${mem.actor}] ${mem.summary}\n`;
      });
      builtContext += `\n`;
    }

    // 添加相关知识
    if (contextData.retrievedMemories.semantic && contextData.retrievedMemories.semantic.length > 0) {
      builtContext += `=== 相关知识 ===\n`;
      contextData.retrievedMemories.semantic.forEach((mem, index) => {
        builtContext += `${index + 1}. ${mem.concept}: ${mem.definition.substring(0, 80)}...\n`;
      });
      builtContext += `\n`;
    }

    // 添加操作建议
    if (contextData.retrievedMemories.procedural && contextData.retrievedMemories.procedural.length > 0) {
      builtContext += `=== 操作流程建议 ===\n`;
      contextData.retrievedMemories.procedural.forEach((mem, index) => {
        builtContext += `${index + 1}. ${mem.name}: ${mem.steps.length}个步骤\n`;
      });
      builtContext += `\n`;
    }

    // 添加AI助手角色指导
    builtContext += `=== AI助手角色指导 ===\n`;
    builtContext += `基于用户的教师身份和历史对话，请以专业的幼儿园管理顾问身份回答。\n`;
    builtContext += `回答应该实用、具体，并考虑到用户的实际工作场景。\n`;
    builtContext += `结合用户的过往经验和当前的班级管理需求，提供个性化建议。\n\n`;

    builtContext += `=== 当前对话 ===\n`;
    builtContext += `用户: 我想了解班级管理的技巧\n`;
    builtContext += `AI: `;

    contextData.builtContext = builtContext;

    // 8. 显示最终构建的上下文
    console.log('📋 最终写入AI对话的上下文内容:');
    console.log('=' .repeat(60));
    console.log(builtContext);
    console.log('=' .repeat(60));

    // 9. 模拟AI回复
    console.log('\n🤖 基于该上下文，AI助手会生成个性化回复...');
    console.log('✅ 六维记忆系统上下文构建演示完成!');

    return contextData;

  } catch (error) {
    console.error('❌ 演示失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

demonstrateContextBuilding();