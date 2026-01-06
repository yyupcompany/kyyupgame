/**
 * 用户认证服务接口
 * @description 定义用户认证相关的业务逻辑功能
 */
export interface IAuthService {
  /**
   * 用户登录
   * @param username 用户名
   * @param password 密码
   * @returns 登录结果，包含用户信息和令牌
   */
  login(username: string, password: string): Promise<{
    user: any;
    token: string;
    refreshToken: string;
  }>;

  /**
   * 用户登出
   * @param userId 用户ID
   * @param token 当前令牌
   * @returns 是否登出成功
   */
  logout(userId: number, token: string): Promise<boolean>;

  /**
   * 刷新令牌
   * @param refreshToken 刷新令牌
   * @returns 新的访问令牌和刷新令牌
   */
  refreshToken(refreshToken: string): Promise<{
    token: string;
    refreshToken: string;
  }>;

  /**
   * 验证令牌
   * @param token 访问令牌
   * @returns 令牌中包含的用户信息
   */
  verifyToken(token: string): Promise<any>;

  /**
   * 修改密码
   * @param userId 用户ID
   * @param oldPassword 旧密码
   * @param newPassword 新密码
   * @returns 是否修改成功
   */
  changePassword(userId: number, oldPassword: string, newPassword: string): Promise<boolean>;

  /**
   * 重置密码
   * @param userId 用户ID
   * @param newPassword 新密码
   * @returns 是否重置成功
   */
  resetPassword(userId: number, newPassword: string): Promise<boolean>;

  /**
   * 发送重置密码邮件
   * @param email 用户邮箱
   * @returns 是否发送成功
   */
  sendResetPasswordEmail(email: string): Promise<boolean>;

  /**
   * 验证重置密码令牌
   * @param token 重置密码令牌
   * @returns 令牌是否有效
   */
  verifyResetPasswordToken(token: string): Promise<boolean>;

  /**
   * 通过重置密码令牌设置新密码
   * @param token 重置密码令牌
   * @param newPassword 新密码
   * @returns 是否设置成功
   */
  resetPasswordByToken(token: string, newPassword: string): Promise<boolean>;

  /**
   * 获取用户权限列表
   * @param userId 用户ID
   * @returns 用户权限列表
   */
  getUserPermissions(userId: number): Promise<string[]>;

  /**
   * 获取用户角色列表
   * @param userId 用户ID
   * @returns 用户角色列表
   */
  getUserRoles(userId: number): Promise<any[]>;

  /**
   * 检查用户是否有特定权限
   * @param userId 用户ID
   * @param permission 权限标识
   * @returns 是否有权限
   */
  hasPermission(userId: number, permission: string): Promise<boolean>;

  /**
   * 检查用户是否具有特定角色
   * @param userId 用户ID
   * @param role 角色标识
   * @returns 是否有角色
   */
  hasRole(userId: number, role: string): Promise<boolean>;
} 