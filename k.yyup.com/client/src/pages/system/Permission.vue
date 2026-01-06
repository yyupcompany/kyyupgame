<template>
  <div class="page-container">
    <!-- 搜索区域 - 优化移动端布局 -->
    <div class="card filter-card">
      <div class="card-body">
        <el-form :model="searchForm" label-width="80px" class="filter-form">
          <div class="filter-group">
            <el-form-item label="权限名称">
              <el-input 
                v-model="searchForm.name" 
                placeholder="请输入权限名称" 
                clearable 
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="权限编码">
              <el-input 
                v-model="searchForm.code" 
                placeholder="请输入权限编码" 
                clearable 
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="权限类型">
              <el-select 
                v-model="searchForm.type" 
                placeholder="请选择类型" 
                clearable
              >
                <el-option label="菜单" value="menu" />
                <el-option label="按钮" value="button" />
              </el-select>
            </el-form-item>
          </div>
          <div class="filter-actions">
            <el-button type="primary" @click="handleSearch" :loading="loading">
              <UnifiedIcon name="Search" />
              搜索
            </el-button>
            <el-button @click="resetSearch">
              <UnifiedIcon name="Refresh" />
              重置
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
    
    <!-- 权限列表区域 -->
    <div class="card table-card">
      <div class="card-header">
        <h3 class="card-title">权限列表</h3>
        <div class="card-actions">
          <el-button type="primary" @click="openPermissionDialog()">
            <UnifiedIcon name="Plus" />
            新增权限
          </el-button>
          <el-button 
            type="danger" 
            :disabled="selectedPermissions.length === 0" 
            @click="batchDeletePermissions"
          >
            <UnifiedIcon name="Delete" />
            批量删除
          </el-button>
        </div>
      </div>
      
      <div class="card-body">
              <!-- 空状态处理 -->
      <EmptyState 
        v-if="!loading && permissionList.length === 0"
        type="no-data"
        title="暂无权限数据"
        description="还没有权限配置信息"
        :primary-action="{
          text: '新增权限',
          handler: handleCreate
        }"
        :secondary-action="{
          text: '刷新数据',
          handler: loadPermissions
        }"
        :suggestions="[
          '检查网络连接是否正常',
          '确认是否有相关数据',
          '联系管理员获取帮助'
        ]"
        :show-suggestions="true"
      />
      
      <div class="table-wrapper" v-if="!loading || permissionList.length > 0">
        <el-table class="responsive-table"
        :data="permissionList"
        style="width: 100%"
        border
        stripe
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="权限名称" width="150" show-overflow-tooltip />
          <el-table-column prop="code" label="权限编码" width="150" show-overflow-tooltip />
          <el-table-column prop="type" label="权限类型" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.type === 'menu' ? 'primary' : 'success'">
                {{ scope.row.type === 'menu' ? '菜单' : '按钮' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="path" label="路由路径" width="180" show-overflow-tooltip />
          <el-table-column prop="icon" label="图标" width="80" align="center">
            <template #default="scope">
              <UnifiedIcon v-if="scope.row.icon" :name="scope.row.icon" />
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="180" />
          <el-table-column label="操作" :width="operationColumnWidth" align="center" :fixed="isDesktop ? 'right' : false">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                text
                @click="openPermissionDialog(scope.row)"
              >
                <UnifiedIcon name="Edit" />
                编辑
              </el-button>
              <el-button
                v-if="scope.row.status === 1"
                type="warning"
                size="small"
                text
                @click="updatePermissionStatus(scope.row, 0)"
              >
                <UnifiedIcon name="default" />
                禁用
              </el-button>
              <el-button
                v-else
                type="success"
                size="small"
                text
                @click="updatePermissionStatus(scope.row, 1)"
              >
                <UnifiedIcon name="default" />
                启用
              </el-button>
              <el-button
                type="danger"
                size="small"
                text
                @click="deletePermission(scope.row)"
              >
                <UnifiedIcon name="Delete" />
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
</div>
        
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
    
    <!-- 权限编辑对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      :title="editingPermission.id ? '编辑权限' : '新增权限'"
      :width="isDesktop ? '600px' : '95%'"
      :close-on-click-modal="false"
      class="permission-dialog"
    >
      <el-form
        :model="editingPermission"
        :rules="permissionRules"
        ref="permissionFormRef"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="权限名称" prop="name">
              <el-input v-model="editingPermission.name" placeholder="请输入权限名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权限编码" prop="code">
              <el-input 
                v-model="editingPermission.code" 
                placeholder="请输入权限编码" 
                :disabled="!!editingPermission.id" 
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="权限类型" prop="type">
              <el-select v-model="editingPermission.type" placeholder="请选择类型">
                <el-option label="菜单" value="menu" />
                <el-option label="按钮" value="button" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="路由路径" prop="path">
              <el-input v-model="editingPermission.path" placeholder="请输入路由路径" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="组件路径">
              <el-input v-model="editingPermission.component" placeholder="请输入组件路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="图标">
              <el-input v-model="editingPermission.icon" placeholder="请输入图标名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排序">
              <el-input-number v-model="editingPermission.sort" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="editingPermission.status">
                <el-radio :value="1">启用</el-radio>
                <el-radio :value="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePermission" :loading="saving">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 1. Vue 相关导入
import { ref, onMounted, nextTick, computed } from 'vue'

// 2. Element Plus 导入
import type { FormInstance, FormRules } from 'element-plus'

// 组件导入
import EmptyState from '@/components/common/EmptyState.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  Delete, 
  Edit, 
  Lock, 
  Unlock, 
  Search, 
  Refresh 
} from '@element-plus/icons-vue'

// 3. 公共工具函数导入
import { request } from '@/utils/request'
import { PERMISSION_ENDPOINTS } from '@/api/endpoints'

// 4. 页面内部类型定义
interface Permission {
  id?: number;
  name: string;
  code: string;
  type: string;
  path: string
  component?: string
  icon?: string;
  sort: number;
  status: number
  created_at?: string
  updated_at?: string
}

interface SearchForm {
  name: string;
  code: string;
  type: string | undefined
}

interface Pagination {
  page: number
  pageSize: number;
  total: number
}

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string
  items?: T[]
  total?: number
}

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const permissionDialogVisible = ref(false)
const selectedPermissions = ref<Permission[]>([])
const permissionList = ref<Permission[]>([])

// 搜索表单
const searchForm = ref<SearchForm>({
  name: '',
  code: '',
  type: undefined
})

// 分页数据 - 修复currentPage属性
const pagination = ref({
  currentPage: 1,
  page: 1,
  pageSize: 20,
  total: 0
})

// 编辑权限数据
const editingPermission = ref<Permission>({
  name: '',
  code: '',
  type: 'menu',
  path: '',
  component: '',
  icon: '',
  sort: 0,
  status: 1
})

// 表单引用
const permissionFormRef = ref<FormInstance | null>(null)

// 响应式计算属性
const isDesktop = computed(() => {
  if (typeof window !== 'undefined') {
    return window.innerWidth >= 768
  }
  return true
})

const operationColumnWidth = computed(() => {
  return isDesktop.value ? 280 : 250
})

// 表单验证规则
const permissionRules: FormRules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 2, max: 50, message: '权限名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入权限编码', trigger: 'blur' },
    { min: 2, max: 50, message: '权限编码长度在 2 到 50 个字符', trigger: 'blur' },
    { pattern: /^[A-Z_]+$/, message: '权限编码只能包含大写字母和下划线', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择权限类型', trigger: 'change' }
  ],
  path: [
    { required: true, message: '请输入路由路径', trigger: 'blur' }
  ]
}

// API方法
const fetchPermissionList = async (): Promise<void> => {
  try {
    loading.value = true
    
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
  name: searchForm.value.name || undefined,
  code: searchForm.value.code || undefined,
  type: searchForm.value.type || undefined
    }
    
    const res = await (request as any).get(PERMISSION_ENDPOINTS.BASE, params)

    console.log('🔍 权限API响应:', res)

    if (res?.success) {
      // 安全处理API响应数据
      const responseData = res.data || {}
      console.log('📊 响应数据:', responseData)

      permissionList.value = Array.isArray(responseData.items) ? responseData.items :
                             Array.isArray(responseData) ? responseData : []
      console.log('📋 权限列表长度:', permissionList.value.length)

      // 修复：当API返回的total为0但items有数据时，使用items.length作为total
      pagination.value.total = (responseData.total > 0) ? responseData.total : permissionList.value.length
      console.log('📄 分页总数:', pagination.value.total)
    } else {
      ElMessage.error(res?.message || '获取权限列表失败')
      permissionList.value = []
      pagination.value.total = 0
    }
  } catch (error) {
    console.error('获取权限列表失败:', error)
    ElMessage.error('获取权限列表失败')
  } finally {
    loading.value = false
  }
}

const createPermission = async (permissionData: Permission): Promise<boolean> => {
  try {
    const res = await (request as any).post(PERMISSION_ENDPOINTS.BASE, permissionData)
    
    if (res?.success) {
      ElMessage.success('创建权限成功')
      return true
    } else {
      ElMessage.error(res?.message || '创建权限失败')
      return false
    }
  } catch (error) {
    console.error('创建权限失败:', error)
    ElMessage.error('创建权限失败')
    return false
  }
}

const updatePermission = async (id: number, permissionData: Permission): Promise<boolean> => {
  try {
    const res = await (request as any).put(PERMISSION_ENDPOINTS.UPDATE(id), permissionData)
    
    if (res?.success) {
      ElMessage.success('更新权限成功')
      return true
    } else {
      ElMessage.error(res?.message || '更新权限失败')
      return false
    }
  } catch (error) {
    console.error('更新权限失败:', error)
    ElMessage.error('更新权限失败')
    return false
  }
}

const deletePermissionById = async (id: number): Promise<boolean> => {
  try {
    const res = await (request as any).del(PERMISSION_ENDPOINTS.DELETE(id))
    
    if (res?.success) {
      ElMessage.success('删除权限成功')
      return true
    } else {
      ElMessage.error(res?.message || '删除权限失败')
      return false
    }
  } catch (error) {
    console.error('删除权限失败:', error)
    ElMessage.error('删除权限失败')
    return false
  }
}

// 事件处理方法
const handleSearch = (): void => {
  pagination.value.page = 1
  pagination.value.currentPage = 1
  fetchPermissionList()
}

const resetSearch = (): void => {
  searchForm.value = {
    name: '',
    code: '',
    type: undefined
  }
  pagination.value.page = 1
  pagination.value.currentPage = 1
  fetchPermissionList()
}

const handleSelectionChange = (selection: Permission[]): void => {
  selectedPermissions.value = selection
}

const handleSizeChange = (size: number): void => {
  pagination.value.pageSize = size
  pagination.value.page = 1
  pagination.value.currentPage = 1
  fetchPermissionList()
}

const handleCurrentChange = (page: number): void => {
  pagination.value.page = page
  pagination.value.currentPage = page
  fetchPermissionList()
}

const openPermissionDialog = (permission?: Permission): void => {
  if (permission) {
    editingPermission.value = { ...permission }
  } else {
    editingPermission.value = {
      name: '',
  code: '',
  type: 'menu',
  path: '',
  component: '',
  icon: '',
  sort: 0,
  status: 1
    }
  }
  permissionDialogVisible.value = true
  
  nextTick(() => {
    permissionFormRef.value?.clearValidate()
  })
}

const savePermission = async (): Promise<void> => {
  if (!permissionFormRef.value) return
  
  try {
    const valid = await permissionFormRef.value.validate()
    if (!valid) return
    
    saving.value = true
    
    let success = false
    if (editingPermission.value.id) {
      success = await updatePermission(editingPermission.value.id, editingPermission.value)
    } else {
      success = await createPermission(editingPermission.value)
    }
    
    if (success) {
      permissionDialogVisible.value = false
      await fetchPermissionList()
    }
  } catch (error) {
    console.error('保存权限失败:', error)
    ElMessage.error('保存权限失败')
  } finally {
    saving.value = false
  }
}

const updatePermissionStatus = async (permission: Permission, status: number): Promise<void> => {
  try {
    const action = status === 1 ? '启用' : '禁用'
    await ElMessageBox.confirm(`确定要${action}权限"${permission.name}"吗？`, '确认操作', {
      type: 'warning'
    })
    
    const success = await updatePermission(permission.id!, { ...permission, status })
    if (success) {
      await fetchPermissionList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新权限状态失败:', error)
      ElMessage.error('更新权限状态失败')
    }
  }
}

const deletePermission = async (permission: Permission): Promise<void> => {
  try {
    await ElMessageBox.confirm(`确定要删除权限"${permission.name}"吗？`, '确认删除', {
      type: 'warning'
    })
    
    const success = await deletePermissionById(permission.id!)
    if (success) {
      await fetchPermissionList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除权限失败:', error)
      ElMessage.error('删除权限失败')
    }
  }
}

const batchDeletePermissions = async (): Promise<void> => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedPermissions.value.length} 个权限吗？`, '确认批量删除', {
      type: 'warning'
    })
    
    const deletePromises = selectedPermissions.value.map(permission => 
      deletePermissionById(permission.id!)
    )
    
    await Promise.all(deletePromises)
    await fetchPermissionList()
    selectedPermissions.value = []
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除权限失败:', error)
      ElMessage.error('批量删除权限失败')
    }
  }
}

// 缺失的方法定义
const handleCreate = () => {
  editingPermission.value = {
    name: '',
    code: '',
    type: 'menu',
    path: '',
    component: '',
    icon: '',
    sort: 0,
    status: 1
  }
  permissionDialogVisible.value = true
}

const loadPermissions = () => {
  fetchPermissionList()
}

// 初始化
onMounted(() => {
  fetchPermissionList()
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

// 页面特定样式
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md) 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .card {
    .card-header {
      flex-direction: column;
      gap: var(--spacing-md);
      align-items: flex-start;
      
      .card-actions {
        width: 100%;
        justify-content: flex-start;
        
        .el-button {
          flex: 1;
        }
      }
    }
  }
  
  :deep(.el-table) {
    .el-table__body-wrapper {
      overflow-x: auto;
    }
  }
  
  :deep(.permission-dialog) {
    .el-dialog {
      margin: 5vh auto !important;
    }
    
    .el-dialog__body {
      padding: var(--spacing-md);
    }
    
    .el-form {
      .el-row {
        .el-col {
          margin-bottom: var(--spacing-sm);
        }
      }
    }
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .card {
    .card-header {
      .card-actions {
        flex-direction: column;
        
        .el-button {
          width: 100%;
        }
      }
    }
  }
  
  :deep(.permission-dialog) {
    .el-dialog {
      width: 95% !important;
      margin: 3vh auto !important;
    }
  }
}
</style> 