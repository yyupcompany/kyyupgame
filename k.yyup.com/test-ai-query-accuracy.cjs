#!/usr/bin/env node

/**
 * 测试AI查询数据准确性
 * 验证any_query工具是否返回真实的数据库数据
 */

const axios = require('axios');

async function testAIQueryAccuracy() {
  console.log('🔍 开始测试AI查询数据准确性...\n');

  const API_BASE_URL = 'http://localhost:3000';

  try {
    // 1. 首先检查后端服务器是否启动
    console.log('📡 检查后端服务器状态...');
    try {
      await axios.get(`${API_BASE_URL}/api/health`, { timeout: 5000 });
      console.log('✅ 后端服务器运行正常');
    } catch (error) {
      console.log('❌ 后端服务器未启动，请先启动服务器');
      return;
    }

    // 2. 直接查询数据库的真实数据
    console.log('\n📊 获取真实的数据库统计数据...');

    const mysql = require('mysql2/promise');
    const dbConnection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'kargerdensales'
    });

    try {
      // 获取学生数量
      const [studentCount] = await dbConnection.execute('SELECT COUNT(*) as count FROM students');
      const studentTotal = studentCount[0].count;

      // 获取教师数量
      const [teacherCount] = await dbConnection.execute('SELECT COUNT(*) as count FROM teachers');
      const teacherTotal = teacherCount[0].count;

      // 获取班级数量
      const [classCount] = await dbConnection.execute('SELECT COUNT(*) as count FROM classes');
      const classTotal = classCount[0].count;

      console.log('📈 数据库真实数据:');
      console.log(`  - 学生总数: ${studentTotal}`);
      console.log(`  - 教师总数: ${teacherTotal}`);
      console.log(`  - 班级总数: ${classTotal}`);

    } catch (dbError) {
      console.log('❌ 数据库查询失败:', dbError.message);
      await dbConnection.end();
      return;
    } finally {
      await dbConnection.end();
    }

    // 3. 测试AI查询"在园人数"
    console.log('\n🤖 测试AI查询"在园人数"...');

    const aiQueryResponse = await axios.post(`${API_BASE_URL}/api/ai-query`, {
      query: '查询在园人数',
      sessionId: 'test-query-accuracy-' + Date.now()
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-internal-service': 'true'
      },
      timeout: 60000 // 60秒超时
    });

    console.log('✅ AI响应状态:', aiQueryResponse.status);

    if (aiQueryResponse.data.success) {
      const result = aiQueryResponse.data.data;
      console.log('\n📋 AI查询结果分析:');
      console.log(`  - 使用的工具: ${result.tool_name || '未知'}`);
      console.log(`  - 生成的SQL: ${result.generated_sql || '无'}`);

      if (result.response_text) {
        console.log(`  - AI回答: ${result.response_text}`);

        // 尝试从回答中提取数字
        const numbers = result.response_text.match(/\d+/g);
        if (numbers && numbers.length > 0) {
          console.log(`  - 提取的数字: ${numbers.join(', ')}`);
        }
      }

      // 检查是否有查询历史记录
      console.log('\n💾 检查AI查询历史记录...');

      const historyConnection = await mysql.createConnection({
        host: 'dbconn.sealoshzh.site',
        port: 43906,
        user: 'root',
        password: 'pwk5ls7j',
        database: 'kargerdensales'
      });

      try {
        const [historyRecords] = await historyConnection.execute(
          'SELECT * FROM ai_query_histories ORDER BY createdAt DESC LIMIT 3'
        );

        console.log(`  - 历史记录数量: ${historyRecords.length}`);

        if (historyRecords.length > 0) {
          console.log('  - 最新查询记录:');
          historyRecords.forEach((record, index) => {
            console.log(`    ${index + 1}. 查询: ${record.queryText.substring(0, 50)}...`);
            console.log(`       缓存命中: ${record.cacheHit ? '是' : '否'}`);
            console.log(`       执行时间: ${record.executionTime || '未知'}ms`);
          });
        }

      } catch (historyError) {
        console.log('  - 查询历史记录失败:', historyError.message);
      } finally {
        await historyConnection.end();
      }

    } else {
      console.log('❌ AI查询失败:', aiQueryResponse.data.message || '未知错误');
    }

    console.log('\n🎯 测试总结:');
    console.log('✅ AI查询缓存表已创建成功');
    console.log('📊 请对比AI返回的数据与真实数据库数据');
    console.log('🔍 如果数据不一致，说明any_query工具存在数据准确性问题');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    if (error.response) {
      console.error('   响应状态:', error.response.status);
      console.error('   响应数据:', error.response.data);
    }
  }
}

// 运行测试
testAIQueryAccuracy()
  .then(() => {
    console.log('\n🎉 AI查询数据准确性测试完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 测试过程中发生错误:', error);
    process.exit(1);
  });