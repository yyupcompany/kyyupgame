const axios = require('axios');

async function testAPI() {
  try {
    // First login
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'teacher',
      password: '123456'
    });
    
    const token = loginResponse.data.data.token;
    console.log('Token:', token ? 'OK' : 'FAIL');
    
    // Test the rewards API
    const rewardsResponse = await axios.get('http://localhost:3000/api/teacher/rewards', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Rewards API Response:', JSON.stringify(rewardsResponse.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    if (error.stack) console.error('Stack:', error.stack);
  }
}

testAPI();
