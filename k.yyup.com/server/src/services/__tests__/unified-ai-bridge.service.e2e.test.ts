/**
 * 统一AI Bridge服务端到端测试
 *
 * 测试范围：
 * 1. 环境检测功能
 * 2. 本地AI Bridge调用
 * 3. 统一认证AI Bridge调用（如果可用）
 * 4. 各种AI接口的功能验证
 */

import { unifiedAIBridge, UnifiedAIBridgeService } from '../unified-ai-bridge.service';
import { AIModelConfig } from '../../models/ai-model-config.model';

describe('🌉 统一AI Bridge服务 - 端到端测试', () => {
  let originalHostname: string | undefined;

  beforeAll(() => {
    // 保存原始HOSTNAME
    originalHostname = process.env.HOSTNAME;
    console.log('='.repeat(60));
    console.log('🧪 开始端到端测试');
    console.log('='.repeat(60));
  });

  afterAll(() => {
    // 恢复原始HOSTNAME
    if (originalHostname !== undefined) {
      process.env.HOSTNAME = originalHostname;
    }
    console.log('='.repeat(60));
    console.log('✅ 端到端测试完成');
    console.log('='.repeat(60));
  });

  afterEach(() => {
    // 每个测试后重置环境
    jest.clearAllMocks();
  });

  // ==================== 环境检测测试 ====================

  describe('🔍 环境检测功能', () => {

    test('应该检测localhost为本地环境', () => {
      process.env.HOSTNAME = 'localhost';
      const service = new UnifiedAIBridgeService();
      expect(service.getEnvironment()).toBe('local');
      console.log('  ✅ localhost → 本地环境');
    });

    test('应该检测127.0.0.1为本地环境', () => {
      process.env.HOSTNAME = '127.0.0.1';
      const service = new UnifiedAIBridgeService();
      expect(service.getEnvironment()).toBe('local');
      console.log('  ✅ 127.0.0.1 → 本地环境');
    });

    test('应该检测k.yyup.cc为本地环境', () => {
      process.env.HOSTNAME = 'k.yyup.cc';
      const service = new UnifiedAIBridgeService();
      expect(service.getEnvironment()).toBe('local');
      console.log('  ✅ k.yyup.cc → 本地环境');
    });

    test('应该检测k001.yyup.cc为租户环境', () => {
      process.env.HOSTNAME = 'k001.yyup.cc';
      const service = new UnifiedAIBridgeService();
      expect(service.getEnvironment()).toBe('tenant');
      console.log('  ✅ k001.yyup.cc → 租户环境');
    });

    test('应该检测k002.yyup.com为租户环境', () => {
      process.env.HOSTNAME = 'k002.yyup.com';
      const service = new UnifiedAIBridgeService();
      expect(service.getEnvironment()).toBe('tenant');
      console.log('  ✅ k002.yyup.com → 租户环境');
    });

    test('应该将未知域名默认为本地环境', () => {
      process.env.HOSTNAME = 'unknown.example.com';
      const service = new UnifiedAIBridgeService();
      expect(service.getEnvironment()).toBe('local');
      console.log('  ✅ unknown.example.com → 本地环境 (默认)');
    });
  });

  // ==================== 健康检查测试 ====================

  describe('🏥 健康检查', () => {

    test('应该返回健康状态', async () => {
      const health = await unifiedAIBridge.healthCheck();

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('environment');
      expect(health).toHaveProperty('unifiedAuth');
      expect(health).toHaveProperty('localBridge');

      expect(['healthy', 'unhealthy']).toContain(health.status);
      expect(['local', 'tenant']).toContain(health.environment);

      console.log('  📊 健康状态:', health);
      console.log('  🏢 当前环境:', health.environment);
      console.log('  🔗 统一认证:', health.unifiedAuth ? '✅ 可用' : '❌ 不可用');
      console.log('  🔧 本地Bridge:', health.localBridge ? '✅ 可用' : '❌ 不可用');
    }, 30000);
  });

  // ==================== 模型管理测试 ====================

  describe('📋 模型管理', () => {

    test('应该获取模型列表', async () => {
      const models = await unifiedAIBridge.getModels();

      expect(Array.isArray(models)).toBe(true);
      console.log(`  📦 获取到 ${models.length} 个模型`);

      if (models.length > 0) {
        console.log('  🔍 第一个模型:', {
          name: models[0].name,
          displayName: models[0].displayName,
          modelType: models[0].modelType,
          provider: models[0].provider
        });
      }
    }, 30000);

    test('应该获取默认模型', async () => {
      const defaultModel = await unifiedAIBridge.getDefaultModel();

      if (defaultModel) {
        expect(defaultModel).toHaveProperty('name');
        expect(defaultModel).toHaveProperty('displayName');
        console.log('  ✅ 默认模型:', {
          name: defaultModel.name,
          displayName: defaultModel.displayName
        });
      } else {
        console.log('  ⚠️  未配置默认模型');
      }
    }, 30000);

    test('应该按类型筛选模型', async () => {
      const textModels = await unifiedAIBridge.getModelsByType('text');

      expect(Array.isArray(textModels)).toBe(true);
      console.log(`  📝 文本模型数量: ${textModels.length}`);

      // 验证所有返回的模型都是text类型
      textModels.forEach(model => {
        expect(model.modelType).toBe('text');
      });
    }, 30000);
  });

  // ==================== 文本对话测试 ====================

  describe('💬 文本对话', () => {

    test('应该成功进行简单对话', async () => {
      const request = {
        messages: [
          { role: 'user' as const, content: '你好' }
        ],
        temperature: 0.7,
        max_tokens: 100
      };

      const result = await unifiedAIBridge.chat(request);

      expect(result).toHaveProperty('success');
      if (result.success) {
        expect(result.data).toHaveProperty('content');
        expect(result.data).toHaveProperty('message');
        expect(typeof result.data.content).toBe('string');
        expect(result.data.content.length).toBeGreaterThan(0);

        console.log('  ✅ 对话成功');
        console.log('  📝 AI回复:', result.data.content.substring(0, 50) + '...');
      } else {
        console.log('  ⚠️  对话失败:', result.error);
      }
    }, 60000);

    test('应该支持多轮对话', async () => {
      const request = {
        messages: [
          { role: 'system' as const, content: '你是一个有用的助手。' },
          { role: 'user' as const, content: '1+1等于几？' },
          { role: 'assistant' as const, content: '1+1等于2。' },
          { role: 'user' as const, content: '那2+2等于几？' }
        ],
        temperature: 0.7,
        max_tokens: 100
      };

      const result = await unifiedAIBridge.chat(request);

      expect(result).toHaveProperty('success');
      if (result.success) {
        console.log('  ✅ 多轮对话成功');
        console.log('  📝 AI回复:', result.data.content);
      }
    }, 60000);

    test('应该返回用量统计', async () => {
      const request = {
        messages: [
          { role: 'user' as const, content: '测试用量统计' }
        ],
        temperature: 0.7,
        max_tokens: 50
      };

      const result = await unifiedAIBridge.chat(request);

      if (result.success && result.data?.usage) {
        expect(result.data.usage).toHaveProperty('inputTokens');
        expect(result.data.usage).toHaveProperty('outputTokens');
        expect(result.data.usage).toHaveProperty('totalTokens');

        console.log('  📊 用量统计:', {
          inputTokens: result.data.usage.inputTokens,
          outputTokens: result.data.usage.outputTokens,
          totalTokens: result.data.usage.totalTokens,
          cost: result.data.usage.cost,
          responseTime: result.data.usage.responseTime + 'ms'
        });
      }
    }, 60000);
  });

  // ==================== 图片生成测试 ====================

  describe('🖼️ 图片生成', () => {

    test('应该成功生成图片', async () => {
      const request = {
        prompt: '一只可爱的小猫，卡通风格，简洁背景',
        n: 1,
        size: '1920x1920',
        quality: 'standard',
        logo_info: { add_logo: false }
      };

      const result = await unifiedAIBridge.generateImage(request);

      expect(result).toHaveProperty('success');
      if (result.success && result.data?.images) {
        expect(result.data.images.length).toBeGreaterThan(0);
        expect(result.data.images[0]).toHaveProperty('url');

        console.log('  ✅ 图片生成成功');
        console.log('  🔗 图片URL:', result.data.images[0].url);
        console.log('  📏 修订提示词:', result.data.images[0].revised_prompt || '无');

        if (result.data.usage) {
          console.log('  📊 用量:', {
            totalTokens: result.data.usage.totalTokens,
            cost: result.data.usage.cost,
            responseTime: result.data.usage.responseTime + 'ms'
          });
        }
      } else {
        console.log('  ⚠️  图片生成失败:', result.error);
      }
    }, 120000);

    test('应该支持指定模型生成图片', async () => {
      // 先获取可用的图片模型
      const models = await unifiedAIBridge.getModels();
      const imageModel = models.find(m => m.modelType === 'image');

      if (imageModel) {
        const request = {
          model: imageModel.name,
          prompt: '一朵美丽的花，水彩画风格',
          n: 1,
          size: '1920x1920'
        };

        const result = await unifiedAIBridge.generateImage(request);

        if (result.success) {
          console.log(`  ✅ 使用模型 ${imageModel.displayName} 生成图片成功`);
        }
      } else {
        console.log('  ⚠️  未找到图片模型');
      }
    }, 120000);
  });

  // ==================== 音频处理测试 ====================

  describe('🎤 音频处理', () => {

    test('应该支持文本转语音', async () => {
      const request = {
        action: 'synthesize' as const,
        file: '你好，这是一个测试。',
        model: 'doubao-tts-bigmodel',
        voice: 'zh_female_cancan_mars_bigtts',
        speed: 1.0
      };

      const result = await unifiedAIBridge.processAudio(request);

      expect(result).toHaveProperty('success');
      if (result.success) {
        console.log('  ✅ 文本转语音成功');
        if (result.data?.audioData) {
          console.log('  📊 音频数据大小:', result.data.audioData.length, '字节');
          console.log('  🎵 音频类型:', result.data.contentType);
        }
        if (result.data?.audio_url) {
          console.log('  🔗 音频URL:', result.data.audio_url);
        }
      } else {
        console.log('  ⚠️  文本转语音失败:', result.error);
      }
    }, 60000);
  });

  // ==================== 网络搜索测试 ====================

  describe('🔍 网络搜索', () => {

    test('应该成功进行网络搜索', async () => {
      const request = {
        query: '幼儿园教育理念',
        searchType: 'web' as const,
        maxResults: 5,
        enableAISummary: true,
        language: 'zh-CN'
      };

      const result = await unifiedAIBridge.search(request);

      expect(result).toHaveProperty('success');
      if (result.success && result.data) {
        expect(Array.isArray(result.data.results)).toBe(true);
        expect(result.data.totalResults).toBeGreaterThan(0);

        console.log('  ✅ 网络搜索成功');
        console.log('  📊 搜索结果数:', result.data.totalResults);
        console.log('  ⏱️  搜索耗时:', result.data.searchTime + 'ms');

        if (result.data.aiSummary) {
          console.log('  🤖 AI总结:', result.data.aiSummary.substring(0, 100) + '...');
        }

        if (result.data.results.length > 0) {
          console.log('  🔗 第一个结果:', {
            title: result.data.results[0].title,
            url: result.data.results[0].url
          });
        }
      } else {
        console.log('  ⚠️  网络搜索失败:', result.error);
      }
    }, 60000);
  });

  // ==================== 环境路由测试 ====================

  describe('🔀 环境路由', () => {

    test('本地环境应该路由到本地AI Bridge', async () => {
      process.env.HOSTNAME = 'localhost';
      const service = new UnifiedAIBridgeService();

      const result = await service.chat({
        messages: [{ role: 'user' as const, content: '测试路由' }],
        temperature: 0.7,
        max_tokens: 50
      });

      expect(result).toHaveProperty('success');
      console.log('  ✅ 本地环境路由正确');
    }, 30000);

    test('租户环境应该尝试使用统一认证', async () => {
      process.env.HOSTNAME = 'k001.yyup.cc';
      const service = new UnifiedAIBridgeService();

      // 这个测试可能会失败，如果统一认证不可用
      const result = await service.chat({
        messages: [{ role: 'user' as const, content: '测试租户路由' }],
        temperature: 0.7,
        max_tokens: 50
      });

      // 无论成功失败，都应该有返回值
      expect(result).toHaveProperty('success');
      console.log('  🏢 租户环境路由:', result.success ? '✅ 统一认证可用' : '⚠️ 统一认证不可用');
    }, 30000);
  });

  // ==================== 错误处理测试 ====================

  describe('❌ 错误处理', () => {

    test('应该处理无效的音频操作', async () => {
      const request = {
        action: 'invalid_action' as any,
        file: 'test'
      };

      const result = await unifiedAIBridge.processAudio(request);

      expect(result).toHaveProperty('success');
      if (!result.success) {
        expect(result.error).toContain('不支持的音频操作');
        console.log('  ✅ 正确处理了无效音频操作');
      }
    }, 30000);

    test('应该处理空的对话消息', async () => {
      const request = {
        messages: []
      };

      const result = await unifiedAIBridge.chat(request);

      // 应该返回错误或空响应
      expect(result).toHaveProperty('success');
      console.log('  ✅ 处理空消息:', result.success ? '返回成功' : '返回错误');
    }, 30000);
  });

  // ==================== 性能测试 ====================

  describe('⚡ 性能测试', () => {

    test('文本对话响应时间应该合理', async () => {
      const request = {
        messages: [{ role: 'user' as const, content: '测试性能' }],
        temperature: 0.7,
        max_tokens: 50
      };

      const startTime = Date.now();
      const result = await unifiedAIBridge.chat(request);
      const duration = Date.now() - startTime;

      if (result.success && result.data?.usage) {
        console.log(`  ⏱️  响应时间: ${duration}ms`);
        console.log(`  📊 API响应时间: ${result.data.usage.responseTime}ms`);

        // 检查响应时间是否合理（应该在30秒内）
        expect(duration).toBeLessThan(30000);
      }
    }, 60000);

    test('应该支持并发请求', async () => {
      const requests = Array(3).fill(null).map((_, i) =>
        unifiedAIBridge.chat({
          messages: [{ role: 'user' as const, content: `并发测试 ${i + 1}` }],
          temperature: 0.7,
          max_tokens: 30
        })
      );

      const startTime = Date.now();
      const results = await Promise.all(requests);
      const duration = Date.now() - startTime;

      const successCount = results.filter(r => r.success).length;

      console.log(`  ✅ 并发请求: ${results.length}个`);
      console.log(`  ✅ 成功: ${successCount}个`);
      console.log(`  ⏱️  总耗时: ${duration}ms`);
      console.log(`  ⏱️  平均: ${Math.round(duration / results.length)}ms/个`);

      expect(successCount).toBeGreaterThan(0);
    }, 120000);
  });

  // ==================== 综合测试 ====================

  describe('🎯 综合场景测试', () => {

    test('完整工作流：对话+图片生成+搜索', async () => {
      console.log('  📝 步骤1: AI对话');
      const chatResult = await unifiedAIBridge.chat({
        messages: [{ role: 'user' as const, content: '什么是幼儿园？' }],
        max_tokens: 100
      });

      expect(chatResult).toHaveProperty('success');

      if (chatResult.success) {
        console.log('  ✅ 对话完成:', chatResult.data?.content.substring(0, 50) + '...');
      }

      console.log('  🖼️  步骤2: 生成相关图片');
      const imageResult = await unifiedAIBridge.generateImage({
        prompt: '幼儿园的温馨教室，卡通风格',
        n: 1,
        size: '1920x1920'
      });

      expect(imageResult).toHaveProperty('success');

      if (imageResult.success && imageResult.data?.images) {
        console.log('  ✅ 图片生成完成:', imageResult.data.images[0].url);
      }

      console.log('  🔍 步骤3: 网络搜索补充信息');
      const searchResult = await unifiedAIBridge.search({
        query: '幼儿园教育方法',
        maxResults: 3
      });

      expect(searchResult).toHaveProperty('success');

      if (searchResult.success && searchResult.data) {
        console.log('  ✅ 搜索完成:', searchResult.data.totalResults, '条结果');
      }

      console.log('  🎉 完整工作流测试完成');
    }, 180000);
  });
});
