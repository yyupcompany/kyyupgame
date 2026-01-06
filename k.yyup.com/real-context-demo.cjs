const mysql = require('mysql2/promise');
require('dotenv').config();

async function demonstrateRealContextBuilding() {
  let connection;

  try {
    console.log('🎯 演示实际系统如何构建AI对话上下文 (基于ai_messages表)...\n');

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

    // 1. 选择一个活跃用户进行演示
    console.log('👤 查找活跃用户...');
    const [activeUsers] = await connection.execute(`
      SELECT user_id, COUNT(*) as message_count
      FROM ai_messages
      WHERE is_deleted = 0
      GROUP BY user_id
      ORDER BY message_count DESC
      LIMIT 3
    `);

    if (activeUsers.length === 0) {
      console.log('❌ 未找到活跃用户');
      return;
    }

    const selectedUser = activeUsers[0];
    console.log(`✅ 选择用户ID: ${selectedUser.user_id}, 消息数量: ${selectedUser.message_count}\n`);

    // 2. 模拟用户发送新消息
    const newUserMessage = "我想了解如何提高孩子们的参与度";
    console.log('💬 用户发送新消息:');
    console.log(`   用户${selectedUser.user_id}: "${newUserMessage}"\n`);

    // 3. 系统构建上下文 - 从数据库检索用户相关信息
    console.log('🔍 系统开始构建AI对话上下文...\n');

    let contextBuilder = {
      userInfo: {},
      recentConversations: [],
      conversationHistory: [],
      userPatterns: {},
      builtContext: ""
    };

    // 3.1 获取用户最近的会话
    console.log('📋 获取用户最近的会话...');
    const [recentConversations] = await connection.execute(`
      SELECT id, title, message_count, last_message_at, summary
      FROM ai_conversations
      WHERE external_user_id = ?
      ORDER BY last_message_at DESC
      LIMIT 3
    `, [selectedUser.user_id]);

    contextBuilder.recentConversations = recentConversations;
    console.log(`   ✅ 找到 ${recentConversations.length} 个最近会话`);
    recentConversations.forEach((conv, index) => {
      console.log(`   ${index + 1}. ${conv.title} (${conv.message_count}条消息) - ${conv.last_message_at}`);
    });

    // 3.2 获取用户最近的对话消息历史
    console.log('\n💬 获取最近的消息历史...');
    const [recentMessages] = await connection.execute(`
      SELECT conversation_id, role, content, created_at, message_type, tokens
      FROM ai_messages
      WHERE user_id = ?
      AND is_deleted = 0
      ORDER BY created_at DESC
      LIMIT 10
    `, [selectedUser.user_id]);

    // 反转数组使消息按时间正序排列
    contextBuilder.conversationHistory = recentMessages.reverse();
    console.log(`   ✅ 获取到 ${recentMessages.length} 条最近消息`);
    recentMessages.slice(0, 5).forEach((msg, index) => {
      const time = new Date(msg.created_at).toLocaleString();
      console.log(`   ${index + 1}. [${msg.role}] ${msg.content.substring(0, 40)}... (${time})`);
    });

    // 3.3 分析用户行为模式
    console.log('\n📊 分析用户行为模式...');
    const [userStats] = await connection.execute(`
      SELECT
        COUNT(*) as total_messages,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as user_messages,
        COUNT(CASE WHEN role = 'assistant' THEN 1 END) as assistant_messages,
        AVG(CASE WHEN role = 'user' THEN tokens END) as avg_user_tokens,
        MIN(created_at) as first_message,
        MAX(created_at) as last_message
      FROM ai_messages
      WHERE user_id = ?
      AND is_deleted = 0
    `, [selectedUser.user_id]);

    if (userStats.length > 0) {
      const stats = userStats[0];
      contextBuilder.userPatterns = {
        totalMessages: stats.total_messages,
        userMessages: stats.user_messages,
        assistantMessages: stats.assistant_messages,
        avgUserTokens: Math.round(stats.avg_user_tokens || 0),
        firstMessage: stats.first_message,
        lastMessage: stats.last_message,
        daysActive: Math.ceil((new Date(stats.last_message) - new Date(stats.first_message)) / (1000 * 60 * 60 * 24))
      };
      console.log(`   📈 总消息数: ${stats.total_messages}`);
      console.log(`   👤 用户消息: ${stats.user_messages}`);
      console.log(`   🤖 AI回复: ${stats.assistant_messages}`);
      console.log(`   📊 平均用户输入长度: ${Math.round(stats.avg_user_tokens || 0)} tokens`);
      console.log(`   📅 活跃天数: ${contextBuilder.userPatterns.daysActive}天`);
    }

    // 4. 构建最终的AI对话上下文
    console.log('\n🎯 构建最终AI对话上下文...');

    let finalContext = `=== 用户上下文信息 ===\n`;
    finalContext += `用户ID: ${selectedUser.user_id}\n`;
    finalContext += `当前时间: ${new Date().toLocaleString()}\n`;
    finalContext += `用户查询: "${newUserMessage}"\n\n`;

    // 添加用户统计信息
    if (contextBuilder.userPatterns.totalMessages) {
      finalContext += `=== 用户统计信息 ===\n`;
      finalContext += `历史对话总数: ${contextBuilder.userPatterns.totalMessages}条\n`;
      finalContext += `用户活跃度: ${contextBuilder.userPatterns.daysActive}天\n`;
      finalContext += `平均输入长度: ${contextBuilder.userPatterns.avgUserTokens} tokens\n`;
      finalContext += `用户偏好: 倾向于${contextBuilder.userPatterns.avgUserTokens > 10 ? '详细描述' : '简洁提问'}\n\n`;
    }

    // 添加最近会话摘要
    if (contextBuilder.recentConversations.length > 0) {
      finalContext += `=== 最近会话摘要 ===\n`;
      contextBuilder.recentConversations.forEach((conv, index) => {
        finalContext += `${index + 1}. ${conv.title} (${conv.message_count}条对话)\n`;
      });
      finalContext += `\n`;
    }

    // 添加最近对话历史 (限制为最近的6条消息)
    if (contextBuilder.conversationHistory.length > 0) {
      finalContext += `=== 最近对话历史 ===\n`;
      const recentHistory = contextBuilder.conversationHistory.slice(-6);
      recentHistory.forEach((msg, index) => {
        const time = new Date(msg.created_at).toLocaleTimeString();
        const roleLabel = msg.role === 'user' ? '用户' : 'AI助手';
        finalContext += `${index + 1}. [${time}] ${roleLabel}: ${msg.content}\n`;
      });
      finalContext += `\n`;
    }

    // 添加AI助手角色指导
    finalContext += `=== AI助手角色指导 ===\n`;
    finalContext += `基于该用户的历史对话模式:\n`;
    if (contextBuilder.userPatterns.avgUserTokens > 10) {
      finalContext += `- 用户倾向于详细描述问题，AI应提供深入、全面的回答\n`;
    } else {
      finalContext += `- 用户倾向于简洁提问，AI应提供直接、重点明确的建议\n`;
    }
    finalContext += `- 用户是活跃用户，有${contextBuilder.userPatterns.daysActive}天的使用经验\n`;
    finalContext += `- 回答应保持专业性，同时根据用户的沟通风格调整语言风格\n\n`;

    finalContext += `=== 当前对话 ===\n`;
    finalContext += `用户: ${newUserMessage}\n`;
    finalContext += `AI助手: `;

    contextBuilder.builtContext = finalContext;

    // 5. 显示最终构建的上下文
    console.log('📋 最终写入AI对话的上下文内容:');
    console.log('=' .repeat(80));
    console.log(finalContext);
    console.log('=' .repeat(80));

    // 6. 显示上下文数据的大小
    const contextSize = finalContext.length;
    const contextTokens = Math.ceil(contextSize / 4); // 粗略估算token数量
    console.log(`\n📊 上下文统计:`);
    console.log(`   📝 上下文字符数: ${contextSize}`);
    console.log(`   🎯 估算Token数: ${contextTokens}`);
    console.log(`   💬 消息历史条数: ${contextBuilder.conversationHistory.length}`);
    console.log(`   📅 会话活跃天数: ${contextBuilder.userPatterns.daysActive || 0}`);

    console.log('\n✅ 实际AI对话上下文构建演示完成!');
    console.log('\n💡 这个上下文将被发送给AI模型，帮助AI理解:');
    console.log('   • 用户是谁 (用户ID、统计信息)');
    console.log('   • 用户的对话习惯和偏好');
    console.log('   • 最近的对话历史和上下文');
    console.log('   • 当前需要回答的问题');
    console.log('   • 应该以什么样的角色和风格回应');

    return contextBuilder;

  } catch (error) {
    console.error('❌ 演示失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

demonstrateRealContextBuilding();