const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// 测试结果存储
let testResults = {
  loginStatus: null,
  apiTests: [],
  uploadTests: [],
  fileCreation: [],
  errors: [],
  summary: {}
};

const BASE_URL = 'http://localhost:3000';

// 创建HTTP客户端
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 添加请求拦截器记录API调用
apiClient.interceptors.request.use(request => {
  const requestInfo = {
    url: request.url,
    method: request.method,
    headers: request.headers,
    timestamp: new Date().toISOString()
  };
  testResults.apiTests.push({ type: 'request', ...requestInfo });
  console.log(`📡 API请求: ${request.method.toUpperCase()} ${request.url}`);
  return request;
}, error => {
  console.error('请求拦截器错误:', error.message);
  return Promise.reject(error);
});

// 添加响应拦截器记录API响应
apiClient.interceptors.response.use(response => {
  const responseInfo = {
    url: response.config.url,
    method: response.config.method.toUpperCase(),
    status: response.status,
    headers: response.headers,
    data: response.data,
    timestamp: new Date().toISOString()
  };
  testResults.apiTests.push({ type: 'response', ...responseInfo });
  console.log(`✅ API响应: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`);
  return response;
}, error => {
  const errorInfo = {
    url: error.config?.url,
    method: error.config?.method?.toUpperCase(),
    status: error.response?.status,
    message: error.message,
    data: error.response?.data,
    timestamp: new Date().toISOString()
  };
  testResults.apiTests.push({ type: 'error', ...errorInfo });
  testResults.errors.push(errorInfo);
  console.error(`❌ API错误: ${error.response?.status || 'UNKNOWN'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
  console.error(`   错误详情: ${error.message}`);
  return Promise.reject(error);
});

async function testBackendAIAPIs() {
  console.log('=== 开始后端AI API直接测试 ===\n');

  try {
    // 1. 测试后端健康状态
    console.log('1. 测试后端健康状态...');
    try {
      const healthResponse = await apiClient.get('/api/health');
      console.log('✅ 后端服务健康:', healthResponse.data);
    } catch (error) {
      console.log('❌ 后端服务不健康:', error.message);
      return testResults;
    }

    // 2. 测试登录API
    console.log('\n2. 测试用户登录...');
    try {
      const loginResponse = await apiClient.post('/api/auth/login', {
        username: 'admin',
        password: '123456'
      });

      const token = loginResponse.data.data.token;
      console.log('✅ 登录成功，获得Token');
      console.log('   用户信息:', loginResponse.data.data.user);

      // 设置认证头
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      testResults.loginStatus = 'success';

    } catch (error) {
      console.log('❌ 登录失败:', error.message);
      testResults.loginStatus = 'failed';
      return testResults;
    }

    // 3. 创建测试文件
    console.log('\n3. 创建测试文件...');

    const testFiles = [];

    // 创建文本文档
    const textContent = `AI助手测试文档

这是一个用于测试AI助手文档分析功能的示例文档。

测试内容包括：
1. 文本理解能力测试
2. 内容摘要功能测试
3. 关键信息提取测试
4. 智能问答功能测试

文档创建时间：${new Date().toLocaleString('zh-CN')}
测试目的：验证AI助手能够准确处理和分析中文文档内容

示例数据：
- 学生姓名：张小明
- 班级：大班A班
- 年龄：5岁
- 家长联系方式：138****5678
- 入园日期：2023年9月1日

教学评估：
该幼儿在园期间表现良好，语言表达能力较强，喜欢参与集体活动。
建议加强数学启蒙教育和社交能力培养。`;

    const textFileName = `ai-test-document-${Date.now()}.txt`;
    fs.writeFileSync(textFileName, textContent, 'utf8');
    testFiles.push({
      name: textFileName,
      type: 'text/plain',
      path: textFileName,
      size: fs.statSync(textFileName).size,
      description: 'AI测试文本文档'
    });
    console.log(`✓ 创建文本文件: ${textFileName} (${fs.statSync(textFileName).size} bytes)`);

    // 创建JSON格式的结构化数据文件
    const jsonContent = {
      testType: "AI助手功能测试",
      timestamp: new Date().toISOString(),
      studentInfo: {
        name: "李小红",
        age: 4,
        class: "中班B班",
        enrollmentDate: "2023-09-01"
      },
      assessmentData: {
        cognitive: "良好",
        language: "优秀",
        social: "发展中",
        motor: "良好"
      },
      teacherNotes: "该幼儿表现积极，建议继续观察社交能力发展",
      parentFeedback: "感谢老师的悉心照顾，孩子在家表现良好"
    };

    const jsonFileName = `ai-test-data-${Date.now()}.json`;
    fs.writeFileSync(jsonFileName, JSON.stringify(jsonContent, null, 2), 'utf8');
    testFiles.push({
      name: jsonFileName,
      type: 'application/json',
      path: jsonFileName,
      size: fs.statSync(jsonFileName).size,
      description: 'AI测试JSON数据文件'
    });
    console.log(`✓ 创建JSON文件: ${jsonFileName} (${fs.statSync(jsonFileName).size} bytes)`);

    // 创建CSV格式数据
    const csvContent = `姓名,年龄,班级,入园日期,评估等级,教师评语
张小明,5,大班A班,2023-09-01,良好,表现积极，语言能力强
李小红,4,中班B班,2023-09-01,优秀,参与活动积极，社交能力好
王小强,5,大班A班,2023-09-01,发展中,需要加强表达能力
刘小美,4,中班B班,2023-09-01,良好,艺术天赋突出，乐于助人`;

    const csvFileName = `ai-test-students-${Date.now()}.csv`;
    fs.writeFileSync(csvFileName, csvContent, 'utf8');
    testFiles.push({
      name: csvFileName,
      type: 'text/csv',
      path: csvFileName,
      size: fs.statSync(csvFileName).size,
      description: 'AI测试CSV学生数据'
    });
    console.log(`✓ 创建CSV文件: ${csvFileName} (${fs.statSync(csvFileName).size} bytes)`);

    testResults.fileCreation = testFiles;

    // 4. 测试AI相关API端点
    console.log('\n4. 探索AI相关API端点...');

    const aiEndpoints = [
      '/api/ai',
      '/api/ai/query',
      '/api/ai/chat',
      '/api/ai/analyze',
      '/api/ai/upload',
      '/api/upload',
      '/api/file/upload',
      '/api/ai-query',
      '/api/ai-assistant',
      '/api/smart-ai',
      '/api/v1/ai',
      '/api/v1/ai-query'
    ];

    for (const endpoint of aiEndpoints) {
      console.log(`\n   测试端点: ${endpoint}`);

      // 尝试GET请求
      try {
        const getResponse = await apiClient.get(endpoint);
        console.log(`   ✅ GET ${endpoint} - ${getResponse.status}`);
        if (getResponse.data) {
          console.log(`      响应数据: ${JSON.stringify(getResponse.data).substring(0, 100)}...`);
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.log(`   ⚠️  GET ${endpoint} - ${error.response?.status || 'ERROR'}`);
        } else {
          console.log(`   ❌ GET ${endpoint} - Not Found`);
        }
      }

      // 尝试POST请求（带简单数据）
      try {
        const postResponse = await apiClient.post(endpoint, {
          message: "你好，这是一个测试消息",
          test: true
        });
        console.log(`   ✅ POST ${endpoint} - ${postResponse.status}`);
        if (postResponse.data) {
          console.log(`      响应数据: ${JSON.stringify(postResponse.data).substring(0, 100)}...`);
        }
      } catch (error) {
        if (error.response?.status !== 404 && error.response?.status !== 405) {
          console.log(`   ⚠️  POST ${endpoint} - ${error.response?.status || 'ERROR'}`);
        } else {
          console.log(`   ❌ POST ${endpoint} - ${error.response?.status || 'ERROR'}`);
        }
      }
    }

    // 5. 测试文件上传API
    console.log('\n5. 测试文件上传功能...');

    for (const file of testFiles) {
      console.log(`\n   测试上传文件: ${file.name}`);

      for (const endpoint of ['/api/upload', '/api/file/upload', '/api/ai/upload']) {
        try {
          const formData = new FormData();
          formData.append('file', fs.createReadStream(file.path), file.name);
          formData.append('description', file.description);
          formData.append('test', 'true');

          const uploadResponse = await apiClient.post(endpoint, formData, {
            headers: {
              ...formData.getHeaders()
            }
          });

          console.log(`   ✅ 上传到 ${endpoint} - ${uploadResponse.status}`);
          if (uploadResponse.data) {
            console.log(`      上传结果: ${JSON.stringify(uploadResponse.data).substring(0, 100)}...`);

            testResults.uploadTests.push({
              fileName: file.name,
              endpoint: endpoint,
              status: 'success',
              response: uploadResponse.data
            });
          }

        } catch (error) {
          console.log(`   ❌ 上传到 ${endpoint} - ${error.response?.status || 'ERROR'}`);

          testResults.uploadTests.push({
            fileName: file.name,
            endpoint: endpoint,
            status: 'failed',
            error: error.message,
            response: error.response?.data
          });
        }
      }
    }

    // 6. 测试AI分析功能
    console.log('\n6. 测试AI分析功能...');

    // 尝试发送文本分析请求
    const analysisRequests = [
      {
        endpoint: '/api/ai/analyze',
        data: {
          text: textContent,
          type: 'document_analysis',
          request: '请分析这个文档的主要内容和关键信息'
        }
      },
      {
        endpoint: '/api/ai-query',
        data: {
          query: '请帮我分析学生的表现情况',
          context: textContent
        }
      },
      {
        endpoint: '/api/ai/chat',
        data: {
          message: '你好，我想了解幼儿园管理系统',
          type: 'general_inquiry'
        }
      }
    ];

    for (const request of analysisRequests) {
      console.log(`\n   测试AI分析: ${request.endpoint}`);
      try {
        const response = await apiClient.post(request.endpoint, request.data);
        console.log(`   ✅ ${request.endpoint} - ${response.status}`);
        if (response.data) {
          console.log(`      AI响应: ${JSON.stringify(response.data).substring(0, 200)}...`);
        }
      } catch (error) {
        console.log(`   ❌ ${request.endpoint} - ${error.response?.status || 'ERROR'}`);
        if (error.response?.data) {
          console.log(`      错误详情: ${JSON.stringify(error.response.data)}`);
        }
      }
    }

    // 7. 测试用户权限相关的AI功能
    console.log('\n7. 测试用户权限和动态路由...');

    try {
      const permissionsResponse = await apiClient.get('/api/dynamic-permissions/user-permissions');
      console.log('✅ 用户权限获取成功');
      if (permissionsResponse.data) {
        console.log(`   权限数量: ${permissionsResponse.data.data?.length || 0}`);
      }
    } catch (error) {
      console.log('❌ 用户权限获取失败:', error.message);
    }

    try {
      const routesResponse = await apiClient.get('/api/dynamic-permissions/dynamic-routes');
      console.log('✅ 动态路由获取成功');
      if (routesResponse.data) {
        console.log(`   路由数量: ${routesResponse.data.data?.length || 0}`);
      }
    } catch (error) {
      console.log('❌ 动态路由获取失败:', error.message);
    }

    // 8. 清理测试文件
    console.log('\n8. 清理测试文件...');
    testFiles.forEach(file => {
      try {
        fs.unlinkSync(file.path);
        console.log(`   ✓ 删除: ${file.name}`);
      } catch (error) {
        console.log(`   ❌ 删除失败: ${file.name} - ${error.message}`);
      }
    });

    console.log('\n=== 后端AI API测试完成 ===');

  } catch (error) {
    console.error('测试过程中发生未捕获的错误:', error);
    testResults.errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }

  // 生成测试总结
  testResults.summary = {
    loginSuccess: testResults.loginStatus === 'success',
    totalAPITests: testResults.apiTests.length,
    successfulAPITests: testResults.apiTests.filter(t => t.type === 'response').length,
    failedAPITests: testResults.apiTests.filter(t => t.type === 'error').length,
    filesCreated: testResults.fileCreation.length,
    uploadAttempts: testResults.uploadTests.length,
    successfulUploads: testResults.uploadTests.filter(t => t.status === 'success').length,
    totalErrors: testResults.errors.length,
    testCompleted: true,
    testDuration: process.uptime()
  };

  return testResults;
}

// 执行测试
testBackendAIAPIs().then(results => {
  console.log('\n=== 测试结果总结 ===');

  // 输出基本统计
  console.log(`✅ 登录状态: ${results.summary.loginSuccess ? '成功' : '失败'}`);
  console.log(`🌐 API测试总数: ${results.summary.totalAPITests}`);
  console.log(`✅ 成功API调用: ${results.summary.successfulAPITests}`);
  console.log(`❌ 失败API调用: ${results.summary.failedAPITests}`);
  console.log(`📁 创建测试文件: ${results.summary.filesCreated} 个`);
  console.log(`📤 文件上传尝试: ${results.summary.uploadAttempts} 次`);
  console.log(`✅ 成功上传: ${results.summary.successfulUploads} 次`);
  console.log(`⚠️  错误总数: ${results.summary.totalErrors}`);
  console.log(`⏱️  测试耗时: ${results.summary.testDuration.toFixed(2)} 秒`);

  // 输出成功的API端点
  const successfulAPIs = results.apiTests.filter(t => t.type === 'response');
  if (successfulAPIs.length > 0) {
    console.log('\n=== 可用的API端点 ===');
    successfulAPIs.forEach(api => {
      console.log(`✅ ${api.method} ${api.url} - ${api.status}`);
    });
  }

  // 输出文件上传结果
  if (results.uploadTests.length > 0) {
    console.log('\n=== 文件上传测试结果 ===');
    results.uploadTests.forEach(test => {
      const status = test.status === 'success' ? '✅' : '❌';
      console.log(`${status} ${test.fileName} -> ${test.endpoint}`);
      if (test.status === 'success' && test.response) {
        console.log(`   响应: ${JSON.stringify(test.response).substring(0, 100)}...`);
      }
    });
  }

  // 输出发现的AI功能
  const aiRelatedAPIs = results.apiTests.filter(t =>
    t.url && (t.url.includes('/ai') || t.url.includes('/upload'))
  );
  if (aiRelatedAPIs.length > 0) {
    console.log('\n=== 发现的AI相关功能 ===');
    aiRelatedAPIs.forEach(api => {
      console.log(`🤖 ${api.method || 'RESPONSE'} ${api.url} - ${api.status || '信息'}`);
    });
  }

  // 输出主要错误
  if (results.errors.length > 0) {
    console.log('\n=== 主要错误 ===');
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.message}`);
      if (error.status) {
        console.log(`   状态: ${error.status}`);
      }
    });
  }

  // 保存详细结果到文件
  const finalResults = {
    ...results,
    testSummary: {
      backendAIStatus: results.summary.successfulAPITests > 0 ? '功能正常' : '需要检查',
      fileUploadStatus: results.summary.successfulUploads > 0 ? '支持上传' : '不支持或有问题',
      recommendations: generateRecommendations(results)
    }
  };

  fs.writeFileSync(
    'ai-backend-test-results.json',
    JSON.stringify(finalResults, null, 2)
  );

  console.log('\n详细测试结果已保存到 ai-backend-test-results.json');

  // 生成建议
  const recommendations = generateRecommendations(results);
  if (recommendations.length > 0) {
    console.log('\n=== 测试建议 ===');
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }

}).catch(error => {
  console.error('后端API测试执行失败:', error);
});

// 生成测试建议的函数
function generateRecommendations(results) {
  const recommendations = [];

  if (results.summary.loginSuccess && results.summary.successfulAPITests > 0) {
    recommendations.push('后端AI API功能正常，可以继续进行前端集成测试');
  }

  if (results.summary.successfulUploads > 0) {
    recommendations.push('文件上传功能正常，建议测试更多文件格式');
  } else if (results.summary.uploadAttempts > 0) {
    recommendations.push('文件上传功能可能有问题，建议检查上传API配置');
  } else {
    recommendations.push('未发现文件上传API，可能需要开发相关功能');
  }

  const aiAPIs = results.apiTests.filter(t => t.url && t.url.includes('/ai'));
  if (aiAPIs.length === 0) {
    recommendations.push('未发现AI相关API端点，可能需要开发AI功能模块');
  }

  if (results.summary.failedAPITests > results.summary.successfulAPITests) {
    recommendations.push('大量API调用失败，建议检查后端服务配置和权限设置');
  }

  return recommendations;
}