<template>
  <div class="class-course-container class-detail-page students-section">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="handleBack" class="back-button">
          <UnifiedIcon name="ArrowLeft" />
          返回
        </el-button>
        <h1 class="page-title">教师详情</h1>
      </div>
      <div class="page-actions">
        <el-button type="warning" @click="handleEdit">
          <UnifiedIcon name="Edit" />
          编辑
        </el-button>
        <el-button type="danger" @click="handleDelete">
          <UnifiedIcon name="Delete" />
          删除
        </el-button>
      </div>
    </div>

    <!-- 教师基本信息卡片 -->
    <el-row :gutter="24" class="info-section">
      <el-col :xs="24" :lg="8">
        <el-card class="profile-card" shadow="never">
          <div class="profile-content">
            <div class="avatar-section">
              <el-avatar size="large" :src="teacherInfo.avatar" class="teacher-avatar large-avatar">
                {{ teacherInfo.name?.charAt(0) }}
              </el-avatar>
              <el-button type="primary" size="small" @click="handleAvatarUpload" class="avatar-upload-btn">
                更换头像
              </el-button>
            </div>
            <div class="basic-info">
              <h2 class="teacher-name">{{ teacherInfo.name }}</h2>
              <div class="info-item">
                <span class="label">工号:</span>
                <span class="value">{{ teacherInfo.employeeId }}</span>
              </div>
              <div class="info-item">
                <span class="label">职位:</span>
                <span class="value">{{ teacherInfo.position }}</span>
              </div>
              <div class="info-item">
                <span class="label">状态:</span>
                <el-tag :type="getStatusTagType(teacherInfo.status)">
                  {{ getStatusText(teacherInfo.status) }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="16">
        <el-card class="details-card" shadow="never">
          <template #header>
            <span>详细信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="姓名">{{ teacherInfo.name }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ getGenderText(teacherInfo.gender) }}</el-descriptions-item>
            <el-descriptions-item label="年龄">{{ teacherInfo.age }}岁</el-descriptions-item>
            <el-descriptions-item label="出生日期">{{ formatDate(teacherInfo.birthDate) }}</el-descriptions-item>
            <el-descriptions-item label="入职日期">{{ formatDate(teacherInfo.hireDate) }}</el-descriptions-item>
            <el-descriptions-item label="工作状态">{{ getStatusText(teacherInfo.status) }}</el-descriptions-item>
            <el-descriptions-item label="主教科目">{{ teacherInfo.subject }}</el-descriptions-item>
            <el-descriptions-item label="教学经验">{{ teacherInfo.experience }}年</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ teacherInfo.phone }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ teacherInfo.email }}</el-descriptions-item>
            <el-descriptions-item label="家庭地址" :span="2">{{ teacherInfo.address }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ teacherInfo.remarks || '无' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <!-- 统计卡片区域 -->
    <el-row :gutter="24" class="stats-section">
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

    <!-- 功能标签页 -->
    <el-card class="tabs-section" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 任教班级 -->
        <el-tab-pane label="任教班级" name="classes">
          <div class="classes-section">
            <div class="section-header">
              <h3>任教班级</h3>
              <el-button type="primary" @click="handleAssignClass">
                <UnifiedIcon name="Plus" />
                分配班级
              </el-button>
            </div>
            <div class="table-wrapper">
<el-table class="responsive-table" :data="teachingClasses" style="width: 100%; min-min-min-height: 60px; height: auto; height: auto;">
              <el-table-column prop="className" label="班级名称" width="150" />
              <el-table-column prop="subject" label="任教科目" width="120" />
              <el-table-column prop="role" label="角色" width="100">
                <template #default="scope">
                  <el-tag :type="getRoleTagType(scope.row.role)">
                    {{ getRoleText(scope.row.role) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="studentCount" label="学生人数" width="100" />
              <el-table-column prop="startDate" label="开始时间" width="120">
                <template #default="scope">
                  {{ formatDate(scope.row.startDate) }}
                </template>
              </el-table-column>
              <el-table-column prop="schedule" label="课程安排" min-width="200" />
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="handleViewClass(scope.row)">
                    查看
                  </el-button>
                  <el-button type="danger" size="small" @click="handleRemoveClass(scope.row)">
                    移除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
</div>
          </div>
        </el-tab-pane>

        <!-- 教学记录 -->
        <el-tab-pane label="教学记录" name="teaching">
          <div class="teaching-section">
            <div class="section-header">
              <h3>教学记录</h3>
              <el-button type="primary" @click="handleAddTeachingRecord">
                <UnifiedIcon name="Plus" />
                添加记录
              </el-button>
            </div>
            <el-table class="responsive-table" :data="teachingRecords" style="width: 100%; min-min-height: 60px; height: auto;">
              <el-table-column prop="date" label="日期" width="120">
                <template #default="scope">
                  {{ formatDate(scope.row.date) }}
                </template>
              </el-table-column>
              <el-table-column prop="className" label="班级" width="120" />
              <el-table-column prop="subject" label="科目" width="100" />
              <el-table-column prop="content" label="教学内容" min-width="200" />
              <el-table-column prop="duration" label="课时" width="80" />
              <el-table-column prop="evaluation" label="教学评价" width="120">
                <template #default="scope">
                  <el-tag :type="getEvaluationTagType(scope.row.evaluation)">
                    {{ getEvaluationText(scope.row.evaluation) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="handleViewTeachingRecord(scope.row)">
                    查看
                  </el-button>
                  <el-button type="warning" size="small" @click="handleEditTeachingRecord(scope.row)">
                    编辑
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 考勤记录 -->
        <el-tab-pane label="考勤记录" name="attendance">
          <div class="attendance-section">
            <div class="section-header">
              <h3>考勤记录</h3>
              <div class="date-filter">
                <el-date-picker
                  v-model="attendanceMonth"
                  type="month"
                  placeholder="选择月份"
                  @change="loadAttendanceRecords"
                />
              </div>
            </div>
            <div class="attendance-stats">
              <el-row :gutter="16">
                <el-col :span="6">
                  <div class="stat-item present">
                    <div class="stat-value">{{ attendanceStats.present }}</div>
                    <div class="stat-label">出勤天数</div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="stat-item absent">
                    <div class="stat-value">{{ attendanceStats.absent }}</div>
                    <div class="stat-label">缺勤天数</div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="stat-item late">
                    <div class="stat-value">{{ attendanceStats.late }}</div>
                    <div class="stat-label">迟到次数</div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="stat-item overtime">
                    <div class="stat-value">{{ attendanceStats.overtime }}</div>
                    <div class="stat-label">加班天数</div>
                  </div>
                </el-col>
              </el-row>
            </div>
            <el-table class="responsive-table" :data="attendanceRecords" style="width: 100%; min-min-height: 60px; height: auto;">
              <el-table-column prop="date" label="日期" width="120">
                <template #default="scope">
                  {{ formatDate(scope.row.date) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="考勤状态" width="100">
                <template #default="scope">
                  <el-tag :type="getAttendanceTagType(scope.row.status)">
                    {{ getAttendanceText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="checkInTime" label="签到时间" width="120" />
              <el-table-column prop="checkOutTime" label="签退时间" width="120" />
              <el-table-column prop="workHours" label="工作时长" width="100" />
              <el-table-column prop="remarks" label="备注" min-width="200" />
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 绩效评估 -->
        <el-tab-pane label="绩效评估" name="performance">
          <div class="performance-section">
            <div class="section-header">
              <h3>绩效评估</h3>
              <el-button type="primary" @click="handleAddPerformance">
                <UnifiedIcon name="Plus" />
                添加评估
              </el-button>
            </div>
            <el-table class="responsive-table" :data="performanceRecords" style="width: 100%; min-min-height: 60px; height: auto;">
              <el-table-column prop="period" label="评估期间" width="150" />
              <el-table-column prop="type" label="评估类型" width="120">
                <template #default="scope">
                  <el-tag :type="getPerformanceTypeTagType(scope.row.type)">
                    {{ getPerformanceTypeText(scope.row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="score" label="总分" width="80" />
              <el-table-column prop="level" label="等级" width="100">
                <template #default="scope">
                  <el-tag :type="getPerformanceLevelTagType(scope.row.level)">
                    {{ getPerformanceLevelText(scope.row.level) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="evaluator" label="评估人" width="100" />
              <el-table-column prop="date" label="评估日期" width="120">
                <template #default="scope">
                  {{ formatDate(scope.row.date) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="handleViewPerformance(scope.row)">
                    查看
                  </el-button>
                  <el-button type="warning" size="small" @click="handleEditPerformance(scope.row)">
                    编辑
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 编辑教师信息对话框 -->
    <el-dialog 
      v-model="editDialogVisible" 
      title="编辑教师信息" 
      width="600px"
      @close="handleEditDialogClose"
    >
      <el-form 
        ref="editFormRef"
        :model="editFormData" 
        :rules="editRules" 
        label-width="120px"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="教师姓名" prop="name">
              <el-input v-model="editFormData.name" placeholder="请输入教师姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="editFormData.gender">
                <el-radio label="male">男</el-radio>
                <el-radio label="female">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="出生日期" prop="birthDate">
              <el-date-picker
                v-model="editFormData.birthDate"
                type="date"
                placeholder="选择出生日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工作状态" prop="status">
              <el-select v-model="editFormData.status" placeholder="请选择状态">
                <el-option label="在职" value="active" />
                <el-option label="休假" value="leave" />
                <el-option label="离职" value="resigned" />
                <el-option label="退休" value="retired" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="主教科目" prop="subject">
              <el-select v-model="editFormData.subject" placeholder="请选择科目">
                <el-option 
                  v-for="subject in subjectOptions" 
                  :key="subject.value" 
                  :label="subject.label" 
                  :value="subject.value" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职位" prop="position">
              <el-select v-model="editFormData.position" placeholder="请选择职位">
                <el-option label="班主任" value="head_teacher" />
                <el-option label="任课教师" value="subject_teacher" />
                <el-option label="助教" value="assistant" />
                <el-option label="实习教师" value="intern" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="editFormData.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="editFormData.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="家庭地址" prop="address">
          <el-input v-model="editFormData.address" placeholder="请输入家庭地址" />
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input 
            v-model="editFormData.remarks" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            :loading="loading.submit"
            @click="handleEditSubmit"
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
import { useRouter, useRoute } from 'vue-router'

// 2. Element Plus 导入
import { ElMessage, ElMessageBox, ElForm } from 'element-plus'
import { 
  ArrowLeft, Edit, Delete, Plus, User, Document, Trophy, TrendCharts
} from '@element-plus/icons-vue'

// 3. 公共工具函数导入
import { TEACHER_ENDPOINTS, CLASS_ENDPOINTS } from '@/api/endpoints'
import { get, post, put, del } from '@/utils/request'
import { formatDate } from '@/utils/dateFormat'
import type { ApiResponse } from '@/types/api'

// 教师信息类型
interface TeacherInfo {
  id: string
  employeeId: string;
  name: string;
  gender: string;
  age: number
  birthDate: string
  hireDate: string;
  status: string;
  position: string;
  subject: string;
  experience: number;
  phone: string;
  email: string;
  address: string;
  remarks: string;
  avatar: string
}

// 统计卡片数据类型
interface StatCard {
  type: string;
  icon: string;
  value: string | number;
  label: string
}

// 任教班级类型
interface TeachingClass {
  id: string
  className: string;
  subject: string;
  role: string
  studentCount: number
  startDate: string;
  schedule: string
}

// 教学记录类型
interface TeachingRecord {
  id: string;
  date: string
  className: string;
  subject: string;
  content: string;
  duration: number;
  evaluation: string
}

// 考勤记录类型
interface AttendanceRecord {
  id: string;
  date: string;
  status: string
  checkInTime: string
  checkOutTime: string
  workHours: string;
  remarks: string
}

// 绩效记录类型
interface PerformanceRecord {
  id: string;
  period: string;
  type: string;
  score: number;
  level: string;
  evaluator: string;
  date: string
}

const router = useRouter()
const route = useRoute()
const editFormRef = ref<InstanceType<typeof ElForm> | null>(null)

// 响应式数据
const loading = ref({
  page: false,
  submit: false
})

const activeTab = ref('classes')
const editDialogVisible = ref(false)
const attendanceMonth = ref(new Date())

// 教师信息
const teacherInfo = ref<TeacherInfo>({
  id: '',
  employeeId: '',
  name: '',
  gender: '',
  age: 0,
  birthDate: '',
  hireDate: '',
  status: '',
  position: '',
  subject: '',
  experience: 0,
  phone: '',
  email: '',
  address: '',
  remarks: '',
  avatar: ''
})

// 统计卡片数据
const statCards = ref<StatCard[]>([
  {
    type: 'primary',
  icon: 'User',
  value: 0,
  label: '任教班级'
  },
  {
    type: 'success',
  icon: 'Document',
  value: 0,
  label: '本月课时'
  },
  {
    type: 'warning',
  icon: 'star',
  value: 0,
  label: '学生人数'
  },
  {
    type: 'danger',
  icon: 'TrendCharts',
  value: '0',
  label: '绩效评分'
  }
])

// 各类记录数据
const teachingClasses = ref<TeachingClass[]>([])
const teachingRecords = ref<TeachingRecord[]>([])
const attendanceRecords = ref<AttendanceRecord[]>([])
const performanceRecords = ref<PerformanceRecord[]>([])

// 考勤统计
const attendanceStats = ref({
  present: 0,
  absent: 0,
  late: 0,
  overtime: 0
})

// 编辑表单数据
const editFormData = ref<Partial<TeacherInfo>>({})

// 科目选项
const subjectOptions = [
  { label: '语言', value: 'language' },
  { label: '数学', value: 'math' },
  { label: '科学', value: 'science' },
  { label: '艺术', value: 'art' },
  { label: '音乐', value: 'music' },
  { label: '体育', value: 'sports' },
  { label: '全科', value: 'all' }
]

// 表单验证规则
const editRules = {
  name: [
    { required: true, message: '请输入教师姓名', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  birthDate: [
    { required: true, message: '请选择出生日期', trigger: 'change' }
  ],
  subject: [
    { required: true, message: '请选择主教科目', trigger: 'change' }
  ],
  position: [
    { required: true, message: '请选择职位', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

// 图标组件映射
const iconComponents = {
  User,
  Document,
  Trophy,
  TrendCharts
}

// 获取教师ID
const teacherId = computed(() => {
  const id = route.params.id as string
  if (!id || id === 'undefined' || id === 'null') {
    console.error('教师ID无效:', id, '路由参数:', route.params)
    ElMessage.error('教师ID无效，请检查页面链接')
    return null
  }
  return id
})

// 加载教师信息
const loadTeacherInfo = async () => {
  if (!teacherId.value) {
    console.error('教师ID为空，无法加载教师信息')
    return
  }
  
  loading.value.page = true
  try {
    const response = await get<ApiResponse<TeacherInfo>>(TEACHER_ENDPOINTS.GET_BY_ID(teacherId.value))
    if (response.success && response.data) {
      teacherInfo.value = response.data
    }
  } catch (error) {
    console.error('加载教师信息失败:', error)
    ElMessage.error('加载教师信息失败')
  } finally {
    loading.value.page = false
  }
}

// 加载统计数据
const loadStats = async () => {
  if (!teacherId.value) {
    console.error('教师ID为空，无法加载统计数据')
    return
  }
  
  try {
    const response = await get<ApiResponse<any>>(`${TEACHER_ENDPOINTS.BASE}/${teacherId.value}/stats`)
    if (response.success && response.data) {
      const data = response.data
      statCards.value[0].value = data.classCount || 0
      statCards.value[1].value = data.monthlyHours || 0
      statCards.value[2].value = data.studentCount || 0
      statCards.value[3].value = data.performanceScore || '0'
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载任教班级
const loadTeachingClasses = async () => {
  if (!teacherId.value) {
    console.error('教师ID为空，无法加载任教班级')
    return
  }
  
  try {
    const response = await get<ApiResponse<TeachingClass[]>>(TEACHER_ENDPOINTS.GET_CLASSES(teacherId.value))
    if (response.success && response.data) {
      teachingClasses.value = response.data
    }
  } catch (error) {
    console.error('加载任教班级失败:', error)
  }
}

// 加载教学记录
const loadTeachingRecords = async () => {
  if (!teacherId.value) {
    console.error('教师ID为空，无法加载教学记录')
    return
  }
  
  try {
    const response = await get<ApiResponse<TeachingRecord[]>>(`${TEACHER_ENDPOINTS.BASE}/${teacherId.value}/teaching-records`)
    if (response.success && response.data) {
      teachingRecords.value = response.data
    }
  } catch (error) {
    console.error('加载教学记录失败:', error)
  }
}

// 加载考勤记录
const loadAttendanceRecords = async () => {
  if (!teacherId.value) {
    console.error('教师ID为空，无法加载考勤记录')
    return
  }
  
  try {
    const month = attendanceMonth.value.toISOString().slice(0, 7)
    const response = await get<ApiResponse<any>>(`${TEACHER_ENDPOINTS.BASE}/${teacherId.value}/attendance`, {
      params: { month }
    })
    if (response.success && response.data) {
      attendanceRecords.value = response.data.records || []
      attendanceStats.value = response.data.stats || {
        present: 0,
  absent: 0,
  late: 0,
  overtime: 0
      }
    }
  } catch (error) {
    console.error('加载考勤记录失败:', error)
  }
}

// 加载绩效记录
const loadPerformanceRecords = async () => {
  if (!teacherId.value) {
    console.error('教师ID为空，无法加载绩效记录')
    return
  }
  
  try {
    const response = await get<ApiResponse<PerformanceRecord[]>>(`${TEACHER_ENDPOINTS.BASE}/${teacherId.value}/performance`)
    if (response.success && response.data) {
      performanceRecords.value = response.data
    }
  } catch (error) {
    console.error('加载绩效记录失败:', error)
  }
}

// 标签页切换
const handleTabChange = (tabName: string | number) => {
  switch (tabName) {
    case 'classes':
      loadTeachingClasses()
      break
    case 'teaching':
      loadTeachingRecords()
      break
    case 'attendance':
      loadAttendanceRecords()
      break
    case 'performance':
      loadPerformanceRecords()
      break
  }
}

// 返回
const handleBack = () => {
  router.back()
}

// 编辑教师信息
const handleEdit = () => {
  editFormData.value = { ...teacherInfo.value }
  editDialogVisible.value = true
}

// 删除教师
const handleDelete = async () => {
  if (!teacherId.value) {
    ElMessage.error('教师ID无效，无法删除')
    return
  }
  
  try {
    await ElMessageBox.confirm('确定要删除这个教师吗？', '确认删除', {
      type: 'warning'
    })
    
    const response = await del<ApiResponse>(TEACHER_ENDPOINTS.DELETE(teacherId.value))
    if (response.success) {
      ElMessage.success('删除成功')
      router.push('/teachers')
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    console.error('删除教师失败:', error)
  }
}

// 头像上传
const handleAvatarUpload = () => {
  ElMessage.info('头像上传功能开发中')
}

// 编辑提交
const handleEditSubmit = async () => {
  if (!editFormRef.value) return
  
  if (!teacherId.value) {
    ElMessage.error('教师ID无效，无法更新')
    return
  }
  
  try {
    await editFormRef.value.validate()
    loading.value.submit = true
    
    const response = await put<ApiResponse>(TEACHER_ENDPOINTS.UPDATE(teacherId.value), editFormData.value)
    if (response.success) {
      ElMessage.success('更新成功')
      editDialogVisible.value = false
      loadTeacherInfo()
    } else {
      ElMessage.error(response.message || '更新失败')
    }
  } catch (error) {
    console.error('更新教师信息失败:', error)
    ElMessage.error('更新失败')
  } finally {
    loading.value.submit = false
  }
}

// 关闭编辑对话框
const handleEditDialogClose = () => {
  if (editFormRef.value && typeof editFormRef.value.resetFields === 'function') {
    editFormRef.value.resetFields()
  }
}

// 各种操作处理函数
const handleAssignClass = () => {
  ElMessage.info('分配班级功能开发中')
}

const handleViewClass = (classInfo: TeachingClass) => {
  router.push(`/classes/${classInfo.id}`)
}

const handleRemoveClass = async (classInfo: TeachingClass) => {
  try {
    await ElMessageBox.confirm('确定要移除这个班级吗？', '确认移除', {
      type: 'warning'
    })
    ElMessage.info('移除班级功能开发中')
  } catch (error) {
    // 用户取消
  }
}

const handleAddTeachingRecord = () => {
  ElMessage.info('添加教学记录功能开发中')
}

const handleViewTeachingRecord = (record: TeachingRecord) => {
  ElMessage.info('查看教学记录功能开发中')
}

const handleEditTeachingRecord = (record: TeachingRecord) => {
  ElMessage.info('编辑教学记录功能开发中')
}

const handleAddPerformance = () => {
  ElMessage.info('添加绩效评估功能开发中')
}

const handleViewPerformance = (record: PerformanceRecord) => {
  ElMessage.info('查看绩效评估功能开发中')
}

const handleEditPerformance = (record: PerformanceRecord) => {
  ElMessage.info('编辑绩效评估功能开发中')
}

// 工具函数
const getStatusTagType = (status: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    active: 'success',
  leave: 'warning',
  resigned: 'danger',
  retired: 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    active: '在职',
  leave: '休假',
  resigned: '离职',
  retired: '退休'
  }
  return textMap[status] || status
}

const getGenderText = (gender: string) => {
  return gender === 'male' ? '男' : '女'
}

const getRoleTagType = (role: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    head_teacher: 'primary',
    subject_teacher: 'success',
  assistant: 'warning',
  intern: 'info'
  }
  return typeMap[role] || 'info'
}

const getRoleText = (role: string) => {
  const textMap: Record<string, string> = {
    head_teacher: '班主任',
    subject_teacher: '任课教师',
  assistant: '助教',
  intern: '实习教师'
  }
  return textMap[role] || role
}

const getEvaluationTagType = (evaluation: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    excellent: 'success',
  good: 'primary',
  average: 'warning',
  poor: 'danger'
  }
  return typeMap[evaluation] || 'info'
}

const getEvaluationText = (evaluation: string) => {
  const textMap: Record<string, string> = {
    excellent: '优秀',
  good: '良好',
  average: '一般',
  poor: '待改进'
  }
  return textMap[evaluation] || evaluation
}

const getAttendanceTagType = (status: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    present: 'success',
  absent: 'danger',
  late: 'warning',
  overtime: 'primary'
  }
  return typeMap[status] || 'info'
}

const getAttendanceText = (status: string) => {
  const textMap: Record<string, string> = {
    present: '正常',
  absent: '缺勤',
  late: '迟到',
  overtime: '加班'
  }
  return textMap[status] || status
}

const getPerformanceTypeTagType = (type: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    monthly: 'primary',
  quarterly: 'success',
  annual: 'warning'
  }
  return typeMap[type] || 'info'
}

const getPerformanceTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    monthly: '月度',
  quarterly: '季度',
  annual: '年度'
  }
  return textMap[type] || type
}

const getPerformanceLevelTagType = (level: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    A: 'success',
    B: 'primary',
    C: 'warning',
    D: 'danger'
  }
  return typeMap[level] || 'info'
}

const getPerformanceLevelText = (level: string) => {
  const textMap: Record<string, string> = {
    A: '优秀',
    B: '良好',
    C: '合格',
    D: '待改进'
  }
  return textMap[level] || level
}

// 页面初始化
onMounted(async () => {
  await Promise.all([
    loadTeacherInfo(),
    loadStats()
  ])
  handleTabChange(activeTab.value)
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;
@use '../class-course-ux-styles.scss' as *;

/* 页面容器样式已通过全局样式提供，保留特定样式 */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.page-actions {
  display: flex;
  gap: var(--space-md);
}

.info-section {
  margin-bottom: var(--space-xl);
}

.profile-card,
.details-card {
  border: none;
}

.profile-content {
  text-align: center;
}

.avatar-section {
  margin-bottom: var(--space-xl);
}

.teacher-avatar {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  font-size: var(--text-3xl);
  font-weight: 600;
}

.basic-info {
  text-align: left;
}

.teacher-name {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: var(--space-lg);
  text-align: center;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  padding: var(--space-sm) 0;
  border-bottom: var(--z-index-dropdown) solid var(--el-border-color-lighter);
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.value {
  color: var(--el-text-color-primary);
}

.stats-section {
  margin-bottom: var(--space-xl);
}

.stat-card {
  border: none;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(var(--transform-hover-lift));
  box-shadow: var(--shadow-lg);
}

.stat-card.primary {
  border-left: var(--spacing-xs) solid var(--el-color-primary);
}

.stat-card.success {
  border-left: var(--spacing-xs) solid var(--el-color-success);
}

.stat-card.warning {
  border-left: var(--spacing-xs) solid var(--el-color-warning);
}

.stat-card.danger {
  border-left: var(--spacing-xs) solid var(--el-color-danger);
}

.stat-card-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: auto;
  height: 60px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--space-lg);
  background: linear-gradient(135deg, var(--el-color-primary-light-9), var(--el-color-primary-light-7));
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1;
  margin-bottom: var(--space-xs);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
}

.tabs-section {
  border: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.section-header h3 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.date-filter {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.attendance-stats {
  margin-bottom: var(--space-xl);
}

.stat-item {
  text-align: center;
  padding: var(--space-lg);
  border-radius: var(--radius-base);
  background: var(--el-bg-color-page);
}

.stat-item.present {
  border-left: var(--spacing-xs) solid var(--el-color-success);
}

.stat-item.absent {
  border-left: var(--spacing-xs) solid var(--el-color-danger);
}

.stat-item.late {
  border-left: var(--spacing-xs) solid var(--el-color-warning);
}

.stat-item.overtime {
  border-left: var(--spacing-xs) solid var(--el-color-primary);
}

.stat-value {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin-bottom: var(--space-xs);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
}

/* 添加缺失的样式 */
.back-button {
  margin-right: var(--space-lg);
}

.avatar-upload-btn {
  margin-top: var(--space-md);
}

.large-avatar {
  width: var(--avatar-size); height: var(--avatar-size);
  font-size: var(--text-3xl);
}
</style> 