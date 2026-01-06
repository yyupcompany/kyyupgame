#!/usr/bin/env node

/**
 * 增强版项目启动脚本 - 包含API文档验证和自动创建
 * 支持Windows、Linux、macOS
 * 用法: node start-with-api-docs.cjs [frontend|backend|all|stop|status]
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');

const isWindows = os.platform() === 'win32';

// 颜色输出函数
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`,
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

function warn(message) {
  console.log(colors.yellow(`[警告] ${message}`));
}

function info(message) {
  console.log(colors.blue(`[信息] ${message}`));
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

// 检查后端API文档是否可用
function checkApiDocs() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api-docs',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// 等待后端服务完全启动
async function waitForBackend(maxWaitTime = 30000) {
  log('等待后端服务完全启动...', 'blue');
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const isRunning = await checkPort(3000);
    if (isRunning) {
      // 等待额外的时间让服务完全初始化
      await new Promise(resolve => setTimeout(resolve, 5000));
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

// 验证API文档质量
async function validateApiDocs() {
  log('验证API文档质量...', 'magenta');

  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), 'server/scripts/check-api-docs-quality.js');

    if (!fs.existsSync(scriptPath)) {
      warn('API文档质量检查脚本不存在，跳过验证');
      resolve(true);
      return;
    }

    const child = spawn('node', [scriptPath], {
      stdio: 'pipe',
      shell: true,
      cwd: process.cwd()
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        success('API文档质量验证通过');
        resolve(true);
      } else {
        warn(`API文档质量检查发现问题 (退出码: ${code})`);
        if (stderr) {
          console.log(colors.yellow('错误详情:'), stderr);
        }
        resolve(false);
      }
    });

    child.on('error', (err) => {
      error(`API文档验证失败: ${err.message}`);
      resolve(false);
    });
  });
}

// 自动生成API文档
async function generateApiDocs() {
  log('自动生成API文档...', 'magenta');

  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), 'server/generate-api-docs.sh');

    if (!fs.existsSync(scriptPath)) {
      warn('API文档生成脚本不存在，跳过生成');
      resolve(true);
      return;
    }

    // 确保脚本有执行权限
    try {
      fs.chmodSync(scriptPath, '755');
    } catch (error) {
      warn(`无法设置脚本权限: ${error.message}`);
    }

    const child = spawn(isWindows ? 'bash' : 'sh', [scriptPath], {
      stdio: 'pipe',
      shell: true,
      cwd: path.join(process.cwd(), 'server')
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      // 实时显示输出
      process.stdout.write(colors.cyan(output));
    });

    child.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      process.stderr.write(colors.red(output));
    });

    child.on('close', (code) => {
      if (code === 0) {
        success('API文档生成完成');
        resolve(true);
      } else {
        warn(`API文档生成失败 (退出码: ${code})`);
        if (stderr) {
          error('生成错误详情: ' + stderr);
        }
        resolve(false);
      }
    });

    child.on('error', (err) => {
      error(`API文档生成失败: ${err.message}`);
      resolve(false);
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

    // 不等待固定时间，而是通过外部waitForBackend来等待
    resolve(backendProcess);
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
  const apiDocsAvailable = backendRunning ? await checkApiDocs() : false;

  console.log('\n=== 服务状态 ===');
  console.log(`后端服务 (端口3000): ${backendRunning ? colors.green('运行中') : colors.red('未运行')}`);
  console.log(`前端服务 (端口5173): ${frontendRunning ? colors.green('运行中') : colors.red('未运行')}`);
  console.log(`API文档 (/api-docs): ${apiDocsAvailable ? colors.green('可用') : colors.yellow('不可用')}`);

  if (backendRunning && frontendRunning) {
    console.log('\n=== 访问地址 ===');
    console.log(`前端应用: ${colors.cyan('http://localhost:5173/')}`);
    console.log(`后端API: ${colors.cyan('http://localhost:3000/api')}`);
    console.log(`API文档: ${colors.cyan('http://localhost:3000/api-docs')}`);
  }

  return { backendRunning, frontendRunning, apiDocsAvailable };
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

// API文档验证和生成流程
async function handleApiDocs() {
  log('=== API文档验证和生成流程 ===', 'magenta');

  // 1. 检查API文档是否可用
  const apiDocsAvailable = await checkApiDocs();
  if (apiDocsAvailable) {
    success('API文档已可用');
    return true;
  }

  warn('API文档不可用，开始自动生成...');

  // 2. 验证API文档质量
  const qualityOk = await validateApiDocs();
  if (!qualityOk) {
    warn('API文档质量检查未通过，尝试重新生成...');
  }

  // 3. 重新生成API文档
  const generated = await generateApiDocs();
  if (!generated) {
    error('API文档生成失败');
    return false;
  }

  // 4. 再次验证
  const retryCount = 3;
  for (let i = 0; i < retryCount; i++) {
    log(`验证API文档 (${i + 1}/${retryCount})...`, 'blue');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const available = await checkApiDocs();
    if (available) {
      success('API文档验证成功');
      return true;
    }
  }

  error('API文档验证失败，请手动检查');
  return false;
}

// 主函数
async function main() {
  const command = process.argv[2] || 'all';

  console.log(colors.bold('\n🚀 幼儿管理系统增强版启动器（含API文档验证）\n'));

  try {
    switch (command) {
      case 'frontend':
        await startFrontend();
        break;

      case 'backend':
        await startBackend();
        // 等待后端启动并处理API文档
        const backendStarted = await waitForBackend();
        if (backendStarted) {
          await handleApiDocs();
        } else {
          error('后端启动超时');
        }
        break;

      case 'all':
        await startBackend();
        const backendReady = await waitForBackend();
        if (backendReady) {
          await handleApiDocs();
        } else {
          error('后端启动超时，跳过API文档验证');
        }
        await new Promise(resolve => setTimeout(resolve, 2000)); // 等待后端启动
        await startFrontend();
        break;

      case 'status':
        await checkStatus();
        break;

      case 'api-docs':
        // 仅处理API文档
        const backendRunning = await checkPort(3000);
        if (!backendRunning) {
          error('后端服务未运行，请先启动后端服务');
          process.exit(1);
        }
        await handleApiDocs();
        break;

      case 'stop':
        stopAll();
        break;

      default:
        console.log('用法: node start-with-api-docs.cjs [frontend|backend|all|stop|status|api-docs]');
        console.log('');
        console.log('命令说明:');
        console.log('  frontend  - 仅启动前端服务');
        console.log('  backend   - 仅启动后端服务（包含API文档验证）');
        console.log('  all       - 启动前后端服务（默认，包含API文档验证）');
        console.log('  status    - 检查服务状态');
        console.log('  api-docs  - 仅验证和生成API文档（需要后端运行）');
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