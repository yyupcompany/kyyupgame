import { Activity, ActivityStatus, ActivityType } from "../../models/activity.model";
import { ActivityShare } from "../../models/activity-share.model";
import { sequelize } from "../../init";
import { Transaction, QueryTypes } from "sequelize";
import { ApiError } from "../../utils/apiError";
import { Kindergarten } from "../../models/kindergarten.model";
import { User } from "../../models/user.model";

export interface CreateActivityDto {
  kindergartenId: number;
  planId?: number;
  title: string;
  activityType: ActivityType;
  coverImage?: string;
  startTime: Date | string;
  endTime: Date | string;
  location: string;
  capacity: number;
  fee?: number;
  description?: string;
  agenda?: string;
  registrationStartTime: Date | string;
  registrationEndTime: Date | string;
  needsApproval?: boolean;
  status?: ActivityStatus;
  remark?: string;
  marketingConfig?: any;  // 营销配置（团购、积分、优惠券、分销）
  posterId?: number;  // 海报ID
  posterUrl?: string;  // 海报URL
  sharePosterUrl?: string;  // 分享海报URL
  publishStatus?: number;  // 发布状态
}

export interface UpdateActivityDto extends Partial<CreateActivityDto> {
  registeredCount?: number;
  checkedInCount?: number;
}

export interface ActivityFilterParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  kindergartenId?: number;
  planId?: number;
  activityType?: ActivityType;
  status?: ActivityStatus;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class ActivityService {
  /**
   * 创建活动
   */
  async createActivity(dto: CreateActivityDto, creatorId: number): Promise<Activity> {
    const transaction = await sequelize.transaction();
    
    try {
      // 验证幼儿园是否存在 - 只查询必要字段，避免查询不存在的列
      const kindergarten = await Kindergarten.findByPk(dto.kindergartenId, {
        attributes: ['id', 'name', 'code', 'status'],
        transaction
      });
      if (!kindergarten) {
        throw ApiError.notFound('指定的幼儿园不存在');
      }

      // 验证活动时间
      const startTime = new Date(dto.startTime);
      const endTime = new Date(dto.endTime);

      if (isNaN(startTime.getTime())) {
        throw ApiError.badRequest('活动开始时间格式不正确');
      }
      if (isNaN(endTime.getTime())) {
        throw ApiError.badRequest('活动结束时间格式不正确');
      }
      if (startTime >= endTime) {
        throw ApiError.badRequest('活动结束时间必须晚于开始时间');
      }

      // 处理报名时间：如果没有提供或为空，使用默认值
      let regStartTime: Date;
      let regEndTime: Date;

      if (dto.registrationStartTime && dto.registrationStartTime !== '') {
        regStartTime = new Date(dto.registrationStartTime);
        if (isNaN(regStartTime.getTime())) {
          regStartTime = new Date(); // 默认为当前时间
        }
      } else {
        regStartTime = new Date(); // 默认为当前时间
      }

      if (dto.registrationEndTime && dto.registrationEndTime !== '') {
        regEndTime = new Date(dto.registrationEndTime);
        if (isNaN(regEndTime.getTime())) {
          // 默认为活动开始前1小时
          regEndTime = new Date(startTime.getTime() - 60 * 60 * 1000);
        }
      } else {
        // 默认为活动开始前1小时
        regEndTime = new Date(startTime.getTime() - 60 * 60 * 1000);
      }

      // 验证报名时间逻辑
      if (regStartTime >= regEndTime) {
        // 如果报名开始时间晚于结束时间，自动调整
        regEndTime = new Date(startTime.getTime() - 60 * 60 * 1000);
      }

      console.log('📝 创建活动，时间配置:', {
        startTime,
        endTime,
        regStartTime,
        regEndTime
      });

      // 创建活动 - 严格只使用Activity模型支持的字段，忽略其他所有字段
      const activityData = {
        kindergartenId: dto.kindergartenId,
        planId: dto.planId || null,
        title: dto.title,
        activityType: dto.activityType,
        coverImage: dto.coverImage || null,
        startTime,
        endTime,
        location: dto.location,
        capacity: dto.capacity,
        registeredCount: 0,
        checkedInCount: 0,
        fee: dto.fee || 0,
        description: dto.description || null,
        agenda: dto.agenda || null,
        registrationStartTime: regStartTime,
        registrationEndTime: regEndTime,
        needsApproval: dto.needsApproval ?? false,
        status: dto.status ?? ActivityStatus.PLANNED,
        remark: dto.remark || null,
        creatorId,
        updaterId: creatorId,
        // 海报和营销相关字段
        posterId: dto.posterId || null,
        posterUrl: dto.posterUrl || null,
        sharePosterUrl: dto.sharePosterUrl || null,
        marketingConfig: dto.marketingConfig || null,
        publishStatus: dto.publishStatus ?? 0,
        shareCount: 0,
        viewCount: 0
      };

      console.log('📝 创建活动，严格过滤后的有效字段:', activityData);
      
      // 使用 fields 选项明确指定要插入的字段，防止任何额外字段被插入
      const activity = await Activity.create(activityData, { 
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
      return this.getActivityById(activity.id);
    } catch (error) {
      await transaction.rollback();
      console.error('❌ 创建活动失败:', error);
      throw error;
    }
  }

  /**
   * 获取活动列表
   */
  async getActivities(filters: ActivityFilterParams): Promise<{ rows: Activity[]; count: number }> {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      kindergartenId,
      planId,
      activityType,
      status,
      startDate,
      endDate,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;

    // 确保分页参数是数字类型
    const safePage = Math.max(1, parseInt(String(page), 10) || 1);
    const safePageSize = Math.max(1, Math.min(100, parseInt(String(pageSize), 10) || 10));

    // 构建查询条件
    const conditions: string[] = ['a.deleted_at IS NULL'];
    const replacements: Record<string, any> = {};

    if (keyword) {
      conditions.push('(a.title LIKE :keyword OR a.description LIKE :keyword)');
      replacements.keyword = `%${keyword}%`;
    }

    if (kindergartenId) {
      conditions.push('a.kindergarten_id = :kindergartenId');
      replacements.kindergartenId = kindergartenId;
    }

    if (planId !== undefined && !isNaN(planId)) {
      conditions.push('a.plan_id = :planId');
      replacements.planId = planId;
    }

    if (activityType !== undefined && !isNaN(activityType)) {
      conditions.push('a.activity_type = :activityType');
      replacements.activityType = activityType;
    }

    if (status !== undefined && !isNaN(status)) {
      conditions.push('a.status = :status');
      replacements.status = status;
    }

    if (startDate) {
      conditions.push('DATE(a.start_time) >= :startDate');
      replacements.startDate = startDate;
    }

    if (endDate) {
      conditions.push('DATE(a.start_time) <= :endDate');
      replacements.endDate = endDate;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 计数查询
    const countQuery = `
      SELECT COUNT(*) as total
      FROM activities a
      ${whereClause}
    `;

    const [countResult] = await sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT
    }) as any[];

    const total = parseInt(countResult.total) || 0;

    // 数据查询
    const offset = (safePage - 1) * safePageSize;
    const dataQuery = `
      SELECT 
        a.*,
        k.name as kindergarten_name,
        u.real_name as creator_name
      FROM activities a
      LEFT JOIN kindergartens k ON a.kindergarten_id = k.id
      LEFT JOIN users u ON a.creator_id = u.id
      ${whereClause}
      ORDER BY a.${sortBy} ${sortOrder}
      LIMIT :limit OFFSET :offset
    `;

    const rows = await sequelize.query(dataQuery, {
      replacements: {
        ...replacements,
        limit: safePageSize,
        offset
      },
      type: QueryTypes.SELECT
    }) as Activity[];

    return { rows, count: total };
  }

  /**
   * 获取活动详情
   */
  async getActivityById(id: number): Promise<Activity> {
    const query = `
      SELECT
        a.id,
        a.kindergarten_id,
        a.plan_id,
        a.title,
        a.activity_type,
        a.cover_image,
        a.start_time as startTime,
        a.end_time as endTime,
        a.location,
        a.capacity,
        a.registered_count,
        a.checked_in_count,
        a.fee,
        a.description,
        a.agenda,
        a.registration_start_time as registrationStartTime,
        a.registration_end_time as registrationEndTime,
        a.needs_approval,
        a.status,
        a.remark,
        a.creator_id,
        a.updater_id,
        a.poster_id,
        a.poster_url,
        a.share_poster_url,
        a.marketing_config,
        a.publish_status,
        a.share_count,
        a.view_count,
        a.created_at as createdAt,
        a.updated_at as updatedAt,
        a.deleted_at,
        k.name as kindergarten_name,
        u.real_name as creator_name
      FROM activities a
      LEFT JOIN kindergartens k ON a.kindergarten_id = k.id
      LEFT JOIN users u ON a.creator_id = u.id
      WHERE a.id = :id AND a.deleted_at IS NULL
    `;

    const results = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT
    }) as Activity[];

    if (results.length === 0) {
      throw ApiError.notFound('活动不存在');
    }

    return results[0];
  }

  /**
   * 更新活动信息
   */
  async updateActivity(id: number, dto: UpdateActivityDto, updaterId: number): Promise<Activity> {
    const transaction = await sequelize.transaction();

    try {
      // 检查活动是否存在
      const activity = await Activity.findByPk(id, { transaction });
      if (!activity || activity.deletedAt) {
        throw ApiError.notFound('活动不存在');
      }

      // 验证时间逻辑（如果更新了时间字段）
      if (dto.startTime || dto.endTime) {
        const startTime = new Date(dto.startTime || activity.startTime);
        const endTime = new Date(dto.endTime || activity.endTime);
        
        if (startTime >= endTime) {
          throw ApiError.badRequest('活动结束时间必须晚于开始时间');
        }
      }

      // 准备更新数据
      const updateData: any = {
        updaterId,
        updatedAt: new Date()
      };
      
      // 只更新提供的字段
      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.activityType !== undefined) updateData.activityType = dto.activityType;
      if (dto.startTime !== undefined) updateData.startTime = new Date(dto.startTime);
      if (dto.endTime !== undefined) updateData.endTime = new Date(dto.endTime);
      if (dto.location !== undefined) updateData.location = dto.location;
      if (dto.capacity !== undefined) updateData.capacity = dto.capacity;
      if (dto.fee !== undefined) updateData.fee = dto.fee;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.agenda !== undefined) updateData.agenda = dto.agenda;
      if (dto.registrationStartTime !== undefined) updateData.registrationStartTime = new Date(dto.registrationStartTime);
      if (dto.registrationEndTime !== undefined) updateData.registrationEndTime = new Date(dto.registrationEndTime);
      if (dto.needsApproval !== undefined) updateData.needsApproval = dto.needsApproval;
      if (dto.remark !== undefined) updateData.remark = dto.remark;
      
      // 更新活动
      await activity.update(updateData, { transaction });

      await transaction.commit();
      return this.getActivityById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 删除活动（软删除）
   */
  async deleteActivity(id: number): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      const activity = await Activity.findByPk(id, { transaction });
      if (!activity || activity.deletedAt) {
        throw ApiError.notFound('活动不存在');
      }

      // 检查是否有报名记录
      const [registrationCount] = await sequelize.query(`
        SELECT COUNT(*) as count 
        FROM activity_registrations 
        WHERE activity_id = :activityId AND deleted_at IS NULL
      `, {
        replacements: { activityId: id },
        type: QueryTypes.SELECT,
        transaction
      }) as any[];

      if (parseInt(registrationCount.count) > 0) {
        throw ApiError.badRequest('该活动已有报名记录，无法删除');
      }

      // 软删除
      await activity.update({
        deletedAt: new Date()
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 更新活动状态
   */
  async updateActivityStatus(id: number, status: ActivityStatus, updaterId: number): Promise<Activity> {
    const transaction = await sequelize.transaction();

    try {
      const activity = await Activity.findByPk(id, { transaction });
      if (!activity || activity.deletedAt) {
        throw ApiError.notFound('活动不存在');
      }

      // 状态转换验证
      const currentStatus = activity.status;
      const validTransitions: Record<ActivityStatus, ActivityStatus[]> = {
        [ActivityStatus.PLANNED]: [ActivityStatus.REGISTRATION_OPEN, ActivityStatus.CANCELLED],
        [ActivityStatus.REGISTRATION_OPEN]: [ActivityStatus.FULL, ActivityStatus.IN_PROGRESS, ActivityStatus.CANCELLED],
        [ActivityStatus.FULL]: [ActivityStatus.IN_PROGRESS, ActivityStatus.CANCELLED],
        [ActivityStatus.IN_PROGRESS]: [ActivityStatus.FINISHED],
        [ActivityStatus.FINISHED]: [],
        [ActivityStatus.CANCELLED]: []
      };

      if (!validTransitions[currentStatus].includes(status)) {
        throw ApiError.badRequest(`无法从状态 ${currentStatus} 转换到 ${status}`);
      }

      await activity.update({
        status,
        updaterId,
        updatedAt: new Date()
      }, { transaction });

      await transaction.commit();
      return this.getActivityById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 获取活动统计信息
   */
  async getActivityStatistics(kindergartenId?: number): Promise<any> {
    const conditions = ['deleted_at IS NULL'];
    const replacements: Record<string, any> = {};

    if (kindergartenId) {
      conditions.push('kindergarten_id = :kindergartenId');
      replacements.kindergartenId = kindergartenId;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        COUNT(*) as total_activities,
        SUM(CASE WHEN status = ${ActivityStatus.PLANNED} THEN 1 ELSE 0 END) as planned,
        SUM(CASE WHEN status = ${ActivityStatus.REGISTRATION_OPEN} THEN 1 ELSE 0 END) as registration_open,
        SUM(CASE WHEN status = ${ActivityStatus.FULL} THEN 1 ELSE 0 END) as full,
        SUM(CASE WHEN status = ${ActivityStatus.IN_PROGRESS} THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = ${ActivityStatus.FINISHED} THEN 1 ELSE 0 END) as finished,
        SUM(CASE WHEN status = ${ActivityStatus.CANCELLED} THEN 1 ELSE 0 END) as cancelled,
        SUM(registered_count) as total_registrations,
        SUM(checked_in_count) as total_check_ins,
        AVG(CASE WHEN capacity > 0 THEN (registered_count * 100.0 / capacity) ELSE 0 END) as avg_registration_rate
      FROM activities
      ${whereClause}
    `;

    const [result] = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    }) as any[];

    return {
      totalActivities: parseInt(result.total_activities) || 0,
      statusDistribution: {
        planned: parseInt(result.planned) || 0,
        registrationOpen: parseInt(result.registration_open) || 0,
        full: parseInt(result.full) || 0,
        inProgress: parseInt(result.in_progress) || 0,
        finished: parseInt(result.finished) || 0,
        cancelled: parseInt(result.cancelled) || 0
      },
      totalRegistrations: parseInt(result.total_registrations) || 0,
      totalCheckIns: parseInt(result.total_check_ins) || 0,
      avgRegistrationRate: parseFloat(result.avg_registration_rate) || 0
    };
  }

  /**
   * 创建活动分享记录
   */
  async createActivityShare(shareData: {
    activityId: number;
    posterId?: number;
    shareChannel: string;
    shareUrl: string;
    sharerId: number;
    parentSharerId?: number;
    shareLevel?: number;
    shareIp?: string;
    shareContent?: string;
  }) {
    // 创建分享记录
    const share = await ActivityShare.create({
      activityId: shareData.activityId,
      posterId: shareData.posterId,
      shareChannel: shareData.shareChannel,
      shareUrl: shareData.shareUrl,
      sharerId: shareData.sharerId,
      parentSharerId: shareData.parentSharerId,
      shareLevel: shareData.shareLevel || 1,
      shareIp: shareData.shareIp
    });

    // 更新活动分享次数
    await this.incrementShareCount(shareData.activityId);

    return share;
  }

  /**
   * 获取用户对某活动的最新分享记录
   */
  async getLatestShareByUser(activityId: number, userId: number) {
    return await ActivityShare.findOne({
      where: {
        activityId,
        sharerId: userId
      },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * 查询分享层级关系
   * 返回指定用户的分享树（包含下级1-3级分享者）
   */
  async getShareHierarchy(activityId: number, userId: number) {
    // 查询用户的分享记录
    const userShare = await ActivityShare.findOne({
      where: {
        activityId,
        sharerId: userId
      },
      include: [
        {
          model: User,
          as: 'sharer',
          attributes: ['id', 'username', 'realName', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (!userShare) {
      return {
        user: null,
        shareLevel: 0,
        totalShares: 0,
        level1Shares: [],
        level2Shares: [],
        level3Shares: []
      };
    }

    // 查询一级分享（直接下级）
    const level1Shares = await ActivityShare.findAll({
      where: {
        activityId,
        parentSharerId: userId,
        shareLevel: userShare.shareLevel + 1
      },
      include: [
        {
          model: User,
          as: 'sharer',
          attributes: ['id', 'username', 'realName', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // 查询二级分享（一级的下级）
    const level1SharerIds = level1Shares.map(s => s.sharerId);
    const level2Shares = level1SharerIds.length > 0 ? await ActivityShare.findAll({
      where: {
        activityId,
        parentSharerId: level1SharerIds,
        shareLevel: userShare.shareLevel + 2
      },
      include: [
        {
          model: User,
          as: 'sharer',
          attributes: ['id', 'username', 'realName', 'phone']
        },
        {
          model: User,
          as: 'parentSharer',
          attributes: ['id', 'username', 'realName']
        }
      ],
      order: [['createdAt', 'DESC']]
    }) : [];

    // 查询三级分享（二级的下级）
    const level2SharerIds = level2Shares.map(s => s.sharerId);
    const level3Shares = level2SharerIds.length > 0 ? await ActivityShare.findAll({
      where: {
        activityId,
        parentSharerId: level2SharerIds,
        shareLevel: userShare.shareLevel + 3
      },
      include: [
        {
          model: User,
          as: 'sharer',
          attributes: ['id', 'username', 'realName', 'phone']
        },
        {
          model: User,
          as: 'parentSharer',
          attributes: ['id', 'username', 'realName']
        }
      ],
      order: [['createdAt', 'DESC']]
    }) : [];

    return {
      user: {
        id: userShare.sharerId,
        username: userShare.sharer?.username,
        realName: userShare.sharer?.realName,
        shareLevel: userShare.shareLevel,
        shareTime: userShare.createdAt
      },
      shareLevel: userShare.shareLevel,
      totalShares: level1Shares.length + level2Shares.length + level3Shares.length,
      level1Shares: level1Shares.map(s => ({
        id: s.id,
        sharerId: s.sharerId,
        username: s.sharer?.username,
        realName: s.sharer?.realName,
        phone: s.sharer?.phone,
        shareChannel: s.shareChannel,
        shareTime: s.createdAt,
        shareLevel: s.shareLevel
      })),
      level2Shares: level2Shares.map(s => ({
        id: s.id,
        sharerId: s.sharerId,
        username: s.sharer?.username,
        realName: s.sharer?.realName,
        phone: s.sharer?.phone,
        parentSharerId: s.parentSharerId,
        parentSharerName: s.parentSharer?.realName || s.parentSharer?.username,
        shareChannel: s.shareChannel,
        shareTime: s.createdAt,
        shareLevel: s.shareLevel
      })),
      level3Shares: level3Shares.map(s => ({
        id: s.id,
        sharerId: s.sharerId,
        username: s.sharer?.username,
        realName: s.sharer?.realName,
        phone: s.sharer?.phone,
        parentSharerId: s.parentSharerId,
        parentSharerName: s.parentSharer?.realName || s.parentSharer?.username,
        shareChannel: s.shareChannel,
        shareTime: s.createdAt,
        shareLevel: s.shareLevel
      }))
    };
  }

  /**
   * 增加活动分享次数
   */
  private async incrementShareCount(activityId: number) {
    await Activity.increment('shareCount', {
      where: { id: activityId }
    });
  }

  /**
   * 生成分享二维码
   */
  async generateShareQrcode(shareUrl: string): Promise<string> {
    const QRCode = require('qrcode');
    const fs = require('fs');
    const path = require('path');
    
    try {
      // 生成二维码图片
      const qrCodeDataUrl = await QRCode.toDataURL(shareUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // 将base64转换为文件
      const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
      const fileName = `qrcode_${Date.now()}.png`;
      const filePath = path.join(process.cwd(), 'public', 'qrcodes', fileName);
      
      // 确保目录存在
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // 保存文件
      fs.writeFileSync(filePath, base64Data, 'base64');

      // 返回访问URL
      const baseUrl = process.env.FRONTEND_URL || 'http://k.yyup.cc';
      return `${baseUrl}/qrcodes/${fileName}`;
    } catch (error) {
      console.error('生成二维码失败:', error);
      throw new Error('生成二维码失败');
    }
  }
}

export const activityService = new ActivityService();
