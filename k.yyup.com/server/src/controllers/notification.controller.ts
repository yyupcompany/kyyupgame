import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import { ApiResponse } from '../utils/apiResponse';
import { sequelize } from '../init';

// 获取数据库实例
const getSequelizeInstance = () => {
  return sequelize;
};

// 获取通知列表
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const db = getSequelizeInstance();
    const userId = req.user?.id;
    const userRole = (req.user as any)?.role;
    const { page = 1, limit = 10, type, status } = req.query;

    let whereClause = 'WHERE deleted_at IS NULL';
    const replacements: any = {};

    // 教师权限过滤：只能看到发给自己的通知或公开通知
    if (userRole === 'teacher') {
      whereClause += ' AND (target_type = "all" OR (target_type = "user" AND target_id = :userId) OR (target_type = "role" AND target_id = "teacher"))';
      replacements.userId = userId;
    }

    if (type) {
      whereClause += ' AND type = :type';
      replacements.type = type;
    }

    if (status) {
      whereClause += ' AND status = :status';
      replacements.status = status;
    }

    const query = `SELECT * FROM notifications ${whereClause} ORDER BY created_at DESC LIMIT :limit OFFSET :offset`;
    replacements.limit = Number(limit);
    replacements.offset = (Number(page) - 1) * Number(limit);

    const notifications = await db.query(query, {
      replacements,
      type: 'SELECT'
    });

    const notificationsList = Array.isArray(notifications) ? notifications : [];
    return ApiResponse.success(res, {
      items: notificationsList,
      total: notificationsList.length,
      page: Number(page),
      pageSize: Number(limit),
      totalPages: Math.ceil(notificationsList.length / Number(limit))
    });
  } catch (error) {
    console.error('Notification error:', error);
    return ApiResponse.handleError(res, error, '获取通知列表失败');
  }
};

// 创建通知
export const createNotification = async (req: Request, res: Response) => {
  try {
    return ApiResponse.error(res, '创建功能暂未实现', 'NOT_IMPLEMENTED', 501);
  } catch (error) {
    return ApiResponse.handleError(res, error, '创建通知失败');
  }
};

// 获取通知详情
export const getNotificationById = async (req: Request, res: Response) => {
  try {
    return ApiResponse.error(res, '详情功能暂未实现', 'NOT_IMPLEMENTED', 501);
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取通知详情失败');
  }
};

// 更新通知
export const updateNotification = async (req: Request, res: Response) => {
  try {
    return ApiResponse.error(res, '更新功能暂未实现', 'NOT_IMPLEMENTED', 501);
  } catch (error) {
    return ApiResponse.handleError(res, error, '更新通知失败');
  }
};

// 标记通知已读
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!id) {
      return ApiResponse.error(res, '通知ID不能为空', 'VALIDATION_ERROR', 400);
    }

    const db = getSequelizeInstance();

    // 检查通知是否存在
    const notification = await db.query(
      'SELECT * FROM notifications WHERE id = ? LIMIT 1',
      {
        replacements: [id],
        type: 'SELECT'
      }
    ) as any[];

    if (!notification || notification.length === 0) {
      return ApiResponse.error(res, '通知不存在', 'NOT_FOUND', 404);
    }

    // 更新通知为已读状态
    await db.query(
      'UPDATE notifications SET is_read = 1, read_at = NOW(), updated_at = NOW() WHERE id = ?',
      {
        replacements: [id],
        type: 'UPDATE'
      }
    );

    // 获取更新后的通知
    const updatedNotification = await db.query(
      'SELECT * FROM notifications WHERE id = ? LIMIT 1',
      {
        replacements: [id],
        type: 'SELECT'
      }
    ) as any[];

    return ApiResponse.success(res, updatedNotification && updatedNotification.length > 0 ? updatedNotification[0] : null);
  } catch (error) {
    return ApiResponse.handleError(res, error, '标记通知已读失败');
  }
};

// 删除通知
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!id) {
      return ApiResponse.error(res, '通知ID不能为空', 'VALIDATION_ERROR', 400);
    }

    const db = getSequelizeInstance();

    // 检查通知是否存在
    const notification = await db.query(
      'SELECT * FROM notifications WHERE id = ? LIMIT 1',
      {
        replacements: [id],
        type: 'SELECT'
      }
    ) as any[];

    if (!notification || notification.length === 0) {
      return ApiResponse.error(res, '通知不存在', 'NOT_FOUND', 404);
    }

    // 软删除通知（如果表有deleted_at字段）或直接删除
    try {
      // 尝试软删除
      await db.query(
        'UPDATE notifications SET deleted_at = NOW(), updated_at = NOW() WHERE id = ?',
        {
          replacements: [id],
          type: 'UPDATE'
        }
      );
    } catch (softDeleteError) {
      // 如果没有deleted_at字段，则直接删除
      await db.query(
        'DELETE FROM notifications WHERE id = ?',
        {
          replacements: [id],
          type: 'DELETE'
        }
      );
    }

    return ApiResponse.success(res, { message: '通知删除成功' });
  } catch (error) {
    return ApiResponse.handleError(res, error, '删除通知失败');
  }
};

// 批量标记已读
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { notification_ids } = req.body;

    const db = getSequelizeInstance();

    if (notification_ids && Array.isArray(notification_ids) && notification_ids.length > 0) {
      // 批量标记指定通知为已读
      const placeholders = notification_ids.map(() => '?').join(',');
      await db.query(
        `UPDATE notifications SET is_read = 1, read_at = NOW(), updated_at = NOW() WHERE id IN (${placeholders})`,
        {
          replacements: notification_ids,
          type: 'UPDATE'
        }
      );

      return ApiResponse.success(res, {
        message: `成功标记 ${notification_ids.length} 条通知为已读`,
        count: notification_ids.length
      });
    } else {
      // 标记所有未读通知为已读
      const result = await db.query(
        'UPDATE notifications SET is_read = 1, read_at = NOW(), updated_at = NOW() WHERE is_read = 0',
        { type: 'UPDATE' }
      );

      // 获取影响的行数（不同数据库返回格式可能不同）
      const affectedRows = Array.isArray(result) ? result[1] : 0;

      return ApiResponse.success(res, {
        message: `成功标记 ${affectedRows} 条通知为已读`,
        count: affectedRows
      });
    }
  } catch (error) {
    return ApiResponse.handleError(res, error, '批量标记已读失败');
  }
};

// 获取未读通知数
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const db = getSequelizeInstance();
    const result = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE is_read = 0',
      { type: 'SELECT' }
    );

    const resultList = Array.isArray(result) ? result : [];
    const count = resultList.length > 0 ? (resultList[0] as any).count : 0;
    return ApiResponse.success(res, { count });
  } catch (error) {
    console.error('Unread count error:', error);
    return ApiResponse.handleError(res, error, '获取未读通知数失败');
  }
};

 