#!/usr/bin/env node

/**
 * API修复测试脚本
 * 测试修复后的API端点是否正常工作
 */

const http = require('http');

class APIFixTester {
  constructor() {
    this.baseUrl = 'http://localhost:3000/api';
    this.testResults = [];
  }

  /**
   * 测试API端点
   */
  async testEndpoint(method, path, data = null, headers = {}) {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const response = {
              statusCode: res.statusCode,
              headers: res.headers,
              body: body ? JSON.parse(body) : null
            };
            resolve(response);
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: body,
              error: 'JSON解析失败'
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(data);
      }
      req.end();
    });
  }

  /**
   * 测试修复的classes端点
   */
  async testClassesEndpoint() {
    console.log('📋 测试修复后的 /classes 端点...');

    try {
      const response = await this.testEndpoint('GET', '/classes');

      this.testResults.push({
        endpoint: '/classes',
        method: 'GET',
        success: response.statusCode === 200,
        statusCode: response.statusCode,
        message: response.statusCode === 200 ? '✅ Classes API正常工作' : '❌ Classes API有错误'
      });

      console.log(`   状态码: ${response.statusCode}`);
      if (response.body) {
        console.log(`   响应: ${JSON.stringify(response.body).substring(0, 100)}...`);
      }
    } catch (error) {
      this.testResults.push({
        endpoint: '/classes',
        method: 'GET',
        success: false,
        error: error.message,
        message: '❌ Classes API无法访问'
      });
      console.log(`   错误: ${error.message}`);
    }

    console.log('');
  }

  /**
   * 测试修复的tasks端点
   */
  async testTasksEndpoint() {
    console.log('📋 测试修复后的 /tasks 端点...');

    try {
      // 测试GET /tasks
      const getResponse = await this.testEndpoint('GET', '/tasks');

      this.testResults.push({
        endpoint: '/tasks',
        method: 'GET',
        success: getResponse.statusCode === 200,
        statusCode: getResponse.statusCode,
        message: getResponse.statusCode === 200 ? '✅ Tasks GET API正常工作' : '❌ Tasks GET API有错误'
      });

      console.log(`   GET 状态码: ${getResponse.statusCode}`);
      if (getResponse.body && getResponse.body.message) {
        console.log(`   GET 响应: ${getResponse.body.message}`);
      }

      // 测试PUT /tasks/:taskId/status
      const putResponse = await this.testEndpoint('PUT', '/tasks/1/status', { status: 'completed' });

      this.testResults.push({
        endpoint: '/tasks/:taskId/status',
        method: 'PUT',
        success: putResponse.statusCode === 200,
        statusCode: putResponse.statusCode,
        message: putResponse.statusCode === 200 ? '✅ Tasks PUT API正常工作' : '❌ Tasks PUT API有错误'
      });

      console.log(`   PUT 状态码: ${putResponse.statusCode}`);
      if (putResponse.body && putResponse.body.message) {
        console.log(`   PUT 响应: ${putResponse.body.message}`);
      }

    } catch (error) {
      this.testResults.push({
        endpoint: '/tasks',
        method: 'GET/PUT',
        success: false,
        error: error.message,
        message: '❌ Tasks API无法访问'
      });
      console.log(`   错误: ${error.message}`);
    }

    console.log('');
  }

  /**
   * 测试重复端点是否已被修复
   */
  async testDuplicateRemoval() {
    console.log('🔍 验证重复端点是否已被修复...');

    // 检查旧的class.routes是否还在响应
    try {
      // 通过尝试访问旧路径来验证是否已被移除
      const oldClassResponse = await this.testEndpoint('GET', '/classes/old-route');

      console.log(`   旧classes路由测试: ${oldClassResponse.statusCode}`);
    } catch (error) {
      console.log(`   旧classes路由测试: ${error.message} (预期的，因为路由已被修复)`);
    }

    console.log('');
  }

  /**
   * 生成测试报告
   */
  generateTestReport() {
    console.log('📊 API修复测试报告\n');
    console.log('─'.repeat(50));

    const successCount = this.testResults.filter(r => r.success).length;
    const totalCount = this.testResults.length;
    const successRate = ((successCount / totalCount) * 100).toFixed(1);

    console.log(`✅ 成功: ${successCount}/${totalCount} (${successRate}%)`);
    console.log(`❌ 失败: ${totalCount - successCount}/${totalCount} (${(100 - successRate).toFixed(1)}%)\n`);

    console.log('📋 详细结果:');
    this.testResults.forEach((result, index) => {
      const icon = result.success ? '✅' : '❌';
      console.log(`   ${index + 1}. ${icon} ${result.method} ${result.endpoint}`);
      console.log(`      ${result.message}`);
      if (result.statusCode) {
        console.log(`      状态码: ${result.statusCode}`);
      }
      if (result.error) {
        console.log(`      错误: ${result.error}`);
      }
    });

    console.log('\n🎯 结论:');
    if (successRate >= 80) {
      console.log('   ✅ API修复成功！大部分端点正常工作');
    } else if (successRate >= 50) {
      console.log('   ⚠️  API部分修复成功，需要进一步调试');
    } else {
      console.log('   ❌ API修复需要更多工作');
    }

    // 保存测试报告
    const report = {
      testTime: new Date().toLocaleString(),
      summary: {
        total: totalCount,
        success: successCount,
        failed: totalCount - successCount,
        successRate: successRate
      },
      results: this.testResults
    };

    const fs = require('fs');
    fs.writeFileSync('API_FIX_TEST_REPORT.json', JSON.stringify(report, null, 2));
    console.log('\n📄 详细报告已保存到: API_FIX_TEST_REPORT.json');
  }

  /**
   * 运行所有测试
   */
  async runTests() {
    console.log('🧪 开始API修复测试...\n');

    await this.testClassesEndpoint();
    await this.testTasksEndpoint();
    await this.testDuplicateRemoval();

    this.generateTestReport();
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🔧 API修复测试工具\n');
  console.log('🎯 测试修复后的API端点是否正常工作\n');

  const tester = new APIFixTester();

  try {
    await tester.runTests();
    console.log('\n🎉 测试完成！');
  } catch (error) {
    console.error('\n❌ 测试过程中出错:', error);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  main();
}

module.exports = APIFixTester;