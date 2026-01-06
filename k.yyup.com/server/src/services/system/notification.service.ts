import { Notification, NotificationStatus, NotificationType, NotificationCreationAttributes } from '../../models/notification.model';
import { User } from '../../models/user.model';
import { ApiError } from '../../utils/apiError';
import { sequelize } from '../../init';
import { Op } from 'sequelize';

// 服务内部的分页选项接口
interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

// 通知过滤条件接口
interface NotificationFilterParams {
  status?: NotificationStatus;
  senderId?: number;
  keyword?: string;
  startDate?: Date;
  endDate?: Date;
  userId?: number;
}

export class NotificationService {
  /**
   * 创建通知
   * @param data 通知数据
   * @returns 创建的通知
   */
  async createNotification(data: NotificationCreationAttributes): Promise<Notification> {
    const notification = await Notification.create(data);
    return notification;
  }

  /**
   * 获取通知列表
   * @param options 分页和排序选项
   * @param filters 筛选条件
   * @returns 通知列表及总数
   */
  async getNotifications(
    options: { page: number; pageSize: number; sortBy: string; sortOrder: string },
    filters: { type?: NotificationType; status?: NotificationStatus; userId?: number; keyword?: string }
  ): Promise<{ rows: Notification[]; count: number }> {
    const { page, pageSize, sortBy, sortOrder } = options;
    const { type, status, userId, keyword } = filters;

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (userId) where.userId = userId;

    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { content: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const { rows, count } = await Notification.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [[sortBy, sortOrder]],
    });

    return { rows, count };
  }

  /**
   * 获取单个通知详情
   * @param id 通知ID
   * @returns 通知详情
   */
  async getNotificationById(id: number): Promise<Notification> {
    const notification = await Notification.findByPk(id);
    if (!notification) {
      throw ApiError.notFound('通知不存在');
    }
    return notification;
  }

  /**
   * 更新通知
   * @param id 通知ID
   * @param data 更新数据
   * @returns 更新后的通知
   */
  async updateNotification(id: number, data: Partial<NotificationCreationAttributes>): Promise<Notification> {
    const notification = await this.getNotificationById(id);
    if (notification.status !== NotificationStatus.DRAFT && notification.status !== NotificationStatus.UNREAD) {
      throw ApiError.badRequest('只有草稿或未读状态的通知才能编辑');
    }
    await notification.update(data);
    return notification;
  }

  /**
   * 发送通知
   * @param id 通知ID
   * @returns 发送后的通知
   */
  async sendNotification(id: number, senderId: number): Promise<Notification> {
    const notification = await this.getNotificationById(id);
    if (notification.status === NotificationStatus.PUBLISHED) {
      throw ApiError.badRequest('通知已发送');
    }
    
    // TODO: 实现发送逻辑，例如推送、邮件等

    notification.status = NotificationStatus.PUBLISHED;
    notification.sendAt = new Date();
    notification.senderId = senderId;
    await notification.save();
    return notification;
  }

  /**
   * 取消通知
   * @param id 通知ID
   * @param userId 操作用户ID
   * @param reason 取消原因
   * @returns 
   */
  async cancelNotification(id: number, userId: number, reason: string): Promise<Notification> {
    const notification = await this.getNotificationById(id);
    if (notification.status !== NotificationStatus.PUBLISHED) {
      throw ApiError.badRequest('只有已发送的通知才能取消');
    }
    notification.status = NotificationStatus.CANCELLED;
    notification.cancelledAt = new Date();
    notification.cancelledBy = userId;
    notification.cancelReason = reason;
    await notification.save();
    return notification;
  }

  /**
   * 将通知标记为已读
   * @param id 通知ID
   */
  async markAsRead(id: number): Promise<void> {
    const notification = await this.getNotificationById(id);
    await notification.markAsRead();
  }

  /**
   * 删除通知
   * @param id 通知ID
   */
  async deleteNotification(id: number): Promise<void> {
    const notification = await this.getNotificationById(id);
    await notification.destroy();
  }
}

// 导出服务实例
export default new NotificationService();