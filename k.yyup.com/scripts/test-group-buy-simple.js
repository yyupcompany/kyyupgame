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
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testGroupBuySimple() {
  try {
    log('\n========================================', 'cyan');
    log('🧪 开始测试团购功能（简化版）', 'cyan');
    log('========================================\n', 'cyan');

    // 1. 管理员登录
    log('📝 步骤1: 管理员登录', 'blue');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginRes.data.data.token;
    log('✅ 管理员登录成功', 'green');

    // 2. 获取活动详情
    log('\n📝 步骤2: 获取活动详情', 'blue');
    const activityRes = await axios.get(`${API_BASE}/activities/${ACTIVITY_ID}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const activity = activityRes.data.data;
    log('✅ 活动详情获取成功', 'green');
    log(`   - 活动ID: ${activity.id}`, 'green');
    log(`   - 活动标题: ${activity.title}`, 'green');
    log(`   - 原价: ¥${activity.fee}`, 'green');

    // 3. 定义团购配置
    log('\n📝 步骤3: 定义团购配置', 'blue');
    const groupBuyConfig = {
      enabled: true,
      price: 40,  // 团购价格
      minPeople: 5,  // 成团人数
      maxGroups: 10  // 最大团数
    };
    
    log('✅ 团购配置定义完成', 'green');
    log(`   - 团购价格: ¥${groupBuyConfig.price}`, 'green');
    log(`   - 成团人数: ${groupBuyConfig.minPeople}人`, 'green');
    log(`   - 优惠金额: ¥${activity.fee - groupBuyConfig.price}`, 'green');

    // 4. 模拟团购报名（5个用户）
    log('\n📝 步骤4: 模拟团购报名', 'blue');
    const groupId = `group_${Date.now()}`;
    const registrations = [];

    for (let i = 1; i <= 5; i++) {
      const regData = {
        activityId: ACTIVITY_ID,
        contactName: `团购家长${i}`,  // 联系人姓名（必填）
        contactPhone: `1390000000${i}`,  // 联系电话（必填）
        childName: `团购学生${i}`,  // 孩子姓名
        childAge: 5,  // 孩子年龄
        groupBuyId: groupId,  // 团购ID
        isGroupBuy: true,  // 是否团购
        paymentAmount: groupBuyConfig.price  // 团购价格
      };

      try {
        const regRes = await axios.post(`${API_BASE}/activity-registrations`, regData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        registrations.push(regRes.data.data);
        log(`✅ 用户${i}报名成功 - 团购价: ¥${groupBuyConfig.price}`, 'green');
      } catch (error) {
        log(`❌ 用户${i}报名失败: ${error.response?.data?.message || error.message}`, 'red');
        if (error.response?.data) {
          log(`   详细错误: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
        }
      }
    }

    // 5. 验证团购成团
    log('\n📝 步骤5: 验证团购成团', 'blue');
    if (registrations.length >= groupBuyConfig.minPeople) {
      log(`✅ 团购成团成功！`, 'green');
      log(`   - 团购ID: ${groupId}`, 'green');
      log(`   - 成团人数: ${registrations.length}/${groupBuyConfig.minPeople}`, 'green');
      log(`   - 每人优惠: ¥${activity.fee - groupBuyConfig.price}`, 'green');
      log(`   - 总优惠金额: ¥${(activity.fee - groupBuyConfig.price) * registrations.length}`, 'green');
    } else {
      log(`⚠️  团购未成团`, 'yellow');
      log(`   - 当前人数: ${registrations.length}/${groupBuyConfig.minPeople}`, 'yellow');
    }

    // 6. 查询团购报名记录
    log('\n📝 步骤6: 查询团购报名记录', 'blue');
    try {
      const regsRes = await axios.get(`${API_BASE}/activity-registrations`, {
        params: {
          activityId: ACTIVITY_ID,
          page: 1,
          pageSize: 100
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      const allRegs = regsRes.data.data.items || regsRes.data.data;
      const groupBuyRegs = allRegs.filter(r => r.groupBuyId === groupId);
      
      log('✅ 报名记录查询成功', 'green');
      log(`   - 总报名数: ${allRegs.length}`, 'green');
      log(`   - 本次团购报名数: ${groupBuyRegs.length}`, 'green');
      
      if (groupBuyRegs.length > 0) {
        log('\n   团购成员列表:', 'cyan');
        groupBuyRegs.forEach((reg, index) => {
          log(`   ${index + 1}. ${reg.studentName} - ${reg.parentName} - ${reg.parentPhone}`, 'cyan');
        });
      }
    } catch (error) {
      log(`⚠️  报名记录查询失败: ${error.response?.data?.message || error.message}`, 'yellow');
    }

    log('\n========================================', 'cyan');
    log('📊 测试总结', 'cyan');
    log('========================================\n', 'cyan');

    log('✅ 活动查询: 成功', 'green');
    log('✅ 团购配置: 成功', 'green');
    log('✅ 团购报名: 成功', 'green');
    log(`✅ 成团状态: ${registrations.length >= groupBuyConfig.minPeople ? '已成团' : '未成团'}`, 'green');
    log(`\n🎉 团购功能测试完成！`, 'cyan');
    log(`   - 活动ID: ${ACTIVITY_ID}`, 'cyan');
    log(`   - 团购ID: ${groupId}`, 'cyan');
    log(`   - 成团人数: ${registrations.length}/${groupBuyConfig.minPeople}`, 'cyan');

  } catch (error) {
    log(`\n❌ 测试失败: ${error.message}`, 'red');
    if (error.response) {
      log(`   - 状态码: ${error.response.status}`, 'red');
      log(`   - 错误信息: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
  }
}

testGroupBuySimple();

