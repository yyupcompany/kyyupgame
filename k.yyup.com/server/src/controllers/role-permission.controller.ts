import { Request, Response } from 'express';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { sequelize } from '../init';
import { Op } from 'sequelize';
const Joi = require('joi');
import { Role } from '../models/role.model';
import { Permission } from '../models/permission.model';
import { RolePermission } from '../models/role-permission.model';
import { User } from '../models/user.model';

/**
 * 为角色分配权限
 */
export const assignPermissionsToRole = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    const schema = Joi.object({
      roleId: Joi.number().required(),
      permissionIds: Joi.array().items(Joi.number()).min(1).required(),
      isInherit: Joi.number().valid(0, 1),
      grantorId: Joi.number()
    });

    const { error, value } = schema.validate({ ...req.params, ...req.body });
    if (error) {
      throw ApiError.badRequest(error.details[0].message);
    }

    const { roleId, permissionIds, isInherit = 1, grantorId } = value;

    // 验证角色是否存在
    const role = await Role.findByPk(roleId, { transaction });
    if (!role) {
      await transaction.rollback();
      throw ApiError.notFound('角色不存在', 'ROLE_NOT_FOUND');
    }

    // 验证权限是否存在
    if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
      await transaction.rollback();
      throw ApiError.badRequest('权限ID列表不能为空', 'PERMISSION_IDS_REQUIRED');
    }

    const permissions = await Permission.findAll({
      where: { id: permissionIds },
      transaction
    });

    if (permissions.length !== permissionIds.length) {
      await transaction.rollback();
      throw ApiError.badRequest('部分权限不存在', 'SOME_PERMISSIONS_NOT_FOUND');
    }

    // 获取当前已分配的权限
    const existingPermissions = await RolePermission.findAll({
      where: { roleId },
      transaction
    });

    // 创建权限分配记录
    const now = new Date();
    const newPermissions = [];
    
    for (const permissionId of permissionIds) {
      // 检查是否已存在该权限分配
      const existingPermission = existingPermissions.find((p: any) => p.permissionId === Number(permissionId) || 0);
      
      if (!existingPermission) {
        newPermissions.push({
          roleId: Number(roleId) || 0,
          permissionId: Number(permissionId) || 0,
          isInherit: Number(isInherit) || 0,
          grantTime: now,
          grantorId: grantorId || null
        });
      }
    }

    // 如果有新的权限分配，批量创建
    if (newPermissions.length > 0) {
      await RolePermission.bulkCreate(newPermissions, { transaction });
    }

    await transaction.commit();

    ApiResponse.success(res, {
      roleId,
      permissionCount: permissions.length,
      newlyAssigned: newPermissions.length
    }, '权限分配成功');
  } catch (error) {
    await transaction.rollback();
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.serverError('权限分配失败', 'PERMISSION_ASSIGN_ERROR');
  }
};

/**
 * 移除角色的权限
 */
export const removePermissionsFromRole = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    const schema = Joi.object({
      roleId: Joi.number().required(),
      permissionIds: Joi.array().items(Joi.number()).min(1).required()
    });
    const { error, value } = schema.validate({ ...req.params, ...req.body });
    if (error) {
      throw ApiError.badRequest(error.details[0].message);
    }
    const { roleId, permissionIds } = value;

    // 验证角色是否存在
    const role = await Role.findByPk(roleId, { transaction });
    if (!role) {
      await transaction.rollback();
      throw ApiError.notFound('角色不存在', 'ROLE_NOT_FOUND');
    }

    // 删除权限分配记录
    const result = await RolePermission.destroy({
      where: {
        roleId,
        permissionId: permissionIds
      },
      transaction
    });

    await transaction.commit();

    ApiResponse.success(res, {
      roleId,
      removedCount: result
    }, '权限移除成功');
  } catch (error) {
    await transaction.rollback();
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.serverError('权限移除失败', 'PERMISSION_REMOVE_ERROR');
  }
};

/**
 * 获取角色的所有权限
 */
export const getRolePermissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const schema = Joi.object({
      roleId: Joi.number().required()
    });
    const { error, value } = schema.validate(req.params);
    if (error) {
      throw ApiError.badRequest(error.details[0].message);
    }
    const { roleId } = value;

    // 验证角色是否存在
    const role = await Role.findByPk(roleId);
    if (!role) {
      throw ApiError.notFound('角色不存在', 'ROLE_NOT_FOUND');
    }

    // 获取角色权限
    const rolePermissions = await RolePermission.findAll({
      where: { roleId },
      include: [
        {
          model: Permission,
          attributes: ['id', 'name', 'code', 'type', 'parentId', 'path', 'component', 'icon']
        }
      ]
    });

    ApiResponse.success(res, {
      roleId,
      permissions: rolePermissions.map((rp: any) => ({
        ...rp.get(),
        permission: rp.permission
      }))
    }, '获取角色权限成功');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.serverError('获取角色权限失败', 'GET_ROLE_PERMISSIONS_ERROR');
  }
};

/**
 * 获取权限继承结构
 */
export const getPermissionInheritance = async (req: Request, res: Response): Promise<void> => {
  try {
    const schema = Joi.object({
      permissionId: Joi.number().required()
    });
    const { error, value } = schema.validate(req.params);
    if (error) {
      throw ApiError.badRequest(error.details[0].message);
    }
    const { permissionId } = value;

    // 验证权限是否存在
    const permission = await Permission.findByPk(permissionId);
    if (!permission) {
      throw ApiError.notFound('权限不存在', 'PERMISSION_NOT_FOUND');
    }

    // 获取所有子权限（递归查询）
    const childPermissions = await findChildPermissions(Number(permissionId) || 0);

    ApiResponse.success(res, {
      permission,
      childPermissions
    }, '获取权限继承结构成功');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.serverError('获取权限继承结构失败', 'GET_PERMISSION_INHERITANCE_ERROR');
  }
};

/**
 * 递归查找子权限
 */
const findChildPermissions = async (parentId: number): Promise<any[]> => {
  const children = await Permission.findAll({
    where: { parentId }
  });

  const result = [...children];

  for (const child of children) {
    const grandchildren = await findChildPermissions(child.id);
    result.push(...grandchildren);
  }

  return result;
};

/**
 * 获取权限分配历史
 */
export const getRolePermissionHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const schema = Joi.object({
      roleId: Joi.number().required(),
      page: Joi.number().min(1),
      pageSize: Joi.number().min(1).max(100)
    });
    const { error, value } = schema.validate({ ...req.params, ...req.query });
    if (error) {
      throw ApiError.badRequest(error.details[0].message);
    }
    const { roleId, page = 1, pageSize = 10 } = value;

    // 验证角色是否存在
    const role = await Role.findByPk(roleId);
    if (!role) {
      throw ApiError.notFound('角色不存在', 'ROLE_NOT_FOUND');
    }

    // 获取分配历史（包括已删除的记录）
    const { count, rows } = await RolePermission.findAndCountAll({
      where: { roleId },
      include: [
        {
          model: Permission,
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
      page: Number(page) || 0,
      pageSize: Number(pageSize) || 0,
      list: rows
    }, '获取权限分配历史成功');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.serverError('获取权限分配历史失败', 'GET_PERMISSION_HISTORY_ERROR');
  }
};

/**
 * 检测权限冲突
 */
export const checkPermissionConflicts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roleId, permissionIds } = req.body;

    // 验证角色是否存在
    const role = await Role.findByPk(roleId);
    if (!role) {
      throw ApiError.notFound('角色不存在', 'ROLE_NOT_FOUND');
    }

    // 获取要检查的权限
    const checkingPermissions = await Permission.findAll({
      where: { id: permissionIds }
    });

    if (checkingPermissions.length !== permissionIds.length) {
      throw ApiError.badRequest('部分权限不存在');
    }

    // 获取角色当前所有权限
    const rolePermissions = await RolePermission.findAll({
      where: { roleId }
    });
    const currentPermissionIds = rolePermissions.map((rp: any) => rp.permissionId);

    // 获取所有权限定义
    const allPermissions = await Permission.findAll();

    const conflicts = [];

    // 检查每个待分配的权限
    for (const checkingPermission of checkingPermissions) {
      if (currentPermissionIds.includes(checkingPermission.id)) {
        continue; // 权限已存在，不检查冲突
      }

      // 检查与待分配权限互斥的权限
      const conflictPermissionCodes = (checkingPermission as any).conflictCodes || [];

      for (const code of conflictPermissionCodes) {
        const conflictPermission = allPermissions.find((p: any) => p.code === code);
        if (conflictPermission && currentPermissionIds.includes(conflictPermission.id)) {
          conflicts.push({
            checkingPermission: checkingPermission.name,
            conflictPermission: conflictPermission.name,
            reason: `权限'${checkingPermission.name}'与已分配的权限'${conflictPermission.name}'互斥`
          });
        }
      }

      // 检查待分配权限的父级和子级权限
      const parentIds = await getParentPermissionIds(checkingPermission.id, allPermissions);
      const childIds = (await findChildPermissions(checkingPermission.id)).map(p => p.id);

      // 如果父级权限已存在，则子权限无需重复分配
      if (parentIds.some(id => currentPermissionIds.includes(id))) {
        conflicts.push({
          checkingPermission: checkingPermission.name,
          reason: `权限'${checkingPermission.name}'的父级权限已分配，无需重复分配`
        });
      }

      // 如果子级权限已存在，则分配父级权限是冗余的
      if (childIds.some(id => currentPermissionIds.includes(id))) {
        conflicts.push({
          checkingPermission: checkingPermission.name,
          reason: `权限'${checkingPermission.name}'的子级权限已分配，分配父级权限是多余的`
        });
      }
    }

    ApiResponse.success(res, { conflicts });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.serverError('检查权限冲突失败');
  }
};

/**
 * 递归获取父权限ID列表
 */
const getParentPermissionIds = async (permissionId: number, allPermissions: any[]): Promise<number[]> => {
  const permission = allPermissions.find((p: any) => p.id === permissionId);
  if (!permission || !permission.parentId) {
    return [];
  }
  const parentIds = [permission.parentId];
  const grandParentIds = await getParentPermissionIds(permission.parentId, allPermissions);
  return [...parentIds, ...grandParentIds];
};

export default {
  assignPermissionsToRole,
  removePermissionsFromRole,
  getRolePermissions,
  getPermissionInheritance,
  getRolePermissionHistory,
  checkPermissionConflicts
}; 