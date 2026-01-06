/**
 * Principal角色测试快速运行脚本
 * 用于快速验证Principal角色测试套件的基本功能
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const TEST_FILES = [
  'tests/principal-sidebar-comprehensive.spec.ts',
  'tests/principal-mobile-comprehensive.spec.ts'
];

function runTest(testFile) {
  console.log(`\n🧪 运行测试: ${testFile}`);
  console.log('='.repeat(60));

  try {
    const result = execSync(
      `npx playwright test ${testFile} --reporter=line`,
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        timeout: 60000 // 60秒超时
      }
    );

    console.log(result);
    return { success: true, output: result };
  } catch (error) {
    console.log(`❌ 测试失败: ${error.message}`);
    if (error.stdout) {
      console.log('输出:', error.stdout);
    }
    if (error.stderr) {
      console.log('错误:', error.stderr);
    }
    return { success: false, output: error.stdout || error.stderr, error: error.message };
  }
}

function checkTestEnvironment() {
  console.log('🔍 检查测试环境...');

  // 检查测试文件是否存在
  const missingFiles = [];
  for (const testFile of TEST_FILES) {
    const fullPath = path.join(process.cwd(), testFile);
    if (!fs.existsSync(fullPath)) {
      missingFiles.push(testFile);
    }
  }

  if (missingFiles.length > 0) {
    console.log('❌ 缺少测试文件:');
    missingFiles.forEach(file => console.log(`  - ${file}`));
    return false;
  }

  console.log('✅ 测试文件检查通过');

  // 检查Playwright配置
  const playwrightConfig = path.join(process.cwd(), 'playwright.config.ts');
  if (!fs.existsSync(playwrightConfig)) {
    console.log('❌ 未找到playwright.config.ts');
    return false;
  }

  console.log('✅ Playwright配置检查通过');
  return true;
}

function main() {
  console.log('🚀 Principal角色测试套件快速验证');
  console.log('='.repeat(80));

  // 检查环境
  if (!checkTestEnvironment()) {
    console.log('\n❌ 环境检查失败，请先解决上述问题');
    process.exit(1);
  }

  console.log('\n📊 开始运行测试...');

  const results = [];
  let totalSuccess = 0;
  let totalTests = 0;

  for (const testFile of TEST_FILES) {
    const result = runTest(testFile);
    results.push({ file: testFile, ...result });

    if (result.success) {
      totalSuccess++;

      // 尝试从输出中提取测试数量
      const testMatch = result.output.match(/(\d+) passed/);
      if (testMatch) {
        totalTests += parseInt(testMatch[1]);
      }
    }
  }

  // 生成总结报告
  console.log('\n' + '='.repeat(80));
  console.log('📋 测试执行总结');
  console.log('='.repeat(80));

  console.log(`\n📊 总体统计:`);
  console.log(`  测试文件: ${results.length}`);
  console.log(`  成功执行: ${totalSuccess}`);
  console.log(`  执行失败: ${results.length - totalSuccess}`);
  console.log(`  成功率: ${((totalSuccess / results.length) * 100).toFixed(1)}%`);

  if (totalTests > 0) {
    console.log(`  测试用例: ${totalTests}`);
  }

  console.log(`\n📋 详细结果:`);
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`  ${index + 1}. ${status} ${result.file}`);
  });

  if (totalSuccess === results.length) {
    console.log(`\n🎉 所有测试执行成功！Principal角色测试套件验证通过`);
    console.log(`\n💡 下一步建议:`);
    console.log(`  1. 运行完整测试: npm run test:e2e`);
    console.log(`  2. 检查测试覆盖率: npm run test:coverage`);
    console.log(`  3. 监控测试性能: npm run coverage:monitor`);
  } else {
    console.log(`\n⚠️ 部分测试执行失败，请检查上述错误信息`);
    console.log(`\n🔧 故障排除建议:`);
    console.log(`  1. 确保服务已启动: npm run start:all`);
    console.log(`  2. 检查网络连接: http://localhost:5173`);
    console.log(`  3. 验证测试数据: npm run seed-data:complete`);
  }
}

// 运行主程序
main().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});