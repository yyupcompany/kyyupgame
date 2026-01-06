/**
 * 完整测试：火山引擎TTS V3双向流式服务
 * 参考：server/src/services/volcengine/tts-v3-bidirection.service.ts
 */

const WebSocket = require('ws');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 从数据库获取的配置
const CONFIG = {
  appKey: '3251d95f-1039-4daa-9afa-eb3bfe345552',
  accessKey: '3251d95f-1039-4daa-9afa-eb3bfe345552',
  resourceId: 'volc.service_type.10029',
  wsUrl: 'wss://openspeech.bytedance.com/api/v3/tts/bidirection',
  
  // 测试文本
  testText: '你好，欢迎咨询我们幼儿园。我们提供优质的教育服务。'
};

// 事件类型枚举
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

// 协议帧构建类
class BidirectionProtocol {
  /**
   * 构建START_CONNECTION帧
   */
  static buildStartConnectionFrame() {
    const frame = Buffer.alloc(8);
    frame[0] = 0b00010001; // header: version=1, header_size=1*4=4
    frame[1] = 0b00010100; // message_type=1(full), flags=4(has event)
    frame[2] = 0b00010000; // serialization=1(JSON), compression=0
    frame[3] = 0b00000000; // reserved
    frame.writeUInt32BE(Event.START_CONNECTION, 4);
    
    const payload = Buffer.from('{}');
    const payloadSize = Buffer.alloc(4);
    payloadSize.writeUInt32BE(payload.length, 0);
    
    return Buffer.concat([frame, payloadSize, payload]);
  }

  /**
   * 构建START_SESSION帧
   */
  static buildStartSessionFrame(sessionId, speaker, format, sampleRate, speedRatio, volumeRatio) {
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

  /**
   * 构建TASK_REQUEST帧
   */
  static buildTaskRequestFrame(sessionId, text) {
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

  /**
   * 构建FINISH_SESSION帧
   */
  static buildFinishSessionFrame(sessionId) {
    const frame = Buffer.alloc(8);
    frame[0] = 0b00010001;
    frame[1] = 0b00010100;
    frame[2] = 0b00010000;
    frame[3] = 0b00000000;
    frame.writeUInt32BE(Event.FINISH_SESSION, 4);
    
    const sessionIdBuf = Buffer.from(sessionId, 'utf-8');
    const sessionIdLen = Buffer.alloc(4);
    sessionIdLen.writeUInt32BE(sessionIdBuf.length, 0);
    
    const payload = Buffer.from('{}');
    const payloadLen = Buffer.alloc(4);
    payloadLen.writeUInt32BE(payload.length, 0);
    
    return Buffer.concat([frame, sessionIdLen, sessionIdBuf, payloadLen, payload]);
  }

  /**
   * 构建FINISH_CONNECTION帧
   */
  static buildFinishConnectionFrame() {
    const frame = Buffer.alloc(8);
    frame[0] = 0b00010001;
    frame[1] = 0b00010100;
    frame[2] = 0b00010000;
    frame[3] = 0b00000000;
    frame.writeUInt32BE(Event.FINISH_CONNECTION, 4);
    
    const payload = Buffer.from('{}');
    const payloadSize = Buffer.alloc(4);
    payloadSize.writeUInt32BE(payload.length, 0);
    
    return Buffer.concat([frame, payloadSize, payload]);
  }
}

// 测试类
class TTSV3Test {
  async runTest() {
    console.log('🚀 开始测试火山引擎TTS V3双向流式服务\n');
    console.log('📋 配置信息:');
    console.log(`   App Key: ${CONFIG.appKey.substring(0, 20)}...`);
    console.log(`   Access Key: ${CONFIG.accessKey.substring(0, 20)}...`);
    console.log(`   Resource ID: ${CONFIG.resourceId}`);
    console.log(`   WebSocket URL: ${CONFIG.wsUrl}`);
    console.log(`   测试文本: "${CONFIG.testText}"`);
    console.log('');

    const startTime = Date.now();

    try {
      const result = await this.textToSpeech({
        text: CONFIG.testText,
        speaker: 'zh_female_cancan_mars_bigtts',
        format: 'mp3',
        sampleRate: 24000,
        speedRatio: 1.0,
        volumeRatio: 1.0
      });

      const elapsed = Date.now() - startTime;

      console.log('\n' + '='.repeat(80));
      console.log('📊 测试结果');
      console.log('='.repeat(80));
      console.log(`\n✅ TTS合成成功！`);
      console.log(`   音频大小: ${result.audioBuffer.length} 字节`);
      console.log(`   音频格式: ${result.format}`);
      console.log(`   耗时: ${elapsed}ms`);
      console.log(`   保存路径: ${result.audioPath}`);
      console.log('\n' + '='.repeat(80));
      console.log('🎉 测试完成！TTS V3双向流式服务工作正常！');
      console.log('='.repeat(80));

    } catch (error) {
      console.error('\n❌ 测试失败:', error.message);
      console.error('详细错误:', error);
    }
  }

  /**
   * 文本转语音
   */
  textToSpeech(request) {
    const {
      text,
      speaker = 'zh_female_cancan_mars_bigtts',
      format = 'mp3',
      sampleRate = 24000,
      speedRatio = 1.0,
      volumeRatio = 1.0
    } = request;

    return new Promise((resolve, reject) => {
      const sessionId = `session_${Date.now()}`;
      const audioChunks = [];
      let hasError = false;

      console.log(`🔊 开始合成: ${text.substring(0, 50)}...`);

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
        console.log(`🔗 WebSocket连接成功`);
        
        // 步骤1: 发送START_CONNECTION
        console.log('📤 发送 START_CONNECTION');
        const startConnFrame = BidirectionProtocol.buildStartConnectionFrame();
        ws.send(startConnFrame);
      });

      // 接收消息
      ws.on('message', (data) => {
        const event = data.readUInt32BE(4);
        const eventName = Object.keys(Event).find(key => Event[key] === event) || `Unknown(${event})`;
        
        console.log(`📨 收到事件: ${eventName}`);
        
        if (event === Event.TTS_RESPONSE) {
          // TTS_RESPONSE是音频数据，直接提取
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
          
          audioChunks.push(audioData);
          console.log(`   🎵 收到音频数据: ${audioData.length} 字节`);
          return;
        }
        
        if (event === Event.CONNECTION_STARTED) {
          // 步骤2: 发送START_SESSION
          console.log('📤 发送 START_SESSION');
          const startSessFrame = BidirectionProtocol.buildStartSessionFrame(
            sessionId, speaker, format, sampleRate, speedRatio, volumeRatio
          );
          ws.send(startSessFrame);
          
        } else if (event === Event.SESSION_STARTED) {
          // 步骤3: 发送TASK_REQUEST
          console.log('📤 发送 TASK_REQUEST');
          const taskFrame = BidirectionProtocol.buildTaskRequestFrame(sessionId, text);
          ws.send(taskFrame);
          
        } else if (event === Event.TTS_SENTENCE_END) {
          // 步骤4: 发送FINISH_SESSION
          console.log('📤 发送 FINISH_SESSION');
          const finishSessFrame = BidirectionProtocol.buildFinishSessionFrame(sessionId);
          ws.send(finishSessFrame);
          
        } else if (event === Event.SESSION_FINISHED) {
          // 步骤5: 发送FINISH_CONNECTION
          console.log('📤 发送 FINISH_CONNECTION');
          const finishConnFrame = BidirectionProtocol.buildFinishConnectionFrame();
          ws.send(finishConnFrame);
          
        } else if (event === Event.CONNECTION_FINISHED) {
          // 完成
          console.log('✅ 连接完成');
          clearTimeout(timeout);
          ws.close();
          
        } else if (event === Event.SESSION_FAILED || event === Event.CONNECTION_FAILED) {
          hasError = true;
          clearTimeout(timeout);
          ws.close();
          reject(new Error(`TTS失败: ${data.toString()}`));
        }
      });

      // 连接关闭
      ws.on('close', () => {
        clearTimeout(timeout);
        console.log(`🔌 WebSocket连接关闭`);

        if (!hasError) {
          if (audioChunks.length > 0) {
            const audioBuffer = Buffer.concat(audioChunks);
            console.log(`✅ 合成成功: ${audioBuffer.length} bytes`);
            
            // 保存音频文件
            const audioPath = path.join(__dirname, `test-tts-v3-output-${Date.now()}.mp3`);
            fs.writeFileSync(audioPath, audioBuffer);
            
            resolve({
              audioBuffer,
              format: format,
              audioPath: audioPath
            });
          } else {
            reject(new Error('未收到音频数据'));
          }
        }
      });

      // 错误处理
      ws.on('error', (error) => {
        hasError = true;
        clearTimeout(timeout);
        console.error(`❌ WebSocket错误:`, error.message);
        reject(new Error(`WebSocket错误: ${error.message}`));
      });
    });
  }
}

// 运行测试
async function main() {
  const test = new TTSV3Test();
  await test.runTest();
}

main().catch(error => {
  console.error('测试异常:', error);
  process.exit(1);
});

