/**
 * AI 模块路由聚合文件 - 简化版
 * 🚀 大部分AI服务已迁移到统一租户中心，仅保留基础功能
 */

import { Router } from 'express';
import { verifyToken, checkPermission } from '../../middlewares/auth.middleware';

// ✅ 保留基础AI路由
import aiBillingRoutes from '../ai-billing.routes';
import aiCacheRoutes from '../ai-cache.routes';
import aiConversationRoutes from '../ai-conversation.routes';
import aiQueryRoutes from '../ai-query.routes';
import aiScoringRoutes from '../ai-scoring.routes';
import aiStatsRoutes from '../ai-stats.routes';
// 🌟 统一租户中心AI服务路由
import unifiedAIRoutes from '../unified-ai.routes';

/**
 * AI 模块路由配置 - 简化版
 */
const aiModuleRoutes = (router: Router) => {
  // 🔹 计费和使用统计
  router.use('/ai-billing', aiBillingRoutes);
  router.use('/ai-stats', aiStatsRoutes);

  // 🔹 核心功能 - 基础对话和查询
  router.use('/ai-cache', aiCacheRoutes);
  router.use('/ai-conversation', aiConversationRoutes);
  router.use('/ai-query', aiQueryRoutes);
  router.use('/ai-scoring', aiScoringRoutes);

  // 🌟 统一租户中心AI服务 - 主要AI功能入口
  router.use('/unified-ai', unifiedAIRoutes);

  console.log('✅ AI 模块路由已注册 (简化版 - 主要功能迁移至统一租户中心)');
};

export default aiModuleRoutes;