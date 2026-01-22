/**
 * 测试 UUID 格式的 API 密钥（flash 模型）
 */

import https from 'https';

// UUID 格式密钥
const API_KEY = '1c155dc7-0cec-441b-9b00-0fb8ccc16089';
const ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

async function testUUIDFormatAPIKey() {
  console.log('🧪 测试 UUID 格式 API 密钥...');
  console.log('端点:', ENDPOINT);
  console.log('密钥:', API_KEY);

  const testData = {
    model: 'doubao-seed-1-6-flash-250715',
    messages: [
      { role: 'user', content: '你好' }
    ],
    max_tokens: 10
  };

  const url = new URL(ENDPOINT);

  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('\n📊 响应状态码:', res.statusCode);
        console.log('📝 响应内容:', data.substring(0, 500));

        if (res.statusCode === 200) {
          console.log('\n✅ UUID 格式 API 密钥有效！');
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('\n❌ 请求失败:', error.message);
      reject(error);
    });

    req.write(JSON.stringify(testData));
    req.end();
  });
}

testUUIDFormatAPIKey()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
