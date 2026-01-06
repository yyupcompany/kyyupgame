#!/usr/bin/env ts-node
/**
 * 为测评题目批量生成语音播报
 * 使用稳定的HTTP TTS API，适合2-6岁儿童的温柔女声
 * 使用 VolcengineTTSService（HTTPS REST API，无杂音）
 */

import { sequelize } from '../init';
import { AssessmentQuestion } from '../models/assessment-question.model';
import { AIModelConfig } from '../models/ai-model-config.model';
import { VolcengineTTSService } from '../services/volcengine/tts.service';
import path from 'path';
import fs from 'fs';

// 音频保存目录
const AUDIO_DIR = path.join(__dirname, '../../../uploads/assessment-audio');

// 确保目录存在
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
  console.log('📁 创建音频目录:', AUDIO_DIR);
}

/**
 * 生成语音播报文本
 */
function generateAudioText(question: any, content: any): string {
  const dimensionNames: Record<string, string> = {
    attention: '专注力',
    memory: '记忆力',
    logic: '逻辑思维',
    language: '语言能力',
    motor: '精细动作',
    social: '社交能力'
  };
  
  const dimensionName = dimensionNames[question.dimension] || '';
  const questionText = content.question || question.title || '';
  const description = content.description || '';
  
  let audioText = '';
  
  // 游戏类型
  if (question.questionType === 'game') {
    if (question.dimension === 'attention') {
      audioText = `小朋友，现在我们来玩找不同的游戏。请仔细观察两幅图片，找出它们之间的不同之处。找到后，用小手点击不同的地方。加油哦！`;
    } else if (question.dimension === 'memory') {
      audioText = `小朋友，我们来玩记忆卡片游戏。先看一下这些卡片，记住它们的位置。等卡片翻过去后，你要找出相同的两张卡片。准备好了吗？开始吧！`;
    } else if (question.dimension === 'logic') {
      audioText = `小朋友，我们来玩分类游戏。请把相同类型的物品放在一起。比如水果放在一起，玩具放在一起。用小手拖动物品到正确的分类中。你可以的！`;
    } else {
      audioText = `小朋友，欢迎来到${dimensionName}游戏。请按照游戏提示进行操作。`;
    }
  }
  // 问答类型
  else {
    // 如果有描述说明，优先使用
    if (description) {
      audioText = `小朋友，${description}。现在请选择你的答案。`;
    } else {
      // 优化题目文本，使其更适合语音播报
      let optimizedQuestion = questionText
        .replace(/图片中/g, '')
        .replace(/请指出/g, '请告诉我')
        .replace(/请找出/g, '请说说')
        .trim();
      
      audioText = `小朋友，请听题。${optimizedQuestion}。请选择你的答案。`;
    }
  }
  
  return audioText;
}

/**
 * 为单个题目生成语音
 */
async function generateAudioForQuestion(question: any, ttsService: VolcengineTTSService): Promise<void> {
  try {
    // 如果已有语音，跳过
    if (question.audioUrl) {
      console.log(`⏭️  题目 ${question.id} 已有语音，跳过`);
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
    
    console.log(`\n🎤 为题目 ${question.id} 生成语音...`);
    console.log(`   标题: ${question.title}`);
    console.log(`   维度: ${question.dimension}`);
    
    // 生成语音文本
    const audioText = generateAudioText(question, content);
    console.log(`   文本: ${audioText.substring(0, 50)}...`);
    
    // 调用稳定的HTTP TTS（无杂音）
    const result = await ttsService.textToSpeech({
      text: audioText,
      voice: 'zh_female_cancan_mars_bigtts', // 温柔女声，适合儿童
      encoding: 'mp3',
      speed: 1.0 // 正常语速
    });
    
    if (!result || !result.audioBuffer) {
      console.error(`❌ 生成失败: 返回数据为空`);
      return;
    }
    
    console.log(`   音频大小: ${(result.audioBuffer.length / 1024).toFixed(1)} KB`);
    
    // 保存音频文件
    const filename = `q${question.id}_${question.dimension}_${question.ageGroup}.mp3`;
    const audioPath = path.join(AUDIO_DIR, filename);
    fs.writeFileSync(audioPath, result.audioBuffer);
    
    const audioUrl = `/uploads/assessment-audio/${filename}`;
    
    // 更新数据库
    await question.update({
      audioUrl: audioUrl,
      audioText: audioText
    });
    
    console.log(`✅ 题目 ${question.id} 语音生成完成: ${audioUrl}`);
    
  } catch (error: any) {
    console.error(`❌ 题目 ${question.id} 生成失败:`, error.message);
  }
}

/**
 * 主函数（并发生成，每批10张）
 */
async function main() {
  let ttsService: VolcengineTTSService;
  
  try {
    console.log('🚀 开始为测评题目生成语音播报...\n');
    console.log('🎤 语音配置：温柔女声，语速1.0，适合儿童\n');
    console.log('⚡ 并发策略：每批10条，每批间隔5秒\n');
    
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    // 初始化模型
    AssessmentQuestion.initModel(sequelize);
    console.log('✅ 模型初始化完成\n');
    
    // 加载TTS配置
    const ttsModel = await AIModelConfig.findOne({
      where: { name: 'volcengine-tts-v3-bidirection', status: 'active' }
    });
    
    if (!ttsModel || !ttsModel.modelParameters) {
      throw new Error('TTS模型配置未找到');
    }
    
    const params = typeof ttsModel.modelParameters === 'string' 
      ? JSON.parse(ttsModel.modelParameters) 
      : ttsModel.modelParameters;
    
    // 创建TTS服务实例（稳定的HTTP API，无杂音）
    ttsService = new VolcengineTTSService({
      appId: params.appKey,
      accessToken: params.accessToken || params.accessKey
    });
    
    console.log('✅ TTS服务初始化成功（HTTP API）\n');
    
    // 获取所有题目
    const allQuestions = await AssessmentQuestion.findAll({
      where: {
        status: 'active'
      },
      order: [['id', 'ASC']]
    });
    
    console.log(`📊 共找到 ${allQuestions.length} 道题目\n`);
    
    // 过滤出还没有语音的题目
    const questionsToProcess = allQuestions.filter(q => !q.audioUrl);
    
    console.log(`📋 需要生成语音: ${questionsToProcess.length} 道`);
    console.log(`📋 已有语音: ${allQuestions.length - questionsToProcess.length} 道\n`);
    
    // 计算预计时间
    const batches = Math.ceil(questionsToProcess.length / 10);
    const estimatedMinutes = Math.ceil(batches * 5 / 60);
    console.log(`⏰ 预计批次: ${batches} 批`);
    console.log(`⏰ 预计耗时: 约 ${estimatedMinutes} 分钟\n`);
    
    let processedCount = 0;
    let generatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    const startTime = Date.now();
    
    // 分批处理，每批10条
    const BATCH_SIZE = 10;
    const BATCH_DELAY = 5000; // 5秒
    
    for (let i = 0; i < questionsToProcess.length; i += BATCH_SIZE) {
      const batch = questionsToProcess.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(questionsToProcess.length / BATCH_SIZE);
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔄 批次 ${batchNum}/${totalBatches}: 处理 ${batch.length} 道题目 (ID: ${batch.map(q => q.id).join(', ')})`);
      console.log('='.repeat(60));
      
      const batchStartTime = Date.now();
      
      // 并发生成当前批次的所有语音
      const results = await Promise.allSettled(
        batch.map(question => generateAudioForQuestion(question, ttsService))
      );
      
      // 统计结果
      for (let j = 0; j < results.length; j++) {
        const question = batch[j];
        processedCount++;
        
        if (results[j].status === 'fulfilled') {
          const refreshed = await AssessmentQuestion.findByPk(question.id);
          if (refreshed?.audioUrl) {
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
      
      // 如果不是最后一批，等待5秒
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
    console.log('🎉 语音生成完成！');
    console.log(`   处理题目: ${processedCount} 道`);
    console.log(`   生成语音: ${generatedCount} 条`);
    console.log(`   跳过题目: ${skippedCount} 道`);
    console.log(`   失败题目: ${errorCount} 道`);
    console.log(`   总耗时: ${Math.floor(totalTime / 60)} 分 ${totalTime % 60} 秒`);
    console.log(`   平均速度: ${(processedCount / (totalTime / 60)).toFixed(1)} 条/分钟`);
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

