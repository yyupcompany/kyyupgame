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

console.log('=== OSS AccessKey 和 Bucket 权限验证 ===');
console.log('AccessKeyId:', envVars.OSS_ACCESS_KEY_ID);
console.log('Bucket:', envVars.OSS_BUCKET);
console.log('Region:', envVars.OSS_REGION);

async function testOSSAccess() {
  const testPath = 'kindergarten/photos/2025-11/afd34c31-4c6a-4dcb-8887-91118eede098.jpg';

  // 测试1: 使用region配置
  console.log('\n=== 测试1: 使用region配置 ===');
  try {
    const client1 = new OSS({
      region: envVars.OSS_REGION,
      accessKeyId: envVars.OSS_ACCESS_KEY_ID,
      accessKeySecret: envVars.OSS_ACCESS_KEY_SECRET,
      bucket: envVars.OSS_BUCKET,
      secure: true,
    });

    // 检查bucket是否存在
    try {
      const bucketInfo = await client1.getBucketInfo(envVars.OSS_BUCKET);
      console.log('✅ Bucket信息获取成功:');
      console.log('  Bucket:', bucketInfo.bucket.Location);
      console.log('  创建者:', bucketInfo.bucket.Owner.ID);
      console.log('  地域:', bucketInfo.bucket.Location);
      console.log('  权限:', bucketInfo.bucket.ACL);
    } catch (bucketError) {
      console.log('❌ Bucket信息获取失败:', bucketError.message);
      console.log('  错误码:', bucketError.code);
      console.log('  状态码:', bucketError.status);

      if (bucketError.code === 'NoSuchBucket') {
        console.log('  💡 建议: Bucket不存在或名称错误');
      } else if (bucketError.code === 'AccessDenied') {
        console.log('  💡 建议: AccessKey没有该Bucket的访问权限');
      } else if (bucketError.code === 'InvalidRegion') {
        console.log('  💡 建议: Bucket不在指定的Region');
      }
    }

    // 尝试列出文件
    try {
      const listResult = await client1.list({
        prefix: 'kindergarten/photos/2025-11/',
        'max-keys': 5
      });
      console.log('✅ 文件列表获取成功，找到', listResult.objects ? listResult.objects.length : 0, '个文件');
      if (listResult.objects && listResult.objects.length > 0) {
        listResult.objects.forEach(obj => {
          console.log('  -', obj.name, '(', obj.size, 'bytes)');
        });
      }
    } catch (listError) {
      console.log('❌ 文件列表获取失败:', listError.message);
      console.log('  错误码:', listError.code);
    }

    // 生成签名URL
    try {
      const signedUrl = client1.signatureUrl(testPath, { expires: 3600 });
      console.log('✅ 签名URL生成成功:');
      console.log('  URL:', signedUrl);

      // 验证URL结构
      console.log('  URL分析:');
      console.log('    - 包含AccessKey:', signedUrl.includes('OSSAccessKeyId='));
      console.log('    - 包含过期时间:', signedUrl.includes('Expires='));
      console.log('    - 包含签名:', signedUrl.includes('Signature='));
      console.log('    - 使用HTTPS:', signedUrl.startsWith('https://'));
    } catch (signError) {
      console.log('❌ 签名URL生成失败:', signError.message);
      console.log('  错误码:', signError.code);
    }

  } catch (initError) {
    console.log('❌ OSS客户端初始化失败:', initError.message);
  }

  // 测试2: 使用endpoint配置
  console.log('\n=== 测试2: 使用endpoint配置 ===');
  try {
    const endpoint = `https://${envVars.OSS_BUCKET}.${envVars.OSS_REGION}.aliyuncs.com`;
    const client2 = new OSS({
      accessKeyId: envVars.OSS_ACCESS_KEY_ID,
      accessKeySecret: envVars.OSS_ACCESS_KEY_SECRET,
      endpoint: endpoint,
      bucket: envVars.OSS_BUCKET,
      secure: true,
    });

    const signedUrl2 = client2.signatureUrl(testPath, { expires: 3600 });
    console.log('✅ Endpoint方式签名URL生成成功:');
    console.log('  URL:', signedUrl2);

  } catch (endpointError) {
    console.log('❌ Endpoint方式失败:', endpointError.message);
  }

  // 测试3: 尝试使用STS临时凭证（如果可用）
  console.log('\n=== 测试3: 检查是否需要STS临时凭证 ===');
  console.log('当前使用AccessKey类型:', envVars.OSS_ACCESS_KEY_ID.startsWith('STS.') ? 'STS临时凭证' : '长期AccessKey');

  if (!envVars.OSS_ACCESS_KEY_ID.startsWith('STS.')) {
    console.log('💡 建议: 如果Bucket属于其他账号，可能需要使用STS临时凭证');
  }
}

testOSSAccess().catch(console.error);