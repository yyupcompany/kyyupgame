<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">页面标题</h1>
      <div class="page-actions">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
        <el-button type="success" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
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

    <!-- 搜索筛选区域 -->
    <el-card class="filter-section" shadow="never">
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="关键词">
          <el-input 
            v-model="searchForm.keyword" 
            placeholder="请输入关键词" 
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option 
              v-for="item in statusOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
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

    <!-- 数据表格区域 -->
    <el-card class="table-section" shadow="never">
      <template #header>
        <div class="table-header">
          <span>数据列表</span>
        </div>
      </template>

      <el-table
        v-loading="loading.table"
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" min-width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleView(scope.row)">
              查看
            </el-button>
            <el-button type="warning" size="small" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination-section">
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
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle" 
      width="600px"
      @close="handleDialogClose"
    >
      <el-form 
        ref="formRef"
        :model="formData" 
        :rules="formRules" 
        label-width="120px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option 
              v-for="item in statusOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="formData.description" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入描述"
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
  </div>
</template>

<script setup lang="ts">
// 1. Vue 相关导入
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

// 2. Element Plus 导入
import { ElMessage, ElMessageBox, ElForm } from 'element-plus'
import { 
  Plus, Download, Search, Refresh, Delete,
  User, Document, Trophy, TrendCharts
} from '@element-plus/icons-vue'

// 3. 统一API端点和工具函数导入
import { request } from '@/utils/request'
import { formatDateTime } from '@/utils/dateFormat'
import type { ApiResponse } from '@/api/endpoints'

// 4. API 端点导入（根据实际需要导入）
// import { SYSTEM_ENDPOINTS, USER_ENDPOINTS } from '@/api/endpoints'
// 标准模板已统一API调用方式

// 5. 页面内部类型定义（必须在文件内部定义，不允许外部导入）

// 统计卡片数据接口
interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  type: 'primary' | 'success' | 'warning' | 'info' | 'danger'
}

// 表格数据接口
interface TableRow {
  id: number | string;
  name: string;
  status: string
  description?: string
  createTime: string | Date
  updateTime: string | Date
  [key: string]: any
}

// 搜索表单接口
interface SearchForm {
  keyword: string;
  status: string
}

// 编辑表单接口
interface FormData {
  id?: number | string;
  name: string;
  status: string;
  description: string
}

// 分页接口
interface Pagination {
  currentPage: number
  pageSize: number;
  total: number
}

// 加载状态接口
interface LoadingState {
  table: boolean;
  submit: boolean;
  stats: boolean
}

// 选项接口
interface Option {
  label: string;
  value: string | number
}

// 6. 组件逻辑
const router = useRouter()

// 图标组件映射
const iconComponents = {
  User,
  Document, 
  Trophy,
  TrendCharts
}

// 响应式数据
const loading = ref<LoadingState>({
  table: false,
  submit: false,
  stats: false
})

const dialogVisible = ref(false)
const dialogTitle = computed(() => formData.value.id ? '编辑数据' : '新增数据')

// 统计卡片数据
const statCards = ref<StatCard[]>([
  {
    label: '总数量',
  value: '0',
  icon: 'User',
  type: 'primary'
  },
  {
    label: '本月新增',
  value: '0',
  icon: 'Document',
  type: 'success'
  },
  {
    label: '待处理',
  value: '0',
  icon: 'Trophy',
  type: 'warning'
  },
  {
    label: '完成率',
  value: '0%',
  icon: 'TrendCharts',
  type: 'info'
  }
])

// 搜索表单
const searchForm = ref<SearchForm>({
  keyword: '',
  status: ''
})

// 状态选项
const statusOptions: Option[] = [
  { label: '启用', value: 'ACTIVE' },
  { label: '禁用', value: 'INACTIVE' },
  { label: '待审核', value: 'PENDING' },
  { label: '已删除', value: 'DELETED' }
]

// 表格数据
const tableData = ref<TableRow[]>([])

// 分页数据
const pagination = ref<Pagination>({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表单数据
const formData = ref<FormData>({
  name: '',
  status: '',
  description: ''
})

// 表单引用
const formRef = ref<InstanceType<typeof ElForm> | null>(null)

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 7. 方法定义

// 加载统计数据
const loadStats = async () => {
  loading.value.stats = true
  try {
    // 这里调用实际的API（使用统一端点）
    // const response: ApiResponse = await request.get(STATISTICS_ENDPOINTS.OVERVIEW)
    // if (response.success) {
    //   // 更新统计数据
    // }
    
    // 模拟数据
    setTimeout(() => {
      statCards.value[0].value = '128'
      statCards.value[1].value = '23'
      statCards.value[2].value = '5'
      statCards.value[3].value = '85%'
      loading.value.stats = false
    }, 500)
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
    loading.value.stats = false
  }
}

// 加载表格数据
const loadTableData = async () => {
  loading.value.table = true
  try {
    // 构建查询参数
    const params = {
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
  keyword: searchForm.value.keyword || undefined,
  status: searchForm.value.status || undefined
    }

    // 这里调用实际的API（使用统一端点）
    // const response: ApiResponse = await request.get(SYSTEM_ENDPOINTS.DATA_LIST, { params })
    // if (response.success) {
    //   tableData.value = response.data.items || []
    //   pagination.value.total = response.data.total || 0
    // }

    // 模拟数据
    setTimeout(() => {
      const mockData: TableRow[] = []
      for (let i = 1; i <= 10; i++) {
        mockData.push({
          id: i,
  name: `数据项 ${i}`,
  status: ['ACTIVE', 'INACTIVE', 'PENDING'][i % 3],
  description: `这是数据项 ${i} 的描述`,
          createTime: new Date(Date.now() - i * 86400000).toISOString(),
          updateTime: new Date().toISOString()
        })
      }
      tableData.value = mockData
      pagination.value.total = 100
      loading.value.table = false
    }, 500)
  } catch (error) {
    console.error('加载表格数据失败:', error)
    ElMessage.error('加载数据失败')
    loading.value.table = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
  loadTableData()
}

// 重置搜索
const handleReset = () => {
  searchForm.value.keyword = ''
  searchForm.value.status = ''
  handleSearch()
}

// 新增
const handleCreate = () => {
  Object.assign(formData.value, {
    id: undefined,
  name: '',
  status: '',
  description: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: TableRow) => {
  Object.assign(formData.value, {
    id: row.id,
  name: row.name,
  status: row.status,
  description: row.description || ''
  })
  dialogVisible.value = true
}

// 查看详情
const handleView = (row: TableRow) => {
  // 跳转到详情页面或显示详情对话框
  router.push(`/detail/${row.id}`)
}

// 删除
const handleDelete = async (row: TableRow) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除"${row.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
  type: 'warning'
      }
    )
    
    // 调用删除API（使用统一端点）
    // const response: ApiResponse = await request.delete(SYSTEM_ENDPOINTS.DELETE_ITEM(row.id))
    // if (response.success) {
    //   ElMessage.success('删除成功')
    //   loadTableData()
    // }
    
    // 模拟删除
    ElMessage.success('删除成功')
    loadTableData()
  } catch (error) {
    // 用户取消删除
  }
}

// 导出数据
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  loadTableData()
}

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page
  loadTableData()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value.submit = true

    // 调用API（使用统一端点）
    // const response: ApiResponse = formData.value.id 
    //   ? await request.put(SYSTEM_ENDPOINTS.UPDATE_ITEM(formData.value.id), formData.value)
    //   : await request.post(SYSTEM_ENDPOINTS.CREATE_ITEM, formData.value)
    // 
    // if (response.success) {
    //   ElMessage.success(formData.value.id ? '更新成功' : '创建成功')
    //   dialogVisible.value = false
    //   loadTableData()
    // }

    // 模拟提交
    setTimeout(() => {
      ElMessage.success(formData.value.id ? '更新成功' : '创建成功')
      dialogVisible.value = false
      loading.value.submit = false
      loadTableData()
    }, 1000)
  } catch (error) {
    console.error('提交失败:', error)
    loading.value.submit = false
  }
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 工具方法
const formatTime = (time: string | Date): string => {
  if (!time) return ''
  return formatDateTime(new Date(time))
}

const getStatusTagType = (status: string): 'success' | 'warning' | 'info' | 'danger' => {
  const statusMap: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    ACTIVE: 'success',
    INACTIVE: 'info', 
    PENDING: 'warning',
    DELETED: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    ACTIVE: '启用',
    INACTIVE: '禁用',
    PENDING: '待审核', 
    DELETED: '已删除'
  }
  return statusMap[status] || '未知'
}

// 8. 生命周期
onMounted(() => {
  loadStats()
  loadTableData()
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';
/* 使用全局CSS变量，确保主题切换兼容性 */
.page-container {
  padding: var(--app-padding);
  background: var(--el-bg-color-page);
  min-height: calc(100vh - var(--header-height, 60px));

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--app-margin);
  
  .page-title {
    margin: 0;
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .page-actions {
    display: flex;
    gap: var(--app-gap-sm);
  }
}

.stats-section {
  margin-bottom: var(--app-margin);
  
  .stat-card {
    border: var(--border-width-base) solid var(--el-border-color-lighter);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--el-box-shadow-light);
    }
    
    &.primary {
      border-left: var(--spacing-xs) solid var(--primary-color);
    }
    
    &.success {
      border-left: var(--spacing-xs) solid var(--success-color);
    }
    
    &.warning {
      border-left: var(--spacing-xs) solid var(--warning-color);
    }
    
    &.info {
      border-left: var(--spacing-xs) solid var(--info-color);
    }
    
    .stat-card-content {
      display: flex;
      align-items: center;
      gap: var(--text-base);
      
      .stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60px;
        height: 60px;
        border-radius: var(--radius-full);
        background: var(--primary-light-bg);
        color: var(--primary-color);
      }
      
      .stat-info {
        flex: 1;
        
        .stat-value {
          font-size: var(--text-3xl);
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1;
        }
        
        .stat-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-top: var(--spacing-xs);
        }
      }
    }
  }
}

.filter-section {
  margin-bottom: var(--app-margin);
  
  .search-form {
    margin: 0;
    
    .el-form-item {
      margin-bottom: 0;
    }
  }
}

.table-section {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .pagination-section {
    display: flex;
    justify-content: flex-end;
    margin-top: var(--app-margin);
    padding-top: var(--app-padding);
    border-top: var(--border-width-base) solid var(--el-border-color-lighter);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--app-gap-sm);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--text-base);
    
    .page-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
  
  .stats-section {
    .el-col {
      margin-bottom: var(--text-lg);
    }
  }
  
  .filter-section {
    .search-form {
      .el-form-item {
        width: 100%;
        margin-right: 0;
      }
    }
  }
}

/* 暗色主题适配 */
:deep(.dark) {
  .stat-card {
    background: var(--bg-card);
    border-color: var(--border-color);
    
    .stat-icon {
      background: var(--primary-light-bg);
    }
  }
}
</style> 