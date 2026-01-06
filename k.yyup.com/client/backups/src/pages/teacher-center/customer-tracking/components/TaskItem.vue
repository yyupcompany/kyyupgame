<template>
  <div :class="['task-item', { completed }]">
    <div class="task-header" @click="toggleExpand">
      <div class="task-left">
        <el-checkbox
          :model-value="completed"
          @change="handleComplete"
          :disabled="completed"
        />
        <div class="task-info">
          <div class="task-title">
            <span>{{ task.title }}</span>
            <el-tag v-if="task.isRequired" type="danger" size="small">必需</el-tag>
            <el-tag v-if="task.estimatedTime" size="small">
              <el-icon><Clock /></el-icon>
              {{ task.estimatedTime }}分钟
            </el-tag>
          </div>
          <div v-if="task.description" class="task-description">
            {{ task.description }}
          </div>
        </div>
      </div>
      
      <div class="task-actions">
        <el-button
          v-if="task.aiSuggestionConfig?.enabled"
          type="primary"
          size="small"
          @click.stop="handleGetSuggestion"
        >
          <el-icon><MagicStick /></el-icon>
          AI建议
        </el-button>
        <el-button
          type="text"
          size="small"
          @click.stop="toggleExpand"
        >
          <el-icon v-if="expanded"><ArrowUp /></el-icon>
          <el-icon v-else><ArrowDown /></el-icon>
        </el-button>
      </div>
    </div>

    <el-collapse-transition>
      <div v-show="expanded" class="task-content">
        <!-- 任务指导 -->
        <div v-if="task.guidance" class="task-guidance">
          <div v-if="task.guidance.steps && task.guidance.steps.length > 0" class="guidance-section">
            <h5>
              <el-icon><List /></el-icon>
              执行步骤
            </h5>
            <ol class="steps-list">
              <li v-for="(step, index) in task.guidance.steps" :key="index">
                {{ step }}
              </li>
            </ol>
          </div>
          
          <div v-if="task.guidance.tips && task.guidance.tips.length > 0" class="guidance-section">
            <h5>
              <el-icon><Star /></el-icon>
              实用技巧
            </h5>
            <ul class="tips-list">
              <li v-for="(tip, index) in task.guidance.tips" :key="index">
                {{ tip }}
              </li>
            </ul>
          </div>
          
          <div v-if="task.guidance.examples && task.guidance.examples.length > 0" class="guidance-section">
            <h5>
              <el-icon><ChatLineRound /></el-icon>
              话术示例
            </h5>
            <div class="examples-list">
              <el-alert
                v-for="(example, index) in task.guidance.examples"
                :key="index"
                :title="example"
                type="info"
                :closable="false"
              />
            </div>
          </div>
        </div>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { SOPTask } from '@/api/modules/teacher-sop';

interface Props {
  task: SOPTask;
  completed: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  complete: [taskId: number];
  getSuggestion: [taskId: number];
}>();

const expanded = ref(false);

function toggleExpand() {
  expanded.value = !expanded.value;
}

function handleComplete(value: boolean) {
  if (value && !props.completed) {
    emit('complete', props.task.id);
  }
}

function handleGetSuggestion() {
  emit('getSuggestion', props.task.id);
}
</script>

<style scoped lang="scss">
.task-item {
  border: var(--border-width-base) solid var(--border-color-light);
  border-radius: var(--spacing-sm);
  padding: var(--text-lg);
  margin-bottom: var(--text-sm);
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 2px var(--text-sm) var(--shadow-light);
  }
  
  &.completed {
    background: #f0f9ff;
    border-color: #b3d8ff;
    
    .task-title {
      color: var(--info-color);
      text-decoration: line-through;
    }
  }
  
  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    cursor: pointer;
    
    .task-left {
      flex: 1;
      display: flex;
      gap: var(--text-sm);
      align-items: flex-start;
      
      .task-info {
        flex: 1;
        
        .task-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--text-base);
          font-weight: 500;
          margin-bottom: var(--spacing-xs);
        }
        
        .task-description {
          font-size: var(--text-sm);
          color: var(--text-regular);
          line-height: 1.6;
        }
      }
    }
    
    .task-actions {
      display: flex;
      gap: var(--spacing-sm);
      align-items: center;
    }
  }
  
  .task-content {
    margin-top: var(--text-lg);
    padding-top: var(--text-lg);
    border-top: var(--border-width-base) solid var(--border-color);
    
    .task-guidance {
      .guidance-section {
        margin-bottom: var(--text-lg);
        
        &:last-child {
          margin-bottom: 0;
        }
        
        h5 {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          font-size: var(--text-base);
          font-weight: 600;
          margin: 0 0 var(--text-sm) 0;
          color: var(--text-primary);
        }
        
        .steps-list,
        .tips-list {
          margin: 0;
          padding-left: var(--text-3xl);
          
          li {
            line-height: 1.8;
            color: var(--text-regular);
            margin-bottom: var(--spacing-sm);
          }
        }
        
        .examples-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }
      }
    }
  }
}
</style>

