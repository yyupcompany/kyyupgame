/**
 * 中心聚合API路由索引
 * 统一管理所有中心的聚合API路由
 */

import { Router } from 'express';
import activityCenterRoutes from './activity-center.routes';
import customerPoolCenterRoutes from './customer-pool-center.routes';

const router = Router();

// 活动中心聚合API
router.use('/activity', activityCenterRoutes);

// 客户池中心聚合API
router.use('/customer-pool', customerPoolCenterRoutes);

export default router;