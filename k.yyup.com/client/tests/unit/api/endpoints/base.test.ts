/**
 * 基础API端点配置测试
 * 测试文件: /home/zhgue/yyupcc/k.yyup.com/client/src/api/endpoints/base.ts
 */

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

describe, it, expect } from 'vitest';
import { API_PREFIX, ApiResponse, PaginationParams, BaseSearchParams } from '@/api/endpoints/base';

describe('基础API端点配置', () => {
  describe('API_PREFIX', () => {
    it('应该定义正确的API前缀', () => {
      expect(API_PREFIX).toBe('');
    });
  });

  describe('ApiResponse接口', () => {
    it('应该符合ApiResponse类型定义', () => {
      const mockResponse: ApiResponse = {
        success: true,
        data: { test: 'data' },
        message: '成功',
        code: 200,
        items: [{ id: 1 }],
        total: 100
      };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.data).toEqual({ test: 'data' });
      expect(mockResponse.message).toBe('成功');
      expect(mockResponse.code).toBe(200);
      expect(mockResponse.items).toEqual([{ id: 1 }]);
      expect(mockResponse.total).toBe(100);
    });

    it('应该支持最小化的ApiResponse', () => {
      const minimalResponse: ApiResponse = {
        success: false,
        data: null,
        message: '错误'
      };

      expect(minimalResponse.success).toBe(false);
      expect(minimalResponse.data).toBeNull();
      expect(minimalResponse.message).toBe('错误');
    });
  });

  describe('PaginationParams接口', () => {
    it('应该符合PaginationParams类型定义', () => {
      const mockParams: PaginationParams = {
        page: 1,
        pageSize: 10,
        total: 100
      };

      expect(mockParams.page).toBe(1);
      expect(mockParams.pageSize).toBe(10);
      expect(mockParams.total).toBe(100);
    });

    it('应该支持必需的分页参数', () => {
      const requiredParams: PaginationParams = {
        page: 2,
        pageSize: 20
      };

      expect(requiredParams.page).toBe(2);
      expect(requiredParams.pageSize).toBe(20);
      expect(requiredParams.total).toBeUndefined();
    });
  });

  describe('BaseSearchParams接口', () => {
    it('应该符合BaseSearchParams类型定义', () => {
      const mockParams: BaseSearchParams = {
        name: '测试',
        status: 1,
        created_at: '2023-01-01',
        updated_at: '2023-01-02'
      };

      expect(mockParams.name).toBe('测试');
      expect(mockParams.status).toBe(1);
      expect(mockParams.created_at).toBe('2023-01-01');
      expect(mockParams.updated_at).toBe('2023-01-02');
    });

    it('应该支持部分搜索参数', () => {
      const partialParams: BaseSearchParams = {
        name: '搜索名称'
      };

      expect(partialParams.name).toBe('搜索名称');
      expect(partialParams.status).toBeUndefined();
      expect(partialParams.created_at).toBeUndefined();
      expect(partialParams.updated_at).toBeUndefined();
    });

    it('应该支持空搜索参数', () => {
      const emptyParams: BaseSearchParams = {};

      expect(Object.keys(emptyParams)).toHaveLength(0);
    });
  });

  describe('类型兼容性', () => {
    it('ApiResponse应该支持泛型', () => {
      interface TestData {
        id: number;
        name: string;
      }

      const typedResponse: ApiResponse<TestData> = {
        success: true,
        data: { id: 1, name: '测试' },
        message: '成功'
      };

      expect(typedResponse.data?.id).toBe(1);
      expect(typedResponse.data?.name).toBe('测试');
    });

    it('应该支持不同类型的分页参数', () => {
      const stringPagination: PaginationParams = {
        page: 1,
        pageSize: 10,
        total: '100' as unknown as number // 测试类型转换
      };

      expect(typeof stringPagination.page).toBe('number');
      expect(typeof stringPagination.pageSize).toBe('number');
    });
  });
});