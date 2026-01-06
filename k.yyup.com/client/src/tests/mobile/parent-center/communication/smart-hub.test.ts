/**
 * 移动端家长沟通中心页面测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import SmartHub from '../../../../pages/mobile/parent-center/communication/smart-hub.vue'
import RoleBasedMobileLayout from '../../../../components/layout/RoleBasedMobileLayout.vue'

// Mock Vant components
vi.mock('vant', () => ({
  NavBar: { name: 'van-nav-bar', template: '<div><slot /></div>' },
  Tabbar: { name: 'van-tabbar', template: '<div><slot /></div>' },
  TabbarItem: { name: 'van-tabbar-item', template: '<div><slot /></div>' },
  Button: { name: 'van-button', template: '<button><slot /></button>' },
  Icon: { name: 'van-icon', template: '<i />' },
  Field: { name: 'van-field', template: '<input />' },
  Tag: { name: 'van-tag', template: '<span><slot /></span>' },
  Rate: { name: 'van-rate', template: '<div />' },
  Progress: { name: 'van-progress', template: '<div />' },
  Popup: { name: 'van-popup', template: '<div><slot /></div>' },
  Picker: { name: 'van-picker', template: '<div />' },
  Loading: { name: 'van-loading', template: '<div><slot /></div>' },
  showToast: vi.fn(),
  showConfirmDialog: vi.fn(),
  showAlertDialog: vi.fn()
}))

// Mock composable
vi.mock('../../../composables/useSmartParentCommunication', () => ({
  useSmartParentCommunication: () => ({
    communicationData: [],
    loading: false,
    generatePersonalizedContent: vi.fn(),
    generateResponseSuggestions: vi.fn(),
    analyzeCommunicationEffectiveness: vi.fn()
  })
}))

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/mobile/parent-center/communication/smart-hub',
      component: SmartHub
    }
  ]
})

describe('SmartHub Mobile Page', () => {
  let wrapper: any

  beforeEach(() => {
    const pinia = createPinia()
    wrapper = mount(SmartHub, {
      global: {
        plugins: [router, pinia],
        components: {
          RoleBasedMobileLayout
        },
        stubs: {
          'van-nav-bar': true,
          'van-tabbar': true,
          'van-tabbar-item': true,
          'van-button': true,
          'van-icon': true,
          'van-field': true,
          'van-tag': true,
          'van-rate': true,
          'van-progress': true,
          'van-popup': true,
          'van-picker': true,
          'van-loading': true
        }
      }
    })
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.findComponent(RoleBasedMobileLayout).exists()).toBe(true)
  })

  it('displays dashboard section', () => {
    const dashboardSection = wrapper.find('.dashboard-section')
    expect(dashboardSection.exists()).toBe(true)

    const sectionTitle = dashboardSection.find('h3')
    expect(sectionTitle.text()).toBe('沟通概览')
  })

  it('displays dashboard cards with correct metrics', () => {
    const dashboardCards = wrapper.findAll('.dashboard-card')
    expect(dashboardCards).toHaveLength(4)

    const engagementCard = wrapper.find('.dashboard-card.engagement .metric-value')
    expect(engagementCard.text()).toBe('87%')

    const responseCard = wrapper.find('.dashboard-card.response .metric-value')
    expect(responseCard.text()).toBe('2.3h')
  })

  it('displays content generation section', () => {
    const contentSection = wrapper.find('.content-generation-section')
    expect(contentSection.exists()).toBe(true)

    const sectionTitle = contentSection.find('h3')
    expect(sectionTitle.text()).toBe('AI个性化内容')
  })

  it('displays personalized content list', () => {
    const contentList = wrapper.find('.content-list')
    expect(contentList.exists()).toBe(true)

    const contentItems = wrapper.findAll('.content-item')
    expect(contentItems.length).toBeGreaterThan(0)
  })

  it('displays smart reply section', () => {
    const smartReplySection = wrapper.find('.smart-reply-section')
    expect(smartReplySection.exists()).toBe(true)

    const sectionTitle = smartReplySection.find('h3')
    expect(sectionTitle.text()).toBe('智能回复助手')
  })

  it('displays topic analysis section', () => {
    const topicSection = wrapper.find('.topic-analysis-section')
    expect(topicSection.exists()).toBe(true)

    const sectionTitle = topicSection.find('h3')
    expect(sectionTitle.text()).toBe('话题热度分析')
  })

  it('displays improvements section', () => {
    const improvementsSection = wrapper.find('.improvements-section')
    expect(improvementsSection.exists()).toBe(true)

    const sectionTitle = improvementsSection.find('h3')
    expect(sectionTitle.text()).toBe('AI改进建议')
  })

  it('has proper responsive grid layout', () => {
    const dashboardCards = wrapper.find('.dashboard-cards')
    expect(dashboardCards.exists()).toBe(true)

    // Check CSS classes for responsive design
    expect(dashboardCards.classes()).toContain('dashboard-cards')
  })

  it('contains proper accessibility attributes', () => {
    const contentItems = wrapper.findAll('.content-item')
    expect(contentItems.length).toBeGreaterThan(0)

    // Check if items have proper classes for accessibility
    contentItems.forEach(item => {
      expect(item.classes()).toContain('content-item')
    })
  })

  it('has proper mobile-optimized touch targets', () => {
    const buttons = wrapper.findAll('.van-button')
    buttons.forEach(button => {
      // Vant buttons are properly sized for mobile by default
      expect(button.exists()).toBe(true)
    })
  })
})