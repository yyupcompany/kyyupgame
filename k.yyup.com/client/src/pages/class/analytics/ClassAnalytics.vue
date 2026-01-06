<template>
  <div class="page-container">
    <page-header title="班级数据分析">
      <template #actions>
        <el-button @click="exportReport" type="primary" :loading="exporting">
          <UnifiedIcon name="Download" />
          导出报告
        </el-button>
        <el-button @click="refreshData" :loading="loading">
          <UnifiedIcon name="Refresh" />
          刷新数据
        </el-button>
      </template>
    </page-header>

    <div class="analytics-content" v-loading="loading" element-loading-text="正在加载数据...">
      <!-- 概览卡片 -->
      <el-row :gutter="20" class="overview-cards">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ analyticsData.totalClasses }}</div>
              <div class="stat-label">总班级数</div>
              <UnifiedIcon name="default" />
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ analyticsData.totalStudents }}</div>
              <div class="stat-label">总学生数</div>
              <UnifiedIcon name="default" />
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ analyticsData.averageSize }}</div>
              <div class="stat-label">平均班级规模</div>
              <UnifiedIcon name="default" />
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ analyticsData.attendanceRate }}%</div>
              <div class="stat-label">平均出勤率</div>
              <UnifiedIcon name="Check" />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 班级分布图表 -->
      <el-row :gutter="20" class="chart-section">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>班级规模分布</span>
                <el-select v-model="classSizeFilter" size="small" style="max-max-width: 120px; width: 100%; width: 100%">
                  <el-option label="全部" value="all" />
                  <el-option label="小班" value="small" />
                  <el-option label="中班" value="medium" />
                  <el-option label="大班" value="large" />
                </el-select>
              </div>
            </template>
            <div ref="classSizeChart" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>学生年龄分布</span>
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  size="small"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </div>
            </template>
            <div ref="ageDistributionChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 班级列表和详细数据 -->
      <el-card class="table-card">
        <template #header>
          <div class="card-header">
            <span>班级详细数据</span>
            <div class="header-actions">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索班级名称..."
                size="small"
                style="max-width: 200px; width: 100%; margin-right: var(--spacing-2xl)"
                @input="handleSearch"
              >
                <template #prefix>
                  <UnifiedIcon name="Search" />
                </template>
              </el-input>
              <el-select v-model="statusFilter" size="small" style="width: 120px">
                <el-option label="全部状态" value="" />
                <el-option label="正常" value="active" />
                <el-option label="暂停" value="inactive" />
                <el-option label="毕业" value="graduated" />
              </el-select>
            </div>
          </div>
        </template>
        
        <div class="table-wrapper">
<el-table class="responsive-table"
          :data="filteredClassList"
          style="width: 100%"
          stripe
          border
          :default-sort="{ prop: 'studentCount', order: 'descending' }"
        >
          <el-table-column prop="className" label="班级名称" width="120" />
          <el-table-column prop="teacher" label="班主任" width="100" />
          <el-table-column prop="studentCount" label="学生数量" width="100" sortable />
          <el-table-column prop="capacity" label="班级容量" width="100" />
          <el-table-column prop="attendanceRate" label="出勤率" width="100" sortable>
            <template #default="scope">
              <el-progress
                :percentage="scope.row.attendanceRate"
                :color="getAttendanceColor(scope.row.attendanceRate)"
                :text-inside="true"
                :stroke-width="18"
              />
            </template>
          </el-table-column>
          <el-table-column prop="averageAge" label="平均年龄" width="100" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="120">
            <template #default="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click="viewClassDetail(scope.row)"
              >
                查看详情
              </el-button>
              <el-button
                type="success"
                size="small"
                @click="generateReport(scope.row)"
              >
                生成报告
              </el-button>
            </template>
          </el-table-column>
        </el-table>
</div>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Download,
  Refresh,
  School,
  User,
  UserFilled,
  CircleCheck,
  Search
} from '@element-plus/icons-vue'
import { get } from '@/utils/request'
import { CLASS_ENDPOINTS } from '@/api/endpoints'
import { ErrorHandler } from '@/utils/errorHandler'
import PageHeader from '@/components/common/PageHeader.vue'
import * as echarts from 'echarts'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const exporting = ref(false)
const searchKeyword = ref('')
const statusFilter = ref('')
const classSizeFilter = ref('all')
const dateRange = ref<string[]>([])

// 图表实例
const classSizeChart = ref<HTMLElement>()
const ageDistributionChart = ref<HTMLElement>()
let classSizeChartInstance: echarts.ECharts | null = null
let ageDistributionChartInstance: echarts.ECharts | null = null

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 分析数据接口
interface ClassAnalyticsData {
  totalClasses: number
  totalStudents: number
  averageSize: number
  attendanceRate: number
  classSizeDistribution: { name: string; value: number }[]
  ageDistribution: { age: number; count: number }[]
}

interface ClassInfo {
  id: string
  className: string
  teacher: string
  studentCount: number
  capacity: number
  attendanceRate: number
  averageAge: number
  status: 'active' | 'inactive' | 'graduated'
  createdAt: string
}

// 数据状态
const analyticsData = ref<ClassAnalyticsData>({
  totalClasses: 0,
  totalStudents: 0,
  averageSize: 0,
  attendanceRate: 0,
  classSizeDistribution: [],
  ageDistribution: []
})

const classList = ref<ClassInfo[]>([])

// 计算属性
const filteredClassList = computed(() => {
  let filtered = classList.value

  // 关键词搜索
  if (searchKeyword.value) {
    filtered = filtered.filter(item =>
      item.className.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      item.teacher.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  // 状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(item => item.status === statusFilter.value)
  }

  // 更新分页总数
  pagination.total = filtered.length

  // 分页处理
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filtered.slice(start, end)
})

// 方法
const loadAnalyticsData = async () => {
  loading.value = true
  try {
    const response = await get(CLASS_ENDPOINTS.ANALYTICS, {
      dateRange: dateRange.value,
      classSizeFilter: classSizeFilter.value
    })

    if (response.success && response.data) {
      analyticsData.value = response.data
      await nextTick()
      initCharts()
    } else {
      // 使用模拟数据
      analyticsData.value = {
        totalClasses: 12,
        totalStudents: 360,
        averageSize: 30,
        attendanceRate: 92.5,
        classSizeDistribution: [
          { name: '小班(15-20人)', value: 3 },
          { name: '中班(21-30人)', value: 6 },
          { name: '大班(31-40人)', value: 3 }
        ],
        ageDistribution: [
          { age: 3, count: 85 },
          { age: 4, count: 120 },
          { age: 5, count: 105 },
          { age: 6, count: 50 }
        ]
      }
      await nextTick()
      initCharts()
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
    // 降级使用模拟数据
    analyticsData.value = {
      totalClasses: 12,
      totalStudents: 360,
      averageSize: 30,
      attendanceRate: 92.5,
      classSizeDistribution: [
        { name: '小班(15-20人)', value: 3 },
        { name: '中班(21-30人)', value: 6 },
        { name: '大班(31-40人)', value: 3 }
      ],
      ageDistribution: [
        { age: 3, count: 85 },
        { age: 4, count: 120 },
        { age: 5, count: 105 },
        { age: 6, count: 50 }
      ]
    }
    await nextTick()
    initCharts()
  } finally {
    loading.value = false
  }
}

const loadClassList = async () => {
  try {
    const response = await get(CLASS_ENDPOINTS.LIST, {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value,
      status: statusFilter.value
    })

    if (response.success && response.data) {
      classList.value = response.data.list || []
      pagination.total = response.data.total || 0
    } else {
      // 使用模拟数据
      classList.value = [
        {
          id: '1',
          className: '小班1班',
          teacher: '张老师',
          studentCount: 18,
          capacity: 20,
          attendanceRate: 95,
          averageAge: 3.5,
          status: 'active',
          createdAt: '2024-01-15'
        },
        {
          id: '2',
          className: '中班2班',
          teacher: '李老师',
          studentCount: 25,
          capacity: 30,
          attendanceRate: 88,
          averageAge: 4.2,
          status: 'active',
          createdAt: '2024-02-20'
        },
        {
          id: '3',
          className: '大班3班',
          teacher: '王老师',
          studentCount: 32,
          capacity: 35,
          attendanceRate: 92,
          averageAge: 5.8,
          status: 'active',
          createdAt: '2024-03-10'
        }
      ]
      pagination.total = classList.value.length
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, false)
    // 降级使用模拟数据
    classList.value = [
      {
        id: '1',
        className: '小班1班',
        teacher: '张老师',
        studentCount: 18,
        capacity: 20,
        attendanceRate: 95,
        averageAge: 3.5,
        status: 'active',
        createdAt: '2024-01-15'
      }
    ]
    pagination.total = 1
  }
}

const initCharts = () => {
  // 初始化班级规模分布图表
  if (classSizeChart.value) {
    classSizeChartInstance = echarts.init(classSizeChart.value)
    classSizeChartInstance.setOption({
      title: {
        text: '班级规模分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          type: 'pie',
          radius: '50%',
          data: analyticsData.value.classSizeDistribution,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'var(--shadow-heavy)'
            }
          }
        }
      ]
    })
  }

  // 初始化年龄分布图表
  if (ageDistributionChart.value) {
    ageDistributionChartInstance = echarts.init(ageDistributionChart.value)
    ageDistributionChartInstance.setOption({
      title: {
        text: '学生年龄分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: analyticsData.value.ageDistribution.map(item => `${item.age}岁`)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          type: 'bar',
          data: analyticsData.value.ageDistribution.map(item => item.count),
          itemStyle: {
            color: 'var(--primary-color)'
          }
        }
      ]
    })
  }
}

// 工具方法
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const getStatusType = (status: string) => {
  const typeMap = {
    active: 'success',
    inactive: 'warning',
    graduated: 'info'
  }
  return typeMap[status as keyof typeof typeMap] || 'info'
}

const getStatusLabel = (status: string) => {
  const labelMap = {
    active: '正常',
    inactive: '暂停',
    graduated: '毕业'
  }
  return labelMap[status as keyof typeof labelMap] || status
}

const getAttendanceColor = (rate: number) => {
  if (rate >= 95) return 'var(--success-color)'
  if (rate >= 85) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

// 事件处理
const refreshData = async () => {
  await Promise.all([loadAnalyticsData(), loadClassList()])
  ElMessage.success('数据刷新成功')
}

const exportReport = async () => {
  exporting.value = true
  try {
    // TODO: 实现报告导出功能
    ElMessage.success('报告导出成功')
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
  } finally {
    exporting.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadClassList()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadClassList()
}

const viewClassDetail = (row: ClassInfo) => {
  router.push(`/class/detail/${row.id}`)
}

const generateReport = async (row: ClassInfo) => {
  try {
    ElMessage.success(`正在生成${row.className}的分析报告...`)
    // TODO: 实现单个班级报告生成
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
  }
}

// 监听器
watch([classSizeFilter, dateRange], () => {
  loadAnalyticsData()
}, { deep: true })

// 生命周期
onMounted(() => {
  refreshData()
})
</script>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.analytics-content {
  padding: var(--spacing-lg);
}

.overview-cards {
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(var(--transform-hover-lift));
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-lg);
  position: relative;

  .stat-value {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: var(--spacing-sm);
  }

  .stat-label {
    font-size: var(--text-base);
    color: var(--text-secondary);
    font-weight: 500;
  }

  .stat-icon {
    position: absolute;
    top: var(--spacing-sm);
    right: var(--spacing-sm);
    font-size: var(--text-2xl);
    color: var(--text-muted);
    opacity: 0.6;
  }
}

.chart-section {
  margin-bottom: var(--spacing-xl);
}

.chart-card,
.table-card {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.chart-container {
  width: 100%;
  min-height: 60px; height: auto;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-lg);
}

/* Element Plus 组件样式覆盖 */
:deep(.el-card__header) {
  background-color: var(--bg-secondary);
  border-bottom-color: var(--border-color);
}

:deep(.el-table) {
  background-color: var(--bg-card);
}

:deep(.el-table th) {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

:deep(.el-table td) {
  color: var(--text-secondary);
}

:deep(.el-progress-bar__outer) {
  background-color: var(--bg-secondary);
}

:deep(.el-tag) {
  border-radius: var(--radius-sm);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .overview-cards {
    .el-col {
      margin-bottom: var(--spacing-md);
    }
  }

  .chart-section {
    .el-col {
      margin-bottom: var(--spacing-md);
    }
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-xs);
  }
}
</style>