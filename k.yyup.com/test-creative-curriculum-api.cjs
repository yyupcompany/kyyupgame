#!/usr/bin/env node

/**
 * 测试创意课程API
 */

const http = require('http');

const API_BASE = 'http://localhost:3000';
const TEST_TOKEN = 'test-token-123';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({
            status: res.statusCode,
            body: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function test() {
  console.log('🧪 测试创意课程API\n');

  try {
    // 测试保存课程
    console.log('📝 测试: POST /api/teacher-center/creative-curriculum/save');
    const saveResponse = await makeRequest('POST', '/api/teacher-center/creative-curriculum/save', {
      name: '测试课程',
      description: '这是一个测试课程',
      domain: 'science',
      htmlCode: '<div>测试</div>',
      cssCode: 'body { color: red; }',
      jsCode: 'console.log("test");'
    });
    
    console.log('状态码:', saveResponse.status);
    console.log('响应:', JSON.stringify(saveResponse.body, null, 2));
    
    if (saveResponse.status === 200) {
      console.log('✅ 保存成功！');
    } else {
      console.log('❌ 保存失败');
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

test();

