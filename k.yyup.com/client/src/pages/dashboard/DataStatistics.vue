<template>
  <div class="dashboard-container">
    <!-- 页面头部 -->
    <div class="dashboard-page-header">
      <h1 class="page-title">数据统计</h1>
      <div class="page-actions">
        <el-button type="primary" @click="handleRefresh">
          <UnifiedIcon name="Refresh" />
          刷新数据
        </el-button>
        <el-button type="success" @click="handleExport">
          <UnifiedIcon name="Download" />
          导出报告
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="dashboard-data-section">
      <div class="data-header">
        <h3 class="data-title">数据概览</h3>
      </div>
      <div class="data-content">
        <el-row :gutter="20">
          <el-col :span="6" v-for="(card, index) in statCards" :key="index">
            <div class="stat-card">
              <div class="stat-icon">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ card.value }}</div>
                <div class="stat-label">{{ card.label }}</div>
                <div class="stat-trend" :class="{ positive: card.trend > 0, negative: card.trend < 0 }">
                  <UnifiedIcon name="default" />
                  {{ card.trend > 0 ? '+' : '' }}{{ card.trend }}%
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="dashboard-data-section">
      <div class="data-header">
        <h3 class="data-title">趋势分析</h3>
      </div>
      <div class="data-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="chart-container">
              <div ref="enrollmentChartRef" style="width: 100%; min-height: 60px; height: auto;"></div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-container">
              <div ref="activityChartRef" style="width: 100%; min-height: 60px; height: auto;"></div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="dashboard-data-section">
      <div class="data-header">
        <h3 class="data-title">详细数据</h3>
      </div>
      <div class="data-content">
        <div class="table-wrapper">
<el-table class="responsive-table" :data="tableData" v-loading="loading.table" style="width: 100%">
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="category" label="类别" width="120" />
          <el-table-column prop="value" label="数值" width="100" />
          <el-table-column prop="growth" label="增长率" width="100" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'normal' ? 'success' : 'warning'">
                {{ scope.row.status === 'normal' ? '正常' : '警告' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
</div>
        
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          style="margin-top: var(--text-2xl); text-align: right;"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download, TrendCharts, User } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { get } from '@/utils/request'
import {
  getPrimaryColor,
  getSuccessColor,
  getWarningColor,
  getDangerColor
} from '@/utils/color-tokens'

// 响应式数据
const loading = reactive({
  stats: false,
  charts: false,
  table: false
})

const statCards = ref([
  { label: '学生总数', value: '1250', trend: 12.5, color: getPrimaryColor(), icon: User },
  { label: '活动总数', value: '156', trend: 15.7, color: getSuccessColor(), icon: User },
  { label: '教师总数', value: '85', trend: 3.2, color: getWarningColor(), icon: User },
  { label: '班级总数', value: '42', trend: 8.1, color: getDangerColor(), icon: User }
])

const tableData = ref([])
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 图表引用
const enrollmentChartRef = ref()
const activityChartRef = ref()
let enrollmentChartInstance: echarts.ECharts | null = null
let activityChartInstance: echarts.ECharts | null = null

// 方法
const handleRefresh = async () => {
  await loadStats()
  await loadCharts()
  await loadTableData()
  ElMessage.success('数据刷新成功')
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  loadTableData()
}

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  loadTableData()
}

const loadStats = async () => {
  loading.stats = true
  try {
    const response = await get('/dashboard/data-statistics')
    if (response.success && response.data?.stats) {
      const stats = response.data.stats
      statCards.value[0].value = stats.totalStudents?.toString() || '1250'
      statCards.value[1].value = stats.totalActivities?.toString() || '156'
      statCards.value[2].value = stats.totalTeachers?.toString() || '85'
      statCards.value[3].value = stats.totalClasses?.toString() || '42'
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  } finally {
    loading.stats = false
  }
}

const loadCharts = async () => {
  loading.charts = true
  try {
    await nextTick()
    
    // 招生趋势图表
    if (enrollmentChartRef.value) {
      if (enrollmentChartInstance) {
        enrollmentChartInstance.dispose()
      }
      enrollmentChartInstance = echarts.init(enrollmentChartRef.value)
      
      const enrollmentOption = {
        title: { text: '招生趋势', left: 'center' },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: { type: 'value', name: '招生人数' },
        series: [{
          name: '招生人数',
          type: 'line',
          data: [20, 25, 30, 28, 35, 40],
          smooth: true,
          areaStyle: { opacity: 0.3 },
          itemStyle: { color: getPrimaryColor() }
        }]
      }
      enrollmentChartInstance.setOption(enrollmentOption)
    }

    // 活动参与度图表
    if (activityChartRef.value) {
      if (activityChartInstance) {
        activityChartInstance.dispose()
      }
      activityChartInstance = echarts.init(activityChartRef.value)

      const activityOption = {
        title: { text: '活动参与度', left: 'center' },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['体育活动', '艺术活动', '科学实验', '社会实践']
        },
        yAxis: { type: 'value', name: '参与人数' },
        series: [{
          name: '参与人数',
          type: 'bar',
          data: [80, 90, 70, 60],
          itemStyle: { color: getSuccessColor() }
        }]
      }
      activityChartInstance.setOption(activityOption)
    }
  } catch (error) {
    console.error('加载图表失败:', error)
  } finally {
    loading.charts = false
  }
}

const loadTableData = async () => {
  loading.table = true
  try {
    // 生成模拟数据
    const categories = ['招生数据', '活动数据', '教师数据', '学生数据', '家长数据']
    const data = []
    
    for (let i = 0; i < pagination.pageSize; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      data.push({
        id: i + 1,
        date: date.toISOString().split('T')[0],
        category: categories[Math.floor(Math.random() * categories.length)],
        value: Math.floor(Math.random() * 100) + 10,
        growth: (Math.random() * 20 - 10).toFixed(1) + '%',
        status: Math.random() > 0.2 ? 'normal' : 'warning'
      })
    }
    
    tableData.value = data
    pagination.total = 100
  } catch (error) {
    console.error('加载表格数据失败:', error)
  } finally {
    loading.table = false
  }
}

// 生命周期
onMounted(async () => {
  await loadStats()
  await loadCharts()
  await loadTableData()
})
</script>

<style scoped>
.dashboard-container {
  padding: var(--text-2xl);
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  min-height: 100vh;
}

.dashboard-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
  padding: var(--text-2xl);
  background: var(--white-alpha-10);
  backdrop-filter: blur(10px);
  border-radius: var(--text-sm);
  border: var(--border-width-base) solid var(--glass-bg-heavy);
}

.page-title {
  color: white;
  font-size: var(--text-3xl);
  font-weight: 600;
  margin: 0;
}

.page-actions {
  display: flex;
  gap: var(--text-sm);
}

.dashboard-data-section {
  margin-bottom: var(--text-2xl);
  background: var(--white-alpha-10);
  backdrop-filter: blur(10px);
  border-radius: var(--text-sm);
  border: var(--border-width-base) solid var(--glass-bg-heavy);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.data-header {
  padding: var(--text-lg) var(--text-2xl);
  background: var(--white-alpha-10);
  border-bottom: var(--z-index-dropdown) solid var(--white-alpha-10);
}

.data-title {
  color: white;
  font-size: var(--text-xl);
  font-weight: 600;
  margin: 0;
}

.data-content {
  padding: var(--text-2xl);
}

.stat-card {
  display: flex;
  align-items: center;
  padding: var(--text-2xl);
  background: var(--white-alpha-10);
  backdrop-filter: blur(10px);
  border-radius: var(--text-sm);
  border: var(--border-width-base) solid var(--glass-bg-heavy);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(var(--transform-hover-lift));
  box-shadow: 0 var(--spacing-sm) 25px var(--shadow-medium);
}

.stat-icon {
  margin-right: var(--text-lg);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: white;
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--text-base);
  color: var(--white-alpha-80);
  margin-bottom: var(--spacing-sm);
}

.stat-trend {
  display: flex;
  align-items: center;
  font-size: var(--text-sm);
  font-weight: 600;
}

.stat-trend.positive {
  color: var(--success-color);
}

.stat-trend.negative {
  color: var(--danger-color);
}

.chart-container {
  background: var(--white-alpha-10);
  backdrop-filter: blur(10px);
  border-radius: var(--text-sm);
  border: var(--border-width-base) solid var(--glass-bg-heavy);
  padding: var(--text-2xl);
}
</style>
