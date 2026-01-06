/**
 * AI助手功能完整集成测试
 * 测试从页面访问、专家咨询、活动策划到后端API的完整业务流程
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
// import { createTestingPinia } from '@pinia/testing'
import { ElMessage } from 'element-plus'
import AIAssistantPage from '../src/pages/ai/AIAssistantPage.vue'
import ExpertConsultationPage from '../src/pages/ai/ExpertConsultationPage.vue'
import AIAssistant from '../src/components/ai-assistant/AIAssistant.vue'
import { aiApi } from '../src/api/ai'
import { activityPlannerApi } from '../src/api/activity-planner'
import { expertConsultationApi } from '../src/api/expert-consultation'

// Mock APIs
vi.mock('../src/api/ai')
vi.mock('../src/api/activity-planner')
vi.mock('../src/api/expert-consultation')
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn()
    }
  }
})

// 测试数据
const mockModels = [
  {
    id: 31,
    modelName: 'Doubao-1.5-pro-32k',
    displayName: '豆包对话模型 1.5 Pro',
    provider: 'Doubao',
    isActive: true,
    isDefault: true
  }
]

const mockConversation = {
  id: 'conv_123',
  title: '测试会话',
  modelId: 31
}

const mockMessages = [
  {
    id: 'msg_1',
    role: 'assistant',
    content: '您好！我是AI助手，有什么可以帮您的吗？',
    createdAt: new Date().toISOString()
  }
]

const mockActivityPlan = {
  planId: 'plan_123',
  title: '春季招生开放日',
  description: '面向3-6岁儿童家长的开放日活动',
  detailedPlan: {
    overview: '通过开放日活动展示教学环境和理念',
    timeline: [
      {
        time: '09:00',
        activity: '签到入场',
        description: '家长和孩子签到，领取活动手册'
      }
    ],
    materials: ['活动手册', '签到表'],
    budget: {
      total: 5000,
      breakdown: [
        { item: '物料制作', cost: 2000 },
        { item: '场地布置', cost: 3000 }
      ]
    },
    tips: ['提前准备签到台', '安排专人引导']
  },
  modelsUsed: {
    textModel: 'Doubao-1.5-pro-32k'
  },
  processingTime: 2500
}

const mockExpertSession = {
  sessionId: 'session_123',
  query: '我要做一场秋季的招生活动',
  status: 'in_progress'
}

const mockExpertSpeech = {
  expertName: '招生策划专家',
  expertType: 'planner',
  content: '针对秋季招生活动，我建议从以下几个方面考虑...',
  keyPoints: ['确定目标群体', '设计活动主题'],
  recommendations: ['选择合适的时间', '准备宣传材料'],
  timestamp: new Date().toISOString(),
  processingTime: 1500
}

// 控制台错误检测变量
let consoleSpy: any

describe('AI助手功能集成测试', () => {
  let wrapper: VueWrapper<any>
  // const pinia = createTestingPinia({
  //   createSpy: vi.fn
  // })

  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks()
    
    // Mock API 响应
    vi.mocked(aiApi.getModels).mockResolvedValue(mockModels)
    vi.mocked(aiApi.createConversation).mockResolvedValue(mockConversation)
    vi.mocked(aiApi.getConversations).mockResolvedValue([mockConversation])
    vi.mocked(aiApi.getConversationMessages).mockResolvedValue(mockMessages)
    vi.mocked(aiApi.sendMessage).mockResolvedValue({
      id: 'msg_2',
      role: 'assistant',
      content: '我理解您的需求，让我为您分析一下。',
      createdAt: new Date().toISOString()
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

  describe('1. 硬编码模型问题检查', () => {
    it('应该从API动态获取模型列表而非硬编码', async () => {
      wrapper = mount(AIAssistant, {
        global: {
          plugins: [pinia]
        }
      })

      await wrapper.vm.$nextTick()
      
      // 验证调用了模型API
      expect(aiApi.getModels).toHaveBeenCalled()
      
      // 验证没有硬编码模型
      const componentCode = wrapper.html()
      expect(componentCode).not.toContain('gpt-3.5')
      expect(componentCode).not.toContain('claude-3')
      expect(componentCode).not.toContain('text-davinci')
    })

    it('应该正确使用配置的默认模型', async () => {
      wrapper = mount(AIAssistant, {
        global: {
          plugins: [pinia]
        }
      })

      await wrapper.vm.$nextTick()
      
      // 验证使用了从API获取的默认模型
      expect(wrapper.vm.currentModelId).toBe(31)
    })
  })

  describe('2. AI助手页面组件结构测试', () => {
    it('应该正确渲染AI助手主页面', async () => {
      wrapper = mount(AIAssistantPage, {
        global: {
          plugins: [pinia],
          stubs: {
            'el-tabs': true,
            'el-tab-pane': true,
            'el-button': true,
            'AIAssistant': true,
            'ExpertConsultationPage': true
          }
        }
      })

      // 验证页面标题
      expect(wrapper.find('.page-title').text()).toBe('AI智能助手')
      
      // 验证包含所有标签页
      expect(wrapper.html()).toContain('AI对话')
      expect(wrapper.html()).toContain('记忆管理')
      expect(wrapper.html()).toContain('专家咨询')
      expect(wrapper.html()).toContain('活动策划')
    })

    it('应该正确显示AI对话组件', async () => {
      wrapper = mount(AIAssistantPage, {
        global: {
          plugins: [pinia],
          stubs: {
            'AIAssistant': {
              template: '<div class="ai-assistant-stub">AI助手组件</div>'
            }
          }
        }
      })

      expect(wrapper.find('.ai-assistant-stub').exists()).toBe(true)
    })

    it('应该正确管理会话状态', async () => {
      wrapper = mount(AIAssistant, {
        global: {
          plugins: [pinia]
        }
      })

      await wrapper.vm.$nextTick()
      
      // 验证初始化后有会话
      expect(wrapper.vm.conversations).toHaveLength(1)
      expect(wrapper.vm.currentConversationId).toBe('conv_123')
    })
  })

  describe('3. 专家咨询功能测试', () => {
    beforeEach(() => {
      vi.mocked(expertConsultationApi.startConsultation).mockResolvedValue(mockExpertSession)
      vi.mocked(expertConsultationApi.getNextExpertSpeech).mockResolvedValue(mockExpertSpeech)
      vi.mocked(expertConsultationApi.getConsultationSummary).mockResolvedValue({
        overallAnalysis: '综合分析结果',
        keyInsights: ['关键洞察1', '关键洞察2'],
        finalRecommendations: ['最终建议1', '最终建议2']
      })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('应该正确启动专家咨询', async () => {
      wrapper = mount(ExpertConsultationPage, {
        global: {
          plugins: [pinia],
          stubs: {
            'el-input': true,
            'el-button': true,
            'el-progress': true
          }
        }
      })

      // 设置查询文本
      await wrapper.setData({ queryText: '我要做一场秋季的招生活动' })
      
      // 点击开始咨询
      await wrapper.vm.startConsultation()
      
      // 验证API调用
      expect(expertConsultationApi.startConsultation).toHaveBeenCalledWith({
        query: '我要做一场秋季的招生活动'
      })
      
      // 验证状态更新
      expect(wrapper.vm.currentSession).toEqual(mockExpertSession)
    })

    it('应该正确显示专家团队', async () => {
      wrapper = mount(ExpertConsultationPage, {
        global: {
          plugins: [pinia],
          stubs: {
            'el-icon': true
          }
        }
      })

      // 验证专家团队显示
      const expertCards = wrapper.findAll('.expert-card')
      expect(expertCards).toHaveLength(6) // 6位专家
      
      // 验证第一位专家信息
      expect(wrapper.text()).toContain('招生策划专家')
      expect(wrapper.text()).toContain('资深策划师')
    })

    it('应该正确处理专家发言流程', async () => {
      wrapper = mount(ExpertConsultationPage, {
        global: {
          plugins: [pinia]
        }
      })

      // 设置会话状态
      await wrapper.setData({ currentSession: mockExpertSession })
      
      // 开始获取专家发言
      await wrapper.vm.getNextExpertSpeeches()
      
      // 验证获取了专家发言
      expect(expertConsultationApi.getNextExpertSpeech).toHaveBeenCalled()
      expect(wrapper.vm.speeches).toHaveLength(1)
    })
  })

  describe('4. 活动策划功能测试', () => {
    beforeEach(() => {
      vi.mocked(activityPlannerApi.generateActivityPlan).mockResolvedValue(mockActivityPlan)
      vi.mocked(activityPlannerApi.getAvailableModels).mockResolvedValue({
        textModels: mockModels,
        imageModels: [],
        speechModels: []
      })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('应该正确生成活动策划方案', async () => {
      wrapper = mount(AIAssistantPage, {
        global: {
          plugins: [pinia],
          stubs: {
            'el-form': true,
            'el-form-item': true,
            'el-select': true,
            'el-option': true,
            'el-input': true,
            'el-button': true
          }
        }
      })

      // 切换到活动策划标签
      await wrapper.setData({ activeTab: 'activity' })
      
      // 填写策划表单
      await wrapper.setData({
        planningForm: {
          activityType: '幼儿园开放日',
          targetAudience: '3-6岁儿童家长',
          budget: 5000,
          duration: '2小时',
          location: '幼儿园主校区',
          requirements: ['需要摄影摄像'],
          preferredStyle: 'professional'
        }
      })

      // 生成方案
      await wrapper.vm.generatePlan()
      
      // 验证API调用
      expect(activityPlannerApi.generateActivityPlan).toHaveBeenCalledWith({
        activityType: '幼儿园开放日',
        targetAudience: '3-6岁儿童家长',
        budget: 5000,
        duration: '2小时',
        location: '幼儿园主校区',
        requirements: ['需要摄影摄像'],
        preferredStyle: 'professional'
      })
      
      // 验证方案生成成功
      expect(wrapper.vm.activities[0].name).toBe('春季招生开放日')
    })

    it('应该正确显示生成的活动详情', async () => {
      wrapper = mount(AIAssistantPage, {
        global: {
          plugins: [pinia],
          stubs: {
            'el-tag': true,
            'el-timeline': true,
            'el-timeline-item': true,
            'el-table': true,
            'el-table-column': true
          }
        }
      })

      // 设置已生成的活动
      await wrapper.setData({
        selectedActivity: {
          id: '1',
          name: '春季招生开放日',
          aiPlan: mockActivityPlan
        }
      })

      // 验证活动详情显示
      expect(wrapper.text()).toContain('春季招生开放日')
      expect(wrapper.text()).toContain('面向3-6岁儿童家长的开放日活动')
      expect(wrapper.text()).toContain('总计：5000元')
    })
  })

  describe('5. 后端API集成测试', () => {
    it('应该正确处理AI模型API响应', async () => {
      wrapper = mount(AIAssistant, {
        global: {
          plugins: [pinia]
        }
      })

      await wrapper.vm.$nextTick()
      
      // 验证API调用和响应处理
      expect(aiApi.getModels).toHaveBeenCalled()
      expect(wrapper.vm.availableModels).toEqual(mockModels)
    })

    it('应该正确处理会话创建和消息发送', async () => {
      wrapper = mount(AIAssistant, {
        global: {
          plugins: [pinia]
        }
      })

      await wrapper.vm.$nextTick()
      
      // 发送消息
      await wrapper.setData({ userInput: '你好' })
      await wrapper.vm.handleSendMessage()
      
      // 验证API调用
      expect(aiApi.sendMessage).toHaveBeenCalledWith('conv_123', {
        content: '你好',
        metadata: { modelId: 31 }
      })
    })

    it('应该正确处理API错误情况', async () => {
      // Mock API 错误
      vi.mocked(aiApi.sendMessage).mockRejectedValue(new Error('网络错误'))
      
      wrapper = mount(AIAssistant, {
        global: {
          plugins: [pinia]
        }
      })

      await wrapper.vm.$nextTick()
      
      // 发送消息触发错误
      await wrapper.setData({ userInput: '测试错误' })
      await wrapper.vm.handleSendMessage()
      
      // 验证错误处理
      expect(ElMessage.warning).toHaveBeenCalledWith({
        message: 'AI服务暂时不可用，使用本地响应',
        type: 'warning',
        duration: 3000
      })
    })
  })

  describe('6. 端到端业务流程测试', () => {
    it('应该完成完整的AI对话流程', async () => {
      wrapper = mount(AIAssistantPage, {
        global: {
          plugins: [pinia],
          stubs: {
            'AIAssistant': AIAssistant
          }
        }
      })

      await wrapper.vm.$nextTick()
      
      // 1. 页面加载完成
      expect(wrapper.find('.page-title').text()).toBe('AI智能助手')
      
      // 2. AI助手初始化完成
      const aiAssistant = wrapper.findComponent(AIAssistant)
      expect(aiAssistant.vm.availableModels).toEqual(mockModels)
      
      // 3. 发送消息
      await aiAssistant.setData({ userInput: '你好，我需要帮助' })
      await aiAssistant.vm.handleSendMessage()
      
      // 4. 验证消息发送和响应
      expect(aiApi.sendMessage).toHaveBeenCalled()
      expect(aiAssistant.vm.messages).toHaveLength(3) // 欢迎消息 + 用户消息 + AI响应
    })

    it('应该完成完整的专家咨询流程', async () => {
      wrapper = mount(AIAssistantPage, {
        global: {
          plugins: [pinia],
          stubs: {
            'ExpertConsultationPage': ExpertConsultationPage
          }
        }
      })

      // 1. 切换到专家咨询标签
      await wrapper.setData({ activeTab: 'expert-consultation' })
      
      // 2. 获取专家咨询组件
      const consultationPage = wrapper.findComponent(ExpertConsultationPage)
      
      // 3. 输入问题并启动咨询
      await consultationPage.setData({ queryText: '我要做一场秋季的招生活动' })
      await consultationPage.vm.startConsultation()
      
      // 4. 验证咨询流程
      expect(expertConsultationApi.startConsultation).toHaveBeenCalled()
      expect(consultationPage.vm.currentSession).toEqual(mockExpertSession)
    })

    it('应该完成完整的活动策划流程', async () => {
      wrapper = mount(AIAssistantPage, {
        global: {
          plugins: [pinia]
        }
      })

      // 1. 切换到活动策划标签
      await wrapper.setData({ activeTab: 'activity' })
      
      // 2. 创建新活动
      await wrapper.vm.createNewActivity()
      expect(wrapper.vm.isCreatingActivity).toBe(true)
      
      // 3. 填写表单
      await wrapper.setData({
        planningForm: {
          activityType: '幼儿园开放日',
          targetAudience: '3-6岁儿童家长',
          budget: 5000
        }
      })
      
      // 4. 生成方案
      await wrapper.vm.generatePlan()
      
      // 5. 验证方案生成
      expect(activityPlannerApi.generateActivityPlan).toHaveBeenCalled()
      expect(wrapper.vm.activities).toHaveLength(3) // 2个初始活动 + 1个新生成
    })
  })

  describe('7. 错误处理和边界情况', () => {
    it('应该正确处理网络连接失败', async () => {
      vi.mocked(aiApi.getModels).mockRejectedValue(new Error('网络连接失败'))
      
      wrapper = mount(AIAssistant, {
        global: {
          plugins: [pinia]
        }
      })

      await wrapper.vm.$nextTick()
      
      // 验证错误处理
      expect(wrapper.vm.messages[0].content).toContain('您好！我是AI助手')
      expect(ElMessage.warning).toHaveBeenCalled()
    })

    it('应该正确处理空输入', async () => {
      wrapper = mount(AIAssistant, {
        global: {
          plugins: [pinia]
        }
      })

      await wrapper.vm.$nextTick()
      
      // 尝试发送空消息
      await wrapper.setData({ userInput: '   ' })
      await wrapper.vm.handleSendMessage()
      
      // 验证不发送空消息
      expect(aiApi.sendMessage).not.toHaveBeenCalledWith(expect.anything(), {
        content: '   ',
        metadata: expect.anything()
      })
    })

    it('应该正确处理活动策划表单验证', async () => {
      wrapper = mount(AIAssistantPage, {
        global: {
          plugins: [pinia]
        }
      })

      await wrapper.setData({ 
        activeTab: 'activity',
        isCreatingActivity: true,
        planningForm: {
          activityType: '', // 空值
          targetAudience: ''
        }
      })

      // 尝试生成方案（表单验证失败）
      const result = await wrapper.vm.generatePlan().catch(e => e)
      
      // 验证表单验证
      expect(activityPlannerApi.generateActivityPlan).not.toHaveBeenCalled()
    })
  })

  describe('8. 性能和用户体验测试', () => {
    it('应该正确显示加载状态', async () => {
      wrapper = mount(AIAssistant, {
        global: {
          plugins: [pinia]
        }
      })

      // 设置加载状态
      await wrapper.setData({ isLoading: true })
      
      // 验证加载指示器
      expect(wrapper.find('.typing-indicator').exists()).toBe(true)
    })

    it('应该正确管理组件状态切换', async () => {
      wrapper = mount(AIAssistantPage, {
        global: {
          plugins: [pinia]
        }
      })

      // 测试标签切换
      await wrapper.setData({ activeTab: 'memory' })
      expect(wrapper.vm.activeTab).toBe('memory')
      
      await wrapper.setData({ activeTab: 'expert-consultation' })
      expect(wrapper.vm.activeTab).toBe('expert-consultation')
    })

    it('应该正确处理长文本消息', async () => {
      const longMessage = 'A'.repeat(1000)
      
      wrapper = mount(AIAssistant, {
        global: {
          plugins: [pinia]
        }
      })

      await wrapper.vm.$nextTick()
      
      // 添加长消息
      wrapper.vm.messages.push({
        role: 'assistant',
        content: longMessage,
        timestamp: Date.now(),
        collapsed: false
      })

      await wrapper.vm.$nextTick()
      
      // 验证长消息处理
      expect(wrapper.vm.shouldCollapse(longMessage)).toBe(true)
    })
  })
})