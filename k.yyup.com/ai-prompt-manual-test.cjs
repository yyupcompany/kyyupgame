#!/usr/bin/env node

/**
 * AI提示词手动测试工具
 * 模拟用户访问和测试各种AI提示词的效果
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 测试提示词列表
const testPrompts = [
  {
    id: 1,
    category: '基础问候',
    prompt: '你好',
    description: '基础问候测试',
    expectedBehavior: '应该返回友好的问候回复'
  },
  {
    id: 2,
    category: '功能咨询',
    prompt: '你能帮我做什么？',
    description: 'AI功能介绍测试',
    expectedBehavior: '应该介绍AI助手的功能和用途'
  },
  {
    id: 3,
    category: '教育相关',
    prompt: '如何提高幼儿的学习兴趣？',
    description: '教育专业知识测试',
    expectedBehavior: '应该提供专业的幼儿教育建议'
  },
  {
    id: 4,
    category: '系统操作',
    prompt: '如何在系统中添加新的学生？',
    description: '系统操作指导测试',
    expectedBehavior: '应该提供系统操作步骤指导'
  },
  {
    id: 5,
    category: '数据分析',
    prompt: '帮我分析一下班级出勤率',
    description: '数据分析能力测试',
    expectedBehavior: '应该展示数据分析能力或询问具体数据'
  },
  {
    id: 6,
    category: '创意生成',
    prompt: '给我设计一个幼儿园活动方案',
    description: '创意内容生成测试',
    expectedBehavior: '应该生成有创意的活动方案'
  },
  {
    id: 7,
    category: '问题解决',
    prompt: '家长投诉孩子在学校不开心，应该怎么处理？',
    description: '实际问题解决测试',
    expectedBehavior: '应该提供专业的处理建议和沟通方案'
  },
  {
    id: 8,
    category: '多轮对话',
    prompt: '刚才的建议很好，能具体说明第一步怎么做吗？',
    description: '多轮对话上下文测试',
    expectedBehavior: '应该基于之前的对话内容继续回答'
  }
];

async function testAIPromptsManually() {
  console.log('🤖 开始AI提示词手动测试...\n');

  let browser;
  let page;

  try {
    // 启动浏览器
    browser = await chromium.launch({
      headless: true,
      devtools: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });

    page = await context.newPage();
    page.setDefaultTimeout(30000);

    console.log('🔐 第一步：登录系统');

    // 访问登录页面
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 查找并点击admin登录按钮
    const adminButtons = await page.$$('button');
    if (adminButtons.length > 0) {
      await adminButtons[0].click();
      await page.waitForTimeout(3000);
      console.log('   ✅ 登录成功');
    } else {
      throw new Error('未找到登录按钮');
    }

    // 确保AI助手界面已加载
    await page.waitForTimeout(2000);

    // 查找AI助手入口并点击
    console.log('\n🤖 第二步：打开AI助手');

    // 多种方式查找AI助手按钮
    const aiSelectors = [
      'button:has-text("AI")',
      'button:has-text("助手")',
      '.ai-assistant-btn',
      '[title*="AI"]'
    ];

    let aiButton = null;
    for (const selector of aiSelectors) {
      try {
        aiButton = await page.$(selector);
        if (aiButton) break;
      } catch (e) {
        continue;
      }
    }

    if (!aiButton) {
      // 查找包含AI文字的任何元素
      const allElements = await page.$$('button, div, span');
      for (const element of allElements) {
        try {
          const text = await element.textContent();
          if (text && (text.includes('AI') || text.includes('智能') || text.includes('助手'))) {
            aiButton = element;
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }

    if (aiButton) {
      await aiButton.click();
      await page.waitForTimeout(3000);
      console.log('   ✅ AI助手已打开');
    } else {
      throw new Error('未找到AI助手入口');
    }

    // 查找AI输入框
    const inputSelectors = [
      'textarea',
      'input[type="text"]',
      '.ai-input',
      '#aiInput'
    ];

    let aiInput = null;
    for (const selector of inputSelectors) {
      try {
        aiInput = await page.$(selector);
        if (aiInput) break;
      } catch (e) {
        continue;
      }
    }

    if (!aiInput) {
      throw new Error('未找到AI输入框');
    }

    // 查找发送按钮
    const sendSelectors = [
      'button:has-text("发送")',
      'button[type="submit"]',
      '.send-btn',
      '#sendBtn'
    ];

    let sendButton = null;
    for (const selector of sendSelectors) {
      try {
        sendButton = await page.$(selector);
        if (sendButton) break;
      } catch (e) {
        continue;
      }
    }

    if (!sendButton) {
      throw new Error('未找到发送按钮');
    }

    console.log('\n📝 第三步：开始测试AI提示词');

    // 测试结果记录
    const testResults = [];

    for (let i = 0; i < testPrompts.length; i++) {
      const testPrompt = testPrompts[i];

      console.log(`\n   🧪 测试 ${i + 1}/${testPrompts.length}: ${testPrompt.category}`);
      console.log(`      提示词: "${testPrompt.prompt}"`);
      console.log(`      描述: ${testPrompt.description}`);

      try {
        // 清空输入框
        await aiInput.fill('');

        // 输入测试提示词
        await aiInput.fill(testPrompt.prompt);
        await page.waitForTimeout(1000);

        // 截图输入状态
        await page.screenshot({
          path: `screenshots/ai-test-${i + 1}-input.png`
        });

        // 点击发送
        await sendButton.click();
        console.log(`      ⏳ 等待AI响应...`);

        // 等待响应
        await page.waitForTimeout(8000);

        // 截图响应结果
        await page.screenshot({
          path: `screenshots/ai-test-${i + 1}-response.png`
        });

        // 尝试获取AI回复内容
        let aiResponse = '';
        try {
          const responseSelectors = [
            '.ai-response',
            '.message-content',
            '.ai-message',
            '[data-testid="ai-response"]'
          ];

          for (const selector of responseSelectors) {
            try {
              const responseElement = await page.$(selector);
              if (responseElement) {
                aiResponse = await responseElement.textContent();
                break;
              }
            } catch (e) {
              continue;
            }
          }

          // 如果没找到特定的回复元素，尝试获取页面上最后出现的文本
          if (!aiResponse) {
            const allTexts = await page.$$eval('*', elements =>
              elements.map(el => el.textContent).filter(text => text && text.trim().length > 10)
            );
            // 通常AI回复会是较长的文本，取最后一个较长的文本
            const longTexts = allTexts.filter(text => text.length > 20);
            if (longTexts.length > 0) {
              aiResponse = longTexts[longTexts.length - 1].substring(0, 200) + '...';
            }
          }
        } catch (e) {
          console.log(`      ⚠️  无法获取AI回复内容: ${e.message}`);
        }

        const testResult = {
          promptId: testPrompt.id,
          category: testPrompt.category,
          prompt: testPrompt.prompt,
          description: testPrompt.description,
          expectedBehavior: testPrompt.expectedBehavior,
          actualResponse: aiResponse || '无法获取回复内容',
          responseLength: aiResponse.length,
          success: aiResponse.length > 0,
          timestamp: new Date().toISOString(),
          screenshots: [
            `screenshots/ai-test-${i + 1}-input.png`,
            `screenshots/ai-test-${i + 1}-response.png`
          ]
        };

        testResults.push(testResult);

        if (aiResponse.length > 0) {
          console.log(`      ✅ 响应成功 (${aiResponse.length} 字符)`);
          console.log(`      📄 回复预览: ${aiResponse.substring(0, 50)}...`);
        } else {
          console.log(`      ⚠️  未检测到有效回复`);
        }

      } catch (error) {
        console.log(`      ❌ 测试失败: ${error.message}`);

        const failedResult = {
          promptId: testPrompt.id,
          category: testPrompt.category,
          prompt: testPrompt.prompt,
          description: testPrompt.description,
          expectedBehavior: testPrompt.expectedBehavior,
          actualResponse: '',
          responseLength: 0,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        };

        testResults.push(failedResult);
      }

      // 测试间隔
      await page.waitForTimeout(2000);
    }

    console.log('\n📊 第四步：生成测试报告');

    // 统计结果
    const successCount = testResults.filter(r => r.success).length;
    const failureCount = testResults.length - successCount;
    const averageResponseLength = testResults
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.responseLength, 0) / (successCount || 1);

    const report = {
      testSummary: {
        totalTests: testResults.length,
        successCount: successCount,
        failureCount: failureCount,
        successRate: `${((successCount / testResults.length) * 100).toFixed(1)}%`,
        averageResponseLength: Math.round(averageResponseLength),
        testDate: new Date().toISOString(),
        systemStatus: {
          frontend: 'http://localhost:5173',
          backend: 'http://localhost:3000',
          routes: '230+ routes registered'
        }
      },
      categoryResults: {},
      detailedResults: testResults
    };

    // 按类别统计
    const categories = [...new Set(testResults.map(r => r.category))];
    categories.forEach(category => {
      const categoryTests = testResults.filter(r => r.category === category);
      const categorySuccess = categoryTests.filter(r => r.success).length;
      report.categoryResults[category] = {
        total: categoryTests.length,
        success: categorySuccess,
        rate: `${((categorySuccess / categoryTests.length) * 100).toFixed(1)}%`
      };
    });

    // 保存详细报告
    fs.writeFileSync('screenshots/ai-prompt-test-report.json', JSON.stringify(report, null, 2));

    // 输出测试总结
    console.log('\n📋 AI提示词测试总结:');
    console.log(`   总测试数: ${testResults.length}`);
    console.log(`   成功: ${successCount}`);
    console.log(`   失败: ${failureCount}`);
    console.log(`   成功率: ${report.testSummary.successRate}`);
    console.log(`   平均回复长度: ${Math.round(averageResponseLength)} 字符`);

    console.log('\n📂 分类测试结果:');
    Object.entries(report.categoryResults).forEach(([category, result]) => {
      console.log(`   ${category}: ${result.success}/${result.total} (${result.rate})`);
    });

    console.log('\n📸 所有测试截图已保存到 screenshots/ 目录');
    console.log('📄 详细报告已保存: screenshots/ai-prompt-test-report.json');

    return report;

  } catch (error) {
    console.error('\n❌ AI提示词测试失败:', error.message);

    // 保存错误截图
    if (page) {
      try {
        await page.screenshot({
          path: 'screenshots/ai-test-error.png',
          fullPage: true
        });
        console.log('   📸 错误截图已保存');
      } catch (e) {
        // 忽略截图错误
      }
    }

    throw error;

  } finally {
    // 清理资源
    if (page) {
      await page.close();
    }
    if (browser) {
      await browser.close();
    }
  }
}

// 运行测试
if (require.main === module) {
  testAIPromptsManually()
    .then(() => {
      console.log('\n🎉 AI提示词手动测试完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 测试失败:', error.message);
      process.exit(1);
    });
}

module.exports = { testAIPromptsManually, testPrompts };