const { ossConfig } = require('./dist/config/oss.config');
const { SystemOSSService } = require('./dist/services/system-oss.service');

/**
 * 测试OSS配置加载
 */
async function testOSSConfiguration() {
  console.log('🧪 开始测试OSS配置加载...\n');

  try {
    // 测试配置管理器
    console.log('📋 1. 测试配置管理器');
    const configManager = ossConfig.getInstance();
    const envInfo = configManager.getEnvironmentInfo();

    console.log('✅ 环境信息:');
    console.log(`   环境: ${envInfo.environment}`);
    console.log(`   是否生产环境: ${envInfo.isProduction}`);
    console.log(`   Node版本: ${envInfo.nodeVersion}`);
    console.log(`   平台: ${envInfo.platform}`);

    const config = configManager.getConfig();
    if (config) {
      console.log('✅ OSS配置已加载:');
      console.log(`   Bucket: ${config.bucket}`);
      console.log(`   Region: ${config.region}`);
      console.log(`   CDN域名: ${config.cdnDomain || '未配置'}`);
      console.log(`   路径前缀: ${config.basePath}`);
    } else {
      console.log('❌ OSS配置未加载');
    }

    // 测试游戏图片路径生成
    console.log('\n📋 2. 测试路径生成');
    try {
      const gameImagePath = configManager.getGameImagePath('princess-garden-bg.jpg');
      console.log(`✅ 游戏图片路径: ${gameImagePath}`);
    } catch (error) {
      console.log(`❌ 游戏图片路径生成失败: ${error.message}`);
    }

    try {
      const educationPath = configManager.getEducationResourcePath('games', 'images', 'test.jpg');
      console.log(`✅ 教育资源路径: ${educationPath}`);
    } catch (error) {
      console.log(`❌ 教育资源路径生成失败: ${error.message}`);
    }

    // 测试OSS服务初始化
    console.log('\n📋 3. 测试OSS服务');
    const systemOSSService = new SystemOSSService();

    if (systemOSSService.isAvailable()) {
      console.log('✅ OSS服务可用');

      // 测试路径URL生成
      try {
        const testUrl = systemOSSService.getFileUrl('kindergarten/system/test.txt');
        console.log(`✅ 测试URL生成: ${testUrl.substring(0, 100)}...`);
      } catch (error) {
        console.log(`❌ URL生成失败: ${error.message}`);
      }
    } else {
      console.log('❌ OSS服务不可用');
    }

    // 测试配置重载
    console.log('\n📋 4. 测试配置重载');
    try {
      configManager.reloadConfig();
      console.log('✅ 配置重载成功');
    } catch (error) {
      console.log(`❌ 配置重载失败: ${error.message}`);
    }

    console.log('\n🎉 OSS配置测试完成!');

  } catch (error) {
    console.error('\n❌ OSS配置测试失败:', error.message);
    console.error('💡 可能的原因:');
    console.error('   - TypeScript编译错误，请先运行: npm run build');
    console.error('   - 配置文件缺失或格式错误');
    console.error('   - 环境变量未正确设置');
  }
}

// 运行测试
testOSSConfiguration();