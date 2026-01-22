<template>
  <div class="mobile-ai-suggestion-panel">
    <!-- 移动端操作按钮 -->
    <div class="panel-actions">
      <el-button
        type="primary"
        size="large"
        block
        @click="handleGetGlobalAnalysis"
        :loading="loading"
      >
        <el-icon><Cpu /></el-icon>
        获取全局AI分析
      </el-button>
    </div>

    <!-- 全局分析结果 -->
    <div v-if="globalAnalysis" class="analysis-result">
      <div class="result-header">
        <el-icon><Cpu /></el-icon>
        <span class="header-title">全局AI分析</span>
      </div>

      <!-- 成功概率分析 - 移动端优先显示 -->
      <div v-if="globalAnalysis.successProbability" class="mobile-probability-card">
        <div class="probability-label">成功概率</div>
        <div class="probability-value">{{ globalAnalysis.successProbability }}%</div>
        <el-progress
          :percentage="globalAnalysis.successProbability"
          :color="getProbabilityColor(globalAnalysis.successProbability)"
          :stroke-width="8"
          :show-text="false"
        />
        <div class="probability-text">{{ getProbabilityText(globalAnalysis.successProbability) }}</div>
      </div>

      <!-- 沟通策略 -->
      <div v-if="globalAnalysis.strategy" class="mobile-section-card">
        <div class="section-header">
          <el-icon><ChatDotRound /></el-icon>
          <span>沟通策略</span>
        </div>
        <div class="section-content">
          <div class="strategy-title">{{ globalAnalysis.strategy.title }}</div>
          <div class="strategy-desc">{{ globalAnalysis.strategy.description }}</div>
          <div v-if="globalAnalysis.strategy.keyPoints" class="key-points">
            <div
              v-for="(point, index) in globalAnalysis.strategy.keyPoints"
              :key="index"
              class="key-point-item"
            >
              <el-icon><Check /></el-icon>
              <span>{{ point }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 推荐话术 -->
      <div v-if="globalAnalysis.scripts" class="mobile-section-card">
        <div class="section-header">
          <el-icon><ChatLineRound /></el-icon>
          <span>推荐话术</span>
        </div>
        <div class="section-content">
          <div class="script-item">
            <div class="script-label">开场白</div>
            <div class="script-text">{{ globalAnalysis.scripts.opening }}</div>
          </div>
          <div class="script-item">
            <div class="script-label">核心话术</div>
            <div class="core-scripts">
              <div
                v-for="(script, index) in globalAnalysis.scripts.core"
                :key="index"
                class="core-script-item"
              >
                {{ index + 1 }}. {{ script }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 下一步行动 -->
      <div v-if="globalAnalysis.nextActions" class="mobile-section-card">
        <div class="section-header">
          <el-icon><Clock /></el-icon>
          <span>下一步行动</span>
        </div>
        <div class="section-content">
          <div class="actions-timeline">
            <div
              v-for="(action, index) in globalAnalysis.nextActions"
              :key="index"
              class="action-item"
            >
              <div class="action-step">{{ index + 1 }}</div>
              <div class="action-content">
                <div class="action-title">{{ action.title }}</div>
                <div class="action-desc">{{ action.description }}</div>
                <el-tag size="small" type="info">{{ action.timing }}</el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-empty
        description="点击按钮获取AI分析建议"
        :image-size="120"
      >
        <el-button type="primary" @click="handleGetGlobalAnalysis" size="large">
          立即分析
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElIcon, ElButton, ElProgress, ElTag, ElEmpty } from 'element-plus'
import { Cpu, ChatDotRound, ChatLineRound, Clock, Check } from '@element-plus/icons-vue'
import type { AISuggestion } from '@/api/modules/teacher-sop'
import { CallingLogger, type LogContext } from '@/utils/CallingLogger'

interface Props {
  customerId: number;
  taskSuggestion: AISuggestion | null;
  globalAnalysis: any;
}

const props = defineProps<Props>()
const loading = ref(false)

// 创建日志上下文
const createLogContext = (operation?: string, additionalContext?: any): LogContext => {
  return CallingLogger.createComponentContext('AISuggestionPanel', {
    operation,
    customerId: props.customerId,
    ...additionalContext
  })
}

const emit = defineEmits<{
  getTaskSuggestion: [taskId: number];
  getGlobalAnalysis: [];
}>()

async function handleGetGlobalAnalysis() {
  const context = createLogContext('handleGetGlobalAnalysis', { customerId: props.customerId })

  loading.value = true
  try {
    CallingLogger.logInfo(context, '请求全局AI分析', { customerId: props.customerId })
    emit('getGlobalAnalysis')
    CallingLogger.logSuccess(context, '全局AI分析请求发送成功')
  } catch (error) {
    CallingLogger.logError(context, '请求全局AI分析失败', error as Error)
  } finally {
    // 延迟关闭loading状态，提供更好的用户体验
    setTimeout(() => {
      loading.value = false
    }, 1000)
  }
}

function getProbabilityColor(probability: number): string {
  if (probability >= 70) return '#67C23A' // success-color
  if (probability >= 40) return '#E6A23C' // warning-color
  return '#F56C6C' // danger-color
}

function getProbabilityText(probability: number): string {
  if (probability >= 70) return '转化可能性很高'
  if (probability >= 40) return '转化可能性中等'
  return '需要更多跟进'
}
</script>

<style scoped lang="scss">
.mobile-ai-suggestion-panel {
  padding: var(--spacing-md);

  .panel-actions {
    margin-bottom: var(--spacing-xl);

    .el-button {
      height: 48px;
      font-size: var(--font-size-base);
      font-weight: 500;
      border-radius: var(--border-radius-lg);

      .el-icon {
        margin-right: var(--spacing-sm);
      }
    }
  }

  .analysis-result {
    .result-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-lg);

      .header-title {
        font-size: var(--font-size-large);
        font-weight: 600;
        color: var(--text-primary);
      }

      .el-icon {
        font-size: var(--text-xl);
        color: var(--primary-color);
      }
    }

    // 成功概率卡片
    .mobile-probability-card {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      color: white;
      padding: var(--spacing-lg);
      border-radius: var(--border-radius-lg);
      margin-bottom: var(--spacing-lg);
      text-align: center;

      .probability-label {
        font-size: var(--font-size-small);
        opacity: 0.9;
        margin-bottom: var(--spacing-xs);
      }

      .probability-value {
        font-size: var(--text-4xl);
        font-weight: 700;
        margin-bottom: var(--spacing-md);
      }

      .probability-text {
        margin-top: var(--spacing-sm);
        font-size: var(--font-size-small);
        opacity: 0.9;
      }
    }

    // 通用内容卡片
    .mobile-section-card {
      background: var(--bg-color-page);
      border: 1px solid var(--border-color-lighter);
      border-radius: var(--border-radius-lg);
      margin-bottom: var(--spacing-lg);
      overflow: hidden;

      .section-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-md) var(--spacing-lg);
        background: var(--bg-card);
        border-bottom: 1px solid var(--border-color-lighter);
        font-weight: 600;
        color: var(--text-primary);

        .el-icon {
          color: var(--primary-color);
        }
      }

      .section-content {
        padding: var(--spacing-lg);

        .strategy-title {
          font-size: var(--font-size-large);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
        }

        .strategy-desc {
          color: var(--text-regular);
          line-height: 1.6;
          margin-bottom: var(--spacing-md);
        }

        .key-points {
          .key-point-item {
            display: flex;
            align-items: flex-start;
            gap: var(--spacing-sm);
            padding: var(--spacing-sm) 0;

            .el-icon {
              color: var(--success-color);
              margin-top: 2px;
              flex-shrink: 0;
            }

            span {
              flex: 1;
              color: var(--text-regular);
              line-height: 1.5;
            }
          }
        }

        .script-item {
          margin-bottom: var(--spacing-lg);

          &:last-child {
            margin-bottom: 0;
          }

          .script-label {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--spacing-sm);
          }

          .script-text {
            color: var(--text-regular);
            line-height: 1.6;
            padding: var(--spacing-sm);
            background: var(--bg-card);
            border-radius: var(--border-radius-base);
          }

          .core-scripts {
            .core-script-item {
              padding: var(--spacing-sm);
              margin-bottom: var(--spacing-sm);
              background: var(--bg-card);
              border-radius: var(--border-radius-base);
              color: var(--text-regular);
              line-height: 1.5;

              &:last-child {
                margin-bottom: 0;
              }
            }
          }
        }

        .actions-timeline {
          .action-item {
            display: flex;
            gap: var(--spacing-md);
            padding: var(--spacing-md) 0;

            &:not(:last-child) {
              border-bottom: 1px dashed var(--border-color-lighter);
            }

            .action-step {
              width: 32px;
              height: 32px;
              background: var(--primary-color);
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 600;
              flex-shrink: 0;
            }

            .action-content {
              flex: 1;

              .action-title {
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: var(--spacing-xs);
              }

              .action-desc {
                color: var(--text-regular);
                line-height: 1.5;
                margin-bottom: var(--spacing-sm);
              }
            }
          }
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: var(--spacing-xl) var(--spacing-md);

    .el-empty {
      padding: var(--spacing-xl) 0;
    }
  }
}

// 移动端响应式
@media (max-width: var(--breakpoint-md)) {
  .mobile-ai-suggestion-panel {
    padding: var(--spacing-sm);

    .analysis-result {
      .mobile-probability-card {
        padding: var(--spacing-md);

        .probability-value {
          font-size: var(--text-3xl);
        }
      }

      .mobile-section-card {
        .section-header {
          padding: var(--spacing-sm) var(--spacing-md);
        }

        .section-content {
          padding: var(--spacing-md);
        }
      }
    }
  }
}
</style>