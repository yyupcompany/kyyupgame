#!/usr/bin/env node

/**
 * 服务状态检查脚本
 * 检查前后端服务运行状态
 */

const { exec } = require('child_process');
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
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

// 检查端口是否被占用
function checkPort(port) {
  return new Promise((resolve) => {
    const command = isWindows 
      ? `netstat -ano | findstr ":${port} "`
      : `netstat -tulpn | grep ":${port} "`;
    
    exec(command, (error, stdout) => {
      if (error || !stdout.trim()) {
        resolve({ running: false, pid: null });
        return;
      }
      
      const lines = stdout.trim().split('\n');
      const pids = [];
      
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
          pids.push(pid);
        }
      });
      
      resolve({ 
        running: pids.length > 0, 
        pid: pids.length > 0 ? pids[0] : null,
        allPids: pids
      });
    });
  });
}

// 检查HTTP服务是否响应
function checkHttpService(port, path = '/') {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: 'GET',
      timeout: 3000
    };
    
    const req = http.request(options, (res) => {
      resolve({ 
        responding: true, 
        statusCode: res.statusCode,
        statusMessage: res.statusMessage
      });
    });
    
    req.on('error', () => {
      resolve({ responding: false });
    });
    
    req.on('timeout', () => {
      resolve({ responding: false });
    });
    
    req.end();
  });
}

// 获取进程信息
function getProcessInfo(pid) {
  return new Promise((resolve) => {
    if (!pid) {
      resolve(null);
      return;
    }
    
    const command = isWindows 
      ? `tasklist /fi "PID eq ${pid}" /fo csv`
      : `ps -p ${pid} -o pid,ppid,cmd --no-headers`;
    
    exec(command, (error, stdout) => {
      if (error) {
        resolve(null);
        return;
      }
      
      if (isWindows) {
        const lines = stdout.trim().split('\n');
        if (lines.length > 1) {
          const data = lines[1].split(',');
          resolve({
            name: data[0]?.replace(/"/g, ''),
            memory: data[4]?.replace(/"/g, '')
          });
        } else {
          resolve(null);
        }
      } else {
        const line = stdout.trim();
        if (line) {
          const parts = line.split(/\s+/);
          resolve({
            pid: parts[0],
            ppid: parts[1],
            cmd: parts.slice(2).join(' ')
          });
        } else {
          resolve(null);
        }
      }
    });
  });
}

// 主函数
async function main() {
  console.log(colors.bold('\n📊 幼儿园管理系统 - 服务状态检查\n'));

  // 先检查 PM2 状态
  try {
    const { execSync } = require('child_process');
    const pm2Status = execSync('pm2 status --no-daemon 2>&1', { encoding: 'utf-8' });

    // 如果 PM2 有运行的进程
    if (pm2Status && !pm2Status.includes('online') && !pm2Status.includes('stopped')) {
      console.log('PM2 进程管理器状态:');
      console.log(pm2Status);
      console.log('');
    }
  } catch (e) {
    // PM2 未运行或未安装，忽略
  }
  
  const services = [
    { name: '后端API服务', port: 3000, path: '/api/health' },
    { name: '前端Web服务', port: 5173, path: '/' }
  ];
  
  console.log('='.repeat(60));
  
  for (const service of services) {
    console.log(`\n🔍 检查 ${colors.cyan(service.name)} (端口 ${service.port})`);
    
    // 检查端口占用
    const portStatus = await checkPort(service.port);
    
    if (!portStatus.running) {
      console.log(`   状态: ${colors.red('未运行')}`);
      console.log(`   端口: ${colors.red('未占用')}`);
      continue;
    }
    
    console.log(`   端口: ${colors.green('已占用')} (PID: ${portStatus.pid})`);
    
    // 检查HTTP响应
    const httpStatus = await checkHttpService(service.port, service.path);
    
    if (httpStatus.responding) {
      console.log(`   HTTP: ${colors.green('响应正常')} (${httpStatus.statusCode})`);
    } else {
      console.log(`   HTTP: ${colors.yellow('无响应或超时')}`);
    }
    
    // 获取进程信息
    const processInfo = await getProcessInfo(portStatus.pid);
    if (processInfo) {
      if (isWindows) {
        console.log(`   进程: ${processInfo.name} (内存: ${processInfo.memory})`);
      } else {
        console.log(`   进程: ${processInfo.cmd}`);
      }
    }
    
    // 显示所有相关PID
    if (portStatus.allPids.length > 1) {
      console.log(`   相关PID: ${portStatus.allPids.join(', ')}`);
    }
    
    console.log(`   状态: ${colors.green('运行中')}`);
  }
  
  console.log('\n' + '='.repeat(60));
  
  // 显示访问地址
  const backendStatus = await checkPort(3000);
  const frontendStatus = await checkPort(5173);
  
  if (backendStatus.running || frontendStatus.running) {
    console.log('\n📍 访问地址:');
    
    if (frontendStatus.running) {
      console.log(`   前端应用: ${colors.cyan('http://localhost:5173/')}`);
      console.log(`   网络访问: ${colors.cyan('http://192.168.1.56:5173/')}`);
    }
    
    if (backendStatus.running) {
      console.log(`   后端API:  ${colors.cyan('http://localhost:3000/api')}`);
    }
  }
  
  // 显示系统信息
  console.log('\n💻 系统信息:');
  console.log(`   操作系统: ${os.platform()} ${os.arch()}`);
  console.log(`   Node版本: ${process.version}`);
  console.log(`   内存使用: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`);
  
  console.log('\n');
}

main().catch(console.error);
