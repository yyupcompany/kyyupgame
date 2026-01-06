import axios from 'axios';

// 不mock axios，进行真实的网络测试
describe('AI Expert System Diagnosis Tests', () => {
  // 直接使用fallback配置，避免数据库依赖
  const testModel = {
    id: 45,
    name: 'doubao-seed-1-6-thinking-250615',
    displayName: 'Doubao 1.6 Thinking (推理增强版)',
    provider: 'bytedance_doubao',
    modelType: 'text',
    endpointUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    apiKey: '1c155dc7-0cec-441b-9b00-0fb8ccc16089',
    modelParameters: {
      temperature: 0.7,
      maxTokens: 4096,
      topP: 0.9
    },
    status: 'active',
    isDefault: true,
    isActive: true,
    capabilities: ['text', 'tool_calling']
  };

  describe('Network Connectivity Tests', () => {
    test('应该能够连接到豆包API端点', async () => {
      const endpoint = 'https://ark.cn-beijing.volces.com';
      
      try {
        const response = await axios.get(endpoint, {
          timeout: 10000,
          validateStatus: () => true // 接受所有状态码
        });
        
        console.log(`豆包API端点连接状态: ${response.status}`);
        console.log(`响应头:`, response.headers);
        
        // 即使返回错误状态码，只要能连接就算成功
        expect(response.status).toBeDefined();
      } catch (error: any) {
        console.error('豆包API端点连接失败:', error.message);
        console.error('错误代码:', error.code);
        
        if (error.code === 'ENOTFOUND') {
          throw new Error('DNS解析失败 - 请检查网络连接');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('连接超时 - 请检查网络速度');
        } else if (error.code === 'ECONNREFUSED') {
          throw new Error('连接被拒绝 - 服务器可能不可用');
        } else {
          throw error;
        }
      }
    }, 15000);

    test('应该能够验证API密钥格式', async () => {
      const model = testModel;

      expect(model).toBeDefined();
      expect(model.apiKey).toBeDefined();
      expect(typeof model.apiKey).toBe('string');
      expect(model.apiKey.length).toBeGreaterThan(0);

      console.log('API密钥格式:', model.apiKey.substring(0, 8) + '...');
      console.log('API端点:', model.endpointUrl);

      // 验证API密钥格式（豆包API密钥通常是UUID格式）
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(model.apiKey).toMatch(uuidRegex);
    });

    test('应该能够测试真实的API调用', async () => {
      const model = testModel;

      if (!model) {
        throw new Error('模型配置未找到');
      }

      const testMessage = {
        model: model.name,
        messages: [
          {
            role: 'user',
            content: '请简单回答：你好'
          }
        ],
        max_tokens: 50,
        temperature: 0.7
      };

      console.log('发送测试请求到:', model.endpointUrl);
      console.log('请求数据:', JSON.stringify(testMessage, null, 2));

      try {
        const startTime = Date.now();
        const response = await axios.post(model.endpointUrl, testMessage, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${model.apiKey}`
          },
          timeout: 30000 // 30秒超时
        });
        const endTime = Date.now();

        console.log(`API调用成功，耗时: ${endTime - startTime}ms`);
        console.log('响应状态:', response.status);
        console.log('响应数据:', JSON.stringify(response.data, null, 2));

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
        expect(response.data.choices).toBeDefined();
        expect(Array.isArray(response.data.choices)).toBe(true);
        
        if (response.data.choices.length > 0) {
          expect(response.data.choices[0].message).toBeDefined();
          expect(response.data.choices[0].message.content).toBeDefined();
          console.log('AI回复:', response.data.choices[0].message.content);
        }

      } catch (error: any) {
        console.error('API调用失败:', error.message);
        console.error('错误代码:', error.code);
        console.error('响应状态:', error.response?.status);
        console.error('响应数据:', error.response?.data);

        if (error.response) {
          // 服务器返回了错误响应
          const status = error.response.status;
          const data = error.response.data;
          
          if (status === 401) {
            throw new Error(`API密钥无效 (401): ${JSON.stringify(data)}`);
          } else if (status === 403) {
            throw new Error(`API访问被禁止 (403): ${JSON.stringify(data)}`);
          } else if (status === 429) {
            throw new Error(`API调用频率限制 (429): ${JSON.stringify(data)}`);
          } else if (status >= 500) {
            throw new Error(`服务器内部错误 (${status}): ${JSON.stringify(data)}`);
          } else {
            throw new Error(`API调用失败 (${status}): ${JSON.stringify(data)}`);
          }
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('API调用超时 - 请检查网络连接或增加超时时间');
        } else if (error.code === 'ENOTFOUND') {
          throw new Error('无法解析API域名 - 请检查DNS设置');
        } else if (error.code === 'ECONNREFUSED') {
          throw new Error('API服务器拒绝连接');
        } else {
          throw error;
        }
      }
    }, 45000); // 45秒超时

    test('应该能够测试专家工具调用', async () => {
      const model = testModel;

      if (!model) {
        throw new Error('模型配置未找到');
      }

      // 测试带工具调用的请求
      const testMessage = {
        model: model.name,
        messages: [
          {
            role: 'system',
            content: '你是一个智能助手，可以调用专家工具来回答问题。'
          },
          {
            role: 'user',
            content: '我需要制定一个秋季招生活动方案，请调用营销专家帮我分析。'
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
                    enum: ['marketing_expert']
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
        max_tokens: 1000,
        temperature: 0.7
      };

      console.log('发送工具调用测试请求...');

      try {
        const startTime = Date.now();
        const response = await axios.post(model.endpointUrl, testMessage, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${model.apiKey}`
          },
          timeout: 60000 // 60秒超时
        });
        const endTime = Date.now();

        console.log(`工具调用测试成功，耗时: ${endTime - startTime}ms`);
        console.log('响应状态:', response.status);
        console.log('响应数据:', JSON.stringify(response.data, null, 2));

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
        expect(response.data.choices).toBeDefined();
        
        const choice = response.data.choices[0];
        if (choice?.message?.tool_calls) {
          console.log('检测到工具调用:', choice.message.tool_calls);
          expect(Array.isArray(choice.message.tool_calls)).toBe(true);
          expect(choice.message.tool_calls.length).toBeGreaterThan(0);
          
          const toolCall = choice.message.tool_calls[0];
          expect(toolCall.function).toBeDefined();
          expect(toolCall.function.name).toBe('call_expert');
          expect(toolCall.function.arguments).toBeDefined();
          
          console.log('工具调用参数:', toolCall.function.arguments);
        } else {
          console.log('未检测到工具调用，AI直接回复:', choice?.message?.content);
        }

      } catch (error: any) {
        console.error('工具调用测试失败:', error.message);
        console.error('错误详情:', error.response?.data || error);
        throw error;
      }
    }, 75000); // 75秒超时
  });

  describe('Configuration Tests', () => {
    test('应该能够检查模型配置', async () => {
      const model = testModel;

      console.log('模型配置:', {
        name: model.name,
        provider: model.provider,
        endpointUrl: model.endpointUrl,
        apiKeyPrefix: model.apiKey.substring(0, 8) + '...',
        capabilities: model.capabilities
      });

      expect(model.name).toBe('doubao-seed-1-6-thinking-250615');
      expect(model.provider).toBe('bytedance_doubao');
      expect(model.endpointUrl).toBe('https://ark.cn-beijing.volces.com/api/v3/chat/completions');
      expect(model.capabilities).toContain('tool_calling');
    });
  });
});
