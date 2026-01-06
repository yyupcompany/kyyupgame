<template>
  <div class="class-statistics-container">
    <!-- 页面头部 -->
    <div class="statistics-header">
      <div class="header-content">
        <div class="page-title">
          <h1>
            <el-icon><DataAnalysis /></el-icon>
            班级统计
          </h1>
          <p>全面的班级数据分析和统计报告</p>
        </div>
        <div class="header-actions">
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出报告
          </el-button>
          <el-button type="primary" @click="handleViewClasses">
            <el-icon><View /></el-icon>
            查看班级
          </el-button>
        </div>
      </div>
    </div>

    <!-- 核心指标 -->
    <div class="core-metrics">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon total">
                <el-icon><School /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ statistics.totalClasses }}</div>
                <div class="metric-label">班级总数</div>
                <div class="metric-detail">活跃班级 {{ statistics.activeClasses }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon students">
                <el-icon><UserFilled /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ statistics.totalStudents }}</div>
                <div class="metric-label">学生总数</div>
                <div class="metric-detail">平均{{ Math.round(statistics.totalStudents / statistics.totalClasses) }}人/班</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon teachers">
                <el-icon><Avatar /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ statistics.totalTeachers }}</div>
                <div class="metric-label">教师总数</div>
                <div class="metric-detail">师生比 1:{{ Math.round(statistics.totalStudents / statistics.totalTeachers) }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon capacity">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ statistics.averageCapacityRate }}%</div>
                <div class="metric-label">平均容量率</div>
                <div class="metric-detail" :class="getCapacityTrendClass()">
                  {{ getCapacityTrend() }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 统计图表 -->
    <el-row :gutter="24" class="charts-section">
      <!-- 班级类型分布 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="chart-header">
              <h3>
                <el-icon><PieChart /></el-icon>
                班级类型分布
              </h3>
              <div class="chart-actions">
                <el-button size="small" @click="refreshTypeChart">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="chart-container">
            <div id="typeDistributionChart" style="width: 100%; height: 300px;"></div>
          </div>
        </el-card>
      </el-col>

      <!-- 年级分布 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="chart-header">
              <h3>
                <el-icon><Histogram /></el-icon>
                年级分布
              </h3>
              <div class="chart-actions">
                <el-button size="small" @click="refreshGradeChart">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="chart-container">
            <div id="gradeDistributionChart" style="width: 100%; height: 300px;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 班级容量分析 -->
    <el-row :gutter="24" class="analysis-section">
      <el-col :span="24">
        <el-card class="analysis-card" shadow="hover">
          <template #header>
            <div class="analysis-header">
              <h3>
                <el-icon><DataLine /></el-icon>
                班级容量分析
              </h3>
              <div class="analysis-controls">
                <el-select v-model="capacityPeriod" @change="refreshCapacityChart" style="width: 120px;">
                  <el-option label="本月" value="month" />
                  <el-option label="本季度" value="quarter" />
                  <el-option label="本年度" value="year" />
                </el-select>
              </div>
            </div>
          </template>
          
          <div class="chart-container">
            <div id="capacityTrendChart" style="width: 100%; height: 400px;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 班级详细列表 -->
    <el-card class="class-list-card" shadow="hover">
      <template #header>
        <div class="list-header">
          <h3>
            <el-icon><List /></el-icon>
            班级详细统计
          </h3>
          <div class="list-controls">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索班级..."
              style="width: 200px"
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </template>
      
      <el-table
        :data="filteredClassList"
        stripe
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="name" label="班级名称" min-width="120" />
        
        <el-table-column label="班级类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getClassTypeTagType(row.type)" size="small">
              {{ getClassTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="grade" label="年级" width="80" align="center" />
        
        <el-table-column label="学生人数" width="120" align="center">
          <template #default="{ row }">
            <span>{{ row.currentStudents }}/{{ row.maxCapacity }}</span>
            <el-progress
              :percentage="Math.round((row.currentStudents / row.maxCapacity) * 100)"
              :stroke-width="4"
              :show-text="false"
              style="margin-top: var(--spacing-xs);"
            />
          </template>
        </el-table-column>
        
        <el-table-column label="容量率" width="80" align="center">
          <template #default="{ row }">
            <span :class="getCapacityRateClass(row.currentStudents / row.maxCapacity)">
              {{ Math.round((row.currentStudents / row.maxCapacity) * 100) }}%
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="teacherCount" label="教师数" width="80" align="center" />
        
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '活跃' : '暂停' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="handleViewClass(row)">
              查看
            </el-button>
            <el-button type="text" size="small" @click="handleAnalyzeClass(row)">
              分析
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="totalClasses"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  DataAnalysis, Refresh, Download, View, School, UserFilled, Avatar,
  TrendCharts, PieChart, Histogram, DataLine, List, Search
} from '@element-plus/icons-vue'
import { getClassStatistics } from '@/api/class'
import * as echarts from 'echarts'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const capacityPeriod = ref('month')

// 统计数据
const statistics = reactive({
  totalClasses: 0,
  activeClasses: 0,
  totalStudents: 0,
  totalTeachers: 0,
  averageCapacityRate: 0,
  classTypeDistribution: [],
  gradeDistribution: []
})

// 班级列表数据
const classList = ref([])

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 20
})

// 计算属性
const filteredClassList = computed(() => {
  let filtered = classList.value
  
  if (searchKeyword.value) {
    filtered = filtered.filter(cls => 
      cls.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filtered.slice(start, end)
})

const totalClasses = computed(() => classList.value.length)

// 生命周期
onMounted(() => {
  loadStatistics()
  loadClassList()
})

// 方法
const loadStatistics = async () => {
  loading.value = true
  try {
    const response = await getClassStatistics()
    if (response.success && response.data) {
      Object.assign(statistics, response.data)
    } else {
      // 使用模拟数据
      Object.assign(statistics, {
        totalClasses: 12,
        activeClasses: 11,
        totalStudents: 285,
        totalTeachers: 24,
        averageCapacityRate: 85,
        classTypeDistribution: [
          { type: 'regular', count: 8 },
          { type: 'special', count: 3 },
          { type: 'bilingual', count: 1 }
        ],
        gradeDistribution: [
          { grade: '小班', count: 4 },
          { grade: '中班', count: 4 },
          { grade: '大班', count: 4 }
        ]
      })
    }
    
    // 生成图表
    nextTick(() => {
      generateTypeChart()
      generateGradeChart()
      generateCapacityChart()
    })
    
  } catch (error) {
    console.error('加载班级统计失败:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.value = false
  }
}

const loadClassList = () => {
  // 模拟班级列表数据
  classList.value = [
    { id: 1, name: '小班A', type: 'regular', grade: '小班', currentStudents: 22, maxCapacity: 25, teacherCount: 2, status: 'active' },
    { id: 2, name: '小班B', type: 'regular', grade: '小班', currentStudents: 24, maxCapacity: 25, teacherCount: 2, status: 'active' },
    { id: 3, name: '中班A', type: 'regular', grade: '中班', currentStudents: 26, maxCapacity: 30, teacherCount: 2, status: 'active' },
    { id: 4, name: '中班B', type: 'special', grade: '中班', currentStudents: 20, maxCapacity: 25, teacherCount: 3, status: 'active' },
    { id: 5, name: '大班A', type: 'regular', grade: '大班', currentStudents: 28, maxCapacity: 30, teacherCount: 2, status: 'active' },
    { id: 6, name: '大班B', type: 'bilingual', grade: '大班', currentStudents: 25, maxCapacity: 30, teacherCount: 3, status: 'active' }
  ]
}

const generateTypeChart = () => {
  const chartDom = document.getElementById('typeDistributionChart')
  if (!chartDom) return

  const myChart = echarts.init(chartDom)

  const option = {
    title: {
      text: '班级类型分布',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['普通班', '特色班', '双语班']
    },
    series: [
      {
        name: '班级类型',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 8, name: '普通班' },
          { value: 3, name: '特色班' },
          { value: 1, name: '双语班' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'var(--shadow-heavy)'
          }
        }
      }
    ]
  }

  myChart.setOption(option)
}

const generateGradeChart = () => {
  const chartDom = document.getElementById('gradeDistributionChart')
  if (!chartDom) return

  const myChart = echarts.init(chartDom)

  const option = {
    title: {
      text: '年级分布',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    xAxis: {
      type: 'category',
      data: ['小班', '中班', '大班']
    },
    yAxis: {
      type: 'value',
      name: '班级数量'
    },
    series: [
      {
        name: '班级数量',
        type: 'bar',
        data: [4, 4, 4],
        itemStyle: {
          color: 'var(--primary-color)'
        }
      }
    ]
  }

  myChart.setOption(option)
}

const generateCapacityChart = () => {
  const chartDom = document.getElementById('capacityTrendChart')
  if (!chartDom) return

  const myChart = echarts.init(chartDom)

  const option = {
    title: {
      text: '班级容量趋势',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['实际人数', '最大容量', '容量率']
    },
    xAxis: {
      type: 'category',
      data: ['小班A', '小班B', '中班A', '中班B', '大班A', '大班B']
    },
    yAxis: [
      {
        type: 'value',
        name: '人数',
        position: 'left'
      },
      {
        type: 'value',
        name: '容量率(%)',
        position: 'right',
        axisLabel: {
          formatter: '{value}%'
        }
      }
    ],
    series: [
      {
        name: '实际人数',
        type: 'bar',
        data: [22, 24, 26, 20, 28, 25]
      },
      {
        name: '最大容量',
        type: 'bar',
        data: [25, 25, 30, 25, 30, 30]
      },
      {
        name: '容量率',
        type: 'line',
        yAxisIndex: 1,
        data: [88, 96, 87, 80, 93, 83]
      }
    ]
  }

  myChart.setOption(option)
}

// 工具方法
const getCapacityTrend = () => {
  if (statistics.averageCapacityRate > 90) return '容量充足'
  if (statistics.averageCapacityRate > 70) return '容量适中'
  return '容量较低'
}

const getCapacityTrendClass = () => {
  if (statistics.averageCapacityRate > 90) return 'trend-high'
  if (statistics.averageCapacityRate > 70) return 'trend-medium'
  return 'trend-low'
}

const getClassTypeText = (type: string) => {
  const typeMap = {
    'regular': '普通班',
    'special': '特色班',
    'bilingual': '双语班'
  }
  return typeMap[type] || '未知'
}

const getClassTypeTagType = (type: string) => {
  const typeMap = {
    'regular': 'primary',
    'special': 'success',
    'bilingual': 'warning'
  }
  return typeMap[type] || 'info'
}

const getCapacityRateClass = (rate: number) => {
  if (rate > 0.9) return 'rate-high'
  if (rate > 0.7) return 'rate-medium'
  return 'rate-low'
}

// 事件处理
const handleRefresh = () => {
  loadStatistics()
  loadClassList()
  ElMessage.success('数据已刷新')
}

const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

const handleViewClasses = () => {
  router.push('/class')
}

const handleSearch = () => {
  pagination.currentPage = 1
}

const handleViewClass = (row: any) => {
  router.push(`/class/detail/${row.id}`)
}

const handleAnalyzeClass = (row: any) => {
  ElMessage.info('班级分析功能开发中')
}

const refreshTypeChart = () => {
  generateTypeChart()
}

const refreshGradeChart = () => {
  generateGradeChart()
}

const refreshCapacityChart = () => {
  generateCapacityChart()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
}
</script>

<style lang="scss">
.class-statistics-container {
  padding: var(--text-2xl);
  max-width: 1400px;
  margin: 0 auto;
}

.statistics-header {
  margin-bottom: var(--text-3xl);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--text-3xl);
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-radius: var(--text-sm);

    .page-title {
      h1 {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-sm) 0;
        display: flex;
        align-items: center;
        gap: var(--text-sm);
      }

      p {
        font-size: var(--text-lg);
        color: var(--text-secondary);
        margin: 0;
      }
    }

    .header-actions {
      display: flex;
      gap: var(--text-sm);
    }
  }
}

.core-metrics {
  margin-bottom: var(--text-3xl);

  .metric-card {
    height: 100%;

    .metric-content {
      display: flex;
      align-items: center;
      gap: var(--text-lg);

      .metric-icon {
        width: 60px;
        height: 60px;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-3xl);

        &.total {
          background: #f0f9ff;
          color: var(--primary-color);
        }

        &.students {
          background: #f0fdf4;
          color: var(--success-color);
        }

        &.teachers {
          background: var(--bg-white)7ed;
          color: #f97316;
        }

        &.capacity {
          background: #fef3c7;
          color: #d97706;
        }
      }

      .metric-info {
        flex: 1;

        .metric-value {
          font-size: var(--text-3xl);
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1;
          margin-bottom: var(--spacing-xs);
        }

        .metric-label {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-sm);
        }

        .metric-detail {
          font-size: var(--text-sm);

          &.trend-high {
            color: var(--success-color);
          }

          &.trend-medium {
            color: #f97316;
          }

          &.trend-low {
            color: var(--danger-color);
          }
        }
      }
    }
  }
}

.charts-section {
  margin-bottom: var(--text-3xl);

  .chart-card {
    height: 100%;

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        font-size: var(--text-lg);
        font-weight: 500;
        color: var(--text-primary);
        margin: 0;
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }
    }
  }
}

.analysis-section {
  margin-bottom: var(--text-3xl);

  .analysis-card {
    .analysis-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        font-size: var(--text-lg);
        font-weight: 500;
        color: var(--text-primary);
        margin: 0;
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }
    }
  }
}

.class-list-card {
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      font-size: var(--text-lg);
      font-weight: 500;
      color: var(--text-primary);
      margin: 0;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }
  }

  .pagination-wrapper {
    margin-top: var(--text-3xl);
    display: flex;
    justify-content: center;
  }
}

.rate-high {
  color: var(--success-color);
  font-weight: 500;
}

.rate-medium {
  color: #f97316;
  font-weight: 500;
}

.rate-low {
  color: var(--danger-color);
  font-weight: 500;
}

@media (max-width: var(--breakpoint-md)) {
  .class-statistics-container {
    padding: var(--text-lg);
  }

  .statistics-header .header-content {
    flex-direction: column;
    gap: var(--text-lg);
    text-align: center;
  }

  .core-metrics {
    .el-col {
      margin-bottom: var(--text-lg);
    }
  }

  .charts-section {
    .el-col {
      margin-bottom: var(--text-lg);
    }
  }
}
</style>
