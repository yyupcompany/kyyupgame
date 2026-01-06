const { Sequelize } = require('sequelize');

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

async function checkRealPerformanceTables() {
  try {
    console.log('🎯 查找真实绩效管理数据库表（非评估系统）...\n');

    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 获取所有表
    const [tables] = await sequelize.query('SHOW TABLES');
    const tableList = tables.map(row => Object.values(row)[0]);

    // 查找真实的绩效管理表（排除assessment评估系统）
    const performanceTables = tableList.filter(table =>
      (table.toLowerCase().includes('performance') && !table.toLowerCase().includes('assessment')) ||
      table.toLowerCase().includes('referral_reward') ||
      table.toLowerCase().includes('reward_type') ||
      table.toLowerCase().includes('share_reward')
    );

    console.log('📋 真实绩效管理表（非评估系统）:');
    performanceTables.forEach(table => console.log(`  - ${table}`));

    // 检查每个表的结构和数据
    for (const tableName of performanceTables) {
      console.log(`\n🔍 表 ${tableName} 详细信息:`);

      try {
        // 获取表结构
        const [columns] = await sequelize.query(`DESCRIBE ${tableName}`);
        console.log('  字段:');
        columns.forEach(col => {
          const field = col.Field || col.field;
          const type = col.Type || col.type;
          const nullable = col.Null === 'YES' ? 'NULL' : 'NOT NULL';
          console.log(`    - ${field}: ${type} (${nullable})`);
        });

        // 获取数据量
        const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        const recordCount = count[0].count || count[0]?.count || 0;
        console.log(`  📊 数据量: ${recordCount} 条`);

        // 如果有数据，显示前几条
        if (recordCount > 0) {
          const [sampleData] = await sequelize.query(`SELECT * FROM ${tableName} LIMIT 3`);
          console.log('  📄 示例数据:');
          sampleData.forEach((row, index) => {
            console.log(`    ${index + 1}:`, JSON.stringify(row, null, 2));
          });
        }

      } catch (error) {
        console.error(`  ❌ 检查表 ${tableName} 失败:`, error.message);
      }
    }

    // 分析绩效管理业务逻辑
    console.log('\n🔍 绩效管理业务逻辑分析:');

    // 检查推荐奖励表
    if (performanceTables.includes('referral_rewards')) {
      try {
        const [referralData] = await sequelize.query(`
          SELECT
            COUNT(*) as total_records,
            COUNT(DISTINCT referrer_id) as unique_referrers,
            COUNT(DISTINCT referred_user_id) as unique_referred,
            SUM(reward_amount) as total_rewards,
            AVG(reward_amount) as avg_reward
          FROM referral_rewards
        `);
        console.log('  💡 推荐奖励统计:');
        console.log(`    - 总记录数: ${referralData[0].total_records}`);
        console.log(`    - 推荐人数: ${referralData[0].unique_referrers}`);
        console.log(`    - 被推荐人数: ${referralData[0].unique_referred}`);
        console.log(`    - 奖励总额: ¥${referralData[0].total_rewards || 0}`);
        console.log(`    - 平均奖励: ¥${referralData[0].avg_reward || 0}`);
      } catch (error) {
        console.error('  ❌ 推荐奖励统计失败:', error.message);
      }
    }

    // 检查绩效项目表
    if (performanceTables.includes('performance_projects')) {
      try {
        const [projectData] = await sequelize.query(`
          SELECT
            COUNT(*) as total_projects,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
            SUM(total_budget) as total_budget,
            AVG(total_budget) as avg_budget
          FROM performance_projects
        `);
        console.log('  🎯 绩效项目统计:');
        console.log(`    - 总项目数: ${projectData[0].total_projects}`);
        console.log(`    - 活跃项目: ${projectData[0].active_projects}`);
        console.log(`    - 总预算: ¥${projectData[0].total_budget || 0}`);
        console.log(`    - 平均预算: ¥${projectData[0].avg_budget || 0}`);
      } catch (error) {
        console.error('  ❌ 绩效项目统计失败:', error.message);
      }
    }

    // 检查绩效记录表
    if (performanceTables.includes('performance_records')) {
      try {
        const [recordData] = await sequelize.query(`
          SELECT
            COUNT(*) as total_records,
            COUNT(DISTINCT user_id) as unique_users,
            SUM(amount) as total_amount,
            AVG(amount) as avg_amount,
            COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_records
          FROM performance_records
        `);
        console.log('  📈 绩效记录统计:');
        console.log(`    - 总记录数: ${recordData[0].total_records}`);
        console.log(`    - 参与人数: ${recordData[0].unique_users}`);
        console.log(`    - 总金额: ¥${recordData[0].total_amount || 0}`);
        console.log(`    - 平均金额: ¥${recordData[0].avg_amount || 0}`);
        console.log(`    - 已批准记录: ${recordData[0].approved_records}`);
      } catch (error) {
        console.error('  ❌ 绩效记录统计失败:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// 运行检查
checkRealPerformanceTables();