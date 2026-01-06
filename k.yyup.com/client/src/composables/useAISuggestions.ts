import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import * as teacherSOPAPI from '@/api/modules/teacher-sop';
import type { AISuggestion } from '@/api/modules/teacher-sop';

/**
 * AI建议管理 Composable
 */
export function useAISuggestions(customerId: number) {
  // 状态
  const loading = ref(false);
  const taskSuggestion = ref<AISuggestion | null>(null);
  const globalAnalysis = ref<any>(null);
  const suggestionHistory = ref<Array<{
    id: string;
    type: 'task' | 'global';
    taskId?: number;
    suggestion: AISuggestion;
    createdAt: string;
  }>>([]);

  // 方法
  async function getTaskSuggestion(taskId: number) {
    try {
      loading.value = true;
      const response = await teacherSOPAPI.getTaskAISuggestion(customerId, taskId);
      if (response.success && response.data) {
        taskSuggestion.value = response.data;
        
        // 添加到历史记录
        suggestionHistory.value.unshift({
          id: `task-${taskId}-${Date.now()}`,
          type: 'task',
          taskId,
          suggestion: response.data,
          createdAt: new Date().toISOString()
        });
        
        ElMessage.success('AI建议已生成');
        return response.data;
      }
    } catch (error) {
      console.error('获取任务建议失败:', error);
      ElMessage.error('获取任务建议失败');
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function getGlobalAnalysis() {
    try {
      loading.value = true;
      const response = await teacherSOPAPI.getGlobalAIAnalysis(customerId);
      if (response.success && response.data) {
        globalAnalysis.value = response.data;
        
        // 添加到历史记录
        suggestionHistory.value.unshift({
          id: `global-${Date.now()}`,
          type: 'global',
          suggestion: response.data,
          createdAt: new Date().toISOString()
        });
        
        ElMessage.success('全局分析已生成');
        return response.data;
      }
    } catch (error) {
      console.error('获取全局分析失败:', error);
      ElMessage.error('获取全局分析失败');
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function clearTaskSuggestion() {
    taskSuggestion.value = null;
  }

  function clearGlobalAnalysis() {
    globalAnalysis.value = null;
  }

  function getSuggestionById(id: string) {
    return suggestionHistory.value.find(s => s.id === id);
  }

  function getTaskSuggestionHistory(taskId: number) {
    return suggestionHistory.value.filter(s => s.type === 'task' && s.taskId === taskId);
  }

  function getGlobalAnalysisHistory() {
    return suggestionHistory.value.filter(s => s.type === 'global');
  }

  return {
    // 状态
    loading,
    taskSuggestion,
    globalAnalysis,
    suggestionHistory,
    
    // 方法
    getTaskSuggestion,
    getGlobalAnalysis,
    clearTaskSuggestion,
    clearGlobalAnalysis,
    getSuggestionById,
    getTaskSuggestionHistory,
    getGlobalAnalysisHistory
  };
}

