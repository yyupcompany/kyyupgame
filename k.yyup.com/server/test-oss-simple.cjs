const fs = require('fs');
const path = require('path');

/**
 * 简单的OSS配置测试
 */
function testOSSConfigSimple() {
  console.log('🧪 测试OSS配置加载...\n');

  // 手动加载.env.local文件
  const envLocalPath = path.join(__dirname, '.env.local');
  let envConfig = {};

  if (fs.existsSync(envLocalPath)) {
    console.log('✅ 找到.env.local文件');
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    const lines = envContent.split('\n');

    lines.forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && !line.startsWith('#')) {
        envConfig[match[1].trim()] = match[2].trim();
      }
    });
    console.log('✅ 环境变量加载完成\n');
  } else {
    console.log('❌ 未找到.env.local文件');
    return;
  }

  // 检测环境
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  console.log(`🌍 当前环境: ${nodeEnv} (${isProduction ? '生产' : '开发'}环境)\n`);

  // 获取OSS配置
  const accessKeyId = envConfig.SYSTEM_OSS_ACCESS_KEY_ID;
  const accessKeySecret = envConfig.SYSTEM_OSS_ACCESS_KEY_SECRET;
  const bucket = envConfig.SYSTEM_OSS_BUCKET || 'systemkarder';
  const region = envConfig.SYSTEM_OSS_REGION || 'oss-cn-guangzhou';
  const basePath = envConfig.SYSTEM_OSS_PATH_PREFIX || 'kindergarten/';

  console.log('📋 OSS配置信息:');
  console.log(`   Access Key ID: ${accessKeyId ? accessKeyId.substring(0, 10) + '...' : '未配置'}`);
  console.log(`   Access Key Secret: ${accessKeySecret ? '已配置' : '未配置'}`);
  console.log(`   Bucket: ${bucket}`);
  console.log(`   Region: ${region}`);
  console.log(`   路径前缀: ${basePath}`);

  if (!accessKeyId || !accessKeySecret) {
    console.log('\n❌ OSS配置不完整');
    console.log('💡 请检查.env.local文件中的SYSTEM_OSS_ACCESS_KEY_ID和SYSTEM_OSS_ACCESS_KEY_SECRET');
    return;
  }

  console.log('\n✅ OSS配置完整有效！');

  // 测试路径生成
  const gameImagePath = `${basePath}system/games/images/princess-garden-bg.jpg`;
  const educationPath = `${basePath}education/games/test.jpg`;
  const tenantPath = `${basePath}rent/13800138000/files/document.pdf`;

  console.log('\n📁 测试路径生成:');
  console.log(`   游戏图片: ${gameImagePath}`);
  console.log(`   教育资源: ${educationPath}`);
  console.log(`   租户文件: ${tenantPath}`);

  console.log('\n🎉 OSS配置测试完成！');
  console.log('\n📝 使用说明:');
  console.log('   - 开发环境将使用 .env.local 中的配置');
  console.log('   - 生产环境将使用 PRODUCTION_ 前缀的环境变量');
  console.log('   - OSS配置已集成到系统OSS服务中');

  return {
    success: true,
    environment: nodeEnv,
    isProduction,
    bucket,
    region,
    basePath,
    configComplete: true
  };
}

// 运行测试
testOSSConfigSimple();