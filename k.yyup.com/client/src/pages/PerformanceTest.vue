<template>
  <div class="performance-test-page">
    <div class="header">
      <h1>集合API性能测试</h1>
      <p>对比优化前后的页面加载性能</p>
    </div>

    <div class="test-controls">
      <el-space>
        <el-button type="primary" @click="testOriginalAPIs" :loading="loadingOriginal">
          测试原始API
        </el-button>
        <el-button type="success" @click="testAggregateAPI" :loading="loadingAggregate">
          测试集合API
        </el-button>
        <el-button type="warning" @click="runComparisonTest" :loading="loadingComparison">
          对比测试
        </el-button>
        <el-button @click="clearResults">清除结果</el-button>
      </el-space>
    </div>

    <div class="results-container" v-if="results.length > 0">
      <el-card class="results-card">
        <template #header>
          <span>测试结果</span>
          <el-tag :type="getPerformanceGrade()" size="large">
            {{ getPerformanceGrade() }}
          </el-tag>
        </template>

        <div class="results-grid">
          <div class="result-item" v-for="result in results" :key="result.id">
            <div class="result-header">
              <h3>{{ result.testName }}</h3>
              <el-tag :type="result.success ? 'success' : 'danger'" size="small">
                {{ result.success ? '成功' : '失败' }}
              </el-tag>
            </div>

            <div class="result-metrics">
              <div class="metric">
                <span class="label">响应时间:</span>
                <span class="value">{{ result.responseTime }}ms</span>
              </div>
              <div class="metric">
                <span class="label">API调用次数:</span>
                <span class="value">{{ result.apiCalls }}</span>
              </div>
              <div class="metric" v-if="result.dataSize">
                <span class="label">数据大小:</span>
                <span class="value">{{ formatDataSize(result.dataSize) }}</span>
              </div>
            </div>

            <div class="result-details" v-if="result.details">
              <el-collapse>
                <el-collapse-item title="详细信息">
                  <pre>{{ JSON.stringify(result.details, null, 2) }}</pre>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="summary-card" v-if="performanceSummary">
        <template #header>
          <span>性能总结</span>
        </template>

        <div class="summary-content">
          <div class="summary-item">
            <h4>总体性能提升</h4>
            <div class="performance-improvement">
              <span class="improvement-value" :class="getImprovementClass()">
                {{ performanceSummary.improvement }}%
              </span>
              <span class="improvement-label">
                {{ getImprovementLabel() }}
              </span>
            </div>
          </div>

          <div class="summary-item">
            <h4>响应时间对比</h4>
            <div class="response-time-comparison">
              <div class="comparison-item">
                <span>原始API:</span>
                <span class="value">{{ performanceSummary.originalAvgTime }}ms</span>
              </div>
              <div class="comparison-item">
                <span>集合API:</span>
                <span class="value">{{ performanceSummary.aggregateAvgTime }}ms</span>
              </div>
            </div>
          </div>

          <div class="summary-item">
            <h4>API调用次数减少</h4>
            <div class="api-reduction">
              <span>从 {{ performanceSummary.originalApiCalls }} 次减少到 {{ performanceSummary.aggregateApiCalls }} 次</span>
              <span class="reduction-percentage">
                (减少 {{ performanceSummary.apiReduction }}%)
              </span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="chart-container" v-if="results.length > 0">
      <el-card>
        <template #header>
          <span>性能对比图表</span>
        </template>
        <div id="performance-chart"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { centersAPI } from '@/api/modules/centers'
import { getSystemStats } from '@/api/modules/system'
import { getActivities } from '@/api/modules/activity'
import { getSystemLogList } from '@/api/modules/log'
import * as echarts from 'echarts'

interface TestResult {
  id: string
  testName: string
  success: boolean
  responseTime: number
  apiCalls: number
  dataSize?: number
  timestamp: number
  details?: any
}

interface PerformanceSummary {
  improvement: number
  originalAvgTime: number
  aggregateAvgTime: number
  originalApiCalls: number
  aggregateApiCalls: number
  apiReduction: number
}

const results = ref<TestResult[]>([])
const loadingOriginal = ref(false)
const loadingAggregate = ref(false)
const loadingComparison = ref(false)

const performanceSummary = computed<PerformanceSummary>(() => {
  const originalResults = results.value.filter(r => r.testName.includes('原始'))
  const aggregateResults = results.value.filter(r => r.testName.includes('集合'))

  const originalAvgTime = originalResults.length > 0
    ? Math.round(originalResults.reduce((sum, r) => sum + r.responseTime, 0) / originalResults.length)
    : 0

  const aggregateAvgTime = aggregateResults.length > 0
    ? Math.round(aggregateResults.reduce((sum, r) => sum + r.responseTime, 0) / aggregateResults.length)
    : 0

  const originalApiCalls = originalResults.length > 0
    ? Math.round(originalResults.reduce((sum, r) => sum + r.apiCalls, 0) / originalResults.length)
    : 0

  const aggregateApiCalls = aggregateResults.length > 0
    ? Math.round(aggregateResults.reduce((sum, r) => sum + r.apiCalls, 0) / aggregateResults.length)
    : 0

  const improvement = originalAvgTime > 0
    ? Math.round(((originalAvgTime - aggregateAvgTime) / originalAvgTime) * 100)
    : 0

  const apiReduction = originalApiCalls > 0
    ? Math.round(((originalApiCalls - aggregateApiCalls) / originalApiCalls) * 100)
    : 0

  return {
    improvement,
    originalAvgTime,
    aggregateAvgTime,
    originalApiCalls,
    aggregateApiCalls,
    apiReduction
  }
})

const getPerformanceGrade = () => {
  const avgTime = performanceSummary.value.aggregateAvgTime
  if (avgTime < 500) return 'success'
  if (avgTime < 1000) return 'warning'
  if (avgTime < 2000) return 'info'
  return 'danger'
}

const getImprovementClass = () => {
  const improvement = performanceSummary.value.improvement
  if (improvement > 50) return 'excellent'
  if (improvement > 20) return 'good'
  if (improvement > 0) return 'fair'
  return 'poor'
}

const getImprovementLabel = () => {
  const improvement = performanceSummary.value.improvement
  if (improvement > 50) return '显著提升'
  if (improvement > 20) return '明显提升'
  if (improvement > 0) return '有所提升'
  return '性能下降'
}

const formatDataSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${Math.round(bytes / (1024 * 1024))} MB`
}

// 测试原始API
const testOriginalAPIs = async () => {
  loadingOriginal.value = true
  const startTime = performance.now()

  try {
    // 模拟原始的多API调用
    const promises = [
      getSystemStats(),
      getSystemLogList({ page: 1, limit: 50 }),
      getActivities({ page: 1, limit: 20 })
    ]

    const responses = await Promise.all(promises)
    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)

    const result: TestResult = {
      id: `original-${Date.now()}`,
      testName: '系统中心原始API',
      success: true,
      responseTime,
      apiCalls: 3,
      dataSize: responses.reduce((sum, r) => sum + JSON.stringify(r).length, 0),
      timestamp: Date.now(),
      details: {
        systemStatsSuccess: !!responses[0],
        logsSuccess: !!responses[1],
        activitiesSuccess: !!responses[2],
        responseDetails: responses.map(r => ({ status: 'success', data: r }))
      }
    }

    results.value.push(result)
    ElMessage.success(`原始API测试完成，响应时间: ${responseTime}ms`)
  } catch (error) {
    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)

    results.value.push({
      id: `original-error-${Date.now()}`,
      testName: '系统中心原始API',
      success: false,
      responseTime,
      apiCalls: 3,
      timestamp: Date.now(),
      details: { error: error.message }
    })

    ElMessage.error(`原始API测试失败: ${error.message}`)
  } finally {
    loadingOriginal.value = false
  }
}

// 测试集合API
const testAggregateAPI = async () => {
  loadingAggregate.value = true
  const startTime = performance.now()

  try {
    const response = await centersAPI.getSystemOverview()
    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)

    const result: TestResult = {
      id: `aggregate-${Date.now()}`,
      testName: '系统中心集合API',
      success: response.success,
      responseTime,
      apiCalls: 1,
      dataSize: JSON.stringify(response).length,
      timestamp: Date.now(),
      details: {
        dataStructure: response.success ? Object.keys(response.data) : [],
        userStats: response.data?.userStats,
        recentLogs: response.data?.recentLogs?.length || 0,
        systemNotifications: response.data?.systemNotifications
      }
    }

    results.value.push(result)
    ElMessage.success(`集合API测试完成，响应时间: ${responseTime}ms`)
  } catch (error) {
    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)

    results.value.push({
      id: `aggregate-error-${Date.now()}`,
      testName: '系统中心集合API',
      success: false,
      responseTime,
      apiCalls: 1,
      timestamp: Date.now(),
      details: { error: error.message }
    })

    ElMessage.error(`集合API测试失败: ${error.message}`)
  } finally {
    loadingAggregate.value = false
  }
}

// 运行对比测试
const runComparisonTest = async () => {
  loadingComparison.value = true

  try {
    // 先清除之前的结果
    results.value = []

    // 连续测试多次取平均值
    const testRounds = 3

    for (let i = 0; i < testRounds; i++) {
      console.log(`开始第 ${i + 1} 轮测试...`)

      await testOriginalAPIs()
      await new Promise(resolve => setTimeout(resolve, 1000)) // 等待1秒

      await testAggregateAPI()
      await new Promise(resolve => setTimeout(resolve, 1000)) // 等待1秒
    }

    ElMessage.success('对比测试完成，请查看结果图表')
  } catch (error) {
    ElMessage.error(`对比测试失败: ${error.message}`)
  } finally {
    loadingComparison.value = false
  }
}

// 清除结果
const clearResults = () => {
  results.value = []
  ElMessage.info('测试结果已清除')
}

// 渲染性能图表
const renderPerformanceChart = () => {
  nextTick(() => {
    const chartElement = document.getElementById('performance-chart')
    if (!chartElement) return

    const originalTimes = results.value
      .filter(r => r.testName.includes('原始'))
      .map(r => r.responseTime)

    const aggregateTimes = results.value
      .filter(r => r.testName.includes('集合'))
      .map(r => r.responseTime)

    if (originalTimes.length === 0 && aggregateTimes.length === 0) return

    const chart = echarts.init(chartElement)
    const option = {
      title: {
        text: 'API响应时间对比 (ms)',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(params: any) {
          return `${params.seriesName}: ${params.value}ms`
        }
      },
      legend: {
        data: ['原始API', '集合API']
      },
      xAxis: {
        type: 'category',
        data: originalTimes.map((_, index) => `测试 ${index + 1}`)
      },
      yAxis: {
        type: 'value',
        name: '响应时间 (ms)'
      },
      series: [
        {
          name: '原始API',
          type: 'bar',
          data: originalTimes,
          itemStyle: {
            color: '#f56c6c'
          }
        },
        {
          name: '集合API',
          type: 'bar',
          data: aggregateTimes,
          itemStyle: {
            color: '#67c23a'
          }
        }
      ]
    }

    chart.setOption(option)

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      chart.resize()
    })
  })
}

// 监听结果变化，自动渲染图表
const watchResults = () => {
  renderPerformanceChart()
}

onMounted(() => {
  watchResults()
})
</script>

<style scoped lang="scss">
.performance-test-page {
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;

  .header {
    text-align: center;
    margin-bottom: 30px;

    h1 {
      margin-bottom: 10px;
      color: var(--text-primary);
    }

    p {
      color: var(--text-secondary);
      font-size: var(--text-base);
    }
  }

  .test-controls {
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
  }

  .results-container {
    margin-bottom: 30px;
  }

  .results-card {
    margin-bottom: 20px;

    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-lg);
    }

    .result-item {
      border: 1px solid var(--border-light);
      border-radius: 8px;
      padding: var(--spacing-md);

      .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        h3 {
          margin: 0;
          font-size: var(--text-base);
          color: var(--text-primary);
        }
      }

      .result-metrics {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);

        .metric {
          display: flex;
          justify-content: space-between;

          .label {
            color: var(--text-secondary);
          }

          .value {
            font-weight: bold;
            color: var(--text-primary);
          }
        }

        .metric .value.success {
          color: var(--success-color);
        }

        .metric .value.warning {
          color: var(--warning-color);
        }

        .metric .value.danger {
          color: var(--danger-color);
        }
      }

      .result-details {
        margin-top: 12px;
        border-top: 1px solid var(--border-light);
        padding-top: 12px;

        pre {
          background: var(--bg-page);
          border-radius: 4px;
          padding: var(--spacing-md);
          overflow-x: auto;
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }
      }
    }
  }

  .summary-card {
    .summary-content {
      .summary-item {
        margin-bottom: 20px;

        h4 {
          margin: 0 0 10px 0;
          color: var(--text-primary);
        }

        .performance-improvement {
          display: flex;
          align-items: center;
          gap: 10px;

          .improvement-value {
            font-size: var(--text-2xl);
            font-weight: bold;

            &.excellent {
              color: var(--success-color);
            }

            &.good {
              color: var(--success-color);
            }

            &.fair {
              color: var(--warning-color);
            }

            &.poor {
              color: var(--danger-color);
            }
          }

          .improvement-label {
            color: var(--text-secondary);
          }
        }

        .response-time-comparison {
          .comparison-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;

          .value {
            font-weight: bold;
          }
        }
        }

        .api-reduction {
          .reduction-percentage {
          color: var(--success-color);
          font-weight: bold;
        }
        }
      }
    }
  }

  .chart-container {
    #performance-chart {
      height: 400px;
      width: 100%;
    }
  }
}
</style>