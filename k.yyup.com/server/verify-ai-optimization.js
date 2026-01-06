const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
};

async function verifyAIOptimization() {
  let connection;
  
  try {
    console.log('🔍 开始验证AI系统优化效果...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功！');
    
    // 1. 检查当前数据状况
    console.log('\n=== 1. 当前AI系统数据状况 ===');
    
    const [currentStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_conversations,
        COUNT(CASE WHEN message_count = 0 THEN 1 END) as empty_conversations,
        COUNT(CASE WHEN message_count > 0 THEN 1 END) as valid_conversations,
        ROUND(COUNT(CASE WHEN message_count = 0 THEN 1 END) * 100.0 / COUNT(*), 2) as empty_percentage,
        AVG(message_count) as avg_messages,
        MAX(message_count) as max_messages
      FROM ai_conversations
    `);
    
    const stats = currentStats[0];
    console.log('📊 AI对话统计：');
    console.log(`  总对话数: ${stats.total_conversations.toLocaleString()}`);
    console.log(`  空对话数: ${stats.empty_conversations.toLocaleString()}`);
    console.log(`  有效对话数: ${stats.valid_conversations.toLocaleString()}`);
    console.log(`  空对话比例: ${stats.empty_percentage}%`);
    console.log(`  平均消息数: ${stats.avg_messages?.toFixed(1) || 0}`);
    console.log(`  最大消息数: ${stats.max_messages}`);
    
    // 2. 检查各AI表的记录数
    console.log('\n=== 2. AI系统各表记录数 ===');
    
    const aiTables = [
      'ai_conversations', 'ai_messages', 'ai_user_relations', 
      'ai_memories', 'ai_model_usage', 'ai_model_config',
      'ai_user_permissions', 'ai_knowledge_base', 'ai_configurations'
    ];
    
    let totalRecords = 0;
    for (const tableName of aiTables) {
      try {
        const [countResult] = await connection.execute(
          `SELECT COUNT(*) as count FROM \`${tableName}\``
        );
        const count = countResult[0].count;
        totalRecords += count;
        console.log(`  ${tableName}: ${count.toLocaleString()} 条`);
      } catch (error) {
        console.log(`  ${tableName}: 查询失败`);
      }
    }
    console.log(`  📈 AI系统总记录数: ${totalRecords.toLocaleString()} 条`);
    
    // 3. 检查数据质量
    console.log('\n=== 3. 数据质量检查 ===');
    
    // 3.1 检查孤立数据
    const [orphanMessages] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM ai_messages m 
      LEFT JOIN ai_conversations c ON m.conversation_id = c.id 
      WHERE c.id IS NULL
    `);
    console.log(`  孤立消息数: ${orphanMessages[0].count} 条`);
    
    // 3.2 检查用户数据一致性
    const [orphanConversations] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM ai_conversations c 
      LEFT JOIN users u ON c.external_user_id = u.id 
      WHERE c.external_user_id IS NOT NULL AND u.id IS NULL
    `);
    console.log(`  无对应用户的对话: ${orphanConversations[0].count} 个`);
    
    // 3.3 检查表结构完整性
    console.log('\n  📋 表结构检查：');
    
    // 检查 ai_model_usage 表的 token_count 字段
    const [usageColumns] = await connection.execute('DESCRIBE ai_model_usage');
    const hasTokenCount = usageColumns.some(col => col.Field === 'token_count');
    console.log(`    ai_model_usage.token_count: ${hasTokenCount ? '✅ 存在' : '❌ 不存在'}`);
    
    // 4. 性能指标
    console.log('\n=== 4. 性能指标分析 ===');
    
    // 4.1 检查表大小
    console.log('  📏 表大小分析：');
    for (const tableName of ['ai_conversations', 'ai_messages']) {
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
          const totalSize = parseFloat(size.data_mb) + parseFloat(size.index_mb);
          console.log(`    ${tableName}: ${size.table_rows}行, ${totalSize.toFixed(2)}MB`);
        }
      } catch (error) {
        console.log(`    ${tableName}: 查询失败`);
      }
    }
    
    // 4.2 检查索引情况
    console.log('\n  🔍 索引检查：');
    const [indexes] = await connection.execute(`
      SELECT table_name, index_name, column_name, index_type
      FROM information_schema.statistics 
      WHERE table_schema = ? AND table_name LIKE 'ai_%'
      ORDER BY table_name, index_name
    `, [dbConfig.database]);
    
    const indexMap = {};
    indexes.forEach(idx => {
      const key = `${idx.table_name}.${idx.index_name}`;
      if (!indexMap[key]) {
        indexMap[key] = {
          table: idx.table_name,
          index: idx.index_name,
          columns: [],
          type: idx.index_type
        };
      }
      indexMap[key].columns.push(idx.column_name);
    });
    
    Object.values(indexMap).forEach(idx => {
      console.log(`    ${idx.table}: ${idx.index} (${idx.columns.join(', ')}) [${idx.type}]`);
    });
    
    // 5. 业务逻辑验证
    console.log('\n=== 5. 业务逻辑验证 ===');
    
    // 5.1 检查消息角色分布
    const [roleStats] = await connection.execute(`
      SELECT role, COUNT(*) as count 
      FROM ai_messages 
      GROUP BY role 
      ORDER BY count DESC
    `);
    console.log('  消息角色分布：');
    roleStats.forEach(role => {
      console.log(`    ${role.role}: ${role.count.toLocaleString()} 条`);
    });
    
    // 5.2 检查对话状态分布
    const [statusStats] = await connection.execute(`
      SELECT 
        is_archived,
        COUNT(*) as count,
        AVG(message_count) as avg_messages
      FROM ai_conversations 
      GROUP BY is_archived
    `);
    console.log('  对话状态分布：');
    statusStats.forEach(stat => {
      const status = stat.is_archived === 1 ? '已归档' : '未归档';
      console.log(`    ${status}: ${stat.count} 个对话, 平均${stat.avg_messages?.toFixed(1) || 0}条消息`);
    });
    
    // 6. 优化建议
    console.log('\n=== 6. 优化效果评估 ===');
    
    if (stats.empty_percentage < 10) {
      console.log('✅ 数据质量优秀 - 空对话比例低于10%');
    } else if (stats.empty_percentage < 30) {
      console.log('🟡 数据质量良好 - 空对话比例在可接受范围内');
    } else {
      console.log('🔴 数据质量需要改善 - 空对话比例较高');
    }
    
    if (orphanMessages[0].count === 0 && orphanConversations[0].count === 0) {
      console.log('✅ 数据完整性良好 - 无孤立数据');
    } else {
      console.log('⚠️  存在孤立数据，建议进一步清理');
    }
    
    // 7. 监控建议
    console.log('\n=== 7. 后续监控建议 ===');
    console.log('🔍 建议监控指标：');
    console.log(`  - 空对话比例: 当前 ${stats.empty_percentage}% (目标 <10%)`);
    console.log(`  - 平均消息数: 当前 ${stats.avg_messages?.toFixed(1) || 0} (目标 >5)`);
    console.log(`  - 总记录数: ${totalRecords.toLocaleString()} (监控增长趋势)`);
    console.log(`  - 孤立数据: ${orphanMessages[0].count + orphanConversations[0].count} (目标 =0)`);
    
    console.log('\n🎯 优化目标：');
    console.log('  - 保持空对话比例 < 10%');
    console.log('  - 确保数据完整性，无孤立数据');
    console.log('  - 监控异常用户行为');
    console.log('  - 定期执行数据清理任务');
    
    console.log('\n✅ AI系统优化效果验证完成！');
    
  } catch (error) {
    console.error('❌ 验证失败：', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 运行验证
verifyAIOptimization();