import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { checkApiAvailability, generateApiReport } from '../../../src/utils/api-checker';

// Mock dependencies
jest.mock('axios');
jest.mock('fs');
jest.mock('path');

const mockAxios = jest.mocked(axios);
const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;

describe('API Checker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockPath.join.mockImplementation((...args) => args.join('/'));
    mockFs.existsSync.mockReturnValue(true);
    mockFs.mkdirSync.mockImplementation(() => undefined);
    mockFs.writeFileSync.mockImplementation(() => undefined);
    
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('checkApiAvailability', () => {
    it('应该检测API可用性并返回结果', async () => {
      // Mock successful API responses
      mockAxios.mockResolvedValue({ status: 200 });

      const results = await checkApiAvailability('http://test.com');

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      // Check first result structure
      const firstResult = results[0];
      expect(firstResult).toHaveProperty('path');
      expect(firstResult).toHaveProperty('method');
      expect(firstResult).toHaveProperty('available');
      expect(firstResult.available).toBe(true);
    });

    it('应该处理API不可用的情况', async () => {
      // Mock API error
      mockAxios.mockRejectedValue(new Error('Network Error'));

      const results = await checkApiAvailability('http://test.com');

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      
      // All results should be unavailable
      results.forEach(result => {
        expect(result.available).toBe(false);
        expect(result.error).toBe('Network Error');
      });
    });

    it('应该使用默认baseUrl当未提供时', async () => {
      mockAxios.mockResolvedValue({ status: 200 });
      
      const originalEnv = process.env.SERVER_URL;
      process.env.SERVER_URL = 'http://default.com';

      await checkApiAvailability();

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('http://default.com')
        })
      );

      process.env.SERVER_URL = originalEnv;
    });

    it('应该替换路径参数占位符', async () => {
      mockAxios.mockResolvedValue({ status: 200 });

      await checkApiAvailability('http://test.com');

      // Check that path parameters are replaced
      const calls = mockAxios.mock.calls;
      const urlsWithParams = calls.filter(call => 
        call[0].url.includes('/1') // Parameters should be replaced with '1'
      );
      
      expect(urlsWithParams.length).toBeGreaterThan(0);
    });

    it('应该为GET请求使用OPTIONS方法', async () => {
      mockAxios.mockResolvedValue({ status: 200 });

      await checkApiAvailability('http://test.com');

      // Check that GET requests use OPTIONS method
      const optionsCalls = mockAxios.mock.calls.filter(call => 
        call[0].method === 'OPTIONS'
      );
      
      expect(optionsCalls.length).toBeGreaterThan(0);
    });

    it('应该为非GET请求使用HEAD方法', async () => {
      mockAxios.mockResolvedValue({ status: 200 });

      await checkApiAvailability('http://test.com');

      // Check that POST requests use HEAD method
      const headCalls = mockAxios.mock.calls.filter(call => 
        call[0].method === 'HEAD'
      );
      
      expect(headCalls.length).toBeGreaterThan(0);
    });

    it('应该设置超时时间', async () => {
      mockAxios.mockResolvedValue({ status: 200 });

      await checkApiAvailability('http://test.com');

      // Check that timeout is set
      mockAxios.mock.calls.forEach(call => {
        expect(call[0].timeout).toBe(5000);
      });
    });

    it('应该处理非Error类型的异常', async () => {
      // Mock non-Error exception
      mockAxios.mockRejectedValue('String error');

      const results = await checkApiAvailability('http://test.com');

      results.forEach(result => {
        expect(result.available).toBe(false);
        expect(result.error).toBe('String error');
      });
    });

    it('应该记录成功的API检测', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockAxios.mockResolvedValue({ status: 200 });

      await checkApiAvailability('http://test.com');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅')
      );
    });

    it('应该记录失败的API检测', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockAxios.mockRejectedValue(new Error('Test error'));

      await checkApiAvailability('http://test.com');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌')
      );
    });
  });

  describe('generateApiReport', () => {
    beforeEach(() => {
      mockAxios.mockResolvedValue({ status: 200 });
    });

    it('应该生成API报告', async () => {
      await generateApiReport('http://test.com');

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      
      const writeCall = mockFs.writeFileSync.mock.calls[0];
      const reportContent = writeCall[1] as string;
      
      expect(reportContent).toContain('# API可用性检测报告');
      expect(reportContent).toContain('## 总体情况');
      expect(reportContent).toContain('总API数量');
      expect(reportContent).toContain('可用API数量');
      expect(reportContent).toContain('可用率');
    });

    it('应该创建报告目录如果不存在', async () => {
      mockFs.existsSync.mockReturnValue(false);

      await generateApiReport('http://test.com');

      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.any(String),
        { recursive: true }
      );
    });

    it('应该按类别组织报告内容', async () => {
      await generateApiReport('http://test.com');

      const writeCall = mockFs.writeFileSync.mock.calls[0];
      const reportContent = writeCall[1] as string;
      
      // Should contain category sections
      expect(reportContent).toContain('## Auth模块');
      expect(reportContent).toContain('## Enrollment模块');
      expect(reportContent).toContain('## Activity模块');
      expect(reportContent).toContain('## Marketing模块');
      expect(reportContent).toContain('## System模块');
    });

    it('应该包含表格格式的详细信息', async () => {
      await generateApiReport('http://test.com');

      const writeCall = mockFs.writeFileSync.mock.calls[0];
      const reportContent = writeCall[1] as string;
      
      expect(reportContent).toContain('| API路径 | 请求方法 | 状态 | 错误信息 |');
      expect(reportContent).toContain('|---------|----------|------|----------|');
    });

    it('应该计算正确的可用率', async () => {
      // Mock mixed results
      let callCount = 0;
      mockAxios.mockImplementation(() => {
        callCount++;
        if (callCount <= 5) {
          return Promise.resolve({ status: 200 });
        } else {
          return Promise.reject(new Error('Test error'));
        }
      });

      await generateApiReport('http://test.com');

      const writeCall = mockFs.writeFileSync.mock.calls[0];
      const reportContent = writeCall[1] as string;
      
      expect(reportContent).toContain('可用率:');
    });

    it('应该记录报告生成完成', async () => {
      const consoleSpy = jest.spyOn(console, 'log');

      await generateApiReport('http://test.com');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('API可用性报告已生成')
      );
    });

    it('应该使用默认baseUrl当未提供时', async () => {
      const originalEnv = process.env.SERVER_URL;
      process.env.SERVER_URL = 'http://env-default.com';

      await generateApiReport();

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('http://env-default.com')
        })
      );

      process.env.SERVER_URL = originalEnv;
    });

    it('应该处理API检测失败的情况', async () => {
      mockAxios.mockRejectedValue(new Error('All APIs failed'));

      await generateApiReport('http://test.com');

      const writeCall = mockFs.writeFileSync.mock.calls[0];
      const reportContent = writeCall[1] as string;
      
      expect(reportContent).toContain('❌ 不可用');
      expect(reportContent).toContain('All APIs failed');
    });
  });
});
