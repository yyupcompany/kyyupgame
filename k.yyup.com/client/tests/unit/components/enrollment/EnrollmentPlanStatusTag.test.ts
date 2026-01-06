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

describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EnrollmentPlanStatusTag from '@/components/enrollment/EnrollmentPlanStatusTag.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElTag: {
    name: 'ElTag',
    template: '<span class="el-tag"><slot /></span>'
  }
}))

describe('EnrollmentPlanStatusTag.vue', () => {
  const createWrapper = (props: { status: string }) => {
    return mount(EnrollmentPlanStatusTag, {
      props,
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-tag': true
        }
      }
    })
  }

  it('renders correctly with DRAFT status', () => {
    const wrapper = createWrapper({ status: 'DRAFT' })
    expect(wrapper.vm.statusText).toBe('草稿')
    expect(wrapper.vm.statusType).toBe('info')
  })

  it('renders correctly with ACTIVE status', () => {
    const wrapper = createWrapper({ status: 'ACTIVE' })
    expect(wrapper.vm.statusText).toBe('招生中')
    expect(wrapper.vm.statusType).toBe('success')
  })

  it('renders correctly with PAUSED status', () => {
    const wrapper = createWrapper({ status: 'PAUSED' })
    expect(wrapper.vm.statusText).toBe('已暂停')
    expect(wrapper.vm.statusType).toBe('warning')
  })

  it('renders correctly with COMPLETED status', () => {
    const wrapper = createWrapper({ status: 'COMPLETED' })
    expect(wrapper.vm.statusText).toBe('已完成')
    expect(wrapper.vm.statusType).toBe('info')
  })

  it('renders correctly with CANCELLED status', () => {
    const wrapper = createWrapper({ status: 'CANCELLED' })
    expect(wrapper.vm.statusText).toBe('已取消')
    expect(wrapper.vm.statusType).toBe('danger')
  })

  it('falls back to primary type for unknown status', () => {
    const wrapper = createWrapper({ status: 'UNKNOWN' })
    expect(wrapper.vm.statusText).toBe('UNKNOWN')
    expect(wrapper.vm.statusType).toBe('primary')
  })

  it('falls back to original status text for unknown status', () => {
    const wrapper = createWrapper({ status: 'CUSTOM_STATUS' })
    expect(wrapper.vm.statusText).toBe('CUSTOM_STATUS')
    expect(wrapper.vm.statusType).toBe('primary')
  })

  it('has correct status type mapping', () => {
    const wrapper = createWrapper({ status: 'ACTIVE' })
    const typeMap = wrapper.vm.typeMap
    
    expect(typeMap).toEqual({
      DRAFT: 'info',
      ACTIVE: 'success',
      PAUSED: 'warning',
      COMPLETED: 'info',
      CANCELLED: 'danger'
    })
  })

  it('has correct status text mapping', () => {
    const wrapper = createWrapper({ status: 'ACTIVE' })
    const textMap = wrapper.vm.textMap
    
    expect(textMap).toEqual({
      DRAFT: '草稿',
      ACTIVE: '招生中',
      PAUSED: '已暂停',
      COMPLETED: '已完成',
      CANCELLED: '已取消'
    })
  })

  it('computes status type reactively', async () => {
    const wrapper = createWrapper({ status: 'DRAFT' })
    expect(wrapper.vm.statusType).toBe('info')
    
    await wrapper.setProps({ status: 'ACTIVE' })
    expect(wrapper.vm.statusType).toBe('success')
  })

  it('computes status text reactively', async () => {
    const wrapper = createWrapper({ status: 'DRAFT' })
    expect(wrapper.vm.statusText).toBe('草稿')
    
    await wrapper.setProps({ status: 'ACTIVE' })
    expect(wrapper.vm.statusText).toBe('招生中')
  })

  it('accepts status prop as required', () => {
    const wrapper = createWrapper({ status: 'ACTIVE' })
    expect(wrapper.props('status')).toBe('ACTIVE')
  })

  it('renders ElTag with correct props', () => {
    const wrapper = createWrapper({ status: 'ACTIVE' })
    const tag = wrapper.findComponent({ name: 'ElTag' })
    
    expect(tag.exists()).toBe(true)
    expect(tag.attributes('type')).toBe('success')
    expect(tag.attributes('size')).toBe('small')
  })
})