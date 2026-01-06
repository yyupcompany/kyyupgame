/**
 * 集团管理模块API测试
 * 严格遵循测试验证规则
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { groupApi } from '@/api/modules/group';
import request from '@/utils/request';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes,
  validateEnumValue
} from '../../../utils/data-validation';

// Mock request
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

const mockedRequest = vi.mocked(request);

// 控制台错误检测变量
let consoleSpy: any

describe('Group API - Strict Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    expectNoConsoleErrors();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('getGroupList', () => {
    it('should get group list with strict validation', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              id: 1,
              name: 'Test Group',
              code: 'TG001',
              type: 1,
              brandName: 'Test Brand',
              kindergartenCount: 5,
              totalStudents: 500,
              totalTeachers: 50,
              status: 1,
              createdAt: '2025-01-10T00:00:00.000Z'
            }
          ],
          total: 1,
          page: 1,
          pageSize: 10
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);
      const result = await groupApi.getGroupList({ page: 1, pageSize: 10 });

      // 1. 验证API调用
      expect(mockedRequest.get).toHaveBeenCalledWith('/groups', {
        params: { page: 1, pageSize: 10 }
      });

      // 2. 验证响应结构
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data.items)).toBe(true);

      // 3. 验证分页字段
      const paginationValidation = validateRequiredFields(result.data, [
        'items',
        'total',
        'page',
        'pageSize'
      ]);
      expect(paginationValidation.valid).toBe(true);
      if (!paginationValidation.valid) {
        throw new Error(`Missing pagination fields: ${paginationValidation.missing.join(', ')}`);
      }

      // 4. 验证分页字段类型
      const paginationTypeValidation = validateFieldTypes(result.data, {
        total: 'number',
        page: 'number',
        pageSize: 'number'
      });
      expect(paginationTypeValidation.valid).toBe(true);

      // 5. 验证列表项
      if (result.data.items.length > 0) {
        const item = result.data.items[0];
        
        // 验证必填字段
        const itemValidation = validateRequiredFields(item, [
          'id',
          'name',
          'code',
          'type',
          'kindergartenCount',
          'totalStudents',
          'totalTeachers',
          'status'
        ]);
        expect(itemValidation.valid).toBe(true);
        if (!itemValidation.valid) {
          throw new Error(`Missing item fields: ${itemValidation.missing.join(', ')}`);
        }

        // 验证字段类型
        const itemTypeValidation = validateFieldTypes(item, {
          id: 'number',
          name: 'string',
          code: 'string',
          type: 'number',
          kindergartenCount: 'number',
          totalStudents: 'number',
          totalTeachers: 'number',
          status: 'number'
        });
        expect(itemTypeValidation.valid).toBe(true);
        if (!itemTypeValidation.valid) {
          throw new Error(`Type validation errors: ${itemTypeValidation.errors.join(', ')}`);
        }

        // 验证数值范围
        expect(item.kindergartenCount).toBeGreaterThanOrEqual(0);
        expect(item.totalStudents).toBeGreaterThanOrEqual(0);
        expect(item.totalTeachers).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle empty list', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);
      const result = await groupApi.getGroupList();

      expect(result.success).toBe(true);
      expect(result.data.items).toEqual([]);
      expect(result.data.total).toBe(0);
    });

    it('should handle search parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);
      await groupApi.getGroupList({
        keyword: 'test',
        type: 1,
        status: 1,
        page: 1,
        pageSize: 20
      });

      expect(mockedRequest.get).toHaveBeenCalledWith('/groups', {
        params: {
          keyword: 'test',
          type: 1,
          status: 1,
          page: 1,
          pageSize: 20
        }
      });
    });
  });

  describe('getMyGroups', () => {
    it('should get my groups with strict validation', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 1,
            name: 'My Group',
            code: 'MG001',
            type: 1,
            role: 2,
            permissions: {
              canViewAllKindergartens: true,
              canManageKindergartens: true,
              canViewFinance: false,
              canManageFinance: false
            }
          }
        ]
      };

      mockedRequest.get.mockResolvedValue(mockResponse);
      const result = await groupApi.getMyGroups();

      // 验证API调用
      expect(mockedRequest.get).toHaveBeenCalledWith('/groups/my');

      // 验证响应结构
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);

      // 验证列表项
      if (result.data.length > 0) {
        const group = result.data[0];
        
        const validation = validateRequiredFields(group, [
          'id',
          'name',
          'code',
          'type',
          'role',
          'permissions'
        ]);
        expect(validation.valid).toBe(true);

        const typeValidation = validateFieldTypes(group, {
          id: 'number',
          name: 'string',
          code: 'string',
          type: 'number',
          role: 'number',
          permissions: 'object'
        });
        expect(typeValidation.valid).toBe(true);

        // 验证权限对象
        const permValidation = validateRequiredFields(group.permissions, [
          'canViewAllKindergartens',
          'canManageKindergartens',
          'canViewFinance',
          'canManageFinance'
        ]);
        expect(permValidation.valid).toBe(true);

        const permTypeValidation = validateFieldTypes(group.permissions, {
          canViewAllKindergartens: 'boolean',
          canManageKindergartens: 'boolean',
          canViewFinance: 'boolean',
          canManageFinance: 'boolean'
        });
        expect(permTypeValidation.valid).toBe(true);
      }
    });
  });

  describe('getGroupDetail', () => {
    it('should get group detail with strict validation', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          name: 'Test Group',
          code: 'TG001',
          type: 1,
          brandName: 'Test Brand',
          slogan: 'Test Slogan',
          description: 'Test Description',
          legalPerson: 'John Doe',
          businessLicense: 'BL123456',
          registeredCapital: 1000000,
          establishedDate: '2020-01-01',
          contactPhone: '1234567890',
          contactEmail: 'test@example.com',
          website: 'https://example.com',
          address: 'Test Address',
          chairman: 'Jane Doe',
          ceo: 'Bob Smith',
          vision: 'Test Vision',
          culture: 'Test Culture',
          kindergartenCount: 5,
          totalStudents: 500,
          totalTeachers: 50,
          totalRevenue: 5000000,
          status: 1,
          createdAt: '2025-01-10T00:00:00.000Z',
          updatedAt: '2025-01-10T00:00:00.000Z'
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);
      const result = await groupApi.getGroupDetail(1);

      // 验证API调用
      expect(mockedRequest.get).toHaveBeenCalledWith('/groups/1');

      // 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 验证必填字段
      const requiredFields = [
        'id',
        'name',
        'code',
        'type',
        'kindergartenCount',
        'totalStudents',
        'totalTeachers',
        'status'
      ];
      const validation = validateRequiredFields(result.data, requiredFields);
      expect(validation.valid).toBe(true);

      // 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        id: 'number',
        name: 'string',
        code: 'string',
        type: 'number',
        kindergartenCount: 'number',
        totalStudents: 'number',
        totalTeachers: 'number',
        status: 'number'
      });
      expect(typeValidation.valid).toBe(true);
    });
  });

  describe('createGroup', () => {
    it('should create group with strict validation', async () => {
      const createData = {
        name: 'New Group',
        code: 'NG001',
        type: 1,
        brandName: 'New Brand',
        slogan: 'New Slogan',
        description: 'New Description'
      };

      const mockResponse = {
        success: true,
        data: {
          id: 2,
          ...createData,
          kindergartenCount: 0,
          totalStudents: 0,
          totalTeachers: 0,
          status: 1,
          createdAt: '2025-01-10T00:00:00.000Z'
        }
      };

      mockedRequest.post.mockResolvedValue(mockResponse);
      const result = await groupApi.createGroup(createData);

      // 验证API调用
      expect(mockedRequest.post).toHaveBeenCalledWith('/groups', createData);

      // 验证响应
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBeDefined();
      expect(result.data.name).toBe(createData.name);
      expect(result.data.code).toBe(createData.code);

      // 验证必填字段
      const validation = validateRequiredFields(result.data, [
        'id',
        'name',
        'code',
        'type',
        'status'
      ]);
      expect(validation.valid).toBe(true);

      // 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        id: 'number',
        name: 'string',
        code: 'string',
        type: 'number',
        status: 'number'
      });
      expect(typeValidation.valid).toBe(true);
    });
  });

  describe('updateGroup', () => {
    it('should update group with strict validation', async () => {
      const updateData = {
        name: 'Updated Group',
        brandName: 'Updated Brand'
      };

      const mockResponse = {
        success: true,
        data: {
          id: 1,
          name: 'Updated Group',
          code: 'TG001',
          type: 1,
          brandName: 'Updated Brand',
          status: 1,
          updatedAt: '2025-01-10T00:00:00.000Z'
        }
      };

      mockedRequest.put.mockResolvedValue(mockResponse);
      const result = await groupApi.updateGroup(1, updateData);

      // 验证API调用
      expect(mockedRequest.put).toHaveBeenCalledWith('/groups/1', updateData);

      // 验证响应
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.name).toBe(updateData.name);
      expect(result.data.brandName).toBe(updateData.brandName);
    });
  });

  describe('deleteGroup', () => {
    it('should delete group', async () => {
      const mockResponse = {
        success: true,
        message: 'Group deleted successfully'
      };

      mockedRequest.delete.mockResolvedValue(mockResponse);
      const result = await groupApi.deleteGroup(1);

      // 验证API调用
      expect(mockedRequest.delete).toHaveBeenCalledWith('/groups/1');

      // 验证响应
      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });
  });

  describe('getGroupUsers', () => {
    it('should get group users with strict validation', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 1,
            userId: 10,
            userName: 'Test User',
            role: 2,
            canViewAllKindergartens: true,
            canManageKindergartens: true,
            canViewFinance: false,
            canManageFinance: false,
            status: 1,
            createdAt: '2025-01-10T00:00:00.000Z'
          }
        ]
      };

      mockedRequest.get.mockResolvedValue(mockResponse);
      const result = await groupApi.getGroupUsers(1);

      // 验证API调用
      expect(mockedRequest.get).toHaveBeenCalledWith('/groups/1/users');

      // 验证响应
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);

      // 验证列表项
      if (result.data.length > 0) {
        const user = result.data[0];

        const validation = validateRequiredFields(user, [
          'id',
          'userId',
          'userName',
          'role',
          'canViewAllKindergartens',
          'canManageKindergartens',
          'canViewFinance',
          'canManageFinance',
          'status'
        ]);
        expect(validation.valid).toBe(true);

        const typeValidation = validateFieldTypes(user, {
          id: 'number',
          userId: 'number',
          userName: 'string',
          role: 'number',
          canViewAllKindergartens: 'boolean',
          canManageKindergartens: 'boolean',
          canViewFinance: 'boolean',
          canManageFinance: 'boolean',
          status: 'number'
        });
        expect(typeValidation.valid).toBe(true);
      }
    });
  });

  describe('addGroupUser', () => {
    it('should add group user with strict validation', async () => {
      const userData = {
        userId: 10,
        role: 2,
        canViewAllKindergartens: true,
        canManageKindergartens: false,
        canViewFinance: false,
        canManageFinance: false
      };

      const mockResponse = {
        success: true,
        data: {
          id: 1,
          groupId: 1,
          ...userData,
          status: 1,
          createdAt: '2025-01-10T00:00:00.000Z'
        }
      };

      mockedRequest.post.mockResolvedValue(mockResponse);
      const result = await groupApi.addGroupUser(1, userData);

      // 验证API调用
      expect(mockedRequest.post).toHaveBeenCalledWith('/groups/1/users', userData);

      // 验证响应
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.userId).toBe(userData.userId);
      expect(result.data.role).toBe(userData.role);
    });
  });

  describe('updateGroupUser', () => {
    it('should update group user permissions', async () => {
      const updateData = {
        role: 3,
        canViewFinance: true,
        canManageFinance: true
      };

      const mockResponse = {
        success: true,
        data: {
          id: 1,
          userId: 10,
          groupId: 1,
          role: 3,
          canViewAllKindergartens: true,
          canManageKindergartens: false,
          canViewFinance: true,
          canManageFinance: true,
          status: 1,
          updatedAt: '2025-01-10T00:00:00.000Z'
        }
      };

      mockedRequest.put.mockResolvedValue(mockResponse);
      const result = await groupApi.updateGroupUser(1, 10, updateData);

      // 验证API调用
      expect(mockedRequest.put).toHaveBeenCalledWith('/groups/1/users/10', updateData);

      // 验证响应
      expect(result.success).toBe(true);
      expect(result.data.role).toBe(updateData.role);
      expect(result.data.canViewFinance).toBe(updateData.canViewFinance);
      expect(result.data.canManageFinance).toBe(updateData.canManageFinance);
    });
  });

  describe('removeGroupUser', () => {
    it('should remove group user', async () => {
      const mockResponse = {
        success: true,
        message: 'User removed from group successfully'
      };

      mockedRequest.delete.mockResolvedValue(mockResponse);
      const result = await groupApi.removeGroupUser(1, 10);

      // 验证API调用
      expect(mockedRequest.delete).toHaveBeenCalledWith('/groups/1/users/10');

      // 验证响应
      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });
  });

  describe('getGroupStatistics', () => {
    it('should get group statistics with strict validation', async () => {
      const mockResponse = {
        success: true,
        data: {
          kindergartenCount: 5,
          totalStudents: 500,
          totalTeachers: 50,
          enrollmentRate: 85.5,
          averageClassSize: 25,
          teacherStudentRatio: 0.1,
          totalRevenue: 5000000,
          totalExpense: 3000000,
          profit: 2000000
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);
      const result = await groupApi.getGroupStatistics(1);

      // 验证API调用
      expect(mockedRequest.get).toHaveBeenCalledWith('/groups/1/statistics');

      // 验证响应
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 验证必填字段
      const validation = validateRequiredFields(result.data, [
        'kindergartenCount',
        'totalStudents',
        'totalTeachers',
        'enrollmentRate'
      ]);
      expect(validation.valid).toBe(true);

      // 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        kindergartenCount: 'number',
        totalStudents: 'number',
        totalTeachers: 'number',
        enrollmentRate: 'number'
      });
      expect(typeValidation.valid).toBe(true);

      // 验证数值范围
      expect(result.data.kindergartenCount).toBeGreaterThanOrEqual(0);
      expect(result.data.totalStudents).toBeGreaterThanOrEqual(0);
      expect(result.data.totalTeachers).toBeGreaterThanOrEqual(0);
      expect(result.data.enrollmentRate).toBeGreaterThanOrEqual(0);
      expect(result.data.enrollmentRate).toBeLessThanOrEqual(100);
    });
  });

  describe('getGroupActivities', () => {
    it('should get group activities with strict validation', async () => {
      const mockResponse = {
        success: true,
        data: {
          totalActivities: 45,
          byType: {
            OUTDOOR: 15,
            INDOOR: 20,
            PARENT_CHILD: 10
          },
          byStatus: {
            PLANNED: 10,
            ONGOING: 5,
            COMPLETED: 30
          },
          recentActivities: [
            {
              id: 1,
              name: 'Test Activity',
              type: 'OUTDOOR',
              status: 'COMPLETED',
              kindergartenId: 1,
              kindergartenName: 'Test Kindergarten',
              registeredCount: 50,
              checkedInCount: 45,
              date: '2025-01-10'
            }
          ]
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);
      const result = await groupApi.getGroupActivities(1);

      // 验证API调用
      expect(mockedRequest.get).toHaveBeenCalledWith('/groups/1/activities', { params: undefined });

      // 验证响应
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 验证必填字段
      const validation = validateRequiredFields(result.data, [
        'totalActivities',
        'byType',
        'byStatus'
      ]);
      expect(validation.valid).toBe(true);

      // 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        totalActivities: 'number',
        byType: 'object',
        byStatus: 'object'
      });
      expect(typeValidation.valid).toBe(true);

      // 验证活动列表
      if (result.data.recentActivities && result.data.recentActivities.length > 0) {
        const activity = result.data.recentActivities[0];

        const activityValidation = validateRequiredFields(activity, [
          'id',
          'name',
          'type',
          'status',
          'kindergartenId'
        ]);
        expect(activityValidation.valid).toBe(true);

        const activityTypeValidation = validateFieldTypes(activity, {
          id: 'number',
          name: 'string',
          type: 'string',
          status: 'string',
          kindergartenId: 'number'
        });
        expect(activityTypeValidation.valid).toBe(true);
      }
    });
  });

  describe('getGroupEnrollment', () => {
    it('should get group enrollment data with strict validation', async () => {
      const mockResponse = {
        success: true,
        data: {
          totalApplications: 300,
          byStatus: {
            PENDING: 50,
            APPROVED: 200,
            REJECTED: 30,
            CANCELLED: 20
          },
          enrollmentRate: 66.7,
          trends: [
            {
              date: '2025-01',
              applications: 100,
              approved: 80,
              rate: 80
            }
          ]
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);
      const result = await groupApi.getGroupEnrollment(1);

      // 验证API调用
      expect(mockedRequest.get).toHaveBeenCalledWith('/groups/1/enrollment', { params: undefined });

      // 验证响应
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 验证必填字段
      const validation = validateRequiredFields(result.data, [
        'totalApplications',
        'byStatus',
        'enrollmentRate'
      ]);
      expect(validation.valid).toBe(true);

      // 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        totalApplications: 'number',
        byStatus: 'object',
        enrollmentRate: 'number'
      });
      expect(typeValidation.valid).toBe(true);

      // 验证数值范围
      expect(result.data.totalApplications).toBeGreaterThanOrEqual(0);
      expect(result.data.enrollmentRate).toBeGreaterThanOrEqual(0);
      expect(result.data.enrollmentRate).toBeLessThanOrEqual(100);

      // 验证趋势数据
      if (result.data.trends && result.data.trends.length > 0) {
        const trend = result.data.trends[0];

        const trendValidation = validateRequiredFields(trend, [
          'date',
          'applications',
          'approved',
          'rate'
        ]);
        expect(trendValidation.valid).toBe(true);

        const trendTypeValidation = validateFieldTypes(trend, {
          date: 'string',
          applications: 'number',
          approved: 'number',
          rate: 'number'
        });
        expect(trendTypeValidation.valid).toBe(true);
      }
    });
  });

  describe('checkUpgradeEligibility', () => {
    it('should check upgrade eligibility with strict validation', async () => {
      const mockResponse = {
        success: true,
        data: {
          eligible: true,
          kindergartenCount: 3,
          requiredCount: 2,
          message: 'You have 3 kindergartens, eligible for upgrade'
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);
      const result = await groupApi.checkUpgradeEligibility();

      // 验证API调用
      expect(mockedRequest.get).toHaveBeenCalledWith('/groups/check-upgrade');

      // 验证响应
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 验证必填字段
      const validation = validateRequiredFields(result.data, [
        'eligible',
        'kindergartenCount',
        'requiredCount'
      ]);
      expect(validation.valid).toBe(true);

      // 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        eligible: 'boolean',
        kindergartenCount: 'number',
        requiredCount: 'number'
      });
      expect(typeValidation.valid).toBe(true);
    });

    it('should handle ineligible case', async () => {
      const mockResponse = {
        success: true,
        data: {
          eligible: false,
          kindergartenCount: 1,
          requiredCount: 2,
          message: 'You need at least 2 kindergartens to upgrade'
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);
      const result = await groupApi.checkUpgradeEligibility();

      expect(result.success).toBe(true);
      expect(result.data.eligible).toBe(false);
      expect(result.data.kindergartenCount).toBeLessThan(result.data.requiredCount);
    });
  });

  describe('upgradeToGroup', () => {
    it('should upgrade to group with strict validation', async () => {
      const upgradeData = {
        name: 'Upgraded Group',
        code: 'UG001',
        type: 1,
        kindergartenIds: [1, 2, 3],
        headquartersId: 1
      };

      const mockResponse = {
        success: true,
        data: {
          id: 1,
          name: 'Upgraded Group',
          code: 'UG001',
          type: 1,
          kindergartenCount: 3,
          totalStudents: 300,
          totalTeachers: 30,
          status: 1,
          createdAt: '2025-01-10T00:00:00.000Z'
        }
      };

      mockedRequest.post.mockResolvedValue(mockResponse);
      const result = await groupApi.upgradeToGroup(upgradeData);

      // 验证API调用
      expect(mockedRequest.post).toHaveBeenCalledWith('/groups/upgrade', upgradeData);

      // 验证响应
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBeDefined();
      expect(result.data.kindergartenCount).toBe(upgradeData.kindergartenIds.length);

      // 验证必填字段
      const validation = validateRequiredFields(result.data, [
        'id',
        'name',
        'code',
        'type',
        'kindergartenCount',
        'status'
      ]);
      expect(validation.valid).toBe(true);

      // 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        id: 'number',
        name: 'string',
        code: 'string',
        type: 'number',
        kindergartenCount: 'number',
        status: 'number'
      });
      expect(typeValidation.valid).toBe(true);
    });
  });

  describe('addKindergartenToGroup', () => {
    it('should add kindergarten to group', async () => {
      const mockResponse = {
        success: true,
        message: 'Kindergarten added to group successfully'
      };

      mockedRequest.post.mockResolvedValue(mockResponse);
      const result = await groupApi.addKindergartenToGroup(1, { kindergartenId: 5 });

      // 验证API调用
      expect(mockedRequest.post).toHaveBeenCalledWith('/groups/1/add-kindergarten', {
        kindergartenId: 5
      });

      // 验证响应
      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });
  });

  describe('removeKindergartenFromGroup', () => {
    it('should remove kindergarten from group', async () => {
      const mockResponse = {
        success: true,
        message: 'Kindergarten removed from group successfully'
      };

      mockedRequest.post.mockResolvedValue(mockResponse);
      const result = await groupApi.removeKindergartenFromGroup(1, { kindergartenId: 5 });

      // 验证API调用
      expect(mockedRequest.post).toHaveBeenCalledWith('/groups/1/remove-kindergarten', {
        kindergartenId: 5
      });

      // 验证响应
      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Network error');
      mockedRequest.get.mockRejectedValue(mockError);

      await expect(groupApi.getGroupList()).rejects.toThrow('Network error');
    });

    it('should handle invalid response format', async () => {
      const mockResponse = {
        success: false,
        error: 'Invalid request'
      };

      mockedRequest.get.mockResolvedValue(mockResponse);
      const result = await groupApi.getGroupList();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

