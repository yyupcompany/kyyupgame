#!/usr/bin/env ts-node
import { sequelize } from '../init';
import { AIModelConfig } from '../models/ai-model-config.model';
import { VolcengineTTSService } from '../services/volcengine/tts.service';
import path from 'path';
import fs from 'fs';

const VOICES_DIR = path.join(__dirname, '../../../uploads/games/audio/voices/robot-factory');
if (!fs.existsSync(VOICES_DIR)) fs.mkdirSync(VOICES_DIR, { recursive: true });

const VOICES = [
  { file: 'game-start.mp3', text: '小工程师，让我们一起组装机器人！' },
  { file: 'correct.mp3', text: '太棒了！零件安装成功！' },
  { file: 'level-complete.mp3', text: '机器人组装完成！你是天才工程师！' }
];

async function main() {
  try {
    await sequelize.authenticate();
    const ttsModel = await AIModelConfig.findOne({ where: { name: 'volcengine-tts-v3-bidirection', status: 'active' } });
    const params = typeof ttsModel!.modelParameters === 'string' ? JSON.parse(ttsModel!.modelParameters) : ttsModel!.modelParameters;
    const tts = new VolcengineTTSService({ appId: params.appKey, accessToken: params.accessToken || params.accessKey });
    
    for (const v of VOICES) {
      const p = path.join(VOICES_DIR, v.file);
      if (!fs.existsSync(p)) {
        const r = await tts.textToSpeech({ text: v.text, voice: 'zh_female_cancan_mars_bigtts', encoding: 'mp3', speed: 1.0 });
        fs.writeFileSync(p, r.audioBuffer);
      }
    }
    await sequelize.close();
    console.log('✅ 机器人工厂语音完成');
    process.exit(0);
  } catch (e: any) {
    console.error('❌', e.message);
    process.exit(1);
  }
}

if (require.main === module) main();

