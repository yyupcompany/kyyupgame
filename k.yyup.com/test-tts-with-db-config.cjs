const WebSocket = require('ws');
const crypto = require('crypto');

/**
 * 测试TTS V3 Bidirection服务
 * 使用数据库中的配置
 */

// 数据库配置
const CONFIG = {
  appKey: '7563592522',
  accessKey: 'jq3vA4Ep5EsN-FU4mKizV6ePioXR3Ol3',
  resourceId: 'volc.service_type.10029',
  wsUrl: 'wss://openspeech.bytedance.com/api/v3/tts/bidirection',
  testText: '你好，欢迎咨询我们幼儿园。我们提供优质的教育服务。'
};

// 事件类型
const Event = {
  NONE: 0,
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

// 协议类
class BidirectionProtocol {
  static buildStartConnectionFrame() {
    const header = Buffer.alloc(8);
    header.writeUInt8(1, 0);  // version
    header.writeUInt8(0, 1);  // message_type
    header.writeUInt8(0, 2);  // serialization
    header.writeUInt8(0, 3);  // compression
    header.writeUInt32BE(Event.START_CONNECTION, 4);
    
    const sessionIdLen = Buffer.alloc(4);
    sessionIdLen.writeUInt32BE(0, 0);
    
    const payloadLen = Buffer.alloc(4);
    payloadLen.writeUInt32BE(0, 0);
    
    return Buffer.concat([header, sessionIdLen, payloadLen]);
  }
  
  static buildStartSessionFrame(sessionId, speaker = 'zh_female_cancan_mars_bigtts') {
    const header = Buffer.alloc(8);
    header.writeUInt8(1, 0);
    header.writeUInt8(0, 1);
    header.writeUInt8(0, 2);
    header.writeUInt8(0, 3);
    header.writeUInt32BE(Event.START_SESSION, 4);
    
    const sessionIdBuf = Buffer.from(sessionId, 'utf-8');
    const sessionIdLen = Buffer.alloc(4);
    sessionIdLen.writeUInt32BE(sessionIdBuf.length, 0);
    
    const payload = JSON.stringify({
      speaker: speaker,
      audio: {
        format: 'mp3',
        sample_rate: 24000
      }
    });
    const payloadBuf = Buffer.from(payload, 'utf-8');
    const payloadLen = Buffer.alloc(4);
    payloadLen.writeUInt32BE(payloadBuf.length, 0);
    
    return Buffer.concat([header, sessionIdLen, sessionIdBuf, payloadLen, payloadBuf]);
  }
  
  static buildTaskRequestFrame(sessionId, text) {
    const header = Buffer.alloc(8);
    header.writeUInt8(1, 0);
    header.writeUInt8(0, 1);
    header.writeUInt8(0, 2);
    header.writeUInt8(0, 3);
    header.writeUInt32BE(Event.TASK_REQUEST, 4);
    
    const sessionIdBuf = Buffer.from(sessionId, 'utf-8');
    const sessionIdLen = Buffer.alloc(4);
    sessionIdLen.writeUInt32BE(sessionIdBuf.length, 0);
    
    const payload = JSON.stringify({ text: text });
    const payloadBuf = Buffer.from(payload, 'utf-8');
    const payloadLen = Buffer.alloc(4);
    payloadLen.writeUInt32BE(payloadBuf.length, 0);
    
    return Buffer.concat([header, sessionIdLen, sessionIdBuf, payloadLen, payloadBuf]);
  }
  
  static buildFinishSessionFrame(sessionId) {
    const header = Buffer.alloc(8);
    header.writeUInt8(1, 0);
    header.writeUInt8(0, 1);
    header.writeUInt8(0, 2);
    header.writeUInt8(0, 3);
    header.writeUInt32BE(Event.FINISH_SESSION, 4);
    
    const sessionIdBuf = Buffer.from(sessionId, 'utf-8');
    const sessionIdLen = Buffer.alloc(4);
    sessionIdLen.writeUInt32BE(sessionIdBuf.length, 0);
    
    const payloadLen = Buffer.alloc(4);
    payloadLen.writeUInt32BE(0, 0);
    
    return Buffer.concat([header, sessionIdLen, sessionIdBuf, payloadLen]);
  }
  
  static buildFinishConnectionFrame() {
    const header = Buffer.alloc(8);
    header.writeUInt8(1, 0);
    header.writeUInt8(0, 1);
    header.writeUInt8(0, 2);
    header.writeUInt8(0, 3);
    header.writeUInt32BE(Event.FINISH_CONNECTION, 4);
    
    const sessionIdLen = Buffer.alloc(4);
    sessionIdLen.writeUInt32BE(0, 0);
    
    const payloadLen = Buffer.alloc(4);
    payloadLen.writeUInt32BE(0, 0);
    
    return Buffer.concat([header, sessionIdLen, payloadLen]);
  }
  
  static parseFrame(data) {
    if (data.length < 16) {
      console.log(`⚠️  数据太短: ${data.length} 字节`);
      return null;
    }

    const version = data.readUInt8(0);
    const messageType = data.readUInt8(1);
    const serialization = data.readUInt8(2);
    const compression = data.readUInt8(3);
    const event = data.readUInt32BE(4);

    let offset = 8;

    // 检查是否有足够的数据读取sessionIdLen
    if (offset + 4 > data.length) {
      console.log(`⚠️  数据不足以读取sessionIdLen: offset=${offset}, length=${data.length}`);
      return null;
    }

    const sessionIdLen = data.readUInt32BE(offset);
    offset += 4;

    // 检查是否有足够的数据读取sessionId
    if (offset + sessionIdLen > data.length) {
      console.log(`⚠️  数据不足以读取sessionId: offset=${offset}, sessionIdLen=${sessionIdLen}, length=${data.length}`);
      return null;
    }

    const sessionId = sessionIdLen > 0 ? data.slice(offset, offset + sessionIdLen).toString('utf-8') : '';
    offset += sessionIdLen;

    // 检查是否有足够的数据读取payloadLen
    if (offset + 4 > data.length) {
      console.log(`⚠️  数据不足以读取payloadLen: offset=${offset}, length=${data.length}`);
      return null;
    }

    const payloadLen = data.readUInt32BE(offset);
    offset += 4;

    let payload = null;
    if (payloadLen > 0) {
      // 检查是否有足够的数据读取payload
      if (offset + payloadLen > data.length) {
        console.log(`⚠️  数据不足以读取payload: offset=${offset}, payloadLen=${payloadLen}, length=${data.length}`);
        return null;
      }

      const payloadBuf = data.slice(offset, offset + payloadLen);
      if (messageType === 0) {
        try {
          payload = JSON.parse(payloadBuf.toString('utf-8'));
        } catch (e) {
          payload = payloadBuf;
        }
      } else {
        payload = payloadBuf;
      }
    }

    return {
      version,
      messageType,
      serialization,
      compression,
      event,
      sessionId,
      payload
    };
  }
}

async function testTTS() {
  console.log('🎤 开始测试TTS V3 Bidirection服务\n');
  console.log('📊 配置信息:');
  console.log(`   App Key: ${CONFIG.appKey}`);
  console.log(`   Access Key: ${CONFIG.accessKey.substring(0, 10)}...`);
  console.log(`   Resource ID: ${CONFIG.resourceId}`);
  console.log(`   端点: ${CONFIG.wsUrl}`);
  console.log(`   测试文本: ${CONFIG.testText}\n`);
  
  const requestId = crypto.randomUUID();
  const sessionId = crypto.randomUUID();
  
  console.log(`🔑 Request ID: ${requestId}`);
  console.log(`🔑 Session ID: ${sessionId}\n`);
  
  const ws = new WebSocket(CONFIG.wsUrl, {
    headers: {
      'X-Api-App-Key': CONFIG.appKey,
      'X-Api-Access-Key': CONFIG.accessKey,
      'X-Api-Resource-Id': CONFIG.resourceId,
      'X-Api-Request-Id': requestId
    }
  });
  
  let audioChunks = [];
  let connectionStarted = false;
  let sessionStarted = false;
  
  ws.on('open', () => {
    console.log('✅ WebSocket连接已建立\n');
    console.log('📤 发送 START_CONNECTION...');
    const startConnFrame = BidirectionProtocol.buildStartConnectionFrame();
    ws.send(startConnFrame);
  });
  
  ws.on('message', (data) => {
    console.log(`\n📦 收到原始数据: ${data.length} 字节`);
    console.log(`   前16字节 (hex): ${data.slice(0, Math.min(16, data.length)).toString('hex')}`);

    const frame = BidirectionProtocol.parseFrame(data);
    if (!frame) {
      console.log('⚠️  无法解析帧');
      console.log(`   完整数据 (hex): ${data.toString('hex')}`);

      // 尝试解析为JSON
      try {
        const json = JSON.parse(data.toString('utf-8'));
        console.log('   可能是JSON响应:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('   不是JSON格式');
      }
      return;
    }
    
    console.log(`📥 收到事件: ${getEventName(frame.event)}`);
    
    switch (frame.event) {
      case Event.CONNECTION_STARTED:
        console.log('✅ 连接已启动\n');
        connectionStarted = true;
        console.log('📤 发送 START_SESSION...');
        const startSessionFrame = BidirectionProtocol.buildStartSessionFrame(sessionId);
        ws.send(startSessionFrame);
        break;
        
      case Event.SESSION_STARTED:
        console.log('✅ 会话已启动\n');
        sessionStarted = true;
        console.log('📤 发送 TASK_REQUEST...');
        const taskFrame = BidirectionProtocol.buildTaskRequestFrame(sessionId, CONFIG.testText);
        ws.send(taskFrame);
        break;
        
      case Event.TTS_RESPONSE:
        if (frame.payload && Buffer.isBuffer(frame.payload)) {
          audioChunks.push(frame.payload);
          console.log(`🎵 收到音频数据: ${frame.payload.length} 字节`);
        }
        break;
        
      case Event.TTS_SENTENCE_END:
        console.log('✅ 句子结束\n');
        console.log('📤 发送 FINISH_SESSION...');
        const finishSessionFrame = BidirectionProtocol.buildFinishSessionFrame(sessionId);
        ws.send(finishSessionFrame);
        break;
        
      case Event.SESSION_FINISHED:
        console.log('✅ 会话已结束\n');
        console.log('📤 发送 FINISH_CONNECTION...');
        const finishConnFrame = BidirectionProtocol.buildFinishConnectionFrame();
        ws.send(finishConnFrame);
        break;
        
      case Event.CONNECTION_FINISHED:
        console.log('✅ 连接已结束\n');
        console.log(`📊 总共收到 ${audioChunks.length} 个音频块`);
        const totalSize = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
        console.log(`📊 总音频大小: ${totalSize} 字节`);
        ws.close();
        break;
        
      case Event.CONNECTION_FAILED:
      case Event.SESSION_FAILED:
        console.log('❌ 失败:', frame.payload);
        ws.close();
        break;
    }
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket错误:', error.message);
  });
  
  ws.on('close', (code, reason) => {
    console.log(`\n🔌 WebSocket连接已关闭`);
    console.log(`   代码: ${code}`);
    console.log(`   原因: ${reason || '无'}`);
    
    if (audioChunks.length > 0) {
      console.log('\n✅ 测试成功！');
    } else {
      console.log('\n❌ 测试失败：未收到音频数据');
    }
  });
}

function getEventName(event) {
  const names = {
    [Event.NONE]: 'NONE',
    [Event.START_CONNECTION]: 'START_CONNECTION',
    [Event.FINISH_CONNECTION]: 'FINISH_CONNECTION',
    [Event.CONNECTION_STARTED]: 'CONNECTION_STARTED',
    [Event.CONNECTION_FAILED]: 'CONNECTION_FAILED',
    [Event.CONNECTION_FINISHED]: 'CONNECTION_FINISHED',
    [Event.START_SESSION]: 'START_SESSION',
    [Event.FINISH_SESSION]: 'FINISH_SESSION',
    [Event.SESSION_STARTED]: 'SESSION_STARTED',
    [Event.SESSION_FINISHED]: 'SESSION_FINISHED',
    [Event.SESSION_FAILED]: 'SESSION_FAILED',
    [Event.TASK_REQUEST]: 'TASK_REQUEST',
    [Event.TTS_SENTENCE_START]: 'TTS_SENTENCE_START',
    [Event.TTS_SENTENCE_END]: 'TTS_SENTENCE_END',
    [Event.TTS_RESPONSE]: 'TTS_RESPONSE'
  };
  return names[event] || `UNKNOWN(${event})`;
}

testTTS();

