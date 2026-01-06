import { Op } from 'sequelize';
import { sequelize } from '../../init';
import { Activity } from '../../models/activity.model';
import { ActivityRegistration } from '../../models/activity-registration.model';
import { ApiError } from '../../utils/apiError';
import { PaginationOptions, PaginationResult, paginate } from '../../utils/pagination';

/**
 * 活动签到服务类
 * 提供活动签到的创建、查询、统计等功能
 */
export class ActivityCheckinService {
  /**
   * 签到
   * @param registrationId 报名ID
   * @param location 签到地点
   * @param userId 当前用户ID
   * @returns 更新后的报名记录
   */
  public async checkIn(
    registrationId: number,
    location: string,
    userId?: number
  ): Promise<ActivityRegistration> {
    const transaction = await sequelize.transaction();
    
    try {
      // 查找报名记录
      const registration = await ActivityRegistration.findByPk(registrationId);
      if (!registration) {
        throw new ApiError(404, '报名记录不存在');
      }
      
      // 只有已确认状态的报名可以签到
      if (registration.status !== 1) {
        throw new ApiError(400, '只有已确认状态的报名可以签到');
      }
      
      // 查找活动
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
   * 批量签到
   * @param registrationIds 报名ID列表
   * @param location 签到地点
   * @param userId 当前用户ID
   * @returns 签到成功的数量
   */
  public async batchCheckIn(
    registrationIds: number[],
    location: string,
    userId?: number
  ): Promise<{ total: number; success: number; failed: number; errors: any[] }> {
    let successCount = 0;
    let failedCount = 0;
    const errors: any[] = [];
    
    // 逐个处理签到
    for (const registrationId of registrationIds) {
      try {
        await this.checkIn(registrationId, location, userId);
        successCount++;
      } catch (error) {
        failedCount++;
        errors.push({
          registrationId,
          error: error instanceof ApiError ? error.message : '签到失败'
        });
      }
    }
    
    return {
      total: registrationIds.length,
      success: successCount,
      failed: failedCount,
      errors
    };
  }
  
  /**
   * 获取活动签到列表
   * @param activityId 活动ID
   * @param options 查询选项
   * @returns 签到列表
   */
  public async getCheckins(
    activityId: number,
    options: {
      page?: number;
      limit?: number;
      contactName?: string;
      contactPhone?: string;
      checkInTimeStart?: Date;
      checkInTimeEnd?: Date;
    }
  ): Promise<PaginationResult<ActivityRegistration>> {
    const {
      page = 1,
      limit = 10,
      contactName,
      contactPhone,
      checkInTimeStart,
      checkInTimeEnd
    } = options;
    
    // 构建查询条件
    const where: any = {
      activityId,
      status: 4, // 已签到
    };
    
    if (contactName) {
      where.contactName = { [Op.like]: `%${contactName}%` };
    }
    
    if (contactPhone) {
      where.contactPhone = { [Op.like]: `%${contactPhone}%` };
    }
    
    if (checkInTimeStart && checkInTimeEnd) {
      where.checkInTime = { [Op.between]: [checkInTimeStart, checkInTimeEnd] };
    } else if (checkInTimeStart) {
      where.checkInTime = { [Op.gte]: checkInTimeStart };
    } else if (checkInTimeEnd) {
      where.checkInTime = { [Op.lte]: checkInTimeEnd };
    }
    
    // 执行分页查询
    const paginationOptions: PaginationOptions = {
      page,
      limit,
      where,
      order: [['checkInTime', 'DESC']],
      include: [
        {
          model: Activity,
          attributes: ['id', 'title', 'activityType', 'startTime', 'endTime']
        }
      ]
    };
    
    return paginate<ActivityRegistration>(ActivityRegistration, paginationOptions);
  }
  
  /**
   * 获取活动签到统计数据
   * @param activityId 活动ID
   * @returns 签到统计数据
   */
  public async getCheckinStats(activityId: number): Promise<{
    totalRegistrations: number;
    checkedInCount: number;
    checkInRate: number;
    hourlyDistribution: { hour: number; count: number }[];
    timeDistribution: { timeRange: string; count: number }[];
  }> {
    // 检查活动是否存在
    const activity = await Activity.findByPk(activityId);
    if (!activity) {
      throw new ApiError(404, '活动不存在');
    }
    
    // 获取报名总数和签到数
    const totalRegistrations = await ActivityRegistration.count({
      where: { activityId }
    });
    
    const checkedInCount = await ActivityRegistration.count({
      where: { activityId, status: 4 }
    });
    
    // 计算签到率
    const checkInRate = totalRegistrations > 0 
      ? parseFloat(((checkedInCount / totalRegistrations) * 100).toFixed(2))
      : 0;
    
    // 获取按小时分布的签到数据
    const hourlyCheckins = await ActivityRegistration.findAll({
      attributes: [
        [sequelize.fn('HOUR', sequelize.col('checkInTime')), 'hour'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        activityId,
        status: 4,
        checkInTime: { [Op.not]: null }
      },
      group: [sequelize.fn('HOUR', sequelize.col('checkInTime'))],
      raw: true
    });
    
    // 格式化小时分布数据
    const hourlyDistribution = hourlyCheckins.map((item: any) => ({
      hour: parseInt(item.hour),
      count: parseInt(item.count)
    }));
    
    // 按时间段分布
    const timeRanges = [
      { label: '活动开始前', start: null, end: activity.startTime },
      { label: '活动前30分钟', start: new Date(activity.startTime.getTime() - 30 * 60 * 1000), end: activity.startTime },
      { label: '活动开始后30分钟', start: activity.startTime, end: new Date(activity.startTime.getTime() + 30 * 60 * 1000) },
      { label: '活动中', start: activity.startTime, end: activity.endTime },
      { label: '活动结束后', start: activity.endTime, end: null }
    ];
    
    // 获取各时间段的签到数据
    const timeDistribution = await Promise.all(
      timeRanges.map(async (range) => {
        const whereCondition: any = { activityId, status: 4, checkInTime: { [Op.not]: null } };
        
        if (range.start && range.end) {
          whereCondition.checkInTime = { [Op.between]: [range.start, range.end] };
        } else if (range.start) {
          whereCondition.checkInTime = { [Op.gte]: range.start };
        } else if (range.end) {
          whereCondition.checkInTime = { [Op.lt]: range.end };
        }
        
        const count = await ActivityRegistration.count({ where: whereCondition });
        
        return {
          timeRange: range.label,
          count
        };
      })
    );
    
    return {
      totalRegistrations,
      checkedInCount,
      checkInRate,
      hourlyDistribution,
      timeDistribution
    };
  }
  
  /**
   * 导出签到数据
   * @param activityId 活动ID
   * @returns 签到数据数组
   */
  public async exportCheckinData(activityId: number): Promise<any[]> {
    // 检查活动是否存在
    const activity = await Activity.findByPk(activityId);
    if (!activity) {
      throw new ApiError(404, '活动不存在');
    }
    
    // 获取所有签到记录
    const checkins = await ActivityRegistration.findAll({
      where: {
        activityId,
        status: 4,
        checkInTime: { [Op.not]: null }
      },
      order: [['checkInTime', 'ASC']],
      raw: true
    });
    
    // 格式化导出数据
    return checkins.map((checkin: any, index) => ({
      序号: index + 1,
      联系人姓名: checkin.contactName,
      联系电话: checkin.contactPhone,
      孩子姓名: checkin.childName || '',
      孩子年龄: checkin.childAge || '',
      孩子性别: checkin.childGender === 1 ? '男' : checkin.childGender === 2 ? '女' : '未知',
      参加人数: checkin.attendeeCount,
      签到时间: checkin.checkInTime ? new Date(checkin.checkInTime).toLocaleString() : '',
      签到地点: checkin.checkInLocation || '',
      特殊需求: checkin.specialNeeds || '',
      来源渠道: checkin.source || '',
      反馈: checkin.feedback || '',
      是否转化: checkin.isConversion === 1 ? '是' : '否'
    }));
  }
  
  /**
   * 根据手机号查找报名记录并签到
   * @param activityId 活动ID
   * @param phone 手机号
   * @param location 签到地点
   * @param userId 当前用户ID
   * @returns 签到结果
   */
  public async checkInByPhone(
    activityId: number,
    phone: string,
    location: string,
    userId?: number
  ): Promise<ActivityRegistration> {
    // 查找报名记录
    const registration = await ActivityRegistration.findOne({
      where: {
        activityId,
        contactPhone: phone,
        status: 1 // 已确认
      }
    });
    
    if (!registration) {
      throw new ApiError(404, '未找到匹配的报名记录或该记录不是已确认状态');
    }
    
    // 执行签到
    return this.checkIn(registration.id, location, userId);
  }
} 