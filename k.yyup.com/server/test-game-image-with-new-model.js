/**
 * 使用新豆包模型测试生成一张游戏图片
 */

const { sequelize } = require('./src/init');
const { RefactoredMultimodalService } = require('./src/services/ai/refactored-multimodal.service');
const path = require('path');
const fs = require('fs');
const https = require('https');

const SYSTEM_ADMIN_USER_ID = 1;

// 下载图片到本地
async function downloadImage(imageUrl, filename) {
  return new Promise((resolve, reject) => {
    const uploadsDir = path.join(__dirname, 'uploads/test-game-images');

    // 确保目录存在
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    const file = fs.createWriteStream(filePath);

    https.get(imageUrl, (response) => {
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        const relativePath = `uploads/test-game-images/${filename}`;
        console.log(`✅ 游戏图片已保存: ${relativePath}`);
        resolve(relativePath);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

async function testGenerateGameImage() {
  try {
    console.log('🎮 测试使用新豆包模型生成游戏图片...\n');

    // 初始化数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 创建服务实例
    const multimodalService = new RefactoredMultimodalService();
    console.log('✅ 多模态服务初始化成功\n');

    // 测试生成苹果图片（游戏中的水果道具）
    console.log('🍎 生成游戏道具：红苹果');
    const fruitPrompt = '新鲜的红苹果，卡通风格，游戏美术风格，明亮饱和色彩，圆润光滑，带绿叶，Q版可爱，透明背景PNG，超高清晰度，1920x1920分辨率，适合儿童游戏';

    console.log(`📝 提示词: ${fruitPrompt.substring(0, 100)}...\n`);

    const startTime = Date.now();

    // 调用新豆包模型生成图片
    const result = await multimodalService.generateImage(SYSTEM_ADMIN_USER_ID, {
      model: 'doubao-seedream-4-5-251128',
      prompt: fruitPrompt,
      n: 1,
      size: '1920x1920',
      quality: 'high',
      style: 'natural'
    });

    const duration = Date.now() - startTime;

    console.log(`⏱️  生成耗时: ${duration}ms (${(duration/1000).toFixed(1)}秒)\n`);

    if (result && result.data && result.data.length > 0) {
      const imageUrl = result.data[0].url;
      console.log('✅ 游戏图片生成成功！');
      console.log(`   使用模型: ${result.modelUsed || 'doubao-seedream-4-5-251128'}`);
      console.log(`   图片尺寸: ${result.data[0].size}`);
      console.log(`   原始URL: ${imageUrl}`);

      // 下载图片
      const filename = `game-apple-${Date.now()}.png`;
      const localPath = await downloadImage(imageUrl, filename);

      console.log('\n🎉 游戏图片测试完成！');
      console.log(`   本地路径: ${localPath}`);
      console.log(`   生成时间: ${(duration/1000).toFixed(1)}秒`);
      console.log(`   模型版本: Doubao SeedDream 4.5`);
      console.log(`   用途: 游戏道具素材`);

    } else {
      console.error('❌ 生成失败: 未返回有效图片数据');
      console.error('返回结果:', JSON.stringify(result, null, 2));
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('错误详情:', error.stack);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// 运行测试
testGenerateGameImage();