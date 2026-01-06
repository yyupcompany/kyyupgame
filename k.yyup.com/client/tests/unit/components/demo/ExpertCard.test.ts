import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ExpertCard from '@/components/demo/ExpertCard.vue'

// Mock the Expert type import
vi.mock('@/services/expert-team.service', () => ({
  Expert: vi.fn()
}))

// 控制台错误检测变量
let consoleSpy: any

describe('ExpertCard', () => {
  let wrapper: any
  let mockExpert: any

  beforeEach(() => {
    mockExpert = {
      id: 1,
      name: '张教授',
      role: '教育心理学专家',
      avatar: '👨‍🏫',
      specialties: ['儿童心理', '行为分析', '认知发展']
    }

    wrapper = mount(ExpertCard, {
      props: {
        expert: mockExpert
      }
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('Component Rendering', () => {
    it('renders the expert card correctly', () => {
      expect(wrapper.find('.expert-card').exists()).toBe(true)
    })

    it('displays expert header with avatar, name, and role', () => {
      const header = wrapper.find('.expert-header')
      expect(header.exists()).toBe(true)
      
      const avatar = header.find('.expert-avatar')
      expect(avatar.text()).toBe('👨‍🏫')
      
      const name = header.find('.expert-name')
      expect(name.text()).toBe('张教授')
      
      const role = header.find('.expert-role')
      expect(role.text()).toBe('教育心理学专家')
    })

    it('shows expert specialties section', () => {
      const specialtiesSection = wrapper.find('.expert-specialties')
      expect(specialtiesSection.exists()).toBe(true)
      
      const title = specialtiesSection.find('.specialties-title')
      expect(title.text()).toBe('专业领域:')
      
      const tags = specialtiesSection.findAll('.specialty-tag')
      expect(tags.length).toBe(3)
      expect(tags[0].text()).toBe('儿童心理')
      expect(tags[1].text()).toBe('行为分析')
      expect(tags[2].text()).toBe('认知发展')
    })

    it('shows default status indicator (idle)', () => {
      const statusIndicator = wrapper.find('.status-indicator')
      expect(statusIndicator.classes()).toContain('idle')
      expect(statusIndicator.text().trim()).toBe('待命')
    })

    it('does not show work progress when not provided', () => {
      expect(wrapper.find('.work-progress').exists()).toBe(false)
    })

    it('does not show last output when not provided', () => {
      expect(wrapper.find('.last-output').exists()).toBe(false)
    })
  })

  describe('Status Indicators', () => {
    it('shows idle status by default', () => {
      const statusIndicator = wrapper.find('.status-indicator')
      expect(statusIndicator.classes()).toContain('idle')
      expect(statusIndicator.text().trim()).toBe('待命')
    })

    it('shows active status when isActive is true', async () => {
      await wrapper.setProps({ isActive: true })
      
      const statusIndicator = wrapper.find('.status-indicator')
      expect(statusIndicator.classes()).toContain('active')
      expect(statusIndicator.text().trim()).toBe('就绪')
    })

    it('shows working status when isWorking is true', async () => {
      await wrapper.setProps({ isWorking: true })
      
      const statusIndicator = wrapper.find('.status-indicator')
      expect(statusIndicator.classes()).toContain('working')
      expect(statusIndicator.text().trim()).toBe('工作中')
      
      const pulse = statusIndicator.find('.pulse')
      expect(pulse.exists()).toBe(true)
    })

    it('prioritizes working status over active status', async () => {
      await wrapper.setProps({ isActive: true, isWorking: true })
      
      const statusIndicator = wrapper.find('.status-indicator')
      expect(statusIndicator.classes()).toContain('working')
      expect(statusIndicator.classes()).not.toContain('active')
    })
  })

  describe('Work Progress Display', () => {
    const mockWorkProgress = {
      title: '分析学生行为数据',
      percentage: 65,
      text: '65% 完成'
    }

    it('shows work progress when provided', async () => {
      await wrapper.setProps({ workProgress: mockWorkProgress })
      
      const progressSection = wrapper.find('.work-progress')
      expect(progressSection.exists()).toBe(true)
      
      const title = progressSection.find('.progress-title')
      expect(title.text()).toBe('分析学生行为数据')
      
      const progressBar = progressSection.find('.progress-bar')
      expect(progressBar.exists()).toBe(true)
      
      const progressFill = progressSection.find('.progress-fill')
      expect(progressFill.attributes('style')).toContain('width: 65%')
      
      const progressText = progressSection.find('.progress-text')
      expect(progressText.text()).toBe('65% 完成')
    })

    it('handles 0% progress correctly', async () => {
      await wrapper.setProps({ 
        workProgress: { ...mockWorkProgress, percentage: 0 }
      })
      
      const progressFill = wrapper.find('.progress-fill')
      expect(progressFill.attributes('style')).toContain('width: 0%')
    })

    it('handles 100% progress correctly', async () => {
      await wrapper.setProps({ 
        workProgress: { ...mockWorkProgress, percentage: 100 }
      })
      
      const progressFill = wrapper.find('.progress-fill')
      expect(progressFill.attributes('style')).toContain('width: 100%')
    })

    it('handles progress with decimal values', async () => {
      await wrapper.setProps({ 
        workProgress: { ...mockWorkProgress, percentage: 75.5 }
      })
      
      const progressFill = wrapper.find('.progress-fill')
      expect(progressFill.attributes('style')).toContain('width: 75.5%')
    })
  })

  describe('Last Output Display', () => {
    const mockLastOutput = '已完成学生心理评估报告，建议重点关注社交能力发展'
    const mockLastScore = 8

    it('shows last output when provided', async () => {
      await wrapper.setProps({ lastOutput: mockLastOutput })
      
      const outputSection = wrapper.find('.last-output')
      expect(outputSection.exists()).toBe(true)
      
      const title = outputSection.find('.output-title')
      expect(title.text()).toBe('最新输出:')
      
      const content = outputSection.find('.output-content')
      expect(content.text()).toBe(mockLastOutput)
      
      expect(wrapper.find('.output-score').exists()).toBe(false)
    })

    it('shows last output with score when provided', async () => {
      await wrapper.setProps({ lastOutput: mockLastOutput, lastScore: mockLastScore })
      
      const outputSection = wrapper.find('.last-output')
      expect(outputSection.exists()).toBe(true)
      
      const score = outputSection.find('.output-score')
      expect(score.exists()).toBe(true)
      expect(score.text()).toBe('评分: 8/10')
    })

    it('handles empty last output', async () => {
      await wrapper.setProps({ lastOutput: '' })
      
      const outputSection = wrapper.find('.last-output')
      expect(outputSection.exists()).toBe(true)
      
      const content = outputSection.find('.output-content')
      expect(content.text()).toBe('')
    })

    it('handles score of 0', async () => {
      await wrapper.setProps({ lastOutput: mockLastOutput, lastScore: 0 })
      
      const score = wrapper.find('.output-score')
      expect(score.text()).toBe('评分: 0/10')
    })

    it('handles maximum score of 10', async () => {
      await wrapper.setProps({ lastOutput: mockLastOutput, lastScore: 10 })
      
      const score = wrapper.find('.output-score')
      expect(score.text()).toBe('评分: 10/10')
    })
  })

  describe('Card Classes and Styling', () => {
    it('applies correct base classes', () => {
      const card = wrapper.find('.expert-card')
      expect(card.classes()).toContain('expert-card')
      expect(card.classes()).not.toContain('active')
      expect(card.classes()).not.toContain('working')
    })

    it('applies active class when isActive is true', async () => {
      await wrapper.setProps({ isActive: true })
      
      const card = wrapper.find('.expert-card')
      expect(card.classes()).toContain('active')
    })

    it('applies working class when isWorking is true', async () => {
      await wrapper.setProps({ isWorking: true })
      
      const card = wrapper.find('.expert-card')
      expect(card.classes()).toContain('working')
    })

    it('applies both active and working classes when both are true', async () => {
      await wrapper.setProps({ isActive: true, isWorking: true })
      
      const card = wrapper.find('.expert-card')
      expect(card.classes()).toContain('active')
      expect(card.classes()).toContain('working')
    })

    it('removes active class when isActive becomes false', async () => {
      await wrapper.setProps({ isActive: true })
      await wrapper.setProps({ isActive: false })
      
      const card = wrapper.find('.expert-card')
      expect(card.classes()).not.toContain('active')
    })

    it('removes working class when isWorking becomes false', async () => {
      await wrapper.setProps({ isWorking: true })
      await wrapper.setProps({ isWorking: false })
      
      const card = wrapper.find('.expert-card')
      expect(card.classes()).not.toContain('working')
    })
  })

  describe('Expert Data Handling', () => {
    it('handles expert with no specialties', async () => {
      const expertWithoutSpecialties = {
        ...mockExpert,
        specialties: []
      }
      
      await wrapper.setProps({ expert: expertWithoutSpecialties })
      
      const specialtyTags = wrapper.findAll('.specialty-tag')
      expect(specialtyTags.length).toBe(0)
    })

    it('handles expert with single specialty', async () => {
      const expertWithSingleSpecialty = {
        ...mockExpert,
        specialties: ['单一专业']
      }
      
      await wrapper.setProps({ expert: expertWithSingleSpecialty })
      
      const specialtyTags = wrapper.findAll('.specialty-tag')
      expect(specialtyTags.length).toBe(1)
      expect(specialtyTags[0].text()).toBe('单一专业')
    })

    it('handles expert with many specialties', async () => {
      const expertWithManySpecialties = {
        ...mockExpert,
        specialties: ['专业1', '专业2', '专业3', '专业4', '专业5', '专业6']
      }
      
      await wrapper.setProps({ expert: expertWithManySpecialties })
      
      const specialtyTags = wrapper.findAll('.specialty-tag')
      expect(specialtyTags.length).toBe(6)
    })

    it('handles expert with empty name and role', async () => {
      const expertWithEmptyFields = {
        ...mockExpert,
        name: '',
        role: ''
      }
      
      await wrapper.setProps({ expert: expertWithEmptyFields })
      
      expect(wrapper.find('.expert-name').text()).toBe('')
      expect(wrapper.find('.expert-role').text()).toBe('')
    })

    it('handles expert with no avatar', async () => {
      const expertWithoutAvatar = {
        ...mockExpert,
        avatar: ''
      }
      
      await wrapper.setProps({ expert: expertWithoutAvatar })
      
      expect(wrapper.find('.expert-avatar').text()).toBe('')
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined props gracefully', () => {
      const wrapperWithUndefinedProps = mount(ExpertCard, {
        props: {
          expert: mockExpert,
          isActive: undefined,
          isWorking: undefined,
          workProgress: undefined,
          lastOutput: undefined,
          lastScore: undefined
        }
      })
      
      expect(wrapperWithUndefinedProps.find('.expert-card').exists()).toBe(true)
      expect(wrapperWithUndefinedProps.find('.status-indicator').classes()).toContain('idle')
      expect(wrapperWithUndefinedProps.find('.work-progress').exists()).toBe(false)
      expect(wrapperWithUndefinedProps.find('.last-output').exists()).toBe(false)
      
      wrapperWithUndefinedProps.unmount()
    })

    it('handles null props gracefully', () => {
      const wrapperWithNullProps = mount(ExpertCard, {
        props: {
          expert: mockExpert,
          isActive: null,
          isWorking: null,
          workProgress: null,
          lastOutput: null,
          lastScore: null
        }
      })
      
      expect(wrapperWithNullProps.find('.expert-card').exists()).toBe(true)
      expect(wrapperWithNullProps.find('.status-indicator').classes()).toContain('idle')
      expect(wrapperWithNullProps.find('.work-progress').exists()).toBe(false)
      expect(wrapperWithNullProps.find('.last-output').exists()).toBe(false)
      
      wrapperWithNullProps.unmount()
    })

    it('handles work progress with missing properties', async () => {
      const incompleteProgress = {
        title: '测试进度'
        // Missing percentage and text
      }
      
      await wrapper.setProps({ workProgress: incompleteProgress })
      
      const progressSection = wrapper.find('.work-progress')
      expect(progressSection.exists()).toBe(true)
      
      const progressFill = progressSection.find('.progress-fill')
      expect(progressFill.attributes('style')).toContain('width: undefined%')
      
      const progressText = progressSection.find('.progress-text')
      expect(progressText.text()).toBe('undefined')
    })

    it('handles negative progress percentage', async () => {
      const negativeProgress = {
        title: '负进度',
        percentage: -10,
        text: '-10% 完成'
      }
      
      await wrapper.setProps({ workProgress: negativeProgress })
      
      const progressFill = wrapper.find('.progress-fill')
      expect(progressFill.attributes('style')).toContain('width: -10%')
    })

    it('handles progress percentage over 100', async () => {
      const overflowProgress = {
        title: '超额进度',
        percentage: 150,
        text: '150% 完成'
      }
      
      await wrapper.setProps({ workProgress: overflowProgress })
      
      const progressFill = wrapper.find('.progress-fill')
      expect(progressFill.attributes('style')).toContain('width: 150%')
    })

    it('handles negative score', async () => {
      await wrapper.setProps({ lastOutput: '测试输出', lastScore: -5 })
      
      const score = wrapper.find('.output-score')
      expect(score.text()).toBe('评分: -5/10')
    })

    it('handles score over 10', async () => {
      await wrapper.setProps({ lastOutput: '测试输出', lastScore: 15 })
      
      const score = wrapper.find('.output-score')
      expect(score.text()).toBe('评分: 15/10')
    })
  })

  describe('Component Structure', () => {
    it('has correct DOM structure', () => {
      expect(wrapper.find('.expert-card').exists()).toBe(true)
      expect(wrapper.find('.expert-header').exists()).toBe(true)
      expect(wrapper.find('.expert-avatar').exists()).toBe(true)
      expect(wrapper.find('.expert-info').exists()).toBe(true)
      expect(wrapper.find('.expert-status').exists()).toBe(true)
      expect(wrapper.find('.expert-specialties').exists()).toBe(true)
    })

    it('maintains proper nesting of elements', () => {
      const card = wrapper.find('.expert-card')
      const header = card.find('.expert-header')
      const avatar = header.find('.expert-avatar')
      const info = header.find('.expert-info')
      const status = header.find('.expert-status')
      
      expect(card.contains(header)).toBe(true)
      expect(header.contains(avatar)).toBe(true)
      expect(header.contains(info)).toBe(true)
      expect(header.contains(status)).toBe(true)
    })

    it('renders specialty tags correctly', () => {
      const specialtiesSection = wrapper.find('.expert-specialties')
      const tagsContainer = specialtiesSection.find('.specialty-tags')
      const tags = tagsContainer.findAll('.specialty-tag')
      
      expect(specialtiesSection.contains(tagsContainer)).toBe(true)
      expect(tagsContainer.contains(tags[0])).toBe(true)
      expect(tagsContainer.contains(tags[1])).toBe(true)
      expect(tagsContainer.contains(tags[2])).toBe(true)
    })
  })
})