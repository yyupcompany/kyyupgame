/**
 * 修复admin用户的用户名和密码
 */

const axios = require('axios');

async function fixAdminUser() {
  try {
    console.log('🔧 修复admin用户...');

    // 使用teacher用户token
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'teacher',
      password: '123456'
    });

    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      console.log('✅ 获取到token');

      // 更新用户ID为2的用户（也就是unauthorized用户）
      const updateResponse = await axios.put('http://localhost:3000/api/users/2', {
        username: 'admin',
        password: '123456',
        realName: '系统管理员',
        email: 'admin@kindergarten.com',
        phone: '13800138001'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (updateResponse.data.success) {
        console.log('✅ admin用户修复成功');

        // 验证修复后的登录
        console.log('\n🔍 验证admin登录...');
        const testLoginResponse = await axios.post('http://localhost:3000/api/auth/login', {
          username: 'admin',
          password: '123456'
        });

        if (testLoginResponse.data.success) {
          console.log('✅ admin登录验证成功！');
          console.log('用户信息:', {
            id: testLoginResponse.data.data.user.id,
            username: testLoginResponse.data.data.user.username,
            realName: testLoginResponse.data.data.user.realName,
            role: testLoginResponse.data.data.user.role,
            isAdmin: testLoginResponse.data.data.user.isAdmin
          });
        } else {
          console.log('❌ admin登录验证失败:', testLoginResponse.data);
        }

      } else {
        console.log('❌ admin用户修复失败:', updateResponse.data);
      }

    } else {
      console.log('❌ 登录失败:', loginResponse.data);
    }

  } catch (error) {
    console.error('❌ 修复admin用户失败:', error.response?.data || error.message);
  }
}

// 运行脚本
fixAdminUser();