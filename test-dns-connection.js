#!/usr/bin/env node

/**
 * DNS连接测试脚本
 * 测试阿里云DNS服务是否可以连接
 */

const dns = require('dns').promises;
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// 测试配置
const TEST_CONFIG = {
  // 测试域名
  testDomains: [
    'yyup.cc',
    'k001.yyup.cc',
    'k002.yyup.cc',
    'rent.yyup.cc'
  ],
  
  // 测试DNS服务器
  dnsServers: [
    '8.8.8.8',           // Google DNS
    '1.1.1.1',           // Cloudflare DNS
    '114.114.114.114',   // 114 DNS
    '223.5.5.5'          // 阿里云DNS
  ],
  
  // 测试超时时间（毫秒）
  timeout: 5000
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`)
};

/**
 * 测试DNS解析
 */
async function testDNSResolution() {
  log.title('🔍 DNS解析测试');
  console.log('-'.repeat(60));
  
  const results = [];
  
  for (const domain of TEST_CONFIG.testDomains) {
    try {
      const startTime = Date.now();
      const addresses = await dns.resolve4(domain);
      const responseTime = Date.now() - startTime;
      
      log.success(`${domain.padEnd(20)} → ${addresses.join(', ')} (${responseTime}ms)`);
      
      results.push({
        domain,
        status: 'success',
        ips: addresses,
        responseTime
      });
    } catch (error) {
      log.error(`${domain.padEnd(20)} → ${error.message}`);
      
      results.push({
        domain,
        status: 'failed',
        error: error.message
      });
    }
  }
  
  return results;
}

/**
 * 测试DNS服务器连接
 */
async function testDNSServers() {
  log.title('🌐 DNS服务器连接测试');
  console.log('-'.repeat(60));
  
  const results = [];
  
  for (const server of TEST_CONFIG.dnsServers) {
    try {
      const startTime = Date.now();
      
      // 使用nslookup测试
      const { stdout } = await execAsync(`nslookup yyup.cc ${server}`, {
        timeout: TEST_CONFIG.timeout
      });
      
      const responseTime = Date.now() - startTime;
      
      if (stdout.includes('Address:')) {
        log.success(`${server.padEnd(20)} → 连接成功 (${responseTime}ms)`);
        results.push({
          server,
          status: 'success',
          responseTime
        });
      } else {
        log.warn(`${server.padEnd(20)} → 响应异常`);
        results.push({
          server,
          status: 'warning',
          responseTime
        });
      }
    } catch (error) {
      log.error(`${server.padEnd(20)} → ${error.message}`);
      results.push({
        server,
        status: 'failed',
        error: error.message
      });
    }
  }
  
  return results;
}

/**
 * 测试阿里云DNS API连接
 */
async function testAliyunDNSAPI() {
  log.title('☁️  阿里云DNS API连接测试');
  console.log('-'.repeat(60));
  
  const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;
  
  if (!accessKeyId || !accessKeySecret) {
    log.warn('阿里云凭证未配置');
    log.info('请设置环境变量:');
    log.info('  export ALIYUN_ACCESS_KEY_ID=your_key_id');
    log.info('  export ALIYUN_ACCESS_KEY_SECRET=your_key_secret');
    return null;
  }
  
  try {
    // 这里应该调用阿里云DNS API
    // 目前只是检查凭证是否存在
    log.success('阿里云凭证已配置');
    log.info(`Access Key ID: ${accessKeyId.substring(0, 10)}...`);
    
    return {
      status: 'configured',
      hasAccessKeyId: true,
      hasAccessKeySecret: true
    };
  } catch (error) {
    log.error(`阿里云API连接失败: ${error.message}`);
    return {
      status: 'failed',
      error: error.message
    };
  }
}

/**
 * 测试本地hosts文件
 */
async function testLocalHosts() {
  log.title('📝 本地Hosts文件测试');
  console.log('-'.repeat(60));
  
  try {
    const { stdout } = await execAsync('cat /etc/hosts | grep yyup');
    
    if (stdout) {
      log.success('本地hosts文件已配置:');
      console.log(stdout);
    } else {
      log.warn('本地hosts文件未配置yyup.cc');
    }
  } catch (error) {
    log.warn('无法读取hosts文件或未配置yyup.cc');
  }
}

/**
 * 生成测试报告
 */
function generateReport(dnsResults, serverResults, aliyunResult) {
  log.title('📊 测试报告总结');
  console.log('-'.repeat(60));
  
  const successDomains = dnsResults.filter(r => r.status === 'success').length;
  const successServers = serverResults.filter(r => r.status === 'success').length;
  
  console.log(`
DNS解析测试:
  - 成功: ${successDomains}/${dnsResults.length}
  - 失败: ${dnsResults.length - successDomains}/${dnsResults.length}

DNS服务器测试:
  - 成功: ${successServers}/${serverResults.length}
  - 失败: ${serverResults.length - successServers}/${serverResults.length}

阿里云DNS API:
  - 状态: ${aliyunResult ? aliyunResult.status : '未配置'}
  `);
  
  // 总体评估
  if (successDomains > 0 && successServers > 0) {
    log.success('✅ DNS连接正常，可以进行演示');
  } else if (successDomains > 0) {
    log.warn('⚠️  部分DNS服务器不可用，但基本功能可用');
  } else {
    log.error('❌ DNS连接异常，无法进行演示');
  }
}

/**
 * 主函数
 */
async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║          DNS连接测试 - 演示系统诊断工具                    ║
╚════════════════════════════════════════════════════════════╝
  `);
  
  try {
    // 运行所有测试
    const dnsResults = await testDNSResolution();
    const serverResults = await testDNSServers();
    const aliyunResult = await testAliyunDNSAPI();
    await testLocalHosts();
    
    // 生成报告
    generateReport(dnsResults, serverResults, aliyunResult);
    
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                    测试完成                                ║
╚════════════════════════════════════════════════════════════╝
    `);
    
  } catch (error) {
    log.error(`测试过程中出错: ${error.message}`);
    process.exit(1);
  }
}

// 运行测试
main().catch(console.error);

