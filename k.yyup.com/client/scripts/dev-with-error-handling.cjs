#!/usr/bin/env node

/**
 * 前端开发服务器 - 带异常监测和自动重启功能
 * 防止服务因为错误而退出，提供稳定的开发环境
 */

const { spawn } = require('child_process');
const path = require('path');

// 简单的颜色输出函数
const colors = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

class FrontendDevServer {
  constructor() {
    this.process = null;
    this.restartCount = 0;
    this.maxRestarts = 10;
    this.isShuttingDown = false;
    this.restartTimeout = null;
    
    // 监听进程退出信号
    process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
    process.on('uncaughtException', (error) => this.handleUncaughtException(error));
    process.on('unhandledRejection', (reason, promise) => this.handleUnhandledRejection(reason, promise));
  }

  /**
   * 启动前端服务
   */
  async start() {
    console.log(colors.blue('🚀 启动前端开发服务器...'));
    console.log(colors.gray(`📍 工作目录: ${process.cwd()}`));
    console.log(colors.gray(`⏰ 启动时间: ${new Date().toLocaleString()}`));
    
    try {
      // 先清理端口
      await this.killPorts();
      
      // 启动Vite服务
      this.startViteServer();
      
    } catch (error) {
      console.error(colors.red('❌ 启动失败:'), error.message);
      this.scheduleRestart('启动失败');
    }
  }

  /**
   * 清理端口
   */
  async killPorts() {
    return new Promise((resolve) => {
      console.log(colors.yellow('🔍 清理端口占用...'));
      
      const killScript = spawn('bash', [path.join(__dirname, 'kill-ports.sh')], {
        stdio: 'inherit'
      });

      killScript.on('close', (code) => {
        if (code === 0) {
          console.log(colors.green('✅ 端口清理完成'));
        } else {
          console.log(colors.yellow('⚠️ 端口清理可能有问题，继续启动...'));
        }
        resolve();
      });

      killScript.on('error', (error) => {
        console.log(colors.yellow('⚠️ 端口清理脚本执行失败，继续启动...'), error.message);
        resolve(); // 不阻塞启动过程
      });
    });
  }

  /**
   * 启动Vite服务器
   */
  startViteServer() {
    if (this.isShuttingDown) return;

    console.log(colors.blue('🔧 启动Vite开发服务器...'));
    
    try {
      this.process = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5173'], {
        stdio: ['inherit', 'pipe', 'pipe'],
        env: {
          ...process.env,
          NODE_ENV: 'development',
          FORCE_COLOR: '1'
        }
      });

      // 处理标准输出
      this.process.stdout.on('data', (data) => {
        const output = data.toString();
        process.stdout.write(output);
        
        // 检测服务启动成功
        if (output.includes('Local:') || output.includes('ready in')) {
          console.log(colors.green('✅ 前端服务启动成功!'));
          this.restartCount = 0; // 重置重启计数
        }
      });

      // 处理错误输出
      this.process.stderr.on('data', (data) => {
        const error = data.toString();
        
        // 区分警告和错误
        if (this.isWarning(error)) {
          console.log(colors.yellow('⚠️ 警告:'), error.trim());
        } else if (this.isFatalError(error)) {
          console.error(colors.red('💥 严重错误:'), error.trim());
          this.scheduleRestart('严重错误');
        } else {
          console.error(colors.red('❌ 错误:'), error.trim());
          // 对于一般错误，不立即重启，但记录
        }
      });

      // 处理进程退出
      this.process.on('close', (code, signal) => {
        this.handleProcessClose(code, signal);
      });

      // 处理进程错误
      this.process.on('error', (error) => {
        console.error(colors.red('💥 进程错误:'), error.message);
        this.scheduleRestart('进程错误');
      });

      console.log(colors.blue(`📊 Vite进程ID: ${this.process.pid}`));
      
    } catch (error) {
      console.error(colors.red('❌ 启动Vite失败:'), error.message);
      this.scheduleRestart('Vite启动失败');
    }
  }

  /**
   * 处理进程关闭
   */
  handleProcessClose(code, signal) {
    if (this.isShuttingDown) {
      console.log(colors.green('✅ 服务已正常关闭'));
      return;
    }

    if (code === 0) {
      console.log(colors.green('✅ 服务正常退出'));
    } else {
      console.error(colors.red(`❌ 服务异常退出: code=${code}, signal=${signal}`));
      this.scheduleRestart(`异常退出 (code=${code}, signal=${signal})`);
    }
  }

  /**
   * 判断是否为警告信息
   */
  isWarning(message) {
    const warningPatterns = [
      /warning:/i,
      /deprecated/i,
      /\[hmr\]/i,
      /sourcemap/i,
      /peer dep/i
    ];
    
    return warningPatterns.some(pattern => pattern.test(message));
  }

  /**
   * 判断是否为严重错误
   */
  isFatalError(message) {
    const fatalPatterns = [
      /EADDRINUSE/i,
      /port.*already in use/i,
      /Cannot resolve/i,
      /Module not found/i,
      /Syntax error/i,
      /Transform failed/i,
      /Build failed/i,
      /ENOENT.*vite/i
    ];
    
    return fatalPatterns.some(pattern => pattern.test(message));
  }

  /**
   * 调度重启
   */
  scheduleRestart(reason) {
    if (this.isShuttingDown) return;
    
    if (this.restartCount >= this.maxRestarts) {
      console.error(colors.red(`💥 已达到最大重启次数 (${this.maxRestarts})，停止自动重启`));
      console.error(colors.red('请检查错误原因后手动重启服务'));
      return;
    }

    this.restartCount++;
    const delay = Math.min(5000 * this.restartCount, 30000); // 渐进式延迟，最多30秒
    
    console.log(colors.yellow(`🔄 将在 ${delay/1000} 秒后重启服务 (第${this.restartCount}次重启)`));
    console.log(colors.gray(`重启原因: ${reason}`));
    
    // 清理现有的重启定时器
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
    }
    
    this.restartTimeout = setTimeout(() => {
      console.log(colors.blue('🔄 正在重启服务...'));
      this.cleanup();
      this.start();
    }, delay);
  }

  /**
   * 处理未捕获的异常
   */
  handleUncaughtException(error) {
    console.error(colors.red('💥 未捕获的异常:'), error.message);
    console.error(colors.red('Stack trace:'), error.stack);
    
    // 不立即退出，而是尝试重启
    console.log(colors.yellow('⚠️ 程序将尝试重启以恢复服务...'));
    this.scheduleRestart('未捕获的异常');
  }

  /**
   * 处理未处理的Promise拒绝
   */
  handleUnhandledRejection(reason, promise) {
    console.error(colors.red('💥 未处理的Promise拒绝:'), reason);
    
    // 不立即退出，而是记录并继续运行
    console.log(colors.yellow('⚠️ 服务将继续运行，但请检查上述错误'));
  }

  /**
   * 优雅关闭
   */
  gracefulShutdown(signal) {
    if (this.isShuttingDown) return;
    
    console.log(colors.yellow(`\n🛑 接收到信号 ${signal}，正在优雅关闭...`));
    this.isShuttingDown = true;
    
    // 清理重启定时器
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    
    this.cleanup();
    
    // 给进程一些时间来清理
    setTimeout(() => {
      console.log(colors.green('✅ 服务已关闭'));
      process.exit(0);
    }, 2000);
  }

  /**
   * 清理资源
   */
  cleanup() {
    if (this.process && !this.process.killed) {
      console.log(colors.yellow('🧹 正在清理Vite进程...'));
      
      try {
        // 先尝试优雅关闭
        this.process.kill('SIGTERM');
        
        // 如果5秒后还没关闭，强制杀死
        setTimeout(() => {
          if (this.process && !this.process.killed) {
            console.log(colors.yellow('🔥 强制终止Vite进程...'));
            this.process.kill('SIGKILL');
          }
        }, 5000);
        
      } catch (error) {
        console.error(colors.red('❌ 清理进程时出错:'), error.message);
      }
    }
    
    this.process = null;
  }

  /**
   * 显示状态信息
   */
  showStatus() {
    console.log(colors.blue('\n📊 服务状态:'));
    console.log(colors.gray(`├─ 重启次数: ${this.restartCount}/${this.maxRestarts}`));
    console.log(colors.gray(`├─ 进程ID: ${this.process ? this.process.pid : '无'}`));
    console.log(colors.gray(`├─ 运行状态: ${this.process ? '运行中' : '已停止'}`));
    console.log(colors.gray(`└─ 启动时间: ${new Date().toLocaleString()}`));
  }
}

// 启动服务
async function main() {
  const server = new FrontendDevServer();

  // 显示欢迎信息
  console.log(colors.blue('🎯 前端开发服务器 (带异常监测)'));
  console.log(colors.gray('═'.repeat(50)));
  console.log(colors.green('✅ 自动重启: 启用'));
  console.log(colors.green('✅ 异常监测: 启用'));
  console.log(colors.green('✅ 端口清理: 启用'));
  console.log(colors.gray('═'.repeat(50)));

  // 启动服务
  await server.start();

  // 定期显示状态信息 (每5分钟)
  setInterval(() => {
    if (!server.isShuttingDown) {
      server.showStatus();
    }
  }, 5 * 60 * 1000);
}

// 运行主函数
main().catch(error => {
  console.error(colors.red('💥 启动失败:'), error);
  process.exit(1);
});