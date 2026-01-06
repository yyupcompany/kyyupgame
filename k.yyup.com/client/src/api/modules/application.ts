// 申请模块API服务
import { request } from '@/utils/request';
import { API_PREFIX } from '../endpoints/base';

// API端点常量
const APPLICATION_ENDPOINTS = {
  BASE: `${API_PREFIX}/applications`,
  BY_ID: (id: string) => `${API_PREFIX}/applications/${id}`,
  REVIEW: (id: string) => `${API_PREFIX}/applications/${id}/review`,
  BATCH_REVIEW: `${API_PREFIX}/applications/batch-review`,
  HISTORY: (id: string) => `${API_PREFIX}/applications/${id}/history`,
  NOTICE: (id: string) => `${API_PREFIX}/applications/${id}/notice`,
  ATTACHMENTS: (id: string) => `${API_PREFIX}/applications/${id}/attachments`
} as const;

/**
 * 申请状态枚举
 */
export enum ApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  ENROLLED = 'ENROLLED'
}

/**
 * 申请数据接口
 */
export interface Application {
  id: string;
  childName: string;
  childGender: 'MALE' | 'FEMALE';
  childBirthday: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  address: string;
  preferredClass?: string;
  status: ApplicationStatus;
  comments?: string;
  enrollmentDate?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 申请查询参数接口
 */
export interface ApplicationQueryParams {
  keyword?: string;
  status?: ApplicationStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

/**
 * 申请审核参数接口
 */
export interface ApplicationReviewParams {
  status: ApplicationStatus.APPROVED | ApplicationStatus.REJECTED;
  comments?: string;
  enrollmentDate?: string;
}

/**
 * 获取申请列表
 * @param {ApplicationQueryParams} params - 查询参数
 * @returns {Promise<{ items: Application[], total: number }>} 申请列表和总数
 */
export const getApplicationList = (params: ApplicationQueryParams) => {
  return request.get(APPLICATION_ENDPOINTS.BASE, { params });
};

/**
 * 获取申请详情
 * @param {string} id - 申请ID
 * @returns {Promise<Application>} 申请详情
 */
export const getApplicationDetail = (id: string) => {
  return request.get(APPLICATION_ENDPOINTS.BY_ID(id));
};

/**
 * 审核申请
 * @param {string} id - 申请ID
 * @param {ApplicationReviewParams} data - 审核参数
 * @returns {Promise<Application>} 更新后的申请
 */
export const reviewApplication = (id: string, data: ApplicationReviewParams) => {
  return request.post(APPLICATION_ENDPOINTS.REVIEW(id), data);
};

/**
 * 批量审核申请
 * @param {string[]} ids - 申请ID数组
 * @param {ApplicationReviewParams} data - 审核参数
 * @returns {Promise<{ successCount: number, failureCount: number }>} 审核结果
 */
export const batchReviewApplications = (ids: string[], data: ApplicationReviewParams) => {
  return request.post(APPLICATION_ENDPOINTS.BATCH_REVIEW, {
    ids,
    ...data
  });
};

/**
 * 获取审核历史
 * @param {string} applicationId - 申请ID
 * @returns {Promise<Array<{ id: string, action: string, comments: string, operatorName: string, operatedAt: string }>>} 审核历史记录
 */
export const getApplicationHistory = (applicationId: string) => {
  return request.get(APPLICATION_ENDPOINTS.HISTORY(applicationId));
};

/**
 * 发送入园通知
 * @param {string} applicationId - 申请ID
 * @param {{ message: string, attachments?: string[] }} data - 通知内容
 * @returns {Promise<{ success: boolean, messageId: string }>} 发送结果
 */
export const sendAdmissionNotice = (applicationId: string, data: { message: string, attachments?: string[] }) => {
  return request.post(APPLICATION_ENDPOINTS.NOTICE(applicationId), data);
};

/**
 * 上传申请附件
 * @param {string} applicationId - 申请ID
 * @param {FormData} formData - 包含文件的FormData
 * @returns {Promise<{ files: Array<{ id: string, name: string, url: string }> }>} 上传的文件信息
 */
export const uploadApplicationAttachments = (applicationId: string, formData: FormData) => {
  return request.post(APPLICATION_ENDPOINTS.ATTACHMENTS(applicationId), formData);
}; 