#!/usr/bin/env node

/**
 * Swagger 自动 Mock 服务器启动器 (增强版)
 *
 * 使用增强版 swagger-mock-server.js
 * 特点：
 * - 基于 Swagger 文档自动生成 mock 数据
 * - 无需外部依赖，纯 Node.js 实现
 * - 端口固定为 3010
 * - 支持动态数据生成
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Swagger 自动 Mock 服务器启动器 (v2.0)');
console.log('='.repeat(50));

// 配置
const DEFAULT_PORT = 3010;
const MOCK_SERVER_PATH = path.join(__dirname, '../swagger-mock-server.js');

// 检查 mock 服务器文件
if (!fs.existsSync(MOCK_SERVER_PATH)) {
  console.error('❌ 未找到 swagger-mock-server.js');
  console.log('💡 请确保文件存在:', MOCK_SERVER_PATH);
  process.exit(1);
}

console.log('✅ 已找到 mock 服务器文件');

// 检查 swagger 文档
const SWAGGER_PATH = path.join(__dirname, '../swagger.json');
if (!fs.existsSync(SWAGGER_PATH)) {
  console.error('❌ 未找到 swagger.json 文档');
  console.log('💡 请先运行: npm run docs:generate');
  process.exit(1);
}

// 读取 swagger 文档信息
try {
  const swagger = JSON.parse(fs.readFileSync(SWAGGER_PATH, 'utf8'));
  const apiCount = Object.keys(swagger.paths || {}).length;
  console.log(`📖 已找到 Swagger 文档`);
  console.log(`🔗 API 端点数量: ${apiCount} 个`);
  console.log(`📦 版本: ${swagger.info?.version || '未知'}`);
} catch (error) {
  console.error('❌ Swagger 文档格式错误:', error.message);
  process.exit(1);
}

// 解析命令行参数
const args = process.argv.slice(2);
const port = args.find(arg => arg.startsWith('--port='))?.split('=')[1] || DEFAULT_PORT;
const verbose = args.includes('--verbose') || args.includes('-v');
const help = args.includes('--help') || args.includes('-h');

if (help) {
  showHelp();
  process.exit(0);
}

// 显示配置信息
console.log('\n📋 启动配置:');
console.log(`   🏠 监听端口: ${port}`);
console.log(`   📄 Swagger 文档: ${SWAGGER_PATH}`);
console.log(`   🎭 Mock 模式: 动态数据生成`);
console.log(`   ⚡ 响应延迟: 100-600ms (模拟真实 API)`);

// 启动 mock 服务器
function startMockServer() {
  console.log('\n⏳ 正在启动 Mock 服务器...\n');

  const env = {
    ...process.env,
    MOCK_PORT: port.toString(),
    NODE_ENV: 'development'
  };

  const child = spawn('node', [MOCK_SERVER_PATH], {
    env,
    stdio: verbose ? 'inherit' : ['ignore', 'inherit', 'inherit']
  });

  // 处理进程事件
  child.on('error', (error) => {
    console.error('❌ 启动失败:', error.message);
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

  // 处理终止信号
  const gracefulShutdown = (signal) => {
    console.log(`\n🛑 收到 ${signal} 信号，正在关闭 Mock 服务器...`);
    child.kill('SIGTERM');
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  // 显示启动信息
  setTimeout(() => {
    console.log('\n🎉 Mock 服务器启动完成!');
    console.log('📋 可用地址:');
    console.log(`   🌐 Mock API 服务: http://localhost:${port}`);
    console.log(`   📊 健康检查: http://localhost:${port}/health`);
    console.log(`   🔍 实时 API 列表: http://localhost:${port}/__inspect/`);
    console.log(`   📖 Swagger 源文档: http://localhost:3000/api-docs`);
    console.log('\n💡 功能特点:');
    console.log('   ✅ 基于 Swagger 文档自动生成 mock 数据');
    console.log('   ✅ 支持所有 HTTP 方法 (GET/POST/PUT/DELETE/PATCH)');
    console.log('   ✅ 智能数据类型生成 (字符串、数字、布尔、对象、数组)');
    console.log('   ✅ 标准 API 响应格式');
    console.log('   ✅ 动态 ID 生成');
    console.log('   ✅ 模拟真实 API 响应延迟');
    console.log('\n按 Ctrl+C 停止服务器\n');
  }, 2000);
}

function showHelp() {
  console.log(`
Swagger 自动 Mock 服务器使用说明 (增强版):

用法:
  node scripts/start-swagger-mock-v2.js [选项]

选项:
  --port=<端口>      指定端口号 (默认: ${DEFAULT_PORT})
  --verbose, -v      显示详细日志
  --help, -h         显示此帮助信息

示例:
  node scripts/start-swagger-mock-v2.js
  node scripts/start-swagger-mock-v2.js --port=3010
  node scripts/start-swagger-mock-v2.js --verbose

优势:
  ✅ 无需手写 mock 数据 - 基于 Swagger 文档自动生成
  ✅ 与 API 文档完全同步 - 保持最新状态
  ✅ 支持复杂数据结构 - 嵌套对象和数组
  ✅ 智能数据类型生成 - 字符串、数字、布尔、日期等
  ✅ 标准 API 响应格式 - { success, data, message, timestamp }
  ✅ 纯 Node.js 实现 - 无外部依赖
  ✅ 轻量级高性能 - 快速启动和响应

工作原理:
  1. 读取 swagger.json 中的所有 API 路径定义
  2. 解析每个端点的参数和响应 schema
  3. 根据数据类型自动生成符合格式的 mock 数据
  4. 为每个请求返回格式化的响应
  5. 支持路径参数、查询参数和请求体

与旧版 mock 服务器对比:
  旧版: 需要手写每个 API 的 mock 数据，效率低易出错
  新版: 基于文档自动生成，保持同步，零维护成本

使用方法:
  1. 启动: npm run mock:swagger:v2
  2. 测试: npm run mock:swagger:test
  3. 前端配置 API 基础 URL 为 http://localhost:3010
  4. 所有 /api/* 请求都会被自动 mock
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
    console.warn(`\n⚠️ 端口 ${port} 已被占用`);
    console.log('💡 请关闭占用端口的进程或使用 --port 参数指定其他端口\n');
    process.exit(1);
  }

  // 启动服务器
  startMockServer();
}

// 运行
main().catch(error => {
  console.error('\n❌ 启动失败:', error.message);
  process.exit(1);
});
