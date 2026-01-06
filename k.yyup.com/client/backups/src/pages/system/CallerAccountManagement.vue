<template>
  <div class="caller-account-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>主叫账号管理</h3>
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            新增账号
          </el-button>
        </div>
      </template>

      <!-- 统计信息 -->
      <div class="stats-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic title="总账号数" :value="stats.total" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="激活账号" :value="stats.active">
              <template #prefix>
                <el-icon style="color: var(--success-color)"><Check /></el-icon>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic title="总号码数" :value="stats.totalNumbers" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="激活号码" :value="stats.activeNumbers">
              <template #prefix>
                <el-icon style="color: var(--success-color)"><Check /></el-icon>
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
              placeholder="搜索账号名称、描述"
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
              <el-option label="激活" value="active" />
              <el-option label="未激活" value="inactive" />
              <el-option label="测试中" value="testing" />
              <el-option label="错误" value="error" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="vosConfigFilter" placeholder="VOS配置" clearable @change="handleSearch">
              <el-option label="全部" value="" />
              <el-option
                v-for="config in vosConfigs"
                :key="config.id"
                :label="config.name"
                :value="config.id"
              />
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
          </el-col>
        </el-row>
      </div>

      <!-- 账号列表 -->
      <el-table :data="accountList" v-loading="loading" stripe>
        <el-table-column prop="accountName" label="账号名称" width="180" />
        <el-table-column label="VOS配置" width="200">
          <template #default="{ row }">
            {{ row.vosConfig?.name || '未配置' }}
          </template>
        </el-table-column>
        <el-table-column label="电话号码" width="200">
          <template #default="{ row }">
            <div v-if="row.callerNumbers && row.callerNumbers.length > 0">
              <el-tag
                v-for="number in row.callerNumbers.slice(0, 2)"
                :key="number.id"
                :type="number.isPrimary ? 'primary' : 'info'"
                size="small"
                style="margin-right: var(--spacing-base); margin-bottom: var(--spacing-2xs);"
              >
                {{ number.phoneNumber }}
                <el-icon v-if="number.isPrimary" style="margin-left: var(--spacing-sm);"><Star /></el-icon>
              </el-tag>
              <span v-if="row.callerNumbers.length > 2" class="more-numbers">
                +{{ row.callerNumbers.length - 2 }}
              </span>
            </div>
            <span v-else class="text-gray">暂无号码</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
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
        <el-table-column prop="maxConcurrentCalls" label="最大并发" width="100" />
        <el-table-column prop="lastUsedAt" label="最后使用" width="160">
          <template #default="{ row }">
            {{ row.lastUsedAt ? formatDateTime(row.lastUsedAt) : '未使用' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button
              size="small"
              type="success"
              @click="handleManageNumbers(row)"
            >
              管理号码
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

    <!-- 创建/编辑账号对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingAccount ? '编辑主叫账号' : '新增主叫账号'"
      width="700px"
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
            <el-form-item label="账号名称" prop="accountName">
              <el-input v-model="formData.accountName" placeholder="请输入账号名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="VOS配置" prop="vosConfigId">
              <el-select v-model="formData.vosConfigId" placeholder="选择VOS配置" style="width: 100%">
                <el-option
                  v-for="config in activeVosConfigs"
                  :key="config.id"
                  :label="config.name"
                  :value="config.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入账号描述"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最大并发数">
              <el-input-number
                v-model="formData.maxConcurrentCalls"
                :min="1"
                :max="100"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="初始状态">
              <el-radio-group v-model="formData.isActive">
                <el-radio :label="true">激活</el-radio>
                <el-radio :label="false">未激活</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 电话号码部分 -->
        <el-divider content-position="left">电话号码</el-divider>
        <div class="numbers-section">
          <div
            v-for="(number, index) in formData.callerNumbers"
            :key="index"
            class="number-item"
          >
            <el-row :gutter="10">
              <el-col :span="6">
                <el-input
                  v-model="number.phoneNumber"
                  placeholder="电话号码"
                  @blur="validatePhoneNumber(number)"
                />
              </el-col>
              <el-col :span="6">
                <el-input
                  v-model="number.displayName"
                  placeholder="显示名称"
                />
              </el-col>
              <el-col :span="4">
                <el-select v-model="number.numberType" placeholder="类型">
                  <el-option label="座机" value="landline" />
                  <el-option label="手机" value="mobile" />
                  <el-option label="免费电话" value="tollfree" />
                </el-select>
              </el-col>
              <el-col :span="4">
                <el-input
                  v-model="number.region"
                  placeholder="地区"
                />
              </el-col>
              <el-col :span="4">
                <el-button
                  type="primary"
                  size="small"
                  @click="setPrimaryNumber(index)"
                  v-if="!number.isPrimary"
                >
                  设为主号
                </el-button>
                <el-tag v-else type="primary" size="small">主号</el-tag>
                <el-button
                  type="danger"
                  size="small"
                  @click="removeNumber(index)"
                  v-if="formData.callerNumbers!.length > 1"
                  style="margin-left: var(--spacing-base);"
                >
                  删除
                </el-button>
              </el-col>
            </el-row>
          </div>
          <el-button
            type="primary"
            plain
            @click="addNumber"
            style="margin-top: var(--spacing-2xl);"
          >
            <el-icon><Plus /></el-icon>
            添加号码
          </el-button>
        </div>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ editingAccount ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="showViewDialog"
      title="主叫账号详情"
      width="900px"
    >
      <el-descriptions :column="2" border v-if="viewingAccount">
        <el-descriptions-item label="账号名称">{{ viewingAccount.accountName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(viewingAccount.status)">
            {{ getStatusText(viewingAccount.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="VOS配置">
          {{ viewingAccount.vosConfig?.name || '未配置' }}
        </el-descriptions-item>
        <el-descriptions-item label="启用状态">
          <el-tag :type="viewingAccount.isActive ? 'success' : 'danger'">
            {{ viewingAccount.isActive ? '已启用' : '已禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最大并发数">{{ viewingAccount.maxConcurrentCalls }}</el-descriptions-item>
        <el-descriptions-item label="最后使用时间">
          {{ viewingAccount.lastUsedAt ? formatDateTime(viewingAccount.lastUsedAt) : '未使用' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(viewingAccount.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDateTime(viewingAccount.updatedAt) }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          {{ viewingAccount.description || '无描述' }}
        </el-descriptions-item>
        <el-descriptions-item label="最后错误信息" :span="2" v-if="viewingAccount.lastErrorMessage">
          <el-text type="danger">{{ viewingAccount.lastErrorMessage }}</el-text>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 电话号码列表 -->
      <div v-if="viewingAccount.callerNumbers && viewingAccount.callerNumbers.length > 0" style="margin-top: var(--text-2xl);">
        <h4>电话号码列表</h4>
        <el-table :data="viewingAccount.callerNumbers" size="small">
          <el-table-column prop="phoneNumber" label="电话号码" />
          <el-table-column prop="displayName" label="显示名称" />
          <el-table-column prop="numberType" label="类型">
            <template #default="{ row }">
              <el-tag>{{ getNumberTypeText(row.numberType) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="isPrimary" label="主要号码">
            <template #default="{ row }">
              <el-tag v-if="row.isPrimary" type="primary" size="small">主号</el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="region" label="地区" />
          <el-table-column prop="carrier" label="运营商" />
          <el-table-column prop="callCount" label="通话次数" />
          <el-table-column prop="lastUsedAt" label="最后使用">
            <template #default="{ row }">
              {{ row.lastUsedAt ? formatDateTime(row.lastUsedAt) : '未使用' }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 管理号码对话框 -->
    <el-dialog
      v-model="showNumbersDialog"
      title="管理电话号码"
      width="800px"
    >
      <div v-if="managingAccount">
        <h4>{{ managingAccount.accountName }} 的电话号码</h4>

        <el-button type="primary" @click="showAddNumberDialog = true" style="margin-bottom: var(--spacing-4xl);">
          <el-icon><Plus /></el-icon>
          添加号码
        </el-button>

        <el-table :data="managingAccount.callerNumbers" size="small">
          <el-table-column prop="phoneNumber" label="电话号码" />
          <el-table-column prop="displayName" label="显示名称" />
          <el-table-column prop="numberType" label="类型">
            <template #default="{ row }">
              <el-tag>{{ getNumberTypeText(row.numberType) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="isPrimary" label="主要号码">
            <template #default="{ row }">
              <el-tag v-if="row.isPrimary" type="primary" size="small">主号</el-tag>
              <el-button
                v-else
                type="primary"
                size="small"
                @click="setPrimaryNumberInManage(row)"
              >
                设为主号
              </el-button>
            </template>
          </el-table-column>
          <el-table-column prop="isActive" label="启用状态">
            <template #default="{ row }">
              <el-switch v-model="row.isActive" @change="updateNumberStatus(row)" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button size="small" @click="editNumber(row)">编辑</el-button>
              <el-button
                size="small"
                type="danger"
                @click="deleteNumber(row)"
                :disabled="row.isPrimary && managingAccount.callerNumbers!.length <= 1"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <template #footer>
        <el-button @click="showNumbersDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 添加号码对话框 -->
    <el-dialog
      v-model="showAddNumberDialog"
      title="添加电话号码"
      width="500px"
    >
      <el-form
        ref="numberFormRef"
        :model="numberFormData"
        :rules="numberFormRules"
        label-width="100px"
      >
        <el-form-item label="电话号码" prop="phoneNumber">
          <el-input v-model="numberFormData.phoneNumber" placeholder="请输入电话号码" />
        </el-form-item>
        <el-form-item label="显示名称" prop="displayName">
          <el-input v-model="numberFormData.displayName" placeholder="请输入显示名称" />
        </el-form-item>
        <el-form-item label="号码类型" prop="numberType">
          <el-select v-model="numberFormData.numberType" placeholder="选择号码类型" style="width: 100%">
            <el-option label="座机" value="landline" />
            <el-option label="手机" value="mobile" />
            <el-option label="免费电话" value="tollfree" />
          </el-select>
        </el-form-item>
        <el-form-item label="地区">
          <el-input v-model="numberFormData.region" placeholder="号码归属地区" />
        </el-form-item>
        <el-form-item label="运营商">
          <el-input v-model="numberFormData.carrier" placeholder="运营商" />
        </el-form-item>
        <el-form-item label="设为主号">
          <el-switch v-model="numberFormData.isPrimary" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddNumberDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddNumber" :loading="addingNumber">
          添加
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Plus, Search, Refresh, Check, Star } from '@element-plus/icons-vue'
import { callerAccountApi, vosConfigApi, type CallerAccount, type VOSConfig, type CallerNumber } from '@/api/modules/vos-config'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const addingNumber = ref(false)
const accountList = ref<CallerAccount[]>([])
const vosConfigs = ref<VOSConfig[]>([])
const showCreateDialog = ref(false)
const showViewDialog = ref(false)
const showNumbersDialog = ref(false)
const showAddNumberDialog = ref(false)
const editingAccount = ref<CallerAccount | null>(null)
const viewingAccount = ref<CallerAccount | null>(null)
const managingAccount = ref<CallerAccount | null>(null)

// 统计数据
const stats = reactive({
  total: 0,
  active: 0,
  inactive: 0,
  totalNumbers: 0,
  activeNumbers: 0,
  averageNumbersPerAccount: 0
})

// 搜索筛选
const searchQuery = ref('')
const statusFilter = ref('')
const vosConfigFilter = ref('')

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 表单数据
const formRef = ref<FormInstance>()
const numberFormRef = ref<FormInstance>()
const formData = reactive<Partial<CallerAccount>>({
  accountName: '',
  description: '',
  vosConfigId: undefined,
  maxConcurrentCalls: 10,
  isActive: true,
  callerNumbers: [
    {
      phoneNumber: '',
      displayName: '',
      numberType: 'landline',
      region: '',
      carrier: '',
      isPrimary: false
    }
  ]
})

const numberFormData = reactive<Partial<CallerNumber>>({
  phoneNumber: '',
  displayName: '',
  numberType: 'landline',
  region: '',
  carrier: '',
  isPrimary: false
})

// 表单验证规则
const formRules: FormRules = {
  accountName: [
    { required: true, message: '请输入账号名称', trigger: 'blur' },
    { min: 2, max: 50, message: '账号名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  vosConfigId: [
    { required: true, message: '请选择VOS配置', trigger: 'change' }
  ]
}

const numberFormRules: FormRules = {
  phoneNumber: [
    { required: true, message: '请输入电话号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$|^0\d{2,3}\d{7,8}$/, message: '请输入有效的电话号码', trigger: 'blur' }
  ],
  displayName: [
    { required: true, message: '请输入显示名称', trigger: 'blur' }
  ],
  numberType: [
    { required: true, message: '请选择号码类型', trigger: 'change' }
  ]
}

// 计算属性
const activeVosConfigs = computed(() => {
  return vosConfigs.value.filter(config => config.isActive)
})

// 获取账号列表
const getAccountList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: searchQuery.value || undefined,
      status: statusFilter.value || undefined,
      vosConfigId: vosConfigFilter.value || undefined
    }

    const response = await callerAccountApi.getList(params)
    if (response.success) {
      accountList.value = response.data.list
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('获取账号列表失败:', error)
    ElMessage.error('获取账号列表失败')
  } finally {
    loading.value = false
  }
}

// 获取统计信息
const getStats = async () => {
  try {
    const response = await callerAccountApi.getStats()
    if (response.success) {
      Object.assign(stats, response.data)
    }
  } catch (error) {
    console.error('获取统计信息失败:', error)
  }
}

// 获取VOS配置列表
const getVosConfigs = async () => {
  try {
    const response = await vosConfigApi.getList({ pageSize: 1000 })
    if (response.success) {
      vosConfigs.value = response.data.list
    }
  } catch (error) {
    console.error('获取VOS配置失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getAccountList()
}

// 重置搜索
const handleReset = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  vosConfigFilter.value = ''
  pagination.page = 1
  getAccountList()
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  getAccountList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  getAccountList()
}

// 查看账号
const handleView = (account: CallerAccount) => {
  viewingAccount.value = { ...account }
  showViewDialog.value = true
}

// 编辑账号
const handleEdit = (account: CallerAccount) => {
  editingAccount.value = { ...account }
  Object.assign(formData, account)
  showCreateDialog.value = true
}

// 删除账号
const handleDelete = async (account: CallerAccount) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除账号 "${account.accountName}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await callerAccountApi.delete(account.id!)
    if (response.success) {
      ElMessage.success('删除成功')
      getAccountList()
      getStats()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除账号失败:', error)
      ElMessage.error('删除账号失败')
    }
  }
}

// 管理号码
const handleManageNumbers = (account: CallerAccount) => {
  managingAccount.value = { ...account }
  showNumbersDialog.value = true
}

// 切换启用状态
const handleToggleActive = async (account: CallerAccount) => {
  account.toggling = true
  try {
    const response = await callerAccountApi.toggle(account.id!, account.isActive)
    if (response.success) {
      ElMessage.success(`${account.isActive ? '启用' : '禁用'}成功`)
      getAccountList()
      getStats()
    }
  } catch (error) {
    console.error('切换状态失败:', error)
    ElMessage.error('切换状态失败')
    account.isActive = !account.isActive // 回滚状态
  } finally {
    account.toggling = false
  }
}

// 添加号码
const addNumber = () => {
  if (!formData.callerNumbers) {
    formData.callerNumbers = []
  }
  formData.callerNumbers.push({
    phoneNumber: '',
    displayName: '',
    numberType: 'landline',
    region: '',
    carrier: '',
    isPrimary: false
  })
}

// 移除号码
const removeNumber = (index: number) => {
  if (formData.callerNumbers && formData.callerNumbers.length > 1) {
    formData.callerNumbers.splice(index, 1)
  }
}

// 设为主要号码
const setPrimaryNumber = (index: number) => {
  if (formData.callerNumbers) {
    formData.callerNumbers.forEach((num, i) => {
      num.isPrimary = i === index
    })
  }
}

// 验证电话号码
const validatePhoneNumber = (number: any) => {
  const phoneRegex = /^1[3-9]\d{9}$|^0\d{2,3}\d{7,8}$/
  if (number.phoneNumber && !phoneRegex.test(number.phoneNumber)) {
    ElMessage.warning('请输入有效的电话号码格式')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    // 验证至少有一个有效的电话号码
    const validNumbers = formData.callerNumbers?.filter(num => num.phoneNumber.trim())
    if (!validNumbers || validNumbers.length === 0) {
      ElMessage.error('请至少添加一个有效的电话号码')
      return
    }

    submitting.value = true

    if (editingAccount.value) {
      const response = await callerAccountApi.update(editingAccount.value.id!, formData)
      if (response.success) {
        ElMessage.success('更新成功')
        showCreateDialog.value = false
        getAccountList()
        getStats()
      }
    } else {
      const response = await callerAccountApi.create(formData as any)
      if (response.success) {
        ElMessage.success('创建成功')
        showCreateDialog.value = false
        getAccountList()
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

// 添加号码
const handleAddNumber = async () => {
  if (!numberFormRef.value || !managingAccount.value) return

  try {
    await numberFormRef.value.validate()
    addingNumber.value = true

    const response = await callerAccountApi.addNumber(managingAccount.value.id!, numberFormData as any)
    if (response.success) {
      ElMessage.success('添加号码成功')
      showAddNumberDialog = false

      // 刷新管理账号的号码列表
      const accountResponse = await callerAccountApi.getById(managingAccount.value.id!)
      if (accountResponse.success) {
        managingAccount.value.callerNumbers = accountResponse.data.callerNumbers
      }

      getAccountList()
      getStats()
    }
  } catch (error) {
    console.error('添加号码失败:', error)
    ElMessage.error('添加号码失败')
  } finally {
    addingNumber.value = false
  }
}

// 更新号码状态
const updateNumberStatus = async (number: CallerNumber) => {
  try {
    const response = await callerAccountApi.updateNumber(number.id!, {
      isActive: number.isActive
    })
    if (response.success) {
      ElMessage.success('更新成功')
      getAccountList()
      getStats()
    }
  } catch (error) {
    console.error('更新号码状态失败:', error)
    ElMessage.error('更新号码状态失败')
    number.isActive = !number.isActive // 回滚状态
  }
}

// 设为主要号码（管理界面）
const setPrimaryNumberInManage = async (number: CallerNumber) => {
  if (!managingAccount.value) return

  try {
    // 先取消其他号码的主号状态
    const updatePromises = managingAccount.value.callerNumbers
      ?.filter(num => num.id !== number.id && num.isPrimary)
      .map(num => callerAccountApi.updateNumber(num.id!, { isPrimary: false }))

    if (updatePromises && updatePromises.length > 0) {
      await Promise.all(updatePromises)
    }

    // 设置当前号码为主号
    const response = await callerAccountApi.updateNumber(number.id!, { isPrimary: true })
    if (response.success) {
      ElMessage.success('设置主号成功')

      // 刷新号码列表
      managingAccount.value.callerNumbers?.forEach(num => {
        num.isPrimary = num.id === number.id
      })

      getAccountList()
    }
  } catch (error) {
    console.error('设置主号失败:', error)
    ElMessage.error('设置主号失败')
  }
}

// 编辑号码
const editNumber = (number: CallerNumber) => {
  Object.assign(numberFormData, number)
  showAddNumberDialog.value = true
}

// 删除号码
const deleteNumber = async (number: CallerNumber) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除号码 "${number.phoneNumber}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await callerAccountApi.deleteNumber(number.id!)
    if (response.success) {
      ElMessage.success('删除号码成功')

      // 刷新管理账号的号码列表
      if (managingAccount.value) {
        const accountResponse = await callerAccountApi.getById(managingAccount.value.id!)
        if (accountResponse.success) {
          managingAccount.value.callerNumbers = accountResponse.data.callerNumbers
        }
      }

      getAccountList()
      getStats()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除号码失败:', error)
      ElMessage.error('删除号码失败')
    }
  }
}

// 关闭对话框
const handleDialogClose = () => {
  editingAccount.value = null
  Object.assign(formData, {
    accountName: '',
    description: '',
    vosConfigId: undefined,
    maxConcurrentCalls: 10,
    isActive: true,
    callerNumbers: [
      {
        phoneNumber: '',
        displayName: '',
        numberType: 'landline',
        region: '',
        carrier: '',
        isPrimary: false
      }
    ]
  })
  formRef.value?.resetFields()
}

// 工具函数
const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    testing: 'warning',
    error: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    active: '激活',
    inactive: '未激活',
    testing: '测试中',
    error: '错误'
  }
  return textMap[status] || status
}

const getNumberTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    landline: '座机',
    mobile: '手机',
    tollfree: '免费电话'
  }
  return textMap[type] || type
}

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 组件挂载
onMounted(() => {
  getAccountList()
  getStats()
  getVosConfigs()
})
</script>

<style scoped>
.caller-account-management {
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

.numbers-section {
  border: var(--border-width-base) solid var(--border-color-light);
  border-radius: var(--spacing-xs);
  padding: var(--spacing-4xl);
}

.number-item {
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-2xl);
  background-color: #f9f9f9;
  border-radius: var(--spacing-xs);
}

.text-gray {
  color: var(--info-color);
}

.more-numbers {
  font-size: var(--text-sm);
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
</style>