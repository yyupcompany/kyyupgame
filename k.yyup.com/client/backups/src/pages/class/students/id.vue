<template>
  <div class="class-course-container class-detail-page students-section">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="handleBack" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">学生详情</h1>
      </div>
      <div class="page-actions">
        <el-button type="warning" @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
        <el-button type="danger" @click="handleDelete">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
      </div>
    </div>

    <!-- 学生基本信息卡片 -->
    <el-row :gutter="24" class="info-section">
      <el-col :xs="24" :lg="8">
        <el-card class="profile-card" shadow="never">
          <div class="profile-content">
            <div class="avatar-section">
              <el-avatar size="large" :src="studentInfo.avatar" class="student-avatar large-avatar">
                {{ studentInfo.name?.charAt(0) }}
              </el-avatar>
              <el-button type="primary" size="small" @click="handleAvatarUpload" class="avatar-upload-btn">
                更换头像
              </el-button>
            </div>
            <div class="basic-info">
              <h2 class="student-name">{{ studentInfo.name }}</h2>
              <div class="info-item">
                <span class="label">学号:</span>
                <span class="value">{{ studentInfo.studentId }}</span>
              </div>
              <div class="info-item">
                <span class="label">班级:</span>
                <span class="value">{{ studentInfo.className }}</span>
              </div>
              <div class="info-item">
                <span class="label">状态:</span>
                <el-tag :type="getStatusTagType(studentInfo.status)">
                  {{ getStatusText(studentInfo.status) }}
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
            <el-descriptions-item label="姓名">{{ studentInfo.name }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ getGenderText(studentInfo.gender) }}</el-descriptions-item>
            <el-descriptions-item label="年龄">{{ studentInfo.age }}岁</el-descriptions-item>
            <el-descriptions-item label="出生日期">{{ formatDate(studentInfo.birthDate) }}</el-descriptions-item>
            <el-descriptions-item label="入学日期">{{ formatDate(studentInfo.enrollmentDate) }}</el-descriptions-item>
            <el-descriptions-item label="学籍状态">{{ getStatusText(studentInfo.status) }}</el-descriptions-item>
            <el-descriptions-item label="家长姓名">{{ studentInfo.parentName }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ studentInfo.parentPhone }}</el-descriptions-item>
            <el-descriptions-item label="家庭地址" :span="2">{{ studentInfo.address }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ studentInfo.remarks || '无' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <!-- 功能标签页 -->
    <el-card class="tabs-section" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 学习记录 -->
        <el-tab-pane label="学习记录" name="learning">
          <div class="learning-section">
            <div class="section-header">
              <h3>学习记录</h3>
              <el-button type="primary" @click="handleAddLearningRecord">
                <el-icon><Plus /></el-icon>
                添加记录
              </el-button>
            </div>
            <el-table :data="learningRecords" style="width: 100%">
              <el-table-column prop="date" label="日期" width="120">
                <template #default="scope">
                  {{ formatDate(scope.row.date) }}
                </template>
              </el-table-column>
              <el-table-column prop="subject" label="科目" width="100" />
              <el-table-column prop="content" label="学习内容" min-width="200" />
              <el-table-column prop="performance" label="表现" width="120">
                <template #default="scope">
                  <el-tag :type="getPerformanceTagType(scope.row.performance)">
                    {{ getPerformanceText(scope.row.performance) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="teacher" label="任课教师" width="100" />
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="handleViewLearningRecord(scope.row)">
                    查看
                  </el-button>
                  <el-button type="warning" size="small" @click="handleEditLearningRecord(scope.row)">
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
                  <div class="stat-item leave">
                    <div class="stat-value">{{ attendanceStats.leave }}</div>
                    <div class="stat-label">请假天数</div>
                  </div>
                </el-col>
              </el-row>
            </div>
            <el-table :data="attendanceRecords" style="width: 100%">
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
              <el-table-column prop="arrivalTime" label="到校时间" width="120" />
              <el-table-column prop="departureTime" label="离校时间" width="120" />
              <el-table-column prop="remarks" label="备注" min-width="200" />
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 健康档案 -->
        <el-tab-pane label="健康档案" name="health">
          <div class="health-section">
            <div class="section-header">
              <h3>健康档案</h3>
              <el-button type="primary" @click="handleAddHealthRecord">
                <el-icon><Plus /></el-icon>
                添加记录
              </el-button>
            </div>
            <el-table :data="healthRecords" style="width: 100%">
              <el-table-column prop="date" label="检查日期" width="120">
                <template #default="scope">
                  {{ formatDate(scope.row.date) }}
                </template>
              </el-table-column>
              <el-table-column prop="type" label="检查类型" width="120" />
              <el-table-column prop="height" label="身高(cm)" width="100" />
              <el-table-column prop="weight" label="体重(kg)" width="100" />
              <el-table-column prop="vision" label="视力" width="100" />
              <el-table-column prop="result" label="检查结果" min-width="200" />
              <el-table-column prop="doctor" label="检查医生" width="100" />
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="handleViewHealthRecord(scope.row)">
                    查看
                  </el-button>
                  <el-button type="warning" size="small" @click="handleEditHealthRecord(scope.row)">
                    编辑
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 家长沟通 -->
        <el-tab-pane label="家长沟通" name="communication">
          <div class="communication-section">
            <div class="section-header">
              <h3>家长沟通记录</h3>
              <el-button type="primary" @click="handleAddCommunication">
                <el-icon><Plus /></el-icon>
                新增沟通
              </el-button>
            </div>
            <el-table :data="communicationRecords" style="width: 100%">
              <el-table-column prop="date" label="沟通日期" width="120">
                <template #default="scope">
                  {{ formatDate(scope.row.date) }}
                </template>
              </el-table-column>
              <el-table-column prop="type" label="沟通方式" width="100">
                <template #default="scope">
                  <el-tag :type="getCommunicationTagType(scope.row.type)">
                    {{ getCommunicationText(scope.row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="teacher" label="沟通教师" width="100" />
              <el-table-column prop="content" label="沟通内容" min-width="300" />
              <el-table-column prop="result" label="沟通结果" width="120" />
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="handleViewCommunication(scope.row)">
                    查看
                  </el-button>
                  <el-button type="warning" size="small" @click="handleEditCommunication(scope.row)">
                    编辑
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 编辑学生信息对话框 -->
    <el-dialog 
      v-model="editDialogVisible" 
      title="编辑学生信息" 
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
            <el-form-item label="学生姓名" prop="name">
              <el-input v-model="editFormData.name" placeholder="请输入学生姓名" />
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
            <el-form-item label="学籍状态" prop="status">
              <el-select v-model="editFormData.status" placeholder="请选择状态">
                <el-option label="在读" value="active" />
                <el-option label="休学" value="suspended" />
                <el-option label="转学" value="transferred" />
                <el-option label="毕业" value="graduated" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="家长姓名" prop="parentName">
              <el-input v-model="editFormData.parentName" placeholder="请输入家长姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="parentPhone">
              <el-input v-model="editFormData.parentPhone" placeholder="请输入联系电话" />
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
  ArrowLeft, Edit, Delete, Plus
} from '@element-plus/icons-vue'

// 3. 公共工具函数导入
import request from '../../../utils/request'
import { formatDate } from '../../../utils/dateFormat'

// 解构request实例中的方法
const { get, post, put, del } = request

// 定义统一API响应类型
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

// 学生信息类型
interface StudentInfo {
  id: string
  studentId: string;
  name: string;
  gender: string;
  age: number
  birthDate: string
  enrollmentDate: string;
  status: string
  className: string
  parentName: string
  parentPhone: string;
  address: string;
  remarks: string;
  avatar: string
}

// 学习记录类型
interface LearningRecord {
  id: string;
  date: string;
  subject: string;
  content: string;
  performance: string;
  teacher: string
}

// 考勤记录类型
interface AttendanceRecord {
  id: string;
  date: string;
  status: string
  arrivalTime: string
  departureTime: string;
  remarks: string
}

// 健康记录类型
interface HealthRecord {
  id: string;
  date: string;
  type: string;
  height: number;
  weight: number;
  vision: string;
  result: string;
  doctor: string
}

// 沟通记录类型
interface CommunicationRecord {
  id: string;
  date: string;
  type: string;
  teacher: string;
  content: string;
  result: string
}

const router = useRouter()
const route = useRoute()
const editFormRef = ref<InstanceType<typeof ElForm> | null>(null)

// 响应式数据
const loading = ref({
  page: false,
  submit: false
})

const activeTab = ref('learning')
const editDialogVisible = ref(false)
const attendanceMonth = ref(new Date())

// 学生信息
const studentInfo = ref<StudentInfo>({
  id: '',
  studentId: '',
  name: '',
  gender: '',
  age: 0,
  birthDate: '',
  enrollmentDate: '',
  status: '',
  className: '',
  parentName: '',
  parentPhone: '',
  address: '',
  remarks: '',
  avatar: ''
})

// 各类记录数据
const learningRecords = ref<LearningRecord[]>([])
const attendanceRecords = ref<AttendanceRecord[]>([])
const healthRecords = ref<HealthRecord[]>([])
const communicationRecords = ref<CommunicationRecord[]>([])

// 考勤统计
const attendanceStats = ref({
  present: 0,
  absent: 0,
  late: 0,
  leave: 0
})

// 编辑表单数据
const editFormData = ref<Partial<StudentInfo>>({})

// 表单验证规则
const editRules = {
  name: [
    { required: true, message: '请输入学生姓名', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  birthDate: [
    { required: true, message: '请选择出生日期', trigger: 'change' }
  ],
  parentName: [
    { required: true, message: '请输入家长姓名', trigger: 'blur' }
  ],
  parentPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 获取学生ID
const studentId = computed(() => route.params.id as string)

// 加载学生信息
const loadStudentInfo = async () => {
  loading.value.page = true
  try {
    const response: ApiResponse<StudentInfo> = await get(`/api/students/${studentId.value}`)
    if (response.success && response.data) {
      studentInfo.value = response.data
    }
  } catch (error) {
    console.error('加载学生信息失败:', error)
    ElMessage.error('加载学生信息失败')
  } finally {
    loading.value.page = false
  }
}

// 加载学习记录
const loadLearningRecords = async () => {
  try {
    const response: ApiResponse<LearningRecord[]> = await get(`/api/students/${studentId.value}/learning-records`)
    if (response.success && response.data) {
      learningRecords.value = response.data
    }
  } catch (error) {
    console.error('加载学习记录失败:', error)
  }
}

// 加载考勤记录
const loadAttendanceRecords = async () => {
  try {
    const month = attendanceMonth.value.toISOString().slice(0, 7)
    const response: ApiResponse<any> = await get(`/api/students/${studentId.value}/attendance`, {
      month
    })
    if (response.success && response.data) {
      attendanceRecords.value = response.data.records || []
      attendanceStats.value = response.data.stats || {
        present: 0,
  absent: 0,
  late: 0,
  leave: 0
      }
    }
  } catch (error) {
    console.error('加载考勤记录失败:', error)
  }
}

// 加载健康记录
const loadHealthRecords = async () => {
  try {
    const response: ApiResponse<HealthRecord[]> = await get(`/api/students/${studentId.value}/health-records`)
    if (response.success && response.data) {
      healthRecords.value = response.data
    }
  } catch (error) {
    console.error('加载健康记录失败:', error)
  }
}

// 加载沟通记录
const loadCommunicationRecords = async () => {
  try {
    const response: ApiResponse<CommunicationRecord[]> = await get(`/api/students/${studentId.value}/communications`)
    if (response.success && response.data) {
      communicationRecords.value = response.data
    }
  } catch (error) {
    console.error('加载沟通记录失败:', error)
  }
}

// 标签页切换
const handleTabChange = (tabName: string | number) => {
  switch (tabName) {
    case 'learning':
      loadLearningRecords()
      break
    case 'attendance':
      loadAttendanceRecords()
      break
    case 'health':
      loadHealthRecords()
      break
    case 'communication':
      loadCommunicationRecords()
      break
  }
}

// 返回
const handleBack = () => {
  router.back()
}

// 编辑学生信息
const handleEdit = () => {
  editFormData.value = { ...studentInfo.value }
  editDialogVisible.value = true
}

// 删除学生
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这个学生吗？', '确认删除', {
      type: 'warning'
    })
    
    const response: ApiResponse = await del(`/api/students/${studentId.value}`)
    if (response.success) {
      ElMessage.success('删除成功')
      router.push('/students')
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    console.error('删除学生失败:', error)
  }
}

// 头像上传
const handleAvatarUpload = () => {
  ElMessage.info('头像上传功能开发中')
}

// 编辑提交
const handleEditSubmit = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    loading.value.submit = true
    
    const response: ApiResponse = await put(`/api/students/${studentId.value}`, editFormData.value)
    if (response.success) {
      ElMessage.success('更新成功')
      editDialogVisible.value = false
      loadStudentInfo()
    } else {
      ElMessage.error(response.message || '更新失败')
    }
  } catch (error) {
    console.error('更新学生信息失败:', error)
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

// 记录操作处理函数
const handleAddLearningRecord = () => {
  ElMessage.info('添加学习记录功能开发中')
}

const handleViewLearningRecord = (record: LearningRecord) => {
  ElMessage.info('查看学习记录功能开发中')
}

const handleEditLearningRecord = (record: LearningRecord) => {
  ElMessage.info('编辑学习记录功能开发中')
}

const handleAddHealthRecord = () => {
  ElMessage.info('添加健康记录功能开发中')
}

const handleViewHealthRecord = (record: HealthRecord) => {
  ElMessage.info('查看健康记录功能开发中')
}

const handleEditHealthRecord = (record: HealthRecord) => {
  ElMessage.info('编辑健康记录功能开发中')
}

const handleAddCommunication = () => {
  ElMessage.info('添加沟通记录功能开发中')
}

const handleViewCommunication = (record: CommunicationRecord) => {
  ElMessage.info('查看沟通记录功能开发中')
}

const handleEditCommunication = (record: CommunicationRecord) => {
  ElMessage.info('编辑沟通记录功能开发中')
}

// 工具函数
const getStatusTagType = (status: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    active: 'success',
  suspended: 'warning',
  transferred: 'info',
  graduated: 'primary'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    active: '在读',
  suspended: '休学',
  transferred: '转学',
  graduated: '毕业'
  }
  return textMap[status] || status
}

const getGenderText = (gender: string) => {
  return gender === 'male' ? '男' : '女'
}

const getPerformanceTagType = (performance: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    excellent: 'success',
  good: 'primary',
  average: 'warning',
  poor: 'danger'
  }
  return typeMap[performance] || 'info'
}

const getPerformanceText = (performance: string) => {
  const textMap: Record<string, string> = {
    excellent: '优秀',
  good: '良好',
  average: '一般',
  poor: '待改进'
  }
  return textMap[performance] || performance
}

const getAttendanceTagType = (status: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    present: 'success',
  absent: 'danger',
  late: 'warning',
  leave: 'info'
  }
  return typeMap[status] || 'info'
}

const getAttendanceText = (status: string) => {
  const textMap: Record<string, string> = {
    present: '出勤',
  absent: '缺勤',
  late: '迟到',
  leave: '请假'
  }
  return textMap[status] || status
}

const getCommunicationTagType = (type: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    phone: 'primary',
  visit: 'success',
  message: 'info',
  meeting: 'warning'
  }
  return typeMap[type] || 'info'
}

const getCommunicationText = (type: string) => {
  const textMap: Record<string, string> = {
    phone: '电话',
  visit: '家访',
  message: '短信',
  meeting: '面谈'
  }
  return textMap[type] || type
}

// 页面初始化
onMounted(async () => {
  await loadStudentInfo()
  handleTabChange(activeTab.value)
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';
@import '../class-course-ux-styles.scss';

/* 页面容器样式已通过全局样式提供，保留特定样式 */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.page-actions {
  display: flex;
  gap: var(--spacing-md);
}

.info-section {
  margin-bottom: var(--spacing-xl);
}

.profile-card,
.details-card {
  border: none;
}

.profile-content {
  text-align: center;
}

.avatar-section {
  margin-bottom: var(--spacing-xl);
}

.student-avatar {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  font-size: var(--font-size-6xl);
  font-weight: 600;
}

.basic-info {
  text-align: left;
}

.student-name {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm) 0;
  border-bottom: var(--border-width-base) solid var(--el-border-color-lighter);
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

.tabs-section {
  border: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-header h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.date-filter {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.attendance-stats {
  margin-bottom: var(--spacing-xl);
}

.stat-item {
  text-align: center;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-base);
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

.stat-item.leave {
  border-left: var(--spacing-xs) solid var(--el-color-info);
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--el-text-color-regular);
}

/* 添加缺失的样式 */
.back-button {
  margin-right: var(--spacing-lg);
}

.avatar-upload-btn {
  margin-top: var(--spacing-md);
}

.large-avatar {
  width: var(--avatar-size); height: var(--avatar-size);
  /* 大尺寸头像样式 */
}
</style> 