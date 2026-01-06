/**
 * 火山引擎长文本语音合成服务（HTTP REST API）
 * 文档：https://www.volcengine.com/docs/6561/1257584
 * 
 * 优势：
 * - 完整音频返回，无需处理流式分块
 * - 音质稳定，无杂音问题
 * - 支持长文本（最长10000字符）
 */

import axios from 'axios';
import * as crypto from 'crypto';

export interface TTSLongTextConfig {
  appKey: string;
  accessToken: string;
  cluster?: string;
}

export interface TTSLongTextRequest {
  text: string;
  speaker?: string;
  encoding?: 'mp3' | 'wav' | 'pcm' | 'opu';
  speed?: number; // 语速 0.5-2.0，默认1.0
  volume?: number; // 音量 0.1-3.0，默认1.0
  pitch?: number; // 音调 0.5-2.0，默认1.0
}

export interface TTSLongTextResponse {
  audioData: Buffer;
  format: string;
  duration?: number;
}

export class VolcengineTTSLongTextService {
  private config: TTSLongTextConfig;
  private endpoint = 'openspeech.bytedance.com';
  private apiVersion = 'v1';

  constructor(config: TTSLongTextConfig) {
    this.config = {
      cluster: 'volcano_tts',
      ...config
    };
  }

  /**
   * 长文本语音合成（使用HTTP REST API）
   */
  async textToSpeech(request: TTSLongTextRequest): Promise<TTSLongTextResponse> {
    const {
      text,
      speaker = 'zh_female_cancan_mars_bigtts',
      encoding = 'mp3',
      speed = 1.0,
      volume = 1.0,
      pitch = 1.0
    } = request;

    console.log(`🔊 [TTS 长文本] 开始合成: ${text.substring(0, 50)}...`);
    console.log(`   音色: ${speaker}`);
    console.log(`   格式: ${encoding}`);
    console.log(`   语速: ${speed}`);

    const requestBody = JSON.stringify({
      app: {
        appid: this.config.appKey,
        token: this.config.accessToken,
        cluster: this.config.cluster
      },
      user: {
        uid: `user_${Date.now()}`
      },
      audio: {
        voice_type: speaker,
        encoding: encoding,
        speed_ratio: speed,
        volume_ratio: volume,
        pitch_ratio: pitch
      },
      request: {
        reqid: crypto.randomUUID(),
        text: text,
        text_type: 'plain',
        operation: 'query'
      }
    });

    try {
      const response = await axios.post(
        `https://${this.endpoint}/api/${this.apiVersion}/tts`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer; ${this.config.accessToken}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
          },
          timeout: 30000,
          validateStatus: () => true // 接受所有状态码，手动处理
        }
      );

      console.log(`📡 [TTS 长文本] HTTP状态: ${response.status}`);

      if (response.status !== 200) {
        console.error(`❌ [TTS 长文本] 请求失败:`, response.data);
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
      }

      if (response.data.code === 3000 && response.data.data) {
        // 解码 base64 音频数据
        const audioBuffer = Buffer.from(response.data.data, 'base64');
        
        console.log(`✅ [TTS 长文本] 合成成功: ${audioBuffer.length} bytes`);
        
        return {
          audioData: audioBuffer,
          format: encoding,
          duration: this.estimateDuration(text, speed)
        };
      } else {
        console.error(`❌ [TTS 长文本] 响应错误:`, response.data);
        throw new Error(`TTS合成失败: ${response.data.message || JSON.stringify(response.data)}`);
      }
    } catch (error: any) {
      if (error.response) {
        console.error(`❌ [TTS 长文本] HTTP错误:`, error.response.status, error.response.data);
      } else {
        console.error(`❌ [TTS 长文本] 请求失败:`, error.message);
      }
      throw new Error(`TTS请求失败: ${error.message}`);
    }
  }

  /**
   * 估算音频时长（秒）
   */
  private estimateDuration(text: string, speed: number): number {
    // 平均每个字0.5秒，根据语速调整
    const baseSeconds = text.length * 0.5;
    return Math.ceil(baseSeconds / speed);
  }
}

// 创建默认实例（需要从环境变量或配置加载）
export const volcengineTTSLongTextService = new VolcengineTTSLongTextService({
  appKey: process.env.VOLCENGINE_TTS_APP_KEY || '',
  accessToken: process.env.VOLCENGINE_TTS_ACCESS_TOKEN || ''
});

