const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
};

async function checkAITables() {
  let connection;
  
  try {
    console.log('正在连接到远程MySQL数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功！');
    
    // 1. 获取所有AI相关表
    console.log('\n=== 1. AI相关表列表 ===');
    const [aiTables] = await connection.execute(
      "SHOW TABLES LIKE 'ai_%'"
    );
    
    const tableNames = aiTables.map(table => Object.values(table)[0]);
    console.log(`找到 ${tableNames.length} 张AI相关表：`);
    tableNames.forEach(tableName => {
      console.log(`  - ${tableName}`);
    });
    
    // 2. 分析每个AI表的记录数
    console.log('\n=== 2. AI表记录数统计 ===');
    for (const tableName of tableNames) {
      try {
        const [countResult] = await connection.execute(
          `SELECT COUNT(*) as count FROM \`${tableName}\``
        );
        const count = countResult[0].count;
        console.log(`  - ${tableName}: ${count.toLocaleString()} 条记录`);
        
        // 如果表有created_at字段，显示最近数据
        try {
          const [recentResult] = await connection.execute(
            `SELECT MAX(created_at) as latest FROM \`${tableName}\` WHERE created_at IS NOT NULL`
          );
          if (recentResult[0].latest) {
            console.log(`    最新数据: ${recentResult[0].latest}`);
          }
        } catch (e) {
          // 表可能没有created_at字段
        }
        
      } catch (error) {
        console.log(`  - ${tableName}: 查询失败 - ${error.message}`);
      }
    }
    
    // 3. 重点分析主要AI表
    console.log('\n=== 3. 主要AI表详细分析 ===');
    
    // ai_messages 表分析
    try {
      console.log('\n--- ai_messages 消息表 ---');
      const [msgStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_messages,
          COUNT(DISTINCT conversation_id) as unique_conversations,
          MIN(created_at) as earliest_message,
          MAX(created_at) as latest_message
        FROM ai_messages
      `);
      
      if (msgStats.length > 0) {
        const stats = msgStats[0];
        console.log(`总消息数: ${stats.total_messages.toLocaleString()}`);
        console.log(`涉及对话数: ${stats.unique_conversations}`);
        console.log(`消息时间范围: ${stats.earliest_message} 至 ${stats.latest_message}`);
        
        // 消息类型分布
        const [roleStats] = await connection.execute(`
          SELECT role, COUNT(*) as count 
          FROM ai_messages 
          GROUP BY role 
          ORDER BY count DESC
        `);
        console.log('消息角色分布：');
        roleStats.forEach(role => {
          console.log(`  - ${role.role}: ${role.count.toLocaleString()} 条`);
        });
      }
    } catch (error) {
      console.log(`ai_messages 查询失败: ${error.message}`);
    }
    
    // ai_memories 表分析
    try {
      console.log('\n--- ai_memories 记忆表 ---');
      const [memoryStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_memories,
          COUNT(DISTINCT external_user_id) as unique_users,
          memory_type,
          COUNT(*) as type_count
        FROM ai_memories
        GROUP BY memory_type
        ORDER BY type_count DESC
      `);
      
      console.log(`总记忆数: ${memoryStats.reduce((sum, item) => sum + item.type_count, 0).toLocaleString()}`);
      console.log(`涉及用户数: ${memoryStats[0]?.unique_users || 0}`);
      console.log('记忆类型分布：');
      memoryStats.forEach(mem => {
        console.log(`  - ${mem.memory_type}: ${mem.type_count.toLocaleString()} 条`);
      });
    } catch (error) {
      console.log(`ai_memories 查询失败: ${error.message}`);
    }
    
    // ai_model_usage 表分析
    try {
      console.log('\n--- ai_model_usage 模型使用统计 ---');
      const [usageStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_usage,
          COUNT(DISTINCT external_user_id) as unique_users,
          COUNT(DISTINCT model_id) as unique_models,
          SUM(token_count) as total_tokens
        FROM ai_model_usage
      `);
      
      if (usageStats.length > 0) {
        const stats = usageStats[0];
        console.log(`总使用次数: ${stats.total_usage.toLocaleString()}`);
        console.log(`涉及用户数: ${stats.unique_users}`);
        console.log(`涉及模型数: ${stats.unique_models}`);
        console.log(`总Token数: ${stats.total_tokens?.toLocaleString() || 'N/A'}`);
      }
    } catch (error) {
      console.log(`ai_model_usage 查询失败: ${error.message}`);
    }
    
    // 4. 数据质量检查
    console.log('\n=== 4. 数据质量检查 ===');
    
    // 检查孤立数据
    try {
      console.log('\n--- 孤立数据检查 ---');
      
      // 检查没有对应用户的对话
      const [orphanConversations] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM ai_conversations c 
        LEFT JOIN users u ON c.external_user_id = u.id 
        WHERE c.external_user_id IS NOT NULL AND u.id IS NULL
      `);
      console.log(`无对应用户的对话: ${orphanConversations[0].count} 个`);
      
      // 检查没有对应对话的消息
      const [orphanMessages] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM ai_messages m 
        LEFT JOIN ai_conversations c ON m.conversation_id = c.id 
        WHERE c.id IS NULL
      `);
      console.log(`无对应对话的消息: ${orphanMessages[0].count} 条`);
      
    } catch (error) {
      console.log(`孤立数据检查失败: ${error.message}`);
    }
    
    // 5. 性能建议
    console.log('\n=== 5. 性能分析和建议 ===');
    
    console.log('\n--- 表大小评估 ---');
    for (const tableName of ['ai_conversations', 'ai_messages', 'ai_memories', 'ai_model_usage']) {
      try {
        const [sizeResult] = await connection.execute(`
          SELECT 
            table_name,
            table_rows,
            ROUND(data_length / 1024 / 1024, 2) as data_mb,
            ROUND(index_length / 1024 / 1024, 2) as index_mb
          FROM information_schema.tables 
          WHERE table_schema = ? AND table_name = ?
        `, [dbConfig.database, tableName]);
        
        if (sizeResult.length > 0) {
          const size = sizeResult[0];
          console.log(`${tableName}:`);
          console.log(`  行数: ${size.table_rows.toLocaleString()}`);
          console.log(`  数据大小: ${size.data_mb} MB`);
          console.log(`  索引大小: ${size.index_mb} MB`);
          console.log(`  总大小: ${(parseFloat(size.data_mb) + parseFloat(size.index_mb)).toFixed(2)} MB`);
        }
      } catch (error) {
        console.log(`${tableName} 大小查询失败: ${error.message}`);
      }
    }
    
    console.log('\n=== 检查完成 ===');
    
  } catch (error) {
    console.error('❌ 数据库检查失败：', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('无法连接到数据库服务器，请检查网络连接和数据库配置');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('数据库访问被拒绝，请检查用户名和密码');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 运行检查
checkAITables();