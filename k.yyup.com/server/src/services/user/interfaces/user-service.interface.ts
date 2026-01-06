import { FindOptions } from 'sequelize';
import { User, UserStatus } from '../../../models/user.model';

/**
 * 用户查询参数接口
 */
export interface UserQueryParams {
  keyword?: string;
  status?: UserStatus;
  roleId?: number;
  startTime?: Date;
  endTime?: Date;
  page?: number;
  pageSize?: number;
}

/**
 * 用户创建参数接口
 */
export interface UserCreateParams {
  username: string;
  password: string;
  email: string;
  realName: string;
  phone?: string;
  status?: UserStatus;
  roleIds?: number[];
}

/**
 * 用户更新参数接口
 */
export interface UserUpdateParams {
  email?: string;
  realName?: string;
  phone?: string;
  password?: string;
  status?: UserStatus;
  roleIds?: number[];
}

/**
 * 分页结果接口
 */
export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 用户服务接口
 * @description 定义用户管理相关的业务逻辑功能
 */
export interface IUserService {
  /**
   * 创建用户
   * @param data 用户创建数据
   * @returns 创建的用户实例
   */
  create(data: UserCreateParams): Promise<User>;

  /**
   * 根据ID查找用户
   * @param id 用户ID
   * @returns 用户实例或null
   */
  findById(id: number): Promise<User | null>;

  /**
   * 查询所有符合条件的用户
   * @param options 查询选项
   * @returns 用户数组
   */
  findAll(options?: FindOptions): Promise<User[]>;

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param data 更新数据
   * @returns 是否更新成功
   */
  update(id: number, data: UserUpdateParams): Promise<boolean>;

  /**
   * 删除用户
   * @param id 用户ID
   * @returns 是否删除成功
   */
  delete(id: number): Promise<boolean>;

  /**
   * 根据用户名查找用户
   * @param username 用户名
   * @returns 用户实例或null
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * 根据邮箱查找用户
   * @param email 邮箱
   * @returns 用户实例或null
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * 分页查询用户
   * @param params 查询参数
   * @returns 分页结果
   */
  findByPage(params: UserQueryParams): Promise<PaginationResult<User>>;

  /**
   * 启用用户
   * @param id 用户ID
   * @returns 是否启用成功
   */
  enable(id: number): Promise<boolean>;

  /**
   * 禁用用户
   * @param id 用户ID
   * @returns 是否禁用成功
   */
  disable(id: number): Promise<boolean>;

  /**
   * 锁定用户
   * @param id 用户ID
   * @returns 是否锁定成功
   */
  lock(id: number): Promise<boolean>;

  /**
   * 解锁用户
   * @param id 用户ID
   * @returns 是否解锁成功
   */
  unlock(id: number): Promise<boolean>;

  /**
   * 分配角色给用户
   * @param userId 用户ID
   * @param roleIds 角色ID数组
   * @param options 选项，如是否设置为主要角色、授权人ID等
   * @returns 是否分配成功
   */
  assignRoles(userId: number, roleIds: number[], options?: { 
    primaryRoleId?: number;
    grantorId?: number;
    startTime?: Date;
    endTime?: Date;
  }): Promise<boolean>;

  /**
   * 移除用户的角色
   * @param userId 用户ID
   * @param roleIds 角色ID数组
   * @returns 是否移除成功
   */
  removeRoles(userId: number, roleIds: number[]): Promise<boolean>;

  /**
   * 设置用户主要角色
   * @param userId 用户ID
   * @param roleId 角色ID
   * @returns 是否设置成功
   */
  setPrimaryRole(userId: number, roleId: number): Promise<boolean>;

  /**
   * 获取用户与角色关联信息
   * @param userId 用户ID
   * @returns 用户角色关联数组
   */
  getUserRoleRelations(userId: number): Promise<any[]>;
} 