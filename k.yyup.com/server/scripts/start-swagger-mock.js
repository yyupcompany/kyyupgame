#!/usr/bin/env node

/**
 * 基于 Swagger 文档的自动 Mock 服务器
 *
 * 使用 Prism 工具从 swagger.json 自动生成 Mock API
 * 优势：
 * 1. 无需手写 mock 数据，自动从 OpenAPI schema 生成
 * 2. 保持与 API 文档完全同步
 * 3. 支持动态数据生成
 * 4. 智能参数验证和响应模拟
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Swagger 自动 Mock 服务器启动器');
console.log('='.repeat(50));

// 配置
const DEFAULT_PORT = 3010; // 改为 3010 端口
const SWAGGER_PATH = path.join(__dirname, '../swagger.json');

// 检查 swagger 文档
if (!fs.existsSync(SWAGGER_PATH)) {
  console.error('❌ 未找到 swagger.json 文档');
  console.log('💡 请先运行: npm run docs:generate');
  process.exit(1);
}

// 读取 swagger 文档信息
try {
  const swagger = JSON.parse(fs.readFileSync(SWAGGER_PATH, 'utf8'));
  const apiCount = Object.keys(swagger.paths || {}).length;
  console.log(`📖 已找到 swagger 文档 (OpenAPI ${swagger.openapi || swagger.swagger})`);
  console.log(`🔗 API 端点数量: ${apiCount} 个`);
  console.log(`📦 版本: ${swagger.info?.version || '未知'}`);
} catch (error) {
  console.error('❌ swagger 文档格式错误:', error.message);
  process.exit(1);
}

// 解析命令行参数
const args = process.argv.slice(2);
const port = args.find(arg => arg.startsWith('--port='))?.split('=')[1] || DEFAULT_PORT;
const host = args.find(arg => arg.startsWith('--host='))?.split('=')[1] || '0.0.0.0';
const mode = args.find(arg => arg === '--dynamic' || arg === '--static') || 'dynamic';
const validateRequest = !args.includes('--no-validate');
const verbose = args.includes('--verbose') || args.includes('-v');
const help = args.includes('--help') || args.includes('-h');

if (help) {
  showHelp();
  process.exit(0);
}

// 显示配置信息
console.log('\n📋 启动配置:');
console.log(`   🏠 监听地址: http://${host}:${port}`);
console.log(`   📄 Swagger 文档: ${SWAGGER_PATH}`);
console.log(`   🎭 Mock 模式: ${mode === 'dynamic' ? '动态响应 (推荐)' : '静态响应'}`);
console.log(`   ✅ 参数验证: ${validateRequest ? '开启' : '关闭'}`);

// 启动 Prism Mock 服务器
function startPrism() {
  console.log('\n⏳ 正在启动 Prism Mock 服务器...\n');

  const prismArgs = [
    'mock',
    '--port', port.toString(),
    '--host', host,
    '--cors',
    '--errors',
    '--dynamic'  // 使用动态模式，可以根据参数返回不同的数据
  ];

  if (validateRequest) {
    prismArgs.push('--validate-request');
  }

  if (verbose) {
    prismArgs.push('--verbose');
  }

  prismArgs.push(SWAGGER_PATH);

  const child = spawn('npx', ['-p', '@stoplight/prism-cli', 'prism', ...prismArgs], {
    stdio: verbose ? 'inherit' : ['ignore', 'pipe', 'pipe']
  });

  // 处理输出
  if (!verbose) {
    child.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    child.stderr.on('data', (data) => {
      console.error(data.toString());
    });
  }

  // 处理进程事件
  child.on('error', (error) => {
    if (error.code === 'ENOENT') {
      console.error('❌ 未找到 prism 命令');
      console.log('💡 正在尝试使用 npx 运行，请稍候...');
    } else {
      console.error('❌ 启动失败:', error.message);
    }
    process.exit(1);
  });

  child.on('exit', (code) => {
    if (code === 0) {
      console.log('\n✅ Mock 服务器已正常退出');
    } else {
      console.error(`\n❌ Mock 服务器异常退出 (代码: ${code})`);
    }
    process.exit(code);
  });

  // 显示启动成功信息
  setTimeout(() => {
    console.log('\n🎉 Mock 服务器启动完成!');
    console.log('📋 可用地址:');
    console.log(`   🌐 API Mock 服务: http://localhost:${port}`);
    console.log(`   📖 原始 API 文档: http://localhost:3000/api-docs`);
    console.log(`   🔍 实时 API 列表: http://localhost:${port}/__inspect/`);
    console.log('\n💡 提示:');
    console.log('   - 所有 /api/* 请求都会被 mock');
    console.log('   - 支持 GET/POST/PUT/DELETE 等所有 HTTP 方法');
    console.log('   - 响应数据会根据 OpenAPI schema 自动生成');
    console.log('   - 按 Ctrl+C 停止服务器');
  }, 2000);

  // 处理终止信号
  const gracefulShutdown = (signal) => {
    console.log(`\n🛑 收到 ${signal} 信号，正在关闭 Mock 服务器...`);
    child.kill(signal);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

function showHelp() {
  console.log(`
Swagger 自动 Mock 服务器使用说明:

用法:
  node scripts/start-swagger-mock.js [选项]

选项:
  --port=<端口>      指定端口号 (默认: ${DEFAULT_PORT})
  --host=<地址>      指定监听地址 (默认: 0.0.0.0)
  --dynamic          启用动态响应 (推荐，支持参数化)
  --static           启用静态响应 (固定数据)
  --no-validate      关闭请求参数验证
  --verbose, -v      显示详细日志
  --help, -h         显示此帮助信息

示例:
  node scripts/start-swagger-mock.js
  node scripts/start-swagger-mock.js --port=3010 --dynamic
  node scripts/start-swagger-mock.js --verbose

优势:
  ✅ 基于 OpenAPI 文档自动生成，无需手写 mock 数据
  ✅ 与 API 文档完全同步，自动保持最新
  ✅ 支持复杂的嵌套对象和数组结构
  ✅ 智能参数验证和数据生成
  ✅ 轻量级高性能，支持并发请求

工作原理:
  - 解析 swagger.json 中的所有路径和 schema 定义
  - 为每个端点创建 mock 处理程序
  - 根据参数和 schema 自动生成响应数据
  - 支持动态响应和静态响应两种模式
`);
}

// 主函数
async function main() {
  // 检查端口是否被占用
  const net = require('net');
  const isPortAvailable = (port) => new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });

  const available = await isPortAvailable(port);
  if (!available) {
    console.warn(`\n⚠️ 端口 ${port} 已被占用，尝试使用端口 ${port + 1}`);
    console.log('💡 可以使用 --port 参数指定其他端口\n');
    process.exit(1);
  }

  // 启动服务器
  startPrism();
}

// 运行
main().catch(error => {
  console.error('\n❌ 启动失败:', error.message);
  process.exit(1);
});
