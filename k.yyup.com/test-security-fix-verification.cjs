/**
 * 安全问题修复验证测试
 * 专门验证令牌验证逻辑的安全性
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_BASE = 'http://127.0.0.1:3000';

class SecurityFixVerification {
  constructor() {
    this.testResults = [];
  }

  async testTokenValidation() {
    console.log('🔍 验证令牌验证逻辑的安全性...\n');

    const JWT_SECRET = 'kindergarten-enrollment-secret';

    // 测试用例
    const testCases = [
      {
        name: '过期令牌',
        token: jwt.sign(
          { userId: 121, username: 'admin', type: 'access' },
          JWT_SECRET,
          { expiresIn: '-1h' } // 已过期
        ),
        expectedStatus: 401,
        description: '应该拒绝过期的令牌'
      },
      {
        name: '无效格式令牌1',
        token: 'invalid.token.format',
        expectedStatus: 401,
        description: '应该拒绝无效格式的令牌'
      },
      {
        name: '无效格式令牌2',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.payload',
        expectedStatus: 401,
        description: '应该拒绝无效负载的令牌'
      },
      {
        name: '无效签名令牌',
        token: jwt.sign(
          { userId: 121, username: 'admin', type: 'access' },
          'wrong-secret',
          { expiresIn: '1h' }
        ),
        expectedStatus: 401,
        description: '应该拒绝错误签名的令牌'
      },
      {
        name: '空令牌',
        token: '',
        expectedStatus: 401,
        description: '应该拒绝空令牌'
      },
      {
        name: 'null令牌',
        token: null,
        expectedStatus: 401,
        description: '应该拒绝null令牌'
      }
    ];

    let allPassed = true;

    for (const testCase of testCases) {
      console.log(`\n测试: ${testCase.name}`);
      console.log(`描述: ${testCase.description}`);
      console.log(`令牌: ${testCase.token ? testCase.token.substring(0, 30) + '...' : 'null'}`);

      try {
        const response = await axios.get(`${API_BASE}/api/auth/verify`, {
          headers: testCase.token ? { 'Authorization': `Bearer ${testCase.token}` } : {},
          timeout: 5000
        });

        if (testCase.expectedStatus === 401) {
          if (response.status === 401 || (response.data && !response.data.success)) {
            console.log(`✅ 通过: ${testCase.name}`);
            this.addResult(testCase.name, true, '令牌被正确拒绝');
          } else {
            console.log(`❌ 失败: ${testCase.name} - 期望${testCase.expectedStatus}, 实际${response.status}`);
            console.log(`响应内容:`, JSON.stringify(response.data, null, 2));
            this.addResult(testCase.name, false, '令牌验证逻辑错误');
            allPassed = false;
          }
        } else {
          console.log(`❌ 失败: ${testCase.name} - 期望${testCase.expectedStatus}, 实际${response.status}`);
          this.addResult(testCase.name, false, '令牌验证逻辑错误');
          allPassed = false;
        }
      } catch (error) {
        if (error.response?.status === testCase.expectedStatus) {
          console.log(`✅ 通过: ${testCase.name} - 正确返回${testCase.expectedStatus}错误`);
          this.addResult(testCase.name, true, '令牌被正确拒绝');
        } else {
          console.log(`❌ 失败: ${testCase.name} - 期望${testCase.expectedStatus}, 实际${error.response?.status}`);
          this.addResult(testCase.name, false, `返回错误状态: ${error.response?.status}`);
          allPassed = false;
        }
      }
    }

    return allPassed;
  }

  async testLoginEndpointSecurity() {
    console.log('\n🔐 测试登录端点的安全性...');

    const loginTestCases = [
      {
        name: '缺少用户名',
        payload: { password: 'password123' },
        expectedStatus: 400
      },
      {
        name: '缺少密码',
        payload: { username: 'admin' },
        expectedStatus: 400
      },
      {
        name: '空用户名密码',
        payload: { username: '', password: '' },
        expectedStatus: 400
      },
      {
        name: 'SQL注入尝试',
        payload: {
          username: "admin'; DROP TABLE users; --",
          password: "password"
        },
        expectedStatus: 401
      },
      {
        name: 'XSS尝试',
        payload: {
          username: '<script>alert("xss")</script>',
          password: 'password123'
        },
        expectedStatus: 401
      },
      {
        name: '过长的用户名',
        payload: {
          username: 'a'.repeat(1000),
          password: 'password123'
        },
        expectedStatus: 400
      }
    ];

    let allPassed = true;

    for (const testCase of loginTestCases) {
      console.log(`\n测试: ${testCase.name}`);

      try {
        const response = await axios.post(`${API_BASE}/api/auth/login`, testCase.payload, {
          timeout: 5000
        });

        if (response.data.success) {
          console.log(`❌ 失败: ${testCase.name} - 登录应该被拒绝但成功了`);
          this.addResult(testCase.name, false, '登录安全检查失败');
          allPassed = false;
        } else {
          console.log(`✅ 通过: ${testCase.name} - 登录被正确拒绝`);
          this.addResult(testCase.name, true, '登录安全检查通过');
        }
      } catch (error) {
        const status = error.response?.status;
        if (status === testCase.expectedStatus || status === 401) {
          console.log(`✅ 通过: ${testCase.name} - 正确返回${status}错误`);
          this.addResult(testCase.name, true, '登录安全检查通过');
        } else {
          console.log(`❌ 失败: ${testCase.name} - 期望${testCase.expectedStatus}, 实际${status}`);
          this.addResult(testCase.name, false, `返回错误状态: ${status}`);
          allPassed = false;
        }
      }
    }

    return allPassed;
  }

  async testPermissionIsolation() {
    console.log('\n🔒 测试权限隔离...');

    // 创建不同角色的令牌
    const adminToken = jwt.sign(
      { userId: 1, username: 'admin', roles: ['admin', 'super_admin'], type: 'access' },
      'kindergarten-enrollment-secret',
      { expiresIn: '1h' }
    );

    const teacherToken = jwt.sign(
      { userId: 2, username: 'teacher', roles: ['teacher'], type: 'access' },
      'kindergarten-enrollment-secret',
      { expiresIn: '1h' }
    );

    const parentToken = jwt.sign(
      { userId: 3, username: 'parent', roles: ['parent'], type: 'access' },
      'kindergarten-enrollment-secret',
      { expiresIn: '1h' }
    );

    const testScenarios = [
      {
        name: '教师访问管理员API',
        token: teacherToken,
        endpoints: ['/api/users', '/api/roles'],
        shouldFail: true
      },
      {
        name: '家长访问管理员API',
        token: parentToken,
        endpoints: ['/api/users', '/api/roles'],
        shouldFail: true
      },
      {
        name: '家长访问教师API',
        token: parentToken,
        endpoints: ['/api/classes'],
        shouldFail: true
      },
      {
        name: '管理员访问所有API',
        token: adminToken,
        endpoints: ['/api/users', '/api/roles', '/api/classes'],
        shouldFail: false
      }
    ];

    let allPassed = true;

    for (const scenario of testScenarios) {
      console.log(`\n测试: ${scenario.name}`);

      for (const endpoint of scenario.endpoints) {
        try {
          const response = await axios.get(`${API_BASE}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${scenario.token}` },
            timeout: 5000
          });

          if (scenario.shouldFail) {
            console.log(`❌ 失败: ${endpoint} - 权限检查失败，应该被拒绝但成功了`);
            console.log(`响应状态: ${response.status}`);
            this.addResult(scenario.name, false, `权限泄露: ${endpoint}`);
            allPassed = false;
          } else {
            console.log(`✅ 通过: ${endpoint} - 权限检查正常`);
          }
        } catch (error) {
          const status = error.response?.status;
          if (scenario.shouldFail && (status === 403 || status === 401)) {
            console.log(`✅ 通过: ${endpoint} - 权限被正确拒绝`);
          } else if (!scenario.shouldFail && status !== 403 && status !== 401) {
            console.log(`✅ 通过: ${endpoint} - 权限检查正常`);
          } else {
            console.log(`❌ 失败: ${endpoint} - 权限检查异常`);
            this.addResult(scenario.name, false, `权限检查异常: ${status}`);
            allPassed = false;
          }
        }
      }
    }

    return allPassed;
  }

  async testSessionSecurity() {
    console.log('\n🔐 测试会话安全性...');

    // 测试会话固定化攻击防护
    try {
      // 先获取一个有效令牌
      const validToken = jwt.sign(
        { userId: 121, username: 'admin', type: 'access' },
        'kindergarten-enrollment-secret',
        { expiresIn: '1h' }
      );

      // 使用有效令牌验证API
      const response1 = await axios.get(`${API_BASE}/api/auth/verify`, {
        headers: { 'Authorization': `Bearer ${validToken}` }
      });

      if (response1.data.success) {
        console.log('✅ 有效令牌验证通过');

        // 立即重复使用相同令牌（测试会话固定化）
        const response2 = await axios.get(`${API_BASE}/api/auth/verify`, {
          headers: { 'Authorization': `Bearer ${validToken}` }
        });

        if (response2.data.success) {
          console.log('✅ 会话令牌重复使用正常（这是预期的）');
        } else {
          console.log('❌ 会话令牌重复验证失败');
        }

        // 测试不同会话间的隔离
        const anotherValidToken = jwt.sign(
          { userId: 999, username: 'anotheruser', type: 'access' },
          'kindergarten-enrollment-secret',
          { expiresIn: '1h' }
        );

        const response3 = await axios.get(`${API_BASE}/api/auth/verify`, {
          headers: { 'Authorization': `Bearer ${anotherValidToken}` }
        });

        if (response3.data.success) {
          console.log('✅ 不同会话令牌验证正常');
        } else {
          console.log('❌ 不同会话令牌验证失败');
        }

        this.addResult('会话安全', true, '会话安全性测试通过');
        return true;
      } else {
        console.log('❌ 有效令牌验证失败');
        this.addResult('会话安全', false, '有效令牌验证失败');
        return false;
      }
    } catch (error) {
      console.log('❌ 会话安全测试异常:', error.message);
      this.addResult('会话安全', false, error.message);
      return false;
    }
  }

  addResult(testName, success, message) {
    this.testResults.push({
      test: testName,
      success,
      message,
      timestamp: new Date().toISOString()
    });
  }

  generateSecurityReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🛡️ 安全问题验证报告');
    console.log('='.repeat(60));

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;

    console.log(`\n📊 安全测试统计:`);
    console.log(`  总测试数: ${totalTests}`);
    console.log(`  通过: ${passedTests}`);
    console.log(`  失败: ${failedTests}`);
    console.log(`  成功率: ${((passedTests/totalTests)*100).toFixed(1)}%`);

    console.log(`\n📝 详细结果:`);
    this.testResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.test}`);
      if (!result.success) {
        console.log(`   安全问题: ${result.message}`);
      }
    });

    console.log(`\n🔒 安全评估:`);
    const securityScore = (passedTests/totalTests)*100;

    if (securityScore >= 90) {
      console.log('  🟢 安全性评估: 优秀');
    } else if (securityScore >= 70) {
      console.log('  🟡 安全性评估: 良好');
    } else if (securityScore >= 50) {
      console.log('  🟠 安全性评估: 需要改进');
    } else {
      console.log('  🔴 安全性评估: 严重问题');
    }

    console.log(`  安全得分: ${securityScore.toFixed(1)}/100`);

    // 保存报告
    const reportData = {
      timestamp: new Date().toISOString(),
      type: 'Security Verification Report',
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        score: securityScore
      },
      results: this.testResults,
      recommendations: this.getRecommendations()
    };

    const fs = require('fs');
    fs.writeFileSync('security-verification-report.json', JSON.stringify(reportData, null, 2));
    console.log(`\n📁 安全报告已保存到: security-verification-report.json`);

    return reportData;
  }

  getRecommendations() {
    const recommendations = [];

    const failedTests = this.testResults.filter(r => !r.success);

    failedTests.forEach(test => {
      if (test.test.includes('令牌')) {
        recommendations.push('修复令牌验证逻辑，确保严格验证JWT格式和签名');
      }
      if (test.test.includes('登录')) {
        recommendations.push('加强登录端点输入验证，防止注入攻击');
      }
      if (test.test.includes('权限')) {
        recommendations.push('完善权限检查机制，防止越权访问');
      }
      if (test.test.includes('会话')) {
        recommendations.push('检查会话管理机制的安全性');
      }
    });

    // 去重建议
    const uniqueRecommendations = [...new Set(recommendations)];
    return uniqueRecommendations;
  }

  async runSecurityTests() {
    console.log('🛡️ 开始执行安全验证测试...\n');

    try {
      const tokenValidation = await this.testTokenValidation();
      const loginSecurity = await this.testLoginEndpointSecurity();
      const permissionIsolation = await this.testPermissionIsolation();
      const sessionSecurity = await this.testSessionSecurity();

      const report = this.generateSecurityReport();

      // 根据安全得分决定退出码
      if (report.summary.score >= 90) {
        console.log('\n🟢 安全验证通过！安全得分:', report.summary.score.toFixed(1) + '/100');
        return { success: true, score: report.summary.score };
      } else if (report.summary.score >= 70) {
        console.log('\n🟡 安全验证部分通过，建议改进。安全得分:', report.summary.score.toFixed(1) + '/100');
        return { success: false, score: report.summary.score };
      } else {
        console.log('\n🔴 安全验证失败，存在严重安全问题！安全得分:', report.summary.score.toFixed(1) + '/100');
        return { success: false, score: report.summary.score, critical: true };
      }
    } catch (error) {
      console.error('❌ 安全验证测试失败:', error);
      return { success: false, score: 0, critical: true };
    }
  }
}

// 运行安全验证
async function runSecurityVerification() {
  const verifier = new SecurityFixVerification();
  const result = await verifier.runSecurityTests();

  // 根据结果设置退出码
  if (result.success) {
    process.exit(0);
  } else if (result.critical) {
    console.log('\n🚨 发现严重安全问题，请立即修复！');
    process.exit(2);
  } else {
    console.log('\n⚠️ 发现安全问题，建议修复后重新测试');
    process.exit(1);
  }
}

runSecurityVerification();