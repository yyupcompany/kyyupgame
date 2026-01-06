#!/usr/bin/env node

/**
 * 简化版DOM交互测试器
 * 专门测试DOM元素交互问题，不依赖登录流程
 */

const { chromium } = require('playwright');

console.log('🚀 启动简化版DOM交互测试器...');

class SimplifiedDOMTester {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.testResults = {
      totalElements: 0,
      interactiveElements: 0,
      failedElements: 0,
      errors: []
    };
  }

  async init() {
    console.log('🔧 初始化浏览器...');
    this.browser = await chromium.launch({
      headless: true,
      devtools: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection'
      ]
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    this.page = await this.context.newPage();

    // 设置页面错误监控
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🌐 [控制台错误] ${msg.text()}`);
        this.testResults.errors.push({
          type: 'console',
          message: msg.text(),
          location: msg.location()
        });
      }
    });

    this.page.on('pageerror', error => {
      console.log(`📄 [页面错误] ${error.message}`);
      this.testResults.errors.push({
        type: 'page',
        message: error.message,
        stack: error.stack
      });
    });

    console.log('✅ 浏览器初始化成功');
  }

  async testPageBasic(url, pageTitle) {
    console.log(`\n🔍 测试页面: ${pageTitle}`);
    console.log(`📍 URL: ${url}`);

    try {
      // 访问页面
      const response = await this.page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 10000
      });

      if (!response || response.status() >= 400) {
        console.log(`❌ 页面加载失败: ${response?.status()}`);
        return false;
      }

      console.log(`✅ 页面加载成功，状态: ${response.status()}`);

      // 等待页面稳定
      await this.page.waitForTimeout(2000);

      // 基本DOM测试
      const domTest = await this.page.evaluate(() => {
        const results = {
          totalElements: document.querySelectorAll('*').length,
          interactiveElements: 0,
          visibleElements: 0,
          buttons: 0,
          links: 0,
          inputs: 0,
          detachedElements: 0,
          errors: []
        };

        try {
          // 检查各种交互元素
          const interactiveSelectors = [
            'button', 'a[href]', 'input', 'select', 'textarea',
            '[role="button"]', '[role="link"]', '[onclick]',
            '.el-button', '.el-link', '.el-input',
            '.btn', '.clickable', '[tabindex]'
          ];

          interactiveSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              results.interactiveElements++;

              // 检查元素是否可见
              const rect = el.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                results.visibleElements++;
              }

              // 检查特定类型
              if (el.tagName === 'BUTTON') results.buttons++;
              if (el.tagName === 'A' && el.href) results.links++;
              if (el.tagName === 'INPUT') results.inputs++;

              // 检查是否脱离DOM
              if (!document.contains(el)) {
                results.detachedElements++;
              }
            });
          });

          // 检查Vue组件状态
          if (window.Vue || window.__VUE__) {
            const vueApps = document.querySelectorAll('[data-v-app], [data-v-]');
            results.vueApps = vueApps.length;
          }

        } catch (error) {
          results.errors.push(`DOM检查错误: ${error.message}`);
        }

        return results;
      });

      console.log(`📊 DOM统计:`);
      console.log(`  - 总元素数: ${domTest.totalElements}`);
      console.log(`  - 交互元素: ${domTest.interactiveElements}`);
      console.log(`  - 可见元素: ${domTest.visibleElements}`);
      console.log(`  - 按钮: ${domTest.buttons}`);
      console.log(`  - 链接: ${domTest.links}`);
      console.log(`  - 输入框: ${domTest.inputs}`);
      console.log(`  - 脱离DOM元素: ${domTest.detachedElements}`);

      if (domTest.errors.length > 0) {
        console.log(`  ⚠️ DOM错误: ${domTest.errors.join(', ')}`);
      }

      // 更新测试结果
      this.testResults.totalElements += domTest.interactiveElements;
      this.testResults.failedElements += domTest.detachedElements;

      // 尝试简单的交互测试
      await this.testBasicInteractions();

      return {
        success: true,
        stats: domTest
      };

    } catch (error) {
      console.log(`❌ 页面测试失败: ${error.message}`);
      this.testResults.errors.push({
        type: 'navigation',
        message: error.message,
        url: url
      });
      return false;
    }
  }

  async testBasicInteractions() {
    console.log('🖱️ 测试基本交互...');

    try {
      // 测试点击按钮
      const buttons = await this.page.$$('button, .el-button, [role="button"]');
      console.log(`  🔘 找到 ${buttons.length} 个按钮`);

      if (buttons.length > 0) {
        // 测试前3个按钮
        const testButtons = buttons.slice(0, 3);
        for (let i = 0; i < testButtons.length; i++) {
          try {
            const button = testButtons[i];
            const isVisible = await button.isVisible();
            const isEnabled = await button.isEnabled();

            console.log(`    按钮 ${i + 1}: 可见=${isVisible}, 可用=${isEnabled}`);

            if (isVisible && isEnabled) {
              // 尝试悬停
              await button.hover();
              await this.page.waitForTimeout(100);

              // 如果是安全按钮，尝试点击
              const text = await button.textContent();
              if (text && !text.includes('删除') && !text.includes('移除')) {
                console.log(`    ✅ 按钮 "${text.trim()}" 交互正常`);
              }
            }
          } catch (buttonError) {
            console.log(`    ❌ 按钮 ${i + 1} 测试失败: ${buttonError.message}`);
          }
        }
      }

      // 测试链接
      const links = await this.page.$$('a[href], .el-link, [role="link"]');
      console.log(`  🔗 找到 ${links.length} 个链接`);

      if (links.length > 0) {
        const testLinks = links.slice(0, 3);
        for (let i = 0; i < testLinks.length; i++) {
          try {
            const link = testLinks[i];
            const isVisible = await link.isVisible();
            const href = await link.getAttribute('href');

            console.log(`    链接 ${i + 1}: 可见=${isVisible}, href=${href || '无'}`);

            if (isVisible && href && !href.startsWith('javascript:')) {
              await link.hover();
              await this.page.waitForTimeout(100);
              console.log(`    ✅ 链接交互正常`);
            }
          } catch (linkError) {
            console.log(`    ❌ 链接 ${i + 1} 测试失败: ${linkError.message}`);
          }
        }
      }

    } catch (error) {
      console.log(`❌ 交互测试失败: ${error.message}`);
    }
  }

  async cleanup() {
    console.log('🧹 清理资源...');
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('✅ 清理完成');
  }

  printSummary() {
    console.log('\n📋 测试总结:');
    console.log(`  - 总交互元素: ${this.testResults.totalElements}`);
    console.log(`  - 失败元素: ${this.testResults.failedElements}`);
    console.log(`  - 成功率: ${((this.testResults.totalElements - this.testResults.failedElements) / this.testResults.totalElements * 100).toFixed(1)}%`);
    console.log(`  - 错误数量: ${this.testResults.errors.length}`);

    if (this.testResults.errors.length > 0) {
      console.log('\n🚨 错误详情:');
      this.testResults.errors.slice(0, 5).forEach((error, index) => {
        console.log(`  ${index + 1}. [${error.type}] ${error.message}`);
      });
      if (this.testResults.errors.length > 5) {
        console.log(`  ... 还有 ${this.testResults.errors.length - 5} 个错误`);
      }
    }
  }
}

async function main() {
  const tester = new SimplifiedDOMTester();

  try {
    await tester.init();

    // 测试基础页面（不需要登录）
    const testPages = [
      { url: 'http://localhost:5173/login', title: '登录页面' },
      { url: 'http://localhost:5173/', title: '首页' },
    ];

    console.log('\n🎯 开始DOM交互测试...');

    for (const pageConfig of testPages) {
      await tester.testPageBasic(pageConfig.url, pageConfig.title);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 页面间隔
    }

    tester.printSummary();

  } catch (error) {
    console.error('❌ 测试过程出错:', error.message);
  } finally {
    await tester.cleanup();
  }
}

// 运行测试
main().catch(console.error);