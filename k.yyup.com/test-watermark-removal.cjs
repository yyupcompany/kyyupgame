/**
 * 测试豆包API无水印功能
 */

const { aiBridgeService } = require('./server/src/services/ai/bridge/ai-bridge.service');
const { autoImageGenerationService } = require('./server/src/services/ai/auto-image-generation.service');
const { refactoredMultimodalService } = require('./server/src/services/ai/refactored-multimodal.service');

async function testWatermarkRemoval() {
  console.log('🧪 开始测试豆包API无水印功能...\n');

  try {
    // 测试1: 通过aiBridgeService直接调用，启用无水印
    console.log('📝 测试1: AI桥接服务直接调用 (启用无水印)');
    console.log('─'.repeat(50));

    const directResult = await aiBridgeService.generateImage({
      prompt: '一只可爱的小猫在花园里玩耍，阳光明媚，高质量写实风格',
      size: '1024x1024',
      quality: 'hd',
      style: 'realistic',
      watermark_remove: true,  // 启用无水印
      n: 1
    });

    console.log('✅ 直接调用结果:', {
      success: directResult.success,
      hasWatermarkRemove: directResult.watermark_remove,
      imageUrl: directResult.url?.substring(0, 100) + '...',
      error: directResult.error
    });

    // 测试2: 通过autoImageGenerationService调用，启用无水印
    console.log('\n📝 测试2: 自动图片生成服务 (启用无水印)');
    console.log('─'.repeat(50));

    const autoResult = await autoImageGenerationService.generateImage({
      prompt: '一个美丽的日落景色，海边，高质量摄影风格',
      category: 'education',
      style: 'realistic',
      size: '1024x1024',
      quality: 'hd',
      watermark: true  // 启用无水印
    });

    console.log('✅ 自动生成结果:', {
      success: autoResult.success,
      imageUrl: autoResult.imageUrl?.substring(0, 100) + '...',
      error: autoResult.error
    });

    // 测试3: 通过refactoredMultimodalService调用，启用无水印
    console.log('\n📝 测试3: 重构多模态服务 (启用无水印)');
    console.log('─'.repeat(50));

    const multimodalResult = await refactoredMultimodalService.generateImage(1, {
      prompt: '一座现代幼儿园，孩子们在操场上快乐玩耍，卡通风格',
      size: '1024x1024',
      style: 'cartoon',
      quality: 'hd',
      watermark_remove: true  // 启用无水印
    });

    console.log('✅ 多模态服务结果:', {
      success: multimodalResult.success,
      dataUrl: multimodalResult.data?.url?.substring(0, 100) + '...',
      error: multimodalResult.error
    });

    // 测试4: 测试有水印模式对比
    console.log('\n📝 测试4: 对比测试 (禁用无水印)');
    console.log('─'.repeat(50));

    const withWatermarkResult = await aiBridgeService.generateImage({
      prompt: '对比测试：一只小狗在公园里，有水印版本',
      size: '1024x1024',
      quality: 'hd',
      style: 'realistic',
      watermark_remove: false,  // 禁用无水印
      n: 1
    });

    console.log('✅ 有水印对比结果:', {
      success: withWatermarkResult.success,
      hasWatermarkRemove: withWatermarkResult.watermark_remove,
      imageUrl: withWatermarkResult.url?.substring(0, 100) + '...',
      error: withWatermarkResult.error
    });

    // 总结
    console.log('\n🎉 测试总结');
    console.log('─'.repeat(50));
    console.log(`✅ 直接调用 (无水印): ${directResult.success ? '成功' : '失败'}`);
    console.log(`✅ 自动生成 (无水印): ${autoResult.success ? '成功' : '失败'}`);
    console.log(`✅ 多模态服务 (无水印): ${multimodalResult.success ? '成功' : '失败'}`);
    console.log(`✅ 对比测试 (有水印): ${withWatermarkResult.success ? '成功' : '失败'}`);

    if (directResult.success && autoResult.success && multimodalResult.success) {
      console.log('\n🎊 所有测试通过！豆包API无水印功能已成功集成！');
      console.log('\n💡 使用说明:');
      console.log('   - 在调用图片生成API时，设置 watermark_remove: true 即可启用无水印');
      console.log('   - 此功能仅限豆包付费用户使用');
      console.log('   - 系统会自动检测豆包API并应用无水印参数');
    } else {
      console.log('\n⚠️ 部分测试失败，请检查错误信息');
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    console.error('详细错误:', error);
  }
}

// 运行测试
testWatermarkRemoval();