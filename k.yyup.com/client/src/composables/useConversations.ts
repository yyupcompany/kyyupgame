import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import * as teacherSOPAPI from '@/api/modules/teacher-sop';
import type { ConversationRecord, ConversationScreenshot } from '@/api/modules/teacher-sop';

/**
 * 对话管理 Composable
 */
export function useConversations(customerId: number) {
  // 状态
  const loading = ref(false);
  const conversations = ref<ConversationRecord[]>([]);
  const screenshots = ref<ConversationScreenshot[]>([]);

  // 方法
  async function loadConversations() {
    try {
      loading.value = true;
      const response = await teacherSOPAPI.getConversations(customerId);
      if (response.success && response.data) {
        conversations.value = response.data;
      }
    } catch (error) {
      console.error('加载对话记录失败:', error);
      ElMessage.error('加载对话记录失败');
    } finally {
      loading.value = false;
    }
  }

  async function addConversation(data: {
    speakerType: 'teacher' | 'customer';
    content: string;
    messageType?: 'text' | 'image' | 'voice' | 'video';
    mediaUrl?: string;
  }) {
    try {
      loading.value = true;
      const response = await teacherSOPAPI.addConversation(customerId, data);
      if (response.success && response.data) {
        conversations.value.push(response.data);
        ElMessage.success('对话已添加');
        return response.data;
      }
    } catch (error) {
      console.error('添加对话失败:', error);
      ElMessage.error('添加对话失败');
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function addConversationsBatch(conversationList: Array<{
    speakerType: 'teacher' | 'customer';
    content: string;
    messageType?: 'text' | 'image' | 'voice' | 'video';
  }>) {
    try {
      loading.value = true;
      const response = await teacherSOPAPI.addConversationsBatch(customerId, conversationList);
      if (response.success && response.data) {
        conversations.value.push(...response.data);
        ElMessage.success(`已添加 ${response.data.length} 条对话记录`);
        return response.data;
      }
    } catch (error) {
      console.error('批量添加对话失败:', error);
      ElMessage.error('批量添加对话失败');
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function uploadScreenshot(data: {
    imageUrl: string;
    conversationId?: number;
  }) {
    try {
      loading.value = true;
      const response = await teacherSOPAPI.uploadScreenshot(customerId, data);
      if (response.success && response.data) {
        screenshots.value.push(response.data);
        ElMessage.success('截图已上传');
        return response.data;
      }
    } catch (error) {
      console.error('上传截图失败:', error);
      ElMessage.error('上传截图失败');
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function analyzeScreenshot(screenshotId: number) {
    try {
      loading.value = true;
      const response = await teacherSOPAPI.analyzeScreenshot(customerId, screenshotId);
      if (response.success && response.data) {
        // 更新截图的AI分析结果
        const screenshot = screenshots.value.find(s => s.id === screenshotId);
        if (screenshot) {
          screenshot.aiAnalysis = response.data.analysis;
          screenshot.recognizedText = response.data.recognizedText;
        }
        ElMessage.success('截图分析完成');
        return response.data;
      }
    } catch (error) {
      console.error('分析截图失败:', error);
      ElMessage.error('分析截图失败');
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // 初始化
  async function initialize() {
    await loadConversations();
  }

  return {
    // 状态
    loading,
    conversations,
    screenshots,
    
    // 方法
    loadConversations,
    addConversation,
    addConversationsBatch,
    uploadScreenshot,
    analyzeScreenshot,
    initialize
  };
}

