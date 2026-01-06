#!/usr/bin/env node

/**
 * 控制台错误检测测试运行脚本
 * 
 * 功能：
 * 1. 运行控制台错误检测测试
 * 2. 生成详细的测试报告
 * 3. 提供多种运行模式
 * 4. 支持CI/CD集成
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置选项
const CONFIG = {
  // 测试配置文件路径
  configFile: path.join(__dirname, 'vitest.config.ts'),
  
  // 输出目录
  outputDir: path.join(__dirname, '../../test-results'),
  
  // 报告文件
  reportFiles: {
    json: 'console-test-results.json',
    html: 'console-test-report.html',
    summary: 'console-test-summary.txt'
  },
  
  // 默认选项
  defaultOptions: {
    timeout: 300000,  // 5分钟超时
    threads: 4,       // 4个线程
    retry: 1          // 重试1次
  }
};

/**
 * 主函数
 */
async function main() {
  console.log('🔍 控制台错误检测测试启动器');
  console.log('='.repeat(50));
  
  // 解析命令行参数
  const args = process.argv.slice(2);
  const options = parseArguments(args);
  
  // 显示配置信息
  displayConfiguration(options);
  
  // 创建输出目录
  ensureOutputDirectory();
  
  // 运行测试
  const success = await runTests(options);
  
  // 生成报告
  await generateReports(options);
  
  // 退出
  process.exit(success ? 0 : 1);
}

/**
 * 解析命令行参数
 */
function parseArguments(args) {
  const options = {
    mode: 'full',           // full | quick | report-only
    pattern: null,          // 测试文件模式
    timeout: CONFIG.defaultOptions.timeout,
    threads: CONFIG.defaultOptions.threads,
    retry: CONFIG.defaultOptions.retry,
    verbose: false,         // 详细输出
    watch: false,           // 监听模式
    coverage: false,        // 覆盖率
    bail: false,            // 遇到错误停止
    silent: false,          // 静默模式
    ci: false,              // CI模式
    generateReport: true    // 生成报告
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--mode':
      case '-m':
        options.mode = args[++i] || 'full';
        break;
        
      case '--pattern':
      case '-p':
        options.pattern = args[++i];
        break;
        
      case '--timeout':
      case '-t':
        options.timeout = parseInt(args[++i]) || CONFIG.defaultOptions.timeout;
        break;
        
      case '--threads':
        options.threads = parseInt(args[++i]) || CONFIG.defaultOptions.threads;
        break;
        
      case '--retry':
      case '-r':
        options.retry = parseInt(args[++i]) || CONFIG.defaultOptions.retry;
        break;
        
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
        
      case '--watch':
      case '-w':
        options.watch = true;
        break;
        
      case '--coverage':
      case '-c':
        options.coverage = true;
        break;
        
      case '--bail':
      case '-b':
        options.bail = true;
        break;
        
      case '--silent':
      case '-s':
        options.silent = true;
        break;
        
      case '--ci':
        options.ci = true;
        break;
        
      case '--no-report':
        options.generateReport = false;
        break;
        
      case '--help':
      case '-h':
        displayHelp();
        process.exit(0);
        break;
        
      default:
        if (arg.startsWith('-')) {
          console.warn(`⚠️ 未知参数: ${arg}`);
        }
        break;
    }
  }

  return options;
}

/**
 * 显示帮助信息
 */
function displayHelp() {
  console.log(`
🔍 控制台错误检测测试运行器

用法: node run-console-tests.js [选项]

选项:
  -m, --mode <mode>        测试模式 (full|quick|report-only) [默认: full]
  -p, --pattern <pattern>  测试文件模式
  -t, --timeout <ms>       测试超时时间 [默认: 300000]
  --threads <num>          并发线程数 [默认: 4]
  -r, --retry <num>        重试次数 [默认: 1]
  -v, --verbose            详细输出
  -w, --watch              监听模式
  -c, --coverage           生成覆盖率报告
  -b, --bail               遇到错误停止
  -s, --silent             静默模式
  --ci                     CI模式
  --no-report              不生成报告
  -h, --help               显示帮助信息

测试模式:
  full                     运行所有控制台错误检测测试
  quick                    快速测试模式，只测试核心页面
  report-only              只生成报告，不运行测试

示例:
  node run-console-tests.js                    # 运行所有测试
  node run-console-tests.js -m quick           # 快速测试
  node run-console-tests.js -p "*dashboard*"   # 只测试仪表板相关页面
  node run-console-tests.js --ci               # CI模式运行
  `);
}

/**
 * 显示配置信息
 */
function displayConfiguration(options) {
  console.log('\n📋 测试配置:');
  console.log(`   模式: ${options.mode}`);
  console.log(`   超时: ${options.timeout}ms`);
  console.log(`   线程: ${options.threads}`);
  console.log(`   重试: ${options.retry}`);
  console.log(`   详细输出: ${options.verbose ? '是' : '否'}`);
  console.log(`   生成报告: ${options.generateReport ? '是' : '否'}`);
  
  if (options.pattern) {
    console.log(`   文件模式: ${options.pattern}`);
  }
  
  console.log('');
}

/**
 * 确保输出目录存在
 */
function ensureOutputDirectory() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    console.log(`📁 创建输出目录: ${CONFIG.outputDir}`);
  }
}

/**
 * 运行测试
 */
function runTests(options) {
  return new Promise((resolve) => {
    console.log('🚀 开始运行控制台错误检测测试...\n');
    
    // 构建vitest命令
    const vitestArgs = buildVitestArgs(options);
    
    // 启动vitest进程
    const vitest = spawn('npx', ['vitest', ...vitestArgs], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '../..'),
      env: {
        ...process.env,
        NODE_ENV: 'test',
        CONSOLE_TEST_MODE: 'true'
      }
    });

    vitest.on('close', (code) => {
      const success = code === 0;
      console.log(`\n${success ? '✅' : '❌'} 测试${success ? '完成' : '失败'} (退出码: ${code})`);
      resolve(success);
    });

    vitest.on('error', (error) => {
      console.error('❌ 测试进程错误:', error);
      resolve(false);
    });
  });
}

/**
 * 构建vitest命令参数
 */
function buildVitestArgs(options) {
  const args = [];
  
  // 配置文件
  args.push('--config', CONFIG.configFile);
  
  // 运行模式
  if (!options.watch) {
    args.push('run');
  }
  
  // 测试文件模式
  if (options.pattern) {
    args.push(options.pattern);
  } else {
    // 根据模式选择测试文件
    switch (options.mode) {
      case 'quick':
        args.push('**/console-error-detection.test.ts');
        break;
      case 'report-only':
        args.push('**/console-error-reporter.test.ts');
        break;
      default:
        args.push('client/tests/consoletest/**/*.test.ts');
        break;
    }
  }
  
  // 其他选项
  if (options.verbose) {
    args.push('--reporter=verbose');
  }
  
  if (options.coverage) {
    args.push('--coverage');
  }
  
  if (options.bail) {
    args.push('--bail');
  }
  
  if (options.silent) {
    args.push('--silent');
  }
  
  // 超时设置
  args.push('--testTimeout', options.timeout.toString());
  
  // 线程设置
  args.push('--threads');
  args.push('--maxThreads', options.threads.toString());
  
  // 重试设置
  args.push('--retry', options.retry.toString());
  
  return args;
}

/**
 * 生成报告
 */
async function generateReports(options) {
  if (!options.generateReport) {
    console.log('⏭️ 跳过报告生成');
    return;
  }

  console.log('\n📊 生成测试报告...');
  
  try {
    // 检查JSON报告文件
    const jsonReportPath = path.join(CONFIG.outputDir, CONFIG.reportFiles.json);
    if (fs.existsSync(jsonReportPath)) {
      console.log(`✅ JSON报告: ${jsonReportPath}`);
      
      // 生成摘要报告
      await generateSummaryReport(jsonReportPath);
    } else {
      console.warn('⚠️ 未找到JSON报告文件');
    }
    
    // 检查HTML报告文件
    const htmlReportPath = path.join(CONFIG.outputDir, CONFIG.reportFiles.html);
    if (fs.existsSync(htmlReportPath)) {
      console.log(`✅ HTML报告: ${htmlReportPath}`);
    } else {
      console.warn('⚠️ 未找到HTML报告文件');
    }
    
  } catch (error) {
    console.error('❌ 生成报告失败:', error);
  }
}

/**
 * 生成摘要报告
 */
async function generateSummaryReport(jsonReportPath) {
  try {
    const reportData = JSON.parse(fs.readFileSync(jsonReportPath, 'utf8'));
    
    const summary = `
控制台错误检测测试摘要报告
生成时间: ${new Date().toLocaleString()}
===========================================

测试结果:
- 总测试数: ${reportData.numTotalTests || 0}
- 通过测试: ${reportData.numPassedTests || 0}
- 失败测试: ${reportData.numFailedTests || 0}
- 跳过测试: ${reportData.numPendingTests || 0}
- 测试耗时: ${reportData.testResults ? reportData.testResults.reduce((sum, r) => sum + (r.perfStats?.runtime || 0), 0) : 0}ms

${reportData.numFailedTests > 0 ? '失败测试详情:' : ''}
${reportData.testResults ? reportData.testResults
  .filter(r => r.status === 'failed')
  .map(r => `- ${r.name}: ${r.message || '未知错误'}`)
  .join('\n') : ''}

建议:
${reportData.numFailedTests === 0 ? 
  '🎉 所有页面都通过了控制台错误检测！' : 
  `发现 ${reportData.numFailedTests} 个页面存在控制台错误，建议优先修复。`}
`;

    const summaryPath = path.join(CONFIG.outputDir, CONFIG.reportFiles.summary);
    fs.writeFileSync(summaryPath, summary, 'utf8');
    console.log(`✅ 摘要报告: ${summaryPath}`);
    
  } catch (error) {
    console.error('❌ 生成摘要报告失败:', error);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 运行失败:', error);
    process.exit(1);
  });
}

module.exports = { main, parseArguments, runTests };
