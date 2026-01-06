#!/usr/bin/env node

/**
 * 跨平台项目启动脚本
 * 支持Windows、Linux、macOS
 * 用法: node start-all.cjs [frontend|backend|all|stop|status]
 */

const { spawn, exec } = require('child_process');
const os = require('os');
const path = require('path');

const isWindows = os.platform() === 'win32';

// 颜色输出函数
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

function log(message, color = 'cyan') {
  console.log(colors[color](`[启动器] ${message}`));
}

function error(message) {
  console.error(colors.red(`[错误] ${message}`));
}

function success(message) {
  console.log(colors.green(`[成功] ${message}`));
}

// 设置代理环境变量
function setupProxy() {
  log('设置代理环境变量...', 'yellow');

  // 设置代理环境变量
  process.env.HTTP_PROXY = 'http://127.0.0.1:10809';
  process.env.HTTPS_PROXY = 'http://127.0.0.1:10809';
  process.env.npm_config_proxy = 'http://127.0.0.1:10809';
  process.env.npm_config_https_proxy = 'http://127.0.0.1:10809';
  process.env.GIT_HTTP_PROXY = 'http://127.0.0.1:10809';
  process.env.GIT_HTTPS_PROXY = 'http://127.0.0.1:10809';
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  process.env.NO_PROXY = 'localhost,127.0.0.1,::1,k.yyup.cc,sealoshzh.site';
  process.env.npm_config_noproxy = 'localhost,127.0.0.1,::1,k.yyup.cc,sealoshzh.site';

  success('代理环境变量设置完成');
  log(`HTTP_PROXY: ${process.env.HTTP_PROXY}`, 'cyan');
  log(`NO_PROXY: ${process.env.NO_PROXY}`, 'cyan');
}

// 检查端口是否被占用
function checkPort(port) {
  return new Promise((resolve) => {
    const command = isWindows 
      ? `netstat -ano | findstr ":${port} "`
      : `netstat -tulpn | grep ":${port} "`;
    
    exec(command, (error, stdout) => {
      resolve(!error && stdout.trim());
    });
  });
}

// 启动后端服务
function startBackend() {
  return new Promise((resolve, reject) => {
    log('正在启动后端服务...', 'blue');

    // 设置代理环境变量
    setupProxy();

    const backendProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd(),
      env: { ...process.env }
    });

    backendProcess.on('error', (err) => {
      error(`后端启动失败: ${err.message}`);
      reject(err);
    });

    // 等待一段时间让后端启动
    setTimeout(() => {
      success('后端服务启动完成');
      resolve(backendProcess);
    }, 3000);
  });
}

// 启动前端服务
function startFrontend() {
  return new Promise((resolve, reject) => {
    log('正在启动前端服务...', 'blue');

    // 设置代理环境变量
    setupProxy();

    const frontendProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      cwd: path.join(process.cwd(), 'client'),
      env: { ...process.env }
    });

    frontendProcess.on('error', (err) => {
      error(`前端启动失败: ${err.message}`);
      reject(err);
    });

    // 等待一段时间让前端启动
    setTimeout(() => {
      success('前端服务启动完成');
      resolve(frontendProcess);
    }, 5000);
  });
}

// 检查服务状态
async function checkStatus() {
  log('检查服务状态...', 'yellow');
  
  const backendRunning = await checkPort(3000);
  const frontendRunning = await checkPort(5173);
  
  console.log('\n=== 服务状态 ===');
  console.log(`后端服务 (端口3000): ${backendRunning ? colors.green('运行中') : colors.red('未运行')}`);
  console.log(`前端服务 (端口5173): ${frontendRunning ? colors.green('运行中') : colors.red('未运行')}`);
  
  if (backendRunning && frontendRunning) {
    console.log('\n=== 访问地址 ===');
    console.log(`前端应用: ${colors.cyan('http://localhost:5173/')}`);
    console.log(`后端API: ${colors.cyan('http://localhost:3000/api')}`);
  }
}

// 停止所有服务
function stopAll() {
  log('正在停止所有服务...', 'yellow');
  
  const killCommands = isWindows 
    ? [
        'taskkill /f /im node.exe',
        'taskkill /f /im npm.exe'
      ]
    : [
        'pkill -f "node.*server"',
        'pkill -f "vite"',
        'pkill -f "npm.*dev"'
      ];
  
  killCommands.forEach(cmd => {
    exec(cmd, (error) => {
      if (!error) {
        log(`执行清理命令: ${cmd}`, 'yellow');
      }
    });
  });
  
  setTimeout(() => {
    success('服务停止完成');
  }, 2000);
}

// 主函数
async function main() {
  const command = process.argv[2] || 'all';
  
  console.log(colors.bold('\n🚀 幼儿园管理系统启动器\n'));
  
  try {
    switch (command) {
      case 'frontend':
        await startFrontend();
        break;
        
      case 'backend':
        await startBackend();
        break;
        
      case 'all':
        await startBackend();
        await new Promise(resolve => setTimeout(resolve, 2000)); // 等待后端启动
        await startFrontend();
        break;
        
      case 'status':
        await checkStatus();
        break;
        
      case 'stop':
        stopAll();
        break;
        
      default:
        console.log('用法: node start-all.cjs [frontend|backend|all|stop|status]');
        console.log('');
        console.log('命令说明:');
        console.log('  frontend  - 仅启动前端服务');
        console.log('  backend   - 仅启动后端服务');
        console.log('  all       - 启动前后端服务 (默认)');
        console.log('  status    - 检查服务状态');
        console.log('  stop      - 停止所有服务');
        break;
    }
  } catch (err) {
    error(`启动失败: ${err.message}`);
    process.exit(1);
  }
}

// 处理进程退出
process.on('SIGINT', () => {
  log('收到退出信号，正在清理...', 'yellow');
  stopAll();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('收到终止信号，正在清理...', 'yellow');
  stopAll();
  process.exit(0);
});

main().catch(console.error);
