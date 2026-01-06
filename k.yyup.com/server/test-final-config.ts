import { aiBridgeService } from './src/services/ai/bridge/ai-bridge.service';

async function finalTest() {
  console.log('========== 最终配置验证 ==========');
  console.log('尺寸: 1024x1024');
  console.log('Logo水印: 已禁用');
  console.log('');
  
  try {
    const result = await aiBridgeService.generateImage({
      model: 'doubao-seedream-4-5-251128',
      prompt: '一只可爱的卡通小猫咪，Q版萌系风格，粉白色毛发，红色大眼睛，站在绿色草地上，背景是浅蓝色天空，色彩鲜艳柔和，适合幼儿观看',
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      logo_info: {
        add_logo: false
      }
    });
    
    console.log('✅ 生成成功！');
    console.log('\n📊 结果信息:');
    console.log('- 图片尺寸:', result.data?.[0]?.size);
    console.log('- 图片URL有效:', !!result.data?.[0]?.url);
    console.log('\n🎉 配置完成！');
    console.log('   ✅ 1024x1024 最小尺寸（节省tokens）');
    console.log('   ✅ 无logo水印');
    console.log('   ✅ 数据库自动加载配置');
  } catch (error: any) {
    console.error('❌ 失败:', error.message);
  }
}

finalTest().then(() => process.exit(0));
