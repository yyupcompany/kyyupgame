<template>
  <UnifiedCenterLayout
      title="招商中心"
      description="管理合作伙伴、渠道推广和商业机会"
      :icon="TrendCharts">
    <div class="business-center-content">
    <!-- 快捷表单对话框 -->
    <QuickActionDialog
      v-model:visible="quickDialogVisible"
      :title="quickDialogTitle"
      :fields="quickDialogFields"
      :on-submit="handleQuickSubmit"
      @success="handleQuickSuccess"
    />

    <!-- 左侧Timeline区域 (1/3屏幕) -->
    <div class="timeline-section">
      <div class="timeline-header">
        <h3>业务流程中心</h3>
        <p>全流程业务管理与监控</p>
      </div>
      
      <div class="timeline-container" v-loading="loading">
        <div
          v-for="(item, index) in timelineItems"
          :key="item.id"
          class="timeline-item"
          :class="{
            'active': selectedItem?.id === item.id,
            'completed': item.status === 'completed',
            'in-progress': item.status === 'in-progress',
            'pending': item.status === 'pending'
          }"
          @click="selectTimelineItem(item)"
        >
          <div class="timeline-marker">
            <div class="timeline-dot">
              <div class="dot-inner">
                <UnifiedIcon :name="convertIconName(item.icon)" :size="16" />
              </div>
            </div>
            <div class="timeline-line" v-if="index < timelineItems.length - 1"></div>
          </div>
          
          <div class="timeline-content">
            <div class="timeline-header-info">
              <span class="timeline-title">{{ item.title }}</span>
              <span class="timeline-status-tag" :class="item.status">
                {{ getStatusText(item.status) }}
              </span>
            </div>
            <div class="timeline-description">{{ item.description }}</div>
            <div class="timeline-footer-info">
              <div class="progress-info">
                <div class="progress-bar-mini">
                  <div class="progress-fill" :style="{ width: item.progress + '%' }"></div>
                </div>
                <span class="progress-text">{{ item.progress }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧内容区域 (2/3屏幕) -->
    <div class="content-section">
      <!-- 招生进度条区域 -->
      <div class="enrollment-progress-section">
        <div class="progress-header">
          <h4>招生进度总览</h4>
          <div class="progress-stats">
            <span>目标: {{ enrollmentTarget > 0 ? enrollmentTarget + '人' : '未设置' }}</span>
            <span>已招: {{ enrollmentCurrent }}人</span>
            <span>完成率: {{ enrollmentTarget > 0 ? enrollmentPercentage + '%' : '未设置' }}</span>
          </div>
        </div>
        
        <div class="progress-container">
          <el-progress
            :percentage="enrollmentPercentage"
            :stroke-width="20"
            :show-text="false"
            class="enrollment-progress"
          />
          <div class="progress-milestones">
            <div
              v-for="milestone in enrollmentMilestones"
              :key="milestone.id"
              class="milestone"
              :style="{ left: milestone.position + '%' }"
            >
              <div class="milestone-marker"></div>
              <div class="milestone-label">{{ milestone.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 详情展示区域 -->
      <div class="detail-section">
        <div v-if="!selectedItem" class="detail-placeholder">
          <div class="placeholder-content">
            <UnifiedIcon name="arrow-right" :size="48" />
            <h4>选择左侧业务流程</h4>
            <p>点击左侧时间线中的任意业务流程，查看详细信息和操作选项</p>
          </div>
        </div>

        <div v-else class="detail-content">
          <div class="detail-header">
            <div class="detail-title">
              <UnifiedIcon :name="convertIconName(selectedItem.icon)" :size="24" />
              <h4>{{ selectedItem.title }}</h4>
              <el-button type="primary" size="small" @click="handleEditAction()" class="edit-button">
                <UnifiedIcon name="edit" :size="14" />
                编辑
              </el-button>
            </div>
          </div>

          <div class="detail-body">
            <!-- 基础信息 -->
            <div class="detail-section-item">
              <h5>基础信息</h5>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">状态:</span>
                  <span class="info-value" :class="selectedItem.status">
                    {{ getStatusText(selectedItem.status) }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-label">负责人:</span>
                  <span class="info-value">{{ selectedItem.assignee || '未分配' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">截止时间:</span>
                  <span class="info-value">{{ selectedItem.deadline || '无限制' }}</span>
                </div>
              </div>
            </div>

            <!-- 详细描述 -->
            <div class="detail-section-item">
              <h5>详细描述</h5>
              <p class="detail-description">{{ selectedItem.detailDescription }}</p>
            </div>

            <!-- 关键指标 -->
            <div class="detail-section-item" v-if="selectedItem.metrics">
              <h5>关键指标</h5>
              <div class="metrics-grid">
                <div 
                  v-for="metric in selectedItem.metrics" 
                  :key="metric.key"
                  class="metric-card"
                >
                  <div class="metric-value">{{ metric.value }}</div>
                  <div class="metric-label">{{ metric.label }}</div>
                </div>
              </div>
            </div>

            <!-- 快捷操作区域 -->
            <div class="detail-section-item quick-actions-section">
              <h5>
                <UnifiedIcon name="activity" :size="18" class="margin-custom style-custom" />
                快捷操作
              </h5>
              <div class="quick-actions-grid">
                <div
                  v-for="action in getQuickActions(selectedItem.title)"
                  :key="action.key"
                  class="quick-action-card"
                  :class="[`quick-action-card--${action.type || 'primary'}`]"
                  @click="handleQuickAction(action)"
                >
                  <div class="action-icon-wrapper">
                    <UnifiedIcon :name="convertIconName(action.lucideIcon)" :size="20" />
                  </div>
                  <div class="action-info">
                    <span class="action-label">{{ action.label }}</span>
                  </div>
                  <div class="action-arrow">
                    <UnifiedIcon name="arrow-right" :size="14" />
                  </div>
                </div>
              </div>
              <div class="quick-actions-tip">
                <UnifiedIcon name="view" :size="14" />
                <span>在此快速创建数据，无需跳转到其他页面</span>
              </div>
            </div>

            <!-- 操作历史 -->
            <div class="detail-section-item">
              <h5>最近操作</h5>
              <div class="operation-list">
                <div
                  v-for="operation in selectedItem.recentOperations || []"
                  :key="operation.id"
                  class="operation-item"
                >
                  <div class="operation-time">{{ operation.time }}</div>
                  <div class="operation-content">{{ operation.content }}</div>
                  <div class="operation-user">{{ operation.user }}</div>
                </div>
                <div v-if="!selectedItem.recentOperations?.length" class="no-operations">
                  暂无操作记录
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="drawerTitle"
      direction="rtl"
      size="60%"
      :before-close="handleDrawerClose"
      class="business-drawer"
    >
      <div class="drawer-content">
        <!-- 抽屉头部信息 -->
        <div class="drawer-header">
          <div class="drawer-item-info">
            <div class="item-icon">
              <UnifiedIcon :name="convertIconName(selectedItem?.icon || 'settings')" :size="32" />
            </div>
            <div class="item-details">
              <h3>{{ selectedItem?.title }}</h3>
              <p>{{ selectedItem?.description }}</p>
              <div class="item-meta">
                <el-tag :type="getStatusTagType(selectedItem?.status)">
                  {{ getStatusText(selectedItem?.status || '') }}
                </el-tag>
                <span class="progress-text">进度: {{ selectedItem?.progress }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 嵌入的中心页面内容 -->
        <div class="drawer-body">
          <div class="embedded-content-container">
            <component
              v-if="currentCenterComponent"
              :is="currentCenterComponent"
              :drawer-mode="true"
              class="center-content"
            />
            <div v-else class="loading-placeholder">
              <UnifiedIcon name="default" />
              <p>正在加载内容...</p>
            </div>
          </div>
        </div>

        <!-- 抽屉底部操作 -->
        <div class="drawer-footer">
          <el-button @click="handleDrawerClose">关闭</el-button>
          <el-button type="primary" @click="handleDrawerRefresh">
            刷新页面
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading, TrendCharts } from '@element-plus/icons-vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import QuickActionDialog from '@/components/business-center/QuickActionDialog.vue'
import { BusinessCenterService, type TimelineItem, type EnrollmentProgress } from '@/api/modules/business-center'
import { request } from '@/utils/request'
import {
  ENROLLMENT_PLAN_ENDPOINTS,
  ENROLLMENT_CONSULTATION_ENDPOINTS,
  ENROLLMENT_APPLICATION_ENDPOINTS
} from '@/api/endpoints/enrollment'
import { ACTIVITY_ENDPOINTS, ACTIVITY_REGISTRATION_ENDPOINTS } from '@/api/endpoints/activity'
import { USER_ENDPOINTS } from '@/api/endpoints/user'
import { useUserStore } from '@/stores/user'

// 路由
const router = useRouter()

// 图标名称转换函数 - 将Lucide图标名称转换为UnifiedIcon支持的名称
const convertIconName = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    // LucideIcon -> UnifiedIcon 映射
    'Calendar': 'calendar',
    'FileText': 'book',
    'Image': 'activity',
    'Send': 'message',
    'Users': 'users',
    'Eye': 'view',
    'Share2': 'users',
    'CheckCircle': 'check',
    'Star': 'activity',
    'Award': 'activity',
    'TrendingUp': 'trend-charts',
    'BarChart': 'analytics',
    'Plus': 'plus',
    'Sparkles': 'activity',
    'Palette': 'edit',
    'DollarSign': 'analytics',
    'FileCode': 'edit',
    'DocumentCopy': 'copy',
    'Settings': 'settings',
    'Bell': 'message',
    'Edit': 'edit',
    'FileQuestion': 'help',
    'MessageSquare': 'message',
    'Download': 'download',
    'ArrowRight': 'arrow-right',
    'Home': 'home',
    'Dashboard': 'dashboard',
    'Phone': 'phone',
    'Mail': 'message',
    'User': 'user',
    'Search': 'search',
    'Menu': 'menu',
    'X': 'close',
    'Check': 'check',
    'Minus': 'delete',
    'ChevronDown': 'chevron-down',
    'ChevronUp': 'chevron-up',
    'ChevronLeft': 'chevron-left',
    'ChevronRight': 'chevron-right',
    'MousePointer': 'arrow-right',
    'Zap': 'activity',
    'Info': 'view'
  }
  return iconMap[iconName] || iconName
}

// 业务中心图标映射（类似活动中心的 activityIconMap）
const businessIconMap: Record<string, string> = {
  'enrollment-plan': 'book',           // 招生计划
  'personnel-info': 'users',           // 人员基础信息
  'activity-plan': 'activity',         // 活动计划
  'media-plan': 'view',                // 媒体计划
  'task-assignment': 'check',          // 任务分配
  'teaching-center': 'analytics',      // 教学中心
  'finance-income': 'trend-charts'     // 财务收入
}

// 招生里程碑接口
interface EnrollmentMilestone {
  id: string
  label: string
  position: number
  target: number
}

// 选中的时间线项目
const selectedItem = ref<TimelineItem | null>(null)

// 加载状态
const loading = ref(false)

// ✅ 招生数据 - 移除硬编码初始值，完全依赖后端API返回
const enrollmentTarget = ref(0)
const enrollmentCurrent = ref(0)
const enrollmentPercentage = computed(() => {
  // 处理除以0的情况
  if (enrollmentTarget.value === 0) {
    return 0 // 当目标为0时，显示0%
  }
  // 计算百分比并限制在0-100之间
  const percentage = Math.round((enrollmentCurrent.value / enrollmentTarget.value) * 100)
  return Math.min(100, Math.max(0, percentage))
})

// 招生里程碑
const enrollmentMilestones = ref<EnrollmentMilestone[]>([
  { id: '1', label: '25%', position: 25, target: 125 },
  { id: '2', label: '50%', position: 50, target: 250 },
  { id: '3', label: '75%', position: 75, target: 375 },
  { id: '4', label: '100%', position: 100, target: 500 }
])

// 时间线数据
const timelineItems = ref<TimelineItem[]>([])



// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap = {
    'completed': '已完成',
    'in-progress': '进行中',
    'pending': '待开始'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

// 选择时间线项目
const selectTimelineItem = (item: TimelineItem) => {
  selectedItem.value = item
}

// 抽屉相关状态
const drawerVisible = ref(false)
const currentCenterComponent = ref(null)
const drawerTitle = computed(() => {
  if (!selectedItem.value) return ''
  return `编辑 ${selectedItem.value.title}`
})

// 获取状态标签类型
const getStatusTagType = (status?: string) => {
  const typeMap = {
    'completed': 'success',
    'in-progress': 'warning',
    'pending': 'info'
  }
  return typeMap[status as keyof typeof typeMap] || 'info'
}

// 获取对应的中心组件
const getCenterComponent = async (title: string) => {
  const componentMap: Record<string, () => Promise<any>> = {
    '基础中心': () => import('./SystemCenter.vue'),
    '人员基础信息': () => import('./PersonnelCenter.vue'),
    '招生计划': () => import('./EnrollmentCenter.vue'),
    '活动计划': () => import('./ActivityCenter.vue'),
    '媒体计划': () => import('../principal/MediaCenter.vue'),
    '任务分配': () => import('./TaskCenter.vue'),
    '教学中心': () => import('./TeachingCenter.vue'),
    '财务收入': () => import('./FinanceCenter.vue')
  }

  const importFn = componentMap[title]
  if (importFn) {
    try {
      const module = await importFn()
      return module.default
    } catch (error) {
      console.error(`Failed to load component for ${title}:`, error)
      return null
    }
  }

  return null
}

// 处理编辑操作
const handleEditAction = async () => {
  if (!selectedItem.value) return

  try {
    // 动态加载对应的中心组件
    const component = await getCenterComponent(selectedItem.value.title)
    if (component) {
      currentCenterComponent.value = component
      drawerVisible.value = true
      console.log(`🎯 打开编辑抽屉: ${selectedItem.value.title}`)
    } else {
      ElMessage.error(`无法加载 ${selectedItem.value.title} 的内容`)
    }
  } catch (error) {
    console.error('Failed to load center component:', error)
    ElMessage.error('加载页面内容失败')
  }
}

// 处理抽屉关闭
const handleDrawerClose = () => {
  drawerVisible.value = false
  currentCenterComponent.value = null
}

// 处理抽屉刷新
const handleDrawerRefresh = async () => {
  if (selectedItem.value) {
    try {
      // 重新加载组件
      const component = await getCenterComponent(selectedItem.value.title)
      if (component) {
        currentCenterComponent.value = null
        await nextTick()
        currentCenterComponent.value = component
        ElMessage.success('内容已刷新')
      }
    } catch (error) {
      console.error('Failed to refresh component:', error)
      ElMessage.error('刷新失败')
    }
  }
}

// 快捷操作配置
interface QuickAction {
  key: string
  label: string
  lucideIcon: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  route?: string
  action?: string
}

// 获取快捷操作列表
const getQuickActions = (centerTitle: string): QuickAction[] => {
  const actionsMap: Record<string, QuickAction[]> = {
    '基础中心': [
      { key: 'add-kindergarten', label: '新建幼儿园', lucideIcon: 'Building2', type: 'primary', route: '/system/settings' },
      { key: 'system-config', label: '系统配置', lucideIcon: 'Settings', type: 'info', route: '/system/settings' }
    ],
    '人员基础信息': [
      { key: 'add-teacher', label: '新建教师', lucideIcon: 'UserPlus', type: 'primary', action: 'create-teacher' },
      { key: 'add-student', label: '新建学生', lucideIcon: 'GraduationCap', type: 'success', action: 'create-student' },
      { key: 'add-parent', label: '新建家长', lucideIcon: 'Users', type: 'info', action: 'create-parent' }
    ],
    '招生计划': [
      { key: 'add-plan', label: '新建招生计划', lucideIcon: 'FileText', type: 'primary', action: 'create-enrollment-plan' },
      { key: 'add-consultation', label: '新建咨询记录', lucideIcon: 'MessageSquare', type: 'success', action: 'create-consultation' },
      { key: 'add-application', label: '新建入学申请', lucideIcon: 'ClipboardCheck', type: 'info', action: 'create-application' }
    ],
    '活动计划': [
      { key: 'add-activity', label: '新建活动', lucideIcon: 'Calendar', type: 'primary', action: 'create-activity' },
      { key: 'add-registration', label: '新建报名', lucideIcon: 'UserCheck', type: 'success', action: 'create-registration' },
      { key: 'view-activities', label: '查看所有活动', lucideIcon: 'List', type: 'info', route: '/centers/activity' }
    ],
    '媒体计划': [
      { key: 'add-campaign', label: '新建营销活动', lucideIcon: 'Megaphone', type: 'primary', action: 'create-campaign' },
      { key: 'add-advertisement', label: '新建广告', lucideIcon: 'Image', type: 'success', action: 'create-advertisement' },
      { key: 'view-media', label: '查看媒体中心', lucideIcon: 'Monitor', type: 'info', route: '/centers/media' }
    ],
    '任务分配': [
      { key: 'add-task', label: '新建任务', lucideIcon: 'CheckSquare', type: 'primary', action: 'create-task' },
      { key: 'assign-task', label: '分配任务', lucideIcon: 'UserCog', type: 'success', action: 'assign-task' },
      { key: 'view-tasks', label: '查看所有任务', lucideIcon: 'ListTodo', type: 'info', route: '/centers/task' }
    ],
    '教学中心': [
      { key: 'add-course', label: '新建课程', lucideIcon: 'BookOpen', type: 'primary', action: 'create-course' },
      { key: 'add-assessment', label: '新建评估', lucideIcon: 'ClipboardList', type: 'success', action: 'create-assessment' },
      { key: 'view-teaching', label: '查看教学中心', lucideIcon: 'School', type: 'info', route: '/centers/teaching' }
    ],
    '财务收入': [
      { key: 'add-fee-item', label: '新建收费项', lucideIcon: 'DollarSign', type: 'primary', action: 'create-fee-item' },
      { key: 'add-payment', label: '新建缴费记录', lucideIcon: 'Cvar(--danger-color)itCard', type: 'success', action: 'create-payment' },
      { key: 'view-finance', label: '查看财务中心', lucideIcon: 'Wallet', type: 'info', route: '/centers/finance' }
    ]
  }

  return actionsMap[centerTitle] || []
}

// 快捷表单对话框状态
const quickDialogVisible = ref(false)
const quickDialogTitle = ref('')
const quickDialogFields = ref<any[]>([])
const currentQuickAction = ref<QuickAction | null>(null)

// 处理快捷操作
const handleQuickAction = async (action: QuickAction) => {
  console.log('🚀 执行快捷操作:', action)

  // 如果是路由跳转
  if (action.route) {
    router.push(action.route)
    ElMessage.success(`正在跳转到 ${action.label}`)
    return
  }

  // 如果是操作动作，打开快捷表单对话框
  if (action.action) {
    currentQuickAction.value = action
    quickDialogTitle.value = action.label
    quickDialogFields.value = getFormFieldsForAction(action.action)
    quickDialogVisible.value = true
  }
}

// 根据操作类型获取表单字段配置
const getFormFieldsForAction = (actionType: string) => {
  const fieldsMap: Record<string, any[]> = {
    // 招生计划相关 - 对应EnrollmentPlan模型
    'create-enrollment-plan': [
      { prop: 'title', label: '计划名称', type: 'text', placeholder: '请输入计划名称', required: true },
      { prop: 'year', label: '年份', type: 'number', placeholder: '请输入年份(如2024)', required: true, min: 2020, max: 2030 },
      { prop: 'semester', label: '学期', type: 'select', placeholder: '请选择学期', required: true,
        options: [
          { label: '春季', value: 1 },
          { label: '秋季', value: 2 }
        ]
      },
      { prop: 'targetCount', label: '招生目标人数', type: 'number', placeholder: '请输入招生目标人数', required: true, min: 1 },
      { prop: 'startDate', label: '开始日期', type: 'date', placeholder: '请选择开始日期', required: true },
      { prop: 'endDate', label: '结束日期', type: 'date', placeholder: '请选择结束日期', required: true },
      { prop: 'ageRange', label: '年龄范围', type: 'text', placeholder: '如: 3-6岁', required: true },
      { prop: 'description', label: '计划描述', type: 'textarea', placeholder: '请输入计划描述' }
    ],
    'create-consultation': [
      { prop: 'parentName', label: '家长姓名', type: 'text', placeholder: '请输入家长姓名', required: true },
      { prop: 'phone', label: '联系电话', type: 'text', placeholder: '请输入联系电话', required: true },
      { prop: 'childName', label: '孩子姓名', type: 'text', placeholder: '请输入孩子姓名', required: true },
      { prop: 'childAge', label: '孩子年龄', type: 'number', placeholder: '请输入孩子年龄', required: true, min: 1, max: 10 },
      { prop: 'consultDate', label: '咨询日期', type: 'datetime', placeholder: '请选择咨询日期', required: true },
      { prop: 'notes', label: '咨询备注', type: 'textarea', placeholder: '请输入咨询备注' }
    ],
    'create-application': [
      { prop: 'studentName', label: '学生姓名', type: 'text', placeholder: '请输入学生姓名', required: true },
      { prop: 'parentName', label: '家长姓名', type: 'text', placeholder: '请输入家长姓名', required: true },
      { prop: 'phone', label: '联系电话', type: 'text', placeholder: '请输入联系电话', required: true },
      { prop: 'birthDate', label: '出生日期', type: 'date', placeholder: '请选择出生日期', required: true },
      { prop: 'applyDate', label: '申请日期', type: 'date', placeholder: '请选择申请日期', required: true }
    ],
    // 活动计划相关 - 对应Activity模型
    'create-activity': [
      { prop: 'title', label: '活动名称', type: 'text', placeholder: '请输入活动名称', required: true },
      { prop: 'activityType', label: '活动类型', type: 'select', placeholder: '请选择活动类型', required: true,
        options: [
          { label: '开放日', value: 1 },
          { label: '家长会', value: 2 },
          { label: '亲子活动', value: 3 },
          { label: '招生宣讲', value: 4 },
          { label: '园区参观', value: 5 },
          { label: '其他', value: 6 }
        ]
      },
      { prop: 'startTime', label: '开始时间', type: 'datetime', placeholder: '请选择开始时间', required: true },
      { prop: 'endTime', label: '结束时间', type: 'datetime', placeholder: '请选择结束时间', required: true },
      { prop: 'registrationStartTime', label: '报名开始时间', type: 'datetime', placeholder: '请选择报名开始时间', required: true },
      { prop: 'registrationEndTime', label: '报名结束时间', type: 'datetime', placeholder: '请选择报名结束时间', required: true },
      { prop: 'location', label: '活动地点', type: 'text', placeholder: '请输入活动地点', required: true },
      { prop: 'capacity', label: '活动容量', type: 'number', placeholder: '请输入最大参与人数', required: true, min: 1 },
      { prop: 'fee', label: '活动费用', type: 'number', placeholder: '请输入活动费用(元)', min: 0 },
      { prop: 'description', label: '活动描述', type: 'textarea', placeholder: '请输入活动描述' }
    ],
    'create-registration': [
      { prop: 'activityId', label: '活动ID', type: 'text', placeholder: '请输入活动ID', required: true },
      { prop: 'studentName', label: '学生姓名', type: 'text', placeholder: '请输入学生姓名', required: true },
      { prop: 'parentName', label: '家长姓名', type: 'text', placeholder: '请输入家长姓名', required: true },
      { prop: 'phone', label: '联系电话', type: 'text', placeholder: '请输入联系电话', required: true }
    ],
    // 人员基础信息相关 - 对应Teacher/Student/Parent模型
    'create-teacher': [
      { prop: 'realName', label: '教师姓名', type: 'text', placeholder: '请输入教师姓名', required: true },
      { prop: 'phone', label: '联系电话', type: 'text', placeholder: '请输入联系电话', required: true },
      { prop: 'email', label: '电子邮箱', type: 'text', placeholder: '请输入电子邮箱' },
      { prop: 'teacherNo', label: '教师工号', type: 'text', placeholder: '请输入教师工号', required: true },
      { prop: 'position', label: '职位', type: 'select', placeholder: '请选择职位', required: true,
        options: [
          { label: '园长', value: 1 },
          { label: '副园长', value: 2 },
          { label: '教研主任', value: 3 },
          { label: '班主任', value: 4 },
          { label: '普通教师', value: 5 },
          { label: '助教', value: 6 }
        ]
      },
      { prop: 'hireDate', label: '入职日期', type: 'date', placeholder: '请选择入职日期', required: true },
      { prop: 'education', label: '学历', type: 'select', placeholder: '请选择学历',
        options: [
          { label: '高中及以下', value: 1 },
          { label: '大专', value: 2 },
          { label: '本科', value: 3 },
          { label: '硕士', value: 4 },
          { label: '博士', value: 5 }
        ]
      },
      { prop: 'major', label: '专业', type: 'text', placeholder: '请输入专业' }
    ],
    'create-student': [
      { prop: 'name', label: '学生姓名', type: 'text', placeholder: '请输入学生姓名', required: true },
      { prop: 'studentNo', label: '学号', type: 'text', placeholder: '请输入学号', required: true },
      { prop: 'gender', label: '性别', type: 'select', placeholder: '请选择性别', required: true,
        options: [
          { label: '男', value: 1 },
          { label: '女', value: 2 }
        ]
      },
      { prop: 'birthDate', label: '出生日期', type: 'date', placeholder: '请选择出生日期', required: true },
      { prop: 'enrollmentDate', label: '入学日期', type: 'date', placeholder: '请选择入学日期', required: true },
      { prop: 'idCardNo', label: '身份证号', type: 'text', placeholder: '请输入身份证号' },
      { prop: 'healthCondition', label: '健康状况', type: 'textarea', placeholder: '请输入健康状况' }
    ],
    'create-parent': [
      { prop: 'realName', label: '家长姓名', type: 'text', placeholder: '请输入家长姓名', required: true },
      { prop: 'phone', label: '联系电话', type: 'text', placeholder: '请输入联系电话', required: true },
      { prop: 'email', label: '电子邮箱', type: 'text', placeholder: '请输入电子邮箱' },
      { prop: 'relationship', label: '与学生关系', type: 'select', placeholder: '请选择关系', required: true,
        options: [
          { label: '父亲', value: '父亲' },
          { label: '母亲', value: '母亲' },
          { label: '爷爷', value: '爷爷' },
          { label: '奶奶', value: '奶奶' },
          { label: '外公', value: '外公' },
          { label: '外婆', value: '外婆' },
          { label: '其他', value: '其他' }
        ]
      },
      { prop: 'isPrimaryContact', label: '是否主要联系人', type: 'select', placeholder: '请选择', required: true,
        options: [
          { label: '是', value: 1 },
          { label: '否', value: 0 }
        ]
      },
      { prop: 'occupation', label: '职业', type: 'text', placeholder: '请输入职业' },
      { prop: 'workUnit', label: '工作单位', type: 'text', placeholder: '请输入工作单位' }
    ]
  }

  return fieldsMap[actionType] || []
}

// 处理快捷表单提交
const handleQuickSubmit = async (formData: any) => {
  console.log('📝 提交表单数据:', formData)
  console.log('📝 当前操作:', currentQuickAction.value)

  const action = currentQuickAction.value?.action
  if (!action) {
    throw new Error('操作类型未定义')
  }

  // 🔑 验证用户已登录（检查token）
  const userStore = useUserStore()
  if (!userStore.isAuthenticated) {
    ElMessage.error('请先登录')
    router.push('/login')
    throw new Error('用户未登录')
  }

  // 📝 直接使用表单数据，不添加额外字段
  // 后端会从JWT token的req.user中自动获取kindergartenId和creatorId
  console.log('📝 提交的表单数据:', formData)
  console.log('🔑 后端将从JWT token自动填充kindergartenId和creatorId')

  try {
    // 根据不同的action调用不同的API
    // 后端会从JWT token的req.user中自动填充kindergartenId和creatorId
    switch (action) {
      // 招生计划相关
      case 'create-enrollment-plan':
        await request.post(ENROLLMENT_PLAN_ENDPOINTS.CREATE, formData)
        break

      case 'create-consultation':
        await request.post(ENROLLMENT_CONSULTATION_ENDPOINTS.BASE, formData)
        break

      case 'create-application':
        await request.post(ENROLLMENT_APPLICATION_ENDPOINTS.BASE, formData)
        break

      // 活动相关
      case 'create-activity':
        await request.post(ACTIVITY_ENDPOINTS.BASE, formData)
        break

      case 'create-registration':
        await request.post(ACTIVITY_REGISTRATION_ENDPOINTS.BASE, formData)
        break

      // 人员相关
      case 'create-teacher':
        await request.post(`${USER_ENDPOINTS.BASE}/teachers`, formData)
        break

      case 'create-student':
        await request.post(`${USER_ENDPOINTS.BASE}/students`, formData)
        break

      case 'create-parent':
        await request.post(`${USER_ENDPOINTS.BASE}/parents`, formData)
        break

      default:
        throw new Error(`未知的操作类型: ${action}`)
    }

    console.log('✅ API调用成功')
  } catch (error: any) {
    console.error('❌ API调用失败:', error)
    throw new Error(error.response?.data?.message || error.message || '提交失败')
  }
}

// 处理快捷表单提交成功
const handleQuickSuccess = () => {
  // 刷新业务中心数据
  loadBusinessCenterData()
}

// 加载业务中心数据
const loadBusinessCenterData = async () => {
  try {
    loading.value = true
    console.log('🏢 开始加载业务中心数据...')

    // 并行获取所有数据（避免其中一个接口慢/失败导致全页“看起来像空白”）
    const [timelineRes, enrollmentRes] = await Promise.allSettled([
      BusinessCenterService.getTimeline(),
      BusinessCenterService.getEnrollmentProgress()
    ])

    // 更新时间线数据
    if (timelineRes.status === 'fulfilled') {
      timelineItems.value = timelineRes.value
      console.log('📋 时间线数据加载完成:', timelineRes.value.length, '个项目')
    } else {
      console.error('❌ 时间线数据加载失败:', timelineRes.reason)
      timelineItems.value = []
    }

    // 更新招生进度数据
    if (enrollmentRes.status === 'fulfilled') {
      enrollmentTarget.value = enrollmentRes.value.target
      enrollmentCurrent.value = enrollmentRes.value.current
      enrollmentMilestones.value = enrollmentRes.value.milestones
      console.log('🎯 招生进度数据加载完成:', enrollmentRes.value)
    } else {
      console.error('❌ 招生进度数据加载失败:', enrollmentRes.reason)
      enrollmentTarget.value = 0
      enrollmentCurrent.value = 0
      // 保留默认里程碑（避免 UI 断裂）
    }

    // 默认选中第一个进行中的项目
    const inProgressItem = timelineItems.value.find(item => item.status === 'in-progress')
    if (inProgressItem) {
      selectedItem.value = inProgressItem
    } else if (timelineItems.value.length > 0) {
      selectedItem.value = timelineItems.value[0]
    }

    if (timelineRes.status === 'fulfilled' || enrollmentRes.status === 'fulfilled') {
      ElMessage.success('业务中心数据已加载')
    } else {
      ElMessage.error('业务中心数据加载失败，请稍后重试')
    }
  } catch (error) {
    console.error('❌ 加载业务中心数据失败:', error)
    ElMessage.error('加载业务中心数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  loadBusinessCenterData()
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;
// ✅ 商务中心页面样式 - 直接使用UnifiedCenterLayout的子元素
// 避免与全局.center-container样式的冲突

.business-center-content {
  // 🎯 主要的左右布局容器
  display: flex;
  flex-direction: row;
  height: 100%;
  gap: var(--radius-3xl);
  background: var(--bg-page);
  padding: 0;  // ✅ 移除padding，因为UnifiedCenterLayout已经提供了padding
  overflow: visible;  // ✅ 允许内容显示，由子元素控制滚动
  position: relative;

  // ✅ 直接使用容器的完整空间，不使用负margin
  width: 100%;
  margin: 0;
}

// 左侧Timeline区域 (1/3屏幕)
.timeline-section {
  flex: 0 0 33.333%;
  background: var(--el-bg-color);
  border-radius: var(--radius-xl);
  padding: var(--radius-3xl);
  box-shadow: var(--el-box-shadow-light);
  overflow-y: auto;
  overflow-x: hidden;  // ✅ 禁止水平滚动
  border: var(--radius-xs) solid var(--el-border-color-light);
}

.timeline-header {
  margin-bottom: var(--radius-3xl);
  
  h3 {
    margin: 0 0 var(--radius-lg) 0;
    color: var(--el-text-color-primary);
    font-size: var(--spacing-lg);
    font-weight: 600;
  }
  
  p {
    margin: 0;
    color: var(--el-text-color-regular);
    font-size: var(--text-sm);
  }
}

.timeline-container {
  position: relative;
}

.timeline-item {
  display: flex;
  margin-bottom: var(--radius-2xl);
  cursor: pointer;
  transition: all var(--transition-normal) cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &:hover {
    .timeline-content {
      transform: translateX(8px);
      background: var(--bg-secondary);
      border-color: var(--primary-color);
      box-shadow: var(--shadow-md);
    }

    .timeline-dot {
      transform: scale(1.1);
      box-shadow: 0 0 0 4px var(--primary-light-bg);
    }
  }
  
  &.active {
    .timeline-content {
      background: linear-gradient(135deg, var(--bg-card) 0%, var(--primary-light-bg) 100%);
      border-color: var(--primary-color);
      box-shadow: var(--shadow-lg), var(--glow-primary);
      transform: translateX(8px);

      &::after {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: var(--primary-color);
        border-radius: var(--radius-full) 0 0 var(--radius-full);
      }
    }

    .timeline-dot {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
      transform: scale(1.2);
      box-shadow: 0 0 0 6px var(--primary-light-bg);

      .dot-inner {
        animation: pulse 2s infinite;
      }
    }
  }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.timeline-marker {
  position: relative;
  margin-right: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 32px;
  flex-shrink: 0;
}

.timeline-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  color: var(--text-secondary);
  transition: all var(--transition-normal);
  z-index: 2;
  border: 2px solid var(--border-color);
  box-shadow: var(--shadow-sm);

  .dot-inner {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :deep(svg) {
    width: 16px;
    height: 16px;
  }
}

.timeline-line {
  position: absolute;
  top: 32px;
  bottom: -24px;
  width: 2px;
  background: var(--border-color-light);
  z-index: 1;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to bottom, var(--primary-color) 0%, transparent 100%);
    opacity: 0;
    transition: opacity var(--transition-normal);
  }
}

.timeline-item.active .timeline-line::after {
  opacity: 0.3;
}

.timeline-content {
  flex: 1;
  padding: var(--spacing-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-color-light);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
  position: relative;
  min-width: 0;

  .timeline-header-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xs);

    .timeline-title {
      font-size: var(--text-base);
      font-weight: 700;
      color: var(--text-primary);
    }

    .timeline-status-tag {
      font-size: var(--text-2xs);
      padding: 2px 8px;
      border-radius: var(--radius-full);
      font-weight: 600;
      text-transform: uppercase;

      &.completed {
        background: var(--success-light-bg);
        color: var(--success-color);
      }
      &.in-progress {
        background: var(--warning-light-bg);
        color: var(--warning-color);
      }
      &.pending {
        background: var(--bg-secondary);
        color: var(--text-secondary);
      }
    }
  }

  .timeline-description {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-md);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .timeline-footer-info {
    .progress-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      .progress-bar-mini {
        flex: 1;
        height: 4px;
        background: var(--bg-secondary);
        border-radius: var(--radius-full);
        overflow: hidden;

        .progress-fill {
          height: 100%;
          background: var(--primary-color);
          border-radius: var(--radius-full);
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
      }

      .progress-text {
        font-size: var(--text-xs);
        font-weight: 700;
        color: var(--text-secondary);
        min-width: 32px;
      }
    }
  }
}

// 右侧内容区域 (2/3屏幕)
.content-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--radius-3xl);
  overflow-y: auto;  // ✅ 允许垂直滚动
  overflow-x: hidden;  // ✅ 禁止水平滚动
}

// 招生进度条区域
.enrollment-progress-section {
  background: var(--el-bg-color);
  border-radius: var(--radius-xl);
  padding: var(--radius-3xl);
  box-shadow: var(--el-box-shadow-light);
  border: var(--radius-xs) solid var(--el-border-color);
  position: relative;
  flex-shrink: 0;  // ✅ 防止被压缩

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: var(--el-border-width-extra-thick, var(--border-width-thicker));
    background: linear-gradient(90deg, var(--el-color-primary, var(--el-color-primary, #667eea)), var(--el-color-primary-dark, var(--el-color-primary-dark, #764ba2)));
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  }
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  
  h4 {
    margin: 0;
    color: var(--el-text-color-primary);
    font-size: var(--text-lg);
    font-weight: 600;
  }
}

.progress-stats {
  display: flex;
  gap: var(--radius-2xl);
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);

  span {
    padding: var(--radius-md) var(--text-sm);
    background: linear-gradient(135deg, var(--el-bg-color-page), var(--el-fill-color-lighter));
    border-radius: var(--spacing-lg);
    border: var(--radius-xs) solid var(--el-border-color-lighter);
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-var(--border-width-base));
      box-shadow: var(--el-box-shadow-light);
    }
  }
}

.progress-container {
  position: relative;
  max-width: 95%;
}

.enrollment-progress {
  margin-bottom: var(--radius-2xl);
}

.progress-milestones {
  position: relative;
  height: 50px;  // 增加高度以容纳标签
  margin-top: 12px;
}

.milestone {
  position: absolute;
  transform: translateX(-50%);
  text-align: center;
  top: 0;
  width: 60px;  // 为标签设置固定宽度
}

.milestone-marker {
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-dark-2));
  border-radius: 50%;
  margin: 0 auto 6px;
  border: 2px solid var(--el-bg-color);
  box-shadow: var(--el-box-shadow-light);
}

.milestone-label {
  font-size: var(--text-xs);
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

// 详情展示区域
.detail-section {
  flex: 1;
  background: var(--el-bg-color);
  border-radius: var(--radius-xl);
  padding: var(--radius-3xl);
  box-shadow: var(--el-box-shadow-light);
  border: var(--radius-xs) solid var(--el-border-color);
  overflow-y: auto;
  overflow-x: hidden;  // ✅ 禁止水平滚动
  position: relative;
  min-height: 0;  // ✅ 确保flex子元素可以正确收缩
}

.detail-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
  color: var(--el-text-color-secondary);
  
  h4 {
    margin: var(--radius-2xl) 0 var(--radius-lg) 0;
    color: var(--el-text-color-regular);
  }
  
  p {
    margin: 0;
    font-size: var(--text-sm);
  }
}

.detail-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-header {
  margin-bottom: var(--radius-3xl);
  padding-bottom: var(--radius-2xl);
  border-bottom: var(--border-width-base) solid var(--el-border-color-lighter);
}

.detail-title {
  display: flex;
  align-items: center;
  gap: var(--radius-xl);

  h4 {
    margin: 0;
    color: var(--el-text-color-primary);
    font-size: var(--text-lg);
    font-weight: 600;
    flex: 1;
  }

  .edit-button {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: var(--radius-md);
    padding: var(--radius-lg) var(--radius-2xl);
    border-radius: var(--radius-md);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-var(--radius-xs));
      box-shadow: 0 var(--radius-sm) var(--radius-xl) rgba(64, 158, 255, 0.3);
    }
  }
}

.detail-body {
  flex: 1;
  overflow-y: auto;
}

.detail-section-item {
  margin-bottom: var(--radius-3xl);
  
  h5 {
    margin: 0 0 var(--radius-xl) 0;
    color: var(--el-text-color-primary);
    font-size: var(--radius-2xl);
    font-weight: 600;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--radius-xl);
}

.info-item {
  display: flex;
  align-items: center;
  gap: var(--radius-lg);
}

.info-label {
  color: var(--el-text-color-secondary);
  font-size: var(--text-sm);
  min-width: var(--form-label-width-sm);
}

.info-value {
  color: var(--el-text-color-primary);
  font-size: var(--text-sm);
  font-weight: 500;
  
  &.completed {
    color: var(--color-success);
    font-weight: 600;
  }

  &.in-progress {
    color: var(--color-accent);
    font-weight: 600;
  }

  &.pending {
    color: var(--color-gray-500);
    font-weight: 500;
  }
}

.detail-description {
  margin: 0;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--radius-2xl);
}

.metric-card {
  text-align: center;
  padding: var(--spacing-lg);
  // ✅ 使用令牌系统而不是硬编码渐变
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  border: var(--border-width-base) solid var(--border-color);
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);

  &:hover {
    transform: translateY(-var(--border-width-thick));
    box-shadow: var(--shadow-lg);
    border-color: var(--color-primary);
  }

  .metric-value {
    font-size: var(--text-2xl);
    font-weight: 700;
    // ✅ 使用令牌系统的颜色而不是硬编码渐变
    color: var(--color-primary);
    margin-bottom: var(--spacing-md);
  }

  .metric-label {
    font-size: var(--text-sm);
    color: #475569 !important;
    font-weight: 500;
  }
}

.operation-list {
  max-height: var(--input-width-xl);
  overflow-y: auto;
}

.operation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--radius-lg) 0;
  border-bottom: var(--border-width-base) solid var(--el-border-color-lighter);
  
  &:last-child {
    border-bottom: none;
  }
}

.operation-time {
  font-size: var(--radius-xl);
  color: var(--el-text-color-secondary);
  min-width: var(--input-width-sm);
}

.operation-content {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
  margin: 0 var(--radius-xl);
}

.operation-user {
  font-size: var(--radius-xl);
  color: var(--el-text-color-secondary);
  min-width: var(--form-label-width-sm);
  text-align: right;
}

.no-operations {
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: var(--text-sm);
  padding: var(--radius-3xl);
}

// 响应式设计 - 完整的断点系统
@media (max-width: var(--container-xl)) {
  .business-center-content {
    gap: var(--spacing-lg);
    padding: var(--spacing-md);
  }

  .timeline-section {
    flex: 0 0 30%;
    max-min-height: 60px; height: auto;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: var(--radius-2xl);
  }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--radius-2xl);
  }
}

@media (max-width: 992px) {
  .business-center-content {
    padding: var(--spacing-md);
    gap: var(--spacing-lg);
  }

  .timeline-section {
    flex: 0 0 25%;
    max-height: var(--input-width-xl);
  }

  .content-section {
    flex: 1;
  }

  .progress-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-lg);
  }

  .progress-stats {
    flex-wrap: wrap;
    gap: var(--spacing-md);
  }

  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-lg);
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }

  .metrics-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
}

@media (max-width: var(--breakpoint-md)) {
  .business-center-content {
    padding: var(--spacing-sm);
    gap: var(--spacing-lg);
  }

  .timeline-section {
    flex: 0 0 22%;
    padding: var(--spacing-lg);
    max-height: var(--sidebar-width);
  }

  .content-section {
    flex: 1;
  }

  .enrollment-progress-section,
  .detail-section {
    padding: var(--spacing-lg);
  }

  .timeline-item {
    .timeline-content {
      padding: var(--spacing-lg);
    }

    .timeline-title {
      font-size: var(--text-sm);
    }

    .timeline-description {
      font-size: var(--text-sm);
    }
  }

  .progress-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-lg);

    h4 {
      font-size: var(--text-lg);
    }
  }

  .progress-stats {
    flex-wrap: wrap;
    gap: var(--spacing-md);

    span {
      padding: var(--spacing-xs) var(--font-size-xs);
      font-size: var(--text-sm);
    }
  }

  .detail-header {
    .detail-title {
      flex-wrap: wrap;
      gap: var(--spacing-md);

      h4 {
        font-size: var(--text-lg);
        flex: 1 1 100%;
      }

      .edit-button {
        flex: 1 1 auto;
        justify-content: center;
      }
    }
  }

  .metrics-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }

  .metric-card {
    padding: var(--spacing-lg);

    .metric-value {
      font-size: var(--text-2xl);
    }

    .metric-label {
      font-size: var(--text-sm);
    }
  }

  .operation-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--radius-lg);
    padding: var(--radius-xl) 0;

    .operation-time {
      min-width: auto;
      font-size: var(--text-xs);
    }

    .operation-content {
      margin: 0;
      font-size: var(--text-sm);
    }

    .operation-user {
      min-width: auto;
      text-align: left;
      font-size: var(--text-xs);
    }
  }
}

@media (max-width: var(--breakpoint-xs)) {
  .business-center-content {
    padding: var(--spacing-sm);
    gap: var(--spacing-lg);
  }

  .timeline-section,
  .enrollment-progress-section,
  .detail-section {
    padding: var(--spacing-lg);
  }

  .timeline-section {
    max-height: var(--sidebar-width);
  }

  .timeline-item {
    .timeline-content {
      padding: var(--spacing-sm);
    }

    .timeline-title {
      font-size: var(--text-sm);
    }

    .timeline-description {
      font-size: var(--text-xs);
    }

    .timeline-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-xs);
    }
  }

  .progress-header {
    h4 {
      font-size: var(--text-sm);
    }
  }

  .progress-stats {
    span {
      padding: var(--border-width-thicker) var(--spacing-md);
      font-size: var(--text-xs);
    }
  }

  .detail-header {
    .detail-title h4 {
      font-size: var(--text-sm);
    }

    .detail-actions {
      flex-direction: column;
      gap: var(--spacing-md);

      .el-button {
        width: 100%;
      }
    }
  }

  .metric-card {
    padding: var(--spacing-lg);

    .metric-value {
      font-size: var(--text-lg);
    }

    .metric-label {
      font-size: var(--text-xs);
    }
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);

    .info-label {
      min-width: auto;
      font-size: var(--text-sm);
    }

    .info-value {
      font-size: var(--text-sm);
    }
  }
}

// 暗黑主题特殊优化
@media (prefers-color-scheme: dark) {
  .timeline-section,
  .enrollment-progress-section,
  .detail-section {
    background: var(--el-fill-color-light);
    backdrop-filter: blur(var(--spacing-lg));
    border-color: var(--el-border-color);
  }

  .timeline-content {
    background: var(--el-fill-color-light);
    border-color: var(--el-border-color);

    &:hover {
      background: var(--el-fill-color);
      border-color: color-mix(in oklab, var(--el-color-primary) 30%, transparent);
    }
  }

  .metric-card {
    background: var(--el-fill-color-light);
    border-color: var(--el-border-color);

    &:hover {
      background: var(--el-fill-color);
      border-color: color-mix(in oklab, var(--el-color-primary) 30%, transparent);
    }
  }

  .progress-stats span {
    background: var(--el-fill-color-light);
    border-color: var(--el-border-color);
  }
}

// Element Plus 暗黑主题适配
html.dark {
  // ✅ 确保暗黑主题下也保持左右布局
  .business-center-content {
    display: flex !important;
    flex-direction: row !important;
  }

  .timeline-section,
  .enrollment-progress-section,
  .detail-section {
    background: var(--el-fill-color-light);
    backdrop-filter: blur(var(--spacing-lg));
    border-color: var(--el-border-color);
  }

  .timeline-content {
    background: var(--el-fill-color-light);
    border-color: var(--el-border-color);

    &:hover {
      background: var(--el-fill-color);
      border-color: color-mix(in oklab, var(--el-color-primary) 30%, transparent);
    }
  }

  .metric-card {
    background: var(--el-fill-color-light);
    border-color: var(--el-border-color);

    &:hover {
      background: var(--el-fill-color);
      border-color: color-mix(in oklab, var(--el-color-primary) 30%, transparent);
    }
  }

  .progress-stats span {
    background: var(--el-fill-color-light);
    border-color: var(--el-border-color);
  }

  .enrollment-progress-section::before {
    background: var(--gradient-purple);
  }
}

// 抽屉样式
.business-drawer {
  .drawer-content {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .drawer-header {
    padding: var(--radius-2xl) 0;
    border-bottom: var(--border-width-base) solid var(--el-border-color-light);
    margin-bottom: var(--radius-2xl);

    .drawer-item-info {
      display: flex;
      gap: var(--radius-xl);
      align-items: flex-start;

      .item-icon {
        width: var(--spacing-4xl);
        height: var(--spacing-4xl);
        background: var(--el-color-primary-light-9);
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--el-color-primary);
      }

      .item-details {
        flex: 1;

        h3 {
          margin: 0 0 var(--radius-sm) 0;
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        p {
          margin: 0 0 var(--radius-lg) 0;
          color: var(--el-text-color-regular);
          line-height: 1.4;
          font-size: var(--text-sm);
        }

        .item-meta {
          display: flex;
          align-items: center;
          gap: var(--radius-xl);

          .progress-text {
            font-size: var(--radius-xl);
            color: var(--el-text-color-secondary);
          }
        }
      }
    }
  }

  .drawer-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .embedded-content-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--el-bg-color-page);
    border-radius: var(--radius-lg);
    overflow: hidden;

    .center-content {
      flex: 1;
      width: 100%;
      height: 100%;
      overflow-y: auto;

      // 隐藏中心页面的头部和导航
      :deep(.center-container) {
        .center-header {
          display: none;
        }

        .center-tabs {
          display: none;
        }

        .center-content {
          padding: 0;
        }
      }

      // 调整内容样式以适应抽屉
      :deep(.overview-content) {
        padding: var(--radius-2xl);

        .welcome-section {
          margin-bottom: var(--spacing-lg);

          h2 {
            font-size: var(--text-lg);
            margin-bottom: var(--radius-lg);
          }

          p {
            font-size: var(--text-sm);
            margin-bottom: 0;
          }
        }

        .stats-grid-unified {
          gap: var(--radius-xl);
        }

        .charts-grid-unified {
          gap: var(--radius-xl);
        }
      }
    }

    .loading-placeholder {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--radius-2xl);
      color: var(--el-text-color-secondary);

      .el-icon {
        font-size: var(--spacing-2xl);
        color: var(--el-color-primary);
      }

      p {
        margin: 0;
        font-size: var(--text-sm);
      }
    }
  }

  .drawer-footer {
    padding: var(--radius-2xl) 0 0 0;
    border-top: var(--border-width-base) solid var(--el-border-color-light);
    display: flex;
    justify-content: flex-end;
    gap: var(--radius-xl);
  }
}

// 快捷操作区域样式
.quick-actions-section {
  background: var(--bg-tertiary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl) !important;
  margin-top: var(--spacing-xl);
  border: 1px solid var(--border-color);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);

  h5 {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    color: var(--text-primary);
    font-weight: 600;
    margin-bottom: var(--spacing-xl);
    font-size: var(--text-base);

    .unified-icon {
      color: var(--primary-color);
    }
  }

  .quick-actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);

    .quick-action-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-color-light);
      cursor: pointer;
      transition: all var(--transition-normal) cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
        border-color: var(--primary-color);

        .action-icon-wrapper {
          transform: scale(1.1) rotate(-5deg);
        }

        .action-arrow {
          transform: translateX(4px);
          opacity: 1;
        }
      }

      .action-icon-wrapper {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-light-bg);
        color: var(--primary-color);
        border-radius: var(--radius-md);
        transition: all var(--transition-normal);
        flex-shrink: 0;
      }

      .action-info {
        flex: 1;
        min-width: 0;

        .action-label {
          display: block;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .action-arrow {
        color: var(--text-secondary);
        opacity: 0.5;
        transition: all var(--transition-normal);
        display: flex;
        align-items: center;
      }

      /* 不同类型的卡片配色 */
      &--success {
        &:hover {
          border-color: var(--success-color);
          .action-icon-wrapper {
            background: var(--success-light-bg);
            color: var(--success-color);
          }
        }
      }

      &--warning {
        &:hover {
          border-color: var(--warning-color);
          .action-icon-wrapper {
            background: var(--warning-light-bg);
            color: var(--warning-color);
          }
        }
      }

      &--danger {
        &:hover {
          border-color: var(--danger-color);
          .action-icon-wrapper {
            background: var(--danger-light-bg);
            color: var(--danger-color);
          }
        }
      }

      &--info {
        &:hover {
          border-color: var(--text-secondary);
          .action-icon-wrapper {
            background: var(--bg-secondary);
            color: var(--text-secondary);
          }
        }
      }
    }
  }

  .quick-actions-tip {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--primary-light-bg);
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    color: var(--primary-color);
    opacity: 0.8;

    .unified-icon {
      font-size: 14px;
    }
  }
}
</style>
