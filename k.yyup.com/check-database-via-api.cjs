const axios = require('axios');

async function checkViaAPI() {
  try {
    console.log('🔍 通过k.yyup.com后端API检查数据库信息...');

    // 尝试调用k.yyup.com的用户API来查看是否有数据
    const response = await axios.get('http://localhost:3000/api/users', {
      headers: {
        'Authorization': 'Bearer mock-jwt-token-test',
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ API调用成功');
    console.log('📊 返回的数据:', JSON.stringify(response.data, null, 2));

    // 如果有用户数据，这证明我们连接到了某个数据库
    if (response.data.success && response.data.data && response.data.data.items) {
      const users = response.data.data.items;
      console.log(`\n👥 找到 ${users.length} 个用户:`);
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, 用户名: ${user.username}, 姓名: ${user.realName}, 角色: ${user.role}`);
      });
    }

  } catch (error) {
    console.error('❌ API调用失败:', error.response?.status, error.response?.statusText);
    if (error.response?.data) {
      console.error('错误详情:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

checkViaAPI();