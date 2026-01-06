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

// 测试1: 使用标准配置
console.log('\n=== 测试1: 标准配置 ===');
const client1 = new OSS({
  region: envVars.OSS_REGION,
  accessKeyId: envVars.OSS_ACCESS_KEY_ID,
  accessKeySecret: envVars.OSS_ACCESS_KEY_SECRET,
  bucket: envVars.OSS_BUCKET,
});

const testPath = 'kindergarten/photos/2025-11/afd34c31-4c6a-4dcb-8887-91118eede098.jpg';

try {
  let signedUrl1 = client1.signatureUrl(testPath, { expires: 3600 });
  console.log('标准配置生成的URL:', signedUrl1);
} catch (error) {
  console.error('标准配置失败:', error.message);
}

// 测试2: 使用endpoint配置
console.log('\n=== 测试2: Endpoint配置 ===');
const endpoint = `https://${envVars.OSS_BUCKET}.${envVars.OSS_REGION}.aliyuncs.com`;
const client2 = new OSS({
  accessKeyId: envVars.OSS_ACCESS_KEY_ID,
  accessKeySecret: envVars.OSS_ACCESS_KEY_SECRET,
  endpoint: endpoint,
  cname: false,
  isRequestPay: false,
  secure: true,
});

try {
  let signedUrl2 = client2.signatureUrl(testPath, { expires: 3600 });
  console.log('Endpoint配置生成的URL:', signedUrl2);
} catch (error) {
  console.error('Endpoint配置失败:', error.message);
}

// 测试3: 使用region配置 + secure: true
console.log('\n=== 测试3: Region配置 + Secure ===');
const client3 = new OSS({
  region: envVars.OSS_REGION,
  accessKeyId: envVars.OSS_ACCESS_KEY_ID,
  accessKeySecret: envVars.OSS_ACCESS_KEY_SECRET,
  bucket: envVars.OSS_BUCKET,
  secure: true,
});

try {
  let signedUrl3 = client3.signatureUrl(testPath, { expires: 3600 });
  console.log('Secure配置生成的URL:', signedUrl3);
} catch (error) {
  console.error('Secure配置失败:', error.message);
}

console.log('\n=== 环境变量信息 ===');
console.log('Region:', envVars.OSS_REGION);
console.log('Bucket:', envVars.OSS_BUCKET);
console.log('AccessKeyId:', envVars.OSS_ACCESS_KEY_ID);
console.log('AccessKeySecret:', envVars.OSS_ACCESS_KEY_SECRET ? '已设置' : '未设置');