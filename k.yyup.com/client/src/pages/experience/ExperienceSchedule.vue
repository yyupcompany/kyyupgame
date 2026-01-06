<template>
  <div class="experience-schedule-container">
    <!-- 页面头部 -->
    <div class="schedule-header">
      <div class="header-content">
        <div class="page-title">
          <h1>体验课表</h1>
          <p>管理和安排幼儿园体验课程时间表</p>
        </div>
        <div class="header-actions">
          <el-button @click="handleRefresh">
            <UnifiedIcon name="Refresh" />
            刷新
          </el-button>
          <el-button type="primary" @click="handleAddExperience">
            <UnifiedIcon name="Plus" />
            新增体验课
          </el-button>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <el-card shadow="never">
        <el-form :model="filterForm" inline class="filter-form">
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
          
          <el-form-item label="课程类型">
            <el-select
              v-model="filterForm.courseType"
              placeholder="选择课程类型"
              clearable
              @change="handleFilterChange"
            >
              <el-option label="艺术体验" value="art" />
              <el-option label="音乐体验" value="music" />
              <el-option label="运动体验" value="sports" />
              <el-option label="科学探索" value="science" />
              <el-option label="语言启蒙" value="language" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="年龄段">
            <el-select
              v-model="filterForm.ageGroup"
              placeholder="选择年龄段"
              clearable
              @change="handleFilterChange"
            >
              <el-option label="2-3岁" value="2-3" />
              <el-option label="3-4岁" value="3-4" />
              <el-option label="4-5岁" value="4-5" />
              <el-option label="5-6岁" value="5-6" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="状态">
            <el-select
              v-model="filterForm.status"
              placeholder="选择状态"
              clearable
              @change="handleFilterChange"
            >
              <el-option label="待开始" value="pending" />
              <el-option label="进行中" value="ongoing" />
              <el-option label="已结束" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button @click="handleResetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 课表视图切换 -->
    <div class="view-controls">
      <el-card shadow="never">
        <div class="controls-content">
          <div class="view-tabs">
            <el-radio-group v-model="viewMode" @change="handleViewModeChange">
              <el-radio-button label="week">周视图</el-radio-button>
              <el-radio-button label="month">月视图</el-radio-button>
              <el-radio-button label="list">列表视图</el-radio-button>
            </el-radio-group>
          </div>
          
          <div class="date-navigation" v-if="viewMode !== 'list'">
            <el-button @click="handlePrevPeriod">
              <UnifiedIcon name="ArrowLeft" />
            </el-button>
            <span class="current-period">{{ currentPeriodText }}</span>
            <el-button @click="handleNextPeriod">
              <UnifiedIcon name="ArrowRight" />
            </el-button>
            <el-button @click="handleToday">今天</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 课表内容 -->
    <div class="schedule-content">
      <!-- 周视图 -->
      <div v-if="viewMode === 'week'" class="week-view">
        <el-card shadow="never">
          <div class="week-calendar">
            <div class="week-header">
              <div class="time-column">时间</div>
              <div
                v-for="day in weekDays"
                :key="day.date"
                class="day-column"
                :class="{ today: day.isToday }"
              >
                <div class="day-name">{{ day.name }}</div>
                <div class="day-date">{{ day.date }}</div>
              </div>
            </div>
            
            <div class="week-body">
              <div
                v-for="hour in timeSlots"
                :key="hour"
                class="time-row"
              >
                <div class="time-label">{{ hour }}</div>
                <div
                  v-for="day in weekDays"
                  :key="`${day.date}-${hour}`"
                  class="time-cell"
                  @click="handleCellClick(day.date, hour)"
                >
                  <div
                    v-for="experience in getExperiencesForSlot(day.date, hour)"
                    :key="experience.id"
                    class="experience-item"
                    :class="getExperienceClass(experience)"
                    @click.stop="handleExperienceClick(experience)"
                  >
                    <div class="experience-title">{{ experience.title }}</div>
                    <div class="experience-info">
                      {{ experience.ageGroup }} | {{ experience.teacher }}
                    </div>
                    <div class="experience-participants">
                      {{ experience.currentParticipants }}/{{ experience.maxParticipants }}人
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 月视图 -->
      <div v-if="viewMode === 'month'" class="month-view">
        <el-card shadow="never">
          <div class="month-calendar">
            <div class="month-header">
              <div
                v-for="dayName in ['日', '一', '二', '三', '四', '五', '六']"
                :key="dayName"
                class="month-day-header"
              >
                {{ dayName }}
              </div>
            </div>
            
            <div class="month-body">
              <div
                v-for="week in monthWeeks"
                :key="week.weekNumber"
                class="month-week"
              >
                <div
                  v-for="day in week.days"
                  :key="day.date"
                  class="month-day"
                  :class="{
                    'other-month': !day.isCurrentMonth,
                    'today': day.isToday,
                    'has-experiences': day.experiences.length > 0
                  }"
                  @click="handleDayClick(day)"
                >
                  <div class="day-number">{{ day.dayNumber }}</div>
                  <div class="day-experiences">
                    <div
                      v-for="experience in day.experiences.slice(0, 3)"
                      :key="experience.id"
                      class="mini-experience"
                      :class="getExperienceClass(experience)"
                    >
                      {{ experience.title }}
                    </div>
                    <div
                      v-if="day.experiences.length > 3"
                      class="more-experiences"
                    >
                      +{{ day.experiences.length - 3 }}更多
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 列表视图 -->
      <div v-if="viewMode === 'list'" class="list-view">
        <el-card shadow="never">
          <div class="table-wrapper">
<el-table class="responsive-table"
            :data="filteredExperiences"
            stripe
            v-loading="loading"
          >
            <el-table-column prop="title" label="课程名称" min-width="150" />
            
            <el-table-column label="课程类型" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="getCourseTypeTagType(row.courseType)" size="small">
                  {{ getCourseTypeText(row.courseType) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="time" label="时间" width="120" />
            <el-table-column prop="duration" label="时长" width="80" align="center">
              <template #default="{ row }">
                {{ row.duration }}分钟
              </template>
            </el-table-column>
            
            <el-table-column prop="ageGroup" label="年龄段" width="100" align="center" />
            <el-table-column prop="teacher" label="授课老师" width="120" />
            
            <el-table-column label="报名情况" width="120" align="center">
              <template #default="{ row }">
                <el-progress
                  :percentage="(row.currentParticipants / row.maxParticipants) * 100"
                  :stroke-width="8"
                  :show-text="false"
                />
                <div class="participants-text">
                  {{ row.currentParticipants }}/{{ row.maxParticipants }}
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button type="text" size="small" @click="handleView(row)">
                  查看
                </el-button>
                <el-button type="text" size="small" @click="handleEdit(row)">
                  编辑
                </el-button>
                <el-button type="text" size="small" @click="handleManageParticipants(row)">
                  管理报名
                </el-button>
                <el-dropdown @command="(command) => handleMoreAction(command, row)">
                  <el-button type="text" size="small">
                    更多<UnifiedIcon name="ArrowDown" />
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="duplicate">复制课程</el-dropdown-item>
                      <el-dropdown-item command="cancel" v-if="row.status === 'pending'">取消课程</el-dropdown-item>
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
              :total="totalExperiences"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </div>
    </div>

    <!-- 体验课详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="体验课详情"
      width="600px"
    >
      <div v-if="selectedExperience" class="experience-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="课程名称" :span="2">
            {{ selectedExperience.title }}
          </el-descriptions-item>
          <el-descriptions-item label="课程类型">
            {{ getCourseTypeText(selectedExperience.courseType) }}
          </el-descriptions-item>
          <el-descriptions-item label="年龄段">
            {{ selectedExperience.ageGroup }}
          </el-descriptions-item>
          <el-descriptions-item label="日期时间">
            {{ selectedExperience.date }} {{ selectedExperience.time }}
          </el-descriptions-item>
          <el-descriptions-item label="课程时长">
            {{ selectedExperience.duration }}分钟
          </el-descriptions-item>
          <el-descriptions-item label="授课老师">
            {{ selectedExperience.teacher }}
          </el-descriptions-item>
          <el-descriptions-item label="报名情况">
            {{ selectedExperience.currentParticipants }}/{{ selectedExperience.maxParticipants }}人
          </el-descriptions-item>
          <el-descriptions-item label="课程描述" :span="2">
            {{ selectedExperience.description }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleEdit(selectedExperience)">编辑</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Refresh, ArrowLeft, ArrowRight, ArrowDown
} from '@element-plus/icons-vue'
import { formatDate } from '@/utils/date'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const viewMode = ref('week')
const detailDialogVisible = ref(false)
const selectedExperience = ref(null)

// 筛选表单
const filterForm = reactive({
  dateRange: [],
  courseType: '',
  ageGroup: '',
  status: ''
})

// 当前时间
const currentDate = ref(new Date())

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 20
})

// 时间段
const timeSlots = [
  '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
]

// 模拟体验课数据
const experiences = ref([
  {
    id: '1',
    title: '创意美术体验',
    courseType: 'art',
    date: '2024-01-15',
    time: '09:00',
    duration: 60,
    ageGroup: '3-4岁',
    teacher: '张老师',
    currentParticipants: 8,
    maxParticipants: 12,
    status: 'pending',
    description: '通过绘画、手工等活动，培养孩子的创造力和想象力'
  },
  {
    id: '2',
    title: '音乐启蒙体验',
    courseType: 'music',
    date: '2024-01-15',
    time: '10:00',
    duration: 45,
    ageGroup: '2-3岁',
    teacher: '李老师',
    currentParticipants: 6,
    maxParticipants: 10,
    status: 'ongoing',
    description: '通过歌唱、律动等活动，培养孩子的音乐感知能力'
  },
  {
    id: '3',
    title: '运动体验课',
    courseType: 'sports',
    date: '2024-01-16',
    time: '15:00',
    duration: 50,
    ageGroup: '4-5岁',
    teacher: '王老师',
    currentParticipants: 10,
    maxParticipants: 15,
    status: 'pending',
    description: '通过各种运动游戏，提高孩子的身体协调能力'
  }
])

// 计算属性
const weekDays = computed(() => {
  const days = []
  const startOfWeek = new Date(currentDate.value)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    
    days.push({
      name: ['日', '一', '二', '三', '四', '五', '六'][i],
      date: formatDate(day, 'YYYY-MM-DD'),
      isToday: formatDate(day, 'YYYY-MM-DD') === formatDate(new Date(), 'YYYY-MM-DD')
    })
  }
  
  return days
})

const monthWeeks = computed(() => {
  // 生成月视图的周数据
  const weeks = []
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  // 简化实现，实际应该计算完整的月视图
  for (let week = 0; week < 6; week++) {
    const days = []
    for (let day = 0; day < 7; day++) {
      const date = new Date(year, month, week * 7 + day - 6)
      days.push({
        date: formatDate(date, 'YYYY-MM-DD'),
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: formatDate(date, 'YYYY-MM-DD') === formatDate(new Date(), 'YYYY-MM-DD'),
        experiences: experiences.value.filter(exp => exp.date === formatDate(date, 'YYYY-MM-DD'))
      })
    }
    weeks.push({ weekNumber: week, days })
  }
  
  return weeks
})

const currentPeriodText = computed(() => {
  if (viewMode.value === 'week') {
    return `${formatDate(currentDate.value, 'YYYY年MM月DD日')} 周`
  } else {
    return `${formatDate(currentDate.value, 'YYYY年MM月')}`
  }
})

const filteredExperiences = computed(() => {
  let filtered = experiences.value
  
  if (filterForm.courseType) {
    filtered = filtered.filter(exp => exp.courseType === filterForm.courseType)
  }
  
  if (filterForm.ageGroup) {
    filtered = filtered.filter(exp => exp.ageGroup === filterForm.ageGroup)
  }
  
  if (filterForm.status) {
    filtered = filtered.filter(exp => exp.status === filterForm.status)
  }
  
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    filtered = filtered.filter(exp => 
      exp.date >= filterForm.dateRange[0] && exp.date <= filterForm.dateRange[1]
    )
  }
  
  return filtered
})

const totalExperiences = computed(() => filteredExperiences.value.length)

// 方法
const handleRefresh = () => {
  ElMessage.success('数据已刷新')
}

const handleAddExperience = () => {
  router.push('/experience/create')
}

const handleFilterChange = () => {
  // 筛选变化时的处理
}

const handleResetFilter = () => {
  Object.assign(filterForm, {
    dateRange: [],
    courseType: '',
    ageGroup: '',
    status: ''
  })
}

const handleViewModeChange = () => {
  // 视图模式变化时的处理
}

const handlePrevPeriod = () => {
  if (viewMode.value === 'week') {
    currentDate.value.setDate(currentDate.value.getDate() - 7)
  } else {
    currentDate.value.setMonth(currentDate.value.getMonth() - 1)
  }
  currentDate.value = new Date(currentDate.value)
}

const handleNextPeriod = () => {
  if (viewMode.value === 'week') {
    currentDate.value.setDate(currentDate.value.getDate() + 7)
  } else {
    currentDate.value.setMonth(currentDate.value.getMonth() + 1)
  }
  currentDate.value = new Date(currentDate.value)
}

const handleToday = () => {
  currentDate.value = new Date()
}

const getExperiencesForSlot = (date: string, hour: string) => {
  return experiences.value.filter(exp => 
    exp.date === date && exp.time === hour
  )
}

const getExperienceClass = (experience: any) => {
  return {
    [`experience-${experience.courseType}`]: true,
    [`experience-${experience.status}`]: true
  }
}

const handleCellClick = (date: string, hour: string) => {
  // 点击空白时间格时的处理
  router.push(`/experience/create?date=${date}&time=${hour}`)
}

const handleExperienceClick = (experience: any) => {
  selectedExperience.value = experience
  detailDialogVisible.value = true
}

const handleDayClick = (day: any) => {
  if (day.experiences.length > 0) {
    // 显示当天的体验课列表
    ElMessage.info(`${day.date} 有 ${day.experiences.length} 个体验课`)
  }
}

const handleView = (experience: any) => {
  selectedExperience.value = experience
  detailDialogVisible.value = true
}

const handleEdit = (experience: any) => {
  router.push(`/experience/edit/${experience.id}`)
}

const handleManageParticipants = (experience: any) => {
  router.push(`/experience/${experience.id}/participants`)
}

const handleMoreAction = (command: string, experience: any) => {
  switch (command) {
    case 'duplicate':
      ElMessage.info('复制课程功能开发中')
      break
    case 'cancel':
      handleCancelExperience(experience)
      break
    case 'delete':
      handleDeleteExperience(experience)
      break
  }
}

const handleCancelExperience = async (experience: any) => {
  try {
    await ElMessageBox.confirm('确定要取消这个体验课吗？', '取消确认', {
      type: 'warning'
    })
    ElMessage.success('体验课已取消')
  } catch {
    // 用户取消
  }
}

const handleDeleteExperience = async (experience: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个体验课吗？删除后无法恢复。', '删除确认', {
      type: 'warning'
    })
    ElMessage.success('体验课已删除')
  } catch {
    // 用户取消
  }
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
}

// 工具方法
const getCourseTypeText = (type: string) => {
  const typeMap = {
    'art': '艺术体验',
    'music': '音乐体验',
    'sports': '运动体验',
    'science': '科学探索',
    'language': '语言启蒙'
  }
  return typeMap[type] || '未知'
}

const getCourseTypeTagType = (type: string) => {
  const typeMap = {
    'art': 'primary',
    'music': 'success',
    'sports': 'warning',
    'science': 'info',
    'language': 'danger'
  }
  return typeMap[type] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap = {
    'pending': '待开始',
    'ongoing': '进行中',
    'completed': '已结束',
    'cancelled': '已取消'
  }
  return statusMap[status] || '未知'
}

const getStatusTagType = (status: string) => {
  const typeMap = {
    'pending': 'info',
    'ongoing': 'success',
    'completed': 'primary',
    'cancelled': 'danger'
  }
  return typeMap[status] || 'info'
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss">
.experience-schedule-container {
  padding: var(--text-2xl);
  max-width: 100%; max-width: 1400px;
  margin: 0 auto;
}

.schedule-header {
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

.filter-toolbar {
  margin-bottom: var(--text-3xl);
  
  .filter-form {
    .el-form-item {
      margin-bottom: 0;
    }
  }
}

.view-controls {
  margin-bottom: var(--text-3xl);
  
  .controls-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .date-navigation {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      
      .current-period {
        font-weight: 500;
        color: var(--text-primary);
        min-max-width: 150px; width: 100%;
        text-align: center;
      }
    }
  }
}

.week-view {
  .week-calendar {
    .week-header {
      display: grid;
      grid-template-columns: 80px repeat(7, 1fr);
      border-bottom: var(--z-index-dropdown) solid var(--border-color);
      
      .time-column {
        padding: var(--text-sm);
        font-weight: 500;
        color: var(--text-secondary);
        border-right: var(--z-index-dropdown) solid var(--border-color);
      }
      
      .day-column {
        padding: var(--text-sm);
        text-align: center;
        border-right: var(--z-index-dropdown) solid var(--border-color);
        
        &.today {
          background: #f0f9ff;
          color: var(--primary-color);
        }
        
        .day-name {
          font-weight: 500;
          margin-bottom: var(--spacing-xs);
        }
        
        .day-date {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
        }
      }
    }
    
    .week-body {
      .time-row {
        display: grid;
        grid-template-columns: 80px repeat(7, 1fr);
        min-min-height: 60px; height: auto;
        border-bottom: var(--z-index-dropdown) solid #f3f4f6;
        
        .time-label {
          padding: var(--text-sm);
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          border-right: var(--z-index-dropdown) solid var(--border-color);
        }
        
        .time-cell {
          padding: var(--spacing-xs);
          border-right: var(--z-index-dropdown) solid #f3f4f6;
          cursor: pointer;
          
          &:hover {
            background: #f9fafb;
          }
          
          .experience-item {
            padding: var(--spacing-xs) var(--spacing-sm);
            margin-bottom: var(--spacing-sm);
            border-radius: var(--spacing-xs);
            font-size: var(--text-sm);
            cursor: pointer;
            
            &.experience-art {
              background: #fef3c7;
              color: #d97706;
            }
            
            &.experience-music {
              background: #d1fae5;
              color: #059669;
            }
            
            &.experience-sports {
              background: #fecaca;
              color: #dc2626;
            }
            
            &.experience-science {
              background: #dbeafe;
              color: #2563eb;
            }
            
            &.experience-language {
              background: #e9d5ff;
              color: var(--ai-dark);
            }
            
            .experience-title {
              font-weight: 500;
              margin-bottom: var(--spacing-sm);
            }
            
            .experience-info,
            .experience-participants {
              font-size: var(--text-2xs);
              opacity: 0.8;
            }
          }
        }
      }
    }
  }
}

.month-view {
  .month-calendar {
    .month-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      border-bottom: var(--z-index-dropdown) solid var(--border-color);
      
      .month-day-header {
        padding: var(--text-sm);
        text-align: center;
        font-weight: 500;
        color: var(--text-secondary);
        border-right: var(--z-index-dropdown) solid var(--border-color);
      }
    }
    
    .month-body {
      .month-week {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        
        .month-day {
          min-min-height: 60px; height: auto;
          padding: var(--spacing-sm);
          border-right: var(--z-index-dropdown) solid #f3f4f6;
          border-bottom: var(--z-index-dropdown) solid #f3f4f6;
          cursor: pointer;
          
          &.other-month {
            color: var(--border-color);
            background: #f9fafb;
          }
          
          &.today {
            background: #f0f9ff;
          }
          
          &.has-experiences {
            background: #fefce8;
          }
          
          .day-number {
            font-weight: 500;
            margin-bottom: var(--spacing-xs);
          }
          
          .day-experiences {
            .mini-experience {
              font-size: var(--text-2xs);
              padding: var(--spacing-sm) var(--spacing-xs);
              margin-bottom: var(--spacing-sm);
              border-radius: var(--radius-xs);
              white-space: nowrap;
              overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
              text-overflow: ellipsis;
            }
            
            .more-experiences {
              font-size: var(--text-2xs);
              color: var(--text-secondary);
              text-align: center;
            }
          }
        }
      }
    }
  }
}

.list-view {
  .participants-text {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin-top: var(--spacing-xs);
  }
  
  .pagination-wrapper {
    margin-top: var(--text-3xl);
    display: flex;
    justify-content: center;
  }
}

.experience-detail {
  .el-descriptions {
    margin-top: var(--text-2xl);
  }
}

@media (max-width: var(--breakpoint-md)) {
  .experience-schedule-container {
    padding: var(--text-lg);
  }
  
  .schedule-header .header-content {
    flex-direction: column;
    gap: var(--text-lg);
    text-align: center;
  }
  
  .view-controls .controls-content {
    flex-direction: column;
    gap: var(--text-lg);
  }
  
  .filter-form {
    .el-form-item {
      display: block;
      margin-bottom: var(--text-lg);
    }
  }
  
  .week-calendar {
    overflow-x: auto;
  }
  
  .month-calendar {
    .month-day {
      min-min-height: 60px; height: auto;
    }
  }
}
</style>
