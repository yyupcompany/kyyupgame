#!/usr/bin/env ts-node
/**
 * 生成游戏语音资源
 */

import { sequelize } from '../init';
import { AIModelConfig } from '../models/ai-model-config.model';
import { VolcengineTTSService } from '../services/volcengine/tts.service';
import path from 'path';
import fs from 'fs';

const GAME_AUDIO_BASE = path.join(__dirname, '../../../uploads/games/audio');

// 创建目录结构
const AUDIO_DIRS = {
  voices: path.join(GAME_AUDIO_BASE, 'voices'),
  sfx: path.join(GAME_AUDIO_BASE, 'sfx'),
  bgm: path.join(GAME_AUDIO_BASE, 'bgm')
};

Object.values(AUDIO_DIRS).forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
});

// 游戏语音清单
const GAME_VOICES = [
  // 通用语音
  { file: 'game-start-1.mp3', text: '准备好了吗？游戏要开始啦！', category: 'common' },
  { file: 'game-start-2.mp3', text: '加油！相信你一定可以的！', category: 'common' },
  { file: 'game-start-3.mp3', text: '让我们一起来挑战吧！', category: 'common' },
  
  // 鼓励语音
  { file: 'encourage-1.mp3', text: '太棒了！继续加油！', category: 'common' },
  { file: 'encourage-2.mp3', text: '你做得真好！', category: 'common' },
  { file: 'encourage-3.mp3', text: '太聪明了！', category: 'common' },
  { file: 'encourage-4.mp3', text: '哇！真厉害！', category: 'common' },
  { file: 'encourage-5.mp3', text: '你是最棒的！', category: 'common' },
  
  // 提示语音
  { file: 'hint-1.mp3', text: '需要帮助吗？点击提示按钮哦！', category: 'common' },
  { file: 'hint-2.mp3', text: '仔细看看，一定能找到的！', category: 'common' },
  { file: 'hint-3.mp3', text: '别着急，慢慢来！', category: 'common' },
  
  // 完成语音
  { file: 'complete-1.mp3', text: '恭喜你！关卡完成！', category: 'common' },
  { file: 'complete-2.mp3', text: '太厉害了！完美通关！', category: 'common' },
  { file: 'complete-3.mp3', text: '你真是个小天才！', category: 'common' },
  
  // 水果记忆专属
  { file: 'fruit-demo-start.mp3', text: '小朋友，请仔细看水果亮起的顺序，然后按照同样的顺序点击水果！', category: 'fruit' },
  { file: 'your-turn.mp3', text: '现在轮到你啦！请按顺序点击水果！', category: 'fruit' },
  { file: 'try-again.mp3', text: '哎呀，顺序不对。没关系，我们再试一次！', category: 'fruit' },
  { file: 'level-complete.mp3', text: '太棒了！进入下一关！', category: 'fruit' },
  { file: 'gameover.mp3', text: '游戏结束！你已经很棒了！', category: 'fruit' },
  { file: 'perfect-round.mp3', text: '完美！一次都没错！', category: 'fruit' },
  
  // 成就解锁
  { file: 'achievement-unlock.mp3', text: '恭喜你解锁新成就！', category: 'achievement' },
  { file: 'star-earned.mp3', text: '获得星星！', category: 'achievement' },
  { file: 'level-up.mp3', text: '等级提升！', category: 'achievement' }
];

/**
 * 生成单条语音
 */
async function generateVoice(
  ttsService: VolcengineTTSService,
  config: { file: string; text: string; category: string }
): Promise<void> {
  const savePath = path.join(AUDIO_DIRS.voices, config.file);
  
  // 检查是否已存在
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
  let ttsService: VolcengineTTSService;
  
  try {
    console.log('🎤 开始生成游戏语音资源...\n');
    
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
    
    ttsService = new VolcengineTTSService({
      appId: params.appKey,
      accessToken: params.accessToken || params.accessKey
    });
    
    console.log('✅ TTS服务初始化成功\n');
    console.log(`📊 语音清单：${GAME_VOICES.length} 条\n`);
    console.log('⚡ 并发策略：每批10条，间隔5秒\n');
    
    const BATCH_SIZE = 10;
    const BATCH_DELAY = 5000;
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < GAME_VOICES.length; i += BATCH_SIZE) {
      const batch = GAME_VOICES.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(GAME_VOICES.length / BATCH_SIZE);
      
      console.log(`\n${'='.repeat(70)}`);
      console.log(`🔄 批次 ${batchNum}/${totalBatches}: 生成 ${batch.length} 条语音`);
      console.log('='.repeat(70));
      
      const results = await Promise.allSettled(
        batch.map(config => generateVoice(ttsService, config))
      );
      
      // 统计结果
      results.forEach((result, idx) => {
        const config = batch[idx];
        const filePath = path.join(AUDIO_DIRS.voices, config.file);
        
        if (result.status === 'fulfilled') {
          if (fs.existsSync(filePath)) {
            successCount++;
          } else {
            skipCount++;
          }
        } else {
          errorCount++;
        }
      });
      
      console.log(`\n📊 批次 ${batchNum} 完成`);
      console.log(`📊 总进度：${i + batch.length}/${GAME_VOICES.length} (成功: ${successCount}, 跳过: ${skipCount}, 失败: ${errorCount})`);
      
      // 等待间隔
      if (i + BATCH_SIZE < GAME_VOICES.length) {
        console.log(`⏳ 等待5秒后处理下一批...`);
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 游戏语音生成完成！');
    console.log(`   成功生成：${successCount} 条`);
    console.log(`   跳过（已存在）：${skipCount} 条`);
    console.log(`   失败：${errorCount} 条`);
    console.log('='.repeat(70));
    console.log('\n📁 语音位置：uploads/games/audio/voices/\n');
    
  } catch (error: any) {
    console.error('❌ 生成失败：', error);
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





