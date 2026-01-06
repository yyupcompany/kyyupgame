/**
 * AI智能呼叫助手服务
 * 
 * 功能：
 * 1. 管理AI对话会话
 * 2. 维护对话上下文
 * 3. 生成智能话术
 * 4. 记录对话历史
 * 5. 分析对话质量
 */

import { EventEmitter } from 'events';
import { unifiedAIBridge } from './unified-ai-bridge.service';
import AIModelConfig from '../models/ai-model-config.model';
import { Op } from 'sequelize';

interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CallConversation {
  callId: string;
  customerId?: number;
  messages: ConversationMessage[];
  systemPrompt: string;
  startTime: Date;
  lastInteractionTime: Date;
  totalInteractions: number;
  aiModel?: string;
}

export class AICallAssistantService extends EventEmitter {
  private static instance: AICallAssistantService;
  private conversations: Map<string, CallConversation> = new Map();
  private defaultSystemPrompt = `你是一位专业的幼儿园招生顾问，正在通过电话与家长沟通。

你的任务：
1. 礼貌地介绍自己和幼儿园
2. 了解孩子的年龄和基本情况
3. 介绍幼儿园的特色和优势
4. 回答家长的疑问
5. 邀请家长预约参观

沟通原则：
- 保持友好、专业、耐心的态度
- 回答要简洁明了，每次不超过60字
- 使用口语化的表达，避免书面语
- 不要做绝对化承诺
- 适时提出开放性问题，引导对话
- 注意倾听家长的需求和顾虑

特别注意：
- 这是电话对话，不是文字聊天
- 回复要自然流畅，适合语音播放
- 避免使用标点符号和特殊字符
- 数字用中文表达（如"三岁"而不是"3岁"）`;

  private constructor() {
    super();
  }

  static getInstance(): AICallAssistantService {
    if (!AICallAssistantService.instance) {
      AICallAssistantService.instance = new AICallAssistantService();
    }
    return AICallAssistantService.instance;
  }

  /**
   * 创建对话会话
   */
  public createConversation(
    callId: string,
    customerId?: number,
    systemPrompt?: string
  ): void {
    const conversation: CallConversation = {
      callId,
      customerId,
      messages: [
        {
          role: 'system',
          content: systemPrompt || this.defaultSystemPrompt,
          timestamp: new Date()
        }
      ],
      systemPrompt: systemPrompt || this.defaultSystemPrompt,
      startTime: new Date(),
      lastInteractionTime: new Date(),
      totalInteractions: 0
    };

    this.conversations.set(callId, conversation);
    console.log(`🤖 创建AI对话会话: ${callId}`);
  }

  /**
   * 处理用户输入，生成AI回复
   */
  public async processUserInput(
    callId: string,
    userInput: string
  ): Promise<{ reply: string; confidence: number }> {
    const conversation = this.conversations.get(callId);
    if (!conversation) {
      throw new Error(`对话会话不存在: ${callId}`);
    }

    // 添加用户消息
    conversation.messages.push({
      role: 'user',
      content: userInput,
      timestamp: new Date()
    });

    console.log(`👤 用户输入 (${callId}): ${userInput}`);

    try {
      // 准备对话历史（最近10条消息）
      const recentMessages = conversation.messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // 调用AI生成回复
      // UnifiedAIBridge 会自动从数据库读取豆包模型配置
      const response = await unifiedAIBridge.chat({
        model: 'doubao-seed-1-6-thinking-250615',
        messages: recentMessages,
        temperature: 0.7,
        max_tokens: 150 // 限制回复长度
      });

      if (!response || !response.data) {
        throw new Error('AI未返回有效回复');
      }

      const aiReply = (response.data.content || response.data.message || '').trim();
      
      // 后处理：确保回复适合语音播放
      const processedReply = this.postProcessReply(aiReply);

      // 添加AI回复到对话历史
      conversation.messages.push({
        role: 'assistant',
        content: processedReply,
        timestamp: new Date()
      });

      // 更新统计信息
      conversation.lastInteractionTime = new Date();
      conversation.totalInteractions++;
      conversation.aiModel = 'doubao-seed-1-6-thinking-250615';

      console.log(`🤖 AI回复 (${callId}): ${processedReply}`);

      // 计算置信度（基于回复长度和完整性）
      const confidence = this.calculateConfidence(processedReply);

      // 发出事件
      this.emit('ai-reply', {
        callId,
        userInput,
        aiReply: processedReply,
        confidence,
        timestamp: new Date()
      });

      return {
        reply: processedReply,
        confidence
      };

    } catch (error) {
      console.error(`❌ AI处理失败 (${callId}):`, error);
      
      // 返回备用回复
      const fallbackReply = this.getFallbackReply();
      
      conversation.messages.push({
        role: 'assistant',
        content: fallbackReply,
        timestamp: new Date()
      });

      return {
        reply: fallbackReply,
        confidence: 0.5
      };
    }
  }

  /**
   * 后处理AI回复，使其适合语音播放
   */
  private postProcessReply(reply: string): string {
    let processed = reply;

    // 移除Markdown格式
    processed = processed.replace(/[*_`#]/g, '');

    // 移除多余的标点符号
    processed = processed.replace(/[！？。，、；：""''（）【】《》]/g, match => {
      const punctuationMap: { [key: string]: string } = {
        '！': '，',
        '？': '，',
        '。': '，',
        '、': '，',
        '；': '，',
        '：': '，',
        '""': '',
        "''": '',
        '（）': '',
        '【】': '',
        '《》': ''
      };
      return punctuationMap[match] || match;
    });

    // 数字转中文
    processed = processed.replace(/\d+/g, (match) => {
      return this.numberToChinese(parseInt(match));
    });

    // 限制长度（最多60字）
    if (processed.length > 60) {
      processed = processed.substring(0, 60);
      // 在最后一个逗号处截断
      const lastComma = processed.lastIndexOf('，');
      if (lastComma > 30) {
        processed = processed.substring(0, lastComma);
      }
    }

    // 移除首尾空格
    processed = processed.trim();

    return processed;
  }

  /**
   * 数字转中文
   */
  private numberToChinese(num: number): string {
    if (num === 0) return '零';
    if (num < 0) return '负' + this.numberToChinese(-num);
    if (num >= 10000) return num.toString(); // 大数字保持原样

    const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const units = ['', '十', '百', '千'];

    if (num < 10) return digits[num];
    if (num < 20) return '十' + (num === 10 ? '' : digits[num % 10]);
    if (num < 100) {
      const tens = Math.floor(num / 10);
      const ones = num % 10;
      return digits[tens] + '十' + (ones === 0 ? '' : digits[ones]);
    }

    // 100-9999的转换
    let result = '';
    let unitIndex = 0;
    while (num > 0) {
      const digit = num % 10;
      if (digit !== 0) {
        result = digits[digit] + units[unitIndex] + result;
      } else if (result && result[0] !== '零') {
        result = '零' + result;
      }
      num = Math.floor(num / 10);
      unitIndex++;
    }

    return result;
  }

  /**
   * 计算回复置信度
   */
  private calculateConfidence(reply: string): number {
    let confidence = 1.0;

    // 长度检查
    if (reply.length < 10) confidence -= 0.2;
    if (reply.length > 60) confidence -= 0.1;

    // 完整性检查
    if (!reply.endsWith('，') && !reply.endsWith('吗') && !reply.endsWith('呢')) {
      confidence -= 0.1;
    }

    // 关键词检查
    const keywords = ['幼儿园', '孩子', '家长', '参观', '咨询', '了解'];
    const hasKeyword = keywords.some(kw => reply.includes(kw));
    if (hasKeyword) confidence += 0.1;

    return Math.max(0.5, Math.min(1.0, confidence));
  }

  /**
   * 获取备用回复
   */
  private getFallbackReply(): string {
    const fallbacks = [
      '抱歉，我没听清楚，您能再说一遍吗',
      '不好意思，请您再说一次好吗',
      '您好，我想更好地了解您的需求，能详细说说吗'
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  /**
   * 获取对话历史
   */
  public getConversationHistory(callId: string): ConversationMessage[] {
    const conversation = this.conversations.get(callId);
    return conversation ? conversation.messages : [];
  }

  /**
   * 获取对话统计
   */
  public getConversationStats(callId: string): any {
    const conversation = this.conversations.get(callId);
    if (!conversation) {
      return null;
    }

    const duration = Date.now() - conversation.startTime.getTime();
    const userMessages = conversation.messages.filter(m => m.role === 'user').length;
    const aiMessages = conversation.messages.filter(m => m.role === 'assistant').length;

    return {
      callId,
      duration: Math.floor(duration / 1000),
      totalInteractions: conversation.totalInteractions,
      userMessages,
      aiMessages,
      averageResponseTime: duration / Math.max(1, conversation.totalInteractions),
      aiModel: conversation.aiModel
    };
  }

  /**
   * 结束对话会话
   */
  public endConversation(callId: string): void {
    const conversation = this.conversations.get(callId);
    if (!conversation) {
      return;
    }

    const stats = this.getConversationStats(callId);
    console.log(`🤖 结束AI对话会话: ${callId}`);
    console.log(`   总交互次数: ${stats.totalInteractions}`);
    console.log(`   对话时长: ${stats.duration}秒`);

    // 发出结束事件
    this.emit('conversation-ended', {
      callId,
      stats,
      messages: conversation.messages
    });

    // 删除会话
    this.conversations.delete(callId);
  }

  /**
   * 获取活跃会话数
   */
  public getActiveConversationCount(): number {
    return this.conversations.size;
  }
}

// 导出单例
export const aiCallAssistantService = AICallAssistantService.getInstance();

