#!/usr/bin/env ts-node
/**
 * 生成公主花园找不同游戏的语音资源
 */

import { sequelize } from '../init';
import { AIModelConfig } from '../models/ai-model-config.model';
import { VolcengineTTSService } from '../services/volcengine/tts.service';
import path from 'path';
import fs from 'fs';

const GAME_AUDIO_BASE = path.join(__dirname, '../../../uploads/games/audio');
const VOICES_DIR = path.join(GAME_AUDIO_BASE, 'voices/princess-garden');

// 创建目录
if (!fs.existsSync(VOICES_DIR)) {
  fs.mkdirSync(VOICES_DIR, { recursive: true });
  console.log(`✅ 创建目录: ${VOICES_DIR}\n`);
}

// 公主花园专属语音清单
const PRINCESS_GARDEN_VOICES = [
  // 游戏开始
  { file: 'game-start.mp3', text: '小公主，请仔细观察两幅图片，找出它们的不同哦！', category: 'start' },
  
  // 找对反馈
  { file: 'correct-1.mp3', text: '太棒了！你的眼睛真厉害！', category: 'correct' },
  { file: 'correct-2.mp3', text: '太聪明了！找到了！', category: 'correct' },
  { file: 'correct-3.mp3', text: '真棒！又发现一个不同！', category: 'correct' },
  { file: 'correct-4.mp3', text: '好厉害！观察得真仔细！', category: 'correct' },
  { file: 'correct-5.mp3', text: '太好了！就是这里不一样！', category: 'correct' },
  
  // 找错提示
  { file: 'wrong-1.mp3', text: '再仔细看看，你一定能找到的！', category: 'wrong' },
  { file: 'wrong-2.mp3', text: '这里没有不同哦，试试其他地方！', category: 'wrong' },
  
  // 提示
  { file: 'hint-1.mp3', text: '看这里！仔细观察这个位置！', category: 'hint' },
  { file: 'hint-2.mp3', text: '提示：注意右边图片的这个地方！', category: 'hint' },
  { file: 'hint-3.mp3', text: '这里有一个小秘密哦！', category: 'hint' },
  
  // 关卡完成
  { file: 'level-complete-1.mp3', text: '恭喜你！公主花园的秘密都被你发现了！', category: 'complete' },
  { file: 'level-complete-2.mp3', text: '太厉害了！你找到了所有的不同！', category: 'complete' },
  { file: 'level-complete-3.mp3', text: '完美！你真是个小侦探！', category: 'complete' },
  
  // 获得星星
  { file: 'three-stars.mp3', text: '哇！获得三颗星！你是观察力大师！', category: 'achievement' },
  { file: 'two-stars.mp3', text: '真棒！获得两颗星！', category: 'achievement' },
  { file: 'one-star.mp3', text: '很好！获得一颗星！', category: 'achievement' },
  
  // 鼓励语音
  { file: 'encourage-1.mp3', text: '继续加油！还有几个不同等你发现！', category: 'encourage' },
  { file: 'encourage-2.mp3', text: '你做得很棒！快要找到全部了！', category: 'encourage' },
  { file: 'encourage-3.mp3', text: '太好了！马上就要成功了！', category: 'encourage' }
];

/**
 * 生成单条语音
 */
async function generateVoice(
  ttsService: VolcengineTTSService,
  config: { file: string; text: string; category: string }
): Promise<void> {
  const savePath = path.join(VOICES_DIR, config.file);
  
  // 检查是否已存在
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
      voice: 'zh_female_cancan_mars_bigtts', // 温柔女声，适合公主主题
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
  console.log('🎤 开始生成公主花园找不同游戏语音...\n');
  console.log(`📁 输出目录: ${VOICES_DIR}\n`);
  
  let ttsService: VolcengineTTSService;
  
  try {
    // 初始化数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
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
    
    // 创建TTS服务实例
    ttsService = new VolcengineTTSService({
      appId: params.appKey,
      accessToken: params.accessToken || params.accessKey
    });
    
    console.log('✅ TTS服务初始化成功\n');
    
    let successCount = 0;
    let failCount = 0;
    const totalVoices = PRINCESS_GARDEN_VOICES.length;
    const batchSize = 5; // 每批并发生成5条语音
    
    console.log(`📊 总共 ${totalVoices} 条语音，分 ${Math.ceil(totalVoices / batchSize)} 批次生成\n`);
    
    // 分批并发生成
    for (let i = 0; i < PRINCESS_GARDEN_VOICES.length; i += batchSize) {
      const batch = PRINCESS_GARDEN_VOICES.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(PRINCESS_GARDEN_VOICES.length / batchSize);
      
      console.log(`\n🚀 第 ${batchNum}/${totalBatches} 批：并发生成 ${batch.length} 条语音...`);
      
      // 并发生成当前批次的所有语音
      const promises = batch.map(voice => 
        generateVoice(ttsService, voice)
          .then(() => { successCount++; })
          .catch((error) => {
            console.error(`   ❌ 批次失败: ${voice.file}`);
            failCount++;
          })
      );
      
      await Promise.all(promises);
      
      // 如果还有下一批，等待10秒
      if (i + batchSize < PRINCESS_GARDEN_VOICES.length) {
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

// 执行
if (require.main === module) {
  main();
}

export { main as generatePrincessGardenVoices };

