/**
 * 火山引擎豆包TTS服务
 * 使用 openspeech.bytedance.com V1 HTTP端点
 */

import https from 'https';
import crypto from 'crypto';

export interface TTSConfig {
  appId: string;
  accessToken: string;
  secretKey?: string;
  userId?: string;
  cluster?: string;
}

export interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
  emotion?: string;
  encoding?: string;
}

export interface TTSResponse {
  audioBuffer: Buffer;
  duration?: number;
  format: string;
}

export class VolcengineTTSService {
  private config: TTSConfig;
  private readonly endpoint = 'openspeech.bytedance.com';
  private readonly path = '/api/v1/tts';

  constructor(config: TTSConfig) {
    this.config = {
      cluster: 'volcano_tts',
      userId: '62170702',
      ...config
    };
  }

  /**
   * 文本转语音
   */
  async textToSpeech(request: TTSRequest): Promise<TTSResponse> {
    const {
      text,
      voice = 'zh_female_cancan_mars_bigtts',
      speed = 1.0,
      emotion = 'natural',
      encoding = 'mp3'
    } = request;

    console.log('🔊 [Volcengine TTS] 开始合成语音');
    console.log(`   文本: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
    console.log(`   音色: ${voice}`);
    console.log(`   语速: ${speed}`);

    const requestBody = JSON.stringify({
      app: {
        appid: this.config.appId,
        token: this.config.accessToken,
        cluster: this.config.cluster
      },
      user: {
        uid: this.config.userId
      },
      audio: {
        voice_type: voice,
        encoding: encoding,
        speed_ratio: speed,
        emotion: emotion
      },
      request: {
        reqid: crypto.randomUUID(),
        text: text,
        operation: 'query'
      }
    });

    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: this.endpoint,
        path: this.path,
        method: 'POST',
        headers: {
          'Authorization': `Bearer; ${this.config.accessToken}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody)
        }
      }, (res) => {
        console.log(`   状态码: ${res.statusCode}`);

        let data: Buffer[] = [];
        res.on('data', chunk => data.push(chunk));
        
        res.on('end', () => {
          const buffer = Buffer.concat(data);

          if (res.statusCode === 200) {
            try {
              // 响应是JSON格式，音频数据在data字段中是base64编码
              const json = JSON.parse(buffer.toString());
              
              if (json.code === 3000 && json.data) {
                const audioBuffer = Buffer.from(json.data, 'base64');
                console.log(`   ✅ 合成成功！音频大小: ${audioBuffer.length} bytes`);
                
                resolve({
                  audioBuffer,
                  format: encoding,
                  duration: this.estimateDuration(text, speed)
                });
              } else {
                console.error('   ❌ TTS响应错误:', json);
                reject(new Error(`TTS合成失败: ${json.message || '未知错误'}`));
              }
            } catch (e) {
              console.error('   ❌ 解析响应失败:', e);
              reject(new Error('TTS响应解析失败'));
            }
          } else {
            const response = buffer.toString();
            console.error(`   ❌ TTS请求失败 (${res.statusCode}):`, response);
            reject(new Error(`TTS请求失败: ${res.statusCode}`));
          }
        });
      });

      req.on('error', (e) => {
        console.error('   ❌ TTS请求错误:', e.message);
        reject(new Error(`TTS请求错误: ${e.message}`));
      });

      req.write(requestBody);
      req.end();
    });
  }

  /**
   * 批量文本转语音
   */
  async batchTextToSpeech(requests: TTSRequest[]): Promise<TTSResponse[]> {
    console.log(`🔊 [Volcengine TTS] 批量合成 ${requests.length} 个音频`);
    
    const results: TTSResponse[] = [];
    
    for (let i = 0; i < requests.length; i++) {
      console.log(`   处理 ${i + 1}/${requests.length}`);
      try {
        const result = await this.textToSpeech(requests[i]);
        results.push(result);
        
        // 避免请求过快
        if (i < requests.length - 1) {
          await this.sleep(100);
        }
      } catch (error) {
        console.error(`   ❌ 第 ${i + 1} 个音频合成失败:`, error);
        throw error;
      }
    }
    
    console.log(`   ✅ 批量合成完成！`);
    return results;
  }

  /**
   * 估算音频时长（秒）
   * 基于文本长度和语速
   */
  private estimateDuration(text: string, speed: number): number {
    // 中文：平均每秒4-5个字
    // 英文：平均每秒150-200个单词
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    
    const chineseDuration = chineseChars / (4.5 * speed);
    const englishDuration = englishWords / (175 * speed / 60);
    
    return Math.ceil(chineseDuration + englishDuration);
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<TTSConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('🔊 [Volcengine TTS] 配置已更新');
  }

  /**
   * 获取当前配置
   */
  getConfig(): TTSConfig {
    return { ...this.config };
  }
}

// 创建默认实例
export const volcengineTTSService = new VolcengineTTSService({
  appId: '7563592522',
  accessToken: 'jq3vA4Ep5EsN-FU4mKizV6ePioXR3Ol3',
  secretKey: 'ngcRw_XOs6h1DH7KTcvifwMA1TybI9Jc',
  userId: '62170702',
  cluster: 'volcano_tts'
});

export default volcengineTTSService;

