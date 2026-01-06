import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import DocumentCollaboration from '../index.vue'

// Mock Vant components
vi.mock('vant', () => ({
  showToast: vi.fn(),
  showConfirmDialog: vi.fn(),
  showFailToast: vi.fn(),
  showSuccessToast: vi.fn(),
  VanTab: { template: '<div><slot /></div>' },
  VanTabs: { template: '<div><slot /></div>' },
  VanNavBar: { template: '<div><slot /></div>' },
  VanSearch: { template: '<div><slot /></div>' },
  VanList: { template: '<div><slot /></div>' },
  VanPullRefresh: { template: '<div><slot /></div>' },
  VanEmpty: { template: '<div><slot /></div>' },
  VanProgress: { template: '<div><slot /></div>' },
  VanTag: { template: '<div><slot /></div>' },
  VanIcon: { template: '<div><slot /></div>' },
  VanCell: { template: '<div><slot /></div>' },
  VanCellGroup: { template: '<div><slot /></div>' },
  VanButton: { template: '<div><slot /></div>' },
  VanForm: { template: '<form><slot /></form>' },
  VanField: { template: '<div><slot /></div>' },
  VanRadioGroup: { template: '<div><slot /></div>' },
  VanRadio: { template: '<div><slot /></div>' },
  VanTextarea: { template: '<textarea><slot /></textarea>' },
  VanAvatar: { template: '<div><slot /></div>' },
  VanSticky: { template: '<div><slot /></div>' },
  VanPopup: { template: '<div><slot /></div>' },
  VanPicker: { template: '<div><slot /></div>' },
  VanDatetimePicker: { template: '<div><slot /></div>' },
  VanPagination: { template: '<div><slot /></div>' },
  VanCircle: { template: '<div><slot /></div>' },
  VanSteps: { template: '<div><slot /></div>' },
  VanStep: { template: '<div><slot /></div>' },
  VanBadge: { template: '<div><slot /></div>' }
}))

// Mock the RoleBasedMobileLayout component
vi.mock('@/components/layout/RoleBasedMobileLayout.vue', () => ({
  default: {
    template: '<div><slot /></div>',
    props: ['title', 'showBack', 'showTabBar']
  }
}))

// Mock API modules
vi.mock('@/api/endpoints/document-instances', () => ({
  getInstanceById: vi.fn(),
  getInstances: vi.fn(),
  assignDocument: vi.fn(),
  submitForReview: vi.fn(),
  reviewDocument: vi.fn(),
  getComments: vi.fn(),
  addComment: vi.fn(),
  getVersionHistory: vi.fn(),
  createVersion: vi.fn()
}))

vi.mock('@/api/modules/user', () => ({
  getUserList: vi.fn()
}))

// Mock the user store
vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    userInfo: {
      id: 1,
      role: 'admin'
    }
  })
}))

describe('DocumentCollaboration Mobile Component', () => {
  let wrapper: any
  let router: any
  let pinia: any

  beforeEach(async () => {
    // Create a fresh router instance
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/mobile/centers/document-collaboration',
          component: DocumentCollaboration
        }
      ]
    })

    pinia = createPinia()

    wrapper = mount(DocumentCollaboration, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'van-tab': true,
          'van-tabs': true,
          'van-nav-bar': true,
          'van-search': true,
          'van-list': true,
          'van-pull-refresh': true,
          'van-empty': true,
          'van-progress': true,
          'van-tag': true,
          'van-icon': true,
          'van-cell': true,
          'van-cell-group': true,
          'van-button': true,
          'van-form': true,
          'van-field': true,
          'van-radio-group': true,
          'van-radio': true,
          'van-textarea': true,
          'van-avatar': true,
          'van-sticky': true,
          'van-popup': true,
          'van-picker': true,
          'van-datetime-picker': true,
          'van-pagination': true,
          'van-circle': true,
          'van-steps': true,
          'van-step': true,
          'van-badge': true,
          'RoleBasedMobileLayout': true
        }
      }
    })

    await router.isReady()
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.mobile-document-collaboration').exists()).toBe(true)
  })

  it('shows document list when no document ID is provided', () => {
    expect(wrapper.find('.document-list-container').exists()).toBe(true)
    expect(wrapper.find('.document-detail-container').exists()).toBe(false)
  })

  it('has correct page title', () => {
    expect(wrapper.vm.pageTitle).toBe('协作文档')
  })

  it('formats dates correctly', () => {
    const testDate = '2024-01-01T10:30:00Z'
    const formatted = wrapper.vm.formatDate(testDate)
    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
  })

  it('returns correct status labels', () => {
    expect(wrapper.vm.getStatusLabel('draft')).toBe('草稿')
    expect(wrapper.vm.getStatusLabel('review')).toBe('审核中')
    expect(wrapper.vm.getStatusLabel('approved')).toBe('已通过')
  })

  it('returns correct status types', () => {
    expect(wrapper.vm.getStatusType('draft')).toBe('default')
    expect(wrapper.vm.getStatusType('review')).toBe('primary')
    expect(wrapper.vm.getStatusType('approved')).toBe('success')
    expect(wrapper.vm.getStatusType('rejected')).toBe('danger')
  })

  it('calculates progress colors correctly', () => {
    expect(wrapper.vm.getProgressColor(95)).toBe('#07c160')
    expect(wrapper.vm.getProgressColor(75)).toBe('#ff976a')
    expect(wrapper.vm.getProgressColor(55)).toBe('#ee0a24')
    expect(wrapper.vm.getProgressColor(35)).toBe('#1989fa')
  })

  it('handles search functionality', async () => {
    await wrapper.vm.handleSearch('test query')
    expect(wrapper.vm.searchKeyword).toBe('test query')
  })

  it('handles clear search functionality', async () => {
    wrapper.vm.searchKeyword = 'test query'
    await wrapper.vm.handleClearSearch()
    expect(wrapper.vm.searchKeyword).toBe('')
  })

  it('computes document metadata correctly', () => {
    wrapper.vm.document = {
      id: 1,
      title: 'Test Document',
      status: 'draft',
      progress: 50,
      deadline: '2024-12-31T23:59:59Z',
      updatedAt: '2024-01-01T10:30:00Z',
      version: 1,
      ownerName: 'Test Owner',
      assignedToName: 'Test Assignee'
    }

    const metadata = wrapper.vm.documentMeta
    expect(metadata).toHaveLength(6)
    expect(metadata[0].label).toBe('状态')
    expect(metadata[0].value).toBe('草稿')
  })
})