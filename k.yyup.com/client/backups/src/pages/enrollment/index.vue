<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">招生管理</h1>
      <div class="page-actions">
        <el-button type="primary" @click="handleCreateEnrollment">
          <el-icon><Plus /></el-icon>
          新增招生
        </el-button>

        <el-button type="success" :disabled="selectedRows.length === 0" @click="batchApprove">
          <el-icon><Check /></el-icon>
          批量通过
        </el-button>
        <el-button type="warning" :disabled="selectedRows.length === 0" @click="batchReject">
          <el-icon><Close /></el-icon>
          批量拒绝
        </el-button>
        <el-button type="success" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <el-row :gutter="24" class="stats-section">
      <el-col :xs="24" :sm="12" :md="6" v-for="(stat, index) in statCards" :key="index">
        <el-card class="stat-card" :class="stat.type" shadow="hover">
          <div class="stat-card-content">
            <div class="stat-icon">
              <el-icon :size="32">
                <component :is="iconComponents[stat.icon]" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">
                <div v-if="loading.stats" class="stat-skeleton"></div>
                <span v-else class="stat-number">{{ stat.value }}</span>
              </div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索和筛选区域 -->
    <el-card class="search-section" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="学生姓名">
          <el-input 
            v-model="searchForm.studentName" 
            placeholder="请输入学生姓名"
            clearable
          />
        </el-form-item>
        <el-form-item label="家长姓名">
          <el-input 
            v-model="searchForm.parentName" 
            placeholder="请输入家长姓名"
            clearable
          />
        </el-form-item>
        <el-form-item label="招生状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="咨询中" value="consulting" />
            <el-option label="试听中" value="trial" />
            <el-option label="已报名" value="enrolled" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="年龄段">
          <el-select v-model="searchForm.ageGroup" placeholder="请选择年龄段" clearable>
            <el-option label="全部" value="" />
            <el-option label="小班(3-4岁)" value="small" />
            <el-option label="中班(4-5岁)" value="medium" />
            <el-option label="大班(5-6岁)" value="large" />
            <el-option label="学前班(6-7岁)" value="preschool" />
          </el-select>
        </el-form-item>
        <el-form-item label="报名时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
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

    <!-- 数据表格 -->
    <el-card class="table-section" shadow="never">
      <!-- 表格容器 - 固定高度避免CLS -->
      <div class="table-container">
        <!-- 空状态处理 -->
        <div v-if="!loading.table && enrollmentList.length === 0" class="empty-state-container">
          <EmptyState
            type="no-data"
            title="暂无招生记录"
            description="还没有任何招生信息，开始录入第一条招生记录吧！"
            size="medium"
            :primary-action="{
              text: '新增招生',
              type: 'primary',
              handler: () => handleCreateEnrollment()
            }"
            :secondary-action="{
              text: '导入数据',
              type: 'success',
              handler: () => handleImport()
            }"
            :suggestions="[
              '点击新增招生按钮开始录入',
              '可以导入Excel表格批量添加',
              '联系招生负责人获取更多信息'
            ]"
            :show-suggestions="true"
          />
        </div>

        <el-table 
          v-else
          :data="enrollmentList" 
          class="enrollment-table"
          v-loading="loading.table"
          @selection-change="handleSelectionChange"
        >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="scope">
            {{ scope.row.gender === 'male' ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="ageGroup" label="年龄段" width="120">
          <template #default="scope">
            <el-tag :type="getAgeGroupTagType(scope.row.ageGroup)">
              {{ getAgeGroupText(scope.row.ageGroup) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="parentName" label="家长姓名" width="120" />
        <el-table-column prop="parentPhone" label="联系电话" width="140" />
        <el-table-column prop="status" label="招生状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="来源渠道" width="120" />
        <el-table-column prop="consultant" label="咨询师" width="100" />
        <el-table-column prop="createTime" label="报名时间" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="handleView(scope.row)">
                查看
              </el-button>
              <el-button type="warning" size="small" @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button
                v-if="scope.row.status === 'PENDING' || scope.row.status === 'pending'"
                type="success"
                size="small"
                @click="approveApplication(scope.row)"
              >
                通过
              </el-button>
              <el-button
                v-if="scope.row.status === 'PENDING' || scope.row.status === 'pending'"
                type="danger"
                size="small"
                @click="rejectApplication(scope.row)"
              >
                拒绝
              </el-button>
              <el-button type="info" size="small" @click="handleFollow(scope.row)">
                跟进
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>



    <!-- 新增/编辑招生信息对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="handleDialogClose"
      :destroy-on-close="true"
    >
      <el-form 
        ref="formRef"
        :model="formData" 
        :rules="formRules" 
        label-width="120px"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="学生姓名" prop="studentName">
              <el-input v-model="formData.studentName" placeholder="请输入学生姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="formData.gender">
                <el-radio label="male">男</el-radio>
                <el-radio label="female">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="年龄" prop="age">
              <el-input-number 
                v-model="formData.age" 
                :min="1" 
                :max="10" 
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年龄段" prop="ageGroup">
              <el-select v-model="formData.ageGroup" placeholder="请选择年龄段">
                <el-option label="小班(3-4岁)" value="small" />
                <el-option label="中班(4-5岁)" value="medium" />
                <el-option label="大班(5-6岁)" value="large" />
                <el-option label="学前班(6-7岁)" value="preschool" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="家长姓名" prop="parentName">
              <el-input v-model="formData.parentName" placeholder="请输入家长姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="parentPhone">
              <el-input v-model="formData.parentPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="招生状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择状态">
                <el-option label="咨询中" value="consulting" />
                <el-option label="试听中" value="trial" />
                <el-option label="已报名" value="enrolled" />
                <el-option label="已拒绝" value="rejected" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来源渠道" prop="source">
              <el-select v-model="formData.source" placeholder="请选择来源渠道">
                <el-option label="线上推广" value="online" />
                <el-option label="朋友推荐" value="referral" />
                <el-option label="地推活动" value="offline" />
                <el-option label="电话咨询" value="phone" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="咨询师" prop="consultant">
              <el-select v-model="formData.consultant" placeholder="请选择咨询师">
                <el-option 
                  v-for="consultant in consultantOptions" 
                  :key="consultant.value" 
                  :label="consultant.label" 
                  :value="consultant.value" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="意向班级" prop="intendedClass">
              <el-select v-model="formData.intendedClass" placeholder="请选择意向班级">
                <el-option 
                  v-for="classItem in classOptions" 
                  :key="classItem.value" 
                  :label="classItem.label" 
                  :value="classItem.value" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="家庭地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入家庭地址" />
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input 
            v-model="formData.remarks" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            :loading="loading.submit"
            @click="handleSubmit"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 跟进记录对话框 -->
    <el-dialog 
      v-model="followDialogVisible" 
      title="添加跟进记录" 
      width="600px"
    >
      <el-form 
        ref="followFormRef"
        :model="followFormData" 
        :rules="followRules" 
        label-width="120px"
      >
        <el-form-item label="跟进方式" prop="type">
          <el-select v-model="followFormData.type" placeholder="请选择跟进方式">
            <el-option label="电话跟进" value="phone" />
            <el-option label="微信沟通" value="wechat" />
            <el-option label="上门拜访" value="visit" />
            <el-option label="邀请试听" value="trial" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="跟进内容" prop="content">
          <el-input 
            v-model="followFormData.content" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入跟进内容"
          />
        </el-form-item>
        <el-form-item label="下次跟进时间" prop="nextFollowTime">
          <el-date-picker
            v-model="followFormData.nextFollowTime"
            type="datetime"
            placeholder="选择下次跟进时间"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="followDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            :loading="loading.follow"
            @click="handleFollowSubmit"
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
import { ElMessage, ElMessageBox, ElForm, ElSkeleton, ElSkeletonItem } from 'element-plus'
import { 
  Plus, Download, Search, Refresh, User, Document, Trophy, TrendCharts, Check, Close
} from '@element-plus/icons-vue'

// 3. 组件导入
import EmptyState from '@/components/common/EmptyState.vue'

// 4. 统一API端点导入
import { ENROLLMENT_APPLICATION_ENDPOINTS, ENROLLMENT_ENDPOINTS } from '@/api/endpoints'
import { request } from '@/utils/request'
import type { ApiResponse } from '@/api/endpoints'
import { formatDateTime } from '@/utils/dateFormat'

// 使用统一的API响应类型，无需重复定义

// 统计卡片数据类型
interface StatCard {
  type: string;
  icon: string;
  value: string | number;
  label: string
}

// 招生信息类型
interface EnrollmentInfo {
  id: string
  studentName: string;
  gender: string;
  age: number
  ageGroup: string
  parentName: string
  parentPhone: string;
  status: string;
  source: string;
  consultant: string
  intendedClass: string;
  address: string;
  remarks: string
  createTime: string
  appliedAt?: string
  reviewedAt?: string
  reviewedBy?: string
  notes?: string
}

// 跟进记录类型
interface FollowRecord {
  type: string;
  content: string
  nextFollowTime: string
}

const router = useRouter()
const formRef = ref<InstanceType<typeof ElForm> | null>(null)
const followFormRef = ref<InstanceType<typeof ElForm> | null>(null)

// 响应式数据
const loading = ref({
  table: false,
  submit: false,
  follow: false,
  stats: true
})

const dialogVisible = ref(false)
const followDialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const selectedRows = ref<EnrollmentInfo[]>([])

// 统计卡片数据
const statCards = ref<StatCard[]>([
  {
    type: 'primary',
  icon: 'User',
  value: '0',
  label: '总咨询数'
  },
  {
    type: 'success',
  icon: 'Document',
  value: '0',
  label: '已报名'
  },
  {
    type: 'warning',
  icon: 'Trophy',
  value: '0',
  label: '试听中'
  },
  {
    type: 'danger',
  icon: 'TrendCharts',
  value: '0%',
  label: '转化率'
  }
])

// 搜索表单
const searchForm = ref({
  studentName: '',
  parentName: '',
  status: '',
  ageGroup: '',
  dateRange: []
})

// 分页信息
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 招生列表
const enrollmentList = ref<EnrollmentInfo[]>([])

// 表单数据
const formData = ref<Partial<EnrollmentInfo>>({
  studentName: '',
  gender: 'male',
  age: 3,
  ageGroup: '',
  parentName: '',
  parentPhone: '',
  status: 'consulting',
  source: '',
  consultant: '',
  intendedClass: '',
  address: '',
  remarks: ''
})

// 跟进表单数据
const followFormData = ref<FollowRecord>({
  type: '',
  content: '',
  nextFollowTime: ''
})

// 选项数据
const consultantOptions = ref([
  { label: '张老师', value: 'teacher_zhang' },
  { label: '李老师', value: 'teacher_li' },
  { label: '王老师', value: 'teacher_wang' }
])

const classOptions = ref([
  { label: '小班A', value: 'small_a' },
  { label: '小班B', value: 'small_b' },
  { label: '中班A', value: 'medium_a' },
  { label: '中班B', value: 'medium_b' },
  { label: '大班A', value: 'large_a' },
  { label: '大班B', value: 'large_b' }
])

// 表单验证规则
const formRules = {
  studentName: [
    { required: true, message: '请输入学生姓名', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' }
  ],
  ageGroup: [
    { required: true, message: '请选择年龄段', trigger: 'change' }
  ],
  parentName: [
    { required: true, message: '请输入家长姓名', trigger: 'blur' }
  ],
  parentPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择招生状态', trigger: 'change' }
  ],
  consultant: [
    { required: true, message: '请选择咨询师', trigger: 'change' }
  ]
}

const followRules = {
  type: [
    { required: true, message: '请选择跟进方式', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入跟进内容', trigger: 'blur' }
  ]
}

// 图标组件映射
const iconComponents = {
  User,
  Document,
  Trophy,
  TrendCharts
}

// 加载统计数据 - 使用统一端点
const loadStats = async () => {
  loading.value.stats = true
  try {
    const response: ApiResponse<any> = await request.get(ENROLLMENT_ENDPOINTS.STATISTICS)
    if (response.success && response.data) {
      const data = response.data
      const conversionRate = Math.round((data.approvedApplications / data.totalApplications || 0) * 100)
      // 使用固定宽度格式化数值，避免布局偏移
      statCards.value[0].value = String(data.totalApplications || 0).padStart(3, '0')
      statCards.value[1].value = String(data.approvedApplications || 0).padStart(3, '0')
      statCards.value[2].value = String(data.pendingApplications || 0).padStart(3, '0')
      statCards.value[3].value = `${String(conversionRate).padStart(2, '0')}%`
    } else {
      ElMessage.error(response.message || '加载统计数据失败')
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.value.stats = false
  }
}

// 根据年龄获取年龄段
const getAgeGroupFromAge = (age: number): string => {
  if (age >= 3 && age <= 4) return 'small'
  if (age >= 4 && age <= 5) return 'medium'
  if (age >= 5 && age <= 6) return 'large'
  if (age >= 6) return 'preschool'
  return ''
}

// 加载招生列表
const loadEnrollmentList = async () => {
  loading.value.table = true
  try {
    // 使用统一API端点
    const params = {
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      studentName: searchForm.value.studentName || undefined,
      status: searchForm.value.status || undefined,
      startDate: searchForm.value.dateRange?.[0],
      endDate: searchForm.value.dateRange?.[1]
    }
    const response: ApiResponse = await request.get(ENROLLMENT_APPLICATION_ENDPOINTS.BASE, { params })

    // 修复条件判断：检查响应是否包含有效数据
    if (response && (response.success || (response.data && (response.data.items || response.data.list)))) {
      // 安全处理API响应数据
      const responseData = response.data || {}
      let items = responseData.items || responseData.list || []

      // 如果list是对象而不是数组，则包装成数组
      if (items && typeof items === 'object' && !Array.isArray(items)) {
        items = [items]
      }

      // 确保items是数组
      if (!Array.isArray(items)) {
        items = []
      }

      enrollmentList.value = items.map(item => ({
        id: item.id,
        studentName: item.studentName,
        gender: item.gender || 'male',
        age: item.age || 0,
        ageGroup: item.ageGroup || getAgeGroupFromAge(item.age || 0),
        parentName: item.parentName || '',
        parentPhone: item.parentPhone || '',
        status: item.status || 'PENDING',
        source: item.source || 'online',
        consultant: item.consultant || '',
        intendedClass: item.intendedClass || '',
        address: item.address || '',
        remarks: item.remarks || '',
        createTime: item.createTime,
        appliedAt: item.appliedAt || item.createTime,
        reviewedAt: item.reviewedAt,
        reviewedBy: item.reviewedBy,
        notes: item.notes || item.remarks
      }))
      pagination.value.total = responseData.total || items.length || 0
    } else {
      ElMessage.error(response?.message || '加载招生列表失败')
      enrollmentList.value = []
      pagination.value.total = 0
    }
  } catch (error) {
    console.error('加载招生列表失败:', error)
    ElMessage.error('加载招生列表失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value.table = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
  loadEnrollmentList()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    studentName: '',
    parentName: '',
  status: '',
    ageGroup: '',
    dateRange: []
  }
  handleSearch()
}

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.value.pageSize = val
  loadEnrollmentList()
}

const handleCurrentChange = (val: number) => {
  pagination.value.currentPage = val
  loadEnrollmentList()
}

// 选择变化
const handleSelectionChange = (val: EnrollmentInfo[]) => {
  selectedRows.value = val
}

// 新增招生
const handleCreateEnrollment = () => {
  isEdit.value = false
  dialogTitle.value = '新增招生信息'
  formData.value = {
    studentName: '',
    gender: 'male',
    age: 3,
    ageGroup: '',
    parentName: '',
    parentPhone: '',
    status: 'consulting',
    source: '',
    consultant: '',
    intendedClass: '',
    address: '',
    remarks: ''
  }
  dialogVisible.value = true
}

// 查看详情
const handleView = (row: EnrollmentInfo) => {
  router.push(`/enrollment/${row.id}`)
}

// 编辑
const handleEdit = (row: EnrollmentInfo) => {
  isEdit.value = true
  dialogTitle.value = '编辑招生信息'
  // 确保所有字段都正确映射
  formData.value = {
    id: row.id,
    studentName: row.studentName || '',
    gender: row.gender || 'male',
    age: row.age || 3,
    ageGroup: row.ageGroup || '',
    parentName: row.parentName || '',
    parentPhone: row.parentPhone || '',
    status: row.status || 'consulting',
    source: row.source || '',
    consultant: row.consultant || '',
    intendedClass: row.intendedClass || '',
    address: row.address || '',
    remarks: row.remarks || ''
  }
  dialogVisible.value = true
}

// 跟进
const handleFollow = (row: EnrollmentInfo) => {
  followFormData.value = {
    type: '',
  content: '',
    nextFollowTime: ''
  }
  followDialogVisible.value = true
}

// 删除
const handleDelete = async (row: EnrollmentInfo) => {
  try {
    await ElMessageBox.confirm('确定要删除这条招生信息吗？', '确认删除', {
      type: 'warning'
    })
    
    const response: ApiResponse = await request.delete(ENROLLMENT_APPLICATION_ENDPOINTS.DELETE(row.id))
    if (response.success) {
      ElMessage.success('删除成功')
      loadEnrollmentList()
      loadStats()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    console.error('删除招生信息失败:', error)
  }
}

// 批量审核
const batchApprove = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要审核的申请')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要批量通过这 ${selectedRows.value.length} 个申请吗？`, '确认操作', {
      type: 'warning'
    })
    
    const response: ApiResponse = await request.post(ENROLLMENT_APPLICATION_ENDPOINTS.BATCH_APPROVE, {
      applicationIds: selectedRows.value.map(row => row.id),
      status: 'APPROVED',
      notes: '批量审核通过'
    })
    
    if (response.success) {
      ElMessage.success(`批量通过 ${selectedRows.value.length} 个申请`)
      selectedRows.value = []
      loadEnrollmentList()
      loadStats()
    } else {
      ElMessage.error(response.message || '批量操作失败')
    }
  } catch (error) {
    console.error('批量审核失败:', error)
  }
}

// 批量拒绝
const batchReject = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要拒绝的申请')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要批量拒绝这 ${selectedRows.value.length} 个申请吗？`, '确认操作', {
      type: 'warning'
    })
    
    const response: ApiResponse = await request.post(ENROLLMENT_APPLICATION_ENDPOINTS.BATCH_REJECT, {
      applicationIds: selectedRows.value.map(row => row.id),
      status: 'REJECTED',
      notes: '批量审核拒绝'
    })
    
    if (response.success) {
      ElMessage.success(`批量拒绝 ${selectedRows.value.length} 个申请`)
      selectedRows.value = []
      loadEnrollmentList()
      loadStats()
    } else {
      ElMessage.error(response.message || '批量操作失败')
    }
  } catch (error) {
    console.error('批量审核失败:', error)
  }
}

// 审核单个申请
const approveApplication = async (row: EnrollmentInfo) => {
  try {
    const response: ApiResponse = await request.put(ENROLLMENT_APPLICATION_ENDPOINTS.REVIEW(row.id), {
      status: 'APPROVED',
      notes: '申请已通过审核'
    })
    
    if (response.success) {
      ElMessage.success('申请已通过')
      loadEnrollmentList()
      loadStats()
    } else {
      ElMessage.error(response.message || '审核失败')
    }
  } catch (error) {
    console.error('审核失败:', error)
    ElMessage.error('审核失败')
  }
}

// 拒绝单个申请
const rejectApplication = async (row: EnrollmentInfo) => {
  try {
    const response: ApiResponse = await request.put(ENROLLMENT_APPLICATION_ENDPOINTS.REVIEW(row.id), {
      status: 'REJECTED',
      notes: '申请已被拒绝'
    })
    
    if (response.success) {
      ElMessage.success('申请已拒绝')
      loadEnrollmentList()
      loadStats()
    } else {
      ElMessage.error(response.message || '审核失败')
    }
  } catch (error) {
    console.error('审核失败:', error)
    ElMessage.error('审核失败')
  }
}

// 导出和导入功能
const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

const handleImport = () => {
  console.log('handleImport 函数被调用')
  ElMessage.info('导入功能开发中')
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value.submit = true
    
    if (isEdit.value) {
      // 更新招生申请
      const response: ApiResponse = await request.put(ENROLLMENT_APPLICATION_ENDPOINTS.UPDATE(formData.value.id as string), {
        studentName: formData.value.studentName || '',
        parentName: formData.value.parentName || '',
        parentPhone: formData.value.parentPhone || '',
        age: formData.value.age || 3,
        gender: formData.value.gender === 'male' ? 'male' : 'female',
        preferredClassId: formData.value.intendedClass,
        notes: formData.value.remarks
      })
      
      if (response.success) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        loadEnrollmentList()
        loadStats()
      } else {
        ElMessage.error(response.message || '更新失败')
      }
    } else {
      // 创建新的招生申请
      const response: ApiResponse = await request.post(ENROLLMENT_APPLICATION_ENDPOINTS.BASE, {
        studentName: formData.value.studentName || '',
        parentName: formData.value.parentName || '',
        parentPhone: formData.value.parentPhone || '',
        age: formData.value.age || 3,
        gender: formData.value.gender === 'male' ? 'male' : 'female',
        preferredClassId: formData.value.intendedClass,
        notes: formData.value.remarks
      })
      
      if (response.success) {
        ElMessage.success('创建成功')
        dialogVisible.value = false
        loadEnrollmentList()
        loadStats()
      } else {
        ElMessage.error(response.message || '创建失败')
      }
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('操作失败')
  } finally {
    loading.value.submit = false
  }
}

// 提交跟进记录 - 使用统一端点
const handleFollowSubmit = async () => {
  if (!followFormRef.value) return
  
  try {
    await followFormRef.value.validate()
    loading.value.follow = true
    
    const response: ApiResponse = await request.post(ENROLLMENT_ENDPOINTS.FOLLOW_UP, followFormData.value)
    if (response.success) {
      ElMessage.success('跟进记录添加成功')
      followDialogVisible.value = false
      loadEnrollmentList()
    } else {
      ElMessage.error(response.message || '添加失败')
    }
  } catch (error) {
    console.error('添加跟进记录失败:', error)
    ElMessage.error('添加失败')
  } finally {
    loading.value.follow = false
  }
}

// 关闭对话框
const handleDialogClose = () => {
  if (formRef.value && typeof formRef.value.resetFields === 'function') {
    formRef.value.resetFields()
  }
  // 重置状态
  isEdit.value = false
  dialogTitle.value = ''
  formData.value = {
    studentName: '',
    gender: 'male',
    age: 3,
    ageGroup: '',
    parentName: '',
    parentPhone: '',
    status: 'consulting',
    source: '',
    consultant: '',
    intendedClass: '',
    address: '',
    remarks: ''
  }
}

// 工具函数
const getStatusTagType = (status: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    CANCELED: 'info',
    consulting: 'primary',
    trial: 'warning',
    enrolled: 'success',
    rejected: 'danger',
    pending: 'warning',
    approved: 'success'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    PENDING: '待审核',
    APPROVED: '已通过',
    REJECTED: '已拒绝',
    CANCELED: '已取消',
    consulting: '咨询中',
    trial: '试听中',
    enrolled: '已报名',
    rejected: '已拒绝',
    pending: '待审核',
    approved: '已通过'
  }
  return textMap[status] || status
}

const getAgeGroupTagType = (ageGroup: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    small: 'primary',
  medium: 'success',
  large: 'warning',
  preschool: 'danger'
  }
  return typeMap[ageGroup] || 'info'
}

const getAgeGroupText = (ageGroup: string) => {
  const textMap: Record<string, string> = {
    small: '小班',
  medium: '中班',
  large: '大班',
  preschool: '学前班'
  }
  return textMap[ageGroup] || ageGroup
}

const formatDate = (date: string) => {
  return date ? new Date(date).toLocaleDateString() : ''
}

// 页面初始化
onMounted(async () => {
  await Promise.all([
    loadStats(),
    loadEnrollmentList()
  ])
})
</script>

<style scoped>
/* 使用全局样式：.page-container, .page-header */
.page-header {
  margin-bottom: var(--app-margin);
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.page-actions {
  display: flex;
  gap: var(--app-gap-sm);
}

.stats-section {
  margin-bottom: var(--app-margin);
}

.stat-card {
  border: none;
  transition: all 0.3s ease;
  min-height: 120px;
  contain: layout;
  will-change: transform;
}

.stat-card:hover {
  transform: translateY(-2px);
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
  width: 60px;
  height: 60px;
  border-radius: var(--app-gap-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--app-gap);
  background: var(--gradient-green);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1;
  margin-bottom: var(--spacing-xs);
  height: var(--button-height-sm);
  display: flex;
  align-items: center;
  min-width: 80px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
}

.search-section,
.table-section {
  margin-bottom: var(--app-margin);
  border: none;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: var(--app-margin);
}

/* 防止CLS的表格容器样式 */
.table-container {
  width: 100%;
  position: relative;
  overflow: auto;
  min-height: 400px;
}

/* 空状态容器固定高度 */
.empty-state-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 表格自适应高度 */
.enrollment-table {
  width: 100%;
}

/* 统计卡片固定高度 */
.stat-card {
  min-height: 120px;
  max-height: 120px;
  display: flex;
  align-items: center;
}

.stat-card-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

/* 统计数值骨架屏 */
.stat-skeleton {
  width: 80px;
  height: var(--button-height-sm);
  background: linear-gradient(90deg, var(--bg-gray-light) 25%, #e0e0e0 50%, var(--bg-gray-light) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: var(--spacing-xs);
  display: inline-block;
  vertical-align: top;
  will-change: transform;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 统计数值固定样式 */
.stat-number {
  display: inline-block;
  width: 80px;
  height: var(--button-height-sm);
  text-align: left;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
  vertical-align: top;
  line-height: var(--button-height-sm);
}

/* 减少悬停动画影响 */
.stat-card:hover {
  transform: none;
  box-shadow: var(--shadow-lg);
}

/* 禁用所有可能导致CLS的动画 */
.empty-state,
.empty-state * {
  animation: none !important;
  transition: none !important;
}

/* 防止CLS的额外优化 */
.stats-section {
  contain: layout;
}

.stat-card-content {
  contain: layout;
}

.stat-value {
  contain: layout;
}

/* 表格行高固定 */
.enrollment-table .el-table__row {
  height: 60px;
}

.enrollment-table .el-table__header-wrapper {
  height: 60px;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  align-items: center;
}

.action-buttons .el-button {
  margin: 0;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--text-sm);
}
</style> 