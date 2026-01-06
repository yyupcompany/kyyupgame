const axios = require('axios');
const mysql = require('mysql2');

// 配置API基础URL
const API_BASE_URL = 'http://localhost:3000';

// 创建数据库连接
const dbConnection = mysql.createConnection({
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
});

/**
 * 演示后端API真实交互
 * 展示完整的登录->权限验证->AI交互流程
 */
async function demonstrateAPIInteraction() {
  console.log('🚀 开始演示后端API真实交互...\n');

  let authToken = null;
  
  try {
    // 步骤1: 用户登录
    console.log('📋 步骤1: 用户登录');
    console.log('发送登录请求...');
    
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log(`✅ 登录成功! 状态码: ${loginResponse.status}`);
    authToken = loginResponse.data.data.token;
    console.log(`🔑 获取到Token: ${authToken.substring(0, 20)}...`);
    
    // 步骤2: 验证用户权限
    console.log('\n📋 步骤2: 验证用户权限');
    console.log('检查用户是否有AI_ASSISTANT_USE权限...');
    
    const permissionResponse = await axios.post(`${API_BASE_URL}/api/permissions/check-page`, {
      path: '/ai'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ 权限验证成功! 状态码: ${permissionResponse.status}`);
    console.log(`🔐 权限验证结果: ${JSON.stringify(permissionResponse.data, null, 2)}`);
    
    // 步骤3: 获取用户信息
    console.log('\n📋 步骤3: 获取用户信息');
    console.log('请求用户详细信息...');
    
    const userResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ 用户信息获取成功! 状态码: ${userResponse.status}`);
    console.log(`👤 用户信息: ${JSON.stringify(userResponse.data.data, null, 2)}`);
    
    // 步骤4: 获取AI模型列表
    console.log('\n📋 步骤4: 获取AI模型列表');
    console.log('请求可用的AI模型...');
    
    const modelsResponse = await axios.get(`${API_BASE_URL}/api/ai/models`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ AI模型列表获取成功! 状态码: ${modelsResponse.status}`);
    console.log(`🤖 可用AI模型: ${JSON.stringify(modelsResponse.data.data, null, 2)}`);
    
    // 步骤5: 获取AI对话列表
    console.log('\n📋 步骤5: 获取AI对话列表');
    console.log('请求用户的对话历史...');
    
    const conversationsResponse = await axios.get(`${API_BASE_URL}/api/ai/conversations`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ 对话列表获取成功! 状态码: ${conversationsResponse.status}`);
    console.log(`📚 对话列表: ${JSON.stringify(conversationsResponse.data.data, null, 2)}`);
    
    // 步骤6: 创建新的AI对话
    console.log('\n📋 步骤6: 创建新的AI对话');
    console.log('创建新的AI对话会话...');
    
    const newConversationResponse = await axios.post(`${API_BASE_URL}/api/ai/conversations`, {
      title: '测试对话 - ' + new Date().toISOString(),
      model: 'gpt-3.5-turbo',
      system_prompt: '你是一个专业的幼儿园管理助手，请用中文回答问题。'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ 新对话创建成功! 状态码: ${newConversationResponse.status}`);
    console.log(`💬 新对话信息: ${JSON.stringify(newConversationResponse.data.data, null, 2)}`);
    
    // 步骤7: 测试AI代理分发
    console.log('\n📋 步骤7: 测试AI代理分发');
    console.log('测试AI代理分发功能...');
    
    const agentResponse = await axios.post(`${API_BASE_URL}/api/ai/agent/dispatch`, {
      message: '你好，请介绍一下你的功能。',
      agentType: 'general',
      conversationId: newConversationResponse.data.data.id
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ AI代理分发成功! 状态码: ${agentResponse.status}`);
    console.log(`🤖 代理回复: ${JSON.stringify(agentResponse.data, null, 2)}`);
    
    // 步骤8: 测试AI记忆功能
    console.log('\n📋 步骤8: 测试AI记忆功能');
    console.log('测试AI记忆管理...');
    
    const memoryResponse = await axios.get(`${API_BASE_URL}/api/ai/memories`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ AI记忆获取成功! 状态码: ${memoryResponse.status}`);
    console.log(`🧠 记忆列表: ${JSON.stringify(memoryResponse.data.data, null, 2)}`);
    
    // 步骤9: 数据库验证
    console.log('\n📋 步骤9: 数据库验证');
    console.log('验证数据库中的权限配置...');
    
    dbConnection.connect((err) => {
      if (err) {
        console.error('❌ 数据库连接失败:', err);
        return;
      }
      
      console.log('✅ 数据库连接成功');
      
      // 验证权限配置
      dbConnection.query(
        "SELECT * FROM permissions WHERE code = 'AI_ASSISTANT_USE'",
        (err, results) => {
          if (err) {
            console.error('❌ 权限查询失败:', err);
          } else {
            console.log('🔐 AI_ASSISTANT_USE权限配置:');
            console.log(JSON.stringify(results, null, 2));
          }
          
          dbConnection.end();
        }
      );
    });
    
    console.log('\n🎉 API交互演示完成!');
    console.log('📊 演示总结:');
    console.log('- ✅ 用户登录认证');
    console.log('- ✅ 权限验证');
    console.log('- ✅ 用户信息获取');
    console.log('- ✅ AI模型列表获取');
    console.log('- ✅ AI对话列表查询');
    console.log('- ✅ AI对话创建');
    console.log('- ✅ AI代理分发');
    console.log('- ✅ AI记忆管理');
    console.log('- ✅ 数据库权限验证');
    
  } catch (error) {
    console.error('❌ API交互过程中发生错误:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      console.log('🔒 认证失败，请检查用户凭据');
    } else if (error.response?.status === 403) {
      console.log('🚫 权限不足，请检查用户权限配置');
    } else if (error.response?.status === 404) {
      console.log('🔍 API端点不存在，请检查路由配置');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('📡 无法连接到后端服务，请确保服务器运行在 localhost:3000');
    }
  }
}

// 运行演示
demonstrateAPIInteraction();