<template>
  <div class="ai-suggestion-panel">
    <div class="panel-actions">
      <el-button type="primary" @click="handleGetGlobalAnalysis">
        <UnifiedIcon name="default" />
        获取全局分析
      </el-button>
    </div>
    
    <\!-- 全局分析结果 -->
    <div v-if="globalAnalysis" class="analysis-result">
      <h4>
        <UnifiedIcon name="default" />
        全局AI分析
      </h4>
      
      <div class="analysis-section">
        <h5>沟通策略</h5>
        <div v-if="globalAnalysis.strategy" class="strategy-content">
          <p><strong>{{ globalAnalysis.strategy.title }}</strong></p>
          <p>{{ globalAnalysis.strategy.description }}</p>
          <ul v-if="globalAnalysis.strategy.keyPoints">
            <li v-for="(point, index) in globalAnalysis.strategy.keyPoints" :key="index">
              {{ point }}
            </li>
          </ul>
        </div>
      </div>
      
      <div v-if="globalAnalysis.scripts" class="analysis-section">
        <h5>推荐话术</h5>
        <div class="scripts-content">
          <p><strong>开场白：</strong>{{ globalAnalysis.scripts.opening }}</p>
          <p><strong>核心话术：</strong></p>
          <ul>
            <li v-for="(script, index) in globalAnalysis.scripts.core" :key="index">
              {{ script }}
            </li>
          </ul>
        </div>
      </div>
      
      <div v-if="globalAnalysis.nextActions" class="analysis-section">
        <h5>下一步行动</h5>
        <div class="actions-content">
          <el-timeline>
            <el-timeline-item
              v-for="(action, index) in globalAnalysis.nextActions"
              :key="index"
            >
              <h6>{{ action.title }}</h6>
              <p>{{ action.description }}</p>
              <el-tag size="small">{{ action.timing }}</el-tag>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      
      <div v-if="globalAnalysis.successProbability" class="analysis-section">
        <h5>成功概率分析</h5>
        <div class="probability-content">
          <el-progress
            :percentage="globalAnalysis.successProbability"
            :color="getProbabilityColor(globalAnalysis.successProbability)"
          />
        </div>
      </div>
    </div>
    
    <el-empty v-else description="点击按钮获取AI分析" :image-size="100" />
  </div>
</template>

<script setup lang="ts">
import type { AISuggestion } from '@/api/modules/teacher-sop';

interface Props {
  customerId: number;
  taskSuggestion: AISuggestion | null;
  globalAnalysis: any;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  getTaskSuggestion: [taskId: number];
  getGlobalAnalysis: [];
}>();

function handleGetGlobalAnalysis() {
  emit('getGlobalAnalysis');
}

function getProbabilityColor(probability: number): string {
  if (probability >= 70) return 'var(--success-color)';
  if (probability >= 40) return 'var(--warning-color)';
  return 'var(--danger-color)';
}
</script>

<style scoped lang="scss">
.ai-suggestion-panel {
  .panel-actions {
    margin-bottom: var(--text-2xl);
  }
  
  .analysis-result {
    h4 {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--text-lg);
      font-weight: 600;
      margin: 0 0 var(--text-2xl) 0;
    }
    
    .analysis-section {
      margin-bottom: var(--text-3xl);
      padding: var(--text-lg);
      background: var(--bg-hover);
      border-radius: var(--spacing-sm);
      
      &:last-child {
        margin-bottom: 0;
      }
      
      h5 {
        font-size: var(--text-base);
        font-weight: 600;
        margin: 0 0 var(--text-sm) 0;
      }
      
      .strategy-content,
      .scripts-content,
      .actions-content {
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
        
        h6 {
          font-size: var(--text-base);
          font-weight: 600;
          margin: 0 0 var(--spacing-xs) 0;
        }
      }
      
      .probability-content {
        padding: var(--text-sm) 0;
      }
    }
  }
}
</style>
