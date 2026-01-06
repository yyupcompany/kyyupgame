<template>
  <div class="call-control-panel">
    <!-- SIP连接状态 -->
    <div class="sip-status-card">
      <div class="status-header">
        <h3>SIP连接状态</h3>
        <el-tag :type="sipConnectionStatus" size="small">
          {{ sipConnectionText }}
        </el-tag>
      </div>
      <div class="status-details">
        <div class="status-item">
          <span class="label">服务器:</span>
          <span class="value">{{ sipStatus.server }}</span>
        </div>
        <div class="status-item">
          <span class="label">分机:</span>
          <span class="value">{{ sipStatus.extension }}</span>
        </div>
        <div v-if="sipStatus.registeredTime" class="status-item">
          <span class="label">注册时间:</span>
          <span class="value">{{ formatTime(sipStatus.registeredTime) }}</span>
        </div>
      </div>
    </div>

    <!-- 当前通话信息 -->
    <div v-if="currentCall" class="current-call-card">
      <div class="call-header">
        <h3>当前通话</h3>
        <el-tag :type="getCallStatusType(currentCall.status)" size="small">
          {{ getCallStatusText(currentCall.status) }}
        </el-tag>
      </div>
      <div class="call-details">
        <div class="call-number">
          <LucideIcon name="Phone" :size="16" />
          {{ currentCall.contactName || currentCall.phoneNumber }}
        </div>
        <div class="call-duration">
          <LucideIcon name="Clock" :size="14" />
          {{ formatDuration(currentCall.duration) }}
        </div>
        <div v-if="currentCall.recording" class="recording-indicator">
          <LucideIcon name="Circle" :size="12" class="recording-dot" />
          录音中
        </div>
      </div>

      <!-- 通话控制按钮 -->
      <div class="call-controls">
        <el-button-group>
          <el-button
            v-if="currentCall.status === 'connected'"
            type="warning"
            size="small"
            @click="$emit('hold', currentCall.id)"
          >
            <LucideIcon name="Pause" :size="14" />
            保持
          </el-button>
          <el-button
            v-if="currentCall.status === 'held'"
            type="success"
            size="small"
            @click="$emit('unhold', currentCall.id)"
          >
            <LucideIcon name="Play" :size="14" />
            恢复
          </el-button>
          <el-button
            type="info"
            size="small"
            @click="showTransferDialog = true"
          >
            <LucideIcon name="PhoneForwarded" :size="14" />
            转移
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="$emit('hangup', currentCall.id)"
          >
            <LucideIcon name="PhoneOff" :size="14" />
            挂断
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 分机列表 -->
    <div class="extensions-card">
      <div class="extensions-header">
        <h3>分机列表</h3>
        <el-button size="small" @click="refreshExtensions">
          <LucideIcon name="RefreshCw" :size="12" />
        </el-button>
      </div>
      <div class="extensions-list">
        <div
          v-for="extension in extensions"
          :key="extension.id"
          class="extension-item"
          :class="{ 'active': extension.id === sipStatus.extension }"
        >
          <div class="extension-info">
            <div class="extension-number">{{ extension.id }}</div>
            <div class="extension-name">{{ extension.name }}</div>
          </div>
          <div class="extension-status">
            <el-tag
              :type="extension.status === 'online' ? 'success' : 'danger'"
              size="small"
            >
              {{ extension.status === 'online' ? '在线' : '离线' }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 通话转移对话框 -->
    <el-dialog
      v-model="showTransferDialog"
      title="通话转移"
      width="400px"
      :before-close="handleTransferDialogClose"
    >
      <div class="transfer-dialog-content">
        <el-form :model="transferForm" label-width="80px">
          <el-form-item label="目标分机">
            <el-select
              v-model="transferForm.targetExtension"
              placeholder="请选择目标分机"
              style="width: 100%"
            >
              <el-option
                v-for="ext in availableExtensions"
                :key="ext.id"
                :label="`${ext.id} - ${ext.name}`"
                :value="ext.id"
                :disabled="ext.status !== 'online'"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showTransferDialog = false">取消</el-button>
        <el-button type="primary" @click="handleTransfer">确认转移</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import LucideIcon from '@/components/icons/LucideIcon.vue'

interface SIPStatus {
  connected: boolean
  server: string
  extension: string
  registeredTime?: Date
}

interface CallInfo {
  id: string
  phoneNumber: string
  contactName?: string
  status: 'ringing' | 'connected' | 'held' | 'transferred' | 'ended'
  startTime: Date
  duration?: number
  recording?: boolean
  extension: string
}

interface Extension {
  id: string
  name: string
  status: 'online' | 'offline'
}

interface Props {
  sipStatus: SIPStatus
  currentCall: CallInfo | null
  extensions: Extension[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  call: [phoneNumber: string, contactName?: string]
  hangup: [callId: string]
  transfer: [callId: string, targetExtension: string]
  hold: [callId: string]
  unhold: [callId: string]
}>()

// 响应式数据
const showTransferDialog = ref(false)
const transferForm = ref({
  targetExtension: ''
})

// 计算属性
const sipConnectionStatus = computed(() => {
  return props.sipStatus.connected ? 'success' : 'danger'
})

const sipConnectionText = computed(() => {
  return props.sipStatus.connected ? '已连接' : '未连接'
})

const availableExtensions = computed(() => {
  return props.extensions.filter(ext =>
    ext.id !== props.sipStatus.extension && ext.status === 'online'
  )
})

// 方法
const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString('zh-CN')
}

const formatDuration = (seconds?: number) => {
  if (!seconds) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const getCallStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'ringing': 'warning',
    'connected': 'success',
    'held': 'info',
    'transferred': 'primary',
    'ended': 'danger'
  }
  return typeMap[status] || 'info'
}

const getCallStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'ringing': '呼叫中',
    'connected': '通话中',
    'held': '已保持',
    'transferred': '已转移',
    'ended': '已结束'
  }
  return textMap[status] || status
}

const refreshExtensions = () => {
  ElMessage.info('分机列表已刷新')
  // 这里可以触发父组件刷新分机列表
}

const handleTransfer = () => {
  if (!transferForm.value.targetExtension) {
    ElMessage.warning('请选择目标分机')
    return
  }

  if (props.currentCall) {
    emit('transfer', props.currentCall.id, transferForm.value.targetExtension)
    showTransferDialog.value = false
    transferForm.value.targetExtension = ''
  }
}

const handleTransferDialogClose = () => {
  transferForm.value.targetExtension = ''
  showTransferDialog.value = false
}
</script>

<style scoped lang="scss">
.call-control-panel {
  display: flex;
  flex-direction: column;
  gap: var(--text-lg);
  height: 100%;
}

.sip-status-card,
.current-call-card,
.extensions-card {
  background: var(--bg-color);
  border-radius: var(--text-sm);
  padding: var(--text-2xl);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-6);
  border: var(--border-width-base) solid var(--border-primary, var(--border-color));
}

.status-header,
.call-header,
.extensions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-lg);

  h3 {
    margin: 0;
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary, var(--text-primary));
  }
}

.status-details,
.call-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .label {
    font-size: var(--text-base);
    color: var(--text-secondary, var(--text-secondary));
  }

  .value {
    font-size: var(--text-base);
    font-weight: 500;
    color: var(--text-primary, var(--text-primary));
  }
}

.call-number {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary, var(--text-primary));
  margin-bottom: var(--spacing-sm);
}

.call-duration {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  font-size: var(--text-base);
  color: var(--text-secondary, var(--text-secondary));
  margin-bottom: var(--spacing-sm);
}

.recording-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  font-size: var(--text-sm);
  color: var(--danger-color);
  margin-bottom: var(--text-lg);

  .recording-dot {
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.call-controls {
  display: flex;
  justify-content: center;
}

.extensions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  max-height: 300px;
  overflow-y: auto;
}

.extension-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-sm);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--border-primary, var(--border-color));
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-secondary, #f9fafb);
  }

  &.active {
    background: var(--primary-color, var(--primary-color));
    border-color: var(--primary-color, var(--primary-color));
    color: white;

    .extension-name {
      color: var(--white-alpha-90);
    }
  }
}

.extension-info {
  display: flex;
  flex-direction: column;

  .extension-number {
    font-size: var(--text-lg);
    font-weight: 600;
    color: inherit;
  }

  .extension-name {
    font-size: var(--text-sm);
    color: var(--text-secondary, var(--text-secondary));
    margin-top: var(--spacing-sm);
  }
}

.transfer-dialog-content {
  padding: var(--text-2xl) 0;
}

// 暗黑主题
.dark {
  .sip-status-card,
  .current-call-card,
  .extensions-card {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(71, 85, 105, 0.3);
    box-shadow: 0 var(--spacing-xs) var(--text-lg) var(--shadow-heavy);
  }

  .status-header h3,
  .call-header h3,
  .extensions-header h3 {
    color: var(--white-alpha-90);
  }

  .status-item .value {
    color: var(--white-alpha-90);
  }

  .call-number {
    color: var(--white-alpha-90);
  }

  .extension-item:hover {
    background: rgba(71, 85, 105, 0.2);
  }
}

// html.dark 兼容性
html.dark {
  .sip-status-card,
  .current-call-card,
  .extensions-card {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(71, 85, 105, 0.3);
    box-shadow: 0 var(--spacing-xs) var(--text-lg) var(--shadow-heavy);
  }

  .status-header h3,
  .call-header h3,
  .extensions-header h3 {
    color: var(--white-alpha-90);
  }

  .status-item .value {
    color: var(--white-alpha-90);
  }

  .call-number {
    color: var(--white-alpha-90);
  }

  .extension-item:hover {
    background: rgba(71, 85, 105, 0.2);
  }
}
</style>