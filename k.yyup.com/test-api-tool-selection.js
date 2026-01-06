#!/usr/bin/env node

/**
 * 测试API工具选择优先级
 * 验证修复后的工具选择逻辑
 */

const http = require('http');

function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/ai/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (error) {
          resolve({ error: 'Parse error', raw: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testToolSelection() {
  console.log('🎯 开始测试API工具选择优先级...\n');

  const testCases = [
    {
      name: '简单查询 - 查询所有班级',
      message: '查询所有班级',
      expectedTool: 'read_data_record',
      description: '应该优先使用read_data_record'
    },
    {
      name: '简单查询 - 查询所有学生',
      message: '查询所有学生',
      expectedTool: 'read_data_record',
      description: '应该优先使用read_data_record'
    },
    {
      name: '复杂查询 - 查询所有男生',
      message: '查询所有男生',
      expectedTool: 'any_query',
      description: '包含过滤条件，应该使用any_query'
    },
    {
      name: '复杂查询 - 按年龄排序查询学生',
      message: '按年龄排序查询学生',
      expectedTool: 'any_query',
      description: '包含排序条件，应该使用any_query'
    }
  ];

  for (const testCase of testCases) {
    console.log(`🧪 ${testCase.name}`);
    console.log(`📝 消息: "${testCase.message}"`);
    console.log(`🎯 期望: ${testCase.description}`);

    try {
      const response = await makeRequest({
        message: testCase.message,
        conversationId: `test-${Date.now()}`
      });

      if (response.error) {
        console.log(`❌ 请求失败: ${response.error}`);
        if (response.raw) {
          console.log(`   原始响应: ${response.raw.substring(0, 200)}...`);
        }
      } else {
        console.log(`✅ 请求成功`);
        if (response.toolCall) {
          console.log(`🔧 调用工具: ${response.toolCall.tool || '未知'}`);
        }
        if (response.response) {
          console.log(`💬 AI响应: ${response.response.substring(0, 100)}...`);
        }
      }
    } catch (error) {
      console.log(`❌ 网络错误: ${error.message}`);
    }

    console.log('---\n');

    // 等待一秒避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('🎉 API工具选择测试完成');
}

// 运行测试
testToolSelection().catch((error) => {
  console.error('💥 测试过程中发生错误:', error);
  process.exit(1);
});