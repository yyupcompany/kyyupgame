const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
const PRINCIPAL_USERNAME = 'test_admin';
const PRINCIPAL_PASSWORD = 'admin123';

async function testPrincipal() {
  console.log('\n' + '='.repeat(70));
  console.log('🎯 园长角色简化测试');
  console.log('='.repeat(70) + '\n');

  try {
    // 步骤1: 园长登录
    console.log('📍 步骤1: 园长登录');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: PRINCIPAL_USERNAME,
      password: PRINCIPAL_PASSWORD
    });

    if (!loginResponse.data.success) {
      console.log('❌ 登录失败:', loginResponse.data.message);
      return;
    }

    const authToken = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    
    console.log('✅ 登录成功！');
    console.log(`   用户ID: ${user.id}`);
    console.log(`   用户名: ${user.username}`);
    console.log(`   角色: ${user.role}`);

    // 步骤2: 获取动态路由
    console.log('\n📍 步骤2: 获取动态路由');
    const routesResponse = await axios.get(
      `${API_BASE_URL}/dynamic-permissions/dynamic-routes`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    if (!routesResponse.data.success) {
      console.log('❌ 动态路由获取失败:', routesResponse.data.message);
      return;
    }

    const data = routesResponse.data.data;
    const routes = data.routes || [];
    const permissions = data.permissions || [];
    
    console.log('✅ 动态路由获取成功！');
    console.log(`   权限数量: ${permissions.length}`);
    console.log(`   路由数量: ${routes.length}`);
    
    // 显示所有一级路由
    if (routes.length > 0) {
      console.log('\n   一级路由列表:');
      routes.forEach((route, index) => {
        const childrenCount = route.children ? route.children.length : 0;
        console.log(`   ${index + 1}. ${route.name || route.chinese_name} (${route.path}) - ${childrenCount}个子路由`);
      });
    } else {
      console.log('   ⚠️  没有路由数据');
    }

    // 显示权限类型统计
    if (permissions.length > 0) {
      const typeStats = {};
      permissions.forEach(p => {
        const type = p.type || '未分类';
        typeStats[type] = (typeStats[type] || 0) + 1;
      });
      
      console.log('\n   权限类型统计:');
      Object.entries(typeStats).forEach(([type, count]) => {
        console.log(`   - ${type}: ${count}个`);
      });
    }

    // 步骤3: 获取用户权限代码
    console.log('\n📍 步骤3: 获取用户权限代码');
    const permCodesResponse = await axios.get(
      `${API_BASE_URL}/dynamic-permissions/user-permissions`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    if (permCodesResponse.data.success) {
      const permissionCodes = permCodesResponse.data.data;
      console.log('✅ 权限代码获取成功！');
      console.log(`   权限代码数量: ${permissionCodes.length}`);
      console.log(`   前10个权限代码: ${permissionCodes.slice(0, 10).join(', ')}`);
    } else {
      console.log('❌ 权限代码获取失败:', permCodesResponse.data.message);
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ 园长角色测试完成');
    console.log('='.repeat(70) + '\n');

    // 总结
    console.log('📊 测试总结:');
    console.log(`   ✅ 登录: 成功`);
    console.log(`   ✅ 动态路由: ${routes.length}个`);
    console.log(`   ✅ 权限数量: ${permissions.length}个`);
    console.log(`   ✅ 权限代码: ${permCodesResponse.data.data.length}个`);
    
    if (routes.length === 0) {
      console.log('\n⚠️  警告: 没有路由数据，可能的原因:');
      console.log('   1. 权限表中没有数据');
      console.log('   2. 用户没有分配角色');
      console.log('   3. 角色没有分配权限');
      console.log('   4. buildDynamicRoutes函数有问题');
    }

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response) {
      console.error('   响应状态:', error.response.status);
      console.error('   响应数据:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// 运行测试
testPrincipal();

