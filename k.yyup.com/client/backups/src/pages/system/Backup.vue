<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">系统备份</h1>
      <p class="page-description">管理系统数据备份，确保数据安全</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon total">
                <el-icon><FolderOpened /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalBackups }}</div>
                <div class="stat-label">总备份数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon size">
                <el-icon><Coin /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatFileSize(stats.totalSize) }}</div>
                <div class="stat-label">总大小</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon latest">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.latestBackup || '无' }}</div>
                <div class="stat-label">最新备份</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon auto">
                <el-icon><Setting /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ autoBackupSettings.enabled ? '已启用' : '已禁用' }}</div>
                <div class="stat-label">自动备份</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 操作区域 -->
    <el-card class="action-card">
      <div class="action-header">
        <div class="action-title">备份操作</div>
        <div class="action-buttons">
          <el-button type="primary" @click="showCreateBackupDialog">
            <el-icon><Plus /></el-icon>
            创建备份
          </el-button>
          <el-button @click="showAutoBackupSettings">
            <el-icon><Setting /></el-icon>
            自动备份设置
          </el-button>
          <el-button @click="refreshBackupList">
            <el-icon><Refresh /></el-icon>
            刷新列表
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 备份列表 -->
    <el-card class="table-card">
      <div class="table-header">
        <div class="table-title">备份列表</div>
        <div class="table-filters">
          <el-select v-model="filterType" placeholder="备份类型" clearable @change="loadBackupList">
            <el-option label="全部类型" value="" />
            <el-option label="手动备份" value="manual" />
            <el-option label="自动备份" value="auto" />
          </el-select>
        </div>
      </div>

      
      <!-- 空状态处理 -->
      <EmptyState 
        v-if="!loading && backupList.length === 0"
        type="no-data"
        title="暂无备份数据"
        description="还没有系统备份记录"
        :primary-action="{
          text: '立即备份',
          handler: handleCreate
        }"
        :secondary-action="{
          text: '刷新数据',
          handler: () => { loadData && loadData(); }
        }"
        :suggestions="[
          '检查网络连接是否正常',
          '确认是否有相关数据',
          '联系管理员获取帮助'
        ]"
        :show-suggestions="true"
      />
      
      <el-table
        v-else
        :data="backupList"
        v-loading="loading"
        stripe
        style="width: 100%"
        :table-layout="'auto'"
      >
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="name" label="备份名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="type" label="配置" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 'auto' ? 'success' : 'primary'" size="small">
              {{ row.type === 'auto' ? '自动' : '手动' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="备份内容" min-width="160">
          <template #default="{ row }">
            <div class="content-tags">
              <el-tag
                v-if="row.content && row.content.length > 0"
                v-for="item in row.content"
                :key="item"
                size="small"
                class="content-tag"
              >
                {{ getContentLabel(item) }}
              </el-tag>
              <el-tag v-else size="small" type="info" class="content-tag">
                数据库
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="文件大小" width="100" align="right">
          <template #default="{ row }">
            <span class="file-size">{{ formatFileSize(row.size) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="140" align="center">
          <template #default="{ row }">
            <span class="create-time">{{ formatDateTime(row.createdAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="downloadBackup(row)" class="action-btn">
                下载
              </el-button>
              <el-button type="success" size="small" @click="restoreBackup(row)" class="action-btn">
                恢复
              </el-button>
              <el-button type="danger" size="small" @click="deleteBackup(row)" class="action-btn">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
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

    <!-- 创建备份对话框 -->
    <el-dialog
      v-model="createBackupDialogVisible"
      title="创建系统备份"
      width="600px"
    >
      <el-form :model="createBackupForm" :rules="createBackupRules" ref="createBackupFormRef" label-width="100px">
        <el-form-item label="备份名称" prop="name">
          <el-input v-model="createBackupForm.name" placeholder="请输入备份名称" />
        </el-form-item>
        <el-form-item label="备份内容" prop="content">
          <el-checkbox-group v-model="createBackupForm.content">
            <el-checkbox value="database">数据库</el-checkbox>
            <el-checkbox value="files">文件系统</el-checkbox>
            <el-checkbox value="config">系统配置</el-checkbox>
            <el-checkbox value="logs">系统日志</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="备份描述">
          <el-input
            v-model="createBackupForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入备份描述（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createBackupDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreateBackup">
          创建备份
        </el-button>
      </template>
    </el-dialog>

    <!-- 自动备份设置对话框 -->
    <el-dialog
      v-model="autoBackupDialogVisible"
      title="自动备份设置"
      width="600px"
    >
      <el-form :model="autoBackupSettings" label-width="120px">
        <el-form-item label="启用自动备份">
          <el-switch v-model="autoBackupSettings.enabled" />
        </el-form-item>
        <el-form-item label="备份频率" v-if="autoBackupSettings.enabled">
          <el-select v-model="autoBackupSettings.frequency" placeholder="选择备份频率">
            <el-option label="每日" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
          </el-select>
        </el-form-item>
        <el-form-item label="备份时间" v-if="autoBackupSettings.enabled">
          <el-time-picker
            v-model="autoBackupSettings.time"
            format="HH:mm"
            placeholder="选择备份时间"
          />
        </el-form-item>
        <el-form-item label="保留天数" v-if="autoBackupSettings.enabled">
          <el-input-number
            v-model="autoBackupSettings.retentionDays"
            :min="1"
            :max="365"
            placeholder="备份文件保留天数"
          />
        </el-form-item>
        <el-form-item label="备份内容" v-if="autoBackupSettings.enabled">
          <el-checkbox-group v-model="autoBackupSettings.content">
            <el-checkbox value="database">数据库</el-checkbox>
            <el-checkbox value="files">文件系统</el-checkbox>
            <el-checkbox value="config">系统配置</el-checkbox>
            <el-checkbox value="logs">系统日志</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="autoBackupDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAutoBackupSettings">
          保存设置
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 1. Vue 相关导入
import { ref, onMounted } from 'vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useRouter } from 'vue-router'

// 2. Element Plus 导入
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormRules } from 'element-plus'
import { 
  FolderOpened, Coin, Clock, Setting, Plus, Refresh, Download, 
  RefreshLeft, Delete
} from '@element-plus/icons-vue'

// 3. 公共工具函数导入
import request from '@/utils/request'
import { SYSTEM_BACKUP_ENDPOINTS } from '@/api/endpoints'

// 4. 页面内部类型定义
interface Backup {
  id: number | string;
  name: string;
  size: number;
  type: 'auto' | 'manual';
  content: string[]
  createdAt: string;
  description: string | null
  filePath: string
}

interface BackupStats {
  totalBackups: number
  totalSize: number
  latestBackup: string | null
}

interface AutoBackupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: Date | null
  retentionDays: number;
  content: string[]
}

interface CreateBackupForm {
  name: string;
  content: string[];
  description: string
}

interface Pagination {
  currentPage: number
  pageSize: number;
  total: number
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

const router = useRouter()

// 响应式数据
const loading = ref(false)
const creating = ref(false)
const filterType = ref('')

// 统计数据
const stats = ref<BackupStats>({
  totalBackups: 0,
  totalSize: 0,
  latestBackup: null
})

// 备份列表
const backupList = ref<Backup[]>([])
const pagination = ref<Pagination>({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 对话框状态
const createBackupDialogVisible = ref(false)
const autoBackupDialogVisible = ref(false)

// 表单数据
const createBackupFormRef = ref<any>()
const createBackupForm = ref<CreateBackupForm>({
  name: '',
  content: ['database'],
  description: ''
})

const createBackupRules: FormRules = {
  name: [
    { required: true, message: '请输入备份名称', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请选择备份内容', trigger: 'change' }
  ]
}

// 自动备份设置
const autoBackupSettings = ref<AutoBackupSettings>({
  enabled: false,
  frequency: 'daily',
  time: null,
  retentionDays: 30,
  content: ['database', 'config']
})

// API调用函数
const loadStats = async () => {
  try {
    const res = await (request as any).get(SYSTEM_BACKUP_ENDPOINTS.STATUS)
    if (res.success && res.data) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('获取备份统计失败:', error)
  }
}

const loadBackupList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
  type: filterType.value
    }
    
    const res = await (request as any).get(SYSTEM_BACKUP_ENDPOINTS.BASE, params)
    
    if (res.success && res.data) {
      backupList.value = res.data.items || []
      pagination.value.total = res.data.total || 0
    }
  } catch (error) {
    console.error('获取备份列表失败:', error)
    ElMessage.error('获取备份列表失败')
  } finally {
    loading.value = false
  }
}

const loadAutoBackupSettings = async () => {
  try {
    const res = await (request as any).get(SYSTEM_BACKUP_ENDPOINTS.SCHEDULE)
    if (res.success && res.data) {
      autoBackupSettings.value = res.data
    }
  } catch (error) {
    console.error('获取自动备份设置失败:', error)
  }
}

// 事件处理函数
const handleCreate = () => {
  createBackupDialogVisible.value = true
}

const handleCreateBackup = async () => {
  try {
    if (createBackupFormRef.value) {
      await createBackupFormRef.value.validate(() => {})
    }

    creating.value = true

    // 准备备份参数
    const backupParams = {
      name: createBackupForm.value.name,
      description: createBackupForm.value.description,
      includeData: true, // 默认包含数据
      // 根据选择的内容类型设置包含的表
      includeTables: createBackupForm.value.content.includes('database') ? undefined : [],
      excludeTables: []
    }

    const res = await (request as any).post(SYSTEM_BACKUP_ENDPOINTS.DATABASE, backupParams)

    if (res.success) {
      ElMessage.success(`备份创建成功！共备份 ${res.data.tableCount} 个表，${res.data.recordCount} 条记录`)
      createBackupDialogVisible.value = false
      loadBackupList()
      loadStats()
    } else {
      ElMessage.error(res.message || '备份创建失败')
    }
  } catch (error) {
    console.error('创建备份失败:', error)
    ElMessage.error('创建备份失败')
  } finally {
    creating.value = false
  }
}

const downloadBackup = async (backup: Backup) => {
  try {
    const res = await (request as any).get(SYSTEM_BACKUP_ENDPOINTS.DOWNLOAD(backup.id))
    
    if (res.success && res.data) {
      const link = document.createElement('a')
      link.href = res.data.url
      link.download = backup.name
      link.click()
      ElMessage.success('下载开始')
    } else {
      ElMessage.error(res.message || '下载失败')
    }
  } catch (error) {
    console.error('下载备份失败:', error)
    ElMessage.error('下载失败')
  }
}

const restoreBackup = async (backup: Backup) => {
  try {
    await ElMessageBox.confirm(
      `确定要恢复备份 "${backup.name}" 吗？此操作将覆盖当前数据！`,
      '确认恢复',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
  type: 'warning'
      }
    )
    
    const res = await (request as any).post(SYSTEM_BACKUP_ENDPOINTS.RESTORE, { backupId: backup.id })
    
    if (res.success) {
      ElMessage.success('备份恢复成功')
      loadBackupList()
    } else {
      ElMessage.error(res.message || '备份恢复失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('恢复备份失败:', error)
      ElMessage.error('恢复失败')
    }
  }
}

const deleteBackup = async (backup: Backup) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除备份 "${backup.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
  type: 'warning'
      }
    )

    const res = await (request as any).del(SYSTEM_BACKUP_ENDPOINTS.DELETE(backup.id))

    if (res.success) {
      ElMessage.success('删除成功')
      loadBackupList()
      loadStats()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除备份失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const saveAutoBackupSettings = async () => {
  try {
    const res = await (request as any).put(SYSTEM_BACKUP_ENDPOINTS.SCHEDULE, autoBackupSettings.value)
    
    if (res.success) {
      ElMessage.success('设置保存成功')
      autoBackupDialogVisible.value = false
      loadStats()
    } else {
      ElMessage.error(res.message || '设置保存失败')
    }
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('设置保存失败')
  }
}

const showCreateBackupDialog = () => {
  createBackupForm.value = {
    name: '',
  content: ['database'],
  description: ''
  }
  createBackupDialogVisible.value = true
}

const showAutoBackupSettings = () => {
  autoBackupDialogVisible.value = true
}

const refreshBackupList = () => {
  loadBackupList()
  loadStats()
}

const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  loadBackupList()
}

const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page
  loadBackupList()
}

// 工具函数
const formatFileSize = (bytes: number | undefined): string => {
  if (!bytes || bytes === 0 || isNaN(bytes)) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

const getContentLabel = (content: string): string => {
  const labelMap: Record<string, string> = {
    database: '数据库',
  files: '文件系统',
  config: '系统配置',
  logs: '系统日志'
  }
  return labelMap[content] || content
}

// 页面初始化
onMounted(() => {
  loadStats()
  loadBackupList()
  loadAutoBackupSettings()
})
</script>

<style scoped>
.page-header {
  margin-bottom: var(--app-padding);
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 var(--app-gap-sm) 0;
}

.page-description {
  color: var(--el-text-color-regular);
  margin: 0;
}

.stats-cards {
  margin-bottom: var(--app-padding);
}

.stat-card {
  border: none;
  box-shadow: var(--shadow-md);
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--app-gap-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--app-gap);
  font-size: var(--text-2xl);
  color: white;
}

.stat-icon.total {
  background: var(--gradient-purple);
}

.stat-icon.size {
  background: var(--gradient-pink);
}

.stat-icon.latest {
  background: var(--gradient-blue);
}

.stat-icon.auto {
  background: var(--gradient-green);
}

.stat-value {
  font-size: var(--text-4xl);
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
  margin-top: var(--spacing-xs);
}

.action-card {
  margin-bottom: var(--app-padding);
}

.action-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.action-buttons {
  display: flex;
  gap: var(--app-gap-sm);
}

.table-card {
  box-shadow: var(--shadow-md);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--app-gap);
}

.table-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.table-filters {
  display: flex;
  gap: var(--app-gap-sm);
}

.pagination-wrapper {
  margin-top: var(--app-padding);
  display: flex;
  justify-content: center;
}

/* 表格内容样式优化 */
.content-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  align-items: center;
}

.content-tag {
  margin: 0 !important;
  font-size: var(--text-xs);
}

.file-size {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--text-xs);
  color: var(--el-text-color-regular);
}

.create-time {
  font-size: var(--text-xs);
  color: var(--el-text-color-regular);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: center;
  align-items: center;
}

.action-btn {
  padding: var(--spacing-xs) var(--spacing-sm) !important;
  font-size: var(--text-xs) !important;
  min-width: 4var(--spacing-xs);
}

/* 表格布局优化 */
:deep(.el-table) {
  font-size: var(--text-sm);
}

:deep(.el-table th) {
  background-color: var(--el-fill-color-lighter);
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding: var(--text-sm) var(--spacing-sm);
}

:deep(.el-table td) {
  padding: var(--spacing-2xl) var(--spacing-sm);
  vertical-align: middle;
}

:deep(.el-table .cell) {
  padding: 0 var(--spacing-sm);
  line-height: 1.4;
}

/* 表格行间距优化 */
:deep(.el-table tbody tr) {
  height: auto;
}

:deep(.el-table tbody tr:hover) {
  background-color: var(--el-fill-color-light);
}

/* 表格列宽度自适应 */
:deep(.el-table colgroup col) {
  width: auto !important;
}

:deep(.el-table .el-table__cell) {
  border-bottom: var(--border-width-base) solid var(--el-border-color-lighter);
}
</style>