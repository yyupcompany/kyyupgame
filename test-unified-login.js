#!/usr/bin/env node

/**
 * 统一认证登录测试脚本
 * 测试从 k004.yyup.cc 登录到 rent.yyup.cc 的完整流程
 */

const http = require('http');

// 测试配置
const TEST_CONFIG = {
  // 租户系统前端
  tenantFrontend: 'http://192.168.1.103:5173',
  tenantBackend: 'http://192.168.1.103:3000',
  
  // 统一认证系统
  unifiedFrontend: 'http://192.168.1.103:5174',
  unifiedBackend: 'http://192.168.1.103:4001',
  
  // 测试账号
  testAccount: {
    phone: '18611141133',
    password: '123456',
    tenantCode: 'k004'
  }
};

console.log('🧪 统一认证登录测试');
console.log('='.repeat(60));
console.log('📋 测试配置:');
console.log(JSON.stringify(TEST_CONFIG, null, 2));
console.log('='.repeat(60));

// 测试函数：检查服务是否可达
function checkService(url, name) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: '/',
      method: 'GET',
      timeout: 5000
    };

    console.log(`\n🔍 检查 ${name}...`);
    console.log(`   URL: ${url}`);

    const req = http.request(options, (res) => {
      console.log(`   ✅ 可达 (状态码: ${res.statusCode})`);
      resolve({ name, url, status: res.statusCode, ok: true });
    });

    req.on('error', (error) => {
      console.log(`   ❌ 不可达 (错误: ${error.message})`);
      resolve({ name, url, error: error.message, ok: false });
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`   ❌ 超时`);
      resolve({ name, url, error: '请求超时', ok: false });
    });

    req.end();
  });
}

// 测试函数：调用统一认证登录 API
function testUnifiedLoginAPI() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      phone: TEST_CONFIG.testAccount.phone,
      password: TEST_CONFIG.testAccount.password,
      tenantCode: TEST_CONFIG.testAccount.tenantCode
    });

    const urlObj = new URL(TEST_CONFIG.tenantBackend);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'X-Tenant-Code': TEST_CONFIG.testAccount.tenantCode
      },
      timeout: 10000
    };

    console.log(`\n🔐 测试统一认证登录 API...`);
    console.log(`   接口: ${TEST_CONFIG.tenantBackend}/api/auth/login`);
    console.log(`   账号: ${TEST_CONFIG.testAccount.phone}`);
    console.log(`   租户: ${TEST_CONFIG.testAccount.tenantCode}`);

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`   ✅ API响应 (状态码: ${res.statusCode})`);
          console.log(`   响应数据:`);
          console.log(JSON.stringify(result, null, 4));
          resolve({ ok: true, status: res.statusCode, data: result });
        } catch (error) {
          console.log(`   ❌ 解析响应失败`);
          console.log(`   原始响应: ${data}`);
          resolve({ ok: false, error: '解析失败', raw: data });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ API调用失败: ${error.message}`);
      resolve({ ok: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`   ❌ API调用超时`);
      resolve({ ok: false, error: '请求超时' });
    });

    req.write(postData);
    req.end();
  });
}

// 主测试流程
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 开始测试...\n');

  // 1. 检查所有服务
  console.log('📡 第一步: 检查服务可达性');
  console.log('-'.repeat(60));

  const services = [
    { url: TEST_CONFIG.tenantFrontend, name: '主系统前端 (192.168.1.103:5173)' },
    { url: TEST_CONFIG.tenantBackend, name: '主系统后端 (192.168.1.103:3000)' },
    { url: TEST_CONFIG.unifiedFrontend, name: '统一租户前端 (192.168.1.103:5174)' },
    { url: TEST_CONFIG.unifiedBackend, name: '统一租户后端 (192.168.1.103:4001)' }
  ];

  const serviceResults = [];
  for (const service of services) {
    const result = await checkService(service.url, service.name);
    serviceResults.push(result);
  }

  const allServicesOk = serviceResults.filter(r => r.name.includes('后端')).every(r => r.ok);  // 只检查后端服务
  
  if (!allServicesOk) {
    console.log('\n⚠️  部分后端服务不可达，但继续测试...');
  } else {
    console.log('\n✅ 所有后端服务均可达');
  }

  // 2. 测试统一认证登录 API
  console.log('\n' + '-'.repeat(60));
  console.log('🔑 第二步: 测试统一认证登录 API');
  console.log('-'.repeat(60));

  const loginResult = await testUnifiedLoginAPI();

  // 3. 总结
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试总结');
  console.log('='.repeat(60));

  console.log('\n服务状态:');
  serviceResults.forEach(r => {
    console.log(`  ${r.ok ? '✅' : '❌'} ${r.name}`);
  });

  console.log('\n登录测试:');
  if (loginResult.ok) {
    console.log(`  ✅ 登录 API 调用成功`);
    if (loginResult.data) {
      console.log(`  📦 返回数据:`, loginResult.data.success ? '成功' : '失败');
      if (loginResult.data.data) {
        console.log(`     - Token: ${loginResult.data.data.token ? '✅ 已获取' : '❌ 未获取'}`);
        console.log(`     - User: ${loginResult.data.data.user ? '✅ 已获取' : '❌ 未获取'}`);
        console.log(`     - Tenant: ${loginResult.data.data.tenantInfo ? '✅ 已获取' : '❌ 未获取'}`);
      }
    }
  } else {
    console.log(`  ❌ 登录 API 调用失败: ${loginResult.error}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log(allServicesOk && loginResult.ok ? '✅ 测试通过' : '❌ 测试失败');
  console.log('='.repeat(60));
}

// 执行测试
runTests().catch(console.error);
