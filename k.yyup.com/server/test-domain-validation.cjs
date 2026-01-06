#!/usr/bin/env node

/**
 * 域名验证测试脚本
 * 测试修复后的域名验证功能
 */

const http = require('http');
const https = require('https');

// 测试配置
const API_BASE_URL = 'http://localhost:3000';
const TEST_CASES = [
  // 合法域名测试
  {
    name: '本地开发环境',
    headers: { 'Origin': 'http://localhost:5173', 'Host': 'localhost:5173' },
    expectedStatus: 200,
    expectedHeaders: { 'x-demo-mode': 'true' }
  },
  {
    name: '生产域名 k.yyup.cc',
    headers: { 'Origin': 'https://k.yyup.cc', 'Host': 'k.yyup.cc' },
    expectedStatus: 200,
    expectedHeaders: { 'x-demo-mode': 'true' }
  },
  {
    name: '统一认证中心',
    headers: { 'Origin': 'https://rent.yyup.cc', 'Host': 'rent.yyup.cc' },
    expectedStatus: 200,
    expectedHeaders: { 'x-demo-mode': 'true' }
  },
  {
    name: '子租户域名',
    headers: { 'Origin': 'https://demo.k.yyup.cc', 'Host': 'demo.k.yyup.cc' },
    expectedStatus: 200,
    expectedHeaders: { 'x-demo-mode': 'false' }
  },

  // 非法域名测试
  {
    name: '未授权域名',
    headers: { 'Origin': 'https://evil-site.com', 'Host': 'evil-site.com' },
    expectedStatus: 403,
    expectedError: 'UNAUTHORIZED_DOMAIN'
  },
  {
    name: '可疑域名',
    headers: { 'Origin': 'https://phishing-site.xyz', 'Host': 'phishing-site.xyz' },
    expectedStatus: 403,
    expectedError: 'UNAUTHORIZED_DOMAIN'
  },

  // 边界情况测试
  {
    name: '缺少Origin头',
    headers: { 'Host': 'localhost:3000' },
    expectedStatus: 200,
    expectedHeaders: { 'x-demo-mode': 'true' }
  },
  {
    name: '缺少Host头',
    headers: { 'Origin': 'http://localhost:5173' },
    expectedStatus: 400,
    expectedError: 'MISSING_HOST'
  }
];

/**
 * 执行单个测试用例
 */
async function runTestCase(testCase) {
  return new Promise((resolve) => {
    console.log(`\n🧪 测试: ${testCase.name}`);
    console.log(`   请求头:`, testCase.headers);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...testCase.headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const result = {
          name: testCase.name,
          status: res.statusCode,
          headers: res.headers,
          data: data ? JSON.parse(data) : null
        };

        // 验证结果
        if (res.statusCode === testCase.expectedStatus) {
          console.log(`   ✅ 状态码正确: ${res.statusCode}`);

          // 检查期望的响应头
          if (testCase.expectedHeaders) {
            for (const [key, value] of Object.entries(testCase.expectedHeaders)) {
              const headerKey = key.toLowerCase();
              if (res.headers[headerKey] === value) {
                console.log(`   ✅ 响应头 ${key}: ${value}`);
              } else {
                console.log(`   ❌ 响应头 ${key}: 期望 ${value}, 实际 ${res.headers[headerKey]}`);
              }
            }
          }

          // 检查期望的错误信息
          if (testCase.expectedError && result.data && result.data.code === testCase.expectedError) {
            console.log(`   ✅ 错误代码正确: ${testCase.expectedError}`);
          } else if (testCase.expectedError) {
            console.log(`   ❌ 错误代码错误: 期望 ${testCase.expectedError}, 实际 ${result.data?.code}`);
          }

          resolve({ ...result, success: true });
        } else {
          console.log(`   ❌ 状态码错误: 期望 ${testCase.expectedStatus}, 实际 ${res.statusCode}`);
          console.log(`   响应数据:`, result.data);
          resolve({ ...result, success: false });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`   💥 请求失败:`, error.message);
      resolve({
        name: testCase.name,
        success: false,
        error: error.message
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`   ⏰ 请求超时`);
      resolve({
        name: testCase.name,
        success: false,
        error: 'timeout'
      });
    });

    req.end();
  });
}

/**
 * 运行所有测试用例
 */
async function runAllTests() {
  console.log('🌐 开始域名验证测试...\n');
  console.log(`服务器地址: ${API_BASE_URL}`);
  console.log(`测试用例数量: ${TEST_CASES.length}\n`);

  const results = [];

  for (const testCase of TEST_CASES) {
    const result = await runTestCase(testCase);
    results.push(result);

    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 统计结果
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;

  console.log('\n' + '='.repeat(50));
  console.log('📊 测试结果统计');
  console.log('='.repeat(50));
  console.log(`✅ 成功: ${successCount}/${results.length}`);
  console.log(`❌ 失败: ${failureCount}/${results.length}`);
  console.log(`📈 成功率: ${(successCount / results.length * 100).toFixed(1)}%`);

  // 显示失败的测试
  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    console.log('\n❌ 失败的测试:');
    failures.forEach(failure => {
      console.log(`   - ${failure.name}: ${failure.error || '状态码不匹配'}`);
    });
  }

  console.log('\n🎯 测试完成!');

  if (failureCount === 0) {
    console.log('🎉 所有测试通过，域名验证功能正常工作!');
    process.exit(0);
  } else {
    console.log('⚠️  部分测试失败，请检查域名验证配置。');
    process.exit(1);
  }
}

// 检查服务器是否运行
async function checkServerStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      console.log('✅ 服务器运行正常');
      return true;
    }
  } catch (error) {
    console.log('❌ 服务器连接失败，请确保服务器正在运行');
    console.log(`   尝试连接: ${API_BASE_URL}`);
    console.log(`   错误: ${error.message}`);
    return false;
  }
}

// 主函数
async function main() {
  console.log('🔒 域名验证安全测试');
  console.log('='.repeat(50));

  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    process.exit(1);
  }

  await runAllTests();
}

// 运行测试
main().catch(error => {
  console.error('💥 测试执行失败:', error);
  process.exit(1);
});