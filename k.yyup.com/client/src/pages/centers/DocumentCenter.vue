<template>
  <div class="document-center">
    <!-- 头部 - Glassmorphism 设计 -->
    <div class="document-header">
      <div class="header-content">
        <div class="header-icon">
          <UnifiedIcon name="document" :size="48" />
        </div>
        <div class="header-text">
          <h1>文档管理中心</h1>
          <p>管理文档模板和实例，支持实时协作编辑</p>
        </div>
      </div>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="document-tabs">
      <!-- 文档模板标签页 -->
      <el-tab-pane label="文档模板" name="templates">
        <div class="tab-content">
          <!-- 模板工具栏 - Glassmorphism -->
          <div class="toolbar glass-card">
            <div class="search-box">
              <el-input
                v-model="templateKeyword"
                placeholder="搜索模板名称..."
                clearable
                @input="loadTemplates(1)"
                class="search-input"
              >
                <template #prefix>
                  <UnifiedIcon name="search" />
                </template>
              </el-input>
            </div>
            <div class="actions">
              <el-select
                v-model="templateCategory"
                placeholder="按分类筛选"
                clearable
                @change="loadTemplates(1)"
                class="filter-select"
              >
                <el-option label="全部分类" value="" />
                <el-option label="检查表" value="checklist" />
                <el-option label="报告" value="report" />
                <el-option label="计划" value="plan" />
                <el-option label="总结" value="summary" />
              </el-select>
              <el-button type="primary" @click="refreshTemplates" class="action-btn">
                <UnifiedIcon name="refresh" />
                刷新
              </el-button>
            </div>
          </div>

          <!-- 模板表格 - Glassmorphism 容器 -->
          <div class="table-container glass-card">
            <DataTable
              :data="templates"
              :columns="templateColumns"
              :loading="templatesLoading"
              :total="templateTotal"
              :pagination-enabled="true"
              v-model:page="templatePage"
              v-model:page-size="templatePageSize"
              @page-change="loadTemplates"
              @page-size-change="(size) => loadTemplates(1)"
            >
              <template #column-category="{ row }">
                <el-tag size="small" :type="getCategoryTagType(row.category)">
                  {{ getCategoryLabel(row.category) }}
                </el-tag>
              </template>
              <template #column-actions="{ row }">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="createInstanceFromTemplate(row)"
                  class="action-link"
                >
                  创建实例
                </el-button>
                <el-button
                  link
                  type="success"
                  size="small"
                  @click="viewTemplate(row)"
                  class="action-link"
                >
                  查看
                </el-button>
              </template>
            </DataTable>
          </div>
        </div>
      </el-tab-pane>

      <!-- 文档实例标签页 -->
      <el-tab-pane label="文档实例" name="instances">
        <div class="tab-content">
          <!-- 实例工具栏 -->
          <div class="toolbar glass-card">
            <div class="search-box">
              <el-input
                v-model="instanceKeyword"
                placeholder="搜索实例标题..."
                clearable
                @input="loadInstances(1)"
                class="search-input"
              >
                <template #prefix>
                  <UnifiedIcon name="search" />
                </template>
              </el-input>
            </div>
            <div class="actions">
              <el-select
                v-model="instanceStatus"
                placeholder="按状态筛选"
                clearable
                @change="loadInstances(1)"
                class="filter-select"
              >
                <el-option label="全部状态" value="" />
                <el-option label="草稿" value="draft" />
                <el-option label="待审核" value="pending_review" />
                <el-option label="已批准" value="approved" />
                <el-option label="已拒绝" value="rejected" />
                <el-option label="已归档" value="archived" />
              </el-select>
              <el-button type="primary" @click="refreshInstances" class="action-btn">
                <UnifiedIcon name="refresh" />
                刷新
              </el-button>
            </div>
          </div>

          <!-- 实例表格 -->
          <div class="table-container glass-card">
            <DataTable
              :data="instances"
              :columns="instanceColumns"
              :loading="instancesLoading"
              :total="instanceTotal"
              :pagination-enabled="true"
              v-model:page="instancePage"
              v-model:page-size="instancePageSize"
              @page-change="loadInstances"
              @page-size-change="(size) => loadInstances(1)"
              @row-click="editInstance"
            >
              <template #column-status="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
              <template #column-completionRate="{ row }">
                <el-progress
                  :percentage="parseFloat(row.completionRate) || 0"
                  :color="getProgressColor(parseFloat(row.completionRate))"
                  :stroke-width="6"
                />
              </template>
              <template #column-updatedAt="{ row }">
                {{ formatDate(row.updatedAt) }}
              </template>
              <template #column-actions="{ row }">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click.stop="editInstance(row)"
                  class="action-link"
                >
                  编辑
                </el-button>
                <el-button
                  link
                  type="danger"
                  size="small"
                  @click.stop="deleteInstance(row)"
                  class="action-link"
                >
                  删除
                </el-button>
              </template>
            </DataTable>
          </div>
        </div>
      </el-tab-pane>

      <!-- 统计标签页 - 现代化统计卡片 -->
      <el-tab-pane label="统计分析" name="statistics">
        <div class="tab-content statistics-content">
          <div class="stats-grid">
            <div class="stat-card gradient-primary">
              <div class="stat-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect x="4" y="4" width="24" height="24" rx="4" fill="white" opacity="0.9"/>
                  <path d="M10 12h12M10 16h8M10 20h6" stroke="#6366F1" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-label">总模板数</div>
                <div class="stat-value">{{ templateTotal }}</div>
                <div class="stat-sublabel">个文档模板</div>
              </div>
              <div class="stat-bg-icon">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <rect x="10" y="10" width="60" height="60" rx="8" stroke="white" stroke-width="1" opacity="0.2"/>
                </svg>
              </div>
            </div>

            <div class="stat-card gradient-success">
              <div class="stat-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="12" fill="white" opacity="0.9"/>
                  <path d="M16 10v6l4 4" stroke="#10B981" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-label">总实例数</div>
                <div class="stat-value">{{ instanceTotal }}</div>
                <div class="stat-sublabel">个文档实例</div>
              </div>
              <div class="stat-bg-icon">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="30" stroke="white" stroke-width="1" opacity="0.2"/>
                </svg>
              </div>
            </div>

            <div class="stat-card gradient-warning">
              <div class="stat-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect x="6" y="6" width="20" height="20" rx="4" fill="white" opacity="0.9"/>
                  <path d="M12 16h8M16 12v8" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-label">已完成</div>
                <div class="stat-value">{{ completedInstances }}</div>
                <div class="stat-sublabel">个文档已完成</div>
              </div>
              <div class="stat-bg-icon">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <rect x="15" y="15" width="50" height="50" rx="6" stroke="white" stroke-width="1" opacity="0.2"/>
                </svg>
              </div>
            </div>

            <div class="stat-card gradient-info">
              <div class="stat-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="12" fill="white" opacity="0.9"/>
                  <path d="M16 8v8l5 5" stroke="#3B82F6" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-label">完成率</div>
                <div class="stat-value">{{ completionRate }}%</div>
                <div class="stat-sublabel">平均完成率</div>
              </div>
              <div class="stat-bg-icon">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="30" stroke="white" stroke-width="1" opacity="0.2"/>
                  <path d="M40 25v15l10 10" stroke="white" stroke-width="1" opacity="0.2"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 创建实例对话框 -->
    <el-dialog
      v-model="createInstanceDialogVisible"
      title="从模板创建实例"
      width="500px"
      class="modern-dialog"
    >
      <el-form :model="newInstanceForm" label-width="100px">
        <el-form-item label="模板名称">
          <el-input v-model="newInstanceForm.templateName" disabled />
        </el-form-item>
        <el-form-item label="实例标题" required>
          <el-input
            v-model="newInstanceForm.title"
            placeholder="输入文档实例标题"
          />
        </el-form-item>
        <el-form-item label="截止时间">
          <el-date-picker
            v-model="newInstanceForm.deadline"
            type="datetime"
            placeholder="选择截止时间"
          />
        </el-form-item>
        <el-form-item label="分配给">
          <el-select v-model="newInstanceForm.assignedTo" placeholder="选择分配人">
            <el-option label="我自己" value="self" />
            <el-option label="其他用户" value="other" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="createInstanceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCreateInstance" :loading="createInstanceLoading">
          创建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import DataTable from '@/components/centers/DataTable.vue'
import { get, post, del } from '@/utils/request'

// 标签页
const activeTab = ref('templates')

// 模板相关
const templates = ref<any[]>([])
const templatesLoading = ref(false)
const templatePage = ref(1)
const templatePageSize = ref(20)
const templateTotal = ref(0)
const templateKeyword = ref('')
const templateCategory = ref('')

// 实例相关
const instances = ref<any[]>([])
const instancesLoading = ref(false)
const instancePage = ref(1)
const instancePageSize = ref(20)
const instanceTotal = ref(0)
const instanceKeyword = ref('')
const instanceStatus = ref('')

// 创建实例对话框
const createInstanceDialogVisible = ref(false)
const createInstanceLoading = ref(false)
const newInstanceForm = ref({
  templateId: 0,
  templateName: '',
  title: '',
  deadline: null,
  assignedTo: 'self'
})

// 统计数据
const completedInstances = ref(0)
const completionRate = ref(0)

// DataTable column configurations
const templateColumns = ref([
  {
    prop: 'id',
    label: 'ID',
    width: 100,
    align: 'center'
  },
  {
    prop: 'name',
    label: '模板名称',
    minWidth: 200
  },
  {
    prop: 'code',
    label: '模板代码',
    width: 120,
    align: 'center'
  },
  {
    prop: 'category',
    label: '分类',
    width: 100,
    align: 'center',
    slot: 'category'
  },
  {
    prop: 'useCount',
    label: '使用次数',
    width: 100,
    align: 'center'
  },
  {
    prop: 'version',
    label: '版本',
    width: 80,
    align: 'center'
  },
  {
    prop: 'actions',
    label: '操作',
    width: 170,
    fixed: 'right',
    align: 'center',
    slot: 'actions'
  }
])

const instanceColumns = ref([
  {
    prop: 'id',
    label: 'ID',
    width: 100,
    align: 'center'
  },
  {
    prop: 'title',
    label: '文档标题',
    minWidth: 180,
    showOverflowTooltip: true
  },
  {
    prop: 'status',
    label: '状态',
    width: 90,
    align: 'center',
    slot: 'status'
  },
  {
    prop: 'completionRate',
    label: '完成度',
    width: 130,
    align: 'center',
    slot: 'completionRate'
  },
  {
    prop: 'updatedAt',
    label: '更新时间',
    width: 150,
    align: 'center',
    slot: 'updatedAt'
  },
  {
    prop: 'actions',
    label: '操作',
    width: 140,
    fixed: 'right',
    align: 'center',
    slot: 'actions'
  }
])

// 加载模板列表
const loadTemplates = async (page: number = 1) => {
  try {
    templatesLoading.value = true
    const response = await get('/api/document-templates', {
      page,
      pageSize: templatePageSize.value,
      keyword: templateKeyword.value,
      category: templateCategory.value
    })

    if (response.success) {
      templates.value = response.data.items || []
      templateTotal.value = response.data.total || 0
      templatePage.value = page
    }
  } catch (error) {
    console.error('加载模板列表失败:', error)
    ElMessage.error('加载模板列表失败')
  } finally {
    templatesLoading.value = false
  }
}

// 加载实例列表
const loadInstances = async (page: number = 1) => {
  try {
    instancesLoading.value = true
    const response = await get('/api/document-instances', {
      page,
      pageSize: instancePageSize.value,
      keyword: instanceKeyword.value,
      status: instanceStatus.value
    })

    if (response.success) {
      instances.value = response.data.items || []
      instanceTotal.value = response.data.total || 0
      instancePage.value = page

      // 计算统计数据
      calculateStatistics()
    }
  } catch (error) {
    console.error('加载实例列表失败:', error)
    ElMessage.error('加载实例列表失败')
  } finally {
    instancesLoading.value = false
  }
}

// 计算统计数据
const calculateStatistics = () => {
  const completed = instances.value.filter(i => i.status === 'approved' || i.status === 'completed').length
  completedInstances.value = completed

  const totalCompletion = instances.value.reduce((sum, i) => sum + parseFloat(i.completionRate || 0), 0)
  completionRate.value = instances.value.length > 0
    ? Math.round(totalCompletion / instances.value.length)
    : 0
}

// 刷新模板
const refreshTemplates = () => {
  loadTemplates(1)
}

// 刷新实例
const refreshInstances = () => {
  loadInstances(1)
}

// 创建实例
const createInstanceFromTemplate = (template: any) => {
  // 生成友好的日期时间格式
  const now = new Date()
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  newInstanceForm.value = {
    templateId: template.id,
    templateName: template.name,
    title: `${template.name} - ${dateStr} ${timeStr}`,
    deadline: null,
    assignedTo: 'self'
  }
  createInstanceDialogVisible.value = true
}

// 确认创建实例
const confirmCreateInstance = async () => {
  if (!newInstanceForm.value.title.trim()) {
    ElMessage.error('请输入实例标题')
    return
  }

  try {
    createInstanceLoading.value = true
    const response = await post('/api/document-instances', {
      templateId: newInstanceForm.value.templateId,
      title: newInstanceForm.value.title,
      deadline: newInstanceForm.value.deadline,
      status: 'draft',
      completionRate: 0
    })

    if (response.success) {
      ElMessage.success('实例创建成功')
      createInstanceDialogVisible.value = false
      loadInstances(1)
    } else {
      ElMessage.error(response.message || '创建失败')
    }
  } catch (error) {
    console.error('创建实例失败:', error)
    ElMessage.error('创建实例失败')
  } finally {
    createInstanceLoading.value = false
  }
}

// 编辑实例
const editInstance = (row: any) => {
  ElMessage.info('编辑功能开发中...')
}

// 删除实例
const deleteInstance = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除实例"${row.title}"吗？`,
      '删除确认',
      { type: 'warning' }
    )

    const response = await del(`/api/document-instances/${row.id}`)
    if (response.success) {
      ElMessage.success('删除成功')
      loadInstances(1)
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    console.error('删除实例失败:', error)
  }
}

// 查看模板
const viewTemplate = (row: any) => {
  ElMessage.info('查看功能开发中...')
}

// 获取分类标签类型
const getCategoryTagType = (category: string) => {
  const typeMap: Record<string, string> = {
    checklist: 'primary',
    report: 'success',
    plan: 'warning',
    summary: 'info',
    finance: 'danger',
    education: 'info',
    student: 'success',
    staff: 'warning'
  }
  return typeMap[category] || 'info'
}

// 获取分类标签
const getCategoryLabel = (category: string) => {
  const labelMap: Record<string, string> = {
    checklist: '检查表',
    report: '报告',
    plan: '计划',
    summary: '总结',
    finance: '财务',
    education: '教育',
    student: '学生',
    staff: '教职工'
  }
  return labelMap[category] || category
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    pending_review: '待审核',
    approved: '已批准',
    rejected: '已拒绝',
    archived: '已归档'
  }
  return statusMap[status] || status
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    draft: 'info',
    pending_review: 'warning',
    approved: 'success',
    rejected: 'danger',
    archived: 'info'
  }
  return typeMap[status] || 'info'
}

// 获取进度条颜色 - 使用 CSS 变量
const getProgressColor = (percentage: number) => {
  // 使用设计系统中定义的语义化颜色值
  if (percentage >= 100) return 'var(--success-color, #52c41a)'
  if (percentage >= 75) return 'var(--warning-color, #e6a23c)'
  if (percentage >= 50) return 'var(--primary-color, #409eff)'
  return 'var(--danger-color, #f56c6c)'
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

// 页面加载
onMounted(() => {
  loadTemplates()
  loadInstances()
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.document-center {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
  background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-page) 100%);
  padding: var(--spacing-lg);
  gap: var(--spacing-lg);
}

// ==================== Glassmorphism 卡片效果 ====================
.glass-card {
  background: var(--glass-bg, rgba(255, 255, 255, 0.85));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.5));
  box-shadow: var(--shadow-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: var(--radius-xl);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }
}

// ==================== 头部区域 ====================
.document-header {
  padding: 0;

  .header-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    padding: var(--spacing-3xl);

    .header-icon {
      flex-shrink: 0;
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-light-bg, rgba(var(--primary-color-rgb, 64, 158, 255), 0.1));
      border-radius: var(--radius-lg);
      color: var(--primary-color);
    }

    .header-text {
      flex: 1;

      h1 {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: var(--text-3xl);
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: -0.02em;
      }

      p {
        margin: 0;
        color: var(--text-secondary);
        font-size: var(--text-sm);
        line-height: 1.5;
      }
    }
  }
}

// ==================== 标签页 ====================
.document-tabs {
  flex: 1;
  overflow: auto;
  background: transparent;

  :deep(.el-tabs__header) {
    margin: 0;
    background: var(--glass-bg, rgba(255, 255, 255, 0.6));
    backdrop-filter: blur(8px);
    border-radius: var(--radius-lg);
    padding: var(--spacing-sm) var(--spacing-md) 0;
    border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.5));
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__item) {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-secondary);
    padding: 0 var(--spacing-xl);
    height: 44px;
    line-height: 44px;
    transition: all 0.2s ease;

    &:hover {
      color: var(--primary-color);
    }

    &.is-active {
      color: var(--primary-color);
      font-weight: 600;
    }
  }

  :deep(.el-tabs__active-bar) {
    background: var(--primary-color);
    height: 3px;
    border-radius: 2px;
  }

  :deep(.el-tabs__content) {
    height: 100%;
    overflow: auto;
    padding: 0;
  }
}

.tab-content {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

// ==================== 工具栏 ====================
.toolbar {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  flex-wrap: wrap;

  .search-box {
    flex: 1;
    min-width: 280px;

    :deep(.el-input) {
      .el-input__wrapper {
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        border: 1px solid var(--border-color);
        padding: 10px var(--spacing-md);
        transition: all 0.2s ease;

        &:hover {
          border-color: var(--border-color-hover);
        }

        &.is-focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px var(--primary-light-bg, rgba(var(--primary-color-rgb, 64, 158, 255), 0.1));
        }
      }
    }
  }

  .actions {
    display: flex;
    gap: var(--spacing-md);
    align-items: center;

    .filter-select {
      width: 150px;

      :deep(.el-input__wrapper) {
        border-radius: var(--radius-lg);
      }
    }

    .action-btn {
      border-radius: var(--radius-lg);
      padding: 10px var(--spacing-lg);
      font-weight: 500;
      background: var(--primary-color);
      border: none;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }
    }
  }
}

// ==================== 表格容器 ====================
.table-container {
  padding: 0;
  overflow: hidden;

  :deep(.el-table) {
    border: none;
    border-radius: var(--radius-xl);
    overflow: hidden;

    .el-table__header-wrapper {
      border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    }

    .el-table__body-wrapper {
      border-radius: 0 0 var(--radius-xl) var(--radius-xl);
    }

    tr {
      transition: all 0.2s ease;

      &:hover {
        background: var(--primary-light-bg, rgba(var(--primary-color-rgb, 64, 158, 255), 0.03)) !important;
      }
    }

    td {
      border-color: var(--border-color-light);
    }
  }

  :deep(.el-table--striped) {
    .el-table__body tr.el-table__row--striped td {
      background: var(--bg-page);
    }
  }

  .action-link {
    font-weight: 500;
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
}

// ==================== 分页 ====================
.pagination {
  display: flex;
  justify-content: center;
  padding: var(--spacing-lg) var(--spacing-xl);

  :deep(.el-pagination) {
    .btn-prev,
    .btn-next,
    .el-pager li {
      border-radius: var(--radius-md);
      font-weight: 500;
      transition: all 0.2s ease;

      &:hover {
        background: var(--primary-light-bg, rgba(var(--primary-color-rgb, 64, 158, 255), 0.1));
        color: var(--primary-color);
      }

      &.is-active {
        background: var(--primary-color);
        color: white;
      }
    }
  }
}

// ==================== 统计分析 ====================
.statistics-content {
  padding: var(--spacing-xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);

  @media (min-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  position: relative;
  padding: var(--spacing-xl);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: var(--shadow-lg);
  }

  &.gradient-primary {
    background: var(--gradient-primary, linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark, #3a7bd5) 100%));
  }

  &.gradient-success {
    background: var(--gradient-success, linear-gradient(135deg, var(--success-color) 0%, #95de64 100%));
  }

  &.gradient-warning {
    background: var(--gradient-warning, linear-gradient(135deg, var(--warning-color) 0%, #ffd666 100%));
  }

  &.gradient-info {
    background: var(--gradient-info, linear-gradient(135deg, var(--info-color, #909399) 0%, #b0b8c4 100%));
  }

  .stat-icon {
    position: relative;
    z-index: 2;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    border-radius: 14px;
    margin-bottom: 16px;
  }

  .stat-content {
    position: relative;
    z-index: 2;

    .stat-label {
      font-size: 14px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 8px;
      letter-spacing: 0.02em;
    }

    .stat-value {
      font-size: 36px;
      font-weight: 700;
      color: white;
      line-height: 1;
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }

    .stat-sublabel {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .stat-bg-icon {
    position: absolute;
    top: -10px;
    right: -10px;
    z-index: 1;
    opacity: 0.3;
    transition: all 0.3s ease;
  }

  &:hover {
    .stat-bg-icon {
      transform: scale(1.1) rotate(5deg);
      opacity: 0.5;
    }
  }
}

// ==================== 对话框 ====================
:deep(.modern-dialog) {
  .el-dialog {
    border-radius: 20px;
    overflow: hidden;
  }

  .el-dialog__header {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
    padding: 24px 24px 20px;
    border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  }

  .el-dialog__title {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a2e;
  }

  .el-dialog__body {
    padding: 24px;
  }

  .el-dialog__footer {
    padding: 16px 24px 24px;
    border-top: 1px solid rgba(226, 232, 240, 0.6);
  }
}

// ==================== 响应式设计 ====================
@media (max-width: 768px) {
  .document-center {
    padding: 16px;
  }

  .document-header .header-content {
    padding: 20px;

    .header-icon {
      width: 48px;
      height: 48px;
    }

    .header-text h1 {
      font-size: 22px;
    }
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .toolbar {
    flex-direction: column;

    .actions {
      width: 100%;

      .filter-select {
        flex: 1;
      }
    }
  }
}

// ==================== 动画优化 ====================
@media (prefers-reduced-motion: no-preference) {
  .glass-card,
  .stat-card,
  .action-btn,
  .action-link {
    will-change: transform, box-shadow;
  }
}

@media (prefers-reduced-motion: reduce) {
  .glass-card,
  .stat-card,
  .action-btn,
  .action-link {
    transition: none;
    will-change: auto;
  }
}
</style>
