/**
 * 侧边栏路径发现器
 * 发现实际可访问的页面路径和对应的组件
 */

const { chromium } = require('playwright');

class SidebarPathFinder {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];

    // 基于实际存在的页面文件路径
    this.knownPaths = [
      // Centers模块页面
      '/centers/index',
      '/centers/enrollment',
      '/centers/personnel',
      '/centers/activities',
      '/centers/task',
      '/centers/marketing',
      '/centers/ai',
      '/centers/system',
      '/centers/customer-pool',
      '/centers/analytics',
      '/centers/inspection',
      '/centers/script',
      '/centers/finance',
      '/centers/marketing/performance',

      // 其他可能的页面
      '/dashboard',
      '/activities',
      '/teacher-management',
      '/student-management',
      '/class-management',
      '/system-settings',
      '/user-management'
    ];
  }

  async init() {
    console.log('🔍 启动侧边栏路径发现器...');

    try {
      this.browser = await chromium.launch({
        headless: true,
        devtools: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      this.context = await this.browser.newContext({
        viewport: { width: 1366, height: 768 }
      });

      this.page = await this.context.newPage();

      // 监听控制台消息
      this.page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log(`⚠️ 控制台错误: ${msg.text()}`);
        }
      });

      console.log('✅ 浏览器初始化成功');
      return true;
    } catch (error) {
      console.error('❌ 浏览器初始化失败:', error.message);
      return false;
    }
  }

  async login() {
    try {
      console.log('🔐 执行管理员登录...');

      await this.page.goto('http://localhost:5173/login', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      await this.page.waitForSelector('input[placeholder*="账号"], input[placeholder*="用户名"], input[type="text"]',
        { timeout: 10000 });

      await this.page.fill('input[placeholder*="账号"], input[placeholder*="用户名"], input[type="text"]', 'admin');
      await this.page.fill('input[placeholder*="密码"], input[type="password"]', '123456');
      await this.page.click('button[type="submit"], .login-btn, .el-button--primary');

      await this.page.waitForURL(/\/(dashboard|centers)?/, { timeout: 15000 });
      await this.page.waitForTimeout(2000);

      console.log('✅ 登录成功');
      return true;
    } catch (error) {
      console.error('❌ 登录失败:', error.message);
      return false;
    }
  }

  async testPath(path) {
    const result = {
      path: path,
      accessible: false,
      hasContent: false,
      title: '',
      error: null,
      elements: {
        buttons: 0,
        forms: 0,
        tables: 0,
        tabs: 0
      }
    };

    try {
      const fullUrl = `http://localhost:5173${path}`;
      console.log(`🔍 测试路径: ${path}`);

      const response = await this.page.goto(fullUrl, {
        waitUntil: 'networkidle',
        timeout: 15000
      });

      if (!response) {
        result.error = '无响应';
        return result;
      }

      const status = response.status();
      if (status === 404) {
        result.error = '404 页面不存在';
        return result;
      }

      if (status >= 400) {
        result.error = `HTTP ${status} 错误`;
        return result;
      }

      result.accessible = true;

      // 检查页面内容
      await this.page.waitForTimeout(2000);

      const pageTitle = await this.page.title();
      result.title = pageTitle;

      // 检查是否是错误页面
      const pageContent = await this.page.textContent('body');
      if (pageContent.includes('404') || pageContent.includes('页面不存在') || pageContent.includes('Page not found')) {
        result.error = '内容显示404错误';
        return result;
      }

      // 检查是否有实际内容
      const contentElements = await this.page.$$('div, section, main, .el-card, .container, .content');
      result.hasContent = contentElements.length > 0;

      // 统计页面元素
      try {
        const buttons = await this.page.$$('button, .btn, .el-button');
        const forms = await this.page.$$('input, select, textarea, .el-input, .el-select');
        const tables = await this.page.$$('table, .el-table, .table');
        const tabs = await this.page.$$('.el-tabs__item, .tab-item, [role="tab"]');

        result.elements = {
          buttons: buttons.length,
          forms: forms.length,
          tables: tables.length,
          tabs: tabs.length
        };
      } catch (error) {
        // 元素统计失败不影响主要结果
      }

      console.log(`  ✅ 可访问: ${result.hasContent ? '有内容' : '空页面'} (${result.elements.buttons}按钮, ${result.elements.forms}表单)`);

    } catch (error) {
      result.error = error.message;
      console.log(`  ❌ 错误: ${result.error}`);
    }

    return result;
  }

  async runPathDiscovery() {
    console.log('🚀 开始路径发现...');

    if (!await this.init()) {
      throw new Error('浏览器初始化失败');
    }

    if (!await this.login()) {
      throw new Error('登录失败');
    }

    const results = {
      total: this.knownPaths.length,
      accessible: 0,
      inaccessible: 0,
      withContent: 0,
      paths: []
    };

    for (const path of this.knownPaths) {
      const result = await this.testPath(path);
      results.paths.push(result);

      if (result.accessible) {
        results.accessible++;
        if (result.hasContent) {
          results.withContent++;
        }
      } else {
        results.inaccessible++;
      }
    }

    this.generateReport(results);
    this.testResults = results;
    return results;
  }

  generateReport(results) {
    console.log('\n' + '='.repeat(70));
    console.log('📊 侧边栏路径发现报告');
    console.log('='.repeat(70));

    console.log(`\n📈 总体统计:`);
    console.log(`   测试路径数: ${results.total}`);
    console.log(`   ✅ 可访问: ${results.accessible}`);
    console.log(`   ❌ 不可访问: ${results.inaccessible}`);
    console.log(`   📄 有内容: ${results.withContent}`);
    console.log(`   成功率: ${((results.accessible / results.total) * 100).toFixed(1)}%`);

    console.log(`\n📋 可访问页面详情:`);
    const accessiblePaths = results.paths.filter(p => p.accessible);
    accessiblePaths.forEach(path => {
      const status = path.hasContent ? '📄' : '🔘';
      const elementInfo = `(${path.elements.buttons}按钮, ${path.elements.forms}表单)`;
      console.log(`   ${status} ${path.path} - ${path.title} ${elementInfo}`);
    });

    console.log(`\n❌ 不可访问页面:`);
    const inaccessiblePaths = results.paths.filter(p => !p.accessible);
    inaccessiblePaths.forEach(path => {
      console.log(`   ❌ ${path.path} - ${path.error}`);
    });

    // 生成测试用路径配置
    console.log(`\n🎯 建议的测试路径配置:`);
    const workingPaths = accessiblePaths.filter(p => p.hasContent);
    const pathConfig = workingPaths.map(p => `'${p.path}'`).join(',\n    ');
    console.log(`const testPaths = [\n    ${pathConfig}\n];`);

    console.log('\n' + '='.repeat(70));
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 浏览器已关闭');
    }
  }
}

// 主执行函数
async function main() {
  const finder = new SidebarPathFinder();

  try {
    const results = await finder.runPathDiscovery();

    // 保存结果到文件
    const fs = require('fs');
    const reportData = {
      timestamp: new Date().toISOString(),
      results: results,
      testPaths: results.paths.filter(p => p.accessible && p.hasContent).map(p => p.path)
    };

    fs.writeFileSync(
      '/home/zhgue/kyyupgame/k.yyup.com/sidebar-path-discovery-report.json',
      JSON.stringify(reportData, null, 2)
    );

    console.log('\n📄 发现报告已保存到: sidebar-path-discovery-report.json');

  } catch (error) {
    console.error('❌ 路径发现失败:', error.message);
    process.exit(1);
  } finally {
    await finder.cleanup();
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}

module.exports = SidebarPathFinder;