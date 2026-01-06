/**
 * 活动计划服务
 */
import { Op } from 'sequelize';
import { sequelize } from '../../init';
import { Activity, ActivityStatus } from '../../models/activity.model';
import { Kindergarten } from '../../models/kindergarten.model';
import { EnrollmentPlan } from '../../models/enrollment-plan.model';
import { ActivityRegistration } from '../../models/activity-registration.model';
import { ApiError } from '../../utils/apiError';

// 活动类型枚举
export enum ActivityType {
  OPEN_DAY = 1,      // 开放日
  EXPERIENCE = 2,    // 体验课
  PARENT_CHILD = 3,  // 亲子活动
  ENROLLMENT = 4,    // 招生说明会
  PARENT_MEETING = 5, // 家长会
  FESTIVAL = 6,      // 节日活动
  OTHER = 7          // 其他
}

// 活动状态枚举

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
 * 活动计划服务类
 */
export class ActivityPlanService {
  /**
   * 创建活动计划
   * @param activityData 活动数据
   * @param userId 当前用户ID
   * @returns 创建的活动计划
   */
  async createActivityPlan(activityData: any, userId: number): Promise<Activity> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查幼儿园是否存在
      const kindergarten = await Kindergarten.findByPk(activityData.kindergartenId);
      if (!kindergarten) {
        throw new ApiError(404, '幼儿园不存在');
      }
      
      // 如果有招生计划ID，检查招生计划是否存在
      if (activityData.planId) {
        const plan = await EnrollmentPlan.findByPk(activityData.planId);
        if (!plan) {
          throw new ApiError(404, '招生计划不存在');
        }
      }
      
      // 设置初始状态
      let initialStatus = ActivityStatus.PLANNED;
      if (activityData.status !== undefined) {
        initialStatus = activityData.status;
      }
      
      // 处理报名时间：如果没有提供或为空，使用默认值
      let regStartTime: Date;
      let regEndTime: Date;
      const startTime = new Date(activityData.startTime);
      const endTime = new Date(activityData.endTime);

      if (activityData.registrationStartTime && activityData.registrationStartTime !== '') {
        regStartTime = new Date(activityData.registrationStartTime);
        if (isNaN(regStartTime.getTime())) {
          regStartTime = new Date(); // 默认为当前时间
        }
      } else {
        regStartTime = new Date(); // 默认为当前时间
      }

      if (activityData.registrationEndTime && activityData.registrationEndTime !== '') {
        regEndTime = new Date(activityData.registrationEndTime);
        if (isNaN(regEndTime.getTime())) {
          regEndTime = new Date(startTime.getTime() - 60 * 60 * 1000);
        }
      } else {
        regEndTime = new Date(startTime.getTime() - 60 * 60 * 1000);
      }
      
      // 创建活动计划 - 只提取Activity模型支持的有效字段
      const validActivityData: any = {
        kindergartenId: activityData.kindergartenId,
        planId: activityData.planId || null,
        title: activityData.title,
        activityType: activityData.activityType,
        coverImage: activityData.coverImage || null,
        startTime,
        endTime,
        location: activityData.location,
        capacity: activityData.capacity,
        registeredCount: 0,
        checkedInCount: 0,
        fee: activityData.fee || 0,
        description: activityData.description || null,
        agenda: activityData.agenda || null,
        registrationStartTime: regStartTime,
        registrationEndTime: regEndTime,
        needsApproval: activityData.needsApproval ?? false,
        status: initialStatus,
        remark: activityData.remark || null,
        creatorId: userId,
        updaterId: userId,
        // 海报和营销相关字段
        posterId: activityData.posterId || null,
        posterUrl: activityData.posterUrl || null,
        sharePosterUrl: activityData.sharePosterUrl || null,
        marketingConfig: activityData.marketingConfig || null,
        publishStatus: activityData.publishStatus ?? 0,
        shareCount: 0,
        viewCount: 0
      };

      console.log('📝 创建活动计划，有效字段:', validActivityData);
      
      // 使用 fields 选项严格限制插入的字段，防止任何额外字段（如 license_number）被插入
      const activity = await Activity.create(validActivityData, { 
        transaction,
        fields: [
          'kindergartenId', 'planId', 'title', 'activityType', 'coverImage',
          'startTime', 'endTime', 'location', 'capacity', 'registeredCount',
          'checkedInCount', 'fee', 'description', 'agenda', 
          'registrationStartTime', 'registrationEndTime', 'needsApproval',
          'status', 'remark', 'creatorId', 'updaterId',
          'posterId', 'posterUrl', 'sharePosterUrl', 'marketingConfig',
          'publishStatus', 'shareCount', 'viewCount'
        ]
      });
      
      await transaction.commit();
      
      return activity;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 获取活动计划详情
   * @param id 活动计划ID
   * @returns 活动计划详情
   */
  async getActivityPlanById(id: number): Promise<Activity> {
    const activity = await Activity.findByPk(id, {
      include: [
        {
          model: Kindergarten,
          as: 'kindergarten',
          attributes: ['id', 'name', 'address'],
        },
        {
          model: EnrollmentPlan,
          as: 'plan',
          attributes: ['id', 'title', 'year', 'semester'],
        },
      ],
    });
    
    if (!activity) {
      throw new ApiError(404, '活动计划不存在');
    }
    
    return activity;
  }
  
  /**
   * 更新活动计划
   * @param id 活动计划ID
   * @param activityData 活动数据
   * @param userId 当前用户ID
   * @returns 更新后的活动计划
   */
  async updateActivityPlan(id: number, activityData: any, userId: number): Promise<Activity> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查活动计划是否存在
      const activity = await Activity.findByPk(id);
      if (!activity) {
        throw new ApiError(404, '活动计划不存在');
      }
      
      // 检查活动状态是否允许更新
      if (activity.status === ActivityStatus.FINISHED || activity.status === ActivityStatus.CANCELLED) {
        throw new ApiError(400, '已结束或已取消的活动不能修改');
      }
      
      // 如果更改了幼儿园，检查幼儿园是否存在
      if (activityData.kindergartenId && activityData.kindergartenId !== activity.kindergartenId) {
        const kindergarten = await Kindergarten.findByPk(activityData.kindergartenId);
        if (!kindergarten) {
          throw new ApiError(404, '幼儿园不存在');
        }
      }
      
      // 如果更改了招生计划，检查招生计划是否存在
      if (activityData.planId && activityData.planId !== activity.planId) {
        const plan = await EnrollmentPlan.findByPk(activityData.planId);
        if (!plan) {
          throw new ApiError(404, '招生计划不存在');
        }
      }
      
      // 更新活动计划
      await activity.update({
        ...activityData,
        updaterId: userId,
      }, { transaction });
      
      await transaction.commit();
      
      return this.getActivityPlanById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 删除活动计划
   * @param id 活动计划ID
   * @returns 是否删除成功
   */
  async deleteActivityPlan(id: number): Promise<boolean> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查活动计划是否存在
      const activity = await Activity.findByPk(id);
      if (!activity) {
        throw new ApiError(404, '活动计划不存在');
      }
      
      // 检查是否有关联的报名记录
      const registrationCount = await ActivityRegistration.count({
        where: { activityId: id }
      });
      
      if (registrationCount > 0) {
        throw new ApiError(400, '该活动已有报名记录，不能删除');
      }
      
      // 删除活动计划
      await activity.destroy({ transaction });
      
      await transaction.commit();
      
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 获取活动计划列表
   * @param filters 过滤条件
   * @param page 页码
   * @param size 每页大小
   * @returns 活动计划列表
   */
  async getActivityPlans(filters: any, page: number, size: number): Promise<any> {
    const { limit, offset } = getPagination(page, size);
    
    const condition: any = {};
    
    // 添加过滤条件
    if (filters.title) {
      condition.title = { [Op.like]: `%${filters.title}%` };
    }
    
    if (filters.activityType) {
      condition.activityType = filters.activityType;
    }
    
    if (filters.status) {
      condition.status = filters.status;
    }
    
    if (filters.kindergartenId) {
      condition.kindergartenId = filters.kindergartenId;
    }
    
    if (filters.planId) {
      condition.planId = filters.planId;
    }
    
    if (filters.startTimeStart && filters.startTimeEnd) {
      condition.startTime = {
        [Op.between]: [filters.startTimeStart, filters.startTimeEnd],
      };
    } else if (filters.startTimeStart) {
      condition.startTime = { [Op.gte]: filters.startTimeStart };
    } else if (filters.startTimeEnd) {
      condition.startTime = { [Op.lte]: filters.startTimeEnd };
    }
    
    // 查询活动计划列表
    const { count, rows } = await Activity.findAndCountAll({
      where: condition,
      limit,
      offset,
      order: [['startTime', 'DESC']],
      include: [
        {
          model: Kindergarten,
          as: 'kindergarten',
          attributes: ['id', 'name'],
        },
        {
          model: EnrollmentPlan,
          as: 'plan',
          attributes: ['id', 'title'],
        },
      ],
    });
    
    return getPagingData(rows, count, page, limit);
  }
  
  /**
   * 更新活动状态
   * @param id 活动计划ID
   * @param status 新状态
   * @param userId 当前用户ID
   * @returns 更新后的活动计划
   */
  async updateActivityStatus(id: number, status: ActivityStatus, userId: number): Promise<Activity> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查活动计划是否存在
      const activity = await Activity.findByPk(id);
      if (!activity) {
        throw new ApiError(404, '活动计划不存在');
      }
      
      // 检查状态转换是否有效
      if (status === ActivityStatus.FINISHED && activity.status !== ActivityStatus.IN_PROGRESS) {
        throw new ApiError(400, '只有进行中的活动才能标记为已结束');
      }
      
      if (status === ActivityStatus.IN_PROGRESS && activity.status !== ActivityStatus.REGISTRATION_OPEN && activity.status !== ActivityStatus.PLANNED) {
        throw new ApiError(400, '只有报名中或计划中的活动才能标记为进行中');
      }
      
      // 更新状态
      await activity.update({
        status,
        updaterId: userId,
      }, { transaction });
      
      await transaction.commit();
      
      return this.getActivityPlanById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 取消活动
   * @param id 活动计划ID
   * @param cancelReason 取消原因
   * @param userId 当前用户ID
   * @returns 更新后的活动计划
   */
  async cancelActivity(id: number, cancelReason: string, userId: number): Promise<Activity> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查活动计划是否存在
      const activity = await Activity.findByPk(id);
      if (!activity) {
        throw new ApiError(404, '活动计划不存在');
      }
      
      // 检查活动状态是否允许取消
      if (activity.status === ActivityStatus.FINISHED || activity.status === ActivityStatus.CANCELLED) {
        throw new ApiError(400, '已结束或已取消的活动不能再次取消');
      }
      
      // 更新状态为已取消
      await activity.update({
        status: ActivityStatus.CANCELLED,
        remark: cancelReason,
        updaterId: userId,
      }, { transaction });
      
      await transaction.commit();
      
      return this.getActivityPlanById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 获取活动统计数据
   * @param id 活动计划ID
   * @returns 统计数据
   */
  async getActivityStatistics(id: number): Promise<any> {
    // 检查活动计划是否存在
    const activity = await Activity.findByPk(id);
    if (!activity) {
      throw new ApiError(404, '活动计划不存在');
    }
    
    // 获取报名人数
    const registrationCount = await ActivityRegistration.count({
      where: { activityId: id }
    });
    
    // 获取签到人数
    const checkedInCount = await ActivityRegistration.count({
      where: { 
        activityId: id,
        checkInTime: { [Op.not]: null }
      }
    });
    
    // 获取转化人数
    const conversionCount = await ActivityRegistration.count({
      where: { 
        activityId: id,
        isConversion: 1
      }
    });
    
    // 计算签到率
    const checkInRate = registrationCount > 0 ? (checkedInCount / registrationCount) * 100 : 0;
    
    // 计算转化率
    const conversionRate = registrationCount > 0 ? (conversionCount / registrationCount) * 100 : 0;
    
    // 计算容量使用率
    const capacityUsageRate = activity.capacity > 0 ? (registrationCount / activity.capacity) * 100 : 0;
    
    return {
      totalCapacity: activity.capacity,
      registrationCount,
      checkedInCount,
      conversionCount,
      checkInRate: parseFloat(checkInRate.toFixed(2)),
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      capacityUsageRate: parseFloat(capacityUsageRate.toFixed(2)),
    };
  }
}

// 导出服务实例
export default new ActivityPlanService(); 