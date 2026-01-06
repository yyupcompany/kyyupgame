#!/usr/bin/env node

/**
 * Flutter Web登录功能回归测试脚本
 * 
 * 测试内容：
 * 1. 登录API是否正常工作
 * 2. token是否正确返回
 * 3. 用户信息是否正确返回
 * 4. 使用token获取用户信息是否成功
 */

const http = require('http');

// 测试配置
const config = {
  host: 'localhost',
  port: 3000,
  testAccount: {
    username: 'admin',
    password: 'admin123'
  }
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// HTTP请求封装
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: response
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// 测试1: 登录API
async function testLogin() {
  log('\n📝 测试1: 登录API', 'cyan');
  log('━'.repeat(60), 'cyan');
  
  try {
    const options = {
      hostname: config.host,
      port: config.port,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    log(`发送登录请求: ${config.testAccount.username}`, 'blue');
    
    const response = await makeRequest(options, config.testAccount);
    
    log(`响应状态码: ${response.statusCode}`, 'blue');
    log(`响应数据:`, 'blue');
    console.log(JSON.stringify(response.data, null, 2));
    
    // 验证响应
    if (response.statusCode !== 200) {
      log(`❌ 失败: HTTP状态码不是200`, 'red');
      return null;
    }
    
    if (!response.data.success) {
      log(`❌ 失败: success字段为false`, 'red');
      log(`错误信息: ${response.data.message}`, 'red');
      return null;
    }
    
    if (!response.data.data || !response.data.data.token) {
      log(`❌ 失败: 没有返回token`, 'red');
      return null;
    }
    
    if (!response.data.data.user) {
      log(`❌ 失败: 没有返回用户信息`, 'red');
      return null;
    }
    
    log(`✅ 成功: 登录API正常工作`, 'green');
    log(`Token: ${response.data.data.token.substring(0, 30)}...`, 'green');
    log(`用户: ${response.data.data.user.username}`, 'green');
    log(`角色: ${response.data.data.user.role}`, 'green');
    
    return response.data.data.token;
    
  } catch (error) {
    log(`❌ 异常: ${error.message}`, 'red');
    return null;
  }
}

// 测试2: 使用token获取用户信息
async function testGetProfile(token) {
  log('\n📝 测试2: 获取用户信息API', 'cyan');
  log('━'.repeat(60), 'cyan');
  
  if (!token) {
    log(`❌ 跳过: 没有token`, 'yellow');
    return false;
  }
  
  try {
    const options = {
      hostname: config.host,
      port: config.port,
      path: '/api/auth/profile',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    log(`发送获取用户信息请求`, 'blue');
    log(`Token: ${token.substring(0, 30)}...`, 'blue');
    
    const response = await makeRequest(options);
    
    log(`响应状态码: ${response.statusCode}`, 'blue');
    log(`响应数据:`, 'blue');
    console.log(JSON.stringify(response.data, null, 2));
    
    // 验证响应
    if (response.statusCode !== 200) {
      log(`❌ 失败: HTTP状态码不是200`, 'red');
      return false;
    }
    
    if (!response.data.success) {
      log(`❌ 失败: success字段为false`, 'red');
      log(`错误信息: ${response.data.message}`, 'red');
      return false;
    }
    
    // profile API返回格式: { success: true, data: { id, username, ... } }
    // 不是 { success: true, data: { user: {...} } }
    if (!response.data.data) {
      log(`❌ 失败: 没有返回用户信息`, 'red');
      return false;
    }

    const userData = response.data.data;

    log(`✅ 成功: 获取用户信息API正常工作`, 'green');
    log(`用户: ${userData.username}`, 'green');
    log(`角色: ${userData.roles ? userData.roles[0].code : 'N/A'}`, 'green');
    
    return true;
    
  } catch (error) {
    log(`❌ 异常: ${error.message}`, 'red');
    return false;
  }
}

// 测试3: 验证401错误已修复
async function testNoToken() {
  log('\n📝 测试3: 验证未授权访问返回401', 'cyan');
  log('━'.repeat(60), 'cyan');
  
  try {
    const options = {
      hostname: config.host,
      port: config.port,
      path: '/api/auth/profile',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    log(`发送获取用户信息请求（不带token）`, 'blue');
    
    const response = await makeRequest(options);
    
    log(`响应状态码: ${response.statusCode}`, 'blue');
    
    // 验证响应
    if (response.statusCode === 401) {
      log(`✅ 成功: 未授权访问正确返回401`, 'green');
      return true;
    } else {
      log(`❌ 失败: 应该返回401，实际返回${response.statusCode}`, 'red');
      return false;
    }
    
  } catch (error) {
    log(`❌ 异常: ${error.message}`, 'red');
    return false;
  }
}

// 主测试流程
async function runTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('Flutter Web登录功能回归测试', 'cyan');
  log('='.repeat(60), 'cyan');
  
  log(`\n测试配置:`, 'blue');
  log(`  后端地址: http://${config.host}:${config.port}`, 'blue');
  log(`  测试账号: ${config.testAccount.username}`, 'blue');
  log(`  测试密码: ${config.testAccount.password}`, 'blue');
  
  const results = {
    total: 3,
    passed: 0,
    failed: 0
  };
  
  // 测试1: 登录
  const token = await testLogin();
  if (token) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // 测试2: 获取用户信息
  const profileSuccess = await testGetProfile(token);
  if (profileSuccess) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // 测试3: 验证401
  const unauthorizedSuccess = await testNoToken();
  if (unauthorizedSuccess) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // 测试总结
  log('\n' + '='.repeat(60), 'cyan');
  log('测试总结', 'cyan');
  log('='.repeat(60), 'cyan');
  
  log(`\n总测试数: ${results.total}`, 'blue');
  log(`通过: ${results.passed}`, 'green');
  log(`失败: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  if (results.failed === 0) {
    log('\n🎉 所有测试通过！登录功能正常工作！', 'green');
    process.exit(0);
  } else {
    log('\n❌ 部分测试失败，请检查问题！', 'red');
    process.exit(1);
  }
}

// 运行测试
runTests().catch((error) => {
  log(`\n❌ 测试执行异常: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

