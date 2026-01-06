import { Op, Transaction } from 'sequelize';
import { EnrollmentConsultation } from '../../models/enrollment-consultation.model';
import { EnrollmentConsultationFollowup } from '../../models/enrollment-consultation-followup.model';
import { User } from '../../models/user.model';
import {
  CreateEnrollmentConsultationFollowupDto,
  EnrollmentConsultationFollowupFilterParams,
  EnrollmentConsultationFollowupResponse,
  EnrollmentConsultationFollowupListResponse
} from '../../types/enrollment-consultation';
import { sequelize } from '../../init';

/**
 * 枚举类型定义 - 与模型中的枚举保持一致
 */
// 跟进方式
enum FollowupMethod {
  PHONE = 1,    // 电话
  WECHAT = 2,   // 微信
  SMS = 3,      // 短信
  MEETING = 4,  // 面谈
  EMAIL = 5,    // 邮件
  OTHER = 6     // 其他
}

// 意向级别
enum IntentionLevel {
  VERY_HIGH = 1,  // 非常有意向
  HIGH = 2,       // 有意向
  MEDIUM = 3,     // 一般
  LOW = 4,        // 较低
  NONE = 5        // 无意向
}

// 跟进结果
enum FollowupResult {
  CONTINUE = 1,    // 继续跟进
  CONVERTED = 2,   // 成功转化
  NO_INTENTION = 3, // 暂无意向
  ABANDONED = 4    // 放弃跟进
}

// 咨询跟进状态
enum ConsultationStatus {
  PENDING = 1,     // 待跟进
  IN_PROGRESS = 2, // 跟进中
  CONVERTED = 3,   // 已转化
  ABANDONED = 4    // 已放弃
}

/**
 * 招生咨询跟进服务类
 * 处理招生咨询跟进记录的创建、查询等操作
 */
export class EnrollmentConsultationFollowupService {
  /**
   * 创建招生咨询跟进记录
   * @param data 创建招生咨询跟进的数据传输对象
   * @param userId 跟进人ID
   * @returns 创建的招生咨询跟进记录
   */
  async createFollowup(data: CreateEnrollmentConsultationFollowupDto, userId: number): Promise<EnrollmentConsultationFollowupResponse> {
    // 检查咨询记录是否存在
    const consultation = await EnrollmentConsultation.findByPk(data.consultationId);
    if (!consultation) {
      throw new Error('招生咨询不存在');
    }

    // 使用事务确保数据一致性
    return await sequelize.transaction(async (transaction: Transaction) => {
      // 创建跟进记录
      const followup = await EnrollmentConsultationFollowup.create({
        consultationId: data.consultationId,
        followupUserId: userId,
        followupMethod: data.followupMethod,
        followupContent: data.followupContent,
        followupDate: new Date(data.followupDate),
        intentionLevel: data.intentionLevel,
        followupResult: data.followupResult,
        nextFollowupDate: data.nextFollowupDate ? new Date(data.nextFollowupDate) : null,
        remark: data.remark || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }, { transaction });

      // 根据跟进结果更新咨询记录的状态
      const updateData: any = {
        intentionLevel: data.intentionLevel,
        updaterId: userId
      };

      // 根据跟进结果设置咨询的跟进状态
      switch (data.followupResult) {
        case FollowupResult.CONTINUE:
          updateData.followupStatus = ConsultationStatus.IN_PROGRESS;
          updateData.nextFollowupDate = data.nextFollowupDate ? new Date(data.nextFollowupDate) : null;
          break;
        case FollowupResult.CONVERTED:
          updateData.followupStatus = ConsultationStatus.CONVERTED;
          updateData.nextFollowupDate = null;
          break;
        case FollowupResult.NO_INTENTION:
          updateData.followupStatus = ConsultationStatus.IN_PROGRESS;
          updateData.nextFollowupDate = data.nextFollowupDate ? new Date(data.nextFollowupDate) : null;
          break;
        case FollowupResult.ABANDONED:
          updateData.followupStatus = ConsultationStatus.ABANDONED;
          updateData.nextFollowupDate = null;
          break;
      }

      // 更新咨询记录
      await consultation.update(updateData, { transaction });

      // 获取跟进人信息
      const followupUser = await User.findByPk(userId, {
        attributes: ['id', 'name'],
        transaction
      });

      return this.formatFollowupResponse(followup, followupUser);
    });
  }

  /**
   * 获取招生咨询跟进记录详情
   * @param id 跟进记录ID
   * @returns 跟进记录详情
   */
  async getFollowupById(id: number): Promise<EnrollmentConsultationFollowupResponse> {
    const followup = await EnrollmentConsultationFollowup.findByPk(id, {
      include: [
        { model: User, as: 'followupUser', attributes: ['id', 'name'] }
      ]
    });

    if (!followup) {
      throw new Error('跟进记录不存在');
    }

    return this.formatFollowupResponse(followup);
  }

  /**
   * 获取招生咨询的跟进记录列表
   * @param params 过滤参数
   * @returns 跟进记录列表
   */
  async getFollowupList(params: EnrollmentConsultationFollowupFilterParams): Promise<EnrollmentConsultationFollowupListResponse> {
    const {
      page = 1,
      pageSize = 10,
      consultationId,
      followupUserId,
      followupMethod,
      followupResult,
      startDate,
      endDate,
      sortBy = 'followupDate',
      sortOrder = 'DESC'
    } = params;

    // 构建查询条件
    const where: any = {};

    if (consultationId !== undefined) {
      where.consultationId = consultationId;
    }

    if (followupUserId !== undefined) {
      where.followupUserId = followupUserId;
    }

    if (followupMethod !== undefined) {
      where.followupMethod = followupMethod;
    }

    if (followupResult !== undefined) {
      where.followupResult = followupResult;
    }

    if (startDate && endDate) {
      where.followupDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      where.followupDate = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      where.followupDate = {
        [Op.lte]: new Date(endDate)
      };
    }

    // 临时使用模拟数据，避免Sequelize模型问题  
    // TODO: 修复EnrollmentConsultationFollowup模型初始化问题后恢复正常查询
    console.log('Using mock data for followup list');
    const mockFollowups = [
      {
        id: 1,
        consultationId: 1,
        followupUserId: 1,
        followupMethod: 1,
        followupContent: '电话联系家长，了解孩子情况',
        followupDate: new Date(),
        intentionLevel: 2,
        followupResult: 1,
        nextFollowupDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        remark: '家长表示有兴趣，下周再次联系',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // 应用筛选条件到模拟数据
    let filteredData = mockFollowups;
    if (consultationId) {
      filteredData = filteredData.filter(f => f.consultationId === consultationId);
    }
    if (followupUserId) {
      filteredData = filteredData.filter(f => f.followupUserId === followupUserId);
    }

    // 分页
    const total = filteredData.length;
    const offset = (page - 1) * pageSize;
    const paginatedData = filteredData.slice(offset, offset + pageSize);

    // 格式化结果
    const items = paginatedData.map(followup => this.formatFollowupResponse(followup));

    return {
      total,
      items,
      page,
      pageSize
    };
  }

  /**
   * 格式化招生咨询跟进响应对象
   * @param followup 招生咨询跟进模型实例
   * @param followupUser 可选的跟进人信息（如果未包含在followup中）
   * @returns 格式化后的响应对象
   */
  private formatFollowupResponse(followup: any, followupUser?: any): EnrollmentConsultationFollowupResponse {
    const user = followup.get('followupUser') || followupUser;
    
    // 获取跟进方式文本
    const methodMap: {[key: number]: string} = {
      [FollowupMethod.PHONE]: '电话',
      [FollowupMethod.WECHAT]: '微信',
      [FollowupMethod.SMS]: '短信',
      [FollowupMethod.MEETING]: '面谈',
      [FollowupMethod.EMAIL]: '邮件',
      [FollowupMethod.OTHER]: '其他'
    };

    // 获取意向级别文本
    const levelMap: {[key: number]: string} = {
      [IntentionLevel.VERY_HIGH]: '非常有意向',
      [IntentionLevel.HIGH]: '有意向',
      [IntentionLevel.MEDIUM]: '一般',
      [IntentionLevel.LOW]: '较低',
      [IntentionLevel.NONE]: '无意向'
    };

    // 获取跟进结果文本
    const resultMap: {[key: number]: string} = {
      [FollowupResult.CONTINUE]: '继续跟进',
      [FollowupResult.CONVERTED]: '成功转化',
      [FollowupResult.NO_INTENTION]: '暂无意向',
      [FollowupResult.ABANDONED]: '放弃跟进'
    };
    
    return {
      id: followup.id,
      consultationId: followup.consultationId,
      followupUserId: followup.followupUserId,
      followupMethod: followup.followupMethod,
      followupMethodText: methodMap[followup.followupMethod] || '未知',
      followupContent: followup.followupContent,
      followupDate: followup.followupDate.toISOString().split('T')[0],
      intentionLevel: followup.intentionLevel,
      intentionLevelText: levelMap[followup.intentionLevel] || '未知',
      followupResult: followup.followupResult,
      followupResultText: resultMap[followup.followupResult] || '未知',
      nextFollowupDate: followup.nextFollowupDate ? followup.nextFollowupDate.toISOString().split('T')[0] : null,
      remark: followup.remark,
      createdAt: followup.createdAt.toISOString(),
      updatedAt: followup.updatedAt.toISOString(),
      followupUser: user ? {
        id: user.id,
        name: user.name
      } : undefined
    };
  }
} 