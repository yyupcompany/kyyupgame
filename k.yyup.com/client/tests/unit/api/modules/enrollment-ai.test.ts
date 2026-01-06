/**
 * AI招生功能API测试
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

describe, it, expect, vi, beforeEach } from 'vitest';
import { enrollmentAIApi } from '@/api/modules/enrollment-ai';
import { post, get } from '@/utils/request';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';

// Mock request functions
vi.mock('@/utils/request', () => ({
  post: vi.fn(),
  get: vi.fn()
}));

const mockedPost = vi.mocked(post);
const mockedGet = vi.mocked(get);

describe('Enrollment AI API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateSmartPlanning', () => {
    it('should generate smart planning for enrollment plan', async () => {
      const planId = 1;
      const params: SmartPlanningParams = {
        parameters: {
          targetEnrollment: 100,
          budget: 50000
        }
      };
      const mockResponse = {
        success: true,
        data: {
          planId,
          suggestions: [
            '增加线上推广预算',
            '优化招生流程',
            '加强师资力量展示'
          ],
          timeline: '3个月',
          expectedResults: {
            enrollmentIncrease: 25,
            roi: 1.8
          }
        }
      };

      mockedPost.mockResolvedValue(mockResponse);
      const result = await enrollmentAIApi.generateSmartPlanning(planId, params);

      expect(mockedPost).toHaveBeenCalledWith(`/enrollment-ai/plan/${planId}/smart-planning`, params);
      expect(result).toEqual(mockResponse);
    });

    it('should generate smart planning with default parameters', async () => {
      const planId = 1;
      const mockResponse = {
        success: true,
        data: {
          planId,
          suggestions: ['Default planning suggestions']
        }
      };

      mockedPost.mockResolvedValue(mockResponse);
      const result = await enrollmentAIApi.generateSmartPlanning(planId);

      expect(mockedPost).toHaveBeenCalledWith(`/enrollment-ai/plan/${planId}/smart-planning`, {});
      expect(result).toEqual(mockResponse);
    });
  });

  describe('generateForecast', () => {
    it('should generate enrollment forecast', async () => {
      const planId = 1;
      const params: ForecastParams = {
        timeframe: '6months'
      };
      const mockResponse = {
        success: true,
        data: {
          planId,
          timeframe: '6months',
          forecast: [
            { month: '2024-10', predicted: 45, confidence: 0.85 },
            { month: '2024-11', predicted: 52, confidence: 0.82 },
            { month: '2024-12', predicted: 48, confidence: 0.80 },
            { month: '2025-01', predicted: 38, confidence: 0.78 },
            { month: '2025-02', predicted: 42, confidence: 0.75 },
            { month: '2025-03', predicted: 55, confidence: 0.72 }
          ],
          totalPredicted: 280,
          averageConfidence: 0.78
        }
      };

      mockedPost.mockResolvedValue(mockResponse);
      const result = await enrollmentAIApi.generateForecast(planId, params);

      expect(mockedPost).toHaveBeenCalledWith(`/enrollment-ai/plan/${planId}/forecast`, params);
      expect(result).toEqual(mockResponse);
    });

    it('should handle different timeframes', async () => {
      const planId = 1;
      const timeframes: ForecastParams['timeframe'][] = ['1month', '3months', '6months', '1year'];
      
      for (const timeframe of timeframes) {
        const params: ForecastParams = { timeframe };
        const mockResponse = { success: true, data: { timeframe } };
        
        mockedPost.mockResolvedValue(mockResponse);
        const result = await enrollmentAIApi.generateForecast(planId, params);
        
        expect(mockedPost).toHaveBeenCalledWith(`/enrollment-ai/plan/${planId}/forecast`, params);
        expect(result.data.timeframe).toBe(timeframe);
        
        mockedPost.mockClear();
      }
    });
  });

  describe('generateStrategy', () => {
    it('should generate enrollment strategy', async () => {
      const planId = 1;
      const params: StrategyParams = {
        objectives: {
          increaseEnrollment: 20,
          improveQuality: 15,
          expandAgeGroups: ['3-4岁', '4-5岁']
        }
      };
      const mockResponse = {
        success: true,
        data: {
          planId,
          strategies: [
            {
              name: '线上推广强化',
              description: '增加社交媒体和搜索引擎广告投放',
              budget: 20000,
              expectedROI: 2.5
            },
            {
              name: '线下活动优化',
              description: '举办开放日和体验课程',
              budget: 15000,
              expectedROI: 1.8
            }
          ],
          totalBudget: 35000,
          expectedOverallROI: 2.1
        }
      };

      mockedPost.mockResolvedValue(mockResponse);
      const result = await enrollmentAIApi.generateStrategy(planId, params);

      expect(mockedPost).toHaveBeenCalledWith(`/enrollment-ai/plan/${planId}/strategy`, params);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('generateOptimization', () => {
    it('should generate capacity optimization', async () => {
      const planId = 1;
      const mockResponse = {
        success: true,
        data: {
          planId,
          optimizations: [
            {
              type: 'class_size',
              current: 25,
              recommended: 28,
              impact: '增加12%的容纳能力'
            },
            {
              type: 'schedule',
              current: '单时段',
              recommended: '多时段',
              impact: '提高教室利用率30%'
            }
          ],
              expectedImprovement: 18
        }
      };

      mockedPost.mockResolvedValue(mockResponse);
      const result = await enrollmentAIApi.generateOptimization(planId);

      expect(mockedPost).toHaveBeenCalledWith(`/enrollment-ai/plan/${planId}/optimization`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('generateSimulation', () => {
    it('should generate enrollment simulation', async () => {
      const planId = 1;
      const params: SimulationParams = {
        scenarios: [
          {
            name: '乐观情景',
            variables: {
              marketGrowth: 15,
              competitorReduction: 10,
              budgetIncrease: 20
            }
          },
          {
            name: '保守情景',
            variables: {
              marketGrowth: 5,
              competitorReduction: 0,
              budgetIncrease: 10
            }
          }
        ]
      };
      const mockResponse = {
        success: true,
        data: {
          planId,
          scenarios: [
            {
              name: '乐观情景',
              predictedEnrollment: 135,
              probability: 0.25,
              keyFactors: ['市场增长', '竞争减少']
            },
            {
              name: '保守情景',
              predictedEnrollment: 108,
              probability: 0.45,
              keyFactors: ['稳定增长']
            }
          ],
          weightedAverage: 118
        }
      };

      mockedPost.mockResolvedValue(mockResponse);
      const result = await enrollmentAIApi.generateSimulation(planId, params);

      expect(mockedPost).toHaveBeenCalledWith(`/enrollment-ai/plan/${planId}/simulation`, params);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('generateEvaluation', () => {
    it('should generate plan evaluation', async () => {
      const planId = 1;
      const mockResponse = {
        success: true,
        data: {
          planId,
          evaluation: {
            overallScore: 85,
            strengths: [
              '目标设定合理',
              '预算分配优化',
              '时间安排可行'
            ],
            weaknesses: [
              '风险评估不足',
              '应急计划缺失'
            ],
            recommendations: [
              '增加风险缓冲预算',
              '制定详细的应急方案'
            ]
          },
          feasibility: 'high',
          riskLevel: 'medium'
        }
      };

      mockedPost.mockResolvedValue(mockResponse);
      const result = await enrollmentAIApi.generateEvaluation(planId);

      expect(mockedPost).toHaveBeenCalledWith(`/enrollment-ai/plan/${planId}/evaluation`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('generateTrendAnalysis', () => {
    it('should generate trend analysis with default time range', async () => {
      const mockResponse = {
        success: true,
        data: {
          timeRange: '3years',
          trends: {
            enrollment: [
              { year: 2022, count: 280 },
              { year: 2023, count: 320 },
              { year: 2024, count: 350 }
            ],
            demographics: {
              age3: { 2022: 80, 2023: 95, 2024: 105 },
              age4: { 2022: 120, 2023: 135, 2024: 145 },
              age5: { 2022: 80, 2023: 90, 2024: 100 }
            }
          },
          insights: [
            '3岁年龄段增长最快',
            '整体呈稳定上升趋势'
          ]
        }
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await enrollmentAIApi.generateTrendAnalysis();

      expect(mockedGet).toHaveBeenCalledWith('/enrollment-ai/trends?timeRange=3years');
      expect(result).toEqual(mockResponse);
    });

    it('should generate trend analysis with custom time range', async () => {
      const timeRange = '5years';
      const mockResponse = {
        success: true,
        data: {
          timeRange,
          trends: {}
        }
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await enrollmentAIApi.generateTrendAnalysis(timeRange);

      expect(mockedGet).toHaveBeenCalledWith(`/enrollment-ai/trends?timeRange=${timeRange}`);
      expect(result.data.timeRange).toBe(timeRange);
    });
  });

  describe('getAIHistory', () => {
    it('should get AI analysis history with default parameters', async () => {
      const planId = 1;
      const mockResponse = {
        success: true,
        data: {
          planId,
          history: [
            {
              id: 1,
              type: 'forecast',
              timestamp: '2024-09-01T10:00:00',
              result: { predicted: 120 }
            },
            {
              id: 2,
              type: 'strategy',
              timestamp: '2024-09-01T11:00:00',
              result: { strategies: [] }
            }
          ],
          total: 2
        }
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await enrollmentAIApi.getAIHistory(planId);

      expect(mockedGet).toHaveBeenCalledWith('/enrollment-ai/plan/1/ai-history', { params: {} });
      expect(result).toEqual(mockResponse);
    });

    it('should get AI analysis history with filters', async () => {
      const planId = 1;
      const params = {
        type: 'forecast',
        limit: 10
      };
      const mockResponse = {
        success: true,
        data: {
          planId,
          history: [
            {
              id: 1,
              type: 'forecast',
              timestamp: '2024-09-01T10:00:00'
            }
          ],
          total: 1
        }
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await enrollmentAIApi.getAIHistory(planId, params);

      expect(mockedGet).toHaveBeenCalledWith('/enrollment-ai/plan/1/ai-history', { params });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('batchAnalysis', () => {
    it('should perform batch AI analysis', async () => {
      const planId = 1;
      const analysisTypes = ['forecast', 'strategy', 'optimization'];
      const mockResponse = {
        success: true,
        data: {
          planId,
          results: {
            forecast: { success: true, data: {} },
            strategy: { success: true, data: {} },
            optimization: { success: true, data: {} }
          },
          completed: 3,
          failed: 0
        }
      };

      mockedPost.mockResolvedValue(mockResponse);
      const result = await enrollmentAIApi.batchAnalysis(planId, analysisTypes);

      expect(mockedPost).toHaveBeenCalledWith('/enrollment-ai/plan/1/batch-analysis', { analysisTypes });
      expect(result).toEqual(mockResponse);
    });

    it('should handle batch analysis with partial failures', async () => {
      const planId = 1;
      const analysisTypes = ['forecast', 'strategy', 'optimization', 'simulation'];
      const mockResponse = {
        success: true,
        data: {
          planId,
          results: {
            forecast: { success: true, data: {} },
            strategy: { success: true, data: {} },
            optimization: { success: false, error: 'Service unavailable' },
            simulation: { success: true, data: {} }
          },
          completed: 3,
          failed: 1
        }
      };

      mockedPost.mockResolvedValue(mockResponse);
      const result = await enrollmentAIApi.batchAnalysis(planId, analysisTypes);

      expect(result.data.completed).toBe(3);
      expect(result.data.failed).toBe(1);
      expect(result.data.results.optimization.success).toBe(false);
    });
  });

  describe('exportReport', () => {
    it('should export AI report with default format', async () => {
      const planId = 1;
      const mockResponse = {
        success: true,
        data: {
          planId,
          format: 'json',
          downloadUrl: '/api/enrollment-ai/plan/1/report.json',
          expiresAt: '2024-09-02T10:00:00'
        }
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await enrollmentAIApi.exportReport(planId);

      expect(mockedGet).toHaveBeenCalledWith('/enrollment-ai/plan/1/export-ai-report?format=json');
      expect(result).toEqual(mockResponse);
    });

    it('should export AI report with custom format', async () => {
      const planId = 1;
      const format = 'pdf';
      const mockResponse = {
        success: true,
        data: {
          planId,
          format,
          downloadUrl: '/api/enrollment-ai/plan/1/report.pdf'
        }
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await enrollmentAIApi.exportReport(planId, format);

      expect(mockedGet).toHaveBeenCalledWith(`/enrollment-ai/plan/1/export-ai-report?format=${format}`);
      expect(result.data.format).toBe(format);
    });
  });

  describe('checkStatus', () => {
    it('should check AI service status', async () => {
      const mockResponse = {
        success: true,
        data: {
          status: 'healthy',
          services: {
            forecast: 'available',
            strategy: 'available',
            optimization: 'maintenance',
            simulation: 'available'
          },
          lastCheck: '2024-09-01T10:00:00',
          uptime: 99.5
        }
      };

      mockedGet.mockResolvedValue(mockResponse);
      const result = await enrollmentAIApi.checkStatus();

      expect(mockedGet).toHaveBeenCalledWith('/enrollment-ai/ai-status');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const errorMessage = 'AI Service Unavailable';
      mockedPost.mockRejectedValue(new Error(errorMessage));

      await expect(enrollmentAIApi.generateSmartPlanning(1)).rejects.toThrow(errorMessage);
    });

    it('should handle service maintenance status', async () => {
      const mockResponse = {
        success: false,
        message: 'AI service is under maintenance',
        error: 'SERVICE_MAINTENANCE'
      };

      mockedPost.mockResolvedValue(mockResponse);
      const result = await enrollmentAIApi.generateSmartPlanning(1);

      expect(result.success).toBe(false);
      expect(result.message).toContain('maintenance');
    });

    it('should handle invalid parameters', async () => {
      const mockResponse = {
        success: false,
        message: 'Invalid timeframe parameter',
        error: 'INVALID_PARAMETER'
      };

      mockedPost.mockResolvedValue(mockResponse);
      const result = await enrollmentAIApi.generateForecast(1, { timeframe: 'invalid' as any });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_PARAMETER');
    });

    it('should handle rate limiting', async () => {
      const mockResponse = {
        success: false,
        message: 'Rate limit exceeded',
        error: 'RATE_LIMITED',
        retryAfter: 60
      };

      mockedPost.mockResolvedValue(mockResponse);
      const result = await enrollmentAIApi.generateStrategy(1, { objectives: {} });

      expect(result.success).toBe(false);
      expect(result.error).toBe('RATE_LIMITED');
      expect(result.retryAfter).toBe(60);
    });
  });

  describe('Parameter Validation', () => {
    it('should validate required parameters', async () => {
      const mockResponse = {
        success: false,
        message: 'Plan ID is required',
        error: 'MISSING_PARAMETER'
      };

      mockedPost.mockResolvedValue(mockResponse);
      
      // Test with invalid plan ID
      const result = await enrollmentAIApi.generateSmartPlanning(0);
      expect(result.success).toBe(false);
    });

    it('should validate parameter types', async () => {
      const mockResponse = {
        success: false,
        message: 'Invalid parameter type',
        error: 'INVALID_TYPE'
      };

      mockedPost.mockResolvedValue(mockResponse);
      
      // Test with invalid timeframe
      const result = await enrollmentAIApi.generateForecast(1, { timeframe: 'invalid' as any });
      expect(result.success).toBe(false);
    });
  });

  describe('Response Data Validation', () => {
    it('should validate forecast response structure', async () => {
      const mockResponse = {
        success: true,
        data: {
          planId: 1,
          timeframe: '6months',
          forecast: [
            { month: '2024-10', predicted: 45, confidence: 0.85 }
          ],
          totalPredicted: 280,
          averageConfidence: 0.78
        }
      };

      mockedPost.mockResolvedValue(mockResponse);
      const result = await enrollmentAIApi.generateForecast(1, { timeframe: '6months' });

      expect(result.data).toHaveProperty('planId');
      expect(result.data).toHaveProperty('timeframe');
      expect(result.data).toHaveProperty('forecast');
      expect(result.data).toHaveProperty('totalPredicted');
      expect(result.data).toHaveProperty('averageConfidence');
      expect(Array.isArray(result.data.forecast)).toBe(true);
      expect(typeof result.data.totalPredicted).toBe('number');
      expect(typeof result.data.averageConfidence).toBe('number');
    });

    it('should validate strategy response structure', async () => {
      const mockResponse = {
        success: true,
        data: {
          planId: 1,
          strategies: [
            {
              name: 'Test Strategy',
              description: 'Test description',
              budget: 10000,
              expectedROI: 1.5
            }
          ],
          totalBudget: 10000,
          expectedOverallROI: 1.5
        }
      };

      mockedPost.mockResolvedValue(mockResponse);
      const result = await enrollmentAIApi.generateStrategy(1, { objectives: {} });

      expect(result.data).toHaveProperty('strategies');
      expect(result.data).toHaveProperty('totalBudget');
      expect(result.data).toHaveProperty('expectedOverallROI');
      expect(Array.isArray(result.data.strategies)).toBe(true);
      expect(result.data.strategies[0]).toHaveProperty('name');
      expect(result.data.strategies[0]).toHaveProperty('budget');
      expect(result.data.strategies[0]).toHaveProperty('expectedROI');
    });
  });
});