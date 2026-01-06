import { TestDataFactory } from '../helpers/testUtils';

describe('AI Modules Unit Tests', () => {
  describe('AI Memory Service', () => {
    class MockAIMemoryService {
      private memories: Map<string, any[]> = new Map();
      private nextId = 1;

      async storeMemory(conversationId: string, content: string, type: 'user' | 'assistant' = 'user') {
        if (!conversationId || !content) {
          throw new Error('会话ID和内容是必填的');
        }

        const memory = {
          id: this.nextId++,
          conversationId,
          content,
          type,
          timestamp: new Date(),
          embedding: this.generateMockEmbedding(content),
          metadata: {
            wordCount: content.split(' ').length,
            characterCount: content.length
          }
        };

        if (!this.memories.has(conversationId)) {
          this.memories.set(conversationId, []);
        }

        this.memories.get(conversationId)!.push(memory);
        return memory;
      }

      async getConversationHistory(conversationId: string, limit: number = 10) {
        const memories = this.memories.get(conversationId) || [];
        return [...memories]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, limit);
      }

      async searchSimilarMemories(query: string, conversationId?: string, limit: number = 5) {
        const queryEmbedding = this.generateMockEmbedding(query);
        let allMemories: any[] = [];

        if (conversationId) {
          allMemories = this.memories.get(conversationId) || [];
        } else {
          for (const memories of this.memories.values()) {
            allMemories.push(...memories);
          }
        }

        // 模拟相似度计算
        const memoriesWithSimilarity = allMemories.map(memory => ({
          ...memory,
          similarity: this.calculateCosineSimilarity(queryEmbedding, memory.embedding)
        }));

        return memoriesWithSimilarity
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, limit);
      }

      async updateMemory(memoryId: number, updates: any) {
        for (const memories of this.memories.values()) {
          const memoryIndex = memories.findIndex(m => m.id === memoryId);
          if (memoryIndex !== -1) {
            memories[memoryIndex] = {
              ...memories[memoryIndex],
              ...updates,
              updatedAt: new Date()
            };
            return memories[memoryIndex];
          }
        }
        throw new Error('记忆不存在');
      }

      async deleteMemory(memoryId: number) {
        for (const [conversationId, memories] of this.memories.entries()) {
          const memoryIndex = memories.findIndex(m => m.id === memoryId);
          if (memoryIndex !== -1) {
            memories.splice(memoryIndex, 1);
            return { message: '记忆删除成功' };
          }
        }
        throw new Error('记忆不存在');
      }

      async getMemoryStatistics() {
        let totalMemories = 0;
        let totalConversations = this.memories.size;
        let totalWords = 0;
        let totalCharacters = 0;

        for (const memories of this.memories.values()) {
          totalMemories += memories.length;
          for (const memory of memories) {
            totalWords += memory.metadata.wordCount;
            totalCharacters += memory.metadata.characterCount;
          }
        }

        return {
          totalMemories,
          totalConversations,
          totalWords,
          totalCharacters,
          averageMemoriesPerConversation: totalConversations > 0 ? totalMemories / totalConversations : 0
        };
      }

      private generateMockEmbedding(text: string): number[] {
        // 生成模拟的向量嵌入（简化版本）
        const embedding = new Array(768).fill(0);
        for (let i = 0; i < text.length && i < 768; i++) {
          embedding[i] = (text.charCodeAt(i) % 256) / 255;
        }
        return embedding;
      }

      private calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < Math.min(vectorA.length, vectorB.length); i++) {
          dotProduct += vectorA[i] * vectorB[i];
          normA += vectorA[i] * vectorA[i];
          normB += vectorB[i] * vectorB[i];
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
      }
    }

    let memoryService: MockAIMemoryService;

    beforeEach(() => {
      memoryService = new MockAIMemoryService();
    });

    test('应该成功存储记忆', async () => {
      const memory = await memoryService.storeMemory('conv1', '今天天气很好', 'user');

      expect(memory).toMatchObject({
        id: expect.any(Number),
        conversationId: 'conv1',
        content: '今天天气很好',
        type: 'user',
        timestamp: expect.any(Date),
        embedding: expect.any(Array)
      });
      expect(memory.metadata.characterCount).toBe(6);
    });

    test('应该拒绝空内容', async () => {
      await expect(memoryService.storeMemory('conv1', '')).rejects.toThrow('会话ID和内容是必填的');
    });

    test('应该获取会话历史', async () => {
      await memoryService.storeMemory('conv1', '消息1', 'user');
      await new Promise(resolve => setTimeout(resolve, 10)); // 确保时间戳不同
      await memoryService.storeMemory('conv1', '回复1', 'assistant');
      await new Promise(resolve => setTimeout(resolve, 10));
      await memoryService.storeMemory('conv1', '消息2', 'user');

      const history = await memoryService.getConversationHistory('conv1', 2);

      expect(history).toHaveLength(2);
      expect(history[0].content).toBe('消息2'); // 最新的消息在前
      expect(history[1].content).toBe('回复1');
    });

    test('应该搜索相似记忆', async () => {
      await memoryService.storeMemory('conv1', '今天天气很好', 'user');
      await memoryService.storeMemory('conv1', '昨天下雨了', 'user');
      await memoryService.storeMemory('conv1', '我喜欢吃苹果', 'user');

      const similarMemories = await memoryService.searchSimilarMemories('天气不错', 'conv1', 2);

      expect(similarMemories).toHaveLength(2);
      expect(similarMemories[0]).toHaveProperty('similarity');
      expect(similarMemories[0].similarity).toBeGreaterThan(0);
    });

    test('应该更新记忆', async () => {
      const memory = await memoryService.storeMemory('conv1', '原始内容', 'user');
      const updatedMemory = await memoryService.updateMemory(memory.id, {
        content: '更新内容',
        importance: 'high'
      });

      expect(updatedMemory.content).toBe('更新内容');
      expect(updatedMemory.importance).toBe('high');
      expect(updatedMemory.updatedAt).toBeInstanceOf(Date);
    });

    test('应该删除记忆', async () => {
      const memory = await memoryService.storeMemory('conv1', '要删除的内容', 'user');
      const result = await memoryService.deleteMemory(memory.id);

      expect(result.message).toBe('记忆删除成功');

      const history = await memoryService.getConversationHistory('conv1');
      expect(history).toHaveLength(0);
    });

    test('应该生成记忆统计', async () => {
      await memoryService.storeMemory('conv1', '消息1', 'user');
      await memoryService.storeMemory('conv1', '消息2', 'user');
      await memoryService.storeMemory('conv2', '消息3', 'user');

      const stats = await memoryService.getMemoryStatistics();

      expect(stats).toEqual({
        totalMemories: 3,
        totalConversations: 2,
        totalWords: expect.any(Number),
        totalCharacters: expect.any(Number),
        averageMemoriesPerConversation: 1.5
      });
    });
  });

  describe('AI Model Service', () => {
    class MockAIModelService {
      private models: Map<string, any> = new Map();
      private usageStats: Map<string, any> = new Map();

      constructor() {
        // 初始化一些默认模型
        this.models.set('gpt-3.5-turbo', {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          provider: 'openai',
          type: 'chat',
          maxTokens: 4096,
          costPerToken: 0.002,
          isActive: true,
          capabilities: ['chat', 'completion'],
          createdAt: new Date()
        });

        this.models.set('gpt-4', {
          id: 'gpt-4',
          name: 'GPT-4',
          provider: 'openai',
          type: 'chat',
          maxTokens: 8192,
          costPerToken: 0.03,
          isActive: true,
          capabilities: ['chat', 'completion', 'reasoning'],
          createdAt: new Date()
        });
      }

      async getAvailableModels(provider?: string) {
        let models = Array.from(this.models.values());
        
        if (provider) {
          models = models.filter(model => model.provider === provider);
        }

        return models.filter(model => model.isActive);
      }

      async getModelById(modelId: string) {
        const model = this.models.get(modelId);
        if (!model) {
          throw new Error('模型不存在');
        }
        return model;
      }

      async generateCompletion(modelId: string, prompt: string, options: any = {}) {
        const model = await this.getModelById(modelId);
        
        if (!model.isActive) {
          throw new Error('模型不可用');
        }

        if (prompt.length > model.maxTokens * 4) { // 简化的token计算
          throw new Error('输入超出模型最大token限制');
        }

        // 记录使用情况
        await this.recordUsage(modelId, {
          inputTokens: Math.ceil(prompt.length / 4),
          outputTokens: Math.ceil(50), // 模拟输出token数
          requestType: 'completion'
        });

        // 模拟生成响应
        const completion = {
          id: `comp_${Date.now()}`,
          model: modelId,
          choices: [{
            text: this.generateMockResponse(prompt),
            finishReason: 'stop'
          }],
          usage: {
            promptTokens: Math.ceil(prompt.length / 4),
            completionTokens: 50,
            totalTokens: Math.ceil(prompt.length / 4) + 50
          },
          createdAt: new Date()
        };

        return completion;
      }

      async generateChatCompletion(modelId: string, messages: any[], options: any = {}) {
        const model = await this.getModelById(modelId);
        
        if (!model.capabilities.includes('chat')) {
          throw new Error('模型不支持聊天功能');
        }

        const totalContent = messages.map(m => m.content).join(' ');
        if (totalContent.length > model.maxTokens * 4) {
          throw new Error('对话内容超出模型最大token限制');
        }

        // 记录使用情况
        await this.recordUsage(modelId, {
          inputTokens: Math.ceil(totalContent.length / 4),
          outputTokens: 75,
          requestType: 'chat'
        });

        const completion = {
          id: `chat_${Date.now()}`,
          model: modelId,
          choices: [{
            message: {
              role: 'assistant',
              content: this.generateMockChatResponse(messages)
            },
            finishReason: 'stop'
          }],
          usage: {
            promptTokens: Math.ceil(totalContent.length / 4),
            completionTokens: 75,
            totalTokens: Math.ceil(totalContent.length / 4) + 75
          },
          createdAt: new Date()
        };

        return completion;
      }

      async recordUsage(modelId: string, usage: any) {
        const key = `${modelId}_${new Date().toDateString()}`;
        
        if (!this.usageStats.has(key)) {
          this.usageStats.set(key, {
            modelId,
            date: new Date().toDateString(),
            totalRequests: 0,
            totalInputTokens: 0,
            totalOutputTokens: 0,
            totalCost: 0,
            requestTypes: {}
          });
        }

        const stats = this.usageStats.get(key)!;
        const model = this.models.get(modelId)!;
        
        stats.totalRequests++;
        stats.totalInputTokens += usage.inputTokens;
        stats.totalOutputTokens += usage.outputTokens;
        stats.totalCost += (usage.inputTokens + usage.outputTokens) * model.costPerToken;
        
        if (!stats.requestTypes[usage.requestType]) {
          stats.requestTypes[usage.requestType] = 0;
        }
        stats.requestTypes[usage.requestType]++;

        this.usageStats.set(key, stats);
      }

      async getUsageStats(modelId?: string, startDate?: Date, endDate?: Date) {
        let stats = Array.from(this.usageStats.values());

        if (modelId) {
          stats = stats.filter(stat => stat.modelId === modelId);
        }

        if (startDate || endDate) {
          stats = stats.filter(stat => {
            const statDate = new Date(stat.date);
            if (startDate && statDate < startDate) return false;
            if (endDate && statDate > endDate) return false;
            return true;
          });
        }

        return stats;
      }

      async addCustomModel(modelConfig: any) {
        const errors: string[] = [];

        if (!modelConfig.id) errors.push('模型ID是必填的');
        if (!modelConfig.name) errors.push('模型名称是必填的');
        if (!modelConfig.provider) errors.push('提供商是必填的');
        if (!modelConfig.type) errors.push('模型类型是必填的');

        if (this.models.has(modelConfig.id)) {
          errors.push('模型ID已存在');
        }

        if (errors.length > 0) {
          throw new Error(`验证失败: ${errors.join(', ')}`);
        }

        const newModel = {
          id: modelConfig.id,
          name: modelConfig.name,
          provider: modelConfig.provider,
          type: modelConfig.type,
          maxTokens: modelConfig.maxTokens || 4096,
          costPerToken: modelConfig.costPerToken || 0.001,
          isActive: modelConfig.isActive !== false,
          capabilities: modelConfig.capabilities || ['completion'],
          createdAt: new Date()
        };

        this.models.set(newModel.id, newModel);
        return newModel;
      }

      private generateMockResponse(prompt: string): string {
        const responses = [
          '这是一个AI生成的回复。',
          '根据您的问题，我认为...',
          '让我为您分析一下这个问题。',
          '基于您提供的信息...'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      }

      private generateMockChatResponse(messages: any[]): string {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.content.includes('你好')) {
          return '您好！很高兴为您服务。';
        }
        if (lastMessage.content.includes('天气')) {
          return '今天天气不错，适合户外活动。';
        }
        return '我理解您的问题，让我为您详细解答。';
      }
    }

    let modelService: MockAIModelService;

    beforeEach(() => {
      modelService = new MockAIModelService();
    });

    test('应该获取可用模型列表', async () => {
      const models = await modelService.getAvailableModels();

      expect(models.length).toBeGreaterThan(0);
      expect(models[0]).toHaveProperty('id');
      expect(models[0]).toHaveProperty('name');
      expect(models[0]).toHaveProperty('provider');
      expect(models[0].isActive).toBe(true);
    });

    test('应该按提供商过滤模型', async () => {
      const openaiModels = await modelService.getAvailableModels('openai');

      expect(openaiModels.length).toBeGreaterThan(0);
      openaiModels.forEach(model => {
        expect(model.provider).toBe('openai');
      });
    });

    test('应该生成文本补全', async () => {
      const completion = await modelService.generateCompletion('gpt-3.5-turbo', '今天天气怎么样？');

      expect(completion).toMatchObject({
        id: expect.stringMatching(/^comp_/),
        model: 'gpt-3.5-turbo',
        choices: expect.arrayContaining([
          expect.objectContaining({
            text: expect.any(String),
            finishReason: 'stop'
          })
        ]),
        usage: expect.objectContaining({
          promptTokens: expect.any(Number),
          completionTokens: expect.any(Number),
          totalTokens: expect.any(Number)
        })
      });
    });

    test('应该生成聊天补全', async () => {
      const messages = [
        { role: 'user', content: '你好' }
      ];

      const completion = await modelService.generateChatCompletion('gpt-4', messages);

      expect(completion).toMatchObject({
        id: expect.stringMatching(/^chat_/),
        model: 'gpt-4',
        choices: expect.arrayContaining([
          expect.objectContaining({
            message: expect.objectContaining({
              role: 'assistant',
              content: expect.any(String)
            })
          })
        ])
      });
    });

    test('应该拒绝不支持聊天的模型', async () => {
      // 添加一个只支持补全的模型
      await modelService.addCustomModel({
        id: 'text-davinci-003',
        name: 'Text Davinci 003',
        provider: 'openai',
        type: 'completion',
        capabilities: ['completion']
      });

      const messages = [{ role: 'user', content: '你好' }];

      await expect(modelService.generateChatCompletion('text-davinci-003', messages))
        .rejects.toThrow('模型不支持聊天功能');
    });

    test('应该记录使用统计', async () => {
      await modelService.generateCompletion('gpt-3.5-turbo', '测试问题');
      
      const stats = await modelService.getUsageStats('gpt-3.5-turbo');

      expect(stats.length).toBeGreaterThan(0);
      expect(stats[0]).toMatchObject({
        modelId: 'gpt-3.5-turbo',
        totalRequests: expect.any(Number),
        totalInputTokens: expect.any(Number),
        totalOutputTokens: expect.any(Number),
        totalCost: expect.any(Number)
      });
    });

    test('应该添加自定义模型', async () => {
      const modelConfig = {
        id: 'custom-model-1',
        name: '自定义模型',
        provider: 'custom',
        type: 'chat',
        maxTokens: 2048,
        costPerToken: 0.001,
        capabilities: ['chat', 'completion']
      };

      const model = await modelService.addCustomModel(modelConfig);

      expect(model).toMatchObject(modelConfig);
      expect(model.createdAt).toBeInstanceOf(Date);

      const models = await modelService.getAvailableModels();
      expect(models.some(m => m.id === 'custom-model-1')).toBe(true);
    });

    test('应该拒绝重复的模型ID', async () => {
      const modelConfig = {
        id: 'gpt-3.5-turbo', // 已存在的ID
        name: '重复模型',
        provider: 'test',
        type: 'chat'
      };

      await expect(modelService.addCustomModel(modelConfig)).rejects.toThrow('模型ID已存在');
    });
  });

  describe('Expert Consultation AI Service', () => {
    class MockExpertConsultationService {
      private consultations: Map<number, any> = new Map();
      private experts: Map<number, any> = new Map();
      private nextId = 1;

      constructor() {
        // 初始化专家信息
        this.experts.set(1, {
          id: 1,
          name: '张教授',
          expertise: ['儿童心理学', '幼儿教育'],
          qualification: '教育心理学博士',
          experience: 15,
          isAvailable: true
        });

        this.experts.set(2, {
          id: 2,
          name: '李医生',
          expertise: ['儿童健康', '营养学'],
          qualification: '儿科医生',
          experience: 10,
          isAvailable: true
        });
      }

      async createConsultation(consultationData: any) {
        const errors: string[] = [];

        if (!consultationData.parentId) errors.push('家长ID是必填的');
        if (!consultationData.category) errors.push('咨询类别是必填的');
        if (!consultationData.question) errors.push('咨询问题是必填的');

        if (errors.length > 0) {
          throw new Error(`验证失败: ${errors.join(', ')}`);
        }

        // 匹配专家
        const expert = await this.matchExpert(consultationData.category);
        if (!expert) {
          throw new Error('暂无可用专家处理此类咨询');
        }

        const consultation = {
          id: this.nextId++,
          parentId: consultationData.parentId,
          expertId: expert.id,
          category: consultationData.category,
          question: consultationData.question,
          status: 'pending',
          priority: consultationData.priority || 'normal',
          createdAt: new Date(),
          updatedAt: new Date(),
          response: null,
          responseTime: null,
          satisfactionRating: null
        };

        this.consultations.set(consultation.id, consultation);
        return {
          ...consultation,
          expert: {
            name: expert.name,
            expertise: expert.expertise,
            qualification: expert.qualification
          }
        };
      }

      async getConsultationById(id: number) {
        const consultation = this.consultations.get(id);
        if (!consultation) {
          throw new Error('咨询不存在');
        }

        const expert = this.experts.get(consultation.expertId);
        return {
          ...consultation,
          expert: expert ? {
            name: expert.name,
            expertise: expert.expertise,
            qualification: expert.qualification
          } : null
        };
      }

      async respondToConsultation(consultationId: number, response: string, expertId: number) {
        const consultation = this.consultations.get(consultationId);
        if (!consultation) {
          throw new Error('咨询不存在');
        }

        if (consultation.expertId !== expertId) {
          throw new Error('只有指定专家可以回复此咨询');
        }

        if (consultation.status !== 'pending') {
          throw new Error('此咨询已处理');
        }

        consultation.response = response;
        consultation.status = 'answered';
        consultation.responseTime = new Date();
        consultation.updatedAt = new Date();

        this.consultations.set(consultationId, consultation);
        return consultation;
      }

      async getConsultationsByParent(parentId: number, status?: string) {
        const consultations = Array.from(this.consultations.values())
          .filter(c => c.parentId === parentId);

        if (status) {
          return consultations.filter(c => c.status === status);
        }

        return consultations;
      }

      async getConsultationsByExpert(expertId: number, status?: string) {
        const consultations = Array.from(this.consultations.values())
          .filter(c => c.expertId === expertId);

        if (status) {
          return consultations.filter(c => c.status === status);
        }

        return consultations;
      }

      async rateSatisfaction(consultationId: number, rating: number, feedback?: string) {
        if (rating < 1 || rating > 5) {
          throw new Error('评分必须在1-5之间');
        }

        const consultation = this.consultations.get(consultationId);
        if (!consultation) {
          throw new Error('咨询不存在');
        }

        if (consultation.status !== 'answered') {
          throw new Error('只有已回复的咨询可以评分');
        }

        consultation.satisfactionRating = rating;
        consultation.feedback = feedback;
        consultation.status = 'completed';
        consultation.updatedAt = new Date();

        this.consultations.set(consultationId, consultation);
        return consultation;
      }

      async getExpertPerformance(expertId: number) {
        const expert = this.experts.get(expertId);
        if (!expert) {
          throw new Error('专家不存在');
        }

        const consultations = Array.from(this.consultations.values())
          .filter(c => c.expertId === expertId);

        const completedConsultations = consultations.filter(c => c.status === 'completed');
        const avgRating = completedConsultations.length > 0 
          ? completedConsultations.reduce((sum, c) => sum + (c.satisfactionRating || 0), 0) / completedConsultations.length
          : 0;

        const avgResponseTime = consultations
          .filter(c => c.responseTime)
          .reduce((sum, c, _, arr) => {
            const responseTime = c.responseTime.getTime() - c.createdAt.getTime();
            return sum + responseTime / arr.length;
          }, 0);

        return {
          expert: expert,
          totalConsultations: consultations.length,
          completedConsultations: completedConsultations.length,
          averageRating: Math.round(avgRating * 100) / 100,
          averageResponseTime: Math.round(avgResponseTime / (1000 * 60 * 60)), // 小时
          responseRate: consultations.length > 0 ? (consultations.filter(c => c.status !== 'pending').length / consultations.length * 100) : 0
        };
      }

      async generateAIInsights(consultationId: number) {
        const consultation = await this.getConsultationById(consultationId);
        
        if (!consultation.response) {
          throw new Error('需要专家回复后才能生成AI洞察');
        }

        // 模拟AI分析
        const insights = {
          category: consultation.category,
          keyTopics: this.extractKeyTopics(consultation.question + ' ' + consultation.response),
          sentiment: this.analyzeSentiment(consultation.response),
          recommendedActions: this.generateRecommendations(consultation.category),
          relatedResources: this.findRelatedResources(consultation.category),
          confidenceScore: Math.random() * 0.3 + 0.7, // 0.7-1.0
          generatedAt: new Date()
        };

        return insights;
      }

      private async matchExpert(category: string) {
        const availableExperts = Array.from(this.experts.values())
          .filter(expert => expert.isAvailable);

        // 简单的专家匹配逻辑
        if (category.includes('心理') || category.includes('行为')) {
          return availableExperts.find(expert => expert.expertise.includes('儿童心理学'));
        }
        
        if (category.includes('健康') || category.includes('营养')) {
          return availableExperts.find(expert => expert.expertise.includes('儿童健康'));
        }

        // 返回经验最丰富的专家
        return availableExperts.sort((a, b) => b.experience - a.experience)[0];
      }

      private extractKeyTopics(text: string): string[] {
        const keywords = ['幼儿园', '孩子', '学习', '行为', '健康', '营养', '睡眠', '社交'];
        return keywords.filter(keyword => text.includes(keyword));
      }

      private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
        const positiveWords = ['好', '棒', '优秀', '满意', '开心'];
        const negativeWords = ['不好', '问题', '担心', '困难', '烦恼'];
        
        const positiveCount = positiveWords.filter(word => text.includes(word)).length;
        const negativeCount = negativeWords.filter(word => text.includes(word)).length;
        
        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
      }

      private generateRecommendations(category: string): string[] {
        const recommendations: { [key: string]: string[] } = {
          '心理健康': [
            '建立稳定的日常作息',
            '多与孩子进行情感交流',
            '观察孩子的情绪变化'
          ],
          '学习发展': [
            '创造良好的学习环境',
            '鼓励孩子的好奇心',
            '适度引导，避免过度压力'
          ],
          '身体健康': [
            '保证充足的睡眠',
            '合理安排户外活动',
            '定期体检'
          ]
        };

        for (const [key, recs] of Object.entries(recommendations)) {
          if (category.includes(key.split('')[0])) {
            return recs;
          }
        }

        return ['与专家保持沟通', '持续关注孩子发展'];
      }

      private findRelatedResources(category: string): string[] {
        return [
          '幼儿发展指南',
          '家庭教育手册',
          '儿童健康知识库',
          '专家讲座视频'
        ];
      }
    }

    let consultationService: MockExpertConsultationService;

    beforeEach(() => {
      consultationService = new MockExpertConsultationService();
    });

    test('应该成功创建咨询', async () => {
      const consultationData = {
        parentId: 1,
        category: '儿童心理学',
        question: '我的孩子最近不爱说话，是什么原因？',
        priority: 'high'
      };

      const consultation = await consultationService.createConsultation(consultationData);

      expect(consultation).toMatchObject({
        id: expect.any(Number),
        parentId: 1,
        category: '儿童心理学',
        question: '我的孩子最近不爱说话，是什么原因？',
        status: 'pending',
        priority: 'high'
      });
      expect(consultation.expert).toHaveProperty('name');
      expect(consultation.expert).toHaveProperty('expertise');
    });

    test('应该拒绝缺少必填字段的咨询', async () => {
      const consultationData = {
        parentId: 1
        // 缺少其他必填字段
      };

      await expect(consultationService.createConsultation(consultationData))
        .rejects.toThrow('验证失败');
    });

    test('应该成功回复咨询', async () => {
      const consultation = await consultationService.createConsultation({
        parentId: 1,
        category: '儿童心理学',
        question: '孩子不爱说话怎么办？'
      });

      const response = await consultationService.respondToConsultation(
        consultation.id,
        '这可能是正常的发展阶段，建议多与孩子互动...',
        consultation.expertId
      );

      expect(response.status).toBe('answered');
      expect(response.response).toBe('这可能是正常的发展阶段，建议多与孩子互动...');
      expect(response.responseTime).toBeInstanceOf(Date);
    });

    test('应该拒绝非指定专家的回复', async () => {
      const consultation = await consultationService.createConsultation({
        parentId: 1,
        category: '儿童心理学',
        question: '孩子不爱说话怎么办？'
      });

      await expect(consultationService.respondToConsultation(
        consultation.id,
        '回复内容',
        999 // 错误的专家ID
      )).rejects.toThrow('只有指定专家可以回复此咨询');
    });

    test('应该成功评分', async () => {
      const consultation = await consultationService.createConsultation({
        parentId: 1,
        category: '儿童心理学',
        question: '孩子不爱说话怎么办？'
      });

      await consultationService.respondToConsultation(
        consultation.id,
        '专业回复',
        consultation.expertId
      );

      const ratedConsultation = await consultationService.rateSatisfaction(
        consultation.id,
        5,
        '非常满意'
      );

      expect(ratedConsultation.satisfactionRating).toBe(5);
      expect(ratedConsultation.feedback).toBe('非常满意');
      expect(ratedConsultation.status).toBe('completed');
    });

    test('应该获取专家绩效', async () => {
      const consultation = await consultationService.createConsultation({
        parentId: 1,
        category: '儿童心理学',
        question: '测试问题'
      });

      await consultationService.respondToConsultation(
        consultation.id,
        '测试回复',
        consultation.expertId
      );

      await consultationService.rateSatisfaction(consultation.id, 4);

      const performance = await consultationService.getExpertPerformance(consultation.expertId);

      expect(performance).toMatchObject({
        expert: expect.objectContaining({
          name: expect.any(String)
        }),
        totalConsultations: 1,
        completedConsultations: 1,
        averageRating: 4,
        responseRate: 100
      });
    });

    test('应该生成AI洞察', async () => {
      const consultation = await consultationService.createConsultation({
        parentId: 1,
        category: '儿童心理学',
        question: '孩子在幼儿园表现焦虑'
      });

      await consultationService.respondToConsultation(
        consultation.id,
        '这是适应期的正常反应，建议家长耐心陪伴',
        consultation.expertId
      );

      const insights = await consultationService.generateAIInsights(consultation.id);

      expect(insights).toMatchObject({
        category: '儿童心理学',
        keyTopics: expect.any(Array),
        sentiment: expect.any(String),
        recommendedActions: expect.any(Array),
        relatedResources: expect.any(Array),
        confidenceScore: expect.any(Number),
        generatedAt: expect.any(Date)
      });
      expect(insights.confidenceScore).toBeGreaterThanOrEqual(0.7);
    });
  });
});