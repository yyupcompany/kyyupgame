#!/usr/bin/env node

/**
 * 验证数据库实际数据
 * 检查学生、教师、班级的真实数量
 */

const mysql = require('mysql2/promise');

async function verifyDatabaseData() {
  console.log('🔍 验证数据库中的实际数据...\n');

  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });

  try {
    // 检查所有表
    console.log('📋 检查数据库中的所有表...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('数据库中的表数量:', tables.length);

    const tableNames = tables.map(row => Object.values(row)[0]);
    console.log('表列表:', tableNames.slice(0, 10).join(', ') + (tableNames.length > 10 ? '...' : ''));

    // 检查学生表
    console.log('\n👶 检查学生相关数据...');
    const studentTables = tableNames.filter(name => name.toLowerCase().includes('student'));
    console.log('学生相关表:', studentTables);

    for (const table of studentTables) {
      const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`${table}: ${count[0].count} 条记录`);

      if (count[0].count > 0 && count[0].count < 10) {
        const [samples] = await connection.execute(`SELECT * FROM ${table} LIMIT 3`);
        console.log(`  样本数据:`, samples.map(row => ({ id: row.id, name: row.name || row.student_name || row.title || 'N/A' })));
      }
    }

    // 检查教师表
    console.log('\n👨‍🏫 检查教师相关数据...');
    const teacherTables = tableNames.filter(name => name.toLowerCase().includes('teacher'));
    console.log('教师相关表:', teacherTables);

    for (const table of teacherTables) {
      const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`${table}: ${count[0].count} 条记录`);

      if (count[0].count > 0 && count[0].count < 10) {
        const [samples] = await connection.execute(`SELECT * FROM ${table} LIMIT 3`);
        console.log(`  样本数据:`, samples.map(row => ({ id: row.id, name: row.name || row.teacher_name || row.title || 'N/A' })));
      }
    }

    // 检查班级表
    console.log('\n🏫 检查班级相关数据...');
    const classTables = tableNames.filter(name => name.toLowerCase().includes('class'));
    console.log('班级相关表:', classTables);

    for (const table of classTables) {
      const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`${table}: ${count[0].count} 条记录`);

      if (count[0].count > 0 && count[0].count < 10) {
        const [samples] = await connection.execute(`SELECT * FROM ${table} LIMIT 3`);
        console.log(`  样本数据:`, samples.map(row => ({ id: row.id, name: row.name || row.class_name || row.title || 'N/A' })));
      }
    }

    // 检查用户表
    console.log('\n👤 检查用户数据...');
    if (tableNames.includes('Users')) {
      const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM Users');
      console.log(`Users表: ${userCount[0].count} 条记录`);

      const [userSamples] = await connection.execute('SELECT id, username, email FROM Users LIMIT 3');
      console.log('  用户样本:', userSamples);
    }

    // 检查AI查询历史表
    console.log('\n🤖 检查AI查询历史表...');
    if (tableNames.includes('ai_query_histories')) {
      const [historyCount] = await connection.execute('SELECT COUNT(*) as count FROM ai_query_histories');
      console.log(`ai_query_histories表: ${historyCount[0].count} 条记录`);

      if (historyCount[0].count > 0) {
        const [recentHistory] = await connection.execute(`
          SELECT queryText, responseText, createdAt, cacheHit
          FROM ai_query_histories
          ORDER BY createdAt DESC
          LIMIT 3
        `);
        console.log('  最近查询:', recentHistory.map(h => ({
          query: h.queryText.substring(0, 50) + '...',
          response: h.responseText ? h.responseText.substring(0, 50) + '...' : 'N/A',
          cached: h.cacheHit ? '是' : '否'
        })));
      }
    }

    console.log('\n📊 数据总结:');
    console.log('✅ 数据库连接成功');
    console.log(`📋 总表数: ${tables.length}`);
    console.log(`👶 学生表数: ${studentTables.length}`);
    console.log(`👨‍🏫 教师表数: ${teacherTables.length}`);
    console.log(`🏫 班级表数: ${classTables.length}`);
    console.log(`🤖 AI查询历史表: ${tableNames.includes('ai_query_histories') ? '存在' : '不存在'}`);

  } catch (error) {
    console.error('❌ 数据库查询失败:', error.message);
  } finally {
    await connection.end();
  }
}

// 运行验证
verifyDatabaseData()
  .then(() => {
    console.log('\n🎉 数据库数据验证完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 验证过程中发生错误:', error);
    process.exit(1);
  });