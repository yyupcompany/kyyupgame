<template>
  <div class="student-detail">
    <div class="student-header">
      <div class="header-content">
        <div class="student-avatar">
          <img :src="studentData.avatar" :alt="studentData.name" />
        </div>
        <div class="student-info">
          <h1>{{ studentData.name }}</h1>
          <div class="student-meta">
            <span class="meta-item">
              <i class="icon-id"></i>
              学号: {{ studentData.studentId }}
            </span>
            <span class="meta-item">
              <i class="icon-calendar"></i>
              年龄: {{ studentData.age }}岁
            </span>
            <span class="meta-item">
              <i class="icon-class"></i>
              班级: {{ studentData.className }}
            </span>
            <span class="meta-item">
              <i class="icon-date"></i>
              入学时间: {{ studentData.enrollmentDate }}
            </span>
          </div>
        </div>
        <div class="student-actions">
          <button class="btn btn-primary" @click="editStudent">编辑信息</button>
          <button class="btn btn-secondary" @click="viewGrowth">成长记录</button>
        </div>
      </div>
    </div>

    <div class="student-content">
      <div class="content-grid">
        <!-- 基本信息 -->
        <div class="basic-info-section">
          <h2>基本信息</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>姓名</label>
              <span>{{ studentData.name }}</span>
            </div>
            <div class="info-item">
              <label>性别</label>
              <span>{{ studentData.gender }}</span>
            </div>
            <div class="info-item">
              <label>出生日期</label>
              <span>{{ studentData.birthDate }}</span>
            </div>
            <div class="info-item">
              <label>联系电话</label>
              <span>{{ studentData.phone }}</span>
            </div>
            <div class="info-item">
              <label>家庭住址</label>
              <span>{{ studentData.address }}</span>
            </div>
            <div class="info-item">
              <label>紧急联系人</label>
              <span>{{ studentData.emergencyContact }}</span>
            </div>
          </div>
        </div>

        <!-- 学习表现 -->
        <div class="performance-section">
          <h2>学习表现</h2>
          <div class="performance-cards">
            <div class="performance-card">
              <div class="card-header">
                <h3>语言表达</h3>
                <div class="score">{{ studentData.performance.language }}</div>
              </div>
              <div class="progress-bar">
                <div class="progress" :style="{ width: studentData.performance.language + '%' }"></div>
              </div>
            </div>
            
            <div class="performance-card">
              <div class="card-header">
                <h3>数学思维</h3>
                <div class="score">{{ studentData.performance.math }}</div>
              </div>
              <div class="progress-bar">
                <div class="progress" :style="{ width: studentData.performance.math + '%' }"></div>
              </div>
            </div>
            
            <div class="performance-card">
              <div class="card-header">
                <h3>艺术创作</h3>
                <div class="score">{{ studentData.performance.art }}</div>
              </div>
              <div class="progress-bar">
                <div class="progress" :style="{ width: studentData.performance.art + '%' }"></div>
              </div>
            </div>
            
            <div class="performance-card">
              <div class="card-header">
                <h3>体能发展</h3>
                <div class="score">{{ studentData.performance.physical }}</div>
              </div>
              <div class="progress-bar">
                <div class="progress" :style="{ width: studentData.performance.physical + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 出勤记录 -->
        <div class="attendance-section">
          <h2>出勤记录</h2>
          <div class="attendance-stats">
            <div class="stat-item">
              <div class="stat-value">{{ studentData.attendance.total }}</div>
              <div class="stat-label">总天数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ studentData.attendance.present }}</div>
              <div class="stat-label">出勤天数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ studentData.attendance.absent }}</div>
              <div class="stat-label">缺勤天数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ attendanceRate }}%</div>
              <div class="stat-label">出勤率</div>
            </div>
          </div>
          
          <div class="attendance-calendar">
            <h3>本月出勤情况</h3>
            <div class="calendar-grid">
              <div 
                v-for="day in attendanceCalendar" 
                :key="day.date" 
                :class="['calendar-day', day.status]"
              >
                {{ day.day }}
              </div>
            </div>
            <div class="calendar-legend">
              <span class="legend-item">
                <div class="legend-color present"></div>
                出勤
              </span>
              <span class="legend-item">
                <div class="legend-color absent"></div>
                缺勤
              </span>
              <span class="legend-item">
                <div class="legend-color leave"></div>
                请假
              </span>
            </div>
          </div>
        </div>

        <!-- 家长信息 -->
        <div class="parent-section">
          <h2>家长信息</h2>
          <div class="parent-list">
            <div 
              v-for="parent in studentData.parents" 
              :key="parent.id" 
              class="parent-card"
            >
              <div class="parent-avatar">
                <img :src="parent.avatar" :alt="parent.name" />
              </div>
              <div class="parent-info">
                <h3>{{ parent.name }}</h3>
                <p>{{ parent.relationship }}</p>
                <div class="parent-contact">
                  <span>📞 {{ parent.phone }}</span>
                  <span>💼 {{ parent.occupation }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 成长记录 -->
        <div class="growth-section">
          <h2>成长记录</h2>
          <div class="growth-timeline">
            <div 
              v-for="record in growthRecords" 
              :key="record.id" 
              class="timeline-item"
            >
              <div class="timeline-date">{{ formatDate(record.date) }}</div>
              <div class="timeline-content">
                <h3>{{ record.title }}</h3>
                <p>{{ record.description }}</p>
                <div class="timeline-tags">
                  <span 
                    v-for="tag in record.tags" 
                    :key="tag" 
                    class="tag"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { get, post, put } from '@/utils/request'
import { STUDENT_ENDPOINTS } from '@/api/endpoints'
import { ErrorHandler } from '@/utils/errorHandler'

// 路由
const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const studentData = ref({
  id: '',
  name: '',
  studentId: '',
  age: 0,
  gender: '',
  className: '',
  birthDate: '',
  enrollmentDate: '',
  phone: '',
  address: '',
  emergencyContact: '',
  avatar: '/default-avatar.png',
  performance: {
    language: 0,
    math: 0,
    art: 0,
    physical: 0
  },
  attendance: {
    total: 0,
    present: 0,
    absent: 0
  },
  parents: []
})

const growthRecords = ref([])
const attendanceCalendar = ref([])

// 计算属性
const attendanceRate = computed(() => {
  const { present, total } = studentData.value.attendance
  return Math.round((present / total) * 100)
})

// 生命周期
onMounted(() => {
  loadStudentData()
})

// 方法
const loadStudentData = async () => {
  const studentId = route.params.id as string
  if (!studentId) {
    ElMessage.error('学生ID不能为空')
    router.back()
    return
  }

  loading.value = true
  try {
    const response = await get(STUDENT_ENDPOINTS.DETAIL(studentId))
    
    if (response.success && response.data) {
      studentData.value = response.data
      await loadGrowthRecords(studentId)
      await loadAttendanceData(studentId)
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '获取学生详情失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
    router.back()
  } finally {
    loading.value = false
  }
}

const loadGrowthRecords = async (studentId: string) => {
  try {
    const response = await get(STUDENT_ENDPOINTS.GROWTH_RECORDS(studentId))
    if (response.success && response.data) {
      growthRecords.value = response.data.list || []
    }
  } catch (error) {
    ErrorHandler.handle(error, false)
  }
}

const loadAttendanceData = async (studentId: string) => {
  try {
    const response = await get(STUDENT_ENDPOINTS.ATTENDANCE(studentId))
    if (response.success && response.data) {
      attendanceCalendar.value = response.data.calendar || []
    }
  } catch (error) {
    ErrorHandler.handle(error, false)
  }
}

const editStudent = () => {
  router.push(`/student/edit/${studentData.value.id}`)
}

const viewGrowth = () => {
  router.push(`/student/growth/${studentData.value.id}`)
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.student-detail {
  padding: var(--text-2xl);
  background: var(--bg-page);
  min-height: 100vh;
}

.student-header {
  background: white;
  padding: var(--text-2xl);
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  margin-bottom: var(--text-3xl);
}

.header-content {
  display: flex;
  align-items: flex-start;
  gap: var(--text-2xl);
}

.student-avatar {
  width: var(--avatar-size); height: var(--avatar-size);
  border-radius: var(--radius-full);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
  background: var(--bg-gray-light);
}

.student-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.student-info {
  flex: 1;
}

.student-info h1 {
  font-size: var(--text-3xl);
  color: var(--text-primary);
  margin-bottom: var(--text-sm);
}

.student-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--text-base);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.student-actions {
  display: flex;
  gap: var(--text-xs);
}

.btn {
  padding: var(--spacing-sm) var(--text-lg);
  border: none;
  border-radius: var(--spacing-xs);
  cursor: pointer;
  font-size: var(--text-sm);
  transition: all 0.3s;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: #40a9ff;
}

.btn-secondary {
  background: var(--bg-gray-light);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: #e6e6e6;
}

.content-grid {
  display: grid;
  gap: var(--text-2xl);
}

.basic-info-section,
.performance-section,
.attendance-section,
.parent-section,
.growth-section {
  background: white;
  padding: var(--text-2xl);
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
}

.basic-info-section h2,
.performance-section h2,
.attendance-section h2,
.parent-section h2,
.growth-section h2 {
  font-size: var(--spacing-lg);
  color: var(--text-primary);
  margin-bottom: var(--text-lg);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--text-base);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.info-item label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  font-weight: 500;
}

.info-item span {
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.performance-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--text-base);
}

.performance-card {
  padding: var(--text-base);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: var(--border-width-base) solid #e8e8e8;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-sm);
}

.card-header h3 {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
}

.score {
  font-size: var(--text-lg);
  font-weight: bold;
  color: var(--primary-color);
}

.progress-bar {
  width: 100%;
  min-height: 32px; height: auto;
  background: var(--bg-gray-light);
  border-radius: var(--radius-xs);
  overflow: hidden;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--success-color));
  transition: width 0.3s ease;
}

.attendance-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: var(--text-base);
  margin-bottom: var(--text-3xl);
}

.stat-item {
  text-align: center;
  padding: var(--text-base);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.attendance-calendar h3 {
  font-size: var(--text-base);
  color: var(--text-primary);
  margin-bottom: var(--text-sm);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-xs);
  margin-bottom: var(--text-sm);
}

.calendar-day {
  width: var(--spacing-3xl);
  height: var(--spacing-3xl);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--spacing-xs);
  font-size: var(--text-xs);
  color: var(--text-primary);
}

.calendar-day.present {
  background: #f6ffed;
  color: var(--success-color);
}

.calendar-day.absent {
  background: var(--bg-white)2f0;
  color: var(--brand-danger);
}

.calendar-day.leave {
  background: var(--bg-white)7e6;
  color: #fa8c16;
}

.calendar-legend {
  display: flex;
  gap: var(--text-base);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.legend-color {
  width: var(--text-sm);
  height: var(--text-sm);
  border-radius: var(--radius-xs);
}

.legend-color.present {
  background: var(--success-color);
}

.legend-color.absent {
  background: var(--brand-danger);
}

.legend-color.leave {
  background: #fa8c16;
}

.parent-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--text-base);
}

.parent-card {
  display: flex;
  align-items: center;
  gap: var(--text-base);
  padding: var(--text-base);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: var(--border-width-base) solid #e8e8e8;
}

.parent-avatar {
  width: auto;
  min-height: 60px; height: auto;
  border-radius: var(--radius-full);
  overflow: hidden;
  background: var(--bg-gray-light);
}

.parent-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.parent-info h3 {
  font-size: var(--text-base);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.parent-info p {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.parent-contact {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.growth-timeline {
  display: grid;
  gap: var(--spacing-lg);
}

.timeline-item {
  display: flex;
  gap: var(--text-base);
  padding: var(--text-base);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border-left: var(--spacing-xs) solid var(--primary-color);
}

.timeline-date {
  min-width: auto;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  text-align: center;
}

.timeline-content {
  flex: 1;
}

.timeline-content h3 {
  font-size: var(--text-base);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.timeline-content p {
  color: var(--text-secondary);
  margin-bottom: var(--text-sm);
}

.timeline-tags {
  display: flex;
  gap: var(--spacing-sm);
}

.tag {
  padding: var(--spacing-sm) var(--spacing-sm);
  background: #e6f7ff;
  color: var(--primary-color);
  border-radius: var(--text-xs);
  font-size: var(--text-xs);
}
</style>
