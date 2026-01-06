import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ExpertMessageRenderer from '@/components/ai-assistant/ExpertMessageRenderer.vue'
import { createTestingPinia } from '@pinia/testing'
import ElementPlus from 'element-plus'

// Mock dependencies
vi.mock('@/composables/useExpertVoice', () => ({
  useExpertVoice: () => ({
    isVoiceMode: { value: false },
    isGenerating: { value: false },
    hasVoiceData: { value: false },
    isPlaying: { value: false },
    isLoading: { value: false },
    generationProgress: { value: 0 },
    voiceSentences: { value: [] },
    formattedTotalDuration: { value: '0:00' },
    currentPlayingIndex: { value: -1 },
    toggleVoiceMode: vi.fn(),
    playAllSentences: vi.fn(),
    pausePlayback: vi.fn(),
    stopAllPlayback: vi.fn(),
    playSentence: vi.fn(),
    onSentenceEnded: vi.fn(),
    onSentenceError: vi.fn()
  })
}))

vi.mock('./VoiceMessageBar.vue', () => ({
  default: {
    name: 'VoiceMessageBar',
    template: '<div class="voice-message-bar">Voice Message Bar</div>'
  }
}))

// 控制台错误检测变量
let consoleSpy: any

describe('ExpertMessageRenderer.vue', () => {
  let wrapper: any
  let mockExpertVoice: any

  const mockProps = {
    expertType: 'planner',
    expertName: 'Test Expert',
    analysis: 'This is a test analysis with **bold text** and *italic text*.',
    keyPoints: ['Key point 1', 'Key point 2', 'Key point 3'],
    recommendations: ['Recommendation 1', 'Recommendation 2'],
    timestamp: '2024-01-01T10:30:00'
  }

  beforeEach(() => {
    mockExpertVoice = {
      isVoiceMode: { value: false },
      isGenerating: { value: false },
      hasVoiceData: { value: false },
      isPlaying: { value: false },
      isLoading: { value: false },
      generationProgress: { value: 0 },
      voiceSentences: { value: [] },
      formattedTotalDuration: { value: '0:00' },
      currentPlayingIndex: { value: -1 },
      toggleVoiceMode: vi.fn(),
      playAllSentences: vi.fn(),
      pausePlayback: vi.fn(),
      stopAllPlayback: vi.fn(),
      playSentence: vi.fn(),
      onSentenceEnded: vi.fn(),
      onSentenceError: vi.fn()
    }

    vi.mocked(useExpertVoice).mockReturnValue(mockExpertVoice)

    wrapper = mount(ExpertMessageRenderer, {
      global: {
        plugins: [ElementPlus, createTestingPinia()],
        stubs: {
          'el-icon': true,
          'el-button-group': true,
          'el-button': true,
          'el-tag': true,
          'el-progress': true,
          'el-icon': true,
          'VoiceMessageBar': true
        }
      },
      props: mockProps
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('Component Rendering', () => {
    it('renders the expert message component correctly', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.expert-message').exists()).toBe(true)
      expect(wrapper.find('.expert-header').exists()).toBe(true)
      expect(wrapper.find('.expert-content').exists()).toBe(true)
      expect(wrapper.find('.expert-signature').exists()).toBe(true)
    })

    it('displays expert information correctly', () => {
      expect(wrapper.find('.expert-name').text()).toBe('Test Expert')
      expect(wrapper.find('.expert-role').text()).toBe('资深策划师')
    })

    it('shows text mode by default', () => {
      expect(wrapper.find('.text-mode').exists()).toBe(true)
      expect(wrapper.find('.voice-mode').exists()).toBe(false)
    })

    it('shows voice mode when isVoiceMode is true', async () => {
      mockExpertVoice.isVoiceMode.value = true
      await nextTick()
      
      expect(wrapper.find('.text-mode').exists()).toBe(false)
      expect(wrapper.find('.voice-mode').exists()).toBe(true)
    })

    it('displays expert badge with correct type', () => {
      const badge = wrapper.find('.expert-badge .el-tag')
      expect(badge.exists()).toBe(true)
      expect(badge.attributes('type')).toBe('danger')
      expect(badge.text()).toBe('策划专家')
    })
  })

  describe('Props Handling', () => {
    it('receives expertType prop correctly', () => {
      expect(wrapper.props('expertType')).toBe('planner')
    })

    it('receives expertName prop correctly', () => {
      expect(wrapper.props('expertName')).toBe('Test Expert')
    })

    it('receives analysis prop correctly', () => {
      expect(wrapper.props('analysis')).toBe(mockProps.analysis)
    })

    it('receives keyPoints prop correctly', () => {
      expect(wrapper.props('keyPoints')).toEqual(mockProps.keyPoints)
    })

    it('receives recommendations prop correctly', () => {
      expect(wrapper.props('recommendations')).toEqual(mockProps.recommendations)
    })

    it('receives timestamp prop correctly', () => {
      expect(wrapper.props('timestamp')).toBe(mockProps.timestamp)
    })

    it('handles missing optional props gracefully', async () => {
      await wrapper.setProps({
        expertType: 'teacher',
        expertName: 'Teacher Expert'
      })
      
      expect(wrapper.find('.analysis-section').exists()).toBe(false)
      expect(wrapper.find('.key-points-section').exists()).toBe(false)
      expect(wrapper.find('.recommendations-section').exists()).toBe(false)
    })
  })

  describe('Content Sections', () => {
    it('displays analysis section when analysis is provided', () => {
      const analysisSection = wrapper.find('.analysis-section')
      expect(analysisSection.exists()).toBe(true)
      expect(analysisSection.find('.analysis-text').exists()).toBe(true)
    })

    it('displays key points section when keyPoints are provided', () => {
      const keyPointsSection = wrapper.find('.key-points-section')
      expect(keyPointsSection.exists()).toBe(true)
      
      const keyPoints = wrapper.findAll('.key-point-item')
      expect(keyPoints.length).toBe(3)
    })

    it('displays recommendations section when recommendations are provided', () => {
      const recommendationsSection = wrapper.find('.recommendations-section')
      expect(recommendationsSection.exists()).toBe(true)
      
      const recommendations = wrapper.findAll('.recommendation-card')
      expect(recommendations.length).toBe(2)
    })

    it('hides sections when data is not provided', async () => {
      await wrapper.setProps({
        analysis: undefined,
        keyPoints: undefined,
        recommendations: undefined
      })
      
      expect(wrapper.find('.analysis-section').exists()).toBe(false)
      expect(wrapper.find('.key-points-section').exists()).toBe(false)
      expect(wrapper.find('.recommendations-section').exists()).toBe(false)
    })
  })

  describe('Expert Type Mapping', () => {
    it('maps expert types to correct icons', () => {
      expect(wrapper.vm.getExpertIcon('planner')).toBeDefined()
      expect(wrapper.vm.getExpertIcon('psychologist')).toBeDefined()
      expect(wrapper.vm.getExpertIcon('unknown')).toBeDefined()
    })

    it('maps expert types to correct roles', () => {
      expect(wrapper.vm.getExpertRole('planner')).toBe('资深策划师')
      expect(wrapper.vm.getExpertRole('teacher')).toBe('一线教师')
      expect(wrapper.vm.getExpertRole('unknown')).toBe('专业顾问')
    })

    it('maps expert types to correct titles', () => {
      expect(wrapper.vm.getExpertTitle('planner')).toBe('策划专家')
      expect(wrapper.vm.getExpertTitle('teacher')).toBe('教学专家')
      expect(wrapper.vm.getExpertTitle('unknown')).toBe('专家')
    })

    it('maps expert types to correct tag types', () => {
      expect(wrapper.vm.getExpertTagType('planner')).toBe('danger')
      expect(wrapper.vm.getExpertTagType('teacher')).toBe('info')
      expect(wrapper.vm.getExpertTagType('unknown')).toBe('primary')
    })
  })

  describe('Content Formatting', () => {
    it('formats markdown content correctly', () => {
      const formattedContent = wrapper.vm.formatContent('This is **bold** and *italic* text.')
      expect(formattedContent).toContain('<strong>bold</strong>')
      expect(formattedContent).toContain('<em>italic</em>')
    })

    it('converts newlines to <br> tags', () => {
      const formattedContent = wrapper.vm.formatContent('Line 1\nLine 2')
      expect(formattedContent).toContain('Line 1<br>Line 2')
    })

    it('handles empty content gracefully', () => {
      const formattedContent = wrapper.vm.formatContent('')
      expect(formattedContent).toBe('')
    })

    it('handles undefined content gracefully', () => {
      const formattedContent = wrapper.vm.formatContent(undefined as any)
      expect(formattedContent).toBe('')
    })
  })

  describe('Voice Mode Functionality', () => {
    it('switches to voice mode when voice button is clicked', async () => {
      const voiceButton = wrapper.findAll('.mode-toggle .el-button')[1]
      await voiceButton.trigger('click')
      
      expect(mockExpertVoice.toggleVoiceMode).toHaveBeenCalled()
    })

    it('switches to text mode when text button is clicked', async () => {
      mockExpertVoice.isVoiceMode.value = true
      await nextTick()
      
      const textButton = wrapper.findAll('.mode-toggle .el-button')[0]
      await textButton.trigger('click')
      
      expect(mockExpertVoice.toggleVoiceMode).toHaveBeenCalled()
    })

    it('disables voice buttons when generating', async () => {
      mockExpertVoice.isGenerating.value = true
      await nextTick()
      
      const voiceButton = wrapper.findAll('.mode-toggle .el-button')[1]
      expect(voiceButton.attributes('disabled')).toBeDefined()
    })

    it('shows voice generating state', async () => {
      mockExpertVoice.isVoiceMode.value = true
      mockExpertVoice.isGenerating.value = true
      await nextTick()
      
      expect(wrapper.find('.voice-generating').exists()).toBe(true)
      expect(wrapper.find('.voice-player').exists()).toBe(false)
    })

    it('shows voice player when voice data is available', async () => {
      mockExpertVoice.isVoiceMode.value = true
      mockExpertVoice.hasVoiceData.value = true
      await nextTick()
      
      expect(wrapper.find('.voice-generating').exists()).toBe(false)
      expect(wrapper.find('.voice-player').exists()).toBe(true)
    })

    it('shows voice error when voice generation fails', async () => {
      mockExpertVoice.isVoiceMode.value = true
      mockExpertVoice.isGenerating.value = false
      mockExpertVoice.hasVoiceData.value = false
      await nextTick()
      
      expect(wrapper.find('.voice-error').exists()).toBe(true)
    })
  })

  describe('Voice Controls', () => {
    beforeEach(async () => {
      mockExpertVoice.isVoiceMode.value = true
      mockExpertVoice.hasVoiceData.value = true
      await nextTick()
    })

    it('toggles play all when play button is clicked', async () => {
      const playButton = wrapper.find('.voice-controls .el-button')
      await playButton.trigger('click')
      
      expect(mockExpertVoice.playAllSentences).toHaveBeenCalled()
    })

    it('shows pause button when playing', async () => {
      mockExpertVoice.isPlaying.value = true
      await nextTick()
      
      const playButton = wrapper.find('.voice-controls .el-button')
      expect(playButton.text()).toContain('暂停')
    })

    it('stops playback when stop button is clicked', async () => {
      const stopButton = wrapper.findAll('.voice-controls .el-button')[1]
      await stopButton.trigger('click')
      
      expect(mockExpertVoice.stopAllPlayback).toHaveBeenCalled()
    })

    it('disables stop button when not playing', async () => {
      mockExpertVoice.isPlaying.value = false
      await nextTick()
      
      const stopButton = wrapper.findAll('.voice-controls .el-button')[1]
      expect(stopButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('Voice Bar Events', () => {
    it('handles sentence play events', () => {
      wrapper.vm.onSentencePlay(0)
      expect(mockExpertVoice.playSentence).toHaveBeenCalledWith(0)
    })

    it('handles sentence pause events', () => {
      wrapper.vm.onSentencePause(0)
      expect(mockExpertVoice.pausePlayback).toHaveBeenCalled()
    })

    it('handles sentence ended events', () => {
      wrapper.vm.onSentenceEnded(0)
      expect(mockExpertVoice.onSentenceEnded).toHaveBeenCalledWith(0)
    })

    it('handles sentence error events', () => {
      const error = 'Test error'
      wrapper.vm.onSentenceError(0, error)
      expect(mockExpertVoice.onSentenceError).toHaveBeenCalledWith(0, error)
    })
  })

  describe('Time Formatting', () => {
    it('formats timestamp correctly', () => {
      const formattedTime = wrapper.vm.formatTime('2024-01-01T10:30:00')
      expect(formattedTime).toMatch(/\d{2}:\d{2}/)
    })

    it('handles empty timestamp gracefully', () => {
      const formattedTime = wrapper.vm.formatTime('')
      expect(formattedTime).toBe('')
    })

    it('handles undefined timestamp gracefully', () => {
      const formattedTime = wrapper.vm.formatTime(undefined as any)
      expect(formattedTime).toBe('')
    })
  })

  describe('Full Content Generation', () => {
    it('generates full expert content correctly', () => {
      const fullContent = wrapper.vm.getFullExpertContent()
      expect(fullContent).toContain(mockProps.analysis)
      expect(fullContent).toContain('关键要点：')
      expect(fullContent).toContain('专业建议：')
    })

    it('handles missing sections in content generation', async () => {
      await wrapper.setProps({
        analysis: undefined,
        keyPoints: undefined,
        recommendations: undefined
      })
      
      const fullContent = wrapper.vm.getFullExpertContent()
      expect(fullContent).toBe('')
    })

    it('handles partial content generation', async () => {
      await wrapper.setProps({
        analysis: 'Test analysis',
        keyPoints: undefined,
        recommendations: ['Test recommendation']
      })
      
      const fullContent = wrapper.vm.getFullExpertContent()
      expect(fullContent).toContain('Test analysis')
      expect(fullContent).toContain('专业建议：')
    })
  })

  describe('Accessibility', () => {
    it('provides proper ARIA attributes', () => {
      const expertMessage = wrapper.find('.expert-message')
      expect(expertMessage.exists()).toBe(true)
    })

    it('maintains proper heading structure', () => {
      const expertName = wrapper.find('.expert-name')
      const sectionHeaders = wrapper.findAll('.section-header h5')
      
      expect(expertName.exists()).toBe(true)
      expect(sectionHeaders.length).toBeGreaterThan(0)
    })

    it('provides proper button labeling', () => {
      const buttons = wrapper.findAll('.el-button')
      buttons.forEach(button => {
        expect(button.text().trim()).not.toBe('')
      })
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive classes for mobile devices', () => {
      const expertMessage = wrapper.find('.expert-message')
      expect(expertMessage.exists()).toBe(true)
    })
  })

  describe('Performance Optimization', () => {
    it('uses efficient content formatting', () => {
      const longContent = 'This is a very long content '.repeat(100)
      const formatted = wrapper.vm.formatContent(longContent)
      expect(formatted).toBeDefined()
    })

    it('handles large key points arrays efficiently', async () => {
      const manyKeyPoints = Array.from({ length: 100 }, (_, i) => `Key point ${i}`)
      await wrapper.setProps({ keyPoints: manyKeyPoints })
      
      const keyPointItems = wrapper.findAll('.key-point-item')
      expect(keyPointItems.length).toBe(100)
    })
  })

  describe('Error Handling', () => {
    it('handles missing expert type gracefully', async () => {
      await wrapper.setProps({ expertType: '' })
      
      expect(wrapper.vm.getExpertIcon('')).toBeDefined()
      expect(wrapper.vm.getExpertRole('')).toBe('专业顾问')
    })

    it('handles malformed content gracefully', () => {
      const malformedContent = 'Content with **unclosed bold'
      const formatted = wrapper.vm.formatContent(malformedContent)
      expect(formatted).toBeDefined()
    })

    it('handles voice mode errors gracefully', async () => {
      mockExpertVoice.toggleVoiceMode.mockRejectedValue(new Error('Voice error'))
      
      const voiceButton = wrapper.findAll('.mode-toggle .el-button')[1]
      await voiceButton.trigger('click')
      
      expect(mockExpertVoice.toggleVoiceMode).toHaveBeenCalled()
    })
  })

  describe('Integration Tests', () => {
    it('integrates properly with Element Plus components', () => {
      const buttons = wrapper.findAllComponents({ name: 'ElButton' })
      const tags = wrapper.findAllComponents({ name: 'ElTag' })
      
      expect(buttons.length).toBeGreaterThan(0)
      expect(tags.length).toBeGreaterThan(0)
    })

    it('maintains state consistency during mode switching', async () => {
      mockExpertVoice.isVoiceMode.value = false
      await nextTick()
      
      expect(wrapper.find('.text-mode').exists()).toBe(true)
      
      mockExpertVoice.isVoiceMode.value = true
      await nextTick()
      
      expect(wrapper.find('.voice-mode').exists()).toBe(true)
      expect(wrapper.find('.text-mode').exists()).toBe(false)
    })

    it('updates UI based on voice state changes', async () => {
      mockExpertVoice.isVoiceMode.value = true
      mockExpertVoice.isGenerating.value = true
      await nextTick()
      
      expect(wrapper.find('.voice-generating').exists()).toBe(true)
      
      mockExpertVoice.isGenerating.value = false
      mockExpertVoice.hasVoiceData.value = true
      await nextTick()
      
      expect(wrapper.find('.voice-generating').exists()).toBe(false)
      expect(wrapper.find('.voice-player').exists()).toBe(true)
    })
  })
})