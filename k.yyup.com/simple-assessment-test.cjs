/**
 * 简化的测评API测试
 */

const axios = require('axios');

async function testSimpleAssessment() {
  try {
    console.log('🔍 开始简化测评API测试...');

    // 1. 测试登录
    console.log('\n📝 1. 测试登录...');
    const loginData = {
      username: "unauthorized",
      password: "123456"
    };

    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', loginData, {
      timeout: 10000
    });

    console.log('✅ 登录响应:', JSON.stringify(loginResponse.data, null, 2));

    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      console.log('✅ 获取到token');

      // 2. 测试获取我的测评记录
      console.log('\n📋 2. 获取我的测评记录...');
      try {
        const recordsResponse = await axios.get('http://localhost:3000/api/assessment/my-records', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          timeout: 10000
        });
        console.log('✅ 我的测评记录:', JSON.stringify(recordsResponse.data, null, 2));
      } catch (e) {
        console.log('ℹ️ 我的测评记录接口可能不存在:', e.message);
      }

      // 3. 测试获取成长轨迹
      console.log('\n📈 3. 获取成长轨迹...');
      try {
        const trajectoryResponse = await axios.get('http://localhost:3000/api/assessment/growth-trajectory', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          timeout: 10000
        });
        console.log('✅ 成长轨迹响应:', JSON.stringify(trajectoryResponse.data, null, 2));
      } catch (e) {
        console.log('ℹ️ 成长轨迹接口错误:', e.message);
      }

      // 4. 测试获取测评题目
      console.log('\n📚 4. 获取测评题目...');
      try {
        const questionsResponse = await axios.get('http://localhost:3000/api/assessment/questions?age=48', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          timeout: 10000
        });
        console.log('✅ 测评题目响应:', JSON.stringify(questionsResponse.data, null, 2));
      } catch (e) {
        console.log('ℹ️ 测评题目接口错误:', e.message);
      }

      console.log('\n🎉 简化测试完成！');
      console.log('📊 总结：');
      console.log('- 用户登录: ✅ 可用');
      console.log('- 测评记录API: ' + (trajectoryResponse.data !== undefined ? '✅ 可用' : '❌ 不可用'));
      console.log('- 成长轨迹API: ' + (trajectoryResponse.data !== undefined ? '✅ 可用' : '❌ 不可用'));
      console.log('- 题目获取API: ' + (questionsResponse.data !== undefined ? '✅ 可用' : '❌ 不可用'));

    } else {
      console.log('❌ 登录失败');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.log('💡 提示：服务器可能还没有完全启动，请稍后再试');
    } else if (error.response) {
      console.log('HTTP状态码:', error.response.status);
      console.log('响应:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// 运行测试
testSimpleAssessment();