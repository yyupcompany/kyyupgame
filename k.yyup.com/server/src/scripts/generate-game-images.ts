#!/usr/bin/env ts-node
/**
 * 游戏图片资源批量生成脚本
 * 策略：AI生成时要求留白边框 → 裁剪边框 → 保存到指定目录
 */

import { sequelize } from '../init';
import { RefactoredMultimodalService } from '../services/ai/refactored-multimodal.service';
import path from 'path';
import fs from 'fs';
import https from 'https';
import sharp from 'sharp';

const SYSTEM_ADMIN_USER_ID = 1;

// 游戏资源目录结构
const GAME_IMAGES_BASE = path.join(__dirname, '../../../uploads/games/images');

const DIRECTORIES = {
  backgrounds: {
    princessGarden: path.join(GAME_IMAGES_BASE, 'backgrounds/princess-garden'),
    spaceAdventure: path.join(GAME_IMAGES_BASE, 'backgrounds/space-adventure'),
    fruitMemory: path.join(GAME_IMAGES_BASE, 'backgrounds/fruit-memory')
  },
  characters: {
    princess: path.join(GAME_IMAGES_BASE, 'characters/princess'),
    astronaut: path.join(GAME_IMAGES_BASE, 'characters/astronaut'),
    animals: path.join(GAME_IMAGES_BASE, 'characters/animals')
  },
  items: {
    princess: path.join(GAME_IMAGES_BASE, 'items/princess-items'),
    space: path.join(GAME_IMAGES_BASE, 'items/space-items'),
    fruits: path.join(GAME_IMAGES_BASE, 'items/fruits')
  },
  cards: {
    front: path.join(GAME_IMAGES_BASE, 'cards/card-front'),
    back: path.join(GAME_IMAGES_BASE, 'cards/card-back')
  },
  ui: path.join(GAME_IMAGES_BASE, 'ui')
};

// 创建所有目录
function createDirectories() {
  Object.values(DIRECTORIES).forEach(dir => {
    if (typeof dir === 'string') {
      fs.mkdirSync(dir, { recursive: true });
    } else {
      Object.values(dir).forEach(subDir => {
        fs.mkdirSync(subDir, { recursive: true });
      });
    }
  });
  console.log('✅ 所有目录已创建\n');
}

/**
 * 下载并处理AI生成的图片
 * 策略：裁剪10%边框（每边5%），确保主体完整
 */
async function downloadAndProcessImage(
  imageUrl: string,
  savePath: string,
  cropBorder: boolean = true
): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(imageUrl, async (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`下载失败: HTTP ${response.statusCode}`));
        return;
      }

      const chunks: Buffer[] = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', async () => {
        try {
          const imageBuffer = Buffer.concat(chunks);
          
          if (cropBorder) {
            // 策略：裁剪边框并缩小（AI生成1920x1920，需要缩小为1024x1024）
            // 1. 获取原始尺寸（应该是1920x1920）
            const metadata = await sharp(imageBuffer).metadata();
            const width = metadata.width || 1920;
            const height = metadata.height || 1920;

            console.log(`   原始图片尺寸: ${width}x${height}`);

            // 2. 计算裁剪区域（去除5%边框）
            const cropPercent = 0.05; // 每边裁剪5%
            const cropSize = {
              left: Math.round(width * cropPercent),
              top: Math.round(height * cropPercent),
              width: Math.round(width * (1 - 2 * cropPercent)),
              height: Math.round(height * (1 - 2 * cropPercent))
            };

            console.log(`   裁剪区域: ${cropSize.width}x${cropSize.height}`);

            // 3. 裁剪、缩小到1024x1024、优化压缩
            await sharp(imageBuffer)
              .extract(cropSize)
              .resize(1024, 1024, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 } // 透明背景
              })
              .png({ quality: 90, compressionLevel: 9 }) // PNG高质量
              .toFile(savePath);
          } else {
            // 不裁剪，直接缩小为1024x1024
            await sharp(imageBuffer)
              .resize(1024, 1024, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
              })
              .png({ quality: 90, compressionLevel: 9 })
              .toFile(savePath);
          }
          
          resolve();
        } catch (error) {
          reject(error);
        }
      });
      
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * 生成单张游戏图片
 */
async function generateGameImage(
  multimodalService: RefactoredMultimodalService,
  category: string,
  name: string,
  prompt: string,
  savePath: string,
  cropBorder: boolean = true
): Promise<void> {
  console.log(`\n🎨 生成图片：${category}/${name}`);
  console.log(`   提示词：${prompt.substring(0, 100)}...`);
  
  try {
    // 在提示词中强调留白边框和新尺寸要求
    const enhancedPrompt = cropBorder
      ? `${prompt}，图片四周留白10%边距，主体居中，确保完整性，超高清晰度，1920x1920分辨率`
      : `${prompt}，超高清晰度，1920x1920分辨率，质量要求极高`;
    
    const result = await multimodalService.generateImage(SYSTEM_ADMIN_USER_ID, {
      model: 'doubao-seedream-4-5-251128',
      prompt: enhancedPrompt,
      n: 1,
      size: '1920x1920' // 新模型要求至少3686400像素
    });
    
    if (!result.data || result.data.length === 0) {
      throw new Error('未返回图片URL');
    }
    
    const imageUrl = result.data[0].url;
    console.log(`   生成成功：${imageUrl}`);
    
    // 下载并处理图片
    await downloadAndProcessImage(imageUrl, savePath, cropBorder);
    
    const stats = fs.statSync(savePath);
    console.log(`   ✅ 已保存：${savePath}`);
    console.log(`   大小：${(stats.size / 1024).toFixed(1)} KB`);
    
  } catch (error: any) {
    console.error(`   ❌ 生成失败：${error.message}`);
    throw error;
  }
}

/**
 * 图片生成配置（按优先级）
 */
interface ImageConfig {
  category: string;
  subcategory: string;
  name: string;
  prompt: string;
  cropBorder?: boolean;
}

/**
 * Phase 1 MVP 图片清单（水果记忆游戏）
 */
const PHASE1_IMAGES: ImageConfig[] = [
  // 水果图片（12张）- 用于水果记忆大师
  {
    category: 'items',
    subcategory: 'fruits',
    name: 'apple.png',
    prompt: '新鲜的红苹果，卡通风格，明亮饱和色彩，圆润光滑，带叶子，投影效果，Q版可爱，透明背景PNG',
    cropBorder: true
  },
  {
    category: 'items',
    subcategory: 'fruits',
    name: 'banana.png',
    prompt: '新鲜的黄香蕉，卡通风格，明亮饱和色彩，微微弯曲，Q版可爱，透明背景PNG',
    cropBorder: true
  },
  {
    category: 'items',
    subcategory: 'fruits',
    name: 'strawberry.png',
    prompt: '新鲜的红草莓，卡通风格，明亮饱和色彩，带绿叶，籽粒清晰，Q版可爱，透明背景PNG',
    cropBorder: true
  },
  {
    category: 'items',
    subcategory: 'fruits',
    name: 'grape.png',
    prompt: '新鲜的紫葡萄，卡通风格，明亮饱和色彩，一串葡萄，圆润光泽，Q版可爱，透明背景PNG',
    cropBorder: true
  },
  {
    category: 'items',
    subcategory: 'fruits',
    name: 'orange.png',
    prompt: '新鲜的橙子，卡通风格，明亮饱和色彩，圆润，带绿叶，表面纹理，Q版可爱，透明背景PNG',
    cropBorder: true
  },
  {
    category: 'items',
    subcategory: 'fruits',
    name: 'watermelon.png',
    prompt: '新鲜的西瓜，卡通风格，明亮饱和色彩，绿色条纹，切开展示红色果肉和黑籽，Q版可爱，透明背景PNG',
    cropBorder: true
  },
  {
    category: 'items',
    subcategory: 'fruits',
    name: 'cherry.png',
    prompt: '新鲜的红樱桃，卡通风格，明亮饱和色彩，两颗连在一起，带绿叶，光泽感，Q版可爱，透明背景PNG',
    cropBorder: true
  },
  {
    category: 'items',
    subcategory: 'fruits',
    name: 'pineapple.png',
    prompt: '新鲜的菠萝，卡通风格，明亮饱和色彩，黄色果身，绿色叶冠，纹理清晰，Q版可爱，透明背景PNG',
    cropBorder: true
  },
  {
    category: 'items',
    subcategory: 'fruits',
    name: 'peach.png',
    prompt: '新鲜的粉色桃子，卡通风格，明亮饱和色彩，圆润，带绿叶，柔和投影，Q版可爱，透明背景PNG',
    cropBorder: true
  },
  {
    category: 'items',
    subcategory: 'fruits',
    name: 'lemon.png',
    prompt: '新鲜的黄柠檬，卡通风格，明亮饱和色彩，椭圆形，带绿叶，表面纹理，Q版可爱，透明背景PNG',
    cropBorder: true
  },
  {
    category: 'items',
    subcategory: 'fruits',
    name: 'kiwi.png',
    prompt: '新鲜的猕猴桃，卡通风格，明亮饱和色彩，褐色毛茸，切开展示绿色果肉，Q版可爱，透明背景PNG',
    cropBorder: true
  },
  {
    category: 'items',
    subcategory: 'fruits',
    name: 'mango.png',
    prompt: '新鲜的芒果，卡通风格，明亮饱和色彩，橙黄色，光滑表面，带绿叶，Q版可爱，透明背景PNG',
    cropBorder: true
  },
  
  // 水果背景（8张）- 用于水果记忆游戏背景
  {
    category: 'backgrounds',
    subcategory: 'fruit-memory',
    name: 'orchard-morning.png',
    prompt: '清晨的果园场景，浅绿色渐变背景，远处有果树剪影，柔和阳光，扁平插画风格，温馨自然，适合儿童，1920x1080',
    cropBorder: false
  },
  {
    category: 'backgrounds',
    subcategory: 'fruit-memory',
    name: 'fruit-market.png',
    prompt: '彩色水果市场场景，条纹遮阳棚，明亮活泼，扁平插画风格，温馨欢快，适合儿童，1920x1080',
    cropBorder: false
  },
  {
    category: 'backgrounds',
    subcategory: 'fruit-memory',
    name: 'kitchen-counter.png',
    prompt: '温馨厨房台面场景，木纹质感，浅棕色调，简洁干净，扁平插画风格，适合儿童，1920x1080',
    cropBorder: false
  },
  {
    category: 'backgrounds',
    subcategory: 'fruit-memory',
    name: 'picnic-blanket.png',
    prompt: '野餐布场景，红白格子花纹，草地背景，温馨明快，扁平插画风格，适合儿童，1920x1080',
    cropBorder: false
  },
  {
    category: 'backgrounds',
    subcategory: 'fruit-memory',
    name: 'rainbow-sky.png',
    prompt: '彩虹天空场景，梦幻渐变色（红橙黄绿蓝紫），柔和云朵，扁平插画风格，适合儿童，1920x1080',
    cropBorder: false
  },
  {
    category: 'backgrounds',
    subcategory: 'fruit-memory',
    name: 'juice-bar.png',
    prompt: '果汁吧台场景，明亮活泼，彩色条纹，现代简洁，扁平插画风格，适合儿童，1920x1080',
    cropBorder: false
  },
  {
    category: 'backgrounds',
    subcategory: 'fruit-memory',
    name: 'tropical-jungle.png',
    prompt: '热带丛林场景，绿色植物，棕榈树，自然清新，扁平插画风格，适合儿童，1920x1080',
    cropBorder: false
  },
  {
    category: 'backgrounds',
    subcategory: 'fruit-memory',
    name: 'dessert-shop.png',
    prompt: '甜品店场景，粉色温馨，可爱装饰，梦幻风格，扁平插画，适合儿童，1920x1080',
    cropBorder: false
  }
];

/**
 * 生成单个图片
 */
async function generateImage(
  multimodalService: RefactoredMultimodalService,
  config: ImageConfig
): Promise<void> {
  try {
    const { category, subcategory, name, prompt, cropBorder = true } = config;
    
    // 确定保存路径
    let saveDir: string;
    if (category === 'backgrounds') {
      saveDir = DIRECTORIES.backgrounds[subcategory as keyof typeof DIRECTORIES.backgrounds];
    } else if (category === 'characters') {
      saveDir = DIRECTORIES.characters[subcategory as keyof typeof DIRECTORIES.characters];
    } else if (category === 'items') {
      saveDir = DIRECTORIES.items[subcategory as keyof typeof DIRECTORIES.items];
    } else if (category === 'cards') {
      saveDir = DIRECTORIES.cards[subcategory as keyof typeof DIRECTORIES.cards];
    } else {
      saveDir = DIRECTORIES.ui;
    }
    
    const savePath = path.join(saveDir, name);
    
    // 检查是否已存在
    if (fs.existsSync(savePath)) {
      console.log(`⏭️  跳过（已存在）：${category}/${subcategory}/${name}`);
      return;
    }
    
    await generateGameImage(multimodalService, category, name, prompt, savePath, cropBorder);
    
  } catch (error: any) {
    console.error(`❌ 生成失败：${config.name}`, error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  let multimodalService: RefactoredMultimodalService;
  
  try {
    console.log('🎮 开始生成游戏图片资源...\n');
    
    // 初始化数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    // 创建服务实例
    multimodalService = new RefactoredMultimodalService();
    
    console.log('📁 创建目录结构...');
    createDirectories();
    
    console.log(`📊 图片清单：${PHASE1_IMAGES.length} 张\n`);
    console.log('⚡ 并发策略：每批5张，间隔15秒\n');
    
    const BATCH_SIZE = 5;
    const BATCH_DELAY = 15000;
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    const startTime = Date.now();
    
    for (let i = 0; i < PHASE1_IMAGES.length; i += BATCH_SIZE) {
      const batch = PHASE1_IMAGES.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(PHASE1_IMAGES.length / BATCH_SIZE);
      
      console.log(`\n${'='.repeat(70)}`);
      console.log(`🔄 批次 ${batchNum}/${totalBatches}: 生成 ${batch.length} 张图片`);
      console.log('='.repeat(70));
      
      const batchStartTime = Date.now();
      
      // 并发生成
      const results = await Promise.allSettled(
        batch.map(config => generateImage(multimodalService, config))
      );
      
      // 统计结果
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          const config = batch[idx];
          const filePath = path.join(
            config.category === 'backgrounds' 
              ? DIRECTORIES.backgrounds[config.subcategory as keyof typeof DIRECTORIES.backgrounds]
              : config.category === 'items'
              ? DIRECTORIES.items[config.subcategory as keyof typeof DIRECTORIES.items]
              : DIRECTORIES.ui,
            config.name
          );
          
          if (fs.existsSync(filePath)) {
            successCount++;
          } else {
            skipCount++;
          }
        } else {
          errorCount++;
        }
      });
      
      const batchElapsed = Date.now() - batchStartTime;
      console.log(`\n📊 批次 ${batchNum} 完成，耗时 ${(batchElapsed / 1000).toFixed(1)} 秒`);
      console.log(`📊 总进度：${i + batch.length}/${PHASE1_IMAGES.length} (成功: ${successCount}, 跳过: ${skipCount}, 失败: ${errorCount})`);
      
      // 等待间隔
      if (i + BATCH_SIZE < PHASE1_IMAGES.length) {
        const waitTime = Math.max(0, BATCH_DELAY - batchElapsed);
        if (waitTime > 0) {
          console.log(`⏳ 等待 ${(waitTime / 1000).toFixed(1)} 秒后处理下一批...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 图片生成完成！');
    console.log(`   成功生成：${successCount} 张`);
    console.log(`   跳过（已存在）：${skipCount} 张`);
    console.log(`   失败：${errorCount} 张`);
    console.log(`   总耗时：${Math.floor(totalTime / 60)} 分 ${totalTime % 60} 秒`);
    console.log('='.repeat(70));
    
    // 生成资源清单
    const manifest = {
      generatedAt: new Date().toISOString(),
      totalImages: successCount,
      categories: {
        backgrounds: fs.readdirSync(DIRECTORIES.backgrounds.fruitMemory).length,
        items: fs.readdirSync(DIRECTORIES.items.fruits).length
      }
    };
    
    fs.writeFileSync(
      path.join(GAME_IMAGES_BASE, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    console.log('\n✅ 资源清单已生成：uploads/games/images/manifest.json\n');
    
  } catch (error: any) {
    console.error('❌ 生成失败：', error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

