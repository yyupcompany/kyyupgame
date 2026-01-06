import { Request, Response } from 'express';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { sequelize } from '../config/database';
import { Op } from 'sequelize';
const Joi = require('joi');
import { User } from '../models/user.model';
import { Role } from '../models/role.model';
import { UserRole } from '../models/user-role.model';

/**
 * 为用户分配角色
 */
export const assignRolesToUser = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    const schema = Joi.object({
      userId: Joi.number().required(),
      roleIds: Joi.array().items(Joi.number()).min(1).required(),
      isPrimary: Joi.number().valid(0, 1),
      startTime: Joi.date().iso(),
      endTime: Joi.date().iso().greater(Joi.ref('startTime')),
      grantorId: Joi.number()
    });
    const { error, value } = schema.validate({ ...req.params, ...req.body });
    if (error) {
      throw ApiError.badRequest(error.details[0].message);
    }
    const { userId, roleIds, isPrimary = 0, startTime = null, endTime = null, grantorId } = value;

    // 验证用户是否存在
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      throw ApiError.notFound('用户不存在', 'USER_NOT_FOUND');
    }

    const roles = await Role.findAll({
      where: { id: roleIds },
      transaction
    });

    if (roles.length !== roleIds.length) {
      await transaction.rollback();
      throw ApiError.badRequest('部分角色不存在', 'SOME_ROLES_NOT_FOUND');
    }

    // 获取当前用户已分配的角色
    const existingUserRoles = await UserRole.findAll({
      where: { userId },
      transaction
    });

    // 如果设置为主要角色，先将所有现有角色设为非主要
    if (isPrimary === 1) {
      await UserRole.update(
        { isPrimary: 0 },
        { 
          where: { userId },
          transaction 
        }
      );
    }

    // 创建角色分配记录
    const now = new Date();
    const newUserRoles = [];
    
    for (const roleId of roleIds) {
      // 检查是否已存在该角色分配
      const existingUserRole = existingUserRoles.find((ur: any) => ur.roleId === roleId);
      
      if (!existingUserRole) {
        newUserRoles.push({
          userId,
          roleId,
          isPrimary,
          startTime: startTime ? new Date(startTime) : null,
          endTime: endTime ? new Date(endTime) : null,
          grantorId: grantorId || null
        });
      }
    }

    // 如果有新的角色分配，批量创建
    if (newUserRoles.length > 0) {
      await UserRole.bulkCreate(newUserRoles, { transaction });
    }

    await transaction.commit();

    ApiResponse.success(res, {
      userId,
      roleCount: roles.length,
      newlyAssigned: newUserRoles.length
    }, '角色分配成功');
  } catch (error) {
    await transaction.rollback();
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.serverError('角色分配失败', 'ROLE_ASSIGN_ERROR');
  }
};

/**
 * 移除用户的角色
 */
export const removeRolesFromUser = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    const schema = Joi.object({
      userId: Joi.number().required(),
      roleIds: Joi.array().items(Joi.number()).min(1).required()
    });
    const { error, value } = schema.validate({ ...req.params, ...req.body });
    if (error) {
      throw ApiError.badRequest(error.details[0].message);
    }
    const { userId, roleIds } = value;

    // 验证用户是否存在
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      throw ApiError.notFound('用户不存在', 'USER_NOT_FOUND');
    }

    // 删除角色分配记录
    const result = await UserRole.destroy({
      where: {
        userId,
        roleId: roleIds
      },
      transaction
    });

    await transaction.commit();

    ApiResponse.success(res, {
      userId,
      removedCount: result
    }, '角色移除成功');
  } catch (error) {
    await transaction.rollback();
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.serverError('角色移除失败', 'ROLE_REMOVE_ERROR');
  }
};

/**
 * 获取用户的所有角色
 */
export const getUserRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const schema = Joi.object({
      userId: Joi.number().required()
    });
    const { error, value } = schema.validate(req.params);
    if (error) {
      throw ApiError.badRequest(error.details[0].message);
    }
    const { userId } = value;

    // 验证用户是否存在
    const user = await User.findByPk(userId);
    if (!user) {
      throw ApiError.notFound('用户不存在', 'USER_NOT_FOUND');
    }

    // 获取用户角色
    const userRoles = await UserRole.findAll({
      where: { userId },
      include: [
        {
          model: Role,
          attributes: ['id', 'name', 'code', 'description', 'status']
        },
        {
          model: User,
          as: 'grantor',
          attributes: ['id', 'username', 'realName'],
          required: false
        }
      ]
    });

    ApiResponse.success(res, {
      userId,
      roles: userRoles.map((ur: any) => ({
        ...ur.get(),
        role: ur.role
      }))
    }, '获取用户角色成功');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.serverError('获取用户角色失败', 'GET_USER_ROLES_ERROR');
  }
};

/**
 * 设置用户主要角色
 */
export const setPrimaryRole = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    const schema = Joi.object({
      userId: Joi.number().required(),
      roleId: Joi.number().required()
    });
    const { error, value } = schema.validate({ ...req.params, ...req.body });
    if (error) {
      throw ApiError.badRequest(error.details[0].message);
    }
    const { userId, roleId } = value;

    // 验证用户是否存在
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      throw ApiError.notFound('用户不存在', 'USER_NOT_FOUND');
    }

    // 验证用户是否有该角色
    const userRole = await UserRole.findOne({
      where: {
        userId,
        roleId
      },
      transaction
    });

    if (!userRole) {
      await transaction.rollback();
      throw ApiError.badRequest('用户未分配该角色', 'USER_ROLE_NOT_FOUND');
    }

    // 先将所有角色设为非主要
    await UserRole.update(
      { isPrimary: 0 },
      { 
        where: { userId },
        transaction 
      }
    );

    // 设置主要角色
    await userRole.update({ isPrimary: 1 }, { transaction });

    await transaction.commit();

    ApiResponse.success(res, {
      userId,
      roleId,
      isPrimary: 1
    }, '设置主要角色成功');
  } catch (error) {
    await transaction.rollback();
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.serverError('设置主要角色失败', 'SET_PRIMARY_ROLE_ERROR');
  }
};

/**
 * 更新用户角色的有效期
 */
export const updateRoleValidity = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    const schema = Joi.object({
      userRoleId: Joi.number().required(),
      startTime: Joi.date().iso(),
      endTime: Joi.date().iso().greater(Joi.ref('startTime')),
    });
    const { error, value } = schema.validate({ ...req.params, ...req.body });
    if (error) {
      throw ApiError.badRequest(error.details[0].message);
    }
    const { userRoleId, startTime, endTime } = value;

    // 验证用户角色记录是否存在
    const userRole = await UserRole.findByPk(userRoleId, { transaction });
    if (!userRole) {
      await transaction.rollback();
      throw ApiError.notFound('用户角色记录不存在', 'USER_ROLE_NOT_FOUND');
    }

    // 更新有效期
    await userRole.update({
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null
    }, { transaction });

    await transaction.commit();

    ApiResponse.success(res, userRole, '用户角色有效期更新成功');
  } catch (error) {
    await transaction.rollback();
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.serverError('更新有效期失败', 'UPDATE_VALIDITY_ERROR');
  }
};

/**
 * 获取用户的角色分配历史
 */
export const getUserRoleHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const schema = Joi.object({
      userId: Joi.number().required(),
      page: Joi.number().min(1),
      pageSize: Joi.number().min(1).max(100)
    });
    const { error, value } = schema.validate({ ...req.params, ...req.query });
    if (error) {
      throw ApiError.badRequest(error.details[0].message);
    }
    const { userId, page = 1, pageSize = 10 } = value;

    // 验证用户是否存在
    const user = await User.findByPk(userId);
    if (!user) {
      throw ApiError.notFound('用户不存在', 'USER_NOT_FOUND');
    }

    // 获取分配历史（包括已删除的记录）
    const { count, rows } = await UserRole.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Role,
          attributes: ['id', 'name', 'code']
        },
        {
          model: User,
          as: 'grantor',
          attributes: ['id', 'username', 'realName'],
          required: false
        }
      ],
      paranoid: false, // 包括已删除的记录
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize
    });

    ApiResponse.success(res, {
      total: count,
      page,
      pageSize,
      history: rows
    }, '获取用户角色历史成功');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.serverError('获取用户角色历史失败', 'GET_USER_ROLE_HISTORY_ERROR');
  }
};

export default {
  assignRolesToUser,
  removeRolesFromUser,
  getUserRoles,
  setPrimaryRole,
  updateRoleValidity,
  getUserRoleHistory
}; 