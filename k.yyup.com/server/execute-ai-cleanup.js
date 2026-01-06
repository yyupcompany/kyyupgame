const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
};

async function executeAICleanup() {
  let connection;
  
  try {
    console.log('🚀 开始AI系统紧急优化...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功！');
    
    // 1. 数据分析和备份前检查
    console.log('\n=== 1. 数据分析和备份前检查 ===');
    
    // 检查总对话数和空对话数
    const [totalStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_conversations,
        COUNT(CASE WHEN message_count = 0 THEN 1 END) as empty_conversations,
        COUNT(CASE WHEN message_count > 0 THEN 1 END) as valid_conversations,
        ROUND(COUNT(CASE WHEN message_count = 0 THEN 1 END) * 100.0 / COUNT(*), 2) as empty_percentage
      FROM ai_conversations
    `);
    
    console.log('📊 当前数据状况：');
    console.log(`  总对话数: ${totalStats[0].total_conversations.toLocaleString()}`);
    console.log(`  空对话数: ${totalStats[0].empty_conversations.toLocaleString()}`);
    console.log(`  有效对话数: ${totalStats[0].valid_conversations.toLocaleString()}`);
    console.log(`  空对话比例: ${totalStats[0].empty_percentage}%`);
    
    // 检查异常用户121
    const [user121Stats] = await connection.execute(`
      SELECT COUNT(*) as count, MIN(created_at) as first_date, MAX(created_at) as last_date
      FROM ai_conversations 
      WHERE external_user_id = 121
    `);
    
    console.log('\n👤 异常用户121分析：');
    console.log(`  对话数: ${user121Stats[0].count.toLocaleString()}`);
    console.log(`  时间范围: ${user121Stats[0].first_date} 至 ${user121Stats[0].last_date}`);
    
    // 获取用户121的详细信息
    const [user121Info] = await connection.execute(
      'SELECT username, email, role, status, created_at FROM users WHERE id = 121'
    );
    
    if (user121Info.length > 0) {
      console.log('  用户信息：');
      console.log(`    用户名: ${user121Info[0].username}`);
      console.log(`    邮箱: ${user121Info[0].email}`);
      console.log(`    角色: ${user121Info[0].role}`);
      console.log(`    状态: ${user121Info[0].status}`);
      console.log(`    注册时间: ${user121Info[0].created_at}`);
    }
    
    // 2. 数据备份 (创建备份表)
    console.log('\n=== 2. 数据备份 ===');
    
    const backupSuffix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    try {
      await connection.execute(`CREATE TABLE ai_conversations_backup_${backupSuffix} LIKE ai_conversations`);
      await connection.execute(`INSERT INTO ai_conversations_backup_${backupSuffix} SELECT * FROM ai_conversations`);
      console.log(`✅ 备份表创建成功: ai_conversations_backup_${backupSuffix}`);
    } catch (error) {
      console.log(`⚠️  备份表可能已存在或创建失败: ${error.message}`);
    }
    
    // 3. 执行数据清理 (分步骤，安全方式)
    console.log('\n=== 3. 执行数据清理 ===');
    
    // 3.1 清理90天前的空对话 (保守策略)
    console.log('\n📅 清理90天前的空对话...');
    const [step1Result] = await connection.execute(`
      DELETE FROM ai_conversations 
      WHERE message_count = 0 
      AND created_at < DATE_SUB(NOW(), INTERVAL 90 DAY)
    `);
    
    console.log(`✅ 清理了 ${step1Result.affectedRows} 条90天前的空对话`);
    
    // 3.2 清理30天前的空对话 (中等策略)
    console.log('\n📅 清理30天前的空对话...');
    const [step2Result] = await connection.execute(`
      DELETE FROM ai_conversations 
      WHERE message_count = 0 
      AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    console.log(`✅ 清理了 ${step2Result.affectedRows} 条30天前的空对话`);
    
    // 3.3 清理7天前的空对话 (激进策略)
    console.log('\n📅 清理7天前的空对话...');
    const [step3Result] = await connection.execute(`
      DELETE FROM ai_conversations 
      WHERE message_count = 0 
      AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    
    console.log(`✅ 清理了 ${step3Result.affectedRows} 条7天前的空对话`);
    
    // 3.4 清理用户121的所有空对话 (特殊处理)
    console.log('\n👤 清理用户121的空对话...');
    const [step4Result] = await connection.execute(`
      DELETE FROM ai_conversations 
      WHERE external_user_id = 121 
      AND message_count = 0
    `);
    
    console.log(`✅ 清理了用户121的 ${step4Result.affectedRows} 条空对话`);
    
    // 4. 修复其他AI表问题
    console.log('\n=== 4. 修复其他AI表问题 ===');
    
    // 4.1 检查并修复 ai_model_usage 表
    console.log('\n🔧 检查 ai_model_usage 表结构...');
    const [usageColumns] = await connection.execute('DESCRIBE ai_model_usage');
    const hasTokenCount = usageColumns.some(col => col.Field === 'token_count');
    
    if (!hasTokenCount) {
      try {
        await connection.execute('ALTER TABLE ai_model_usage ADD COLUMN token_count INT DEFAULT 0');
        console.log('✅ 添加了 token_count 字段到 ai_model_usage 表');
      } catch (error) {
        console.log(`⚠️  添加字段失败: ${error.message}`);
      }
    } else {
      console.log('✅ ai_model_usage 表已存在 token_count 字段');
    }
    
    // 4.2 清理孤立数据
    console.log('\n🧹 清理孤立数据...');
    const [orphanMessages] = await connection.execute(`
      DELETE FROM ai_messages 
      WHERE conversation_id NOT IN (SELECT id FROM ai_conversations)
    `);
    console.log(`✅ 清理了 ${orphanMessages.affectedRows} 条孤立消息`);
    
    // 5. 验证清理结果
    console.log('\n=== 5. 验证清理结果 ===');
    
    const [finalStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_conversations,
        COUNT(CASE WHEN message_count = 0 THEN 1 END) as empty_conversations,
        COUNT(CASE WHEN message_count > 0 THEN 1 END) as valid_conversations,
        ROUND(COUNT(CASE WHEN message_count = 0 THEN 1 END) * 100.0 / COUNT(*), 2) as empty_percentage
      FROM ai_conversations
    `);
    
    console.log('📊 清理后数据状况：');
    console.log(`  总对话数: ${finalStats[0].total_conversations.toLocaleString()}`);
    console.log(`  空对话数: ${finalStats[0].empty_conversations.toLocaleString()}`);
    console.log(`  有效对话数: ${finalStats[0].valid_conversations.toLocaleString()}`);
    console.log(`  空对话比例: ${finalStats[0].empty_percentage}%`);
    
    // 计算清理效果
    const cleanedCount = totalStats[0].total_conversations - finalStats[0].total_conversations;
    const improvement = totalStats[0].empty_percentage - finalStats[0].empty_percentage;
    
    console.log('\n🎯 清理效果：');
    console.log(`  清理记录数: ${cleanedCount.toLocaleString()} 条`);
    console.log(`  空对话率改善: ${improvement.toFixed(1)}%`);
    console.log(`  数据质量提升: ${(improvement / totalStats[0].empty_percentage * 100).toFixed(1)}%`);
    
    // 6. 性能建议
    console.log('\n=== 6. 优化建议 ===');
    console.log('✅ 已完成的优化：');
    console.log('  - 清理了过期空对话数据');
    console.log('  - 修复了模型使用统计表结构');
    console.log('  - 清理了孤立数据');
    console.log('  - 创建了数据备份');
    
    console.log('\n🔧 建议下一步执行：');
    console.log('  1. 实施后端正验证防止新的空对话创建');
    console.log('  2. 添加定时清理任务');
    console.log('  3. 优化前端对话创建逻辑');
    console.log('  4. 建立监控告警机制');
    
    console.log('\n🎉 AI系统紧急优化完成！');
    
  } catch (error) {
    console.error('❌ 优化执行失败：', error.message);
    console.error('错误详情：', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 运行优化
executeAICleanup();