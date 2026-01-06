<template>
  <div class="search-container">
    <!-- 页面头部 -->
    <div class="search-header">
      <div class="header-content">
        <div class="page-title">
          <h1>全局搜索</h1>
          <p>搜索系统中的学生、教师、班级、活动等信息</p>
        </div>
      </div>
    </div>

    <!-- 搜索表单 -->
    <div class="search-form-section">
      <el-card shadow="never">
        <el-form :model="searchForm" label-width="100px" inline>
          <el-form-item label="搜索关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="请输入搜索关键词"
              clearable
              style="width: 300px"
              @keyup.enter="handleSearch"
            >
              <template #prepend>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="搜索范围">
            <el-select
              v-model="searchForm.scope"
              placeholder="选择搜索范围"
              style="width: 200px"
            >
              <el-option label="全部" value="all" />
              <el-option label="学生" value="students" />
              <el-option label="教师" value="teachers" />
              <el-option label="班级" value="classes" />
              <el-option label="家长" value="parents" />
              <el-option label="活动" value="activities" />
              <el-option label="课程" value="courses" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :loading="loading">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 搜索结果统计 -->
    <div v-if="hasSearched" class="search-stats">
      <el-card shadow="never">
        <div class="stats-content">
          <div class="stats-info">
            <el-icon><DataAnalysis /></el-icon>
            <span>搜索"{{ currentKeyword }}"，共找到 {{ totalResults }} 条结果</span>
            <el-tag size="small" type="info">耗时 {{ searchTime }}ms</el-tag>
          </div>
          <div class="stats-filters">
            <el-radio-group v-model="activeTab" @change="handleTabChange">
              <el-radio-button label="all">全部 ({{ totalResults }})</el-radio-button>
              <el-radio-button label="students">学生 ({{ results.students?.length || 0 }})</el-radio-button>
              <el-radio-button label="teachers">教师 ({{ results.teachers?.length || 0 }})</el-radio-button>
              <el-radio-button label="classes">班级 ({{ results.classes?.length || 0 }})</el-radio-button>
              <el-radio-button label="parents">家长 ({{ results.parents?.length || 0 }})</el-radio-button>
              <el-radio-button label="activities">活动 ({{ results.activities?.length || 0 }})</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 搜索结果 -->
    <div v-else-if="hasSearched" class="search-results">
      <!-- 学生结果 -->
      <div v-if="shouldShowSection('students')" class="result-section">
        <div class="section-header">
          <h3>学生 ({{ results.students?.length || 0 }})</h3>
        </div>
        <div class="result-grid">
          <el-card
            v-for="student in results.students"
            :key="student.id"
            class="result-card student-card"
            shadow="hover"
            @click="handleViewStudent(student)"
          >
            <div class="card-content">
              <div class="card-avatar">
                <img v-if="student.avatar" :src="student.avatar" :alt="student.name" />
                <span v-else class="avatar-text">{{ getAvatarText(student.name) }}</span>
              </div>
              <div class="card-info">
                <h4 class="card-title">{{ student.name }}</h4>
                <p class="card-subtitle">学号: {{ student.studentId }}</p>
                <p class="card-meta">班级: {{ student.className }}</p>
                <p class="card-meta">年龄: {{ student.age }}岁</p>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 教师结果 -->
      <div v-if="shouldShowSection('teachers')" class="result-section">
        <div class="section-header">
          <h3>教师 ({{ results.teachers?.length || 0 }})</h3>
        </div>
        <div class="result-grid">
          <el-card
            v-for="teacher in results.teachers"
            :key="teacher.id"
            class="result-card teacher-card"
            shadow="hover"
            @click="handleViewTeacher(teacher)"
          >
            <div class="card-content">
              <div class="card-avatar">
                <img v-if="teacher.avatar" :src="teacher.avatar" :alt="teacher.name" />
                <span v-else class="avatar-text">{{ getAvatarText(teacher.name) }}</span>
              </div>
              <div class="card-info">
                <h4 class="card-title">{{ teacher.name }}</h4>
                <p class="card-subtitle">工号: {{ teacher.employeeId }}</p>
                <p class="card-meta">科目: {{ teacher.subject }}</p>
                <p class="card-meta">职位: {{ teacher.position }}</p>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 班级结果 -->
      <div v-if="shouldShowSection('classes')" class="result-section">
        <div class="section-header">
          <h3>班级 ({{ results.classes?.length || 0 }})</h3>
        </div>
        <div class="result-grid">
          <el-card
            v-for="classItem in results.classes"
            :key="classItem.id"
            class="result-card class-card"
            shadow="hover"
            @click="handleViewClass(classItem)"
          >
            <div class="card-content">
              <div class="card-icon">
                <el-icon><School /></el-icon>
              </div>
              <div class="card-info">
                <h4 class="card-title">{{ classItem.name }}</h4>
                <p class="card-subtitle">班主任: {{ classItem.teacherName }}</p>
                <p class="card-meta">学生数: {{ classItem.studentCount }}人</p>
                <p class="card-meta">年级: {{ classItem.grade }}</p>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 家长结果 -->
      <div v-if="shouldShowSection('parents')" class="result-section">
        <div class="section-header">
          <h3>家长 ({{ results.parents?.length || 0 }})</h3>
        </div>
        <div class="result-grid">
          <el-card
            v-for="parent in results.parents"
            :key="parent.id"
            class="result-card parent-card"
            shadow="hover"
            @click="handleViewParent(parent)"
          >
            <div class="card-content">
              <div class="card-avatar">
                <img v-if="parent.avatar" :src="parent.avatar" :alt="parent.name" />
                <span v-else class="avatar-text">{{ getAvatarText(parent.name) }}</span>
              </div>
              <div class="card-info">
                <h4 class="card-title">{{ parent.name }}</h4>
                <p class="card-subtitle">手机: {{ parent.phone }}</p>
                <p class="card-meta">孩子: {{ parent.childName }}</p>
                <p class="card-meta">关系: {{ parent.relationship }}</p>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 活动结果 -->
      <div v-if="shouldShowSection('activities')" class="result-section">
        <div class="section-header">
          <h3>活动 ({{ results.activities?.length || 0 }})</h3>
        </div>
        <div class="result-grid">
          <el-card
            v-for="activity in results.activities"
            :key="activity.id"
            class="result-card activity-card"
            shadow="hover"
            @click="handleViewActivity(activity)"
          >
            <div class="card-content">
              <div class="card-icon">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="card-info">
                <h4 class="card-title">{{ activity.title }}</h4>
                <p class="card-subtitle">{{ activity.description }}</p>
                <p class="card-meta">时间: {{ formatDate(activity.startTime) }}</p>
                <p class="card-meta">地点: {{ activity.location }}</p>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 无结果提示 -->
      <div v-if="totalResults === 0" class="no-results">
        <el-empty description="未找到相关结果">
          <template #image>
            <el-icon size="60"><Search /></el-icon>
          </template>
          <el-button type="primary" @click="handleReset">重新搜索</el-button>
        </el-empty>
      </div>
    </div>

    <!-- 未搜索状态 -->
    <div v-else class="search-placeholder">
      <el-empty description="请输入关键词开始搜索">
        <template #image>
          <el-icon size="60"><Search /></el-icon>
        </template>
        <div class="search-tips">
          <h4>搜索提示：</h4>
          <ul>
            <li>可以搜索学生姓名、学号</li>
            <li>可以搜索教师姓名、工号</li>
            <li>可以搜索班级名称</li>
            <li>可以搜索家长姓名、手机号</li>
            <li>可以搜索活动标题、描述</li>
          </ul>
        </div>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Refresh, DataAnalysis, School, Calendar } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/date'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const hasSearched = ref(false)
const currentKeyword = ref('')
const searchTime = ref(0)
const activeTab = ref('all')

// 搜索表单
const searchForm = reactive({
  keyword: '',
  scope: 'all'
})

// 搜索结果
const results = reactive({
  students: [],
  teachers: [],
  classes: [],
  parents: [],
  activities: [],
  courses: []
})

// 计算属性
const totalResults = computed(() => {
  return Object.values(results).reduce((total, items) => total + (items?.length || 0), 0)
})

// 方法
const getAvatarText = (name: string) => {
  return name ? name.charAt(0).toUpperCase() : '?'
}

const shouldShowSection = (section: string) => {
  if (activeTab.value === 'all') {
    return results[section]?.length > 0
  }
  return activeTab.value === section && results[section]?.length > 0
}

const handleSearch = async () => {
  if (!searchForm.keyword.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  loading.value = true
  const startTime = Date.now()

  try {
    // 模拟搜索API调用
    await simulateSearch()
    
    searchTime.value = Date.now() - startTime
    currentKeyword.value = searchForm.keyword
    hasSearched.value = true
    activeTab.value = searchForm.scope === 'all' ? 'all' : searchForm.scope
    
    ElMessage.success(`搜索完成，找到 ${totalResults.value} 条结果`)
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请重试')
  } finally {
    loading.value = false
  }
}

const simulateSearch = async () => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const keyword = searchForm.keyword.toLowerCase()
  const scope = searchForm.scope
  
  // 模拟搜索结果
  if (scope === 'all' || scope === 'students') {
    results.students = [
      {
        id: 1,
        name: '张小明',
        studentId: 'S001',
        className: '大班A',
        age: 5,
        avatar: null
      },
      {
        id: 2,
        name: '李小红',
        studentId: 'S002',
        className: '中班B',
        age: 4,
        avatar: null
      }
    ].filter(item => 
      item.name.toLowerCase().includes(keyword) || 
      item.studentId.toLowerCase().includes(keyword)
    )
  }
  
  if (scope === 'all' || scope === 'teachers') {
    results.teachers = [
      {
        id: 1,
        name: '王老师',
        employeeId: 'T001',
        subject: '语言',
        position: '班主任',
        avatar: null
      },
      {
        id: 2,
        name: '刘老师',
        employeeId: 'T002',
        subject: '数学',
        position: '科任老师',
        avatar: null
      }
    ].filter(item => 
      item.name.toLowerCase().includes(keyword) || 
      item.employeeId.toLowerCase().includes(keyword)
    )
  }
  
  if (scope === 'all' || scope === 'classes') {
    results.classes = [
      {
        id: 1,
        name: '大班A',
        teacherName: '王老师',
        studentCount: 25,
        grade: '大班'
      },
      {
        id: 2,
        name: '中班B',
        teacherName: '刘老师',
        studentCount: 20,
        grade: '中班'
      }
    ].filter(item => 
      item.name.toLowerCase().includes(keyword) || 
      item.teacherName.toLowerCase().includes(keyword)
    )
  }
  
  if (scope === 'all' || scope === 'parents') {
    results.parents = [
      {
        id: 1,
        name: '张爸爸',
        phone: '13800138001',
        childName: '张小明',
        relationship: '父亲',
        avatar: null
      },
      {
        id: 2,
        name: '李妈妈',
        phone: '13800138002',
        childName: '李小红',
        relationship: '母亲',
        avatar: null
      }
    ].filter(item => 
      item.name.toLowerCase().includes(keyword) || 
      item.phone.includes(keyword) ||
      item.childName.toLowerCase().includes(keyword)
    )
  }
  
  if (scope === 'all' || scope === 'activities') {
    results.activities = [
      {
        id: 1,
        title: '春游活动',
        description: '带孩子们去公园春游',
        startTime: '2024-03-15 09:00:00',
        location: '市中心公园'
      },
      {
        id: 2,
        title: '亲子运动会',
        description: '家长和孩子一起参加的运动会',
        startTime: '2024-04-20 14:00:00',
        location: '学校操场'
      }
    ].filter(item => 
      item.title.toLowerCase().includes(keyword) || 
      item.description.toLowerCase().includes(keyword)
    )
  }
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.scope = 'all'
  hasSearched.value = false
  currentKeyword.value = ''
  activeTab.value = 'all'
  
  // 清空结果
  Object.keys(results).forEach(key => {
    results[key] = []
  })
}

const handleTabChange = (tab: string) => {
  activeTab.value = tab
}

// 查看详情方法
const handleViewStudent = (student: any) => {
  router.push(`/student/detail/${student.id}`)
}

const handleViewTeacher = (teacher: any) => {
  router.push(`/teacher/detail/${teacher.id}`)
}

const handleViewClass = (classItem: any) => {
  router.push(`/class/detail/${classItem.id}`)
}

const handleViewParent = (parent: any) => {
  router.push(`/parent/detail/${parent.id}`)
}

const handleViewActivity = (activity: any) => {
  router.push(`/activity/detail/${activity.id}`)
}

// 生命周期
onMounted(() => {
  // 检查URL参数中是否有搜索关键词
  const urlParams = new URLSearchParams(window.location.search)
  const keyword = urlParams.get('q')
  if (keyword) {
    searchForm.keyword = keyword
    handleSearch()
  }
})
</script>

<style scoped lang="scss">
.search-container {
  padding: var(--text-2xl);
  max-width: 1400px;
  margin: 0 auto;
}

.search-header {
  margin-bottom: var(--text-3xl);
  
  .header-content {
    .page-title {
      h1 {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-sm) 0;
      }
      
      p {
        color: var(--text-secondary);
        margin: 0;
      }
    }
  }
}

.search-form-section {
  margin-bottom: var(--text-3xl);
}

.search-stats {
  margin-bottom: var(--text-3xl);
  
  .stats-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--text-lg);
    
    .stats-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      color: var(--color-gray-700);
      font-weight: 500;
    }
    
    .stats-filters {
      .el-radio-group {
        .el-radio-button {
          margin-right: var(--spacing-sm);
        }
      }
    }
  }
}

.loading-container {
  padding: var(--spacing-10xl);
}

.search-results {
  .result-section {
    margin-bottom: var(--spacing-3xl);
    
    .section-header {
      margin-bottom: var(--text-lg);
      
      h3 {
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }
    }
    
    .result-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--text-lg);
    }
  }
}

.result-card {
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-medium);
  }
  
  .card-content {
    display: flex;
    align-items: center;
    gap: var(--text-lg);
    
    .card-avatar {
      width: 50px;
      height: 50px;
      border-radius: var(--radius-full);
      overflow: hidden;
      background: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .avatar-text {
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--text-secondary);
      }
    }
    
    .card-icon {
      width: 50px;
      height: 50px;
      border-radius: var(--radius-full);
      background: #dbeafe;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      
      .el-icon {
        font-size: var(--text-3xl);
        color: var(--primary-color);
      }
    }
    
    .card-info {
      flex: 1;
      min-width: 0;
      
      .card-title {
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-xs) 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .card-subtitle {
        font-size: var(--text-base);
        color: var(--text-secondary);
        margin: 0 0 var(--spacing-sm) 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .card-meta {
        font-size: var(--text-sm);
        color: var(--text-tertiary);
        margin: var(--spacing-sm) 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}

.student-card {
  border-left: var(--spacing-xs) solid var(--success-color);
}

.teacher-card {
  border-left: var(--spacing-xs) solid var(--primary-color);
}

.class-card {
  border-left: var(--spacing-xs) solid var(--warning-color);
}

.parent-card {
  border-left: var(--spacing-xs) solid var(--ai-primary);
}

.activity-card {
  border-left: var(--spacing-xs) solid var(--danger-color);
}

.no-results,
.search-placeholder {
  padding: var(--spacing-15xl) var(--text-2xl);
  text-align: center;
  
  .search-tips {
    margin-top: var(--text-3xl);
    text-align: left;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
    
    h4 {
      color: var(--color-gray-700);
      margin-bottom: var(--text-sm);
    }
    
    ul {
      color: var(--text-secondary);
      
      li {
        margin-bottom: var(--spacing-xs);
      }
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .search-container {
    padding: var(--text-lg);
  }
  
  .stats-content {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .result-grid {
    grid-template-columns: 1fr !important;
  }
  
  .el-form--inline .el-form-item {
    display: block;
    margin-bottom: var(--text-lg);
  }
}
</style>
