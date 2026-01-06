import { Request, Response } from 'express';
import { OrganizationStatusService } from '../services/organization-status.service';
import { Kindergarten } from '../models/kindergarten.model';

/**
 * 机构现状控制器
 */
export class OrganizationStatusController {
  /**
   * 获取机构现状数据
   * GET /api/organization-status/:kindergartenId
   */
  static async getStatus(req: Request, res: Response) {
    try {
      const kindergartenId = parseInt(req.params.kindergartenId);
      
      if (isNaN(kindergartenId)) {
        return res.status(400).json({
          code: 400,
          message: '无效的幼儿园ID'
        });
      }

      // 验证幼儿园是否存在
      const kindergarten = await Kindergarten.findByPk(kindergartenId);
      if (!kindergarten) {
        return res.status(404).json({
          code: 404,
          message: '幼儿园不存在'
        });
      }

      // 获取现状数据
      const status = await OrganizationStatusService.getOrCreateStatus(kindergartenId);

      res.json({
        code: 200,
        message: 'success',
        data: status
      });
    } catch (error) {
      console.error('获取机构现状失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取机构现状失败',
        error: (error as Error).message
      });
    }
  }

  /**
   * 刷新机构现状数据
   * POST /api/organization-status/:kindergartenId/refresh
   */
  static async refreshStatus(req: Request, res: Response) {
    try {
      const kindergartenId = parseInt(req.params.kindergartenId);
      
      if (isNaN(kindergartenId)) {
        return res.status(400).json({
          code: 400,
          message: '无效的幼儿园ID'
        });
      }

      // 验证幼儿园是否存在
      const kindergarten = await Kindergarten.findByPk(kindergartenId);
      if (!kindergarten) {
        return res.status(404).json({
          code: 404,
          message: '幼儿园不存在'
        });
      }

      // 刷新现状数据
      const status = await OrganizationStatusService.refreshStatus(kindergartenId);

      res.json({
        code: 200,
        message: '数据刷新成功',
        data: status
      });
    } catch (error) {
      console.error('刷新机构现状失败:', error);
      res.status(500).json({
        code: 500,
        message: '刷新机构现状失败',
        error: (error as Error).message
      });
    }
  }

  /**
   * 获取机构现状的AI格式化文本
   * GET /api/organization-status/:kindergartenId/ai-format
   */
  static async getAIFormattedStatus(req: Request, res: Response) {
    try {
      const kindergartenId = parseInt(req.params.kindergartenId);
      
      if (isNaN(kindergartenId)) {
        return res.status(400).json({
          code: 400,
          message: '无效的幼儿园ID'
        });
      }

      // 获取现状数据
      const status = await OrganizationStatusService.getOrCreateStatus(kindergartenId);
      
      // 格式化为AI文本
      const formattedText = OrganizationStatusService.formatStatusForAI(status);

      res.json({
        code: 200,
        message: 'success',
        data: {
          text: formattedText,
          rawData: status
        }
      });
    } catch (error) {
      console.error('获取AI格式化文本失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取AI格式化文本失败',
        error: (error as Error).message
      });
    }
  }

  /**
   * 获取默认幼儿园的机构现状
   * GET /api/organization-status/default
   */
  static async getDefaultStatus(req: Request, res: Response) {
    try {
      // 获取第一个幼儿园作为默认幼儿园
      const kindergarten = await Kindergarten.findOne();
      
      if (!kindergarten) {
        return res.status(404).json({
          code: 404,
          message: '系统中没有幼儿园数据'
        });
      }

      // 获取现状数据
      const status = await OrganizationStatusService.getOrCreateStatus(kindergarten.id);

      res.json({
        code: 200,
        message: 'success',
        data: {
          kindergarten: {
            id: kindergarten.id,
            name: kindergarten.name
          },
          status
        }
      });
    } catch (error) {
      console.error('获取默认机构现状失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取默认机构现状失败',
        error: (error as Error).message
      });
    }
  }
}

