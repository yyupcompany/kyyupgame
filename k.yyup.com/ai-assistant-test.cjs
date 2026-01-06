/**
 * AI助手综合测试脚本
 * 模拟幼儿园园长常用提示词，监控前后端错误和页面渲染
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 测试配置
const CONFIG = {
  frontendUrl: 'http://localhost:5173',
  backendUrl: 'http://localhost:3000',
  timeout: 30000,
  screenshotDir: './test-screenshots',
  reportFile: './ai-assistant-test-report.json',
  slowMo: 100 // 慢速操作，便于观察
};

// 园长常用提示词库 - 45个真实场景
const PRINCIPAL_PROMPTS = {
  // 基础查询类 (5个)
  basicQueries: [
    "今天幼儿园的出勤情况如何？",
    "查看本月财务收支情况",
    "检查师资队伍配置情况",
    "查看各班级学生分布情况",
    "显示幼儿园整体运营状态"
  ],

  // 招生管理类 (5个)
  enrollment: [
    "分析本季度招生数据，提出改进建议",
    "制定下学期招生计划和策略",
    "评估当前招生渠道的效果",
    "查看待处理入学申请名单",
    "生成招生工作月度报告"
  ],

  // 教师管理类 (5个)
  teacherManagement: [
    "评估本月教师工作表现",
    "制定教师培训计划",
    "查看教师请假和调课情况",
    "分析教师离职率和原因",
    "组织教师团队建设活动方案"
  ],

  // 课程教学类 (5个)
  curriculumTeaching: [
    "检查各班课程执行情况",
    "评估教学质量和效果",
    "制定下月教学主题计划",
    "分析幼儿发展评估数据",
    "优化课程设置和安排"
  ],

  // 家长沟通类 (5个)
  parentCommunication: [
    "分析家长满意度调查结果",
    "处理家长投诉和建议",
    "制定家长会活动方案",
    "查看家园联系记录",
    "改善家长沟通策略"
  ],

  // 财务管理类 (5个)
  financialManagement: [
    "分析本月财务报表",
    "制定预算优化方案",
    "检查收费情况统计",
    "评估成本控制效果",
    "制定财务风险防控措施"
  ],

  // 安全管理类 (5个)
  safetyManagement: [
    "检查幼儿园安全隐患排查情况",
    "制定应急预案演练计划",
    "分析安全事故发生率",
    "检查食品安全管理记录",
    "评估校园安保措施有效性"
  ],

  // 活动管理类 (5个)
  activityManagement: [
    "制定下月主题活动计划",
    "评估本季度活动效果",
    "安排节日庆祝活动方案",
    "组织家长开放日活动",
    "规划户外教学活动"
  ],

  // 行政管理类 (5个)
  administrative: [
    "优化幼儿园管理流程",
    "制定年度工作计划",
    "检查各项规章制度执行情况",
    "分析运营效率指标",
    "制定绩效考核方案"
  ],

  // 综合分析类 (5个)
  comprehensive: [
    "生成幼儿园综合运营报告",
    "分析竞争优势和不足",
    "制定三年发展规划",
    "评估品牌建设效果",
    "提出创新发展建议"
  ]
};

// 创建截图目录
if (!fs.existsSync(CONFIG.screenshotDir)) {
  fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
}

// 日志记录器
class Logger {
  static log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);

    if (data) {
      console.log('Data:', JSON.stringify(data, null, 2));
    }

    return logEntry;
  }
}

// AI助手测试器
class AIAssistantTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.errors = [];
    this.networkRequests = [];
    this.consoleMessages = [];
  }

  async init() {
    Logger.log('info', '初始化浏览器环境');

    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ],
      slowMo: CONFIG.slowMo
    });

    this.page = await this.browser.newPage();

    // 设置视口
    await this.page.setViewport({
      width: 1366,
      height: 768,
      deviceScaleFactor: 1
    });

    // 监听控制台消息
    this.page.on('console', (msg) => {
      const logEntry = {
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
        timestamp: new Date().toISOString()
      };

      this.consoleMessages.push(logEntry);

      if (msg.type() === 'error') {
        this.errors.push({
          type: 'console_error',
          message: msg.text(),
          location: msg.location(),
          timestamp: new Date().toISOString()
        });
        Logger.log('error', '前端控制台错误', logEntry);
      }
    });

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
      const logEntry = {
        type: 'response',
        url: response.url(),
        status: response.status(),
        timestamp: new Date().toISOString()
      };

      this.networkRequests.push(logEntry);

      if (response.status() >= 400) {
        this.errors.push({
          type: 'http_error',
          status: response.status(),
          url: response.url(),
          timestamp: new Date().toISOString()
        });
        Logger.log('error', 'HTTP请求错误', logEntry);
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
      Logger.log('error', '页面错误', { message: error.message });
    });
  }

  async navigateToAIAssistant() {
    try {
      Logger.log('info', '导航到AI助手页面');

      // 先访问主页
      await this.page.goto(CONFIG.frontendUrl, {
        waitUntil: 'networkidle2',
        timeout: CONFIG.timeout
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // 截图主页
      await this.takeScreenshot('01-homepage-loaded');

      // 查找并点击AI助手入口
      try {
        // 等待AI助手按钮可见
        await this.page.waitForSelector('[data-testid="ai-assistant-trigger"], .ai-assistant-trigger, [class*="ai-assistant"]', {
          timeout: 10000
        });

        await this.page.click('[data-testid="ai-assistant-trigger"], .ai-assistant-trigger, [class*="ai-assistant"]');

        Logger.log('info', '成功点击AI助手入口');

        // 等待AI助手界面加载
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 截图AI助手界面
        await this.takeScreenshot('02-ai-assistant-opened');

        return true;
      } catch (error) {
        Logger.log('warn', '未找到AI助手入口，尝试直接访问AI助手页面');

        // 尝试直接访问AI助手页面
        await this.page.goto(`${CONFIG.frontendUrl}/ai-assistant`, {
          waitUntil: 'networkidle2',
          timeout: CONFIG.timeout
        });

        await new Promise(resolve => setTimeout(resolve, 3000));
        await this.takeScreenshot('02-ai-assistant-direct');

        return true;
      }
    } catch (error) {
      Logger.log('error', '导航到AI助手失败', { error: error.message });
      return false;
    }
  }

  async testPrompt(category, prompt, index) {
    try {
      Logger.log('info', `测试提示词 [${category}] ${index + 1}: ${prompt}`);

      // 查找输入框
      const inputSelectors = [
        'textarea[placeholder*="输入"]',
        'textarea[data-testid="chat-input"]',
        '.ai-input textarea',
        '[class*="input"] textarea',
        'textarea'
      ];

      let inputElement = null;
      for (const selector of inputSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 2000 });
          inputElement = await this.page.$(selector);
          if (inputElement) break;
        } catch (e) {
          continue;
        }
      }

      if (!inputElement) {
        throw new Error('未找到输入框');
      }

      // 清空并输入提示词
      await this.page.click('textarea');
      await this.page.keyboard.down('Control');
      await this.page.keyboard.press('a');
      await this.page.keyboard.up('Control');
      await this.page.keyboard.press('Backspace');

      await this.page.type('textarea', prompt, { delay: 50 });

      // 截图输入状态
      await this.takeScreenshot(`03-prompt-input-${category}-${index + 1}`);

      // 查找并点击发送按钮
      const sendSelectors = [
        'button[data-testid="send-button"]',
        '.ai-send-button',
        'button[class*="send"]',
        'button[type="submit"]',
        'button:last-child'
      ];

      let sendButton = null;
      for (const selector of sendSelectors) {
        try {
          sendButton = await this.page.$(selector);
          if (sendButton && await sendButton.isVisible()) break;
        } catch (e) {
          continue;
        }
      }

      if (!sendButton) {
        throw new Error('未找到发送按钮');
      }

      await sendButton.click();

      // 等待AI响应
      Logger.log('info', '等待AI响应...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 检查是否有响应
      const responseSelectors = [
        '.ai-response',
        '.message-content',
        '[class*="response"]',
        '[class*="message"]'
      ];

      let hasResponse = false;
      for (const selector of responseSelectors) {
        try {
          const elements = await this.page.$$(selector);
          if (elements.length > 1) { // 至少有用户消息和AI回复
            hasResponse = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      // 截图响应结果
      await this.takeScreenshot(`04-prompt-response-${category}-${index + 1}`);

      const testResult = {
        category,
        prompt,
        index: index + 1,
        success: hasResponse,
        hasResponse,
        timestamp: new Date().toISOString(),
        errorsCount: this.errors.length,
        consoleMessagesCount: this.consoleMessages.length,
        networkRequestsCount: this.networkRequests.length
      };

      this.testResults.push(testResult);

      Logger.log('info', `提示词测试完成`, testResult);

      // 等待一段时间再进行下一个测试
      await new Promise(resolve => setTimeout(resolve, 2000));

      return testResult;

    } catch (error) {
      const testResult = {
        category,
        prompt,
        index: index + 1,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        errorsCount: this.errors.length,
        consoleMessagesCount: this.consoleMessages.length,
        networkRequestsCount: this.networkRequests.length
      };

      this.testResults.push(testResult);
      this.errors.push({
        type: 'test_error',
        category,
        prompt,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      Logger.log('error', `提示词测试失败`, testResult);

      return testResult;
    }
  }

  async takeScreenshot(name) {
    try {
      const filename = `${name}-${Date.now()}.png`;
      const filepath = path.join(CONFIG.screenshotDir, filename);

      await this.page.screenshot({
        path: filepath,
        fullPage: true,
        type: 'png'
      });

      Logger.log('debug', `截图已保存: ${filename}`);
      return filepath;
    } catch (error) {
      Logger.log('error', `截图失败: ${error.message}`);
      return null;
    }
  }

  async runAllTests() {
    Logger.log('info', '开始执行AI助手综合测试');

    const startTime = Date.now();
    let totalPrompts = 0;

    try {
      // 导航到AI助手
      const navigated = await this.navigateToAIAssistant();
      if (!navigated) {
        throw new Error('无法导航到AI助手页面');
      }

      // 遍历所有类别的提示词
      for (const [category, prompts] of Object.entries(PRINCIPAL_PROMPTS)) {
        Logger.log('info', `开始测试类别: ${category}`);

        for (let i = 0; i < prompts.length; i++) {
          totalPrompts++;
          await this.testPrompt(category, prompts[i], i);

          // 每测试5个提示词后检查错误数量
          if ((i + 1) % 5 === 0) {
            Logger.log('info', `已测试 ${i + 1}/${prompts.length} 个提示词，当前错误数: ${this.errors.length}`);
          }
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 生成最终报告
      const report = {
        summary: {
          totalTests: totalPrompts,
          successfulTests: this.testResults.filter(r => r.success).length,
          failedTests: this.testResults.filter(r => !r.success).length,
          totalErrors: this.errors.length,
          consoleMessages: this.consoleMessages.length,
          networkRequests: this.networkRequests.length,
          duration: duration,
          timestamp: new Date().toISOString()
        },
        testResults: this.testResults,
        errors: this.errors,
        consoleMessages: this.consoleMessages.filter(msg => msg.type === 'error'),
        categories: Object.keys(PRINCIPAL_PROMPTS).map(category => ({
          name: category,
          total: PRINCIPAL_PROMPTS[category].length,
          successful: this.testResults.filter(r => r.category === category && r.success).length,
          failed: this.testResults.filter(r => r.category === category && !r.success).length
        }))
      };

      // 保存报告
      fs.writeFileSync(CONFIG.reportFile, JSON.stringify(report, null, 2));

      Logger.log('info', '测试完成', {
        summary: report.summary,
        reportFile: CONFIG.reportFile,
        screenshotDir: CONFIG.screenshotDir
      });

      return report;

    } catch (error) {
      Logger.log('error', '测试执行失败', { error: error.message });
      throw error;
    }
  }

  async cleanup() {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    Logger.log('info', '浏览器已清理');
  }
}

// 主执行函数
async function main() {
  const tester = new AIAssistantTester();

  try {
    await tester.init();
    const report = await tester.runAllTests();

    // 输出关键结果
    console.log('\n=== AI助手测试结果 ===');
    console.log(`总测试数: ${report.summary.totalTests}`);
    console.log(`成功测试: ${report.summary.successfulTests}`);
    console.log(`失败测试: ${report.summary.failedTests}`);
    console.log(`总错误数: ${report.summary.totalErrors}`);
    console.log(`执行时间: ${Math.round(report.summary.duration / 1000)}秒`);

    if (report.summary.totalErrors > 0) {
      console.log('\n=== 主要错误 ===');
      report.errors.slice(0, 5).forEach(error => {
        console.log(`- ${error.type}: ${error.message || error.url || error.error}`);
      });
    }

    console.log('\n=== 类别测试结果 ===');
    report.categories.forEach(category => {
      console.log(`${category.name}: ${category.successful}/${category.total} 成功`);
    });

    console.log(`\n详细报告已保存至: ${CONFIG.reportFile}`);
    console.log(`截图已保存至: ${CONFIG.screenshotDir}`);

    process.exit(report.summary.failedTests > 0 ? 1 : 0);

  } catch (error) {
    Logger.log('error', '测试执行异常', { error: error.message });
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

// 检查是否直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('测试执行失败:', error);
    process.exit(1);
  });
}

module.exports = { AIAssistantTester, PRINCIPAL_PROMPTS };