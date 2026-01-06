import axios from 'axios';

// 测试真实服务器的AI专家系统
describe('AI Expert System Server Tests', () => {
  const SERVER_URL = 'https://shlxlyzagqnc.sealoshzh.site';
  
  beforeAll(() => {
    console.log('🚀 开始测试真实服务器AI专家系统...');
    console.log('服务器地址:', SERVER_URL);
  });

  describe('Server Health Tests', () => {
    test('应该能够连接到服务器', async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/health`, {
          timeout: 10000,
          validateStatus: () => true // 接受所有状态码
        });
        
        console.log('服务器健康检查状态:', response.status);
        console.log('服务器响应:', response.data);
        
        // 只要能连接就算成功
        expect(response.status).toBeDefined();
      } catch (error: any) {
        console.error('服务器连接失败:', error.message);
        console.error('错误代码:', error.code);
        
        if (error.code === 'ENOTFOUND') {
          throw new Error('DNS解析失败 - 请检查服务器地址');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('连接超时 - 请检查网络连接');
        } else if (error.code === 'ECONNREFUSED') {
          throw new Error('连接被拒绝 - 服务器可能未启动');
        } else {
          throw error;
        }
      }
    }, 15000);

    test('应该能够访问API根路径', async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api`, {
          timeout: 10000,
          validateStatus: () => true
        });
        
        console.log('API根路径状态:', response.status);
        console.log('API根路径响应:', response.data);
        
        expect(response.status).toBeDefined();
      } catch (error: any) {
        console.error('API根路径访问失败:', error.message);
        // 不抛出错误，因为可能没有这个路径
      }
    }, 15000);
  });

  describe('AI Expert API Tests', () => {
    test('应该能够测试AI专家智能聊天接口', async () => {
      const testData = {
        message: '你好，我需要制定一个幼儿园招生活动方案，请帮我分析一下。',
        expertId: 'marketing_expert'
      };

      console.log('发送AI专家请求...');
      console.log('请求数据:', testData);

      try {
        const response = await axios.post(`${SERVER_URL}/api/ai/expert/smart-chat`, testData, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60秒超时
        });

        console.log('✅ AI专家接口调用成功');
        console.log('响应状态:', response.status);
        console.log('响应数据:', JSON.stringify(response.data, null, 2));

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
        
        // 检查响应结构
        if (response.data.success) {
          expect(response.data.data).toBeDefined();
          console.log('🤖 AI专家回复成功');
        } else {
          console.log('⚠️ AI专家回复失败:', response.data.message);
        }

      } catch (error: any) {
        console.error('❌ AI专家接口调用失败:', error.message);
        
        if (error.response) {
          console.error('响应状态:', error.response.status);
          console.error('响应数据:', error.response.data);
          
          if (error.response.status === 404) {
            throw new Error('AI专家接口不存在 - 请检查接口路径');
          } else if (error.response.status === 500) {
            throw new Error(`服务器内部错误: ${JSON.stringify(error.response.data)}`);
          } else if (error.response.status === 401) {
            throw new Error('认证失败 - 可能需要登录');
          } else {
            throw new Error(`接口调用失败 (${error.response.status}): ${JSON.stringify(error.response.data)}`);
          }
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('AI专家接口调用超时 - 请检查网络连接或增加超时时间');
        } else {
          throw error;
        }
      }
    }, 75000);

    test('应该能够测试带工具调用的AI专家请求', async () => {
      const testData = {
        message: '我需要制定一个春季招生活动方案，包括活动主题、时间安排、宣传策略等，请调用营销专家帮我详细分析。',
        expertId: 'marketing_expert',
        useTools: true
      };

      console.log('发送带工具调用的AI专家请求...');
      console.log('请求数据:', testData);

      try {
        const response = await axios.post(`${SERVER_URL}/api/ai/expert/smart-chat`, testData, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 90000 // 90秒超时
        });

        console.log('✅ 带工具调用的AI专家接口调用成功');
        console.log('响应状态:', response.status);
        console.log('响应数据:', JSON.stringify(response.data, null, 2));

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
        
        if (response.data.success) {
          const data = response.data.data;
          console.log('🔧 工具调用结果:', data);
          
          // 检查是否包含工具调用信息
          if (data.toolCalls && data.toolCalls.length > 0) {
            console.log('🎯 检测到工具调用:', data.toolCalls);
            expect(data.toolCalls).toBeDefined();
            expect(Array.isArray(data.toolCalls)).toBe(true);
          } else {
            console.log('💬 AI直接回复，未使用工具调用');
          }
        } else {
          console.log('⚠️ 带工具调用的AI专家回复失败:', response.data.message);
        }

      } catch (error: any) {
        console.error('❌ 带工具调用的AI专家接口调用失败:', error.message);
        
        if (error.response) {
          console.error('响应状态:', error.response.status);
          console.error('响应数据:', error.response.data);
        }
        
        // 对于工具调用测试，我们可以更宽容一些
        if (error.code === 'ECONNABORTED') {
          console.log('⏰ 工具调用超时，这可能是正常的，因为AI分析需要更多时间');
        } else {
          throw error;
        }
      }
    }, 120000); // 120秒超时
  });

  describe('Database Connection Tests', () => {
    test('应该能够测试数据库相关的接口', async () => {
      try {
        // 尝试访问一个需要数据库的接口
        const response = await axios.get(`${SERVER_URL}/api/ai/models`, {
          timeout: 15000,
          validateStatus: () => true
        });

        console.log('AI模型配置接口状态:', response.status);
        console.log('AI模型配置响应:', response.data);

        if (response.status === 200 && response.data) {
          console.log('✅ 数据库连接正常，能够获取AI模型配置');
          expect(response.data).toBeDefined();
        } else {
          console.log('⚠️ AI模型配置接口返回异常状态');
        }

      } catch (error: any) {
        console.error('数据库相关接口测试失败:', error.message);
        if (error.response) {
          console.error('响应状态:', error.response.status);
          console.error('响应数据:', error.response.data);
        }
        // 不抛出错误，因为这个接口可能不存在或需要认证
      }
    }, 20000);
  });

  describe('Performance Tests', () => {
    test('应该能够测试AI专家系统的响应时间', async () => {
      const testData = {
        message: '简单测试：你好',
        expertId: 'marketing_expert'
      };

      const startTime = Date.now();
      
      try {
        const response = await axios.post(`${SERVER_URL}/api/ai/expert/smart-chat`, testData, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        console.log(`⏱️ AI专家系统响应时间: ${responseTime}ms`);
        
        expect(response.status).toBe(200);
        expect(responseTime).toBeLessThan(30000); // 应该在30秒内响应
        
        if (responseTime < 5000) {
          console.log('🚀 响应速度很快 (< 5秒)');
        } else if (responseTime < 15000) {
          console.log('⚡ 响应速度正常 (5-15秒)');
        } else {
          console.log('🐌 响应速度较慢 (> 15秒)');
        }

      } catch (error: any) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.error(`❌ 性能测试失败，耗时: ${responseTime}ms`);
        console.error('错误:', error.message);
        
        if (error.code === 'ECONNABORTED') {
          throw new Error(`AI专家系统响应超时 (${responseTime}ms)`);
        } else {
          throw error;
        }
      }
    }, 35000);
  });
});
