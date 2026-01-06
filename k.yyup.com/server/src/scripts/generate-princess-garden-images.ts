#!/usr/bin/env ts-node
/**
 * 生成公主花园找不同游戏的AI图片
 * 策略：生成多组公主花园场景图片，用于找不同游戏
 */

import { sequelize } from '../init';
import { RefactoredMultimodalService } from '../services/ai/refactored-multimodal.service';
import fs from 'fs';
import path from 'path';
import https from 'https';
import sharp from 'sharp';

const SYSTEM_ADMIN_USER_ID = 1;

// 公主花园场景主题
const SCENE_THEMES = [
  {
    name: 'magic-castle',
    prompt: '可爱的公主站在粉色魔法城堡前，周围有蝴蝶飞舞、玫瑰花盛开、小鸟歌唱，梦幻童话风格，温馨明亮，儿童友好，扁平插画风格，留白边框10%',
    description: '魔法城堡场景'
  },
  {
    name: 'flower-garden',
    prompt: '金发公主在美丽的花园里，粉色玫瑰、紫色薰衣草、黄色向日葵环绕，蝴蝶翩翩起舞，阳光明媚，梦幻童话风格，温馨甜美，儿童友好，扁平插画风格，留白边框10%',
    description: '花园场景'
  },
  {
    name: 'tea-party',
    prompt: '可爱公主和小动物们一起喝下午茶，粉色桌布、精美茶具、美味点心，小兔子、小熊、小鸟围坐，梦幻童话风格，温馨欢快，儿童友好，扁平插画风格，留白边框10%',
    description: '茶会场景'
  },
  {
    name: 'fairy-forest',
    prompt: '小公主在梦幻森林里，粉色蘑菇、闪光萤火虫、彩虹瀑布、魔法树木，精灵在树间飞舞，梦幻童话风格，神秘奇幻，儿童友好，扁平插画风格，留白边框10%',
    description: '精灵森林场景'
  },
  {
    name: 'royal-bedroom',
    prompt: '公主的梦幻卧室，粉色四柱床、水晶吊灯、毛绒玩具、魔法镜子、飘窗上的花朵，温馨浪漫，梦幻童话风格，儿童友好，扁平插画风格，留白边框10%',
    description: '皇家卧室场景'
  }
];

// 输出目录
const OUTPUT_DIR = path.join(__dirname, '../../../uploads/games/images/scenes/princess-garden');

/**
 * 确保输出目录存在
 */
async function ensureOutputDir(): Promise<void> {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ 创建输出目录: ${OUTPUT_DIR}`);
  }
}

/**
 * 下载并处理AI生成的图片
 */
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
          
          // 裁剪5%边框（去除AI生成的边缘瑕疵）
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

/**
 * 生成单张图片
 */
async function generateImage(
  multimodalService: RefactoredMultimodalService,
  theme: typeof SCENE_THEMES[0],
  version: 'A' | 'B'
): Promise<void> {
  const filename = `${theme.name}-${version}.png`;
  const outputPath = path.join(OUTPUT_DIR, filename);

  // 如果文件已存在，跳过
  if (fs.existsSync(outputPath)) {
    console.log(`⏭️  跳过已存在的图片: ${filename}`);
    return;
  }

  try {
    console.log(`\n🎨 正在生成: ${theme.description} - 版本${version}...`);
    console.log(`   提示词: ${theme.prompt.substring(0, 60)}...`);
    
    // 调用AI图片生成服务
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

    // 下载并处理图片
    await downloadAndProcessImage(imageUrl, outputPath);

  } catch (error: any) {
    console.error(`   ❌ 生成失败: ${filename}`);
    console.error(`   错误: ${error.message}`);
    throw error;
  }
}

/**
 * 批量生成所有场景图片（并发优化版）
 */
async function generateAllScenes(): Promise<void> {
  console.log('🎨 开始生成公主花园找不同游戏图片...\n');
  console.log(`📁 输出目录: ${OUTPUT_DIR}\n`);

  await ensureOutputDir();

  // 初始化数据库连接
  await sequelize.authenticate();
  console.log('✅ 数据库连接成功\n');

  // 创建服务实例
  const multimodalService = new RefactoredMultimodalService();

  let successCount = 0;
  let failCount = 0;
  
  // 准备所有图片任务（5个场景 × 2个版本 = 10张图片）
  const allTasks: Array<{ theme: typeof SCENE_THEMES[0], version: 'A' | 'B' }> = [];
  SCENE_THEMES.forEach(theme => {
    allTasks.push({ theme, version: 'A' });
    allTasks.push({ theme, version: 'B' });
  });
  
  const totalImages = allTasks.length;
  const batchSize = 5; // 每批并发生成5张图片
  
  console.log(`📊 总共 ${totalImages} 张图片，分 ${Math.ceil(totalImages / batchSize)} 批次生成\n`);
  
  // 分批并发生成
  for (let i = 0; i < allTasks.length; i += batchSize) {
    const batch = allTasks.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(allTasks.length / batchSize);
    
    console.log(`\n🚀 第 ${batchNum}/${totalBatches} 批：并发生成 ${batch.length} 张图片...`);
    
    // 并发生成当前批次的所有图片
    const promises = batch.map(task => 
      generateImage(multimodalService, task.theme, task.version)
        .then(() => { successCount++; })
        .catch((error) => {
          console.error(`   ❌ 批次失败: ${task.theme.name}-${task.version}`);
          failCount++;
        })
    );
    
    await Promise.all(promises);
    
    // 如果还有下一批，等待20秒
    if (i + batchSize < allTasks.length) {
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

/**
 * 主函数
 */
async function main(): Promise<void> {
  try {
    await generateAllScenes();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ 发生错误:', error.message);
    process.exit(1);
  }
}

// 执行
if (require.main === module) {
  main();
}

export { generateAllScenes };

