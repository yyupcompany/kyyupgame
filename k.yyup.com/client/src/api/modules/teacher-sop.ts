import { request } from '@/utils/request';

/**
 * 教师SOP API模块
 */

// ==================== 类型定义 ====================

export interface SOPStage {
  id: number;
  name: string;
  description?: string;
  orderNum: number;
  estimatedDays?: number;
  successCriteria?: {
    description: string;
    checkpoints: string[];
  };
  scripts?: {
    opening: string;
    keyPoints: string[];
    closing: string;
  };
  faqs?: Array<{
    question: string;
    answer: string;
    tips: string[];
  }>;
  isActive: boolean;
}

export interface SOPTask {
  id: number;
  stageId: number;
  title: string;
  description?: string;
  isRequired: boolean;
  estimatedTime?: number;
  orderNum: number;
  guidance?: {
    steps: string[];
    tips: string[];
    examples: string[];
  };
  aiSuggestionConfig?: {
    enabled: boolean;
    prompt: string;
  };
  isActive: boolean;
}

export interface CustomerSOPProgress {
  id: number;
  customerId: number;
  teacherId: number;
  currentStageId: number;
  stageProgress?: number;
  completedTasks?: number[];
  estimatedCloseDate?: string;
  successProbability?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConversationRecord {
  id: number;
  customerId: number;
  teacherId: number;
  followRecordId?: number;
  speakerType: 'teacher' | 'customer';
  content: string;
  messageType: 'text' | 'image' | 'voice' | 'video';
  mediaUrl?: string;
  sentiment?: string;
  aiAnalysis?: {
    focusPoints?: string[];
    sentiment?: string;
    suggestedResponse?: string;
    nextAction?: string;
  };
  createdAt?: string;
}

export interface ConversationScreenshot {
  id: number;
  conversationId?: number;
  customerId: number;
  imageUrl: string;
  recognizedText?: string;
  aiAnalysis?: {
    recognizedText?: string;
    focusPoints?: string[];
    sentiment?: string;
    suggestedResponse?: string;
    nextAction?: string;
  };
  uploadedBy: number;
  createdAt?: string;
}

export interface AISuggestion {
  strategy?: {
    title: string;
    description: string;
    keyPoints: string[];
  };
  scripts?: {
    opening: string;
    core: string[];
    objections: Array<{
      question: string;
      answer: string;
    }>;
  };
  nextActions?: Array<{
    title: string;
    description: string;
    timing: string;
    tips: string[];
  }>;
  successProbability?: number;
  factors?: Array<{
    name: string;
    score: number;
  }>;
}

// ==================== API方法 ====================

/**
 * 获取所有SOP阶段
 */
export function getAllStages() {
  return request.get<SOPStage[]>('/teacher-sop/stages');
}

/**
 * 获取阶段详情
 */
export function getStageById(id: number) {
  return request.get<SOPStage>(`/teacher-sop/stages/${id}`);
}

/**
 * 获取阶段的所有任务
 */
export function getTasksByStage(stageId: number) {
  return request.get<SOPTask[]>(`/teacher-sop/stages/${stageId}/tasks`);
}

/**
 * 获取客户SOP进度
 */
export function getCustomerProgress(customerId: number) {
  return request.get<CustomerSOPProgress>(`/teacher-sop/customers/${customerId}/progress`);
}

/**
 * 更新客户SOP进度
 */
export function updateCustomerProgress(customerId: number, data: Partial<CustomerSOPProgress>) {
  return request.put<CustomerSOPProgress>(`/teacher-sop/customers/${customerId}/progress`, data);
}

/**
 * 完成任务
 */
export function completeTask(customerId: number, taskId: number) {
  return request.post<CustomerSOPProgress>(`/teacher-sop/customers/${customerId}/tasks/${taskId}/complete`);
}

/**
 * 推进到下一阶段
 */
export function advanceToNextStage(customerId: number) {
  return request.post<CustomerSOPProgress>(`/teacher-sop/customers/${customerId}/progress/advance`);
}

/**
 * 获取对话记录
 */
export function getConversations(customerId: number) {
  return request.get<ConversationRecord[]>(`/teacher-sop/customers/${customerId}/conversations`);
}

/**
 * 添加对话记录
 */
export function addConversation(customerId: number, data: {
  speakerType: 'teacher' | 'customer';
  content: string;
  messageType?: 'text' | 'image' | 'voice' | 'video';
  mediaUrl?: string;
}) {
  return request.post<ConversationRecord>(`/teacher-sop/customers/${customerId}/conversations`, data);
}

/**
 * 批量添加对话记录
 */
export function addConversationsBatch(customerId: number, conversations: Array<{
  speakerType: 'teacher' | 'customer';
  content: string;
  messageType?: 'text' | 'image' | 'voice' | 'video';
}>) {
  return request.post<ConversationRecord[]>(`/teacher-sop/customers/${customerId}/conversations/batch`, {
    conversations
  });
}

/**
 * 上传截图
 */
export function uploadScreenshot(customerId: number, data: {
  imageUrl: string;
  conversationId?: number;
}) {
  return request.post<ConversationScreenshot>(`/teacher-sop/customers/${customerId}/screenshots/upload`, data);
}

/**
 * 分析截图
 */
export function analyzeScreenshot(customerId: number, screenshotId: number) {
  return request.post<any>(`/teacher-sop/customers/${customerId}/screenshots/${screenshotId}/analyze`);
}

/**
 * 获取任务AI建议
 */
export function getTaskAISuggestion(customerId: number, taskId: number) {
  return request.post<AISuggestion>(`/teacher-sop/customers/${customerId}/ai-suggestions/task`, {
    taskId
  });
}

/**
 * 获取全局AI分析
 */
export function getGlobalAIAnalysis(customerId: number) {
  return request.post<AISuggestion & {
    successProbability: number;
    currentProgress: {
      stage: number;
      progress: number;
    };
  }>(`/teacher-sop/customers/${customerId}/ai-suggestions/global`);
}

export default {
  getAllStages,
  getStageById,
  getTasksByStage,
  getCustomerProgress,
  updateCustomerProgress,
  completeTask,
  advanceToNextStage,
  getConversations,
  addConversation,
  addConversationsBatch,
  uploadScreenshot,
  analyzeScreenshot,
  getTaskAISuggestion,
  getGlobalAIAnalysis
};

