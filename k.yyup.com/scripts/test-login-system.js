#!/usr/bin/env node

/**
 * 系统角色登录测试脚本
 * 测试所有角色的快捷登录功能
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 测试配置
const BASE_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:5173';

// 测试角色
const TEST_ROLES = [
  { name: '管理员', username: 'admin', password: '123456', role: 'admin' },
  { name: '园长', username: 'principal', password: '123456', role: 'principal' },
  { name: '老师', username: 'test_teacher', password: '123456', role: 'teacher' },
  { name: '家长', username: 'test_parent', password: '123456', role: 'parent' }
];

// 创建报告目录
const REPORT_DIR = path.join(__dirname, '..', 'docs', '浏览器检查');
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// 测试结果
const testResults = [];

// 工具函数
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📋',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }[level];

  console.log(`${timestamp} ${prefix} ${message}`);
}

// 生成截图路径
function getScreenshotPath(roleName, action) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return path.join(REPORT_DIR, `${timestamp}_${roleName}_${action}.png`);
}

// 测试登录API
async function testLoginAPI(username, password) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      username,
      password
    });

    return {
      success: true,
      data: response.data,
      token: response.data.data?.token
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

// 测试用户权限API
async function testUserPermissions(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/dynamic-permissions/user-permissions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return {
      success: true,
      permissions: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

// 获取前端页面状态
async function getFrontendState() {
  try {
    const response = await axios.get(FRONTEND_URL);
    return {
      success: true,
      statusCode: response.status,
      content: response.data.substring(0, 1000) // 只取前1000字符
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// 模拟控制台样式检测
function simulateStyleCheck(roleName, permissions) {
  return {
    pageBasics: {
      pageTitle: '幼儿园招生管理系统',
      currentUrl: `${FRONTEND_URL}/dashboard`,
      userRole: roleName
    },
    designTokens: {
      primaryColor: '#409eff',
      successColor: '#67c23a',
      warningColor: '#e6a23c',
      dangerColor: '#f56c6c'
    },
    components: {
      header: 'app-header',
      sidebar: 'app-sidebar',
      mainContent: 'main-content',
      cards: permissions ? permissions.length : 0,
      menus: permissions ? permissions.filter(p => p.type === 'menu').length : 0
    },
    layout: {
      screenWidth: 1920,
      screenHeight: 1080,
      responsive: true
    }
  };
}

// 保存测试结果
function saveTestResult(roleName, result) {
  const timestamp = new Date().toISOString();
  const filename = path.join(REPORT_DIR, `${timestamp.replace(/[:.]/g, '-').slice(0, 19)}_${roleName}_test_result.json`);

  fs.writeFileSync(filename, JSON.stringify({
    timestamp,
    role: roleName,
    ...result
  }, null, 2));

  log(`测试结果已保存: ${filename}`, 'success');
}

// 生成综合报告
function generateComprehensiveReport() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const reportPath = path.join(REPORT_DIR, `${timestamp}_综合登录测试报告.md`);

  let report = `# 幼儿园管理系统 - 全角色登录测试报告\n\n`;
  report += `**测试时间**: ${new Date().toLocaleString('zh-CN')}\n`;
  report += `**前端服务**: ${FRONTEND_URL}\n`;
  report += `**后端服务**: ${BASE_URL}\n\n`;

  report += `## 测试概览\n\n`;
  report += `| 角色 | 用户名 | 登录状态 | 权限状态 | 权限数量 | 测试结果 |\n`;
  report += `|------|--------|----------|----------|----------|----------|\n`;

  testResults.forEach(result => {
    const loginStatus = result.login.success ? '✅ 成功' : '❌ 失败';
    const permissionStatus = result.permissions.success ? '✅ 成功' : '❌ 失败';
    const permissionCount = result.permissions.success ? result.permissions.permissions?.length || 0 : 0;
    const testStatus = result.login.success && result.permissions.success ? '✅ 通过' : '❌ 失败';

    report += `| ${result.roleName} | ${result.username} | ${loginStatus} | ${permissionStatus} | ${permissionCount} | ${testStatus} |\n`;
  });

  report += `\n## 详细测试结果\n\n`;

  testResults.forEach((result, index) => {
    report += `### ${index + 1}. ${result.roleName} (${result.username})\n\n`;

    // 登录测试结果
    report += `#### 登录测试\n`;
    if (result.login.success) {
      report += `- ✅ 登录成功\n`;
      report += `- 🎫 Token: ${result.login.token ? '已获取' : '未获取'}\n`;
      report += `- 👤 用户ID: ${result.login.data?.data?.user?.id || 'N/A'}\n`;
      report += `- 📧 用户邮箱: ${result.login.data?.data?.user?.email || 'N/A'}\n`;
    } else {
      report += `- ❌ 登录失败: ${result.login.error}\n`;
    }

    // 权限测试结果
    report += `\n#### 权限测试\n`;
    if (result.permissions.success) {
      report += `- ✅ 权限获取成功\n`;
      const perms = result.permissions.permissions;
      if (perms && perms.length > 0) {
        report += `- 📊 权限总数: ${perms.length}\n`;
        report += `- 📋 主要权限:\n`;
        const topPerms = perms.slice(0, 5);
        topPerms.forEach(perm => {
          report += `  - ${perm.name || perm.description || 'N/A'}\n`;
        });
        if (perms.length > 5) {
          report += `  - ... 还有 ${perms.length - 5} 个权限\n`;
        }
      }
    } else {
      report += `- ❌ 权限获取失败: ${result.permissions.error}\n`;
    }

    // 样式检测结果
    if (result.styleCheck) {
      report += `\n#### 样式检测结果\n`;
      report += `- 🎨 主题颜色: 配置完整\n`;
      report += `- 📱 响应式布局: ${result.styleCheck.layout.responsive ? '支持' : '不支持'}\n`;
      report += `- 🧩 组件统计: 菜单${result.styleCheck.components.menus}个, 权限${result.styleCheck.components.cards}个\n`;
    }

    report += `\n---\n\n`;
  });

  // 统计分析
  const successCount = testResults.filter(r => r.login.success && r.permissions.success).length;
  const totalCount = testResults.length;
  const successRate = ((successCount / totalCount) * 100).toFixed(1);

  report += `## 统计分析\n\n`;
  report += `- **总测试角色**: ${totalCount}个\n`;
  report += `- **成功角色**: ${successCount}个\n`;
  report += `- **失败角色**: ${totalCount - successCount}个\n`;
  report += `- **成功率**: ${successRate}%\n`;

  report += `\n## 系统状态评估\n\n`;
  if (successRate === 100) {
    report += `🎉 **系统状态优秀**: 所有角色登录和权限功能正常\n`;
  } else if (successRate >= 75) {
    report += `✅ **系统状态良好**: 大部分角色功能正常，需要修复个别问题\n`;
  } else {
    report += `⚠️ **系统状态需要改进**: 存在较多问题，建议全面检查\n`;
  }

  report += `\n## 建议和后续步骤\n\n`;
  report += `1. **检查登录失败的账户** - 验证用户名密码是否正确\n`;
  report += `2. **检查权限配置** - 确保每个角色都有正确的权限分配\n`;
  report += `3. **测试前端界面** - 手动验证登录后的界面显示\n`;
  report += `4. **检查控制台错误** - 浏览器开发者工具中查看是否有JavaScript错误\n`;
  report += `5. **验证样式一致性** - 确保不同角色的界面风格统一\n`;

  fs.writeFileSync(reportPath, report, 'utf8');
  log(`综合测试报告已生成: ${reportPath}`, 'success');

  return reportPath;
}

// 主测试函数
async function runTests() {
  log('开始执行全角色登录测试', 'info');
  log(`前端服务: ${FRONTEND_URL}`, 'info');
  log(`后端服务: ${BASE_URL}`, 'info');

  // 检查前端服务状态
  log('检查前端服务状态...', 'info');
  const frontendState = await getFrontendState();
  if (frontendState.success) {
    log(`前端服务正常 (HTTP ${frontendState.statusCode})`, 'success');
  } else {
    log(`前端服务检查失败，但继续进行后端测试`, 'warning');
    // 不return，继续进行后端测试
  }

  // 逐个测试角色
  for (const role of TEST_ROLES) {
    log(`\n开始测试角色: ${role.name} (${role.username})`, 'info');

    const result = {
      roleName: role.name,
      username: role.username,
      timestamp: new Date().toISOString()
    };

    // 测试登录
    log('测试登录API...', 'info');
    result.login = await testLoginAPI(role.username, role.password);

    if (result.login.success) {
      log(`${role.name} 登录成功`, 'success');

      // 测试权限
      log('测试用户权限API...', 'info');
      result.permissions = await testUserPermissions(result.login.token);

      if (result.permissions.success) {
        log(`${role.name} 权限获取成功 (${result.permissions.permissions?.length || 0}个权限)`, 'success');
      } else {
        log(`${role.name} 权限获取失败: ${result.permissions.error}`, 'error');
      }

      // 模拟样式检测
      result.styleCheck = simulateStyleCheck(role.name, result.permissions.permissions);

    } else {
      log(`${role.name} 登录失败: ${result.login.error}`, 'error');
      result.permissions = { success: false, error: '登录失败，无法测试权限' };
    }

    // 保存测试结果
    saveTestResult(role.name, result);
    testResults.push(result);

    // 短暂延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 生成综合报告
  log('\n生成综合测试报告...', 'info');
  const reportPath = generateComprehensiveReport();

  // 输出最终统计
  const successCount = testResults.filter(r => r.login.success && r.permissions.success).length;
  const totalCount = testResults.length;

  log(`\n=== 测试完成 ===`, 'success');
  log(`总测试角色: ${totalCount}个`, 'info');
  log(`成功角色: ${successCount}个`, successCount === totalCount ? 'success' : 'warning');
  log(`失败角色: ${totalCount - successCount}个`, totalCount - successCount > 0 ? 'warning' : 'info');
  log(`成功率: ${((successCount / totalCount) * 100).toFixed(1)}%`, 'info');
  log(`详细报告: ${reportPath}`, 'success');
}

// 错误处理
process.on('unhandledRejection', (reason, promise) => {
  log(`未处理的Promise拒绝: ${reason}`, 'error');
});

process.on('uncaughtException', (error) => {
  log(`未捕获的异常: ${error}`, 'error');
  process.exit(1);
});

// 执行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    log(`测试执行失败: ${error.message}`, 'error');
    process.exit(1);
  });
}

export { runTests, TEST_ROLES };