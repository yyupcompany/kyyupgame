<template>
  <div class="ai-shortcuts-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">AI助手配置</h2>
        <p class="page-description">管理AI助手的快捷操作和系统提示词</p>
      </div>
      <div class="header-right">
        <el-button 
          type="primary" 
          @click="handleCreate"
          :disabled="!hasCreatePermission"
        >
          <el-icon><Plus /></el-icon>
          新增配置
        </el-button>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <div class="filter-left">
        <el-select 
          v-model="filters.role" 
          placeholder="选择角色" 
          clearable
          style="width: 150px"
          @change="handleFilter"
        >
          <el-option label="全部角色" value="" />
          <el-option label="园长" value="principal" />
          <el-option label="管理员" value="admin" />
          <el-option label="教师" value="teacher" />
          <el-option label="通用" value="all" />
        </el-select>

        <el-select 
          v-model="filters.category" 
          placeholder="选择类别" 
          clearable
          style="width: 180px"
          @change="handleFilter"
        >
          <el-option label="全部类别" value="" />
          <el-option label="招生规划" value="enrollment_planning" />
          <el-option label="活动策划" value="activity_planning" />
          <el-option label="进展分析" value="progress_analysis" />
          <el-option label="跟进提醒" value="follow_up_reminder" />
          <el-option label="转化监控" value="conversion_monitoring" />
          <el-option label="年龄提醒" value="age_reminder" />
          <el-option label="任务管理" value="task_management" />
          <el-option label="综合分析" value="comprehensive_analysis" />
        </el-select>

        <el-select 
          v-model="filters.api_endpoint" 
          placeholder="API类型" 
          clearable
          style="width: 120px"
          @change="handleFilter"
        >
          <el-option label="全部类型" value="" />
          <el-option label="AI聊天" value="ai_chat" />
          <el-option label="AI查询" value="ai_query" />
        </el-select>

        <el-input
          v-model="filters.search"
          placeholder="搜索名称或提示词"
          style="width: 200px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="filter-right">
        <el-button 
          type="danger" 
          :disabled="!selectedIds.length || !hasDeletePermission"
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <DraggableTable
        :table-data="tableData"
        :loading="loading"
        @selection-change="handleSelectionChange"
        @status-change="handleStatusChange"
        @preview="handlePreview"
        @edit="handleEdit"
        @delete="handleDelete"
        @sort-change="handleSortChange"
      />

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="快捷名称" prop="shortcut_name">
              <el-input 
                v-model="formData.shortcut_name" 
                placeholder="用户看到的按钮文字"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="提示词名称" prop="prompt_name">
              <el-input 
                v-model="formData.prompt_name" 
                placeholder="系统内部标识"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="功能类别" prop="category">
              <el-select v-model="formData.category" placeholder="选择功能类别">
                <el-option label="招生规划" value="enrollment_planning" />
                <el-option label="活动策划" value="activity_planning" />
                <el-option label="进展分析" value="progress_analysis" />
                <el-option label="跟进提醒" value="follow_up_reminder" />
                <el-option label="转化监控" value="conversion_monitoring" />
                <el-option label="年龄提醒" value="age_reminder" />
                <el-option label="任务管理" value="task_management" />
                <el-option label="综合分析" value="comprehensive_analysis" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="适用角色" prop="role">
              <el-select v-model="formData.role" placeholder="选择适用角色">
                <el-option label="园长" value="principal" />
                <el-option label="管理员" value="admin" />
                <el-option label="教师" value="teacher" />
                <el-option label="通用" value="all" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="API类型" prop="api_endpoint">
              <el-select v-model="formData.api_endpoint" placeholder="选择API类型">
                <el-option label="AI聊天" value="ai_chat" />
                <el-option label="AI查询" value="ai_query" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序权重" prop="sort_order">
              <el-input-number 
                v-model="formData.sort_order" 
                :min="0" 
                :max="999"
                placeholder="数字越小越靠前"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="启用状态">
          <el-switch v-model="formData.is_active" />
        </el-form-item>

        <el-form-item label="系统提示词" prop="system_prompt">
          <el-input
            v-model="formData.system_prompt"
            type="textarea"
            :rows="8"
            placeholder="请输入系统提示词内容，支持Markdown格式"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 提示词预览弹窗 -->
    <PromptPreview
      v-model="previewVisible"
      :data="previewData"
      @edit="handleEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { usePermission } from '@/composables/usePermission'
import { formatDate } from '@/utils/date'
import type { FormInstance } from 'element-plus'
import {
  getAIShortcuts,
  createAIShortcut,
  updateAIShortcut,
  deleteAIShortcut,
  batchDeleteAIShortcuts,
  type AIShortcut,
  type AIShortcutQuery
} from '@/api/ai-shortcuts'
import DraggableTable from '@/components/ai-assistant/DraggableTable.vue'
import PromptPreview from '@/components/ai-assistant/PromptPreview.vue'

// 权限检查
const { hasPermission } = usePermission()
const hasCreatePermission = computed(() => hasPermission('AI_SHORTCUTS_CREATE'))
const hasUpdatePermission = computed(() => hasPermission('AI_SHORTCUTS_UPDATE'))
const hasDeletePermission = computed(() => hasPermission('AI_SHORTCUTS_DELETE'))

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const tableData = ref([])
const selectedIds = ref([])

// 筛选条件
const filters = reactive({
  role: '',
  category: '',
  api_endpoint: '',
  search: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 弹窗状态
const dialogVisible = ref(false)
const previewVisible = ref(false)
const previewData = ref<any>({})
const dialogTitle = ref('')
const isEdit = ref(false)

// 表单数据
const formRef = ref<FormInstance>()
const formData = reactive({
  id: null,
  shortcut_name: '',
  prompt_name: '',
  category: '',
  role: 'all',
  system_prompt: '',
  api_endpoint: 'ai_chat',
  is_active: true,
  sort_order: 0
})

// 预览数据已在上面声明，删除重复声明

// 表单验证规则
const formRules = {
  shortcut_name: [
    { required: true, message: '请输入快捷名称', trigger: 'blur' }
  ],
  prompt_name: [
    { required: true, message: '请输入提示词名称', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择功能类别', trigger: 'change' }
  ],
  role: [
    { required: true, message: '请选择适用角色', trigger: 'change' }
  ],
  system_prompt: [
    { required: true, message: '请输入系统提示词', trigger: 'blur' }
  ],
  api_endpoint: [
    { required: true, message: '请选择API类型', trigger: 'change' }
  ]
}



// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params: AIShortcutQuery = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters
    }

    const result = await getAIShortcuts(params)
    tableData.value = result.data.list
    pagination.total = result.data.pagination.total
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 处理筛选
const handleFilter = () => {
  pagination.page = 1
  loadData()
}

// 处理搜索
let searchTimer: NodeJS.Timeout
const handleSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    pagination.page = 1
    loadData()
  }, 500)
}

// 处理刷新
const handleRefresh = () => {
  loadData()
}

// 处理选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 处理排序变化（拖拽排序）
const handleSortChange = (newData: any[]) => {
  // 更新本地数据
  tableData.value = newData
}

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.page = page
  loadData()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadData()
}



// 处理状态变化
const handleStatusChange = async (row: any) => {
  try {
    await updateAIShortcut(row.id, {
      is_active: row.is_active
    })
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
    loadData()
  }
}

// 处理创建
const handleCreate = () => {
  isEdit.value = false
  dialogTitle.value = '新增AI快捷操作'
  resetForm()
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row: any) => {
  isEdit.value = true
  dialogTitle.value = '编辑AI快捷操作'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 处理预览
const handlePreview = (row: any) => {
  previewData.value = row
  previewVisible.value = true
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: null,
    shortcut_name: '',
    prompt_name: '',
    category: '',
    role: 'all',
    system_prompt: '',
    api_endpoint: 'ai_chat',
    is_active: true,
    sort_order: 0
  })
  formRef.value?.clearValidate()
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    if (isEdit.value) {
      await updateAIShortcut(formData.id!, formData)
      ElMessage.success('更新成功')
    } else {
      await createAIShortcut(formData)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

// 处理删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除快捷操作"${row.shortcut_name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteAIShortcut(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 处理批量删除
const handleBatchDelete = async () => {
  if (!selectedIds.value.length) {
    ElMessage.warning('请选择要删除的项目')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个快捷操作吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await batchDeleteAIShortcuts(selectedIds.value)
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.ai-shortcuts-container {
  padding: var(--text-2xl);
  background: var(--bg-hover);
  min-height: calc(100vh - 60px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);
    padding: var(--text-2xl);
    background: white;
    border-radius: var(--spacing-sm);
    box-shadow: 0 2px var(--spacing-xs) var(--shadow-light);

    .header-left {
      .page-title {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--text-primary);
      }

      .page-description {
        margin: 0;
        color: var(--info-color);
        font-size: var(--text-base);
      }
    }

    .header-right {
      .el-button {
        margin-left: var(--text-sm);
      }
    }
  }

  .filter-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);
    padding: var(--text-lg) var(--text-2xl);
    background: white;
    border-radius: var(--spacing-sm);
    box-shadow: 0 2px var(--spacing-xs) var(--shadow-light);

    .filter-left {
      display: flex;
      gap: var(--text-sm);
      align-items: center;
    }

    .filter-right {
      display: flex;
      gap: var(--text-sm);
      align-items: center;
    }
  }

  .table-container {
    background: white;
    border-radius: var(--spacing-sm);
    box-shadow: 0 2px var(--spacing-xs) var(--shadow-light);
    overflow: hidden;

    .el-table {
      .el-input-number {
        width: 80px;
      }
    }

    .pagination-container {
      padding: var(--text-2xl);
      display: flex;
      justify-content: center;
      border-top: var(--border-width-base) solid #ebeef5;
    }
  }

  .preview-content {
    .prompt-content {
      margin-top: var(--text-lg);

      pre {
        background: var(--bg-hover);
        padding: var(--text-sm);
        border-radius: var(--spacing-xs);
        white-space: pre-wrap;
        word-wrap: break-word;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: var(--text-sm);
        line-height: 1.5;
        max-height: 300px;
        overflow-y: auto;
      }
    }
  }

  // 响应式设计
  @media (max-width: var(--breakpoint-md)) {
    padding: var(--spacing-2xl);

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--text-lg);

      .header-right {
        width: 100%;
        display: flex;
        justify-content: flex-end;
      }
    }

    .filter-toolbar {
      flex-direction: column;
      gap: var(--text-lg);

      .filter-left,
      .filter-right {
        width: 100%;
        flex-wrap: wrap;
      }
    }

    .table-container {
      .el-table {
        font-size: var(--text-sm);
      }
    }
  }
}

// Element Plus 组件样式覆盖
:deep(.el-table) {
  .el-table__header {
    th {
      background: var(--bg-tertiary);
      color: var(--text-regular);
      font-weight: 600;
    }
  }

  .el-table__row {
    &:hover {
      background: var(--bg-hover);
    }
  }
}

:deep(.el-dialog) {
  .el-dialog__header {
    padding: var(--text-2xl) var(--text-2xl) 10px;
    border-bottom: var(--border-width-base) solid #ebeef5;

    .el-dialog__title {
      font-size: var(--text-xl);
      font-weight: 600;
    }
  }

  .el-dialog__body {
    padding: var(--text-2xl);
  }

  .el-dialog__footer {
    padding: var(--spacing-2xl) var(--text-2xl) var(--text-2xl);
    border-top: var(--border-width-base) solid #ebeef5;
  }
}

:deep(.el-form) {
  .el-form-item__label {
    font-weight: 500;
    color: var(--text-regular);
  }

  .el-textarea__inner {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: var(--text-sm);
    line-height: 1.5;
  }
}

:deep(.el-tag) {
  border-radius: var(--spacing-xs);
  font-size: var(--text-sm);
}

:deep(.el-pagination) {
  .el-pagination__total {
    color: var(--info-color);
  }
}
</style>
