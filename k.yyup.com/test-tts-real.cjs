/**
 * 测试火山引擎TTS（语音合成）真实API
 * 
 * 使用HTTP一次性合成API
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  apiKey: 'e1545f0e-1d6f-4e70-aab3-3c5fdbec0700',
  appId: '7563592522',
  
  // 测试文本
  testText: '你好，欢迎咨询我们幼儿园。',
  
  // TTS API端点
  endpoints: [
    {
      name: '方舟平台TTS',
      hostname: 'ark.cn-beijing.volces.com',
      path: '/api/v3/audio/speech',
      method: 'POST'
    },
    {
      name: '豆包TTS大模型',
      hostname: 'ark.cn-beijing.volces.com',
      path: '/api/v1/tts',
      method: 'POST'
    },
    {
      name: 'OpenSpeech TTS',
      hostname: 'openspeech.bytedance.com',
      path: '/api/v1/tts',
      method: 'POST'
    }
  ]
};

class TTSTest {
  constructor() {
    this.successCount = 0;
    this.failCount = 0;
  }

  /**
   * 运行测试
   */
  async runTest() {
    console.log('🚀 开始测试火山引擎TTS（语音合成）\n');
    console.log('📋 配置信息:');
    console.log(`   API Key: ${CONFIG.apiKey.substring(0, 20)}...`);
    console.log(`   App ID: ${CONFIG.appId}`);
    console.log(`   测试文本: "${CONFIG.testText}"`);
    console.log('');

    for (const endpoint of CONFIG.endpoints) {
      console.log('='.repeat(80));
      console.log(`📡 测试端点: ${endpoint.name}`);
      console.log('='.repeat(80));
      
      try {
        await this.testEndpoint(endpoint);
        this.successCount++;
      } catch (error) {
        console.log(`❌ 测试失败: ${error.message}\n`);
        this.failCount++;
      }
      
      await this.sleep(1000);
    }
    
    this.showSummary();
  }

  /**
   * 测试单个端点
   */
  async testEndpoint(endpoint) {
    const startTime = Date.now();
    
    console.log(`\n📤 发送请求到 ${endpoint.hostname}${endpoint.path}`);
    console.log(`   合成文本: "${CONFIG.testText}"`);
    
    // 尝试不同的请求格式
    const formats = [
      {
        name: 'OpenSpeech完整格式',
        data: {
          app: {
            appid: CONFIG.apiKey,
            token: 'access_token',
            cluster: 'volcano_tts'
          },
          user: {
            uid: 'test_user_' + Date.now()
          },
          audio: {
            voice_type: 'zh_female_cancan_mars_bigtts',
            encoding: 'mp3',
            speed_ratio: 1.0,
            volume_ratio: 1.0,
            pitch_ratio: 1.0
          },
          request: {
            reqid: 'test_' + Date.now(),
            text: CONFIG.testText,
            text_type: 'plain',
            operation: 'query'
          }
        }
      },
      {
        name: 'OpenAI兼容格式',
        data: {
          model: 'doubao-tts-bigmodel',
          input: CONFIG.testText,
          voice: 'zh_female_cancan_mars_bigtts',
          response_format: 'mp3',
          speed: 1.0
        }
      },
      {
        name: '火山引擎标准格式',
        data: {
          text: CONFIG.testText,
          voice_type: 'zh_female_cancan_mars_bigtts',
          encoding: 'mp3',
          speed_ratio: 1.0,
          volume_ratio: 1.0,
          pitch_ratio: 1.0
        }
      }
    ];
    
    for (const format of formats) {
      console.log(`\n🔧 尝试格式: ${format.name}...`);
      
      try {
        const result = await this.testWithFormat(endpoint, format.data);
        const elapsed = Date.now() - startTime;
        
        console.log(`✅ 合成成功！(${elapsed}ms)`);
        console.log(`   音频大小: ${result.audioSize} 字节`);
        console.log(`   保存路径: ${result.audioPath}`);
        
        return result;
      } catch (error) {
        console.log(`   ❌ ${format.name}失败: ${error.message}`);
      }
    }
    
    throw new Error('所有格式都失败');
  }

  /**
   * 使用指定格式测试
   */
  async testWithFormat(endpoint, data) {
    const postData = JSON.stringify(data);

    const response = await this.httpsRequest({
      hostname: endpoint.hostname,
      port: 443,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${CONFIG.apiKey}`
      }
    }, postData);

    if (response.statusCode === 200) {
      // 检查响应是否是音频数据
      const contentType = response.headers['content-type'] || '';
      
      if (contentType.includes('audio') || contentType.includes('octet-stream')) {
        // 保存音频文件
        const audioPath = path.join(__dirname, `test-tts-output-${Date.now()}.mp3`);
        fs.writeFileSync(audioPath, response.body);
        
        return {
          audioSize: response.body.length,
          audioPath: audioPath,
          contentType: contentType
        };
      } else {
        // 可能是JSON响应
        try {
          const json = JSON.parse(response.body.toString());
          
          // 检查是否有音频数据字段
          if (json.data && json.data.audio) {
            const audioBuffer = Buffer.from(json.data.audio, 'base64');
            const audioPath = path.join(__dirname, `test-tts-output-${Date.now()}.mp3`);
            fs.writeFileSync(audioPath, audioBuffer);
            
            return {
              audioSize: audioBuffer.length,
              audioPath: audioPath,
              contentType: 'audio/mpeg'
            };
          } else {
            throw new Error(`响应格式不正确: ${JSON.stringify(json)}`);
          }
        } catch (e) {
          throw new Error(`无法解析响应: ${response.body.toString().substring(0, 200)}`);
        }
      }
    } else {
      throw new Error(`HTTP ${response.statusCode}: ${response.body.toString().substring(0, 200)}`);
    }
  }

  /**
   * HTTPS请求封装
   */
  httpsRequest(options, postData) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        const chunks = [];
        
        res.on('data', (chunk) => {
          chunks.push(chunk);
        });
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks)
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
   * 显示测试总结
   */
  showSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 TTS测试总结');
    console.log('='.repeat(80));
    
    console.log(`\n测试结果:`);
    console.log(`   ✅ 成功: ${this.successCount} 个端点`);
    console.log(`   ❌ 失败: ${this.failCount} 个端点`);
    
    if (this.successCount > 0) {
      console.log('\n🎉 TTS测试成功！');
      console.log('   可以使用成功的端点进行语音合成');
    } else {
      console.log('\n⚠️  所有端点都失败');
      console.log('\n💡 可能的原因:');
      console.log('   1. API Key权限不足');
      console.log('   2. 需要使用WebSocket流式API');
      console.log('   3. 端点URL不正确');
      console.log('\n💡 建议:');
      console.log('   - 查看火山引擎控制台的TTS服务文档');
      console.log('   - 使用数据库中已有的TTS配置（WebSocket）');
      console.log('   - 联系火山引擎技术支持');
    }
    
    console.log('\n' + '='.repeat(80));
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
  const test = new TTSTest();
  await test.runTest();
}

main().catch(error => {
  console.error('测试异常:', error);
  process.exit(1);
});

