import axios from 'axios';
import { AIModelCacheService } from '../services/ai-model-cache.service';
import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';

// 真实数据库环境测试
describe('AI Expert System Real Database Tests', () => {
  let modelCacheService: AIModelCacheService;

  beforeAll(async () => {
    // 测试数据库连接
    try {
      await sequelize.authenticate();
      console.log('✅ 数据库连接成功');
    } catch (error) {
      console.error('❌ 数据库连接失败:', error);
      throw error;
    }
  });

  beforeEach(() => {
    modelCacheService = AIModelCacheService.getInstance();
  });

  afterAll(async () => {
    // 关闭数据库连接
    await sequelize.close();
  });

  describe('Database Connection Tests', () => {
    test('应该能够连接到远端MySQL数据库', async () => {
      const result = await sequelize.query('SELECT 1 as test', { type: QueryTypes.SELECT });
      expect(result).toEqual([{ test: 1 }]);
      console.log('✅ MySQL查询测试通过');
    });

    test('应该能够查询ai_model_config表', async () => {
      try {
        const result = await sequelize.query(
          'SELECT COUNT(*) as count FROM ai_model_config', 
          { type: QueryTypes.SELECT }
        );
        console.log('ai_model_config表记录数:', result[0]);
        expect(result[0]).toHaveProperty('count');
      } catch (error) {
        console.error('查询ai_model_config表失败:', error);
        throw error;
      }
    });

    test('应该能够查询豆包模型配置', async () => {
      try {
        const result = await sequelize.query(
          `SELECT * FROM ai_model_config 
           WHERE provider = 'bytedance_doubao' 
           AND status = 'active' 
           ORDER BY is_default DESC, id ASC`,
          { type: QueryTypes.SELECT }
        );
        
        console.log('豆包模型配置查询结果:', result);
        
        if (result.length > 0) {
          const model = result[0] as any;
          expect(model.provider).toBe('bytedance_doubao');
          expect(model.status).toBe('active');
          expect(model.api_key).toBeDefined();
          expect(model.endpoint_url).toBeDefined();
          console.log('✅ 找到豆包模型配置:', {
            id: model.id,
            name: model.name,
            display_name: model.display_name,
            endpoint_url: model.endpoint_url,
            api_key: model.api_key?.substring(0, 8) + '...'
          });
        } else {
          console.log('⚠️ 未找到豆包模型配置，将使用fallback配置');
        }
      } catch (error) {
        console.error('查询豆包模型配置失败:', error);
        throw error;
      }
    });
  });

  describe('AI Model Cache Service Tests', () => {
    test('应该能够初始化模型缓存', async () => {
      await modelCacheService.initializeCache();
      
      const stats = modelCacheService.getCacheStats();
      console.log('模型缓存统计:', stats);
      
      expect(stats.isInitialized).toBe(true);
      expect(stats.modelCount).toBeGreaterThanOrEqual(0);
    });

    test('应该能够获取豆包模型配置', async () => {
      await modelCacheService.initializeCache();
      
      const model = await modelCacheService.getModelByName('doubao-seed-1-6-thinking-250615');
      
      expect(model).toBeDefined();
      expect(model.name).toBe('doubao-seed-1-6-thinking-250615');
      expect(model.apiKey).toBeDefined();
      expect(model.endpointUrl).toBeDefined();
      
      console.log('获取到的模型配置:', {
        name: model.name,
        provider: model.provider,
        endpointUrl: model.endpointUrl,
        apiKeyPrefix: model.apiKey.substring(0, 8) + '...',
        capabilities: model.capabilities
      });
    });

    test('应该能够获取所有可用模型', async () => {
      await modelCacheService.initializeCache();
      
      const models = await modelCacheService.getAvailableModels();
      console.log('可用模型列表:');
      models.forEach(model => {
        console.log(`- ${model.name} (${model.provider}) - ${model.modelType}`);
      });
      
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
    });
  });

  describe('Real API Call Tests', () => {
    test('应该能够进行真实的豆包API调用', async () => {
      await modelCacheService.initializeCache();
      const model = await modelCacheService.getModelByName('doubao-seed-1-6-thinking-250615');
      
      if (!model) {
        throw new Error('未找到豆包模型配置');
      }

      const testMessage = {
        model: model.name,
        messages: [
          {
            role: 'user',
            content: '请简单回答：你好，今天天气怎么样？'
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      };

      console.log('发送真实API请求...');
      console.log('请求数据:', JSON.stringify(testMessage, null, 2));

      try {
        const startTime = Date.now();
        const response = await axios.post(model.endpointUrl, testMessage, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${model.apiKey}`
          },
          timeout: 30000
        });
        const endTime = Date.now();

        console.log(`✅ API调用成功，耗时: ${endTime - startTime}ms`);
        console.log('响应状态:', response.status);
        console.log('响应数据:', JSON.stringify(response.data, null, 2));

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
        expect(response.data.choices).toBeDefined();
        expect(Array.isArray(response.data.choices)).toBe(true);
        
        if (response.data.choices.length > 0) {
          const choice = response.data.choices[0];
          expect(choice.message).toBeDefined();
          expect(choice.message.content).toBeDefined();
          console.log('🤖 AI回复:', choice.message.content);
        }

      } catch (error: any) {
        console.error('❌ API调用失败:', error.message);
        
        if (error.response) {
          console.error('响应状态:', error.response.status);
          console.error('响应数据:', error.response.data);
          
          if (error.response.status === 401) {
            throw new Error(`API密钥无效: ${JSON.stringify(error.response.data)}`);
          } else if (error.response.status === 403) {
            throw new Error(`API访问被禁止: ${JSON.stringify(error.response.data)}`);
          } else if (error.response.status === 429) {
            throw new Error(`API调用频率限制: ${JSON.stringify(error.response.data)}`);
          }
        }
        
        throw error;
      }
    }, 45000);

    test('应该能够进行专家工具调用测试', async () => {
      await modelCacheService.initializeCache();
      const model = await modelCacheService.getModelByName('doubao-seed-1-6-thinking-250615');
      
      if (!model) {
        throw new Error('未找到豆包模型配置');
      }

      const testMessage = {
        model: model.name,
        messages: [
          {
            role: 'system',
            content: '你是一个智能助手，可以调用专家工具来回答问题。'
          },
          {
            role: 'user',
            content: '我需要制定一个幼儿园春季招生活动方案，请调用营销专家帮我分析。'
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'call_expert',
              description: '调用特定专家进行专业分析和建议',
              parameters: {
                type: 'object',
                properties: {
                  expert_id: {
                    type: 'string',
                    description: '专家ID',
                    enum: ['marketing_expert', 'education_expert', 'psychology_expert']
                  },
                  task: {
                    type: 'string',
                    description: '具体任务描述'
                  }
                },
                required: ['expert_id', 'task']
              }
            }
          }
        ],
        tool_choice: 'auto',
        max_tokens: 1500,
        temperature: 0.7
      };

      console.log('发送专家工具调用请求...');

      try {
        const startTime = Date.now();
        const response = await axios.post(model.endpointUrl, testMessage, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${model.apiKey}`
          },
          timeout: 60000
        });
        const endTime = Date.now();

        console.log(`✅ 专家工具调用成功，耗时: ${endTime - startTime}ms`);
        console.log('响应状态:', response.status);

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
        expect(response.data.choices).toBeDefined();
        
        const choice = response.data.choices[0];
        if (choice?.message?.tool_calls) {
          console.log('🔧 检测到工具调用:', choice.message.tool_calls);
          expect(Array.isArray(choice.message.tool_calls)).toBe(true);
          expect(choice.message.tool_calls.length).toBeGreaterThan(0);
          
          const toolCall = choice.message.tool_calls[0];
          expect(toolCall.function).toBeDefined();
          expect(toolCall.function.name).toBe('call_expert');
          expect(toolCall.function.arguments).toBeDefined();
          
          const args = JSON.parse(toolCall.function.arguments);
          console.log('🎯 工具调用参数:', args);
          expect(args.expert_id).toBeDefined();
          expect(args.task).toBeDefined();
        } else {
          console.log('💬 AI直接回复:', choice?.message?.content);
          // 如果没有工具调用，至少应该有文本回复
          expect(choice?.message?.content).toBeDefined();
        }

      } catch (error: any) {
        console.error('❌ 专家工具调用失败:', error.message);
        if (error.response) {
          console.error('响应数据:', error.response.data);
        }
        throw error;
      }
    }, 75000);
  });
});
