const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 读取.env.local文件
const envLocalPath = path.resolve(__dirname, '.env.local');
const envPath = path.resolve(__dirname, '.env');

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

console.log('=== 环境变量中的AccessKey信息 ===');
console.log('AccessKeyId:', envVars.OSS_ACCESS_KEY_ID);
console.log('Bucket:', envVars.OSS_BUCKET);
console.log('Region:', envVars.OSS_REGION);

// 计算AccessKeySecret的MD5哈希
const secret = envVars.OSS_ACCESS_KEY_SECRET;
const secretHash = crypto.createHash('md5').update(secret).digest('hex');
console.log('AccessKeySecret MD5:', secretHash);

console.log('\n=== 测试不同文件路径 ===');
const testPaths = [
  'kindergarten/photos/2025-11/afd34c31-4c6a-4dcb-8887-91118eede098.jpg',
  'kindergarten/photos/2025-11/test.jpg',
  'test.txt',
  'kindergarten/test.txt'
];

const OSS = require('ali-oss');

for (const testPath of testPaths) {
  try {
    const client = new OSS({
      region: envVars.OSS_REGION,
      accessKeyId: envVars.OSS_ACCESS_KEY_ID,
      accessKeySecret: envVars.OSS_ACCESS_KEY_SECRET,
      bucket: envVars.OSS_BUCKET,
    });

    const signedUrl = client.signatureUrl(testPath, { expires: 3600 });
    console.log(`✅ ${testPath}: 签名成功`);
  } catch (error) {
    console.log(`❌ ${testPath}: 签名失败 - ${error.message}`);
  }
}

console.log('\n=== 建议 ===');
console.log('1. 检查阿里云控制台中AccessKey是否有OSS权限');
console.log('2. 检查Bucket是否存在于指定的Region');
console.log('3. 确认文件路径是否正确');
console.log('4. 检查Bucket的访问权限设置');