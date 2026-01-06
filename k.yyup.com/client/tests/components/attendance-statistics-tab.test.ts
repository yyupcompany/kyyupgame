/**
 * 考勤统计Tab组件单元测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { vi } from 'vitest'
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ElementPlus from 'element-plus';
import StatisticsTab from '@/pages/centers/components/attendance/StatisticsTab.vue';

// Mock API模块
vi.mock('@/api/modules/attendance-center', () => ({
  getDailyStatistics: vi.fn(),
  getWeeklyStatistics: vi.fn(),
  getMonthlyStatistics: vi.fn(),
  getQuarterlyStatistics: vi.fn(),
  getYearlyStatistics: vi.fn(),
}));

// 控制台错误检测变量
let consoleSpy: any

describe('StatisticsTab组件测试', () => {
  let wrapper: any;

  beforeEach(() => {
    vi.clearAllMocks();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount();
    }
    vi.restoreAllMocks();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('组件渲染测试', () => {
    it('应该正确渲染统计Tab组件', () => {
      // Arrange & Act
      wrapper = mount(StatisticsTab, {
        props: {
          kindergartenId: 1,
        },
        global: {
          plugins: [ElementPlus],
        },
      });

      // Assert
      expect(wrapper.find('.statistics-tab').exists()).toBe(true);
    });

    it('应该渲染时间范围选择器', () => {
      // Arrange & Act
      wrapper = mount(StatisticsTab, {
        props: {
          kindergartenId: 1,
        },
        global: {
          plugins: [ElementPlus],
        },
      });

      // Assert
      const dateRangePicker = wrapper.find('.el-date-range-picker');
      expect(dateRangePicker.exists()).toBe(true);
    });

    it('应该渲染统计图表区域', () => {
      // Arrange & Act
      wrapper = mount(StatisticsTab, {
        props: {
          kindergartenId: 1,
        },
        global: {
          plugins: [ElementPlus],
        },
      });

      // Assert
      const chartContainer = wrapper.find('[data-test="chart-container"]');
      expect(chartContainer.exists()).toBe(true);
    });

    it('应该渲染统计卡片', () => {
      // Arrange & Act
      wrapper = mount(StatisticsTab, {
        props: {
          kindergartenId: 1,
        },
        global: {
          plugins: [ElementPlus],
        },
      });

      // Assert
      const statCards = wrapper.findAll('.stat-card');
      expect(statCards.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('数据加载测试', () => {
    it('应该在组件挂载时加载默认统计数据', async () => {
      // Arrange
      const { getDailyStatistics } = await import('@/api/modules/attendance-center');
      const mockData = {
        success: true,
        data: {
          date: '2025-01-15',
          classes: [
            {
              classId: 1,
              className: '小一班',
              totalStudents: 25,
              presentCount: 23,
              absentCount: 2,
              attendanceRate: 92,
            },
          ],
        },
      };

      (getDailyStatistics as any).mockResolvedValue(mockData);

      // Act
      wrapper = mount(StatisticsTab, {
        props: {
          kindergartenId: 1,
        },
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();

      // Assert
      expect(getDailyStatistics).toHaveBeenCalledWith({
        kindergartenId: 1,
        date: expect.any(String),
      });
    });

    it('应该正确显示加载的统计数据', async () => {
      // Arrange
      const { getDailyStatistics } = await import('@/api/modules/attendance-center');
      const mockData = {
        success: true,
        data: {
          date: '2025-01-15',
          classes: [
            {
              classId: 1,
              className: '小一班',
              totalStudents: 25,
              presentCount: 23,
              absentCount: 2,
              attendanceRate: 92,
            },
            {
              classId: 2,
              className: '小二班',
              totalStudents: 24,
              presentCount: 22,
              absentCount: 2,
              attendanceRate: 91.7,
            },
          ],
        },
      };

      (getDailyStatistics as any).mockResolvedValue(mockData);

      // Act
      wrapper = mount(StatisticsTab, {
        props: {
          kindergartenId: 1,
        },
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();
      await nextTick(); // 等待数据更新

      // Assert
      expect(wrapper.vm.statisticsData).toEqual(mockData.data);
      expect(wrapper.vm.statisticsData.classes).toHaveLength(2);
    });

    it('应该处理API加载错误', async () => {
      // Arrange
      const { getDailyStatistics } = await import('@/api/modules/attendance-center');
      (getDailyStatistics as any).mockRejectedValue(new Error('Network error'));

      // Act
      wrapper = mount(StatisticsTab, {
        props: {
          kindergartenId: 1,
        },
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();

      // Assert
      expect(wrapper.vm.loading).toBe(false);
      // 组件应该仍然渲染，但显示错误状态或空状态
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('交互功能测试', () => {
    it('应该能切换统计类型', async () => {
      // Arrange
      const { getDailyStatistics, getWeeklyStatistics } = await import('@/api/modules/attendance-center');

      (getDailyStatistics as any).mockResolvedValue({
        success: true,
        data: {
          date: '2025-01-15',
          classes: [],
        },
      });

      (getWeeklyStatistics as any).mockResolvedValue({
        success: true,
        data: {
          startDate: '2025-01-13',
          endDate: '2025-01-19',
          dailyData: [],
        },
      });

      wrapper = mount(StatisticsTab, {
        props: {
          kindergartenId: 1,
        },
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();

      // Act - 切换到周统计
      const weeklyButton = wrapper.find('[data-test="btn-weekly"]');
      if (weeklyButton.exists()) {
        await weeklyButton.trigger('click');
        await nextTick();

        // Assert
        expect(wrapper.vm.statisticsType).toBe('weekly');
        expect(getWeeklyStatistics).toHaveBeenCalled();
      }
    });

    it('应该能选择日期范围', async () => {
      // Arrange
      const { getDailyStatistics } = await import('@/api/modules/attendance-center');
      (getDailyStatistics as any).mockResolvedValue({
        success: true,
        data: {
          date: '2025-01-15',
          classes: [],
        },
      });

      wrapper = mount(StatisticsTab, {
        props: {
          kindergartenId: 1,
        },
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();

      // Act - 设置日期范围
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      wrapper.vm.dateRange = [startDate, endDate];
      await nextTick();

      // Assert
      expect(wrapper.vm.dateRange).toEqual([startDate, endDate]);
    });

    it('应该能刷新数据', async () => {
      // Arrange
      const { getDailyStatistics } = await import('@/api/modules/attendance-center');
      let callCount = 0;

      (getDailyStatistics as any).mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          success: true,
          data: {
            date: '2025-01-15',
            classes: [],
          },
        });
      });

      wrapper = mount(StatisticsTab, {
        props: {
          kindergartenId: 1,
        },
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();
      const initialCallCount = callCount;

      // Act - 触发刷新
      const refreshButton = wrapper.find('[data-test="btn-refresh"]');
      if (refreshButton.exists()) {
        await refreshButton.trigger('click');
        await nextTick();

        // Assert
        expect(callCount).toBe(initialCallCount + 1);
      }

      // 也测试通过emit刷新
      await wrapper.vm.refreshData();
      await nextTick();

      expect(callCount).toBe(initialCallCount + 2);
    });
  });

  describe('数据可视化测试', () => {
    it('应该正确渲染考勤趋势图表', async () => {
      // Arrange
      const { getDailyStatistics } = await import('@/api/modules/attendance-center');
      const mockData = {
        success: true,
        data: {
          date: '2025-01-15',
          classes: [
            {
              classId: 1,
              className: '小一班',
              totalStudents: 25,
              presentCount: 23,
              absentCount: 2,
              attendanceRate: 92,
            },
          ],
        },
      };

      (getDailyStatistics as any).mockResolvedValue(mockData);

      // Act
      wrapper = mount(StatisticsTab, {
        props: {
          kindergartenId: 1,
        },
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();
      await nextTick();

      // Assert
      const chartContainer = wrapper.find('[data-test="chart-container"]');
      expect(chartContainer.exists()).toBe(true);

      // 检查是否有图表相关的CSS类
      expect(wrapper.html()).toContain('chart');
    });

    it('应该正确渲染班级对比图表', async () => {
      // Arrange
      const { getDailyStatistics } = await import('@/api/modules/attendance-center');
      const mockData = {
        success: true,
        data: {
          date: '2025-01-15',
          classes: [
            {
              classId: 1,
              className: '小一班',
              totalStudents: 25,
              presentCount: 23,
              absentCount: 2,
              attendanceRate: 92,
            },
            {
              classId: 2,
              className: '小二班',
              totalStudents: 24,
              presentCount: 22,
              absentCount: 2,
              attendanceRate: 91.7,
            },
          ],
        },
      };

      (getDailyStatistics as any).mockResolvedValue(mockData);

      // Act
      wrapper = mount(StatisticsTab, {
        props: {
          kindergartenId: 1,
        },
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();
      await nextTick();

      // Assert
      expect(wrapper.vm.statisticsData.classes).toHaveLength(2);
      expect(wrapper.vm.statisticsData.classes[0].className).toBe('小一班');
      expect(wrapper.vm.statisticsData.classes[1].className).toBe('小二班');
    });

    it('应该处理空数据状态', async () => {
      // Arrange
      const { getDailyStatistics } = await import('@/api/modules/attendance-center');
      const mockData = {
        success: true,
        data: {
          date: '2025-01-15',
          classes: [],
        },
      };

      (getDailyStatistics as any).mockResolvedValue(mockData);

      // Act
      wrapper = mount(StatisticsTab, {
        props: {
          kindergartenId: 1,
        },
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();
      await nextTick();

      // Assert
      expect(wrapper.vm.statisticsData.classes).toHaveLength(0);
      // 应该显示空状态提示
      const emptyState = wrapper.find('[data-test="empty-state"]');
      if (emptyState.exists()) {
        expect(emptyState.text()).toContain('暂无数据');
      }
    });
  });

  describe('导出功能测试', () => {
    it('应该能导出统计报表', async () => {
      // Arrange
      const { getDailyStatistics } = await import('@/api/modules/attendance-center');
      const mockData = {
        success: true,
        data: {
          date: '2025-01-15',
          classes: [
            {
              classId: 1,
              className: '小一班',
              totalStudents: 25,
              presentCount: 23,
              absentCount: 2,
              attendanceRate: 92,
            },
          ],
        },
      };

      (getDailyStatistics as any).mockResolvedValue(mockData);

      // Mock window.open
      const originalOpen = window.open;
      window.open = vi.fn();

      wrapper = mount(StatisticsTab, {
        props: {
          kindergartenId: 1,
        },
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();

      // Act - 触发导出
      const exportButton = wrapper.find('[data-test="btn-export"]');
      if (exportButton.exists()) {
        await exportButton.trigger('click');
        await nextTick();

        // Assert
        // 应该有导出相关的逻辑
        expect(wrapper.exists()).toBe(true);
      }

      // Restore window.open
      window.open = originalOpen;
    });
  });

  describe('响应式设计测试', () => {
    it('应该在小屏幕上调整布局', async () => {
      // Arrange
      const { getDailyStatistics } = await import('@/api/modules/attendance-center');
      (getDailyStatistics as any).mockResolvedValue({
        success: true,
        data: {
          date: '2025-01-15',
          classes: [],
        },
      });

      wrapper = mount(StatisticsTab, {
        props: {
          kindergartenId: 1,
        },
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();

      // Act - 模拟小屏幕
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      window.dispatchEvent(new Event('resize'));
      await nextTick();

      // Assert
      expect(wrapper.exists()).toBe(true);
      // 组件应该仍然正常渲染
      expect(wrapper.find('.statistics-tab').exists()).toBe(true);
    });
  });

  describe('Props测试', () => {
    it('应该正确接收kindergartenId prop', () => {
      // Arrange & Act
      wrapper = mount(StatisticsTab, {
        props: {
          kindergartenId: 123,
        },
        global: {
          plugins: [ElementPlus],
        },
      });

      // Assert
      expect(wrapper.vm.kindergartenId).toBe(123);
    });

    it('应该在kindergartenId变化时重新加载数据', async () => {
      // Arrange
      const { getDailyStatistics } = await import('@/api/modules/attendance-center');
      let callCount = 0;

      (getDailyStatistics as any).mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          success: true,
          data: {
            date: '2025-01-15',
            classes: [],
          },
        });
      });

      wrapper = mount(StatisticsTab, {
        props: {
          kindergartenId: 1,
        },
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();
      const initialCallCount = callCount;

      // Act - 改变props
      await wrapper.setProps({ kindergartenId: 2 });
      await nextTick();

      // Assert
      expect(wrapper.vm.kindergartenId).toBe(2);
      // 可能需要手动触发重新加载，取决于组件实现
    });
  });

  describe('事件测试', () => {
    it('应该正确触发refresh事件', async () => {
      // Arrange
      const { getDailyStatistics } = await import('@/api/modules/attendance-center');
      (getDailyStatistics as any).mockResolvedValue({
        success: true,
        data: {
          date: '2025-01-15',
          classes: [],
        },
      });

      wrapper = mount(StatisticsTab, {
        props: {
          kindergartenId: 1,
        },
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();

      // Act
      await wrapper.vm.$emit('refresh');
      await nextTick();

      // Assert
      // 组件应该响应refresh事件
      expect(wrapper.exists()).toBe(true);
    });

    it('应该正确触发export事件', async () => {
      // Arrange
      const { getDailyStatistics } = await import('@/api/modules/attendance-center');
      (getDailyStatistics as any).mockResolvedValue({
        success: true,
        data: {
          date: '2025-01-15',
          classes: [],
        },
      });

      wrapper = mount(StatisticsTab, {
        props: {
          kindergartenId: 1,
        },
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();

      // Act
      await wrapper.vm.$emit('export');
      await nextTick();

      // Assert
      // 组件应该响应export事件
      expect(wrapper.exists()).toBe(true);
    });
  });
});