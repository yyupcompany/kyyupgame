<template>
  <div class="mobile-growth-trajectory">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">
          <van-icon name="chart-trending-o" size="20" />
          成长轨迹
        </h2>
        <p class="page-description">追踪孩子成长，见证每一次进步</p>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <van-cell-group inset title="查询条件">
        <van-form @submit="loadTrajectory">
          <van-field
            v-model="filterForm.childName"
            name="childName"
            label="孩子姓名"
            placeholder="请输入孩子姓名"
            clearable
          />
          <van-field
            v-model="filterForm.phone"
            name="phone"
            label="联系电话"
            placeholder="请输入联系电话"
            clearable
          />
        </van-form>
      </van-cell-group>

      <div class="filter-actions">
        <van-button
          type="primary"
          size="small"
          @click="loadTrajectory"
          :loading="loading"
          block
        >
          查询
        </van-button>
        <van-button
          size="small"
          @click="resetFilter"
          block
        >
          重置
        </van-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-section">
      <van-skeleton :row="5" :loading="true" animated />
    </div>

    <!-- 无数据提示 -->
    <div v-else-if="!trajectoryData || trajectoryData.records.length === 0" class="empty-section">
      <van-empty description="暂无成长轨迹数据">
        <van-button
          type="primary"
          size="small"
          @click="goToAssessment"
        >
          开始测评
        </van-button>
      </van-empty>
    </div>

    <!-- 成长轨迹内容 -->
    <div v-else class="trajectory-content">
      <!-- 总体概览 -->
      <div class="overview-section">
        <van-cell-group inset title="总体概览">
          <van-grid :column-num="3" :gutter="10">
            <van-grid-item>
              <div class="overview-item">
                <div class="overview-value">{{ trajectoryData.records.length }}</div>
                <div class="overview-label">测评次数</div>
              </div>
            </van-grid-item>
            <van-grid-item>
              <div class="overview-item">
                <div class="overview-value highlight">{{ currentDQ }}</div>
                <div class="overview-label">当前发育商</div>
              </div>
            </van-grid-item>
            <van-grid-item v-if="trajectoryData.comparison?.currentVsPrevious">
              <div class="overview-item">
                <div class="overview-value" :class="dqChangeClass">
                  {{ dqChangeText }}
                </div>
                <div class="overview-label">与上次对比</div>
              </div>
            </van-grid-item>
          </van-grid>
        </van-cell-group>
      </div>

      <!-- 发育商趋势图 -->
      <div class="chart-section">
        <van-cell-group inset title="发育商趋势">
          <div class="chart-container">
            <canvas ref="dqChartCanvas" class="chart-canvas"></canvas>
          </div>
        </van-cell-group>
      </div>

      <!-- 各维度趋势对比 -->
      <div class="chart-section">
        <van-cell-group inset title="各维度能力趋势">
          <div class="chart-container">
            <canvas ref="dimensionChartCanvas" class="chart-canvas"></canvas>
          </div>
        </van-cell-group>
      </div>

      <!-- 改进分析 -->
      <div v-if="trajectoryData.trends?.improvements?.length > 0" class="improvement-section">
        <van-cell-group inset title="能力改进分析">
          <div class="improvement-list">
            <div
              v-for="improvement in trajectoryData.trends.improvements"
              :key="improvement.dimension"
              class="improvement-item"
            >
              <div class="improvement-info">
                <div class="improvement-dimension">{{ improvement.dimension }}</div>
                <div class="improvement-trend">
                  <span class="trend-value">{{ improvement.value }}</span>
                  <van-icon :name="improvement.trend === 'up' ? 'arrow-up' : 'arrow'"
                           :class="improvement.trend === 'up' ? 'trend-up' : 'trend-down'" />
                </div>
              </div>
              <div class="improvement-desc">{{ improvement.description }}</div>
            </div>
          </div>
        </van-cell-group>
      </div>

      <!-- 详细记录列表 -->
      <div class="records-section">
        <van-cell-group inset title="测评记录">
          <div class="records-list">
            <div
              v-for="(record, index) in trajectoryData.records"
              :key="record.id"
              class="record-item"
              @click="viewRecordDetail(record)"
            >
              <div class="record-header">
                <div class="record-title">
                  <span class="record-index">#{{ trajectoryData.records.length - index }}</span>
                  <span class="record-date">{{ formatDate(record.assessmentDate) }}</span>
                </div>
                <div class="record-dq">{{ record.dq }}分</div>
              </div>

              <div class="record-content">
                <div class="record-dimensions">
                  <div
                    v-for="(value, key) in record.dimensionScores"
                    :key="key"
                    class="dimension-score"
                  >
                    <span class="dimension-name">{{ getDimensionName(key) }}</span>
                    <van-progress
                      :percentage="value"
                      stroke-width="6"
                      :show-pivot="false"
                      color="var(--van-primary-color)"
                    />
                  </div>
                </div>

                <div class="record-summary">{{ record.summary }}</div>
              </div>
            </div>
          </div>
        </van-cell-group>
      </div>

      <!-- 建议与指导 -->
      <div v-if="trajectoryData.recommendations" class="recommendations-section">
        <van-cell-group inset title="成长建议">
          <div class="recommendations-list">
            <div
              v-for="recommendation in trajectoryData.recommendations"
              :key="recommendation.category"
              class="recommendation-item"
            >
              <div class="recommendation-header">
                <van-icon :name="getRecommendationIcon(recommendation.category)"
                         :color="getRecommendationColor(recommendation.category)" />
                <span class="recommendation-title">{{ recommendation.category }}</span>
              </div>
              <div class="recommendation-content">{{ recommendation.content }}</div>
            </div>
          </div>
        </van-cell-group>
      </div>

      <!-- 导出和分享 -->
      <div class="actions-section">
        <van-cell-group inset>
          <van-cell>
            <div class="action-buttons">
              <van-button
                type="primary"
                size="small"
                @click="exportReport"
                block
              >
                <van-icon name="down" />
                导出报告
              </van-button>
              <van-button
                size="small"
                @click="shareReport"
                block
              >
                <van-icon name="share-o" />
                分享报告
              </van-button>
            </div>
          </van-cell>
        </van-cell-group>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'vant'

interface FilterForm {
  childName: string
  phone: string
}

interface TrajectoryRecord {
  id: number
  assessmentDate: Date
  dq: number
  dimensionScores: Record<string, number>
  summary: string
  childName: string
  age: number
}

interface TrajectoryData {
  records: TrajectoryRecord[]
  comparison?: {
    currentVsPrevious: {
      dqChange: number
      dimensionChanges: Record<string, number>
    }
  }
  trends?: {
    improvements: Array<{
      dimension: string
      value: number
      trend: 'up' | 'down'
      description: string
    }>
  }
  recommendations?: Array<{
    category: string
    content: string
    priority: 'high' | 'medium' | 'low'
  }>
}

const router = useRouter()
const loading = ref(false)
const dqChartCanvas = ref<HTMLCanvasElement>()
const dimensionChartCanvas = ref<HTMLCanvasElement>()

const filterForm = reactive<FilterForm>({
  childName: '',
  phone: ''
})

const trajectoryData = ref<TrajectoryData | null>(null)

const currentDQ = computed(() => {
  if (!trajectoryData.value?.records.length) return 0
  return trajectoryData.value.records[trajectoryData.value.records.length - 1]?.dq || 0
})

const dqChangeClass = computed(() => {
  const change = trajectoryData.value?.comparison?.currentVsPrevious?.dqChange || 0
  return change >= 0 ? 'positive' : 'negative'
})

const dqChangeText = computed(() => {
  const change = trajectoryData.value?.comparison?.currentVsPrevious?.dqChange || 0
  return change >= 0 ? `+${change}` : `${change}`
})

const getDimensionName = (key: string) => {
  const names: Record<string, string> = {
    gross: '大运动',
    fine: '精细动作',
    language: '语言能力',
    social: '社交行为',
    cognitive: '认知能力'
  }
  return names[key] || key
}

const getRecommendationIcon = (category: string) => {
  const icons: Record<string, string> = {
    '运动发展': 'sport',
    '语言培养': 'chat-o',
    '社交能力': 'friends-o',
    '认知训练': 'bulb-o',
    '情感发展': 'smile-o'
  }
  return icons[category] || 'info-o'
}

const getRecommendationColor = (category: string) => {
  const colors: Record<string, string> = {
    '运动发展': '#FF6B6B',
    '语言培养': '#4ECDC4',
    '社交能力': '#45B7D1',
    '认知训练': '#96CEB4',
    '情感发展': '#DDA0DD'
  }
  return colors[category] || '#409EFF'
}

const loadTrajectory = async () => {
  loading.value = true

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟数据
    trajectoryData.value = {
      records: [
        {
          id: 1,
          assessmentDate: new Date('2024-01-15'),
          dq: 105,
          dimensionScores: {
            gross: 95,
            fine: 110,
            language: 100,
            social: 108,
            cognitive: 112
          },
          summary: '整体发育良好，认知能力突出',
          childName: '小明',
          age: 4
        },
        {
          id: 2,
          assessmentDate: new Date('2023-10-20'),
          dq: 98,
          dimensionScores: {
            gross: 92,
            fine: 95,
            language: 96,
            social: 102,
            cognitive: 105
          },
          summary: '各项能力均衡发展',
          childName: '小明',
          age: 3.5
        }
      ],
      comparison: {
        currentVsPrevious: {
          dqChange: 7,
          dimensionChanges: {
            gross: 3,
            fine: 15,
            language: 4,
            social: 6,
            cognitive: 7
          }
        }
      },
      trends: {
        improvements: [
          {
            dimension: '精细动作',
            value: 15,
            trend: 'up',
            description: '手眼协调能力显著提升'
          },
          {
            dimension: '认知能力',
            value: 7,
            trend: 'up',
            description: '学习能力稳步提升'
          }
        ]
      },
      recommendations: [
        {
          category: '运动发展',
          content: '建议增加户外活动时间，培养运动兴趣',
          priority: 'medium'
        },
        {
          category: '语言培养',
          content: '多与孩子进行亲子阅读，丰富语言环境',
          priority: 'high'
        }
      ]
    }

    // 渲染图表
    await nextTick()
    renderCharts()
  } catch (error) {
    Toast.fail('加载成长轨迹失败')
  } finally {
    loading.value = false
  }
}

const resetFilter = () => {
  filterForm.childName = ''
  filterForm.phone = ''
  loadTrajectory()
}

const renderCharts = () => {
  // 这里应该使用图表库（如Chart.js）来渲染图表
  // 由于是示例，这里只做占位
  if (dqChartCanvas.value) {
    const ctx = dqChartCanvas.value.getContext('2d')
    if (ctx) {
      // 简单的占位绘制
      ctx.fillStyle = '#f0f0f0'
      ctx.fillRect(0, 0, dqChartCanvas.value.width, dqChartCanvas.value.height)
      ctx.fillStyle = '#666'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('发育商趋势图', dqChartCanvas.value.width / 2, dqChartCanvas.value.height / 2)
    }
  }

  if (dimensionChartCanvas.value) {
    const ctx = dimensionChartCanvas.value.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#f0f0f0'
      ctx.fillRect(0, 0, dimensionChartCanvas.value.width, dimensionChartCanvas.value.height)
      ctx.fillStyle = '#666'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('各维度能力趋势图', dimensionChartCanvas.value.width / 2, dimensionChartCanvas.value.height / 2)
    }
  }
}

const viewRecordDetail = (record: TrajectoryRecord) => {
  router.push({
    path: '/mobile/parent-center/assessment/report',
    query: { id: record.id.toString() }
  })
}

const exportReport = () => {
  Toast.success('报告导出成功')
}

const shareReport = () => {
  Toast('分享功能开发中')
}

const goToAssessment = () => {
  router.push('/mobile/parent-center/assessment')
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadTrajectory()
})
</script>

<style scoped lang="scss">
.mobile-growth-trajectory {
  min-height: 100vh;
  background: var(--van-background-color);
  padding-bottom: var(--van-padding-md);
}

.page-header {
  padding: var(--van-padding-lg);
  background: linear-gradient(135deg, var(--van-primary-color), var(--van-primary-color-light));
  color: white;

  .header-content {
    text-align: center;

    .page-title {
      font-size: var(--van-font-size-lg);
      font-weight: 600;
      margin: 0 0 var(--van-padding-sm) 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--van-padding-xs);

      .van-icon {
        margin-right: var(--van-padding-xs);
      }
    }

    .page-description {
      font-size: var(--van-font-size-md);
      opacity: 0.9;
      margin: 0;
      line-height: 1.5;
    }
  }
}

.filter-section {
  margin: var(--van-padding-md) 0;
}

.filter-actions {
  padding: 0 var(--van-padding-md);
  display: flex;
  gap: var(--van-padding-sm);
  margin-top: var(--van-padding-md);
}

.loading-section {
  padding: var(--van-padding-lg);
}

.empty-section {
  padding: var(--van-padding-xl);
  text-align: center;
}

.trajectory-content {
  // 内容样式
}

.overview-section {
  margin: var(--van-padding-md) 0;
}

.overview-item {
  text-align: center;

  .overview-value {
    font-size: var(--van-font-size-xl);
    font-weight: 600;
    color: var(--van-text-color);
    margin-bottom: 4px;

    &.highlight {
      color: var(--van-primary-color);
    }

    &.positive {
      color: var(--van-success-color);
    }

    &.negative {
      color: var(--van-danger-color);
    }
  }

  .overview-label {
    font-size: var(--van-font-size-sm);
    color: var(--van-text-color-2);
  }
}

.chart-section {
  margin: var(--van-padding-md) 0;
}

.chart-container {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--van-background-color-light);
  border-radius: var(--van-radius-md);
  margin: var(--van-padding-md);

  .chart-canvas {
    max-width: 100%;
    max-height: 100%;
  }
}

.improvement-section,
.records-section,
.recommendations-section,
.actions-section {
  margin: var(--van-padding-md) 0;
}

.improvement-list {
  .improvement-item {
    padding: var(--van-padding-md);
    border-radius: var(--van-radius-md);
    background: var(--van-background-color-light);
    margin-bottom: var(--van-padding-sm);

    .improvement-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--van-padding-sm);

      .improvement-dimension {
        font-weight: 600;
        color: var(--van-text-color);
      }

      .improvement-trend {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);

        .trend-value {
          font-weight: 600;
          color: var(--van-text-color);
        }

        .trend-up {
          color: var(--van-success-color);
        }

        .trend-down {
          color: var(--van-danger-color);
        }
      }
    }

    .improvement-desc {
      font-size: var(--van-font-size-sm);
      color: var(--van-text-color-2);
      line-height: 1.5;
    }
  }
}

.records-list {
  .record-item {
    padding: var(--van-padding-md);
    border-radius: var(--van-radius-md);
    background: var(--van-background-color-light);
    margin-bottom: var(--van-padding-sm);
    transition: all 0.3s ease;

    &:last-child {
      margin-bottom: 0;
    }

    &:active {
      background: var(--van-background-color-dark);
    }

    .record-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--van-padding-md);

      .record-title {
        display: flex;
        align-items: center;
        gap: var(--van-padding-sm);

        .record-index {
          font-size: var(--van-font-size-sm);
          color: var(--van-text-color-2);
        }

        .record-date {
          font-size: var(--van-font-size-sm);
          color: var(--van-text-color-2);
        }
      }

      .record-dq {
        font-size: var(--van-font-size-lg);
        font-weight: 600;
        color: var(--van-primary-color);
      }
    }

    .record-content {
      .record-dimensions {
        display: flex;
        flex-direction: column;
        gap: var(--van-padding-sm);
        margin-bottom: var(--van-padding-md);

        .dimension-score {
          display: flex;
          align-items: center;
          gap: var(--van-padding-sm);

          .dimension-name {
            min-width: 70px;
            font-size: var(--van-font-size-sm);
            color: var(--van-text-color-2);
          }

          .van-progress {
            flex: 1;
          }
        }
      }

      .record-summary {
        font-size: var(--van-font-size-sm);
        color: var(--van-text-color-2);
        line-height: 1.5;
      }
    }
  }
}

.recommendations-list {
  .recommendation-item {
    padding: var(--van-padding-md);
    border-radius: var(--van-radius-md);
    background: var(--van-background-color-light);
    margin-bottom: var(--van-padding-sm);

    .recommendation-header {
      display: flex;
      align-items: center;
      gap: var(--van-padding-sm);
      margin-bottom: var(--van-padding-sm);

      .recommendation-title {
        font-weight: 600;
        color: var(--van-text-color);
      }
    }

    .recommendation-content {
      font-size: var(--van-font-size-sm);
      color: var(--van-text-color-2);
      line-height: 1.5;
    }
  }
}

.action-buttons {
  display: flex;
  gap: var(--van-padding-sm);
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .improvement-item,
  .record-item,
  .recommendation-item {
    background: var(--van-background-color-dark);
  }

  .chart-container {
    background: var(--van-background-color-dark);
  }
}
</style>