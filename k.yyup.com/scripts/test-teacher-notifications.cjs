const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
const TEACHER_USERNAME = 'test_teacher';
const TEACHER_PASSWORD = 'admin123';

let authToken = '';
let userId = '';

async function testTeacherNotifications() {
  console.log('\n' + '='.repeat(70));
  console.log('🎯 教师通知中心测试');
  console.log('='.repeat(70) + '\n');

  try {
    // 步骤1: 教师登录
    console.log('📍 步骤1: 教师登录');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: TEACHER_USERNAME,
      password: TEACHER_PASSWORD
    });

    if (!loginResponse.data.success) {
      console.log('❌ 登录失败:', loginResponse.data.message);
      return;
    }

    authToken = loginResponse.data.data.token;
    userId = loginResponse.data.data.user.id;
    
    console.log('✅ 登录成功！');
    console.log(`   用户ID: ${userId}`);
    console.log(`   用户名: ${loginResponse.data.data.user.username}`);

    // 步骤2: 获取通知统计
    console.log('\n📍 步骤2: 获取通知统计');
    try {
      const statsResponse = await axios.get(
        `${API_BASE_URL}/teacher-dashboard/notifications/stats`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );

      if (statsResponse.data.success) {
        const stats = statsResponse.data.data;
        console.log('✅ 通知统计获取成功！');
        console.log(`   总通知数: ${stats.total || 0}`);
        console.log(`   未读通知: ${stats.unread || 0}`);
        console.log(`   已读通知: ${stats.read || 0}`);
        console.log(`   系统通知: ${stats.system || 0}`);
        console.log(`   任务通知: ${stats.task || 0}`);
      } else {
        console.log('⚠️  通知统计API返回失败:', statsResponse.data.message);
      }
    } catch (error) {
      console.log('⚠️  通知统计API不存在或出错:', error.response?.status || error.message);
    }

    // 步骤3: 获取通知列表
    console.log('\n📍 步骤3: 获取通知列表');
    try {
      const listResponse = await axios.get(
        `${API_BASE_URL}/teacher-dashboard/notifications`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` },
          params: { page: 1, pageSize: 10 }
        }
      );

      if (listResponse.data.success) {
        const data = listResponse.data.data;
        const notifications = data.list || data.notifications || data;
        
        console.log('✅ 通知列表获取成功！');
        console.log(`   通知数量: ${Array.isArray(notifications) ? notifications.length : 0}`);
        console.log(`   总记录数: ${data.total || 0}`);
        
        if (Array.isArray(notifications) && notifications.length > 0) {
          console.log('\n   前3条通知:');
          notifications.slice(0, 3).forEach((notif, index) => {
            console.log(`   ${index + 1}. ${notif.title || notif.content || '无标题'}`);
            console.log(`      类型: ${notif.type || '未知'}, 状态: ${notif.status || notif.is_read ? '已读' : '未读'}`);
          });
        } else {
          console.log('   ⚠️  暂无通知数据');
        }
      } else {
        console.log('⚠️  通知列表API返回失败:', listResponse.data.message);
      }
    } catch (error) {
      console.log('⚠️  通知列表API不存在或出错:', error.response?.status || error.message);
    }

    // 步骤4: 尝试使用通用通知API
    console.log('\n📍 步骤4: 尝试通用通知API');
    try {
      const generalResponse = await axios.get(
        `${API_BASE_URL}/notifications`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` },
          params: { page: 1, pageSize: 10 }
        }
      );

      if (generalResponse.data.success) {
        const data = generalResponse.data.data;
        const notifications = data.list || data.notifications || data;
        
        console.log('✅ 通用通知API可用！');
        console.log(`   通知数量: ${Array.isArray(notifications) ? notifications.length : 0}`);
        console.log(`   总记录数: ${data.total || 0}`);
      } else {
        console.log('⚠️  通用通知API返回失败:', generalResponse.data.message);
      }
    } catch (error) {
      console.log('⚠️  通用通知API不存在或出错:', error.response?.status || error.message);
    }

    // 步骤5: 检查数据库中的通知数据
    console.log('\n📍 步骤5: 检查可用的通知相关API');
    const notificationEndpoints = [
      '/notifications',
      '/teacher-dashboard/notifications',
      '/notifications/list',
      '/notifications/unread',
      '/system/notifications'
    ];

    for (const endpoint of notificationEndpoints) {
      try {
        const response = await axios.get(
          `${API_BASE_URL}${endpoint}`,
          {
            headers: { 'Authorization': `Bearer ${authToken}` },
            params: { page: 1, pageSize: 5 }
          }
        );

        if (response.data.success) {
          console.log(`   ✅ ${endpoint}: 可用`);
        } else {
          console.log(`   ⚠️  ${endpoint}: 返回失败`);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`   ❌ ${endpoint}: 不存在`);
        } else {
          console.log(`   ⚠️  ${endpoint}: 错误 (${error.response?.status || error.message})`);
        }
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ 教师通知中心测试完成');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response) {
      console.error('   响应状态:', error.response.status);
      console.error('   响应数据:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// 运行测试
testTeacherNotifications();

