/**
 * 登录页面控制台错误检查脚本
 * 使用 Playwright API Service
 */

import { browserManager, pageOperations, consoleMonitor, screenshotService } from './playwright-api-service/dist/index.js';
import * as fs from 'fs';

async function checkDashboardErrors() {
  console.log('🚀 开始检查登录页面控制台错误...\n');

  try {
    // 1. 启动浏览器（无头模式，提升性能）
    console.log('1️⃣  启动浏览器...');
    await browserManager.launch({
      headless: true,
      viewport: { width: 1920, height: 1080 }
    });
    console.log('✅ 浏览器启动成功\n');

    // 2. 开始监控控制台
    console.log('2️⃣  开始监控控制台消息...');
    consoleMonitor.startMonitoring();
    console.log('✅ 控制台监控已启动\n');

    // 3. 访问登录页面（不需要认证）
    console.log('3️⃣  访问登录页面...');
    await pageOperations.goto('http://localhost:5173/login', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    console.log('✅ 页面加载完成\n');

    // 4. 等待页面稳定
    console.log('4️⃣  等待页面完全渲染...');
    await pageOperations.wait(3000);
    console.log('✅ 页面渲染完成\n');

    // 5. 获取页面信息
    const pageInfo = await pageOperations.getPageInfo();
    console.log(`📄 页面标题: ${pageInfo.title}`);
    console.log(`🔗 当前 URL: ${pageInfo.url}\n`);

    // 6. 收集控制台消息
    console.log('5️⃣  收集控制台消息...');
    const allMessages = consoleMonitor.getAllMessages();
    const errors = consoleMonitor.getErrors();
    const warnings = consoleMonitor.getWarnings();
    const stats = consoleMonitor.getStatistics();

    console.log('📊 控制台统计:');
    console.log(`   总消息数: ${stats.total}`);
    console.log(`   错误数: ${stats.errors}`);
    console.log(`   警告数: ${stats.warnings}`);
    console.log(`   日志数: ${stats.logs}\n`);

    // 7. 判断是否有错误
    if (errors.length > 0) {
      console.log(`❌ 发现 ${errors.length} 个控制台错误:\n`);

      // 输出错误详情
      errors.forEach((error, index) => {
        console.log(`错误 ${index + 1}:`);
        console.log(`  类型: ${error.type}`);
        console.log(`  内容: ${error.text}`);
        console.log(`  时间: ${error.timestamp}`);
        if (error.location) {
          console.log(`  位置: ${error.location.url}:${error.location.lineNumber}:${error.location.columnNumber}`);
        }
        console.log('');
      });

      // 8. 截图保存
      console.log('6️⃣  保存错误截图...');
      const screenshotPath = await screenshotService.saveScreenshot(
        'login-errors.png',
        './error-screenshots'
      );
      console.log(`✅ 截图已保存: ${screenshotPath}\n`);

    } else {
      console.log('✅ 没有发现控制台错误\n');
    }

    // 9. 生成详细报告
    console.log('7️⃣  生成详细报告...');
    const report = {
      timestamp: new Date().toISOString(),
      page: {
        url: pageInfo.url,
        title: pageInfo.title
      },
      statistics: stats,
      errors: errors.map(e => ({
        type: e.type,
        text: e.text,
        timestamp: e.timestamp,
        location: e.location
      })),
      warnings: warnings.map(w => ({
        type: w.type,
        text: w.text,
        timestamp: w.timestamp
      })),
      allMessages: allMessages.slice(0, 50) // 仅保存前 50 条消息
    };

    // 保存 JSON 报告
    const reportPath = './login-error-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`✅ 详细报告已保存: ${reportPath}\n`);

    // 10. 生成摘要
    console.log('=' .repeat(60));
    console.log('📋 检查摘要');
    console.log('=' .repeat(60));
    console.log(`页面: ${pageInfo.title}`);
    console.log(`URL: ${pageInfo.url}`);
    console.log(`总消息: ${stats.total} 条`);
    console.log(`错误: ${stats.errors} 个`);
    console.log(`警告: ${stats.warnings} 个`);
    console.log(`状态: ${errors.length === 0 ? '✅ 健康' : '❌ 有错误'}`);
    console.log('=' .repeat(60));

    // 返回退出码（用于 CI/CD）
    return errors.length === 0 ? 0 : 1;

  } catch (error) {
    console.error('\n❌ 检查过程中发生错误:');
    console.error(error);

    // 发生错误时也截图
    try {
      await screenshotService.saveScreenshot(
        'login-crash.png',
        './error-screenshots'
      );
      console.log('✅ 崩溃截图已保存\n');
    } catch (screenshotError) {
      console.error('截图失败:', screenshotError);
    }

    return 1;

  } finally {
    // 11. 清理：关闭浏览器
    console.log('\n8️⃣  关闭浏览器...');
    await browserManager.close();
    console.log('✅ 浏览器已关闭\n');
  }
}

// 执行检查
checkDashboardErrors()
  .then(exitCode => {
    console.log(`\n脚本执行完成，退出码: ${exitCode}`);
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('\n脚本执行失败:', error);
    process.exit(1);
  });
