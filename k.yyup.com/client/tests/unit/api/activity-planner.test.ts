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

describe, it, expect, vi, beforeEach } from 'vitest'
import requestInstance from '@/utils/request'
import { ACTIVITY_PLANNER_ENDPOINTS } from '@/api/endpoints'
import {
  generateActivityPlan,
  getPlanningStats,
  getAvailableModels,
  activityPlannerApi
} from '@/api/activity-planner'

// Mock request module
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

// Mock endpoints
vi.mock('@/api/endpoints', () => ({
  ACTIVITY_PLANNER_ENDPOINTS: {
    GENERATE: '/ai/activity-planner/generate',
    STATS: '/ai/activity-planner/stats',
    MODELS: '/ai/activity-planner/models'
  }
}))

describe('Activity Planner API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateActivityPlan', () => {
    it('should generate activity plan successfully', async () => {
      const planningRequest = {
        activityType: 'birthday_party',
        targetAudience: 'children_3_5',
        budget: 1000,
        duration: '2_hours',
        location: 'indoor',
        requirements: ['games', 'music'],
        preferredStyle: 'fun'
      }

      const mockResponse = {
        planId: 'plan_123',
        title: 'Fun Birthday Party',
        description: 'A fun birthday party for children',
        detailedPlan: {
          overview: 'Overview of the party',
          timeline: [
            { time: '14:00', activity: 'Welcome', description: 'Welcome children' }
          ],
          materials: ['balloons', 'music'],
          budget: {
            total: 1000,
            breakdown: [
              { item: 'balloons', cost: 100 }
            ]
          },
          tips: ['Tip 1', 'Tip 2']
        },
        generatedImages: ['image1.jpg'],
        audioGuide: 'audio1.mp3',
        modelsUsed: {
          textModel: 'gpt-4',
          imageModel: 'dall-e',
          speechModel: 'whisper'
        },
        processingTime: 5.2
      }

      vi.mocked(requestInstance.post).mockResolvedValue({ data: mockResponse })

      const result = await generateActivityPlan(planningRequest)
      
      expect(requestInstance.post).toHaveBeenCalledWith(
        ACTIVITY_PLANNER_ENDPOINTS.GENERATE,
        planningRequest
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      const planningRequest = {
        activityType: 'birthday_party',
        targetAudience: 'children_3_5'
      }

      const error = new Error('API request failed')
      vi.mocked(requestInstance.post).mockRejectedValue(error)

      await expect(generateActivityPlan(planningRequest)).rejects.toThrow('API request failed')
    })

    it('should handle minimal request data', async () => {
      const minimalRequest = {
        activityType: 'sports',
        targetAudience: 'teens'
      }

      const mockResponse = {
        planId: 'plan_456',
        title: 'Sports Activity',
        detailedPlan: {
          overview: 'Sports activity plan'
        }
      }

      vi.mocked(requestInstance.post).mockResolvedValue({ data: mockResponse })

      const result = await generateActivityPlan(minimalRequest)
      
      expect(requestInstance.post).toHaveBeenCalledWith(
        ACTIVITY_PLANNER_ENDPOINTS.GENERATE,
        minimalRequest
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getPlanningStats', () => {
    it('should get planning statistics with default days', async () => {
      const mockResponse = {
        totalPlans: 50,
        successRate: 0.95,
        averageProcessingTime: 3.5,
        popularActivityTypes: ['birthday_party', 'sports', 'educational']
      }

      vi.mocked(requestInstance.get).mockResolvedValue({ data: mockResponse })

      const result = await getPlanningStats()
      
      expect(requestInstance.get).toHaveBeenCalledWith(ACTIVITY_PLANNER_ENDPOINTS.STATS, {
        params: { days: 30 }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should get planning statistics with custom days', async () => {
      const customDays = 7
      const mockResponse = {
        totalPlans: 15,
        successRate: 0.98,
        averageProcessingTime: 2.8,
        popularActivityTypes: ['birthday_party']
      }

      vi.mocked(requestInstance.get).mockResolvedValue({ data: mockResponse })

      const result = await getPlanningStats(customDays)
      
      expect(requestInstance.get).toHaveBeenCalledWith(ACTIVITY_PLANNER_ENDPOINTS.STATS, {
        params: { days: customDays }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle empty statistics', async () => {
      const mockResponse = {
        totalPlans: 0,
        successRate: 0,
        averageProcessingTime: 0,
        popularActivityTypes: []
      }

      vi.mocked(requestInstance.get).mockResolvedValue({ data: mockResponse })

      const result = await getPlanningStats(1)
      
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getAvailableModels', () => {
    it('should get available models successfully', async () => {
      const mockResponse = {
        textModels: [
          {
            id: 1,
            name: 'gpt-4',
            displayName: 'GPT-4',
            provider: 'OpenAI',
            isDefault: true
          },
          {
            id: 2,
            name: 'claude',
            displayName: 'Claude',
            provider: 'Anthropic',
            isDefault: false
          }
        ],
        imageModels: [
          {
            id: 3,
            name: 'dall-e',
            displayName: 'DALL-E',
            provider: 'OpenAI',
            isDefault: true
          }
        ],
        speechModels: [
          {
            id: 4,
            name: 'whisper',
            displayName: 'Whisper',
            provider: 'OpenAI',
            isDefault: true
          }
        ]
      }

      vi.mocked(requestInstance.get).mockResolvedValue({ data: mockResponse })

      const result = await getAvailableModels()
      
      expect(requestInstance.get).toHaveBeenCalledWith(ACTIVITY_PLANNER_ENDPOINTS.MODELS)
      expect(result).toEqual(mockResponse)
    })

    it('should handle empty models list', async () => {
      const mockResponse = {
        textModels: [],
        imageModels: [],
        speechModels: []
      }

      vi.mocked(requestInstance.get).mockResolvedValue({ data: mockResponse })

      const result = await getAvailableModels()
      
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors when getting models', async () => {
      const error = new Error('Failed to fetch models')
      vi.mocked(requestInstance.get).mockRejectedValue(error)

      await expect(getAvailableModels()).rejects.toThrow('Failed to fetch models')
    })
  })

  describe('activityPlannerApi object', () => {
    it('should expose all methods correctly', () => {
      expect(activityPlannerApi).toHaveProperty('generateActivityPlan')
      expect(activityPlannerApi).toHaveProperty('getPlanningStats')
      expect(activityPlannerApi).toHaveProperty('getAvailableModels')
      expect(typeof activityPlannerApi.generateActivityPlan).toBe('function')
      expect(typeof activityPlannerApi.getPlanningStats).toBe('function')
      expect(typeof activityPlannerApi.getAvailableModels).toBe('function')
    })

    it('should have the same method references', () => {
      expect(activityPlannerApi.generateActivityPlan).toBe(generateActivityPlan)
      expect(activityPlannerApi.getPlanningStats).toBe(getPlanningStats)
      expect(activityPlannerApi.getAvailableModels).toBe(getAvailableModels)
    })
  })

  describe('Type Safety', () => {
    it('should enforce proper request types', () => {
      // This test ensures type safety at compile time
      const validRequest: Parameters<typeof generateActivityPlan>[0] = {
        activityType: 'educational',
        targetAudience: 'children_5_8',
        budget: 500,
        duration: '1_hour',
        location: 'outdoor',
        requirements: ['crafts'],
        preferredStyle: 'educational'
      }

      expect(validRequest.activityType).toBe('educational')
      expect(validRequest.targetAudience).toBe('children_5_8')
    })

    it('should enforce proper response types', async () => {
      const mockResponse = {
        planId: 'test_plan',
        title: 'Test Plan',
        description: 'Test Description',
        detailedPlan: {
          overview: 'Test Overview',
          timeline: [],
          materials: [],
          budget: {
            total: 0,
            breakdown: []
          },
          tips: []
        },
        modelsUsed: {
          textModel: 'test_model',
          processingTime: 0
        }
      }

      vi.mocked(requestInstance.post).mockResolvedValue({ data: mockResponse })

      const result = await generateActivityPlan({
        activityType: 'test',
        targetAudience: 'test'
      })

      expect(result.planId).toBe('test_plan')
      expect(result.title).toBe('Test Plan')
      expect(result.modelsUsed.textModel).toBe('test_model')
    })
  })
})