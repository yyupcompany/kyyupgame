#!/usr/bin/env node

/**
 * 手动创建AI查询历史表
 */

const mysql = require('mysql2/promise');

async function createAIQueryHistoryTable() {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });

  try {
    console.log('🔍 检查ai_query_histories表是否存在...');

    const [tables] = await connection.execute('SHOW TABLES LIKE "ai_query_histories"');

    if (tables.length > 0) {
      console.log('✅ ai_query_histories表已存在');
      return;
    }

    console.log('📝 创建ai_query_histories表...');

    const createTableSQL = `
      CREATE TABLE ai_query_histories (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL COMMENT '用户ID',
        queryText TEXT NOT NULL COMMENT '查询内容',
        queryHash VARCHAR(64) NOT NULL COMMENT '查询内容的MD5哈希值，用于快速匹配重复查询',
        queryType ENUM('data_query', 'ai_response') NOT NULL COMMENT '查询类型：数据查询或AI问答',
        responseData JSON NULL COMMENT '查询结果数据（JSON格式）',
        responseText TEXT NULL COMMENT 'AI回答文本（用于非数据查询）',
        generatedSQL TEXT NULL COMMENT '生成的SQL语句',
        executionTime INT NULL COMMENT '执行时间（毫秒）',
        modelUsed VARCHAR(100) NULL COMMENT '使用的AI模型名称',
        sessionId VARCHAR(100) NULL COMMENT '会话ID',
        cacheHit BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否命中缓存',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_userId (userId),
        INDEX idx_queryHash (queryHash),
        INDEX idx_userId_queryHash (userId, queryHash),
        INDEX idx_createdAt (createdAt),
        INDEX idx_queryType (queryType)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI查询历史记录表';
    `;

    await connection.execute(createTableSQL);
    console.log('✅ ai_query_histories表创建成功');

    // 验证表是否创建成功
    const [checkTables] = await connection.execute('SHOW TABLES LIKE "ai_query_histories"');
    if (checkTables.length > 0) {
      console.log('✅ 验证成功：ai_query_histories表已存在');

      // 显示表结构
      const [columns] = await connection.execute('DESCRIBE ai_query_histories');
      console.log('📋 表结构:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });
    } else {
      console.log('❌ 验证失败：表创建后仍不存在');
    }

  } catch (error) {
    console.error('❌ 创建表失败:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

// 执行脚本
createAIQueryHistoryTable()
  .then(() => {
    console.log('🎉 AI查询历史表创建完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 脚本执行失败:', error);
    process.exit(1);
  });