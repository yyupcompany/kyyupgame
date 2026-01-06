/**
 * 火山引擎豆包TTS V3 WebSocket实现
 * 基于官方文档: https://www.volcengine.com/docs/6561/1719100
 */

import WebSocket from 'ws';
import crypto from 'crypto';

export interface TTSV3Config {
  appId: string;
  accessToken: string;
  resourceId?: string;
}

export interface TTSV3Request {
  text: string;
  speaker?: string;
  format?: 'mp3' | 'pcm' | 'ogg_opus';
  sampleRate?: number;
  speed?: number;
  volume?: number;
  emotion?: string;
}

export interface TTSV3Response {
  audioBuffer: Buffer;
  format: string;
  duration?: number;
}

/**
 * 二进制协议工具类
 */
class BinaryProtocol {
  /**
   * 构建请求帧
   * @param payload JSON payload
   * @param eventNumber 事件编号 (可选)
   */
  static buildRequestFrame(payload: any, eventNumber?: number): Buffer {
    const payloadJson = JSON.stringify(payload);
    const payloadBuffer = Buffer.from(payloadJson, 'utf-8');
    const payloadSize = payloadBuffer.length;

    // 构建header (4字节)
    const header = Buffer.alloc(4);
    header[0] = 0x11; // Protocol version (0001) + Header size (0001)
    header[1] = eventNumber !== undefined ? 0x14 : 0x10; // Message type (0001) + flags
    header[2] = 0x10; // Serialization (0001 JSON) + Compression (0000 none)
    header[3] = 0x00; // Reserved

    // 构建payload size (4字节，大端)
    const sizeBuffer = Buffer.alloc(4);
    sizeBuffer.writeUInt32BE(payloadSize, 0);

    if (eventNumber !== undefined) {
      // 有event number，需要8字节header
      const extendedHeader = Buffer.alloc(8);
      header.copy(extendedHeader, 0);
      extendedHeader.writeUInt32BE(eventNumber, 4);

      // 组合: header + size + payload
      return Buffer.concat([extendedHeader, sizeBuffer, payloadBuffer]);
    } else {
      // 无event number，4字节header
      // 组合: header + size + payload
      return Buffer.concat([header, sizeBuffer, payloadBuffer]);
    }
  }
  
  /**
   * 解析响应帧
   */
  static parseResponseFrame(data: Buffer): {
    messageType: number;
    serializationMethod: number;
    payload: any;
  } {
    if (data.length < 4) {
      throw new Error('Invalid frame: too short');
    }
    
    const protocolVersion = (data[0] >> 4) & 0x0F;
    const headerSize = (data[0] & 0x0F) * 4;
    const messageType = (data[1] >> 4) & 0x0F;
    const messageFlags = data[1] & 0x0F;
    const serializationMethod = (data[2] >> 4) & 0x0F;
    const compressionMethod = data[2] & 0x0F;
    
    // 提取payload
    const payloadStart = headerSize;
    const payloadBuffer = data.slice(payloadStart);
    
    let payload: any;
    if (serializationMethod === 1) {
      // JSON
      payload = JSON.parse(payloadBuffer.toString('utf-8'));
    } else if (serializationMethod === 0) {
      // Raw binary (audio data)
      payload = payloadBuffer;
    }
    
    return {
      messageType,
      serializationMethod,
      payload
    };
  }
}

/**
 * 火山引擎TTS V3 WebSocket服务
 */
export class VolcengineTTSV3Official {
  private config: TTSV3Config;
  private readonly wsUrl = 'wss://openspeech.bytedance.com/api/v3/tts/unidirectional/stream';
  
  constructor(config: TTSV3Config) {
    this.config = {
      resourceId: 'seed-tts-1.0', // 默认使用1.0模型 (2.0需要额外权限)
      ...config
    };
  }
  
  /**
   * 文本转语音
   */
  async textToSpeech(request: TTSV3Request): Promise<TTSV3Response> {
    const {
      text,
      speaker = 'zh_female_cancan_mars_bigtts',
      format = 'mp3',
      sampleRate = 24000,
      speed = 1.0,
      volume = 1.0,
      emotion
    } = request;
    
    console.log('🔊 [TTS V3 Official] 开始合成');
    console.log(`   文本: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
    console.log(`   音色: ${speaker}`);
    console.log(`   资源ID: ${this.config.resourceId}`);
    
    return new Promise((resolve, reject) => {
      const audioChunks: Buffer[] = [];
      let hasError = false;
      
      // 创建WebSocket连接，使用Headers认证
      const ws = new WebSocket(this.wsUrl, {
        headers: {
          'X-Api-App-Id': this.config.appId,
          'X-Api-Access-Key': this.config.accessToken,
          'X-Api-Resource-Id': this.config.resourceId!,
          'X-Api-Request-Id': crypto.randomUUID()
        }
      });
      
      // 设置超时
      const timeout = setTimeout(() => {
        if (!hasError) {
          hasError = true;
          ws.close();
          reject(new Error('WebSocket连接超时'));
        }
      }, 30000);
      
      ws.on('open', () => {
        console.log('   ✅ WebSocket连接成功');
        
        // 构建请求payload
        const payload = {
          namespace: 'BidirectionalTTS',
          event: 'ClientRequest',
          user: {
            uid: 'user_' + Date.now()
          },
          req_params: {
            text: text,
            speaker: speaker,
            audio_params: {
              format: format,
              sample_rate: sampleRate,
              speed_ratio: speed,
              volume_ratio: volume
            }
          }
        };
        
        // 添加情感参数
        if (emotion) {
          payload.req_params.audio_params['emotion'] = emotion;
        }
        
        console.log('   📤 发送TTS请求...');
        
        // 使用二进制协议发送
        const requestFrame = BinaryProtocol.buildRequestFrame(payload);
        ws.send(requestFrame);
      });
      
      ws.on('message', (data: Buffer) => {
        try {
          // 检查是否是二进制协议帧
          if (data.length >= 4) {
            const frame = BinaryProtocol.parseResponseFrame(data);

            if (frame.serializationMethod === 1) {
              // JSON控制消息
              const message = frame.payload;
              console.log('   📦 收到控制消息:', JSON.stringify(message).substring(0, 100));

              if (message.status_code === 20000000) {
                // 成功完成
                console.log('   ✅ 音频接收完成');
                clearTimeout(timeout);
                ws.close();

                const audioBuffer = Buffer.concat(audioChunks);
                console.log(`   📊 总音频大小: ${audioBuffer.length} bytes`);

                resolve({
                  audioBuffer,
                  format: format
                });
              } else if (message.status_code && message.status_code !== 20000000) {
                // 错误
                console.error('   ❌ TTS错误:', message);
                hasError = true;
                clearTimeout(timeout);
                ws.close();
                reject(new Error(`TTS合成失败: ${message.message || '未知错误'} (code: ${message.status_code})`));
              }
            } else if (frame.serializationMethod === 0) {
              // 二进制音频数据
              audioChunks.push(frame.payload);
              console.log(`   📦 收到音频数据: ${frame.payload.length} bytes`);
            }
          } else {
            // 直接是音频数据（没有协议头）
            audioChunks.push(data);
            console.log(`   📦 收到原始音频数据: ${data.length} bytes`);
          }
        } catch (e: any) {
          // 解析失败，可能是纯音频数据
          console.log(`   📦 收到数据 (解析失败，作为音频): ${data.length} bytes`);
          audioChunks.push(data);
        }
      });
      
      ws.on('close', () => {
        console.log('   🔌 WebSocket连接关闭');
        clearTimeout(timeout);
        
        if (!hasError && audioChunks.length > 0) {
          const audioBuffer = Buffer.concat(audioChunks);
          resolve({
            audioBuffer,
            format: format
          });
        } else if (!hasError) {
          reject(new Error('未收到音频数据'));
        }
      });
      
      ws.on('error', (error) => {
        console.error('   ❌ WebSocket错误:', error.message);
        hasError = true;
        clearTimeout(timeout);
        reject(new Error(`WebSocket错误: ${error.message}`));
      });
    });
  }
  
  /**
   * 批量文本转语音
   */
  async batchTextToSpeech(requests: TTSV3Request[]): Promise<TTSV3Response[]> {
    console.log(`🔊 [TTS V3 Official] 批量合成 ${requests.length} 个音频`);
    
    const results: TTSV3Response[] = [];
    
    for (let i = 0; i < requests.length; i++) {
      console.log(`\n   处理 ${i + 1}/${requests.length}`);
      try {
        const result = await this.textToSpeech(requests[i]);
        results.push(result);
        
        // 避免请求过快
        if (i < requests.length - 1) {
          await this.sleep(200);
        }
      } catch (error) {
        console.error(`   ❌ 第 ${i + 1} 个音频合成失败:`, error);
        throw error;
      }
    }
    
    console.log(`\n   ✅ 批量合成完成！`);
    return results;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 创建默认实例
export const volcengineTTSV3Official = new VolcengineTTSV3Official({
  appId: '7563592522',
  accessToken: 'jq3vA4Ep5EsN-FU4mKizV6ePioXR3Ol3',
  resourceId: 'seed-tts-1.0' // 使用1.0模型 (2.0需要额外权限)
});

export default volcengineTTSV3Official;

