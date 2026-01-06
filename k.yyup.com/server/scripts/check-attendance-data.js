const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function checkAttendanceData() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 检查考勤记录总数
    const [totalResult] = await sequelize.query(
      'SELECT COUNT(*) as count FROM attendances'
    );
    console.log(`\n📊 考勤记录总数: ${totalResult[0].count}`);

    // 检查今天的考勤记录
    const [todayResult] = await sequelize.query(
      "SELECT COUNT(*) as count FROM attendances WHERE kindergarten_id = 1 AND attendance_date = '2025-10-12'"
    );
    console.log(`📅 今天(2025-10-12)的考勤记录: ${todayResult[0].count}`);

    // 检查最近的考勤记录
    const [recentResult] = await sequelize.query(
      'SELECT attendance_date, COUNT(*) as count FROM attendances GROUP BY attendance_date ORDER BY attendance_date DESC LIMIT 5'
    );
    console.log('\n📋 最近的考勤记录:');
    recentResult.forEach(row => {
      console.log(`  ${row.attendance_date}: ${row.count} 条记录`);
    });

    // 检查学生总数
    const [studentResult] = await sequelize.query(
      "SELECT COUNT(*) as count FROM students WHERE status = 'active'"
    );
    console.log(`\n👥 活跃学生总数: ${studentResult[0].count}`);

    await sequelize.close();
    console.log('\n✅ 检查完成');
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

checkAttendanceData();

