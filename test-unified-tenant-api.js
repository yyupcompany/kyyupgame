#!/usr/bin/env node
/**
 * 统一认证 & 租户管理系统 API 测试脚本
 * 
 * 用途：验证 adminyyup 项目的统一认证和租户管理功能
 * 注意：此脚本仅用于测试，不会修改任何项目代码
 * 
 * 使用方法：
 *   node test-unified-tenant-api.js [BASE_URL]
 * 
 * 示例：
 *   node test-unified-tenant-api.js http://localhost:4001
 *   node test-unified-tenant-api.js http://rent.yyup.cc:4001
 */

const http = require('http');
const https = require('https');

// 配置
const BASE_URL = process.argv[2] || 'http://localhost:4001';
const TEST_PHONE = '18611141133';  // 测试账号（根据记忆规范）
const TEST_PASSWORD = '123456';    // 测试密码（根据记忆规范）

// 解析URL
const urlParts = new URL(BASE_URL);
const isHttps = urlParts.protocol === 'https:';
const httpModule = isHttps ? https : http;

// 存储测试状态
let authToken = null;
let globalUserId = null;

// 测试结果统计
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  results: []
};

/**
 * 发送HTTP请求
 */
function request(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: urlParts.hostname,
      port: urlParts.port || (isHttps ? 443 : 80),
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = httpModule.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

/**
 * 记录测试结果
 */
function recordTest(name, passed, message, details = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`  ✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`  ❌ ${name}: ${message}`);
  }
  
  testResults.results.push({
    name,
    passed,
    message,
    details
  });
}

/**
 * 1. 健康检查测试
 */
async function testHealthCheck() {
  console.log('\n📋 1. 健康检查测试');
  console.log('─'.repeat(50));
  
  try {
    const res = await request('GET', '/api/health');
    
    if (res.status === 200) {
      recordTest('健康检查端点可访问', true, '');
      recordTest('状态返回OK', res.data.status === 'OK', `状态: ${res.data.status}`);
      recordTest('数据库连接状态', res.data.database?.connected !== false, 
        JSON.stringify(res.data.database));
      return true;
    } else {
      recordTest('健康检查', false, `HTTP ${res.status}`);
      return false;
    }
  } catch (error) {
    recordTest('健康检查', false, `连接失败: ${error.message}`);
    return false;
  }
}

/**
 * 2. API版本信息测试
 */
async function testApiInfo() {
  console.log('\n📋 2. API版本信息测试');
  console.log('─'.repeat(50));
  
  try {
    const res = await request('GET', '/api');
    
    if (res.status === 200) {
      recordTest('API根端点可访问', true, '');
      recordTest('返回API名称', !!res.data.name, res.data.name);
      recordTest('返回版本信息', !!res.data.version, res.data.version);
      recordTest('返回端点列表', !!res.data.endpoints, 
        Object.keys(res.data.endpoints || {}).join(', '));
      return true;
    } else {
      recordTest('API信息', false, `HTTP ${res.status}`);
      return false;
    }
  } catch (error) {
    recordTest('API信息', false, error.message);
    return false;
  }
}

/**
 * 3. 统一认证登录测试
 */
async function testUnifiedLogin() {
  console.log('\n📋 3. 统一认证登录测试');
  console.log('─'.repeat(50));
  
  // 3.1 测试无效手机号
  try {
    const res = await request('POST', '/api/auth/unified-login', {
      phone: '123',
      password: TEST_PASSWORD
    });
    recordTest('拒绝无效手机号格式', res.status === 400, `状态码: ${res.status}`);
  } catch (error) {
    recordTest('拒绝无效手机号格式', false, error.message);
  }
  
  // 3.2 测试缺少密码
  try {
    const res = await request('POST', '/api/auth/unified-login', {
      phone: TEST_PHONE
    });
    recordTest('拒绝缺少密码', res.status === 400, `状态码: ${res.status}`);
  } catch (error) {
    recordTest('拒绝缺少密码', false, error.message);
  }
  
  // 3.3 测试错误密码
  try {
    const res = await request('POST', '/api/auth/unified-login', {
      phone: TEST_PHONE,
      password: 'wrong_password_12345'
    });
    recordTest('拒绝错误密码', res.status === 401, `状态码: ${res.status}`);
  } catch (error) {
    recordTest('拒绝错误密码', false, error.message);
  }
  
  // 3.4 测试正确登录
  try {
    const res = await request('POST', '/api/auth/unified-login', {
      phone: TEST_PHONE,
      password: TEST_PASSWORD
    });
    
    if (res.status === 200 && res.data.success) {
      recordTest('正确凭据登录成功', true, '');
      recordTest('返回Token', !!res.data.token, '已获取Token');
      recordTest('返回用户信息', !!res.data.user, `用户: ${res.data.user?.phone || 'N/A'}`);
      
      // 保存Token用于后续测试
      authToken = res.data.token;
      globalUserId = res.data.user?.id;
      
      // 检查是否需要选择租户
      if (res.data.requiresTenantSelection) {
        recordTest('多租户场景', true, `可用租户: ${res.data.availableTenants?.length || 0}个`);
      } else if (res.data.needsRegistration) {
        recordTest('新用户场景', true, '需要注册租户');
      } else if (res.data.tenant) {
        recordTest('单租户自动登录', true, `租户: ${res.data.tenant?.name || res.data.tenant?.tenantCode}`);
      }
      
      return true;
    } else {
      recordTest('正确凭据登录', false, res.data.message || `HTTP ${res.status}`);
      return false;
    }
  } catch (error) {
    recordTest('正确凭据登录', false, error.message);
    return false;
  }
}

/**
 * 4. 用户信息获取测试
 */
async function testGetUserInfo() {
  console.log('\n📋 4. 用户信息获取测试');
  console.log('─'.repeat(50));
  
  if (!authToken) {
    recordTest('用户信息获取', false, '跳过 - 无认证Token');
    testResults.skipped++;
    return false;
  }
  
  // 4.1 测试获取用户信息
  try {
    const res = await request('GET', '/api/auth/unified/me');
    
    if (res.status === 200) {
      recordTest('获取用户信息成功', true, '');
      recordTest('返回用户对象', !!res.data.user, `用户ID: ${res.data.user?.id}`);
      recordTest('用户手机号', !!res.data.user?.phone, res.data.user?.phone);
      return true;
    } else {
      recordTest('获取用户信息', false, `HTTP ${res.status}`);
      return false;
    }
  } catch (error) {
    recordTest('获取用户信息', false, error.message);
    return false;
  }
}

/**
 * 5. 租户列表获取测试
 */
async function testGetTenants() {
  console.log('\n📋 5. 租户列表获取测试');
  console.log('─'.repeat(50));
  
  if (!authToken) {
    recordTest('租户列表获取', false, '跳过 - 无认证Token');
    testResults.skipped++;
    return false;
  }
  
  // 5.1 获取用户租户列表（统一认证接口）
  try {
    const res = await request('GET', '/api/auth/unified/tenants');
    
    if (res.status === 200) {
      recordTest('获取用户租户列表成功', true, '');
      recordTest('返回租户数组', Array.isArray(res.data.tenants), 
        `租户数量: ${res.data.tenants?.length || 0}`);
      
      if (res.data.tenants?.length > 0) {
        const firstTenant = res.data.tenants[0];
        recordTest('租户包含代码', !!firstTenant.tenantCode, firstTenant.tenantCode);
        recordTest('租户包含名称', !!firstTenant.name, firstTenant.name);
        recordTest('租户包含角色', !!firstTenant.role, firstTenant.role);
      }
      return true;
    } else {
      recordTest('获取用户租户列表', false, `HTTP ${res.status}`);
      return false;
    }
  } catch (error) {
    recordTest('获取用户租户列表', false, error.message);
    return false;
  }
}

/**
 * 6. 租户管理API测试（需要管理员权限）
 */
async function testTenantManagement() {
  console.log('\n📋 6. 租户管理API测试');
  console.log('─'.repeat(50));
  
  if (!authToken) {
    recordTest('租户管理API', false, '跳过 - 无认证Token');
    testResults.skipped++;
    return false;
  }
  
  // 6.1 获取租户列表（管理端口）
  try {
    const res = await request('GET', '/api/tenants');
    
    if (res.status === 200) {
      recordTest('获取租户管理列表成功', true, '');
      recordTest('返回列表数据', !!res.data.list || Array.isArray(res.data), 
        `总数: ${res.data.total || res.data.length || 0}`);
      return true;
    } else if (res.status === 401 || res.status === 403) {
      recordTest('租户管理需要权限', true, '需要管理员权限');
      return true;
    } else {
      recordTest('租户管理列表', false, `HTTP ${res.status}`);
      return false;
    }
  } catch (error) {
    recordTest('租户管理列表', false, error.message);
    return false;
  }
}

/**
 * 7. 无认证访问测试
 */
async function testUnauthorizedAccess() {
  console.log('\n📋 7. 无认证访问保护测试');
  console.log('─'.repeat(50));
  
  // 临时清除Token
  const savedToken = authToken;
  authToken = null;
  
  // 7.1 测试需要认证的端点
  const protectedEndpoints = [
    { method: 'GET', path: '/api/auth/unified/me', name: '用户信息' },
    { method: 'GET', path: '/api/auth/unified/tenants', name: '租户列表' },
    { method: 'GET', path: '/api/tenants', name: '租户管理' },
    { method: 'GET', path: '/api/accounts/test', name: '账户信息' }
  ];
  
  for (const endpoint of protectedEndpoints) {
    try {
      const res = await request(endpoint.method, endpoint.path);
      const isProtected = res.status === 401 || res.status === 403;
      recordTest(`${endpoint.name}端点受保护`, isProtected, 
        isProtected ? '正确拒绝无认证访问' : `未保护, 状态码: ${res.status}`);
    } catch (error) {
      recordTest(`${endpoint.name}端点`, false, error.message);
    }
  }
  
  // 恢复Token
  authToken = savedToken;
  return true;
}

/**
 * 8. KMS服务测试
 */
async function testKMSService() {
  console.log('\n📋 8. KMS密钥服务测试');
  console.log('─'.repeat(50));
  
  // 8.1 获取KMS状态
  try {
    const res = await request('GET', '/api/kms/status');
    
    if (res.status === 200) {
      recordTest('KMS状态查询成功', true, '');
      recordTest('KMS服务可用', res.data.available !== false, 
        `状态: ${res.data.status || 'unknown'}`);
    } else if (res.status === 401 || res.status === 403) {
      recordTest('KMS需要API认证', true, '需要API Key');
    } else {
      recordTest('KMS状态', false, `HTTP ${res.status}`);
    }
  } catch (error) {
    recordTest('KMS状态', false, error.message);
  }
  
  return true;
}

/**
 * 9. MFA服务测试
 */
async function testMFAService() {
  console.log('\n📋 9. MFA双因素认证测试');
  console.log('─'.repeat(50));
  
  if (!authToken) {
    recordTest('MFA服务', false, '跳过 - 无认证Token');
    testResults.skipped++;
    return false;
  }
  
  // 9.1 获取MFA状态
  try {
    const res = await request('GET', '/api/mfa/status');
    
    if (res.status === 200) {
      recordTest('MFA状态查询成功', true, '');
      recordTest('返回MFA启用状态', res.data.enabled !== undefined, 
        `已启用: ${res.data.enabled}`);
    } else if (res.status === 401) {
      recordTest('MFA需要认证', true, '正确要求认证');
    } else {
      recordTest('MFA状态', false, `HTTP ${res.status}`);
    }
  } catch (error) {
    recordTest('MFA状态', false, error.message);
  }
  
  return true;
}

/**
 * 打印测试报告
 */
function printReport() {
  console.log('\n');
  console.log('═'.repeat(60));
  console.log('📊 测试报告');
  console.log('═'.repeat(60));
  
  console.log(`
  🎯 测试目标: ${BASE_URL}
  📅 测试时间: ${new Date().toLocaleString('zh-CN')}
  
  📈 统计结果:
  ─────────────────────────────
  ✅ 通过: ${testResults.passed}
  ❌ 失败: ${testResults.failed}
  ⏭️  跳过: ${testResults.skipped}
  📊 总计: ${testResults.total}
  ─────────────────────────────
  通过率: ${testResults.total > 0 ? ((testResults.passed / testResults.total) * 100).toFixed(1) : 0}%
  `);
  
  if (testResults.failed > 0) {
    console.log('❌ 失败的测试:');
    testResults.results
      .filter(r => !r.passed)
      .forEach(r => console.log(`  - ${r.name}: ${r.message}`));
  }
  
  console.log('═'.repeat(60));
  
  // 返回退出码
  return testResults.failed === 0 ? 0 : 1;
}

/**
 * 主测试流程
 */
async function runTests() {
  console.log('═'.repeat(60));
  console.log('🔒 统一认证 & 租户管理系统 API 测试');
  console.log('═'.repeat(60));
  console.log(`  目标: ${BASE_URL}`);
  console.log(`  测试账号: ${TEST_PHONE}`);
  console.log(`  时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log('═'.repeat(60));
  
  // 执行测试
  const serverAvailable = await testHealthCheck();
  
  if (!serverAvailable) {
    console.log('\n⚠️  服务器不可达，跳过后续测试');
    console.log(`   请确保服务运行在: ${BASE_URL}`);
    return printReport();
  }
  
  await testApiInfo();
  await testUnifiedLogin();
  await testGetUserInfo();
  await testGetTenants();
  await testTenantManagement();
  await testUnauthorizedAccess();
  await testKMSService();
  await testMFAService();
  
  return printReport();
}

// 运行测试
runTests()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('测试执行失败:', error);
    process.exit(1);
  });
