/**
 * 简化的AI助手测试脚本
 * 直接访问 http://localhost:5173/aiassistant 页面
 * 检查前后端错误和网络请求数量
 */

const puppeteer = require('puppeteer');

const CONFIG = {
  loginUrl: 'http://localhost:5173/login',
  aiAssistantUrl: 'http://localhost:5173/aiassistant',
  backendUrl: 'http://localhost:3000',
  timeout: 30000,
  screenshotDir: './test-screenshots-simple',
  reportFile: './ai-assistant-simple-test-report.json',
  testDuration: 60000, // 测试60秒
  // 测试用户凭据
  testUser: {
    username: 'admin',
    password: 'admin123'
  }
};

// 创建截图目录
const fs = require('fs');
if (!fs.existsSync(CONFIG.screenshotDir)) {
  fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
}

class SimpleAITester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.networkRequests = [];
    this.consoleMessages = [];
    this.errors = [];
  }

  async init() {
    console.log('🚀 初始化浏览器环境');

    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ]
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1366, height: 768 });

    // 监听网络请求
    this.page.on('request', (request) => {
      this.networkRequests.push({
        type: 'request',
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      });
    });

    this.page.on('response', (response) => {
      this.networkRequests.push({
        type: 'response',
        url: response.url(),
        status: response.status(),
        timestamp: new Date().toISOString()
      });

      if (response.status() >= 400) {
        this.errors.push({
          type: 'http_error',
          status: response.status(),
          url: response.url(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // 监听控制台消息
    this.page.on('console', (msg) => {
      const logEntry = {
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      };

      this.consoleMessages.push(logEntry);

      if (msg.type() === 'error') {
        this.errors.push({
          type: 'console_error',
          message: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // 监听页面错误
    this.page.on('error', (error) => {
      this.errors.push({
        type: 'page_error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });
  }

  // 登录系统
  async login() {
    console.log('🔐 开始登录系统');

    try {
      // 访问登录页面
      console.log(`📱 访问登录页面: ${CONFIG.loginUrl}`);
      await this.page.goto(CONFIG.loginUrl, {
        waitUntil: 'networkidle2',
        timeout: CONFIG.timeout
      });

      // 等待页面加载和动画完成
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 截图登录页面
      await this.takeScreenshot('01-login-page');

      // 查找登录表单 - 使用更精确的选择器
      const usernameInput = await this.page.waitForSelector('input[placeholder="请输入用户名"]', {
        timeout: 10000
      });

      const passwordInput = await this.page.waitForSelector('input[placeholder="请输入密码"]', {
        timeout: 10000
      });

      const loginButton = await this.page.waitForSelector('button[data-testid="login-button"], button.login-btn', {
        timeout: 10000
      });

      // 填写登录信息
      console.log('📝 填写登录信息');
      await usernameInput.type(CONFIG.testUser.username);
      await passwordInput.type(CONFIG.testUser.password);

      // 截图填写后的表单
      await this.takeScreenshot('02-login-form-filled');

      // 点击登录按钮
      console.log('🔘 点击登录按钮');
      await loginButton.click();

      // 等待一段时间让登录请求处理
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 检查是否登录成功 - 尝试多个可能的URL
      const possibleUrls = ['/dashboard', '/aiassistant', '/centers/business'];
      let loginSuccess = false;

      for (const url of possibleUrls) {
        try {
          await this.page.goto(`http://localhost:5173${url}`, {
            waitUntil: 'networkidle2',
            timeout: 5000
          });

          // 检查是否成功访问（不是登录页面）
          const currentUrl = this.page.url();
          if (!currentUrl.includes('/login')) {
            loginSuccess = true;
            console.log(`✅ 登录成功，跳转到: ${currentUrl}`);
            break;
          }
        } catch (error) {
          // 继续尝试下一个URL
          continue;
        }
      }

      if (!loginSuccess) {
        throw new Error('登录失败：无法访问受保护的页面');
      }

      // 截图登录成功后页面
      await this.takeScreenshot('03-login-success');

      console.log('✅ 登录成功');
      return true;

    } catch (error) {
      console.error('❌ 登录失败:', error);
      await this.takeScreenshot('04-login-failed');
      return false;
    }
  }

  async testAIAssistant() {
    console.log('🔍 开始测试AI助手页面');

    try {
      // 访问AI助手页面
      console.log(`📱 访问AI助手页面: ${CONFIG.aiAssistantUrl}`);
      await this.page.goto(CONFIG.aiAssistantUrl, {
        waitUntil: 'networkidle2',
        timeout: CONFIG.timeout
      });

      // 等待页面加载
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 截图初始状态
      await this.takeScreenshot('04-ai-assistant-loaded');

      console.log('⏱️ 开始监控网络请求和错误...');

      // 监控指定时间
      const startTime = Date.now();
      const initialRequestCount = this.networkRequests.length;
      const initialErrorCount = this.errors.length;

      // 等待测试时间
      await new Promise(resolve => setTimeout(resolve, CONFIG.testDuration));

      const endTime = Date.now();
      const duration = endTime - startTime;
      const finalRequestCount = this.networkRequests.length;
      const finalErrorCount = this.errors.length;

      // 截图最终状态
      await this.takeScreenshot('02-ai-assistant-final');

      // 生成报告
      const report = {
        summary: {
          testDuration: duration,
          totalNetworkRequests: finalRequestCount,
          requestsDuringTest: finalRequestCount - initialRequestCount,
          totalErrors: finalErrorCount,
          newErrorsDuringTest: finalErrorCount - initialErrorCount,
          requestsPerSecond: ((finalRequestCount - initialRequestCount) / (duration / 1000)).toFixed(2),
          timestamp: new Date().toISOString()
        },
        networkRequests: this.networkRequests.slice(-50), // 最后50个请求
        errors: this.errors,
        consoleMessages: this.consoleMessages.filter(msg => msg.type === 'error'),
        url: CONFIG.frontendUrl
      };

      // 保存报告
      fs.writeFileSync(CONFIG.reportFile, JSON.stringify(report, null, 2));

      // 输出关键结果
      console.log('\n=== AI助手页面测试结果 ===');
      console.log(`⏱️ 测试时长: ${Math.round(duration / 1000)}秒`);
      console.log(`🌐 总网络请求: ${finalRequestCount}`);
      console.log(`📈 测试期间新增请求: ${finalRequestCount - initialRequestCount}`);
      console.log(`⚠️ 总错误数: ${finalErrorCount}`);
      console.log(`📊 请求频率: ${report.summary.requestsPerSecond} 请求/秒`);
      console.log(`📄 详细报告: ${CONFIG.reportFile}`);

      // 分析网络请求
      this.analyzeNetworkRequests(report);

      return report;

    } catch (error) {
      console.error('❌ 测试执行失败:', error);
      throw error;
    }
  }

  analyzeNetworkRequests(report) {
    console.log('\n=== 网络请求分析 ===');

    const urlCounts = {};
    const errorUrls = new Set();

    report.networkRequests.forEach(req => {
      if (req.type === 'request') {
        const url = new URL(req.url);
        const pathname = url.pathname;
        urlCounts[pathname] = (urlCounts[pathname] || 0) + 1;
      } else if (req.status >= 400) {
        errorUrls.add(req.url);
      }
    });

    console.log('📊 请求最多的路径:');
    Object.entries(urlCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([path, count]) => {
        console.log(`  ${path}: ${count}次`);
      });

    if (errorUrls.size > 0) {
      console.log('\n❌ 错误请求:');
      errorUrls.forEach(url => {
        console.log(`  ${url}`);
      });
    }

    // 检查是否有异常高的请求频率
    if (parseFloat(report.summary.requestsPerSecond) > 5) {
      console.log('\n⚠️ 警告: 请求频率异常高，可能存在性能问题');
    }
  }

  async takeScreenshot(name) {
    try {
      const filename = `${name}-${Date.now()}.png`;
      const filepath = `${CONFIG.screenshotDir}/${filename}`;

      await this.page.screenshot({
        path: filepath,
        fullPage: true,
        type: 'png'
      });

      console.log(`📸 截图已保存: ${filename}`);
      return filepath;
    } catch (error) {
      console.error('❌ 截图失败:', error);
      return null;
    }
  }

  async cleanup() {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 浏览器已清理');
  }
}

// 主执行函数
async function main() {
  const tester = new SimpleAITester();

  try {
    await tester.init();

    // 先登录系统
    const loginSuccess = await tester.login();
    if (!loginSuccess) {
      console.error('💥 登录失败，终止测试');
      process.exit(1);
    }

    // 然后测试AI助手
    const report = await tester.testAIAssistant();

    // 根据测试结果设置退出码
    const hasHighRequestRate = parseFloat(report.summary.requestsPerSecond) > 5;
    const hasErrors = report.summary.totalErrors > 0;

    if (hasHighRequestRate || hasErrors) {
      console.log('\n⚠️ 测试发现问题，请检查报告');
      process.exit(1);
    } else {
      console.log('\n✅ 测试通过');
      process.exit(0);
    }

  } catch (error) {
    console.error('💥 测试执行异常:', error);
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 测试执行失败:', error);
    process.exit(1);
  });
}

module.exports = { SimpleAITester };