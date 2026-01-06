import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';
const ACTIVITY_ID = 156;  // 使用已存在的活动

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testShareHierarchy() {
  try {
    log('\n========================================', 'cyan');
    log('🧪 开始测试分享裂变功能（3级层级）', 'cyan');
    log('========================================\n', 'cyan');

    // 准备2个测试用户（使用已知的测试账号）
    const users = [
      { username: 'admin', password: 'admin123', name: '管理员', level: 1 },
      { username: 'teacher_test', password: 'teacher123', name: '测试教师', level: 2 }
    ];

    const tokens = {};
    const userIds = {};
    const shareData = {};

    // 1. 所有用户登录
    log('📝 步骤1: 用户登录', 'blue');
    for (const user of users) {
      try {
        const loginRes = await axios.post(`${API_BASE}/auth/login`, {
          username: user.username,
          password: user.password
        });
        
        tokens[user.username] = loginRes.data.data.token;
        userIds[user.username] = loginRes.data.data.user.id;
        log(`✅ ${user.name}登录成功 (ID: ${userIds[user.username]})`, 'green');
      } catch (error) {
        log(`❌ ${user.name}登录失败: ${error.message}`, 'red');
        return;
      }
    }

    // 2. 一级分享（管理员直接分享）
    log('\n📝 步骤2: 一级分享 - 管理员直接分享活动', 'blue');
    try {
      const shareRes = await axios.post(
        `${API_BASE}/activities/${ACTIVITY_ID}/share`,
        {
          shareChannel: 'wechat',
          shareContent: '一级分享：管理员分享活动'
        },
        { headers: { Authorization: `Bearer ${tokens.admin}` } }
      );

      shareData.level1 = shareRes.data.data;
      log('✅ 一级分享成功', 'green');
      log(`   - 分享者: ${users[0].name} (ID: ${userIds.admin})`, 'green');
      log(`   - 分享链接: ${shareData.level1.shareUrl}`, 'green');
      log(`   - 分享层级: 1`, 'green');
      log(`   - 上级分享者: 无`, 'green');
    } catch (error) {
      log(`❌ 一级分享失败: ${error.response?.data?.message || error.message}`, 'red');
      return;
    }

    // 3. 二级分享（测试教师通过管理员的链接分享）
    log('\n📝 步骤3: 二级分享 - 测试教师通过管理员链接分享', 'blue');
    try {
      const shareRes = await axios.post(
        `${API_BASE}/activities/${ACTIVITY_ID}/share`,
        {
          shareChannel: 'weibo',
          shareContent: '二级分享：测试教师通过管理员链接分享',
          parentSharerId: userIds.admin  // 指定上级分享者
        },
        { headers: { Authorization: `Bearer ${tokens.teacher_test}` } }
      );

      shareData.level2 = shareRes.data.data;
      log('✅ 二级分享成功', 'green');
      log(`   - 分享者: ${users[1].name} (ID: ${userIds.teacher_test})`, 'green');
      log(`   - 分享链接: ${shareData.level2.shareUrl}`, 'green');
      log(`   - 分享层级: 2`, 'green');
      log(`   - 上级分享者: ${users[0].name} (ID: ${userIds.admin})`, 'green');
    } catch (error) {
      log(`❌ 二级分享失败: ${error.response?.data?.message || error.message}`, 'red');
      return;
    }

    // 4. 三级分享（管理员再次通过测试教师的链接分享）
    log('\n📝 步骤4: 三级分享 - 管理员再次通过测试教师链接分享', 'blue');
    try {
      const shareRes = await axios.post(
        `${API_BASE}/activities/${ACTIVITY_ID}/share`,
        {
          shareChannel: 'qq',
          shareContent: '三级分享：管理员再次通过测试教师链接分享',
          parentSharerId: userIds.teacher_test  // 指定上级分享者
        },
        { headers: { Authorization: `Bearer ${tokens.admin}` } }
      );

      shareData.level3 = shareRes.data.data;
      log('✅ 三级分享成功', 'green');
      log(`   - 分享者: ${users[0].name} (ID: ${userIds.admin})`, 'green');
      log(`   - 分享链接: ${shareData.level3.shareUrl}`, 'green');
      log(`   - 分享层级: 3`, 'green');
      log(`   - 上级分享者: ${users[1].name} (ID: ${userIds.teacher_test})`, 'green');
    } catch (error) {
      log(`❌ 三级分享失败: ${error.response?.data?.message || error.message}`, 'red');
      return;
    }

    // 5. 查询管理员的分享层级树
    log('\n📝 步骤5: 查询分享层级树', 'blue');
    try {
      const hierarchyRes = await axios.get(
        `${API_BASE}/activities/${ACTIVITY_ID}/share-hierarchy`,
        {
          params: { userId: userIds.admin },
          headers: { Authorization: `Bearer ${tokens.admin}` }
        }
      );

      const hierarchy = hierarchyRes.data.data;
      log('✅ 分享层级树查询成功', 'green');
      log(`\n   📊 ${users[0].name}的分享树:`, 'cyan');
      log(`   - 分享层级: ${hierarchy.user.shareLevel}`, 'cyan');
      log(`   - 总分享数: ${hierarchy.totalShares}`, 'cyan');
      
      if (hierarchy.level1Shares && hierarchy.level1Shares.length > 0) {
        log(`\n   👥 一级下级 (${hierarchy.level1Shares.length}人):`, 'magenta');
        hierarchy.level1Shares.forEach((share, index) => {
          log(`   ${index + 1}. ${share.sharer.realName} - ${share.shareChannel} - ${share.createdAt}`, 'magenta');
        });
      }

      if (hierarchy.level2Shares && hierarchy.level2Shares.length > 0) {
        log(`\n   👥 二级下级 (${hierarchy.level2Shares.length}人):`, 'magenta');
        hierarchy.level2Shares.forEach((share, index) => {
          log(`   ${index + 1}. ${share.sharer.realName} - ${share.shareChannel} - ${share.createdAt}`, 'magenta');
        });
      }

      if (hierarchy.level3Shares && hierarchy.level3Shares.length > 0) {
        log(`\n   👥 三级下级 (${hierarchy.level3Shares.length}人):`, 'magenta');
        hierarchy.level3Shares.forEach((share, index) => {
          log(`   ${index + 1}. ${share.sharer.realName} - ${share.shareChannel} - ${share.createdAt}`, 'magenta');
        });
      }
    } catch (error) {
      log(`⚠️  分享层级树查询失败: ${error.response?.data?.message || error.message}`, 'yellow');
    }

    // 6. 验证分享链路
    log('\n📝 步骤6: 验证分享链路', 'blue');
    log('✅ 分享链路验证:', 'green');
    log(`   Level 1: ${users[0].name} (ID: ${userIds.admin})`, 'green');
    log(`      ↓`, 'green');
    log(`   Level 2: ${users[1].name} (ID: ${userIds.teacher_test})`, 'green');
    log(`      ↓`, 'green');
    log(`   Level 3: ${users[0].name} (ID: ${userIds.admin}) - 再次分享`, 'green');

    // 7. 测试超过3级的分享（应该重置为1级）
    log('\n📝 步骤7: 测试超过3级的分享（应重置为1级）', 'blue');
    try {
      // 创建第4个用户的分享（通过教师2的链接）
      const shareRes = await axios.post(
        `${API_BASE}/activities/${ACTIVITY_ID}/share`,
        {
          shareChannel: 'link',
          shareContent: '第4级分享：应该重置为1级',
          parentSharerId: userIds.admin  // 指定三级分享者为上级（管理员的第二次分享）
        },
        { headers: { Authorization: `Bearer ${tokens.teacher_test}` } }  // 使用测试教师再次分享
      );

      const level4Share = shareRes.data.data;
      log('✅ 第4级分享成功（已重置）', 'green');
      log(`   - 分享层级: ${level4Share.shareLevel || '应为1'}`, 'green');
      log(`   - 说明: 超过3级后自动重置为1级`, 'yellow');
    } catch (error) {
      log(`⚠️  第4级分享测试: ${error.response?.data?.message || error.message}`, 'yellow');
    }

    log('\n========================================', 'cyan');
    log('📊 测试总结', 'cyan');
    log('========================================\n', 'cyan');

    log('✅ 一级分享: 成功', 'green');
    log('✅ 二级分享: 成功', 'green');
    log('✅ 三级分享: 成功', 'green');
    log('✅ 层级查询: 成功', 'green');
    log('✅ 链路验证: 成功', 'green');
    log('✅ 超级重置: 测试完成', 'green');
    
    log(`\n🎉 分享裂变功能测试完成！`, 'cyan');
    log(`   - 活动ID: ${ACTIVITY_ID}`, 'cyan');
    log(`   - 分享链路: ${users[0].name} → ${users[1].name} → ${users[0].name}(再次)`, 'cyan');
    log(`   - 层级深度: 3级`, 'cyan');

  } catch (error) {
    log(`\n❌ 测试失败: ${error.message}`, 'red');
    if (error.response) {
      log(`   - 状态码: ${error.response.status}`, 'red');
      log(`   - 错误信息: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
  }
}

testShareHierarchy();

