const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function removePrincipalSystemCenter() {
  console.log('\n' + '='.repeat(70));
  console.log('🔧 移除园长角色的系统中心权限');
  console.log('='.repeat(70) + '\n');

  try {
    // 1. 用 principal 登录
    console.log('📍 步骤1: 园长登录');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'principal',
      password: '123456'
    });

    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    
    console.log(`✅ 登录成功 (用户ID: ${user.id}, 角色: ${user.role})\n`);

    // 2. 获取当前权限
    console.log('📍 步骤2: 获取当前权限');
    const routesResponse = await axios.get(
      `${API_BASE_URL}/dynamic-permissions/dynamic-routes`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    const permissions = routesResponse.data.data.permissions || [];
    console.log(`✅ 当前权限数量: ${permissions.length}\n`);

    // 3. 查找系统中心权限
    console.log('📍 步骤3: 查找系统中心权限');
    const systemCenterPermissions = permissions.filter(p => {
      const name = p.chinese_name || p.name || '';
      const code = p.code || p.permission || '';
      const path = p.path || '';
      return (
        name.includes('System Center') ||
        name.includes('系统中心') ||
        code.includes('system_center') ||
        code.includes('SYSTEM_CENTER') ||
        path.includes('/centers/system')
      );
    });

    if (systemCenterPermissions.length === 0) {
      console.log('✅ 园长角色已经没有系统中心权限了！\n');
      return;
    }

    console.log(`找到 ${systemCenterPermissions.length} 个系统中心相关权限:\n`);
    systemCenterPermissions.forEach((p, index) => {
      console.log(`${index + 1}. ${p.chinese_name || p.name}`);
      console.log(`   权限ID: ${p.id}`);
      console.log(`   权限代码: ${p.code || p.permission}`);
      console.log(`   路径: ${p.path || '-'}`);
      console.log('');
    });

    console.log('⚠️  需要手动从数据库中移除这些权限');
    console.log('   或者联系管理员调整权限配置\n');

    console.log('📝 SQL 示例（需要在数据库中执行）:\n');
    systemCenterPermissions.forEach(p => {
      console.log(`-- 移除权限ID ${p.id} (${p.chinese_name || p.name})`);
      console.log(`DELETE FROM role_permissions WHERE permission_id = ${p.id} AND role_id = (SELECT id FROM roles WHERE name = 'principal');\n`);
    });

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    if (error.response) {
      console.error('响应:', error.response.status, error.response.data);
    }
  }
}

removePrincipalSystemCenter();
