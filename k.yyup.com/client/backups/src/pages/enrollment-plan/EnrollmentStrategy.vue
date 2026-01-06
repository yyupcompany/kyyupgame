<template>
  <div class="enrollment-strategy-container">
    <!-- 页面头部 -->
    <div class="strategy-header">
      <div class="header-content">
        <div class="page-title">
          <h1>招生策略</h1>
          <p>制定和管理幼儿园招生策略与计划</p>
        </div>
        <div class="header-actions">
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            新建策略
          </el-button>
        </div>
      </div>
    </div>

    <!-- 招生概览 -->
    <div class="enrollment-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="card-content">
              <div class="card-icon target">
                <el-icon><Aim /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-value">{{ overview.targetStudents }}</div>
                <div class="card-label">招生目标</div>
                <div class="card-detail">本年度计划</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="card-content">
              <div class="card-icon enrolled">
                <el-icon><UserFilled /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-value">{{ overview.enrolledStudents }}</div>
                <div class="card-label">已招生数</div>
                <div class="card-detail">完成率{{ overview.completionRate }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="card-content">
              <div class="card-icon pending">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-value">{{ overview.pendingApplications }}</div>
                <div class="card-label">待处理申请</div>
                <div class="card-detail">需要跟进</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="card-content">
              <div class="card-icon strategies">
                <el-icon><DataBoard /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-value">{{ overview.activeStrategies }}</div>
                <div class="card-label">活跃策略</div>
                <div class="card-detail">正在执行</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 策略分类 -->
    <div class="strategy-categories">
      <el-card shadow="never">
        <template #header>
          <span>策略分类</span>
        </template>
        
        <div class="categories-grid">
          <div
            v-for="category in strategyCategories"
            :key="category.key"
            class="category-item"
            :class="{ active: selectedCategory === category.key }"
            @click="handleCategorySelect(category.key)"
          >
            <div class="category-icon" :class="category.color">
              <el-icon>
                <component :is="category.icon" />
              </el-icon>
            </div>
            <div class="category-content">
              <h4>{{ category.title }}</h4>
              <p>{{ category.description }}</p>
              <div class="category-stats">
                <span>{{ category.count }}个策略</span>
                <span class="category-status" :class="category.statusClass">
                  {{ category.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <el-card shadow="never">
        <el-form :model="filterForm" inline>
          <el-form-item label="策略类型">
            <el-select v-model="filterForm.category" placeholder="选择类型" clearable>
              <el-option label="全部" value="" />
              <el-option label="线上推广" value="online" />
              <el-option label="线下活动" value="offline" />
              <el-option label="口碑营销" value="referral" />
              <el-option label="合作推广" value="partnership" />
              <el-option label="品牌建设" value="branding" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="执行状态">
            <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
              <el-option label="全部" value="" />
              <el-option label="计划中" value="planning" />
              <el-option label="执行中" value="active" />
              <el-option label="已完成" value="completed" />
              <el-option label="已暂停" value="paused" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="优先级">
            <el-select v-model="filterForm.priority" placeholder="选择优先级" clearable>
              <el-option label="全部" value="" />
              <el-option label="高" value="high" />
              <el-option label="中" value="medium" />
              <el-option label="低" value="low" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="关键词">
            <el-input
              v-model="filterForm.keyword"
              placeholder="搜索策略名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 策略列表 -->
    <div class="strategies-list">
      <el-card shadow="never">
        <template #header>
          <div class="section-header">
            <span>招生策略列表</span>
            <div class="header-tools">
              <el-button @click="handleBatchAction" :disabled="selectedStrategies.length === 0">
                批量操作
              </el-button>
              <el-button @click="handleExport">
                导出策略
              </el-button>
            </div>
          </div>
        </template>
        
        <div v-loading="loading" class="strategies-content">
          <el-table
            :data="strategiesList"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            
            <el-table-column prop="name" label="策略名称" min-width="200">
              <template #default="{ row }">
                <div class="strategy-name">
                  <div class="name">{{ row.name }}</div>
                  <div class="description">{{ row.description }}</div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="category" label="类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getCategoryTagType(row.category)" size="small">
                  {{ getCategoryText(row.category) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="priority" label="优先级" width="100">
              <template #default="{ row }">
                <el-tag :type="getPriorityTagType(row.priority)" size="small">
                  {{ getPriorityText(row.priority) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="targetAudience" label="目标群体" width="150">
              <template #default="{ row }">
                {{ row.targetAudience }}
              </template>
            </el-table-column>
            
            <el-table-column prop="budget" label="预算" width="120" align="right">
              <template #default="{ row }">
                ¥{{ formatMoney(row.budget) }}
              </template>
            </el-table-column>
            
            <el-table-column prop="expectedResults" label="预期效果" width="120">
              <template #default="{ row }">
                {{ row.expectedResults }}人
              </template>
            </el-table-column>
            
            <el-table-column prop="actualResults" label="实际效果" width="120">
              <template #default="{ row }">
                <span :class="getResultsClass(row.actualResults, row.expectedResults)">
                  {{ row.actualResults }}人
                </span>
              </template>
            </el-table-column>
            
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="startDate" label="开始时间" width="120">
              <template #default="{ row }">
                {{ formatDate(row.startDate) }}
              </template>
            </el-table-column>
            
            <el-table-column prop="endDate" label="结束时间" width="120">
              <template #default="{ row }">
                {{ formatDate(row.endDate) }}
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="text"
                  size="small"
                  @click="handleView(row)"
                >
                  查看
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="handleEdit(row)"
                >
                  编辑
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="handleToggleStatus(row)"
                  :disabled="row.status === 'completed'"
                >
                  {{ row.status === 'active' ? '暂停' : '启动' }}
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="handleDelete(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 分页 -->
        <div v-if="strategiesList.length > 0" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 新建策略对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="新建招生策略"
      width="800px"
      @close="handleCreateDialogClose"
    >
      <el-form :model="createForm" :rules="createRules" label-width="120px" ref="createFormRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="策略名称" prop="name">
              <el-input v-model="createForm.name" placeholder="请输入策略名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="策略类型" prop="category">
              <el-select v-model="createForm.category" placeholder="选择策略类型" style="width: 100%">
                <el-option label="线上推广" value="online" />
                <el-option label="线下活动" value="offline" />
                <el-option label="口碑营销" value="referral" />
                <el-option label="合作推广" value="partnership" />
                <el-option label="品牌建设" value="branding" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="createForm.priority" placeholder="选择优先级" style="width: 100%">
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标群体" prop="targetAudience">
              <el-input v-model="createForm.targetAudience" placeholder="请输入目标群体" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="预算金额" prop="budget">
              <el-input-number
                v-model="createForm.budget"
                :min="0"
                :precision="2"
                placeholder="请输入预算金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预期效果" prop="expectedResults">
              <el-input-number
                v-model="createForm.expectedResults"
                :min="0"
                placeholder="预期招生人数"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startDate">
              <el-date-picker
                v-model="createForm.startDate"
                type="date"
                placeholder="选择开始时间"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endDate">
              <el-date-picker
                v-model="createForm.endDate"
                type="date"
                placeholder="选择结束时间"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="策略描述" prop="description">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述招生策略的具体内容和执行方案"
          />
        </el-form-item>
        
        <el-form-item label="执行计划">
          <el-input
            v-model="createForm.executionPlan"
            type="textarea"
            :rows="3"
            placeholder="请输入具体的执行计划和步骤"
          />
        </el-form-item>
        
        <el-form-item label="成功指标">
          <el-input
            v-model="createForm.successMetrics"
            type="textarea"
            :rows="2"
            placeholder="请输入衡量策略成功的具体指标"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="handleCreateStrategy" :loading="creating">
            创建策略
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElForm } from 'element-plus'
import {
  Aim, UserFilled, Clock, DataBoard, Plus, Refresh
} from '@element-plus/icons-vue'
import { formatDateTime } from '@/utils/date'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const creating = ref(false)
const selectedCategory = ref('all')
const showCreateDialog = ref(false)
const selectedStrategies = ref([])
const createFormRef = ref<InstanceType<typeof ElForm>>()

// 招生概览数据
const overview = reactive({
  targetStudents: 150,
  enrolledStudents: 98,
  completionRate: 65.3,
  pendingApplications: 23,
  activeStrategies: 8
})

// 策略分类
const strategyCategories = ref([
  {
    key: 'all',
    title: '全部策略',
    description: '查看所有招生策略',
    icon: 'DataBoard',
    color: 'blue',
    count: 12,
    status: '进行中',
    statusClass: 'active'
  },
  {
    key: 'online',
    title: '线上推广',
    description: '网络营销和数字化推广',
    icon: 'Monitor',
    color: 'green',
    count: 4,
    status: '活跃',
    statusClass: 'active'
  },
  {
    key: 'offline',
    title: '线下活动',
    description: '实地活动和体验营销',
    icon: 'Location',
    color: 'orange',
    count: 3,
    status: '计划中',
    statusClass: 'planning'
  },
  {
    key: 'referral',
    title: '口碑营销',
    description: '推荐奖励和口碑传播',
    icon: 'ChatDotRound',
    color: 'purple',
    count: 2,
    status: '执行中',
    statusClass: 'active'
  },
  {
    key: 'partnership',
    title: '合作推广',
    description: '机构合作和联合营销',
    icon: 'Connection',
    color: 'cyan',
    count: 2,
    status: '洽谈中',
    statusClass: 'planning'
  },
  {
    key: 'branding',
    title: '品牌建设',
    description: '品牌形象和声誉管理',
    icon: 'Trophy',
    color: 'red',
    count: 1,
    status: '长期',
    statusClass: 'active'
  }
])

// 筛选表单
const filterForm = reactive({
  category: '',
  status: '',
  priority: '',
  keyword: ''
})

// 策略列表
const strategiesList = ref([])

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 创建表单
const createForm = reactive({
  name: '',
  category: '',
  priority: '',
  targetAudience: '',
  budget: 0,
  expectedResults: 0,
  startDate: '',
  endDate: '',
  description: '',
  executionPlan: '',
  successMetrics: ''
})

// 表单验证规则
const createRules = {
  name: [
    { required: true, message: '请输入策略名称', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择策略类型', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  targetAudience: [
    { required: true, message: '请输入目标群体', trigger: 'blur' }
  ],
  budget: [
    { required: true, message: '请输入预算金额', trigger: 'blur' }
  ],
  expectedResults: [
    { required: true, message: '请输入预期效果', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入策略描述', trigger: 'blur' }
  ]
}

// 方法
const formatMoney = (amount: number) => {
  return amount.toLocaleString()
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const getCategoryText = (category: string) => {
  const categoryMap = {
    'online': '线上推广',
    'offline': '线下活动',
    'referral': '口碑营销',
    'partnership': '合作推广',
    'branding': '品牌建设'
  }
  return categoryMap[category] || '未知类型'
}

const getCategoryTagType = (category: string) => {
  const categoryMap = {
    'online': 'success',
    'offline': 'warning',
    'referral': 'info',
    'partnership': 'primary',
    'branding': 'danger'
  }
  return categoryMap[category] || 'info'
}

const getPriorityText = (priority: string) => {
  const priorityMap = {
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return priorityMap[priority] || '未知'
}

const getPriorityTagType = (priority: string) => {
  const priorityMap = {
    'high': 'danger',
    'medium': 'warning',
    'low': 'info'
  }
  return priorityMap[priority] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap = {
    'planning': '计划中',
    'active': '执行中',
    'completed': '已完成',
    'paused': '已暂停'
  }
  return statusMap[status] || '未知状态'
}

const getStatusTagType = (status: string) => {
  const statusMap = {
    'planning': 'info',
    'active': 'success',
    'completed': 'primary',
    'paused': 'warning'
  }
  return statusMap[status] || 'info'
}

const getResultsClass = (actual: number, expected: number) => {
  if (actual >= expected) return 'text-success'
  if (actual >= expected * 0.8) return 'text-warning'
  return 'text-danger'
}

const loadStrategies = async () => {
  loading.value = true
  try {
    // 模拟策略数据
    const mockData = [
      {
        id: 1,
        name: '春季招生线上推广',
        description: '通过社交媒体和搜索引擎推广春季招生',
        category: 'online',
        priority: 'high',
        targetAudience: '3-6岁儿童家长',
        budget: 15000,
        expectedResults: 30,
        actualResults: 25,
        status: 'active',
        startDate: '2024-02-01',
        endDate: '2024-04-30'
      },
      {
        id: 2,
        name: '亲子体验活动',
        description: '组织周末亲子体验活动，让家长和孩子体验幼儿园生活',
        category: 'offline',
        priority: 'high',
        targetAudience: '周边社区家庭',
        budget: 8000,
        expectedResults: 20,
        actualResults: 28,
        status: 'completed',
        startDate: '2024-01-15',
        endDate: '2024-03-15'
      },
      {
        id: 3,
        name: '老生推荐奖励计划',
        description: '老生成功推荐新生入学可获得学费减免',
        category: 'referral',
        priority: 'medium',
        targetAudience: '在校学生家长',
        budget: 5000,
        expectedResults: 15,
        actualResults: 12,
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-06-30'
      },
      {
        id: 4,
        name: '社区合作推广',
        description: '与周边社区中心合作举办教育讲座',
        category: 'partnership',
        priority: 'medium',
        targetAudience: '社区居民',
        budget: 3000,
        expectedResults: 10,
        actualResults: 0,
        status: 'planning',
        startDate: '2024-03-01',
        endDate: '2024-05-31'
      }
    ]
    
    strategiesList.value = mockData
    pagination.total = mockData.length
    
  } catch (error) {
    console.error('加载策略列表失败:', error)
    ElMessage.error('加载策略列表失败')
  } finally {
    loading.value = false
  }
}

const handleCategorySelect = (category: string) => {
  selectedCategory.value = category
  filterForm.category = category === 'all' ? '' : category
  handleSearch()
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadStrategies()
}

const handleReset = () => {
  Object.assign(filterForm, {
    category: '',
    status: '',
    priority: '',
    keyword: ''
  })
  selectedCategory.value = 'all'
  handleSearch()
}

const handleRefresh = () => {
  loadStrategies()
}

const handleSelectionChange = (selection: any[]) => {
  selectedStrategies.value = selection
}

const handleBatchAction = () => {
  ElMessage.info('批量操作功能开发中')
}

const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

const handleView = (strategy: any) => {
  ElMessage.info(`查看策略：${strategy.name}`)
}

const handleEdit = (strategy: any) => {
  ElMessage.info(`编辑策略：${strategy.name}`)
}

const handleToggleStatus = async (strategy: any) => {
  const action = strategy.status === 'active' ? '暂停' : '启动'
  try {
    await ElMessageBox.confirm(`确定要${action}策略"${strategy.name}"吗？`, `确认${action}`, {
      type: 'warning'
    })
    
    strategy.status = strategy.status === 'active' ? 'paused' : 'active'
    ElMessage.success(`策略已${action}`)
  } catch {
    // 用户取消
  }
}

const handleDelete = async (strategy: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除策略"${strategy.name}"吗？`, '确认删除', {
      type: 'warning'
    })
    
    ElMessage.success('策略已删除')
    loadStrategies()
  } catch {
    // 用户取消
  }
}

const handleCreateStrategy = async () => {
  if (!createFormRef.value) return
  
  try {
    await createFormRef.value.validate()
    creating.value = true
    
    // 模拟创建策略
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('招生策略创建成功')
    showCreateDialog.value = false
    loadStrategies()
  } catch (error) {
    ElMessage.error('创建失败，请重试')
  } finally {
    creating.value = false
  }
}

const handleCreateDialogClose = () => {
  Object.assign(createForm, {
    name: '',
    category: '',
    priority: '',
    targetAudience: '',
    budget: 0,
    expectedResults: 0,
    startDate: '',
    endDate: '',
    description: '',
    executionPlan: '',
    successMetrics: ''
  })
  createFormRef.value?.clearValidate()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadStrategies()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadStrategies()
}

// 生命周期
onMounted(() => {
  loadStrategies()
})
</script>

<style lang="scss">
.enrollment-strategy-container {
  padding: var(--text-2xl);
  max-width: 1400px;
  margin: 0 auto;
}

.strategy-header {
  margin-bottom: var(--text-3xl);
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
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
    
    .header-actions {
      display: flex;
      gap: var(--text-sm);
    }
  }
}

.enrollment-overview {
  margin-bottom: var(--text-3xl);
  
  .overview-card {
    .card-content {
      display: flex;
      align-items: center;
      gap: var(--text-lg);
      
      .card-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-3xl);
        
        &.target {
          background: #f0f9ff;
          color: var(--primary-color);
        }
        
        &.enrolled {
          background: #f0fdf4;
          color: var(--success-color);
        }
        
        &.pending {
          background: #fefbf2;
          color: var(--warning-color);
        }
        
        &.strategies {
          background: #faf5ff;
          color: #a855f7;
        }
      }
      
      .card-info {
        flex: 1;
        
        .card-value {
          font-size: var(--text-3xl);
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1;
          margin-bottom: var(--spacing-xs);
        }
        
        .card-label {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
        }
        
        .card-detail {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
        }
      }
    }
  }
}

.strategy-categories {
  margin-bottom: var(--text-3xl);
  
  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--text-lg);
    
    .category-item {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      padding: var(--text-lg);
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--spacing-sm);
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover,
      &.active {
        border-color: var(--primary-color);
        box-shadow: 0 2px var(--spacing-sm) var(--accent-enrollment-light);
      }
      
      .category-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-2xl);
        
        &.blue {
          background: #f0f9ff;
          color: var(--primary-color);
        }
        
        &.green {
          background: #f0fdf4;
          color: var(--success-color);
        }
        
        &.orange {
          background: var(--bg-white)7ed;
          color: #f97316;
        }
        
        &.purple {
          background: #faf5ff;
          color: #a855f7;
        }
        
        &.cyan {
          background: #ecfeff;
          color: #06b6d4;
        }
        
        &.red {
          background: #fef2f2;
          color: var(--danger-color);
        }
      }
      
      .category-content {
        flex: 1;
        
        h4 {
          font-size: var(--text-base);
          font-weight: 500;
          color: var(--text-primary);
          margin: 0 0 var(--spacing-xs) 0;
        }
        
        p {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin: 0 0 var(--spacing-sm) 0;
        }
        
        .category-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: var(--text-sm);
          
          .category-status {
            &.active {
              color: var(--success-color);
            }
            
            &.planning {
              color: var(--warning-color);
            }
          }
        }
      }
    }
  }
}

.filter-toolbar {
  margin-bottom: var(--text-3xl);
}

.strategies-list {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-tools {
      display: flex;
      gap: var(--text-sm);
    }
  }
  
  .strategy-name {
    .name {
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .description {
      font-size: var(--text-sm);
      color: var(--text-tertiary);
      margin-top: var(--spacing-sm);
    }
  }
  
  .text-success {
    color: var(--success-color);
  }
  
  .text-warning {
    color: var(--warning-color);
  }
  
  .text-danger {
    color: var(--danger-color);
  }
}

.pagination-wrapper {
  margin-top: var(--text-3xl);
  display: flex;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}

@media (max-width: var(--breakpoint-md)) {
  .enrollment-strategy-container {
    padding: var(--text-lg);
  }
  
  .strategy-header .header-content {
    flex-direction: column;
    gap: var(--text-lg);
    align-items: flex-start;
  }
  
  .enrollment-overview {
    .el-col {
      margin-bottom: var(--text-lg);
    }
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-toolbar {
    .el-form {
      flex-direction: column;
      
      .el-form-item {
        margin-bottom: var(--text-lg);
        margin-right: 0;
      }
    }
  }
  
  .section-header {
    flex-direction: column;
    gap: var(--text-sm);
    align-items: flex-start !important;
    
    .header-tools {
      width: 100%;
      
      .el-button {
        flex: 1;
      }
    }
  }
}
</style>
