/**
 * 使用指南和验证脚本
 */

import { playwright } from './src';

async function quickTest() {
  console.log('🚀 Playwright API Service - 快速测试\n');

  try {
    // 1. 启动浏览器
    console.log('1️⃣  启动浏览器...');
    await playwright.start('http://localhost:5173');
    console.log('✅ 浏览器启动成功\n');

    // 2. 测试页面操作
    console.log('2️⃣  测试页面操作...');
    const title = await playwright.page.getTitle();
    const url = await playwright.page.getURL();
    console.log(`   页面标题: ${title}`);
    console.log(`   当前 URL: ${url}`);
    console.log('✅ 页面操作正常\n');

    // 3. 测试控制台监控
    console.log('3️⃣  测试控制台监控...');
    playwright.console.startMonitoring();
    await playwright.page.wait(2000);
    const stats = playwright.console.getStatistics();
    console.log(`   总消息: ${stats.total}`);
    console.log(`   错误: ${stats.errors}`);
    console.log(`   警告: ${stats.warnings}`);
    console.log('✅ 控制台监控正常\n');

    // 4. 测试截图
    console.log('4️⃣  测试截图功能...');
    await playwright.screenshot.saveScreenshot('quick-test.png', './screenshots');
    console.log('✅ 截图保存成功\n');

    console.log('🎉 所有测试通过！\n');
    console.log('📖 查看完整文档:');
    console.log('   - API 参考: .claude/skills/playwright-master/api-reference.md');
    console.log('   - 使用示例: .claude/skills/playwright-master/examples.md');
    console.log('\n💡 现在你可以在 Claude Code 中说:');
    console.log('   "帮我检查 100 个页面的控制台错误"');
    console.log('   "测试登录流程"');
    console.log('   "批量截图所有页面"');
    console.log('\n   AI 会自动生成使用此 API 的脚本！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await playwright.close();
  }
}

// 运行测试
quickTest();
