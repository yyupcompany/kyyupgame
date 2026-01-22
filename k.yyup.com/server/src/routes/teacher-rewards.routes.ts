import { Router } from 'express';
import TeacherRewardController from '../controllers/teacher-reward.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// 应用认证中间件
router.use(verifyToken);

/**
 * @fileoverview 教师奖励路由
 * @route   GET /api/teacher/rewards
 * @desc    获取教师奖励列表和统计信息
 * @access  Private (teacher, admin)
 */
router.get(
  '/',
  requireRole(['teacher', 'admin']),
  TeacherRewardController.getRewardsList
);

/**
 * @route   GET /api/teacher/rewards/stats
 * @desc    获取奖励统计信息
 * @access  Private (teacher, admin)
 */
router.get(
  '/stats',
  requireRole(['teacher', 'admin']),
  TeacherRewardController.getRewardStats
);

/**
 * @route   GET /api/teacher/rewards/:id
 * @desc    获取单个奖励详情
 * @access  Private (teacher, admin)
 */
router.get(
  '/:id',
  requireRole(['teacher', 'admin']),
  TeacherRewardController.getRewardDetail
);

/**
 * @route   POST /api/teacher/rewards/:id/use
 * @desc    使用代金券
 * @access  Private (teacher, admin)
 */
router.post(
  '/:id/use',
  requireRole(['teacher', 'admin']),
  TeacherRewardController.useVoucher
);

/**
 * @route   GET /api/teacher/rewards/:rewardId/referral-leads
 * @desc    获取转介绍分享带来的线索信息
 * @access  Private (teacher, admin)
 */
router.get(
  '/:rewardId/referral-leads',
  requireRole(['teacher', 'admin']),
  TeacherRewardController.getReferralLeads
);

/**
 * @route   GET /api/teacher/rewards/referral-stats
 * @desc    获取教师转介绍统计数据
 * @access  Private (teacher, admin)
 */
router.get(
  '/referral-stats',
  requireRole(['teacher', 'admin']),
  TeacherRewardController.getReferralStats
);

export default router;
