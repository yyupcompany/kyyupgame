/**
 * 完整的测评API测试
 */

const axios = require('axios');

async function testCompleteAssessment() {
  try {
    console.log('🔍 开始完整测评API测试...');

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

      // 2. 测试开始测评
      console.log('\n🚀 2. 测试开始测评...');
      try {
        const startAssessmentData = {
          childName: "测试小朋友",
          childAge: 48,
          childGender: "male",
          assessmentType: "comprehensive",
          phone: "13800138000"
        };

        const startResponse = await axios.post('http://localhost:3000/api/assessment/start', startAssessmentData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        console.log('✅ 开始测评响应:', JSON.stringify(startResponse.data, null, 2));
      } catch (e) {
        console.log('ℹ️ 开始测评接口错误:', e.response?.data || e.message);
      }

      // 3. 测试不同的获取题目参数
      console.log('\n📚 3. 测试获取测评题目（不同参数）...');

      // 尝试不同的参数组合
      const testParams = [
        { configId: 1, ageGroup: '48months', age: 48 },
        { configId: 1, ageGroup: '4years', age: 48 },
        { configId: 1, ageGroup: '4-6years', age: 48 },
        { configId: 1, ageGroup: '4-5', age: 48 },
        { configId: 2, ageGroup: '48months', age: 48 },
        { configId: 1, age: 48 }
      ];

      for (let i = 0; i < testParams.length; i++) {
        try {
          console.log(`\n  尝试参数组合 ${i + 1}:`, testParams[i]);
          const questionsResponse = await axios.get('http://localhost:3000/api/assessment/questions', {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            params: testParams[i],
            timeout: 10000
          });
          console.log('✅ 题目获取成功:', questionsResponse.data.success ? '成功' : '失败');
          if (questionsResponse.data.success) {
            console.log('📊 题目数量:', questionsResponse.data.data?.questions?.length || 0);
            break; // 如果成功就跳出循环
          }
        } catch (e) {
          console.log(`❌ 参数组合 ${i + 1} 失败:`, e.response?.data?.message || e.message);
        }
      }

      // 4. 测试获取我的测评记录
      console.log('\n📋 4. 获取我的测评记录...');
      try {
        const recordsResponse = await axios.get('http://localhost:3000/api/assessment/my-records', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          timeout: 10000
        });
        console.log('✅ 我的测评记录:', JSON.stringify(recordsResponse.data, null, 2));
      } catch (e) {
        console.log('ℹ️ 我的测评记录接口错误:', e.response?.data?.message || e.message);
      }

      // 5. 测试获取成长轨迹
      console.log('\n📈 5. 获取成长轨迹...');
      try {
        const trajectoryResponse = await axios.get('http://localhost:3000/api/assessment/growth-trajectory', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          timeout: 10000
        });
        console.log('✅ 成长轨迹响应:', JSON.stringify(trajectoryResponse.data, null, 2));
      } catch (e) {
        console.log('ℹ️ 成长轨迹接口错误:', e.response?.data?.message || e.message);
      }

      // 6. 测试其他可能的测评接口
      console.log('\n🔍 6. 测试其他可能的测评接口...');
      const otherEndpoints = [
        '/api/assessment/configs',
        '/api/assessment/dimensions',
        '/api/assessment/types',
        '/api/assessment/templates'
      ];

      for (const endpoint of otherEndpoints) {
        try {
          const response = await axios.get(`http://localhost:3000${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            timeout: 5000
          });
          console.log(`✅ ${endpoint}:`, response.data.success ? '存在' : '不存在');
        } catch (e) {
          console.log(`❌ ${endpoint}: 不存在或错误`);
        }
      }

      console.log('\n🎉 完整测试完成！');
      console.log('📊 测试总结：');
      console.log('- 用户登录: ✅ 可用');
      console.log('- 开始测评API: 需要进一步验证');
      console.log('- 题目获取API: 需要正确的参数组合');
      console.log('- 我的记录API: 需要进一步验证');
      console.log('- 成长轨迹API: 需要进一步验证');

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
testCompleteAssessment();