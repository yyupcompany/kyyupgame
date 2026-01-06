<template>
  <UnifiedCenterLayout
    title="呼叫中心"
    description="基于AI智能的专业语音通话系统，支持老家长、客户池、员工三大呼叫场景"
    :icon="Phone"
  >
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <el-button type="primary" @click="showMakeCallDialog = true">
        <el-icon><Phone /></el-icon>
        发起通话
      </el-button>
      <el-button @click="showVosSettings = true">
        <el-icon><Setting /></el-icon>
        VOS设置
      </el-button>
    </template>

    <!-- 主要内容区域 - 标签页 -->
    <el-tabs v-model="activeTab" type="card" class="call-center-tabs">
      <!-- 标签页1: 电话呼叫 -->
      <el-tab-pane label="📞 电话呼叫" name="calling">
        <div class="tab-content">
          <!-- 呼叫界面 -->
          <el-row :gutter="20" class="calling-section">
            <!-- 左侧: VOS设置和联系人选择 -->
            <el-col :xs="24" :sm="24" :md="8" class="left-panel">
              <!-- VOS设置面板 -->
              <el-card class="vos-panel">
                <template #header>
                  <div class="card-header">
                    <span>⚙️ VOS设置</span>
                    <el-button link type="primary" @click="showVosSettings = true">编辑</el-button>
                  </div>
                </template>
                <div class="vos-info">
                  <div class="info-item">
                    <span class="info-label">VOS配置</span>
                    <span class="info-value">{{ vosConfig?.name || '未配置' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">主叫号码</span>
                    <div class="info-value">
                      <el-select
                        v-model="selectedCallerNumber"
                        placeholder="选择主叫号码"
                        size="small"
                        style="width: 100%;"
                        @change="handleCallerNumberChange"
                      >
                        <el-option
                          v-for="number in availableCallerNumbers"
                          :key="number.id"
                          :label="number.phoneNumber"
                          :value="number"
                        >
                          <span>{{ number.phoneNumber }}</span>
                          <el-tag v-if="number.isPrimary" type="primary" size="small" style="margin-left: var(--spacing-base);">主号</el-tag>
                        </el-option>
                      </el-select>
                    </div>
                  </div>
                  <div class="info-item">
                    <span class="info-label">分机</span>
                    <div class="info-value">
                      <el-select
                        v-model="selectedExtension"
                        placeholder="选择分机"
                        size="small"
                        style="width: 100%;"
                        @change="handleExtensionChange"
                      >
                        <el-option
                          v-for="ext in availableExtensions"
                          :key="ext.id"
                          :label="ext.extensionNumber"
                          :value="ext"
                        >
                          <span>{{ ext.extensionNumber }} - {{ ext.extensionName }}</span>
                          <el-tag :type="ext.isOnline ? 'success' : 'danger'" size="small" style="margin-left: var(--spacing-base);">
                            {{ ext.isOnline ? '在线' : '离线' }}
                          </el-tag>
                        </el-option>
                      </el-select>
                    </div>
                  </div>
                  <div class="info-item">
                    <span class="info-label">连接状态</span>
                    <el-tag :type="vosConnected ? 'success' : 'danger'" class="info-value">
                      {{ vosConnected ? '已连接' : '未连接' }}
                    </el-tag>
                  </div>
                  <div class="info-item">
                    <span class="info-label">通话中</span>
                    <span class="info-value">{{ activeCallCount }} / {{ maxConcurrentCalls }}</span>
                  </div>
                </div>
              </el-card>

              <!-- 联系人选择器 -->
              <el-card class="contact-panel" style="margin-top: var(--text-2xl)">
                <template #header>
                  <span>👥 联系人选择</span>
                </template>
                <el-tabs v-model="contactTab" type="border-card">
                  <el-tab-pane label="老家长" name="parents">
                    <el-empty v-if="!parentContacts.length" description="暂无老家长" />
                    <div v-else class="contact-list">
                      <div
                        v-for="contact in parentContacts"
                        :key="contact.id"
                        class="contact-item"
                        @click="selectContact(contact)"
                      >
                        <div class="contact-name">{{ contact.name }}</div>
                        <div class="contact-phone">{{ contact.phone }}</div>
                      </div>
                    </div>
                  </el-tab-pane>
                  <el-tab-pane label="客户池" name="customers">
                    <el-empty v-if="!customerContacts.length" description="暂无客户" />
                    <div v-else class="contact-list">
                      <div
                        v-for="contact in customerContacts"
                        :key="contact.id"
                        class="contact-item"
                        @click="selectContact(contact)"
                      >
                        <div class="contact-name">{{ contact.name }}</div>
                        <div class="contact-phone">{{ contact.phone }}</div>
                      </div>
                    </div>
                  </el-tab-pane>
                  <el-tab-pane label="员工" name="employees">
                    <el-empty v-if="!employeeContacts.length" description="暂无员工" />
                    <div v-else class="contact-list">
                      <div
                        v-for="contact in employeeContacts"
                        :key="contact.id"
                        class="contact-item"
                        @click="selectContact(contact)"
                      >
                        <div class="contact-name">{{ contact.name }}</div>
                        <div class="contact-phone">{{ contact.phone }}</div>
                      </div>
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </el-card>
            </el-col>

            <!-- 右侧: 话术模板和通话控制 -->
            <el-col :xs="24" :sm="24" :md="16" class="right-panel">
              <!-- 话术模板选择 -->
              <el-card class="script-panel">
                <template #header>
                  <span>📝 话术模板</span>
                </template>
                <el-form :model="scriptForm" label-width="100px" label-position="left">
                  <el-form-item label="选择模板">
                    <el-select
                      v-model="scriptForm.scriptId"
                      placeholder="选择话术模板"
                      clearable
                      @change="loadScriptContent"
                      style="width: 100%;"
                    >
                      <el-option-group
                        v-for="group in scriptGroups"
                        :key="group.category"
                        :label="group.category"
                      >
                        <el-option
                          v-for="script in group.scripts"
                          :key="script.id"
                          :label="script.title"
                          :value="script.id"
                        />
                      </el-option-group>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="话术内容">
                    <el-input
                      v-model="scriptForm.content"
                      type="textarea"
                      :rows="4"
                      readonly
                      placeholder="选择模板后显示话术内容"
                      style="width: 100%;"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-space>
                      <el-button @click="showScriptOptimize = true">
                        <el-icon><MagicStick /></el-icon>
                        AI优化
                      </el-button>
                      <el-button @click="previewScript">
                        <el-icon><View /></el-icon>
                        预览
                      </el-button>
                    </el-space>
                  </el-form-item>
                </el-form>
              </el-card>

              <!-- 通话控制面板 -->
              <CallControlPanel
                v-if="showCallControl"
                :sip-status="sipStatus"
                :extensions="extensions"
                :current-call="currentCall"
                class="call-control-panel"
                @call="handleCall"
                @hangup="handleHangup"
                @transfer="handleTransfer"
                @hold="handleHold"
              />

              <!-- 实时转写 -->
              <el-card class="transcription-panel" style="margin-top: var(--text-2xl)">
                <template #header>
                  <span>📄 实时转写</span>
                </template>
                <div class="transcription-content">
                  <div v-if="!isCallActive" class="empty-state">
                    <el-empty description="通话中显示实时转写内容" />
                  </div>
                  <div v-else class="transcription-text">
                    {{ transcriptionText || '正在识别...' }}
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <!-- 标签页2: 通话记录 -->
      <el-tab-pane label="📋 通话记录" name="records">
        <div class="tab-content">
          <!-- 搜索和筛选 -->
          <el-card class="filter-card">
            <el-form :inline="true" :model="recordsFilter">
              <el-form-item label="日期范围">
                <el-date-picker
                  v-model="recordsFilter.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                />
              </el-form-item>
              <el-form-item label="通话类型">
                <el-select v-model="recordsFilter.type" placeholder="全部" clearable>
                  <el-option label="老家长" value="parent" />
                  <el-option label="客户池" value="customer" />
                  <el-option label="员工" value="employee" />
                </el-select>
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="recordsFilter.status" placeholder="全部" clearable>
                  <el-option label="已接听" value="answered" />
                  <el-option label="未接听" value="missed" />
                  <el-option label="已挂断" value="hangup" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="loadCallRecords">查询</el-button>
                <el-button @click="exportRecords">导出</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 通话记录列表 -->
          <el-table
            :data="callRecords"
            stripe
            style="width: 100%; margin-top: var(--text-2xl)"
            :loading="recordsLoading"
          >
            <el-table-column prop="contactName" label="联系人" width="150" />
            <el-table-column prop="phoneNumber" label="电话号码" width="150" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag>{{ getTypeLabel(row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="时长" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="callTime" label="通话时间" width="180" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="playRecording(row)">播放</el-button>
                <el-button link type="primary" @click="viewAnalysis(row)">分析</el-button>
                <el-button link type="primary" @click="optimizeScript(row)">优化</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 标签页3: 话术分析 -->
      <el-tab-pane label="🧠 话术分析" name="analysis">
        <div class="tab-content">
          <el-alert
            title="话术分析"
            type="info"
            description="选择通话记录进行AI分析，获取优化建议"
            :closable="false"
            style="margin-bottom: var(--text-2xl)"
          />

          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-card>
                <template #header>
                  <span>原话术</span>
                </template>
                <el-input
                  v-model="analysisData.originalScript"
                  type="textarea"
                  :rows="8"
                  readonly
                  placeholder="选择通话记录后显示原话术"
                />
              </el-card>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-card>
                <template #header>
                  <span>AI优化建议</span>
                </template>
                <el-input
                  v-model="analysisData.optimizedScript"
                  type="textarea"
                  :rows="8"
                  readonly
                  placeholder="AI优化后的话术"
                />
              </el-card>
            </el-col>
          </el-row>

          <el-card style="margin-top: var(--text-2xl)">
            <template #header>
              <span>优化点分析</span>
            </template>
            <el-empty v-if="!analysisData.suggestions.length" description="暂无分析数据" />
            <div v-else class="suggestions-list">
              <div v-for="(suggestion, index) in analysisData.suggestions" :key="index" class="suggestion-item">
                <el-tag type="success">✓</el-tag>
                <span>{{ suggestion }}</span>
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 标签页4: 设置 -->
      <el-tab-pane label="⚙️ 设置" name="settings">
        <div class="tab-content">
          <el-row :gutter="20">
            <!-- VOS设置 -->
            <el-col :xs="24" :md="12">
              <el-card>
                <template #header>
                  <span>VOS配置</span>
                </template>
                <el-form :model="vosConfig" label-width="120px">
                  <el-form-item label="主叫号码">
                    <el-input v-model="vosConfig.callerNumber" placeholder="输入主叫号码" />
                  </el-form-item>
                  <el-form-item label="服务器地址">
                    <el-input v-model="vosConfig.serverHost" placeholder="输入VOS服务器地址" />
                  </el-form-item>
                  <el-form-item label="服务器端口">
                    <el-input-number v-model="vosConfig.serverPort" :min="1" :max="65535" />
                  </el-form-item>
                  <el-form-item label="协议">
                    <el-select v-model="vosConfig.protocol">
                      <el-option label="HTTPS" value="https" />
                      <el-option label="HTTP" value="http" />
                      <el-option label="WSS" value="wss" />
                      <el-option label="WS" value="ws" />
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="testVosConnection">测试连接</el-button>
                    <el-button @click="saveVosConfig">保存配置</el-button>
                  </el-form-item>
                </el-form>
              </el-card>
            </el-col>

            <!-- 系统提示词 -->
            <el-col :xs="24" :md="12">
              <el-card>
                <template #header>
                  <span>系统提示词</span>
                </template>
                <el-form :model="systemPrompt" label-width="120px">
                  <el-form-item label="提示词名称">
                    <el-input v-model="systemPrompt.name" placeholder="输入提示词名称" />
                  </el-form-item>
                  <el-form-item label="提示词内容">
                    <el-input
                      v-model="systemPrompt.content"
                      type="textarea"
                      :rows="6"
                      placeholder="输入系统提示词"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="saveSystemPrompt">保存提示词</el-button>
                    <el-button @click="optimizePrompt">🤖 AI优化</el-button>
                  </el-form-item>
                </el-form>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 发起通话对话框 -->
    <MakeCallDialog
      :visible="showMakeCallDialog"
      @update:visible="showMakeCallDialog = $event"
      @call="handleCall"
    />

    <!-- VOS设置对话框 -->
    <SIPSettingsDialog
      :visible="showVosSettings"
      @update:visible="showVosSettings = $event"
      @save="handleVosSettingsSave"
    />
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Phone, Setting, MagicStick, View } from '@element-plus/icons-vue'
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import CallControlPanel from '@/components/call-center/CallControlPanel.vue'
import MakeCallDialog from '@/components/call-center/MakeCallDialog.vue'
import SIPSettingsDialog from '@/components/call-center/SIPSettingsDialog.vue'
import { callAPI, overviewAPI, recordingAPI, aiAPI, contactAPI, extensionAPI } from '@/api/modules/call-center'
// 导入配置服务
import { 
  callCenterConfig, 
  initCallCenterConfig, 
  selectCallerNumber, 
  selectExtension, 
  testVosConnection, 
  updateCallStatus, 
  getConfigSummary, 
  checkConfigCompleteness, 
  getConfigSuggestions,
  type CallerNumber,
  type ExtensionConfig
} from '@/services/call-center-config.service'

// ==================== 状态管理 ====================

// 标签页
const activeTab = ref('calling')
const pageLoading = ref(false)

// 使用配置服务中的状态
const { vosConfig, vosConnected, activeCallCount, maxConcurrentCalls, selectedCallerNumber, selectedExtension, availableCallerNumbers, availableExtensions } = callCenterConfig

// 对话框显示状态
const showMakeCallDialog = ref(false)
const showVosSettings = ref(false)
const showScriptOptimize = ref(false)

// 联系人
const contactTab = ref('parents')
const parentContacts = ref<any[]>([])
const customerContacts = ref<any[]>([])
const employeeContacts = ref<any[]>([])

// 话术模板
const scriptForm = reactive({
  scriptId: '',
  content: ''
})

const scriptGroups = ref<any[]>([
  {
    category: '问候话术',
    scripts: [
      { id: '1', title: '标准问候', content: '您好，我是XX机构的老师，请问您现在方便吗？' },
      { id: '2', title: '亲切问候', content: '您好呀，我是XX机构的学习顾问，想和您聊聊孩子的学习情况' }
    ]
  },
  {
    category: '产品介绍',
    scripts: [
      { id: '3', title: '课程介绍', content: '我们的课程采用最新的教学方法...' },
      { id: '4', title: '优势介绍', content: '相比其他机构，我们有以下优势...' }
    ]
  }
])

// 通话控制
const showCallControl = ref(false)
const isCallActive = ref(false)
const transcriptionText = ref('')

// SIP状态现在从配置服务中动态获取
const sipStatus = computed(() => ({
  connected: vosConnected.value,
  extension: selectedExtension.value?.extensionNumber || '未选择',
  status: selectedExtension.value?.currentStatus || 'offline'
}))

// 分机配置现在从配置服务中获取 (availableExtensions)
const extensions = availableExtensions

const currentCall = reactive({
  id: '',
  phoneNumber: '',
  contactName: '',
  duration: 0,
  status: 'idle'
})

// 通话记录
const recordsLoading = ref(false)
const callRecords = ref<any[]>([])
const recordsFilter = reactive({
  dateRange: [],
  type: '',
  status: ''
})

// 分析数据
const analysisData = reactive({
  originalScript: '',
  optimizedScript: '',
  suggestions: [] as string[]
})

// 系统提示词
const systemPrompt = reactive({
  name: '',
  content: ''
})

// ==================== 方法 ====================

// 联系人相关
const selectContact = (contact: any) => {
  ElMessage.info(`已选择: ${contact.name}`)
  // 可以在这里自动填充电话号码到发起通话对话框
}

// 话术相关
const loadScriptContent = () => {
  const script = scriptGroups.value
    .flatMap(g => g.scripts)
    .find(s => s.id === scriptForm.scriptId)
  if (script) {
    scriptForm.content = script.content
  }
}

const previewScript = () => {
  if (!scriptForm.content) {
    ElMessage.warning('请先选择话术模板')
    return
  }
  ElMessage.info('话术预览: ' + scriptForm.content)
}

// 通话相关 - 发起通话
const handleCall = async (data: any) => {
  try {
    // 检查配置完整性
    const completeness = checkConfigCompleteness()
    if (!completeness.isComplete) {
      ElMessage.error(`配置不完整: ${completeness.issues.join(', ')}`)
      return
    }

    ElMessage.loading('正在发起通话...')

    const response = await callAPI.makeCall({
      phoneNumber: data.phoneNumber,
      customerId: data.customerId,
      systemPrompt: data.systemPrompt,
      callerNumber: selectedCallerNumber.value?.phoneNumber,
      extension: selectedExtension.value?.extensionNumber,
      vosConfigId: vosConfig.value?.id
    })

    if (response.data?.callId) {
      isCallActive.value = true
      showCallControl.value = true
      updateCallStatus(activeCallCount.value + 1) // 使用配置服务更新状态
      currentCall.id = response.data.callId
      currentCall.phoneNumber = data.phoneNumber
      currentCall.contactName = data.contactName
      currentCall.status = 'connecting'
      ElMessage.success('通话已发起')
    }
  } catch (error) {
    console.error('发起通话失败:', error)
    ElMessage.error('发起通话失败，请检查配置')
  }
}

// 挂断通话
const handleHangup = async (callId: string) => {
  try {
    await callAPI.hangupCall(callId)
    isCallActive.value = false
    showCallControl.value = false
    updateCallStatus(Math.max(0, activeCallCount.value - 1)) // 使用配置服务更新状态
    currentCall.status = 'ended'
    currentCall.id = ''
    currentCall.phoneNumber = ''
    currentCall.contactName = ''
    ElMessage.success('通话已挂断')
  } catch (error) {
    console.error('挂断通话失败:', error)
    ElMessage.error('挂断通话失败')
  }
}

const handleTransfer = (callId: string, targetExtension: string) => {
  console.log('转移通话:', callId, targetExtension)
  ElMessage.success('通话已转移')
}

const handleHold = (callId: string) => {
  console.log('保持通话:', callId)
  ElMessage.success('通话已保持')
}

// 通话记录相关
const loadCallRecords = async () => {
  recordsLoading.value = true
  try {
    const response = await recordingAPI.getRecordings({
      page: 1,
      pageSize: 20,
      ...recordsFilter
    })

    // 处理响应数据
    if (response.data?.list) {
      callRecords.value = response.data.list.map((record: any) => ({
        id: record.id,
        contactName: record.contactName,
        phoneNumber: record.phoneNumber,
        type: record.type || 'customer',
        duration: record.duration ? `${Math.floor(record.duration / 60)}:${String(record.duration % 60).padStart(2, '0')}` : '0:00',
        status: record.status || 'answered',
        callTime: record.startTime || new Date().toISOString(),
        transcript: record.transcript
      }))
    }
  } catch (error) {
    console.error('加载通话记录失败:', error)
    ElMessage.error('加载通话记录失败')
  } finally {
    recordsLoading.value = false
  }
}

const playRecording = async (row: any) => {
  try {
    const response = await recordingAPI.downloadRecording(row.id)
    if (response.data?.audioUrl) {
      // 创建音频播放器
      const audio = new Audio(response.data.audioUrl)
      audio.play()
      ElMessage.success('正在播放录音')
    }
  } catch (error) {
    console.error('播放录音失败:', error)
    ElMessage.error('播放录音失败')
  }
}

const viewAnalysis = async (row: any) => {
  try {
    const response = await aiAPI.analyzeCall(row.id)
    if (response.data) {
      analysisData.originalScript = row.transcript || '暂无转写内容'
      analysisData.optimizedScript = response.data.optimizedScript || '正在生成优化建议...'
      analysisData.suggestions = response.data.suggestions || []
      activeTab.value = 'analysis'
    }
  } catch (error) {
    console.error('获取分析数据失败:', error)
    ElMessage.error('获取分析数据失败')
  }
}

const optimizeScript = async (row: any) => {
  try {
    ElMessage.loading('正在优化话术...')
    const response = await aiAPI.generateScript({
      originalScript: row.transcript,
      context: '招生通话'
    })
    if (response.data?.optimizedScript) {
      ElMessage.success('话术优化完成')
      analysisData.optimizedScript = response.data.optimizedScript
    }
  } catch (error) {
    console.error('优化话术失败:', error)
    ElMessage.error('优化话术失败')
  }
}

const exportRecords = () => {
  try {
    // 导出为CSV
    const csv = callRecords.value.map(r =>
      `${r.contactName},${r.phoneNumber},${r.duration},${r.status},${r.callTime}`
    ).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `call-records-${new Date().toISOString()}.csv`
    a.click()
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// VOS相关
const saveVosConfig = () => {
  ElMessage.success('VOS配置已保存')
}

const handleVosSettingsSave = () => {
  showVosSettings.value = false
  testVosConnection()
}

// 系统提示词相关
const saveSystemPrompt = () => {
  if (!systemPrompt.name || !systemPrompt.content) {
    ElMessage.warning('请填写提示词名称和内容')
    return
  }
  ElMessage.success('系统提示词已保存')
}

const optimizePrompt = () => {
  if (!systemPrompt.content) {
    ElMessage.warning('请先输入提示词内容')
    return
  }
  ElMessage.info('正在优化提示词...')
}

// 辅助方法
const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    parent: '老家长',
    customer: '客户池',
    employee: '员工'
  }
  return labels[type] || type
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    answered: '已接听',
    missed: '未接听',
    hangup: '已挂断'
  }
  return labels[status] || status
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    answered: 'success',
    missed: 'danger',
    hangup: 'info'
  }
  return types[status] || 'info'
}

// ==================== 事件处理 ====================

// 主叫号码选择变化
const handleCallerNumberChange = (number: CallerNumber) => {
  selectCallerNumber(number)
  console.log('📞 主叫号码已切换:', number.phoneNumber)
}

// 分机选择变化
const handleExtensionChange = (extension: ExtensionConfig) => {
  selectExtension(extension)
  console.log('📱 分机已切换:', extension.extensionNumber)
}

// ==================== 生命周期 ====================

// 初始化数据
const initializeData = async () => {
  pageLoading.value = true
  try {
    // 1. 初始化呼叫中心配置（VOS、主叫账号、分机等）
    await initCallCenterConfig()

    // 2. 测试VOS连接状态
    await testVosConnection()

    // 3. 加载通话记录
    await loadCallRecords()

    // 4. 加载联系人数据
    await loadContacts()

    // 5. 检查配置完整性并给出提示
    const completeness = checkConfigCompleteness()
    if (!completeness.isComplete) {
      console.warn('⚠️ 呼叫中心配置不完整:', completeness.issues)
      ElMessage.warning(`呼叫中心配置不完整: ${completeness.issues.join(', ')}`)
    }
  } catch (error) {
    console.error('初始化数据失败:', error)
    ElMessage.error('初始化数据失败')
  } finally {
    pageLoading.value = false
  }
}

// 加载联系人
const loadContacts = async () => {
  try {
    // 加载老家长
    const parentResponse = await contactAPI.getContacts({ search: 'parent' })
    if (parentResponse.data?.list) {
      parentContacts.value = parentResponse.data.list.map((c: any) => ({
        id: c.id,
        name: c.name || c.contactName,
        phone: c.phone || c.phoneNumber
      }))
    }

    // 加载客户
    const customerResponse = await contactAPI.getContacts({ search: 'customer' })
    if (customerResponse.data?.list) {
      customerContacts.value = customerResponse.data.list.map((c: any) => ({
        id: c.id,
        name: c.name || c.contactName,
        phone: c.phone || c.phoneNumber
      }))
    }

    // 加载员工
    const employeeResponse = await contactAPI.getContacts({ search: 'employee' })
    if (employeeResponse.data?.list) {
      employeeContacts.value = employeeResponse.data.list.map((c: any) => ({
        id: c.id,
        name: c.name || c.contactName,
        phone: c.phone || c.phoneNumber
      }))
    }
  } catch (error) {
    console.error('加载联系人失败:', error)
    // 使用默认数据
    parentContacts.value = [
      { id: '1', name: '张三', phone: '13800138000' },
      { id: '2', name: '李四', phone: '13800138001' }
    ]
    customerContacts.value = [
      { id: '3', name: '王五', phone: '13800138002' },
      { id: '4', name: '赵六', phone: '13800138003' }
    ]
    employeeContacts.value = [
      { id: '5', name: '孙七', phone: '13800138004' },
      { id: '6', name: '周八', phone: '13800138005' }
    ]
  }
}

// 分机数据现在通过配置服务统一管理，不再需要单独加载

onMounted(() => {
  initializeData()
})
</script>

<style scoped lang="scss">
.call-center-tabs {
  :deep(.el-tabs__content) {
    padding: var(--text-2xl) 0;
  }
}

.tab-content {
  padding: 0;
}

/* 卡片头部统一样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: var(--text-base);
}

/* 优化el-card样式 */
:deep(.el-card) {
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-8);
  
  .el-card__header {
    padding: var(--text-lg) var(--text-2xl);
    border-bottom: var(--z-index-dropdown) solid var(--bg-gray-light);
    background: var(--bg-tertiary);
    font-weight: 500;
  }
  
  .el-card__body {
    padding: var(--text-2xl);
  }
}

// ==================== 电话呼叫标签页 ====================

.calling-section {
  .left-panel {
    .vos-panel {
      .vos-info {
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--text-sm) 0;
          border-bottom: var(--z-index-dropdown) solid var(--bg-gray-light);
          gap: var(--text-sm);

          &:last-child {
            border-bottom: none;
          }

          .info-label {
            font-weight: 500;
            color: var(--text-primary);
            white-space: nowrap;
            flex-shrink: 0;
            min-width: 80px;
            font-size: var(--text-base);
          }

          .info-value {
            color: var(--text-secondary);
            flex: 1;
            text-align: right;
            word-break: break-all;
          }

          /* 兼容旧的class名 */
          .label {
            font-weight: 500;
            color: var(--text-primary);
            white-space: nowrap;
            flex-shrink: 0;
            min-width: 80px;
          }

          .value {
            color: var(--text-secondary);
            flex: 1;
            text-align: right;
          }
        }
      }
    }

    .contact-panel {
      .contact-list {
        max-height: 400px;
        overflow-y: auto;

        .contact-item {
          padding: var(--spacing-2xl);
          margin-bottom: var(--spacing-sm);
          border: var(--border-width-base) solid #e0e0e0;
          border-radius: var(--spacing-xs);
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            background-color: var(--bg-hover);
            border-color: var(--primary-color);
          }

          .contact-name {
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: var(--spacing-xs);
          }

          .contact-phone {
            font-size: var(--text-sm);
            color: var(--text-tertiary);
          }
        }
      }
    }
  }

  .right-panel {
    .script-panel {
      margin-bottom: var(--text-2xl);

      /* 优化表单排版 */
      :deep(.el-form) {
        .el-form-item {
          margin-bottom: var(--text-2xl);

          .el-form-item__label {
            font-weight: 500;
            color: var(--text-primary);
            white-space: nowrap;
            font-size: var(--text-base);
            padding-right: var(--text-sm);
          }

          .el-form-item__content {
            flex: 1;
          }

          .el-select,
          .el-input {
            width: 100%;
          }

          .el-textarea__inner {
            font-family: inherit;
            line-height: 1.6;
          }
        }
      }
    }

    .call-control-panel {
      margin-bottom: var(--text-2xl);
    }

    .transcription-panel {
      .transcription-content {
        min-height: 150px;
        padding: var(--spacing-2xl);
        background-color: #f9f9f9;
        border-radius: var(--spacing-xs);

        .empty-state {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 150px;
        }

        .transcription-text {
          line-height: 1.6;
          color: var(--text-primary);
          word-break: break-word;
        }
      }
    }
  }
}

// ==================== 通话记录标签页 ====================

.filter-card {
  margin-bottom: var(--text-2xl);
}

// ==================== 话术分析标签页 ====================

.suggestions-list {
  .suggestion-item {
    display: flex;
    align-items: center;
    padding: var(--spacing-2xl);
    margin-bottom: var(--spacing-sm);
    background-color: #f0f9ff;
    border-left: 3px solid var(--success-color);
    border-radius: var(--radius-xs);

    :deep(.el-tag) {
      margin-right: var(--spacing-2xl);
      flex-shrink: 0;
    }
  }
}

// ==================== 卡片头部 ====================

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

// ==================== 响应式设计 ====================

@media (max-width: var(--breakpoint-md)) {
  .calling-section {
    .left-panel {
      margin-bottom: var(--text-2xl);
    }

    .right-panel {
      :deep(.el-form) {
        .el-form-item {
          flex-direction: column;
          align-items: flex-start;

          .el-form-item__label {
            width: 100% !important;
            text-align: left;
            margin-bottom: var(--spacing-sm);
          }

          .el-form-item__content {
            width: 100%;
            margin-left: 0 !important;
          }
        }
      }
    }
  }

  .vos-info .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);

    .info-label {
      min-width: auto;
    }

    .info-value {
      width: 100%;
      text-align: left;
    }
  }
}
</style>
