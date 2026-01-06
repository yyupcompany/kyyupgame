import { User } from '../../../models/user.model';

/**
 * 用户资料查询参数接口
 */
export interface ProfileQueryParams {
  userId?: number;
  keyword?: string;
  startTime?: Date;
  endTime?: Date;
  page?: number;
  pageSize?: number;
}

/**
 * 用户资料创建参数接口
 */
export interface ProfileCreateParams {
  userId: number;
  avatar?: string;
  gender?: number;
  birthday?: Date;
  address?: string;
  education?: string;
  introduction?: string;
  tags?: string[];
  contactInfo?: Record<string, string>;
  extendedInfo?: Record<string, any>;
}

/**
 * 用户资料更新参数接口
 */
export interface ProfileUpdateParams {
  avatar?: string;
  gender?: number;
  birthday?: Date;
  address?: string;
  education?: string;
  introduction?: string;
  tags?: string[];
  contactInfo?: Record<string, string>;
  extendedInfo?: Record<string, any>;
}

/**
 * 用户资料服务接口
 * @description 定义用户个人资料管理相关的业务逻辑功能
 */
export interface IUserProfileService {
  /**
   * 创建用户资料
   * @param data 用户资料创建数据
   * @returns 创建结果
   */
  create(data: ProfileCreateParams): Promise<any>;

  /**
   * 根据用户ID获取用户资料
   * @param userId 用户ID
   * @returns 用户资料信息
   */
  findByUserId(userId: number): Promise<any>;

  /**
   * 更新用户资料
   * @param userId 用户ID
   * @param data 更新数据
   * @returns 是否更新成功
   */
  update(userId: number, data: ProfileUpdateParams): Promise<boolean>;

  /**
   * 删除用户资料
   * @param userId 用户ID
   * @returns 是否删除成功
   */
  delete(userId: number): Promise<boolean>;

  /**
   * 上传用户头像
   * @param userId 用户ID
   * @param file 头像文件
   * @returns 头像URL
   */
  uploadAvatar(userId: number, file: any): Promise<string>;

  /**
   * 获取用户标签列表
   * @param userId 用户ID
   * @returns 标签列表
   */
  getUserTags(userId: number): Promise<string[]>;

  /**
   * 添加用户标签
   * @param userId 用户ID
   * @param tags 标签列表
   * @returns 是否添加成功
   */
  addUserTags(userId: number, tags: string[]): Promise<boolean>;

  /**
   * 移除用户标签
   * @param userId 用户ID
   * @param tags 标签列表
   * @returns 是否移除成功
   */
  removeUserTags(userId: number, tags: string[]): Promise<boolean>;

  /**
   * 更新用户扩展信息
   * @param userId 用户ID
   * @param key 键名
   * @param value 键值
   * @returns 是否更新成功
   */
  updateExtendedInfo(userId: number, key: string, value: any): Promise<boolean>;

  /**
   * 获取用户扩展信息
   * @param userId 用户ID
   * @param key 键名，不提供则获取所有
   * @returns 扩展信息
   */
  getExtendedInfo(userId: number, key?: string): Promise<any>;

  /**
   * 删除用户扩展信息
   * @param userId 用户ID
   * @param key 键名
   * @returns 是否删除成功
   */
  deleteExtendedInfo(userId: number, key: string): Promise<boolean>;

  /**
   * 获取用户联系信息
   * @param userId 用户ID
   * @returns 联系信息
   */
  getContactInfo(userId: number): Promise<Record<string, string>>;

  /**
   * 更新用户联系信息
   * @param userId 用户ID
   * @param contactInfo 联系信息
   * @returns 是否更新成功
   */
  updateContactInfo(userId: number, contactInfo: Record<string, string>): Promise<boolean>;
} 