/**
 * 更新默认AI模型为1.6版本
 * 将AI助手配置为使用最新的1.6大模型
 */

import axios from 'axios';

// 配置
const BASE_URL = 'http://localhost:3000';

// 测试用户凭据
const TEST_USER = {
  username: 'admin',
  password: 'admin123'
};

let authToken = '';

/**
 * 登录获取token
 */
async function login() {
  try {
    console.log('🔐 正在登录...');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, TEST_USER);
    
    if (response.data.success && response.data.data?.token) {
      authToken = response.data.data.token;
      console.log('✅ 登录成功');
      return true;
    } else if (response.data.token) {
      authToken = response.data.token;
      console.log('✅ 登录成功 (旧格式)');
      return true;
    } else {
      console.error('❌ 登录失败:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ 登录错误:', error.response?.data || error.message);
    return false;
  }
}

/**
 * 获取所有AI模型
 */
async function getAllModels() {
  try {
    console.log('\n🤖 获取所有AI模型...');
    const response = await axios.get(`${BASE_URL}/api/ai/models`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ 获取到模型列表');
    return response.data;
  } catch (error) {
    console.error('❌ 获取模型失败:', error.response?.data || error.message);
    return null;
  }
}

/**
 * 查找1.6模型
 */
function find16Models(models) {
  const models16 = models.filter(model => 
    model.name.includes('1.6') || model.name.includes('1-6')
  );
  
  console.log('\n🔍 找到的1.6模型:');
  models16.forEach(model => {
    console.log(`- ID: ${model.id}, Name: ${model.name}, Display: ${model.displayName}`);
    console.log(`  Provider: ${model.provider}, Status: ${model.status}, Default: ${model.isDefault}`);
    console.log(`  Capabilities: ${model.capabilities ? model.capabilities.join(', ') : 'N/A'}`);
    console.log(`  Created: ${model.createdAt}`);
    console.log('');
  });
  
  return models16;
}

/**
 * 选择最佳的1.6模型
 */
function selectBest16Model(models16) {
  // 优先选择支持thinking模式的模型
  const thinkingModel = models16.find(model => 
    model.name.includes('thinking') && model.status === 'active'
  );
  
  if (thinkingModel) {
    console.log(`🎯 选择支持思考模式的模型: ${thinkingModel.name} (ID: ${thinkingModel.id})`);
    return thinkingModel;
  }
  
  // 其次选择最新创建的活跃模型
  const activeModels = models16.filter(model => model.status === 'active');
  if (activeModels.length > 0) {
    const latestModel = activeModels.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )[0];
    console.log(`🎯 选择最新的活跃模型: ${latestModel.name} (ID: ${latestModel.id})`);
    return latestModel;
  }
  
  console.log('❌ 没有找到合适的1.6模型');
  return null;
}

/**
 * 更新模型为默认
 */
async function setAsDefault(modelId) {
  try {
    console.log(`\n🔄 设置模型 ${modelId} 为默认模型...`);
    
    // 首先取消所有模型的默认状态
    const allModels = await getAllModels();
    for (const model of allModels) {
      if (model.isDefault) {
        console.log(`📝 取消模型 ${model.name} (ID: ${model.id}) 的默认状态`);
        await axios.put(`${BASE_URL}/api/system/ai-models/${model.id}`, {
          isDefault: false
        }, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
      }
    }

    // 设置新的默认模型
    const response = await axios.put(`${BASE_URL}/api/system/ai-models/${modelId}`, {
      isDefault: true
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ 默认模型设置成功');
    return response.data;
  } catch (error) {
    console.error('❌ 设置默认模型失败:', error.response?.data || error.message);
    return null;
  }
}

/**
 * 验证更新结果
 */
async function verifyUpdate() {
  try {
    console.log('\n🔍 验证更新结果...');
    const models = await getAllModels();
    const defaultModel = models.find(model => model.isDefault);
    
    if (defaultModel) {
      console.log('✅ 当前默认模型:');
      console.log(`- ID: ${defaultModel.id}`);
      console.log(`- Name: ${defaultModel.name}`);
      console.log(`- Display: ${defaultModel.displayName}`);
      console.log(`- Provider: ${defaultModel.provider}`);
      console.log(`- Status: ${defaultModel.status}`);
      console.log(`- Capabilities: ${defaultModel.capabilities ? defaultModel.capabilities.join(', ') : 'N/A'}`);
      return true;
    } else {
      console.log('❌ 没有找到默认模型');
      return false;
    }
  } catch (error) {
    console.error('❌ 验证失败:', error.response?.data || error.message);
    return false;
  }
}

/**
 * 测试AI助手功能
 */
async function testAIAssistant() {
  try {
    console.log('\n🧪 测试AI助手功能...');
    
    // 创建对话
    const conversationResponse = await axios.post(`${BASE_URL}/api/ai/conversations`, {
      title: '测试1.6模型对话'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (conversationResponse.data.success) {
      const conversationId = conversationResponse.data.data.id;
      console.log(`✅ 创建对话成功, ID: ${conversationId}`);
      
      // 发送测试消息
      const messageResponse = await axios.post(`${BASE_URL}/api/ai/conversations/${conversationId}/messages`, {
        content: '你好，请介绍一下你的功能和能力',
        context: {
          thinkingMode: true,
          webSearchEnabled: false
        }
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (messageResponse.data.success) {
        console.log('✅ AI对话测试成功');
        console.log('🤖 AI回复:', messageResponse.data.data?.content?.substring(0, 200) + '...');
        return true;
      } else {
        console.log('❌ AI对话测试失败:', messageResponse.data);
        return false;
      }
    } else {
      console.log('❌ 创建对话失败:', conversationResponse.data);
      return false;
    }
  } catch (error) {
    console.error('❌ AI助手测试失败:', error.response?.data || error.message);
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始更新AI模型配置...\n');
  
  // 1. 登录
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('❌ 登录失败，无法继续');
    return;
  }
  
  // 2. 获取所有模型
  const allModels = await getAllModels();
  if (!allModels) {
    console.error('❌ 获取模型列表失败');
    return;
  }
  
  // 3. 查找1.6模型
  const models16 = find16Models(allModels);
  if (models16.length === 0) {
    console.error('❌ 没有找到1.6模型');
    return;
  }
  
  // 4. 选择最佳模型
  const bestModel = selectBest16Model(models16);
  if (!bestModel) {
    console.error('❌ 没有找到合适的1.6模型');
    return;
  }
  
  // 5. 设置为默认
  const updateSuccess = await setAsDefault(bestModel.id);
  if (!updateSuccess) {
    console.error('❌ 设置默认模型失败');
    return;
  }
  
  // 6. 验证更新
  const verifySuccess = await verifyUpdate();
  if (!verifySuccess) {
    console.error('❌ 验证更新失败');
    return;
  }
  
  // 7. 测试AI助手
  const testSuccess = await testAIAssistant();
  
  console.log('\n🎉 AI模型配置更新完成！');
  console.log('\n📋 总结:');
  console.log(`- 选择的模型: ${bestModel.name} (ID: ${bestModel.id})`);
  console.log(`- 设置默认: ${updateSuccess ? '✅ 成功' : '❌ 失败'}`);
  console.log(`- 验证更新: ${verifySuccess ? '✅ 成功' : '❌ 失败'}`);
  console.log(`- AI助手测试: ${testSuccess ? '✅ 成功' : '❌ 失败'}`);
  
  if (testSuccess) {
    console.log('\n🎯 AI助手现在已配置为使用1.6模型，支持:');
    console.log('- 📄 文档上传和分析');
    console.log('- 🖼️ 图片识别和理解');
    console.log('- 💬 智能对话');
    console.log('- 🛠️ 工具调用');
    console.log('- 🧠 思考模式');
  }
}

// 运行主函数
main().catch(console.error);
