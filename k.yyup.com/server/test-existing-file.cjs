const OSS = require('ali-oss');
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

console.log('=== 测试实际存在的文件签名URL ===');

async function testExistingFile() {
  const client = new OSS({
    region: envVars.OSS_REGION,
    accessKeyId: envVars.OSS_ACCESS_KEY_ID,
    accessKeySecret: envVars.OSS_ACCESS_KEY_SECRET,
    bucket: envVars.OSS_BUCKET,
    secure: true,
  });

  try {
    // 获取文件列表
    const listResult = await client.list({
      prefix: 'kindergarten/photos/2025-11/',
      'max-keys': 10
    });

    if (listResult.objects && listResult.objects.length > 0) {
      const firstFile = listResult.objects[0];
      console.log('测试文件:', firstFile.name);
      console.log('文件大小:', firstFile.size, 'bytes');

      // 生成签名URL
      const signedUrl = client.signatureUrl(firstFile.name, { expires: 3600 });
      console.log('\n签名URL:', signedUrl);

      // 测试URL（模拟HTTP请求）
      console.log('\n开始测试URL访问...');

      const https = require('https');
      const url = new URL(signedUrl);

      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; OSS-Test/1.0)'
        }
      };

      const req = https.request(options, (res) => {
        console.log('状态码:', res.statusCode);
        console.log('响应头:', res.headers);

        if (res.statusCode === 200) {
          console.log('✅ 文件访问成功！');
        } else if (res.statusCode === 403) {
          console.log('❌ 403 Forbidden - 签名验证失败');
        } else {
          console.log('⚠️ 其他状态码:', res.statusCode);
        }

        res.on('data', (chunk) => {
          // 不输出文件内容，只记录接收到了数据
        });

        res.on('end', () => {
          console.log('响应接收完成');
        });
      });

      req.on('error', (e) => {
        console.error('请求错误:', e.message);
      });

      req.setTimeout(10000, () => {
        console.log('请求超时');
        req.abort();
      });

      req.end();

    } else {
      console.log('❌ 没有找到文件');
    }

  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

testExistingFile();