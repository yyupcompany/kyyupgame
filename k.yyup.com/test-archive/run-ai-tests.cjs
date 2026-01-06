#!/usr/bin/env node

/**
 * AI助手测试运行器
 * 提供便捷的测试执行和报告生成功能
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 测试套件配置
const testSuites = {
  basic: {
    name: 'AI基础访问测试',
    file: 'tests/ai-assistant/01-basic-access.test.ts',
    description: '测试AI页面的基本可访问性和登录功能'
  },
  interface: {
    name: 'AI界面功能测试',
    file: 'tests/ai-assistant/02-interface-testing.test.ts',
    description: '测试AI助手的主界面、欢迎界面和对话界面'
  },
  components: {
    name: 'AI智能组件测试',
    file: 'tests/ai-assistant/03-smart-components.test.ts',
    description: '测试AI根据用户输入智能调用不同组件的功能'
  },
  memory: {
    name: 'AI记忆系统测试',
    file: 'tests/ai-assistant/04-memory-system.test.ts',
    description: '测试AI的记忆存储、检索和管理功能'
  },
  integration: {
    name: 'AI系统集成测试',
    file: 'tests/ai-assistant/05-integration-tests.test.ts',
    description: '测试AI助手与其他系统组件的集成功能'
  },
  journey: {
    name: 'AI客户旅程测试',
    file: 'tests/ai-assistant/06-customer-journey.test.ts',
    description: '从客户角度模拟完整的使用流程'
  },
  all: {
    name: '全部AI测试',
    file: 'tests/ai-assistant',
    description: '运行所有AI助手相关测试'
  }
};

// 显示帮助信息
function showHelp() {
  console.log(`
🤖 AI助手测试运行器

用法: node run-ai-tests.js [测试套件] [选项]

测试套件:
${Object.entries(testSuites).map(([key, suite]) => 
  `  ${key.padEnd(12)} - ${suite.name}`
).join('\n')}

选项:
  --headed     显示浏览器窗口（非无头模式）
  --debug      调试模式
  --report     生成HTML报告
  --help, -h   显示帮助信息

示例:
  node run-ai-tests.js basic                    # 运行基础测试
  node run-ai-tests.js all --headed             # 运行全部测试并显示浏览器
  node run-ai-tests.js components --report      # 运行组件测试并生成报告
  node run-ai-tests.js journey --debug          # 调试模式运行客户旅程测试

注意: 
  - 测试运行前请确保 https://k.yyup.cc 可访问
  - 首次运行可能需要安装浏览器: npx playwright install
`);
}

// 运行测试
async function runTest(suite, options = {}) {
  const testConfig = testSuites[suite];
  
  if (!testConfig) {
    console.error(`❌ 未知的测试套件: ${suite}`);
    console.error(`可用的测试套件: ${Object.keys(testSuites).join(', ')}`);
    process.exit(1);
  }

  console.log(`\n🚀 开始运行: ${testConfig.name}`);
  console.log(`📝 描述: ${testConfig.description}`);
  console.log(`📁 文件: ${testConfig.file}\n`);

  // 构建命令
  const args = ['test', testConfig.file];
  
  if (options.headed) {
    args.push('--headed');
  }
  
  if (options.debug) {
    args.push('--debug');
  }
  
  if (options.report) {
    args.push('--reporter=html');
  }

  // 运行测试
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['playwright', ...args], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${testConfig.name} 运行完成`);
        
        if (options.report) {
          console.log('📊 HTML报告已生成，运行以下命令查看:');
          console.log('   npx playwright show-report');
        }
        
        resolve(code);
      } else {
        console.log(`\n❌ ${testConfig.name} 运行失败 (退出码: ${code})`);
        reject(code);
      }
    });

    child.on('error', (error) => {
      console.error(`❌ 运行测试时出错: ${error.message}`);
      reject(error);
    });
  });
}

// 检查环境
function checkEnvironment() {
  console.log('🔍 检查测试环境...');
  
  // 检查playwright配置文件
  const configFile = path.join(process.cwd(), 'playwright.config.ts');
  if (!fs.existsSync(configFile)) {
    console.error('❌ 未找到 playwright.config.ts 配置文件');
    process.exit(1);
  }
  
  // 检查测试文件目录
  const testDir = path.join(process.cwd(), 'tests/ai-assistant');
  if (!fs.existsSync(testDir)) {
    console.error('❌ 未找到测试文件目录: tests/ai-assistant');
    process.exit(1);
  }
  
  console.log('✅ 环境检查通过');
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  // 显示帮助
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    showHelp();
    return;
  }
  
  // 解析参数
  const suite = args[0];
  const options = {
    headed: args.includes('--headed'),
    debug: args.includes('--debug'),
    report: args.includes('--report')
  };
  
  try {
    // 检查环境
    checkEnvironment();
    
    // 运行测试
    await runTest(suite, options);
    
    console.log('\n🎉 测试运行完成!');
    
  } catch (error) {
    console.error('\n💥 测试运行失败:', error);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runTest, testSuites };