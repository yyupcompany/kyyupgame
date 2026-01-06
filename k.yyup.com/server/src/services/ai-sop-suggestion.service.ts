import { TeacherSOPService } from './teacher-sop.service';
import SOPTask from '../models/sop-task.model';
import SOPStage from '../models/sop-stage.model';

/**
 * AI SOP建议服务
 * 调用AIBridge服务生成智能建议
 */
export class AISOPSuggestionService {
  /**
   * 获取任务级AI建议
   */
  static async getTaskSuggestion(params: {
    customerId: number;
    teacherId: number;
    taskId: number;
  }) {
    const { customerId, teacherId, taskId } = params;

    // 1. 获取任务信息
    const task = await SOPTask.findByPk(taskId);
    if (!task) {
      throw new Error('任务不存在');
    }

    // 2. 获取阶段信息
    const stage = await SOPStage.findByPk(task.stageId);
    if (!stage) {
      throw new Error('阶段不存在');
    }

    // 3. 获取客户进度
    const progress = await TeacherSOPService.getCustomerProgress(customerId, teacherId);

    // 4. 获取对话历史
    const conversations = await TeacherSOPService.getConversations(customerId, teacherId);

    // 5. 获取截图
    const screenshots = await TeacherSOPService.getScreenshots(customerId);

    // 6. 构建上下文
    const context = {
      customer: {
        id: customerId,
        // TODO: 从数据库获取客户详细信息
      },
      stage: {
        id: stage.id,
        name: stage.name,
        description: stage.description
      },
      task: {
        id: task.id,
        name: task.name,
        description: task.description,
        isRequired: task.isRequired,
        estimatedTime: task.estimatedTime
      },
      progress: {
        currentStage: progress.currentStageId,
        stageProgress: progress.stageProgress,
        completedTasks: progress.completedTasks
      },
      conversations: conversations.map(c => ({
        speaker: c.speakerType,
        content: c.content,
        time: c.createdAt
      })),
      screenshots: screenshots.length
    };

    // 7. 构建提示词
    const prompt = this.buildTaskPrompt(context);

    // 8. 调用AIBridge服务
    const aiResponse = await this.callAIBridge({
      type: 'task-suggestion',
      context,
      prompt
    });

    // 9. 保存AI建议历史
    await TeacherSOPService.saveAISuggestion({
      customerId,
      teacherId,
      taskId,
      suggestionType: 'task',
      inputContext: context,
      aiResponse
    });

    return aiResponse;
  }

  /**
   * 获取全局AI分析
   */
  static async getGlobalAnalysis(params: {
    customerId: number;
    teacherId: number;
  }) {
    const { customerId, teacherId } = params;

    // 1. 获取所有相关数据
    const progress = await TeacherSOPService.getCustomerProgress(customerId, teacherId);
    const conversations = await TeacherSOPService.getConversations(customerId, teacherId);
    const screenshots = await TeacherSOPService.getScreenshots(customerId);
    const stages = await TeacherSOPService.getAllStages();

    // 2. 计算成功概率
    const successProbability = await TeacherSOPService.calculateSuccessProbability(
      customerId,
      teacherId
    );

    // 3. 构建上下文
    const context = {
      customer: {
        id: customerId
      },
      progress: {
        currentStage: progress.currentStageId,
        stageProgress: progress.stageProgress,
        completedTasks: progress.completedTasks,
        successProbability
      },
      conversations: conversations.map(c => ({
        speaker: c.speakerType,
        content: c.content,
        sentimentScore: c.sentimentScore,
        time: c.createdAt
      })),
      screenshots: screenshots.length,
      totalStages: stages.length
    };

    // 4. 构建提示词
    const prompt = this.buildGlobalPrompt(context);

    // 5. 调用AIBridge服务
    const aiResponse = await this.callAIBridge({
      type: 'global-analysis',
      context,
      prompt
    });

    // 6. 保存AI建议历史
    await TeacherSOPService.saveAISuggestion({
      customerId,
      teacherId,
      suggestionType: 'global',
      inputContext: context,
      aiResponse
    });

    return {
      ...aiResponse,
      successProbability,
      currentProgress: {
        stage: progress.currentStageId,
        progress: progress.stageProgress
      }
    };
  }

  /**
   * 分析截图
   */
  static async analyzeScreenshot(params: {
    screenshotId: number;
    customerId: number;
    teacherId: number;
  }) {
    const { screenshotId, customerId, teacherId } = params;

    // 1. 获取截图
    const screenshots = await TeacherSOPService.getScreenshots(customerId);
    const screenshot = screenshots.find(s => s.id === screenshotId);
    
    if (!screenshot) {
      throw new Error('截图不存在');
    }

    // 2. 获取对话历史（用于上下文）
    const conversations = await TeacherSOPService.getConversations(customerId, teacherId);

    // 3. 构建上下文
    const context = {
      imageUrl: screenshot.imageUrl,
      customerId,
      conversationHistory: conversations.slice(-5).map(c => ({
        speaker: c.speakerType,
        content: c.content
      }))
    };

    // 4. 构建提示词
    const prompt = `
分析这张聊天截图，提取以下信息：
1. 对话内容摘要
2. 客户的关注点和疑虑
3. 客户的情感倾向（积极/中性/消极）
4. 建议的回复话术
5. 需要注意的关键信息
    `.trim();

    // 5. 调用AIBridge服务（包含OCR）
    const aiResponse = await this.callAIBridge({
      type: 'screenshot-analysis',
      context,
      prompt,
      includeOCR: true
    });

    // 6. 更新截图分析结果
    await TeacherSOPService.updateScreenshotAnalysis(screenshotId, {
      recognizedText: aiResponse.recognizedText,
      aiAnalysis: {
        focusPoints: aiResponse.focusPoints,
        sentiment: aiResponse.sentiment,
        suggestedResponse: aiResponse.suggestedResponse,
        keyInfo: aiResponse.keyInfo
      }
    });

    return aiResponse;
  }

  /**
   * 构建任务提示词
   */
  private static buildTaskPrompt(context: any): string {
    return `
你是一位经验丰富的幼儿园招生顾问，现在需要帮助教师完成客户跟进任务。

【当前阶段】
- 阶段：${context.stage.name}
- 任务：${context.task.title}
- 目标：${context.task.description}

【任务指导】
${JSON.stringify(context.task.guidance, null, 2)}

【客户进度】
- 当前阶段进度：${context.progress.stageProgress}%
- 已完成任务数：${context.progress.completedTasks?.length || 0}

【历史沟通记录】（最近5条）
${context.conversations.slice(-5).map((c: any) => 
  `${c.speaker === 'teacher' ? '老师' : '客户'}：${c.content}`
).join('\n')}

请基于以上信息，提供：
1. 针对性的沟通策略（包括标题、描述、关键要点）
2. 3-5条可直接使用的话术（开场白、核心话术、可能的异议及应对）
3. 下一步具体行动建议（包括标题、描述、时机、技巧）
4. 成交概率评估及影响因素分析

要求：
- 话术要自然、亲切、专业
- 策略要具体、可执行
- 考虑客户的个性化需求
- 提供实用的技巧和注意事项

请以JSON格式返回，格式如下：
{
  "strategy": {
    "title": "沟通策略标题",
    "description": "策略描述",
    "keyPoints": ["要点1", "要点2", "要点3"]
  },
  "scripts": {
    "opening": "开场白",
    "core": ["核心话术1", "核心话术2", "核心话术3"],
    "objections": [
      {"question": "客户可能的异议", "answer": "建议回复"}
    ]
  },
  "nextActions": [
    {
      "title": "行动标题",
      "description": "行动描述",
      "timing": "建议时机",
      "tips": ["技巧1", "技巧2"]
    }
  ],
  "successProbability": 75,
  "factors": [
    {"name": "因素名称", "score": 80}
  ]
}
    `.trim();
  }

  /**
   * 构建全局分析提示词
   */
  private static buildGlobalPrompt(context: any): string {
    return `
你是一位资深的幼儿园招生专家，现在需要对客户进行全面分析。

【客户进度】
- 当前阶段：第${context.progress.currentStage}阶段（共${context.totalStages}阶段）
- 阶段进度：${context.progress.stageProgress}%
- 已完成任务：${context.progress.completedTasks?.length || 0}个
- 当前成功概率：${context.progress.successProbability}%

【沟通情况】
- 总沟通次数：${context.conversations.length}次
- 积极情感占比：${context.conversations.filter((c: any) => c.sentiment === 'positive').length / context.conversations.length * 100}%
- 上传截图数：${context.screenshots}张

【最近沟通记录】
${context.conversations.slice(-10).map((c: any) => 
  `[${c.time}] ${c.speaker === 'teacher' ? '老师' : '客户'}：${c.content}`
).join('\n')}

请基于以上信息，提供全面的分析和建议：
1. 客户画像分析（意向度、关注点、决策风格）
2. 当前阶段评估（进展情况、存在问题、改进建议）
3. 整体策略建议（沟通策略、推进节奏、注意事项）
4. 成交概率分析（影响因素、提升建议）
5. 下一步行动计划（具体步骤、时间安排）

请以JSON格式返回。
    `.trim();
  }

  /**
   * 调用AIBridge服务
   */
  private static async callAIBridge(params: {
    type: string;
    context: any;
    prompt: string;
    includeOCR?: boolean;
  }): Promise<any> {
    try {
      console.log('🤖 [AI-SOP] 调用AIBridge服务:', params.type);

      // 导入AIBridge服务和模型配置
      const { aiBridgeService } = await import('./ai/bridge/ai-bridge.service');
      const AIModelConfig = (await import('../models/ai-model-config.model')).default;

      // 获取默认AI模型配置（豆包）
      const modelConfig = await AIModelConfig.findOne({
        where: {
          status: 'active',
          isDefault: true,
          modelType: 'text'
        }
      });

      if (!modelConfig) {
        console.error('❌ [AI-SOP] 未找到可用的AI模型配置');
        throw new Error('未找到可用的AI模型配置');
      }

      console.log('✅ [AI-SOP] 使用模型:', modelConfig.name);

      // 构建AI消息
      const messages = [
        {
          role: 'system' as const,
          content: `你是一位专业的幼儿园招生顾问AI助手。你的任务是根据客户跟踪数据，提供专业的销售建议和话术。

请以JSON格式返回结果，包含以下字段：
- strategy: 策略建议（包含title, description, keyPoints数组）
- scripts: 话术建议（包含opening开场白, core核心话术数组, objections异议处理数组）
- nextActions: 下一步行动建议数组（每项包含title, description, timing, tips数组）
- successProbability: 成功概率（0-100的数字）
- factors: 影响因素数组（每项包含name和score）`
        },
        {
          role: 'user' as const,
          content: `${params.prompt}

上下文信息：
${JSON.stringify(params.context, null, 2)}`
        }
      ];

      // 调用AIBridge服务
      const response = await aiBridgeService.generateChatCompletion(
        {
          model: modelConfig.name,
          messages,
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          endpointUrl: modelConfig.endpointUrl,
          apiKey: modelConfig.apiKey
        }
      );

      console.log('✅ [AI-SOP] AI调用成功');

      // 解析AI响应
      const aiContent = response.choices?.[0]?.message?.content || '';

      try {
        // 尝试解析JSON响应
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          console.log('✅ [AI-SOP] AI响应解析成功');
          return result;
        }
      } catch (parseError) {
        console.warn('⚠️ [AI-SOP] AI响应解析失败，返回原始内容');
      }

      // 如果解析失败，返回结构化的默认响应
      return {
        strategy: {
          title: 'AI分析建议',
          description: aiContent.substring(0, 200),
          keyPoints: ['请查看完整分析内容']
        },
        rawContent: aiContent
      };

    } catch (error: any) {
      console.error('❌ [AI-SOP] AIBridge调用失败:', error.message);
      throw new Error(`AI分析失败: ${error.message}`);
    }
  }
}

