#!/usr/bin/env node

/**
 * 园长角色API数据一致性检测脚本
 * 测试所有园长相关的页面API端点
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';
const PRINCIPAL_CREDENTIALS = {
  username: 'principal',
  password: '123456'
};

let authToken = '';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 登录获取token
async function login() {
  try {
    log('\n=== 正在登录 ===', 'blue');
    const response = await axios.post(`${API_BASE}/auth/login`, PRINCIPAL_CREDENTIALS);
    if (response.data.success && response.data.data.token) {
      authToken = response.data.data.token;
      log(`✅ 登录成功，用户: ${response.data.data.user.username}`, 'green');
      log(`📝 Token: ${authToken.substring(0, 20)}...`, 'green');
      return true;
    }
    log('❌ 登录失败', 'red');
    return false;
  } catch (error) {
    log(`❌ 登录异常: ${error.message}`, 'red');
    return false;
  }
}

// 测试API端点
async function testAPI(method, endpoint, description = '') {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: { Authorization: `Bearer ${authToken}` }
    };

    if (method === 'GET') {
      config.params = { _t: Date.now() };
    }

    const startTime = Date.now();
    const response = await axios(config);
    const duration = Date.now() - startTime;

    const result = {
      endpoint,
      description,
      method,
      status: response.status,
      success: response.data.success,
      hasData: !!response.data.data,
      dataKeys: response.data.data ? Object.keys(response.data.data) : [],
      duration,
      error: null
    };

    if (response.status === 200 && response.data.success) {
      log(`✅ ${method} ${endpoint}`, 'green');
      log(`   描述: ${description}`, 'green');
      log(`   状态: ${response.status}, 耗时: ${duration}ms`, 'green');
      log(`   数据字段: ${result.dataKeys.length > 0 ? result.dataKeys.join(', ') : '无数据'}`, 'green');
    } else {
      log(`⚠️  ${method} ${endpoint}`, 'yellow');
      log(`   状态: ${response.status}, 成功: ${response.data.success}`, 'yellow');
    }

    return result;
  } catch (error) {
    log(`❌ ${method} ${endpoint}`, 'red');
    log(`   错误: ${error.message}`, 'red');
    if (error.response) {
      log(`   状态码: ${error.response.status}`, 'red');
    }
    return {
      endpoint,
      description,
      method,
      status: error.response?.status || 0,
      success: false,
      hasData: false,
      dataKeys: [],
      duration: 0,
      error: error.message
    };
  }
}

// 测试所有园长页面
async function testAllPrincipalPages() {
  const testResults = [];

  log('\n' + '='.repeat(80), 'blue');
  log('园长角色 API 数据一致性检测', 'blue');
  log('='.repeat(80), 'blue');

  // 1. 登录
  const loggedIn = await login();
  if (!loggedIn) {
    log('\n❌ 无法登录，终止测试', 'red');
    return;
  }

  // 2. 测试PC端园长页面
  log('\n\n=== 测试PC端园长页面 ===', 'blue');

  // 2.1 Dashboard仪表板
  log('\n【Dashboard 仪表板】', 'blue');
  testResults.push(await testAPI('GET', '/dashboard/stats', '仪表板统计数据'));
  testResults.push(await testAPI('GET', '/dashboard/todos?page=1&pageSize=5', '待办事项列表'));
  testResults.push(await testAPI('GET', '/dashboard/graduation-stats', '毕业统计'));
  testResults.push(await testAPI('GET', '/dashboard/pre-enrollment-stats', '预报名统计'));

  // 2.2 CustomerPool客户池
  log('\n【CustomerPool 客户池】', 'blue');
  testResults.push(await testAPI('GET', '/customer-pool?page=1&pageSize=20', '客户池列表'));
  testResults.push(await testAPI('GET', '/customer-pool/stats', '客户池统计'));

  // 2.3 ParentPermission家长权限
  log('\n【ParentPermission 家长权限】', 'blue');
  testResults.push(await testAPI('GET', '/parent-permissions?page=1&pageSize=20', '家长权限列表'));
  testResults.push(await testAPI('GET', '/parent-permissions/stats', '家长权限统计'));

  // 2.4 Performance绩效管理
  log('\n【Performance 绩效管理】', 'blue');
  testResults.push(await testAPI('GET', '/performance-rules?page=1&pageSize=20', '绩效规则列表'));
  testResults.push(await testAPI('GET', '/performance-rules/stats', '绩效统计'));

  // 2.5 PosterGenerator海报生成器
  log('\n【PosterGenerator 海报生成器】', 'blue');
  testResults.push(await testAPI('GET', '/poster-templates?page=1&pageSize=20', '海报模板列表'));
  testResults.push(await testAPI('GET', '/poster-generations?page=1&pageSize=20', '海报生成记录'));

  // 2.6 决策支持系统
  log('\n【决策支持系统】', 'blue');
  testResults.push(await testAPI('GET', '/decision-support/dashboard', '决策支持仪表板'));
  testResults.push(await testAPI('GET', '/decision-support/analytics', '决策支持分析'));

  // 2.7 活动管理
  log('\n【Activities 活动管理】', 'blue');
  testResults.push(await testAPI('GET', '/activities?page=1&pageSize=20', '活动列表'));
  testResults.push(await testAPI('GET', '/activities/stats', '活动统计'));

  // 2.8 海报模板
  log('\n【海报模板管理】', 'blue');
  testResults.push(await testAPI('GET', '/poster-templates?page=1&pageSize=20', '海报模板'));

  // 2.9 营销分析
  log('\n【营销分析】', 'blue');
  testResults.push(await testAPI('GET', '/marketing/analytics', '营销分析数据'));

  // 3. 测试移动端园长页面
  log('\n\n=== 测试移动端园长中心 ===', 'blue');

  // 3.1 园长中心
  log('\n【移动端园长中心】', 'blue');
  testResults.push(await testAPI('GET', '/mobile/dashboard/stats', '移动端仪表板统计'));

  // 3.2 任务中心
  log('\n【移动端任务中心】', 'blue');
  testResults.push(await testAPI('GET', '/todos?page=1&pageSize=20', '任务列表'));
  testResults.push(await testAPI('GET', '/schedules?page=1&pageSize=20', '日程列表'));

  // 3.3 教学中心
  log('\n【移动端教学中心】', 'blue');
  testResults.push(await testAPI('GET', '/teaching-center/overview', '教学中心概览'));
  testResults.push(await testAPI('GET', '/teaching-center/courses?page=1&pageSize=20', '课程列表'));

  // 3.4 招生中心
  log('\n【移动端招生中心】', 'blue');
  testResults.push(await testAPI('GET', '/enrollment-center/stats', '招生中心统计'));
  testResults.push(await testAPI('GET', '/enrollment-applications?page=1&pageSize=20', '招生申请列表'));

  // 3.5 系统中心
  log('\n【移动端系统中心】', 'blue');
  testResults.push(await testAPI('GET', '/system-configs?config_group=system', '系统配置'));
  testResults.push(await testAPI('GET', '/notifications?page=1&pageSize=20', '通知列表'));

  // 4. 通用API
  log('\n\n=== 测试通用API ===', 'blue');
  testResults.push(await testAPI('GET', '/users/profile', '用户资料'));
  testResults.push(await testAPI('GET', '/notifications/unread-count', '未读通知数'));

  // 5. 生成测试报告
  generateReport(testResults);
}

// 生成测试报告
function generateReport(results) {
  log('\n\n' + '='.repeat(80), 'blue');
  log('测试报告汇总', 'blue');
  log('='.repeat(80), 'blue');

  const successCount = results.filter(r => r.success && r.status === 200).length;
  const failCount = results.length - successCount;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

  log(`\n📊 测试统计:`, 'blue');
  log(`   总测试数: ${results.length}`, 'blue');
  log(`   成功: ${successCount} (${((successCount / results.length) * 100).toFixed(1)}%)`, 'green');
  log(`   失败: ${failCount} (${((failCount / results.length) * 100).toFixed(1)}%)`, failCount > 0 ? 'red' : 'green');
  log(`   平均响应时间: ${avgDuration.toFixed(0)}ms`, 'blue');

  // 失败的API
  const failedResults = results.filter(r => !r.success || r.status !== 200);
  if (failedResults.length > 0) {
    log(`\n❌ 失败的API (${failedResults.length}):`, 'red');
    failedResults.forEach(r => {
      log(`   - ${r.method} ${r.endpoint}`, 'red');
      log(`     错误: ${r.error || '状态码: ' + r.status}`, 'red');
    });
  }

  // 慢速API (>1000ms)
  const slowResults = results.filter(r => r.duration > 1000);
  if (slowResults.length > 0) {
    log(`\n⚠️  慢速API (>1000ms) (${slowResults.length}):`, 'yellow');
    slowResults.forEach(r => {
      log(`   - ${r.method} ${r.endpoint} (${r.duration}ms)`, 'yellow');
    });
  }

  // 生成Markdown报告
  const markdown = generateMarkdownReport(results, successCount, failCount, avgDuration);
  saveMarkdownReport(markdown);
}

// 生成Markdown报告
function generateMarkdownReport(results, successCount, failCount, avgDuration) {
  const date = new Date().toLocaleString('zh-CN');

  let markdown = `# 园长角色 API 数据一致性检测报告

## 检测时间
${date}

## 检测范围
- **角色**: 园长 (principal)
- **测试账号**: principal / ******
- **测试环境**: http://localhost:3000

## 检测统计
- **总测试数**: ${results.length}
- **成功**: ${successCount} (${((successCount / results.length) * 100).toFixed(1)}%)
- **失败**: ${failCount} (${((failCount / results.length) * 100).toFixed(1)}%)
- **平均响应时间**: ${avgDuration.toFixed(0)}ms

## 详细检测结果

### PC端园长页面

#### 1. Dashboard 仪表板

| API端点 | 方法 | 状态 | 响应时间 | 数据字段 | 备注 |
|---------|------|------|----------|----------|------|
`;
  // Dashboard相关API
  const dashboardAPIs = results.filter(r => r.endpoint.includes('/dashboard'));
  dashboardAPIs.forEach(r => {
    markdown += `| ${r.endpoint} | ${r.method} | ${r.success && r.status === 200 ? '✅' : '❌'} | ${r.duration}ms | ${r.dataKeys.length > 0 ? r.dataKeys.join(', ') : '无'} | ${r.error || ''} |\n`;
  });

  markdown += `\n#### 2. CustomerPool 客户池

| API端点 | 方法 | 状态 | 响应时间 | 数据字段 | 备注 |
|---------|------|------|----------|----------|------|
`;
  const customerPoolAPIs = results.filter(r => r.endpoint.includes('/customer-pool'));
  customerPoolAPIs.forEach(r => {
    markdown += `| ${r.endpoint} | ${r.method} | ${r.success && r.status === 200 ? '✅' : '❌'} | ${r.duration}ms | ${r.dataKeys.length > 0 ? r.dataKeys.join(', ') : '无'} | ${r.error || ''} |\n`;
  });

  markdown += `\n#### 3. ParentPermission 家长权限

| API端点 | 方法 | 状态 | 响应时间 | 数据字段 | 备注 |
|---------|------|------|----------|----------|------|
`;
  const parentPermissionAPIs = results.filter(r => r.endpoint.includes('/parent-permissions'));
  parentPermissionAPIs.forEach(r => {
    markdown += `| ${r.endpoint} | ${r.method} | ${r.success && r.status === 200 ? '✅' : '❌'} | ${r.duration}ms | ${r.dataKeys.length > 0 ? r.dataKeys.join(', ') : '无'} | ${r.error || ''} |\n`;
  });

  markdown += `\n#### 4. Performance 绩效管理

| API端点 | 方法 | 状态 | 响应时间 | 数据字段 | 备注 |
|---------|------|------|----------|----------|------|
`;
  const performanceAPIs = results.filter(r => r.endpoint.includes('/performance'));
  performanceAPIs.forEach(r => {
    markdown += `| ${r.endpoint} | ${r.method} | ${r.success && r.status === 200 ? '✅' : '❌'} | ${r.duration}ms | ${r.dataKeys.length > 0 ? r.dataKeys.join(', ') : '无'} | ${r.error || ''} |\n`;
  });

  markdown += `\n#### 5. PosterGenerator 海报生成器

| API端点 | 方法 | 状态 | 响应时间 | 数据字段 | 备注 |
|---------|------|------|----------|----------|------|
`;
  const posterAPIs = results.filter(r => r.endpoint.includes('/poster'));
  posterAPIs.forEach(r => {
    markdown += `| ${r.endpoint} | ${r.method} | ${r.success && r.status === 200 ? '✅' : '❌'} | ${r.duration}ms | ${r.dataKeys.length > 0 ? r.dataKeys.join(', ') : '无'} | ${r.error || ''} |\n`;
  });

  markdown += `\n#### 6. 决策支持系统

| API端点 | 方法 | 状态 | 响应时间 | 数据字段 | 备注 |
|---------|------|------|----------|----------|------|
`;
  const decisionAPIs = results.filter(r => r.endpoint.includes('/decision-support'));
  decisionAPIs.forEach(r => {
    markdown += `| ${r.endpoint} | ${r.method} | ${r.success && r.status === 200 ? '✅' : '❌'} | ${r.duration}ms | ${r.dataKeys.length > 0 ? r.dataKeys.join(', ') : '无'} | ${r.error || ''} |\n`;
  });

  markdown += `\n### 移动端园长中心

#### 移动端API测试

| API端点 | 方法 | 状态 | 响应时间 | 数据字段 | 备注 |
|---------|------|------|----------|----------|------|
`;
  const mobileAPIs = results.filter(r => r.endpoint.includes('/mobile') || r.description.includes('移动端'));
  mobileAPIs.forEach(r => {
    markdown += `| ${r.endpoint} | ${r.method} | ${r.success && r.status === 200 ? '✅' : '❌'} | ${r.duration}ms | ${r.dataKeys.length > 0 ? r.dataKeys.join(', ') : '无'} | ${r.error || ''} |\n`;
  });

  markdown += `\n## 问题汇总

### 严重问题（API失败）
`;
  const failedResults = results.filter(r => !r.success || r.status !== 200);
  if (failedResults.length > 0) {
    failedResults.forEach((r, i) => {
      markdown += `${i + 1}. **${r.method} ${r.endpoint}**\n`;
      markdown += `   - 错误: ${r.error || 'HTTP ' + r.status}\n`;
      markdown += `   - 描述: ${r.description}\n\n`;
    });
  } else {
    markdown += '无严重问题\n\n';
  }

  markdown += `### 警告（性能问题）
`;
  const slowResults = results.filter(r => r.duration > 1000);
  if (slowResults.length > 0) {
    slowResults.forEach((r, i) => {
      markdown += `${i + 1}. **${r.method} ${r.endpoint}**\n`;
      markdown += `   - 响应时间: ${r.duration}ms\n`;
      markdown += `   - 建议: 优化数据库查询或添加缓存\n\n`;
    });
  } else {
    markdown += '无性能问题\n\n';
  }

  markdown += `## 数据一致性分析

### 已检测的数据字段
`;
  // 统计所有返回的字段
  const allFields = new Set();
  results.filter(r => r.hasData).forEach(r => {
    r.dataKeys.forEach(k => allFields.add(k));
  });

  markdown += `- 总计检测到 ${allFields.size} 个不同的数据字段\n`;
  markdown += `- 主要字段类型: ${Array.from(allFields).slice(0, 10).join(', ')}...\n\n`;

  markdown += `## 校验结论

### 整体评估
- **数据一致性**: ${successCount === results.length ? '✅ 优秀' : successCount > results.length * 0.8 ? '⚠️ 良好' : '❌ 需要改进'}
- **API可用性**: ${((successCount / results.length) * 100).toFixed(1)}%
- **性能表现**: ${avgDuration < 500 ? '✅ 优秀' : avgDuration < 1000 ? '⚠️ 可接受' : '❌ 需要优化'}

### 建议
${successCount === results.length ?
'1. ✅ 所有API测试通过，系统运行正常\n2. 💡 建议定期进行自动化测试\n3. 📊 建议添加API性能监控' :
'1. 🔧 修复失败的API端点\n2. 🔍 检查后端路由配置\n3. 📝 查看后端日志定位问题'}
`;

  return markdown;
}

// 保存Markdown报告
function saveMarkdownReport(markdown) {
  const fs = require('fs');
  const reportPath = '/persistent/home/zhgue/kyyupgame/API数据校验001点.md';

  try {
    fs.writeFileSync(reportPath, markdown, 'utf8');
    log(`\n✅ 报告已保存: ${reportPath}`, 'green');
  } catch (error) {
    log(`\n❌ 保存报告失败: ${error.message}`, 'red');
  }
}

// 主函数
async function main() {
  try {
    await testAllPrincipalPages();
  } catch (error) {
    log(`\n❌ 测试过程出错: ${error.message}`, 'red');
    console.error(error);
  } finally {
    log('\n\n=== 测试完成 ===\n', 'blue');
    process.exit(0);
  }
}

// 运行测试
main();
