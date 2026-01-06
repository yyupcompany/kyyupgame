/**
 * AIAssistantPage 测试辅助工具
 * 提供测试中常用的mock数据、工具函数和测试配置
 */

import { vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing'

// ==================== Mock数据 ====================

export const mockUsers = {
  admin: {
    id: 1,
    username: 'admin',
    role: 'admin',
    permissions: ['ai:assistant', 'ai:memory', 'ai:activity-planning', 'ai:expert-consultation'],
    isAdmin: true
  },
  teacher: {
    id: 2,
    username: 'teacher',
    role: 'teacher',
    permissions: ['ai:assistant'],
    isAdmin: false
  },
  parent: {
    id: 3,
    username: 'parent',
    role: 'parent',
    permissions: [],
    isAdmin: false
  }
}

export const mockActivities = [
  {
    id: 'activity_1704123456789',
    name: '春季招生开放日',
    description: '展示幼儿园特色，吸引潜在家长和儿童',
    date: '2024-03-15T09:00:00.000Z',
    targetGroup: '3-6岁儿童及家长',
    location: '幼儿园多功能厅',
    budget: 5000,
    status: 'active' as const,
    aiPlan: {
      planId: 'plan_123',
      title: '春季招生开放日',
      description: '全面展示幼儿园教学环境和理念',
      detailedPlan: {
        overview: '本次开放日将为家长提供全方位的幼儿园体验',
        timeline: [
          {
            time: '09:00',
            activity: '签到入场',
            description: '家长和儿童在前台签到'
          },
          {
            time: '09:30',
            activity: '园所介绍',
            description: '园长介绍办学理念'
          }
        ],
        materials: ['签到表', '宣传册', '小礼品'],
        budget: {
          total: 5000,
          breakdown: [
            { item: '宣传材料', cost: 2000 },
            { item: '小礼品', cost: 1500 },
            { item: '茶水点心', cost: 1500 }
          ]
        },
        tips: ['提前准备充足的宣传材料', '安排专业的讲解员']
      },
      generatedImages: ['image1.jpg', 'image2.jpg'],
      audioGuide: 'audio-guide.mp3',
      modelsUsed: {
        textModel: 'gpt-4',
        imageModel: 'dalle-3',
        speechModel: 'whisper'
      },
      processingTime: 2500
    }
  },
  {
    id: 'activity_1704223456789',
    name: '亲子体验课程',
    description: '让家长和孩子共同参与教学活动',
    date: '2024-03-20T14:00:00.000Z',
    targetGroup: '3-4岁儿童及家长',
    location: '小班教室',
    budget: 2000,
    status: 'draft' as const
  }
]

export const mockMemories = [
  {
    id: 'mem_1704123456789',
    content: '用户询问了关于幼儿园春季招生的具体时间和要求，我详细介绍了报名流程、需要准备的材料以及面试环节的注意事项。',
    memoryType: 'long_term',
    importance: 9,
    createdAt: '2024-01-01T14:30:45.123Z',
    conversationId: 'conv_1704123456',
    metadata: {
      topic: '招生咨询',
      sentiment: 'positive',
      entities: ['春季招生', '报名流程', '面试']
    }
  },
  {
    id: 'mem_1704123556789',
    content: '讨论了幼儿园的教学理念，重点强调了蒙特梭利教育方法的优势，家长对此表现出浓厚兴趣。',
    memoryType: 'short_term',
    importance: 7,
    createdAt: '2024-01-01T15:15:20.456Z',
    conversationId: 'conv_1704123456',
    metadata: {
      topic: '教学理念',
      sentiment: 'positive',
      entities: ['蒙特梭利教育', '教学方法']
    }
  }
]

export const mockAIModels = [
  {
    id: 1,
    name: 'gpt-4-turbo',
    displayName: 'GPT-4 Turbo',
    provider: 'openai',
    isDefault: true
  },
  {
    id: 2,
    name: 'claude-3-opus',
    displayName: 'Claude 3 Opus',
    provider: 'anthropic',
    isDefault: false
  }
]

export const mockExpertConsultation = {
  consultationId: 'consultation_1704125000123',
  sessionToken: 'session_abcd1234efgh5678',
  expertProfile: {
    name: 'Dr. 李教育专家',
    specialization: '幼儿教育与发展心理学',
    experience: '15年幼儿园管理经验',
    credentials: ['教育学博士', '国际蒙特梭利认证教师']
  },
  initialMessage: '您好！我是李教育专家，很高兴为您提供专业咨询服务。',
  suggestedTopics: ['招生策略优化', '教学质量提升', '家园共育方案'],
  consultationLimits: {
    maxQuestions: 10,
    maxDuration: 60,
    remainingQuestions: 10
  }
}

// ==================== 测试工具函数 ====================

/**
 * 创建测试用的Pinia实例
 */
export function createTestPinia(user = mockUsers.admin) {
  return createTestingPinia({
    createSpy: vi.fn,
    initialState: {
      user: {
        userInfo: user,
        isAuthenticated: true,
        permissions: user.permissions
      }
    }
  })
}

/**
 * 创建mock的API响应
 */
export function createMockApiResponse<T>(data: T, success = true) {
  return {
    success,
    data,
    message: success ? 'Success' : 'Error'
  }
}

/**
 * 模拟API延迟
 */
export function mockApiDelay(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 创建mock的表单验证器
 */
export function createMockFormValidator(shouldPass = true) {
  return {
    validate: vi.fn().mockImplementation(() => 
      shouldPass ? Promise.resolve(true) : Promise.reject(new Error('Validation failed'))
    )
  }
}

/**
 * 创建完整的活动策划响应mock
 */
export function createActivityPlanResponse() {
  return {
    planId: 'plan_spring_openday_2024_001',
    title: '2024春季招生开放日暨亲子体验活动',
    description: '为期半天的综合性招生开放日活动，融合园所展示、亲子互动、教学体验于一体。',
    detailedPlan: {
      overview: '本次春季招生开放日活动将为家长和儿童提供沉浸式的幼儿园体验。',
      targetParticipants: '50-80个家庭（3-6岁儿童及家长）',
      expectedOutcome: '预期转化率35-45%，收集意向家庭信息80%以上',
      timeline: [
        {
          time: '08:30-09:00',
          activity: '签到接待与资料发放',
          description: '温馨迎接，发放园所介绍册、活动流程单、小礼品袋。',
          responsible: '行政团队',
          location: '园所大厅',
          materials: ['签到表', '名牌', '资料袋', '小礼品'],
          notes: '准备迎宾音乐，确保第一印象'
        },
        {
          time: '09:00-09:30',
          activity: '园长致辞与园所介绍',
          description: '园长热情致辞，通过PPT和视频展示园所特色。',
          responsible: '园长',
          location: '多功能厅',
          materials: ['投影设备', '宣传视频', 'PPT'],
          notes: '控制时间，重点突出特色'
        }
      ],
      materials: ['签到表、名牌、文件夹', '园所宣传册、招生简章', '投影仪、音响设备'],
      budget: {
        total: 8500,
        breakdown: [
          { item: '宣传材料制作', cost: 1500, description: '宣传册、招生简章设计印刷' },
          { item: '活动物料采购', cost: 2000, description: '美术用品、手工材料' },
          { item: '茶歇食品费用', cost: 1200, description: '点心、饮品、水果' },
          { item: '礼品纪念品', cost: 2500, description: '入园小礼品、纪念品' },
          { item: '设备租赁费用', cost: 800, description: '音响设备、拍照道具' },
          { item: '人员服务费', cost: 500, description: '临时工作人员费用' }
        ],
        costOptimization: ['与供应商协商批量采购折扣', '利用现有教具减少材料采购']
      },
      staffing: {
        required: [
          { role: '活动总协调', count: 1, responsibility: '整体流程把控' },
          { role: '接待人员', count: 3, responsibility: '签到、引导、答疑' },
          { role: '教学展示', count: 6, responsibility: '各班级参观讲解' }
        ],
        preparation: '提前一周进行人员培训和分工确认'
      },
      tips: [
        '提前2周开始宣传推广，利用多渠道扩大影响',
        '准备雨天备选方案，确保活动顺利进行',
        '设置专门的拍照区域，鼓励家长分享朋友圈'
      ],
      riskManagement: [
        '天气风险：准备室内备选方案',
        '人数超预期：准备弹性分组方案',
        '设备故障：提前测试并准备备用设备'
      ],
      successMetrics: [
        '参与家庭数量：目标60-80个家庭',
        '意向登记率：目标80%以上',
        '后续咨询转化：目标40%以上'
      ]
    },
    generatedImages: [
      'https://ai-generated-images.example.com/openday-entrance-scene.jpg',
      'https://ai-generated-images.example.com/parent-child-activity.jpg'
    ],
    audioGuide: 'https://ai-generated-audio.example.com/activity-guide-123.mp3',
    modelsUsed: {
      textModel: 'gpt-4-turbo-preview',
      imageModel: 'dall-e-3',
      speechModel: 'tts-1-hd'
    },
    processingTime: 3245,
    confidence: 0.94,
    generationMetadata: {
      tokenUsage: {
        promptTokens: 1250,
        completionTokens: 2890,
        totalTokens: 4140
      },
      model_version: '2024-01-25',
      temperature: 0.7,
      topP: 0.9
    }
  }
}

// ==================== 测试断言辅助函数 ====================

/**
 * 验证活动对象的基本结构
 */
export function expectValidActivity(activity: any) {
  expect(activity).toHaveProperty('id')
  expect(activity).toHaveProperty('name')
  expect(activity).toHaveProperty('description')
  expect(activity).toHaveProperty('date')
  expect(activity).toHaveProperty('targetGroup')
  expect(activity).toHaveProperty('location')
  expect(activity).toHaveProperty('budget')
  expect(activity).toHaveProperty('status')
  expect(activity.id).toMatch(/^activity_\d+$/)
  expect(['draft', 'planning', 'active', 'completed', 'cancelled']).toContain(activity.status)
}

/**
 * 验证记忆对象的基本结构
 */
export function expectValidMemory(memory: any) {
  expect(memory).toHaveProperty('id')
  expect(memory).toHaveProperty('content')
  expect(memory).toHaveProperty('memoryType')
  expect(memory).toHaveProperty('importance')
  expect(memory).toHaveProperty('createdAt')
  expect(memory.content).toBeTruthy()
  expect(['short_term', 'long_term']).toContain(memory.memoryType)
  expect(memory.importance).toBeGreaterThanOrEqual(1)
  expect(memory.importance).toBeLessThanOrEqual(10)
}

/**
 * 验证AI策划方案的完整性
 */
export function expectValidActivityPlan(plan: any) {
  expect(plan).toHaveProperty('planId')
  expect(plan).toHaveProperty('title')
  expect(plan).toHaveProperty('description')
  expect(plan).toHaveProperty('detailedPlan')
  expect(plan).toHaveProperty('modelsUsed')
  expect(plan).toHaveProperty('processingTime')
  
  // 验证详细计划结构
  const detailedPlan = plan.detailedPlan
  expect(detailedPlan).toHaveProperty('overview')
  expect(detailedPlan).toHaveProperty('timeline')
  expect(detailedPlan).toHaveProperty('materials')
  expect(detailedPlan).toHaveProperty('budget')
  expect(detailedPlan).toHaveProperty('tips')
  
  // 验证预算结构
  expect(detailedPlan.budget).toHaveProperty('total')
  expect(detailedPlan.budget).toHaveProperty('breakdown')
  expect(Array.isArray(detailedPlan.budget.breakdown)).toBe(true)
  
  // 验证时间线结构
  expect(Array.isArray(detailedPlan.timeline)).toBe(true)
  if (detailedPlan.timeline.length > 0) {
    const timelineItem = detailedPlan.timeline[0]
    expect(timelineItem).toHaveProperty('time')
    expect(timelineItem).toHaveProperty('activity')
    expect(timelineItem).toHaveProperty('description')
  }
}

/**
 * 验证API响应的标准格式
 */
export function expectValidApiResponse(response: any, expectSuccess = true) {
  expect(response).toHaveProperty('success')
  expect(response.success).toBe(expectSuccess)
  
  if (expectSuccess) {
    expect(response).toHaveProperty('data')
  } else {
    expect(response).toHaveProperty('message')
  }
}

// ==================== DOM测试辅助函数 ====================

/**
 * 等待异步组件加载完成
 */
export async function waitForAsyncComponent(wrapper: any, selector: string, timeout = 3000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if (wrapper.find(selector).exists()) {
      return wrapper.find(selector)
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error(`Component ${selector} not found within ${timeout}ms`)
}

/**
 * 模拟用户输入
 */
export async function simulateUserInput(wrapper: any, selector: string, value: string) {
  const input = wrapper.find(selector)
  await input.setValue(value)
  await input.trigger('input')
  await wrapper.vm.$nextTick()
}

/**
 * 模拟用户点击
 */
export async function simulateUserClick(wrapper: any, selector: string) {
  const element = wrapper.find(selector)
  await element.trigger('click')
  await wrapper.vm.$nextTick()
}

/**
 * 模拟表单提交
 */
export async function simulateFormSubmit(wrapper: any, formSelector: string) {
  const form = wrapper.find(formSelector)
  await form.trigger('submit')
  await wrapper.vm.$nextTick()
}

// ==================== 性能测试辅助函数 ====================

/**
 * 测量函数执行时间
 */
export async function measureExecutionTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start
  return { result, duration }
}

/**
 * 创建大量测试数据
 */
export function createLargeDataSet<T>(factory: (index: number) => T, count: number): T[] {
  return Array.from({ length: count }, (_, index) => factory(index))
}

/**
 * 模拟网络延迟
 */
export function mockNetworkDelay(min = 100, max = 500) {
  const delay = Math.random() * (max - min) + min
  return new Promise(resolve => setTimeout(resolve, delay))
}

// ==================== 错误处理测试辅助函数 ====================

/**
 * 创建模拟的网络错误
 */
export function createNetworkError(message = 'Network Error') {
  const error = new Error(message)
  ;(error as any).code = 'NETWORK_ERROR'
  return error
}

/**
 * 创建模拟的API错误
 */
export function createApiError(status = 500, message = 'Internal Server Error') {
  const error = new Error(message)
  ;(error as any).response = {
    status,
    data: { message }
  }
  return error
}

/**
 * 创建模拟的验证错误
 */
export function createValidationError(field: string, message: string) {
  const error = new Error('Validation Error')
  ;(error as any).field = field
  ;(error as any).validationMessage = message
  return error
}

// ==================== 可访问性测试辅助函数 ====================

/**
 * 检查元素是否有适当的ARIA属性
 */
export function expectProperAriaAttributes(element: any) {
  const html = element.html()
  
  // 检查常见的ARIA属性
  const ariaAttributes = ['aria-label', 'aria-labelledby', 'aria-describedby', 'role']
  const hasAriaAttribute = ariaAttributes.some(attr => html.includes(attr))
  
  if (!hasAriaAttribute) {
    console.warn('Element may need ARIA attributes for better accessibility')
  }
}

/**
 * 检查颜色对比度（简化版）
 */
export function checkColorContrast(element: any) {
  // 这是一个简化的检查，实际的颜色对比度测试需要更复杂的工具
  const style = window.getComputedStyle ? window.getComputedStyle(element) : null
  if (style) {
    const color = style.color
    const backgroundColor = style.backgroundColor
    
    // 简单检查是否设置了颜色
    expect(color).toBeDefined()
    expect(backgroundColor).toBeDefined()
  }
}

export default {
  mockUsers,
  mockActivities,
  mockMemories,
  mockAIModels,
  mockExpertConsultation,
  createTestPinia,
  createMockApiResponse,
  mockApiDelay,
  createMockFormValidator,
  createActivityPlanResponse,
  expectValidActivity,
  expectValidMemory,
  expectValidActivityPlan,
  expectValidApiResponse,
  waitForAsyncComponent,
  simulateUserInput,
  simulateUserClick,
  simulateFormSubmit,
  measureExecutionTime,
  createLargeDataSet,
  mockNetworkDelay,
  createNetworkError,
  createApiError,
  createValidationError,
  expectProperAriaAttributes,
  checkColorContrast
}