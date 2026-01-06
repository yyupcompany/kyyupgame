import { get, post, put, del, ApiResponse } from '@/utils/request';
import { API_PREFIX } from '@/api/endpoints';

/**
 * 广告类型
 */
export enum AdvertisementType {
  BANNER = 'banner',
  POPUP = 'popup',
  INLINE = 'inline',
  VIDEO = 'video'
}

/**
 * 广告状态
 */
export enum AdvertisementStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired'
}

/**
 * 广告位置
 */
export enum AdvertisementPosition {
  HOME_TOP = 'home_top',
  HOME_MIDDLE = 'home_middle',
  HOME_BOTTOM = 'home_bottom',
  SIDEBAR = 'sidebar',
  ENROLLMENT_PAGE = 'enrollment_page',
  ACTIVITY_PAGE = 'activity_page'
}

/**
 * 广告信息
 */
export interface Advertisement {
  id: string;
  title: string;
  description?: string;
  type: AdvertisementType;
  position: AdvertisementPosition;
  status: AdvertisementStatus;
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
  linkTarget: '_blank' | '_self';
  startDate: string;
  endDate: string;
  priority: number;
  clickCount: number;
  impressionCount: number;
  targetAudience?: {
    ageRange?: string;
    location?: string;
    interests?: string[];
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 广告查询参数
 */
export interface AdvertisementQueryParams {
  page?: number;
  pageSize?: number;
  title?: string;
  type?: AdvertisementType;
  status?: AdvertisementStatus;
  position?: AdvertisementPosition;
  startDate?: string;
  endDate?: string;
}

/**
 * 创建广告请求
 */
export interface CreateAdvertisementRequest {
  title: string;
  description?: string;
  type: AdvertisementType;
  position: AdvertisementPosition;
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
  linkTarget: '_blank' | '_self';
  startDate: string;
  endDate: string;
  priority: number;
  targetAudience?: {
    ageRange?: string;
    location?: string;
    interests?: string[];
  };
}

/**
 * 广告统计
 */
export interface AdvertisementStats {
  totalAds: number;
  activeAds: number;
  totalClicks: number;
  totalImpressions: number;
  clickThroughRate: number;
  topPerformingAds: Array<{
    id: string;
    title: string;
    clicks: number;
    impressions: number;
    ctr: number;
  }>;
  performanceByPosition: Record<AdvertisementPosition, {
    clicks: number;
    impressions: number;
    ctr: number;
  }>;
}

/**
 * 广告管理API
 */
export const advertisementApi = {
  /**
   * 获取广告列表
   */
  getAdvertisements(params?: AdvertisementQueryParams): Promise<ApiResponse<{
    items: Advertisement[];
    total: number;
    page: number;
    pageSize: number;
  }>> {
    return get(`${API_PREFIX}/advertisements`, { params });
  },

  /**
   * 获取广告详情
   */
  getAdvertisement(id: string): Promise<ApiResponse<Advertisement>> {
    return get(`${API_PREFIX}/advertisements/${id}`);
  },

  /**
   * 创建广告
   */
  createAdvertisement(data: CreateAdvertisementRequest): Promise<ApiResponse<Advertisement>> {
    return post(`${API_PREFIX}/advertisements`, data);
  },

  /**
   * 更新广告
   */
  updateAdvertisement(id: string, data: Partial<CreateAdvertisementRequest>): Promise<ApiResponse<Advertisement>> {
    return put(`${API_PREFIX}/advertisements/${id}`, data);
  },

  /**
   * 删除广告
   */
  deleteAdvertisement(id: string): Promise<ApiResponse> {
    return del(`${API_PREFIX}/advertisements/${id}`);
  },

  /**
   * 启用/暂停广告
   */
  toggleAdvertisementStatus(id: string, status: AdvertisementStatus): Promise<ApiResponse<Advertisement>> {
    return put(`${API_PREFIX}/advertisements/${id}/status`, { status });
  },

  /**
   * 获取指定位置的活跃广告
   */
  getActiveAdvertisementsByPosition(position: AdvertisementPosition): Promise<ApiResponse<Advertisement[]>> {
    return get(`${API_PREFIX}/advertisements/active`, { params: { position } });
  },

  /**
   * 记录广告点击
   */
  recordClick(id: string, metadata?: Record<string, any>): Promise<ApiResponse> {
    return post(`${API_PREFIX}/advertisements/${id}/click`, { metadata });
  },

  /**
   * 记录广告展示
   */
  recordImpression(id: string, metadata?: Record<string, any>): Promise<ApiResponse> {
    return post(`${API_PREFIX}/advertisements/${id}/impression`, { metadata });
  },

  /**
   * 获取广告统计
   */
  getAdvertisementStats(params?: {
    startDate?: string;
    endDate?: string;
    position?: AdvertisementPosition;
  }): Promise<ApiResponse<AdvertisementStats>> {
    return get(`${API_PREFIX}/advertisements/stats`, { params });
  },

  /**
   * 批量操作广告
   */
  batchUpdateAdvertisements(data: {
    ids: string[];
    action: 'activate' | 'pause' | 'delete';
  }): Promise<ApiResponse> {
    return post(`${API_PREFIX}/advertisements/batch`, data);
  }
};

// 兼容性导出
export const getAdvertisements = advertisementApi.getAdvertisements;
export const getAdvertisement = advertisementApi.getAdvertisement;
export const createAdvertisement = advertisementApi.createAdvertisement;
export const updateAdvertisement = advertisementApi.updateAdvertisement;
export const deleteAdvertisement = advertisementApi.deleteAdvertisement;