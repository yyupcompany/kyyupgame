import { CustomerApplication, CustomerApplicationStatus, Parent, User, Notification, NotificationType, NotificationStatus } from '../models';
import { Op } from 'sequelize';

/**
 * 客户申请服务
 */
export class CustomerApplicationService {
  /**
   * 教师申请客户（支持批量）
   */
  async applyForCustomers(params: {
    customerIds: number[];
    teacherId: number;
    kindergartenId?: number;
    applyReason?: string;
  }) {
    const { customerIds, teacherId, kindergartenId, applyReason } = params;

    const results = {
      successCount: 0,
      failedCount: 0,
      applicationIds: [] as number[],
      failedCustomers: [] as Array<{ customerId: number; reason: string }>
    };

    // 逐个处理客户申请
    for (const customerId of customerIds) {
      try {
        // 1. 检查客户是否存在
        const customer = await Parent.findByPk(customerId);
        if (!customer) {
          results.failedCount++;
          results.failedCustomers.push({
            customerId,
            reason: '客户不存在'
          });
          continue;
        }

        // 2. 检查客户是否已分配
        if (customer.assignedTeacherId && customer.assignedTeacherId !== teacherId) {
          results.failedCount++;
          results.failedCustomers.push({
            customerId,
            reason: `客户已分配给其他教师`
          });
          continue;
        }

        // 3. 检查是否已有待审批的申请
        const existingApplication = await CustomerApplication.findOne({
          where: {
            customerId,
            teacherId,
            status: CustomerApplicationStatus.PENDING
          }
        });

        if (existingApplication) {
          results.failedCount++;
          results.failedCustomers.push({
            customerId,
            reason: '已有待审批的申请'
          });
          continue;
        }

        // 4. 创建申请记录
        const application = await CustomerApplication.create({
          customerId,
          teacherId,
          kindergartenId,
          status: CustomerApplicationStatus.PENDING,
          applyReason,
          appliedAt: new Date()
        });

        results.successCount++;
        results.applicationIds.push(application.id);

        // 5. 发送通知给园长
        await this.sendApplicationNotificationToPrincipal(application.id, teacherId, customerId, kindergartenId);

      } catch (error) {
        console.error(`申请客户 ${customerId} 失败:`, error);
        results.failedCount++;
        results.failedCustomers.push({
          customerId,
          reason: '系统错误'
        });
      }
    }

    return results;
  }

  /**
   * 发送申请通知给园长
   */
  private async sendApplicationNotificationToPrincipal(
    applicationId: number,
    teacherId: number,
    customerId: number,
    kindergartenId?: number
  ) {
    try {
      // 获取教师信息
      const teacher = await User.findByPk(teacherId, {
        attributes: ['id', 'username', 'real_name']
      });

      // 获取客户信息
      const customer = await Parent.findByPk(customerId, {
        attributes: ['id', 'name', 'phone']
      });

      if (!teacher || !customer) {
        console.error('教师或客户信息不存在');
        return;
      }

      // 获取园长ID（简化处理：查找该幼儿园的园长）
      const principal = await User.findOne({
        where: {
          role: 'principal',
          ...(kindergartenId && { kindergarten_id: kindergartenId })
        },
        attributes: ['id']
      });

      if (!principal) {
        console.error('未找到园长');
        return;
      }

      // 创建通知
      await Notification.create({
        title: '客户申请通知',
        content: `教师 ${teacher.realName || teacher.username} 申请跟踪客户 ${(customer as any).user?.realName || (customer as any).user?.username || '未知客户'}（${(customer as any).user?.phone || '无电话'}）`,
        type: NotificationType.SYSTEM,
        status: NotificationStatus.UNREAD,
        userId: principal.id,
        sourceId: applicationId,
        sourceType: 'customer_application',
        senderId: teacherId
      });

      console.log(`✅ 已发送申请通知给园长 (ID: ${principal.id})`);
    } catch (error) {
      console.error('发送申请通知失败:', error);
    }
  }

  /**
   * 获取教师的申请记录
   */
  async getTeacherApplications(params: {
    teacherId: number;
    status?: string;
    page: number;
    pageSize: number;
  }) {
    const { teacherId, status, page, pageSize } = params;

    const where: any = { teacherId };
    if (status) {
      where.status = status;
    }

    const { rows, count } = await CustomerApplication.findAndCountAll({
      where,
      include: [
        {
          model: Parent,
          as: 'customer',
          attributes: ['id', 'name', 'phone', 'source', 'follow_status']
        },
        {
          model: User,
          as: 'principal',
          attributes: ['id', 'username', 'real_name']
        }
      ],
      order: [['appliedAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize
    });

    return {
      items: rows,
      total: count,
      page,
      pageSize
    };
  }

  /**
   * 获取园长待审批的申请列表
   */
  async getPrincipalApplications(params: {
    kindergartenId?: number;
    status?: string;
    teacherId?: number;
    customerId?: number;
    page: number;
    pageSize: number;
  }) {
    const { kindergartenId, status, teacherId, customerId, page, pageSize } = params;

    const where: any = {};
    if (kindergartenId) {
      where.kindergartenId = kindergartenId;
    }
    if (status) {
      where.status = status;
    }
    if (teacherId) {
      where.teacherId = teacherId;
    }
    if (customerId) {
      where.customerId = customerId;
    }

    const { rows, count } = await CustomerApplication.findAndCountAll({
      where,
      include: [
        {
          model: Parent,
          as: 'customer',
          attributes: ['id', 'name', 'phone', 'source', 'follow_status', 'assigned_teacher_id']
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'username', 'real_name']
        },
        {
          model: User,
          as: 'principal',
          attributes: ['id', 'username', 'real_name']
        }
      ],
      order: [['appliedAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize
    });

    return {
      items: rows,
      total: count,
      page,
      pageSize
    };
  }

  /**
   * 园长审批申请
   */
  async reviewApplication(params: {
    applicationId: number;
    principalId: number;
    action: 'approve' | 'reject';
    rejectReason?: string;
  }) {
    const { applicationId, principalId, action, rejectReason } = params;

    // 1. 查找申请记录
    const application = await CustomerApplication.findByPk(applicationId, {
      include: [
        {
          model: Parent,
          as: 'customer'
        },
        {
          model: User,
          as: 'teacher'
        }
      ]
    });

    if (!application) {
      throw new Error('申请记录不存在');
    }

    if (application.status !== CustomerApplicationStatus.PENDING) {
      throw new Error('该申请已被处理');
    }

    // 2. 更新申请状态
    application.status = action === 'approve' ? CustomerApplicationStatus.APPROVED : CustomerApplicationStatus.REJECTED;
    application.principalId = principalId;
    application.reviewedAt = new Date();
    if (action === 'reject' && rejectReason) {
      application.rejectReason = rejectReason;
    }
    await application.save();

    // 3. 如果同意，分配客户给教师
    if (action === 'approve') {
      const customer = await Parent.findByPk(application.customerId);
      if (customer) {
        customer.assignedTeacherId = application.teacherId;
        await customer.save();
      }
    }

    // 4. 发送审批结果通知给教师
    await this.sendReviewNotificationToTeacher(application, action, rejectReason);

    return application;
  }

  /**
   * 发送审批结果通知给教师
   */
  private async sendReviewNotificationToTeacher(
    application: CustomerApplication,
    action: 'approve' | 'reject',
    rejectReason?: string
  ) {
    try {
      const customer = application.customer || await Parent.findByPk(application.customerId);

      if (!customer) {
        console.error('客户信息不存在');
        return;
      }

      const title = action === 'approve' ? '客户申请已通过' : '客户申请已拒绝';
      const customerName = (customer as any).user?.realName || (customer as any).user?.username || '未知客户';
      const customerPhone = (customer as any).user?.phone || '无电话';
      const content = action === 'approve'
        ? `您申请的客户 ${customerName}（${customerPhone}） 已分配给您`
        : `您申请的客户 ${customerName}（${customerPhone}） 未通过审批${rejectReason ? `，原因：${rejectReason}` : ''}`;

      await Notification.create({
        title,
        content,
        type: NotificationType.SYSTEM,
        status: NotificationStatus.UNREAD,
        userId: application.teacherId,
        sourceId: application.id,
        sourceType: 'customer_application',
        senderId: application.principalId
      });

      console.log(`✅ 已发送审批结果通知给教师 (ID: ${application.teacherId})`);
    } catch (error) {
      console.error('发送审批结果通知失败:', error);
    }
  }

  /**
   * 批量审批申请
   */
  async batchReviewApplications(params: {
    applicationIds: number[];
    principalId: number;
    action: 'approve' | 'reject';
    rejectReason?: string;
  }) {
    const { applicationIds, principalId, action, rejectReason } = params;

    const results = {
      successCount: 0,
      failedCount: 0,
      failedApplications: [] as Array<{ applicationId: number; reason: string }>
    };

    for (const applicationId of applicationIds) {
      try {
        await this.reviewApplication({
          applicationId,
          principalId,
          action,
          rejectReason
        });
        results.successCount++;
      } catch (error: any) {
        console.error(`审批申请 ${applicationId} 失败:`, error);
        results.failedCount++;
        results.failedApplications.push({
          applicationId,
          reason: error.message || '系统错误'
        });
      }
    }

    return results;
  }

  /**
   * 获取申请详情
   */
  async getApplicationDetail(applicationId: number, userId: number) {
    const application = await CustomerApplication.findByPk(applicationId, {
      include: [
        {
          model: Parent,
          as: 'customer',
          attributes: ['id', 'name', 'phone', 'source', 'follow_status', 'assigned_teacher_id', 'created_at']
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'username', 'real_name', 'phone']
        },
        {
          model: User,
          as: 'principal',
          attributes: ['id', 'username', 'real_name']
        }
      ]
    });

    if (!application) {
      throw new Error('申请记录不存在');
    }

    // 权限检查：只有申请教师、审批园长或管理员可以查看
    if (application.teacherId !== userId && application.principalId !== userId) {
      // 这里可以添加更严格的权限检查
      console.warn(`用户 ${userId} 尝试查看不属于自己的申请 ${applicationId}`);
    }

    return application;
  }

  /**
   * 获取申请统计
   */
  async getApplicationStats(params: {
    userId: number;
    userRole?: string;
    kindergartenId?: number;
  }) {
    console.log('[getApplicationStats] 开始执行，参数:', JSON.stringify(params));
    
    // 防御性检查：确保 params 不为 null/undefined
    if (!params || typeof params !== 'object') {
      console.warn('[getApplicationStats] params为null/undefined，返回默认值');
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      };
    }

    const { userId, userRole, kindergartenId } = params;
    console.log('[getApplicationStats] 解构参数: userId=', userId, 'userRole=', userRole, 'kindergartenId=', kindergartenId);

    const stats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };

    // 根据角色查询不同的统计数据
    if (userRole === 'teacher') {
      // 教师：查询自己的申请统计
      const applications = await CustomerApplication.findAll({
        where: { teacherId: userId },
        attributes: ['status']
      });

      stats.total = applications.length;
      stats.pending = applications.filter(app => app.status === CustomerApplicationStatus.PENDING).length;
      stats.approved = applications.filter(app => app.status === CustomerApplicationStatus.APPROVED).length;
      stats.rejected = applications.filter(app => app.status === CustomerApplicationStatus.REJECTED).length;
    } else if (userRole === 'principal' || userRole === 'admin') {
      // 园长/管理员：查询待审批的申请统计
      const where: any = {};
      if (kindergartenId) {
        where.kindergartenId = kindergartenId;
      }
      console.log('[getApplicationStats] 准备执行 findAll， where:', JSON.stringify(where));
      console.log('[getApplicationStats] CustomerApplication 模型:', CustomerApplication ? '存在' : '不存在');
      console.log('[getApplicationStats] CustomerApplication.sequelize:', CustomerApplication.sequelize ? '存在' : '不存在');

      const applications = await CustomerApplication.findAll({
        where,
        attributes: ['status']
      });

      stats.total = applications.length;
      stats.pending = applications.filter(app => app.status === CustomerApplicationStatus.PENDING).length;
      stats.approved = applications.filter(app => app.status === CustomerApplicationStatus.APPROVED).length;
      stats.rejected = applications.filter(app => app.status === CustomerApplicationStatus.REJECTED).length;
    }

    return stats;
  }
}

