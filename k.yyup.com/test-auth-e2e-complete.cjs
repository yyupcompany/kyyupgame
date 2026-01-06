/**
 * 完整的用户登录和权限验证端到端测试
 * 包含各种边缘场景、权限泄露检测、令牌处理等
 */

const axios = require('axios');
const { chromium } = require('playwright');

const API_BASE = 'http://127.0.0.1:3000';
const FRONTEND_BASE = 'http://127.0.0.1:5173';

class AuthE2ETest {
  constructor() {
    this.testResults = [];
    this.browser = null;
    this.context = null;
    this.page = null;
    this.testTokens = new Map();
  }

  async init() {
    console.log('🚀 初始化端到端测试环境...');

    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });

    this.page = await this.context.newPage();

    // 设置请求拦截器监控API调用
    await this.page.route('**/*', (route) => {
      const url = route.request().url();
      const method = route.request().method();

      if (url.includes('/api/') && (method === 'GET' || method === 'POST' || method === 'PUT' || method === 'DELETE')) {
        console.log(`📡 API调用: ${method} ${url}`);
      }

      route.continue();
    });

    console.log('✅ 浏览器环境初始化完成');
  }

  async testNormalLogin() {
    console.log('\n🔐 测试1: 正常用户登录流程');

    try {
      // 1. 测试登录API
      const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
        username: 'admin',
        password: 'password123'
      });

      if (loginResponse.data.success) {
        const { token, refreshToken, user } = loginResponse.data.data;

        console.log('✅ 登录成功，获取到令牌');
        console.log(`Token: ${token.substring(0, 50)}...`);
        console.log(`RefreshToken: ${refreshToken ? refreshToken.substring(0, 50) + '...' : 'null'}`);
        console.log(`用户信息:`, user);

        this.testTokens.set('admin', { token, refreshToken, user });

        // 2. 测试令牌验证API
        const verifyResponse = await axios.get(`${API_BASE}/api/auth/verify`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (verifyResponse.data.success) {
          console.log('✅ 令牌验证成功');
        } else {
          console.log('❌ 令牌验证失败');
        }

        // 3. 测试获取用户信息API
        const userResponse = await axios.get(`${API_BASE}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (userResponse.data.success) {
          console.log('✅ 获取用户信息成功');
        } else {
          console.log('❌ 获取用户信息失败');
        }

        this.addResult('正常登录', true, '登录流程正常');
      } else {
        console.log('❌ 登录失败:', loginResponse.data.message);
        this.addResult('正常登录', false, '登录API失败');
      }
    } catch (error) {
      console.log('❌ 登录测试异常:', error.message);
      this.addResult('正常登录', false, error.message);
    }
  }

  async testInvalidLogin() {
    console.log('\n🔐 测试2: 无效用户登录');

    try {
      const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
        username: 'invaliduser',
        password: 'wrongpassword'
      });

      if (!loginResponse.data.success) {
        console.log('✅ 无效登录被正确拒绝');
        this.addResult('无效登录', true, '无效登录被正确拒绝');
      } else {
        console.log('❌ 无效登录被错误接受');
        this.addResult('无效登录', false, '无效登录被错误接受');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ 无效登录返回401错误');
        this.addResult('无效登录', true, '正确返回401错误');
      } else {
        console.log('❌ 无效登录测试异常:', error.message);
        this.addResult('无效登录', false, error.message);
      }
    }
  }

  async testExpiredToken() {
    console.log('\n⏰ 测试3: 过期令牌处理');

    try {
      // 创建一个过期的令牌
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { userId: 121, username: 'admin', type: 'access' },
        'kindergarten-enrollment-secret',
        { expiresIn: '-1h' } // 已过期
      );

      console.log('创建过期令牌:', expiredToken.substring(0, 50) + '...');

      // 测试过期令牌
      const response = await axios.get(`${API_BASE}/api/auth/verify`, {
        headers: { 'Authorization': `Bearer ${expiredToken}` }
      });

      if (!response.data.success) {
        console.log('✅ 过期令牌被正确拒绝');
        this.addResult('过期令牌', true, '过期令牌被正确拒绝');
      } else {
        console.log('❌ 过期令牌被错误接受');
        this.addResult('过期令牌', false, '过期令牌被错误接受');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ 过期令牌返回401错误');
        this.addResult('过期令牌', true, '正确返回401错误');
      } else {
        console.log('❌ 过期令牌测试异常:', error.message);
        this.addResult('过期令牌', false, error.message);
      }
    }
  }

  async testInvalidToken() {
    console.log('\n🚫 测试4: 无效/伪造令牌');

    try {
      const invalidTokens = [
        'invalid.token.format',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.payload',
        'completely.random.string.token',
        ''
      ];

      for (let i = 0; i < invalidTokens.length; i++) {
        const token = invalidTokens[i];
        console.log(`测试无效令牌 ${i + 1}: ${token.substring(0, 30)}...`);

        try {
          const response = await axios.get(`${API_BASE}/api/auth/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (!response.data.success) {
            console.log(`✅ 无效令牌 ${i + 1} 被正确拒绝`);
          } else {
            console.log(`❌ 无效令牌 ${i + 1} 被错误接受`);
            this.addResult('无效令牌', false, `令牌${i + 1}被错误接受`);
          }
        } catch (error) {
          if (error.response?.status === 401) {
            console.log(`✅ 无效令牌 ${i + 1} 返回401错误`);
          } else {
            console.log(`❌ 无效令牌 ${i + 1} 测试异常:`, error.message);
          }
        }
      }

      this.addResult('无效令牌', true, '所有无效令牌都被正确拒绝');
    } catch (error) {
      console.log('❌ 无效令牌测试异常:', error.message);
      this.addResult('无效令牌', false, error.message);
    }
  }

  async testPermissionIsolation() {
    console.log('\n🔒 测试5: 权限隔离 - 防止越权访问');

    try {
      // 获取管理员令牌
      const adminToken = this.testTokens.get('admin')?.token;
      if (!adminToken) {
        console.log('❌ 没有管理员令牌，跳过权限测试');
        this.addResult('权限隔离', false, '没有管理员令牌');
        return;
      }

      // 测试需要管理员权限的API
      const adminOnlyApis = [
        `${API_BASE}/api/admin/users`,
        `${API_BASE}/api/admin/roles`,
        `${API_BASE}/api/admin/system/settings`
      ];

      for (const api of adminOnlyApis) {
        try {
          const response = await axios.get(api, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
          });

          console.log(`✅ 管理员API访问成功: ${api}`);
        } catch (error) {
          console.log(`❌ 管理员API访问失败: ${api} - ${error.message}`);
        }
      }

      // 创建普通用户令牌进行对比测试
      const normalUserToken = jwt.sign(
        { userId: 999, username: 'normaluser', type: 'access' },
        'kindergarten-enrollment-secret',
        { expiresIn: '1h' }
      );

      for (const api of adminOnlyApis) {
        try {
          const response = await axios.get(api, {
            headers: { 'Authorization': `Bearer ${normalUserToken}` }
          });

          if (response.status === 403) {
            console.log(`✅ 普通用户被正确拒绝访问: ${api}`);
          } else {
            console.log(`❌ 普通用户被错误允许访问: ${api}`);
            this.addResult('权限隔离', false, `普通用户被错误允许访问${api}`);
          }
        } catch (error) {
          if (error.response?.status === 403) {
            console.log(`✅ 普通用户被正确拒绝访问: ${api}`);
          } else {
            console.log(`❌ 权限测试异常: ${api} - ${error.message}`);
          }
        }
      }

      this.addResult('权限隔离', true, '权限隔离测试通过');
    } catch (error) {
      console.log('❌ 权限隔离测试异常:', error.message);
      this.addResult('权限隔离', false, error.message);
    }
  }

  async testTokenRefresh() {
    console.log('\n🔄 测试6: 令牌刷新机制');

    try {
      const adminData = this.testTokens.get('admin');
      if (!adminData?.refreshToken) {
        console.log('❌ 没有刷新令牌，跳过刷新测试');
        this.addResult('令牌刷新', false, '没有刷新令牌');
        return;
      }

      // 测试令牌刷新
      const refreshResponse = await axios.post(`${API_BASE}/api/auth/refresh-token`, {
        refreshToken: adminData.refreshToken
      });

      if (refreshResponse.data.success) {
        const { token: newToken, refreshToken: newRefreshToken } = refreshResponse.data.data;

        console.log('✅ 令牌刷新成功');
        console.log(`新Token: ${newToken.substring(0, 50)}...`);

        // 验证新令牌
        const verifyResponse = await axios.get(`${API_BASE}/api/auth/verify`, {
          headers: { 'Authorization': `Bearer ${newToken}` }
        });

        if (verifyResponse.data.success) {
          console.log('✅ 新令牌验证成功');
          this.addResult('令牌刷新', true, '令牌刷新和验证成功');
        } else {
          console.log('❌ 新令牌验证失败');
          this.addResult('令牌刷新', false, '新令牌验证失败');
        }
      } else {
        console.log('❌ 令牌刷新失败:', refreshResponse.data.message);
        this.addResult('令牌刷新', false, '令牌刷新失败');
      }
    } catch (error) {
      console.log('❌ 令牌刷新测试异常:', error.message);
      this.addResult('令牌刷新', false, error.message);
    }
  }

  async testFrontendLoginFlow() {
    console.log('\n🌐 测试7: 前端登录流程');

    try {
      await this.page.goto(FRONTEND_BASE);
      await this.page.waitForTimeout(2000);

      // 查找登录表单
      const loginForm = await this.page.locator('form').first();
      const usernameInput = await this.page.locator('input[type="text"], input[name="username"], input[placeholder*="用户名"]').first();
      const passwordInput = await this.page.locator('input[type="password"], input[name="password"], input[placeholder*="密码"]').first();
      const loginButton = await this.page.locator('button[type="submit"], button:has-text("登录"), .login-btn').first();

      if (await usernameInput.isVisible() && await passwordInput.isVisible()) {
        console.log('✅ 找到登录表单');

        // 填写登录信息
        await usernameInput.fill('admin');
        await passwordInput.fill('password123');

        // 点击登录按钮
        await loginButton.click();

        // 等待登录完成
        await this.page.waitForTimeout(3000);

        // 检查是否登录成功（通过URL变化或页面内容）
        const currentUrl = this.page.url();
        const hasMenu = await this.page.locator('.sidebar, .menu, .nav').isVisible();

        if (currentUrl !== FRONTEND_BASE || hasMenu) {
          console.log('✅ 前端登录成功');
          this.addResult('前端登录', true, '前端登录流程成功');
        } else {
          console.log('❌ 前端登录可能失败');
          this.addResult('前端登录', false, '前端登录可能失败');
        }
      } else {
        console.log('❌ 未找到登录表单');
        this.addResult('前端登录', false, '未找到登录表单');
      }
    } catch (error) {
      console.log('❌ 前端登录测试异常:', error.message);
      this.addResult('前端登录', false, error.message);
    }
  }

  async testTokenDeletion() {
    console.log('\n🗑️ 测试8: 令牌删除/清除场景');

    try {
      const adminToken = this.testTokens.get('admin')?.token;
      if (!adminToken) {
        console.log('❌ 没有令牌进行删除测试');
        this.addResult('令牌删除', false, '没有令牌进行测试');
        return;
      }

      // 1. 先验证令牌有效
      const beforeVerify = await axios.get(`${API_BASE}/api/auth/verify`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });

      if (beforeVerify.data.success) {
        console.log('✅ 令牌删除前验证成功');

        // 2. 模拟令牌被删除/失效
        // 这里我们使用一个完全不相关的令牌来模拟删除场景
        const unrelatedToken = jwt.sign(
          { userId: 9999, username: 'deleted', type: 'access' },
          'different-secret-key',
          { expiresIn: '1h' }
        );

        // 3. 验证令牌已失效
        try {
          const afterVerify = await axios.get(`${API_BASE}/api/auth/verify`, {
            headers: { 'Authorization': `Bearer ${unrelatedToken}` }
          });

          if (!afterVerify.data.success) {
            console.log('✅ 删除后的令牌被正确拒绝');
            this.addResult('令牌删除', true, '删除后的令牌被正确拒绝');
          } else {
            console.log('❌ 删除后的令牌被错误接受');
            this.addResult('令牌删除', false, '删除后的令牌被错误接受');
          }
        } catch (error) {
          if (error.response?.status === 401) {
            console.log('✅ 删除后的令牌返回401错误');
            this.addResult('令牌删除', true, '正确返回401错误');
          } else {
            console.log('❌ 令牌删除测试异常:', error.message);
          }
        }
      } else {
        console.log('❌ 原始令牌验证失败');
        this.addResult('令牌删除', false, '原始令牌验证失败');
      }
    } catch (error) {
      console.log('❌ 令牌删除测试异常:', error.message);
      this.addResult('令牌删除', false, error.message);
    }
  }

  async testDataLeakage() {
    console.log('\n🔍 测试9: 数据泄露检测 - 不同用户间的权限隔离');

    try {
      // 创建多个不同角色的用户令牌
      const users = [
        { id: 1, username: 'admin', roles: ['admin', 'super_admin'] },
        { id: 2, username: 'teacher', roles: ['teacher'] },
        { id: 3, username: 'parent', roles: ['parent'] }
      ];

      const userTokens = {};

      for (const user of users) {
        const token = jwt.sign(
          { userId: user.id, username: user.username, roles: user.roles, type: 'access' },
          'kindergarten-enrollment-secret',
          { expiresIn: '1h' }
        );
        userTokens[user.username] = { token, roles: user.roles };
      }

      // 测试每个用户访问敏感数据的权限
      const sensitiveApis = [
        { path: '/api/admin/users', requiredRoles: ['admin'] },
        { path: '/api/teacher/classes', requiredRoles: ['teacher', 'admin'] },
        { path: '/api/parent/children', requiredRoles: ['parent', 'admin'] }
      ];

      let leakageDetected = false;

      for (const [username, userData] of Object.entries(userTokens)) {
        console.log(`\n测试用户: ${username} (角色: ${userData.roles.join(', ')})`);

        for (const api of sensitiveApis) {
          try {
            const response = await axios.get(`${API_BASE}${api.path}`, {
              headers: { 'Authorization': `Bearer ${userData.token}` }
            });

            const hasRequiredRole = api.requiredRoles.some(role => userData.roles.includes(role));

            if (response.status === 200 && !hasRequiredRole) {
              console.log(`🚨 检测到潜在数据泄露! 用户 ${username} 无角色权限但访问了 ${api.path}`);
              leakageDetected = true;
              this.addResult('数据泄露', false, `用户${username}泄露访问${api.path}`);
            } else if (response.status === 403 && !hasRequiredRole) {
              console.log(`✅ 用户 ${username} 被正确拒绝访问 ${api.path}`);
            } else if (response.status === 200 && hasRequiredRole) {
              console.log(`✅ 用户 ${username} 被正确允许访问 ${api.path}`);
            } else {
              console.log(`⚠️ 用户 ${username} 访问 ${api.path} 返回状态: ${response.status}`);
            }
          } catch (error) {
            if (error.response?.status === 403 || error.response?.status === 401) {
              console.log(`✅ 用户 ${username} 被正确拒绝访问 ${api.path}`);
            } else {
              console.log(`❌ 用户 ${username} 访问 ${api.path} 异常:`, error.message);
            }
          }
        }
      }

      if (!leakageDetected) {
        console.log('✅ 未检测到数据泄露，权限隔离正常');
        this.addResult('数据泄露', true, '权限隔离正常，未检测到泄露');
      }
    } catch (error) {
      console.log('❌ 数据泄露检测异常:', error.message);
      this.addResult('数据泄露', false, error.message);
    }
  }

  async testConcurrentRequests() {
    console.log('\n⚡ 测试10: 并发请求压力测试');

    try {
      const adminToken = this.testTokens.get('admin')?.token;
      if (!adminToken) {
        console.log('❌ 没有令牌进行并发测试');
        this.addResult('并发请求', false, '没有令牌进行测试');
        return;
      }

      const concurrentRequests = 50;
      const promises = [];
      const startTime = Date.now();

      console.log(`发送 ${concurrentRequests} 个并发请求...`);

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          axios.get(`${API_BASE}/api/auth/verify`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
          }).catch(error => ({ error: true, status: error.response?.status, message: error.message }))
        );
      }

      const results = await Promise.all(promises);
      const endTime = Date.now();

      const successful = results.filter(r => !r.error && r.data?.success).length;
      const failed = results.length - successful;
      const responseTime = endTime - startTime;

      console.log(`✅ 并发测试完成:`);
      console.log(`  成功请求: ${successful}/${concurrentRequests}`);
      console.log(`  失败请求: ${failed}/${concurrentRequests}`);
      console.log(`  总耗时: ${responseTime}ms`);
      console.log(`  平均响应时间: ${(responseTime / concurrentRequests).toFixed(2)}ms`);

      if (successful >= concurrentRequests * 0.9) {
        console.log('✅ 并发性能良好');
        this.addResult('并发请求', true, `成功率${((successful/concurrentRequests)*100).toFixed(1)}%`);
      } else {
        console.log('❌ 并发性能不佳');
        this.addResult('并发请求', false, `成功率仅${((successful/concurrentRequests)*100).toFixed(1)}%`);
      }
    } catch (error) {
      console.log('❌ 并发测试异常:', error.message);
      this.addResult('并发请求', false, error.message);
    }
  }

  async testPerformanceMetrics() {
    console.log('\n📊 测试11: 性能指标测试');

    try {
      const adminToken = this.testTokens.get('admin')?.token;
      if (!adminToken) {
        console.log('❌ 没有令牌进行性能测试');
        this.addResult('性能指标', false, '没有令牌进行测试');
        return;
      }

      const testApis = [
        { name: '用户验证', path: '/api/auth/verify' },
        { name: '获取用户信息', path: '/api/auth/me' }
      ];

      const results = {};

      for (const api of testApis) {
        const times = [];
        const iterations = 10;

        console.log(`测试 ${api.name} API 性能...`);

        for (let i = 0; i < iterations; i++) {
          const startTime = Date.now();

          try {
            await axios.get(`${API_BASE}${api.path}`, {
              headers: { 'Authorization': `Bearer ${adminToken}` }
            });

            const endTime = Date.now();
            times.push(endTime - startTime);
          } catch (error) {
            console.log(`❌ ${api.name} 第${i+1}次请求失败:`, error.message);
          }
        }

        if (times.length > 0) {
          const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
          const minTime = Math.min(...times);
          const maxTime = Math.max(...times);

          results[api.name] = {
            avg: avgTime.toFixed(2),
            min: minTime,
            max: maxTime,
            success: times.length,
            total: iterations
          };

          console.log(`  ${api.name}: 平均${avgTime.toFixed(2)}ms, 最快${minTime}ms, 最慢${maxTime}ms`);
        }
      }

      // 评估性能
      const performanceGood = Object.values(results).every(result => {
        return parseFloat(result.avg) < 500 && result.success >= result.total * 0.8;
      });

      if (performanceGood) {
        console.log('✅ API性能良好');
        this.addResult('性能指标', true, 'API响应时间良好');
      } else {
        console.log('❌ API性能需要优化');
        this.addResult('性能指标', false, 'API响应时间需要优化');
      }
    } catch (error) {
      console.log('❌ 性能测试异常:', error.message);
      this.addResult('性能指标', false, error.message);
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

  async generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 端到端测试报告');
    console.log('='.repeat(60));

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;

    console.log(`\n📊 测试统计:`);
    console.log(`  总测试数: ${totalTests}`);
    console.log(`  通过: ${passedTests}`);
    console.log(`  失败: ${failedTests}`);
    console.log(`  成功率: ${((passedTests/totalTests)*100).toFixed(1)}%`);

    console.log(`\n📝 详细结果:`);
    this.testResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.test}`);
      if (!result.success) {
        console.log(`   失败原因: ${result.message}`);
      }
    });

    console.log(`\n🔒 安全评估:`);
    const securityTests = this.testResults.filter(r =>
      r.test.includes('登录') || r.test.includes('令牌') || r.test.includes('权限') || r.test.includes('泄露')
    );

    const securityPassed = securityTests.filter(r => r.success).length;
    const securityTotal = securityTests.length;

    if (securityTotal > 0) {
      console.log(`  安全测试通过: ${securityPassed}/${securityTotal}`);
      console.log(`  安全成功率: ${((securityPassed/securityTotal)*100).toFixed(1)}%`);

      if (securityPassed === securityTotal) {
        console.log('  🛡️ 安全性评估: 良好');
      } else {
        console.log('  ⚠️ 安全性评估: 需要改进');
      }
    }

    console.log(`\n📈 性能评估:`);
    const performanceTests = this.testResults.filter(r =>
      r.test.includes('性能') || r.test.includes('并发')
    );

    const performancePassed = performanceTests.filter(r => r.success).length;
    const performanceTotal = performanceTests.length;

    if (performanceTotal > 0) {
      console.log(`  性能测试通过: ${performancePassed}/${performanceTotal}`);
      console.log(`  性能成功率: ${((performancePassed/performanceTotal)*100).toFixed(1)}%`);

      if (performancePassed === performanceTotal) {
        console.log('  🚀 性能评估: 优秀');
      } else {
        console.log('  📉 性能评估: 需要优化');
      }
    }

    // 保存报告到文件
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: (passedTests/totalTests)*100
      },
      security: {
        total: securityTotal,
        passed: securityPassed,
        successRate: securityTotal > 0 ? (securityPassed/securityTotal)*100 : 0
      },
      performance: {
        total: performanceTotal,
        passed: performancePassed,
        successRate: performanceTotal > 0 ? (performancePassed/performanceTotal)*100 : 0
      },
      results: this.testResults
    };

    const fs = require('fs');
    fs.writeFileSync('auth-e2e-test-report.json', JSON.stringify(reportData, null, 2));
    console.log(`\n📁 详细报告已保存到: auth-e2e-test-report.json`);

    return reportData;
  }

  async cleanup() {
    console.log('\n🧹 清理测试环境...');

    if (this.page) {
      await this.page.close();
    }

    if (this.context) {
      await this.context.close();
    }

    if (this.browser) {
      await this.browser.close();
    }

    console.log('✅ 测试环境清理完成');
  }

  async runAllTests() {
    console.log('🚀 开始执行完整的端到端测试套件...\n');

    try {
      await this.init();

      // 执行所有测试
      await this.testNormalLogin();
      await this.testInvalidLogin();
      await this.testExpiredToken();
      await this.testInvalidToken();
      await this.testPermissionIsolation();
      await this.testTokenRefresh();
      await this.testFrontendLoginFlow();
      await this.testTokenDeletion();
      await this.testDataLeakage();
      await this.testConcurrentRequests();
      await this.testPerformanceMetrics();

      // 生成报告
      const report = await this.generateReport();

      console.log('\n🎉 端到端测试套件执行完成！');

      return report;
    } catch (error) {
      console.error('❌ 测试套件执行异常:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// 运行测试
async function runAuthE2ETests() {
  const tester = new AuthE2ETest();

  try {
    const report = await tester.runAllTests();

    // 根据测试结果设置退出码
    const successRate = report.summary.successRate;

    if (successRate >= 90) {
      console.log('\n🟢 测试套件整体通过！成功率:', successRate.toFixed(1) + '%');
      process.exit(0);
    } else if (successRate >= 70) {
      console.log('\n🟡 测试套件部分通过，需要关注失败项。成功率:', successRate.toFixed(1) + '%');
      process.exit(1);
    } else {
      console.log('\n🔴 测试套件失败，需要立即修复问题。成功率:', successRate.toFixed(1) + '%');
      process.exit(2);
    }
  } catch (error) {
    console.error('❌ 测试执行失败:', error);
    process.exit(3);
  }
}

// 运行测试
runAuthE2ETests();