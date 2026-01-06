#!/usr/bin/env ts-node
import { sequelize } from '../init';
import { AIModelConfig } from '../models/ai-model-config.model';
import { VolcengineTTSService } from '../services/volcengine/tts.service';
import path from 'path';
import fs from 'fs';

const VOICES_DIR = path.join(__dirname, '../../../uploads/games/audio/voices/dinosaur-memory');
if (!fs.existsSync(VOICES_DIR)) fs.mkdirSync(VOICES_DIR, { recursive: true });

const DINOSAUR_MEMORY_VOICES = [
  { file: 'game-start.mp3', text: '小探险家，记住这些恐龙的位置！' },
  { file: 'match-1.mp3', text: '吼！找到了一对恐龙！' },
  { file: 'match-2.mp3', text: '太棒了！恐龙配对成功！' },
  { file: 'match-3.mp3', text: '真厉害！又发现一对！' },
  { file: 'match-4.mp3', text: '完美！继续寻找恐龙！' },
  { file: 'match-5.mp3', text: '太好了！恐龙朋友越来越多！' },
  { file: 'hint.mp3', text: '恐龙吼叫！记住它们的位置！' },
  { file: 'level-complete.mp3', text: '太厉害了！你征服了恐龙世界！' }
];

async function main() {
  try {
    await sequelize.authenticate();
    const ttsModel = await AIModelConfig.findOne({ where: { name: 'volcengine-tts-v3-bidirection', status: 'active' } });
    const params = typeof ttsModel!.modelParameters === 'string' ? JSON.parse(ttsModel!.modelParameters) : ttsModel!.modelParameters;
    const ttsService = new VolcengineTTSService({ appId: params.appKey, accessToken: params.accessToken || params.accessKey });
    
    let successCount = 0;
    for (let i = 0; i < DINOSAUR_MEMORY_VOICES.length; i += 5) {
      const batch = DINOSAUR_MEMORY_VOICES.slice(i, i + 5);
      await Promise.all(batch.map(async v => {
        const savePath = path.join(VOICES_DIR, v.file);
        if (fs.existsSync(savePath)) return;
        const result = await ttsService.textToSpeech({ text: v.text, voice: 'zh_female_cancan_mars_bigtts', encoding: 'mp3', speed: 1.0 });
        fs.writeFileSync(savePath, result.audioBuffer);
        successCount++;
      }));
      if (i + 5 < DINOSAUR_MEMORY_VOICES.length) await new Promise(r => setTimeout(r, 10000));
    }
    
    await sequelize.close();
    console.log(`🎉 生成完成！✅ ${successCount}/${DINOSAUR_MEMORY_VOICES.length}`);
    process.exit(0);
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

if (require.main === module) main();

