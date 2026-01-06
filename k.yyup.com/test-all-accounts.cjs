/**
 * 测试所有账号登录
 */

const BASE_URL = 'http://localhost:3000';

async function testAllAccounts() {
  console.log('='.repeat(80));
  console.log('🎯 测试所有账号登录');
  console.log('='.repeat(80));

  const testAccounts = [
    { role: 'admin', username: 'admin', password: '123456', name: '管理员' },
    { role: 'teacher', username: 'teacher', password: '123456', name: '教师' },
    { role: 'parent', username: 'parent', password: '123456', name: '家长' },
    { role: 'principal', username: 'principal', password: '123456', name: '园长' }
  ];

  let successCount = 0;

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
        successCount++;
      } else {
        console.log(`❌ ${account.name} 登录失败: ${data.message || response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${account.name} 登录出错: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(80));
  console.log(`总账号数: ${testAccounts.length}`);
  console.log(`成功登录: ${successCount}`);
  console.log(`失败: ${testAccounts.length - successCount}`);
  console.log(`成功率: ${(successCount / testAccounts.length * 100).toFixed(1)}%`);
  console.log('='.repeat(80));

  if (successCount === testAccounts.length) {
    console.log('\n🎉 所有账号登录成功！');
  } else {
    console.log('\n⚠️  部分账号登录失败，请检查配置');
  }
}

testAllAccounts()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('测试失败:', error);
    process.exit(1);
  });