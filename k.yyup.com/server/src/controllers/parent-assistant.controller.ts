import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import parentAssistantService from '../services/assessment/parent-assistant.service';

/**
 * 回答家长问题
 */
export const answerQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { question } = req.body;

    if (!question) {
      throw ApiError.badRequest('缺少问题内容');
    }

    // 获取家长ID（从parent表关联user）
    const Parent = require('../../models/parent.model').Parent;
    const parent = await Parent.findOne({
      where: { userId }
    });

    if (!parent) {
      throw ApiError.badRequest('未找到家长信息');
    }

    const result = await parentAssistantService.answerQuestion(parent.id, question);

    ApiResponse.success(res, result, '回答生成成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 获取快捷问题
 */
export const getQuickQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const questions = parentAssistantService.getQuickQuestions();
    ApiResponse.success(res, questions, '获取快捷问题成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 获取家长助手统计数据
 */
export const getStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    // 模拟统计数据
    const stats = {
      conversationCount: 0,
      resolvedCount: 0,
      satisfactionScore: 0
    };

    ApiResponse.success(res, stats, '获取统计数据成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 获取对话历史记录
 */
export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    // 模拟历史记录
    const history = [];

    ApiResponse.success(res, history, '获取历史记录成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 搜索对话历史
 */
export const searchHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      throw ApiError.badRequest('搜索关键词不能为空');
    }

    // 模拟搜索结果
    const results = [];

    ApiResponse.success(res, results, '搜索成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

