#!/usr/bin/env node

/**
 * 前端端点测试脚本 - 增强版
 * 基于前端endpoints.ts中定义的路由进行测试
 * 为POST请求提供必要的参数
 * 确保前端后端完全对齐，100%可访问
 */

const https = require('https');
const http = require('http');

// 测试配置
const CONFIG = {
  baseUrl: 'http://localhost:3000/api',
  timeout: 5000,
  retries: 2
};

// 获取认证token
async function getAuthToken() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      username: 'admin',
      password: 'admin123'
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success && response.data.token) {
            resolve(response.data.token);
          } else {
            reject(new Error('Login failed'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// 获取测试数据
function getTestData(method, path) {
  const testData = {
    // 认证相关
    'POST /api/auth/login': { username: 'admin', password: 'admin123' },
    'POST /api/auth/refresh-token': { refreshToken: 'valid_refresh_token' },
    
    // 用户管理
    'POST /api/users': {
      username: 'testuser' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: 'Test123',
      name: 'Test User',
      roleId: 1
    },
    
    // 角色管理
    'POST /api/roles': {
      name: 'Test Role ' + Date.now(),
      code: 'TEST_ROLE_' + Date.now(),
      description: 'This is a test role',
      permissions: ['USER_VIEW', 'USER_CREATE']
    },
    
    // 幼儿园管理
    'POST /api/kindergartens': {
      name: 'Test Kindergarten',
      address: 'Test Address 123',
      phone: '010-12345678',
      principalName: 'Principal Zhang',
      principalPhone: '13800000001',
      capacity: 200,
      establishedDate: '2020-01-01'
    },
    
    // 班级管理
    'POST /api/classes': {
      name: 'Test Class ' + Date.now(),
      grade: 'small',
      capacity: 25,
      teacherId: 1,
      kindergartenId: 1,
      description: 'This is a test class'
    },
    
    // 教师管理
    'POST /api/teachers': {
      userId: 153,  // 使用真实的用户ID
      kindergartenId: 11,  // 使用真实的幼儿园ID
      position: 1,
      teacherNo: 'T' + Date.now(),
      status: 1,
      remark: 'Test teacher'
    },
    
    // 学生管理
    'POST /api/students': {
      name: 'Test Student',
      studentNo: 'S' + Date.now(),
      kindergartenId: 1,
      classId: 1,
      gender: 1,
      birthDate: '2020-01-01',
      enrollmentDate: '2024-01-01'
    },
    
    // 家长管理
    'POST /api/parents': {
      name: 'Test Parent',
      phone: '13800000004',
      email: 'parent@example.com',
      relationship: 'father',
      occupation: 'Engineer'
    },
    
    // 活动管理
    'POST /api/activities': {
      kindergartenId: 1,
      title: 'Test Activity',
      activityType: 1,
      startTime: '2024-08-01T09:00:00Z',
      endTime: '2024-08-01T11:00:00Z',
      location: 'Test Location',
      capacity: 20,
      registrationStartTime: '2024-07-20T00:00:00Z',
      registrationEndTime: '2024-07-31T23:59:59Z',
      description: 'This is a test activity',
      fee: 30.00
    },
    
    // 通知管理
    'POST /api/notifications': {
      title: 'Test Notification',
      content: 'This is a test notification content',
      type: 'info',
      targetType: 'all',
      urgent: false
    },
    
    // 日程管理
    'POST /api/schedules': {
      title: 'Test Schedule',
      description: 'This is a test schedule',
      startTime: '2024-08-01T09:00:00Z',
      endTime: '2024-08-01T10:00:00Z',
      type: 'meeting',
      location: 'Meeting Room'
    }
  };

  const key = `${method} ${path}`;
  return testData[key] || {};
}

// 测试单个端点
async function testEndpoint(method, path, token, expectedStatus = 200) {
  return new Promise((resolve) => {
    const testData = getTestData(method, path);
    const postData = Object.keys(testData).length > 0 ? JSON.stringify(testData) : '';
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: CONFIG.timeout
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const startTime = Date.now();
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        const success = res.statusCode === expectedStatus || (res.statusCode >= 200 && res.statusCode < 400);
        
        resolve({
          method,
          path,
          status: res.statusCode,
          duration,
          success,
          error: null,
          responseSize: responseData.length,
          hasTestData: Object.keys(testData).length > 0
        });
      });
    });

    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      resolve({
        method,
        path,
        status: 0,
        duration,
        success: false,
        error: error.message,
        responseSize: 0,
        hasTestData: Object.keys(testData).length > 0
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const duration = Date.now() - startTime;
      resolve({
        method,
        path,
        status: 0,
        duration,
        success: false,
        error: 'Timeout',
        responseSize: 0,
        hasTestData: Object.keys(testData).length > 0
      });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// 前端endpoints.ts中定义的关键路由
const FRONTEND_ENDPOINTS = {
  // 认证相关
  AUTH: [
    { method: 'POST', path: '/api/auth/login', name: 'AUTH_ENDPOINTS.LOGIN' },
    { method: 'POST', path: '/api/auth/logout', name: 'AUTH_ENDPOINTS.LOGOUT' },
    { method: 'POST', path: '/api/auth/refresh-token', name: 'AUTH_ENDPOINTS.REFRESH_TOKEN' },
    { method: 'GET', path: '/api/auth/verify-token', name: 'AUTH_ENDPOINTS.VERIFY_TOKEN' },
    { method: 'GET', path: '/api/auth/me', name: 'AUTH_ENDPOINTS.USER_INFO' }
  ],

  // 用户管理
  USER: [
    { method: 'GET', path: '/api/users', name: 'USER_ENDPOINTS.BASE' },
    { method: 'POST', path: '/api/users', name: 'USER_ENDPOINTS.CREATE' },
    { method: 'GET', path: '/api/users/profile', name: 'USER_ENDPOINTS.GET_PROFILE' }
  ],

  // 角色权限
  ROLE: [
    { method: 'GET', path: '/api/roles', name: 'ROLE_ENDPOINTS.BASE' },
    { method: 'POST', path: '/api/roles', name: 'ROLE_ENDPOINTS.CREATE' }
  ],

  PERMISSION: [
    { method: 'GET', path: '/api/permissions', name: 'PERMISSION_ENDPOINTS.BASE' },
    { method: 'GET', path: '/api/permissions/my-pages', name: 'PERMISSION_ENDPOINTS.MY_PAGES' }
  ],

  // 核心业务模块
  KINDERGARTEN: [
    { method: 'GET', path: '/api/kindergartens', name: 'KINDERGARTEN_ENDPOINTS.BASE' },
    { method: 'POST', path: '/api/kindergartens', name: 'KINDERGARTEN_ENDPOINTS.CREATE' }
  ],

  CLASS: [
    { method: 'GET', path: '/api/classes', name: 'CLASS_ENDPOINTS.BASE' },
    { method: 'POST', path: '/api/classes', name: 'CLASS_ENDPOINTS.CREATE' },
    { method: 'GET', path: '/api/classes/stats', name: 'CLASS_ENDPOINTS.STATISTICS' }
  ],

  TEACHER: [
    { method: 'GET', path: '/api/teachers', name: 'TEACHER_ENDPOINTS.BASE' },
    { method: 'POST', path: '/api/teachers', name: 'TEACHER_ENDPOINTS.CREATE' },
    { method: 'GET', path: '/api/teachers/search', name: 'TEACHER_ENDPOINTS.SEARCH' }
  ],

  STUDENT: [
    { method: 'GET', path: '/api/students', name: 'STUDENT_ENDPOINTS.BASE' },
    { method: 'POST', path: '/api/students', name: 'STUDENT_ENDPOINTS.CREATE' },
    { method: 'GET', path: '/api/students/search', name: 'STUDENT_ENDPOINTS.SEARCH' },
    { method: 'GET', path: '/api/students/available', name: 'STUDENT_ENDPOINTS.AVAILABLE' },
    { method: 'GET', path: '/api/students/stats', name: 'STUDENT_ENDPOINTS.STATS' }
  ],

  PARENT: [
    { method: 'GET', path: '/api/parents', name: 'PARENT_ENDPOINTS.BASE' },
    { method: 'POST', path: '/api/parents', name: 'PARENT_ENDPOINTS.CREATE' }
  ],

  // 仪表盘
  DASHBOARD: [
    { method: 'GET', path: '/api/dashboard/overview', name: 'DASHBOARD_ENDPOINTS.OVERVIEW' },
    { method: 'GET', path: '/api/dashboard/statistics', name: 'DASHBOARD_ENDPOINTS.STATISTICS' },
    { method: 'GET', path: '/api/dashboard/real-time/system-status', name: 'DASHBOARD_ENDPOINTS.SYSTEM_STATUS' },
    { method: 'GET', path: '/api/dashboard/stats', name: 'DASHBOARD_ENDPOINTS.STATS' }
  ],

  // 园长管理
  PRINCIPAL: [
    { method: 'GET', path: '/api/principal/dashboard', name: 'PRINCIPAL_ENDPOINTS.DASHBOARD_STATS' },
    { method: 'GET', path: '/api/principal/campus/overview', name: 'PRINCIPAL_ENDPOINTS.CAMPUS_OVERVIEW' },
    { method: 'GET', path: '/api/principal/customer-pool/stats', name: 'PRINCIPAL_ENDPOINTS.CUSTOMER_POOL_STATS' }
  ],

  // 招生管理
  ENROLLMENT: [
    { method: 'GET', path: '/api/enrollment', name: 'ENROLLMENT_ENDPOINTS.BASE' },
    { method: 'GET', path: '/api/enrollment/stats', name: 'ENROLLMENT_ENDPOINTS.STATS' },
    { method: 'GET', path: '/api/enrollment-statistics', name: 'ENROLLMENT_STATISTICS' },
    { method: 'GET', path: '/api/enrollment-statistics/trend', name: 'ENROLLMENT_STATISTICS.TREND' }
  ],

  // 活动管理
  ACTIVITY: [
    { method: 'GET', path: '/api/activities', name: 'ACTIVITY_ENDPOINTS.BASE' },
    { method: 'GET', path: '/api/activities/statistics', name: 'ACTIVITY_ENDPOINTS.STATISTICS' },
    { method: 'POST', path: '/api/activities', name: 'ACTIVITY_ENDPOINTS.CREATE' }
  ],

  // 系统管理
  SYSTEM: [
    { method: 'GET', path: '/api/system', name: 'SYSTEM_ENDPOINTS.BASE' },
    { method: 'GET', path: '/api/system/health', name: 'SYSTEM_ENDPOINTS.HEALTH' },
    { method: 'GET', path: '/api/system/docs', name: 'SYSTEM_ENDPOINTS.DOCS' }
  ],

  // 文件管理
  FILES: [
    { method: 'GET', path: '/api/files', name: 'FILES_ENDPOINTS.BASE' },
    { method: 'GET', path: '/api/files/statistics', name: 'FILES_ENDPOINTS.STATISTICS' }
  ],

  // 通知管理
  NOTIFICATION: [
    { method: 'GET', path: '/api/notifications', name: 'NOTIFICATION_ENDPOINTS.BASE' },
    { method: 'GET', path: '/api/notifications/unread/count', name: 'NOTIFICATION_ENDPOINTS.UNREAD_COUNT' },
    { method: 'POST', path: '/api/notifications', name: 'NOTIFICATION_ENDPOINTS.CREATE' }
  ],

  // 日程管理
  SCHEDULE: [
    { method: 'GET', path: '/api/schedules', name: 'SCHEDULE_ENDPOINTS.BASE' },
    { method: 'GET', path: '/api/schedules/statistics', name: 'SCHEDULE_ENDPOINTS.STATISTICS' },
    { method: 'POST', path: '/api/schedules', name: 'SCHEDULE_ENDPOINTS.CREATE' }
  ],

  // 任务管理
  TODO: [
    { method: 'GET', path: '/api/todos', name: 'TODO_ENDPOINTS.BASE' },
    { method: 'GET', path: '/api/todos/my', name: 'TODO_ENDPOINTS.MY' },
    { method: 'GET', path: '/api/todos/statistics', name: 'TODO_ENDPOINTS.STATISTICS' }
  ],

  // 统计分析
  STATISTICS: [
    { method: 'GET', path: '/api/statistics', name: 'STATISTICS_ENDPOINTS.BASE' },
    { method: 'GET', path: '/api/statistics/users', name: 'STATISTICS_ENDPOINTS.USERS' },
    { method: 'GET', path: '/api/statistics/enrollment', name: 'STATISTICS_ENDPOINTS.ENROLLMENT' }
  ],

  // 性能监控
  PERFORMANCE: [
    { method: 'GET', path: '/api/performance', name: 'PERFORMANCE_ENDPOINTS.BASE' },
    { method: 'GET', path: '/api/performance/metrics', name: 'PERFORMANCE_ENDPOINTS.METRICS' },
    { method: 'GET', path: '/api/performance/database', name: 'PERFORMANCE_ENDPOINTS.DATABASE' }
  ]
};

// 主测试函数
async function runFrontendEndpointTest() {
  console.log('🚀 开始前端端点测试（增强版）...\n');
  
  try {
    // 获取认证token
    console.log('🔐 获取认证token...');
    const token = await getAuthToken();
    console.log('✅ Token获取成功\n');

    // 测试统计
    const stats = {
      total: 0,
      success: 0,
      failed: 0,
      timeouts: 0,
      errors: {},
      moduleStats: {},
      avgResponseTime: 0,
      totalResponseTime: 0,
      withTestData: 0,
      withoutTestData: 0
    };

    // 按模块测试
    console.log('🔄 开始模块化测试...\n');
    
    for (const [moduleName, endpoints] of Object.entries(FRONTEND_ENDPOINTS)) {
      console.log(`📦 测试模块: ${moduleName} (${endpoints.length} 个端点)`);
      
      const moduleStats = {
        total: endpoints.length,
        success: 0,
        failed: 0,
        endpoints: []
      };

      // 测试该模块的所有端点
      for (const endpoint of endpoints) {
        const result = await testEndpoint(endpoint.method, endpoint.path, token);
        
        stats.total++;
        stats.totalResponseTime += result.duration;
        
        if (result.hasTestData) {
          stats.withTestData++;
        } else {
          stats.withoutTestData++;
        }
        
        if (result.success) {
          stats.success++;
          moduleStats.success++;
          console.log(`  ✅ ${endpoint.method} ${endpoint.path} (${result.duration}ms) - ${endpoint.name}${result.hasTestData ? ' [有测试数据]' : ''}`);
        } else {
          stats.failed++;
          moduleStats.failed++;
          
          if (result.error === 'Timeout') {
            stats.timeouts++;
          }
          
          // 记录错误类型
          const errorKey = result.status || result.error;
          stats.errors[errorKey] = (stats.errors[errorKey] || 0) + 1;
          
          console.log(`  ❌ ${endpoint.method} ${endpoint.path} (${result.status || result.error}) - ${endpoint.name}${result.hasTestData ? ' [有测试数据]' : ' [无测试数据]'}`);
        }
        
        moduleStats.endpoints.push({
          ...result,
          name: endpoint.name
        });
        
        // 简短延迟避免过载
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      stats.moduleStats[moduleName] = moduleStats;
      console.log(`  📊 模块统计: ${moduleStats.success}/${moduleStats.total} 成功 (${Math.round(moduleStats.success/moduleStats.total*100)}%)\n`);
    }

    // 计算平均响应时间
    stats.avgResponseTime = Math.round(stats.totalResponseTime / stats.total);

    // 输出最终统计
    console.log('📊 ===== 前端端点测试报告（增强版） =====');
    console.log(`总端点数: ${stats.total}`);
    console.log(`成功: ${stats.success} (${Math.round(stats.success/stats.total*100)}%)`);
    console.log(`失败: ${stats.failed} (${Math.round(stats.failed/stats.total*100)}%)`);
    console.log(`超时: ${stats.timeouts}`);
    console.log(`平均响应时间: ${stats.avgResponseTime}ms`);
    console.log(`有测试数据: ${stats.withTestData}`);
    console.log(`无测试数据: ${stats.withoutTestData}`);
    
    if (Object.keys(stats.errors).length > 0) {
      console.log('\n🔍 错误分类:');
      Object.entries(stats.errors).forEach(([error, count]) => {
        console.log(`  ${error}: ${count} 次`);
      });
    }

    console.log('\n📦 模块统计:');
    Object.entries(stats.moduleStats).forEach(([module, moduleStats]) => {
      const successRate = Math.round(moduleStats.success/moduleStats.total*100);
      console.log(`  ${module}: ${moduleStats.success}/${moduleStats.total} (${successRate}%)`);
    });

    const overallSuccessRate = Math.round(stats.success/stats.total*100);
    console.log(`\n🎯 整体成功率: ${overallSuccessRate}%`);
    
    if (overallSuccessRate === 100) {
      console.log('🎉 恭喜！前端后端100%完美对齐！');
    } else {
      console.log('⚠️  仍有部分端点需要修复');
      console.log('💡 提示：部分POST请求可能需要更完整的测试数据');
    }

    console.log('\n✅ 前端端点测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  runFrontendEndpointTest();
}

module.exports = { runFrontendEndpointTest };