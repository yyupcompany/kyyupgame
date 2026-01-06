/**
 * 教师任务测试脚本
 * 用于验证教师任务功能是否正常工作
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
const TEST_TEACHER_USERNAME = 'test_teacher';
const TEST_TEACHER_PASSWORD = 'admin123';

let authToken = '';
let userId = null;

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// 1. 教师登录
async function loginAsTeacher() {
  logSection('步骤 1: 教师登录');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: TEST_TEACHER_USERNAME,
      password: TEST_TEACHER_PASSWORD
    });

    if (response.data.success) {
      authToken = response.data.data.token;
      userId = response.data.data.user.id;
      logSuccess(`登录成功！`);
      logInfo(`用户ID: ${userId}`);
      logInfo(`Token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      logError(`登录失败: ${response.data.message}`);
      return false;
    }
  } catch (error) {
    logError(`登录请求失败: ${error.message}`);
    if (error.response) {
      logError(`响应状态: ${error.response.status}`);
      logError(`响应数据: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return false;
  }
}

// 2. 获取任务统计
async function getTaskStats() {
  logSection('步骤 2: 获取任务统计');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/teacher-dashboard/tasks/stats`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.data.success) {
      const stats = response.data.data;
      logSuccess('任务统计获取成功！');
      console.log(JSON.stringify(stats, null, 2));
      
      logInfo(`总任务数: ${stats.total}`);
      logInfo(`已完成: ${stats.completed}`);
      logInfo(`待处理: ${stats.pending}`);
      logInfo(`进行中: ${stats.inProgress}`);
      logInfo(`逾期: ${stats.overdue}`);
      logInfo(`完成率: ${stats.completionRate}%`);
      
      return stats;
    } else {
      logError(`获取任务统计失败: ${response.data.message}`);
      return null;
    }
  } catch (error) {
    logError(`获取任务统计请求失败: ${error.message}`);
    if (error.response) {
      logError(`响应状态: ${error.response.status}`);
      logError(`响应数据: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return null;
  }
}

// 3. 获取任务列表
async function getTaskList() {
  logSection('步骤 3: 获取任务列表');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/teacher-dashboard/tasks`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      params: {
        page: 1,
        pageSize: 20
      }
    });

    if (response.data.success) {
      const data = response.data.data;
      logSuccess('任务列表获取成功！');
      
      logInfo(`总记录数: ${data.total}`);
      logInfo(`当前页: ${data.page}`);
      logInfo(`每页数量: ${data.pageSize}`);
      logInfo(`任务数量: ${data.list.length}`);
      
      if (data.list.length > 0) {
        console.log('\n任务列表:');
        data.list.forEach((task, index) => {
          console.log(`\n${index + 1}. ${task.title}`);
          console.log(`   ID: ${task.id}`);
          console.log(`   状态: ${task.status}`);
          console.log(`   优先级: ${task.priority}`);
          console.log(`   截止日期: ${task.dueDate}`);
          console.log(`   分配人: ${task.assignedBy}`);
          console.log(`   进度: ${task.progress}%`);
        });
      } else {
        logWarning('任务列表为空！');
      }
      
      return data;
    } else {
      logError(`获取任务列表失败: ${response.data.message}`);
      return null;
    }
  } catch (error) {
    logError(`获取任务列表请求失败: ${error.message}`);
    if (error.response) {
      logError(`响应状态: ${error.response.status}`);
      logError(`响应数据: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return null;
  }
}

// 4. 直接查询数据库检查任务数据
async function checkDatabaseTasks() {
  logSection('步骤 4: 检查数据库中的任务数据');
  
  const mysql = require('mysql2/promise');
  
  try {
    const connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'Aa112211',
      database: 'kindergarten_management'
    });

    logSuccess('数据库连接成功！');

    // 查询分配给test_teacher的任务
    const [tasks] = await connection.execute(
      'SELECT * FROM tasks WHERE assignee_id = ? ORDER BY created_at DESC',
      [userId]
    );

    logInfo(`数据库中找到 ${tasks.length} 个任务`);
    
    if (tasks.length > 0) {
      console.log('\n数据库任务列表:');
      tasks.forEach((task, index) => {
        console.log(`\n${index + 1}. ${task.title}`);
        console.log(`   ID: ${task.id}`);
        console.log(`   状态: ${task.status}`);
        console.log(`   优先级: ${task.priority}`);
        console.log(`   截止日期: ${task.due_date}`);
        console.log(`   创建人ID: ${task.creator_id}`);
        console.log(`   分配人ID: ${task.assignee_id}`);
      });
    } else {
      logWarning('数据库中没有找到任务！');
    }

    await connection.end();
    return tasks;
  } catch (error) {
    logError(`数据库查询失败: ${error.message}`);
    return null;
  }
}

// 5. 创建测试任务（如果没有任务）
async function createTestTask() {
  logSection('步骤 5: 创建测试任务');
  
  const mysql = require('mysql2/promise');
  
  try {
    const connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'Aa112211',
      database: 'kindergarten_management'
    });

    logSuccess('数据库连接成功！');

    // 创建任务
    const [result] = await connection.execute(
      `INSERT INTO tasks (title, description, priority, status, due_date, creator_id, assignee_id, progress, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        '测试任务 - 自动创建',
        '这是一个自动创建的测试任务，用于验证教师任务功能',
        'medium',
        'pending',
        '2025-10-15',
        1, // admin用户ID
        userId, // test_teacher用户ID
        0
      ]
    );

    logSuccess(`任务创建成功！任务ID: ${result.insertId}`);

    await connection.end();
    return result.insertId;
  } catch (error) {
    logError(`创建任务失败: ${error.message}`);
    return null;
  }
}

// 主测试流程
async function runTests() {
  log('\n🚀 开始教师任务功能测试\n', 'cyan');
  
  // 1. 登录
  const loginSuccess = await loginAsTeacher();
  if (!loginSuccess) {
    logError('登录失败，测试终止');
    process.exit(1);
  }

  // 2. 检查数据库任务
  const dbTasks = await checkDatabaseTasks();
  
  // 3. 如果没有任务，创建一个
  if (!dbTasks || dbTasks.length === 0) {
    logWarning('数据库中没有任务，创建测试任务...');
    await createTestTask();
    // 重新检查
    await checkDatabaseTasks();
  }

  // 4. 获取任务统计
  const stats = await getTaskStats();
  
  // 5. 获取任务列表
  const taskList = await getTaskList();

  // 总结
  logSection('测试总结');
  
  if (stats && taskList) {
    if (stats.total > 0 && taskList.list.length > 0) {
      logSuccess('✅ 所有测试通过！');
      logSuccess(`数据库有 ${dbTasks?.length || 0} 个任务`);
      logSuccess(`API统计显示 ${stats.total} 个任务`);
      logSuccess(`API列表返回 ${taskList.list.length} 个任务`);
    } else if (stats.total === 0) {
      logWarning('⚠️  API返回的任务数为0，但数据库中有任务');
      logWarning('可能的问题：');
      logWarning('1. 后端查询逻辑有问题');
      logWarning('2. 用户ID不匹配');
      logWarning('3. 数据库关联有问题');
    } else {
      logWarning('⚠️  部分测试通过，但存在数据不一致');
    }
  } else {
    logError('❌ 测试失败！');
  }
  
  log('\n测试完成！\n', 'cyan');
}

// 运行测试
runTests().catch(error => {
  logError(`测试过程中发生错误: ${error.message}`);
  console.error(error);
  process.exit(1);
});

