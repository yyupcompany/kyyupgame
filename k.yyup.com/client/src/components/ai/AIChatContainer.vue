<template>
  <div class="chat-container">
    <div class="chat-header">
      <div class="chat-title">
        <h2>{{ title }}</h2>
        <span class="chat-subtitle" v-if="subtitle">{{ subtitle }}</span>
      </div>
      <div class="chat-actions">
        <el-button 
          class="btn-icon" 
          @click="clearChat" 
          title="清空对话"
          type="text"
          :icon="Delete"
        />
        <el-button 
          class="btn-icon" 
          @click="toggleSettings" 
          title="设置"
          type="text"
          :icon="Setting"
        />
      </div>
    </div>
    
    <MessageList 
      ref="messageList"
      :messages="messages" 
      :loading="loading"
      @retry="handleRetry"
    />
    
    <div class="chat-input-container">
      <MessageInput 
        :disabled="inputDisabled"
        @send="handleSendMessage"
        @upload-image="handleUploadImage"
        @voice-input="handleVoiceInput"
      />
    </div>
    
    <ChatSettings 
      v-if="showSettings"
      :modelConfig="modelConfig"
      @close="toggleSettings"
      @settings-changed="handleSettingsChanged"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, PropType, watch } from 'vue';
import { Delete, Setting } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { AI_ENDPOINTS } from '@/api/endpoints';
import { request } from '@/utils/request';
import type { ApiResponse } from '@/api/endpoints';

// 定义消息类型
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'received' | 'error';
  components?: Array<{
    type: 'chart' | 'table' | 'form' | 'image' | 'video' | 'audio';
    data: Record<string, any>;
    config?: Record<string, any>;
  }>;
  attachments?: Array<{
    type: string;
    url: string;
    name: string;
  }>;
}

// 定义设置类型
interface ModelConfig {
  modelId: number;
  modelName: string;
  contextWindow: number;
  maxTokens: number;
}

export default defineComponent({
  name: 'ChatContainer',
  
  components: {
    MessageList: () => import('./MessageList.vue'),
    MessageInput: () => import('./MessageInput.vue'),
    ChatSettings: () => import('./ChatSettings.vue')
  },
  
  props: {
    conversationId: {
      type: String,
      default: () => `conv_${Date.now()}`
    },
    title: {
      type: String,
      default: 'AI助手'
    },
    subtitle: {
      type: String,
      default: ''
    }
  },
  
  setup(props) {
    const messages = ref<Message[]>([]);
    const loading = ref(false);
    const inputDisabled = ref(false);
    const showSettings = ref(false);
    const messageList = ref<InstanceType<typeof import('./MessageList.vue').default> | null>(null);
    const modelConfig = ref<ModelConfig>({
      modelId: 1,
      modelName: '默认AI模型',
      contextWindow: 4096,
      maxTokens: 2048
    });
    
    // 加载消息历史
    const loadMessages = async () => {
      loading.value = true;
      try {
        const response: ApiResponse = await request.get(AI_ENDPOINTS.MESSAGE.LIST, {
          params: { conversationId: props.conversationId }
        });
        const loadedMessages = response.data?.items || [];
        messages.value = loadedMessages;
      } catch (error) {
        console.error('加载消息失败:', error);
        ElMessage.error('加载消息历史失败');
      } finally {
        loading.value = false;
      }
    };
    
    // 发送消息处理
    const handleSendMessage = async (content: string) => {
      if (!content.trim()) return;
      
      // 创建用户消息
      const userMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        status: 'sent'
      };
      
      // 添加到消息列表
      messages.value.push(userMessage);
      
      // 保存消息
      await request.post(AI_ENDPOINTS.MESSAGE.SAVE, {
        conversationId: props.conversationId,
        message: userMessage
      });
      
      // 禁用输入，显示加载状态
      inputDisabled.value = true;
      loading.value = true;
      
      try {
        // 发送到API并获取响应
        const response: ApiResponse = await request.post(AI_ENDPOINTS.MESSAGE.SEND, {
          conversationId: props.conversationId,
          content,
          modelId: modelConfig.value.modelId
        });
        
        // 创建AI响应消息
        const aiMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          content: response.data?.content || '',
          timestamp: new Date().toISOString(),
          status: 'received',
          components: response.data?.components
        };
        
        // 添加到消息列表
        messages.value.push(aiMessage);
        
        // 保存消息
        await request.post(AI_ENDPOINTS.MESSAGE.SAVE, {
          conversationId: props.conversationId,
          message: aiMessage
        });
      } catch (error) {
        console.error('发送消息失败:', error);
        ElMessage.error('发送消息失败，请重试');
        
        // 创建错误消息
        const errorMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          role: 'system',
          content: '消息发送失败，请重试。',
          timestamp: new Date().toISOString(),
          status: 'error'
        };
        
        // 添加到消息列表
        messages.value.push(errorMessage);
      } finally {
        // 恢复输入，隐藏加载状态
        inputDisabled.value = false;
        loading.value = false;
        
        // 滚动到底部
        setTimeout(() => {
          if (messageList.value) {
            messageList.value.scrollToBottom();
          }
        }, 100);
      }
    };
    
    // 处理图片上传
    const handleUploadImage = async (imageFile: File) => {
      // 创建带图片的用户消息
      const userMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: '',
        timestamp: new Date().toISOString(),
        status: 'sent',
        attachments: [{
          type: 'image',
          url: URL.createObjectURL(imageFile),
          name: imageFile.name
        }]
      };
      
      // 添加到消息列表
      messages.value.push(userMessage);
      
      // 禁用输入，显示加载状态
      inputDisabled.value = true;
      loading.value = true;
      
      try {
        // 上传图片并获取响应
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('conversationId', props.conversationId);
        
        formData.append('modelId', modelConfig.value.modelId.toString());
        
        const response: ApiResponse = await request.post(AI_ENDPOINTS.FILE.UPLOAD, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // 创建AI响应消息
        const aiMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          content: response.data?.content || '',
          timestamp: new Date().toISOString(),
          status: 'received',
          components: response.data?.components
        };
        
        // 添加到消息列表
        messages.value.push(aiMessage);
      } catch (error) {
        console.error('图片处理失败:', error);
        ElMessage.error('图片处理失败，请重试');
        
        // 创建错误消息
        const errorMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          role: 'system',
          content: '图片处理失败，请重试。',
          timestamp: new Date().toISOString(),
          status: 'error'
        };
        
        // 添加到消息列表
        messages.value.push(errorMessage);
      } finally {
        // 恢复输入，隐藏加载状态
        inputDisabled.value = false;
        loading.value = false;
        
        // 滚动到底部
        setTimeout(() => {
          if (messageList.value) {
            messageList.value.scrollToBottom();
          }
        }, 100);
      }
    };
    
    // 处理语音输入
    const handleVoiceInput = async (audioBlob: Blob) => {
      // 显示加载状态
      loading.value = true;
      
      try {
        // 上传音频文件
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice-input.webm');
        
        // 发送到语音转文字API
        const response = await store.chat.transcribeAudio(formData);
        
        if (response?.text) {
          // 将转写的文本输入到消息框
          handleSendMessage(response.text);
        } else {
          throw new Error('未能识别语音内容');
        }
      } catch (error) {
        console.error('语音识别失败:', error);
        ElMessage.error('语音识别失败，请重试');
      } finally {
        loading.value = false;
      }
    };
    
    // 重试发送消息
    const handleRetry = async (messageId: string) => {
      const messageIndex = messages.value.findIndex(m => m.id === messageId);
      if (messageIndex < 0) return;
      
      // 获取上一条用户消息
      const userMessage = messages.value[messageIndex - 1];
      if (!userMessage || userMessage.role !== 'user') return;
      
      // 移除错误消息
      messages.value.splice(messageIndex, 1);
      
      // 重新发送消息
      handleSendMessage(userMessage.content);
    };
    
    // 清空对话
    const clearChat = async () => {
      try {
        await store.chat.clearConversation(props.conversationId);
        messages.value = [];
        ElMessage.success('对话已清空');
      } catch (error) {
        console.error('清空对话失败:', error);
        ElMessage.error('清空对话失败');
      }
    };
    
    // 切换设置面板
    const toggleSettings = () => {
      showSettings.value = !showSettings.value;
    };
    
    // 处理设置变更
    const handleSettingsChanged = (newConfig: ModelConfig) => {
      modelConfig.value = newConfig;
      ElMessage.success('设置已更新');
      toggleSettings();
    };
    
    // 组件挂载后加载消息
    onMounted(() => {
      loadMessages();
    });
    
    // 监听会话ID变化重新加载消息
    watch(() => props.conversationId, () => {
      loadMessages();
    });
    
    return {
      messages,
      loading,
      inputDisabled,
      showSettings,
      messageList,
      modelConfig,
      handleSendMessage,
      handleUploadImage,
      handleVoiceInput,
      handleRetry,
      clearChat,
      toggleSettings,
      handleSettingsChanged,
      // 图标
      Delete,
      Setting
    };
  }
});
</script>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--el-bg-color);
  border-radius: var(--spacing-sm);
  box-shadow: var(--shadow-md);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-xs) var(--spacing-xl);
  border-bottom: var(--z-index-dropdown) solid var(--el-border-color-light);
  
  .chat-title {
    display: flex;
    flex-direction: column;
    
    h2 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
    
    .chat-subtitle {
      font-size: var(--text-xs);
      color: var(--el-text-color-secondary);
    }
  }
  
  .chat-actions {
    display: flex;
    gap: var(--spacing-sm);
  }
}

.chat-input-container {
  padding: var(--text-base);
  border-top: var(--z-index-dropdown) solid var(--el-border-color-light);
}
</style> 