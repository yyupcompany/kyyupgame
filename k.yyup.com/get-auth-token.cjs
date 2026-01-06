#!/usr/bin/env node

const axios = require('axios');

// 创建axios实例，直接连接后端
const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function getAuthToken() {
  try {
    console.log('🔐 获取认证token...\n');
    
    // 测试后端连接
    console.log('1. 测试后端连接...');
    const healthResponse = await api.get('/health');
    console.log('✅ 后端连接正常:', healthResponse.data);
    
    // 尝试登录获取token
    console.log('\n2. 尝试登录获取token...');
    const loginResponse = await api.post('/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    if (loginResponse.data.success && loginResponse.data.data.token) {
      const token = loginResponse.data.data.token;
      const user = loginResponse.data.data.user;
      
      console.log('✅ 登录成功！');
      console.log('👤 用户信息:', {
        id: user.id,
        username: user.username,
        real_name: user.real_name,
        role: user.role
      });
      console.log('🎫 Token:', token.substring(0, 50) + '...');
      
      // 输出浏览器控制台命令
      console.log('\n📋 请在浏览器控制台中执行以下命令来设置token:');
      console.log('━'.repeat(80));
      console.log(`localStorage.setItem('kindergarten_token', '${token}');`);
      console.log(`localStorage.setItem('kindergarten_user_info', '${JSON.stringify(user)}');`);
      console.log('location.reload();');
      console.log('━'.repeat(80));
      
      return token;
    } else {
      console.error('❌ 登录失败:', loginResponse.data);
      return null;
    }
    
  } catch (error) {
    console.error('❌ 获取token失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    return null;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  getAuthToken();
}

module.exports = { getAuthToken };
