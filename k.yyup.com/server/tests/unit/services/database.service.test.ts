/**
 * DatabaseService 单元测试
 * 测试数据库服务的核心功能
 */

import { DatabaseService } from '../../../src/services/database.service';
import { vi } from 'vitest'
import mysql from 'mysql2/promise';

// Mock mysql2/promise
jest.mock('mysql2/promise', () => ({
  createPool: jest.fn()
}));

const mockedMysql = mysql as jest.Mocked<typeof mysql>;


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

describe('DatabaseService', () => {
  let service: DatabaseService;
  let mockPool: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock pool
    mockPool = {
      execute: jest.fn(),
      getConnection: jest.fn(),
      end: jest.fn()
    };

    mockedMysql.createPool.mockReturnValue(mockPool);
    
    service = new DatabaseService();
  });

  describe('constructor', () => {
    it('should create database pool with correct configuration', () => {
      expect(mockedMysql.createPool).toHaveBeenCalledWith({
        host: expect.any(String),
        port: expect.any(Number),
        user: expect.any(String),
        password: expect.any(String),
        database: expect.any(String),
        charset: 'utf8mb4',
        connectionLimit: 10
      });
    });
  });

  describe('query', () => {
    it('should execute query with parameters', async () => {
      const mockRows = [{ id: 1, name: 'test' }];
      mockPool.execute.mockResolvedValue([mockRows]);

      const sql = 'SELECT * FROM users WHERE id = ?';
      const params = [1];
      const result = await service.query(sql, params);

      expect(mockPool.execute).toHaveBeenCalledWith(sql, params);
      expect(result).toBe(mockRows);
    });

    it('should execute query without parameters', async () => {
      const mockRows = [{ id: 1, name: 'test' }];
      mockPool.execute.mockResolvedValue([mockRows]);

      const sql = 'SELECT * FROM users';
      const result = await service.query(sql);

      expect(mockPool.execute).toHaveBeenCalledWith(sql, []);
      expect(result).toBe(mockRows);
    });

    it('should handle query errors', async () => {
      const error = new Error('Database error');
      mockPool.execute.mockRejectedValue(error);

      const sql = 'SELECT * FROM users';
      
      await expect(service.query(sql)).rejects.toThrow(error);
      expect(console.error).toHaveBeenCalledWith(
        'Database query error:',
        error,
        'SQL:',
        sql,
        'Params:',
        []
      );
    });
  });

  describe('transaction', () => {
    let mockConnection: any;

    beforeEach(() => {
      mockConnection = {
        beginTransaction: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        release: jest.fn()
      };
      mockPool.getConnection.mockResolvedValue(mockConnection);
    });

    it('should execute transaction successfully', async () => {
      const callback = jest.fn().mockResolvedValue('transaction result');
      const result = await service.transaction(callback);

      expect(mockPool.getConnection).toHaveBeenCalled();
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(mockConnection);
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
      expect(result).toBe('transaction result');
    });

    it('should rollback transaction on error', async () => {
      const error = new Error('Transaction error');
      const callback = jest.fn().mockRejectedValue(error);

      await expect(service.transaction(callback)).rejects.toThrow(error);

      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(mockConnection);
      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it('should release connection even if rollback fails', async () => {
      const error = new Error('Transaction error');
      const rollbackError = new Error('Rollback error');
      const callback = jest.fn().mockRejectedValue(error);

      mockConnection.rollback.mockRejectedValue(rollbackError);

      await expect(service.transaction(callback)).rejects.toThrow(error);

      expect(mockConnection.release).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return single record when found', async () => {
      const mockRows = [{ id: 1, name: 'test' }];
      mockPool.execute.mockResolvedValue([mockRows]);

      const sql = 'SELECT * FROM users WHERE id = ?';
      const params = [1];
      const result = await service.findOne(sql, params);

      expect(result).toEqual({ id: 1, name: 'test' });
    });

    it('should return null when no records found', async () => {
      mockPool.execute.mockResolvedValue([[]]);

      const sql = 'SELECT * FROM users WHERE id = ?';
      const params = [999];
      const result = await service.findOne(sql, params);

      expect(result).toBeNull();
    });

    it('should handle empty array result', async () => {
      mockPool.execute.mockResolvedValue([]);

      const sql = 'SELECT * FROM users WHERE id = ?';
      const params = [1];
      const result = await service.findOne(sql, params);

      expect(result).toBeNull();
    });
  });

  describe('findMany', () => {
    it('should return array of records', async () => {
      const mockRows = [
        { id: 1, name: 'test1' },
        { id: 2, name: 'test2' }
      ];
      mockPool.execute.mockResolvedValue([mockRows]);

      const sql = 'SELECT * FROM users';
      const result = await service.findMany(sql);

      expect(result).toEqual(mockRows);
    });

    it('should return empty array when no records found', async () => {
      mockPool.execute.mockResolvedValue([[]]);

      const sql = 'SELECT * FROM users';
      const result = await service.findMany(sql);

      expect(result).toEqual([]);
    });

    it('should handle non-array result', async () => {
      mockPool.execute.mockResolvedValue([null]);

      const sql = 'SELECT * FROM users';
      const result = await service.findMany(sql);

      expect(result).toEqual([]);
    });
  });

  describe('insert', () => {
    it('should insert record with data', async () => {
      const mockResult = { insertId: 1, affectedRows: 1 };
      mockPool.execute.mockResolvedValue([mockResult]);

      const table = 'users';
      const data = { name: 'test', email: 'test@example.com' };
      const result = await service.insert(table, data);

      expect(mockPool.execute).toHaveBeenCalledWith(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        ['test', 'test@example.com']
      );
      expect(result).toBe(mockResult);
    });

    it('should handle empty data object', async () => {
      const mockResult = { insertId: 1, affectedRows: 1 };
      mockPool.execute.mockResolvedValue([mockResult]);

      const table = 'users';
      const data = {};
      const result = await service.insert(table, data);

      expect(mockPool.execute).toHaveBeenCalledWith(
        'INSERT INTO users () VALUES ()',
        []
      );
      expect(result).toBe(mockResult);
    });
  });

  describe('update', () => {
    it('should update record with data and where clause', async () => {
      const mockResult = { affectedRows: 1 };
      mockPool.execute.mockResolvedValue([mockResult]);

      const table = 'users';
      const data = { name: 'updated', email: 'updated@example.com' };
      const where = 'id = ?';
      const whereParams = [1];
      const result = await service.update(table, data, where, whereParams);

      expect(mockPool.execute).toHaveBeenCalledWith(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        ['updated', 'updated@example.com', 1]
      );
      expect(result).toBe(mockResult);
    });

    it('should handle update without where parameters', async () => {
      const mockResult = { affectedRows: 1 };
      mockPool.execute.mockResolvedValue([mockResult]);

      const table = 'users';
      const data = { name: 'updated' };
      const where = 'id = 1';
      const result = await service.update(table, data, where);

      expect(mockPool.execute).toHaveBeenCalledWith(
        'UPDATE users SET name = ? WHERE id = 1',
        ['updated']
      );
      expect(result).toBe(mockResult);
    });
  });

  describe('delete', () => {
    it('should delete record with where clause', async () => {
      const mockResult = { affectedRows: 1 };
      mockPool.execute.mockResolvedValue([mockResult]);

      const table = 'users';
      const where = 'id = ?';
      const whereParams = [1];
      const result = await service.delete(table, where, whereParams);

      expect(mockPool.execute).toHaveBeenCalledWith(
        'DELETE FROM users WHERE id = ?',
        [1]
      );
      expect(result).toBe(mockResult);
    });

    it('should handle delete without where parameters', async () => {
      const mockResult = { affectedRows: 1 };
      mockPool.execute.mockResolvedValue([mockResult]);

      const table = 'users';
      const where = 'id = 1';
      const result = await service.delete(table, where);

      expect(mockPool.execute).toHaveBeenCalledWith(
        'DELETE FROM users WHERE id = 1',
        []
      );
      expect(result).toBe(mockResult);
    });
  });

  describe('checkConnection', () => {
    it('should return true when connection is successful', async () => {
      mockPool.execute.mockResolvedValue([[{ '1': 1 }]]);

      const result = await service.checkConnection();

      expect(mockPool.execute).toHaveBeenCalledWith('SELECT 1');
      expect(result).toBe(true);
    });

    it('should return false when connection fails', async () => {
      mockPool.execute.mockRejectedValue(new Error('Connection error'));

      const result = await service.checkConnection();

      expect(mockPool.execute).toHaveBeenCalledWith('SELECT 1');
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Database connection check failed:',
        expect.any(Error)
      );
    });
  });

  describe('close', () => {
    it('should close the connection pool', async () => {
      await service.close();

      expect(mockPool.end).toHaveBeenCalled();
    });

    it('should handle close errors', async () => {
      const error = new Error('Close error');
      mockPool.end.mockRejectedValue(error);

      await expect(service.close()).rejects.toThrow(error);
    });
  });

  describe('getPoolStatus', () => {
    it('should return pool status information', () => {
      const status = service.getPoolStatus();

      expect(status).toEqual({
        connectionLimit: 10,
        status: 'active'
      });
    });
  });
});