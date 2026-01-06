const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function findPrincipalUser() {
  console.log('\n🔍 查找园长角色用户\n');
  
  try {
    // 先用admin登录获取token
    const adminLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'test_admin',
      password: 'admin123'
    });
    
    const adminToken = adminLogin.data.data.token;
    
    // 获取所有用户
    const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    const users = usersResponse.data.data.items || usersResponse.data.data || [];
    
    console.log('📋 所有用户列表:\n');
    console.log('| ID | 用户名 | 角色 | 姓名 |');
    console.log('|----|--------|------|------|');
    
    users.forEach(user => {
      console.log(`| ${user.id} | ${user.username} | ${user.role} | ${user.name || '-'} |`);
    });
    
    console.log('\n🎯 角色分类:\n');
    
    const roleGroups = {};
    users.forEach(user => {
      const role = user.role || 'unknown';
      if (!roleGroups[role]) {
        roleGroups[role] = [];
      }
      roleGroups[role].push(user);
    });
    
    Object.entries(roleGroups).forEach(([role, userList]) => {
      console.log(`${role} (${userList.length}个):`);
      userList.forEach(user => {
        console.log(`  - ${user.username} (ID: ${user.id})`);
      });
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
    if (error.response) {
      console.error('响应:', error.response.status, error.response.data);
    }
  }
}

findPrincipalUser();
