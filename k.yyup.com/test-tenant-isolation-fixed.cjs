const axios = require('axios');

async function testTenantIsolation() {
  try {
    console.log('🔍 测试多租户数据库隔离...');

    // 1. 首先模拟访问 k001.yyup.cc 域名
    console.log('\n📍 测试1: 模拟k001.yyup.cc域名访问');
    const response1 = await axios.get('http://localhost:3000/api/health', {
      headers: {
        'Host': 'k001.yyup.cc',
        'X-Forwarded-Host': 'k001.yyup.cc'
      }
    });

    console.log('健康检查响应:', JSON.stringify(response1.data, null, 2));

    // 2. 通过k001域名查询用户
    console.log('\n👥 测试2: 通过k001域名查询用户');
    try {
      const response2 = await axios.get('http://localhost:3000/api/users', {
        headers: {
          'Host': 'k001.yyup.cc',
          'X-Forwarded-Host': 'k001.yyup.cc',
          'Authorization': 'Bearer mock-jwt-token-test'
        }
      });

      console.log('k001域名的用户数据:');
      if (response2.data.success && response2.data.data && response2.data.data.list) {
        const users = response2.data.data.list;
        console.log(`找到 ${users.length} 个用户:`);
        users.forEach(user => {
          console.log(`  - ID: ${user.id}, 用户名: ${user.username}, 姓名: ${user.realName}, 角色: ${user.role}`);
        });

        // 检查是否有test_parent_k001用户
        const k001User = users.find(u => u.username === 'test_parent_k001');
        if (k001User) {
          console.log('\n✅ 找到了test_parent_k001用户！');
          console.log('  - 这证明数据确实插入了租户数据库');
        } else {
          console.log('\n❌ 没有找到test_parent_k001用户');
        }
      }
    } catch (error) {
      console.error('查询用户失败:', error.response?.status, error.response?.statusText);
      if (error.response?.data) {
        console.error('错误详情:', JSON.stringify(error.response.data, null, 2));
      }
    }

    // 3. 测试其他域名（比如k002.yyup.cc）是否看不到相同的数据
    console.log('\n🔍 测试3: 模拟k002.yyup.cc域名访问');
    try {
      const response3 = await axios.get('http://localhost:3000/api/users', {
        headers: {
          'Host': 'k002.yyup.cc',
          'X-Forwarded-Host': 'k002.yyup.cc',
          'Authorization': 'Bearer mock-jwt-token-test'
        }
      });

      console.log('k002域名的用户数据:');
      if (response3.data.success && response3.data.data && response3.data.data.list) {
        const users = response3.data.data.list;
        console.log(`找到 ${users.length} 个用户`);

        // 检查是否能看到k001的用户
        const k001User = users.find(u => u.username === 'test_parent_k001');
        if (k001User) {
          console.log('⚠️  k002域名也能看到k001用户 - 数据隔离可能有问题');
        } else {
          console.log('✅ k002域名看不到k001用户 - 数据隔离正常');
        }
      }
    } catch (error) {
      console.log('k002域名查询失败（这是预期的，因为k002租户可能不存在）');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testTenantIsolation();