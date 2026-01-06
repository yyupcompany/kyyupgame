#!/usr/bin/env node

/**
 * Mock服务器启动脚本
 * 
 * 功能：
 * 1. 检查swagger文档是否存在
 * 2. 选择启动基础版或高级版mock服务器
 * 3. 提供交互式配置选项
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Mock服务器启动器');
console.log('='.repeat(50));

// 检查swagger文档
const swaggerPath = path.join(__dirname, '../swagger.json');
if (!fs.existsSync(swaggerPath)) {
  console.error('❌ 未找到swagger.json文档');
  console.log('💡 请先运行: npm run docs:generate');
  process.exit(1);
}

// 读取swagger文档信息
let apiCount = 0;
try {
  const swagger = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
  apiCount = Object.keys(swagger.paths || {}).length;
  console.log(`📖 已找到swagger文档 (${apiCount} 个API端点)`);
} catch (error) {
  console.error('❌ swagger文档格式错误:', error.message);
  process.exit(1);
}

// 解析命令行参数
const args = process.argv.slice(2);
const options = {
  type: 'advanced', // basic | advanced
  port: 3001,
  verbose: false
};

// 解析参数
args.forEach(arg => {
  if (arg === '--basic') {
    options.type = 'basic';
  } else if (arg === '--advanced') {
    options.type = 'advanced';
  } else if (arg.startsWith('--port=')) {
    options.port = parseInt(arg.split('=')[1]) || 3001;
  } else if (arg === '--verbose' || arg === '-v') {
    options.verbose = true;
  } else if (arg === '--help' || arg === '-h') {
    showHelp();
    process.exit(0);
  }
});

function showHelp() {
  console.log(`
Mock服务器启动器使用说明:

用法:
  node scripts/start-mock-server.js [选项]

选项:
  --basic              启动基础版mock服务器
  --advanced           启动高级版mock服务器 (默认)
  --port=<端口>        指定端口号 (默认: 3001)
  --verbose, -v        显示详细日志
  --help, -h           显示此帮助信息

示例:
  node scripts/start-mock-server.js --advanced --port=3002
  node scripts/start-mock-server.js --basic --verbose

服务器类型说明:
  基础版: 简单的CRUD操作mock，适合快速测试
  高级版: 智能数据生成，支持复杂查询和关系维护
`);
}

// 启动服务器
function startMockServer() {
  const serverFile = options.type === 'basic' ? 'mock-server.js' : 'advanced-mock-server.js';
  const serverPath = path.join(__dirname, '..', serverFile);
  
  if (!fs.existsSync(serverPath)) {
    console.error(`❌ 未找到服务器文件: ${serverFile}`);
    process.exit(1);
  }

  console.log(`🎯 启动${options.type === 'basic' ? '基础版' : '高级版'}Mock服务器`);
  console.log(`📍 端口: ${options.port}`);
  console.log(`📄 API端点: ${apiCount} 个`);
  console.log('⏳ 正在启动...\n');

  // 设置环境变量
  const env = {
    ...process.env,
    MOCK_PORT: options.port.toString(),
    NODE_ENV: 'development'
  };

  // 启动子进程
  const child = spawn('node', [serverPath], {
    env,
    stdio: options.verbose ? 'inherit' : ['ignore', 'inherit', 'inherit']
  });

  // 处理进程事件
  child.on('error', (error) => {
    console.error('❌ 启动失败:', error.message);
    process.exit(1);
  });

  child.on('exit', (code) => {
    if (code === 0) {
      console.log('✅ Mock服务器已正常退出');
    } else {
      console.error(`❌ Mock服务器异常退出 (代码: ${code})`);
    }
    process.exit(code);
  });

  // 处理终止信号
  process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭Mock服务器...');
    child.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 正在关闭Mock服务器...');
    child.kill('SIGTERM');
  });

  // 显示启动信息
  setTimeout(() => {
    console.log('🎉 Mock服务器启动完成!');
    console.log('📋 可用端点:');
    console.log(`   🌐 服务首页: http://localhost:${options.port}`);
    console.log(`   📊 健康检查: http://localhost:${options.port}/health`);
    console.log(`   📄 Mock数据: http://localhost:${options.port}/mock-data`);
    console.log(`   📖 API文档: http://localhost:3000/api-docs`);
    console.log('\n💡 按 Ctrl+C 停止服务器');
  }, 2000);
}

// 检查端口是否被占用
function checkPort(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true); // 端口可用
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false); // 端口被占用
    });
  });
}

// 主函数
async function main() {
  // 检查端口
  const portAvailable = await checkPort(options.port);
  if (!portAvailable) {
    console.warn(`⚠️ 端口 ${options.port} 已被占用`);
    
    // 尝试找到可用端口
    let newPort = options.port + 1;
    while (newPort < options.port + 10) {
      if (await checkPort(newPort)) {
        console.log(`✅ 使用替代端口: ${newPort}`);
        options.port = newPort;
        break;
      }
      newPort++;
    }
    
    if (newPort >= options.port + 10) {
      console.error('❌ 无法找到可用端口');
      process.exit(1);
    }
  }

  // 启动服务器
  startMockServer();
}

// 运行
main().catch(error => {
  console.error('❌ 启动失败:', error.message);
  process.exit(1);
});
