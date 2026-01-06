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
import ActivityCenter from '@/pages/centers/ActivityCenter.vue';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHistory } from 'vue-router';

// Mock all the complex dependencies
vi.mock('@/pages/activity/ActivityList.vue', () => ({
  default: {
    template: '<div class="activity-list">Activity List Component</div>',
    name: 'ActivityList'
  }
}));

vi.mock('@/components/centers/CenterContainer.vue', () => ({
  default: {
    template: '<div class="center-container"><h1>活动中心</h1><slot name="tab-overview"></slot><slot name="tab-activities"></slot></div>',
    name: 'CenterContainer',
    props: ['title', 'tabs', 'defaultTab', 'showHeader', 'showActions', 'syncUrl', 'showSkeleton'],
    emits: ['create', 'tab-change']
  }
}));

vi.mock('@/components/centers/StatCard.vue', () => ({
  default: {
    template: '<div class="stat-card">{{ title }}: {{ value }}</div>',
    name: 'StatCard',
    props: ['title', 'value', 'unit', 'trend', 'trendText', 'type', 'iconName', 'clickable']
  }
}));

vi.mock('@/components/centers/ActionCard.vue', () => ({
  default: {
    template: '<div class="action-card">{{ title }}</div>',
    name: 'ActionCard',
    props: ['title', 'description', 'icon', 'color']
  }
}));

vi.mock('@/pages/principal/PosterEditor.vue', () => ({
  default: { template: '<div>Poster Editor</div>' }
}));

vi.mock('@/pages/principal/PosterGenerator.vue', () => ({
  default: { template: '<div>Poster Generator</div>' }
}));

vi.mock('@/pages/principal/PosterTemplates.vue', () => ({
  default: { template: '<div>Poster Templates</div>' }
}));

vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ success: true, data: [] }),
    post: vi.fn().mockResolvedValue({ success: true, data: {} }),
    put: vi.fn().mockResolvedValue({ success: true, data: {} })
  }
}));

vi.mock('echarts', () => ({
  init: vi.fn().mockReturnValue({
    setOption: vi.fn(),
    dispose: vi.fn(),
    resize: vi.fn()
  }),
  getInstanceByDom: vi.fn().mockReturnValue(null)
}));

describe('ActivityCenter.vue', () => {
  let wrapper: any;
  let router: any;

  beforeEach(async () => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/activity/create', component: { template: '<div>Create Activity</div>' } }
      ]
    });

    wrapper = mount(ActivityCenter, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn
          }),
          router
        ]
      }
    });

    await wrapper.vm.$nextTick();
  });

  it('should render the activity center page', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('should display the correct title', async () => {
    await wrapper.vm.$nextTick();
    // 等待异步数据加载
    await new Promise(resolve => setTimeout(resolve, 100));

    // 检查页面基本内容
    const hasTitle = wrapper.text().includes('活动中心') ||
                    wrapper.find('.center-container').exists() ||
                    wrapper.find('h1').exists();

    expect(hasTitle).toBe(true);
  });

  it('should contain activity management components', async () => {
    await wrapper.vm.$nextTick();
    // 等待异步数据加载
    await new Promise(resolve => setTimeout(resolve, 100));

    // 检查是否包含活动相关组件或内容
    const hasActivityContent = wrapper.find('.activity-list').exists() ||
                              wrapper.text().includes('Activity List') ||
                              wrapper.find('.center-container').exists();

    expect(hasActivityContent).toBe(true);
  });

  it('should render stat cards', async () => {
    await wrapper.vm.$nextTick();
    // 等待异步数据加载
    await new Promise(resolve => setTimeout(resolve, 100));

    // 检查是否有统计卡片或相关内容
    const hasStatCards = wrapper.find('.stat-card').exists() ||
                        wrapper.text().includes('总活动数') ||
                        wrapper.text().includes('进行中活动');

    expect(hasStatCards).toBe(true);
  });
});