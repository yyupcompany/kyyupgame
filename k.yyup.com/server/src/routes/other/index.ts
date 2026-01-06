/**
 * 其他模块路由聚合文件
 * 统一管理所有杂项功能的路由
 */

import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';

// ✅ 导入所有其他路由
import kindergartenRoutes from '../kindergarten.routes';
import kindergartenBasicInfoRoutes from '../kindergarten-basic-info.routes';
import classesRoutes from '../classes.routes';
import tasksRoutes from '../task.routes';
import todoRoutes from '../todos.routes';
import gameRoutes from '../game.routes';
import apiRoutes from '../api.routes';
import apiListRoutes from '../api-list.routes';
import assessmentRoutes from '../assessment.routes';
import assessmentAdminRoutes from '../assessment-admin.routes';
import assessmentShareRoutes from '../assessment-share.routes';
// TODO: 以下路由需要完善后再启用
// import assessmentAnalyticsRoutes from '../assessment-analytics.routes';
// import teacherAssessmentRoutes from '../teacher-assessment.routes';
import inspectionRoutes from '../inspection.routes';
import inspectionRecordRoutes from '../inspection-record.routes';
import inspectionRectificationRoutes from '../inspection-rectification.routes';
import performanceRoutes from '../performance.routes';
import performanceEvaluationRoutes from '../performance-evaluation.routes';
import performanceReportRoutes from '../performance-report.routes';
import performanceRuleRoutes from '../performance-rule.routes';
// 话术中心已删除，移除相关路由
// import scriptRoutes from '../script.routes';
// import scriptCategoryRoutes from '../script-category.routes';
import quickQueryGroupsRoutes from '../quick-query-groups.routes';
import dataImportRoutes from '../data-import.routes';
import batchImportRoutes from '../batch-import.routes';
import fieldTemplateRoutes from '../field-template.routes';
import filesRoutes from '../files.routes';
import channelsRoutes from '../channels.routes';
import likeCollectConfigRoutes from '../like-collect-config.routes';
import likeCollectRecordsRoutes from '../like-collect-records.routes';
import groupRoutes from '../group.routes';
import dashboardRoutes from '../dashboard.routes';
import principalRoutes from '../principal.routes';
import principalPerformanceRoutes from '../principal-performance.routes';
import statisticsRoutes from '../statistics.routes';
import statisticsAdapterRoutes from '../statistics-adapter.routes';
import unifiedStatisticsRoutes from '../unified-statistics.routes';
import usageCenterRoutes from '../usage-center.routes';
import aiConversationRoutes from '../ai-conversation.routes';
import chatRoutes from '../chat.routes';
import errorRoutes from '../errors.routes';
import exampleRoutes from '../example.routes';
import aiKnowledgeRoutes from '../ai-knowledge.routes';

/**
 * 其他模块路由配置
 */
const otherModuleRoutes = (router: Router) => {
  // 🔹 幼儿园和班级
  router.use('/kindergartens', kindergartenRoutes);
  router.use('/kindergarten', kindergartenRoutes); // 别名
  router.use('/kindergarten-basic-info', kindergartenBasicInfoRoutes);
  router.use('/classes', classesRoutes);

  // 🔹 任务和待办
  router.use('/tasks', tasksRoutes);
  router.use('/task', tasksRoutes); // 别名
  console.log('✅ 任务路由已注册: /api/tasks, /api/task');
  router.use('/todos', todoRoutes);

  // 🔹 游戏
  router.use('/games', gameRoutes);

  // 🔹 API
  router.use('/', apiRoutes); // 基础 API 信息
  router.use('/list', apiListRoutes);

  // 🔹 评估
  router.use('/assessment', assessmentRoutes);
  router.use('/assessment-admin', assessmentAdminRoutes);
  router.use('/assessment-share', assessmentShareRoutes);
  // TODO: 以下路由需要完善后再启用
  // router.use('/assessment-analytics', assessmentAnalyticsRoutes);
  // router.use('/teacher/assessment', teacherAssessmentRoutes);

  // 🔹 检查和整改
  router.use('/inspection', inspectionRoutes);
  router.use('/inspection-records', inspectionRecordRoutes);
  router.use('/inspection-rectifications', inspectionRectificationRoutes);

  // 🔹 绩效管理
  router.use('/performance', performanceRoutes);
  router.use('/performance/evaluations', performanceEvaluationRoutes);
  router.use('/performance/reports', performanceReportRoutes);
  router.use('/performance/rules', performanceRuleRoutes);
  router.use('/principal/performance', principalPerformanceRoutes);

  // 🔹 脚本和查询（话术中心已删除，注释掉相关路由）
  // router.use('/scripts', scriptRoutes);
  // router.use('/script-categories', scriptCategoryRoutes);
  router.use('/quick-query-groups', quickQueryGroupsRoutes);

  // 🔹 数据导入和字段
  router.use('/data-import', dataImportRoutes);
  router.use('/batch-import', batchImportRoutes);
  router.use('/field-templates', fieldTemplateRoutes);

  // 🔹 文件和频道
  router.use('/files', filesRoutes);
  router.use('/channels', channelsRoutes);

  // 🔹 点赞和收藏
  router.use('/like-collect-config', likeCollectConfigRoutes);
  router.use('/like-collect-records', likeCollectRecordsRoutes);

  // 🔹 分组
  router.use('/group', groupRoutes);

  // 🔹 仪表盘和统计
  router.use('/dashboard', dashboardRoutes);
  router.use('/dashboard-stats', dashboardRoutes); // 别名
  router.use('/principal', principalRoutes);
  router.use('/statistics', unifiedStatisticsRoutes);
  router.use('/statistics-legacy', statisticsRoutes);
  router.use('/statistics-adapter', statisticsAdapterRoutes);
  router.use('/unified-statistics', unifiedStatisticsRoutes);
  router.use('/usage-center', usageCenterRoutes);

  // 🔹 对话和聊天
  router.use('/ai-conversations', aiConversationRoutes);
  router.use('/chat', chatRoutes);

  // 🔹 知识库
  router.use('/ai-knowledge', aiKnowledgeRoutes);

  // 🔹 调试和示例
  router.use('/errors', errorRoutes);
  router.use('/example', exampleRoutes);
  router.use('/examples', exampleRoutes); // 别名

  console.log('✅ 其他模块路由已注册 (50+ 个路由)');
};

export default otherModuleRoutes;

