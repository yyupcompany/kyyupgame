<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">日程安排</h1>
      <div class="page-actions">
        <el-button type="primary" @click="handleCreateEvent">
          <UnifiedIcon name="Plus" />
          新建事件
        </el-button>
        <el-button type="success" @click="handleExport">
          <UnifiedIcon name="Download" />
          导出日程
        </el-button>
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <el-row :gutter="rowGutter" class="stats-section">
      <el-col :xs="24" :sm="12" :md="6" v-for="(stat, index) in statCards" :key="index">
        <el-card class="stat-card" :class="stat.type" shadow="hover">
          <div class="stat-card-content">
            <div class="stat-icon">
              <UnifiedIcon name="default" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 日程视图控制 -->
    <el-card class="view-control-section" shadow="never">
      <div class="view-controls">
        <div class="view-type-buttons">
          <el-radio-group v-model="viewType" @change="handleViewTypeChange">
            <el-radio-button value="month">月视图</el-radio-button>
            <el-radio-button value="week">周视图</el-radio-button>
            <el-radio-button value="day">日视图</el-radio-button>
            <el-radio-button value="list">列表视图</el-radio-button>
          </el-radio-group>
        </div>
        <div class="date-navigation">
          <el-button @click="handlePrevPeriod">
            <UnifiedIcon name="ArrowLeft" />
          </el-button>
          <el-date-picker
            v-model="currentDate"
            type="date"
            placeholder="选择日期"
            @change="handleDateChange"
          />
          <el-button @click="handleNextPeriod">
            <UnifiedIcon name="ArrowRight" />
          </el-button>
          <el-button @click="handleToday">今天</el-button>
        </div>
      </div>
    </el-card>

    <!-- 日程内容区域 -->
    <el-row :gutter="rowGutter" class="schedule-content">
      <el-col :xs="24" :lg="18">
        <!-- 日历视图 -->
        <el-card class="calendar-section" shadow="never" v-if="viewType !== 'list'">
          <div class="calendar-container">
            <el-calendar v-model="currentDate" v-if="viewType === 'month'">
              <template #date-cell="{ data }">
                <div class="calendar-day">
                  <div class="day-number">{{ data.day.split('-').slice(-1)[0] }}</div>
                  <div class="day-events">
                    <div 
                      v-for="event in getDayEvents(data.day)" 
                      :key="event.id"
                      class="event-item"
                      :class="event.type"
                      @click="handleViewEvent(event)"
                    >
                      {{ event.title }}
                    </div>
                  </div>
                </div>
              </template>
            </el-calendar>
            
            <!-- 周视图和日视图 -->
            <div v-else class="time-view">
              <div class="time-grid">
                <div class="time-slots">
                  <div 
                    v-for="hour in timeSlots" 
                    :key="hour"
                    class="time-slot"
                  >
                    {{ hour }}:00
                  </div>
                </div>
                <div class="schedule-grid">
                  <div 
                    v-for="day in getViewDays()" 
                    :key="day"
                    class="day-column"
                  >
                    <div class="day-header">{{ formatDayHeader(day) }}</div>
                    <div class="day-schedule">
                      <div 
                        v-for="event in getDayEvents(day)" 
                        :key="event.id"
                        class="schedule-event"
                        :class="event.type"
                        :style="getEventStyle(event)"
                        @click="handleViewEvent(event)"
                      >
                        <div class="event-time">{{ formatEventTime(event) }}</div>
                        <div class="event-title">{{ event.title }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 列表视图 -->
        <el-card class="list-section" shadow="never" v-else>
          <div class="table-wrapper">
<el-table class="responsive-table full-width" :data="eventList">
            <el-table-column prop="title" label="事件标题" :min-width="titleMinWidth" />
            <el-table-column prop="type" label="类型" :width="typeColumnWidth">
              <template #default="scope">
                <el-tag :type="getEventTagType(scope.row.type)">
                  {{ getEventTypeText(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="startTime" label="开始时间" :width="timeColumnWidth">
              <template #default="scope">
                {{ formatTime(scope.row.startTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="endTime" label="结束时间" :width="timeColumnWidth">
              <template #default="scope">
                {{ formatTime(scope.row.endTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="location" label="地点" :width="locationColumnWidth" />
            <el-table-column label="操作" :width="operationColumnWidth">
              <template #default="scope">
                <el-button type="primary" size="small" @click="handleViewEvent(scope.row)">
                  查看
                </el-button>
                <el-button type="warning" size="small" @click="handleEditEvent(scope.row)">
                  编辑
                </el-button>
                <el-button type="danger" size="small" @click="handleDeleteEvent(scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
</div>
        </el-card>
      </el-col>

      <!-- 侧边栏 -->
      <el-col :xs="24" :lg="6">
        <el-card class="sidebar-section" shadow="never">
          <template #header>
            <span>快捷操作</span>
          </template>
          <div class="quick-actions">
            <el-button 
              v-for="action in quickActions" 
              :key="action.key"
              :type="action.type"
              class="action-button"
              @click="handleQuickAction(action.key)"
            >
              <UnifiedIcon name="default" />
              {{ action.label }}
            </el-button>
          </div>
        </el-card>

        <el-card class="upcoming-section mt-16" shadow="never">
          <template #header>
            <span>即将到来的事件</span>
          </template>
          <div class="upcoming-events">
            <div 
              v-for="event in upcomingEvents" 
              :key="event.id"
              class="upcoming-event"
              @click="handleViewEvent(event)"
            >
              <div class="event-dot" :class="event.type"></div>
              <div class="event-info">
                <div class="event-title">{{ event.title }}</div>
                <div class="event-time">{{ formatEventTime(event) }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 事件编辑对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle" 
      :width="'600px'"
      @close="handleDialogClose"
    >
      <el-form 
        ref="formRef"
        :model="formData" 
        :rules="formRules" 
        :label-width="'120px'"
      >
        <el-form-item label="事件标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入事件标题" :readonly="isViewMode" />
        </el-form-item>
        <el-form-item label="事件类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择事件类型" :disabled="isViewMode">
            <el-option 
              v-for="item in eventTypeOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="formData.startTime"
            type="datetime"
            placeholder="选择开始时间"
            class="full-width"
            :disabled="isViewMode"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="formData.endTime"
            type="datetime"
            placeholder="选择结束时间"
            class="full-width"
            :disabled="isViewMode"
          />
        </el-form-item>
        <el-form-item label="地点" prop="location">
          <el-input v-model="formData.location" placeholder="请输入地点" :readonly="isViewMode" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="formData.description" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入事件描述"
            :readonly="isViewMode"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">
            {{ isViewMode ? '关闭' : '取消' }}
          </el-button>
          <el-button 
            v-if="isViewMode && formData.id"
            type="primary" 
            @click="handleEditFromView"
          >
            编辑
          </el-button>
          <el-button 
            v-if="!isViewMode"
            type="primary" 
            :loading="loading.submit"
            @click="handleSubmit"
          >
            确定
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
import { ElMessage, ElMessageBox, ElForm } from 'element-plus'
import type { FormRules } from 'element-plus'
import { 
  Plus, Download, ArrowLeft, ArrowRight, Calendar, Clock,
  User, Document, Trophy, TrendCharts, Bell, Setting
} from '@element-plus/icons-vue'

// 3. 公共工具函数导入
import request from '../../utils/request'
import { formatDateTime } from '../../utils/dateFormat'

// 解构request实例中的方法
const { get, post, put, del } = request

// 定义统一API响应类型
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

// 统计卡片数据类型
interface StatCard {
  type: string;
  icon: string;
  value: string | number;
  label: string
}

// 事件数据类型
interface ScheduleEvent {
  id: string;
  title: string;
  type: string
  startTime: string
  endTime: string;
  location: string;
  description: string
}

// 快捷操作类型
interface QuickAction {
  key: string;
  type: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
  icon: string;
  label: string
}

const router = useRouter()
const formRef = ref<InstanceType<typeof ElForm> | null>(null)

// CSS变量计算属性
const iconSize = computed(() => 32)
const rowGutter = computed(() => 24)
const typeColumnWidth = computed(() => 100)
const timeColumnWidth = computed(() => 150)
const locationColumnWidth = computed(() => 120)
const operationColumnWidth = computed(() => 200)
const titleMinWidth = computed(() => 200)

// 响应式数据
const loading = ref({
  events: false,
  submit: false
})

const viewType = ref('month')
const currentDate = ref(new Date())
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const isViewMode = computed(() => dialogTitle.value === '查看事件详情')

// 统计卡片数据
const statCards = ref<StatCard[]>([
  {
    type: 'primary',
  icon: 'calendar',
  value: 0,
  label: '本月事件'
  },
  {
    type: 'success',
  icon: 'clock',
  value: 0,
  label: '今日安排'
  },
  {
    type: 'warning',
  icon: 'bell',
  value: 0,
  label: '待处理'
  },
  {
    type: 'danger',
  icon: 'star',
  value: 0,
  label: '重要事件'
  }
])

// 快捷操作数据
const quickActions = ref<QuickAction[]>([
  { key: 'meeting', type: 'primary', icon: 'User', label: '安排会议' },
  { key: 'class', type: 'success', icon: 'Document', label: '排课' },
  { key: 'activity', type: 'warning', icon: 'star', label: '活动安排' },
  { key: 'reminder', type: 'info', icon: 'bell', label: '设置提醒' }
])

// 事件列表
const eventList = ref<ScheduleEvent[]>([])
const upcomingEvents = ref<ScheduleEvent[]>([])

// 表单数据
const formData = ref<ScheduleEvent>({
  id: '',
  title: '',
  type: '',
  startTime: '',
  endTime: '',
  location: '',
  description: ''
})

// 表单验证规则
const formRules: FormRules = {
  title: [
    { required: true, message: '请输入事件标题', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择事件类型', trigger: 'change' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ]
}

// 事件类型选项
const eventTypeOptions = [
  { label: '会议', value: 'meeting' },
  { label: '课程', value: 'class' },
  { label: '活动', value: 'activity' },
  { label: '提醒', value: 'reminder' },
  { label: '其他', value: 'other' }
]

// 时间段
const timeSlots = Array.from({ length: 24 }, (_, i) => i)

// 图标组件映射
const iconComponents = {
  Calendar,
  Clock,
  User,
  Document,
  Trophy,
  TrendCharts,
  Bell,
  Setting
}

// 防止重复请求的标志
const isInitialized = ref(false)
const requestingData = ref(false)

// 获取所有数据的合并方法（优化后）
const fetchAllData = async () => {
  if (requestingData.value) {
    console.log('数据请求中，跳过重复请求')
    return
  }
  
  requestingData.value = true
  loading.value.events = true
  
  try {
    console.log('开始获取所有日程数据')
    
    // 构建查询参数
    const params: any = {
      viewType: viewType.value
    }
    
    // 根据视图类型设置日期范围
    if (viewType.value === 'month') {
      const startOfMonth = new Date(currentDate.value)
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      
      const endOfMonth = new Date(currentDate.value)
      endOfMonth.setMonth(endOfMonth.getMonth() + 1)
      endOfMonth.setDate(0)
      endOfMonth.setHours(23, 59, 59, 999)
      
      params.startDate = startOfMonth.toISOString().split('T')[0]
      params.endDate = endOfMonth.toISOString().split('T')[0]
    } else if (viewType.value === 'week') {
      const startOfWeek = new Date(currentDate.value)
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(endOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)
      
      params.startDate = startOfWeek.toISOString().split('T')[0]
      params.endDate = endOfWeek.toISOString().split('T')[0]
    } else if (viewType.value === 'day') {
      const dayStart = new Date(currentDate.value)
      dayStart.setHours(0, 0, 0, 0)
      
      const dayEnd = new Date(currentDate.value)
      dayEnd.setHours(23, 59, 59, 999)
      
      params.startDate = dayStart.toISOString().split('T')[0]
      params.endDate = dayEnd.toISOString().split('T')[0]
    }
    
    // 调用合并接口
    const response: ApiResponse<{
      stats: any,
      events: ScheduleEvent[],
      upcomingEvents: ScheduleEvent[]
    }> = await get('/dashboard/schedule-data', params)
    
    if (response.success && response.data) {
      // 更新统计数据
      if (response.data.stats) {
        statCards.value[0].value = response.data.stats.monthlyEvents || 0
        statCards.value[1].value = response.data.stats.todayEvents || 0
        statCards.value[2].value = response.data.stats.pendingEvents || 0
        statCards.value[3].value = response.data.stats.importantEvents || 0
      }
      
      // 更新事件列表
      eventList.value = response.data.events || []
      
      // 更新即将到来的事件
      upcomingEvents.value = response.data.upcomingEvents || []
    }
    
    console.log('所有日程数据获取完成')
  } catch (error) {
    console.error('获取日程数据失败:', error)
    ElMessage.error('获取日程数据失败')
  } finally {
    loading.value.events = false
    requestingData.value = false
  }
}

// 保留原有方法作为备用（现在调用合并接口）
const fetchStats = async () => {
  console.log('fetchStats: 使用合并接口，无需单独调用')
}

const fetchEvents = async () => {
  console.log('fetchEvents: 使用合并接口，无需单独调用')
}

const fetchUpcomingEvents = async () => {
  console.log('fetchUpcomingEvents: 使用合并接口，无需单独调用')
}

// 获取日程事件
const getDayEvents = (day: string) => {
  return eventList.value.filter(event => {
    const eventDate = new Date(event.startTime).toISOString().split('T')[0]
    return eventDate === day
  })
}

// 获取视图天数
const getViewDays = () => {
  if (viewType.value === 'day') {
    return [currentDate.value.toISOString().split('T')[0]]
  } else if (viewType.value === 'week') {
    const days = []
    const startOfWeek = new Date(currentDate.value)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(day.getDate() + i)
      days.push(day.toISOString().split('T')[0])
    }
    return days
  }
  return []
}

// 格式化日期头部
const formatDayHeader = (day: string) => {
  const date = new Date(day)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 获取事件样式
const getEventStyle = (event: ScheduleEvent) => {
  const startTime = new Date(event.startTime)
  const endTime = new Date(event.endTime)
  const startHour = startTime.getHours() + startTime.getMinutes() / 60
  const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
  
  // 使用 CSS 变量计算
  const slotHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--time-slot-height')) || 60
  
  return {
    top: `${startHour * slotHeight}px`,
  height: `${duration * slotHeight}px`
  }
}

// 视图类型变化
const handleViewTypeChange = () => {
  fetchAllData()
}

// 日期变化
const handleDateChange = () => {
  fetchAllData()
}

// 上一个时间段
const handlePrevPeriod = () => {
  const date = new Date(currentDate.value)
  if (viewType.value === 'month') {
    date.setMonth(date.getMonth() - 1)
  } else if (viewType.value === 'week') {
    date.setDate(date.getDate() - 7)
  } else {
    date.setDate(date.getDate() - 1)
  }
  currentDate.value = date
  fetchAllData()
}

// 下一个时间段
const handleNextPeriod = () => {
  const date = new Date(currentDate.value)
  if (viewType.value === 'month') {
    date.setMonth(date.getMonth() + 1)
  } else if (viewType.value === 'week') {
    date.setDate(date.getDate() + 7)
  } else {
    date.setDate(date.getDate() + 1)
  }
  currentDate.value = date
  fetchAllData()
}

// 回到今天
const handleToday = () => {
  currentDate.value = new Date()
  fetchAllData()
}

// 创建事件
const handleCreateEvent = () => {
  isEdit.value = false
  dialogTitle.value = '新建事件'
  formData.value = {
    id: '',
  title: '',
  type: '',
    startTime: '',
    endTime: '',
  location: '',
  description: ''
  }
  dialogVisible.value = true
}

// 查看事件
const handleViewEvent = (event: ScheduleEvent) => {
  isEdit.value = false
  dialogTitle.value = '查看事件详情'
  formData.value = { ...event }
  dialogVisible.value = true
}

// 编辑事件
const handleEditEvent = (event: ScheduleEvent) => {
  isEdit.value = true
  dialogTitle.value = '编辑事件'
  formData.value = { ...event }
  dialogVisible.value = true
}

// 从查看模式切换到编辑模式
const handleEditFromView = () => {
  isEdit.value = true
  dialogTitle.value = '编辑事件'
}

// 删除事件
const handleDeleteEvent = async (event: ScheduleEvent) => {
  try {
    await ElMessageBox.confirm('确定要删除这个事件吗？', '确认删除', {
      type: 'warning'
    })
    
    const response: ApiResponse = await del(`/api/schedules/${event.id}`)
    if (response.success) {
      ElMessage.success('删除成功')
      fetchAllData()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    console.error('删除事件失败:', error)
  }
}

// 快捷操作
const handleQuickAction = (actionKey: string) => {
  switch (actionKey) {
    case 'meeting':
      handleCreateEvent()
      formData.value.type = 'meeting'
      break
    case 'class':
      handleCreateEvent()
      formData.value.type = 'class'
      break
    case 'activity':
      handleCreateEvent()
      formData.value.type = 'activity'
      break
    case 'reminder':
      handleCreateEvent()
      formData.value.type = 'reminder'
      break;
  default:
      ElMessage.info(`${actionKey} 功能开发中`)
  }
}

// 导出日程
const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value.submit = true
    
    const url = isEdit.value 
      ? `/schedules/${formData.value.id}` 
      : '/schedules'
    const method = isEdit.value ? put : post
    
    const response: ApiResponse = await method(url, formData.value)
    if (response.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
      fetchAllData()
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('操作失败')
  } finally {
    loading.value.submit = false
  }
}

// 关闭对话框
const handleDialogClose = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 工具函数
const getEventTagType = (type: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    meeting: 'primary',
  class: 'success',
  activity: 'warning',
  reminder: 'info',
  other: 'info'
  }
  return typeMap[type] || 'info'
}

const getEventTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    meeting: '会议',
  class: '课程',
  activity: '活动',
  reminder: '提醒',
  other: '其他'
  }
  return textMap[type] || type
}

const formatTime = (time: string) => {
  return formatDateTime(time)
}

const formatEventTime = (event: ScheduleEvent) => {
  const start = new Date(event.startTime)
  const end = new Date(event.endTime)
  return `${start.getHours()}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours()}:${end.getMinutes().toString().padStart(2, '0')}`
}

// 页面初始化
onMounted(async () => {
  if (isInitialized.value) return
  isInitialized.value = true
  
  console.log('Schedule页面初始化开始')
  try {
    // 串行执行，避免并发请求造成问题
    await fetchAllData()
    console.log('Schedule页面初始化完成')
  } catch (error) {
    console.error('Schedule页面初始化失败:', error)
  }
})
</script>

<style scoped>
.page-container {
  padding: var(--spacing-lg);
  background-color: var(--bg-page);
  min-height: calc(100vh - var(--header-height));
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.page-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.stats-section {
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  border: none;
  transition: all var(--transition-normal);
}

.stat-card:hover {
  transform: var(--transform-hover-sm);
  box-shadow: var(--shadow-lg);
}

.stat-card.primary {
  border-left: var(--border-width-md) solid var(--primary-color);
}

.stat-card.success {
  border-left: var(--border-width-md) solid var(--success-color);
}

.stat-card.warning {
  border-left: var(--border-width-md) solid var(--warning-color);
}

.stat-card.danger {
  border-left: var(--border-width-md) solid var(--danger-color);
}

.stat-card-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: var(--size-xl);
  height: var(--size-xl);
  border-radius: var(--app-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--app-padding);
  background: var(--gradient-blue);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: var(--stat-value-size);
  font-weight: bold;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--text-base);
  color: var(--text-secondary);
}

.view-control-section {
  margin-bottom: var(--spacing-xl);
  border: none;
}

.view-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--app-padding);
}

.date-navigation {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.schedule-content {
  margin-bottom: var(--spacing-xl);
}

.calendar-section,
.list-section {
  border: none;
  background-color: var(--bg-card);
}

/* 确保列表视图卡片有正确的背景 */
.list-section :deep(.el-card__body) {
  padding: 0;
  background-color: var(--bg-card) !important;
}

.calendar-container {
  min-height: var(--calendar-min-height);
}

.calendar-day {
  height: 100%;
  padding: var(--spacing-xs);
}

.day-number {
  font-weight: 600; /* 语义化字重 */
  margin-bottom: var(--spacing-xs);
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: var(--event-gap);
}

.event-item {
  font-size: var(--text-sm);
  padding: var(--event-padding) var(--spacing-xs);
  border-radius: var(--app-radius);
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
  text-overflow: ellipsis;
}

.event-item.meeting {
  background: var(--primary-light-bg);
  color: var(--primary-color);
}

.event-item.class {
  background: var(--success-light-bg);
  color: var(--success-color);
}

.event-item.activity {
  background: var(--warning-light-bg);
  color: var(--warning-color);
}

.event-item.reminder {
  background: var(--info-light-bg);
  color: var(--info-color);
}

.time-view {
  height: var(--time-view-height);
  overflow-y: auto;
}

.time-grid {
  display: flex;
  min-height: var(--time-grid-height);
}

.time-slots {
  width: var(--time-slot-width);
  border-right: var(--border-width) solid var(--border-light);
}

.time-slot {
  height: var(--time-slot-height);
  padding: var(--spacing-xs);
  border-bottom: var(--border-width) solid var(--border-light);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.schedule-grid {
  flex: 1;
  display: flex;
}

.day-column {
  flex: 1;
  border-right: var(--border-width) solid var(--border-light);
  position: relative;
}

.day-header {
  height: var(--day-header-height);
  padding: var(--spacing-xs);
  border-bottom: var(--border-width) solid var(--border-light);
  font-weight: 600; /* 语义化字重 */
  text-align: center;
  background: var(--bg-page);
}

.day-schedule {
  position: relative;
  height: calc(100% - var(--day-header-height));
}

.schedule-event {
  position: absolute;
  left: var(--spacing-xs);
  right: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-xs);
  border-radius: var(--app-radius);
  cursor: pointer;
  font-size: var(--text-sm);
  overflow: hidden;
}

.schedule-event.meeting {
  background: var(--primary-light-bg);
  border-left: var(--border-width-sm) solid var(--primary-color);
}

.schedule-event.class {
  background: var(--success-light-bg);
  border-left: var(--border-width-sm) solid var(--success-color);
}

.schedule-event.activity {
  background: var(--warning-light-bg);
  border-left: var(--border-width-sm) solid var(--warning-color);
}

.schedule-event.reminder {
  background: var(--info-light-bg);
  border-left: var(--border-width-sm) solid var(--info-color);
}

.event-time {
  font-weight: 600; /* 语义化字重 */
  margin-bottom: var(--event-padding);
}

.event-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-section {
  border: none;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.action-button {
  width: 100%;
  justify-content: flex-start;
}

.upcoming-section {
  border: none;
}

.upcoming-events {
  max-height: var(--upcoming-list-height);
  overflow-y: auto;
}

.upcoming-event {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: var(--border-width) solid var(--border-light);
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.upcoming-event:hover {
  background: var(--bg-page);
}

.upcoming-event:last-child {
  border-bottom: none;
}

.event-dot {
  width: var(--size-xs);
  height: var(--size-xs);
  border-radius: var(--radius-full);
  margin-right: var(--spacing-sm);
}

.event-dot.meeting {
  background: var(--primary-color);
}

.event-dot.class {
  background: var(--success-color);
}

.event-dot.activity {
  background: var(--warning-color);
}

.event-dot.reminder {
  background: var(--info-color);
}

.event-info {
  flex: 1;
}

.event-title {
  font-size: var(--text-base);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.event-time {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

/* 工具类 */
.full-width {
  width: 100%;
}

.mt-16 {
  margin-top: var(--app-padding);
}

:deep(.el-card) {
  background-color: var(--bg-card) !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
  box-shadow: var(--shadow-sm) !important;
}

:deep(.el-card.is-hover-shadow:hover) {
  box-shadow: var(--shadow-md) !important;
}

:deep(.el-card__header) {
  background-color: var(--bg-card) !important;
  border-bottom-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

:deep(.el-card__body) {
  background-color: var(--bg-card) !important;
  color: var(--text-primary) !important;
}

/* 表格主题化 */
:deep(.el-table) {
  background-color: var(--bg-card) !important;
  color: var(--text-primary) !important;
}

:deep(.el-table::before) {
  background-color: var(--border-color) !important;
}

:deep(.el-table--border::after) {
  background-color: var(--border-color) !important;
}

:deep(.el-table__inner-wrapper) {
  background-color: var(--bg-card) !important;
}

:deep(.el-table__header-wrapper) {
  background-color: var(--bg-tertiary) !important;
}

:deep(.el-table th.el-table__cell) {
  background-color: var(--bg-tertiary) !important;
  color: var(--text-primary) !important;
  border-bottom-color: var(--border-color) !important;
}

:deep(.el-table tr) {
  background-color: var(--bg-card) !important;
  color: var(--text-primary) !important;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background-color: var(--bg-page) !important;
}

:deep(.el-table td.el-table__cell) {
  border-bottom-color: var(--border-color) !important;
  color: var(--text-primary) !important;
  background-color: var(--bg-card) !important;
}

:deep(.el-table__body tr:hover > td.el-table__cell) {
  background-color: var(--bg-hover) !important;
}

:deep(.el-table__empty-block) {
  background-color: var(--bg-card) !important;
  color: var(--text-secondary) !important;
}

:deep(.el-table__empty-text) {
  color: var(--text-secondary) !important;
}

/* 分页器主题化 */
:deep(.el-pagination) {
  color: var(--text-primary) !important;
}

:deep(.el-pagination button:disabled) {
  background-color: transparent !important;
  color: var(--text-disabled) !important;
}

:deep(.el-pagination .el-pager li) {
  background-color: var(--bg-card) !important;
  color: var(--text-primary) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-pagination .el-pager li.is-active) {
  background-color: var(--primary-color) !important;
  color: white !important;
}

:deep(.el-pagination .el-pager li:hover) {
  color: var(--primary-color) !important;
}

/* 输入框主题化 */
:deep(.el-input__wrapper) {
  background-color: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
  box-shadow: none !important;
}

:deep(.el-input__inner) {
  background-color: transparent !important;
  color: var(--text-primary) !important;
}

:deep(.el-input__wrapper:hover) {
  border-color: var(--border-light) !important;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: var(--primary-color) !important;
}

/* 按钮主题化 */
:deep(.el-button--default) {
  background-color: var(--bg-card) !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

:deep(.el-button--default:hover) {
  background-color: var(--bg-tertiary) !important;
  border-color: var(--primary-color) !important;
  color: var(--primary-color) !important;
}

/* 日期选择器主题化 */
:deep(.el-date-editor .el-input__wrapper) {
  background-color: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-date-editor .el-input__inner) {
  color: var(--text-primary) !important;
}

/* 单选按钮组主题化 */
:deep(.el-radio-button__inner) {
  background-color: var(--bg-card) !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

:deep(.el-radio-button__original:checked + .el-radio-button__inner) {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
  color: white !important;
}

:deep(.el-radio-button__inner:hover) {
  color: var(--primary-color) !important;
}

/* 标签主题化 */
:deep(.el-tag) {
  border-color: transparent !important;
}

/* 对话框主题化 */
:deep(.el-dialog) {
  background-color: var(--bg-card) !important;
  color: var(--text-primary) !important;
}

:deep(.el-dialog__header) {
  border-bottom: var(--border-width) solid var(--border-color) !important;
}

:deep(.el-dialog__title) {
  color: var(--text-primary) !important;
}

:deep(.el-dialog__body) {
  color: var(--text-primary) !important;
}

/* 表单主题化 */
:deep(.el-form-item__label) {
  color: var(--text-primary) !important;
}

/* 文本域主题化 */
:deep(.el-textarea__inner) {
  background-color: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

:deep(.el-textarea__inner:hover) {
  border-color: var(--border-light) !important;
}

:deep(.el-textarea__inner:focus) {
  border-color: var(--primary-color) !important;
}

/* 日历组件主题化 */
:deep(.el-calendar) {
  background-color: var(--bg-card) !important;
}

:deep(.el-calendar__header) {
  border-bottom-color: var(--border-color) !important;
}

:deep(.el-calendar__title) {
  color: var(--text-primary) !important;
}

:deep(.el-calendar-table td) {
  background-color: var(--bg-card) !important;
  color: var(--text-primary) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-calendar-table td.is-today) {
  background-color: var(--primary-light-bg) !important;
  color: var(--primary-color) !important;
}

:deep(.el-calendar-table td:hover) {
  background-color: var(--bg-hover) !important;
}
</style>