/**
 * 测试教师角色转发功能
 * 
 * 测试目标：
 * 1. 教师登录
 * 2. 调用活动分享API
 * 3. 验证分享链接是否正确携带教师ID
 * 4. 验证分享记录是否正确保存
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';
const ACTIVITY_ID = 156;

// 测试数据
const TEACHER_CREDENTIALS = {
  username: 'teacher',
  password: 'teacher123'
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testTeacherShare() {
  try {
    log('\n========================================', 'cyan');
    log('🧪 开始测试教师角色转发功能', 'cyan');
    log('========================================\n', 'cyan');

    // 步骤1: 教师登录
    log('📝 步骤1: 教师登录', 'blue');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, TEACHER_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      throw new Error('教师登录失败');
    }
    
    const token = loginResponse.data.data.token;
    const teacherId = loginResponse.data.data.user.id;
    const teacherName = loginResponse.data.data.user.realName || loginResponse.data.data.user.username;
    
    log(`✅ 教师登录成功`, 'green');
    log(`   - 教师ID: ${teacherId}`, 'green');
    log(`   - 教师姓名: ${teacherName}`, 'green');
    log(`   - Token: ${token.substring(0, 20)}...`, 'green');

    // 步骤2: 测试所有分享渠道
    log('\n📝 步骤2: 测试分享功能', 'blue');
    
    const channels = ['wechat', 'weibo', 'qq', 'link', 'qrcode'];
    const shareResults = [];
    
    for (const channel of channels) {
      try {
        log(`\n   测试 ${channel} 分享...`, 'yellow');
        
        const shareResponse = await axios.post(
          `${API_BASE_URL}/activities/${ACTIVITY_ID}/share`,
          {
            shareChannel: channel,
            sharerId: teacherId
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (shareResponse.data.success) {
          const { shareUrl, shareContent, shareId } = shareResponse.data.data;
          
          log(`   ✅ ${channel} 分享成功`, 'green');
          log(`      - 分享ID: ${shareId}`, 'green');
          log(`      - 分享链接: ${shareUrl}`, 'green');
          
          // 验证分享链接是否包含教师ID
          if (shareUrl.includes(`sharerId=${teacherId}`)) {
            log(`      - ✅ 分享链接正确携带教师ID`, 'green');
          } else {
            log(`      - ❌ 分享链接未携带教师ID`, 'red');
          }
          
          shareResults.push({
            channel,
            success: true,
            shareId,
            shareUrl,
            hasTeacherId: shareUrl.includes(`sharerId=${teacherId}`)
          });
        } else {
          log(`   ❌ ${channel} 分享失败: ${shareResponse.data.message}`, 'red');
          shareResults.push({
            channel,
            success: false,
            error: shareResponse.data.message
          });
        }
      } catch (error) {
        log(`   ❌ ${channel} 分享异常: ${error.message}`, 'red');
        shareResults.push({
          channel,
          success: false,
          error: error.message
        });
      }
    }

    // 步骤3: 验证分享统计
    log('\n📝 步骤3: 验证分享统计', 'blue');
    
    try {
      const statsResponse = await axios.get(
        `${API_BASE_URL}/activities/${ACTIVITY_ID}/share-stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (statsResponse.data.success) {
        const stats = statsResponse.data.data;
        log(`✅ 分享统计获取成功`, 'green');
        log(`   - 总分享次数: ${stats.totalShares}`, 'green');
        log(`   - 微信分享: ${stats.wechatShares}`, 'green');
        log(`   - 微博分享: ${stats.weiboShares}`, 'green');
        log(`   - QQ分享: ${stats.qqShares}`, 'green');
        log(`   - 链接分享: ${stats.linkShares}`, 'green');
        log(`   - 二维码分享: ${stats.qrcodeShares}`, 'green');
      } else {
        log(`❌ 分享统计获取失败: ${statsResponse.data.message}`, 'red');
      }
    } catch (error) {
      log(`❌ 分享统计获取异常: ${error.message}`, 'red');
    }

    // 测试总结
    log('\n========================================', 'cyan');
    log('📊 测试总结', 'cyan');
    log('========================================\n', 'cyan');
    
    const successCount = shareResults.filter(r => r.success).length;
    const failCount = shareResults.filter(r => !r.success).length;
    const correctLinkCount = shareResults.filter(r => r.success && r.hasTeacherId).length;
    
    log(`总测试数: ${shareResults.length}`, 'blue');
    log(`成功: ${successCount}`, successCount === shareResults.length ? 'green' : 'yellow');
    log(`失败: ${failCount}`, failCount === 0 ? 'green' : 'red');
    log(`正确携带教师ID: ${correctLinkCount}/${successCount}`, correctLinkCount === successCount ? 'green' : 'red');
    
    // 详细结果
    log('\n详细结果:', 'blue');
    shareResults.forEach(result => {
      if (result.success) {
        log(`✅ ${result.channel}: ${result.shareUrl}`, 'green');
      } else {
        log(`❌ ${result.channel}: ${result.error}`, 'red');
      }
    });
    
    // 最终判断
    if (successCount === shareResults.length && correctLinkCount === successCount) {
      log('\n🎉 所有测试通过！教师角色转发功能正常工作！', 'green');
      return true;
    } else {
      log('\n⚠️  部分测试失败，请检查上述错误信息', 'yellow');
      return false;
    }
    
  } catch (error) {
    log(`\n❌ 测试过程中发生错误: ${error.message}`, 'red');
    if (error.response) {
      log(`   响应状态: ${error.response.status}`, 'red');
      log(`   响应数据: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    return false;
  }
}

// 运行测试
testTeacherShare()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log(`\n❌ 未捕获的错误: ${error.message}`, 'red');
    process.exit(1);
  });

