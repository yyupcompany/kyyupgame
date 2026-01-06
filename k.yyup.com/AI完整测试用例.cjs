/**
 * AI功能完整测试用例
 */

const axios = require('axios');

// 测试配置
const API_BASE = 'http://localhost:3000';
const TEST_USER = {
  username: 'admin',
  password: 'admin123'
};

// 1. 认证测试
async function testUserLogin() {
  console.log('🔐 测试用户登录获取Token...');
  
  try {
    const response = await axios.post(`${API_BASE}/api/auth/login`, TEST_USER);
    
    if (response.data.success) {
      console.log('✅ 登录成功');
      return response.data.data.token;
    } else {
      console.log('❌ 登录失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ 登录请求失败:', error.message);
    return null;
  }
}

// 2. 第一级直接响应测试
async function testLevel1DirectResponse(token) {
  console.log('\n⚡ 测试第一级直接响应...');
  
  const testCases = [
    { query: '学生总数', expected: '包含学生统计信息' },
    { query: '教师总数', expected: '包含教师统计信息' },
    { query: '今日活动', expected: '包含今日活动信息' },
    { query: '招生统计', expected: '包含招生统计信息' }
  ];
  
  let successCount = 0;
  
  for (const testCase of testCases) {
    try {
      console.log(`\n🧪 测试: "${testCase.query}"`);
      
      const response = await axios.post(`${API_BASE}/api/ai/unified-chat`, {
        message: testCase.query,
        userId: '121'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success && response.data.data.message) {
        const message = response.data.data.message;
        console.log(`✅ 响应成功 (${response.status})`);
        console.log(`📤 AI回复: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`);
        
        // 检查是否包含预期内容
        if (message.includes(testCase.expected.split(' ')[0])) {
          console.log(`✅ 包含预期内容: ${testCase.expected}`);
          successCount++;
        } else {
          console.log(`⚠️  不包含预期内容: ${testCase.expected}`);
        }
      } else {
        console.log(`❌ 响应失败: ${response.data.message || '未知错误'}`);
      }
    } catch (error) {
      console.log(`❌ 测试失败: ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log(`\n📊 第一级直接响应测试结果: ${successCount}/${testCases.length}`);
  return { successCount, totalCount: testCases.length };
}

// 3. 第二级轻量级处理测试
async function testLevel2LightProcessing(token) {
  console.log('\n🔍 测试第二级轻量级处理...');
  
  const testCases = [
    { query: '查询学生统计信息', expected: '数据分析' },
    { query: '分析最近活动数据', expected: '分析' },
    { query: '生成月度报告', expected: '报告' }
  ];
  
  let successCount = 0;
  
  for (const testCase of testCases) {
    try {
      console.log(`\n🧪 测试: "${testCase.query}"`);
      
      const response = await axios.post(`${API_BASE}/api/ai/unified-chat`, {
        message: testCase.query,
        userId: '121'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success && response.data.data.message) {
        const message = response.data.data.message;
        console.log(`✅ 响应成功 (${response.status})`);
        console.log(`📤 AI回复: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`);
        
        successCount++;
      } else {
        console.log(`❌ 响应失败: ${response.data.message || '未知错误'}`);
      }
    } catch (error) {
      console.log(`❌ 测试失败: ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log(`\n📊 第二级轻量级处理测试结果: ${successCount}/${testCases.length}`);
  return { successCount, totalCount: testCases.length };
}

// 4. 第三级大模型处理测试
async function testLevel3ComplexProcessing(token) {
  console.log('\n🤖 测试第三级大模型处理...');
  
  const testCases = [
    { 
      query: '帮我策划一个六一儿童节活动方案', 
      expected: '活动策划' 
    },
    { 
      query: '制定下个月的招生计划', 
      expected: '招生计划' 
    },
    { 
      query: '分析本季度的经营状况并提出改进建议', 
      expected: '分析' 
    }
  ];
  
  let successCount = 0;
  
  for (const testCase of testCases) {
    try {
      console.log(`\n🧪 测试: "${testCase.query}"`);
      
      const response = await axios.post(`${API_BASE}/api/ai/unified-chat`, {
        message: testCase.query,
        userId: '121'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success && response.data.data.message) {
        const message = response.data.data.message;
        console.log(`✅ 响应成功 (${response.status})`);
        console.log(`📤 AI回复: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`);
        
        successCount++;
      } else {
        console.log(`❌ 响应失败: ${response.data.message || '未知错误'}`);
      }
    } catch (error) {
      console.log(`❌ 测试失败: ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log(`\n📊 第三级大模型处理测试结果: ${successCount}/${testCases.length}`);
  return { successCount, totalCount: testCases.length };
}

// 5. 查询类工具测试
async function testQueryTools(token) {
  console.log('\n📊 测试查询类工具...');
  
  const testCases = [
    {
      name: '查询历史活动数据',
      tool: 'query_past_activities',
      params: { limit: 5 }
    },
    {
      name: '获取活动统计信息',
      tool: 'get_activity_statistics',
      params: { period: 'month' }
    },
    {
      name: '查询招生历史数据',
      tool: 'query_enrollment_history',
      params: { limit: 5 }
    }
  ];
  
  let successCount = 0;
  
  for (const testCase of testCases) {
    try {
      console.log(`\n🔧 测试工具: ${testCase.name}`);
      
      const response = await axios.post(`${API_BASE}/api/ai/unified-chat`, {
        message: `执行工具: ${testCase.tool}`,
        userId: '121',
        context: {
          enableTools: true
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        console.log(`✅ 工具调用成功`);
        successCount++;
      } else {
        console.log(`❌ 工具调用失败: ${response.data.message || '未知错误'}`);
      }
    } catch (error) {
      console.log(`❌ 测试失败: ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log(`\n📊 查询类工具测试结果: ${successCount}/${testCases.length}`);
  return { successCount, totalCount: testCases.length };
}

// 6. 任务管理工具测试
async function testTaskManagementTools(token) {
  console.log('\n📋 测试任务管理工具...');
  
  const testCases = [
    {
      name: '分析任务复杂度',
      tool: 'analyze_task_complexity',
      params: { userInput: '策划一个大型活动' }
    },
    {
      name: '创建待办事项清单',
      tool: 'create_todo_list',
      params: { 
        title: '活动策划任务', 
        tasks: [
          { title: '确定活动主题', priority: 'high' },
          { title: '制定预算计划', priority: 'medium' }
        ]
      }
    }
  ];
  
  let successCount = 0;
  
  for (const testCase of testCases) {
    try {
      console.log(`\n🔧 测试工具: ${testCase.name}`);
      
      const response = await axios.post(`${API_BASE}/api/ai/unified-chat`, {
        message: `执行工具: ${testCase.tool}`,
        userId: '121',
        context: {
          enableTools: true
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        console.log(`✅ 工具调用成功`);
        successCount++;
      } else {
        console.log(`❌ 工具调用失败: ${response.data.message || '未知错误'}`);
      }
    } catch (error) {
      console.log(`❌ 测试失败: ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log(`\n📊 任务管理工具测试结果: ${successCount}/${testCases.length}`);
  return { successCount, totalCount: testCases.length };
}

// 7. 权限控制测试
async function testPermissionControl(token) {
  console.log('\n🔐 测试权限控制...');
  
  const testCases = [
    {
      name: '管理员权限测试',
      query: '修改系统配置',
      role: 'admin',
      shouldAllow: true
    },
    {
      name: '教师权限测试',
      query: '修改系统配置',
      role: 'teacher',
      shouldAllow: false
    },
    {
      name: '家长权限测试',
      query: '查看所有用户数据',
      role: 'parent',
      shouldAllow: false
    }
  ];
  
  let successCount = 0;
  
  for (const testCase of testCases) {
    try {
      console.log(`\n🧪 测试: ${testCase.name}`);
      
      const response = await axios.post(`${API_BASE}/api/ai/unified-chat`, {
        message: testCase.query,
        userId: '121',
        context: {
          role: testCase.role
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const isAllowed = response.data.success;
      
      if (testCase.shouldAllow === isAllowed) {
        console.log(`✅ 权限控制正确`);
        successCount++;
      } else {
        console.log(`❌ 权限控制错误: 应该${testCase.shouldAllow ? '允许' : '拒绝'}，但实际${isAllowed ? '允许' : '拒绝'}`);
      }
    } catch (error) {
      console.log(`❌ 测试失败: ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log(`\n📊 权限控制测试结果: ${successCount}/${testCases.length}`);
  return { successCount, totalCount: testCases.length };
}

// 8. 响应时间测试
async function testResponseTime(token) {
  console.log('\n⏱️ 测试响应时间...');
  
  const testQueries = [
    '学生总数',
    '查询学生统计信息',
    '帮我策划一个六一儿童节活动方案'
  ];
  
  const expectedTimes = [100, 1000, 5000]; // 毫秒
  let successCount = 0;
  
  for (let i = 0; i < testQueries.length; i++) {
    const query = testQueries[i];
    const expectedTime = expectedTimes[i];
    
    try {
      console.log(`\n⏱️ 测试查询: "${query}"`);
      
      const startTime = Date.now();
      const response = await axios.post(`${API_BASE}/api/ai/unified-chat`, {
        message: query,
        userId: '121'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (response.data.success) {
        console.log(`✅ 响应成功，耗时: ${responseTime}ms`);
        
        if (responseTime <= expectedTime * 1.5) {
          console.log(`✅ 响应时间符合预期 (<= ${expectedTime * 1.5}ms)`);
          successCount++;
        } else {
          console.log(`⚠️  响应时间超出预期 (> ${expectedTime * 1.5}ms)`);
        }
      } else {
        console.log(`❌ 响应失败: ${response.data.message || '未知错误'}`);
      }
    } catch (error) {
      console.log(`❌ 测试失败: ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log(`\n📊 响应时间测试结果: ${successCount}/${testQueries.length}`);
  return { successCount, totalCount: testQueries.length };
}

// 9. 统一智能聊天接口测试
async function testUnifiedChatInterface(token) {
  console.log('\n💬 测试统一智能聊天接口...');
  
  const testCases = [
    {
      name: '基础对话测试',
      message: '你好，我是幼儿园老师',
      expectedKeywords: ['你好', '老师']
    },
    {
      name: '数据查询测试',
      message: '请告诉我学生总数',
      expectedKeywords: ['学生', '总数']
    }
  ];
  
  let successCount = 0;
  
  for (const testCase of testCases) {
    try {
      console.log(`\n💬 测试: ${testCase.name}`);
      
      const response = await axios.post(`${API_BASE}/api/ai/unified-chat`, {
        message: testCase.message,
        userId: '121'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success && response.data.data.message) {
        const message = response.data.data.message;
        console.log(`✅ 对话成功`);
        console.log(`📤 AI回复: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`);
        
        // 检查是否包含预期关键词
        const hasExpectedKeywords = testCase.expectedKeywords.every(keyword => 
          message.includes(keyword)
        );
        
        if (hasExpectedKeywords) {
          console.log(`✅ 包含所有预期关键词: ${testCase.expectedKeywords.join(', ')}`);
          successCount++;
        } else {
          console.log(`⚠️  未包含所有预期关键词`);
        }
      } else {
        console.log(`❌ 对话失败: ${response.data.message || '未知错误'}`);
      }
    } catch (error) {
      console.log(`❌ 测试失败: ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log(`\n📊 统一智能聊天接口测试结果: ${successCount}/${testCases.length}`);
  return { successCount, totalCount: testCases.length };
}

// 生成测试报告
function generateTestReport(results) {
  console.log('\n' + '='.repeat(80));
  console.log('🎯 AI功能完整测试报告');
  console.log('='.repeat(80));
  
  const totalSuccess = Object.values(results).reduce((sum, result) => sum + result.successCount, 0);
  const totalTests = Object.values(results).reduce((sum, result) => sum + result.totalCount, 0);
  const overallRate = ((totalSuccess / totalTests) * 100).toFixed(1);
  
  console.log(`\n📊 总体统计:`);
  console.log(`   测试时间: ${new Date().toLocaleString()}`);
  console.log(`   总测试数: ${totalTests}`);
  console.log(`   成功数: ${totalSuccess}`);
  console.log(`   失败数: ${totalTests - totalSuccess}`);
  console.log(`   成功率: ${overallRate}%`);
  
  console.log(`\n📋 详细分类结果:`);
  console.log(`   ⚡ 第一级直接响应: ${results.level1.successCount}/${results.level1.totalCount} (${((results.level1.successCount/results.level1.totalCount)*100).toFixed(1)}%)`);
  console.log(`   🔍 第二级轻量处理: ${results.level2.successCount}/${results.level2.totalCount} (${((results.level2.successCount/results.level2.totalCount)*100).toFixed(1)}%)`);
  console.log(`   🤖 第三级大模型处理: ${results.level3.successCount}/${results.level3.totalCount} (${((results.level3.successCount/results.level3.totalCount)*100).toFixed(1)}%)`);
  console.log(`   📊 查询类工具: ${results.queryTools.successCount}/${results.queryTools.totalCount} (${((results.queryTools.successCount/results.queryTools.totalCount)*100).toFixed(1)}%)`);
  console.log(`   📋 任务管理工具: ${results.taskTools.successCount}/${results.taskTools.totalCount} (${((results.taskTools.successCount/results.taskTools.totalCount)*100).toFixed(1)}%)`);
  console.log(`   🔐 权限控制: ${results.permission.successCount}/${results.permission.totalCount} (${((results.permission.successCount/results.permission.totalCount)*100).toFixed(1)}%)`);
  console.log(`   ⏱️  性能测试: ${results.performance.successCount}/${results.performance.totalCount} (${((results.performance.successCount/results.performance.totalCount)*100).toFixed(1)}%)`);
  console.log(`   💬 前端接口: ${results.interface.successCount}/${results.interface.totalCount} (${((results.interface.successCount/results.interface.totalCount)*100).toFixed(1)}%)`);
  
  console.log(`\n🎯 最终评估:`);
  if (overallRate >= 90) {
    console.log(`   🎉 AI系统功能优秀！所有核心功能正常工作！`);
  } else if (overallRate >= 80) {
    console.log(`   ✅ AI系统功能良好！大部分核心功能正常工作！`);
  } else if (overallRate >= 70) {
    console.log(`   ⚠️  AI系统功能一般！部分功能需要优化`);
  } else {
    console.log(`   ❌ AI系统功能较差！需要进行全面修复`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`🎯 测试完成时间: ${new Date().toLocaleString()}`);
  console.log('='.repeat(80));
}

// 综合测试执行函数
async function runFullAITestSuite() {
  console.log('🚀 开始执行AI功能完整测试套件...');
  console.log(`🎯 测试目标: 验证AI系统的所有核心功能`);
  console.log(`⏰ 测试开始时间: ${new Date().toLocaleString()}`);
  
  // 1. 用户登录获取Token
  const token = await testUserLogin();
  if (!token) {
    console.log('❌ 无法获取认证Token，测试终止');
    return;
  }
  
  console.log(`✅ 认证成功，Token获取完成`);
  
  // 2. 执行各级处理测试
  const level1Result = await testLevel1DirectResponse(token);
  const level2Result = await testLevel2LightProcessing(token);
  const level3Result = await testLevel3ComplexProcessing(token);
  
  // 3. 执行工具调用测试
  const queryToolsResult = await testQueryTools(token);
  const taskToolsResult = await testTaskManagementTools(token);
  
  // 4. 执行安全机制测试
  const permissionResult = await testPermissionControl(token);
  
  // 5. 执行性能测试
  const performanceResult = await testResponseTime(token);
  
  // 6. 执行前端交互测试
  const interfaceResult = await testUnifiedChatInterface(token);
  
  // 7. 生成测试报告
  generateTestReport({
    level1: level1Result,
    level2: level2Result,
    level3: level3Result,
    queryTools: queryToolsResult,
    taskTools: taskToolsResult,
    permission: permissionResult,
    performance: performanceResult,
    interface: interfaceResult
  });
}

// 执行测试
runFullAITestSuite().catch(console.error);
