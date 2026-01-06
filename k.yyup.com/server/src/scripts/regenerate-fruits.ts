#!/usr/bin/env ts-node
/**
 * 重新生成苹果和桃子图片 - 确保透明背景
 */

import { sequelize } from '../init';
import { RefactoredMultimodalService } from '../services/ai/refactored-multimodal.service';
import path from 'path';
import fs from 'fs';
import https from 'https';
import sharp from 'sharp';

const SYSTEM_ADMIN_USER_ID = 1;
const FRUITS_DIR = path.join(__dirname, '../../../uploads/games/images/items/fruits');

/**
 * 下载并处理图片（确保透明背景）
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
          
          console.log(`   原始尺寸：${width} × ${height}`);
          
          // 裁剪5%边框
          const cropPercent = 0.05;
          const cropSize = {
            left: Math.round(width * cropPercent),
            top: Math.round(height * cropPercent),
            width: Math.round(width * (1 - 2 * cropPercent)),
            height: Math.round(height * (1 - 2 * cropPercent))
          };
          
          // 裁剪并转换为PNG（透明背景）
          await sharp(imageBuffer)
            .extract(cropSize)
            .resize(1024, 1024, { 
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 } // 完全透明背景
            })
            .png({ 
              quality: 100,
              compressionLevel: 6,
              force: true // 强制转换为PNG
            })
            .toFile(savePath);
          
          const stats = fs.statSync(savePath);
          console.log(`   处理后大小：${(stats.size / 1024).toFixed(1)} KB`);
          console.log(`   ✅ 已保存为透明PNG\n`);
          
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
    console.log('🎨 重新生成苹果和桃子图片（透明背景PNG）\n');
    
    await sequelize.authenticate();
    const multimodalService = new RefactoredMultimodalService();
    
    // 1. 生成苹果
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🍎 生成苹果（透明背景PNG）');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const applePrompt = `新鲜的红苹果，3D卡通风格，明亮饱和色彩，圆润光滑表面，
带一片绿叶，细腻投影效果，Q版可爱造型，纯透明背景PNG格式，
图片四周留白10%边距，主体居中，确保水果完整性，去除任何背景色和杂物，
高清晰度，1024x1024`;
    
    console.log(`🎨 AI生成中...\n提示词：${applePrompt}\n`);
    
    const appleResult = await multimodalService.generateImage(SYSTEM_ADMIN_USER_ID, {
      model: 'doubao-seedream-3-0-t2i-250415',
      prompt: applePrompt,
      n: 1,
      size: '1024x1024'
    });
    
    if (!appleResult.data || appleResult.data.length === 0) {
      throw new Error('苹果图片生成失败');
    }
    
    console.log(`✅ AI生成成功\n`);
    console.log('🔧 下载并处理（裁剪边框、转PNG）...');
    await downloadAndProcessImage(
      appleResult.data[0].url,
      path.join(FRUITS_DIR, 'apple.png')
    );
    
    // 等待5秒
    console.log('⏳ 等待5秒...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 2. 生成桃子
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🍑 生成桃子（透明背景PNG）');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const peachPrompt = `新鲜的粉色桃子，3D卡通风格，明亮饱和色彩，圆润柔软，
表面有细腻绒毛质感，带两片绿叶，投影效果，Q版可爱造型，
纯透明背景PNG格式，图片四周留白10%边距，主体居中，
确保水果完整性，去除任何背景色和杂物，高清晰度，1024x1024`;
    
    console.log(`🎨 AI生成中...\n提示词：${peachPrompt}\n`);
    
    const peachResult = await multimodalService.generateImage(SYSTEM_ADMIN_USER_ID, {
      model: 'doubao-seedream-3-0-t2i-250415',
      prompt: peachPrompt,
      n: 1,
      size: '1024x1024'
    });
    
    if (!peachResult.data || peachResult.data.length === 0) {
      throw new Error('桃子图片生成失败');
    }
    
    console.log(`✅ AI生成成功\n`);
    console.log('🔧 下载并处理（裁剪边框、转PNG）...');
    await downloadAndProcessImage(
      peachResult.data[0].url,
      path.join(FRUITS_DIR, 'peach.png')
    );
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 重新生成完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('生成的图片：');
    console.log(`  🍎 ${path.join(FRUITS_DIR, 'apple.png')}`);
    console.log(`  🍑 ${path.join(FRUITS_DIR, 'peach.png')}`);
    console.log('\n请检查背景是否为透明！\n');
    
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





