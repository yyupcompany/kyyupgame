/**
 * OSS安全简化测试
 * 使用纯TypeScript测试OSS租户隔离逻辑（不依赖OSS SDK）
 */

import { ossTenantSecurityService } from '../services/oss-tenant-security.service';

// 测试函数
function assertEqual(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
  console.log(`✅ ${message}`);
}

function assertTruthy(value: any, message: string) {
  if (!value) {
    throw new Error(`${message}: expected truthy value`);
  }
  console.log(`✅ ${message}`);
}

function assertFalsy(value: any, message: string) {
  if (value) {
    throw new Error(`${message}: expected falsy value`);
  }
  console.log(`✅ ${message}`);
}

// 测试用例
async function runTests() {
  console.log('\n🧪 开始OSS租户安全测试\n');
  console.log('='.repeat(60));

  const testPhone1 = '13800138000';
  const testPhone2 = '13900139000';
  const testTenantCode = 'k001';

  // 测试1: 广州OSS公共资源路径
  console.log('\n📁 测试1: 广州OSS公共资源路径验证');
  const publicPaths = [
    'kindergarten/system/games/audio/test.mp3',
    'kindergarten/games/images/logo.png',
    'kindergarten/education/videos/lesson1.mp4',
  ];

  publicPaths.forEach(path => {
    const result = ossTenantSecurityService.validateOSSPathAccess(testPhone1, testTenantCode, path);
    assertTruthy(result.isValid, `公共路径 ${path} 应该可访问`);
    assertEqual(result.accessType, 'public', `公共路径访问类型应该是public`);
  });

  // 测试2: 广州OSS租户隔离路径
  console.log('\n🔒 测试2: 广州OSS租户隔离路径验证');
  const tenantPath = `kindergarten/rent/${testPhone1}/tenant-data/file.txt`;
  
  const result1 = ossTenantSecurityService.validateOSSPathAccess(testPhone1, testTenantCode, tenantPath);
  assertTruthy(result1.isValid, `租户${testPhone1}应该能访问自己的资源`);
  assertEqual(result1.accessType, 'tenant', `租户路径访问类型应该是tenant`);

  const result2 = ossTenantSecurityService.validateOSSPathAccess(testPhone2, testTenantCode, tenantPath);
  assertFalsy(result2.isValid, `租户${testPhone2}不应该能访问其他租户的资源`);
  assertTruthy(result2.error?.includes('越权'), `错误信息应该包含越权`);

  // 测试3: 上海OSS公共资源路径
  console.log('\n📷 测试3: 上海OSS公共资源路径验证');
  const publicPath = 'kindergarten/test-faces/sample.jpg';
  const shResult = ossTenantSecurityService.validateShanghaiOSSPath(testPhone1, publicPath);
  assertTruthy(shResult.isValid, `上海OSS公共路径应该可访问`);
  assertEqual(shResult.accessType, 'public', `公共路径访问类型应该是public`);

  // 测试4: 上海OSS租户隔离路径
  console.log('\n🖼️ 测试4: 上海OSS租户隔离路径验证');
  const tenantPhotoPath = `kindergarten/rent/${testPhone1}/photos/2025-11/test.jpg`;
  
  const shResult1 = ossTenantSecurityService.validateShanghaiOSSPath(testPhone1, tenantPhotoPath);
  assertTruthy(shResult1.isValid, `租户${testPhone1}应该能访问自己的照片`);
  assertEqual(shResult1.accessType, 'tenant', `租户路径访问类型应该是tenant`);

  const shResult2 = ossTenantSecurityService.validateShanghaiOSSPath(testPhone2, tenantPhotoPath);
  assertFalsy(shResult2.isValid, `租户${testPhone2}不应该能访问其他租户的照片`);

  // 测试5: 路径生成
  console.log('\n🔧 测试5: 租户路径生成');
  const gzPath = ossTenantSecurityService.generateTenantOSSPath(testPhone1, 'uploads/file.txt');
  assertTruthy(gzPath.includes(`rent/${testPhone1}`), `广州OSS路径应该包含租户手机号`);

  const shPath = ossTenantSecurityService.generateShanghaiTenantPath(testPhone1, 'photos', '2025-11/test.jpg');
  assertTruthy(shPath.includes(`rent/${testPhone1}/photos`), `上海OSS照片路径应该包含租户手机号和photos`);

  // 测试6: Bucket识别
  console.log('\n🗂️ 测试6: Bucket识别');
  const shanghaiUrl = 'https://faceshanghaikarden.oss-cn-shanghai.aliyuncs.com/kindergarten/photos/test.jpg';
  assertEqual(ossTenantSecurityService.getBucketFromUrl(shanghaiUrl), 'shanghai', `应该识别为上海OSS`);

  const guangzhouUrl = 'https://systemkarder.oss-cn-guangzhou.aliyuncs.com/kindergarten/games/test.mp3';
  assertEqual(ossTenantSecurityService.getBucketFromUrl(guangzhouUrl), 'guangzhou', `应该识别为广州OSS`);

  // 测试7: 统一验证
  console.log('\n🔍 测试7: 统一OSS验证');
  const unifiedUrl = `https://faceshanghaikarden.oss-cn-shanghai.aliyuncs.com/kindergarten/rent/${testPhone1}/photos/test.jpg`;
  const unifiedResult = ossTenantSecurityService.validateOSSPathUnified(testPhone1, unifiedUrl);
  assertTruthy(unifiedResult.isValid, `统一验证应该通过`);
  assertEqual(unifiedResult.bucket, 'shanghai', `应该识别为上海bucket`);

  console.log('\n' + '='.repeat(60));
  console.log('🎉 所有OSS安全测试通过！\n');
}

// 运行测试
runTests().catch(error => {
  console.error('\n❌ 测试失败:', error.message);
  process.exit(1);
});

