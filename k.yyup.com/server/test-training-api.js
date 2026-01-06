require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 导入简化版的控制器和模型
const trainingController = require('./src/controllers/training.controller.simple');
const { sequelize, TrainingActivity, TrainingPlan, TrainingRecord, TrainingAchievement } = require('./dist/init');

const app = express();
app.use(cors());
app.use(express.json());

// 简单的中间件模拟认证
app.use('/api/training/*', (req, res, next) => {
  req.user = { id: 1 }; // 模拟用户ID
  next();
});

// 注册所有训练相关的路由
app.get('/api/training/activities', trainingController.getActivities);
app.get('/api/training/activities/:activityId', trainingController.getActivityById);
app.get('/api/training/plans', trainingController.getPlans);
app.get('/api/training/plans/:planId', trainingController.getPlanById);
app.post('/api/training/plans', trainingController.createPlan);
app.put('/api/training/plans/:planId', trainingController.updatePlan);
app.get('/api/training/daily-tasks', trainingController.getDailyTasks);
app.post('/api/training/start-activity', trainingController.startActivity);
app.post('/api/training/complete-activity/:recordId', trainingController.completeActivity);
app.get('/api/training/records', trainingController.getRecords);
app.get('/api/training/progress', trainingController.getProgress);
app.get('/api/training/achievements', trainingController.getAchievements);
app.get('/api/training/reports/:planId', trainingController.getTrainingReport);

// 测试路由
app.get('/api/test/activities', async (req, res) => {
  try {
    const activities = await TrainingActivity.findAll({
      limit: 5,
      attributes: ['id', 'activityName', 'activityType', 'targetAgeMin', 'targetAgeMax', 'difficultyLevel']
    });
    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = 3001;

async function startServer() {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    app.listen(PORT, () => {
      console.log(`🚀 训练中心测试服务器启动成功！`);
      console.log(`📍 服务地址: http://localhost:${PORT}`);
      console.log('\n📋 可用的API端点:');
      console.log('  GET  /api/test/activities - 测试获取训练活动');
      console.log('  GET  /api/training/activities - 获取训练活动列表');
      console.log('  GET  /api/training/plans - 获取训练计划列表');
      console.log('  POST /api/training/plans - 创建训练计划');
      console.log('\n💡 测试示例:');
      console.log(`curl http://localhost:${PORT}/api/test/activities`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();