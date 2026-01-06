#!/usr/bin/env node

/**
 * 检查ai_query_histories表结构
 */

const mysql = require('mysql2/promise');

async function checkTableStructure() {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });

  try {
    console.log('🔍 检查ai_query_histories表结构...\n');

    const [columns] = await connection.execute('DESCRIBE ai_query_histories');

    console.log('📋 表结构:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    console.log('\n🆔 检查是否存在user_id字段:');
    const hasUserId = columns.some(col => col.Field === 'user_id');
    const hasUserIdCamel = columns.some(col => col.Field === 'userId');

    console.log(`  - user_id: ${hasUserId ? '✅ 存在' : '❌ 不存在'}`);
    console.log(`  - userId: ${hasUserIdCamel ? '✅ 存在' : '❌ 不存在'}`);

    if (!hasUserId && !hasUserIdCamel) {
      console.log('\n⚠️  需要修复表结构，添加userId字段');

      // 修复表结构
      console.log('🔧 正在修复表结构...');
      await connection.execute('ALTER TABLE ai_query_histories ADD COLUMN userId INT NOT NULL DEFAULT 1 COMMENT \'用户ID\'');
      console.log('✅ userId字段添加成功');
    }

  } catch (error) {
    console.error('❌ 检查表结构失败:', error.message);
  } finally {
    await connection.end();
  }
}

// 执行检查
checkTableStructure()
  .then(() => {
    console.log('\n🎉 表结构检查完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 检查过程中发生错误:', error);
    process.exit(1);
  });