<template>
  <div class="sop-stage-flow">
    <!-- 阶段导航条 -->
    <div class="stage-navigation">
      <div
        v-for="stage in stages"
        :key="stage.id"
        :class="['stage-item', getStageClass(stage)]"
        @click="handleStageClick(stage)"
      >
        <div class="stage-icon">
          <el-icon v-if="isStageCompleted(stage)"><Check /></el-icon>
          <el-icon v-else-if="isStageActive(stage)"><Loading /></el-icon>
          <span v-else>{{ stage.orderNum }}</span>
        </div>
        <div class="stage-name">{{ stage.name }}</div>
        <div v-if="stage.orderNum < stages.length" class="stage-connector"></div>
      </div>
    </div>

    <!-- 当前阶段详情 -->
    <div v-if="currentStage" class="stage-detail">
      <!-- 阶段信息 -->
      <div class="stage-info">
        <h3 class="stage-title">{{ currentStage.name }}</h3>
        <p v-if="currentStage.description" class="stage-description">
          {{ currentStage.description }}
        </p>
        <div class="stage-meta">
          <el-tag v-if="currentStage.estimatedDays" size="small">
            <el-icon><Clock /></el-icon>
            预计 {{ currentStage.estimatedDays }} 天
          </el-tag>
          <el-tag v-if="currentStage.successCriteria" type="success" size="small">
            <el-icon><Trophy /></el-icon>
            成功标志
          </el-tag>
        </div>
      </div>

      <!-- 任务清单 -->
      <div class="task-list">
        <h4 class="section-title">
          <el-icon><List /></el-icon>
          任务清单
        </h4>
        <div class="tasks">
          <TaskItem
            v-for="task in currentStageTasks"
            :key="task.id"
            :task="task"
            :completed="isTaskCompleted(task.id)"
            @complete="handleTaskComplete"
            @get-suggestion="handleGetTaskSuggestion"
          />
        </div>
      </div>

      <!-- 话术模板 -->
      <div v-if="currentStage.scripts" class="scripts-section">
        <h4 class="section-title">
          <el-icon><ChatLineRound /></el-icon>
          话术模板
        </h4>
        <el-collapse>
          <el-collapse-item title="开场白" name="opening">
            <div class="script-content">{{ currentStage.scripts.opening }}</div>
          </el-collapse-item>
          <el-collapse-item title="核心话术" name="keyPoints">
            <ul class="script-list">
              <li v-for="(point, index) in currentStage.scripts.keyPoints" :key="index">
                {{ point }}
              </li>
            </ul>
          </el-collapse-item>
          <el-collapse-item title="结束语" name="closing">
            <div class="script-content">{{ currentStage.scripts.closing }}</div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 常见问题FAQ -->
      <div v-if="currentStage.faqs && currentStage.faqs.length > 0" class="faq-section">
        <h4 class="section-title">
          <el-icon><QuestionFilled /></el-icon>
          常见问题FAQ
        </h4>
        <el-collapse>
          <el-collapse-item
            v-for="(faq, index) in currentStage.faqs"
            :key="index"
            :title="faq.question"
            :name="index"
          >
            <div class="faq-answer">
              <p><strong>建议回答：</strong></p>
              <p>{{ faq.answer }}</p>
              <p v-if="faq.tips && faq.tips.length > 0"><strong>应对技巧：</strong></p>
              <ul v-if="faq.tips && faq.tips.length > 0">
                <li v-for="(tip, tipIndex) in faq.tips" :key="tipIndex">{{ tip }}</li>
              </ul>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 阶段操作 -->
      <div class="stage-actions">
        <el-button
          v-if="canAdvanceStage"
          type="primary"
          size="large"
          @click="handleAdvanceStage"
        >
          <el-icon><Right /></el-icon>
          推进到下一阶段
        </el-button>
        <el-button
          v-else
          type="info"
          size="large"
          disabled
        >
          完成所有必需任务后可推进
        </el-button>
      </div>
    </div>

    <el-empty v-else description="请选择一个阶段" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessageBox } from 'element-plus';
import type { SOPStage, SOPTask, CustomerSOPProgress } from '@/api/modules/teacher-sop';
import TaskItem from './TaskItem.vue';

interface Props {
  customerId: number;
  stages: SOPStage[];
  currentStage: SOPStage | null;
  progress: CustomerSOPProgress | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  stageChange: [stageId: number];
  taskComplete: [taskId: number];
  advanceStage: [];
}>();

// 当前选中的阶段（用于查看）
const selectedStage = ref<SOPStage | null>(null);

// 当前阶段的任务列表
const currentStageTasks = ref<SOPTask[]>([]);

// 实际显示的阶段（选中的或当前的）
const displayStage = computed(() => selectedStage.value || props.currentStage);

// 是否可以推进阶段
const canAdvanceStage = computed(() => {
  if (!props.progress || !currentStageTasks.value.length) return false;
  
  const requiredTasks = currentStageTasks.value.filter(t => t.isRequired);
  const completedTasks = props.progress.completedTasks || [];
  
  return requiredTasks.every(task => completedTasks.includes(task.id));
});

// 方法
function getStageClass(stage: SOPStage): string {
  const classes = [];
  
  if (isStageCompleted(stage)) {
    classes.push('completed');
  } else if (isStageActive(stage)) {
    classes.push('active');
  } else {
    classes.push('pending');
  }
  
  if (selectedStage.value?.id === stage.id) {
    classes.push('selected');
  }
  
  return classes.join(' ');
}

function isStageCompleted(stage: SOPStage): boolean {
  if (!props.currentStage) return false;
  return stage.orderNum < props.currentStage.orderNum;
}

function isStageActive(stage: SOPStage): boolean {
  return props.currentStage?.id === stage.id;
}

function isTaskCompleted(taskId: number): boolean {
  return props.progress?.completedTasks?.includes(taskId) || false;
}

function handleStageClick(stage: SOPStage) {
  selectedStage.value = stage;
  emit('stageChange', stage.id);
  loadStageTasks(stage.id);
}

function handleTaskComplete(taskId: number) {
  emit('taskComplete', taskId);
}

function handleGetTaskSuggestion(taskId: number) {
  // 触发获取AI建议
  console.log('获取任务建议:', taskId);
}

async function handleAdvanceStage() {
  try {
    await ElMessageBox.confirm(
      '确定要推进到下一阶段吗？推进后将无法返回当前阶段。',
      '确认推进',
      {
        confirmButtonText: '确定推进',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    emit('advanceStage');
  } catch {
    // 用户取消
  }
}

async function loadStageTasks(stageId: number) {
  // TODO: 从API加载阶段任务
  // const response = await getTasksByStage(stageId);
  // currentStageTasks.value = response.data;
  
  // 模拟数据
  currentStageTasks.value = [
    {
      id: 1,
      stageId,
      title: '自我介绍',
      description: '向客户介绍自己和幼儿园',
      isRequired: true,
      estimatedTime: 10,
      orderNum: 1,
      isActive: true
    },
    {
      id: 2,
      stageId,
      title: '了解基本信息',
      description: '了解客户和孩子的基本情况',
      isRequired: true,
      estimatedTime: 15,
      orderNum: 2,
      isActive: true
    },
    {
      id: 3,
      stageId,
      title: '建立信任',
      description: '通过专业沟通建立信任关系',
      isRequired: false,
      estimatedTime: 20,
      orderNum: 3,
      isActive: true
    }
  ];
}

// 监听当前阶段变化
watch(() => props.currentStage, (newStage) => {
  if (newStage && !selectedStage.value) {
    loadStageTasks(newStage.id);
  }
}, { immediate: true });
</script>

<style scoped lang="scss">
.sop-stage-flow {
  .stage-navigation {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--spacing-8xl);
    padding: var(--text-2xl);
    background: var(--bg-hover);
    border-radius: var(--spacing-sm);
    
    .stage-item {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-sm);
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-2px);
      }
      
      .stage-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        transition: all 0.3s;
      }
      
      .stage-name {
        font-size: var(--text-sm);
        text-align: center;
        transition: all 0.3s;
      }
      
      .stage-connector {
        position: absolute;
        top: var(--text-2xl);
        left: calc(50% + var(--text-2xl));
        width: calc(100% - 40px);
        height: 2px;
        background: var(--border-color);
      }
      
      &.completed {
        .stage-icon {
          background: var(--success-color);
          color: white;
        }
        
        .stage-name {
          color: var(--success-color);
        }
        
        .stage-connector {
          background: var(--success-color);
        }
      }
      
      &.active {
        .stage-icon {
          background: var(--primary-color);
          color: white;
          animation: pulse 2s infinite;
        }
        
        .stage-name {
          color: var(--primary-color);
          font-weight: 600;
        }
      }
      
      &.pending {
        .stage-icon {
          background: var(--border-color-light);
          color: var(--info-color);
        }
        
        .stage-name {
          color: var(--info-color);
        }
      }
      
      &.selected {
        .stage-icon {
          box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.3);
        }
      }
    }
  }
  
  .stage-detail {
    .stage-info {
      margin-bottom: var(--text-3xl);
      
      .stage-title {
        font-size: var(--text-2xl);
        font-weight: 600;
        margin: 0 0 var(--text-sm) 0;
      }
      
      .stage-description {
        color: var(--text-regular);
        line-height: 1.6;
        margin: 0 0 var(--text-sm) 0;
      }
      
      .stage-meta {
        display: flex;
        gap: var(--spacing-sm);
      }
    }
    
    .section-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--text-lg);
      font-weight: 600;
      margin: 0 0 var(--text-lg) 0;
    }
    
    .task-list {
      margin-bottom: var(--text-3xl);
    }
    
    .scripts-section {
      margin-bottom: var(--text-3xl);
      
      .script-content {
        line-height: 1.8;
        color: var(--text-regular);
      }
      
      .script-list {
        margin: 0;
        padding-left: var(--text-2xl);
        
        li {
          line-height: 1.8;
          color: var(--text-regular);
          margin-bottom: var(--spacing-sm);
        }
      }
    }
    
    .faq-section {
      margin-bottom: var(--text-3xl);
      
      .faq-answer {
        line-height: 1.8;
        color: var(--text-regular);
        
        p {
          margin: var(--spacing-sm) 0;
        }
        
        ul {
          margin: var(--spacing-sm) 0;
          padding-left: var(--text-2xl);
          
          li {
            margin-bottom: var(--spacing-xs);
          }
        }
      }
    }
    
    .stage-actions {
      display: flex;
      justify-content: center;
      padding: var(--text-2xl) 0;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(64, 158, 255, 0);
  }
}
</style>

