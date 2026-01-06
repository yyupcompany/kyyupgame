#!/usr/bin/env node

/**
 * 最终验证测试脚本
 * 测试修复后的AI字典查询是否能返回有意义的数据
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
  port: parseInt(process.env.DB_PORT || '43906'),
  database: process.env.DB_NAME || 'kargerdensales',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pwk5ls7j',
  charset: 'utf8mb4'
};

async function testQueries() {
  let connection;
  
  try {
    console.log('连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    // 读取AI字典文件
    const dictionaryPath = path.join(__dirname, '../src/config/ai-dictionaries/05-query-templates.json');
    const dictionary = JSON.parse(fs.readFileSync(dictionaryPath, 'utf8'));
    
    console.log('\n=== AI字典查询测试结果 ===');
    console.log('='.repeat(80));
    
    const testResults = [];
    let successCount = 0;
    let totalCount = 0;
    
    for (const [queryName, queryData] of Object.entries(dictionary.queryTemplates)) {
      if (typeof queryData === 'string' || queryName.startsWith('//')) {
        continue; // 跳过注释
      }
      
      if (!queryData.sql) {
        console.log(`⚠ ${queryName}: 没有SQL查询`);
        continue;
      }
      
      totalCount++;
      
      try {
        const [rows] = await connection.execute(queryData.sql);
        const hasData = rows.length > 0;
        const result = hasData ? rows[0] : null;
        
        console.log(`✓ ${queryName}`);
        console.log(`  SQL: ${queryData.sql}`);
        console.log(`  结果: ${hasData ? JSON.stringify(result) : '无数据'}`);
        console.log(`  响应模板: ${queryData.response}`);
        console.log('');
        
        testResults.push({
          queryName,
          success: true,
          hasData,
          result,
          sql: queryData.sql,
          response: queryData.response
        });
        
        successCount++;
        
      } catch (error) {
        console.log(`✗ ${queryName}: ${error.message}`);
        console.log(`  SQL: ${queryData.sql}`);
        console.log('');
        
        testResults.push({
          queryName,
          success: false,
          error: error.message,
          sql: queryData.sql
        });
      }
    }
    
    console.log('='.repeat(80));
    console.log(`测试完成! 成功: ${successCount}/${totalCount} (${(successCount/totalCount*100).toFixed(1)}%)`);
    
    // 统计有数据的查询
    const queriesWithData = testResults.filter(r => r.success && r.hasData);
    const queriesWithoutData = testResults.filter(r => r.success && !r.hasData);
    
    console.log(`\n有数据的查询: ${queriesWithData.length}`);
    queriesWithData.forEach(q => {
      console.log(`  - ${q.queryName}: ${JSON.stringify(q.result)}`);
    });
    
    console.log(`\n无数据的查询: ${queriesWithoutData.length}`);
    queriesWithoutData.forEach(q => {
      console.log(`  - ${q.queryName}`);
    });
    
    // 生成实际数据统计
    console.log('\n=== 实际数据统计 ===');
    
    const dataStats = [
      { name: '在读学生', sql: 'SELECT COUNT(*) as count FROM students WHERE status = 1' },
      { name: '在职教师', sql: 'SELECT COUNT(*) as count FROM teachers WHERE status = 1' },
      { name: '正常班级', sql: 'SELECT COUNT(*) as count FROM classes WHERE status = 1' },
      { name: '活动总数', sql: 'SELECT COUNT(*) as count FROM activities' },
      { name: '今年招生申请', sql: 'SELECT COUNT(*) as count FROM enrollment_applications WHERE YEAR(created_at) = YEAR(NOW())' },
      { name: '系统用户', sql: 'SELECT COUNT(*) as count FROM users WHERE status = "active"' }
    ];
    
    for (const stat of dataStats) {
      try {
        const [rows] = await connection.execute(stat.sql);
        console.log(`${stat.name}: ${rows[0].count}`);
      } catch (error) {
        console.log(`${stat.name}: 查询失败 - ${error.message}`);
      }
    }
    
    // 保存测试结果
    const reportPath = path.join(__dirname, '../reports/final-validation-test-report.json');
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        total: totalCount,
        success: successCount,
        successRate: (successCount/totalCount*100).toFixed(1),
        queriesWithData: queriesWithData.length,
        queriesWithoutData: queriesWithoutData.length
      },
      testResults,
      dataStats: await Promise.all(dataStats.map(async stat => {
        try {
          const [rows] = await connection.execute(stat.sql);
          return { name: stat.name, count: rows[0].count, success: true };
        } catch (error) {
          return { name: stat.name, error: error.message, success: false };
        }
      }))
    }, null, 2));
    
    console.log(`\n详细测试报告已保存到: ${reportPath}`);
    
  } catch (error) {
    console.error('测试过程中出错:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 运行测试
if (require.main === module) {
  testQueries().catch(console.error);
}

module.exports = { testQueries };
