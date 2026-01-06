require('dotenv').config();

async function fixAchievementTable() {
  const { sequelize } = require('./dist/init');

  try {
    console.log('🔧 开始修复成就表结构...');

    // 1. 添加缺失的 isActive 字段
    try {
      await sequelize.query(`
        ALTER TABLE training_achievements
        ADD COLUMN isActive TINYINT(1) DEFAULT 1
      `);
      console.log('✅ 已添加 isActive 字段');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('ℹ️  isActive 字段已存在，跳过添加');
      } else {
        throw error;
      }
    }

    // 2. 检查现有数据
    const [existingData] = await sequelize.query(`
      SELECT COUNT(*) as count FROM training_achievements
    `);
    console.log(`📊 现有成就数据: ${existingData[0].count} 条`);

    // 3. 如果没有数据，插入默认成就
    if (existingData[0].count === 0) {
      console.log('📝 插入默认成就数据...');

      const defaultAchievements = [
        {
          childId: 0,
          achievementType: 'streak',
          achievementName: '初学者',
          achievementDescription: '连续训练3天',
          badgeIcon: '🌟',
          badgeColor: '#FFD700',
          pointsAwarded: 10,
          level: 1,
          criteria: JSON.stringify({ minDays: 3 }),
          maxProgress: 3,
          tags: JSON.stringify(['streak', 'beginner']),
          isActive: 1,
          isPublic: 1,
          progress: 0,
          isEarned: 0
        },
        {
          childId: 0,
          achievementType: 'streak',
          achievementName: '坚持者',
          achievementDescription: '连续训练7天',
          badgeIcon: '⭐',
          badgeColor: '#C0C0C0',
          pointsAwarded: 25,
          level: 2,
          criteria: JSON.stringify({ minDays: 7 }),
          maxProgress: 7,
          tags: JSON.stringify(['streak', 'dedicated']),
          isActive: 1,
          isPublic: 1,
          progress: 0,
          isEarned: 0
        },
        {
          childId: 0,
          achievementType: 'completion',
          achievementName: '初次尝试',
          achievementDescription: '完成第一个训练活动',
          badgeIcon: '🎯',
          badgeColor: '#90EE90',
          pointsAwarded: 5,
          level: 1,
          criteria: JSON.stringify({ requiredCount: 1 }),
          maxProgress: 1,
          tags: JSON.stringify(['completion', 'first']),
          isActive: 1,
          isPublic: 1,
          progress: 0,
          isEarned: 0
        },
        {
          childId: 0,
          achievementType: 'mastery',
          achievementName: '完美表现',
          achievementDescription: '训练得分达到90分以上',
          badgeIcon: '💎',
          badgeColor: '#F0E68C',
          pointsAwarded: 40,
          level: 3,
          criteria: JSON.stringify({ masteryScore: 90 }),
          maxProgress: 100,
          tags: JSON.stringify(['mastery', 'excellent']),
          isActive: 1,
          isPublic: 1,
          progress: 0,
          isEarned: 0
        }
      ];

      // 插入数据
      for (const achievement of defaultAchievements) {
        await sequelize.query(`
          INSERT INTO training_achievements (
            childId, achievementType, achievementName, achievementDescription,
            badgeIcon, badgeColor, pointsAwarded, level, criteria,
            maxProgress, tags, isActive, isPublic, progress, isEarned,
            createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, {
          replacements: [
            achievement.childId,
            achievement.achievementType,
            achievement.achievementName,
            achievement.achievementDescription,
            achievement.badgeIcon,
            achievement.badgeColor,
            achievement.pointsAwarded,
            achievement.level,
            achievement.criteria,
            achievement.maxProgress,
            achievement.tags,
            achievement.isActive,
            achievement.isPublic,
            achievement.progress,
            achievement.isEarned
          ]
        });
      }

      console.log(`✅ 成功插入 ${defaultAchievements.length} 条默认成就数据`);
    }

    // 4. 验证训练活动数据
    const [trainingActivities] = await sequelize.query(`
      SELECT COUNT(*) as count FROM training_activities
    `);
    console.log(`📊 训练活动数据: ${trainingActivities[0].count} 条`);

    // 5. 显示一些样本数据
    const [sampleActivities] = await sequelize.query(`
      SELECT id, activityName, activityType, targetAgeMin, targetAgeMax
      FROM training_activities
      LIMIT 3
    `);
    console.log('📝 样本训练活动:');
    console.table(sampleActivities);

    console.log('🎉 成就表修复完成！');

  } catch (error) {
    console.error('❌ 修复失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 运行修复
fixAchievementTable()
  .then(() => {
    console.log('✅ 修复成功完成');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ 修复失败:', error);
    process.exit(1);
  });