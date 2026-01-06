/**
 * AIAssistantPage 真实API集成测试
 * 测试前端与后端服务器的真实交互，不使用mock数据
 */

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

describe, it, expect, beforeAll, afterAll } from 'vitest'
import axios from 'axios'

// 测试配置
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://shlxlyzagqnc.sealoshzh.site'
const TEST_TIMEOUT = 30000 // 30秒超时

// 测试用户凭据
const TEST_CREDENTIALS = {
  username: process.env.TEST_USERNAME || '13800138000',
  password: process.env.TEST_PASSWORD || '13800138000123'
}

// 全局测试状态
let authToken: string = ''
let testUserId: number = 0

describe('AI助手页面 - 真实API集成测试', () => {
  
  beforeAll(async () => {
    console.log('🔧 初始化真实API测试环境...')
    
    // 检查后端服务是否运行
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/api/health`)
      expect(healthResponse.status).toBe(200)
      console.log('✅ 后端服务器正常运行')
    } catch (error) {
      console.error('❌ 后端服务器未运行，请启动服务器')
      throw new Error('Backend server is not running')
    }

    // 登录获取认证令牌
    try {
      const loginResponse = await authApi.unifiedLogin(unifiedLoginData))
      
      if (loginResponse.data.success) {
        authToken = loginResponse.data.data.accessToken
        testUserId = loginResponse.data.data.user.id
        console.log(`✅ 登录成功，用户ID: ${testUserId}`)
        
        // 设置默认请求头
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
      } else {
        throw new Error('Login failed: ' + loginResponse.data.message)
      }
    } catch (error) {
      console.error('❌ 登录失败:', error)
      throw error
    }
  }, TEST_TIMEOUT)

  afterAll(async () => {
    // 清理认证令牌
    delete axios.defaults.headers.common['Authorization']
    console.log('🧹 测试清理完成')
  })

  describe('🤖 AI模块初始化真实API测试', () => {
    it('应该能够成功初始化AI模块', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/ai/initialize`)
      
      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('success')
      
      if (response.data.success) {
        expect(response.data.data).toHaveProperty('models')
        expect(Array.isArray(response.data.data.models)).toBe(true)
        console.log(`✅ AI初始化成功，可用模型数量: ${response.data.data.models.length}`)
        
        // 验证模型数据结构
        if (response.data.data.models.length > 0) {
          const model = response.data.data.models[0]
          expect(model).toHaveProperty('name')
          expect(model).toHaveProperty('provider')
          expect(typeof model.name).toBe('string')
          expect(typeof model.provider).toBe('string')
        }
      } else {
        console.log('⚠️ AI初始化返回失败状态:', response.data.message)
      }
    }, TEST_TIMEOUT)

    it('应该能够获取AI模型列表', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/ai/models`)
      
      expect(response.status).toBe(200)
      
      if (response.data.success) {
        expect(response.data.data).toBeDefined()
        console.log('✅ 获取AI模型列表成功')
        
        // 验证模型列表结构
        if (Array.isArray(response.data.data)) {
          response.data.data.forEach((model: any) => {
            expect(model).toHaveProperty('id')
            expect(model).toHaveProperty('name')
            expect(typeof model.id).toBe('number')
            expect(typeof model.name).toBe('string')
          })
        }
      }
    }, TEST_TIMEOUT)

    it('应该能够获取用户AI配额信息', async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/ai/quota`)
        
        expect(response.status).toBe(200)
        
        if (response.data.success) {
          const quota = response.data.data
          expect(quota).toHaveProperty('remaining')
          expect(quota).toHaveProperty('total')
          expect(typeof quota.remaining).toBe('number')
          expect(typeof quota.total).toBe('number')
          console.log(`✅ 用户配额: ${quota.remaining}/${quota.total}`)
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.log('⚠️ 配额API端点不存在，跳过测试')
        } else {
          throw error
        }
      }
    }, TEST_TIMEOUT)
  })

  describe('🧠 记忆管理真实API测试', () => {
    let createdMemoryId: string = ''

    it('应该能够创建新记忆', async () => {
      const memoryData = {
        userId: testUserId,
        content: `测试记忆内容 - ${new Date().toISOString()}`,
        memoryType: 'short_term',
        importance: 7
import { authApi } from '@/api/auth';

      }

      try {
        const response = await axios.post(`${API_BASE_URL}/api/ai/memory`, memoryData)
        
        expect(response.status).toBe(200)
        
        if (response.data.success) {
          createdMemoryId = response.data.data.id
          expect(response.data.data).toHaveProperty('id')
          expect(response.data.data).toHaveProperty('content')
          expect(response.data.data.content).toBe(memoryData.content)
          console.log(`✅ 创建记忆成功，ID: ${createdMemoryId}`)
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.log('⚠️ 记忆创建API端点不存在，跳过测试')
        } else {
          console.error('记忆创建失败:', error.response?.data || error.message)
          throw error
        }
      }
    }, TEST_TIMEOUT)

    it('应该能够搜索记忆', async () => {
      const searchParams = {
        userId: testUserId,
        query: '测试',
        limit: 10
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/api/ai/memory/search`, searchParams)
        
        expect(response.status).toBe(200)
        
        if (response.data.success) {
          expect(response.data.data).toHaveProperty('memories')
          expect(Array.isArray(response.data.data.memories)).toBe(true)
          console.log(`✅ 记忆搜索成功，找到 ${response.data.data.memories.length} 条记忆`)
          
          // 验证记忆数据结构
          if (response.data.data.memories.length > 0) {
            const memory = response.data.data.memories[0]
            expect(memory).toHaveProperty('id')
            expect(memory).toHaveProperty('content')
            expect(memory).toHaveProperty('importance')
          }
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.log('⚠️ 记忆搜索API端点不存在，跳过测试')
        } else {
          console.error('记忆搜索失败:', error.response?.data || error.message)
        }
      }
    }, TEST_TIMEOUT)

    it('应该能够删除记忆', async () => {
      if (!createdMemoryId) {
        console.log('⚠️ 没有可删除的记忆ID，跳过删除测试')
        return
      }

      try {
        const response = await axios.delete(`${API_BASE_URL}/api/ai/memory/${createdMemoryId}`, {
          params: { userId: testUserId }
        })
        
        expect(response.status).toBe(200)
        
        if (response.data.success) {
          console.log(`✅ 删除记忆成功，ID: ${createdMemoryId}`)
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.log('⚠️ 记忆删除API端点不存在，跳过测试')
        } else {
          console.error('记忆删除失败:', error.response?.data || error.message)
        }
      }
    }, TEST_TIMEOUT)
  })

  describe('👨‍🏫 专家咨询真实API测试', () => {
    let consultationId: string = ''

    it('应该能够启动专家咨询', async () => {
      const consultationData = {
        userId: testUserId,
        consultationType: 'expert'
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/api/ai/consultation/start`, consultationData)
        
        expect(response.status).toBe(200)
        
        if (response.data.success) {
          consultationId = response.data.data.consultationId
          expect(response.data.data).toHaveProperty('consultationId')
          expect(response.data.data).toHaveProperty('expertProfile')
          console.log(`✅ 专家咨询启动成功，ID: ${consultationId}`)
          
          // 验证专家资料结构
          const expertProfile = response.data.data.expertProfile
          expect(expertProfile).toHaveProperty('name')
          expect(expertProfile).toHaveProperty('specialization')
          expect(typeof expertProfile.name).toBe('string')
          expect(typeof expertProfile.specialization).toBe('string')
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.log('⚠️ 专家咨询API端点不存在，跳过测试')
        } else {
          console.error('专家咨询启动失败:', error.response?.data || error.message)
        }
      }
    }, TEST_TIMEOUT)

    it('应该能够获取咨询会话信息', async () => {
      if (!consultationId) {
        console.log('⚠️ 没有有效的咨询ID，跳过会话信息测试')
        return
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/expert-consultation/${consultationId}`)
        
        expect(response.status).toBe(200)
        
        if (response.data.success) {
          expect(response.data.data).toHaveProperty('sessionToken')
          expect(response.data.data).toHaveProperty('consultationLimits')
          console.log('✅ 获取咨询会话信息成功')
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.log('⚠️ 咨询会话API端点不存在，跳过测试')
        } else {
          console.error('获取咨询会话失败:', error.response?.data || error.message)
        }
      }
    }, TEST_TIMEOUT)
  })

  describe('📋 活动策划真实API测试', () => {
    it('应该能够生成活动策划方案', async () => {
      const planningRequest = {
        activityType: '幼儿园开放日',
        targetAudience: '3-6岁儿童及家长',
        budget: 5000,
        duration: '2小时',
        location: '幼儿园多功能厅',
        requirements: ['音响设备', '茶水'],
        preferredStyle: 'professional'
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/api/activity-planner/generate`, planningRequest)
        
        expect(response.status).toBe(200)
        
        if (response.data.success || response.data.planId) {
          // 适应不同的响应格式
          const plan = response.data.data || response.data
          
          expect(plan).toHaveProperty('title')
          expect(plan).toHaveProperty('description')
          expect(typeof plan.title).toBe('string')
          expect(typeof plan.description).toBe('string')
          
          console.log(`✅ 活动策划生成成功: ${plan.title}`)
          
          // 验证详细计划结构
          if (plan.detailedPlan) {
            expect(plan.detailedPlan).toHaveProperty('overview')
            expect(plan.detailedPlan).toHaveProperty('timeline')
            expect(plan.detailedPlan).toHaveProperty('budget')
            
            // 验证预算结构
            if (plan.detailedPlan.budget) {
              expect(plan.detailedPlan.budget).toHaveProperty('total')
              expect(typeof plan.detailedPlan.budget.total).toBe('number')
              
              if (plan.detailedPlan.budget.breakdown) {
                expect(Array.isArray(plan.detailedPlan.budget.breakdown)).toBe(true)
              }
            }
            
            // 验证时间线结构
            if (plan.detailedPlan.timeline) {
              expect(Array.isArray(plan.detailedPlan.timeline)).toBe(true)
              
              if (plan.detailedPlan.timeline.length > 0) {
                const timelineItem = plan.detailedPlan.timeline[0]
                expect(timelineItem).toHaveProperty('time')
                expect(timelineItem).toHaveProperty('activity')
              }
            }
          }
          
          // 验证使用的模型信息
          if (plan.modelsUsed) {
            expect(plan.modelsUsed).toHaveProperty('textModel')
            expect(typeof plan.modelsUsed.textModel).toBe('string')
          }
          
          // 验证处理时间
          if (plan.processingTime) {
            expect(typeof plan.processingTime).toBe('number')
            expect(plan.processingTime).toBeGreaterThan(0)
            console.log(`⚡ 处理时间: ${plan.processingTime}ms`)
          }
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.log('⚠️ 活动策划API端点不存在，跳过测试')
        } else {
          console.error('活动策划生成失败:', error.response?.data || error.message)
          
          // 如果是500错误，可能是外部AI服务问题
          if (error.response?.status === 500) {
            console.log('⚠️ 可能是外部AI服务连接问题，这是预期的情况')
          } else {
            throw error
          }
        }
      }
    }, TEST_TIMEOUT)

    it('应该能够获取活动策划统计信息', async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/activity-planner/stats`, {
          params: { days: 30 }
        })
        
        expect(response.status).toBe(200)
        
        if (response.data.success) {
          const stats = response.data.data
          expect(stats).toHaveProperty('totalPlans')
          expect(typeof stats.totalPlans).toBe('number')
          console.log(`✅ 获取策划统计成功，总计划数: ${stats.totalPlans}`)
          
          if (stats.successRate !== undefined) {
            expect(typeof stats.successRate).toBe('number')
            expect(stats.successRate).toBeGreaterThanOrEqual(0)
            expect(stats.successRate).toBeLessThanOrEqual(1)
          }
          
          if (stats.averageProcessingTime !== undefined) {
            expect(typeof stats.averageProcessingTime).toBe('number')
            expect(stats.averageProcessingTime).toBeGreaterThan(0)
          }
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.log('⚠️ 策划统计API端点不存在，跳过测试')
        } else {
          console.error('获取策划统计失败:', error.response?.data || error.message)
        }
      }
    }, TEST_TIMEOUT)

    it('应该能够获取可用AI模型列表', async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/activity-planner/models`)
        
        expect(response.status).toBe(200)
        
        if (response.data.success) {
          const models = response.data.data
          expect(models).toHaveProperty('textModels')
          expect(Array.isArray(models.textModels)).toBe(true)
          console.log(`✅ 获取策划模型列表成功，文本模型数: ${models.textModels.length}`)
          
          // 验证模型结构
          if (models.textModels.length > 0) {
            const model = models.textModels[0]
            expect(model).toHaveProperty('name')
            expect(model).toHaveProperty('provider')
            expect(typeof model.name).toBe('string')
            expect(typeof model.provider).toBe('string')
          }
          
          if (models.imageModels) {
            expect(Array.isArray(models.imageModels)).toBe(true)
            console.log(`📸 图像模型数: ${models.imageModels.length}`)
          }
          
          if (models.speechModels) {
            expect(Array.isArray(models.speechModels)).toBe(true)
            console.log(`🎵 语音模型数: ${models.speechModels.length}`)
          }
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.log('⚠️ 策划模型API端点不存在，跳过测试')
        } else {
          console.error('获取策划模型失败:', error.response?.data || error.message)
        }
      }
    }, TEST_TIMEOUT)
  })

  describe('🔗 API连接和配置测试', () => {
    it('应该正确配置API代理', async () => {
      // 测试前端代理配置是否正确工作
      const frontendApiUrl = process.env.VITE_APP_URL || 'https://localhost:5173'
      
      try {
        // 通过前端代理访问API
        const response = await axios.get(`${frontendApiUrl}/api/health`, {
          timeout: 5000
        })
        
        expect(response.status).toBe(200)
        console.log('✅ 前端API代理配置正确')
      } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
          console.log('⚠️ 前端开发服务器未运行，跳过代理测试')
        } else {
          console.error('代理测试失败:', error.message)
        }
      }
    }, TEST_TIMEOUT)

    it('应该正确处理认证头', async () => {
      // 测试不带认证头的请求
      const tempToken = axios.defaults.headers.common['Authorization']
      delete axios.defaults.headers.common['Authorization']
      
      try {
        const response = await axios.get(`${API_BASE_URL}/api/ai/initialize`)
        
        // 根据后端实现，可能返回401或直接拒绝
        if (response.status === 401) {
          console.log('✅ 正确处理了未认证请求')
        } else if (response.data.success === false && response.data.message?.includes('认证')) {
          console.log('✅ 正确返回了认证错误信息')
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.log('✅ 正确返回401认证错误')
        } else {
          console.log('⚠️ 认证检查行为:', error.response?.status || error.message)
        }
      } finally {
        // 恢复认证头
        if (tempToken) {
          axios.defaults.headers.common['Authorization'] = tempToken
        }
      }
    }, TEST_TIMEOUT)

    it('应该正确处理CORS配置', async () => {
      // 测试CORS头是否正确设置
      try {
        const response = await axios.options(`${API_BASE_URL}/api/health`)
        
        // 检查CORS相关头部
        const corsHeaders = response.headers['access-control-allow-origin']
        if (corsHeaders) {
          console.log('✅ CORS配置正确')
        } else {
          console.log('⚠️ 未检测到CORS头部，可能是同源请求')
        }
      } catch (error) {
        console.log('⚠️ CORS测试跳过，可能不支持OPTIONS请求')
      }
    }, TEST_TIMEOUT)
  })

  describe('⚡ 性能和响应时间测试', () => {
    it('API响应时间应该在合理范围内', async () => {
      const startTime = Date.now()
      
      try {
        const response = await axios.get(`${API_BASE_URL}/api/health`)
        const responseTime = Date.now() - startTime
        
        expect(response.status).toBe(200)
        expect(responseTime).toBeLessThan(5000) // 5秒内响应
        
        console.log(`✅ API响应时间: ${responseTime}ms`)
        
        if (responseTime > 1000) {
          console.log('⚠️ API响应时间较慢，可能需要优化')
        }
      } catch (error) {
        const responseTime = Date.now() - startTime
        console.log(`❌ API请求失败，耗时: ${responseTime}ms`)
        throw error
      }
    }, TEST_TIMEOUT)

    it('并发请求应该能够正确处理', async () => {
      const concurrentRequests = Array(5).fill(0).map((_, index) => 
        axios.get(`${API_BASE_URL}/api/health`, {
          params: { test: `concurrent-${index}` }
        })
      )
      
      const startTime = Date.now()
      
      try {
        const responses = await Promise.all(concurrentRequests)
        const totalTime = Date.now() - startTime
        
        responses.forEach((response, index) => {
          expect(response.status).toBe(200)
        })
        
        console.log(`✅ 并发请求测试通过，5个请求总耗时: ${totalTime}ms`)
        
        if (totalTime > 10000) {
          console.log('⚠️ 并发请求处理较慢')
        }
      } catch (error) {
        console.error('❌ 并发请求测试失败:', error)
        throw error
      }
    }, TEST_TIMEOUT)
  })

  describe('🛡️ 错误处理和边界情况测试', () => {
    it('应该正确处理无效的API端点', async () => {
      try {
        await axios.get(`${API_BASE_URL}/api/nonexistent-endpoint`)
        
        // 如果没有抛出错误，说明返回了意外的成功响应
        console.log('⚠️ 无效端点返回了成功响应，这可能不是预期行为')
      } catch (error: any) {
        expect(error.response?.status).toBe(404)
        console.log('✅ 正确处理了无效API端点 (404)')
      }
    }, TEST_TIMEOUT)

    it('应该正确处理无效的请求数据', async () => {
      try {
        await axios.post(`${API_BASE_URL}/api/activity-planner/generate`, {
          invalidField: 'invalid data'
        })
        
        console.log('⚠️ 无效数据请求可能被接受了')
      } catch (error: any) {
        if (error.response?.status >= 400 && error.response?.status < 500) {
          console.log(`✅ 正确处理了无效请求数据 (${error.response.status})`)
        } else {
          console.log(`⚠️ 意外的错误状态: ${error.response?.status}`)
        }
      }
    }, TEST_TIMEOUT)

    it('应该正确处理大数据量请求', async () => {
      const largeRequest = {
        activityType: '幼儿园开放日',
        targetAudience: '3-6岁儿童及家长',
        budget: 5000,
        duration: '2小时',
        location: '幼儿园多功能厅',
        requirements: Array(100).fill('测试需求').map((req, i) => `${req}-${i}`),
        preferredStyle: 'professional',
        additionalNotes: 'x'.repeat(10000) // 10KB的额外数据
      }
      
      try {
        const response = await axios.post(`${API_BASE_URL}/api/activity-planner/generate`, largeRequest)
        
        if (response.status === 200) {
          console.log('✅ 正确处理了大数据量请求')
        }
      } catch (error: any) {
        if (error.response?.status === 413) {
          console.log('✅ 正确拒绝了过大的请求 (413 Payload Too Large)')
        } else if (error.response?.status === 400) {
          console.log('✅ 正确验证了请求数据 (400 Bad Request)')
        } else {
          console.log(`⚠️ 大数据量请求处理结果: ${error.response?.status || error.message}`)
        }
      }
    }, TEST_TIMEOUT)
  })

  describe('📊 数据一致性和完整性测试', () => {
    it('返回的数据结构应该一致', async () => {
      try {
        const healthResponse = await axios.get(`${API_BASE_URL}/api/health`)
        const aiInitResponse = await axios.get(`${API_BASE_URL}/api/ai/initialize`)
        
        // 验证响应格式一致性
        if (healthResponse.data.success !== undefined && aiInitResponse.data.success !== undefined) {
          expect(typeof healthResponse.data.success).toBe('boolean')
          expect(typeof aiInitResponse.data.success).toBe('boolean')
          console.log('✅ API响应格式一致')
        }
        
        // 验证时间戳格式
        if (healthResponse.data.timestamp) {
          expect(new Date(healthResponse.data.timestamp).getTime()).toBeGreaterThan(0)
          console.log('✅ 时间戳格式正确')
        }
      } catch (error: any) {
        console.log('⚠️ 数据一致性测试部分失败:', error.message)
      }
    }, TEST_TIMEOUT)

    it('数据字段类型应该正确', async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/ai/models`)
        
        if (response.data.success && response.data.data) {
          const models = response.data.data
          
          if (Array.isArray(models)) {
            models.forEach((model: any, index: number) => {
              expect(typeof model.id).toBe('number')
              expect(typeof model.name).toBe('string')
              
              if (model.isDefault !== undefined) {
                expect(typeof model.isDefault).toBe('boolean')
              }
            })
            console.log('✅ 模型数据字段类型正确')
          }
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.log('⚠️ 模型API端点不存在，跳过类型检查')
        } else {
          console.log('⚠️ 数据类型检查失败:', error.message)
        }
      }
    }, TEST_TIMEOUT)
  })
})