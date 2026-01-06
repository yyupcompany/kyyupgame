import { Request, Response } from 'express';
import { ActivityEvaluationService } from '../services/activity/activity-evaluation.service';
import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';

const activityEvaluationService = new ActivityEvaluationService();

/**
 * 创建活动评价
 * @param {Request} req - 请求对象
 * @param {Response} res - 响应对象
 * @returns {Promise<void>} HTTP响应
 */
export const createEvaluation = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未授权的访问');
    }
    
    const evaluationData = req.body;
    
    // 验证必填字段
    if (!evaluationData.activityId) {
      throw ApiError.badRequest('活动ID不能为空');
    }
    
    if (!evaluationData.evaluatorType) {
      throw ApiError.badRequest('评价者类型不能为空');
    }
    
    if (!evaluationData.evaluatorName) {
      throw ApiError.badRequest('评价者姓名不能为空');
    }
    
    if (evaluationData.overallRating === undefined || evaluationData.overallRating < 1 || evaluationData.overallRating > 5) {
      throw ApiError.badRequest('总体评分必须在1-5之间');
    }
    
    // 暂时返回模拟数据
    const evaluation = {
      id: Date.now(),
      ...evaluationData,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    ApiResponse.success(res, { evaluation }, '评价创建成功');
  } catch (error) {
    if (error instanceof ApiError) {
      ApiResponse.error(res, error.message, error.code, error.statusCode);
    } else if (error instanceof Error) {
      logger.error('创建活动评价失败', { error: error.message, stack: error.stack });
      ApiResponse.serverError(res, `创建评价失败: ${error.message}`);
    } else {
      logger.error('创建活动评价失败', { error });
      ApiResponse.serverError(res, '创建评价失败: 未知错误');
    }
  }
};

/**
 * 获取评价详情
 * @param {Request} req - 请求对象
 * @param {Response} res - 响应对象
 * @returns {Promise<void>} HTTP响应
 */
export const getEvaluationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id) || 0)) {
      throw ApiError.badRequest('无效的评价ID');
    }
    
    // 暂时返回模拟数据
    const evaluation = {
      id: Number(id) || 0,
      activityId: 1,
      evaluatorType: 'parent',
      evaluatorName: '张三',
      overallRating: 5,
      contentRating: 5,
      organizationRating: 4,
      environmentRating: 5,
      serviceRating: 4,
      comments: '活动很棒，孩子很喜欢！',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    ApiResponse.success(res, { evaluation }, '获取评价详情成功');
  } catch (error) {
    if (error instanceof ApiError) {
      ApiResponse.error(res, error.message, error.code, error.statusCode);
    } else if (error instanceof Error) {
      logger.error('获取评价详情失败', { error: error.message, stack: error.stack });
      ApiResponse.serverError(res, `获取评价详情失败: ${error.message}`);
    } else {
      logger.error('获取评价详情失败', { error });
      ApiResponse.serverError(res, '获取评价详情失败: 未知错误');
    }
  }
};

/**
 * 更新评价
 * @param {Request} req - 请求对象
 * @param {Response} res - 响应对象
 * @returns {Promise<void>} HTTP响应
 */
export const updateEvaluation = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未授权的访问');
    }
    
    const { id } = req.params;
    const evaluationData = req.body;
    
    if (!id || isNaN(Number(id) || 0)) {
      throw ApiError.badRequest('无效的评价ID');
    }
    
    // 验证评分范围
    if (evaluationData.overallRating !== undefined && (evaluationData.overallRating < 1 || evaluationData.overallRating > 5)) {
      throw ApiError.badRequest('总体评分必须在1-5之间');
    }
    
    // 暂时返回模拟数据
    const evaluation = {
      id: Number(id) || 0,
      ...evaluationData,
      updatedBy: userId,
      updatedAt: new Date()
    };
    
    ApiResponse.success(res, { evaluation }, '评价更新成功');
  } catch (error) {
    if (error instanceof ApiError) {
      ApiResponse.error(res, error.message, error.code, error.statusCode);
    } else if (error instanceof Error) {
      logger.error('更新评价失败', { error: error.message, stack: error.stack });
      ApiResponse.serverError(res, `更新评价失败: ${error.message}`);
    } else {
      logger.error('更新评价失败', { error });
      ApiResponse.serverError(res, '更新评价失败: 未知错误');
    }
  }
};

/**
 * 删除评价
 * @param {Request} req - 请求对象
 * @param {Response} res - 响应对象
 * @returns {Promise<void>} HTTP响应
 */
export const deleteEvaluation = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未授权的访问');
    }
    
    const { id } = req.params;
    
    if (!id || isNaN(Number(id) || 0)) {
      throw ApiError.badRequest('无效的评价ID');
    }
    
    ApiResponse.success(res, {}, '评价删除成功');
  } catch (error) {
    if (error instanceof ApiError) {
      ApiResponse.error(res, error.message, error.code, error.statusCode);
    } else if (error instanceof Error) {
      logger.error('删除评价失败', { error: error.message, stack: error.stack });
      ApiResponse.serverError(res, `删除评价失败: ${error.message}`);
    } else {
      logger.error('删除评价失败', { error });
      ApiResponse.serverError(res, '删除评价失败: 未知错误');
    }
  }
};

/**
 * 回复评价
 * @param {Request} req - 请求对象
 * @param {Response} res - 响应对象
 * @returns {Promise<void>} HTTP响应
 */
export const replyEvaluation = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未授权的访问');
    }
    
    const { id } = req.params;
    const { reply } = req.body;
    
    if (!id || isNaN(Number(id) || 0)) {
      throw ApiError.badRequest('无效的评价ID');
    }
    
    if (!reply || reply.trim() === '') {
      throw ApiError.badRequest('回复内容不能为空');
    }
    
    // 暂时返回模拟数据
    const evaluation = {
      id: Number(id) || 0,
      reply: reply.trim(),
      repliedBy: userId,
      repliedAt: new Date()
    };
    
    ApiResponse.success(res, { evaluation }, '回复评价成功');
  } catch (error) {
    if (error instanceof ApiError) {
      ApiResponse.error(res, error.message, error.code, error.statusCode);
    } else if (error instanceof Error) {
      logger.error('回复评价失败', { error: error.message, stack: error.stack });
      ApiResponse.serverError(res, `回复评价失败: ${error.message}`);
    } else {
      logger.error('回复评价失败', { error });
      ApiResponse.serverError(res, '回复评价失败: 未知错误');
    }
  }
};

/**
 * 获取评价列表
 * @param {Request} req - 请求对象
 * @param {Response} res - 响应对象
 * @returns {Promise<void>} HTTP响应
 */
export const getEvaluations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    
    // 暂时返回模拟数据
    const evaluations = [
      {
        id: 1,
        activityId: 1,
        activityTitle: '春季亲子运动会',
        evaluatorType: 'parent',
        evaluatorName: '张三',
        overallRating: 5,
        comments: '活动很棒，孩子很喜欢！',
        createdAt: new Date()
      },
      {
        id: 2,
        activityId: 1,
        activityTitle: '春季亲子运动会',
        evaluatorType: 'teacher',
        evaluatorName: '李老师',
        overallRating: 4,
        comments: '组织得很好，但时间有点紧张。',
        createdAt: new Date()
      }
    ];
    
    const result = {
      items: evaluations,
      page: Number(page) || 0,
      pageSize: Number(pageSize) || 0,
      total: evaluations.length,
      totalPages: Math.ceil(evaluations.length / Number(pageSize) || 0)
    };
    
    ApiResponse.success(res, result, '获取评价列表成功');
  } catch (error) {
    if (error instanceof ApiError) {
      ApiResponse.error(res, error.message, error.code, error.statusCode);
    } else if (error instanceof Error) {
      logger.error('获取评价列表失败', { error: error.message, stack: error.stack });
      ApiResponse.serverError(res, `获取评价列表失败: ${error.message}`);
    } else {
      logger.error('获取评价列表失败', { error });
      ApiResponse.serverError(res, '获取评价列表失败: 未知错误');
    }
  }
};

/**
 * 获取评价统计
 * @param {Request} req - 请求对象
 * @param {Response} res - 响应对象
 * @returns {Promise<void>} HTTP响应
 */
export const getEvaluationStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { activityId } = req.params;
    
    if (!activityId || isNaN(Number(activityId) || 0)) {
      throw ApiError.badRequest('无效的活动ID');
    }
    
    // 暂时返回模拟数据
    const statistics = {
      totalEvaluations: 25,
      averageRating: 4.2,
      ratingDistribution: {
        5: 10,
        4: 8,
        3: 5,
        2: 2,
        1: 0
      },
      satisfactionRate: 0.84
    };
    
    ApiResponse.success(res, statistics, '获取评价统计成功');
  } catch (error) {
    if (error instanceof ApiError) {
      ApiResponse.error(res, error.message, error.code, error.statusCode);
    } else if (error instanceof Error) {
      logger.error('获取评价统计失败', { error: error.message, stack: error.stack });
      ApiResponse.serverError(res, `获取评价统计失败: ${error.message}`);
    } else {
      logger.error('获取评价统计失败', { error });
      ApiResponse.serverError(res, '获取评价统计失败: 未知错误');
    }
  }
};

/**
 * 生成满意度报告
 * @param {Request} req - 请求对象
 * @param {Response} res - 响应对象
 * @returns {Promise<void>} HTTP响应
 */
export const generateSatisfactionReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { activityId } = req.params;
    
    if (!activityId || isNaN(Number(activityId) || 0)) {
      throw ApiError.badRequest('无效的活动ID');
    }
    
    // 暂时返回模拟数据
    const report = {
      activityId: Number(activityId) || 0,
      activityTitle: '春季亲子运动会',
      reportDate: new Date(),
      overallSatisfaction: 4.2,
      participantCount: 25,
      responseRate: 0.83,
      recommendations: [
        '增加活动时间',
        '改善场地设施',
        '提供更多互动环节'
      ]
    };
    
    ApiResponse.success(res, report, '生成满意度报告成功');
  } catch (error) {
    if (error instanceof ApiError) {
      ApiResponse.error(res, error.message, error.code, error.statusCode);
    } else if (error instanceof Error) {
      logger.error('生成满意度报告失败', { error: error.message, stack: error.stack });
      ApiResponse.serverError(res, `生成满意度报告失败: ${error.message}`);
    } else {
      logger.error('生成满意度报告失败', { error });
      ApiResponse.serverError(res, '生成满意度报告失败: 未知错误');
    }
  }
}; 