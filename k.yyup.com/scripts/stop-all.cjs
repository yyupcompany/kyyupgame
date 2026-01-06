#!/usr/bin/env node

/**
 * 停止所有服务脚本
 * 跨平台支持Windows、Linux、macOS
 */

const { exec } = require('child_process');
const os = require('os');

const isWindows = os.platform() === 'win32';

// 颜色输出函数
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`
};

function log(message, color = 'cyan') {
  console.log(colors[color](`[停止器] ${message}`));
}

function success(message) {
  console.log(colors.green(`[成功] ${message}`));
}

// 停止指定端口的进程
function killPort(port) {
  return new Promise((resolve) => {
    const findCommand = isWindows 
      ? `netstat -ano | findstr ":${port} "`
      : `netstat -tulpn | grep ":${port} "`;
    
    exec(findCommand, (error, stdout) => {
      if (error || !stdout.trim()) {
        log(`端口 ${port} 未被占用`, 'yellow');
        resolve();
        return;
      }
      
      const lines = stdout.trim().split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        let pid;
        if (isWindows) {
          const parts = line.trim().split(/\s+/);
          pid = parts[parts.length - 1];
        } else {
          const match = line.match(/(\d+)\//);
          pid = match ? match[1] : null;
        }
        
        if (pid && pid !== '0') {
          pids.add(pid);
        }
      });
      
      if (pids.size === 0) {
        log(`端口 ${port} 未找到进程`, 'yellow');
        resolve();
        return;
      }
      
      log(`正在停止端口 ${port} 的进程: ${Array.from(pids).join(', ')}`, 'yellow');
      
      const killPromises = Array.from(pids).map(pid => {
        return new Promise((killResolve) => {
          const killCommand = isWindows 
            ? `taskkill /f /pid ${pid}`
            : `kill -9 ${pid}`;
          
          exec(killCommand, (killError) => {
            if (killError) {
              log(`无法停止进程 ${pid}: ${killError.message}`, 'red');
            } else {
              log(`进程 ${pid} 已停止`, 'green');
            }
            killResolve();
          });
        });
      });
      
      Promise.all(killPromises).then(() => {
        success(`端口 ${port} 的所有进程已停止`);
        resolve();
      });
    });
  });
}

// 主函数
async function main() {
  console.log(colors.yellow('\n🛑 正在停止所有服务...\n'));
  
  // 停止常用端口的服务
  const ports = [3000, 5173, 6000, 8080];
  
  for (const port of ports) {
    await killPort(port);
  }
  
  // 额外的清理命令
  if (isWindows) {
    // Windows额外清理
    const cleanupCommands = [
      'taskkill /f /im "node.exe" 2>nul',
      'taskkill /f /im "npm.exe" 2>nul'
    ];
    
    cleanupCommands.forEach(cmd => {
      exec(cmd, () => {}); // 静默执行
    });
  } else {
    // Linux/Mac额外清理
    const cleanupCommands = [
      'pkill -f "vite" 2>/dev/null',
      'pkill -f "npm.*dev" 2>/dev/null'
    ];
    
    cleanupCommands.forEach(cmd => {
      exec(cmd, () => {}); // 静默执行
    });
  }
  
  setTimeout(() => {
    success('所有服务已停止');
    console.log('\n提示: 如果仍有进程运行，请手动检查任务管理器');
  }, 2000);
}

main().catch(console.error);
