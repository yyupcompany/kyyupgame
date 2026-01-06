#!/usr/bin/env ts-node
/**
 * 测试生成单张图片
 * 验证 AIBridge 文生图接口是否正常工作
 */

import { sequelize } from '../init';
import { AssessmentQuestion } from '../models/assessment-question.model';
import { AssessmentConfig } from '../models/assessment-config.model';
import { RefactoredMultimodalService } from '../services/ai/refactored-multimodal.service';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import sharp from 'sharp';

const multimodalService = new RefactoredMultimodalService();

// 默认使用系统管理员ID（ID=1）来统计用量
const SYSTEM_ADMIN_USER_ID = 1;

// 图片上传目录
const UPLOADS_DIR = path.join(__dirname, '../../../uploads/assessment-images');

// 确保目录存在
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log('📁 创建目录:', UPLOADS_DIR);
}

/**
 * 下载图片到本地并裁剪水印
 */
async function downloadImage(imageUrl: string, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const tempFilePath = path.join(UPLOADS_DIR, `temp_${filename}`);
    const finalFilePath = path.join(UPLOADS_DIR, filename);
    const file = fs.createWriteStream(tempFilePath);
    
    const protocol = imageUrl.startsWith('https:') ? https : http;
    
    console.log('📥 开始下载图片...');
    protocol.get(imageUrl, (response) => {
      response.pipe(file);
      
      file.on('finish', async () => {
        file.close();
        
        try {
          console.log('✂️  裁剪水印区域...');
          // 使用 sharp 裁剪图片，去除底部水印
          // 原图 1024x1024，裁剪掉底部约50像素的水印区域
          // 然后居中裁剪为 950x950，保持画面完整
          await sharp(tempFilePath)
            .extract({
              left: 37,      // 左边裁剪37像素
              top: 37,       // 顶部裁剪37像素
              width: 950,    // 宽度950像素
              height: 950    // 高度950像素（去除底部水印）
            })
            .resize(1024, 1024, {
              fit: 'contain',
              background: { r: 255, g: 255, b: 255, alpha: 1 } // 白色背景
            })
            .jpeg({ quality: 85, progressive: true }) // 压缩为JPEG，质量85%
            .toFile(finalFilePath);
          
          // 删除临时文件
          fs.unlinkSync(tempFilePath);
          
          const relativePath = `/uploads/assessment-images/${filename}`;
          console.log(`✅ 图片已保存并裁剪水印: ${relativePath}`);
          resolve(relativePath);
        } catch (error) {
          console.error('裁剪图片失败:', error);
          // 如果裁剪失败，使用原图
          fs.renameSync(tempFilePath, finalFilePath);
          const relativePath = `/uploads/assessment-images/${filename}`;
          console.log(`⚠️  图片已保存（未裁剪）: ${relativePath}`);
          resolve(relativePath);
        }
      });
    }).on('error', (err) => {
      fs.unlink(tempFilePath, () => {});
      reject(err);
    });
  });
}

/**
 * 生成测试图片提示词
 */
function generateTestPrompt(): string {
  const prompt = 
    `高质量儿童教育插画，` +
    `3-4岁的可爱中国幼儿，专注力训练场景，可爱的孩子正在仔细观察和比较物品，` +
    `画面中央展示：一只大象（最大）、一只小猫、一只小鸟、一条小鱼，` +
    `动物大小对比明显，每个动物都很可爱友好，` +
    `背景：浅蓝色渐变背景（#E3F2FD到#BBDEFB），干净简洁无杂物。` +
    `色彩方案：蓝色系主题，配色和谐温馨。` +
    `画面风格：扁平化卡通插画风格，线条圆润流畅，无尖锐边角。` +
    `光线：柔和均匀的自然光，没有强烈阴影。` +
    `构图：居中对称构图，主体物清晰突出，视觉焦点明确。` +
    `细节：物品轮廓清晰，边缘有细微描边，增强识别度。` +
    `整体氛围：温馨友好、安全可靠、充满童趣、富有教育意义，适合2-6岁幼儿认知发展。` +
    `图片质量：高清晰度，色彩饱和度适中，符合儿童视觉感知特点。`;
  
  return prompt;
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 测试 AIBridge 文生图接口...\n');
    console.log('='.repeat(80));
    
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    // 初始化模型
    AssessmentQuestion.initModel(sequelize);
    AssessmentConfig.initModel(sequelize);
    console.log('✅ 模型初始化完成\n');
    
    // 查找第一个需要图片的题目
    const question = await AssessmentQuestion.findOne({
      where: {
        status: 'active',
        imageUrl: null // 找一个没有图片的题目
      },
      order: [['id', 'ASC']]
    });
    
    if (!question) {
      console.log('⚠️  所有题目都已有配图，或没有找到合适的题目');
      console.log('提示：可以手动清空某个题目的 imageUrl 字段后重试');
      return;
    }
    
    console.log('📋 选择测试题目:');
    console.log(`   ID: ${question.id}`);
    console.log(`   标题: ${question.title}`);
    console.log(`   维度: ${question.dimension}`);
    console.log(`   年龄段: ${question.ageGroup}`);
    console.log('');
    
    // 生成提示词
    const imagePrompt = generateTestPrompt();
    console.log('📝 生成的提示词:');
    console.log('─'.repeat(80));
    console.log(imagePrompt);
    console.log('─'.repeat(80));
    console.log('');
    
    // 调用 AI 生成图片
    console.log('🎨 调用 AIBridge 文生图 API...');
    console.log(`   模型: doubao-seedream-3-0-t2i-250415`);
    console.log(`   用户ID: ${SYSTEM_ADMIN_USER_ID} (系统管理员)`);
    console.log(`   尺寸: 1024x1024`);
    console.log(`   风格: natural`);
    console.log('');
    
    const startTime = Date.now();
    
    const result = await multimodalService.generateImage(SYSTEM_ADMIN_USER_ID, {
      model: 'doubao-seedream-3-0-t2i-250415',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'natural',
      responseFormat: 'url'
    });
    
    const duration = Date.now() - startTime;
    
    console.log('⏱️  生成耗时:', duration, 'ms');
    console.log('');
    
    if (!result || !result.data || result.data.length === 0) {
      console.error('❌ 生成失败: 返回数据为空');
      console.error('响应:', JSON.stringify(result, null, 2));
      return;
    }
    
    const imageUrl = result.data[0].url;
    console.log('✅ 图片生成成功！');
    console.log(`   原始URL: ${imageUrl}`);
    console.log(`   使用模型: ${result.modelUsed || 'doubao-seedream-3-0-t2i-250415'}`);
    console.log(`   选择原因: ${result.selectionReason || '系统默认'}`);
    console.log('');
    
    // 下载图片到本地（使用规范的文件命名）
    console.log('💾 下载图片到本地...');
    const filename = `q${question.id}_${question.dimension}_${question.ageGroup}_${Date.now()}.png`;
    const localImageUrl = await downloadImage(imageUrl, filename);
    
    console.log('');
    console.log('📊 本地存储信息:');
    console.log(`   文件名: ${filename}`);
    console.log(`   访问路径: ${localImageUrl}`);
    console.log(`   物理路径: ${path.join(UPLOADS_DIR, filename)}`);
    console.log('');
    
    // 更新数据库
    console.log('💾 更新数据库...');
    await question.update({
      imageUrl: localImageUrl,
      imagePrompt: imagePrompt
    });
    
    console.log('✅ 数据库更新成功！');
    console.log('');
    console.log('='.repeat(80));
    console.log('🎉 测试完成！');
    console.log('');
    console.log('📌 下一步:');
    console.log('   1. 在浏览器中访问:', `http://localhost:3000${localImageUrl}`);
    console.log('   2. 检查图片质量和风格是否符合要求');
    console.log('   3. 查看 ai_model_usage 表确认用量已记录');
    console.log('   4. 如果满意，可以运行批量生成脚本');
    console.log('='.repeat(80));
    
  } catch (error: any) {
    console.error('❌ 测试失败:', error);
    console.error('错误详情:', error.message);
    if (error.stack) {
      console.error('错误堆栈:', error.stack);
    }
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

