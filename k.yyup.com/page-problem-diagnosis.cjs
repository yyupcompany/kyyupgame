#!/usr/bin/env node

/**
 * 页面问题诊断工具
 * 深度分析页面不可使用的根本原因
 */

const { chromium } = require('playwright');
const fs = require('fs');

// 需要诊断的页面列表
const PAGES_TO_DIAGNOSE = [
  // 核心页面
  { path: '/dashboard', name: '仪表板', priority: 'P0' },
  { path: '/student-management', name: '学生管理', priority: 'P0' },
  { path: '/teacher-management', name: '教师管理', priority: 'P0' },
  { path: '/activity-management', name: '活动管理', priority: 'P0' },
  { path: '/activity/create', name: '活动创建', priority: 'P0' },
  { path: '/ai-assistant', name: 'AI助手', priority: 'P0' },

  // 业务页面
  { path: '/class-management', name: '班级管理', priority: 'P1' },
  { path: '/student-statistics', name: '学生统计', priority: 'P1' },
  { path: '/teacher-statistics', name: '教师统计', priority: 'P1' },

  // 系统页面
  { path: '/system/users', name: '用户管理', priority: 'P2' },
  { path: '/system/settings', name: '系统设置', priority: 'P2' }
];

class PageProblemDiagnosis {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.results = [];
    this.problems = [];
  }

  async init() {
    console.log('🔧 页面问题诊断工具启动');
    console.log('='.repeat(60));

    this.browser = await chromium.launch({
      headless: true,
      devtools: false
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });

    this.page = await this.context.newPage();

    // 监听控制台消息
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`🚨 控制台错误: ${msg.text()}`);
      }
    });

    // 监听页面错误
    this.page.on('pageerror', (error) => {
      console.log(`💥 页面错误: ${error.message}`);
    });
  }

  async performLogin() {
    console.log('\n🔐 执行登录...');

    try {
      await this.page.goto('http://localhost:5173/login', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      await this.page.waitForTimeout(2000);

      // 尝试快捷登录
      const adminButton = await this.page.$('.quick-btn.admin-btn');
      if (adminButton) {
        await adminButton.click();
        await this.page.waitForTimeout(3000);

        const currentUrl = this.page.url();
        if (!currentUrl.includes('/login')) {
          console.log('✅ 登录成功');
          return true;
        }
      }

      throw new Error('登录失败');
    } catch (error) {
      console.error('❌ 登录过程出错:', error.message);
      return false;
    }
  }

  async diagnosePage(pageInfo) {
    console.log(`\n🔍 诊断页面: ${pageInfo.name} (${pageInfo.path})`);

    const diagnosis = {
      page: pageInfo.name,
      path: pageInfo.path,
      priority: pageInfo.priority,
      issues: [],
      networkRequests: [],
      consoleErrors: [],
      domAnalysis: {},
      screenshot: null,
      finalStatus: 'unknown'
    };

    try {
      // 1. 检查页面导航
      const navigationResult = await this.checkPageNavigation(pageInfo.path);
      diagnosis.navigation = navigationResult;

      if (!navigationResult.success) {
        diagnosis.finalStatus = 'navigation_failed';
        diagnosis.issues.push({
          type: 'navigation',
          severity: 'critical',
          message: navigationResult.error
        });
        return diagnosis;
      }

      // 2. 等待页面加载
      await this.page.waitForTimeout(3000);

      // 3. 检查页面内容
      const contentResult = await this.checkPageContent();
      diagnosis.content = contentResult;

      // 4. 检查网络请求
      const networkResult = await this.checkNetworkRequests();
      diagnosis.networkAnalysis = networkResult;

      // 5. 检查控制台错误
      const consoleResult = await this.checkConsoleErrors();
      diagnosis.consoleErrors = consoleResult;

      // 6. DOM结构分析
      const domResult = await this.analyzeDOM();
      diagnosis.domAnalysis = domResult;

      // 7. 截图
      const screenshotName = `diagnosis_${pageInfo.name.replace(/\s+/g, '_')}.png`;
      await this.page.screenshot({
        path: `./diagnosis-screenshots/${screenshotName}`,
        fullPage: true
      });
      diagnosis.screenshot = screenshotName;

      // 8. 综合评估
      diagnosis.finalStatus = this.assessFinalStatus(diagnosis);

    } catch (error) {
      console.error(`❌ 诊断 ${pageInfo.name} 时出错:`, error.message);
      diagnosis.issues.push({
        type: 'diagnosis_error',
        severity: 'critical',
        message: error.message
      });
      diagnosis.finalStatus = 'diagnosis_failed';
    }

    this.results.push(diagnosis);
    return diagnosis;
  }

  async checkPageNavigation(path) {
    try {
      console.log(`  🧭 导航到: ${path}`);

      const startTime = Date.now();
      await this.page.goto(`http://localhost:5173${path}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      const loadTime = Date.now() - startTime;

      const currentUrl = this.page.url();

      // 检查是否正确导航
      if (currentUrl.includes(path) || currentUrl.includes('404') || currentUrl.includes('error')) {
        return {
          success: true,
          loadTime,
          finalUrl: currentUrl,
          is404: currentUrl.includes('404'),
          isError: currentUrl.includes('error')
        };
      }

      return {
        success: true,
        loadTime,
        finalUrl: currentUrl,
        redirected: true
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async checkPageContent() {
    try {
      // 检查页面标题
      const title = await this.page.title();

      // 检查页面主要内容
      const bodyText = await this.page.$eval('body', el => el.innerText);
      const hasContent = bodyText && bodyText.trim().length > 50;

      // 检查是否有错误信息
      const errorSelectors = [
        '.error-message',
        '.error',
        '[data-testid="error"]',
        'h1:has-text("404")',
        'h1:has-text("Error")',
        'h1:has-text("Not Found")'
      ];

      let errorElements = [];
      for (const selector of errorSelectors) {
        try {
          const elements = await this.page.$$(selector);
          errorElements = errorElements.concat(elements);
        } catch (e) {
          // 忽略选择器错误
        }
      }

      // 检查是否有加载状态
      const loadingSelectors = [
        '.loading',
        '.spinner',
        '[data-testid="loading"]'
      ];

      let loadingElements = [];
      for (const selector of loadingSelectors) {
        try {
          const elements = await this.page.$$(selector);
          loadingElements = loadingElements.concat(elements);
        } catch (e) {
          // 忽略选择器错误
        }
      }

      return {
        title,
        hasContent,
        contentLength: bodyText ? bodyText.length : 0,
        errorElements: errorElements.length,
        loadingElements: loadingElements.length,
        contentSample: bodyText ? bodyText.substring(0, 200) : ''
      };

    } catch (error) {
      return {
        error: error.message,
        hasContent: false
      };
    }
  }

  async checkNetworkRequests() {
    try {
      // 评估页面性能
      const metrics = await this.page.metrics();

      // 检查资源加载
      const performance = await this.page.evaluate(() => {
        const entries = performance.getEntriesByType('navigation');
        return entries.length > 0 ? {
          domContentLoaded: entries[0].domContentLoadedEventEnd - entries[0].domContentLoadedEventStart,
          loadComplete: entries[0].loadEventEnd - entries[0].loadEventStart,
          resourceCount: performance.getEntriesByType('resource').length
        } : null;
      });

      return {
        metrics,
        performance,
        estimatedIssues: []
      };

    } catch (error) {
      return {
        error: error.message
      };
    }
  }

  async checkConsoleErrors() {
    // 这个方法在初始化时已经设置了监听器
    // 这里可以收集已记录的错误
    return {
      errors: [], // 实际实现中应该收集控制台错误
      warnings: []
    };
  }

  async analyzeDOM() {
    try {
      const domInfo = await this.page.evaluate(() => {
        // 检查Vue应用是否正确挂载
        const vueApp = document.querySelector('#app');
        const hasVueApp = !!vueApp;

        // 检查路由视图
        const routerView = document.querySelector('router-view');
        const hasRouterView = !!routerView;

        // 检查主要布局组件
        const layoutElements = {
          mainLayout: document.querySelector('.main-layout'),
          header: document.querySelector('.header'),
          sidebar: document.querySelector('.sidebar'),
          content: document.querySelector('.main-content')
        };

        // 检查是否有实际的业务组件
        const businessComponents = document.querySelectorAll('[class*="management"], [class*="list"], [class*="form"], [class*="card"]');

        // 检查是否是空白页面
        const bodyChildren = document.body.children.length;
        const meaningfulContent = document.body.innerText.trim().length;

        return {
          hasVueApp,
          hasRouterView,
          layoutElements: Object.fromEntries(
            Object.entries(layoutElements).map(([key, el]) => [key, !!el])
          ),
          businessComponentCount: businessComponents.length,
          bodyChildren,
          meaningfulContent,
          isBlankPage: meaningfulContent < 100 && bodyChildren < 10
        };
      });

      return domInfo;

    } catch (error) {
      return {
        error: error.message
      };
    }
  }

  assessFinalStatus(diagnosis) {
    // 如果导航失败
    if (diagnosis.navigation && !diagnosis.navigation.success) {
      return 'navigation_failed';
    }

    // 如果是404页面
    if (diagnosis.navigation && diagnosis.navigation.is404) {
      return 'not_found';
    }

    // 如果是错误页面
    if (diagnosis.navigation && diagnosis.navigation.isError) {
      return 'error_page';
    }

    // 如果页面内容为空
    if (diagnosis.content && !diagnosis.content.hasContent) {
      return 'empty_page';
    }

    // 如果DOM分析显示是空白页面
    if (diagnosis.domAnalysis && diagnosis.domAnalysis.isBlankPage) {
      return 'blank_page';
    }

    // 如果没有业务组件
    if (diagnosis.domAnalysis && diagnosis.domAnalysis.businessComponentCount === 0) {
      return 'no_business_components';
    }

    // 如果有错误元素
    if (diagnosis.content && diagnosis.content.errorElements > 0) {
      return 'has_errors';
    }

    // 正常页面
    return 'working';
  }

  async generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 页面问题诊断报告');
    console.log('='.repeat(60));

    const summary = {
      total: this.results.length,
      working: 0,
      navigation_failed: 0,
      not_found: 0,
      blank_page: 0,
      empty_page: 0,
      no_business_components: 0,
      has_errors: 0,
      diagnosis_failed: 0
    };

    this.results.forEach(result => {
      summary[result.finalStatus]++;
    });

    console.log('\n📈 状态统计:');
    console.log(`✅ 正常工作: ${summary.working}`);
    console.log(`🚫 导航失败: ${summary.navigation_failed}`);
    console.log(`❓ 页面未找到: ${summary.not_found}`);
    console.log(`📄 空白页面: ${summary.blank_page}`);
    console.log(`🗑️  内容为空: ${summary.empty_page}`);
    console.log(`🧩 无业务组件: ${summary.no_business_components}`);
    console.log(`⚠️  存在错误: ${summary.has_errors}`);
    console.log(`💥 诊断失败: ${summary.diagnosis_failed}`);

    console.log('\n🔍 详细问题分析:');
    this.results.forEach(result => {
      const status = this.getStatusIcon(result.finalStatus);
      console.log(`${status} ${result.page} (${result.path}) - ${result.finalStatus}`);

      if (result.issues.length > 0) {
        result.issues.forEach(issue => {
          console.log(`    🔸 ${issue.message}`);
        });
      }

      if (result.content && !result.content.hasContent) {
        console.log(`    🔸 页面内容为空或过少 (${result.content.contentLength} 字符)`);
      }

      if (result.domAnalysis && result.domAnalysis.isBlankPage) {
        console.log(`    🔸 检测为空白页面 (${result.domAnalysis.bodyChildren} 个子元素)`);
      }

      if (result.domAnalysis && result.domAnalysis.businessComponentCount === 0) {
        console.log(`    🔸 未检测到业务组件`);
      }
    });

    // 生成问题根因分析
    this.analyzeRootCauses();

    // 保存详细报告
    const reportData = {
      timestamp: new Date().toISOString(),
      summary,
      details: this.results,
      rootCauses: this.getRootCauses()
    };

    if (!fs.existsSync('./diagnosis-reports')) {
      fs.mkdirSync('./diagnosis-reports', { recursive: true });
    }

    fs.writeFileSync('./diagnosis-reports/page-problem-diagnosis.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 详细报告已保存: ./diagnosis-reports/page-problem-diagnosis.json');
  }

  getStatusIcon(status) {
    const icons = {
      working: '✅',
      navigation_failed: '🚫',
      not_found: '❓',
      blank_page: '📄',
      empty_page: '🗑️',
      no_business_components: '🧩',
      has_errors: '⚠️',
      diagnosis_failed: '💥'
    };
    return icons[status] || '❓';
  }

  analyzeRootCauses() {
    console.log('\n🎯 根因分析:');

    const rootCauses = this.getRootCauses();

    if (rootCauses.routing.length > 0) {
      console.log(`\n🛣️  路由问题 (${rootCauses.routing.length} 个页面):`);
      rootCauses.routing.forEach(page => {
        console.log(`    - ${page.name}: ${page.issue}`);
      });
    }

    if (rootCauses.component.length > 0) {
      console.log(`\n🧩 组件问题 (${rootCauses.component.length} 个页面):`);
      rootCauses.component.forEach(page => {
        console.log(`    - ${page.name}: ${page.issue}`);
      });
    }

    if (rootCauses.content.length > 0) {
      console.log(`\n📄 内容问题 (${rootCauses.content.length} 个页面):`);
      rootCauses.content.forEach(page => {
        console.log(`    - ${page.name}: ${page.issue}`);
      });
    }
  }

  getRootCauses() {
    const rootCauses = {
      routing: [],
      component: [],
      content: []
    };

    this.results.forEach(result => {
      if (result.finalStatus === 'navigation_failed' || result.finalStatus === 'not_found') {
        rootCauses.routing.push({
          name: result.page,
          path: result.path,
          issue: '路由配置问题或页面未找到'
        });
      }

      if (result.finalStatus === 'no_business_components') {
        rootCauses.component.push({
          name: result.page,
          path: result.path,
          issue: '业务组件未正确渲染或挂载'
        });
      }

      if (result.finalStatus === 'blank_page' || result.finalStatus === 'empty_page') {
        rootCauses.content.push({
          name: result.page,
          path: result.path,
          issue: '页面内容为空，可能是数据加载失败或组件渲染问题'
        });
      }
    });

    return rootCauses;
  }

  async cleanup() {
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.init();

      // 创建截图目录
      if (!fs.existsSync('./diagnosis-screenshots')) {
        fs.mkdirSync('./diagnosis-screenshots', { recursive: true });
      }

      // 执行登录
      const loginSuccess = await this.performLogin();
      if (!loginSuccess) {
        throw new Error('登录失败，无法继续诊断');
      }

      // 诊断每个页面
      for (const pageInfo of PAGES_TO_DIAGNOSE) {
        await this.diagnosePage(pageInfo);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 避免请求过快
      }

      // 生成报告
      await this.generateReport();

    } catch (error) {
      console.error('💥 诊断过程出错:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// 主程序
async function main() {
  const diagnosis = new PageProblemDiagnosis();
  await diagnosis.run();
}

// 检查服务状态
async function checkServices() {
  const http = require('http');

  const frontendCheck = new Promise((resolve) => {
    const req = http.get('http://localhost:5173', (res) => {
      console.log('✅ 前端服务运行正常');
      resolve(true);
    });

    req.on('error', () => {
      console.log('❌ 前端服务未运行');
      resolve(false);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log('⏰ 前端服务响应超时');
      resolve(false);
    });
  });

  const frontendOk = await frontendCheck;
  if (!frontendOk) {
    console.log('\n❌ 前端服务未运行，请先启动:');
    console.log('   cd client && npm run dev');
    process.exit(1);
  }
}

// 运行诊断
main().catch(error => {
  console.error('💥 程序执行失败:', error);
  process.exit(1);
});