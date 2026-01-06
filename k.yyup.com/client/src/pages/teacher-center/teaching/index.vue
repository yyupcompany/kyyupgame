<template>
  <UnifiedCenterLayout
    title="多课程跟踪管理"
    description="管理您负责的所有课程，记录教学进度"
    icon="Document"
  >
    <div class="center-container teacher-teaching">
    <!-- 页面头部 -->
    <div class="teaching-header">
      <div class="header-content">
        <div class="page-title">
          <h1>
            <UnifiedIcon name="Document" />
            我的课程
          </h1>
          <p>查看和管理分配给您的所有课程</p>
        </div>
        <div class="header-actions">
          <el-select v-model="statusFilter" placeholder="筛选状态" clearable @change="loadCourses" style="width: 150px">
            <el-option label="进行中" value="in_progress" />
            <el-option label="已分配" value="assigned" />
            <el-option label="已完成" value="completed" />
            <el-option label="已暂停" value="paused" />
          </el-select>
          <el-select v-model="classFilter" placeholder="筛选班级" clearable @change="loadCourses" style="width: 150px">
            <el-option
              v-for="cls in classList"
              :key="cls.id"
              :label="cls.name"
              :value="cls.id"
            />
          </el-select>
          <el-button @click="refreshData">
            <UnifiedIcon name="Refresh" />
            刷新
          </el-button>
        </div>
      </div>
    </div>

    <!-- 课程统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="12" :lg="6">
          <TeachingStatCard
            title="总课程数"
            :value="courseStats.total"
            icon="Document"
            color="var(--primary-color)"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="12" :lg="6">
          <TeachingStatCard
            title="进行中"
            :value="courseStats.inProgress"
            icon="VideoPlay"
            color="var(--success-color)"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="12" :lg="6">
          <TeachingStatCard
            title="本周记录"
            :value="courseStats.weekRecords"
            icon="Edit"
            color="var(--warning-color)"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="12" :lg="6">
          <TeachingStatCard
            title="平均完成率"
            :value="courseStats.avgProgress"
            icon="TrendCharts"
            color="var(--danger-color)"
            suffix="%"
          />
        </el-col>
      </el-row>
    </div>

    <!-- 课程列表 -->
    <div class="courses-container">
      <el-empty v-if="loading" description="加载中..." />
      <el-empty v-else-if="coursesList.length === 0" description="暂无课程数据" />
      <el-row v-else :gutter="24">
        <el-col 
          v-for="course in coursesList" 
          :key="course.id"
          :xs="24" 
          :sm="12" 
          :md="8" 
          :lg="6"
        >
          <CourseCard
            :course="course"
            @view-detail="handleViewCourseDetail"
            @add-record="handleAddRecord"
          />
        </el-col>
      </el-row>
    </div>

    <!-- 课程详情对话框 -->
    <CourseDetailDialog
      v-model="courseDetailVisible"
      :course="currentCourse"
      @add-record="handleAddRecord"
      @update-status="handleUpdateStatus"
    />

    <!-- 添加教学记录对话框 -->
    <AddRecordDialog
      v-model="recordDialogVisible"
      :course="currentCourse"
      @save="handleSaveRecord"
    />
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  getMyCourses, 
  getCourseStats,
  getCourseDetail,
  addCourseRecord,
  updateCourseStatus,
  type TeacherCourse,
  type CourseStats
} from '@/api/modules/teacher-courses'

// 导入组件
import TeachingStatCard from './components/TeachingStatCard.vue'
import CourseCard from './components/CourseCard.vue'
import CourseDetailDialog from './components/CourseDetailDialog.vue'
import AddRecordDialog from './components/AddRecordDialog.vue'

// 响应式数据
const loading = ref(false)
const statusFilter = ref<string>('')
const classFilter = ref<number | ''>('')
const courseDetailVisible = ref(false)
const recordDialogVisible = ref(false)
const currentCourse = ref<TeacherCourse | null>(null)

// 课程统计
const courseStats = reactive({
  total: 0,
  inProgress: 0,
  weekRecords: 0,
  avgProgress: 0
})

// 数据列表
const coursesList = ref<TeacherCourse[]>([])
const classList = ref<Array<{ id: number; name: string }>>([])

// 加载课程统计
const loadCourseStats = async () => {
  try {
    const response = await getCourseStats()
    const stats = response.data
    if (stats) {
      // 计算统计数据
      courseStats.total = stats.totalCourses || 0
      courseStats.inProgress = stats.statusStats?.in_progress || 0
      courseStats.weekRecords = stats.thisWeekRecords || 0
      
      // 计算平均完成率
      if (stats.totalCourses > 0) {
        // 这里需要根据实际API返回的数据计算
        courseStats.avgProgress = 0 // TODO: 根据实际数据计算
      }
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  }
}

// 加载课程列表
const loadCourses = async () => {
  try {
    loading.value = true
    const params: any = {}
    if (statusFilter.value) params.status = statusFilter.value
    if (classFilter.value) params.classId = classFilter.value
    
    const response = await getMyCourses(params)
    const courses = response.data || []
    coursesList.value = courses
    
    // 提取班级列表
    const classMap = new Map()
    courses.forEach((course: TeacherCourse) => {
      if (course.class && !classMap.has(course.class.id)) {
        classMap.set(course.class.id, {
          id: course.class.id,
          name: course.class.class_name
        })
      }
    })
    classList.value = Array.from(classMap.values())
  } catch (error) {
    console.error('加载课程列表失败:', error)
    ElMessage.error('加载课程列表失败')
  } finally {
    loading.value = false
  }
}

// 查看课程详情
const handleViewCourseDetail = async (course: TeacherCourse) => {
  try {
    const response = await getCourseDetail(course.id)
    if (response.data) {
      currentCourse.value = response.data
      courseDetailVisible.value = true
    }
  } catch (error) {
    console.error('加载课程详情失败:', error)
    ElMessage.error('加载课程详情失败')
  }
}

// 添加教学记录
const handleAddRecord = (course: TeacherCourse) => {
  currentCourse.value = course
  recordDialogVisible.value = true
}

// 保存教学记录
const handleSaveRecord = async (recordData: any) => {
  try {
    if (!currentCourse.value) return
    
    await addCourseRecord(currentCourse.value.id, recordData)
    ElMessage.success('教学记录添加成功')
    recordDialogVisible.value = false
    
    // 刷新数据
    await loadCourses()
    await loadCourseStats()
  } catch (error) {
    console.error('添加教学记录失败:', error)
    ElMessage.error('添加教学记录失败')
  }
}

// 更新课程状态
const handleUpdateStatus = async (courseId: number, status: string) => {
  try {
    await updateCourseStatus(courseId, status as any)
    ElMessage.success('课程状态更新成功')
    courseDetailVisible.value = false
    
    // 刷新数据
    await loadCourses()
    await loadCourseStats()
  } catch (error) {
    console.error('更新课程状态失败:', error)
    ElMessage.error('更新课程状态失败')
  }
}

// 刷新数据
const refreshData = () => {
  loadCourseStats()
  loadCourses()
}

// 生命周期
onMounted(() => {
  loadCourseStats()
  loadCourses()
})
</script>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.teacher-teaching {
  padding: var(--spacing-lg);
  background-color: var(--bg-color-page);
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;
}

.teaching-header {
  margin-bottom: var(--spacing-xl);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .page-title {
      h1 {
        font-size: var(--text-2xl);
        font-weight: var(--font-semibold);
        color: var(--text-primary);
        margin: 0 0 var(--spacing-xs) 0;
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
      }

      p {
        color: var(--text-secondary);
        margin: 0;
        font-size: var(--text-sm);
      }
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-md);
    }
  }
}

.stats-cards {
  margin-bottom: var(--spacing-xl);
}

.courses-container {
  margin-bottom: var(--spacing-xl);
  min-height: 400px;
}

// 响应式设计
@media (max-width: var(--breakpoint-xl)) {
  .teacher-teaching {
    padding: var(--spacing-xl);
  }

  .stats-cards {
    :deep(.el-col) {
      margin-bottom: var(--spacing-lg);
    }
  }
}

@media (max-width: 992px) {
  .teacher-teaching {
    padding: var(--spacing-lg);
  }

  .teaching-header .header-content {
    flex-direction: column;
    gap: var(--spacing-lg);
    align-items: flex-start;
  }

  .stats-cards {
    :deep(.el-col) {
      margin-bottom: var(--spacing-lg);
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .teacher-teaching {
    padding: var(--spacing-md);
  }

  .teaching-header .header-content {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;

    .header-actions {
      flex-direction: column;
      width: 100%;

      .el-select,
      .el-button {
        width: 100%;
      }
    }
  }

  .stats-cards {
    :deep(.el-col) {
      margin-bottom: var(--spacing-md);
    }
  }
}
</style>
