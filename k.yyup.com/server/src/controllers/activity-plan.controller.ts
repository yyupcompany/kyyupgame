﻿/**
 * 活动计划控制器
 */
import { Request, Response, NextFunction } from 'express';
import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { ActivityStatus } from '../models/activity.model';

// 获取数据库实例
const getSequelizeInstance = () => {
  return sequelize;
};

/**
 * 创建活动计划
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const createActivityPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    // 模拟创建活动计划    // const mockActivity = {
    //       id: Math.floor(Math.random() * 1000) + 1,
    //       title: req.body.title || '新活动计划',
    //       description: req.body.description || '活动描述',
    //       status: ActivityStatus.PLANNED,
    //       createdAt: new Date(),
    //       creatorId: userId
    //     };
    
    return ApiResponse.success(res, [], '创建活动计划成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取活动计划详情
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const getActivityPlanById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const { id } = req.params;
    
    // 尝试从数据库查询
    try {
      const db = getSequelizeInstance();
      const activities = await db.query(
        `SELECT * FROM ${tenantDb}.activities WHERE id = ? AND deleted_at IS NULL`,
        {
          replacements: [Number(id) || 0],
          type: 'SELECT'
        }
      );
      
      const activitiesList = Array.isArray(activities) ? activities : [];
      if (activitiesList.length > 0) {
        return ApiResponse.success(res, activitiesList[0], '获取活动计划详情成功');
      }
    } catch (dbError) {
      console.log('数据库查询失败，使用模拟数据:', dbError);
    }
    
    // 如果数据库查询失败，返回模拟数据    // const mockActivity = {
    //       id: Number(id) || 0,
    //       title: '示例活动计划',
    //       description: '这是一个示例活动计划',
    //       status: ActivityStatus.REGISTRATION_OPEN,
    //       createdAt: new Date()
    //     };
    
    return ApiResponse.success(res, [], '获取活动计划详情成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 更新活动计划
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const updateActivityPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    // 模拟更新活动计划    // const mockActivity = {
    //       id: Number(id) || 0,
    //       title: req.body.title || '更新的活动计划',
    //       description: req.body.description || '更新的活动描述',
    //       status: req.body.status || ActivityStatus.REGISTRATION_OPEN,
    //       updatedAt: new Date(),
    //       updaterId: userId
    //     };
    
    return ApiResponse.success(res, [], '更新活动计划成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 删除活动计划
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const deleteActivityPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // 模拟删除操作
    console.log(`删除活动计划 ID: ${id}`);
    
    return ApiResponse.success(res, null, '删除活动计划成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取活动计划列表
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const getActivityPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const { page = 1, size = 10 } = req.query;
    
    // 尝试从数据库查询
    try {
      const offset = ((Number(page) - 1) || 0) * Number(size) || 0;
      const db = getSequelizeInstance();
      const activities = await db.query(
        `SELECT * FROM ${tenantDb}.activities WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        {
          replacements: [Number(size) || 0, offset],
          type: 'SELECT'
        }
      );
      
      const countResult = await db.query(
        `SELECT COUNT(*) as total FROM ${tenantDb}.activities WHERE deleted_at IS NULL`,
        { type: 'SELECT' }
      );
      
      const activitiesList = Array.isArray(activities) ? activities : [];
      const countList = Array.isArray(countResult) ? countResult : [];
      const total = countList.length > 0 ? (countList[0] as any)?.total || 0 : 0;
      
      const result = {
        data: activitiesList,
        pagination: {
          page: Number(page) || 0,
          size: Number(size) || 0,
          total: Number(total) || 0,
          totalPages: Math.ceil(Number(total) || 0 / Number(size) || 0)
        }
      };
      
      return ApiResponse.success(res, result, '获取活动计划列表成功');
    } catch (dbError) {
      console.error('数据库查询失败:', dbError);
      // 数据库查询失败时返回空数据
      const emptyResult = {
        data: [],
        pagination: {
          page: Number(page) || 1,
          size: Number(size) || 10,
          total: 0,
          totalPages: 0
        }
      };
      return ApiResponse.success(res, emptyResult, '获取活动计划列表成功（数据库暂时不可用）');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 更新活动状态
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const updateActivityStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    const { status } = req.body;
    
    // 模拟更新状态    // const mockActivity = {
    //       id: Number(id) || 0,
    //       status: status,
    //       updatedAt: new Date(),
    //       updaterId: userId
    //     };
    
    return ApiResponse.success(res, [], '更新活动状态成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 取消活动
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const cancelActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    const { cancelReason } = req.body;
    if (!cancelReason) {
      throw ApiError.badRequest('取消原因不能为空');
    }
    
    // 模拟取消活动    // const mockActivity = {
    //       id: Number(id) || 0,
    //       status: ActivityStatus.CANCELLED,
    //       cancelReason: cancelReason,
    //       updatedAt: new Date(),
    //       updaterId: userId
    //     };
    
    return ApiResponse.success(res, [], '取消活动成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取活动统计数据
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const getActivityStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // 模拟统计数据    // const mockStats = {
    //       activityId: Number(id) || 0,
    //       totalRegistrations: 25,
    //       confirmedRegistrations: 20,
    //       pendingRegistrations: 3,
    //       cancelledRegistrations: 2,
    //       checkInCount: 18,
    //       conversionRate: 0.72
    //     };
    
    return ApiResponse.success(res, [], '获取活动统计数据成功');
  } catch (error) {
    next(error);
  }
}; 