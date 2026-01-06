import { defineStore } from 'pinia';
import { chatApi } from '../../api/chat';
import {
  Conversation,
  SendMessageRequest,
  SaveMessageRequest
} from '../../types/chat';

interface ChatState {
  conversations: Record<string, Conversation>;
  currentConversationId: string | null;
}

export const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
    conversations: {},
    currentConversationId: null
  }),
  
  getters: {
    currentConversation(state) {
      if (!state.currentConversationId) return null;
      return state.conversations[state.currentConversationId] || null;
    },
    
    allConversations(state) {
      return Object.values(state.conversations).sort((a, b) => 
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );
    }
  },
  
  actions: {
    setCurrentConversation(conversationId: string) {
      this.currentConversationId = conversationId;
    },
    
    async createConversation(title = '新对话') {
      try {
        // 调用API创建会话
        const result = await chatApi.createConversation(title);
        const conversationId = result.id;
        
        // 本地状态更新
      const conversation: Conversation = {
        id: conversationId,
        title,
        messages: [],
        lastUpdated: new Date().toISOString()
      };
      
      this.conversations[conversationId] = conversation;
      this.currentConversationId = conversationId;
      
      return conversationId;
      } catch (error) {
        console.error('创建会话失败:', error);
        throw error;
      }
    },
    
    async saveMessage({ conversationId, message }: SaveMessageRequest) {
      // 确保会话存在
      if (!this.conversations[conversationId]) {
        await this.loadMessages(conversationId);
      }
      
      // 更新本地状态
      if (this.conversations[conversationId]) {
      this.conversations[conversationId].messages.push(message);
      this.conversations[conversationId].lastUpdated = new Date().toISOString();
      
      // 如果是AI消息，可能需要更新会话标题
      if (message.role === 'assistant' && this.conversations[conversationId].messages.length === 2) {
        const userMessage = this.conversations[conversationId].messages[0];
        if (userMessage && userMessage.role === 'user') {
          // 生成基于第一条用户消息的会话标题
          this.conversations[conversationId].title = userMessage.content.substring(0, 20) + (userMessage.content.length > 20 ? '...' : '');
          }
        }
      }
      
      // 调用API保存消息
      try {
        await chatApi.saveMessage(conversationId, message);
        return true;
      } catch (error) {
        console.error('保存消息失败:', error);
        throw error;
      }
    },
    
    async loadMessages(conversationId: string) {
      try {
        // 调用API加载消息
        const result = await chatApi.getMessages(conversationId);
        
        // 获取会话信息
        const conversationInfo = await chatApi.getConversation(conversationId);
        
        // 更新本地状态
        const conversation: Conversation = {
          id: conversationId,
          title: conversationInfo.title || '对话',
          messages: result,
          lastUpdated: conversationInfo.lastUpdated || new Date().toISOString()
        };
        
        this.conversations[conversationId] = conversation;
        return conversation.messages;
      } catch (error) {
        console.error('加载消息失败:', error);
        
        // 如果API调用失败，但本地有缓存，返回本地缓存
        if (this.conversations[conversationId]) {
          return this.conversations[conversationId].messages;
      }
        
        // 创建一个空会话
        const emptyConversation: Conversation = {
          id: conversationId,
          title: '新对话',
          messages: [],
          lastUpdated: new Date().toISOString()
        };
        
        this.conversations[conversationId] = emptyConversation;
        return emptyConversation.messages;
      }
    },
    
    async sendMessage({ conversationId, message, modelId }: SendMessageRequest) {
      try {
        // 调用API发送消息
        const response = await chatApi.sendMessage(conversationId, message, modelId);
        return response;
      } catch (error) {
        console.error('发送消息失败:', error);
        throw error;
      }
    },
    
    async uploadImage({ conversationId, formData, modelId }: { conversationId: string, formData: FormData, modelId?: number }) {
      try {
        // 调用API上传图片
        const response = await chatApi.uploadImage(conversationId, formData, modelId);
        return response;
      } catch (error) {
        console.error('图片处理失败:', error);
        throw error;
      }
    },
    
    async transcribeAudio(formData: FormData) {
      try {
        // 调用API进行语音转写
        const response = await chatApi.transcribeAudio(formData);
        return response;
      } catch (error) {
        console.error('语音识别失败:', error);
        throw error;
      }
    },
    
    async clearConversation(conversationId: string) {
      // 清空本地会话中的所有消息
      if (this.conversations[conversationId]) {
        this.conversations[conversationId].messages = [];
        this.conversations[conversationId].lastUpdated = new Date().toISOString();
      }
      
      try {
        // 调用API清空服务器上的消息
        await chatApi.clearConversation(conversationId);
        return true;
      } catch (error) {
        console.error('清空对话失败:', error);
        throw error;
      }
    },
    
    async deleteConversation(conversationId: string) {
      // 删除本地会话
      if (this.conversations[conversationId]) {
        delete this.conversations[conversationId];
      }
      
      // 如果删除的是当前会话，重置当前会话ID
      if (this.currentConversationId === conversationId) {
        this.currentConversationId = null;
      }
      
      try {
        // 调用API删除服务器上的会话
        await chatApi.deleteConversation(conversationId);
        return true;
      } catch (error) {
        console.error('删除会话失败:', error);
        throw error;
      }
    },
    
    async loadAllConversations(params?: { keyword?: string; includeArchived?: boolean }) {
      try {
        // 调用API获取所有会话（支持关键字与归档筛选）
        const response = await chatApi.getAllConversations({
          keyword: params?.keyword,
          isArchived: params?.includeArchived ? true : undefined,
        });

        // 兼容不同响应包装
        let conversationsData = response;
        if (response && response.data) conversationsData = response.data;
        if (response && response.items) conversationsData = response.items;

        if (!Array.isArray(conversationsData)) {
          console.warn('获取的会话数据不是数组格式:', conversationsData);
          conversationsData = [];
        }

        // 更新本地状态
        const conversationsMap: Record<string, Conversation> = {};
        conversationsData.forEach((conv: any) => {
          const conversation: Conversation = {
            id: conv.id,
            title: conv.title || '未命名会话',
            messages: [],
            lastUpdated: conv.lastMessageAt || conv.updatedAt || new Date().toISOString(),
            summary: conv.summary || '',
            messageCount: conv.messageCount ?? conv.message_count ?? 0,
            unreadCount: conv.unreadCount ?? 0
          };
          conversationsMap[conv.id] = conversation;
        });

        this.conversations = conversationsMap;
        return conversationsData;
      } catch (error) {
        console.error('加载所有会话失败:', error);
        throw error;
      }
    }
  }
}); 