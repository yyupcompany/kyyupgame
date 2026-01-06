require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

// 直接使用数据库配置创建Sequelize实例
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kindergarten',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906'),
    dialect: 'mysql',
    logging: console.log,
    timezone: '+08:00',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const app = express();
app.use(cors());
app.use(express.json());

// 简单的中间件模拟认证
app.use('/api/training/*', (req, res, next) => {
  req.user = { id: 1 }; // 模拟用户ID
  next();
});

// 直接在文件中定义模型以避免导入问题
const TrainingActivity = sequelize.define('TrainingActivity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  gameId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '关联游戏ID'
  },
  activityName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '活动名称'
  },
  activityType: {
    type: DataTypes.ENUM('cognitive', 'motor', 'language', 'social'),
    allowNull: false,
    comment: '活动类型'
  },
  targetAgeMin: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '最小年龄'
  },
  targetAgeMax: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '最大年龄'
  },
  difficultyLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '难度等级(1-5)'
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 15,
    comment: '预计时长(分钟)'
  },
  learningObjectives: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: '学习目标'
  },
  activityDescription: {
    type: DataTypes.TEXT,
    comment: '活动描述'
  },
  trainingTips: {
    type: DataTypes.TEXT,
    comment: '训练指导'
  },
  prerequisites: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: '前置条件'
  },
  equipment: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: '所需器材'
  },
  variations: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: '变化形式'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否启用'
  }
}, {
  tableName: 'training_activities',
  timestamps: true,
  paranoid: true
});

const TrainingAchievement = sequelize.define('TrainingAchievement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  childId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '孩子ID(0表示模板)'
  },
  achievementName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '成就名称'
  },
  achievementDescription: {
    type: DataTypes.TEXT,
    comment: '成就描述'
  },
  achievementType: {
    type: DataTypes.ENUM('streak', 'completion', 'improvement', 'mastery'),
    allowNull: false,
    comment: '成就类型'
  },
  badgeIcon: {
    type: DataTypes.STRING(100),
    defaultValue: '🏆',
    comment: '徽章图标'
  },
  pointsAwarded: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '奖励积分'
  },
  criteria: {
    type: DataTypes.JSON,
    comment: '达成条件'
  },
  isEarned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否已获得'
  },
  earnedDate: {
    type: DataTypes.DATE,
    comment: '获得时间'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否启用'
  }
}, {
  tableName: 'training_achievements',
  timestamps: true
});

// API端点

// 获取训练活动列表
app.get('/api/training/activities', async (req, res) => {
  try {
    const { activityType, targetAge, difficultyLevel } = req.query;
    const whereCondition = { isActive: true };

    if (activityType) whereCondition.activityType = activityType;
    if (targetAge) {
      whereCondition[Sequelize.Op.and] = [
        sequelize.where(sequelize.col('targetAgeMin'), '<=', parseInt(targetAge)),
        sequelize.where(sequelize.col('targetAgeMax'), '>=', parseInt(targetAge))
      ];
    }
    if (difficultyLevel) whereCondition.difficultyLevel = parseInt(difficultyLevel);

    const activities = await TrainingActivity.findAll({
      where: whereCondition,
      attributes: ['id', 'activityName', 'activityType', 'targetAgeMin', 'targetAgeMax', 'difficultyLevel', 'durationMinutes', 'activityDescription']
    });

    res.json({
      success: true,
      data: activities,
      total: activities.length
    });
  } catch (error) {
    console.error('获取训练活动失败:', error);
    res.status(500).json({
      success: false,
      message: '获取训练活动失败',
      error: error.message
    });
  }
});

// 获取成就列表
app.get('/api/training/achievements', async (req, res) => {
  try {
    const { childId, type } = req.query;
    const whereCondition = { isActive: true };

    if (childId) whereCondition.childId = parseInt(childId);
    else whereCondition.childId = 0; // 默认显示模板成就

    if (type) whereCondition.achievementType = type;

    const achievements = await TrainingAchievement.findAll({
      where: whereCondition,
      attributes: ['id', 'achievementName', 'achievementDescription', 'achievementType', 'badgeIcon', 'pointsAwarded', 'isEarned', 'earnedDate']
    });

    res.json({
      success: true,
      data: achievements,
      total: achievements.length
    });
  } catch (error) {
    console.error('获取成就列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取成就列表失败',
      error: error.message
    });
  }
});

// 今日任务
app.get('/api/training/daily-tasks', async (req, res) => {
  try {
    const { childId, date } = req.query;
    const today = date || new Date().toISOString().split('T')[0];

    // 模拟今日任务数据
    const dailyTasks = [
      {
        id: 1,
        activityId: 1,
        activityName: '注意力训练 - 找不同',
        activityType: 'cognitive',
        durationMinutes: 15,
        difficultyLevel: 2,
        status: 'pending',
        scheduledTime: '09:00',
        description: '通过找不同游戏训练儿童注意力集中和视觉分辨能力'
      },
      {
        id: 2,
        activityId: 2,
        activityName: '记忆力训练 - 记忆卡片',
        activityType: 'cognitive',
        durationMinutes: 20,
        difficultyLevel: 2,
        status: 'pending',
        scheduledTime: '10:30',
        description: '通过记忆卡片游戏训练儿童短期记忆和记忆力'
      },
      {
        id: 3,
        activityId: 3,
        activityName: '逻辑思维训练 - 数字拼图',
        activityType: 'cognitive',
        durationMinutes: 25,
        difficultyLevel: 3,
        status: 'pending',
        scheduledTime: '14:00',
        description: '通过数字拼图游戏训练儿童逻辑思维和问题解决能力'
      }
    ];

    res.json({
      success: true,
      data: {
        date: today,
        totalTasks: dailyTasks.length,
        completedTasks: 0,
        tasks: dailyTasks
      }
    });
  } catch (error) {
    console.error('获取今日任务失败:', error);
    res.status(500).json({
      success: false,
      message: '获取今日任务失败',
      error: error.message
    });
  }
});

// 获取训练进度
app.get('/api/training/progress', async (req, res) => {
  try {
    const { childId } = req.query;

    // 模拟进度数据
    const progress = {
      overall: {
        totalSessions: 24,
        completedSessions: 18,
        totalDuration: 360, // 分钟
        averageAccuracy: 0.85,
        weeklyProgress: 0.75
      },
      byType: [
        { type: 'cognitive', completed: 12, total: 15, accuracy: 0.88 },
        { type: 'motor', completed: 3, total: 5, accuracy: 0.82 },
        { type: 'language', completed: 2, total: 3, accuracy: 0.85 },
        { type: 'social', completed: 1, total: 1, accuracy: 0.90 }
      ],
      recentActivities: [
        { date: '2025-12-11', activity: '注意力训练', duration: 15, accuracy: 0.92 },
        { date: '2025-12-10', activity: '记忆力训练', duration: 20, accuracy: 0.88 },
        { date: '2025-12-09', activity: '逻辑思维训练', duration: 25, accuracy: 0.85 }
      ]
    };

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('获取训练进度失败:', error);
    res.status(500).json({
      success: false,
      message: '获取训练进度失败',
      error: error.message
    });
  }
});

// 测试端点
app.get('/api/test/training-status', async (req, res) => {
  try {
    // 测试数据库连接
    await sequelize.authenticate();

    // 检查表是否存在
    const trainingActivitiesCount = await TrainingActivity.count();
    const achievementsCount = await TrainingAchievement.count();

    res.json({
      success: true,
      message: '训练中心运行正常',
      data: {
        database: 'connected',
        trainingActivities: trainingActivitiesCount,
        achievements: achievementsCount,
        endpoints: [
          'GET /api/training/activities',
          'GET /api/training/achievements',
          'GET /api/training/daily-tasks',
          'GET /api/training/progress'
        ]
      }
    });
  } catch (error) {
    console.error('训练中心状态检查失败:', error);
    res.status(500).json({
      success: false,
      message: '训练中心状态检查失败',
      error: error.message
    });
  }
});

// 默认首页
app.get('/', (req, res) => {
  res.json({
    message: '训练中心API服务',
    status: 'running',
    endpoints: [
      { path: '/api/test/training-status', description: '训练中心状态检查' },
      { path: '/api/training/activities', description: '获取训练活动列表' },
      { path: '/api/training/achievements', description: '获取成就列表' },
      { path: '/api/training/daily-tasks', description: '获取今日任务' },
      { path: '/api/training/progress', description: '获取训练进度' }
    ]
  });
});

const PORT = 3001;

async function startServer() {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 同步模型
    await TrainingActivity.sync();
    await TrainingAchievement.sync();
    console.log('✅ 数据库模型同步完成');

    app.listen(PORT, () => {
      console.log(`🚀 训练中心独立演示服务器启动成功！`);
      console.log(`📍 服务地址: http://localhost:${PORT}`);
      console.log('\n📋 可用的API端点:');
      console.log('  GET  /                           - 服务首页');
      console.log('  GET  /api/test/training-status    - 训练中心状态检查');
      console.log('  GET  /api/training/activities     - 获取训练活动列表');
      console.log('  GET  /api/training/achievements    - 获取成就列表');
      console.log('  GET  /api/training/daily-tasks     - 获取今日任务');
      console.log('  GET  /api/training/progress        - 获取训练进度');
      console.log('\n💡 测试示例:');
      console.log(`curl http://localhost:${PORT}/api/test/training-status`);
      console.log(`curl http://localhost:${PORT}/api/training/activities?targetAge=4`);
      console.log(`curl http://localhost:${PORT}/api/training/achievements`);
      console.log(`curl http://localhost:${PORT}/api/training/daily-tasks?childId=1`);
      console.log(`curl http://localhost:${PORT}/api/training/progress?childId=1`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n正在关闭服务器...');
  await sequelize.close();
  console.log('数据库连接已关闭');
  process.exit(0);
});

startServer();