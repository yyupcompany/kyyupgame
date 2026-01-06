import { GroupUser, GroupRole, GroupUserStatus } from '../models/group-user.model';
import { Group } from '../models/group.model';
import { User } from '../models/user.model';

/**
 * 添加集团用户参数接口
 */
interface AddGroupUserParams {
  groupId: number;
  userId: number;
  role: GroupRole;
  canViewAllKindergartens?: number;
  canManageKindergartens?: number;
  canViewFinance?: number;
  canManageFinance?: number;
  remark?: string;
}

/**
 * 更新集团用户参数接口
 */
interface UpdateGroupUserParams {
  role?: GroupRole;
  canViewAllKindergartens?: number;
  canManageKindergartens?: number;
  canViewFinance?: number;
  canManageFinance?: number;
  status?: GroupUserStatus;
  remark?: string;
}

/**
 * 集团用户服务类
 */
export class GroupUserService {
  /**
   * 获取集团用户列表
   */
  async getGroupUsers(groupId: number) {
    const groupUsers = await GroupUser.findAll({
      where: { groupId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'realName', 'email', 'phone', 'avatar']
        }
      ],
      order: [['role', 'ASC'], ['createdAt', 'DESC']]
    });

    return groupUsers;
  }

  /**
   * 添加集团用户
   */
  async addGroupUser(params: AddGroupUserParams) {
    const {
      groupId,
      userId,
      role,
      canViewAllKindergartens = 1,
      canManageKindergartens = 0,
      canViewFinance = 0,
      canManageFinance = 0,
      remark
    } = params;

    // 检查集团是否存在
    const group = await Group.findByPk(groupId);
    if (!group) {
      throw new Error('集团不存在');
    }

    // 检查用户是否存在
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 检查用户是否已经在集团中
    const existingGroupUser = await GroupUser.findOne({
      where: { groupId, userId }
    });

    if (existingGroupUser) {
      throw new Error('该用户已在集团中');
    }

    // 根据角色设置默认权限
    let permissions = {
      canViewAllKindergartens,
      canManageKindergartens,
      canViewFinance,
      canManageFinance
    };

    // 投资人拥有所有权限
    if (role === GroupRole.INVESTOR) {
      permissions = {
        canViewAllKindergartens: 1,
        canManageKindergartens: 1,
        canViewFinance: 1,
        canManageFinance: 1
      };
    }
    // 集团管理员拥有管理权限
    else if (role === GroupRole.ADMIN) {
      permissions = {
        canViewAllKindergartens: 1,
        canManageKindergartens: 1,
        canViewFinance: 0,
        canManageFinance: 0
      };
    }
    // 财务总监拥有财务权限
    else if (role === GroupRole.FINANCE_DIRECTOR) {
      permissions = {
        canViewAllKindergartens: 1,
        canManageKindergartens: 0,
        canViewFinance: 1,
        canManageFinance: 1
      };
    }
    // 运营总监拥有查看权限
    else if (role === GroupRole.OPERATION_DIRECTOR) {
      permissions = {
        canViewAllKindergartens: 1,
        canManageKindergartens: 0,
        canViewFinance: 1,
        canManageFinance: 0
      };
    }

    // 创建集团用户关联
    const groupUser = await GroupUser.create({
      groupId,
      userId,
      role,
      ...permissions,
      remark,
      status: GroupUserStatus.ACTIVE
    });

    return groupUser;
  }

  /**
   * 更新集团用户权限
   */
  async updateGroupUser(groupId: number, userId: number, params: UpdateGroupUserParams) {
    const groupUser = await GroupUser.findOne({
      where: { groupId, userId }
    });

    if (!groupUser) {
      throw new Error('集团用户关联不存在');
    }

    await groupUser.update(params);

    return groupUser;
  }

  /**
   * 移除集团用户
   */
  async removeGroupUser(groupId: number, userId: number) {
    const groupUser = await GroupUser.findOne({
      where: { groupId, userId }
    });

    if (!groupUser) {
      throw new Error('集团用户关联不存在');
    }

    // 检查是否是投资人
    if (groupUser.role === GroupRole.INVESTOR) {
      // 检查是否是唯一的投资人
      const investorCount = await GroupUser.count({
        where: {
          groupId,
          role: GroupRole.INVESTOR
        }
      });

      if (investorCount <= 1) {
        throw new Error('不能移除唯一的投资人');
      }
    }

    await groupUser.destroy();

    return { success: true, message: '用户已移除' };
  }

  /**
   * 获取用户在集团中的角色
   */
  async getUserRole(groupId: number, userId: number) {
    const groupUser = await GroupUser.findOne({
      where: { groupId, userId, status: GroupUserStatus.ACTIVE }
    });

    return groupUser ? groupUser.role : null;
  }

  /**
   * 检查用户权限
   */
  async checkPermission(
    groupId: number,
    userId: number,
    permission: 'viewAll' | 'manage' | 'viewFinance' | 'manageFinance'
  ): Promise<boolean> {
    const groupUser = await GroupUser.findOne({
      where: { groupId, userId, status: GroupUserStatus.ACTIVE }
    });

    if (!groupUser) {
      return false;
    }

    // 投资人拥有所有权限
    if (groupUser.role === GroupRole.INVESTOR) {
      return true;
    }

    // 检查具体权限
    switch (permission) {
      case 'viewAll':
        return groupUser.canViewAllKindergartens === 1;
      case 'manage':
        return groupUser.canManageKindergartens === 1;
      case 'viewFinance':
        return groupUser.canViewFinance === 1;
      case 'manageFinance':
        return groupUser.canManageFinance === 1;
      default:
        return false;
    }
  }
}

export default new GroupUserService();

