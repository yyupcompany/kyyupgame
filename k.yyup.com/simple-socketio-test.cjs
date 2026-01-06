#!/usr/bin/env node

/**
 * 简单的Socket.IO连接测试
 */

const axios = require('axios');

console.log('🧪 简单Socket.IO测试开始...\n');

// 测试配置
const API_BASE = 'http://localhost:3000';

// 1. 检查后端服务
async function checkBackend() {
  console.log('🔍 检查后端服务...');
  
  try {
    const response = await axios.get(`${API_BASE}/health`);
    console.log('✅ 后端服务正常');
    console.log(`📊 状态: ${response.data.status}`);
    return true;
  } catch (error) {
    console.log('❌ 后端服务不可达:', error.message);
    return false;
  }
}

// 2. 检查Socket.io端点
async function checkSocketEndpoint() {
  console.log('\n🔍 检查Socket.io端点...');
  
  try {
    const response = await axios.get(`${API_BASE}/socket.io/`);
    console.log('✅ Socket.io端点可访问');
    return true;
  } catch (error) {
    console.log('❌ Socket.io端点不可访问:', error.message);
    console.log('📝 这可能意味着Socket.io服务未启动');
    return false;
  }
}

// 3. 检查AI相关端点
async function checkAIEndpoints() {
  console.log('\n🔍 检查AI相关端点...');
  
  const endpoints = [
    '/api/ai/health',
    '/api/ai/models',
    '/api/ai/chat'
  ];
  
  let successCount = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${API_BASE}${endpoint}`);
      console.log(`✅ ${endpoint} - 可访问`);
      successCount++;
    } catch (error) {
      console.log(`❌ ${endpoint} - ${error.response?.status || error.message}`);
    }
  }
  
  console.log(`📊 AI端点检查结果: ${successCount}/${endpoints.length}`);
  return successCount;
}

// 主测试函数
async function runSimpleTest() {
  console.log('🚀 开始简单Socket.io测试...\n');
  
  try {
    // 1. 检查后端
    const backendOk = await checkBackend();
    if (!backendOk) {
      console.log('\n❌ 后端服务不可用，测试终止');
      return;
    }
    
    // 2. 检查Socket.io
    const socketOk = await checkSocketEndpoint();
    
    // 3. 检查AI端点
    const aiEndpoints = await checkAIEndpoints();
    
    // 总结
    console.log('\n' + '='.repeat(50));
    console.log('📊 测试总结:');
    console.log(`🔧 后端服务: ${backendOk ? '✅ 正常' : '❌ 异常'}`);
    console.log(`🔌 Socket.io: ${socketOk ? '✅ 正常' : '❌ 异常'}`);
    console.log(`🤖 AI端点: ${aiEndpoints}/3 可用`);
    
    if (backendOk && socketOk && aiEndpoints >= 1) {
      console.log('\n🎉 基础服务检查通过！');
      console.log('💡 建议: 可以继续进行AI助手功能测试');
    } else {
      console.log('\n⚠️  部分服务存在问题');
      console.log('💡 建议: 检查服务配置和启动状态');
    }
    
  } catch (error) {
    console.error('\n❌ 测试执行失败:', error.message);
  }
}

// 启动测试
runSimpleTest().then(() => {
  console.log('\n✅ 简单Socket.io测试完成');
}).catch((error) => {
  console.error('\n❌ 测试失败:', error);
});
