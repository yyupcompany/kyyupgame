/**
 * 直接测试TTS V3 Bidirection服务
 */

const WebSocket = require('ws');
const crypto = require('crypto');
const fs = require('fs');

// TTS配置
const CONFIG = {
  appKey: '7563592522',
  accessKey: 'jq3vA4Ep5EsN-FU4mKizV6ePioXR3Ol3',
  resourceId: 'volc.service_type.10029',
  wsUrl: 'wss://openspeech.bytedance.com/api/v3/tts/bidirection'
};

// 测试文本
const TEST_TEXT = '你好，我是智能语音助手，很高兴为您服务。';

// 事件类型
const Event = {
  START_CONNECTION: 1,
  FINISH_CONNECTION: 2,
  CONNECTION_STARTED: 50,
  CONNECTION_FAILED: 51,
  CONNECTION_FINISHED: 52,
  START_SESSION: 100,
  FINISH_SESSION: 102,
  SESSION_STARTED: 150,
  SESSION_FINISHED: 152,
  SESSION_FAILED: 153,
  TASK_REQUEST: 200,
  TTS_SENTENCE_START: 350,
  TTS_SENTENCE_END: 351,
  TTS_RESPONSE: 352
};

// 构建START_CONNECTION帧
function buildStartConnectionFrame() {
  const frame = Buffer.alloc(8);
  frame[0] = 0b00010001;
  frame[1] = 0b00010100;
  frame[2] = 0b00010000;
  frame[3] = 0b00000000;
  frame.writeUInt32BE(Event.START_CONNECTION, 4);
  
  const payload = Buffer.from('{}');
  const payloadSize = Buffer.alloc(4);
  payloadSize.writeUInt32BE(payload.length, 0);
  
  return Buffer.concat([frame, payloadSize, payload]);
}

// 构建START_SESSION帧
function buildStartSessionFrame(sessionId, speaker, format, sampleRate, speedRatio, volumeRatio) {
  const payload = JSON.stringify({
    event: Event.START_SESSION,
    req_params: {
      speaker: speaker,
      audio_params: {
        format: format,
        sample_rate: sampleRate,
        speed_ratio: speedRatio,
        volume_ratio: volumeRatio
      }
    }
  });
  
  const frame = Buffer.alloc(8);
  frame[0] = 0b00010001;
  frame[1] = 0b00010100;
  frame[2] = 0b00010000;
  frame[3] = 0b00000000;
  frame.writeUInt32BE(Event.START_SESSION, 4);
  
  const sessionIdBuf = Buffer.from(sessionId, 'utf-8');
  const sessionIdLen = Buffer.alloc(4);
  sessionIdLen.writeUInt32BE(sessionIdBuf.length, 0);
  
  const payloadBuf = Buffer.from(payload, 'utf-8');
  const payloadLen = Buffer.alloc(4);
  payloadLen.writeUInt32BE(payloadBuf.length, 0);
  
  return Buffer.concat([frame, sessionIdLen, sessionIdBuf, payloadLen, payloadBuf]);
}

// 构建TASK_REQUEST帧
function buildTaskRequestFrame(sessionId, text) {
  const payload = JSON.stringify({
    event: Event.TASK_REQUEST,
    req_params: {
      text: text
    }
  });
  
  const frame = Buffer.alloc(8);
  frame[0] = 0b00010001;
  frame[1] = 0b00010100;
  frame[2] = 0b00010000;
  frame[3] = 0b00000000;
  frame.writeUInt32BE(Event.TASK_REQUEST, 4);
  
  const sessionIdBuf = Buffer.from(sessionId, 'utf-8');
  const sessionIdLen = Buffer.alloc(4);
  sessionIdLen.writeUInt32BE(sessionIdBuf.length, 0);
  
  const payloadBuf = Buffer.from(payload, 'utf-8');
  const payloadLen = Buffer.alloc(4);
  payloadLen.writeUInt32BE(payloadBuf.length, 0);
  
  return Buffer.concat([frame, sessionIdLen, sessionIdBuf, payloadLen, payloadBuf]);
}

// 构建FINISH_SESSION帧
function buildFinishSessionFrame(sessionId) {
  const frame = Buffer.alloc(8);
  frame[0] = 0b00010001;
  frame[1] = 0b00010100;
  frame[2] = 0b00010000;
  frame[3] = 0b00000000;
  frame.writeUInt32BE(Event.FINISH_SESSION, 4);
  
  const sessionIdBuf = Buffer.from(sessionId, 'utf-8');
  const sessionIdLen = Buffer.alloc(4);
  sessionIdLen.writeUInt32BE(sessionIdBuf.length, 0);
  
  const payloadLen = Buffer.alloc(4);
  payloadLen.writeUInt32BE(0, 0);
  
  return Buffer.concat([frame, sessionIdLen, sessionIdBuf, payloadLen]);
}

// 构建FINISH_CONNECTION帧
function buildFinishConnectionFrame() {
  const frame = Buffer.alloc(8);
  frame[0] = 0b00010001;
  frame[1] = 0b00010100;
  frame[2] = 0b00010000;
  frame[3] = 0b00000000;
  frame.writeUInt32BE(Event.FINISH_CONNECTION, 4);
  
  const payloadLen = Buffer.alloc(4);
  payloadLen.writeUInt32BE(0, 0);
  
  return Buffer.concat([frame, payloadLen]);
}

// 主测试函数
async function testTTS() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   TTS V3 Bidirection 直接测试          ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  console.log('📝 测试文本:', TEST_TEXT);
  console.log('🔗 连接地址:', CONFIG.wsUrl);
  console.log('');
  
  return new Promise((resolve, reject) => {
    const sessionId = `session_${Date.now()}`;
    const audioChunks = [];
    let hasError = false;
    
    // 创建WebSocket连接
    const ws = new WebSocket(CONFIG.wsUrl, {
      headers: {
        'X-Api-App-Key': CONFIG.appKey,
        'X-Api-Access-Key': CONFIG.accessKey,
        'X-Api-Resource-Id': CONFIG.resourceId,
        'X-Api-Request-Id': crypto.randomUUID()
      }
    });
    
    // 超时处理
    const timeout = setTimeout(() => {
      if (!hasError) {
        hasError = true;
        ws.close();
        reject(new Error('TTS请求超时（30秒）'));
      }
    }, 30000);
    
    // 连接成功
    ws.on('open', () => {
      console.log('✅ WebSocket连接成功');
      console.log('📤 发送START_CONNECTION...\n');
      
      const startConnFrame = buildStartConnectionFrame();
      ws.send(startConnFrame);
    });
    
    // 接收消息
    ws.on('message', (data) => {
      const event = data.readUInt32BE(4);
      console.log(`📨 收到事件: ${event} (${getEventName(event)})`);
      
      if (event === Event.TTS_RESPONSE) {
        // TTS_RESPONSE是音频数据
        const header = data.readUInt8(0);
        const headerSize = (header & 0x0F) * 4;
        let offset = headerSize;
        
        // 跳过session_id
        const sessionIdLen = data.readUInt32BE(offset);
        offset += 4 + sessionIdLen;
        
        // 读取音频数据
        const audioLen = data.readUInt32BE(offset);
        offset += 4;
        const audioData = data.slice(offset, offset + audioLen);
        
        console.log(`   🎵 收到音频数据: ${audioData.length} bytes`);
        audioChunks.push(audioData);
        return;
      }
      
      if (event === Event.CONNECTION_STARTED) {
        console.log('📤 发送START_SESSION...\n');
        const startSessFrame = buildStartSessionFrame(
          sessionId,
          'zh_female_cancan_mars_bigtts',
          'mp3',
          24000,
          1.0,
          1.0
        );
        ws.send(startSessFrame);
        
      } else if (event === Event.SESSION_STARTED) {
        console.log('📤 发送TASK_REQUEST...\n');
        const taskFrame = buildTaskRequestFrame(sessionId, TEST_TEXT);
        ws.send(taskFrame);
        
      } else if (event === Event.TTS_SENTENCE_END) {
        console.log('📤 发送FINISH_SESSION...\n');
        const finishSessFrame = buildFinishSessionFrame(sessionId);
        ws.send(finishSessFrame);
        
      } else if (event === Event.SESSION_FINISHED) {
        console.log('📤 发送FINISH_CONNECTION...\n');
        const finishConnFrame = buildFinishConnectionFrame();
        ws.send(finishConnFrame);
        
      } else if (event === Event.CONNECTION_FINISHED) {
        console.log('✅ 连接完成\n');
        clearTimeout(timeout);
        ws.close();
        
      } else if (event === Event.SESSION_FAILED || event === Event.CONNECTION_FAILED) {
        hasError = true;
        clearTimeout(timeout);
        console.error('❌ TTS失败');
        ws.close();
        reject(new Error('TTS失败'));
      }
    });
    
    // 连接关闭
    ws.on('close', () => {
      clearTimeout(timeout);
      console.log('🔌 WebSocket连接关闭\n');
      
      if (!hasError) {
        if (audioChunks.length > 0) {
          const audioBuffer = Buffer.concat(audioChunks);
          console.log(`✅ 音频合成成功: ${audioBuffer.length} bytes`);
          
          // 保存音频文件
          const filename = 'test-tts-direct-output.mp3';
          fs.writeFileSync(filename, audioBuffer);
          console.log(`💾 音频已保存: ${filename}\n`);
          
          resolve({ audioBuffer, filename });
        } else {
          reject(new Error('未收到音频数据'));
        }
      }
    });
    
    // 错误处理
    ws.on('error', (error) => {
      hasError = true;
      clearTimeout(timeout);
      console.error('❌ WebSocket错误:', error.message);
      reject(error);
    });
  });
}

// 获取事件名称
function getEventName(event) {
  const names = {
    1: 'START_CONNECTION',
    2: 'FINISH_CONNECTION',
    50: 'CONNECTION_STARTED',
    51: 'CONNECTION_FAILED',
    52: 'CONNECTION_FINISHED',
    100: 'START_SESSION',
    102: 'FINISH_SESSION',
    150: 'SESSION_STARTED',
    152: 'SESSION_FINISHED',
    153: 'SESSION_FAILED',
    200: 'TASK_REQUEST',
    350: 'TTS_SENTENCE_START',
    351: 'TTS_SENTENCE_END',
    352: 'TTS_RESPONSE'
  };
  return names[event] || 'UNKNOWN';
}

// 运行测试
testTTS()
  .then(() => {
    console.log('🎉 测试完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
  });

