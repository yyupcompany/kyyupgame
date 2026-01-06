import { ref, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as teacherSOPAPI from '@/api/modules/teacher-sop';
import type { SOPStage, SOPTask, CustomerSOPProgress } from '@/api/modules/teacher-sop';

/**
 * SOP进度管理 Composable
 */
export function useSOPProgress(customerId: number) {
  // 状态
  const loading = ref(false);
  const sopStages = ref<SOPStage[]>([]);
  const sopProgress = ref<CustomerSOPProgress | null>(null);
  const currentStageTasks = ref<SOPTask[]>([]);

  // 计算属性
  const currentStage = computed(() => {
    if (!sopProgress.value || !sopStages.value.length) return null;
    return sopStages.value.find(s => s.id === sopProgress.value!.currentStageId);
  });

  const completedTasksCount = computed(() => {
    return sopProgress.value?.completedTasks?.length || 0;
  });

  const totalTasksCount = computed(() => {
    return currentStageTasks.value.length;
  });

  const stageProgress = computed(() => {
    return sopProgress.value?.stageProgress || 0;
  });

  const successProbability = computed(() => {
    return sopProgress.value?.successProbability || 50;
  });

  const canAdvanceStage = computed(() => {
    if (!sopProgress.value || !currentStageTasks.value.length) return false;
    
    const requiredTasks = currentStageTasks.value.filter(t => t.isRequired);
    const completedTasks = sopProgress.value.completedTasks || [];
    
    return requiredTasks.every(task => completedTasks.includes(task.id));
  });

  // 方法
  async function loadSOPStages() {
    try {
      loading.value = true;
      const response = await teacherSOPAPI.getAllStages();
      if (response.success && response.data) {
        sopStages.value = response.data;
      }
    } catch (error) {
      console.error('加载SOP阶段失败:', error);
      ElMessage.error('加载SOP阶段失败');
    } finally {
      loading.value = false;
    }
  }

  async function loadSOPProgress() {
    try {
      loading.value = true;
      const response = await teacherSOPAPI.getCustomerProgress(customerId);
      if (response.success && response.data) {
        sopProgress.value = response.data;
        
        // 加载当前阶段的任务
        if (response.data.currentStageId) {
          await loadCurrentStageTasks(response.data.currentStageId);
        }
      }
    } catch (error) {
      console.error('加载SOP进度失败:', error);
      ElMessage.error('加载SOP进度失败');
    } finally {
      loading.value = false;
    }
  }

  async function loadCurrentStageTasks(stageId: number) {
    try {
      const response = await teacherSOPAPI.getTasksByStage(stageId);
      if (response.success && response.data) {
        currentStageTasks.value = response.data;
      }
    } catch (error) {
      console.error('加载阶段任务失败:', error);
      ElMessage.error('加载阶段任务失败');
    }
  }

  async function completeTask(taskId: number) {
    try {
      loading.value = true;
      const response = await teacherSOPAPI.completeTask(customerId, taskId);
      if (response.success && response.data) {
        sopProgress.value = response.data;
        ElMessage.success('任务已完成');
        
        // 检查是否可以推进阶段
        if (canAdvanceStage.value) {
          ElMessageBox.confirm(
            '当前阶段的所有必需任务已完成，是否推进到下一阶段？',
            '提示',
            {
              confirmButtonText: '推进下一阶段',
              cancelButtonText: '稍后再说',
              type: 'success'
            }
          ).then(() => {
            advanceStage();
          }).catch(() => {
            // 用户取消
          });
        }
      }
    } catch (error) {
      console.error('完成任务失败:', error);
      ElMessage.error('完成任务失败');
    } finally {
      loading.value = false;
    }
  }

  async function advanceStage() {
    try {
      loading.value = true;
      const response = await teacherSOPAPI.advanceToNextStage(customerId);
      if (response.success && response.data) {
        sopProgress.value = response.data;
        ElMessage.success('已进入下一阶段');
        
        // 重新加载任务
        if (response.data.currentStageId) {
          await loadCurrentStageTasks(response.data.currentStageId);
        }
      }
    } catch (error: any) {
      console.error('推进阶段失败:', error);
      ElMessage.error(error.message || '推进阶段失败');
    } finally {
      loading.value = false;
    }
  }

  async function updateProgress(data: Partial<CustomerSOPProgress>) {
    try {
      loading.value = true;
      const response = await teacherSOPAPI.updateCustomerProgress(customerId, data);
      if (response.success && response.data) {
        sopProgress.value = response.data;
        ElMessage.success('进度已更新');
      }
    } catch (error) {
      console.error('更新进度失败:', error);
      ElMessage.error('更新进度失败');
    } finally {
      loading.value = false;
    }
  }

  function isTaskCompleted(taskId: number): boolean {
    return sopProgress.value?.completedTasks?.includes(taskId) || false;
  }

  function getStageByOrder(orderNum: number): SOPStage | undefined {
    return sopStages.value.find(s => s.orderNum === orderNum);
  }

  function isStageCompleted(stageId: number): boolean {
    if (!sopProgress.value || !currentStage.value) return false;
    const stage = sopStages.value.find(s => s.id === stageId);
    if (!stage) return false;
    return stage.orderNum < currentStage.value.orderNum;
  }

  function isStageActive(stageId: number): boolean {
    return sopProgress.value?.currentStageId === stageId;
  }

  // 初始化
  async function initialize() {
    await loadSOPStages();
    await loadSOPProgress();
  }

  // 监听customerId变化
  watch(() => customerId, () => {
    if (customerId) {
      initialize();
    }
  }, { immediate: true });

  return {
    // 状态
    loading,
    sopStages,
    sopProgress,
    currentStageTasks,
    
    // 计算属性
    currentStage,
    completedTasksCount,
    totalTasksCount,
    stageProgress,
    successProbability,
    canAdvanceStage,
    
    // 方法
    loadSOPStages,
    loadSOPProgress,
    loadCurrentStageTasks,
    completeTask,
    advanceStage,
    updateProgress,
    isTaskCompleted,
    getStageByOrder,
    isStageCompleted,
    isStageActive,
    initialize
  };
}

