/**
 * 豆包 Seedream 4.5 水印测试脚本（直接调用服务层）
 * 绕过API认证，直接测试图片生成功能
 */

const path = require('path');
const fs = require('fs');

// 动态导入服务
const OUTPUT_DIR = path.join(__dirname, '../test-outputs/watermark-test');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * 测试图片生成
 */
async function testImageGeneration() {
  console.log('🚀 开始豆包 Seedream 4.5 水印测试（直接调用服务层）');
  console.log(`📁 输出目录: ${OUTPUT_DIR}\n`);

  try {
    // 动态导入服务（需要在async函数中）
    const { AutoImageGenerationService } = require('../server/src/services/ai/auto-image-generation.service');
    const service = new AutoImageGenerationService();

    const tests = [
      {
        name: 'with-watermark',
        description: '保留水印（watermark: true）',
        watermark: true
      },
      {
        name: 'without-watermark',
        description: '去除水印（watermark: false）',
        watermark: false
      }
    ];

    const results = [];

    for (const test of tests) {
      console.log(`${'='.repeat(60)}`);
      console.log(`🧪 测试：${test.description}`);
      console.log(`${'='.repeat(60)}`);

      const startTime = Date.now();

      try {
        const result = await service.generateImage({
          prompt: '幼儿园春季运动会海报，阳光明媚，孩子们欢快奔跑，色彩鲜艳',
          category: 'poster',
          style: 'natural',
          size: '1920x1080',
          quality: 'hd',
          watermark: test.watermark
        });

        const duration = Date.now() - startTime;

        console.log(`✅ 生成成功 (耗时: ${duration}ms)`);
        console.log('📥 结果:', JSON.stringify(result, null, 2));

        // 保存结果
        const resultFile = path.join(OUTPUT_DIR, `${test.name}-result.json`);
        fs.writeFileSync(resultFile, JSON.stringify({
          testName: test.name,
          description: test.description,
          watermark: test.watermark,
          result,
          duration,
          timestamp: new Date().toISOString()
        }, null, 2));

        console.log(`💾 结果已保存: ${resultFile}`);

        if (result.imageUrl) {
          console.log(`🖼️  图片URL: ${result.imageUrl}`);
          
          // 下载图片
          const axios = require('axios');
          try {
            const imageResponse = await axios.get(result.imageUrl, {
              responseType: 'arraybuffer',
              timeout: 30000
            });
            
            const imageFile = path.join(OUTPUT_DIR, `${test.name}.png`);
            fs.writeFileSync(imageFile, imageResponse.data);
            console.log(`✅ 图片已下载: ${imageFile}`);
            console.log(`📏 图片大小: ${(imageResponse.data.length / 1024).toFixed(2)} KB`);
          } catch (downloadError) {
            console.error('❌ 图片下载失败:', downloadError.message);
          }
        }

        results.push({
          ...test,
          success: true,
          imageUrl: result.imageUrl,
          duration
        });

      } catch (error) {
        console.error('❌ 测试失败:', error.message);
        console.error('错误堆栈:', error.stack);

        // 保存错误
        const errorFile = path.join(OUTPUT_DIR, `${test.name}-error.json`);
        fs.writeFileSync(errorFile, JSON.stringify({
          testName: test.name,
          description: test.description,
          watermark: test.watermark,
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        }, null, 2));

        results.push({
          ...test,
          success: false,
          error: error.message
        });
      }

      // 等待2秒
      if (test !== tests[tests.length - 1]) {
        console.log('\n⏳ 等待2秒...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // 输出测试总结
    console.log('\n' + '='.repeat(60));
    console.log('📊 测试总结');
    console.log('='.repeat(60));
    
    results.forEach((result, index) => {
      console.log(`\n测试 ${index + 1}: ${result.description}`);
      console.log(`  状态: ${result.success ? '✅ 成功' : '❌ 失败'}`);
      console.log(`  水印设置: ${result.watermark ? 'true (保留)' : 'false (去除)'}`);
      if (result.imageUrl) {
        console.log(`  图片URL: ${result.imageUrl}`);
      }
      if (result.duration) {
        console.log(`  耗时: ${result.duration}ms`);
      }
      if (result.error) {
        console.log(`  错误: ${result.error}`);
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log('📝 检查说明:');
    console.log('='.repeat(60));
    console.log('1. 请查看输出目录中的图片文件');
    console.log('2. 对比两张图片，检查是否有"AI生成"或水印标记');
    console.log('3. 查看 *-result.json 文件了解详细的API响应');
    console.log(`\n📁 输出目录: ${OUTPUT_DIR}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('💥 测试初始化失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 执行测试
testImageGeneration().catch(error => {
  console.error('💥 测试执行失败:', error);
  process.exit(1);
});
