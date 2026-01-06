const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function getAdminMenuOrder() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 管理员(admin)中心菜单完整顺序');
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
    
    // 提取中心菜单
    const centerRoutes = routes.filter(route => {
      const path = route.path || '';
      const name = route.name || route.chinese_name || '';
      return (
        path.includes('/centers/') || 
        path.includes('-center') ||
        name.includes('Center') ||
        name.includes('中心')
      );
    });

    console.log(`管理员中心菜单总数: ${centerRoutes.length}个\n`);
    console.log('完整顺序列表:\n');
    
    centerRoutes.forEach((route, index) => {
      const name = route.chinese_name || route.name;
      const path = route.path;
      const id = route.id || '-';
      const sort = route.sort || '-';
      
      console.log(`${index + 1}. ${name}`);
      console.log(`   路径: ${path}`);
      console.log(`   ID: ${id}`);
      console.log(`   排序: ${sort}\n`);
    });

    console.log('=' .repeat(70));

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
  }
}

getAdminMenuOrder();
