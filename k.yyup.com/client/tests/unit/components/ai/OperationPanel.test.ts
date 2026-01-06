import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import OperationPanel from '@/components/ai/OperationPanel.vue';
import { createComponentWrapper, waitForUpdate, createTestCleanup } from '../../utils/component-test-helper';

// 控制台错误检测变量
let consoleSpy: any

describe('OperationPanel', () => {
  let wrapper: VueWrapper<any>;
  const cleanup = createTestCleanup();

  const mockSteps = [
    {
      title: 'Step 1',
      description: 'First step description',
      status: 'finish',
      icon: 'el-icon-check'
    },
    {
      title: 'Step 2',
      description: 'Second step description',
      status: 'process',
      icon: 'el-icon-loading'
    },
    {
      title: 'Step 3',
      description: 'Third step description',
      status: 'wait',
      icon: 'el-icon-time'
    }
  ];

  const mockTableResults = {
    type: 'table',
    data: [
      { name: 'Item 1', value: 100, status: 'Active' },
      { name: 'Item 2', value: 200, status: 'Inactive' }
    ],
    columns: [
      { prop: 'name', label: 'Name' },
      { prop: 'value', label: 'Value' },
      { prop: 'status', label: 'Status' }
    ]
  };

  const mockStatsResults = {
    type: 'stats',
    data: [
      { label: 'Total Users', value: '1,234' },
      { label: 'Active Sessions', value: '567' },
      { label: 'Completion Rate', value: '89%' }
    ]
  };

  const mockTextResults = {
    type: 'text',
    data: 'Operation completed successfully.\nAll tasks finished without errors.'
  };

  const mockJsonResults = {
    type: 'json',
    data: {
      status: 'success',
      timestamp: '2024-01-01T12:00:00Z',
      results: {
        processed: 100,
        failed: 0
      }
    }
  };

  const createWrapper = (props = {}) => {
    return createComponentWrapper(OperationPanel, {
      props: {
        title: 'Test Operation',
        status: 'running',
        steps: [],
        activeStep: 0,
        showActions: true,
        canRetry: false,
        canContinue: false,
        ...props
      },
      withPinia: true,
      withRouter: false,
      global: {
        stubs: {
          'el-tag': { template: '<div class="el-tag"><slot /></div>' },
          'el-steps': { template: '<div class="el-steps"><slot /></div>' },
          'el-step': { template: '<div class="el-step"><slot /></div>' },
          'el-card': { template: '<div class="el-card"><slot /></div>' },
          'el-table': { template: '<div class="el-table"><slot /></div>' },
          'el-table-column': { template: '<div class="el-table-column"><slot /></div>' },
          'el-tree': { template: '<div class="el-tree"><slot /></div>' },
          'el-button': { template: '<button class="el-button"><slot /></button>' },
          'el-icon': { template: '<i class="el-icon"><slot /></i>' }
        }
      }
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
    cleanup.addCleanup(() => wrapper?.unmount());
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    cleanup.cleanup();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('Component Rendering', () => {
    it('should render correctly with default props', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.operation-panel').exists()).toBe(true);
      expect(wrapper.find('.panel-header').exists()).toBe(true);
    });

    it('should display correct title', () => {
      const title = wrapper.find('.panel-header h3');
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe('Test Operation');
    });

    it('should display status tag', () => {
      const statusTag = wrapper.find('.el-tag');
      expect(statusTag.exists()).toBe(true);
      expect(statusTag.text()).toContain('执行中');
    });

    it('should render operation content', () => {
      expect(wrapper.find('.operation-content').exists()).toBe(true);
    });
  });

  describe('Status Display', () => {
    it('should display pending status', () => {
      wrapper = createWrapper({ status: 'pending' });
      cleanup.addCleanup(() => wrapper?.unmount());

      const statusTag = wrapper.find('.el-tag');
      expect(statusTag.exists()).toBe(true);
      expect(statusTag.text()).toContain('准备中');
    });

    it('should display running status', () => {
      wrapper = createWrapper({ status: 'running' });
      cleanup.addCleanup(() => wrapper?.unmount());

      const statusTag = wrapper.find('.el-tag');
      expect(statusTag.exists()).toBe(true);
      expect(statusTag.text()).toContain('执行中');
    });

    it('should display success status', () => {
      wrapper = createWrapper({ status: 'success' });
      cleanup.addCleanup(() => wrapper?.unmount());

      const statusTag = wrapper.find('.el-tag');
      expect(statusTag.exists()).toBe(true);
      expect(statusTag.text()).toContain('已完成');
    });

    it('should display error status', () => {
      wrapper = createWrapper({ status: 'error' });
      
      const statusTag = wrapper.find('.panel-header .el-tag');
      expect(statusTag.attributes('type')).toBe('danger');
      expect(statusTag.text()).toBe('执行失败');
    });

    it('should handle unknown status', () => {
      wrapper = createWrapper({ status: 'unknown' as any });
      
      const statusTag = wrapper.find('.panel-header .el-tag');
      expect(statusTag.attributes('type')).toBe('info');
      expect(statusTag.text()).toBe('未知');
    });
  });

  describe('Steps Display', () => {
    beforeEach(async () => {
      wrapper = createWrapper({
        steps: mockSteps,
        activeStep: 1
      });
      cleanup.addCleanup(() => wrapper?.unmount());
      await waitForUpdate(wrapper);
    });

    it('should render steps container', () => {
      expect(wrapper.find('.steps-container').exists()).toBe(true);
      expect(wrapper.find('.el-steps').exists()).toBe(true);
    });

    it('should display correct number of steps', () => {
      const steps = wrapper.findAll('.el-step');
      expect(steps.length).toBe(3);
    });

    it('should set active step correctly', () => {
      // 检查组件的props而不是DOM属性
      const vm = wrapper.vm as any;
      expect(vm.activeStep).toBe(1);
    });

    it('should pass step properties correctly', () => {
      // 检查传入的步骤数据
      const vm = wrapper.vm as any;
      expect(vm.steps).toHaveLength(3);
      expect(vm.steps[0].title).toBe('Step 1');
      expect(vm.steps[0].description).toBe('First step description');
      expect(vm.steps[0].status).toBe('finish');
    });

    it('should not render steps when empty', () => {
      wrapper = createWrapper({ steps: [] });
      cleanup.addCleanup(() => wrapper?.unmount());
      expect(wrapper.find('.steps-container').exists()).toBe(false);
    });
  });

  describe('Screenshot Display', () => {
    const mockScreenshot = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const mockHighlights = [
      { style: { top: '10px', left: '10px', width: '100px', height: '50px' } },
      { style: { top: '100px', left: '50px', width: '150px', height: '75px' } }
    ];

    beforeEach(async () => {
      await wrapper.setProps({
        screenshot: mockScreenshot,
        highlights: mockHighlights
      });
    });

    it('should render screenshot container', () => {
      expect(wrapper.find('.screenshot-container').exists()).toBe(true);
    });

    it('should display screenshot image', () => {
      const screenshotWrapper = wrapper.find('.screenshot-wrapper');
      expect(screenshotWrapper.exists()).toBe(true);
      
      const image = screenshotWrapper.find('img');
      expect(image.exists()).toBe(true);
      expect(image.attributes('src')).toBe(mockScreenshot);
      expect(image.attributes('alt')).toBe('页面截图');
    });

    it('should render highlight boxes', () => {
      const highlights = wrapper.findAll('.highlight-box');
      expect(highlights.length).toBe(2);
      
      expect(highlights[0].attributes('style')).toContain('top: 10px');
      expect(highlights[0].attributes('style')).toContain('left: 10px');
      expect(highlights[0].attributes('style')).toContain('width: 100px');
      expect(highlights[0].attributes('style')).toContain('height: 50px');
      
      expect(highlights[1].attributes('style')).toContain('top: 100px');
      expect(highlights[1].attributes('style')).toContain('left: 50px');
    });

    it('should not render highlights when empty', async () => {
      await wrapper.setProps({ highlights: [] });
      
      const highlights = wrapper.findAll('.highlight-box');
      expect(highlights.length).toBe(0);
    });

    it('should not render screenshot when not provided', () => {
      wrapper = createWrapper();
      expect(wrapper.find('.screenshot-container').exists()).toBe(false);
    });
  });

  describe('Results Display', () => {
    describe('Table Results', () => {
      beforeEach(async () => {
        await wrapper.setProps({ results: mockTableResults });
      });

      it('should render results container', () => {
        expect(wrapper.find('.results-container').exists()).toBe(true);
      });

      it('should display table with data', () => {
        const table = wrapper.find('.el-table');
        expect(table.exists()).toBe(true);
        expect(table.props('data')).toEqual(mockTableResults.data);
      });

      it('should display table columns', () => {
        const columns = wrapper.findAll('.el-table-column');
        expect(columns.length).toBe(3);
        
        expect(columns[0].props('prop')).toBe('name');
        expect(columns[0].props('label')).toBe('Name');
        
        expect(columns[1].props('prop')).toBe('value');
        expect(columns[1].props('label')).toBe('Value');
        
        expect(columns[2].props('prop')).toBe('status');
        expect(columns[2].props('label')).toBe('Status');
      });

      it('should display results header', () => {
        const header = wrapper.find('.results-container h4');
        expect(header.exists()).toBe(true);
        expect(header.text()).toBe('执行结果');
      });
    });

    describe('Statistics Results', () => {
      beforeEach(async () => {
        await wrapper.setProps({ results: mockStatsResults });
      });

      it('should render statistics grid', () => {
        const statsGrid = wrapper.find('.stats-grid');
        expect(statsGrid.exists()).toBe(true);
      });

      it('should display stat cards', () => {
        const statCards = wrapper.findAll('.stat-card');
        expect(statCards.length).toBe(3);
        
        expect(statCards[0].find('.stat-value').text()).toBe('1,234');
        expect(statCards[0].find('.stat-label').text()).toBe('Total Users');
        
        expect(statCards[1].find('.stat-value').text()).toBe('567');
        expect(statCards[1].find('.stat-label').text()).toBe('Active Sessions');
        
        expect(statCards[2].find('.stat-value').text()).toBe('89%');
        expect(statCards[2].find('.stat-label').text()).toBe('Completion Rate');
      });
    });

    describe('Text Results', () => {
      beforeEach(async () => {
        await wrapper.setProps({ results: mockTextResults });
      });

      it('should render text result', () => {
        const textResult = wrapper.find('.text-result');
        expect(textResult.exists()).toBe(true);
        
        const pre = textResult.find('pre');
        expect(pre.exists()).toBe(true);
        expect(pre.text()).toBe(mockTextResults.data);
      });
    });

    describe('JSON Results', () => {
      beforeEach(async () => {
        await wrapper.setProps({ results: mockJsonResults });
      });

      it('should render JSON tree', () => {
        const jsonResult = wrapper.find('.json-result');
        expect(jsonResult.exists()).toBe(true);
        
        const tree = wrapper.find('.el-tree');
        expect(tree.exists()).toBe(true);
        expect(tree.props('data')).toEqual([mockJsonResults.data]);
      });
    });

    it('should not render results when not provided', () => {
      expect(wrapper.find('.results-container').exists()).toBe(false);
    });
  });

  describe('Action Buttons', () => {
    it('should render action buttons when showActions is true', () => {
      expect(wrapper.find('.action-buttons').exists()).toBe(true);
    });

    it('should not render action buttons when showActions is false', async () => {
      await wrapper.setProps({ showActions: false });
      expect(wrapper.find('.action-buttons').exists()).toBe(false);
    });

    it('should display retry button when canRetry is true', async () => {
      await wrapper.setProps({ canRetry: true });
      
      const retryButton = wrapper.find('.action-buttons .el-button[type="warning"]');
      expect(retryButton.exists()).toBe(true);
      expect(retryButton.text()).toBe('重试');
    });

    it('should not display retry button when canRetry is false', () => {
      const retryButton = wrapper.find('.action-buttons .el-button[type="warning"]');
      expect(retryButton.exists()).toBe(false);
    });

    it('should display continue button when canContinue is true', async () => {
      await wrapper.setProps({ canContinue: true });
      
      const continueButton = wrapper.find('.action-buttons .el-button[type="primary"]');
      expect(continueButton.exists()).toBe(true);
      expect(continueButton.text()).toBe('继续');
    });

    it('should not display continue button when canContinue is false', () => {
      const continueButton = wrapper.find('.action-buttons .el-button[type="primary"]');
      expect(continueButton.exists()).toBe(false);
    });

    it('should always display close button', () => {
      const closeButton = wrapper.find('.action-buttons .el-button:not([type])');
      expect(closeButton.exists()).toBe(true);
      expect(closeButton.text()).toBe('关闭');
    });
  });

  describe('Event Emission', () => {
    it('should emit retry event when retry button clicked', async () => {
      await wrapper.setProps({ canRetry: true });
      
      const retryButton = wrapper.find('.action-buttons .el-button[type="warning"]');
      await retryButton.trigger('click');
      
      expect(wrapper.emitted('retry')).toBeTruthy();
    });

    it('should emit continue event when continue button clicked', async () => {
      await wrapper.setProps({ canContinue: true });
      
      const continueButton = wrapper.find('.action-buttons .el-button[type="primary"]');
      await continueButton.trigger('click');
      
      expect(wrapper.emitted('continue')).toBeTruthy();
    });

    it('should emit close event when close button clicked', async () => {
      const closeButton = wrapper.find('.action-buttons .el-button:not([type])');
      await closeButton.trigger('click');
      
      expect(wrapper.emitted('close')).toBeTruthy();
    });
  });

  describe('Default Props', () => {
    it('should use default props when not provided', () => {
      wrapper = createWrapper({});
      
      expect(wrapper.props('status')).toBe('pending');
      expect(wrapper.props('steps')).toEqual([]);
      expect(wrapper.props('activeStep')).toBe(0);
      expect(wrapper.props('highlights')).toEqual([]);
      expect(wrapper.props('showActions')).toBe(true);
      expect(wrapper.props('canRetry')).toBe(false);
      expect(wrapper.props('canContinue')).toBe(false);
    });
  });

  describe('Responsive Design', () => {
    it('should have proper CSS classes for responsive layout', () => {
      expect(wrapper.find('.operation-panel').classes()).toContain('operation-panel');
      expect(wrapper.find('.panel-header').classes()).toContain('panel-header');
      expect(wrapper.find('.operation-content').classes()).toContain('operation-content');
    });

    it('should have proper styling for different content types', () => {
      // Test with table results
      wrapper = createWrapper({ results: mockTableResults });
      expect(wrapper.find('.result-content').exists()).toBe(true);
      
      // Test with stats results
      wrapper = createWrapper({ results: mockStatsResults });
      expect(wrapper.find('.stats-grid').exists()).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty results object', async () => {
      await wrapper.setProps({ results: {} as any });
      
      expect(wrapper.find('.results-container').exists()).toBe(true);
      expect(wrapper.find('.result-content').exists()).toBe(true);
    });

    it('should handle results with missing type', async () => {
      const resultsWithoutType = {
        data: 'Some data'
      } as any;
      
      await wrapper.setProps({ results: resultsWithoutType });
      
      expect(wrapper.find('.results-container').exists()).toBe(true);
    });

    it('should handle steps with missing properties', async () => {
      const incompleteSteps = [
        { title: 'Step 1' },
        { description: 'Step 2 description' },
        {}
      ] as any;
      
      await wrapper.setProps({ steps: incompleteSteps });
      
      expect(wrapper.find('.steps-container').exists()).toBe(true);
    });

    it('should handle highlights with missing style', async () => {
      const highlightsWithoutStyle = [
        { style: { top: '10px' } },
        {} as any
      ];
      
      await wrapper.setProps({
        screenshot: 'mock-screenshot',
        highlights: highlightsWithoutStyle
      });
      
      const highlights = wrapper.findAll('.highlight-box');
      expect(highlights.length).toBe(2);
    });
  });
});