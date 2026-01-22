<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">客户池管理</h1>
      <p class="page-description">管理和跟进潜在客户，提高转化率</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-content">
            <div class="stat-icon">
              <UnifiedIcon name="default" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalCustomers }}</div>
              <div class="stat-label">总客户数</div>
            </div>
          </div>
          <div class="stat-trend">
            <span class="trend-text">较上月</span>
            <span class="trend-value positive">+12%</span>
          </div>
        </div>

        <div class="stat-card new">
          <div class="stat-content">
            <div class="stat-icon">
              <UnifiedIcon name="Plus" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.newCustomersThisMonth }}</div>
              <div class="stat-label">本月新增</div>
            </div>
          </div>
          <div class="stat-trend">
            <span class="trend-text">较上月</span>
            <span class="trend-value positive">+8%</span>
          </div>
        </div>

        <div class="stat-card unassigned">
          <div class="stat-content">
            <div class="stat-icon">
              <UnifiedIcon name="default" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.unassignedCustomers }}</div>
              <div class="stat-label">未分配</div>
            </div>
          </div>
          <div class="stat-trend">
            <span class="trend-text">需要关注</span>
            <span class="trend-value warning">待分配</span>
          </div>
        </div>

        <div class="stat-card converted">
          <div class="stat-content">
            <div class="stat-icon">
              <UnifiedIcon name="Check" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.convertedCustomersThisMonth }}</div>
              <div class="stat-label">本月转化</div>
            </div>
          </div>
          <div class="stat-trend">
            <span class="trend-text">转化率</span>
            <span class="trend-value positive">15.2%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索和操作区域 -->
    <div class="search-section">
      <el-card class="search-card">
        <div class="search-header">
          <div class="search-title">
            <UnifiedIcon name="Search" />
            <span>筛选条件</span>
          </div>
        </div>

        <div class="search-form">
          <div class="search-row">
            <div class="search-item">
              <label class="search-label">关键词</label>
              <el-input
                v-model="searchForm.keyword"
                placeholder="搜索客户姓名、电话"
                clearable
                @keyup.enter="handleSearch"
                class="search-input"
              >
                <template #prefix>
                  <UnifiedIcon name="Search" />
                </template>
              </el-input>
            </div>

            <div class="search-item">
              <label class="search-label">来源</label>
              <el-select v-model="searchForm.source" placeholder="全部来源" clearable class="search-select">
                <el-option label="全部来源" value="" />
                <el-option label="网站咨询" value="website" />
                <el-option label="电话咨询" value="phone" />
                <el-option label="微信咨询" value="wechat" />
                <el-option label="朋友推荐" value="referral" />
                <el-option label="其他" value="other" />
              </el-select>
            </div>

            <div class="search-item">
              <label class="search-label">状态</label>
              <el-select v-model="searchForm.status" placeholder="全部状态" clearable class="search-select">
                <el-option label="全部状态" value="" />
                <el-option label="新客户" value="new" />
                <el-option label="已联系" value="contacted" />
                <el-option label="有意向" value="interested" />
                <el-option label="已转化" value="converted" />
                <el-option label="无意向" value="not_interested" />
              </el-select>
            </div>

            <div class="search-item">
              <label class="search-label">负责老师</label>
              <el-select v-model="searchForm.teacher" placeholder="全部老师" clearable class="search-select">
                <el-option label="全部老师" value="" />
                <el-option label="未分配" value="unassigned" />
                <el-option label="张老师" value="1" />
                <el-option label="李老师" value="2" />
                <el-option label="王老师" value="3" />
              </el-select>
            </div>

            <div class="search-actions">
              <el-button type="primary" @click="handleSearch" class="search-btn">
                <UnifiedIcon name="Search" />
                搜索
              </el-button>
              <el-button @click="handleReset" class="reset-btn">
                <UnifiedIcon name="Refresh" />
                重置
              </el-button>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 操作按钮区域 -->
      <el-card class="action-card">
        <div class="action-header">
          <div class="action-title">
            <UnifiedIcon name="default" />
            <span>批量操作</span>
          </div>
          <div class="selected-info" v-if="selectedCustomers.length > 0">
            已选择 {{ selectedCustomers.length }} 个客户
          </div>
        </div>

        <div class="action-buttons">
          <el-button type="success" @click="handleImport" class="action-btn">
            <UnifiedIcon name="Upload" />
            导入客户
          </el-button>
          <el-button type="warning" @click="handleExport" class="action-btn">
            <UnifiedIcon name="Download" />
            导出数据
          </el-button>
          <el-button
            type="primary"
            :disabled="selectedCustomers.length === 0"
            @click="handleBatchAssign"
            class="action-btn"
          >
            <UnifiedIcon name="default" />
            批量分配 ({{ selectedCustomers.length }})
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <div class="table-header">
        <div class="table-title">
          <UnifiedIcon name="default" />
          <span>客户列表</span>
          <el-tag type="info" class="total-count">共 {{ pagination.total }} 条</el-tag>
        </div>
        <div class="table-actions">
          <el-button-group class="view-mode-toggle">
            <el-button size="small" type="primary">
              <UnifiedIcon name="default" />
            </el-button>
            <el-button size="small">
              <UnifiedIcon name="default" />
            </el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 空状态处理 -->
      <EmptyState 
        v-if="!loading && tableData.length === 0"
        type="no-data"
        title="暂无客户数据"
        description="还没有客户信息，开始添加第一个客户吧！"
        :primary-action="{
          text: '导入客户',
          handler: handleImport
        }"
        :secondary-action="{
          text: '刷新数据',
          handler: () => { loadCustomerList(); loadStats(); }
        }"
        :suggestions="[
          '点击导入客户按钮批量添加',
          '检查网络连接是否正常',
          '联系管理员获取帮助'
        ]"
        :show-suggestions="true"
      />

      <div class="table-wrapper" v-if="!loading || tableData.length > 0">
        <el-table class="responsive-table full-width-table"
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        stripe
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="客户姓名" width="120" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="source" label="来源" width="100">
          <template #default="{ row }">
            <el-tag :type="getSourceTagType(row.source)">
              {{ getSourceLabel(row.source) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="teacher" label="负责老师" width="120">
          <template #default="{ row }">
            <span v-if="row.teacher">{{ row.teacher }}</span>
            <el-tag v-else type="warning" size="small">未分配</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastFollowUp" label="最后跟进" width="150">
          <template #default="{ row }">
            <span v-if="row.lastFollowUp">
              {{ formatDateTime(row.lastFollowUp) }}
            </span>
            <span v-else class="text-muted">暂无跟进</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="150">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <div class="table-actions-buttons">
              <el-button type="primary" size="small" @click="handleViewDetail(row)">
                详情
              </el-button>
              <el-button type="success" size="small" @click="handleAssign(row)">
                分配
              </el-button>
              <el-button type="warning" size="small" @click="handleFollowUp(row)">
                跟进
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
</div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
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

    <!-- 分配对话框 -->
    <el-dialog v-model="assignDialogVisible" :title="isAssignBatch ? '批量分配' : '分配客户'" width="500px">
      <el-form :model="assignForm" label-width="80px">
        <el-form-item label="负责老师">
          <el-select v-model="assignForm.teacherId" placeholder="请选择老师">
            <el-option label="张老师" value="1" />
            <el-option label="李老师" value="2" />
            <el-option label="王老师" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="assignForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入分配备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAssign">确定</el-button>
      </template>
    </el-dialog>

    <!-- 跟进记录对话框 -->
    <el-dialog v-model="followUpDialogVisible" title="添加跟进记录" width="600px">
      <el-form :model="followUpForm" label-width="80px">
        <el-form-item label="跟进类型">
          <el-select v-model="followUpForm.type" placeholder="请选择跟进类型">
            <el-option label="电话跟进" value="phone" />
            <el-option label="微信跟进" value="wechat" />
            <el-option label="上门拜访" value="visit" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="跟进内容">
          <el-input
            v-model="followUpForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入跟进内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="followUpDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmFollowUp">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User, Plus, Warning, Check, Search, Refresh, Upload, Download,
  Operation, UserFilled, List, Grid
} from '@element-plus/icons-vue'
import { request } from '../../utils/request'
import { formatDateTime } from '../../utils/dateFormat'
import EmptyState from '@/components/common/EmptyState.vue'
import { PRINCIPAL_ENDPOINTS } from '@/api/endpoints'
import type { ApiResponse } from '@/api/endpoints'

// 定义统一API响应类型
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

// 客户池统计接口
interface CustomerPoolStats {
  totalCustomers: number
  newCustomersThisMonth: number
  unassignedCustomers: number
  convertedCustomersThisMonth: number
}

// 客户信息接口
interface CustomerItem {
  id: number;
  name: string;
  phone: string;
  source: string;
  status: string
  teacher?: string
  teacherId?: number
  lastFollowUp?: string
  createTime: string
  remark?: string
}

// 搜索表单接口
interface SearchForm {
  keyword: string;
  source: string;
  status: string;
  teacher: string
}

// 分页接口
interface Pagination {
  currentPage: number
  pageSize: number;
  total: number
}

// 分配表单接口
interface AssignForm {
  teacherId: string;
  remark: string
}

// 跟进表单接口
interface FollowUpForm {
  type: string;
  content: string
}

const router = useRouter()

// 响应式数据
const loading = ref(false)
const stats = ref<CustomerPoolStats>({
  totalCustomers: 0,
  newCustomersThisMonth: 0,
  unassignedCustomers: 0,
  convertedCustomersThisMonth: 0
})

const tableData = ref<CustomerItem[]>([])
const selectedCustomers = ref<CustomerItem[]>([])

const searchForm = ref<SearchForm>({
  keyword: '',
  source: '',
  status: '',
  teacher: ''
})

const pagination = ref<Pagination>({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 对话框状态
const assignDialogVisible = ref(false)
const followUpDialogVisible = ref(false)
const isAssignBatch = ref(false)
const currentCustomer = ref<CustomerItem | null>(null)

const assignForm = ref<AssignForm>({
  teacherId: '',
  remark: ''
})

const followUpForm = ref<FollowUpForm>({
  type: '',
  content: ''
})

// 获取统计数据
const loadStats = async () => {
  try {
    const response: ApiResponse<CustomerPoolStats> = await request.get(PRINCIPAL_ENDPOINTS.CUSTOMER_POOL_STATS)
    if (response.success && response.data) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  }
}

// 获取客户列表
const loadCustomerList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      ...searchForm.value
    }
    
    const response: ApiResponse<{
      items: CustomerItem[];
  total: number;
  page: number
      pageSize: number
    }> = await request.get(PRINCIPAL_ENDPOINTS.CUSTOMER_POOL_LIST, { params })
    
    if (response.success && response.data) {
      tableData.value = response.data.items || []
      pagination.value.total = response.data.total || 0
    }
  } catch (error) {
    console.error('获取客户列表失败:', error)
    ElMessage.error('获取客户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
  loadCustomerList()
}

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    keyword: '',
  source: '',
  status: '',
  teacher: ''
  }
  pagination.value.currentPage = 1
  loadCustomerList()
}

// 导入客户
const handleImport = () => {
  ElMessage.info('导入功能开发中...')
}

// 导出客户
const handleExport = async () => {
  try {
    ElMessage.info('正在导出客户数据...')
    // 这里可以调用导出API
    // await exportCustomerData(searchForm.value)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 表格选择变化
const handleSelectionChange = (selection: CustomerItem[]) => {
  selectedCustomers.value = selection
}

// 查看详情
const handleViewDetail = (row: CustomerItem) => {
  router.push(`/principal/customer-pool/${row.id}`)
}

// 分配老师
const handleAssign = (row: CustomerItem) => {
  currentCustomer.value = row
  isAssignBatch.value = false
  assignForm.value = {
    teacherId: '',
  remark: ''
  }
  assignDialogVisible.value = true
}

// 批量分配
const handleBatchAssign = () => {
  if (selectedCustomers.value.length === 0) {
    ElMessage.warning('请选择要分配的客户')
    return
  }
  isAssignBatch.value = true
  assignForm.value = {
    teacherId: '',
  remark: ''
  }
  assignDialogVisible.value = true
}

// 确认分配
const handleConfirmAssign = async () => {
  if (!assignForm.value.teacherId) {
    ElMessage.warning('请选择老师')
    return
  }

  try {
    if (isAssignBatch.value) {
      // 批量分配
      const data = {
        customerIds: selectedCustomers.value.map(item => item.id),
        teacherId: parseInt(assignForm.value.teacherId),
  remark: assignForm.value.remark
      }
      await request.post(PRINCIPAL_ENDPOINTS.CUSTOMER_POOL_BATCH_ASSIGN, data)
      ElMessage.success('批量分配成功')
    } else {
      // 单个分配
      const data = {
        customerId: currentCustomer.value!.id,
        teacherId: parseInt(assignForm.value.teacherId),
  remark: assignForm.value.remark
      }
      await request.post(PRINCIPAL_ENDPOINTS.CUSTOMER_POOL_ASSIGN, data)
      ElMessage.success('分配成功')
    }
    
    assignDialogVisible.value = false
    loadCustomerList()
    loadStats()
  } catch (error) {
    ElMessage.error('分配失败')
  }
}

// 跟进客户
const handleFollowUp = (row: CustomerItem) => {
  currentCustomer.value = row
  followUpForm.value = {
    type: '',
  content: ''
  }
  followUpDialogVisible.value = true
}

// 确认跟进
const handleConfirmFollowUp = async () => {
  if (!followUpForm.value.type || !followUpForm.value.content) {
    ElMessage.warning('请填写完整的跟进信息')
    return
  }

  try {
    await request.post(`${PRINCIPAL_ENDPOINTS.CUSTOMER_POOL_FOLLOW_UP}/${currentCustomer.value!.id}`, followUpForm.value)
    ElMessage.success('跟进记录添加成功')
    followUpDialogVisible.value = false
    loadCustomerList()
  } catch (error) {
    ElMessage.error('添加跟进记录失败')
  }
}

// 删除客户
const handleDelete = async (row: CustomerItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除客户"${row.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
  type: 'warning'
      }
    )
    
    await request.delete(`${PRINCIPAL_ENDPOINTS.CUSTOMER_POOL}/${row.id}`)
    ElMessage.success('删除成功')
    loadCustomerList()
    loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  loadCustomerList()
}

const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page
  loadCustomerList()
}

// 获取来源标签类型
const getSourceTagType = (source: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    website: 'primary',
  phone: 'success',
  wechat: 'warning',
  referral: 'info',
  other: 'info'
  }
  return typeMap[source] || 'info'
}

// 获取来源标签文本
const getSourceLabel = (source: string) => {
  const labelMap: Record<string, string> = {
    website: '网站咨询',
  phone: '电话咨询',
  wechat: '微信咨询',
  referral: '朋友推荐',
  other: '其他'
  }
  return labelMap[source] || source
}

// 获取状态标签类型
const getStatusTagType = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    new: 'info',
  contacted: 'primary',
  interested: 'warning',
  converted: 'success',
    not_interested: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态标签文本
const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    new: '新客户',
  contacted: '已联系',
  interested: '有意向',
  converted: '已转化',
    not_interested: '无意向'
  }
  return labelMap[status] || status
}

// 页面初始化
onMounted(() => {
  loadStats()
  loadCustomerList()
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

/* 新增的全局样式类 */
.full-width-table {
  width: 100%;
}

/* 使用全局CSS变量，确保主题切换兼容性，优化间距减少留白 */

.page-header {
  margin-bottom: var(--app-gap);
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--app-gap-sm) 0;
}

.page-description {
  color: var(--text-secondary);
  margin: 0;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--app-gap-lg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--app-gap);
  max-width: 100%; max-width: 1200px;
  margin: 0 auto;
}

.stat-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border: var(--border-width-base) solid var(--border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: var(--spacing-xs);
    background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-var(--spacing-xs));
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-light);

    &::before {
      opacity: 1;
    }
  }

  &.total {
    .stat-icon {
      background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
    }
  }

  &.new {
    .stat-icon {
      background: var(--gradient-pink);
    }
  }

  &.unassigned {
    .stat-icon {
      background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
    }
  }

  &.converted {
    .stat-icon {
      background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    }
  }
}

.stat-content {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.stat-icon {
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-md);
  font-size: var(--text-3xl);
  color: white;
  box-shadow: var(--shadow-sm);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: var(--spacing-3xl);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.stat-trend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: var(--z-index-dropdown) solid var(--border-light);
}

.trend-text {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.trend-value {
  font-size: var(--text-sm);
  font-weight: 600;

  &.positive {
    color: var(--success-color);
  }

  &.negative {
    color: var(--danger-color);
  }

  &.warning {
    color: var(--warning-color);
  }
}

.search-section {
  margin-bottom: var(--app-gap-lg);
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--app-gap);
}

.search-card {
  background: var(--bg-card) !important;
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--radius-lg);

  :deep(.el-card__body) {
    background: transparent;
    padding: var(--spacing-lg);
  }
}

.search-header {
  margin-bottom: var(--spacing-md);
}

.search-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.search-form {
  .search-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-md);
    align-items: end;
  }

  .search-item {
    flex: 1;
    min-max-width: 200px; width: 100%;

    .search-label {
      display: block;
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin-bottom: var(--spacing-xs);
      font-weight: 500;
    }

    .search-input,
    .search-select {
      width: 100%;
    }
  }

  .search-actions {
    display: flex;
    gap: var(--spacing-sm);

    .search-btn,
    .reset-btn {
      min-width: auto;
    }
  }
}

.action-card {
  background: var(--bg-card) !important;
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--radius-lg);

  :deep(.el-card__body) {
    background: transparent;
    padding: var(--spacing-lg);
  }
}

.action-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.action-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);

  .action-btn {
    width: 100%;
    justify-content: flex-start;
  }
}

.table-card {
  background: var(--bg-card) !important;
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);

  :deep(.el-card__body) {
    background: transparent;
    padding: var(--spacing-lg);
  }

  :deep(.el-table) {
    background: transparent;
    border-radius: var(--radius-md);
    overflow: hidden;

    .el-table__header-wrapper {
      background: var(--bg-tertiary);
    }

    .el-table__body-wrapper {
      background: transparent;
    }

    tr {
      background: transparent !important;
      transition: background-color 0.2s ease;

      &:hover {
        background: var(--bg-hover) !important;
      }
    }

    th {
      background: var(--bg-tertiary) !important;
      color: var(--text-primary);
      border-bottom: var(--transform-drop) solid var(--border-color);
      font-weight: 600;
      padding: var(--spacing-md);
    }

    td {
      background: transparent !important;
      color: var(--text-primary);
      border-bottom: var(--z-index-dropdown) solid var(--border-light);
      padding: var(--spacing-md);
    }
  }
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: var(--z-index-dropdown) solid var(--border-light);
}

.table-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);

  .total-count {
    margin-left: var(--spacing-sm);
    font-size: var(--text-xs);
    font-weight: 500;
  }
}

.table-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.view-mode-toggle {
  .el-button {
    padding: var(--spacing-lg) var(--text-sm);
  }
}

.table-actions-buttons {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
  align-items: center;
  
  .el-button {
    margin: 0;
    min-width: 4var(--spacing-sm);
    
    &.el-button--small {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: var(--text-xs);
    }
  }
}

.selected-info {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
}

.pagination-wrapper {
  margin-top: var(--app-gap-sm);
  display: flex;
  justify-content: center;
  
  :deep(.el-pagination) {
    .el-pager li {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border: var(--border-width-base) solid var(--border-color);
      
      &:hover {
        background: var(--bg-hover);
      }
      
      &.is-active {
        background: var(--primary-color);
        color: white;
      }
    }
    
    .btn-prev,
    .btn-next {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border: var(--border-width-base) solid var(--border-color);
      
      &:hover {
        background: var(--bg-hover);
      }
    }
    
    .el-select .el-input__wrapper {
      background: var(--bg-tertiary);
      border-color: var(--border-color);
    }
  }
}

.text-muted {
  color: var(--text-muted);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-xl)) {
  .search-section {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .action-buttons {
    flex-direction: row;
    flex-wrap: wrap;

    .action-btn {
      width: auto;
      flex: 1;
      min-max-width: 120px; width: 100%;
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--spacing-md);
  }

  .search-form {
    .search-row {
      flex-direction: column;
      align-items: stretch;
    }

    .search-item {
      min-width: auto;
    }

    .search-actions {
      justify-content: center;
      margin-top: var(--spacing-md);
    }
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .action-buttons {
    flex-direction: column;

    .action-btn {
      width: 100%;
    }
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: var(--spacing-md);
  }

  .stat-icon {
    width: var(--icon-size); height: var(--icon-size);
    font-size: var(--text-2xl);
  }

  .stat-value {
    font-size: var(--text-3xl);
  }
}

/* 对话框样式优化 */
:deep(.el-dialog) {
  background: var(--bg-card);
  border: var(--border-width-base) solid var(--border-color);
  
  .el-dialog__header {
    background: var(--bg-tertiary);
    border-bottom: var(--z-index-dropdown) solid var(--border-color);
    
    .el-dialog__title {
      color: var(--text-primary);
    }
  }
  
  .el-dialog__body {
    background: var(--bg-card);
    color: var(--text-primary);
  }
  
  .el-dialog__footer {
    background: var(--bg-tertiary);
    border-top: var(--z-index-dropdown) solid var(--border-color);
  }
}

/* 表单控件样式优化 */
:deep(.el-input) {
  .el-input__wrapper {
    background: var(--bg-tertiary);
    border-color: var(--border-color);
    
    &:hover {
      border-color: var(--border-light);
    }
    
    &.is-focus {
      border-color: var(--primary-color);
    }
  }
  
  .el-input__inner {
    background: transparent;
    color: var(--text-primary);
    
    &::placeholder {
      color: var(--text-muted);
    }
  }
}

:deep(.el-select) {
  .el-input__wrapper {
    background: var(--bg-tertiary);
    border-color: var(--border-color);
  }
}

:deep(.el-button) {
  &.el-button--default {
    background: var(--bg-tertiary);
    border-color: var(--border-color);
    color: var(--text-primary);
    
    &:hover {
      background: var(--bg-hover);
      border-color: var(--border-light);
    }
  }
}
</style>
