const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
const PRINCIPAL_USERNAME = 'test_admin';
const PRINCIPAL_PASSWORD = 'admin123';

let authToken = '';
let userId = '';

async function testPrincipalPermissions() {
  console.log('\n' + '='.repeat(70));
  console.log('🎯 园长权限测试');
  console.log('='.repeat(70) + '\n');

  try {
    // 步骤1: 园长登录
    console.log('📍 步骤1: 园长登录');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: PRINCIPAL_USERNAME,
      password: PRINCIPAL_PASSWORD
    });

    if (loginResponse.data.success) {
      authToken = loginResponse.data.data.token;
      userId = loginResponse.data.data.user.id;
      console.log('✅ 登录成功！');
      console.log(`   用户ID: ${userId}`);
      console.log(`   用户名: ${loginResponse.data.data.user.username}`);
      console.log(`   角色: ${loginResponse.data.data.user.role}`);
      console.log(`   Token: ${authToken.substring(0, 50)}...`);
    } else {
      console.log('❌ 登录失败:', loginResponse.data.message);
      return;
    }

    // 步骤2: 获取用户权限
    console.log('\n📍 步骤2: 获取用户权限');
    const permissionsResponse = await axios.get(
      `${API_BASE_URL}/permissions/user-permissions`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    if (permissionsResponse.data.success) {
      const data = permissionsResponse.data.data;
      const permissions = data.permissions || data;
      console.log('✅ 权限获取成功！');
      console.log(`   权限数量: ${permissions.length}`);

      // 统计权限类型
      const permissionTypes = {};
      permissions.forEach(p => {
        const type = p.type || '未分类';
        permissionTypes[type] = (permissionTypes[type] || 0) + 1;
      });

      console.log('\n   权限类型统计:');
      Object.entries(permissionTypes).forEach(([type, count]) => {
        console.log(`   - ${type}: ${count}个`);
      });

      // 显示前10个权限
      console.log('\n   前10个权限:');
      permissions.slice(0, 10).forEach((p, index) => {
        console.log(`   ${index + 1}. ${p.chinese_name || p.name} (${p.code})`);
      });
    } else {
      console.log('❌ 权限获取失败:', permissionsResponse.data.message);
    }

    // 步骤3: 获取动态路由
    console.log('\n📍 步骤3: 获取动态路由');
    const routesResponse = await axios.get(
      `${API_BASE_URL}/permissions/dynamic-routes`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    if (routesResponse.data.success) {
      const data = routesResponse.data.data;
      const routes = data.routes || data;
      const permissions = data.permissions || [];

      console.log('✅ 动态路由获取成功！');
      console.log(`   权限数量: ${permissions.length}`);
      console.log(`   路由数量: ${Array.isArray(routes) ? routes.length : '非数组'}`);

      if (Array.isArray(routes)) {
        // 显示所有一级路由
        console.log('\n   一级路由列表:');
        routes.forEach((route, index) => {
          const childrenCount = route.children ? route.children.length : 0;
          console.log(`   ${index + 1}. ${route.name || route.chinese_name} (${route.path}) - ${childrenCount}个子路由`);
        });

        // 显示第一个路由的详细信息
        if (routes.length > 0) {
          console.log('\n   第一个路由详情:');
          console.log(JSON.stringify(routes[0], null, 2));
        }
      } else {
        console.log('⚠️  路由数据格式异常');
        console.log('   数据类型:', typeof routes);
        console.log('   数据内容:', JSON.stringify(routes, null, 2).substring(0, 500));
      }
    } else {
      console.log('❌ 动态路由获取失败:', routesResponse.data.message);
    }

    // 步骤4: 检查权限
    console.log('\n📍 步骤4: 检查特定权限');
    const permissionsToCheck = [
      'user:view',
      'user:create',
      'teacher:view',
      'teacher:create',
      'class:view',
      'class:create',
      'student:view',
      'student:create',
      'task:view',
      'task:create'
    ];

    for (const permission of permissionsToCheck) {
      try {
        const checkResponse = await axios.post(
          `${API_BASE_URL}/permissions/check-permission`,
          { permission },
          {
            headers: { 'Authorization': `Bearer ${authToken}` }
          }
        );

        if (checkResponse.data.success && checkResponse.data.data.hasPermission) {
          console.log(`   ✅ ${permission}: 有权限`);
        } else {
          console.log(`   ❌ ${permission}: 无权限`);
        }
      } catch (error) {
        console.log(`   ⚠️  ${permission}: 检查失败 - ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ 园长权限测试完成');
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
testPrincipalPermissions();

