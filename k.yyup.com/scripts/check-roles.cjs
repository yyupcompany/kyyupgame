const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function checkRoles() {
  console.log('\n🔍 检查系统角色\n');
  
  // 测试不同的用户
  const testUsers = [
    { username: 'admin', password: 'admin123', desc: '超级管理员' },
    { username: 'test_admin', password: 'admin123', desc: '测试管理员' },
    { username: 'test_principal', password: 'admin123', desc: '测试园长' },
    { username: 'principal', password: 'admin123', desc: '园长' },
    { username: 'test_teacher', password: 'admin123', desc: '测试教师' },
  ];
  
  console.log('📋 测试用户登录:\n');
  
  for (const user of testUsers) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: user.username,
        password: user.password
      });
      
      if (response.data.success) {
        const userData = response.data.data.user;
        console.log(`✅ ${user.desc} (${user.username})`);
        console.log(`   用户ID: ${userData.id}`);
        console.log(`   角色: ${userData.role}`);
        console.log(`   姓名: ${userData.name || '-'}`);
        console.log('');
      }
    } catch (error) {
      console.log(`❌ ${user.desc} (${user.username}) - 登录失败`);
      console.log('');
    }
  }
}

checkRoles();
