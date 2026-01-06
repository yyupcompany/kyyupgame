/**
 * 频率限制安全测试脚本
 * Rate Limit Safe Test Script
 * 
 * 专门设计用于避免API频率限制的测试脚本
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class RateLimitSafeTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://localhost:5173';
    this.authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGVzIjpbeyJpZCI6MSwibmFtZSI6Iua1i-WKnuWRmCIsImNvZGUiOiJhZG1pbiJ9XSwiaWF0IjoxNzM3MDM2MjEzLCJleHAiOjE3MzcxMjI2MTN9.IzHzR2gQZdMnZRQ_zOZLCYNcHJGVkSgJZfvpNZdGgMo';
    
    // 只测试一个页面
    this.testRoutes = ['/dashboard'];
    
    this.apiCallCount = 0;
    this.maxApiCalls = 20; // 限制API调用数量
    this.results = [];
  }

  async init() {
    console.log('🚀 初始化频率限制安全测试...');
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-background-networking',
        '--disable-sync',
        '--disable-translate',
        '--no-first-run'
      ]
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // 设置请求拦截，严格控制API调用
    await this.page.setRequestInterception(true);
    this.page.on('request', (request) => {
      const resourceType = request.resourceType();
      const url = request.url();
      
      // 阻止所有非必要资源
      if (['image', 'font', 'stylesheet', 'media', 'websocket'].includes(resourceType)) {
        request.abort();
        return;
      }
      
      // 严格限制API调用数量
      if (url.includes('/api/')) {
        if (this.apiCallCount >= this.maxApiCalls) {
          console.log(`⚠️ 达到API调用限制 (${this.maxApiCalls})，阻止请求: ${url}`);
          request.abort();
          return;
        }
        
        this.apiCallCount++;
        console.log(`🔗 API调用 (${this.apiCallCount}/${this.maxApiCalls}): ${url}`);
        
        // 为API请求添加延迟
        setTimeout(() => {
          request.continue();
        }, 2000);
      } else {
        request.continue();
      }
    });
    
    // 监听API响应
    this.page.on('response', (response) => {
      const url = response.url();
      const status = response.status();
      
      if (url.includes('/api/')) {
        console.log(`📡 API响应: ${url} - ${status}`);
        
        if (status === 429) {
          console.log('⚠️ 检测到429频率限制响应');
        }
      }
    });
    
    console.log('✅ 初始化完成');
  }

  async testPage(route) {
    console.log(`🔍 测试页面: ${route}`);
    
    const result = {
      route,
      url: `${this.baseUrl}${route}`,
      timestamp: new Date().toISOString(),
      status: 'pending',
      apiCallCount: 0,
      rateLimitErrors: 0,
      errors: []
    };
    
    try {
      // 重置API调用计数
      this.apiCallCount = 0;
      
      // 访问页面
      await this.page.goto(`${this.baseUrl}${route}`, { 
        waitUntil: 'networkidle2',
        timeout: 60000 
      });
      
      // 设置认证token
      await this.page.evaluate((token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userInfo', JSON.stringify({
          id: 121,
          username: 'admin',
          roles: [{ id: 1, name: '测试员', code: 'admin' }]
        }));
      }, this.authToken);
      
      // 刷新页面以应用认证
      await this.page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
      
      // 等待页面完全加载
      console.log('⏳ 等待页面加载完成...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      result.apiCallCount = this.apiCallCount;
      result.status = 'success';
      
      console.log(`✅ 页面测试完成: ${route}`);
      console.log(`📊 API调用数: ${this.apiCallCount}`);
      
    } catch (error) {
      result.status = 'failed';
      result.error = error.message;
      result.errors.push({
        type: 'navigation',
        message: error.message,
        severity: 'high'
      });
      
      console.log(`❌ 页面测试失败: ${route} - ${error.message}`);
    }
    
    return result;
  }

  async runTest() {
    console.log('🚀 开始频率限制安全测试...');
    
    try {
      await this.init();
      
      for (const route of this.testRoutes) {
        const result = await this.testPage(route);
        this.results.push(result);
        
        // 页面间增加长延迟
        if (this.testRoutes.indexOf(route) < this.testRoutes.length - 1) {
          console.log('⏳ 等待15秒后继续下一个页面...');
          await new Promise(resolve => setTimeout(resolve, 15000));
        }
      }
      
      await this.generateReport();
      
      console.log('\n📊 测试摘要:');
      console.log(`- 总页面数: ${this.results.length}`);
      console.log(`- 成功页面: ${this.results.filter(r => r.status === 'success').length}`);
      console.log(`- 失败页面: ${this.results.filter(r => r.status === 'failed').length}`);
      console.log(`- 总API调用: ${this.results.reduce((sum, r) => sum + r.apiCallCount, 0)}`);
      
      return this.results;
      
    } catch (error) {
      console.error('❌ 测试失败:', error);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  async generateReport() {
    const reportDir = '/home/devbox/project/client/tests/reports';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `rate-limit-safe-test-${timestamp}.json`;
    const filepath = path.join(reportDir, filename);

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      testType: 'rate-limit-safe',
      results: this.results,
      summary: {
        totalPages: this.results.length,
        successfulPages: this.results.filter(r => r.status === 'success').length,
        failedPages: this.results.filter(r => r.status === 'failed').length,
        totalApiCalls: this.results.reduce((sum, r) => sum + r.apiCallCount, 0)
      }
    };

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`📊 报告已保存: ${filepath}`);
  }
}

// 运行测试
if (require.main === module) {
  const test = new RateLimitSafeTest();
  
  test.runTest()
    .then(() => {
      console.log('✅ 频率限制安全测试完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 频率限制安全测试失败:', error);
      process.exit(1);
    });
}

module.exports = RateLimitSafeTest;