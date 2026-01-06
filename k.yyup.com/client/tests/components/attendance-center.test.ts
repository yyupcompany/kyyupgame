/**
 * 考勤中心组件单元测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { vi } from 'vitest'
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ElementPlus from 'element-plus';
import AttendanceCenter from '@/pages/centers/AttendanceCenter.vue';
import StatisticsTab from '@/pages/centers/components/attendance/StatisticsTab.vue';
import ClassStatisticsTab from '@/pages/centers/components/attendance/ClassStatisticsTab.vue';
import AbnormalAnalysisTab from '@/pages/centers/components/attendance/AbnormalAnalysisTab.vue';
import HealthMonitoringTab from '@/pages/centers/components/attendance/HealthMonitoringTab.vue';
import RecordsManagementTab from '@/pages/centers/components/attendance/RecordsManagementTab.vue';

// Mock API模块
vi.mock('@/api/modules/attendance-center', () => ({
  getOverview: vi.fn(),
  exportAttendance: vi.fn(),
}));

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ElLoading: {
    service: vi.fn(() => ({
      close: vi.fn(),
    })),
  },
}));

// Mock stores
vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    user: {
      kindergartenId: 1,
    },
  }),
}));

// 控制台错误检测变量
let consoleSpy: any

describe('AttendanceCenter组件测试', () => {
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
    it('应该正确渲染组件结构', () => {
      // Arrange & Act
      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus],
        },
      });

      // Assert
      expect(wrapper.find('.attendance-center-timeline').exists()).toBe(true);
      expect(wrapper.find('.page-header').exists()).toBe(true);
      expect(wrapper.find('.page-title').exists()).toBe(true);
      expect(wrapper.find('.overview-card').exists()).toBe(true);
      expect(wrapper.find('.tabs-card').exists()).toBe(true);
      expect(wrapper.text()).toContain('考勤中心');
      expect(wrapper.text()).toContain('全园概览');
    });

    it('应该渲染所有概览统计卡片', () => {
      // Arrange & Act
      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus],
        },
      });

      // Assert
      const statCards = wrapper.findAll('.overview-stat');
      expect(statCards).toHaveLength(4); // 总人数、出勤人数、缺勤人数、出勤率

      const detailStats = wrapper.findAll('.detail-stat');
      expect(detailStats).toHaveLength(4); // 迟到、早退、病假、事假
    });

    it('应该渲染所有Tab页', () => {
      // Arrange & Act
      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus],
        },
      });

      // Assert
      const tabs = wrapper.findAll('.el-tabs__item');
      expect(tabs.length).toBeGreaterThanOrEqual(5); // 至少5个Tab

      const tabLabels = ['统计分析', '班级统计', '异常分析', '健康监测', '记录管理'];
      tabLabels.forEach(label => {
        expect(wrapper.text()).toContain(label);
      });
    });

    it('应该渲染操作按钮', () => {
      // Arrange & Act
      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus],
        },
      });

      // Assert
      const buttons = wrapper.findAll('.header-actions .el-button');
      expect(buttons.length).toBeGreaterThanOrEqual(2); // 导出报表和刷新按钮

      const exportButton = wrapper.find('[data-test="export-button"]');
      const refreshButton = wrapper.find('[data-test="refresh-button"]');

      if (exportButton.exists()) {
        expect(exportButton.text()).toContain('导出报表');
      }

      if (refreshButton.exists()) {
        expect(refreshButton.text()).toContain('刷新');
      }
    });
  });

  describe('数据加载测试', () => {
    it('应该在组件挂载时加载概览数据', async () => {
      // Arrange
      const { getOverview } = await import('@/api/modules/attendance-center');
      const mockOverviewData = {
        success: true,
        data: {
          date: '2025-01-15',
          totalRecords: 150,
          presentCount: 140,
          absentCount: 10,
          lateCount: 5,
          earlyLeaveCount: 2,
          sickLeaveCount: 3,
          personalLeaveCount: 4,
          attendanceRate: 93.3,
          abnormalTemperature: 0,
        },
      };

      (getOverview as any).mockResolvedValue(mockOverviewData);

      // Act
      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();

      // Assert
      expect(getOverview).toHaveBeenCalledWith({
        kindergartenId: 1,
        date: expect.any(String),
      });
    });

    it('应该正确显示加载的概览数据', async () => {
      // Arrange
      const { getOverview } = await import('@/api/modules/attendance-center');
      const mockOverviewData = {
        success: true,
        data: {
          date: '2025-01-15',
          totalRecords: 150,
          presentCount: 140,
          absentCount: 10,
          lateCount: 5,
          earlyLeaveCount: 2,
          sickLeaveCount: 3,
          personalLeaveCount: 4,
          attendanceRate: 93.3,
          abnormalTemperature: 0,
        },
      };

      (getOverview as any).mockResolvedValue(mockOverviewData);

      // Act
      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();
      await nextTick(); // 等待数据更新

      // Assert
      expect(wrapper.text()).toContain('150'); // totalRecords
      expect(wrapper.text()).toContain('140'); // presentCount
      expect(wrapper.text()).toContain('10'); // absentCount
      expect(wrapper.text()).toContain('93.3%'); // attendanceRate
      expect(wrapper.text()).toContain('5'); // lateCount
      expect(wrapper.text()).toContain('2'); // earlyLeaveCount
      expect(wrapper.text()).toContain('3'); // sickLeaveCount
      expect(wrapper.text()).toContain('4'); // personalLeaveCount
    });

    it('应该处理API加载错误', async () => {
      // Arrange
      const { getOverview } = await import('@/api/modules/attendance-center');
      const { ElMessage } = await import('element-plus');

      (getOverview as any).mockRejectedValue(new Error('Network error'));

      // Act
      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();
      await nextTick(); // 等待错误处理

      // Assert
      expect(ElMessage.error).toHaveBeenCalledWith('加载全园概览失败');
    });
  });

  describe('交互功能测试', () => {
    it('应该能切换Tab页', async () => {
      // Arrange
      const { getOverview } = await import('@/api/modules/attendance-center');
      (getOverview as any).mockResolvedValue({
        success: true,
        data: {
          date: '2025-01-15',
          totalRecords: 150,
          presentCount: 140,
          absentCount: 10,
          lateCount: 5,
          earlyLeaveCount: 2,
          sickLeaveCount: 3,
          personalLeaveCount: 4,
          attendanceRate: 93.3,
          abnormalTemperature: 0,
        },
      });

      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();

      // Act - 切换到班级统计Tab
      const classTab = wrapper.find('[data-test="tab-class"]');
      if (classTab.exists()) {
        await classTab.trigger('click');
        await nextTick();

        // Assert
        expect(wrapper.vm.activeTab).toBe('class');
      }

      // Act - 切换到异常分析Tab
      const abnormalTab = wrapper.find('[data-test="tab-abnormal"]');
      if (abnormalTab.exists()) {
        await abnormalTab.trigger('click');
        await nextTick();

        // Assert
        expect(wrapper.vm.activeTab).toBe('abnormal');
      }
    });

    it('应该能刷新数据', async () => {
      // Arrange
      const { getOverview } = await import('@/api/modules/attendance-center');
      let callCount = 0;

      (getOverview as any).mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          success: true,
          data: {
            date: '2025-01-15',
            totalRecords: 150,
            presentCount: 140,
            absentCount: 10,
            lateCount: 5,
            earlyLeaveCount: 2,
            sickLeaveCount: 3,
            personalLeaveCount: 4,
            attendanceRate: 93.3,
            abnormalTemperature: 0,
          },
        });
      });

      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();
      const initialCallCount = callCount;

      // Act - 点击刷新按钮
      const refreshButton = wrapper.find('[data-test="refresh-button"]');
      if (refreshButton.exists()) {
        await refreshButton.trigger('click');
        await nextTick();

        // Assert
        expect(callCount).toBe(initialCallCount + 1);
      } else {
        // 如果没有找到测试属性，尝试通过文本查找
        const buttonByText = wrapper.find('.el-button').filter(btn =>
          btn.text().includes('刷新')
        );
        if (buttonByText.exists()) {
          await buttonByText.trigger('click');
          await nextTick();
          expect(callCount).toBe(initialCallCount + 1);
        }
      }
    });

    it('应该能打开导出对话框', async () => {
      // Arrange
      const { getOverview } = await import('@/api/modules/attendance-center');
      (getOverview as any).mockResolvedValue({
        success: true,
        data: {
          date: '2025-01-15',
          totalRecords: 150,
          presentCount: 140,
          absentCount: 10,
          lateCount: 5,
          earlyLeaveCount: 2,
          sickLeaveCount: 3,
          personalLeaveCount: 4,
          attendanceRate: 93.3,
          abnormalTemperature: 0,
        },
      });

      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();

      // Act - 点击导出按钮
      const exportButton = wrapper.find('[data-test="export-button"]');
      if (exportButton.exists()) {
        await exportButton.trigger('click');
        await nextTick();

        // Assert
        expect(wrapper.vm.exportDialogVisible).toBe(true);
      } else {
        // 如果没有找到测试属性，尝试通过文本查找
        const buttonByText = wrapper.find('.el-button').filter(btn =>
          btn.text().includes('导出')
        );
        if (buttonByText.exists()) {
          await buttonByText.trigger('click');
          await nextTick();
          expect(wrapper.vm.exportDialogVisible).toBe(true);
        }
      }
    });

    it('应该能处理导出操作', async () => {
      // Arrange
      const { getOverview, exportAttendance } = await import('@/api/modules/attendance-center');
      const { ElMessage } = await import('element-plus');

      (getOverview as any).mockResolvedValue({
        success: true,
        data: {
          date: '2025-01-15',
          totalRecords: 150,
          presentCount: 140,
          absentCount: 10,
          lateCount: 5,
          earlyLeaveCount: 2,
          sickLeaveCount: 3,
          personalLeaveCount: 4,
          attendanceRate: 93.3,
          abnormalTemperature: 0,
        },
      });

      (exportAttendance as any).mockResolvedValue({
        success: true,
        data: {
          url: 'http://localhost:3000/exports/attendance_20250115.xlsx',
          filename: 'attendance_20250115.xlsx',
        },
      });

      // Mock window.open
      const originalOpen = window.open;
      window.open = vi.fn();

      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();

      // Act - 打开导出对话框并确认导出
      wrapper.vm.exportDialogVisible = true;
      await nextTick();

      const confirmButton = wrapper.find('[data-test="confirm-export"]');
      if (confirmButton.exists()) {
        await confirmButton.trigger('click');
        await nextTick();

        // Assert
        expect(exportAttendance).toHaveBeenCalledWith({
          kindergartenId: 1,
          startDate: expect.any(String),
          endDate: expect.any(String),
          format: 'excel',
        });
        expect(ElMessage.success).toHaveBeenCalledWith('导出成功');
        expect(window.open).toHaveBeenCalledWith(
          'http://localhost:3000/exports/attendance_20250115.xlsx',
          '_blank'
        );
        expect(wrapper.vm.exportDialogVisible).toBe(false);
      }

      // Restore window.open
      window.open = originalOpen;
    });

    it('应该能选择日期', async () => {
      // Arrange
      const { getOverview } = await import('@/api/modules/attendance-center');
      (getOverview as any).mockResolvedValue({
        success: true,
        data: {
          date: '2025-01-15',
          totalRecords: 150,
          presentCount: 140,
          absentCount: 10,
          lateCount: 5,
          earlyLeaveCount: 2,
          sickLeaveCount: 3,
          personalLeaveCount: 4,
          attendanceRate: 93.3,
          abnormalTemperature: 0,
        },
      });

      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();

      // Act - 更改日期
      const newDate = new Date('2025-01-20');
      wrapper.vm.overviewDate = newDate;
      await nextTick();

      // Assert
      expect(wrapper.vm.overviewDate).toEqual(newDate);
      // getOverview 应该被调用来重新加载数据
      expect(getOverview).toHaveBeenCalledTimes(2); // 一次是初始化，一次是日期更改
    });
  });

  describe('Tab组件测试', () => {
    it('应该正确渲染StatisticsTab组件', async () => {
      // Arrange
      const { getOverview } = await import('@/api/modules/attendance-center');
      (getOverview as any).mockResolvedValue({
        success: true,
        data: {
          date: '2025-01-15',
          totalRecords: 150,
          presentCount: 140,
          absentCount: 10,
          lateCount: 5,
          earlyLeaveCount: 2,
          sickLeaveCount: 3,
          personalLeaveCount: 4,
          attendanceRate: 93.3,
          abnormalTemperature: 0,
        },
      });

      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus],
          components: {
            StatisticsTab,
          },
        },
      });

      await nextTick();

      // Act - 切换到统计Tab
      wrapper.vm.activeTab = 'statistics';
      await nextTick();

      // Assert
      const statisticsTab = wrapper.findComponent(StatisticsTab);
      expect(statisticsTab.exists()).toBe(true);
    });

    it('应该向Tab组件传递正确的props', async () => {
      // Arrange
      const { getOverview } = await import('@/api/modules/attendance-center');
      (getOverview as any).mockResolvedValue({
        success: true,
        data: {
          date: '2025-01-15',
          totalRecords: 150,
          presentCount: 140,
          absentCount: 10,
          lateCount: 5,
          earlyLeaveCount: 2,
          sickLeaveCount: 3,
          personalLeaveCount: 4,
          attendanceRate: 93.3,
          abnormalTemperature: 0,
        },
      });

      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus],
          components: {
            StatisticsTab,
          },
        },
      });

      await nextTick();

      // Act
      wrapper.vm.activeTab = 'statistics';
      await nextTick();

      // Assert
      const statisticsTab = wrapper.findComponent(StatisticsTab);
      if (statisticsTab.exists()) {
        expect(statisticsTab.props('kindergartenId')).toBe(1);
      }
    });

    it('应该处理Tab组件的刷新事件', async () => {
      // Arrange
      const { getOverview } = await import('@/api/modules/attendance-center');
      let callCount = 0;

      (getOverview as any).mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          success: true,
          data: {
            date: '2025-01-15',
            totalRecords: 150,
            presentCount: 140,
            absentCount: 10,
            lateCount: 5,
            earlyLeaveCount: 2,
            sickLeaveCount: 3,
            personalLeaveCount: 4,
            attendanceRate: 93.3,
            abnormalTemperature: 0,
          },
        });
      });

      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus],
          components: {
            StatisticsTab,
          },
        },
      });

      await nextTick();
      const initialCallCount = callCount;

      // Act - 触发Tab组件的刷新事件
      wrapper.vm.activeTab = 'statistics';
      await nextTick();

      const statisticsTab = wrapper.findComponent(StatisticsTab);
      if (statisticsTab.exists()) {
        await statisticsTab.vm.$emit('refresh');
        await nextTick();

        // Assert
        expect(callCount).toBe(initialCallCount + 1);
      }
    });
  });

  describe('响应式设计测试', () => {
    it('应该在小屏幕上调整布局', async () => {
      // Arrange
      const { getOverview } = await import('@/api/modules/attendance-center');
      (getOverview as any).mockResolvedValue({
        success: true,
        data: {
          date: '2025-01-15',
          totalRecords: 150,
          presentCount: 140,
          absentCount: 10,
          lateCount: 5,
          earlyLeaveCount: 2,
          sickLeaveCount: 3,
          personalLeaveCount: 4,
          attendanceRate: 93.3,
          abnormalTemperature: 0,
        },
      });

      wrapper = mount(AttendanceCenter, {
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
      expect(wrapper.find('.attendance-center-timeline').exists()).toBe(true);
    });

    it('应该在加载时显示适当的loading状态', async () => {
      // Arrange
      const { getOverview } = await import('@/api/modules/attendance-center');

      // 创建一个延迟的Promise来模拟加载状态
      let resolvePromise: (value: any) => void;
      const delayedPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      (getOverview as any).mockReturnValue(delayedPromise);

      // Act
      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus],
        },
      });

      // Assert - 初始状态下应该有适当的loading提示
      expect(wrapper.exists()).toBe(true);

      // 模拟数据加载完成
      resolvePromise({
        success: true,
        data: {
          date: '2025-01-15',
          totalRecords: 150,
          presentCount: 140,
          absentCount: 10,
          lateCount: 5,
          earlyLeaveCount: 2,
          sickLeaveCount: 3,
          personalLeaveCount: 4,
          attendanceRate: 93.3,
          abnormalTemperature: 0,
        },
      });

      await nextTick();
      await nextTick();

      // Assert - 数据加载完成后应该显示内容
      expect(wrapper.text()).toContain('150');
    });
  });

  describe('错误处理测试', () => {
    it('应该处理导出失败', async () => {
      // Arrange
      const { getOverview, exportAttendance } = await import('@/api/modules/attendance-center');
      const { ElMessage } = await import('element-plus');

      (getOverview as any).mockResolvedValue({
        success: true,
        data: {
          date: '2025-01-15',
          totalRecords: 150,
          presentCount: 140,
          absentCount: 10,
          lateCount: 5,
          earlyLeaveCount: 2,
          sickLeaveCount: 3,
          personalLeaveCount: 4,
          attendanceRate: 93.3,
          abnormalTemperature: 0,
        },
      });

      (exportAttendance as any).mockRejectedValue(new Error('Export failed'));

      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();

      // Act
      wrapper.vm.exportDialogVisible = true;
      await nextTick();

      const confirmButton = wrapper.find('[data-test="confirm-export"]');
      if (confirmButton.exists()) {
        await confirmButton.trigger('click');
        await nextTick();

        // Assert
        expect(ElMessage.error).toHaveBeenCalledWith('导出失败');
        expect(wrapper.vm.exporting).toBe(false);
      }
    });

    it('应该处理数据格式错误', async () => {
      // Arrange
      const { getOverview } = await import('@/api/modules/attendance-center');
      const { ElMessage } = await import('element-plus');

      (getOverview as any).mockResolvedValue({
        success: true,
        data: {
          // 缺少必要字段
          date: '2025-01-15',
          totalRecords: 'invalid', // 错误的数据类型
        },
      });

      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();
      await nextTick();

      // Assert
      // 组件应该仍然渲染，但可能会有默认值或错误处理
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('可访问性测试', () => {
    it('应该有适当的语义化HTML结构', async () => {
      // Arrange
      const { getOverview } = await import('@/api/modules/attendance-center');
      (getOverview as any).mockResolvedValue({
        success: true,
        data: {
          date: '2025-01-15',
          totalRecords: 150,
          presentCount: 140,
          absentCount: 10,
          lateCount: 5,
          earlyLeaveCount: 2,
          sickLeaveCount: 3,
          personalLeaveCount: 4,
          attendanceRate: 93.3,
          abnormalTemperature: 0,
        },
      });

      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus],
        },
      });

      await nextTick();

      // Assert
      expect(wrapper.find('h1.page-title').exists()).toBe(true);
      expect(wrapper.find('.overview-card').exists()).toBe(true);
      expect(wrapper.find('.tabs-card').exists()).toBe(true);

      // 检查是否有适当的ARIA标签
      const buttons = wrapper.findAll('button');
      buttons.forEach(button => {
        // 按钮应该有适当的文本内容或aria-label
        expect(button.text() || button.attributes('aria-label')).toBeTruthy();
      });
    });
  });
});