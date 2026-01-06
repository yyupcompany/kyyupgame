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

describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { vi } from 'vitest'
import axios from 'axios';
import { IntelligentExpertConsultationService } from '../src/services/ai/intelligent-expert-consultation.service';
import { AIModelCacheService } from '../src/services/ai-model-cache.service';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock AIModelCacheService
jest.mock('../src/services/ai-model-cache.service');

describe('专家咨询服务超时问题诊断', () => {
  let expertService: IntelligentExpertConsultationService;
  let mockModelCacheService: jest.Mocked<AIModelCacheService>;

  beforeAll(() => {
    // 设置模拟的模型缓存服务
    mockModelCacheService = {
      getModelByName: jest.fn(),
      getInstance: jest.fn()
    } as any;

    (AIModelCacheService.getInstance as jest.Mock).mockReturnValue(mockModelCacheService);

    // 模拟豆包模型配置
    mockModelCacheService.getModelByName.mockResolvedValue({
      id: 1,
      name: 'doubao-seed-1-6-thinking-250615',
      endpointUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      apiKey: '1c155dc7-0cec-441b-9b00-0fb8ccc16089',
      modelParameters: {
        temperature: 0.7,
        maxTokens: 2000
      }
    });

    expertService = new IntelligentExpertConsultationService();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('网络连接测试', () => {
    it('应该能够成功连接豆包API', async () => {
      // 模拟成功的API响应
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: '测试响应',
              tool_calls: []
            }
          }],
          usage: {
            total_tokens: 100
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const startTime = Date.now();
      
      try {
        await expertService.startIntelligentConsultation(1, '测试问题');
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`✅ API调用成功，耗时: ${duration}ms`);
        expect(duration).toBeLessThan(5000); // 应该在5秒内完成
      } catch (error) {
        console.error('❌ API调用失败:', error);
        throw error;
      }
    });

    it('应该能够处理网络超时', async () => {
      // 模拟网络超时
      const timeoutError = new Error('ECONNABORTED');
      timeoutError.name = 'ECONNABORTED';
      mockedAxios.post.mockRejectedValueOnce(timeoutError);

      const startTime = Date.now();
      
      try {
        await expertService.startIntelligentConsultation(1, '测试超时问题');
      } catch (error: any) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`⏱️ 超时检测，耗时: ${duration}ms`);
        console.log(`❌ 错误类型: ${error.message}`);
        
        expect(error.message).toContain('开始智能专家咨询失败');
        expect(duration).toBeLessThan(25000); // 应该在25秒内超时
      }
    });
  });

  describe('专家调用流程测试', () => {
    it('应该能够正确处理工具调用', async () => {
      // 模拟带有工具调用的API响应
      const mockResponseWithTools = {
        data: {
          choices: [{
            message: {
              content: '正在调用专家...',
              tool_calls: [{
                id: 'call_test',
                type: 'function',
                function: {
                  name: 'consult_recruitment_planner',
                  arguments: JSON.stringify({
                    query: '秋季招生活动策划',
                    context: '需要专业建议'
                  })
                }
              }]
            }
          }],
          usage: {
            total_tokens: 200
          }
        }
      };

      // 模拟专家响应
      const mockExpertResponse = {
        data: {
          choices: [{
            message: {
              content: '专业的招生活动建议...'
            }
          }]
        }
      };

      mockedAxios.post
        .mockResolvedValueOnce(mockResponseWithTools) // 第一次调用：主AI选择专家
        .mockResolvedValueOnce(mockExpertResponse);   // 第二次调用：专家响应

      const startTime = Date.now();
      
      try {
        const result = await expertService.startIntelligentConsultation(1, '我要做秋季招生活动');
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`✅ 专家调用成功，耗时: ${duration}ms`);
        console.log(`📊 调用结果:`, result);
        
        expect(result.expertsCalled).toContain('consult_recruitment_planner');
        expect(duration).toBeLessThan(10000); // 应该在10秒内完成
      } catch (error) {
        console.error('❌ 专家调用失败:', error);
        throw error;
      }
    });

    it('应该能够处理专家调用超时', async () => {
      // 模拟主AI成功，但专家调用超时
      const mockResponseWithTools = {
        data: {
          choices: [{
            message: {
              content: '正在调用专家...',
              tool_calls: [{
                id: 'call_test',
                type: 'function',
                function: {
                  name: 'consult_recruitment_planner',
                  arguments: JSON.stringify({
                    query: '测试超时',
                    context: '专家调用超时测试'
                  })
                }
              }]
            }
          }]
        }
      };

      const timeoutError = new Error('ECONNABORTED');
      timeoutError.name = 'ECONNABORTED';

      mockedAxios.post
        .mockResolvedValueOnce(mockResponseWithTools) // 主AI成功
        .mockRejectedValueOnce(timeoutError);         // 专家调用超时

      const startTime = Date.now();
      
      try {
        const result = await expertService.startIntelligentConsultation(1, '测试专家超时');
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`⚠️ 专家调用超时处理，耗时: ${duration}ms`);
        console.log(`📊 结果:`, result);
        
        // 应该有错误提示但不会完全失败
        expect(result.initialResponse).toContain('暂时不可用');
      } catch (error) {
        console.error('❌ 专家超时处理失败:', error);
        throw error;
      }
    });
  });

  describe('超时配置测试', () => {
    it('应该验证不同超时配置的影响', async () => {
      const timeouts = [5000, 10000, 20000, 30000]; // 5秒、10秒、20秒、30秒
      
      for (const timeout of timeouts) {
        console.log(`🔍 测试超时配置: ${timeout}ms`);
        
        // 模拟延迟响应
        const delayedResponse = new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {
                choices: [{
                  message: {
                    content: `延迟${timeout}ms的响应`,
                    tool_calls: []
                  }
                }]
              }
            });
          }, timeout - 1000); // 比超时时间少1秒
        });

        mockedAxios.post.mockImplementationOnce(() => delayedResponse);

        const startTime = Date.now();
        
        try {
          await expertService.startIntelligentConsultation(1, `测试${timeout}ms超时`);
          const endTime = Date.now();
          const actualDuration = endTime - startTime;
          
          console.log(`✅ ${timeout}ms配置测试成功，实际耗时: ${actualDuration}ms`);
          expect(actualDuration).toBeGreaterThan(timeout - 2000);
          expect(actualDuration).toBeLessThan(timeout + 2000);
        } catch (error) {
          console.error(`❌ ${timeout}ms配置测试失败:`, error);
        }
      }
    });
  });

  describe('真实网络测试', () => {
    it('应该能够进行真实的豆包API调用测试', async () => {
      // 清除所有mock，进行真实网络测试
      jest.clearAllMocks();
      
      const realAxios = jest.requireActual('axios');
      
      const startTime = Date.now();
      
      try {
        const response = await realAxios.post(
          'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
          {
            model: 'doubao-seed-1-6-thinking-250615',
            messages: [
              { role: 'user', content: '你好，这是一个网络连接测试' }
            ],
            temperature: 0.7,
            max_tokens: 50,
            stream: false
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer 1c155dc7-0cec-441b-9b00-0fb8ccc16089'
            },
            timeout: 10000 // 10秒超时
          }
        );
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`✅ 真实网络测试成功，耗时: ${duration}ms`);
        console.log(`📊 响应状态: ${response.status}`);
        console.log(`📝 响应内容: ${response.data.choices[0]?.message?.content}`);
        
        expect(response.status).toBe(200);
        expect(duration).toBeLessThan(10000);
      } catch (error: any) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.error(`❌ 真实网络测试失败，耗时: ${duration}ms`);
        console.error(`🔍 错误详情:`, {
          code: error.code,
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        
        // 分析错误类型
        if (error.code === 'ECONNABORTED') {
          console.log('🔍 诊断结果: 网络连接超时');
        } else if (error.code === 'ENOTFOUND') {
          console.log('🔍 诊断结果: DNS解析失败');
        } else if (error.response?.status === 401) {
          console.log('🔍 诊断结果: API密钥认证失败');
        } else if (error.response?.status >= 500) {
          console.log('🔍 诊断结果: 服务器内部错误');
        } else {
          console.log('🔍 诊断结果: 其他网络问题');
        }
        
        throw error;
      }
    }, 15000); // 设置15秒的测试超时
  });
});
