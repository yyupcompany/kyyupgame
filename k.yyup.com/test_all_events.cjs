const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, timeout: 60000 });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  const allEvents = [];

  // 监听所有控制台日志
  page.on('console', msg => {
    allEvents.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
  });

  console.log('========================================');
  console.log('🔍 完整事件捕获测试');
  console.log('========================================\n');

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

    // 清空之前的事件
    allEvents.length = 0;

    console.log('📍 发送测试查询');
    console.log('========================================\n');

    // 发送一个查询
    const textarea = await page.$('textarea');
    if (textarea) {
      await textarea.fill('园长您好，请查询学生总数');
      await page.keyboard.press('Enter');
      console.log('✅ 已发送查询，等待完整事件流...\n');
    }

    // 等待更长时间以获取完整事件流
    await page.waitForTimeout(15000);

    console.log('📊 完整事件分析');
    console.log('========================================\n');

    // 分类统计所有事件
    const eventTypes = {
      narration: allEvents.filter(e => e.text.includes('narration') || e.text.includes('解说') || e.text.includes('说明')),
      sse: allEvents.filter(e => e.text.includes('SSE') || e.text.includes('事件')),
      thinking: allEvents.filter(e => e.text.includes('thinking') || e.text.includes('思考')),
      tool: allEvents.filter(e => e.text.includes('tool') || e.text.includes('工具')),
      complete: allEvents.filter(e => e.text.includes('complete') || e.text.includes('完成')),
      start: allEvents.filter(e => e.text.includes('start') || e.text.includes('开始')),
      chat: allEvents.filter(e => e.text.includes('chat') || e.text.includes('chat')),
      history: allEvents.filter(e => e.text.includes('history') || e.text.includes('history'))
    };

    console.log(`✅ 总事件数: ${allEvents.length}\n`);

    // 显示每类事件的数量
    Object.entries(eventTypes).forEach(([type, events]) => {
      console.log(`📦 ${type.toUpperCase()}: ${events.length} 个事件`);
    });

    console.log('\n');

    // 详细显示narration事件
    if (eventTypes.narration.length > 0) {
      console.log('📝 Narration事件详情:');
      console.log('========================================');
      eventTypes.narration.forEach((event, index) => {
        console.log(`${index + 1}. [${event.type}] ${event.text}`);
      });
      console.log('\n');
    } else {
      console.log('⚠️ 未找到Narration事件\n');
    }

    // 显示完整的事件序列（前30个）
    console.log('🔄 完整事件序列（前30个）:');
    console.log('========================================');
    allEvents.slice(0, 30).forEach((event, index) => {
      console.log(`${index + 1}. [${event.type}] ${event.text.substring(0, 100)}...`);
    });
    console.log('\n');

    // 保存完整事件日志
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalEvents: allEvents.length,
        eventTypes: Object.fromEntries(
          Object.entries(eventTypes).map(([k, v]) => [k, v.length])
        )
      },
      allEvents: allEvents.map(e => ({
        type: e.type,
        message: e.text,
        timestamp: e.timestamp
      })),
      narrationEvents: eventTypes.narration.map(e => ({
        type: e.type,
        message: e.text,
        timestamp: e.timestamp
      }))
    };

    require('fs').writeFileSync('all_events_report.json', JSON.stringify(report, null, 2));
    console.log('📄 完整事件报告已保存: all_events_report.json\n');

    // 检查是否包含工具调用的narration
    const hasToolNarration = allEvents.some(e =>
      (e.text.includes('tool') || e.text.includes('工具')) &&
      (e.text.includes('narration') || e.text.includes('解说'))
    );

    console.log('========================================');
    console.log('📊 测试结论');
    console.log('========================================\n');

    console.log(`✅ 发现narration事件: ${eventTypes.narration.length > 0 ? '是' : '否'}`);
    console.log(`✅ 发现工具narration: ${hasToolNarration ? '是' : '否'}`);
    console.log(`✅ 事件总数: ${allEvents.length}`);
    console.log(`✅ SSE事件: ${eventTypes.sse.length}`);
    console.log(`✅ 工具事件: ${eventTypes.tool.length}\n`);

    console.log('========================================');
    console.log('✅ 完整事件捕获测试完成');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
  } finally {
    await context.close();
    await browser.close();
  }
})();
