<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">消息模板</h1>
      <p class="page-description">管理系统消息模板，支持短信、邮件、站内信等多种类型</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon total">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalTemplates }}</div>
                <div class="stat-label">总模板数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon active">
                <UnifiedIcon name="Check" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.activeTemplates }}</div>
                <div class="stat-label">启用模板</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon system">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.systemTemplates }}</div>
                <div class="stat-label">系统模板</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon custom">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.customTemplates }}</div>
                <div class="stat-label">自定义模板</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索和操作区域 -->
    <el-card class="search-card">
      <div class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索模板名称、编码"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <UnifiedIcon name="Search" />
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-select v-model="searchForm.type" placeholder="模板类型" clearable>
              <el-option label="全部类型" value="" />
              <el-option label="短信" value="sms" />
              <el-option label="邮件" value="email" />
              <el-option label="站内信" value="notification" />
              <el-option label="微信" value="wechat" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="searchForm.status" placeholder="状态" clearable>
              <el-option label="全部状态" value="" />
              <el-option label="启用" value="1" />
              <el-option label="禁用" value="0" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="searchForm.isSystem" placeholder="模板来源" clearable>
              <el-option label="全部来源" value="" />
              <el-option label="系统模板" value="true" />
              <el-option label="自定义模板" value="false" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <div class="search-actions">
              <el-button type="primary" @click="handleSearch">
                <UnifiedIcon name="Search" />
                搜索
              </el-button>
              <el-button @click="handleReset">
                <UnifiedIcon name="Refresh" />
                重置
              </el-button>
            </div>
          </el-col>
        </el-row>
        
        <!-- 操作按钮区域 -->
        <el-row :gutter="20" class="action-row">
          <el-col :span="24">
            <div class="action-buttons">
              <el-button type="success" @click="handleCreate">
                <UnifiedIcon name="Plus" />
                新建模板
              </el-button>
              <el-button 
                type="danger" 
                :disabled="selectedTemplates.length === 0"
                @click="handleBatchDelete"
              >
                批量删除 ({{ selectedTemplates.length }})
              </el-button>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <div class="table-header">
        <div class="table-title">模板列表</div>
        <div class="table-actions">
          <span class="selected-info" v-if="selectedTemplates.length > 0">
            已选择 {{ selectedTemplates.length }} 个模板
          </span>
        </div>
      </div>

      <div class="table-wrapper">
<el-table class="responsive-table"
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="code" label="模板编码" width="150" />
        <el-table-column prop="name" label="模板名称" min-width="200" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="isSystem" label="来源" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isSystem ? 'info' : 'success'" size="small">
              {{ row.isSystem ? '系统' : '自定义' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="80" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <div class="table-actions-buttons">
              <el-button type="primary" size="small" @click="handleView(row)">
                <UnifiedIcon name="eye" />
                查看
              </el-button>
              <el-button type="success" size="small" @click="handlePreview(row)">
                <UnifiedIcon name="default" />
                预览
              </el-button>
              <el-button 
                type="warning" 
                size="small" 
                @click="handleEdit(row)"
                :disabled="row.isSystem"
              >
                <UnifiedIcon name="Edit" />
                编辑
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                @click="handleDelete(row)"
                :disabled="row.isSystem"
              >
                <UnifiedIcon name="Delete" />
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
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑模板对话框 -->
    <el-dialog
      v-model="templateDialogVisible"
      :title="isEdit ? '编辑模板' : '新建模板'"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form 
        :model="templateForm" 
        :rules="templateRules" 
        ref="templateFormRef" 
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="模板编码" prop="code">
              <el-input 
                v-model="templateForm.code" 
                placeholder="请输入模板编码"
                :disabled="isEdit"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板名称" prop="name">
              <el-input v-model="templateForm.name" placeholder="请输入模板名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="模板类型" prop="type">
              <el-select v-model="templateForm.type" placeholder="选择模板类型" style="width: 100%">
                <el-option label="短信" value="sms" />
                <el-option label="邮件" value="email" />
                <el-option label="站内信" value="notification" />
                <el-option label="微信" value="wechat" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="templateForm.status">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="模板标题" prop="title">
          <el-input v-model="templateForm.title" placeholder="请输入模板标题" />
        </el-form-item>

        <el-form-item label="模板内容" prop="content">
          <el-input
            v-model="templateForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入模板内容，支持变量：{变量名}"
          />
        </el-form-item>

        <el-form-item label="参数说明">
          <el-input
            v-model="templateForm.params"
            type="textarea"
            :rows="3"
            placeholder="请输入参数说明，如：{name}:姓名,{phone}:电话"
          />
        </el-form-item>

        <el-form-item label="模板描述">
          <el-input
            v-model="templateForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入模板描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="templateDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 模板预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="模板预览"
      width="600px"
    >
      <div v-if="previewTemplate" class="template-preview">
        <div class="preview-header">
          <div class="preview-info">
            <span class="template-name">{{ previewTemplate.name }}</span>
            <el-tag :type="getTypeTagType(previewTemplate.type)" size="small">
              {{ getTypeLabel(previewTemplate.type) }}
            </el-tag>
          </div>
        </div>
        
        <div class="preview-content">
          <div class="content-section">
            <div class="section-title">标题</div>
            <div class="section-content">{{ previewTemplate.title }}</div>
          </div>
          
          <div class="content-section">
            <div class="section-title">内容</div>
            <div class="section-content" v-html="formatTemplateContent(previewTemplate.content)"></div>
          </div>
          
          <div v-if="previewTemplate.params" class="content-section">
            <div class="section-title">参数说明</div>
            <div class="section-content">{{ previewTemplate.params }}</div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
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
  Document, Check, Setting, User, Search, Refresh, Plus, View, 
  Monitor, Edit, Delete
} from '@element-plus/icons-vue'

// 3. 公共工具函数导入
import request from '../../utils/request'
import { formatDate } from '../../utils/dateFormat'
// 添加真实API调用
import { 
  getMessageTemplates, 
  createMessageTemplate, 
  updateMessageTemplate, 
  deleteMessageTemplate,
  updateMessageTemplateStatus,
  batchDeleteMessageTemplates,
  getMessageTemplateStats
} from '@/api/modules/system'

// 解构request实例中的方法
const { get, post, put, del } = request

// 定义统一API响应类型
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

// 消息模板接口
interface MessageTemplate {
  id?: string;
  code: string;
  name: string;
  type: string;
  title: string;
  content: string;
  params: string | null;
  description: string | null;
  status: number
  isSystem?: boolean
  version?: number
}

// 统计信息接口
interface TemplateStats {
  totalTemplates: number
  activeTemplates: number
  systemTemplates: number
  customTemplates: number
}

// 搜索表单接口
interface SearchForm {
  keyword: string;
  type: string;
  status: string
  isSystem: string
}

// 分页接口
interface Pagination {
  currentPage: number
  pageSize: number;
  total: number
}

const router = useRouter()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)

// 统计数据
const stats = ref<TemplateStats>({
  totalTemplates: 0,
  activeTemplates: 0,
  systemTemplates: 0,
  customTemplates: 0
})

// 表格数据
const tableData = ref<MessageTemplate[]>([])
const selectedTemplates = ref<MessageTemplate[]>([])

// 搜索表单
const searchForm = ref<SearchForm>({
  keyword: '',
  type: '',
  status: '',
  isSystem: ''
})

// 分页
const pagination = ref<Pagination>({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 对话框状态
const templateDialogVisible = ref(false)
const previewDialogVisible = ref(false)
const isEdit = ref(false)

// 表单数据
const templateFormRef = ref()
const templateForm = ref<MessageTemplate>({
  code: '',
  name: '',
  type: '',
  title: '',
  content: '',
  params: '',
  description: '',
  status: 1
})

const templateRules: FormRules = {
  code: [
    { required: true, message: '请输入模板编码', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择模板类型', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入模板标题', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入模板内容', trigger: 'blur' }
  ]
}

// 预览模板
const previewTemplate = ref<MessageTemplate | null>(null)

// 获取统计数据
const loadStats = async () => {
  try {
    const response = await getMessageTemplateStats()
    if (response.success && response.data) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取模板列表
const loadTemplateList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      ...searchForm.value
    }
    
    const response = await getMessageTemplates(params)
    
    if (response.success && response.data) {
      tableData.value = response.data.items || []
      pagination.value.total = response.data.total || 0
    }
  } catch (error) {
    console.error('获取模板列表失败:', error)
    ElMessage.error('获取模板列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
  loadTemplateList()
}

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    keyword: '',
  type: '',
  status: '',
    isSystem: ''
  }
  pagination.value.currentPage = 1
  loadTemplateList()
}

// 新建模板
const handleCreate = () => {
  isEdit.value = false
  templateForm.value = {
    code: '',
  name: '',
  type: '',
  title: '',
  content: '',
  params: '',
  description: '',
  status: 1
  }
  templateDialogVisible.value = true
}

// 编辑模板
const handleEdit = (row: MessageTemplate) => {
  isEdit.value = true
  templateForm.value = { ...row }
  templateDialogVisible.value = true
}

// 查看模板
const handleView = (row: MessageTemplate) => {
  router.push(`/system/message-templates/${row.id}`)
}

// 预览模板
const handlePreview = (row: MessageTemplate) => {
  previewTemplate.value = row
  previewDialogVisible.value = true
}

// 状态切换
const handleStatusChange = async (row: MessageTemplate) => {
  try {
    const response = await updateMessageTemplateStatus(row.id, row.status)
    
    if (response.success) {
      ElMessage.success('状态更新成功')
      loadStats()
    } else {
      // 恢复原状态
      row.status = row.status === 1 ? 0 : 1
      ElMessage.error(response.message || '状态更新失败')
    }
  } catch (error) {
    // 恢复原状态
    row.status = row.status === 1 ? 0 : 1
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
  }
}

// 删除模板
const handleDelete = async (row: MessageTemplate) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除模板"${row.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await deleteMessageTemplate(row.id)
    
    if (response.success) {
      ElMessage.success('删除成功')
      loadTemplateList()
      loadStats()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 表格选择变化
const handleSelectionChange = (selection: MessageTemplate[]) => {
  selectedTemplates.value = selection
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedTemplates.value.length === 0) {
    ElMessage.warning('请选择要删除的模板')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedTemplates.value.length} 个模板吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const ids = selectedTemplates.value.map(item => item.id)
    const response = await batchDeleteMessageTemplates(ids)
    
    if (response.success) {
      ElMessage.success('批量删除成功')
      loadTemplateList()
      loadStats()
    } else {
      ElMessage.error(response.message || '批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!templateFormRef.value) return
  
  try {
    await templateFormRef.value.validate()
    submitting.value = true
    
    let response
    if (isEdit.value) {
      response = await updateMessageTemplate(templateForm.value.id!, templateForm.value)
    } else {
      response = await createMessageTemplate(templateForm.value)
    }
    
    if (response.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      templateDialogVisible.value = false
      loadTemplateList()
      loadStats()
    } else {
      ElMessage.error(response.message || (isEdit.value ? '更新失败' : '创建失败'))
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  loadTemplateList()
}

const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page
  loadTemplateList()
}

// 工具函数
const getTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    sms: 'primary',
  email: 'success',
  notification: 'warning',
  wechat: 'info'
  }
  return typeMap[type] || 'default'
}

const getTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    sms: '短信',
  email: '邮件',
  notification: '站内信',
  wechat: '微信'
  }
  return labelMap[type] || type
}

const formatTemplateContent = (content: string) => {
  // 高亮显示模板变量
  return content.replace(/\{([^}]+)\}/g, '<span style="color: var(--el-color-primary); font-weight: bold;">{$1}</span>')
}

// 页面初始化
onMounted(() => {
  loadStats()
  loadTemplateList()
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.page-header {
  margin-bottom: var(--app-gap); /* 硬编码修复：var(--text-2xl) → var(--text-lg) */
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
  margin: 0 0 var(--app-gap-sm) 0; /* 硬编码修复：var(--spacing-sm) → var(--app-gap-sm) */
}

.page-description {
  color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */
  margin: 0;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--app-gap); /* 硬编码修复：var(--text-2xl) → var(--text-lg) */
}

.stat-card {
  border: none;
  background: var(--bg-card) !important; /* 白色区域修复：强制使用主题卡片背景色 */
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用全局阴影变量 */
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(var(--transform-hover-lift));
    box-shadow: var(--shadow-md);
    background: var(--bg-hover) !important; /* 白色区域修复：悬停背景色 */
  }
  
  /* 覆盖Element Plus的默认样式 */
  :deep(.el-card__body) {
    background: transparent;
    padding: var(--spacing-md);
  }
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--radius-md); /* 硬编码修复：var(--spacing-sm) → var(--radius-md) */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--app-gap); /* 硬编码修复：var(--text-lg) → var(--app-gap) */
  font-size: var(--text-2xl);
  color: white;

/* 硬编码修复：使用全局渐变变量 */
.stat-icon.total {
  background: var(--gradient-purple);
}

.stat-icon.active {
  background: var(--gradient-blue);
}

.stat-icon.system {
  background: var(--gradient-green);
}

.stat-icon.custom {
  background: var(--gradient-orange);
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
  line-height: 1;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */
  margin-top: var(--spacing-xs);
}

.search-card {
  margin-bottom: var(--app-gap); /* 硬编码修复：var(--text-2xl) → var(--text-lg) */
  background: var(--bg-card) !important; /* 白色区域修复：强制使用主题卡片背景色 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：添加主题边框 */
  
  /* 覆盖Element Plus的默认样式 */
  :deep(.el-card__body) {
    background: transparent;
    padding: var(--spacing-md);
  }
}

.search-form {
  padding: var(--app-gap-sm) 0; /* 硬编码修复：10px → var(--spacing-sm) */
}

/* 按钮排版修复：搜索操作按钮 */
.search-actions {
  display: flex;
  gap: var(--app-gap-sm);
  align-items: center;
}

/* 按钮排版修复：操作按钮区域 */
.action-row {
  margin-top: var(--app-gap);
  padding-top: var(--app-gap);
  border-top: var(--z-index-dropdown) solid var(--border-color);
}

.action-buttons {
  display: flex;
  gap: var(--app-gap-sm);
  align-items: center;
  flex-wrap: wrap;
}

.table-card {
  background: var(--bg-card) !important; /* 白色区域修复：强制使用主题卡片背景色 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：添加主题边框 */
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用全局阴影变量 */
  
  /* 覆盖Element Plus的默认样式 */
  :deep(.el-card__body) {
    background: transparent;
    padding: var(--spacing-md);
  }
  
  /* 白色区域修复：表格完全主题化 */
  :deep(.el-table) {
    background: transparent;
    
    .el-table__header-wrapper {
      background: var(--bg-tertiary);
    }
    
    .el-table__body-wrapper {
      background: transparent;
    }
    
    tr {
      background: transparent !important;
      
      &:hover {
        background: var(--bg-hover) !important;
      }
    }
    
    th {
      background: var(--bg-tertiary) !important;
      color: var(--text-primary);
      border-bottom: var(--z-index-dropdown) solid var(--border-color);
    }
    
    td {
      background: transparent !important;
      color: var(--text-primary);
      border-bottom: var(--z-index-dropdown) solid var(--border-color);
    }
  }
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--app-gap-sm); /* 硬编码修复：var(--text-lg) → var(--spacing-sm) */
}

.table-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
}

/* 按钮排版修复：表格操作按钮 */
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

/* 选中信息样式 */
.selected-info {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
}

.pagination-wrapper {
  margin-top: var(--app-gap-sm); /* 硬编码修复：var(--text-2xl) → var(--spacing-sm) */
  display: flex;
  justify-content: center;
  
  /* 白色区域修复：分页组件主题化 */
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

.template-preview {
  padding: var(--app-gap); /* 硬编码修复：var(--text-2xl) → var(--text-lg) */
}

.preview-header {
  margin-bottom: var(--app-gap); /* 硬编码修复：var(--text-2xl) → var(--text-lg) */
  padding-bottom: var(--spacing-4xl);
  border-bottom: var(--z-index-dropdown) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
}

.preview-info {
  display: flex;
  align-items: center;
  gap: var(--app-gap-sm); /* 硬编码修复：10px → var(--spacing-sm) */
}

.template-name {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: var(--app-gap); /* 硬编码修复：var(--text-2xl) → var(--text-lg) */
}

.content-section {
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
  border-radius: var(--radius-sm); /* 硬编码修复：var(--spacing-xs) → var(--radius-sm) */
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.section-title {
  padding: var(--app-gap-sm) 15px; /* 硬编码修复：10px → var(--spacing-sm) */
  background: var(--bg-tertiary); /* 白色区域修复：使用主题背景色 */
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
  border-bottom: var(--z-index-dropdown) solid var(--border-color); /* 白色区域修复：使用主题边框色 */

.section-content {
  padding: var(--spacing-4xl);
  line-height: 1.6;
  white-space: pre-wrap;
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景色 */
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */

/* 白色区域修复：对话框主题化 */
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

/* 白色区域修复：表单控件主题化 */
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

:deep(.el-textarea) {
  .el-textarea__inner {
    background: var(--bg-tertiary);
    border-color: var(--border-color);
    color: var(--text-primary);
    
    &::placeholder {
      color: var(--text-muted);
    }
    
    &:hover {
      border-color: var(--border-light);
    }
    
    &:focus {
      border-color: var(--primary-color);
    }
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

:deep(.el-radio-group) {
  .el-radio {
    .el-radio__label {
      color: var(--text-primary);
    }
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .message-template-page {
    padding: var(--app-gap-sm); /* 移动端使用更小的间距 */
  }
  
  .stats-cards {
    .el-col {
      margin-bottom: var(--app-gap-sm); /* 从var(--text-lg)减少到var(--spacing-sm) */
    }
  }
  
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--app-gap-sm); /* 从var(--text-lg)减少到var(--spacing-sm) */
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
    gap: var(--app-gap-sm);
    
    .el-button {
      width: 100%;
      justify-content: center;
    }
  }
  
  .table-actions-buttons {
    flex-direction: column;
    gap: var(--spacing-sm);
    
    .el-button {
      width: 100%;
      min-width: auto;
    }
  }
}
}
}
}
</style> 