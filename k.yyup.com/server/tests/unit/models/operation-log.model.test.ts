import { Sequelize, Op } from 'sequelize';
import { vi } from 'vitest'
import { 
  OperationLog, 
  OperationType, 
  OperationResult, 
  initOperationLog, 
  initOperationLogAssociations 
} from '../../../src/models/operation-log.model';
import { User } from '../../../src/models/user.model';


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

describe('OperationLog Model', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    // Initialize related models
    User.initModel(sequelize);
    initOperationLog(sequelize);
    
    // Initialize associations
    initOperationLogAssociations();
    
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await OperationLog.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  describe('Model Definition', () => {
    it('should have correct model name', () => {
      expect(OperationLog.tableName).toBe('operation_logs');
    });

    it('should have correct attributes', () => {
      const attributes = Object.keys(OperationLog.getAttributes());
      expect(attributes).toContain('id');
      expect(attributes).toContain('userId');
      expect(attributes).toContain('module');
      expect(attributes).toContain('action');
      expect(attributes).toContain('operationType');
      expect(attributes).toContain('resourceType');
      expect(attributes).toContain('resourceId');
      expect(attributes).toContain('description');
      expect(attributes).toContain('requestMethod');
      expect(attributes).toContain('requestUrl');
      expect(attributes).toContain('requestParams');
      expect(attributes).toContain('requestIp');
      expect(attributes).toContain('userAgent');
      expect(attributes).toContain('deviceInfo');
      expect(attributes).toContain('operationResult');
      expect(attributes).toContain('resultMessage');
      expect(attributes).toContain('executionTime');
    });
  });

  describe('Field Validation', () => {
    it('should require module', async () => {
      const log = OperationLog.build({
        action: 'test_action',
        operationType: OperationType.CREATE,
      } as any);

      await expect(log.save()).rejects.toThrow();
    });

    it('should require action', async () => {
      const log = OperationLog.build({
        module: 'test_module',
        operationType: OperationType.CREATE,
      } as any);

      await expect(log.save()).rejects.toThrow();
    });

    it('should require operationType', async () => {
      const log = OperationLog.build({
        module: 'test_module',
        action: 'test_action',
      } as any);

      await expect(log.save()).rejects.toThrow();
    });

    it('should create OperationLog with valid data', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123',
        role: 'user',
      });

      const log = await OperationLog.create({
        userId: user.id,
        module: 'user_management',
        action: 'create_user',
        operationType: OperationType.CREATE,
        resourceType: 'User',
        resourceId: '1',
        description: 'Created new user',
        requestMethod: 'POST',
        requestUrl: '/api/users',
        requestParams: '{"username":"testuser","email":"test@test.com"}',
        requestIp: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        deviceInfo: 'Desktop',
        operationResult: OperationResult.SUCCESS,
        resultMessage: 'User created successfully',
        executionTime: 150,
      });

      expect(log.id).toBeDefined();
      expect(log.userId).toBe(user.id);
      expect(log.module).toBe('user_management');
      expect(log.action).toBe('create_user');
      expect(log.operationType).toBe(OperationType.CREATE);
      expect(log.resourceType).toBe('User');
      expect(log.resourceId).toBe('1');
      expect(log.description).toBe('Created new user');
      expect(log.requestMethod).toBe('POST');
      expect(log.requestUrl).toBe('/api/users');
      expect(log.requestParams).toBe('{"username":"testuser","email":"test@test.com"}');
      expect(log.requestIp).toBe('192.168.1.1');
      expect(log.userAgent).toBe('Mozilla/5.0');
      expect(log.deviceInfo).toBe('Desktop');
      expect(log.operationResult).toBe(OperationResult.SUCCESS);
      expect(log.resultMessage).toBe('User created successfully');
      expect(log.executionTime).toBe(150);
    });

    it('should create OperationLog with minimal data', async () => {
      const log = await OperationLog.create({
        module: 'test_module',
        action: 'test_action',
        operationType: OperationType.READ,
      });

      expect(log.id).toBeDefined();
      expect(log.module).toBe('test_module');
      expect(log.action).toBe('test_action');
      expect(log.operationType).toBe(OperationType.READ);
      expect(log.userId).toBeNull();
      expect(log.resourceType).toBeNull();
      expect(log.resourceId).toBeNull();
      expect(log.description).toBeNull();
      expect(log.requestMethod).toBeNull();
      expect(log.requestUrl).toBeNull();
      expect(log.requestParams).toBeNull();
      expect(log.requestIp).toBeNull();
      expect(log.userAgent).toBeNull();
      expect(log.deviceInfo).toBeNull();
      expect(log.operationResult).toBeNull();
      expect(log.resultMessage).toBeNull();
      expect(log.executionTime).toBeNull();
    });
  });

  describe('Enum Values', () => {
    it('should accept valid OperationType values', async () => {
      const operationTypes = [
        OperationType.CREATE,
        OperationType.READ,
        OperationType.UPDATE,
        OperationType.DELETE,
        OperationType.LOGIN,
        OperationType.LOGOUT,
        OperationType.OTHER,
      ];

      for (const operationType of operationTypes) {
        const log = await OperationLog.create({
          module: 'test_module',
          action: 'test_action',
          operationType,
        });

        expect(log.operationType).toBe(operationType);
      }
    });

    it('should accept valid OperationResult values', async () => {
      const operationResults = [
        OperationResult.SUCCESS,
        OperationResult.FAILED,
      ];

      for (const operationResult of operationResults) {
        const log = await OperationLog.create({
          module: 'test_module',
          action: 'test_action',
          operationType: OperationType.CREATE,
          operationResult,
        });

        expect(log.operationResult).toBe(operationResult);
      }
    });
  });

  describe('String Field Lengths', () => {
    it('should handle module within length limit', async () => {
      const longModule = 'A'.repeat(50); // Max length for module

      const log = await OperationLog.create({
        module: longModule,
        action: 'test_action',
        operationType: OperationType.CREATE,
      });

      expect(log.module).toBe(longModule);
    });

    it('should handle action within length limit', async () => {
      const longAction = 'A'.repeat(50); // Max length for action

      const log = await OperationLog.create({
        module: 'test_module',
        action: longAction,
        operationType: OperationType.CREATE,
      });

      expect(log.action).toBe(longAction);
    });

    it('should handle operationType within length limit', async () => {
      const longOperationType = 'A'.repeat(20); // Max length for operationType

      const log = await OperationLog.create({
        module: 'test_module',
        action: 'test_action',
        operationType: longOperationType,
      });

      expect(log.operationType).toBe(longOperationType);
    });

    it('should handle resourceType within length limit', async () => {
      const longResourceType = 'A'.repeat(50); // Max length for resourceType

      const log = await OperationLog.create({
        module: 'test_module',
        action: 'test_action',
        operationType: OperationType.CREATE,
        resourceType: longResourceType,
      });

      expect(log.resourceType).toBe(longResourceType);
    });

    it('should handle resourceId within length limit', async () => {
      const longResourceId = 'A'.repeat(50); // Max length for resourceId

      const log = await OperationLog.create({
        module: 'test_module',
        action: 'test_action',
        operationType: OperationType.CREATE,
        resourceId: longResourceId,
      });

      expect(log.resourceId).toBe(longResourceId);
    });

    it('should handle requestMethod within length limit', async () => {
      const longRequestMethod = 'A'.repeat(10); // Max length for requestMethod

      const log = await OperationLog.create({
        module: 'test_module',
        action: 'test_action',
        operationType: OperationType.CREATE,
        requestMethod: longRequestMethod,
      });

      expect(log.requestMethod).toBe(longRequestMethod);
    });

    it('should handle requestIp within length limit', async () => {
      const longRequestIp = 'A'.repeat(50); // Max length for requestIp

      const log = await OperationLog.create({
        module: 'test_module',
        action: 'test_action',
        operationType: OperationType.CREATE,
        requestIp: longRequestIp,
      });

      expect(log.requestIp).toBe(longRequestIp);
    });

    it('should handle operationResult within length limit', async () => {
      const longOperationResult = 'A'.repeat(10); // Max length for operationResult

      const log = await OperationLog.create({
        module: 'test_module',
        action: 'test_action',
        operationType: OperationType.CREATE,
        operationResult: longOperationResult,
      });

      expect(log.operationResult).toBe(longOperationResult);
    });
  });

  describe('Text Fields', () => {
    it('should handle long description', async () => {
      const longDescription = 'A'.repeat(5000); // Very long description

      const log = await OperationLog.create({
        module: 'test_module',
        action: 'test_action',
        operationType: OperationType.CREATE,
        description: longDescription,
      });

      expect(log.description).toBe(longDescription);
    });

    it('should handle long requestUrl', async () => {
      const longRequestUrl = 'A'.repeat(10000); // Very long URL

      const log = await OperationLog.create({
        module: 'test_module',
        action: 'test_action',
        operationType: OperationType.CREATE,
        requestUrl: longRequestUrl,
      });

      expect(log.requestUrl).toBe(longRequestUrl);
    });

    it('should handle long requestParams', async () => {
      const longRequestParams = 'A'.repeat(10000); // Very long params

      const log = await OperationLog.create({
        module: 'test_module',
        action: 'test_action',
        operationType: OperationType.CREATE,
        requestParams: longRequestParams,
      });

      expect(log.requestParams).toBe(longRequestParams);
    });

    it('should handle long userAgent', async () => {
      const longUserAgent = 'A'.repeat(5000); // Very long user agent

      const log = await OperationLog.create({
        module: 'test_module',
        action: 'test_action',
        operationType: OperationType.CREATE,
        userAgent: longUserAgent,
      });

      expect(log.userAgent).toBe(longUserAgent);
    });

    it('should handle long deviceInfo', async () => {
      const longDeviceInfo = 'A'.repeat(5000); // Very long device info

      const log = await OperationLog.create({
        module: 'test_module',
        action: 'test_action',
        operationType: OperationType.CREATE,
        deviceInfo: longDeviceInfo,
      });

      expect(log.deviceInfo).toBe(longDeviceInfo);
    });

    it('should handle long resultMessage', async () => {
      const longResultMessage = 'A'.repeat(5000); // Very long result message

      const log = await OperationLog.create({
        module: 'test_module',
        action: 'test_action',
        operationType: OperationType.CREATE,
        operationResult: OperationResult.FAILED,
        resultMessage: longResultMessage,
      });

      expect(log.resultMessage).toBe(longResultMessage);
    });
  });

  describe('Integer Fields', () => {
    it('should handle executionTime values', async () => {
      const executionTimes = [0, 1, 100, 1000, 2147483647]; // Including max 32-bit integer

      for (const executionTime of executionTimes) {
        const log = await OperationLog.create({
          module: 'test_module',
          action: 'test_action',
          operationType: OperationType.CREATE,
          executionTime,
        });

        expect(log.executionTime).toBe(executionTime);
      }
    });

    it('should handle null executionTime', async () => {
      const log = await OperationLog.create({
        module: 'test_module',
        action: 'test_action',
        operationType: OperationType.CREATE,
        executionTime: null,
      });

      expect(log.executionTime).toBeNull();
    });
  });

  describe('Associations', () => {
    it('should belong to user', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123',
        role: 'user',
      });

      const log = await OperationLog.create({
        userId: user.id,
        module: 'test_module',
        action: 'test_action',
        operationType: OperationType.CREATE,
      });

      const logWithUser = await OperationLog.findByPk(log.id, {
        include: ['user'],
      });

      expect(logWithUser?.user).toBeDefined();
      expect(logWithUser?.user?.id).toBe(user.id);
    });

    it('should handle null userId', async () => {
      const log = await OperationLog.create({
        module: 'test_module',
        action: 'test_action',
        operationType: OperationType.CREATE,
      });

      const logWithUser = await OperationLog.findByPk(log.id, {
        include: ['user'],
      });

      expect(logWithUser?.user).toBeNull();
    });
  });

  describe('CRUD Operations', () => {
    it('should create OperationLog successfully', async () => {
      const log = await OperationLog.create({
        module: 'user_management',
        action: 'create_user',
        operationType: OperationType.CREATE,
        description: 'Created new user account',
      });

      expect(log.id).toBeDefined();
      expect(log.module).toBe('user_management');
      expect(log.action).toBe('create_user');
      expect(log.operationType).toBe(OperationType.CREATE);
      expect(log.description).toBe('Created new user account');
    });

    it('should read OperationLog successfully', async () => {
      const log = await OperationLog.create({
        module: 'test_module',
        action: 'test_action',
        operationType: OperationType.READ,
      });

      const foundLog = await OperationLog.findByPk(log.id);

      expect(foundLog).toBeDefined();
      expect(foundLog?.id).toBe(log.id);
      expect(foundLog?.module).toBe('test_module');
      expect(foundLog?.action).toBe('test_action');
      expect(foundLog?.operationType).toBe(OperationType.READ);
    });

    it('should update OperationLog successfully', async () => {
      const log = await OperationLog.create({
        module: 'test_module',
        action: 'test_action',
        operationType: OperationType.CREATE,
        operationResult: OperationResult.SUCCESS,
      });

      await log.update({
        operationResult: OperationResult.FAILED,
        resultMessage: 'Operation failed due to validation error',
        executionTime: 250,
      });

      const updatedLog = await OperationLog.findByPk(log.id);

      expect(updatedLog?.operationResult).toBe(OperationResult.FAILED);
      expect(updatedLog?.resultMessage).toBe('Operation failed due to validation error');
      expect(updatedLog?.executionTime).toBe(250);
    });

    it('should delete OperationLog successfully', async () => {
      const log = await OperationLog.create({
        module: 'test_module',
        action: 'test_action',
        operationType: OperationType.CREATE,
      });

      await log.destroy();

      const deletedLog = await OperationLog.findByPk(log.id);

      expect(deletedLog).toBeNull();
    });
  });

  describe('Query Methods', () => {
    it('should find OperationLog by module', async () => {
      await OperationLog.create({
        module: 'user_management',
        action: 'create_user',
        operationType: OperationType.CREATE,
      });

      await OperationLog.create({
        module: 'role_management',
        action: 'create_role',
        operationType: OperationType.CREATE,
      });

      const userManagementLogs = await OperationLog.findAll({
        where: { module: 'user_management' },
      });

      const roleManagementLogs = await OperationLog.findAll({
        where: { module: 'role_management' },
      });

      expect(userManagementLogs.length).toBe(1);
      expect(roleManagementLogs.length).toBe(1);
      expect(userManagementLogs[0].action).toBe('create_user');
      expect(roleManagementLogs[0].action).toBe('create_role');
    });

    it('should find OperationLog by action', async () => {
      await OperationLog.create({
        module: 'user_management',
        action: 'create_user',
        operationType: OperationType.CREATE,
      });

      await OperationLog.create({
        module: 'user_management',
        action: 'update_user',
        operationType: OperationType.UPDATE,
      });

      await OperationLog.create({
        module: 'user_management',
        action: 'delete_user',
        operationType: OperationType.DELETE,
      });

      const createLogs = await OperationLog.findAll({
        where: { action: 'create_user' },
      });

      const updateLogs = await OperationLog.findAll({
        where: { action: 'update_user' },
      });

      const deleteLogs = await OperationLog.findAll({
        where: { action: 'delete_user' },
      });

      expect(createLogs.length).toBe(1);
      expect(updateLogs.length).toBe(1);
      expect(deleteLogs.length).toBe(1);
    });

    it('should find OperationLog by operationType', async () => {
      await OperationLog.create({
        module: 'user_management',
        action: 'create_user',
        operationType: OperationType.CREATE,
      });

      await OperationLog.create({
        module: 'user_management',
        action: 'read_user',
        operationType: OperationType.READ,
      });

      await OperationLog.create({
        module: 'user_management',
        action: 'update_user',
        operationType: OperationType.UPDATE,
      });

      const createLogs = await OperationLog.findAll({
        where: { operationType: OperationType.CREATE },
      });

      const readLogs = await OperationLog.findAll({
        where: { operationType: OperationType.READ },
      });

      const updateLogs = await OperationLog.findAll({
        where: { operationType: OperationType.UPDATE },
      });

      expect(createLogs.length).toBe(1);
      expect(readLogs.length).toBe(1);
      expect(updateLogs.length).toBe(1);
    });

    it('should find OperationLog by userId', async () => {
      const user1 = await User.create({
        username: 'user1',
        email: 'user1@test.com',
        password: 'password123',
        role: 'user',
      });

      const user2 = await User.create({
        username: 'user2',
        email: 'user2@test.com',
        password: 'password123',
        role: 'user',
      });

      await OperationLog.create({
        userId: user1.id,
        module: 'test_module',
        action: 'test_action',
        operationType: OperationType.CREATE,
      });

      await OperationLog.create({
        userId: user2.id,
        module: 'test_module',
        action: 'test_action',
        operationType: OperationType.CREATE,
      });

      const user1Logs = await OperationLog.findAll({
        where: { userId: user1.id },
      });

      const user2Logs = await OperationLog.findAll({
        where: { userId: user2.id },
      });

      expect(user1Logs.length).toBe(1);
      expect(user2Logs.length).toBe(1);
      expect(user1Logs[0].userId).toBe(user1.id);
      expect(user2Logs[0].userId).toBe(user2.id);
    });

    it('should find OperationLog by operationResult', async () => {
      await OperationLog.create({
        module: 'test_module',
        action: 'test_action',
        operationType: OperationType.CREATE,
        operationResult: OperationResult.SUCCESS,
      });

      await OperationLog.create({
        module: 'test_module',
        action: 'test_action',
        operationType: OperationType.CREATE,
        operationResult: OperationResult.FAILED,
      });

      const successLogs = await OperationLog.findAll({
        where: { operationResult: OperationResult.SUCCESS },
      });

      const failedLogs = await OperationLog.findAll({
        where: { operationResult: OperationResult.FAILED },
      });

      expect(successLogs.length).toBe(1);
      expect(failedLogs.length).toBe(1);
      expect(successLogs[0].operationResult).toBe(OperationResult.SUCCESS);
      expect(failedLogs[0].operationResult).toBe(OperationResult.FAILED);
    });

    it('should find OperationLog with complex conditions', async () => {
      await OperationLog.create({
        module: 'user_management',
        action: 'create_user',
        operationType: OperationType.CREATE,
        operationResult: OperationResult.SUCCESS,
      });

      await OperationLog.create({
        module: 'user_management',
        action: 'create_user',
        operationType: OperationType.CREATE,
        operationResult: OperationResult.FAILED,
      });

      await OperationLog.create({
        module: 'role_management',
        action: 'create_role',
        operationType: OperationType.CREATE,
        operationResult: OperationResult.SUCCESS,
      });

      const logs = await OperationLog.findAll({
        where: {
          module: 'user_management',
          operationResult: OperationResult.SUCCESS,
        },
      });

      expect(logs.length).toBe(1);
      expect(logs[0].module).toBe('user_management');
      expect(logs[0].action).toBe('create_user');
      expect(logs[0].operationResult).toBe(OperationResult.SUCCESS);
    });

    it('should find OperationLog with date range', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      await OperationLog.create({
        module: 'test_module',
        action: 'test_action',
        operationType: OperationType.CREATE,
      });

      const logs = await OperationLog.findAll({
        where: {
          createdAt: {
            [Op.between]: [yesterday, tomorrow],
          },
        },
      });

      expect(logs.length).toBe(1);
    });
  });

  describe('Business Logic Scenarios', () => {
    it('should track user login operations', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123',
        role: 'user',
      });

      await OperationLog.create({
        userId: user.id,
        module: 'authentication',
        action: 'user_login',
        operationType: OperationType.LOGIN,
        operationResult: OperationResult.SUCCESS,
        requestIp: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      const loginLogs = await OperationLog.findAll({
        where: {
          userId: user.id,
          operationType: OperationType.LOGIN,
        },
      });

      expect(loginLogs.length).toBe(1);
      expect(loginLogs[0].module).toBe('authentication');
      expect(loginLogs[0].action).toBe('user_login');
    });

    it('should track CRUD operations', async () => {
      const crudOperations = [
        { type: OperationType.CREATE, action: 'create_user' },
        { type: OperationType.READ, action: 'read_user' },
        { type: OperationType.UPDATE, action: 'update_user' },
        { type: OperationType.DELETE, action: 'delete_user' },
      ];

      for (const op of crudOperations) {
        await OperationLog.create({
          module: 'user_management',
          action: op.action,
          operationType: op.type,
          operationResult: OperationResult.SUCCESS,
        });
      }

      const createLogs = await OperationLog.count({
        where: { operationType: OperationType.CREATE },
      });

      const readLogs = await OperationLog.count({
        where: { operationType: OperationType.READ },
      });

      const updateLogs = await OperationLog.count({
        where: { operationType: OperationType.UPDATE },
      });

      const deleteLogs = await OperationLog.count({
        where: { operationType: OperationType.DELETE },
      });

      expect(createLogs).toBe(1);
      expect(readLogs).toBe(1);
      expect(updateLogs).toBe(1);
      expect(deleteLogs).toBe(1);
    });

    it('should track operation performance', async () => {
      const executionTimes = [50, 150, 300, 500, 1000];

      for (const time of executionTimes) {
        await OperationLog.create({
          module: 'test_module',
          action: 'test_action',
          operationType: OperationType.CREATE,
          executionTime: time,
          operationResult: OperationResult.SUCCESS,
        });
      }

      const slowOperations = await OperationLog.findAll({
        where: {
          executionTime: {
            [Op.gte]: 500,
          },
        },
      });

      const fastOperations = await OperationLog.findAll({
        where: {
          executionTime: {
            [Op.lt]: 100,
          },
        },
      });

      expect(slowOperations.length).toBe(2); // 500 and 1000
      expect(fastOperations.length).toBe(1); // 50
    });
  });
});