/**
 * 认证控制器
 * 处理用户登录、登出和令牌刷新
 */

import { Request, Response } from 'express';
import { User, Role, Permission } from '../models';
import { LoginDto, RefreshTokenDto } from '../types/auth';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { generateToken, verifyToken } from '../utils/jwt';
import { verifyPassword } from '../utils/password';

/**
 * 用户登录
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body as LoginDto;

    // 查询用户
    const user = await User.findOne({
      where: { username },
      include: [
        {
          model: Role,
          as: 'roles',
          include: [
            {
              model: Permission,
              as: 'permissions',
              attributes: ['id', 'name', 'code', 'type', 'path', 'component', 'icon']
            }
          ]
        }
      ]
    });

    if (!user) {
      throw ApiError.unauthorized('用户名或密码错误', 'INVALID_CREDENTIALS');
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('用户名或密码错误', 'INVALID_CREDENTIALS');
    }

    // 检查用户状态
    if (user.status !== 1) {
      throw ApiError.forbidden('账号已被禁用', 'ACCOUNT_DISABLED');
    }

    // 生成token
    const token = generateToken({
      userId: user.id,
      username: user.username
    });

    // 生成刷新token
    const refreshToken = generateToken(
      {
        userId: user.id,
        username: user.username,
        isRefreshToken: true
      }
    );

    // 组装用户角色和权限信息
    const userInfo = {
      id: user.id,
      username: user.username,
      email: user.email,
      realName: user.realName,
      phone: user.phone,
      roles: user.roles?.map(role => ({
        id: role.id,
        name: role.name,
        code: role.code,
        permissions: role.permissions?.map(permission => ({
          id: permission.id,
          name: permission.name,
          code: permission.code,
          type: permission.type,
          path: permission.path,
          component: permission.component,
          icon: permission.icon
        }))
      })) || []
    };

    ApiResponse.success(res, {
      token,
      refreshToken,
      user: userInfo
    }, '登录成功');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.serverError('登录失败', 'LOGIN_ERROR');
  }
};

/**
 * 刷新令牌
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body as RefreshTokenDto;

    if (!token) {
      throw ApiError.badRequest('刷新令牌不能为空', 'REFRESH_TOKEN_REQUIRED');
    }

    // 验证刷新令牌
    try {
      const decoded = verifyToken(token);

      // 检查是否是刷新令牌
      if (!decoded.isRefreshToken) {
        throw ApiError.badRequest('无效的刷新令牌', 'INVALID_REFRESH_TOKEN');
      }

      // 查询用户
      const user = await User.findByPk(decoded.userId);
      if (!user) {
        throw ApiError.unauthorized('用户不存在', 'USER_NOT_FOUND');
      }

      // 检查用户状态
      if (user.status !== 1) {
        throw ApiError.forbidden('账号已被禁用', 'ACCOUNT_DISABLED');
      }

      // 生成新的访问令牌
      const newToken = generateToken({
        userId: user.id,
        username: user.username
      });

      // 生成新的刷新令牌
      const newRefreshToken = generateToken(
        {
          userId: user.id,
          username: user.username,
          isRefreshToken: true
        }
      );

      ApiResponse.success(res, {
        token: newToken,
        refreshToken: newRefreshToken
      }, '刷新令牌成功');
    } catch (err) {
      throw ApiError.unauthorized('刷新令牌已过期或无效', 'INVALID_REFRESH_TOKEN');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.serverError('刷新令牌失败', 'REFRESH_TOKEN_ERROR');
  }
};

/**
 * 退出登录
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // 退出登录不需要特殊处理，前端删除token即可
    // 这里只返回成功信息
    ApiResponse.success(res, { message: '退出成功' });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.serverError('退出失败', 'LOGOUT_ERROR');
  }
};

export default {
  login,
  refreshToken,
  logout
}; 