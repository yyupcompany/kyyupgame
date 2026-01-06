#!/usr/bin/env ts-node
/**
 * 生成动物观察员游戏的语音资源
 */

import { sequelize } from '../init';
import { AIModelConfig } from '../models/ai-model-config.model';
import { VolcengineTTSService } from '../services/volcengine/tts.service';
import path from 'path';
import fs from 'fs';

const GAME_AUDIO_BASE = path.join(__dirname, '../../../uploads/games/audio');
const VOICES_DIR = path.join(GAME_AUDIO_BASE, 'voices/animal-observer');

if (!fs.existsSync(VOICES_DIR)) {
  fs.mkdirSync(VOICES_DIR, { recursive: true });
  console.log(`✅ 创建目录: ${VOICES_DIR}\n`);
}

// 动物观察员专属语音清单
const ANIMAL_OBSERVER_VOICES = [
  // 游戏开始
  { file: 'game-start.mp3', text: '小观察家，准备好观察可爱的小动物了吗？', category: 'start' },
  
  // 正确点击
  { file: 'correct-1.mp3', text: '太棒了！找对了！', category: 'correct' },
  { file: 'correct-2.mp3', text: '真厉害！观察得真仔细！', category: 'correct' },
  { file: 'correct-3.mp3', text: '太好了！就是这个小动物！', category: 'correct' },
  { file: 'correct-4.mp3', text: '太聪明了！一眼就看出来了！', category: 'correct' },
  { file: 'correct-5.mp3', text: '完美！你的眼睛真厉害！', category: 'correct' },
  
  // 错误点击
  { file: 'wrong-1.mp3', text: '哎呀，再看看！', category: 'wrong' },
  { file: 'wrong-2.mp3', text: '这个小动物不对哦，仔细观察！', category: 'wrong' },
  
  // 关卡完成
  { file: 'level-complete.mp3', text: '太厉害了！你观察得真仔细！', category: 'complete' },
  
  // 游戏结束
  { file: 'gameover.mp3', text: '游戏结束！你已经很棒了！', category: 'gameover' },
  
  // 连击鼓励
  { file: 'combo-3.mp3', text: '哇！三连击！', category: 'combo' },
  { file: 'combo-5.mp3', text: '太厉害了！五连击！', category: 'combo' },
  { file: 'combo-10.mp3', text: '不可思议！十连击！你是观察大师！', category: 'combo' },
  
  // 星级评价
  { file: 'three-stars.mp3', text: '完美！获得三颗星！你是观察力大师！', category: 'achievement' },
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
  console.log(`   类别：${config.category}`);
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
  console.log('🦁 开始生成动物观察员游戏语音...\n');
  console.log(`📁 输出目录: ${VOICES_DIR}\n`);
  
  let ttsService: VolcengineTTSService;
  
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
    
    ttsService = new VolcengineTTSService({
      appId: params.appKey,
      accessToken: params.accessToken || params.accessKey
    });
    
    console.log('✅ TTS服务初始化成功\n');
    
    let successCount = 0;
    let failCount = 0;
    const totalVoices = ANIMAL_OBSERVER_VOICES.length;
    const batchSize = 5;
    
    console.log(`📊 总共 ${totalVoices} 条语音，分 ${Math.ceil(totalVoices / batchSize)} 批次生成\n`);
    
    for (let i = 0; i < ANIMAL_OBSERVER_VOICES.length; i += batchSize) {
      const batch = ANIMAL_OBSERVER_VOICES.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(ANIMAL_OBSERVER_VOICES.length / batchSize);
      
      console.log(`\n🚀 第 ${batchNum}/${totalBatches} 批：并发生成 ${batch.length} 条语音...`);
      
      const promises = batch.map(voice => 
        generateVoice(ttsService, voice)
          .then(() => { successCount++; })
          .catch(() => { failCount++; })
      );
      
      await Promise.all(promises);
      
      if (i + batchSize < ANIMAL_OBSERVER_VOICES.length) {
        console.log(`\n⏳ 等待10秒后继续下一批...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
    
    await sequelize.close();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 语音生成完成！');
    console.log(`✅ 成功: ${successCount}/${totalVoices}`);
    console.log(`❌ 失败: ${failCount}/${totalVoices}`);
    console.log(`📁 输出目录: ${VOICES_DIR}`);
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

export { main as generateAnimalObserverVoices };

