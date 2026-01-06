import { Request, Response } from 'express';
import { User, Role } from '../models';
import { CreateUserDto, UpdateUserDto, PaginationQuery } from '../types';
import * as crypto from 'crypto';
import { ApiError } from '../utils/apiError';
import { hashPassword, verifyPassword } from '../utils/password';
import { Op, WhereOptions, Transaction, Order } from 'sequelize';
import { sequelize } from '../config/database';
import { ApiResponse } from '../utils/apiResponse';

/**
 * 创建用户
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    const userData = req.body as CreateUserDto;

    // 检查用户名是否已存在
    const existingUser = await User.findOne({
      where: { username: userData.username },
      transaction
    });

    if (existingUser) {
      await transaction.rollback();
      throw ApiError.badRequest('用户名已存在', 'USER_USERNAME_EXISTS');
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({
      where: { email: userData.email },
      transaction
    });

    if (existingEmail) {
      await transaction.rollback();
      throw ApiError.badRequest('邮箱已存在', 'USER_EMAIL_EXISTS');
    }

    // 创建用户
    const user = await User.create({
      username: userData.username,
      email: userData.email,
      password: await hashPassword(userData.password),
      realName: userData.realName || '',
      phone: userData.phone || '',
      status: userData.status || 1
    }, { transaction });

    // 如果指定了角色，关联角色
    if (userData.roleIds && userData.roleIds.length > 0) {
      await (user as any).setRoles(userData.roleIds, { transaction });
    }

    await transaction.commit();

    ApiResponse.success(res, {
      id: user.id,
      username: user.username,
      email: user.email,
      realName: user.realName,
      phone: user.phone,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }, '创建用户成功');
  } catch (error) {
    await transaction.rollback();
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.serverError('创建用户失败', 'USER_CREATE_ERROR');
  }
};

/**
 * 获取用户列表
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 10, sortBy = 'createdAt', sortOrder = 'desc', keyword } = req.query as PaginationQuery & { keyword?: string };

    // 构建查询条件
    const where: any = {};
    if (keyword) {
      where[Op.or] = [
        { username: { [Op.like]: `%${String(keyword)}%` } },
        { email: { [Op.like]: `%${String(keyword)}%` } },
        { realName: { [Op.like]: `%${String(keyword)}%` } }
      ];
    }

    const order: Order = [[sortBy, sortOrder.toUpperCase()]];

    // 查询用户列表
    const { count, rows: users } = await User.findAndCountAll({
      where,
      order,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      include: [
        {
          model: Role,
          attributes: ['id', 'name', 'code'],
          as: 'roles'
        }
      ],
      attributes: { exclude: ['password'] }
    });

    ApiResponse.success(res, {
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
      list: users
    }, '获取用户列表成功');
  } catch (error) {
    console.error('获取用户列表错误:', error);
    throw ApiError.serverError('获取用户列表失败', 'USER_LIST_ERROR');
  }
};

/**
 * 获取用户详情
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      throw ApiError.badRequest('无效的用户ID', 'INVALID_USER_ID');
    }

    const user = await User.findByPk(id, {
      include: [
        {
          model: Role,
          attributes: ['id', 'name', 'code'],
          as: 'roles'
        }
      ],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw ApiError.notFound('用户不存在', 'USER_NOT_FOUND');
    }

    ApiResponse.success(res, user, '获取用户详情成功');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.serverError('获取用户详情失败', 'USER_DETAIL_ERROR');
  }
};

/**
 * 更新用户信息
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const userData = req.body as UpdateUserDto;

    if (!id || isNaN(Number(id))) {
      await transaction.rollback();
      throw ApiError.badRequest('无效的用户ID', 'INVALID_USER_ID');
    }

    const user = await User.findByPk(id, { transaction });
    if (!user) {
      await transaction.rollback();
      throw ApiError.notFound('用户不存在', 'USER_NOT_FOUND');
    }

    // 如果更新邮箱，检查是否已存在
    if (userData.email && userData.email !== user.email) {
      const existingEmail = await User.findOne({
        where: { email: userData.email },
        transaction
      });

      if (existingEmail) {
        await transaction.rollback();
        throw ApiError.badRequest('邮箱已存在', 'USER_EMAIL_EXISTS');
      }
    }

    // 更新用户信息
    await user.update({
      ...userData,
      realName: userData.realName || user.realName,
      phone: userData.phone || user.phone,
      status: userData.status || user.status
    }, { transaction });

    // 如果指定了角色，更新角色关联
    if (userData.roleIds) {
      await (user as any).setRoles(userData.roleIds, { transaction });
    }

    await transaction.commit();

    ApiResponse.success(res, {
      id: user.id,
      username: user.username,
      email: user.email,
      realName: user.realName,
      phone: user.phone,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }, '更新用户成功');
  } catch (error) {
    await transaction.rollback();
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.serverError('更新用户失败', 'USER_UPDATE_ERROR');
  }
};

/**
 * 删除用户
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      await transaction.rollback();
      throw ApiError.badRequest('无效的用户ID', 'INVALID_USER_ID');
    }

    const user = await User.findByPk(id, { transaction });
    if (!user) {
      await transaction.rollback();
      throw ApiError.notFound('用户不存在', 'USER_NOT_FOUND');
    }

    // 删除用户
    await user.destroy({ transaction });

    await transaction.commit();

    ApiResponse.success(res, { message: '用户删除成功' });
  } catch (error) {
    await transaction.rollback();
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.serverError('删除用户失败', 'USER_DELETE_ERROR');
  }
};

/**
 * 修改密码
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!id || isNaN(Number(id))) {
      await transaction.rollback();
      throw ApiError.badRequest('无效的用户ID', 'INVALID_USER_ID');
    }

    if (newPassword !== confirmPassword) {
      await transaction.rollback();
      throw ApiError.badRequest('两次输入的密码不一致', 'PASSWORD_MISMATCH');
    }

    const user = await User.findByPk(id, { transaction });
    if (!user) {
      await transaction.rollback();
      throw ApiError.notFound('用户不存在', 'USER_NOT_FOUND');
    }

    // 验证旧密码
    const isPasswordValid = await verifyPassword(oldPassword, user.password);
    if (!isPasswordValid) {
      await transaction.rollback();
      throw ApiError.badRequest('旧密码错误', 'INVALID_OLD_PASSWORD');
    }

    // 更新密码
    await user.update({
      password: await hashPassword(newPassword)
    }, { transaction });

    await transaction.commit();

    ApiResponse.success(res, { message: '密码修改成功' });
  } catch (error) {
    await transaction.rollback();
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.serverError('修改密码失败', 'PASSWORD_CHANGE_ERROR');
  }
};

export default {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword
}; 