<template>
  <UnifiedCenterLayout
    title="页面标题"
    description="页面描述"
    icon="User"
  >
    <div class="center-container customer-sop-detail" v-loading="loading">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/teacher-center/customer-tracking' }">
          客户跟踪
        </el-breadcrumb-item>
        <el-breadcrumb-item>{{ customerName }}</el-breadcrumb-item>
      </el-breadcrumb>
      
      <div class="header-actions">
        <el-button @click="handleBack">
          <UnifiedIcon name="ArrowLeft" />
          返回列表
        </el-button>
        <el-button type="primary" @click="handleEdit">
          <UnifiedIcon name="Edit" />
          编辑客户
        </el-button>
      </div>
    </div>

    <!-- 客户概览卡片 -->
    <el-row :gutter="16" class="overview-section">
      <el-col :span="8">
        <CustomerInfoCard :customer-id="customerId" />
      </el-col>
      <el-col :span="8">
        <SOPProgressCard
          :customer-id="customerId"
          :progress="sopProgress"
          :current-stage="currentStage"
        />
      </el-col>
      <el-col :span="8">
        <SuccessProbabilityCard
          :customer-id="customerId"
          :probability="successProbability"
        />
      </el-col>
    </el-row>

    <!-- SOP阶段流程 -->
    <el-card class="sop-flow-section">
      <template #header>
        <div class="section-header">
          <h3>SOP阶段流程</h3>
        </div>
      </template>
      <SOPStageFlow
        :customer-id="customerId"
        :stages="sopStages"
        :current-stage="currentStage"
        :progress="sopProgress"
        @stage-change="handleStageChange"
        @task-complete="handleTaskComplete"
        @advance-stage="handleAdvanceStage"
      />
    </el-card>

    <!-- 对话记录和截图 -->
    <el-row :gutter="16" class="conversation-section">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="section-header">
              <h3>
                <UnifiedIcon name="ChatDotRound" />
                对话记录
              </h3>
            </div>
          </template>
          
          <ConversationTimeline
            :customer-id="customerId"
            :conversations="conversations"
            @add-conversation="handleAddConversation"
            @batch-import="handleBatchImport"
          />
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="section-header">
              <h3>
                <UnifiedIcon name="Picture" />
                截图上传
              </h3>
            </div>
          </template>
          
          <ScreenshotUpload
            :customer-id="customerId"
            :screenshots="screenshots"
            @upload="handleUploadScreenshot"
            @analyze="handleAnalyzeScreenshot"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- AI智能建议 -->
    <el-card class="ai-suggestion-section">
      <template #header>
        <div class="section-header">
          <h3>
            <UnifiedIcon name="MagicStick" />
            AI智能建议
          </h3>
        </div>
      </template>
      
      <AISuggestionPanel
        :customer-id="customerId"
        :task-suggestion="taskSuggestion"
        :global-analysis="globalAnalysis"
        @get-task-suggestion="handleGetTaskSuggestion"
        @get-global-analysis="handleGetGlobalAnalysis"
      />
    </el-card>

    <!-- 数据统计 -->
    <el-card class="statistics-section">
      <template #header>
        <div class="section-header">
          <h3>
            <UnifiedIcon name="DataAnalysis" />
            数据统计
          </h3>
        </div>
      </template>
      
      <DataStatistics :customer-id="customerId" />
    </el-card>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue';

// Composables
import { useSOPProgress } from '@/composables/useSOPProgress';
import { useConversations } from '@/composables/useConversations';
import { useAISuggestions } from '@/composables/useAISuggestions';

// Components
import CustomerInfoCard from './components/CustomerInfoCard.vue';
import SOPProgressCard from './components/SOPProgressCard.vue';
import SuccessProbabilityCard from './components/SuccessProbabilityCard.vue';
import SOPStageFlow from './components/SOPStageFlow.vue';
import ConversationTimeline from './components/ConversationTimeline.vue';
import ScreenshotUpload from './components/ScreenshotUpload.vue';
import AISuggestionPanel from './components/AISuggestionPanel.vue';
import DataStatistics from './components/DataStatistics.vue';

// 路由
const route = useRoute();
const router = useRouter();

// 客户ID
const customerId = computed(() => Number(route.params.id));
const customerName = ref('加载中...');

// 使用Composables
const {
  loading: sopLoading,
  sopStages,
  sopProgress,
  currentStage,
  successProbability,
  completeTask,
  advanceStage
} = useSOPProgress(customerId.value);

const {
  loading: conversationLoading,
  conversations,
  screenshots,
  addConversation,
  addConversationsBatch,
  uploadScreenshot,
  analyzeScreenshot
} = useConversations(customerId.value);

const {
  loading: aiLoading,
  taskSuggestion,
  globalAnalysis,
  getTaskSuggestion,
  getGlobalAnalysis
} = useAISuggestions(customerId.value);

// 综合loading状态
const loading = computed(() => 
  sopLoading.value || conversationLoading.value || aiLoading.value
);

// 方法
function handleBack() {
  router.push('/teacher-center/customer-tracking');
}

function handleEdit() {
  // TODO: 打开编辑对话框
  ElMessage.info('编辑功能开发中');
}

function handleStageChange(stageId: number) {
  // 阶段切换
  console.log('切换到阶段:', stageId);
}

async function handleTaskComplete(taskId: number) {
  try {
    await completeTask(taskId);
  } catch (error) {
    console.error('完成任务失败:', error);
  }
}

async function handleAdvanceStage() {
  try {
    await advanceStage();
  } catch (error) {
    console.error('推进阶段失败:', error);
  }
}

async function handleAddConversation(data: any) {
  try {
    await addConversation(data);
  } catch (error) {
    console.error('添加对话失败:', error);
  }
}

async function handleBatchImport(conversations: any[]) {
  try {
    await addConversationsBatch(conversations);
  } catch (error) {
    console.error('批量导入对话失败:', error);
  }
}

async function handleUploadScreenshot(data: any) {
  try {
    await uploadScreenshot(data);
  } catch (error) {
    console.error('上传截图失败:', error);
  }
}

async function handleAnalyzeScreenshot(screenshotId: number) {
  try {
    await analyzeScreenshot(screenshotId);
  } catch (error) {
    console.error('分析截图失败:', error);
  }
}

async function handleGetTaskSuggestion(taskId: number) {
  try {
    await getTaskSuggestion(taskId);
  } catch (error) {
    console.error('获取任务建议失败:', error);
  }
}

async function handleGetGlobalAnalysis() {
  try {
    await getGlobalAnalysis();
  } catch (error) {
    console.error('获取全局分析失败:', error);
  }
}

// 加载客户信息
async function loadCustomerInfo() {
  // TODO: 从API加载客户基本信息
  customerName.value = '张女士';
}

onMounted(() => {
  loadCustomerInfo();
});
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.customer-sop-detail {
  padding: var(--spacing-lg);
  background-color: var(--el-bg-color-page);
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: var(--border-width-base) solid var(--el-border-color-light);

  .header-actions {
    display: flex;
    gap: var(--spacing-md);
  }
}

.overview-section {
  margin-bottom: var(--spacing-2xl);
}

.sop-flow-section {
  margin-bottom: var(--spacing-2xl);

  :deep(.el-card) {
    backdrop-filter: blur(10px);
    background: var(--el-bg-color, var(--white-alpha-90)) !important;
    border: var(--border-width-base) solid var(--el-border-color, var(--shadow-light)) !important;
    box-shadow: 0 var(--spacing-sm) var(--spacing-3xl) rgba(31, 38, 135, 0.1) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 var(--text-sm) 40px rgba(31, 38, 135, 0.15) !important;
    }
  }
}

.conversation-section {
  margin-bottom: var(--spacing-2xl);

  :deep(.el-card) {
    backdrop-filter: blur(10px);
    background: var(--el-bg-color, var(--white-alpha-90)) !important;
    border: var(--border-width-base) solid var(--el-border-color, var(--shadow-light)) !important;
    box-shadow: 0 var(--spacing-sm) var(--spacing-3xl) rgba(31, 38, 135, 0.1) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 var(--text-sm) 40px rgba(31, 38, 135, 0.15) !important;
    }
  }
}

.ai-suggestion-section {
  margin-bottom: var(--spacing-2xl);

  :deep(.el-card) {
    backdrop-filter: blur(10px);
    background: var(--el-bg-color, var(--white-alpha-90)) !important;
    border: var(--border-width-base) solid var(--el-border-color, var(--shadow-light)) !important;
    box-shadow: 0 var(--spacing-sm) var(--spacing-3xl) rgba(31, 38, 135, 0.1) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 var(--text-sm) 40px rgba(31, 38, 135, 0.15) !important;
    }
  }
}

.statistics-section {
  margin-bottom: var(--spacing-2xl);

  :deep(.el-card) {
    backdrop-filter: blur(10px);
    background: var(--el-bg-color, var(--white-alpha-90)) !important;
    border: var(--border-width-base) solid var(--el-border-color, var(--shadow-light)) !important;
    box-shadow: 0 var(--spacing-sm) var(--spacing-3xl) rgba(31, 38, 135, 0.1) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 var(--text-sm) 40px rgba(31, 38, 135, 0.15) !important;
    }
  }
}

.section-header {
  h3 {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin: 0;
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

@media (max-width: var(--breakpoint-md)) {
  .customer-sop-detail {
    padding: var(--spacing-md);
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .header-actions {
    width: 100%;

    button {
      flex: 1;
    }
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .customer-sop-detail {
    padding: var(--spacing-sm);
  }
}
</style>

