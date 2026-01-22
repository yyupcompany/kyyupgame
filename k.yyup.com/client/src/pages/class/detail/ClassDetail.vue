<template>
  <div class="page-container">
    <page-header :title="`${classDetail.className || '班级详情'}`">
      <template #actions>
        <el-button @click="goBack" type="default">
          <UnifiedIcon name="ArrowLeft" />
          返回
        </el-button>
        <el-button @click="editClass" type="primary" v-if="classDetail.id">
          <UnifiedIcon name="Edit" />
          编辑班级
        </el-button>
        <el-button @click="viewAnalytics" type="success" v-if="classDetail.id">
          <UnifiedIcon name="default" />
          查看分析
        </el-button>
      </template>
    </page-header>

    <div class="class-detail-content" v-loading="loading" element-loading-text="正在加载班级详情...">
      <!-- 班级基本信息 -->
      <el-card class="class-info-card">
        <template #header>
          <div class="card-header">
            <span>班级基本信息</span>
            <el-tag :type="getStatusType(classDetail.status)">
              {{ getStatusLabel(classDetail.status) }}
            </el-tag>
          </div>
        </template>
        
        <el-descriptions :column="3" border>
          <el-descriptions-item label="班级名称">{{ classDetail.className }}</el-descriptions-item>
          <el-descriptions-item label="年级">{{ classDetail.grade }}</el-descriptions-item>
          <el-descriptions-item label="班主任">{{ classDetail.teacherName }}</el-descriptions-item>
          <el-descriptions-item label="学生数量">{{ classDetail.studentCount }}</el-descriptions-item>
          <el-descriptions-item label="班级容量">{{ classDetail.capacity }}</el-descriptions-item>
          <el-descriptions-item label="学年">{{ classDetail.academicYear }}</el-descriptions-item>
          <el-descriptions-item label="教室">{{ classDetail.classroom }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(classDetail.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="最后更新">{{ formatDate(classDetail.updatedAt) }}</el-descriptions-item>
          <el-descriptions-item label="班级描述" :span="3">
            <div class="description-content">{{ classDetail.description || '暂无描述' }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 统计概览 -->
      <el-row :gutter="20" class="overview-section">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ classDetail.studentCount }}</div>
              <div class="stat-label">学生总数</div>
              <UnifiedIcon name="default" />
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ statisticsData.averageAttendanceRate }}%</div>
              <div class="stat-label">平均出勤率</div>
              <UnifiedIcon name="Check" />
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ statisticsData.averageAge }}</div>
              <div class="stat-label">平均年龄</div>
              <UnifiedIcon name="default" />
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ statisticsData.activitiesCount }}</div>
              <div class="stat-label">本月活动</div>
              <UnifiedIcon name="default" />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 学生列表 -->
      <el-card class="students-card">
        <template #header>
          <div class="card-header">
            <span>班级学生 ({{ studentsList.length }}人)</span>
            <div class="header-actions">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索学生姓名..."
                size="small"
                style="max-width: 200px; width: 100%; margin-right: var(--spacing-2xl)"
                @input="handleSearch"
              >
                <template #prefix>
                  <UnifiedIcon name="Search" />
                </template>
              </el-input>
              <el-button size="small" type="primary" @click="addStudent">
                <UnifiedIcon name="Plus" />
                添加学生
              </el-button>
            </div>
          </div>
        </template>

        <div class="table-wrapper">
<el-table class="responsive-table"
          :data="filteredStudents"
          style="width: 100%"
          stripe
          border
        >
          <el-table-column prop="studentName" label="姓名" width="120" />
          <el-table-column prop="studentId" label="学号" width="120" />
          <el-table-column prop="gender" label="性别" width="80">
            <template #default="scope">
              <el-tag size="small" :type="scope.row.gender === 'male' ? 'primary' : 'success'">
                {{ scope.row.gender === 'male' ? '男' : '女' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="age" label="年龄" width="80" />
          <el-table-column prop="attendanceRate" label="出勤率" width="120">
            <template #default="scope">
              <el-progress
                :percentage="scope.row.attendanceRate"
                :color="getAttendanceColor(scope.row.attendanceRate)"
                :text-inside="true"
                :stroke-width="16"
              />
            </template>
          </el-table-column>
          <el-table-column prop="parentContact" label="家长联系方式" width="150" />
          <el-table-column prop="enrollmentDate" label="入学日期" width="120">
            <template #default="scope">
              {{ formatDate(scope.row.enrollmentDate) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="small" @click="viewStudentDetail(scope.row)">
                查看详情
              </el-button>
              <el-button type="warning" size="small" @click="editStudent(scope.row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="removeStudent(scope.row)">
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
</div>

        <div class="pagination-container" v-if="studentsPagination.total > studentsPagination.pageSize">
          <el-pagination
            v-model:current-page="studentsPagination.currentPage"
            v-model:page-size="studentsPagination.pageSize"
            :page-sizes="[10, 20, 50]"
            :total="studentsPagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleStudentsPageSizeChange"
            @current-change="handleStudentsPageChange"
          />
        </div>
      </el-card>

      <!-- 近期活动 -->
      <el-card class="activities-card">
        <template #header>
          <div class="card-header">
            <span>近期活动</span>
            <el-button size="small" type="primary" @click="viewAllActivities">
              查看更多
            </el-button>
          </div>
        </template>

        <div class="activities-list" v-if="activitiesList.length > 0">
          <div 
            v-for="activity in activitiesList" 
            :key="activity.id"
            class="activity-item"
            @click="viewActivityDetail(activity)"
          >
            <div class="activity-date">
              <div class="date-day">{{ formatDay(activity.startTime) }}</div>
              <div class="date-month">{{ formatMonth(activity.startTime) }}</div>
            </div>
            <div class="activity-content">
              <h3>{{ activity.title }}</h3>
              <p>{{ activity.description }}</p>
              <div class="activity-meta">
                <span><UnifiedIcon name="default" />{{ activity.location }}</span>
                <span><UnifiedIcon name="default" />{{ activity.duration }}</span>
                <el-tag size="small" :type="getActivityStatusType(activity.status)">
                  {{ getActivityStatusLabel(activity.status) }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无活动安排" />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Edit,
  DataAnalysis,
  User,
  CircleCheck,
  Clock,
  Calendar,
  Search,
  Plus,
  Location
} from '@element-plus/icons-vue'
import { get, del } from '@/utils/request'
import { CLASS_ENDPOINTS, STUDENT_ENDPOINTS, ACTIVITY_ENDPOINTS } from '@/api/endpoints'
import { ErrorHandler } from '@/utils/errorHandler'
import PageHeader from '@/components/common/PageHeader.vue'

// 路由
const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')

// 班级详情接口
interface ClassDetail {
  id: string
  className: string
  grade: string
  teacherName: string
  studentCount: number
  capacity: number
  academicYear: string
  classroom: string
  status: 'active' | 'inactive' | 'graduated'
  description?: string
  createdAt: string
  updatedAt: string
}

// 学生信息接口
interface StudentInfo {
  id: string
  studentName: string
  studentId: string
  gender: 'male' | 'female'
  age: number
  attendanceRate: number
  parentContact: string
  enrollmentDate: string
}

// 活动信息接口
interface ActivityInfo {
  id: string
  title: string
  description: string
  startTime: string
  location: string
  duration: string
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled'
}

// 数据状态
const classDetail = ref<ClassDetail>({
  id: '',
  className: '',
  grade: '',
  teacherName: '',
  studentCount: 0,
  capacity: 0,
  academicYear: '',
  classroom: '',
  status: 'active',
  description: '',
  createdAt: '',
  updatedAt: ''
})

const statisticsData = ref({
  averageAttendanceRate: 0,
  averageAge: 0,
  activitiesCount: 0
})

const studentsList = ref<StudentInfo[]>([])
const activitiesList = ref<ActivityInfo[]>([])

// 分页数据
const studentsPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 计算属性
const filteredStudents = computed(() => {
  let filtered = studentsList.value

  if (searchKeyword.value) {
    filtered = filtered.filter(student =>
      student.studentName.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  studentsPagination.total = filtered.length
  const start = (studentsPagination.currentPage - 1) * studentsPagination.pageSize
  const end = start + studentsPagination.pageSize
  return filtered.slice(start, end)
})

// 方法
const loadClassDetail = async () => {
  const classId = route.params.id as string
  if (!classId) {
    ElMessage.error('班级ID不能为空')
    goBack()
    return
  }

  loading.value = true
  try {
    const response = await get(CLASS_ENDPOINTS.GET_BY_ID(classId))
    
    if (response.success && response.data) {
      classDetail.value = response.data
    } else {
      // 使用模拟数据
      classDetail.value = {
        id: classId,
        className: '小班1班',
        grade: '小班',
        teacherName: '张老师',
        studentCount: 18,
        capacity: 20,
        academicYear: '2024-2025',
        classroom: '101教室',
        status: 'active',
        description: '这是一个充满活力的小班，孩子们在这里快乐学习和成长。',
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: '2024-01-19T10:30:00Z'
      }
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
    goBack()
  } finally {
    loading.value = false
  }
}

const loadStudents = async () => {
  const classId = route.params.id as string
  try {
    const response = await get(STUDENT_ENDPOINTS.LIST, {
      classId,
      page: studentsPagination.currentPage,
      pageSize: studentsPagination.pageSize
    })

    if (response.success && response.data) {
      studentsList.value = response.data.list || []
      studentsPagination.total = response.data.total || 0
    } else {
      // 使用模拟数据
      studentsList.value = [
        {
          id: '1',
          studentName: '张小明',
          studentId: 'S20240001',
          gender: 'male',
          age: 4,
          attendanceRate: 95,
          parentContact: '138****8888',
          enrollmentDate: '2024-02-20T00:00:00Z'
        },
        {
          id: '2',
          studentName: '李小红',
          studentId: 'S20240002',
          gender: 'female',
          age: 4,
          attendanceRate: 98,
          parentContact: '139****9999',
          enrollmentDate: '2024-02-22T00:00:00Z'
        },
        {
          id: '3',
          studentName: '王小刚',
          studentId: 'S20240003',
          gender: 'male',
          age: 5,
          attendanceRate: 92,
          parentContact: '136****6666',
          enrollmentDate: '2024-02-25T00:00:00Z'
        }
      ]
      studentsPagination.total = studentsList.value.length
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, false)
    // 降级使用模拟数据
    studentsList.value = []
  }
}

const loadActivities = async () => {
  const classId = route.params.id as string
  try {
    const response = await get(ACTIVITY_ENDPOINTS.LIST, {
      classId,
      limit: 5,
      status: 'planned,ongoing'
    })

    if (response.success && response.data) {
      activitiesList.value = response.data.list || []
    } else {
      // 使用模拟数据
      activitiesList.value = [
        {
          id: '1',
          title: '春游活动',
          description: '到公园进行户外活动，观察春天的变化',
          startTime: '2024-03-15T09:00:00Z',
          location: '中山公园',
          duration: '2小时',
          status: 'planned'
        },
        {
          id: '2',
          title: '手工制作课',
          description: '制作春天主题的手工作品',
          startTime: '2024-03-20T14:00:00Z',
          location: '美工室',
          duration: '1小时',
          status: 'planned'
        }
      ]
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, false)
    activitiesList.value = []
  }
}

const loadStatistics = async () => {
  const classId = route.params.id as string
  try {
    const response = await get(CLASS_ENDPOINTS.STATISTICS(classId))
    
    if (response.success && response.data) {
      statisticsData.value = response.data
    } else {
      // 使用模拟数据
      statisticsData.value = {
        averageAttendanceRate: 95,
        averageAge: 4.2,
        activitiesCount: 8
      }
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, false)
    // 降级使用模拟数据
    statisticsData.value = {
      averageAttendanceRate: 95,
      averageAge: 4.2,
      activitiesCount: 8
    }
  }
}

// 工具方法
const formatDate = (dateString: string) => {
  if (!dateString) return '--'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatDay = (dateString: string) => {
  return new Date(dateString).getDate().toString().padStart(2, '0')
}

const formatMonth = (dateString: string) => {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  return months[new Date(dateString).getMonth()]
}

const getStatusType = (status: string) => {
  const typeMap = {
    active: 'success',
    inactive: 'warning',
    graduated: 'info'
  }
  return typeMap[status as keyof typeof typeMap] || 'info'
}

const getStatusLabel = (status: string) => {
  const labelMap = {
    active: '正常',
    inactive: '暂停',
    graduated: '毕业'
  }
  return labelMap[status as keyof typeof labelMap] || status
}

const getAttendanceColor = (rate: number) => {
  if (rate >= 95) return 'var(--success-color)'
  if (rate >= 85) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

const getActivityStatusType = (status: string) => {
  const typeMap = {
    planned: 'warning',
    ongoing: 'primary',
    completed: 'success',
    cancelled: 'danger'
  }
  return typeMap[status as keyof typeof typeMap] || 'info'
}

const getActivityStatusLabel = (status: string) => {
  const labelMap = {
    planned: '计划中',
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return labelMap[status as keyof typeof labelMap] || status
}

// 事件处理
const goBack = () => {
  router.back()
}

const editClass = () => {
  router.push(`/class/edit/${classDetail.value.id}`)
}

const viewAnalytics = () => {
  router.push(`/class/analytics/${classDetail.value.id}`)
}

const handleSearch = () => {
  studentsPagination.currentPage = 1
}

const handleStudentsPageSizeChange = (size: number) => {
  studentsPagination.pageSize = size
  loadStudents()
}

const handleStudentsPageChange = (page: number) => {
  studentsPagination.currentPage = page
  loadStudents()
}

const viewStudentDetail = (student: StudentInfo) => {
  router.push(`/student/detail/${student.id}`)
}

const editStudent = (student: StudentInfo) => {
  router.push(`/student/edit/${student.id}`)
}

const addStudent = () => {
  router.push(`/student/add?classId=${classDetail.value.id}`)
}

const removeStudent = async (student: StudentInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要将 ${student.studentName} 从班级中移除吗？`,
      '确认移除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await del(STUDENT_ENDPOINTS.REMOVE_FROM_CLASS(student.id, classDetail.value.id))
    
    if (response.success) {
      ElMessage.success('学生移除成功')
      loadStudents()
      loadClassDetail() // 更新学生总数
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '移除学生失败'), true)
    }
  } catch (error) {
    if (error !== 'cancel') {
      const errorInfo = ErrorHandler.handle(error, true)
    }
  }
}

const viewActivityDetail = (activity: ActivityInfo) => {
  router.push(`/activity/detail/${activity.id}`)
}

const viewAllActivities = () => {
  router.push(`/activity?classId=${classDetail.value.id}`)
}

// 生命周期
onMounted(async () => {
  await Promise.all([
    loadClassDetail(),
    loadStudents(),
    loadActivities(),
    loadStatistics()
  ])
})
</script>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.class-detail-content {
  padding: var(--spacing-lg);
}

.class-info-card {
  margin-bottom: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.description-content {
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--text-secondary);
  padding: var(--spacing-sm);
  background-color: var(--bg-page);
  border-radius: var(--radius-sm);
}

.overview-section {
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(var(--transform-hover-lift));
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-lg);
  position: relative;

  .stat-value {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: var(--spacing-sm);
  }

  .stat-label {
    font-size: var(--text-base);
    color: var(--text-secondary);
    font-weight: 500;
  }

  .stat-icon {
    position: absolute;
    top: var(--spacing-sm);
    right: var(--spacing-sm);
    font-size: var(--text-2xl);
    color: var(--text-muted);
    opacity: 0.6;
  }
}

.students-card,
.activities-card {
  margin-bottom: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-lg);
}

.activities-list {
  display: grid;
  gap: var(--spacing-md);
}

.activity-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: var(--bg-page);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--bg-hover);
    transform: translateY(var(--z-index-below));
    box-shadow: var(--shadow-sm);
  }
}

.activity-date {
  text-align: center;
  min-width: auto;
  
  .date-day {
    font-size: var(--text-2xl);
    font-weight: 700;
    color: var(--primary-color);
    line-height: 1;
  }
  
  .date-month {
    font-size: var(--text-xs);
    color: var(--text-muted);
    margin-top: var(--spacing-xs);
  }
}

.activity-content {
  flex: 1;
  
  h3 {
    font-size: var(--text-lg);
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
    font-weight: 600;
  }
  
  p {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-sm);
    line-height: 1.5;
  }
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--text-sm);
  color: var(--text-muted);
  
  span {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }
}

/* Element Plus 组件样式覆盖 */
:deep(.el-card__header) {
  background-color: var(--bg-page);
  border-bottom-color: var(--border-color);
}

:deep(.el-descriptions__label) {
  color: var(--text-primary);
  font-weight: 500;
  background-color: var(--bg-page);
}

:deep(.el-descriptions__content) {
  color: var(--text-secondary);
  background-color: var(--bg-card);
}

:deep(.el-table) {
  background-color: var(--bg-card);
}

:deep(.el-table th) {
  background-color: var(--bg-page);
  color: var(--text-primary);
}

:deep(.el-table td) {
  color: var(--text-secondary);
}

:deep(.el-progress-bar__outer) {
  background-color: var(--bg-page);
}

:deep(.el-tag) {
  border-radius: var(--radius-sm);
}

:deep(.el-empty) {
  padding: var(--spacing-xl);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .overview-section {
    .el-col {
      margin-bottom: var(--spacing-md);
    }
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-xs);
  }

  .activity-item {
    flex-direction: column;
    text-align: center;
  }

  .activity-date {
    margin-bottom: var(--spacing-sm);
  }
}
</style>