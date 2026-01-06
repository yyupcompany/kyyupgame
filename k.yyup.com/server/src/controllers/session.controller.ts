/**
 * 会话管理Controller
 * 
 * 提供会话管理相关的API端点
 */

import { Request, Response } from 'express';
import SessionService from '../services/session.service';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

/**
 * 获取当前用户的所有会话
 */
export const getUserSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw ApiError.unauthorized('用户未登录');
    }

    const sessions = await SessionService.getUserSession(userId);
    
    ApiResponse.success(res, {
      sessions: Array.isArray(sessions) ? sessions : (sessions ? [sessions] : []),
      count: Array.isArray(sessions) ? sessions.length : (sessions ? 1 : 0)
    }, '获取会话列表成功');
  } catch (error) {
    console.error('❌ 获取用户会话失败:', error);
    throw error;
  }
};

/**
 * 获取在线用户列表（管理员）
 */
export const getOnlineUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = (req as any).user?.role;

    // 只有管理员可以查看在线用户
    if (!['admin', 'super_admin'].includes(userRole)) {
      throw ApiError.forbidden('无权限查看在线用户');
    }

    const onlineUserIds = await SessionService.getOnlineUsers();
    
    ApiResponse.success(res, {
      userIds: onlineUserIds,
      count: onlineUserIds.length
    }, '获取在线用户成功');
  } catch (error) {
    console.error('❌ 获取在线用户失败:', error);
    throw error;
  }
};

/**
 * 获取会话统计信息（管理员）
 */
export const getSessionStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = (req as any).user?.role;

    // 只有管理员可以查看会话统计
    if (!['admin', 'super_admin'].includes(userRole)) {
      throw ApiError.forbidden('无权限查看会话统计');
    }

    const stats = await SessionService.getSessionStats();
    
    ApiResponse.success(res, stats, '获取会话统计成功');
  } catch (error) {
    console.error('❌ 获取会话统计失败:', error);
    throw error;
  }
};

/**
 * 踢出指定用户的所有会话（管理员）
 */
export const kickoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = (req as any).user?.role;
    const targetUserId = parseInt(req.params.userId);

    // 只有管理员可以踢出用户
    if (!['admin', 'super_admin'].includes(userRole)) {
      throw ApiError.forbidden('无权限踢出用户');
    }

    if (!targetUserId || isNaN(targetUserId)) {
      throw ApiError.badRequest('无效的用户ID');
    }

    const kickedCount = await SessionService.kickoutUserSessions(targetUserId);
    
    ApiResponse.success(res, {
      userId: targetUserId,
      kickedCount
    }, `已踢出用户${targetUserId}的${kickedCount}个会话`);
  } catch (error) {
    console.error('❌ 踢出用户会话失败:', error);
    throw error;
  }
};

/**
 * 踢出当前用户的其他会话（保留当前会话）
 */
export const kickoutOtherSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const currentToken = req.headers.authorization?.replace('Bearer ', '');

    if (!userId || !currentToken) {
      throw ApiError.unauthorized('用户未登录');
    }

    const kickedCount = await SessionService.kickoutUserSessions(userId, currentToken);
    
    ApiResponse.success(res, {
      kickedCount
    }, `已踢出其他${kickedCount}个会话`);
  } catch (error) {
    console.error('❌ 踢出其他会话失败:', error);
    throw error;
  }
};

/**
 * 删除指定会话
 */
export const deleteSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const token = req.params.token;

    if (!userId) {
      throw ApiError.unauthorized('用户未登录');
    }

    if (!token) {
      throw ApiError.badRequest('缺少Token参数');
    }

    // 验证会话是否属于当前用户
    const session = await SessionService.getUserSession(userId, token);
    if (!session) {
      throw ApiError.notFound('会话不存在');
    }

    const success = await SessionService.deleteSession(userId, token);
    
    if (success) {
      // 将Token加入黑名单
      await SessionService.addToBlacklist(token);

      ApiResponse.success(res, null, '会话已删除');
    } else {
      throw ApiError.serverError('删除会话失败');
    }
  } catch (error) {
    console.error('❌ 删除会话失败:', error);
    throw error;
  }
};

/**
 * 更新当前会话活跃时间
 */
export const updateSessionActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!userId || !token) {
      throw ApiError.unauthorized('用户未登录');
    }

    const success = await SessionService.updateSessionActivity(userId, token);
    
    if (success) {
      ApiResponse.success(res, null, '会话活跃时间已更新');
    } else {
      throw ApiError.notFound('会话不存在');
    }
  } catch (error) {
    console.error('❌ 更新会话活跃时间失败:', error);
    throw error;
  }
};

export default {
  getUserSessions,
  getOnlineUsers,
  getSessionStats,
  kickoutUser,
  kickoutOtherSessions,
  deleteSession,
  updateSessionActivity
};

