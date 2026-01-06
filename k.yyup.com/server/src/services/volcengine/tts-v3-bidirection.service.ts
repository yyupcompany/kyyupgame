/**
 * 火山引擎TTS V3 双向流式WebSocket服务
 * 官方端点：wss://openspeech.bytedance.com/api/v3/tts/bidirection
 * 认证方式：APP Key + Access Key
 * 支持实时流式传输和在线语音交互
 */

import WebSocket from 'ws';
import * as crypto from 'crypto';

// ==================== 事件类型枚举 ====================
enum Event {
  NONE = 0,
  START_CONNECTION = 1,
  FINISH_CONNECTION = 2,
  CONNECTION_STARTED = 50,
  CONNECTION_FAILED = 51,
  CONNECTION_FINISHED = 52,
  START_SESSION = 100,
  FINISH_SESSION = 102,
  SESSION_STARTED = 150,
  SESSION_FINISHED = 152,
  SESSION_FAILED = 153,
  TASK_REQUEST = 200,
  TTS_SENTENCE_START = 350,
  TTS_SENTENCE_END = 351,
  TTS_RESPONSE = 352
}

// ==================== 接口定义 ====================
export interface TTSV3BidirectionConfig {
  appKey: string;
  accessKey: string;
  resourceId?: string;
  wsUrl?: string;
}

export interface TTSV3BidirectionRequest {
  text: string;
  speaker?: string;
  format?: 'mp3' | 'pcm' | 'wav';
  sampleRate?: number;
  speedRatio?: number;
  volumeRatio?: number;
}

export interface TTSV3BidirectionResponse {
  audioBuffer: Buffer;
  format: string;
  duration?: number;
}

// ==================== 协议帧构建类 ====================
class BidirectionProtocol {
  /**
   * 构建START_CONNECTION帧
   */
  static buildStartConnectionFrame(): Buffer {
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
  static buildStartSessionFrame(sessionId: string, speaker: string, format: string, sampleRate: number, speedRatio: number, volumeRatio: number): Buffer {
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
  static buildTaskRequestFrame(sessionId: string, text: string): Buffer {
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
  static buildFinishSessionFrame(sessionId: string): Buffer {
    const frame = Buffer.alloc(8);
    frame[0] = 0b00010001;
    frame[1] = 0b00010100;
    frame[2] = 0b00010000;
    frame[3] = 0b00000000;
    frame.writeUInt32BE(Event.FINISH_SESSION, 4);
    
    const sessionIdBuf = Buffer.from(sessionId, 'utf-8');
    const sessionIdLen = Buffer.alloc(4);
    sessionIdLen.writeUInt32BE(sessionIdBuf.length, 0);
    
    const payloadBuf = Buffer.from('{}');
    const payloadLen = Buffer.alloc(4);
    payloadLen.writeUInt32BE(payloadBuf.length, 0);
    
    return Buffer.concat([frame, sessionIdLen, sessionIdBuf, payloadLen, payloadBuf]);
  }

  /**
   * 构建FINISH_CONNECTION帧
   */
  static buildFinishConnectionFrame(): Buffer {
    const frame = Buffer.alloc(8);
    frame[0] = 0b00010001;
    frame[1] = 0b00010100;
    frame[2] = 0b00010000;
    frame[3] = 0b00000000;
    frame.writeUInt32BE(Event.FINISH_CONNECTION, 4);
    
    const payloadBuf = Buffer.from('{}');
    const payloadLen = Buffer.alloc(4);
    payloadLen.writeUInt32BE(payloadBuf.length, 0);
    
    return Buffer.concat([frame, payloadLen, payloadBuf]);
  }

  /**
   * 解析响应帧
   */
  static parseFrame(data: Buffer): { event: Event; sessionId?: string; payload: Buffer } {
    if (data.length < 8) {
      throw new Error(`数据太短: ${data.length} bytes`);
    }
    
    const header = data.readUInt8(0);
    const headerSize = (header & 0x0F) * 4;
    const event = data.readUInt32BE(4);
    
    let offset = headerSize;
    
    // 读取session_id（如果有）
    let sessionId: string | undefined;
    const messageType = data.readUInt8(1) >> 4;
    if (messageType === 0b0001 || messageType === 0b1001 || messageType === 0b1011) {
      if (offset + 4 <= data.length) {
        const sessionIdLen = data.readUInt32BE(offset);
        offset += 4;
        if (offset + sessionIdLen <= data.length) {
          sessionId = data.toString('utf-8', offset, offset + sessionIdLen);
          offset += sessionIdLen;
        }
      }
    }
    
    // 读取payload
    let payload = Buffer.alloc(0);
    if (offset + 4 <= data.length) {
      const payloadLen = data.readUInt32BE(offset);
      offset += 4;
      if (offset + payloadLen <= data.length) {
        payload = data.slice(offset, offset + payloadLen);
      }
    }
    
    return { event, sessionId, payload };
  }
}

// ==================== 服务类 ====================
export class VolcengineTTSV3BidirectionService {
  private config: TTSV3BidirectionConfig;
  private readonly defaultWsUrl = 'wss://openspeech.bytedance.com/api/v3/tts/bidirection';
  private readonly defaultResourceId = 'volc.service_type.10029';
  private readonly defaultSpeaker = 'zh_female_cancan_mars_bigtts';

  constructor(config: TTSV3BidirectionConfig) {
    this.config = {
      resourceId: this.defaultResourceId,
      wsUrl: this.defaultWsUrl,
      ...config
    };
  }

  /**
   * 文本转语音
   */
  async textToSpeech(request: TTSV3BidirectionRequest): Promise<TTSV3BidirectionResponse> {
    const {
      text,
      speaker = this.defaultSpeaker,
      format = 'mp3',
      sampleRate = 24000,
      speedRatio = 1.0,
      volumeRatio = 1.0
    } = request;

    return new Promise((resolve, reject) => {
      const sessionId = `session_${Date.now()}`;
      const audioChunks: Buffer[] = [];
      let hasError = false;

      console.log(`🔊 [TTS V3 Bidirection] 开始合成: ${text.substring(0, 50)}...`);

      // 创建WebSocket连接
      const ws = new WebSocket(this.config.wsUrl!, {
        headers: {
          'X-Api-App-Key': this.config.appKey,
          'X-Api-Access-Key': this.config.accessKey,
          'X-Api-Resource-Id': this.config.resourceId!,
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
        console.log(`🔗 [TTS V3 Bidirection] WebSocket连接成功`);
        
        // 步骤1: 发送START_CONNECTION
        const startConnFrame = BidirectionProtocol.buildStartConnectionFrame();
        ws.send(startConnFrame);
      });

      // 接收消息
      ws.on('message', (data: Buffer) => {
        const event = data.readUInt32BE(4);
        console.log(`📨 [TTS V3] 收到事件: ${event}`);

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

          console.log(`🎵 [TTS V3] 收到音频数据: ${audioData.length} bytes, 总计: ${audioChunks.length + 1} 块`);
          audioChunks.push(audioData);
          return;
        }

        // 其他事件使用parseFrame解析
        const frame = BidirectionProtocol.parseFrame(data);
        
        if (frame.event === Event.CONNECTION_STARTED) {
          // 步骤2: 发送START_SESSION
          const startSessFrame = BidirectionProtocol.buildStartSessionFrame(
            sessionId, speaker, format, sampleRate, speedRatio, volumeRatio
          );
          ws.send(startSessFrame);
          
        } else if (frame.event === Event.SESSION_STARTED) {
          // 步骤3: 发送TASK_REQUEST
          const taskFrame = BidirectionProtocol.buildTaskRequestFrame(sessionId, text);
          ws.send(taskFrame);
          
        } else if (frame.event === Event.TTS_SENTENCE_END) {
          // 步骤4: 发送FINISH_SESSION
          const finishSessFrame = BidirectionProtocol.buildFinishSessionFrame(sessionId);
          ws.send(finishSessFrame);
          
        } else if (frame.event === Event.SESSION_FINISHED) {
          // 步骤5: 发送FINISH_CONNECTION
          const finishConnFrame = BidirectionProtocol.buildFinishConnectionFrame();
          ws.send(finishConnFrame);
          
        } else if (frame.event === Event.CONNECTION_FINISHED) {
          // 完成
          clearTimeout(timeout);
          ws.close();
          
        } else if (frame.event === Event.SESSION_FAILED || frame.event === Event.CONNECTION_FAILED) {
          hasError = true;
          clearTimeout(timeout);
          ws.close();
          reject(new Error(`TTS失败: ${frame.payload.toString()}`));
        }
      });

      // 连接关闭
      ws.on('close', () => {
        clearTimeout(timeout);
        console.log(`🔌 [TTS V3 Bidirection] WebSocket连接关闭, audioChunks数量: ${audioChunks.length}`);

        if (!hasError) {
          if (audioChunks.length > 0) {
            const audioBuffer = Buffer.concat(audioChunks);
            console.log(`✅ [TTS V3 Bidirection] 合成成功: ${audioBuffer.length} bytes (来自 ${audioChunks.length} 块)`);
            resolve({
              audioBuffer,
              format: format
            });
          } else {
            console.error(`❌ [TTS V3 Bidirection] 未收到音频数据`);
            reject(new Error('未收到音频数据'));
          }
        }
      });

      // 错误处理
      ws.on('error', (error: any) => {
        hasError = true;
        clearTimeout(timeout);
        console.error(`❌ [TTS V3 Bidirection] WebSocket错误:`, error.message);
        reject(new Error(`WebSocket错误: ${error.message}`));
      });
    });
  }

  /**
   * 批量文本转语音
   */
  async batchTextToSpeech(texts: string[], options?: Partial<TTSV3BidirectionRequest>): Promise<TTSV3BidirectionResponse[]> {
    console.log(`🔊 [TTS V3 Bidirection] 批量合成: ${texts.length} 条文本`);
    
    const results: TTSV3BidirectionResponse[] = [];
    
    for (let i = 0; i < texts.length; i++) {
      console.log(`📝 [TTS V3 Bidirection] 处理 ${i + 1}/${texts.length}`);
      
      try {
        const result = await this.textToSpeech({
          text: texts[i],
          ...options
        });
        results.push(result);
      } catch (error: any) {
        console.error(`❌ [TTS V3 Bidirection] 第 ${i + 1} 条失败:`, error.message);
        throw error;
      }
    }
    
    console.log(`✅ [TTS V3 Bidirection] 批量合成完成: ${results.length} 条`);
    return results;
  }
}

// 创建默认实例
export const volcengineTTSV3BidirectionService = new VolcengineTTSV3BidirectionService({
  appKey: '7563592522',
  accessKey: 'jq3vA4Ep5EsN-FU4mKizV6ePioXR3Ol3',
  resourceId: 'volc.service_type.10029',
  wsUrl: 'wss://openspeech.bytedance.com/api/v3/tts/bidirection'
});

// 导出别名
export const ttsV3BidirectionService = volcengineTTSV3BidirectionService;

export default volcengineTTSV3BidirectionService;

