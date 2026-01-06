/**
 * 查看所有奖励记录，了解数据结构
 */

const { Sequelize } = require('sequelize');

async function checkAllRewards() {
  console.log('🔍 查看所有绩效管理数据...\n');

  const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    dialect: 'mysql',
    logging: false
  });

  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 查看所有绩效记录
    console.log('📊 查看所有绩效记录:');
    const [allPerformance] = await sequelize.query(`
      SELECT
        pr.id,
        pr.applicantId,
        pr.beneficiary_role,
        pr.totalAmount,
        pr.status,
        pr.description,
        pr.createdAt,
        pp.name as projectName
      FROM performance_records pr
      LEFT JOIN performance_projects pp ON pr.projectId = pp.id
      ORDER BY pr.createdAt DESC
      LIMIT 10
    `);

    const performanceData = Array.isArray(allPerformance) ? allPerformance : allPerformance[0] || [];
    console.log(`找到 ${performanceData.length} 条绩效记录:`);
    performanceData.forEach((record, index) => {
      console.log(`  ${index + 1}. 申请者ID: ${record.applicantId}, 角色: ${record.beneficiary_role}, 金额: ¥${record.totalAmount}, 状态: ${record.status}`);
    });

    // 查看所有推荐奖励
    console.log('\n📊 查看所有推荐奖励:');
    const [allReferral] = await sequelize.query(`
      SELECT
        id,
        reward_amount,
        reward_type,
        status,
        description,
        created_at
      FROM referral_rewards
      ORDER BY created_at DESC
      LIMIT 10
    `);

    const referralData = Array.isArray(allReferral) ? allReferral : allReferral[0] || [];
    console.log(`找到 ${referralData.length} 条推荐奖励记录:`);
    referralData.forEach((record, index) => {
      console.log(`  ${index + 1}. 金额: ¥${record.reward_amount}, 类型: ${record.reward_type}, 状态: ${record.status}`);
      console.log(`     描述: ${record.description}`);
    });

    // 查看家长用户列表
    console.log('\n👥 查看可能的家长用户:');
    const [possibleParents] = await sequelize.query(`
      SELECT DISTINCT
        pr.applicantId as parentId,
        COUNT(*) as recordCount,
        SUM(pr.totalAmount) as totalAmount
      FROM performance_records pr
      WHERE pr.beneficiary_role = 'parent'
      GROUP BY pr.applicantId
      UNION
      SELECT DISTINCT
        8 as parentId,
        0 as recordCount,
        0 as totalAmount
    `);

    const parentData = Array.isArray(possibleParents) ? possibleParents : possibleParents[0] || [];
    console.log(`找到 ${parentData.length} 个家长角色:`);
    parentData.forEach((record, index) => {
      console.log(`  ${index + 1}. 家长ID: ${record.parentId}, 记录数: ${record.recordCount}, 总金额: ¥${record.totalAmount}`);
    });

  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

// 运行检查
checkAllRewards();