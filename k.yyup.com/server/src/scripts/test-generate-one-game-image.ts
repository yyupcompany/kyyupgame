#!/usr/bin/env ts-node
/**
 * 测试生成单张游戏图片 - 验证留白边框策略
 */

import { sequelize } from '../init';
import { RefactoredMultimodalService } from '../services/ai/refactored-multimodal.service';
import path from 'path';
import fs from 'fs';
import https from 'https';
import sharp from 'sharp';

const SYSTEM_ADMIN_USER_ID = 1;

const TEST_DIR = path.join(__dirname, '../../../uploads/games/images/test');

// 创建测试目录
if (!fs.existsSync(TEST_DIR)) {
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

/**
 * 下载并处理图片
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
          
          console.log(`   原始大小：${(imageBuffer.length / 1024).toFixed(1)} KB`);
          
          if (cropBorder) {
            // 获取原始尺寸
            const metadata = await sharp(imageBuffer).metadata();
            const width = metadata.width || 1024;
            const height = metadata.height || 1024;
            
            console.log(`   原始尺寸：${width} × ${height}`);
            
            // 计算裁剪区域（每边裁剪5%）
            const cropPercent = 0.05;
            const cropSize = {
              left: Math.round(width * cropPercent),
              top: Math.round(height * cropPercent),
              width: Math.round(width * (1 - 2 * cropPercent)),
              height: Math.round(height * (1 - 2 * cropPercent))
            };
            
            console.log(`   裁剪区域：left=${cropSize.left}, top=${cropSize.top}, ${cropSize.width}×${cropSize.height}`);
            
            // 裁剪、调整大小、保存为PNG
            await sharp(imageBuffer)
              .extract(cropSize)
              .resize(1024, 1024, { 
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 } // 透明背景
              })
              .png({ quality: 90, compressionLevel: 9 })
              .toFile(savePath);
          } else {
            // 不裁剪，直接保存
            await sharp(imageBuffer)
              .resize(1920, 1080, { fit: 'cover' })
              .png({ quality: 90 })
              .toFile(savePath);
          }
          
          const stats = fs.statSync(savePath);
          console.log(`   处理后大小：${(stats.size / 1024).toFixed(1)} KB`);
          
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
    console.log('🎨 测试游戏图片生成（留白边框策略）\n');
    
    // 初始化数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    // 创建服务实例
    const multimodalService = new RefactoredMultimodalService();
    
    // 测试1：水果图片（需要裁剪边框）
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 测试1：生成水果图片（带留白边框）');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const fruitPrompt = `新鲜的红苹果，卡通风格，明亮饱和色彩，圆润光滑，带绿叶，
投影效果，Q版可爱，透明背景PNG，图片四周留白10%边距，主体居中，确保完整性，
高清晰度，1024x1024`;
    
    console.log('🎨 生成图片...');
    console.log(`   提示词：${fruitPrompt}\n`);
    
    const result = await multimodalService.generateImage(SYSTEM_ADMIN_USER_ID, {
      model: 'doubao-seedream-3-0-t2i-250415',
      prompt: fruitPrompt,
      n: 1,
      size: '1024x1024'
    });
    
    if (!result.data || result.data.length === 0) {
      throw new Error('未返回图片URL');
    }
    
    const imageUrl = result.data[0].url;
    console.log(`✅ AI生成成功：${imageUrl}\n`);
    
    console.log('🔧 处理图片（裁剪5%边框）...');
    const savePath = path.join(TEST_DIR, 'test_apple_with_crop.png');
    await downloadAndProcessImage(imageUrl, savePath, true);
    
    console.log(`✅ 已保存：${savePath}\n`);
    
    // 测试2：背景图片（不裁剪）
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 测试2：生成背景图片（不裁剪）');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const bgPrompt = `清晨的果园场景，浅绿色渐变背景，远处有果树剪影，柔和阳光，
扁平插画风格，温馨自然，适合儿童，1920x1080，高清`;
    
    console.log('🎨 生成背景图...');
    console.log(`   提示词：${bgPrompt}\n`);
    
    const bgResult = await multimodalService.generateImage(SYSTEM_ADMIN_USER_ID, {
      model: 'doubao-seedream-3-0-t2i-250415',
      prompt: bgPrompt,
      n: 1,
      size: '1024x1024' // 先生成1024，再resize到1920x1080
    });
    
    if (!bgResult.data || bgResult.data.length === 0) {
      throw new Error('未返回图片URL');
    }
    
    const bgImageUrl = bgResult.data[0].url;
    console.log(`✅ AI生成成功：${bgImageUrl}\n`);
    
    console.log('🔧 处理背景图（不裁剪，resize到1920x1080）...');
    const bgSavePath = path.join(TEST_DIR, 'test_orchard_background.png');
    await downloadAndProcessImage(bgImageUrl, bgSavePath, false);
    
    console.log(`✅ 已保存：${bgSavePath}\n`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 测试完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n请检查生成的图片：');
    console.log(`   1. ${savePath}`);
    console.log(`   2. ${bgSavePath}`);
    console.log('\n验证要点：');
    console.log('   ✓ 苹果主体是否完整（没有被裁切）');
    console.log('   ✓ 背景是否有边缘（透明部分）');
    console.log('   ✓ 图片质量是否清晰');
    console.log('   ✓ 文件大小是否合理\n');
    
  } catch (error: any) {
    console.error('❌ 测试失败：', error.message);
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

