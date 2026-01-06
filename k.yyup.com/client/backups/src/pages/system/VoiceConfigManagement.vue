<template>
  <div class="voice-config-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>语音配置管理</h3>
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            新增配置
          </el-button>
        </div>
      </template>

      <!-- 统计信息 -->
      <div class="stats-section">
        <el-row :gutter="20">
          <el-col :span="4">
            <el-statistic title="总配置数" :value="stats.total" />
          </el-col>
          <el-col :span="4">
            <el-statistic title="激活配置" :value="stats.active">
              <template #prefix>
                <el-icon style="color: var(--success-color)"><Check /></el-icon>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="4">
            <el-statistic title="VOS配置" :value="stats.vos.total">
              <template #prefix>
                <el-icon style="color: var(--primary-color)"><Connection /></el-icon>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="4">
            <el-statistic title="SIP配置" :value="stats.sip.total">
              <template #prefix>
                <el-icon style="color: var(--success-color)"><Setting /></el-icon>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="4">
            <el-statistic title="错误配置" :value="stats.error">
              <template #prefix>
                <el-icon style="color: var(--danger-color)"><Warning /></el-icon>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="4">
            <el-statistic title="离线配置" :value="stats.inactive">
              <template #prefix>
                <el-icon style="color: var(--info-color)"><Close /></el-icon>
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
              placeholder="搜索配置名称、描述"
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
            <el-select v-model="configTypeFilter" placeholder="配置类型" clearable @change="handleSearch">
              <el-option label="全部" value="" />
              <el-option label="VOS配置" value="vos" />
              <el-option label="SIP配置" value="sip" />
            </el-select>
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

      <!-- 配置列表 -->
      <el-table :data="configList" v-loading="loading" stripe>
        <el-table-column prop="name" label="配置名称" width="180" />
        <el-table-column prop="configType" label="配置类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.configType === 'vos' ? 'primary' : 'success'">
              {{ getConfigTypeText(row.configType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="服务器信息" width="200">
          <template #default="{ row }">
            <div v-if="row.summary">
              <div class="server-info">
                <span class="server">{{ row.summary.server }}</span>
                <span v-if="row.summary.realm" class="realm">({{ row.summary.realm }})</span>
              </div>
              <div v-if="row.summary.username" class="username">用户: {{ row.summary.username }}</div>
            </div>
            <span v-else class="text-gray">暂无信息</span>
          </template>
        </el-table-column>
        <el-table-column label="DID号码" width="150">
          <template #default="{ row }">
            <div v-if="row.summary">
              <el-tag size="small">{{ row.summary.defaultDid }}</el-tag>
              <span class="did-count">+{{ row.summary.didCount - 1 }}</span>
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
        <el-table-column label="最后测试" width="160">
          <template #default="{ row }">
            <div v-if="row.lastTestedAt">
              <div>{{ formatDateTime(row.lastTestedAt) }}</div>
              <div v-if="row.summary?.latency" class="test-latency">
                <el-tag :type="row.summary.latency < 100 ? 'success' : row.summary.latency < 300 ? 'warning' : 'danger'" size="small">
                  {{ row.summary.latency }}ms
                </el-tag>
              </div>
            </div>
            <span v-else class="text-gray">未测试</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
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
              @click="handleValidate(row)"
            >
              验证
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

    <!-- 创建/编辑配置对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingConfig ? '编辑语音配置' : '新增语音配置'"
      width="900px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <!-- 配置类型选择 -->
        <el-form-item label="配置类型" prop="configType">
          <el-radio-group v-model="formData.configType" @change="handleConfigTypeChange">
            <el-radio value="vos">
              <div class="config-type-option">
                <h4>VOS配置</h4>
                <p class="config-type-desc">简单配置：只需配置服务器地址、端口和主叫号码</p>
              </div>
            </el-radio>
            <el-radio value="sip">
              <div class="config-type-option">
                <h4>SIP配置</h4>
                <p class="config-type-desc">标准协议：完整的SIP协议配置，支持高级功能</p>
              </div>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 基本信息 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="配置名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入配置名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="描述">
              <el-input v-model="formData.description" placeholder="请输入配置描述" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- VOS配置表单 -->
        <template v-if="formData.configType === 'vos'">
          <el-divider content-position="left">
            <el-icon><Setting /></el-icon> VOS配置
          </el-divider>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="服务器地址" prop="vosServerHost">
                <el-input v-model="formData.vosServerHost" placeholder="请输入VOS服务器地址" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="服务器端口" prop="vosServerPort">
                <el-input-number
                  v-model="formData.vosServerPort"
                  :min="1"
                  :max="65535"
                  placeholder="端口号"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="API密钥" prop="vosApiKey">
            <el-input
              v-model="formData.vosApiKey"
              type="password"
              show-password
              placeholder="请输入VOS API密钥"
            />
          </el-form-item>

          <el-form-item label="最大并发数">
            <el-input-number
              v-model="formData.vosMaxConcurrentCalls"
              :min="1"
              :max="100"
              placeholder="最大并发通话数"
              style="width: 100%"
            />
          </el-form-item>
        </template>

        <!-- SIP配置表单 -->
        <template v-if="formData.configType === 'sip'">
          <el-divider content-position="left">
            <el-icon><Connection /></el-icon> SIP配置
          </el-divider>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="SIP服务器" prop="sipServerHost">
                <el-input v-model="formData.sipServerHost" placeholder="请输入SIP服务器地址" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="SIP端口" prop="sipServerPort">
                <el-input-number
                  v-model="formData.sipServerPort"
                  :min="1"
                  :max="65535"
                  placeholder="端口号"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="传输协议" prop="sipProtocol">
                <el-select v-model="formData.sipProtocol" placeholder="选择传输协议" style="width: 100%">
                  <el-option label="UDP" value="udp" />
                  <el-option label="TCP" value="tcp" />
                  <el-option label="TLS" value="tls" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="SIP域">
                <el-input v-model="formData.sipRealm" placeholder="请输入SIP域" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="RTP端口范围">
                <el-input-number
                  v-model="rtpPortRange.start"
                  :min="1024"
                  :max="65535"
                  placeholder="起始端口"
                  @change="handleRtpPortChange"
                  style="width: 48%"
                />
                <span style="margin: 0 5px;">-</span>
                <el-input-number
                  v-model="rtpPortRange.end"
                  :min="1024"
                  :max="65535"
                  placeholder="结束端口"
                  @change="handleRtpPortChange"
                  style="width: 48%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="SIP用户名" prop="sipUsername">
                <el-input v-model="formData.sipUsername" placeholder="请输入SIP用户名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="SIP密码" prop="sipPassword">
                <el-input
                  v-model="formData.sipPassword"
                  type="password"
                  show-password
                  placeholder="请输入SIP密码"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="音频编解码器">
            <el-checkbox-group v-model="formData.sipAudioCodecs">
              <el-checkbox label="PCMU (G.711μ)" value="PCMU" />
              <el-checkbox label="PCMA (G.711A)" value="PCMA" />
              <el-checkbox label="G.729" value="G729" />
              <el-checkbox label="Opus" value="Opus" />
            </el-checkbox-group>
          </el-form-item>
        </template>

        <!-- DID号码配置 -->
        <el-divider content-position="left">
          <el-icon><Phone /></el-icon> DID号码配置
        </el-divider>

        <el-form-item label="DID号码">
          <div class="did-numbers-section">
            <div
              v-for="(did, index) in formData.didNumbers"
              :key="index"
              class="did-number-item"
            >
              <el-row :gutter="10">
                <el-col :span="6">
                  <el-input
                    v-model="did.number"
                    placeholder="请输入DID号码"
                  />
                </el-col>
                <el-col :span="6">
                  <el-input
                    v-model="did.displayName"
                    placeholder="显示名称"
                  />
                </el-col>
                <el-col :span="6">
                  <el-radio-group v-model="did.isDefault">
                    <el-radio :label="true">主号</el-radio>
                    <el-radio :label="false">普通</el-radio>
                  </el-radio-group>
                </el-col>
                <el-col :span="6">
                  <el-button
                    type="danger"
                    size="small"
                    @click="removeDidNumber(index)"
                    v-if="formData.didNumbers.length > 1"
                  >
                    删除
                  </el-button>
                </el-col>
              </el-row>
            </div>
            <el-button
              type="primary"
              plain
              @click="addDidNumber"
              style="margin-top: var(--spacing-2xl);"
            >
              <el-icon><Plus /></el-icon>
              添加号码
            </el-button>
          </div>
        </el-form-item>

        <!-- 默认DID号码 -->
        <el-form-item label="默认主叫号码">
          <el-select
            v-model="formData.defaultDidNumber"
            placeholder="选择默认主叫号码"
            style="width: 100%"
          >
            <el-option
              v-for="did in formData.didNumbers"
              :key="did.number"
              :label="`${did.number} (${did.displayName})`"
              :value="did.number"
            />
          </el-select>
        </el-form-item>
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
      title="语音配置详情"
      width="1000px"
    >
      <div v-if="viewingConfig">
        <!-- 基本信息 -->
        <el-descriptions :column="2" border>
          <el-descriptions-item label="配置名称">{{ viewingConfig.name }}</el-descriptions-item>
          <el-descriptions-item label="配置类型">
            <el-tag :type="viewingConfig.configType === 'vos' ? 'primary' : 'success'">
              {{ getConfigTypeText(viewingConfig.configType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(viewingConfig.status)">
              {{ getStatusText(viewingConfig.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="启用状态">
            <el-tag :type="viewingConfig.isActive ? 'success' : 'danger'">
              {{ viewingConfig.isActive ? '已启用' : '已禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(viewingConfig.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDateTime(viewingConfig.updatedAt) }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            {{ viewingConfig.description || '无描述' }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 配置详情 -->
        <template v-if="viewingConfig.configType === 'vos'">
          <h4 style="margin: var(--text-2xl) 0 10px 0;">VOS配置详情</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="服务器地址">{{ viewingConfig.vosServerHost }}</el-descriptions-item>
            <el-descriptions-item label="服务器端口">{{ viewingConfig.vosServerPort }}</el-descriptions-item>
            <el-descriptions-item label="最大并发数">{{ viewingConfig.vosMaxConcurrentCalls }}</el-descriptions-item>
            <el-descriptions-item label="API密钥">•••••••••••••••••••••••••••••</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="viewingConfig.configType === 'sip'">
          <h4 style="margin: var(--text-2xl) 0 10px 0;">SIP配置详情</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="SIP服务器">{{ viewingConfig.sipServerHost }}</el-descriptions-item>
            <el-descriptions-item label="SIP端口">{{ viewingConfig.sipServerPort }}</el-descriptions-item>
            <el-descriptions-item label="传输协议">{{ viewingConfig.sipProtocol?.toUpperCase() }}</el-descriptions-item>
            <el-descriptions-item label="SIP域">{{ viewingConfig.sipRealm || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="SIP用户名">{{ viewingConfig.sipUsername }}</el-descriptions-item>
            <el-descriptions-item label="SIP密码">•••••••••••••••••••••••••••••</el-descriptions-item>
            <el-descriptions-item label="RTP端口范围">
              {{ viewingConfig.sipRtpPortStart }} - {{ viewingConfig.sipRtpPortEnd }}
            </el-descriptions-item>
            <el-descriptions-item label="音频编解码器">
              <el-tag
                v-for="codec in viewingConfig.summary?.codecs || []"
                :key="codec"
                style="margin-right: var(--spacing-base);"
                size="small"
              >
                {{ codec }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </template>

        <!-- DID号码列表 -->
        <div v-if="viewingConfig.summary?.didCount > 0" style="margin-top: var(--text-2xl);">
          <h4>DID号码列表</h4>
          <el-table :data="viewingConfig.summary.didNumbers" size="small">
            <el-table-column prop="number" label="号码" />
            <el-table-column prop="displayName" label="显示名称" />
            <el-table-column prop="isDefault" label="类型">
              <template #default="{ row }">
                <el-tag v-if="row.isDefault" type="primary" size="small">主号</el-tag>
                <span v-else>普通</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 验证结果 -->
        <div v-if="viewingConfig.validation && !viewingConfig.validation.isValid" style="margin-top: var(--text-2xl);">
          <h4 style="color: var(--danger-color);">配置验证失败</h4>
          <el-alert
            :title="`发现 ${viewingConfig.validation.errors.length} 个配置问题`"
            type="error"
            :closable="false"
          >
            <ul>
              <li v-for="error in viewingConfig.validation.errors" :key="error">{{ error }}</li>
            </ul>
          </el-alert>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Plus, Search, Refresh, Check, Connection, Setting, Phone, Warning, Close } from '@element-plus/icons-vue'
import { voiceConfigApi, type VoiceConfig, type VoiceConfigType, validateVOSConfig, validateSIPConfig, getConfigTypeText, getConfigTypeDescription, generateDefaultDidNumber, getDefaultAudioCodecs } from '@/api/modules/voice-config'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const configList = ref<VoiceConfig[]>([])
const showCreateDialog = ref(false)
const showViewDialog = ref(false)
const editingConfig = ref<VoiceConfig | null>(null)
const viewingConfig = ref<VoiceConfig | null>(null)

// 统计数据
const stats = reactive({
  total: 0,
  active: 0,
  inactive: 0,
  error: 0,
  vos: {
    total: 0,
    active: 0,
    inactive: 0
  },
  sip: {
    total: 0,
    active: 0,
    inactive: 0
  }
})

// 搜索筛选
const searchQuery = ref('')
const configTypeFilter = ref('')
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
const formData = reactive<any>({
  name: '',
  description: '',
  configType: 'vos' as VoiceConfigType,
  // VOS配置
  vosServerHost: '',
  vosServerPort: 443,
  vosApiKey: '',
  vosMaxConcurrentCalls: 10,
  // SIP配置
  sipServerHost: '',
  sipServerPort: 5060,
  sipProtocol: 'udp',
  sipRealm: '',
  sipUsername: '',
  sipPassword: '',
  sipAudioCodecs: ['PCMU', 'PCMA'],
  sipRtpPortStart: 10000,
  sipRtpPortEnd: 20000,
  // 通用配置
  didNumbers: [
    {
      number: '',
      displayName: '',
      isDefault: true
    }
  ],
  defaultDidNumber: ''
})

// RTP端口范围
const rtpPortRange = reactive({
  start: 10000,
  end: 20000
})

// 表单验证规则
const formRules = computed<FormRules>(() => {
  const baseRules = {
    name: [
      { required: true, message: '请输入配置名称', trigger: 'blur' },
      { min: 2, max: 50, message: '配置名称长度在 2 到 50 个字符', trigger: 'blur' }
    ]
  }

  if (formData.configType === 'vos') {
    return {
      ...baseRules,
      vosServerHost: [
        { required: true, message: '请输入VOS服务器地址', trigger: 'blur' }
      ],
      vosApiKey: [
        { required: true, message: '请输入VOS API密钥', trigger: 'blur' }
      ]
    }
  } else if (formData.configType === 'sip') {
    return {
      ...baseRules,
      sipServerHost: [
        { required: true, message: '请输入SIP服务器地址', trigger: 'blur' }
      ],
      sipUsername: [
        { required: true, message: '请输入SIP用户名', trigger: 'blur' }
      ],
      sipPassword: [
        { required: true, message: '请输入SIP密码', trigger: 'blur' }
      ]
    }
  }

  return baseRules
})

// 获取配置列表
const getConfigList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: searchQuery.value || undefined,
      configType: configTypeFilter.value || undefined,
      status: statusFilter.value || undefined,
      isActive: isActiveFilter.value !== '' ? isActiveFilter.value : undefined
    }

    const response = await voiceConfigApi.getList(params)
    if (response.success) {
      configList.value = response.data.list
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('获取语音配置列表失败:', error)
    ElMessage.error('获取语音配置列表失败')
  } finally {
    loading.value = false
  }
}

// 获取统计信息
const getStats = async () => {
  try {
    const response = await voiceConfigApi.getStats()
    if (response.success) {
      Object.assign(stats, response.data)
    }
  } catch (error) {
    console.error('获取统计信息失败:', error)
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
  configTypeFilter.value = ''
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
const handleView = (config: VoiceConfig) => {
  viewingConfig.value = { ...config }
  showViewDialog.value = true
}

// 编辑配置
const handleEdit = (config: VoiceConfig) => {
  editingConfig.value = { ...config }

  // 复制配置数据到表单
  Object.assign(formData, config)

  // 如果是SIP配置，设置RTP端口范围
  if (config.configType === 'sip') {
    rtpPortRange.start = config.sipRtpPortStart || 10000
    rtpPortRange.end = config.sipRtpPortEnd || 20000
  }

  // 解析DID号码
  if (config.summary?.didCount > 0) {
    formData.didNumbers = config.summary.didNumbers.map((did: any) => ({
      number: did.number,
      displayName: did.displayName || did.number,
      isDefault: did.isDefault || false
    }))
  }

  showCreateDialog.value = true
}

// 删除配置
const handleDelete = async (config: VoiceConfig) => {
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

    const response = await voiceConfigApi.delete(config.id!)
    if (response.success) {
      ElMessage.success('删除成功')
      getConfigList()
      getStats()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除配置失败:', error)
      ElMessage.error('删除配置失败')
    }
  }
}

// 测试配置
const handleTest = async (config: VoiceConfig) => {
  config.testing = true
  try {
    const response = await voiceConfigApi.test(config.id!)
    if (response.success) {
      ElMessage.success(response.data.message)

      // 更新列表中的测试结果
      const index = configList.value.findIndex(c => c.id === config.id)
      if (index !== -1) {
        configList.value[index] = {
          ...configList.value[index],
          summary: {
            ...configList.value[index].summary,
            latency: response.data.latency
          },
          lastTestedAt: response.data.testedAt
        }
      }

      getStats()
    }
  } catch (error) {
    console.error('测试配置失败:', error)
    ElMessage.error('测试配置失败')
  } finally {
    config.testing = false
  }
}

// 验证配置
const handleValidate = async (config: VoiceConfig) => {
  try {
    const response = await voiceConfigApi.validate(config.id!)
    if (response.success) {
      if (response.data.isValid) {
        ElMessage.success('配置验证通过')
      } else {
        ElMessage.warning('配置验证失败：' + response.data.errors.join(', '))
      }
    }
  } catch (error) {
    console.error('验证配置失败:', error)
    ElMessage.error('验证配置失败')
  }
}

// 切换启用状态
const handleToggleActive = async (config: VoiceConfig) => {
  config.toggling = true
  try {
    const response = await voiceConfigApi.toggle(config.id!, config.isActive)
    if (response.success) {
      ElMessage.success(`${config.isActive ? '启用' : '禁用'}成功`)
      getConfigList()
      getStats()
    }
  } catch (error) {
    console.error('切换状态失败:', error)
    ElMessage.error('切换状态失败')
    config.isActive = !config.isActive // 回滚状态
  } finally {
    config.toggling = false
  }
}

// 配置类型切换
const handleConfigTypeChange = (type: VoiceConfigType) => {
  // 清空相关字段
  if (type === 'vos') {
    // 清空SIP字段
    formData.sipServerHost = ''
    formData.sipServerPort = 5060
    formData.sipProtocol = 'udp'
    formData.sipRealm = ''
    formData.sipUsername = ''
    formData.sipPassword = ''
    formData.sipAudioCodecs = ['PCMU', 'PCMA']
    rtpPortRange.start = 10000
    rtpPortRange.end = 20000

    // 设置VOS默认值
    formData.vosServerPort = 443
    formData.vosMaxConcurrentCalls = 10
  } else if (type === 'sip') {
    // 清空VOS字段
    formData.vosServerHost = ''
    formData.vosServerPort = 443
    formData.vosApiKey = ''
    formData.vosMaxConcurrentCalls = 10

    // 设置SIP默认值
    formData.sipServerPort = 5060
    formData.sipProtocol = 'udp'
    formData.sipAudioCodecs = ['PCMU', 'PCMA', 'G729']
    rtpPortRange.start = 10000
    rtpPortRange.end = 20000
  }

  // 重新生成默认DID号码
  const defaultDid = generateDefaultDidNumber(type)
  formData.defaultDidNumber = defaultDid
  formData.didNumbers = [{
    number: defaultDid,
    displayName: '主叫号码',
    isDefault: true
  }]
}

// RTP端口范围变化
const handleRtpPortChange = () => {
  if (rtpPortRange.start >= rtpPortRange.end) {
    ElMessage.warning('RTP端口起始必须小于结束端口')
    rtpPortRange.start = rtpRange.end - 1000
  }
}

// 添加DID号码
const addDidNumber = () => {
  const defaultDid = generateDefaultDidNumber(formData.configType)
  formData.didNumbers.push({
    number: defaultDid,
    displayName: '',
    isDefault: formData.didNumbers.length === 0
  })
}

// 移除DID号码
const removeDidNumber = (index: number) => {
  const removedDid = formData.didNumbers[index]
  formData.didNumbers.splice(index, 1)

  // 如果删除的是默认号码，设置第一个为默认
  if (removedDid.isDefault && formData.didNumbers.length > 0) {
    formData.didNumbers[0].isDefault = true
  }

  // 更新默认选择
  if (formData.defaultDidNumber === removedDid.number) {
    formData.defaultDidNumber = formData.didNumbers.find(did => did.number)?.number || ''
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // 验证DID号码
    const validDids = formData.didNumbers.filter(did => did.number.trim())
    if (validDids.length === 0) {
      ElMessage.error('请至少添加一个DID号码')
      return
    }

    // 验证主号码唯一性
    const defaultDids = validDids.filter(did => did.isDefault)
    if (defaultDids.length === 0) {
      ElMessage.error('请选择一个默认主叫号码')
      return
    }
    if (defaultDids.length > 1) {
      ElMessage.error('只能有一个默认主叫号码')
      return
    }

    // 设置默认DID号码
    formData.defaultDidNumber = defaultDids[0].number

    // 提交数据
    const submitData: any = {
      ...formData,
      vosDidNumbers: formData.configType === 'vos' ? validDids.map(did => ({
        number: did.number,
        displayName: did.displayName,
        isDefault: did.isDefault
      })) : undefined,
      sipDidNumbers: formData.configType === 'sip' ? validDids.map(did => ({
        number: did.number,
        displayName: did.displayName,
        isDefault: did.isDefault
      })) : undefined
    }

    // 处理SIP配置的特殊字段
    if (formData.configType === 'sip') {
      submitData.sipRtpPortStart = rtpPortRange.start
      submitData.sipRtpPortEnd = rtpRange.end
    }

    if (editingConfig.value) {
      const response = await voiceConfigApi.update(editingConfig.value.id!, submitData)
      if (response.success) {
        ElMessage.success('更新成功')
        showCreateDialog.value = false
        getConfigList()
        getStats()
      }
    } else {
      const response = await voiceConfigApi.create(submitData)
      if (response.success) {
        ElMessage.success('创建成功')
        showCreateDialog.value = false
        getConfigList()
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
  editingConfig.value = null
  Object.assign(formData, {
    name: '',
    description: '',
    configType: 'vos' as VoiceConfigType,
    vosServerHost: '',
    vosServerPort: 443,
    vosApiKey: '',
    vosMaxConcurrentCalls: 10,
    sipServerHost: '',
    sipServerPort: 5060,
    sipProtocol: 'udp',
    sipRealm: '',
    sipUsername: '',
    sipPassword: '',
    sipAudioCodecs: ['PCMU', 'PCMA'],
    sipRtpPortStart: 10000,
    sipRtpPortEnd: 20000,
    didNumbers: [{
      number: '',
      displayName: '',
      isDefault: true
    }],
    defaultDidNumber: ''
  })
  rtpPortRange.start = 10000
  rtpRange.end = 20000
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

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 组件挂载
onMounted(() => {
  getConfigList()
  getStats()
})
</script>

<style scoped>
.voice-config-management {
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

.config-type-option {
  padding: var(--spacing-4xl);
  border: var(--border-width-base) solid var(--border-color-light);
  border-radius: var(--radius-md);
  margin-right: var(--spacing-2xl);
  cursor: pointer;
  transition: all 0.3s;
}

.config-type-option:hover {
  border-color: var(--primary-color);
  background-color: #f0f9ff;
}

.config-type-option.selected {
  border-color: var(--primary-color);
  background-color: #f0f9ff;
}

.config-type-option h4 {
  margin: 0 0 5px 0;
  color: var(--text-primary);
}

.config-type-desc {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--info-color);
}

.server-info {
  line-height: 1.4;
}

.server {
  font-weight: 600;
}

.realm, .username {
  font-size: var(--text-sm);
  color: var(--info-color);
}

.did-count {
  font-size: var(--text-sm);
  color: var(--info-color);
}

.text-gray {
  color: var(--info-color);
}

.did-numbers-section {
  border: var(--border-width-base) solid var(--border-color-light);
  border-radius: var(--spacing-xs);
  padding: var(--spacing-4xl);
}

.did-number-item {
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-2xl);
  background-color: #f9f9f9;
  border-radius: var(--spacing-xs);
}

.test-latency {
  margin-top: var(--spacing-base);
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

:deep(.el-radio-group) {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

:deep(.el-radio) {
  margin-right: 0;
  width: 100%;
}
</style>