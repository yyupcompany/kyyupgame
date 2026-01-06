// 测试菜单API
const http = require('http');

// 从环境变量或命令行参数获取token
const token = process.argv[2] || process.env.TOKEN;

if (!token) {
  console.error('❌ 请提供token: node test-menu-api.js <token>');
  process.exit(1);
}

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth-permissions/menu',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

console.log('🔍 测试菜单API...');
console.log('Token:', token.substring(0, 20) + '...');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n📊 响应状态:', res.statusCode);
    console.log('📊 响应头:', res.headers);
    
    try {
      const json = JSON.parse(data);
      console.log('\n✅ 响应数据:');
      console.log(JSON.stringify(json, null, 2));
      
      if (json.success && json.data) {
        console.log('\n📁 菜单数量:', json.data.length);
        if (json.data.length > 0) {
          console.log('📁 第一个菜单:', JSON.stringify(json.data[0], null, 2));
        }
      }
    } catch (e) {
      console.error('❌ 解析JSON失败:', e.message);
      console.log('原始响应:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ 请求失败:', e.message);
});

req.end();

