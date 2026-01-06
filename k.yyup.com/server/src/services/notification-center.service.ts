import { Op, QueryTypes } from 'sequelize';
import { sequelize } from '../init';
import { Notification } from '../models/notification.model';
import { User } from '../models/user.model';

/**
 * 通知中心服务（园长专用）
 * 提供通知统计和阅读详情功能
 */
export class NotificationCenterService {
  /**
   * 获取通知统计列表
   */
  async getNotificationStatistics(params: {
    page: number;
    pageSize: number;
    type?: string;
    startDate?: string;
    endDate?: string;
    keyword?: string;
  }) {
    const { page, pageSize, type, startDate, endDate, keyword } = params;
    const offset = (page - 1) * pageSize;

    // 构建查询条件
    const whereConditions: string[] = ['sender_id IS NOT NULL', 'deleted_at IS NULL'];
    const replacements: any = {};

    if (type) {
      whereConditions.push('type = :type');
      replacements.type = type;
    }

    if (startDate && endDate) {
      whereConditions.push('send_at BETWEEN :startDate AND :endDate');
      replacements.startDate = startDate;
      replacements.endDate = endDate;
    }

    if (keyword) {
      whereConditions.push('(title LIKE :keyword OR content LIKE :keyword)');
      replacements.keyword = `%${keyword}%`;
    }

    const whereClause = whereConditions.join(' AND ');

    // 聚合查询：按 title, content, sender_id, DATE(send_at) 分组
    const query = `
      SELECT 
        MIN(id) as notification_id,
        title,
        content,
        type,
        sender_id,
        send_at,
        COUNT(*) as total_recipients,
        SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read_recipients,
        SUM(CASE WHEN status != 'read' THEN 1 ELSE 0 END) as unread_recipients,
        MIN(created_at) as created_at
      FROM notifications
      WHERE ${whereClause}
      GROUP BY title, content, sender_id, DATE(send_at)
      ORDER BY send_at DESC
      LIMIT :limit OFFSET :offset
    `;

    replacements.limit = pageSize;
    replacements.offset = offset;

    const notifications = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    }) as any[];

    // 获取发送人信息
    const senderIds = [...new Set(notifications.map(n => n.sender_id))];
    const senders = await User.findAll({
      where: { id: { [Op.in]: senderIds } },
      attributes: ['id', 'username']
    });

    const senderMap = new Map(senders.map(s => [s.id, s.username]));

    // 计算阅读率并格式化数据
    const items = notifications.map((n: any) => {
      const total = parseInt(n.total_recipients);
      const read = parseInt(n.read_recipients);
      const unread = parseInt(n.unread_recipients);
      const readRate = total > 0 ? Math.round((read / total) * 100 * 100) / 100 : 0;

      return {
        notificationId: n.notification_id,
        title: n.title,
        content: n.content,
        type: n.type,
        senderName: senderMap.get(n.sender_id) || '系统',
        sendAt: n.send_at,
        totalRecipients: total,
        readRecipients: read,
        unreadRecipients: unread,
        readRate: readRate,
        createdAt: n.created_at
      };
    });

    // 获取总数
    const countQuery = `
      SELECT COUNT(DISTINCT CONCAT(title, '-', sender_id, '-', DATE(send_at))) as total
      FROM notifications
      WHERE ${whereClause}
    `;

    const countResult = await sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT
    }) as any[];

    const total = parseInt(countResult[0]?.total || '0');

    return {
      items,
      total,
      page,
      pageSize
    };
  }

  /**
   * 获取通知阅读详情
   */
  async getNotificationReaders(
    notificationId: number,
    params: {
      status: 'read' | 'unread' | 'all';
      page: number;
      pageSize: number;
    }
  ) {
    const { status, page, pageSize } = params;
    const offset = (page - 1) * pageSize;

    // 先获取这条通知的基本信息
    const baseNotification = await Notification.findByPk(notificationId);
    if (!baseNotification) {
      throw new Error('通知不存在');
    }

    // 查询同一批次的所有通知
    const where: any = {
      title: baseNotification.title,
      content: baseNotification.content,
      senderId: baseNotification.senderId,
      deletedAt: null
    };

    // 添加状态筛选
    if (status === 'read') {
      where.status = 'read';
    } else if (status === 'unread') {
      where.status = { [Op.ne]: 'read' };
    }

    // 查询通知列表
    const { rows, count } = await Notification.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'role', 'realName']
        }
      ],
      order: [
        ['readAt', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit: pageSize,
      offset: offset
    });

    // 统计信息
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read_count,
        SUM(CASE WHEN status != 'read' THEN 1 ELSE 0 END) as unread_count
      FROM notifications
      WHERE title = :title
        AND content = :content
        AND sender_id = :senderId
        AND deleted_at IS NULL
    `;

    const stats = await sequelize.query(statsQuery, {
      replacements: {
        title: baseNotification.title,
        content: baseNotification.content,
        senderId: baseNotification.senderId
      },
      type: QueryTypes.SELECT
    }) as any[];

    const totalRecipients = parseInt(stats[0]?.total || '0');
    const readRecipients = parseInt(stats[0]?.read_count || '0');
    const unreadRecipients = parseInt(stats[0]?.unread_count || '0');
    const readRate = totalRecipients > 0 
      ? Math.round((readRecipients / totalRecipients) * 100 * 100) / 100 
      : 0;

    return {
      notification: {
        title: baseNotification.title,
        content: baseNotification.content,
        type: baseNotification.type,
        sendAt: baseNotification.sendAt,
        totalRecipients,
        readRecipients,
        unreadRecipients,
        readRate
      },
      readers: rows.map(n => {
        const user = (n as any).user;
        return {
          userId: n.userId,
          userName: user?.realName || user?.username || '未知用户',
          userRole: user?.role || '未知角色',
          department: '-', // 暂时没有部门字段
          status: n.status === 'read' ? 'read' : 'unread',
          readAt: n.readAt
        };
      }),
      total: count,
      page,
      pageSize
    };
  }

  /**
   * 获取通知统计概览
   */
  async getNotificationOverview() {
    // 总通知数（按批次统计）
    const totalQuery = `
      SELECT COUNT(DISTINCT CONCAT(title, '-', sender_id, '-', DATE(send_at))) as total
      FROM notifications
      WHERE sender_id IS NOT NULL AND deleted_at IS NULL
    `;
    const totalResult = await sequelize.query(totalQuery, {
      type: QueryTypes.SELECT
    }) as any[];
    const totalNotifications = parseInt(totalResult[0]?.total || '0');

    // 今日通知数
    const todayQuery = `
      SELECT COUNT(DISTINCT CONCAT(title, '-', sender_id, '-', DATE(send_at))) as total
      FROM notifications
      WHERE sender_id IS NOT NULL 
        AND deleted_at IS NULL
        AND DATE(send_at) = CURDATE()
    `;
    const todayResult = await sequelize.query(todayQuery, {
      type: QueryTypes.SELECT
    }) as any[];
    const todayNotifications = parseInt(todayResult[0]?.total || '0');

    // 总接收人次
    const recipientsQuery = `
      SELECT COUNT(*) as total
      FROM notifications
      WHERE sender_id IS NOT NULL AND deleted_at IS NULL
    `;
    const recipientsResult = await sequelize.query(recipientsQuery, {
      type: QueryTypes.SELECT
    }) as any[];
    const totalRecipients = parseInt(recipientsResult[0]?.total || '0');

    // 平均阅读率
    const readRateQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read_count
      FROM notifications
      WHERE sender_id IS NOT NULL AND deleted_at IS NULL
    `;
    const readRateResult = await sequelize.query(readRateQuery, {
      type: QueryTypes.SELECT
    }) as any[];
    const total = parseInt(readRateResult[0]?.total || '0');
    const readCount = parseInt(readRateResult[0]?.read_count || '0');
    const averageReadRate = total > 0 ? Math.round((readCount / total) * 100 * 100) / 100 : 0;

    // 紧急未读数（假设priority字段存在）
    const urgentUnreadQuery = `
      SELECT COUNT(*) as total
      FROM notifications
      WHERE sender_id IS NOT NULL 
        AND deleted_at IS NULL
        AND status != 'read'
        AND type = 'system'
    `;
    const urgentUnreadResult = await sequelize.query(urgentUnreadQuery, {
      type: QueryTypes.SELECT
    }) as any[];
    const urgentUnread = parseInt(urgentUnreadResult[0]?.total || '0');

    return {
      totalNotifications,
      todayNotifications,
      totalRecipients,
      averageReadRate,
      urgentUnread
    };
  }

  /**
   * 导出通知阅读报告
   */
  async exportNotificationReport(notificationId: number) {
    // TODO: 实现Excel导出功能
    return {
      downloadUrl: `/exports/notification-${notificationId}-${Date.now()}.xlsx`,
      fileName: `notification-report-${notificationId}.xlsx`
    };
  }

  /**
   * 创建并发送通知
   */
  async createAndSendNotification(data: {
    title: string;
    content: string;
    type: string;
    priority: string;
    recipients: any;
    senderId: number;
  }) {
    // TODO: 实现创建和发送通知功能
    return {
      templateId: 1,
      totalRecipients: 0,
      message: '通知发送成功'
    };
  }
}

