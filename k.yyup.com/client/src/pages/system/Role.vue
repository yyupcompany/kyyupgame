<template>
  <div class="page-container">
    <!-- 搜索区域 - 优化移动端布局 -->
    <div class="card filter-card">
      <div class="card-body">
        <el-form :model="searchForm" label-width="80px" class="filter-form">
          <div class="filter-group">
            <el-form-item label="角色名称">
              <el-input 
                v-model="searchForm.name" 
                placeholder="请输入角色名称" 
                clearable 
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="角色编码">
              <el-input 
                v-model="searchForm.code" 
                placeholder="请输入角色编码" 
                clearable 
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select 
                v-model="searchForm.status" 
                placeholder="请选择状态" 
                clearable
              >
                <el-option label="启用" :value="1" />
                <el-option label="禁用" :value="0" />
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
    
    <!-- 角色列表区域 -->
    <div class="card table-card">
      <div class="card-header">
        <h3 class="card-title">角色列表</h3>
        <div class="card-actions">
          <el-button type="primary" @click="openRoleDialog()">
            <UnifiedIcon name="Plus" />
            新增角色
          </el-button>
          <el-button 
            type="danger" 
            :disabled="selectedRoles.length === 0" 
            @click="batchDeleteRoles"
          >
            <UnifiedIcon name="Delete" />
            批量删除
          </el-button>
        </div>
      </div>
      
      <div class="card-body">
        <!-- 表格容器 - 固定最小高度防止布局偏移 -->
        <div class="table-container" style="min-min-height: 60px; height: auto;">
          <!-- Loading 骨架屏 -->
          <div v-if="loading" class="table-skeleton">
            <div class="skeleton-header">
              <div class="skeleton-cell" style="width: 8%;"></div>
              <div class="skeleton-cell" style="width: 15%;"></div>
              <div class="skeleton-cell" style="width: 15%;"></div>
              <div class="skeleton-cell" style="width: 25%;"></div>
              <div class="skeleton-cell" style="width: 12%;"></div>
              <div class="skeleton-cell" style="width: 15%;"></div>
              <div class="skeleton-cell" style="width: 10%;"></div>
            </div>
            <div class="skeleton-row" v-for="i in 8" :key="i">
              <div class="skeleton-cell" style="width: 8%;"></div>
              <div class="skeleton-cell" style="width: 15%;"></div>
              <div class="skeleton-cell" style="width: 15%;"></div>
              <div class="skeleton-cell" style="width: 25%;"></div>
              <div class="skeleton-cell" style="width: 12%;"></div>
              <div class="skeleton-cell" style="width: 15%;"></div>
              <div class="skeleton-cell" style="width: 10%;"></div>
            </div>
          </div>
          
          <!-- 空状态处理 -->
          <EmptyState 
            v-else-if="roleList.length === 0"
            type="no-data"
            title="暂无角色数据"
            description="还没有创建任何角色，立即创建第一个角色吧！"
            :primary-action="{
              text: '新增角色',
              handler: () => openRoleDialog()
            }"
            :secondary-action="{
              text: '刷新数据',
              handler: fetchRoleList
            }"
            :suggestions="[
              '检查网络连接是否正常',
              '确认是否有相关数据',
              '联系管理员获取帮助'
            ]"
            :show-suggestions="true"
          />
          
          <div class="table-wrapper" v-if="!loading || roleList.length > 0">
        <el-table class="responsive-table"
            :data="roleList"
            style="width: 100%"
            border
            stripe
            @selection-change="handleSelectionChange"
          >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="角色名称" width="150" show-overflow-tooltip />
          <el-table-column prop="code" label="角色编码" width="150" show-overflow-tooltip />
          <el-table-column prop="description" label="角色描述" width="200" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="180" />
          <el-table-column label="操作" width="280" align="center" :fixed="isDesktop ? 'right' : false">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                text
                @click="openRoleDialog(scope.row)"
              >
                <UnifiedIcon name="Edit" />
                编辑
              </el-button>
              <el-button
                v-if="scope.row.status === 1"
                type="warning"
                size="small"
                text
                @click="updateRoleStatus(scope.row, 0)"
              >
                <UnifiedIcon name="default" />
                禁用
              </el-button>
              <el-button
                v-else
                type="success"
                size="small"
                text
                @click="updateRoleStatus(scope.row, 1)"
              >
                <UnifiedIcon name="default" />
                启用
              </el-button>
              <el-button
                type="danger"
                size="small"
                text
                @click="deleteRole(scope.row)"
              >
                <UnifiedIcon name="Delete" />
                删除
              </el-button>
            </template>
          </el-table-column>
          </el-table>
</div>
        </div>
        
        <!-- 分页组件 - 固定高度防止布局偏移 -->
        <div class="pagination-container" style="min-min-height: 60px; height: auto; display: flex; justify-content: flex-end; align-items: center;">
          <el-pagination
            v-if="!loading && roleList.length > 0"
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
          <!-- 占位符，保持布局稳定 -->
          <div v-else style="height: var(--spacing-3xl);"></div>
        </div>
      </div>
    </div>
    
    <!-- 角色编辑对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      :title="editingRole.id ? '编辑角色' : '新增角色'"
      :width="isDesktop ? '650px' : '95%'"
      :close-on-click-modal="false"
      class="role-dialog"
      :destroy-on-close="true"
    >
      <el-form
        :model="editingRole"
        :rules="roleRules"
        ref="roleFormRef"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="角色名称" prop="name">
              <el-input v-model="editingRole.name" placeholder="请输入角色名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色编码" prop="code">
              <el-input 
                v-model="editingRole.code" 
                placeholder="请输入角色编码" 
                :disabled="!!editingRole.id" 
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="editingRole.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-radio-group v-model="editingRole.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRole" :loading="saving">
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
import { useRoute } from 'vue-router'

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
import { request } from '../../utils/request'
import { SYSTEM_ENDPOINTS } from '@/api/endpoints'

// 4. 路由实例
const route = useRoute()

// 4. 页面内部类型定义
interface Role {
  id?: number;
  name: string;
  code: string;
  description: string;
  status: number;
  created_at?: string;
  updated_at?: string;
}

interface SearchForm {
  name: string;
  code: string;
  status: number | undefined;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  code?: number;
  items?: T[];
  total?: number;
}

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const roleDialogVisible = ref(false)
const selectedRoles = ref<Role[]>([])
const roleList = ref<Role[]>([])

// 搜索表单
const searchForm = ref<SearchForm>({
  name: '',
  code: '',
  status: undefined
})

// 分页数据
const pagination = ref<Pagination>({
  page: 1,
  pageSize: 20,
  total: 0
})

// 编辑角色数据
const editingRole = ref<Role>({
  name: '',
  code: '',
  description: '',
  status: 1
})

// 表单引用
const roleFormRef = ref<FormInstance | null>(null)

// 响应式计算属性
const isDesktop = computed(() => {
  if (typeof window !== 'undefined') {
    return window.innerWidth >= 768
  }
  return true
})


// 表单验证规则
const roleRules: FormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '角色名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { min: 2, max: 50, message: '角色编码长度在 2 到 50 个字符', trigger: 'blur' },
    { pattern: /^[A-Z_]+$/, message: '角色编码只能包含大写字母和下划线', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '角色描述不能超过 200 个字符', trigger: 'blur' }
  ]
}

// API方法
const fetchRoleList = async (): Promise<void> => {
  try {
    loading.value = true
    
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
  name: searchForm.value.name || undefined,
  code: searchForm.value.code || undefined,
  status: searchForm.value.status || undefined
    }
    
    const res = await (request as any).get(SYSTEM_ENDPOINTS.ROLES, params)
    
    if (res.success) {
      roleList.value = (res.data as any)?.items || (res.data as any) || []
      pagination.value.total = (res.data as any)?.total || 0
    } else {
      ElMessage.error(res.message || '获取角色列表失败')
    }
  } catch (error: any) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

const createRole = async (roleData: Role): Promise<boolean> => {
  try {
    const res = await request.post(SYSTEM_ENDPOINTS.ROLES, roleData)
    
    if (res.success) {
      ElMessage.success('创建角色成功')
      return true
    } else {
      ElMessage.error(res.message || '创建角色失败')
      return false
    }
  } catch (error) {
    console.error('创建角色失败:', error)
    ElMessage.error('创建角色失败')
    return false
  }
}

const updateRole = async (id: number, roleData: Role): Promise<boolean> => {
  try {
    const res = await request.put(`${SYSTEM_ENDPOINTS.ROLES}/${id}`, roleData)
    
    if (res.success) {
      ElMessage.success('更新角色成功')
      return true
    } else {
      ElMessage.error(res.message || '更新角色失败')
      return false
    }
  } catch (error) {
    console.error('更新角色失败:', error)
    ElMessage.error('更新角色失败')
    return false
  }
}

const deleteRoleById = async (id: number): Promise<boolean> => {
  try {
    const res = await request.del(`${SYSTEM_ENDPOINTS.ROLES}/${id}`)
    
    if (res.success) {
      ElMessage.success('删除角色成功')
      return true
    } else {
      ElMessage.error(res.message || '删除角色失败')
      return false
    }
  } catch (error) {
    console.error('删除角色失败:', error)
    ElMessage.error('删除角色失败')
    return false
  }
}

// 事件处理方法
const handleSearch = (): void => {
  pagination.value.page = 1
  fetchRoleList()
}

const resetSearch = (): void => {
  searchForm.value = {
    name: '',
  code: '',
  status: undefined
  }
  pagination.value.page = 1
  fetchRoleList()
}

const handleSizeChange = (size: number): void => {
  pagination.value.pageSize = size
  pagination.value.page = 1
  fetchRoleList()
}

const handleCurrentChange = (page: number): void => {
  pagination.value.page = page
  fetchRoleList()
}

const handleSelectionChange = (selection: Role[]): void => {
  selectedRoles.value = selection
}

const openRoleDialog = (role?: Role): void => {
  if (role) {
    editingRole.value = { ...role }
  } else {
    editingRole.value = {
      name: '',
  code: '',
  description: '',
  status: 1
    }
  }
  roleDialogVisible.value = true
  
  nextTick(() => {
    roleFormRef.value?.clearValidate()
  })
}

const saveRole = async (): Promise<void> => {
  if (!roleFormRef.value) return
  
  try {
    const valid = await roleFormRef.value.validate()
    if (!valid) return
    
    saving.value = true
    
    let success = false
    if (editingRole.value.id) {
      success = await updateRole(editingRole.value.id, editingRole.value)
    } else {
      success = await createRole(editingRole.value)
    }
    
    if (success) {
      roleDialogVisible.value = false
      await fetchRoleList()
    }
  } catch (error) {
    console.error('保存角色失败:', error)
    ElMessage.error('保存角色失败')
  } finally {
    saving.value = false
  }
}

const updateRoleStatus = async (role: Role, status: number): Promise<void> => {
  try {
    const action = status === 1 ? '启用' : '禁用'
    await ElMessageBox.confirm(
      `确定要${action}角色"${role.name}"吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
  type: 'warning'
      }
    )
    
    const success = await updateRole(role.id!, { ...role, status })
    if (success) {
      await fetchRoleList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新角色状态失败:', error)
      ElMessage.error('更新角色状态失败')
    }
  }
}

const deleteRole = async (role: Role): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色"${role.name}"吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
  type: 'warning'
      }
    )
    
    const success = await deleteRoleById(role.id!)
    if (success) {
      await fetchRoleList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除角色失败:', error)
      ElMessage.error('删除角色失败')
    }
  }
}

const batchDeleteRoles = async (): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRoles.value.length} 个角色吗？此操作不可恢复！`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
  type: 'warning'
      }
    )
    
    const deletePromises = selectedRoles.value.map(role => deleteRoleById(role.id!))
    await Promise.all(deletePromises)
    
    selectedRoles.value = []
    await fetchRoleList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除角色失败:', error)
      ElMessage.error('批量删除角色失败')
    }
  }
}

// 初始化
onMounted(() => {
  fetchRoleList()
  
  // 检查URL参数，如果有action=create，自动打开创建对话框
  nextTick(() => {
    if (route.query.action === 'create') {
      openRoleDialog()
    }
  })
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

// 页面特定样式
.table-container {
  position: relative;
  display: flex;
  flex-direction: column;
  
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-min-height: 60px; height: auto;
  }
}

// 分页容器
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md) 0;
  min-min-height: 60px; height: auto;
  transition: opacity 0.3s ease;
  
  .el-pagination {
    min-height: var(--spacing-3xl);
  }
}

// 对话框样式
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
  
  :deep(.role-dialog) {
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
  
  :deep(.role-dialog) {
    .el-dialog {
      width: 95% !important;
      margin: 3vh auto !important;
    }
  }
}
</style> 