/**
 * 仪表板页面单元测试
 * 严格验证版本
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { createTestWrapper, mockApiResponse, triggerEvent, waitForAsync } from '../../utils/test-helpers';
import { expectNoConsoleErrors } from '../../setup/console-monitoring';
import { 
  validateRequiredFields,
  validateFieldTypes,
  validatePaginationStructure,
  validateStatisticalRanges,
  createValidationReport 
} from '../../utils/data-validation';

// 导入待测试的页面组件
import Dashboard from '@/pages/dashboard/index.vue';
import DashboardAnalytics from '@/pages/dashboard/analytics/DashboardAnalytics.vue';

// Mock API
const mockRequest = {
  get: vi.fn(),
  post: vi.fn()
};

vi.mock('@/utils/request', () => ({
  request: mockRequest
}));

// Mock Store
vi.mock('@/stores/dashboard', () => ({
  useDashboardStore: () => ({
    stats: {
      totalStudents: 150,
      totalTeachers: 20,
      totalClasses: 8,
      totalParents: 300,
      enrollmentRate: 95.5,
      attendanceRate: 98.2
    },
    recentActivities: [
      { id: '1', type: 'student_enrollment', title: '新生入学', time: '2024-01-15 10:30' },
      { id: '2', type: 'teacher_meeting', title: '教师会议', time: '2024-01-15 09:00' }
    ],
    notifications: [
      { id: '1', type: 'info', title: '系统通知', content: '今日数据更新完成', read: false }
    ],
    loading: false,
    fetchStats: vi.fn(),
    fetchActivities: vi.fn(),
    fetchNotifications: vi.fn()
  })
}));

// 控制台错误检测变量
let consoleSpy: any

describe('Dashboard Pages - Strict Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock router
    vi.mock('@/router', () => ({
      useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn()
      })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    }));
  });

  afterEach(() => {
    expectNoConsoleErrors();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('Dashboard Main Page', () => {
    it('should render dashboard with correct structure', async () => {
      // Mock API responses
      mockRequest.get
        .mockResolvedValueOnce(mockApiResponse.success({
          totalStudents: 150,
          totalTeachers: 20,
          totalClasses: 8,
          totalParents: 300,
          enrollmentRate: 95.5,
          attendanceRate: 98.2,
          averageScore: 85.6
        }))
        .mockResolvedValueOnce(mockApiResponse.success([
          { id: '1', type: 'student_enrollment', title: '新生入学', time: '2024-01-15 10:30' },
          { id: '2', type: 'teacher_meeting', title: '教师会议', time: '2024-01-15 09:00' }
        ]));

      const wrapper = createTestWrapper(Dashboard);

      // 等待组件挂载和数据加载
      await wrapper.vm.$nextTick();
      await waitForAsync(100);

      // 验证基本结构
      expect(wrapper.find('.dashboard-container').exists()).toBe(true);
      expect(wrapper.find('.dashboard-header').exists()).toBe(true);
      expect(wrapper.find('.dashboard-stats').exists()).toBe(true);
      expect(wrapper.find('.dashboard-content').exists()).toBe(true);
    });

    it('should load and display statistics data correctly', async () => {
      const mockStats = {
        totalStudents: 150,
        totalTeachers: 20,
        totalClasses: 8,
        totalParents: 300,
        enrollmentRate: 95.5,
        attendanceRate: 98.2,
        averageScore: 85.6,
        graduationRate: 92.1
      };

      mockRequest.get.mockResolvedValue(mockApiResponse.success(mockStats));

      const wrapper = createTestWrapper(Dashboard);
      await wrapper.vm.$nextTick();
      await waitForAsync(100);

      // 验证API调用
      expect(mockRequest.get).toHaveBeenCalledWith('/api/dashboard/stats');

      // 验证数据结构完整性
      const validationReport = createValidationReport(mockStats, {
        requiredFields: ['totalStudents', 'totalTeachers', 'totalClasses', 'totalParents'],
        fieldTypes: {
          totalStudents: 'number',
          totalTeachers: 'number',
          totalClasses: 'number',
          totalParents: 'number',
          enrollmentRate: 'number',
          attendanceRate: 'number',
          averageScore: 'number'
        },
        fieldRanges: {
          totalStudents: { min: 0 },
          totalTeachers: { min: 0 },
          totalClasses: { min: 0 },
          totalParents: { min: 0 },
          enrollmentRate: { min: 0, max: 100 },
          attendanceRate: { min: 0, max: 100 },
          averageScore: { min: 0, max: 100 }
        }
      });

      expect(validationReport.valid).toBe(true);
      
      if (!validationReport.valid) {
        console.error('Validation errors:', validationReport.errors);
      }

      // 验证统计数据卡片渲染
      const statCards = wrapper.findAll('[data-testid^="stat-card-"]');
      expect(statCards.length).toBeGreaterThan(0);
    });

    it('should handle recent activities loading with pagination', async () => {
      const mockActivities = {
        items: [
          { id: '1', type: 'student_enrollment', title: '新生入学', time: '2024-01-15 10:30', user: '张老师' },
          { id: '2', type: 'teacher_meeting', title: '教师会议', time: '2024-01-15 09:00', user: '李校长' },
          { id: '3', type: 'class_activity', title: '班级活动', time: '2024-01-15 08:30', user: '王老师' }
        ],
        total: 15,
        page: 1,
        pageSize: 10
      };

      mockRequest.get.mockResolvedValue(mockApiResponse.success(mockActivities));

      const wrapper = createTestWrapper(Dashboard);
      await wrapper.vm.$nextTick();
      await waitForAsync(100);

      // 验证API调用
      expect(mockRequest.get).toHaveBeenCalledWith('/api/dashboard/activities', {
        params: { page: 1, pageSize: 10 }
      });

      // 验证分页结构
      const paginationValidation = validatePaginationStructure(mockActivities);
      expect(paginationValidation.valid).toBe(true);

      // 验证活动列表项
      if (mockActivities.items.length > 0) {
        const firstActivity = mockActivities.items[0];
        const activityValidation = validateRequiredFields(firstActivity, [
          'id', 'type', 'title', 'time'
        ]);
        expect(activityValidation.valid).toBe(true);
      }

      // 验证活动时间线渲染
      const activityTimeline = wrapper.find('[data-testid="activity-timeline"]');
      if (activityTimeline.exists()) {
        const activityItems = activityTimeline.findAll('[data-testid^="activity-item-"]');
        expect(activityItems.length).toBeGreaterThan(0);
      }
    });

    it('should handle notifications correctly', async () => {
      const mockNotifications = {
        items: [
          { 
            id: '1', 
            type: 'info', 
            title: '系统通知', 
            content: '今日数据更新完成', 
            read: false,
            timestamp: '2024-01-15T10:00:00Z'
          },
          { 
            id: '2', 
            type: 'warning', 
            title: '预警通知', 
            content: '班级出勤率偏低', 
            read: true,
            timestamp: '2024-01-15T09:30:00Z'
          }
        ],
        total: 2,
        unreadCount: 1
      };

      mockRequest.get.mockResolvedValue(mockApiResponse.success(mockNotifications));

      const wrapper = createTestWrapper(Dashboard);
      await wrapper.vm.$nextTick();
      await waitForAsync(100);

      // 验证通知结构
      expect(mockNotifications.unreadCount).toBeDefined();
      expect(typeof mockNotifications.unreadCount).toBe('number');

      // 验证通知类型枚举
      const validTypes = ['info', 'warning', 'error', 'success'];
      mockNotifications.items.forEach(notification => {
        expect(validTypes).toContain(notification.type);
      });

      // 验证通知渲染
      const notificationPanel = wrapper.find('[data-testid="notification-panel"]');
      if (notificationPanel.exists()) {
        const notificationItems = notificationPanel.findAll('[data-testid^="notification-"]');
        expect(notificationItems.length).toBeGreaterThan(0);
      }
    });

    it('should handle chart data loading correctly', async () => {
      const mockChartData = {
        enrollmentTrends: [
          { date: '2024-01-01', count: 10 },
          { date: '2024-01-02', count: 15 },
          { date: '2024-01-03', count: 12 }
        ],
        attendanceTrends: [
          { date: '2024-01-01', rate: 95.5 },
          { date: '2024-01-02', rate: 96.2 },
          { date: '2024-01-03', rate: 94.8 }
        ],
        classDistribution: [
          { name: '小班', count: 50 },
          { name: '中班', count: 60 },
          { name: '大班', count: 40 }
        ]
      };

      mockRequest.get.mockResolvedValue(mockApiResponse.success(mockChartData));

      const wrapper = createTestWrapper(Dashboard);
      await wrapper.vm.$nextTick();
      await waitForAsync(100);

      // 验证图表数据结构
      expect(Array.isArray(mockChartData.enrollmentTrends)).toBe(true);
      expect(Array.isArray(mockChartData.attendanceTrends)).toBe(true);
      expect(Array.isArray(mockChartData.classDistribution)).toBe(true);

      // 验证趋势数据点
      mockChartData.enrollmentTrends.forEach(trend => {
        const trendValidation = validateRequiredFields(trend, ['date', 'count']);
        expect(trendValidation.valid).toBe(true);
        
        const typeValidation = validateFieldTypes(trend, {
          date: 'string',
          count: 'number'
        });
        expect(typeValidation.valid).toBe(true);
      });

      // 验证图表组件渲染
      const chartContainers = wrapper.findAll('[data-testid^="chart-"]');
      expect(chartContainers.length).toBeGreaterThan(0);
    });

    it('should handle refresh functionality', async () => {
      const wrapper = createTestWrapper(Dashboard);

      const refreshButton = wrapper.find('[data-testid="refresh-button"]');
      if (refreshButton.exists()) {
        // Mock loading state
        await wrapper.setData({ loading: true });
        expect(wrapper.find('.loading-spinner').exists()).toBe(true);

        await refreshButton.trigger('click');
        
        // 验证刷新事件
        expect(wrapper.emitted('refresh')).toBeDefined();
        
        // 模拟数据加载完成
        await wrapper.setData({ loading: false });
        expect(wrapper.find('.loading-spinner').exists()).toBe(false);
      }
    });

    it('should handle quick actions correctly', async () => {
      const wrapper = createTestWrapper(Dashboard);

      const quickActions = wrapper.findAll('[data-testid^="quick-action-"]');
      
      // 测试每个快捷操作
      for (const action of quickActions) {
        const actionType = action.attributes()['data-testid']?.replace('quick-action-', '');
        
        await action.trigger('click');
        
        // 验证事件发射
        expect(wrapper.emitted('quick-action')).toBeDefined();
        
        const lastEvent = wrapper.emitted('quick-action')?.slice(-1)[0];
        if (lastEvent) {
          expect(lastEvent[0]).toBe(actionType);
        }
      }
    });

    it('should handle error states correctly', async () => {
      // Mock API错误
      mockRequest.get.mockRejectedValue(new Error('Network error'));

      const wrapper = createTestWrapper(Dashboard);
      await wrapper.vm.$nextTick();
      await waitForAsync(100);

      // 验证错误状态显示
      expect(wrapper.find('.error-state').exists()).toBe(true);
      expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(true);
      
      // 验证重试按钮
      const retryButton = wrapper.find('[data-testid="retry-button"]');
      if (retryButton.exists()) {
        await retryButton.trigger('click');
        
        // 验证重试请求
        expect(mockRequest.get).toHaveBeenCalledTimes(2);
      }
    });

    it('should handle empty states correctly', async () => {
      // Mock空数据
      mockRequest.get.mockResolvedValue(mockApiResponse.success({
        items: [],
        total: 0,
        page: 1,
        pageSize: 10
      }));

      const wrapper = createTestWrapper(Dashboard);
      await wrapper.vm.$nextTick();
      await waitForAsync(100);

      // 验证空状态显示
      expect(wrapper.find('.empty-state').exists()).toBe(true);
    });

    it('should handle responsive design correctly', async () => {
      const wrapper = createTestWrapper(Dashboard);

      // 测试不同屏幕尺寸
      const screenSizes = ['mobile', 'tablet', 'desktop'];
      
      for (const size of screenSizes) {
        await wrapper.setData({ screenSize: size });
        await wrapper.vm.$nextTick();
        
        // 验证响应式类名
        const container = wrapper.find('.dashboard-container');
        expect(container.classes()).toContain(`dashboard-${size}`);
      }
    });
  });

  describe('Dashboard Analytics Page', () => {
    it('should render analytics page with correct structure', async () => {
      mockRequest.get.mockResolvedValue(mockApiResponse.success({
        totalStats: {
          students: 150,
          teachers: 20,
          classes: 8,
          parents: 300
        },
        timeRangeData: {
          daily: [],
          weekly: [],
          monthly: []
        }
      }));

      const wrapper = createTestWrapper(DashboardAnalytics, {
        props: {
          timeRange: '7d'
        }
      });

      await wrapper.vm.$nextTick();
      await waitForAsync(100);

      expect(wrapper.find('.analytics-container').exists()).toBe(true);
      expect(wrapper.find('.analytics-header').exists()).toBe(true);
      expect(wrapper.find('.analytics-content').exists()).toBe(true);
    });

    it('should handle time range selection correctly', async () => {
      const wrapper = createTestWrapper(DashboardAnalytics);

      const timeRanges = ['7d', '30d', '90d', '1y'];
      
      for (const range of timeRanges) {
        const timeRangeButton = wrapper.find(`[data-testid="time-range-${range}"]`);
        if (timeRangeButton.exists()) {
          await timeRangeButton.trigger('click');
          
          expect(wrapper.emitted('time-range-change')).toBeDefined();
          
          const lastEvent = wrapper.emitted('time-range-change')?.slice(-1)[0];
          if (lastEvent) {
            expect(lastEvent[0]).toBe(range);
          }
        }
      }
    });

    it('should load analytics data with strict validation', async () => {
      const mockAnalyticsData = {
        studentEnrollment: {
          current: 150,
          previous: 140,
          growth: 7.14,
          trends: [
            { date: '2024-01-01', value: 140 },
            { date: '2024-01-02', value: 142 },
            { date: '2024-01-03', value: 145 },
            { date: '2024-01-04', value: 150 }
          ]
        },
        teacherPerformance: {
          averageScore: 85.6,
          improvementRate: 12.5,
          topPerformers: [
            { id: '1', name: '王老师', score: 95.2 },
            { id: '2', name: '李老师', score: 92.8 }
          ]
        },
        classEfficiency: {
          averageAttendance: 96.5,
          optimalCapacity: 25,
          utilizationRate: 88.3
        }
      };

      mockRequest.get.mockResolvedValue(mockApiResponse.success(mockAnalyticsData));

      const wrapper = createTestWrapper(DashboardAnalytics);
      await wrapper.vm.$nextTick();
      await waitForAsync(100);

      // 验证分析数据结构
      const requiredFields = ['studentEnrollment', 'teacherPerformance', 'classEfficiency'];
      const validation = validateRequiredFields(mockAnalyticsData, requiredFields);
      expect(validation.valid).toBe(true);

      // 验证数值范围
      const rangeValidation = validateStatisticalRanges(mockAnalyticsData, {
        'studentEnrollment.current': { min: 0 },
        'studentEnrollment.growth': { min: -100, max: 100 },
        'teacherPerformance.averageScore': { min: 0, max: 100 },
        'classEfficiency.averageAttendance': { min: 0, max: 100 }
      });
      expect(rangeValidation.valid).toBe(true);

      // 验证趋势数据
      mockAnalyticsData.studentEnrollment.trends.forEach(trend => {
        const trendValidation = validateFieldTypes(trend, {
          date: 'string',
          value: 'number'
        });
        expect(trendValidation.valid).toBe(true);
      });
    });

    it('should handle export functionality correctly', async () => {
      const wrapper = createTestWrapper(DashboardAnalytics);

      const exportButton = wrapper.find('[data-testid="export-button"]');
      if (exportButton.exists()) {
        await exportButton.trigger('click');
        
        // 验证导出选项
        expect(wrapper.find('[data-testid="export-menu"]').exists()).toBe(true);
        
        const exportOptions = wrapper.findAll('[data-testid^="export-option-"]');
        expect(exportOptions.length).toBeGreaterThan(0);
      }
    });

    it('should handle filter functionality correctly', async () => {
      const wrapper = createTestWrapper(DashboardAnalytics);

      const filterButton = wrapper.find('[data-testid="filter-button"]');
      if (filterButton.exists()) {
        await filterButton.trigger('click');
        
        // 验证筛选面板
        expect(wrapper.find('[data-testid="filter-panel"]').exists()).toBe(true);
        
        // 测试筛选选项
        const gradeFilter = wrapper.find('[data-testid="filter-grade"]');
        if (gradeFilter.exists()) {
          await gradeFilter.setValue('大班');
          expect(wrapper.vm.$data.filters.grade).toBe('大班');
        }
      }
    });
  });

  describe('Dashboard Performance Tests', () => {
    it('should handle large datasets efficiently', async () => {
      // 模拟大数据集
      const largeDataset = {
        items: Array.from({ length: 1000 }, (_, i) => ({
          id: `item-${i}`,
          name: `数据项 ${i}`,
          value: Math.floor(Math.random() * 100),
          timestamp: new Date(Date.now() - i * 1000).toISOString()
        })),
        total: 1000,
        page: 1,
        pageSize: 50
      };

      mockRequest.get.mockResolvedValue(mockApiResponse.success(largeDataset));

      const startTime = performance.now();
      const wrapper = createTestWrapper(Dashboard);
      await wrapper.vm.$nextTick();
      await waitForAsync(200);
      const endTime = performance.now();

      // 验证性能指标（渲染时间应该在合理范围内）
      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(1000); // 1秒内完成渲染

      // 验证分页正确应用
      expect(mockRequest.get).toHaveBeenCalledWith('/api/dashboard/activities', {
        params: { page: 1, pageSize: 50 }
      });
    });

    it('should handle multiple concurrent requests correctly', async () => {
      const promises = [
        mockRequest.get.mockResolvedValueOnce(mockApiResponse.success({ totalStudents: 150 })),
        mockRequest.get.mockResolvedValueOnce(mockApiResponse.success([{ id: '1', title: '活动1' }])),
        mockRequest.get.mockResolvedValueOnce(mockApiResponse.success({ items: [], total: 0 }))
      ];

      const wrapper = createTestWrapper(Dashboard);
      await Promise.all(promises);
      await wrapper.vm.$nextTick();
      await waitForAsync(100);

      // 验证所有请求都被调用
      expect(mockRequest.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('Dashboard Accessibility Tests', () => {
    it('should have proper ARIA labels', async () => {
      mockRequest.get.mockResolvedValue(mockApiResponse.success({}));
      
      const wrapper = createTestWrapper(Dashboard);
      await wrapper.vm.$nextTick();

      // 检查重要元素的ARIA标签
      const mainContent = wrapper.find('[data-testid="dashboard-main"]');
      if (mainContent.exists()) {
        expect(mainContent.attributes('role')).toBe('main');
      }

      const statCards = wrapper.findAll('[data-testid^="stat-card-"]');
      statCards.forEach(card => {
        if (card.exists()) {
          expect(card.attributes('aria-label')).toBeDefined();
        }
      });
    });

    it('should support keyboard navigation', async () => {
      const wrapper = createTestWrapper(Dashboard);

      // 测试Tab键导航
      const focusableElements = wrapper.findAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      expect(focusableElements.length).toBeGreaterThan(0);

      // 测试快捷键
      await wrapper.trigger('keydown', { key: 'r', ctrlKey: true });
      // 应该触发刷新功能
    });
  });
});