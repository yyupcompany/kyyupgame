/**
 * 录取通知服务
 */
import { Transaction, Op, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../../init';
import { AdmissionNotification, NotificationStatus, NotificationMethod } from '../../models/admission-notification.model';
import { AdmissionResult, AdmissionStatus } from '../../models/admission-result.model';
import { ParentStudentRelation } from '../../models/parent-student-relation.model';
import { User } from '../../models/user.model';
import { MessageTemplate } from '../../models/message-template.model';
import { ApiError } from '../../utils/apiError';



// 分页工具函数
const getPagination = (page: number, size: number) => {
  const limit = size ? +size : 10;
  const offset = page ? (page - 1) * limit : 0;
  return { limit, offset };
};

const getPagingData = (data: any[], count: number, page: number, limit: number) => {
  const totalItems = count;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    totalItems,
    data,
    totalPages,
    currentPage,
  };
};

/**
 * 录取通知服务类
 */
export class AdmissionNotificationService {
  /**
   * 创建录取通知
   * @param notificationData 通知数据
   * @param userId 当前用户ID
   * @returns 创建的通知
   */
  async createNotification(notificationData: InferCreationAttributes<AdmissionNotification>, userId: number): Promise<AdmissionNotification> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查录取结果是否存在
      const admission = await AdmissionResult.findByPk(notificationData.admissionId);
      if (!admission) {
        throw new ApiError(404, '录取结果不存在');
      }
      
      // 检查录取状态是否为已录取
      if (admission.status !== AdmissionStatus.ADMITTED && admission.status !== AdmissionStatus.CONFIRMED) {
        throw new ApiError(400, `当前录取状态(${admission.status})不允许发送通知`);
      }
      
      // 检查家长关系是否存在
      const parentRelation = await ParentStudentRelation.findByPk(notificationData.parentId);
      if (!parentRelation) {
        throw new ApiError(404, '家长关系不存在');
      }
      
      // 如果有模板ID，检查模板是否存在
      if (notificationData.templateId) {
        const template = await MessageTemplate.findByPk(notificationData.templateId);
        if (!template) {
          throw new ApiError(404, '消息模板不存在');
        }
      }
      
      // 创建通知
      const notification = await AdmissionNotification.create({
        ...notificationData,
        status: NotificationStatus.PENDING,
        createdBy: userId,
        updatedBy: userId,
      }, { transaction });
      
      await transaction.commit();
      
      return notification;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 获取通知详情
   * @param id 通知ID
   * @returns 通知详情
   */
  async getNotificationById(id: number): Promise<AdmissionNotification> {
    const notification = await AdmissionNotification.findByPk(id, {
      include: [
        {
          model: AdmissionResult,
          as: 'admissionResult',
        },
        {
          model: ParentStudentRelation,
          as: 'parentRelation',
          attributes: ['id'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'name'],
        },
        {
          model: MessageTemplate,
          as: 'template',
          attributes: ['id', 'name', 'content'],
        },
      ],
    });
    
    if (!notification) {
      throw new ApiError(404, '通知不存在');
    }
    
    return notification;
  }
  
  /**
   * 更新通知
   * @param id 通知ID
   * @param notificationData 通知数据
   * @param userId 当前用户ID
   * @returns 更新后的通知
   */
  async updateNotification(id: number, notificationData: Partial<InferCreationAttributes<AdmissionNotification>>, userId: number): Promise<AdmissionNotification> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查通知是否存在
      const notification = await AdmissionNotification.findByPk(id);
      if (!notification) {
        throw new ApiError(404, '通知不存在');
      }
      
      // 检查通知状态是否允许更新
      if (notification.status !== NotificationStatus.PENDING && notification.status !== NotificationStatus.FAILED) {
        throw new ApiError(400, `当前状态(${notification.status})不允许更新通知`);
      }
      
      // 如果更改了家长关系，检查家长关系是否存在
      if (notificationData.parentId && notificationData.parentId !== notification.parentId) {
        const parentRelation = await ParentStudentRelation.findByPk(notificationData.parentId);
        if (!parentRelation) {
          throw new ApiError(404, '家长关系不存在');
        }
      }
      
      // 如果更改了模板，检查模板是否存在
      if (notificationData.templateId && notificationData.templateId !== notification.templateId) {
        const template = await MessageTemplate.findByPk(notificationData.templateId);
        if (!template) {
          throw new ApiError(404, '消息模板不存在');
        }
      }
      
      // 更新通知
      await notification.update({
        ...notificationData,
        updatedBy: userId,
      }, { transaction });
      
      await transaction.commit();
      
      return this.getNotificationById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 删除通知
   * @param id 通知ID
   * @returns 是否删除成功
   */
  async deleteNotification(id: number): Promise<boolean> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查通知是否存在
      const notification = await AdmissionNotification.findByPk(id);
      if (!notification) {
        throw new ApiError(404, '通知不存在');
      }
      
      // 检查通知状态是否允许删除
      if (notification.status !== NotificationStatus.PENDING && notification.status !== NotificationStatus.FAILED) {
        throw new ApiError(400, `当前状态(${notification.status})不允许删除通知`);
      }
      
      // 删除通知
      await notification.destroy({ transaction });
      
      await transaction.commit();
      
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 获取通知列表
   * @param filters 过滤条件
   * @param page 页码
   * @param size 每页大小
   * @returns 通知列表
   */
  async getNotifications(filters: any, page: number, size: number): Promise<any> {
    const { limit, offset } = getPagination(page, size);
    
    const condition: any = {};
    
    // 添加过滤条件
    if (filters.studentName) {
      condition.studentName = { [Op.like]: `%${filters.studentName}%` };
    }
    
    if (filters.status) {
      condition.status = filters.status;
    }
    
    if (filters.method) {
      condition.method = filters.method;
    }
    
    if (filters.startDate) {
      condition.createdAt = { [Op.gte]: filters.startDate };
    }
    
    if (filters.endDate) {
      condition.createdAt = { ...condition.createdAt, [Op.lte]: filters.endDate };
    }
    
    const { count, rows } = await AdmissionNotification.findAndCountAll({
      where: condition,
      include: [
        {
          model: AdmissionResult,
          as: 'admissionResult',
        },
        {
          model: ParentStudentRelation,
          as: 'parentRelation',
          attributes: ['id'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
    
    return getPagingData(rows, count, page, limit);
  }
  
  /**
   * 发送通知
   * @param id 通知ID
   * @param userId 当前用户ID
   * @returns 发送后的通知
   */
  async sendNotification(id: number, userId: number): Promise<AdmissionNotification> {
    const transaction = await sequelize.transaction();
    
    try {
      const notification = await this.getNotificationById(id);
      
      // 检查状态
      if (notification.status !== NotificationStatus.PENDING) {
        throw new ApiError(400, `当前状态(${notification.status})不允许发送通知`);
      }
      
      // 更新状态为已发送
      await notification.update({
        status: NotificationStatus.SENT,
        sentTime: new Date(),
        updatedBy: userId,
      }, { transaction });
      
      // TODO: 实现真正的发送逻辑，如调用短信、邮件API
      
      await transaction.commit();
      
      return notification;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 标记为已送达
   * @param id 通知ID
   * @param userId 当前用户ID
   * @returns 更新后的通知
   */
  async markDelivered(id: number, userId: number): Promise<AdmissionNotification> {
    const transaction = await sequelize.transaction();
    
    try {
      const notification = await this.getNotificationById(id);
      
      // 检查状态
      if (notification.status !== NotificationStatus.SENT) {
        throw new ApiError(400, `当前状态(${notification.status})无法标记为已送达`);
      }
      
      await notification.update({
        status: NotificationStatus.DELIVERED,
        deliveredTime: new Date(),
        updatedBy: userId,
      }, { transaction });
      
      await transaction.commit();
      
      return notification;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 标记为已读
   * @param id 通知ID
   * @param userId 当前用户ID
   * @returns 更新后的通知
   */
  async markRead(id: number, userId: number): Promise<AdmissionNotification> {
    const transaction = await sequelize.transaction();
    
    try {
      const notification = await this.getNotificationById(id);
      
      await notification.update({
        status: NotificationStatus.READ,
        readTime: new Date(),
        updatedBy: userId,
      }, { transaction });
      
      await transaction.commit();
      
      return notification;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 记录回复
   * @param id 通知ID
   * @param responseData 回复数据
   * @param userId 当前用户ID
   * @returns 更新后的通知
   */
  async recordResponse(id: number, responseData: any, userId: number): Promise<AdmissionNotification> {
    const transaction = await sequelize.transaction();
    
    try {
      const notification = await this.getNotificationById(id);
      
      await notification.update({
        response: responseData.response,
        updatedBy: userId,
      }, { transaction });
      
      await transaction.commit();
      
      return notification;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  private async doSendNotification(notification: AdmissionNotification, transaction: any): Promise<boolean> {
    try {
      // 根据通知方式发送通知
      switch (notification.method) {
        case NotificationMethod.SMS:
          // 实现短信发送逻辑
          console.log(`发送短信通知给家长ID: ${notification.parentId}, 内容: ${notification.content}`);
          break;
        case NotificationMethod.EMAIL:
          // 实现邮件发送逻辑
          console.log(`发送邮件通知给家长ID: ${notification.parentId}, 内容: ${notification.content}`);
          break;
        case NotificationMethod.SYSTEM:
          // 实现系统通知发送逻辑
          console.log(`发送系统通知给家长ID: ${notification.parentId}, 内容: ${notification.content}`);
          break;
        default:
          console.warn(`未知的通知方式: ${notification.method}`);
          return false;
      }

      // 更新录取结果的通知日期和方式
      const admission = await AdmissionResult.findByPk(notification.admissionId, { transaction });
      if (admission) {
        await admission.update({
          notificationDate: new Date(),
          notificationMethod: notification.method,
          updatedBy: notification.updatedBy,
        }, { transaction });
      }

      return true;
    } catch (error) {
      console.error('发送通知失败:', error);
      return false;
    }
  }
}

// 导出服务实例
export default new AdmissionNotificationService(); 