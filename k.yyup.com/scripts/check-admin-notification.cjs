const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function checkAdminNotification() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 检查管理员的通知中心');
  console.log('='.repeat(70) + '\n');

  try {
    // 登录管理员
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    const authToken = loginResponse.data.data.token;

    // 获取动态路由
    const routesResponse = await axios.get(
      `${API_BASE_URL}/dynamic-permissions/dynamic-routes`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    const routes = routesResponse.data.data.routes || [];
    
    // 查找通知相关的路由
    const notificationRoutes = routes.filter(route => {
      const name = (route.name || route.chinese_name || '').toLowerCase();
      const path = (route.path || '').toLowerCase();
      return name.includes('notification') || path.includes('notification');
    });

    console.log(`找到 ${notificationRoutes.length} 个通知相关路由:\n`);
    
    notificationRoutes.forEach((route, index) => {
      console.log(`${index + 1}. ${route.chinese_name || route.name}`);
      console.log(`   路径: ${route.path}`);
      console.log(`   类型: ${route.type}`);
      console.log(`   权限ID: ${route.id || '-'}`);
      console.log(`   代码: ${route.code || '-'}\n`);
    });

    console.log('=' .repeat(70));

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
  }
}

checkAdminNotification();
