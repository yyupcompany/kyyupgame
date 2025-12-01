#!/usr/bin/env node

/**
 * 简化的豆包API认证测试
 * 测试API认证和基本连通性
 */

const axios = require('axios');

// 从数据库中获取的一个文本模型配置
const testModel = {
  name: 'doubao-seed-1-6-flash-250715',
  endpoint_url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  api_key: '1c155dc7-0cec-441b-9b00-0fb8ccc16089',
  model_id: 'doubao-seed-1-6-flash-250715'
};

async function testDoubaoAPIAuth() {
  console.log('🧪 测试豆包API认证和连通性...');
  console.log(`🔗 端点: ${testModel.endpoint_url}`);
  console.log(`🔑 API Key: ${testModel.api_key.substring(0, 20)}...`);
  console.log(`📝 模型ID: ${testModel.model_id}`);

  try {
    // 豆包API请求格式 - 使用正确的model参数
    const requestData = {
      model: testModel.model_id,  // 使用model_id
      messages: [
        {
          role: "user",
          content: "你好"
        }
      ],
      stream: false,
      max_tokens: 10,
      temperature: 0.1
    };

    console.log('\n📤 发送请求...');
    console.log('请求体:', JSON.stringify(requestData, null, 2));

    const response = await axios.post(
      testModel.endpoint_url,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testModel.api_key}`
        },
        timeout: 30000
      }
    );

    console.log('\n✅ API调用成功!');
    console.log('响应状态:', response.status);
    console.log('响应头:', response.headers);

    if (response.data) {
      console.log('\n📝 API响应:');
      console.log(JSON.stringify(response.data, null, 2));

      const choices = response.data.choices || [];
      if (choices.length > 0) {
        console.log('\n💬 AI回复:', choices[0].message?.content || '无内容');
      } else {
        console.log('\n⚠️ 无有效回复');
      }
    }

    return { success: true, data: response.data };

  } catch (error) {
    console.error('\n❌ API调用失败:');
    console.error('错误代码:', error.response?.status || 'N/A');
    console.error('错误信息:', error.message);

    if (error.response) {
      console.error('\n📄 响应头:', error.response.headers);
      console.error('📄 响应数据:', JSON.stringify(error.response.data, null, 2));
    }

    if (error.request) {
      console.error('\n📡 请求信息: 网络请求已发出但无响应');
    }

    return {
      success: false,
      error: error.message,
      status: error.response?.status,
      responseData: error.response?.data
    };
  }
}

// 测试不同的认证方式
async function testDifferentAuthMethods() {
  console.log('\n' + '='.repeat(60));
  console.log('测试不同认证方式');
  console.log('='.repeat(60));

  const authMethods = [
    { name: 'Bearer Token', headers: { 'Authorization': `Bearer ${testModel.api_key}` } },
    { name: 'API Key Header', headers: { 'api-key': testModel.api_key } },
    { name: 'OpenAI Format', headers: { 'Authorization': `Bearer ${testModel.api_key}` } }
  ];

  for (const method of authMethods) {
    console.log(`\n🧪 测试认证方式: ${method.name}`);

    try {
      const requestData = {
        model: testModel.model_id,
        messages: [{ role: "user", content: "测试" }],
        max_tokens: 5,
        temperature: 0.1
      };

      const response = await axios.post(
        testModel.endpoint_url,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            ...method.headers
          },
          timeout: 10000
        }
      );

      console.log(`✅ ${method.name} - 成功 (${response.status})`);

      if (response.data && response.data.choices) {
        console.log(`💬 回复: ${response.data.choices[0].message?.content || '无内容'}`);
      }

      return; // 成功就退出测试

    } catch (error) {
      console.log(`❌ ${method.name} - 失败: ${error.response?.status || error.message}`);

      if (error.response?.data) {
        console.log(`   详情: ${JSON.stringify(error.response.data).substring(0, 200)}...`);
      }
    }
  }
}

// 主函数
async function main() {
  console.log('═'.repeat(60));
  console.log('       豆包API认证测试');
  console.log('═'.repeat(60));

  // 1. 基本认证测试
  const result = await testDoubaoAPIAuth();

  if (!result.success) {
    // 2. 测试不同认证方式
    await testDifferentAuthMethods();

    console.log('\n' + '='.repeat(60));
    console.log('结论: 所有认证方式都失败');
    console.log('可能原因:');
    console.log('1. API Key已过期或无效');
    console.log('2. 端点URL不正确');
    console.log('3. 豆包服务暂时不可用 (503)');
    console.log('4. 网络连接问题');
    console.log('='.repeat(60));
  } else {
    console.log('\n🎉 API认证和连通性测试成功!');
  }
}

// 运行测试
main().catch(error => {
  console.error('❌ 测试脚本执行失败:', error.message);
  process.exit(1);
});