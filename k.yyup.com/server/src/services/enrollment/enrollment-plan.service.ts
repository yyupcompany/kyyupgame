/**
 * 招生计划服务
 * 处理与招生计划相关的业务逻辑
 */
import { 
  EnrollmentPlan,
  EnrollmentPlanStatus,
  Semester
} from '../../models/enrollment-plan.model';
import { EnrollmentPlanClass } from '../../models/enrollment-plan-class.model';
import { EnrollmentPlanAssignee } from '../../models/enrollment-plan-assignee.model';
import { EnrollmentPlanTracking } from '../../models/enrollment-plan-tracking.model';
import { User } from '../../models/user.model';
import { Class } from '../../models/class.model';
import { 
  CreateEnrollmentPlanDto,
  UpdateEnrollmentPlanDto,
  EnrollmentPlanFilterParams,
  EnrollmentPlanResponse,
  EnrollmentPlanListResponse,
  EnrollmentPlanDetailResponse,
  EnrollmentPlanClassDto,
  EnrollmentPlanAssigneeDto,
  EnrollmentPlanStatisticsResponse,
  EnrollmentPlanTrackingFilterParams
} from '../../types/enrollment-plan';
import { ApiError } from '../../utils/apiError';
import { Op, Sequelize } from 'sequelize';
import { sequelize } from '../../init';

export class EnrollmentPlanService {
  /**
   * 创建招生计划
   * @param data 招生计划数据
   * @param userId 当前用户ID
   * @returns 创建的招生计划
   */
  public async create(data: CreateEnrollmentPlanDto, userId: number): Promise<EnrollmentPlan> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查同一年度同一学期是否已有计划
      const existingPlan = await EnrollmentPlan.findOne({
        where: {
          year: data.year,
          semester: data.term === '春季' ? Semester.SPRING : Semester.AUTUMN // 将term转换为semester
        },
        transaction
      });
      
      if (existingPlan) {
        throw ApiError.badRequest(`${data.year}年${data.term}已有招生计划`, 'PLAN_EXISTS');
      }

      // 创建招生计划
      const plan = await EnrollmentPlan.create({
        title: data.name,
        year: data.year,
        semester: data.term === '春季' ? Semester.SPRING : Semester.AUTUMN, // 将term转换为semester
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        targetCount: data.targetCount,
        status: data.status === 'draft' ? EnrollmentPlanStatus.DRAFT : 
                (data.status === 'active' ? EnrollmentPlanStatus.IN_PROGRESS : 
                (data.status === 'completed' ? EnrollmentPlanStatus.FINISHED : EnrollmentPlanStatus.CANCELLED)), // 状态转换
        description: data.description,
        creatorId: userId,
        kindergartenId: 1 // 默认值，实际应从上下文获取
      }, { transaction });

      // 如果有班级IDs，创建关联
      const classIds = data.classIds || [];
      if (classIds.length > 0) {
        const classAssociations = classIds.map(classId => ({
          planId: plan.id,
          classId,
          quota: Math.floor(data.targetCount / classIds.length) // 平均分配名额
        }));
        
        await EnrollmentPlanClass.bulkCreate(classAssociations as any, { transaction });
      }

      // 如果有负责人IDs，创建关联
      if (data.assigneeIds && data.assigneeIds.length > 0) {
        const assigneeAssociations = data.assigneeIds.map((assigneeId, index) => ({
          planId: plan.id,
          assigneeId,
          role: index === 0 ? 'primary' : 'secondary' // 第一个为主负责人
        }));
        
        await EnrollmentPlanAssignee.bulkCreate(assigneeAssociations as any, { transaction });
      }

      await transaction.commit();
      return plan;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('创建招生计划失败', 'PLAN_CREATE_ERROR');
    }
  }

  /**
   * 获取招生计划列表
   * @param filters 过滤参数
   * @returns 招生计划列表和分页信息
   */
  public async list(filters: EnrollmentPlanFilterParams): Promise<EnrollmentPlanListResponse> {
    const { 
      page = 1, 
      pageSize = 10, 
      keyword,
      year,
      term,
      status,
      startDateFrom,
      startDateTo,
      endDateFrom,
      endDateTo,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = filters;
    
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    // 构建查询条件
    const where: any = {
      deletedAt: null // 只查询未删除的记录
    };
    
    if (keyword) {
      where.title = { [Op.like]: `%${keyword}%` };
    }
    
    if (year) {
      where.year = year;
    }
    
    if (term) {
      where.semester = term === '春季' ? Semester.SPRING : Semester.AUTUMN; // 将term转换为semester
    }
    
    if (status) {
      where.status = status === 'draft' ? EnrollmentPlanStatus.DRAFT : 
                    (status === 'active' ? EnrollmentPlanStatus.IN_PROGRESS : 
                    (status === 'completed' ? EnrollmentPlanStatus.FINISHED : EnrollmentPlanStatus.CANCELLED)); // 状态转换
    }
    
    // 开始日期范围查询
    if (startDateFrom || startDateTo) {
      where.startDate = {};
      
      if (startDateFrom) {
        where.startDate[Op.gte] = startDateFrom;
      }
      
      if (startDateTo) {
        where.startDate[Op.lte] = startDateTo;
      }
    }
    
    // 结束日期范围查询
    if (endDateFrom || endDateTo) {
      where.endDate = {};
      
      if (endDateFrom) {
        where.endDate[Op.gte] = endDateFrom;
      }
      
      if (endDateTo) {
        where.endDate[Op.lte] = endDateTo;
      }
    }

    // 排序设置
    const order: any = [[sortBy, sortOrder]];

    const { count, rows } = await EnrollmentPlan.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name']
        }
      ],
      offset,
      limit,
      order,
      distinct: true
    });

    // 转换日期格式
    const items = rows.map(item => {
      const planItem = item.get({ plain: true });
      
      // 计算完成率 - 这里需要从跟踪记录中获取实际招生人数
      const completionRate = planItem.targetCount > 0 
        ? 0 // 暂时设为0，实际应从跟踪记录计算
        : 0;
      
      return {
        ...planItem,
        name: planItem.title, // 字段名转换
        term: planItem.semester === Semester.SPRING ? '春季' : '秋季', // 将semester转换为term
        status: planItem.status === EnrollmentPlanStatus.DRAFT ? 'draft' : 
                (planItem.status === EnrollmentPlanStatus.IN_PROGRESS ? 'active' : 
                (planItem.status === EnrollmentPlanStatus.FINISHED ? 'completed' : 'cancelled')), // 状态转换
        startDate: planItem.startDate.toISOString().split('T')[0],
        endDate: planItem.endDate.toISOString().split('T')[0],
        actualCount: 0, // 暂时设为0，实际应从跟踪记录计算
        completionRate,
        createdAt: planItem.createdAt ? planItem.createdAt.toISOString() : '',
        updatedAt: planItem.updatedAt ? planItem.updatedAt.toISOString() : ''
      };
    });

    return {
      total: count,
      items: items as unknown as EnrollmentPlanResponse[],
      page: Number(page),
      pageSize: Number(pageSize)
    };
  }

  /**
   * 获取招生计划详情
   * @param id 招生计划ID
   * @returns 招生计划详情
   */
  public async detail(id: number): Promise<EnrollmentPlanDetailResponse> {
    const plan = await EnrollmentPlan.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name']
        },
        {
          model: Class,
          as: 'classes',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        },
        {
          model: User,
          as: 'assignees',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ]
    });

    if (!plan) {
      throw ApiError.notFound('招生计划不存在', 'PLAN_NOT_FOUND');
    }

    const planData = plan.get({ plain: true });
    
    // 计算完成率 - 这里需要从跟踪记录中获取实际招生人数
    const actualCount = 0; // 暂时设为0，实际应从跟踪记录计算
    const completionRate = planData.targetCount > 0 
      ? Math.round((actualCount / planData.targetCount) * 100) 
      : 0;
    
    // 获取招生统计数据
    // 这里需要根据实际情况查询招生申请表等数据
    const statistics = {
      totalApplications: 0,
      approvedApplications: 0,
      rejectedApplications: 0,
      pendingApplications: 0,
      conversionRate: 0
    };

    return {
      ...planData,
      name: planData.title, // 字段名转换
      term: planData.semester === Semester.SPRING ? '春季' : '秋季', // 将semester转换为term
      status: planData.status === EnrollmentPlanStatus.DRAFT ? 'draft' : 
              (planData.status === EnrollmentPlanStatus.IN_PROGRESS ? 'active' : 
              (planData.status === EnrollmentPlanStatus.FINISHED ? 'completed' : 'cancelled')), // 状态转换
      startDate: planData.startDate.toISOString().split('T')[0],
      endDate: planData.endDate.toISOString().split('T')[0],
      actualCount,
      completionRate,
      statistics,
      createdAt: planData.createdAt ? planData.createdAt.toISOString() : '',
      updatedAt: planData.updatedAt ? planData.updatedAt.toISOString() : '',
      classIds: plan.classes ? plan.classes.map(c => c.id) : [],
      assigneeIds: plan.assignees ? plan.assignees.map(a => a.id) : [],
    } as unknown as EnrollmentPlanDetailResponse;
  }

  /**
   * 更新招生计划
   * @param id 招生计划ID
   * @param data 更新的招生计划数据
   * @returns 更新后的招生计划
   */
  public async update(id: number, data: UpdateEnrollmentPlanDto): Promise<EnrollmentPlan> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查招生计划是否存在
      const plan = await EnrollmentPlan.findByPk(id, { transaction });
      if (!plan) {
        throw ApiError.notFound('招生计划不存在', 'PLAN_NOT_FOUND');
      }

      // 如果计划已完成或已取消，不允许修改
      if (plan.status === EnrollmentPlanStatus.FINISHED || plan.status === EnrollmentPlanStatus.CANCELLED) {
        throw ApiError.badRequest('已完成或已取消的计划不能修改', 'PLAN_NOT_EDITABLE');
      }

      // 如果修改年份或学期，需要检查是否有冲突
      if ((data.year && data.year !== plan.year) || (data.term && (data.term === '春季' ? Semester.SPRING : Semester.AUTUMN) !== plan.semester)) {
        const existingPlan = await EnrollmentPlan.findOne({
          where: {
            year: data.year || plan.year,
            semester: data.term ? (data.term === '春季' ? Semester.SPRING : Semester.AUTUMN) : plan.semester,
            id: { [Op.ne]: id }
          },
          transaction
        });
        
        if (existingPlan) {
          throw ApiError.badRequest(`${data.year || plan.year}年${data.term || (plan.semester === Semester.SPRING ? '春季' : '秋季')}已有招生计划`, 'PLAN_EXISTS');
        }
      }

      // 更新招生计划
      const updateData: any = {};
      
      if (data.name !== undefined) updateData.title = data.name;
      if (data.year !== undefined) updateData.year = data.year;
      if (data.term !== undefined) updateData.semester = data.term === '春季' ? Semester.SPRING : Semester.AUTUMN;
      if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
      if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
      if (data.targetCount !== undefined) updateData.targetCount = data.targetCount;
      if (data.status !== undefined) {
        updateData.status = data.status === 'draft' ? EnrollmentPlanStatus.DRAFT : 
                        (data.status === 'active' ? EnrollmentPlanStatus.IN_PROGRESS : 
                        (data.status === 'completed' ? EnrollmentPlanStatus.FINISHED : EnrollmentPlanStatus.CANCELLED));
      }
      if (data.description !== undefined) updateData.description = data.description;
      
      await plan.update(updateData, { transaction });

      // 如果有班级IDs，更新关联
      if (data.classIds) {
        // 删除原有关联
        await EnrollmentPlanClass.destroy({
          where: { planId: id },
          transaction
        });

        // 创建新关联
        const classIds = data.classIds || [];
        if (classIds.length > 0) {
          const classAssociations = classIds.map(classId => ({
            planId: id,
            classId,
            quota: Math.floor((data.targetCount || plan.targetCount) / classIds.length) // 平均分配名额
          }));
          
          await EnrollmentPlanClass.bulkCreate(classAssociations as any, { transaction });
        }
      }

      // 如果有负责人IDs，更新关联
      if (data.assigneeIds) {
        // 删除原有关联
        await EnrollmentPlanAssignee.destroy({
          where: { planId: id },
          transaction
        });

        // 创建新关联
        if (data.assigneeIds.length > 0) {
          const assigneeAssociations = data.assigneeIds.map((assigneeId, index) => ({
            planId: id,
            assigneeId,
            role: index === 0 ? 'primary' : 'secondary' // 第一个为主负责人
          }));
          
          await EnrollmentPlanAssignee.bulkCreate(assigneeAssociations as any, { transaction });
        }
      }

      await transaction.commit();
      return plan;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('更新招生计划失败', 'PLAN_UPDATE_ERROR');
    }
  }

  /**
   * 删除招生计划
   * @param id 招生计划ID
   * @returns 是否删除成功
   */
  public async delete(id: number): Promise<boolean> {
    const transaction = await sequelize.transaction();
    
    try {
      await EnrollmentPlan.destroy({ where: { id }, transaction });
      
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw ApiError.serverError('删除招生计划失败', 'PLAN_DELETE_ERROR');
    }
  }

  /**
   * 设置招生计划班级
   * @param data 班级关联数据
   * @returns 是否设置成功
   */
  public async setClasses(data: EnrollmentPlanClassDto): Promise<boolean> {
    const transaction = await sequelize.transaction();
    
    try {
      const { planId, classIds } = data;

      // 检查招生计划是否存在
      const plan = await EnrollmentPlan.findByPk(planId, { transaction });
      if (!plan) {
        throw ApiError.notFound('招生计划不存在', 'PLAN_NOT_FOUND');
      }

      // 检查班级是否存在
      const classCount = await Class.count({
        where: { id: { [Op.in]: classIds } },
        transaction
      });

      if (classCount !== classIds.length) {
        throw ApiError.badRequest('部分班级不存在', 'CLASS_NOT_FOUND');
      }

      // 删除原有关联
      await EnrollmentPlanClass.destroy({
        where: { planId },
        transaction
      });

      // 创建新关联
      const classAssociations = classIds.map(classId => ({
        planId,
        classId,
        quota: Math.floor(plan.targetCount / classIds.length) // 平均分配名额
      }));
      
      await EnrollmentPlanClass.bulkCreate(classAssociations as any, { transaction });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('设置招生计划班级失败', 'SET_CLASSES_ERROR');
    }
  }

  /**
   * 设置招生计划负责人
   * @param data 负责人关联数据
   * @returns 是否设置成功
   */
  public async setAssignees(data: EnrollmentPlanAssigneeDto): Promise<boolean> {
    const transaction = await sequelize.transaction();
    
    try {
      const { planId, assigneeIds } = data;

      // 检查招生计划是否存在
      const plan = await EnrollmentPlan.findByPk(planId, { transaction });
      if (!plan) {
        throw ApiError.notFound('招生计划不存在', 'PLAN_NOT_FOUND');
      }

      // 检查用户是否存在
      const userCount = await User.count({
        where: { id: { [Op.in]: assigneeIds } },
        transaction
      });

      if (userCount !== assigneeIds.length) {
        throw ApiError.badRequest('部分用户不存在', 'USER_NOT_FOUND');
      }

      // 删除原有关联
      await EnrollmentPlanAssignee.destroy({
        where: { planId },
        transaction
      });

      // 创建新关联
      const assigneeAssociations = assigneeIds.map((assigneeId, index) => ({
        planId,
        assigneeId,
        role: index === 0 ? 'primary' : 'secondary' // 第一个为主负责人
      }));
      
      await EnrollmentPlanAssignee.bulkCreate(assigneeAssociations as any, { transaction });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('设置招生计划负责人失败', 'SET_ASSIGNEES_ERROR');
    }
  }

  /**
   * 获取招生计划完成统计
   * @param id 招生计划ID
   * @returns 招生计划统计数据
   */
  public async getStatistics(id: number): Promise<EnrollmentPlanStatisticsResponse> {
    try {
      // 检查招生计划是否存在
      const plan = await EnrollmentPlan.findByPk(id);
      if (!plan) {
        throw ApiError.notFound('招生计划不存在', 'PLAN_NOT_FOUND');
      }

      // 获取每日统计数据
      const trackings = await EnrollmentPlanTracking.findAll({
        where: { planId: id },
        order: [['date', 'ASC']]
      });

      // 转换为统计数据
      const dailyMap = new Map();
      const sourceMap = new Map();
      let totalCount = 0;

      trackings.forEach(tracking => {
        const dateStr = tracking.date.toISOString().split('T')[0];
        const count = tracking.count;
        
        // 累计每日数据
        totalCount += count;
        
        // 累计日统计
        if (dailyMap.has(dateStr)) {
          dailyMap.set(dateStr, dailyMap.get(dateStr) + count);
        } else {
          dailyMap.set(dateStr, count);
        }
        
        // 累计来源统计
        if (sourceMap.has(tracking.source)) {
          sourceMap.set(tracking.source, sourceMap.get(tracking.source) + count);
        } else {
          sourceMap.set(tracking.source, count);
        }
      });

      // 构建日统计数据
      const dailyStatistics = [];
      let accumulatedCount = 0;
      
      for (const [date, count] of dailyMap.entries()) {
        accumulatedCount += count;
        dailyStatistics.push({
          date,
          count,
          accumulatedCount
        });
      }

      // 构建周统计数据
      const weeklyMap = new Map();
      
      dailyStatistics.forEach(daily => {
        const date = new Date(daily.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // 获取周日
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // 获取周六
        
        const weekKey = `${weekStart.toISOString().split('T')[0]}~${weekEnd.toISOString().split('T')[0]}`;
        
        if (weeklyMap.has(weekKey)) {
          const weekData = weeklyMap.get(weekKey);
          weekData.count += daily.count;
        } else {
          weeklyMap.set(weekKey, {
            weekStart: weekStart.toISOString().split('T')[0],
            weekEnd: weekEnd.toISOString().split('T')[0],
            count: daily.count
          });
        }
      });

      // 构建周统计数据
      const weeklyStatistics = [];
      accumulatedCount = 0;
      
      for (const weekData of weeklyMap.values()) {
        accumulatedCount += weekData.count;
        weeklyStatistics.push({
          ...weekData,
          accumulatedCount
        });
      }

      // 构建来源统计数据
      const sourceStatistics = [];
      
      for (const [source, count] of sourceMap.entries()) {
        sourceStatistics.push({
          source,
          count,
          percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
        });
      }

      // 计算完成率
      const completionRate = plan.targetCount > 0 
        ? Math.round((totalCount / plan.targetCount) * 100) 
        : 0;

      return {
        planId: id,
        planName: plan.title,
        targetCount: plan.targetCount,
        actualCount: totalCount,
        completionRate,
        dailyStatistics,
        weeklyStatistics,
        sourceStatistics
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('获取招生计划统计失败', 'GET_STATISTICS_ERROR');
    }
  }

  /**
   * 获取招生计划执行跟踪记录
   * @param filters 过滤参数
   * @returns 执行跟踪记录列表
   */
  public async getTrackings(filters: EnrollmentPlanTrackingFilterParams): Promise<any> {
    const { 
      planId,
      page = 1, 
      pageSize = 10, 
      startDate,
      endDate,
      assigneeId,
      sortBy = 'date',
      sortOrder = 'DESC'
    } = filters;
    
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    // 构建查询条件
    const where: any = { planId };
    
    // 日期范围查询
    if (startDate || endDate) {
      where.date = {};
      
      if (startDate) {
        where.date[Op.gte] = startDate;
      }
      
      if (endDate) {
        where.date[Op.lte] = endDate;
      }
    }
    
    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    // 排序设置
    const order: any = [[sortBy, sortOrder]];

    const { count, rows } = await EnrollmentPlanTracking.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name']
        }
      ],
      offset,
      limit,
      order
    });

    // 转换日期格式
    const items = rows.map(item => {
      const trackingItem = item.get({ plain: true });
      
      return {
        ...trackingItem,
        date: trackingItem.date.toISOString().split('T')[0],
        createdAt: trackingItem.createdAt.toISOString(),
        updatedAt: trackingItem.updatedAt.toISOString()
      };
    });

    return {
      total: count,
      items,
      page: Number(page),
      pageSize: Number(pageSize)
    };
  }

  /**
   * 添加招生计划执行跟踪记录
   * @param planId 招生计划ID
   * @param data 跟踪记录数据
   * @param userId 当前用户ID
   * @returns 添加的跟踪记录
   */
  public async addTracking(planId: number, data: any, userId: number): Promise<EnrollmentPlanTracking> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查招生计划是否存在
      const plan = await EnrollmentPlan.findByPk(planId, { transaction });
      if (!plan) {
        throw ApiError.notFound('招生计划不存在', 'PLAN_NOT_FOUND');
      }

      // 检查招生计划状态
      if (plan.status !== EnrollmentPlanStatus.IN_PROGRESS) { // 1表示'active'状态
        throw ApiError.badRequest('只有进行中的招生计划才能添加跟踪记录', 'PLAN_NOT_ACTIVE');
      }

      // 创建跟踪记录
      const tracking = await EnrollmentPlanTracking.create({
        planId,
        date: data.date,
        count: data.count,
        source: data.source,
        assigneeId: data.assigneeId,
        remark: data.remark,
        createdBy: userId
      } as any, { transaction });

      // 注意：不再维护appliedCount字段，通过关联查询获取申请数量

      await transaction.commit();
      return tracking;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('添加跟踪记录失败', 'ADD_TRACKING_ERROR');
    }
  }
} 