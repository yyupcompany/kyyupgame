import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import * as apiIndex from '@/api/index';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation';

// Mock the modules that are imported
vi.mock('@/api/modules/auth', () => ({
  default: { login: vi.fn(), logout: vi.fn() },
  login: vi.fn(),
  logout: vi.fn()
}));

vi.mock('@/api/modules/dashboard', () => ({
  default: { getStats: vi.fn() },
  getStats: vi.fn()
}));

vi.mock('@/api/modules/student', () => ({
  default: { getStudents: vi.fn() },
  getStudents: vi.fn()
}));

vi.mock('@/api/modules/teacher', () => ({
  default: { getTeachers: vi.fn() },
  getTeachers: vi.fn()
}));

vi.mock('@/api/modules/parent', () => ({
  default: { getParents: vi.fn() },
  getParents: vi.fn()
}));

vi.mock('@/api/modules/class', () => ({
  default: { getClasses: vi.fn() },
  getClasses: vi.fn()
}));

vi.mock('@/api/modules/activity', () => ({
  ActivityModule: { getActivityList: vi.fn() },
  getActivityList: vi.fn()
}));

vi.mock('@/api/modules/enrollment', () => ({
  default: { getEnrollments: vi.fn() },
  getEnrollments: vi.fn()
}));

vi.mock('@/api/modules/customer', () => ({
  CustomerModule: { getCustomers: vi.fn() },
  getCustomers: vi.fn()
}));

vi.mock('@/api/modules/statistics', () => ({
  StatisticsModule: { getStatistics: vi.fn() },
  getStatistics: vi.fn()
}));

vi.mock('@/api/modules/application', () => ({
  default: { getApplications: vi.fn() },
  getApplications: vi.fn()
}));

vi.mock('@/api/modules/ai', () => ({
  default: { getConversations: vi.fn() },
  getConversations: vi.fn()
}));

vi.mock('@/api/modules/chat', () => ({
  default: { getConversations: vi.fn() },
  getConversations: vi.fn()
}));

vi.mock('@/api/modules/advertisement', () => ({
  default: { getAdvertisements: vi.fn() },
  getAdvertisements: vi.fn()
}));

vi.mock('@/api/modules/system', () => ({
  default: { getSettings: vi.fn() },
  getSettings: vi.fn()
}));

// 控制台错误检测变量
let consoleSpy: any

describe('API Index', () => {
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

  it('should export all API modules correctly', () => {
    // Check that all modules are exported
    expect(apiIndex).toBeDefined();

    // Check that the exports are functions or objects
    // TypeScript interfaces don't exist at runtime, only check class and constants
    expect(typeof apiIndex.ApiError).toBe('function');
    expect(typeof apiIndex.API_CONFIG).toBe('object');
  });

  it('should export API configuration constants', () => {
    expect(apiIndex.API_CONFIG).toBeDefined();
    expect(apiIndex.API_CONFIG.TIMEOUT).toBe(10000);
    expect(apiIndex.API_CONFIG.RETRY_COUNT).toBe(3);
    // BASE_URL can be from env or default '/api'
    expect(typeof apiIndex.API_CONFIG.BASE_URL).toBe('string');
  });

  it('should export API error class', () => {
    const error = new apiIndex.ApiError('Test error', 400, { test: 'data' });
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiError');
    expect(error.message).toBe('Test error');
    expect(error.code).toBe(400);
    expect(error.response).toEqual({ test: 'data' });
  });

  it('should export API response interfaces', () => {
    // TypeScript interfaces don't exist at runtime, only available for type checking
    // We can only test that the module exports something
    expect(apiIndex).toBeDefined();
    expect(apiIndex.ApiError).toBeDefined();
    expect(apiIndex.API_CONFIG).toBeDefined();
  });

  it('should have correct API_CONFIG structure', () => {
    const config = apiIndex.API_CONFIG;
    
    expect(config).toHaveProperty('BASE_URL');
    expect(config).toHaveProperty('TIMEOUT');
    expect(config).toHaveProperty('RETRY_COUNT');
    
    expect(typeof config.BASE_URL).toBe('string');
    expect(typeof config.TIMEOUT).toBe('number');
    expect(typeof config.RETRY_COUNT).toBe('number');
  });
});