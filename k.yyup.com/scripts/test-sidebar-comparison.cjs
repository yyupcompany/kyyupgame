const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

const ROLES = {
  teacher: {
    username: 'test_teacher',
    password: 'admin123',
    name: '教师'
  },
  admin: {
    username: 'test_admin',
    password: 'admin123',
    name: '园长/管理员'
  }
};

async function testSidebarForRole(role) {
  console.log('\n' + '='.repeat(70));
  console.log(`🎯 ${ROLES[role].name}角色侧边栏测试`);
  console.log('='.repeat(70) + '\n');

  try {
    // 步骤1: 登录
    console.log(`📍 步骤1: ${ROLES[role].name}登录`);
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: ROLES[role].username,
      password: ROLES[role].password
    });

    if (!loginResponse.data.success) {
      console.log('❌ 登录失败:', loginResponse.data.message);
      return null;
    }

    const authToken = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    
    console.log('✅ 登录成功！');
    console.log(`   用户ID: ${user.id}`);
    console.log(`   用户名: ${user.username}`);
    console.log(`   角色: ${user.role}`);

    // 步骤2: 获取动态路由
    console.log('\n📍 步骤2: 获取动态路由（侧边栏菜单）');
    const routesResponse = await axios.get(
      `${API_BASE_URL}/dynamic-permissions/dynamic-routes`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    if (!routesResponse.data.success) {
      console.log('❌ 动态路由获取失败:', routesResponse.data.message);
      return null;
    }

    const data = routesResponse.data.data;
    const routes = data.routes || [];
    const permissions = data.permissions || [];
    
    console.log('✅ 动态路由获取成功！');
    console.log(`   权限数量: ${permissions.length}`);
    console.log(`   路由数量: ${routes.length}`);

    // 步骤3: 分析侧边栏菜单
    console.log('\n📍 步骤3: 分析侧边栏菜单结构');
    
    // 过滤出中心类路由（侧边栏主菜单）
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

    console.log(`\n   中心类路由数量: ${centerRoutes.length}`);
    console.log('\n   侧边栏菜单列表:');
    
    const menuItems = [];
    centerRoutes.forEach((route, index) => {
      const menuItem = {
        index: index + 1,
        name: route.chinese_name || route.name,
        path: route.path,
        children: route.children ? route.children.length : 0,
        component: route.component || route.file_path
      };
      menuItems.push(menuItem);
      
      console.log(`   ${menuItem.index}. ${menuItem.name}`);
      console.log(`      路径: ${menuItem.path}`);
      console.log(`      子菜单: ${menuItem.children}个`);
      if (menuItem.component) {
        console.log(`      组件: ${menuItem.component}`);
      }
    });

    // 步骤4: 统计权限类型
    console.log('\n📍 步骤4: 权限类型统计');
    const permissionTypes = {};
    permissions.forEach(p => {
      const type = p.type || '未分类';
      permissionTypes[type] = (permissionTypes[type] || 0) + 1;
    });
    
    console.log('\n   权限类型分布:');
    Object.entries(permissionTypes).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}个`);
    });

    return {
      role,
      roleName: ROLES[role].name,
      user,
      totalPermissions: permissions.length,
      totalRoutes: routes.length,
      centerRoutes: centerRoutes.length,
      menuItems,
      permissionTypes
    };

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response) {
      console.error('   响应状态:', error.response.status);
      console.error('   响应数据:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

async function compareSidebars() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 教师 vs 园长/管理员 侧边栏对比测试');
  console.log('='.repeat(70));

  // 测试教师角色
  const teacherResult = await testSidebarForRole('teacher');
  
  // 测试管理员角色
  const adminResult = await testSidebarForRole('admin');

  if (!teacherResult || !adminResult) {
    console.log('\n❌ 测试失败，无法进行对比');
    return;
  }

  // 对比分析
  console.log('\n' + '='.repeat(70));
  console.log('📊 侧边栏对比分析');
  console.log('='.repeat(70) + '\n');

  // 1. 权限数量对比
  console.log('1️⃣  权限数量对比:');
  console.log(`   教师: ${teacherResult.totalPermissions}个`);
  console.log(`   园长: ${adminResult.totalPermissions}个`);
  console.log(`   差异: ${adminResult.totalPermissions - teacherResult.totalPermissions}个 (园长多)`);

  // 2. 路由数量对比
  console.log('\n2️⃣  路由数量对比:');
  console.log(`   教师: ${teacherResult.totalRoutes}个`);
  console.log(`   园长: ${adminResult.totalRoutes}个`);
  console.log(`   差异: ${adminResult.totalRoutes - teacherResult.totalRoutes}个 (园长多)`);

  // 3. 侧边栏菜单对比
  console.log('\n3️⃣  侧边栏菜单数量对比:');
  console.log(`   教师: ${teacherResult.centerRoutes}个中心`);
  console.log(`   园长: ${adminResult.centerRoutes}个中心`);
  console.log(`   差异: ${adminResult.centerRoutes - teacherResult.centerRoutes}个 (园长多)`);

  // 4. 菜单详细对比
  console.log('\n4️⃣  菜单详细对比:');
  
  const teacherMenuNames = teacherResult.menuItems.map(m => m.name);
  const adminMenuNames = adminResult.menuItems.map(m => m.name);

  console.log('\n   教师专属菜单:');
  const teacherOnly = teacherMenuNames.filter(name => !adminMenuNames.includes(name));
  if (teacherOnly.length > 0) {
    teacherOnly.forEach(name => console.log(`   - ${name}`));
  } else {
    console.log('   (无)');
  }

  console.log('\n   园长专属菜单:');
  const adminOnly = adminMenuNames.filter(name => !teacherMenuNames.includes(name));
  if (adminOnly.length > 0) {
    adminOnly.forEach(name => console.log(`   - ${name}`));
  } else {
    console.log('   (无)');
  }

  console.log('\n   共同菜单:');
  const common = teacherMenuNames.filter(name => adminMenuNames.includes(name));
  if (common.length > 0) {
    common.forEach(name => console.log(`   - ${name}`));
  } else {
    console.log('   (无)');
  }

  // 5. 权限类型对比
  console.log('\n5️⃣  权限类型对比:');
  console.log('\n   教师权限类型:');
  Object.entries(teacherResult.permissionTypes).forEach(([type, count]) => {
    console.log(`   - ${type}: ${count}个`);
  });
  
  console.log('\n   园长权限类型:');
  Object.entries(adminResult.permissionTypes).forEach(([type, count]) => {
    console.log(`   - ${type}: ${count}个`);
  });

  // 6. 生成对比表格
  console.log('\n6️⃣  完整菜单对比表:');
  console.log('\n   | 序号 | 菜单名称 | 教师 | 园长 | 子菜单数 |');
  console.log('   |------|----------|------|------|----------|');
  
  const allMenuNames = [...new Set([...teacherMenuNames, ...adminMenuNames])];
  allMenuNames.forEach((name, index) => {
    const teacherHas = teacherMenuNames.includes(name) ? '✅' : '❌';
    const adminHas = adminMenuNames.includes(name) ? '✅' : '❌';
    const teacherMenu = teacherResult.menuItems.find(m => m.name === name);
    const adminMenu = adminResult.menuItems.find(m => m.name === name);
    const children = teacherMenu?.children || adminMenu?.children || 0;
    
    console.log(`   | ${index + 1} | ${name} | ${teacherHas} | ${adminHas} | ${children} |`);
  });

  console.log('\n' + '='.repeat(70));
  console.log('✅ 侧边栏对比测试完成');
  console.log('='.repeat(70) + '\n');

  // 7. 总结
  console.log('📝 测试总结:');
  console.log(`   - 教师角色有 ${teacherResult.centerRoutes} 个侧边栏菜单`);
  console.log(`   - 园长角色有 ${adminResult.centerRoutes} 个侧边栏菜单`);
  console.log(`   - 园长比教师多 ${adminResult.centerRoutes - teacherResult.centerRoutes} 个菜单`);
  console.log(`   - 共同菜单: ${common.length} 个`);
  console.log(`   - 教师专属: ${teacherOnly.length} 个`);
  console.log(`   - 园长专属: ${adminOnly.length} 个`);
}

// 运行对比测试
compareSidebars();

