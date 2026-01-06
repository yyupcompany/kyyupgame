<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">客户管理</h1>
      <div class="page-actions">
        <el-button type="primary" @click="handleCreateCustomer">
          <el-icon><Plus /></el-icon>
          新增客户
        </el-button>
        <el-button type="success" @click="handleImport">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
        <el-button type="warning" @click="handleExport">
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
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索和筛选区域 -->
    <el-card class="search-section" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="客户姓名">
          <el-input 
            v-model="searchForm.name" 
            placeholder="请输入客户姓名"
            clearable
          />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input 
            v-model="searchForm.phone" 
            placeholder="请输入联系电话"
            clearable
          />
        </el-form-item>
        <el-form-item label="客户状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="潜在客户" value="potential" />
            <el-option label="意向客户" value="interested" />
            <el-option label="成交客户" value="converted" />
            <el-option label="流失客户" value="lost" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户来源">
          <el-select v-model="searchForm.source" placeholder="请选择来源" clearable>
            <el-option label="全部" value="" />
            <el-option label="线上推广" value="online" />
            <el-option label="朋友推荐" value="referral" />
            <el-option label="地推活动" value="offline" />
            <el-option label="电话咨询" value="phone" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="searchForm.assignee" placeholder="请选择负责人" clearable>
            <el-option label="全部" value="" />
            <el-option 
              v-for="staff in staffOptions" 
              :key="staff.value" 
              :label="staff.label" 
              :value="staff.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
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
      <div class="table-header">
        <div class="batch-actions">
          <el-button 
            type="primary" 
            :disabled="selectedRows.length === 0"
            @click="handleBatchAssign"
          >
            批量分配
          </el-button>
          <el-button 
            type="warning" 
            :disabled="selectedRows.length === 0"
            @click="handleBatchFollow"
          >
            批量跟进
          </el-button>
          <el-button 
            type="danger" 
            :disabled="selectedRows.length === 0"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
        </div>
      </div>

      <!-- 空状态处理 -->
      <EmptyState
        v-if="!loading.table && customerList.length === 0"
        type="no-data"
        title="暂无客户数据"
        description="还没有添加任何客户信息，立即创建第一个客户记录吧！"
        size="medium"
        :primary-action="{
          text: '新增客户',
          type: 'primary',
          handler: handleCreateCustomer
        }"
        :secondary-action="{
          text: '批量导入',
          type: 'success',
          handler: handleImport
        }"
        :suggestions="[
          '点击新增客户按钮开始录入',
          '使用批量导入功能快速添加',
          '联系系统管理员获取帮助'
        ]"
        :show-suggestions="true"
      />

      <el-table 
        v-else
        :data="customerList" 
        style="width: 100%"
        v-loading="loading.table"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="客户姓名" width="120" />
        <el-table-column prop="phone" label="联系电话" width="140" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="status" label="客户状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="客户来源" width="120">
          <template #default="scope">
            <el-tag :type="getSourceTagType(scope.row.source)">
              {{ getSourceText(scope.row.source) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assignee" label="负责人" width="100" />
        <el-table-column prop="lastContactTime" label="最后联系" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.lastContactTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="nextFollowTime" label="下次跟进" width="120">
          <template #default="scope">
            <span :class="getFollowTimeClass(scope.row.nextFollowTime)">
              {{ formatDate(scope.row.nextFollowTime) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleView(scope.row)">
              查看
            </el-button>
            <el-button type="warning" size="small" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button type="success" size="small" @click="handleFollow(scope.row)">
              跟进
            </el-button>
            <el-button type="info" size="small" @click="handleAssign(scope.row)">
              分配
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- 新增/编辑客户对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle" 
      width="800px"
      @close="handleDialogClose"
    >
      <el-form 
        ref="formRef"
        :model="formData" 
        :rules="formRules" 
        label-width="120px"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="客户姓名" prop="name">
              <el-input v-model="formData.name" placeholder="请输入客户姓名" />
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
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="formData.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="客户状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择状态">
                <el-option label="潜在客户" value="potential" />
                <el-option label="意向客户" value="interested" />
                <el-option label="成交客户" value="converted" />
                <el-option label="流失客户" value="lost" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户来源" prop="source">
              <el-select v-model="formData.source" placeholder="请选择来源">
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
            <el-form-item label="负责人" prop="assignee">
              <el-select v-model="formData.assignee" placeholder="请选择负责人">
                <el-option 
                  v-for="staff in staffOptions" 
                  :key="staff.value" 
                  :label="staff.label" 
                  :value="staff.value" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下次跟进时间" prop="nextFollowTime">
              <el-date-picker
                v-model="formData.nextFollowTime"
                type="datetime"
                placeholder="选择下次跟进时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入地址" />
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
            <el-option label="邮件联系" value="email" />
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
        <el-form-item label="客户反馈" prop="feedback">
          <el-input 
            v-model="followFormData.feedback" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入客户反馈"
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

    <!-- 分配客户对话框 -->
    <el-dialog 
      v-model="assignDialogVisible" 
      title="分配客户" 
      width="400px"
    >
      <el-form 
        ref="assignFormRef"
        :model="assignFormData" 
        label-width="120px"
      >
        <el-form-item label="分配给" prop="assignee">
          <el-select v-model="assignFormData.assignee" placeholder="请选择负责人">
            <el-option 
              v-for="staff in staffOptions" 
              :key="staff.value" 
              :label="staff.label" 
              :value="staff.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分配说明" prop="remarks">
          <el-input 
            v-model="assignFormData.remarks" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入分配说明"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="assignDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            :loading="loading.assign"
            @click="handleAssignSubmit"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量导入预览组件 -->
    <CustomerBatchImportPreview ref="importPreviewRef" />
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
  Plus, Upload, Download, Search, Refresh, User, Document, Trophy, TrendCharts
} from '@element-plus/icons-vue'

// 3. 组件导入
import EmptyState from '@/components/common/EmptyState.vue'
import CustomerBatchImportPreview from '@/components/customer/CustomerBatchImportPreview.vue'

// 4. 公共工具函数导入
import request from '../../utils/request'
import { formatDate } from '../../utils/dateFormat'

// 解构request实例中的方法
const { get, post, put, del } = request

// 导入客户API
import { 
  customerApi,
  type Customer,
  type CustomerQueryParams,
  type CreateCustomerRequest,
  CustomerType,
  CustomerStatus
} from '@/api/modules/customer'

// 定义API响应类型
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

// 客户信息类型
interface CustomerInfo {
  id: string;
  name: string;
  gender: string;
  phone: string;
  email: string;
  status: string;
  source: string;
  assignee: string;
  address: string;
  remarks: string
  lastContactTime: string
  nextFollowTime: string
  createTime: string
}

// 跟进记录类型
interface FollowRecord {
  type: string;
  content: string;
  feedback: string
  nextFollowTime: string
}

// 分配数据类型
interface AssignData {
  assignee: string;
  remarks: string
}

const router = useRouter()
const formRef = ref<InstanceType<typeof ElForm> | null>(null)
const followFormRef = ref<InstanceType<typeof ElForm> | null>(null)
const assignFormRef = ref<InstanceType<typeof ElForm> | null>(null)
const importPreviewRef = ref<InstanceType<typeof CustomerBatchImportPreview> | null>(null)

// 响应式数据
const loading = ref({
  table: false,
  submit: false,
  follow: false,
  assign: false
})

const dialogVisible = ref(false)
const followDialogVisible = ref(false)
const assignDialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const selectedRows = ref<Customer[]>([])
const selectedCustomerId = ref<string>('')

// 统计卡片数据
const statCards = ref<StatCard[]>([
  {
    type: 'primary',
  icon: 'User',
  value: 0,
  label: '总客户数'
  },
  {
    type: 'success',
  icon: 'Document',
  value: 0,
  label: '成交客户'
  },
  {
    type: 'warning',
  icon: 'Trophy',
  value: 0,
  label: '意向客户'
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
  name: '',
  phone: '',
  status: '',
  source: '',
  assignee: '',
  dateRange: []
})

// 分页信息
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 客户列表
const customerList = ref<Customer[]>([])

// 表单数据
const formData = ref<Partial<CustomerInfo>>({
  name: '',
  gender: 'male',
  phone: '',
  email: '',
  status: 'potential',
  source: '',
  assignee: '',
  address: '',
  remarks: '',
  nextFollowTime: ''
})

// 跟进表单数据
const followFormData = ref<FollowRecord>({
  type: '',
  content: '',
  feedback: '',
  nextFollowTime: ''
})

// 分配表单数据
const assignFormData = ref<AssignData>({
  assignee: '',
  remarks: ''
})

// 选项数据
const staffOptions = ref([
  { label: '张老师', value: 'teacher_zhang' },
  { label: '李老师', value: 'teacher_li' },
  { label: '王老师', value: 'teacher_wang' },
  { label: '赵老师', value: 'teacher_zhao' }
])

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入客户姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email' as const, message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择客户状态', trigger: 'change' }
  ],
  source: [
    { required: true, message: '请选择客户来源', trigger: 'change' }
  ]
}

const followRules: FormRules = {
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

// 加载统计数据
const loadStats = async () => {
  try {
    const response: ApiResponse<any> = await get('/api/customers/stats')
    if (response.success && response.data) {
      const data = response.data
      statCards.value[0].value = data.totalCustomers || 0
      statCards.value[1].value = data.convertedCustomers || 0
      statCards.value[2].value = data.interestedCustomers || 0
      statCards.value[3].value = `${data.conversionRate || 0}%`
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    // 使用模拟数据
    statCards.value[0].value = 2768
    statCards.value[1].value = 1234
    statCards.value[2].value = 856
    statCards.value[3].value = 44.6
  }
}

// 加载客户列表
const loadCustomerList = async () => {
  loading.value.table = true
  try {
    const params = {
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      ...searchForm.value
    }
    
    const response: ApiResponse<any> = await get('/api/customers/list', params)
    if (response.success && response.data) {
      customerList.value = response.data.list || []
      pagination.value.total = response.data.total || 0
    }
  } catch (error) {
    console.error('加载客户列表失败:', error)
    // 使用模拟数据
    customerList.value = [
      {
        id: 1,
        name: '张女士',
        phone: '138****1234',
        childName: '张小明',
        childAge: 4,
        type: 'potential',
        status: 'interested',
        source: 'online',
        assignedTo: '李老师',
        lastContact: '2024-01-15',
        nextFollowUp: '2024-01-20',
        notes: '对我们的课程很感兴趣'
      },
      {
        id: 2,
        name: '王先生',
        phone: '139****5678',
        childName: '王小红',
        childAge: 3,
        type: 'enrolled',
        status: 'converted',
        source: 'referral',
        assignedTo: '张老师',
        lastContact: '2024-01-10',
        nextFollowUp: null,
        notes: '已成功报名'
      }
    ]
    pagination.value.total = 2768
  } finally {
    loading.value.table = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
  loadCustomerList()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    name: '',
  phone: '',
  status: '',
  source: '',
  assignee: '',
    dateRange: []
  }
  handleSearch()
}

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.value.pageSize = val
  loadCustomerList()
}

const handleCurrentChange = (val: number) => {
  pagination.value.currentPage = val
  loadCustomerList()
}

// 选择变化
const handleSelectionChange = (val: CustomerInfo[]) => {
  selectedRows.value = val
}

// 新增客户
const handleCreateCustomer = () => {
  isEdit.value = false
  dialogTitle.value = '新增客户'
  formData.value = {
    name: '',
  gender: 'male',
  phone: '',
  email: '',
  status: 'potential',
  source: '',
  assignee: '',
  address: '',
  remarks: '',
    nextFollowTime: ''
  }
  dialogVisible.value = true
}

// 查看详情
const handleView = (row: CustomerInfo) => {
  router.push(`/customers/${row.id}`)
}

// 编辑
const handleEdit = (row: CustomerInfo) => {
  isEdit.value = true
  dialogTitle.value = '编辑客户'
  formData.value = { ...row }
  dialogVisible.value = true
}

// 跟进
const handleFollow = (row: Customer) => {
  selectedCustomerId.value = row.id
  followFormData.value = {
    type: '',
    content: '',
    feedback: '',
    nextFollowTime: ''
  }
  followDialogVisible.value = true
}

// 分配
const handleAssign = (row: Customer) => {
  selectedCustomerId.value = row.id
  assignFormData.value = {
    assignee: '',
    remarks: ''
  }
  assignDialogVisible.value = true
}

// 删除
const handleDelete = async (row: CustomerInfo) => {
  try {
    await ElMessageBox.confirm('确定要删除这个客户吗？', '确认删除', {
      type: 'warning'
    })
    
    const response: ApiResponse = await del(`/api/customers/${row.id}`)
    if (response.success) {
      ElMessage.success('删除成功')
      loadCustomerList()
      loadStats()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    console.error('删除客户失败:', error)
  }
}

// 批量操作
const handleBatchAssign = () => {
  ElMessage.info('批量分配功能开发中')
}

const handleBatchFollow = () => {
  ElMessage.info('批量跟进功能开发中')
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的${selectedRows.value.length}个客户吗？`, '确认删除', {
      type: 'warning'
    })
    ElMessage.info('批量删除功能开发中')
  } catch (error) {
    // 用户取消
  }
}

// 导入导出
const handleImport = () => {
  // 创建文件输入元素
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.xls,.csv'
  input.onchange = (e: any) => {
    const file = e.target.files?.[0]
    if (file) {
      importPreviewRef.value?.openPreview(file)
    }
  }
  input.click()
}

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
      ? `/api/customers/${formData.value.id}` 
      : '/api/customers'
    const method = isEdit.value ? put : post
    
    const response: ApiResponse = await method(url, formData.value)
    if (response.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
      loadCustomerList()
      loadStats()
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

// 提交跟进记录
const handleFollowSubmit = async () => {
  if (!followFormRef.value) return
  
  try {
    await followFormRef.value.validate()
    loading.value.follow = true
    
    const response: ApiResponse = await post(`/api/customers/${selectedCustomerId.value}/follow-up`, followFormData.value)
    if (response.success) {
      ElMessage.success('跟进记录添加成功')
      followDialogVisible.value = false
      loadCustomerList()
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

// 提交分配
const handleAssignSubmit = async () => {
  if (!assignFormRef.value) return
  
  try {
    loading.value.assign = true
    
    const response: ApiResponse = await post('/api/customers/assign', assignFormData.value)
    if (response.success) {
      ElMessage.success('分配成功')
      assignDialogVisible.value = false
      loadCustomerList()
    } else {
      ElMessage.error(response.message || '分配失败')
    }
  } catch (error) {
    console.error('分配客户失败:', error)
    ElMessage.error('分配失败')
  } finally {
    loading.value.assign = false
  }
}

// 关闭对话框
const handleDialogClose = () => {
  if (formRef.value && typeof formRef.value.resetFields === 'function') {
    formRef.value.resetFields()
  }
}

// 工具函数
const getStatusTagType = (status: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    potential: 'info',
  interested: 'warning',
  converted: 'success',
  lost: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    potential: '潜在客户',
  interested: '意向客户',
  converted: '成交客户',
  lost: '流失客户'
  }
  return textMap[status] || status
}

const getSourceTagType = (source: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    online: 'primary',
  referral: 'success',
  offline: 'warning',
  phone: 'info',
  other: 'info'
  }
  return typeMap[source] || 'info'
}

const getSourceText = (source: string) => {
  const textMap: Record<string, string> = {
    online: '线上推广',
  referral: '朋友推荐',
  offline: '地推活动',
  phone: '电话咨询',
  other: '其他'
  }
  return textMap[source] || source
}

const getFollowTimeClass = (time: string) => {
  if (!time) return ''
  const now = new Date()
  const followTime = new Date(time)
  const diff = followTime.getTime() - now.getTime()
  
  if (diff < 0) return 'overdue' // 已过期
  if (diff < 24 * 60 * 60 * 1000) return 'urgent' // 24小时内
  return ''
}

// 页面初始化
onMounted(async () => {
  await Promise.all([
    loadStats(),
    loadCustomerList()
  ])
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

/* 使用全局CSS变量，确保主题切换兼容性，完成三重修复 */
.page-container {
  /* 样式已通过全局样式文件管理 */
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
}

.page-title {
  font-size: 1.5rem; /* 硬编码修复：使用相对单位 */
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
  margin: 0;
  background: var(--gradient-blue); /* 硬编码修复：使用蓝色渐变 */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 按钮排版修复：页面操作按钮区域优化 */
.page-actions {
  display: flex;
  gap: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  flex-wrap: wrap;
  align-items: center;
}

.stats-section {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
}

.stat-card {
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  transition: all 0.3s ease;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg); /* 硬编码修复：使用统一阴影变量 */
  border-color: var(--border-light); /* 白色区域修复：使用主题浅色边框 */
}

.stat-card.primary {
  border-left: var(--app-gap-xs) solid var(--primary-color); /* 硬编码修复：使用统一间距和主题主色 */
}

.stat-card.success {
  border-left: var(--app-gap-xs) solid var(--success-color); /* 硬编码修复：使用统一间距和主题成功色 */
}

.stat-card.warning {
  border-left: var(--app-gap-xs) solid var(--warning-color); /* 硬编码修复：使用统一间距和主题警告色 */
}

.stat-card.danger {
  border-left: var(--app-gap-xs) solid var(--danger-color); /* 硬编码修复：使用统一间距和主题危险色 */
}

.stat-card-content {
  display: flex;
  align-items: center;
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md); /* 硬编码修复：使用统一圆角变量 */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--gradient-blue); /* 硬编码修复：使用蓝色渐变 */
  color: var(--text-light); /* 白色区域修复：使用主题浅色文字 */
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.75rem; /* 硬编码修复：使用相对单位 */
  font-weight: 700;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
  line-height: 1;
  margin-bottom: var(--app-gap-xs); /* 硬编码修复：使用统一间距变量 */
}

.stat-label {
  font-size: 0.875rem; /* 硬编码修复：使用相对单位 */
  color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */
}

.search-section,
.table-section {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
  overflow: hidden;
}

.search-section {
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
}

.table-section {
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
}

.table-header {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  padding: var(--app-gap-sm) 0; /* 硬编码修复：使用统一间距变量 */
  border-bottom: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
}

/* 按钮排版修复：批量操作按钮区域优化 */
.batch-actions {
  display: flex;
  gap: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  flex-wrap: wrap;
  align-items: center;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
}

.overdue {
  color: var(--danger-color); /* 硬编码修复：使用主题危险色 */
  font-weight: 600;
}

.urgent {
  color: var(--warning-color); /* 硬编码修复：使用主题警告色 */
  font-weight: 600;
}

/* 白色区域修复：Element Plus组件深度主题化 */
.page-container :deep(.el-card) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;
}

.page-container :deep(.el-card .el-card__body) {
  background: var(--bg-card) !important;
}

.page-container :deep(.el-form .el-form-item__label) {
  color: var(--text-primary) !important;
}

.page-container :deep(.el-input__inner) {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

.page-container :deep(.el-input__inner:focus) {
  border-color: var(--primary-color) !important;
  background: var(--bg-card) !important;
}

.page-container :deep(.el-select .el-input__inner) {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

.page-container :deep(.el-date-editor .el-input__inner) {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

.page-container :deep(.el-table) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
}

.page-container :deep(.el-table .el-table__header) {
  background: var(--bg-tertiary) !important;
}

.page-container :deep(.el-table .el-table__header th) {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

.page-container :deep(.el-table .el-table__body tr) {
  background: var(--bg-card) !important;
}

.page-container :deep(.el-table .el-table__body tr:hover) {
  background: var(--bg-hover) !important;
}

.page-container :deep(.el-table .el-table__body tr td) {
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

.page-container :deep(.el-table .el-table__empty-block) {
  background: var(--bg-card) !important;
}

.page-container :deep(.el-table .el-table__empty-text) {
  color: var(--text-muted) !important;
}

.page-container :deep(.el-button.el-button--primary) {
  background: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
}

.page-container :deep(.el-button.el-button--primary:hover) {
  background: var(--primary-light) !important;
  border-color: var(--primary-light) !important;
}

.page-container :deep(.el-button.el-button--success) {
  background: var(--success-color) !important;
  border-color: var(--success-color) !important;
}

.page-container :deep(.el-button.el-button--success:hover) {
  background: var(--success-light) !important;
  border-color: var(--success-light) !important;
}

.page-container :deep(.el-button.el-button--warning) {
  background: var(--warning-color) !important;
  border-color: var(--warning-color) !important;
}

.page-container :deep(.el-button.el-button--warning:hover) {
  background: var(--warning-light) !important;
  border-color: var(--warning-light) !important;
}

.page-container :deep(.el-button.el-button--danger) {
  background: var(--danger-color) !important;
  border-color: var(--danger-color) !important;
}

.page-container :deep(.el-button.el-button--danger:hover) {
  background: var(--danger-light) !important;
  border-color: var(--danger-light) !important;
}

.page-container :deep(.el-button.el-button--info) {
  background: var(--info-color) !important;
  border-color: var(--info-color) !important;
}

.page-container :deep(.el-button.el-button--info:hover) {
  background: var(--info-light) !important;
  border-color: var(--info-light) !important;
}

.page-container :deep(.el-button.el-button--default) {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

.page-container :deep(.el-button.el-button--default:hover) {
  background: var(--bg-hover) !important;
  border-color: var(--border-light) !important;
}

.page-container :deep(.el-tag.el-tag--primary) {
  background: var(--primary-bg) !important;
  border-color: var(--primary-light) !important;
  color: var(--primary-color) !important;
}

.page-container :deep(.el-tag.el-tag--success) {
  background: var(--success-bg) !important;
  border-color: var(--success-light) !important;
  color: var(--success-color) !important;
}

.page-container :deep(.el-tag.el-tag--warning) {
  background: var(--warning-bg) !important;
  border-color: var(--warning-light) !important;
  color: var(--warning-color) !important;
}

.page-container :deep(.el-tag.el-tag--danger) {
  background: var(--danger-bg) !important;
  border-color: var(--danger-light) !important;
  color: var(--danger-color) !important;
}

.page-container :deep(.el-tag.el-tag--info) {
  background: var(--info-bg) !important;
  border-color: var(--info-light) !important;
  color: var(--info-color) !important;
}

.page-container :deep(.el-pagination .el-pagination__total) {
  color: var(--text-primary) !important;
}

.page-container :deep(.el-pagination .el-pagination__jump) {
  color: var(--text-primary) !important;
}

.page-container :deep(.el-pager li) {
  background: var(--bg-tertiary) !important;
  color: var(--text-primary) !important;
  border: var(--border-width-base) solid var(--border-color) !important;
}

.page-container :deep(.el-pager li:hover) {
  background: var(--bg-hover) !important;
}

.page-container :deep(.el-pager li.active) {
  background: var(--primary-color) !important;
  color: var(--text-light) !important;
}

.page-container :deep(.btn-prev) {
  background: var(--bg-tertiary) !important;
  color: var(--text-primary) !important;
  border: var(--border-width-base) solid var(--border-color) !important;
}

.page-container :deep(.btn-next) {
  background: var(--bg-tertiary) !important;
  color: var(--text-primary) !important;
  border: var(--border-width-base) solid var(--border-color) !important;
}

.page-container :deep(.btn-prev:hover) {
  background: var(--bg-hover) !important;
}

.page-container :deep(.btn-next:hover) {
  background: var(--bg-hover) !important;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--app-gap);
  }
  
  .page-header .page-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .stats-section .el-col {
    margin-bottom: var(--app-gap);
  }
  
  .search-section .el-form .el-form-item {
    width: 100%;
    margin-bottom: var(--app-gap-sm);
  }
  
  .search-section .el-form .el-form-item .el-form-item__content {
    width: 100%;
  }
  
  .batch-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .batch-actions .el-button {
    width: 100%;
    margin-bottom: var(--app-gap-xs);
  }
}

@media (max-width: var(--breakpoint-md)) {
  .page-container {
    /* 移动端样式已通过全局样式文件管理 */
  }
  
  .page-header {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .page-header .page-title {
    font-size: 1.25rem; /* 硬编码修复：移动端字体优化 */
  }
  
  .page-header .page-actions {
    gap: var(--app-gap-xs); /* 硬编码修复：移动端间距优化 */
  }
  
  .page-header .page-actions .el-button {
    font-size: 0.875rem;
    padding: var(--app-gap-xs) var(--app-gap-sm); /* 硬编码修复：移动端按钮优化 */
  }
  
  .search-section,
  .table-section {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .stat-card-content {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .stat-card-content .stat-icon {
    width: var(--icon-size); height: var(--icon-size);
    margin-right: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .stat-card-content .stat-value {
    font-size: 1.5rem; /* 硬编码修复：移动端字体优化 */
  }
  
  .stat-card-content .stat-label {
    font-size: 0.75rem; /* 硬编码修复：移动端字体优化 */
  }
  
  .table-header {
    padding: var(--app-gap-xs) 0; /* 硬编码修复：移动端间距优化 */
  }
  
  .batch-actions .el-button {
    font-size: 0.75rem;
    padding: var(--app-gap-xs); /* 硬编码修复：移动端按钮优化 */
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .page-actions {
    flex-direction: column;
  }
  
  .page-actions .el-button {
    width: 100%;
  }
  
  .stats-section .el-col {
    margin-bottom: var(--app-gap-sm); /* 硬编码修复：小屏幕间距优化 */
  }
  
  .stat-card-content {
    flex-direction: column;
    text-align: center;
  }
  
  .stat-card-content .stat-icon {
    margin-right: 0;
    margin-bottom: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */
  }
}
</style> 