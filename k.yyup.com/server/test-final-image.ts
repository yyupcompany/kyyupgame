import { aiBridgeService } from './src/services/ai/bridge/ai-bridge.service';

async function testImageGeneration() {
  console.log('========== 最终测试：豆包图片生成 ==========');
  
  try {
    const result = await aiBridgeService.generateImage({
      model: 'doubao-seedream-4-5-251128',
      prompt: '一只可爱的卡通小猫，Q版萌系风格，粉白色毛发，红色大眼睛，站在绿色草地上，背景是浅蓝色天空，色彩鲜艳柔和，适合幼儿观看',
      n: 1,
      size: '2048x2048',  // 2048x2048 = 4,194,304像素 > 3,686,400
      quality: 'standard'
    });
    
    console.log('\n✅ 图片生成成功！');
    console.log('返回结果:', JSON.stringify(result, null, 2));
    
    if (result.data && result.data.length > 0) {
      console.log('\n🖼️ 图片URL:', result.data[0].url);
      console.log('\n🎉 恭喜！豆包图片生成API工作正常！');
    }
  } catch (error: any) {
    console.error('\n❌ 图片生成失败:');
    console.error('错误信息:', error.message);
  }
}

testImageGeneration().then(() => {
  console.log('\n测试完成');
  process.exit(0);
}).catch((err) => {
  console.error('测试出错:', err);
  process.exit(1);
});
