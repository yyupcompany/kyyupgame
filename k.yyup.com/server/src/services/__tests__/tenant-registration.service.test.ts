/**
 * 租户注册服务单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { tenantRegistrationService, TenantRegistrationRequest } from '../tenant-registration.service';
import { Kindergarten } from '../../models/kindergarten.model';
import { User } from '../../models/user.model';
import { Role } from '../../models/role.model';
import { UserRole as UserRoleModel } from '../../models/user-role.model';
import sequelize from '../../config/database';

// Mock模型和依赖
vi.mock('../../models/kindergarten.model');
vi.mock('../../models/user.model');
vi.mock('../../models/role.model');
vi.mock('../../models/user-role.model');
vi.mock('../../config/database');

describe('TenantRegistrationService', () => {
  let mockTransaction: any;

  beforeEach(() => {
    // 设置事务mock
    mockTransaction = {
      commit: vi.fn(),
      rollback: vi.fn()
    };

    vi.mocked(sequelize.transaction).mockResolvedValue(mockTransaction);
    
    // 清除所有mock
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('registerTenant', () => {
    const validRequest: TenantRegistrationRequest = {
      tenantPhoneNumber: '13800138000',
      tenantName: '测试幼儿园',
      tenantId: 'test_tenant_001'
    };

    it('应该成功注册租户并返回完整信息', async () => {
      // 准备mock数据
      const mockKindergarten = {
        id: 1,
        name: '测试幼儿园',
        code: 'K138000',
        tenantPhoneNumber: '13800138000',
        tenantId: 'test_tenant_001',
        update: vi.fn().mockResolvedValue(true)
      };

      const mockRole = {
        id: 10,
        code: 'chief_principal',
        name: '总园长'
      };

      const mockUser = {
        id: 100,
        username: 'principal_k138000',
        realName: '总园长',
        phone: '13800138000'
      };

      // 设置mock返回值
      vi.mocked(Kindergarten.findOne).mockResolvedValue(null); // 未注册
      vi.mocked(Kindergarten.create).mockResolvedValue(mockKindergarten as any);
      vi.mocked(Role.findOne).mockResolvedValue(mockRole as any);
      vi.mocked(User.create).mockResolvedValue(mockUser as any);
      vi.mocked(UserRoleModel.create).mockResolvedValue({} as any);

      // 执行注册
      const result = await tenantRegistrationService.registerTenant(validRequest);

      // 验证结果
      expect(result).toMatchObject({
        kindergartenId: 1,
        kindergartenCode: 'K138000',
        kindergartenName: '测试幼儿园',
        principalUserId: 100,
        principalUsername: 'principal_k138000',
        principalPhone: '13800138000',
        tenantPhoneNumber: '13800138000',
        tenantId: 'test_tenant_001'
      });

      expect(result.initialPassword).toBeDefined();
      expect(result.initialPassword).toHaveLength(8);

      // 验证事务已提交
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该拒绝无效的手机号格式', async () => {
      const invalidRequest = {
        ...validRequest,
        tenantPhoneNumber: '123' // 无效手机号
      };

      await expect(
        tenantRegistrationService.registerTenant(invalidRequest)
      ).rejects.toThrow('手机号格式不正确');
    });

    it('应该拒绝已注册的租户手机号', async () => {
      // Mock已存在的租户
      vi.mocked(Kindergarten.findOne).mockResolvedValue({
        id: 999,
        tenantPhoneNumber: '13800138000'
      } as any);

      await expect(
        tenantRegistrationService.registerTenant(validRequest)
      ).rejects.toThrow('该租户手机号已注册');
    });

    it('当角色不存在时应该抛出错误', async () => {
      vi.mocked(Kindergarten.findOne).mockResolvedValue(null);
      vi.mocked(Kindergarten.create).mockResolvedValue({ id: 1 } as any);
      vi.mocked(Role.findOne).mockResolvedValue(null); // 角色不存在

      await expect(
        tenantRegistrationService.registerTenant(validRequest)
      ).rejects.toThrow('chief_principal角色不存在');

      // 验证事务已回滚
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('发生错误时应该回滚事务', async () => {
      vi.mocked(Kindergarten.findOne).mockResolvedValue(null);
      vi.mocked(Kindergarten.create).mockRejectedValue(new Error('数据库错误'));

      await expect(
        tenantRegistrationService.registerTenant(validRequest)
      ).rejects.toThrow('数据库错误');

      // 验证事务已回滚
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('生成相关方法', () => {
    it('应该基于手机号生成正确的园区编码', () => {
      const service = tenantRegistrationService as any;
      const code = service.generateKindergartenCode('13800138000');
      expect(code).toBe('K138000');
    });

    it('应该基于园区编码生成正确的用户名', () => {
      const service = tenantRegistrationService as any;
      const username = service.generatePrincipalUsername('K138000');
      expect(username).toBe('principal_k138000');
    });

    it('应该生成8位随机密码', () => {
      const service = tenantRegistrationService as any;
      const password = service.generateInitialPassword();
      
      expect(password).toHaveLength(8);
      expect(password).toMatch(/[A-Z]/); // 包含大写字母
      expect(password).toMatch(/[a-z]/); // 包含小写字母
      expect(password).toMatch(/[0-9]/); // 包含数字
    });

    it('应该正确验证手机号格式', () => {
      const service = tenantRegistrationService as any;
      
      expect(service.validatePhoneNumber('13800138000')).toBe(true);
      expect(service.validatePhoneNumber('15912345678')).toBe(true);
      expect(service.validatePhoneNumber('12345678901')).toBe(false);
      expect(service.validatePhoneNumber('138001380')).toBe(false);
      expect(service.validatePhoneNumber('abcdefghijk')).toBe(false);
    });
  });
});
/**
 * 租户注册服务单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { tenantRegistrationService, TenantRegistrationRequest } from '../tenant-registration.service';
import { Kindergarten } from '../../models/kindergarten.model';
import { User } from '../../models/user.model';
import { Role } from '../../models/role.model';
import { UserRole as UserRoleModel } from '../../models/user-role.model';
import sequelize from '../../config/database';

// Mock模型和依赖
vi.mock('../../models/kindergarten.model');
vi.mock('../../models/user.model');
vi.mock('../../models/role.model');
vi.mock('../../models/user-role.model');
vi.mock('../../config/database');

describe('TenantRegistrationService', () => {
  let mockTransaction: any;

  beforeEach(() => {
    // 设置事务mock
    mockTransaction = {
      commit: vi.fn(),
      rollback: vi.fn()
    };

    vi.mocked(sequelize.transaction).mockResolvedValue(mockTransaction);
    
    // 清除所有mock
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('registerTenant', () => {
    const validRequest: TenantRegistrationRequest = {
      tenantPhoneNumber: '13800138000',
      tenantName: '测试幼儿园',
      tenantId: 'test_tenant_001'
    };

    it('应该成功注册租户并返回完整信息', async () => {
      // 准备mock数据
      const mockKindergarten = {
        id: 1,
        name: '测试幼儿园',
        code: 'K138000',
        tenantPhoneNumber: '13800138000',
        tenantId: 'test_tenant_001',
        update: vi.fn().mockResolvedValue(true)
      };

      const mockRole = {
        id: 10,
        code: 'chief_principal',
        name: '总园长'
      };

      const mockUser = {
        id: 100,
        username: 'principal_k138000',
        realName: '总园长',
        phone: '13800138000'
      };

      // 设置mock返回值
      vi.mocked(Kindergarten.findOne).mockResolvedValue(null); // 未注册
      vi.mocked(Kindergarten.create).mockResolvedValue(mockKindergarten as any);
      vi.mocked(Role.findOne).mockResolvedValue(mockRole as any);
      vi.mocked(User.create).mockResolvedValue(mockUser as any);
      vi.mocked(UserRoleModel.create).mockResolvedValue({} as any);

      // 执行注册
      const result = await tenantRegistrationService.registerTenant(validRequest);

      // 验证结果
      expect(result).toMatchObject({
        kindergartenId: 1,
        kindergartenCode: 'K138000',
        kindergartenName: '测试幼儿园',
        principalUserId: 100,
        principalUsername: 'principal_k138000',
        principalPhone: '13800138000',
        tenantPhoneNumber: '13800138000',
        tenantId: 'test_tenant_001'
      });

      expect(result.initialPassword).toBeDefined();
      expect(result.initialPassword).toHaveLength(8);

      // 验证事务已提交
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该拒绝无效的手机号格式', async () => {
      const invalidRequest = {
        ...validRequest,
        tenantPhoneNumber: '123' // 无效手机号
      };

      await expect(
        tenantRegistrationService.registerTenant(invalidRequest)
      ).rejects.toThrow('手机号格式不正确');
    });

    it('应该拒绝已注册的租户手机号', async () => {
      // Mock已存在的租户
      vi.mocked(Kindergarten.findOne).mockResolvedValue({
        id: 999,
        tenantPhoneNumber: '13800138000'
      } as any);

      await expect(
        tenantRegistrationService.registerTenant(validRequest)
      ).rejects.toThrow('该租户手机号已注册');
    });

    it('当角色不存在时应该抛出错误', async () => {
      vi.mocked(Kindergarten.findOne).mockResolvedValue(null);
      vi.mocked(Kindergarten.create).mockResolvedValue({ id: 1 } as any);
      vi.mocked(Role.findOne).mockResolvedValue(null); // 角色不存在

      await expect(
        tenantRegistrationService.registerTenant(validRequest)
      ).rejects.toThrow('chief_principal角色不存在');

      // 验证事务已回滚
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('发生错误时应该回滚事务', async () => {
      vi.mocked(Kindergarten.findOne).mockResolvedValue(null);
      vi.mocked(Kindergarten.create).mockRejectedValue(new Error('数据库错误'));

      await expect(
        tenantRegistrationService.registerTenant(validRequest)
      ).rejects.toThrow('数据库错误');

      // 验证事务已回滚
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('生成相关方法', () => {
    it('应该基于手机号生成正确的园区编码', () => {
      const service = tenantRegistrationService as any;
      const code = service.generateKindergartenCode('13800138000');
      expect(code).toBe('K138000');
    });

    it('应该基于园区编码生成正确的用户名', () => {
      const service = tenantRegistrationService as any;
      const username = service.generatePrincipalUsername('K138000');
      expect(username).toBe('principal_k138000');
    });

    it('应该生成8位随机密码', () => {
      const service = tenantRegistrationService as any;
      const password = service.generateInitialPassword();
      
      expect(password).toHaveLength(8);
      expect(password).toMatch(/[A-Z]/); // 包含大写字母
      expect(password).toMatch(/[a-z]/); // 包含小写字母
      expect(password).toMatch(/[0-9]/); // 包含数字
    });

    it('应该正确验证手机号格式', () => {
      const service = tenantRegistrationService as any;
      
      expect(service.validatePhoneNumber('13800138000')).toBe(true);
      expect(service.validatePhoneNumber('15912345678')).toBe(true);
      expect(service.validatePhoneNumber('12345678901')).toBe(false);
      expect(service.validatePhoneNumber('138001380')).toBe(false);
      expect(service.validatePhoneNumber('abcdefghijk')).toBe(false);
    });
  });
});
