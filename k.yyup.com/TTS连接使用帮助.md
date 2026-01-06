# 🔊 TTS连接使用帮助

## 📋 概述

本项目集成了火山引擎TTS服务，支持两种连接方式：
- **HTTP REST API** - 稳定可靠，推荐使用
- **WebSocket双向流** - 实时流式，高级功能

## 🚀 快速开始

### 1. 获取火山引擎TTS密钥

登录火山引擎控制台，获取：
- **App Key** - 应用标识
- **Access Token** - 访问令牌

### 2. 测试连接

创建简单的测试文件验证配置：

```javascript
// test-tts.js
const https = require('https');

const config = {
  appId: 'your-app-key',
  accessToken: 'your-access-token',
  endpoint: 'openspeech.bytedance.com',
  path: '/api/v1/tts'
};

const testData = {
  text: '你好，这是TTS测试',
  voice: 'zh_female_cancan_mars_bigtts',
  speed: 1.0,
  encoding: 'mp3'
};

// 发送HTTP请求
const requestBody = JSON.stringify({
  app: {
    appid: config.appId,
    token: config.accessToken,
    cluster: 'volcano_tts'
  },
  user: {
    uid: '62170702'
  },
  audio: {
    voice_type: testData.voice,
    encoding: testData.encoding,
    speed_ratio: testData.speed,
    emotion: 'natural'
  },
  request: {
    reqid: Math.random().toString(36).substr(2, 9),
    text: testData.text,
    operation: 'query'
  }
});

const req = https.request({
  hostname: config.endpoint,
  path: config.path,
  method: 'POST',
  headers: {
    'Authorization': `Bearer; ${config.accessToken}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(requestBody)
  }
}, (res) => {
  console.log(`状态码: ${res.statusCode}`);

  if (res.statusCode === 200) {
    const data = [];
    res.on('data', chunk => data.push(chunk));
    res.on('end', () => {
      const audioBuffer = Buffer.concat(data);
      console.log(`✅ 生成成功，音频大小: ${audioBuffer.length} bytes`);
      require('fs').writeFileSync('test-output.mp3', audioBuffer);
      console.log('💾 已保存为 test-output.mp3');
    });
  } else {
    console.log('❌ 生成失败');
  }
});

req.on('error', (error) => {
  console.error('请求错误:', error.message);
});

req.write(requestBody);
req.end();
```

运行测试：
```bash
node test-tts.js
```

## ⚙️ 两种TTS服务对比

| 服务类型 | HTTP REST API | WebSocket双向流 |
|---------|---------------|-----------------|
| **端点** | `https://openspeech.bytedance.com/api/v1/tts` | `wss://openspeech.bytedance.com/api/v3/tts/bidirection` |
| **认证** | Bearer Token | AppKey + AccessKey |
| **稳定性** | ⭐⭐⭐⭐⭐ 高 | ⭐⭐⭐ 中等 |
| **延迟** | 1-3秒 | 实时流式 |
| **音质** | 清晰无杂音 | 可能有小杂音 |
| **适用场景** | 批量生成、正式业务 | 实时交互、原型测试 |

## 🛠️ 调用方法

### 方法一：HTTP REST API（推荐）

**优点**：稳定、音质好、简单易用

```javascript
const https = require('https');
const crypto = require('crypto');

function generateSpeech(text, options = {}) {
  return new Promise((resolve, reject) => {
    const config = {
      appId: 'your-app-key',
      accessToken: 'your-access-token'
    };

    const params = {
      text: text,
      voice: options.voice || 'zh_female_cancan_mars_bigtts',
      speed: options.speed || 1.0,
      encoding: options.encoding || 'mp3'
    };

    const requestBody = JSON.stringify({
      app: {
        appid: config.appId,
        token: config.accessToken,
        cluster: 'volcano_tts'
      },
      user: {
        uid: '62170702'
      },
      audio: {
        voice_type: params.voice,
        encoding: params.encoding,
        speed_ratio: params.speed,
        emotion: 'natural'
      },
      request: {
        reqid: crypto.randomUUID(),
        text: params.text,
        operation: 'query'
      }
    });

    const req = https.request({
      hostname: 'openspeech.bytedance.com',
      path: '/api/v1/tts',
      method: 'POST',
      headers: {
        'Authorization': `Bearer; ${config.accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      const data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        resolve({
          audioBuffer: Buffer.concat(data),
          format: params.encoding
        });
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

// 使用示例
generateSpeech('你好，欢迎使用TTS服务')
  .then(result => {
    require('fs').writeFileSync('output.mp3', result.audioBuffer);
    console.log('✅ 语音生成成功');
  })
  .catch(error => {
    console.error('❌ 生成失败:', error.message);
  });
```

### 方法二：WebSocket双向流

**优点**：实时流式、低延迟

```javascript
const WebSocket = require('ws');
const crypto = require('crypto');

function generateSpeechWebSocket(text, options = {}) {
  return new Promise((resolve, reject) => {
    const config = {
      appKey: 'your-app-key',
      accessKey: 'your-access-key'
    };

    const sessionId = `session_${Date.now()}`;
    const audioChunks = [];

    const ws = new WebSocket('wss://openspeech.bytedance.com/api/v3/tts/bidirection', {
      headers: {
        'X-Api-App-Key': config.appKey,
        'X-Api-Access-Key': config.accessKey,
        'X-Api-Resource-Id': 'volc.service_type.10029',
        'X-Api-Request-Id': crypto.randomUUID()
      }
    });

    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('请求超时'));
    }, 30000);

    ws.on('open', () => {
      // 发送START_CONNECTION
      ws.send(buildStartConnectionFrame());
    });

    ws.on('message', (data) => {
      // 处理WebSocket消息帧
      // 这里需要实现复杂的协议解析
      // 详细协议请参考火山引擎文档
    });

    ws.on('close', () => {
      clearTimeout(timeout);
      if (audioChunks.length > 0) {
        resolve({
          audioBuffer: Buffer.concat(audioChunks),
          format: options.format || 'mp3'
        });
      } else {
        reject(new Error('未收到音频数据'));
      }
    });

    ws.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}
```

## 🎯 可用音色

### 推荐音色（儿童友好）

| 音色ID | 描述 | 适用场景 |
|--------|------|----------|
| `zh_female_cancan_mars_bigtts` | 温柔女声 | 儿童内容、教育 |
| `zh_female_moon_mars_bigtts` | 甜美女声 | 儿童故事、游戏 |
| `zh_male_jinguan_mars_bigtts` | 温和男声 | 旁白、说明 |

### 其他音色

| 音色ID | 性别 | 特点 |
|--------|------|------|
| `zh_female_xiaobei_mars_bigtts` | 女 | 活泼可爱 |
| `zh_female_xiaomeng_mars_bigtts` | 女 | 知性温柔 |
| `zh_male_chunhou_mars_bigtts` | 男 | 成熟稳重 |

## 🔍 常见错误解决

### ❌ 错误1：401 Unauthorized
**原因**：API Key无效或过期
**解决**：
1. 检查 appId 和 accessToken 是否正确
2. 确认火山引擎账户余额充足
3. 重新生成API密钥

### ❌ 错误2：连接超时
**原因**：网络连接问题
**解决**：
1. 检查网络连接
2. 使用HTTP API替代WebSocket
3. 增加超时时间

### ❌ 错误3：429 Too Many Requests
**原因**：API调用频率超限
**解决**：
1. 降低请求频率（每秒不超过10次）
2. 使用批量处理
3. 升级服务套餐

### ❌ 错误4：音频质量问题
**原因**：WebSocket连接不稳定
**解决**：
1. 使用HTTP REST API
2. 检查网络稳定性
3. 降低音频质量设置

## 📝 最佳实践

### 1. 推荐配置
- **使用HTTP REST API** - 更稳定
- **设置超时时间** - 30秒
- **实现重试机制** - 最多3次
- **批量处理** - 每批10条，间隔5秒

### 2. 性能优化示例

```javascript
// 批量处理
async function batchGenerateSpeech(texts) {
  const BATCH_SIZE = 10;
  const BATCH_DELAY = 5000; // 5秒

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    await Promise.allSettled(
      batch.map(text => generateSpeech(text))
    );

    if (i + BATCH_SIZE < texts.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
    }
  }
}
```

### 3. 错误处理

```javascript
async function safeGenerateSpeech(text, options = {}) {
  const maxRetries = 3;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateSpeech(text, options);
    } catch (error) {
      console.log(`第${i + 1}次尝试失败:`, error.message);

      if (i === maxRetries - 1) {
        throw error;
      }

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
}
```

## 🔧 调试工具

### 1. 网络连接测试
```bash
# 测试HTTP端点
curl -I https://openspeech.bytedance.com/api/v1/tts

# 测试HTTPS连接
openssl s_client -connect openspeech.bytedance.com:443
```

### 2. 简单验证脚本
```javascript
// quick-test.js
const testConfig = {
  appId: 'your-app-key',
  accessToken: 'your-access-token',
  testText: '测试文本'
};

console.log('🔊 开始TTS测试...');
console.log('配置:', { appId: testConfig.appId, text: testConfig.testText });

// 这里调用上面的generateSpeech函数
```

---

**提示**：建议先使用HTTP REST API进行测试，确认配置正确后再考虑使用WebSocket双向流。