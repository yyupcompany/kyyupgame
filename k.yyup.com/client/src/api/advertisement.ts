import { get, post, put, del } from '@/utils/request';
import type { ApiResponse } from '@/utils/request';
import { API_PREFIX } from './endpoints';
import type { Advertisement, AdvertisementStatus, AdvertisementMaterial } from '../types/advertisement';
import { createHeaders } from '@/utils/request-config';

/**
 * 广告管理API服务
 */
export const advertisementApi = {
  /**
   * 获取广告列表
   * @param params 查询参数
   * @returns Promise<ApiResponse<{ advertisements: Advertisement[]; total: number }>>
   */
  getAdvertisements(params: {
    page?: number;
    pageSize?: number;
    status?: AdvertisementStatus;
    keyword?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<{ advertisements: Advertisement[]; total: number }>> {
    return get(`${API_PREFIX}/advertisements`, { params });
  },

  /**
   * 获取广告详情
   * @param id 广告ID
   * @returns Promise<ApiResponse<Advertisement>>
   */
  getAdvertisementById(id: number): Promise<ApiResponse<Advertisement>> {
    return get(`${API_PREFIX}/advertisements/${id}`);
  },

  /**
   * 创建广告
   * @param data 广告数据
   * @returns Promise<ApiResponse<Advertisement>>
   */
  createAdvertisement(data: Omit<Advertisement, 'id'>): Promise<ApiResponse<Advertisement>> {
    return post(`${API_PREFIX}/advertisements`, data);
  },

  /**
   * 更新广告
   * @param id 广告ID
   * @param data 广告数据
   * @returns Promise<ApiResponse<Advertisement>>
   */
  updateAdvertisement(id: number, data: Partial<Advertisement>): Promise<ApiResponse<Advertisement>> {
    return put(`${API_PREFIX}/advertisements/${id}`, data);
  },

  /**
   * 删除广告
   * @param id 广告ID
   * @returns Promise<ApiResponse<null>>
   */
  deleteAdvertisement(id: number): Promise<ApiResponse<null>> {
    return del(`${API_PREFIX}/advertisements/${id}`);
  },

  /**
   * 获取广告统计数据
   * @param id 广告ID
   * @param params 查询参数
   * @returns Promise<ApiResponse<any>>
   */
  getAdvertisementStatistics(id: number, params: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    return get(`${API_PREFIX}/advertisements/${id}/statistics`, { params });
  },

  /**
   * 复制广告
   * @param id 广告ID
   * @returns Promise<ApiResponse<Advertisement>>
   */
  duplicateAdvertisement(id: number): Promise<ApiResponse<Advertisement>> {
    return post(`${API_PREFIX}/advertisements/${id}/duplicate`);
  },

  /**
   * 上传广告素材
   * @param data FormData包含文件
   * @returns Promise<ApiResponse<AdvertisementMaterial>>
   */
  uploadAdvertisementMaterial(data: FormData): Promise<ApiResponse<AdvertisementMaterial>> {
    const headers = createHeaders({
      'Content-Type': 'multipart/form-data'
    });
    return post(`${API_PREFIX}/advertisements/materials/upload`, data, { headers });
  },

  /**
   * 获取素材列表
   * @param params 查询参数
   * @returns Promise<ApiResponse<{ materials: AdvertisementMaterial[]; total: number }>>
   */
  getAdvertisementMaterials(params: {
    page?: number;
    pageSize?: number;
    type?: string;
  }): Promise<ApiResponse<{ materials: AdvertisementMaterial[]; total: number }>> {
    return get(`${API_PREFIX}/advertisements/materials`, { params });
  },

  /**
   * 删除素材
   * @param id 素材ID
   * @returns Promise<ApiResponse<null>>
   */
  deleteAdvertisementMaterial(id: number): Promise<ApiResponse<null>> {
    return del(`${API_PREFIX}/advertisements/materials/${id}`);
  },

  /**
   * 更新广告状态
   * @param id 广告ID
   * @param status 新状态
   * @returns Promise<ApiResponse<Advertisement>>
   */
  updateAdvertisementStatus(id: number, status: AdvertisementStatus): Promise<ApiResponse<Advertisement>> {
    return put(`${API_PREFIX}/advertisements/${id}/status`, { status });
  },

  /**
   * 批量删除广告
   * @param ids 广告ID数组
   * @returns Promise<ApiResponse<null>>
   */
  batchDeleteAdvertisements(ids: number[]): Promise<ApiResponse<null>> {
    return del(`${API_PREFIX}/advertisements/batch-delete`, { data: { ids } });
  },

  /**
   * 批量更新广告状态
   * @param ids 广告ID数组
   * @param status 新状态
   * @returns Promise<ApiResponse<null>>
   */
  batchUpdateAdvertisementStatus(ids: number[], status: AdvertisementStatus): Promise<ApiResponse<null>> {
    return put(`${API_PREFIX}/advertisements/batch-status-update`, { ids, status });
  }
}; 