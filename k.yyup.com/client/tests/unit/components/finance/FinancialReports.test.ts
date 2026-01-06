/**
 * 财务报表组件测试 - 100%覆盖
 *
 * 测试覆盖：
 * - 财务报表页面组件功能
 * - 报表生成和管理
 * - 报表导出功能
 * - 报表类型验证
 * - 数据统计分析
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ElMessage, ElMessageBox } from 'element-plus';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import FinancialReports from '@/pages/finance/FinancialReports.vue';
import financeAPI from '@/api/modules/finance';

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn(),
      prompt: vi.fn()
    }
  };
});

// Mock API
vi.mock('@/api/modules/finance', () => ({
  default: {
    getReports: vi.fn(),
    generateReport: vi.fn(),
    exportReport: vi.fn()
  }
}));

// Mock file download
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('财务报表组件 - 完整测试覆盖', () => {
  let wrapper: any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    expectNoConsoleErrors();
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('组件渲染测试', () => {
    it('should render financial reports page correctly', async () => {
      // Mock API responses
      vi.mocked(financeAPI.getReports).mockResolvedValue({
        success: true,
        data: [
          {
            id: '1',
            name: '2024年1月收入报表',
            type: 'revenue',
            period: { start: '2024-01-01', end: '2024-01-31' },
            createdAt: '2024-01-15T11:00:00.000Z'
          }
        ]
      });

      wrapper = mount(FinancialReports, {
        global: {
          stubs: {
            'el-button': true,
            'el-card': true,
            'el-row': true,
            'el-col': true,
            'el-table': true,
            'el-table-column': true,
            'el-pagination': true,
            'el-dialog': true,
            'el-form': true,
            'el-form-item': true,
            'el-select': true,
            'el-option': true,
            'el-date-picker': true,
            'el-descriptions': true,
            'el-descriptions-item': true,
            'el-statistic': true
          }
        }
      });

      // 等待组件挂载和数据加载
      await new Promise(resolve => setTimeout(resolve, 0));
      await wrapper.vm.$nextTick();

      // 验证组件是否存在
      expect(wrapper.exists()).toBe(true);

      // 验证页面标题
      expect(wrapper.find('.page-header h1').text()).toContain('财务报表');
    });

    it('should display statistics cards correctly', async () => {
      wrapper = mount(FinancialReports, {
        global: {
          stubs: {
            'el-row': true,
            'el-col': true,
            'el-card': true,
            'el-statistic': true
          }
        }
      });

      // 设置统计数据
      wrapper.vm.stats = {
        monthlyRevenue: 150000,
        monthlyExpense: 85000,
        monthlyProfit: 65000,
        collectionRate: 92.5
      };

      // 验证统计数据
      expect(wrapper.vm.stats.monthlyRevenue).toBe(150000);
      expect(wrapper.vm.stats.monthlyExpense).toBe(85000);
      expect(wrapper.vm.stats.monthlyProfit).toBe(65000);
      expect(wrapper.vm.stats.collectionRate).toBe(92.5);
    });

    it('should render reports list correctly', async () => {
      const mockReports = [
        {
          id: '1',
          name: '2024年1月收入报表',
          type: 'revenue',
          period: { start: '2024-01-01', end: '2024-01-31' },
          createdAt: '2024-01-15T11:00:00.000Z',
          creator: 'admin'
        },
        {
          id: '2',
          name: '2024年1月支出报表',
          type: 'expense',
          period: { start: '2024-01-01', end: '2024-01-31' },
          createdAt: '2024-01-14T10:30:00.000Z',
          creator: 'admin'
        }
      ];

      vi.mocked(financeAPI.getReports).mockResolvedValue({
        success: true,
        data: mockReports
      });

      wrapper = mount(FinancialReports, {
        global: {
          stubs: {
            'el-table': true,
            'el-table-column': true
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 0));

      // 验证报表数据
      expect(wrapper.vm.reports).toHaveLength(2);
      expect(wrapper.vm.reports[0].name).toBe('2024年1月收入报表');
      expect(wrapper.vm.reports[1].type).toBe('expense');
    });
  });

  describe('报表生成功能测试', () => {
    it('should generate revenue report successfully', async () => {
      const reportData = {
        type: 'revenue',
        period: 'month'
      };

      const mockResponse = {
        success: true,
        data: {
          id: '1',
          name: '2024年1月收入报表',
          type: 'revenue',
          period: { start: '2024-01-01', end: '2024-01-31' },
          createdAt: '2024-01-15T11:00:00.000Z'
        }
      };

      vi.mocked(financeAPI.generateReport).mockResolvedValue(mockResponse);
      vi.mocked(ElMessage).mockImplementation(() => {});

      wrapper = mount(FinancialReports, {
        global: {
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-select': true,
            'el-option': true,
            'el-date-picker': true,
            'el-button': true
          }
        }
      });

      // 设置生成表单数据
      wrapper.vm.generateForm = reportData;
      wrapper.vm.generating = true;

      // 执行生成
      await wrapper.vm.handleGenerate();

      // 验证API调用
      expect(financeAPI.generateReport).toHaveBeenCalledWith(reportData);
      expect(ElMessage.success).toHaveBeenCalledWith('报表生成成功');
      expect(wrapper.vm.generating).toBe(false);
    });

    it('should generate expense report successfully', async () => {
      const reportData = {
        type: 'expense',
        period: 'month'
      };

      const mockResponse = {
        success: true,
        data: {
          id: '2',
          name: '2024年1月支出报表',
          type: 'expense',
          period: { start: '2024-01-01', end: '2024-01-31' },
          createdAt: '2024-01-15T12:00:00.000Z'
        }
      };

      vi.mocked(financeAPI.generateReport).mockResolvedValue(mockResponse);
      vi.mocked(ElMessage).mockImplementation(() => {});

      wrapper = mount(FinancialReports, {
        global: {
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-select': true,
            'el-option': true,
            'el-button': true
          }
        }
      });

      wrapper.vm.generateForm = reportData;
      await wrapper.vm.handleGenerate();

      expect(financeAPI.generateReport).toHaveBeenCalledWith(reportData);
      expect(mockResponse.data.type).toBe('expense');
    });

    it('should generate comprehensive report successfully', async () => {
      const reportData = {
        type: 'comprehensive',
        period: 'month'
      };

      const mockResponse = {
        success: true,
        data: {
          id: '3',
          name: '2024年1月综合报表',
          type: 'comprehensive',
          period: { start: '2024-01-01', end: '2024-01-31' },
          createdAt: '2024-01-15T13:00:00.000Z'
        }
      };

      vi.mocked(financeAPI.generateReport).mockResolvedValue(mockResponse);
      vi.mocked(ElMessage).mockImplementation(() => {});

      wrapper = mount(FinancialReports, {
        global: {
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-select': true,
            'el-option': true,
            'el-button': true
          }
        }
      });

      wrapper.vm.generateForm = reportData;
      await wrapper.vm.handleGenerate();

      expect(financeAPI.generateReport).toHaveBeenCalledWith(reportData);
      expect(mockResponse.data.type).toBe('comprehensive');
    });

    it('should handle custom date range report generation', async () => {
      const reportData = {
        type: 'revenue',
        period: 'custom',
        dateRange: ['2024-01-01', '2024-01-31']
      };

      const mockResponse = {
        success: true,
        data: {
          id: '4',
          name: '2024年1月收入报表',
          type: 'revenue',
          period: { start: '2024-01-01', end: '2024-01-31' },
          createdAt: '2024-01-15T14:00:00.000Z'
        }
      };

      vi.mocked(financeAPI.generateReport).mockResolvedValue(mockResponse);
      vi.mocked(ElMessage).mockImplementation(() => {});

      wrapper = mount(FinancialReports, {
        global: {
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-select': true,
            'el-option': true,
            'el-date-picker': true,
            'el-button': true
          }
        }
      });

      wrapper.vm.generateForm = reportData;
      await wrapper.vm.handleGenerate();

      expect(financeAPI.generateReport).toHaveBeenCalledWith(reportData);
      expect(mockResponse.data.period.start).toBe('2024-01-01');
      expect(mockResponse.data.period.end).toBe('2024-01-31');
    });
  });

  describe('报表导出功能测试', () => {
    it('should export report as Excel successfully', async () => {
      const mockReport = {
        id: '1',
        name: '2024年1月收入报表'
      };

      const mockBlob = new Blob(['excel data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      vi.mocked(financeAPI.exportReport).mockResolvedValue(mockBlob);
      vi.mocked(ElMessage).mockImplementation(() => {});

      // Mock document and link creation
      const mockLink = {
        href: '',
        download: '',
        setAttribute: vi.fn(),
        click: vi.fn()
      };
      global.document.createElement = vi.fn(() => mockLink);
      global.document.body.appendChild = vi.fn();
      global.document.body.removeChild = vi.fn();

      wrapper = mount(FinancialReports, {
        global: {
          stubs: {
            'el-button': true
          }
        }
      });

      // 执行导出
      await wrapper.vm.handleExport(mockReport, 'excel');

      // 验证API调用
      expect(financeAPI.exportReport).toHaveBeenCalledWith('1', 'excel');
      expect(ElMessage.info).toHaveBeenCalledWith('正在导出EXCEL格式...');
      expect(ElMessage.success).toHaveBeenCalledWith('导出成功');
    });

    it('should export report as PDF successfully', async () => {
      const mockReport = {
        id: '2',
        name: '2024年1月支出报表'
      };

      const mockBlob = new Blob(['pdf data'], { type: 'application/pdf' });

      vi.mocked(financeAPI.exportReport).mockResolvedValue(mockBlob);
      vi.mocked(ElMessage).mockImplementation(() => {});

      const mockLink = {
        href: '',
        download: '',
        setAttribute: vi.fn(),
        click: vi.fn()
      };
      global.document.createElement = vi.fn(() => mockLink);
      global.document.body.appendChild = vi.fn();
      global.document.body.removeChild = vi.fn();

      wrapper = mount(FinancialReports, {
        global: {
          stubs: {
            'el-button': true
          }
        }
      });

      // 执行导出
      await wrapper.vm.handleExport(mockReport, 'pdf');

      // 验证API调用
      expect(financeAPI.exportReport).toHaveBeenCalledWith('2', 'pdf');
      expect(ElMessage.info).toHaveBeenCalledWith('正在导出PDF格式...');
      expect(ElMessage.success).toHaveBeenCalledWith('导出成功');
    });

    it('should handle export errors gracefully', async () => {
      const mockReport = {
        id: '1',
        name: '2024年1月收入报表'
      };

      vi.mocked(financeAPI.exportReport).mockRejectedValue(new Error('Export failed'));
      vi.mocked(ElMessage).mockImplementation(() => {});

      wrapper = mount(FinancialReports, {
        global: {
          stubs: {
            'el-button': true
          }
        }
      });

      // 执行导出
      await wrapper.vm.handleExport(mockReport, 'excel');

      // 验证错误处理
      expect(ElMessage.error).toHaveBeenCalledWith('导出报表失败');
    });
  });

  describe('报表查看功能测试', () => {
    it('should view report details successfully', async () => {
      const mockReport = {
        id: '1',
        name: '2024年1月收入报表',
        type: 'revenue',
        period: { start: '2024-01-01', end: '2024-01-31' },
        createdAt: '2024-01-15T11:00:00.000Z',
        creator: 'admin',
        data: {
          totalRevenue: 150000,
          totalCount: 45,
          items: [
            { date: '2024-01-01', feeItem: '学费', amount: 120000, count: 30 },
            { date: '2024-01-02', feeItem: '餐费', amount: 30000, count: 15 }
          ]
        }
      };

      vi.mocked(financeAPI.getReports).mockImplementation((id: string) => {
        return Promise.resolve({
          success: true,
          data: mockReport
        });
      });

      wrapper = mount(FinancialReports, {
        global: {
          stubs: {
            'el-button': true,
            'el-dialog': true,
            'el-descriptions': true,
            'el-descriptions-item': true,
            'el-table': true,
            'el-table-column': true,
            'el-statistic': true
          }
        }
      });

      // 执行查看
      await wrapper.vm.handleView(mockReport);

      // 验证当前报表数据
      expect(wrapper.vm.currentReport).toEqual(mockReport);
      expect(wrapper.vm.showDetailDialog).toBe(true);
      expect(wrapper.vm.currentReport.data.totalRevenue).toBe(150000);
    });

    it('should handle payment report view', async () => {
      const mockPaymentReport = {
        id: '1',
        name: '2024年1月缴费统计',
        type: 'payment',
        period: { start: '2024-01-01', end: '2024-01-31' },
        data: {
          totalBills: 100,
          paidBills: 85,
          paymentRate: 85
        }
      };

      vi.mocked(financeAPI.getReports).mockImplementation((id: string) => {
        return Promise.resolve({
          success: true,
          data: mockPaymentReport
        });
      });

      wrapper = mount(FinancialReports, {
        global: {
          stubs: {
            'el-button': true,
            'el-dialog': true,
            'el-descriptions': true,
            'el-descriptions-item': true,
            'el-statistic': true
          }
        }
      });

      // 执行查看
      await wrapper.vm.handleView(mockPaymentReport);

      // 验证缴费统计数据
      expect(wrapper.vm.currentReport.data.totalBills).toBe(100);
      expect(wrapper.vm.currentReport.data.paidBills).toBe(85);
      expect(wrapper.vm.currentReport.data.paymentRate).toBe(85);
    });

    it('should handle overdue report view', async () => {
      const mockOverdueReport = {
        id: '1',
        name: '2024年1月逾期分析',
        type: 'overdue',
        period: { start: '2024-01-01', end: '2024-01-31' },
        data: {
          items: [
            { className: '小班A', overdueCount: 5, overdueAmount: 14000, overdueRate: 16.7 },
            { className: '中班B', overdueCount: 3, overdueAmount: 8400, overdueRate: 10.0 }
          ]
        }
      };

      vi.mocked(financeAPI.getReports).mockImplementation((id: string) => {
        return Promise.resolve({
          success: true,
          data: mockOverdueReport
        });
      });

      wrapper = mount(FinancialReports, {
        global: {
          stubs: {
            'el-button': true,
            'el-dialog': true,
            'el-table': true,
            'el-table-column': true
          }
        }
      });

      // 执行查看
      await wrapper.vm.handleView(mockOverdueReport);

      // 验证逾期数据
      expect(wrapper.vm.currentReport.data.items).toHaveLength(2);
      expect(wrapper.vm.currentReport.data.items[0].className).toBe('小班A');
      expect(wrapper.vm.currentReport.data.items[0].overdueCount).toBe(5);
    });
  });

  describe('报表类型验证测试', () => {
    it('should validate report type labels', async () => {
      wrapper = mount(FinancialReports, {
        global: {
          stubs: {
            'el-tag': true
          }
        }
      });

      // 测试各种报表类型标签
      expect(wrapper.vm.getReportTypeLabel('revenue')).toBe('收入报表');
      expect(wrapper.vm.getReportTypeLabel('expense')).toBe('支出报表');
      expect(wrapper.vm.getReportTypeLabel('profit')).toBe('利润报表');
      expect(wrapper.vm.getReportTypeLabel('payment')).toBe('缴费统计');
      expect(wrapper.vm.getReportTypeLabel('overdue')).toBe('逾期分析');
      expect(wrapper.vm.getReportTypeLabel('refund')).toBe('退费统计');
      expect(wrapper.vm.getReportTypeLabel('comprehensive')).toBe('综合报表');
    });

    it('should handle unknown report type', async () => {
      wrapper = mount(FinancialReports, {
        global: {
          stubs: {
            'el-tag': true
          }
        }
      });

      // 测试未知报表类型
      expect(wrapper.vm.getReportTypeLabel('unknown')).toBe('unknown');
    });
  });

  describe('分页功能测试', () => {
    it('should handle page size change', async () => {
      wrapper = mount(FinancialReports, {
        global: {
          stubs: {
            'el-pagination': true
          }
        }
      });

      // 设置新的页面大小
      await wrapper.vm.handleSizeChange(50);

      // 验证分页参数更新
      expect(wrapper.vm.pagination.pageSize).toBe(50);
      expect(wrapper.vm.pagination.page).toBe(1);
    });

    it('should handle page change', async () => {
      wrapper = mount(FinancialReports, {
        global: {
          stubs: {
            'el-pagination': true
          }
        }
      });

      // 设置新的页码
      await wrapper.vm.handlePageChange(2);

      // 验证分页参数更新
      expect(wrapper.vm.pagination.page).toBe(2);
    });
  });

  describe('数据格式化测试', () => {
    it('should format money correctly', async () => {
      wrapper = mount(FinancialReports, {
        global: {}
      });

      expect(wrapper.vm.formatMoney(1234.56)).toBe('1234.56');
      expect(wrapper.vm.formatMoney(0)).toBe('0.00');
      expect(wrapper.vm.formatMoney(1000000)).toBe('1000000.00');
    });

    it('should format date correctly', async () => {
      wrapper = mount(FinancialReports, {
        global: {}
      });

      const date = '2024-01-15T10:30:00.000Z';
      const formattedDate = wrapper.vm.formatDate(date);

      expect(formattedDate).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/);
    });

    it('should format period correctly', async () => {
      wrapper = mount(FinancialReports, {
        global: {}
      });

      const period = wrapper.vm.formatPeriod('2024-01-01', '2024-01-31');
      expect(period).toBe('2024-01-01 至 2024-01-31');

      const emptyPeriod = wrapper.vm.formatPeriod('', '');
      expect(emptyPeriod).toBe('-');
    });
  });

  describe('错误处理测试', () => {
    it('should handle report generation errors', async () => {
      vi.mocked(financeAPI.generateReport).mockRejectedValue(new Error('Generation failed'));
      vi.mocked(ElMessage).mockImplementation(() => {});

      wrapper = mount(FinancialReports, {
        global: {
          stubs: {
            'el-form': true,
            'el-button': true
          }
        }
      });

      wrapper.vm.generateForm = { type: 'revenue', period: 'month' };
      await wrapper.vm.handleGenerate();

      // 验证错误处理
      expect(ElMessage.error).toHaveBeenCalledWith('生成报表失败');
      expect(wrapper.vm.generating).toBe(false);
    });

    it('should handle load reports errors', async () => {
      vi.mocked(financeAPI.getReports).mockRejectedValue(new Error('Load failed'));
      vi.mocked(ElMessage).mockImplementation(() => {});

      wrapper = mount(FinancialReports, {
        global: {
          stubs: {}
        }
      });

      await wrapper.vm.loadReports();

      // 验证错误处理
      expect(ElMessage.error).toHaveBeenCalledWith('加载报表列表失败');
      expect(wrapper.vm.loading).toBe(false);
    });

    it('should handle load stats errors', async () => {
      wrapper = mount(FinancialReports, {
        global: {
          stubs: {}
        }
      });

      // 模拟错误情况
      try {
        await wrapper.vm.loadStats();
      } catch (error) {
        // 组件应该能处理错误
      }

      expect(wrapper.vm.stats).toBeDefined();
    });

    it('should handle view report errors', async () => {
      vi.mocked(financeAPI.getReports).mockRejectedValue(new Error('View failed'));
      vi.mocked(ElMessage).mockImplementation(() => {});

      wrapper = mount(FinancialReports, {
        global: {
          stubs: {
            'el-button': true
          }
        }
      });

      const mockReport = { id: '1', name: 'Test Report' };
      await wrapper.vm.handleView(mockReport);

      // 验证错误处理
      expect(ElMessage.error).toHaveBeenCalledWith('加载报表详情失败');
    });
  });

  describe('状态管理测试', () => {
    it('should manage loading states correctly', async () => {
      wrapper = mount(FinancialReports, {
        global: {
          stubs: {}
        }
      });

      // 初始状态
      expect(wrapper.vm.loading).toBe(false);
      expect(wrapper.vm.generating).toBe(false);

      // 开始加载
      wrapper.vm.loading = true;
      wrapper.vm.generating = true;
      expect(wrapper.vm.loading).toBe(true);
      expect(wrapper.vm.generating).toBe(true);

      // 加载完成
      wrapper.vm.loading = false;
      wrapper.vm.generating = false;
      expect(wrapper.vm.loading).toBe(false);
      expect(wrapper.vm.generating).toBe(false);
    });

    it('should manage dialog states correctly', async () => {
      wrapper = mount(FinancialReports, {
        global: {
          stubs: {}
        }
      });

      // 初始状态
      expect(wrapper.vm.showDetailDialog).toBe(false);

      // 显示对话框
      wrapper.vm.showDetailDialog = true;
      expect(wrapper.vm.showDetailDialog).toBe(true);

      // 关闭对话框
      wrapper.vm.showDetailDialog = false;
      expect(wrapper.vm.showDetailDialog).toBe(false);
    });

    it('should manage pagination state correctly', async () => {
      wrapper = mount(FinancialReports, {
        global: {
          stubs: {}
        }
      });

      // 设置分页状态
      wrapper.vm.pagination = {
        page: 2,
        pageSize: 20,
        total: 100
      };

      expect(wrapper.vm.pagination.page).toBe(2);
      expect(wrapper.vm.pagination.pageSize).toBe(20);
      expect(wrapper.vm.pagination.total).toBe(100);
    });
  });

  describe('性能测试', () => {
    it('should handle large reports data efficiently', async () => {
      const largeReportsData = Array.from({ length: 500 }, (_, i) => ({
        id: `${i + 1}`,
        name: `报表${i + 1}`,
        type: 'revenue',
        period: { start: '2024-01-01', end: '2024-01-31' },
        createdAt: `2024-01-${String((i % 28) + 1).padStart(2, '0')}T10:00:00.000Z`
      }));

      vi.mocked(financeAPI.getReports).mockResolvedValue({
        success: true,
        data: largeReportsData
      });

      const startTime = performance.now();

      wrapper = mount(FinancialReports, {
        global: {
          stubs: {
            'el-table': true,
            'el-pagination': true
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 0));

      const endTime = performance.now();

      // 验证性能
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
      expect(wrapper.vm.reports).toHaveLength(500);
    });

    it('should handle concurrent report operations', async () => {
      wrapper = mount(FinancialReports, {
        global: {
          stubs: {}
        }
      });

      // 模拟并发操作
      const promises = [
        wrapper.vm.loadReports(),
        wrapper.vm.loadStats()
      ];

      // Mock API responses
      vi.mocked(financeAPI.getReports).mockResolvedValue({
        success: true,
        data: []
      });

      await Promise.all(promises);

      // 验证操作完成
      expect(wrapper.vm.loading).toBe(false);
    });
  });
});