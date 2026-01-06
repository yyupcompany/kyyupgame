const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testPrincipalAccount() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 测试 test_principal 账号');
  console.log('='.repeat(70) + '\n');

  const testAccounts = [
    { username: 'test_principal', password: 'admin123', desc: 'test_principal/admin123' },
    { username: 'test_principal', password: '123456', desc: 'test_principal/123456' },
  ];

  for (const account of testAccounts) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: account.username,
        password: account.password
      });

      if (response.data.success) {
        const user = response.data.data.user;
        const token = response.data.data.token;
        
        console.log(`✅ ${account.desc} - 登录成功`);
        console.log(`   用户ID: ${user.id}`);
        console.log(`   用户名: ${user.username}`);
        console.log(`   实际角色: ${user.role}`);
        
        // 获取权限
        const routesResponse = await axios.get(
          `${API_BASE_URL}/dynamic-permissions/dynamic-routes`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        const data = routesResponse.data.data;
        const routes = data.routes || [];
        const permissions = data.permissions || [];
        
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
        
        console.log(`   权限数量: ${permissions.length}`);
        console.log(`   路由数量: ${routes.length}`);
        console.log(`   中心菜单: ${centerRoutes.length}个`);
        
        // 检查是否有系统中心
        const hasSystemCenter = centerRoutes.some(r => 
          (r.chinese_name || r.name) === 'System Center' || 
          (r.chinese_name || r.name) === '系统中心'
        );
        
        console.log(`   系统中心: ${hasSystemCenter ? '✅ 有' : '❌ 无'}`);
        
        console.log('\n   中心菜单列表:');
        centerRoutes.forEach((route, index) => {
          const name = route.chinese_name || route.name;
          console.log(`   ${index + 1}. ${name}`);
        });
        
        console.log('\n');
        return;
      }
    } catch (error) {
      console.log(`❌ ${account.desc} - 登录失败`);
      if (error.response?.status === 401) {
        console.log(`   原因: 用户名或密码错误\n`);
      } else {
        console.log(`   错误: ${error.message}\n`);
      }
    }
  }
  
  console.log('⚠️  test_principal 账号不存在或密码不正确');
  console.log('建议: 创建 test_principal 账号，角色为 principal\n');
}

testPrincipalAccount();
