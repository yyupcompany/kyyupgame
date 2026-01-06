<template>
  <div class="record-detail">
    <!-- 头部导航 -->
    <div class="page-header">
      <van-nav-bar
        :title="pageTitle"
        left-arrow
        @click-left="$router.go(-1)"
        fixed
        placeholder
      />
    </div>

    <!-- 训练记录详情内容 -->
    <div class="record-content">
      <!-- 训练概览 -->
      <div class="training-overview">
        <div class="overview-header">
          <div class="activity-icon">
            <van-icon name="medal-o" size="48" color="#ff6b6b" />
          </div>
          <div class="activity-info">
            <h2 class="activity-name">{{ record.activityName }}</h2>
            <div class="training-date">{{ formatDate(record.date) }}</div>
          </div>
        </div>

        <!-- 成绩指标 -->
        <div class="performance-metrics">
          <div class="metric-item">
            <div class="metric-value">{{ record.score }}</div>
            <div class="metric-label">总得分</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">{{ record.accuracy }}%</div>
            <div class="metric-label">准确率</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">{{ record.duration }}分钟</div>
            <div class="metric-label">训练时长</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">{{ record.completedLevels }}</div>
            <div class="metric-label">完成关卡</div>
          </div>
        </div>
      </div>

      <!-- 表现评价 -->
      <div class="performance-evaluation">
        <h3>表现评价</h3>
        <div class="rating-section">
          <div class="rating-label">综合表现</div>
          <div class="rating-stars">
            <van-rate
              v-model="performanceRating"
              readonly
              size="20"
              color="#ffd21e"
            />
            <span class="rating-text">{{ getPerformanceLabel(record.performance) }}</span>
          </div>
        </div>

        <div class="performance-bars">
          <div class="bar-item">
            <span class="bar-label">专注度</span>
            <van-progress
              :percentage="record.attentionScore || 0"
              stroke-width="8"
              color="#1890ff"
              :show-pivot="false"
            />
            <span class="bar-value">{{ record.attentionScore || 0 }}%</span>
          </div>
          <div class="bar-item">
            <span class="bar-label">完成度</span>
            <van-progress
              :percentage="record.completionScore || 0"
              stroke-width="8"
              color="#52c41a"
              :show-pivot="false"
            />
            <span class="bar-value">{{ record.completionScore || 0 }}%</span>
          </div>
          <div class="bar-item">
            <span class="bar-label">反应速度</span>
            <van-progress
              :percentage="record.responseSpeed || 0"
              stroke-width="8"
              color="#ff7a45"
              :show-pivot="false"
            />
            <span class="bar-value">{{ record.responseSpeed || 0 }}%</span>
          </div>
        </div>
      </div>

      <!-- AI智能反馈 -->
      <div class="ai-feedback" v-if="record.aiFeedback">
        <h3>
          <van-icon name="robot-o" color="#1890ff" />
          AI智能分析
        </h3>
        <div class="feedback-content">
          <p>{{ record.aiFeedback }}</p>
        </div>

        <!-- 改进建议 -->
        <div class="improvement-suggestions" v-if="suggestions.length">
          <h4>改进建议</h4>
          <div class="suggestion-list">
            <div
              v-for="(suggestion, index) in suggestions"
              :key="index"
              class="suggestion-item"
            >
              <van-icon name="bulb-o" color="#faad14" />
              <span>{{ suggestion }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 训练数据详情 -->
      <div class="training-data" v-if="record.progressData">
        <h3>训练数据详情</h3>
        <div class="data-grid">
          <div
            v-for="(value, key) in displayData"
            :key="key"
            class="data-item"
          >
            <div class="data-label">{{ getDataLabel(key) }}</div>
            <div class="data-value">{{ formatDataValue(key, value) }}</div>
          </div>
        </div>
      </div>

      <!-- 训练轨迹 -->
      <div class="training-timeline" v-if="record.trainingSteps">
        <h3>训练轨迹</h3>
        <van-timeline>
          <van-timeline-item
            v-for="(step, index) in record.trainingSteps"
            :key="index"
            :timestamp="step.timestamp"
            :color="getStepColor(step.type)"
          >
            <div class="step-content">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-details">{{ step.details }}</div>
              <div class="step-score" v-if="step.score !== undefined">
                得分: {{ step.score }}
              </div>
            </div>
          </van-timeline-item>
        </van-timeline>
      </div>

      <!-- 相关资源 -->
      <div class="related-resources" v-if="relatedActivities.length">
        <h3>推荐训练</h3>
        <div class="resource-list">
          <div
            v-for="activity in relatedActivities"
            :key="activity.id"
            class="resource-item"
            @click="goToActivity(activity.id)"
          >
            <div class="resource-info">
              <div class="resource-name">{{ activity.name }}</div>
              <div class="resource-type">{{ getTypeLabel(activity.type) }}</div>
            </div>
            <van-icon name="arrow" color="#999" />
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="action-buttons">
      <van-button
        type="primary"
        block
        size="large"
        @click="repeatTraining"
      >
        重新训练
      </van-button>
      <van-button
        plain
        block
        size="large"
        @click="shareRecord"
      >
        分享记录
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showLoadingToast, showSuccessToast } from 'vant'

const route = useRoute()
const router = useRouter()

// 页面数据
const record = ref<any>({})
const relatedActivities = ref<any[]>([])

// 计算属性
const pageTitle = computed(() => {
  return `${record.value.activityName || '训练记录'} - 详情`
})

const performanceRating = computed(() => {
  const ratingMap: Record<string, number> = {
    excellent: 5,
    good: 4,
    average: 3,
    needs_improvement: 2,
    poor: 1
  }
  return ratingMap[record.value.performance] || 3
})

const suggestions = computed(() => {
  // 从AI反馈中提取建议，或返回默认建议
  if (record.value.aiSuggestions) {
    return record.value.aiSuggestions
  }

  // 根据表现生成默认建议
  const suggestions = []
  if (record.value.accuracy < 80) {
    suggestions.push('建议多练习基础操作，提高准确率')
  }
  if (record.value.duration < 10) {
    suggestions.push('训练时长较短，建议延长训练时间以获得更好效果')
  }
  if (record.value.performance === 'needs_improvement') {
    suggestions.push('整体表现有提升空间，建议保持规律训练')
  }

  return suggestions
})

const displayData = computed(() => {
  if (!record.value.progressData) return {}

  const data = { ...record.value.progressData }
  // 过滤掉不需要显示的敏感数据
  const filteredData: Record<string, any> = {}

  const displayKeys = [
    'totalAttempts',
    'successRate',
    'averageResponseTime',
    'difficultyLevel',
    'completedTasks',
    'totalTasks'
  ]

  displayKeys.forEach(key => {
    if (data[key] !== undefined) {
      filteredData[key] = data[key]
    }
  })

  return filteredData
})

// 方法
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getPerformanceLabel = (performance: string) => {
  const labelMap: Record<string, string> = {
    excellent: '优秀',
    good: '良好',
    average: '一般',
    needs_improvement: '需改进',
    poor: '较差'
  }
  return labelMap[performance] || '一般'
}

const getDataLabel = (key: string) => {
  const labelMap: Record<string, string> = {
    totalAttempts: '总尝试次数',
    successRate: '成功率',
    averageResponseTime: '平均响应时间',
    difficultyLevel: '难度等级',
    completedTasks: '完成任务数',
    totalTasks: '总任务数'
  }
  return labelMap[key] || key
}

const formatDataValue = (key: string, value: any) => {
  if (key.includes('Rate') || key.includes('rate')) {
    return `${value}%`
  }
  if (key.includes('Time') || key.includes('time')) {
    return `${value}秒`
  }
  if (key.includes('Level') || key.includes('level')) {
    return `等级${value}`
  }
  return value
}

const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    cognitive: '认知训练',
    motor: '运动训练',
    language: '语言训练',
    social: '社交训练'
  }
  return typeMap[type] || type
}

const getStepColor = (type: string) => {
  const colorMap: Record<string, string> = {
    start: '#1890ff',
    progress: '#52c41a',
    milestone: '#faad14',
    complete: '#722ed1',
    error: '#ff4d4f'
  }
  return colorMap[type] || '#666'
}

const loadRecordDetail = async () => {
  try {
    showLoadingToast('加载中...')
    const recordId = route.params.id

    // 这里应该调用实际的API
    // const response = await trainingApi.getRecordDetail(recordId)

    // 模拟数据
    record.value = {
      id: recordId,
      activityId: 1,
      activityName: '注意力训练 - 找不同',
      activityType: 'cognitive',
      date: '2025-12-11T14:30:00Z',
      score: 85,
      accuracy: 85,
      duration: 15,
      completedLevels: 3,
      performance: 'good',
      attentionScore: 88,
      completionScore: 92,
      responseSpeed: 75,
      aiFeedback: '本次训练表现良好，注意力集中度有明显提升。在找不同任务中，孩子能够专注于细节观察，准确率较高。建议继续保持训练频率，逐步提高难度等级以进一步锻炼注意力。',
      aiSuggestions: [
        '可以尝试更复杂的图案差异',
        '建议保持每日训练习惯',
        '可以适当延长训练时间'
      ],
      progressData: {
        totalAttempts: 45,
        successRate: 85,
        averageResponseTime: 3.2,
        difficultyLevel: 2,
        completedTasks: 12,
        totalTasks: 14
      },
      trainingSteps: [
        {
          timestamp: '14:30',
          type: 'start',
          title: '开始训练',
          details: '进入注意力训练模块'
        },
        {
          timestamp: '14:32',
          type: 'progress',
          title: '完成第一关',
          details: '成功找出3处不同',
          score: 90
        },
        {
          timestamp: '14:35',
          type: 'progress',
          title: '完成第二关',
          details: '成功找出5处不同',
          score: 85
        },
        {
          timestamp: '14:40',
          type: 'complete',
          title: '训练完成',
          details: '共完成3个关卡',
          score: 85
        }
      ]
    }

    // 模拟相关活动
    relatedActivities.value = [
      {
        id: 2,
        name: '记忆力训练 - 记忆卡片',
        type: 'cognitive'
      },
      {
        id: 3,
        name: '逻辑思维训练 - 拼图',
        type: 'cognitive'
      }
    ]

  } catch (error) {
    console.error('加载训练记录失败:', error)
  }
}

const repeatTraining = () => {
  router.push(`/training-center/activity-start/${record.value.activityId}`)
}

const shareRecord = () => {
  showSuccessToast('分享功能开发中')
}

const goToActivity = (activityId: number) => {
  router.push(`/training-center/activity-detail/${activityId}`)
}

// 生命周期
onMounted(() => {
  loadRecordDetail()
})
</script>

<style scoped lang="scss">
.record-detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120px;
}

.page-header {
  :deep(.van-nav-bar) {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.record-content {
  padding: var(--spacing-md);

  > div {
    background: white;
    border-radius: 12px;
    padding: var(--spacing-lg);
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    h3 {
      color: #333;
      font-size: var(--text-lg);
      font-weight: 600;
      margin: 0 0 16px 0;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      .van-icon {
        font-size: var(--text-xl);
      }
    }
  }
}

.training-overview {
  .overview-header {
    display: flex;
    align-items: center;
    margin-bottom: 24px;

    .activity-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20px;
      box-shadow: 0 4px 20px rgba(255, 107, 107, 0.3);
    }

    .activity-info {
      flex: 1;

      .activity-name {
        color: #333;
        font-size: 22px;
        font-weight: bold;
        margin: 0 0 8px 0;
      }

      .training-date {
        color: #666;
        font-size: var(--text-sm);
      }
    }
  }

  .performance-metrics {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);

    .metric-item {
      text-align: center;
      padding: var(--spacing-md);
      background: #f8f9fa;
      border-radius: 8px;

      .metric-value {
        font-size: var(--text-2xl);
        font-weight: bold;
        color: #333;
        margin-bottom: 4px;
      }

      .metric-label {
        font-size: var(--text-sm);
        color: #666;
      }
    }
  }
}

.performance-evaluation {
  .rating-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .rating-label {
      color: #333;
      font-size: var(--text-base);
      font-weight: 600;
    }

    .rating-stars {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      .rating-text {
        color: #666;
        font-size: var(--text-sm);
      }
    }
  }

  .performance-bars {
    .bar-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .bar-label {
        width: 60px;
        color: #333;
        font-size: var(--text-sm);
      }

      .van-progress {
        flex: 1;
      }

      .bar-value {
        width: 40px;
        text-align: right;
        color: #666;
        font-size: var(--text-xs);
      }
    }
  }
}

.ai-feedback {
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  border: 1px solid #91d5ff;

  .feedback-content {
    p {
      color: #333;
      line-height: 1.8;
      margin: 0 0 16px 0;
    }
  }

  .improvement-suggestions {
    h4 {
      color: #333;
      font-size: var(--text-base);
      font-weight: 600;
      margin: 0 0 12px 0;
    }

    .suggestion-list {
      .suggestion-item {
        display: flex;
        align-items: flex-start;
        gap: var(--spacing-sm);
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }

        .van-icon {
          margin-top: 2px;
          flex-shrink: 0;
        }

        span {
          color: #333;
          font-size: var(--text-sm);
          line-height: 1.6;
        }
      }
    }
  }
}

.training-data {
  .data-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);

    .data-item {
      padding: var(--spacing-md);
      background: #f8f9fa;
      border-radius: 6px;

      .data-label {
        color: #666;
        font-size: var(--text-xs);
        margin-bottom: 4px;
      }

      .data-value {
        color: #333;
        font-size: var(--text-base);
        font-weight: 600;
      }
    }
  }
}

.training-timeline {
  :deep(.van-timeline) {
    .step-content {
      .step-title {
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
      }

      .step-details {
        color: #666;
        font-size: var(--text-sm);
        margin-bottom: 4px;
      }

      .step-score {
        color: #1890ff;
        font-size: var(--text-xs);
        font-weight: 600;
      }
    }
  }
}

.related-resources {
  .resource-list {
    .resource-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-md) 0;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: all 0.3s;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: #f8f9fa;
        margin: 0 -8px;
        padding: var(--spacing-md) 8px;
        border-radius: 6px;
      }

      .resource-info {
        .resource-name {
          color: #333;
          font-size: var(--text-sm);
          font-weight: 600;
          margin-bottom: 2px;
        }

        .resource-type {
          color: #666;
          font-size: var(--text-xs);
        }
      }

      .van-icon {
        font-size: var(--text-base);
      }
    }
  }
}

.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: var(--spacing-md);

  .van-button {
    flex: 1;
  }
}
</style>