/**
 * 简化测试令牌自动刷新功能
 */

const axios = require('axios');

const API_BASE = 'http://127.0.0.1:3000';

async function testTokenRefreshSimple() {
  try {
    console.log('🔍 简化测试令牌自动刷新功能...\n');

    // 使用家长快捷登录
    console.log('1. 使用家长快捷登录...');
    try {
      const loginResponse = await axios.post(`${API_BASE}/api/auth/parent-quick-login`, {
        phone: '13800138001'
      });

      if (loginResponse.data.success) {
        const { token } = loginResponse.data.data;
        console.log('✅ 家长快捷登录成功');
        console.log('Token:', token.substring(0, 50) + '...');

        // 测试认证API
        console.log('\n2. 测试需要认证的API...');
        try {
          const photoResponse = await axios.get(`${API_BASE}/api/photo-album/stats/overview`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (photoResponse.data.success) {
            console.log('✅ API调用成功，获取到数据:', photoResponse.data.data);
          } else {
            console.log('❌ API调用失败:', photoResponse.data.message);
          }
        } catch (error) {
          console.log('❌ API调用失败:', error.response?.data?.message || error.message);
          console.log('状态码:', error.response?.status);
          console.log('响应数据:', JSON.stringify(error.response?.data, null, 2));
        }
      } else {
        console.log('❌ 快捷登录失败:', loginResponse.data.message);
      }
    } catch (error) {
      console.log('❌ 快捷登录请求失败:', error.response?.data?.message || error.message);
      console.log('状态码:', error.response?.status);
      console.log('响应数据:', JSON.stringify(error.response?.data, null, 2));
    }

    console.log('\n🎉 测试完成');

  } catch (error) {
    console.error('❌ 测试过程发生错误:', error.message);
  }
}

// 运行测试
testTokenRefreshSimple();