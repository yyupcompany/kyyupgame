/**
 * AI 模块路由聚合文件 - 极简版
 * 🚀 所有AI服务已迁移到统一租户中心，仅保留统一租户中心桥接
 */

import { Router } from 'express';
import { verifyToken, checkPermission } from '../../middlewares/auth.middleware';

// 🌟 统一租户中心AI服务路由 - 所有AI功能的主要入口
import unifiedAIRoutes from '../unified-ai.routes';

/**
 * AI 模块路由配置 - 极简版
 */
const aiModuleRoutes = (router: Router) => {
  // 🌟 统一租户中心AI服务 - 唯一AI功能入口
  router.use('/unified-ai', unifiedAIRoutes);

  console.log('✅ AI 模块路由已注册 (极简版 - 所有功能迁移至统一租户中心)');
};

export default aiModuleRoutes;