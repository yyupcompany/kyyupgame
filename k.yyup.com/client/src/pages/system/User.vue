<template>
  <div class="page-container">
    <!-- 搜索区域 - 优化移动端布局 -->
    <div class="app-card search-section">
      <div class="app-card-content">
        <el-form :model="searchForm" label-width="80px" class="search-form">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="用户名">
                <el-input 
                  v-model="searchForm.username" 
                  placeholder="请输入用户名" 
                  clearable 
                  class="search-input"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="角色">
                <el-select 
                  v-model="searchForm.roleId" 
                  placeholder="请选择角色" 
                  clearable
                  class="search-select"
                >
                  <el-option 
                    v-for="item in roleOptions" 
                    :key="item.id" 
                    :label="item.name" 
                    :value="item.id" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="状态">
                <el-select 
                  v-model="searchForm.status" 
                  placeholder="请选择状态" 
                  clearable
                  class="search-select"
                >
                  <el-option label="启用" value="active" />
                  <el-option label="禁用" value="inactive" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label=" " class="search-actions">
                <div class="action-buttons">
                  <el-button type="primary" @click="handleSearch" :loading="loading" class="search-btn">
                    <UnifiedIcon name="Search" />
                    <span class="btn-text">搜索</span>
                  </el-button>
                  <el-button @click="resetSearch" class="reset-btn">
                    <UnifiedIcon name="Refresh" />
                    <span class="btn-text">重置</span>
                  </el-button>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>
    
    <!-- 用户列表 -->
    <div class="app-card">
      <div class="app-card-header">
        <div class="app-card-title">用户列表</div>
        <div class="card-actions">
          <el-button type="primary" @click="openUserDialog()">
            <UnifiedIcon name="Plus" />
            新增用户
          </el-button>
          <el-button 
            type="danger" 
            :disabled="selectedUsers.length === 0" 
            @click="batchDeleteUsers"
          >
            <UnifiedIcon name="Delete" />
            批量删除
          </el-button>
        </div>
      </div>
      <div class="card-content">
        <!-- 表格容器 - 固定高度防止布局偏移 -->
        <div class="table-container" :style="{ minHeight: '400px' }">
          <!-- 加载状态骨架屏 -->
          <div v-if="loading" class="table-skeleton">
            <div class="skeleton-row" v-for="i in 10" :key="i">
              <div class="skeleton-cell" v-for="j in 7" :key="j"></div>
            </div>
          </div>
          
          <!-- API错误状态 -->
          <EmptyState
            v-if="hasApiError && userList.length === 0"
            type="error"
            title="数据加载失败"
            :description="apiErrorMessage || '用户数据加载时发生错误，请稍后重试'"
            size="medium"
            :primary-action="{
              text: loading ? '重试中...' : '重试',
              type: 'primary',
              loading: loading,
              handler: fetchUserList
            }"
            :secondary-action="{
              text: '联系管理员',
              handler: () => ElMessage.info('请联系系统管理员检查服务配置')
            }"
            :suggestions="[
              '检查网络连接是否正常',
              '确认服务器状态是否正常',
              '联系系统管理员检查服务配置'
            ]"
            :show-suggestions="true"
          />

          <!-- 空数据状态 -->
          <EmptyState
            v-else-if="!hasApiError && userList.length === 0 && !loading"
            type="no-data"
            title="暂无用户数据"
            description="还没有创建任何用户，立即创建第一个用户吧！"
            size="medium"
            :primary-action="{
              text: '新增用户',
              type: 'primary',
              handler: () => openUserDialog()
            }"
            :suggestions="[
              '点击新增用户按钮开始创建',
              '从Excel导入用户数据',
              '联系管理员获取帮助'
            ]"
            :show-suggestions="true"
          >
            <template #icon>
              <div class="empty-icon">👥</div>
            </template>
          </EmptyState>
          
          <!-- 用户表格 -->
          <div class="table-wrapper" v-if="!loading || userList.length > 0">
        <el-table class="responsive-table user-table"
            :data="userList"
            style="width: 100%"
            border
            stripe
            @selection-change="handleSelectionChange"
            :height="350"
            :table-layout="'fixed'"
          >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="username" label="用户名" width="160">
            <template #default="scope">
              <div class="user-info">
                <div class="user-avatar">
                  {{ scope.row.realName ? scope.row.realName.charAt(0).toUpperCase() : scope.row.username.charAt(0).toUpperCase() }}
                </div>
                <div class="user-details">
                  <div class="username-display">{{ scope.row.username }}</div>
                  <div class="realname-display">{{ scope.row.realName || '-' }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="email" label="邮箱" width="220" show-overflow-tooltip>
            <template #default="scope">
              <div class="email-cell">
                <span class="email-text">{{ scope.row.email || '-' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="手机号" width="120">
            <template #default="scope">
              <span>{{ scope.row.phone || scope.row.mobile || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="roles" label="角色" width="100">
            <template #default="scope">
              <div class="role-tags">
                <template v-if="scope.row.roles && Array.isArray(scope.row.roles) && scope.row.roles.length > 0">
                  <el-tag
                    v-for="role in scope.row.roles"
                    :key="role.id"
                    size="small"
                    class="role-tag"
                  >
                    {{ role.name }}
                  </el-tag>
                </template>
                <span v-else class="text-muted">未分配</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="最后登录" width="120">
            <template #default="scope">
              <span class="login-time">{{ scope.row.lastLoginTime || scope.row.lastLoginAt || '从未登录' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
              <span class="status-tag" :class="scope.row.status === 'active' ? 'status-active' : 'status-inactive'">
                {{ scope.row.status === 'active' ? '启用' : '禁用' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="240" align="center" fixed="right">
            <template #default="scope">
              <div class="operation-buttons">
                <div class="primary-actions">
                  <el-button
                    v-if="scope.row.status === 'active'"
                    type="warning"
                    size="small"
                    class="operation-btn"
                    @click="updateUserStatus(scope.row, 'inactive')"
                  >
                    <UnifiedIcon name="default" />
                    <span class="btn-text">禁用</span>
                  </el-button>
                  <el-button
                    v-else
                    type="success"
                    size="small"
                    class="operation-btn"
                    @click="updateUserStatus(scope.row, 'active')"
                  >
                    <UnifiedIcon name="default" />
                    <span class="btn-text">启用</span>
                  </el-button>
                  <el-button
                    type="primary"
                    size="small"
                    class="operation-btn"
                    @click="openUserDialog(scope.row)"
                  >
                    <UnifiedIcon name="Edit" />
                    <span class="btn-text">编辑</span>
                  </el-button>
                </div>
                <div class="secondary-actions">
                  <el-dropdown trigger="click">
                    <el-button size="small" type="info" class="dropdown-btn">
                      更多<UnifiedIcon name="ArrowDown" />
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="viewUserLogs(scope.row)">
                          <UnifiedIcon name="default" />
                          查看日志
                        </el-dropdown-item>
                        <el-dropdown-item divided @click="deleteUser(scope.row)">
                          <UnifiedIcon name="Delete" />
                          删除用户
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
            </template>
          </el-table-column>
          </el-table>
</div>
        </div>
        
        <!-- 分页组件 - 固定高度防止布局偏移 -->
        <div class="pagination-container">
          <div v-if="userList.length > 0">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalUsers"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 用户编辑对话框 - 深度UX优化 -->
    <el-dialog
      v-model="userDialogVisible"
      :title="editingUser.id ? '编辑用户' : '新增用户'"
      :width="isDesktop ? '650px' : '95%'"
      :close-on-click-modal="false"
      class="user-form-dialog"
    >
      <el-form
        :model="editingUser"
        :rules="userRules"
        ref="userFormRef"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input 
                v-model="editingUser.username" 
                placeholder="请输入用户名" 
                :disabled="!!editingUser.id" 
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="realName">
              <el-input v-model="editingUser.realName" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="editingUser.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="mobile">
              <el-input v-model="editingUser.mobile" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="角色" prop="roleIds">
          <el-select
            v-model="editingUser.roleIds"
            multiple
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="item in roleOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-row :gutter="20" v-if="!editingUser.id">
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="editingUser.password"
                type="password"
                placeholder="请输入密码"
                show-password
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="editingUser.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="状态">
          <el-radio-group v-model="editingUser.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input
            v-model="editingUser.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="userDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveUser" :loading="saving">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 用户日志对话框 -->
    <el-dialog
      v-model="userLogDialogVisible"
      title="用户操作日志"
      width="80%"
    >
      <el-table class="responsive-table" :data="userLogs" style="width: 100%" border stripe>
        <el-table-column prop="time" label="操作时间" width="180" />
        <el-table-column prop="module" label="操作模块" width="120" />
        <el-table-column prop="action" label="操作内容" width="200" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="logCurrentPage"
          v-model:page-size="logPageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalUserLogs"
          @size-change="handleLogSizeChange"
          @current-change="handleLogCurrentChange"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 1. Vue 相关导入
import { ref, computed, onMounted } from 'vue'

// 2. Element Plus 导入
import type { FormInstance, FormRules } from 'element-plus'

// 组件导入
import EmptyState from '@/components/common/EmptyState.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, Refresh, Plus, Delete, Lock, Unlock, 
  Edit, Document, ArrowDown
} from '@element-plus/icons-vue'

// 3. 公共工具函数导入
import { request } from '../../utils/request'
import { formatDate } from '../../utils/dateFormat'

// 解构request实例中的方法
const { get, post, put, del } = request

// 响应式计算属性
const isDesktop = computed(() => {
  if (typeof window !== 'undefined') {
    return window.innerWidth >= 768
  }
  return true
})

// 定义统一API响应类型
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

// 4. API 导入
import { 
  getUsers, 
  getUserDetail, 
  createUser, 
  updateUser, 
  deleteUser as deleteUserApi, 
  updateUserStatus as updateUserStatusApi,
  getRoles,
  UserStatus
} from '../../api/modules/system'

// 4. 页面内部类型定义
interface User {
  id: string;
  username: string
  realName: string;
  email: string;
  mobile: string;
  status: 'active' | 'inactive';
  roles: RoleOption[]
  lastLoginTime: string;
  remark: string
}

interface RoleOption {
  id: string;
  name: string
}

interface UserSearchForm {
  username: string
  realName: string;
  mobile: string;
  email: string
  roleId: string;
  status: string
}

interface EditingUser {
  id: string | null;
  username: string
  password?: string
  confirmPassword?: string
  realName: string;
  email: string;
  mobile: string;
  status: 'active' | 'inactive'
  roleIds: string[];
  remark: string
}

interface UserPayload {
  username: string
  realName: string;
  email: string;
  mobile: string;
  status: 'active' | 'inactive'
  roleIds: string[];
  remark: string
  password?: string
}

interface UserLog {
  id: string
  userId: string;
  action: string;
  ip: string
  userAgent: string
  createdAt: string;
  time: string;
  module: string;
  status: string
}

interface PaginationParams {
  page: number
  pageSize: number
  username?: string
  roleId?: string
  status?: string
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number
  pageSize: number
}

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const hasApiError = ref(false)
const apiErrorMessage = ref('')

// 用户列表数据
const userList = ref<User[]>([])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const totalUsers = ref(0)

// 搜索表单
const searchForm = ref<UserSearchForm>({
  username: '',
  realName: '',
  mobile: '',
  email: '',
  roleId: '',
  status: ''
})

// 角色选项
const roleOptions = ref<RoleOption[]>([])

// 选中的用户
const selectedUsers = ref<User[]>([])

// 用户编辑对话框
const userDialogVisible = ref(false)
const userFormRef = ref<FormInstance | null>(null)

// 用户表单验证规则
const userRules = ref<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  mobile: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== editingUser.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
  trigger: 'blur'
    }
  ]
})

// 编辑中的用户
const editingUser = ref<EditingUser>({
  id: null,
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  email: '',
  mobile: '',
  status: 'active',
  roleIds: [],
  remark: ''
})

// 用户日志相关
const userLogDialogVisible = ref(false)
const currentUser = ref<User | null>(null)
const userLogs = ref<UserLog[]>([])
const logCurrentPage = ref(1)
const logPageSize = ref(10)
const totalUserLogs = ref(0)

// handleCreate 和 loadUsers 方法定义
const handleCreate = () => {
  openUserDialog()
}

const loadUsers = () => {
  fetchUserList()
}

// 方法
const fetchUserList = async (): Promise<void> => {
  try {
    loading.value = true
    hasApiError.value = false
    apiErrorMessage.value = ''
    
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      username: searchForm.value.username || undefined,
      roleId: searchForm.value.roleId || undefined,
      status: searchForm.value.status || undefined
    }
    
    const res = await getUsers(params)

    // 修复条件判断：检查响应是否包含有效数据
    if (res && (res.code === 200 || res.success || (res.items && Array.isArray(res.items)))) {
      // 安全处理API响应数据
      const responseData = res.data || res
      userList.value = Array.isArray(responseData.items) ? responseData.items :
                      Array.isArray(responseData) ? responseData : []
      totalUsers.value = responseData.total || userList.value.length || 0

      // 清除错误状态
      hasApiError.value = false
    } else {
      // API返回错误状态
      const errorMsg = res?.message || res?.error?.message || '获取用户列表失败'
      hasApiError.value = true
      apiErrorMessage.value = errorMsg
      userList.value = []
      totalUsers.value = 0
      console.error('用户API错误:', errorMsg)
    }
  } catch (error: any) {
    console.error('获取用户列表失败:', error)
    
    // 网络或其他错误
    hasApiError.value = true
    apiErrorMessage.value = error?.response?.data?.message || error?.message || '网络连接失败，请检查网络或稍后重试'
    userList.value = []
    totalUsers.value = 0
  } finally {
    loading.value = false
  }
}


// 获取角色列表
const fetchRoleList = async (): Promise<void> => {
  try {
    const res = await getRoles()
    if (res && (res.code === 200 || res.success)) {
      // 安全处理角色数据
      const responseData = res.data || {}
      roleOptions.value = Array.isArray(responseData.items) ? responseData.items :
                         Array.isArray(responseData) ? responseData : []
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
    roleOptions.value = []
  }
}

// 搜索
const handleSearch = (): void => {
  currentPage.value = 1
  fetchUserList()
}

// 重置搜索
const resetSearch = (): void => {
  searchForm.value.username = ''
  searchForm.value.realName = ''
  searchForm.value.mobile = ''
  searchForm.value.email = ''
  searchForm.value.roleId = ''
  searchForm.value.status = ''
  currentPage.value = 1
  fetchUserList()
}

// 分页处理
const handleSizeChange = (val: number): void => {
  pageSize.value = val
  currentPage.value = 1
  fetchUserList()
}

const handleCurrentChange = (val: number): void => {
  currentPage.value = val
  fetchUserList()
}

// 选择变化
const handleSelectionChange = (val: User[]): void => {
  selectedUsers.value = val
}

// 打开用户对话框
const openUserDialog = (user?: User): void => {
  if (user) {
    // 编辑用户
    editingUser.value.id = user.id
    editingUser.value.username = user.username
    editingUser.value.realName = user.realName
    editingUser.value.email = user.email
    editingUser.value.mobile = user.mobile
    editingUser.value.status = user.status
    editingUser.value.roleIds = user.roles && Array.isArray(user.roles) 
      ? user.roles.map(role => role.id) 
      : []
    editingUser.value.remark = user.remark
    editingUser.value.password = ''
    editingUser.value.confirmPassword = ''
  } else {
    // 新增用户
    editingUser.value.id = null
    editingUser.value.username = ''
    editingUser.value.realName = ''
    editingUser.value.email = ''
    editingUser.value.mobile = ''
    editingUser.value.status = 'active'
    editingUser.value.roleIds = []
    editingUser.value.remark = ''
    editingUser.value.password = ''
    editingUser.value.confirmPassword = ''
  }
  userDialogVisible.value = true
}

// 保存用户
const saveUser = async (): Promise<void> => {
  if (!userFormRef.value) return
  
  try {
    await userFormRef.value.validate()
    saving.value = true
    
    const payload: UserPayload = {
      username: editingUser.value.username,
      realName: editingUser.value.realName,
  email: editingUser.value.email,
  mobile: editingUser.value.mobile,
  status: editingUser.value.status,
      roleIds: editingUser.value.roleIds,
  remark: editingUser.value.remark
    }
    
    if (!editingUser.value.id) {
      payload.password = editingUser.value.password
    }
    
    let res
    if (editingUser.value.id) {
      res = await updateUser(editingUser.value.id, payload)
    } else {
      res = await createUser(payload)
    }
    
    if (res.code === 200 || res.success) {
      ElMessage.success(editingUser.value.id ? '更新用户成功' : '创建用户成功')
      userDialogVisible.value = false
      fetchUserList()
    } else {
      ElMessage.error(res.message || '保存用户失败')
    }
  } catch (error) {
    console.error('保存用户失败:', error)
    ElMessage.error('保存用户失败')
  } finally {
    saving.value = false
  }
}

// 更新用户状态
const updateUserStatus = async (user: User, status: 'active' | 'inactive'): Promise<void> => {
  try {
    const apiStatus = status === 'active' ? UserStatus.ACTIVE : UserStatus.INACTIVE
    const res = await updateUserStatusApi(user.id, apiStatus)
    if (res.code === 200 || res.success) {
      ElMessage.success(`${status === 'active' ? '启用' : '禁用'}用户成功`)
      fetchUserList()
    } else {
      ElMessage.error(res.message || '更新用户状态失败')
    }
  } catch (error) {
    console.error('更新用户状态失败:', error)
    ElMessage.error('更新用户状态失败')
  }
}

// 删除用户
const deleteUser = async (user: User): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.username}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
  type: 'warning'
      }
    )
    
    const res = await deleteUserApi(user.id)
    if (res.code === 200 || res.success) {
      ElMessage.success('删除用户成功')
      fetchUserList()
    } else {
      ElMessage.error(res.message || '删除用户失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error('删除用户失败')
    }
  }
}

// 批量删除用户
const batchDeleteUsers = async (): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
  type: 'warning'
      }
    )
    
    const promises = selectedUsers.value && Array.isArray(selectedUsers.value) 
      ? selectedUsers.value.map(user => deleteUserApi(user.id))
      : []
    await Promise.all(promises)
    
    ElMessage.success('批量删除用户成功')
    fetchUserList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除用户失败:', error)
      ElMessage.error('批量删除用户失败')
    }
  }
}

// 查看用户日志
const viewUserLogs = async (user: User): Promise<void> => {
  currentUser.value = user
  userLogDialogVisible.value = true
  await fetchUserLogs()
}

// 获取用户日志
const fetchUserLogs = async (): Promise<void> => {
  if (!currentUser.value) return
  
  try {
    // 调用获取用户日志的API
    // const res = await getUserLogs(currentUser.value.id, {
    //   page: logCurrentPage.value,
    //   pageSize: logPageSize.value
    // })
    
    // 暂时返回空数据，等待实际API实现
    userLogs.value = []
    totalUserLogs.value = 0
    
    // 提示用户功能暂未实现
    ElMessage.info('用户日志功能正在开发中')
  } catch (error) {
    console.error('获取用户日志失败:', error)
    ElMessage.error('获取用户日志失败')
    userLogs.value = []
    totalUserLogs.value = 0
  }
}

// 日志分页处理
const handleLogSizeChange = (val: number): void => {
  logPageSize.value = val
  logCurrentPage.value = 1
  fetchUserLogs()
}

const handleLogCurrentChange = (val: number): void => {
  logCurrentPage.value = val
  fetchUserLogs()
}

// 初始化
onMounted(() => {
  // 预设加载状态防止布局偏移
  loading.value = true
  fetchUserList()
  fetchRoleList()
})
</script>

<style scoped lang="scss">
/* 用户管理页面特定样式 - 使用全局组件样式架构 */

/* 分页容器固定高度防止CLS */
.pagination-container {
  min-height: 60px; height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: var(--spacing-lg);
  contain: layout;
}

/* 表格容器性能优化 */
.table-container {
  position: relative;
  transition: all var(--transition-base);
  contain: layout;
}

/* 操作按钮优化样式 */
.operation-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  justify-content: center;
  
  .primary-actions {
    display: flex;
    gap: var(--spacing-xs);
    align-items: center;
  }
  
  .secondary-actions {
    display: flex;
    align-items: center;
  }
  
  .operation-btn {
    min-width: auto;
    padding: var(--spacing-xs) var(--spacing-sm);
    
    .btn-text {
      margin-left: var(--spacing-xs);
    }
  }
  
  .dropdown-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    min-width: auto;
  }
}

/* 用户信息显示优化 */
.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  .user-avatar {
    width: var(--size-avatar-sm);
    height: var(--size-avatar-sm);
    border-radius: var(--radius-full);
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: var(--font-semibold);
    font-size: var(--text-sm);
    flex-shrink: 0;
  }

  .user-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;

    .username-display {
      font-weight: var(--font-semibold);
      font-size: var(--text-sm);
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .realname-display {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

/* 邮箱显示优化 */
.email-cell {
  .email-text {
    font-size: var(--text-xs);
    color: var(--text-primary);
    word-break: break-all;
    line-height: 1.2;
  }
}

/* 角色标签优化 */
.role-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  
  .role-tag {
    margin: 0;
    font-size: var(--text-xs);
  }
}

/* 登录时间显示优化 */
.login-time {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  white-space: nowrap;
}

/* 响应式适配 */
@media (max-width: var(--breakpoint-md)) {
  .page-container {
    gap: var(--spacing-lg);
  }
  
  .app-card {
    .app-card-header {
      flex-direction: column;
      gap: var(--spacing-lg);
      align-items: flex-start;
      
      .card-actions {
        width: 100%;
        justify-content: flex-start;
      }
    }
    
    .app-card-content {
      padding: var(--spacing-lg);
    }
  }
  
  .pagination-container {
    justify-content: center;
  }
  
  /* 移动端操作按钮优化 */
  .operation-buttons {
    flex-direction: column;
    gap: var(--spacing-xs);
    
    .primary-actions {
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .operation-btn .btn-text {
      display: none;
    }
    
    .dropdown-btn {
      min-width: auto;
    }
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .app-card {
    .app-card-header {
      .card-actions {
        flex-direction: column;
        width: 100%;
      }
    }
  }
  
  :deep(.el-table__body-wrapper) {
    overflow-x: auto;
  }
  
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto !important;
  }
}
</style>