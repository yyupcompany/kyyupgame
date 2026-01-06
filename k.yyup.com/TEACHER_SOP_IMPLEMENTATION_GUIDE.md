# 教师客户跟踪SOP系统 - 实现指南

## 🚀 快速开始

本文档提供完整的代码实现指南，帮助你快速搭建SOP系统。

---

## 📁 文件结构

```
项目结构：

client/src/
├── pages/teacher-center/customer-tracking-sop/
│   ├── index.vue                          # 主页面
│   ├── components/
│   │   ├── SOPProgressBar.vue            # SOP进度条
│   │   ├── SOPTaskList.vue               # SOP任务清单
│   │   ├── ConversationTimeline.vue      # 对话时间线
│   │   ├── ConversationInput.vue         # 对话输入组件
│   │   ├── ScreenshotUpload.vue          # 截图上传组件
│   │   ├── AISuggestionDialog.vue        # AI建议弹窗
│   │   └── CustomerProfile.vue           # 客户画像卡片
│   └── composables/
│       ├── useSOPProgress.ts             # SOP进度管理
│       ├── useConversation.ts            # 对话管理
│       ├── useAISuggestion.ts            # AI建议
│       └── useScreenshotAnalysis.ts      # 截图分析

server/src/
├── controllers/
│   ├── teacher-sop.controller.ts         # SOP控制器
│   ├── conversation.controller.ts        # 对话控制器
│   └── ai-suggestion.controller.ts       # AI建议控制器
├── services/
│   ├── sop.service.ts                    # SOP服务
│   ├── conversation.service.ts           # 对话服务
│   ├── ai-bridge.service.ts              # AI桥接服务
│   └── screenshot-analysis.service.ts    # 截图分析服务
├── models/
│   ├── sop-stage.model.ts                # SOP阶段模型
│   ├── sop-task.model.ts                 # SOP任务模型
│   ├── customer-sop-progress.model.ts    # 客户进度模型
│   ├── conversation-record.model.ts      # 对话记录模型
│   └── conversation-screenshot.model.ts  # 截图模型
└── routes/
    ├── teacher-sop.routes.ts             # SOP路由
    └── conversation.routes.ts            # 对话路由
```

---

## 💻 核心代码实现

### 1. 前端主页面

```vue
<!-- client/src/pages/teacher-center/customer-tracking-sop/index.vue -->
<template>
  <div class="customer-tracking-sop">
    <!-- 客户信息头部 -->
    <el-card class="customer-header" shadow="never">
      <div class="header-content">
        <div class="customer-info">
          <el-avatar :size="60" :src="customer.avatar">
            {{ customer.name?.charAt(0) }}
          </el-avatar>
          <div class="info-text">
            <h2>{{ customer.name }}</h2>
            <div class="meta">
              <el-tag size="small">{{ customer.childAge }}岁</el-tag>
              <el-tag size="small" type="info">{{ customer.source }}</el-tag>
              <el-tag 
                size="small" 
                :type="getIntentionType(customer.intentionScore)"
              >
                意向度 {{ customer.intentionScore }}%
              </el-tag>
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <el-button type="primary" @click="showGlobalAIAnalysis">
            <el-icon><MagicStick /></el-icon>
            AI全局分析
          </el-button>
          <el-button @click="exportReport">
            <el-icon><Download /></el-icon>
            导出报告
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- SOP进度条 -->
    <SOPProgressBar
      :current-stage="sopProgress.currentStage"
      :stages="sopStages"
      :progress="sopProgress.stageProgress"
      @stage-click="handleStageClick"
    />

    <!-- 主内容区 -->
    <el-row :gutter="20" class="main-content">
      <!-- 左侧：SOP任务清单 -->
      <el-col :span="8">
        <el-card class="task-panel" shadow="never">
          <template #header>
            <div class="card-header">
              <span>SOP任务清单</span>
              <el-tag type="success">
                {{ completedTasksCount }}/{{ totalTasksCount }}
              </el-tag>
            </div>
          </template>
          
          <SOPTaskList
            :tasks="currentStageTasks"
            :completed-tasks="sopProgress.completedTasks"
            @task-complete="handleTaskComplete"
            @task-expand="handleTaskExpand"
            @show-ai-suggestion="handleShowAISuggestion"
          />
          
          <!-- 下一步建议 -->
          <div class="next-step-suggestion">
            <el-divider />
            <h4>
              <el-icon><Promotion /></el-icon>
              下一步建议
            </h4>
            <el-alert
              :title="nextStepSuggestion.title"
              type="info"
              :closable="false"
              show-icon
            >
              <p>{{ nextStepSuggestion.description }}</p>
              <el-button 
                size="small" 
                type="primary" 
                text
                @click="showNextStepAI"
              >
                查看AI详细分析
              </el-button>
            </el-alert>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：沟通记录 & Timeline -->
      <el-col :span="16">
        <el-card class="conversation-panel" shadow="never">
          <template #header>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="对话记录" name="conversation" />
              <el-tab-pane label="跟进历史" name="follow" />
              <el-tab-pane label="转化分析" name="analysis" />
            </el-tabs>
          </template>

          <!-- 对话记录Tab -->
          <div v-show="activeTab === 'conversation'" class="conversation-tab">
            <!-- 对话时间线 -->
            <ConversationTimeline
              :conversations="conversations"
              :loading="conversationLoading"
              @screenshot-analyze="handleScreenshotAnalyze"
              @message-edit="handleMessageEdit"
            />

            <!-- 对话输入 -->
            <ConversationInput
              @send-message="handleSendMessage"
              @upload-screenshot="handleUploadScreenshot"
              @voice-input="handleVoiceInput"
            />
          </div>

          <!-- 跟进历史Tab -->
          <div v-show="activeTab === 'follow'" class="follow-tab">
            <el-timeline>
              <el-timeline-item
                v-for="record in followRecords"
                :key="record.id"
                :timestamp="formatTime(record.followTime)"
                placement="top"
              >
                <el-card>
                  <div class="follow-record-content">
                    <!-- 跟进记录内容 -->
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>

          <!-- 转化分析Tab -->
          <div v-show="activeTab === 'analysis'" class="analysis-tab">
            <CustomerAnalysis :customer-id="customerId" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- AI建议弹窗 -->
    <AISuggestionDialog
      v-model="showAIDialog"
      :customer="customer"
      :task="currentTask"
      :conversation-history="conversations"
      :follow-records="followRecords"
      @apply-suggestion="handleApplySuggestion"
      @regenerate="handleRegenerateAI"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import SOPProgressBar from './components/SOPProgressBar.vue';
import SOPTaskList from './components/SOPTaskList.vue';
import ConversationTimeline from './components/ConversationTimeline.vue';
import ConversationInput from './components/ConversationInput.vue';
import AISuggestionDialog from './components/AISuggestionDialog.vue';
import CustomerAnalysis from './components/CustomerAnalysis.vue';
import { useSOPProgress } from './composables/useSOPProgress';
import { useConversation } from './composables/useConversation';
import { useAISuggestion } from './composables/useAISuggestion';

const route = useRoute();
const customerId = computed(() => Number(route.params.customerId));

// SOP进度管理
const {
  sopProgress,
  sopStages,
  currentStageTasks,
  completedTasksCount,
  totalTasksCount,
  loadSOPProgress,
  completeTask,
  advanceStage
} = useSOPProgress(customerId);

// 对话管理
const {
  conversations,
  conversationLoading,
  loadConversations,
  addConversation,
  uploadScreenshot,
  analyzeScreenshot
} = useConversation(customerId);

// AI建议
const {
  showAIDialog,
  currentTask,
  aiSuggestion,
  loadAISuggestion,
  regenerateAISuggestion
} = useAISuggestion();

// 其他状态
const activeTab = ref('conversation');
const customer = ref<any>({});
const followRecords = ref<any[]>([]);
const nextStepSuggestion = ref<any>({});

// 初始化
onMounted(async () => {
  await Promise.all([
    loadCustomerInfo(),
    loadSOPProgress(),
    loadConversations(),
    loadFollowRecords()
  ]);
});

// 加载客户信息
async function loadCustomerInfo() {
  // 实现加载逻辑
}

// 加载跟进记录
async function loadFollowRecords() {
  // 实现加载逻辑
}

// 处理任务完成
async function handleTaskComplete(taskId: number) {
  try {
    await completeTask(taskId);
    ElMessage.success('任务已完成');
    
    // 检查是否可以进入下一阶段
    if (canAdvanceStage()) {
      ElMessageBox.confirm(
        '当前阶段任务已完成，是否进入下一阶段？',
        '提示',
        {
          confirmButtonText: '进入下一阶段',
          cancelButtonText: '稍后再说',
          type: 'success'
        }
      ).then(() => {
        advanceStage();
      });
    }
  } catch (error) {
    ElMessage.error('操作失败');
  }
}

// 显示AI建议
async function handleShowAISuggestion(task: any) {
  currentTask.value = task;
  showAIDialog.value = true;
  await loadAISuggestion(task.id);
}

// 发送消息
async function handleSendMessage(message: any) {
  try {
    await addConversation({
      speakerType: 'teacher',
      content: message.content,
      messageType: message.type
    });
    ElMessage.success('已添加');
  } catch (error) {
    ElMessage.error('发送失败');
  }
}

// 上传截图
async function handleUploadScreenshot(file: File) {
  try {
    const result = await uploadScreenshot(file);
    ElMessage.success('截图已上传');
    
    // 自动分析截图
    const analysis = await analyzeScreenshot(result.id);
    
    // 显示分析结果
    ElMessageBox.alert(
      `<div>
        <p><strong>识别内容：</strong>${analysis.recognizedText}</p>
        <p><strong>客户关注点：</strong>${analysis.focusPoints.join('、')}</p>
        <p><strong>建议回复：</strong>${analysis.suggestedResponse}</p>
      </div>`,
      'AI截图分析',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '知道了'
      }
    );
  } catch (error) {
    ElMessage.error('上传失败');
  }
}

// 语音输入
async function handleVoiceInput(audioBlob: Blob) {
  try {
    // 调用语音转文字API
    const text = await voiceToText(audioBlob);
    
    // 添加到对话记录
    await addConversation({
      speakerType: 'teacher',
      content: text,
      messageType: 'voice'
    });
  } catch (error) {
    ElMessage.error('语音识别失败');
  }
}

// 截图分析
async function handleScreenshotAnalyze(screenshotId: number) {
  try {
    const analysis = await analyzeScreenshot(screenshotId);
    // 显示分析结果
  } catch (error) {
    ElMessage.error('分析失败');
  }
}

// 应用AI建议
function handleApplySuggestion(suggestion: any) {
  // 将AI建议应用到对话输入框
  // 或者自动完成某些任务
}

// 重新生成AI建议
async function handleRegenerateAI() {
  await regenerateAISuggestion(currentTask.value.id);
}

// 全局AI分析
async function showGlobalAIAnalysis() {
  // 显示全局AI分析弹窗
}

// 导出报告
function exportReport() {
  // 导出客户跟进报告
}
</script>

<style scoped lang="scss">
.customer-tracking-sop {
  padding: 20px;

  .customer-header {
    margin-bottom: 20px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .customer-info {
        display: flex;
        gap: 16px;

        .info-text {
          h2 {
            margin: 0 0 8px 0;
          }

          .meta {
            display: flex;
            gap: 8px;
          }
        }
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }
  }

  .main-content {
    margin-top: 20px;

    .task-panel,
    .conversation-panel {
      height: calc(100vh - 300px);
      overflow-y: auto;
    }

    .next-step-suggestion {
      margin-top: 20px;

      h4 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }
    }
  }
}
</style>
```

---

### 2. SOP进度条组件

```vue
<!-- client/src/pages/teacher-center/customer-tracking-sop/components/SOPProgressBar.vue -->
<template>
  <el-card class="sop-progress-bar" shadow="never">
    <div class="progress-header">
      <h3>SOP进度</h3>
      <div class="progress-stats">
        <span>当前阶段：{{ currentStage?.name }}</span>
        <span>进度：{{ progress }}%</span>
        <span>预计成交：{{ estimatedDays }}天后</span>
      </div>
    </div>

    <div class="progress-timeline">
      <div class="timeline-track">
        <div 
          class="timeline-progress" 
          :style="{ width: `${overallProgress}%` }"
        />
      </div>

      <div class="timeline-stages">
        <div
          v-for="(stage, index) in stages"
          :key="stage.id"
          class="stage-item"
          :class="{
            'is-active': stage.id === currentStage?.id,
            'is-completed': isStageCompleted(stage.id),
            'is-clickable': isStageClickable(stage.id)
          }"
          @click="handleStageClick(stage)"
        >
          <div class="stage-icon">
            <el-icon v-if="isStageCompleted(stage.id)">
              <CircleCheck />
            </el-icon>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="stage-name">{{ stage.name }}</div>
          <div class="stage-days">{{ stage.estimatedDays }}天</div>
        </div>
      </div>
    </div>

    <!-- 阶段详情 -->
    <el-collapse-transition>
      <div v-if="showStageDetail" class="stage-detail">
        <el-divider />
        <h4>{{ currentStage?.name }} - 阶段说明</h4>
        <p>{{ currentStage?.description }}</p>
        
        <div class="success-criteria">
          <h5>成功标志：</h5>
          <ul>
            <li 
              v-for="criterion in currentStage?.successCriteria?.checkpoints"
              :key="criterion"
            >
              {{ criterion }}
            </li>
          </ul>
        </div>
      </div>
    </el-collapse-transition>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  currentStage: any;
  stages: any[];
  progress: number;
}

const props = defineProps<Props>();
const emit = defineEmits(['stage-click']);

const showStageDetail = ref(true);

const overallProgress = computed(() => {
  const currentIndex = props.stages.findIndex(s => s.id === props.currentStage?.id);
  if (currentIndex === -1) return 0;
  
  const stageProgress = (currentIndex / props.stages.length) * 100;
  const withinStageProgress = (props.progress / 100) * (100 / props.stages.length);
  
  return Math.min(stageProgress + withinStageProgress, 100);
});

const estimatedDays = computed(() => {
  // 计算预计成交天数
  const currentIndex = props.stages.findIndex(s => s.id === props.currentStage?.id);
  if (currentIndex === -1) return 0;
  
  let days = 0;
  for (let i = currentIndex; i < props.stages.length; i++) {
    days += props.stages[i].estimatedDays || 0;
  }
  
  return Math.ceil(days * (1 - props.progress / 100));
});

function isStageCompleted(stageId: number) {
  const currentIndex = props.stages.findIndex(s => s.id === props.currentStage?.id);
  const stageIndex = props.stages.findIndex(s => s.id === stageId);
  return stageIndex < currentIndex;
}

function isStageClickable(stageId: number) {
  return true; // 允许查看所有阶段的详情
}

function handleStageClick(stage: any) {
  emit('stage-click', stage);
}
</script>

<style scoped lang="scss">
.sop-progress-bar {
  margin-bottom: 20px;

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h3 {
      margin: 0;
    }

    .progress-stats {
      display: flex;
      gap: 24px;
      font-size: 14px;
      color: #606266;

      span {
        &:not(:last-child)::after {
          content: '|';
          margin-left: 24px;
          color: #dcdfe6;
        }
      }
    }
  }

  .progress-timeline {
    position: relative;

    .timeline-track {
      height: 4px;
      background: #e4e7ed;
      border-radius: 2px;
      margin-bottom: 16px;

      .timeline-progress {
        height: 100%;
        background: linear-gradient(90deg, #409eff, #67c23a);
        border-radius: 2px;
        transition: width 0.3s ease;
      }
    }

    .timeline-stages {
      display: flex;
      justify-content: space-between;

      .stage-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        transition: all 0.3s;

        &.is-clickable:hover {
          transform: translateY(-2px);
        }

        &.is-completed {
          .stage-icon {
            background: #67c23a;
            color: white;
          }
        }

        &.is-active {
          .stage-icon {
            background: #409eff;
            color: white;
            box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.2);
          }

          .stage-name {
            color: #409eff;
            font-weight: bold;
          }
        }

        .stage-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e4e7ed;
          color: #909399;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 8px;
          transition: all 0.3s;
        }

        .stage-name {
          font-size: 14px;
          color: #606266;
          margin-bottom: 4px;
          text-align: center;
        }

        .stage-days {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }

  .stage-detail {
    h4 {
      margin: 16px 0 12px;
    }

    p {
      color: #606266;
      line-height: 1.6;
    }

    .success-criteria {
      margin-top: 16px;

      h5 {
        margin: 0 0 8px;
        color: #303133;
      }

      ul {
        margin: 0;
        padding-left: 20px;

        li {
          color: #606266;
          line-height: 1.8;
        }
      }
    }
  }
}
</style>
```

---

## 📝 后续文档

由于篇幅限制，以下内容将在后续文档中提供：

1. **SOPTaskList组件** - 任务清单组件
2. **ConversationTimeline组件** - 对话时间线组件
3. **AISuggestionDialog组件** - AI建议弹窗
4. **后端API实现** - 完整的后端代码
5. **数据库迁移脚本** - 数据库初始化
6. **AI提示词模板** - AI建议的提示词

---

**下一步**: 查看 `TEACHER_CUSTOMER_SOP_SOLUTION.md` 了解完整方案设计。

