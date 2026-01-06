require('dotenv').config();
const { Sequelize } = require('sequelize');

// 创建数据库连接
const sequelize = new Sequelize(
  process.env.DB_DATABASE || 'kargerdensales',
  process.env.DB_USERNAME || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: process.env.DB_PORT || 43906,
    dialect: 'mysql',
    timezone: '+08:00'
  }
);

async function runTrainingMigration() {
  try {
    console.log('🚀 开始运行训练活动迁移...');

    // 验证数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 1. 查询现有游戏数据
    console.log('📊 查询现有游戏数据...');
    const [games] = await sequelize.query(`
      SELECT
        id,
        game_key,
        game_name,
        game_type,
        description,
        difficulty_levels,
        min_age,
        max_age,
        theme_type
      FROM game_configs
      WHERE status = 'active'
      ORDER BY game_type, id
    `);

    console.log(`📊 找到 ${games.length} 个现有游戏`);

    if (games.length === 0) {
      console.log('⚠️  没有找到游戏数据，跳过训练活动创建');
      return;
    }

    // 检查训练活动表是否已存在数据
    const [existingActivities] = await sequelize.query(`
      SELECT COUNT(*) as count FROM training_activities
    `);

    if (existingActivities[0].count > 0) {
      console.log(`⚠️  训练活动表已存在 ${existingActivities[0].count} 条数据，跳过迁移`);
      return;
    }

    // 2. 基于游戏类型创建训练活动
    const gameTypeMapping = {
      'attention': 'cognitive',
      'memory': 'cognitive',
      'logic': 'cognitive',
      'language': 'language',
      'social': 'social',
      'motor': 'motor'
    };

    const ageRangeBase = {
      'attention': { min: 3, max: 6 },
      'memory': { min: 2, max: 5 },
      'logic': { min: 4, max: 6 },
      'language': { min: 2, max: 6 },
      'social': { min: 3, max: 6 },
      'motor': { min: 2, max: 5 }
    };

    const learningObjectives = {
      'attention': ['提升注意力和专注度', '锻炼观察力和识别能力', '增强视觉搜索能力', '培养持续专注的习惯'],
      'memory': ['增强短期记忆能力', '提升记忆力和反应速度', '锻炼信息处理能力', '培养记忆力训练方法'],
      'logic': ['培养逻辑思维能力', '提升分类和排序能力', '锻炼问题解决能力', '发展推理和分析能力'],
      'language': ['提升语言理解能力', '丰富词汇量', '锻炼表达能力', '培养语言交流兴趣'],
      'social': ['培养社交互动能力', '学习合作和分享', '理解情感表达', '建立人际关系'],
      'motor': ['提升手眼协调能力', '锻炼精细动作', '增强运动控制能力', '培养动作技能']
    };

    const trainingTips = {
      'attention': '确保孩子在安静的环境中训练，避免干扰因素。可以设置计时目标，逐步延长专注时间。',
      'memory': '从简单的内容开始，逐步增加难度。鼓励孩子使用记忆技巧，如重复、联想等方法。',
      'logic': '引导孩子思考问题的过程，不要急于给出答案。鼓励尝试不同的解决方案。',
      'language': '多与孩子交流，鼓励完整表达。可以通过游戏、故事等方式增加语言练习机会。',
      'social': '创造与其他小朋友互动的机会。引导孩子学习分享、合作和解决冲突的方法。',
      'motor': '确保动作的规范性，避免过度疲劳。注意安全防护，预防意外伤害。'
    };

    const materials = {
      'attention': ['安静的环境', '合适的照明', '计时器'],
      'memory': ['记忆卡片', '图片素材', '记录本'],
      'logic': ['逻辑拼图', '分类物品', '思考工具'],
      'language': ['绘本', '图片卡片', '录音设备'],
      'social': ['合作玩具', '角色扮演道具', '互动游戏'],
      'motor': ['精细动作玩具', '手工材料', '安全防护用品']
    };

    const benefits = {
      'attention': ['提高学习效率', '增强专注力', '改善注意力分散问题'],
      'memory': ['提升记忆力', '增强学习效果', '培养记忆策略'],
      'logic': ['发展思维能力', '提高问题解决能力', '培养逻辑推理'],
      'language': ['促进语言发展', '提高表达能力', '增强沟通技巧'],
      'social': ['培养社交技能', '增强合作意识', '改善人际关系'],
      'motor': ['提升动作协调', '增强精细动作', '促进身体发育']
    };

    // 3. 生成训练活动数据
    const trainingActivities = [];

    for (const game of games) {
      const activityType = gameTypeMapping[game.game_type] || 'cognitive';

      // 使用游戏配置中的年龄范围，如果没有则使用默认值
      const targetAgeMin = game.min_age ? Math.floor(game.min_age / 12) : 3;
      const targetAgeMax = game.max_age ? Math.floor(game.max_age / 12) : 6;

      // 估算难度等级
      const difficultyLevel = game.difficulty_levels ?
        Math.max(1, Math.min(5, Object.keys(game.difficulty_levels).length)) : 2;

      const baseObjectives = learningObjectives[game.game_type] || learningObjectives['cognitive'];
      const targetCount = Math.min(baseObjectives.length, 2 + Math.floor(difficultyLevel / 2));

      trainingActivities.push({
        gameId: game.id,
        activityName: `${game.game_name}训练`,
        activityType: activityType,
        targetAgeMin: targetAgeMin,
        targetAgeMax: targetAgeMax,
        difficultyLevel: difficultyLevel,
        estimatedDuration: 15, // 默认15分钟
        learningObjectives: JSON.stringify(baseObjectives.slice(0, targetCount)),
        trainingTips: trainingTips[game.game_type] || '保持轻松愉快的训练氛围，及时给予鼓励和肯定。',
        description: game.description || `${game.game_name}的互动训练活动`,
        materials: JSON.stringify(materials[game.game_type] || ['基础训练材料', '记录工具']),
        benefits: JSON.stringify(benefits[game.game_type] || ['促进综合能力发展', '提升学习兴趣', '培养良好习惯']),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    console.log(`🎯 准备创建 ${trainingActivities.length} 个训练活动`);

    // 4. 批量插入训练活动数据
    if (trainingActivities.length > 0) {
      for (const activity of trainingActivities) {
        await sequelize.query(`
          INSERT INTO training_activities (
            gameId, activityName, activityType, targetAgeMin, targetAgeMax,
            difficultyLevel, estimatedDuration, learningObjectives, trainingTips,
            description, materials, benefits, isActive, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, {
          replacements: [
            activity.gameId,
            activity.activityName,
            activity.activityType,
            activity.targetAgeMin,
            activity.targetAgeMax,
            activity.difficultyLevel,
            activity.estimatedDuration,
            activity.learningObjectives,
            activity.trainingTips,
            activity.description,
            activity.materials,
            activity.benefits,
            activity.isActive,
            activity.createdAt,
            activity.updatedAt
          ]
        });
      }
      console.log(`✅ 成功创建 ${trainingActivities.length} 个训练活动`);
    }

    // 5. 创建默认成就模板
    console.log('🏆 创建默认成就模板...');

    const defaultAchievements = [
      {
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
        isActive: true,
        isPublic: true,
        progress: 0,
        isEarned: false,
        childId: 0
      },
      {
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
        isActive: true,
        isPublic: true,
        progress: 0,
        isEarned: false,
        childId: 0
      },
      {
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
        isActive: true,
        isPublic: true,
        progress: 0,
        isEarned: false,
        childId: 0
      },
      {
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
        isActive: true,
        isPublic: true,
        progress: 0,
        isEarned: false,
        childId: 0
      }
    ];

    // 检查是否已有成就数据
    const [existingAchievements] = await sequelize.query(`
      SELECT COUNT(*) as count FROM training_achievements
    `);

    if (existingAchievements[0].count === 0) {
      for (const achievement of defaultAchievements) {
        await sequelize.query(`
          INSERT INTO training_achievements (
            childId, achievementType, achievementName, achievementDescription,
            badgeIcon, badgeColor, pointsAwarded, level, criteria,
            maxProgress, tags, isActive, isPublic, progress, isEarned,
            createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            achievement.isEarned,
            new Date(),
            new Date()
          ]
        });
      }
      console.log(`✅ 成功创建 ${defaultAchievements.length} 个成就模板`);
    }

    console.log('🎉 训练活动迁移完成');

  } catch (error) {
    console.error('❌ 训练活动迁移失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 运行迁移
runTrainingMigration()
  .then(() => {
    console.log('✅ 迁移成功完成');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ 迁移失败:', error);
    process.exit(1);
  });