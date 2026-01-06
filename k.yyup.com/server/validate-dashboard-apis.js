const http = require('http');
const https = require('https');
const { URL } = require('url');

// API测试配置
const API_BASE = 'http://localhost:3000/api/dashboard';
const TEST_TOKEN = 'test-token'; // 在实际环境中应该使用真实的JWT token

// 测试用例
const apiTests = [
  {
    name: '仪表板概览',
    endpoint: '/overview',
    method: 'GET',
    description: '获取系统整体概览数据'
  },
  {
    name: '统计数据',
    endpoint: '/stats',
    method: 'GET',
    description: '获取基础统计数据'
  },
  {
    name: '数据统计详情',
    endpoint: '/data-statistics',
    method: 'GET',
    description: '获取详细的数据统计信息'
  },
  {
    name: '校园概览',
    endpoint: '/campus-overview',
    method: 'GET',
    description: '获取校园设施和基本信息'
  },
  {
    name: '图表数据',
    endpoint: '/charts',
    method: 'GET',
    description: '获取各种图表数据'
  },
  {
    name: '活动数据',
    endpoint: '/activities',
    method: 'GET',
    description: '获取活动相关数据'
  },
  {
    name: '待办事项',
    endpoint: '/todos',
    method: 'GET',
    description: '获取用户待办事项列表'
  },
  {
    name: '日程安排',
    endpoint: '/schedules',
    method: 'GET',
    description: '获取用户日程安排'
  }
];

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const lib = isHttps ? https : http;
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`,
        ...options.headers
      }
    };

    const req = lib.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: data,
            headers: res.headers,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testDashboardAPIs() {
  console.log('='.repeat(80));
  console.log('🧪 仪表板API接口验证测试');
  console.log('='.repeat(80));
  console.log(`📡 API Base URL: ${API_BASE}`);
  console.log(`🕒 测试开始时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log('');

  const results = [];
  let passedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < apiTests.length; i++) {
    const test = apiTests[i];
    const url = `${API_BASE}${test.endpoint}`;
    
    console.log(`📝 测试 ${i + 1}/${apiTests.length}: ${test.name}`);
    console.log(`🔗 URL: ${test.endpoint}`);
    console.log(`📄 描述: ${test.description}`);
    
    try {
      const startTime = Date.now();
      const response = await makeRequest(url, { method: test.method });
      const duration = Date.now() - startTime;
      
      const result = {
        name: test.name,
        endpoint: test.endpoint,
        method: test.method,
        statusCode: response.statusCode,
        duration: duration,
        success: false,
        error: null,
        data: response.data
      };

      if (response.statusCode === 200) {
        if (response.data && response.data.success) {
          result.success = true;
          passedCount++;
          console.log(`✅ 成功 - HTTP ${response.statusCode} (${duration}ms)`);
          
          // 检查数据结构
          if (response.data.data) {
            const dataKeys = Object.keys(response.data.data);
            console.log(`📊 数据字段: ${dataKeys.join(', ')}`);
          }
        } else {
          result.error = '响应格式错误或success字段为false';
          failedCount++;
          console.log(`❌ 失败 - 响应格式错误 (${duration}ms)`);
        }
      } else if (response.statusCode === 401) {
        result.error = '认证失败，需要有效的JWT token';
        failedCount++;
        console.log(`⚠️ 认证失败 - HTTP ${response.statusCode} (${duration}ms)`);
        console.log(`💡 提示: 这是预期行为，因为使用的是测试token`);
      } else {
        result.error = `HTTP错误: ${response.statusCode}`;
        failedCount++;
        console.log(`❌ 失败 - HTTP ${response.statusCode} (${duration}ms)`);
      }

      results.push(result);
      
    } catch (error) {
      console.log(`❌ 网络错误: ${error.message}`);
      results.push({
        name: test.name,
        endpoint: test.endpoint,
        method: test.method,
        success: false,
        error: error.message,
        statusCode: null,
        duration: null
      });
      failedCount++;
    }
    
    console.log(''); // 空行分隔
  }

  // 生成测试报告
  console.log('='.repeat(80));
  console.log('📊 API测试结果汇总');
  console.log('='.repeat(80));
  
  console.log(`📈 总测试数: ${apiTests.length}`);
  console.log(`✅ 通过: ${passedCount}`);
  console.log(`❌ 失败: ${failedCount}`);
  console.log(`📊 成功率: ${Math.round((passedCount / apiTests.length) * 100)}%`);
  
  console.log('\n📋 详细结果:');
  results.forEach((result, index) => {
    const status = result.success ? '✅ 成功' : '❌ 失败';
    const duration = result.duration ? `${result.duration}ms` : '超时';
    console.log(`${index + 1}. ${result.name}: ${status} (${duration})`);
    if (result.error) {
      console.log(`   错误: ${result.error}`);
    }
  });

  console.log('\n💡 说明:');
  console.log('- 401错误是预期的，因为使用的是测试token');
  console.log('- 200状态码且success=true表示API正常工作');
  console.log('- 真实环境中需要使用有效的JWT认证token');

  console.log(`\n🕒 测试完成时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log('='.repeat(80));

  return {
    totalTests: apiTests.length,
    passedCount,
    failedCount,
    successRate: Math.round((passedCount / apiTests.length) * 100),
    results
  };
}

// 检查服务器是否运行
async function checkServerStatus() {
  try {
    const response = await makeRequest('http://localhost:3000/health');
    if (response.statusCode === 200) {
      console.log('🟢 服务器运行正常');
      return true;
    } else {
      console.log('🟡 服务器响应异常');
      return false;
    }
  } catch (error) {
    console.log('🔴 服务器未运行或连接失败');
    console.log('💡 请确保后端服务器已启动: npm run dev');
    return false;
  }
}

// 主函数
async function main() {
  console.log('🔍 检查服务器状态...');
  const serverRunning = await checkServerStatus();
  
  if (!serverRunning) {
    console.log('\n⚠️ 警告: 服务器似乎未运行，API测试可能会失败');
    console.log('💡 建议先启动后端服务器: cd /home/devbox/project/server && npm run dev');
  }
  
  console.log('\n继续进行API测试...\n');
  
  const testResults = await testDashboardAPIs();
  
  // 返回测试结果用于进一步处理
  return testResults;
}

// 如果直接运行此脚本，则执行测试
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testDashboardAPIs, checkServerStatus };