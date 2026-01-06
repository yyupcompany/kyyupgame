const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const ACTIVITY_ID = 156; // 测试活动ID

// 测试用户登录凭证
const TEST_USER = {
  username: 'admin',
  password: 'admin123'
};

let authToken = '';

async function login() {
  try {
    console.log('🔐 正在登录...');
    const response = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
    
    if (response.data.success && response.data.data.token) {
      authToken = response.data.data.token;
      console.log('✅ 登录成功');
      console.log(`👤 用户ID: ${response.data.data.user.id}`);
      console.log(`👤 用户名: ${response.data.data.user.username}`);
      return true;
    } else {
      console.error('❌ 登录失败:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 登录错误:', error.response?.data || error.message);
    return false;
  }
}

async function testShareActivity(shareChannel) {
  try {
    console.log(`\n📤 测试分享活动 (渠道: ${shareChannel})...`);
    
    const response = await axios.post(
      `${BASE_URL}/activities/${ACTIVITY_ID}/share`,
      {
        shareChannel,
        shareContent: `快来参加这个精彩的活动吧！通过${shareChannel}分享`,
        posterId: null
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.success) {
      console.log('✅ 分享成功');
      console.log('📋 分享信息:');
      console.log(`  - 分享链接: ${response.data.data.shareUrl}`);
      console.log(`  - 分享文案: ${response.data.data.shareContent}`);
      console.log(`  - 分享记录ID: ${response.data.data.shareId}`);
      console.log(`  - 分享次数: ${response.data.data.shareCount}`);
      
      if (response.data.data.qrcodeUrl) {
        console.log(`  - 二维码URL: ${response.data.data.qrcodeUrl}`);
      }
      
      return response.data.data;
    } else {
      console.error('❌ 分享失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error(`❌ 分享错误 (${shareChannel}):`, error.response?.data || error.message);
    return null;
  }
}

async function testGetActivityDetail() {
  try {
    console.log('\n📖 获取活动详情...');
    
    const response = await axios.get(
      `${BASE_URL}/activities/${ACTIVITY_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    if (response.data.success) {
      const activity = response.data.data;
      console.log('✅ 获取成功');
      console.log('📋 活动信息:');
      console.log(`  - ID: ${activity.id}`);
      console.log(`  - 标题: ${activity.title}`);
      console.log(`  - 状态: ${activity.status}`);
      console.log(`  - 分享次数: ${activity.share_count || activity.shareCount || 0}`);
      console.log(`  - 浏览次数: ${activity.view_count || activity.viewCount || 0}`);
      return activity;
    } else {
      console.error('❌ 获取失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ 获取错误:', error.response?.data || error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 开始测试活动分享API\n');
  console.log('=' .repeat(60));
  
  // 1. 登录
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('\n❌ 登录失败，无法继续测试');
    return;
  }
  
  console.log('\n' + '='.repeat(60));
  
  // 2. 获取活动详情（测试前）
  const activityBefore = await testGetActivityDetail();
  
  console.log('\n' + '='.repeat(60));
  
  // 3. 测试不同渠道的分享
  const channels = ['wechat', 'weibo', 'qq', 'link', 'qrcode'];
  const shareResults = [];
  
  for (const channel of channels) {
    const result = await testShareActivity(channel);
    if (result) {
      shareResults.push({ channel, ...result });
    }
    // 等待一下，避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(60));
  
  // 4. 获取活动详情（测试后）
  const activityAfter = await testGetActivityDetail();
  
  console.log('\n' + '='.repeat(60));
  
  // 5. 总结
  console.log('\n📊 测试总结:');
  console.log(`  - 成功分享次数: ${shareResults.length}/${channels.length}`);
  
  if (activityBefore && activityAfter) {
    const shareCountBefore = activityBefore.share_count || activityBefore.shareCount || 0;
    const shareCountAfter = activityAfter.share_count || activityAfter.shareCount || 0;
    console.log(`  - 分享次数变化: ${shareCountBefore} → ${shareCountAfter} (+${shareCountAfter - shareCountBefore})`);
  }
  
  console.log('\n✅ 测试完成！');
  console.log('=' .repeat(60));
}

// 运行测试
runTests().catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});

