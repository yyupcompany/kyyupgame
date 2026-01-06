<template>
  <div class="financial-reports-page">
    <div class="page-header">
      <h1>财务报表</h1>
      <p>生成和管理各类财务报表</p>
    </div>

    <!-- 快速统计 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card>
          <el-statistic title="本月收入" :value="formatMoney(stats.monthlyRevenue)">
            <template #prefix>¥</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="本月支出" :value="formatMoney(stats.monthlyExpense)">
            <template #prefix>¥</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="本月利润" :value="formatMoney(stats.monthlyProfit)">
            <template #prefix>¥</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="收费完成率" :value="stats.collectionRate">
            <template #suffix>%</template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 报表生成 -->
    <el-card class="generate-card">
      <template #header>
        <span>生成新报表</span>
      </template>

      <el-form :model="generateForm" :inline="true">
        <el-form-item label="报表类型">
          <el-select v-model="generateForm.type" placeholder="选择报表类型" style="max-width: 200px; width: 100%">
            <el-option label="收入报表" value="revenue" />
            <el-option label="支出报表" value="expense" />
            <el-option label="利润报表" value="profit" />
            <el-option label="缴费统计" value="payment" />
            <el-option label="逾期分析" value="overdue" />
            <el-option label="退费统计" value="refund" />
            <el-option label="综合报表" value="comprehensive" />
          </el-select>
        </el-form-item>
        <el-form-item label="统计周期">
          <el-select v-model="generateForm.period" placeholder="选择周期" style="max-width: 150px; width: 100%">
            <el-option label="本日" value="today" />
            <el-option label="本周" value="week" />
            <el-option label="本月" value="month" />
            <el-option label="本季度" value="quarter" />
            <el-option label="本年" value="year" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="generateForm.period === 'custom'" label="时间范围">
          <el-date-picker
            v-model="generateForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleGenerate" :loading="generating">
            <UnifiedIcon name="default" />
            生成报表
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 报表列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>报表列表</span>
          <el-button @click="loadReports">
            <UnifiedIcon name="Refresh" />
            刷新
          </el-button>
        </div>
      </template>

      <div class="table-wrapper">
<el-table class="responsive-table"
        v-loading="loading"
        :data="reports"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="报表名称" min-width="200" />
        <el-table-column prop="type" label="报表类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ getReportTypeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="period" label="统计周期" width="150">
          <template #default="{ row }">
            {{ formatPeriod(row.startDate, row.endDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="生成时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" width="120" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleView(row)"
            >
              查看
            </el-button>
            <el-button
              type="success"
              size="small"
              @click="handleExport(row, 'excel')"
            >
              导出Excel
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="handleExport(row, 'pdf')"
            >
              导出PDF
            </el-button>
          </template>
        </el-table-column>
      </el-table>
</div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 报表详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="currentReport.name"
      width="1000px"
      top="5vh"
    >
      <div class="report-detail">
        <!-- 报表基本信息 -->
        <el-descriptions :column="3" border>
          <el-descriptions-item label="报表类型">{{ getReportTypeLabel(currentReport.type) }}</el-descriptions-item>
          <el-descriptions-item label="统计周期">{{ formatPeriod(currentReport.startDate, currentReport.endDate) }}</el-descriptions-item>
          <el-descriptions-item label="生成时间">{{ formatDate(currentReport.createTime) }}</el-descriptions-item>
        </el-descriptions>

        <!-- 报表数据 -->
        <div class="report-content" v-if="currentReport.data">
          <!-- 收入报表 -->
          <div v-if="currentReport.type === 'revenue'" class="revenue-report">
            <h3>收入明细</h3>
            <el-table class="responsive-table" :data="currentReport.data.items" border>
              <el-table-column prop="date" label="日期" width="120" />
              <el-table-column prop="feeItem" label="收费项目" />
              <el-table-column prop="amount" label="金额">
                <template #default="{ row }">
                  ¥{{ formatMoney(row.amount) }}
                </template>
              </el-table-column>
              <el-table-column prop="count" label="笔数" width="100" />
            </el-table>
            <div class="report-summary">
              <p>总收入: ¥{{ formatMoney(currentReport.data.totalRevenue) }}</p>
              <p>总笔数: {{ currentReport.data.totalCount }}</p>
            </div>
          </div>

          <!-- 缴费统计 -->
          <div v-if="currentReport.type === 'payment'" class="payment-report">
            <h3>缴费统计</h3>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-statistic title="总缴费单" :value="currentReport.data.totalBills" />
              </el-col>
              <el-col :span="8">
                <el-statistic title="已缴费" :value="currentReport.data.paidBills" />
              </el-col>
              <el-col :span="8">
                <el-statistic title="缴费率" :value="currentReport.data.paymentRate" suffix="%" />
              </el-col>
            </el-row>
          </div>

          <!-- 逾期分析 -->
          <div v-if="currentReport.type === 'overdue'" class="overdue-report">
            <h3>逾期分析</h3>
            <el-table class="responsive-table" :data="currentReport.data.items" border>
              <el-table-column prop="className" label="班级" />
              <el-table-column prop="overdueCount" label="逾期笔数" />
              <el-table-column prop="overdueAmount" label="逾期金额">
                <template #default="{ row }">
                  ¥{{ formatMoney(row.overdueAmount) }}
                </template>
              </el-table-column>
              <el-table-column prop="overdueRate" label="逾期率" suffix="%" />
            </el-table>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button type="success" @click="handleExport(currentReport, 'excel')">
          导出Excel
        </el-button>
        <el-button type="warning" @click="handleExport(currentReport, 'pdf')">
          导出PDF
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Refresh } from '@element-plus/icons-vue'
import { get, post } from '@/utils/request'

// 数据
const loading = ref(false)
const generating = ref(false)
const reports = ref([])
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

const stats = ref({
  monthlyRevenue: 0,
  monthlyExpense: 0,
  monthlyProfit: 0,
  collectionRate: 0
})

const generateForm = ref({
  type: 'revenue',
  period: 'month',
  dateRange: null
})

const showDetailDialog = ref(false)
const currentReport = ref<any>({})

// 方法
const loadReports = async () => {
  try {
    loading.value = true
    const response = await get('/finance/reports', {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    })

    if (response.success) {
      reports.value = response.data.items || []
      pagination.value.total = response.data.total || 0
    }
  } catch (error) {
    console.error('加载报表列表失败:', error)
    ElMessage.error('加载报表列表失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const response = await get('/finance/report-stats')
    if (response.success) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const handleGenerate = async () => {
  try {
    generating.value = true
    const response = await post('/finance/reports/generate', generateForm.value)
    
    if (response.success) {
      ElMessage.success('报表生成成功')
      loadReports()
    }
  } catch (error) {
    console.error('生成报表失败:', error)
    ElMessage.error('生成报表失败')
  } finally {
    generating.value = false
  }
}

const handleView = async (report: any) => {
  try {
    const response = await get(`/finance/reports/${report.id}`)
    if (response.success) {
      currentReport.value = response.data
      showDetailDialog.value = true
    }
  } catch (error) {
    console.error('加载报表详情失败:', error)
    ElMessage.error('加载报表详情失败')
  }
}

const handleExport = async (report: any, format: string) => {
  try {
    ElMessage.info(`正在导出${format.toUpperCase()}格式...`)
    const response = await get(`/finance/reports/${report.id}/export`, {
      format,
      responseType: 'blob'
    })
    
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${report.name}.${format}`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出报表失败:', error)
    ElMessage.error('导出报表失败')
  }
}

const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  loadReports()
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  loadReports()
}

const getReportTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    'revenue': '收入报表',
    'expense': '支出报表',
    'profit': '利润报表',
    'payment': '缴费统计',
    'overdue': '逾期分析',
    'refund': '退费统计',
    'comprehensive': '综合报表'
  }
  return typeMap[type] || type
}

const formatPeriod = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return '-'
  return `${startDate} 至 ${endDate}`
}

const formatMoney = (amount: number) => {
  return amount?.toFixed(2) || '0.00'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadReports()
  loadStats()
})
</script>

<style scoped lang="scss">
.financial-reports-page {
  padding: var(--text-3xl);

  .page-header {
    margin-bottom: var(--text-3xl);

    h1 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--text-3xl);
      font-weight: 600;
      color: var(--text-primary);
    }

    p {
      margin: 0;
      font-size: var(--text-base);
      color: var(--info-color);
    }
  }

  .stats-row {
    margin-bottom: var(--text-lg);
  }

  .generate-card {
    margin-bottom: var(--text-lg);
  }

  .list-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .pagination-container {
    margin-top: var(--text-2xl);
    display: flex;
    justify-content: flex-end;
  }

  .report-detail {
    .report-content {
      margin-top: var(--text-2xl);

      h3 {
        margin: var(--text-2xl) 0 10px 0;
        font-size: var(--text-lg);
        font-weight: 600;
      }

      .report-summary {
        margin-top: var(--text-lg);
        padding: var(--text-lg);
        background: var(--bg-hover);
        border-radius: var(--spacing-xs);

        p {
          margin: var(--spacing-sm) 0;
          font-size: var(--text-base);
          font-weight: 600;
        }
      }
    }
  }
}
</style>

