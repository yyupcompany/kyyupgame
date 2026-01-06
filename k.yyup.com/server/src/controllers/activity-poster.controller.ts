import { Request, Response } from 'express';
import { Activity } from '../models/activity.model';
import { ActivityPoster } from '../models/activity-poster.model';
import { ActivityShare } from '../models/activity-share.model';
import { PosterGeneration } from '../models/poster-generation.model';
import { successResponse, errorResponse } from '../utils/response-handler';

/**
 * 活动海报管理控制器
 * 完善活动→海报→营销功能的业务链路
 */
export class ActivityPosterController {
  
  /**
   * 为活动生成海报
   */
  static async generatePoster(req: Request, res: Response) {
    try {
      const { activityId } = req.params;
      const {
        posterType = 'main',
        marketingConfig,
        templateId,
        customContent
      } = req.body;

      // 1. 获取活动信息
      const activity = await Activity.findByPk(activityId);
      if (!activity) {
        return errorResponse(res, '活动不存在', 404);
      }

      // 2. 生成海报数据
      const posterData = {
        templateId,
        content: {
          title: activity.title,
          description: activity.description,
          startTime: activity.startTime,
          endTime: activity.endTime,
          location: activity.location,
          capacity: activity.capacity,
          registeredCount: activity.registeredCount,
          ...customContent
        },
        marketingTools: marketingConfig || {},
        activityId: parseInt(activityId)
      };

      // 3. 调用海报生成服务（这里需要集成实际的海报生成逻辑）
      // const posterGeneration = await PosterGenerationService.generate(posterData);

      // 4. 创建活动海报关联
      const activityPoster = await ActivityPoster.create({
        activityId: parseInt(activityId),
        posterId: 1, // posterGeneration.id, // 临时使用1
        posterType,
        isActive: true
      });

      // 5. 更新活动的海报信息
      if (posterType === 'main') {
        await activity.update({
          posterId: 1, // posterGeneration.id,
          posterUrl: '/api/posters/1/image', // posterGeneration.imageUrl,
          marketingConfig
        });
      }

      return successResponse(res, {
        activityPoster,
        posterUrl: '/api/posters/1/image',
        message: '海报生成成功'
      });

    } catch (error) {
      console.error('生成活动海报失败:', error);
      return errorResponse(res, '生成海报失败');
    }
  }

  /**
   * 获取活动的所有海报
   */
  static async getActivityPosters(req: Request, res: Response) {
    try {
      const { activityId } = req.params;

      const posters = await ActivityPoster.findAll({
        where: { activityId },
        include: [
          {
            model: PosterGeneration,
            as: 'poster'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return successResponse(res, posters);

    } catch (error) {
      console.error('获取活动海报失败:', error);
      return errorResponse(res, '获取海报失败');
    }
  }

  /**
   * 预览活动海报
   */
  static async previewPoster(req: Request, res: Response) {
    try {
      const { activityId } = req.params;
      const { posterType = 'main' } = req.query;

      const activity = await Activity.findByPk(activityId);
      if (!activity) {
        return errorResponse(res, '活动不存在', 404);
      }

      // 生成预览数据
      const previewData = {
        activity: {
          title: activity.title,
          description: activity.description,
          startTime: activity.startTime,
          endTime: activity.endTime,
          location: activity.location,
          capacity: activity.capacity,
          registeredCount: activity.registeredCount
        },
        marketingConfig: activity.marketingConfig,
        posterType,
        previewUrl: `/api/activities/${activityId}/poster/preview?type=${posterType}`
      };

      return successResponse(res, previewData);

    } catch (error) {
      console.error('预览活动海报失败:', error);
      return errorResponse(res, '预览失败');
    }
  }

  /**
   * 发布活动和海报
   */
  static async publishActivity(req: Request, res: Response) {
    try {
      const { activityId } = req.params;
      const { publishChannels = ['wechat'] } = req.body;

      const activity = await Activity.findByPk(activityId);
      if (!activity) {
        return errorResponse(res, '活动不存在', 404);
      }

      // 更新活动发布状态
      await activity.update({
        publishStatus: 1 // 已发布
      });

      // 记录发布信息
      const publishResult = {
        activityId,
        publishChannels,
        publishTime: new Date(),
        shareUrl: `/activities/${activityId}`,
        qrCodeUrl: `/api/activities/${activityId}/qrcode`
      };

      return successResponse(res, {
        ...publishResult,
        message: '活动发布成功'
      });

    } catch (error) {
      console.error('发布活动失败:', error);
      return errorResponse(res, '发布失败');
    }
  }

  /**
   * 一键转发分享
   */
  static async shareActivity(req: Request, res: Response) {
    try {
      const { activityId } = req.params;
      const { 
        shareChannel, 
        posterId,
        customMessage 
      } = req.body;
      const sharerId = req.user?.id;
      const shareIp = req.ip;

      const activity = await Activity.findByPk(activityId);
      if (!activity) {
        return errorResponse(res, '活动不存在', 404);
      }

      // 生成分享链接
      const shareUrl = `${process.env.FRONTEND_URL}/activities/${activityId}?from=share&sharer=${sharerId}`;

      // 记录分享
      const activityShare = await ActivityShare.create({
        activityId: parseInt(activityId),
        posterId,
        shareChannel,
        shareUrl,
        sharerId,
        shareIp
      });

      // 更新活动分享计数
      await activity.increment('shareCount');

      // 根据分享渠道生成不同的分享内容
      const shareContent = {
        title: activity.title,
        description: activity.description || '精彩活动，不容错过！',
        imageUrl: activity.posterUrl,
        url: shareUrl,
        customMessage
      };

      return successResponse(res, {
        shareContent,
        shareUrl,
        shareId: activityShare.id,
        message: '分享链接生成成功'
      });

    } catch (error) {
      console.error('分享活动失败:', error);
      return errorResponse(res, '分享失败');
    }
  }

  /**
   * 获取活动分享统计
   */
  static async getShareStats(req: Request, res: Response) {
    try {
      const { activityId } = req.params;

      const [activity, shareStats] = await Promise.all([
        Activity.findByPk(activityId, {
          attributes: ['id', 'title', 'shareCount', 'viewCount']
        }),
        ActivityShare.findAll({
          where: { activityId },
          attributes: [
            'shareChannel',
            [ActivityShare.sequelize!.fn('COUNT', ActivityShare.sequelize!.col('id')), 'count']
          ],
          group: ['shareChannel'],
          raw: true
        })
      ]);

      if (!activity) {
        return errorResponse(res, '活动不存在', 404);
      }

      return successResponse(res, {
        activity,
        shareStats,
        totalShares: activity.shareCount,
        totalViews: activity.viewCount
      });

    } catch (error) {
      console.error('获取分享统计失败:', error);
      return errorResponse(res, '获取统计失败');
    }
  }
}
