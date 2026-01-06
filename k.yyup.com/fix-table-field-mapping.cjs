#!/usr/bin/env node

/**
 * 修复AI查询历史表字段映射问题
 * 将userId字段映射为user_id以匹配Sequelize的默认命名约定
 */

const mysql = require('mysql2/promise');

async function fixTableFieldMapping() {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });

  try {
    console.log('🔧 修复AI查询历史表字段映射...');

    // 检查当前表结构
    const [columns] = await connection.execute('DESCRIBE ai_query_histories');

    console.log('📋 当前表结构:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    // 检查是否存在user_id字段
    const hasUserId = columns.some(col => col.Field === 'user_id');
    const hasUserIdCamel = columns.some(col => col.Field === 'userId');

    console.log(`\n🆔 字段检查:`);
    console.log(`  - user_id: ${hasUserId ? '✅ 存在' : '❌ 不存在'}`);
    console.log(`  - userId: ${hasUserIdCamel ? '✅ 存在' : '❌ 不存在'}`);

    if (hasUserIdCamel && !hasUserId) {
      console.log('\n🔧 需要修复字段映射: userId -> user_id');

      // 重命名字段以匹配Sequelize约定
      console.log('🔄 正在重命名字段...');
      await connection.execute('ALTER TABLE ai_query_histories CHANGE COLUMN userId user_id INT NOT NULL COMMENT \'用户ID\'');

      // 重命名其他字段以保持一致性
      console.log('🔄 正在重命名queryText字段...');
      await connection.execute('ALTER TABLE ai_query_histories CHANGE COLUMN queryText query_text TEXT NOT NULL COMMENT \'查询内容\'');

      console.log('🔄 正在重命名queryHash字段...');
      await connection.execute('ALTER TABLE ai_query_histories CHANGE COLUMN queryHash query_hash VARCHAR(64) NOT NULL COMMENT \'查询内容的MD5哈希值，用于快速匹配重复查询\'');

      console.log('🔄 正在重命名queryType字段...');
      await connection.execute('ALTER TABLE ai_query_histories CHANGE COLUMN queryType query_type ENUM("data_query", "ai_response") NOT NULL COMMENT \'查询类型：数据查询或AI问答\'');

      console.log('🔄 正在重命名responseData字段...');
      await connection.execute('ALTER TABLE ai_query_histories CHANGE COLUMN responseData response_data JSON NULL COMMENT \'查询结果数据（JSON格式）\'');

      console.log('🔄 正在重命名responseText字段...');
      await connection.execute('ALTER TABLE ai_query_histories CHANGE COLUMN responseText response_text TEXT NULL COMMENT \'AI回答文本（用于非数据查询）\'');

      console.log('🔄 正在重命名generatedSQL字段...');
      await connection.execute('ALTER TABLE ai_query_histories CHANGE COLUMN generatedSQL generated_sql TEXT NULL COMMENT \'生成的SQL语句\'');

      console.log('🔄 正在重命名executionTime字段...');
      await connection.execute('ALTER TABLE ai_query_histories CHANGE COLUMN executionTime execution_time INT NULL COMMENT \'执行时间（毫秒）\'');

      console.log('🔄 正在重命名modelUsed字段...');
      await connection.execute('ALTER TABLE ai_query_histories CHANGE COLUMN modelUsed model_used VARCHAR(100) NULL COMMENT \'使用的AI模型名称\'');

      console.log('🔄 正在重命名sessionId字段...');
      await connection.execute('ALTER TABLE ai_query_histories CHANGE COLUMN sessionId session_id VARCHAR(100) NULL COMMENT \'会话ID\'');

      console.log('🔄 正在重命名cacheHit字段...');
      await connection.execute('ALTER TABLE ai_query_histories CHANGE COLUMN cacheHit cache_hit BOOLEAN NOT NULL DEFAULT FALSE COMMENT \'是否命中缓存\'');

      console.log('✅ 所有字段重命名完成');

    } else if (hasUserId) {
      console.log('\n✅ user_id字段已存在，无需修复');
    } else {
      console.log('\n❌ 未找到相关字段，需要检查表结构');
    }

    // 验证修复后的表结构
    console.log('\n🔍 验证修复后的表结构...');
    const [newColumns] = await connection.execute('DESCRIBE ai_query_histories');

    console.log('📋 修复后表结构:');
    newColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

  } catch (error) {
    console.error('❌ 修复表结构失败:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

// 执行修复
fixTableFieldMapping()
  .then(() => {
    console.log('\n🎉 AI查询历史表字段映射修复完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 修复过程中发生错误:', error);
    process.exit(1);
  });