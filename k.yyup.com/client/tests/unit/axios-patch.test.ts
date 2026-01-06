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
import axios from '@/axios-patch';

// Mock fetch globally
global.fetch = vi.fn();

describe('axios-patch.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('axios function', () => {
    it('should make GET request successfully', async () => {
      const mockResponse = {
        data: { message: 'success' },
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        config: {},
        request: {}
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse.data)
      });

      const config = {
        method: 'get',
        url: '/api/test',
        headers: { 'Authorization': 'Bearer token' }
      };

      const result = await axios(config);

      expect(fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token'
        }
      });

      expect(result).toEqual({
        data: mockResponse.data,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: config,
        request: {}
      });
    });

    it('should make POST request with JSON data', async () => {
      const mockResponse = {
        data: { id: 1, name: 'test' },
        status: 201,
        statusText: 'Created',
        headers: new Headers({ 'content-type': 'application/json' }),
        config: {},
        request: {}
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse.data)
      });

      const config = {
        method: 'post',
        url: '/api/users',
        data: { name: 'test', email: 'test@example.com' },
        headers: { 'Authorization': 'Bearer token' }
      };

      const result = await axios(config);

      expect(fetch).toHaveBeenCalledWith('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token'
        },
        body: JSON.stringify({ name: 'test', email: 'test@example.com' })
      });

      expect(result).toEqual({
        data: mockResponse.data,
        status: 201,
        statusText: 'Created',
        headers: { 'content-type': 'application/json' },
        config: config,
        request: {}
      });
    });

    it('should make POST request with FormData', async () => {
      const mockResponse = {
        data: { id: 1, fileName: 'test.jpg' },
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        config: {},
        request: {}
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse.data)
      });

      const formData = new FormData();
      formData.append('file', new File(['content'], 'test.jpg'));

      const config = {
        method: 'post',
        url: '/api/upload',
        data: formData,
        headers: { 'Authorization': 'Bearer token' }
      };

      const result = await axios(config);

      expect(fetch).toHaveBeenCalledWith('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer token'
        },
        body: formData
      });

      expect(result).toEqual({
        data: mockResponse.data,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: config,
        request: {}
      });
    });

    it('should make PUT request', async () => {
      const mockResponse = {
        data: { id: 1, name: 'updated' },
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        config: {},
        request: {}
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse.data)
      });

      const config = {
        method: 'put',
        url: '/api/users/1',
        data: { name: 'updated' }
      };

      const result = await axios(config);

      expect(fetch).toHaveBeenCalledWith('/api/users/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: 'updated' })
      });

      expect(result).toEqual({
        data: mockResponse.data,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: config,
        request: {}
      });
    });

    it('should make DELETE request', async () => {
      const mockResponse = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        config: {},
        request: {}
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse.data)
      });

      const config = {
        method: 'delete',
        url: '/api/users/1'
      };

      const result = await axios(config);

      expect(fetch).toHaveBeenCalledWith('/api/users/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(result).toEqual({
        data: mockResponse.data,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: config,
        request: {}
      });
    });

    it('should handle HTTP errors', async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ message: 'Not found' })
      });

      const config = {
        method: 'get',
        url: '/api/nonexistent'
      };

      await expect(axios(config)).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      (fetch as any).mockRejectedValue(new Error('Network error'));

      const config = {
        method: 'get',
        url: '/api/test'
      };

      await expect(axios(config)).rejects.toThrow('Network error');
    });

    it('should handle non-JSON responses', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: () => Promise.resolve('Plain text response')
      });

      const config = {
        method: 'get',
        url: '/api/text'
      };

      const result = await axios(config);

      expect(result.data).toBe('Plain text response');
    });

    it('should handle empty responses', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        status: 204,
        statusText: 'No Content',
        headers: new Headers()
      });

      const config = {
        method: 'delete',
        url: '/api/users/1'
      };

      const result = await axios(config);

      expect(result.data).toBeNull();
      expect(result.status).toBe(204);
    });

    it('should handle default method (GET)', async () => {
      const mockResponse = {
        data: { message: 'success' },
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        config: {},
        request: {}
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse.data)
      });

      const config = {
        url: '/api/test'
      };

      const result = await axios(config);

      expect(fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(result).toEqual({
        data: mockResponse.data,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: config,
        request: {}
      });
    });

    it('should handle timeout', async () => {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 100);
      });

      (fetch as any).mockReturnValue(timeoutPromise);

      const config = {
        url: '/api/test',
        timeout: 50
      };

      await expect(axios(config)).rejects.toThrow();
    });
  });

  describe('axios defaults', () => {
    it('should have default configuration', () => {
      expect(axios.defaults).toBeDefined();
      expect(typeof axios.defaults).toBe('object');
    });

    it('should allow setting default headers', () => {
      axios.defaults.headers.common['Authorization'] = 'Bearer default-token';
      
      expect(axios.defaults.headers.common['Authorization']).toBe('Bearer default-token');
    });

    it('should allow setting default timeout', () => {
      axios.defaults.timeout = 5000;
      
      expect(axios.defaults.timeout).toBe(5000);
    });
  });

  describe('axios interceptors', () => {
    it('should have request interceptors', () => {
      expect(axios.interceptors).toBeDefined();
      expect(axios.interceptors.request).toBeDefined();
      expect(typeof axios.interceptors.request.use).toBe('function');
      expect(typeof axios.interceptors.request.eject).toBe('function');
    });

    it('should have response interceptors', () => {
      expect(axios.interceptors.response).toBeDefined();
      expect(typeof axios.interceptors.response.use).toBe('function');
      expect(typeof axios.interceptors.response.eject).toBe('function');
    });

    it('should allow adding request interceptor', () => {
      const interceptorId = axios.interceptors.request.use(
        (config) => {
          config.headers = config.headers || {};
          config.headers['X-Custom'] = 'value';
          return config;
        }
      );

      expect(typeof interceptorId).toBe('number');
    });

    it('should allow adding response interceptor', () => {
      const interceptorId = axios.interceptors.response.use(
        (response) => {
          response.data.processed = true;
          return response;
        }
      );

      expect(typeof interceptorId).toBe('number');
    });

    it('should allow ejecting interceptors', () => {
      const interceptorId = axios.interceptors.request.use((config) => config);
      
      expect(() => {
        axios.interceptors.request.eject(interceptorId);
      }).not.toThrow();
    });
  });

  describe('axios utility methods', () => {
    it('should have get method', () => {
      expect(typeof axios.get).toBe('function');
    });

    it('should have post method', () => {
      expect(typeof axios.post).toBe('function');
    });

    it('should have put method', () => {
      expect(typeof axios.put).toBe('function');
    });

    it('should have delete method', () => {
      expect(typeof axios.delete).toBe('function');
    });

    it('should have head method', () => {
      expect(typeof axios.head).toBe('function');
    });

    it('should have options method', () => {
      expect(typeof axios.options).toBe('function');
    });

    it('should have patch method', () => {
      expect(typeof axios.patch).toBe('function');
    });
  });
});