import { request } from '@/utils/request';

/**
 * 媒体内容类型
 */
export enum MediaContentType {
  COPYWRITING = 'copywriting',
  ARTICLE = 'article',
  VIDEO = 'video',
  TTS = 'tts',
}

/**
 * 媒体内容接口
 */
export interface MediaContent {
  id: number;
  title: string;
  type: MediaContentType;
  platform: string;
  createdAt: Date;
  preview?: string;
  content: string;
  keywords?: string[];
  settings?: Record<string, any>;
  creator?: {
    id: number;
    username: string;
    realName?: string;
  };
}

/**
 * 创建内容参数
 */
export interface CreateContentParams {
  title: string;
  type: MediaContentType;
  platform: string;
  content: string;
  preview?: string;
  keywords?: string[];
  style?: string;
  settings?: Record<string, any>;
}

/**
 * 更新内容参数
 */
export interface UpdateContentParams {
  title?: string;
  content?: string;
  platform?: string;
  keywords?: string[];
  settings?: Record<string, any>;
}

/**
 * 历史筛选参数
 */
export interface HistoryFilterParams {
  type?: MediaContentType;
  platform?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

/**
 * 统计数据接口
 */
export interface MediaStatistics {
  totalContents: number;
  recentContents: number;
  contentsByType: Array<{
    type: string;
    count: number;
  }>;
  contentsByPlatform: Array<{
    platform: string;
    count: number;
  }>;
}

/**
 * 获取最近创作列表
 */
export function getRecentCreations(limit: number = 10) {
  return request.get<MediaContent[]>('/media-center/recent-creations', {
    params: { limit },
  });
}

/**
 * 获取创作历史
 */
export function getCreationHistory(params: HistoryFilterParams) {
  return request.get<{
    items: MediaContent[];
    total: number;
    page: number;
    pageSize: number;
  }>('/media-center/history', {
    params,
  });
}

/**
 * 获取统计数据
 */
export function getStatistics() {
  return request.get<MediaStatistics>('/media-center/statistics');
}

/**
 * 创建媒体内容
 */
export function createContent(data: CreateContentParams) {
  return request.post<MediaContent>('/media-center/content', data);
}

/**
 * 获取内容详情
 */
export function getContentDetail(id: number) {
  return request.get<MediaContent>(`/media-center/content/${id}`);
}

/**
 * 更新媒体内容
 */
export function updateContent(id: number, data: UpdateContentParams) {
  return request.put<MediaContent>(`/media-center/content/${id}`, data);
}

/**
 * 删除媒体内容
 */
export function deleteContent(id: number) {
  return request.delete(`/api/media-center/content/${id}`);
}

