const fs = require('fs');
const path = require('path');

// 读取环境变量
const envPath = path.resolve(__dirname, '.env');
const envLocalPath = path.resolve(__dirname, '.env.local');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envVars = { ...envVars, ...require('dotenv').parse(envContent) };
}

if (fs.existsSync(envLocalPath)) {
  const envLocalContent = fs.readFileSync(envLocalPath, 'utf-8');
  const envLocalVars = require('dotenv').parse(envLocalContent);
  envVars = { ...envVars, ...envLocalVars };
}

const OSS = require('ali-oss');

console.log('=== 最终测试: 使用endpoint配置 + secure:true ===');

// 测试1: 标准region配置 + secure: true
const client1 = new OSS({
  region: envVars.OSS_REGION,
  accessKeyId: envVars.OSS_ACCESS_KEY_ID,
  accessKeySecret: envVars.OSS_ACCESS_KEY_SECRET,
  bucket: envVars.OSS_BUCKET,
  secure: true,
});

const testPath = 'kindergarten/photos/2025-11/afd34c31-4c6a-4dcb-8887-91118eede098.jpg';

console.log('Client1 (region + secure):');
const signedUrl1 = client1.signatureUrl(testPath, { expires: 3600 });
console.log('  URL:', signedUrl1);
console.log('  IsHTTPS:', signedUrl1.startsWith('https://'));

// 测试2: endpoint配置
const endpoint = `https://${envVars.OSS_BUCKET}.${envVars.OSS_REGION}.aliyuncs.com`;
const client2 = new OSS({
  accessKeyId: envVars.OSS_ACCESS_KEY_ID,
  accessKeySecret: envVars.OSS_ACCESS_KEY_SECRET,
  endpoint: endpoint,
  bucket: envVars.OSS_BUCKET,
});

console.log('\nClient2 (endpoint):');
const signedUrl2 = client2.signatureUrl(testPath, { expires: 3600 });
console.log('  URL:', signedUrl2);
console.log('  IsHTTPS:', signedUrl2.startsWith('https://'));

// 测试URL
console.log('\n=== 测试结果 ===');
console.log('请手动测试这两个URL:');
console.log('1:', signedUrl1);
console.log('2:', signedUrl2);