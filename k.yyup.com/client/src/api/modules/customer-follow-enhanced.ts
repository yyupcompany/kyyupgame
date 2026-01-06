import { request } from '@/utils/request';
import { API_PREFIX } from '../endpoints/base';

// 类型定义
export interface TimelineItem {
  id: number;
  stage: number;
  stageName: string;
  subStage: string;
  followType: string;
  content: string;
  customerFeedback?: string;
  aiSuggestions?: AISuggestions;
  stageStatus: 'pending' | 'in_progress' | 'completed' | 'skipped';
  mediaFiles?: MediaFile[];
  teacherName: string;
  createdAt: string;
  completedAt?: string;
}

export interface AISuggestions {
  suggestions: {
    communicationStrategy: string;
    recommendedActions: string[];
    talkingPoints: string[];
    nextStepTiming: string;
    potentialConcerns: string[];
    successTips: string[];
  };
  confidence: number;
  generatedAt: string;
}

export interface MediaFile {
  id: number;
  mediaType: 'image' | 'video' | 'audio' | 'document';
  fileName: string;
  filePath: string;
  fileSize: number;
  description?: string;
}

export interface StageConfiguration {
  id: number;
  stageNumber: number;
  stageName: string;
  stageDescription: string;
  subStages: SubStage[];
  defaultDuration: number;
  isRequired: boolean;
  sortOrder: number;
}

export interface SubStage {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

export interface CreateFollowRecordRequest {
  customerId: number;
  stage: number;
  subStage: string;
  followType: string;
  content: string;
  customerFeedback?: string;
  nextFollowDate?: string;
  mediaFiles?: File[];
}

export interface UpdateFollowRecordRequest {
  content?: string;
  customerFeedback?: string;
  stageStatus?: 'pending' | 'in_progress' | 'completed' | 'skipped';
  nextFollowDate?: string;
  completedAt?: string;
}

// 客户跟进增强版API端点
const CUSTOMER_FOLLOW_ENDPOINTS = {
  RECORDS: `${API_PREFIX}/customer-follow-enhanced/records`,
  RECORD_BY_ID: (id: number) => `${API_PREFIX}/customer-follow-enhanced/records/${id}`,
  CUSTOMER_TIMELINE: (customerId: number) => `${API_PREFIX}/customer-follow-enhanced/customers/${customerId}/timeline`,
  STAGES: `${API_PREFIX}/customer-follow-enhanced/stages`,
  RECORD_AI_SUGGESTIONS: (id: number) => `${API_PREFIX}/customer-follow-enhanced/records/${id}/ai-suggestions`,
  RECORD_COMPLETE: (id: number) => `${API_PREFIX}/customer-follow-enhanced/records/${id}/complete`,
  RECORD_SKIP: (id: number) => `${API_PREFIX}/customer-follow-enhanced/records/${id}/skip`,
  RECORD_REFRESH_AI: (id: number) => `${API_PREFIX}/customer-follow-enhanced/records/${id}/refresh-ai`
} as const

/**
 * 客户跟进增强版API服务
 */
export class CustomerFollowEnhancedAPI {
  
  /**
   * 创建跟进记录
   */
  static async createFollowRecord(data: CreateFollowRecordRequest) {
    const formData = new FormData();
    
    // 添加基本字段
    formData.append('customerId', data.customerId.toString());
    formData.append('stage', data.stage.toString());
    formData.append('subStage', data.subStage);
    formData.append('followType', data.followType);
    formData.append('content', data.content);
    
    if (data.customerFeedback) {
      formData.append('customerFeedback', data.customerFeedback);
    }
    
    if (data.nextFollowDate) {
      formData.append('nextFollowDate', data.nextFollowDate);
    }
    
    // 添加媒体文件
    if (data.mediaFiles && data.mediaFiles.length > 0) {
      data.mediaFiles.forEach(file => {
        formData.append('mediaFiles', file);
      });
    }

    return request.post(CUSTOMER_FOLLOW_ENDPOINTS.RECORDS, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  /**
   * 更新跟进记录
   */
  static async updateFollowRecord(id: number, data: UpdateFollowRecordRequest) {
    return request.put(CUSTOMER_FOLLOW_ENDPOINTS.RECORD_BY_ID(id), data);
  }

  /**
   * 获取客户跟进时间线
   */
  static async getCustomerTimeline(customerId: number): Promise<TimelineItem[]> {
    const response = await request.get(CUSTOMER_FOLLOW_ENDPOINTS.CUSTOMER_TIMELINE(customerId));
    return response.data;
  }

  /**
   * 获取阶段配置
   */
  static async getStageConfigurations(): Promise<StageConfiguration[]> {
    const response = await request.get(CUSTOMER_FOLLOW_ENDPOINTS.STAGES);
    return response.data;
  }

  /**
   * 获取AI建议
   */
  static async getAISuggestions(followRecordId: number): Promise<AISuggestions> {
    const response = await request.get(CUSTOMER_FOLLOW_ENDPOINTS.RECORD_AI_SUGGESTIONS(followRecordId));
    return response.data;
  }

  /**
   * 完成阶段
   */
  static async completeStage(followRecordId: number) {
    return request.post(CUSTOMER_FOLLOW_ENDPOINTS.RECORD_COMPLETE(followRecordId));
  }

  /**
   * 跳过阶段
   */
  static async skipStage(followRecordId: number, reason?: string) {
    return request.post(CUSTOMER_FOLLOW_ENDPOINTS.RECORD_SKIP(followRecordId), { reason });
  }

  /**
   * 刷新AI建议
   */
  static async refreshAISuggestions(followRecordId: number): Promise<AISuggestions> {
    // 先触发AI建议生成，然后获取最新建议
    await request.post(CUSTOMER_FOLLOW_ENDPOINTS.RECORD_REFRESH_AI(followRecordId));
    return this.getAISuggestions(followRecordId);
  }
}

export default CustomerFollowEnhancedAPI;
