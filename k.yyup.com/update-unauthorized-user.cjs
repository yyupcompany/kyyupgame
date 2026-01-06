/**
 * 更新unauthorized用户的密码为123456
 */

const axios = require('axios');

async function updateUnauthorizedUser() {
  try {
    console.log('🔧 更新unauthorized用户密码...');

    // 使用teacher用户token
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'teacher',
      password: '123456'
    });

    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      console.log('✅ 获取到token');

      // 更新用户ID为2的用户（unauthorized用户）
      const updateResponse = await axios.put('http://localhost:3000/api/users/2', {
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
        console.log('✅ unauthorized用户密码更新成功');

        // 测试登录
        console.log('\n🔍 测试unauthorized用户登录...');
        const testLoginResponse = await axios.post('http://localhost:3000/api/auth/login', {
          username: 'unauthorized',
          password: '123456'
        });

        if (testLoginResponse.data.success) {
          console.log('✅ unauthorized用户登录成功！');
          console.log('用户信息:', {
            id: testLoginResponse.data.data.user.id,
            username: testLoginResponse.data.data.user.username,
            realName: testLoginResponse.data.data.user.realName,
            role: testLoginResponse.data.data.user.role,
            isAdmin: testLoginResponse.data.data.user.isAdmin
          });
        } else {
          console.log('❌ unauthorized用户登录失败:', testLoginResponse.data);
        }

      } else {
        console.log('❌ unauthorized用户密码更新失败:', updateResponse.data);
      }

      // 同时更新principal_2用户
      console.log('\n🔧 更新principal_2用户密码...');
      const updatePrincipalResponse = await axios.put('http://localhost:3000/api/users/3', {
        password: '123456',
        realName: '园长',
        email: 'principal_2@kindergarten.com',
        phone: '15010272076'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (updatePrincipalResponse.data.success) {
        console.log('✅ principal_2用户密码更新成功');
      } else {
        console.log('❌ principal_2用户密码更新失败:', updatePrincipalResponse.data);
      }

    } else {
      console.log('❌ 登录失败:', loginResponse.data);
    }

    console.log('\n🎉 用户密码更新完成！');
    console.log('📝 现在可以使用以下快捷登录：');
    console.log('  系统管理员: username=unauthorized, password=123456');
    console.log('  园长: username=principal_2, password=123456');
    console.log('  教师: username=teacher, password=123456');
    console.log('  家长: username=test_parent, password=123456');

  } catch (error) {
    console.error('❌ 更新用户密码失败:', error.response?.data || error.message);
  }
}

// 运行脚本
updateUnauthorizedUser();