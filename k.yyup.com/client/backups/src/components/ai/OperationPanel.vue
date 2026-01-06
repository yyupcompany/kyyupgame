<template>
  <div class="operation-panel">
    <div class="panel-header">
      <h3>{{ title || '正在执行操作' }}</h3>
      <el-tag :type="statusType" size="small">{{ statusText }}</el-tag>
    </div>
    
    <div class="operation-content">
      <!-- 操作步骤列表 -->
      <div v-if="steps.length > 0" class="steps-container">
        <el-steps :active="activeStep" direction="vertical">
          <el-step 
            v-for="(step, index) in steps" 
            :key="index"
            :title="step.title"
            :description="step.description"
            :status="step.status"
            :icon="step.icon"
          />
        </el-steps>
      </div>
      
      <!-- 屏幕截图展示 -->
      <div v-if="screenshot" class="screenshot-container">
        <h4>当前页面</h4>
        <div class="screenshot-wrapper">
          <img :src="screenshot" alt="页面截图" />
          <div v-if="highlights.length > 0" class="highlights">
            <div 
              v-for="(highlight, index) in highlights" 
              :key="index"
              class="highlight-box"
              :style="highlight.style"
            />
          </div>
        </div>
      </div>
      
      <!-- 数据结果展示 -->
      <div v-if="results" class="results-container">
        <h4>执行结果</h4>
        <div class="result-content">
          <!-- 表格数据 -->
          <el-table v-if="results.type === 'table'" :data="results.data" size="small">
            <el-table-column 
              v-for="column in results.columns" 
              :key="column.prop"
              :prop="column.prop"
              :label="column.label"
              :width="column.width"
            />
          </el-table>
          
          <!-- 统计数据 -->
          <div v-else-if="results.type === 'stats'" class="stats-grid">
            <div v-for="stat in results.data" :key="stat.label" class="stat-card">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
          
          <!-- 文本结果 -->
          <div v-else-if="results.type === 'text'" class="text-result">
            <pre>{{ results.data }}</pre>
          </div>
          
          <!-- JSON结果 -->
          <div v-else-if="results.type === 'json'" class="json-result">
            <el-tree 
              :data="[results.data]" 
              :props="{ children: 'children', label: 'label' }"
              default-expand-all
            />
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div v-if="showActions" class="action-buttons">
        <el-button v-if="canRetry" @click="$emit('retry')" type="warning" size="small">
          重试
        </el-button>
        <el-button v-if="canContinue" @click="$emit('continue')" type="primary" size="small">
          继续
        </el-button>
        <el-button @click="$emit('close')" size="small">
          关闭
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface OperationStep {
  title: string;
  description?: string;
  status?: 'wait' | 'process' | 'finish' | 'error' | 'success';
  icon?: string;
}

interface OperationResult {
  type: 'table' | 'stats' | 'text' | 'json';
  data: any;
  columns?: any[];
}

interface Props {
  title?: string;
  status?: 'pending' | 'running' | 'success' | 'error';
  steps?: OperationStep[];
  activeStep?: number;
  screenshot?: string;
  highlights?: Array<{ style: any }>;
  results?: OperationResult;
  showActions?: boolean;
  canRetry?: boolean;
  canContinue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  status: 'pending',
  steps: () => [],
  activeStep: 0,
  highlights: () => [],
  showActions: true,
  canRetry: false,
  canContinue: false
});

const emit = defineEmits(['retry', 'continue', 'close']);

const statusType = computed(() => {
  const typeMap = {
    pending: 'info',
    running: 'warning',
    success: 'success',
    error: 'danger'
  };
  return typeMap[props.status] || 'info';
});

const statusText = computed(() => {
  const textMap = {
    pending: '准备中',
    running: '执行中',
    success: '已完成',
    error: '执行失败'
  };
  return textMap[props.status] || '未知';
});
</script>

<style lang="scss" scoped>
.operation-panel {
  background: var(--bg-white);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    background: var(--bg-tertiary);
    border-bottom: var(--border-width-base) solid var(--border-color);
    
    h3 {
      margin: 0;
      font-size: var(--text-lg);
      color: var(--text-primary);
    }
  }
  
  .operation-content {
    padding: var(--spacing-lg);
  }
  
  .steps-container {
    margin-bottom: var(--spacing-lg);
    
    :deep(.el-step__title) {
      font-size: var(--text-sm);
    }
    
    :deep(.el-step__description) {
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }
  }
  
  .screenshot-container {
    margin-bottom: var(--spacing-lg);
    
    h4 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--text-md);
      color: var(--text-primary);
    }
    
    .screenshot-wrapper {
      position: relative;
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--radius-sm);
      overflow: hidden;
      
      img {
        width: 100%;
        height: auto;
        display: block;
      }
      
      .highlights {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        
        .highlight-box {
          position: absolute;
          border: 2px solid var(--primary-color);
          background: rgba(var(--primary-color-rgb), 0.1);
          animation: pulse 2s infinite;
        }
      }
    }
  }
  
  .results-container {
    margin-bottom: var(--spacing-lg);
    
    h4 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--text-md);
      color: var(--text-primary);
    }
    
    .result-content {
      background: var(--bg-tertiary);
      border-radius: var(--radius-sm);
      padding: var(--spacing-md);
      
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: var(--spacing-md);
        
        .stat-card {
          text-align: center;
          padding: var(--spacing-md);
          background: var(--bg-white);
          border-radius: var(--radius-sm);
          border: var(--border-width-base) solid var(--border-color);
          
          .stat-value {
            font-size: var(--text-xl);
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: var(--spacing-xs);
          }
          
          .stat-label {
            font-size: var(--text-sm);
            color: var(--text-secondary);
          }
        }
      }
      
      .text-result, .json-result {
        pre {
          margin: 0;
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          white-space: pre-wrap;
          word-break: break-word;
        }
      }
    }
  }
  
  .action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
    padding-top: var(--spacing-md);
    border-top: var(--border-width-base) solid var(--border-color);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}
</style>