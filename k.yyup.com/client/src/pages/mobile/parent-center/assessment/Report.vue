<template>
  <div class="mobile-assessment-report">
    <!-- 页面头部 -->
    <div class="report-header">
      <van-nav-bar
        title="测评报告"
        left-arrow
        @click-left="goBack"
        :fixed="true"
        :placeholder="true"
      >
        <template #right>
          <van-icon
            name="share-o"
            size="18"
            @click="shareReport"
          />
        </template>
      </van-nav-bar>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-section">
      <van-skeleton :row="8" :loading="true" animated />
    </div>

    <!-- 报告内容 -->
    <div v-else-if="reportData" class="report-content">
      <!-- 报告概览卡片 -->
      <div class="report-overview">
        <div class="overview-header">
          <h2 class="report-title">发育商测评报告</h2>
          <div class="child-info">
            <div class="info-item">
              <van-icon name="contact" size="16" />
              <span>{{ reportData.overall?.childName }}</span>
            </div>
            <div class="info-item">
              <van-icon name="calendar-o" size="16" />
              <span>{{ reportData.overall?.age }}个月</span>
            </div>
            <div class="info-item">
              <van-tag type="success" size="medium">
                DQ: {{ reportData.overall?.dq }}
              </van-tag>
            </div>
          </div>
        </div>

        <!-- 总体评分 -->
        <div class="overall-score">
          <div class="score-circle">
            <div class="score-value">{{ reportData.overall?.dq }}</div>
            <div class="score-label">发育商</div>
            <div class="score-level">{{ getDQLevel(reportData.overall?.dq) }}</div>
          </div>
          <div class="score-details">
            <div class="score-item">
              <span>总分</span>
              <strong>{{ reportData.overall?.totalScore }}/{{ reportData.overall?.maxScore }}</strong>
            </div>
            <div class="score-item">
              <span>测评日期</span>
              <strong>{{ formatDate(reportData.overall?.assessmentDate) }}</strong>
            </div>
            <div class="score-item">
              <span>测评类型</span>
              <strong>{{ getAssessmentType(reportData.type) }}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- 各维度得分 -->
      <div class="dimensions-section">
        <van-cell-group inset title="各维度得分">
          <div class="dimensions-chart">
            <canvas ref="chartCanvas" class="chart-canvas"></canvas>
          </div>
          <div class="dimensions-list">
            <div
              v-for="(score, dimension) in reportData.dimensionScores"
              :key="dimension"
              class="dimension-item"
            >
              <div class="dimension-info">
                <span class="dimension-name">{{ getDimensionName(dimension) }}</span>
                <span class="dimension-score">{{ score }}分</span>
              </div>
              <van-progress
                :percentage="score"
                stroke-width="8"
                :show-pivot="false"
                :color="getDimensionColor(dimension)"
              />
            </div>
          </div>
        </van-cell-group>
      </div>

      <!-- 优势分析 -->
      <div v-if="reportData.strengths?.length" class="strengths-section">
        <van-cell-group inset title="优势分析">
          <div class="strengths-list">
            <div
              v-for="(strength, index) in reportData.strengths"
              :key="index"
              class="strength-item"
            >
              <van-icon name="success" color="#67c23a" size="16" />
              <span>{{ strength }}</span>
            </div>
          </div>
        </van-cell-group>
      </div>

      <!-- 专业评估 -->
      <div class="assessment-section">
        <van-cell-group inset title="专业评估">
          <div class="assessment-content" v-html="formatReportContent(reportData.aiReport)"></div>
        </van-cell-group>
      </div>

      <!-- 成长建议 -->
      <div v-if="reportData.recommendations?.length" class="recommendations-section">
        <van-cell-group inset title="成长建议">
          <div class="recommendations-list">
            <div
              v-for="(recommendation, index) in reportData.recommendations"
              :key="index"
              class="recommendation-item"
            >
              <div class="recommendation-number">{{ index + 1 }}</div>
              <div class="recommendation-content">{{ recommendation }}</div>
            </div>
          </div>
        </van-cell-group>
      </div>

      <!-- 发展轨迹对比 -->
      <div v-if="reportData.comparison" class="comparison-section">
        <van-cell-group inset title="发展轨迹">
          <div class="comparison-content">
            <div class="comparison-chart">
              <canvas ref="trendCanvas" class="trend-canvas"></canvas>
            </div>
            <div class="comparison-summary">
              <div class="summary-item" v-if="reportData.comparison.dqChange">
                <span class="summary-label">发育商变化</span>
                <span class="summary-value" :class="reportData.comparison.dqChange >= 0 ? 'positive' : 'negative'">
                  {{ reportData.comparison.dqChange >= 0 ? '+' : '' }}{{ reportData.comparison.dqChange }}
                </span>
              </div>
              <div class="summary-item" v-if="reportData.comparison.rankChange">
                <span class="summary-label">同龄排名变化</span>
                <span class="summary-value" :class="reportData.comparison.rankChange >= 0 ? 'positive' : 'negative'">
                  {{ reportData.comparison.rankChange >= 0 ? '↑' : '↓' }}{{ Math.abs(reportData.comparison.rankChange) }}%
                </span>
              </div>
            </div>
          </div>
        </van-cell-group>
      </div>

      <!-- 行动计划 -->
      <div class="action-plan-section">
        <van-cell-group inset title="行动计划">
          <div class="action-categories">
            <div
              v-for="category in reportData.actionPlan"
              :key="category.title"
              class="action-category"
            >
              <div class="category-header">
                <van-icon :name="getCategoryIcon(category.title)" :color="getCategoryColor(category.title)" />
                <h3 class="category-title">{{ category.title }}</h3>
              </div>
              <ul class="action-list">
                <li v-for="action in category.actions" :key="action">{{ action }}</li>
              </ul>
            </div>
          </div>
        </van-cell-group>
      </div>

      <!-- 操作按钮 -->
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
                导出PDF
              </van-button>
              <van-button
                size="small"
                @click="shareReport"
                block
              >
                <van-icon name="share-o" />
                分享报告
              </van-button>
              <van-button
                size="small"
                @click="scheduleFollowUp"
                block
              >
                <van-icon name="calendar-o" />
                预约复测
              </van-button>
            </div>
          </van-cell>
        </van-cell-group>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-section">
      <van-empty description="报告加载失败">
        <van-button type="primary" @click="loadReport">重新加载</van-button>
      </van-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toast } from 'vant'

interface ReportData {
  type: string
  overall: {
    childName: string
    age: number
    dq: number
    totalScore: number
    maxScore: number
    assessmentDate: Date
  }
  dimensionScores: Record<string, number>
  strengths: string[]
  aiReport: string
  recommendations: string[]
  comparison?: {
    dqChange: number
    rankChange: number
  }
  actionPlan: Array<{
    title: string
    actions: string[]
  }>
}

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const chartCanvas = ref<HTMLCanvasElement>()
const trendCanvas = ref<HTMLCanvasElement>()
const reportData = ref<ReportData | null>(null)

const getDQLevel = (dq?: number) => {
  if (!dq) return ''
  if (dq >= 130) return '优秀'
  if (dq >= 115) return '良好'
  if (dq >= 85) return '中等'
  if (dq >= 70) return '偏低'
  return '需要关注'
}

const getAssessmentType = (type?: string) => {
  const types: Record<string, string> = {
    development: '发育商测评',
    school_readiness: '幼小衔接测评',
    academic: '学科测评'
  }
  return types[type || 'development'] || '综合测评'
}

const getDimensionName = (key: string) => {
  const names: Record<string, string> = {
    gross: '大运动',
    fine: '精细动作',
    language: '语言能力',
    social: '社交行为',
    cognitive: '认知能力',
    academic: '学业能力'
  }
  return names[key] || key
}

const getDimensionColor = (key: string) => {
  const colors: Record<string, string> = {
    gross: '#FF6B6B',
    fine: '#4ECDC4',
    language: '#45B7D1',
    social: '#96CEB4',
    cognitive: '#DDA0DD',
    academic: '#FFB347'
  }
  return colors[key] || '#409EFF'
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    '运动发展': 'sport',
    '语言培养': 'chat-o',
    '社交能力': 'friends-o',
    '认知训练': 'bulb-o',
    '情感发展': 'smile-o',
    '学习习惯': 'book-o'
  }
  return icons[category] || 'info-o'
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    '运动发展': '#FF6B6B',
    '语言培养': '#4ECDC4',
    '社交能力': '#45B7D1',
    '认知训练': '#96CEB4',
    '情感发展': '#DDA0DD',
    '学习习惯': '#FFB347'
  }
  return colors[category] || '#409EFF'
}

const loadReport = async () => {
  const reportId = route.query.id as string
  if (!reportId) {
    Toast.fail('缺少报告ID')
    return
  }

  loading.value = true

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟报告数据
    reportData.value = {
      type: 'development',
      overall: {
        childName: '小明',
        age: 48,
        dq: 105,
        totalScore: 420,
        maxScore: 500,
        assessmentDate: new Date('2024-01-15')
      },
      dimensionScores: {
        gross: 95,
        fine: 110,
        language: 100,
        social: 108,
        cognitive: 112
      },
      strengths: [
        '认知能力突出',
        '精细动作发展良好',
        '社交能力较强',
        '语言表达清晰'
      ],
      aiReport: `
        <h3>综合评估</h3>
        <p>根据本次测评结果，孩子的整体发育商为105，处于良好水平。各维度发展相对均衡，其中认知能力和精细动作表现尤为突出。</p>

        <h3>发展特点</h3>
        <p>孩子在认知发展方面表现出较强的学习能力和理解能力，建议继续保持和加强。语言能力发展正常，能够较好地表达自己的想法和需求。</p>

        <h3>成长建议</h3>
        <p>建议家长在日常生活中多创造互动机会，促进孩子社交能力的进一步发展。同时可以适当增加一些挑战性的认知游戏，帮助孩子在保持优势的同时全面发展。</p>
      `,
      recommendations: [
        '增加户外活动时间，促进大运动发展',
        '多参与集体活动，提升社交技能',
        '进行适龄的认知训练游戏',
        '保持良好的阅读习惯',
        '培养独立思考能力'
      ],
      comparison: {
        dqChange: 7,
        rankChange: 5
      },
      actionPlan: [
        {
          title: '运动发展',
          actions: [
            '每天保证1小时户外活动',
            '练习跳绳、拍球等运动技能',
            '参加体操或舞蹈课程'
          ]
        },
        {
          title: '语言培养',
          actions: [
            '每日亲子阅读30分钟',
            '鼓励孩子讲述日常生活',
            '学习简单的儿歌和古诗'
          ]
        }
      ]
    }

    // 渲染图表
    await nextTick()
    renderCharts()
  } catch (error) {
    Toast.fail('加载报告失败')
  } finally {
    loading.value = false
  }
}

const renderCharts = () => {
  if (chartCanvas.value) {
    const ctx = chartCanvas.value.getContext('2d')
    if (ctx) {
      // 简单的雷达图绘制
      const centerX = chartCanvas.value.width / 2
      const centerY = chartCanvas.value.height / 2
      const radius = Math.min(centerX, centerY) - 20

      // 绘制背景网格
      ctx.strokeStyle = '#e0e0e0'
      ctx.lineWidth = 1
      for (let i = 1; i <= 5; i++) {
        ctx.beginPath()
        for (let j = 0; j < 5; j++) {
          const angle = (j * 72 - 90) * Math.PI / 180
          const x = centerX + Math.cos(angle) * radius * i / 5
          const y = centerY + Math.sin(angle) * radius * i / 5
          if (j === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.stroke()
      }

      // 绘制数据
      const dimensions = Object.keys(reportData.value!.dimensionScores)
      const scores = Object.values(reportData.value!.dimensionScores)

      ctx.fillStyle = 'rgba(64, 158, 255, 0.3)'
      ctx.strokeStyle = '#409EFF'
      ctx.lineWidth = 2
      ctx.beginPath()

      dimensions.forEach((dim, index) => {
        const angle = (index * 72 - 90) * Math.PI / 180
        const score = scores[index]
        const x = centerX + Math.cos(angle) * radius * score / 100
        const y = centerY + Math.sin(angle) * radius * score / 100
        if (index === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })

      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
  }

  if (trendCanvas.value) {
    const ctx = trendCanvas.value.getContext('2d')
    if (ctx) {
      // 简单的趋势图绘制
      ctx.fillStyle = '#f0f0f0'
      ctx.fillRect(0, 0, trendCanvas.value.width, trendCanvas.value.height)
      ctx.fillStyle = '#666'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('发展趋势图', trendCanvas.value.width / 2, trendCanvas.value.height / 2)
    }
  }
}

const formatReportContent = (content: string) => {
  return content.replace(/\n/g, '<br>')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/mobile/parent-center/assessment')
  }
}

const exportReport = () => {
  Toast.success('PDF导出成功')
}

const shareReport = () => {
  Toast('分享功能开发中')
}

const scheduleFollowUp = () => {
  router.push({
    path: '/mobile/parent-center/assessment',
    query: { action: 'schedule', childId: reportData.value?.overall?.childName }
  })
}

onMounted(() => {
  loadReport()
})
</script>

<style scoped lang="scss">
.mobile-assessment-report {
  min-height: 100vh;
  background: var(--van-background-color);
  padding-bottom: var(--van-padding-md);
}

.report-header {
  :deep(.van-nav-bar) {
    background: var(--van-primary-color);
    color: white;

    .van-nav-bar__title {
      color: white;
      font-weight: 600;
    }

    .van-icon {
      color: white;
    }
  }
}

.loading-section {
  padding: var(--van-padding-lg);
}

.report-content {
  // 内容样式
}

.report-overview {
  padding: var(--van-padding-lg);
  background: linear-gradient(135deg, var(--van-primary-color), var(--van-primary-color-light));
  color: white;
  margin: var(--van-padding-md);

  .overview-header {
    text-align: center;
    margin-bottom: var(--van-padding-lg);

    .report-title {
      font-size: var(--van-font-size-xl);
      font-weight: 600;
      margin: 0 0 var(--van-padding-md) 0;
    }

    .child-info {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--van-padding-md);
      flex-wrap: wrap;

      .info-item {
        display: flex;
        align-items: center;
        gap: var(--van-padding-xs);
        font-size: var(--van-font-size-sm);

        .van-tag {
          background: rgba(255, 255, 255, 0.2);
          border: none;
        }
      }
    }
  }

  .overall-score {
    display: flex;
    align-items: center;
    gap: var(--van-padding-xl);

    .score-circle {
      text-align: center;
      flex-shrink: 0;

      .score-value {
        font-size: var(--text-5xl);
        font-weight: 600;
        line-height: 1;
        margin-bottom: var(--van-padding-xs);
      }

      .score-label {
        font-size: var(--van-font-size-md);
        opacity: 0.9;
        margin-bottom: var(--van-padding-xs);
      }

      .score-level {
        font-size: var(--van-font-size-sm);
        opacity: 0.8;
        background: rgba(255, 255, 255, 0.2);
        padding: 2px 8px;
        border-radius: 12px;
        display: inline-block;
      }
    }

    .score-details {
      flex: 1;

      .score-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--van-padding-sm) 0;
        font-size: var(--van-font-size-md);

        span {
          opacity: 0.9;
        }

        strong {
          font-weight: 600;
        }
      }
    }
  }
}

.dimensions-section,
.strengths-section,
.assessment-section,
.recommendations-section,
.comparison-section,
.action-plan-section,
.actions-section {
  margin: var(--van-padding-md) 0;
}

.dimensions-chart {
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

.dimensions-list {
  padding: var(--van-padding-md);

  .dimension-item {
    margin-bottom: var(--van-padding-md);

    &:last-child {
      margin-bottom: 0;
    }

    .dimension-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--van-padding-xs);

      .dimension-name {
        font-size: var(--van-font-size-md);
        color: var(--van-text-color);
      }

      .dimension-score {
        font-size: var(--van-font-size-md);
        font-weight: 600;
        color: var(--van-text-color);
      }
    }
  }
}

.strengths-list {
  padding: var(--van-padding-md);
  display: flex;
  flex-direction: column;
  gap: var(--van-padding-sm);

  .strength-item {
    display: flex;
    align-items: center;
    gap: var(--van-padding-sm);
    padding: var(--van-padding-sm);
    background: var(--van-background-color-light);
    border-radius: var(--van-radius-md);
    font-size: var(--van-font-size-md);
    color: var(--van-text-color);
  }
}

.assessment-content {
  padding: var(--van-padding-md);
  font-size: var(--van-font-size-md);
  line-height: 1.6;
  color: var(--van-text-color-2);

  :deep(h3) {
    font-size: var(--van-font-size-lg);
    font-weight: 600;
    color: var(--van-text-color);
    margin: var(--van-padding-md) 0 var(--van-padding-sm) 0;
  }

  :deep(p) {
    margin: var(--van-padding-sm) 0;
  }
}

.recommendations-list {
  padding: var(--van-padding-md);

  .recommendation-item {
    display: flex;
    align-items: flex-start;
    gap: var(--van-padding-md);
    margin-bottom: var(--van-padding-md);
    padding: var(--van-padding-md);
    background: var(--van-background-color-light);
    border-radius: var(--van-radius-md);

    &:last-child {
      margin-bottom: 0;
    }

    .recommendation-number {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--van-primary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--van-font-size-sm);
      font-weight: 600;
      flex-shrink: 0;
    }

    .recommendation-content {
      flex: 1;
      font-size: var(--van-font-size-md);
      line-height: 1.5;
      color: var(--van-text-color-2);
    }
  }
}

.comparison-content {
  padding: var(--van-padding-md);

  .comparison-chart {
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--van-background-color-light);
    border-radius: var(--van-radius-md);
    margin-bottom: var(--van-padding-md);

    .trend-canvas {
      max-width: 100%;
      max-height: 100%;
    }
  }

  .comparison-summary {
    display: flex;
    justify-content: space-around;
    padding: var(--van-padding-md);
    background: var(--van-background-color-light);
    border-radius: var(--van-radius-md);

    .summary-item {
      text-align: center;

      .summary-label {
        display: block;
        font-size: var(--van-font-size-sm);
        color: var(--van-text-color-2);
        margin-bottom: var(--van-padding-xs);
      }

      .summary-value {
        font-size: var(--van-font-size-lg);
        font-weight: 600;

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

.action-categories {
  padding: var(--van-padding-md);

  .action-category {
    margin-bottom: var(--van-padding-lg);

    &:last-child {
      margin-bottom: 0;
    }

    .category-header {
      display: flex;
      align-items: center;
      gap: var(--van-padding-sm);
      margin-bottom: var(--van-padding-md);

      .category-title {
        font-size: var(--van-font-size-lg);
        font-weight: 600;
        color: var(--van-text-color);
        margin: 0;
      }
    }

    .action-list {
      margin: 0;
      padding-left: var(--van-padding-lg);

      li {
        font-size: var(--van-font-size-md);
        color: var(--van-text-color-2);
        line-height: 1.5;
        margin-bottom: var(--van-padding-sm);

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--van-padding-sm);
}

.error-section {
  padding: var(--van-padding-xl);
  text-align: center;
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .report-overview {
    background: linear-gradient(135deg, var(--van-primary-color-dark), var(--van-primary-color));
  }

  .dimension-item,
  .strength-item,
  .recommendation-item,
  .comparison-summary,
  .action-category {
    background: var(--van-background-color-dark);
  }

  .dimensions-chart,
  .comparison-chart {
    background: var(--van-background-color-dark);
  }
}

// 响应式设计
@media (min-width: 768px) {
  .report-overview .overall-score {
    justify-content: center;
  }

  .action-buttons {
    flex-direction: row;
  }
}
</style>