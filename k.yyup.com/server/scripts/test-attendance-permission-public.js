const axios = require('axios');

async function testPublicAPI() {
  try {
    console.log('🔍 测试公共API...\n');

    // 测试健康检查
    console.log('📋 测试健康检查API...');
    const healthResponse = await axios.get('http://localhost:3000/health', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ 健康检查:', healthResponse.data);

    // 测试API文档
    console.log('\n📋 测试API文档API...');
    try {
      const docsResponse = await axios.get('http://localhost:3000/api-docs.json', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ API文档可访问，JSON大小:', JSON.stringify(docsResponse.data).length, '字符');
    } catch (error) {
      console.log('❌ API文档访问失败:', error.message);
    }

    console.log('\n🎉 公共API测试完成！服务器运行正常。');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testPublicAPI();