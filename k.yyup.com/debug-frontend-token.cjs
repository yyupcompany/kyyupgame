/**
 * 调试前端存储的token状态
 */

const axios = require('axios');

const API_BASE = 'http://127.0.0.1:3000';

async function debugFrontendToken() {
  try {
    console.log('🔍 调试前端token状态问题...\n');

    // 步骤1: 检查用户前端页面是否可以访问
    console.log('1. 检查前端页面状态...');
    try {
      const frontendResponse = await axios.get('http://127.0.0.1:5173/parent-center/photo-album', {
        timeout: 5000
      });
      console.log('✅ 前端页面可访问，状态码:', frontendResponse.status);
    } catch (error) {
      console.log('❌ 前端页面不可访问:', error.message);
      if (error.code === 'ECONNREFUSED') {
        console.log('💡 前端服务可能未启动，请检查client服务');
      }
    }

    // 步骤2: 测试登录API获取真实token
    console.log('\n2. 测试真实登录获取token...');
    try {
      // 先测试是否存在admin用户
      const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
        username: 'admin',
        password: 'password123'
      });

      if (loginResponse.data.success) {
        const { token, refreshToken, user } = loginResponse.data.data;
        console.log('✅ 登录成功，获取到真实token');
        console.log('Token:', token.substring(0, 50) + '...');
        console.log('RefreshToken:', refreshToken ? refreshToken.substring(0, 50) + '...' : 'null');
        console.log('用户信息:', user);

        // 测试这个真实token
        console.log('\n3. 测试真实token...');
        try {
          const testResponse = await axios.get(`${API_BASE}/api/photo-album/stats/overview`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (testResponse.data.success) {
            console.log('✅ 真实token工作正常:', testResponse.data.data);
          } else {
            console.log('❌ 真实token失败:', testResponse.data.message);
          }
        } catch (error) {
          console.log('❌ 真实token测试失败:', error.response?.status, error.response?.data?.message);
        }

        return token; // 返回这个token供进一步测试
      } else {
        console.log('❌ 登录失败:', loginResponse.data.message);
      }
    } catch (error) {
      console.log('❌ 登录请求失败:', error.response?.status);
      console.log('错误信息:', error.response?.data?.message || error.message);

      if (error.response?.status === 401) {
        console.log('💡 可能的原因:');
        console.log('1. 数据库中没有admin用户');
        console.log('2. admin用户密码不正确');
        console.log('3. 数据库连接问题');
      }
    }

    // 步骤3: 尝试创建模拟token并验证
    console.log('\n4. 创建并测试模拟token...');
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = 'kindergarten-enrollment-secret';

    // 创建一个当前时间戳的token
    const currentPayload = {
      userId: 121,
      username: 'admin',
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    };

    const currentToken = jwt.sign(currentPayload, JWT_SECRET);
    console.log('创建当前token:', currentToken.substring(0, 50) + '...');

    try {
      const currentTestResponse = await axios.get(`${API_BASE}/api/photo-album/stats/overview`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });

      if (currentTestResponse.data.success) {
        console.log('✅ 当前token工作正常');
      } else {
        console.log('❌ 当前token失败:', currentTestResponse.data.message);
      }
    } catch (error) {
      console.log('❌ 当前token测试失败:', error.response?.status, error.response?.data?.message);

      if (error.response?.status === 403) {
        console.log('\n🔍 403错误详细分析:');
        console.log('这表明用户认证通过了，但是权限检查失败');
        console.log('可能的原因:');
        console.log('1. 用户角色权限记录在数据库中丢失');
        console.log('2. Redis会话状态不一致');
        console.log('3. 权限中间件逻辑问题');
      }
    }

    console.log('\n🎯 问题诊断建议:');
    console.log('1. 检查前端localStorage中的token是否过期或格式错误');
    console.log('2. 清除浏览器缓存和localStorage后重新登录');
    console.log('3. 检查后端日志中认证中间件的详细输出');
    console.log('4. 验证数据库中用户角色权限数据完整性');
    console.log('5. 检查Redis服务状态和会话存储');

  } catch (error) {
    console.error('❌ 调试过程发生错误:', error.message);
  }
}

// 运行调试
debugFrontendToken();