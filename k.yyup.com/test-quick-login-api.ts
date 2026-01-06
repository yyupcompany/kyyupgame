/**
 * 测试快速登录API - 直接调用后端验证
 */

const BASE_URL = 'http://localhost:3000';

async function testQuickLogin() {
  console.log('='.repeat(80));
  console.log('🎯 测试快速登录API');
  console.log('='.repeat(80));

  const testAccounts = [
    { role: 'admin', username: 'admin', password: '123456', name: '管理员' },
    { role: 'teacher', username: 'teacher', password: '123456', name: '教师' },
    { role: 'parent', username: 'parent', password: '123456', name: '家长' }
  ];

  for (const account of testAccounts) {
    console.log(`\n🔄 测试 ${account.name} 登录...`);
    console.log(`   用户名: ${account.username}`);
    console.log(`   密码: ${account.password}`);

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: account.username,
          password: account.password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log(`✅ ${account.name} 登录成功！`);
        console.log(`   Token: ${data.data.token.substring(0, 20)}...`);
        console.log(`   用户: ${data.data.user.username} (${data.data.user.role})`);
      } else {
        console.log(`❌ ${account.name} 登录失败: ${data.message || response.statusText}`);
      }
    } catch (error: any) {
      console.log(`❌ ${account.name} 登录出错: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✨ 测试完成！');
  console.log('='.repeat(80));
}

testQuickLogin()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('测试失败:', error);
    process.exit(1);
  });