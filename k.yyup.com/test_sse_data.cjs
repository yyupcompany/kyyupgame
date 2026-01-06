const { chromium } = require('playwright');
const https = require('https');

(async () => {
  console.log('========================================');
  console.log('🔍 SSE数据完整捕获测试');
  console.log('========================================\n');

  // 方法1: 使用Playwright监控网络请求
  const browser = await chromium.launch({ headless: true, timeout: 60000 });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  const sseData = [];

  // 监听SSE响应
  page.on('response', async (response) => {
    if (response.url().includes('/api/ai/unified/stream-chat')) {
      console.log('📡 捕获到SSE响应:', response.url());

      // 尝试获取响应体
      try {
        const body = await response.text();
        console.log('📄 响应体长度:', body.length);

        // 解析SSE数据
        const lines = body.split('\n');
        const events = lines.filter(line => line.startsWith('data: '));

        events.forEach((event, index) => {
          const data = event.replace('data: ', '');
          if (data.trim() && data !== '[DONE]') {
            try {
              const parsed = JSON.parse(data);
              sseData.push(parsed);

              // 检查是否包含narration
              const hasNarration = JSON.stringify(parsed).toLowerCase().includes('narration');
              if (hasNarration) {
                console.log(`\n✅ 发现Narration事件 (${index + 1}):`);
                console.log(JSON.stringify(parsed, null, 2));
              }
            } catch (e) {
              console.log(`解析失败: ${data.substring(0, 100)}...`);
            }
          }
        });

        console.log(`\n✅ 总共捕获 ${events.length} 个SSE事件`);

      } catch (error) {
        console.log('❌ 获取响应体失败:', error.message);
      }
    }
  });

  try {
    // 登录
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // 访问AI助手页面
    await page.goto('http://localhost:5173/ai/assistant');
    await page.waitForTimeout(5000);

    console.log('\n📍 发送测试查询');
    console.log('========================================\n');

    // 发送查询
    const textarea = await page.$('textarea');
    if (textarea) {
      await textarea.fill('园长您好，请查询学生总数');
      await page.keyboard.press('Enter');
      console.log('✅ 已发送查询，等待SSE数据...\n');
    }

    // 等待SSE响应完成
    await page.waitForTimeout(15000);

    // 保存完整的SSE数据
    const report = {
      timestamp: new Date().toISOString(),
      totalEvents: sseData.length,
      events: sseData.map((event, index) => ({
        index,
        type: event.type || event.message?.type || 'unknown',
        data: event
      })),
      hasNarration: sseData.some(e =>
        JSON.stringify(e).toLowerCase().includes('narration')
      )
    };

    require('fs').writeFileSync('sse_data_report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 SSE数据报告已保存: sse_data_report.json');

    // 分析结果
    console.log('\n========================================');
    console.log('📊 SSE数据分析结果');
    console.log('========================================\n');

    console.log(`✅ 总事件数: ${sseData.length}`);
    console.log(`❌ 包含Narration: ${report.hasNarration ? '是' : '否'}`);

    // 显示事件类型统计
    const eventTypes = {};
    sseData.forEach(event => {
      const type = event.type || 'unknown';
      eventTypes[type] = (eventTypes[type] || 0) + 1;
    });

    console.log('\n📋 事件类型统计:');
    Object.entries(eventTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} 个`);
    });

    // 查找tool_call_complete事件
    const toolEvents = sseData.filter(e => e.type === 'tool_call_complete');
    if (toolEvents.length > 0) {
      console.log('\n🔧 工具调用事件详情:');
      toolEvents.forEach((event, index) => {
        console.log(`\n事件 ${index + 1}:`);
        console.log(JSON.stringify(event, null, 2).substring(0, 1000));
      });
    }

    console.log('\n========================================');
    console.log('✅ SSE数据捕获测试完成');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
  } finally {
    await context.close();
    await browser.close();
  }
})();
