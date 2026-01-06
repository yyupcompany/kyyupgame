import { aiBridgeService } from './src/services/ai/bridge/ai-bridge.service';

async function testImageGeneration() {
  console.log('========== 测试豆包图片生成 ==========');
  
  try {
    // 直接使用AIBridge生成图片
    const result = await aiBridgeService.generateImage({
      model: 'doubao-seedream-4-5-251128',
      prompt: '一只可爱的卡通小猫，Q版萌系风格，粉白色毛发，红色眼睛，站在绿色草地上',
      n: 1,
      size: '1024x1024',
      quality: 'standard'
    });
    
    console.log('\n✅ 图片生成成功！');
    console.log('返回结果:', JSON.stringify(result, null, 2));
    
    if (result.data && result.data.length > 0) {
      console.log('\n图片URL:', result.data[0].url);
    }
  } catch (error: any) {
    console.error('\n❌ 图片生成失败:');
    console.error('错误信息:', error.message);
    console.error('详细错误:', error);
  }
}

testImageGeneration().then(() => {
  console.log('\n测试完成');
  process.exit(0);
}).catch((err) => {
  console.error('测试出错:', err);
  process.exit(1);
});
