/**
 * AI 模块路由聚合文件
 * 统一管理所有 AI 相关的路由功能
 */

import { Router } from 'express';
import { verifyToken, checkPermission } from '../../middlewares/auth.middleware';

// ✅ 第一级: 导入所有AI路由
// 🚀 AI分析服务已迁移到统一租户中心
// import aiAnalysisRoutes from '../ai-analysis.routes';
// 🚀 AI助手优化服务已迁移到统一租户中心
// import aiAssistantOptimizedRoutes from '../ai-assistant-optimized.routes';
import aiBillingRoutes from '../ai-billing.routes';
// 🚀 AI Bridge路由已迁移到统一租户中心，仅保留迁移提示
// import aiBridgeRoutes from '../ai-bridge.routes';
import aiCacheRoutes from '../ai-cache.routes';
import aiConversationRoutes from '../ai-conversation.routes';
import aiCurriculumRoutes from '../ai-curriculum.routes';
import aiKnowledgeRoutes from '../ai-knowledge.routes';
import aiPerformanceRoutes from '../ai-performance.routes';
import aiQueryRoutes from '../ai-query.routes';
import aiScoringRoutes from '../ai-scoring.routes';
import aiShortcutsRoutes from '../ai-shortcuts.routes';
import aiSmartAssignRoutes from '../ai-smart-assign.routes';
import aiStatsRoutes from '../ai-stats.routes';
// 🌟 新增：统一租户中心AI服务路由
import unifiedAIRoutes from '../unified-ai.routes';

// AI 子目录的路由 (若有新的模块路由)
// import newAiRoutes from './ai/index';
// import aiVideoRoutes from './ai/video.routes';
// import aiSmartExpertRoutes from './ai/smart-expert.routes';

/**
 * AI 模块路由配置
 */
const aiModuleRoutes = (router: Router) => {
  // 🔹 分析相关 - 🚀 AI分析服务已迁移到统一租户中心
  // router.use('/ai-analysis', aiAnalysisRoutes);

  // 🔹 助手和优化 - 🚀 AI助手优化服务已迁移到统一租户中心
  // router.use('/ai-assistant-optimized', aiAssistantOptimizedRoutes);

  // 🔹 计费和使用
  router.use('/ai-billing', aiBillingRoutes);
  router.use('/ai-stats', aiStatsRoutes);

  // 🔹 核心功能
  // 🚀 AI Bridge已迁移到统一租户中心，不再注册此路由
  // router.use('/ai-bridge', aiBridgeRoutes);
  router.use('/ai-cache', aiCacheRoutes);
  router.use('/ai-conversation', aiConversationRoutes);
  router.use('/ai-query', aiQueryRoutes);

  // 🔹 课程和知识库
  router.use('/ai-curriculum', aiCurriculumRoutes);
  router.use('/ai-knowledge', aiKnowledgeRoutes);

  router.use('/ai-performance', aiPerformanceRoutes);
  router.use('/ai-scoring', aiScoringRoutes);
  router.use('/ai-shortcuts', aiShortcutsRoutes);
  router.use('/ai-smart-assign', aiSmartAssignRoutes);

  // 🌟 统一租户中心AI服务
  router.use('/unified-ai', unifiedAIRoutes);

  // 🔹 子目录路由 (如有新增)
  // router.use('/ai', verifyToken, checkPermission('/ai'), newAiRoutes);

  console.log('✅ AI 模块路由已注册 (16+ 个路由，包含统一租户中心服务)');
};

export default aiModuleRoutes;
