const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function detailedMenuComparison() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 园长 vs 管理员 - 详细中心菜单对比列表');
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
        children: route.children ? route.children.length : 0
      }));
    };

    const principalCenters = extractCenters(principalData);
    const adminCenters = extractCenters(adminData);

    // 创建对比表
    console.log('┌─────┬────────────────────────────┬────────┬────────┬──────────┐');
    console.log('│ 序号 │ 中心名称                   │ 园长   │ 管理员 │ 说明     │');
    console.log('├─────┼────────────────────────────┼────────┼────────┼──────────┤');

    const allCenterNames = new Set([
      ...principalCenters.map(c => c.name),
      ...adminCenters.map(c => c.name)
    ]);

    let index = 1;
    const sortedCenters = Array.from(allCenterNames).sort();

    sortedCenters.forEach(centerName => {
      const inPrincipal = principalCenters.some(c => c.name === centerName);
      const inAdmin = adminCenters.some(c => c.name === centerName);
      
      const principalMark = inPrincipal ? '✅' : '❌';
      const adminMark = inAdmin ? '✅' : '❌';
      
      let note = '';
      if (inPrincipal && inAdmin) {
        note = '共有';
      } else if (!inPrincipal && inAdmin) {
        note = '管理员专属';
      } else if (inPrincipal && !inAdmin) {
        note = '园长专属';
      }

      const paddedIndex = String(index).padEnd(4);
      const paddedName = centerName.padEnd(26);
      const paddedNote = note.padEnd(10);

      console.log(`│ ${paddedIndex}│ ${paddedName} │ ${principalMark}    │ ${adminMark}    │ ${paddedNote}│`);
      index++;
    });

    console.log('└─────┴────────────────────────────┴────────┴────────┴──────────┘');

    console.log('\n' + '='.repeat(80));
    console.log('📊 统计汇总\n');
    console.log(`  园长中心菜单总数: ${principalCenters.length}个`);
    console.log(`  管理员中心菜单总数: ${adminCenters.length}个`);
    console.log(`  差异: ${adminCenters.length - principalCenters.length}个 (管理员多)\n`);

    // 统计共有和专属
    const commonCenters = sortedCenters.filter(name => 
      principalCenters.some(c => c.name === name) && 
      adminCenters.some(c => c.name === name)
    );

    const adminOnlyCenters = sortedCenters.filter(name => 
      !principalCenters.some(c => c.name === name) && 
      adminCenters.some(c => c.name === name)
    );

    const principalOnlyCenters = sortedCenters.filter(name => 
      principalCenters.some(c => c.name === name) && 
      !adminCenters.some(c => c.name === name)
    );

    console.log(`  共有菜单: ${commonCenters.length}个`);
    console.log(`  管理员专属: ${adminOnlyCenters.length}个`);
    console.log(`  园长专属: ${principalOnlyCenters.length}个\n`);

    if (adminOnlyCenters.length > 0) {
      console.log('  管理员专属菜单列表:');
      adminOnlyCenters.forEach((name, idx) => {
        const center = adminCenters.find(c => c.name === name);
        console.log(`    ${idx + 1}. ${name}`);
        console.log(`       路径: ${center.path}`);
        console.log(`       子菜单: ${center.children}个\n`);
      });
    }

    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应:', error.response.status, error.response.data);
    }
  }
}

detailedMenuComparison();
