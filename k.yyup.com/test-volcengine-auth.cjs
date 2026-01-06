/**
 * 测试火山引擎API凭证
 */

const https = require('https');

const CONFIG = {
  appId: '7563592522',
  apiKey: 'e1545f0e-1d6f-4e70-aab3-3c5fdbec0700'
};

console.log('🔍 测试火山引擎API凭证\n');
console.log(`App ID: ${CONFIG.appId}`);
console.log(`API Key: ${CONFIG.apiKey}\n`);

// 测试1: 尝试调用豆包文本API（使用方舟平台）
console.log('📤 测试1: 调用豆包文本API...\n');

const postData = JSON.stringify({
  model: 'doubao-seed-1-6-flash-250715',
  messages: [
    {
      role: 'user',
      content: '你好'
    }
  ]
});

const options = {
  hostname: 'ark.cn-beijing.volces.com',
  port: 443,
  path: '/api/v3/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': `Bearer ${CONFIG.apiKey}`
  }
};

const req = https.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n响应内容:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n✅ API凭证有效！');
      } else {
        console.log('\n❌ API调用失败');
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ 请求错误:', error.message);
});

req.write(postData);
req.end();

