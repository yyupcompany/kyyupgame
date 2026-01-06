const fs = require('fs');
const path = require('path');
const OSS = require('ali-oss');

// 使用与后端服务完全相同的环境变量加载逻辑
const envPath = path.resolve(__dirname, '.env');
const envLocalPath = path.resolve(__dirname, '.env.local');
let envVars = {};

// 读取.env文件
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envVars = { ...envVars, ...require('dotenv').parse(envContent) };
}

// 读取.env.local文件并覆盖
if (fs.existsSync(envLocalPath)) {
  const envLocalContent = fs.readFileSync(envLocalPath, 'utf-8');
  const envLocalVars = require('dotenv').parse(envLocalContent);
  envVars = { ...envVars, ...envLocalVars };
}

// 设置环境变量到process.env
Object.assign(process.env, envVars);

console.log('=== 直接测试OSS配置 ===');
console.log('AccessKeyId:', process.env.OSS_ACCESS_KEY_ID?.substring(0, 10) + '...');
console.log('Bucket:', process.env.OSS_BUCKET);
console.log('Region:', process.env.OSS_REGION);

// 使用与后端OSSService完全相同的配置
const client = new OSS({
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET,
  secure: true, // 强制使用HTTPS
});

console.log('\n✅ OSS客户端配置与后端服务完全一致');

async function testDirectAccess() {
  const testPath = 'kindergarten/photos/2025-11/226cee77-494b-4e1a-bc23-ef8b0fda11a5.jpg';

  try {
    // 1. 检查文件是否存在
    console.log('\n1. 检查文件是否存在...');
    const headResult = await client.head(testPath);
    console.log('✅ 文件存在，大小:', headResult.res.size, 'bytes');

    // 2. 生成签名URL
    console.log('\n2. 生成签名URL...');
    const signedUrl = client.signatureUrl(testPath, { expires: 3600 });
    console.log('签名URL:', signedUrl);

    // 3. 测试签名URL
    console.log('\n3. 测试签名URL...');
    const https = require('https');
    const url = new URL(signedUrl);

    const response = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'GET',
        timeout: 10000
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 200) // 只取前200字符
        }));
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      req.end();
    });

    console.log('响应状态码:', response.statusCode);
    if (response.statusCode === 200) {
      console.log('✅ 签名URL访问成功！');
      console.log('Content-Type:', response.headers['content-type']);
      console.log('Content-Length:', response.headers['content-length']);
    } else {
      console.log('❌ 签名URL访问失败');
      console.log('响应数据:', response.data);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testDirectAccess();