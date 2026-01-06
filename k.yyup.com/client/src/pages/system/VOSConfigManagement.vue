<template>
  <div class="vos-config-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>VOS配置管理</h3>
          <el-button type="primary" @click="showCreateDialog = true">
            <UnifiedIcon name="Plus" />
            新增配置
          </el-button>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="search-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="searchQuery"
              placeholder="搜索配置名称、服务器地址"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <UnifiedIcon name="Search" />
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
            <el-select v-model="isActiveFilter" placeholder="启用状态" clearable @change="handleSearch">
              <el-option label="全部" value="" />
              <el-option label="已启用" :value="true" />
              <el-option label="已禁用" :value="false" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="handleSearch">
              <UnifiedIcon name="Search" />
              搜索
            </el-button>
            <el-button @click="handleReset">
              <UnifiedIcon name="Refresh" />
              重置
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 配置列表 -->
      <div class="table-wrapper">
<el-table class="responsive-table" :data="configList" v-loading="loading" stripe>
        <el-table-column prop="name" label="配置名称" width="180" />
        <el-table-column prop="serverHost" label="服务器地址" width="200" />
        <el-table-column prop="serverPort" label="端口" width="80" />
        <el-table-column prop="protocol" label="协议" width="80">
          <template #default="{ row }">
            <el-tag :type="getProtocolTagType(row.protocol)">
              {{ row.protocol.toUpperCase() }}
            </el-tag>
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
        <el-table-column prop="lastTestedAt" label="最后测试" width="160">
          <template #default="{ row }">
            {{ row.lastTestedAt ? formatDateTime(row.lastTestedAt) : '未测试' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button
              size="small"
              type="success"
              @click="handleTest(row)"
              :loading="row.testing"
            >
              测试
            </el-button>
            <el-button
              size="small"
              type="warning"
              @click="handleActivate(row)"
              v-if="!row.isActive || (row.isActive && row.status !== 'active')"
            >
              激活
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
</div>

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

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingConfig ? '编辑VOS配置' : '新增VOS配置'"
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
            <el-form-item label="配置名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入配置名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="协议" prop="protocol">
              <el-select v-model="formData.protocol" placeholder="选择协议">
                <el-option label="HTTPS" value="https" />
                <el-option label="HTTP" value="http" />
                <el-option label="WSS" value="wss" />
                <el-option label="WS" value="ws" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="服务器地址" prop="serverHost">
              <el-input v-model="formData.serverHost" placeholder="请输入服务器地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="端口" prop="serverPort">
              <el-input-number
                v-model="formData.serverPort"
                :min="1"
                :max="65535"
                placeholder="端口号"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="API密钥" prop="apiKey">
              <el-input
                v-model="formData.apiKey"
                type="password"
                show-password
                placeholder="请输入API密钥"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="应用ID" prop="appId">
              <el-input v-model="formData.appId" placeholder="请输入应用ID（可选）" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入配置描述"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="最大并发数">
              <el-input-number
                v-model="formData.maxConcurrentCalls"
                :min="1"
                :max="1000"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="超时时间(ms)">
              <el-input-number
                v-model="formData.timeout"
                :min="1000"
                :max="300000"
                :step="1000"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="重试次数">
              <el-input-number
                v-model="formData.retryCount"
                :min="0"
                :max="10"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="语音类型">
              <el-select v-model="formData.voiceType" placeholder="选择语音类型">
                <el-option label="默认" value="default" />
                <el-option label="女声" value="female" />
                <el-option label="男声" value="male" />
                <el-option label="童声" value="child" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="采样率">
              <el-select v-model="formData.sampleRate" placeholder="选择采样率">
                <el-option label="8000 Hz" :value="8000" />
                <el-option label="16000 Hz" :value="16000" />
                <el-option label="22050 Hz" :value="22050" />
                <el-option label="44100 Hz" :value="44100" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="音频格式">
              <el-select v-model="formData.format" placeholder="选择音频格式">
                <el-option label="PCM" value="pcm" />
                <el-option label="WAV" value="wav" />
                <el-option label="MP3" value="mp3" />
                <el-option label="PCMA" value="pcma" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="语言">
              <el-select v-model="formData.language" placeholder="选择语言">
                <el-option label="中文" value="zh-CN" />
                <el-option label="英文" value="en-US" />
                <el-option label="日文" value="ja-JP" />
                <el-option label="韩文" value="ko-KR" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模型名称">
              <el-input v-model="formData.modelName" placeholder="请输入模型名称（可选）" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ editingConfig ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="showViewDialog"
      title="VOS配置详情"
      width="900px"
    >
      <el-descriptions :column="2" border v-if="viewingConfig">
        <el-descriptions-item label="配置名称">{{ viewingConfig.name }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(viewingConfig.status)">
            {{ getStatusText(viewingConfig.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="服务器地址">{{ viewingConfig.serverHost }}</el-descriptions-item>
        <el-descriptions-item label="端口">{{ viewingConfig.serverPort }}</el-descriptions-item>
        <el-descriptions-item label="协议">
          <el-tag :type="getProtocolTagType(viewingConfig.protocol)">
            {{ viewingConfig.protocol.toUpperCase() }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="启用状态">
          <el-tag :type="viewingConfig.isActive ? 'success' : 'danger'">
            {{ viewingConfig.isActive ? '已启用' : '已禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最大并发数">{{ viewingConfig.maxConcurrentCalls }}</el-descriptions-item>
        <el-descriptions-item label="超时时间">{{ viewingConfig.timeout }}ms</el-descriptions-item>
        <el-descriptions-item label="重试次数">{{ viewingConfig.retryCount }}</el-descriptions-item>
        <el-descriptions-item label="语音类型">{{ viewingConfig.voiceType || '默认' }}</el-descriptions-item>
        <el-descriptions-item label="采样率">{{ viewingConfig.sampleRate || '16000' }} Hz</el-descriptions-item>
        <el-descriptions-item label="音频格式">{{ viewingConfig.format || 'PCM' }}</el-descriptions-item>
        <el-descriptions-item label="语言">{{ viewingConfig.language || 'zh-CN' }}</el-descriptions-item>
        <el-descriptions-item label="模型名称">{{ viewingConfig.modelName || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="最后测试时间">
          {{ viewingConfig.lastTestedAt ? formatDateTime(viewingConfig.lastTestedAt) : '未测试' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(viewingConfig.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDateTime(viewingConfig.updatedAt) }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          {{ viewingConfig.description || '无描述' }}
        </el-descriptions-item>
        <el-descriptions-item label="最后错误信息" :span="2" v-if="viewingConfig.lastErrorMessage">
          <el-text type="danger">{{ viewingConfig.lastErrorMessage }}</el-text>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 关联的主叫账号 -->
      <div v-if="viewingConfig.callerAccounts && viewingConfig.callerAccounts.length > 0" style="margin-top: var(--text-2xl);">
        <h4>关联的主叫账号</h4>
        <el-table class="responsive-table" :data="viewingConfig.callerAccounts" size="small">
          <el-table-column prop="accountName" label="账号名称" />
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="isActive" label="启用状态">
            <template #default="{ row }">
              <el-tag :type="row.isActive ? 'success' : 'danger'">
                {{ row.isActive ? '已启用' : '已禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="maxConcurrentCalls" label="最大并发" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { vosConfigApi, type VOSConfig } from '@/api/modules/vos-config'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const configList = ref<VOSConfig[]>([])
const showCreateDialog = ref(false)
const showViewDialog = ref(false)
const editingConfig = ref<VOSConfig | null>(null)
const viewingConfig = ref<VOSConfig | null>(null)

// 搜索筛选
const searchQuery = ref('')
const statusFilter = ref('')
const isActiveFilter = ref('')

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 表单数据
const formRef = ref<FormInstance>()
const formData = reactive<Partial<VOSConfig>>({
  name: '',
  description: '',
  serverHost: '',
  serverPort: 443,
  protocol: 'https',
  apiKey: '',
  apiSecret: '',
  appId: '',
  username: '',
  password: '',
  voiceType: 'default',
  sampleRate: 16000,
  format: 'pcm',
  language: 'zh-CN',
  modelName: '',
  maxConcurrentCalls: 100,
  timeout: 30000,
  retryCount: 3
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入配置名称', trigger: 'blur' },
    { min: 2, max: 50, message: '配置名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  serverHost: [
    { required: true, message: '请输入服务器地址', trigger: 'blur' }
  ],
  serverPort: [
    { required: true, message: '请输入端口号', trigger: 'blur' }
  ],
  protocol: [
    { required: true, message: '请选择协议', trigger: 'change' }
  ],
  apiKey: [
    { required: true, message: '请输入API密钥', trigger: 'blur' }
  ]
}

// 获取配置列表
const getConfigList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: searchQuery.value || undefined,
      status: statusFilter.value || undefined,
      isActive: isActiveFilter.value !== '' ? isActiveFilter.value : undefined
    }

    const response = await vosConfigApi.getList(params)
    if (response.success) {
      configList.value = response.data.list
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('获取配置列表失败:', error)
    ElMessage.error('获取配置列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getConfigList()
}

// 重置搜索
const handleReset = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  isActiveFilter.value = ''
  pagination.page = 1
  getConfigList()
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  getConfigList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  getConfigList()
}

// 查看配置
const handleView = (config: VOSConfig) => {
  viewingConfig.value = { ...config }
  showViewDialog.value = true
}

// 编辑配置
const handleEdit = (config: VOSConfig) => {
  editingConfig.value = { ...config }
  Object.assign(formData, config)
  showCreateDialog.value = true
}

// 删除配置
const handleDelete = async (config: VOSConfig) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除配置 "${config.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await vosConfigApi.delete(config.id!)
    if (response.success) {
      ElMessage.success('删除成功')
      getConfigList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除配置失败:', error)
      ElMessage.error('删除配置失败')
    }
  }
}

// 测试连接
const handleTest = async (config: VOSConfig) => {
  config.testing = true
  try {
    const response = await vosConfigApi.testConnection()
    if (response.success) {
      ElMessage.success('连接测试成功')
      getConfigList() // 刷新列表以更新测试时间
    }
  } catch (error) {
    console.error('连接测试失败:', error)
    ElMessage.error('连接测试失败')
  } finally {
    config.testing = false
  }
}

// 激活配置
const handleActivate = async (config: VOSConfig) => {
  try {
    const response = await vosConfigApi.activate(config.id!)
    if (response.success) {
      ElMessage.success('激活成功')
      getConfigList()
    }
  } catch (error) {
    console.error('激活配置失败:', error)
    ElMessage.error('激活配置失败')
  }
}

// 切换启用状态
const handleToggleActive = async (config: VOSConfig) => {
  config.toggling = true
  try {
    // 这里可以添加切换状态的API调用
    // 暂时只更新本地状态
    ElMessage.success(`${config.isActive ? '启用' : '禁用'}成功`)
  } catch (error) {
    console.error('切换状态失败:', error)
    ElMessage.error('切换状态失败')
    config.isActive = !config.isActive // 回滚状态
  } finally {
    config.toggling = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    if (editingConfig.value) {
      const response = await vosConfigApi.update(editingConfig.value.id!, formData)
      if (response.success) {
        ElMessage.success('更新成功')
        showCreateDialog.value = false
        getConfigList()
      }
    } else {
      const response = await vosConfigApi.create(formData)
      if (response.success) {
        ElMessage.success('创建成功')
        showCreateDialog.value = false
        getConfigList()
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
  editingConfig.value = null
  Object.assign(formData, {
    name: '',
    description: '',
    serverHost: '',
    serverPort: 443,
    protocol: 'https',
    apiKey: '',
    apiSecret: '',
    appId: '',
    username: '',
    password: '',
    voiceType: 'default',
    sampleRate: 16000,
    format: 'pcm',
    language: 'zh-CN',
    modelName: '',
    maxConcurrentCalls: 100,
    timeout: 30000,
    retryCount: 3
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

const getProtocolTagType = (protocol: string) => {
  const typeMap: Record<string, string> = {
    https: 'success',
    http: 'warning',
    wss: 'primary',
    ws: 'info'
  }
  return typeMap[protocol] || 'info'
}

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 组件挂载
onMounted(() => {
  getConfigList()
})
</script>

<style scoped>
.vos-config-management {
  padding: var(--text-2xl);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-section {
  margin-bottom: var(--text-2xl);
}

.pagination-wrapper {
  margin-top: var(--text-2xl);
  text-align: right;
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
</style>