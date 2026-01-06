#!/usr/bin/env ts-node
/**
 * 测试豆包新模型 doubao-seedream-4-5-251128 图片生成功能
 */

import { sequelize } from './src/init';
import { RefactoredMultimodalService } from './src/services/ai/refactored-multimodal.service';
import path from 'path';
import fs from 'fs';
import https from 'https';

const SYSTEM_ADMIN_USER_ID = 1;

// 下载图片到本地
async function downloadImage(imageUrl: string, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadsDir = path.join(__dirname, '../uploads/test-images');

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
        const relativePath = `/uploads/test-images/${filename}`;
        console.log(`✅ 图片已保存: ${relativePath}`);
        resolve(relativePath);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

/**
 * 测试生成一张图片
 */
async function testGenerateImage(): Promise<void> {
  try {
    console.log('🚀 开始测试豆包新模型图片生成...\n');

    // 初始化数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 创建服务实例
    const multimodalService = new RefactoredMultimodalService();
    console.log('✅ 多模态服务初始化成功\n');

    // 测试提示词
    const testPrompt = '新鲜的红苹果，卡通风格，明亮饱和色彩，圆润光滑，带叶子，投影效果，Q版可爱，透明背景PNG';

    console.log(`🎨 测试模型: doubao-seedream-4-5-251128`);
    console.log(`📝 测试提示词: ${testPrompt}\n`);

    // 调用图片生成
    const result = await multimodalService.generateImage(SYSTEM_ADMIN_USER_ID, {
      model: 'doubao-seedream-4-5-251128',
      prompt: testPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'natural',
      responseFormat: 'url'
    });

    console.log('📊 生成结果:');
    console.log(`   - 成功: ${result ? '是' : '否'}`);
    console.log(`   - 使用模型: ${result?.modelUsed || '未知'}`);
    console.log(`   - 返回数据: ${result?.data ? Array.isArray(result.data) ? result.data.length + '张' : '有数据' : '无数据'}\n`);

    if (result && result.data && result.data.length > 0) {
      const imageUrl = result.data[0].url;
      console.log(`🔗 图片URL: ${imageUrl}\n`);

      // 下载图片
      const filename = `test-doubao-4-5-${Date.now()}.png`;
      const localPath = await downloadImage(imageUrl, filename);

      console.log('🎉 测试成功！');
      console.log(`   - 模型: doubao-seedream-4-5-251128`);
      console.log(`   - 本地路径: ${localPath}`);
      console.log(`   - 图片质量: 1024x1024高清`);

    } else {
      console.error('❌ 生成失败: 未返回有效的图片数据');
      console.error('返回结果:', JSON.stringify(result, null, 2));
    }

  } catch (error: any) {
    console.error('❌ 测试失败:', error.message);
    console.error('错误详情:', error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// 运行测试
if (require.main === module) {
  testGenerateImage();
}