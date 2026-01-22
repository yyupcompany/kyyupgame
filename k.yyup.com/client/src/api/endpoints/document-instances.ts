import { request } from '@/utils/request';

/**
 * 文档实例API
 */

export interface DocumentInstanceListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  templateId?: number;
  ownerId?: number;
  assignedTo?: number;
  keyword?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface DocumentInstance {
  id: number;
  templateId: number;
  inspectionPlanId?: number;
  kindergartenId: number;
  title: string;
  content: string;
  filledVariables: Record<string, any>;
  status: string;
  progress: number;
  ownerId: number;
  assignedTo?: number;
  reviewers?: number[];
  version: number;
  parentVersionId?: number;
  startedAt?: string;
  submittedAt?: string;
  reviewedAt?: string;
  completedAt?: string;
  deadline?: string;
  filePath?: string;
  fileType?: string;
  fileSize?: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  template?: {
    id: number;
    code: string;
    name: string;
    category: string;
  };
}

export interface DocumentInstanceListResponse {
  items: DocumentInstance[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateInstanceData {
  templateId: number;
  title?: string;
  content?: string;
  filledVariables?: Record<string, any>;
}

export interface UpdateInstanceData {
  title?: string;
  content?: string;
  filledVariables?: Record<string, any>;
  status?: string;
  progress?: number;
}

export interface BatchDeleteResult {
  deletedCount: number;
  message: string;
}

/**
 * 获取文档实例列表
 */
export function getInstances(params?: DocumentInstanceListParams) {
  return request.get<DocumentInstanceListResponse>('/api/document-instances', { params });
}

/**
 * 获取文档实例详情
 */
export function getInstanceById(id: number | string) {
  return request.get<DocumentInstance>(`/api/document-instances/${id}`);
}

/**
 * 创建文档实例
 */
export function createInstance(data: CreateInstanceData) {
  return request.post<DocumentInstance>('/api/document-instances', data);
}

/**
 * 更新文档实例
 */
export function updateInstance(id: number | string, data: UpdateInstanceData) {
  return request.put<DocumentInstance>(`/api/document-instances/${id}`, data);
}

/**
 * 删除文档实例
 */
export function deleteInstance(id: number | string) {
  return request.delete<{ message: string }>(`/api/document-instances/${id}`);
}

/**
 * 批量删除文档实例
 */
export function batchDeleteInstances(ids: number[]) {
  return request.post<BatchDeleteResult>('/api/document-instances/batch-delete', { ids });
}

/**
 * 导出文档实例
 */
export function exportInstance(id: number | string, format: 'pdf' | 'word' = 'pdf') {
  return request.get<any>(`/api/document-instances/${id}/export`, {
    params: { format }
  });
}

/**
 * 分配文档
 */
export function assignDocument(id: number | string, data: {
  assignedTo: number;
  deadline?: string;
  message?: string;
}) {
  return request.post<any>(`/api/document-instances/${id}/assign`, data);
}

/**
 * 提交审核
 */
export function submitForReview(id: number | string, data: {
  reviewers: number[];
  message?: string;
}) {
  return request.post<any>(`/api/document-instances/${id}/submit`, data);
}

/**
 * 审核文档
 */
export function reviewDocument(id: number | string, data: {
  approved: boolean;
  comment: string;
}) {
  return request.post<any>(`/api/document-instances/${id}/review`, data);
}

/**
 * 获取评论列表
 */
export function getComments(id: number | string) {
  return request.get<{ comments: any[]; total: number }>(`/api/document-instances/${id}/comments`);
}

/**
 * 添加评论
 */
export function addComment(id: number | string, data: { content: string }) {
  return request.post<any>(`/api/document-instances/${id}/comments`, data);
}

/**
 * 获取版本历史
 */
export function getVersionHistory(id: number | string) {
  return request.get<{ versions: DocumentInstance[]; total: number }>(`/api/document-instances/${id}/versions`);
}

/**
 * 创建新版本
 */
export function createVersion(id: number | string) {
  return request.post<DocumentInstance>(`/api/document-instances/${id}/versions`);
}

