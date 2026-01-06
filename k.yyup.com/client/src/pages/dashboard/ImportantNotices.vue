<template>
  <div class="dashboard-container">
    <!-- 页面头部 -->
    <div class="dashboard-page-header">
      <div class="header-left">
        <h1 class="page-title">重要通知</h1>
        <el-tag :type="currentUserRole === 'admin' ? 'danger' : 'primary'" size="small">
          {{ currentRoleConfig.name }}
        </el-tag>
      </div>
      <div class="page-actions">
        <el-button
          v-if="userPermissions.includes('create')"
          type="primary"
          class="dashboard-action-btn primary"
          @click="handleCreate"
        >
          <UnifiedIcon name="Plus" />
          发布通知
        </el-button>
        <el-button type="success" class="dashboard-action-btn success" @click="handleRefresh">
          <UnifiedIcon name="Refresh" />
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片区域 - 深度UX优化 -->
    <div class="dashboard-stats-grid">
      <div
        v-for="(stat, index) in statCards"
        :key="index"
        class="dashboard-stat-card"
        :class="[stat.type, { loading: loading.stats }]"
      >
        <div class="stat-content">
          <div class="stat-icon">
            <UnifiedIcon name="default" />
          </div>
          <div class="stat-info">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">{{ stat.value }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索筛选区域 - 深度UX优化 -->
    <div class="dashboard-data-section">
      <div class="data-header">
        <h3 class="data-title">筛选条件</h3>
      </div>
      <div class="data-content">
        <el-form :model="searchForm" :inline="true" class="search-form">
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="请输入通知标题"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="重要程度">
            <el-select v-model="searchForm.importance" placeholder="全部" clearable>
              <el-option
                v-for="item in importanceOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="通知类型">
            <el-select v-model="searchForm.type" placeholder="全部类型" clearable>
              <el-option
                v-for="(config, type) in notificationTypeConfig"
                :key="type"
                :label="config.name"
                :value="type"
              >
                <span :style="{ color: config.color }">
                  {{ config.name }}
                </span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="优先级">
            <el-select v-model="searchForm.priority" placeholder="全部优先级" clearable>
              <el-option
                v-for="(config, priority) in priorityConfig"
                :key="priority"
                :label="config.name"
                :value="priority"
              >
                <span :style="{ color: config.color }">
                  {{ config.name }}
                </span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="发布时间">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="data-action-btn" @click="handleSearch">
              <UnifiedIcon name="Search" />
              搜索
            </el-button>
            <el-button class="data-action-btn" @click="handleReset">
              <UnifiedIcon name="Refresh" />
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 通知列表区域 - 深度UX优化 -->
    <div class="dashboard-data-section">
      <div class="data-header">
        <h3 class="data-title">通知列表</h3>
        <div class="data-actions">
          <el-button type="text" class="data-action-btn" @click="handleMarkAllRead">
            <UnifiedIcon name="Check" />
            全部标记已读
          </el-button>
        </div>
      </div>
      <div class="data-content">

      <div v-loading="loading.notices">
        <div class="notice-list">
          <div
            v-for="notice in noticeList"
            :key="notice.id"
            class="notice-item"
            :class="{ 'unread': !notice.isRead, 'high-importance': notice.importance === 'HIGH' }"
            @click="handleViewNotice(notice)"
          >
            <div class="notice-header">
              <div class="notice-title">
                <UnifiedIcon name="default" />
                <span>{{ notice.title }}</span>
                <div class="notice-tags">
                  <el-tag v-if="!notice.isRead" type="danger" size="small">未读</el-tag>
                  <el-tag
                    v-if="notice.type"
                    :color="notificationTypeConfig[notice.type]?.color"
                    size="small"
                    effect="light"
                  >
                    {{ notificationTypeConfig[notice.type]?.name }}
                  </el-tag>
                  <el-tag
                    v-if="notice.priority"
                    :color="priorityConfig[notice.priority]?.color"
                    size="small"
                    effect="plain"
                  >
                    {{ priorityConfig[notice.priority]?.name }}
                  </el-tag>
                </div>
              </div>
              <div class="notice-meta">
                <span class="publish-time">{{ formatTime(notice.publishTime) }}</span>
                <el-tag :type="getImportanceTagType(notice.importance)" size="small">
                  {{ getImportanceText(notice.importance) }}
                </el-tag>
              </div>
            </div>
            <div class="notice-content">
              <p>{{ notice.content || notice.summary }}</p>
            </div>
            <div class="notice-footer">
              <div class="read-stats">
                <UnifiedIcon name="eye" />
                <span>{{ notice.readCount }}/{{ notice.totalCount }} 人已读</span>
              </div>
              <div class="notice-actions">
                <el-button type="text" size="small" @click.stop="handleMarkRead(notice)">
                  <UnifiedIcon name="Check" />
                  标记已读
                </el-button>
                <el-button type="text" size="small" @click.stop="handleEdit(notice)">
                  <UnifiedIcon name="Edit" />
                  编辑
                </el-button>
                <el-button type="text" size="small" @click.stop="handleDelete(notice)">
                  <UnifiedIcon name="Delete" />
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="noticeList.length === 0" class="empty-state">
          <div class="empty-icon">📢</div>
          <div class="empty-title">暂无通知</div>
          <div class="empty-description">还没有发布任何重要通知，立即发布第一个通知吧！</div>
          <button class="empty-action" @click="handleCreate">发布通知</button>
        </div>
      </div>
      </div>

      <!-- 分页器 -->
      <div class="dashboard-pagination" v-if="noticeList.length > 0">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 通知详情对话框 - 深度UX优化 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :width="isDesktop ? '800px' : '95%'"
      class="notice-detail-dialog"
      @close="handleDialogClose"
    >
      <div v-if="currentNotice" class="notice-detail">
        <div class="detail-header">
          <h3>{{ currentNotice.title }}</h3>
          <div class="detail-meta">
            <el-tag :type="getImportanceTagType(currentNotice.importance)">
              {{ getImportanceText(currentNotice.importance) }}
            </el-tag>
            <span class="publish-time">{{ formatTime(currentNotice.publishTime) }}</span>
          </div>
        </div>
        <div class="detail-content">
          <p>{{ currentNotice.content || currentNotice.summary }}</p>
        </div>
        <div class="detail-footer">
          <div class="read-stats">
            <el-progress
              :percentage="getReadPercentage(currentNotice)"
              :color="getProgressColor(getReadPercentage(currentNotice))"
            />
            <span>{{ currentNotice.readCount }}/{{ currentNotice.totalCount }} 人已读 ({{ getReadPercentage(currentNotice) }}%)</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleMarkRead(currentNotice)">
            标记已读
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 1. Vue 相关导入
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

// 2. Element Plus 导入
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Refresh, Search, Check, Warning, View, Edit, Delete,
  Bell, Message, TrendCharts, User
} from '@element-plus/icons-vue'

// 3. 公共工具函数导入
import requestInstance from '../../utils/request'
import { formatDateTime } from '../../utils/dateFormat'
import { DASHBOARD_ENDPOINTS } from '../../api/endpoints'
import { getSuccessColor, getWarningColor, getDangerColor } from '@/utils/color-tokens'


// 解构出需要的方法
const { get, post, put, del } = requestInstance

// 4. 页面内部类型定义

// 用户角色类型
type UserRole = 'admin' | 'principal' | 'teacher' | 'parent'

// 通知类型
type NotificationType = 'system' | 'management' | 'business' | 'personal' | 'emergency'

// 通知优先级
type NotificationPriority = 'emergency' | 'high' | 'medium' | 'low'

// API响应类型
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

// 统计卡片数据接口
interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  type: 'primary' | 'success' | 'warning' | 'info' | 'danger'
}

// 搜索表单接口
interface SearchForm {
  keyword: string;
  importance: string
  type: string
  priority: string
  dateRange: string[]
}

// 通知接口
interface Notice {
  id: number | string;
  title: string
  content?: string
  summary?: string;
  importance: 'HIGH' | 'MEDIUM' | 'LOW'
  priority: NotificationPriority
  type: NotificationType
  category: string
  publishTime: string
  readCount: number
  totalCount: number
  isRead: boolean
  publisher?: string
  targetRoles: UserRole[]
  sender: {
    id: number
    name: string
    role: UserRole
  }
  attachments?: Array<{
    id: number
    name: string
    url: string
    type: string
  }>
}

// 分页接口
interface Pagination {
  currentPage: number
  pageSize: number;
  total: number
}

// 加载状态接口
interface LoadingState {
  stats: boolean;
  notices: boolean
}

// 选项接口
interface Option {
  label: string;
  value: string
}

// 5. 组件逻辑
const router = useRouter()

// 获取当前用户角色（从store或token中获取）
const getCurrentUserRole = (): UserRole => {
  // 这里应该从用户store或token中获取真实角色
  // 暂时返回admin作为示例
  return 'admin'
}

const currentUserRole = ref<UserRole>(getCurrentUserRole())

// 角色配置
const roleConfig = {
  admin: {
    name: '系统管理员',
    canSend: ['system', 'management', 'business', 'personal', 'emergency'],
    canReceive: ['system', 'management', 'emergency'],
    permissions: ['create', 'edit', 'delete', 'send', 'manage']
  },
  principal: {
    name: '园长',
    canSend: ['management', 'business'],
    canReceive: ['system', 'management', 'business', 'emergency'],
    permissions: ['create', 'edit', 'send']
  },
  teacher: {
    name: '教师',
    canSend: ['business', 'personal'],
    canReceive: ['management', 'business', 'personal', 'emergency'],
    permissions: ['create', 'send']
  },
  parent: {
    name: '家长',
    canSend: ['personal'],
    canReceive: ['business', 'personal', 'emergency'],
    permissions: ['reply']
  }
}

// 通知类型配置
const notificationTypeConfig = {
  system: { name: '系统通知', color: 'var(--info-color)', icon: 'Setting' },
  management: { name: '管理通知', color: 'var(--warning-color)', icon: 'settings' },
  business: { name: '业务通知', color: 'var(--primary-color)', icon: 'Document' },
  personal: { name: '个人通知', color: 'var(--success-color)', icon: 'User' },
  emergency: { name: '紧急通知', color: 'var(--danger-color)', icon: 'Warning' }
}

// 优先级配置
const priorityConfig = {
  emergency: { name: '紧急', color: 'var(--danger-color)', level: 4 },
  high: { name: '重要', color: 'var(--warning-color)', level: 3 },
  medium: { name: '普通', color: 'var(--primary-color)', level: 2 },
  low: { name: '低优先级', color: 'var(--info-color)', level: 1 }
}

// 图标组件映射
const iconComponents = {
  Bell,
  Message,
  TrendCharts,
  User
}

// 响应式计算属性
const isDesktop = computed(() => {
  if (typeof window !== 'undefined') {
    return window.innerWidth >= 768
  }
  return true
})

// 当前用户角色配置
const currentRoleConfig = computed(() => roleConfig[currentUserRole.value])

// 可见的通知类型
const visibleNotificationTypes = computed(() => {
  return currentRoleConfig.value.canReceive
})

// 可发送的通知类型
const sendableNotificationTypes = computed(() => {
  return currentRoleConfig.value.canSend
})

// 用户权限
const userPermissions = computed(() => {
  return currentRoleConfig.value.permissions
})

// 筛选后的通知列表（根据角色）
const filteredNoticeList = computed(() => {
  return noticeList.value.filter(notice => {
    // 如果是管理员，可以看到所有通知
    if (currentUserRole.value === 'admin') {
      return true
    }

    // 其他角色只能看到目标角色包含自己的通知
    return notice.targetRoles?.includes(currentUserRole.value) ||
           visibleNotificationTypes.value.includes(notice.type)
  })
})

// 响应式数据
const loading = ref<LoadingState>({
  stats: false,
  notices: false
})

const dialogVisible = ref(false)
const currentNotice = ref<Notice | null>(null)

const dialogTitle = computed(() => '通知详情')

// 统计卡片数据
const statCards = ref<StatCard[]>([
  {
    label: '总通知数',
    value: '0',
    icon: 'bell',
    type: 'primary'
  },
  {
    label: '未读通知',
    value: '0',
    icon: 'Message',
    type: 'warning'
  },
  {
    label: '高重要性',
    value: '0',
    icon: 'TrendCharts',
    type: 'danger'
  },
  {
    label: '平均阅读率',
    value: '0%',
    icon: 'User',
    type: 'success'
  }
])

// 搜索表单
const searchForm = ref<SearchForm>({
  keyword: '',
  importance: '',
  type: '',
  priority: '',
  dateRange: []
})

// 重要程度选项
const importanceOptions: Option[] = [
  { label: '高', value: 'HIGH' },
  { label: '中', value: 'MEDIUM' },
  { label: '低', value: 'LOW' }
]

// 通知列表
const noticeList = ref<Notice[]>([])

// 分页数据
const pagination = ref<Pagination>({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 6. 方法定义

// 加载统计数据
const loadStats = async () => {
  loading.value.stats = true
  try {
    const response: ApiResponse = await get(DASHBOARD_ENDPOINTS.NOTICES_STATS)
    if (response.success && response.data) {
      const data = response.data
      statCards.value[0].value = data.total || '0'
      statCards.value[1].value = data.unread || '0'
      statCards.value[2].value = data.highImportance || '0'
      statCards.value[3].value = `${(data.averageReadRate || 0).toFixed(1)}%`
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
    // 保持默认值，不修改统计卡片
  } finally {
    loading.value.stats = false
  }
}

// 加载通知列表
const loadNotices = async () => {
  loading.value.notices = true
  try {
    const params = {
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      keyword: searchForm.value.keyword || undefined,
      importance: searchForm.value.importance || undefined,
      type: searchForm.value.type || undefined,
      priority: searchForm.value.priority || undefined,
      startDate: searchForm.value.dateRange[0] || undefined,
      endDate: searchForm.value.dateRange[1] || undefined,
      userRole: currentUserRole.value
    }

    const response: ApiResponse = await get(DASHBOARD_ENDPOINTS.NOTICES_IMPORTANT, params)
    if (response.success && response.data) {
      // 为现有数据添加新字段
      const items = (response.data.items || []).map((item: any) => ({
        ...item,
        type: item.type || 'business',
        priority: item.priority || 'medium',
        targetRoles: item.targetRoles || ['admin', 'principal', 'teacher', 'parent'],
        sender: item.sender || {
          id: 1,
          name: '系统管理员',
          role: 'admin'
        }
      }))

      noticeList.value = items
      pagination.value.total = response.data.total || 0
    }
  } catch (error) {
    console.error('加载通知列表失败:', error)
    ElMessage.error('加载通知列表失败')
    // 清空数据，不使用模拟数据
    noticeList.value = []
    pagination.value.total = 0
  } finally {
    loading.value.notices = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
  loadNotices()
}

// 重置搜索
const handleReset = () => {
  searchForm.value.keyword = ''
  searchForm.value.importance = ''
  searchForm.value.type = ''
  searchForm.value.priority = ''
  searchForm.value.dateRange = []
  handleSearch()
}

// 刷新数据
const handleRefresh = () => {
  loadStats()
  loadNotices()
}

// 创建通知
const handleCreate = () => {
  router.push('/dashboard/notices/create')
}

// 查看通知详情
const handleViewNotice = (notice: Notice) => {
  currentNotice.value = notice
  dialogVisible.value = true

  // 标记为已读
  if (!notice.isRead) {
    handleMarkRead(notice)
  }
}

// 标记已读
const handleMarkRead = async (notice: Notice | null) => {
  if (!notice) return

  try {
    const response: ApiResponse = await post(DASHBOARD_ENDPOINTS.NOTICE_READ(notice.id))
    if (response.success) {
      notice.isRead = true
      notice.readCount = Math.min(notice.readCount + 1, notice.totalCount)
      ElMessage.success('标记已读成功')
      loadStats() // 刷新统计数据
    }
  } catch (error) {
    console.error('标记已读失败:', error)
    ElMessage.error('标记已读失败')
  }
}

// 全部标记已读
const handleMarkAllRead = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要将所有通知标记为已读吗？',
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
  type: 'warning'
      }
    )

    const response: ApiResponse = await post(DASHBOARD_ENDPOINTS.NOTICES_MARK_ALL_READ)
    if (response.success) {
      noticeList.value.forEach(notice => {
        notice.isRead = true
      })
      ElMessage.success('全部标记已读成功')
      loadStats()
    }
  } catch (error) {
    // 用户取消操作
  }
}

// 编辑通知
const handleEdit = (notice: Notice) => {
  router.push(`/dashboard/notices/edit/${notice.id}`)
}

// 删除通知
const handleDelete = async (notice: Notice) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除通知"${notice.title}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
  type: 'warning'
      }
    )

    const response: ApiResponse = await del(DASHBOARD_ENDPOINTS.NOTICE_DELETE(notice.id))
    if (response.success) {
      ElMessage.success('删除成功')
      loadNotices()
      loadStats()
    }
  } catch (error) {
    // 用户取消删除
  }
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  loadNotices()
}

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page
  loadNotices()
}

// 对话框关闭
const handleDialogClose = () => {
  currentNotice.value = null
}

// 工具方法
const formatTime = (time: string): string => {
  if (!time) return ''
  return formatDateTime(new Date(time))
}

const getImportanceTagType = (importance: string): 'success' | 'warning' | 'danger' => {
  const typeMap: Record<string, 'success' | 'warning' | 'danger'> = {
    HIGH: 'danger',
    MEDIUM: 'warning',
    LOW: 'success'
  }
  return typeMap[importance] || 'success'
}

const getImportanceText = (importance: string): string => {
  const textMap: Record<string, string> = {
    HIGH: '高',
    MEDIUM: '中',
    LOW: '低'
  }
  return textMap[importance] || '未知'
}

const getReadPercentage = (notice: Notice): number => {
  if (notice.totalCount === 0) return 0
  return Math.round((notice.readCount / notice.totalCount) * 100)
}

const getProgressColor = (percentage: number): string => {
  if (percentage < 30) return getDangerColor()
  if (percentage < 70) return getWarningColor()
  return getSuccessColor()
}

// 7. 生命周期
onMounted(() => {
  loadStats()
  loadNotices()
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;
@use './dashboard-ux-styles.scss' as *;

/* 在现有样式基础上，应用新的仪表板UX样式 */
.dashboard-container {
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-secondary); /* 白色区域修复：使用主题背景色 */
  min-height: calc(100vh - var(--header-height, 60px));
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */

  .page-title {
    margin: 0;
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
    background: var(--gradient-orange); /* 硬编码修复：使用橙色渐变 */
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* 按钮排版修复：页面头部操作按钮 */
  .page-actions {
    display: flex;
    gap: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
    align-items: center;
  }
}

.stats-section {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */

  .stat-card {
    background: var(--bg-card) !important; /* 白色区域修复：强制使用主题卡片背景 */
    border: var(--border-width-base) solid var(--border-color) !important; /* 白色区域修复：使用主题边框色 */
    box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(var(--transform-hover-lift));
      box-shadow: var(--shadow-md); /* 硬编码修复：使用统一阴影变量 */
    }

    &.primary {
      border-left: var(--spacing-xs) solid var(--primary-color); /* 硬编码修复：使用主题主色 */
    }

    &.success {
      border-left: var(--spacing-xs) solid var(--success-color); /* 硬编码修复：使用主题成功色 */
    }

    &.warning {
      border-left: var(--spacing-xs) solid var(--warning-color); /* 硬编码修复：使用主题警告色 */
    }

    &.danger {
      border-left: var(--spacing-xs) solid var(--danger-color); /* 硬编码修复：使用主题危险色 */
    }

    .stat-card-content {
      display: flex;
      align-items: center;
      gap: var(--app-gap); /* 硬编码修复：使用统一间距变量 */

      .stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: auto;
        min-height: 60px; height: auto;
        border-radius: var(--radius-full);
        background: var(--primary-light-9); /* 白色区域修复：使用主题浅色背景 */
        color: var(--primary-color); /* 白色区域修复：使用主题主色 */
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: var(--text-3xl);
          font-weight: 600;
          color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
          line-height: 1;
        }

        .stat-label {
          font-size: var(--text-sm);
          color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */
          margin-top: var(--app-gap-xs); /* 硬编码修复：使用统一间距变量 */
        }
      }
    }
  }
}

.filter-section {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-card) !important; /* 白色区域修复：强制使用主题卡片背景 */
  border: var(--border-width-base) solid var(--border-color) !important; /* 白色区域修复：使用主题边框色 */

  .search-form {
    margin: 0;

    .el-form-item {
      margin-bottom: 0;
    }
  }
}

.notices-section {
  background: var(--bg-card) !important; /* 白色区域修复：强制使用主题卡片背景 */
  border: var(--border-width-base) solid var(--border-color) !important; /* 白色区域修复：使用主题边框色 */

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
      color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
      font-weight: 600;
    }

    /* 按钮排版修复：卡片头部操作按钮 */
    .header-actions {
      display: flex;
      gap: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
      align-items: center;
    }
  }

  .notice-list {
    .notice-item {
      background: var(--bg-tertiary); /* 白色区域修复：使用主题背景 */
      border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
      border-radius: var(--radius-md); /* 硬编码修复：使用统一圆角变量 */
      padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
      margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: var(--shadow-md); /* 硬编码修复：使用统一阴影变量 */
        transform: translateY(var(--z-index-below));
      }

      &.unread {
        border-left: var(--spacing-xs) solid var(--primary-color); /* 硬编码修复：使用主题主色 */
        background: var(--primary-light-9); /* 白色区域修复：使用主题浅色背景 */
      }

      &.high-importance {
        border-left: var(--spacing-xs) solid var(--danger-color); /* 硬编码修复：使用主题危险色 */
      }

      .notice-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */

        .notice-title {
          display: flex;
          align-items: center;
          gap: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary); /* 白色区域修复：使用主题文字色 */

          .importance-icon {
            color: var(--danger-color); /* 白色区域修复：使用主题危险色 */
          }
        }

        .notice-meta {
          display: flex;
          align-items: center;
          gap: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */

          .publish-time {
            font-size: var(--text-xs);
            color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */
          }
        }
      }

      .notice-content {
        margin-bottom: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */

        p {
          margin: 0;
          color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */
          line-height: 1.6;
        }
      }

      .notice-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .read-stats {
          display: flex;
          align-items: center;
          gap: var(--app-gap-xs); /* 硬编码修复：使用统一间距变量 */
          font-size: var(--text-xs);
          color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */
        }

        /* 按钮排版修复：通知操作按钮 */
        .notice-actions {
          display: flex;
          gap: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
          align-items: center;
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: var(--spacing-xl) 0; /* 硬编码修复：使用统一间距变量 */
    color: var(--text-muted); /* 白色区域修复：使用主题静音文字色 */
  }

  .pagination-section {
    display: flex;
    justify-content: flex-end;
    margin-top: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
    padding-top: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
    border-top: var(--z-index-dropdown) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
    background: var(--bg-tertiary); /* 白色区域修复：使用主题背景 */
  }
}

.notice-detail {
  .detail-header {
    margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */

    h3 {
      margin: 0 0 var(--app-gap-sm) 0; /* 硬编码修复：使用统一间距变量 */
      font-size: var(--spacing-lg);
      color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
    }

    .detail-meta {
      display: flex;
      align-items: center;
      gap: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */

      .publish-time {
        font-size: var(--text-sm);
        color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */
      }
    }
  }

  .detail-content {
    margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */

    p {
      margin: 0;
      line-height: 1.8;
      color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
    }
  }

  .detail-footer {
    .read-stats {
      span {
        margin-top: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
        display: block;
        font-size: var(--text-sm);
        color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */
      }
    }
  }
}

/* 按钮排版修复：对话框底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  align-items: center;
}

/* 白色区域修复：Card组件主题化 */
:deep(.el-card) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;

  .el-card__header {
    background: var(--bg-tertiary) !important;
    border-bottom-color: var(--border-color) !important;
    color: var(--text-primary) !important;
  }

  .el-card__body {
    background: var(--bg-card) !important;
    color: var(--text-primary) !important;
  }
}

/* 白色区域修复：按钮主题化 */
:deep(.el-button) {
  &.el-button--primary {
    background: var(--primary-color) !important;
    border-color: var(--primary-color) !important;

    &:hover {
      background: var(--primary-light) !important;
      border-color: var(--primary-light) !important;
    }
  }

  &.el-button--success {
    background: var(--success-color) !important;
    border-color: var(--success-color) !important;

    &:hover {
      background: var(--success-light) !important;
      border-color: var(--success-light) !important;
    }
  }

  &.el-button--text {
    color: var(--primary-color) !important;

    &:hover {
      color: var(--primary-light) !important;
      background: var(--primary-light-9) !important;
    }
  }

  &.el-button--default {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
    color: var(--text-primary) !important;

    &:hover {
      background: var(--bg-hover) !important;
      border-color: var(--border-light) !important;
    }
  }
}

/* 白色区域修复：Tag组件主题化 */
:deep(.el-tag) {
  &.el-tag--success {
    background: var(--success-light-9) !important;
    border-color: var(--success-color) !important;
    color: var(--success-color) !important;
  }

  &.el-tag--danger {
    background: var(--danger-light-9) !important;
    border-color: var(--danger-color) !important;
    color: var(--danger-color) !important;
  }

  &.el-tag--warning {
    background: var(--warning-light-9) !important;
    border-color: var(--warning-color) !important;
    color: var(--warning-color) !important;
  }

  &.el-tag--info {
    background: var(--info-light-9) !important;
    border-color: var(--info-color) !important;
    color: var(--info-color) !important;
  }
}

/* 白色区域修复：表单组件主题化 */
:deep(.el-form-item__label) {
  color: var(--text-primary) !important;
}

:deep(.el-input) {
  .el-input__wrapper {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;

    &:hover {
      border-color: var(--border-light) !important;
    }

    &.is-focus {
      border-color: var(--primary-color) !important;
    }
  }

  .el-input__inner {
    background: transparent !important;
    color: var(--text-primary) !important;

    &::placeholder {
      color: var(--text-muted) !important;
    }
  }
}

:deep(.el-select) {
  .el-input__wrapper {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
  }
}

:deep(.el-date-editor) {
  .el-input__wrapper {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
  }
}

/* 白色区域修复：分页组件主题化 */
:deep(.el-pagination) {
  .el-pager li {
    background: var(--bg-tertiary) !important;
    color: var(--text-primary) !important;
    border: var(--border-width-base) solid var(--border-color) !important;

    &:hover {
      background: var(--bg-hover) !important;
    }

    &.is-active {
      background: var(--primary-color) !important;
      color: white !important;
      border-color: var(--primary-color) !important;
    }
  }

  .btn-prev,
  .btn-next {
    background: var(--bg-tertiary) !important;
    color: var(--text-primary) !important;
    border: var(--border-width-base) solid var(--border-color) !important;

    &:hover {
      background: var(--bg-hover) !important;
    }
  }

  .el-select .el-input {
    .el-input__wrapper {
      background: var(--bg-tertiary) !important;
      border-color: var(--border-color) !important;
    }
  }
}

/* 白色区域修复：对话框主题化 */
:deep(.el-dialog) {
  background: var(--bg-card) !important;
  border: var(--border-width-base) solid var(--border-color) !important;

  .el-dialog__header {
    background: var(--bg-tertiary) !important;
    border-bottom: var(--z-index-dropdown) solid var(--border-color) !important;

    .el-dialog__title {
      color: var(--text-primary) !important;
    }
  }

  .el-dialog__body {
    background: var(--bg-card) !important;
    color: var(--text-primary) !important;
  }

  .el-dialog__footer {
    background: var(--bg-tertiary) !important;
    border-top: var(--z-index-dropdown) solid var(--border-color) !important;
  }
}

/* 白色区域修复：Empty组件主题化 */
:deep(.el-empty) {
  .el-empty__description {
    color: var(--text-muted) !important;
  }
}

/* 白色区域修复：Progress组件主题化 */
:deep(.el-progress) {
  .el-progress-bar__outer {
    background: var(--bg-tertiary) !important;
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--app-gap); /* 硬编码修复：使用统一间距变量 */

    .page-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }

  .stats-section {
    .el-col {
      margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
    }
  }

  .filter-section {
    .search-form {
      .el-form-item {
        width: 100%;
        margin-right: 0;
      }
    }
  }

  .notice-list {
    .notice-item {
      .notice-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
      }

      .notice-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
      }
    }
  }

  /* 按钮排版修复：移动端按钮优化 */
  .page-actions,
  .header-actions,
  .notice-actions {
    flex-direction: column;
    align-items: stretch;

    .el-button {
      width: 100%;
      justify-content: center;
      margin-bottom: var(--app-gap-xs);

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

@media (max-width: 992px) {
  .stats-section {
    .el-col {
      margin-bottom: var(--app-gap);
    }
  }

  /* 角色相关样式 */
  .header-left {
    display: flex;
    align-items: center;
    gap: var(--text-sm);
  }

  .notice-tags {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    margin-left: var(--text-sm);
  }

  .notice-tags .el-tag {
    font-size: var(--text-xs);
    height: var(--text-2xl);
    line-height: var(--text-xl);
  }
}
</style>

