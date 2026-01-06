/**
 * 测试火山引擎ASR（语音识别）真实API
 * 
 * 使用录音文件识别API
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  apiKey: 'e1545f0e-1d6f-4e70-aab3-3c5fdbec0700',
  appId: '7563592522',
  
  // ASR API端点
  endpoints: [
    {
      name: '录音文件识别',
      hostname: 'openspeech.bytedance.com',
      path: '/api/v1/asr',
      method: 'POST'
    },
    {
      name: '方舟平台ASR',
      hostname: 'ark.cn-beijing.volces.com',
      path: '/api/v1/audio/transcriptions',
      method: 'POST'
    }
  ]
};

class ASRTest {
  constructor() {
    this.testAudioBase64 = this.generateTestAudio();
  }

  /**
   * 生成测试音频（PCM格式，模拟"你好"的音频）
   */
  generateTestAudio() {
    // 生成一个简单的PCM音频数据（16kHz, 16bit, mono）
    // 这里只是生成静音数据作为测试
    const sampleRate = 16000;
    const duration = 2; // 2秒
    const samples = sampleRate * duration;
    const buffer = Buffer.alloc(samples * 2); // 16bit = 2 bytes
    
    // 填充一些简单的波形数据
    for (let i = 0; i < samples; i++) {
      const value = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 10000;
      buffer.writeInt16LE(value, i * 2);
    }
    
    return buffer.toString('base64');
  }

  /**
   * 运行测试
   */
  async runTest() {
    console.log('🚀 开始测试火山引擎ASR（语音识别）\n');
    console.log('📋 配置信息:');
    console.log(`   API Key: ${CONFIG.apiKey.substring(0, 20)}...`);
    console.log(`   App ID: ${CONFIG.appId}`);
    console.log('');

    for (const endpoint of CONFIG.endpoints) {
      console.log('='.repeat(80));
      console.log(`📡 测试端点: ${endpoint.name}`);
      console.log('='.repeat(80));
      
      try {
        await this.testEndpoint(endpoint);
      } catch (error) {
        console.log(`❌ 测试失败: ${error.message}\n`);
      }
      
      await this.sleep(1000);
    }
  }

  /**
   * 测试单个端点
   */
  async testEndpoint(endpoint) {
    const startTime = Date.now();
    
    console.log(`\n📤 发送请求到 ${endpoint.hostname}${endpoint.path}`);
    
    // 方法1: JSON格式
    console.log('\n🔧 方法1: JSON格式请求...');
    try {
      const result1 = await this.testWithJSON(endpoint);
      const elapsed = Date.now() - startTime;
      
      console.log(`✅ 请求成功 (${elapsed}ms)`);
      console.log('响应:', JSON.stringify(result1, null, 2));
      return;
    } catch (error) {
      console.log(`❌ JSON格式失败: ${error.message}`);
    }
    
    // 方法2: multipart/form-data格式
    console.log('\n🔧 方法2: multipart/form-data格式...');
    try {
      const result2 = await this.testWithFormData(endpoint);
      const elapsed = Date.now() - startTime;
      
      console.log(`✅ 请求成功 (${elapsed}ms)`);
      console.log('响应:', JSON.stringify(result2, null, 2));
      return;
    } catch (error) {
      console.log(`❌ multipart格式失败: ${error.message}`);
    }
  }

  /**
   * 使用JSON格式测试
   */
  async testWithJSON(endpoint) {
    const postData = JSON.stringify({
      audio: this.testAudioBase64,
      format: 'pcm',
      rate: 16000,
      bits: 16,
      channel: 1,
      language: 'zh-CN'
    });

    const response = await this.httpsRequest({
      hostname: endpoint.hostname,
      port: 443,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer; ${CONFIG.apiKey}`
      }
    }, postData);

    if (response.statusCode === 200) {
      return JSON.parse(response.body);
    } else {
      throw new Error(`HTTP ${response.statusCode}: ${response.body}`);
    }
  }

  /**
   * 使用multipart/form-data格式测试
   */
  async testWithFormData(endpoint) {
    const boundary = '----WebKitFormBoundary' + Date.now();
    const audioBuffer = Buffer.from(this.testAudioBase64, 'base64');
    
    const formData = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="audio"; filename="test.pcm"',
      'Content-Type: audio/pcm',
      '',
      audioBuffer.toString('binary'),
      `--${boundary}`,
      'Content-Disposition: form-data; name="format"',
      '',
      'pcm',
      `--${boundary}`,
      'Content-Disposition: form-data; name="rate"',
      '',
      '16000',
      `--${boundary}--`
    ].join('\r\n');

    const response = await this.httpsRequest({
      hostname: endpoint.hostname,
      port: 443,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(formData),
        'Authorization': `Bearer; ${CONFIG.apiKey}`
      }
    }, formData);

    if (response.statusCode === 200) {
      return JSON.parse(response.body);
    } else {
      throw new Error(`HTTP ${response.statusCode}: ${response.body}`);
    }
  }

  /**
   * HTTPS请求封装
   */
  httpsRequest(options, postData) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (postData) {
        req.write(postData);
      }
      
      req.end();
    });
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
  const test = new ASRTest();
  await test.runTest();
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 ASR测试总结');
  console.log('='.repeat(80));
  console.log('\n💡 说明:');
  console.log('   - 如果所有端点都失败，可能需要使用WebSocket流式API');
  console.log('   - 或者需要真实的音频文件进行测试');
  console.log('   - 建议查看火山引擎控制台的ASR服务文档');
  console.log('\n' + '='.repeat(80));
}

main().catch(error => {
  console.error('测试异常:', error);
  process.exit(1);
});

