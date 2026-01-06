import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { User, UserStatus } from '../../models/user.model';
import { Role } from '../../models/role.model';
import { Permission } from '../../models/permission.model';
import { UserRole } from '../../models/user-role.model';
import { RolePermission } from '../../models/role-permission.model';
import { IAuthService } from './interfaces/auth-service.interface';
import { JWT_SECRET, REFRESH_TOKEN_EXPIRE, TOKEN_TYPES, getDynamicTokenExpire } from '../../config/jwt.config';
import { verifyPassword } from '../../utils/password-helper';
import { secureAuditLogService, AuditLogLevel, AuditLogCategory } from '../secure-audit-log.service';

/**
 * 用户认证服务实现
 * @description 实现用户认证相关的业务逻辑
 * 等保三级合规：支持MFA双因素认证
 */
export class AuthService implements IAuthService {
  /**
   * 用户登录
   * @param username 用户名
   * @param password 密码
   * @param mfaToken MFA验证码（可选）
   * @returns 登录结果，包含用户信息和令牌
   */
  async login(username: string, password: string, mfaToken?: string, requestContext?: {
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ 
    user: any; 
    token: string; 
    refreshToken: string;
    requireMFA?: boolean;
    mfaEnabled?: boolean;
  }> {
    try {
      // 查找用户
      const user = await User.findOne({
        where: {
          [Op.or]: [
            { username },
            { email: username }
          ],
          status: UserStatus.ACTIVE
        }
      });

      // 用户不存在或被禁用
      if (!user) {
        // 审计日志：登录失败 - 用户不存在
        await secureAuditLogService.logAuth('登录失败-用户不存在', {
          username,
          ipAddress: requestContext?.ipAddress,
          userAgent: requestContext?.userAgent,
          details: { reason: '用户不存在或已被禁用' }
        });
        throw new Error('用户不存在或已被禁用');
      }

      // 验证密码 - 支持MD5和bcrypt
      if (!user.password) {
        throw new Error('用户密码数据异常');
      }
      const isPasswordValid = await verifyPassword(password, user.password);
      if (!isPasswordValid) {
        // 审计日志：登录失败 - 密码错误
        await secureAuditLogService.log(
          AuditLogLevel.WARNING,
          AuditLogCategory.AUTH,
          '登录失败-密码错误',
          {
            userId: user.id,
            username: user.username,
            ipAddress: requestContext?.ipAddress,
            userAgent: requestContext?.userAgent,
            details: { reason: '密码错误' }
          }
        );
        throw new Error('密码错误');
      }

      // 等保三级：检查是否启用了MFA
      const mfaEnabled = user.two_fa_enabled || false;
      
      if (mfaEnabled) {
        // 如果启用了MFA，需要验证MFA令牌
        if (!mfaToken) {
          // 返回需要MFA验证的响应（不生成token）
          return {
            user: {
              id: user.id,
              username: user.username
            },
            token: '',
            refreshToken: '',
            requireMFA: true,
            mfaEnabled: true
          };
        }

        // 验证MFA令牌（通过 /api/auth/2fa/verify-login 端点处理）
        // 这里仅记录MFA状态，实际验证在控制器层处理
      }

      // 生成令牌
      const { token, refreshToken } = await this.generateTokens(user.id, user.username);

      // 返回用户信息和令牌
      // 审计日志：登录成功
      await secureAuditLogService.logAuth('登录成功', {
        userId: user.id,
        username: user.username,
        ipAddress: requestContext?.ipAddress,
        userAgent: requestContext?.userAgent,
        details: { mfaEnabled }
      });

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          realName: user.realName,
          status: user.status
        },
        token,
        refreshToken,
        mfaEnabled
      };
    } catch (error) {
      console.error('用户登录失败:', error);
      throw error;
    }
  }

  /**
   * 用户登出
   * @param userId 用户ID
   * @param token 当前令牌
   * @returns 是否登出成功
   */
  async logout(userId: number, token: string, requestContext?: {
    ipAddress?: string;
    userAgent?: string;
  }): Promise<boolean> {
    try {
      // TODO: 将令牌添加到黑名单，实现令牌失效
      // 审计日志：用户登出
      await secureAuditLogService.logAuth('用户登出', {
        userId,
        ipAddress: requestContext?.ipAddress,
        userAgent: requestContext?.userAgent
      });
      return true;
    } catch (error) {
      console.error('用户登出失败:', error);
      throw error;
    }
  }

  /**
   * 刷新令牌
   * @param refreshToken 刷新令牌
   * @returns 新的访问令牌和刷新令牌
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      // 验证刷新令牌
      const decoded: any = jwt.verify(refreshToken, JWT_SECRET);
      
      // 检查用户是否存在且状态正常
      const user = await User.findOne({
        where: {
          id: decoded.userId,
          status: UserStatus.ACTIVE
        }
      });

      if (!user) {
        throw new Error('用户不存在或已被禁用');
      }

      // 生成新的令牌
      return await this.generateTokens(user.id, user.username);
    } catch (error) {
      console.error('刷新令牌失败:', error);
      throw new Error('无效的刷新令牌');
    }
  }

  /**
   * 验证令牌
   * @param token 访问令牌
   * @returns 令牌中包含的用户信息
   */
  async verifyToken(token: string): Promise<any> {
    try {
      // 验证令牌
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      // 检查用户是否存在且状态正常
      const user = await User.findOne({
        where: {
          id: decoded.userId,
          status: UserStatus.ACTIVE
        }
      });

      if (!user) {
        throw new Error('用户不存在或已被禁用');
      }

      return {
        userId: decoded.userId,
        username: decoded.username
      };
    } catch (error) {
      console.error('验证令牌失败:', error);
      throw new Error('无效的令牌');
    }
  }

  /**
   * 修改密码
   * @param userId 用户ID
   * @param oldPassword 旧密码
   * @param newPassword 新密码
   * @returns 是否修改成功
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string, requestContext?: {
    ipAddress?: string;
    userAgent?: string;
  }): Promise<boolean> {
    try {
      // 查找用户
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 验证旧密码
      if (!user.password) {
        throw new Error('用户密码数据异常');
      }
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        // 审计日志：密码修改失败
        await secureAuditLogService.log(
          AuditLogLevel.WARNING,
          AuditLogCategory.SECURITY,
          '密码修改失败-旧密码错误',
          {
            userId: user.id,
            username: user.username,
            ipAddress: requestContext?.ipAddress,
            userAgent: requestContext?.userAgent
          }
        );
        throw new Error('旧密码错误');
      }

      // 哈希新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 更新密码
      await user.update({ password: hashedPassword });

      // 审计日志：密码修改成功
      await secureAuditLogService.log(
        AuditLogLevel.INFO,
        AuditLogCategory.SECURITY,
        '密码修改成功',
        {
          userId: user.id,
          username: user.username,
          ipAddress: requestContext?.ipAddress,
          userAgent: requestContext?.userAgent
        }
      );

      return true;
    } catch (error) {
      console.error('修改密码失败:', error);
      throw error;
    }
  }

  /**
   * 重置密码
   * @param userId 用户ID
   * @param newPassword 新密码
   * @returns 是否重置成功
   */
  async resetPassword(userId: number, newPassword: string): Promise<boolean> {
    try {
      // 查找用户
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 哈希新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 更新密码
      await user.update({ password: hashedPassword });

      return true;
    } catch (error) {
      console.error('重置密码失败:', error);
      throw error;
    }
  }

  /**
   * 发送重置密码邮件
   * @param email 用户邮箱
   * @returns 是否发送成功
   */
  async sendResetPasswordEmail(email: string): Promise<boolean> {
    try {
      // 查找用户
      const user = await User.findOne({
        where: { email }
      });

      if (!user) {
        throw new Error('用户不存在');
      }

      // 生成重置密码令牌
      const resetToken = jwt.sign(
        { userId: user.id, type: 'reset-password' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // TODO: 实现邮件发送功能
      console.log(`重置密码链接: /reset-password?token=${resetToken}`);

      return true;
    } catch (error) {
      console.error('发送重置密码邮件失败:', error);
      throw error;
    }
  }

  /**
   * 验证重置密码令牌
   * @param token 重置密码令牌
   * @returns 令牌是否有效
   */
  async verifyResetPasswordToken(token: string): Promise<boolean> {
    try {
      // 验证令牌
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      // 检查令牌类型和用户是否存在
      if (decoded.type !== 'reset-password') {
        return false;
      }

      const user = await User.findByPk(decoded.userId);
      return !!user;
    } catch (error) {
      console.error('验证重置密码令牌失败:', error);
      return false;
    }
  }

  /**
   * 通过重置密码令牌设置新密码
   * @param token 重置密码令牌
   * @param newPassword 新密码
   * @returns 是否设置成功
   */
  async resetPasswordByToken(token: string, newPassword: string): Promise<boolean> {
    try {
      // 验证令牌
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      // 检查令牌类型
      if (decoded.type !== 'reset-password') {
        throw new Error('无效的重置密码令牌');
      }

      // 重置密码
      return await this.resetPassword(decoded.userId, newPassword);
    } catch (error) {
      console.error('通过令牌重置密码失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户权限列表
   * @param userId 用户ID
   * @returns 用户权限列表
   */
  async getUserPermissions(userId: number): Promise<string[]> {
    try {
      // 查询用户角色
      const userRoles = await UserRole.findAll({
        where: { userId }
      });

      if (userRoles.length === 0) {
        return [];
      }

      // 获取角色ID列表
      const roleIds = userRoles.map(ur => ur.get('roleId'));

      // 查询角色权限
      const rolePermissions = await RolePermission.findAll({
        where: {
          roleId: {
            [Op.in]: roleIds
          }
        }
      });

      if (rolePermissions.length === 0) {
        return [];
      }

      // 获取权限ID列表
      const permissionIds = rolePermissions.map(rp => rp.get('permissionId'));

      // 查询权限详情
      const permissions = await Permission.findAll({
        where: {
          id: {
            [Op.in]: permissionIds
          },
          status: 1
        }
      });

      // 提取权限标识
      return permissions
        .map(p => p.permission)
        .filter((p): p is string => p !== null);
    } catch (error) {
      console.error('获取用户权限列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户角色列表
   * @param userId 用户ID
   * @returns 用户角色列表
   */
  async getUserRoles(userId: number): Promise<any[]> {
    try {
      // 查询用户角色关联
      const userRoles = await UserRole.findAll({
        where: { userId },
        include: [
          {
            model: Role,
            as: 'role',
            where: { status: 1 }
          }
        ]
      });

      // 提取角色信息
      return userRoles.map(ur => {
        const role = ur.get('role') as Role;
        if (!role) {
          return {
            id: 0,
            name: '未知角色',
            code: 'unknown',
            isPrimary: ur.get('isPrimary') === 1
          };
        }
        
        return {
          id: role.id,
          name: role.name,
          code: role.code,
          isPrimary: ur.get('isPrimary') === 1
        };
      });
    } catch (error) {
      console.error('获取用户角色列表失败:', error);
      throw error;
    }
  }

  /**
   * 检查用户是否有特定权限
   * @param userId 用户ID
   * @param permission 权限标识
   * @returns 是否有权限
   */
  async hasPermission(userId: number, permission: string): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId);
      return permissions.includes(permission);
    } catch (error) {
      console.error('检查用户权限失败:', error);
      throw error;
    }
  }

  /**
   * 检查用户是否具有特定角色
   * @param userId 用户ID
   * @param role 角色标识
   * @returns 是否有角色
   */
  async hasRole(userId: number, role: string): Promise<boolean> {
    try {
      // 查询用户角色关联
      const userRoles = await UserRole.findAll({
        where: { userId },
        include: [
          {
            model: Role,
            as: 'role',
            where: { 
              code: role,
              status: 1
            }
          }
        ]
      });

      return userRoles.length > 0;
    } catch (error) {
      console.error('检查用户角色失败:', error);
      throw error;
    }
  }

  /**
   * 生成访问令牌和刷新令牌
   * @param userId 用户ID
   * @param username 用户名
   * @returns 访问令牌和刷新令牌
   */
  private async generateTokens(userId: number, username: string): Promise<{ token: string; refreshToken: string }> {
    // 获取动态会话超时时间
    const tokenExpire = await getDynamicTokenExpire();
    console.log(`🔑 生成令牌，使用过期时间: ${tokenExpire}`);

    // 生成访问令牌
    const tokenOptions: SignOptions = { expiresIn: tokenExpire as any };
    const token = jwt.sign(
      { userId, username, type: TOKEN_TYPES.ACCESS },
      JWT_SECRET,
      tokenOptions
    );

    // 生成刷新令牌
    const refreshTokenOptions: SignOptions = { expiresIn: REFRESH_TOKEN_EXPIRE as any };
    const refreshToken = jwt.sign(
      { userId, username, type: TOKEN_TYPES.REFRESH },
      JWT_SECRET,
      refreshTokenOptions
    );

    return { token, refreshToken };
  }
}

export default new AuthService(); 