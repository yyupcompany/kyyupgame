/**
 * AI用户管理中间层测试
 * 测试用户权限管理、用户设置管理和用户关系管理功能
 */

import { aiUserMiddleware } from '../../../src/middlewares/ai/user.middleware';
import { vi } from 'vitest'
import { aiUserPermissionService, aiUserRelationService } from '../../../src/services/ai';
import { PermissionKey } from '../../../src/models/ai-user-permission.model';
import { MiddlewareError, ERROR_CODES } from '../../../src/middlewares/ai/base.middleware';

// Mock the services
jest.mock('../../../src/services/ai', () => ({
  aiUserPermissionService: {
    checkPermission: jest.fn(),
    getUserPermissions: jest.fn(),
    setPermission: jest.fn(),
    setPermissions: jest.fn(),
    removePermission: jest.fn(),
    initializeUserPermissions: jest.fn(),
  },
  aiUserRelationService: {
    getUserRelation: jest.fn(),
    updateUserSettings: jest.fn(),
    getOrCreateUserRelation: jest.fn(),
    updateLastActivity: jest.fn(),
    getRecentActiveUsers: jest.fn(),
  },
}));

// Mock the base middleware methods
jest.mock('../../../src/middlewares/ai/base.middleware', () => {
  const originalModule = jest.requireActual('../../../src/middlewares/ai/base.middleware');
  return {
    ...originalModule,
    BaseMiddleware: class {
      createSuccessResponse = jest.fn((data) => ({ success: true, data }));
      handleError = jest.fn((error) => ({ success: false, error }));
      validatePermissions = jest.fn();
      logOperation = jest.fn();
    },
  };
});


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

describe('AiUserMiddleware', () => {
  let middleware: any;
  let mockCreateSuccessResponse: jest.Mock;
  let mockHandleError: jest.Mock;
  let mockValidatePermissions: jest.Mock;
  let mockLogOperation: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get the middleware instance and its methods
    middleware = aiUserMiddleware as any;
    mockCreateSuccessResponse = middleware.createSuccessResponse;
    mockHandleError = middleware.handleError;
    mockValidatePermissions = middleware.validatePermissions;
    mockLogOperation = middleware.logOperation;

    // Set up default successful responses
    mockCreateSuccessResponse.mockReturnValue({ success: true, data: true });
    mockHandleError.mockReturnValue({ success: false, error: 'Test error' });
    mockValidatePermissions.mockResolvedValue(undefined);
  });

  describe('checkPermission', () => {
    it('should check user permission successfully for regular permission', async () => {
      // Arrange
      const userId = 1;
      const permissionKey = 'ai:chat:create';
      const requiredLevel = 1;
      (aiUserPermissionService.checkPermission as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result = await middleware.checkPermission(userId, permissionKey, requiredLevel);

      // Assert
      expect(aiUserPermissionService.checkPermission).toHaveBeenCalledWith(
        userId,
        permissionKey,
        requiredLevel
      );
      expect(mockCreateSuccessResponse).toHaveBeenCalledWith(true);
      expect(result).toEqual({ success: true, data: true });
    });

    it('should check admin permission for permission management operations', async () => {
      // Arrange
      const userId = 1;
      const permissionKey = 'ai:permission:write';
      (aiUserPermissionService.checkPermission as jest.Mock)
        .mockResolvedValueOnce(true) // Admin check
        .mockResolvedValueOnce(true); // Permission check

      // Act
      const result = await middleware.checkPermission(userId, permissionKey);

      // Assert
      expect(aiUserPermissionService.checkPermission).toHaveBeenCalledWith(
        userId,
        PermissionKey.AI_ADMIN,
        1
      );
      expect(aiUserPermissionService.checkPermission).toHaveBeenCalledWith(
        userId,
        permissionKey,
        undefined
      );
      expect(result).toEqual({ success: true, data: true });
    });

    it('should throw error when user lacks admin permission for permission management', async () => {
      // Arrange
      const userId = 1;
      const permissionKey = 'ai:permission:write';
      (aiUserPermissionService.checkPermission as jest.Mock)
        .mockResolvedValueOnce(false) // Admin check fails
        .mockResolvedValueOnce(true); // Permission check would pass

      // Act
      const result = await middleware.checkPermission(userId, permissionKey);

      // Assert
      expect(aiUserPermissionService.checkPermission).toHaveBeenCalledWith(
        userId,
        PermissionKey.AI_ADMIN,
        1
      );
      expect(mockHandleError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.FORBIDDEN,
          message: '需要管理员权限执行此操作'
        })
      );
      expect(result).toEqual({ success: false, error: 'Test error' });
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const userId = 1;
      const permissionKey = 'ai:chat:create';
      const serviceError = new Error('Service error');
      (aiUserPermissionService.checkPermission as jest.Mock).mockRejectedValue(serviceError);

      // Act
      const result = await middleware.checkPermission(userId, permissionKey);

      // Assert
      expect(mockHandleError).toHaveBeenCalledWith(serviceError);
      expect(result).toEqual({ success: false, error: 'Test error' });
    });
  });

  describe('getUserPermissions', () => {
    it('should get user permissions successfully', async () => {
      // Arrange
      const userId = 1;
      const mockPermissions = { 'ai:chat:create': 1, 'ai:chat:read': 1 };
      (aiUserPermissionService.getUserPermissions as jest.Mock).mockResolvedValue(mockPermissions);

      // Act
      const result = await middleware.getUserPermissions(userId);

      // Assert
      expect(mockValidatePermissions).toHaveBeenCalledWith(userId, ['ai:permission:read']);
      expect(aiUserPermissionService.getUserPermissions).toHaveBeenCalledWith(userId);
      expect(mockCreateSuccessResponse).toHaveBeenCalledWith(mockPermissions);
      expect(result).toEqual({ success: true, data: mockPermissions });
    });

    it('should throw error when user lacks permission to view permissions', async () => {
      // Arrange
      const userId = 1;
      mockValidatePermissions.mockResolvedValue(undefined);

      // Act
      const result = await middleware.getUserPermissions(userId);

      // Assert
      expect(mockValidatePermissions).toHaveBeenCalledWith(userId, ['ai:permission:read']);
      expect(mockHandleError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.FORBIDDEN,
          message: '没有查看权限列表的权限'
        })
      );
      expect(result).toEqual({ success: false, error: 'Test error' });
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const userId = 1;
      const serviceError = new Error('Service error');
      mockValidatePermissions.mockResolvedValue(undefined);
      (aiUserPermissionService.getUserPermissions as jest.Mock).mockRejectedValue(serviceError);

      // Act
      const result = await middleware.getUserPermissions(userId);

      // Assert
      expect(mockHandleError).toHaveBeenCalledWith(serviceError);
      expect(result).toEqual({ success: false, error: 'Test error' });
    });
  });

  describe('setPermission', () => {
    it('should set user permission successfully', async () => {
      // Arrange
      const userId = 1;
      const permissionKey = 'ai:chat:create';
      const value = 1;

      // Act
      const result = await middleware.setPermission(userId, permissionKey, value);

      // Assert
      expect(mockValidatePermissions).toHaveBeenCalledWith(userId, ['ai:permission:write']);
      expect(aiUserPermissionService.setPermission).toHaveBeenCalledWith(
        userId,
        permissionKey,
        value
      );
      expect(mockLogOperation).toHaveBeenCalledWith(userId, 'SET_PERMISSION', {
        targetUserId: userId,
        permissionKey,
        value
      });
      expect(mockCreateSuccessResponse).toHaveBeenCalledWith(true);
      expect(result).toEqual({ success: true, data: true });
    });

    it('should throw error when user lacks permission to set permissions', async () => {
      // Arrange
      const userId = 1;
      const permissionKey = 'ai:chat:create';
      const value = 1;
      mockValidatePermissions.mockResolvedValue(undefined);

      // Act
      const result = await middleware.setPermission(userId, permissionKey, value);

      // Assert
      expect(mockValidatePermissions).toHaveBeenCalledWith(userId, ['ai:permission:write']);
      expect(mockHandleError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.FORBIDDEN,
          message: '没有设置权限的权限'
        })
      );
      expect(result).toEqual({ success: false, error: 'Test error' });
    });

    it('should prevent setting admin permission without existing admin rights', async () => {
      // Arrange
      const userId = 1;
      const permissionKey = 'ai:admin';
      const value = 1;
      mockValidatePermissions.mockResolvedValue(undefined);
      (aiUserPermissionService.checkPermission as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result = await middleware.setPermission(userId, permissionKey, value);

      // Assert
      expect(aiUserPermissionService.checkPermission).toHaveBeenCalledWith(
        userId,
        PermissionKey.AI_ADMIN,
        1
      );
      expect(mockHandleError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.FORBIDDEN,
          message: '不能设置管理员权限'
        })
      );
      expect(result).toEqual({ success: false, error: 'Test error' });
    });

    it('should allow setting admin permission for existing admin', async () => {
      // Arrange
      const userId = 1;
      const permissionKey = 'ai:admin';
      const value = 1;
      mockValidatePermissions.mockResolvedValue(undefined);
      (aiUserPermissionService.checkPermission as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result = await middleware.setPermission(userId, permissionKey, value);

      // Assert
      expect(aiUserPermissionService.checkPermission).toHaveBeenCalledWith(
        userId,
        PermissionKey.AI_ADMIN,
        1
      );
      expect(aiUserPermissionService.setPermission).toHaveBeenCalledWith(
        userId,
        permissionKey,
        value
      );
      expect(result).toEqual({ success: true, data: true });
    });
  });

  describe('setPermissions', () => {
    it('should set multiple user permissions successfully', async () => {
      // Arrange
      const userId = 1;
      const permissions = { 'ai:chat:create': 1, 'ai:chat:read': 1 };

      // Act
      const result = await middleware.setPermissions(userId, permissions);

      // Assert
      expect(mockValidatePermissions).toHaveBeenCalledWith(userId, ['ai:permission:write']);
      expect(aiUserPermissionService.setPermissions).toHaveBeenCalledWith(userId, permissions);
      expect(mockLogOperation).toHaveBeenCalledWith(userId, 'SET_BULK_PERMISSIONS', {
        targetUserId: userId,
        permissionCount: 2
      });
      expect(mockCreateSuccessResponse).toHaveBeenCalledWith(true);
      expect(result).toEqual({ success: true, data: true });
    });

    it('should prevent setting admin permission in bulk without existing admin rights', async () => {
      // Arrange
      const userId = 1;
      const permissions = { 'ai:chat:create': 1, 'ai:admin': 1 };
      mockValidatePermissions.mockResolvedValue(undefined);
      (aiUserPermissionService.checkPermission as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result = await middleware.setPermissions(userId, permissions);

      // Assert
      expect(aiUserPermissionService.checkPermission).toHaveBeenCalledWith(
        userId,
        PermissionKey.AI_ADMIN,
        1
      );
      expect(mockHandleError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.FORBIDDEN,
          message: '不能设置管理员权限'
        })
      );
      expect(result).toEqual({ success: false, error: 'Test error' });
    });
  });

  describe('removePermission', () => {
    it('should remove user permission successfully', async () => {
      // Arrange
      const userId = 1;
      const permissionKey = 'ai:chat:create';

      // Act
      const result = await middleware.removePermission(userId, permissionKey);

      // Assert
      expect(mockValidatePermissions).toHaveBeenCalledWith(userId, ['ai:permission:write']);
      expect(aiUserPermissionService.removePermission).toHaveBeenCalledWith(
        userId,
        permissionKey
      );
      expect(mockLogOperation).toHaveBeenCalledWith(userId, 'REMOVE_PERMISSION', {
        targetUserId: userId,
        permissionKey
      });
      expect(mockCreateSuccessResponse).toHaveBeenCalledWith(true);
      expect(result).toEqual({ success: true, data: true });
    });
  });

  describe('initializeUserPermissions', () => {
    it('should initialize user permissions successfully', async () => {
      // Arrange
      const userId = 1;

      // Act
      const result = await middleware.initializeUserPermissions(userId);

      // Assert
      expect(mockValidatePermissions).toHaveBeenCalledWith(userId, ['ai:permission:initialize']);
      expect(aiUserPermissionService.initializeUserPermissions).toHaveBeenCalledWith(userId);
      expect(mockLogOperation).toHaveBeenCalledWith(userId, 'INITIALIZE_PERMISSIONS', {
        targetUserId: userId
      });
      expect(mockCreateSuccessResponse).toHaveBeenCalledWith(true);
      expect(result).toEqual({ success: true, data: true });
    });
  });

  describe('getUserSettings', () => {
    it('should get user settings successfully', async () => {
      // Arrange
      const userId = 1;
      const mockUserRelation = {
        id: 1,
        externalUserId: userId,
        settings: { theme: 'dark', preferredModel: 'gpt-4' },
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      (aiUserRelationService.getUserRelation as jest.Mock).mockResolvedValue(mockUserRelation);

      // Act
      const result = await middleware.getUserSettings(userId);

      // Assert
      expect(mockValidatePermissions).toHaveBeenCalledWith(userId, ['ai:user:read']);
      expect(aiUserRelationService.getUserRelation).toHaveBeenCalledWith(userId);
      expect(mockCreateSuccessResponse).toHaveBeenCalledWith(mockUserRelation.settings);
      expect(result).toEqual({ success: true, data: mockUserRelation.settings });
    });

    it('should return null when user relation not found', async () => {
      // Arrange
      const userId = 1;
      (aiUserRelationService.getUserRelation as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await middleware.getUserSettings(userId);

      // Assert
      expect(mockCreateSuccessResponse).toHaveBeenCalledWith(null);
      expect(result).toEqual({ success: true, data: null });
    });
  });

  describe('updateUserSettings', () => {
    it('should update user settings successfully', async () => {
      // Arrange
      const userId = 1;
      const settings = { theme: 'light', preferredModel: 'gpt-3.5' };
      const mockUserRelation = {
        id: 1,
        externalUserId: userId,
        settings,
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      (aiUserRelationService.updateUserSettings as jest.Mock).mockResolvedValue(mockUserRelation);

      // Act
      const result = await middleware.updateUserSettings(userId, settings);

      // Assert
      expect(mockValidatePermissions).toHaveBeenCalledWith(userId, ['ai:user:write']);
      expect(aiUserRelationService.updateUserSettings).toHaveBeenCalledWith(userId, settings);
      expect(mockLogOperation).toHaveBeenCalledWith(userId, 'UPDATE_USER_SETTINGS', {
        targetUserId: userId,
        settingsUpdated: ['theme', 'preferredModel']
      });
      expect(mockCreateSuccessResponse).toHaveBeenCalledWith({
        id: mockUserRelation.id,
        externalUserId: mockUserRelation.externalUserId,
        settings: mockUserRelation.settings,
        lastActivity: mockUserRelation.lastActivity,
        createdAt: mockUserRelation.createdAt,
        updatedAt: mockUserRelation.updatedAt
      });
      expect(result).toEqual({ success: true, data: mockUserRelation });
    });

    it('should handle null response from service', async () => {
      // Arrange
      const userId = 1;
      const settings = { theme: 'light' };
      (aiUserRelationService.updateUserSettings as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await middleware.updateUserSettings(userId, settings);

      // Assert
      expect(mockCreateSuccessResponse).toHaveBeenCalledWith(null);
      expect(result).toEqual({ success: true, data: null });
    });
  });

  describe('getUserRelation', () => {
    it('should get user relation successfully', async () => {
      // Arrange
      const userId = 1;
      const mockUserRelation = {
        id: 1,
        externalUserId: userId,
        settings: { theme: 'dark' },
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      (aiUserRelationService.getUserRelation as jest.Mock).mockResolvedValue(mockUserRelation);

      // Act
      const result = await middleware.getUserRelation(userId);

      // Assert
      expect(mockValidatePermissions).toHaveBeenCalledWith(userId, ['ai:user:read']);
      expect(aiUserRelationService.getUserRelation).toHaveBeenCalledWith(userId);
      expect(mockCreateSuccessResponse).toHaveBeenCalledWith({
        id: mockUserRelation.id,
        externalUserId: mockUserRelation.externalUserId,
        settings: mockUserRelation.settings,
        lastActivity: mockUserRelation.lastActivity,
        createdAt: mockUserRelation.createdAt,
        updatedAt: mockUserRelation.updatedAt
      });
      expect(result).toEqual({ success: true, data: mockUserRelation });
    });
  });

  describe('createUserRelation', () => {
    it('should create user relation successfully', async () => {
      // Arrange
      const userId = 1;
      const settings = { theme: 'dark' };
      const mockUserRelation = {
        id: 1,
        externalUserId: userId,
        settings,
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      (aiUserRelationService.getOrCreateUserRelation as jest.Mock).mockResolvedValue(mockUserRelation);

      // Act
      const result = await middleware.createUserRelation(userId, settings);

      // Assert
      expect(mockValidatePermissions).toHaveBeenCalledWith(userId, ['ai:user:create']);
      expect(aiUserRelationService.getOrCreateUserRelation).toHaveBeenCalledWith(userId, settings);
      expect(mockLogOperation).toHaveBeenCalledWith(userId, 'CREATE_USER_RELATION', {
        targetUserId: userId
      });
      expect(mockCreateSuccessResponse).toHaveBeenCalledWith({
        id: mockUserRelation.id,
        externalUserId: mockUserRelation.externalUserId,
        settings: mockUserRelation.settings,
        lastActivity: mockUserRelation.lastActivity,
        createdAt: mockUserRelation.createdAt,
        updatedAt: mockUserRelation.updatedAt
      });
      expect(result).toEqual({ success: true, data: mockUserRelation });
    });
  });

  describe('updateLastActivity', () => {
    it('should update last activity successfully', async () => {
      // Arrange
      const userId = 1;
      (aiUserRelationService.updateLastActivity as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result = await middleware.updateLastActivity(userId);

      // Assert
      expect(aiUserRelationService.updateLastActivity).toHaveBeenCalledWith(userId);
      expect(mockCreateSuccessResponse).toHaveBeenCalledWith(true);
      expect(result).toEqual({ success: true, data: true });
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const userId = 1;
      const serviceError = new Error('Service error');
      (aiUserRelationService.updateLastActivity as jest.Mock).mockRejectedValue(serviceError);

      // Act
      const result = await middleware.updateLastActivity(userId);

      // Assert
      expect(mockHandleError).toHaveBeenCalledWith(serviceError);
      expect(result).toEqual({ success: false, error: 'Test error' });
    });
  });

  describe('getRecentActiveUsers', () => {
    it('should get recent active users successfully', async () => {
      // Arrange
      const limit = 5;
      const mockUsers = [
        {
          id: 1,
          externalUserId: 1,
          settings: { theme: 'dark' },
          lastActivity: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          externalUserId: 2,
          settings: { theme: 'light' },
          lastActivity: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      (aiUserRelationService.getRecentActiveUsers as jest.Mock).mockResolvedValue(mockUsers);

      // Act
      const result = await middleware.getRecentActiveUsers(limit);

      // Assert
      expect(mockValidatePermissions).toHaveBeenCalledWith(0, ['ai:admin']);
      expect(aiUserRelationService.getRecentActiveUsers).toHaveBeenCalledWith(limit);
      expect(mockCreateSuccessResponse).toHaveBeenCalledWith(mockUsers.map(user => ({
        id: user.id,
        externalUserId: user.externalUserId,
        settings: user.settings,
        lastActivity: user.lastActivity,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })));
      expect(result).toEqual({ success: true, data: mockUsers });
    });

    it('should use default limit when not provided', async () => {
      // Arrange
      const mockUsers = [];
      (aiUserRelationService.getRecentActiveUsers as jest.Mock).mockResolvedValue(mockUsers);

      // Act
      await middleware.getRecentActiveUsers();

      // Assert
      expect(aiUserRelationService.getRecentActiveUsers).toHaveBeenCalledWith(10);
    });

    it('should throw error when user lacks admin permission', async () => {
      // Arrange
      mockValidatePermissions.mockResolvedValue(undefined);

      // Act
      const result = await middleware.getRecentActiveUsers(5);

      // Assert
      expect(mockValidatePermissions).toHaveBeenCalledWith(0, ['ai:admin']);
      expect(mockHandleError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.FORBIDDEN,
          message: '需要管理员权限查看最近活动用户'
        })
      );
      expect(result).toEqual({ success: false, error: 'Test error' });
    });
  });

  describe('Error Handling', () => {
    it('should handle all types of errors consistently', async () => {
      // Arrange
      const userId = 1;
      const serviceError = new Error('Service error');
      (aiUserPermissionService.checkPermission as jest.Mock).mockRejectedValue(serviceError);

      // Act
      const result = await middleware.checkPermission(userId, 'ai:chat:create');

      // Assert
      expect(mockHandleError).toHaveBeenCalledWith(serviceError);
      expect(result).toEqual({ success: false, error: 'Test error' });
    });

    it('should handle validation errors properly', async () => {
      // Arrange
      const userId = 1;
      mockValidatePermissions.mockResolvedValue(undefined);

      // Act
      const result = await middleware.getUserPermissions(userId);

      // Assert
      expect(mockHandleError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.FORBIDDEN
        })
      );
      expect(result).toEqual({ success: false, error: 'Test error' });
    });
  });

  describe('Integration with Services', () => {
    it('should properly integrate with aiUserPermissionService', async () => {
      // Arrange
      const userId = 1;
      const permissions = { 'ai:chat:create': 1, 'ai:chat:read': 1 };
      (aiUserPermissionService.getUserPermissions as jest.Mock).mockResolvedValue(permissions);

      // Act
      await middleware.getUserPermissions(userId);

      // Assert
      expect(aiUserPermissionService.getUserPermissions).toHaveBeenCalledTimes(1);
      expect(aiUserPermissionService.getUserPermissions).toHaveBeenCalledWith(userId);
    });

    it('should properly integrate with aiUserRelationService', async () => {
      // Arrange
      const userId = 1;
      const settings = { theme: 'dark' };
      const mockUserRelation = {
        id: 1,
        externalUserId: userId,
        settings,
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      (aiUserRelationService.updateUserSettings as jest.Mock).mockResolvedValue(mockUserRelation);

      // Act
      await middleware.updateUserSettings(userId, settings);

      // Assert
      expect(aiUserRelationService.updateUserSettings).toHaveBeenCalledTimes(1);
      expect(aiUserRelationService.updateUserSettings).toHaveBeenCalledWith(userId, settings);
    });
  });
});