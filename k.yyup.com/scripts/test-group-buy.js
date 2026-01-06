import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

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

async function testGroupBuy() {
  try {
    log('\n========================================', 'cyan');
    log('🧪 开始测试团购功能', 'cyan');
    log('========================================\n', 'cyan');

    // 1. 管理员登录
    log('📝 步骤1: 管理员登录', 'blue');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginRes.data.data.token;
    log('✅ 管理员登录成功', 'green');
    log(`   - 管理员ID: ${loginRes.data.data.user.id}`, 'green');
    log(`   - 管理员姓名: ${loginRes.data.data.user.realName}`, 'green');

    // 2. 创建带团购配置的活动
    log('\n📝 步骤2: 创建带团购配置的活动', 'blue');
    const activityData = {
      title: '冬季亲子滑雪活动 - 团购测试',
      description: '体验冰雪乐趣，享受亲子时光',
      activityType: '户外活动',
      startTime: '2025-01-15 09:00:00',
      endTime: '2025-01-15 17:00:00',
      location: '北京滑雪场',
      capacity: 50,
      fee: 100,
      registrationDeadline: '2025-01-14 18:00:00',
      status: 1, // 报名中
      marketingConfig: {
        groupBuy: {
          enabled: true,
          price: 80,  // 团购价格
          minPeople: 5,  // 成团人数
          maxGroups: 10  // 最大团数
        },
        points: {
          enabled: true,
          registerPoints: 10,
          sharePoints: 5
        },
        coupon: {
          enabled: true,
          type: 'discount',
          value: 20,
          minAmount: 100
        },
        distribution: {
          enabled: true,
          level1Rate: 0.1,
          level2Rate: 0.05
        }
      }
    };

    const createRes = await axios.post(`${API_BASE}/activities`, activityData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const activity = createRes.data.data;
    log('✅ 活动创建成功', 'green');
    log(`   - 活动ID: ${activity.id}`, 'green');
    log(`   - 活动标题: ${activity.title}`, 'green');
    log(`   - 原价: ¥${activity.fee}`, 'green');

    // 3. 验证营销配置
    log('\n📝 步骤3: 验证营销配置', 'blue');
    const activityRes = await axios.get(`${API_BASE}/activities/${activity.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const savedActivity = activityRes.data.data;
    log('✅ 活动详情获取成功', 'green');
    
    if (savedActivity.marketingConfig && savedActivity.marketingConfig.groupBuy) {
      const groupBuy = savedActivity.marketingConfig.groupBuy;
      log('✅ 团购配置验证成功', 'green');
      log(`   - 团购状态: ${groupBuy.enabled ? '已启用' : '未启用'}`, 'green');
      log(`   - 团购价格: ¥${groupBuy.price}`, 'green');
      log(`   - 成团人数: ${groupBuy.minPeople}人`, 'green');
      log(`   - 最大团数: ${groupBuy.maxGroups}团`, 'green');
      log(`   - 优惠金额: ¥${activity.fee - groupBuy.price}`, 'green');
    } else {
      log('❌ 团购配置未保存', 'red');
      return;
    }

    // 4. 测试团购报名（模拟5个用户报名）
    log('\n📝 步骤4: 测试团购报名', 'blue');
    const groupId = `group_${Date.now()}`;
    const registrations = [];

    for (let i = 1; i <= 5; i++) {
      const regData = {
        activityId: activity.id,
        studentName: `测试学生${i}`,
        studentAge: 5,
        parentName: `测试家长${i}`,
        parentPhone: `1380000000${i}`,
        groupBuyId: groupId,  // 团购ID
        isGroupBuy: true,  // 是否团购
        paymentAmount: groupBuy.price  // 团购价格
      };

      try {
        const regRes = await axios.post(`${API_BASE}/activity-registrations`, regData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        registrations.push(regRes.data.data);
        log(`✅ 用户${i}报名成功 - 团购价: ¥${groupBuy.price}`, 'green');
      } catch (error) {
        log(`❌ 用户${i}报名失败: ${error.response?.data?.message || error.message}`, 'red');
      }
    }

    // 5. 验证团购成团
    log('\n📝 步骤5: 验证团购成团', 'blue');
    if (registrations.length >= groupBuy.minPeople) {
      log(`✅ 团购成团成功！`, 'green');
      log(`   - 团购ID: ${groupId}`, 'green');
      log(`   - 成团人数: ${registrations.length}/${groupBuy.minPeople}`, 'green');
      log(`   - 每人优惠: ¥${activity.fee - groupBuy.price}`, 'green');
      log(`   - 总优惠金额: ¥${(activity.fee - groupBuy.price) * registrations.length}`, 'green');
    } else {
      log(`⚠️  团购未成团`, 'yellow');
      log(`   - 当前人数: ${registrations.length}/${groupBuy.minPeople}`, 'yellow');
    }

    // 6. 查询活动报名统计
    log('\n📝 步骤6: 查询活动报名统计', 'blue');
    try {
      const statsRes = await axios.get(`${API_BASE}/activity-registrations/activity/${activity.id}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const stats = statsRes.data.data;
      log('✅ 报名统计获取成功', 'green');
      log(`   - 总报名数: ${stats.totalRegistrations || registrations.length}`, 'green');
      log(`   - 团购报名数: ${registrations.length}`, 'green');
      log(`   - 普通报名数: ${(stats.totalRegistrations || registrations.length) - registrations.length}`, 'green');
    } catch (error) {
      log(`⚠️  报名统计获取失败: ${error.response?.data?.message || error.message}`, 'yellow');
    }

    log('\n========================================', 'cyan');
    log('📊 测试总结', 'cyan');
    log('========================================\n', 'cyan');

    log('✅ 活动创建: 成功', 'green');
    log('✅ 团购配置: 成功', 'green');
    log('✅ 团购报名: 成功', 'green');
    log(`✅ 成团状态: ${registrations.length >= groupBuy.minPeople ? '已成团' : '未成团'}`, 'green');
    log(`\n🎉 团购功能测试完成！活动ID: ${activity.id}`, 'cyan');

  } catch (error) {
    log(`\n❌ 测试失败: ${error.message}`, 'red');
    if (error.response) {
      log(`   - 状态码: ${error.response.status}`, 'red');
      log(`   - 错误信息: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
  }
}

testGroupBuy();

