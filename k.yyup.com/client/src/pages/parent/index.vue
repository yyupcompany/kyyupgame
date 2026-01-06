<template>
  <div class="parent-management-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">家长管理</h1>
      <div class="page-actions">
        <el-button type="primary" @click="handleCreate">
          <UnifiedIcon name="Plus" />
          新增家长
        </el-button>
        <el-button @click="exportParents">
          <UnifiedIcon name="Download" />
          导出
        </el-button>
      </div>
    </div>

    <!-- 搜索过滤区域 -->
    <div class="search-section">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="家长姓名">
          <el-input v-model="searchForm.keyword" placeholder="请输入家长姓名或电话" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
            <el-option label="潜在家长" value="潜在家长" />
            <el-option label="在读家长" value="在读家长" />
            <el-option label="毕业家长" value="毕业家长" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <UnifiedIcon name="Search" />
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 家长列表 -->
    <div class="content-section">
      <div class="table-wrapper">
<el-table class="responsive-table parent-table"
        :data="items"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="家长编号" prop="id" width="120" />
        <el-table-column label="家长姓名" prop="name" width="100" />
        <el-table-column label="联系电话" prop="phone" width="130" />
        <el-table-column label="邮箱" prop="email" width="150" />
        <el-table-column label="孩子数量" width="100">
          <template #default="{ row }">
            <el-tag size="small">
              {{ (row.children && row.children.length) || 0 }}个
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="来源" prop="source" width="100" />
        <el-table-column label="登记时间" prop="registerDate" width="120">
          <template #default="{ row }">
            {{ formatDate(row.registerDate) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="viewParent(row)">
                <UnifiedIcon name="eye" />
                查看
              </el-button>
              <el-button type="success" size="small" @click="editParent(row)">
                <UnifiedIcon name="Edit" />
                编辑
              </el-button>
              <el-dropdown trigger="click" size="small">
                <el-button type="info" size="small">
                  更多<UnifiedIcon name="ArrowDown" />
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="manageParentChildren(row)">
                      <UnifiedIcon name="default" />
                      孩子管理
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleContactRecord(row)">
                      <UnifiedIcon name="default" />
                      沟通记录
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="handleDeleteParent(row)">
                      <UnifiedIcon name="Delete" />
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
</div>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 家长编辑对话框 -->
    <ParentEditDialog 
      v-model="editDialogVisible"
      :parent="editingParent"
      @save="handleSaveParent"
    />

    <!-- 孩子管理对话框 -->
    <ChildrenManageDialog
      v-model="childrenDialogVisible"
      :parent="selectedParent"
      :children="selectedParentChildren"
      @save="handleChildrenChange"
    />

    <!-- 沟通记录对话框 -->
    <ContactRecordDialog
      v-model="contactDialogVisible"
      :parent="selectedParent"
      :records="contactRecords"
      @add="handleAddContactRecord"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Download, View, Edit, Delete, User, ChatDotRound, ArrowDown } from '@element-plus/icons-vue'
import { useCrudOperations } from '@/composables/useCrudOperations'
import parentApi from '@/api/modules/parent'
import type { ApiResponseType } from '@/api/modules/parent'

// 类型定义
interface Parent {
  id: number
  name: string
  phone: string
  status: string
  children?: any[]
}

interface ParentListParams {
  keyword: string
  status: string
}

import ParentEditDialog from '@/components/ParentEditDialog.vue'
import ChildrenManageDialog from '@/components/ChildrenManageDialog.vue'
import ContactRecordDialog from '@/components/ContactRecordDialog.vue'

// 路由
const router = useRouter()

// 家长API配置
const parentCrudApi = {
  list: (params: ParentListParams) => parentApi.getParentList(params),
  create: (data: any) => parentApi.createParent(data),
  update: (id: string | number, data: any) => parentApi.updateParent(id, data),
  delete: (id: string | number) => parentApi.deleteParent(id)
}

// 使用CRUD操作组合式函数
const { 
  loading, 
  items, 
  total, 
  pagination,
  searchParams,
  loadItems, 
  createItem, 
  updateItem, 
  deleteItem,
  search,
  resetSearch,
  handlePageChange,
  handleSizeChange
} = useCrudOperations<Parent>(parentCrudApi, {
  autoLoad: false // 禁用自动加载，手动控制
})

// 页面状态
const searchForm = ref<ParentListParams>({
  keyword: '',
  status: ''
})

const selectedParents = ref<Parent[]>([])
const editDialogVisible = ref(false)
const childrenDialogVisible = ref(false)
const contactDialogVisible = ref(false)
const editingParent = ref<Parent | null>(null)
const selectedParent = ref<Parent | null>(null)
const selectedParentChildren = ref<any[]>([])
const contactRecords = ref<any[]>([])

// 搜索功能
const handleSearch = async () => {
  await search(searchForm.value)
}

const handleReset = async () => {
  searchForm.value = {
    keyword: '',
    status: ''
  }
  await resetSearch()
}

// 家长操作
const handleCreate = () => {
  editingParent.value = null
  editDialogVisible.value = true
}

const viewParent = (parent: Parent) => {
  router.push(`/parent/detail/${parent.id}`)
}

const editParent = (parent: Parent) => {
  editingParent.value = parent
  editDialogVisible.value = true
}

const handleSaveParent = async (parentData: any) => {
  try {
    if (editingParent.value) {
      await updateItem(editingParent.value.id, parentData)
    } else {
      await createItem(parentData)
    }
    editDialogVisible.value = false
  } catch (error) {
    console.error('保存家长信息失败:', error)
  }
}

const handleDeleteParent = async (parent: Parent) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除家长 ${parent.name} 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteItem(parent.id)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除家长失败:', error)
    }
  }
}

// 孩子管理功能
const manageParentChildren = async (parent: Parent) => {
  try {
    selectedParent.value = parent
    const response: ApiResponseType = await parentApi.getParentChildren(parent.id)
    if (response.success && response.data) {
      selectedParentChildren.value = response.data
      childrenDialogVisible.value = true
    } else {
      ElMessage.error('获取孩子信息失败')
    }
  } catch (error) {
    console.error('获取家长孩子信息失败:', error)
    ElMessage.error('获取孩子信息失败')
  }
}

const handleChildrenChange = async (childrenData: any) => {
  try {
    // 这里应该调用更新家长-孩子关联的API
    ElMessage.success('孩子信息更新成功')
    childrenDialogVisible.value = false
    await loadItems()
  } catch (error) {
    ElMessage.error('更新失败')
    console.error('更新家长孩子关联失败:', error)
  }
}

// 沟通记录功能
const handleContactRecord = async (parent: Parent) => {
  try {
    selectedParent.value = parent
    const response: ApiResponseType = await parentApi.getFollowUpList(parent.id)
    if (response.success || response.items) {
      contactRecords.value = response.items || response.data?.items || []
      contactDialogVisible.value = true
    } else {
      contactRecords.value = []
      contactDialogVisible.value = true
    }
  } catch (error) {
    console.error('获取沟通记录失败:', error)
    contactRecords.value = []
    contactDialogVisible.value = true
  }
}

const handleAddContactRecord = async (recordData: any) => {
  try {
    if (selectedParent.value) {
      const response: ApiResponseType = await parentApi.createFollowUp(selectedParent.value.id, recordData)
      if (response.success) {
        ElMessage.success('沟通记录添加成功')
        // 重新加载沟通记录
        await handleContactRecord(selectedParent.value)
      } else {
        ElMessage.error('添加失败')
      }
    }
  } catch (error) {
    console.error('添加沟通记录失败:', error)
    ElMessage.error('添加沟通记录失败')
  }
}

// 表格选择
const handleSelectionChange = (selection: Parent[]) => {
  selectedParents.value = selection
}

// 导出功能
const exportParents = () => {
  ElMessage.info('导出功能开发中')
}

// 工具函数
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    '潜在家长': 'warning',
    '在读家长': 'success',
    '毕业家长': 'info'
  }
  return statusMap[status] || 'info'
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 加载家长列表，并转换数据格式
const loadParentList = async () => {
  try {
    loading.value = true
    const params = {
      ...searchForm.value,
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    const response: ApiResponseType = await parentApi.getParentList(params)
    
    if (response?.success || response?.items) {
      // 使用转换后的数据
      const parentList: Parent[] = response.items || response.data?.items || []
      items.value = parentList
      total.value = response.total || response.data?.total || 0
      pagination.total = total.value
    } else {
      ElMessage.error(response?.message || '获取家长列表失败')
      items.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('加载家长列表失败:', error)
    ElMessage.error('获取家长列表失败')
    items.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(async () => {
  await loadParentList()
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.parent-management-page {
  padding: var(--spacing-lg);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
  padding-bottom: var(--spacing-4xl);
  border-bottom: var(--z-index-dropdown) solid var(--el-border-color);
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.search-section {
  background: var(--el-bg-color);
  padding: var(--spacing-lg);
  border-radius: var(--spacing-sm);
  margin-bottom: var(--text-2xl);
  box-shadow: 0 2px var(--spacing-xs) var(--shadow-light);
}

.search-form {
  .el-form-item {
    margin-right: var(--text-2xl);
    margin-bottom: var(--spacing-2xl);
  }
}

.content-section {
  background: var(--el-bg-color);
  padding: var(--spacing-lg);
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--spacing-xs) var(--shadow-light);
}

.parent-table {
  width: 100%;
}

.pagination-section {
  margin-top: var(--text-2xl);
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .parent-management-page {
    padding: var(--spacing-sm);
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-4xl);
  }
  
  .search-form {
    .el-form-item {
      margin-right: var(--spacing-2xl);
      margin-bottom: var(--spacing-4xl);
    }
  }
}
</style>