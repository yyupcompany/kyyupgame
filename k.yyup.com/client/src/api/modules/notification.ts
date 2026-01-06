// 通知模块API服务
import { request } from '@/utils/request';
import { API_PREFIX } from '../endpoints/base';

// API端点常量
export const NOTIFICATION_ENDPOINTS = {
  BASE: `${API_PREFIX}/notifications`,
  BY_ID: (id: string) => `${API_PREFIX}/notifications/${id}`,
  SEND: (id: string) => `${API_PREFIX}/notifications/${id}/send`,
  READ_STATUS: (id: string) => `${API_PREFIX}/notifications/${id}/read-status`,
  CANCEL: (id: string) => `${API_PREFIX}/notifications/${id}/cancel`,
  MARK_READ: (id: string) => `${API_PREFIX}/notifications/${id}/read`,
  BATCH_READ: `${API_PREFIX}/notifications/batch-read`,
  MARK_ALL_READ: `${API_PREFIX}/notifications/mark-all-read`,
  UNREAD_COUNT: `${API_PREFIX}/notifications/unread-count`,
  UPLOAD_ATTACHMENTS: `${API_PREFIX}/upload/notification-attachments`
} as const

/**
 * 通知状态枚举
 */
export enum NotificationStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  CANCELLED = 'CANCELLED'
}

/**
 * 通知类型枚举
 */
export enum NotificationType {
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  EVENT = 'EVENT',
  REMINDER = 'REMINDER',
  ALERT = 'ALERT'
}

/**
 * 通知接收者类型枚举
 */
export enum RecipientType {
  ALL = 'ALL',
  TEACHERS = 'TEACHERS',
  PARENTS = 'PARENTS',
  CLASS = 'CLASS',
  STUDENT = 'STUDENT',
  CUSTOM = 'CUSTOM'
}

/**
 * 通知数据接口
 */
export interface Notification {
  id: string;
  title: string;
  content: string;
  type: NotificationType;
  status: NotificationStatus;
  recipientType: RecipientType;
  recipientIds?: string[];
  classId?: string;
  senderId: string;
  senderName: string;
  sendTime?: string;
  readCount: number;
  totalRecipients: number;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * 通知创建参数接口
 */
export interface NotificationCreateParams {
  title: string;
  content: string;
  type: NotificationType;
  recipientType: RecipientType;
  recipientIds?: string[];
  classId?: string;
  attachments?: string[];
  scheduledTime?: string;
}

/**
 * 通知查询参数接口
 */
export interface NotificationQueryParams {
  keyword?: string;
  type?: NotificationType;
  status?: NotificationStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

/**
 * 获取通知列表
 * @param {NotificationQueryParams} params - 查询参数
 * @returns {Promise<{ items: Notification[], total: number }>} 通知列表和总数
 */
export const getNotificationList = (params: NotificationQueryParams) => {
  return request.get(NOTIFICATION_ENDPOINTS.BASE, { params });
};

/**
 * 获取通知详情
 * @param {string} id - 通知ID
 * @returns {Promise<Notification>} 通知详情
 */
export const getNotificationDetail = (id: string) => {
  return request.get(NOTIFICATION_ENDPOINTS.BY_ID(id));
};

/**
 * 创建通知
 * @param {NotificationCreateParams} data - 通知创建参数
 * @returns {Promise<Notification>} 创建的通知
 */
export const createNotification = (data: NotificationCreateParams) => {
  return request.post(NOTIFICATION_ENDPOINTS.BASE, data);
};

/**
 * 更新通知
 * @param {string} id - 通知ID
 * @param {Partial<NotificationCreateParams>} data - 通知更新参数
 * @returns {Promise<Notification>} 更新后的通知
 */
export const updateNotification = (id: string, data: Partial<NotificationCreateParams>) => {
  return request.put(NOTIFICATION_ENDPOINTS.BY_ID(id), data);
};

/**
 * 删除通知
 * @param {string} id - 通知ID
 * @returns {Promise<void>}
 */
export const deleteNotification = (id: string) => {
  return request.del(NOTIFICATION_ENDPOINTS.BY_ID(id));
};

/**
 * 发送通知
 * @param {string} id - 通知ID
 * @returns {Promise<{ success: boolean, sentCount: number }>} 发送结果
 */
export const sendNotification = (id: string) => {
  return request.post(NOTIFICATION_ENDPOINTS.SEND(id));
};

/**
 * 获取通知阅读状态
 * @param {string} id - 通知ID
 * @returns {Promise<Array<{ recipientId: string, recipientName: string, readTime: string | null }>>} 阅读状态列表
 */
export const getNotificationReadStatus = (id: string) => {
  return request.get(NOTIFICATION_ENDPOINTS.READ_STATUS(id));
};

/**
 * 取消通知发送
 * @param {string} id - 通知ID
 * @returns {Promise<{ success: boolean }>} 取消结果
 */
export const cancelNotification = (id: string) => {
  return request.post(NOTIFICATION_ENDPOINTS.CANCEL(id));
};

/**
 * 上传通知附件
 * @param {FormData} formData - 包含文件的FormData
 * @returns {Promise<{ files: Array<{ id: string, name: string, url: string, size: number }> }>} 上传的文件信息
 */
export const uploadNotificationAttachments = (formData: FormData) => {
  return request.post(NOTIFICATION_ENDPOINTS.UPLOAD_ATTACHMENTS, formData);
};

/**
 * 标记通知为已读
 * @param {string} id - 通知ID
 * @returns {Promise<Notification>} 更新后的通知
 */
export const markNotificationAsRead = (id: string) => {
  return request.patch(NOTIFICATION_ENDPOINTS.MARK_READ(id));
};

/**
 * 批量标记通知为已读
 * @param {string[]} notificationIds - 通知ID数组，如果为空则标记所有未读通知
 * @returns {Promise<{ message: string, count: number }>} 操作结果
 */
export const markAllNotificationsAsRead = (notificationIds?: string[]) => {
  if (notificationIds && notificationIds.length > 0) {
    return request.post(NOTIFICATION_ENDPOINTS.BATCH_READ, { notification_ids: notificationIds });
  } else {
    return request.patch(NOTIFICATION_ENDPOINTS.MARK_ALL_READ);
  }
};

/**
 * 获取未读通知数量
 * @returns {Promise<{ unread_count: number }>} 未读通知数量
 */
export const getUnreadNotificationCount = () => {
  return request.get(NOTIFICATION_ENDPOINTS.UNREAD_COUNT);
};

/**
 * 教师专用：获取通知统计数据
 * @returns {Promise<{ unread: number, total: number, urgent: number, today: number }>} 通知统计
 */
export const getNotificationStats = async () => {
  try {
    const [listResponse, unreadResponse] = await Promise.all([
      request.get(NOTIFICATION_ENDPOINTS.BASE),
      request.get(NOTIFICATION_ENDPOINTS.UNREAD_COUNT)
    ]);

    const notifications = listResponse.data?.items || [];
    const unreadCount = unreadResponse.data?.unread_count || 0;

    // 计算统计数据
    const today = new Date().toDateString();
    const todayCount = notifications.filter((n: any) =>
      new Date(n.created_at).toDateString() === today
    ).length;

    const urgentCount = notifications.filter((n: any) =>
      n.priority === 'urgent' || n.type === 'urgent'
    ).length;

    return {
      data: {
        unread: unreadCount,
        total: notifications.length,
        urgent: urgentCount,
        today: todayCount
      }
    };
  } catch (error) {
    console.error('获取通知统计失败:', error);
    throw error;
  }
};