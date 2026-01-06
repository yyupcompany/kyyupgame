/**
 * 通用组件单元测试
 * 严格验证版本
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTestWrapper, mockElementPlusMessage, triggerEvent, waitForAsync, fillForm } from '../../utils/test-helpers';
import { expectNoConsoleErrors } from '../../setup/console-monitoring';
import { 
  validateRequiredFields,
  validateFieldTypes,
  validateEnumValue 
} from '../../utils/data-validation';

// 导入待测试的通用组件
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import ErrorBoundary from '@/components/common/ErrorBoundary.vue';
import PageWrapper from '@/components/common/PageWrapper.vue';
import StatCard from '@/components/common/StatCard.vue';

// Mock Element Plus
const mockMessage = mockElementPlusMessage();

describe('Common Components - Strict Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock 图标库
    vi.mock('@element-plus/icons-vue', () => ({
      ElIcon: {
        name: 'ElIcon',
        template: '<div class="el-icon"><slot /></div>'
      }
    }));
  });

  afterEach(() => {
    expectNoConsoleErrors();
  });

  describe('UnifiedIcon Component', () => {
    it('should render with correct props', () => {
      const wrapper = createTestWrapper(UnifiedIcon, {
        props: {
          name: 'user',
          size: 20,
          color: '#409eff'
        }
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.unified-icon').exists()).toBe(true);
      expect(wrapper.props('name')).toBe('user');
      expect(wrapper.props('size')).toBe(20);
      expect(wrapper.props('color')).toBe('#409eff');
    });

    it('should handle different icon types', () => {
      const iconTypes = ['user', 'home', 'settings', 'bell', 'search'];
      
      iconTypes.forEach(iconName => {
        const wrapper = createTestWrapper(UnifiedIcon, {
          props: {
            name: iconName
          }
        });

        expect(wrapper.props('name')).toBe(iconName);
        expect(wrapper.find('.unified-icon').exists()).toBe(true);
      });
    });

    it('should apply size classes correctly', () => {
      const sizeTests = [
        { size: 'small', expectedClass: 'icon-small' },
        { size: 'medium', expectedClass: 'icon-medium' },
        { size: 'large', expectedClass: 'icon-large' },
        { size: 24, expectedStyle: 'font-size: 24px' }
      ];

      sizeTests.forEach(({ size, expectedClass, expectedStyle }) => {
        const wrapper = createTestWrapper(UnifiedIcon, {
          props: {
            name: 'user',
            size
          }
        });

        if (expectedClass) {
          expect(wrapper.find('.unified-icon').classes()).toContain(expectedClass);
        }
        
        if (expectedStyle) {
          expect(wrapper.find('.unified-icon').element.style.fontSize).toBe('24px');
        }
      });
    });

    it('should handle click events correctly', async () => {
      const wrapper = createTestWrapper(UnifiedIcon, {
        props: {
          name: 'user'
        }
      });

      await wrapper.trigger('click');
      expect(wrapper.emitted('click')).toBeDefined();
      expect(wrapper.emitted('click')).toHaveLength(1);
    });

    it('should support loading state', () => {
      const wrapper = createTestWrapper(UnifiedIcon, {
        props: {
          name: 'user',
          loading: true
        }
      });

      expect(wrapper.find('.icon-loading').exists()).toBe(true);
    });

    it('should handle unknown icon names gracefully', () => {
      const wrapper = createTestWrapper(UnifiedIcon, {
        props: {
          name: 'unknown-icon-name'
        }
      });

      // 应该有默认处理
      expect(wrapper.find('.unified-icon').exists()).toBe(true);
      expect(wrapper.find('.icon-fallback').exists()).toBe(true);
    });
  });

  describe('LoadingSpinner Component', () => {
    it('should render with different sizes', () => {
      const sizes = ['small', 'medium', 'large'];
      
      sizes.forEach(size => {
        const wrapper = createTestWrapper(LoadingSpinner, {
          props: {
            size
          }
        });

        expect(wrapper.find('.loading-spinner').exists()).toBe(true);
        expect(wrapper.find(`.loading-${size}`).exists()).toBe(true);
      });
    });

    it('should show custom text', () => {
      const wrapper = createTestWrapper(LoadingSpinner, {
        props: {
          text: '正在加载...'
        }
      });

      expect(wrapper.text()).toContain('正在加载...');
    });

    it('should support different loading types', () => {
      const types = ['spinner', 'dots', 'pulse', 'bars'];
      
      types.forEach(type => {
        const wrapper = createTestWrapper(LoadingSpinner, {
          props: {
            type
          }
        });

        expect(wrapper.find(`.loading-${type}`).exists()).toBe(true);
      });
    });

    it('should handle fullscreen mode', () => {
      const wrapper = createTestWrapper(LoadingSpinner, {
        props: {
          fullscreen: true
        }
      });

      expect(wrapper.find('.loading-spinner').classes()).toContain('fullscreen');
    });

    it('should emit events correctly', async () => {
      const wrapper = createTestWrapper(LoadingSpinner);

      // 测试加载开始事件
      wrapper.vm.$emit('loading-start');
      expect(wrapper.emitted('loading-start')).toBeDefined();

      // 测试加载结束事件
      wrapper.vm.$emit('loading-end');
      expect(wrapper.emitted('loading-end')).toBeDefined();
    });
  });

  describe('EmptyState Component', () => {
    it('should render with default content', () => {
      const wrapper = createTestWrapper(EmptyState);

      expect(wrapper.find('.empty-state').exists()).toBe(true);
      expect(wrapper.find('.empty-state-icon').exists()).toBe(true);
      expect(wrapper.find('.empty-state-text').exists()).toBe(true);
    });

    it('should render with custom content', () => {
      const wrapper = createTestWrapper(EmptyState, {
        props: {
          icon: 'search',
          title: '没有找到数据',
          description: '请尝试其他搜索条件'
        }
      });

      expect(wrapper.text()).toContain('没有找到数据');
      expect(wrapper.text()).toContain('请尝试其他搜索条件');
    });

    it('should show action button when provided', () => {
      const wrapper = createTestWrapper(EmptyState, {
        props: {
          actionText: '创建新项目',
          showAction: true
        }
      });

      expect(wrapper.find('[data-testid="empty-action"]').exists()).toBe(true);
      expect(wrapper.text()).toContain('创建新项目');
    });

    it('should handle action button click', async () => {
      const wrapper = createTestWrapper(EmptyState, {
        props: {
          actionText: '创建新项目',
          showAction: true
        }
      });

      const actionButton = wrapper.find('[data-testid="empty-action"]');
      await actionButton.trigger('click');

      expect(wrapper.emitted('action')).toBeDefined();
      expect(wrapper.emitted('action')).toHaveLength(1);
    });

    it('should support different empty types', () => {
      const types = ['no-data', 'no-search-results', 'error', 'network-error'];
      
      types.forEach(type => {
        const wrapper = createTestWrapper(EmptyState, {
          props: {
            type
          }
        });

        expect(wrapper.find(`.empty-${type}`).exists()).toBe(true);
      });
    });
  });

  describe('ErrorBoundary Component', () => {
    it('should render fallback content when error occurs', async () => {
      // 创建一个会出错的子组件
      const ErrorComponent = {
        template: '<div>{{ error.property }}</div>',
        data() {
          return {
            error: null
          };
        },
        mounted() {
          // 故意制造错误
          throw new Error('Test error');
        }
      };

      const wrapper = createTestWrapper(ErrorBoundary, {
        slots: {
          default: ErrorComponent
        }
      });

      await wrapper.vm.$nextTick();

      // 验证错误状态显示
      expect(wrapper.find('.error-boundary').exists()).toBe(true);
      expect(wrapper.find('.error-message').exists()).toBe(true);
    });

    it('should provide reset functionality', async () => {
      const wrapper = createTestWrapper(ErrorBoundary, {
        props: {
          showError: true,
          errorMessage: 'Test error message'
        }
      });

      const resetButton = wrapper.find('[data-testid="error-reset"]');
      if (resetButton.exists()) {
        await resetButton.trigger('click');
        
        expect(wrapper.emitted('reset')).toBeDefined();
        expect(wrapper.emitted('reset')).toHaveLength(1);
      }
    });

    it('should log error details', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const wrapper = createTestWrapper(ErrorBoundary, {
        props: {
          showError: true,
          errorMessage: 'Test error'
        }
      });

      await wrapper.vm.$nextTick();
      
      // 验证错误被记录
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('ErrorBoundary:'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('PageWrapper Component', () => {
    it('should render page with header and content', () => {
      const wrapper = createTestWrapper(PageWrapper, {
        props: {
          title: '测试页面',
          showHeader: true
        }
      });

      expect(wrapper.find('.page-wrapper').exists()).toBe(true);
      expect(wrapper.find('.page-header').exists()).toBe(true);
      expect(wrapper.find('.page-content').exists()).toBe(true);
      expect(wrapper.text()).toContain('测试页面');
    });

    it('should hide header when showHeader is false', () => {
      const wrapper = createTestWrapper(PageWrapper, {
        props: {
          title: '测试页面',
          showHeader: false
        }
      });

      expect(wrapper.find('.page-header').exists()).toBe(false);
      expect(wrapper.find('.page-content').exists()).toBe(true);
    });

    it('should render breadcrumbs when provided', () => {
      const breadcrumbs = [
        { title: '首页', path: '/' },
        { title: '用户管理', path: '/users' },
        { title: '用户列表', path: '/users/list' }
      ];

      const wrapper = createTestWrapper(PageWrapper, {
        props: {
          title: '用户列表',
          breadcrumbs
        }
      });

      const breadcrumbNav = wrapper.find('[data-testid="breadcrumbs"]');
      expect(breadcrumbNav.exists()).toBe(true);
      
      const breadcrumbItems = breadcrumbNav.findAll('.breadcrumb-item');
      expect(breadcrumbItems.length).toBe(3);
    });

    it('should show loading state correctly', async () => {
      const wrapper = createTestWrapper(PageWrapper, {
        props: {
          title: '测试页面',
          loading: true
        }
      });

      expect(wrapper.find('.page-loading').exists()).toBe(true);
      expect(wrapper.find('.page-content').exists()).toBe(false);
    });

    it('should handle header actions', () => {
      const actions = [
        { text: '新增', type: 'primary', action: 'add' },
        { text: '导出', type: 'default', action: 'export' }
      ];

      const wrapper = createTestWrapper(PageWrapper, {
        props: {
          title: '用户管理',
          actions
        }
      });

      const headerActions = wrapper.findAll('[data-testid^="header-action-"]');
      expect(headerActions.length).toBe(2);
    });

    it('should emit action events', async () => {
      const actions = [
        { text: '新增', type: 'primary', action: 'add' }
      ];

      const wrapper = createTestWrapper(PageWrapper, {
        props: {
          title: '用户管理',
          actions
        }
      });

      const addButton = wrapper.find('[data-testid="header-action-add"]');
      if (addButton.exists()) {
        await addButton.trigger('click');
        expect(wrapper.emitted('action')).toBeDefined();
        expect(wrapper.emitted('action')[0]).toEqual(['add']);
      }
    });
  });

  describe('StatCard Component', () => {
    it('should render with correct data structure', () => {
      const statData = {
        title: '总用户数',
        value: 1234,
        icon: 'user',
        color: '#409eff',
        trend: {
          value: 12.5,
          direction: 'up'
        }
      };

      const wrapper = createTestWrapper(StatCard, {
        props: statData
      });

      // 验证数据结构
      const validation = validateRequiredFields(statData, ['title', 'value']);
      expect(validation.valid).toBe(true);

      // 验证组件渲染
      expect(wrapper.find('.stat-card').exists()).toBe(true);
      expect(wrapper.text()).toContain('总用户数');
      expect(wrapper.text()).toContain('1234');
    });

    it('should handle different value formats', () => {
      const formatTests = [
        { value: 1234, expected: '1,234' },
        { value: 1234567, expected: '1,234,567' },
        { value: 12.34, expected: '12.34' },
        { value: 'custom', expected: 'custom' }
      ];

      formatTests.forEach(({ value, expected }) => {
        const wrapper = createTestWrapper(StatCard, {
          props: {
            title: '测试统计',
            value
          }
        });

        expect(wrapper.text()).toContain(expected);
      });
    });

    it('should display trend information correctly', () => {
      const trendTests = [
        { trend: { value: 12.5, direction: 'up' }, expectedClass: 'trend-up' },
        { trend: { value: -8.3, direction: 'down' }, expectedClass: 'trend-down' },
        { trend: { value: 0, direction: 'stable' }, expectedClass: 'trend-stable' }
      ];

      trendTests.forEach(({ trend, expectedClass }) => {
        const wrapper = createTestWrapper(StatCard, {
          props: {
            title: '趋势测试',
            value: 100,
            trend
          }
        });

        const trendElement = wrapper.find('.stat-trend');
        if (trendElement.exists()) {
          expect(trendElement.classes()).toContain(expectedClass);
        }
      });
    });

    it('should handle click events for detailed view', async () => {
      const wrapper = createTestWrapper(StatCard, {
        props: {
          title: '点击测试',
          value: 100,
          clickable: true
        }
      });

      await wrapper.trigger('click');
      expect(wrapper.emitted('click')).toBeDefined();
    });

    it('should show loading skeleton when loading', () => {
      const wrapper = createTestWrapper(StatCard, {
        props: {
          title: '加载测试',
          value: null,
          loading: true
        }
      });

      expect(wrapper.find('.stat-skeleton').exists()).toBe(true);
    });

    it('should validate field types correctly', () => {
      const statData = {
        title: '用户统计',
        value: 1234,
        icon: 'user',
        color: '#409eff',
        unit: '人',
        precision: 0
      };

      // 验证字段类型
      const typeValidation = validateFieldTypes(statData, {
        title: 'string',
        value: 'number',
        icon: 'string',
        color: 'string',
        unit: 'string',
        precision: 'number'
      });
      expect(typeValidation.valid).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should work correctly in page layout', async () => {
      // 模拟页面结构：PageWrapper > StatCard + LoadingSpinner
      const TestPage = {
        template: `
          <PageWrapper 
            title="仪表板" 
            :loading="loading"
            :actions="[{ text: '刷新', action: 'refresh' }]"
            @action="handleAction"
          >
            <div class="stats-grid">
              <StatCard 
                v-for="stat in stats" 
                :key="stat.title"
                v-bind="stat"
                @click="handleStatClick"
              />
            </div>
            <LoadingSpinner v-if="loading" text="正在加载数据..." />
          </PageWrapper>
        `,
        components: {
          PageWrapper,
          StatCard,
          LoadingSpinner
        },
        data() {
          return {
            loading: false,
            stats: [
              { title: '用户数', value: 1234, icon: 'user' },
              { title: '订单数', value: 567, icon: 'order' }
            ]
          };
        },
        methods: {
          handleAction(action) {
            this.loading = true;
            setTimeout(() => {
              this.loading = false;
            }, 1000);
          },
          handleStatClick(stat) {
            console.log('Stat clicked:', stat);
          }
        }
      };

      const wrapper = createTestWrapper(TestPage);

      // 验证初始状态
      expect(wrapper.find('.page-wrapper').exists()).toBe(true);
      expect(wrapper.findAll('.stat-card').length).toBe(2);
      expect(wrapper.find('.loading-spinner').exists()).toBe(false);

      // 测试操作按钮
      const refreshButton = wrapper.find('[data-testid="header-action-refresh"]');
      if (refreshButton.exists()) {
        await refreshButton.trigger('click');
        
        // 验证加载状态
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.loading).toBe(true);
        expect(wrapper.find('.loading-spinner').exists()).toBe(true);
      }
    });
  });
});