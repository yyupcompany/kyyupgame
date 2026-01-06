/**
 * 用量中心页面组件单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import UsageCenterPage from '../index.vue';
import { ElMessage } from 'element-plus';

// Mock API
vi.mock('@/api/endpoints/usage-center', () => ({
  getUsageOverview: vi.fn(),
  getUserUsageList: vi.fn(),
  getUserUsageDetail: vi.fn(),
  getWarnings: vi.fn(),
  getUserQuota: vi.fn(),
  updateUserQuota: vi.fn(),
  UsageType: {
    TEXT: 'text',
    IMAGE: 'image',
    AUDIO: 'audio',
    VIDEO: 'video',
    EMBEDDING: 'embedding'
  }
}));

// Mock utils
vi.mock('@/utils/date', () => ({
  formatDate: (date: string) => date
}));

vi.mock('@/utils/excel-export', () => ({
  exportUsageToExcel: vi.fn(() => true)
}));

import {
  getUsageOverview,
  getUserUsageList,
  getUserUsageDetail,
  getWarnings,
  getUserQuota,
  updateUserQuota
} from '@/api/endpoints/usage-center';

import { exportUsageToExcel } from '@/utils/excel-export';

describe('UsageCenterPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该正确渲染页面', () => {
    const wrapper = mount(UsageCenterPage, {
      global: {
        stubs: {
          'el-card': true,
          'el-button': true,
          'el-date-picker': true,
          'el-table': true,
          'el-dialog': true,
          'UsageTypePieChart': true
        }
      }
    });

    expect(wrapper.find('h1').text()).toBe('用量中心');
    expect(wrapper.find('p').text()).toContain('查看所有用户的AI使用量和费用统计');
  });

  it('应该在挂载时加载数据', async () => {
    const mockOverview = {
      success: true,
      data: {
        totalCalls: 12500,
        totalCost: 138.456789,
        activeUsers: 45,
        usageByType: []
      }
    };

    const mockUserList = {
      success: true,
      data: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20
      }
    };

    const mockWarnings = {
      success: true,
      data: []
    };

    (getUsageOverview as any).mockResolvedValue(mockOverview);
    (getUserUsageList as any).mockResolvedValue(mockUserList);
    (getWarnings as any).mockResolvedValue(mockWarnings);

    const wrapper = mount(UsageCenterPage, {
      global: {
        stubs: {
          'el-card': true,
          'el-button': true,
          'el-date-picker': true,
          'el-table': true,
          'el-dialog': true,
          'UsageTypePieChart': true
        }
      }
    });

    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(getUsageOverview).toHaveBeenCalled();
    expect(getUserUsageList).toHaveBeenCalled();
    expect(getWarnings).toHaveBeenCalled();
  });

  it('应该正确格式化数字', () => {
    const wrapper = mount(UsageCenterPage, {
      global: {
        stubs: {
          'el-card': true,
          'el-button': true,
          'el-date-picker': true,
          'el-table': true,
          'el-dialog': true,
          'UsageTypePieChart': true
        }
      }
    });

    const vm = wrapper.vm as any;
    expect(vm.formatNumber(12500)).toBe('12,500');
    expect(vm.formatNumber(1000000)).toBe('1,000,000');
  });

  it('应该正确格式化费用', () => {
    const wrapper = mount(UsageCenterPage, {
      global: {
        stubs: {
          'el-card': true,
          'el-button': true,
          'el-date-picker': true,
          'el-table': true,
          'el-dialog': true,
          'UsageTypePieChart': true
        }
      }
    });

    const vm = wrapper.vm as any;
    expect(vm.formatCost(138.456789)).toBe('138.456789');
    expect(vm.formatCost(10.1)).toBe('10.100000');
  });

  it('应该正确获取类型名称', () => {
    const wrapper = mount(UsageCenterPage, {
      global: {
        stubs: {
          'el-card': true,
          'el-button': true,
          'el-date-picker': true,
          'el-table': true,
          'el-dialog': true,
          'UsageTypePieChart': true
        }
      }
    });

    const vm = wrapper.vm as any;
    expect(vm.getTypeName('text')).toBe('文本');
    expect(vm.getTypeName('image')).toBe('图片');
    expect(vm.getTypeName('audio')).toBe('语音');
    expect(vm.getTypeName('video')).toBe('视频');
    expect(vm.getTypeName('embedding')).toBe('向量');
  });

  it('应该正确获取进度条颜色', () => {
    const wrapper = mount(UsageCenterPage, {
      global: {
        stubs: {
          'el-card': true,
          'el-button': true,
          'el-date-picker': true,
          'el-table': true,
          'el-dialog': true,
          'UsageTypePieChart': true
        }
      }
    });

    const vm = wrapper.vm as any;
    expect(vm.getProgressColor(50)).toBe('var(--success-color)'); // 绿色
    expect(vm.getProgressColor(85)).toBe('var(--warning-color)'); // 橙色
    expect(vm.getProgressColor(100)).toBe('var(--danger-color)'); // 红色
  });

  it('应该处理CSV导出', async () => {
    const wrapper = mount(UsageCenterPage, {
      global: {
        stubs: {
          'el-card': true,
          'el-button': true,
          'el-date-picker': true,
          'el-table': true,
          'el-dialog': true,
          'UsageTypePieChart': true
        }
      }
    });

    const vm = wrapper.vm as any;
    
    // 设置测试数据
    vm.userUsageList = [
      {
        username: 'admin',
        realName: '管理员',
        email: 'admin@example.com',
        totalCalls: 1500,
        totalTokens: 150000,
        totalCost: 15.678901
      }
    ];

    // Mock Blob和URL
    global.Blob = vi.fn() as any;
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    
    // Mock document.createElement
    const mockLink = {
      setAttribute: vi.fn(),
      click: vi.fn(),
      style: {}
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

    await vm.exportCSV();

    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockLink.click).toHaveBeenCalled();
  });

  it('应该处理Excel导出', async () => {
    const wrapper = mount(UsageCenterPage, {
      global: {
        stubs: {
          'el-card': true,
          'el-button': true,
          'el-date-picker': true,
          'el-table': true,
          'el-dialog': true,
          'UsageTypePieChart': true
        }
      }
    });

    const vm = wrapper.vm as any;
    
    // 设置测试数据
    vm.userUsageList = [
      {
        username: 'admin',
        realName: '管理员',
        email: 'admin@example.com',
        totalCalls: 1500,
        totalTokens: 150000,
        totalCost: 15.678901
      }
    ];

    (exportUsageToExcel as any).mockReturnValue(true);

    await vm.exportExcel();

    expect(exportUsageToExcel).toHaveBeenCalled();
  });

  it('应该处理刷新数据', async () => {
    const mockOverview = {
      success: true,
      data: {
        totalCalls: 12500,
        totalCost: 138.456789,
        activeUsers: 45,
        usageByType: []
      }
    };

    const mockUserList = {
      success: true,
      data: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20
      }
    };

    const mockWarnings = {
      success: true,
      data: []
    };

    (getUsageOverview as any).mockResolvedValue(mockOverview);
    (getUserUsageList as any).mockResolvedValue(mockUserList);
    (getWarnings as any).mockResolvedValue(mockWarnings);

    const wrapper = mount(UsageCenterPage, {
      global: {
        stubs: {
          'el-card': true,
          'el-button': true,
          'el-date-picker': true,
          'el-table': true,
          'el-dialog': true,
          'UsageTypePieChart': true
        }
      }
    });

    const vm = wrapper.vm as any;
    
    vi.clearAllMocks();
    
    await vm.refreshData();

    expect(getUsageOverview).toHaveBeenCalled();
    expect(getUserUsageList).toHaveBeenCalled();
    expect(getWarnings).toHaveBeenCalled();
  });
});

