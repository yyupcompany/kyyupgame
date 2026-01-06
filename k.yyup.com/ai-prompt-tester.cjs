#!/usr/bin/env node

/**
 * AI助手提示词测试工具
 * 基于成功验证的测试流程，测试各种提示词
 */

const { chromium } = require('playwright');
const fs = require('fs');

// 要测试的提示词列表
const TEST_PROMPTS = [
  {
    id: 1,
    category: 'basic',
    prompt: '你好',
    description: '基础问候测试',
    expectedBehavior: 'AI应该友好回应并询问需要什么帮助'
  },
  {
    id: 2,
    category: 'query',
    prompt: '帮我查询最近的活动',
    description: '活动查询功能测试',
    expectedBehavior: 'AI应该调用活动查询API并显示最近的活动列表'
  },
  {
    id: 3,
    category: 'create',
    prompt: '创建一个新活动',
    description: '活动创建引导测试',
    expectedBehavior: 'AI应该引导用户到活动创建页面或提供创建指导'
  },
  {
    id: 4,
    category: 'stats',
    prompt: '查看学生统计',
    description: '学生统计查询测试',
    expectedBehavior: 'AI应该显示学生相关的统计数据和图表'
  },
  {
    id: 5,
    category: 'analysis',
    prompt: '分析招生数据',
    description: '招生数据分析测试',
    expectedBehavior: 'AI应该提供招生数据的深入分析和报告'
  },
  {
    id: 6,
    category: 'generation',
    prompt: '生成活动方案',
    description: 'AI方案生成测试',
    expectedBehavior: 'AI应该基于智能代理工作流生成详细的活动执行方案'
  },
  {
    id: 7,
    category: 'guidance',
    prompt: '帮我处理报名流程',
    description: '报名流程指导测试',
    expectedBehavior: 'AI应该提供报名流程指导或直接跳转到报名页面'
  }
];

class PromptTester {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.results = [];
  }

  async init() {
    console.log('🚀 AI助手提示词测试工具启动');
    console.log('='.repeat(60));

    this.browser = await chromium.launch({
      headless: true, // 使用无头模式
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
    console.log('\n🔐 执行登录流程...');

    try {
      await this.page.goto('http://localhost:5173/login', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      await this.page.waitForTimeout(3000);

      // Admin快捷登录
      const adminButton = await this.page.$('.quick-btn.admin-btn');
      if (adminButton) {
        await adminButton.click();
        await this.page.waitForTimeout(5000);

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

  async openAIAssistant() {
    console.log('\n🤖 打开AI助手...');

    try {
      // 点击头部AI助手按钮
      const aiButton = await this.page.$('text=AI');
      if (aiButton) {
        await aiButton.click();
        await this.page.waitForTimeout(3000);
        console.log('✅ AI助手已打开');
        return true;
      }

      // 如果没找到，尝试其他选择器
      const aiSelectors = [
        '.ai-avatar',
        '[title="AI助手"]',
        '.ai-assistant-btn',
        'button:has-text("AI")'
      ];

      for (const selector of aiSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            await element.click();
            await this.page.waitForTimeout(3000);
            console.log(`✅ AI助手已打开 (${selector})`);
            return true;
          }
        } catch (e) {
          // 继续尝试下一个选择器
        }
      }

      throw new Error('未找到AI助手按钮');
    } catch (error) {
      console.error('❌ 打开AI助手失败:', error.message);
      return false;
    }
  }

  async testPrompt(promptData) {
    console.log(`\n📝 测试提示词 ${promptData.id}: ${promptData.prompt}`);
    console.log(`   类别: ${promptData.category}`);
    console.log(`   描述: ${promptData.description}`);

    const result = {
      ...promptData,
      timestamp: new Date().toISOString(),
      success: false,
      responseTime: 0,
      aiResponse: null,
      screenshot: null,
      error: null,
      userExperience: {
        interfaceQuality: 'unknown',
        responseQuality: 'unknown',
        overallSatisfaction: 'unknown'
      }
    };

    try {
      const startTime = Date.now();

      // 找到输入框
      const inputSelectors = [
        'textarea[placeholder*="请输入"]',
        'textarea',
        'input[type="text"]',
        '[contenteditable="true"]'
      ];

      let inputBox = null;
      for (const selector of inputSelectors) {
        inputBox = await this.page.$(selector);
        if (inputBox) break;
      }

      if (!inputBox) {
        throw new Error('未找到输入框');
      }

      // 输入提示词
      await inputBox.fill(promptData.prompt);
      await this.page.waitForTimeout(1000);

      // 找到发送按钮
      const sendSelectors = [
        '.send-btn',
        'button:has-text("发送")',
        'button:has-text("Send")',
        '[class*="send"]'
      ];

      let sendButton = null;
      for (const selector of sendSelectors) {
        sendButton = await this.page.$(selector);
        if (sendButton) break;
      }

      if (sendButton) {
        await sendButton.click();
      } else {
        // 如果没有发送按钮，尝试按回车
        await inputBox.press('Enter');
      }

      // 等待AI响应
      await this.page.waitForTimeout(5000);

      // 查找AI响应
      const responseSelectors = [
        '[class*="ai-response"]',
        '[class*="message"]:not(:has-textarea))',
        '.ai-message',
        '[class*="chat-message"]'
      ];

      let aiResponse = null;
      for (const selector of responseSelectors) {
        try {
          const elements = await this.page.$$(selector);
          // 找到最后一条消息
          if (elements.length > 0) {
            aiResponse = await elements[elements.length - 1].innerText();
            if (aiResponse && aiResponse.trim().length > 0) break;
          }
        } catch (e) {
          // 继续尝试下一个选择器
        }
      }

      const responseTime = Date.now() - startTime;

      if (aiResponse) {
        result.success = true;
        result.responseTime = responseTime;
        result.aiResponse = aiResponse;

        // 用户体验评估
        result.userExperience = this.evaluateUserExperience(promptData, aiResponse);

        console.log(`✅ 测试成功 (${responseTime}ms)`);
        console.log(`📄 AI响应: ${aiResponse.substring(0, 100)}...`);
      } else {
        throw new Error('未收到AI响应');
      }

      // 截图
      const screenshotName = `prompt_test_${promptData.id}_${promptData.category}.png`;
      await this.page.screenshot({
        path: `./prompt-test-screenshots/${screenshotName}`,
        fullPage: false
      });
      result.screenshot = screenshotName;

    } catch (error) {
      result.error = error.message;
      console.error(`❌ 测试失败: ${error.message}`);
    }

    this.results.push(result);
    return result;
  }

  evaluateUserExperience(promptData, aiResponse) {
    const evaluation = {
      interfaceQuality: 'good',
      responseQuality: 'good',
      overallSatisfaction: 'good'
    };

    // 评估响应质量
    if (aiResponse.length < 10) {
      evaluation.responseQuality = 'poor';
    } else if (aiResponse.includes('抱歉') || aiResponse.includes('无法')) {
      evaluation.responseQuality = 'moderate';
    }

    // 评估界面质量（这里可以添加更多界面检查逻辑）
    // 暂时给良好评分，因为我们已经验证了界面可以正常显示

    // 整体满意度
    if (evaluation.responseQuality === 'poor') {
      evaluation.overallSatisfaction = 'poor';
    } else if (evaluation.responseQuality === 'moderate') {
      evaluation.overallSatisfaction = 'moderate';
    }

    return evaluation;
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 AI助手提示词测试报告');
    console.log('='.repeat(60));

    const summary = {
      total: this.results.length,
      successful: this.results.filter(r => r.success).length,
      failed: this.results.filter(r => !r.success).length,
      averageResponseTime: 0
    };

    if (summary.successful > 0) {
      const totalTime = this.results
        .filter(r => r.success)
        .reduce((sum, r) => sum + r.responseTime, 0);
      summary.averageResponseTime = Math.round(totalTime / summary.successful);
    }

    console.log('\n📈 测试统计:');
    console.log(`✅ 成功测试: ${summary.successful}/${summary.total}`);
    console.log(`❌ 失败测试: ${summary.failed}/${summary.total}`);
    console.log(`⏱️  平均响应时间: ${summary.averageResponseTime}ms`);

    console.log('\n📋 详细结果:');
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} [${result.category.toUpperCase()}] ${result.prompt}`);

      if (result.success) {
        console.log(`    ⏱️  响应时间: ${result.responseTime}ms`);
        console.log(`    🎯 用户体验: ${result.userExperience.overallSatisfaction}`);
        console.log(`    📄 响应预览: ${result.aiResponse.substring(0, 50)}...`);
      } else {
        console.log(`    ❌ 错误: ${result.error}`);
      }
    });

    // 保存详细报告
    const reportData = {
      timestamp: new Date().toISOString(),
      summary,
      details: this.results
    };

    if (!fs.existsSync('./prompt-test-reports')) {
      fs.mkdirSync('./prompt-test-reports', { recursive: true });
    }

    fs.writeFileSync('./prompt-test-reports/prompt-test-results.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 详细报告已保存: ./prompt-test-reports/prompt-test-results.json');

    return reportData;
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
      if (!fs.existsSync('./prompt-test-screenshots')) {
        fs.mkdirSync('./prompt-test-screenshots', { recursive: true });
      }

      // 执行登录
      const loginSuccess = await this.performLogin();
      if (!loginSuccess) {
        throw new Error('登录失败，无法继续测试');
      }

      // 打开AI助手
      const aiOpenSuccess = await this.openAIAssistant();
      if (!aiOpenSuccess) {
        throw new Error('无法打开AI助手，无法继续测试');
      }

      // 测试每个提示词
      for (const promptData of TEST_PROMPTS) {
        await this.testPrompt(promptData);
        await new Promise(resolve => setTimeout(resolve, 2000)); // 避免请求过快
      }

      // 生成报告
      await this.generateReport();

    } catch (error) {
      console.error('💥 测试过程出错:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// 主程序
async function main() {
  const tester = new PromptTester();
  await tester.run();
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
    console.log('   npm run start:frontend');
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  checkServices().then(() => {
    main().catch(error => {
      console.error('💥 程序执行失败:', error);
      process.exit(1);
    });
  });
}

module.exports = PromptTester;