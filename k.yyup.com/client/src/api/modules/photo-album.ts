import { request } from '@/utils/request';
import { API_PREFIX } from '../endpoints/base';

// API端点常量
const PHOTO_ALBUM_ENDPOINTS = {
  BASE: `${API_PREFIX}/photo-album`,
  BY_ID: (id: number | string) => `${API_PREFIX}/photo-album/${id}`,
  STATS: `${API_PREFIX}/photo-album/stats/overview`,
  PHOTOS: `${API_PREFIX}/photo-album/photos`
} as const;

/**
 * 相册API
 */
export const photoAlbumAPI = {
  /**
   * 获取相册列表
   */
  getAlbums(params?: {
    page?: number;
    pageSize?: number;
    type?: string;
  }) {
    return request.get(PHOTO_ALBUM_ENDPOINTS.BASE, { params });
  },

  /**
   * 获取相册详情
   */
  getAlbumDetail(id: number | string) {
    return request.get(PHOTO_ALBUM_ENDPOINTS.BY_ID(id));
  },

  /**
   * 获取相册统计
   */
  getAlbumStats() {
    return request.get(PHOTO_ALBUM_ENDPOINTS.STATS);
  },

  /**
   * 获取照片列表
   */
  getPhotos(params?: {
    page?: number;
    pageSize?: number;
    albumId?: number | string;
  }) {
    return request.get(PHOTO_ALBUM_ENDPOINTS.PHOTOS, { params });
  }
};

