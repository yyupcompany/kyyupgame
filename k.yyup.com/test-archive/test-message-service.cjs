#!/usr/bin/env node

/**
 * 测试消息服务
 */

const axios = require('axios');

async function testMessageService() {
  try {
    console.log('🔍 测试消息服务...');
    
    // 1. 获取认证令牌
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ 认证成功');
    
    // 2. 测试不带工具的简单查询
    console.log('2. 测试不带工具的简单查询...');
    const simpleResponse = await axios.post('http://localhost:3000/api/ai-assistant-optimized/query', {
      query: '你好',
      conversationId: 'test-simple',
      metadata: {
        enableTools: false,
        userRole: 'admin'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 简单查询成功');
    console.log('响应长度:', simpleResponse.data.response?.length || 0);
    
    // 3. 测试带工具但简单的查询
    console.log('3. 测试带工具的简单查询...');
    const toolResponse = await axios.post('http://localhost:3000/api/ai-assistant-optimized/query', {
      query: '今天天气怎么样',
      conversationId: 'test-tool-simple',
      metadata: {
        enableTools: true,
        userRole: 'admin'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 带工具的简单查询成功');
    console.log('响应长度:', toolResponse.data.response?.length || 0);
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// 测试统一智能接口
async function testUnifiedIntelligence() {
  try {
    console.log('\n🔍 测试统一智能接口...');
    
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    
    // 测试统一智能流式接口
    const response = await axios.post('http://localhost:3000/api/ai/unified-intelligence/stream', {
      content: '我的现状你用报表显示',
      context: {
        role: 'admin',
        enableTools: true,
        conversationId: 'test-unified-' + Date.now()
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ 统一智能接口调用成功');
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ 统一智能接口测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function main() {
  console.log('🚀 开始消息服务测试...\n');
  
  await testMessageService();
  await testUnifiedIntelligence();
  
  console.log('\n✅ 测试完成');
}

if (require.main === module) {
  main().catch(console.error);
}
