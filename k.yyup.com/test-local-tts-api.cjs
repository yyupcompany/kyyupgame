/**
 * 测试本地TTS API
 * 用于调试TTS返回0字节的问题
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testLocalTTS() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   测试本地TTS API                      ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  // 步骤1: 登录获取Token
  console.log('📝 步骤1: 登录获取Token...');
  let token;
  try {
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    token = loginResponse.data.data.token;
    console.log('✅ 登录成功');
    console.log(`   Token: ${token.substring(0, 20)}...\n`);
  } catch (error) {
    console.error('❌ 登录失败:', error.message);
    process.exit(1);
  }
  
  // 步骤2: 调用TTS API
  console.log('📝 步骤2: 调用TTS API...');
  console.log('   端点: http://localhost:3000/api/ai/text-to-speech');
  console.log('   文本: "你好，我是智能语音助手，很高兴为您服务。"\n');
  
  try {
    const ttsResponse = await axios.post(
      'http://localhost:3000/api/ai/text-to-speech',
      {
        text: '你好，我是智能语音助手，很高兴为您服务。',
        voice: 'nova',
        speed: 1.0,
        format: 'mp3'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 60000
      }
    );
    
    console.log('✅ TTS API响应成功');
    console.log(`   状态码: ${ttsResponse.status}`);
    console.log(`   Content-Type: ${ttsResponse.headers['content-type']}`);
    console.log(`   Content-Length: ${ttsResponse.headers['content-length']}`);
    console.log(`   实际数据长度: ${ttsResponse.data.length} bytes\n`);
    
    if (ttsResponse.data.length > 0) {
      const filename = path.join(__dirname, 'test-local-tts-output.mp3');
      fs.writeFileSync(filename, ttsResponse.data);
      console.log(`💾 音频已保存: ${filename}`);
      console.log('\n✅ 测试成功！TTS API正常工作');
    } else {
      console.error('\n❌ 问题确认：TTS API返回0字节数据');
      console.error('   这说明请求到达了API，但是没有返回音频数据');
      console.error('   请检查后端日志中的详细信息');
    }
    
  } catch (error) {
    console.error('\n❌ TTS API调用失败');
    console.error(`   错误: ${error.message}`);
    
    if (error.response) {
      console.error(`   响应状态: ${error.response.status}`);
      console.error(`   响应头:`, error.response.headers);
      
      // 尝试解析错误响应
      try {
        const errorData = error.response.data.toString();
        console.error(`   响应数据: ${errorData}`);
      } catch (e) {
        console.error('   无法解析响应数据');
      }
    }
  }
  
  console.log('\n════════════════════════════════════════');
  console.log('测试完成');
  console.log('════════════════════════════════════════\n');
}

// 运行测试
testLocalTTS().catch(error => {
  console.error('测试异常:', error);
  process.exit(1);
});

