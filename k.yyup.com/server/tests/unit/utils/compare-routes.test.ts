import axios from 'axios';
import { vi } from 'vitest'
import fs from 'fs';
import path from 'path';
import RouteComparator from '../../../src/utils/compare-routes';

// Mock dependencies
jest.mock('axios');
jest.mock('fs');
jest.mock('path');

const mockAxios = jest.mocked(axios);
const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;

// 控制台错误检测变量
let consoleSpy: any

describe('Route Comparator', () => {
  let routeComparator: RouteComparator;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    routeComparator = new RouteComparator('http://test.com');
    
    // Mock path.join
    mockPath.join.mockImplementation((...args) => args.join('/'));
    
    // Mock console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('constructor', () => {
    it('应该使用提供的后端URL', () => {
      const customUrl = 'http://custom.com';
      const comparator = new RouteComparator(customUrl);
      
      expect(comparator).toBeDefined();
    });

    it('应该使用默认URL当未提供时', () => {
      const originalEnv = process.env.SERVER_URL;
      process.env.SERVER_URL = 'http://env-url.com';
      
      const comparator = new RouteComparator();
      
      expect(comparator).toBeDefined();
      
      process.env.SERVER_URL = originalEnv;
    });
  });

  describe('getBackendRoutes', () => {
    it('应该成功获取后端路由', async () => {
      const mockResponse = {
        data: {
          modules: [
            {
              module: 'auth',
              routes: [
                { method: 'POST', path: '/api/auth/login' },
                { method: 'POST', path: '/api/auth/logout' }
              ]
            },
            {
              module: 'users',
              routes: [
                { method: 'GET', path: '/api/users' },
                { method: 'POST', path: '/api/users' }
              ]
            }
          ]
        }
      };

      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await routeComparator.getBackendRoutes();

      expect(mockAxios.get).toHaveBeenCalledWith('http://test.com/api/list');
      expect(result).toEqual(mockResponse.data.modules);
    });

    it('应该处理API请求失败', async () => {
      const error = new Error('Network error');
      mockAxios.get.mockRejectedValue(error);

      const result = await routeComparator.getBackendRoutes();

      expect(consoleErrorSpy).toHaveBeenCalledWith('获取后端路由失败:', error);
      expect(result).toEqual([]);
    });

    it('应该处理空响应', async () => {
      mockAxios.get.mockResolvedValue({ data: {} });

      const result = await routeComparator.getBackendRoutes();

      expect(result).toBeUndefined();
    });
  });

  describe('extractFrontendRoutes', () => {
    it('应该成功提取前端路由', () => {
      const mockRouterContent = `
        const routes = [
          { path: '/home', component: Home },
          { path: '/about', component: About },
          { path: '/user/:id', component: User }
        ];
      `;

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(mockRouterContent);

      const result = routeComparator.extractFrontendRoutes();

      expect(mockFs.existsSync).toHaveBeenCalled();
      expect(mockFs.readFileSync).toHaveBeenCalled();
      expect(result).toEqual([
        { path: '/home', name: '' },
        { path: '/about', name: '' }
      ]);
    });

    it('应该处理路由文件不存在', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = routeComparator.extractFrontendRoutes();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '前端路由文件不存在:',
        expect.any(String)
      );
      expect(result).toEqual([]);
    });

    it('应该排除参数化路径', () => {
      const mockRouterContent = `
        const routes = [
          { path: '/users', component: Users },
          { path: '/users/:id', component: UserDetail },
          { path: '/posts/:postId/comments/:commentId', component: Comment }
        ];
      `;

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(mockRouterContent);

      const result = routeComparator.extractFrontendRoutes();

      expect(result).toEqual([
        { path: '/users', name: '' }
      ]);
    });

    it('应该处理不同引号类型', () => {
      const mockRouterContent = `
        const routes = [
          { path: '/single', component: Single },
          { path: "/double", component: Double },
          { path: \`/template\`, component: Template }
        ];
      `;

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(mockRouterContent);

      const result = routeComparator.extractFrontendRoutes();

      expect(result).toEqual([
        { path: '/single', name: '' },
        { path: '/double', name: '' },
        { path: '/template', name: '' }
      ]);
    });

    it('应该处理空文件内容', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('');

      const result = routeComparator.extractFrontendRoutes();

      expect(result).toEqual([]);
    });
  });

  describe('suggestFrontendPages', () => {
    it('应该为activities模块建议页面', () => {
      const backendModules = [
        {
          module: 'activities',
          routes: [
            { method: 'GET', path: '/api/activities' },
            { method: 'POST', path: '/api/activities' }
          ]
        }
      ];

      const result = routeComparator.suggestFrontendPages(backendModules);

      expect(result).toContainEqual({ path: '/activity', module: 'activities' });
      expect(result).toContainEqual({ path: '/activity/list', module: 'activities' });
      expect(result).toContainEqual({ path: '/activity/create', module: 'activities' });
    });

    it('应该为enrollment模块建议页面', () => {
      const backendModules = [
        {
          module: 'enrollment',
          routes: [
            { method: 'GET', path: '/api/enrollment/plans' }
          ]
        }
      ];

      const result = routeComparator.suggestFrontendPages(backendModules);

      expect(result).toContainEqual({ path: '/enrollment', module: 'enrollment' });
      expect(result).toContainEqual({ path: '/enrollment/plans', module: 'enrollment' });
      expect(result).toContainEqual({ path: '/enrollment/applications', module: 'enrollment' });
    });

    it('应该为students模块建议页面', () => {
      const backendModules = [
        {
          module: 'students',
          routes: [
            { method: 'GET', path: '/api/students' }
          ]
        }
      ];

      const result = routeComparator.suggestFrontendPages(backendModules);

      expect(result).toContainEqual({ path: '/student', module: 'students' });
      expect(result).toContainEqual({ path: '/student/list', module: 'students' });
    });

    it('应该为teachers模块建议页面', () => {
      const backendModules = [
        {
          module: 'teachers',
          routes: [
            { method: 'GET', path: '/api/teachers' }
          ]
        }
      ];

      const result = routeComparator.suggestFrontendPages(backendModules);

      expect(result).toContainEqual({ path: '/teacher', module: 'teachers' });
      expect(result).toContainEqual({ path: '/teacher/list', module: 'teachers' });
    });

    it('应该为parents模块建议页面', () => {
      const backendModules = [
        {
          module: 'parents',
          routes: [
            { method: 'GET', path: '/api/parents' }
          ]
        }
      ];

      const result = routeComparator.suggestFrontendPages(backendModules);

      expect(result).toContainEqual({ path: '/parent', module: 'parents' });
      expect(result).toContainEqual({ path: '/parent/list', module: 'parents' });
    });

    it('应该为dashboard模块建议页面', () => {
      const backendModules = [
        {
          module: 'dashboard',
          routes: [
            { method: 'GET', path: '/api/dashboard/stats' }
          ]
        }
      ];

      const result = routeComparator.suggestFrontendPages(backendModules);

      expect(result).toContainEqual({ path: '/dashboard', module: 'dashboard' });
    });

    it('应该为ai模块建议页面', () => {
      const backendModules = [
        {
          module: 'ai',
          routes: [
            { method: 'POST', path: '/api/ai/chat' }
          ]
        }
      ];

      const result = routeComparator.suggestFrontendPages(backendModules);

      expect(result).toContainEqual({ path: '/ai', module: 'ai' });
      expect(result).toContainEqual({ path: '/ai/chat', module: 'ai' });
    });

    it('应该处理未知模块', () => {
      const backendModules = [
        {
          module: 'unknown-module',
          routes: [
            { method: 'GET', path: '/api/unknown' }
          ]
        }
      ];

      const result = routeComparator.suggestFrontendPages(backendModules);

      expect(result).toEqual([]);
    });

    it('应该处理空模块列表', () => {
      const result = routeComparator.suggestFrontendPages([]);

      expect(result).toEqual([]);
    });
  });

  describe('generateReport', () => {
    beforeEach(() => {
      mockFs.writeFileSync.mockImplementation(() => {})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('应该生成完整的报告', () => {
      const backendModules = [
        {
          module: 'auth',
          routes: [
            { method: 'POST', path: '/api/auth/login' },
            { method: 'GET', path: '/api/auth/profile' }
          ]
        }
      ];

      const frontendRoutes = [
        { path: '/login', name: 'Login' },
        { path: '/profile', name: 'Profile' }
      ];

      const suggestions = [
        { path: '/auth', module: 'auth' }
      ];

      routeComparator.generateReport(backendModules, frontendRoutes, suggestions);

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      
      const writeCall = mockFs.writeFileSync.mock.calls[0];
      const reportContent = writeCall[1] as string;
      
      expect(reportContent).toContain('# 前后端路由对比报告');
      expect(reportContent).toContain('## 统计概览');
      expect(reportContent).toContain('后端API模块数: 1');
      expect(reportContent).toContain('后端API总数: 2');
      expect(reportContent).toContain('前端路由数: 2');
      expect(reportContent).toContain('## 后端API模块详情');
      expect(reportContent).toContain('### auth');
      expect(reportContent).toContain('## 建议的前端页面');
      expect(reportContent).toContain('## 前端现有路由');
    });

    it('应该处理大量前端路由', () => {
      const backendModules = [];
      const frontendRoutes = Array.from({ length: 60 }, (_, i) => ({
        path: `/route-${i}`,
        name: `Route${i}`
      }));
      const suggestions = [];

      routeComparator.generateReport(backendModules, frontendRoutes, suggestions);

      const writeCall = mockFs.writeFileSync.mock.calls[0];
      const reportContent = writeCall[1] as string;
      
      expect(reportContent).toContain('... 还有 10 个路由');
    });

    it('应该记录报告生成完成', () => {
      routeComparator.generateReport([], [], []);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📄 报告已生成:')
      );
    });
  });

  describe('compareRoutes', () => {
    beforeEach(() => {
      // Mock all dependencies for compareRoutes
      mockAxios.get.mockResolvedValue({
        data: {
          modules: [
            {
              module: 'test',
              routes: [{ method: 'GET', path: '/api/test' }]
            }
          ]
        }
      })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('{ path: "/test", component: Test }');
      mockFs.writeFileSync.mockImplementation(() => {});
    });

    it('应该完成完整的路由比较流程', async () => {
      await routeComparator.compareRoutes();

      expect(consoleLogSpy).toHaveBeenCalledWith('🔍 开始比较前后端路由...\n');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('📊 统计信息:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('📦 后端API模块列表:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('🔍 分析可能需要的前端页面:'));
      expect(mockFs.writeFileSync).toHaveBeenCalled();
    });
  });
});
