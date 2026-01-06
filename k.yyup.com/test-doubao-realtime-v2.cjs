/**
 * 豆包实时语音大模型测试脚本 V2
 * 基于示例代码实现
 */

const WebSocket = require('ws');

// 配置信息
const CONFIG = {
  appId: '7563592522',
  apiKey: 'e1545f0e-1d6f-4e70-aab3-3c5fdbec0700',
  
  // 尝试多个可能的WebSocket端点
  wsUrls: [
    'wss://api.doubao.com/realtime-voice/v1/stream',
    'wss://openspeech.bytedance.com/api/v3/realtime/dialogue',
    'wss://ark.cn-beijing.volces.com/api/v3/realtime/dialogue'
  ],
  
  // 语音参数配置
  voiceConfig: {
    sampleRate: 16000,
    format: 'pcm',
    language: 'zh-CN',
    enableVad: true,
    model: 'general'
  }
};

class DoubaoRealtimeVoiceTest {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.currentUrlIndex = 0;
    this.receivedMessages = [];
  }

  /**
   * 测试所有可能的端点
   */
  async testAllEndpoints() {
    console.log('🚀 开始测试豆包实时语音大模型\n');
    console.log('📋 配置信息:');
    console.log(`   App ID: ${CONFIG.appId}`);
    console.log(`   API Key: ${CONFIG.apiKey.substring(0, 20)}...`);
    console.log('');

    for (let i = 0; i < CONFIG.wsUrls.length; i++) {
      this.currentUrlIndex = i;
      const wsUrl = CONFIG.wsUrls[i];
      
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📡 测试端点 ${i + 1}/${CONFIG.wsUrls.length}: ${wsUrl}`);
      console.log('='.repeat(80));
      
      try {
        await this.testEndpoint(wsUrl);
        
        if (this.isConnected) {
          console.log('\n✅ 找到可用的端点！');
          console.log(`   成功的URL: ${wsUrl}`);
          return true;
        }
      } catch (error) {
        console.log(`❌ 端点测试失败: ${error.message}`);
      }
      
      // 等待一下再测试下一个
      await this.sleep(1000);
    }
    
    console.log('\n❌ 所有端点都测试失败');
    return false;
  }

  /**
   * 测试单个端点
   */
  testEndpoint(wsUrl) {
    return new Promise((resolve, reject) => {
      // 方法1: URL参数认证（参考示例代码）
      console.log('\n🔌 方法1: 使用URL参数认证...');
      const url = new URL(wsUrl);
      url.searchParams.append('appId', CONFIG.appId);
      url.searchParams.append('apiKey', CONFIG.apiKey);
      
      console.log(`   连接URL: ${url.toString().replace(CONFIG.apiKey, CONFIG.apiKey.substring(0, 20) + '...')}`);

      this.ws = new WebSocket(url.toString());

      this.ws.on('open', () => {
        console.log('✅ WebSocket连接成功！');
        this.isConnected = true;
        
        // 发送配置信息（参考示例代码）
        this.sendConfig();
        
        // 等待一下看是否有响应
        setTimeout(() => {
          resolve(true);
        }, 2000);
      });

      this.ws.on('message', (data) => {
        this.handleMessage(data);
      });

      this.ws.on('close', (code, reason) => {
        console.log(`🔌 连接关闭 (代码: ${code}, 原因: ${reason || '无'})`);
        this.isConnected = false;
      });

      this.ws.on('error', (error) => {
        console.log(`❌ WebSocket错误: ${error.message}`);
        
        // 如果方法1失败，尝试方法2
        if (!this.isConnected) {
          this.tryMethod2(wsUrl).then(resolve).catch(reject);
        } else {
          reject(error);
        }
      });

      // 超时处理
      setTimeout(() => {
        if (!this.isConnected) {
          this.cleanup();
          reject(new Error('连接超时'));
        }
      }, 5000);
    });
  }

  /**
   * 方法2: 使用请求头认证（Bearer Token）
   */
  tryMethod2(wsUrl) {
    return new Promise((resolve, reject) => {
      console.log('\n🔌 方法2: 使用Bearer Token认证...');

      this.cleanup();

      this.ws = new WebSocket(wsUrl, {
        headers: {
          'Authorization': `Bearer; ${CONFIG.apiKey}`,
          'Resource-Id': 'volc.speech.dialog'
        }
      });

      console.log('   请求头:');
      console.log(`     Authorization: Bearer; ${CONFIG.apiKey.substring(0, 20)}...`);
      console.log(`     Resource-Id: volc.speech.dialog`);

      this.ws.on('open', () => {
        console.log('✅ WebSocket连接成功（方法2）！');
        this.isConnected = true;
        this.sendConfig();
        setTimeout(() => resolve(true), 2000);
      });

      this.ws.on('message', (data) => {
        this.handleMessage(data);
      });

      this.ws.on('close', (code, reason) => {
        console.log(`🔌 连接关闭 (代码: ${code})`);
        this.isConnected = false;
      });

      this.ws.on('error', (error) => {
        console.log(`❌ 方法2也失败: ${error.message}`);
        reject(error);
      });

      setTimeout(() => {
        if (!this.isConnected) {
          this.cleanup();
          reject(new Error('方法2连接超时'));
        }
      }, 5000);
    });
  }

  /**
   * 发送配置信息
   */
  sendConfig() {
    if (this.ws && this.isConnected) {
      const configMessage = {
        type: 'config',
        data: CONFIG.voiceConfig
      };
      
      console.log('\n📤 发送配置信息:');
      console.log(JSON.stringify(configMessage, null, 2));
      
      this.ws.send(JSON.stringify(configMessage));
    }
  }

  /**
   * 发送测试消息
   */
  sendTestMessage() {
    if (this.ws && this.isConnected) {
      console.log('\n📤 发送测试文本消息...');
      
      const textMessage = {
        type: 'text',
        timestamp: Date.now(),
        data: {
          text: '你好，我想了解一下你们幼儿园的情况。'
        }
      };
      
      this.ws.send(JSON.stringify(textMessage));
    }
  }

  /**
   * 处理接收到的消息
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data.toString());
      this.receivedMessages.push(message);
      
      console.log(`\n📨 收到消息: ${message.type}`);
      
      switch (message.type) {
        case 'text':
          console.log('   识别结果:', message.data.text);
          break;
        case 'audio':
          console.log('   音频响应长度:', message.data.length);
          break;
        case 'event':
          console.log('   事件:', message.data.event);
          break;
        case 'error':
          console.error('   错误:', message.data);
          break;
        case 'config':
          console.log('   配置确认:', message.data);
          break;
        default:
          console.log('   数据:', JSON.stringify(message, null, 2));
      }
    } catch (error) {
      console.log('📨 收到二进制数据，长度:', data.length);
    }
  }

  /**
   * 显示测试结果
   */
  showResults() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 测试结果总结');
    console.log('='.repeat(80));
    
    console.log(`\n连接状态: ${this.isConnected ? '✅ 已连接' : '❌ 未连接'}`);
    console.log(`收到消息数: ${this.receivedMessages.length}`);
    
    if (this.receivedMessages.length > 0) {
      console.log('\n收到的消息类型:');
      const messageTypes = {};
      this.receivedMessages.forEach(msg => {
        messageTypes[msg.type] = (messageTypes[msg.type] || 0) + 1;
      });
      Object.entries(messageTypes).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count} 条`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    
    if (this.isConnected && this.receivedMessages.length > 0) {
      console.log('🎉 测试成功！豆包实时语音API工作正常！');
      console.log('\n✅ 可以添加配置到数据库');
    } else if (this.isConnected) {
      console.log('⚠️  连接成功，但未收到响应消息');
      console.log('   可能需要发送音频数据才能触发响应');
    } else {
      console.log('❌ 测试失败，无法建立连接');
    }
    
    console.log('='.repeat(80) + '\n');
  }

  /**
   * 清理资源
   */
  cleanup() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        // 忽略关闭错误
      }
      this.ws = null;
    }
    this.isConnected = false;
  }

  /**
   * 延迟函数
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 运行测试
async function main() {
  const test = new DoubaoRealtimeVoiceTest();
  
  try {
    const success = await test.testAllEndpoints();
    
    if (success) {
      // 尝试发送测试消息
      await test.sleep(1000);
      test.sendTestMessage();
      
      // 等待响应
      await test.sleep(3000);
    }
    
    test.showResults();
    test.cleanup();
    
  } catch (error) {
    console.error('测试异常:', error);
    test.cleanup();
  }
}

main();

