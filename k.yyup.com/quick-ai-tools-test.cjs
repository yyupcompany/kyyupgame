const { chromium } = require('playwright');

async function quickAIToolsTest() {
  console.log('🚀 快速AI工具测试');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // 监听控制台错误
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log(`🔴 控制台错误: ${msg.text()}`);
    }
  });
  
  try {
    console.log('\n=== 步骤1：登录系统 ===');
    
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);
    
    await page.locator('input[type="text"]').first().fill('admin');
    await page.locator('input[type="password"]').first().fill('admin123');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(5000);
    
    console.log('✅ 登录成功');
    
    console.log('\n=== 步骤2：打开AI助手 ===');
    
    const aiButton = page.locator('button:has-text("YY-AI")').first();
    const aiButtonExists = await aiButton.count() > 0;
    
    if (!aiButtonExists) {
      console.log('❌ 未找到AI助手按钮');
      return;
    }
    
    await aiButton.click();
    await page.waitForTimeout(3000);
    console.log('✅ AI助手已打开');
    
    console.log('\n=== 步骤3：快速工具测试 ===');
    
    // 快速测试用例
    const quickTests = [
      {
        name: '基础查询测试',
        input: '查询学生总数',
        expectedKeywords: ['学生', '总数', '统计']
      },
      {
        name: '活动查询测试',
        input: '显示最近的活动',
        expectedKeywords: ['活动', '最近']
      },
      {
        name: '复杂查询测试',
        input: '统计各班级学生分布情况',
        expectedKeywords: ['班级', '学生', '分布', '统计']
      },
      {
        name: 'CRUD测试',
        input: '创建一个测试记录',
        expectedKeywords: ['创建', '记录']
      }
    ];
    
    const testResults = [];
    
    for (let i = 0; i < quickTests.length; i++) {
      const test = quickTests[i];
      console.log(`\n🧪 测试 ${i + 1}/${quickTests.length}: ${test.name}`);
      console.log(`📝 输入: "${test.input}"`);
      
      try {
        // 查找输入框
        const inputSelectors = [
          'textarea[placeholder*="输入"]',
          'input[placeholder*="输入"]',
          '.message-input',
          '.chat-input',
          'textarea',
          'input[type="text"]'
        ];
        
        let input = null;
        for (const selector of inputSelectors) {
          const element = page.locator(selector).first();
          if (await element.count() > 0) {
            input = element;
            break;
          }
        }
        
        if (!input) {
          console.log('❌ 未找到输入框');
          testResults.push({ name: test.name, success: false, error: '未找到输入框' });
          continue;
        }
        
        // 清空并输入消息
        await input.clear();
        await input.fill(test.input);
        
        // 查找发送按钮
        const sendSelectors = [
          'button:has-text("发送")',
          'button[type="submit"]',
          '.send-button',
          'button:has([class*="send"])',
          'button:has([class*="submit"])'
        ];
        
        let sendButton = null;
        for (const selector of sendSelectors) {
          const element = page.locator(selector).first();
          if (await element.count() > 0) {
            sendButton = element;
            break;
          }
        }
        
        if (!sendButton) {
          console.log('❌ 未找到发送按钮');
          testResults.push({ name: test.name, success: false, error: '未找到发送按钮' });
          continue;
        }
        
        // 发送消息
        const startTime = Date.now();
        await sendButton.click();
        
        // 等待响应
        console.log('⏳ 等待AI响应...');
        await page.waitForTimeout(8000); // 等待8秒
        
        const duration = Date.now() - startTime;
        
        // 检查响应
        const responseSelectors = [
          '.ai-message',
          '.assistant-message',
          '.message.assistant',
          '[class*="ai-response"]',
          '[class*="assistant-response"]'
        ];
        
        let hasResponse = false;
        let responseContent = '';
        
        for (const selector of responseSelectors) {
          const responses = await page.locator(selector).all();
          if (responses.length > 0) {
            const lastResponse = responses[responses.length - 1];
            responseContent = await lastResponse.textContent() || '';
            if (responseContent.trim().length > 0) {
              hasResponse = true;
              break;
            }
          }
        }
        
        // 检查是否包含期望关键词
        const hasExpectedContent = test.expectedKeywords.some(keyword => 
          responseContent.toLowerCase().includes(keyword.toLowerCase())
        );
        
        const success = hasResponse && responseContent.length > 10;
        
        testResults.push({
          name: test.name,
          input: test.input,
          success: success,
          hasResponse: hasResponse,
          hasExpectedContent: hasExpectedContent,
          responseLength: responseContent.length,
          duration: duration,
          responsePreview: responseContent.substring(0, 100) + (responseContent.length > 100 ? '...' : '')
        });
        
        console.log(`${success ? '✅' : '❌'} ${test.name}`);
        console.log(`   响应时间: ${duration}ms`);
        console.log(`   响应长度: ${responseContent.length}字符`);
        console.log(`   包含期望内容: ${hasExpectedContent ? '✅' : '❌'}`);
        
        if (responseContent.length > 0) {
          console.log(`   响应预览: "${responseContent.substring(0, 50)}..."`);
        }
        
        // 等待一下再进行下一个测试
        await page.waitForTimeout(2000);
        
      } catch (error) {
        console.log(`❌ ${test.name} - 异常: ${error.message}`);
        testResults.push({
          name: test.name,
          success: false,
          error: error.message
        });
      }
    }
    
    console.log('\n=== 📊 测试结果汇总 ===');
    
    const totalTests = testResults.length;
    const successfulTests = testResults.filter(r => r.success).length;
    const successRate = Math.round((successfulTests / totalTests) * 100);
    
    console.log(`总测试数: ${totalTests}`);
    console.log(`成功测试: ${successfulTests}`);
    console.log(`失败测试: ${totalTests - successfulTests}`);
    console.log(`成功率: ${successRate}%`);
    
    console.log('\n详细结果:');
    testResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${index + 1}. ${status} ${result.name}${duration}`);
      
      if (result.error) {
        console.log(`   错误: ${result.error}`);
      }
      
      if (result.responsePreview) {
        console.log(`   响应: "${result.responsePreview}"`);
      }
    });
    
    // 性能统计
    const performanceResults = testResults.filter(r => r.duration);
    if (performanceResults.length > 0) {
      const avgDuration = Math.round(
        performanceResults.reduce((sum, r) => sum + r.duration, 0) / performanceResults.length
      );
      console.log(`\n⚡ 平均响应时间: ${avgDuration}ms`);
    }
    
    // 错误统计
    if (errors.length > 0) {
      console.log(`\n🔴 控制台错误数: ${errors.length}`);
      errors.slice(0, 3).forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
    } else {
      console.log('\n✅ 无控制台错误');
    }
    
    console.log('\n=== 🎯 测试结论 ===');
    
    if (successRate >= 80) {
      console.log('🎉 快速测试通过！AI工具调用系统基本正常');
      console.log('✅ 建议进行完整测试套件验证');
    } else if (successRate >= 50) {
      console.log('⚠️ 快速测试部分通过，发现一些问题');
      console.log('🔧 建议检查失败的测试用例');
    } else {
      console.log('❌ 快速测试发现严重问题');
      console.log('🚨 建议立即检查AI工具调用系统');
    }
    
    return {
      totalTests,
      successfulTests,
      successRate,
      results: testResults,
      errors: errors
    };
    
  } catch (error) {
    console.error('❌ 快速测试失败:', error);
    throw error;
  } finally {
    console.log('\n⏳ 10秒后关闭浏览器...');
    await page.waitForTimeout(10000);
    await browser.close();
    console.log('✅ 快速测试完成！');
  }
}

// 如果直接运行此文件
if (require.main === module) {
  quickAIToolsTest().catch(console.error);
}

module.exports = { quickAIToolsTest };
