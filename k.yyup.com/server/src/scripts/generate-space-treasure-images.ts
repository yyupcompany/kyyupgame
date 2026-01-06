#!/usr/bin/env ts-node
/**
 * 生成太空寻宝大冒险游戏的AI图片
 */

import { sequelize } from '../init';
import { RefactoredMultimodalService } from '../services/ai/refactored-multimodal.service';
import fs from 'fs';
import path from 'path';
import https from 'https';
import sharp from 'sharp';

const SYSTEM_ADMIN_USER_ID = 1;

// 太空场景主题
const SCENE_THEMES = [
  {
    name: 'space-station-1',
    prompt: '宇宙空间站内部场景，蓝色科技风格，闪烁的控制台、漂浮的能量球、神秘的外星装置、科技感十足，儿童友好，卡通风格，明亮色彩，留白边框10%',
    description: '空间站内部'
  },
  {
    name: 'alien-planet-1',
    prompt: '神秘外星球表面，紫色和橙色相间的岩石、奇特的外星植物、发光的水晶矿石、远处的双月，科幻风格，儿童友好，卡通风格，留白边框10%',
    description: '外星球表面'
  },
  {
    name: 'asteroid-field',
    prompt: '小行星带场景，漂浮的巨大小行星、闪烁的星云、五彩缤纷的太空尘埃、远处的星系，蓝紫色调，科幻风格，儿童友好，留白边框10%',
    description: '小行星带'
  },
  {
    name: 'moon-base',
    prompt: '月球基地场景，银白色穹顶建筑、蓝色能量屏障、机器人助手、火箭发射台、地球在天空中，科技感，儿童友好，卡通风格，留白边框10%',
    description: '月球基地'
  },
  {
    name: 'nebula-cloud',
    prompt: '美丽的星云深处，五彩斑斓的气体云、闪烁的新生恒星、漂浮的太空碎片、神秘光芒，梦幻色彩，科幻风格，儿童友好，留白边框10%',
    description: '星云深处'
  }
];

// 输出目录
const OUTPUT_DIR = path.join(__dirname, '../../../uploads/games/images/scenes/space-treasure');

// 确保输出目录存在
async function ensureOutputDir(): Promise<void> {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ 创建输出目录: ${OUTPUT_DIR}`);
  }
}

// 下载并处理AI生成的图片
async function downloadAndProcessImage(
  imageUrl: string,
  savePath: string
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
          
          const metadata = await sharp(imageBuffer).metadata();
          const width = metadata.width || 1024;
          const height = metadata.height || 1024;
          const cropPercent = 0.05;
          const cropSize = {
            left: Math.round(width * cropPercent),
            top: Math.round(height * cropPercent),
            width: Math.round(width * (1 - 2 * cropPercent)),
            height: Math.round(height * (1 - 2 * cropPercent))
          };

          await sharp(imageBuffer)
            .extract(cropSize)
            .resize(1024, 1024, {
              fit: 'contain',
              background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .png({ quality: 90, compressionLevel: 9 })
            .toFile(savePath);

          const stats = fs.statSync(savePath);
          const sizeKB = Math.round(stats.size / 1024);
          console.log(`   ✅ 已保存: ${path.basename(savePath)} (${sizeKB}KB)`);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
      
      response.on('error', reject);
    }).on('error', reject);
  });
}

// 生成单张图片
async function generateImage(
  multimodalService: RefactoredMultimodalService,
  theme: typeof SCENE_THEMES[0]
): Promise<void> {
  const filename = `${theme.name}.png`;
  const outputPath = path.join(OUTPUT_DIR, filename);

  if (fs.existsSync(outputPath)) {
    console.log(`⏭️  跳过已存在的图片: ${filename}`);
    return;
  }

  try {
    console.log(`\n🎨 正在生成: ${theme.description}...`);
    console.log(`   提示词: ${theme.prompt.substring(0, 60)}...`);
    
    const result = await multimodalService.generateImage(SYSTEM_ADMIN_USER_ID, {
      model: 'doubao-seedream-3-0-t2i-250415',
      prompt: theme.prompt,
      n: 1,
      size: '1024x1024'
    });

    if (!result.data || result.data.length === 0 || !result.data[0].url) {
      throw new Error('图片生成失败：未返回图片URL');
    }

    const imageUrl = result.data[0].url;
    console.log(`   📥 下载图片: ${imageUrl}`);

    await downloadAndProcessImage(imageUrl, outputPath);

  } catch (error: any) {
    console.error(`   ❌ 生成失败: ${filename}`);
    console.error(`   错误: ${error.message}`);
    throw error;
  }
}

// 批量生成所有场景图片
async function generateAllScenes(): Promise<void> {
  console.log('🚀 开始生成太空寻宝大冒险游戏图片...\n');
  console.log(`📁 输出目录: ${OUTPUT_DIR}\n`);

  await ensureOutputDir();
  await sequelize.authenticate();
  console.log('✅ 数据库连接成功\n');

  const multimodalService = new RefactoredMultimodalService();

  let successCount = 0;
  let failCount = 0;
  const totalImages = SCENE_THEMES.length;
  const batchSize = 5;
  
  console.log(`📊 总共 ${totalImages} 张图片，分 ${Math.ceil(totalImages / batchSize)} 批次生成\n`);
  
  for (let i = 0; i < SCENE_THEMES.length; i += batchSize) {
    const batch = SCENE_THEMES.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(SCENE_THEMES.length / batchSize);
    
    console.log(`\n🚀 第 ${batchNum}/${totalBatches} 批：并发生成 ${batch.length} 张图片...`);
    
    const promises = batch.map(theme => 
      generateImage(multimodalService, theme)
        .then(() => { successCount++; })
        .catch(() => { failCount++; })
    );
    
    await Promise.all(promises);
    
    if (i + batchSize < SCENE_THEMES.length) {
      console.log(`\n⏳ 等待20秒后继续下一批...`);
      await new Promise(resolve => setTimeout(resolve, 20000));
    }
  }

  await sequelize.close();

  console.log('\n' + '='.repeat(60));
  console.log('🎉 图片生成完成！');
  console.log(`✅ 成功: ${successCount}/${totalImages}`);
  console.log(`❌ 失败: ${failCount}/${totalImages}`);
  console.log(`📁 输出目录: ${OUTPUT_DIR}`);
  console.log('='.repeat(60));
}

async function main(): Promise<void> {
  try {
    await generateAllScenes();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ 发生错误:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { generateAllScenes };

