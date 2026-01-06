<template>
  <div class="finance-center">
    <!-- 页面头部 -->
    <div class="center-header">
      <div class="header-content">
        <div class="header-left">
          <h1>财务中心</h1>
          <p>统一管理幼儿园收费、缴费、财务分析和报表</p>
        </div>
        <div class="header-actions">
          <el-button @click="handleRefresh" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
          <el-button type="primary" @click="handleQuickPayment">
            <el-icon><Plus /></el-icon>
            快速收费
          </el-button>
        </div>
      </div>
    </div>

    <!-- 财务概览卡片 -->
    <div class="overview-section">
      <el-row :gutter="24">
        <el-col :span="6">
          <el-card class="overview-card revenue">
            <div class="card-content">
              <div class="card-icon">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="card-info">
                <h3>本月收入</h3>
                <div class="amount">¥{{ formatMoney(overview.monthlyRevenue) }}</div>
                <div class="trend positive">
                  <el-icon><ArrowUp /></el-icon>
                  较上月 +{{ overview.revenueGrowth }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="overview-card pending">
            <div class="card-content">
              <div class="card-icon">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="card-info">
                <h3>待收费用</h3>
                <div class="amount">¥{{ formatMoney(overview.pendingAmount) }}</div>
                <div class="count">{{ overview.pendingCount }}位学生</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="overview-card collected">
            <div class="card-content">
              <div class="card-icon">
                <el-icon><SuccessFilled /></el-icon>
              </div>
              <div class="card-info">
                <h3>收费完成率</h3>
                <div class="amount">{{ overview.collectionRate }}%</div>
                <div class="count">{{ overview.paidCount }}/{{ overview.totalCount }}位学生</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="overview-card overdue">
            <div class="card-content">
              <div class="card-icon">
                <el-icon><WarningFilled /></el-icon>
              </div>
              <div class="card-info">
                <h3>逾期费用</h3>
                <div class="amount">¥{{ formatMoney(overview.overdueAmount) }}</div>
                <div class="count">{{ overview.overdueCount }}笔</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 功能导航 -->
    <div class="navigation-section">
      <el-card>
        <template #header>
          <span>财务功能</span>
        </template>
        
        <div class="function-grid">
          <div 
            v-for="func in functions" 
            :key="func.key"
            class="function-item"
            @click="navigateToFunction(func)"
          >
            <div class="function-icon" :class="func.color">
              <el-icon>
                <component :is="func.icon" />
              </el-icon>
            </div>
            <div class="function-content">
              <h4>{{ func.title }}</h4>
              <p>{{ func.description }}</p>
              <div class="function-stats" v-if="func.stats">
                {{ func.stats }}
              </div>
            </div>
            <div class="function-arrow">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 最新动态 -->
    <div class="activity-section">
      <el-row :gutter="24">
        <!-- 今日收费 -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="section-header">
                <span>今日收费</span>
                <el-button type="text" @click="viewAllPayments">
                  查看全部
                  <el-icon><ArrowRight /></el-icon>
                </el-button>
              </div>
            </template>
            
            <div class="payment-list">
              <div 
                v-for="payment in todayPayments" 
                :key="payment.id"
                class="payment-item"
              >
                <div class="payment-info">
                  <div class="student-name">{{ payment.studentName }}</div>
                  <div class="payment-detail">{{ payment.feeType }} · {{ payment.period }}</div>
                </div>
                <div class="payment-amount">
                  ¥{{ formatMoney(payment.amount) }}
                </div>
                <div class="payment-status">
                  <el-tag 
                    :type="payment.status === 'paid' ? 'success' : 'warning'" 
                    size="small"
                  >
                    {{ payment.status === 'paid' ? '已缴费' : '待确认' }}
                  </el-tag>
                </div>
              </div>
              
              <div v-if="todayPayments.length === 0" class="empty-state">
                <el-empty description="今日暂无收费记录" />
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 待处理事项 -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="section-header">
                <span>待处理事项</span>
                <el-badge :value="pendingTasks.length" class="badge" />
              </div>
            </template>
            
            <div class="task-list">
              <div 
                v-for="task in pendingTasks" 
                :key="task.id"
                class="task-item"
                @click="handleTask(task)"
              >
                <div class="task-icon" :class="task.priority">
                  <el-icon>
                    <component :is="task.icon" />
                  </el-icon>
                </div>
                <div class="task-info">
                  <div class="task-title">{{ task.title }}</div>
                  <div class="task-desc">{{ task.description }}</div>
                </div>
                <div class="task-time">{{ task.dueTime }}</div>
              </div>
              
              <div v-if="pendingTasks.length === 0" class="empty-state">
                <el-empty description="暂无待处理事项" />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <el-card>
        <template #header>
          <span>快速操作</span>
        </template>
        
        <div class="actions-grid">
          <el-button 
            v-for="action in quickActions" 
            :key="action.key"
            :type="action.type"
            @click="handleQuickAction(action.key)"
          >
            <el-icon>
              <component :is="action.icon" />
            </el-icon>
            {{ action.title }}
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
  TrendCharts, Clock, SuccessFilled, WarningFilled, 
  Refresh, Plus, ArrowUp, ArrowRight, Money, Document,
  Edit, Setting, DataAnalysis, Tickets, Bell, School
} from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)

// 财务概览数据
const overview = reactive({
  monthlyRevenue: 520000,
  revenueGrowth: 12.5,
  pendingAmount: 85000,
  pendingCount: 23,
  collectionRate: 87.3,
  paidCount: 142,
  totalCount: 163,
  overdueAmount: 12000,
  overdueCount: 5
})

// 功能导航
const functions = ref([
  {
    key: 'fee-config',
    title: '收费配置',
    description: '管理各类收费项目和标准',
    icon: 'Setting',
    color: 'blue',
    route: '/finance/fee-config',
    stats: '15个收费项目'
  },
  {
    key: 'payment-management',
    title: '缴费管理',
    description: '学生缴费单生成和管理',
    icon: 'Money',
    color: 'green',
    route: '/finance/payment-management',
    stats: '待处理23笔'
  },
  {
    key: 'collection-reminder',
    title: '催缴管理',
    description: '逾期费用催缴和提醒',
    icon: 'Bell',
    color: 'orange',
    route: '/finance/collection-reminder',
    stats: '5笔逾期'
  },
  {
    key: 'refund-management',
    title: '退费管理',
    description: '学生退费申请处理',
    icon: 'Edit',
    color: 'purple',
    route: '/finance/refund-management',
    stats: '2笔待审核'
  },
  {
    key: 'financial-reports',
    title: '财务报表',
    description: '各类财务统计和分析报表',
    icon: 'Document',
    color: 'cyan',
    route: '/finance/financial-reports',
    stats: '12份报表'
  },
  {
    key: 'data-analysis',
    title: '数据分析',
    description: '收费趋势和财务分析',
    icon: 'DataAnalysis',
    color: 'red',
    route: '/finance/data-analysis',
    stats: '实时更新'
  }
])

// 今日收费记录
const todayPayments = ref([
  {
    id: 1,
    studentName: '张小明',
    feeType: '保教费',
    period: '2024年3月',
    amount: 3000,
    status: 'paid',
    time: '09:15'
  },
  {
    id: 2,
    studentName: '李小红',
    feeType: '餐费',
    period: '2024年3月',
    amount: 500,
    status: 'paid',
    time: '10:30'
  },
  {
    id: 3,
    studentName: '王小华',
    feeType: '延时班',
    period: '2024年3月',
    amount: 300,
    status: 'pending',
    time: '14:20'
  }
])

// 待处理事项
const pendingTasks = ref([
  {
    id: 1,
    title: '逾期费用催缴',
    description: '5位学生保教费逾期未缴',
    icon: 'WarningFilled',
    priority: 'high',
    dueTime: '今天',
    type: 'overdue'
  },
  {
    id: 2,
    title: '退费申请审核',
    description: '王小华申请餐费退费',
    icon: 'Edit',
    priority: 'medium',
    dueTime: '2天后',
    type: 'refund'
  },
  {
    id: 3,
    title: '月度财务报表',
    description: '生成2月份收支报表',
    icon: 'Document',
    priority: 'low',
    dueTime: '5天后',
    type: 'report'
  }
])

// 快速操作
const quickActions = ref([
  { key: 'add-payment', title: '记录收费', icon: 'Plus', type: 'primary' },
  { key: 'generate-bill', title: '生成缴费单', icon: 'Tickets', type: 'success' },
  { key: 'send-reminder', title: '发送催缴', icon: 'Bell', type: 'warning' },
  { key: 'export-report', title: '导出报表', icon: 'Document', type: 'info' }
])

// 格式化金额
const formatMoney = (amount: number): string => {
  return amount.toLocaleString()
}

// 导航到功能页面
const navigateToFunction = (func: any) => {
  if (func.route) {
    router.push(func.route)
  } else {
    ElMessage.info(`${func.title}功能开发中`)
  }
}

// 查看所有缴费记录
const viewAllPayments = () => {
  router.push('/finance/payment-records')
}

// 处理待办事项
const handleTask = (task: any) => {
  switch (task.type) {
    case 'overdue':
      router.push('/finance/collection-reminder')
      break
    case 'refund':
      router.push('/finance/refund-management')
      break
    case 'report':
      router.push('/finance/financial-reports')
      break
    default:
      ElMessage.info('功能开发中')
  }
}

// 快速操作处理
const handleQuickAction = (key: string) => {
  const actionMap: Record<string, string> = {
    'add-payment': '记录收费',
    'generate-bill': '生成缴费单',
    'send-reminder': '发送催缴',
    'export-report': '导出报表'
  }
  
  ElMessage.info(`${actionMap[key]}功能开发中`)
}

// 快速收费
const handleQuickPayment = () => {
  router.push('/finance/quick-payment')
}

// 刷新数据
const handleRefresh = async () => {
  loading.value = true
  try {
    // 这里后续接入真实API
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('数据已刷新')
  } catch (error) {
    ElMessage.error('刷新失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('财务中心已加载')
})
</script>

<style scoped lang="scss">
.finance-center {
  padding: var(--text-3xl);
  background: var(--bg-color, var(--bg-white));
  min-height: calc(100vh - 60px);
}

.center-header {
  margin-bottom: var(--text-3xl);
  background: white;
  border-radius: var(--text-sm);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-6);
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: var(--text-3xl);
    
    .header-left {
      h1 {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-sm) 0;
      }
      
      p {
        color: var(--text-secondary);
        margin: 0;
        font-size: var(--text-base);
      }
    }
    
    .header-actions {
      display: flex;
      gap: var(--text-sm);
    }
  }
}

.overview-section {
  margin-bottom: var(--text-3xl);
  
  .overview-card {
    border-radius: var(--text-sm);
    box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-6);
    border: none;
    
    .card-content {
      display: flex;
      align-items: center;
      gap: var(--text-lg);
      padding: var(--spacing-sm);
      
      .card-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--text-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-3xl);
        color: white;
      }
      
      .card-info {
        flex: 1;
        
        h3 {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin: 0 0 var(--spacing-sm) 0;
          font-weight: normal;
        }
        
        .amount {
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }
        
        .trend {
          font-size: var(--text-sm);
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          
          &.positive {
            color: #059669;
          }
        }
        
        .count {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
        }
      }
    }
    
    &.revenue .card-icon {
      background: linear-gradient(135deg, var(--primary-color), #1d4ed8);
    }
    
    &.pending .card-icon {
      background: linear-gradient(135deg, var(--warning-color), #d97706);
    }
    
    &.collected .card-icon {
      background: linear-gradient(135deg, var(--success-color), #059669);
    }
    
    &.overdue .card-icon {
      background: linear-gradient(135deg, var(--danger-color), #dc2626);
    }
  }
}

.navigation-section {
  margin-bottom: var(--text-3xl);
  
  .function-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: var(--text-lg);
    
    .function-item {
      display: flex;
      align-items: center;
      gap: var(--text-lg);
      padding: var(--text-2xl);
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--text-sm);
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: var(--primary-color);
        box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--accent-enrollment-light);
        transform: translateY(var(--z-index-below));
      }
      
      .function-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--text-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-3xl);
        
        &.blue {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          color: var(--primary-color);
        }
        
        &.green {
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          color: var(--success-color);
        }
        
        &.orange {
          background: linear-gradient(135deg, #fed7aa, #fdba74);
          color: var(--warning-color);
        }
        
        &.purple {
          background: linear-gradient(135deg, #e9d5ff, #ddd6fe);
          color: var(--ai-primary);
        }
        
        &.cyan {
          background: linear-gradient(135deg, #cffafe, #a5f3fc);
          color: #06b6d4;
        }
        
        &.red {
          background: linear-gradient(135deg, #fecaca, #fca5a5);
          color: var(--danger-color);
        }
      }
      
      .function-content {
        flex: 1;
        
        h4 {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--spacing-xs) 0;
        }
        
        p {
          font-size: var(--text-sm);
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
        font-size: var(--text-lg);
      }
    }
  }
}

.activity-section {
  margin-bottom: var(--text-3xl);
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .badge {
      margin-left: var(--spacing-sm);
    }
  }
  
  .payment-list, .task-list {
    .payment-item, .task-item {
      display: flex;
      align-items: center;
      gap: var(--text-lg);
      padding: var(--text-lg) 0;
      border-bottom: var(--z-index-dropdown) solid #f3f4f6;
      
      &:last-child {
        border-bottom: none;
      }
      
      &:hover {
        background: #f9fafb;
        margin: 0 -var(--text-lg);
        padding: var(--text-lg);
        border-radius: var(--spacing-sm);
      }
    }
    
    .payment-item {
      .payment-info {
        flex: 1;
        
        .student-name {
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }
        
        .payment-detail {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
      }
      
      .payment-amount {
        font-weight: 600;
        color: #059669;
      }
    }
    
    .task-item {
      cursor: pointer;
      
      .task-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-xl);
        display: flex;
        align-items: center;
        justify-content: center;
        
        &.high {
          background: #fef2f2;
          color: var(--danger-color);
        }
        
        &.medium {
          background: #fefbf2;
          color: var(--warning-color);
        }
        
        &.low {
          background: #f0f9ff;
          color: var(--primary-color);
        }
      }
      
      .task-info {
        flex: 1;
        
        .task-title {
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }
        
        .task-desc {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
      }
      
      .task-time {
        font-size: var(--text-sm);
        color: var(--text-tertiary);
      }
    }
    
    .empty-state {
      padding: var(--spacing-10xl) 0;
      text-align: center;
    }
  }
}

.quick-actions {
  .actions-grid {
    display: flex;
    gap: var(--text-sm);
    flex-wrap: wrap;
    
    .el-button {
      flex: 1;
      min-width: 140px;
    }
  }
}

:deep(.el-card) {
  border-radius: var(--text-sm);
  border: none;
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-6);
}

:deep(.el-card__header) {
  padding: var(--text-2xl);
  border-bottom: var(--z-index-dropdown) solid #f3f4f6;
  font-weight: 500;
}

:deep(.el-card__body) {
  padding: var(--text-2xl);
}

@media (max-width: var(--breakpoint-md)) {
  .finance-center {
    padding: var(--text-lg);
  }
  
  .center-header .header-content {
    flex-direction: column;
    gap: var(--text-lg);
    align-items: flex-start;
  }
  
  .function-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    flex-direction: column;
    
    .el-button {
      min-width: auto;
    }
  }
}
</style>