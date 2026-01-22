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
            <UnifiedIcon name="Refresh" />
            刷新数据
          </el-button>
          <el-button type="primary" @click="handleQuickPayment">
            <UnifiedIcon name="Plus" />
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
                <UnifiedIcon name="default" />
              </div>
              <div class="card-info">
                <h3>本月收入</h3>
                <div class="amount">¥{{ formatMoney(overview.monthlyRevenue) }}</div>
                <div class="trend positive">
                  <UnifiedIcon name="ArrowUp" />
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
                <UnifiedIcon name="default" />
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
                <UnifiedIcon name="default" />
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
                <UnifiedIcon name="default" />
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
              <UnifiedIcon name="default" />
            </div>
            <div class="function-content">
              <h4>{{ func.title }}</h4>
              <p>{{ func.description }}</p>
              <div class="function-stats" v-if="func.stats">
                {{ func.stats }}
              </div>
            </div>
            <div class="function-arrow">
              <UnifiedIcon name="ArrowRight" />
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
                  <UnifiedIcon name="ArrowRight" />
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
                  <UnifiedIcon name="default" />
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
            <UnifiedIcon name="default" />
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
    icon: 'bell',
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
  { key: 'send-reminder', title: '发送催缴', icon: 'bell', type: 'warning' },
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
/* 定义本页面使用的CSS变量 */
:root {
  --icon-size: 4var(--spacing-sm);
  --function-item-min-width: 100%; max-width: 320px;
  --quick-action-min-max-width: 140px; width: 100%;
  --transform-hover-lift: -2px;
}

.finance-center {
  padding: var(--spacing-3xl);
  background: var(--bg-card));
  min-height: calc(100vh - var(--header-height));
}

.center-header {
  margin-bottom: var(--spacing-3xl);
  background: var(--bg-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: var(--spacing-3xl);

    .header-left {
      h1 {
        font-size: var(--text-3xl);
        font-weight: var(--font-semibold);
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
      gap: var(--spacing-md);
    }
  }
}

.overview-section {
  margin-bottom: var(--spacing-3xl);

  .overview-card {
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    border: none;

    .card-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-lg);

      .card-icon {
        width: var(--icon-size);
        height: var(--icon-size);
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-2xl);
        color: var(--text-on-primary);
      }

      .card-info {
        flex: 1;

        h3 {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin: 0 0 var(--spacing-sm) 0;
          font-weight: var(--font-normal);
        }

        .amount {
          font-size: var(--text-3xl);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .trend {
          font-size: var(--text-sm);
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);

          &.positive {
            color: var(--success-color);
          }
        }

        .count {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
      }
    }
    
    &.revenue .card-icon {
      background: var(--gradient-primary);
    }

    &.pending .card-icon {
      background: var(--gradient-warning);
    }

    &.collected .card-icon {
      background: var(--gradient-success);
    }

    &.overdue .card-icon {
      background: var(--gradient-danger);
    }
  }
}

.navigation-section {
  margin-bottom: var(--spacing-3xl);

  .function-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--function-item-min-width), 1fr));
    gap: var(--spacing-lg);

    .function-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-xl);
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: var(--transition-base);

      &:hover {
        border-color: var(--primary-color);
        box-shadow: var(--shadow-md);
        transform: translateY(var(--transform-hover-lift));
      }

      .function-icon {
        width: var(--icon-size);
        height: var(--icon-size);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-2xl);

        &.blue {
          background: var(--primary-light-bg);
          color: var(--primary-color);
        }

        &.green {
          background: var(--success-light-bg);
          color: var(--success-color);
        }

        &.orange {
          background: var(--warning-light-bg);
          color: var(--warning-color);
        }

        &.purple {
          background: var(--primary-light-bg);
          color: var(--accent-ai);
        }

        &.cyan {
          background: var(--info-light-bg);
          color: var(--info-color);
        }

        &.red {
          background: var(--danger-light-bg);
          color: var(--danger-color);
        }
      }
      
      .function-content {
        flex: 1;

        h4 {
          font-size: var(--text-lg);
          font-weight: var(--font-semibold);
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
          color: var(--text-secondary);
        }
      }

      .function-arrow {
        color: var(--text-secondary);
        font-size: var(--text-lg);
      }
    }
  }
}

.activity-section {
  margin-bottom: var(--spacing-3xl);

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
      gap: var(--spacing-lg);
      padding: var(--spacing-lg) 0;
      border-bottom: var(--border-width-base) solid var(--border-color-extra-light);

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: var(--bg-hover);
        margin: 0 calc(-1 * var(--spacing-lg));
        padding: var(--spacing-lg);
        border-radius: var(--radius-sm);
      }
    }
    
      .payment-item {
      .payment-info {
        flex: 1;

        .student-name {
          font-weight: var(--font-medium);
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .payment-detail {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
      }

      .payment-amount {
        font-weight: var(--font-semibold);
        color: var(--success-color);
      }
    }

    .task-item {
      cursor: pointer;

      .task-icon {
        width: var(--icon-size);
        height: var(--icon-size);
        border-radius: var(--radius-xl);
        display: flex;
        align-items: center;
        justify-content: center;

        &.high {
          background: var(--danger-extra-light);
          color: var(--danger-color);
        }

        &.medium {
          background: var(--warning-extra-light);
          color: var(--warning-color);
        }

        &.low {
          background: var(--primary-extra-light);
          color: var(--primary-color);
        }
      }

      .task-info {
        flex: 1;

        .task-title {
          font-weight: var(--font-medium);
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
        color: var(--text-secondary);
      }
    }

    .empty-state {
      padding: var(--spacing-4xl) 0;
      text-align: center;
    }
  }
}

.quick-actions {
  .actions-grid {
    display: flex;
    gap: var(--spacing-md);
    flex-wrap: wrap;

    .el-button {
      flex: 1;
      min-width: var(--quick-action-min-width);
    }
  }
}

:deep(.el-card) {
  border-radius: var(--radius-md);
  border: none;
  box-shadow: var(--shadow-sm);
}

:deep(.el-card__header) {
  padding: var(--spacing-xl);
  border-bottom: var(--border-width-base) solid var(--border-color-extra-light);
  font-weight: var(--font-medium);
}

:deep(.el-card__body) {
  padding: var(--spacing-xl);
}

@media (max-width: var(--breakpoint-md)) {
  .finance-center {
    padding: var(--spacing-lg);
  }

  .center-header .header-content {
    flex-direction: column;
    gap: var(--spacing-lg);
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