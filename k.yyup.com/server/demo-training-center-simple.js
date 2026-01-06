const { sequelize, TrainingActivity, TrainingPlan, TrainingRecord, TrainingAchievement } = require('./dist/init');

async function demoTrainingCenter() {
  try {
    console.log('🎯 训练中心功能演示');
    console.log('==================\n');

    // 1. 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 2. 检查训练活动数据

    console.log('\n📊 训练活动数据:');
    const activities = await TrainingActivity.findAll({
      attributes: ['id', 'activityName', 'activityType', 'targetAgeMin', 'targetAgeMax', 'difficultyLevel'],
      limit: 5
    });

    activities.forEach((activity, index) => {
      console.log(`  ${index + 1}. ${activity.activityName} (${activity.activityType})`);
      console.log(`     年龄: ${activity.targetAgeMin}-${activity.targetAgeMax}岁 | 难度: ${activity.difficultyLevel}`);
    });

    // 3. 检查成就数据
    console.log('\n🏆 成就模板数据:');
    const achievements = await TrainingAchievement.findAll({
      where: { childId: 0, isActive: true },
      attributes: ['achievementName', 'achievementDescription', 'pointsAwarded', 'badgeIcon']
    });

    achievements.forEach((achievement, index) => {
      console.log(`  ${achievement.badgeIcon} ${achievement.achievementName}`);
      console.log(`     ${achievement.achievementDescription} (${achievement.pointsAwarded}分)`);
    });

    // 4. API功能说明
    console.log('\n🚀 可用的API功能:');
    console.log('\n1. 训练活动管理');
    console.log('   - GET  /api/training/activities - 获取活动列表');
    console.log('   - GET  /api/training/activities/:id - 获取活动详情');
    console.log('   - 查询参数: activityType, targetAge, difficultyLevel');

    console.log('\n2. 训练计划管理');
    console.log('   - POST /api/training/plans - 创建训练计划');
    console.log('   - GET  /api/training/plans - 获取计划列表');
    console.log('   - PUT  /api/training/plans/:id - 更新计划状态');

    console.log('\n3. 训练记录跟踪');
    console.log('   - POST /api/training/start-activity - 开始训练');
    console.log('   - POST /api/training/complete-activity - 完成训练');
    console.log('   - GET  /api/training/records - 获取训练记录');

    console.log('\n4. 进度和成就');
    console.log('   - GET  /api/training/progress?childId=1 - 获取训练进度');
    console.log('   - GET  /api/training/achievements?childId=1 - 获取成就列表');
    console.log('   - GET  /api/training/daily-tasks?childId=1 - 获取今日任务');

    // 5. 使用示例
    console.log('\n💡 使用示例:');
    console.log('\n创建训练计划:');
    console.log(`curl -X POST http://localhost:3000/api/training/plans \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -H "Authorization: Bearer YOUR_TOKEN" \\`);
    console.log(`  -d '{"childId":1,"name":"认知训练计划","activityIds":[1,2,3]}'`);

    console.log('\n获取今日任务:');
    console.log(`curl http://localhost:3000/api/training/daily-tasks?childId=1 \\`);
    console.log(`  -H "Authorization: Bearer YOUR_TOKEN"`);

    console.log('\n✨ 训练中心已完全集成到系统中！');
    console.log('📱 前端页面: /training-center');
    console.log('🔗 API文档: http://localhost:3000/api-docs');

  } catch (error) {
    console.error('❌ 演示失败:', error);
  } finally {
    await sequelize.close();
  }
}

// 运行演示
demoTrainingCenter();