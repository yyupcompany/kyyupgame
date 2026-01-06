const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function clearCache() {
  console.log('\n🔧 清除权限缓存\n');
  
  try {
    // 用admin登录
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    
    // 清除缓存
    const response = await axios.post(
      `${API_BASE_URL}/dynamic-permissions/clear-cache`,
      {},
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    console.log('✅ 缓存清除成功！');
    console.log('响应:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ 清除缓存失败:', error.response?.data || error.message);
  }
}

clearCache();
