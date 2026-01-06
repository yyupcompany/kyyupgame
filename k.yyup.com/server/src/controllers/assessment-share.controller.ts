import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import assessmentShareService from '../services/assessment/assessment-share.service';

/**
 * 记录分享
 */
export const recordShare = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { recordId, shareChannel, sharePlatform } = req.body;

    if (!recordId || !shareChannel) {
      throw ApiError.badRequest('缺少必填字段');
    }

    await assessmentShareService.recordShare({
      recordId: parseInt(recordId),
      userId,
      shareChannel,
      sharePlatform
    });

    ApiResponse.success(res, null, '分享记录成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 记录扫描
 */
export const recordScan = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { recordId, scannerPhone, source, referrerUserId } = req.body;

    if (!recordId || !source) {
      throw ApiError.badRequest('缺少必填字段');
    }

    await assessmentShareService.recordScan({
      recordId: parseInt(recordId),
      scannerId: userId,
      scannerPhone,
      source,
      referrerUserId: referrerUserId ? parseInt(referrerUserId) : undefined
    });

    ApiResponse.success(res, null, '扫描记录成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 获取分享统计
 */
export const getShareStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { recordId } = req.params;

    const stats = await assessmentShareService.getShareStats(
      parseInt(recordId),
      userId
    );

    ApiResponse.success(res, stats, '获取统计成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 获取用户分享奖励
 */
export const getUserShareRewards = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('用户未登录');
    }

    const rewards = await assessmentShareService.getUserShareRewards(userId);

    ApiResponse.success(res, rewards, '获取奖励成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

