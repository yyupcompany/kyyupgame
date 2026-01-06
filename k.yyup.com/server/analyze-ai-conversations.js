const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
};

async function analyzeAIConversations() {
  let connection;
  
  try {
    console.log('正在连接到远程MySQL数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功！');
    
    // 1. 查看表结构
    console.log('\n=== 1. ai_conversations 表结构 ===');
    const [columns] = await connection.execute(
      'SHOW FULL COLUMNS FROM ai_conversations'
    );
    
    console.log('字段结构：');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `${col.Key}` : ''} ${col.Default ? `DEFAULT ${col.Default}` : ''} ${col.Comment ? `// ${col.Comment}` : ''}`);
    });
    
    // 2. 查看索引
    console.log('\n=== 2. 索引信息 ===');
    const [indexes] = await connection.execute(
      'SHOW INDEX FROM ai_conversations'
    );
    
    if (indexes.length > 0) {
      console.log('索引：');
      indexes.forEach(idx => {
        console.log(`  - ${idx.Key_name}: ${idx.Column_name} (${idx.Index_type}) ${idx.Non_unique ? '非唯一' : '唯一'}`);
      });
    }
    
    // 3. 数据抽样分析
    console.log('\n=== 3. 数据内容抽样分析 ===');
    
    // 最新10条记录
    const [recentRecords] = await connection.execute(
      'SELECT id, external_user_id, title, message_count, created_at, updated_at, is_archived ' +
      'FROM ai_conversations ORDER BY created_at DESC LIMIT 10'
    );
    
    console.log('最新10条对话记录：');
    recentRecords.forEach(record => {
      console.log(`  - ID: ${record.id} | 用户: ${record.external_user_id} | 标题: ${record.title || '无标题'} | 消息数: ${record.message_count} | 归档: ${record.is_archived} | 创建: ${record.created_at}`);
    });
    
    // 4. 统计信息
    console.log('\n=== 4. 统计信息 ===');
    
    // 总记录数
    const [totalCount] = await connection.execute(
      'SELECT COUNT(*) as total FROM ai_conversations'
    );
    console.log(`总记录数: ${totalCount[0].total}`);
    
    // 按归档状态统计
    const [archiveStats] = await connection.execute(
      'SELECT is_archived, COUNT(*) as count FROM ai_conversations GROUP BY is_archived ORDER BY count DESC'
    );
    console.log('按归档状态统计：');
    archiveStats.forEach(stat => {
      console.log(`  - ${stat.is_archived === 1 ? '已归档' : '未归档'}: ${stat.count} 条`);
    });
    
    // 按用户统计
    const [userStats] = await connection.execute(
      'SELECT external_user_id, COUNT(*) as conversation_count, AVG(message_count) as avg_messages ' +
      'FROM ai_conversations GROUP BY external_user_id ORDER BY conversation_count DESC LIMIT 10'
    );
    console.log('TOP 10 活跃用户：');
    userStats.forEach(stat => {
      console.log(`  - 用户 ${stat.external_user_id}: ${stat.conversation_count} 个对话, 平均 ${Math.round(stat.avg_messages)} 条消息/对话`);
    });
    
    // 时间分布
    const [timeStats] = await connection.execute(
      'SELECT DATE(created_at) as date, COUNT(*) as count FROM ai_conversations ' +
      'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) ' +
      'GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 10'
    );
    console.log('最近10天创建趋势：');
    timeStats.forEach(stat => {
      console.log(`  - ${stat.date}: ${stat.count} 条`);
    });
    
    // 消息数量分布
    const [messageStats] = await connection.execute(
      'SELECT message_count, COUNT(*) as conversation_count FROM ai_conversations ' +
      'GROUP BY message_count ORDER BY message_count'
    );
    console.log('消息数量分布：');
    messageStats.forEach(stat => {
      console.log(`  - ${stat.message_count} 条消息: ${stat.conversation_count} 个对话`);
    });
    
    // 5. 查看完整的一条记录示例
    console.log('\n=== 5. 完整记录示例 ===');
    if (recentRecords.length > 0) {
      const [fullRecord] = await connection.execute(
        'SELECT * FROM ai_conversations WHERE id = ? LIMIT 1',
        [recentRecords[0].id]
      );
      
      if (fullRecord.length > 0) {
        console.log('最新一条完整记录：');
        const record = fullRecord[0];
        Object.keys(record).forEach(key => {
          let value = record[key];
          if (value && value.length > 200) {
            value = value.substring(0, 200) + '...[截断]';
          }
          console.log(`  ${key}: ${value}`);
        });
      }
    }
    
    // 6. 关联的AI消息
    console.log('\n=== 6. 关联AI消息统计 ===');
    const [messageCount] = await connection.execute(
      'SELECT conversation_id, COUNT(*) as msg_count FROM ai_messages GROUP BY conversation_id ORDER BY msg_count DESC LIMIT 5'
    );
    console.log('消息最多的5个对话：');
    messageCount.forEach(msg => {
      console.log(`  - 对话 ${msg.conversation_id}: ${msg.msg_count} 条消息`);
    });
    
    // 7. 大字段分析
    console.log('\n=== 7. 大字段分析 ===');
    const [largeFields] = await connection.execute(
      'SELECT id, external_user_id, CHAR_LENGTH(page_context) as page_context_length, CHAR_LENGTH(metadata) as metadata_length, CHAR_LENGTH(summary) as summary_length ' +
      'FROM ai_conversations WHERE CHAR_LENGTH(page_context) > 1000 OR CHAR_LENGTH(metadata) > 1000 OR CHAR_LENGTH(summary) > 1000 ' +
      'ORDER BY CHAR_LENGTH(page_context) + CHAR_LENGTH(metadata) + CHAR_LENGTH(summary) DESC LIMIT 5'
    );
    console.log('大字段记录分析：');
    largeFields.forEach(record => {
      console.log(`  - ID ${record.id}: page_context=${record.page_context_length}字符, metadata=${record.metadata_length}字符, summary=${record.summary_length}字符`);
    });
    
    console.log('\n=== 分析完成 ===');
    
  } catch (error) {
    console.error('❌ 数据库分析失败：', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 运行分析
analyzeAIConversations();