<template>
  <div class="finance-container">
    <!-- 页面头部 -->
    <div class="finance-header">
      <div class="header-content">
        <div class="page-title">
          <h1>财务管理</h1>
          <p>统一管理幼儿园财务收支、报表和分析</p>
        </div>
        <div class="header-actions">
          <el-button @click="handleRefresh">
            <UnifiedIcon name="Refresh" />
            刷新数据
          </el-button>
          <el-button type="primary" @click="handleExport">
            <UnifiedIcon name="Download" />
            导出报表
          </el-button>
        </div>
      </div>
    </div>

    <!-- 财务概览卡片 -->
    <div class="finance-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="card-content">
              <div class="card-icon income">
                <UnifiedIcon name="default" />
              </div>
              <div class="card-info">
                <div class="card-value">¥{{ formatMoney(overview.totalIncome) }}</div>
                <div class="card-label">总收入</div>
                <div class="card-trend positive">
                  <UnifiedIcon name="ArrowUp" />
                  +{{ overview.incomeGrowth }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="card-content">
              <div class="card-icon expense">
                <UnifiedIcon name="default" />
              </div>
              <div class="card-info">
                <div class="card-value">¥{{ formatMoney(overview.totalExpense) }}</div>
                <div class="card-label">总支出</div>
                <div class="card-trend negative">
                  <UnifiedIcon name="ArrowDown" />
                  +{{ overview.expenseGrowth }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="card-content">
              <div class="card-icon profit">
                <UnifiedIcon name="default" />
              </div>
              <div class="card-info">
                <div class="card-value">¥{{ formatMoney(overview.netProfit) }}</div>
                <div class="card-label">净利润</div>
                <div class="card-trend" :class="overview.profitGrowth >= 0 ? 'positive' : 'negative'">
                  <el-icon v-if="overview.profitGrowth >= 0"><ArrowUp /></el-icon>
                  <UnifiedIcon name="ArrowDown" />
                  {{ overview.profitGrowth >= 0 ? '+' : '' }}{{ overview.profitGrowth }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="card-content">
              <div class="card-icon pending">
                <UnifiedIcon name="default" />
              </div>
              <div class="card-info">
                <div class="card-value">¥{{ formatMoney(overview.pendingAmount) }}</div>
                <div class="card-label">待收款</div>
                <div class="card-count">{{ overview.pendingCount }}笔</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 功能导航 -->
    <div class="function-navigation">
      <el-card shadow="never">
        <template #header>
          <span>财务功能</span>
        </template>
        
        <div class="function-grid">
          <div
            v-for="func in functions"
            :key="func.key"
            class="function-item"
            @click="handleFunctionClick(func)"
          >
            <div class="function-icon" :class="func.color">
              <UnifiedIcon name="default" />
            </div>
            <div class="function-content">
              <h4>{{ func.title }}</h4>
              <p>{{ func.description }}</p>
              <div class="function-stats">
                <span v-if="func.stats">{{ func.stats }}</span>
              </div>
            </div>
            <div class="function-arrow">
              <UnifiedIcon name="ArrowRight" />
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 财务图表 -->
    <div class="finance-charts">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="chart-header">
                <span>收支趋势</span>
                <el-select v-model="chartPeriod" size="small" style="max-width: 120px; width: 100%">
                  <el-option label="近7天" value="7d" />
                  <el-option label="近30天" value="30d" />
                  <el-option label="近3个月" value="3m" />
                  <el-option label="近1年" value="1y" />
                </el-select>
              </div>
            </template>
            
            <div class="chart-container" ref="trendChartRef">
              <div class="chart-placeholder">
                <UnifiedIcon name="default" />
                <p>收支趋势图表</p>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>收入构成</span>
            </template>
            
            <div class="chart-container" ref="pieChartRef">
              <div class="income-breakdown">
                <div
                  v-for="item in incomeBreakdown"
                  :key="item.name"
                  class="breakdown-item"
                >
                  <div class="breakdown-color" :style="{ backgroundColor: item.color }"></div>
                  <div class="breakdown-info">
                    <span class="breakdown-name">{{ item.name }}</span>
                    <span class="breakdown-value">¥{{ formatMoney(item.value) }}</span>
                    <span class="breakdown-percent">{{ item.percent }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 最近交易 -->
    <div class="recent-transactions">
      <el-card>
        <template #header>
          <div class="section-header">
            <span>最近交易</span>
            <el-button type="text" @click="viewAllTransactions">
              查看全部
              <UnifiedIcon name="ArrowRight" />
            </el-button>
          </div>
        </template>
        
        <div class="table-wrapper">
<el-table class="responsive-table" :data="recentTransactions" style="width: 100%">
          <el-table-column prop="date" label="日期" width="120">
            <template #default="{ row }">
              {{ formatDate(row.date) }}
            </template>
          </el-table-column>
          
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.type === 'income' ? 'success' : 'danger'" size="small">
                {{ row.type === 'income' ? '收入' : '支出' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="category" label="分类" width="120" />
          
          <el-table-column prop="description" label="描述" />
          
          <el-table-column prop="amount" label="金额" width="120" align="right">
            <template #default="{ row }">
              <span :class="row.type === 'income' ? 'text-success' : 'text-danger'">
                {{ row.type === 'income' ? '+' : '-' }}¥{{ formatMoney(row.amount) }}
              </span>
            </template>
          </el-table-column>
          
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
</div>
      </el-card>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <el-card>
        <template #header>
          <span>快捷操作</span>
        </template>
        
        <div class="actions-grid">
          <el-button @click="handleQuickAction('add-income')">
            <UnifiedIcon name="Plus" />
            记录收入
          </el-button>
          
          <el-button @click="handleQuickAction('add-expense')">
            <UnifiedIcon name="default" />
            记录支出
          </el-button>
          
          <el-button @click="handleQuickAction('generate-report')">
            <UnifiedIcon name="default" />
            生成报表
          </el-button>
          
          <el-button @click="handleQuickAction('backup-data')">
            <UnifiedIcon name="default" />
            数据备份
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  TrendCharts, Money, Clock, Minus, ArrowUp, ArrowDown, ArrowRight,
  Plus, Document, FolderOpened, Refresh, Download
} from '@element-plus/icons-vue'
import { formatDateTime } from '@/utils/date'

// 路由
const router = useRouter()

// 响应式数据
const chartPeriod = ref('30d')
const trendChartRef = ref()
const pieChartRef = ref()

// 财务概览数据
const overview = reactive({
  totalIncome: 1250000,
  totalExpense: 850000,
  netProfit: 400000,
  pendingAmount: 125000,
  pendingCount: 15,
  incomeGrowth: 12.5,
  expenseGrowth: 8.3,
  profitGrowth: 18.7
})

// 功能列表
const functions = ref([
  {
    key: 'financial-reports',
    title: '财务报表',
    description: '查看和生成各类财务报表',
    icon: 'Document',
    color: 'blue',
    route: '/finance/financial-reports',
    stats: '本月已生成12份报表'
  },
  {
    key: 'fee-management',
    title: '收费管理',
    description: '管理学费、杂费等收费项目',
    icon: 'Money',
    color: 'green',
    route: '/finance/fee-management',
    stats: '待收费用¥125,000'
  },
  {
    key: 'expense-management',
    title: '支出管理',
    description: '记录和管理各项支出费用',
    icon: 'Minus',
    color: 'red',
    route: '/finance/expense-management',
    stats: '本月支出¥85,000'
  },
  {
    key: 'budget-planning',
    title: '预算规划',
    description: '制定和管理财务预算计划',
    icon: 'TrendCharts',
    color: 'purple',
    route: '/finance/budget-planning',
    stats: '预算执行率78%'
  },
  {
    key: 'invoice-management',
    title: '发票管理',
    description: '管理收入和支出发票',
    icon: 'Tickets',
    color: 'orange',
    route: '/finance/invoice-management',
    stats: '待开发票23张'
  },
  {
    key: 'financial-analysis',
    title: '财务分析',
    description: '深度分析财务数据和趋势',
    icon: 'DataAnalysis',
    color: 'cyan',
    route: '/finance/financial-analysis',
    stats: '盈利能力良好'
  }
])

// 收入构成数据
const incomeBreakdown = ref([
  { name: '学费收入', value: 800000, percent: 64, color: 'var(--primary-color)' },
  { name: '餐费收入', value: 200000, percent: 16, color: 'var(--success-color)' },
  { name: '活动费用', value: 150000, percent: 12, color: 'var(--warning-color)' },
  { name: '其他收入', value: 100000, percent: 8, color: 'var(--danger-color)' }
])

// 最近交易数据
const recentTransactions = ref([
  {
    id: 1,
    date: '2024-01-15',
    type: 'income',
    category: '学费',
    description: '小班学费收入',
    amount: 15000,
    status: 'completed'
  },
  {
    id: 2,
    date: '2024-01-14',
    type: 'expense',
    category: '采购',
    description: '教学用品采购',
    amount: 3500,
    status: 'completed'
  },
  {
    id: 3,
    date: '2024-01-14',
    type: 'income',
    category: '餐费',
    description: '本周餐费收入',
    amount: 8000,
    status: 'pending'
  },
  {
    id: 4,
    date: '2024-01-13',
    type: 'expense',
    category: '工资',
    description: '教师工资发放',
    amount: 25000,
    status: 'completed'
  },
  {
    id: 5,
    date: '2024-01-12',
    type: 'income',
    category: '活动费',
    description: '亲子活动费用',
    amount: 5000,
    status: 'completed'
  }
])

// 方法
const formatMoney = (amount: number) => {
  return amount.toLocaleString()
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  })
}

const getStatusType = (status: string) => {
  const statusMap = {
    'completed': 'success',
    'pending': 'warning',
    'failed': 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap = {
    'completed': '已完成',
    'pending': '待处理',
    'failed': '失败'
  }
  return statusMap[status] || '未知'
}

const handleRefresh = () => {
  ElMessage.success('数据已刷新')
}

const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

const handleFunctionClick = (func: any) => {
  if (func.route) {
    router.push(func.route)
  } else {
    ElMessage.info(`${func.title}功能开发中`)
  }
}

const viewAllTransactions = () => {
  router.push('/finance/transactions')
}

const handleQuickAction = (action: string) => {
  const actionMap = {
    'add-income': '记录收入',
    'add-expense': '记录支出',
    'generate-report': '生成报表',
    'backup-data': '数据备份'
  }
  ElMessage.info(`${actionMap[action]}功能开发中`)
}

// 生命周期
onMounted(() => {
  console.log('财务管理页面已加载')
})
</script>

<style lang="scss">
.finance-container {
  padding: var(--text-2xl);
  max-width: 100%; max-width: 1400px;
  margin: 0 auto;
}

.finance-header {
  margin-bottom: var(--text-3xl);
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
    .page-title {
      h1 {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-sm) 0;
      }
      
      p {
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

.finance-overview {
  margin-bottom: var(--text-3xl);
  
  .overview-card {
    .card-content {
      display: flex;
      align-items: center;
      gap: var(--text-lg);
      
      .card-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-3xl);
        
        &.income {
          background: #f0f9ff;
          color: var(--primary-color);
        }
        
        &.expense {
          background: #fef2f2;
          color: var(--danger-color);
        }
        
        &.profit {
          background: #f0fdf4;
          color: var(--success-color);
        }
        
        &.pending {
          background: #fefbf2;
          color: var(--warning-color);
        }
      }
      
      .card-info {
        flex: 1;
        
        .card-value {
          font-size: var(--text-3xl);
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1;
          margin-bottom: var(--spacing-xs);
        }
        
        .card-label {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
        }
        
        .card-trend {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--text-sm);
          
          &.positive {
            color: var(--success-color);
          }
          
          &.negative {
            color: var(--danger-color);
          }
        }
        
        .card-count {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
        }
      }
    }
  }
}

.function-navigation {
  margin-bottom: var(--text-3xl);
  
  .function-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--text-lg);
    
    .function-item {
      display: flex;
      align-items: center;
      gap: var(--text-lg);
      padding: var(--text-lg);
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--spacing-sm);
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px var(--spacing-sm) var(--accent-enrollment-light);
      }
      
      .function-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-3xl);
        
        &.blue {
          background: #f0f9ff;
          color: var(--primary-color);
        }
        
        &.green {
          background: #f0fdf4;
          color: var(--success-color);
        }
        
        &.red {
          background: #fef2f2;
          color: var(--danger-color);
        }
        
        &.purple {
          background: #faf5ff;
          color: #a855f7;
        }
        
        &.orange {
          background: var(--bg-white)7ed;
          color: #f97316;
        }
        
        &.cyan {
          background: #ecfeff;
          color: #06b6d4;
        }
      }
      
      .function-content {
        flex: 1;
        
        h4 {
          font-size: var(--text-lg);
          font-weight: 500;
          color: var(--text-primary);
          margin: 0 0 var(--spacing-xs) 0;
        }
        
        p {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin: 0 0 var(--spacing-sm) 0;
        }
        
        .function-stats {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
        }
      }
      
      .function-arrow {
        color: var(--text-tertiary);
      }
    }
  }
}

.finance-charts {
  margin-bottom: var(--text-3xl);
  
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .chart-container {
    min-height: 60px; height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .chart-placeholder {
      text-align: center;
      color: var(--text-tertiary);
      
      p {
        margin-top: var(--text-sm);
      }
    }
  }
  
  .income-breakdown {
    .breakdown-item {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      padding: var(--text-sm) 0;
      border-bottom: var(--z-index-dropdown) solid #f3f4f6;
      
      &:last-child {
        border-bottom: none;
      }
      
      .breakdown-color {
        width: var(--text-sm);
        height: var(--text-sm);
        border-radius: var(--radius-full);
      }
      
      .breakdown-info {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .breakdown-name {
          color: var(--color-gray-700);
        }
        
        .breakdown-value {
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .breakdown-percent {
          color: var(--text-secondary);
          font-size: var(--text-base);
        }
      }
    }
  }
}

.recent-transactions {
  margin-bottom: var(--text-3xl);
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .text-success {
    color: var(--success-color);
  }
  
  .text-danger {
    color: var(--danger-color);
  }
}

.quick-actions {
  .actions-grid {
    display: flex;
    gap: var(--text-sm);
    flex-wrap: wrap;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .finance-container {
    padding: var(--text-lg);
  }
  
  .finance-header .header-content {
    flex-direction: column;
    gap: var(--text-lg);
    align-items: flex-start;
  }
  
  .finance-overview {
    .el-col {
      margin-bottom: var(--text-lg);
    }
  }
  
  .function-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    flex-direction: column;
    
    .el-button {
      width: 100%;
    }
  }
}
</style>
