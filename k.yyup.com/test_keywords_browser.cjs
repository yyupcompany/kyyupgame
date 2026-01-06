const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, timeout: 60000 });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  // 收集控制台日志
  const consoleLogs = [];
  const networkLogs = [];
  const errors = [];

  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
  });

  page.on('pageerror', error => {
    errors.push({
      message: error.message,
      timestamp: new Date().toISOString()
    });
  });

  page.on('response', response => {
    if (response.url().includes('/api/ai/')) {
      networkLogs.push({
        url: response.url(),
        status: response.status(),
        timestamp: new Date().toISOString()
      });
    }
  });

  console.log('========================================');
  console.log('🎯 AI助手关键词测试');
  console.log('========================================\n');

  try {
    // 登录
    console.log('📍 步骤1: 登录系统');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log('✅ 登录完成\n');

    // 直接访问AI助手页面
    console.log('📍 步骤2: 访问AI助手页面');
    await page.goto('http://localhost:5173/ai/assistant', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    console.log('✅ 页面加载完成\n');

    // 关键词测试
    const keywords = [
      { keyword: '学生总数', description: '查询学生数据' },
      { keyword: '班级信息', description: '查询班级数据' },
      { keyword: '教师', description: '查询教师信息' },
      { keyword: '活动', description: '查询活动数据' },
      { keyword: '财务', description: '查询财务信息' }
    ];

    const results = [];

    for (let i = 0; i < keywords.length; i++) {
      const test = keywords[i];
      console.log(`📍 步骤${3 + i}: 测试关键词 "${test.keyword}"`);
      console.log(`   描述: ${test.description}`);

      // 查找输入框
      const inputBox = await page.$('textarea[placeholder*="例如：请帮我"]');
      if (!inputBox) {
        console.log('   ❌ 未找到输入框，跳过测试\n');
        results.push({
          keyword: test.keyword,
          success: false,
          error: '输入框未找到'
        });
        continue;
      }

      // 输入查询
      await inputBox.click();
      await page.keyboard.down('Control');
      await page.keyboard.press('A');
      await page.keyboard.up('Control');
      await inputBox.fill(test.keyword);
      console.log('   ✅ 输入完成');

      // 发送查询
      await page.keyboard.press('Enter');
      console.log('   ⏳ 发送查询...');

      // 等待响应
      await page.waitForTimeout(8000);

      // 检查是否有消息显示
      const hasMessages = await page.evaluate(() => {
        const messages = document.querySelectorAll('.message, [class*="message"], [class*="chat"]');
        return messages.length > 0;
      });
      console.log('   ✅ 消息显示:', hasMessages ? '是' : '否');

      // 检查API调用
      const apiCalls = networkLogs.filter(log => log.url.includes('/api/ai/'));
      const hasApiCall = apiCalls.length > 0;
      console.log('   ✅ API调用:', hasApiCall ? '是' : '否');

      // 获取页面文本，检查是否包含关键词相关回复
      const pageText = await page.evaluate(() => document.body.innerText);
      const hasResponse = pageText.length > 100 && !pageText.includes('输入您的问题');
      console.log('   ✅ 有回复内容:', hasResponse ? '是' : '否');

      results.push({
        keyword: test.keyword,
        success: hasMessages && hasApiCall && hasResponse,
        hasMessages,
        hasApiCall,
        hasResponse,
        pageTextLength: pageText.length
      });

      console.log('   ✅ 测试完成\n');
    }

    // 检查控制台错误
    console.log('📍 步骤9: 检查控制台状态');
    console.log(`   总日志数: ${consoleLogs.length}`);
    console.log(`   错误数: ${errors.length}`);
    console.log(`   API调用数: ${networkLogs.length}`);

    // 总结
    console.log('\n========================================');
    console.log('📊 测试结果总结');
    console.log('========================================\n');

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ 成功: ${successCount}/${keywords.length}`);
    console.log(`❌ 失败: ${keywords.length - successCount}/${keywords.length}\n`);

    results.forEach(result => {
      console.log(`关键词: ${result.keyword}`);
      console.log(`  结果: ${result.success ? '✅ 成功' : '❌ 失败'}`);
      console.log(`  消息显示: ${result.hasMessages ? '✅' : '❌'}`);
      console.log(`  API调用: ${result.hasApiCall ? '✅' : '❌'}`);
      console.log(`  回复内容: ${result.hasResponse ? '✅' : '❌'}`);
      console.log('');
    });

    // 页面截图
    await page.screenshot({ path: 'keywords_test_result.png', fullPage: true });
    console.log('📸 截图已保存: keywords_test_result.png\n');

    // 保存详细日志
    const report = {
      timestamp: new Date().toISOString(),
      results,
      summary: {
        total: keywords.length,
        success: successCount,
        failed: keywords.length - successCount
      },
      consoleLogs: consoleLogs.slice(-10), // 只保留最后10条
      errors,
      networkLogs
    };

    require('fs').writeFileSync('keywords_test_report.json', JSON.stringify(report, null, 2));
    console.log('📄 详细报告已保存: keywords_test_report.json\n');

    console.log('========================================');
    console.log('✅ 测试完成');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error.message);
    console.error(error.stack);
  } finally {
    await context.close();
    await browser.close();
  }
})();
