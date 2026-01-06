/**
 * 测试后端重启后的403错误问题
 */

const axios = require('axios');

const API_BASE = 'http://127.0.0.1:3000';

async function test403AfterRestart() {
  try {
    console.log('🔍 测试后端重启后的403错误问题...\n');

    // 步骤1: 模拟前端存储的token（通常来自localStorage）
    console.log('1. 模拟前端存储的token...');

    // 创建一个模拟的有效JWT token（24小时有效期）
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = 'kindergarten-enrollment-secret'; // 与后端相同的secret

    const mockPayload = {
      userId: 121,
      username: 'admin',
      type: 'access',
      iat: Math.floor(Date.now() / 1000), // 当前时间
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24小时后过期
    };

    const mockToken = jwt.sign(mockPayload, JWT_SECRET);
    console.log('✅ 创建模拟token:', mockToken.substring(0, 50) + '...');

    // 模拟前端存储
    console.log('模拟前端localStorage存储:');
    console.log('- kindergarten_token:', mockToken.substring(0, 30) + '...');
    console.log('- kindergarten_user_info: {"username":"admin","role":"admin"...}');
    console.log('');

    // 步骤2: 测试需要认证的API
    console.log('2. 测试需要认证的API...');
    try {
      const photoResponse = await axios.get(`${API_BASE}/api/photo-album/stats/overview`, {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (photoResponse.data.success) {
        console.log('✅ API调用成功:', photoResponse.data.data);
      } else {
        console.log('❌ API调用失败:', photoResponse.data.message);
      }
    } catch (error) {
      console.log('❌ API调用失败:', error.response?.status);
      console.log('错误信息:', error.response?.data?.message);
      console.log('详细错误:', JSON.stringify(error.response?.data, null, 2));

      // 分析403错误的原因
      if (error.response?.status === 403) {
        console.log('\n🔍 403错误分析:');
        console.log('403错误通常表示:');
        console.log('1. 用户已认证但权限不足');
        console.log('2. 权限检查中间件checkPermission失败');
        console.log('3. 用户角色或权限数据库记录丢失');

        // 检查具体是哪个权限导致的403
        if (error.response?.data?.details?.requiredPermission) {
          console.log('缺少的权限:', error.response?.data?.details?.requiredPermission);
        }
      }

      if (error.response?.status === 401) {
        console.log('\n🔍 401错误分析:');
        console.log('401错误通常表示:');
        console.log('1. Token无效或过期');
        console.log('2. JWT验证失败');
        console.log('3. 用户不存在或被禁用');
      }
    }

    // 步骤3: 测试token验证接口
    console.log('\n3. 测试token验证接口...');
    try {
      const verifyResponse = await axios.get(`${API_BASE}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (verifyResponse.data.success) {
        console.log('✅ Token验证成功:', verifyResponse.data.data.user);
      } else {
        console.log('❌ Token验证失败:', verifyResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Token验证失败:', error.response?.status);
      console.log('错误信息:', error.response?.data?.message);
    }

    // 步骤4: 测试获取用户信息
    console.log('\n4. 测试获取用户信息...');
    try {
      const userResponse = await axios.get(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (userResponse.data.success) {
        console.log('✅ 获取用户信息成功:', userResponse.data.data);
      } else {
        console.log('❌ 获取用户信息失败:', userResponse.data.message);
      }
    } catch (error) {
      console.log('❌ 获取用户信息失败:', error.response?.status);
      console.log('错误信息:', error.response?.data?.message);
    }

    console.log('\n🎯 解决方案建议:');
    console.log('1. 检查后端重启后Redis会话状态是否丢失');
    console.log('2. 验证JWT_SECRET环境变量是否保持一致');
    console.log('3. 确认数据库连接正常，用户角色权限数据完整');
    console.log('4. 考虑在认证中间件中增强Redis连接失败时的处理逻辑');
    console.log('5. 前端可以添加更强的错误恢复机制');

  } catch (error) {
    console.error('❌ 测试过程发生错误:', error.message);
  }
}

// 运行测试
test403AfterRestart();