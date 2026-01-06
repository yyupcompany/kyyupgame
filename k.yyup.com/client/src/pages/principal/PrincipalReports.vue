<template>
  <div class="principal-reports-container">
    <!-- 页面头部 -->
    <div class="reports-header">
      <div class="header-content">
        <div class="page-title">
          <h1>园长报告</h1>
          <p>全面的园区运营分析报告和决策支持</p>
        </div>
        <div class="header-actions">
          <el-button @click="handleRefresh">
            <UnifiedIcon name="Refresh" />
            刷新数据
          </el-button>
          <el-button @click="handleExportReport">
            <UnifiedIcon name="Download" />
            导出报告
          </el-button>
          <el-button type="primary" @click="handleGenerateReport">
            <UnifiedIcon name="default" />
            生成报告
          </el-button>
        </div>
      </div>
    </div>

    <!-- 报告筛选器 -->
    <div class="report-filters">
      <el-card shadow="never">
        <el-form :model="filterForm" inline class="filter-form">
          <el-form-item label="报告类型">
            <el-select v-model="filterForm.reportType" placeholder="选择报告类型" @change="handleFilterChange">
              <el-option label="综合运营报告" value="comprehensive" />
              <el-option label="财务分析报告" value="financial" />
              <el-option label="招生分析报告" value="enrollment" />
              <el-option label="教学质量报告" value="teaching" />
              <el-option label="员工绩效报告" value="performance" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleFilterChange"
            />
          </el-form-item>
          
          <el-form-item label="园区">
            <el-select v-model="filterForm.campus" placeholder="选择园区" @change="handleFilterChange">
              <el-option label="总园区" value="main" />
              <el-option label="分园区A" value="branch_a" />
              <el-option label="分园区B" value="branch_b" />
              <el-option label="全部园区" value="all" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button @click="handleResetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 报告概览 -->
    <div class="report-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-content">
              <div class="overview-icon comprehensive">
                <UnifiedIcon name="default" />
              </div>
              <div class="overview-info">
                <div class="overview-value">{{ reportStats.totalReports }}</div>
                <div class="overview-label">总报告数</div>
                <div class="overview-trend positive">
                  <UnifiedIcon name="default" />
                  +12.5%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-content">
              <div class="overview-icon financial">
                <UnifiedIcon name="default" />
              </div>
              <div class="overview-info">
                <div class="overview-value">{{ reportStats.monthlyRevenue }}</div>
                <div class="overview-label">月度营收</div>
                <div class="overview-trend positive">
                  <UnifiedIcon name="default" />
                  +8.3%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-content">
              <div class="overview-icon enrollment">
                <UnifiedIcon name="default" />
              </div>
              <div class="overview-info">
                <div class="overview-value">{{ reportStats.enrollmentRate }}</div>
                <div class="overview-label">招生完成率</div>
                <div class="overview-trend positive">
                  <UnifiedIcon name="default" />
                  +15.2%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-content">
              <div class="overview-icon satisfaction">
                <UnifiedIcon name="default" />
              </div>
              <div class="overview-info">
                <div class="overview-value">{{ reportStats.satisfaction }}</div>
                <div class="overview-label">家长满意度</div>
                <div class="overview-trend positive">
                  <UnifiedIcon name="default" />
                  +3.7%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 报告列表 -->
    <div class="reports-list">
      <el-card shadow="never">
        <template #header>
          <div class="section-header">
            <span>报告列表</span>
            <div class="header-controls">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索报告..."
                style="max-width: 200px; width: 100%"
                @input="handleSearch"
              >
                <template #prefix>
                  <UnifiedIcon name="Search" />
                </template>
              </el-input>
            </div>
          </div>
        </template>
        
        <div class="table-wrapper">
<el-table class="responsive-table"
          :data="filteredReports"
          stripe
          v-loading="loading"
        >
          <el-table-column prop="title" label="报告标题" min-width="200" />
          
          <el-table-column label="报告类型" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="getReportTypeTagType(row.type)" size="small">
                {{ getReportTypeText(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="period" label="报告周期" width="120" />
          <el-table-column prop="campus" label="园区" width="100" />
          
          <el-table-column label="生成状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="生成时间" width="150">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
          
          <el-table-column label="文件大小" width="100" align="center">
            <template #default="{ row }">
              {{ formatFileSize(row.fileSize) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="text" size="small" @click="handleViewReport(row)">
                查看
              </el-button>
              <el-button type="text" size="small" @click="handleDownloadReport(row)">
                下载
              </el-button>
              <el-button type="text" size="small" @click="handleShareReport(row)">
                分享
              </el-button>
              <el-dropdown @command="(command) => handleMoreAction(command, row)">
                <el-button type="text" size="small">
                  更多<UnifiedIcon name="ArrowDown" />
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="duplicate">复制报告</el-dropdown-item>
                    <el-dropdown-item command="schedule">定时生成</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
</div>
        
        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :total="totalReports"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 报告详情对话框 -->
    <el-dialog
      v-model="reportDetailVisible"
      title="报告详情"
      width="80%"
      :before-close="handleCloseDetail"
    >
      <div v-if="selectedReport" class="report-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="报告标题" :span="2">
            {{ selectedReport.title }}
          </el-descriptions-item>
          <el-descriptions-item label="报告类型">
            {{ getReportTypeText(selectedReport.type) }}
          </el-descriptions-item>
          <el-descriptions-item label="报告周期">
            {{ selectedReport.period }}
          </el-descriptions-item>
          <el-descriptions-item label="园区">
            {{ selectedReport.campus }}
          </el-descriptions-item>
          <el-descriptions-item label="生成状态">
            <el-tag :type="getStatusTagType(selectedReport.status)" size="small">
              {{ getStatusText(selectedReport.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="生成时间">
            {{ formatDateTime(selectedReport.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="文件大小">
            {{ formatFileSize(selectedReport.fileSize) }}
          </el-descriptions-item>
          <el-descriptions-item label="报告摘要" :span="2">
            {{ selectedReport.summary }}
          </el-descriptions-item>
        </el-descriptions>
        
        <!-- 报告内容预览 -->
        <div class="report-preview">
          <h4>报告内容预览</h4>
          <div class="preview-content">
            <el-alert
              title="报告摘要"
              type="info"
              :closable="false"
              show-icon
            >
              <template #default>
                <div class="report-summary">
                  <p><strong>关键指标：</strong></p>
                  <ul>
                    <li>本期招生完成率：{{ selectedReport.keyMetrics?.enrollmentRate || '95.2%' }}</li>
                    <li>财务收入增长：{{ selectedReport.keyMetrics?.revenueGrowth || '+12.5%' }}</li>
                    <li>家长满意度：{{ selectedReport.keyMetrics?.satisfaction || '4.8/5.0' }}</li>
                    <li>教师绩效评分：{{ selectedReport.keyMetrics?.teacherPerformance || '92.3分' }}</li>
                  </ul>
                </div>
              </template>
            </el-alert>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="reportDetailVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleDownloadReport(selectedReport)">
          下载报告
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh, Download, DocumentAdd, DataBoard, Money, User, Star,
  TrendCharts, Search, ArrowDown
} from '@element-plus/icons-vue'
import { formatDateTime } from '@/utils/date'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const reportDetailVisible = ref(false)
const selectedReport = ref(null)

// 筛选表单
const filterForm = reactive({
  reportType: '',
  dateRange: [],
  campus: ''
})

// 报告统计
const reportStats = reactive({
  totalReports: 156,
  monthlyRevenue: '¥2,456,789',
  enrollmentRate: '95.2%',
  satisfaction: '4.8/5.0'
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 20
})

// 模拟报告数据
const reports = ref([
  {
    id: '1',
    title: '2024年第一季度综合运营报告',
    type: 'comprehensive',
    period: '2024Q1',
    campus: '总园区',
    status: 'completed',
    createdAt: '2024-04-01T09:00:00Z',
    fileSize: 2048576,
    summary: '本季度园区运营整体表现良好，招生目标完成率达95.2%，财务收入同比增长12.5%。',
    keyMetrics: {
      enrollmentRate: '95.2%',
      revenueGrowth: '+12.5%',
      satisfaction: '4.8/5.0',
      teacherPerformance: '92.3分'
    }
  },
  {
    id: '2',
    title: '3月份财务分析报告',
    type: 'financial',
    period: '2024年3月',
    campus: '全部园区',
    status: 'completed',
    createdAt: '2024-04-02T14:30:00Z',
    fileSize: 1536000,
    summary: '3月份财务状况稳定，收入结构优化，成本控制良好。',
    keyMetrics: {
      enrollmentRate: '93.8%',
      revenueGrowth: '+8.7%',
      satisfaction: '4.7/5.0',
      teacherPerformance: '91.5分'
    }
  },
  {
    id: '3',
    title: '春季招生分析报告',
    type: 'enrollment',
    period: '2024年春季',
    campus: '分园区A',
    status: 'generating',
    createdAt: '2024-04-03T10:15:00Z',
    fileSize: 0,
    summary: '春季招生活动效果分析，包含渠道效果、转化率等关键指标。',
    keyMetrics: {
      enrollmentRate: '97.1%',
      revenueGrowth: '+15.3%',
      satisfaction: '4.9/5.0',
      teacherPerformance: '93.7分'
    }
  }
])

// 计算属性
const filteredReports = computed(() => {
  let filtered = reports.value
  
  if (searchKeyword.value) {
    filtered = filtered.filter(report => 
      report.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  if (filterForm.reportType) {
    filtered = filtered.filter(report => report.type === filterForm.reportType)
  }
  
  if (filterForm.campus) {
    filtered = filtered.filter(report => 
      filterForm.campus === 'all' || report.campus.includes(filterForm.campus)
    )
  }
  
  return filtered
})

const totalReports = computed(() => filteredReports.value.length)

// 方法
const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('数据已刷新')
  }, 1000)
}

const handleExportReport = () => {
  ElMessage.info('导出功能开发中')
}

const handleGenerateReport = () => {
  router.push('/analytics/report-builder')
}

const handleFilterChange = () => {
  pagination.currentPage = 1
}

const handleResetFilter = () => {
  Object.assign(filterForm, {
    reportType: '',
    dateRange: [],
    campus: ''
  })
  searchKeyword.value = ''
}

const handleSearch = () => {
  pagination.currentPage = 1
}

const handleViewReport = (report: any) => {
  selectedReport.value = report
  reportDetailVisible.value = true
}

const handleDownloadReport = (report: any) => {
  ElMessage.success(`正在下载报告：${report.title}`)
}

const handleShareReport = (report: any) => {
  ElMessage.info('分享功能开发中')
}

const handleMoreAction = (command: string, report: any) => {
  switch (command) {
    case 'duplicate':
      ElMessage.info('复制报告功能开发中')
      break
    case 'schedule':
      ElMessage.info('定时生成功能开发中')
      break
    case 'delete':
      handleDeleteReport(report)
      break
  }
}

const handleDeleteReport = async (report: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个报告吗？', '删除确认', {
      type: 'warning'
    })
    ElMessage.success('报告已删除')
  } catch {
    // 用户取消
  }
}

const handleCloseDetail = () => {
  reportDetailVisible.value = false
  selectedReport.value = null
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
}

// 工具方法
const getReportTypeText = (type: string) => {
  const typeMap = {
    'comprehensive': '综合运营',
    'financial': '财务分析',
    'enrollment': '招生分析',
    'teaching': '教学质量',
    'performance': '员工绩效'
  }
  return typeMap[type] || '未知'
}

const getReportTypeTagType = (type: string) => {
  const typeMap = {
    'comprehensive': 'primary',
    'financial': 'success',
    'enrollment': 'warning',
    'teaching': 'info',
    'performance': 'danger'
  }
  return typeMap[type] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap = {
    'completed': '已完成',
    'generating': '生成中',
    'failed': '生成失败',
    'pending': '待生成'
  }
  return statusMap[status] || '未知'
}

const getStatusTagType = (status: string) => {
  const typeMap = {
    'completed': 'success',
    'generating': 'warning',
    'failed': 'danger',
    'pending': 'info'
  }
  return typeMap[status] || 'info'
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss">
.principal-reports-container {
  padding: var(--text-2xl);
  max-width: 100%; max-width: 1400px;
  margin: 0 auto;
}

.reports-header {
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

.report-filters {
  margin-bottom: var(--text-3xl);
  
  .filter-form {
    .el-form-item {
      margin-bottom: 0;
    }
  }
}

.report-overview {
  margin-bottom: var(--text-3xl);
  
  .overview-card {
    height: 100%;
    
    .overview-content {
      display: flex;
      align-items: center;
      gap: var(--text-lg);
      
      .overview-icon {
        width: auto;
        min-height: 60px; height: auto;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-3xl);
        
        &.comprehensive {
          background: #f0f9ff;
          color: var(--primary-color);
        }
        
        &.financial {
          background: #f0fdf4;
          color: var(--success-color);
        }
        
        &.enrollment {
          background: var(--bg-white)7ed;
          color: #f97316;
        }
        
        &.satisfaction {
          background: #fef3c7;
          color: #d97706;
        }
      }
      
      .overview-info {
        flex: 1;
        
        .overview-value {
          font-size: var(--text-3xl);
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1;
          margin-bottom: var(--spacing-xs);
        }
        
        .overview-label {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-sm);
        }
        
        .overview-trend {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--text-sm);
          font-weight: 500;
          
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
}

.reports-list {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .pagination-wrapper {
    margin-top: var(--text-3xl);
    display: flex;
    justify-content: center;
  }
}

.report-detail {
  .report-preview {
    margin-top: var(--text-3xl);
    
    h4 {
      font-size: var(--text-lg);
      font-weight: 500;
      color: var(--text-primary);
      margin: 0 0 var(--text-lg) 0;
    }
    
    .report-summary {
      ul {
        margin: var(--spacing-sm) 0 0 0;
        padding-left: var(--text-2xl);
        
        li {
          margin-bottom: var(--spacing-xs);
          color: var(--color-gray-700);
        }
      }
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .principal-reports-container {
    padding: var(--text-lg);
  }
  
  .reports-header .header-content {
    flex-direction: column;
    gap: var(--text-lg);
    text-align: center;
  }
  
  .filter-form {
    .el-form-item {
      display: block;
      margin-bottom: var(--text-lg);
    }
  }
  
  .report-overview {
    .el-col {
      margin-bottom: var(--text-lg);
    }
  }
}
</style>
