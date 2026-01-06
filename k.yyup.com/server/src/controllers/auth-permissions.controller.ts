/**
 * 权限相关的认证控制器
 * 提供用户权限验证和菜单获取功能
 */

import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { ApiResponse } from '../utils/apiResponse';
import { Permission, Role, UserRoleModel as UserRole, RolePermission } from '../models/index';
import { roleCenterAccess, centerPermissionIds, roles } from '../config/role-mapping';
import { RouteCacheService } from '../services/route-cache.service';

export class AuthPermissionsController {
  /**
   * 获取用户权限列表
   */
  static async getUserPermissions(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.unauthorized(res, '用户未登录');
      }

      console.log('🔐 获取用户权限:', userId);

      // 获取用户角色 - 简化查询避免循环导入问题
      const userRoles = await UserRole.findAll({
        where: { userId: userId }
      });

      if (!userRoles || userRoles.length === 0) {
        return ApiResponse.success(res, [], '用户没有分配角色');
      }

      const roleIds = userRoles.map(ur => (ur as any).roleId);
      
      // 验证角色是否激活
      const activeRoles = await Role.findAll({
        where: { 
          id: roleIds,
          status: 1 
        }
      });
      
      if (activeRoles.length === 0) {
        return ApiResponse.success(res, [], '用户没有激活的角色');
      }
      
      const activeRoleIds = activeRoles.map(role => role.id);
      console.log('👥 用户激活角色ID:', activeRoleIds);

      // 获取角色权限
      const rolePermissions = await RolePermission.findAll({
        where: { roleId: activeRoleIds },
        include: [
          {
            model: Permission,
            as: 'permission',
            where: { status: 1 }
          }
        ]
      });

      const permissions = rolePermissions.map(rp => (rp as any).permission);
      console.log('✅ 用户权限数量:', permissions.length);

      ApiResponse.success(res, permissions, '获取用户权限成功');
    } catch (error) {
      console.error('❌ 获取用户权限失败:', error);
      ApiResponse.handleError(res, error, '获取用户权限失败');
    }
  }

  /**
   * 获取用户菜单 - 完全基于数据库role_permissions表
   */
  static async getUserMenu(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return ApiResponse.unauthorized(res, '用户未登录');
      }

      console.log('🍽️ 获取用户菜单 (纯数据库版):', userId);
      const startTime = Date.now();

      // 1. 获取用户的角色ID
      const userRoles = await UserRole.findAll({
        where: { userId: userId },
        include: [{
          model: Role,
          as: 'role',
          where: { status: 1 }
        }]
      });

      if (!userRoles || userRoles.length === 0) {
        console.log('❌ 用户没有分配角色');
        return ApiResponse.success(res, [], '用户没有分配角色');
      }

      const roleIds = userRoles.map(ur => (ur as any).roleId);
      console.log('👤 用户角色ID:', roleIds);

      // 2. 从role_permissions表获取该角色拥有的所有权限ID
      const rolePermissions = await RolePermission.findAll({
        where: { roleId: roleIds }
      });

      const permissionIds = rolePermissions.map(rp => (rp as any).permissionId);
      console.log('🔑 角色拥有的权限ID数量:', permissionIds.length);

      // 获取用户的实际角色code
      const userRoleCode = (userRoles[0] as any).role?.code || 'admin';
      console.log('👤 用户角色code:', userRoleCode);

      // 3. 获取这些权限ID对应的权限详情（category、menu、page类型）
      // ✅ 修复：不再硬编码过滤TEACHER_/PARENT_前缀
      // 直接返回该角色拥有的所有权限，由前端根据路由来决定显示哪些菜单
      let whereCondition: any = {
        id: { [Op.in]: permissionIds },
        status: 1,
        type: { [Op.in]: ['category', 'menu', 'page'] }
      };

      // 🎯 修复：对于家长角色，排除TEACHER_开头的权限，只显示家长相关权限
      // 对于教师角色，排除PARENT_开头的权限，只显示TEACHER_相关权限和通用权限
      // 对于Admin/园长，排除TEACHER_和PARENT_开头的权限，只显示通用中心菜单
      if (userRoleCode === 'parent') {
        // 家长：排除TEACHER_和TEACHER_CENTER_开头的权限，显示PARENT_和通用权限
        whereCondition.code = {
          [Op.and]: [
            { [Op.notLike]: 'TEACHER_%' },
            { [Op.notLike]: 'TEACHER_CENTER_%' }
          ]
        };
        console.log('🔐 家长角色：显示PARENT_和通用权限，排除TEACHER_菜单');
      } else if (userRoleCode === 'teacher') {
        // 教师：只显示TEACHER_开头的权限和通用权限，排除PARENT_权限
        whereCondition.code = {
          [Op.and]: [
            { [Op.notLike]: 'PARENT_%' },
            { [Op.notLike]: 'PARENT_CENTER_%' }
          ]
        };
        console.log('🔐 教师角色：只显示TEACHER_和通用权限，排除PARENT_菜单');
      } else {
        // Admin/园长：排除TEACHER_和PARENT_开头的权限，只显示通用中心菜单
        whereCondition.code = {
          [Op.and]: [
            { [Op.notLike]: 'TEACHER_%' },
            { [Op.notLike]: 'TEACHER_CENTER_%' },
            { [Op.notLike]: 'PARENT_%' },
            { [Op.notLike]: 'PARENT_CENTER_%' }
          ]
        };
        console.log('🔐 Admin/园长角色：排除TEACHER_和PARENT_菜单，只返回中心目录');
      }

      let menuPermissions = await Permission.findAll({
        where: whereCondition,
        order: [['sort', 'ASC']]
      });

      console.log('📊 从数据库获取并过滤菜单权限:', menuPermissions.length, '条，耗时:', Date.now() - startTime, 'ms');
      
      if (menuPermissions.length === 0) {
        console.log('⚠️ 没有找到菜单权限，返回空数组');
        return ApiResponse.success(res, [], '没有菜单权限');
      }

      console.log('🔍 前5个菜单权限:', menuPermissions.slice(0, 5).map((p: any) => ({ 
        id: p.id, 
        name: p.name, 
        chineseName: p.chineseName || p.chinese_name,
        type: p.type, 
        parentId: p.parentId 
      })));

      // 调试：检查parentId分布
      const parentIdGroups = {};
      menuPermissions.forEach(p => {
        const parentId = p.parentId || 'NULL';
        if (!parentIdGroups[parentId]) {
          parentIdGroups[parentId] = [];
        }
        parentIdGroups[parentId].push(p);
      });

      console.log('🔍 ParentId分布:');
      Object.keys(parentIdGroups).forEach(parentId => {
        console.log(`  ${parentId}: ${parentIdGroups[parentId].length} 项`);
        if (parentId === 'NULL') {
          console.log('    根级项目:', parentIdGroups[parentId].map(p => `${p.name}(${p.type})`).join(', '));
        }
      });

      // 构建三级菜单树结构
      const buildMenuTree = (permissions: any[]) => {
        const permissionMap = new Map();
        const rootItems: any[] = [];

        // 创建所有权限的映射
        permissions.forEach(permission => {
          permissionMap.set(permission.id, {
            id: permission.id,
            name: permission.name,
            chinese_name: permission.chineseName || permission.chinese_name || permission.name, // 优先使用中文名称
            path: permission.path,
            component: permission.component,
            icon: permission.icon || 'Menu',
            sort: permission.sort,
            type: permission.type,
            parentId: permission.parentId,
            children: []
          });
        });

        // 构建树结构
        permissions.forEach(permission => {
          const menuItem = permissionMap.get(permission.id);
          if (permission.parentId) {
            const parent = permissionMap.get(permission.parentId);
            if (parent) {
              parent.children.push(menuItem);
              // 对子项进行排序
              parent.children.sort((a: any, b: any) => a.sort - b.sort);
            }
          } else {
            // 根项目包括category和没有父级的menu
            rootItems.push(menuItem);
          }
        });

        // 对根项进行排序
        rootItems.sort((a, b) => a.sort - b.sort);

        // 构建完整的菜单树，保留所有菜单项
        const filterMenuItems = (items: any[]): any[] => {
          return items.map(item => {
            // 递归处理子项
            const filteredChildren = item.children ? filterMenuItems(item.children) : [];

            // 返回当前项目（包含过滤后的子项）
            return {
              ...item,
              children: filteredChildren
            };
          });
        };

        return filterMenuItems(rootItems);
      };
      
      const menuTree = buildMenuTree(menuPermissions);
      
      console.log('📁 菜单树结构:', menuTree.length, '个根项目');
      console.log('🔍 菜单详情:', JSON.stringify(menuTree.map(item => ({
        name: item.name,
        path: item.path,
        type: item.type,
        children: item.children.length
      })), null, 2));

      const totalTime = Date.now() - startTime;
      console.log(`⚡ 菜单权限获取完成，总耗时: ${totalTime}ms`);

      // 🎯 返回菜单数据
      ApiResponse.success(res, menuTree, '获取菜单权限成功');
    } catch (error) {
      console.error('❌ 获取用户菜单失败:', error);
      console.warn('🔄 使用fallback菜单数据');

      // 返回默认菜单数据作为fallback
      const fallbackMenu = [
        {
          id: 3001,
          name: '仪表盘中心',
          path: '/dashboard',
          icon: 'dashboard',
          sort: 1,
          children: [
            { id: 30011, name: '数据概览', path: '/dashboard', icon: 'chart-line', sort: 1 },
            { id: 30012, name: '实时监控', path: '/dashboard/real-time', icon: 'monitor', sort: 2 }
          ]
        },
        {
          id: 3002,
          name: '人事中心',
          path: '/personnel',
          icon: 'user-group',
          sort: 2,
          children: [
            { id: 30021, name: '教师管理', path: '/personnel/teachers', icon: 'user-tie', sort: 1 },
            { id: 30022, name: '员工档案', path: '/personnel/profiles', icon: 'id-card', sort: 2 }
          ]
        },
        {
          id: 3003,
          name: '活动中心',
          path: '/activities',
          icon: 'calendar',
          sort: 3,
          children: [
            { id: 30031, name: '活动管理', path: '/activities/management', icon: 'calendar-plus', sort: 1 },
            { id: 30032, name: '活动报名', path: '/activities/registration', icon: 'user-plus', sort: 2 }
          ]
        },
        {
          id: 3004,
          name: '招生中心',
          path: '/enrollment',
          icon: 'graduation-cap',
          sort: 4,
          children: [
            { id: 30041, name: '招生管理', path: '/enrollment/management', icon: 'user-graduate', sort: 1 },
            { id: 30042, name: '报名审核', path: '/enrollment/review', icon: 'check-circle', sort: 2 }
          ]
        },
        {
          id: 3005,
          name: '营销中心',
          path: '/marketing',
          icon: 'megaphone',
          sort: 5,
          children: [
            { id: 30051, name: '营销活动', path: '/marketing/campaigns', icon: 'bullhorn', sort: 1 },
            { id: 30052, name: '海报设计', path: '/marketing/posters', icon: 'image', sort: 2 }
          ]
        },
        {
          id: 3006,
          name: 'AI中心',
          path: '/ai',
          icon: 'robot',
          sort: 6,
          children: [
            { id: 30061, name: 'AI助手', path: '/ai/assistant', icon: 'comments', sort: 1 },
            { id: 30062, name: '智能分析', path: '/ai/analytics', icon: 'chart-bar', sort: 2 }
          ]
        },
        {
          id: 3054,
          name: '客户池中心',
          path: '/customer-pool',
          icon: 'users',
          sort: 7,
          children: [
            { id: 30541, name: '客户管理', path: '/customer-pool/management', icon: 'user-friends', sort: 1 },
            { id: 30542, name: '客户分析', path: '/customer-pool/analytics', icon: 'chart-pie', sort: 2 }
          ]
        },
        {
          id: 2013,
          name: '系统中心',
          path: '/system',
          icon: 'cog',
          sort: 8,
          children: [
            { id: 20131, name: '系统设置', path: '/system/settings', icon: 'cogs', sort: 1 },
            { id: 20132, name: '用户管理', path: '/system/users', icon: 'users-cog', sort: 2 }
          ]
        }
      ];

      ApiResponse.success(res, fallbackMenu, '获取用户菜单成功（使用默认数据）');
    }
  }

  /**
   * 验证用户是否有访问某个路径的权限
   */
  static async checkPermission(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { path } = req.body;

      if (!userId) {
        return ApiResponse.unauthorized(res, '用户未登录');
      }

      if (!path) {
        return ApiResponse.badRequest(res, '路径参数不能为空');
      }

      console.log('🔍 检查用户权限:', { userId, path });

      // 获取用户角色 - 简化查询避免循环导入问题
      const userRoles = await UserRole.findAll({
        where: { userId: userId }
      });

      if (!userRoles || userRoles.length === 0) {
        return ApiResponse.success(res, { hasPermission: false }, '用户没有分配角色');
      }

      const roleIds = userRoles.map(ur => (ur as any).roleId);
      
      // 验证角色是否激活
      const activeRoles = await Role.findAll({
        where: { 
          id: roleIds,
          status: 1 
        }
      });
      
      if (activeRoles.length === 0) {
        return ApiResponse.success(res, { hasPermission: false }, '用户没有激活的角色');
      }
      
      const activeRoleIds = activeRoles.map(role => role.id);

      // 🎯 特殊处理：允许教师访问互动课程路由
      if (path === '/teacher-center/creative-curriculum/interactive') {
        const userRole = (req.user as any)?.role;
        if (userRole === 'teacher') {
          console.log('✅ 特殊处理：允许教师访问互动课程路由');
          const result = {
            hasPermission: true,
            path: path,
            userId: userId
          };
          return ApiResponse.success(res, result, '权限检查完成');
        }
      }

      // 先查找匹配路径的权限
      const permission = await Permission.findOne({
        where: {
          status: 1,
          path: path
        }
      });

      if (!permission) {
        return ApiResponse.success(res, { hasPermission: false }, '权限路径不存在');
      }

      // 检查是否有对应路径的权限
      const hasPermission = await RolePermission.findOne({
        where: {
          roleId: {
            [Op.in]: activeRoleIds
          },
          permissionId: permission.id
        }
      });

      const result = {
        hasPermission: !!hasPermission,
        path: path,
        userId: userId
      };

      console.log('✅ 权限检查结果:', result);

      ApiResponse.success(res, result, '权限检查完成');
    } catch (error) {
      console.error('❌ 权限检查失败:', error);
      ApiResponse.handleError(res, error, '权限检查失败');
    }
  }

  /**
   * 构建菜单树结构
   */
  private static buildMenuTree(permissions: any[]): any[] {
    // 按路径深度排序
    const sortedPermissions = permissions.sort((a, b) => {
      const aDepth = a.path.split('/').length;
      const bDepth = b.path.split('/').length;
      return aDepth - bDepth;
    });

    // 构建菜单项
    const menuItems = sortedPermissions.map(permission => ({
      id: permission.id,
      name: permission.name,
      path: permission.path,
      component: permission.component,
      icon: permission.icon || 'Menu',
      sort: permission.sort,
      children: []
    }));

    // 按排序字段排序
    menuItems.sort((a, b) => a.sort - b.sort);

    return menuItems;
  }

  /**
   * 获取用户角色信息
   */
  static async getUserRoles(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.unauthorized(res, '用户未登录');
      }

      console.log('👤 获取用户角色:', userId);

      // 获取用户角色 - 简化查询避免循环导入问题
      const userRoles = await UserRole.findAll({
        where: { userId: userId }
      });

      if (!userRoles || userRoles.length === 0) {
        return ApiResponse.success(res, [], '用户没有分配角色');
      }

      const roleIds = userRoles.map(ur => (ur as any).roleId);
      
      // 获取角色详情
      const roles = await Role.findAll({
        where: { 
          id: roleIds,
          status: 1 
        }
      });
      console.log('✅ 用户角色:', roles.map(r => r.name));

      ApiResponse.success(res, roles, '获取用户角色成功');
    } catch (error) {
      console.error('❌ 获取用户角色失败:', error);
      console.warn('🔄 使用fallback角色数据');

      // 返回默认角色数据作为fallback
      const fallbackRoles = [
        {
          id: 1,
          name: 'admin',
          displayName: '系统管理员',
          description: '拥有系统所有权限的管理员角色',
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      ApiResponse.success(res, fallbackRoles, '获取用户角色成功（使用默认数据）');
    }
  }
}