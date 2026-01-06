/**
 * 转介绍系统API测试脚本
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// 测试用户登录
async function login() {
  try {
    console.log('\n📝 测试1: 用户登录');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    if (response.data.success) {
      authToken = response.data.data.token;
      console.log('✅ 登录成功');
      console.log('Token:', authToken.substring(0, 20) + '...');
      return true;
    } else {
      console.log('❌ 登录失败:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ 登录失败:', error.message);
    return false;
  }
}

// 测试获取推广码
async function getMyReferralCode() {
  try {
    console.log('\n📝 测试2: 获取我的推广码');
    const response = await axios.get(`${API_BASE_URL}/marketing/referrals/my-code`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.success) {
      console.log('✅ 获取推广码成功');
      console.log('推广码:', response.data.data.referral_code);
      console.log('推广链接:', response.data.data.referral_link);
      console.log('二维码URL:', response.data.data.qr_code_url ? '已生成' : '未生成');
      return response.data.data.referral_code;
    } else {
      console.log('❌ 获取推广码失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ 获取推广码失败:', error.response?.data?.message || error.message);
    return null;
  }
}

// 测试获取推广统计
async function getMyReferralStats() {
  try {
    console.log('\n📝 测试3: 获取我的推广统计');
    const response = await axios.get(`${API_BASE_URL}/marketing/referrals/my-stats`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.success) {
      console.log('✅ 获取推广统计成功');
      console.log('访问次数:', response.data.data.visitCount);
      console.log('访客人数:', response.data.data.visitorCount);
      console.log('成功报名:', response.data.data.enrolledCount);
      console.log('累计奖励:', response.data.data.totalReward);
      return true;
    } else {
      console.log('❌ 获取推广统计失败:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ 获取推广统计失败:', error.response?.data?.message || error.message);
    return false;
  }
}

// 测试获取转介绍记录
async function getMyReferralRecords() {
  try {
    console.log('\n📝 测试4: 获取我的转介绍记录');
    const response = await axios.get(`${API_BASE_URL}/marketing/referrals/my-records`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      params: {
        page: 1,
        pageSize: 10
      }
    });
    
    if (response.data.success) {
      console.log('✅ 获取转介绍记录成功');
      console.log('总记录数:', response.data.data.total);
      console.log('当前页记录数:', response.data.data.items.length);
      return true;
    } else {
      console.log('❌ 获取转介绍记录失败:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ 获取转介绍记录失败:', error.response?.data?.message || error.message);
    return false;
  }
}

// 测试记录访问（公开接口）
async function trackVisit(referralCode) {
  try {
    console.log('\n📝 测试5: 记录访问');
    const response = await axios.post(`${API_BASE_URL}/marketing/referrals/track-visit`, {
      referral_code: referralCode,
      source: 'qrcode'
    });
    
    if (response.data.success) {
      console.log('✅ 记录访问成功');
      console.log('访问ID:', response.data.data.visit_id);
      return true;
    } else {
      console.log('❌ 记录访问失败:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ 记录访问失败:', error.response?.data?.message || error.message);
    return false;
  }
}

// 测试记录转化
async function trackConversion(referralCode) {
  try {
    console.log('\n📝 测试6: 记录转化');
    const response = await axios.post(`${API_BASE_URL}/marketing/referrals/track-conversion`, {
      referral_code: referralCode,
      visitor_name: '张三',
      visitor_phone: '13800138000',
      status: 'registered'
    });
    
    if (response.data.success) {
      console.log('✅ 记录转化成功');
      console.log('转化ID:', response.data.data.conversion_id);
      console.log('奖励金额:', response.data.data.reward);
      return true;
    } else {
      console.log('❌ 记录转化失败:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ 记录转化失败:', error.response?.data?.message || error.message);
    return false;
  }
}

// 主测试流程
async function runTests() {
  console.log('🚀 开始测试转介绍系统API...\n');
  console.log('=' .repeat(60));
  
  // 测试1: 登录
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ 登录失败，终止测试');
    return;
  }
  
  // 测试2: 获取推广码
  const referralCode = await getMyReferralCode();
  if (!referralCode) {
    console.log('\n❌ 获取推广码失败，终止测试');
    return;
  }
  
  // 测试3: 获取推广统计
  await getMyReferralStats();
  
  // 测试4: 获取转介绍记录
  await getMyReferralRecords();
  
  // 测试5: 记录访问
  await trackVisit(referralCode);
  
  // 测试6: 记录转化
  await trackConversion(referralCode);
  
  // 再次获取统计，验证数据更新
  console.log('\n📝 测试7: 验证数据更新');
  await getMyReferralStats();
  await getMyReferralRecords();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ 所有测试完成！');
}

// 运行测试
runTests().catch(error => {
  console.error('\n❌ 测试过程中发生错误:', error.message);
  process.exit(1);
});

