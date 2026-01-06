#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * 自动化SSL证书申请工具
 * 为 k.yyup.cc 申请免费SSL证书
 */

const DOMAIN = 'k.yyup.cc';
const SSL_DIR = path.join(__dirname, 'ssl');

class SSLSetup {
  constructor() {
    this.domain = DOMAIN;
    this.sslDir = SSL_DIR;
    
    // 确保SSL目录存在
    if (!fs.existsSync(this.sslDir)) {
      fs.mkdirSync(this.sslDir, { recursive: true });
    }
  }

  /**
   * 检查域名是否可访问
   */
  async checkDomain() {
    console.log(`🔍 检查域名 ${this.domain} 是否可访问...`);
    
    return new Promise((resolve) => {
      const req = https.request({
        hostname: this.domain,
        port: 443,
        path: '/health',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        console.log(`✅ 域名 ${this.domain} 可访问 (状态码: ${res.statusCode})`);
        resolve(true);
      });

      req.on('error', (err) => {
        console.log(`⚠️  域名 ${this.domain} 暂时无法通过HTTPS访问: ${err.message}`);
        resolve(false);
      });

      req.on('timeout', () => {
        console.log(`⚠️  域名 ${this.domain} 访问超时`);
        req.destroy();
        resolve(false);
      });

      req.end();
    });
  }

  /**
   * 创建验证文件
   */
  createVerificationFile(fileName, content) {
    const challengeDir = path.join(__dirname, '.well-known/acme-challenge');
    const filePath = path.join(challengeDir, fileName);
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ 验证文件已创建: ${filePath}`);
    
    return filePath;
  }

  /**
   * 生成自签名证书用于测试
   */
  generateSelfSignedCert() {
    console.log('🔧 生成临时自签名证书用于开发...');
    
    const { execSync } = require('child_process');
    
    try {
      // 生成私钥
      execSync(`openssl genrsa -out ${this.sslDir}/private.key 2048`, { stdio: 'inherit' });
      
      // 生成证书签名请求
      const subject = `/C=CN/ST=State/L=City/O=Organization/CN=${this.domain}`;
      execSync(`openssl req -new -key ${this.sslDir}/private.key -out ${this.sslDir}/cert.csr -subj "${subject}"`, { stdio: 'inherit' });
      
      // 生成自签名证书
      execSync(`openssl x509 -req -days 365 -in ${this.sslDir}/cert.csr -signkey ${this.sslDir}/private.key -out ${this.sslDir}/certificate.crt`, { stdio: 'inherit' });
      
      console.log('✅ 自签名证书生成成功');
      console.log('⚠️  注意：这是自签名证书，浏览器会显示安全警告');
      
      return true;
    } catch (error) {
      console.error('❌ 生成自签名证书失败:', error.message);
      return false;
    }
  }

  /**
   * 显示证书申请说明
   */
  showInstructions() {
    console.log('\n📋 SSL证书申请说明:');
    console.log('=====================================');
    console.log('1. 访问 https://www.sslforfree.com/');
    console.log(`2. 输入域名: ${this.domain}`);
    console.log('3. 选择免费计划');
    console.log('4. 选择 HTTP 验证方式');
    console.log('5. 下载验证文件并放置到:');
    console.log(`   ${path.join(__dirname, '.well-known/acme-challenge/')}`);
    console.log('6. 完成验证后下载证书文件');
    console.log('7. 将证书文件重命名并放置到:');
    console.log(`   - private.key → ${this.sslDir}/private.key`);
    console.log(`   - certificate.crt → ${this.sslDir}/certificate.crt`);
    console.log(`   - ca_bundle.crt → ${this.sslDir}/ca_bundle.crt`);
    console.log('=====================================\n');
  }

  /**
   * 主执行函数
   */
  async run() {
    console.log('🚀 开始SSL证书配置流程...\n');
    
    // 检查域名可访问性
    const domainAccessible = await this.checkDomain();
    
    // 显示申请说明
    this.showInstructions();
    
    // 询问是否生成临时证书
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('是否生成临时自签名证书用于开发测试？ (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        this.generateSelfSignedCert();
      }
      
      console.log('\n✅ SSL配置流程完成');
      console.log('💡 配置证书文件后，重启服务器即可启用HTTPS');
      
      rl.close();
    });
  }
}

// 执行配置
if (require.main === module) {
  const sslSetup = new SSLSetup();
  sslSetup.run().catch(console.error);
}

module.exports = SSLSetup;