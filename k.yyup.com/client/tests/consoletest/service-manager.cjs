#!/usr/bin/env node

/**
 * 服务管理器
 * 
 * 功能：
 * 1. 启动/停止前后端服务
 * 2. 检查服务状态
 * 3. 等待服务就绪
 * 4. 服务健康检查
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');

class ServiceManager {
  constructor() {
    this.frontendProcess = null;
    this.backendProcess = null;
    this.config = {
      frontendPort: 5173,
      backendPort: 3000,
      frontendUrl: 'http://localhost:5173',
      backendUrl: 'http://localhost:3000'
    };
  }

  /**
   * 检查端口是否被占用
   */
  async checkPort(port) {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(port, () => {
        server.once('close', () => resolve(false));
        server.close();
      });
      server.on('error', () => resolve(true));
    });
  }

  /**
   * 等待服务响应
   */
  async waitForService(url, timeout = 60000) {
    const startTime = Date.now();
    console.log(`⏳ 等待服务响应: ${url}`);
    
    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(url);
        if (response.ok || response.status < 500) {
          console.log(`✅ 服务就绪: ${url}`);
          return true;
        }
      } catch (error) {
        // 服务还未启动，继续等待
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`❌ 服务超时: ${url}`);
    return false;
  }

  /**
   * 启动后端服务
   */
  async startBackend() {
    console.log('🚀 启动后端服务...');
    
    const backendPortInUse = await this.checkPort(this.config.backendPort);
    if (backendPortInUse) {
      console.log('✅ 后端服务已在运行');
      return true;
    }

    return new Promise((resolve, reject) => {
      const backendPath = path.resolve(__dirname, '../../../server');
      
      // 检查server目录是否存在
      if (!fs.existsSync(backendPath)) {
        console.error('❌ 后端目录不存在:', backendPath);
        resolve(false);
        return;
      }
      
      this.backendProcess = spawn('npm', ['run', 'dev'], {
        cwd: backendPath,
        stdio: 'pipe',
        shell: true
      });

      let resolved = false;

      this.backendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[后端] ${output.trim()}`);
        
        if (!resolved && (output.includes('Server running on') || output.includes('listening on'))) {
          resolved = true;
          resolve(true);
        }
      });

      this.backendProcess.stderr.on('data', (data) => {
        const error = data.toString().trim();
        if (error && !error.includes('DeprecationWarning')) {
          console.error(`[后端错误] ${error}`);
        }
      });

      this.backendProcess.on('error', (error) => {
        console.error('❌ 后端服务启动失败:', error);
        if (!resolved) {
          resolved = true;
          reject(error);
        }
      });

      this.backendProcess.on('exit', (code) => {
        console.log(`后端服务退出，代码: ${code}`);
        this.backendProcess = null;
      });

      // 超时处理
      setTimeout(() => {
        if (!resolved) {
          console.log('⏰ 后端服务启动超时，尝试继续...');
          resolved = true;
          resolve(false);
        }
      }, 30000);
    });
  }

  /**
   * 启动前端服务
   */
  async startFrontend() {
    console.log('🚀 启动前端服务...');
    
    const frontendPortInUse = await this.checkPort(this.config.frontendPort);
    if (frontendPortInUse) {
      console.log('✅ 前端服务已在运行');
      return true;
    }

    return new Promise((resolve, reject) => {
      const frontendPath = path.resolve(__dirname, '../../');
      
      this.frontendProcess = spawn('npm', ['run', 'dev'], {
        cwd: frontendPath,
        stdio: 'pipe',
        shell: true
      });

      let resolved = false;

      this.frontendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[前端] ${output.trim()}`);
        
        if (!resolved && (output.includes('Local:') || output.includes('ready in'))) {
          resolved = true;
          resolve(true);
        }
      });

      this.frontendProcess.stderr.on('data', (data) => {
        const error = data.toString().trim();
        if (error && !error.includes('DeprecationWarning')) {
          console.error(`[前端错误] ${error}`);
        }
      });

      this.frontendProcess.on('error', (error) => {
        console.error('❌ 前端服务启动失败:', error);
        if (!resolved) {
          resolved = true;
          reject(error);
        }
      });

      this.frontendProcess.on('exit', (code) => {
        console.log(`前端服务退出，代码: ${code}`);
        this.frontendProcess = null;
      });

      // 超时处理
      setTimeout(() => {
        if (!resolved) {
          console.log('⏰ 前端服务启动超时，尝试继续...');
          resolved = true;
          resolve(false);
        }
      }, 30000);
    });
  }

  /**
   * 启动所有服务
   */
  async startAll() {
    console.log('🚀 启动所有服务...\n');
    
    try {
      // 并行启动前后端服务
      const [backendStarted, frontendStarted] = await Promise.all([
        this.startBackend(),
        this.startFrontend()
      ]);
      
      console.log('\n⏳ 等待服务完全就绪...');
      
      // 等待服务响应
      const [backendReady, frontendReady] = await Promise.all([
        this.waitForService(this.config.backendUrl + '/api/health'),
        this.waitForService(this.config.frontendUrl)
      ]);
      
      if (backendReady && frontendReady) {
        console.log('\n🎉 所有服务已就绪！');
        return true;
      } else {
        console.log('\n⚠️ 部分服务可能未完全启动，但可以继续测试');
        return false;
      }
      
    } catch (error) {
      console.error('❌ 服务启动失败:', error);
      return false;
    }
  }

  /**
   * 停止所有服务
   */
  async stopAll() {
    console.log('🛑 停止所有服务...');
    
    if (this.frontendProcess) {
      console.log('停止前端服务...');
      this.frontendProcess.kill('SIGTERM');
      this.frontendProcess = null;
    }
    
    if (this.backendProcess) {
      console.log('停止后端服务...');
      this.backendProcess.kill('SIGTERM');
      this.backendProcess = null;
    }
    
    // 等待进程完全退出
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ 所有服务已停止');
  }

  /**
   * 检查服务状态
   */
  async checkStatus() {
    console.log('🔍 检查服务状态...\n');
    
    try {
      // 检查端口占用
      const frontendPortInUse = await this.checkPort(this.config.frontendPort);
      const backendPortInUse = await this.checkPort(this.config.backendPort);
      
      console.log(`前端端口 ${this.config.frontendPort}: ${frontendPortInUse ? '✅ 占用中' : '❌ 空闲'}`);
      console.log(`后端端口 ${this.config.backendPort}: ${backendPortInUse ? '✅ 占用中' : '❌ 空闲'}`);
      
      // 检查HTTP响应
      try {
        const frontendResponse = await fetch(this.config.frontendUrl);
        console.log(`前端服务: ${frontendResponse.ok ? '✅ 响应正常' : '⚠️ 响应异常'}`);
      } catch (error) {
        console.log(`前端服务: ❌ 无响应`);
      }
      
      try {
        const backendResponse = await fetch(this.config.backendUrl + '/api/health');
        console.log(`后端服务: ${backendResponse.ok ? '✅ 响应正常' : '⚠️ 响应异常'}`);
      } catch (error) {
        console.log(`后端服务: ❌ 无响应`);
      }
      
    } catch (error) {
      console.error('❌ 状态检查失败:', error);
    }
  }
}

// 命令行接口
async function main() {
  const serviceManager = new ServiceManager();
  const command = process.argv[2];
  
  switch (command) {
    case 'start':
      await serviceManager.startAll();
      // 保持进程运行
      process.on('SIGINT', async () => {
        console.log('\n收到中断信号，停止服务...');
        await serviceManager.stopAll();
        process.exit(0);
      });
      break;
      
    case 'stop':
      await serviceManager.stopAll();
      process.exit(0);
      break;
      
    case 'status':
      await serviceManager.checkStatus();
      process.exit(0);
      break;
      
    case 'restart':
      await serviceManager.stopAll();
      await new Promise(resolve => setTimeout(resolve, 3000));
      await serviceManager.startAll();
      break;
      
    default:
      console.log('用法:');
      console.log('  node service-manager.js start   - 启动所有服务');
      console.log('  node service-manager.js stop    - 停止所有服务');
      console.log('  node service-manager.js status  - 检查服务状态');
      console.log('  node service-manager.js restart - 重启所有服务');
      process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 服务管理器错误:', error);
    process.exit(1);
  });
}

module.exports = ServiceManager;
