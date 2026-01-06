/**
 * 测试快捷登录功能
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

// 快捷登录账号
const quickLoginAccounts = [
  { role: 'admin', username: 'admin', password: 'admin123' },
  { role: 'principal', username: 'principal', password: '123456' },
  { role: 'teacher', username: 'test_teacher', password: 'admin123' },
  { role: 'parent', username: 'test_parent', password: 'admin123' }
];

async function testQuickLogin() {
  console.log('🧪 测试快捷登录功能...\n');

  for (const account of quickLoginAccounts) {
    console.log(`\n📝 测试 ${account.role} 角色登录 (${account.username})`);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username: account.username,
        password: account.password
      });

      if (response.data.success) {
        console.log(`  ✅ 登录成功`);
        console.log(`     - 用户: ${response.data.data.user.username}`);
        console.log(`     - 角色: ${response.data.data.user.role}`);
        console.log(`     - Token: ${response.data.data.token.substring(0, 20)}...`);
      } else {
        console.log(`  ❌ 登录失败: ${response.data.message}`);
      }
    } catch (error) {
      if (error.response) {
        console.log(`  ❌ 登录失败: ${error.response.data.message || error.response.statusText}`);
        console.log(`     - 错误代码: ${error.response.data.error || 'N/A'}`);
      } else {
        console.log(`  ❌ 请求失败: ${error.message}`);
      }
    }
  }

  console.log('\n✅ 测试完成！');
}

testQuickLogin();

