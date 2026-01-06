#!/usr/bin/env ts-node
/**
 * 生成太空寻宝大冒险游戏的语音资源
 */

import { sequelize } from '../init';
import { AIModelConfig } from '../models/ai-model-config.model';
import { VolcengineTTSService } from '../services/volcengine/tts.service';
import path from 'path';
import fs from 'fs';

const GAME_AUDIO_BASE = path.join(__dirname, '../../../uploads/games/audio');
const VOICES_DIR = path.join(GAME_AUDIO_BASE, 'voices/space-treasure');

// 创建目录
if (!fs.existsSync(VOICES_DIR)) {
  fs.mkdirSync(VOICES_DIR, { recursive: true });
  console.log(`✅ 创建目录: ${VOICES_DIR}\n`);
}

// 太空寻宝专属语音清单
const SPACE_TREASURE_VOICES = [
  // 游戏开始
  { file: 'game-start.mp3', text: '宇航员，准备好了吗？让我们在太空中寻找神秘宝藏！', category: 'start' },
  
  // 找到宝藏
  { file: 'found-1.mp3', text: '哇！发现能量宝石！继续加油！', category: 'correct' },
  { file: 'found-2.mp3', text: '太棒了！又找到一个外星文物！', category: 'correct' },
  { file: 'found-3.mp3', text: '酷！发现了隐藏的宝藏！', category: 'correct' },
  { file: 'found-4.mp3', text: '真厉害！这个也被你找到了！', category: 'correct' },
  { file: 'found-5.mp3', text: '太好了！宝藏收集中！', category: 'correct' },
  
  // 雷达提示
  { file: 'hint-1.mp3', text: '雷达扫描中，发现能量信号！', category: 'hint' },
  { file: 'hint-2.mp3', text: '检测到附近有宝藏，仔细找找！', category: 'hint' },
  { file: 'hint-3.mp3', text: '能量波动增强，宝藏就在附近！', category: 'hint' },
  
  // 时间警告
  { file: 'time-30.mp3', text: '还剩30秒，快快快！', category: 'warning' },
  { file: 'time-10.mp3', text: '倒计时10秒！加速搜索！', category: 'warning' },
  
  // 任务完成
  { file: 'mission-complete.mp3', text: '任务完成！你是最棒的太空探险家！', category: 'complete' },
  
  // 时间到
  { file: 'time-up.mp3', text: '时间到！不过你已经很棒了！', category: 'gameover' },
  
  // 获得星星
  { file: 'three-stars.mp3', text: '完美！获得三颗星！你是太空寻宝大师！', category: 'achievement' },
  { file: 'two-stars.mp3', text: '真棒！获得两颗星！', category: 'achievement' },
  { file: 'one-star.mp3', text: '不错！获得一颗星！', category: 'achievement' },
  
  // 鼓励语音
  { file: 'encourage-1.mp3', text: '继续探索！还有宝藏等你发现！', category: 'encourage' },
  { file: 'encourage-2.mp3', text: '你做得很棒！马上就要成功了！', category: 'encourage' },
  { file: 'encourage-3.mp3', text: '太空探险家，加油！', category: 'encourage' }
];

// 生成单条语音
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
  console.log('🚀 开始生成太空寻宝大冒险游戏语音...\n');
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
    const totalVoices = SPACE_TREASURE_VOICES.length;
    const batchSize = 5;
    
    console.log(`📊 总共 ${totalVoices} 条语音，分 ${Math.ceil(totalVoices / batchSize)} 批次生成\n`);
    
    for (let i = 0; i < SPACE_TREASURE_VOICES.length; i += batchSize) {
      const batch = SPACE_TREASURE_VOICES.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(SPACE_TREASURE_VOICES.length / batchSize);
      
      console.log(`\n🚀 第 ${batchNum}/${totalBatches} 批：并发生成 ${batch.length} 条语音...`);
      
      const promises = batch.map(voice => 
        generateVoice(ttsService, voice)
          .then(() => { successCount++; })
          .catch(() => { failCount++; })
      );
      
      await Promise.all(promises);
      
      if (i + batchSize < SPACE_TREASURE_VOICES.length) {
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

export { main as generateSpaceTreasureVoices };

