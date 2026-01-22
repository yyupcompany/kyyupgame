import { Request, Response } from 'express';
import TeacherRewardService from '../services/teacher-reward.service';

/**
 * 教师奖励控制器
 */
export class TeacherRewardController {

  /**
   * 获取教师奖励列表和统计信息
   * GET /api/teacher/rewards
   */
  static async getRewardsList(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权'
        });
      }

      const { status, type, page, pageSize, sortBy, sortOrder } = req.query;

      const result = await TeacherRewardService.getRewardsList({
        teacherId: userId,
        status: status as string,
        type: type as string,
        page: page ? parseInt(page as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('[TeacherRewardController] 获取奖励列表失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取奖励列表失败'
      });
    }
  }

  /**
   * 获取奖励统计信息
   * GET /api/teacher/rewards/stats
   */
  static async getRewardStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权'
        });
      }

      const stats = await TeacherRewardService.getRewardStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('[TeacherRewardController] 获取奖励统计失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取奖励统计失败'
      });
    }
  }

  /**
   * 获取单个奖励详情
   * GET /api/teacher/rewards/:id
   */
  static async getRewardDetail(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权'
        });
      }

      const { id } = req.params;
      const reward = await TeacherRewardService.getRewardDetail(parseInt(id), userId);

      res.json({
        success: true,
        data: reward
      });
    } catch (error: any) {
      console.error('[TeacherRewardController] 获取奖励详情失败:', error);
      const status = error.message === '奖励不存在' ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message || '获取奖励详情失败'
      });
    }
  }

  /**
   * 使用代金券
   * POST /api/teacher/rewards/:id/use
   */
  static async useVoucher(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权'
        });
      }

      const { id } = req.params;
      const { useLocation, notes } = req.body;

      if (!useLocation) {
        return res.status(400).json({
          success: false,
          message: '请提供使用位置'
        });
      }

      const result = await TeacherRewardService.useVoucher(parseInt(id), userId, {
        useLocation,
        notes
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('[TeacherRewardController] 使用代金券失败:', error);
      const status = error.message === '奖励不存在' ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message || '使用代金券失败'
      });
    }
  }

  /**
   * 获取转介绍分享带来的线索信息
   * GET /api/teacher/rewards/:rewardId/referral-leads
   */
  static async getReferralLeads(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权'
        });
      }

      const { rewardId } = req.params;
      const leads = await TeacherRewardService.getReferralLeads(parseInt(rewardId), userId);

      res.json({
        success: true,
        data: leads
      });
    } catch (error: any) {
      console.error('[TeacherRewardController] 获取转介绍线索失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取转介绍线索失败'
      });
    }
  }

  /**
   * 获取教师转介绍统计数据
   * GET /api/teacher/rewards/referral-stats
   */
  static async getReferralStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权'
        });
      }

      const stats = await TeacherRewardService.getReferralStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('[TeacherRewardController] 获取转介绍统计失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取转介绍统计失败'
      });
    }
  }
}

export default TeacherRewardController;
