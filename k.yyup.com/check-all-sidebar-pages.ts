/**
 * 批量检测 Admin、教师、家长三个角色的侧边栏页面控制台错误
 * 使用 Playwright API Service
 */

import { browserManager, pageOperations, consoleMonitor, screenshotService } from './playwright-api-service/dist/index.js';
import * as fs from 'fs';
import * as path from 'path';

// ============= 角色和页面配置 =============

interface RoleConfig {
  name: string;
  username: string;
  password: string;
  pages: PageConfig[];
}

interface PageConfig {
  name: string;
  path: string;
  category: string;
}

interface PageResult {
  name: string;
  path: string;
  category: string;
  url: string;
  title: string;
  errors: number;
  warnings: number;
  status: 'success' | 'error' | 'timeout';
  errorDetails: any[];
  screenshot?: string;
  timestamp: string;
}

interface RoleReport {
  role: string;
  username: string;
  totalPages: number;
  successPages: number;
  errorPages: number;
  totalErrors: number;
  totalWarnings: number;
  pages: PageResult[];
  duration: number;
}

// 三个角色的配置
const roles: RoleConfig[] = [
  {
    name: 'Admin管理员',
    username: 'admin',
    password: 'admin123',
    pages: [
      // 仪表板
      { name: '管理首页', path: '/dashboard', category: '仪表板' },
      { name: '数据统计', path: '/dashboard/data-statistics', category: '仪表板' },
      { name: '校园概览', path: '/dashboard/campus-overview', category: '仪表板' },

      // 班级管理
      { name: '班级列表', path: '/class', category: '班级管理' },
      { name: '班级统计', path: '/class/statistics', category: '班级管理' },

      // 学生管理
      { name: '学生列表', path: '/student', category: '学生管理' },
      { name: '学生统计', path: '/student/statistics', category: '学生管理' },

      // 教师管理
      { name: '教师列表', path: '/teacher', category: '教师管理' },
      { name: '教师统计', path: '/teacher/statistics', category: '教师管理' },

      // 招生管理
      { name: '招生管理', path: '/enrollment', category: '招生管理' },
      { name: '客户池', path: '/customer-pool', category: '招生管理' },

      // 活动管理
      { name: '活动列表', path: '/activities', category: '活动管理' },
      { name: '活动报名', path: '/activity/registration', category: '活动管理' },

      // 财务管理
      { name: '财务中心', path: '/finance', category: '财务管理' },
      { name: '费用管理', path: '/finance/fee-management', category: '财务管理' },

      // 系统管理
      { name: '系统设置', path: '/settings', category: '系统管理' },
      { name: '通知中心', path: '/notifications', category: '系统管理' }
    ]
  },
  {
    name: '教师',
    username: 'teacher',
    password: 'teacher123',
    pages: [
      { name: '教师工作台', path: '/teacher-center/dashboard', category: '工作台' },
      { name: '通知中心', path: '/teacher-center/notifications', category: '通知' },
      { name: '任务中心', path: '/teacher-center/tasks', category: '任务' },
      { name: '活动中心', path: '/teacher-center/activities', category: '活动' },
      { name: '招生中心', path: '/teacher-center/enrollment', category: '招生' },
      { name: '教学中心', path: '/teacher-center/teaching', category: '教学' },
      { name: '创意课程生成器', path: '/teacher-center/creative-curriculum', category: '教学' },
      { name: '客户跟踪', path: '/teacher-center/customer-tracking', category: '招生' },
      { name: '考勤管理', path: '/teacher-center/attendance', category: '管理' },
      { name: '绩效中心', path: '/teacher-center/performance-rewards', category: '绩效' }
    ]
  },
  {
    name: '家长',
    username: 'parent',
    password: 'parent123',
    pages: [
      { name: '我的首页', path: '/parent-center/dashboard', category: '首页' },
      { name: '我的信息', path: '/parent-center/profile', category: '个人' },
      { name: '我的孩子', path: '/parent-center/children', category: '孩子' },
      { name: '成长报告', path: '/parent-center/child-growth', category: '孩子' },
      { name: '测评中心', path: '/parent-center/assessment/development', category: '测评' },
      { name: 'AI育儿助手', path: '/parent-center/ai-assistant', category: 'AI助手' },
      { name: '游戏大厅', path: '/parent-center/games', category: '游戏' },
      { name: '活动列表', path: '/parent-center/activities', category: '活动' },
      { name: '活动报名', path: '/parent-center/activity-registration', category: '活动' },
      { name: '通知公告', path: '/parent-center/notifications', category: '通知' },
      { name: '相册中心', path: '/parent-center/photo-album', category: '相册' },
      { name: '园所奖励', path: '/parent-center/kindergarten-rewards', category: '奖励' },
      { name: '推广中心', path: '/parent-center/promotion-center', category: '推广' },
      { name: '在线聊天', path: '/parent-center/chat', category: '沟通' },
      { name: '智能沟通', path: '/parent-center/smart-communication', category: '沟通' },
      { name: '意见反馈', path: '/parent-center/feedback', category: '反馈' },
      { name: '分享统计', path: '/parent-center/share-stats', category: '统计' }
    ]
  }
];

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = './sidebar-error-screenshots';
const REPORT_DIR = './sidebar-reports';

// ============= 工具函数 =============

function ensureDirectoryExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0 ? `${minutes}分${remainingSeconds}秒` : `${remainingSeconds}秒`;
}

// ============= 登录函数 =============

async function login(username: string, password: string): Promise<boolean> {
  try {
    console.log(`\n🔐 正在登录：${username}...`);

    // 访问登录页面
    await pageOperations.goto(`${BASE_URL}/login`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await pageOperations.wait(1000);

    // 填写登录表单
    const page = browserManager.getPage();

    // 输入用户名 - 使用 data-testid
    await page.fill('[data-testid="username-input"]', username);
    await pageOperations.wait(500);

    // 输入密码 - 使用 data-testid
    await page.fill('[data-testid="password-input"]', password);
    await pageOperations.wait(500);

    // 点击登录按钮 - 使用 data-testid
    await page.click('[data-testid="login-button"]');

    // 等待跳转
    await pageOperations.wait(3000);

    const currentUrl = await pageOperations.getURL();

    if (currentUrl.includes('/login')) {
      console.log(`❌ 登录失败：仍在登录页面`);
      return false;
    }

    console.log(`✅ 登录成功：${currentUrl}`);
    return true;

  } catch (error: any) {
    console.error(`❌ 登录失败：${error.message}`);
    return false;
  }
}

// ============= 检查单个页面 =============

async function checkPage(roleConfig: RoleConfig, pageConfig: PageConfig): Promise<PageResult> {
  const startTime = Date.now();
  const fullUrl = `${BASE_URL}${pageConfig.path}`;

  console.log(`  📄 检查：${pageConfig.name} (${pageConfig.path})`);

  try {
    // 清空之前的控制台消息
    consoleMonitor.clearMessages();

    // 访问页面
    await pageOperations.goto(fullUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });

    // 等待页面渲染
    await pageOperations.wait(2000);

    // 获取页面信息
    const pageInfo = await pageOperations.getPageInfo();
    const errors = consoleMonitor.getErrors();
    const warnings = consoleMonitor.getWarnings();

    const result: PageResult = {
      name: pageConfig.name,
      path: pageConfig.path,
      category: pageConfig.category,
      url: pageInfo.url,
      title: pageInfo.title,
      errors: errors.length,
      warnings: warnings.length,
      status: 'success',
      errorDetails: errors,
      timestamp: new Date().toISOString()
    };

    // 如果有错误，截图保存
    if (errors.length > 0) {
      const screenshotFileName = `${roleConfig.name}-${pageConfig.name.replace(/\//g, '-')}.png`;
      const screenshotPath = await screenshotService.saveScreenshot(
        screenshotFileName,
        SCREENSHOT_DIR
      );
      result.screenshot = screenshotPath;
      console.log(`    ❌ 发现 ${errors.length} 个错误，已截图`);
    } else {
      console.log(`    ✅ 无错误`);
    }

    return result;

  } catch (error: any) {
    console.log(`    ⚠️  访问超时或失败: ${error.message}`);

    // 超时或错误时也截图
    try {
      const screenshotFileName = `${roleConfig.name}-${pageConfig.name.replace(/\//g, '-')}-error.png`;
      const screenshotPath = await screenshotService.saveScreenshot(
        screenshotFileName,
        SCREENSHOT_DIR
      );

      return {
        name: pageConfig.name,
        path: pageConfig.path,
        category: pageConfig.category,
        url: fullUrl,
        title: 'Error',
        errors: 0,
        warnings: 0,
        status: error.message.includes('Timeout') ? 'timeout' : 'error',
        errorDetails: [{ type: 'error', text: error.message }],
        screenshot: screenshotPath,
        timestamp: new Date().toISOString()
      };
    } catch (screenshotError) {
      return {
        name: pageConfig.name,
        path: pageConfig.path,
        category: pageConfig.category,
        url: fullUrl,
        title: 'Error',
        errors: 0,
        warnings: 0,
        status: 'error',
        errorDetails: [{ type: 'error', text: error.message }],
        timestamp: new Date().toISOString()
      };
    }
  }
}

// ============= 检查单个角色的所有页面 =============

async function checkRole(roleConfig: RoleConfig): Promise<RoleReport> {
  const roleStartTime = Date.now();

  console.log(`\n${'='.repeat(80)}`);
  console.log(`🎭 开始检查角色：${roleConfig.name}`);
  console.log(`${'='.repeat(80)}`);

  const results: PageResult[] = [];

  // 登录
  const loginSuccess = await login(roleConfig.username, roleConfig.password);

  if (!loginSuccess) {
    console.log(`❌ ${roleConfig.name} 登录失败，跳过检查`);
    return {
      role: roleConfig.name,
      username: roleConfig.username,
      totalPages: roleConfig.pages.length,
      successPages: 0,
      errorPages: roleConfig.pages.length,
      totalErrors: 0,
      totalWarnings: 0,
      pages: [],
      duration: Date.now() - roleStartTime
    };
  }

  // 开始监控控制台
  consoleMonitor.startMonitoring();

  // 逐个检查页面
  for (const pageConfig of roleConfig.pages) {
    const result = await checkPage(roleConfig, pageConfig);
    results.push(result);

    // 页面之间间隔
    await pageOperations.wait(1000);
  }

  // 停止监控
  consoleMonitor.stopMonitoring();

  // 统计结果
  const successPages = results.filter(r => r.status === 'success' && r.errors === 0).length;
  const errorPages = results.filter(r => r.errors > 0 || r.status !== 'success').length;
  const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings, 0);

  const roleDuration = Date.now() - roleStartTime;

  console.log(`\n📊 ${roleConfig.name} 检查完成:`);
  console.log(`   总页面: ${roleConfig.pages.length}`);
  console.log(`   成功: ${successPages}`);
  console.log(`   有错误: ${errorPages}`);
  console.log(`   总错误数: ${totalErrors}`);
  console.log(`   总警告数: ${totalWarnings}`);
  console.log(`   耗时: ${formatDuration(roleDuration)}`);

  return {
    role: roleConfig.name,
    username: roleConfig.username,
    totalPages: roleConfig.pages.length,
    successPages,
    errorPages,
    totalErrors,
    totalWarnings,
    pages: results,
    duration: roleDuration
  };
}

// ============= 主函数 =============

async function checkAllSidebarPages() {
  const totalStartTime = Date.now();

  console.log('🚀 开始批量检测侧边栏页面控制台错误...\n');
  console.log(`检查角色数: ${roles.length}`);
  console.log(`总页面数: ${roles.reduce((sum, r) => sum + r.pages.length, 0)}\n`);

  // 确保目录存在
  ensureDirectoryExists(SCREENSHOT_DIR);
  ensureDirectoryExists(REPORT_DIR);

  const allReports: RoleReport[] = [];

  try {
    // 启动浏览器
    console.log('1️⃣  启动浏览器...');
    await browserManager.launch({
      headless: true,
      viewport: { width: 1920, height: 1080 }
    });
    console.log('✅ 浏览器启动成功\n');

    // 逐个检查角色
    for (const roleConfig of roles) {
      const report = await checkRole(roleConfig);
      allReports.push(report);

      // 角色之间间隔，清除cookies并访问登录页
      console.log(`\n⏸️  准备切换下一个角色...\n`);

      // 清除所有cookies和localStorage
      try {
        const page = browserManager.getPage();
        const context = page.context();
        await context.clearCookies();

        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });

        // 访问登录页面
        await pageOperations.goto(`${BASE_URL}/login`, {
          waitUntil: 'domcontentloaded',
          timeout: 10000
        });
        await pageOperations.wait(2000);
      } catch (e) {
        console.log('清除会话失败，继续...');
      }
    }

    // ============= 生成总报告 =============

    const totalDuration = Date.now() - totalStartTime;
    const totalPages = allReports.reduce((sum, r) => sum + r.totalPages, 0);
    const totalSuccessPages = allReports.reduce((sum, r) => sum + r.successPages, 0);
    const totalErrorPages = allReports.reduce((sum, r) => sum + r.errorPages, 0);
    const totalErrorCount = allReports.reduce((sum, r) => sum + r.totalErrors, 0);
    const totalWarningCount = allReports.reduce((sum, r) => sum + r.totalWarnings, 0);

    const summaryReport = {
      timestamp: new Date().toISOString(),
      totalDuration,
      totalDurationFormatted: formatDuration(totalDuration),
      summary: {
        totalRoles: roles.length,
        totalPages,
        successPages: totalSuccessPages,
        errorPages: totalErrorPages,
        totalErrors: totalErrorCount,
        totalWarnings: totalWarningCount,
        healthRate: ((totalSuccessPages / totalPages) * 100).toFixed(2) + '%'
      },
      roles: allReports
    };

    // 保存 JSON 报告
    const reportPath = path.join(REPORT_DIR, `sidebar-check-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(summaryReport, null, 2));

    // 保存 Markdown 报告
    const mdReport = generateMarkdownReport(summaryReport);
    const mdReportPath = path.join(REPORT_DIR, `sidebar-check-report-${Date.now()}.md`);
    fs.writeFileSync(mdReportPath, mdReport);

    // 打印总结
    console.log('\n' + '='.repeat(80));
    console.log('📋 总体检查摘要');
    console.log('='.repeat(80));
    console.log(`检查角色: ${roles.length} 个`);
    console.log(`总页面: ${totalPages} 个`);
    console.log(`成功: ${totalSuccessPages} 个`);
    console.log(`有错误: ${totalErrorPages} 个`);
    console.log(`总错误数: ${totalErrorCount} 个`);
    console.log(`总警告数: ${totalWarningCount} 个`);
    console.log(`健康率: ${summaryReport.summary.healthRate}`);
    console.log(`总耗时: ${formatDuration(totalDuration)}`);
    console.log('='.repeat(80));
    console.log(`\n✅ JSON报告: ${reportPath}`);
    console.log(`✅ Markdown报告: ${mdReportPath}`);

    // 分角色打印详细结果
    console.log('\n' + '='.repeat(80));
    console.log('📊 分角色详细结果');
    console.log('='.repeat(80));

    for (const report of allReports) {
      console.log(`\n${report.role}:`);
      console.log(`  总页面: ${report.totalPages}`);
      console.log(`  成功: ${report.successPages}`);
      console.log(`  有错误: ${report.errorPages}`);
      console.log(`  总错误数: ${report.totalErrors}`);
      console.log(`  耗时: ${formatDuration(report.duration)}`);

      // 列出有错误的页面
      const errorPagesList = report.pages.filter(p => p.errors > 0 || p.status !== 'success');
      if (errorPagesList.length > 0) {
        console.log(`  有错误的页面:`);
        errorPagesList.forEach(p => {
          console.log(`    - ${p.name} (${p.path}): ${p.errors} 个错误`);
        });
      }
    }

    return totalErrorCount === 0 ? 0 : 1;

  } catch (error) {
    console.error('\n❌ 检查过程中发生错误:');
    console.error(error);
    return 1;

  } finally {
    // 关闭浏览器
    console.log('\n🔚 关闭浏览器...');
    await browserManager.close();
    console.log('✅ 浏览器已关闭\n');
  }
}

// ============= 生成 Markdown 报告 =============

function generateMarkdownReport(summaryReport: any): string {
  let md = `# 侧边栏页面控制台错误检查报告\n\n`;
  md += `**检查时间**: ${new Date(summaryReport.timestamp).toLocaleString('zh-CN')}\n\n`;
  md += `**总耗时**: ${summaryReport.totalDurationFormatted}\n\n`;

  md += `## 📊 总体统计\n\n`;
  md += `| 指标 | 数值 |\n`;
  md += `|------|------|\n`;
  md += `| 检查角色 | ${summaryReport.summary.totalRoles} 个 |\n`;
  md += `| 总页面数 | ${summaryReport.summary.totalPages} 个 |\n`;
  md += `| 成功页面 | ${summaryReport.summary.successPages} 个 |\n`;
  md += `| 有错误页面 | ${summaryReport.summary.errorPages} 个 |\n`;
  md += `| 总错误数 | ${summaryReport.summary.totalErrors} 个 |\n`;
  md += `| 总警告数 | ${summaryReport.summary.totalWarnings} 个 |\n`;
  md += `| 健康率 | ${summaryReport.summary.healthRate} |\n\n`;

  md += `## 🎭 分角色统计\n\n`;

  for (const roleReport of summaryReport.roles) {
    md += `### ${roleReport.role}\n\n`;
    md += `- **用户名**: ${roleReport.username}\n`;
    md += `- **总页面**: ${roleReport.totalPages} 个\n`;
    md += `- **成功**: ${roleReport.successPages} 个\n`;
    md += `- **有错误**: ${roleReport.errorPages} 个\n`;
    md += `- **总错误数**: ${roleReport.totalErrors} 个\n`;
    md += `- **总警告数**: ${roleReport.totalWarnings} 个\n`;
    md += `- **耗时**: ${formatDuration(roleReport.duration)}\n\n`;

    // 分类别统计
    const categories = [...new Set(roleReport.pages.map((p: any) => p.category))];

    md += `#### 分类别检查结果\n\n`;
    md += `| 类别 | 页面名称 | 路径 | 状态 | 错误数 | 警告数 |\n`;
    md += `|------|----------|------|------|--------|--------|\n`;

    for (const category of categories) {
      const categoryPages = roleReport.pages.filter((p: any) => p.category === category);
      for (const page of categoryPages) {
        const statusEmoji = page.status === 'success' && page.errors === 0 ? '✅' :
                          page.status === 'timeout' ? '⏱️' : '❌';
        md += `| ${category} | ${page.name} | \`${page.path}\` | ${statusEmoji} | ${page.errors} | ${page.warnings} |\n`;
      }
    }
    md += `\n`;

    // 错误详情
    const errorPages = roleReport.pages.filter((p: any) => p.errors > 0);
    if (errorPages.length > 0) {
      md += `#### ❌ 错误详情\n\n`;
      for (const page of errorPages) {
        md += `##### ${page.name} (\`${page.path}\`)\n\n`;
        md += `- **错误数**: ${page.errors}\n`;
        md += `- **截图**: ${page.screenshot || '无'}\n\n`;

        if (page.errorDetails && page.errorDetails.length > 0) {
          md += `**错误信息**:\n\n`;
          md += '```\n';
          for (const error of page.errorDetails) {
            md += `${error.text}\n`;
          }
          md += '```\n\n';
        }
      }
    }
  }

  return md;
}

// ============= 执行检查 =============

checkAllSidebarPages()
  .then(exitCode => {
    console.log(`\n脚本执行完成，退出码: ${exitCode}`);
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('\n脚本执行失败:', error);
    process.exit(1);
  });
