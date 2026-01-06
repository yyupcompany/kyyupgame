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

describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory, Router } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import ApplicationStatusTag from '@/components/application/ApplicationStatusTag.vue'

// Mock application types
vi.mock('@/types/application', () => ({
  ApplicationStatus: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled'
  }
}))

describe('ApplicationStatusTag.vue', () => {
  let router: Router
  let wrapper: any

  beforeEach(() => {
    // Setup Pinia
    const pinia = createPinia()
    setActivePinia(pinia)

    // Setup Router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div></div>' } }
      ]
    })
  })

  const createWrapper = (props = {}) => {
    return mount(ApplicationStatusTag, {
      props: {
        status: 'pending',
        ...props
      },
      global: {
        plugins: [router, pinia],
        mocks: {
          $t: (key: string) => key
        }
      }
    })
  }

  describe('Component Rendering', () => {
    it('renders the status tag component correctly', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('el-tag').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'ElTag' }).exists()).toBe(true)
    })

    it('renders with small size by default', () => {
      wrapper = createWrapper()
      
      const tag = wrapper.find('el-tag')
      expect(tag.attributes('size')).toBe('small')
    })

    it('displays status text correctly', () => {
      wrapper = createWrapper({ status: 'pending' })
      
      const tag = wrapper.find('el-tag')
      expect(tag.text()).toBe('待审核')
    })
  })

  describe('Status Display', () => {
    it('displays "待审核" for pending status', () => {
      wrapper = createWrapper({ status: 'pending' })
      
      expect(wrapper.text()).toBe('待审核')
    })

    it('displays "已通过" for approved status', () => {
      wrapper = createWrapper({ status: 'approved' })
      
      expect(wrapper.text()).toBe('已通过')
    })

    it('displays "已拒绝" for rejected status', () => {
      wrapper = createWrapper({ status: 'rejected' })
      
      expect(wrapper.text()).toBe('已拒绝')
    })

    it('displays "已取消" for cancelled status', () => {
      wrapper = createWrapper({ status: 'cancelled' })
      
      expect(wrapper.text()).toBe('已取消')
    })

    it('displays "未知状态" for unknown status', () => {
      wrapper = createWrapper({ status: 'unknown' as any })
      
      expect(wrapper.text()).toBe('未知状态')
    })
  })

  describe('Tag Type Mapping', () => {
    it('applies warning type for pending status', () => {
      wrapper = createWrapper({ status: 'pending' })
      
      const tag = wrapper.find('el-tag')
      expect(tag.attributes('type')).toBe('warning')
    })

    it('applies success type for approved status', () => {
      wrapper = createWrapper({ status: 'approved' })
      
      const tag = wrapper.find('el-tag')
      expect(tag.attributes('type')).toBe('success')
    })

    it('applies danger type for rejected status', () => {
      wrapper = createWrapper({ status: 'rejected' })
      
      const tag = wrapper.find('el-tag')
      expect(tag.attributes('type')).toBe('danger')
    })

    it('applies info type for cancelled status', () => {
      wrapper = createWrapper({ status: 'cancelled' })
      
      const tag = wrapper.find('el-tag')
      expect(tag.attributes('type')).toBe('info')
    })

    it('applies info type for unknown status', () => {
      wrapper = createWrapper({ status: 'unknown' as any })
      
      const tag = wrapper.find('el-tag')
      expect(tag.attributes('type')).toBe('info')
    })
  })

  describe('Props Handling', () => {
    it('accepts status prop correctly', () => {
      wrapper = createWrapper({ status: 'approved' })
      
      expect(wrapper.props('status')).toBe('approved')
    })

    it('updates display when status prop changes', async () => {
      wrapper = createWrapper({ status: 'pending' })
      
      expect(wrapper.text()).toBe('待审核')
      expect(wrapper.find('el-tag').attributes('type')).toBe('warning')
      
      await wrapper.setProps({ status: 'approved' })
      
      expect(wrapper.text()).toBe('已通过')
      expect(wrapper.find('el-tag').attributes('type')).toBe('success')
    })

    it('handles undefined status prop gracefully', () => {
      wrapper = createWrapper({ status: undefined })
      
      expect(wrapper.text()).toBe('未知状态')
      expect(wrapper.find('el-tag').attributes('type')).toBe('info')
    })

    it('handles null status prop gracefully', () => {
      wrapper = createWrapper({ status: null })
      
      expect(wrapper.text()).toBe('未知状态')
      expect(wrapper.find('el-tag').attributes('type')).toBe('info')
    })
  })

  describe('Computed Properties', () => {
    it('computes tagType correctly for all statuses', () => {
      const testCases = [
        { status: 'pending', expectedType: 'warning' },
        { status: 'approved', expectedType: 'success' },
        { status: 'rejected', expectedType: 'danger' },
        { status: 'cancelled', expectedType: 'info' }
      ]

      testCases.forEach(({ status, expectedType }) => {
        wrapper = createWrapper({ status })
        
        const vm = wrapper.vm
        expect(vm.tagType).toBe(expectedType)
      })
    })

    it('computes statusText correctly for all statuses', () => {
      const testCases = [
        { status: 'pending', expectedText: '待审核' },
        { status: 'approved', expectedText: '已通过' },
        { status: 'rejected', expectedText: '已拒绝' },
        { status: 'cancelled', expectedText: '已取消' }
      ]

      testCases.forEach(({ status, expectedText }) => {
        wrapper = createWrapper({ status })
        
        const vm = wrapper.vm
        expect(vm.statusText).toBe(expectedText)
      })
    })

    it('computes default values for unknown status', () => {
      wrapper = createWrapper({ status: 'unknown_status' as any })
      
      const vm = wrapper.vm
      expect(vm.tagType).toBe('info')
      expect(vm.statusText).toBe('未知状态')
    })

    it('updates computed properties reactively', async () => {
      wrapper = createWrapper({ status: 'pending' })
      
      expect(wrapper.vm.tagType).toBe('warning')
      expect(wrapper.vm.statusText).toBe('待审核')
      
      await wrapper.setProps({ status: 'approved' })
      
      expect(wrapper.vm.tagType).toBe('success')
      expect(wrapper.vm.statusText).toBe('已通过')
    })
  })

  describe('Reactivity', () => {
    it('reacts to status prop changes', async () => {
      wrapper = createWrapper({ status: 'pending' })
      
      const initialText = wrapper.text()
      const initialType = wrapper.find('el-tag').attributes('type')
      
      await wrapper.setProps({ status: 'approved' })
      
      expect(wrapper.text()).not.toBe(initialText)
      expect(wrapper.find('el-tag').attributes('type')).not.toBe(initialType)
    })

    it('maintains reactivity through multiple changes', async () => {
      wrapper = createWrapper({ status: 'pending' })
      
      const statuses = ['pending', 'approved', 'rejected', 'cancelled']
      
      for (const status of statuses) {
        await wrapper.setProps({ status })
        
        expect(wrapper.vm.status).toBe(status)
        expect(wrapper.find('el-tag').attributes('type')).toBeDefined()
        expect(wrapper.text()).toBeDefined()
      }
    })
  })

  describe('Edge Cases', () => {
    it('handles empty string status', () => {
      wrapper = createWrapper({ status: '' })
      
      expect(wrapper.text()).toBe('未知状态')
      expect(wrapper.find('el-tag').attributes('type')).toBe('info')
    })

    it('handles numeric status', () => {
      wrapper = createWrapper({ status: 123 as any })
      
      expect(wrapper.text()).toBe('未知状态')
      expect(wrapper.find('el-tag').attributes('type')).toBe('info')
    })

    it('handles object status', () => {
      wrapper = createWrapper({ status: {} as any })
      
      expect(wrapper.text()).toBe('未知状态')
      expect(wrapper.find('el-tag').attributes('type')).toBe('info')
    })

    it('handles array status', () => {
      wrapper = createWrapper({ status: ['pending'] as any })
      
      expect(wrapper.text()).toBe('未知状态')
      expect(wrapper.find('el-tag').attributes('type')).toBe('info')
    })
  })

  describe('Integration with Element Plus', () => {
    it('correctly passes size prop to ElTag', () => {
      wrapper = createWrapper()
      
      const tag = wrapper.find('el-tag')
      expect(tag.attributes('size')).toBe('small')
    })

    it('renders ElTag with correct attributes', () => {
      wrapper = createWrapper({ status: 'approved' })
      
      const tag = wrapper.find('el-tag')
      expect(tag.attributes('type')).toBe('success')
      expect(tag.attributes('size')).toBe('small')
    })

    it('maintains Element Plus tag functionality', () => {
      wrapper = createWrapper({ status: 'rejected' })
      
      const tag = wrapper.find('el-tag')
      expect(tag.exists()).toBe(true)
      expect(tag.text()).toBe('已拒绝')
    })
  })

  describe('Styling and CSS Classes', () => {
    it('applies base tag styling', () => {
      wrapper = createWrapper()
      
      const tag = wrapper.find('el-tag')
      expect(tag.exists()).toBe(true)
      // Element Plus applies base classes automatically
    })

    it('maintains consistent styling across different statuses', () => {
      const statuses = ['pending', 'approved', 'rejected', 'cancelled']
      
      statuses.forEach(status => {
        wrapper = createWrapper({ status })
        
        const tag = wrapper.find('el-tag')
        expect(tag.exists()).toBe(true)
        expect(tag.text()).toBeDefined()
        expect(tag.attributes('type')).toBeDefined()
      })
    })
  })

  describe('Performance', () => {
    it('renders efficiently', () => {
      const start = performance.now()
      wrapper = createWrapper()
      const end = performance.now()
      
      expect(wrapper.find('el-tag').exists()).toBe(true)
      expect(end - start).toBeLessThan(10) // Should render very quickly
    })

    it('handles rapid prop changes efficiently', async () => {
      wrapper = createWrapper({ status: 'pending' })
      
      const start = performance.now()
      
      // Perform rapid status changes
      for (let i = 0; i < 10; i++) {
        await wrapper.setProps({ 
          status: i % 2 === 0 ? 'pending' : 'approved' 
        })
      }
      
      const end = performance.now()
      
      expect(wrapper.find('el-tag').exists()).toBe(true)
      expect(end - start).toBeLessThan(100) // Should handle rapid changes efficiently
    })
  })

  describe('Accessibility', () => {
    it('renders semantically correct HTML', () => {
      wrapper = createWrapper()
      
      // ElTag typically renders as a span with appropriate attributes
      const tag = wrapper.find('el-tag')
      expect(tag.exists()).toBe(true)
    })

    it('provides clear visual status indication', () => {
      wrapper = createWrapper({ status: 'approved' })
      
      const tag = wrapper.find('el-tag')
      expect(tag.text()).toBe('已通过')
      expect(tag.attributes('type')).toBe('success')
    })

    it('maintains color contrast for accessibility', () => {
      // This test ensures that different status types have different visual presentations
      const statusTypes = ['warning', 'success', 'danger', 'info']
      const statuses = ['pending', 'approved', 'rejected', 'cancelled']
      
      statuses.forEach((status, index) => {
        wrapper = createWrapper({ status })
        
        const tag = wrapper.find('el-tag')
        expect(tag.attributes('type')).toBe(statusTypes[index])
      })
    })
  })

  describe('Type Safety', () => {
    it('accepts only valid ApplicationStatus values', () => {
      const validStatuses = ['pending', 'approved', 'rejected', 'cancelled']
      
      validStatuses.forEach(status => {
        expect(() => {
          wrapper = createWrapper({ status })
        }).not.toThrow()
      })
    })

    it('handles invalid status values gracefully', () => {
      const invalidStatuses = [null, undefined, '', 0, false, {}, []]
      
      invalidStatuses.forEach(status => {
        expect(() => {
          wrapper = createWrapper({ status: status as any })
        }).not.toThrow()
        
        expect(wrapper.text()).toBe('未知状态')
      })
    })
  })

  describe('Component Lifecycle', () => {
    it('mounts without errors', () => {
      expect(() => {
        wrapper = createWrapper()
      }).not.toThrow()
    })

    it('unmounts cleanly', () => {
      wrapper = createWrapper()
      
      expect(() => {
        wrapper.unmount()
      }).not.toThrow()
    })

    it('handles multiple mount/unmount cycles', () => {
      for (let i = 0; i < 3; i++) {
        wrapper = createWrapper()
        expect(wrapper.find('el-tag').exists()).toBe(true)
        wrapper.unmount()
      }
    })
  })
})