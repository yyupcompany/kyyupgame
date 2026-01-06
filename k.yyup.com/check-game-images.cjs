const axios = require('axios');

/**
 * 检查OSS中游戏图片是否存在
 */
async function checkGameImagesInOSS() {
  const baseURL = 'http://localhost:3000';

  // 游戏背景图片文件映射（从API文档中获取）
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

  console.log('🔍 开始检查OSS中的游戏图片...\n');

  try {
    // 先检查服务器是否运行
    await axios.get(`${baseURL}/api/health`);
    console.log('✅ 服务器连接成功\n');
  } catch (error) {
    console.log('❌ 服务器连接失败，请确保服务器正在运行');
    console.log('💡 运行命令: cd server && npm run dev\n');
    return;
  }

  const results = {
    exists: [],
    missing: [],
    errors: []
  };

  // 检查每个游戏的背景图片
  for (const [gameKey, fileName] of Object.entries(gameBackgroundFiles)) {
    try {
      console.log(`🔍 检查 ${gameKey}: ${fileName}`);

      // 调用游戏背景图片API
      const response = await axios.get(`${baseURL}/api/game-backgrounds/${gameKey}`, {
        headers: {
          'Authorization': 'Bearer demo-token',
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success && response.data.signedUrl) {
        console.log(`✅ ${gameKey}: 图片存在`);
        console.log(`   OSS路径: ${response.data.ossPath}`);
        console.log(`   预览URL: ${response.data.signedUrl.substring(0, 100)}...\n`);
        results.exists.push({
          gameKey,
          fileName,
          ossPath: response.data.ossPath
        });
      } else {
        console.log(`❌ ${gameKey}: 图片不存在或无法访问`);
        console.log(`   错误: ${response.data.error || '未知错误'}\n`);
        results.missing.push({
          gameKey,
          fileName,
          error: response.data.error
        });
      }
    } catch (error) {
      console.log(`⚠️  ${gameKey}: 检查失败`);
      console.log(`   错误: ${error.response?.data?.error || error.message}\n`);
      results.errors.push({
        gameKey,
        fileName,
        error: error.response?.data?.error || error.message
      });
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
    });
  }

  if (results.missing.length > 0) {
    console.log('\n❌ 缺失的图片:');
    results.missing.forEach(item => {
      console.log(`   ${item.gameKey}: ${item.fileName} (${item.error})`);
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
    console.log('   - 所有游戏图片都不存在，需要上传游戏背景图片到OSS');
    console.log('   - 路径: kindergarten/system/games/images/');
    console.log('   - 或者修改前端使用Emoji图标（当前实现）');
  } else if (results.missing.length > 0) {
    console.log('   - 部分游戏图片缺失，建议补全以获得更好的用户体验');
  } else {
    console.log('   - 所有游戏图片都已存在，可以考虑修改前端使用OSS图片');
  }
}

// 运行检查
checkGameImagesInOSS().catch(console.error);