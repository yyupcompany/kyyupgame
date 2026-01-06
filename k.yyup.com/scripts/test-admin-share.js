/**
 * 测试管理员分享功能
 * 验证分享API是否正常工作
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';
const ACTIVITY_ID = 156;

// 管理员凭据
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
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

async function testAdminShare() {
  try {
    log('\n========================================', 'cyan');
    log('🧪 测试管理员分享功能', 'cyan');
    log('========================================\n', 'cyan');

    // 步骤1: 管理员登录
    log('📝 步骤1: 管理员登录', 'blue');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      throw new Error('管理员登录失败');
    }
    
    const token = loginResponse.data.data.token;
    const adminId = loginResponse.data.data.user.id;
    const adminName = loginResponse.data.data.user.realName || loginResponse.data.data.user.username;
    
    log(`✅ 管理员登录成功`, 'green');
    log(`   - 管理员ID: ${adminId}`, 'green');
    log(`   - 管理员姓名: ${adminName}`, 'green');

    // 步骤2: 测试链接分享
    log('\n📝 步骤2: 测试链接分享', 'blue');
    
    const shareResponse = await axios.post(
      `${API_BASE_URL}/activities/${ACTIVITY_ID}/share`,
      {
        shareChannel: 'link',
        sharerId: adminId
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (shareResponse.data.success) {
      const { shareUrl, shareId } = shareResponse.data.data;
      
      log(`✅ 链接分享成功`, 'green');
      log(`   - 分享ID: ${shareId}`, 'green');
      log(`   - 分享链接: ${shareUrl}`, 'green');
      
      // 验证分享链接是否包含管理员ID
      if (shareUrl.includes(`sharerId=${adminId}`)) {
        log(`   - ✅ 分享链接正确携带管理员ID`, 'green');
      } else {
        log(`   - ❌ 分享链接未携带管理员ID`, 'red');
      }
      
      log('\n🎉 管理员分享功能正常工作！', 'green');
      return true;
    } else {
      log(`❌ 链接分享失败: ${shareResponse.data.message}`, 'red');
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
testAdminShare()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log(`\n❌ 未捕获的错误: ${error.message}`, 'red');
    process.exit(1);
  });

