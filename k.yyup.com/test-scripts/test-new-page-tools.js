#!/usr/bin/env node

/**
 * 🔧 新页面操作工具集成测试脚本
 * 测试5个新增的页面操作工具的功能
 */

// 配置
const API_BASE = 'http://localhost:3000/api/ai/function-tools';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIxLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzI2MzY5MjAwfQ.test';

// 工具调用函数
async function callTool(toolName, args) {
  try {
    console.log(`🔧 测试工具: ${toolName}`);
    console.log(`📋 参数:`, JSON.stringify(args, null, 2));

    const response = await fetch(`${API_BASE}/execute-single`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        function_name: toolName,
        arguments: args
      })
    });

    const data = await response.json();

    console.log(`✅ ${toolName} 调用成功`);
    console.log(`📊 结果:`, JSON.stringify(data, null, 2));
    console.log('─'.repeat(60));

    return data;
  } catch (error) {
    console.error(`❌ ${toolName} 调用失败:`, error.message);
    console.log('─'.repeat(60));
    return null;
  }
}

// 测试用例
const testCases = [
  {
    name: 'type_text',
    description: '⌨️ 文本输入工具测试',
    args: {
      selector: '#test-input',
      text: '这是自动化测试输入的文本',
      options: {
        clear_first: true,
        typing_speed: 100
      }
    }
  },
  {
    name: 'select_option',
    description: '📋 下拉选择工具测试',
    args: {
      selector: '#test-select',
      value: 'option2',
      selection_method: 'by_value'
    }
  },
  {
    name: 'wait_for_condition',
    description: '⏳ 条件等待工具测试',
    args: {
      condition_type: 'element_visible',
      target: '.test-element',
      options: {
        timeout: 5000,
        polling_interval: 500
      }
    }
  },
  {
    name: 'console_monitor',
    description: '🖥️ 控制台监控工具测试',
    args: {
      action: 'get_messages',
      options: {
        message_types: ['log', 'warn', 'error'],
        max_messages: 10
      }
    }
  },
  {
    name: 'navigate_back',
    description: '🔙 页面返回工具测试',
    args: {
      steps: 1,
      options: {
        fallback_url: '/dashboard'
      }
    }
  }
];

// 主测试函数
async function runTests() {
  console.log('🎯 开始新页面操作工具集成测试');
  console.log('═'.repeat(60));
  
  const results = [];
  let successCount = 0;
  
  for (const testCase of testCases) {
    console.log(`\n📝 ${testCase.description}`);
    
    const result = await callTool(testCase.name, testCase.args);
    results.push({
      tool: testCase.name,
      description: testCase.description,
      success: result?.success || false,
      result: result
    });
    
    if (result?.success) {
      successCount++;
    }
    
    // 等待一下，避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 输出测试总结
  console.log('\n🎉 测试完成！');
  console.log('═'.repeat(60));
  console.log(`📊 测试总结:`);
  console.log(`   总测试数: ${testCases.length}`);
  console.log(`   成功数量: ${successCount}`);
  console.log(`   失败数量: ${testCases.length - successCount}`);
  console.log(`   成功率: ${Math.round((successCount / testCases.length) * 100)}%`);
  
  // 详细结果
  console.log('\n📋 详细结果:');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${index + 1}. ${status} ${result.tool} - ${result.description}`);
  });
  
  // 检查工具可用性
  console.log('\n🔍 检查工具可用性...');
  try {
    const availableToolsResponse = await fetch(`${API_BASE}/available-tools`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const availableToolsData = await availableToolsResponse.json();
    const pageOperationTools = availableToolsData.data.page_operation || [];
    const newTools = ['type_text', 'navigate_back', 'select_option', 'wait_for_condition', 'console_monitor'];
    
    console.log(`📊 页面操作工具总数: ${pageOperationTools.length}`);
    console.log(`🆕 新增工具检查:`);
    
    newTools.forEach(toolName => {
      const found = pageOperationTools.find(tool => tool.name === toolName);
      const status = found ? '✅' : '❌';
      console.log(`   ${status} ${toolName} ${found ? '- ' + found.description : '(未找到)'}`);
    });
    
  } catch (error) {
    console.error('❌ 检查工具可用性失败:', error.message);
  }
  
  console.log('\n🎯 集成测试完成！');
  
  if (successCount === testCases.length) {
    console.log('🎉 所有工具测试通过，集成成功！');
    process.exit(0);
  } else {
    console.log('⚠️ 部分工具测试失败，请检查日志');
    process.exit(1);
  }
}

// 运行测试
runTests().catch(error => {
  console.error('💥 测试脚本执行失败:', error);
  process.exit(1);
});

export { runTests, callTool };
