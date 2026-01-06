/**
 * 豆包端到端实时语音大模型测试脚本
 * 
 * 测试目标：
 * 1. 建立WebSocket连接
 * 2. 创建会话
 * 3. 发送测试音频
 * 4. 接收AI响应
 * 
 * API文档: https://www.volcengine.com/docs/6561/1594356
 */

const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// 配置信息
const CONFIG = {
  appId: '7563592522',
  apiKey: 'e1545f0e-1d6f-4e70-aab3-3c5fdbec0700',
  wsUrl: 'wss://openspeech.bytedance.com/api/v3/realtime/dialogue',
  
  // 会话配置
  session: {
    model: 'doubao-realtime-voice-v1',
    language: 'zh',
    voice: 'zh_female_cancan_mars_bigtts',
    instructions: '你是一位专业的幼儿园招生顾问，负责通过电话与家长沟通。请保持友好、专业的态度。',
    turn_detection: {
      type: 'server_vad',
      threshold: 0.5,
      prefix_padding_ms: 300,
      silence_duration_ms: 500
    }
  }
};

class DoubaoRealtimeVoiceTest {
  constructor() {
    this.ws = null;
    this.sessionId = null;
    this.audioResponses = [];
    this.textResponses = [];
  }

  /**
   * 启动测试
   */
  async start() {
    console.log('🚀 开始测试豆包端到端实时语音大模型\n');
    console.log('📋 配置信息:');
    console.log(`   App ID: ${CONFIG.appId}`);
    console.log(`   API Key: ${CONFIG.apiKey.substring(0, 20)}...`);
    console.log(`   WebSocket URL: ${CONFIG.wsUrl}`);
    console.log('');

    try {
      // 1. 建立WebSocket连接
      await this.connect();

      // 2. 等待会话创建
      await this.waitForSession();

      // 3. 发送测试文本（模拟用户说话）
      await this.sendTestMessage();

      // 4. 等待响应
      await this.waitForResponse();

      // 5. 显示结果
      this.showResults();

    } catch (error) {
      console.error('❌ 测试失败:', error.message);
      console.error('详细错误:', error);
    } finally {
      this.cleanup();
    }
  }

  /**
   * 建立WebSocket连接
   */
  connect() {
    return new Promise((resolve, reject) => {
      console.log('🔌 正在连接WebSocket...');

      // 参考TTS配置，使用正确的格式
      this.ws = new WebSocket(CONFIG.wsUrl, {
        headers: {
          'X-Api-App-Key': CONFIG.apiKey,
          'X-Api-Resource-Id': 'volc.speech.dialog'
        }
      });

      console.log('请求头:');
      console.log(`  X-Api-App-Key: ${CONFIG.apiKey.substring(0, 20)}...`);
      console.log(`  X-Api-Resource-Id: volc.speech.dialog`);

      this.ws.on('open', () => {
        console.log('✅ WebSocket连接成功\n');
        
        // 发送会话创建请求
        console.log('📤 发送会话创建请求...');
        const sessionUpdate = {
          type: 'session.update',
          session: CONFIG.session
        };
        
        console.log('会话配置:', JSON.stringify(sessionUpdate, null, 2));
        this.ws.send(JSON.stringify(sessionUpdate));
        
        resolve();
      });

      this.ws.on('message', (data) => {
        this.handleMessage(data);
      });

      this.ws.on('error', (error) => {
        console.error('❌ WebSocket错误:', error.message);
        reject(error);
      });

      this.ws.on('close', (code, reason) => {
        console.log(`🔌 WebSocket连接关闭 (代码: ${code}, 原因: ${reason || '无'})`);
      });

      // 超时处理
      setTimeout(() => {
        if (!this.sessionId) {
          reject(new Error('连接超时'));
        }
      }, 10000);
    });
  }

  /**
   * 处理服务器消息
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data.toString());
      
      console.log(`📨 收到消息: ${message.type}`);
      
      switch (message.type) {
        case 'session.created':
          console.log('✅ 会话创建成功!');
          console.log(`   Session ID: ${message.session.id}`);
          console.log(`   Model: ${message.session.model}`);
          this.sessionId = message.session.id;
          break;

        case 'session.updated':
          console.log('✅ 会话配置已更新');
          break;

        case 'response.audio.delta':
          // 接收音频增量
          this.audioResponses.push(message.delta);
          process.stdout.write('🔊');
          break;

        case 'response.audio.done':
          console.log('\n✅ 音频响应完成');
          console.log(`   接收到 ${this.audioResponses.length} 个音频片段`);
          break;

        case 'response.text.delta':
          // 接收文本增量
          this.textResponses.push(message.delta);
          process.stdout.write(message.delta);
          break;

        case 'response.text.done':
          console.log('\n✅ 文本响应完成');
          break;

        case 'response.done':
          console.log('✅ 完整响应已接收');
          break;

        case 'error':
          console.error('❌ 服务器错误:', message.error);
          break;

        case 'input_audio_buffer.committed':
          console.log('✅ 音频缓冲区已提交');
          break;

        case 'input_audio_buffer.speech_started':
          console.log('🎤 检测到语音开始');
          break;

        case 'input_audio_buffer.speech_stopped':
          console.log('🎤 检测到语音结束');
          break;

        case 'conversation.item.created':
          console.log('✅ 对话项已创建');
          break;

        default:
          console.log(`   数据:`, JSON.stringify(message, null, 2));
      }
    } catch (error) {
      console.error('❌ 解析消息失败:', error.message);
      console.log('原始数据:', data.toString());
    }
  }

  /**
   * 等待会话创建
   */
  waitForSession() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (this.sessionId) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        if (!this.sessionId) {
          reject(new Error('会话创建超时'));
        }
      }, 5000);
    });
  }

  /**
   * 发送测试消息
   */
  async sendTestMessage() {
    console.log('\n📤 发送测试消息...');
    
    // 方案1: 发送文本消息（如果API支持）
    const textMessage = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: '你好，我想了解一下你们幼儿园的情况。'
          }
        ]
      }
    };

    console.log('发送内容:', JSON.stringify(textMessage, null, 2));
    this.ws.send(JSON.stringify(textMessage));

    // 触发响应生成
    await this.sleep(500);
    const responseCreate = {
      type: 'response.create'
    };
    
    console.log('📤 触发响应生成...');
    this.ws.send(JSON.stringify(responseCreate));
  }

  /**
   * 等待响应
   */
  waitForResponse() {
    return new Promise((resolve) => {
      console.log('\n⏳ 等待AI响应...\n');
      
      // 等待10秒接收响应
      setTimeout(() => {
        resolve();
      }, 10000);
    });
  }

  /**
   * 显示测试结果
   */
  showResults() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 测试结果总结');
    console.log('='.repeat(80));
    
    console.log(`\n✅ Session ID: ${this.sessionId || '未创建'}`);
    console.log(`✅ 音频片段数: ${this.audioResponses.length}`);
    console.log(`✅ 文本响应: ${this.textResponses.join('')}`);
    
    if (this.audioResponses.length > 0) {
      const totalAudioSize = this.audioResponses.reduce((sum, chunk) => {
        return sum + Buffer.from(chunk, 'base64').length;
      }, 0);
      console.log(`✅ 音频总大小: ${totalAudioSize} 字节`);
    }

    console.log('\n' + '='.repeat(80));
    
    if (this.sessionId && (this.audioResponses.length > 0 || this.textResponses.length > 0)) {
      console.log('🎉 测试成功！豆包实时语音API工作正常！');
    } else {
      console.log('⚠️  测试部分成功，但未收到完整响应');
    }
    
    console.log('='.repeat(80) + '\n');
  }

  /**
   * 清理资源
   */
  cleanup() {
    if (this.ws) {
      console.log('🧹 清理资源...');
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * 延迟函数
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 运行测试
const test = new DoubaoRealtimeVoiceTest();
test.start().catch(error => {
  console.error('测试异常:', error);
  process.exit(1);
});

