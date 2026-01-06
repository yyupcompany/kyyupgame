import request from '@/utils/request';

export const photoAPI = {
  /**
   * 上传单张照片
   */
  uploadPhoto(formData: FormData): Promise<any> {
    return request.post('/api/photos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * 批量上传照片
   */
  uploadPhotos(formData: FormData): Promise<any> {
    return request.post('/api/photos/upload-multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 60秒超时
    });
  },

  /**
   * 手动标记学生
   */
  tagStudent(photoId: number, data: {
    studentId: number;
    isPrimary?: boolean;
    faceBox?: any;
  }): Promise<any> {
    return request.post(`/photos/${photoId}/tag-student`, data);
  },

  /**
   * 全班标记
   */
  tagWholeClass(photoId: number, classId: number): Promise<any> {
    return request.post(`/photos/${photoId}/tag-class`, { classId });
  },

  /**
   * 获取孩子照片时间轴
   */
  getChildTimeline(childId: number, params: any = {}): Promise<any> {
    return request.get(`/photos/child/${childId}/timeline`, { params });
  },

  /**
   * 收藏/取消收藏
   */
  toggleFavorite(photoId: number, data: {
    studentId: number;
    isFavorited: boolean;
  }): Promise<any> {
    return request.post(`/photos/${photoId}/favorite`, data);
  },

  /**
   * 获取班级照片列表
   */
  getClassPhotos(classId: number, params: any = {}): Promise<any> {
    return request.get(`/photos/class/${classId}`, { params });
  },

  /**
   * 获取数据统计
   */
  getStatistics(params: any = {}): Promise<any> {
    return request.get('/api/photos/statistics', { params });
  },

  /**
   * 删除照片
   */
  deletePhoto(photoId: number): Promise<any> {
    return request.delete(`/photos/${photoId}`);
  },
};





