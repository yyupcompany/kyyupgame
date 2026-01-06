/**
 * 测试HTTP TTS端点
 */

const axios = require('axios');
const fs = require('fs');

async function testHTTPTTS() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   测试HTTP TTS端点                     ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  const endpoint = 'https://ark.cn-beijing.volces.com/api/v3/audio/speech';
  const apiKey = 'ffb6e528-e8e9-4e0f-a0e9-e8e9e8e9e8e9'; // 从数据库获取
  
  const params = {
    model: 'doubao-tts-bigmodel',
    input: '你好，我是智能语音助手，很高兴为您服务。',
    voice: 'nova',
    response_format: 'mp3',
    speed: 1
  };
  
  console.log('📝 请求参数:', JSON.stringify(params, null, 2));
  console.log('🔗 端点:', endpoint);
  console.log('🔑 API Key:', apiKey.substring(0, 10) + '...\n');
  
  try {
    const response = await axios.post(endpoint, params, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer',
      timeout: 30000
    });
    
    console.log('✅ HTTP响应成功');
    console.log('📊 状态码:', response.status);
    console.log('📦 Content-Type:', response.headers['content-type']);
    console.log('📏 Content-Length:', response.headers['content-length']);
    console.log('📏 实际数据长度:', response.data.length, 'bytes\n');
    
    if (response.data.length > 0) {
      const filename = 'test-http-tts-output.mp3';
      fs.writeFileSync(filename, response.data);
      console.log(`💾 音频已保存: ${filename}`);
    } else {
      console.error('❌ 返回的音频数据为空！');
    }
    
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    if (error.response) {
      console.error('📊 响应状态:', error.response.status);
      console.error('📦 响应数据:', error.response.data.toString());
    }
  }
}

testHTTPTTS();

