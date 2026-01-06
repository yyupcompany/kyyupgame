#!/usr/bin/env ts-node
/**
 * 为测评题目生成配图脚本
 * 使用 AIBridge 的文生图 API 自动为需要图片的题目生成图片
 */

import { sequelize } from '../init';
import { AssessmentQuestion } from '../models/assessment-question.model';
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
    
    protocol.get(imageUrl, (response) => {
      response.pipe(file);
      
      file.on('finish', async () => {
        file.close();
        
        try {
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
 * 为单个题目生成图片
 */
async function generateImageForQuestion(question: any): Promise<void> {
  try {
    // 如果已有图片，跳过
    if (question.imageUrl) {
      console.log(`⏭️  题目 ${question.id} 已有图片，跳过`);
      return;
    }
    
    // 解析 content
    let content: any = {};
    if (typeof question.content === 'string') {
      try {
        content = JSON.parse(question.content);
      } catch (e) {
        content = {};
      }
    } else {
      content = question.content;
    }
    
    // 所有题目都生成图片（视觉辅助对儿童测评很重要）
    const questionText = content.question || question.title || '';
    
    console.log(`\n🎨 为题目 ${question.id} 生成图片...`);
    console.log(`   标题: ${question.title}`);
    console.log(`   维度: ${question.dimension}`);
    
    // 生成详细的图片提示词
    const imagePrompt = generateImagePrompt(question, content);
    console.log(`   提示词: ${imagePrompt}`);
    
    // 使用 RefactoredMultimodalService，通过 AIBridge 调用，自动统计用量
    const result = await multimodalService.generateImage(SYSTEM_ADMIN_USER_ID, {
      model: 'doubao-seedream-3-0-t2i-250415', // 指定豆包文生图模型
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'natural',
      responseFormat: 'url'
    });
    
    if (!result || !result.data || result.data.length === 0) {
      console.error(`❌ 生成失败: 返回数据为空`);
      return;
    }
    
    const imageUrl = result.data[0].url;
    console.log(`   原始URL: ${imageUrl}`);
    console.log(`   使用模型: ${result.modelUsed}`);
    
    // 下载图片到本地（使用规范的文件命名）
    const filename = `q${question.id}_${question.dimension}_${question.ageGroup}_${Date.now()}.png`;
    const localImageUrl = await downloadImage(imageUrl, filename);
    
    // 更新数据库
    await question.update({
      imageUrl: localImageUrl,
      imagePrompt: imagePrompt
    });
    
    console.log(`✅ 题目 ${question.id} 图片生成完成: ${localImageUrl}`);
    
  } catch (error: any) {
    console.error(`❌ 题目 ${question.id} 生成失败:`, error.message);
  }
}

/**
 * 生成图片提示词（优化版 - 统一背景颜色和风格）
 */
function generateImagePrompt(question: any, content: any): string {
  const dimension = question.dimension;
  const ageGroup = question.ageGroup;
  const questionText = content.question || question.title || '';
  const description = content.description || '';
  
  // 年龄段对应的年龄
  const ageMap: Record<string, string> = {
    '24-36': '2-3岁',
    '36-48': '3-4岁',
    '48-60': '4-5岁',
    '60-72': '5-6岁'
  };
  const age = ageMap[ageGroup] || '3-4岁';
  
  // 维度对应的背景颜色和主题色
  const dimensionStyles: Record<string, { bg: string; theme: string; scene: string }> = {
    attention: {
      bg: '浅蓝色渐变背景（#E3F2FD到#BBDEFB）',
      theme: '蓝色系主题',
      scene: '专注力训练场景，可爱的孩子正在仔细观察和比较物品'
    },
    memory: {
      bg: '浅紫色渐变背景（#F3E5F5到#E1BEE7）',
      theme: '紫色系主题',
      scene: '记忆力训练场景，可爱的孩子正在回忆和记住卡片或物品'
    },
    logic: {
      bg: '浅橙色渐变背景（#FFF3E0到#FFE0B2）',
      theme: '橙色系主题',
      scene: '逻辑思维训练场景，可爱的孩子正在分类和整理物品'
    },
    language: {
      bg: '浅绿色渐变背景（#E8F5E9到#C8E6C9）',
      theme: '绿色系主题',
      scene: '语言能力训练场景，可爱的孩子正在表达和沟通'
    },
    motor: {
      bg: '浅黄色渐变背景（#FFF9C4到#FFF59D）',
      theme: '黄色系主题',
      scene: '精细动作训练场景，可爱的孩子正在动手操作玩具或工具'
    },
    social: {
      bg: '浅粉色渐变背景（#FCE4EC到#F8BBD0）',
      theme: '粉色系主题',
      scene: '社交能力训练场景，可爱的孩子们正在一起玩耍和互动'
    }
  };
  
  const style = dimensionStyles[dimension] || dimensionStyles.attention;
  
  // 基础提示词（统一风格）
  let prompt = `高质量儿童教育插画，`;
  prompt += `${age}的可爱中国幼儿，${style.scene}，`;
  
  // 根据题目内容添加具体场景元素
  if (questionText.includes('动物')) {
    prompt += '画面中央展示：一只大象（最大）、一只小猫、一只小鸟、一条小鱼，';
    prompt += '动物大小对比明显，每个动物都很可爱友好，';
  } else if (questionText.includes('水果') || questionText.includes('苹果')) {
    prompt += '画面中央整齐摆放：红色苹果、黄色香蕉、橙色橙子、紫色葡萄，';
    prompt += '水果色彩鲜艳饱满，光泽明亮，';
  } else if (questionText.includes('小鸟')) {
    prompt += '画面中央有3只可爱的小鸟站在树枝上，';
    prompt += '小鸟颜色各异，姿态生动活泼，';
  } else if (questionText.includes('红色物品')) {
    prompt += '画面中分散放置5个红色物品：红苹果、红气球、红色玩具车、红色积木、红色花朵，';
    prompt += '每个物品清晰可辨，色彩统一为红色系，';
  } else if (questionText.includes('公园')) {
    prompt += '公园场景，有滑梯、秋千、沙坑，周围有绿树和鲜花，';
    prompt += '一两个孩子在快乐玩耍，天气晴朗，';
  } else if (questionText.includes('小兔子')) {
    prompt += '可爱的白色小兔子，从左侧草地出发，中间经过大树，最后到达右侧花丛，';
    prompt += '移动路径用虚线标注，画面清晰明了，';
  } else if (description.includes('两张图') || questionText.includes('找不同')) {
    prompt += '温馨的儿童房间场景，有玩具、书本、小熊、积木等物品，';
    prompt += '画面布局清晰，物品摆放整齐，';
  } else if (questionText.includes('分类') || dimension === 'logic') {
    prompt += '多个物品整齐排列：水果类、交通工具类、动物类，每类3-4个物品，';
    prompt += '物品大小适中，特征明显，易于区分，';
  } else {
    prompt += '温馨的儿童学习场景，有适合年龄的教育玩具和道具，';
    prompt += '画面布局合理，元素不拥挤，';
  }
  
  // 统一的背景和风格描述（关键！）
  prompt += `背景：${style.bg}，干净简洁无杂物。`;
  prompt += `色彩方案：${style.theme}，配色和谐温馨。`;
  prompt += `画面风格：扁平化卡通插画风格，线条圆润流畅，无尖锐边角。`;
  prompt += `光线：柔和均匀的自然光，没有强烈阴影。`;
  prompt += `构图：居中对称构图，主体物清晰突出，视觉焦点明确。`;
  prompt += `细节：物品轮廓清晰，边缘有细微描边，增强识别度。`;
  prompt += `整体氛围：温馨友好、安全可靠、充满童趣、富有教育意义，适合2-6岁幼儿认知发展。`;
  prompt += `图片质量：高清晰度，色彩饱和度适中，符合儿童视觉感知特点。`;
  
  return prompt;
}

/**
 * 主函数（并发生成，每批5张）
 */
async function main() {
  try {
    console.log('🚀 开始为测评题目生成配图...\n');
    console.log('⚡ 并发策略：每批5张图片，每批间隔15秒\n');
    
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    // 初始化模型
    AssessmentQuestion.initModel(sequelize);
    console.log('✅ 模型初始化完成\n');
    
    // 获取所有题目
    const allQuestions = await AssessmentQuestion.findAll({
      where: {
        status: 'active'
      },
      order: [['id', 'ASC']]
    });
    
    console.log(`📊 共找到 ${allQuestions.length} 道题目\n`);
    
    // 过滤出还没有图片的题目
    const questionsToProcess = allQuestions.filter(q => !q.imageUrl);
    
    console.log(`📋 需要生成图片: ${questionsToProcess.length} 道`);
    console.log(`📋 已有图片: ${allQuestions.length - questionsToProcess.length} 道\n`);
    
    // 计算预计时间
    const batches = Math.ceil(questionsToProcess.length / 5);
    const estimatedMinutes = Math.ceil(batches * 15 / 60);
    console.log(`⏰ 预计批次: ${batches} 批`);
    console.log(`⏰ 预计耗时: 约 ${estimatedMinutes} 分钟\n`);
    
    let processedCount = 0;
    let generatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    const startTime = Date.now();
    
    // 分批处理，每批5张
    const BATCH_SIZE = 5;
    const BATCH_DELAY = 15000; // 15秒
    
    for (let i = 0; i < questionsToProcess.length; i += BATCH_SIZE) {
      const batch = questionsToProcess.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(questionsToProcess.length / BATCH_SIZE);
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔄 批次 ${batchNum}/${totalBatches}: 处理 ${batch.length} 道题目 (ID: ${batch.map(q => q.id).join(', ')})`);
      console.log('='.repeat(60));
      
      const batchStartTime = Date.now();
      
      // 并发生成当前批次的所有图片
      const results = await Promise.allSettled(
        batch.map(question => generateImageForQuestion(question))
      );
      
      // 统计结果
      for (let j = 0; j < results.length; j++) {
        const question = batch[j];
        processedCount++;
        
        if (results[j].status === 'fulfilled') {
          // 检查是否真的生成了图片
          const refreshed = await AssessmentQuestion.findByPk(question.id);
          if (refreshed?.imageUrl) {
            generatedCount++;
          } else {
            skippedCount++;
          }
        } else {
          errorCount++;
          console.error(`❌ 题目 ${question.id} 处理失败`);
        }
      }
      
      const batchElapsed = Date.now() - batchStartTime;
      
      console.log(`\n📊 批次 ${batchNum} 完成，耗时 ${(batchElapsed / 1000).toFixed(1)} 秒`);
      console.log(`📊 总进度: ${processedCount}/${questionsToProcess.length} (已生成: ${generatedCount}, 跳过: ${skippedCount}, 错误: ${errorCount})`);
      
      // 如果不是最后一批，等待15秒
      if (i + BATCH_SIZE < questionsToProcess.length) {
        const waitTime = Math.max(0, BATCH_DELAY - batchElapsed);
        if (waitTime > 0) {
          console.log(`⏳ 等待 ${(waitTime / 1000).toFixed(1)} 秒后处理下一批...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 配图生成完成！');
    console.log(`   处理题目: ${processedCount} 道`);
    console.log(`   生成图片: ${generatedCount} 张`);
    console.log(`   跳过题目: ${skippedCount} 道`);
    console.log(`   失败题目: ${errorCount} 道`);
    console.log(`   总耗时: ${Math.floor(totalTime / 60)} 分 ${totalTime % 60} 秒`);
    console.log(`   平均速度: ${(processedCount / (totalTime / 60)).toFixed(1)} 题/分钟`);
    console.log('='.repeat(60));
    
  } catch (error: any) {
    console.error('❌ 生成失败:', error);
    console.error(error.stack);
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

