/**
 * 测试admin账号登录
 */

const testAccounts = [
  { username: 'admin', password: 'admin123' },
  { username: 'admin', password: '123456' },
  { username: 'admin', password: 'password' },
  { username: 'admin', password: 'admin' },
  { username: 'administrator', password: 'admin123' },
  { username: 'administrator', password: '123456' },
  { username: 'root', password: 'admin123' },
  { username: 'root', password: '123456' }
];

async function testAdminLogin() {
  console.log('🔧 开始测试admin账号登录...');

  for (const account of testAccounts) {
    console.log(`Testing account: ${account.username} / ${account.password}`);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: account.username,
          password: account.password
        })
      });

      const result = await response.json();

      if (result.success === true && (result.data.user.role === 'admin' || result.data.user.isAdmin === true)) {
        console.log('✅ Admin account found!');
        console.log('Username:', account.username);
        console.log('Password:', account.password);
        console.log('User info:', result.data.user);
        console.log('Token:', result.data.token);
        return {
          ...result.data,
          credentials: account
        };
      } else if (result.success === true) {
        console.log('✅ Login successful but not admin role:', result.data.user.role);
      } else {
        console.log('❌ Login failed -', result.message);
      }
    } catch (error) {
      console.log('❌ Request failed -', error.message);
    }

    console.log('---');
  }

  console.log('❌ No valid admin account found');
  return null;
}

// 导出函数供其他脚本使用
module.exports = { testAdminLogin };

// 如果直接运行此脚本
if (require.main === module) {
  testAdminLogin()
    .then((result) => {
      if (result) {
        console.log('🎉 Admin login test completed successfully!');
      } else {
        console.log('💥 Admin login test failed');
      }
      process.exit(result ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}