#!/usr/bin/env node

/**
 * 渐进式登录压力测试
 * 每次增加1个并发用户，逐步测试系统性能
 * 找到系统开始出现问题的临界点
 */

const { chromium } = require('playwright');
const { performance } = require('perf_hooks');
const fs = require('fs/promises');
const path = require('path');

class ProgressiveLoginTest {
  constructor() {
    this.browser = null;
    this.baseURL = 'http://localhost:5173';
    this.apiURL = 'http://localhost:3000';
    this.currentConcurrency = 1;
    this.maxConcurrency = 50; // 最大测试到50个并发
    this.results = [];
    this.failureThreshold = 3; // 连续失败3次就停止

    // 测试用户配置 - 优先使用管理员登录，因为它最稳定
    this.testConfig = {
      name: '管理员登录',
      username: 'admin',
      password: '123456',
      loginType: 'manual',
      description: '管理员手动登录测试'
    };
  }

  async init() {
    console.log('🚀 初始化渐进式压力测试环境...');

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
        body: JSON.stringify({ username: 'test', password: 'test123456' })
      });
      console.log('✅ 后端API服务正常');
    } catch (error) {
      console.warn('⚠️ 后端API服务可能不可用，但继续测试:', error);
    }
  }

  async performLogin(userId) {
    const context = await this.browser.newContext({
      userAgent: `ProgressiveTest-${userId}`
    });
    const page = await context.newPage();

    const startTime = performance.now();
    const result = {
      userId,
      success: false,
      loginTime: 0,
      error: null
    };

    try {
      console.log(`🔄 用户 ${userId} 开始管理员登录测试`);

      // 访问登录页面
      await page.goto(`${this.baseURL}/mobile/login`, {
        waitUntil: 'networkidle',
        timeout: 15000 // 减少超时时间
      });

      // 等待登录页面加载
      await page.waitForSelector('.login-container', { timeout: 8000 });

      // 手动登录
      await page.fill('input[placeholder="请输入用户名"]', this.testConfig.username);
      await page.fill('input[placeholder="请输入密码"]', this.testConfig.password);
      await page.click('.login-button');
      console.log(`⌨️ 用户 ${userId} 手动输入管理员凭据`);

      // 等待登录响应
      try {
        await Promise.race([
          page.waitForURL('**/mobile/**', { timeout: 10000 }),
          page.waitForSelector('.message.success', { timeout: 10000 }),
          page.waitForTimeout(10000)
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

          console.log(`✅ 用户 ${userId} 管理员登录成功`);
        } else {
          const errorMessage = await page.$('.message.error');
          if (errorMessage) {
            const errorText = await errorMessage.textContent();
            result.error = errorText || '未知错误';
          } else {
            result.error = '登录超时或未成功跳转';
          }
          console.log(`❌ 用户 ${userId} 管理员登录失败: ${result.error}`);
        }
      } catch (waitError) {
        result.error = '登录响应超时';
        console.log(`⏰ 用户 ${userId} 管理员登录超时`);
      }

    } catch (error) {
      result.error = error.message || String(error);
      console.log(`💥 用户 ${userId} 管理员登录异常: ${result.error}`);
    } finally {
      const endTime = performance.now();
      result.loginTime = Math.round(endTime - startTime);

      await context.close();
    }

    return result;
  }

  async runConcurrencyTest(concurrency) {
    console.log(`\n🎯 测试并发级别: ${concurrency} 个用户`);

    const startTime = performance.now();
    const results = [];
    const errors = {};

    // 创建并发任务
    const tasks = [];
    for (let i = 0; i < concurrency; i++) {
      const userId = i + 1;
      tasks.push(this.performLogin(userId));
    }

    // 等待所有任务完成
    const allResults = await Promise.all(tasks);
    results.push(...allResults);

    // 统计结果
    const successfulLogins = results.filter(r => r.success).length;
    const failedLogins = results.length - successfulLogins;
    const successRate = (successfulLogins / results.length) * 100;

    let averageResponseTime = 0;
    if (results.length > 0) {
      const responseTimes = results.map(r => r.loginTime);
      averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    }

    // 统计错误类型
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
      successRate: Math.round(successRate * 10) / 10,
      averageResponseTime: Math.round(averageResponseTime),
      results,
      errors
    };

    // 简化输出
    console.log(`📊 结果: 成功 ${successfulLogins}/${results.length} (${testResult.successRate}%) | 平均响应时间: ${Math.round(averageResponseTime)}ms | 总耗时: ${totalTime}ms`);

    if (Object.keys(errors).length > 0) {
      console.log(`❌ 主要错误: ${Object.keys(errors)[0]} (${errors[Object.keys(errors)[0]]}次)`);
    }

    return testResult;
  }

  async runProgressiveTest() {
    console.log('🧪 开始渐进式压力测试...\n');
    console.log('测试策略: 每次增加1个并发用户，找到系统性能临界点');
    console.log(`测试范围: 1 - ${this.maxConcurrency} 个并发用户`);
    console.log(`失败阈值: 连续失败 ${this.failureThreshold} 次停止测试\n`);

    let consecutiveFailures = 0;
    let lastSuccessRate = 100;

    for (let concurrency = 1; concurrency <= this.maxConcurrency; concurrency++) {
      try {
        const result = await this.runConcurrencyTest(concurrency);
        this.results.push(result);

        // 检查是否达到失败阈值
        if (result.successRate < 50) { // 成功率低于50%
          consecutiveFailures++;
          console.log(`⚠️ 警告: 成功率低于50% (${result.successRate}%)`);
        } else {
          consecutiveFailures = 0;
        }

        // 如果连续失败次数达到阈值，停止测试
        if (consecutiveFailures >= this.failureThreshold) {
          console.log(`\n🛑 达到失败阈值，停止测试`);
          console.log(`临界点: ${concurrency - this.failureThreshold} 个并发用户`);
          break;
        }

        // 如果成功率为0，也停止测试
        if (result.successRate === 0) {
          console.log(`\n🛑 成功率为0%，停止测试`);
          console.log(`临界点: ${concurrency - 1} 个并发用户`);
          break;
        }

        // 在测试之间稍作停顿
        if (concurrency < this.maxConcurrency) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`❌ 并发 ${concurrency} 测试失败:`, error);
        consecutiveFailures++;

        if (consecutiveFailures >= this.failureThreshold) {
          console.log(`\n🛑 连续失败次数过多，停止测试`);
          break;
        }
      }
    }
  }

  findCriticalPoint() {
    if (this.results.length === 0) return null;

    // 找到成功率开始显著下降的点
    for (let i = 1; i < this.results.length; i++) {
      const prevResult = this.results[i - 1];
      const currentResult = this.results[i];

      // 如果成功率下降超过20%，认为是临界点
      if (prevResult.successRate - currentResult.successRate > 20) {
        return {
          concurrency: prevResult.concurrency,
          successRate: prevResult.successRate,
          averageResponseTime: prevResult.averageResponseTime,
          type: 'significant_drop'
        };
      }

      // 如果成功率低于80%，也认为是临界点
      if (currentResult.successRate < 80 && prevResult.successRate >= 80) {
        return {
          concurrency: prevResult.concurrency,
          successRate: prevResult.successRate,
          averageResponseTime: prevResult.averageResponseTime,
          type: 'below_threshold'
        };
      }
    }

    // 如果没有找到显著下降点，返回最后一个较好的结果
    const goodResults = this.results.filter(r => r.successRate >= 80);
    if (goodResults.length > 0) {
      const lastGoodResult = goodResults[goodResults.length - 1];
      return {
        concurrency: lastGoodResult.concurrency,
        successRate: lastGoodResult.successRate,
        averageResponseTime: lastGoodResult.averageResponseTime,
        type: 'last_good'
      };
    }

    return null;
  }

  generateReport() {
    const report = [];
    const timestamp = new Date().toLocaleString('zh-CN');

    report.push('# 渐进式登录压力测试报告');
    report.push(`\n测试时间: ${timestamp}`);
    report.push(`测试环境: ${this.baseURL} (前端) / ${this.apiURL} (后端)`);
    report.push(`测试策略: 每次增加1个并发用户，逐步测试`);
    report.push(`测试范围: 1 - ${this.results.length} 个并发用户`);

    report.push('\n## 测试配置\n');
    report.push(`- **测试类型**: ${this.testConfig.description}`);
    report.push(`- **用户名**: ${this.testConfig.username}`);
    report.push(`- **登录方式**: ${this.testConfig.loginType === 'quick' ? '快捷登录' : '手动登录'}`);

    // 关键结果
    const criticalPoint = this.findCriticalPoint();
    const maxStableConcurrency = criticalPoint ? criticalPoint.concurrency : 0;
    const maxSuccessRate = this.results.length > 0 ? Math.max(...this.results.map(r => r.successRate)) : 0;
    const avgResponseTime = this.results.length > 0 ?
      Math.round(this.results.reduce((sum, r) => sum + r.averageResponseTime, 0) / this.results.length) : 0;

    report.push('\n## 关键发现\n');
    report.push(`- **最大稳定并发数**: ${maxStableConcurrency} 个用户`);
    report.push(`- **最高成功率**: ${maxSuccessRate}%`);
    report.push(`- **平均响应时间**: ${avgResponseTime}ms`);

    if (criticalPoint) {
      report.push(`- **临界点类型**: ${criticalPoint.type}`);
      report.push(`- **临界点性能**: 成功率 ${criticalPoint.successRate}%, 响应时间 ${criticalPoint.averageResponseTime}ms`);
    }

    // 详细结果表格
    report.push('\n## 详细测试结果\n');
    report.push('| 并发数 | 成功登录 | 失败登录 | 成功率 | 平均响应时间 | 总耗时 |');
    report.push('|--------|----------|----------|--------|--------------|--------|');

    this.results.forEach(result => {
      const status = result.successRate >= 80 ? '✅' : result.successRate >= 50 ? '⚠️' : '❌';
      report.push(`| ${result.concurrency} | ${result.successfulLogins} | ${result.failedLogins} | ${result.successRate}% | ${result.averageResponseTime}ms | ${result.totalTime}ms | ${status}`);
    });

    // 性能分析
    report.push('\n## 性能分析\n');

    if (criticalPoint) {
      report.push('### 系统性能临界点\n');
      report.push(`系统在并发数达到 **${criticalPoint.concurrency}** 时开始出现性能问题：`);
      report.push(`- 成功率从 ${this.results[criticalPoint.concurrency - 2]?.successRate || 100}% 下降到 ${criticalPoint.successRate}%`);
      report.push(`- 平均响应时间: ${criticalPoint.averageResponseTime}ms`);

      if (criticalPoint.type === 'significant_drop') {
        report.push('- 问题类型: 性能显著下降');
      } else if (criticalPoint.type === 'below_threshold') {
        report.push('- 问题类型: 成功率低于80%阈值');
      }
    }

    // 响应时间趋势分析
    report.push('\n### 响应时间趋势分析\n');
    const fastResponses = this.results.filter(r => r.averageResponseTime <= 3000).length;
    const slowResponses = this.results.filter(r => r.averageResponseTime > 5000).length;

    report.push(`- 快速响应 (≤3秒): ${fastResponses}/${this.results.length} 个测试`);
    report.push(`- 慢速响应 (>5秒): ${slowResponses}/${this.results.length} 个测试`);

    if (slowResponses > 0) {
      report.push('⚠️ 系统在高并发下响应时间过长，需要优化');
    }

    // 建议优化措施
    report.push('\n## 建议优化措施\n');

    if (maxStableConcurrency < 10) {
      report.push('🔴 **紧急优化需求**: ');
      report.push('1. 立即检查前端页面加载性能');
      report.push('2. 优化数据库查询和索引');
      report.push('3. 实施缓存策略');
      report.push('4. 考虑增加服务器资源');
    } else if (maxStableConcurrency < 20) {
      report.push('🟡 **中等优化需求**: ');
      report.push('1. 优化前端组件渲染性能');
      report.push('2. 实施数据库连接池优化');
      report.push('3. 添加API响应缓存');
      report.push('4. 监控系统资源使用情况');
    } else {
      report.push('🟢 **性能良好**: ');
      report.push('1. 继续监控系统性能表现');
      report.push('2. 定期进行压力测试');
      report.push('3. 考虑实施负载均衡以进一步提升性能');
    }

    report.push('\n### 通用优化建议\n');
    report.push('1. **前端优化**: 组件懒加载、代码分割、资源压缩');
    report.push('2. **后端优化**: 数据库索引、查询优化、缓存机制');
    report.push('3. **网络优化**: CDN加速、HTTP/2、资源合并');
    report.push('4. **监控告警**: 实时性能监控、异常告警机制');

    return report.join('\n');
  }

  async saveReport() {
    const report = this.generateReport();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(process.cwd(), `progressive-login-test-report-${timestamp}.md`);

    await fs.writeFile(reportPath, report, 'utf8');
    console.log(`\n📊 测试报告已保存到: ${reportPath}`);

    // 保存原始数据
    const jsonReportPath = path.join(process.cwd(), `progressive-login-test-data-${timestamp}.json`);
    await fs.writeFile(jsonReportPath, JSON.stringify({
      testTime: new Date().toISOString(),
      testConfig: this.testConfig,
      maxConcurrency: this.maxConcurrency,
      results: this.results,
      criticalPoint: this.findCriticalPoint()
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
  const test = new ProgressiveLoginTest();

  try {
    await test.init();
    await test.runProgressiveTest();
    await test.saveReport();

    console.log('\n🎉 渐进式压力测试完成！');

    // 输出关键结论
    const criticalPoint = test.findCriticalPoint();
    if (criticalPoint) {
      console.log(`\n🎯 关键结论:`);
      console.log(`   最大稳定并发数: ${criticalPoint.concurrency} 个用户`);
      console.log(`   推荐生产环境并发数: ${Math.floor(criticalPoint.concurrency * 0.8)} 个用户`);
      console.log(`   性能表现: 成功率 ${criticalPoint.successRate}%, 响应时间 ${criticalPoint.averageResponseTime}ms`);
    }

  } catch (error) {
    console.error('❌ 渐进式压力测试失败:', error);
    process.exit(1);
  } finally {
    await test.cleanup();
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

module.exports = ProgressiveLoginTest;