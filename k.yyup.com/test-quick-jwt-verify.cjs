/**
 * 快速JWT安全验证测试
 * 验证修复后的JWT令牌验证逻辑
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_BASE = 'http://127.0.0.1:3000';
const JWT_SECRET = 'kindergarten-enrollment-secret';

async function quickJWTTest() {
  console.log('🔍 快速JWT安全验证测试...\n');

  // 测试用例
  const testCases = [
    {
      name: '过期令牌',
      token: jwt.sign(
        { userId: 121, username: 'admin', type: 'access' },
        JWT_SECRET,
        { expiresIn: '-1h' } // 已过期
      ),
      expectedStatus: 401
    },
    {
      name: '无效格式令牌',
      token: 'invalid.token.format',
      expectedStatus: 401
    },
    {
      name: '错误签名令牌',
      token: jwt.sign(
        { userId: 121, username: 'admin', type: 'access' },
        'wrong-secret',
        { expiresIn: '1h' }
      ),
      expectedStatus: 401
    },
    {
      name: '空令牌',
      token: '',
      expectedStatus: 401
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    console.log(`测试: ${testCase.name}`);

    try {
      const response = await axios.get(`${API_BASE}/api/auth/verify`, {
        headers: testCase.token ? { 'Authorization': `Bearer ${testCase.token}` } : {},
        timeout: 5000
      });

      if (response.status === 200) {
        console.log(`❌ 失败: ${testCase.name} - 应该被拒绝但成功了`);
        console.log(`   响应: ${JSON.stringify(response.data)}`);
      } else {
        console.log(`✅ 通过: ${testCase.name}`);
        passedTests++;
      }
    } catch (error) {
      if (error.response?.status === testCase.expectedStatus) {
        console.log(`✅ 通过: ${testCase.name} - 正确返回${error.response.status}错误`);
        passedTests++;
      } else {
        console.log(`❌ 失败: ${testCase.name} - 期望${testCase.expectedStatus}, 实际${error.response?.status}`);
      }
    }
  }

  console.log(`\n📊 测试结果: ${passedTests}/${totalTests} 通过`);
  console.log(`🎯 成功率: ${((passedTests/totalTests)*100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('🎉 JWT安全验证修复成功！');
    return true;
  } else {
    console.log('⚠️ JWT安全验证仍有问题');
    return false;
  }
}

// 运行测试
quickJWTTest().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('测试执行失败:', error);
  process.exit(1);
});