const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function compareMenuOrder() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 园长 vs 管理员 - 中心菜单顺序对比');
  console.log('='.repeat(80) + '\n');

  try {
    // 登录园长
    const principalLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'principal',
      password: '123456'
    });
    const principalToken = principalLogin.data.data.token;

    // 登录管理员
    const adminLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    const adminToken = adminLogin.data.data.token;

    // 获取园长路由
    const principalRoutes = await axios.get(
      `${API_BASE_URL}/dynamic-permissions/dynamic-routes`,
      { headers: { 'Authorization': `Bearer ${principalToken}` } }
    );

    // 获取管理员路由
    const adminRoutes = await axios.get(
      `${API_BASE_URL}/dynamic-permissions/dynamic-routes`,
      { headers: { 'Authorization': `Bearer ${adminToken}` } }
    );

    const principalData = principalRoutes.data.data.routes || [];
    const adminData = adminRoutes.data.data.routes || [];

    // 提取中心菜单
    const extractCenters = (routes) => {
      return routes.filter(route => {
        const path = route.path || '';
        const name = route.name || route.chinese_name || '';
        return (
          path.includes('/centers/') || 
          path.includes('-center') ||
          name.includes('Center') ||
          name.includes('中心')
        );
      }).map(route => ({
        name: route.chinese_name || route.name,
        path: route.path,
        id: route.id,
        sort: route.sort || 0
      }));
    };

    const principalCenters = extractCenters(principalData);
    const adminCenters = extractCenters(adminData);

    console.log('园长中心菜单顺序:\n');
    principalCenters.forEach((center, index) => {
      console.log(`${index + 1}. ${center.name}`);
      console.log(`   路径: ${center.path}`);
      console.log(`   排序: ${center.sort}\n`);
    });

    console.log('=' .repeat(80));
    console.log('管理员中心菜单顺序:\n');
    adminCenters.forEach((center, index) => {
      console.log(`${index + 1}. ${center.name}`);
      console.log(`   路径: ${center.path}`);
      console.log(`   排序: ${center.sort}\n`);
    });

    console.log('=' .repeat(80));
    console.log('📊 对比分析:\n');
    console.log(`  园长菜单数: ${principalCenters.length}个`);
    console.log(`  管理员菜单数: ${adminCenters.length}个`);
    console.log(`  差异: ${adminCenters.length - principalCenters.length}个\n`);

    console.log('=' .repeat(80));

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
  }
}

compareMenuOrder();
