/**
 * 测试园长账号登录
 */

const passwords = ['123456', 'password', 'test', 'admin', 'root', 'principal', ''];

async function testLogin() {
  for (const pwd of passwords) {
    console.log(`Testing password: '${pwd}'`);

    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'principal',
        password: pwd
      })
    });

    const result = await response.json();

    if (result.success === true) {
      console.log('✅ Password found:', pwd);
      console.log('Login response:', result);
      return result;
    } else {
      console.log('❌ Password failed -', result.message);
    }
  }

  console.log('❌ No valid password found');
}

testLogin();