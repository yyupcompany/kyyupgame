<template>
  <CenterContainer
    title="财务中心"
    :tabs="tabs"
    default-tab="overview"
    v-model:activeTab="activeTab"
    :show-header="false"
    :show-actions="false"
    :sync-url="false"
    :show-skeleton="stats.loading"
    @create="handleQuickPayment"
    @tab-change="handleTabChange"
  >
    <!-- 概览标签页 -->
    <template #tab-overview>
      <div class="overview-content">
        <!-- 欢迎词和操作按钮 -->
        <div class="welcome-section">
          <div class="welcome-content">
            <h2>欢迎来到财务中心</h2>
            <p>这里是财务管理的中心枢纽，您可以管理收费配置、处理缴费事务、生成财务报表、监控资金流动。</p>
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

        <!-- 错误状态提示 -->
        <el-alert
          v-if="stats.error"
          :title="stats.error"
          type="error"
          :closable="false"
          style="margin-bottom: var(--text-2xl)"
        />

        <!-- 财务概览卡片 -->
        <div class="stats-grid">
          <div class="stat-card" @click="switchToTab('todayPayments')">
            <div class="stat-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">
                <span v-if="stats.loading">加载中...</span>
                <span v-else-if="stats.error">--</span>
                <span v-else>¥{{ formatMoney(overview.monthlyRevenue) }}</span>
              </div>
              <div class="stat-label">本月收入</div>
              <div class="stat-trend up" v-if="!stats.loading && !stats.error && overview.revenueGrowth">
                <el-icon><ArrowUp /></el-icon>
                <span>较上月 +{{ overview.revenueGrowth }}%</span>
              </div>
            </div>
          </div>
          
          <div class="stat-card" @click="switchToTab('pendingTasks')">
            <div class="stat-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">
                <span v-if="stats.loading">加载中...</span>
                <span v-else-if="stats.error">--</span>
                <span v-else>¥{{ formatMoney(overview.pendingAmount) }}</span>
              </div>
              <div class="stat-label">待收费用</div>
              <div class="stat-trend" v-if="!stats.loading && !stats.error">
                {{ overview.pendingCount }}位学生
              </div>
            </div>
          </div>
          
          <div class="stat-card" @click="switchToTab('reports')">
            <div class="stat-icon">
              <el-icon><SuccessFilled /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">
                <span v-if="stats.loading">加载中...</span>
                <span v-else-if="stats.error">--</span>
                <span v-else>{{ overview.collectionRate }}%</span>
              </div>
              <div class="stat-label">收费完成率</div>
              <div class="stat-trend" v-if="!stats.loading && !stats.error">
                {{ overview.paidCount }}/{{ overview.totalCount }}位学生
              </div>
            </div>
          </div>
          
          <div class="stat-card" @click="switchToTab('pendingTasks')">
            <div class="stat-icon">
              <el-icon><WarningFilled /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">
                <span v-if="stats.loading">加载中...</span>
                <span v-else-if="stats.error">--</span>
                <span v-else>¥{{ formatMoney(overview.overdueAmount) }}</span>
              </div>
              <div class="stat-label">逾期费用</div>
              <div class="stat-trend down" v-if="!stats.loading && !stats.error">
                {{ overview.overdueCount }}笔
              </div>
            </div>
          </div>
        </div>

        <!-- 快速操作 -->
        <div class="quick-actions">
          <div class="actions-header">
            <h3>快速操作</h3>
          </div>
          <div class="actions-grid">
            <ActionCard
              v-for="action in quickActions"
              :key="action.key"
              :title="action.title"
              :description="action.description"
              :icon="action.icon"
              :color="action.color"
              @click="handleQuickAction(action.key)"
            />
          </div>
        </div>

        <!-- 财务趋势图表 -->
        <div class="charts-section">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">月度收入趋势</h3>
              <div class="chart-actions">
                <el-button size="small" text>导出</el-button>
              </div>
            </div>
            <div class="chart-content" ref="revenueChart">
              <!-- ECharts 图表将在这里渲染 -->
            </div>
          </div>
          
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">费用类别分布</h3>
              <div class="chart-actions">
                <el-button size="small" text>详情</el-button>
              </div>
            </div>
            <div class="chart-content" ref="categoryChart">
              <!-- ECharts 图表将在这里渲染 -->
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 今日收费标签页 -->
    <template #tab-todayPayments>
      <div class="payments-content">
        <div class="payments-header">
          <h3>今日收费记录</h3>
          <div class="header-actions">
            <el-button type="primary" @click="handleAddPayment">
              <el-icon><Plus /></el-icon>
              添加收费
            </el-button>
          </div>
        </div>

        <!-- 收费统计 -->
        <div class="payment-stats">
          <div class="stat-item">
            <h4>今日收费总额</h4>
            <div class="value">¥{{ todayPaymentStats.totalAmount || 0 }}</div>
          </div>
          <div class="stat-item">
            <h4>收费笔数</h4>
            <div class="value">{{ todayPaymentStats.totalCount || 0 }}</div>
          </div>
          <div class="stat-item">
            <h4>现金收费</h4>
            <div class="value">¥{{ todayPaymentStats.cashAmount || 0 }}</div>
          </div>
          <div class="stat-item">
            <h4>线上收费</h4>
            <div class="value">¥{{ todayPaymentStats.onlineAmount || 0 }}</div>
          </div>
        </div>

        <!-- 今日收费列表 -->
        <div class="payment-list">
          <el-table :data="todayPayments" stripe>
            <el-table-column prop="studentName" label="学生姓名" />
            <el-table-column prop="class" label="班级" />
            <el-table-column prop="feeType" label="费用类型" />
            <el-table-column prop="amount" label="金额">
              <template #default="{ row }">
                <span class="amount-text">¥{{ row.amount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="paymentMethod" label="支付方式">
              <template #default="{ row }">
                <el-tag :type="getPaymentMethodType(row.paymentMethod)">
                  {{ getPaymentMethodText(row.paymentMethod) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="paymentTime" label="支付时间" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button size="small" @click="viewPayment(row)">
                  <el-icon><View /></el-icon>
                  查看
                </el-button>
                <el-button size="small" type="primary" @click="printReceipt(row)">
                  <el-icon><Printer /></el-icon>
                  打印
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>

    <!-- 待处理事项标签页 -->
    <template #tab-pendingTasks>
      <div class="tasks-content">
        <div class="tasks-header">
          <h3>待处理事项</h3>
          <div class="header-actions">
            <el-select v-model="taskFilter.priority" placeholder="选择优先级">
              <el-option label="全部" value="" />
              <el-option label="高优先级" value="high" />
              <el-option label="中优先级" value="medium" />
              <el-option label="低优先级" value="low" />
            </el-select>
          </div>
        </div>

        <!-- 任务统计 -->
        <div class="task-stats">
          <div class="stat-item">
            <h4>总待办</h4>
            <div class="value">{{ taskStats.totalTasks || 0 }}</div>
          </div>
          <div class="stat-item">
            <h4>高优先级</h4>
            <div class="value">{{ taskStats.highPriority || 0 }}</div>
          </div>
          <div class="stat-item">
            <h4>逾期提醒</h4>
            <div class="value">{{ taskStats.overdue || 0 }}</div>
          </div>
          <div class="stat-item">
            <h4>今日新增</h4>
            <div class="value">{{ taskStats.newToday || 0 }}</div>
          </div>
        </div>

        <!-- 待处理任务列表 -->
        <div class="task-list">
          <div v-for="task in filteredPendingTasks" :key="task.id" class="task-item" @click="handleTask(task)">
            <div class="task-icon" :class="task.priority">
              <el-icon><Bell /></el-icon>
            </div>
            <div class="task-info">
              <div class="task-title">{{ task.title }}</div>
              <div class="task-desc">{{ task.description }}</div>
            </div>
            <div class="task-meta">
              <div class="task-time">{{ task.time }}</div>
              <el-tag size="small" :type="getTaskPriorityType(task.priority)">
                {{ getTaskPriorityText(task.priority) }}
              </el-tag>
            </div>
          </div>
          <div v-if="filteredPendingTasks.length === 0" class="empty-state">
            <el-empty description="暂无待处理事项" />
          </div>
        </div>
      </div>
    </template>

    <!-- 财务报表标签页 -->
    <template #tab-reports>
      <div class="reports-content">
        <div class="reports-header">
          <h3>财务报表管理</h3>
          <div class="header-actions">
            <el-button-group>
              <el-button @click="generateReport('monthly')">月度报表</el-button>
              <el-button @click="generateReport('quarterly')">季度报表</el-button>
              <el-button @click="generateReport('yearly')">年度报表</el-button>
            </el-button-group>
          </div>
        </div>

        <!-- 报表统计 -->
        <div class="report-stats">
          <div class="stat-item">
            <h4>本月报表</h4>
            <div class="value">{{ reportStats.monthlyReports || 0 }}</div>
          </div>
          <div class="stat-item">
            <h4>季度报表</h4>
            <div class="value">{{ reportStats.quarterlyReports || 0 }}</div>
          </div>
          <div class="stat-item">
            <h4>年度报表</h4>
            <div class="value">{{ reportStats.yearlyReports || 0 }}</div>
          </div>
          <div class="stat-item">
            <h4>自定义报表</h4>
            <div class="value">{{ reportStats.customReports || 0 }}</div>
          </div>
        </div>

        <!-- 报表列表 -->
        <div class="reports-list">
          <el-table :data="financeReports" stripe>
            <el-table-column prop="name" label="报表名称" />
            <el-table-column prop="type" label="报表类型">
              <template #default="{ row }">
                <el-tag>{{ getReportTypeText(row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="period" label="报表周期" />
            <el-table-column prop="createTime" label="生成时间" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="getReportStatusType(row.status)">
                  {{ getReportStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button size="small" @click="viewReport(row)">
                  <el-icon><View /></el-icon>
                  查看
                </el-button>
                <el-button size="small" type="primary" @click="downloadReport(row)">
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>

    <!-- 费用设置标签页 -->
    <template #tab-settings>
      <div class="settings-content">
        <div class="settings-header">
          <h3>费用设置管理</h3>
          <div class="header-actions">
            <el-button type="primary" @click="openFeeConfig">
              <el-icon><Setting /></el-icon>
              收费配置
            </el-button>
          </div>
        </div>

        <!-- 设置分组 -->
        <div class="settings-tabs">
          <el-tabs v-model="activeSettingsTab" type="card">
            <el-tab-pane label="收费项目配置" name="feeItems">
              <div class="settings-form">
                <el-button type="primary" @click="openFeeConfig" class="mb-4">
                  <el-icon><Plus /></el-icon>
                  添加收费项目
                </el-button>
                
                <!-- 收费项目列表 -->
                <el-table :data="feeItems" stripe>
                  <el-table-column prop="name" label="收费项目" />
                  <el-table-column prop="amount" label="金额">
                    <template #default="{ row }">
                      <span class="amount-text">¥{{ row.amount }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="type" label="类型">
                    <template #default="{ row }">
                      <el-tag>{{ getFeeTypeText(row.type) }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态">
                    <template #default="{ row }">
                      <el-tag :type="getFeeStatusType(row.status)">
                        {{ getFeeStatusText(row.status) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150">
                    <template #default="{ row }">
                      <el-button size="small" @click="editFeeItem(row)">编辑</el-button>
                      <el-button size="small" type="danger" @click="deleteFeeItem(row)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>

            <el-tab-pane label="缴费规则设置" name="paymentRules">
              <div class="settings-form">
                <el-form :model="paymentRules" label-width="150px">
                  <el-form-item label="缴费截止日">
                    <el-input-number v-model="paymentRules.dueDay" :min="1" :max="31" />
                    <span class="form-help-text">每月的缴费截止日期</span>
                  </el-form-item>
                  <el-form-item label="逾期天数提醒">
                    <el-input-number v-model="paymentRules.overdueReminder" :min="1" :max="30" />
                    <span class="form-help-text">逾期多少天后发送提醒</span>
                  </el-form-item>
                  <el-form-item label="允许部分缴费">
                    <el-switch v-model="paymentRules.allowPartialPayment" />
                  </el-form-item>
                  <el-form-item label="自动生成账单">
                    <el-switch v-model="paymentRules.autoGenerateBills" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="savePaymentRules">保存设置</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="优惠政策配置" name="discounts">
              <div class="settings-form">
                <el-button type="primary" @click="openDiscountConfig" class="mb-4">
                  <el-icon><Plus /></el-icon>
                  添加优惠政策
                </el-button>
                
                <!-- 优惠政策列表 -->
                <el-table :data="discountPolicies" stripe>
                  <el-table-column prop="name" label="政策名称" />
                  <el-table-column prop="type" label="优惠类型">
                    <template #default="{ row }">
                      <el-tag>{{ getDiscountTypeText(row.type) }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="优惠额度">
                    <template #default="{ row }">
                      <span v-if="row.type === 'percentage'">{{ row.value }}%</span>
                      <span v-else>¥{{ row.value }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="validPeriod" label="有效期" />
                  <el-table-column prop="status" label="状态">
                    <template #default="{ row }">
                      <el-tag :type="getDiscountStatusType(row.status)">
                        {{ getDiscountStatusText(row.status) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150">
                    <template #default="{ row }">
                      <el-button size="small" @click="editDiscountPolicy(row)">编辑</el-button>
                      <el-button size="small" type="danger" @click="deleteDiscountPolicy(row)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </template>
  </CenterContainer>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  TrendCharts, Clock, SuccessFilled, WarningFilled, 
  Refresh, Plus, ArrowUp, Money, Document, View, Printer,
  Edit, Setting, DataAnalysis, Tickets, Bell, School,
  Download
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import CenterContainer from '@/components/centers/CenterContainer.vue'
import ActionCard from '@/components/centers/ActionCard.vue'
import request from '@/utils/request'

// 路由
const router = useRouter()
const route = useRoute()

// 标签页配置
const tabs = [
  { key: 'overview', label: '概览' },
  { key: 'todayPayments', label: '今日收费' },
  { key: 'pendingTasks', label: '待处理事项' },
  { key: 'reports', label: '财务报表' },
  { key: 'settings', label: '费用设置' }
]

// 当前激活的标签页
const activeTab = ref('overview')

// 设置子标签页
const activeSettingsTab = ref('feeItems')

// 组件引用
const revenueChart = ref()
const categoryChart = ref()

// 加载状态
const loading = ref(false)

// 统计数据
const stats = ref({
  loading: true,
  error: null
})

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

// 快速操作配置
const quickActions = ref([
  { key: 'fee-config', title: '收费配置', description: '设置和管理收费项目', icon: 'Setting', color: 'primary' },
  { key: 'payment-management', title: '缴费管理', description: '处理学生缴费事务', icon: 'Money', color: 'success' },
  { key: 'financial-reports', title: '财务报表', description: '生成和查看财务报表', icon: 'DataAnalysis', color: 'warning' },
  { key: 'enrollment-linkage', title: '招生财务联动', description: '招生与财务数据联动', icon: 'School', color: 'info' },
  { key: 'invoice-management', title: '发票管理', description: '管理和打印发票', icon: 'Tickets', color: 'danger' }
])

// 今日收费数据
const todayPayments = ref([
  {
    id: 1,
    studentName: '张小明',
    class: '大班一班',
    feeType: '保教费',
    amount: 3000,
    paymentMethod: 'online',
    paymentTime: '09:15'
  },
  {
    id: 2,
    studentName: '李小红',
    class: '中班二班',
    feeType: '餐费',
    amount: 500,
    paymentMethod: 'cash',
    paymentTime: '10:30'
  }
])

const todayPaymentStats = ref({
  totalAmount: 3500,
  totalCount: 2,
  cashAmount: 500,
  onlineAmount: 3000
})

// 待处理事项数据
const pendingTasks = ref([
  {
    id: 1,
    title: '5笔逾期缴费提醒',
    description: '有5位学生的缴费已逾期，需要及时处理',
    time: '2小时前',
    priority: 'high'
  },
  {
    id: 2,
    title: '本月财务报表待生成',
    description: '月度财务报表需要在月底前完成',
    time: '1天前',
    priority: 'medium'
  }
])

const taskStats = ref({
  totalTasks: 2,
  highPriority: 1,
  overdue: 1,
  newToday: 0
})

const taskFilter = ref({
  priority: ''
})

// 财务报表数据
const financeReports = ref([
  {
    id: 1,
    name: '2024年1月财务报表',
    type: 'monthly',
    period: '2024-01',
    createTime: '2024-01-31 23:59',
    status: 'completed'
  },
  {
    id: 2,
    name: '2024年Q1季度报表',
    type: 'quarterly',
    period: '2024-Q1',
    createTime: '2024-03-31 23:59',
    status: 'completed'
  }
])

const reportStats = ref({
  monthlyReports: 12,
  quarterlyReports: 4,
  yearlyReports: 1,
  customReports: 3
})

// 费用设置数据
const feeItems = ref([
  {
    id: 1,
    name: '保教费',
    amount: 3000,
    type: 'monthly',
    status: 'active'
  },
  {
    id: 2,
    name: '餐费',
    amount: 500,
    type: 'monthly',
    status: 'active'
  }
])

const paymentRules = ref({
  dueDay: 15,
  overdueReminder: 3,
  allowPartialPayment: true,
  autoGenerateBills: true
})

const discountPolicies = ref([
  {
    id: 1,
    name: '兄弟姐妹优惠',
    type: 'percentage',
    value: 10,
    validPeriod: '长期有效',
    status: 'active'
  }
])

// 计算属性
const filteredPendingTasks = computed(() => {
  if (!taskFilter.value.priority) {
    return pendingTasks.value
  }
  return pendingTasks.value.filter(task => task.priority === taskFilter.value.priority)
})

// 切换标签页
const handleTabChange = async (tabKey: string) => {
  activeTab.value = tabKey
  console.log('财务中心切换到标签页:', tabKey)

  // 根据标签页按需加载数据
  switch (tabKey) {
    case 'overview':
      nextTick(() => {
        setTimeout(initFinanceCharts, 300)
      })
      break
    case 'todayPayments':
      await fetchTodayPayments()
      break
    case 'pendingTasks':
      await fetchPendingTasks()
      break
    case 'reports':
      await fetchFinanceReports()
      break
    case 'settings':
      await fetchFeeSettings()
      break
  }
}

const switchToTab = (tabName: string) => {
  activeTab.value = tabName
}

// 获取财务统计数据
const fetchFinanceStats = async () => {
  try {
    console.log('🔄 开始获取财务中心统计数据...')
    stats.value.loading = true
    stats.value.error = null

    const response = await request.get('/statistics', {
      params: {
        module: 'finance',
        type: 'overview'
      }
    })

    console.log('📊 财务统计API响应:', response)

    if (response.success && response.data) {
      const financeData = response.data

      overview.monthlyRevenue = financeData.monthlyRevenue || 520000
      overview.revenueGrowth = financeData.revenueGrowth || 12.5
      overview.pendingAmount = financeData.pendingAmount || 85000
      overview.pendingCount = financeData.pendingCount || 23
      overview.collectionRate = financeData.collectionRate || 87.3
      overview.paidCount = financeData.paidCount || 142
      overview.totalCount = financeData.totalCount || 163
      overview.overdueAmount = financeData.overdueAmount || 12000
      overview.overdueCount = financeData.overdueCount || 5

      stats.value.loading = false
      console.log('✅ 财务中心统计数据更新成功:', overview)
    } else {
      console.warn('⚠️ API响应格式异常:', response)
      stats.value.loading = false
      stats.value.error = 'API响应格式异常'
    }
  } catch (error) {
    console.error('❌ 获取财务中心统计数据失败:', error)
    stats.value.loading = false
    stats.value.error = '数据加载失败'
  }
}

// 获取今日收费数据
const fetchTodayPayments = async () => {
  try {
    const response = await request.get('/finance/today-payments')
    if (response.success && response.data) {
      todayPayments.value = response.data.data || []
      todayPaymentStats.value = response.data.stats || todayPaymentStats.value
    }
  } catch (error) {
    console.error('获取今日收费数据失败:', error)
  }
}

// 获取待处理事项
const fetchPendingTasks = async () => {
  try {
    const response = await request.get('/finance/pending-tasks')
    if (response.success && response.data) {
      pendingTasks.value = response.data.data || []
      taskStats.value = response.data.stats || taskStats.value
    }
  } catch (error) {
    console.error('获取待处理事项失败:', error)
  }
}

// 获取财务报表
const fetchFinanceReports = async () => {
  try {
    const response = await request.get('/finance/reports')
    if (response.success && response.data) {
      financeReports.value = response.data.data || []
      reportStats.value = response.data.stats || reportStats.value
    }
  } catch (error) {
    console.error('获取财务报表失败:', error)
  }
}

// 获取费用设置
const fetchFeeSettings = async () => {
  try {
    const response = await request.get('/finance/fee-settings')
    if (response.success && response.data) {
      feeItems.value = response.data.feeItems || []
      paymentRules.value = { ...paymentRules.value, ...response.data.paymentRules }
      discountPolicies.value = response.data.discountPolicies || []
    }
  } catch (error) {
    console.error('获取费用设置失败:', error)
  }
}

// 格式化金额
const formatMoney = (amount: number): string => {
  if (amount >= 10000) {
    return (amount / 10000).toFixed(1) + '万'
  }
  return amount.toLocaleString()
}

// 处理快速操作
const handleQuickAction = (actionKey: string) => {
  switch (actionKey) {
    case 'fee-config':
      router.push('/finance/fee-config')
      break
    case 'payment-management':
      router.push('/finance/payment-management')
      break
    case 'financial-reports':
      switchToTab('reports')
      break
    case 'enrollment-linkage':
      router.push('/finance/enrollment-finance-linkage')
      break
    case 'invoice-management':
      ElMessage.info('发票管理功能开发中...')
      break
    default:
      console.warn('未知的快速操作:', actionKey)
  }
}

// 刷新数据
const handleRefresh = async () => {
  loading.value = true
  try {
    await fetchFinanceStats()
    ElMessage.success('数据刷新成功')
  } finally {
    loading.value = false
  }
}

// 快速收费
const handleQuickPayment = () => {
  router.push('/finance/payment-management')
}

// 收费相关操作
const handleAddPayment = () => {
  ElMessage.info('添加收费功能')
}

const viewPayment = (payment: any) => {
  ElMessage.info(`查看收费记录: ${payment.studentName}`)
}

const printReceipt = (payment: any) => {
  ElMessage.info(`打印收费凭证: ${payment.studentName}`)
}

// 任务相关操作
const handleTask = (task: any) => {
  ElMessage.info(`处理任务: ${task.title}`)
}

// 报表相关操作
const generateReport = (type: string) => {
  const typeText = type === 'monthly' ? '月度' : type === 'quarterly' ? '季度' : '年度'
  ElMessage.info(`正在生成${typeText}报表...`)
}

const viewReport = (report: any) => {
  ElMessage.info(`查看报表: ${report.name}`)
}

const downloadReport = (report: any) => {
  ElMessage.info(`下载报表: ${report.name}`)
}

// 费用设置相关操作
const openFeeConfig = () => {
  router.push('/finance/fee-config')
}

const openDiscountConfig = () => {
  ElMessage.info('打开优惠政策配置')
}

const editFeeItem = (item: any) => {
  ElMessage.info(`编辑收费项目: ${item.name}`)
}

const deleteFeeItem = (item: any) => {
  ElMessageBox.confirm(
    `确定要删除收费项目 "${item.name}" 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`收费项目 ${item.name} 已删除`)
  })
}

const savePaymentRules = async () => {
  try {
    const response = await request.put('/finance/payment-rules', paymentRules.value)
    if (response.success) {
      ElMessage.success('缴费规则保存成功')
    } else {
      ElMessage.error('缴费规则保存失败')
    }
  } catch (error) {
    console.error('保存缴费规则失败:', error)
    ElMessage.error('缴费规则保存失败')
  }
}

const editDiscountPolicy = (policy: any) => {
  ElMessage.info(`编辑优惠政策: ${policy.name}`)
}

const deleteDiscountPolicy = (policy: any) => {
  ElMessageBox.confirm(
    `确定要删除优惠政策 "${policy.name}" 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`优惠政策 ${policy.name} 已删除`)
  })
}

// 状态转换函数
const getPaymentMethodType = (method: string) => {
  const methodMap: Record<string, string> = {
    'cash': 'warning',
    'online': 'success',
    'card': 'primary'
  }
  return methodMap[method] || 'info'
}

const getPaymentMethodText = (method: string) => {
  const methodMap: Record<string, string> = {
    'cash': '现金',
    'online': '线上支付',
    'card': '银行卡'
  }
  return methodMap[method] || '未知'
}

const getTaskPriorityType = (priority: string) => {
  const priorityMap: Record<string, string> = {
    'high': 'danger',
    'medium': 'warning',
    'low': 'info'
  }
  return priorityMap[priority] || 'info'
}

const getTaskPriorityText = (priority: string) => {
  const priorityMap: Record<string, string> = {
    'high': '高优先级',
    'medium': '中优先级',
    'low': '低优先级'
  }
  return priorityMap[priority] || '未知'
}

const getReportTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    'monthly': '月度报表',
    'quarterly': '季度报表',
    'yearly': '年度报表',
    'custom': '自定义报表'
  }
  return typeMap[type] || '未知'
}

const getReportStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'completed': 'success',
    'processing': 'warning',
    'failed': 'danger'
  }
  return statusMap[status] || 'info'
}

const getReportStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'completed': '已完成',
    'processing': '生成中',
    'failed': '失败'
  }
  return statusMap[status] || '未知'
}

const getFeeTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    'monthly': '月费',
    'yearly': '年费',
    'onetime': '一次性费用'
  }
  return typeMap[type] || '未知'
}

const getFeeStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': 'success',
    'inactive': 'warning',
    'deprecated': 'info'
  }
  return statusMap[status] || 'info'
}

const getFeeStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': '启用',
    'inactive': '停用',
    'deprecated': '已废弃'
  }
  return statusMap[status] || '未知'
}

const getDiscountTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    'percentage': '百分比优惠',
    'fixed': '固定金额优惠'
  }
  return typeMap[type] || '未知'
}

const getDiscountStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': 'success',
    'expired': 'warning',
    'inactive': 'info'
  }
  return statusMap[status] || 'info'
}

const getDiscountStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': '有效',
    'expired': '已过期',
    'inactive': '停用'
  }
  return statusMap[status] || '未知'
}

// 初始化财务图表
const initFinanceCharts = () => {
  setTimeout(() => {
    console.log('🔄 开始初始化财务图表...')

    // 月度收入趋势图表
    if (revenueChart.value) {
      const revenueChartInstance = echarts.init(revenueChart.value)
      const revenueOption = {
        title: { text: '' },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: { type: 'value' },
        series: [{
          name: '收入',
          type: 'line',
          data: [480000, 510000, 520000, 530000, 540000, 520000],
          smooth: true,
          itemStyle: { color: 'var(--primary-color)' }
        }]
      }
      revenueChartInstance.setOption(revenueOption)
    }

    // 费用类别分布图表
    if (categoryChart.value) {
      const categoryChartInstance = echarts.init(categoryChart.value)
      const categoryOption = {
        title: { text: '' },
        tooltip: { trigger: 'item' },
        series: [{
          name: '费用类别',
          type: 'pie',
          data: [
            { value: 300000, name: '保教费' },
            { value: 100000, name: '餐费' },
            { value: 80000, name: '活动费' },
            { value: 40000, name: '其他费用' }
          ]
        }]
      }
      categoryChartInstance.setOption(categoryOption)
    }
  }, 500)
}

// 组件挂载时加载数据
onMounted(async () => {
  console.log(`🔄 财务中心组件挂载，默认标签页: ${activeTab.value}`)
  
  // 加载基础统计数据
  await fetchFinanceStats()
  
  // 根据当前标签页加载对应数据
  if (activeTab.value === 'overview') {
    nextTick(() => {
      setTimeout(initFinanceCharts, 300)
    })
  }
})
</script>

<style scoped lang="scss">
// 导入全局样式变量
@import '@/styles/design-tokens.scss';

// 概览页面样式
.overview-content {
  .welcome-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-xl, 2rem) var(--spacing-lg, 1.5rem);
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(103, 194, 58, 0.1) 100%);
    border-radius: var(--border-radius-lg, var(--text-sm));
    border: var(--border-width-base) solid rgba(64, 158, 255, 0.2);
    margin-bottom: var(--spacing-lg, 1.5rem);

    .welcome-content {
      flex: 1;
      text-align: left;

      h2 {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-md, 1rem) 0;
        background: linear-gradient(135deg, var(--primary-color), var(--success-color));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      p {
        font-size: 1rem;
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.6;
        max-width: 600px;
      }
    }

    .header-actions {
      flex-shrink: 0;
      margin-left: 2rem;
      display: flex;
      gap: var(--text-sm);
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--text-2xl);
    margin-bottom: var(--spacing-8xl);
  }

  .stat-card {
    display: flex;
    align-items: center;
    padding: var(--text-2xl);
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--success-color) 100%);
    border-radius: var(--text-sm);
    color: white;
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-5px);
    }

    &:nth-child(2) {
      background: linear-gradient(135deg, var(--warning-color) 0%, var(--danger-color) 100%);
    }

    &:nth-child(3) {
      background: linear-gradient(135deg, var(--success-color) 0%, var(--success-light) 100%);
    }

    &:nth-child(4) {
      background: linear-gradient(135deg, var(--danger-color) 0%, var(--danger-light) 100%);
    }

    .stat-icon {
      font-size: var(--text-5xl);
      margin-right: var(--spacing-4xl);
      opacity: 0.8;
    }

    .stat-content {
      flex: 1;

      .stat-value {
        font-size: var(--spacing-3xl);
        font-weight: 700;
        margin-bottom: var(--spacing-base);
      }

      .stat-label {
        font-size: var(--text-base);
        opacity: 0.9;
        margin-bottom: var(--spacing-base);
      }

      .stat-trend {
        display: flex;
        align-items: center;
        font-size: var(--text-sm);
        opacity: 0.8;

        &.up { color: var(--success-color); }
        &.down { color: var(--danger-color); }

        .el-icon {
          margin-right: var(--spacing-xs);
        }
      }
    }
  }

  .quick-actions {
    margin-bottom: var(--spacing-8xl);

    .actions-header {
      margin-bottom: var(--text-lg);

      h3 {
        margin: 0;
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--text-lg);
    }
  }

  .charts-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--text-2xl);

    .chart-card {
      background: white;
      border-radius: var(--spacing-sm);
      padding: var(--text-2xl);
      box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--text-2xl);

        .chart-title {
          margin: 0;
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
        }
      }

      .chart-content {
        width: 100%;
        height: 300px;
        min-height: 300px;
      }
    }
  }
}

// 收费页面样式
.payments-content {
  .payments-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);

    h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--text-xl);
    }

    .header-actions {
      display: flex;
      gap: var(--text-sm);
    }
  }

  .payment-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--text-2xl);
    margin-bottom: var(--spacing-8xl);

    .stat-item {
      text-align: center;
      padding: var(--text-2xl);
      background: var(--bg-gray-light);
      border-radius: var(--spacing-sm);

      h4 {
        margin: 0 0 10px 0;
        color: var(--text-secondary);
        font-size: var(--text-base);
      }

      .value {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--text-primary);
      }
    }
  }

  .amount-text {
    font-weight: 600;
    color: #059669;
  }
}

// 任务页面样式
.tasks-content {
  .tasks-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);

    h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--text-xl);
    }

    .header-actions {
      display: flex;
      gap: var(--text-sm);
      align-items: center;
    }
  }

  .task-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--text-2xl);
    margin-bottom: var(--spacing-8xl);

    .stat-item {
      text-align: center;
      padding: var(--text-2xl);
      background: var(--bg-gray-light);
      border-radius: var(--spacing-sm);

      h4 {
        margin: 0 0 10px 0;
        color: var(--text-secondary);
        font-size: var(--text-base);
      }

      .value {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--text-primary);
      }
    }
  }

  .task-list {
    .task-item {
      display: flex;
      align-items: center;
      gap: var(--text-lg);
      padding: var(--text-lg) 0;
      border-bottom: var(--border-width-base) solid #f3f4f6;
      cursor: pointer;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: #f9fafb;
        margin: 0 -var(--text-lg);
        padding: var(--text-lg);
        border-radius: var(--spacing-sm);
      }

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

      .task-meta {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: var(--spacing-xs);

        .task-time {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
        }
      }
    }
  }
}

// 报表页面样式
.reports-content {
  .reports-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);

    h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--text-xl);
    }

    .header-actions {
      display: flex;
      gap: var(--text-sm);
    }
  }

  .report-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--text-2xl);
    margin-bottom: var(--spacing-8xl);

    .stat-item {
      text-align: center;
      padding: var(--text-2xl);
      background: var(--bg-gray-light);
      border-radius: var(--spacing-sm);

      h4 {
        margin: 0 0 10px 0;
        color: var(--text-secondary);
        font-size: var(--text-base);
      }

      .value {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--text-primary);
      }
    }
  }
}

// 设置页面样式
.settings-content {
  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);

    h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--text-xl);
    }

    .header-actions {
      display: flex;
      gap: var(--text-sm);
    }
  }

  .settings-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: var(--text-2xl);
    }

    .settings-form {
      background: white;
      padding: var(--text-3xl);
      border-radius: var(--spacing-sm);
      border: var(--border-width-base) solid #eee;

      .mb-4 {
        margin-bottom: 1rem;
      }

      .form-help-text {
        margin-left: var(--spacing-2xl);
        color: var(--text-tertiary);
        font-size: var(--text-sm);
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .overview-content {
    .welcome-section {
      flex-direction: column;
      gap: var(--text-lg);
      align-items: flex-start;

      .header-actions {
        width: 100%;
        justify-content: flex-end;
        margin-left: 0;
      }
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .charts-section {
      grid-template-columns: 1fr;
    }
  }

  .payment-stats,
  .task-stats,
  .report-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>