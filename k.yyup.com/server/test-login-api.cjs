const axios = require('axios');

async function testLoginAPI() {
  console.log('🧪 测试登录API');

  const loginData = {
    username: 'admin',
    password: '123456'
  };

  try {
    console.log('\n📡 发送登录请求...');
    console.log('请求URL: http://localhost:3000/api/auth/login');
    console.log('请求数据:', {
      username: loginData.username,
      password: '***'
    });

    const response = await axios.post('http://localhost:3000/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('\n✅ 登录成功！');
    console.log('响应状态:', response.status);
    console.log('响应数据:');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.success && response.data.data?.token) {
      console.log('\n🔑 获得Token:', response.data.data.token.substring(0, 50) + '...');

      // 测试使用token访问受保护的API
      console.log('\n🛡️ 测试Token验证...');
      const testResponse = await axios.get('http://localhost:3000/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${response.data.data.token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      console.log('✅ Token验证成功！API访问状态:', testResponse.status);
      console.log('响应数据:', JSON.stringify(testResponse.data, null, 2));

    }

  } catch (error) {
    console.error('\n❌ 登录测试失败');

    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
      console.error('响应头:', error.response.headers);
    } else if (error.request) {
      console.error('无响应 - 可能是服务器未运行或网络问题');
      console.error('请求URL: http://localhost:3000/api/auth/login');
    } else {
      console.error('请求配置错误:', error.message);
    }
  }
}

testLoginAPI();