#!/usr/bin/env node

/**
 * 教师SOP系统API测试脚本
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// 测试用的客户ID（需要先在数据库中存在）
const TEST_CUSTOMER_ID = 1;

// HTTP请求辅助函数
function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: '127.0.0.1', // 强制使用IPv4
      port: 3000,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// 测试用例
async function runTests() {
  console.log('🧪 开始测试教师SOP系统API\n');
  console.log('='.repeat(60));

  let passedTests = 0;
  let failedTests = 0;

  // 测试1: 获取所有SOP阶段
  try {
    console.log('\n📋 测试1: 获取所有SOP阶段');
    const result = await request('GET', '/api/teacher-sop/stages');
    if (result.status === 200 && result.data.success) {
      console.log('✅ 通过 - 获取到', result.data.data?.length || 0, '个阶段');
      passedTests++;
    } else {
      console.log('❌ 失败 - 状态码:', result.status);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ 失败 - 错误:', error.message);
    failedTests++;
  }

  // 测试2: 获取阶段详情
  try {
    console.log('\n📋 测试2: 获取阶段详情 (ID: 1)');
    const result = await request('GET', '/api/teacher-sop/stages/1');
    if (result.status === 200 && result.data.success) {
      console.log('✅ 通过 - 阶段名称:', result.data.data?.name);
      passedTests++;
    } else {
      console.log('❌ 失败 - 状态码:', result.status);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ 失败 - 错误:', error.message);
    failedTests++;
  }

  // 测试3: 获取阶段任务
  try {
    console.log('\n📋 测试3: 获取阶段任务 (阶段ID: 1)');
    const result = await request('GET', '/api/teacher-sop/stages/1/tasks');
    if (result.status === 200 && result.data.success) {
      console.log('✅ 通过 - 获取到', result.data.data?.length || 0, '个任务');
      passedTests++;
    } else {
      console.log('❌ 失败 - 状态码:', result.status);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ 失败 - 错误:', error.message);
    failedTests++;
  }

  // 测试4: 获取客户SOP进度
  try {
    console.log('\n📋 测试4: 获取客户SOP进度 (客户ID:', TEST_CUSTOMER_ID, ')');
    const result = await request('GET', `/api/teacher-sop/customers/${TEST_CUSTOMER_ID}/progress`);
    if (result.status === 200 && result.data.success) {
      console.log('✅ 通过 - 当前阶段ID:', result.data.data?.currentStageId);
      console.log('   进度:', result.data.data?.stageProgress + '%');
      passedTests++;
    } else if (result.status === 404) {
      console.log('⚠️  客户不存在或未初始化SOP进度');
      console.log('   提示: 请先在数据库中创建客户记录');
      failedTests++;
    } else {
      console.log('❌ 失败 - 状态码:', result.status);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ 失败 - 错误:', error.message);
    failedTests++;
  }

  // 测试5: 获取对话记录
  try {
    console.log('\n📋 测试5: 获取对话记录 (客户ID:', TEST_CUSTOMER_ID, ')');
    const result = await request('GET', `/api/teacher-sop/customers/${TEST_CUSTOMER_ID}/conversations`);
    if (result.status === 200 && result.data.success) {
      console.log('✅ 通过 - 获取到', result.data.data?.length || 0, '条对话');
      passedTests++;
    } else {
      console.log('❌ 失败 - 状态码:', result.status);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ 失败 - 错误:', error.message);
    failedTests++;
  }

  // 测试6: 添加对话记录
  try {
    console.log('\n📋 测试6: 添加对话记录');
    const conversationData = {
      speakerType: 'teacher',
      content: '测试对话内容 - ' + new Date().toISOString(),
      messageType: 'text'
    };
    const result = await request('POST', `/api/teacher-sop/customers/${TEST_CUSTOMER_ID}/conversations`, conversationData);
    if (result.status === 200 && result.data.success) {
      console.log('✅ 通过 - 对话ID:', result.data.data?.id);
      passedTests++;
    } else {
      console.log('❌ 失败 - 状态码:', result.status);
      console.log('   响应:', result.data);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ 失败 - 错误:', error.message);
    failedTests++;
  }

  // 测试7: 获取任务AI建议
  try {
    console.log('\n📋 测试7: 获取任务AI建议 (任务ID: 1)');
    const result = await request('POST', `/api/teacher-sop/customers/${TEST_CUSTOMER_ID}/ai-suggestions/task`, {
      taskId: 1
    });
    if (result.status === 200 && result.data.success) {
      console.log('✅ 通过 - 获取到AI建议');
      if (result.data.data?.strategy) {
        console.log('   策略:', result.data.data.strategy.title);
      }
      passedTests++;
    } else {
      console.log('❌ 失败 - 状态码:', result.status);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ 失败 - 错误:', error.message);
    failedTests++;
  }

  // 测试8: 获取全局AI分析
  try {
    console.log('\n📋 测试8: 获取全局AI分析');
    const result = await request('POST', `/api/teacher-sop/customers/${TEST_CUSTOMER_ID}/ai-suggestions/global`);
    if (result.status === 200 && result.data.success) {
      console.log('✅ 通过 - 获取到全局分析');
      if (result.data.data?.successProbability !== undefined) {
        console.log('   成功概率:', result.data.data.successProbability + '%');
      }
      passedTests++;
    } else {
      console.log('❌ 失败 - 状态码:', result.status);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ 失败 - 错误:', error.message);
    failedTests++;
  }

  // 测试总结
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 测试总结:');
  console.log('   总测试数:', passedTests + failedTests);
  console.log('   ✅ 通过:', passedTests);
  console.log('   ❌ 失败:', failedTests);
  console.log('   通过率:', Math.round((passedTests / (passedTests + failedTests)) * 100) + '%');

  if (failedTests === 0) {
    console.log('\n🎉 所有测试通过！');
  } else {
    console.log('\n⚠️  部分测试失败，请检查错误信息');
  }

  console.log('\n' + '='.repeat(60));
}

// 运行测试
runTests().catch(error => {
  console.error('❌ 测试运行失败:', error);
  process.exit(1);
});

