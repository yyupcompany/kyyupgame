import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import {  PerformanceRule  } from '../models/index';

// 使用模块扩展语法
declare module 'express' {
  interface User {
    id: number;
    kindergartenId?: number;
  }
}

// 获取业绩规则列表
export const getPerformanceRules = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return ApiResponse.error(res, '未登录或登录已过期', 'UNAUTHORIZED', 401);
    }

    // 构建查询条件，如果用户没有kindergartenId则查询所有
    const whereCondition = req.user.kindergartenId ? 
      { kindergartenId: req.user.kindergartenId } : 
      {};

    // 获取规则
    const rules = await PerformanceRule.findAll({
      where: whereCondition,
      order: [['updatedAt', 'DESC']]
    });

    return ApiResponse.success(res, rules);
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取业绩规则失败');
  }
};

// 创建业绩规则
export const createPerformanceRule = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return ApiResponse.error(res, '未登录或登录已过期', 'UNAUTHORIZED', 401);
    }
    
    const ruleData = {
      ...req.body,
      kindergartenId: req.user.kindergartenId,
      creatorId: req.user.id
    };

    const rule = await PerformanceRule.create(ruleData);

    return ApiResponse.success(res, rule, '业绩规则创建成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '创建业绩规则失败');
  }
};

// 获取单个业绩规则
export const getPerformanceRule = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return ApiResponse.error(res, '未登录或登录已过期', 'UNAUTHORIZED', 401);
    }
    
    const id = parseInt(req.params.id, 10);
    const filter = {
      id,
      kindergartenId: req.user.kindergartenId
    };

    const rule = await PerformanceRule.findOne({
      where: filter
    });

    if (!rule) {
      return ApiResponse.error(res, '业绩规则不存在', 'RULE_NOT_FOUND', 404);
    }

    return ApiResponse.success(res, rule);
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取业绩规则失败');
  }
};

// 更新业绩规则
export const updatePerformanceRule = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return ApiResponse.error(res, '未登录或登录已过期', 'UNAUTHORIZED', 401);
    }
    
    const id = parseInt(req.params.id, 10);
    const filter = {
      id,
      kindergartenId: req.user.kindergartenId
    };

    const ruleData = {
      ...req.body,
      updaterId: req.user.id
    };

    const rule = await PerformanceRule.findOne({
      where: filter
    });

    if (!rule) {
      return ApiResponse.error(res, '业绩规则不存在', 'RULE_NOT_FOUND', 404);
    }

    await rule.update(ruleData);

    return ApiResponse.success(res, rule, '业绩规则更新成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '更新业绩规则失败');
  }
};

// 删除业绩规则
export const deletePerformanceRule = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return ApiResponse.error(res, '未登录或登录已过期', 'UNAUTHORIZED', 401);
    }
    
    const id = parseInt(req.params.id, 10);
    const filter = {
      id,
      kindergartenId: req.user.kindergartenId
    };

    const rule = await PerformanceRule.findOne({
      where: filter
    });

    if (!rule) {
      return ApiResponse.error(res, '业绩规则不存在', 'RULE_NOT_FOUND', 404);
    }

    await rule.destroy();

    return ApiResponse.success(res, null, '业绩规则删除成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '删除业绩规则失败');
  }
}; 