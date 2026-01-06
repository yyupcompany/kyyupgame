#!/usr/bin/env node

/**
 * 登录页面压力测试
 * 支持快捷登录和管理员登录的并发压力测试
 * 并发级别: 10, 50, 100, 500
 */

const { chromium } = require('playwright');
const { performance } = require('perf_hooks');
const fs = require('fs/promises');
const path = require('path');

class LoginStressTest {
  constructor() {
    this.browser = null;
    this.baseURL = 'http://localhost:5173';
    this.apiURL = 'http://localhost:3000';
    this.concurrencyLevels = [10, 50, 100, 500];
    this.results = [];

    // 测试用户配置
    this.testConfigs = [
      {
        name: '快捷登录-园长',
        username: 'principal',
        password: '123456',
        loginType: 'quick',
        description: '园长快捷登录测试'
      },
      {
        name: '快捷登录-教师',
        username: 'teacher',
        password: '123456',
        loginType: 'quick',
        description: '教师快捷登录测试'
      },
      {
        name: '快捷登录-家长',
        username: 'parent',
        password: '123456',
        loginType: 'quick',
        description: '家长快捷登录测试'
      },
      {
        name: '管理员登录',
        username: 'admin',
        password: '123456',
        loginType: 'manual',
        description: '管理员手动登录测试'
      }
    ];
  }

  async init() {
    console.log('🚀 初始化压力测试环境...');

    // 检查服务是否运行
    try {
      await this.checkServices();
    } catch (error) {
      console.error('❌ 服务检查失败:', error);
      throw error;
    }

    // 启动浏览器
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    console.log('✅ 浏览器已启动');
  }

  async checkServices() {
    // 检查前端服务
    try {
      const frontendResponse = await fetch(`${this.baseURL}`, {
        method: 'GET'
      });
      if (!frontendResponse.ok) {
        throw new Error(`前端服务响应异常: ${frontendResponse.status}`);
      }
      console.log('✅ 前端服务正常');
    } catch (error) {
      throw new Error(`前端服务不可用: ${error}`);
    }

    // 检查后端API服务
    try {
      const apiResponse = await fetch(`${this.apiURL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'test', password: 'test' })
      });
      console.log('✅ 后端API服务正常');
    } catch (error) {
      console.warn('⚠️ 后端API服务可能不可用，但继续测试:', error);
    }
  }

  async performLogin(config, userId) {
    const context = await this.browser.newContext({
      userAgent: `StressTest-${userId}`
    });
    const page = await context.newPage();

    const startTime = performance.now();
    const result = {
      userId,
      success: false,
      loginTime: 0
    };

    try {
      console.log(`🔄 用户 ${userId} 开始 ${config.description}`);

      // 访问登录页面
      await page.goto(`${this.baseURL}/mobile/login`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // 等待登录页面加载
      await page.waitForSelector('.login-container', { timeout: 10000 });

      if (config.loginType === 'quick') {
        // 快捷登录
        const quickButtonSelector = `.quick-btn.${config.username}`;
        await page.waitForSelector(quickButtonSelector, { timeout: 10000 });
        await page.click(quickButtonSelector);
        console.log(`📱 用户 ${userId} 点击了 ${config.description} 按钮`);
      } else {
        // 手动登录
        await page.fill('input[placeholder="请输入用户名"]', config.username);
        await page.fill('input[placeholder="请输入密码"]', config.password);
        await page.click('.login-button');
        console.log(`⌨️ 用户 ${userId} 手动输入凭据`);
      }

      // 等待登录响应
      try {
        await Promise.race([
          page.waitForURL('**/mobile/**', { timeout: 15000 }),
          page.waitForSelector('.message.success', { timeout: 15000 }),
          page.waitForTimeout(15000)
        ]);

        const successMessage = await page.$('.message.success');
        const currentUrl = page.url();

        if (successMessage || (currentUrl.includes('/mobile/') && !currentUrl.includes('/login'))) {
          result.success = true;

          try {
            const localStorage = await page.evaluate(() => {
              return {
                token: localStorage.getItem('kindergarten_token'),
                userInfo: localStorage.getItem('kindergarten_user_info')
              };
            });

            if (localStorage.token) {
              result.token = localStorage.token;
              result.userInfo = localStorage.userInfo ? JSON.parse(localStorage.userInfo) : null;
            }
          } catch (error) {
            console.warn(`⚠️ 用户 ${userId} 获取token失败:`, error);
          }

          console.log(`✅ 用户 ${userId} ${config.description} 成功`);
        } else {
          const errorMessage = await page.$('.message.error');
          if (errorMessage) {
            const errorText = await errorMessage.textContent();
            result.error = errorText || '未知错误';
          } else {
            result.error = '登录超时或未成功跳转';
          }
          console.log(`❌ 用户 ${userId} ${config.description} 失败: ${result.error}`);
        }
      } catch (waitError) {
        result.error = '登录响应超时';
        console.log(`⏰ 用户 ${userId} ${config.description} 超时`);
      }

    } catch (error) {
      result.error = error.message || String(error);
      console.log(`💥 用户 ${userId} ${config.description} 异常: ${result.error}`);
    } finally {
      const endTime = performance.now();
      result.loginTime = Math.round(endTime - startTime);

      await context.close();
    }

    return result;
  }

  async runConcurrencyTest(concurrency) {
    console.log(`\n🎯 开始并发级别 ${concurrency} 的测试...`);

    const startTime = performance.now();
    const results = [];
    const errors = {};

    const tasks = [];
    for (let i = 0; i < concurrency; i++) {
      const configIndex = i % this.testConfigs.length;
      const config = this.testConfigs[configIndex];
      const userId = i + 1;

      tasks.push(this.performLogin(config, userId));
    }

    const allResults = await Promise.all(tasks);
    results.push(...allResults);

    const successfulLogins = results.filter(r => r.success).length;
    const failedLogins = results.length - successfulLogins;
    const responseTimes = results.map(r => r.loginTime);
    const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const minResponseTime = Math.min(...responseTimes);
    const maxResponseTime = Math.max(...responseTimes);

    results.forEach(result => {
      if (!result.success && result.error) {
        errors[result.error] = (errors[result.error] || 0) + 1;
      }
    });

    const endTime = performance.now();
    const totalTime = Math.round(endTime - startTime);

    const testResult = {
      concurrency,
      totalTime,
      successfulLogins,
      failedLogins,
      averageResponseTime: Math.round(averageResponseTime),
      minResponseTime,
      maxResponseTime,
      results,
      errors
    };

    console.log(`✅ 并发 ${concurrency} 测试完成:`);
    console.log(`   总耗时: ${totalTime}ms`);
    console.log(`   成功登录: ${successfulLogins}/${results.length}`);
    console.log(`   平均响应时间: ${Math.round(averageResponseTime)}ms`);
    console.log(`   响应时间范围: ${minResponseTime}ms - ${maxResponseTime}ms`);

    if (Object.keys(errors).length > 0) {
      console.log('   错误统计:');
      Object.entries(errors).forEach(([error, count]) => {
        console.log(`     ${error}: ${count}次`);
      });
    }

    return testResult;
  }

  async runAllTests() {
    console.log('🧪 开始执行所有压力测试...\n');

    for (const concurrency of this.concurrencyLevels) {
      try {
        const result = await this.runConcurrencyTest(concurrency);
        this.results.push(result);

        if (concurrency < this.concurrencyLevels[this.concurrencyLevels.length - 1]) {
          console.log('⏳ 等待 3 秒后继续下一轮测试...\n');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`❌ 并发 ${concurrency} 测试失败:`, error);
      }
    }
  }

  generateReport() {
    const report = [];
    const timestamp = new Date().toLocaleString('zh-CN');

    report.push('# 登录页面压力测试报告');
    report.push(`\n测试时间: ${timestamp}`);
    report.push(`测试环境: ${this.baseURL} (前端) / ${this.apiURL} (后端)`);
    report.push('\n## 测试配置\n');

    this.testConfigs.forEach(config => {
      report.push(`- **${config.name}**: ${config.description}`);
      report.push(`  - 用户名: ${config.username}`);
      report.push(`  - 登录类型: ${config.loginType === 'quick' ? '快捷登录' : '手动登录'}`);
    });

    report.push('\n## 测试结果汇总\n');
    report.push('| 并发数 | 成功登录 | 失败登录 | 成功率 | 平均响应时间 | 最小响应时间 | 最大响应时间 | 总耗时 |');
    report.push('|--------|----------|----------|--------|--------------|--------------|--------------|--------|');

    this.results.forEach(result => {
      const successRate = ((result.successfulLogins / result.concurrency) * 100).toFixed(1);
      report.push(`| ${result.concurrency} | ${result.successfulLogins} | ${result.failedLogins} | ${successRate}% | ${result.averageResponseTime}ms | ${result.minResponseTime}ms | ${result.maxResponseTime}ms | ${result.totalTime}ms |`);
    });

    report.push('\n## 详细分析\n');

    report.push('### 性能分析\n');
    this.results.forEach(result => {
      const successRate = ((result.successfulLogins / result.concurrency) * 100).toFixed(1);
      report.push(`#### 并发 ${result.concurrency}`);
      report.push(`- 成功率: ${successRate}% (${result.successfulLogins}/${result.concurrency})`);
      report.push(`- 平均响应时间: ${result.averageResponseTime}ms`);
      report.push(`- 响应时间范围: ${result.minResponseTime}ms - ${result.maxResponseTime}ms`);
      report.push(`- 吞吐量: ${(result.concurrency / (result.totalTime / 1000)).toFixed(2)} 请求/秒`);

      if (Object.keys(result.errors).length > 0) {
        report.push('- 错误统计:');
        Object.entries(result.errors).forEach(([error, count]) => {
          report.push(`  - ${error}: ${count}次`);
        });
      }
      report.push('');
    });

    report.push('### 压力测试结论\n');
    const maxConcurrency = Math.max(...this.results.map(r => r.concurrency));
    const maxConcurrencyResult = this.results.find(r => r.concurrency === maxConcurrency);

    if (maxConcurrencyResult) {
      const maxSuccessRate = ((maxConcurrencyResult.successfulLogins / maxConcurrency) * 100);

      if (maxSuccessRate >= 95) {
        report.push('✅ **系统表现优秀**: 在最大并发级别下仍能保持95%以上的成功率');
      } else if (maxSuccessRate >= 80) {
        report.push('⚠️ **系统表现良好**: 在最大并发级别下能保持80%以上的成功率，但仍有优化空间');
      } else {
        report.push('❌ **系统需要优化**: 在高并发情况下成功率较低，需要性能优化');
      }

      const avgResponseTime = maxConcurrencyResult.averageResponseTime;
      if (avgResponseTime <= 2000) {
        report.push('✅ **响应时间优秀**: 平均响应时间在2秒以内');
      } else if (avgResponseTime <= 5000) {
        report.push('⚠️ **响应时间可接受**: 平均响应时间在5秒以内，但可以进一步优化');
      } else {
        report.push('❌ **响应时间需要优化**: 平均响应时间超过5秒');
      }
    }

    report.push('\n### 建议优化措施\n');
    report.push('1. **数据库优化**: 确保用户查询和权限检查有适当的索引');
    report.push('2. **缓存策略**: 实施用户会话和权限信息的缓存机制');
    report.push('3. **负载均衡**: 在生产环境中考虑使用负载均衡器');
    report.push('4. **连接池优化**: 优化数据库连接池配置');
    report.push('5. **API限流**: 实施适当的API限流机制防止滥用');

    return report.join('\n');
  }

  async saveReport() {
    const report = this.generateReport();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(process.cwd(), `login-stress-test-report-${timestamp}.md`);

    await fs.writeFile(reportPath, report, 'utf8');
    console.log(`\n📊 测试报告已保存到: ${reportPath}`);

    const jsonReportPath = path.join(process.cwd(), `login-stress-test-data-${timestamp}.json`);
    await fs.writeFile(jsonReportPath, JSON.stringify({
      testTime: new Date().toISOString(),
      testConfigs: this.testConfigs,
      results: this.results
    }, null, 2), 'utf8');
    console.log(`📈 原始数据已保存到: ${jsonReportPath}`);
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
  const stressTest = new LoginStressTest();

  try {
    await stressTest.init();
    await stressTest.runAllTests();
    await stressTest.saveReport();

    console.log('\n🎉 所有压力测试完成！');

  } catch (error) {
    console.error('❌ 压力测试失败:', error);
    process.exit(1);
  } finally {
    await stressTest.cleanup();
  }
}

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

// 运行测试
if (require.main === module) {
  main();
}

module.exports = LoginStressTest;