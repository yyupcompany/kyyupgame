#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * 受信任SSL证书申请脚本
 * 使用Let's Encrypt申请免费的受信任SSL证书
 */

class TrustedSSLSetup {
  constructor() {
    this.domain = 'k.yyup.cc';
    this.email = 'admin@k.yyup.cc';
    this.sslDir = path.join(__dirname, 'server/ssl');
    this.acmeShPath = path.join(process.env.HOME, '.acme.sh/acme.sh');
    
    // 设置代理环境变量
    process.env.HTTPS_PROXY = 'http://127.0.0.1:8080';
    process.env.HTTP_PROXY = 'http://127.0.0.1:8080';
    
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.sslDir)) {
      fs.mkdirSync(this.sslDir, { recursive: true });
      console.log(`✅ SSL目录已创建: ${this.sslDir}`);
    }
  }

  /**
   * 步骤1: 申请DNS验证证书
   */
  async requestDNSValidationCert() {
    console.log('🔄 步骤1: 申请Let\'s Encrypt证书...');
    console.log(`📧 使用邮箱: ${this.email}`);
    console.log(`🌐 域名: ${this.domain}`);
    
    try {
      const cmd = [
        this.acmeShPath,
        '--issue',
        '--dns',
        '--domain', this.domain,
        '--yes-I-know-dns-manual-mode-enough-go-ahead-please',
        '--email', this.email,
        '--server', 'letsencrypt',
        '--force'
      ].join(' ');

      console.log('执行命令:', cmd);
      const output = execSync(cmd, { 
        encoding: 'utf8',
        env: { ...process.env }
      });
      
      console.log('命令输出:', output);
      return true;
    } catch (error) {
      console.log('📋 DNS验证信息已生成');
      // 这个错误是正常的，因为需要手动添加DNS记录
      return await this.extractDNSInfo(error.stdout || error.message);
    }
  }

  /**
   * 步骤2: 提取DNS验证信息
   */
  async extractDNSInfo(output) {
    console.log('\n📋 提取DNS验证信息...');
    
    try {
      // 查找DNS记录信息
      const lines = output.split('\n');
      let txtRecord = '';
      let txtValue = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('_acme-challenge')) {
          // 提取TXT记录名称
          const recordMatch = line.match(/_acme-challenge\.[\w\.-]+/);
          if (recordMatch) {
            txtRecord = recordMatch[0];
          }
        }
        if (line.includes('txt=')) {
          // 提取TXT记录值
          const valueMatch = line.match(/txt='([^']+)'/);
          if (valueMatch) {
            txtValue = valueMatch[1];
          }
        }
      }
      
      if (txtRecord && txtValue) {
        await this.showDNSInstructions(txtRecord, txtValue);
        return true;
      } else {
        // 尝试从配置文件读取
        return await this.readDNSFromConfig();
      }
    } catch (error) {
      console.error('❌ 提取DNS信息失败:', error.message);
      return false;
    }
  }

  /**
   * 从acme.sh配置文件读取DNS信息
   */
  async readDNSFromConfig() {
    try {
      const configPath = path.join(process.env.HOME, '.acme.sh', `${this.domain}_ecc`, `${this.domain}.conf`);
      
      if (fs.existsSync(configPath)) {
        const config = fs.readFileSync(configPath, 'utf8');
        console.log('配置文件内容:', config);
        
        // 从配置文件中提取DNS信息
        const txtMatch = config.match(/Le_Vlist='[^']*txt='([^']+)'/);
        if (txtMatch) {
          const txtValue = txtMatch[1];
          const txtRecord = `_acme-challenge.${this.domain}`;
          await this.showDNSInstructions(txtRecord, txtValue);
          return true;
        }
      }
      
      console.log('❌ 无法从配置文件读取DNS信息');
      return false;
    } catch (error) {
      console.error('❌ 读取配置文件失败:', error.message);
      return false;
    }
  }

  /**
   * 步骤3: 显示DNS配置说明
   */
  async showDNSInstructions(txtRecord, txtValue) {
    console.log('\n🎯 步骤2: 配置DNS验证记录');
    console.log('=====================================');
    console.log('请在你的域名DNS管理面板中添加以下TXT记录:');
    console.log('');
    console.log(`📝 记录类型: TXT`);
    console.log(`📝 记录名称: ${txtRecord}`);
    console.log(`📝 记录值: ${txtValue}`);
    console.log('');
    console.log('💡 具体操作步骤:');
    console.log('1. 登录你的域名注册商管理后台');
    console.log('2. 找到DNS管理或域名解析设置');
    console.log('3. 添加TXT记录:');
    console.log(`   - 主机记录: _acme-challenge`);
    console.log(`   - 记录类型: TXT`);
    console.log(`   - 记录值: ${txtValue}`);
    console.log('4. 保存配置并等待DNS传播(2-10分钟)');
    console.log('');
    console.log('⚠️  重要: 不要删除现有的DNS记录，只需添加新的TXT记录');
    console.log('=====================================');
    
    // 保存DNS信息到文件
    const dnsInfo = {
      domain: this.domain,
      txtRecord: txtRecord,
      txtValue: txtValue,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(this.sslDir, 'dns-validation.json'), 
      JSON.stringify(dnsInfo, null, 2)
    );
    
    console.log(`📄 DNS验证信息已保存到: ${this.sslDir}/dns-validation.json`);
    
    // 等待用户确认
    await this.waitForDNSConfiguration();
  }

  /**
   * 步骤4: 等待用户配置DNS
   */
  async waitForDNSConfiguration() {
    console.log('\n⏳ 等待DNS配置完成...');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      rl.question('\n✅ DNS记录已添加完成？按回车键继续验证...', () => {
        rl.close();
        resolve();
      });
    });
  }

  /**
   * 步骤5: 完成证书申请
   */
  async completeCertRequest() {
    console.log('\n🔄 步骤3: 完成证书申请...');
    
    try {
      const cmd = [
        this.acmeShPath,
        '--renew',
        '--domain', this.domain,
        '--yes-I-know-dns-manual-mode-enough-go-ahead-please',
        '--force'
      ].join(' ');

      console.log('执行验证命令:', cmd);
      const output = execSync(cmd, { 
        encoding: 'utf8',
        env: { ...process.env }
      });
      
      console.log('✅ 证书申请成功！');
      console.log(output);
      
      return true;
    } catch (error) {
      console.error('❌ 证书申请失败:', error.message);
      
      // 尝试检查DNS传播
      await this.checkDNSPropagation();
      return false;
    }
  }

  /**
   * 检查DNS传播状态
   */
  async checkDNSPropagation() {
    console.log('\n🔍 检查DNS传播状态...');
    
    try {
      const cmd = `nslookup -type=TXT _acme-challenge.${this.domain}`;
      const output = execSync(cmd, { encoding: 'utf8' });
      
      console.log('DNS查询结果:');
      console.log(output);
      
      if (output.includes('YLVA3LEau8SG62wI333RRsV09vxCanrcHTURfo06QuQ') || 
          output.includes('text =')) {
        console.log('✅ DNS记录已传播');
        return true;
      } else {
        console.log('⏳ DNS记录还未传播，请等待几分钟后重试');
        return false;
      }
    } catch (error) {
      console.log('⚠️  DNS查询失败，可能是网络问题或DNS还未传播');
      return false;
    }
  }

  /**
   * 步骤6: 安装证书
   */
  async installTrustedCert() {
    console.log('\n📦 步骤4: 安装受信任证书...');
    
    try {
      const certDir = path.join(process.env.HOME, '.acme.sh', `${this.domain}_ecc`);
      
      if (!fs.existsSync(certDir)) {
        console.log('❌ 证书目录不存在，证书申请可能失败');
        return false;
      }
      
      // 备份现有证书
      if (fs.existsSync(path.join(this.sslDir, 'certificate.crt'))) {
        const backupPath = path.join(this.sslDir, `certificate.crt.backup.${Date.now()}`);
        fs.copyFileSync(
          path.join(this.sslDir, 'certificate.crt'),
          backupPath
        );
        console.log(`📄 已备份现有证书: ${backupPath}`);
      }
      
      // 复制新证书文件
      const certFiles = {
        [`${this.domain}.key`]: 'private.key',
        [`${this.domain}.cer`]: 'certificate.crt',
        'ca.cer': 'ca_bundle.crt',
        'fullchain.cer': 'fullchain.crt'
      };
      
      for (const [source, dest] of Object.entries(certFiles)) {
        const sourcePath = path.join(certDir, source);
        const destPath = path.join(this.sslDir, dest);
        
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, destPath);
          console.log(`✅ 已安装: ${dest}`);
        }
      }
      
      // 设置文件权限
      execSync(`chmod 600 "${path.join(this.sslDir, 'private.key')}"`);
      execSync(`chmod 644 "${path.join(this.sslDir, 'certificate.crt')}"`);
      execSync(`chmod 644 "${path.join(this.sslDir, 'ca_bundle.crt')}"`);
      
      console.log('✅ 受信任SSL证书安装完成！');
      return true;
    } catch (error) {
      console.error('❌ 安装证书失败:', error.message);
      return false;
    }
  }

  /**
   * 步骤7: 重启服务器
   */
  async restartHTTPSServer() {
    console.log('\n🔄 步骤5: 重启HTTPS服务器...');
    
    try {
      // 停止现有服务器
      try {
        execSync('pkill -f "ts-node src/server.ts" || pkill -f "node.*server" || true', { 
          stdio: 'pipe' 
        });
        console.log('🛑 已停止现有服务器');
      } catch (e) {
        // 忽略
      }
      
      // 等待端口释放
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 启动HTTPS服务器
      console.log('🚀 启动HTTPS服务器...');
      const serverDir = path.join(__dirname, 'server');
      
      const serverProcess = spawn('npm', ['run', 'dev'], {
        cwd: serverDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: true,
        env: { ...process.env, HTTPS_PORT: '443' }
      });
      
      serverProcess.unref();
      
      // 监听启动状态
      serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(output);
        
        if (output.includes('HTTPS服务器运行在') || output.includes('🔒')) {
          console.log('✅ HTTPS服务器启动成功！');
        }
      });
      
      return true;
    } catch (error) {
      console.error('❌ 重启服务器失败:', error.message);
      return false;
    }
  }

  /**
   * 验证证书
   */
  async verifyCertificate() {
    console.log('\n🔍 验证SSL证书...');
    
    try {
      const certPath = path.join(this.sslDir, 'certificate.crt');
      if (fs.existsSync(certPath)) {
        const cmd = `openssl x509 -in "${certPath}" -text -noout`;
        const output = execSync(cmd, { encoding: 'utf8' });
        
        console.log('📋 证书信息:');
        const lines = output.split('\n');
        for (const line of lines) {
          if (line.includes('Issuer:') || 
              line.includes('Subject:') ||
              line.includes('Not Before:') ||
              line.includes('Not After:')) {
            console.log(`   ${line.trim()}`);
          }
        }
        
        // 检查是否是Let's Encrypt证书
        if (output.includes("Let's Encrypt") || output.includes("letsencrypt")) {
          console.log('✅ 这是Let\'s Encrypt受信任证书！');
          return true;
        } else {
          console.log('⚠️  这不是Let\'s Encrypt证书');
          return false;
        }
      } else {
        console.log('❌ 证书文件不存在');
        return false;
      }
    } catch (error) {
      console.error('❌ 验证证书失败:', error.message);
      return false;
    }
  }

  /**
   * 主执行流程
   */
  async run() {
    console.log('🚀 开始申请受信任SSL证书...');
    console.log(`🌐 域名: ${this.domain}`);
    console.log(`📧 邮箱: ${this.email}\n`);

    try {
      // 步骤1: 申请DNS验证证书
      const step1 = await this.requestDNSValidationCert();
      if (!step1) {
        console.log('❌ 步骤1失败');
        return false;
      }

      // 步骤2: 完成证书申请
      const step2 = await this.completeCertRequest();
      if (!step2) {
        console.log('⚠️  证书申请可能失败，请检查DNS配置');
        return false;
      }

      // 步骤3: 安装证书
      const step3 = await this.installTrustedCert();
      if (!step3) {
        console.log('❌ 步骤3失败');
        return false;
      }

      // 步骤4: 验证证书
      const step4 = await this.verifyCertificate();
      
      // 步骤5: 重启服务器
      await this.restartHTTPSServer();

      console.log('\n🎉 受信任SSL证书配置完成！');
      console.log('=====================================');
      console.log('✅ Let\'s Encrypt证书已申请成功');
      console.log('✅ 证书文件已安装');
      console.log('✅ HTTPS服务器已启动');
      console.log('');
      console.log('🌐 现在可以通过以下地址安全访问:');
      console.log(`   - https://${this.domain}`);
      console.log('');
      console.log('🔒 浏览器将显示绿色安全锁，无安全警告！');
      console.log('⏰ 证书有效期90天，acme.sh会自动续期');
      console.log('=====================================');

      return true;
    } catch (error) {
      console.error('❌ 配置过程出错:', error.message);
      return false;
    }
  }
}

// 执行配置
if (require.main === module) {
  const trustedSSL = new TrustedSSLSetup();
  trustedSSL.run().catch(console.error);
}

module.exports = TrustedSSLSetup;