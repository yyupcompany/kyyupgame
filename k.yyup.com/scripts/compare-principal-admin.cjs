const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function comparePrincipalAdmin() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 园长(principal) vs 管理员(admin) 权限对比');
  console.log('='.repeat(70) + '\n');

  // 测试账号
  const accounts = [
    { username: 'principal', password: '123456', role: 'principal', desc: '园长' },
    { username: 'admin', password: 'admin123', role: 'admin', desc: '管理员' }
  ];

  const results = {};

  for (const account of accounts) {
    console.log(`📍 测试 ${account.desc} (${account.username})`);
    
    try {
      // 登录
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: account.username,
        password: account.password
      });

      if (!loginResponse.data.success) {
        console.log(`❌ ${account.desc} 登录失败\n`);
        continue;
      }

      const authToken = loginResponse.data.data.token;
      const user = loginResponse.data.data.user;
      
      console.log(`✅ 登录成功`);
      console.log(`   用户ID: ${user.id}`);
      console.log(`   实际角色: ${user.role}`);

      // 获取动态路由
      const routesResponse = await axios.get(
        `${API_BASE_URL}/dynamic-permissions/dynamic-routes`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );

      const data = routesResponse.data.data;
      const routes = data.routes || [];
      const permissions = data.permissions || [];
      
      console.log(`   权限数量: ${permissions.length}`);
      console.log(`   路由数量: ${routes.length}`);

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

      console.log(`   中心菜单: ${centerRoutes.length}个\n`);

      // 保存结果
      results[account.role] = {
        user,
        permissions,
        routes,
        centerRoutes,
        centerNames: centerRoutes.map(r => r.chinese_name || r.name)
      };

    } catch (error) {
      console.log(`❌ ${account.desc} 测试失败: ${error.message}\n`);
    }
  }

  // 对比分析
  if (results.principal && results.admin) {
    console.log('=' .repeat(70));
    console.log('📊 对比分析\n');

    console.log('1️⃣  权限数量对比:');
    console.log(`   园长: ${results.principal.permissions.length}个`);
    console.log(`   管理员: ${results.admin.permissions.length}个`);
    console.log(`   差异: ${results.admin.permissions.length - results.principal.permissions.length}个 (管理员多)\n`);

    console.log('2️⃣  路由数量对比:');
    console.log(`   园长: ${results.principal.routes.length}个`);
    console.log(`   管理员: ${results.admin.routes.length}个`);
    console.log(`   差异: ${results.admin.routes.length - results.principal.routes.length}个 (管理员多)\n`);

    console.log('3️⃣  中心菜单对比:');
    console.log(`   园长: ${results.principal.centerRoutes.length}个`);
    console.log(`   管理员: ${results.admin.centerRoutes.length}个`);
    console.log(`   差异: ${results.admin.centerRoutes.length - results.principal.centerRoutes.length}个 (管理员多)\n`);

    // 找出差异菜单
    const principalMenus = results.principal.centerNames;
    const adminMenus = results.admin.centerNames;

    console.log('4️⃣  菜单差异分析:\n');
    
    const adminOnly = adminMenus.filter(name => !principalMenus.includes(name));
    const principalOnly = principalMenus.filter(name => !adminMenus.includes(name));
    const common = principalMenus.filter(name => adminMenus.includes(name));

    console.log('   管理员专属菜单:');
    if (adminOnly.length > 0) {
      adminOnly.forEach(name => console.log(`   - ${name}`));
    } else {
      console.log('   (无)');
    }

    console.log('\n   园长专属菜单:');
    if (principalOnly.length > 0) {
      principalOnly.forEach(name => console.log(`   - ${name}`));
    } else {
      console.log('   (无)');
    }

    console.log(`\n   共同菜单: ${common.length}个\n`);

    // 详细菜单列表
    console.log('5️⃣  完整菜单对比表:\n');
    console.log('   | 序号 | 菜单名称 | 园长 | 管理员 |');
    console.log('   |------|----------|------|--------|');
    
    const allMenus = [...new Set([...principalMenus, ...adminMenus])];
    allMenus.forEach((name, index) => {
      const principalHas = principalMenus.includes(name) ? '✅' : '❌';
      const adminHas = adminMenus.includes(name) ? '✅' : '❌';
      console.log(`   | ${index + 1} | ${name} | ${principalHas} | ${adminHas} |`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('📝 总结:\n');
    console.log(`   - 园长有 ${results.principal.centerRoutes.length} 个中心菜单`);
    console.log(`   - 管理员有 ${results.admin.centerRoutes.length} 个中心菜单`);
    console.log(`   - 管理员比园长多 ${adminOnly.length} 个菜单`);
    
    if (adminOnly.length > 0) {
      console.log(`\n   管理员多出的菜单:`);
      adminOnly.forEach(name => console.log(`   - ${name}`));
    }
    
    console.log('\n' + '='.repeat(70));

  } else {
    console.log('\n⚠️  无法进行对比，某个角色登录失败\n');
  }
}

comparePrincipalAdmin();

