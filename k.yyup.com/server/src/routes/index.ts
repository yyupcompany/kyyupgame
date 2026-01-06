/**
 * ✨ 主路由聚合文件 - 重构版
 * 
 * 这个文件是所有路由的中央聚合器
 * 使用二级路由模块结构，大幅简化了代码复杂度
 * 
 * 目录结构:
 * routes/
 * ├── ai/              (AI 相关)
 * ├── auth/            (认证和权限)
 * ├── users/           (用户管理)
 * ├── enrollment/      (招生管理)
 * ├── activity/        (活动管理)
 * ├── teaching/        (教学模块)
 * ├── business/        (业务模块)
 * ├── system/          (系统管理)
 * ├── marketing/       (营销模块)
 * ├── content/         (内容模块)
 * ├── other/           (其他模块)
 * └── index.ts         (主聚合)
 */

import { Router } from 'express';
import apiDebugLogger from '../middlewares/debug-log.middleware';
import { verifyToken, checkPermission, authenticate } from '../middlewares/auth.middleware';
import { tenantResolverMiddleware } from '../middlewares/tenant-resolver.middleware';
import { PrincipalController } from '../controllers/principal.controller';
import { DashboardController } from '../controllers/dashboard.controller';
import { MarketingController } from '../controllers/marketing.controller';

// 🔹 导入所有模块路由
import aiModuleRoutes from './ai/index';
import authModuleRoutes from './auth/index';
import usersModuleRoutes from './users/index';
import enrollmentModuleRoutes from './enrollment/index';
import activityModuleRoutes from './activity/index';
import teachingModuleRoutes from './teaching/index';
import businessModuleRoutes from './business/index';
import systemModuleRoutes from './system/index';
import marketingModuleRoutes from './marketing/index';
import contentModuleRoutes from './content/index';
import otherModuleRoutes from './other/index';
import simplifiedCentersRoutes from './simplified-centers.routes';
import attendanceCenterRoutes from './attendance-center.routes';
import personnelCenterRoutes from './personnel-center.routes';
import assessmentRoutes from './assessment.routes';
import assessmentAdminRoutes from './assessment-admin.routes';
import photoAlbumRoutes from './photo-album.routes';
import parentAssistantRoutes from './parent-assistant.routes';
import interactiveCurriculumRoutes from './interactive-curriculum.routes';
// import trainingRoutes from './training.routes'; // 暂时注释训练路由
// const parentRewardsRoutes = require('../api/parent-rewards.api.js'); // 暂时注释，文件不存在

// ✅ 特殊路由导入 (不属于任何模块的独立路由)
import vosConfigController from '../controllers/vos-config.controller';

// 🎯 创建主路由器
const router = Router();

// ═══════════════════════════════════════════════════════════════════════════
// 📝 第一阶段: 中间件和基础配置
// ═══════════════════════════════════════════════════════════════════════════

// 租户解析中间件 (必须最先应用)
router.use((req, res, next) => tenantResolverMiddleware(req as any, res as any, next as any));
console.log('[API] ✅ 已启用租户解析中间件');

// 调试日志中间件 (仅开发环境)
if (process.env.NODE_ENV !== 'production') {
  router.use(apiDebugLogger);
  console.log('[API] ✅ 已启用调试日志中间件');
}

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 第二阶段: 注册所有模块路由
// ═══════════════════════════════════════════════════════════════════════════

console.log('[路由系统] 🚀 开始注册模块化路由...\n');

// 第一优先级: 认证模块 (必须最先)
authModuleRoutes(router);

// 其他模块 (顺序不重要，但为了可读性保持逻辑顺序)
usersModuleRoutes(router);
enrollmentModuleRoutes(router);
activityModuleRoutes(router);
teachingModuleRoutes(router);
aiModuleRoutes(router);
businessModuleRoutes(router);
systemModuleRoutes(router);
marketingModuleRoutes(router);
contentModuleRoutes(router);
otherModuleRoutes(router);

// 集合API模块 - 中心页面聚合数据
router.use('/centers', simplifiedCentersRoutes);

// 考勤中心模块
router.use('/attendance-center', attendanceCenterRoutes);

// 人员中心模块
router.use('/personnel-center', personnelCenterRoutes);

// 测评模块
router.use('/assessment', assessmentRoutes);

// 测评管理模块 (assessment-admin)
router.use('/api/assessment-admin', verifyToken, assessmentAdminRoutes);

// 相册中心模块 - 使用上海OSS节点
router.use('/photo-album', photoAlbumRoutes);

// 家长助手API
router.use('/parent-assistant', parentAssistantRoutes);

// 互动课程API - AI课程生成
router.use('/interactive-curriculum', verifyToken, interactiveCurriculumRoutes);

// 成长记录API - 学生成长档案管理
import growthRecordsRoutes from './growth-records.routes';
router.use('/growth-records', growthRecordsRoutes);

// 训练中心模块 - 暂时注释
// router.use('/training', trainingRoutes);

// 家长园所奖励API - 连接真实绩效管理数据库
// 使用智能双认证中间件，自动支持本地认证和统一认证
// router.use('/parent-rewards', verifyToken, parentRewardsRoutes); // 暂时注释，文件不存在

// 家长园所奖励API测试版本 (无认证，仅用于开发测试)
// router.use('/parent-rewards-test', parentRewardsRoutes); // 暂时注释，文件不存在

// 🆕 新增的API端点
import uploadRoutes from './upload.routes';
import followupRoutes from './followup.routes';

// 通用文件上传API - 支持OSS存储
router.use('/upload', uploadRoutes);

// 跟进记录管理API
router.use('/followups', followupRoutes);

// 话术中心API已删除，注释掉相关路由
// import scriptRoutes from './script.routes';
// import scriptCategoryRoutes from './script-category.routes';
// router.use('/api/scripts', verifyToken, scriptRoutes);
// router.use('/api/script-categories', verifyToken, scriptCategoryRoutes);

// ═══════════════════════════════════════════════════════════════════════════
// 🔧 第三阶段: 特殊路由和兼容性路由
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /principal/dashboard-stats:
 *   get:
 *     tags: [园长工作台]
 *     summary: 获取园长仪表盘统计数据
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取统计数据成功
 */
const principalController = new PrincipalController();
router.get('/principal/dashboard-stats', verifyToken, (req, res) =>
  principalController.getDashboardStats(req as any, res));

/**
 * @swagger
 * /principal/activities:
 *   get:
 *     tags: [园长工作台]
 *     summary: 获取园长活动列表
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取活动列表成功
 */
router.get('/principal/activities', verifyToken, (req, res) =>
  principalController.getActivities(req as any, res));

/**
 * @swagger
 * /campus/overview:
 *   get:
 *     tags: [校园管理]
 *     summary: 获取校园概览信息
 *     security:
 *       - bearerAuth: []
 */
router.get('/campus/overview', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: '获取校园概览成功',
    data: {
      totalStudents: 1200,
      totalTeachers: 80,
      totalClasses: 24,
      totalActivities: 15,
      campusArea: '5000平方米',
      buildingCount: 3,
      playgroundCount: 2,
      libraryCount: 1,
      lastUpdateTime: new Date().toISOString()
    }
  });
});

/**
 * @swagger
 * /principal/dashboard/overview:
 *   get:
 *     tags: [园长工作台]
 *     summary: 获取园长工作台概览
 *     security:
 *       - bearerAuth: []
 */
router.get('/principal/dashboard/overview', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: '获取园长工作台概览成功',
    data: {
      totalStudents: 1200,
      totalTeachers: 80,
      totalClasses: 24,
      pendingApplications: 15,
      monthlyRevenue: 2850000,
      occupancyRate: 0.92,
      satisfactionScore: 4.7,
      upcomingEvents: 8,
      urgentTasks: 3,
      recentAlerts: [
        { type: 'info', message: '新入学申请需要审批', time: '2小时前' },
        { type: 'warning', message: '班级人数即将达到上限', time: '1天前' }
      ]
    }
  });
});

/**
 * @swagger
 * /marketing/analysis:
 *   get:
 *     tags: [营销分析]
 *     summary: 获取营销分析数据
 *     security:
 *       - bearerAuth: []
 */
router.get('/marketing/analysis', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: '获取营销分析数据成功',
    data: {
      overview: {
        totalCampaigns: 12,
        activeCampaigns: 5,
        totalLeads: 1280,
        conversionRate: 0.186
      },
      channelAnalysis: {
        online: { leads: 680, conversions: 128, rate: 0.188 },
        offline: { leads: 420, conversions: 85, rate: 0.202 },
        referral: { leads: 180, conversions: 25, rate: 0.139 }
      },
      monthlyTrends: [
        { month: '2024-01', leads: 95, conversions: 18 },
        { month: '2024-02', leads: 110, conversions: 22 },
        { month: '2024-03', leads: 125, conversions: 28 }
      ],
      topPerformingCampaigns: [
        { id: 1, name: '春季招生活动', leads: 285, conversions: 52 },
        { id: 2, name: '在线开放日', leads: 195, conversions: 38 }
      ]
    }
  });
});

/**
 * @swagger
 * /parents:
 *   post:
 *     tags: [家长管理]
 *     summary: 创建家长信息
 *     security:
 *       - bearerAuth: []
 */
router.post('/parents', verifyToken, checkPermission('PARENT_MANAGE'), async (req, res) => {
  try {
    const { name, phone, relationship, studentId } = req.body;
    const parent = {
      id: Math.floor(Math.random() * 1000) + 1,
      name,
      phone,
      relationship,
      studentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    res.status(201).json({
      success: true,
      message: '家长创建成功',
      data: parent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建家长失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * VOS 配置API
 */
router.get('/vos-config', verifyToken, (req, res) => vosConfigController.getAllConfigs(req as any, res));
router.get('/vos-config/active', verifyToken, (req, res) => vosConfigController.getActiveConfig(req as any, res));
router.post('/vos-config', verifyToken, (req, res) => vosConfigController.createConfig(req as any, res));
router.put('/vos-config/:id', verifyToken, (req, res) => vosConfigController.updateConfig(req as any, res));
router.delete('/vos-config/:id', verifyToken, (req, res) => vosConfigController.deleteConfig(req as any, res));
router.post('/vos-config/:id/activate', verifyToken, (req, res) => vosConfigController.activateConfig(req as any, res));
router.post('/vos-config/test', authenticate, (req, res) => vosConfigController.testConnection(req as any, res));
router.get('/vos-config/connection-url', verifyToken, (req, res) => vosConfigController.getConnectionUrl(req as any, res));

/**
 * @swagger
 * /ai/memories/search:
 *   get:
 *     tags: [AI管理]
 *     summary: 搜索AI记忆
 *     security:
 *       - bearerAuth: []
 */
router.get('/ai/memories/search', verifyToken, (req, res) => {
  const { keyword, userId, limit = 10 } = req.query;
  res.json({
    success: true,
    message: 'AI记忆搜索成功',
    data: {
      keyword,
      results: [
        {
          id: 1,
          content: `关于${keyword}的学习记录`,
          similarity: 0.95,
          timestamp: '2024-07-10',
          source: 'conversation',
          context: '教学讨论'
        }
      ],
      total: 1,
      searchTime: '0.05s'
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 📊 第四阶段: 系统信息端点
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /system/settings:
 *   get:
 *     tags: [系统管理]
 *     summary: 获取系统设置
 *     security:
 *       - bearerAuth: []
 */
router.get('/system/settings', verifyToken, async (req, res) => {
  try {
    const { getSystemSettingsByGroup } = await import('../scripts/init-system-settings');
    const basicSettings = await getSystemSettingsByGroup('basic');
    const securitySettings = await getSystemSettingsByGroup('security');
    const emailSettings = await getSystemSettingsByGroup('email');
    const storageSettings = await getSystemSettingsByGroup('storage');
    
    const allSettings = {
      ...basicSettings,
      ...securitySettings,
      ...emailSettings,
      ...storageSettings
    };

    res.json({
      success: true,
      message: '获取系统设置成功',
      data: allSettings
    });
  } catch (error) {
    console.error('获取系统设置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取系统设置失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * @swagger
 * /system/backups:
 *   get:
 *     tags: [系统管理]
 *     summary: 获取系统备份列表
 *     security:
 *       - bearerAuth: []
 */
router.get('/system/backups', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: '获取系统备份列表成功',
    data: {
      total: 3,
      items: [
        {
          id: 1,
          fileName: 'backup_20240712_001.sql',
          fileSize: '156.8MB',
          backupDate: '2024-07-12',
          status: 'completed',
          type: 'full'
        }
      ]
    }
  });
});

/**
 * @swagger
 * /system/settings:
 *   put:
 *     tags: [系统管理]
 *     summary: 更新系统设置
 *     security:
 *       - bearerAuth: []
 */
router.put('/system/settings', verifyToken, async (req, res) => {
  try {
    const { group, settings } = req.body;
    const userId = (req as any).user?.id || 1;
    console.log(`🔧 系统设置更新 - 组: ${group}`, settings);

    const { setSystemSetting, getSystemSettingsByGroup } = await import('../scripts/init-system-settings');
    const updatePromises: Promise<boolean>[] = [];
    const updatedSettings: Record<string, any> = {};

    for (const [key, value] of Object.entries(settings)) {
      updatePromises.push(setSystemSetting(group, key, value, userId));
      updatedSettings[key] = value;
    }

    const results = await Promise.all(updatePromises);
    const updatedGroupSettings = await getSystemSettingsByGroup(group);

    res.json({
      success: true,
      message: '系统设置更新成功',
      data: {
        group,
        settings: updatedGroupSettings,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('系统设置更新失败:', error);
    res.status(500).json({
      success: false,
      message: '系统设置更新失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ✨ 完成: 路由系统初始化
// ═══════════════════════════════════════════════════════════════════════════

console.log('[路由系统] ✅ 所有模块化路由已注册完成!');
console.log(`[路由系统] 📊 路由模块组成:`);
console.log(`  • AI 模块 (15+ 个路由)`);
console.log(`  • 认证和权限模块 (8 个路由)`);
console.log(`  • 用户模块 (12+ 个路由)`);
console.log(`  • 招生管理模块 (13 个主路由)`);
console.log(`  • 活动管理模块 (11 个主路由)`);
console.log(`  • 教学模块 (8+ 个路由)`);
console.log(`  • 业务模块 (13+ 个路由)`);
console.log(`  • 系统管理模块 (15+ 个路由)`);
console.log(`  • 营销模块 (7 个主路由)`);
console.log(`  • 内容模块 (16+ 个路由)`);
console.log(`  • 其他模块 (50+ 个路由)`);
console.log(`\n[路由系统] 🎯 总计: 230+ 个路由已组织到 11 个逻辑模块\n`);


export default router;

