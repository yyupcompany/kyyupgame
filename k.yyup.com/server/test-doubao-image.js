const https = require('https');

// 从数据库读取的配置
const CONFIG = {
  name: 'doubao-seedream-4-5-251128',
  displayName: 'Doubao Seedream 4.5 (文生图)',
  endpointUrl: 'https://ark.cn-beijing.volces.com/api/v3',
  apiKey: '1c155dc7-0cec-441b-9b00-0fb8cc9fe21b4dccb4e8f8920d0b9a1d-8b4a3b8d'
};

console.log('========== 豆包图片生成测试 ==========');
console.log('模型:', CONFIG.displayName);
console.log('端点:', CONFIG.endpointUrl);
console.log('');

const requestBody = {
  model: CONFIG.name,
  prompt: '一只可爱的卡通小猫咪，Q版萌系风格，粉白色毛发，红色眼睛，站在绿色草地上，背景是浅蓝色天空，色彩鲜艳柔和，适合幼儿观看',
  n: 1,
  size: '1024x1024'
};

console.log('请求参数:');
console.log(JSON.stringify(requestBody, null, 2));
console.log('');
console.log('正在发送请求...');

const postData = JSON.stringify(requestBody);

const options = {
  hostname: 'ark.cn-beijing.volces.com',
  port: 443,
  path: '/api/v3/images/generations',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${CONFIG.apiKey}`,
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log(`\n状态码: ${res.statusCode}`);
  console.log('响应头:', JSON.stringify(res.headers, null, 2));
  console.log('\n响应内容:');
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));
      
      if (response.data && response.data.length > 0) {
        console.log('\n✅ 图片生成成功！');
        console.log('图片URL:', response.data[0].url);
      } else if (response.error) {
        console.log('\n❌ 图片生成失败:', response.error.message);
      }
    } catch (e) {
      console.log('原始响应:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('请求失败:', error.message);
});

req.write(postData);
req.end();
