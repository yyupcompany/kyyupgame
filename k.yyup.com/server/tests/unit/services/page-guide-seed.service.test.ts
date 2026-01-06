/**
 * PageGuideSeedService 单元测试
 * 测试页面说明文档种子数据服务的核心功能
 */

import { PageGuideSeedService } from '../../../src/services/page-guide-seed.service';
import { vi } from 'vitest'
import { PageGuide, PageGuideSection } from '../../../src/models/page-guide.model';

// Mock dependencies
jest.mock('../../../src/models/page-guide.model');
jest.mock('console');

const mockedPageGuide = PageGuide as jest.MockedClass<typeof PageGuide>;
const mockedPageGuideSection = PageGuideSection as jest.MockedClass<typeof PageGuideSection>;
const mockedConsole = console as jest.Mocked<typeof console>;

// 控制台错误检测变量
let consoleSpy: any

describe('PageGuideSeedService', () => {
  let originalConsoleLog: any;
  let originalConsoleError: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Store original console methods
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    
    // Mock console methods
    mockedConsole.log = jest.fn();
    mockedConsole.error = jest.fn();
    
    // Reset mock implementations
    mockedPageGuide.count = jest.fn();
    mockedPageGuide.create = jest.fn();
    mockedPageGuideSection.bulkCreate = jest.fn();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    // Restore original console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('seedPageGuides', () => {
    it('should skip seeding when data already exists', async () => {
      mockedPageGuide.count.mockResolvedValue(5);

      await PageGuideSeedService.seedPageGuides();

      expect(mockedConsole.log).toHaveBeenCalledWith('🌱 开始初始化页面说明文档数据...');
      expect(mockedConsole.log).toHaveBeenCalledWith('✅ 页面说明文档数据已存在，跳过初始化');
      expect(mockedPageGuide.create).not.toHaveBeenCalled();
      expect(mockedPageGuideSection.bulkCreate).not.toHaveBeenCalled();
    });

    it('should seed activity center page guide when no data exists', async () => {
      mockedPageGuide.count.mockResolvedValue(0);
      
      // Mock activity center creation
      const mockActivityCenter = {
        id: 1,
        pagePath: '/centers/activity',
        pageName: '活动中心',
        pageDescription: '欢迎使用婴婴向上智能招生系统！您现在来到的是活动中心页面',
        category: '中心页面',
        importance: 9,
        relatedTables: ['activities', 'activity_registrations'],
        contextPrompt: '用户正在活动中心页面',
        isActive: true
      };
      
      mockedPageGuide.create.mockResolvedValue(mockActivityCenter);
      mockedPageGuideSection.bulkCreate.mockResolvedValue([]);

      await PageGuideSeedService.seedPageGuides();

      expect(mockedConsole.log).toHaveBeenCalledWith('🌱 开始初始化页面说明文档数据...');
      expect(mockedPageGuide.count).toHaveBeenCalled();
      expect(mockedPageGuide.create).toHaveBeenCalledWith(
        expect.objectContaining({
          pagePath: '/centers/activity',
          pageName: '活动中心',
          category: '中心页面',
          importance: 9,
          isActive: true
        })
      );
      
      // Verify activity center sections are created
      expect(mockedPageGuideSection.bulkCreate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            pageGuideId: 1,
            sectionName: '活动中心首页',
            sectionDescription: '实时了解我们当前所有活动的最新看板数据',
            sectionPath: '/centers/activity?tab=overview',
            features: ['活动总数统计', '进行中活动', '报名人数统计'],
            sortOrder: 1,
            isActive: true
          }),
          expect.objectContaining({
            pageGuideId: 1,
            sectionName: '活动管理',
            sectionDescription: '全面的活动管理功能',
            sectionPath: '/centers/activity?tab=activities',
            features: ['活动列表', '活动创建', '活动编辑'],
            sortOrder: 2,
            isActive: true
          })
        ])
      );
    });

    it('should seed enrollment center page guide', async () => {
      mockedPageGuide.count.mockResolvedValue(0);
      
      const mockEnrollmentCenter = { id: 2 };
      mockedPageGuide.create.mockResolvedValue(mockEnrollmentCenter);
      mockedPageGuideSection.bulkCreate.mockResolvedValue([]);

      await PageGuideSeedService.seedPageGuides();

      // Verify enrollment center creation
      expect(mockedPageGuide.create).toHaveBeenCalledWith(
        expect.objectContaining({
          pagePath: '/centers/enrollment',
          pageName: '招生中心',
          category: '中心页面',
          importance: 10,
          isActive: true
        })
      );

      // Verify enrollment center sections
      expect(mockedPageGuideSection.bulkCreate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            pageGuideId: 2,
            sectionName: '招生概览',
            sectionDescription: '招生工作的整体数据概览',
            sectionPath: '/centers/enrollment?tab=overview',
            features: ['招生计划进度', '申请数量统计', '转化率分析'],
            sortOrder: 1,
            isActive: true
          })
        ])
      );
    });

    it('should seed AI center page guide', async () => {
      mockedPageGuide.count.mockResolvedValue(0);
      
      const mockAICenter = { id: 3 };
      mockedPageGuide.create.mockResolvedValue(mockAICenter);
      mockedPageGuideSection.bulkCreate.mockResolvedValue([]);

      await PageGuideSeedService.seedPageGuides();

      // Verify AI center creation
      expect(mockedPageGuide.create).toHaveBeenCalledWith(
        expect.objectContaining({
          pagePath: '/centers/ai',
          pageName: 'AI中心',
          category: '中心页面',
          importance: 8,
          isActive: true
        })
      );

      // Verify AI center sections
      expect(mockedPageGuideSection.bulkCreate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            pageGuideId: 3,
            sectionName: 'AI查询',
            sectionDescription: '智能数据查询功能',
            sectionPath: '/centers/ai?tab=query',
            features: ['自然语言查询', '数据库查询', '查询历史'],
            sortOrder: 1,
            isActive: true
          })
        ])
      );
    });

    it('should seed dashboard overview page guide', async () => {
      mockedPageGuide.count.mockResolvedValue(0);
      
      const mockDashboard = { id: 4 };
      mockedPageGuide.create.mockResolvedValue(mockDashboard);
      mockedPageGuideSection.bulkCreate.mockResolvedValue([]);

      await PageGuideSeedService.seedPageGuides();

      // Verify dashboard creation
      expect(mockedPageGuide.create).toHaveBeenCalledWith(
        expect.objectContaining({
          pagePath: '/dashboard',
          pageName: '数据概览',
          category: '仪表板',
          importance: 9,
          isActive: true
        })
      );
    });

    it('should seed dashboard center page guide', async () => {
      mockedPageGuide.count.mockResolvedValue(0);
      
      const mockDashboardCenter = { id: 5 };
      mockedPageGuide.create.mockResolvedValue(mockDashboardCenter);
      mockedPageGuideSection.bulkCreate.mockResolvedValue([]);

      await PageGuideSeedService.seedPageGuides();

      // Verify dashboard center creation
      expect(mockedPageGuide.create).toHaveBeenCalledWith(
        expect.objectContaining({
          pagePath: '/centers/dashboard',
          pageName: '仪表板中心',
          category: '中心页面',
          importance: 9,
          isActive: true
        })
      );
    });

    it('should seed personnel center page guide', async () => {
      mockedPageGuide.count.mockResolvedValue(0);
      
      const mockPersonnelCenter = { id: 6 };
      mockedPageGuide.create.mockResolvedValue(mockPersonnelCenter);
      mockedPageGuideSection.bulkCreate.mockResolvedValue([]);

      await PageGuideSeedService.seedPageGuides();

      // Verify personnel center creation
      expect(mockedPageGuide.create).toHaveBeenCalledWith(
        expect.objectContaining({
          pagePath: '/centers/personnel',
          pageName: '人事中心',
          category: '中心页面',
          importance: 8,
          isActive: true
        })
      );
    });

    it('should seed marketing center page guide', async () => {
      mockedPageGuide.count.mockResolvedValue(0);
      
      const mockMarketingCenter = { id: 7 };
      mockedPageGuide.create.mockResolvedValue(mockMarketingCenter);
      mockedPageGuideSection.bulkCreate.mockResolvedValue([]);

      await PageGuideSeedService.seedPageGuides();

      // Verify marketing center creation
      expect(mockedPageGuide.create).toHaveBeenCalledWith(
        expect.objectContaining({
          pagePath: '/centers/marketing',
          pageName: '营销中心',
          category: '中心页面',
          importance: 8,
          isActive: true
        })
      );
    });

    it('should seed system management center page guide', async () => {
      mockedPageGuide.count.mockResolvedValue(0);
      
      const mockSystemCenter = { id: 8 };
      mockedPageGuide.create.mockResolvedValue(mockSystemCenter);
      mockedPageGuideSection.bulkCreate.mockResolvedValue([]);

      await PageGuideSeedService.seedPageGuides();

      // Verify system center creation
      expect(mockedPageGuide.create).toHaveBeenCalledWith(
        expect.objectContaining({
          pagePath: '/centers/system',
          pageName: '系统管理中心',
          category: '中心页面',
          importance: 7,
          isActive: true
        })
      );
    });

    it('should seed login page guide', async () => {
      mockedPageGuide.count.mockResolvedValue(0);
      
      const mockLogin = { id: 9 };
      mockedPageGuide.create.mockResolvedValue(mockLogin);
      mockedPageGuideSection.bulkCreate.mockResolvedValue([]);

      await PageGuideSeedService.seedPageGuides();

      // Verify login page creation
      expect(mockedPageGuide.create).toHaveBeenCalledWith(
        expect.objectContaining({
          pagePath: '/login',
          pageName: '用户登录',
          category: '认证页面',
          importance: 9,
          isActive: true
        })
      );
    });

    it('should seed register page guide', async () => {
      mockedPageGuide.count.mockResolvedValue(0);
      
      const mockRegister = { id: 10 };
      mockedPageGuide.create.mockResolvedValue(mockRegister);
      mockedPageGuideSection.bulkCreate.mockResolvedValue([]);

      await PageGuideSeedService.seedPageGuides();

      // Verify register page creation
      expect(mockedPageGuide.create).toHaveBeenCalledWith(
        expect.objectContaining({
          pagePath: '/register',
          pageName: '用户注册',
          category: '认证页面',
          importance: 8,
          isActive: true
        })
      );
    });

    it('should handle seeding errors gracefully', async () => {
      mockedPageGuide.count.mockResolvedValue(0);
      const error = new Error('Database error');
      mockedPageGuide.create.mockRejectedValue(error);

      await expect(PageGuideSeedService.seedPageGuides()).rejects.toThrow(error);

      expect(mockedConsole.error).toHaveBeenCalledWith('❌ 页面说明文档数据初始化失败:', error);
    });

    it('should log completion message when seeding succeeds', async () => {
      mockedPageGuide.count.mockResolvedValue(0);
      mockedPageGuide.create.mockResolvedValue({ id: 1 });
      mockedPageGuideSection.bulkCreate.mockResolvedValue([]);

      await PageGuideSeedService.seedPageGuides();

      expect(mockedConsole.log).toHaveBeenCalledWith('✅ 页面说明文档数据初始化完成');
    });

    it('should create page guides with correct structure', async () => {
      mockedPageGuide.count.mockResolvedValue(0);
      const mockGuide = { id: 1 };
      mockedPageGuide.create.mockResolvedValue(mockGuide);
      mockedPageGuideSection.bulkCreate.mockResolvedValue([]);

      await PageGuideSeedService.seedPageGuides();

      // Verify that all created page guides have required fields
      const createCalls = mockedPageGuide.create.mock.calls;
      createCalls.forEach(call => {
        const guideData = call[0];
        expect(guideData).toHaveProperty('pagePath');
        expect(guideData).toHaveProperty('pageName');
        expect(guideData).toHaveProperty('pageDescription');
        expect(guideData).toHaveProperty('category');
        expect(guideData).toHaveProperty('importance');
        expect(guideData).toHaveProperty('relatedTables');
        expect(guideData).toHaveProperty('contextPrompt');
        expect(guideData).toHaveProperty('isActive');
        expect(typeof guideData.pageDescription).toBe('string');
        expect(typeof guideData.importance).toBe('number');
        expect(Array.isArray(guideData.relatedTables)).toBe(true);
        expect(typeof guideData.isActive).toBe('boolean');
      });
    });

    it('should create page guide sections with correct structure', async () => {
      mockedPageGuide.count.mockResolvedValue(0);
      const mockGuide = { id: 1 };
      mockedPageGuide.create.mockResolvedValue(mockGuide);
      mockedPageGuideSection.bulkCreate.mockResolvedValue([]);

      await PageGuideSeedService.seedPageGuides();

      // Verify that all created sections have required fields
      const bulkCreateCalls = mockedPageGuideSection.bulkCreate.mock.calls;
      bulkCreateCalls.forEach(call => {
        const sections = call[0];
        sections.forEach((section: any) => {
          expect(section).toHaveProperty('pageGuideId');
          expect(section).toHaveProperty('sectionName');
          expect(section).toHaveProperty('sectionDescription');
          expect(section).toHaveProperty('sectionPath');
          expect(section).toHaveProperty('features');
          expect(section).toHaveProperty('sortOrder');
          expect(section).toHaveProperty('isActive');
          expect(Array.isArray(section.features)).toBe(true);
          expect(typeof section.sortOrder).toBe('number');
          expect(typeof section.isActive).toBe('boolean');
        });
      });
    });
  });
});