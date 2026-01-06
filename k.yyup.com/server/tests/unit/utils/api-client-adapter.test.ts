import {
  ensureArray,
  normalizePaginationResponse,
  parseApiResponse,
  processApiResponse,
  formatPaginationResponse,
  createResponseInterceptor,
  ApiAdapter
} from '../../../src/utils/api-client-adapter';
import { vi } from 'vitest'


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

describe('API Client Adapter', () => {
  describe('ensureArray', () => {
    it('应该返回空数组当输入为null', () => {
      expect(ensureArray(null)).toEqual([]);
    });

    it('应该返回空数组当输入为undefined', () => {
      expect(ensureArray(undefined)).toEqual([]);
    });

    it('应该返回原数组当输入已经是数组', () => {
      const input = [1, 2, 3];
      expect(ensureArray(input)).toEqual([1, 2, 3]);
      expect(ensureArray(input)).toBe(input);
    });

    it('应该将单个对象包装成数组', () => {
      const input = { id: 1, name: 'test' };
      expect(ensureArray(input)).toEqual([{ id: 1, name: 'test' }]);
    });

    it('应该将原始值包装成数组', () => {
      expect(ensureArray('test')).toEqual(['test']);
      expect(ensureArray(123)).toEqual([123]);
      expect(ensureArray(true)).toEqual([true]);
    });
  });

  describe('normalizePaginationResponse', () => {
    it('应该返回已标准化的响应', () => {
      const input = {
        total: 100,
        page: 2,
        pageSize: 10,
        list: [{ id: 1 }, { id: 2 }]
      };

      const result = normalizePaginationResponse(input);
      expect(result).toEqual(input);
    });

    it('应该处理items字段格式', () => {
      const input = {
        totalItems: 50,
        currentPage: 3,
        pageSize: 15,
        items: [{ id: 1 }]
      };

      const result = normalizePaginationResponse(input);
      expect(result).toEqual({
        total: 50,
        page: 3,
        pageSize: 15,
        list: [{ id: 1 }]
      });
    });

    it('应该处理data字段格式', () => {
      const input = {
        totalCount: 25,
        currentPage: 1,
        size: 20,
        data: [{ id: 1 }, { id: 2 }]
      };

      const result = normalizePaginationResponse(input);
      expect(result).toEqual({
        total: 25,
        page: 1,
        pageSize: 20,
        list: [{ id: 1 }, { id: 2 }]
      });
    });

    it('应该处理纯数组响应', () => {
      const input = [{ id: 1 }, { id: 2 }, { id: 3 }];

      const result = normalizePaginationResponse(input);
      expect(result).toEqual({
        total: 3,
        page: 1,
        pageSize: 3,
        list: [{ id: 1 }, { id: 2 }, { id: 3 }]
      });
    });

    it('应该处理单个对象响应', () => {
      const input = { id: 1, name: 'test' };

      const result = normalizePaginationResponse(input);
      expect(result).toEqual({
        total: 1,
        page: 1,
        pageSize: 1,
        list: [{ id: 1, name: 'test' }]
      });
    });

    it('应该处理null/undefined输入', () => {
      expect(normalizePaginationResponse(null)).toEqual({
        total: 0,
        page: 1,
        pageSize: 10,
        list: []
      });

      expect(normalizePaginationResponse(undefined)).toEqual({
        total: 0,
        page: 1,
        pageSize: 10,
        list: []
      });
    });

    it('应该使用默认值当字段缺失', () => {
      const input = { items: [{ id: 1 }] };

      const result = normalizePaginationResponse(input);
      expect(result).toEqual({
        total: 0,
        page: 1,
        pageSize: 10,
        list: [{ id: 1 }]
      });
    });

    it('应该确保list字段为数组', () => {
      const input = {
        total: 1,
        page: 1,
        pageSize: 1,
        list: { id: 1 }
      };

      const result = normalizePaginationResponse(input);
      expect(result.list).toEqual([{ id: 1 }]);
    });
  });

  describe('parseApiResponse', () => {
    it('应该解析成功响应的数据', () => {
      const input = {
        status: 'success',
        data: { id: 1, name: 'test' }
      };

      const result = parseApiResponse(input);
      expect(result).toEqual({ id: 1, name: 'test' });
    });

    it('应该解析成功响应的数组数据', () => {
      const input = {
        status: 'success',
        data: [{ id: 1 }, { id: 2 }]
      };

      const result = parseApiResponse(input);
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('应该解析成功响应的分页数据', () => {
      const input = {
        status: 'success',
        data: {
          total: 10,
          page: 1,
          list: [{ id: 1 }]
        }
      };

      const result = parseApiResponse(input);
      expect(result).toEqual({
        total: 10,
        page: 1,
        pageSize: 10,
        list: [{ id: 1 }]
      });
    });

    it('应该抛出错误当响应状态为error', () => {
      const input = {
        status: 'error',
        message: 'Something went wrong'
      };

      expect(() => parseApiResponse(input)).toThrow('Something went wrong');
    });

    it('应该抛出默认错误消息当错误响应无消息', () => {
      const input = {
        status: 'error'
      };

      expect(() => parseApiResponse(input)).toThrow('请求失败');
    });

    it('应该返回原始响应当不是标准格式', () => {
      const input = { customField: 'value' };

      const result = parseApiResponse(input);
      expect(result).toBe(input);
    });
  });

  describe('processApiResponse', () => {
    it('应该返回原值当输入为空', () => {
      expect(processApiResponse(null)).toBe(null);
      expect(processApiResponse(undefined)).toBe(undefined);
    });

    it('应该返回原值当输入不是对象', () => {
      expect(processApiResponse('string')).toBe('string');
      expect(processApiResponse(123)).toBe(123);
      expect(processApiResponse(true)).toBe(true);
    });

    it('应该处理data字段中的list', () => {
      const input = {
        data: {
          list: { id: 1 }
        }
      };

      const result = processApiResponse(input);
      expect(result.data.list).toEqual([{ id: 1 }]);
    });

    it('应该处理顶层的list字段', () => {
      const input = {
        data: { some: 'value' },
        list: { id: 1 }
      };

      const result = processApiResponse(input);
      expect(result.list).toEqual([{ id: 1 }]);
    });

    it('应该克隆对象避免修改原始对象', () => {
      const input = {
        data: {
          list: [{ id: 1 }]
        }
      };

      const result = processApiResponse(input);
      expect(result).not.toBe(input);
      expect(result.data).not.toBe(input.data);
    });
  });

  describe('formatPaginationResponse', () => {
    it('应该格式化分页响应', () => {
      const result = formatPaginationResponse(100, 2, 10, [{ id: 1 }, { id: 2 }]);

      expect(result).toEqual({
        total: 100,
        page: 2,
        pageSize: 10,
        list: [{ id: 1 }, { id: 2 }]
      });
    });

    it('应该将单个对象转换为数组', () => {
      const result = formatPaginationResponse(1, 1, 1, { id: 1 });

      expect(result).toEqual({
        total: 1,
        page: 1,
        pageSize: 1,
        list: [{ id: 1 }]
      });
    });

    it('应该处理null/undefined列表', () => {
      const result = formatPaginationResponse(0, 1, 10, null);

      expect(result).toEqual({
        total: 0,
        page: 1,
        pageSize: 10,
        list: []
      });
    });
  });

  describe('createResponseInterceptor', () => {
    let mockAxiosInstance: any;

    beforeEach(() => {
      mockAxiosInstance = {
        interceptors: {
          response: {
            use: jest.fn().mockReturnValue('interceptor-id'),
            eject: jest.fn()
          }
        }
      };
    });

    it('应该创建响应拦截器', () => {
      const removeInterceptor = createResponseInterceptor(mockAxiosInstance);

      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
      expect(typeof removeInterceptor).toBe('function');
    });

    it('应该处理成功响应', () => {
      createResponseInterceptor(mockAxiosInstance);

      const [successHandler] = mockAxiosInstance.interceptors.response.use.mock.calls[0];
      
      const response = {
        data: {
          data: {
            list: { id: 1 }
          }
        }
      };

      const result = successHandler(response);
      expect(result.data.data.list).toEqual([{ id: 1 }]);
    });

    it('应该处理错误响应', () => {
      createResponseInterceptor(mockAxiosInstance);

      const [, errorHandler] = mockAxiosInstance.interceptors.response.use.mock.calls[0];
      
      const error = new Error('Network error');
      
      expect(errorHandler(error)).rejects.toBe(error);
    });

    it('应该能够移除拦截器', () => {
      const removeInterceptor = createResponseInterceptor(mockAxiosInstance);

      removeInterceptor();

      expect(mockAxiosInstance.interceptors.response.eject).toHaveBeenCalledWith('interceptor-id');
    });
  });

  describe('ApiAdapter', () => {
    it('应该包含所有适配器功能', () => {
      expect(ApiAdapter.ensureArray).toBe(ensureArray);
      expect(ApiAdapter.processApiResponse).toBe(processApiResponse);
      expect(ApiAdapter.formatPaginationResponse).toBe(formatPaginationResponse);
      expect(ApiAdapter.createResponseInterceptor).toBe(createResponseInterceptor);
    });
  });
});
