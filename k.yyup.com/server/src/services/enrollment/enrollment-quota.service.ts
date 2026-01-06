import { Op, Transaction } from 'sequelize';
import { EnrollmentQuota } from '../../models/enrollment-quota.model';
import { EnrollmentPlan, Semester } from '../../models/enrollment-plan.model';
import { Class } from '../../models/class.model';
import {
  CreateEnrollmentQuotaDto,
  UpdateEnrollmentQuotaDto,
  EnrollmentQuotaFilterParams,
  EnrollmentQuotaResponse,
  EnrollmentQuotaListResponse,
  EnrollmentQuotaAllocationDto,
  EnrollmentQuotaStatisticsResponse,
  EnrollmentQuotaBatchAdjustmentDto
} from '../../types/enrollment-quota';
import { sequelize } from '../../init';

/**
 * 招生名额状态枚举
 */
enum QuotaStatus {
  DISABLED = 0,    // 未启用 
  ACTIVE = 1,      // 招生中
  COMPLETED = 2    // 已结束
}

/**
 * 班级类型枚举
 */
enum ClassType {
  JUNIOR = 1,      // 小班
  MIDDLE = 2,      // 中班
  SENIOR = 3       // 大班
}

/**
 * 招生名额服务类
 * 处理招生名额的创建、查询、更新、删除以及名额分配、统计等操作
 */
export class EnrollmentQuotaService {
  /**
   * 创建招生名额
   * @param data 创建招生名额的数据传输对象
   * @returns 创建的招生名额
   */
  async createQuota(data: CreateEnrollmentQuotaDto): Promise<EnrollmentQuotaResponse> {
    // 检查计划和班级是否存在
    const [plan, classEntity] = await Promise.all([
      EnrollmentPlan.findByPk(data.planId),
      Class.findByPk(data.classId)
    ]);

    if (!plan) {
      throw new Error('招生计划不存在');
    }

    if (!classEntity) {
      throw new Error('班级不存在');
    }

    // 检查是否已存在相同计划和班级的名额
    const existingQuota = await EnrollmentQuota.findOne({
      where: {
        planId: data.planId,
        classId: data.classId
      }
    });

    if (existingQuota) {
      throw new Error('该班级在此招生计划中已有名额配置');
    }

    // 创建名额记录
    const quota = await EnrollmentQuota.create({
      planId: data.planId,
      classId: data.classId,
      totalQuota: data.totalQuota,
      usedQuota: data.usedQuota || 0,
      reservedQuota: data.reservedQuota || 0,
      remark: data.remark
    });

    return this.formatQuotaResponse(quota);
  }

  /**
   * 获取招生名额详情
   * @param id 招生名额ID
   * @returns 招生名额详情
   */
  async getQuotaById(id: number): Promise<EnrollmentQuotaResponse> {
    const quota = await EnrollmentQuota.findByPk(id, {
      include: [
        { model: EnrollmentPlan, as: 'plan', attributes: ['id', 'title', 'year', 'semester'] },
        { model: Class, as: 'class', attributes: ['id', 'name', 'grade'] }
      ]
    });

    if (!quota) {
      throw new Error('招生名额不存在');
    }

    return this.formatQuotaResponse(quota);
  }

  /**
   * 更新招生名额
   * @param data 更新招生名额的数据传输对象
   * @returns 更新后的招生名额
   */
  async updateQuota(data: UpdateEnrollmentQuotaDto): Promise<EnrollmentQuotaResponse> {
    const quota = await EnrollmentQuota.findByPk(data.id);

    if (!quota) {
      throw new Error('招生名额不存在');
    }

    // 校验名额数量关系
    const totalQuota = data.totalQuota !== undefined ? data.totalQuota : quota.totalQuota;
    const usedQuota = data.usedQuota !== undefined ? data.usedQuota : quota.usedQuota;
    const reservedQuota = data.reservedQuota !== undefined ? data.reservedQuota : quota.reservedQuota;

    if (usedQuota + reservedQuota > totalQuota) {
      throw new Error('已使用名额和预留名额总和不能超过总名额');
    }

    // 更新名额
    await quota.update({
      totalQuota,
      usedQuota,
      reservedQuota,
      remark: data.remark !== undefined ? data.remark : quota.remark
    });

    return this.formatQuotaResponse(await quota.reload({
      include: [
        { model: EnrollmentPlan, as: 'plan', attributes: ['id', 'title', 'year', 'semester'] },
        { model: Class, as: 'class', attributes: ['id', 'name', 'grade'] }
      ]
    }));
  }

  /**
   * 删除招生名额
   * @param id 招生名额ID
   * @returns 是否删除成功
   */
  async deleteQuota(id: number): Promise<boolean> {
    const quota = await EnrollmentQuota.findByPk(id);

    if (!quota) {
      throw new Error('招生名额不存在');
    }

    // 检查是否有已使用的名额
    if (quota.usedQuota > 0) {
      throw new Error('该名额配置已被使用，无法删除');
    }

    await quota.destroy();
    return true;
  }

  /**
   * 获取招生名额列表
   * @param params 过滤参数
   * @returns 招生名额列表
   */
  async getQuotaList(params: EnrollmentQuotaFilterParams): Promise<EnrollmentQuotaListResponse> {
    const { page = 1, pageSize = 10, planId, classId, hasAvailable, sortBy = 'id', sortOrder = 'ASC' } = params;
    
    // 构建查询条件
    const where: any = {};
    
    if (planId !== undefined) {
      where.planId = planId;
    }
    
    if (classId !== undefined) {
      where.classId = classId;
    }
    
    if (hasAvailable === true) {
      where[Op.and] = sequelize.literal('total_quota > (used_quota + reserved_quota)');
    }

    // 执行查询
    const { count, rows } = await EnrollmentQuota.findAndCountAll({
      where,
      include: [
        { model: EnrollmentPlan, as: 'plan', attributes: ['id', 'title', 'year', 'semester'] },
        { model: Class, as: 'class', attributes: ['id', 'name', 'grade'] }
      ],
      order: [[sortBy, sortOrder]],
      limit: pageSize,
      offset: (page - 1) * pageSize
    });

    // 格式化结果
    const items = rows.map(quota => this.formatQuotaResponse(quota));

    return {
      total: count,
      items,
      page,
      pageSize
    };
  }

  /**
   * 分配招生名额
   * @param data 名额分配数据
   * @returns 更新后的招生名额
   */
  async allocateQuota(data: EnrollmentQuotaAllocationDto): Promise<EnrollmentQuotaResponse> {
    const { quotaId, amount, type, applicantId, remark } = data;

    // 使用事务确保数据一致性
    return await sequelize.transaction(async (transaction: Transaction) => {
      const quota = await EnrollmentQuota.findByPk(quotaId, { transaction });

      if (!quota) {
        throw new Error('招生名额不存在');
      }

      // 根据操作类型进行不同的处理
      switch (type) {
        case 'use': // 使用名额
          if (quota.usedQuota + amount > quota.totalQuota - quota.reservedQuota) {
            throw new Error('可用名额不足');
          }
          await quota.update({ 
            usedQuota: quota.usedQuota + amount 
          }, { transaction });
          break;

        case 'reserve': // 预留名额
          if (quota.reservedQuota + amount > quota.totalQuota - quota.usedQuota) {
            throw new Error('可预留名额不足');
          }
          await quota.update({ 
            reservedQuota: quota.reservedQuota + amount 
          }, { transaction });
          break;

        case 'release': // 释放名额
          if (type === 'release' && amount > quota.reservedQuota) {
            throw new Error('释放的预留名额数量超过已预留数量');
          }
          await quota.update({ 
            reservedQuota: quota.reservedQuota - amount 
          }, { transaction });
          break;

        default:
          throw new Error('不支持的操作类型');
      }

      // TODO: 记录名额操作日志，关联申请人等信息

      // 重新加载名额数据
      return this.formatQuotaResponse(await quota.reload({
        include: [
          { model: EnrollmentPlan, as: 'plan', attributes: ['id', 'title', 'year', 'semester'] },
          { model: Class, as: 'class', attributes: ['id', 'name', 'grade'] }
        ],
        transaction
      }));
    });
  }

  /**
   * 获取招生名额统计
   * @param planId 招生计划ID
   * @returns 招生名额统计信息
   */
  async getQuotaStatistics(planId: number): Promise<EnrollmentQuotaStatisticsResponse> {
    // 检查计划是否存在
    const plan = await EnrollmentPlan.findByPk(planId);
    if (!plan) {
      throw new Error('招生计划不存在');
    }

    // 获取该计划下所有名额
    const quotas = await EnrollmentQuota.findAll({
      where: { planId },
      include: [
        { model: Class, as: 'class', attributes: ['id', 'name', 'grade'] }
      ]
    });

    // 计算总体统计数据
    let totalQuota = 0;
    let usedQuota = 0;
    let reservedQuota = 0;

    // 班级汇总数据
    const classSummary: any[] = [];

    // 处理每个班级的名额数据
    for (const quota of quotas) {
      totalQuota += quota.totalQuota;
      usedQuota += quota.usedQuota;
      reservedQuota += quota.reservedQuota;

      const classData = {
        classId: quota.classId,
        className: (quota.get('class') as any)?.name || '未知班级',
        totalQuota: quota.totalQuota,
        usedQuota: quota.usedQuota,
        reservedQuota: quota.reservedQuota,
        availableQuota: quota.totalQuota - quota.usedQuota - quota.reservedQuota,
        utilizationRate: quota.totalQuota > 0 ? (quota.usedQuota / quota.totalQuota) * 100 : 0
      };

      classSummary.push(classData);
    }

    // 计算总体可用名额和利用率
    const availableQuota = totalQuota - usedQuota - reservedQuota;
    const utilizationRate = totalQuota > 0 ? (usedQuota / totalQuota) * 100 : 0;

    return {
      planId,
      planName: plan.title,
      totalQuota,
      usedQuota,
      reservedQuota,
      availableQuota,
      utilizationRate,
      classSummary
    };
  }

  /**
   * 批量调整招生名额
   * @param data 批量调整数据
   * @returns 是否调整成功
   */
  async batchAdjustQuota(data: EnrollmentQuotaBatchAdjustmentDto): Promise<boolean> {
    const { planId, adjustments, remark } = data;

    // 使用事务确保数据一致性
    return await sequelize.transaction(async (transaction: Transaction) => {
      // 检查计划是否存在
      const plan = await EnrollmentPlan.findByPk(planId, { transaction });
      if (!plan) {
        throw new Error('招生计划不存在');
      }

      // 处理每个调整项
      for (const adjustment of adjustments) {
        const { classId, amount } = adjustment;

        // 查找对应的名额记录
        const quota = await EnrollmentQuota.findOne({
          where: { planId, classId },
          transaction
        });

        if (!quota) {
          // 如果不存在，且调整量为正，则创建新记录
          if (amount <= 0) {
            throw new Error(`班级ID ${classId} 没有名额配置，无法减少名额`);
          }

          // 检查班级是否存在
          const classEntity = await Class.findByPk(classId, { transaction });
          if (!classEntity) {
            throw new Error(`班级ID ${classId} 不存在`);
          }

          // 创建新的名额记录
          await EnrollmentQuota.create({
            planId,
            classId,
            totalQuota: amount,
            usedQuota: 0,
            reservedQuota: 0,
            remark
          }, { transaction });
        } else {
          // 如果存在，则调整名额
          const newTotal = quota.totalQuota + amount;
          
          // 检查调整后的总名额是否小于已使用和预留的名额
          if (newTotal < quota.usedQuota + quota.reservedQuota) {
            throw new Error(`班级ID ${classId} 调整后的总名额小于已使用和预留的名额总和`);
          }

          // 更新名额
          await quota.update({
            totalQuota: newTotal,
            remark: remark || quota.remark
          }, { transaction });
        }
      }

      // TODO: 记录批量调整操作日志

      return true;
    });
  }

  /**
   * 按计划获取招生名额
   * @param planId 招生计划ID
   * @returns 该计划下的所有招生名额
   */
  async getQuotasByPlan(planId: number): Promise<EnrollmentQuotaResponse[]> {
    // 检查计划是否存在
    const plan = await EnrollmentPlan.findByPk(planId);
    if (!plan) {
      throw new Error('招生计划不存在');
    }

    // 获取该计划下所有名额
    const quotas = await EnrollmentQuota.findAll({
      where: { planId },
      include: [
        { model: EnrollmentPlan, as: 'plan', attributes: ['id', 'title', 'year', 'semester'] },
        { model: Class, as: 'class', attributes: ['id', 'name', 'grade'] }
      ],
      order: [['classId', 'ASC']]
    });

    return quotas.map(quota => this.formatQuotaResponse(quota));
  }

  /**
   * 按班级获取招生名额
   * @param classId 班级ID
   * @returns 该班级的所有招生名额
   */
  async getQuotasByClass(classId: number): Promise<EnrollmentQuotaResponse[]> {
    // 检查班级是否存在
    const classEntity = await Class.findByPk(classId);
    if (!classEntity) {
      throw new Error('班级不存在');
    }

    // 获取该班级的所有名额
    const quotas = await EnrollmentQuota.findAll({
      where: { classId },
      include: [
        { model: EnrollmentPlan, as: 'plan', attributes: ['id', 'title', 'year', 'semester'] },
        { model: Class, as: 'class', attributes: ['id', 'name', 'grade'] }
      ],
      order: [['planId', 'DESC']]
    });

    return quotas.map(quota => this.formatQuotaResponse(quota));
  }

  /**
   * 调整招生名额
   * @param id 名额ID
   * @param adjustment 调整数量（正数增加，负数减少）
   * @param reason 调整原因
   * @returns 调整后的招生名额
   */
  async adjustQuota(id: number, adjustment: number, reason?: string): Promise<EnrollmentQuotaResponse> {
    return await sequelize.transaction(async (transaction: Transaction) => {
      // 查找名额记录
      const quota = await EnrollmentQuota.findByPk(id, { transaction });
      if (!quota) {
        throw new Error('招生名额不存在');
      }

      // 计算调整后的总名额
      const newTotal = quota.totalQuota + adjustment;
      
      // 检查调整后的总名额是否合理
      if (newTotal < 0) {
        throw new Error('调整后的总名额不能为负数');
      }

      if (newTotal < quota.usedQuota + quota.reservedQuota) {
        throw new Error('调整后的总名额不能小于已使用和预留的名额总和');
      }

      // 更新名额
      await quota.update({
        totalQuota: newTotal,
        remark: reason ? `${quota.remark || ''}\n调整原因: ${reason}` : quota.remark
      }, { transaction });

      // TODO: 记录名额调整日志

      // 重新加载名额数据
      return this.formatQuotaResponse(await quota.reload({
        include: [
          { model: EnrollmentPlan, as: 'plan', attributes: ['id', 'title', 'year', 'semester'] },
          { model: Class, as: 'class', attributes: ['id', 'name', 'grade'] }
        ],
        transaction
      }));
    });
  }

  /**
   * 格式化招生名额响应对象
   * @param quota 招生名额模型实例
   * @returns 格式化后的响应对象
   */
  private formatQuotaResponse(quota: any): EnrollmentQuotaResponse {
    const plan = quota.get('plan');
    const classEntity = quota.get('class');
    
    return {
      id: quota.id,
      planId: quota.planId,
      classId: quota.classId,
      totalQuota: quota.totalQuota,
      usedQuota: quota.usedQuota,
      reservedQuota: quota.reservedQuota,
      availableQuota: quota.totalQuota - quota.usedQuota - quota.reservedQuota,
      remark: quota.remark,
      createdAt: quota.createdAt.toISOString(),
      updatedAt: quota.updatedAt.toISOString(),
      plan: plan ? {
        id: plan.id,
        name: plan.title,
        year: plan.year,
        term: plan.semester === Semester.SPRING ? '春季' : '秋季'
      } : undefined,
      class: classEntity ? {
        id: classEntity.id,
        name: classEntity.name,
        grade: classEntity.grade
      } : undefined
    };
  }
} 