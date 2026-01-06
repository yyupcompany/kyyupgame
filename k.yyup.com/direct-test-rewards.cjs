/**
 * 直接测试家长园所奖励数据库查询
 */

const { Sequelize } = require('sequelize');

async function testRewardsDatabase() {
  console.log('🧪 直接测试绩效管理数据库...\n');

  // 数据库连接配置
  const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    dialect: 'mysql',
    logging: console.log
  });

  try {
    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    const parentId = 8; // 测试家长ID

    // 查询家长的绩效奖励记录
    console.log('🔍 查询家长绩效奖励记录...');
    const [performanceRecords] = await sequelize.query(`
      SELECT
        pr.id,
        pr.projectId,
        pr.totalAmount as amount,
        pr.status,
        pr.description,
        pr.createdAt as obtainDate,
        pr.paidAt as usedDate,
        pp.name as title,
        pp.description as projectDescription,
        rt.name as rewardTypeName,
        rt.category as rewardType,
        CASE
          WHEN pr.status = 'paid' THEN 'used'
          WHEN pr.status = 'approved' THEN 'available'
          WHEN pr.status = 'pending' THEN 'pending'
          ELSE 'expired'
        END as displayStatus
      FROM performance_records pr
      LEFT JOIN performance_projects pp ON pr.projectId = pp.id
      LEFT JOIN reward_types rt ON pp.category = rt.code
      WHERE pr.applicantId = :parentId
        AND pr.beneficiary_role = 'parent'
      ORDER BY pr.createdAt DESC
      LIMIT 50
    `, {
      replacements: { parentId },
      type: Sequelize.QueryTypes.SELECT
    });

    const records = Array.isArray(performanceRecords) ? performanceRecords : performanceRecords[0] || [];
    console.log(`📊 找到 ${records.length} 条绩效奖励记录:`);
    records.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.title} - ¥${record.amount} (${record.displayStatus})`);
    });

    // 查询推荐奖励记录
    console.log('\n🔍 查询推荐奖励记录...');
    const [referralRewards] = await sequelize.query(`
      SELECT
        rr.id,
        rr.reward_amount as amount,
        rr.reward_points as points,
        rr.reward_type,
        rr.status,
        rr.issued_at as obtainDate,
        rr.used_at as usedDate,
        rr.created_at,
        rr.description,
        '推荐奖励' as title,
        CASE
          WHEN rr.reward_type = 'cash' THEN 'voucher'
          WHEN rr.reward_type = 'points' THEN 'points'
          ELSE 'gift'
        END as rewardType,
        CASE
          WHEN rr.status = 'used' THEN 'used'
          WHEN rr.status = 'issued' THEN 'available'
          WHEN rr.status = 'pending' THEN 'pending'
          ELSE 'expired'
        END as displayStatus
      FROM referral_rewards rr
      WHERE rr.description LIKE CONCAT('%家长%', '%')
        OR rr.id LIKE '%test%'
      ORDER BY rr.created_at DESC
      LIMIT 50
    `, {
      type: Sequelize.QueryTypes.SELECT
    });

  const referralRecords = Array.isArray(referralRewards) ? referralRewards : referralRewards[0] || [];
    console.log(`📊 找到 ${referralRecords.length} 条推荐奖励记录:`);
    referralRecords.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.title} - ¥${record.amount || 0} (${record.displayStatus})`);
    });

    // 合并奖励数据
    let allRewards = [];

    // 处理绩效奖励
    const processedPerformanceRewards = records.map(record => ({
      id: `perf_${record.id}`,
      title: record.title || '绩效奖励',
      description: record.description || record.projectDescription || '优秀的绩效表现',
      type: record.rewardType || 'voucher',
      status: record.displayStatus,
      amount: parseFloat(record.amount) || 0,
      voucherValue: record.rewardType === 'voucher' ? parseFloat(record.amount) || 0 : null,
      points: record.rewardType === 'points' ? parseInt(record.points) || 0 : null,
      obtainDate: record.obtainDate ? new Date(record.obtainDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      usedDate: record.usedDate ? new Date(record.usedDate).toISOString().split('T')[0] : null,
      expiryDate: new Date(new Date(record.obtainDate || Date.now()).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));

    // 处理推荐奖励
    const processedReferralRewards = referralRecords.map(record => ({
      id: `ref_${record.id}`,
      title: record.title,
      description: record.description || '成功推荐新用户加入',
      type: record.rewardType,
      status: record.displayStatus,
      amount: parseFloat(record.amount) || 0,
      voucherValue: record.rewardType === 'voucher' ? parseFloat(record.amount) || 0 : null,
      points: parseInt(record.points) || 0,
      obtainDate: record.obtainDate ? new Date(record.obtainDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      usedDate: record.usedDate ? new Date(record.usedDate).toISOString().split('T')[0] : null,
      expiryDate: new Date(new Date(record.created_at || Date.now()).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));

    allRewards = [...processedPerformanceRewards, ...processedReferralRewards];

    // 按获得时间排序
    allRewards.sort((a, b) => new Date(b.obtainDate) - new Date(a.obtainDate));

    // 计算统计数据
    const stats = {
      availableRewards: allRewards.filter(r => r.status === 'available').length,
      usedRewards: allRewards.filter(r => r.status === 'used').length,
      expiredRewards: allRewards.filter(r => r.status === 'expired').length,
      totalRewards: allRewards.length
    };

    console.log('\n📈 合并后的统计数据:');
    console.log(`  - 可用奖励: ${stats.availableRewards}`);
    console.log(`  - 已使用: ${stats.usedRewards}`);
    console.log(`  - 已过期: ${stats.expiredRewards}`);
    console.log(`  - 总计: ${stats.totalRewards}`);
    console.log(`  - 总金额: ¥${allRewards.reduce((sum, r) => sum + (r.amount || 0), 0)}`);

    console.log('\n🎯 最终奖励数据样例:');
    if (allRewards.length > 0) {
      console.log(JSON.stringify(allRewards[0], null, 2));
    } else {
      console.log('❌ 没有找到任何奖励数据');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

// 运行测试
testRewardsDatabase();