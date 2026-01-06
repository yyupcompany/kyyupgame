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
import request from '@/utils/request'
import { AIAssistantOptimizedAPI, aiAssistantOptimizedApi } from '@/api/ai-assistant-optimized'

// Mock request module
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

describe('AI Assistant Optimized API', () => {
  let api: AIAssistantOptimizedAPI

  beforeEach(() => {
    vi.clearAllMocks()
    api = new AIAssistantOptimizedAPI()
  })

  describe('query', () => {
    it('should send query successfully', async () => {
      const queryRequest = {
        query: 'What is the weather today?',
        conversationId: 'conv_123',
        userId: 1
      }

      const queryResponse = {
        response: 'The weather is sunny today.',
        level: 'direct' as const,
        tokensUsed: 25,
        tokensSaved: 10,
        processingTime: 0.5,
        savingRate: 0.4
      }

      vi.mocked(request.post).mockResolvedValue({ data: queryResponse })

      const result = await api.query(queryRequest)
      
      expect(request.post).toHaveBeenCalledWith('/api/ai-assistant-optimized/query', queryRequest)
      expect(result.data).toEqual(queryResponse)
    })

    it('should handle different query levels', async () => {
      const levels = ['direct', 'semantic', 'complex'] as const
      
      for (const level of levels) {
        const queryRequest = {
          query: 'Test query',
          conversationId: 'conv_123',
          userId: 1
        }

        const queryResponse = {
          response: 'Test response',
          level,
          tokensUsed: 20,
          tokensSaved: 5,
          processingTime: 0.3,
          savingRate: 0.25
        }

        vi.mocked(request.post).mockResolvedValue({ data: queryResponse })

        const result = await api.query(queryRequest)
        
        expect(result.data.level).toBe(level)
        
        vi.clearAllMocks()
      }
    })

    it('should handle API errors', async () => {
      const queryRequest = {
        query: 'Test query',
        conversationId: 'conv_123',
        userId: 1
      }

      const error = new Error('Query failed')
      vi.mocked(request.post).mockRejectedValue(error)

      await expect(api.query(queryRequest)).rejects.toThrow('Query failed')
    })
  })

  describe('getPerformanceStats', () => {
    it('should get performance stats successfully', async () => {
      const performanceStats = {
        performance: {
          totalQueries: 1000,
          directQueries: 600,
          semanticQueries: 300,
          complexQueries: 100,
          averageResponseTime: 0.8,
          totalTokensSaved: 5000
        },
        router: {
          keywordCount: 500,
          directMatchCount: 400,
          complexityThreshold: 0.7
        },
        directService: {
          supportedActions: ['action1', 'action2'],
          cacheHitRate: 0.85,
          averageResponseTime: 0.2
        },
        optimization: {
          tokenSavingRate: '15%',
          directQueryRate: '60%',
          semanticQueryRate: '30%',
          complexQueryRate: '10%'
        }
      }

      vi.mocked(request.get).mockResolvedValue({ data: performanceStats })

      const result = await api.getPerformanceStats()
      
      expect(request.get).toHaveBeenCalledWith('/api/ai-assistant-optimized/stats')
      expect(result.data).toEqual(performanceStats)
    })

    it('should handle empty performance stats', async () => {
      const emptyStats = {
        performance: {
          totalQueries: 0,
          directQueries: 0,
          semanticQueries: 0,
          complexQueries: 0,
          averageResponseTime: 0,
          totalTokensSaved: 0
        },
        router: {
          keywordCount: 0,
          directMatchCount: 0,
          complexityThreshold: 0
        },
        directService: {
          supportedActions: [],
          cacheHitRate: 0,
          averageResponseTime: 0
        },
        optimization: {
          tokenSavingRate: '0%',
          directQueryRate: '0%'
        }
      }

      vi.mocked(request.get).mockResolvedValue({ data: emptyStats })

      const result = await api.getPerformanceStats()
      expect(result.data.performance.totalQueries).toBe(0)
    })
  })

  describe('healthCheck', () => {
    it('should perform health check successfully', async () => {
      const healthResponse = {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0',
        features: {
          directResponse: true,
          semanticRouting: true,
          complexAnalysis: true,
          performanceMonitoring: true
        },
        stats: {
          uptime: 86400,
          totalQueries: 1000,
          averageResponseTime: 0.5
        }
      }

      vi.mocked(request.get).mockResolvedValue({ data: healthResponse })

      const result = await api.healthCheck()
      
      expect(request.get).toHaveBeenCalledWith('/api/ai-assistant-optimized/health')
      expect(result.data).toEqual(healthResponse)
    })

    it('should detect unhealthy status', async () => {
      const unhealthyResponse = {
        status: 'unhealthy',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0',
        features: {
          directResponse: false,
          semanticRouting: false,
          complexAnalysis: false,
          performanceMonitoring: true
        },
        stats: {
          uptime: 0,
          totalQueries: 0,
          averageResponseTime: 0
        }
      }

      vi.mocked(request.get).mockResolvedValue({ data: unhealthyResponse })

      const result = await api.healthCheck()
      expect(result.data.status).toBe('unhealthy')
    })
  })

  describe('testRoute', () => {
    it('should test route successfully', async () => {
      const routeTestRequest = {
        query: 'What is AI?'
      }

      const routeTestResponse = {
        level: 'semantic',
        confidence: 0.85,
        estimatedTokens: 30,
        matchedKeywords: ['AI', 'what'],
        processingTime: 0.1
      }

      vi.mocked(request.post).mockResolvedValue({ data: routeTestResponse })

      const result = await api.testRoute(routeTestRequest)
      
      expect(request.post).toHaveBeenCalledWith('/api/ai-assistant-optimized/test-route', routeTestRequest)
      expect(result.data).toEqual(routeTestResponse)
    })

    it('should handle different confidence levels', async () => {
      const confidenceLevels = [0.1, 0.5, 0.9, 1.0]
      
      for (const confidence of confidenceLevels) {
        const routeTestRequest = {
          query: 'Test query'
        }

        const routeTestResponse = {
          level: 'direct',
          confidence,
          estimatedTokens: 20,
          matchedKeywords: ['test'],
          processingTime: 0.05
        }

        vi.mocked(request.post).mockResolvedValue({ data: routeTestResponse })

        const result = await api.testRoute(routeTestRequest)
        
        expect(result.data.confidence).toBe(confidence)
        
        vi.clearAllMocks()
      }
    })
  })

  describe('testDirect', () => {
    it('should test direct response successfully', async () => {
      const directTestRequest = {
        action: 'get_weather',
        query: 'What is the weather?'
      }

      const directTestResponse = {
        success: true,
        response: 'The weather is sunny.',
        tokensUsed: 15,
        processingTime: 0.1
      }

      vi.mocked(request.post).mockResolvedValue({ data: directTestResponse })

      const result = await api.testDirect(directTestRequest)
      
      expect(request.post).toHaveBeenCalledWith('/api/ai-assistant-optimized/test-direct', directTestRequest)
      expect(result.data).toEqual(directTestResponse)
    })

    it('should handle failed direct response', async () => {
      const directTestRequest = {
        action: 'invalid_action',
        query: 'Invalid query'
      }

      const directTestResponse = {
        success: false,
        response: 'Action not supported',
        tokensUsed: 5,
        processingTime: 0.05
      }

      vi.mocked(request.post).mockResolvedValue({ data: directTestResponse })

      const result = await api.testDirect(directTestRequest)
      expect(result.data.success).toBe(false)
    })
  })

  describe('getKeywords', () => {
    it('should get keywords successfully', async () => {
      const keywordsResponse = {
        success: true,
        data: {
          action: ['get', 'create', 'update', 'delete'],
          entity: ['weather', 'user', 'activity'],
          modifier: ['today', 'tomorrow', 'all'],
          directMatch: ['hello', 'help', 'thanks']
        }
      }

      vi.mocked(request.get).mockResolvedValue(keywordsResponse)

      const result = await api.getKeywords()
      
      expect(request.get).toHaveBeenCalledWith('/api/ai-assistant-optimized/keywords')
      expect(result).toEqual(keywordsResponse)
    })

    it('should handle empty keywords', async () => {
      const emptyKeywords = {
        success: true,
        data: {
          action: [],
          entity: [],
          modifier: [],
          directMatch: []
        }
      }

      vi.mocked(request.get).mockResolvedValue(emptyKeywords)

      const result = await api.getKeywords()
      expect(result.data.action).toEqual([])
    })
  })

  describe('Configuration Methods', () => {
    describe('saveConfig', () => {
      it('should save configuration successfully', async () => {
        const config = {
          setting1: 'value1',
          setting2: 'value2'
        }

        const response = {
          success: true,
          message: 'Configuration saved successfully'
        }

        vi.mocked(request.post).mockResolvedValue(response)

        const result = await api.saveConfig(config)
        
        expect(request.post).toHaveBeenCalledWith('/api/ai-assistant-optimized/config', config)
        expect(result).toEqual(response)
      })
    })

    describe('getConfig', () => {
      it('should get configuration successfully', async () => {
        const configResponse = {
          success: true,
          data: {
            setting1: 'value1',
            setting2: 'value2'
          },
          message: 'Configuration retrieved successfully'
        }

        vi.mocked(request.get).mockResolvedValue(configResponse)

        const result = await api.getConfig()
        
        expect(request.get).toHaveBeenCalledWith('/api/ai-assistant-optimized/config')
        expect(result).toEqual(configResponse)
      })
    })

    describe('resetSystem', () => {
      it('should reset system successfully', async () => {
        const response = {
          success: true,
          message: 'System reset successfully'
        }

        vi.mocked(request.post).mockResolvedValue(response)

        const result = await api.resetSystem()
        
        expect(request.post).toHaveBeenCalledWith('/api/ai-assistant-optimized/reset')
        expect(result).toEqual(response)
      })
    })
  })

  describe('Advanced Methods', () => {
    describe('exportPerformanceReport', () => {
      it('should export performance report in JSON format', async () => {
        const response = {
          success: true,
          data: { report: 'data' },
          downloadUrl: 'https://example.com/report.json'
        }

        vi.mocked(request.get).mockResolvedValue(response)

        const result = await api.exportPerformanceReport('json')
        
        expect(request.get).toHaveBeenCalledWith('/api/ai-assistant-optimized/export/performance?format=json')
        expect(result).toEqual(response)
      })

      it('should export in different formats', async () => {
        const formats = ['json', 'csv', 'pdf'] as const
        
        for (const format of formats) {
          const response = {
            success: true,
            data: { format },
            downloadUrl: `https://example.com/report.${format}`
          }

          vi.mocked(request.get).mockResolvedValue(response)

          const result = await api.exportPerformanceReport(format)
          
          expect(request.get).toHaveBeenCalledWith(`/api/ai-assistant-optimized/export/performance?format=${format}`)
          expect(result.data.format).toBe(format)
          
          vi.clearAllMocks()
        }
      })
    })

    describe('batchTest', () => {
      it('should perform batch test successfully', async () => {
        const queries = ['Query 1', 'Query 2', 'Query 3']
        
        const response = {
          success: true,
          data: {
            results: [
              {
                query: 'Query 1',
                level: 'direct',
                tokensUsed: 10,
                processingTime: 0.1,
                success: true
              }
            ],
            summary: {
              totalQueries: 3,
              successCount: 3,
              failureCount: 0,
              averageTokens: 15,
              averageTime: 0.15,
              tokenSavingRate: 0.2
            }
          }
        }

        vi.mocked(request.post).mockResolvedValue(response)

        const result = await api.batchTest(queries)
        
        expect(request.post).toHaveBeenCalledWith('/api/ai-assistant-optimized/batch-test', { queries })
        expect(result.data.summary.totalQueries).toBe(3)
      })

      it('should handle empty batch test', async () => {
        const response = {
          success: true,
          data: {
            results: [],
            summary: {
              totalQueries: 0,
              successCount: 0,
              failureCount: 0,
              averageTokens: 0,
              averageTime: 0,
              tokenSavingRate: 0
            }
          }
        }

        vi.mocked(request.post).mockResolvedValue(response)

        const result = await api.batchTest([])
        expect(result.data.summary.totalQueries).toBe(0)
      })
    })

    describe('getRealtimeMetrics', () => {
      it('should get realtime metrics successfully', async () => {
        const response = {
          success: true,
          data: {
            currentLoad: 0.5,
            activeConnections: 10,
            queueLength: 2,
            memoryUsage: 0.6,
            cpuUsage: 0.3,
            responseTime: 0.1,
            errorRate: 0.01
          }
        }

        vi.mocked(request.get).mockResolvedValue(response)

        const result = await api.getRealtimeMetrics()
        
        expect(request.get).toHaveBeenCalledWith('/api/ai-assistant-optimized/metrics/realtime')
        expect(result.data.currentLoad).toBe(0.5)
      })
    })

    describe('getHistoricalTrends', () => {
      it('should get historical trends successfully', async () => {
        const response = {
          success: true,
          data: {
            timestamps: ['2024-01-01T00:00:00Z', '2024-01-01T01:00:00Z'],
            metrics: {
              queryCount: [10, 15],
              averageResponseTime: [0.1, 0.15],
              tokenUsage: [100, 150],
              errorRate: [0.01, 0.02],
              directQueryRate: [0.8, 0.75]
            }
          }
        }

        vi.mocked(request.get).mockResolvedValue(response)

        const result = await api.getHistoricalTrends('1h')
        
        expect(request.get).toHaveBeenCalledWith('/api/ai-assistant-optimized/metrics/trends?range=1h')
        expect(result.data.timestamps.length).toBe(2)
      })

      it('should handle different time ranges', async () => {
        const timeRanges = ['1h', '24h', '7d', '30d'] as const
        
        for (const range of timeRanges) {
          const response = {
            success: true,
            data: {
              timestamps: [],
              metrics: {
                queryCount: [],
                averageResponseTime: [],
                tokenUsage: [],
                errorRate: [],
                directQueryRate: []
              }
            }
          }

          vi.mocked(request.get).mockResolvedValue(response)

          const result = await api.getHistoricalTrends(range)
          
          expect(request.get).toHaveBeenCalledWith(`/api/ai-assistant-optimized/metrics/trends?range=${range}`)
          
          vi.clearAllMocks()
        }
      })
    })

    describe('triggerOptimization', () => {
      it('should trigger optimization successfully', async () => {
        const response = {
          success: true,
          data: {
            optimizationType: 'all',
            startTime: '2024-01-01T00:00:00Z',
            estimatedDuration: 300,
            status: 'started'
          }
        }

        vi.mocked(request.post).mockResolvedValue(response)

        const result = await api.triggerOptimization('all')
        
        expect(request.post).toHaveBeenCalledWith('/api/ai-assistant-optimized/optimize', { type: 'all' })
        expect(result.data.status).toBe('started')
      })

      it('should handle different optimization types', async () => {
        const types = ['cache', 'index', 'keywords', 'all'] as const
        
        for (const type of types) {
          const response = {
            success: true,
            data: {
              optimizationType: type,
              startTime: '2024-01-01T00:00:00Z',
              estimatedDuration: 60,
              status: 'started'
            }
          }

          vi.mocked(request.post).mockResolvedValue(response)

          const result = await api.triggerOptimization(type)
          
          expect(request.post).toHaveBeenCalledWith('/api/ai-assistant-optimized/optimize', { type })
          expect(result.data.optimizationType).toBe(type)
          
          vi.clearAllMocks()
        }
      })
    })

    describe('getOptimizationSuggestions', () => {
      it('should get optimization suggestions successfully', async () => {
        const response = {
          success: true,
          data: {
            suggestions: [
              {
                type: 'performance',
                priority: 'high',
                title: 'Cache Optimization',
                description: 'Optimize cache settings',
                impact: 'High',
                effort: 'Low',
                action: 'Update cache configuration'
              }
            ]
          }
        }

        vi.mocked(request.get).mockResolvedValue(response)

        const result = await api.getOptimizationSuggestions()
        
        expect(request.get).toHaveBeenCalledWith('/api/ai-assistant-optimized/suggestions')
        expect(result.data.suggestions.length).toBe(1)
      })
    })
  })

  describe('Exported Instance', () => {
    it('should export singleton instance', () => {
      expect(aiAssistantOptimizedApi).toBeInstanceOf(AIAssistantOptimizedAPI)
    })

    it('should have all methods available on exported instance', () => {
      expect(aiAssistantOptimizedApi).toHaveProperty('query')
      expect(aiAssistantOptimizedApi).toHaveProperty('getPerformanceStats')
      expect(aiAssistantOptimizedApi).toHaveProperty('healthCheck')
      expect(aiAssistantOptimizedApi).toHaveProperty('testRoute')
      expect(aiAssistantOptimizedApi).toHaveProperty('testDirect')
      expect(aiAssistantOptimizedApi).toHaveProperty('getKeywords')
      expect(aiAssistantOptimizedApi).toHaveProperty('saveConfig')
      expect(aiAssistantOptimizedApi).toHaveProperty('getConfig')
      expect(aiAssistantOptimizedApi).toHaveProperty('resetSystem')
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const error = new Error('Network error')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(api.getPerformanceStats()).rejects.toThrow('Network error')
    })

    it('should handle server errors', async () => {
      const error = new Error('Internal server error')
      vi.mocked(request.post).mockRejectedValue(error)

      await expect(api.query({
        query: 'test',
        conversationId: 'test',
        userId: 1
      })).rejects.toThrow('Internal server error')
    })

    it('should handle timeout errors', async () => {
      const error = new Error('Request timeout')
      vi.mocked(request.get).mockRejectedValue(error)

      await expect(api.healthCheck()).rejects.toThrow('Request timeout')
    })
  })
})