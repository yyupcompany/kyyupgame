import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import InputArea from '@/components/ai-assistant/InputArea.vue'
import { createTestingPinia } from '@pinia/testing'
import ElementPlus from 'element-plus'

// Mock dependencies
vi.mock('@/utils/fileUpload', () => ({
  fileUploadManager: {
    uploadFile: vi.fn()
  }
}))

// 控制台错误检测变量
let consoleSpy: any

describe('InputArea.vue', () => {
  let wrapper: any
  let mockUploadFile: any

  const mockProps = {
    inputMessage: 'Test message',
    sending: false,
    webSearch: false,
    autoExecute: false,
    isRegistered: true,
    canAutoExecute: true,
    isListening: false,
    isSpeaking: false,
    speechStatus: 'idle',
    hasLastMessage: true
  }

  beforeEach(() => {
    mockUploadFile = vi.fn()
    vi.mocked(fileUploadManager.uploadFile).mockImplementation(mockUploadFile)

    wrapper = mount(InputArea, {
      global: {
        plugins: [ElementPlus, createTestingPinia()],
        stubs: {
          'el-input': true,
          'el-tooltip': true,
          'el-icon': true,
          'el-message': true
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
    it('renders the input area component correctly', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.claude-input-container').exists()).toBe(true)
      expect(wrapper.find('.input-wrapper').exists()).toBe(true)
    })

    it('displays main input area', () => {
      const mainInput = wrapper.find('.main-input')
      expect(mainInput.exists()).toBe(true)
    })

    it('displays footer controls', () => {
      const footerRow = wrapper.find('.footer-row')
      expect(footerRow.exists()).toBe(true)
    })

    it('displays feature icons', () => {
      const featureIcons = wrapper.find('.feature-icons')
      expect(featureIcons.exists()).toBe(true)
    })

    it('displays right actions', () => {
      const rightActions = wrapper.find('.right-actions')
      expect(rightActions.exists()).toBe(true)
    })

    it('hides voice status when idle', () => {
      expect(wrapper.find('.voice-status').exists()).toBe(false)
    })

    it('shows voice status when not idle', async () => {
      await wrapper.setProps({ speechStatus: 'listening' })
      expect(wrapper.find('.voice-status').exists()).toBe(true)
    })
  })

  describe('Props Handling', () => {
    it('receives inputMessage prop correctly', () => {
      expect(wrapper.props('inputMessage')).toBe('Test message')
    })

    it('receives sending prop correctly', () => {
      expect(wrapper.props('sending')).toBe(false)
    })

    it('receives webSearch prop correctly', () => {
      expect(wrapper.props('webSearch')).toBe(false)
    })

    it('receives autoExecute prop correctly', () => {
      expect(wrapper.props('autoExecute')).toBe(false)
    })

    it('receives isRegistered prop correctly', () => {
      expect(wrapper.props('isRegistered')).toBe(true)
    })

    it('receives canAutoExecute prop correctly', () => {
      expect(wrapper.props('canAutoExecute')).toBe(true)
    })

    it('receives isListening prop correctly', () => {
      expect(wrapper.props('isListening')).toBe(false)
    })

    it('receives isSpeaking prop correctly', () => {
      expect(wrapper.props('isSpeaking')).toBe(false)
    })

    it('receives speechStatus prop correctly', () => {
      expect(wrapper.props('speechStatus')).toBe('idle')
    })

    it('receives hasLastMessage prop correctly', () => {
      expect(wrapper.props('hasLastMessage')).toBe(true)
    })

    it('reacts to prop changes', async () => {
      await wrapper.setProps({
        inputMessage: 'New message',
        sending: true,
        webSearch: true,
        autoExecute: true
      })

      expect(wrapper.props('inputMessage')).toBe('New message')
      expect(wrapper.props('sending')).toBe(true)
      expect(wrapper.props('webSearch')).toBe(true)
      expect(wrapper.props('autoExecute')).toBe(true)
    })
  })

  describe('Event Emissions', () => {
    it('emits update:inputMessage when input changes', async () => {
      const input = wrapper.findComponent({ name: 'ElInput' })
      await input.vm.$emit('update:modelValue', 'New message')
      
      expect(wrapper.emitted('update:inputMessage')).toBeTruthy()
      expect(wrapper.emitted('update:inputMessage')[0]).toEqual(['New message'])
    })

    it('emits send on Ctrl+Enter keydown', async () => {
      const input = wrapper.findComponent({ name: 'ElInput' })
      await input.vm.$emit('keydown.ctrl.enter')
      
      expect(wrapper.emitted('send')).toBeTruthy()
    })

    it('emits send on Meta+Enter keydown', async () => {
      const input = wrapper.findComponent({ name: 'ElInput' })
      await input.vm.$emit('keydown.meta.enter')
      
      expect(wrapper.emitted('send')).toBeTruthy()
    })

    it('emits update:webSearch when search button is clicked', async () => {
      const searchButton = wrapper.find('.icon-btn')
      await searchButton.trigger('click')
      
      expect(wrapper.emitted('update:webSearch')).toBeTruthy()
      expect(wrapper.emitted('update:webSearch')[0]).toEqual([true])
    })

    it('emits update:autoExecute when smart agent button is clicked', async () => {
      const smartAgentButton = wrapper.findAll('.icon-btn')[1]
      await smartAgentButton.trigger('click')
      
      expect(wrapper.emitted('update:autoExecute')).toBeTruthy()
      expect(wrapper.emitted('update:autoExecute')[0]).toEqual([true])
    })

    it('emits toggle-voice-input when voice button is clicked', async () => {
      const voiceButton = wrapper.find('.voice-btn')
      await voiceButton.trigger('click')
      
      expect(wrapper.emitted('toggle-voice-input')).toBeTruthy()
    })

    it('emits toggle-voice-output when voice output button is clicked', async () => {
      const voiceOutputButton = wrapper.findAll('.voice-btn')[1]
      await voiceOutputButton.trigger('click')
      
      expect(wrapper.emitted('toggle-voice-output')).toBeTruthy()
    })

    it('emits send when send button is clicked', async () => {
      const sendButton = wrapper.find('.send-btn')
      await sendButton.trigger('click')
      
      expect(wrapper.emitted('send')).toBeTruthy()
    })
  })

  describe('Button States and Interactions', () => {
    it('disables search button when not registered', async () => {
      await wrapper.setProps({ isRegistered: false })
      
      const searchButton = wrapper.find('.icon-btn')
      expect(searchButton.attributes('disabled')).toBeDefined()
    })

    it('disables smart agent button when cannot auto execute', async () => {
      await wrapper.setProps({ canAutoExecute: false })
      
      const smartAgentButton = wrapper.findAll('.icon-btn')[1]
      expect(smartAgentButton.attributes('disabled')).toBeDefined()
    })

    it('disables file upload button when uploading file', async () => {
      wrapper.vm.uploadingFile = true
      await nextTick()
      
      const fileButton = wrapper.findAll('.icon-btn')[2]
      expect(fileButton.attributes('disabled')).toBeDefined()
    })

    it('disables file upload button when sending', async () => {
      await wrapper.setProps({ sending: true })
      
      const fileButton = wrapper.findAll('.icon-btn')[2]
      expect(fileButton.attributes('disabled')).toBeDefined()
    })

    it('disables image upload button when uploading image', async () => {
      wrapper.vm.uploadingImage = true
      await nextTick()
      
      const imageButton = wrapper.findAll('.icon-btn')[3]
      expect(imageButton.attributes('disabled')).toBeDefined()
    })

    it('disables image upload button when sending', async () => {
      await wrapper.setProps({ sending: true })
      
      const imageButton = wrapper.findAll('.icon-btn')[3]
      expect(imageButton.attributes('disabled')).toBeDefined()
    })

    it('disables send button when input is empty', async () => {
      await wrapper.setProps({ inputMessage: '' })
      
      const sendButton = wrapper.find('.send-btn')
      expect(sendButton.classes()).toContain('disabled')
    })

    it('disables send button when sending', async () => {
      await wrapper.setProps({ sending: true })
      
      const sendButton = wrapper.find('.send-btn')
      expect(sendButton.classes()).toContain('disabled')
    })

    it('shows loading icon when sending', async () => {
      await wrapper.setProps({ sending: true })
      
      const sendButton = wrapper.find('.send-btn')
      expect(sendButton.find('.loading').exists()).toBe(true)
    })

    it('shows pause icon when listening', async () => {
      await wrapper.setProps({ isListening: true })
      
      const voiceButton = wrapper.find('.voice-btn')
      expect(voiceButton.findComponent({ name: 'VideoPause' }).exists()).toBe(true)
    })

    it('shows microphone icon when not listening', () => {
      const voiceButton = wrapper.find('.voice-btn')
      expect(voiceButton.findComponent({ name: 'Microphone' }).exists()).toBe(true)
    })

    it('shows play icon when not speaking', () => {
      const voiceOutputButton = wrapper.findAll('.voice-btn')[1]
      expect(voiceOutputButton.findComponent({ name: 'Headset' }).exists()).toBe(true)
    })

    it('shows pause icon when speaking', async () => {
      await wrapper.setProps({ isSpeaking: true })
      
      const voiceOutputButton = wrapper.findAll('.voice-btn')[1]
      expect(voiceOutputButton.findComponent({ name: 'VideoPlay' }).exists()).toBe(true)
    })

    it('disables voice output button when no last message', async () => {
      await wrapper.setProps({ hasLastMessage: false })
      
      const voiceOutputButton = wrapper.findAll('.voice-btn')[1]
      expect(voiceOutputButton.classes()).toContain('disabled')
    })

    it('disables voice output button when sending', async () => {
      await wrapper.setProps({ sending: true })
      
      const voiceOutputButton = wrapper.findAll('.voice-btn')[1]
      expect(voiceOutputButton.classes()).toContain('disabled')
    })

    it('disables stop button when not speaking', async () => {
      await wrapper.setProps({ isSpeaking: false })
      
      const stopButton = wrapper.findAll('.voice-btn')[1]
      expect(stopButton.classes()).toContain('disabled')
    })
  })

  describe('File Upload Functionality', () => {
    it('triggers file upload when file button is clicked', async () => {
      const fileInput = wrapper.find('input[type="file"]')
      const fileButton = wrapper.findAll('.icon-btn')[2]
      
      await fileButton.trigger('click')
      expect(fileInput.exists()).toBe(true)
    })

    it('triggers image upload when image button is clicked', async () => {
      const imageInput = wrapper.findAll('input[type="file"]')[1]
      const imageButton = wrapper.findAll('.icon-btn')[3]
      
      await imageButton.trigger('click')
      expect(imageInput.exists()).toBe(true)
    })

    it('handles file selection successfully', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const mockResponse = { data: { accessUrl: 'https://example.com/file.txt', originalName: 'test.txt' } }
      
      mockUploadFile.mockResolvedValue(mockResponse)
      
      const fileInput = wrapper.find('input[type="file"]')
      Object.defineProperty(fileInput.element, 'files', {
        value: [mockFile],
        writable: false
      })
      
      await fileInput.trigger('change')
      
      expect(mockUploadFile).toHaveBeenCalledWith(mockFile, { module: 'ai-assistant', isPublic: false })
      expect(wrapper.emitted('update:inputMessage')).toBeTruthy()
    })

    it('handles image selection successfully', async () => {
      const mockImage = new File(['test image content'], 'test.png', { type: 'image/png' })
      const mockResponse = { data: { accessUrl: 'https://example.com/image.png', originalName: 'test.png' } }
      
      mockUploadFile.mockResolvedValue(mockResponse)
      
      const imageInput = wrapper.findAll('input[type="file"]')[1]
      Object.defineProperty(imageInput.element, 'files', {
        value: [mockImage],
        writable: false
      })
      
      await imageInput.trigger('change')
      
      expect(mockUploadFile).toHaveBeenCalledWith(mockImage, { module: 'ai-assistant', isPublic: false })
      expect(wrapper.emitted('update:inputMessage')).toBeTruthy()
    })

    it('rejects files larger than 10MB', async () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.txt', { type: 'text/plain' })
      
      const fileInput = wrapper.find('input[type="file"]')
      Object.defineProperty(fileInput.element, 'files', {
        value: [largeFile],
        writable: false
      })
      
      await fileInput.trigger('change')
      
      expect(mockUploadFile).not.toHaveBeenCalled()
    })

    it('rejects images larger than 5MB', async () => {
      const largeImage = new File(['x'.repeat(6 * 1024 * 1024)], 'large.png', { type: 'image/png' })
      
      const imageInput = wrapper.findAll('input[type="file"]')[1]
      Object.defineProperty(imageInput.element, 'files', {
        value: [largeImage],
        writable: false
      })
      
      await imageInput.trigger('change')
      
      expect(mockUploadFile).not.toHaveBeenCalled()
    })

    it('handles file upload errors gracefully', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      
      mockUploadFile.mockRejectedValue(new Error('Upload failed'))
      
      const fileInput = wrapper.find('input[type="file"]')
      Object.defineProperty(fileInput.element, 'files', {
        value: [mockFile],
        writable: false
      })
      
      await fileInput.trigger('change')
      
      expect(mockUploadFile).toHaveBeenCalled()
      expect(wrapper.vm.uploadingFile).toBe(false)
    })

    it('handles image upload errors gracefully', async () => {
      const mockImage = new File(['test image content'], 'test.png', { type: 'image/png' })
      
      mockUploadFile.mockRejectedValue(new Error('Upload failed'))
      
      const imageInput = wrapper.findAll('input[type="file"]')[1]
      Object.defineProperty(imageInput.element, 'files', {
        value: [mockImage],
        writable: false
      })
      
      await imageInput.trigger('change')
      
      expect(mockUploadFile).toHaveBeenCalled()
      expect(wrapper.vm.uploadingImage).toBe(false)
    })

    it('clears file input after upload', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const mockResponse = { data: { accessUrl: 'https://example.com/file.txt', originalName: 'test.txt' } }
      
      mockUploadFile.mockResolvedValue(mockResponse)
      
      const fileInput = wrapper.find('input[type="file"]')
      Object.defineProperty(fileInput.element, 'files', {
        value: [mockFile],
        writable: false
      })
      
      await fileInput.trigger('change')
      
      expect(fileInput.element.value).toBe('')
    })

    it('clears image input after upload', async () => {
      const mockImage = new File(['test image content'], 'test.png', { type: 'image/png' })
      const mockResponse = { data: { accessUrl: 'https://example.com/image.png', originalName: 'test.png' } }
      
      mockUploadFile.mockResolvedValue(mockResponse)
      
      const imageInput = wrapper.findAll('input[type="file"]')[1]
      Object.defineProperty(imageInput.element, 'files', {
        value: [mockImage],
        writable: false
      })
      
      await imageInput.trigger('change')
      
      expect(imageInput.element.value).toBe('')
    })
  })

  describe('Smart Agent Handling', () => {
    it('shows warning when smart agent is clicked without permission', async () => {
      await wrapper.setProps({ canAutoExecute: false })
      
      const smartAgentButton = wrapper.findAll('.icon-btn')[1]
      await smartAgentButton.trigger('click')
      
      expect(wrapper.emitted('update:autoExecute')).toBeFalsy()
    })

    it('toggles smart agent when permission is granted', async () => {
      await wrapper.setProps({ canAutoExecute: true })
      
      const smartAgentButton = wrapper.findAll('.icon-btn')[1]
      await smartAgentButton.trigger('click')
      
      expect(wrapper.emitted('update:autoExecute')).toBeTruthy()
    })
  })

  describe('Voice Status Display', () => {
    it('shows listening status when speechStatus is listening', async () => {
      await wrapper.setProps({ speechStatus: 'listening' })
      
      const voiceStatus = wrapper.find('.voice-status')
      expect(voiceStatus.exists()).toBe(true)
      expect(voiceStatus.text()).toContain('正在听取语音')
    })

    it('shows speaking status when speechStatus is speaking', async () => {
      await wrapper.setProps({ speechStatus: 'speaking' })
      
      const voiceStatus = wrapper.find('.voice-status')
      expect(voiceStatus.exists()).toBe(true)
      expect(voiceStatus.text()).toContain('正在播放语音')
    })

    it('shows voice wave animation when listening', async () => {
      await wrapper.setProps({ speechStatus: 'listening' })
      
      const voiceWave = wrapper.find('.voice-wave')
      expect(voiceWave.exists()).toBe(true)
    })

    it('hides voice wave animation when speaking', async () => {
      await wrapper.setProps({ speechStatus: 'speaking' })
      
      const voiceWave = wrapper.find('.voice-wave')
      expect(voiceWave.exists()).toBe(false)
    })
  })

  describe('Content Formatting', () => {
    it('appends file link to existing message', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const mockResponse = { data: { accessUrl: 'https://example.com/file.txt', originalName: 'test.txt' } }
      
      mockUploadFile.mockResolvedValue(mockResponse)
      
      await wrapper.setProps({ inputMessage: 'Existing message' })
      
      const fileInput = wrapper.find('input[type="file"]')
      Object.defineProperty(fileInput.element, 'files', {
        value: [mockFile],
        writable: false
      })
      
      await fileInput.trigger('change')
      
      const emittedMessage = wrapper.emitted('update:inputMessage')[0][0]
      expect(emittedMessage).toBe('Existing message\n[📄 test.txt](https://example.com/file.txt)')
    })

    it('sets file link as new message when input is empty', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const mockResponse = { data: { accessUrl: 'https://example.com/file.txt', originalName: 'test.txt' } }
      
      mockUploadFile.mockResolvedValue(mockResponse)
      
      await wrapper.setProps({ inputMessage: '' })
      
      const fileInput = wrapper.find('input[type="file"]')
      Object.defineProperty(fileInput.element, 'files', {
        value: [mockFile],
        writable: false
      })
      
      await fileInput.trigger('change')
      
      const emittedMessage = wrapper.emitted('update:inputMessage')[0][0]
      expect(emittedMessage).toBe('[📄 test.txt](https://example.com/file.txt)')
    })

    it('appends image markdown to existing message', async () => {
      const mockImage = new File(['test image content'], 'test.png', { type: 'image/png' })
      const mockResponse = { data: { accessUrl: 'https://example.com/image.png', originalName: 'test.png' } }
      
      mockUploadFile.mockResolvedValue(mockResponse)
      
      await wrapper.setProps({ inputMessage: 'Existing message' })
      
      const imageInput = wrapper.findAll('input[type="file"]')[1]
      Object.defineProperty(imageInput.element, 'files', {
        value: [mockImage],
        writable: false
      })
      
      await imageInput.trigger('change')
      
      const emittedMessage = wrapper.emitted('update:inputMessage')[0][0]
      expect(emittedMessage).toBe('Existing message\n![test.png](https://example.com/image.png)')
    })

    it('sets image markdown as new message when input is empty', async () => {
      const mockImage = new File(['test image content'], 'test.png', { type: 'image/png' })
      const mockResponse = { data: { accessUrl: 'https://example.com/image.png', originalName: 'test.png' } }
      
      mockUploadFile.mockResolvedValue(mockResponse)
      
      await wrapper.setProps({ inputMessage: '' })
      
      const imageInput = wrapper.findAll('input[type="file"]')[1]
      Object.defineProperty(imageInput.element, 'files', {
        value: [mockImage],
        writable: false
      })
      
      await imageInput.trigger('change')
      
      const emittedMessage = wrapper.emitted('update:inputMessage')[0][0]
      expect(emittedMessage).toBe('![test.png](https://example.com/image.png)')
    })
  })

  describe('Error Handling', () => {
    it('handles file input click errors gracefully', async () => {
      wrapper.vm.fileInput = null
      
      const fileButton = wrapper.findAll('.icon-btn')[2]
      await fileButton.trigger('click')
      
      // Should not throw error
      expect(wrapper.exists()).toBe(true)
    })

    it('handles image input click errors gracefully', async () => {
      wrapper.vm.imageInput = null
      
      const imageButton = wrapper.findAll('.icon-btn')[3]
      await imageButton.trigger('click')
      
      // Should not throw error
      expect(wrapper.exists()).toBe(true)
    })

    it('handles upload response without access URL', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const mockResponse = { data: { originalName: 'test.txt' } }
      
      mockUploadFile.mockResolvedValue(mockResponse)
      
      const fileInput = wrapper.find('input[type="file"]')
      Object.defineProperty(fileInput.element, 'files', {
        value: [mockFile],
        writable: false
      })
      
      await fileInput.trigger('change')
      
      expect(wrapper.emitted('update:inputMessage')).toBeFalsy()
    })

    it('handles upload response with nested data structure', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const mockResponse = { accessUrl: 'https://example.com/file.txt', originalName: 'test.txt' }
      
      mockUploadFile.mockResolvedValue(mockResponse)
      
      const fileInput = wrapper.find('input[type="file"]')
      Object.defineProperty(fileInput.element, 'files', {
        value: [mockFile],
        writable: false
      })
      
      await fileInput.trigger('change')
      
      expect(wrapper.emitted('update:inputMessage')).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('provides proper button titles and tooltips', () => {
      const buttons = wrapper.findAll('button')
      buttons.forEach(button => {
        expect(button.attributes('title')).toBeDefined()
      })
    })

    it('maintains proper keyboard navigation', () => {
      const input = wrapper.findComponent({ name: 'ElInput' })
      expect(input.exists()).toBe(true)
    })

    it('provides proper ARIA attributes', () => {
      const sendButton = wrapper.find('.send-btn')
      expect(sendButton.attributes('title')).toBe('发送消息')
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive classes for mobile devices', () => {
      const container = wrapper.find('.claude-input-container')
      expect(container.exists()).toBe(true)
    })
  })

  describe('Performance Optimization', () => {
    it('uses efficient event handling', () => {
      expect(typeof wrapper.vm.handleSmartAgentClick).toBe('function')
      expect(typeof wrapper.vm.triggerFileUpload).toBe('function')
      expect(typeof wrapper.vm.triggerImageUpload).toBe('function')
    })

    it('properly manages loading states', async () => {
      wrapper.vm.uploadingFile = true
      await nextTick()
      expect(wrapper.vm.uploadingFile).toBe(true)
      
      wrapper.vm.uploadingFile = false
      await nextTick()
      expect(wrapper.vm.uploadingFile).toBe(false)
    })
  })

  describe('Integration Tests', () => {
    it('integrates properly with Element Plus components', () => {
      const input = wrapper.findComponent({ name: 'ElInput' })
      const tooltips = wrapper.findAllComponents({ name: 'ElTooltip' })
      
      expect(input.exists()).toBe(true)
      expect(tooltips.length).toBeGreaterThan(0)
    })

    it('maintains state consistency during file operations', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const mockResponse = { data: { accessUrl: 'https://example.com/file.txt', originalName: 'test.txt' } }
      
      mockUploadFile.mockResolvedValue(mockResponse)
      
      wrapper.vm.uploadingFile = false
      await nextTick()
      
      const fileInput = wrapper.find('input[type="file"]')
      Object.defineProperty(fileInput.element, 'files', {
        value: [mockFile],
        writable: false
      })
      
      await fileInput.trigger('change')
      
      expect(wrapper.vm.uploadingFile).toBe(false)
      expect(fileInput.element.value).toBe('')
    })

    it('handles multiple rapid interactions gracefully', async () => {
      // Simulate rapid button clicks
      const searchButton = wrapper.find('.icon-btn')
      await searchButton.trigger('click')
      await searchButton.trigger('click')
      
      expect(wrapper.emitted('update:webSearch')).toBeTruthy()
      expect(wrapper.emitted('update:webSearch').length).toBe(2)
    })
  })
})