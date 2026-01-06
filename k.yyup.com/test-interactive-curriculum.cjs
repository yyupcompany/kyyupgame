/**
 * 互动多媒体课程 API 测试脚本
 */

const http = require('http');

const API_BASE = 'http://localhost:3000/api';
const AUTH_TOKEN = 'test-token'; // 需要替换为真实token

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function test() {
  console.log('🧪 测试互动多媒体课程API\n');

  try {
    // 测试1：生成课程
    console.log('📝 测试1: POST /api/interactive-curriculum/generate');
    const generateResponse = await makeRequest('POST', '/interactive-curriculum/generate', {
      prompt: '生成一个认识小猫咪的互动课程，适合4-5岁幼儿，包含卡通风格的图片和动画视频',
      domain: 'science',
      ageGroup: '4-5岁'
    });

    console.log('状态码:', generateResponse.status);
    console.log('响应:', JSON.stringify(generateResponse.body, null, 2));

    if (generateResponse.status === 200 && generateResponse.body.data?.taskId) {
      const taskId = generateResponse.body.data.taskId;
      console.log('✅ 生成请求成功，taskId:', taskId);

      // 测试2：查询进度
      console.log('\n📊 测试2: GET /api/interactive-curriculum/progress/:taskId');
      const progressResponse = await makeRequest('GET', `/interactive-curriculum/progress/${taskId}`);
      console.log('状态码:', progressResponse.status);
      console.log('响应:', JSON.stringify(progressResponse.body, null, 2));

      if (progressResponse.status === 200) {
        console.log('✅ 进度查询成功');
      } else {
        console.log('❌ 进度查询失败');
      }
    } else {
      console.log('❌ 生成请求失败');
    }
  } catch (error) {
    console.error('❌ 测试错误:', error.message);
  }
}

test();

