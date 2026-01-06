const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function listAdminMenus() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 管理员(admin)角色的完整22个中心菜单列表');
  console.log('='.repeat(70) + '\n');

  try {
    // 登录admin
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    const authToken = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    
    console.log(`✅ 登录成功: ${user.username} (角色: ${user.role})\n`);

    // 获取动态路由
    const routesResponse = await axios.get(
      `${API_BASE_URL}/dynamic-permissions/dynamic-routes`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    const data = routesResponse.data.data;
    const routes = data.routes || [];
    
    // 过滤中心类路由
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

    console.log(`📊 中心菜单总数: ${centerRoutes.length}个\n`);
    console.log('=' .repeat(70));
    console.log('完整菜单列表:\n');
    
    centerRoutes.forEach((route, index) => {
      const name = route.chinese_name || route.name;
      const path = route.path;
      const children = route.children ? route.children.length : 0;
      const component = route.component || route.file_path || '-';
      
      console.log(`${index + 1}. ${name}`);
      console.log(`   路径: ${path}`);
      console.log(`   子菜单: ${children}个`);
      console.log(`   组件: ${component}`);
      
      if (route.children && route.children.length > 0) {
        console.log(`   子菜单列表:`);
        route.children.forEach((child, idx) => {
          console.log(`     ${idx + 1}. ${child.chinese_name || child.name} (${child.path})`);
        });
      }
      console.log('');
    });

    console.log('=' .repeat(70));
    console.log('📊 统计信息:\n');
    
    // 按路径前缀分类
    const byPrefix = {
      '/centers/': [],
      '/teacher-center/': [],
      '/parent-center': [],
      'other': []
    };
    
    centerRoutes.forEach(route => {
      const path = route.path || '';
      if (path.startsWith('/centers/')) {
        byPrefix['/centers/'].push(route);
      } else if (path.startsWith('/teacher-center/')) {
        byPrefix['/teacher-center/'].push(route);
      } else if (path.startsWith('/parent-center')) {
        byPrefix['/parent-center'].push(route);
      } else {
        byPrefix['other'].push(route);
      }
    });
    
    console.log('按路径分类:');
    console.log(`  /centers/* : ${byPrefix['/centers/'].length}个`);
    console.log(`  /teacher-center/* : ${byPrefix['/teacher-center/'].length}个`);
    console.log(`  /parent-center : ${byPrefix['/parent-center'].length}个`);
    console.log(`  其他 : ${byPrefix['other'].length}个\n`);
    
    // 统计有子菜单的
    const withChildren = centerRoutes.filter(r => r.children && r.children.length > 0);
    const withoutChildren = centerRoutes.filter(r => !r.children || r.children.length === 0);
    
    console.log('子菜单统计:');
    console.log(`  有子菜单: ${withChildren.length}个`);
    console.log(`  无子菜单: ${withoutChildren.length}个\n`);
    
    console.log('=' .repeat(70));

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应:', error.response.status, error.response.data);
    }
  }
}

listAdminMenus();
