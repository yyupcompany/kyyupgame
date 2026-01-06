/**
 * 营销模块路由聚合文件
 * 统一管理所有营销、推广相关的路由功能
 */

import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';

// ✅ 导入所有营销相关路由
import marketingRoutes from '../marketing.routes';
import marketingCenterRoutes from '../marketing-center.routes';
import marketingCampaignRoutes from '../marketing-campaign.routes';
import advertisementRoutes from '../advertisement.routes';
import channelTrackingRoutes from '../channel-tracking.routes';
import conversionTrackingRoutes from '../conversion-tracking.routes';
import smartPromotionRoutes from '../smart-promotion.routes';

/**
 * 营销模块路由配置
 */
const marketingModuleRoutes = (router: Router) => {
  // 🔹 基础营销
  router.use('/marketing', marketingRoutes);

  // 🔹 营销中心
  router.use('/marketing-center', marketingCenterRoutes);

  // 🔹 营销活动
  router.use('/marketing-campaigns', marketingCampaignRoutes);
  router.use('/marketing-campaign', marketingCampaignRoutes); // 别名

  // 🔹 广告管理
  router.use('/advertisements', advertisementRoutes);
  router.use('/advertisement', advertisementRoutes); // 别名

  // 🔹 渠道追踪
  router.use('/channel-trackings', channelTrackingRoutes);
  router.use('/channel-tracking', channelTrackingRoutes); // 别名

  // 🔹 转化追踪
  router.use('/conversion-trackings', conversionTrackingRoutes);
  router.use('/conversion-tracking', conversionTrackingRoutes); // 别名

  // 🔹 智能推广
  router.use('/smart-promotion', smartPromotionRoutes);

  console.log('✅ 营销模块路由已注册 (7 个主路由)');
};

export default marketingModuleRoutes;

