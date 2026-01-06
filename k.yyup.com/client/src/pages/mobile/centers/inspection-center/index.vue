<template>
  <MobileMainLayout
    title="检查中心"
    :show-back="true"
    @back="handleBack"
  >
    <div class="mobile-inspection-center">
      <!-- 顶部操作按钮 -->
      <div class="action-buttons">
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item @click="handleGenerateYearlyPlan">
            <van-icon name="calendar-o" size="24" />
            <span>生成年度计划</span>
          </van-grid-item>
          <van-grid-item @click="openTimelineEditor">
            <van-icon name="edit" size="24" />
            <span>调整计划时间</span>
          </van-grid-item>
          <van-grid-item @click="handleUploadDocument">
            <van-icon name="description" size="24" />
            <span>上传检查文档</span>
          </van-grid-item>
          <van-grid-item @click="openAIScoring">
            <van-icon name="bulb-o" size="24" />
            <span>AI全园预评分</span>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-section">
        <van-grid :column-num="3" :gutter="12">
          <van-grid-item>
            <div class="stat-card pending">
              <div class="stat-value">{{ stats.pending }}</div>
              <div class="stat-label">待开始</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-card preparing">
              <div class="stat-value">{{ stats.preparing }}</div>
              <div class="stat-label">准备中</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-card in-progress">
              <div class="stat-value">{{ stats.inProgress }}</div>
              <div class="stat-label">进行中</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-card completed">
              <div class="stat-value">{{ stats.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-card templates">
              <div class="stat-value">{{ documentStats.templates }}</div>
              <div class="stat-label">文档模板</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-card instances">
              <div class="stat-value">{{ documentStats.instances }}</div>
              <div class="stat-label">文档实例</div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 逾期提醒 -->
      <van-notice-bar
        v-if="overduePlans.length > 0"
        type="danger"
        :text="`⚠️ 有${overduePlans.length}个检查计划已逾期，请尽快处理`"
        left-icon="warning-o"
        background="#fff2f0"
        color="#ff4d4f"
        class="overdue-notice"
      />

      <!-- 年份选择和视图切换 -->
      <div class="view-controls">
        <van-row justify="space-between" align="center">
          <van-col span="8">
            <van-field
              :model-value="`${selectedYear}年`"
              readonly
              placeholder="选择年份"
              @click="showYearPicker = true"
              right-icon="arrow-down"
            />
            <van-popup v-model:show="showYearPicker" position="bottom">
              <van-picker
                :columns="yearPickerColumns"
                @confirm="onYearConfirm"
                @cancel="showYearPicker = false"
                title="选择年份"
              />
            </van-popup>
          </van-col>
          <van-col span="16">
            <van-tabs v-model:active="viewMode" @change="handleViewModeChange">
              <van-tab title="时间轴" name="timeline" />
              <van-tab title="月度" name="month" />
              <van-tab title="列表" name="list" />
            </van-tabs>
          </van-col>
        </van-row>
      </div>

      <!-- 搜索和筛选 -->
      <div class="search-filter">
        <van-search
          v-model="searchKeyword"
          placeholder="搜索检查类型、部门..."
          @search="handleSearch"
          @clear="handleSearch"
        />
        <van-row gutter="8">
          <van-col span="6" v-for="status in statusFilters" :key="status.value">
            <van-button
              :type="statusFilter === status.value ? 'primary' : 'default'"
              size="small"
              @click="handleStatusFilter(status.value)"
              block
            >
              {{ status.label }}
            </van-button>
          </van-col>
        </van-row>
      </div>

      <!-- 时间轴视图 -->
      <div v-if="viewMode === 'timeline'" class="timeline-view">
        <van-loading v-if="timelineLoading" type="spinner" />
        <div v-else-if="filteredPlans.length === 0" class="empty-state">
          <van-empty description="暂无检查计划" />
        </div>
        <div v-else class="timeline-content">
          <div v-for="month in groupedPlans" :key="month.month" class="month-group">
            <div class="month-header" @click="toggleMonth(month.month)">
              <van-icon :name="expandedMonths.includes(month.month) ? 'arrow-up' : 'arrow-down'" />
              <span>{{ month.monthName }}</span>
              <van-tag type="primary" size="small">{{ month.plans.length }}</van-tag>
            </div>
            <div v-if="expandedMonths.includes(month.month)" class="plans-list">
              <div
                v-for="plan in month.plans"
                :key="plan.id"
                class="plan-item"
                @click="handlePlanClick(plan)"
              >
                <div class="plan-info">
                  <div class="plan-type">{{ plan.inspectionType?.name }}</div>
                  <div class="plan-date">{{ formatPlanDate(plan.planDate) }}</div>
                </div>
                <div class="plan-status">
                  <van-tag :type="getStatusTagType(plan.status)" size="small">
                    {{ getStatusLabel(plan.status) }}
                  </van-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 月度视图 -->
      <div v-else-if="viewMode === 'month'" class="month-view">
        <van-calendar
          v-model="calendarDate"
          :show-confirm="false"
          @confirm="onDateConfirm"
        >
          <template #bottom-info="day">
            <div v-if="getPlansForDate(day.date).length > 0" class="date-indicators">
              <van-tag
                v-for="plan in getPlansForDate(day.date)"
                :key="plan.id"
                :type="getPlanBadgeType(plan.status)"
                size="small"
              >
                {{ plan.inspectionType?.name?.substring(0, 4) }}
              </van-tag>
            </div>
          </template>
        </van-calendar>
      </div>

      <!-- 列表视图 -->
      <div v-else class="list-view">
        <van-loading v-if="timelineLoading" type="spinner" />
        <div v-else-if="filteredPlans.length === 0" class="empty-state">
          <van-empty description="暂无检查计划" />
        </div>
        <div v-else class="plans-list">
          <div
            v-for="plan in filteredPlans"
            :key="plan.id"
            class="plan-card"
            @click="handlePlanClick(plan)"
          >
            <div class="plan-header">
              <div class="plan-title">{{ plan.inspectionType?.name }}</div>
              <van-tag :type="getStatusTagType(plan.status)" size="small">
                {{ getStatusLabel(plan.status) }}
              </van-tag>
            </div>
            <div class="plan-details">
              <div class="plan-detail-item">
                <van-icon name="calendar-o" />
                <span>{{ formatPlanDate(plan.planDate) }}</span>
              </div>
              <div class="plan-detail-item" v-if="plan.inspectionType?.department">
                <van-icon name="manager-o" />
                <span>{{ plan.inspectionType.department }}</span>
              </div>
            </div>
            <div class="plan-actions">
              <van-button size="small" @click.stop="handleEditPlan(plan)">编辑</van-button>
              <van-button size="small" type="primary" @click.stop="handleViewPlanDetail(plan)">查看</van-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 文档管理区域 -->
      <div class="document-management">
        <van-divider content-position="left">📄 文档管理</van-divider>

        <div class="doc-actions">
          <van-button type="primary" size="small" @click="handleCreateDocument">
            <van-icon name="plus" /> 创建文档
          </van-button>
          <van-button type="success" size="small" @click="handleAIAnalysis">
            <van-icon name="bulb-o" /> AI分析
          </van-button>
        </div>

        <div class="doc-list">
          <div
            v-for="doc in filteredDocumentInstances"
            :key="doc.id"
            class="doc-card"
          >
            <div class="doc-info">
              <div class="doc-title">{{ doc.title || doc.template?.name }}</div>
              <div class="doc-meta">
                <van-tag :type="getDocumentStatusType(doc.status)" size="small">
                  {{ getDocumentStatusLabel(doc.status) }}
                </van-tag>
                <span class="doc-date">{{ formatDate(doc.createdAt) }}</span>
              </div>
            </div>
            <div class="doc-progress">
              <van-progress
                :percentage="doc.completionRate || 0"
                :color="getProgressColor(doc.completionRate)"
                stroke-width="4"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 底部打印年度报告按钮 -->
      <div class="bottom-actions">
        <van-button type="info" block @click="handlePrintYearlyReport">
          <van-icon name="description" /> 打印年度报告
        </van-button>
      </div>
    </div>

    <!-- 计划详情弹窗 -->
    <van-popup
      v-model:show="showPlanDetail"
      position="bottom"
      :style="{ height: '80%' }"
    >
      <div class="plan-detail-popup">
        <div class="popup-header">
          <van-nav-bar
            :title="currentPlan?.inspectionType?.name"
            left-arrow
            @click-left="showPlanDetail = false"
          >
            <template #right>
              <van-button size="small" type="primary" @click="handleEditPlan(currentPlan)">
                编辑
              </van-button>
            </template>
          </van-nav-bar>
        </div>
        <div class="popup-content" v-if="currentPlan">
          <van-cell-group>
            <van-cell title="检查类型" :value="currentPlan.inspectionType?.name" />
            <van-cell title="计划日期" :value="formatPlanDate(currentPlan.planDate)" />
            <van-cell title="状态">
              <template #value>
                <van-tag :type="getStatusTagType(currentPlan.status)">
                  {{ getStatusLabel(currentPlan.status) }}
                </van-tag>
              </template>
            </van-cell>
            <van-cell title="部门" :value="currentPlan.inspectionType?.department" />
            <van-cell title="备注" :label="currentPlan.notes" />
          </van-cell-group>
        </div>
      </div>
    </van-popup>

    <!-- AI分析结果弹窗 -->
    <van-popup
      v-model:show="showAIAnalysisDialog"
      position="bottom"
      :style="{ height: '90%' }"
    >
      <div class="ai-analysis-popup">
        <div class="popup-header">
          <van-nav-bar
            title="📊 检查计划AI分析报告"
            left-arrow
            @click-left="showAIAnalysisDialog = false"
          />
        </div>
        <div class="popup-content" v-if="aiAnalysisResult">
          <van-cell-group title="分析统计">
            <van-cell title="总计划数" :value="aiAnalysisResult.planCount" />
            <van-cell title="分析时间" :value="new Date().toLocaleString()" />
          </van-cell-group>

          <van-cell-group title="📈 评分分析">
            <div class="score-cards">
              <div class="score-card">
                <div class="score-title">时间分布</div>
                <div class="score-value">{{ aiAnalysisResult.analysis?.timeDistribution?.score || 0 }}</div>
                <div class="score-desc">{{ aiAnalysisResult.analysis?.timeDistribution?.description }}</div>
              </div>
              <div class="score-card">
                <div class="score-title">检查频率</div>
                <div class="score-value">{{ aiAnalysisResult.analysis?.frequency?.score || 0 }}</div>
                <div class="score-desc">{{ aiAnalysisResult.analysis?.frequency?.description }}</div>
              </div>
              <div class="score-card">
                <div class="score-title">资源配置</div>
                <div class="score-value">{{ aiAnalysisResult.analysis?.resourceAllocation?.score || 0 }}</div>
                <div class="score-desc">{{ aiAnalysisResult.analysis?.resourceAllocation?.description }}</div>
              </div>
            </div>
          </van-cell-group>

          <van-cell-group title="💡 优化建议">
            <div class="suggestions">
              <div
                v-for="(recommendation, index) in aiAnalysisResult.analysis?.recommendations || []"
                :key="index"
                class="suggestion-item"
              >
                <van-icon name="check" color="#07c160" />
                <span>{{ recommendation }}</span>
              </div>
            </div>
          </van-cell-group>

          <van-cell-group title="⚠️ 风险提示">
            <div class="risks">
              <van-notice-bar
                v-for="(risk, index) in aiAnalysisResult.analysis?.risks || []"
                :key="index"
                :text="risk"
                type="warning"
                background="#fffbe6"
                color="#d48806"
                class="risk-item"
              />
            </div>
          </van-cell-group>
        </div>
      </div>
    </van-popup>

    <!-- AI预评分弹窗 -->
    <AIScoringDialog
      v-model="aiScoringVisible"
      :last-scoring-time="lastScoringTime"
      @scoring-completed="handleScoringCompleted"
    />
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import AIScoringDialog from './components/AIScoringDialog.vue'
import {
  inspectionPlanApi,
  InspectionPlan,
  InspectionPlanStatus,
  InspectionCategory
} from '@/api/endpoints/inspection'
import { request } from '@/utils/request'
import { useUserStore } from '@/stores/user'

// 组合式API
const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const selectedYear = ref(new Date().getFullYear())
const viewMode = ref<'timeline' | 'month' | 'list'>('timeline')
const calendarDate = ref(new Date())
const timelinePlans = ref<InspectionPlan[]>([])
const allPlans = ref<InspectionPlan[]>([])
const timelineLoading = ref(false)
const statusFilter = ref<string>('all')
const searchKeyword = ref('')
const showYearPicker = ref(false)
const expandedMonths = ref<string[]>([])
const aiScoringVisible = ref(false)
const lastScoringTime = ref<string>()

// 统计数据
const stats = reactive({
  pending: 0,
  preparing: 0,
  inProgress: 0,
  completed: 0
})

// 文档统计数据
const documentStats = reactive({
  templates: 0,
  instances: 0
})

// 文档管理相关数据
const documentInstances = ref<any[]>([])
const templatesLoading = ref(false)
const documentsLoading = ref(false)

// AI功能相关数据
const aiAnalysisLoading = ref(false)
const aiAnalysisResult = ref<any>(null)
const showAIAnalysisDialog = ref(false)

// 弹窗状态
const showPlanDetail = ref(false)
const currentPlan = ref<InspectionPlan | null>(null)

// 状态筛选器
const statusFilters = [
  { label: '全部', value: 'all' },
  { label: '待开始', value: 'pending' },
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'completed' }
]

// 年份选择器列
const yearPickerColumns = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => ({
    text: `${currentYear - 2 + i}年`,
    value: currentYear - 2 + i
  }))
})

// 逾期检查计划
const overduePlans = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return allPlans.value.filter(plan => {
    if (plan.status === 'completed') return false
    const planDate = new Date(plan.planDate)
    planDate.setHours(0, 0, 0, 0)
    return planDate < today
  })
})

// 筛选后的计划
const filteredPlans = computed(() => {
  let plans = allPlans.value

  // 按状态筛选
  if (statusFilter.value !== 'all') {
    plans = plans.filter(plan => plan.status === statusFilter.value)
  }

  // 按搜索关键词筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    plans = plans.filter(plan =>
      plan.inspectionType?.name?.toLowerCase().includes(keyword) ||
      plan.inspectionType?.department?.toLowerCase().includes(keyword) ||
      plan.notes?.toLowerCase().includes(keyword)
    )
  }

  return plans
})

// 按月份分组的计划
const groupedPlans = computed(() => {
  const plans = filteredPlans.value
  const groups: { [key: string]: { month: string; monthName: string; plans: InspectionPlan[] } } = {}

  plans.forEach(plan => {
    const date = new Date(plan.planDate)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = `${date.getFullYear()}年${date.getMonth() + 1}月`

    if (!groups[monthKey]) {
      groups[monthKey] = { month: monthKey, monthName, plans: [] }
    }
    groups[monthKey].plans.push(plan)
  })

  return Object.values(groups).sort((a, b) => a.month.localeCompare(b.month))
})

// 过滤后的文档实例
const filteredDocumentInstances = computed(() => {
  return documentInstances.value.filter(instance =>
    instance.title || instance.template?.name
  )
})

// 获取幼儿园ID
const getKindergartenId = (): number => {
  if (userStore.userInfo?.kindergartenId) {
    return userStore.userInfo.kindergartenId
  }

  try {
    const userInfo = JSON.parse(localStorage.getItem('kindergarten_user_info') || '{}')
    if (userInfo.kindergartenId) {
      return userInfo.kindergartenId
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }

  console.warn('未找到kindergartenId，使用默认值1')
  return 1
}

// 加载Timeline数据
const loadTimeline = async () => {
  try {
    timelineLoading.value = true
    const kindergartenId = getKindergartenId()
    const res = await inspectionPlanApi.getTimeline({
      kindergartenId,
      year: selectedYear.value
    })

    if (res.success) {
      allPlans.value = res.data
      timelinePlans.value = res.data
      updateStats()

      // 重置筛选
      statusFilter.value = 'all'
      searchKeyword.value = ''
    }
  } catch (error) {
    console.error('加载Timeline失败:', error)
    showToast('加载检查计划失败')
  } finally {
    timelineLoading.value = false
  }
}

// 更新统计数据
const updateStats = () => {
  stats.pending = allPlans.value.filter(p => p.status === InspectionPlanStatus.PENDING).length
  stats.preparing = allPlans.value.filter(p => p.status === InspectionPlanStatus.PREPARING).length
  stats.inProgress = allPlans.value.filter(p => p.status === InspectionPlanStatus.IN_PROGRESS).length
  stats.completed = allPlans.value.filter(p => p.status === InspectionPlanStatus.COMPLETED).length
}

// 年份确认
const onYearConfirm = ({ selectedValues }: any) => {
  selectedYear.value = selectedValues[0]
  showYearPicker.value = false
  loadTimeline()
}

// 日期确认
const onDateConfirm = (date: Date) => {
  calendarDate.value = date
}

// 视图模式切换
const handleViewModeChange = () => {
  // 视图切换逻辑
}

// 状态筛选
const handleStatusFilter = (status: string) => {
  statusFilter.value = status
}

// 搜索
const handleSearch = () => {
  // 搜索逻辑已在计算属性中实现
}

// 切换月份展开状态
const toggleMonth = (month: string) => {
  const index = expandedMonths.value.indexOf(month)
  if (index > -1) {
    expandedMonths.value.splice(index, 1)
  } else {
    expandedMonths.value.push(month)
  }
}

// 获取指定日期的计划
const getPlansForDate = (date: Date) => {
  const dateStr = date.toISOString().split('T')[0]
  return filteredPlans.value.filter(plan => plan.planDate === dateStr)
}

// 处理计划点击
const handlePlanClick = (plan: InspectionPlan) => {
  currentPlan.value = plan
  showPlanDetail.value = true
}

// 处理编辑计划
const handleEditPlan = (plan: InspectionPlan) => {
  showToast(`编辑计划: ${plan.inspectionType?.name}`)
  // TODO: 打开编辑对话框
}

// 处理查看计划详情
const handleViewPlanDetail = (plan: InspectionPlan) => {
  currentPlan.value = plan
  showPlanDetail.value = true
}

// 处理生成年度计划
const handleGenerateYearlyPlan = async () => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要生成年度检查计划吗？',
    })

    const kindergartenId = getKindergartenId()
    await inspectionPlanApi.generateYearly({
      kindergartenId,
      year: selectedYear.value,
      cityLevel: 'tier1' as any
    })
    showToast('年度计划生成成功')
    loadTimeline()
  } catch (error) {
    // 用户取消或发生错误
  }
}

// 打开时间编辑器
const openTimelineEditor = () => {
  if (allPlans.value.length === 0) {
    showToast('当前没有检查计划，请先生成年度计划')
    return
  }
  showToast('时间编辑器开发中...')
}

// 打开AI预评分
const openAIScoring = () => {
  aiScoringVisible.value = true
}

// AI评分完成处理
const handleScoringCompleted = (result: any) => {
  console.log('AI评分完成:', result)
  // 可以在这里处理评分结果，比如保存到本地或刷新页面数据
  showToast('AI评分分析已完成')
}

// 处理上传文档
const handleUploadDocument = () => {
  showToast('文档上传功能开发中...')
}

// 处理创建文档
const handleCreateDocument = () => {
  showToast('创建文档功能开发中...')
}

// 处理AI分析
const handleAIAnalysis = async () => {
  try {
    aiAnalysisLoading.value = true

    const response = await request.post('/inspection-ai/plan-analysis', {
      year: selectedYear.value,
      plans: timelinePlans.value
    }, {
      timeout: 60000
    })

    if (response.success) {
      let analysisData = response.data.analysis

      if (typeof analysisData === 'string') {
        try {
          analysisData = JSON.parse(analysisData)
        } catch (e) {
          showToast('AI分析结果格式错误')
          return
        }
      }

      if (!analysisData) {
        showToast('AI分析结果为空')
        return
      }

      aiAnalysisResult.value = {
        analysis: analysisData,
        modelUsed: response.data.modelUsed || '未知模型',
        planCount: response.data.planCount || 0
      }

      showAIAnalysisDialog.value = true
      showToast('AI分析完成')
    } else {
      showToast(response.message || 'AI分析失败')
    }
  } catch (error: any) {
    console.error('AI分析失败:', error)
    showToast(error.response?.data?.message || 'AI分析失败，请稍后重试')
  } finally {
    aiAnalysisLoading.value = false
  }
}

// 处理打印年度报告
const handlePrintYearlyReport = () => {
  showToast('打印年度报告功能开发中...')
}

// 加载文档实例
const loadDocumentInstances = async () => {
  try {
    documentsLoading.value = true
    const response = await request.get('/document-instances', {
      params: { pageSize: 100 }
    })
    if (response.success) {
      documentInstances.value = response.data.items || []
      documentStats.instances = response.data.total || 0
    }
  } catch (error) {
    console.error('加载文档实例失败:', error)
  } finally {
    documentsLoading.value = false
  }
}

// 返回处理
const handleBack = () => {
  router.back()
}

// 辅助函数
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待开始',
    preparing: '准备中',
    in_progress: '进行中',
    completed: '已完成',
    overdue: '已逾期'
  }
  return labels[status] || status
}

const getStatusTagType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'default',
    preparing: 'warning',
    in_progress: 'primary',
    completed: 'success',
    overdue: 'danger'
  }
  return types[status] || 'default'
}

const getPlanBadgeType = (status: string) => {
  return getStatusTagType(status)
}

const getDocumentStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'draft': 'default',
    'pending_review': 'warning',
    'approved': 'success'
  }
  return statusMap[status] || 'default'
}

const getDocumentStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    'draft': '草稿',
    'pending_review': '待审核',
    'approved': '已审核'
  }
  return statusMap[status] || status
}

const getProgressColor = (percentage: number) => {
  if (percentage >= 80) return '#07c160'
  if (percentage >= 50) return '#ff976a'
  return '#ee0a24'
}

const formatPlanDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

// 初始化
onMounted(() => {
  loadTimeline()
  loadDocumentInstances()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';
.mobile-inspection-center {
  padding: var(--van-padding-md);
  background: var(--van-background-color-light);
  min-height: calc(100vh - var(--van-nav-bar-height));

  .action-buttons {
    margin-bottom: var(--van-padding-lg);

    :deep(.van-grid-item__content) {
      background: var(--card-bg);
      border-radius: var(--van-radius-md);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      flex-direction: column;
      padding: var(--van-padding-md);

      .van-icon {
        margin-bottom: var(--van-padding-xs);
        color: var(--van-primary-color);
      }

      span {
        font-size: var(--van-font-size-md);
        color: var(--van-text-color);
      }
    }
  }

  .stats-section {
    margin-bottom: var(--van-padding-lg);

    .stat-card {
      text-align: center;
      padding: var(--van-padding-md);
      border-radius: var(--van-radius-md);

      .stat-value {
        font-size: var(--van-font-size-xl);
        font-weight: bold;
        margin-bottom: var(--van-padding-xs);
      }

      .stat-label {
        font-size: var(--van-font-size-sm);
        opacity: 0.7;
      }

      &.pending {
        background: linear-gradient(135deg, #e6f7ff, #bae7ff);
        color: #1890ff;
      }

      &.preparing {
        background: linear-gradient(135deg, #fff7e6, #ffd591);
        color: #fa8c16;
      }

      &.in-progress {
        background: linear-gradient(135deg, #f6ffed, #b7eb8f);
        color: #52c41a;
      }

      &.completed {
        background: linear-gradient(135deg, #fff1f0, #ffccc7);
        color: #ff4d4f;
      }

      &.templates {
        background: linear-gradient(135deg, #f9f0ff, #d3adf7);
        color: #722ed1;
      }

      &.instances {
        background: linear-gradient(135deg, #fff0f6, #ffadd2);
        color: #eb2f96;
      }
    }
  }

  .overdue-notice {
    margin-bottom: var(--van-padding-lg);
    border-radius: var(--van-radius-md);
  }

  .view-controls {
    margin-bottom: var(--van-padding-lg);
    background: var(--card-bg);
    padding: var(--van-padding-md);
    border-radius: var(--van-radius-md);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .search-filter {
    margin-bottom: var(--van-padding-lg);

    .van-search {
      margin-bottom: var(--van-padding-sm);
    }
  }

  .timeline-view,
  .month-view,
  .list-view {
    background: var(--card-bg);
    border-radius: var(--van-radius-md);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .empty-state {
      padding: var(--van-padding-xl);
      text-align: center;
    }
  }

  .timeline-view {
    .timeline-content {
      padding: var(--van-padding-md);
    }

    .month-group {
      margin-bottom: var(--van-padding-md);

      .month-header {
        display: flex;
        align-items: center;
        padding: var(--van-padding-sm);
        background: var(--van-gray-1);
        border-radius: var(--van-radius-sm);
        margin-bottom: var(--van-padding-xs);

        .van-icon {
          margin-right: var(--van-padding-xs);
        }

        span {
          flex: 1;
          font-weight: bold;
        }
      }

      .plans-list {
        .plan-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--van-padding-sm);
          border-bottom: 1px solid var(--van-border-color);

          &:last-child {
            border-bottom: none;
          }

          .plan-info {
            .plan-type {
              font-weight: bold;
              margin-bottom: var(--van-padding-xs);
            }

            .plan-date {
              font-size: var(--van-font-size-sm);
              color: var(--van-text-color-2);
            }
          }
        }
      }
    }
  }

  .list-view {
    .plans-list {
      padding: var(--van-padding-md);

      .plan-card {
        background: var(--van-background-color-light);
        padding: var(--van-padding-md);
        border-radius: var(--van-radius-md);
        margin-bottom: var(--van-padding-sm);
        border: 1px solid var(--van-border-color);

        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--van-padding-sm);

          .plan-title {
            font-weight: bold;
            flex: 1;
          }
        }

        .plan-details {
          margin-bottom: var(--van-padding-sm);

          .plan-detail-item {
            display: flex;
            align-items: center;
            margin-bottom: var(--van-padding-xs);
            font-size: var(--van-font-size-sm);

            .van-icon {
              margin-right: var(--van-padding-xs);
              color: var(--van-text-color-2);
            }
          }
        }

        .plan-actions {
          display: flex;
          gap: var(--van-padding-sm);
        }
      }
    }
  }

  .month-view {
    .date-indicators {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-top: 2px;
    }
  }

  .document-management {
    margin: var(--van-padding-lg) 0;

    .doc-actions {
      display: flex;
      gap: var(--van-padding-sm);
      margin-bottom: var(--van-padding-md);
    }

    .doc-list {
      .doc-card {
        background: var(--card-bg);
        padding: var(--van-padding-md);
        border-radius: var(--van-radius-md);
        margin-bottom: var(--van-padding-sm);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .doc-info {
          margin-bottom: var(--van-padding-sm);

          .doc-title {
            font-weight: bold;
            margin-bottom: var(--van-padding-xs);
          }

          .doc-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: var(--van-font-size-sm);

            .doc-date {
              color: var(--van-text-color-2);
            }
          }
        }

        .doc-progress {
          margin-top: var(--van-padding-sm);
        }
      }
    }
  }

  .bottom-actions {
    margin-top: var(--van-padding-lg);
    padding: var(--van-padding-md);
  }
}

// 弹窗样式
.plan-detail-popup,
.ai-analysis-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .popup-header {
    flex-shrink: 0;
  }

  .popup-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--van-padding-md);
  }
}

.ai-analysis-popup {
  .score-cards {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--van-padding-md);
    padding: var(--van-padding-md);

    .score-card {
      background: var(--van-gray-1);
      padding: var(--van-padding-md);
      border-radius: var(--van-radius-md);
      text-align: center;

      .score-title {
        font-weight: bold;
        margin-bottom: var(--van-padding-xs);
      }

      .score-value {
        font-size: var(--van-font-size-xl);
        font-weight: bold;
        color: var(--van-primary-color);
        margin-bottom: var(--van-padding-xs);
      }

      .score-desc {
        font-size: var(--van-font-size-sm);
        color: var(--van-text-color-2);
      }
    }
  }

  .suggestions {
    padding: var(--van-padding-md);

    .suggestion-item {
      display: flex;
      align-items: center;
      margin-bottom: var(--van-padding-sm);

      .van-icon {
        margin-right: var(--van-padding-xs);
      }
    }
  }

  .risks {
    padding: var(--van-padding-md);

    .risk-item {
      margin-bottom: var(--van-padding-sm);
    }
  }
}
</style>