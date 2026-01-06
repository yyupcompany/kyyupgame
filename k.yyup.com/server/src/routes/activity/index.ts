/**
 * 活动管理模块路由聚合文件
 * 统一管理所有活动、评估相关的路由功能
 */

import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';

// ✅ 导入所有活动相关路由
import activitiesRoutes from '../activities.routes';
import activityPlanRoutes from '../activity-plan.routes';
import activityTemplateRoutes from '../activity-template.routes';
import activityRegistrationRoutes from '../activity-registration.routes';
import activityCheckinRoutes from '../activity-checkin.routes';
import activityEvaluationRoutes from '../activity-evaluation.routes';
import activityPosterRoutes from '../activity-poster.routes';
import progressRoutes from '../progress.routes';
import activityCenterRoutes from '../centers/activity-center.routes';

/**
 * 活动管理模块路由配置
 */
const activityModuleRoutes = (router: Router) => {
  // 🔹 基础活动
  router.use('/activities', activitiesRoutes);

  // 🔹 活动计划和模板
  router.use('/activity-plans', activityPlanRoutes);
  router.use('/activity-plan', activityPlanRoutes); // 别名
  router.use('/activity-templates', activityTemplateRoutes);
  router.use('/activity-template', activityTemplateRoutes); // 别名

  // 🔹 活动登记和签到
  router.use('/activity-registrations', activityRegistrationRoutes);
  router.use('/activity-registration', activityRegistrationRoutes); // 别名
  router.use('/activity-checkins', activityCheckinRoutes);
  router.use('/activity-checkin', activityCheckinRoutes); // 别名

  // 🔹 活动评估
  router.use('/activity-evaluations', activityEvaluationRoutes);
  router.use('/activity-evaluation', activityEvaluationRoutes); // 别名

  // 🔹 活动海报和进度
  router.use('/activity-posters', activityPosterRoutes);
  router.use('/activity-poster', activityPosterRoutes); // 别名
  router.use('/progress', progressRoutes);

  // 🔹 活动中心
  router.use('/centers/activity', activityCenterRoutes);

  console.log('✅ 活动管理模块路由已注册 (11 个主路由)');
};

export default activityModuleRoutes;

