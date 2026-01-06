const fs = require('fs');
const path = require('path');

// 先读取.env文件，再读取.env.local文件覆盖
const envPath = path.resolve(__dirname, '.env');
const envLocalPath = path.resolve(__dirname, '.env.local');
let envVars = {};

// 读取.env文件
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envVars = require('dotenv').parse(envContent);
  console.log('✅ .env 文件已读取');
}

// 读取.env.local文件并覆盖
if (fs.existsSync(envLocalPath)) {
  const envLocalContent = fs.readFileSync(envLocalPath, 'utf-8');
  const envLocalVars = require('dotenv').parse(envLocalContent);
  envVars = { ...envVars, ...envLocalVars };
  console.log('✅ .env.local 文件已读取并合并');
}

const OSS = require('ali-oss');

// 使用读取的环境变量
const client = new OSS({
  region: envVars.OSS_REGION,
  accessKeyId: envVars.OSS_ACCESS_KEY_ID,
  accessKeySecret: envVars.OSS_ACCESS_KEY_SECRET,
  bucket: envVars.OSS_BUCKET,
});

const testPath = 'kindergarten/photos/2025-11/afd34c31-4c6a-4dcb-8887-91118eede098.jpg';

console.log('使用服务器环境变量测试OSS签名URL生成...');
console.log('客户端配置:', {
  region: client.options.region,
  bucket: client.options.bucket,
  accessKeyId: client.options.accessKeyId,
  accessKeySecret: envVars.OSS_ACCESS_KEY_SECRET ? envVars.OSS_ACCESS_KEY_SECRET.substring(0, 10) + '...' : 'undefined',
});

try {
  // 生成签名URL
  let signedUrl = client.signatureUrl(testPath, {
    expires: 3600,
  });

  console.log('\n原始生成的签名URL:');
  console.log(signedUrl);

  // 手动替换为HTTPS，模拟我们服务的行为
  signedUrl = signedUrl.replace('http://', 'https://');

  console.log('\nHTTPS版本的签名URL:');
  console.log(signedUrl);

  // 分析URL参数
  const url = new URL(signedUrl);
  console.log('\nURL参数分析:');
  console.log('- OSSAccessKeyId:', url.searchParams.get('OSSAccessKeyId'));
  console.log('- Expires:', url.searchParams.get('Expires'));
  console.log('- Signature:', url.searchParams.get('Signature'));

  // 检查过期时间
  const expires = parseInt(url.searchParams.get('Expires'));
  const now = Math.floor(Date.now() / 1000);
  console.log('- 当前时间戳:', now);
  console.log('- 过期时间戳:', expires);
  console.log('- 剩余时间(秒):', expires - now);

  console.log('\n请手动测试这个URL是否可以访问:');
  console.log(signedUrl);

} catch (error) {
  console.error('生成签名URL失败:', error);
}