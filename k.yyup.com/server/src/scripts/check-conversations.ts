/**
 * 检查数据库中的AI会话数据
 */

import { Sequelize } from 'sequelize';
import { getDatabaseConfig } from '../config/database-unified';

async function checkConversations() {
  const config = getDatabaseConfig();
  
  const sequelize = new Sequelize({
    ...config,
    logging: false
  });

  try {
    console.log('🔍 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 检查ai_conversations表
    console.log('\n📊 检查 ai_conversations 表...');
    
    // 查询总会话数
    const [totalResult] = await sequelize.query('SELECT COUNT(*) as total FROM ai_conversations');
    const total = (totalResult as any)[0].total;
    console.log(`📈 总会话数: ${total}`);

    // 查询最近的会话
    console.log('\n📋 最近的10个会话:');
    const [conversations] = await sequelize.query(`
      SELECT 
        id,
        external_user_id as userId,
        title,
        message_count,
        last_message_at,
        is_archived,
        created_at,
        updated_at
      FROM ai_conversations 
      ORDER BY last_message_at DESC 
      LIMIT 10
    `);
    
    console.table(conversations);

    // 检查ai_messages表
    console.log('\n📊 检查 ai_messages 表...');
    
    // 查询总消息数
    const [totalMsgResult] = await sequelize.query('SELECT COUNT(*) as total FROM ai_messages');
    const totalMsg = (totalMsgResult as any)[0].total;
    console.log(`📈 总消息数: ${totalMsg}`);

    // 查询每个会话的消息数量
    console.log('\n📋 每个会话的消息数量:');
    const [msgCounts] = await sequelize.query(`
      SELECT 
        c.id,
        c.title,
        c.message_count as stored_count,
        COUNT(m.id) as actual_count,
        c.last_message_at
      FROM ai_conversations c
      LEFT JOIN ai_messages m ON c.id = m.conversation_id AND m.is_deleted = 0
      GROUP BY c.id, c.title, c.message_count, c.last_message_at
      ORDER BY c.last_message_at DESC
      LIMIT 15
    `);
    
    console.table(msgCounts);

    // 检查数据不一致的情况
    console.log('\n⚠️ 检查数据不一致的会话:');
    const [inconsistent] = await sequelize.query(`
      SELECT 
        c.id,
        c.title,
        c.message_count as stored_count,
        COUNT(m.id) as actual_count,
        (c.message_count - COUNT(m.id)) as difference
      FROM ai_conversations c
      LEFT JOIN ai_messages m ON c.id = m.conversation_id AND m.is_deleted = 0
      GROUP BY c.id, c.title, c.message_count
      HAVING c.message_count != COUNT(m.id)
      ORDER BY difference DESC
    `);
    
    if ((inconsistent as any[]).length > 0) {
      console.table(inconsistent);
    } else {
      console.log('✅ 所有会话的消息数量都是一致的');
    }

    // 检查用户分布
    console.log('\n👥 用户会话分布:');
    const [userStats] = await sequelize.query(`
      SELECT 
        external_user_id as userId,
        COUNT(*) as conversation_count,
        SUM(message_count) as total_messages,
        MAX(last_message_at) as last_activity
      FROM ai_conversations
      GROUP BY external_user_id
      ORDER BY conversation_count DESC
    `);
    
    console.table(userStats);

    // 专门检查用户121的详细情况
    console.log('\n🔍 用户121详细分析:');
    const [user121Detail] = await sequelize.query(`
      SELECT
        message_count,
        is_archived,
        COUNT(*) as conversation_count
      FROM ai_conversations
      WHERE external_user_id = 121
      GROUP BY message_count, is_archived
      ORDER BY message_count DESC, is_archived
    `);

    console.log('用户121的会话分布:');
    console.table(user121Detail);

    // 检查用户121有消息的会话
    console.log('\n📝 用户121有消息的会话:');
    const [user121WithMessages] = await sequelize.query(`
      SELECT
        c.id,
        c.title,
        c.message_count,
        COUNT(m.id) as actual_message_count,
        c.is_archived,
        c.last_message_at
      FROM ai_conversations c
      INNER JOIN ai_messages m ON c.id = m.conversation_id AND m.is_deleted = 0
      WHERE c.external_user_id = 121
      GROUP BY c.id
      ORDER BY actual_message_count DESC, c.last_message_at DESC
      LIMIT 10
    `);

    if ((user121WithMessages as any[]).length > 0) {
      console.log(`找到 ${(user121WithMessages as any[]).length} 个有消息的会话:`);
      console.table(user121WithMessages);
    } else {
      console.log('❌ 用户121没有任何有消息的会话');
    }

    // 检查API查询结果
    console.log('\n🔍 模拟当前API查询结果:');
    const [apiResult] = await sequelize.query(`
      SELECT
        id,
        title,
        summary,
        message_count,
        last_message_at,
        is_archived,
        created_at,
        updated_at
      FROM ai_conversations
      WHERE external_user_id = 121 AND is_archived = 0 AND message_count > 0
      ORDER BY last_message_at DESC
      LIMIT 10
    `);

    console.log(`API查询返回 ${(apiResult as any[]).length} 个会话:`);
    if ((apiResult as any[]).length > 0) {
      console.table(apiResult);
    } else {
      console.log('❌ API查询没有返回任何会话');

      // 检查是否有归档的会话
      const [archivedWithMessages] = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM ai_conversations
        WHERE external_user_id = 121 AND is_archived = 1 AND message_count > 0
      `);

      console.log(`归档的有消息会话数: ${(archivedWithMessages as any)[0].count}`);
    }

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔚 数据库连接已关闭');
  }
}

// 运行检查
checkConversations().catch(console.error);
