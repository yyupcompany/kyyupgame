<template>
  <van-popup
    v-model:show="dialogVisible"
    position="bottom"
    :style="{ height: '85%' }"
    round
    closeable
    @closed="handleClosed"
  >
    <div class="ai-analysis-dialog">
      <!-- 头部 -->
      <div class="dialog-header">
        <van-icon name="bulb-o" size="24" color="#409eff" />
        <h3>AI招生分析</h3>
      </div>

      <!-- 分析配置 -->
      <div class="analysis-config" v-if="!analyzing && !analysisResult">
        <van-cell-group inset title="分析配置">
          <van-field name="timeRange" label="时间范围" readonly is-link @click="showTimePicker = true">
            <template #input>
              <span>{{ getTimeRangeText() }}</span>
            </template>
          </van-field>
          <van-field name="analysisType" label="分析类型" readonly is-link @click="showTypePicker = true">
            <template #input>
              <span>{{ getAnalysisTypeText() }}</span>
            </template>
          </van-field>
        </van-cell-group>

        <div class="start-button">
          <van-button type="primary" size="large" block @click="startAnalysis">
            <van-icon name="play" />
            开始AI分析
          </van-button>
        </div>
      </div>

      <!-- 分析进度 -->
      <div class="analysis-progress" v-if="analyzing">
        <div class="progress-content">
          <van-loading size="24px" color="#409eff" vertical>
            <template #icon>
              <van-icon name="bulb-o" size="40" color="#409eff" />
            </template>
          </van-loading>
          <h3>AI正在分析数据中...</h3>
          <p class="progress-step">{{ loadingStep }}</p>
          <van-progress :percentage="loadingProgress" :show-text="false" stroke-width="8" />
        </div>
      </div>

      <!-- 分析结果 -->
      <div class="analysis-result" v-if="analysisResult">
        <div class="result-header">
          <van-tag type="success" size="large">分析完成</van-tag>
          <span class="result-time">{{ formatTime(new Date()) }}</span>
        </div>

        <!-- 关键指标 -->
        <van-cell-group inset title="关键指标">
          <div class="metrics-grid">
            <div class="metric-item">
              <div class="metric-icon" style="background: linear-gradient(135deg, #409eff, #66b1ff);">
                <van-icon name="phone-o" size="20" color="white" />
              </div>
              <div class="metric-content">
                <div class="metric-value">{{ analysisResult.keyMetrics?.totalInquiries || 0 }}</div>
                <div class="metric-label">总咨询量</div>
                <div class="metric-change positive" v-if="analysisResult.keyMetrics?.inquiryChange">
                  {{ formatChange(analysisResult.keyMetrics.inquiryChange) }}
                </div>
              </div>
            </div>

            <div class="metric-item">
              <div class="metric-icon" style="background: linear-gradient(135deg, #07c160, #38d9a9);">
                <van-icon name="success" size="20" color="white" />
              </div>
              <div class="metric-content">
                <div class="metric-value">{{ analysisResult.keyMetrics?.totalApplications || 0 }}</div>
                <div class="metric-label">总申请量</div>
                <div class="metric-change positive" v-if="analysisResult.keyMetrics?.applicationChange">
                  {{ formatChange(analysisResult.keyMetrics.applicationChange) }}
                </div>
              </div>
            </div>

            <div class="metric-item">
              <div class="metric-icon" style="background: linear-gradient(135deg, #ff976a, #ffc069);">
                <van-icon name="aim" size="20" color="white" />
              </div>
              <div class="metric-content">
                <div class="metric-value">{{ Math.round((analysisResult.keyMetrics?.conversionRate || 0) * 100) }}%</div>
                <div class="metric-label">转化率</div>
                <div class="metric-change" :class="analysisResult.keyMetrics?.conversionChange > 0 ? 'positive' : 'negative'">
                  {{ formatChange(analysisResult.keyMetrics?.conversionChange || 0) }}
                </div>
              </div>
            </div>

            <div class="metric-item">
              <div class="metric-icon" style="background: linear-gradient(135deg, #909399, #b3b3b3);">
                <van-icon name="friends-o" size="20" color="white" />
              </div>
              <div class="metric-content">
                <div class="metric-value">{{ analysisResult.keyMetrics?.totalEnrollments || 0 }}</div>
                <div class="metric-label">总入学量</div>
                <div class="metric-change positive" v-if="analysisResult.keyMetrics?.enrollmentChange">
                  {{ formatChange(analysisResult.keyMetrics.enrollmentChange) }}
                </div>
              </div>
            </div>
          </div>
        </van-cell-group>

        <!-- AI洞察 -->
        <van-cell-group inset title="AI洞察建议">
          <div class="insights-section">
            <div class="insight-block">
              <h4 class="insight-title trends">
                <van-icon name="chart-trending-o" color="#409eff" />
                趋势洞察
              </h4>
              <ul class="insight-list">
                <li v-for="(insight, index) in (analysisResult.insights?.trends || [])" :key="index">
                  {{ insight }}
                </li>
              </ul>
            </div>

            <div class="insight-block">
              <h4 class="insight-title problems">
                <van-icon name="warning-o" color="#ee0a24" />
                问题识别
              </h4>
              <ul class="insight-list">
                <li v-for="(problem, index) in (analysisResult.insights?.problems || [])" :key="index">
                  {{ problem }}
                </li>
              </ul>
            </div>

            <div class="insight-block">
              <h4 class="insight-title opportunities">
                <van-icon name="good-job-o" color="#07c160" />
                机会建议
              </h4>
              <ul class="insight-list">
                <li v-for="(opportunity, index) in (analysisResult.insights?.opportunities || [])" :key="index">
                  {{ opportunity }}
                </li>
              </ul>
            </div>
          </div>
        </van-cell-group>

        <!-- 行动建议 -->
        <van-cell-group inset title="行动建议">
          <div class="recommendations">
            <div
              v-for="(action, index) in (analysisResult.recommendations || [])"
              :key="index"
              class="recommendation-item"
            >
              <div class="recommendation-header">
                <h5>{{ action.title }}</h5>
                <van-tag :type="getPriorityType(action.priority)" size="small">
                  {{ action.priority }}优先级
                </van-tag>
              </div>
              <p class="recommendation-desc">{{ action.description }}</p>
              <div class="recommendation-meta">
                <span class="impact">预期效果: {{ action.expectedImpact }}</span>
              </div>
            </div>
          </div>
        </van-cell-group>

        <!-- 重新分析按钮 -->
        <div class="action-buttons">
          <van-button type="primary" size="large" block @click="resetAnalysis">
            <van-icon name="replay" />
            重新分析
          </van-button>
        </div>
      </div>

      <!-- 时间范围选择器 -->
      <van-popup v-model:show="showTimePicker" position="bottom">
        <van-picker
          :columns="timeRangeColumns"
          @confirm="onTimeConfirm"
          @cancel="showTimePicker = false"
        />
      </van-popup>

      <!-- 分析类型选择器 -->
      <van-popup v-model:show="showTypePicker" position="bottom">
        <van-picker
          :columns="analysisTypeColumns"
          @confirm="onTypeConfirm"
          @cancel="showTypePicker = false"
        />
      </van-popup>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { enrollmentAIApi } from '@/api/modules/enrollment-ai'

interface Props {
  modelValue: boolean
}

interface AnalysisResult {
  keyMetrics?: {
    totalInquiries: number
    totalApplications: number
    totalEnrollments: number
    conversionRate: number
    inquiryChange?: number
    applicationChange?: number
    enrollmentChange?: number
    conversionChange?: number
  }
  insights?: {
    trends: string[]
    problems: string[]
    opportunities: string[]
  }
  recommendations?: Array<{
    title: string
    description: string
    priority: string
    expectedImpact: string
  }>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'analysis-completed': [result: AnalysisResult]
}>()

const showTimePicker = ref(false)
const showTypePicker = ref(false)
const analyzing = ref(false)
const loadingProgress = ref(0)
const loadingStep = ref('准备分析...')
const analysisResult = ref<AnalysisResult | null>(null)

const analysisConfig = ref({
  timeRange: 'month',
  analysisType: 'comprehensive'
})

const timeRangeColumns = [
  { text: '近一个月', value: 'month' },
  { text: '近三个月', value: 'quarter' },
  { text: '近半年', value: 'halfYear' },
  { text: '近一年', value: 'year' }
]

const analysisTypeColumns = [
  { text: '全面分析', value: 'comprehensive' },
  { text: '转化漏斗', value: 'funnel' },
  { text: '用户画像', value: 'persona' },
  { text: '渠道分析', value: 'channel' }
]

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const getTimeRangeText = () => {
  const item = timeRangeColumns.find(t => t.value === analysisConfig.value.timeRange)
  return item?.text || '选择时间范围'
}

const getAnalysisTypeText = () => {
  const item = analysisTypeColumns.find(t => t.value === analysisConfig.value.analysisType)
  return item?.text || '选择分析类型'
}

const onTimeConfirm = ({ selectedOptions }: any) => {
  analysisConfig.value.timeRange = selectedOptions[0].value
  showTimePicker.value = false
}

const onTypeConfirm = ({ selectedOptions }: any) => {
  analysisConfig.value.analysisType = selectedOptions[0].value
  showTypePicker.value = false
}

const formatChange = (change: number) => {
  const prefix = change > 0 ? '+' : ''
  return `${prefix}${(change * 100).toFixed(1)}%`
}

const formatTime = (date: Date) => {
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getPriorityType = (priority: string) => {
  const types: Record<string, any> = {
    '高': 'danger',
    '中': 'warning',
    '低': 'success'
  }
  return types[priority] || 'primary'
}

const startAnalysis = async () => {
  analyzing.value = true
  loadingProgress.value = 0
  analysisResult.value = null

  try {
    const steps = [
      '收集数据源...',
      '清洗和处理数据...',
      '计算关键指标...',
      '分析转化漏斗...',
      '识别趋势模式...',
      '生成AI洞察...',
      '制定行动建议...'
    ]

    for (let i = 0; i < steps.length; i++) {
      loadingStep.value = steps[i]
      loadingProgress.value = ((i + 1) / steps.length) * 90
      await new Promise(resolve => setTimeout(resolve, 800))
    }

    loadingStep.value = '完成分析...'
    loadingProgress.value = 100

    // 调用API获取分析结果
    const response = await enrollmentAIApi.generateTrendAnalysis(analysisConfig.value.timeRange)

    if (response.success && response.data) {
      analysisResult.value = response.data
      emit('analysis-completed', response.data)
      showToast('AI分析完成')
    } else {
      // 如果API返回失败，使用模拟数据
      analysisResult.value = getMockAnalysisResult()
      emit('analysis-completed', analysisResult.value)
      showToast('AI分析完成（演示数据）')
    }
  } catch (error) {
    console.error('AI分析失败:', error)
    // 使用模拟数据作为降级方案
    analysisResult.value = getMockAnalysisResult()
    emit('analysis-completed', analysisResult.value)
    showToast('AI分析完成（演示数据）')
  } finally {
    analyzing.value = false
    loadingProgress.value = 0
  }
}

const getMockAnalysisResult = (): AnalysisResult => {
  return {
    keyMetrics: {
      totalInquiries: 234,
      totalApplications: 156,
      totalEnrollments: 98,
      conversionRate: 0.42,
      inquiryChange: 0.12,
      applicationChange: 0.08,
      enrollmentChange: 0.15,
      conversionChange: 0.03
    },
    insights: {
      trends: [
        '本月咨询量较上月增长12%，线上推广渠道效果显著',
        '申请转化率稳定在42%，高于行业平均水平',
        '周末咨询量比工作日高30%，建议增加周末人力投入'
      ],
      problems: [
        '30-35岁年龄组转化率偏低，需要针对性优化',
        '地推活动成本较高，但ROI低于线上渠道',
        '咨询到申请的等待时间过长，影响转化率'
      ],
      opportunities: [
        '朋友推荐渠道转化率最高(68%)，可加大激励政策',
        '30-35岁家长群体关注教学质量，可突出师资优势',
        '线上咨询高峰在18-21点，建议延长在线客服时间'
      ]
    },
    recommendations: [
      {
        title: '优化线上推广投放策略',
        description: '将30%的预算从地推转移到线上推广，重点投放朋友圈和抖音平台',
        priority: '高',
        expectedImpact: '预计提升咨询量20%'
      },
      {
        title: '实施推荐奖励计划',
        description: '为成功推荐的家长提供优惠券或积分奖励，形成口碑传播',
        priority: '高',
        expectedImpact: '预计提升转化率15%'
      },
      {
        title: '延长在线客服时间',
        description: '在18-22点增加客服人员，快速响应咨询',
        priority: '中',
        expectedImpact: '预计提升申请率10%'
      }
    ]
  }
}

const resetAnalysis = () => {
  analysisResult.value = null
  analyzing.value = false
  loadingProgress.value = 0
}

const handleClosed = () => {
  resetAnalysis()
}
</script>

<style scoped lang="scss">
.ai-analysis-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--van-background-color-light);
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) 16px 12px;
  border-bottom: 1px solid var(--van-border-color);

  h3 {
    flex: 1;
    margin: 0;
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--van-text-color);
  }
}

.analysis-config {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);

  .start-button {
    margin-top: 16px;
  }
}

.analysis-progress {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;

  .progress-content {
    text-align: center;

    h3 {
      margin: var(--spacing-lg) 0 8px;
      font-size: var(--text-base);
      color: var(--van-text-color);
    }

    .progress-step {
      font-size: var(--text-sm);
      color: var(--van-primary-color);
      margin-bottom: 20px;
    }
  }
}

.analysis-result {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 0 4px;

    .result-time {
      font-size: var(--text-xs);
      color: var(--van-text-color-2);
    }
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
    padding: var(--spacing-md);

    .metric-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      background: var(--van-gray-1);
      border-radius: 8px;

      .metric-icon {
        width: 40px;
        height: 40px;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .metric-content {
        flex: 1;

        .metric-value {
          font-size: var(--text-lg);
          font-weight: bold;
          color: var(--van-text-color);
          line-height: 1;
          margin-bottom: 4px;
        }

        .metric-label {
          font-size: 11px;
          color: var(--van-text-color-2);
          margin-bottom: 2px;
        }

        .metric-change {
          font-size: 10px;
          font-weight: 500;

          &.positive {
            color: var(--van-success-color);
          }

          &.negative {
            color: var(--van-danger-color);
          }
        }
      }
    }
  }

  .insights-section {
    padding: var(--spacing-md);

    .insight-block {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .insight-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: var(--text-sm);
        font-weight: 600;
        margin: 0 0 8px 0;

        &.trends {
          color: var(--van-primary-color);
        }

        &.problems {
          color: var(--van-danger-color);
        }

        &.opportunities {
          color: var(--van-success-color);
        }
      }

      .insight-list {
        margin: 0;
        padding-left: 20px;

        li {
          font-size: var(--text-sm);
          color: var(--van-text-color);
          line-height: 1.6;
          margin-bottom: 6px;
        }
      }
    }
  }

  .recommendations {
    padding: var(--spacing-md);

    .recommendation-item {
      padding: var(--spacing-md);
      background: var(--van-gray-1);
      border-radius: 8px;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      .recommendation-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;

        h5 {
          margin: 0;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--van-text-color);
        }
      }

      .recommendation-desc {
        font-size: var(--text-sm);
        color: var(--van-text-color-2);
        line-height: 1.5;
        margin: 0 0 6px 0;
      }

      .recommendation-meta {
        .impact {
          font-size: 11px;
          color: var(--van-info-color);
        }
      }
    }
  }

  .action-buttons {
    margin-top: 16px;
  }
}

// 暗黑模式适配
:root[data-theme="dark"] {
  .ai-analysis-dialog {
    background: var(--van-background-color-dark);
  }

  .metrics-grid .metric-item,
  .insights-section .insight-block,
  .recommendations .recommendation-item {
    background: var(--van-gray-8);
  }
}
</style>
