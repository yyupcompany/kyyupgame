/**
 * AI消息服务 - 简化版占位符
 */

export interface Message {
  id: string;
  content: string;
  role: string;
  timestamp: Date;
  conversationId?: string;
}

export class MessageService {
  private static instance: MessageService;

  static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  async saveMessage(message: Message): Promise<any> {
    console.log('💾 保存消息:', message);
    return { saved: true, id: message.id };
  }

  async getMessages(userId: string): Promise<Message[]> {
    console.log('📋 获取消息:', userId);
    return [];
  }

  /**
   * 发送消息
   * @param dataOrConversationId - 消息数据对象或对话ID
   * @param contentOrStream - 消息内容或是否流式（当第一个参数是对话ID时使用）
   * @param role - 角色（可选）
   */
  async sendMessage(
    dataOrConversationId: string | { conversationId: string; userId?: number; content: string; metadata?: any; pagePath?: string },
    contentOrStream?: string | boolean,
    role: string = 'user'
  ): Promise<Message | any> {
    let conversationId: string;
    let messageContent: string;
    let messageRole: string = role;
    let metadata: any = {};
    let isStream = false;

    if (typeof dataOrConversationId === 'object') {
      conversationId = dataOrConversationId.conversationId;
      messageContent = dataOrConversationId.content;
      metadata = dataOrConversationId.metadata || {};
      isStream = typeof contentOrStream === 'boolean' ? contentOrStream : false;
    } else {
      conversationId = dataOrConversationId;
      messageContent = typeof contentOrStream === 'string' ? contentOrStream : '';
    }

    console.log('📤 发送消息:', conversationId, messageContent, isStream ? '(流式)' : '');
    const message: Message = {
      id: `msg-${Date.now()}`,
      content: messageContent,
      role: messageRole,
      timestamp: new Date(),
      conversationId,
      ...metadata
    };
    await this.saveMessage(message);

    // 如果是流式请求，返回一个模拟的流对象
    if (isStream) {
      const { Readable } = require('stream');
      const stream = new Readable({
        read() {
          this.push(`data: ${JSON.stringify({ type: 'message', content: message.content })}\n\n`);
          this.push(null);
        }
      });
      return stream;
    }

    return message;
  }

  /**
   * 获取对话消息
   */
  async getConversationMessages(conversationId: string, userId?: number, options?: { page?: number; pageSize?: number }): Promise<{ messages: Message[]; total: number }> {
    console.log('📋 获取对话消息:', conversationId, userId, options);
    return { messages: [], total: 0 };
  }

  /**
   * 获取单条消息
   */
  async getMessage(messageId: string): Promise<Message | null> {
    console.log('📋 获取消息:', messageId);
    return null;
  }

  /**
   * 删除消息
   */
  async deleteMessage(messageId: string): Promise<boolean> {
    console.log('🗑️ 删除消息:', messageId);
    return true;
  }

  /**
   * 创建消息
   */
  async createMessage(data: { conversationId: string; content: string; role?: string }): Promise<Message> {
    console.log('📝 创建消息:', data);
    const message: Message = {
      id: `msg-${Date.now()}`,
      content: data.content,
      role: data.role || 'user',
      timestamp: new Date(),
      conversationId: data.conversationId
    };
    return message;
  }

  /**
   * 更新消息状态
   */
  async updateMessageStatus(messageId: string, status: string): Promise<boolean> {
    console.log('🔄 更新消息状态:', messageId, status);
    return true;
  }

  /**
   * 更新消息元数据
   */
  async updateMessageMetadata(messageId: string, metadata: any): Promise<boolean> {
    console.log('🔄 更新消息元数据:', messageId, metadata);
    return true;
  }
}

export const messageService = MessageService.getInstance();
