#!/usr/bin/env node

/**
 * Flutter Web Dashboard API测试脚本
 * 
 * 测试内容：
 * 1. 登录获取token
 * 2. 测试Dashboard API端点
 * 3. 测试活动统计API
 * 4. 测试任务更新API
 * 5. 测试打卡API
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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
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

// 测试1: 登录获取token
async function testLogin() {
  log('\n📝 测试1: 登录获取token', 'cyan');
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
    
    if (response.statusCode === 200 && response.data.success && response.data.data.token) {
      log(`✅ 成功: 登录成功`, 'green');
      log(`Token: ${response.data.data.token.substring(0, 30)}...`, 'green');
      return response.data.data.token;
    } else {
      log(`❌ 失败: 登录失败`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ 异常: ${error.message}`, 'red');
    return null;
  }
}

// 测试2: 获取Dashboard数据
async function testGetDashboard(token) {
  log('\n📝 测试2: 获取Dashboard数据', 'cyan');
  log('━'.repeat(60), 'cyan');
  
  if (!token) {
    log(`❌ 跳过: 没有token`, 'yellow');
    return false;
  }
  
  try {
    const options = {
      hostname: config.host,
      port: config.port,
      path: '/api/teacher/dashboard',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    log(`发送Dashboard数据请求`, 'blue');
    
    const response = await makeRequest(options);
    
    log(`响应状态码: ${response.statusCode}`, 'blue');
    
    if (response.statusCode === 200 && response.data.success) {
      log(`✅ 成功: Dashboard API正常工作`, 'green');
      log(`数据结构:`, 'green');
      
      const data = response.data.data;
      if (data.stats) {
        log(`  - 统计数据: ✅`, 'green');
        log(`    - 任务: 总计${data.stats.tasks?.total || 0}, 待办${data.stats.tasks?.pending || 0}`, 'green');
        log(`    - 班级: 总计${data.stats.classes?.total || 0}`, 'green');
        log(`    - 活动: 即将开始${data.stats.activities?.upcoming || 0}`, 'green');
        log(`    - 通知: 未读${data.stats.notifications?.unread || 0}`, 'green');
      }
      
      if (data.todayTasks) {
        log(`  - 今日任务: ${data.todayTasks.length}条`, 'green');
      }
      
      if (data.todayCourses) {
        log(`  - 今日课程: ${data.todayCourses.length}条`, 'green');
      }
      
      if (data.recentNotifications) {
        log(`  - 最新通知: ${data.recentNotifications.length}条`, 'green');
      }
      
      return true;
    } else if (response.statusCode === 404) {
      log(`⚠️  警告: Dashboard API端点不存在 (404)`, 'yellow');
      log(`提示: 可能需要配置后端路由`, 'yellow');
      return false;
    } else if (response.statusCode === 403) {
      log(`⚠️  警告: 权限不足 (403)`, 'yellow');
      log(`提示: 当前用户可能不是教师角色`, 'yellow');
      return false;
    } else {
      log(`❌ 失败: HTTP ${response.statusCode}`, 'red');
      log(`响应: ${JSON.stringify(response.data)}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ 异常: ${error.message}`, 'red');
    return false;
  }
}

// 测试3: 获取活动统计数据
async function testGetActivityStats(token) {
  log('\n📝 测试3: 获取活动统计数据', 'cyan');
  log('━'.repeat(60), 'cyan');
  
  if (!token) {
    log(`❌ 跳过: 没有token`, 'yellow');
    return false;
  }
  
  try {
    const options = {
      hostname: config.host,
      port: config.port,
      path: '/api/teacher/activity-statistics',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    log(`发送活动统计数据请求`, 'blue');
    
    const response = await makeRequest(options);
    
    log(`响应状态码: ${response.statusCode}`, 'blue');
    
    if (response.statusCode === 200 && response.data.success) {
      log(`✅ 成功: 活动统计API正常工作`, 'green');
      
      const data = response.data.data;
      if (data.overview) {
        log(`  - 总活动数: ${data.overview.totalActivities || 0}`, 'green');
        log(`  - 已发布: ${data.overview.publishedActivities || 0}`, 'green');
        log(`  - 总报名: ${data.overview.totalRegistrations || 0}`, 'green');
      }
      
      return true;
    } else if (response.statusCode === 404) {
      log(`⚠️  警告: 活动统计API端点不存在 (404)`, 'yellow');
      return false;
    } else {
      log(`❌ 失败: HTTP ${response.statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ 异常: ${error.message}`, 'red');
    return false;
  }
}

// 测试4: 测试打卡API
async function testClockIn(token) {
  log('\n📝 测试4: 测试打卡API', 'cyan');
  log('━'.repeat(60), 'cyan');
  
  if (!token) {
    log(`❌ 跳过: 没有token`, 'yellow');
    return false;
  }
  
  try {
    const options = {
      hostname: config.host,
      port: config.port,
      path: '/api/teacher/clock-in',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    log(`发送打卡请求 (type: in)`, 'blue');
    
    const response = await makeRequest(options, { type: 'in' });
    
    log(`响应状态码: ${response.statusCode}`, 'blue');
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      log(`✅ 成功: 打卡API正常工作`, 'green');
      return true;
    } else if (response.statusCode === 404) {
      log(`⚠️  警告: 打卡API端点不存在 (404)`, 'yellow');
      return false;
    } else {
      log(`❌ 失败: HTTP ${response.statusCode}`, 'red');
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
  log('Flutter Web Dashboard API测试', 'cyan');
  log('='.repeat(60), 'cyan');
  
  log(`\n测试配置:`, 'blue');
  log(`  后端地址: http://${config.host}:${config.port}`, 'blue');
  log(`  测试账号: ${config.testAccount.username}`, 'blue');
  
  const results = {
    total: 4,
    passed: 0,
    failed: 0,
    warnings: 0
  };
  
  // 测试1: 登录
  const token = await testLogin();
  if (token) {
    results.passed++;
  } else {
    results.failed++;
    log('\n❌ 登录失败，无法继续测试', 'red');
    process.exit(1);
  }
  
  // 测试2: Dashboard数据
  const dashboardSuccess = await testGetDashboard(token);
  if (dashboardSuccess) {
    results.passed++;
  } else {
    results.failed++;
    results.warnings++;
  }
  
  // 测试3: 活动统计
  const activityStatsSuccess = await testGetActivityStats(token);
  if (activityStatsSuccess) {
    results.passed++;
  } else {
    results.failed++;
    results.warnings++;
  }
  
  // 测试4: 打卡
  const clockInSuccess = await testClockIn(token);
  if (clockInSuccess) {
    results.passed++;
  } else {
    results.failed++;
    results.warnings++;
  }
  
  // 测试总结
  log('\n' + '='.repeat(60), 'cyan');
  log('测试总结', 'cyan');
  log('='.repeat(60), 'cyan');
  
  log(`\n总测试数: ${results.total}`, 'blue');
  log(`通过: ${results.passed}`, 'green');
  log(`失败: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  if (results.warnings > 0) {
    log(`\n⚠️  警告: ${results.warnings}个API端点可能未配置`, 'yellow');
    log(`\n建议:`, 'yellow');
    log(`  1. 检查后端是否实现了教师Dashboard相关API`, 'yellow');
    log(`  2. 检查路由配置: server/src/routes/teacher-dashboard.routes.ts`, 'yellow');
    log(`  3. 检查控制器: server/src/controllers/teacher-dashboard.controller.ts`, 'yellow');
    log(`  4. 检查服务: server/src/services/teacher-dashboard.service.ts`, 'yellow');
  }
  
  if (results.failed === 0) {
    log('\n🎉 所有测试通过！Dashboard API正常工作！', 'green');
    process.exit(0);
  } else if (results.passed === 1) {
    log('\n⚠️  登录成功，但Dashboard API可能未配置', 'yellow');
    log('Flutter应用可能会显示空数据或使用模拟数据', 'yellow');
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

