import { FindOptions, Op, Transaction } from 'sequelize';
import bcrypt from 'bcrypt';
import { sequelize } from '../../init';
import { User, UserStatus } from '../../models/user.model';
import { Role } from '../../models/role.model';
import { UserRole } from '../../models/user-role.model';
import { 
  IUserService, 
  UserCreateParams, 
  UserUpdateParams, 
  UserQueryParams, 
  PaginationResult 
} from './interfaces/user-service.interface';

/**
 * 用户管理服务实现
 * @description 实现用户管理相关的业务逻辑
 */
export class UserService implements IUserService {
  /**
   * 创建用户
   * @param data 用户创建数据
   * @returns 创建的用户实例
   */
  async create(data: UserCreateParams): Promise<User> {
    const transaction = await sequelize.transaction();
    
    try {
      // 验证用户名和邮箱唯一性
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { username: data.username },
            { email: data.email }
          ]
        },
        transaction
      });

      if (existingUser) {
        throw new Error('用户名或邮箱已存在');
      }

      // 对密码进行哈希处理
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // 创建用户
      const user = await User.create({
        username: data.username,
        password: hashedPassword,
        email: data.email,
        realName: data.realName,
        phone: data.phone || '',
        status: data.status !== undefined ? data.status : UserStatus.ACTIVE
      }, { transaction });

      // 如果提供了角色ID，则分配角色
      if (data.roleIds && data.roleIds.length > 0) {
        await this.assignRolesInternal(user.id, data.roleIds, { 
          primaryRoleId: data.roleIds[0], 
          transaction 
        });
      }

      await transaction.commit();
      return user;
    } catch (error) {
      await transaction.rollback();
      console.error('创建用户失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID查找用户
   * @param id 用户ID
   * @returns 用户实例或null
   */
  async findById(id: number): Promise<User | null> {
    try {
      const user = await User.findByPk(id);
      return user;
    } catch (error) {
      console.error('查询用户失败:', error);
      throw error;
    }
  }

  /**
   * 查询所有符合条件的用户
   * @param options 查询选项
   * @returns 用户数组
   */
  async findAll(options?: FindOptions): Promise<User[]> {
    try {
      const users = await User.findAll(options);
      return users;
    } catch (error) {
      console.error('查询用户列表失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param data 更新数据
   * @returns 是否更新成功
   */
  async update(id: number, data: UserUpdateParams): Promise<boolean> {
    const transaction = await sequelize.transaction();
    
    try {
      // 查找用户
      const user = await User.findByPk(id, { transaction });
      if (!user) {
        throw new Error('用户不存在');
      }

      // 如果更新邮箱，需要检查唯一性
      if (data.email && data.email !== user.email) {
        const existingUser = await User.findOne({
          where: { email: data.email },
          transaction
        });

        if (existingUser) {
          throw new Error('邮箱已存在');
        }
      }

      // 更新用户信息
      const updateData: any = {};
      if (data.email) updateData.email = data.email;
      if (data.realName) updateData.realName = data.realName;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.status !== undefined) updateData.status = data.status;

      await user.update(updateData, { transaction });

      // 如果提供了角色ID，则更新角色
      if (data.roleIds) {
        // 先删除原有角色
        await UserRole.destroy({
          where: { userId: id },
          transaction
        });

        // 分配新角色
        if (data.roleIds.length > 0) {
          await this.assignRolesInternal(id, data.roleIds, {
            primaryRoleId: data.roleIds[0],
            transaction
          });
        }
      }

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      console.error('更新用户失败:', error);
      throw error;
    }
  }

  /**
   * 删除用户
   * @param id 用户ID
   * @returns 是否删除成功
   */
  async delete(id: number): Promise<boolean> {
    const transaction = await sequelize.transaction();
    
    try {
      // 删除用户角色关联
      await UserRole.destroy({
        where: { userId: id },
        transaction
      });

      // 删除用户
      const result = await User.destroy({
        where: { id },
        transaction
      });

      await transaction.commit();
      return result > 0;
    } catch (error) {
      await transaction.rollback();
      console.error('删除用户失败:', error);
      throw error;
    }
  }

  /**
   * 根据用户名查找用户
   * @param username 用户名
   * @returns 用户实例或null
   */
  async findByUsername(username: string): Promise<User | null> {
    try {
      const user = await User.findOne({
        where: { username }
      });
      return user;
    } catch (error) {
      console.error('根据用户名查询用户失败:', error);
      throw error;
    }
  }

  /**
   * 根据邮箱查找用户
   * @param email 邮箱
   * @returns 用户实例或null
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await User.findOne({
        where: { email }
      });
      return user;
    } catch (error) {
      console.error('根据邮箱查询用户失败:', error);
      throw error;
    }
  }

  /**
   * 分页查询用户
   * @param params 查询参数
   * @returns 分页结果
   */
  async findByPage(params: UserQueryParams): Promise<PaginationResult<User>> {
    try {
      const { 
        keyword, 
        status, 
        roleId, 
        startTime, 
        endTime, 
        page = 1, 
        pageSize = 10 
      } = params;

      // 构建查询条件
      const where: any = {};

      // 关键字搜索
      if (keyword) {
        where[Op.or] = [
          { username: { [Op.like]: `%${keyword}%` } },
          { email: { [Op.like]: `%${keyword}%` } },
          { realName: { [Op.like]: `%${keyword}%` } },
          { phone: { [Op.like]: `%${keyword}%` } }
        ];
      }

      // 状态筛选
      if (status !== undefined) {
        where.status = status;
      }

      // 时间范围筛选
      if (startTime && endTime) {
        where.createdAt = {
          [Op.between]: [startTime, endTime]
        };
      } else if (startTime) {
        where.createdAt = {
          [Op.gte]: startTime
        };
      } else if (endTime) {
        where.createdAt = {
          [Op.lte]: endTime
        };
      }

      // 基础查询条件
      const queryOptions: FindOptions = {
        where,
        order: [['createdAt', 'DESC']],
        limit: pageSize,
        offset: (page - 1) * pageSize
      };

      // 如果有角色ID筛选，需要使用include
      if (roleId) {
        queryOptions.include = [
          {
            model: Role,
            as: 'roles',
            through: {
              where: { roleId }
            }
          }
        ];
      }

      // 查询用户
      const { count, rows } = await User.findAndCountAll(queryOptions);

      // 计算总页数
      const totalPages = Math.ceil(count / pageSize);

      return {
        items: rows,
        total: count,
        page,
        pageSize,
        totalPages
      };
    } catch (error) {
      console.error('分页查询用户失败:', error);
      throw error;
    }
  }

  /**
   * 启用用户
   * @param id 用户ID
   * @returns 是否启用成功
   */
  async enable(id: number): Promise<boolean> {
    const result = await User.update(
      { status: UserStatus.ACTIVE },
      { where: { id } }
    );
    return result[0] > 0;
  }

  /**
   * 禁用用户
   * @param id 用户ID
   * @returns 是否禁用成功
   */
  async disable(id: number): Promise<boolean> {
    const result = await User.update(
      { status: UserStatus.INACTIVE },
      { where: { id } }
    );
    return result[0] > 0;
  }

  /**
   * 锁定用户
   * @param id 用户ID
   * @returns 是否锁定成功
   */
  async lock(id: number): Promise<boolean> {
    const result = await User.update(
      { status: UserStatus.LOCKED },
      { where: { id } }
    );
    return result[0] > 0;
  }

  /**
   * 解锁用户
   * @param id 用户ID
   * @returns 是否解锁成功
   */
  async unlock(id: number): Promise<boolean> {
    const result = await User.update(
      { status: UserStatus.ACTIVE },
      { where: { id } }
    );
    return result[0] > 0;
  }

  /**
   * 分配角色给用户
   * @param userId 用户ID
   * @param roleIds 角色ID数组
   * @param options 选项，如是否设置为主要角色、授权人ID等
   * @returns 是否分配成功
   */
  async assignRoles(userId: number, roleIds: number[], options?: { 
    primaryRoleId?: number;
    grantorId?: number;
    startTime?: Date;
    endTime?: Date;
  }): Promise<boolean> {
    const transaction = await sequelize.transaction();
    
    try {
      const result = await this.assignRolesInternal(userId, roleIds, {
        ...options,
        transaction
      });
      
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      console.error('分配角色失败:', error);
      throw error;
    }
  }

  /**
   * 内部方法：分配角色给用户
   * @param userId 用户ID
   * @param roleIds 角色ID数组
   * @param options 选项，如是否设置为主要角色、授权人ID等
   * @returns 是否分配成功
   */
  private async assignRolesInternal(userId: number, roleIds: number[], options?: { 
    primaryRoleId?: number;
    grantorId?: number;
    startTime?: Date;
    endTime?: Date;
    transaction?: Transaction;
  }): Promise<boolean> {
    // 验证用户是否存在
    const user = await User.findByPk(userId, { 
      transaction: options?.transaction 
    });
    
    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证角色是否存在
    const roles = await Role.findAll({
      where: {
        id: { [Op.in]: roleIds },
        status: 1
      },
      transaction: options?.transaction
    });

    if (roles.length !== roleIds.length) {
      throw new Error('部分角色不存在或已被禁用');
    }

    // 创建用户角色关联
    const userRoles = roleIds.map(roleId => ({
      userId,
      roleId,
      isPrimary: options?.primaryRoleId === roleId ? 1 : 0,
      grantorId: options?.grantorId || null,
      startTime: options?.startTime || new Date(),
      endTime: options?.endTime || null
    }));

    await UserRole.bulkCreate(userRoles, { 
      transaction: options?.transaction 
    });

    return true;
  }

  /**
   * 移除用户的角色
   * @param userId 用户ID
   * @param roleIds 角色ID数组
   * @returns 是否移除成功
   */
  async removeRoles(userId: number, roleIds: number[]): Promise<boolean> {
    try {
      const result = await UserRole.destroy({
        where: {
          userId,
          roleId: { [Op.in]: roleIds }
        }
      });

      return result > 0;
    } catch (error) {
      console.error('移除角色失败:', error);
      throw error;
    }
  }

  /**
   * 设置用户主要角色
   * @param userId 用户ID
   * @param roleId 角色ID
   * @returns 是否设置成功
   */
  async setPrimaryRole(userId: number, roleId: number): Promise<boolean> {
    const transaction = await sequelize.transaction();
    
    try {
      // 验证用户是否存在
      const user = await User.findByPk(userId, { transaction });
      if (!user) {
        throw new Error('用户不存在');
      }

      // 验证角色是否存在且已分配给用户
      const userRole = await UserRole.findOne({
        where: {
          userId,
          roleId
        },
        transaction
      });

      if (!userRole) {
        throw new Error('角色不存在或未分配给用户');
      }

      // 将所有用户角色设置为非主要角色
      await UserRole.update(
        { isPrimary: 0 },
        {
          where: { userId },
          transaction
        }
      );

      // 设置指定角色为主要角色
      await userRole.update({ isPrimary: 1 }, { transaction });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      console.error('设置主要角色失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户与角色关联信息
   * @param userId 用户ID
   * @returns 用户角色关联数组
   */
  async getUserRoleRelations(userId: number): Promise<any[]> {
    try {
      const userRoles = await UserRole.findAll({
        where: { userId },
        include: [
          {
            model: Role,
            as: 'role'
          }
        ]
      });

      return userRoles.map(ur => {
        const role = ur.get('role') as Role;
        
        return {
          id: ur.id,
          userId: ur.userId,
          roleId: ur.roleId,
          roleName: role ? role.name : '未知角色',
          roleCode: role ? role.code : 'unknown',
          isPrimary: ur.isPrimary === 1,
          startTime: ur.startTime,
          endTime: ur.endTime,
          grantorId: ur.grantorId,
          createdAt: ur.createdAt
        };
      });
    } catch (error) {
      console.error('获取用户角色关联信息失败:', error);
      throw error;
    }
  }
}

export default new UserService(); 