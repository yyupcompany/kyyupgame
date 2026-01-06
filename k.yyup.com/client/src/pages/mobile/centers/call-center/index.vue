<template>
  <MobileMainLayout
    title="呼叫中心"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <!-- 头部操作按钮 -->
    <template #header-extra>
      <van-icon name="plus" size="18" @click="showMakeCallDialog = true" />
    </template>

    <div class="call-center-mobile">
      <!-- 标签页 -->
      <van-tabs v-model:active="activeTab" sticky animated>
        <!-- 标签页1: 电话呼叫 -->
        <van-tab title="📞 电话呼叫" name="calling">
          <div class="tab-content">
            <!-- VOS设置面板 -->
            <van-cell-group inset title="⚙️ VOS设置" class="vos-panel">
              <van-cell title="VOS配置" :value="vosConfig?.name || '未配置'" />
              <van-cell
                title="主叫号码"
                is-link
                :value="selectedCallerNumber?.phoneNumber || '点击选择'"
                @click="showCallerPicker = true"
              />
              <van-cell
                title="分机"
                is-link
                :value="selectedExtension?.extensionNumber || '点击选择'"
                @click="showExtensionPicker = true"
              />
              <van-cell title="连接状态">
                <template #right-icon>
                  <van-tag :type="vosConnected ? 'success' : 'danger'">
                    {{ vosConnected ? '已连接' : '未连接' }}
                  </van-tag>
                </template>
              </van-cell>
              <van-cell title="通话中" :value="`${activeCallCount || 0} / ${maxConcurrentCalls || 5}`" />
              <van-cell title="操作">
                <template #right-icon>
                  <van-button size="small" @click="showVosSettings = true">编辑</van-button>
                </template>
              </van-cell>
            </van-cell-group>

            <!-- 联系人选择器 -->
            <van-cell-group inset title="👥 联系人选择" class="contact-panel">
              <van-tabs v-model:active="contactTab" type="card" shrink>
                <van-tab title="老家长" name="parents">
                  <van-empty v-if="!parentContacts.length" description="暂无老家长" />
                  <van-cell
                    v-for="contact in parentContacts"
                    :key="contact.id"
                    :title="contact.name"
                    :label="contact.phone"
                    is-link
                    @click="selectContact(contact)"
                    class="contact-item"
                  />
                </van-tab>
                <van-tab title="客户池" name="customers">
                  <van-empty v-if="!customerContacts.length" description="暂无客户" />
                  <van-cell
                    v-for="contact in customerContacts"
                    :key="contact.id"
                    :title="contact.name"
                    :label="contact.phone"
                    is-link
                    @click="selectContact(contact)"
                    class="contact-item"
                  />
                </van-tab>
                <van-tab title="员工" name="employees">
                  <van-empty v-if="!employeeContacts.length" description="暂无员工" />
                  <van-cell
                    v-for="contact in employeeContacts"
                    :key="contact.id"
                    :title="contact.name"
                    :label="contact.phone"
                    is-link
                    @click="selectContact(contact)"
                    class="contact-item"
                  />
                </van-tab>
              </van-tabs>
            </van-cell-group>

            <!-- 话术模板选择 -->
            <van-cell-group inset title="📝 话术模板" class="script-panel">
              <van-field
                v-model="scriptForm.scriptId"
                label="选择模板"
                placeholder="请选择话术模板"
                readonly
                is-link
                @click="showScriptPicker = true"
              />
              <van-field
                v-model="scriptForm.content"
                label="话术内容"
                type="textarea"
                rows="4"
                readonly
                placeholder="选择模板后显示话术内容"
              />
              <div class="script-actions">
                <van-button plain type="primary" size="small" @click="showScriptOptimize = true">
                  <van-icon name="fire" /> AI优化
                </van-button>
                <van-button plain type="info" size="small" @click="previewScript">
                  <van-icon name="eye" /> 预览
                </van-button>
              </div>
            </van-cell-group>

            <!-- 实时转写 -->
            <van-cell-group inset title="📄 实时转写" class="transcription-panel">
              <div class="transcription-content">
                <van-empty v-if="!isCallActive" description="通话中显示实时转写内容" />
                <div v-else class="transcription-text">
                  {{ transcriptionText || '正在识别...' }}
                </div>
              </div>
            </van-cell-group>
          </div>
        </van-tab>

        <!-- 标签页2: 通话记录 -->
        <van-tab title="📋 通话记录" name="records">
          <div class="tab-content">
            <!-- 搜索和筛选 -->
            <van-cell-group inset class="filter-card">
              <van-field
                v-model="recordsFilter.keyword"
                label="搜索"
                placeholder="联系人或电话号码"
                clearable
              >
                <template #right-icon>
                  <van-icon name="search" />
                </template>
              </van-field>
              <van-cell title="日期范围" :value="dateRangeText" is-link @click="showDateRange = true" />
              <van-cell title="通话类型" :value="typeText" is-link @click="showTypePicker = true" />
              <van-cell title="状态" :value="statusText" is-link @click="showStatusPicker = true" />
              <div class="filter-actions">
                <van-button type="primary" block @click="loadCallRecords">查询</van-button>
                <van-button plain block @click="exportRecords" style="margin-top: 8px;">导出</van-button>
              </div>
            </van-cell-group>

            <!-- 通话记录列表 -->
            <van-list
              v-model:loading="recordsLoading"
              :finished="recordsFinished"
              finished-text="没有更多了"
              @load="loadCallRecords"
            >
              <van-cell
                v-for="record in callRecords"
                :key="record.id"
                class="call-record-item"
                @click="viewRecordDetail(record)"
              >
                <template #title>
                  <div class="record-header">
                    <span class="contact-name">{{ record.contactName }}</span>
                    <van-tag :type="getStatusType(record.status)" size="small">
                      {{ getStatusLabel(record.status) }}
                    </van-tag>
                  </div>
                </template>
                <template #label>
                  <div class="record-info">
                    <div class="phone-number">{{ record.phoneNumber }}</div>
                    <div class="call-meta">
                      <span>{{ getTypeLabel(record.type) }}</span>
                      <span>·</span>
                      <span>{{ record.duration }}</span>
                      <span>·</span>
                      <span>{{ formatTime(record.callTime) }}</span>
                    </div>
                  </div>
                </template>
                <template #right-icon>
                  <div class="record-actions">
                    <van-icon name="play-circle" size="20" @click.stop="playRecording(record)" />
                    <van-icon name="chart-trending-o" size="20" @click.stop="viewAnalysis(record)" />
                    <van-icon name="edit" size="20" @click.stop="optimizeScript(record)" />
                  </div>
                </template>
              </van-cell>
            </van-list>
          </div>
        </van-tab>

        <!-- 标签页3: 话术分析 -->
        <van-tab title="🧠 话术分析" name="analysis">
          <div class="tab-content">
            <van-notice-bar
              left-icon="info"
              text="选择通话记录进行AI分析，获取优化建议"
              background="#e6f7ff"
              color="#1890ff"
            />

            <van-cell-group inset title="原话术" class="analysis-original">
              <van-field
                v-model="analysisData.originalScript"
                type="textarea"
                rows="8"
                readonly
                placeholder="选择通话记录后显示原话术"
              />
            </van-cell-group>

            <van-cell-group inset title="AI优化建议" class="analysis-optimized">
              <van-field
                v-model="analysisData.optimizedScript"
                type="textarea"
                rows="8"
                readonly
                placeholder="AI优化后的话术"
              />
            </van-cell-group>

            <van-cell-group inset title="优化点分析" class="analysis-suggestions">
              <van-empty v-if="!analysisData.suggestions.length" description="暂无分析数据" />
              <van-cell
                v-for="(suggestion, index) in analysisData.suggestions"
                :key="index"
                class="suggestion-item"
              >
                <template #title>
                  <div class="suggestion-content">
                    <van-icon name="success" color="#07c160" />
                    <span>{{ suggestion }}</span>
                  </div>
                </template>
              </van-cell>
            </van-cell-group>
          </div>
        </van-tab>

        <!-- 标签页4: 设置 -->
        <van-tab title="⚙️ 设置" name="settings">
          <div class="tab-content">
            <!-- VOS设置 -->
            <van-cell-group inset title="VOS配置" class="vos-settings">
              <van-field
                v-model="vosConfigForm.callerNumber"
                label="主叫号码"
                placeholder="输入主叫号码"
              />
              <van-field
                v-model="vosConfigForm.serverHost"
                label="服务器地址"
                placeholder="输入VOS服务器地址"
              />
              <van-field
                v-model.number="vosConfigForm.serverPort"
                label="服务器端口"
                type="number"
                placeholder="输入端口号"
              />
              <van-field
                v-model="vosConfigForm.protocol"
                label="协议"
                placeholder="选择协议"
                readonly
                is-link
                @click="showProtocolPicker = true"
              />
              <div class="settings-actions">
                <van-button type="primary" @click="testVosConnection">测试连接</van-button>
                <van-button @click="saveVosConfig">保存配置</van-button>
              </div>
            </van-cell-group>

            <!-- 系统提示词 -->
            <van-cell-group inset title="系统提示词" class="system-prompt">
              <van-field
                v-model="systemPrompt.name"
                label="提示词名称"
                placeholder="输入提示词名称"
              />
              <van-field
                v-model="systemPrompt.content"
                label="提示词内容"
                type="textarea"
                rows="6"
                placeholder="输入系统提示词"
              />
              <div class="settings-actions">
                <van-button type="primary" @click="saveSystemPrompt">保存提示词</van-button>
                <van-button @click="optimizePrompt">
                  <van-icon name="fire" /> 🤖 AI优化
                </van-button>
              </div>
            </van-cell-group>
          </div>
        </van-tab>
      </van-tabs>

      <!-- 发起通话按钮 -->
      <van-floating-bubble
        v-if="activeTab === 'calling'"
        axis="xy"
        icon="phone"
        color="#1989fa"
        @click="showMakeCallDialog = true"
      />
    </div>

    <!-- 话术模板选择弹窗 -->
    <van-popup v-model:show="showScriptPicker" position="bottom" :style="{ height: '60%' }">
      <van-picker
        :columns="scriptPickerColumns"
        @confirm="onScriptConfirm"
        @cancel="showScriptPicker = false"
      />
    </van-popup>

    <!-- 日期范围选择弹窗 -->
    <van-calendar v-model:show="showDateRange" type="range" @confirm="onDateRangeConfirm" />

    <!-- 通话类型选择弹窗 -->
    <van-action-sheet
      v-model:show="showTypePicker"
      :actions="typeActions"
      @select="onTypeSelect"
    />

    <!-- 状态选择弹窗 -->
    <van-action-sheet
      v-model:show="showStatusPicker"
      :actions="statusActions"
      @select="onStatusSelect"
    />

    <!-- 协议选择弹窗 -->
    <van-action-sheet
      v-model:show="showProtocolPicker"
      :actions="protocolActions"
      @select="onProtocolSelect"
    />

    <!-- 发起通话弹窗 -->
    <van-popup v-model:show="showMakeCallDialog" position="bottom" :style="{ height: '80%' }">
      <MakeCallDialog
        :visible="showMakeCallDialog"
        :contacts="allContacts"
        :extensions="availableExtensions || []"
        @update:visible="showMakeCallDialog = $event"
        @call="handleCall"
      />
    </van-popup>

    <!-- VOS设置弹窗 -->
    <van-popup v-model:show="showVosSettings" position="bottom" :style="{ height: '80%' }">
      <SIPSettingsDialog
        :visible="showVosSettings"
        :sip-config="sipConfigData"
        @update:visible="showVosSettings = $event"
        @save="handleVosSettingsSave"
      />
    </van-popup>

    <!-- 主叫号码选择器 -->
    <van-popup v-model:show="showCallerPicker" position="bottom">
      <van-picker
        title="选择主叫号码"
        :columns="callerPickerColumns"
        @confirm="onCallerConfirm"
        @cancel="showCallerPicker = false"
      />
    </van-popup>

    <!-- 分机选择器 -->
    <van-popup v-model:show="showExtensionPicker" position="bottom">
      <van-picker
        title="选择分机"
        :columns="extensionPickerColumns"
        @confirm="onExtensionConfirm"
        @cancel="showExtensionPicker = false"
      />
    </van-popup>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useUserStore } from '@/stores/user'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import MakeCallDialog from '@/components/call-center/MakeCallDialog.vue'
import SIPSettingsDialog from '@/components/call-center/SIPSettingsDialog.vue'
import { callAPI, overviewAPI, recordingAPI, aiAPI, contactAPI, extensionAPI } from '@/api/modules/call-center'
import {
  callCenterConfig,
  initCallCenterConfig,
  selectCallerNumber,
  selectExtension,
  testVosConnection,
  updateCallStatus,
  checkConfigCompleteness,
  type CallerNumber,
  type ExtensionConfig
} from '@/services/call-center-config.service'

// ==================== 状态管理 ====================

const userStore = useUserStore()

// 标签页
const activeTab = ref('calling')
const contactTab = ref('parents')
const pageLoading = ref(false)

// 使用配置服务中的状态
const { vosConfig, vosConnected, activeCallCount, maxConcurrentCalls, selectedCallerNumber, selectedExtension, availableCallerNumbers, availableExtensions } = callCenterConfig

// 对话框显示状态
const showMakeCallDialog = ref(false)
const showVosSettings = ref(false)
const showScriptOptimize = ref(false)
const showScriptPicker = ref(false)
const showDateRange = ref(false)
const showTypePicker = ref(false)
const showStatusPicker = ref(false)
const showProtocolPicker = ref(false)
const showCallerPicker = ref(false)
const showExtensionPicker = ref(false)

// 联系人数据
const parentContacts = ref<any[]>([])
const customerContacts = ref<any[]>([])
const employeeContacts = ref<any[]>([])

// 所有联系人（用于MakeCallDialog）
const allContacts = computed(() => {
  return [
    ...parentContacts.value.map(c => ({ ...c, type: 'parent' })),
    ...customerContacts.value.map(c => ({ ...c, type: 'customer' })),
    ...employeeContacts.value.map(c => ({ ...c, type: 'employee' }))
  ]
})

// SIP配置数据
const sipConfigData = computed(() => {
  if (!vosConfig.value) {
    return {
      server: '',
      port: 443,
      username: '',
      password: '',
      extension: '',
      domain: '',
      transport: 'udp',
      codecs: ['PCMU', 'PCMA'],
      registerTimeout: 3600,
      keepAlive: true,
      debug: false
    }
  }
  return {
    server: vosConfig.value.serverHost || '',
    port: vosConfig.value.serverPort || 443,
    username: vosConfig.value.username || '',
    password: vosConfig.value.password || '',
    extension: selectedExtension.value?.extensionNumber || '',
    domain: vosConfig.value.domain || '',
    transport: vosConfig.value.protocol === 'wss' || vosConfig.value.protocol === 'ws' ? 'ws' : 'udp',
    codecs: ['PCMU', 'PCMA'],
    registerTimeout: 3600,
    keepAlive: true,
    debug: false
  }
})

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

// 话术选择器配置
const scriptPickerColumns = computed(() => {
  const columns: any[] = []
  scriptGroups.value.forEach(group => {
    columns.push({
      text: group.category,
      children: group.scripts.map(script => ({
        text: script.title,
        value: script.id,
        content: script.content
      }))
    })
  })
  return columns
})

// 主叫号码选择器配置
const callerPickerColumns = computed(() => {
  return (availableCallerNumbers.value || []).map(number => ({
    text: number.phoneNumber + (number.isPrimary ? ' (主号)' : ''),
    value: number
  }))
})

// 分机选择器配置
const extensionPickerColumns = computed(() => {
  return (availableExtensions.value || []).map(ext => ({
    text: `${ext.extensionNumber} - ${ext.extensionName} (${ext.isOnline ? '在线' : '离线'})`,
    value: ext
  }))
})

// 主叫号码选择确认
const onCallerConfirm = ({ selectedOptions }: any) => {
  if (selectedOptions && selectedOptions[0]) {
    selectCallerNumber(selectedOptions[0].value)
  }
  showCallerPicker.value = false
}

// 分机选择确认
const onExtensionConfirm = ({ selectedOptions }: any) => {
  if (selectedOptions && selectedOptions[0]) {
    selectExtension(selectedOptions[0].value)
  }
  showExtensionPicker.value = false
}

// 通话控制
const showCallControl = ref(false)
const isCallActive = ref(false)
const transcriptionText = ref('')

// SIP状态
const sipStatus = computed(() => ({
  connected: vosConnected.value,
  extension: selectedExtension.value?.extensionNumber || '未选择',
  status: selectedExtension.value?.currentStatus || 'offline'
}))

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
const recordsFinished = ref(false)
const callRecords = ref<any[]>([])
const recordsFilter = reactive({
  keyword: '',
  dateRange: [],
  type: '',
  status: '',
  page: 1,
  pageSize: 20
})

// 筛选显示文本
const dateRangeText = computed(() => {
  if (!recordsFilter.dateRange || recordsFilter.dateRange.length === 0) return '选择日期范围'
  const [start, end] = recordsFilter.dateRange
  return `${start} - ${end}`
})

const typeText = computed(() => {
  const labels: Record<string, string> = {
    parent: '老家长',
    customer: '客户池',
    employee: '员工'
  }
  return labels[recordsFilter.type] || '全部'
})

const statusText = computed(() => {
  const labels: Record<string, string> = {
    answered: '已接听',
    missed: '未接听',
    hangup: '已挂断'
  }
  return labels[recordsFilter.status] || '全部'
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

// VOS配置表单
const vosConfigForm = reactive({
  callerNumber: '',
  serverHost: '',
  serverPort: 443,
  protocol: 'https'
})

// 动作配置
const typeActions = [
  { name: '全部', value: '' },
  { name: '老家长', value: 'parent' },
  { name: '客户池', value: 'customer' },
  { name: '员工', value: 'employee' }
]

const statusActions = [
  { name: '全部', value: '' },
  { name: '已接听', value: 'answered' },
  { name: '未接听', value: 'missed' },
  { name: '已挂断', value: 'hangup' }
]

const protocolActions = [
  { name: 'HTTPS', value: 'https' },
  { name: 'HTTP', value: 'http' },
  { name: 'WSS', value: 'wss' },
  { name: 'WS', value: 'ws' }
]

// 监听vosConfig变化
watch(() => vosConfig.value, (newConfig) => {
  if (newConfig) {
    vosConfigForm.callerNumber = newConfig.callerNumber || ''
    vosConfigForm.serverHost = newConfig.serverHost || ''
    vosConfigForm.serverPort = newConfig.serverPort || 443
    vosConfigForm.protocol = newConfig.protocol || 'https'
  }
}, { immediate: true })

// ==================== 方法 ====================

// 联系人相关
const selectContact = (contact: any) => {
  showToast(`已选择: ${contact.name}`)
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
    showToast('请先选择话术模板')
    return
  }
  showToast('话术预览: ' + scriptForm.content)
}

const onScriptConfirm = (value: any) => {
  scriptForm.scriptId = value.value
  scriptForm.content = value.content
  showScriptPicker.value = false
  loadScriptContent()
}

// 通话相关
const handleCall = async (data: any) => {
  try {
    const completeness = checkConfigCompleteness()
    if (!completeness.isComplete) {
      showToast(`配置不完整: ${completeness.issues.join(', ')}`)
      return
    }

    if (!selectedCallerNumber.value?.phoneNumber) {
      showToast('请选择主叫号码')
      return
    }

    if (!selectedExtension.value?.extensionNumber) {
      showToast('请选择分机号')
      return
    }

    if (!vosConfig.value?.id) {
      showToast('VOS配置未完成，请先配置VOS设置')
      return
    }

    showLoadingToast({ message: '正在发起通话...', forbidClick: true })

    const response = await callAPI.makeCall({
      phoneNumber: data.phoneNumber,
      customerId: data.customerId,
      systemPrompt: data.systemPrompt,
      callerNumber: selectedCallerNumber.value.phoneNumber,
      extension: selectedExtension.value.extensionNumber,
      vosConfigId: vosConfig.value.id
    })

    if (response.data?.callId) {
      isCallActive.value = true
      showCallControl.value = true
      const currentCallCount = activeCallCount.value || 0
      updateCallStatus(currentCallCount + 1)
      currentCall.id = response.data.callId
      currentCall.phoneNumber = data.phoneNumber
      currentCall.contactName = data.contactName || '未知联系人'
      currentCall.status = 'connecting'
      showToast('通话已发起')
    } else {
      throw new Error('通话发起失败，服务器未返回callId')
    }
  } catch (error: any) {
    console.error('发起通话失败:', error)
    const errorMessage = error.response?.data?.message || error.message || '发起通话失败，请检查配置'
    showToast(errorMessage)
  } finally {
    closeToast()
  }
}

const handleHangup = async (callId: string) => {
  try {
    await callAPI.hangupCall(callId)
    isCallActive.value = false
    showCallControl.value = false
    const currentCallCount = activeCallCount.value || 0
    updateCallStatus(Math.max(0, currentCallCount - 1))
    currentCall.status = 'ended'
    currentCall.id = ''
    currentCall.phoneNumber = ''
    currentCall.contactName = ''
    showToast('通话已挂断')
  } catch (error) {
    console.error('挂断通话失败:', error)
    showToast('挂断通话失败')
  }
}

// 通话记录相关
const loadCallRecords = async () => {
  if (recordsFinished.value) return

  recordsLoading.value = true
  try {
    const response = await recordingAPI.getRecordings({
      page: recordsFilter.page,
      pageSize: recordsFilter.pageSize,
      ...recordsFilter
    })

    if (response.data?.list) {
      const newRecords = response.data.list.map((record: any) => ({
        id: record.id,
        contactName: record.contactName,
        phoneNumber: record.phoneNumber,
        type: record.type || 'customer',
        duration: record.duration ? `${Math.floor(record.duration / 60)}:${String(record.duration % 60).padStart(2, '0')}` : '0:00',
        status: record.status || 'answered',
        callTime: record.startTime || new Date().toISOString(),
        transcript: record.transcript
      }))

      if (recordsFilter.page === 1) {
        callRecords.value = newRecords
      } else {
        callRecords.value.push(...newRecords)
      }

      if (newRecords.length < recordsFilter.pageSize) {
        recordsFinished.value = true
      } else {
        recordsFilter.page++
      }
    }
  } catch (error) {
    console.error('加载通话记录失败:', error)
    showToast('加载通话记录失败')
  } finally {
    recordsLoading.value = false
  }
}

const playRecording = async (row: any) => {
  try {
    const response = await recordingAPI.downloadRecording(row.id)
    if (response.data?.audioUrl) {
      const audio = new Audio(response.data.audioUrl)
      audio.play()
      showToast('正在播放录音')
    }
  } catch (error) {
    console.error('播放录音失败:', error)
    showToast('播放录音失败')
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
    showToast('获取分析数据失败')
  }
}

const optimizeScript = async (row: any) => {
  try {
    showLoadingToast({ message: '正在优化话术...', forbidClick: true })
    const response = await aiAPI.generateScript({
      originalScript: row.transcript,
      context: '招生通话'
    })
    if (response.data?.optimizedScript) {
      showToast('话术优化完成')
      analysisData.optimizedScript = response.data.optimizedScript
    }
  } catch (error) {
    console.error('优化话术失败:', error)
    showToast('优化话术失败')
  } finally {
    closeToast()
  }
}

const viewRecordDetail = (record: any) => {
  // 查看记录详情
  console.log('查看记录详情:', record)
}

const exportRecords = () => {
  try {
    const csv = callRecords.value.map(r =>
      `${r.contactName},${r.phoneNumber},${r.duration},${r.status},${r.callTime}`
    ).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `call-records-${new Date().toISOString()}.csv`
    a.click()
    showToast('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    showToast('导出失败')
  }
}

// VOS相关
const saveVosConfig = () => {
  showToast('VOS配置已保存')
}

const handleVosSettingsSave = () => {
  showVosSettings.value = false
  testVosConnection()
}

// 系统提示词相关
const saveSystemPrompt = () => {
  if (!systemPrompt.name || !systemPrompt.content) {
    showToast('请填写提示词名称和内容')
    return
  }
  showToast('系统提示词已保存')
}

const optimizePrompt = () => {
  if (!systemPrompt.content) {
    showToast('请先输入提示词内容')
    return
  }
  showToast('正在优化提示词...')
}

// 选择器事件
const onDateRangeConfirm = (value: any) => {
  recordsFilter.dateRange = value.map((date: Date) => date.toISOString().split('T')[0])
  showDateRange.value = false
  recordsFilter.page = 1
  recordsFinished.value = false
  loadCallRecords()
}

const onTypeSelect = (action: any) => {
  recordsFilter.type = action.value
  showTypePicker.value = false
  recordsFilter.page = 1
  recordsFinished.value = false
  loadCallRecords()
}

const onStatusSelect = (action: any) => {
  recordsFilter.status = action.value
  showStatusPicker.value = false
  recordsFilter.page = 1
  recordsFinished.value = false
  loadCallRecords()
}

const onProtocolSelect = (action: any) => {
  vosConfigForm.protocol = action.value
  showProtocolPicker.value = false
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

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 事件处理
const handleCallerNumberChange = (number: CallerNumber) => {
  selectCallerNumber(number)
  console.log('📞 主叫号码已切换:', number.phoneNumber)
}

const handleExtensionChange = (extension: ExtensionConfig) => {
  selectExtension(extension)
  console.log('📱 分机已切换:', extension.extensionNumber)
}

// ==================== 生命周期 ====================

// 初始化数据
const initializeData = async () => {
  pageLoading.value = true
  showLoadingToast({ message: '加载中...', forbidClick: true })
  try {
    await initCallCenterConfig()
    await testVosConnection()
    await loadCallRecords()
    await loadContacts()

    const completeness = checkConfigCompleteness()
    if (!completeness.isComplete) {
      console.warn('⚠️ 呼叫中心配置不完整:', completeness.issues)
      showToast(`呼叫中心配置不完整: ${completeness.issues.join(', ')}`)
    }
  } catch (error) {
    console.error('初始化数据失败:', error)
    showToast('初始化数据失败')
  } finally {
    pageLoading.value = false
    closeToast()
  }
}

// 加载联系人
const loadContacts = async () => {
  try {
    const parentResponse = await contactAPI.getContacts({ search: 'parent' })
    if (parentResponse.data?.list) {
      parentContacts.value = parentResponse.data.list.map((c: any) => ({
        id: c.id,
        name: c.name || c.contactName,
        phone: c.phone || c.phoneNumber
      }))
    }

    const customerResponse = await contactAPI.getContacts({ search: 'customer' })
    if (customerResponse.data?.list) {
      customerContacts.value = customerResponse.data.list.map((c: any) => ({
        id: c.id,
        name: c.name || c.contactName,
        phone: c.phone || c.phoneNumber
      }))
    }

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

onMounted(() => {
  initializeData()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.call-center-mobile {
  min-height: 100vh;
  background-color: var(--van-background-color-light);

  .tab-content {
    padding: 0 0 20px 0;
  }

  // VOS面板样式
  .vos-panel {
    margin-bottom: 12px;

    .caller-option, .extension-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
  }

  // 联系人面板样式
  .contact-panel {
    margin-bottom: 12px;

    .contact-item {
      margin-bottom: 8px;

      &:active {
        background-color: var(--van-cell-active-color);
      }
    }
  }

  // 话术面板样式
  .script-panel {
    margin-bottom: 12px;

    .script-actions {
      display: flex;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);

      .van-button {
        flex: 1;
      }
    }
  }

  // 转写面板样式
  .transcription-panel {
    margin-bottom: 12px;

    .transcription-content {
      min-height: 100px;
      padding: var(--spacing-md);
      background-color: var(--van-background-color-lighter);
      border-radius: var(--van-radius-md);

      .transcription-text {
        line-height: 1.6;
        color: var(--van-text-color);
        word-break: break-word;
      }
    }
  }

  // 筛选卡片样式
  .filter-card {
    margin-bottom: 12px;

    .filter-actions {
      padding: var(--spacing-md);
      display: flex;
      flex-direction: column;
    }
  }

  // 通话记录样式
  .call-record-item {
    margin-bottom: 8px;

    .record-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .contact-name {
        font-weight: 600;
        color: var(--van-text-color);
      }
    }

    .record-info {
      margin-top: 4px;

      .phone-number {
        font-size: var(--text-sm);
        color: var(--van-text-color-secondary);
        margin-bottom: 4px;
      }

      .call-meta {
        font-size: var(--text-xs);
        color: var(--van-text-color-regular);

        span {
          margin-right: 4px;

          &:not(:last-child) {
            margin-right: 8px;
          }
        }
      }
    }

    .record-actions {
      display: flex;
      gap: var(--spacing-md);

      .van-icon {
        color: var(--van-primary-color);

        &:active {
          opacity: 0.7;
        }
      }
    }
  }

  // 话术分析样式
  .analysis-original, .analysis-optimized, .analysis-suggestions {
    margin-bottom: 12px;
  }

  .suggestion-item {
    .suggestion-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      .van-icon {
        flex-shrink: 0;
      }

      span {
        flex: 1;
        line-height: 1.5;
      }
    }
  }

  // 设置页面样式
  .vos-settings, .system-prompt {
    margin-bottom: 12px;

    .settings-actions {
      padding: var(--spacing-md);
      display: flex;
      gap: var(--spacing-sm);

      .van-button {
        flex: 1;
      }
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .call-center-mobile {
    max-width: 768px;
    margin: 0 auto;
  }
}
</style>