/**
 * 火山引擎豆包TTS WebSocket Binary实现
 * 基于官方binary.ts示例
 */

import WebSocket from 'ws';
import crypto from 'crypto';
import fs from 'fs';

export interface TTSWebSocketConfig {
  appId: string;
  accessToken: string;
  voiceType?: string;
  cluster?: string;
  uid?: string;
}

export interface TTSWebSocketRequest {
  text: string;
  voiceType?: string;
  speed?: number;
  volume?: number;
  pitch?: number;
}

export class VolcengineTTSWebSocketBinary {
  private config: TTSWebSocketConfig;
  private readonly wsUrl = 'wss://openspeech.bytedance.com/api/v1/tts/ws_binary';

  constructor(config: TTSWebSocketConfig) {
    this.config = {
      voiceType: 'zh_female_cancan_mars_bigtts',
      cluster: 'volcano_tts',
      uid: 'user_' + Date.now(),
      ...config
    };
  }

  /**
   * 文本转语音 - WebSocket Binary模式
   */
  async textToSpeech(request: TTSWebSocketRequest): Promise<Buffer> {
    const {
      text,
      voiceType = this.config.voiceType,
      speed = 1.0,
      volume = 1.0,
      pitch = 1.0
    } = request;

    console.log('🔊 [TTS WebSocket Binary] 开始合成');
    console.log(`   文本: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
    console.log(`   音色: ${voiceType}`);

    return new Promise((resolve, reject) => {
      const audioChunks: Buffer[] = [];
      let hasError = false;

      // 构建WebSocket URL
      const url = `${this.wsUrl}?appid=${this.config.appId}&token=${this.config.accessToken}&uid=${this.config.uid}&cluster=${this.config.cluster}`;

      console.log('   🔗 连接WebSocket...');
      const ws = new WebSocket(url);

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

        // 构建请求消息
        const requestMessage = {
          app: {
            appid: this.config.appId,
            token: this.config.accessToken,
            cluster: this.config.cluster
          },
          user: {
            uid: this.config.uid
          },
          audio: {
            voice_type: voiceType,
            encoding: 'mp3',
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
        };

        console.log('   📤 发送TTS请求...');
        ws.send(JSON.stringify(requestMessage));
      });

      ws.on('message', (data: Buffer) => {
        try {
          // 尝试解析为JSON（控制消息）
          const message = JSON.parse(data.toString());
          
          if (message.code !== undefined) {
            if (message.code === 3000) {
              // 成功消息
              if (message.data) {
                // Base64编码的音频数据
                const audioData = Buffer.from(message.data, 'base64');
                audioChunks.push(audioData);
                console.log(`   📦 收到音频数据: ${audioData.length} bytes`);
              }

              // 检查是否完成
              if (message.sequence === -1) {
                console.log('   ✅ 音频接收完成');
                clearTimeout(timeout);
                ws.close();

                const audioBuffer = Buffer.concat(audioChunks);
                console.log(`   📊 总音频大小: ${audioBuffer.length} bytes`);
                resolve(audioBuffer);
              }
            } else {
              // 错误消息
              console.error('   ❌ TTS错误:', message);
              hasError = true;
              clearTimeout(timeout);
              ws.close();
              reject(new Error(`TTS合成失败: ${message.message || '未知错误'}`));
            }
          }
        } catch (e) {
          // 不是JSON，可能是二进制音频数据
          audioChunks.push(data);
          console.log(`   📦 收到二进制数据: ${data.length} bytes`);
        }
      });

      ws.on('close', () => {
        console.log('   🔌 WebSocket连接关闭');
        clearTimeout(timeout);

        if (!hasError && audioChunks.length > 0) {
          const audioBuffer = Buffer.concat(audioChunks);
          resolve(audioBuffer);
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
  async batchTextToSpeech(requests: TTSWebSocketRequest[]): Promise<Buffer[]> {
    console.log(`🔊 [TTS WebSocket Binary] 批量合成 ${requests.length} 个音频`);
    
    const results: Buffer[] = [];
    
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

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<TTSWebSocketConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('🔊 [TTS WebSocket Binary] 配置已更新');
  }
}

// 创建默认实例
export const volcengineTTSWebSocketBinary = new VolcengineTTSWebSocketBinary({
  appId: '7563592522',
  accessToken: 'jq3vA4Ep5EsN-FU4mKizV6ePioXR3Ol3',
  voiceType: 'zh_female_cancan_mars_bigtts',
  cluster: 'volcano_tts'
});

// CLI支持
if (require.main === module) {
  const args = process.argv.slice(2);
  const config: any = {};
  const request: any = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    
    if (key === 'appid') config.appId = value;
    else if (key === 'access_token') config.accessToken = value;
    else if (key === 'voice_type') request.voiceType = value;
    else if (key === 'text') request.text = value;
    else if (key === 'output') request.output = value;
  }

  if (!config.appId || !config.accessToken || !request.text) {
    console.error('用法: npx ts-node src/volcengine/tts-websocket-binary.ts --appid <APP_ID> --access_token <ACCESS_TOKEN> --voice_type <VOICE_TYPE> --text "文本内容" [--output output.mp3]');
    process.exit(1);
  }

  const tts = new VolcengineTTSWebSocketBinary(config);
  
  tts.textToSpeech(request)
    .then((audioBuffer) => {
      const outputPath = request.output || 'output.mp3';
      fs.writeFileSync(outputPath, audioBuffer);
      console.log(`\n✅ 音频已保存到: ${outputPath}`);
      console.log(`   大小: ${audioBuffer.length} bytes`);
    })
    .catch((error) => {
      console.error('\n❌ 合成失败:', error.message);
      process.exit(1);
    });
}

export default volcengineTTSWebSocketBinary;

