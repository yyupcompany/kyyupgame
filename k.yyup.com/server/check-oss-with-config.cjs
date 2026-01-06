const OSS = require('ali-oss');
const fs = require('fs');
const path = require('path');

/**
 * 检查OSS中的游戏图片 - 显式加载配置
 */
async function checkOSSGameImagesWithConfig() {
  console.log('🔍 检查OSS中的游戏图片（显式配置）...\n');

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
  }

  // 从配置中读取OSS配置
  const accessKeyId = envConfig.SYSTEM_OSS_ACCESS_KEY_ID;
  const accessKeySecret = envConfig.SYSTEM_OSS_ACCESS_KEY_SECRET;
  const bucket = envConfig.SYSTEM_OSS_BUCKET || 'systemkarder';
  const region = envConfig.SYSTEM_OSS_REGION || 'oss-cn-guangzhou';

  if (!accessKeyId || !accessKeySecret) {
    console.log('❌ 系统OSS配置未完成');
    console.log('💡 请检查.env.local文件中的配置:');
    console.log('   - SYSTEM_OSS_ACCESS_KEY_ID');
    console.log('   - SYSTEM_OSS_ACCESS_KEY_SECRET');
    return;
  }

  console.log(`✅ OSS配置: ${bucket} (${region})`);
  console.log(`   Access Key ID: ${accessKeyId.substring(0, 10)}...\n`);

  try {
    // 初始化OSS客户端
    const client = new OSS({
      region,
      accessKeyId,
      accessKeySecret,
      bucket,
    });

    console.log('✅ OSS客户端初始化成功\n');

    // 游戏背景图片文件映射
    const gameBackgroundFiles = {
      'princess-garden': 'princess-garden-bg.jpg',
      'space-hunt': 'space-treasure-bg.jpg',
      'animal-observer': 'animal-observer-bg.jpg',
      'princess-memory': 'princess-memory-bg.jpg',
      'dino-memory': 'dinosaur-memory-bg.jpg',
      'fruit-sequence': 'fruit-sequence-bg.jpg',
      'doll-house': 'dollhouse-tidy-bg.jpg',
      'robot-factory': 'robot-factory-bg.jpg',
      'color-sort': 'color-sorting-bg.jpg'
    };

    const results = {
      exists: [],
      missing: [],
      errors: []
    };

    console.log('🔍 开始检查游戏图片文件...\n');

    // 检查每个游戏的背景图片
    for (const [gameKey, fileName] of Object.entries(gameBackgroundFiles)) {
      try {
        const ossPath = `kindergarten/system/games/images/${fileName}`;
        console.log(`🔍 检查 ${gameKey}: ${fileName}`);
        console.log(`   OSS路径: ${ossPath}`);

        // 使用head方法检查文件是否存在
        await client.head(ossPath);

        console.log(`✅ ${gameKey}: 文件存在\n`);
        results.exists.push({
          gameKey,
          fileName,
          ossPath
        });

      } catch (error) {
        if (error.code === 'NoSuchKey') {
          console.log(`❌ ${gameKey}: 文件不存在\n`);
          results.missing.push({
            gameKey,
            fileName,
            error: 'File not found'
          });
        } else {
          console.log(`⚠️  ${gameKey}: 检查失败`);
          console.log(`   错误: ${error.message}\n`);
          results.errors.push({
            gameKey,
            fileName,
            error: error.message
          });
        }
      }
    }

    // 统计结果
    console.log('\n📊 检查结果统计:');
    console.log(`✅ 存在: ${results.exists.length} 个`);
    console.log(`❌ 不存在: ${results.missing.length} 个`);
    console.log(`⚠️  检查失败: ${results.errors.length} 个`);

    console.log('\n📋 详细结果:');

    if (results.exists.length > 0) {
      console.log('\n✅ 存在的图片:');
      results.exists.forEach(item => {
        console.log(`   ${item.gameKey}: ${item.fileName}`);
        console.log(`   路径: ${item.ossPath}`);
      });
    }

    if (results.missing.length > 0) {
      console.log('\n❌ 缺失的图片:');
      results.missing.forEach(item => {
        console.log(`   ${item.gameKey}: ${item.fileName}`);
      });
    }

    if (results.errors.length > 0) {
      console.log('\n⚠️  检查错误的图片:');
      results.errors.forEach(item => {
        console.log(`   ${item.gameKey}: ${item.fileName} (${item.error})`);
      });
    }

    console.log('\n💡 结论:');
    if (results.exists.length === 0) {
      console.log('   - OSS中没有任何游戏图片文件');
      console.log('   - 当前前端使用Emoji图标是合理的选择');
    } else if (results.exists.length === Object.keys(gameBackgroundFiles).length) {
      console.log('   - 所有游戏图片都已存在！');
      console.log('   - 建议修改前端使用OSS图片替换Emoji图标');
    } else {
      console.log('   - 部分游戏图片存在，建议补全缺失的图片');
    }

    return results;

  } catch (error) {
    console.error('❌ OSS客户端初始化失败:', error.message);
    console.log('💡 可能的原因:');
    console.log('   - OSS配置错误');
    console.log('   - 网络连接问题');
    console.log('   - OSS服务不可用');
  }
}

// 运行检查
checkOSSGameImagesWithConfig().catch(console.error);