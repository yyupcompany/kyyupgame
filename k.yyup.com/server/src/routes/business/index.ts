/**
 * 业务模块路由聚合文件
 * 统一管理所有业务、财务、客户相关的路由功能
 */

import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';

// ✅ 导入所有业务相关路由
import businessCenterRoutes from '../business-center.routes';
import financeRoutes from '../finance.routes';
import enrollmentFinanceRoutes from '../enrollment-finance.routes';
import customerPoolRoutes from '../customer-pool.routes';
import customerFollowEnhancedRoutes from '../customer-follow-enhanced.routes';
import customerApplicationsRoutes from '../customer-applications.routes';
import customersRoutes from '../customers.routes';
import referralRoutes from '../referral.routes';
import referralCodesRoutes from '../referral-codes.routes';
import referralRelationshipsRoutes from '../referral-relationships.routes';
import referralRewardsRoutes from '../referral-rewards.routes';
import referralStatisticsRoutes from '../referral-statistics.routes';
import couponsRoutes from '../coupons.routes';
import paymentRoutes from '../payment/payment.routes';

/**
 * 业务模块路由配置
 */
const businessModuleRoutes = (router: Router) => {
  // 🔹 业务中心
  router.use('/business-center', businessCenterRoutes);
  router.use('/business', businessCenterRoutes); // 兼容前端别名

  // 🔹 财务管理
  router.use('/finance', financeRoutes);
  router.use('/enrollment-finance', enrollmentFinanceRoutes);

  // 🔹 客户池管理
  router.use('/customer-pool', customerPoolRoutes);
  router.use('/principal/customer-pool', customerPoolRoutes); // 别名

  // 🔹 客户跟进
  router.use('/customer-follow-enhanced', customerFollowEnhancedRoutes);

  // 🔹 客户相关
  router.use('/customer-applications', customerApplicationsRoutes);
  router.use('/customers', customersRoutes);

  // 🔹 推荐管理
  router.use('/referral', referralRoutes);
  router.use('/referral-codes', referralCodesRoutes);
  router.use('/referral-relationships', referralRelationshipsRoutes);
  router.use('/referral-rewards', referralRewardsRoutes);
  router.use('/referral-statistics', referralStatisticsRoutes);

  // 🔹 优惠券
  router.use('/coupons', couponsRoutes);

  // 🔹 支付管理
  router.use('/payment', paymentRoutes);

  console.log('✅ 业务模块路由已注册 (14+ 个路由)');
};

export default businessModuleRoutes;

