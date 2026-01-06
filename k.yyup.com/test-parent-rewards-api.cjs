/**
 * 测试家长园所奖励 API
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testParentRewardsAPI() {
  console.log('🧪 开始测试家长园所奖励 API...\n');

  try {
    // 测试获取奖励列表
    console.log('1️⃣ 测试获取奖励列表...');
    const rewardsResponse = await axios.get(`${BASE_URL}/api/parent-rewards-test`);
    console.log('✅ 获取奖励列表成功:', rewardsResponse.data);

    if (rewardsResponse.data.success && rewardsResponse.data.data.rewards.length > 0) {
      const firstReward = rewardsResponse.data.data.rewards[0];
      console.log('📄 第一个奖励示例:', firstReward);

      // 测试获取奖励详情
      if (firstReward.id) {
        console.log('\n2️⃣ 测试获取奖励详情...');
        const detailResponse = await axios.get(`${BASE_URL}/api/parent-rewards-test/${firstReward.id}`);
        console.log('✅ 获取奖励详情成功:', detailResponse.data);
      }
    }

    console.log('\n📊 统计数据:', rewardsResponse.data.data.stats);
    console.log('💰 总金额:', rewardsResponse.data.data.totalAmount);

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('错误详情:', error.response.data);
    }
  }
}

// 运行测试
testParentRewardsAPI();