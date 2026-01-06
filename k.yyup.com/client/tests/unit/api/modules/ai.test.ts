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
import * as aiApi from '@/api/modules/ai';
import { get, post, put, del } from '@/utils/request';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';

// Mock the request module
vi.mock('@/utils/request', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}));

const mockedGet = vi.mocked(get);
const mockedPost = vi.mocked(post);
const mockedPut = vi.mocked(put);
const mockedDel = vi.mocked(del);

describe('AI API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Conversation Management', () => {
    describe('getConversations', () => {
      it('should get conversations with parameters', async () => {
        const mockParams = {
          type: 'enrollment',
          page: 1,
          pageSize: 10
        };
        const mockResponse = {
          success: true,
          data: {
            items: [
              {
                id: 'conv-123',
                title: 'Enrollment Planning',
                type: 'enrollment',
                messages: [],
                createdAt: '2024-01-01T10:00:00Z',
                updatedAt: '2024-01-01T10:00:00Z'
              }
            ],
            total: 1
          }
        };

        mockedGet.mockResolvedValue(mockResponse);

        const result = await aiApi.aiApi.getConversations(mockParams);

        expect(mockedGet).toHaveBeenCalledWith('/ai/conversations', { params: mockParams });
        expect(result).toEqual(mockResponse);

        // ✅ 控制台错误检查
        expectNoConsoleErrors();
      });

      it('should get conversations without parameters', async () => {
        const mockResponse = { success: true, data: { items: [], total: 0 } };
        mockedGet.mockResolvedValue(mockResponse);

        await aiApi.aiApi.getConversations();

        expect(mockedGet).toHaveBeenCalledWith('/ai/conversations', { params: undefined });
      });
    });

    describe('createConversation', () => {
      it('should create conversation', async () => {
        const mockData = {
          title: 'New Conversation',
          type: 'enrollment'
        };
        const mockResponse = {
          success: true,
          data: {
            id: 'conv-123',
            title: 'New Conversation',
            type: 'enrollment',
            messages: [],
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-01T10:00:00Z'
          }
        };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiApi.aiApi.createConversation(mockData);

        expect(mockedPost).toHaveBeenCalledWith('/ai/conversations', mockData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getConversation', () => {
      it('should get conversation by id', async () => {
        const mockResponse = {
          success: true,
          data: {
            id: 'conv-123',
            title: 'Test Conversation',
            type: 'enrollment',
            messages: [
              {
                id: 'msg-1',
                role: 'user',
                content: 'Hello',
                timestamp: '2024-01-01T10:00:00Z'
              },
              {
                id: 'msg-2',
                role: 'assistant',
                content: 'Hi there!',
                timestamp: '2024-01-01T10:01:00Z'
              }
            ],
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-01T10:01:00Z'
          }
        };

        mockedGet.mockResolvedValue(mockResponse);

        const result = await aiApi.aiApi.getConversation('conv-123');

        expect(mockedGet).toHaveBeenCalledWith('/ai/conversations/conv-123');
        expect(result).toEqual(mockResponse);
      });
    });

    describe('sendMessage', () => {
      it('should send message to conversation', async () => {
        const mockData = {
          content: 'Help me with enrollment planning',
          context: {
            currentPlan: 'Spring 2024',
            targetEnrollment: 50
          }
        };
        const mockResponse = {
          success: true,
          data: {
            id: 'msg-3',
            role: 'assistant',
            content: 'I\'ll help you with enrollment planning...',
            timestamp: '2024-01-01T10:02:00Z'
          }
        };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiApi.aiApi.sendMessage('conv-123', mockData);

        expect(mockedPost).toHaveBeenCalledWith('/ai/conversations/conv-123/messages', mockData);
        expect(result).toEqual(mockResponse);
      });

      it('should send message without context', async () => {
        const mockData = { content: 'Hello' };
        const mockResponse = { success: true, data: {} };
        mockedPost.mockResolvedValue(mockResponse);

        await aiApi.aiApi.sendMessage('conv-123', mockData);

        expect(mockedPost).toHaveBeenCalledWith('/ai/conversations/conv-123/messages', mockData);
      });
    });

    describe('deleteConversation', () => {
      it('should delete conversation', async () => {
        const mockResponse = { success: true, data: null };

        mockedDel.mockResolvedValue(mockResponse);

        const result = await aiApi.aiApi.deleteConversation('conv-123');

        expect(mockedDel).toHaveBeenCalledWith('/ai/conversations/conv-123');
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Model Configuration Management', () => {
    describe('getModelConfigs', () => {
      it('should get model configurations', async () => {
        const mockResponse = {
          success: true,
          data: [
            {
              id: 'model-1',
              name: 'GPT-4',
              provider: 'OpenAI',
              model: 'gpt-4',
              temperature: 0.7,
              maxTokens: 2000,
              isActive: true
            },
            {
              id: 'model-2',
              name: 'Claude-3',
              provider: 'Anthropic',
              model: 'claude-3-sonnet',
              temperature: 0.5,
              maxTokens: 1500,
              isActive: false
            }
          ]
        };

        mockedGet.mockResolvedValue(mockResponse);

        const result = await aiApi.aiApi.getModelConfigs();

        expect(mockedGet).toHaveBeenCalledWith('/ai/models');
        expect(result).toEqual(mockResponse);
      });
    });

    describe('createModelConfig', () => {
      it('should create model configuration', async () => {
        const mockData = {
          name: 'New Model',
          provider: 'OpenAI',
          model: 'gpt-3.5-turbo',
          apiKey: 'sk-test',
          baseUrl: 'https://api.openai.com/v1',
          temperature: 0.7,
          maxTokens: 1500,
          isActive: true
        };
        const mockResponse = {
          success: true,
          data: {
            id: 'model-3',
            ...mockData
          }
        };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiApi.aiApi.createModelConfig(mockData);

        expect(mockedPost).toHaveBeenCalledWith('/ai/models', mockData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('updateModelConfig', () => {
      it('should update model configuration', async () => {
        const mockData = {
          name: 'Updated Model Name',
          temperature: 0.8,
          isActive: false
        };
        const mockResponse = {
          success: true,
          data: {
            id: 'model-1',
            name: 'Updated Model Name',
            provider: 'OpenAI',
            model: 'gpt-4',
            temperature: 0.8,
            maxTokens: 2000,
            isActive: false
          }
        };

        mockedPut.mockResolvedValue(mockResponse);

        const result = await aiApi.aiApi.updateModelConfig('model-1', mockData);

        expect(mockedPut).toHaveBeenCalledWith('/ai/models/model-1', mockData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('deleteModelConfig', () => {
      it('should delete model configuration', async () => {
        const mockResponse = { success: true, data: null };

        mockedDel.mockResolvedValue(mockResponse);

        const result = await aiApi.aiApi.deleteModelConfig('model-1');

        expect(mockedDel).toHaveBeenCalledWith('/ai/models/model-1');
        expect(result).toEqual(mockResponse);
      });
    });

    describe('testModelConnection', () => {
      it('should test model connection', async () => {
        const mockResponse = {
          success: true,
          data: {
            success: true,
            message: 'Connection successful',
            latency: 250
          }
        };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiApi.aiApi.testModelConnection('model-1');

        expect(mockedPost).toHaveBeenCalledWith('/ai/models/model-1/test');
        expect(result).toEqual(mockResponse);
      });

      it('should handle failed connection test', async () => {
        const mockResponse = {
          success: true,
          data: {
            success: false,
            message: 'Connection failed: Invalid API key',
            latency: 5000
          }
        };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiApi.aiApi.testModelConnection('model-1');

        expect(mockedPost).toHaveBeenCalledWith('/ai/models/model-1/test');
        expect(result.data.success).toBe(false);
      });
    });
  });

  describe('Analysis Management', () => {
    describe('getAnalysisResults', () => {
      it('should get analysis results with parameters', async () => {
        const mockParams = {
          type: 'enrollment_prediction',
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        };
        const mockResponse = {
          success: true,
          data: [
            {
              type: 'enrollment_prediction',
              data: {
                predictedEnrollment: 180,
                confidence: 0.85,
                factors: {
                  demographic: 0.6,
                  economic: 0.3,
                  competitive: 0.1
                }
              },
              insights: [
                'Enrollment expected to increase by 15%',
                'Demographic factors are the main driver'
              ],
              recommendations: [
                'Increase marketing efforts in target demographics',
                'Monitor economic indicators closely'
              ],
              confidence: 0.85,
              generatedAt: '2024-01-01T10:00:00Z'
            }
          ]
        };

        mockedGet.mockResolvedValue(mockResponse);

        const result = await aiApi.aiApi.getAnalysisResults(mockParams);

        expect(mockedGet).toHaveBeenCalledWith('/ai/analysis', { params: mockParams });
        expect(result).toEqual(mockResponse);
      });

      it('should get all analysis results without parameters', async () => {
        const mockResponse = { success: true, data: [] };
        mockedGet.mockResolvedValue(mockResponse);

        await aiApi.aiApi.getAnalysisResults();

        expect(mockedGet).toHaveBeenCalledWith('/ai/analysis', { params: undefined });
      });
    });

    describe('generateAnalysis', () => {
      it('should generate enrollment prediction analysis', async () => {
        const mockData = {
          type: 'enrollment_prediction',
          parameters: {
            timeHorizon: '6months',
            includeExternalFactors: true,
            historicalData: {
              lastYearEnrollment: 150,
              growthRate: 0.15
            }
          }
        };
        const mockResponse = {
          success: true,
          data: {
            type: 'enrollment_prediction',
            data: {
              predictedEnrollment: 173,
              confidence: 0.88,
              timeHorizon: '6months'
            },
            insights: [
              'Expected enrollment: 173 students',
              'Confidence level: 88%'
            ],
            recommendations: [
              'Prepare for 15% increase in enrollment',
              'Consider additional staffing needs'
            ],
            confidence: 0.88,
            generatedAt: '2024-01-01T10:00:00Z'
          }
        };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiApi.aiApi.generateAnalysis(mockData);

        expect(mockedPost).toHaveBeenCalledWith('/ai/analysis', mockData);
        expect(result).toEqual(mockResponse);
      });

      it('should generate student performance analysis', async () => {
        const mockData = {
          type: 'student_performance',
          parameters: {
            classIds: [1, 2, 3],
            timeRange: 'semester',
            includeComparativeAnalysis: true
          }
        };
        const mockResponse = {
          success: true,
          data: {
            type: 'student_performance',
            data: {
              averagePerformance: 85.5,
              topPerformers: [1, 5, 8],
              improvementAreas: ['math', 'language']
            },
            insights: [
              'Overall performance is above average',
              'Math skills need improvement'
            ],
            recommendations: [
              'Implement additional math support',
              'Provide advanced materials for top performers'
            ],
            confidence: 0.92,
            generatedAt: '2024-01-01T10:00:00Z'
          }
        };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiApi.aiApi.generateAnalysis(mockData);

        expect(mockedPost).toHaveBeenCalledWith('/ai/analysis', mockData);
        expect(result).toEqual(mockResponse);
      });

      it('should generate revenue forecast analysis', async () => {
        const mockData = {
          type: 'revenue_forecast',
          parameters: {
            forecastPeriod: '12months',
            includeSeasonalTrends: true,
            economicFactors: ['inflation', 'employment']
          }
        };
        const mockResponse = {
          success: true,
          data: {
            type: 'revenue_forecast',
            data: {
              projectedRevenue: 2500000,
              confidence: 0.82,
              seasonalVariation: 0.15
            },
            insights: [
              'Projected revenue: $2.5M',
              'Seasonal variation expected: 15%'
            ],
            recommendations: [
              'Plan for seasonal cash flow variations',
              'Consider diversifying revenue streams'
            ],
            confidence: 0.82,
            generatedAt: '2024-01-01T10:00:00Z'
          }
        };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiApi.aiApi.generateAnalysis(mockData);

        expect(mockedPost).toHaveBeenCalledWith('/ai/analysis', mockData);
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Compatibility Exports', () => {
    it('should export compatibility functions', () => {
      expect(aiApi.getAIConversations).toBe(aiApi.aiApi.getConversations);
      expect(aiApi.createAIConversation).toBe(aiApi.aiApi.createConversation);
      expect(aiApi.sendAIMessage).toBe(aiApi.aiApi.sendMessage);
      expect(aiApi.getAIModelConfigs).toBe(aiApi.aiApi.getModelConfigs);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const mockError = new Error('Network error');
      mockedGet.mockRejectedValue(mockError);

      await expect(aiApi.aiApi.getConversations())
        .rejects.toThrow('Network error');
    });

    it('should handle API response errors', async () => {
      const mockErrorResponse = {
        success: false,
        message: 'Invalid conversation ID',
        data: null
      };
      mockedGet.mockResolvedValue(mockErrorResponse);

      const result = await aiApi.aiApi.getConversation('invalid-id');
      expect(result).toEqual(mockErrorResponse);
    });

    it('should handle empty responses', async () => {
      const mockResponse = { success: true, data: null };
      mockedGet.mockResolvedValue(mockResponse);

      const result = await aiApi.aiApi.getConversations();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Data Validation', () => {
    it('should validate conversation creation data', async () => {
      const mockData = {
        title: '',
        type: 'invalid_type'
      };
      const mockResponse = {
        success: false,
        message: 'Invalid conversation data',
        data: null
      };

      mockedPost.mockResolvedValue(mockResponse);

      const result = await aiApi.aiApi.createConversation(mockData);
      expect(result.success).toBe(false);
    });

    it('should validate message data', async () => {
      const mockData = {
        content: '',
        context: {}
      };
      const mockResponse = {
        success: false,
        message: 'Message content cannot be empty',
        data: null
      };

      mockedPost.mockResolvedValue(mockResponse);

      const result = await aiApi.aiApi.sendMessage('conv-123', mockData);
      expect(result.success).toBe(false);
    });

    it('should validate model configuration data', async () => {
      const mockData = {
        name: '',
        provider: '',
        model: '',
        temperature: 2.5, // Invalid temperature
        maxTokens: -1 // Invalid max tokens
      };
      const mockResponse = {
        success: false,
        message: 'Invalid model configuration',
        data: null
      };

      mockedPost.mockResolvedValue(mockResponse);

      const result = await aiApi.aiApi.createModelConfig(mockData);
      expect(result.success).toBe(false);
    });
  });
});