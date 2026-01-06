#!/usr/bin/env ts-node
/**
 * 生成公主记忆宝盒游戏的语音资源
 */

import { sequelize } from '../init';
import { AIModelConfig } from '../models/ai-model-config.model';
import { VolcengineTTSService } from '../services/volcengine/tts.service';
import path from 'path';
import fs from 'fs';

const GAME_AUDIO_BASE = path.join(__dirname, '../../../uploads/games/audio');
const VOICES_DIR = path.join(GAME_AUDIO_BASE, 'voices/princess-memory');

if (!fs.existsSync(VOICES_DIR)) {
  fs.mkdirSync(VOICES_DIR, { recursive: true });
}

const PRINCESS_MEMORY_VOICES = [
  { file: 'game-start.mp3', text: '小公主，请记住这些宝藏的位置！', category: 'start' },
  { file: 'match-1.mp3', text: '太棒了！你找到了一对！', category: 'match' },
  { file: 'match-2.mp3', text: '真厉害！配对成功！', category: 'match' },
  { file: 'match-3.mp3', text: '太聪明了！又找到一对宝藏！', category: 'match' },
  { file: 'match-4.mp3', text: '完美配对！你的记忆力真好！', category: 'match' },
  { file: 'match-5.mp3', text: '太好了！继续加油！', category: 'match' },
  { file: 'hint.mp3', text: '记忆增强！仔细记住这些宝藏的位置！', category: 'hint' },
  { file: 'level-complete.mp3', text: '所有宝藏都找到了！你的记忆力超级棒！', category: 'complete' },
  { file: 'three-stars.mp3', text: '完美！获得三颗星！你是记忆超人！', category: 'achievement' },
  { file: 'two-stars.mp3', text: '真棒！获得两颗星！', category: 'achievement' },
  { file: 'one-star.mp3', text: '不错！获得一颗星！', category: 'achievement' }
];

async function generateVoice(
  ttsService: VolcengineTTSService,
  config: { file: string; text: string; category: string }
): Promise<void> {
  const savePath = path.join(VOICES_DIR, config.file);
  
  if (fs.existsSync(savePath)) {
    console.log(`⏭️  跳过：${config.file}（已存在）`);
    return;
  }
  
  console.log(`\n🎤 生成：${config.file}`);
  console.log(`   文本：${config.text}`);
  
  try {
    const result = await ttsService.textToSpeech({
      text: config.text,
      voice: 'zh_female_cancan_mars_bigtts',
      encoding: 'mp3',
      speed: 1.0
    });
    
    fs.writeFileSync(savePath, result.audioBuffer);
    const stats = fs.statSync(savePath);
    console.log(`   ✅ 已保存：${(stats.size / 1024).toFixed(1)} KB`);
    
  } catch (error: any) {
    console.error(`   ❌ 生成失败：${error.message}`);
    throw error;
  }
}

async function main() {
  console.log('💎 开始生成公主记忆宝盒游戏语音...\n');
  
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    const ttsModel = await AIModelConfig.findOne({
      where: { name: 'volcengine-tts-v3-bidirection', status: 'active' }
    });
    
    if (!ttsModel || !ttsModel.modelParameters) {
      throw new Error('TTS模型配置未找到');
    }
    
    const params = typeof ttsModel.modelParameters === 'string' 
      ? JSON.parse(ttsModel.modelParameters) 
      : ttsModel.modelParameters;
    
    const ttsService = new VolcengineTTSService({
      appId: params.appKey,
      accessToken: params.accessToken || params.accessKey
    });
    
    console.log('✅ TTS服务初始化成功\n');
    
    let successCount = 0;
    const batchSize = 5;
    
    for (let i = 0; i < PRINCESS_MEMORY_VOICES.length; i += batchSize) {
      const batch = PRINCESS_MEMORY_VOICES.slice(i, i + batchSize);
      console.log(`\n🚀 第 ${Math.floor(i/batchSize)+1}/${Math.ceil(PRINCESS_MEMORY_VOICES.length/batchSize)} 批：生成 ${batch.length} 条语音...`);
      
      const promises = batch.map(voice => 
        generateVoice(ttsService, voice).then(() => { successCount++; })
      );
      
      await Promise.all(promises);
      
      if (i + batchSize < PRINCESS_MEMORY_VOICES.length) {
        console.log(`\n⏳ 等待10秒...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
    
    await sequelize.close();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 语音生成完成！');
    console.log(`✅ 成功: ${successCount}/${PRINCESS_MEMORY_VOICES.length}`);
    console.log('='.repeat(60));
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ 发生错误:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

