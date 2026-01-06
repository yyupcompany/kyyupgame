import { Request, Response } from 'express';
import { quotaService } from '../../services/ai/quota.service';
import { BaseController } from '../base.controller';

export class QuotaController extends BaseController {
  private quotaService = quotaService;

  constructor() {
    super();
  }

  /**
   * 获取用户配额
   */
  getUserQuota = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未登录'
        });
      }

      const quota = await this.quotaService.getUserQuota(userId);
      
      res.json({
        success: true,
        data: quota
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * 获取使用历史
   */
  getUsageHistory = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未登录'
        });
      }

      const { startDate, endDate, modelId } = req.query;
      
      const history = await this.quotaService.getQuotaHistory(userId);
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };
}