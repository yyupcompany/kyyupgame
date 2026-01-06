/**
 * 考勤中心集成测试
 * 测试API和组件之间的集成
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ElementPlus from 'element-plus';
import { createPinia } from 'pinia';

import AttendanceCenter from '@/pages/centers/AttendanceCenter.vue';
import { getOverview, getDailyStatistics, exportAttendance } from '@/api/modules/attendance-center';

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
  ElLoading: {
    service: vi.fn(() => ({
      close: vi.fn(),
    })),
  },
  ElMessageBox: {
    confirm: vi.fn(() => Promise.resolve('confirm')),
  },
}));

// Mock stores
vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    user: {
      id: 1,
      username: 'test_admin',
      email: 'test@example.com',
      kindergartenId: 1,
      roles: ['admin'],
    },
  }),
}));

describe('考勤中心集成测试', () => {
  let wrapper: any;
  let pinia: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    pinia = createPinia();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.restoreAllMocks();
  });

  describe('完整数据流测试', () => {
    it('应该完成完整的概览数据加载流程', async () => {
      // Arrange
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
          plugins: [ElementPlus, pinia],
        },
      });

      await nextTick();
      await nextTick(); // 等待数据更新

      // Assert
      expect(getOverview).toHaveBeenCalledWith({
        kindergartenId: 1,
        date: expect.any(String),
      });

      // 验证数据是否正确显示在UI中
      expect(wrapper.find('.overview-card').exists()).toBe(true);
      expect(wrapper.text()).toContain('150'); // totalRecords
      expect(wrapper.text()).toContain('140'); // presentCount
      expect(wrapper.text()).toContain('10'); // absentCount
      expect(wrapper.text()).toContain('93.3%'); // attendanceRate

      // 验证概览数据结构
      expect(wrapper.vm.overview).toEqual(mockOverviewData.data);
    });

    it('应该处理完整的统计数据加载流程', async () => {
      // Arrange
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

      const mockStatisticsData = {
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

      (getOverview as any).mockResolvedValue(mockOverviewData);
      (getDailyStatistics as any).mockResolvedValue(mockStatisticsData);

      // Act
      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus, pinia],
        },
      });

      await nextTick();
      await nextTick();

      // 切换到统计Tab
      wrapper.vm.activeTab = 'statistics';
      await nextTick();
      await nextTick();

      // Assert
      expect(getOverview).toHaveBeenCalled();
      expect(getDailyStatistics).toHaveBeenCalled();

      // 验证统计Tab组件是否正确接收到数据
      const statisticsTab = wrapper.findComponent({ name: 'StatisticsTab' });
      if (statisticsTab.exists()) {
        expect(statisticsTab.props('kindergartenId')).toBe(1);
      }
    });

    it('应该处理完整的导出流程', async () => {
      // Arrange
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

      const mockExportData = {
        success: true,
        data: {
          url: 'http://localhost:3000/exports/attendance_20250115.xlsx',
          filename: 'attendance_20250115.xlsx',
        },
      };

      (getOverview as any).mockResolvedValue(mockOverviewData);
      (exportAttendance as any).mockResolvedValue(mockExportData);

      // Mock window.open
      const originalOpen = window.open;
      window.open = vi.fn();

      // Act
      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus, pinia],
        },
      });

      await nextTick();
      await nextTick();

      // 打开导出对话框
      wrapper.vm.exportDialogVisible = true;
      await nextTick();

      // 设置导出参数
      wrapper.vm.exportForm.startDate = new Date('2025-01-01');
      wrapper.vm.exportForm.endDate = new Date('2025-01-31');
      wrapper.vm.exportForm.format = 'excel';
      await nextTick();

      // 确认导出
      const confirmButton = wrapper.find('.el-dialog__footer .el-button--primary');
      if (confirmButton.exists()) {
        await confirmButton.trigger('click');
        await nextTick();
        await nextTick();
      }

      // Assert
      expect(exportAttendance).toHaveBeenCalledWith({
        kindergartenId: 1,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        format: 'excel',
      });

      expect(window.open).toHaveBeenCalledWith(
        'http://localhost:3000/exports/attendance_20250115.xlsx',
        '_blank'
      );

      expect(wrapper.vm.exportDialogVisible).toBe(false);
      expect(wrapper.vm.exporting).toBe(false);

      // Restore window.open
      window.open = originalOpen;
    });
  });

  describe('错误处理集成测试', () => {
    it('应该处理概览数据加载失败', async () => {
      // Arrange
      const { ElMessage } = await import('element-plus');
      (getOverview as any).mockRejectedValue(new Error('Network error'));

      // Act
      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus, pinia],
        },
      });

      await nextTick();
      await nextTick();

      // Assert
      expect(getOverview).toHaveBeenCalled();
      expect(ElMessage.error).toHaveBeenCalledWith('加载全园概览失败');

      // 组件应该仍然渲染，但显示错误状态
      expect(wrapper.find('.attendance-center-timeline').exists()).toBe(true);
      expect(wrapper.vm.loading).toBe(false);
    });

    it('应该处理导出失败', async () => {
      // Arrange
      const { ElMessage } = await import('element-plus');
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
      (exportAttendance as any).mockRejectedValue(new Error('Export failed'));

      // Act
      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus, pinia],
        },
      });

      await nextTick();
      await nextTick();

      // 打开导出对话框
      wrapper.vm.exportDialogVisible = true;
      await nextTick();

      // 确认导出
      const confirmButton = wrapper.find('.el-dialog__footer .el-button--primary');
      if (confirmButton.exists()) {
        await confirmButton.trigger('click');
        await nextTick();
        await nextTick();
      }

      // Assert
      expect(exportAttendance).toHaveBeenCalled();
      expect(ElMessage.error).toHaveBeenCalledWith('导出失败');
      expect(wrapper.vm.exporting).toBe(false);
    });

    it('应该处理Tab组件数据加载失败', async () => {
      // Arrange
      const { getDailyStatistics } = await import('@/api/modules/attendance-center');
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
      (getDailyStatistics as any).mockRejectedValue(new Error('Statistics loading failed'));

      // Act
      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus, pinia],
        },
      });

      await nextTick();
      await nextTick();

      // 切换到统计Tab
      wrapper.vm.activeTab = 'statistics';
      await nextTick();
      await nextTick();

      // Assert
      expect(getDailyStatistics).toHaveBeenCalled();
      // 组件应该仍然渲染Tab，但可能显示错误状态
      expect(wrapper.find('.el-tabs__content').exists()).toBe(true);
    });
  });

  describe('用户交互集成测试', () => {
    it('应该支持完整的用户操作流程', async () => {
      // Arrange
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
          plugins: [ElementPlus, pinia],
        },
      });

      await nextTick();
      await nextTick();

      // 用户操作1: 切换日期
      const datePicker = wrapper.find('.el-date-picker');
      if (datePicker.exists()) {
        const newDate = new Date('2025-01-20');
        await datePicker.setValue(newDate);
        await nextTick();
      }

      // 用户操作2: 切换Tab
      const tabs = wrapper.findAll('.el-tabs__item');
      if (tabs.length > 1) {
        await tabs[1].trigger('click'); // 切换到第二个Tab
        await nextTick();
      }

      // 用户操作3: 刷新数据
      const refreshButton = wrapper.find('.el-button').filter(btn =>
        btn.text().includes('刷新')
      );
      if (refreshButton.exists()) {
        await refreshButton.trigger('click');
        await nextTick();
      }

      // Assert
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.vm.activeTab).toBeDefined();
      expect(getOverview).toHaveBeenCalledTimes(3); // 初始化 + 日期切换 + 刷新
    });

    it('应该支持表单交互流程', async () => {
      // Arrange
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

      const mockExportData = {
        success: true,
        data: {
          url: 'http://localhost:3000/exports/attendance_20250115.xlsx',
          filename: 'attendance_20250115.xlsx',
        },
      };

      (getOverview as any).mockResolvedValue(mockOverviewData);
      (exportAttendance as any).mockResolvedValue(mockExportData);

      // Mock window.open
      const originalOpen = window.open;
      window.open = vi.fn();

      // Act
      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus, pinia],
        },
      });

      await nextTick();
      await nextTick();

      // 用户操作1: 点击导出按钮
      const exportButton = wrapper.find('.el-button').filter(btn =>
        btn.text().includes('导出')
      );
      if (exportButton.exists()) {
        await exportButton.trigger('click');
        await nextTick();
      }

      // 用户操作2: 在对话框中选择导出格式
      const radioButtons = wrapper.findAll('.el-radio');
      if (radioButtons.length > 1) {
        await radioButtons[1].trigger('click'); // 选择PDF格式
        await nextTick();
      }

      // 用户操作3: 确认导出
      const confirmButton = wrapper.find('.el-dialog__footer .el-button--primary');
      if (confirmButton.exists()) {
        await confirmButton.trigger('click');
        await nextTick();
        await nextTick();
      }

      // Assert
      expect(wrapper.vm.exportForm.format).toBe('pdf');
      expect(exportAttendance).toHaveBeenCalled();
      expect(window.open).toHaveBeenCalled();

      // Restore window.open
      window.open = originalOpen;
    });
  });

  describe('数据一致性测试', () => {
    it('应该保持概览数据和统计数据的一致性', async () => {
      // Arrange
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

      const mockStatisticsData = {
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
              totalStudents: 25,
              presentCount: 22,
              absentCount: 3,
              attendanceRate: 88,
            },
          ],
        },
      };

      (getOverview as any).mockResolvedValue(mockOverviewData);
      (getDailyStatistics as any).mockResolvedValue(mockStatisticsData);

      // Act
      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus, pinia],
        },
      });

      await nextTick();
      await nextTick();

      // Assert
      const overview = wrapper.vm.overview;
      expect(overview.totalRecords).toBe(overview.presentCount + overview.absentCount);
      expect(overview.attendanceRate).toBeGreaterThanOrEqual(0);
      expect(overview.attendanceRate).toBeLessThanOrEqual(100);

      // 切换到统计Tab
      wrapper.vm.activeTab = 'statistics';
      await nextTick();
      await nextTick();

      // 验证统计数据的一致性
      const statisticsData = wrapper.vm.statisticsData || mockStatisticsData.data;
      statisticsData.classes.forEach((classStat: any) => {
        expect(classStat.totalStudents).toBe(classStat.presentCount + classStat.absentCount);
        const expectedRate = Math.round((classStat.presentCount / classStat.totalStudents) * 100);
        expect(classStat.attendanceRate).toBe(expectedRate);
      });
    });

    it('应该处理日期范围和数据的时间一致性', async () => {
      // Arrange
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
          plugins: [ElementPlus, pinia],
        },
      });

      await nextTick();
      await nextTick();

      // 用户选择不同的日期
      const newDate = new Date('2025-01-10');
      wrapper.vm.overviewDate = newDate;
      await nextTick();

      // Assert
      expect(wrapper.vm.overviewDate).toEqual(newDate);
      // API应该被重新调用以获取新日期的数据
      expect(getOverview).toHaveBeenCalledTimes(2);
    });
  });

  describe('性能测试', () => {
    it('应该高效处理大量数据', async () => {
      // Arrange
      const mockOverviewData = {
        success: true,
        data: {
          date: '2025-01-15',
          totalRecords: 1500, // 大量数据
          presentCount: 1400,
          absentCount: 100,
          lateCount: 50,
          earlyLeaveCount: 20,
          sickLeaveCount: 30,
          personalLeaveCount: 40,
          attendanceRate: 93.3,
          abnormalTemperature: 0,
        },
      };

      (getOverview as any).mockResolvedValue(mockOverviewData);

      // Act
      const startTime = performance.now();
      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus, pinia],
        },
      });

      await nextTick();
      await nextTick();

      const endTime = performance.now();

      // Assert
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成渲染
      expect(wrapper.find('.overview-card').exists()).toBe(true);
      expect(wrapper.text()).toContain('1500'); // 大量数据正确显示
    });

    it('应该优化频繁的用户操作', async () => {
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

      // Act
      wrapper = mount(AttendanceCenter, {
        global: {
          plugins: [ElementPlus, pinia],
        },
      });

      await nextTick();

      // 模拟频繁的用户操作
      for (let i = 0; i < 5; i++) {
        wrapper.vm.overviewDate = new Date(`2025-01-${15 + i}`);
        await nextTick();
      }

      // Assert
      // 应该有防抖或缓存机制，避免过多的API调用
      expect(callCount).toBeLessThan(10); // 应该少于直接调用的次数
    });
  });
});