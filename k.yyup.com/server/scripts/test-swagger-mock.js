#!/usr/bin/env node

/**
 * 测试 Swagger Mock 服务器
 * 验证 mock 服务是否正常工作
 */

const http = require('http');

const MOCK_PORT = 3010;
const TIMEOUT = 5000;

console.log('🔍 测试 Swagger Mock 服务器');
console.log('='.repeat(50));

// 测试函数
function testEndpoint(path, description) {
  return new Promise((resolve) => {
    console.log(`\n📡 测试: ${description}`);
    console.log(`   URL: http://localhost:${MOCK_PORT}${path}`);

    const startTime = Date.now();

    const req = http.get(`http://localhost:${MOCK_PORT}${path}`, { timeout: TIMEOUT }, (res) => {
      const duration = Date.now() - startTime;
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`   ✅ 状态码: ${res.statusCode}`);
          console.log(`   ⏱️ 响应时间: ${duration}ms`);
          console.log(`   📦 数据结构: ${parsed ? 'JSON' : '未知'}`);

          // 检查是否符合预期结构
          if (parsed && (parsed.success !== undefined || parsed.data !== undefined)) {
            console.log(`   ✨ 符合 API 响应格式`);
          } else if (parsed && Array.isArray(parsed)) {
            console.log(`   ✨ 响应为数组 (${parsed.length} 项)`);
          }

          resolve({ success: true, status: res.statusCode, data: parsed });
        } catch (error) {
          console.log(`   ⚠️ 数据解析失败: ${error.message}`);
          resolve({ success: false, status: res.statusCode, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      console.log(`   ❌ 请求失败: ${error.message}`);
      console.log(`   ⏱️ 耗时: ${duration}ms`);
      resolve({ success: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`   ⏰ 请求超时 (>${TIMEOUT}ms)`);
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

// 主测试流程
(async () => {
  const results = [];

  // 测试健康检查
  results.push(await testEndpoint('/__inspect/', 'API 检查端点'));

  // 测试一些常见的 API 端点
  const testPaths = [
    { path: '/api/users', description: '用户列表' },
    { path: '/api/activities', description: '活动列表' },
    { path: '/api/students', description: '学生列表' },
    { path: '/api/teachers', description: '教师列表' },
    { path: '/api/classes', description: '班级列表' }
  ];

  for (const test of testPaths) {
    results.push(await testEndpoint(test.path, test.description));
  }

  // 汇总结果
  console.log('\n📊 测试结果汇总');
  console.log('='.repeat(50));

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  console.log(`✅ 成功: ${successCount}/${totalCount}`);
  console.log(`❌ 失败: ${totalCount - successCount}/${totalCount}`);

  const successRate = ((successCount / totalCount) * 100).toFixed(1);
  console.log(`📈 成功率: ${successRate}%`);

  if (successRate === '100.0') {
    console.log('\n🎉 所有测试通过！Mock 服务器运行正常');
    process.exit(0);
  } else if (successRate >= '60.0') {
    console.log('\n⚠️ 部分测试通过，Mock 服务器基本正常');
    process.exit(0);
  } else {
    console.log('\n❌ 多数测试失败，请检查 Mock 服务器配置');
    process.exit(1);
  }
})();
