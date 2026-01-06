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

describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory, Router } from 'vue-router';
import App from '@/App.vue';

describe('App.vue', () => {
  let router: Router;

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/',
          name: 'home',
          component: { template: '<div>Home Page</div>' }
        },
        {
          path: '/about',
          name: 'about',
          component: { template: '<div>About Page</div>' }
        }
      ]
    });
  });

  it('renders router view correctly', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          'router-view': true
        }
      }
    });

    expect(wrapper.find('.app-root').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'router-view' }).exists()).toBe(true);
  });

  it('applies correct CSS classes', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          'router-view': true
        }
      }
    });

    const appRoot = wrapper.find('.app-root');
    expect(appRoot.classes()).toContain('app-root');
    
    const style = window.getComputedStyle(appRoot.element);
    expect(style.height).toBe('100vh');
    expect(style.width).toBe('100vw');
    expect(style.overflow).toBe('hidden');
  });

  it('has correct component structure', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          'router-view': true
        }
      }
    });

    expect(wrapper.html()).toContain('<div class="app-root">');
    expect(wrapper.html()).toContain('<router-view');
  });

  it('is a Vue instance', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          'router-view': true
        }
      }
    });

    expect(wrapper.vm).toBeTruthy();
    expect(wrapper.findComponent(App).exists()).toBe(true);
  });

  it('handles router view slot correctly', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          'router-view': {
            template: '<div class="router-view-stub"><slot /></div>'
          }
        }
      }
    });

    const routerView = wrapper.findComponent({ name: 'router-view' });
    expect(routerView.exists()).toBe(true);
  });
});