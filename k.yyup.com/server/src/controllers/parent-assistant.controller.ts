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

