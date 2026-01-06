/**
 * 豆包 Seedream 4.5 水印测试脚本
 * 测试图片生成时是否能够去除AI水印标志
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 配置
const API_BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '../test-outputs/watermark-test');
const TEST_USER = {
  username: 'admin',
  password: '123456'
};

let authToken = null;

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * 登录获取认证令牌
 */
async function login() {
  console.log('🔐 正在登录获取认证令牌...');
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/login`,
      TEST_USER,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.success && response.data.data?.token) {
      authToken = response.data.data.token;
      console.log('✅ 登录成功，已获取令牌');
      return true;
    } else {
      console.error('❌ 登录失败：响应格式不正确');
      return false;
    }
  } catch (error) {
    console.error('❌ 登录失败:', error.message);
    if (error.response) {
      console.error('📥 错误响应:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

/**
 * 测试图片生成（带/不带水印）
 */
async function testImageGeneration(removeWatermark, testName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 测试：${testName}`);
  console.log(`${'='.repeat(60)}`);
  
  try {
    const requestData = {
      prompt: '幼儿园春季运动会海报，阳光明媚，孩子们欢快奔跑，色彩鲜艳',
      category: 'poster',
      style: 'natural',
      size: '1920x1080',
      quality: 'hd',
      watermark: removeWatermark
    };

    console.log('📤 请求参数:', JSON.stringify(requestData, null, 2));
    
    const startTime = Date.now();
    
    // 调用图片生成API
    const response = await axios.post(
      `${API_BASE_URL}/api/auto-image/generate`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        timeout: 60000 // 60秒超时
      }
    );

    const duration = Date.now() - startTime;

    console.log(`✅ API调用成功 (耗时: ${duration}ms)`);
    console.log('📥 响应数据:', JSON.stringify(response.data, null, 2));

    // 保存响应信息
    const resultFile = path.join(OUTPUT_DIR, `${testName}-result.json`);
    fs.writeFileSync(resultFile, JSON.stringify({
      testName,
      removeWatermark,
      request: requestData,
      response: response.data,
      duration,
      timestamp: new Date().toISOString()
    }, null, 2));
    
    console.log(`💾 结果已保存到: ${resultFile}`);

    // 如果返回了图片URL，尝试下载
    if (response.data.success && response.data.data?.imageUrl) {
      const imageUrl = response.data.data.imageUrl;
      console.log(`🖼️  图片URL: ${imageUrl}`);
      
      // 下载图片
      try {
        const imageResponse = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 30000
        });
        
        const imageFile = path.join(OUTPUT_DIR, `${testName}.png`);
        fs.writeFileSync(imageFile, imageResponse.data);
        console.log(`✅ 图片已下载: ${imageFile}`);
        console.log(`📏 图片大小: ${(imageResponse.data.length / 1024).toFixed(2)} KB`);
      } catch (downloadError) {
        console.error('❌ 图片下载失败:', downloadError.message);
      }
    }

    return {
      success: true,
      testName,
      removeWatermark,
      imageUrl: response.data.data?.imageUrl,
      duration
    };

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    
    if (error.response) {
      console.error('📥 错误响应:', JSON.stringify(error.response.data, null, 2));
    }
    
    // 保存错误信息
    const errorFile = path.join(OUTPUT_DIR, `${testName}-error.json`);
    fs.writeFileSync(errorFile, JSON.stringify({
      testName,
      removeWatermark,
      error: error.message,
      response: error.response?.data,
      timestamp: new Date().toISOString()
    }, null, 2));

    return {
      success: false,
      testName,
      removeWatermark,
      error: error.message
    };
  }
}

/**
 * 主测试流程
 */
async function runTests() {
  console.log('🚀 开始豆包 Seedream 4.5 水印测试');
  console.log(`📁 输出目录: ${OUTPUT_DIR}`);
  console.log(`🌐 API地址: ${API_BASE_URL}`);
  
  // 先登录
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('💥 登录失败，无法继续测试');
    process.exit(1);
  }
  
  console.log('\n');
  
  const results = [];

  // 测试1: 保留水印 (watermark: true)
  const test1 = await testImageGeneration(true, 'with-watermark');
  results.push(test1);
  
  // 等待2秒，避免请求过快
  console.log('\n⏳ 等待2秒...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 测试2: 去除水印 (watermark: false)
  const test2 = await testImageGeneration(false, 'without-watermark');
  results.push(test2);

  // 输出测试总结
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试总结');
  console.log('='.repeat(60));
  
  results.forEach((result, index) => {
    console.log(`\n测试 ${index + 1}: ${result.testName}`);
    console.log(`  状态: ${result.success ? '✅ 成功' : '❌ 失败'}`);
    console.log(`  去除水印: ${result.removeWatermark ? '是' : '否'}`);
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
}

// 执行测试
runTests().catch(error => {
  console.error('💥 测试执行失败:', error);
  process.exit(1);
});
