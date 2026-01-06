<template>
  <div class="teacher-customers-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">我的客户</h1>
        <p class="page-subtitle">管理分配给我的客户资源</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon total">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalCustomers }}</div>
          <div class="stat-label">我的客户总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon pending">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.pendingFollow }}</div>
          <div class="stat-label">待跟进客户</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon converted">
          <el-icon><Check /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.convertedCustomers }}</div>
          <div class="stat-label">成功转化</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon rate">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.conversionRate }}%</div>
          <div class="stat-label">转化率</div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <div class="filter-form">
        <el-form :model="searchForm" layout="inline">
          <el-form-item label="客户姓名">
            <el-input
              v-model="searchForm.customerName"
              placeholder="请输入客户姓名"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input
              v-model="searchForm.phone"
              placeholder="请输入联系电话"
              clearable
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item label="跟进状态">
            <el-select v-model="searchForm.followStatus" placeholder="请选择跟进状态" clearable style="width: 120px">
              <el-option label="全部" value="" />
              <el-option label="待跟进" value="待跟进" />
              <el-option label="跟进中" value="跟进中" />
              <el-option label="已转化" value="已转化" />
              <el-option label="已放弃" value="已放弃" />
            </el-select>
          </el-form-item>
          <el-form-item label="客户优先级">
            <el-select v-model="searchForm.priority" placeholder="请选择优先级" clearable style="width: 120px">
              <el-option label="全部" value="" />
              <el-option label="高优先级" value="1" />
              <el-option label="中优先级" value="2" />
              <el-option label="低优先级" value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="来源渠道">
            <el-select v-model="searchForm.source" placeholder="请选择来源" clearable style="width: 120px">
              <el-option label="全部" value="" />
              <el-option label="线上推广" value="ONLINE" />
              <el-option label="朋友推荐" value="REFERRAL" />
              <el-option label="走访咨询" value="VISIT" />
              <el-option label="电话咨询" value="PHONE" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :loading="loading">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><RefreshLeft /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 客户列表 -->
    <div class="table-section">
      <el-table
        :data="customerList"
        v-loading="loading"
        border
        stripe
        height="calc(100vh - 480px)"
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="customerName" label="客户姓名" width="100" />
        <el-table-column prop="phone" label="联系电话" width="120" />
        <el-table-column prop="gender" label="性别" width="60" align="center">
          <template #default="scope">
            <span>{{ scope.row.gender === 'MALE' ? '男' : '女' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="childName" label="孩子姓名" width="100" />
        <el-table-column prop="childAge" label="孩子年龄" width="80" align="center" />
        <el-table-column prop="source" label="来源渠道" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getSourceTagType(scope.row.source)" size="small">
              {{ getSourceText(scope.row.source) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="followStatus" label="跟进状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getFollowStatusTagType(scope.row.followStatus)" size="small">
              {{ scope.row.followStatus || '待跟进' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="80" align="center">
          <template #default="scope">
            <el-tag :type="getPriorityTagType(scope.row.priority)" size="small">
              {{ getPriorityText(scope.row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isPublic" label="可见性" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.isPublic ? 'success' : 'info'" size="small">
              {{ scope.row.isPublic ? '公开' : '私有' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastFollowupAt" label="最后跟进" width="100" align="center" />
        <el-table-column prop="assignDate" label="分配时间" width="100" align="center" />
        <el-table-column prop="remarks" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleFollow(scope.row)">
              跟进
            </el-button>
            <el-button type="success" size="small" @click="handleConvert(scope.row)">
              转化
            </el-button>
            <el-button type="info" size="small" @click="handleViewDetail(scope.row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 跟进记录对话框 -->
    <el-dialog
      v-model="followDialogVisible"
      title="客户跟进"
      width="50%"
      :before-close="handleFollowDialogClose"
    >
      <el-form :model="followForm" label-width="100px">
        <el-form-item label="客户姓名">
          <el-input v-model="followForm.customerName" disabled />
        </el-form-item>
        <el-form-item label="跟进方式" required>
          <el-select v-model="followForm.followType" placeholder="请选择跟进方式">
            <el-option label="电话跟进" value="PHONE" />
            <el-option label="微信沟通" value="WECHAT" />
            <el-option label="实地拜访" value="VISIT" />
            <el-option label="其他方式" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="跟进内容" required>
          <el-input
            v-model="followForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入跟进内容..."
          />
        </el-form-item>
        <el-form-item label="下次跟进">
          <el-date-picker
            v-model="followForm.nextFollowDate"
            type="date"
            placeholder="选择下次跟进时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="跟进状态">
          <el-select v-model="followForm.followStatus" placeholder="请选择跟进状态" style="width: 100%">
            <el-option label="待跟进" value="待跟进" />
            <el-option label="跟进中" value="跟进中" />
            <el-option label="已转化" value="已转化" />
            <el-option label="已放弃" value="已放弃" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户优先级">
          <el-select v-model="followForm.priority" placeholder="请选择优先级" style="width: 100%">
            <el-option label="高优先级" :value="1" />
            <el-option label="中优先级" :value="2" />
            <el-option label="低优先级" :value="3" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="followDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveFollow" :loading="saving">
            保存跟进记录
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 客户详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="客户详情"
      width="60%"
      :before-close="handleDetailDialogClose"
    >
      <div v-if="currentCustomer" class="customer-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="客户姓名">{{ currentCustomer.customerName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentCustomer.phone }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ currentCustomer.gender === 'MALE' ? '男' : '女' }}</el-descriptions-item>
          <el-descriptions-item label="孩子姓名">{{ currentCustomer.childName }}</el-descriptions-item>
          <el-descriptions-item label="孩子年龄">{{ currentCustomer.childAge }}岁</el-descriptions-item>
          <el-descriptions-item label="来源渠道">{{ getSourceText(currentCustomer.source) }}</el-descriptions-item>
          <el-descriptions-item label="跟进状态">{{ currentCustomer.followStatus || '待跟进' }}</el-descriptions-item>
          <el-descriptions-item label="客户优先级">{{ getPriorityText(currentCustomer.priority) }}</el-descriptions-item>
          <el-descriptions-item label="可见性">{{ currentCustomer.isPublic ? '公开客户' : '私有客户' }}</el-descriptions-item>
          <el-descriptions-item label="分配时间">{{ currentCustomer.assignDate }}</el-descriptions-item>
          <el-descriptions-item label="最后跟进">{{ currentCustomer.lastFollowupAt || '暂无' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentCustomer.remarks || '暂无' }}</el-descriptions-item>
        </el-descriptions>
        
        <h3 style="margin-top: var(--text-2xl); margin-bottom: var(--spacing-2xl);">跟进记录</h3>
        <el-timeline>
          <el-timeline-item
            v-for="record in followRecords"
            :key="record.id"
            :timestamp="record.followDate"
            placement="top"
          >
            <el-card>
              <h4>{{ record.followType }} - {{ record.title }}</h4>
              <p>{{ record.content }}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  Clock,
  Check,
  TrendCharts,
  Search,
  RefreshLeft,
  Refresh
} from '@element-plus/icons-vue'
import {
  getTeacherCustomerStats,
  getTeacherCustomerList,
  addCustomerFollowRecord,
  updateCustomerStatus,
  getCustomerFollowRecords,
  type CustomerInfo,
  type CustomerStats,
  type FollowRecord
} from '@/api/modules/teacher'

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const followDialogVisible = ref(false)
const detailDialogVisible = ref(false)

// 统计数据
const stats = reactive<CustomerStats>({
  totalCustomers: 0,
  newCustomers: 0,
  pendingFollow: 0,
  convertedCustomers: 0,
  lostCustomers: 0,
  conversionRate: 0
})

// 搜索表单
const searchForm = reactive({
  customerName: '',
  phone: '',
  followStatus: '',
  priority: '',
  source: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 客户列表
const customerList = ref<CustomerInfo[]>([])

// 跟进表单
const followForm = reactive({
  customerId: 0,
  customerName: '',
  followType: '',
  content: '',
  nextFollowDate: '',
  followStatus: '跟进中',
  priority: 2
})

// 当前客户详情
const currentCustomer = ref<CustomerInfo | null>(null)

// 跟进记录
const followRecords = ref<FollowRecord[]>([])

// 方法
const handleSearch = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      customerName: searchForm.customerName || undefined,
      phone: searchForm.phone || undefined,
      followStatus: searchForm.followStatus || undefined,
      priority: searchForm.priority || undefined,
      source: searchForm.source || undefined
    }
    
    const response = await getTeacherCustomerList(params)
    
    if (response.success && response.data) {
      customerList.value = response.data.list
      pagination.total = response.data.total
    } else {
      ElMessage.error(response.message || '获取客户列表失败')
    }
  } catch (error) {
    console.error('获取客户列表错误:', error)
    ElMessage.error('获取客户列表失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  Object.assign(searchForm, {
    customerName: '',
    phone: '',
    followStatus: '',
    priority: '',
    source: ''
  })
  handleSearch()
}

const handleRefresh = async () => {
  try {
    loading.value = true
    // 重新获取统计数据
    const statsResponse = await getTeacherCustomerStats()
    if (statsResponse.success && statsResponse.data) {
      Object.assign(stats, statsResponse.data)
    }
    
    // 重新获取客户列表
    await handleSearch()
    ElMessage.success('数据已刷新')
  } catch (error) {
    console.error('刷新数据错误:', error)
    ElMessage.error('刷新数据失败')
  }
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  handleSearch()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  handleSearch()
}

const handleFollow = (row: any) => {
  followForm.customerId = row.id
  followForm.customerName = row.customerName
  followForm.followType = ''
  followForm.content = ''
  followForm.nextFollowDate = ''
  followForm.followStatus = row.followStatus || '跟进中'
  followForm.priority = row.priority || 2
  followDialogVisible.value = true
}

const handleConvert = (row: CustomerInfo) => {
  ElMessageBox.confirm(
    `确认将客户"${row.customerName}"标记为已转化吗？`,
    '确认转化',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await updateCustomerStatus(row.id, 'CONVERTED', '客户转化成功')
      if (response.success) {
        row.status = 'CONVERTED'
        ElMessage.success('客户转化成功')
        // 刷新统计数据
        handleRefresh()
      } else {
        ElMessage.error(response.message || '转化失败')
      }
    } catch (error) {
      console.error('转化客户错误:', error)
      ElMessage.error('转化失败')
    }
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const handleViewDetail = async (row: CustomerInfo) => {
  try {
    currentCustomer.value = row
    // 获取跟进记录
    const response = await getCustomerFollowRecords(row.id)
    if (response.success && response.data) {
      followRecords.value = response.data
    }
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取客户详情错误:', error)
    ElMessage.error('获取客户详情失败')
  }
}

const handleSaveFollow = async () => {
  if (!followForm.followType || !followForm.content) {
    ElMessage.warning('请填写完整的跟进信息')
    return
  }
  
  try {
    saving.value = true
    const response = await addCustomerFollowRecord(followForm.customerId, {
      followType: followForm.followType,
      content: followForm.content,
      nextFollowDate: followForm.nextFollowDate || undefined,
      followStatus: followForm.followStatus,
      priority: followForm.priority
    })
    
    if (response.success) {
      followDialogVisible.value = false
      ElMessage.success('跟进记录保存成功')
      // 刷新客户列表
      handleSearch()
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存跟进记录错误:', error)
    ElMessage.error('保存跟进记录失败')
  } finally {
    saving.value = false
  }
}

const handleFollowDialogClose = () => {
  followDialogVisible.value = false
}

const handleDetailDialogClose = () => {
  detailDialogVisible.value = false
  currentCustomer.value = null
}

// 辅助方法
const getSourceText = (source: string) => {
  const sourceMap: Record<string, string> = {
    ONLINE: '线上推广',
    REFERRAL: '朋友推荐', 
    VISIT: '走访咨询',
    PHONE: '电话咨询'
  }
  return sourceMap[source] || source
}

const getSourceTagType = (source: string) => {
  const typeMap: Record<string, string> = {
    ONLINE: 'primary',
    REFERRAL: 'success',
    VISIT: 'warning',
    PHONE: 'info'
  }
  return typeMap[source] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    NEW: '新客户',
    FOLLOWING: '跟进中',
    CONVERTED: '已转化',
    LOST: '已流失'
  }
  return statusMap[status] || status
}

const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    NEW: 'info',
    FOLLOWING: 'warning',
    CONVERTED: 'success',
    LOST: 'danger'
  }
  return typeMap[status] || 'info'
}

// 🎯 新增跟进状态相关方法
const getFollowStatusTagType = (followStatus: string) => {
  const typeMap: Record<string, string> = {
    '待跟进': 'info',
    '跟进中': 'warning',
    '已转化': 'success',
    '已放弃': 'danger'
  }
  return typeMap[followStatus] || 'info'
}

const getPriorityText = (priority: number) => {
  const priorityMap: Record<number, string> = {
    1: '高',
    2: '中',
    3: '低'
  }
  return priorityMap[priority] || '中'
}

const getPriorityTagType = (priority: number) => {
  const typeMap: Record<number, string> = {
    1: 'danger',   // 高优先级用红色
    2: 'warning',  // 中优先级用黄色
    3: 'info'      // 低优先级用灰色
  }
  return typeMap[priority] || 'info'
}

// 生命周期
onMounted(async () => {
  try {
    // 获取统计数据
    const statsResponse = await getTeacherCustomerStats()
    if (statsResponse.success && statsResponse.data) {
      Object.assign(stats, statsResponse.data)
    }
    
    // 获取客户列表
    await handleSearch()
  } catch (error) {
    console.error('初始化数据错误:', error)
    ElMessage.error('数据加载失败')
  }
})
</script>

<style scoped>
.teacher-customers-page {
  padding: var(--text-2xl);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
  padding: 0 var(--spacing-xs);
}

.header-content .page-title {
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.header-content .page-subtitle {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--text-2xl);
  margin-bottom: var(--text-3xl);
}

.stat-card {
  background: white;
  border-radius: var(--text-sm);
  padding: var(--text-3xl);
  box-shadow: 0 var(--border-width-base) 3px var(--shadow-light);
  border: var(--border-width-base) solid var(--border-color);
  display: flex;
  align-items: center;
  gap: var(--text-lg);
}

.stat-icon {
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--text-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-3xl);
}

.stat-icon.total {
  background: #eff6ff;
  color: #2563eb;
}

.stat-icon.pending {
  background: #fef3c7;
  color: #d97706;
}

.stat-icon.converted {
  background: #d1fae5;
  color: #059669;
}

.stat-icon.rate {
  background: #f3e8ff;
  color: var(--ai-dark);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--text-base);
  color: var(--text-secondary);
  font-weight: 500;
}

.filter-section {
  background: white;
  border-radius: var(--text-sm);
  padding: var(--text-2xl);
  box-shadow: 0 var(--border-width-base) 3px var(--shadow-light);
  border: var(--border-width-base) solid var(--border-color);
  margin-bottom: var(--text-2xl);
}

.table-section {
  background: white;
  border-radius: var(--text-sm);
  padding: var(--text-2xl);
  box-shadow: 0 var(--border-width-base) 3px var(--shadow-light);
  border: var(--border-width-base) solid var(--border-color);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: var(--text-2xl);
}

.customer-detail {
  padding: var(--text-2xl) 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}

:deep(.el-table) {
  font-size: var(--text-base);
}

:deep(.el-table th) {
  background-color: #f9fafb;
  color: var(--color-gray-700);
  font-weight: 600;
}

:deep(.el-pagination) {
  --el-pagination-font-size: var(--text-base);
}
</style>