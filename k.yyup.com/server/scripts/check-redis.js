#!/usr/bin/env node

/**
 * Redis 检测和启动脚本
 * 检查 Redis 是否运行，如果没有运行则自动启动
 */

const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const os = require('os');

const execAsync = promisify(exec);

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * 检查 Redis 是否运行
 */
async function checkRedis() {
  try {
    const { stdout } = await execAsync('redis-cli ping', { timeout: 5000 });
    return stdout.trim() === 'PONG';
  } catch (error) {
    return false;
  }
}

/**
 * 启动 Redis
 */
async function startRedis() {
  return new Promise((resolve, reject) => {
    log('🚀 正在启动 Redis 服务...', 'cyan');

    const isWindows = os.platform() === 'win32';
    const command = isWindows ? 'redis-server' : 'redis-server';

    try {
      // 尝试启动 Redis
      const redisProcess = spawn(command, ['--daemonize', 'yes', '--port', '6379'], {
        stdio: 'pipe',
        shell: isWindows,
      });

      let errorOutput = '';

      redisProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      redisProcess.on('close', (code) => {
        if (code === 0 || errorOutput === '') {
          // 等待 Redis 启动
          setTimeout(() => {
            checkRedis()
              .then((isRunning) => {
                if (isRunning) {
                  log('✅ Redis 服务启动成功！', 'green');
                  resolve(true);
                } else {
                  log('⚠️  Redis 进程已启动，但连接检查失败', 'yellow');
                  resolve(true);
                }
              })
              .catch(() => {
                log('⚠️  Redis 启动可能成功，但无法验证连接', 'yellow');
                resolve(true);
              });
          }, 1000);
        } else {
          reject(new Error(`Redis 启动失败: ${errorOutput}`));
        }
      });

      redisProcess.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 主函数
 */
async function main() {
  try {
    log('\n📋 检查 Redis 服务状态...', 'blue');

    const isRunning = await checkRedis();

    if (isRunning) {
      log('✅ Redis 服务已运行', 'green');
      log('   连接地址: redis://127.0.0.1:6379\n', 'green');
      process.exit(0);
    } else {
      log('⚠️  Redis 服务未运行', 'yellow');

      try {
        await startRedis();
        log('   连接地址: redis://127.0.0.1:6379\n', 'green');
        process.exit(0);
      } catch (error) {
        log(`❌ 启动 Redis 失败: ${error.message}`, 'red');
        log('\n💡 请手动启动 Redis:', 'yellow');
        log('   Linux/Mac: redis-server', 'yellow');
        log('   Windows: redis-server.exe', 'yellow');
        log('   或运行: ./start-redis.sh\n', 'yellow');
        process.exit(1);
      }
    }
  } catch (error) {
    log(`❌ 错误: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();

