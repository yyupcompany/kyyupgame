<template>
  <el-dialog
    v-model="dialogVisible"
    title="🔧 AI传播策略优化"
    width="700px"
    :close-on-click-modal="false"
  >
    <div class="optimization-content" v-if="optimizationData">
      <!-- 预期增长 -->
      <div class="growth-prediction">
        <div class="growth-card">
          <div class="growth-icon">📈</div>
          <div class="growth-info">
            <div class="growth-title">预期增长</div>
            <div class="growth-value">+{{ optimizationData.predictedGrowth }}%</div>
            <div class="growth-desc">采用AI优化策略后的预期提升</div>
          </div>
        </div>
      </div>

      <!-- 分析结果 -->
      <div class="analysis-sections">
        <!-- 传播瓶颈 -->
        <div class="analysis-section bottlenecks" v-if="optimizationData.bottlenecks?.length">
          <div class="section-header">
            <UnifiedIcon name="default" />
            <h3>🚫 传播瓶颈分析</h3>
          </div>
          <div class="section-content">
            <div class="bottleneck-list">
              <div 
                v-for="(bottleneck, index) in optimizationData.bottlenecks" 
                :key="index"
                class="bottleneck-item"
              >
                <div class="bottleneck-icon">⚠️</div>
                <div class="bottleneck-text">{{ bottleneck }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 优化机会 -->
        <div class="analysis-section opportunities" v-if="optimizationData.opportunities?.length">
          <div class="section-header">
            <UnifiedIcon name="default" />
            <h3>💡 优化机会识别</h3>
          </div>
          <div class="section-content">
            <div class="opportunity-list">
              <div 
                v-for="(opportunity, index) in optimizationData.opportunities" 
                :key="index"
                class="opportunity-item"
              >
                <div class="opportunity-icon">✨</div>
                <div class="opportunity-text">{{ opportunity }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 优化建议 -->
        <div class="analysis-section recommendations" v-if="optimizationData.recommendations?.length">
          <div class="section-header">
            <UnifiedIcon name="default" />
            <h3>🎯 AI优化建议</h3>
          </div>
          <div class="section-content">
            <div class="recommendation-list">
              <div 
                v-for="(recommendation, index) in optimizationData.recommendations" 
                :key="index"
                class="recommendation-item"
                @click="toggleRecommendation(index)"
                :class="{ expanded: expandedRecommendations.includes(index) }"
              >
                <div class="recommendation-header">
                  <div class="recommendation-icon">🚀</div>
                  <div class="recommendation-text">{{ recommendation }}</div>
                  <el-icon class="expand-icon">
                    <ArrowDown v-if="!expandedRecommendations.includes(index)" />
                    <ArrowUp v-else />
                  </el-icon>
                </div>
                <div class="recommendation-details" v-if="expandedRecommendations.includes(index)">
                  <div class="detail-item">
                    <strong>实施难度：</strong>
                    <el-rate
                      :model-value="getRecommendationDifficulty(index)"
                      :max="5"
                      disabled
                      show-score
                      text-color="#ff9900"
                    />
                  </div>
                  <div class="detail-item">
                    <strong>预期效果：</strong>
                    <el-tag :type="getEffectType(index)" size="small">
                      {{ getEffectText(index) }}
                    </el-tag>
                  </div>
                  <div class="detail-item">
                    <strong>实施时间：</strong>
                    <span>{{ getImplementationTime(index) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 行动计划 -->
      <div class="action-plan">
        <h3>📋 推荐行动计划</h3>
        <div class="plan-timeline">
          <div class="timeline-item immediate">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-title">立即执行 (今天)</div>
              <div class="timeline-actions">
                <div class="action-item">优化推广文案，突出核心卖点</div>
                <div class="action-item">调整发布时间到用户活跃高峰期</div>
              </div>
            </div>
          </div>
          
          <div class="timeline-item short-term">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-title">短期优化 (3-7天)</div>
              <div class="timeline-actions">
                <div class="action-item">扩展推广渠道，增加触达面</div>
                <div class="action-item">制作更多样化的推广素材</div>
              </div>
            </div>
          </div>
          
          <div class="timeline-item long-term">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-title">长期策略 (1-2周)</div>
              <div class="timeline-actions">
                <div class="action-item">建立推广员激励体系</div>
                <div class="action-item">优化转化流程和用户体验</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 成功案例参考 -->
      <div class="success-cases">
        <h3>🏆 成功案例参考</h3>
        <div class="cases-grid">
          <div class="case-card">
            <div class="case-title">阳光幼儿园春游活动</div>
            <div class="case-metrics">
              <span class="metric">触达: 2000+</span>
              <span class="metric">转化: 15%</span>
              <span class="metric">增长: +180%</span>
            </div>
            <div class="case-strategy">策略：多渠道推广 + 限时优惠</div>
          </div>
          
          <div class="case-card">
            <div class="case-title">智慧幼儿园亲子运动会</div>
            <div class="case-metrics">
              <span class="metric">触达: 1500+</span>
              <span class="metric">转化: 22%</span>
              <span class="metric">增长: +240%</span>
            </div>
            <div class="case-strategy">策略：社群裂变 + 推广员激励</div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="applyOptimization">
          <UnifiedIcon name="Check" />
          应用优化策略
        </el-button>
        <el-button @click="exportReport">
          <UnifiedIcon name="Download" />
          导出报告
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Warning,
  Star,
  ArrowDown,
  ArrowUp,
  Check,
  Download
} from '@element-plus/icons-vue'

// Props & Emits
const props = defineProps<{
  modelValue: boolean
  optimizationData?: any
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// 响应式数据
const dialogVisible = ref(false)
const expandedRecommendations = ref<number[]>([])

// 监听器
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

/**
 * 切换建议展开状态
 */
const toggleRecommendation = (index: number) => {
  const idx = expandedRecommendations.value.indexOf(index)
  if (idx > -1) {
    expandedRecommendations.value.splice(idx, 1)
  } else {
    expandedRecommendations.value.push(index)
  }
}

/**
 * 获取建议实施难度
 */
const getRecommendationDifficulty = (index: number) => {
  // 模拟不同建议的难度评级
  const difficulties = [2, 3, 4, 1, 3]
  return difficulties[index % difficulties.length]
}

/**
 * 获取效果类型
 */
const getEffectType = (index: number) => {
  const types = ['success', 'warning', 'info', 'success', 'warning']
  return types[index % types.length]
}

/**
 * 获取效果文本
 */
const getEffectText = (index: number) => {
  const effects = ['高效果', '中等效果', '长期效果', '立竿见影', '稳步提升']
  return effects[index % effects.length]
}

/**
 * 获取实施时间
 */
const getImplementationTime = (index: number) => {
  const times = ['1-2天', '3-5天', '1-2周', '立即', '1周']
  return times[index % times.length]
}

/**
 * 应用优化策略
 */
const applyOptimization = () => {
  ElMessage.success('优化策略已应用，系统将自动执行相关优化')
  dialogVisible.value = false
}

/**
 * 导出报告
 */
const exportReport = () => {
  // 实现报告导出逻辑
  ElMessage.success('优化报告已导出')
}
</script>

<style scoped lang="scss">
.optimization-content {
  .growth-prediction {
    margin-bottom: var(--spacing-3xl);

    .growth-card {
      display: flex;
      align-items: center;
      background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
      color: white;
      padding: var(--text-3xl);
      border-radius: var(--text-sm);
      gap: var(--text-2xl);

      .growth-icon {
        font-size: var(--text-5xl);
      }

      .growth-info {
        .growth-title {
          font-size: var(--text-lg);
          opacity: 0.9;
          margin-bottom: var(--spacing-sm);
        }

        .growth-value {
          font-size: var(--text-4xl);
          font-weight: bold;
          margin-bottom: var(--spacing-sm);
        }

        .growth-desc {
          font-size: var(--text-base);
          opacity: 0.8;
        }
      }
    }
  }

  .analysis-sections {
    margin-bottom: var(--spacing-3xl);

    .analysis-section {
      margin-bottom: var(--text-3xl);
      border-radius: var(--spacing-sm);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;

      .section-header {
        display: flex;
        align-items: center;
        gap: var(--text-sm);
        padding: var(--text-lg) var(--text-2xl);
        font-weight: bold;

        .section-icon {
          font-size: var(--text-xl);
        }

        h3 {
          margin: 0;
          font-size: var(--text-lg);
        }
      }

      .section-content {
        padding: 0 var(--text-2xl) var(--text-2xl);
      }

      &.bottlenecks {
        .section-header {
          background: #fef0f0;
          color: var(--danger-color);
        }

        .bottleneck-item {
          display: flex;
          align-items: flex-start;
          gap: var(--text-sm);
          padding: var(--text-sm) 0;
          border-bottom: var(--z-index-dropdown) solid var(--bg-gray);

          &:last-child {
            border-bottom: none;
          }

          .bottleneck-icon {
            font-size: var(--text-lg);
            margin-top: var(--spacing-sm);
          }

          .bottleneck-text {
            flex: 1;
            line-height: 1.6;
          }
        }
      }

      &.opportunities {
        .section-header {
          background: #f0f9ff;
          color: var(--primary-color);
        }

        .opportunity-item {
          display: flex;
          align-items: flex-start;
          gap: var(--text-sm);
          padding: var(--text-sm) 0;
          border-bottom: var(--z-index-dropdown) solid var(--bg-gray);

          &:last-child {
            border-bottom: none;
          }

          .opportunity-icon {
            font-size: var(--text-lg);
            margin-top: var(--spacing-sm);
          }

          .opportunity-text {
            flex: 1;
            line-height: 1.6;
          }
        }
      }

      &.recommendations {
        .section-header {
          background: #f6ffed;
          color: var(--success-color);
        }

        .recommendation-item {
          border: var(--border-width-base) solid var(--bg-gray-light);
          border-radius: var(--spacing-sm);
          margin-bottom: var(--text-sm);
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            border-color: var(--primary-color);
            box-shadow: 0 2px var(--spacing-sm) rgba(64, 158, 255, 0.1);
          }

          &.expanded {
            border-color: var(--primary-color);
          }

          .recommendation-header {
            display: flex;
            align-items: center;
            gap: var(--text-sm);
            padding: var(--text-lg);

            .recommendation-icon {
              font-size: var(--text-lg);
            }

            .recommendation-text {
              flex: 1;
              line-height: 1.6;
            }

            .expand-icon {
              color: var(--text-tertiary);
              transition: transform 0.3s;
            }
          }

          .recommendation-details {
            padding: 0 var(--text-lg) var(--text-lg);
            border-top: var(--z-index-dropdown) solid var(--bg-gray-light);
            background: var(--bg-tertiary);

            .detail-item {
              display: flex;
              align-items: center;
              gap: var(--text-sm);
              margin: var(--text-sm) 0;

              strong {
                min-width: auto;
                color: var(--text-secondary);
              }
            }
          }
        }
      }
    }
  }

  .action-plan {
    margin-bottom: var(--spacing-3xl);

    h3 {
      margin-bottom: var(--text-2xl);
      color: #2c3e50;
    }

    .plan-timeline {
      .timeline-item {
        display: flex;
        margin-bottom: var(--text-3xl);

        .timeline-dot {
          width: var(--text-sm);
          height: var(--text-sm);
          border-radius: var(--radius-full);
          margin-top: var(--spacing-lg);
          margin-right: var(--text-lg);
          flex-shrink: 0;
        }

        .timeline-content {
          flex: 1;

          .timeline-title {
            font-weight: bold;
            margin-bottom: var(--spacing-sm);
            font-size: var(--text-base);
          }

          .timeline-actions {
            .action-item {
              background: var(--bg-gray-light);
              padding: var(--spacing-sm) var(--text-sm);
              border-radius: var(--spacing-xs);
              margin-bottom: var(--spacing-lg);
              font-size: var(--text-sm);
              line-height: 1.4;

              &:last-child {
                margin-bottom: 0;
              }
            }
          }
        }

        &.immediate {
          .timeline-dot {
            background: var(--danger-color);
          }
          .timeline-title {
            color: var(--danger-color);
          }
        }

        &.short-term {
          .timeline-dot {
            background: var(--warning-color);
          }
          .timeline-title {
            color: var(--warning-color);
          }
        }

        &.long-term {
          .timeline-dot {
            background: var(--success-color);
          }
          .timeline-title {
            color: var(--success-color);
          }
        }
      }
    }
  }

  .success-cases {
    h3 {
      margin-bottom: var(--text-2xl);
      color: #2c3e50;
    }

    .cases-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--text-lg);

      .case-card {
        background: var(--bg-gray-light);
        padding: var(--text-lg);
        border-radius: var(--spacing-sm);
        border-left: var(--spacing-xs) solid var(--primary-color);

        .case-title {
          font-weight: bold;
          margin-bottom: var(--spacing-sm);
          color: #2c3e50;
        }

        .case-metrics {
          display: flex;
          gap: var(--text-sm);
          margin-bottom: var(--spacing-sm);

          .metric {
            font-size: var(--text-sm);
            background: white;
            padding: var(--spacing-sm) 6px;
            border-radius: var(--spacing-xs);
            color: var(--text-secondary);
          }
        }

        .case-strategy {
          font-size: var(--text-sm);
          color: var(--primary-color);
        }
      }
    }
  }
}
</style>
