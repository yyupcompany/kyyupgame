#!/usr/bin/env node

/**
 * 园长角色API数据一致性检测脚本 - 最终版本
 * 使用正确的API路径进行完整测试
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
  blue: '\x1b[36m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 登录获取token
async function login() {
  try {
    log('\n=== 正在登录 ===', 'cyan');
    const response = await axios.post(`${API_BASE}/auth/login`, PRINCIPAL_CREDENTIALS);
    if (response.data.success && response.data.data.token) {
      authToken = response.data.data.token;
      log(`✅ 登录成功，用户: ${response.data.data.user.username}`, 'green');
      log(`📝 Token: ${authToken.substring(0, 20)}...`, 'green');
      log(`🔑 用户ID: ${response.data.data.user.id}`, 'green');
      log(`🎭 角色: ${response.data.data.user.role}`, 'green');
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
      dataSample: null,
      duration,
      error: null
    };

    // 提取数据样本
    if (response.data.data) {
      if (Array.isArray(response.data.data)) {
        result.dataSample = { type: 'array', length: response.data.data.length };
      } else if (typeof response.data.data === 'object') {
        const keys = Object.keys(response.data.data);
        result.dataSample = {
          type: 'object',
          keys: keys.slice(0, 5),
          totalKeys: keys.length
        };

        // 提取一些示例值
        if (response.data.data.items && Array.isArray(response.data.data.items)) {
          result.dataSample.itemsCount = response.data.data.items.length;
          if (response.data.data.items.length > 0) {
            result.dataSample.firstItemKeys = Object.keys(response.data.data.items[0]);
          }
        }
      }
    }

    if (response.status === 200 && response.data.success) {
      log(`✅ ${method} ${endpoint}`, 'green');
      log(`   描述: ${description}`, 'green');
      log(`   状态: ${response.status}, 耗时: ${duration}ms`, 'green');
      if (result.dataSample) {
        log(`   数据: ${JSON.stringify(result.dataSample)}`, 'green');
      }
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
      if (error.response.data && error.response.data.message) {
        log(`   消息: ${error.response.data.message}`, 'red');
      }
    }
    return {
      endpoint,
      description,
      method,
      status: error.response?.status || 0,
      success: false,
      hasData: false,
      dataKeys: [],
      dataSample: null,
      duration: 0,
      error: error.message,
      errorMessage: error.response?.data?.message || ''
    };
  }
}

// 测试所有园长页面
async function testAllPrincipalPages() {
  const testResults = [];
  const testStartTime = Date.now();

  log('\n' + '='.repeat(80), 'cyan');
  log('园长角色 API 数据一致性检测', 'cyan');
  log('='.repeat(80), 'cyan');

  // 1. 登录
  const loggedIn = await login();
  if (!loggedIn) {
    log('\n❌ 无法登录，终止测试', 'red');
    return;
  }

  // 2. 测试PC端园长页面
  log('\n\n=== 测试PC端园长页面 ===', 'cyan');

  // 2.1 Dashboard仪表板
  log('\n【Dashboard 仪表板】', 'cyan');
  testResults.push(await testAPI('GET', '/dashboard/stats', '仪表板统计数据'));
  testResults.push(await testAPI('GET', '/dashboard/todos?page=1&pageSize=5', '待办事项列表'));
  testResults.push(await testAPI('GET', '/dashboard/graduation-stats', '毕业统计'));
  testResults.push(await testAPI('GET', '/dashboard/pre-enrollment-stats', '预报名统计'));

  // 2.2 CustomerPool客户池 - 使用正确的路径
  log('\n【CustomerPool 客户池】', 'cyan');
  testResults.push(await testAPI('GET', '/customer-pool?page=1&pageSize=20', '客户池列表'));
  testResults.push(await testAPI('GET', '/principal/customer-pool?page=1&pageSize=20', '客户池列表(园长路径)'));
  testResults.push(await testAPI('GET', '/customer-pool/stats', '客户池统计'));

  // 2.3 ParentPermission家长权限
  log('\n【ParentPermission 家长权限】', 'cyan');
  testResults.push(await testAPI('GET', '/parent-permissions?page=1&pageSize=20', '家长权限列表'));
  testResults.push(await testAPI('GET', '/parent-permissions/stats', '家长权限统计'));

  // 2.4 Performance绩效管理
  log('\n【Performance 绩效管理】', 'cyan');
  testResults.push(await testAPI('GET', '/performance-rules?page=1&pageSize=20', '绩效规则列表'));
  testResults.push(await testAPI('GET', '/performance-rules/stats', '绩效统计'));

  // 2.5 PosterGenerator海报生成器
  log('\n【PosterGenerator 海报生成器】', 'cyan');
  testResults.push(await testAPI('GET', '/poster-templates?page=1&pageSize=20', '海报模板列表'));
  testResults.push(await testAPI('GET', '/poster-generations?page=1&pageSize=20', '海报生成记录'));

  // 2.6 决策支持系统
  log('\n【决策支持系统】', 'cyan');
  testResults.push(await testAPI('GET', '/decision-support/dashboard', '决策支持仪表板'));
  testResults.push(await testAPI('GET', '/decision-support/analytics', '决策支持分析'));

  // 2.7 活动管理
  log('\n【Activities 活动管理】', 'cyan');
  testResults.push(await testAPI('GET', '/activities?page=1&pageSize=20', '活动列表'));
  testResults.push(await testAPI('GET', '/activities/statistics', '活动统计'));

  // 2.8 营销分析
  log('\n【营销分析】', 'cyan');
  testResults.push(await testAPI('GET', '/marketing/analytics', '营销分析数据'));

  // 2.9 园长专用页面
  log('\n【园长专用页面】', 'cyan');
  testResults.push(await testAPI('GET', '/principal/dashboard', '园长仪表板'));
  testResults.push(await testAPI('GET', '/principal/performance', '园长绩效'));
  testResults.push(await testAPI('GET', '/principal/customer-pool-stats', '园长客户池统计'));

  // 3. 测试移动端园长页面
  log('\n\n=== 测试移动端园长中心 ===', 'cyan');

  // 3.1 园长中心
  log('\n【移动端园长中心】', 'cyan');
  testResults.push(await testAPI('GET', '/mobile/centers/principal-center', '移动端园长中心'));
  testResults.push(await testAPI('GET', '/centers/principal-center/dashboard', '园长中心仪表板'));

  // 3.2 任务中心
  log('\n【移动端任务中心】', 'cyan');
  testResults.push(await testAPI('GET', '/mobile/centers/task-center', '移动端任务中心'));
  testResults.push(await testAPI('GET', '/todos?page=1&pageSize=20', '任务列表'));
  testResults.push(await testAPI('GET', '/schedules?page=1&pageSize=20', '日程列表'));

  // 3.3 教学中心
  log('\n【移动端教学中心】', 'cyan');
  testResults.push(await testAPI('GET', '/mobile/centers/teaching-center', '移动端教学中心'));
  testResults.push(await testAPI('GET', '/teaching-center/overview', '教学中心概览'));

  // 3.4 招生中心
  log('\n【移动端招生中心】', 'cyan');
  testResults.push(await testAPI('GET', '/mobile/centers/enrollment-center', '移动端招生中心'));
  testResults.push(await testAPI('GET', '/enrollment-applications?page=1&pageSize=20', '招生申请列表'));

  // 3.5 系统中心
  log('\n【移动端系统中心】', 'cyan');
  testResults.push(await testAPI('GET', '/mobile/centers/system-center', '移动端系统中心'));
  testResults.push(await testAPI('GET', '/system-configs?config_group=system', '系统配置'));

  // 4. 通用API
  log('\n\n=== 测试通用API ===', 'cyan');
  testResults.push(await testAPI('GET', '/users/profile', '用户资料'));
  testResults.push(await testAPI('GET', '/notifications/unread-count', '未读通知数'));
  testResults.push(await testAPI('GET', '/notifications?page=1&pageSize=20', '通知列表'));

  const totalDuration = Date.now() - testStartTime;

  // 5. 生成测试报告
  generateReport(testResults, totalDuration);
}

// 生成测试报告
function generateReport(results, totalDuration) {
  log('\n\n' + '='.repeat(80), 'cyan');
  log('测试报告汇总', 'cyan');
  log('='.repeat(80), 'cyan');

  const successCount = results.filter(r => r.success && r.status === 200).length;
  const failCount = results.length - successCount;
  const notFoundCount = results.filter(r => r.status === 404).length;
  const forbiddenCount = results.filter(r => r.status === 403).length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

  log(`\n📊 测试统计:`, 'cyan');
  log(`   总测试数: ${results.length}`, 'cyan');
  log(`   成功: ${successCount} (${((successCount / results.length) * 100).toFixed(1)}%)`, 'green');
  log(`   失败: ${failCount} (${((failCount / results.length) * 100).toFixed(1)}%)`, failCount > 0 ? 'red' : 'green');
  log(`   - 404 Not Found: ${notFoundCount}`, notFoundCount > 0 ? 'red' : 'green');
  log(`   - 403 Forbidden: ${forbiddenCount}`, forbiddenCount > 0 ? 'yellow' : 'green');
  log(`   平均响应时间: ${avgDuration.toFixed(0)}ms`, 'cyan');
  log(`   总测试时间: ${totalDuration}ms`, 'cyan');

  // 失败的API
  const failedResults = results.filter(r => !r.success || r.status !== 200);
  if (failedResults.length > 0) {
    log(`\n❌ 失败的API (${failedResults.length}):`, 'red');
    failedResults.forEach(r => {
      log(`   - ${r.method} ${r.endpoint} [${r.status}]`, 'red');
      log(`     错误: ${r.error || r.errorMessage || 'HTTP ' + r.status}`, 'red');
      log(`     描述: ${r.description}`, 'red');
    });
  }

  // 慢速API (>500ms)
  const slowResults = results.filter(r => r.duration > 500 && r.success);
  if (slowResults.length > 0) {
    log(`\n⚠️  慢速API (>500ms) (${slowResults.length}):`, 'yellow');
    slowResults.forEach(r => {
      log(`   - ${r.method} ${r.endpoint} (${r.duration}ms)`, 'yellow');
    });
  }

  // 成功的API数据字段统计
  const successResults = results.filter(r => r.success && r.status === 200);
  const allFields = new Set();
  successResults.forEach(r => {
    r.dataKeys.forEach(k => allFields.add(k));
  });

  log(`\n📝 数据字段统计:`, 'cyan');
  log(`   成功的API返回的数据字段总数: ${allFields.size}`, 'cyan');
  log(`   示例字段: ${Array.from(allFields).slice(0, 10).join(', ')}...`, 'cyan');

  // 生成Markdown报告
  const markdown = generateMarkdownReport(results, successCount, failCount, notFoundCount, forbiddenCount, avgDuration, totalDuration, allFields);
  saveMarkdownReport(markdown);
}

// 生成Markdown报告
function generateMarkdownReport(results, successCount, failCount, notFoundCount, forbiddenCount, avgDuration, totalDuration, allFields) {
  const date = new Date().toLocaleString('zh-CN');

  let markdown = `# 园长角色 API 数据一致性检测报告

## 检测时间
${date}

## 检测范围
- **角色**: 园长 (principal)
- **测试账号**: principal / 123456
- **测试环境**: http://localhost:3000
- **前端地址**: http://localhost:5173

## 执行摘要
### 检测统计
- **总测试数**: ${results.length}
- **成功**: ${successCount} (${((successCount / results.length) * 100).toFixed(1)}%)
- **失败**: ${failCount} (${((failCount / results.length) * 100).toFixed(1)}%)
  - 404 Not Found: ${notFoundCount}
  - 403 Forbidden: ${forbiddenCount}
- **平均响应时间**: ${avgDuration.toFixed(0)}ms
- **总测试时间**: ${totalDuration}ms

### 整体评估
`;

  // 评估等级
  if (successCount === results.length) {
    markdown += '- **系统状态**: ✅ 优秀\n';
    markdown += '- **API可用性**: 100%\n';
    markdown += '- **数据完整性**: ✅ 所有API均返回数据\n';
  } else if (successCount > results.length * 0.7) {
    markdown += '- **系统状态**: ⚠️ 良好\n';
    markdown += `- **API可用性**: ${((successCount / results.length) * 100).toFixed(1)}%\n`;
    markdown += '- **建议**: 部分API需要修复\n';
  } else {
    markdown += '- **系统状态**: ❌ 需要改进\n';
    markdown += `- **API可用性**: ${((successCount / results.length) * 100).toFixed(1)}%\n`;
    markdown += '- **建议**: 大量API需要修复\n';
  }

  markdown += `
## 详细检测结果

### PC端园长页面

#### 1. Dashboard 仪表板

**API端点**:
`;

  // Dashboard相关API
  const dashboardAPIs = results.filter(r => r.endpoint.includes('/dashboard') && !r.endpoint.includes('mobile'));
  dashboardAPIs.forEach(r => {
    markdown += `- ${r.method} \`${r.endpoint}\` - `;
    if (r.success && r.status === 200) {
      markdown += `✅ ${r.duration}ms\n`;
      markdown += `  - 数据字段: ${r.dataKeys.length > 0 ? r.dataKeys.join(', ') : '无'}\n`;
      if (r.dataSample) {
        markdown += `  - 数据结构: ${JSON.stringify(r.dataSample)}\n`;
      }
    } else {
      markdown += `❌ [${r.status}]\n`;
      markdown += `  - 错误: ${r.error || r.errorMessage || 'HTTP ' + r.status}\n`;
    }
  });

  markdown += `\n#### 2. CustomerPool 客户池

**API端点**:
`;
  const customerPoolAPIs = results.filter(r => r.endpoint.includes('customer-pool'));
  customerPoolAPIs.forEach(r => {
    markdown += `- ${r.method} \`${r.endpoint}\` - `;
    if (r.success && r.status === 200) {
      markdown += `✅ ${r.duration}ms\n`;
      markdown += `  - 数据字段: ${r.dataKeys.length > 0 ? r.dataKeys.join(', ') : '无'}\n`;
    } else {
      markdown += `❌ [${r.status}]\n`;
      markdown += `  - 错误: ${r.error || r.errorMessage || 'HTTP ' + r.status}\n`;
    }
  });

  markdown += `\n#### 3. ParentPermission 家长权限

**API端点**:
`;
  const parentPermissionAPIs = results.filter(r => r.endpoint.includes('parent-permissions'));
  parentPermissionAPIs.forEach(r => {
    markdown += `- ${r.method} \`${r.endpoint}\` - `;
    if (r.success && r.status === 200) {
      markdown += `✅ ${r.duration}ms\n`;
      markdown += `  - 数据字段: ${r.dataKeys.join(', ')}\n`;
    } else {
      markdown += `❌ [${r.status}]\n`;
      markdown += `  - 错误: ${r.error || r.errorMessage || 'HTTP ' + r.status}\n`;
    }
  });

  markdown += `\n#### 4. Performance 绩效管理

**API端点**:
`;
  const performanceAPIs = results.filter(r => r.endpoint.includes('performance'));
  performanceAPIs.forEach(r => {
    markdown += `- ${r.method} \`${r.endpoint}\` - `;
    if (r.success && r.status === 200) {
      markdown += `✅ ${r.duration}ms\n`;
      markdown += `  - 数据字段: ${r.dataKeys.join(', ')}\n`;
    } else {
      markdown += `❌ [${r.status}]\n`;
      markdown += `  - 错误: ${r.error || r.errorMessage || 'HTTP ' + r.status}\n`;
    }
  });

  markdown += `\n#### 5. PosterGenerator 海报生成器

**API端点**:
`;
  const posterAPIs = results.filter(r => r.endpoint.includes('poster'));
  posterAPIs.forEach(r => {
    markdown += `- ${r.method} \`${r.endpoint}\` - `;
    if (r.success && r.status === 200) {
      markdown += `✅ ${r.duration}ms\n`;
      markdown += `  - 数据字段: ${r.dataKeys.join(', ')}\n`;
    } else {
      markdown += `❌ [${r.status}]\n`;
      markdown += `  - 错误: ${r.error || r.errorMessage || 'HTTP ' + r.status}\n`;
    }
  });

  markdown += `\n#### 6. 决策支持系统

**API端点**:
`;
  const decisionAPIs = results.filter(r => r.endpoint.includes('decision-support'));
  decisionAPIs.forEach(r => {
    markdown += `- ${r.method} \`${r.endpoint}\` - `;
    if (r.success && r.status === 200) {
      markdown += `✅ ${r.duration}ms\n`;
      markdown += `  - 数据字段: ${r.dataKeys.join(', ')}\n`;
    } else {
      markdown += `❌ [${r.status}]\n`;
      markdown += `  - 错误: ${r.error || r.errorMessage || 'HTTP ' + r.status}\n`;
    }
  });

  markdown += `\n### 移动端园长中心

#### 移动端API测试

**API端点**:
`;
  const mobileAPIs = results.filter(r => r.endpoint.includes('/mobile') || r.endpoint.includes('/centers/'));
  mobileAPIs.forEach(r => {
    markdown += `- ${r.method} \`${r.endpoint}\` - `;
    if (r.success && r.status === 200) {
      markdown += `✅ ${r.duration}ms\n`;
      if (r.dataSample) {
        markdown += `  - 数据结构: ${JSON.stringify(r.dataSample)}\n`;
      }
    } else {
      markdown += `❌ [${r.status}]\n`;
      markdown += `  - 错误: ${r.error || r.errorMessage || 'HTTP ' + r.status}\n`;
    }
  });

  markdown += `\n## 问题汇总

### 严重问题（API失败）

#### 404 Not Found (路由不存在)
`;
  const notFoundResults = results.filter(r => r.status === 404);
  if (notFoundResults.length > 0) {
    notFoundResults.forEach((r, i) => {
      markdown += `${i + 1}. **${r.method} ${r.endpoint}**\n`;
      markdown += `   - 描述: ${r.description}\n`;
      markdown += `   - 建议: 检查后端路由配置，确认该API是否已实现\n\n`;
    });
  } else {
    markdown += '无404错误\n\n';
  }

  markdown += `#### 403 Forbidden (权限不足)
`;
  const forbiddenResults = results.filter(r => r.status === 403);
  if (forbiddenResults.length > 0) {
    forbiddenResults.forEach((r, i) => {
      markdown += `${i + 1}. **${r.method} ${r.endpoint}**\n`;
      markdown += `   - 描述: ${r.description}\n`;
      markdown += `   - 建议: 检查principal角色的权限配置\n\n`;
    });
  } else {
    markdown += '无403错误\n\n';
  }

  markdown += `### 警告（性能问题）
`;
  const slowResults = results.filter(r => r.duration > 500 && r.success);
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
- 总计检测到 **${allFields.size}** 个不同的数据字段
- 主要字段类型: ${Array.from(allFields).slice(0, 15).join(', ')}${allFields.size > 15 ? '...' : ''}

### 数据完整性检查
`;

  // 检查必需的字段
  const successResults = results.filter(r => r.success && r.status === 200);
  if (successResults.length > 0) {
    markdown += '成功的API均返回了有效的数据结构：\n\n';
    successResults.forEach(r => {
      if (r.dataSample && r.dataSample.firstItemKeys) {
        markdown += `- **${r.endpoint}**\n`;
        markdown += `  - 数据项字段: ${r.dataSample.firstItemKeys.join(', ')}\n`;
      }
    });
  }

  markdown += `
## 校验结论

### 整体评估
- **数据一致性**: ${successCount === results.length ? '✅ 优秀' : successCount > results.length * 0.7 ? '⚠️ 良好' : '❌ 需要改进'}
- **API可用性**: ${((successCount / results.length) * 100).toFixed(1)}%
- **性能表现**: ${avgDuration < 300 ? '✅ 优秀' : avgDuration < 500 ? '⚠️ 可接受' : '❌ 需要优化'}

### 修复优先级

#### 高优先级（P0）- 严重阻碍功能使用
`;
  if (notFoundResults.length > 0) {
    markdown += `1. **修复404错误的路由** (${notFoundResults.length}个)\n`;
    markdown += `   - 这些API路由尚未实现或路径配置错误\n`;
    markdown += `   - 影响: 园长无法正常访问这些功能模块\n`;
  }

  if (forbiddenResults.length > 0) {
    markdown += `2. **修复403权限错误** (${forbiddenResults.length}个)\n`;
    markdown += `   - principal角色缺少必要的权限\n`;
    markdown += `   - 影响: 园长无权访问某些功能\n`;
  }

  markdown += `
#### 中优先级（P1）- 优化用户体验
`;
  if (slowResults.length > 0) {
    markdown += `1. **优化慢速API** (${slowResults.length}个)\n`;
    markdown += `   - 响应时间超过500ms的API需要优化\n`;
  }

  markdown += `
#### 低优先级（P2）- 代码质量改进
1. 添加API文档
2. 完善错误处理
3. 添加单元测试

### 建议
`;

  if (successCount === results.length) {
    markdown += `1. ✅ 所有API测试通过，系统运行正常\n`;
    markdown += `2. 💡 建议定期进行自动化测试\n`;
    markdown += `3. 📊 建议添加API性能监控\n`;
    markdown += `4. 🔐 继续保持权限配置的准确性\n`;
  } else {
    markdown += `1. 🔧 立即修复失败的API端点（优先P0级别）\n`;
    markdown += `2. 🔍 检查后端路由配置，确保所有路由正确注册\n`;
    markdown += `3. 👥 审查principal角色权限配置\n`;
    markdown += `4. 📝 查看后端日志定位具体问题\n`;
    markdown += `5. 🧪 添加API测试用例防止回归\n`;
  }

  markdown += `
## 附录

### 测试环境信息
- **Node.js版本**: ${process.version}
- **测试时间**: ${new Date().toISOString()}
- **测试工具**: axios
- **认证方式**: JWT Bearer Token

### 相关文档
- [API文档](http://localhost:3000/api-docs)
- [路由配置](/server/src/routes/)
- [权限配置](/server/src/middlewares/auth.middleware.ts)

---

**报告生成时间**: ${date}
**测试执行者**: Claude AI - API数据一致性验证系统
**报告版本**: v1.0.0
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
    log(`📄 可以使用以下命令查看报告:`, 'green');
    log(`   cat ${reportPath}`, 'cyan');
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
    log('\n\n=== 测试完成 ===\n', 'cyan');
    process.exit(0);
  }
}

// 运行测试
main();
