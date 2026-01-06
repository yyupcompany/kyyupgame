const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, timeout: 60000 });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  const consoleLogs = [];
  const networkLogs = [];
  const errors = [];

  page.on('console', msg => {
    const log = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    };
    consoleLogs.push(log);
  });

  page.on('pageerror', error => {
    errors.push({
      message: error.message,
      timestamp: new Date().toISOString()
    });
  });

  page.on('response', response => {
    if (response.url().includes('/api/ai/unified/stream-chat')) {
      networkLogs.push({
        url: response.url(),
        status: response.status(),
        timestamp: new Date().toISOString()
      });
    }
  });

  console.log('========================================');
  console.log('🔄 前后端事件流测试');
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

    console.log('📍 发送测试查询');
    console.log('========================================\n');

    // 清空之前的日志
    consoleLogs.length = 0;

    // 发送查询
    const textarea = await page.$('textarea');
    if (textarea) {
      await textarea.fill('园长您好，请查询学生总数');
      await page.keyboard.press('Enter');
      console.log('✅ 已发送查询，等待响应...\n');
    }

    // 等待完整的响应过程
    await page.waitForTimeout(12000);

    // 分析控制台日志
    console.log('📊 控制台事件分析');
    console.log('========================================\n');

    // 查找关键事件
    const sseEvents = consoleLogs.filter(log => log.text.includes('SSE') || log.text.includes('事件') || log.text.includes('complete'));
    const thinkingEvents = consoleLogs.filter(log => log.text.includes('thinking') || log.text.includes('思考'));
    const toolEvents = consoleLogs.filter(log => log.text.includes('tool') || log.text.includes('工具'));
    const completeEvents = consoleLogs.filter(log => log.text.includes('complete') || log.text.includes('完成'));

    console.log(`✅ 总日志数: ${consoleLogs.length}`);
    console.log(`✅ SSE事件: ${sseEvents.length} 个`);
    console.log(`✅ 思考事件: ${thinkingEvents.length} 个`);
    console.log(`✅ 工具事件: ${toolEvents.length} 个`);
    console.log(`✅ 完成事件: ${completeEvents.length} 个`);
    console.log(`❌ 错误数: ${errors.length} 个\n`);

    // 显示关键事件
    if (sseEvents.length > 0) {
      console.log('📋 SSE事件列表:');
      sseEvents.slice(0, 10).forEach((log, index) => {
        console.log(`   ${index + 1}. [${log.type}] ${log.text.substring(0, 100)}...`);
      });
      console.log('');
    }

    // 检查网络请求
    console.log('📡 网络请求分析');
    console.log('========================================\n');
    console.log(`✅ API调用次数: ${networkLogs.length}`);
    if (networkLogs.length > 0) {
      networkLogs.forEach((log, index) => {
        console.log(`   ${index + 1}. ${log.url} (${log.status})`);
      });
    }
    console.log('');

    // 检查事件顺序
    console.log('🔍 事件顺序检查');
    console.log('========================================\n');

    const eventSequence = consoleLogs
      .filter(log => log.text.includes('complete') || log.text.includes('thinking') || log.text.includes('tool'))
      .slice(0, 15);

    eventSequence.forEach((log, index) => {
      console.log(`${index + 1}. ${log.text.substring(0, 80)}...`);
    });

    // 生成详细报告
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalLogs: consoleLogs.length,
        sseEvents: sseEvents.length,
        thinkingEvents: thinkingEvents.length,
        toolEvents: toolEvents.length,
        completeEvents: completeEvents.length,
        errors: errors.length,
        apiCalls: networkLogs.length
      },
      eventSequence: eventSequence.map(log => ({
        type: log.type,
        message: log.text,
        timestamp: log.timestamp
      })),
      networkLogs,
      errors,
      conclusion: {
        eventFlowComplete: sseEvents.length > 0 && completeEvents.length > 0,
        noErrors: errors.length === 0,
        apiWorking: networkLogs.length > 0
      }
    };

    require('fs').writeFileSync('event_flow_report.json', JSON.stringify(report, null, 2));
    console.log('📄 详细报告已保存: event_flow_report.json\n');

    // 结论
    console.log('========================================');
    console.log('📊 测试结论');
    console.log('========================================\n');

    const allPassed = report.conclusion.eventFlowComplete &&
                      report.conclusion.noErrors &&
                      report.conclusion.apiWorking;

    console.log(`✅ 事件流完整: ${report.conclusion.eventFlowComplete ? '是' : '否'}`);
    console.log(`✅ 无错误: ${report.conclusion.noErrors ? '是' : '否'}`);
    console.log(`✅ API正常: ${report.conclusion.apiWorking ? '是' : '否'}`);
    console.log(`\n🎯 总体状态: ${allPassed ? '✅ 全部正常' : '⚠️ 有问题'}\n`);

    console.log('========================================');
    console.log('✅ 前后端事件流测试完成');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
  } finally {
    await context.close();
    await browser.close();
  }
})();
