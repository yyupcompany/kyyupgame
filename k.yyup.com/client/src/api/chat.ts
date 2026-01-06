import { post, get } from '../utils/request';
import request from '../utils/request';
import { AI_ENDPOINTS } from './endpoints';
import { Message } from '../types/chat';

/**
 * 聊天API服务
 * 处理与AI聊天相关的API调用
 */
export const chatApi = {
  /**
   * 创建新会话
   * @param title 会话标题
   * @param modelId 模型ID
   */
  async createConversation(title?: string, modelId?: number) {
    try {
      const response = await post(AI_ENDPOINTS.CONVERSATIONS, {
        title: title || '新对话',
        modelId
      });
      return response.data;
    } catch (error) {
      console.error('创建会话失败:', error);
      throw error;
    }
  },

  /**
   * 获取会话信息
   * @param conversationId 会话ID
   */
  async getConversation(conversationId: string) {
    try {
      const response = await get(AI_ENDPOINTS.CONVERSATION_BY_ID(conversationId));
      return response.data;
    } catch (error) {
      console.error('获取会话信息失败:', error);
      throw error;
    }
  },

  /**
   * 获取会话消息列表
   * @param conversationId 会话ID
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const response = await get(AI_ENDPOINTS.CONVERSATION_MESSAGES(conversationId));
             return response.data.map((msg: any) => ({
         id: msg.id.toString(),
         role: msg.role,
         content: msg.content,
         timestamp: msg.createdAt,
         status: 'received' as const,
         components: msg.metadata?.components || []
       }));
    } catch (error) {
      console.error('获取消息列表失败:', error);
      throw error;
    }
  },

  /**
   * 发送消息
   * @param conversationId 会话ID
   * @param content 消息内容
   * @param modelId 模型ID
   */
  async sendMessage(conversationId: string, content: string, modelId?: number) {
    try {
      const response = await post(AI_ENDPOINTS.SEND_MESSAGE(conversationId), {
        content,
        metadata: { modelId }
      });

      return {
        content: response.data.content,
        components: response.data.metadata?.components || []
      };
    } catch (error) {
      console.error('发送消息失败:', error);
      throw error;
    }
  },

  /**
   * 保存消息到会话
   * @param conversationId 会话ID
   * @param message 消息对象
   */
  async saveMessage(conversationId: string, message: Message) {
    try {
      // 如果是用户消息，直接保存到后端
             if (message.role === 'user') {
         await post(AI_ENDPOINTS.SEND_MESSAGE(conversationId), {
           content: message.content,
           metadata: { components: message.components }
         });
       }
      // AI消息通常由sendMessage自动保存，这里可以跳过
      return true;
    } catch (error) {
      console.error('保存消息失败:', error);
      throw error;
    }
  },

  /**
   * 上传图片并处理
   * @param conversationId 会话ID
   * @param formData 图片数据
   * @param modelId 模型ID
   */
  async uploadImage(_conversationId: string, formData: FormData, _modelId?: number) {
    try {
      // 注意：这个API后端可能还未实现，暂时返回模拟响应
             const response = await post(AI_ENDPOINTS.UPLOAD_IMAGE, formData);
      
      return {
        content: response.data.description || '图片已上传并分析',
        components: response.data.components || []
      };
    } catch (error) {
      console.error('图片上传失败:', error);
      // 返回模拟响应
      return {
        content: '图片上传功能暂未开放，请稍后再试。',
        components: []
      };
    }
  },

  /**
   * 语音转文字
   * @param formData 音频数据
   */
  async transcribeAudio(formData: FormData) {
    try {
      // 注意：这个API后端可能还未实现，暂时返回模拟响应
             const response = await post(AI_ENDPOINTS.TRANSCRIBE_AUDIO, formData);
      
      return {
        text: response.data.text
      };
    } catch (error) {
      console.error('语音转写失败:', error);
      // 返回模拟响应
      return {
        text: '语音识别功能暂未开放，请使用文字输入。'
      };
    }
  },

  /**
   * 清空会话消息
   * @param conversationId 会话ID
   */
  async clearConversation(conversationId: string) {
    try {
      // 注意：后端可能没有专门的清空API，这里使用删除会话然后重新创建
      await request.del(AI_ENDPOINTS.CONVERSATION_BY_ID(conversationId));
      
      // 重新创建同名会话
      const newConversation = await this.createConversation('新对话');
      return newConversation;
    } catch (error) {
      console.error('清空会话失败:', error);
      throw error;
    }
  },

  /**
   * 删除会话
   * @param conversationId 会话ID
   */
  async deleteConversation(conversationId: string) {
    try {
      await request.del(AI_ENDPOINTS.CONVERSATION_BY_ID(conversationId));
      return true;
    } catch (error) {
      console.error('删除会话失败:', error);
      throw error;
    }
  },

  /**
   * 获取所有会话列表
   */
  async getAllConversations(params?: Record<string, any>) {
    try {
      const response = await get(AI_ENDPOINTS.CONVERSATIONS, params);
      return response.data;
    } catch (error) {
      console.error('获取会话列表失败:', error);
      throw error;
    }
  },

  /**
   * 更新会话标题
   */
  async updateConversationTitle(conversationId: string, title: string) {
    try {
      const response = await request.put(AI_ENDPOINTS.CONVERSATION_BY_ID(conversationId), { title });
      return response.data;
    } catch (error) {
      console.error('更新会话标题失败:', error);
      throw error;
    }
  },

  /**
   * 部分更新会话字段（归档、置顶、摘要等）
   */
  async updateConversation(conversationId: string, data: Record<string, any>) {
    try {
      const response = await request.patch(AI_ENDPOINTS.CONVERSATION_BY_ID(conversationId), data);
      return response.data;
    } catch (error) {
      console.error('更新会话失败:', error);
      throw error;
    }
  }
};

export default chatApi; 