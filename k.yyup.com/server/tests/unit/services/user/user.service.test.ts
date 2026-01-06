// Mock dependencies
jest.mock('bcrypt');
jest.mock('../../../../src/init');
jest.mock('../../../../src/models/user.model');
jest.mock('../../../../src/models/role.model');
jest.mock('../../../../src/models/user-role.model');

import bcrypt from 'bcrypt';
import { vi } from 'vitest'
import { Op, Transaction } from 'sequelize';
import { sequelize } from '../../../../src/init';
import { UserService } from '../../../../src/services/user/user.service';
import { User, UserStatus } from '../../../../src/models/user.model';
import { Role } from '../../../../src/models/role.model';
import { UserRole } from '../../../../src/models/user-role.model';
import { UserCreateParams, UserUpdateParams, UserQueryParams } from '../../../../src/services/user/interfaces/user-service.interface';

// Mock implementations
const mockSequelize = {
  transaction: jest.fn()
};

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

const mockUser = {
  findOne: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
  findAndCountAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};

const mockRole = {
  findByPk: jest.fn(),
  findAll: jest.fn()
};

const mockUserRole = {
  findAll: jest.fn(),
  create: jest.fn(),
  destroy: jest.fn(),
  bulkCreate: jest.fn()
};

const mockBcrypt = {
  hash: jest.fn(),
  compare: jest.fn()
};

// Setup mocks
(sequelize as any) = mockSequelize;
(User as any) = mockUser;
(Role as any) = mockRole;
(UserRole as any) = mockUserRole;
(bcrypt.hash as any) = mockBcrypt.hash;
(bcrypt.compare as any) = mockBcrypt.compare;


// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe('User Service', () => {
  let userService: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
    userService = new UserService();
  });

  describe('create', () => {
    it('应该成功创建用户', async () => {
      const userData: UserCreateParams = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        realName: '测试用户',
        phone: '13800138000',
        status: UserStatus.ACTIVE
      };

      const mockCreatedUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        name: '测试用户',
        phone: '13800138000',
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUser.findOne.mockResolvedValue(null); // 用户不存在
      mockBcrypt.hash.mockResolvedValue('hashedpassword123');
      mockUser.create.mockResolvedValue(mockCreatedUser);

      const result = await userService.create(userData);

      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { username: 'testuser' },
            { email: 'test@example.com' }
          ]
        },
        transaction: mockTransaction
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUser.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedpassword123',
          name: '测试用户'
        }),
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedUser);
    });

    it('应该处理用户名已存在', async () => {
      const userData: UserCreateParams = {
        username: 'existinguser',
        email: 'new@example.com',
        password: 'password123',
        realName: '测试用户'
      };

      const existingUser = {
        id: 1,
        username: 'existinguser',
        email: 'existing@example.com'
      };

      mockUser.findOne.mockResolvedValue(existingUser);

      await expect(userService.create(userData))
        .rejects.toThrow('用户名或邮箱已存在');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockUser.create).not.toHaveBeenCalled();
    });

    it('应该处理邮箱已存在', async () => {
      const userData: UserCreateParams = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'password123',
        realName: '测试用户'
      };

      const existingUser = {
        id: 1,
        username: 'existinguser',
        email: 'existing@example.com'
      };

      mockUser.findOne.mockResolvedValue(existingUser);

      await expect(userService.create(userData))
        .rejects.toThrow('用户名或邮箱已存在');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该处理密码哈希失败', async () => {
      const userData: UserCreateParams = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        realName: '测试用户'
      };

      mockUser.findOne.mockResolvedValue(null);
      mockBcrypt.hash.mockRejectedValue(new Error('Hash failed'));

      await expect(userService.create(userData))
        .rejects.toThrow('Hash failed');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockUser.create).not.toHaveBeenCalled();
    });

    it('应该处理数据库创建失败', async () => {
      const userData: UserCreateParams = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        realName: '测试用户'
      };

      mockUser.findOne.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('hashedpassword');
      mockUser.create.mockRejectedValue(new Error('Database error'));

      await expect(userService.create(userData))
        .rejects.toThrow('Database error');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('应该成功根据ID查找用户', async () => {
      const userId = 1;
      const mockUserData = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        name: '测试用户',
        status: UserStatus.ACTIVE,
        Roles: [
          { id: 1, name: 'admin', code: 'admin' }
        ]
      };

      mockUser.findByPk = jest.fn().mockResolvedValue(mockUserData);

      const result = await userService.findById(userId);

      expect(mockUser.findByPk).toHaveBeenCalledWith(userId, {
        include: [
          {
            model: Role,
            as: 'Roles',
            through: { attributes: [] }
          }
        ]
      });
      expect(result).toEqual(mockUserData);
    });

    it('应该处理用户不存在', async () => {
      const userId = 999;
      mockUser.findByPk.mockResolvedValue(null);

      const result = await userService.findById(userId);

      expect(result).toBeNull();
    });

    it('应该处理数据库查询错误', async () => {
      const userId = 1;
      const dbError = new Error('Database query failed');
      mockUser.findByPk.mockRejectedValue(dbError);

      await expect(userService.findById(userId))
        .rejects.toThrow('Database query failed');
    });
  });

  describe('findByUsername', () => {
    it('应该成功根据用户名查找用户', async () => {
      const username = 'testuser';
      const mockUserData = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        status: UserStatus.ACTIVE
      };

      mockUser.findOne = jest.fn().mockResolvedValue(mockUserData);

      const result = await userService.findByUsername(username);

      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: { username }
      });
      expect(result).toEqual(mockUserData);
    });

    it('应该处理用户名不存在', async () => {
      const username = 'nonexistent';
      mockUser.findOne.mockResolvedValue(null);

      const result = await userService.findByUsername(username);

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('应该成功根据邮箱查找用户', async () => {
      const email = 'test@example.com';
      const mockUserData = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        status: UserStatus.ACTIVE
      };

      mockUser.findOne = jest.fn().mockResolvedValue(mockUserData);

      const result = await userService.findByEmail(email);

      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: { email }
      });
      expect(result).toEqual(mockUserData);
    });

    it('应该处理邮箱不存在', async () => {
      const email = 'nonexistent@example.com';
      mockUser.findOne.mockResolvedValue(null);

      const result = await userService.findByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('应该成功获取用户列表', async () => {
      const findOptions = {
        where: {
          status: UserStatus.ACTIVE
        },
        limit: 10,
        offset: 0
      };

      const mockUsers = [
        {
          id: 1,
          username: 'testuser1',
          email: 'test1@example.com',
          name: '测试用户1',
          status: UserStatus.ACTIVE
        },
        {
          id: 2,
          username: 'testuser2',
          email: 'test2@example.com',
          name: '测试用户2',
          status: UserStatus.ACTIVE
        }
      ];

      mockUser.findAll = jest.fn().mockResolvedValue(mockUsers);

      const result = await userService.findAll(findOptions);

      expect(mockUser.findAll).toHaveBeenCalledWith(findOptions);
      expect(result).toEqual(mockUsers);
    });

    it('应该使用默认查询参数', async () => {
      const mockResult = {
        rows: [],
        count: 0
      };

      mockUser.findAndCountAll.mockResolvedValue(mockResult);

      const result = await userService.findAll({});

      expect(mockUser.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        include: [
          {
            model: Role,
            as: 'Roles',
            through: { attributes: [] }
          }
        ],
        limit: 20,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0
      });
    });

    it('应该处理数据库查询错误', async () => {
      const findOptions = { limit: 10, offset: 0 };
      const dbError = new Error('Database query failed');
      mockUser.findAll = jest.fn().mockRejectedValue(dbError);

      await expect(userService.findAll(findOptions))
        .rejects.toThrow('Database query failed');
    });
  });

  describe('update', () => {
    it('应该成功更新用户', async () => {
      const userId = 1;
      const updateData: UserUpdateParams = {
        realName: '更新的用户名',
        phone: '13900139000',
        status: UserStatus.ACTIVE
      };

      const mockExistingUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        name: '测试用户',
        phone: '13800138000'
      };

      const mockUpdatedUser = {
        ...mockExistingUser,
        ...updateData,
        updatedAt: new Date()
      };

      mockUser.findByPk.mockResolvedValue(mockExistingUser);
      mockUser.update.mockResolvedValue([1]); // 更新成功
      mockUser.findByPk.mockResolvedValueOnce(mockUpdatedUser); // 获取更新后的数据

      const result = await userService.update(userId, updateData);

      expect(mockUser.findByPk).toHaveBeenCalledWith(userId, { transaction: mockTransaction });
      expect(mockUser.update).toHaveBeenCalledWith(
        updateData,
        {
          where: { id: userId },
          transaction: mockTransaction
        }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedUser);
    });

    it('应该处理用户不存在', async () => {
      const userId = 999;
      const updateData: UserUpdateParams = { realName: '不存在的用户' };

      mockUser.findByPk.mockResolvedValue(null);

      await expect(userService.update(userId, updateData))
        .rejects.toThrow('用户不存在');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockUser.update).not.toHaveBeenCalled();
    });

    it('应该处理更新密码', async () => {
      const userId = 1;
      const updateData: UserUpdateParams = {
        password: 'newpassword123'
      };

      const mockExistingUser = {
        id: 1,
        username: 'testuser'
      };

      mockUser.findByPk.mockResolvedValue(mockExistingUser);
      mockBcrypt.hash.mockResolvedValue('hashednewpassword');
      mockUser.update.mockResolvedValue([1]);
      mockUser.findByPk.mockResolvedValueOnce({ ...mockExistingUser, password: 'hashednewpassword' });

      const result = await userService.update(userId, updateData);

      expect(mockBcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(mockUser.update).toHaveBeenCalledWith(
        { password: 'hashednewpassword' },
        {
          where: { id: userId },
          transaction: mockTransaction
        }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理密码哈希失败', async () => {
      const userId = 1;
      const updateData: UserUpdateParams = {
        password: 'newpassword123'
      };

      const mockExistingUser = {
        id: 1,
        username: 'testuser'
      };

      mockUser.findByPk.mockResolvedValue(mockExistingUser);
      mockBcrypt.hash.mockRejectedValue(new Error('Hash failed'));

      await expect(userService.update(userId, updateData))
        .rejects.toThrow('Hash failed');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockUser.update).not.toHaveBeenCalled();
    });

    it('应该处理数据库更新失败', async () => {
      const userId = 1;
      const updateData: UserUpdateParams = { realName: '更新失败' };

      const mockExistingUser = {
        id: 1,
        username: 'testuser'
      };

      mockUser.findByPk.mockResolvedValue(mockExistingUser);
      mockUser.update.mockRejectedValue(new Error('Database update failed'));

      await expect(userService.update(userId, updateData))
        .rejects.toThrow('Database update failed');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('应该成功删除用户', async () => {
      const userId = 1;

      const mockExistingUser = {
        id: 1,
        username: 'testuser',
        status: UserStatus.ACTIVE
      };

      mockUser.findByPk.mockResolvedValue(mockExistingUser);
      mockUser.destroy.mockResolvedValue(1); // 删除成功

      const result = await userService.delete(userId);

      expect(mockUser.findByPk).toHaveBeenCalledWith(userId, { transaction: mockTransaction });
      expect(mockUser.destroy).toHaveBeenCalledWith({
        where: { id: userId },
        transaction: mockTransaction
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('应该处理用户不存在', async () => {
      const userId = 999;

      mockUser.findByPk.mockResolvedValue(null);

      await expect(userService.delete(userId))
        .rejects.toThrow('用户不存在');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockUser.destroy).not.toHaveBeenCalled();
    });

    it('应该处理数据库删除失败', async () => {
      const userId = 1;

      const mockExistingUser = {
        id: 1,
        username: 'testuser'
      };

      mockUser.findByPk.mockResolvedValue(mockExistingUser);
      mockUser.destroy.mockRejectedValue(new Error('Database delete failed'));

      await expect(userService.delete(userId))
        .rejects.toThrow('Database delete failed');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('assignRoles', () => {
    it('应该成功分配角色', async () => {
      const userId = 1;
      const roleIds = [1, 2, 3];

      const mockExistingUser = {
        id: 1,
        username: 'testuser'
      };

      const mockRoles = [
        { id: 1, name: 'admin' },
        { id: 2, name: 'user' },
        { id: 3, name: 'editor' }
      ];

      mockUser.findByPk.mockResolvedValue(mockExistingUser);
      mockRole.findAll.mockResolvedValue(mockRoles);
      mockUserRole.destroy.mockResolvedValue(2); // 删除现有角色
      mockUserRole.bulkCreate.mockResolvedValue([
        { userId: 1, roleId: 1 },
        { userId: 1, roleId: 2 },
        { userId: 1, roleId: 3 }
      ]);

      const result = await userService.assignRoles(userId, roleIds);

      expect(mockUser.findByPk).toHaveBeenCalledWith(userId, { transaction: mockTransaction });
      expect(mockRole.findAll).toHaveBeenCalledWith({
        where: { id: roleIds },
        transaction: mockTransaction
      });
      expect(mockUserRole.destroy).toHaveBeenCalledWith({
        where: { userId },
        transaction: mockTransaction
      });
      expect(mockUserRole.bulkCreate).toHaveBeenCalledWith(
        [
          { userId: 1, roleId: 1 },
          { userId: 1, roleId: 2 },
          { userId: 1, roleId: 3 }
        ],
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('应该处理用户不存在', async () => {
      const userId = 999;
      const roleIds = [1, 2];

      mockUser.findByPk.mockResolvedValue(null);

      await expect(userService.assignRoles(userId, roleIds))
        .rejects.toThrow('用户不存在');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该处理角色不存在', async () => {
      const userId = 1;
      const roleIds = [1, 999]; // 999不存在

      const mockExistingUser = {
        id: 1,
        username: 'testuser'
      };

      const mockRoles = [
        { id: 1, name: 'admin' }
        // 缺少id为999的角色
      ];

      mockUser.findByPk.mockResolvedValue(mockExistingUser);
      mockRole.findAll.mockResolvedValue(mockRoles);

      await expect(userService.assignRoles(userId, roleIds))
        .rejects.toThrow('部分角色不存在');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该处理空角色列表', async () => {
      const userId = 1;
      const roleIds: number[] = [];

      const mockExistingUser = {
        id: 1,
        username: 'testuser'
      };

      mockUser.findByPk.mockResolvedValue(mockExistingUser);
      mockUserRole.destroy.mockResolvedValue(2); // 删除现有角色

      const result = await userService.assignRoles(userId, roleIds);

      expect(mockUserRole.destroy).toHaveBeenCalledWith({
        where: { userId },
        transaction: mockTransaction
      });
      expect(mockUserRole.bulkCreate).not.toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});
