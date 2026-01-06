/**
 * 测试相册API的脚本
 */

const axios = require('axios');

const API_BASE = 'http://127.0.0.1:3000/api';

// 测试用户token（需要根据实际情况调整）
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImtpbmRlcmdhcnRlbklkIjoxLCJpYXQiOjE3MzIwMDAwMDAsImV4cCI6MTczMjA4NjQwMH0.test';

async function testAPI() {
  try {
    console.log('🔍 开始测试相册API...\n');

    // 测试1：获取相册列表
    console.log('1. 测试获取相册列表...');
    try {
      const albumsResponse = await axios.get(`${API_BASE}/photo-album`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      });
      console.log('✅ 相册列表响应:', JSON.stringify(albumsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ 相册列表请求失败:', error.response?.data || error.message);
    }

    console.log('\n2. 测试获取照片列表...');
    try {
      const photosResponse = await axios.get(`${API_BASE}/photo-album/photos`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        },
        params: {
          page: 1,
          pageSize: 20
        }
      });
      console.log('✅ 照片列表响应:', JSON.stringify(photosResponse.data, null, 2));

      if (photosResponse.data.success && photosResponse.data.data?.items) {
        console.log(`📸 找到 ${photosResponse.data.data.items.length} 张照片`);
        console.log('第一张照片URL:', photosResponse.data.data.items[0]?.url);
      }
    } catch (error) {
      console.log('❌ 照片列表请求失败:', error.response?.data || error.message);
    }

    console.log('\n3. 测试获取统计信息...');
    try {
      const statsResponse = await axios.get(`${API_BASE}/photo-album/stats/overview`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      });
      console.log('✅ 统计信息响应:', JSON.stringify(statsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ 统计信息请求失败:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ 测试脚本执行失败:', error.message);
  }
}

// 测试无认证的请求
async function testPublicAPI() {
  console.log('\n🔍 测试无认证请求...');

  try {
    const response = await axios.get(`${API_BASE}/photo-album`);
    console.log('❌ 无认证请求不应该成功:', response.status);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ 认证保护正常工作');
    } else {
      console.log('❌ 意外错误:', error.message);
    }
  }
}

async function main() {
  await testAPI();
  await testPublicAPI();
}

main();