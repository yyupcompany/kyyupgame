#!/usr/bin/env ts-node
/**
 * 生成简单的游戏音效（占位版本）
 * 策略：使用短促的TTS声音作为音效
 */

import { sequelize } from '../init';
import { AIModelConfig } from '../models/ai-model-config.model';
import { VolcengineTTSService } from '../services/volcengine/tts.service';
import path from 'path';
import fs from 'fs';

const SFX_DIR = path.join(__dirname, '../../../uploads/games/audio/sfx');

if (!fs.existsSync(SFX_DIR)) {
  fs.mkdirSync(SFX_DIR, { recursive: true });
}

// 简单音效配置（使用短促的声音）
const SIMPLE_SFX = [
  { file: 'click.mp3', text: '哒', description: '点击音效' },
  { file: 'correct.mp3', text: '叮！', description: '正确音效' },
  { file: 'wrong.mp3', text: '哦', description: '错误音效' },
  { file: 'success.mp3', text: '耶！', description: '成功音效' },
  { file: 'card-flip.mp3', text: '嗖', description: '翻牌音效' },
  { file: 'match.mp3', text: '叮铃铃', description: '配对成功' },
  { file: 'unmatch.mp3', text: '嗯', description: '配对失败' },
  { file: 'treasure-found.mp3', text: '哇', description: '发现宝藏' },
  { file: 'scan.mp3', text: '嘀嘀嘀', description: '雷达扫描' },
  { file: 'dinosaur-roar.mp3', text: '吼', description: '恐龙吼叫' },
  { file: 'slow-motion.mp3', text: '嗖', description: '慢动作' },
  { file: 'sparkle.mp3', text: '叮', description: '闪光' },
  { file: 'pop.mp3', text: '啵', description: '弹出' },
  { file: 'whoosh.mp3', text: '嗖', description: '飞行' },
  { file: 'ding.mp3', text: '叮', description: '提示音' },
  { file: 'chime.mp3', text: '叮咚', description: '钟声' },
  { file: 'countdown.mp3', text: '滴', description: '倒计时' },
  { file: 'combo.mp3', text: '哇', description: '连击' }
];

async function generateSFX(
  ttsService: VolcengineTTSService,
  config: { file: string; text: string; description: string }
): Promise<void> {
  const savePath = path.join(SFX_DIR, config.file);
  
  if (fs.existsSync(savePath)) {
    console.log(`⏭️  跳过：${config.file}（已存在）`);
    return;
  }
  
  console.log(`\n🔊 生成：${config.file}`);
  console.log(`   描述：${config.description}`);
  console.log(`   文本：${config.text}`);
  
  try {
    // 使用较快的语速生成短促音效
    const result = await ttsService.textToSpeech({
      text: config.text,
      voice: 'zh_female_cancan_mars_bigtts',
      encoding: 'mp3',
      speed: 1.5 // 加快语速，使音效更短促
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
  console.log('🔊 开始生成游戏音效（占位版本）...\n');
  console.log(`📁 输出目录: ${SFX_DIR}\n`);
  console.log('⚠️  这些是临时占位音效，后续可替换为专业音效\n');
  
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
    let failCount = 0;
    const batchSize = 5;
    
    console.log(`📊 总共 ${SIMPLE_SFX.length} 个音效，分 ${Math.ceil(SIMPLE_SFX.length / batchSize)} 批次生成\n`);
    
    for (let i = 0; i < SIMPLE_SFX.length; i += batchSize) {
      const batch = SIMPLE_SFX.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(SIMPLE_SFX.length / batchSize);
      
      console.log(`\n🚀 第 ${batchNum}/${totalBatches} 批：并发生成 ${batch.length} 个音效...`);
      
      const promises = batch.map(sfx => 
        generateSFX(ttsService, sfx)
          .then(() => { successCount++; })
          .catch(() => { failCount++; })
      );
      
      await Promise.all(promises);
      
      if (i + batchSize < SIMPLE_SFX.length) {
        console.log(`\n⏳ 等待10秒后继续下一批...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
    
    await sequelize.close();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 音效生成完成！');
    console.log(`✅ 成功: ${successCount}/${SIMPLE_SFX.length}`);
    console.log(`❌ 失败: ${failCount}/${SIMPLE_SFX.length}`);
    console.log(`📁 输出目录: ${SFX_DIR}`);
    console.log('\n⚠️  提示：这些是简单的占位音效');
    console.log('   如需更专业的音效，请从免费资源库下载替换');
    console.log('   推荐：https://pixabay.com/sound-effects/');
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

export { main as generateSimpleGameSFX };

