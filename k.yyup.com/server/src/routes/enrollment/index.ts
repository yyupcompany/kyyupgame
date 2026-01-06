/**
 * 招生管理模块路由聚合文件
 * 统一管理所有招生、申请、录取相关的路由功能
 */

import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';

// ✅ 导入所有招生相关路由
import enrollmentRoutes from '../enrollment.routes';
import enrollmentPlanRoutes from '../enrollment-plan.routes';
import enrollmentApplicationRoutes from '../enrollment-application.routes';
import enrollmentInterviewRoutes from '../enrollment-interview.routes';
import enrollmentConsultationRoutes from '../enrollment-consultation.routes';
import enrollmentQuotaRoutes from '../enrollment-quota.routes';
import enrollmentAIRoutes from '../enrollment-ai.routes';
import enrollmentStatisticsRoutes from '../enrollment-statistics.routes';
import enrollmentTasksRoutes from '../enrollment-tasks.routes';
import enrollmentCenterRoutes from '../enrollment-center.routes';
import enrollmentFinanceRoutes from '../enrollment-finance.routes';
import admissionResultRoutes from '../admission-result.routes';
import admissionNotificationRoutes from '../admission-notification.routes';

/**
 * 招生管理模块路由配置
 */
const enrollmentModuleRoutes = (router: Router) => {
  // 🔹 基础招生
  router.use('/enrollment', enrollmentRoutes);

  // 🔹 招生计划
  router.use('/enrollment-plans', enrollmentPlanRoutes);
  router.use('/enrollment-plan', enrollmentPlanRoutes); // 别名

  // 🔹 申请和面试
  router.use('/enrollment-applications', enrollmentApplicationRoutes);
  router.use('/enrollment-application', enrollmentApplicationRoutes); // 别名
  router.use('/enrollment-interviews', enrollmentInterviewRoutes);
  router.use('/enrollment-interview', enrollmentInterviewRoutes); // 别名

  // 🔹 咨询和名额
  router.use('/enrollment-consultations', enrollmentConsultationRoutes);
  router.use('/enrollment-consultation', enrollmentConsultationRoutes); // 别名
  router.use('/consultations', enrollmentConsultationRoutes); // 前端兼容别名
  router.use('/enrollment-quotas', enrollmentQuotaRoutes);
  router.use('/enrollment-quota', enrollmentQuotaRoutes); // 别名

  // 🔹 AI 和统计
  router.use('/enrollment-ai', enrollmentAIRoutes);
  router.use('/enrollment-statistics', enrollmentStatisticsRoutes);
  router.use('/enrollment/statistics', enrollmentStatisticsRoutes); // 别名

  // 🔹 任务和中心
  router.use('/enrollment-tasks', enrollmentTasksRoutes);
  router.use('/enrollment-center', enrollmentCenterRoutes);
  router.use('/enrollment-finance', enrollmentFinanceRoutes);

  // 🔹 录取管理
  router.use('/admission-results', admissionResultRoutes);
  router.use('/admission-result', admissionResultRoutes); // 别名
  router.use('/admission-notifications', admissionNotificationRoutes);
  router.use('/admission-notification', admissionNotificationRoutes); // 别名

  console.log('✅ 招生管理模块路由已注册 (13 个主路由)');
};

export default enrollmentModuleRoutes;

