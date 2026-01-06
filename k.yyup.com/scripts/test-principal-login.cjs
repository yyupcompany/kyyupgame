const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testPrincipalLogin() {
  console.log('\n🔍 测试园长登录\n');
  
  const testAccounts = [
    { username: 'principal', password: '123456', desc: 'principal/123456' },
    { username: 'principal', password: 'admin123', desc: 'principal/admin123' },
    { username: 'test_principal', password: '123456', desc: 'test_principal/123456' },
    { username: 'test_principal', password: 'admin123', desc: 'test_principal/admin123' },
  ];
  
  for (const account of testAccounts) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: account.username,
        password: account.password
      });
      
      if (response.data.success) {
        const user = response.data.data.user;
        console.log(`✅ ${account.desc} - 登录成功`);
        console.log(`   用户ID: ${user.id}`);
        console.log(`   角色: ${user.role}`);
        console.log(`   用户名: ${user.username}`);
        console.log('');
      }
    } catch (error) {
      console.log(`❌ ${account.desc} - 登录失败`);
    }
  }
}

testPrincipalLogin();
