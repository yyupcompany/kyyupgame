const { sequelize } = require('./dist/models');

async function checkSixDimensionalMemory() {
  try {
    console.log('🧠 检查六维记忆系统数据库记录...');

    // 1. 检查AI相关表
    console.log('\n📊 检查 AI conversations 表...');
    try {
      const [conversationCount] = await sequelize.query('SELECT COUNT(*) as count FROM ai_conversations');
      console.log(`✅ AI conversations 表中有 ${conversationCount[0].count} 条记录`);

      if (conversationCount[0].count > 0) {
        const [recentConversations] = await sequelize.query(`
          SELECT id, user_id, session_id, status, created_at
          FROM ai_conversations
          ORDER BY created_at DESC
          LIMIT 5
        `);
        console.log('📝 最近的对话:');
        console.log(JSON.stringify(recentConversations, null, 2));
      }
    } catch (error) {
      console.log('❌ ai_conversations 表不存在或查询失败:', error.message);
    }

    // 2. 检查AI messages表
    console.log('\n📊 检查 AI messages 表...');
    try {
      const [messageCount] = await sequelize.query('SELECT COUNT(*) as count FROM ai_messages');
      console.log(`✅ AI messages 表中有 ${messageCount[0].count} 条记录`);

      if (messageCount[0].count > 0) {
        const [recentMessages] = await sequelize.query(`
          SELECT id, conversation_id, role, content, created_at
          FROM ai_messages
          ORDER BY created_at DESC
          LIMIT 5
        `);
        console.log('📝 最近的消息:');
        console.log(JSON.stringify(recentMessages, null, 2));
      }
    } catch (error) {
      console.log('❌ ai_messages 表不存在或查询失败:', error.message);
    }

    // 3. 检查memory相关表
    console.log('\n📊 检查 Memory 系统...');

    const memoryTables = [
      'user_memories',
      'conversation_memories',
      'knowledge_memories',
      'context_memories',
      'emotion_memories',
      'preference_memories',
      'pattern_memories'
    ];

    for (const tableName of memoryTables) {
      try {
        const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`✅ ${tableName} 表中有 ${count[0].count} 条记录`);
      } catch (error) {
        console.log(`❌ ${tableName} 表不存在或查询失败:`, error.message);
      }
    }

    // 4. 检查AI记忆向量表
    console.log('\n📊 检查 AI 记忆向量表...');
    try {
      const [vectorCount] = await sequelize.query('SELECT COUNT(*) as count FROM ai_memory_vectors');
      console.log(`✅ AI memory vectors 表中有 ${vectorCount[0].count} 条记录`);
    } catch (error) {
      console.log('❌ ai_memory_vectors 表不存在或查询失败:', error.message);
    }

    // 5. 检查AI工具调用记录
    console.log('\n📊 检查 AI 工具调用记录...');
    try {
      const [toolCount] = await sequelize.query('SELECT COUNT(*) as count FROM ai_tool_calls');
      console.log(`✅ AI tool calls 表中有 ${toolCount[0].count} 条记录`);

      if (toolCount[0].count > 0) {
        const [recentTools] = await sequelize.query(`
          SELECT id, tool_name, status, created_at
          FROM ai_tool_calls
          ORDER BY created_at DESC
          LIMIT 5
        `);
        console.log('📝 最近的工具调用:');
        console.log(JSON.stringify(recentTools, null, 2));
      }
    } catch (error) {
      console.log('❌ ai_tool_calls 表不存在或查询失败:', error.message);
    }

    // 6. 检查数据库中所有的AI相关表
    console.log('\n🔍 搜索所有AI相关的表...');
    try {
      const [tables] = await sequelize.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
        AND (table_name LIKE '%ai%' OR table_name LIKE '%memory%' OR table_name LIKE '%conversation%')
      `);

      console.log('📋 找到的AI相关表:');
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    } catch (error) {
      console.log('❌ 搜索AI相关表失败:', error.message);
    }

    console.log('\n✅ 六维记忆系统数据库检查完成!');

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkSixDimensionalMemory();