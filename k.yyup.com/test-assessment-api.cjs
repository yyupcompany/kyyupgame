/**
 * 测试家长测评API
 */

const axios = require('axios');

async function testAssessmentAPI() {
  try {
    console.log('🔍 开始测试家长测评API...');

    // 1. 先登录获取token
    console.log('\n📝 1. 登录获取token...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'unauthorized',
      password: '123456'
    });

    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      console.log('✅ 登录成功，获取到token');

      // 2. 开始测评
      console.log('\n🚀 2. 开始测评...');
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
        }
      });

      console.log('✅ 开始测评响应:');
      console.log(JSON.stringify(startResponse.data, null, 2));

      if (startResponse.data.success && startResponse.data.data.recordId) {
        const recordId = startResponse.data.data.recordId;
        console.log(`📋 获取到测评记录ID: ${recordId}`);

        // 3. 获取测评题目
        console.log('\n📚 3. 获取测评题目...');
        const questionsResponse = await axios.get('http://localhost:3000/api/assessment/questions?age=48', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('✅ 获取题目响应:');
        console.log(JSON.stringify(questionsResponse.data, null, 2));

        // 4. 提交模拟答案
        console.log('\n✍️ 4. 提交模拟答案...');
        const mockAnswers = [
          {
            questionId: "q1",
            answer: "A",
            score: 4,
            timeSpent: 15
          },
          {
            questionId: "q2",
            answer: "B",
            score: 3,
            timeSpent: 20
          }
        ];

        const answerResponse = await axios.post(`http://localhost:3000/api/assessment/answer/${recordId}`, {
          answers: mockAnswers
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ 提交答案响应:');
        console.log(JSON.stringify(answerResponse.data, null, 2));

        // 5. 完成测评
        console.log('\n🎯 5. 完成测评...');
        const completeResponse = await axios.post(`http://localhost:3000/api/assessment/${recordId}/complete`, {
          completionNotes: "测试完成"
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ 完成测评响应:');
        console.log(JSON.stringify(completeResponse.data, null, 2));

        // 6. 获取测评报告
        console.log('\n📊 6. 获取测评报告...');
        const reportResponse = await axios.get(`http://localhost:3000/api/assessment/report/${recordId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('✅ 测评报告响应:');
        console.log(JSON.stringify(reportResponse.data, null, 2));

        // 7. 获取成长轨迹
        console.log('\n📈 7. 获取成长轨迹...');
        const trajectoryResponse = await axios.get('http://localhost:3000/api/assessment/growth-trajectory', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('✅ 成长轨迹响应:');
        console.log(JSON.stringify(trajectoryResponse.data, null, 2));

        // 8. 获取我的测评记录
        console.log('\n📋 8. 获取我的测评记录...');
        const recordsResponse = await axios.get('http://localhost:3000/api/assessment/my-records', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('✅ 我的测评记录响应:');
        console.log(JSON.stringify(recordsResponse.data, null, 2));

        console.log('\n🎉 测评API测试完成！');

      } else {
        console.log('❌ 开始测评失败:', startResponse.data);
      }
    } else {
      console.log('❌ 登录失败:', loginResponse.data);
    }

  } catch (error) {
    console.error('❌ 测试过程中出错:');
    if (error.response) {
      console.log('状态码:', error.response.status);
      console.log('响应数据:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('错误信息:', error.message);
    }
  }
}

// 运行测试
testAssessmentAPI();