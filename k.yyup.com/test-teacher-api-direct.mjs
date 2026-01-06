/**
 * 教师角色API直接测试脚本
 * 不需要浏览器，直接测试后端API
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';
const TEACHER_USERNAME = 'test_teacher';
const TEACHER_PASSWORD = 'admin123';

let authToken = null;

const testResults = {
  login: null,
  pages: [],
  crud: [],
  errors: []
};

async function login() {
  try {
    console.log('📍 1. 测试登录...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: TEACHER_USERNAME,
      password: TEACHER_PASSWORD
    });
    
    authToken = response.data.data.token;
    console.log('   ✅ 登录成功');
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    testResults.login = { status: '✅', token: authToken };
    return true;
  } catch (error) {
    console.log('   ❌ 登录失败:', error.response?.data?.message || error.message);
    testResults.login = { status: '❌', error: error.message };
    return false;
  }
}

async function testAPI(method, path, description) {
  try {
    const config = {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    };
    
    let response;
    if (method === 'GET') {
      response = await axios.get(`${API_BASE_URL}${path}`, config);
    } else if (method === 'POST') {
      response = await axios.post(`${API_BASE_URL}${path}`, {}, config);
    }
    
    console.log(`   ✅ ${description}`);
    testResults.crud.push({ path, method, status: '✅', data: response.data });
    return true;
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    console.log(`   ❌ ${description} - ${status} ${message}`);
    testResults.crud.push({ path, method, status: '❌', error: message });
    testResults.errors.push({ path, method, error: message });
    return false;
  }
}

async function runTests() {
  console.log('🚀 开始教师角色API测试...\n');
  
  // 1. 登录
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ 登录失败，无法继续测试');
    return;
  }
  
  console.log('\n📍 2. 测试教师API端点...');
  
  // 测试各个API端点
  const apiTests = [
    ['GET', '/teacher-dashboard/dashboard', '获取教师仪表板'],
    ['GET', '/teacher-dashboard/tasks/stats', '获取任务统计'],
    ['GET', '/teacher-dashboard/tasks', '获取任务列表'],
    ['GET', '/teacher-dashboard/today-tasks', '获取今日任务'],
    ['GET', '/teacher-dashboard/today-courses', '获取今日课程'],
    ['GET', '/teacher-dashboard/recent-notifications', '获取最新通知'],
    ['GET', '/teacher-dashboard/teaching/stats', '获取教学统计'],
    ['GET', '/teacher-dashboard/teaching/classes', '获取班级列表'],
    ['GET', '/teacher-dashboard/teaching/students', '获取学生列表'],
    ['GET', '/teacher/attendance/classes', '获取考勤班级'],
  ];
  
  for (const [method, path, description] of apiTests) {
    await testAPI(method, path, description);
  }
  
  // 生成报告
  console.log('\n📊 测试结果汇总：');
  console.log(`   登录: ${testResults.login.status}`);
  console.log(`   API测试: ${testResults.crud.length}个`);
  console.log(`   错误: ${testResults.errors.length}个`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ 发现的错误:');
    testResults.errors.forEach((err, i) => {
      console.log(`   ${i + 1}. ${err.path} - ${err.error}`);
    });
  }
  
  console.log('\n✅ 测试完成！');
}

runTests().catch(console.error);

