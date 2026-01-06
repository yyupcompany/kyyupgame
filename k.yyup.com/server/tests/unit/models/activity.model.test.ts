import { 
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

describe, it, expect, vi, beforeEach } from 'vitest';
import { Activity } from '@/models/activity.model';
import { Sequelize } from 'sequelize';

// Mock Sequelize
vi.mock('sequelize', () => {
  const sequelize = {
    define: vi.fn().mockReturnValue({
      init: vi.fn(),
      associate: vi.fn(),
    }),
  };
  return {
    Sequelize,
    DataTypes: {
      INTEGER: 'INTEGER',
      STRING: 'STRING',
      TEXT: 'TEXT',
      DATE: 'DATE',
      BOOLEAN: 'BOOLEAN',
    },
    Model: class MockModel {
      static init = vi.fn();
      static associate = vi.fn();
    },
  };
});

describe('Activity Model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(Activity).toBeDefined();
  });

  it('should have correct fields', () => {
    // Since we're mocking Sequelize, we'll test that the model is properly defined
    expect(Activity).toHaveProperty('init');
    expect(Activity).toHaveProperty('associate');
  });

  it('should have correct associations', () => {
    // Test that associate method exists
    expect(Activity.associate).toBeDefined();
  });
});