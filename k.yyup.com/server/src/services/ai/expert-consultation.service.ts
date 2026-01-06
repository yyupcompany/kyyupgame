/**
 * 专家咨询服务
 * 提供专业领域的AI咨询功能
 */

import { unifiedAIBridge } from '../unified-ai-bridge.service';

export interface ConsultationRequest {
  userId: number;
  domain?: string;
  question?: string;
  query?: string;  // 别名，兼容控制器
  context?: string;
  preferences?: any;
}

export interface ConsultationResponse {
  id: string;
  answer: string;
  references?: string[];
  confidence: number;
  domain: string;
}

class ExpertConsultationService {
  /**
   * 创建咨询
   */
  async createConsultation(request: ConsultationRequest): Promise<ConsultationResponse> {
    console.log('🎓 [专家咨询] 处理咨询请求:', request.domain);

    try {
      const systemPrompt = this.getExpertPrompt(request.domain);

      // 🔧 修复：使用豆包 1.6 flash 模型（快速决策模型）
      const response = await unifiedAIBridge.chat({
        model: 'doubao-seed-1-6-flash-250715',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: request.question }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const answer = response.data?.content || response.data?.message || '';

      return {
        id: `consultation-${Date.now()}`,
        answer,
        references: [],
        confidence: 0.85,
        domain: request.domain
      };
    } catch (error: any) {
      console.error('❌ [专家咨询] 咨询失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取专家系统提示
   */
  private getExpertPrompt(domain: string): string {
    const prompts: Record<string, string> = {
      education: '你是一位资深的幼儿教育专家，拥有20年以上的教学经验。请用专业但易懂的语言回答问题。',
      health: '你是一位儿童保健专家，专注于幼儿健康与发展。请提供科学、准确的健康建议。',
      psychology: '你是一位儿童心理学家，擅长处理幼儿行为和情绪问题。请给出专业的心理学建议。',
      nutrition: '你是一位儿童营养师，专注于幼儿膳食与营养。请提供科学的饮食建议。',
      default: '你是一位幼儿园管理专家，请根据你的专业知识回答问题。'
    };

    return prompts[domain] || prompts.default;
  }

  /**
   * 获取支持的咨询领域
   */
  getSupportedDomains(): string[] {
    return ['education', 'health', 'psychology', 'nutrition', 'management'];
  }

  /**
   * 获取咨询历史
   */
  async getConsultationHistory(userId: number): Promise<any[]> {
    // TODO: 实现咨询历史查询
    return [];
  }

  /**
   * 开始咨询会话
   */
  async startConsultation(request: ConsultationRequest): Promise<any> {
    return this.createConsultation(request);
  }

  /**
   * 获取下一个专家发言
   */
  async getNextExpertSpeech(consultationId: string): Promise<any> {
    return { consultationId, speech: '', isComplete: true };
  }

  /**
   * 获取专家发言流
   */
  async getExpertSpeechStream(consultationId: string): Promise<any> {
    return { consultationId, stream: null };
  }

  /**
   * 获取咨询进度
   */
  async getConsultationProgress(consultationId: string): Promise<any> {
    return { consultationId, progress: 100, status: 'completed' };
  }

  /**
   * 获取咨询摘要
   */
  async getConsultationSummary(consultationId: string): Promise<any> {
    return { consultationId, summary: '', keyPoints: [] };
  }

  /**
   * 生成行动计划
   */
  async generateActionPlan(consultationId: string): Promise<any> {
    return { consultationId, actions: [], priority: 'normal' };
  }

  /**
   * 获取咨询会话
   */
  async getConsultationSession(consultationId: string): Promise<any> {
    return { id: consultationId, status: 'active', messages: [] };
  }

  /**
   * 获取用户咨询列表
   */
  async getUserConsultations(userId: number): Promise<any[]> {
    return this.getConsultationHistory(userId);
  }
}

export const expertConsultationService = new ExpertConsultationService();
export default expertConsultationService;

