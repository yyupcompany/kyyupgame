/**
 * 测试令牌自动刷新功能
 */

const axios = require('axios');

const API_BASE = 'http://127.0.0.1:3000';

async function testTokenRefresh() {
  try {
    console.log('🔍 开始测试令牌自动刷新功能...\n');

    // 步骤1: 模拟用户登录获取token
    console.log('1. 模拟用户登录...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      username: 'admin',
      password: 'password123'
    });

    if (!loginResponse.data.success) {
      console.error('❌ 登录失败:', loginResponse.data.message);
      return;
    }

    const { token, refreshToken } = loginResponse.data.data;
    console.log('✅ 登录成功，获取到token和refreshToken');
    console.log('Token:', token.substring(0, 50) + '...');
    console.log('RefreshToken:', refreshToken ? refreshToken.substring(0, 50) + '...' : 'null');
    console.log('');

    // 步骤2: 测试当前token是否有效
    console.log('2. 测试当前token有效性...');
    try {
      const verifyResponse = await axios.get(`${API_BASE}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (verifyResponse.data.success) {
        console.log('✅ 当前token有效');
      } else {
        console.log('❌ 当前token无效:', verifyResponse.data.message);
      }
    } catch (error) {
      console.log('❌ token验证失败:', error.response?.data?.message || error.message);
    }
    console.log('');

    // 步骤3: 测试需要认证的API
    console.log('3. 测试需要认证的API (相册统计)...');
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
    }
    console.log('');

    // 步骤4: 测试refresh token功能
    if (refreshToken) {
      console.log('4. 测试refresh token功能...');
      try {
        const refreshResponse = await axios.post(`${API_BASE}/api/auth/refresh-token`, {
          refreshToken: refreshToken
        });

        if (refreshResponse.data.success) {
          console.log('✅ Token刷新成功');
          console.log('新Token:', refreshResponse.data.data.token.substring(0, 50) + '...');

          // 测试新token是否有效
          console.log('5. 测试新token有效性...');
          try {
            const newVerifyResponse = await axios.get(`${API_BASE}/api/auth/verify`, {
              headers: {
                'Authorization': `Bearer ${refreshResponse.data.data.token}`
              }
            });

            if (newVerifyResponse.data.success) {
              console.log('✅ 新token有效');
            } else {
              console.log('❌ 新token无效:', newVerifyResponse.data.message);
            }
          } catch (error) {
            console.log('❌ 新token验证失败:', error.response?.data?.message || error.message);
          }
        } else {
          console.log('❌ Token刷新失败:', refreshResponse.data.message);
        }
      } catch (error) {
        console.log('❌ Token刷新请求失败:', error.response?.data?.message || error.message);
      }
    } else {
      console.log('4. ❌ 没有获取到refreshToken，无法测试刷新功能');
    }
    console.log('');

    // 步骤6: 测试令牌过期场景 (使用无效token)
    console.log('6. 测试无效token场景...');
    try {
      const invalidResponse = await axios.get(`${API_BASE}/api/photo-album/stats/overview`, {
        headers: {
          'Authorization': 'Bearer invalid_token_12345'
        }
      });

      console.log('❌ 无效token竟然通过了验证');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ 无效token被正确拒绝');
      } else {
        console.log('❌ 意外错误:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n🎉 令牌自动刷新测试完成');

  } catch (error) {
    console.error('❌ 测试过程发生错误:', error.message);
  }
}

// 运行测试
testTokenRefresh();