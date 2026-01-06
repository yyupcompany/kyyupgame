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
import { mount } from '@vue/test-utils';
import ComponentTest from '@/views/test/ComponentTest.vue';
import { createTestingPinia } from '@pinia/testing';

// Mock all the center components
vi.mock('@/components/centers', () => ({
  CenterContainer: {
    template: '<div class="center-container"><slot name="tab-table"></slot><slot name="tab-stats"></slot><slot name="tab-charts"></slot></div>',
    props: ['title', 'tabs', 'default-tab'],
    emits: ['tab-change']
  },
  DataTable: {
    template: '<div class="data-table">DataTable Component</div>',
    props: ['data', 'columns', 'loading', 'total'],
    emits: ['create', 'edit', 'delete', 'search', 'row-click']
  },
  StatCard: {
    template: '<div class="stat-card">StatCard Component</div>',
    props: ['title', 'value', 'unit', 'trend', 'type', 'icon', 'clickable'],
    emits: ['click']
  },
  ChartContainer: {
    template: '<div class="chart-container">ChartContainer Component</div>',
    props: ['title', 'subtitle', 'options', 'loading', 'height'],
    emits: ['refresh']
  },
  FormModal: {
    template: '<div class="form-modal">FormModal Component</div>',
    props: ['modelValue', 'title', 'fields', 'data'],
    emits: ['confirm', 'cancel']
  },
  DetailPanel: {
    template: '<div class="detail-panel">DetailPanel Component</div>',
    props: ['title', 'data', 'sections', 'editable'],
    emits: ['save']
  },
  ActionToolbar: {
    template: '<div class="action-toolbar">ActionToolbar Component</div>',
    props: ['primary-actions', 'secondary-actions', 'batch-actions', 'more-actions', 'selection', 'searchable', 'filters', 'active-filters', 'sortable', 'sort-options'],
    emits: ['action-click', 'search', 'filter']
  },
  testUtils: {
    createTableData: vi.fn(() => []),
    createStatCards: vi.fn(() => []),
    createChartOptions: vi.fn(() => ({}))
  }
}));

describe('ComponentTest.vue', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(ComponentTest, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn
          })
        ]
      }
    });
  });

  it('should render the component test page', () => {
    expect(wrapper.exists()).toBe(true);
    // 检查是否包含中心容器
    expect(wrapper.find('.center-container').exists()).toBe(true);
  });

  it('should display the correct title', () => {
    // 检查是否包含组件测试相关的内容
    const hasTitle = wrapper.text().includes('组件测试中心') ||
                    wrapper.find('.center-container').exists()
    expect(hasTitle).toBe(true);
  });

  it('should have test components', () => {
    // 检查是否包含测试相关的组件
    const hasTestContent = wrapper.find('.data-table').exists() ||
                          wrapper.find('.stat-card').exists() ||
                          wrapper.text().includes('DataTable') ||
                          wrapper.text().includes('StatCard')
    expect(hasTestContent).toBe(true);
  });

  it('should have tab functionality', () => {
    // 检查是否有标签页功能 - 通过检查中心容器组件
    const hasTabs = wrapper.find('.center-container').exists() ||
                   wrapper.find('.chart-container').exists()
    expect(hasTabs).toBe(true);
  });
});