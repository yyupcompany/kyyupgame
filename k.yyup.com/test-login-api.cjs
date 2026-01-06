const axios = require('axios');

async function testLoginAPI() {
  try {
    console.log('🔐 测试登录API...');

    const response = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: '123456'
    }, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ 登录API调用成功');
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ 登录API调用失败');
    if (error.response) {
      console.log('状态码:', error.response.status);
      console.log('错误数据:', error.response.data);
    } else {
      console.log('错误信息:', error.message);
    }
  }
}

testLoginAPI();