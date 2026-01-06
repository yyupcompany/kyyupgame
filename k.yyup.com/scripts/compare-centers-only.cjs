const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function compareCentersOnly() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 园长 vs 管理员 - 真正的中心菜单对比（只统计category类型）');
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

    // 获取园长权限
    const principalPerms = await axios.get(
      `${API_BASE_URL}/dynamic-permissions/dynamic-routes`,
      { headers: { 'Authorization': `Bearer ${principalToken}` } }
    );

    // 获取管理员权限
    const adminPerms = await axios.get(
      `${API_BASE_URL}/dynamic-permissions/dynamic-routes`,
      { headers: { 'Authorization': `Bearer ${adminToken}` } }
    );

    const principalData = principalPerms.data.data.permissions || [];
    const adminData = adminPerms.data.data.permissions || [];

    // 只提取 type='category' 且路径是 /centers/* 的权限
    const extractCenters = (permissions) => {
      return permissions.filter(perm => {
        return perm.type === 'category' && 
               perm.path && 
               perm.path.startsWith('/centers/');
      }).map(perm => ({
        id: perm.id,
        name: perm.chinese_name || perm.name,
        path: perm.path,
        code: perm.code,
        sort: perm.sort || 0
      })).sort((a, b) => a.sort - b.sort);
    };

    const principalCenters = extractCenters(principalData);
    const adminCenters = extractCenters(adminData);

    console.log('园长的中心菜单（type=category, path=/centers/*）:\n');
    principalCenters.forEach((center, index) => {
      console.log(`${index + 1}. ${center.name}`);
      console.log(`   路径: ${center.path}`);
      console.log(`   代码: ${center.code}`);
      console.log(`   排序: ${center.sort}\n`);
    });

    console.log('=' .repeat(80));
    console.log('管理员的中心菜单（type=category, path=/centers/*）:\n');
    adminCenters.forEach((center, index) => {
      console.log(`${index + 1}. ${center.name}`);
      console.log(`   路径: ${center.path}`);
      console.log(`   代码: ${center.code}`);
      console.log(`   排序: ${center.sort}\n`);
    });

    console.log('=' .repeat(80));
    console.log('📊 统计对比:\n');
    console.log(`  园长中心数: ${principalCenters.length}个`);
    console.log(`  管理员中心数: ${adminCenters.length}个`);
    console.log(`  差异: ${adminCenters.length - principalCenters.length}个\n`);

    // 找出差异
    const principalIds = new Set(principalCenters.map(c => c.id));
    const adminIds = new Set(adminCenters.map(c => c.id));

    const principalOnly = principalCenters.filter(c => !adminIds.has(c.id));
    const adminOnly = adminCenters.filter(c => !principalIds.has(c.id));

    if (adminOnly.length > 0) {
      console.log('管理员专属中心:\n');
      adminOnly.forEach((center, index) => {
        console.log(`${index + 1}. ${center.name} (${center.path})`);
      });
      console.log('');
    }

    if (principalOnly.length > 0) {
      console.log('园长专属中心:\n');
      principalOnly.forEach((center, index) => {
        console.log(`${index + 1}. ${center.name} (${center.path})`);
      });
      console.log('');
    }

    console.log('=' .repeat(80));

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应:', error.response.status, error.response.data);
    }
  }
}

compareCentersOnly();
