import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import growthTrackingService from '../services/assessment/growth-tracking.service';

/**
 * 获取成长轨迹
 */
export const getGrowthTrajectory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { childName, studentId, phone, limit } = req.query;

    // 获取家长ID（如果是家长用户）
    let parentId: number | undefined;
    if (userId) {
      const Parent = require('../../models/parent.model').Parent;
      const parent = await Parent.findOne({
        where: { userId }
      });
      if (parent) {
        parentId = parent.id;
      }
    }

    const trajectory = await growthTrackingService.getGrowthTrajectory({
      childName: childName as string,
      parentId,
      studentId: studentId ? parseInt(studentId as string) : undefined,
      phone: phone as string,
      limit: limit ? parseInt(limit as string) : 12
    });

    ApiResponse.success(res, trajectory, '获取成长轨迹成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

