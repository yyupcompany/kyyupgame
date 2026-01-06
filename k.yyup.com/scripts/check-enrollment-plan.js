import { Sequelize } from 'sequelize';

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function checkEnrollmentPlans() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    const [results] = await sequelize.query(`
      SELECT 
        id, 
        title, 
        year, 
        semester, 
        target_count, 
        start_date, 
        end_date, 
        age_range, 
        kindergarten_id, 
        creator_id, 
        status,
        created_at 
      FROM enrollment_plans 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    console.log('\n📋 最近5条招生计划记录:\n');
    results.forEach((plan, index) => {
      console.log(`${index + 1}. ID: ${plan.id}`);
      console.log(`   标题: ${plan.title}`);
      console.log(`   年份: ${plan.year}, 学期: ${plan.semester}`);
      console.log(`   目标人数: ${plan.target_count}`);
      console.log(`   日期范围: ${plan.start_date} ~ ${plan.end_date}`);
      console.log(`   年龄范围: ${plan.age_range}`);
      console.log(`   幼儿园ID: ${plan.kindergarten_id}, 创建者ID: ${plan.creator_id}`);
      console.log(`   状态: ${plan.status}`);
      console.log(`   创建时间: ${plan.created_at}`);
      console.log('');
    });

    // 检查最新的记录是否是我们刚创建的
    if (results.length > 0) {
      const latest = results[0];
      if (latest.title === '2025年春季招生计划' && 
          latest.year === 2025 && 
          latest.semester === 1 &&
          latest.target_count === 150) {
        console.log('🎉 成功！找到了刚刚创建的招生计划！');
        console.log('✅ 数据已成功保存到数据库');
        console.log(`✅ kindergartenId: ${latest.kindergarten_id} (后端自动填充)`);
        console.log(`✅ creatorId: ${latest.creator_id} (后端自动填充)`);
      } else {
        console.log('⚠️  最新记录不是刚刚创建的招生计划');
      }
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

checkEnrollmentPlans();

