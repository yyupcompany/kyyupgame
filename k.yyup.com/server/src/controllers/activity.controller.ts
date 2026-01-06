import { Request, Response, NextFunction } from 'express';
import { activityService } from '../services/activity/activity.service';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { ActivityStatus, ActivityType } from '../models/activity.model';

export class ActivityController {
  /**
   * 创建活动
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const kindergartenId = (req.user as any)?.kindergartenId;

      if (!userId) {
        throw ApiError.unauthorized('用户未登录');
      }

      if (!kindergartenId) {
        throw ApiError.badRequest('用户未关联幼儿园');
      }

      // 自动填充kindergartenId，后端控制数据安全
      console.log('📝 原始req.body:', JSON.stringify(req.body, null, 2));
      
      const activityData = {
        ...req.body,
        kindergartenId, // 从认证用户信息获取，不信任前端传递的值
      };

      console.log('📝 创建活动，自动填充kindergartenId:', kindergartenId);
      console.log('📝 完整activityData:', JSON.stringify(activityData, null, 2));

      const activity = await activityService.createActivity(activityData, userId);
      return ApiResponse.success(res, activity, '创建活动成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取活动列表
   */
  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      // 安全地解析查询参数
      const filters = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        keyword: req.query.keyword as string,
        kindergartenId: req.query.kindergartenId ? parseInt(req.query.kindergartenId as string) : undefined,
        planId: req.query.planId ? parseInt(req.query.planId as string) : undefined,
        activityType: req.query.activityType && req.query.activityType !== 'undefined' ? parseInt(req.query.activityType as string) as ActivityType : undefined,
        status: req.query.status && req.query.status !== 'undefined' ? parseInt(req.query.status as string) as ActivityStatus : undefined,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        sortBy: req.query.sortBy as string || 'created_at',
        sortOrder: (req.query.sortOrder as string)?.toUpperCase() === 'ASC' ? 'ASC' as const : 'DESC' as const
      };

      const result = await activityService.getActivities(filters);
      return ApiResponse.success(res, {
        items: result.rows,
        total: result.count,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(result.count / filters.pageSize)
      }, '获取活动列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取活动详情
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const activity = await activityService.getActivityById(parseInt(id, 10) || 0);
      return ApiResponse.success(res, activity, '获取活动详情成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新活动信息
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('用户未登录');
      }

      const activity = await activityService.updateActivity(parseInt(id, 10) || 0, req.body, userId);
      return ApiResponse.success(res, activity, '更新活动成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除活动
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await activityService.deleteActivity(parseInt(id, 10) || 0);
      return ApiResponse.success(res, null, '删除活动成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新活动状态
   */
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        throw ApiError.unauthorized('用户未登录');
      }

      if (status === undefined || !Object.values(ActivityStatus).includes(status)) {
        throw ApiError.badRequest('无效的活动状态');
      }

      const activity = await activityService.updateActivityStatus(parseInt(id, 10) || 0, status, userId);
      return ApiResponse.success(res, activity, '更新活动状态成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取活动统计信息
   */
  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const { kindergartenId } = req.query;
      const statistics = await activityService.getActivityStatistics(
        kindergartenId ? parseInt(kindergartenId as string, 10) || 0 : undefined
      );
      return ApiResponse.success(res, statistics, '获取活动统计成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 发布活动（将状态改为报名中）
   */
  async publish(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw ApiError.unauthorized('用户未登录');
      }

      // 获取当前活动状态
      const activity = await activityService.getActivityById(parseInt(id, 10) || 0);

      // 如果已经是"报名中"状态，直接返回成功
      if (activity.status === ActivityStatus.REGISTRATION_OPEN) {
        return ApiResponse.success(res, activity, '活动已发布');
      }

      // 否则更新状态为"报名中"
      const updatedActivity = await activityService.updateActivityStatus(
        parseInt(id, 10) || 0,
        ActivityStatus.REGISTRATION_OPEN,
        userId
      );
      return ApiResponse.success(res, updatedActivity, '发布活动成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 分享活动
   * 支持3级分享层级：
   * - 一级分享：直接分享活动
   * - 二级分享：通过一级分享者的链接分享
   * - 三级分享：通过二级分享者的链接分享
   */
  async share(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { shareChannel, shareContent, posterId, parentSharerId } = req.body;
      const userId = req.user?.id;
      const userRole = (req.user as any)?.role;
      const shareIp = req.ip || req.connection.remoteAddress;

      if (!userId) {
        throw ApiError.unauthorized('用户未登录');
      }

      if (!shareChannel) {
        throw ApiError.badRequest('分享渠道不能为空');
      }

      // 获取活动详情
      const activity = await activityService.getActivityById(parseInt(id, 10) || 0);

      // 计算分享层级
      let shareLevel = 1;
      let actualParentSharerId = parentSharerId;

      if (parentSharerId) {
        // 查询上级分享者的分享记录，获取其分享层级
        const parentShare = await activityService.getLatestShareByUser(
          activity.id,
          parentSharerId
        );

        if (parentShare) {
          shareLevel = Math.min(parentShare.shareLevel + 1, 3); // 最多3级

          // 如果上级已经是3级，则不记录上级关系（不再继续分享链）
          if (parentShare.shareLevel >= 3) {
            actualParentSharerId = undefined;
            shareLevel = 1; // 重新开始计算
          }
        }
      }

      // 生成分享链接
      const baseUrl = process.env.FRONTEND_URL || 'https://k.yyup.cc';
      const shareUrl = `${baseUrl}/activity/register/${activity.id}?sharerId=${userId}`;

      // 创建分享记录
      const shareData = {
        activityId: activity.id,
        posterId,
        shareChannel,
        shareUrl,
        sharerId: userId,
        parentSharerId: actualParentSharerId,
        shareLevel,
        shareIp,
        shareContent: shareContent || `快来参加"${activity.title}"活动吧！`
      };

      const shareRecord = await activityService.createActivityShare(shareData);

      // 如果是二维码分享，生成二维码
      let qrcodeUrl = null;
      if (shareChannel === 'qrcode') {
        qrcodeUrl = await activityService.generateShareQrcode(shareUrl);
      }

      return ApiResponse.success(res, {
        shareUrl,
        shareContent: shareData.shareContent,
        qrcodeUrl,
        shareId: shareRecord.id,
        shareLevel,
        parentSharerId: actualParentSharerId,
        shareCount: activity.shareCount + 1
      }, '分享成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 查询分享层级关系
   * 返回指定用户的分享树（包含下级1-3级分享者）
   */
  async getShareHierarchy(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // 活动ID
      const { userId } = req.query; // 查询的用户ID
      const currentUserId = req.user?.id;

      // 如果没有指定userId，则查询当前登录用户
      const targetUserId = userId ? parseInt(userId as string, 10) : currentUserId;

      if (!targetUserId) {
        throw ApiError.badRequest('用户ID不能为空');
      }

      const activityId = parseInt(id, 10);
      const hierarchy = await activityService.getShareHierarchy(activityId, targetUserId);

      return ApiResponse.success(res, hierarchy, '查询成功');
    } catch (error) {
      next(error);
    }
  }
}

export const activityController = new ActivityController();