/**
 * 火山引擎TTS V3 WebSocket简化测试脚本
 * 用于向客服展示问题
 */

import WebSocket from 'ws';
import crypto from 'crypto';
import fs from 'fs';

console.log('🧪 火山引擎TTS V3 WebSocket测试\n');
console.log('=' .repeat(60));

// 配置信息
const config = {
  appId: '7563592522',
  accessToken: 'jq3vA4Ep5EsN-FU4mKizV6ePioXR3Ol3',
  resourceId: 'seed-tts-1.0', // 测试不同的资源ID
  wsUrl: 'wss://openspeech.bytedance.com/api/v3/tts/unidirectional/stream'
};

console.log('📋 配置信息:');
console.log(`   APP ID: ${config.appId}`);
console.log(`   Access Token: ${config.accessToken.substring(0, 20)}...`);
console.log(`   资源ID: ${config.resourceId}`);
console.log(`   端点: ${config.wsUrl}\n`);

// 创建WebSocket连接
console.log('🔗 正在连接WebSocket...');

const ws = new WebSocket(config.wsUrl, {
  headers: {
    'X-Api-App-Id': config.appId,
    'X-Api-Access-Key': config.accessToken,
    'X-Api-Resource-Id': config.resourceId,
    'X-Api-Request-Id': crypto.randomUUID()
  }
});

// 连接成功
ws.on('open', () => {
  console.log('✅ WebSocket连接成功\n');
  
  // 构建请求payload
  const payload = {
    namespace: 'BidirectionalTTS',
    event: 'ClientRequest',
    user: {
      uid: 'user_' + Date.now()
    },
    req_params: {
      text: '你好，我是火山引擎的语音合成服务。',
      speaker: 'zh_female_cancan_mars_bigtts',
      audio_params: {
        format: 'mp3',
        sample_rate: 24000,
        speed_ratio: 1.0,
        volume_ratio: 1.0
      }
    }
  };
  
  console.log('📤 发送请求:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('');
  
  // 构建二进制帧
  const payloadJson = JSON.stringify(payload);
  const payloadBuffer = Buffer.from(payloadJson, 'utf-8');
  const payloadSize = payloadBuffer.length;
  
  console.log(`📊 Payload信息:`);
  console.log(`   大小: ${payloadSize} bytes`);
  console.log(`   格式: JSON\n`);
  
  // Header (4字节)
  const header = Buffer.alloc(4);
  header[0] = 0x11; // Protocol version (0001) + Header size (0001)
  header[1] = 0x10; // Message type (0001) + flags (0000)
  header[2] = 0x10; // Serialization (0001 JSON) + Compression (0000)
  header[3] = 0x00; // Reserved
  
  console.log('🔧 二进制协议Header:');
  console.log(`   Byte 0: 0x${header[0].toString(16).padStart(2, '0')} (Protocol version + Header size)`);
  console.log(`   Byte 1: 0x${header[1].toString(16).padStart(2, '0')} (Message type + flags)`);
  console.log(`   Byte 2: 0x${header[2].toString(16).padStart(2, '0')} (Serialization + Compression)`);
  console.log(`   Byte 3: 0x${header[3].toString(16).padStart(2, '0')} (Reserved)\n`);
  
  // Payload size (4字节，大端)
  const sizeBuffer = Buffer.alloc(4);
  sizeBuffer.writeUInt32BE(payloadSize, 0);
  
  console.log('📏 Payload Size (大端):');
  console.log(`   ${Array.from(sizeBuffer).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ')}\n`);
  
  // 组合并发送
  const frame = Buffer.concat([header, sizeBuffer, payloadBuffer]);
  
  console.log('📦 完整帧信息:');
  console.log(`   总大小: ${frame.length} bytes`);
  console.log(`   Header: 4 bytes`);
  console.log(`   Size: 4 bytes`);
  console.log(`   Payload: ${payloadSize} bytes\n`);
  
  console.log('🚀 发送数据...\n');
  ws.send(frame);
});

// 接收消息
ws.on('message', (data: Buffer) => {
  console.log('📥 收到响应:');
  console.log(`   大小: ${data.length} bytes\n`);
  
  // 尝试解析为文本
  try {
    const text = data.toString('utf-8');
    console.log('📄 响应内容:');
    console.log(text);
    console.log('');
    
    // 检查是否是错误消息
    if (text.includes('error') || text.includes('Error')) {
      console.log('❌ 检测到错误消息');
      
      // 尝试提取错误信息
      const match = text.match(/"error":"([^"]+)"/);
      if (match) {
        console.log(`   错误: ${match[1]}`);
      }
    }
    
    // 保存响应
    fs.writeFileSync('response-from-server.txt', text);
    console.log('💾 响应已保存到: response-from-server.txt\n');
    
  } catch (e) {
    console.log('⚠️ 无法解析为文本，可能是二进制音频数据');
    
    // 保存为音频文件
    fs.writeFileSync('response-from-server.mp3', data);
    console.log('💾 响应已保存到: response-from-server.mp3\n');
  }
  
  // 关闭连接
  setTimeout(() => {
    ws.close();
  }, 1000);
});

// 错误处理
ws.on('error', (error: any) => {
  console.error('❌ WebSocket错误:');
  console.error(`   ${error.message}\n`);
  
  if (error.message.includes('403')) {
    console.log('💡 可能的原因:');
    console.log('   1. 资源ID没有权限');
    console.log('   2. Access Token无效或过期');
    console.log('   3. 该资源需要单独申请开通\n');
  } else if (error.message.includes('401')) {
    console.log('💡 可能的原因:');
    console.log('   1. APP ID或Access Token错误');
    console.log('   2. 认证方式不正确\n');
  } else if (error.message.includes('404')) {
    console.log('💡 可能的原因:');
    console.log('   1. 端点URL错误');
    console.log('   2. 资源ID不存在\n');
  }
});

// 连接关闭
ws.on('close', () => {
  console.log('🔌 WebSocket连接已关闭\n');
  console.log('=' .repeat(60));
  console.log('✅ 测试完成');
  
  process.exit(0);
});

// 超时处理
setTimeout(() => {
  console.log('⏰ 测试超时（30秒）');
  ws.close();
  process.exit(1);
}, 30000);

