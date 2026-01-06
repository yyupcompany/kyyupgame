/**
 * 测试火山引擎TTS WebSocket连接
 * 用于验证WebSocket认证方式
 */

const WebSocket = require('ws');

const CONFIG = {
  // 使用数据库中的TTS配置
  apiKey: '3251d95f-1039-4daa-9afa-eb3bfe345552',
  wsUrl: 'wss://openspeech.bytedance.com/api/v3/tts/unidirectional/stream',
  resourceId: 'volc.service_type.10029'
};

console.log('🚀 测试火山引擎TTS WebSocket连接\n');
console.log(`API Key: ${CONFIG.apiKey.substring(0, 20)}...`);
console.log(`WebSocket URL: ${CONFIG.wsUrl}`);
console.log(`Resource ID: ${CONFIG.resourceId}\n`);

console.log('🔌 正在连接WebSocket...\n');

const ws = new WebSocket(CONFIG.wsUrl, {
  headers: {
    'X-Api-App-Key': CONFIG.apiKey,
    'X-Api-Resource-Id': CONFIG.resourceId
  }
});

ws.on('open', () => {
  console.log('✅ WebSocket连接成功！\n');
  
  // 发送TTS请求
  const request = {
    app: {
      appid: CONFIG.apiKey,
      token: 'access_token',
      cluster: 'volcano_tts'
    },
    user: {
      uid: 'test_user'
    },
    audio: {
      voice_type: 'zh_female_cancan_mars_bigtts',
      encoding: 'mp3',
      speed_ratio: 1.0,
      volume_ratio: 1.0,
      pitch_ratio: 1.0
    },
    request: {
      reqid: 'test_' + Date.now(),
      text: '你好，这是一个测试。',
      text_type: 'plain',
      operation: 'submit'
    }
  };
  
  console.log('📤 发送TTS请求...\n');
  ws.send(JSON.stringify(request));
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    console.log('📨 收到消息:', message);
  } catch (e) {
    console.log('📨 收到二进制数据，大小:', data.length, '字节');
  }
});

ws.on('error', (error) => {
  console.error('❌ WebSocket错误:', error.message);
});

ws.on('close', (code, reason) => {
  console.log(`\n🔌 WebSocket连接关闭 (代码: ${code}, 原因: ${reason || '无'})`);
});

// 10秒后关闭
setTimeout(() => {
  console.log('\n⏱️  测试时间到，关闭连接...');
  ws.close();
}, 10000);

