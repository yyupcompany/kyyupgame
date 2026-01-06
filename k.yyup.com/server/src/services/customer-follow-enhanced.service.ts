import { CustomerFollowRecordEnhanced } from '../models/customer-follow-record-enhanced.model';
import { CustomerFollowStage } from '../models/customer-follow-stage.model';
import { CustomerFollowMedia } from '../models/customer-follow-media.model';
import { CustomerFollowAIService, AISuggestionRequest, CustomerInfo } from './ai/customer-follow-ai.service';
import { sequelize } from '../init';
import { QueryTypes, Transaction } from 'sequelize';

export interface CreateFollowRecordRequest {
  customerId: number;
  teacherId: number;
  stage: number;
  subStage: string;
  followType: string;
  content: string;
  customerFeedback?: string;
  mediaFiles?: Express.Multer.File[];
  nextFollowDate?: Date;
}

export interface UpdateFollowRecordRequest {
  id: number;
  content?: string;
  customerFeedback?: string;
  stageStatus?: 'pending' | 'in_progress' | 'completed' | 'skipped';
  nextFollowDate?: Date;
  completedAt?: Date;
}

export interface TimelineItem {
  id: number;
  stage: number;
  stageName: string;
  subStage: string;
  followType: string;
  content: string;
  customerFeedback?: string;
  aiSuggestions?: any;
  stageStatus: string;
  mediaFiles?: any[];
  teacherName: string;
  createdAt: Date;
  completedAt?: Date;
}

/**
 * 增强版客户跟进服务
 * 提供完整的客户跟进管理功能
 */
export class CustomerFollowEnhancedService {
  private aiService: CustomerFollowAIService;

  constructor() {
    this.aiService = new CustomerFollowAIService();
  }

  /**
   * 创建跟进记录
   */
  async createFollowRecord(request: CreateFollowRecordRequest): Promise<CustomerFollowRecordEnhanced> {
    const transaction = await sequelize.transaction();
    
    try {
      // 创建跟进记录
      const followRecord = await CustomerFollowRecordEnhanced.create({
        customerId: request.customerId,
        teacherId: request.teacherId,
        stage: request.stage,
        subStage: request.subStage,
        followType: request.followType,
        content: request.content,
        customerFeedback: request.customerFeedback,
        stageStatus: 'in_progress',
        nextFollowDate: request.nextFollowDate
      }, { transaction });

      // 处理媒体文件上传
      if (request.mediaFiles && request.mediaFiles.length > 0) {
        await this.handleMediaFiles(followRecord.id, request.mediaFiles, request.teacherId, transaction);
      }

      // 异步生成AI建议
      this.generateAISuggestions(followRecord.id, request.customerId, request.stage, request.subStage, request.content);

      await transaction.commit();
      return followRecord;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 更新跟进记录
   */
  async updateFollowRecord(request: UpdateFollowRecordRequest): Promise<CustomerFollowRecordEnhanced> {
    const followRecord = await CustomerFollowRecordEnhanced.findByPk(request.id);
    if (!followRecord) {
      throw new Error('跟进记录不存在');
    }

    const updateData: any = {};
    if (request.content !== undefined) updateData.content = request.content;
    if (request.customerFeedback !== undefined) updateData.customerFeedback = request.customerFeedback;
    if (request.stageStatus !== undefined) updateData.stageStatus = request.stageStatus;
    if (request.nextFollowDate !== undefined) updateData.nextFollowDate = request.nextFollowDate;
    if (request.completedAt !== undefined) updateData.completedAt = request.completedAt;

    await followRecord.update(updateData);
    return followRecord;
  }

  /**
   * 获取客户的完整跟进时间线
   */
  async getCustomerTimeline(customerId: number, teacherId?: number): Promise<TimelineItem[]> {
    const whereClause = teacherId 
      ? 'WHERE cfre.customer_id = :customerId AND cfre.teacher_id = :teacherId'
      : 'WHERE cfre.customer_id = :customerId';

    const replacements: any = { customerId };
    if (teacherId) replacements.teacherId = teacherId;

    const records = await sequelize.query(`
      SELECT 
        cfre.id,
        cfre.stage,
        cfre.sub_stage as subStage,
        cfre.follow_type as followType,
        cfre.content,
        cfre.customer_feedback as customerFeedback,
        cfre.ai_suggestions as aiSuggestions,
        cfre.stage_status as stageStatus,
        cfre.media_files as mediaFiles,
        cfre.created_at as createdAt,
        cfre.completed_at as completedAt,
        u.real_name as teacherName
      FROM customer_follow_records_enhanced cfre
      LEFT JOIN users u ON cfre.teacher_id = u.id
      ${whereClause}
      ORDER BY cfre.stage ASC, cfre.created_at ASC
    `, {
      replacements,
      type: QueryTypes.SELECT
    });

    return (records as any[]).map(record => ({
      ...record,
      stageName: this.getStageDisplayName(record.stage),
      aiSuggestions: record.aiSuggestions ? JSON.parse(record.aiSuggestions) : null,
      mediaFiles: record.mediaFiles ? JSON.parse(record.mediaFiles) : null
    }));
  }

  /**
   * 获取阶段配置
   */
  async getStageConfigurations(): Promise<CustomerFollowStage[]> {
    return await CustomerFollowStage.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']]
    });
  }

  /**
   * 获取AI建议
   */
  async getAISuggestions(followRecordId: number): Promise<any> {
    const record = await CustomerFollowRecordEnhanced.findByPk(followRecordId);
    if (!record) {
      throw new Error('跟进记录不存在');
    }

    if (record.aiSuggestions && !record.needsAISuggestion()) {
      return record.aiSuggestions;
    }

    // 重新生成AI建议
    await this.generateAISuggestions(
      record.id, 
      record.customerId, 
      record.stage, 
      record.subStage, 
      record.content
    );

    // 返回更新后的建议
    await record.reload();
    return record.aiSuggestions;
  }

  /**
   * 处理媒体文件上传
   */
  private async handleMediaFiles(
    followRecordId: number, 
    files: Express.Multer.File[], 
    uploadedBy: number,
    transaction: Transaction
  ): Promise<void> {
    const mediaRecords = files.map(file => ({
      followRecordId,
      mediaType: this.getMediaType(file.mimetype),
      fileName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy
    }));

    await CustomerFollowMedia.bulkCreate(mediaRecords, { transaction });
  }

  /**
   * 异步生成AI建议
   */
  private async generateAISuggestions(
    followRecordId: number,
    customerId: number,
    stage: number,
    subStage: string,
    content: string
  ): Promise<void> {
    try {
      // 获取客户信息
      const customerInfo = await this.getCustomerInfo(customerId);
      
      // 构建AI请求
      const aiRequest: AISuggestionRequest = {
        customerInfo,
        stage,
        subStage,
        currentContent: content
      };

      // 获取AI建议
      const suggestions = await this.aiService.getFollowUpSuggestions(aiRequest);

      // 更新记录
      await CustomerFollowRecordEnhanced.update(
        { aiSuggestions: suggestions },
        { where: { id: followRecordId } }
      );

    } catch (error) {
      console.error('生成AI建议失败:', error);
    }
  }

  /**
   * 获取客户信息
   */
  private async getCustomerInfo(customerId: number): Promise<CustomerInfo> {
    // 这里需要根据实际的客户表结构来查询
    // 暂时返回模拟数据
    const [customerData] = await sequelize.query(`
      SELECT 
        customer_name as customerName,
        child_name as childName,
        child_age as childAge,
        phone as contactPhone,
        source
      FROM teacher_customers 
      WHERE id = :customerId
    `, {
      replacements: { customerId },
      type: QueryTypes.SELECT
    });

    if (!customerData) {
      throw new Error('客户信息不存在');
    }

    // 获取历史互动记录
    const previousInteractions = await this.getPreviousInteractions(customerId);

    return {
      ...(customerData as any),
      currentStage: 1, // 需要根据实际情况计算
      previousInteractions
    };
  }

  /**
   * 获取历史互动记录
   */
  private async getPreviousInteractions(customerId: number): Promise<string[]> {
    const records = await sequelize.query(`
      SELECT content, created_at
      FROM customer_follow_records_enhanced
      WHERE customer_id = :customerId
      ORDER BY created_at DESC
      LIMIT 5
    `, {
      replacements: { customerId },
      type: QueryTypes.SELECT
    });

    return (records as any[]).map(record => 
      `${record.created_at}: ${record.content}`
    );
  }

  /**
   * 获取媒体类型
   */
  private getMediaType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }

  /**
   * 获取阶段显示名称
   */
  private getStageDisplayName(stage: number): string {
    const stageNames = {
      1: '初期接触', 2: '需求挖掘', 3: '方案展示', 4: '实地体验',
      5: '异议处理', 6: '促成决策', 7: '缴费确认', 8: '入园准备'
    };
    return stageNames[stage as keyof typeof stageNames] || '未知阶段';
  }
}

export default CustomerFollowEnhancedService;
