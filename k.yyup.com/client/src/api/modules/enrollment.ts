import { get, post, put, del, ApiResponse } from '@/utils/request';

/**
 * 招生申请状态
 */
export enum EnrollmentApplicationStatus {
  DRAFT = 'DRAFT',           // 草稿
  SUBMITTED = 'SUBMITTED',   // 已提交
  UNDER_REVIEW = 'UNDER_REVIEW', // 审核中
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED', // 面试已安排
  INTERVIEW_COMPLETED = 'INTERVIEW_COMPLETED', // 面试已完成
  APPROVED = 'APPROVED',     // 已录取
  REJECTED = 'REJECTED',     // 已拒绝
  CANCELED = 'CANCELED'      // 已取消
}

/**
 * 面试状态
 */
export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',     // 已安排
  IN_PROGRESS = 'IN_PROGRESS', // 进行中
  COMPLETED = 'COMPLETED',     // 已完成
  CANCELED = 'CANCELED',       // 已取消
  NO_SHOW = 'NO_SHOW'          // 未到场
}

/**
 * 审核状态
 */
export enum ReviewStatus {
  PENDING = 'PENDING',         // 待审核
  IN_PROGRESS = 'IN_PROGRESS', // 审核中
  APPROVED = 'APPROVED',       // 已通过
  REJECTED = 'REJECTED',       // 已拒绝
  REQUIRE_CHANGES = 'REQUIRE_CHANGES' // 需要修改
}

/**
 * 招生申请接口
 */
export interface EnrollmentApplication {
  id: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  age: number;
  preferredClass?: string;
  status: EnrollmentApplicationStatus;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

/**
 * 招生申请查询参数
 */
export interface EnrollmentApplicationQueryParams {
  page?: number;
  pageSize?: number;
  status?: EnrollmentApplicationStatus;
  studentName?: string;
  parentPhone?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 创建招生申请请求
 */
export interface CreateEnrollmentApplicationRequest {
  studentName: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  age: number;
  gender: 'male' | 'female';
  preferredClassId?: string;
  notes?: string;
  // 详细信息
  birthDate?: string;
  address?: string;
  healthInfo?: string;
  allergies?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  // 家庭信息
  familyMembers?: FamilyMember[];
  // 特长爱好
  hobbies?: string[];
  specialSkills?: string[];
  // 文件上传
  attachments?: ApplicationAttachment[];
}

/**
 * 家庭成员信息
 */
export interface FamilyMember {
  name: string;
  relationship: string;
  age?: number;
  occupation?: string;
  phone?: string;
}

/**
 * 申请附件
 */
export interface ApplicationAttachment {
  id: string;
  name: string;
  type: 'birth_certificate' | 'vaccine_record' | 'health_report' | 'photo' | 'other';
  url: string;
  size: number;
  uploadedAt: string;
}

/**
 * 面试安排
 */
export interface InterviewSchedule {
  id: string;
  applicationId: string;
  interviewerId: string;
  interviewerName: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number; // 面试时长（分钟）
  location: string;
  status: InterviewStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 面试官信息
 */
export interface Interviewer {
  id: string;
  name: string;
  title: string;
  department: string;
  specialties: string[];
  availability: TimeSlot[];
  rating?: number;
  interviewCount: number;
}

/**
 * 时间段
 */
export interface TimeSlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
}

/**
 * 面试评分
 */
export interface InterviewScore {
  id: string;
  interviewId: string;
  applicationId: string;
  interviewerId: string;
  criteria: ScoreCriteria[];
  totalScore: number;
  maxScore: number;
  comments: string;
  recommendation: 'approve' | 'reject' | 'further_review';
  createdAt: string;
}

/**
 * 评分标准
 */
export interface ScoreCriteria {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  comments?: string;
}

/**
 * 审核记录
 */
export interface ReviewRecord {
  id: string;
  applicationId: string;
  reviewerId: string;
  reviewerName: string;
  status: ReviewStatus;
  stage: 'initial' | 'secondary' | 'final';
  score?: number;
  comments: string;
  attachments?: ReviewAttachment[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 审核附件
 */
export interface ReviewAttachment {
  id: string;
  name: string;
  type: 'review_form' | 'checklist' | 'evidence' | 'other';
  url: string;
  size: number;
  uploadedAt: string;
}

/**
 * 招生管理API
 */
export const enrollmentApi = {
  /**
   * 获取招生申请列表
   */
  getApplications(params?: EnrollmentApplicationQueryParams): Promise<ApiResponse<{
    items: EnrollmentApplication[];
    total: number;
    page: number;
    pageSize: number;
  }>> {
    return get('/api/enrollment/list', { params });
  },

  /**
   * 获取招生申请详情
   */
  getApplication(id: string): Promise<ApiResponse<EnrollmentApplication>> {
    return get(`/api/enrollment/applications/${id}`);
  },

  /**
   * 创建招生申请
   */
  createApplication(data: CreateEnrollmentApplicationRequest): Promise<ApiResponse<EnrollmentApplication>> {
    return post('/api/enrollment/applications', data);
  },

  /**
   * 更新招生申请
   */
  updateApplication(id: string, data: Partial<CreateEnrollmentApplicationRequest>): Promise<ApiResponse<EnrollmentApplication>> {
    return put(`/api/enrollment/applications/${id}`, data);
  },

  /**
   * 删除招生申请
   */
  deleteApplication(id: string): Promise<ApiResponse> {
    return del(`/api/enrollment/applications/${id}`);
  },

  /**
   * 审核招生申请
   */
  reviewApplication(id: string, data: {
    status: EnrollmentApplicationStatus;
    notes?: string;
  }): Promise<ApiResponse<EnrollmentApplication>> {
    return put(`/api/enrollment/applications/${id}/review`, data);
  },

  /**
   * 批量审核招生申请
   */
  batchReviewApplications(data: {
    applicationIds: string[];
    status: EnrollmentApplicationStatus;
    notes?: string;
  }): Promise<ApiResponse> {
    return post('/api/enrollment/applications/batch-review', data);
  },

  // ===== 面试管理API =====

  /**
   * 获取面试安排列表
   */
  getInterviewSchedules(params?: {
    page?: number;
    pageSize?: number;
    status?: InterviewStatus;
    interviewerId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    items: InterviewSchedule[];
    total: number;
    page: number;
    pageSize: number;
  }>> {
    return get('/api/enrollment/interviews', { params });
  },

  /**
   * 创建面试安排
   */
  createInterviewSchedule(data: {
    applicationId: string;
    interviewerId: string;
    scheduledDate: string;
    scheduledTime: string;
    duration?: number;
    location?: string;
    notes?: string;
  }): Promise<ApiResponse<InterviewSchedule>> {
    return post('/api/enrollment/interviews', data);
  },

  /**
   * 更新面试安排
   */
  updateInterviewSchedule(id: string, data: Partial<{
    scheduledDate: string;
    scheduledTime: string;
    duration: number;
    location: string;
    status: InterviewStatus;
    notes: string;
  }>): Promise<ApiResponse<InterviewSchedule>> {
    return put(`/api/enrollment/interviews/${id}`, data);
  },

  /**
   * 获取面试官列表
   */
  getInterviewers(params?: {
    page?: number;
    pageSize?: number;
    department?: string;
    specialty?: string;
  }): Promise<ApiResponse<{
    items: Interviewer[];
    total: number;
    page: number;
    pageSize: number;
  }>> {
    return get('/api/enrollment/interviewers', { params });
  },

  /**
   * 获取可预约时间段
   */
  getAvailableTimeSlots(interviewerId: string, date: string): Promise<ApiResponse<TimeSlot[]>> {
    return get(`/api/enrollment/interviewers/${interviewerId}/availability`, { params: { date } });
  },

  /**
   * 提交面试评分
   */
  submitInterviewScore(data: {
    interviewId: string;
    criteria: ScoreCriteria[];
    comments: string;
    recommendation: 'approve' | 'reject' | 'further_review';
  }): Promise<ApiResponse<InterviewScore>> {
    return post('/api/enrollment/interviews/scores', data);
  },

  /**
   * 获取面试评分
   */
  getInterviewScore(interviewId: string): Promise<ApiResponse<InterviewScore>> {
    return get(`/api/enrollment/interviews/${interviewId}/score`);
  },

  // ===== 审核管理API =====

  /**
   * 获取审核队列
   */
  getReviewQueue(params?: {
    stage?: 'initial' | 'secondary' | 'final';
    status?: ReviewStatus;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<{
    items: (EnrollmentApplication & { reviews: ReviewRecord[] })[];
    total: number;
    page: number;
    pageSize: number;
  }>> {
    return get('/api/enrollment/reviews/queue', { params });
  },

  /**
   * 获取申请审核记录
   */
  getApplicationReviews(applicationId: string): Promise<ApiResponse<ReviewRecord[]>> {
    return get(`/api/enrollment/applications/${applicationId}/reviews`);
  },

  /**
   * 提交审核
   */
  submitReview(data: {
    applicationId: string;
    status: ReviewStatus;
    stage: 'initial' | 'secondary' | 'final';
    score?: number;
    comments: string;
    attachments?: ReviewAttachment[];
  }): Promise<ApiResponse<ReviewRecord>> {
    return post('/api/enrollment/reviews', data);
  },

  /**
   * 批量审核
   */
  batchReview(data: {
    applicationIds: string[];
    status: ReviewStatus;
    stage: 'initial' | 'secondary' | 'final';
    comments?: string;
  }): Promise<ApiResponse> {
    return post('/api/enrollment/reviews/batch', data);
  },

  /**
   * 分配审核任务
   */
  assignReviewTasks(data: {
    applicationIds: string[];
    reviewerId: string;
    stage: 'initial' | 'secondary' | 'final';
  }): Promise<ApiResponse> {
    return post('/api/enrollment/reviews/assign', data);
  },

  /**
   * 获取审核统计
   */
  getReviewStatistics(params?: {
    startDate?: string;
    endDate?: string;
    reviewerId?: string;
  }): Promise<ApiResponse<{
    totalReviews: number;
    pendingReviews: number;
    completedReviews: number;
    averageScore: number;
    approvalRate: number;
    averageReviewTime: number;
  }>> {
    return get('/api/enrollment/reviews/statistics', { params });
  },

  // ===== 文件上传API =====

  /**
   * 上传申请附件
   */
  uploadApplicationAttachment(data: {
    applicationId: string;
    type: 'birth_certificate' | 'vaccine_record' | 'health_report' | 'photo' | 'other';
    file: File;
  }): Promise<ApiResponse<ApplicationAttachment>> {
    const formData = new FormData();
    formData.append('applicationId', data.applicationId);
    formData.append('type', data.type);
    formData.append('file', data.file);

    return post('/api/enrollment/applications/upload', formData);
  },

  /**
   * 删除申请附件
   */
  deleteApplicationAttachment(attachmentId: string): Promise<ApiResponse> {
    return del(`/api/enrollment/applications/attachments/${attachmentId}`);
  },

  // ===== 通知API =====

  /**
   * 发送申请状态通知
   */
  sendApplicationNotification(data: {
    applicationId: string;
    type: 'status_change' | 'interview_scheduled' | 'review_result';
    channels: ('sms' | 'email' | 'wechat')[];
    customMessage?: string;
  }): Promise<ApiResponse> {
    return post('/api/enrollment/notifications/send', data);
  }
};

// 兼容性导出
export const getEnrollmentApplications = enrollmentApi.getApplications;
export const getEnrollmentApplication = enrollmentApi.getApplication;
export const createEnrollmentApplication = enrollmentApi.createApplication;
export const updateEnrollmentApplication = enrollmentApi.updateApplication;
export const deleteEnrollmentApplication = enrollmentApi.deleteApplication;
export const reviewEnrollmentApplication = enrollmentApi.reviewApplication;