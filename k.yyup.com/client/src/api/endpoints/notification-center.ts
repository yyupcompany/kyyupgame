import { request } from '@/utils/request';

/**
 * 通知统计数据接口
 */
export interface NotificationStatistics {
  notificationId: number;
  title: string;
  content: string;
  type: string;
  senderName: string;
  sendAt: string;
  totalRecipients: number;
  readRecipients: number;
  unreadRecipients: number;
  readRate: number;
  createdAt: string;
}

/**
 * 通知阅读详情接口
 */
export interface NotificationReaders {
  notification: {
    title: string;
    content: string;
    type: string;
    sendAt: string;
    totalRecipients: number;
    readRecipients: number;
    unreadRecipients: number;
    readRate: number;
  };
  readers: Array<{
    userId: number;
    userName: string;
    userRole: string;
    department: string;
    status: 'read' | 'unread';
    readAt: string | null;
  }>;
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 通知统计概览接口
 */
export interface NotificationOverview {
  totalNotifications: number;
  todayNotifications: number;
  totalRecipients: number;
  averageReadRate: number;
  urgentUnread: number;
}

/**
 * 通知中心API（园长专用）
 */
export const notificationCenterApi = {
  /**
   * 获取通知统计列表
   */
  getNotificationStatistics: (params: {
    page?: number;
    pageSize?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
    keyword?: string;
  }) => {
    return request.get<{
      items: NotificationStatistics[];
      total: number;
      page: number;
      pageSize: number;
    }>('/principal/notifications/statistics', { params });
  },

  /**
   * 获取通知阅读详情
   */
  getNotificationReaders: (
    notificationId: number,
    params: {
      status?: 'read' | 'unread' | 'all';
      page?: number;
      pageSize?: number;
    }
  ) => {
    return request.get<NotificationReaders>(
      `/principal/notifications/${notificationId}/readers`,
      { params }
    );
  },

  /**
   * 获取通知统计概览
   */
  getNotificationOverview: () => {
    return request.get<NotificationOverview>('/principal/notifications/overview');
  },

  /**
   * 导出通知阅读报告
   */
  exportNotificationReport: (notificationId: number) => {
    return request.post<{
      downloadUrl: string;
      fileName: string;
    }>(`/principal/notifications/${notificationId}/export`);
  },

  /**
   * 创建并发送通知
   */
  createAndSendNotification: (data: {
    title: string;
    content: string;
    type: string;
    priority?: string;
    recipients: {
      roles?: string[];
      departments?: number[];
      classes?: number[];
      userIds?: number[];
    };
  }) => {
    return request.post<{
      templateId: number;
      totalRecipients: number;
      message: string;
    }>('/principal/notifications', data);
  }
};

