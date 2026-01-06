#!/usr/bin/env node

/**
 * 真实环境控制台错误检测测试启动器
 * 
 * 功能：
 * 1. 自动启动前后端服务
 * 2. 运行真实环境控制台错误检测
 * 3. 生成详细报告
 * 4. 自动清理资源
 */

const ServiceManager = require('./service-manager.cjs');
const RealConsoleTest = require('./real-console-test.cjs');
const QuickRealTest = require('./quick-real-test.cjs');

class TestRunner {
  constructor() {
    this.serviceManager = new ServiceManager();
    this.servicesStarted = false;
  }

  /**
   * 显示帮助信息
   */
  showHelp() {
    console.log(`
🧪 真实环境控制台错误检测测试

用法:
  node run-real-console-test.js [选项]

选项:
  --quick, -q     快速测试模式（测试关键页面）
  --full, -f      完整测试模式（测试所有165个页面）
  --no-start      不自动启动服务（假设服务已运行）
  --headless      无头模式运行浏览器
  --help, -h      显示此帮助信息

示例:
  node run-real-console-test.js --quick          # 快速测试
  node run-real-console-test.js --full           # 完整测试
  node run-real-console-test.js --no-start       # 使用现有服务测试
  node run-real-console-test.js --quick --headless # 快速无头测试

注意:
  - 完整测试需要约5-10分钟
  - 快速测试需要约1-2分钟
  - 测试会自动启动前后端服务（除非使用 --no-start）
  - 测试完成后会自动停止服务
`);
  }

  /**
   * 解析命令行参数
   */
  parseArgs() {
    const args = process.argv.slice(2);
    const options = {
      quick: false,
      full: false,
      noStart: false,
      headless: false,
      help: false
    };

    for (const arg of args) {
      switch (arg) {
        case '--quick':
        case '-q':
          options.quick = true;
          break;
        case '--full':
        case '-f':
          options.full = true;
          break;
        case '--no-start':
          options.noStart = true;
          break;
        case '--headless':
          options.headless = true;
          break;
        case '--help':
        case '-h':
          options.help = true;
          break;
        default:
          console.warn(`⚠️ 未知参数: ${arg}`);
      }
    }

    // 默认使用快速模式
    if (!options.quick && !options.full) {
      options.quick = true;
    }

    return options;
  }

  /**
   * 启动服务
   */
  async startServices() {
    console.log('🚀 启动前后端服务...\n');
    
    try {
      const success = await this.serviceManager.startAll();
      this.servicesStarted = true;
      
      if (success) {
        console.log('✅ 所有服务启动成功\n');
        return true;
      } else {
        console.log('⚠️ 服务可能未完全启动，但继续测试\n');
        return false;
      }
    } catch (error) {
      console.error('❌ 服务启动失败:', error);
      return false;
    }
  }

  /**
   * 停止服务
   */
  async stopServices() {
    if (this.servicesStarted) {
      console.log('\n🛑 停止服务...');
      await this.serviceManager.stopAll();
      this.servicesStarted = false;
    }
  }

  /**
   * 运行快速测试
   */
  async runQuickTest(options) {
    console.log('🏃‍♂️ 运行快速测试模式...\n');
    
    const test = new QuickRealTest();
    if (options.headless) {
      test.config = { ...test.config, headless: true };
    }
    
    const report = await test.run();

    if (!report || !report.summary) {
      console.log('\n❌ 测试未能正常完成');
      return null;
    }

    console.log('\n📊 快速测试总结:');
    console.log(`   测试页面: ${report.summary.totalPages} 个`);
    console.log(`   成功率: ${report.summary.successRate}%`);
    console.log(`   错误数: ${report.summary.totalErrors} 个`);

    return report;
  }

  /**
   * 运行完整测试
   */
  async runFullTest(options) {
    console.log('🔬 运行完整测试模式...\n');
    
    const test = new RealConsoleTest();
    if (options.headless) {
      test.config = { ...test.config, headless: true };
    }
    
    const report = await test.run();

    if (!report || !report.summary) {
      console.log('\n❌ 测试未能正常完成');
      return null;
    }

    console.log('\n📊 完整测试总结:');
    console.log(`   测试页面: ${report.summary.totalPages} 个`);
    console.log(`   成功率: ${report.summary.successRate}%`);
    console.log(`   错误数: ${report.summary.totalErrors} 个`);
    console.log(`   警告数: ${report.summary.totalWarnings || 0} 个`);

    return report;
  }

  /**
   * 主运行函数
   */
  async run() {
    const options = this.parseArgs();
    
    if (options.help) {
      this.showHelp();
      return;
    }

    console.log('🧪 真实环境控制台错误检测测试\n');
    
    try {
      // 1. 启动服务（如果需要）
      if (!options.noStart) {
        const servicesReady = await this.startServices();
        if (!servicesReady) {
          console.log('⚠️ 服务启动可能有问题，但继续测试...\n');
        }
      } else {
        console.log('📋 使用现有服务进行测试\n');
        await this.serviceManager.checkStatus();
        console.log('');
      }

      // 2. 运行测试
      let report;
      if (options.quick) {
        report = await this.runQuickTest(options);
      } else if (options.full) {
        report = await this.runFullTest(options);
      }

      // 3. 显示结果
      if (!report) {
        console.log('\n❌ 测试未能完成');
        return null;
      }

      console.log('\n🎉 测试完成！');

      if (report.summary.successRate === '100.0') {
        console.log('🏆 恭喜！所有页面都没有控制台错误！');
      } else if (parseFloat(report.summary.successRate) >= 90) {
        console.log('👍 测试结果很好！大部分页面没有控制台错误');
      } else if (parseFloat(report.summary.successRate) >= 70) {
        console.log('⚠️ 测试结果一般，建议修复一些控制台错误');
      } else {
        console.log('🔧 需要修复较多控制台错误');
      }

      return report;

    } catch (error) {
      console.error('💥 测试过程中发生错误:', error);
      throw error;
    } finally {
      // 4. 清理资源
      if (!options.noStart) {
        await this.stopServices();
      }
    }
  }
}

// 主函数
async function main() {
  const runner = new TestRunner();
  
  // 处理中断信号
  process.on('SIGINT', async () => {
    console.log('\n\n⚠️ 收到中断信号，正在清理资源...');
    await runner.stopServices();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n\n⚠️ 收到终止信号，正在清理资源...');
    await runner.stopServices();
    process.exit(0);
  });

  try {
    await runner.run();
    process.exit(0);
  } catch (error) {
    console.error('❌ 测试运行失败:', error);
    await runner.stopServices();
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

module.exports = TestRunner;
