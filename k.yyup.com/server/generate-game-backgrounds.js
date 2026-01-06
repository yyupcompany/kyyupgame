#!/usr/bin/env ts-node
/**
 * 使用新豆包模型生成游戏背景图并上传到OSS
 * 为不同游戏主题生成高质量的背景图素材
 */

import { sequelize } from './src/init';
import { RefactoredMultimodalService } from './src/services/ai/refactored-multimodal.service';
import path from 'path';
import fs from 'fs';
import https from 'https';
import sharp from 'sharp';
import { SystemOSSService } from './src/services/system-oss.service';

const SYSTEM_ADMIN_USER_ID = 1;

// 背景图生成配置
const BACKGROUND_CONFIGS = [
  // 水果记忆游戏背景
  {
    category: 'fruit-memory',
    name: 'fruit-garden',
    filename: 'fruit-garden-bg.jpg',
    prompt: '温馨的果园场景，清晨阳光，各种果树环绕，绿色草地，鲜花盛开，梦幻卡通风格，色彩明亮，适合儿童游戏，高质量，1920x1080分辨率',
    description: '水果记忆游戏 - 果园场景背景'
  },
  {
    category: 'fruit-memory',
    name: 'fruit-market',
    filename: 'fruit-market-bg.jpg',
    prompt: '热闹的水果市场场景，彩色遮阳棚，各种水果摊位，人们正在挑选水果，活力四射，卡通插画风格，温馨欢快，1920x1080分辨率',
    description: '水果记忆游戏 - 市场场景背景'
  },
  {
    category: 'fruit-memory',
    name: 'kitchen-counter',
    filename: 'kitchen-bg.jpg',
    prompt: '温馨的厨房台面场景，木纹质感，干净整洁，现代化设计，浅棕色调，放置各种水果和生活用品，居家风格，1920x1080分辨率',
    description: '水果记忆游戏 - 厨房场景背景'
  },
  {
    category: 'fruit-memory',
    name: 'picnic-blanket',
    filename: 'picnic-bg.jpg',
    prompt: '野餐布场景，红白格子花纹，绿草地背景，蓝天白云，野餐篮和水果，阳光明媚，轻松愉悦的户外氛围，1920x1080分辨率',
    description: '水果记忆游戏 - 野餐场景背景'
  },

  // 公主花园找不同背景
  {
    category: 'princess-garden',
    name: 'magic-castle',
    filename: 'magic-castle-bg.jpg',
    prompt: '梦幻的粉色城堡，周围有彩虹和蝴蝶，魔法氛围，童话风格，温馨浪漫，天空有星星和月亮，适合女孩游戏，1920x1080分辨率',
    description: '公主花园 - 魔法城堡背景'
  },
  {
    category: 'princess-garden',
    name: 'flower-garden',
    filename: 'flower-garden-bg.jpg',
    prompt: '美丽的公主花园，玫瑰花海，薰衣草田，向日葵，蝴蝶飞舞，梦幻粉色调，浪漫温馨，童话城堡风格，1920x1080分辨率',
    description: '公主花园 - 花海背景'
  },
  {
    category: 'princess-garden',
    name: 'fairy-forest',
    filename: 'fairy-forest-bg.jpg',
    prompt: '神秘的精灵森林，巨大古树，发光蘑菇，萤火虫，小精灵在飞舞，魔法光芒，梦幻紫色调，神秘奇幻，1920x1080分辨率',
    description: '公主花园 - 精灵森林背景'
  },

  // 太空寻宝背景
  {
    category: 'space-treasure',
    name: 'galaxy-stars',
    filename: 'galaxy-bg.jpg',
    prompt: '浩瀚的银河系，无数星星闪烁，深蓝紫色宇宙，星云和星系，科幻感，充满探索氛围，高清宇宙场景，1920x1080分辨率',
    description: '太空寻宝 - 银河背景'
  },
  {
    category: 'space-treasure',
    name: 'space-station',
    filename: 'space-station-bg.jpg',
    prompt: '未来派太空站，金属质感，控制面板，观察窗看到地球，科技感强烈，蓝色调，精密设计，未来科技场景，1920x1080分辨率',
    description: '太空寻宝 - 空间站背景'
  },
  {
    category: 'space-treasure',
    name: 'alien-planet',
    filename: 'alien-planet-bg.jpg',
    prompt: '神秘的外星星球，奇异植物，两个月亮，紫色天空，外星地貌，充满探索和冒险氛围，科幻奇幻，1920x1080分辨率',
    description: '太空寻宝 - 外星背景'
  }
];

// 本地临时目录
const TEMP_DIR = path.join(__dirname, 'temp-backgrounds');
const GAME_IMAGES_DIR = path.join(__dirname, 'uploads/games/images/backgrounds');

// 确保目录存在
function ensureDirectories() {
  [TEMP_DIR, GAME_IMAGES_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  console.log('✅ 目录创建完成');
}

/**
 * 下载图片到本地
 */
async function downloadImage(imageUrl: string, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const filePath = path.join(TEMP_DIR, filename);
    const file = fs.createWriteStream(filePath);

    https.get(imageUrl, (response) => {
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve(filePath);
      });
    }).on('error', reject);
  });
}

/**
 * 处理图片尺寸和格式
 */
async function processImage(inputPath: string, outputPath: string): Promise<void> {
  await sharp(inputPath)
    .resize(1920, 1080, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({
      quality: 85,
      progressive: true
    })
    .toFile(outputPath);
}

/**
 * 上传图片到OSS
 */
async function uploadToOSS(filePath: string, ossKey: string): Promise<string> {
  const ossService = new SystemOSSService();

  if (!ossService.client) {
    throw new Error('OSS服务未初始化');
  }

  try {
    // 读取文件内容
    const fileContent = fs.readFileSync(filePath);

    // 上传到OSS
    const result = await ossService.uploadFile(fileContent, ossKey);

    if (!result.url) {
      throw new Error('上传失败：未返回URL');
    }

    console.log(`   ✅ OSS上传成功: ${result.url}`);
    return result.url;
  } catch (error) {
    throw new Error(`OSS上传失败: ${error.message}`);
  }
}

/**
 * 生成单个背景图
 */
async function generateBackground(config: typeof BACKGROUND_CONFIGS[0]): Promise<void> {
  try {
    console.log(`\n🎨 生成背景图: ${config.name}`);
    console.log(`   类别: ${config.category}`);
    console.log(`   描述: ${config.description}`);
    console.log(`   提示词: ${config.prompt.substring(0, 100)}...`);

    // 使用新豆包模型生成图片
    const result = await multimodalService.generateImage(SYSTEM_ADMIN_USER_ID, {
      model: 'doubao-seedream-4-5-251128',
      prompt: config.prompt,
      n: 1,
      size: '1920x1080', // 1920x1080 = 2073600像素，符合最小要求
      quality: 'high',
      style: 'natural'
    });

    if (!result || !result.data || result.data.length === 0) {
      throw new Error('生成失败：未返回有效图片数据');
    }

    const imageUrl = result.data[0].url;
    console.log(`   📥 生成成功: ${imageUrl}`);

    // 下载到本地
    console.log('   💾 下载图片...');
    const downloadedPath = await downloadImage(imageUrl, `temp-${config.filename}`);

    // 处理图片
    console.log('   🖼️ 处理图片...');
    const processedPath = path.join(TEMP_DIR, config.filename);
    await processImage(downloadedPath, processedPath);

    // 构建OSS路径
    const ossKey = `games/backgrounds/${config.category}/${config.filename}`;
    console.log(`   📤 上传到OSS: ${ossKey}`);

    // 上传到OSS
    const ossUrl = await uploadToOSS(processedPath, ossKey);

    // 保存本地备份
    const localBackupPath = path.join(GAME_IMAGES_DIR, config.category, config.filename);
    if (!fs.existsSync(path.join(GAME_IMAGES_DIR, config.category))) {
      fs.mkdirSync(path.join(GAME_IMAGES_DIR, config.category), { recursive: true });
    }
    fs.copyFileSync(processedPath, localBackupPath);

    // 清理临时文件
    fs.unlinkSync(downloadedPath);
    fs.unlinkSync(processedPath);

    console.log(`   ✅ 背景图生成完成!`);
    console.log(`   📍 OSS地址: ${ossUrl}`);
    console.log(`   💾 本地备份: ${localBackupPath}`);

  } catch (error: any) {
    console.error(`   ❌ 生成失败: ${config.name} - ${error.message}`);
    throw error;
  }
}

// 全局变量
let multimodalService: any;

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 开始生成游戏背景图...\n');

    // 初始化数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 创建服务实例
    multimodalService = new RefactoredMultimodalService();
    console.log('✅ 多模态服务初始化成功\n');

    // 确保目录存在
    ensureDirectories();

    console.log(`📋 背景图生成清单: ${BACKGROUND_CONFIGS.length} 张\n`);
    console.log('⚡ 使用模型: doubao-seedream-4-5-251128 (1920x1080)\n');

    let successCount = 0;
    let errorCount = 0;
    const startTime = Date.now();

    // 逐个生成背景图（避免并发过大）
    for (let i = 0; i < BACKGROUND_CONFIGS.length; i++) {
      const config = BACKGROUND_CONFIGS[i];
      const progress = Math.round(((i + 1) / BACKGROUND_CONFIGS.length) * 100);

      console.log(`${'='.repeat(60)}`);
      console.log(`🔄 ${progress}% - 正在处理: ${config.name}`);
      console.log(`${'='.repeat(60)}`);

      try {
        await generateBackground(config);
        successCount++;
      } catch (error: any) {
        console.error(`❌ 处理失败: ${config.name} - ${error.message}`);
        errorCount++;
      }

      // 短暂延迟，避免API限制
      if (i < BACKGROUND_CONFIGS.length - 1) {
        console.log('⏳ 等待5秒后继续下一个...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    const totalTime = Math.round((Date.now() - startTime) / 1000);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 背景图生成完成！');
    console.log(`   成功生成: ${successCount} 张`);
    console.log(`   失败: ${errorCount} 张`);
    console.log(`   总耗时: ${Math.floor(totalTime / 60)} 分 ${totalTime % 60} 秒`);
    console.log(`   平均耗时: ${(totalTime / BACKGROUND_CONFIGS.length).toFixed(1)} 秒/张`);
    console.log('='.repeat(60));

    // 生成清单文件
    const manifest = {
      generatedAt: new Date().toISOString(),
      totalImages: successCount,
      categories: {
        'fruit-memory': 4,
        'princess-garden': 3,
        'space-treasure': 3
      },
      model: 'doubao-seedream-4-5-251128',
      resolution: '1920x1080'
    };

    fs.writeFileSync(
      path.join(GAME_IMAGES_DIR, 'backgrounds-manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    console.log('\n✅ 背景图清单已生成: uploads/games/images/backgrounds-manifest.json');

  } catch (error: any) {
    console.error('❌ 生成失败:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// 运行
if (require.main === module) {
  main();
}