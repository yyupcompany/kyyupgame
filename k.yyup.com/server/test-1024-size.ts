import { aiBridgeService } from './src/services/ai/bridge/ai-bridge.service';

async function test1024Size() {
  console.log('========== 测试：1024尺寸 ==========\n');
  
  try {
    const result = await aiBridgeService.generateImage({
      model: 'doubao-seedream-4-5-251128',
      prompt: '一只可爱的卡通小猫，Q版萌系风格',
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      logo_info: {
        add_logo: false
      }
    });
    
    console.log('✅ 1024x1024 成功！');
    console.log('Token使用:', result.usage?.total_tokens);
  } catch (error: any) {
    console.log('❌ 1024x1024 失败:', error.message);
    
    // 如果1024失败，测试其他小尺寸
    console.log('\n尝试其他尺寸...\n');
    
    // 尝试 1280x1280 = 1,638,400 (仍然小于要求)
    try {
      const result2 = await aiBridgeService.generateImage({
        model: 'doubao-seedream-4-5-251128',
        prompt: '测试图片',
        n: 1,
        size: '1280x720',  // 921,600
        logo_info: { add_logo: false }
      });
      console.log('✅ 1280x720 成功！Token:', result2.usage?.total_tokens);
    } catch (e2) {
      console.log('❌ 1280x720 也失败:', e2.message);
    }
  }
}

test1024Size().then(() => process.exit(0));
