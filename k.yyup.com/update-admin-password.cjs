/**
 * 通过服务器API更新用户密码
 */

const axios = require('axios');

async function updateAdminPassword() {
  try {
    console.log('🔧 通过API更新admin用户密码...');

    // 使用已有的teacher用户token来更新admin密码
    // 首先登录teacher用户获取token
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'teacher',
      password: '123456'
    });

    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      console.log('✅ 获取到token，开始更新用户密码');

      // 更新admin用户密码为123456（这个密码会被后端自动哈希）
      const updateResponse = await axios.put('http://localhost:3000/api/users/2', {
        password: '123456',
        realName: '系统管理员',
        email: 'admin@kindergarten.com'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (updateResponse.data.success) {
        console.log('✅ admin用户密码更新成功');
      } else {
        console.log('❌ admin用户密码更新失败:', updateResponse.data);
      }

      // 尝试查找并更新principal_1用户
      try {
        const searchResponse = await axios.get('http://localhost:3000/api/users?search=principal_1', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (searchResponse.data.success && searchResponse.data.data.items.length > 0) {
          const principalUserId = searchResponse.data.data.items[0].id;
          console.log(`找到principal_1用户，ID: ${principalUserId}`);

          const updatePrincipalResponse = await axios.put(`http://localhost:3000/api/users/${principalUserId}`, {
            password: '123456'
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (updatePrincipalResponse.data.success) {
            console.log('✅ principal_1用户密码更新成功');
          } else {
            console.log('❌ principal_1用户密码更新失败:', updatePrincipalResponse.data);
          }
        } else {
          console.log('未找到principal_1用户，尝试创建...');
          // 尝试创建principal_1用户
          const createPrincipalResponse = await axios.post('http://localhost:3000/api/users', {
            username: 'principal_1',
            password: '123456',
            email: 'principal_1@kindergarten.com',
            realName: '园长1',
            phone: '15010272076',
            status: 1
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (createPrincipalResponse.data.success) {
            console.log('✅ principal_1用户创建成功');
          } else {
            console.log('❌ principal_1用户创建失败:', createPrincipalResponse.data);
          }
        }
      } catch (error) {
        console.log('❌ 处理principal_1用户时出错:', error.response?.data || error.message);
      }

    } else {
      console.log('❌ 登录失败:', loginResponse.data);
    }

    console.log('\n🎉 密码更新完成！');
    console.log('📝 现在可以使用以下账号登录：');
    console.log('  Admin: username=admin, password=123456');
    console.log('  Principal: username=principal_1, password=123456');
    console.log('  Teacher: username=teacher, password=123456');
    console.log('  Parent: username=test_parent, password=123456');

  } catch (error) {
    console.error('❌ 更新密码失败:', error.response?.data || error.message);
  }
}

// 运行脚本
updateAdminPassword();