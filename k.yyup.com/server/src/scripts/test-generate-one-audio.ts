#!/usr/bin/env ts-node
/**
 * 测试生成单条语音 - 使用稳定的HTTP TTS（原有服务）
 */

import { sequelize } from '../init';
import { AssessmentQuestion } from '../models/assessment-question.model';
import { AIModelConfig } from '../models/ai-model-config.model';
import { VolcengineTTSService } from '../services/volcengine/tts.service';
import path from 'path';
import fs from 'fs';

const AUDIO_DIR = path.join(__dirname, '../../../uploads/assessment-audio');

if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

(async () => {
  try {
    console.log('🎤 测试语音生成...\n');
    
    await sequelize.authenticate();
    AssessmentQuestion.initModel(sequelize);
    console.log('✅ 数据库连接成功\n');
    
    // 找第一个题目
    const question = await AssessmentQuestion.findOne({
      where: { status: 'active' },
      order: [['id', 'ASC']]
    });
    
    if (!question) {
      console.log('未找到题目');
      return;
    }
    
    console.log(`📋 测试题目: ${question.title}`);
    console.log(`   维度: ${question.dimension}`);
    console.log(`   类型: ${question.questionType}\n`);
    
    // 生成语音文本
    const audioText = question.questionType === 'game' 
      ? '小朋友，现在我们来玩找不同的游戏。请仔细观察两幅图片，找出它们之间的不同之处。找到后，用小手点击不同的地方。加油哦！'
      : '小朋友，请听题。请指出哪个动物最大？请选择你的答案。';
    
    console.log(`📝 语音文本: ${audioText}\n`);
    
    // 从数据库加载TTS配置
    const ttsModel = await AIModelConfig.findOne({
      where: { name: 'volcengine-tts-v3-bidirection', status: 'active' }
    });
    
    if (!ttsModel || !ttsModel.modelParameters) {
      throw new Error('TTS模型配置未找到');
    }
    
    const params = typeof ttsModel.modelParameters === 'string' 
      ? JSON.parse(ttsModel.modelParameters) 
      : ttsModel.modelParameters;
    
    console.log('🎤 调用稳定的HTTP TTS（原有服务）...');
    console.log(`   音色: 温柔女声`);
    console.log(`   语速: 1.0（正常语速）`);
    console.log(`   格式: mp3`);
    console.log(`   文本长度: ${audioText.length} 字\n`);
    
    // 创建TTS服务实例（使用稳定的HTTP API）
    const ttsService = new VolcengineTTSService({
      appId: params.appKey,
      accessToken: params.accessToken || params.accessKey
    });
    
    const result = await ttsService.textToSpeech({
      text: audioText,
      voice: 'zh_female_cancan_mars_bigtts',
      encoding: 'mp3',
      speed: 1.0
    });
    
    console.log(`✅ 语音生成成功: ${result.audioBuffer.length} bytes\n`);
    
    // 保存文件
    const filename = `test_q${question.id}_${question.dimension}.mp3`;
    const audioPath = path.join(AUDIO_DIR, filename);
    fs.writeFileSync(audioPath, result.audioBuffer);
    
    console.log(`💾 已保存: ${audioPath}`);
    console.log(`   大小: ${(result.audioBuffer.length / 1024).toFixed(1)} KB`);
    console.log(`   访问: http://localhost:3000/uploads/assessment-audio/${filename}\n`);
    
    console.log('🎉 测试完成！请播放音频文件确认效果。');
    
    await sequelize.close();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
})();

