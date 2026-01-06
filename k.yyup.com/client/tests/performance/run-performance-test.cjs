#!/usr/bin/env node

/**
 * 页面性能测试运行脚本
 */

const { PagePerformanceTest } = require('./page-performance-test.cjs');

async function main() {
  console.log('🚀 启动页面性能测试...\n');
  
  const test = new PagePerformanceTest();
  
  // 解析命令行参数
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }
  
  if (args.includes('--headless')) {
    test.config.headless = true;
    console.log('🎭 使用无头模式');
  }
  
  if (args.includes('--headed')) {
    test.config.headless = false;
    console.log('🎭 使用有头模式（可见浏览器）');
  }
  
  try {
    await test.run();
    console.log('\n✅ 测试完成！');
    console.log('\n📄 查看报告:');
    console.log('   JSON: client/tests/performance/performance-test-report.json');
    console.log('   HTML: client/tests/performance/performance-test-report.html');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
页面性能测试工具

用法:
  node run-performance-test.cjs [选项]

选项:
  --headless          使用无头模式运行（默认）
  --headed            使用有头模式运行（显示浏览器）
  -h, --help          显示帮助信息

示例:
  node run-performance-test.cjs                    # 默认无头模式
  node run-performance-test.cjs --headed           # 有头模式
  node run-performance-test.cjs --headless         # 明确指定无头模式

说明:
  此工具会测试所有165个页面的性能指标，包括：
  - 页面加载时间
  - DOM就绪时间
  - 首次绘制时间
  - 首次内容绘制时间
  - 网络请求时间
  - 资源大小

  测试完成后会生成详细的JSON和HTML报告。

前置条件:
  - 前端服务必须运行在 http://localhost:5173
  - 后端服务必须运行在 http://localhost:3000
  - 使用 npm run start:all 启动所有服务
  `);
}

main();

