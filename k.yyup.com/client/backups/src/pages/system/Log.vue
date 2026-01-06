<template>
  <PageWrapper
    title="系统日志"
    subtitle="查看和管理系统运行日志，监控系统状态"
    :page-loading="loading"
    loading-text="正在加载日志数据..."
    loading-tip="请稍候，正在获取最新日志信息"
    :auto-empty-state="true"
    entity-name="日志记录"
  >
    <!-- 搜索栏 -->
    <div class="card filter-card">
      <div class="card-body">
        <el-form :model="searchForm" label-width="80px" class="filter-form">
          <div class="filter-group">
            <el-form-item label="日志级别">
              <el-select v-model="searchForm.level" placeholder="请选择日志级别" clearable>
                <el-option label="错误" value="error" />
                <el-option label="警告" value="warn" />
                <el-option label="信息" value="info" />
                <el-option label="调试" value="debug" />
              </el-select>
            </el-form-item>
            <el-form-item label="日志分类">
              <el-select v-model="searchForm.category" placeholder="请选择日志分类" clearable>
                <el-option label="认证" value="auth" />
                <el-option label="用户操作" value="user" />
                <el-option label="系统操作" value="system" />
                <el-option label="数据库" value="database" />
                <el-option label="API" value="api" />
              </el-select>
            </el-form-item>
            <el-form-item label="关键词">
              <el-input v-model="searchForm.keyword" placeholder="请输入关键词" clearable />
            </el-form-item>
            <el-form-item label="日期范围">
              <el-date-picker
                v-model="searchForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </div>
          <div class="filter-actions">
            <el-button type="primary" @click="handleSearch" :loading="loading">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetSearch">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
    
    <!-- 日志表格 -->
    <div class="card table-card">
      <div class="card-header">
        <h3 class="card-title">系统日志</h3>
        <div class="card-actions">
          <el-button type="danger" :disabled="selectedLogs.length === 0" @click="batchDeleteLogs">
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
          <el-button type="primary" @click="exportLogs">
            <el-icon><Download /></el-icon>
            导出日志
          </el-button>
          <el-button type="warning" @click="confirmClearLogs">
            <el-icon><DeleteFilled /></el-icon>
            清空日志
          </el-button>
        </div>
      </div>
      
      <div class="card-body">
        <!-- 空状态处理 -->
        <EmptyState
          v-if="!loading && logList.length === 0"
          type="no-data"
          title="暂无系统日志"
          description="系统还没有产生任何日志记录，随着系统运行会自动记录各种操作"
          size="medium"
          :primary-action="{
            text: '刷新数据',
            handler: handleRefresh
          }"
          :secondary-action="{
            text: '重新加载',
            handler: loadData
          }"
          :suggestions="[
            '系统会自动记录错误、警告和操作日志',
            '可以通过搜索条件筛选特定日志',
            '定期清理过期日志保持系统性能'
          ]"
          :show-suggestions="true"
        />
        
        <el-table
          v-else
          :data="logList"
          style="width: 100%"
          border
          stripe
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="日志编号" width="80" />
          <el-table-column prop="level" label="日志级别" width="100">
            <template #default="scope">
              <el-tag :type="getLogLevelTag(scope.row.level)">
                {{ getLogLevelLabel(scope.row.level) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="category" label="分类" width="100">
            <template #default="scope">
              <el-tag type="info">
                {{ getCategoryLabel(scope.row.category) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="message" label="日志消息" min-width="200" show-overflow-tooltip />
          <el-table-column prop="ip_address" label="IP地址" width="120" />
          <el-table-column prop="user_id" label="用户ID" width="80" />
          <el-table-column prop="source" label="来源" width="120" />
          <el-table-column prop="created_at" label="创建时间" width="180">
            <template #default="scope">
              {{ formatDateTime(scope.row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                text
                @click="viewLogDetail(scope.row)"
              >
                <el-icon><View /></el-icon>
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页组件 -->
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
    
    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="日志详情"
      width="60%"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="日志编号">{{ currentLog.id }}</el-descriptions-item>
        <el-descriptions-item label="日志级别">
          <el-tag :type="getLogLevelTag(currentLog.level)">
            {{ getLogLevelLabel(currentLog.level) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="分类">
          <el-tag type="info">
            {{ getCategoryLabel(currentLog.category) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="来源">{{ currentLog.source }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ currentLog.ip_address }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentLog.user_id || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ formatDateTime(currentLog.created_at) }}</el-descriptions-item>
      </el-descriptions>
      
      <div class="detail-section">
        <div class="section-title">日志消息</div>
        <div class="code-container">
          <pre class="code-block">{{ currentLog.message }}</pre>
        </div>
      </div>
      
      <div class="detail-section" v-if="currentLog.details">
        <div class="section-title">详细信息</div>
        <div class="code-container">
          <pre class="code-block">{{ formatJson(currentLog.details) }}</pre>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 清空日志确认对话框 -->
    <el-dialog
      v-model="clearDialogVisible"
      title="清空日志确认"
      width="30%"
      :close-on-click-modal="false"
    >
      <div class="warning-content">
        <el-icon class="warning-icon"><Warning /></el-icon>
        <div class="warning-message">
          <p>您确定要清空所有日志吗？</p>
          <p>该操作将永久删除所有日志记录，且不可恢复。</p>
        </div>
      </div>
      <div class="clear-dialog-form">
        <el-form :model="clearForm" label-width="80px">
          <el-form-item label="日志级别">
            <el-select v-model="clearForm.level" placeholder="请选择要清空的日志级别" style="width: 100%">
              <el-option label="所有级别" value="" />
              <el-option label="错误" value="error" />
              <el-option label="警告" value="warn" />
              <el-option label="信息" value="info" />
              <el-option label="调试" value="debug" />
            </el-select>
          </el-form-item>
          <el-form-item label="清空范围">
            <el-radio-group v-model="clearForm.range">
              <el-radio value="all">全部</el-radio>
              <el-radio value="date">按日期</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="日期范围" v-if="clearForm.range === 'date'">
            <el-date-picker
              v-model="clearForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="clearDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmClear" :loading="clearLoading">确认清空</el-button>
        </div>
      </template>
    </el-dialog>
  </PageWrapper>
</template>

<script setup lang="ts">
// 1. Vue 相关导入
import { ref, onMounted } from 'vue'

// 2. Element Plus 导入
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Warning, 
  Search, 
  Refresh, 
  Delete, 
  Download, 
  DeleteFilled, 
  View 
} from '@element-plus/icons-vue'

// 3. 组件导入
import PageWrapper from '@/components/common/PageWrapper.vue'
import EmptyState from '@/components/common/EmptyState.vue'

// 4. 公共工具函数导入
import { get, post, put, del } from '@/utils/request'
import { SYSTEM_LOG_ENDPOINTS } from '@/api/endpoints'
import { ErrorHandler } from '@/utils/errorHandler'

// 4. 页面内部类型定义
interface SystemLog {
  id: number;
  level: string;
  category: string;
  message: string
  details?: string
  ip_address?: string
  user_id?: number
  source?: string
  created_at: string
}

interface SearchForm {
  level: string;
  category: string;
  keyword: string
  dateRange: string[]
}

interface ClearForm {
  level: string;
  range: 'all' | 'date'
  dateRange: string[]
}

// 响应式数据
const loading = ref(false)
const clearLoading = ref(false)
const detailDialogVisible = ref(false)
const clearDialogVisible = ref(false)
const selectedLogs = ref<SystemLog[]>([])
const logList = ref<SystemLog[]>([])
const currentLog = ref<SystemLog>({} as SystemLog)

// 分页数据
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 缺失的方法定义
const handleRefresh = () => {
  loadSystemLogs()
}

const loadData = () => {
  loadSystemLogs()
}

const searchForm = ref<SearchForm>({
  level: '',
  category: '',
  keyword: '',
  dateRange: []
})

const clearForm = ref<ClearForm>({
  level: '',
  range: 'all',
  dateRange: []
})

// 工具函数
const getLogLevelTag = (level: string): 'success' | 'info' | 'primary' | 'warning' | 'danger' => {
  const levelMap: Record<string, 'success' | 'info' | 'primary' | 'warning' | 'danger'> = {
    'error': 'danger',
    'warn': 'warning',
    'info': 'info',
    'debug': 'primary'
  }
  return levelMap[level] || 'primary'
}

const getLogLevelLabel = (level: string): string => {
  const labelMap: Record<string, string> = {
    'error': '错误',
    'warn': '警告',
    'info': '信息',
    'debug': '调试'
  }
  return labelMap[level] || level
}

const getCategoryLabel = (category: string): string => {
  const labelMap: Record<string, string> = {
    'auth': '认证',
    'user': '用户操作',
    'system': '系统操作',
    'database': '数据库',
    'api': 'API'
  }
  return labelMap[category] || category
}

const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
  })
}

const formatJson = (obj: any): string => {
  if (typeof obj === 'string') {
    try {
      return JSON.stringify(JSON.parse(obj), null, 2)
    } catch {
      return obj
    }
  }
  return JSON.stringify(obj, null, 2)
}

// API 调用函数
const loadSystemLogs = async (): Promise<void> => {
  loading.value = true
  try {
    const [startDate, endDate] = searchForm.value.dateRange
    
    const params = {
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
  level: searchForm.value.level || undefined,
  category: searchForm.value.category || undefined,
  keyword: searchForm.value.keyword || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    }
    
    const res = await get(SYSTEM_LOG_ENDPOINTS.BASE, params)
    
    if (res && res.success) {
      // 安全处理日志数据
      const responseData = res.data || {}
      logList.value = Array.isArray(responseData.items) ? responseData.items :
                     Array.isArray(responseData) ? responseData : []
      pagination.value.total = responseData.total || logList.value.length || 0
    } else {
      ElMessage.error(res?.message || '获取系统日志失败')
      logList.value = []
      pagination.value.total = 0
    }
  } catch (error) {
    ErrorHandler.handle(error, '获取系统日志失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.currentPage = 1
  loadSystemLogs()
}

const resetSearch = () => {
  searchForm.value.level = ''
  searchForm.value.category = ''
  searchForm.value.keyword = ''
  searchForm.value.dateRange = []
  pagination.value.currentPage = 1
  loadSystemLogs()
}

const handleSizeChange = (newSize: number) => {
  pagination.value.pageSize = newSize
  pagination.value.currentPage = 1
  loadSystemLogs()
}

const handleCurrentChange = (newPage: number) => {
  pagination.value.currentPage = newPage
  loadSystemLogs()
}

const handleSelectionChange = (selection: SystemLog[]) => {
  selectedLogs.value = selection
}

const viewLogDetail = (log: SystemLog) => {
  currentLog.value = log
  detailDialogVisible.value = true
}

const batchDeleteLogs = async () => {
  if (selectedLogs.value.length === 0) {
    ElMessage.warning('请选择要删除的日志')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedLogs.value.length} 条日志吗？此操作不可撤销。`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
  type: 'warning'
      }
    )
    
    const ids = selectedLogs.value && Array.isArray(selectedLogs.value) 
      ? selectedLogs.value.map(log => log.id)
      : []
    const res = await del(SYSTEM_LOG_ENDPOINTS.BATCH_DELETE, { ids })
    
    if (res && res.success) {
      ElMessage.success('批量删除成功')
      selectedLogs.value = []
      await loadSystemLogs()
    } else {
      ElMessage.error(res?.message || '批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ErrorHandler.handle(error, '批量删除失败')
    }
  }
}

const exportLogs = async () => {
  try {
    const [startDate, endDate] = searchForm.value.dateRange
    
    // 直接使用浏览器下载
    const params = new URLSearchParams({
      level: searchForm.value.level || '',
  category: searchForm.value.category || '',
  keyword: searchForm.value.keyword || '',
      startDate: startDate || '',
      endDate: endDate || ''
    })
    
    const link = document.createElement('a')
    link.href = `${SYSTEM_LOG_ENDPOINTS.EXPORT}?${params.toString()}`
    link.setAttribute('download', `system_logs_${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('日志导出开始')
  } catch (error) {
    ErrorHandler.handle(error, '导出日志失败')
  }
}

const confirmClearLogs = () => {
  clearForm.value.level = ''
  clearForm.value.range = 'all'
  clearForm.value.dateRange = []
  clearDialogVisible.value = true
}

const confirmClear = async () => {
  try {
    const [startDate, endDate] = clearForm.value.dateRange
    
    const data = {
      level: clearForm.value.level || undefined,
  range: clearForm.value.range,
      startDate: clearForm.value.range === 'date' ? startDate : undefined,
      endDate: clearForm.value.range === 'date' ? endDate : undefined
    }
    
    const res = await del(SYSTEM_LOG_ENDPOINTS.CLEAR, data)
    
    if (res && res.success) {
      ElMessage.success('日志清空成功')
      clearDialogVisible.value = false
      await loadSystemLogs()
    } else {
      ElMessage.error(res?.message || '清空日志失败')
    }
  } catch (error) {
    ErrorHandler.handle(error, '清空日志失败')
  } finally {
    clearLoading.value = false
  }
}

// 初始化
onMounted(() => {
  loadSystemLogs()
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

// 页面特定样式
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md) 0;
  border-top: var(--border-width-base) solid var(--border-color-lighter);
}

.detail-section {
  margin-top: var(--spacing-lg);
  
  .section-title {
    font-size: var(--text-md);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
    padding-bottom: var(--spacing-sm);
    border-bottom: var(--border-width-base) solid var(--border-color-lighter);
  }
}

.code-container {
  background: var(--bg-tertiary);
  border: var(--border-width-base) solid var(--border-color-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  
  .code-block {
    font-family: 'Courier New', monospace;
    font-size: var(--text-sm);
    line-height: 1.5;
    color: var(--text-regular);
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 300px;
    overflow-y: auto;
    margin: 0;
  }
}

.warning-content {
  display: flex;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--warning-extra-light);
  border: var(--border-width-base) solid var(--warning-light);
  border-radius: var(--radius-md);
  
  .warning-icon {
    font-size: var(--text-2xl);
    color: var(--warning-color);
    margin-right: var(--spacing-sm);
    margin-top: var(--spacing-sm);
    flex-shrink: 0;
  }
  
  .warning-message {
    flex: 1;
    
    p {
      margin: var(--spacing-xs) 0;
      color: var(--text-regular);
      line-height: 1.5;
      
      &:first-child {
        margin-top: 0;
        font-weight: var(--font-medium);
      }
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>