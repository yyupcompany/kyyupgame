<template>
  <div class="page-container">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">招生计划管理</h2>
        <div class="card-actions">
          <el-button type="primary" @click="handleCreate" data-test="create-plan-button">
            <UnifiedIcon name="Plus" />
            新建计划
          </el-button>
        </div>
      </div>
    
      <div class="card-body">
        <div class="card filter-card">
          <div class="card-body">
            <el-form :model="searchForm" class="filter-form">
              <div class="filter-group">
                <el-form-item>
                  <el-input
                    v-model="searchForm.keyword"
                    placeholder="请输入计划名称"
                    clearable
                    @keyup.enter="handleSearch"
                    data-test="search-input"
                  >
                    <template #prefix>
                      <UnifiedIcon name="Search" />
                    </template>
                  </el-input>
                </el-form-item>
                
                <el-form-item>
                  <el-select v-model="searchForm.status" placeholder="状态" clearable data-test="status-filter">
                    <el-option label="草稿" value="draft" />
                    <el-option label="招生中" value="active" />
                    <el-option label="已完成" value="completed" />
                    <el-option label="已取消" value="cancelled" />
                  </el-select>
                </el-form-item>
                
                <el-form-item>
                  <el-date-picker
                    v-model="searchForm.timeRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
              </div>
              
              <div class="filter-actions">
                <el-button type="primary" @click="handleSearch" :loading="loading">
                  <UnifiedIcon name="Search" />
                  搜索
                </el-button>
                <el-button @click="resetSearchForm">
                  <UnifiedIcon name="Refresh" />
                  重置
                </el-button>
                <el-button type="danger" :disabled="!selectedRows.length" @click="handleBatchDelete">
                  <UnifiedIcon name="Delete" />
                  批量删除
                </el-button>
                <el-button @click="handleExport">
                  <UnifiedIcon name="Download" />
                  导出
                </el-button>
              </div>
            </el-form>
          </div>
        </div>
        
        <!-- 数据表格 - 添加性能优化 -->
        <div class="table-container">
          <div class="table-wrapper">
<el-table class="responsive-table full-width-table"
            v-loading="loading"
            :data="tableData"
            stripe
            border
            @selection-change="handleSelectionChange"
            :lazy="true"
            :show-overflow-tooltip="true"
            :cell-style="tableCellStyle"
            :row-key="(row) => row.id"
            :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="title" label="计划名称" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">
                <el-link type="primary" @click="handleViewDetail(row)">{{ row.title }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="id" label="计划编号" width="120" />
            <el-table-column prop="year" label="年份" width="100" />
            <el-table-column prop="term" label="学期" width="100" />
            <el-table-column label="招生时间" width="240">
              <template #default="{ row }">
                {{ formatDate(row.startDate) }} 至 {{ formatDate(row.endDate) }}
              </template>
            </el-table-column>
            <el-table-column label="年龄段" width="120">
              <template #default="{ row }">
                {{ row.ageRange || '不限' }}
              </template>
            </el-table-column>
            <el-table-column prop="targetCount" label="计划招生" width="100" align="center" />
            <el-table-column prop="currentCount" label="已招生" width="100" align="center" />
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="300" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleViewDetail(row)">
                  查看
                </el-button>
                <el-button type="primary" link @click="handleEdit(row)">
                  编辑
                </el-button>
                <el-button type="primary" link @click="handleManageQuota(row)">
                  名额
                </el-button>
                <el-dropdown v-if="row.status === 'DRAFT'" @command="(command) => managePlanStatus(row.id, command)">
                  <el-button type="success" size="small">
                    启动计划<UnifiedIcon name="default" />
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="ACTIVE">开始招生</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-dropdown v-else-if="row.status === 'ACTIVE'" @command="(command) => managePlanStatus(row.id, command)">
                  <el-button type="warning" size="small">
                    管理状态<UnifiedIcon name="default" />
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="PAUSED">暂停招生</el-dropdown-item>
                      <el-dropdown-item command="COMPLETED">完成招生</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-button type="danger" link @click="handleDelete(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
</div>
        </div>
        
        <!-- 分页器 -->
        <div class="pagination-container">
          <el-pagination
                    v-model:current-page="pagination.currentPage"
                    v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
// 优化图标导入 - 使用动态导入减少初始包大小
import { 
  Plus,
  Search, 
  Refresh, 
  Delete, 
  Download,
  ArrowDown
} from '@element-plus/icons-vue'
import { get, post, put, del } from '@/utils/request'
import { ENROLLMENT_PLAN_ENDPOINTS } from '@/api/endpoints'
import { ErrorHandler } from '@/utils/errorHandler'
import { formatDateTime } from '@/utils/dateFormat'

// 类型定义
interface EnrollmentPlan {
  id: number
  title: string
  year: string
  term: string
  startDate: string
  endDate: string
  ageRange?: string
  targetCount: number
  currentCount: number
  status: string
}

interface SearchForm {
  keyword: string
  status: string
  timeRange: string[]
}

interface Pagination {
  currentPage: number
  pageSize: number
  total: number
}

// 响应式数据
const router = useRouter()
const loading = ref(false)
const tableData = ref<EnrollmentPlan[]>([])
const selectedRows = ref<EnrollmentPlan[]>([])

// 搜索表单
const searchForm = ref<SearchForm>({
  keyword: '',
  status: '',
  timeRange: []
})

// 分页信息
const pagination = ref<Pagination>({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表格样式
const tableCellStyle = { padding: 'var(--spacing-sm)' }

// API方法
const loadEnrollmentPlanList = async () => {
  try {
    loading.value = true

    const params = {
      page: pagination.value.currentPage,
      limit: pagination.value.pageSize,
      keyword: searchForm.value.keyword || undefined,
      status: searchForm.value.status || undefined,
      startDateFrom: searchForm.value.timeRange[0] || undefined,
      startDateTo: searchForm.value.timeRange[1] || undefined
    }

    const response = await get(ENROLLMENT_PLAN_ENDPOINTS.LIST, params)

    if (response.success && response.data) {
      const planData = response.data
      tableData.value = planData.items || planData.list || planData.data || []
      pagination.value.total = planData.total || 0
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '获取招生计划列表失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
    tableData.value = []
    pagination.value.total = 0
  } finally {
    loading.value = false
  }
}

const deletePlan = async (id: number) => {
  try {
    const response = await del(ENROLLMENT_PLAN_ENDPOINTS.DELETE(id))
    
    if (response.success) {
      ElMessage.success('删除成功')
      await loadEnrollmentPlanList()
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '删除失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
  }
}

// 状态管理函数
const managePlanStatus = async (planId: number, status: string) => {
  try {
    const response = await put(ENROLLMENT_PLAN_ENDPOINTS.UPDATE_STATUS(planId), { status })
    
    if (response.success) {
      ElMessage.success('状态更新成功')
      await loadEnrollmentPlanList()
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '状态更新失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
  }
}

// 工具方法
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return formatDateTime(new Date(dateStr)).split(' ')[0] // 只取日期部分
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, "info" | "success" | "warning" | "primary" | "danger"> = {
    draft: 'info',
  active: 'success',
  completed: 'warning',
  cancelled: 'danger',
  paused: 'info'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
  active: '招生中',
  completed: '已完成',
  cancelled: '已取消',
  paused: '已暂停'
  }
  return statusMap[status] || '未知'
}

// 事件处理方法 - 添加搜索防抖
let searchTimer: NodeJS.Timeout | null = null
const handleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  
  searchTimer = setTimeout(() => {
    pagination.value.currentPage = 1
    loadEnrollmentPlanList()
  }, 300) // 300ms防抖
}

const resetSearchForm = () => {
  searchForm.value.keyword = ''
  searchForm.value.status = ''
  searchForm.value.timeRange = []
  pagination.value.currentPage = 1
  loadEnrollmentPlanList()
}

const handleCreate = () => {
  router.push('/enrollment-plan/create')
}

const handleViewDetail = (row: EnrollmentPlan) => {
  router.push(`/enrollment-plan/detail/${row.id}`)
}

const handleEdit = (row: EnrollmentPlan) => {
  router.push(`/enrollment-plan/edit/${row.id}`)
}

const handleManageQuota = (row: EnrollmentPlan) => {
  router.push(`/enrollment-plan/quota/${row.id}`)
}

const handleDelete = async (row: EnrollmentPlan) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除招生计划"${row.title}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
  type: 'warning'
      }
    )
    
    await deletePlan(row.id)
  } catch (error) {
    // 用户取消删除
  }
}

const handleBatchDelete = async () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请选择要删除的招生计划')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个招生计划吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
  type: 'warning'
      }
    )
    
    // 批量删除
    for (const plan of selectedRows.value) {
      await deletePlan(plan.id)
    }
    
    selectedRows.value = []
  } catch (error) {
    // 用户取消删除
  }
}

const handleExport = () => {
  // 导出功能
  ElMessage.info('导出功能开发中...')
}

const handleSelectionChange = (selection: EnrollmentPlan[]) => {
  selectedRows.value = selection
}

const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  loadEnrollmentPlanList()
}

const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page
  loadEnrollmentPlanList()
}

// 组件挂载时优化加载数据 - 使用nextTick延迟执行，避免阻塞初始渲染
onMounted(() => {
  nextTick(() => {
    // 延迟加载数据，优先保证页面结构渲染完成
    setTimeout(() => {
      loadEnrollmentPlanList()
    }, 100)
  })
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

// 页面特定样式
.full-width-table {
  width: 100%;
}

.table-container {
  margin-bottom: var(--spacing-lg);
  contain: layout style;
  transform: translate3d(0, 0, 0);
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--spacing-lg);
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .pagination-container {
    justify-content: center;
    
    :deep(.el-pagination) {
      .el-pagination__sizes,
      .el-pagination__jump {
        display: none;
      }
    }
  }
  
  .table-container {
    :deep(.el-table) {
      .el-table__cell {
        padding: var(--spacing-sm) var(--spacing-xs);
        font-size: var(--text-sm);
      }
    }
  }
}
</style> 