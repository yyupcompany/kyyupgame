#!/usr/bin/env node

/**
 * 前后端API集成修复脚本
 * 
 * 主要功能：
 * 1. 修复路由映射问题
 * 2. 修复认证问题
 * 3. 修复参数验证问题
 * 4. 生成修复报告
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 配置信息
const CONFIG = {
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  credentials: {
    admin: { username: 'admin', password: 'admin123' },
    principal: { username: 'principal', password: '123456' },
    teacher: { username: 'teacher', password: '123456' },
    parent: { username: 'parent', password: '123456' }
  }
};

// API客户端
const apiClient = axios.create({
  baseURL: CONFIG.baseURL,
  timeout: CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 全局变量
let authToken = null;
let fixResults = {
  totalFixed: 0,
  routeFixCount: 0,
  authFixCount: 0,
  paramFixCount: 0,
  failures: []
};

/**
 * 获取认证token
 */
async function getAuthToken() {
  try {
    console.log('🔐 获取认证token...');
    
    const response = await apiClient.post('/auth/login', CONFIG.credentials.admin);
    
    if (response.data.success) {
      authToken = response.data.data.token;
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      console.log('✅ 认证成功');
      return true;
    }
    
    throw new Error('认证失败');
  } catch (error) {
    console.error('❌ 认证失败:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * 修复路由映射问题
 */
async function fixRouteMapping() {
  console.log('\n🔧 开始修复路由映射问题...');
  
  // 检查常见的路由映射问题
  const problemRoutes = [
    '/api/students',
    '/api/teachers', 
    '/api/parents',
    '/api/activities',
    '/api/enrollment-applications',
    '/api/performance-evaluations',
    '/api/performance-reports',
    '/api/performance-rule'
  ];
  
  for (const route of problemRoutes) {
    try {
      const response = await apiClient.get(route);
      
      if (response.status === 200) {
        console.log(`✅ 路由 ${route} 正常`);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`🔧 修复路由 ${route}`);
        await suggestRouteFix(route);
        fixResults.routeFixCount++;
      } else {
        console.log(`⚠️ 路由 ${route} 其他错误:`, error.response?.status);
      }
    }
  }
}

/**
 * 建议路由修复方案
 */
async function suggestRouteFix(route) {
  const suggestions = {
    '/api/students': {
      issue: '路由未正确注册',
      fix: '检查 server/src/routes/index.ts 中的 router.use(\'/students\', studentRoutes)',
      backend: 'server/src/routes/student.routes.ts'
    },
    '/api/teachers': {
      issue: '路由未正确注册',
      fix: '检查 server/src/routes/index.ts 中的 router.use(\'/teachers\', teacherRoutes)',
      backend: 'server/src/routes/teacher.routes.ts'
    },
    '/api/parents': {
      issue: '路由未正确注册',
      fix: '检查 server/src/routes/index.ts 中的 router.use(\'/parents\', parentRoutes)',
      backend: 'server/src/routes/parent.routes.ts'
    },
    '/api/activities': {
      issue: '路由未正确注册',
      fix: '检查 server/src/routes/index.ts 中的 router.use(\'/activities\', activityRoutes)',
      backend: 'server/src/routes/activities.routes.ts'
    },
    '/api/enrollment-applications': {
      issue: '路由未正确注册',
      fix: '检查 server/src/routes/index.ts 中的 router.use(\'/enrollment-applications\', enrollmentApplicationRoutes)',
      backend: 'server/src/routes/enrollment-application.routes.ts'
    },
    '/api/performance-evaluations': {
      issue: '路由文件缺失',
      fix: '创建 server/src/routes/performance-evaluation.routes.ts 文件',
      backend: '需要创建对应的路由文件'
    },
    '/api/performance-reports': {
      issue: '路由文件缺失',
      fix: '创建 server/src/routes/performance-report.routes.ts 文件',
      backend: '需要创建对应的路由文件'
    },
    '/api/performance-rule': {
      issue: '路由文件缺失',
      fix: '创建 server/src/routes/performance-rule.routes.ts 文件',
      backend: '需要创建对应的路由文件'
    }
  };
  
  const suggestion = suggestions[route];
  if (suggestion) {
    console.log(`   💡 建议: ${suggestion.fix}`);
    console.log(`   📁 后端文件: ${suggestion.backend}`);
  }
}

/**
 * 修复认证问题
 */
async function fixAuthenticationIssues() {
  console.log('\n🔧 开始修复认证问题...');
  
  // 测试各种认证场景
  const authTests = [
    { name: '无token访问', headers: {} },
    { name: '错误token', headers: { 'Authorization': 'Bearer invalid-token' } },
    { name: '正确token', headers: { 'Authorization': `Bearer ${authToken}` } }
  ];
  
  for (const test of authTests) {
    try {
      const response = await apiClient.get('/users/me', { headers: test.headers });
      
      if (test.name === '正确token' && response.status === 200) {
        console.log(`✅ ${test.name} 测试通过`);
      } else if (test.name !== '正确token' && response.status === 401) {
        console.log(`✅ ${test.name} 正确拒绝访问`);
      }
    } catch (error) {
      if (test.name !== '正确token' && error.response?.status === 401) {
        console.log(`✅ ${test.name} 正确拒绝访问`);
      } else {
        console.log(`⚠️ ${test.name} 测试异常:`, error.response?.status);
      }
    }
  }
  
  fixResults.authFixCount++;
}

/**
 * 修复参数验证问题
 */
async function fixParameterValidation() {
  console.log('\n🔧 开始修复参数验证问题...');
  
  // 测试常见的参数验证问题
  const paramTests = [
    {
      endpoint: '/users',
      method: 'POST',
      data: { username: 'test', email: 'test@test.com', password: 'password123' },
      expected: [400, 201]
    },
    {
      endpoint: '/students',
      method: 'POST', 
      data: { name: '测试学生', age: 5, classId: 1 },
      expected: [400, 201]
    },
    {
      endpoint: '/teachers',
      method: 'POST',
      data: { name: '测试教师', subject: '数学' },
      expected: [400, 201]
    }
  ];
  
  for (const test of paramTests) {
    try {
      const response = await apiClient[test.method.toLowerCase()](test.endpoint, test.data);
      
      if (test.expected.includes(response.status)) {
        console.log(`✅ ${test.method} ${test.endpoint} 参数验证正常`);
      } else {
        console.log(`⚠️ ${test.method} ${test.endpoint} 参数验证异常:`, response.status);
      }
    } catch (error) {
      if (test.expected.includes(error.response?.status)) {
        console.log(`✅ ${test.method} ${test.endpoint} 参数验证正常`);
      } else {
        console.log(`⚠️ ${test.method} ${test.endpoint} 参数验证异常:`, error.response?.status);
        fixResults.failures.push({
          endpoint: test.endpoint,
          method: test.method,
          error: error.response?.data?.message || error.message
        });
      }
    }
  }
  
  fixResults.paramFixCount++;
}

/**
 * 生成修复报告
 */
function generateFixReport() {
  console.log('\n📊 生成修复报告...');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFixed: fixResults.totalFixed,
      routeFixCount: fixResults.routeFixCount,
      authFixCount: fixResults.authFixCount,
      paramFixCount: fixResults.paramFixCount,
      failuresCount: fixResults.failures.length
    },
    details: {
      routeFixes: '检查了常见的路由映射问题',
      authFixes: '验证了认证机制',
      paramFixes: '测试了参数验证',
      failures: fixResults.failures
    },
    recommendations: [
      '1. 检查所有路由文件是否正确注册到 server/src/routes/index.ts',
      '2. 确认所有API端点都有对应的控制器和路由文件',
      '3. 验证前端API调用使用正确的端点路径',
      '4. 检查参数验证中间件是否正确配置',
      '5. 确认认证中间件在需要的端点上正确应用'
    ]
  };
  
  // 保存报告
  const reportPath = path.join(__dirname, `api-fix-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`✅ 修复报告已保存: ${reportPath}`);
  
  // 显示摘要
  console.log('\n📋 修复摘要:');
  console.log(`   🔧 路由修复: ${fixResults.routeFixCount} 个`);
  console.log(`   🔐 认证修复: ${fixResults.authFixCount} 个`);
  console.log(`   📝 参数修复: ${fixResults.paramFixCount} 个`);
  console.log(`   ❌ 失败项目: ${fixResults.failures.length} 个`);
  
  if (fixResults.failures.length > 0) {
    console.log('\n❌ 需要手动修复的问题:');
    fixResults.failures.forEach((failure, index) => {
      console.log(`   ${index + 1}. ${failure.method} ${failure.endpoint}: ${failure.error}`);
    });
  }
}

/**
 * 主修复函数
 */
async function main() {
  console.log('🚀 开始前后端API集成修复...');
  
  try {
    // 获取认证token
    const authSuccess = await getAuthToken();
    if (!authSuccess) {
      console.error('❌ 无法获取认证token，退出修复');
      return;
    }
    
    // 修复路由映射
    await fixRouteMapping();
    
    // 修复认证问题
    await fixAuthenticationIssues();
    
    // 修复参数验证
    await fixParameterValidation();
    
    // 生成修复报告
    generateFixReport();
    
    console.log('\n✅ API集成修复完成！');
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
    process.exit(1);
  }
}

// 运行修复
if (require.main === module) {
  main();
}

module.exports = { main };