/**
 * OSS资源测试配置文件
 * 在运行测试前设置测试环境
 */

import { systemOSSService } from '../services/system-oss.service';

/**
 * 验证OSS服务配置
 */
export function verifyOSSConfiguration(): boolean {
  console.log('🔍 验证OSS服务配置...');

  // 检查环境变量
  const requiredEnvVars = [
    'SYSTEM_OSS_BUCKET',
    'SYSTEM_OSS_REGION',
    'SYSTEM_OSS_ENDPOINT',
    'SYSTEM_OSS_PATH_PREFIX',
    'SYSTEM_OSS_ACCESS_KEY_ID',
    'SYSTEM_OSS_ACCESS_KEY_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ 缺少必要的环境变量:', missingVars.join(', '));
    return false;
  }

  // 检查OSS服务是否可用
  if (!systemOSSService.isAvailable()) {
    console.error('❌ OSS服务不可用');
    return false;
  }

  console.log('✅ OSS服务配置验证通过');
  return true;
}

/**
 * 获取OSS存储统计信息
 */
export async function getOSSStorageStats(): Promise<any> {
  try {
    const stats = await systemOSSService.getStorageInfo();
    console.log('📊 OSS存储统计:');
    console.log(`  Bucket: ${stats.bucket}`);
    console.log(`  Region: ${stats.region}`);
    console.log(`  文件总数: ${stats.fileCount}`);
    console.log(`  总大小: ${(stats.totalSize / 1024 / 1024).toFixed(2)}MB`);

    return stats;
  } catch (error) {
    console.error('❌ 获取OSS统计信息失败:', error);
    return null;
  }
}

/**
 * 测试OSS连接
 */
export async function testOSSConnection(): Promise<boolean> {
  try {
    console.log('🔗 测试OSS连接...');

    // 尝试获取一个已知文件的签名URL
    const testPath = 'games/audio/bgm/animal-observer-bgm.mp3';
    const signedUrl = systemOSSService.getTemporaryUrl(`kindergarten/${testPath}`, 60);

    if (signedUrl) {
      console.log('✅ OSS连接测试成功');
      return true;
    } else {
      console.log('❌ OSS连接测试失败: 无法生成签名URL');
      return false;
    }
  } catch (error) {
    console.error('❌ OSS连接测试失败:', error);
    return false;
  }
}

/**
 * 验证代理服务
 */
export async function verifyProxyService(): Promise<boolean> {
  try {
    console.log('🌐 验证代理服务...');

    const response = await fetch('http://localhost:3000/api/oss-proxy/info/games/audio/bgm/animal-observer-bgm.mp3');

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log('✅ 代理服务验证成功');
        return true;
      }
    }

    console.log('❌ 代理服务验证失败');
    return false;
  } catch (error) {
    console.log('⚠️ 代理服务可能未启动，这是正常的，测试运行时会启动');
    return false;
  }
}

/**
 * 主配置验证函数
 */
export async function setupOSSResourceTests(): Promise<boolean> {
  console.log('🚀 开始OSS资源测试环境配置...\n');

  const checks = [
    { name: 'OSS配置', check: verifyOSSConfiguration },
    { name: 'OSS连接', check: testOSSConnection },
    { name: '代理服务', check: verifyProxyService },
    { name: '存储统计', check: getOSSStorageStats }
  ];

  let allPassed = true;

  for (const { name, check } of checks) {
    try {
      const result = await check();
      if (typeof result === 'boolean' && !result) {
        allPassed = false;
      }
    } catch (error) {
      console.error(`❌ ${name}检查失败:`, error);
      allPassed = false;
    }
  }

  if (allPassed) {
    console.log('\n✅ 所有配置检查通过，可以运行OSS资源访问测试\n');
  } else {
    console.log('\n⚠️ 部分配置检查失败，请检查上述错误\n');
  }

  return allPassed;
}