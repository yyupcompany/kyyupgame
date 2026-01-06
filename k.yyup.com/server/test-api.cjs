const jwt = require('jsonwebtoken');
const http = require('http');

// 生成一个测试token（园长角色）- 注意：decoded.id 用于查询用户
const testToken = jwt.sign(
  { id: 1, username: 'principal', role: 'principal', isDemo: true },
  'kindergarten-enrollment-secret',  // 使用正确的JWT密钥
  { expiresIn: '1h' }
);

console.log('=== 测试通知统计API（带Token）===\n');
console.log('Token有效（园长角色）\n');

// 测试通知统计API
async function testApi() {
  const result = await new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/principal/notifications/statistics?page=1&pageSize=10',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + testToken,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data: data });
      });
    });

    req.on('error', (e) => reject(e.message));
    req.end();
  });

  console.log('响应状态:', result.status);
  console.log('\n响应内容:');
  try {
    const json = JSON.parse(result.data);
    console.log(JSON.stringify(json, null, 2).substring(0, 2000));
  } catch (e) {
    console.log(result.data.substring(0, 500));
  }
}

testApi().catch(console.error);
