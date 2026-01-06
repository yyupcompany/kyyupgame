import { aiBridgeService } from './src/services/ai/bridge/ai-bridge.service';

async function test() {
  try {
    const result = await aiBridgeService.generateImage({
      model: 'doubao-seedream-4-5-251128',
      prompt: '一只可爱的卡通小猫',
      n: 1,
      size: '1024x1024',
      logo_info: { add_logo: false }
    });
    
    console.log('完整结果:');
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.log('错误:', e.message);
  }
}

test().then(() => process.exit(0));
