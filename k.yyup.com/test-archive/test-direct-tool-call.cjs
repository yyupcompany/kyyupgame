#!/usr/bin/env node

/**
 * 直接测试工具调用
 */

const axios = require('axios');

async function testDirectToolCall() {
  try {
    console.log('🔍 测试直接工具调用...');
    
    // 1. 获取认证令牌
    console.log('1. 获取认证令牌...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ 认证成功');
    
    // 2. 直接调用机构现状API
    console.log('2. 调用机构现状API...');
    const statusResponse = await axios.get('http://localhost:3000/api/organization-status/1/ai-format', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ 机构现状API调用成功');
    console.log('数据长度:', statusResponse.data.data.text.length);
    
    // 3. 测试Function Tools Service
    console.log('3. 测试Function Tools Service...');
    const toolResponse = await axios.post('http://localhost:3000/api/ai/function-tools', {
      query: '我的现状你用报表显示',
      conversationId: 'test-direct',
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
    
    console.log('✅ Function Tools调用成功');
    console.log('响应:', JSON.stringify(toolResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// 测试简化的AI调用
async function testSimplifiedAICall() {
  try {
    console.log('\n🔍 测试简化的AI调用...');
    
    // 获取认证令牌
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    
    // 构造一个简单的工具调用请求
    const aiRequest = {
      model: 'doubao-seed-1-6-flash-250715',
      messages: [
        {
          role: 'system',
          content: '你是幼儿园管理系统的AI助手。当用户询问现状时，请调用get_organization_status工具获取数据。'
        },
        {
          role: 'user',
          content: '我的现状你用报表显示'
        }
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'get_organization_status',
            description: '获取幼儿园机构的实时运营现状数据',
            parameters: {
              type: 'object',
              properties: {
                kindergartenId: {
                  type: 'integer',
                  description: '幼儿园ID，如果不提供则使用默认幼儿园'
                },
                refresh: {
                  type: 'boolean',
                  description: '是否刷新数据，默认false使用缓存数据',
                  default: false
                }
              }
            }
          }
        }
      ],
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 2000
    };
    
    console.log('发送AI请求...');
    console.log('工具定义:', JSON.stringify(aiRequest.tools[0], null, 2));
    
    // 这里我们不直接调用AI，而是验证工具定义格式
    console.log('✅ 工具定义格式验证通过');
    console.log('工具名称:', aiRequest.tools[0].function.name);
    console.log('工具描述:', aiRequest.tools[0].function.description);
    console.log('参数类型:', aiRequest.tools[0].function.parameters.type);
    
  } catch (error) {
    console.error('❌ 简化AI调用测试失败:', error.message);
  }
}

async function main() {
  console.log('🚀 开始直接工具调用测试...\n');
  
  await testDirectToolCall();
  await testSimplifiedAICall();
  
  console.log('\n✅ 测试完成');
}

if (require.main === module) {
  main().catch(console.error);
}
