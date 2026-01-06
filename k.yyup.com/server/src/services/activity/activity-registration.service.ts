import { Op, QueryTypes, Transaction } from 'sequelize';
import { sequelize } from '../../init';
import { Activity } from '../../models/activity.model';
import { ActivityRegistration } from '../../models/activity-registration.model';
import { Parent } from '../../models/parent.model';
import { Student } from '../../models/student.model';
import { ApiError } from '../../utils/apiError';
import { PaginationOptions, PaginationResult, paginate } from '../../utils/pagination';

/**
 * 活动报名服务类
 * 提供活动报名的创建、查询、更新、删除、审核和确认等功能
 */
export class ActivityRegistrationService {
  /**
   * 创建活动报名
   * @param data 活动报名数据
   * @param userId 当前用户ID
   * @returns 创建的活动报名记录
   */
  public async createRegistration(data: {
    activityId: number;
    parentId?: number;
    studentId?: number;
    contactName: string;
    contactPhone: string;
    childName?: string;
    childAge?: number;
    childGender?: number;
    attendeeCount: number;
    specialNeeds?: string;
    source?: string;
    // 新增：分享追踪参数
    shareBy?: number;
    shareType?: string;
  }, userId?: number): Promise<ActivityRegistration> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查活动是否存在且可报名
      const activity = await Activity.findByPk(data.activityId);
      if (!activity) {
        throw new ApiError(404, '活动不存在');
      }
      
      // 检查活动是否在报名期间
      const now = new Date();
      if (now < activity.registrationStartTime || now > activity.registrationEndTime) {
        throw new ApiError(400, '当前不在活动报名时间内');
      }
      
      // 检查活动是否已满
      if (activity.registeredCount >= activity.capacity) {
        throw new ApiError(400, '活动名额已满');
      }

      // 确定来源类型
      const sourceType = this.determineSourceType(data.shareType, data.source);

      // 构建来源详情
      const sourceDetail = {
        activityId: activity.id,
        activityTitle: activity.title,
        activityType: activity.activityType,
        registrationTime: new Date().toISOString(),
        shareBy: data.shareBy,
        shareType: data.shareType,
        channel: data.source
      };

      // 创建报名记录
      const registration = await ActivityRegistration.create({
        ...data,
        registrationTime: new Date(),
        status: activity.needsApproval ? 0 : 1, // 如果活动需要审核，状态为待审核，否则为已确认
        isConversion: false, // 默认未转化
        sourceType,
        sourceDetail,
        autoAssigned: !!data.shareBy, // 如果有分享者，标记为自动分配
        creatorId: userId,
        updaterId: userId
      }, { transaction });

      // 自动加入客户池
      await this.addToCustomerPool({
        registration,
        activity,
        shareBy: data.shareBy,
        shareType: data.shareType,
        sourceType,
        sourceDetail
      }, transaction);

      // 更新活动报名人数
      await activity.increment('registeredCount', { transaction });

      await transaction.commit();
      return registration;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 获取活动报名详情
   * @param id 报名ID
   * @returns 报名详情
   */
  public async getRegistrationById(id: number): Promise<ActivityRegistration> {
    const registration = await ActivityRegistration.findByPk(id, {
      include: [
        { model: Activity },
        { model: Parent },
        { model: Student }
      ]
    });
    
    if (!registration) {
      throw new ApiError(404, '报名记录不存在');
    }
    
    return registration;
  }
  
  /**
   * 更新活动报名
   * @param id 报名ID
   * @param data 更新数据
   * @param userId 当前用户ID
   * @returns 更新后的报名记录
   */
  public async updateRegistration(
    id: number,
    data: Partial<{
      contactName: string;
      contactPhone: string;
      childName: string;
      childAge: number;
      childGender: number;
      attendeeCount: number;
      specialNeeds: string;
      source: string;
      remark: string;
    }>,
    userId?: number
  ): Promise<ActivityRegistration> {
    const registration = await this.getRegistrationById(id);
    
    // 只有待审核或已确认状态的报名可以更新
    if (![0, 1].includes(registration.status)) {
      throw new ApiError(400, '当前状态不允许更新报名信息');
    }
    
    await registration.update({
      ...data,
      updaterId: userId
    });
    
    return registration;
  }
  
  /**
   * 删除活动报名
   * @param id 报名ID
   * @param userId 当前用户ID
   * @returns 是否成功
   */
  public async deleteRegistration(id: number, userId?: number): Promise<boolean> {
    const transaction = await sequelize.transaction();
    
    try {
      const registration = await this.getRegistrationById(id);
      const activity = await Activity.findByPk(registration.activityId);
      
      if (!activity) {
        throw new ApiError(404, '活动不存在');
      }
      
      // 更新活动报名人数
      if ([0, 1].includes(registration.status)) {
        await activity.decrement('registeredCount', { transaction });
      }
      
      // 软删除报名记录
      await registration.update({
        updaterId: userId
      }, { transaction });
      await registration.destroy({ transaction });
      
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 审核活动报名
   * @param id 报名ID
   * @param approved 是否通过
   * @param reason 拒绝原因
   * @param userId 当前用户ID
   * @returns 更新后的报名记录
   */
  public async reviewRegistration(
    id: number,
    approved: boolean,
    reason?: string,
    userId?: number
  ): Promise<ActivityRegistration> {
    const registration = await this.getRegistrationById(id);
    
    // 只有待审核状态的报名可以审核
    if (registration.status !== 0) {
      throw new ApiError(400, '只有待审核状态的报名可以审核');
    }
    
    await registration.update({
      status: approved ? 1 : 2, // 1:已确认 2:已拒绝
      remark: approved ? registration.remark : (reason || '报名被拒绝'),
      updaterId: userId
    });
    
    return registration;
  }
  
  /**
   * 取消活动报名
   * @param id 报名ID
   * @param reason 取消原因
   * @param userId 当前用户ID
   * @returns 更新后的报名记录
   */
  public async cancelRegistration(
    id: number,
    reason?: string,
    userId?: number
  ): Promise<ActivityRegistration> {
    const transaction = await sequelize.transaction();
    
    try {
      const registration = await this.getRegistrationById(id);
      
      // 只有待审核或已确认状态的报名可以取消
      if (![0, 1].includes(registration.status)) {
        throw new ApiError(400, '当前状态不允许取消报名');
      }
      
      const activity = await Activity.findByPk(registration.activityId);
      if (!activity) {
        throw new ApiError(404, '活动不存在');
      }
      
      // 更新报名状态
      await registration.update({
        status: 3, // 已取消
        remark: reason || '报名已取消',
        updaterId: userId
      }, { transaction });
      
      // 更新活动报名人数
      await activity.decrement('registeredCount', { transaction });
      
      await transaction.commit();
      return registration;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 签到
   * @param id 报名ID
   * @param location 签到地点
   * @param userId 当前用户ID
   * @returns 更新后的报名记录
   */
  public async checkIn(
    id: number,
    location: string,
    userId?: number
  ): Promise<ActivityRegistration> {
    const transaction = await sequelize.transaction();
    
    try {
      const registration = await this.getRegistrationById(id);
      
      // 只有已确认状态的报名可以签到
      if (registration.status !== 1) {
        throw new ApiError(400, '只有已确认状态的报名可以签到');
      }
      
      const activity = await Activity.findByPk(registration.activityId);
      if (!activity) {
        throw new ApiError(404, '活动不存在');
      }
      
      // 更新报名状态
      await registration.update({
        status: 4, // 已签到
        checkInTime: new Date(),
        checkInLocation: location,
        updaterId: userId
      }, { transaction });
      
      // 更新活动签到人数
      await activity.increment('checkedInCount', { transaction });
      
      await transaction.commit();
      return registration;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 标记为未出席
   * @param id 报名ID
   * @param userId 当前用户ID
   * @returns 更新后的报名记录
   */
  public async markAsAbsent(
    id: number,
    userId?: number
  ): Promise<ActivityRegistration> {
    const registration = await this.getRegistrationById(id);
    
    // 只有已确认状态的报名可以标记为未出席
    if (registration.status !== 1) {
      throw new ApiError(400, '只有已确认状态的报名可以标记为未出席');
    }
    
    await registration.update({
      status: 5, // 未出席
      updaterId: userId
    });
    
    return registration;
  }
  
  /**
   * 记录反馈
   * @param id 报名ID
   * @param feedback 反馈内容
   * @param userId 当前用户ID
   * @returns 更新后的报名记录
   */
  public async recordFeedback(
    id: number,
    feedback: string,
    userId?: number
  ): Promise<ActivityRegistration> {
    const registration = await this.getRegistrationById(id);
    
    // 只有已签到状态的报名可以记录反馈
    if (registration.status !== 4) {
      throw new ApiError(400, '只有已签到状态的报名可以记录反馈');
    }
    
    await registration.update({
      feedback,
      updaterId: userId
    });
    
    return registration;
  }
  
  /**
   * 标记为转化
   * @param id 报名ID
   * @param userId 当前用户ID
   * @returns 更新后的报名记录
   */
  public async markAsConverted(
    id: number,
    userId?: number
  ): Promise<ActivityRegistration> {
    const registration = await this.getRegistrationById(id);
    
    await registration.update({
      isConversion: true, // 已转化
      updaterId: userId
    });
    
    return registration;
  }
  
  /**
   * 获取活动报名列表
   * @param options 查询选项
   * @returns 分页结果
   */
  public async getRegistrations(options: {
    page?: number;
    limit?: number;
    activityId?: number;
    parentId?: number;
    studentId?: number;
    contactName?: string;
    contactPhone?: string;
    status?: number;
    isConversion?: number;
  }): Promise<PaginationResult<ActivityRegistration>> {
    const {
      page = 1,
      limit = 10,
      activityId,
      parentId,
      studentId,
      contactName,
      contactPhone,
      status,
      isConversion
    } = options;
    
    const where: any = {};
    
    if (activityId !== undefined) {
      where.activityId = activityId;
    }
    
    if (parentId !== undefined) {
      where.parentId = parentId;
    }
    
    if (studentId !== undefined) {
      where.studentId = studentId;
    }
    
    if (contactName) {
      where.contactName = { [Op.like]: `%${contactName}%` };
    }
    
    if (contactPhone) {
      where.contactPhone = { [Op.like]: `%${contactPhone}%` };
    }
    
    if (status !== undefined) {
      where.status = status;
    }
    
    if (isConversion !== undefined) {
      where.isConversion = isConversion;
    }
    
    const paginationOptions: PaginationOptions = {
      page,
      limit,
      where,
      include: [
        { model: Activity, attributes: ['id', 'title', 'activityType', 'startTime', 'endTime'] }
      ],
      order: [['createdAt', 'DESC']]
    };
    
    return paginate<ActivityRegistration>(ActivityRegistration, paginationOptions);
  }
  
  /**
   * 获取活动的报名统计数据
   * @param activityId 活动ID
   * @returns 统计数据
   */
  public async getActivityRegistrationStats(activityId: number): Promise<{
    totalRegistrations: number;
    confirmedRegistrations: number;
    rejectedRegistrations: number;
    cancelledRegistrations: number;
    checkedInRegistrations: number;
    absentRegistrations: number;
    conversionCount: number;
    conversionRate: number;
  }> {
    // 检查活动是否存在
    const activity = await Activity.findByPk(activityId);
    if (!activity) {
      throw new ApiError(404, '活动不存在');
    }
    
    // 获取各状态的报名数量
    const totalRegistrations = await ActivityRegistration.count({ where: { activityId } });
    const confirmedRegistrations = await ActivityRegistration.count({ where: { activityId, status: 1 } });
    const rejectedRegistrations = await ActivityRegistration.count({ where: { activityId, status: 2 } });
    const cancelledRegistrations = await ActivityRegistration.count({ where: { activityId, status: 3 } });
    const checkedInRegistrations = await ActivityRegistration.count({ where: { activityId, status: 4 } });
    const absentRegistrations = await ActivityRegistration.count({ where: { activityId, status: 5 } });
    const conversionCount = await ActivityRegistration.count({ where: { activityId, isConversion: 1 } });
    
    // 计算转化率
    const conversionRate = totalRegistrations > 0 ? (conversionCount / totalRegistrations) * 100 : 0;
    
    return {
      totalRegistrations,
      confirmedRegistrations,
      rejectedRegistrations,
      cancelledRegistrations,
      checkedInRegistrations,
      absentRegistrations,
      conversionCount,
      conversionRate
    };
  }

  /**
   * 确定来源类型
   * @param shareType 分享类型
   * @param source 来源
   * @returns 来源类型
   */
  private determineSourceType(shareType?: string, source?: string): string {
    if (shareType === 'teacher') {
      return 'ACTIVITY_ONLINE'; // 老师分享的线上活动
    } else if (shareType === 'principal') {
      return 'ACTIVITY_ONLINE'; // 园长分享的线上活动
    } else if (shareType === 'qrcode') {
      return 'ACTIVITY_OFFLINE'; // 二维码扫描，可能是线下活动
    } else if (source === 'offline') {
      return 'ACTIVITY_OFFLINE'; // 线下活动
    } else {
      return 'ACTIVITY_ONLINE'; // 默认线上活动
    }
  }

  /**
   * 自动加入客户池
   * @param params 参数
   * @param transaction 事务
   */
  private async addToCustomerPool(params: {
    registration: ActivityRegistration;
    activity: Activity;
    shareBy?: number;
    shareType?: string;
    sourceType: string;
    sourceDetail: any;
  }, transaction: Transaction): Promise<void> {
    const { registration, activity, shareBy, shareType, sourceType, sourceDetail } = params;

    try {
      // 1. 检查客户是否已存在（通过手机号）
      const existingCustomer = await sequelize.query(
        `SELECT id, teacher_id FROM teacher_customers
         WHERE phone = ? AND deleted_at IS NULL
         LIMIT 1`,
        {
          replacements: [registration.contactPhone],
          type: QueryTypes.SELECT,
          transaction
        }
      );

      if (existingCustomer && existingCustomer.length > 0) {
        // 客户已存在
        const customer = existingCustomer[0] as any;

        // 添加跟进记录
        await sequelize.query(
          `INSERT INTO parent_followups
           (parent_id, content, followup_date, followup_type, result, created_by, created_at, updated_at)
           VALUES (?, ?, NOW(), 'ACTIVITY', 'NEW', ?, NOW(), NOW())`,
          {
            replacements: [
              customer.id,
              `参加活动报名 - ${activity.title}（活动ID: ${activity.id}）`,
              shareBy || 1
            ],
            type: QueryTypes.INSERT,
            transaction
          }
        );

        console.log(`✅ 客户已存在，添加跟进记录 - 客户ID: ${customer.id}`);
      } else {
        // 新客户，创建客户记录
        const assignedTeacherId = shareBy || null; // 分配给分享者

        const [insertResult] = await sequelize.query(
          `INSERT INTO teacher_customers
           (teacher_id, customer_name, phone, gender, child_name, child_age,
            source, status, source_type, source_id, source_detail,
            auto_assigned, assign_date, assigned_by, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'NEW', ?, ?, ?, ?, NOW(), ?, NOW(), NOW())`,
          {
            replacements: [
              assignedTeacherId,
              registration.contactName,
              registration.contactPhone,
              registration.childGender || 1,
              registration.childName || '待填写',
              registration.childAge || 36,
              shareType || 'ACTIVITY',
              sourceType,
              registration.id,
              JSON.stringify(sourceDetail),
              !!shareBy, // 是否自动分配
              shareBy || 1
            ],
            type: QueryTypes.INSERT,
            transaction
          }
        );

        const customerId = (insertResult as any);
        console.log(`✅ 创建新客户记录 - 客户ID: ${customerId}, 分配给老师ID: ${assignedTeacherId}`);

        // 如果有分享者，发送通知（TODO: 实现通知功能）
        // if (shareBy) {
        //   await this.notifyTeacher(shareBy, customerId, activity);
        // }
      }
    } catch (error) {
      console.error('❌ 加入客户池失败:', error);
      // 不抛出错误，避免影响报名流程
    }
  }
}