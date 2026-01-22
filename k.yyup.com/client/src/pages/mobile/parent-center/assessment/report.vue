<template>
  <MobileSubPageLayout title="测评报告" back-path="/mobile/parent-center">
    <div class="assessment-report-page" v-if="!loading && reportData">
      <!-- 报告头部 -->
      <van-card class="report-header">
        <template #title>
          <div class="header-title">发育商测评报告</div>
        </template>
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
      </van-card>

      <!-- 总体评价 -->
      <van-card title="总体评价">
        <div class="overall-score">
          <div class="score-circle">
            <div class="score-value">{{ reportData.overall?.dq }}</div>
            <div class="score-label">发育商</div>
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
          </div>
        </div>
      </van-card>

      <!-- 各维度得分 -->
      <van-card title="各维度得分">
        <div ref="chartRef" class="chart-container"></div>
      </van-card>

      <!-- 优势分析 -->
      <van-card v-if="reportData.strengths?.length" title="优势分析">
        <van-cell
          v-for="(strength, index) in reportData.strengths"
          :key="index"
          :title="strength.dimension"
          :value="strength.description"
          icon="star-o"
        />
      </van-card>

      <!-- 改进建议 -->
      <van-card v-if="reportData.improvements?.length" title="改进建议">
        <van-cell
          v-for="(improvement, index) in reportData.improvements"
          :key="index"
          :title="improvement.dimension"
          :value="improvement.suggestion"
          icon="bulb-o"
        />
      </van-card>

      <!-- 详细分析 -->
      <van-collapse v-if="reportData.detailedAnalysis?.length" v-model="activeNames">
        <van-collapse-item
          v-for="(analysis, index) in reportData.detailedAnalysis"
          :key="index"
          :title="analysis.dimension"
          :name="index"
        >
          <div class="dimension-analysis">
            <div class="score-row">
              <span>得分：</span>
              <van-tag type="primary">{{ analysis.score }}/{{ analysis.maxScore }}</van-tag>
            </div>
            <div class="analysis-text">{{ analysis.analysis }}</div>
          </div>
        </van-collapse-item>
      </van-collapse>
    </div>

    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading-container">
      <van-skeleton title :row="5" animated />
      <van-skeleton title :row="5" animated />
      <van-skeleton title :row="5" animated />
    </div>

    <!-- 错误状态 -->
    <van-empty
      v-else-if="error"
      :description="error"
      image="error"
    >
      <van-button type="primary" @click="loadReport">重试</van-button>
    </van-empty>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showFailToast } from 'vant'
import * as echarts from 'echarts'
import { assessmentApi } from '@/api/assessment'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref('')
const reportData = ref<any>(null)
const activeNames = ref([0])
const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

// 维度名称映射
const dimensionNames: Record<string, string> = {
  attention: '专注力',
  memory: '记忆力',
  logic: '逻辑思维',
  language: '语言能力',
  motor: '运动能力',
  social: '社交能力'
}

// 格式化日期
const formatDate = (date: string | Date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 加载报告数据
const loadReport = async () => {
  const recordId = Number(route.params.recordId)
  if (!recordId) {
    error.value = '无效的报告ID'
    return
  }

  try {
    loading.value = true
    error.value = ''
    const response = await assessmentApi.getReport(recordId)
    reportData.value = response.data.data

    // 渲染图表
    await nextTick()
    setTimeout(() => {
      renderChart()
    }, 300)
  } catch (err: any) {
    error.value = err.message || '加载报告失败'
    showFailToast(error.value)
  } finally {
    loading.value = false
  }
}

// 渲染雷达图
const renderChart = () => {
  if (!chartRef.value || !reportData.value) return

  if (chart) {
    chart.dispose()
  }

  chart = echarts.init(chartRef.value)

  const dimensions = reportData.value.dimensions || []
  const data = dimensions.map((dim: any) => ({
    name: dimensionNames[dim.name] || dim.name,
    value: dim.score
  }))

  const option: echarts.EChartsOption = {
    title: {
      text: '各维度得分雷达图',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'item'
    },
    radar: {
      indicator: data.map((item: any) => ({
        name: item.name,
        max: 100
      })),
      center: ['50%', '60%'],
      radius: '70%'
    },
    series: [
      {
        name: '能力得分',
        type: 'radar',
        data: [
          {
            value: data.map((item: any) => item.value),
            name: '得分',
            itemStyle: {
              color: '#409EFF'
            },
            areaStyle: {
              color: 'rgba(64, 158, 255, 0.3)'
            }
          }
        ]
      }
    ]
  }

  chart.setOption(option)

  // 窗口大小变化时自动调整
  window.addEventListener('resize', () => {
    chart?.resize()
  })
}

onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  loadReport()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.assessment-report-page {
  padding: 0 0 var(--van-padding-md) 0;
  background: var(--van-background-color-light);
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));

  .report-header {
    margin: var(--van-padding-md);

    .header-title {
      font-size: var(--van-font-size-lg);
      font-weight: bold;
      color: var(--van-text-color);
      text-align: center;
    }

    .child-info {
      display: flex;
      justify-content: space-around;
      align-items: center;
      margin-top: var(--van-padding-md);

      .info-item {
        display: flex;
        align-items: center;
        gap: var(--van-padding-xs);
        font-size: var(--van-font-size-sm);
        color: var(--van-text-color-2);
      }
    }
  }

  .van-card {
    margin: 0 var(--van-padding-md) var(--van-padding-md);
  }

  .overall-score {
    display: flex;
    align-items: center;
    gap: var(--van-padding-lg);

    .score-circle {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--van-primary-color), #66B1FF);
      color: white;

      .score-value {
        font-size: var(--van-font-size-xl);
        font-weight: bold;
      }

      .score-label {
        font-size: var(--van-font-size-xs);
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
        color: var(--van-text-color-2);

        strong {
          color: var(--van-text-color);
        }
      }
    }
  }

  .chart-container {
    width: 100%;
    height: 300px;
    padding: var(--van-padding-md);
    background: var(--van-background-color);
    border-radius: var(--van-radius-md);
  }

  .dimension-analysis {
    .score-row {
      display: flex;
      align-items: center;
      gap: var(--van-padding-sm);
      margin-bottom: var(--van-padding-sm);
      font-size: var(--van-font-size-md);
    }

    .analysis-text {
      line-height: 1.6;
      color: var(--van-text-color-2);
      font-size: var(--van-font-size-sm);
    }
  }

  .loading-container {
    padding: var(--van-padding-xl);
  }
}

// 移动端优化
@media (max-width: var(--breakpoint-md)) {
  .assessment-report-page {
    .overall-score {
      flex-direction: column;
      gap: var(--van-padding-md);
      text-align: center;
    }

    .chart-container {
      height: 250px;
    }
  }
}

/* ==================== 暗色模式支持 ==================== */
@media (prefers-color-scheme: dark) {
  :root {
    /* 设计令牌会自动适配暗色模式 */
  }
}
</style>