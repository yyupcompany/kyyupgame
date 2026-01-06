/**
 * 用户个人中心API端点
 * @description 用户信息、密码修改、头像上传等API
 */

import { request } from '@/utils/request';

/**
 * 用户信息接口
 */
export interface UserProfile {
  id: number;
  username: string;
  realName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
  loginCount: number;
}

/**
 * 更新用户信息参数
 */
export interface UpdateProfileParams {
  realName?: string;
  email?: string;
  phone?: string;
}

/**
 * 修改密码参数
 */
export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
}

/**
 * API响应接口
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * 获取当前用户信息
 */
export const getUserProfile = (): Promise<ApiResponse<UserProfile>> => {
  return request.get<UserProfile>('/user/profile');
};

/**
 * 更新用户信息
 */
export const updateUserProfile = (data: UpdateProfileParams): Promise<ApiResponse<UserProfile>> => {
  return request.put<UserProfile>('/user/profile', data);
};

/**
 * 修改密码
 */
export const changePassword = (data: ChangePasswordParams): Promise<ApiResponse> => {
  return request.post('/api/user/change-password', data);
};

/**
 * 上传头像
 */
export const uploadAvatar = (file: File): Promise<ApiResponse<{ avatar: string }>> => {
  const formData = new FormData();
  formData.append('avatar', file);

  return request.post<{ avatar: string }>('/user/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

