#!/usr/bin/env node

/**
 * 测试创意课程保存功能
 * 测试流程：
 * 1. 验证后端路由是否正确注册
 * 2. 测试保存课程API
 * 3. 验证数据库是否正确保存
 */

const http = require('http');

// 测试配置
const API_BASE = 'http://localhost:3000';
const TEST_TOKEN = 'test-token-123'; // 这会在开发环境中自动通过

// 测试数据
const testCurriculum = {
  name: '测试课程 - ' + new Date().getTime(),
  description: '这是一个测试课程',
  domain: 'science',
  ageGroup: '3-4岁',
  htmlCode: '<div>测试HTML</div>',
  cssCode: 'body { color: red; }',
  jsCode: 'console.log("test");',
  schedule: '周一至周五'
};

// 发送HTTP请求
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
            headers: res.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
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

// 主测试函数
async function runTests() {
  console.log('🧪 开始测试创意课程保存功能...\n');

  try {
    // 测试1: 保存课程
    console.log('📝 测试1: 保存新课程');
    console.log('请求数据:', JSON.stringify(testCurriculum, null, 2));
    
    const saveResponse = await makeRequest('POST', '/api/teacher-center/creative-curriculum/save', testCurriculum);
    console.log('响应状态:', saveResponse.status);
    console.log('响应数据:', JSON.stringify(saveResponse.body, null, 2));

    if (saveResponse.status === 200 && saveResponse.body.code === 200) {
      console.log('✅ 保存成功！课程ID:', saveResponse.body.data.id);
      
      const curriculumId = saveResponse.body.data.id;

      // 测试2: 获取课程详情
      console.log('\n📖 测试2: 获取课程详情');
      const getResponse = await makeRequest('GET', `/api/teacher-center/creative-curriculum/${curriculumId}`);
      console.log('响应状态:', getResponse.status);
      console.log('响应数据:', JSON.stringify(getResponse.body, null, 2));

      if (getResponse.status === 200) {
        console.log('✅ 获取成功！');
      } else {
        console.log('❌ 获取失败');
      }

      // 测试3: 获取课程列表
      console.log('\n📋 测试3: 获取课程列表');
      const listResponse = await makeRequest('GET', '/api/teacher-center/creative-curriculum?page=1&limit=10');
      console.log('响应状态:', listResponse.status);
      console.log('响应数据:', JSON.stringify(listResponse.body, null, 2));

      if (listResponse.status === 200) {
        console.log('✅ 获取列表成功！');
      } else {
        console.log('❌ 获取列表失败');
      }

    } else {
      console.log('❌ 保存失败');
      console.log('错误信息:', saveResponse.body.message);
    }

  } catch (error) {
    console.error('❌ 测试出错:', error.message);
    console.error('请确保后端服务已启动在 http://localhost:3000');
  }

  console.log('\n✨ 测试完成');
}

// 运行测试
runTests();

