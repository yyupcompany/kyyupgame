<template>
  <div class="extension-config-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>分机配置管理</h3>
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            新增分机
          </el-button>
        </div>
      </template>

      <!-- 统计信息 -->
      <div class="stats-section">
        <el-row :gutter="20">
          <el-col :span="4">
            <el-statistic title="总分机数" :value="stats.total" />
          </el-col>
          <el-col :span="4">
            <el-statistic title="激活分机" :value="stats.active">
              <template #prefix>
                <el-icon style="color: var(--success-color)"><Check /></el-icon>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="4">
            <el-statistic title="在线分机" :value="stats.online">
              <template #prefix>
                <el-icon style="color: var(--success-color)"><Connection /></el-icon>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="4">
            <el-statistic title="通话中" :value="stats.inCall">
              <template #prefix>
                <el-icon style="color: var(--primary-color)"><Phone /></el-icon>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="4">
            <el-statistic title="忙碌分机" :value="stats.busy">
              <template #prefix>
                <el-icon style="color: var(--warning-color)"><Warning /></el-icon>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="4">
            <el-statistic title="离线分机" :value="stats.offline">
              <template #prefix>
                <el-icon style="color: var(--danger-color)"><Close /></el-icon>
              </template>
            </el-statistic>
          </el-col>
        </el-row>
      </div>

      <!-- 搜索和筛选 -->
      <div class="search-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="searchQuery"
              placeholder="搜索分机号、名称"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-select v-model="statusFilter" placeholder="状态筛选" clearable @change="handleSearch">
              <el-option label="全部" value="" />
              <el-option label="在线" value="online" />
              <el-option label="离线" value="offline" />
              <el-option label="忙碌" value="busy" />
              <el-option label="离开" value="away" />
              <el-option label="隐身" value="invisible" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="departmentFilter" placeholder="部门筛选" clearable @change="handleSearch">
              <el-option label="全部" value="" />
              <el-option label="招生部" value="招生部" />
              <el-option label="教学部" value="教学部" />
              <el-option label="客服部" value="客服部" />
              <el-option label="管理部" value="管理部" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="onlineFilter" placeholder="在线状态" clearable @change="handleSearch">
              <el-option label="全部" value="" />
              <el-option label="在线" :value="true" />
              <el-option label="离线" :value="false" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
            <el-button type="success" @click="handleRefresh">
              <el-icon><Refresh /></el-icon>
              刷新状态
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 分机列表 -->
      <el-table :data="extensionList" v-loading="loading" stripe>
        <el-table-column prop="extensionNumber" label="分机号" width="100" />
        <el-table-column prop="extensionName" label="分机名称" width="150" />
        <el-table-column prop="assignedUser?.realName" label="分配用户" width="120">
          <template #default="{ row }">
            {{ row.assignedUser?.realName || '未分配' }}
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" width="100" />
        <el-table-column prop="currentStatus" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.currentStatus)">
              {{ getStatusText(row.currentStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isOnline" label="在线状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isOnline ? 'success' : 'danger'">
              {{ row.isOnline ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="currentCalls" label="当前通话" width="100">
          <template #default="{ row }">
            <el-badge :value="row.currentCalls" :max="row.maxConcurrentCalls" type="primary">
              <span>{{ row.currentCalls }} / {{ row.maxConcurrentCalls }}</span>
            </el-badge>
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="启用状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.isActive"
              @change="handleToggleActive(row)"
              :loading="row.toggling"
            />
          </template>
        </el-table-column>
        <el-table-column prop="lastHeartbeatAt" label="最后心跳" width="160">
          <template #default="{ row }">
            {{ row.lastHeartbeatAt ? formatDateTime(row.lastHeartbeatAt) : '无心跳' }}
          </template>
        </el-table-column>
        <el-table-column prop="ipAddress" label="IP地址" width="140" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button
              size="small"
              type="warning"
              @click="handleHeartbeat(row)"
              v-if="!row.isOnline"
            >
              心跳
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑分机对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingExtension ? '编辑分机配置' : '新增分机配置'"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分机号" prop="extensionNumber">
              <el-input v-model="formData.extensionNumber" placeholder="请输入分机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分机名称" prop="extensionName">
              <el-input v-model="formData.extensionName" placeholder="请输入分机名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="主叫账号">
              <el-select v-model="formData.callerAccountId" placeholder="选择主叫账号（可选）" style="width: 100%" clearable>
                <el-option
                  v-for="account in callerAccounts"
                  :key="account.id"
                  :label="account.accountName"
                  :value="account.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分配用户">
              <el-select v-model="formData.assignedUserId" placeholder="选择用户（可选）" style="width: 100%" clearable filterable>
                <el-option
                  v-for="user in users"
                  :key="user.id"
                  :label="user.realName || user.username"
                  :value="user.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="部门">
              <el-select v-model="formData.department" placeholder="选择部门" style="width: 100%">
                <el-option label="招生部" value="招生部" />
                <el-option label="教学部" value="教学部" />
                <el-option label="客服部" value="客服部" />
                <el-option label="管理部" value="管理部" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="位置">
              <el-input v-model="formData.location" placeholder="请输入位置" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分机密码">
              <el-input v-model="formData.password" type="password" show-password placeholder="请输入分机密码" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="2"
            placeholder="请输入分机描述"
          />
        </el-form-item>

        <el-divider content-position="left">通话设置</el-divider>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="最大并发数">
              <el-input-number
                v-model="formData.maxConcurrentCalls"
                :min="1"
                :max="10"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="允许外呼">
              <el-switch v-model="formData.allowOutbound" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="允许呼入">
              <el-switch v-model="formData.allowInbound" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="通话录音">
              <el-switch v-model="formData.recordCalls" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="语音信箱">
              <el-switch v-model="formData.voicemailEnabled" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="启用状态">
              <el-switch v-model="formData.isActive" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="语音信箱邮箱" v-if="formData.voicemailEnabled">
          <el-input v-model="formData.voicemailEmail" placeholder="请输入语音信箱邮箱" />
        </el-form-item>

        <el-divider content-position="left">权限设置</el-divider>

        <el-form-item label="权限">
          <el-checkbox-group v-model="formData.permissions">
            <el-checkbox label="outbound_call">外呼权限</el-checkbox>
            <el-checkbox label="inbound_call">呼入权限</el-checkbox>
            <el-checkbox label="transfer_call">转接权限</el-checkbox>
            <el-checkbox label="conference_call">会议权限</el-checkbox>
            <el-checkbox label="record_call">录音权限</el-checkbox>
            <el-checkbox label="monitor_call">监听权限</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ editingExtension ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="showViewDialog"
      title="分机配置详情"
      width="900px"
    >
      <el-descriptions :column="2" border v-if="viewingExtension">
        <el-descriptions-item label="分机号">{{ viewingExtension.extensionNumber }}</el-descriptions-item>
        <el-descriptions-item label="分机名称">{{ viewingExtension.extensionName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(viewingExtension.currentStatus)">
            {{ getStatusText(viewingExtension.currentStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="在线状态">
          <el-tag :type="viewingExtension.isOnline ? 'success' : 'danger'">
            {{ viewingExtension.isOnline ? '在线' : '离线' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="启用状态">
          <el-tag :type="viewingExtension.isActive ? 'success' : 'danger'">
            {{ viewingExtension.isActive ? '已启用' : '已禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="分配用户">{{ viewingExtension.assignedUser?.realName || '未分配' }}</el-descriptions-item>
        <el-descriptions-item label="主叫账号">{{ viewingExtension.callerAccount?.accountName || '未配置' }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ viewingExtension.department || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{ viewingExtension.location || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="当前通话">{{ viewingExtension.currentCalls }} / {{ viewingExtension.maxConcurrentCalls }}</el-descriptions-item>
        <el-descriptions-item label="最后心跳">{{ viewingExtension.lastHeartbeatAt ? formatDateTime(viewingExtension.lastHeartbeatAt) : '无心跳' }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ viewingExtension.ipAddress || '未知' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(viewingExtension.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDateTime(viewingExtension.updatedAt) }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          {{ viewingExtension.description || '无描述' }}
        </el-descriptions-item>
        <el-descriptions-item label="功能权限" :span="2">
          <el-tag
            v-for="permission in viewingExtension.permissions"
            :key="permission"
            style="margin-right: var(--spacing-base);"
          >
            {{ getPermissionText(permission) }}
          </el-tag>
          <span v-if="!viewingExtension.permissions || viewingExtension.permissions.length === 0" class="text-gray">
            无特殊权限
          </span>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Plus, Search, Refresh, Check, Connection, Phone, Warning, Close } from '@element-plus/icons-vue'
import { extensionConfigApi, callerAccountApi, type ExtensionConfig, type CallerAccount } from '@/api/modules/vos-config'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const extensionList = ref<ExtensionConfig[]>([])
const callerAccounts = ref<CallerAccount[]>([])
const users = ref<any[]>([])
const showCreateDialog = ref(false)
const showViewDialog = ref(false)
const editingExtension = ref<ExtensionConfig | null>(null)
const viewingExtension = ref<ExtensionConfig | null>(null)

// 统计数据
const stats = reactive({
  total: 0,
  active: 0,
  online: 0,
  offline: 0,
  busy: 0,
  inCall: 0,
  departmentStats: []
})

// 搜索筛选
const searchQuery = ref('')
const statusFilter = ref('')
const departmentFilter = ref('')
const onlineFilter = ref('')

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 表单数据
const formRef = ref<FormInstance>()
const formData = reactive<Partial<ExtensionConfig>>({
  extensionNumber: '',
  extensionName: '',
  description: '',
  callerAccountId: undefined,
  password: '',
  isActive: true,
  maxConcurrentCalls: 1,
  voicemailEnabled: false,
  voicemailEmail: '',
  recordCalls: true,
  allowOutbound: true,
  allowInbound: true,
  permissions: [],
  department: '',
  location: '',
  assignedUserId: undefined
})

// 表单验证规则
const formRules: FormRules = {
  extensionNumber: [
    { required: true, message: '请输入分机号', trigger: 'blur' },
    { pattern: /^\d{3,6}$/, message: '分机号格式不正确', trigger: 'blur' }
  ],
  extensionName: [
    { required: true, message: '请输入分机名称', trigger: 'blur' },
    { min: 2, max: 50, message: '分机名称长度在 2 到 50 个字符', trigger: 'blur' }
  ]
}

// 获取分机列表
const getExtensionList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: searchQuery.value || undefined,
      status: statusFilter.value || undefined,
      department: departmentFilter.value || undefined,
      isOnline: onlineFilter.value !== '' ? onlineFilter.value : undefined
    }

    const response = await extensionConfigApi.getList(params)
    if (response.success) {
      extensionList.value = response.data.list
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('获取分机列表失败:', error)
    ElMessage.error('获取分机列表失败')
  } finally {
    loading.value = false
  }
}

// 获取统计信息
const getStats = async () => {
  try {
    const response = await extensionConfigApi.getStats()
    if (response.success) {
      Object.assign(stats, response.data)
    }
  } catch (error) {
    console.error('获取统计信息失败:', error)
  }
}

// 获取主叫账号列表
const getCallerAccounts = async () => {
  try {
    const response = await callerAccountApi.getList({ pageSize: 1000 })
    if (response.success) {
      callerAccounts.value = response.data.list.filter(account => account.isActive)
    }
  } catch (error) {
    console.error('获取主叫账号失败:', error)
  }
}

// 获取用户列表
const getUsers = async () => {
  try {
    // 这里应该调用用户API获取用户列表
    // 暂时使用模拟数据
    users.value = [
      { id: 1, username: 'admin', realName: '管理员' },
      { id: 2, username: 'teacher1', realName: '张老师' },
      { id: 3, username: 'teacher2', realName: '李老师' },
      { id: 4, username: 'staff1', realName: '客服小王' }
    ]
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getExtensionList()
}

// 重置搜索
const handleReset = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  departmentFilter.value = ''
  onlineFilter.value = ''
  pagination.page = 1
  getExtensionList()
}

// 刷新状态
const handleRefresh = () => {
  getExtensionList()
  getStats()
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  getExtensionList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  getExtensionList()
}

// 查看分机
const handleView = (extension: ExtensionConfig) => {
  viewingExtension.value = { ...extension }
  showViewDialog.value = true
}

// 编辑分机
const handleEdit = (extension: ExtensionConfig) => {
  editingExtension.value = { ...extension }
  Object.assign(formData, extension)
  showCreateDialog.value = true
}

// 删除分机
const handleDelete = async (extension: ExtensionConfig) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分机 "${extension.extensionNumber} - ${extension.extensionName}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await extensionConfigApi.delete(extension.id!)
    if (response.success) {
      ElMessage.success('删除成功')
      getExtensionList()
      getStats()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除分机失败:', error)
      ElMessage.error('删除分机失败')
    }
  }
}

// 心跳测试
const handleHeartbeat = async (extension: ExtensionConfig) => {
  try {
    const response = await extensionConfigApi.heartbeat(extension.extensionNumber, {
      ipAddress: '127.0.0.1',
      userAgent: 'Test Client'
    })
    if (response.success) {
      ElMessage.success('心跳测试成功')
      getExtensionList()
      getStats()
    }
  } catch (error) {
    console.error('心跳测试失败:', error)
    ElMessage.error('心跳测试失败')
  }
}

// 切换启用状态
const handleToggleActive = async (extension: ExtensionConfig) => {
  extension.toggling = true
  try {
    const response = await extensionConfigApi.toggle(extension.id!, extension.isActive)
    if (response.success) {
      ElMessage.success(`${extension.isActive ? '启用' : '禁用'}成功`)
      getExtensionList()
      getStats()
    }
  } catch (error) {
    console.error('切换状态失败:', error)
    ElMessage.error('切换状态失败')
    extension.isActive = !extension.isActive // 回滚状态
  } finally {
    extension.toggling = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    if (editingExtension.value) {
      const response = await extensionConfigApi.update(editingExtension.value.id!, formData)
      if (response.success) {
        ElMessage.success('更新成功')
        showCreateDialog.value = false
        getExtensionList()
        getStats()
      }
    } else {
      const response = await extensionConfigApi.create(formData)
      if (response.success) {
        ElMessage.success('创建成功')
        showCreateDialog.value = false
        getExtensionList()
        getStats()
      }
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

// 关闭对话框
const handleDialogClose = () => {
  editingExtension.value = null
  Object.assign(formData, {
    extensionNumber: '',
    extensionName: '',
    description: '',
    callerAccountId: undefined,
    password: '',
    isActive: true,
    maxConcurrentCalls: 1,
    voicemailEnabled: false,
    voicemailEmail: '',
    recordCalls: true,
    allowOutbound: true,
    allowInbound: true,
    permissions: [],
    department: '',
    location: '',
    assignedUserId: undefined
  })
  formRef.value?.resetFields()
}

// 工具函数
const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    online: 'success',
    offline: 'danger',
    busy: 'warning',
    away: 'info',
    invisible: 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    online: '在线',
    offline: '离线',
    busy: '忙碌',
    away: '离开',
    invisible: '隐身'
  }
  return textMap[status] || status
}

const getPermissionText = (permission: string) => {
  const textMap: Record<string, string> = {
    outbound_call: '外呼',
    inbound_call: '呼入',
    transfer_call: '转接',
    conference_call: '会议',
    record_call: '录音',
    monitor_call: '监听'
  }
  return textMap[permission] || permission
}

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 组件挂载
onMounted(() => {
  getExtensionList()
  getStats()
  getCallerAccounts()
  getUsers()
})
</script>

<style scoped>
.extension-config-management {
  padding: var(--text-2xl);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-section {
  margin-bottom: var(--text-2xl);
  padding: var(--text-2xl);
  background-color: var(--bg-hover);
  border-radius: var(--spacing-sm);
}

.search-section {
  margin-bottom: var(--text-2xl);
}

.pagination-wrapper {
  margin-top: var(--text-2xl);
  text-align: right;
}

.text-gray {
  color: var(--info-color);
}

:deep(.el-table) {
  font-size: var(--text-base);
}

:deep(.el-descriptions) {
  margin-top: var(--spacing-2xl);
}

:deep(.el-descriptions__label) {
  font-weight: 600;
}

:deep(.el-statistic) {
  text-align: center;
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2xl);
}
</style>