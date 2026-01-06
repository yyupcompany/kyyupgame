<template>
  <div class="growth-trajectory-page">
    <el-card class="page-header">
      <h1>成长轨迹</h1>
      <p class="subtitle">追踪孩子成长，见证每一次进步</p>
    </el-card>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="孩子姓名">
          <el-input v-model="filterForm.childName" placeholder="请输入孩子姓名" clearable />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="filterForm.phone" placeholder="请输入联系电话" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadTrajectory">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 无数据提示 -->
    <el-empty v-else-if="!trajectoryData || trajectoryData.records.length === 0" description="暂无成长轨迹数据" />

    <!-- 成长轨迹内容 -->
    <div v-else class="trajectory-content">
      <!-- 总体概览 -->
      <el-card class="overview-card">
        <template #header>
          <h2>总体概览</h2>
        </template>
        <div class="overview-content">
          <div class="overview-item">
            <div class="label">测评次数</div>
            <div class="value">{{ trajectoryData.records.length }}</div>
          </div>
          <div class="overview-item">
            <div class="label">当前发育商</div>
            <div class="value highlight">
              {{ trajectoryData.records[trajectoryData.records.length - 1]?.dq || 0 }}
            </div>
          </div>
          <div class="overview-item" v-if="trajectoryData.comparison?.currentVsPrevious">
            <div class="label">与上次对比</div>
            <div class="value" :class="trajectoryData.comparison.currentVsPrevious.dqChange >= 0 ? 'positive' : 'negative'">
              {{ trajectoryData.comparison.currentVsPrevious.dqChange >= 0 ? '+' : '' }}{{ trajectoryData.comparison.currentVsPrevious.dqChange }}
            </div>
          </div>
        </div>
      </el-card>

      <!-- 发育商趋势图 -->
      <el-card class="chart-card">
        <template #header>
          <h2>发育商趋势</h2>
        </template>
        <div ref="dqChartRef" class="chart-container" style="height: 400px;"></div>
      </el-card>

      <!-- 各维度趋势对比 -->
      <el-card class="chart-card">
        <template #header>
          <h2>各维度能力趋势</h2>
        </template>
        <div ref="dimensionChartRef" class="chart-container" style="height: 500px;"></div>
      </el-card>

      <!-- 改进分析 -->
      <el-card v-if="trajectoryData.trends.improvements.length > 0" class="improvement-card">
        <template #header>
          <h2>能力改进分析</h2>
        </template>
        <div class="improvement-list">
          <div
            v-for="(item, index) in trajectoryData.trends.improvements"
            :key="index"
            class="improvement-item"
          >
            <div class="dimension-name">{{ getDimensionName(item.dimension) }}</div>
            <div class="improvement-value" :class="item.trend">
              <el-icon v-if="item.trend === 'up'"><ArrowUp /></el-icon>
              <el-icon v-else-if="item.trend === 'down'"><ArrowDown /></el-icon>
              <el-icon v-else><Minus /></el-icon>
              <span>{{ item.improvement >= 0 ? '+' : '' }}{{ item.improvement }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 历史记录列表 -->
      <el-card class="records-card">
        <template #header>
          <h2>历史测评记录</h2>
        </template>
        <el-table :data="trajectoryData.records" style="width: 100%">
          <el-table-column prop="recordNo" label="记录编号" width="180" />
          <el-table-column prop="childName" label="孩子姓名" width="120" />
          <el-table-column prop="childAge" label="年龄" width="100">
            <template #default="{ row }">
              {{ row.childAge }}个月
            </template>
          </el-table-column>
          <el-table-column prop="assessmentDate" label="测评日期" width="180">
            <template #default="{ row }">
              {{ formatDate(row.assessmentDate) }}
            </template>
          </el-table-column>
          <el-table-column prop="dq" label="发育商" width="120">
            <template #default="{ row }">
              <el-tag type="success" size="large">{{ row.dq }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="totalScore" label="总分" width="120">
            <template #default="{ row }">
              {{ row.totalScore }}/{{ row.maxScore }}
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="150">
            <template #default="{ row }">
              <el-button type="primary" link @click="viewReport(row.id)">查看报告</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowUp, ArrowDown, Minus } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { assessmentApi } from '@/api/assessment'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const trajectoryData = ref<any>(null)
const filterForm = ref({
  childName: '',
  phone: ''
})

const dqChartRef = ref<HTMLElement>()
const dimensionChartRef = ref<HTMLElement>()
let dqChart: echarts.ECharts | null = null
let dimensionChart: echarts.ECharts | null = null

// 维度名称映射
const dimensionNames: Record<string, string> = {
  attention: '专注力',
  memory: '记忆力',
  logic: '逻辑思维',
  language: '语言能力',
  motor: '运动能力',
  social: '社交能力'
}

const getDimensionName = (dim: string) => {
  return dimensionNames[dim] || dim
}

// 格式化日期
const formatDate = (date: string | Date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 加载成长轨迹数据
const loadTrajectory = async () => {
  try {
    loading.value = true
    const response = await assessmentApi.getGrowthTrajectory({
      childName: filterForm.value.childName || undefined,
      phone: filterForm.value.phone || undefined,
      limit: 12
    })
    trajectoryData.value = response.data.data
    
    // 渲染图表
    await nextTick()
    setTimeout(() => {
      renderDQChart()
      renderDimensionChart()
    }, 300)
  } catch (error: any) {
    ElMessage.error(error.message || '加载成长轨迹失败')
  } finally {
    loading.value = false
  }
}

// 渲染发育商趋势图
const renderDQChart = () => {
  if (!dqChartRef.value || !trajectoryData.value) return

  if (dqChart) {
    dqChart.dispose()
  }

  dqChart = echarts.init(dqChartRef.value)

  const option: echarts.EChartsOption = {
    title: {
      text: '发育商变化趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0]
        return `${param.name}<br/>发育商: ${param.value}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trajectoryData.value.trends.dates
    },
    yAxis: {
      type: 'value',
      name: '发育商',
      min: Math.max(0, Math.min(...trajectoryData.value.trends.dqTrend) - 20),
      max: Math.max(...trajectoryData.value.trends.dqTrend) + 20
    },
    series: [
      {
        name: '发育商',
        type: 'line',
        smooth: true,
        data: trajectoryData.value.trends.dqTrend,
        itemStyle: {
          color: 'var(--primary-color)'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(64, 158, 255, 0.5)'
            },
            {
              offset: 1,
              color: 'rgba(64, 158, 255, 0.1)'
            }
          ])
        },
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ]
        },
        markLine: {
          data: [
            { type: 'average', name: '平均值' }
          ]
        }
      }
    ]
  }

  dqChart.setOption(option)

  // 窗口大小变化时自动调整
  window.addEventListener('resize', () => {
    dqChart?.resize()
  })
}

// 渲染各维度趋势图
const renderDimensionChart = () => {
  if (!dimensionChartRef.value || !trajectoryData.value) return

  if (dimensionChart) {
    dimensionChart.dispose()
  }

  dimensionChart = echarts.init(dimensionChartRef.value)

  const dimensionTrends = trajectoryData.value.trends.dimensionTrends
  const dates = trajectoryData.value.trends.dates
  const colors = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272']

  const series = Object.keys(dimensionTrends).map((dim, index) => ({
    name: getDimensionName(dim),
    type: 'line',
    smooth: true,
    data: dimensionTrends[dim],
    itemStyle: {
      color: colors[index % colors.length]
    }
  }))

  const option: echarts.EChartsOption = {
    title: {
      text: '各维度能力变化',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: Object.keys(dimensionTrends).map(dim => getDimensionName(dim)),
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value',
      name: '得分'
    },
    series
  }

  dimensionChart.setOption(option)

  // 窗口大小变化时自动调整
  window.addEventListener('resize', () => {
    dimensionChart?.resize()
  })
}

// 重置筛选条件
const resetFilter = () => {
  filterForm.value = {
    childName: '',
    phone: ''
  }
  loadTrajectory()
}

// 查看报告
const viewReport = (recordId: number) => {
  router.push(`/parent-center/assessment/report/${recordId}`)
}

// 初始化
onMounted(() => {
  // 从路由参数获取筛选条件
  if (route.query.childName) {
    filterForm.value.childName = route.query.childName as string
  }
  if (route.query.phone) {
    filterForm.value.phone = route.query.phone as string
  }
  
  loadTrajectory()
})
</script>

<style scoped lang="scss">
.growth-trajectory-page {
  padding: var(--text-2xl);
  max-width: 1400px;
  margin: 0 auto;

  .page-header {
    margin-bottom: var(--text-2xl);

    h1 {
      margin: 0 0 10px 0;
      font-size: var(--text-3xl);
      color: var(--text-primary);
    }

    .subtitle {
      margin: 0;
      color: var(--info-color);
      font-size: var(--text-base);
    }
  }

  .filter-card {
    margin-bottom: var(--text-2xl);
  }

  .loading-container {
    padding: var(--spacing-10xl);
  }

  .trajectory-content {
    .overview-card {
      margin-bottom: var(--text-2xl);

      .overview-content {
        display: flex;
        gap: var(--spacing-5xl);
        padding: var(--text-2xl) 0;

        .overview-item {
          flex: 1;
          text-align: center;

          .label {
            font-size: var(--text-base);
            color: var(--info-color);
            margin-bottom: var(--spacing-2xl);
          }

          .value {
            font-size: var(--spacing-3xl);
            font-weight: bold;
            color: var(--text-primary);

            &.highlight {
              color: var(--primary-color);
            }

            &.positive {
              color: var(--success-color);
            }

            &.negative {
              color: var(--danger-color);
            }
          }
        }
      }
    }

    .chart-card {
      margin-bottom: var(--text-2xl);

      .chart-container {
        width: 100%;
      }
    }

    .improvement-card {
      margin-bottom: var(--text-2xl);

      .improvement-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--text-2xl);
        padding: var(--text-2xl) 0;

        .improvement-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--text-2xl);
          background: var(--bg-hover);
          border-radius: var(--spacing-sm);

          .dimension-name {
            font-size: var(--text-lg);
            color: var(--text-primary);
            margin-bottom: var(--spacing-2xl);
          }

          .improvement-value {
            display: flex;
            align-items: center;
            gap: var(--spacing-base);
            font-size: var(--text-3xl);
            font-weight: bold;

            &.up {
              color: var(--success-color);
            }

            &.down {
              color: var(--danger-color);
            }

            &.stable {
              color: var(--info-color);
            }
          }
        }
      }
    }

    .records-card {
      margin-bottom: var(--text-2xl);
    }
  }
}
</style>





