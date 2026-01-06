const OSS = require('ali-oss');
require('dotenv').config();

/**
 * 直接检查OSS中的游戏图片文件
 */
async function checkOSSGameImages() {
  console.log('🔍 直接检查OSS中的游戏图片...\n');

  // 从环境变量读取OSS配置
  const accessKeyId = process.env.SYSTEM_OSS_ACCESS_KEY_ID;
  const accessKeySecret = process.env.SYSTEM_OSS_ACCESS_KEY_SECRET;
  const bucket = process.env.SYSTEM_OSS_BUCKET || 'systemkarder';
  const region = process.env.SYSTEM_OSS_REGION || 'oss-cn-guangzhou';

  if (!accessKeyId || !accessKeySecret) {
    console.log('❌ 系统OSS配置未完成');
    console.log('💡 请检查环境变量:');
    console.log('   - SYSTEM_OSS_ACCESS_KEY_ID');
    console.log('   - SYSTEM_OSS_ACCESS_KEY_SECRET');
    console.log('   - SYSTEM_OSS_BUCKET');
    console.log('   - SYSTEM_OSS_REGION');
    return;
  }

  console.log(`✅ OSS配置: ${bucket} (${region})\n`);

  // 初始化OSS客户端
  const client = new OSS({
    region,
    accessKeyId,
    accessKeySecret,
    bucket,
  });

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

  console.log('\n💡 建议:');
  if (results.exists.length === 0) {
    console.log('   - OSS中没有任何游戏图片');
    console.log('   - 当前前端使用Emoji图标是合理的选择');
    console.log('   - 如需要使用真实图片，需要先上传到OSS路径: kindergarten/system/games/images/');
  } else if (results.exists.length === Object.keys(gameBackgroundFiles).length) {
    console.log('   - 所有游戏图片都已存在！');
    console.log('   - 建议修改前端使用OSS图片替换Emoji图标');
    console.log('   - 可以大幅提升游戏的视觉效果和用户体验');
  } else {
    console.log('   - 部分游戏图片存在，建议补全缺失的图片');
    console.log('   - 可以考虑混合使用：存在的用OSS图片，缺失的用Emoji');
  }

  return results;
}

// 运行检查
checkOSSGameImages().catch(console.error);