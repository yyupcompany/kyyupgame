import { Request, Response, NextFunction } from 'express';
import { MediaCenterService } from '../services/media-center.service';
import { MediaContentType } from '../models/media-content.model';

/**
 * 媒体中心控制器
 */
export class MediaCenterController {
  /**
   * 获取最近创作列表
   */
  static async getRecentCreations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : 10;

      const creations = await MediaCenterService.getRecentCreations(
        userId,
        limit
      );

      res.json({
        success: true,
        data: creations,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取创作历史
   */
  static async getCreationHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      const { type, platform, keyword, page, pageSize } = req.query;

      const result = await MediaCenterService.getCreationHistory({
        userId,
        type: type as MediaContentType,
        platform: platform as string,
        keyword: keyword as string,
        page: page ? parseInt(page as string) : 1,
        pageSize: pageSize ? parseInt(pageSize as string) : 20,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建媒体内容
   */
  static async createContent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: '未授权',
        });
        return;
      }

      const { title, type, platform, content, preview, keywords, style, settings } =
        req.body;

      if (!title || !type || !platform || !content) {
        res.status(400).json({
          success: false,
          message: '缺少必填字段',
        });
        return;
      }

      const result = await MediaCenterService.createContent({
        title,
        type,
        platform,
        content,
        preview,
        keywords,
        style,
        settings,
        userId,
      });

      res.json({
        success: true,
        data: result,
        message: '创建成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新媒体内容
   */
  static async updateContent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { title, content, platform, keywords, settings } = req.body;

      const result = await MediaCenterService.updateContent(parseInt(id), {
        title,
        content,
        platform,
        keywords,
        settings,
      });

      res.json({
        success: true,
        data: result,
        message: '更新成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除媒体内容
   */
  static async deleteContent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      await MediaCenterService.deleteContent(parseInt(id));

      res.json({
        success: true,
        message: '删除成功',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取统计数据
   */
  static async getStatistics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      const stats = await MediaCenterService.getStatistics(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取内容详情
   */
  static async getContentDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const content = await MediaCenterService.getContentDetail(parseInt(id));

      res.json({
        success: true,
        data: content,
      });
    } catch (error) {
      next(error);
    }
  }
}

