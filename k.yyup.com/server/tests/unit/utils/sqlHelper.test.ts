import { QueryTypes, Transaction } from 'sequelize';
import { vi } from 'vitest'
import { SqlHelper } from '../../../src/utils/sqlHelper';

// Mock dependencies
jest.mock('../../../src/init', () => ({
  sequelize: {
    query: jest.fn(),
    transaction: jest.fn()
  }
}));

const mockSequelize = require('../../../src/init').sequelize;


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

describe('SqlHelper', () => {
  let mockTransaction: jest.Mocked<Transaction>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
      finished: 'pending'
    } as any;
  });

  describe('recordExists', () => {
    it('应该检查记录是否存在 - 存在的情况', async () => {
      mockSequelize.query.mockResolvedValue([{ '1': 1 }]);

      const result = await SqlHelper.recordExists('users', 'id', 123);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        'SELECT 1 FROM users WHERE id = :value LIMIT 1',
        {
          replacements: { value: 123 },
          type: QueryTypes.SELECT,
          transaction: undefined
        }
      );
      expect(result).toBe(true);
    });

    it('应该检查记录是否存在 - 不存在的情况', async () => {
      mockSequelize.query.mockResolvedValue([]);

      const result = await SqlHelper.recordExists('users', 'email', 'test@example.com');

      expect(mockSequelize.query).toHaveBeenCalledWith(
        'SELECT 1 FROM users WHERE email = :value LIMIT 1',
        {
          replacements: { value: 'test@example.com' },
          type: QueryTypes.SELECT,
          transaction: undefined
        }
      );
      expect(result).toBe(false);
    });

    it('应该支持额外的WHERE条件', async () => {
      mockSequelize.query.mockResolvedValue([]);

      await SqlHelper.recordExists('users', 'id', 123, {
        whereAddition: 'status = :status',
        replacements: { status: 'active' }
      });

      expect(mockSequelize.query).toHaveBeenCalledWith(
        'SELECT 1 FROM users WHERE id = :value AND status = :status LIMIT 1',
        {
          replacements: { value: 123, status: 'active' },
          type: QueryTypes.SELECT,
          transaction: undefined
        }
      );
    });

    it('应该支持事务', async () => {
      mockSequelize.query.mockResolvedValue([]);

      await SqlHelper.recordExists('users', 'id', 123, {
        transaction: mockTransaction
      });

      expect(mockSequelize.query).toHaveBeenCalledWith(
        'SELECT 1 FROM users WHERE id = :value LIMIT 1',
        {
          replacements: { value: 123 },
          type: QueryTypes.SELECT,
          transaction: mockTransaction
        }
      );
    });

    it('应该处理null值', async () => {
      mockSequelize.query.mockResolvedValue([]);

      await SqlHelper.recordExists('users', 'deleted_at', null);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        'SELECT 1 FROM users WHERE deleted_at = :value LIMIT 1',
        {
          replacements: { value: null },
          type: QueryTypes.SELECT,
          transaction: undefined
        }
      );
    });

    it('应该处理字符串值', async () => {
      mockSequelize.query.mockResolvedValue([]);

      await SqlHelper.recordExists('users', 'username', 'john_doe');

      expect(mockSequelize.query).toHaveBeenCalledWith(
        'SELECT 1 FROM users WHERE username = :value LIMIT 1',
        {
          replacements: { value: 'john_doe' },
          type: QueryTypes.SELECT,
          transaction: undefined
        }
      );
    });

    it('应该处理数字值', async () => {
      mockSequelize.query.mockResolvedValue([]);

      await SqlHelper.recordExists('orders', 'amount', 99.99);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        'SELECT 1 FROM orders WHERE amount = :value LIMIT 1',
        {
          replacements: { value: 99.99 },
          type: QueryTypes.SELECT,
          transaction: undefined
        }
      );
    });

    it('应该处理布尔值', async () => {
      mockSequelize.query.mockResolvedValue([]);

      await SqlHelper.recordExists('users', 'is_active', true);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        'SELECT 1 FROM users WHERE is_active = :value LIMIT 1',
        {
          replacements: { value: true },
          type: QueryTypes.SELECT,
          transaction: undefined
        }
      );
    });

    it('应该处理复杂的WHERE条件', async () => {
      mockSequelize.query.mockResolvedValue([]);

      await SqlHelper.recordExists('users', 'id', 123, {
        whereAddition: 'status = :status AND created_at > :date',
        replacements: { 
          status: 'active', 
          date: '2023-01-01' 
        }
      });

      expect(mockSequelize.query).toHaveBeenCalledWith(
        'SELECT 1 FROM users WHERE id = :value AND status = :status AND created_at > :date LIMIT 1',
        {
          replacements: { 
            value: 123, 
            status: 'active', 
            date: '2023-01-01' 
          },
          type: QueryTypes.SELECT,
          transaction: undefined
        }
      );
    });

    it('应该处理查询错误', async () => {
      const error = new Error('Database connection failed');
      mockSequelize.query.mockRejectedValue(error);

      await expect(SqlHelper.recordExists('users', 'id', 123))
        .rejects.toThrow('Database connection failed');
    });
  });

  describe('SQL注入防护', () => {
    it('应该使用参数化查询防止SQL注入', async () => {
      mockSequelize.query.mockResolvedValue([]);

      const maliciousValue = "'; DROP TABLE users; --";
      await SqlHelper.recordExists('users', 'username', maliciousValue);

      // 验证使用了参数化查询
      expect(mockSequelize.query).toHaveBeenCalledWith(
        'SELECT 1 FROM users WHERE username = :value LIMIT 1',
        {
          replacements: { value: maliciousValue },
          type: QueryTypes.SELECT,
          transaction: undefined
        }
      );
    });

    it('应该在WHERE条件中使用参数化查询', async () => {
      mockSequelize.query.mockResolvedValue([]);

      const maliciousStatus = "active'; DROP TABLE users; --";
      await SqlHelper.recordExists('users', 'id', 123, {
        whereAddition: 'status = :status',
        replacements: { status: maliciousStatus }
      });

      // 验证恶意代码被作为参数值处理
      expect(mockSequelize.query).toHaveBeenCalledWith(
        'SELECT 1 FROM users WHERE id = :value AND status = :status LIMIT 1',
        {
          replacements: { 
            value: 123, 
            status: maliciousStatus 
          },
          type: QueryTypes.SELECT,
          transaction: undefined
        }
      );
    });
  });

  describe('边界情况', () => {
    it('应该处理空字符串表名', async () => {
      mockSequelize.query.mockResolvedValue([]);

      await SqlHelper.recordExists('', 'id', 123);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        'SELECT 1 FROM  WHERE id = :value LIMIT 1',
        expect.any(Object)
      );
    });

    it('应该处理空字符串字段名', async () => {
      mockSequelize.query.mockResolvedValue([]);

      await SqlHelper.recordExists('users', '', 123);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        'SELECT 1 FROM users WHERE  = :value LIMIT 1',
        expect.any(Object)
      );
    });

    it('应该处理undefined值', async () => {
      mockSequelize.query.mockResolvedValue([]);

      await SqlHelper.recordExists('users', 'id', undefined);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        'SELECT 1 FROM users WHERE id = :value LIMIT 1',
        {
          replacements: { value: undefined },
          type: QueryTypes.SELECT,
          transaction: undefined
        }
      );
    });

    it('应该处理空的replacements对象', async () => {
      mockSequelize.query.mockResolvedValue([]);

      await SqlHelper.recordExists('users', 'id', 123, {
        whereAddition: 'status = "active"',
        replacements: {}
      });

      expect(mockSequelize.query).toHaveBeenCalledWith(
        'SELECT 1 FROM users WHERE id = :value AND status = "active" LIMIT 1',
        {
          replacements: { value: 123 },
          type: QueryTypes.SELECT,
          transaction: undefined
        }
      );
    });

    it('应该处理空的whereAddition', async () => {
      mockSequelize.query.mockResolvedValue([]);

      await SqlHelper.recordExists('users', 'id', 123, {
        whereAddition: '',
        replacements: { extra: 'value' }
      });

      expect(mockSequelize.query).toHaveBeenCalledWith(
        'SELECT 1 FROM users WHERE id = :value LIMIT 1',
        {
          replacements: { value: 123, extra: 'value' },
          type: QueryTypes.SELECT,
          transaction: undefined
        }
      );
    });
  });

  describe('性能考虑', () => {
    it('应该使用LIMIT 1优化查询', async () => {
      mockSequelize.query.mockResolvedValue([]);

      await SqlHelper.recordExists('users', 'id', 123);

      const query = mockSequelize.query.mock.calls[0][0];
      expect(query).toContain('LIMIT 1');
    });

    it('应该使用SELECT 1而不是SELECT *', async () => {
      mockSequelize.query.mockResolvedValue([]);

      await SqlHelper.recordExists('users', 'id', 123);

      const query = mockSequelize.query.mock.calls[0][0];
      expect(query).toContain('SELECT 1');
      expect(query).not.toContain('SELECT *');
    });
  });
});
