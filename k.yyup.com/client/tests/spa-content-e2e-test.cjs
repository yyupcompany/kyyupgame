/**
 * SPA页面内容E2E测试
 * 正确检查SPA应用中的页面内容，而不是HTTP状态码
 * 解决SPA应用中所有路由都返回200状态码的问题
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class SPAContentE2ETest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://k.yyup.cc';
    this.testResults = [];
    this.sidebarRoutes = [];
  }

  async init() {
    console.log('🚀 启动SPA内容E2E测试...');
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // 设置页面超时
    this.page.setDefaultTimeout(30000);
    
    // 监听控制台错误
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔴 Console Error:', msg.text());
      }
    });
  }

  async login() {
    console.log('🔑 执行登录...');
    
    try {
      await this.page.goto(`${this.baseUrl}/login`, { waitUntil: 'networkidle2' });
      
      // 等待登录表单加载
      await this.page.waitForSelector('input[type="text"], input[type="email"], input[placeholder*="用户名"], input[placeholder*="账号"]', { timeout: 10000 });
      
      // 查找用户名和密码输入框
      const usernameSelector = await this.page.evaluate(() => {
        const inputs = document.querySelectorAll('input');
        for (let input of inputs) {
          if (input.type === 'text' || input.type === 'email' || 
              input.placeholder.includes('用户名') || 
              input.placeholder.includes('账号')) {
            return input.getAttribute('data-testid') || input.name || input.id || 'input[type="text"]';
          }
        }
        return null;
      });
      
      const passwordSelector = await this.page.evaluate(() => {
        const inputs = document.querySelectorAll('input[type="password"]');
        return inputs[0] ? (inputs[0].getAttribute('data-testid') || inputs[0].name || inputs[0].id || 'input[type="password"]') : null;
      });
      
      if (usernameSelector && passwordSelector) {
        await this.page.type(usernameSelector, 'admin');
        await this.page.type(passwordSelector, 'admin123');
        
        // 查找登录按钮
        const loginButton = await this.page.evaluate(() => {
          const buttons = document.querySelectorAll('button');
          for (let button of buttons) {
            if (button.textContent.includes('登录') || button.textContent.includes('Login')) {
              return button.getAttribute('data-testid') || button.className || 'button';
            }
          }
          return null;
        });
        
        if (loginButton) {
          await this.page.click(loginButton);
          await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
        }
      }
      
      console.log('✅ 登录成功');
      return true;
    } catch (error) {
      console.log('❌ 登录失败:', error.message);
      return false;
    }
  }

  async extractSidebarRoutes() {
    console.log('📋 提取侧边栏路由...');
    
    try {
      // 等待侧边栏加载
      await this.page.waitForSelector('.el-menu, .sidebar, nav', { timeout: 10000 });
      
      // 提取侧边栏中的所有链接
      const routes = await this.page.evaluate(() => {
        const links = [];
        const anchors = document.querySelectorAll('a[href], .el-menu-item, .menu-item');
        
        anchors.forEach(anchor => {
          let href = anchor.getAttribute('href') || anchor.getAttribute('data-route');
          if (href && href.startsWith('/')) {
            const text = anchor.textContent?.trim() || anchor.getAttribute('title') || '';
            if (text && !text.includes('登出') && !text.includes('退出')) {
              links.push({
                route: href,
                text: text,
                element: anchor.tagName
              });
            }
          }
        });
        
        return links;
      });
      
      this.sidebarRoutes = routes.filter(route => 
        route.route !== '/login' && 
        route.route !== '/logout' && 
        route.route !== '/' &&
        !route.route.includes('#')
      );
      
      console.log(`📊 发现 ${this.sidebarRoutes.length} 个侧边栏路由`);
      return this.sidebarRoutes;
    } catch (error) {
      console.log('❌ 提取侧边栏路由失败:', error.message);
      return [];
    }
  }

  async testPageContent(route) {
    console.log(`🔍 测试路由: ${route.route}`);
    
    try {
      // 导航到页面
      await this.page.goto(`${this.baseUrl}${route.route}`, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // 等待Vue应用加载完成
      await this.page.waitForTimeout(2000);
      
      // 检查页面内容
      const pageAnalysis = await this.page.evaluate((routeInfo) => {
        const analysis = {
          hasVueApp: false,
          has404Content: false,
          hasErrorContent: false,
          hasValidContent: false,
          pageTitle: document.title,
          bodyContent: '',
          errorMessages: []
        };
        
        // 检查是否有Vue应用
        if (document.querySelector('#app, [data-v-]') || window.Vue) {
          analysis.hasVueApp = true;
        }
        
        // 检查是否有404相关内容
        const bodyText = document.body.textContent.toLowerCase();
        if (bodyText.includes('404') || 
            bodyText.includes('页面不存在') || 
            bodyText.includes('page not found') ||
            bodyText.includes('找不到页面')) {
          analysis.has404Content = true;
        }
        
        // 检查是否有错误内容
        if (bodyText.includes('error') || 
            bodyText.includes('错误') || 
            bodyText.includes('出错了') ||
            bodyText.includes('加载失败')) {
          analysis.hasErrorContent = true;
        }
        
        // 检查是否有有效内容
        const contentElements = document.querySelectorAll('.el-table, .el-form, .el-card, .content, .main-content, .page-content');
        if (contentElements.length > 0) {
          analysis.hasValidContent = true;
        }
        
        // 获取页面主要内容
        const mainContent = document.querySelector('.main-content, .page-content, .content, main');
        if (mainContent) {
          analysis.bodyContent = mainContent.textContent.substring(0, 200) + '...';
        } else {
          analysis.bodyContent = document.body.textContent.substring(0, 200) + '...';
        }
        
        // 检查控制台错误
        if (window.console && window.console.errors) {
          analysis.errorMessages = window.console.errors;
        }
        
        return analysis;
      }, route);
      
      // 判断页面状态
      let status = 'UNKNOWN';
      let message = '';
      
      if (pageAnalysis.has404Content) {
        status = 'FAILED';
        message = '页面显示404错误';
      } else if (pageAnalysis.hasErrorContent) {
        status = 'FAILED';
        message = '页面显示错误内容';
      } else if (!pageAnalysis.hasVueApp) {
        status = 'FAILED';
        message = 'Vue应用未加载';
      } else if (pageAnalysis.hasValidContent) {
        status = 'SUCCESS';
        message = '页面内容正常';
      } else {
        status = 'WARNING';
        message = '页面加载但内容可能为空';
      }
      
      const result = {
        route: route.route,
        routeText: route.text,
        status: status,
        message: message,
        pageTitle: pageAnalysis.pageTitle,
        hasVueApp: pageAnalysis.hasVueApp,
        has404Content: pageAnalysis.has404Content,
        hasErrorContent: pageAnalysis.hasErrorContent,
        hasValidContent: pageAnalysis.hasValidContent,
        bodyContent: pageAnalysis.bodyContent,
        timestamp: new Date().toISOString()
      };
      
      this.testResults.push(result);
      
      console.log(`${status === 'SUCCESS' ? '✅' : status === 'WARNING' ? '⚠️' : '❌'} ${route.route}: ${message}`);
      
      return result;
      
    } catch (error) {
      const result = {
        route: route.route,
        routeText: route.text,
        status: 'ERROR',
        message: `测试失败: ${error.message}`,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      this.testResults.push(result);
      console.log(`❌ ${route.route}: 测试失败 - ${error.message}`);
      
      return result;
    }
  }

  async runAllTests() {
    console.log('🧪 开始运行所有测试...');
    
    // 登录
    const loginSuccess = await this.login();
    if (!loginSuccess) {
      console.log('❌ 登录失败，无法继续测试');
      return;
    }
    
    // 提取侧边栏路由
    const routes = await this.extractSidebarRoutes();
    if (routes.length === 0) {
      console.log('❌ 未找到侧边栏路由');
      return;
    }
    
    // 测试每个路由
    for (const route of routes) {
      await this.testPageContent(route);
      await this.page.waitForTimeout(1000); // 避免请求过快
    }
    
    // 生成测试报告
    await this.generateReport();
  }

  async generateReport() {
    console.log('📊 生成测试报告...');
    
    const summary = {
      totalTests: this.testResults.length,
      successCount: this.testResults.filter(r => r.status === 'SUCCESS').length,
      warningCount: this.testResults.filter(r => r.status === 'WARNING').length,
      failedCount: this.testResults.filter(r => r.status === 'FAILED').length,
      errorCount: this.testResults.filter(r => r.status === 'ERROR').length,
      successRate: 0,
      timestamp: new Date().toISOString()
    };
    
    if (summary.totalTests > 0) {
      summary.successRate = ((summary.successCount / summary.totalTests) * 100).toFixed(2);
    }
    
    // 控制台输出
    console.log('\\n📋 测试结果汇总:');
    console.log('================================================================================');
    console.log(`📊 总路由数: ${summary.totalTests}`);
    console.log(`✅ 成功: ${summary.successCount}`);
    console.log(`⚠️ 警告: ${summary.warningCount}`);
    console.log(`❌ 失败: ${summary.failedCount}`);
    console.log(`🔴 错误: ${summary.errorCount}`);
    console.log(`📈 成功率: ${summary.successRate}%`);
    
    // 详细结果
    console.log('\\n📝 详细结果:');
    console.log('================================================================================');
    
    this.testResults.forEach((result, index) => {
      const icon = result.status === 'SUCCESS' ? '✅' : 
                   result.status === 'WARNING' ? '⚠️' : 
                   result.status === 'FAILED' ? '❌' : '🔴';
      
      console.log(`${index + 1}. ${icon} ${result.route}`);
      console.log(`   状态: ${result.status}`);
      console.log(`   消息: ${result.message}`);
      console.log(`   页面标题: ${result.pageTitle || 'N/A'}`);
      if (result.bodyContent) {
        console.log(`   页面内容: ${result.bodyContent}`);
      }
      console.log('');
    });
    
    // 生成JSON报告
    const reportData = {
      summary,
      results: this.testResults,
      metadata: {
        testType: 'SPA Content E2E Test',
        baseUrl: this.baseUrl,
        generatedAt: new Date().toISOString(),
        description: '检查SPA应用中的页面内容，而不是HTTP状态码'
      }
    };
    
    const reportPath = path.join(__dirname, 'spa-content-e2e-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    
    console.log(`📄 详细报告已保存到: ${reportPath}`);
    
    // 问题分析
    console.log('\\n🔍 问题分析:');
    console.log('================================================================================');
    
    const failedRoutes = this.testResults.filter(r => r.status === 'FAILED');
    if (failedRoutes.length > 0) {
      console.log(`❌ 失败路由 (${failedRoutes.length}个):`);
      failedRoutes.forEach(route => {
        console.log(`  - ${route.route}: ${route.message}`);
      });
    }
    
    const errorRoutes = this.testResults.filter(r => r.status === 'ERROR');
    if (errorRoutes.length > 0) {
      console.log(`🔴 错误路由 (${errorRoutes.length}个):`);
      errorRoutes.forEach(route => {
        console.log(`  - ${route.route}: ${route.message}`);
      });
    }
    
    console.log('\\n💡 建议:');
    console.log('================================================================================');
    console.log('1. 检查失败的路由是否在router配置中存在对应的路由定义');
    console.log('2. 确认组件文件是否存在且可正确导入');
    console.log('3. 检查路由守卫是否正确配置权限');
    console.log('4. 验证Vue应用是否正确初始化');
    console.log('5. 检查API接口是否正常响应');
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// 执行测试
async function main() {
  const tester = new SPAContentE2ETest();
  
  try {
    await tester.init();
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ 测试执行失败:', error);
  } finally {
    await tester.cleanup();
  }
}

// 检查是否直接运行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = SPAContentE2ETest;