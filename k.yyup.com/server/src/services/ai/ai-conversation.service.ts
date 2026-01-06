/**
 * AI对话服务 - 简化版占位符
 */

export class AIConversationService {
  private static instance: AIConversationService;

  static getInstance(): AIConversationService {
    if (!AIConversationService.instance) {
      AIConversationService.instance = new AIConversationService();
    }
    return AIConversationService.instance;
  }

  async createConversation(userId: number): Promise<any> {
    console.log('💬 创建对话:', userId);
    return {
      id: Date.now(),
      userId,
      createdAt: new Date()
    };
  }

  async addMessage(conversationId: number, message: any): Promise<any> {
    console.log('📝 添加消息:', conversationId, message);
    return { added: true };
  }
}

export const AIConversationServiceClass = AIConversationService.getInstance();
export default AIConversationService;
