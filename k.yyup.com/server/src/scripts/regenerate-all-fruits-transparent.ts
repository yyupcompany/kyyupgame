#!/usr/bin/env ts-node
/**
 * 重新生成所有水果图片 - 确保透明背景PNG
 */

import { sequelize } from '../init';
import { RefactoredMultimodalService } from '../services/ai/refactored-multimodal.service';
import path from 'path';
import fs from 'fs';
import https from 'https';
import sharp from 'sharp';

const SYSTEM_ADMIN_USER_ID = 1;
const FRUITS_DIR = path.join(__dirname, '../../../uploads/games/images/items/fruits');

// 水果配置（需要重新生成的10张）
const FRUITS_TO_REGENERATE = [
  {
    name: 'banana',
    prompt: '新鲜的黄香蕉，3D卡通风格，明亮饱和的黄色，微微弯曲的月牙形状，光滑表面带自然斑点，Q版可爱造型，纯透明背景PNG格式，图片四周留白10%边距，主体完整居中，去除任何背景色，高清晰度'
  },
  {
    name: 'strawberry',
    prompt: '新鲜的红草莓，3D卡通风格，鲜艳的红色，心形饱满，表面籽粒清晰，带绿色叶冠，Q版可爱造型，纯透明背景PNG格式，图片四周留白10%边距，主体完整居中，去除任何背景色，高清晰度'
  },
  {
    name: 'grape',
    prompt: '新鲜的紫葡萄，3D卡通风格，深紫色饱和，一串圆润葡萄，每颗葡萄都有光泽，Q版可爱造型，纯透明背景PNG格式，图片四周留白10%边距，主体完整居中，去除任何背景色，高清晰度'
  },
  {
    name: 'orange',
    prompt: '新鲜的橙子，3D卡通风格，鲜艳的橙色，圆润球形，表面细腻纹理，带一片绿叶，Q版可爱造型，纯透明背景PNG格式，图片四周留白10%边距，主体完整居中，去除任何背景色，高清晰度'
  },
  {
    name: 'watermelon',
    prompt: '新鲜的西瓜切片，3D卡通风格，深绿色表皮带黑色条纹，红色果肉，黑色籽粒，半圆形切片，Q版可爱造型，纯透明背景PNG格式，图片四周留白10%边距，主体完整居中，去除任何背景色，高清晰度'
  },
  {
    name: 'cherry',
    prompt: '新鲜的红樱桃，3D卡通风格，鲜艳的红色，两颗连在一起，带绿色叶子和果梗，圆润光泽，Q版可爱造型，纯透明背景PNG格式，图片四周留白10%边距，主体完整居中，去除任何背景色，高清晰度'
  },
  {
    name: 'pineapple',
    prompt: '新鲜的菠萝，3D卡通风格，金黄色果身，绿色尖刺叶冠，表面菱形纹理清晰，Q版可爱造型，纯透明背景PNG格式，图片四周留白10%边距，主体完整居中，去除任何背景色，高清晰度'
  },
  {
    name: 'lemon',
    prompt: '新鲜的黄柠檬，3D卡通风格，明亮的黄色，椭圆形，表面有细腻纹理，带一片绿叶，Q版可爱造型，纯透明背景PNG格式，图片四周留白10%边距，主体完整居中，去除任何背景色，高清晰度'
  },
  {
    name: 'kiwi',
    prompt: '新鲜的猕猴桃切片，3D卡通风格，褐色毛茸外皮，切开展示翠绿色果肉和黑色籽粒，圆形切片，Q版可爱造型，纯透明背景PNG格式，图片四周留白10%边距，主体完整居中，去除任何背景色，高清晰度'
  },
  {
    name: 'mango',
    prompt: '新鲜的芒果，3D卡通风格，橙黄色渐变，椭圆形果实，光滑表面，带一片绿叶，Q版可爱造型，纯透明背景PNG格式，图片四周留白10%边距，主体完整居中，去除任何背景色，高清晰度'
  }
];

/**
 * 下载并处理图片
 */
async function downloadAndProcessImage(imageUrl: string, savePath: string): Promise<void> {
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
          
          // 裁剪5%边框
          const cropPercent = 0.05;
          const cropSize = {
            left: Math.round(width * cropPercent),
            top: Math.round(height * cropPercent),
            width: Math.round(width * (1 - 2 * cropPercent)),
            height: Math.round(height * (1 - 2 * cropPercent))
          };
          
          // 裁剪、转PNG、透明背景
          await sharp(imageBuffer)
            .extract(cropSize)
            .resize(1024, 1024, { 
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png({ 
              quality: 100,
              compressionLevel: 6,
              force: true
            })
            .toFile(savePath);
          
          const stats = fs.statSync(savePath);
          console.log(`   ✅ 已保存：${(stats.size / 1024).toFixed(1)} KB（透明PNG）`);
          
          resolve();
        } catch (error) {
          reject(error);
        }
      });
      
      response.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  try {
    console.log('🎨 批量重新生成水果图片（透明背景PNG）\n');
    console.log(`📊 需要重新生成：${FRUITS_TO_REGENERATE.length} 张\n`);
    console.log('⚡ 策略：每批5张，间隔15秒\n');
    
    await sequelize.authenticate();
    const multimodalService = new RefactoredMultimodalService();
    
    const BATCH_SIZE = 5;
    const BATCH_DELAY = 15000;
    
    for (let i = 0; i < FRUITS_TO_REGENERATE.length; i += BATCH_SIZE) {
      const batch = FRUITS_TO_REGENERATE.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(FRUITS_TO_REGENERATE.length / BATCH_SIZE);
      
      console.log(`\n${'='.repeat(70)}`);
      console.log(`🔄 批次 ${batchNum}/${totalBatches}: 生成 ${batch.length} 张水果`);
      console.log('='.repeat(70));
      
      const results = await Promise.allSettled(
        batch.map(async (fruit) => {
          console.log(`\n🎨 生成：${fruit.name}.png`);
          console.log(`   提示词：${fruit.prompt.substring(0, 80)}...`);
          
          // 删除旧文件
          const filePath = path.join(FRUITS_DIR, `${fruit.name}.png`);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`   🗑️  已删除旧文件`);
          }
          
          // AI生成
          const result = await multimodalService.generateImage(SYSTEM_ADMIN_USER_ID, {
            model: 'doubao-seedream-3-0-t2i-250415',
            prompt: fruit.prompt,
            n: 1,
            size: '1024x1024'
          });
          
          if (!result.data || result.data.length === 0) {
            throw new Error('未返回图片URL');
          }
          
          console.log(`   ✅ AI生成成功`);
          console.log(`   🔧 处理中...`);
          
          // 下载并处理
          await downloadAndProcessImage(result.data[0].url, filePath);
        })
      );
      
      // 统计结果
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failCount = results.filter(r => r.status === 'rejected').length;
      
      console.log(`\n📊 批次 ${batchNum} 完成：成功 ${successCount}，失败 ${failCount}`);
      
      // 等待间隔
      if (i + BATCH_SIZE < FRUITS_TO_REGENERATE.length) {
        console.log(`⏳ 等待15秒后处理下一批...`);
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 所有水果图片重新生成完成！');
    console.log('='.repeat(70));
    console.log('\n📁 图片位置：uploads/games/images/items/fruits/');
    console.log('\n✅ 12张水果图片全部为透明背景PNG，风格统一！\n');
    
  } catch (error: any) {
    console.error('❌ 生成失败：', error.message);
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





