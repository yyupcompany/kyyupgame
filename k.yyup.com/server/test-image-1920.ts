import { aiBridgeService } from './src/services/ai/bridge/ai-bridge.service';

async function testImageGeneration() {
  console.log('========== 测试：1920尺寸 + 无logo水印 ==========\n');
  
  try {
    const result = await aiBridgeService.generateImage({
      model: 'doubao-seedream-4-5-251128',
      prompt: '一只可爱的卡通小猫，Q版萌系风格，粉白色毛发，红色大眼睛，站在绿色草地上，背景是浅蓝色天空，色彩鲜艳柔和，适合幼儿观看',
      n: 1,
      size: '1920x1920',  // 1920x1920 = 3,686,400像素，刚好满足豆包最小要求
      quality: 'standard',
      // 不添加logo水印
      logo_info: {
        add_logo: false
      }
    });
    
    console.log('\n✅ 图片生成成功！');
    console.log('\n📊 生成统计:');
    console.log('- 尺寸:', result.data?.[0]?.size || 'unknown');
    console.log('- Token使用:', result.usage?.total_tokens || 'unknown');
    console.log('\n🖼️ 图片URL:');
    console.log(result.data?.[0]?.url || '无URL');
    
    if (result.data && result.data.length > 0) {
      console.log('\n🎉 完美！豆包图片生成API配置正确：');
      console.log('   ✅ 1920x1920尺寸');
      console.log('   ✅ 无logo水印');
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
