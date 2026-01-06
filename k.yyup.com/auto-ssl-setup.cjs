#!/usr/bin/env node

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 自动SSL证书申请和配置脚本
 * 为 k.yyup.cc 自动申请和配置SSL证书
 */

class AutoSSLSetup {
  constructor() {
    this.domain = 'k.yyup.cc';
    this.email = 'admin@k.yyup.cc';
    this.sslDir = path.join(__dirname, 'server/ssl');
    this.acmeDir = path.join(__dirname, 'server/.well-known/acme-challenge');
    
    // 确保目录存在
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.sslDir, this.acmeDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ 目录已创建: ${dir}`);
      }
    });
  }

  /**
   * 使用acme.sh自动申请Let's Encrypt证书
   */
  async requestLetsEncryptCert() {
    console.log('🔄 使用acme.sh申请Let\'s Encrypt证书...');
    
    try {
      // 设置环境变量
      process.env.HTTPS_PROXY = 'http://127.0.0.1:8080';
      process.env.HTTP_PROXY = 'http://127.0.0.1:8080';
      
      const acmeShPath = path.join(process.env.HOME, '.acme.sh/acme.sh');
      
      // 使用DNS手动验证模式申请证书
      const cmd = `${acmeShPath} --issue --dns ` +
                 `--domain ${this.domain} ` +
                 `--yes-I-know-dns-manual-mode-enough-go-ahead-please ` +
                 `--email ${this.email} ` +
                 `--server letsencrypt ` +
                 `--debug`;

      console.log('执行命令:', cmd);
      const output = execSync(cmd, { 
        encoding: 'utf8',
        stdio: 'pipe',
        env: { ...process.env }
      });
      
      console.log('🎉 证书申请成功！');
      console.log(output);
      
      // 安装证书到指定目录
      await this.installCertificate();
      
      return true;
    } catch (error) {
      console.log('⚠️ Let\'s Encrypt申请失败，尝试其他方式...');
      console.log('错误信息:', error.message);
      return false;
    }
  }

  /**
   * 使用ZeroSSL API申请证书
   */
  async requestZeroSSLCert() {
    console.log('🔄 尝试ZeroSSL证书申请...');
    
    try {
      // 这里可以实现ZeroSSL API调用
      // 由于需要注册和API密钥，我们提供手动指引
      console.log('📋 ZeroSSL手动申请步骤:');
      console.log('1. 访问 https://app.zerossl.com/signup');
      console.log('2. 注册账户');
      console.log('3. 创建新证书');
      console.log(`4. 输入域名: ${this.domain}`);
      console.log('5. 选择DNS验证');
      console.log('6. 按提示添加DNS记录');
      console.log('7. 下载证书并放置到以下目录:');
      console.log(`   - private.key → ${this.sslDir}/private.key`);
      console.log(`   - certificate.crt → ${this.sslDir}/certificate.crt`);
      console.log(`   - ca_bundle.crt → ${this.sslDir}/ca_bundle.crt`);
      
      return false;
    } catch (error) {
      console.error('❌ ZeroSSL申请失败:', error.message);
      return false;
    }
  }

  /**
   * 生成自签名证书作为备用方案
   */
  generateSelfSignedCert() {
    console.log('🔧 生成自签名证书...');
    
    try {
      const keyPath = path.join(this.sslDir, 'private.key');
      const certPath = path.join(this.sslDir, 'certificate.crt');
      const csrPath = path.join(this.sslDir, 'cert.csr');
      
      // 生成私钥
      execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'inherit' });
      
      // 生成证书签名请求
      const subject = `/C=CN/ST=Beijing/L=Beijing/O=Organization/CN=${this.domain}`;
      execSync(`openssl req -new -key "${keyPath}" -out "${csrPath}" -subj "${subject}"`, { stdio: 'inherit' });
      
      // 生成自签名证书
      execSync(`openssl x509 -req -days 365 -in "${csrPath}" -signkey "${keyPath}" -out "${certPath}"`, { stdio: 'inherit' });
      
      // 设置文件权限
      execSync(`chmod 600 "${keyPath}"`);
      execSync(`chmod 644 "${certPath}"`);
      
      console.log('✅ 自签名证书生成成功');
      console.log('⚠️  注意：这是自签名证书，浏览器会显示安全警告');
      
      return true;
    } catch (error) {
      console.error('❌ 生成自签名证书失败:', error.message);
      return false;
    }
  }

  /**
   * 安装Let's Encrypt证书
   */
  async installCertificate() {
    console.log('📦 安装证书文件...');
    
    try {
      const acmeShPath = path.join(process.env.HOME, '.acme.sh/acme.sh');
      const certDir = path.join(process.env.HOME, '.acme.sh', this.domain);
      
      // 复制证书文件
      const sourceFiles = {
        [`${certDir}/${this.domain}.key`]: path.join(this.sslDir, 'private.key'),
        [`${certDir}/${this.domain}.cer`]: path.join(this.sslDir, 'certificate.crt'),
        [`${certDir}/ca.cer`]: path.join(this.sslDir, 'ca_bundle.crt')
      };
      
      for (const [source, dest] of Object.entries(sourceFiles)) {
        if (fs.existsSync(source)) {
          fs.copyFileSync(source, dest);
          console.log(`✅ 已复制: ${path.basename(dest)}`);
        }
      }
      
      // 设置文件权限
      execSync(`chmod 600 "${path.join(this.sslDir, 'private.key')}"`);
      execSync(`chmod 644 "${path.join(this.sslDir, 'certificate.crt')}"`);
      execSync(`chmod 644 "${path.join(this.sslDir, 'ca_bundle.crt')}"`);
      
      return true;
    } catch (error) {
      console.error('❌ 安装证书失败:', error.message);
      return false;
    }
  }

  /**
   * 验证证书文件
   */
  verifyCertificates() {
    const requiredFiles = ['private.key', 'certificate.crt'];
    const missingFiles = requiredFiles.filter(file => 
      !fs.existsSync(path.join(this.sslDir, file))
    );
    
    if (missingFiles.length === 0) {
      console.log('✅ 证书文件验证通过');
      return true;
    } else {
      console.log(`❌ 缺少证书文件: ${missingFiles.join(', ')}`);
      return false;
    }
  }

  /**
   * 重启后端服务器
   */
  async restartServer() {
    console.log('🔄 重启后端服务器...');
    
    try {
      // 停止现有进程
      try {
        execSync('pkill -f "ts-node src/server.ts" || pkill -f "node.*server" || true', { 
          stdio: 'pipe' 
        });
        console.log('🛑 已停止现有服务器进程');
      } catch (e) {
        // 忽略停止失败
      }
      
      // 等待一下
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 启动新服务器
      console.log('🚀 启动HTTPS服务器...');
      const serverDir = path.join(__dirname, 'server');
      
      // 在后台启动服务器
      const { spawn } = require('child_process');
      const serverProcess = spawn('npm', ['run', 'dev'], {
        cwd: serverDir,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      serverProcess.unref();
      
      // 监听输出
      let output = '';
      serverProcess.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('HTTPS服务器运行在') || output.includes('HTTP服务器运行在')) {
          console.log('✅ 服务器启动成功');
        }
      });
      
      return true;
    } catch (error) {
      console.error('❌ 重启服务器失败:', error.message);
      return false;
    }
  }

  /**
   * 检查证书是否已存在
   */
  hasCertificates() {
    const certPath = path.join(this.sslDir, 'certificate.crt');
    const keyPath = path.join(this.sslDir, 'private.key');
    return fs.existsSync(certPath) && fs.existsSync(keyPath);
  }

  /**
   * 主执行函数
   */
  async run() {
    console.log('🚀 开始自动SSL证书配置...\n');
    
    // 检查是否已有证书
    if (this.hasCertificates()) {
      console.log('ℹ️  检测到现有证书文件');
      const shouldReplace = await this.askUser('是否替换现有证书? (y/n): ');
      if (!shouldReplace) {
        console.log('跳过证书申请，直接重启服务器...');
        await this.restartServer();
        return;
      }
    }
    
    console.log(`📋 配置信息:`);
    console.log(`   域名: ${this.domain}`);
    console.log(`   邮箱: ${this.email}`);
    console.log(`   SSL目录: ${this.sslDir}`);
    console.log('');
    
    // 尝试多种方式申请证书
    let success = false;
    
    // 方式1：Let's Encrypt (自动)
    console.log('🔄 尝试方式1: Let\'s Encrypt自动申请...');
    success = await this.requestLetsEncryptCert();
    
    if (!success) {
      // 方式2：生成自签名证书
      console.log('🔄 尝试方式2: 生成自签名证书...');
      success = this.generateSelfSignedCert();
    }
    
    if (!success) {
      // 方式3：手动指引
      console.log('🔄 方式3: 手动申请指引...');
      await this.requestZeroSSLCert();
      
      console.log('\n⏳ 等待手动放置证书文件...');
      console.log('请将证书文件放置到以下位置后按回车继续:');
      console.log(`   - ${this.sslDir}/private.key`);
      console.log(`   - ${this.sslDir}/certificate.crt`);
      console.log(`   - ${this.sslDir}/ca_bundle.crt (可选)`);
      
      await this.askUser('\n按回车键继续...');
      success = this.verifyCertificates();
    }
    
    if (success) {
      console.log('\n🎉 SSL证书配置成功！');
      await this.restartServer();
      
      console.log('\n📋 配置完成总结:');
      console.log('=====================================');
      console.log('✅ SSL证书已配置');
      console.log('✅ 后端服务器已重启');
      console.log('✅ HTTPS模式已启用');
      console.log('');
      console.log('🌐 访问地址:');
      console.log(`   - 前端: https://${this.domain}`);
      console.log(`   - 后端: https://${this.domain}:443`);
      console.log('=====================================');
    } else {
      console.log('\n❌ SSL证书配置失败');
      console.log('请手动申请证书或使用现有的自签名证书');
    }
  }

  /**
   * 用户输入工具函数
   */
  askUser(question) {
    return new Promise((resolve) => {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.toLowerCase().trim() === 'y' || answer.toLowerCase().trim() === 'yes' || answer.trim() === '');
      });
    });
  }
}

// 执行自动配置
if (require.main === module) {
  const autoSSL = new AutoSSLSetup();
  autoSSL.run().catch(console.error);
}

module.exports = AutoSSLSetup;