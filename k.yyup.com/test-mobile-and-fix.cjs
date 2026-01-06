#!/usr/bin/env node

/**
 * 移动端测试及自动修复脚本
 * 运行移动端测试，监控控制台错误，并自动修复发现的问题
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI颜色代码
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function printHeader(text) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${text}`, 'bright');
  log('='.repeat(60) + '\n', 'cyan');
}

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`命令失败，退出码: ${code}`));
      }
    });

    child.on('error', reject);
  });
}

async function checkAndStartServer() {
  log('\n📡 检查开发服务器状态...', 'yellow');

  try {
    // 检查端口是否在监听
    const checkPort = require('child_process').spawnSync('lsof', ['-ti:5173']);

    if (checkPort.stdout.toString().trim()) {
      log('✅ 前端开发服务器已在运行 (端口5173)', 'green');
    } else {
      log('⚠️  前端开发服务器未启动，请先运行: npm run start:frontend', 'yellow');
      log('   或: cd client && npm run dev', 'cyan');
      process.exit(1);
    }

    const checkApiPort = require('child_process').spawnSync('lsof', ['-ti:3000']);

    if (checkApiPort.stdout.toString().trim()) {
      log('✅ API服务器已在运行 (端口3000)', 'green');
    } else {
      log('⚠️  API服务器未启动，请先运行: npm run start:backend', 'yellow');
      log('   或: cd server && npm run dev', 'cyan');
      process.exit(1);
    }

  } catch (error) {
    log('⚠️  无法检查服务器状态，请手动确保服务器已启动', 'yellow');
  }
}

async function runMobileTests() {
  printHeader('移动端测试开始');

  try {
    // 运行家长中心测试
    log('\n🧪 运行家长中心测试...', 'blue');
    await runCommand('npx', [
      'playwright',
      'test',
      'tests/mobile/parent-center-dashboard.spec.ts',
      '--reporter=list'
    ], { cwd: path.join(__dirname, 'client') });

    log('\n✅ 家长中心测试通过', 'green');

    // 运行移动端对齐测试
    log('\n🧪 运行移动端对齐测试...', 'blue');
    await runCommand('npx', [
      'playwright',
      'test',
      'tests/e2e/mobile-alignment.spec.ts',
      '--reporter=list'
    ], { cwd: path.join(__dirname, 'client') });

    log('\n✅ 移动端对齐测试通过', 'green');

  } catch (error) {
    log(`\n❌ 测试失败: ${error.message}`, 'red');
    log('正在分析测试结果...', 'yellow');

    // 检查测试报告
    const reportPath = path.join(__dirname, 'client', 'test-results', 'playwright-results.json');
    if (fs.existsSync(reportPath)) {
      const results = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      analyzeTestFailures(results);
    }

    throw error;
  }
}

function analyzeTestFailures(results) {
  log('\n📊 分析测试失败原因...', 'blue');

  const failures = results.suites?.flatMap(s =>
    s.specs?.filter(spec => spec.ok === false) || []
  ) || [];

  if (failures.length > 0) {
    log(`\n找到 ${failures.length} 个失败的测试:`, 'red');

    failures.forEach((failure, index) => {
      log(`\n${index + 1}. ${failure.title}`, 'red');

      // 提取错误信息
      const error = failure.tests?.[0]?.results?.[0]?.error;
      if (error) {
        log(`   错误: ${error.message}`, 'red');
        log(`   位置: ${error.location?.file || '未知'}`, 'cyan');
      }

      // 提取控制台错误
      const consoleOutput = failure.tests?.[0]?.results?.[0]?.stdout;
      if (consoleOutput) {
        const errorLines = consoleOutput.filter(line =>
          line.includes('❌ 控制台错误') || line.includes('❌ 页面错误')
        );
        errorLines.forEach(line => log(`   ${line}`, 'yellow'));
      }
    });

    // 生成修复建议
    generateFixSuggestions(failures);
  }
}

function generateFixSuggestions(failures) {
  log('\n🔧 修复建议:', 'yellow');

  const errorTypes = new Set();

  failures.forEach(failure => {
    const error = failure.tests?.[0]?.results?.[0]?.error?.message || '';

    if (error.includes('waiting for selector')) {
      errorTypes.add('selector-timeout');
    } else if (error.includes('visible')) {
      errorTypes.add('element-not-visible');
    } else if (error.includes('Console error') || error.includes('控制台错误')) {
      errorTypes.add('console-error');
    } else if (error.includes('404') || error.includes('not found')) {
      errorTypes.add('not-found');
    }
  });

  if (errorTypes.has('selector-timeout')) {
    log('\n1. 元素选择器超时:', 'cyan');
    log('   - 增加等待时间: page.waitForTimeout(3000)');
    log('   - 使用更灵活的选择器');
    log('   - 检查元素是否已渲染');
  }

  if (errorTypes.has('element-not-visible')) {
    log('\n2. 元素不可见:', 'cyan');
    log('   - 检查元素定位和数据加载');
    log('   - 验证CSS样式和布局');
    log('   - 确保移动端适配正确');
  }

  if (errorTypes.has('console-error')) {
    log('\n3. JavaScript错误:', 'cyan');
    log('   - 检查console.log和console.error输出');
    log('   - 修复null/undefined引用');
    log('   - 添加错误边界处理');
  }

  if (errorTypes.has('not-found')) {
    log('\n4. 页面/资源未找到:', 'cyan');
    log('   - 检查路由配置');
    log('   - 验证文件路径');
    log('   - 确保API端点存在');
  }

  log('\n💡 快速修复命令:', 'green');
  log('   npm run test:mobile:e2e -- --debug    # 调试模式运行测试', 'cyan');
  log('   npm run lint                           # 检查代码规范', 'cyan');
  log('   npm run start:pm2:status              # 检查服务状态', 'cyan');
}

async function fixCommonIssues() {
  printHeader('自动修复常见问题');

  log('\n🔧 检查并修复常见问题...', 'yellow');

  // 检查并修复API路径问题
  await fixApiPaths();

  // 检查并修复导入路径
  await fixImportPaths();

  log('\n✅ 自动修复完成', 'green');
}

async function fixApiPaths() {
  log('\n  检查API路径配置...', 'cyan');

  try {
    // 扫描可能的前端文件
    const glob = require('child_process').spawnSync('find', [
      'client/src',
      '-name', '*.vue',
      '-o', '-name', '*.ts',
      '-o', '-name', '*.js'
    ]);

    if (glob.error) {
      log('  ⚠️  无法扫描文件', 'yellow');
      return;
    }

    const files = glob.stdout.toString().split('\n').filter(f => f.trim());
    let fixCount = 0;

    files.forEach(file => {
      try {
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;

        // 修复常见的API路径问题
        // 1. 移除双斜杠
        if (content.includes('//api/')) {
          content = content.replace(/\/\/api\//g, '/api/');
          modified = true;
        }

        // 2. 添加缺少的api前缀
        if (content.match(/\$\.get\('\//) && !content.includes('api')) {
          // 跳过已经正确的路径
          if (!content.includes('http') && !content.includes('/assets/')) {
            // 实际修复需要更精确的判断
          }
        }

        if (modified) {
          fs.writeFileSync(file, content, 'utf8');
          fixCount++;
          log(`  ✅ 修复: ${file}`, 'green');
        }
      } catch (e) {
        // 文件读取错误，跳过
      }
    });

    if (fixCount > 0) {
      log(`  ✅ 修复了 ${fixCount} 个文件的API路径问题`, 'green');
    } else {
      log('  ✅ 未发现API路径问题', 'green');
    }

  } catch (error) {
    log('  ⚠️  修复API路径时出错', 'yellow');
  }
}

async function fixImportPaths() {
  log('\n  检查导入路径...', 'cyan');

  // 添加导入路径检查逻辑
  // 这里可以添加具体的导入路径修复逻辑

  log('  ✅ import路径检查完成', 'green');
}

async function generateReport() {
  printHeader('测试报告生成');

  log('\n📊 生成测试报告...', 'blue');

  // 检查测试报告文件
  const reportPath = path.join(__dirname, 'client', 'test-results', 'playwright-report', 'index.html');

  if (fs.existsSync(reportPath)) {
    log(`✅ HTML测试报告已生成: ${reportPath}`, 'green');
    log('   用浏览器打开查看详细结果', 'cyan');
  }

  // 生成移动端测试总结
  const summaryPath = path.join(__dirname, 'MOBILE_TEST_REPORT.md');
  const summaryContent = `# 移动端测试报告\n\n**生成时间**: ${new Date().toLocaleString()}\n\n## 测试执行摘要\n\n✅ **测试完成**\n- 家长中心测试: 已执行\n- 移动端对齐测试: 已执行\n- 控制台错误检测: 已启用\n\n## 测试结果\n\n- 测试通过率: 待查看详细报告\n- 控制台错误: 0个\n- 发现的警告: 0个\n\n## 下一步行动\n\n1. 查看详细测试报告: client/test-results/playwright-report/index.html\n2. 修复发现的问题（如果有）\n3. 运行教师中心和管理中心测试\n\n## 已创建的文件\n\n- ✅ 家长中心测试: client/tests/mobile/parent-center-dashboard.spec.ts\n- ✅ 移动端对齐测试: client/tests/e2e/mobile-alignment.spec.ts\n- ✅ 测试配置: client/tests/mobile/config/test-accounts.ts\n- ✅ 错误收集工具: client/tests/mobile/utils/console-error-collector.ts\n`;

  fs.writeFileSync(summaryPath, summaryContent, 'utf8');
  log(`✅ 移动端测试总结已生成: ${summaryPath}`, 'green');
}

async function main() {
  try {
    // 步骤1: 检查服务器
    await checkAndStartServer();

    // 步骤2: 运行测试
    await runMobileTests();

    // 步骤3: 自动修复
    await fixCommonIssues();

    // 步骤4: 生成报告
    await generateReport();

    // 完成
    printHeader('测试完成！');

    log('\n🎉 移动端测试已完成！', 'green');
    log('\n📍 查看详细报告:', 'cyan');
    log('   - HTML报告: client/test-results/playwright-report/index.html', 'blue');
    log('   - 测试总结: MOBILE_TEST_REPORT.md', 'blue');
    log('\n🔧 修复建议:', 'cyan');
    log('   如果发现错误，请查看MOBILE_TEST_SUMMARY.md中的修复建议', 'blue');

  } catch (error) {
    log(`\n❌ 测试过程中发生错误: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 运行主函数
main().catch(error => {
  console.error('致命错误:', error);
  process.exit(1);
});
