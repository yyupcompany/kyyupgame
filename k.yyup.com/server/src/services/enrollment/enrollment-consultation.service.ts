import { Op, Sequelize, Transaction } from 'sequelize';
import { EnrollmentConsultation } from '../../models/enrollment-consultation.model';
import { EnrollmentConsultationFollowup } from '../../models/enrollment-consultation-followup.model';
import { User } from '../../models/user.model';
import { Kindergarten } from '../../models/kindergarten.model';
import {
  CreateEnrollmentConsultationDto,
  UpdateEnrollmentConsultationDto,
  EnrollmentConsultationFilterParams,
  EnrollmentConsultationResponse,
  EnrollmentConsultationListResponse,
  EnrollmentConsultationStatisticsResponse
} from '../../types/enrollment-consultation';
import { sequelize } from '../../init';

/**
 * 招生咨询服务类
 * 处理招生咨询的创建、查询、更新、删除以及统计分析等操作
 */
export class EnrollmentConsultationService {
  /**
   * 创建招生咨询
   * @param data 创建招生咨询的数据传输对象
   * @param userId 创建人ID
   * @returns 创建的招生咨询
   */
  async createConsultation(data: CreateEnrollmentConsultationDto, userId: number): Promise<EnrollmentConsultationResponse> {
    // 检查幼儿园和咨询师是否存在
    const [kindergarten, consultant] = await Promise.all([
      Kindergarten.findByPk(data.kindergartenId),
      User.findByPk(data.consultantId)
    ]);

    if (!kindergarten) {
      throw new Error('幼儿园不存在');
    }

    if (!consultant) {
      throw new Error('咨询师不存在');
    }

    // 创建咨询记录
    const consultation = await EnrollmentConsultation.create({
      kindergartenId: data.kindergartenId,
      consultantId: data.consultantId,
      parentName: data.parentName,
      childName: data.childName,
      childAge: data.childAge,
      childGender: data.childGender,
      contactPhone: data.contactPhone,
      contactAddress: data.contactAddress || null,
      sourceChannel: data.sourceChannel,
      sourceDetail: data.sourceDetail || null,
      consultContent: data.consultContent,
      consultMethod: data.consultMethod,
      consultDate: new Date(data.consultDate),
      intentionLevel: data.intentionLevel,
      followupStatus: data.followupStatus || 1,
      nextFollowupDate: data.nextFollowupDate ? new Date(data.nextFollowupDate) : null,
      remark: data.remark || null,
      creatorId: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return this.formatConsultationResponse(consultation);
  }

  /**
   * 获取招生咨询详情
   * @param id 招生咨询ID
   * @returns 招生咨询详情
   */
  async getConsultationById(id: number): Promise<EnrollmentConsultationResponse> {
    const consultation = await EnrollmentConsultation.findByPk(id, {
      include: [
        { model: User, as: 'consultant', attributes: ['id', 'name'] },
        { model: Kindergarten, as: 'kindergarten', attributes: ['id', 'name'] }
      ]
    });

    if (!consultation) {
      throw new Error('招生咨询不存在');
    }

    // 获取跟进记录数量
    const followupCount = await EnrollmentConsultationFollowup.count({
      where: { consultationId: id }
    });

    const response = this.formatConsultationResponse(consultation);
    response.followupCount = followupCount;

    return response;
  }

  /**
   * 更新招生咨询
   * @param data 更新招生咨询的数据传输对象
   * @param userId 更新人ID
   * @returns 更新后的招生咨询
   */
  async updateConsultation(data: UpdateEnrollmentConsultationDto, userId: number): Promise<EnrollmentConsultationResponse> {
    const consultation = await EnrollmentConsultation.findByPk(data.id);

    if (!consultation) {
      throw new Error('招生咨询不存在');
    }

    // 构建更新数据
    const updateData: any = {
      updaterId: userId
    };

    if (data.parentName !== undefined) updateData.parentName = data.parentName;
    if (data.childName !== undefined) updateData.childName = data.childName;
    if (data.childAge !== undefined) updateData.childAge = data.childAge;
    if (data.childGender !== undefined) updateData.childGender = data.childGender;
    if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone;
    if (data.contactAddress !== undefined) updateData.contactAddress = data.contactAddress;
    if (data.sourceChannel !== undefined) updateData.sourceChannel = data.sourceChannel;
    if (data.sourceDetail !== undefined) updateData.sourceDetail = data.sourceDetail;
    if (data.consultContent !== undefined) updateData.consultContent = data.consultContent;
    if (data.consultMethod !== undefined) updateData.consultMethod = data.consultMethod;
    if (data.consultDate !== undefined) updateData.consultDate = new Date(data.consultDate);
    if (data.intentionLevel !== undefined) updateData.intentionLevel = data.intentionLevel;
    if (data.followupStatus !== undefined) updateData.followupStatus = data.followupStatus;
    if (data.nextFollowupDate !== undefined) updateData.nextFollowupDate = data.nextFollowupDate ? new Date(data.nextFollowupDate) : null;
    if (data.remark !== undefined) updateData.remark = data.remark;

    // 更新咨询记录
    await consultation.update(updateData);

    // 重新加载包含关联数据的咨询记录
    const updatedConsultation = await EnrollmentConsultation.findByPk(data.id, {
      include: [
        { model: User, as: 'consultant', attributes: ['id', 'name'] },
        { model: Kindergarten, as: 'kindergarten', attributes: ['id', 'name'] }
      ]
    });

    return this.formatConsultationResponse(updatedConsultation!);
  }

  /**
   * 删除招生咨询
   * @param id 咨询ID
   * @returns 是否删除成功
   */
  async deleteConsultation(id: number): Promise<boolean> {
    // 查找要删除的咨询记录
    const consultation = await EnrollmentConsultation.findByPk(id);
    
    if (!consultation) {
      throw new Error('招生咨询记录不存在');
    }
    
    // 使用事务确保数据一致性
    return await sequelize.transaction(async (transaction: Transaction) => {
      // 删除相关的跟进记录
      await EnrollmentConsultationFollowup.destroy({
        where: { consultationId: id },
        transaction
      });

      // 删除咨询记录
      await consultation.destroy({ transaction });

      return true;
    });
  }

  /**
   * 获取招生咨询列表
   * @param params 过滤参数
   * @param userInfo 用户信息（用于角色过滤）
   * @returns 招生咨询列表
   */
  async getConsultationList(
    params: EnrollmentConsultationFilterParams,
    userInfo?: { id: number; role: string }
  ): Promise<EnrollmentConsultationListResponse> {
    const {
      page = 1,
      pageSize = 10,
      kindergartenId,
      consultantId,
      parentName,
      childName,
      contactPhone,
      sourceChannel,
      intentionLevel,
      followupStatus,
      startDate,
      endDate,
      needFollowup,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = params;

    // 构建查询条件
    const where: any = {};

    // 🔐 角色权限过滤
    if (userInfo) {
      const { id: userId, role: userRole } = userInfo;

      // 老师只能看到自己创建的咨询记录
      if (userRole === 'teacher') {
        where.creatorId = userId;
      }
      // 园长和管理员可以看到所有数据，不需要额外过滤
      // admin 和 principal 角色不添加额外的 where 条件
    }

    if (kindergartenId !== undefined) {
      where.kindergartenId = kindergartenId;
    }

    if (consultantId !== undefined) {
      where.consultantId = consultantId;
    }

    if (parentName) {
      where.parentName = { [Op.like]: `%${parentName}%` };
    }

    if (childName) {
      where.childName = { [Op.like]: `%${childName}%` };
    }

    if (contactPhone) {
      where.contactPhone = { [Op.like]: `%${contactPhone}%` };
    }

    if (sourceChannel !== undefined) {
      where.sourceChannel = sourceChannel;
    }

    if (intentionLevel !== undefined) {
      where.intentionLevel = intentionLevel;
    }

    if (followupStatus !== undefined) {
      where.followupStatus = followupStatus;
    }

    if (startDate && endDate) {
      where.consultDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      where.consultDate = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      where.consultDate = {
        [Op.lte]: new Date(endDate)
      };
    }

    if (needFollowup === true) {
      where.followupStatus = { [Op.in]: [1, 2] }; // 待跟进或跟进中
    }

    // 执行查询，明确指定要选择的字段
    const { count, rows } = await EnrollmentConsultation.findAndCountAll({
      where,
      attributes: [
        'id', 'kindergartenId', 'consultantId', 'parentName', 'childName',
        'childAge', 'childGender', 'contactPhone', 'contactAddress',
        'sourceChannel', 'sourceDetail', 'consultContent', 'consultMethod',
        'consultDate', 'intentionLevel', 'followupStatus', 'nextFollowupDate',
        'remark', 'creatorId', 'updaterId', 'createdAt', 'updatedAt', 'deletedAt'
      ],
      include: [
        { model: User, as: 'consultant', attributes: ['id', 'realName'] },
        { model: Kindergarten, as: 'kindergarten', attributes: ['id', 'name'] }
      ],
      order: [[sortBy, sortOrder]],
      limit: pageSize,
      offset: (page - 1) * pageSize
    });

    // 格式化结果
    const items = rows.map(consultation => this.formatConsultationResponse(consultation));

    return {
      total: count,
      items,
      page,
      pageSize
    };
  }

  /**
   * 获取招生咨询统计
   * @param params 过滤参数
   * @returns 招生咨询统计信息
   */
  async getConsultationStatistics(params: EnrollmentConsultationFilterParams): Promise<EnrollmentConsultationStatisticsResponse> {
    const {
      kindergartenId,
      startDate,
      endDate
    } = params;

    // 构建查询条件
    const where: any = {};

    if (kindergartenId !== undefined) {
      where.kindergartenId = kindergartenId;
    }

    if (startDate && endDate) {
      where.consultDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      where.consultDate = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      where.consultDate = {
        [Op.lte]: new Date(endDate)
      };
    }

    // 获取总咨询数量
    const total = await EnrollmentConsultation.count({ where });

    // 获取各来源渠道的咨询数量
    const bySourceChannel = await EnrollmentConsultation.findAll({
      attributes: [
        'sourceChannel',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where,
      group: ['sourceChannel'],
      order: [[Sequelize.literal('count'), 'DESC']]
    });

    // 获取各意向级别的咨询数量
    const byIntentionLevel = await EnrollmentConsultation.findAll({
      attributes: [
        'intentionLevel',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where,
      group: ['intentionLevel'],
      order: [['intentionLevel', 'ASC']]
    });

    // 获取各跟进状态的咨询数量
    const byFollowupStatus = await EnrollmentConsultation.findAll({
      attributes: [
        'followupStatus',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where,
      group: ['followupStatus'],
      order: [['followupStatus', 'ASC']]
    });

    // 获取各咨询方式的咨询数量
    const byConsultMethod = await EnrollmentConsultation.findAll({
      attributes: [
        'consultMethod',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where,
      group: ['consultMethod'],
      order: [[Sequelize.literal('count'), 'DESC']]
    });

    // 获取按日期统计的咨询数量
    const byDate = await EnrollmentConsultation.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('consult_date')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where,
      group: [Sequelize.fn('DATE', Sequelize.col('consult_date'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('consult_date')), 'ASC']]
    });

    // 计算转化率（已转化的咨询数量 / 总咨询数量）
    const convertedCount = await EnrollmentConsultation.count({
      where: {
        ...where,
        followupStatus: 3 // 已转化
      }
    });

    const conversionRate = total > 0 ? (convertedCount / total) * 100 : 0;

    // 获取渠道名称映射
    const sourceChannelMap: {[key: number]: string} = {
      1: '线上广告',
      2: '线下活动',
      3: '朋友介绍',
      4: '电话咨询',
      5: '自主访问',
      6: '其他'
    };

    // 获取意向级别名称映射
    const intentionLevelMap: {[key: number]: string} = {
      1: '非常有意向',
      2: '有意向',
      3: '一般',
      4: '较低',
      5: '无意向'
    };

    // 获取跟进状态名称映射
    const followupStatusMap: {[key: number]: string} = {
      1: '待跟进',
      2: '跟进中',
      3: '已转化',
      4: '已放弃'
    };

    // 获取咨询方式名称映射
    const consultMethodMap: {[key: number]: string} = {
      1: '电话',
      2: '线下到访',
      3: '线上咨询',
      4: '微信',
      5: '其他'
    };

    // 格式化统计结果
    return {
      total,
      bySourceChannel: bySourceChannel.map(item => ({
        channel: item.sourceChannel,
        channelName: sourceChannelMap[item.sourceChannel] || '未知',
        count: Number(item.get('count')),
        percentage: total > 0 ? (Number(item.get('count')) / total) * 100 : 0
      })),
      byIntentionLevel: byIntentionLevel.map(item => ({
        level: item.intentionLevel,
        levelName: intentionLevelMap[item.intentionLevel] || '未知',
        count: Number(item.get('count')),
        percentage: total > 0 ? (Number(item.get('count')) / total) * 100 : 0
      })),
      byFollowupStatus: byFollowupStatus.map(item => ({
        status: item.followupStatus,
        statusName: followupStatusMap[item.followupStatus] || '未知',
        count: Number(item.get('count')),
        percentage: total > 0 ? (Number(item.get('count')) / total) * 100 : 0
      })),
      byConsultMethod: byConsultMethod.map(item => ({
        method: item.consultMethod,
        methodName: consultMethodMap[item.consultMethod] || '未知',
        count: Number(item.get('count')),
        percentage: total > 0 ? (Number(item.get('count')) / total) * 100 : 0
      })),
      byDate: byDate.map(item => ({
        date: String(item.get('date')),
        count: Number(item.get('count'))
      })),
      conversionRate
    };
  }

  /**
   * 格式化招生咨询响应对象
   * @param consultation 招生咨询模型实例
   * @returns 格式化后的响应对象
   */
  private formatConsultationResponse(consultation: any): EnrollmentConsultationResponse {
    const consultant = consultation.get('consultant');
    const kindergarten = consultation.get('kindergarten');
    
    // 获取性别文本
    const genderMap: {[key: number]: string} = {
      1: '男',
      2: '女'
    };

    // 获取来源渠道文本
    const sourceChannelMap: {[key: number]: string} = {
      1: '线上广告',
      2: '线下活动',
      3: '朋友介绍',
      4: '电话咨询',
      5: '自主访问',
      6: '其他'
    };

    // 获取咨询方式文本
    const consultMethodMap: {[key: number]: string} = {
      1: '电话',
      2: '线下到访',
      3: '线上咨询',
      4: '微信',
      5: '其他'
    };

    // 获取意向级别文本
    const intentionLevelMap: {[key: number]: string} = {
      1: '非常有意向',
      2: '有意向',
      3: '一般',
      4: '较低',
      5: '无意向'
    };

    // 获取跟进状态文本
    const followupStatusMap: {[key: number]: string} = {
      1: '待跟进',
      2: '跟进中',
      3: '已转化',
      4: '已放弃'
    };
    
    return {
      id: consultation.id,
      kindergartenId: consultation.kindergartenId,
      consultantId: consultation.consultantId,
      parentName: consultation.parentName,
      childName: consultation.childName,
      childAge: consultation.childAge,
      childGender: consultation.childGender,
      childGenderText: genderMap[consultation.childGender] || '未知',
      contactPhone: consultation.contactPhone,
      contactAddress: consultation.contactAddress,
      sourceChannel: consultation.sourceChannel,
      sourceChannelText: sourceChannelMap[consultation.sourceChannel] || '未知',
      sourceDetail: consultation.sourceDetail,
      consultContent: consultation.consultContent,
      consultMethod: consultation.consultMethod,
      consultMethodText: consultMethodMap[consultation.consultMethod] || '未知',
      consultDate: consultation.consultDate.toISOString().split('T')[0],
      intentionLevel: consultation.intentionLevel,
      intentionLevelText: intentionLevelMap[consultation.intentionLevel] || '未知',
      followupStatus: consultation.followupStatus,
      followupStatusText: followupStatusMap[consultation.followupStatus] || '未知',
      nextFollowupDate: consultation.nextFollowupDate ? consultation.nextFollowupDate.toISOString().split('T')[0] : null,
      remark: consultation.remark,
      createdAt: consultation.createdAt.toISOString(),
      updatedAt: consultation.updatedAt.toISOString(),
      consultant: consultant ? {
        id: consultant.id,
        name: consultant.name
      } : undefined,
      kindergarten: kindergarten ? {
        id: kindergarten.id,
        name: kindergarten.name
      } : undefined
    };
  }
} 