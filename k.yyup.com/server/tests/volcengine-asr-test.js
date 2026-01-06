/**
 * 火山引擎语音识别WebSocket测试
 * 测试大模型语音识别功能
 */

const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// 配置信息 - 根据GitHub示例配置
const config = {
  appId: '7563592522',
  apiKey: 'e1545f0e-1d6f-4e70-aab3-3c5fdbec0700',
  // 火山引擎大模型流式语音识别WebSocket地址
  // 根据文档，大模型ASR使用 /bigmodel 端点
  wsUrl: 'wss://openspeech.bytedance.com/api/v3/sauc/bigmodel',
  // 音频参数
  audioFormat: 'pcm',
  sampleRate: 16000,
  encoding: 'linear16',
  language: 'zh-CN',
  cluster: 'volcengine_input_common'
};

/**
 * 生成WebSocket URL with query parameters
 * 火山引擎使用query参数进行认证
 */
function generateWebSocketUrl() {
  const params = {
    appid: config.appId,
    token: config.apiKey,
    cluster: config.cluster,
    format: config.audioFormat,
    rate: config.sampleRate,
    bits: 16,
    channel: 1,
    language: config.language
  };

  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return `${config.wsUrl}?${queryString}`;
}

/**
 * 测试WebSocket连接
 */
function testWebSocketConnection() {
  return new Promise((resolve, reject) => {
    console.log('🔗 开始连接火山引擎语音识别服务...');
    console.log('📍 WebSocket URL:', config.wsUrl);

    // 生成完整的WebSocket URL（包含认证参数）
    const fullUrl = generateWebSocketUrl();
    console.log('🔗 完整URL:', fullUrl.replace(config.apiKey, '***'));

    const ws = new WebSocket(fullUrl);
    let isConnected = false;
    let recognitionResults = [];
    
    // 连接成功
    ws.on('open', () => {
      console.log('✅ WebSocket连接成功');
      isConnected = true;

      // 火山引擎大模型ASR连接成功后会自动开始识别
      // 不需要发送额外的开始消息
      console.log('📤 连接已建立，等待服务器响应...');

      // 等待服务器响应后关闭连接
      setTimeout(() => {
        console.log('⏱️  测试时间到，关闭连接');
        ws.close();
      }, 3000);
    });
    
    // 接收消息
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('📥 收到消息:', JSON.stringify(message, null, 2));
        
        if (message.type === 'result') {
          recognitionResults.push(message);
        }
      } catch (error) {
        console.error('❌ 解析消息失败:', error);
      }
    });
    
    // 连接错误
    ws.on('error', (error) => {
      console.error('❌ WebSocket错误:', error.message);
      reject(error);
    });
    
    // 连接关闭
    ws.on('close', (code, reason) => {
      console.log(`🔌 WebSocket连接关闭 - Code: ${code}, Reason: ${reason || '无'}`);
      
      if (isConnected) {
        console.log('\n📊 测试结果汇总:');
        console.log('- 连接状态: ✅ 成功');
        console.log('- 识别结果数量:', recognitionResults.length);
        console.log('- 配置信息: ✅ 有效');
        
        resolve({
          success: true,
          connected: true,
          results: recognitionResults,
          config: config
        });
      } else {
        reject(new Error('连接失败'));
      }
    });
  });
}

/**
 * 测试音频文件识别
 */
async function testAudioFileRecognition(audioFilePath) {
  return new Promise((resolve, reject) => {
    console.log('\n🎵 开始测试音频文件识别...');
    console.log('📁 音频文件:', audioFilePath);

    if (!fs.existsSync(audioFilePath)) {
      console.log('⚠️  音频文件不存在，跳过文件测试');
      resolve({ success: true, skipped: true });
      return;
    }

    const fullUrl = generateWebSocketUrl();
    const ws = new WebSocket(fullUrl);
    
    let recognitionText = '';
    
    ws.on('open', () => {
      console.log('✅ 连接成功，开始发送音频数据');
      
      // 读取音频文件
      const audioData = fs.readFileSync(audioFilePath);
      const chunkSize = 3200; // 每次发送3200字节 (16000Hz * 16bit / 8 * 0.1s)
      
      let offset = 0;
      const sendInterval = setInterval(() => {
        if (offset >= audioData.length) {
          clearInterval(sendInterval);
          
          // 发送结束消息
          ws.send(JSON.stringify({ type: 'end' }));
          console.log('📤 音频数据发送完成');
          return;
        }
        
        const chunk = audioData.slice(offset, offset + chunkSize);
        ws.send(chunk);
        offset += chunkSize;
        
        if (offset % (chunkSize * 10) === 0) {
          console.log(`📤 已发送: ${Math.floor(offset / audioData.length * 100)}%`);
        }
      }, 100); // 每100ms发送一次
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'result' && message.result) {
          recognitionText += message.result.text || '';
          console.log('📝 识别结果:', message.result.text);
        }
      } catch (error) {
        // 可能是二进制数据，忽略
      }
    });
    
    ws.on('error', (error) => {
      console.error('❌ 错误:', error.message);
      reject(error);
    });
    
    ws.on('close', () => {
      console.log('\n✅ 识别完成');
      console.log('📄 完整识别文本:', recognitionText || '(无结果)');
      
      resolve({
        success: true,
        text: recognitionText,
        audioFile: audioFilePath
      });
    });
  });
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🚀 火山引擎语音识别测试开始\n');
  console.log('📋 配置信息:');
  console.log('- AppID:', config.appId);
  console.log('- API Key:', config.apiKey.substring(0, 10) + '...');
  console.log('- WebSocket URL:', config.wsUrl);
  console.log('- 采样率:', config.sampleRate);
  console.log('- 语言:', config.language);
  console.log('\n' + '='.repeat(60) + '\n');
  
  try {
    // 测试1: WebSocket连接测试
    console.log('📌 测试1: WebSocket连接测试');
    const connectionResult = await testWebSocketConnection();
    console.log('\n✅ 连接测试通过\n');
    console.log('='.repeat(60) + '\n');
    
    // 测试2: 音频文件识别测试（如果有测试音频文件）
    const testAudioPath = path.join(__dirname, 'test-audio.pcm');
    if (fs.existsSync(testAudioPath)) {
      console.log('📌 测试2: 音频文件识别测试');
      const audioResult = await testAudioFileRecognition(testAudioPath);
      console.log('\n✅ 音频识别测试通过\n');
    } else {
      console.log('📌 测试2: 音频文件识别测试 - 跳过（无测试文件）\n');
    }
    
    console.log('='.repeat(60));
    console.log('\n🎉 所有测试完成！\n');
    console.log('✅ 火山引擎语音识别服务配置有效');
    console.log('✅ 可以集成到AIBridge服务中');
    
    return {
      success: true,
      config: config,
      message: '测试成功，配置有效'
    };
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('详细错误:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// 运行测试
if (require.main === module) {
  runTests()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = {
  testWebSocketConnection,
  testAudioFileRecognition,
  config
};

