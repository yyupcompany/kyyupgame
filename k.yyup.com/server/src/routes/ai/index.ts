/**
 * AI 模块路由聚合文件
 * 🤖 AI助手服务路由
 */

import { Router } from 'express';
import unifiedIntelligenceRoutes from './unified-intelligence.routes';
import unifiedStreamRoutes from './unified-stream.routes';
import conversationRoutes from './conversation.routes';
import aiStatsRoutes from '../ai-stats.routes';
import analyticsRoutes from './analytics.routes';
import quotaRoutes from './quota.routes';
import tokenMonitorRoutes from './token-monitor.routes';

/**
 * AI 模块路由配置
 */
const aiModuleRoutes = (router: Router) => {
  console.log('[AI模块] 🤖 正在注册AI路由...');

  // 注册会话管理路由（CRUD操作）
  router.use('/ai/conversations', conversationRoutes);
  console.log('[AI模块] ✅ 已注册: /api/ai/conversations - 会话CRUD管理');

  // 注册统一智能AI路由（包含流式处理）
  router.use('/ai/unified', unifiedIntelligenceRoutes);
  console.log('[AI模块] ✅ 已注册: /api/ai/unified/*');

  // 注册统一流式AI路由（重要：包含stream-chat接口）
  router.use('/ai/unified', unifiedStreamRoutes);
  console.log('[AI模块] ✅ 已注册: /api/ai/unified/stream-chat - SSE流式AI对话');

  // 注册AI统计路由
  router.use('/ai-stats', aiStatsRoutes);
  console.log('[AI模块] ✅ 已注册: /api/ai-stats/*');

  // 注册AI分析统计路由
  router.use('/ai/analytics', analyticsRoutes);
  console.log('[AI模块] ✅ 已注册: /api/ai/analytics/* - AI分析统计');

  // 注册AI配额管理路由
  router.use('/ai/quota', quotaRoutes);
  console.log('[AI模块] ✅ 已注册: /api/ai/quota/* - AI配额管理');

  // 注册Token监控路由
  router.use('/ai/token-monitor', tokenMonitorRoutes);
  console.log('[AI模块] ✅ 已注册: /api/ai/token-monitor/* - Token监控统计');
};

export default aiModuleRoutes;