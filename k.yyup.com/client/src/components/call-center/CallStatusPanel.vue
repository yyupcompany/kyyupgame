<template>
  <div class="call-status-panel">
    <!-- 通话统计 -->
    <div class="statistics-card">
      <div class="statistics-header">
        <h3>通话统计</h3>
        <el-select v-model="selectedPeriod" size="small" style="max-width: 120px; width: 100%">
          <el-option label="今日" value="today" />
          <el-option label="本周" value="week" />
          <el-option label="本月" value="month" />
        </el-select>
      </div>
      <div class="statistics-grid">
        <div class="stat-item">
          <div class="stat-value">{{ statistics.totalCalls }}</div>
          <div class="stat-label">总通话数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statistics.connectedCalls }}</div>
          <div class="stat-label">接通数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statistics.missedCalls }}</div>
          <div class="stat-label">未接数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ formatDuration(statistics.averageDuration) }}</div>
          <div class="stat-label">平均时长</div>
        </div>
      </div>
      <div class="connection-rate">
        <div class="rate-label">接通率</div>
        <div class="rate-progress">
          <el-progress
            :percentage="connectionRate"
            :color="getProgressColor(connectionRate)"
            :show-text="false"
            :stroke-width="8"
          />
          <span class="rate-value">{{ connectionRate }}%</span>
        </div>
      </div>
    </div>

    <!-- 活跃通话 -->
    <div v-if="activeCalls.length > 0" class="active-calls-card">
      <div class="active-calls-header">
        <h3>活跃通话</h3>
        <el-badge :value="activeCalls.length" type="danger" />
      </div>
      <div class="active-calls-list">
        <div
          v-for="call in activeCalls"
          :key="call.id"
          class="active-call-item"
        >
          <div class="call-info">
            <div class="call-contact">
              <UnifiedIcon name="User" :size="14" />
              {{ call.contactName || call.phoneNumber }}
            </div>
            <div class="call-time">
              <UnifiedIcon name="clock" :size="12" />
              {{ formatDuration(call.duration) }}
            </div>
          </div>
          <div class="call-actions">
            <el-button
              v-if="call.recording"
              size="small"
              type="warning"
              @click="handleStopRecording(call.id)"
            >
              <UnifiedIcon name="Square" :size="12" />
              停止录音
            </el-button>
            <el-button
              v-else
              size="small"
              type="success"
              @click="handleStartRecording(call.id)"
            >
              <UnifiedIcon name="Circle" :size="12" />
              开始录音
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 通话记录 -->
    <div class="call-history-card">
      <div class="history-header">
        <h3>通话记录</h3>
        <div class="header-actions">
          <el-input
            v-model="searchQuery"
            placeholder="搜索号码或联系人"
            size="small"
            style="max-max-width: 200px; width: 100%; width: 100%"
            clearable
          >
            <template #prefix>
              <UnifiedIcon name="Search" :size="14" />
            </template>
          </el-input>
          <el-button size="small" @click="refreshHistory">
            <UnifiedIcon name="RefreshCw" :size="14" />
          </el-button>
        </div>
      </div>
      <div class="history-table">
        <div class="table-wrapper">
<el-table class="responsive-table"
          :data="filteredCallHistory"
          stripe
          height="400"
          @row-click="handleRowClick"
        >
          <el-table-column prop="contactName" label="联系人" width="120">
            <template #default="{ row }">
              {{ row.contactName || row.phoneNumber }}
            </template>
          </el-table-column>
          <el-table-column prop="phoneNumber" label="电话号码" width="140" />
          <el-table-column prop="startTime" label="开始时间" width="160">
            <template #default="{ row }">
              {{ formatDateTime(row.startTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="duration" label="通话时长" width="100">
            <template #default="{ row }">
              {{ formatDuration(row.duration) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getCallStatusType(row.status)" size="small">
                {{ getCallStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="recording" label="录音" width="80">
            <template #default="{ row }">
              <UnifiedIcon name="default" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="{ row }">
              <el-button-group>
                <el-button
                  v-if="row.recording"
                  size="small"
                  type="success"
                  @click.stop="handleViewRecording(row)"
                >
                  <UnifiedIcon name="Play" :size="12" />
                  播放
                </el-button>
                <el-button
                  v-if="row.recording"
                  size="small"
                  type="primary"
                  @click.stop="handleDownloadRecording(row)"
                >
                  <UnifiedIcon name="Download" :size="12" />
                  下载
                </el-button>
                <el-button
                  size="small"
                  type="info"
                  @click.stop="handleViewDetails(row)"
                >
                  <UnifiedIcon name="Eye" :size="12" />
                  详情
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
</div>
      </div>
      <div class="history-pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalCalls"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

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

interface CallStatistics {
  totalCalls: number
  connectedCalls: number
  missedCalls: number
  averageDuration: number
  totalDuration: number
}

interface Props {
  callHistory: CallInfo[]
  activeCalls: CallInfo[]
  statistics: CallStatistics
}

const props = defineProps<Props>()

const emit = defineEmits<{
  viewRecording: [recording: any]
  downloadRecording: [recording: any]
}>()

// 响应式数据
const selectedPeriod = ref('today')
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

// 计算属性
const connectionRate = computed(() => {
  if (props.statistics.totalCalls === 0) return 0
  return Math.round((props.statistics.connectedCalls / props.statistics.totalCalls) * 100)
})

const filteredCallHistory = computed(() => {
  let filtered = props.callHistory

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(call =>
      call.phoneNumber.toLowerCase().includes(query) ||
      (call.contactName && call.contactName.toLowerCase().includes(query))
    )
  }

  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filtered.slice(start, end)
})

const totalCalls = computed(() => {
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    return props.callHistory.filter(call =>
      call.phoneNumber.toLowerCase().includes(query) ||
      (call.contactName && call.contactName.toLowerCase().includes(query))
    ).length
  }
  return props.callHistory.length
})

// 方法
const formatDuration = (seconds?: number) => {
  if (!seconds) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const formatDateTime = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN')
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

const getProgressColor = (percentage: number) => {
  if (percentage >= 80) return 'var(--success-color)'
  if (percentage >= 60) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

const refreshHistory = () => {
  ElMessage.success('通话记录已刷新')
  // 这里可以触发父组件刷新数据
}

const handleStartRecording = (callId: string) => {
  ElMessage.success('开始录音')
  // 这里可以调用API开始录音
}

const handleStopRecording = (callId: string) => {
  ElMessage.success('停止录音')
  // 这里可以调用API停止录音
}

const handleViewRecording = (recording: any) => {
  emit('viewRecording', recording)
}

const handleDownloadRecording = (recording: any) => {
  emit('downloadRecording', recording)
}

const handleViewDetails = (call: CallInfo) => {
  ElMessage.info(`查看通话详情: ${call.contactName || call.phoneNumber}`)
  // 这里可以打开详情对话框
}

const handleRowClick = (row: CallInfo) => {
  handleViewDetails(row)
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

// 监听搜索变化，重置分页
watch(searchQuery, () => {
  currentPage.value = 1
})
</script>

<style scoped lang="scss">
.call-status-panel {
  display: flex;
  flex-direction: column;
  gap: var(--text-lg);
  height: 100%;
}

.statistics-card,
.active-calls-card,
.call-history-card {
  background: var(--bg-color);
  border-radius: var(--text-sm);
  padding: var(--spacing-xl);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-6);
  border: var(--border-width) solid var(--border-primary, var(--border-color));
}

.statistics-header,
.active-calls-header,
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);

  h3 {
    margin: 0;
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary, var(--text-primary));
  }
}

.header-actions {
  display: flex;
  gap: var(--text-sm);
  align-items: center;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--text-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-item {
  text-align: center;
  padding: var(--text-lg);
  background: var(--bg-secondary, #f9fafb);
  border-radius: var(--spacing-sm);
  border: var(--border-width) solid var(--border-primary, var(--border-color));

  .stat-value {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--primary-color, var(--primary-color));
    margin-bottom: var(--spacing-xs);
  }

  .stat-label {
    font-size: var(--text-sm);
    color: var(--text-secondary, var(--text-secondary));
  }
}

.connection-rate {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-lg);
  background: var(--bg-secondary, #f9fafb);
  border-radius: var(--spacing-sm);
  border: var(--border-width) solid var(--border-primary, var(--border-color));

  .rate-label {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary, var(--text-primary));
  }

  .rate-progress {
    display: flex;
    align-items: center;
    gap: var(--text-sm);
    flex: 1;
    max-width: 200px;
  }

  .rate-value {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary, var(--text-primary));
  }
}

.active-calls-list {
  display: flex;
  flex-direction: column;
  gap: var(--text-sm);
  max-min-height: 60px; height: auto;
  overflow-y: auto;
}

.active-call-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-sm);
  background: var(--bg-secondary, #f9fafb);
  border-radius: var(--spacing-sm);
  border: var(--border-width) solid var(--border-primary, var(--border-color));
}

.call-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);

  .call-contact {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    font-size: var(--text-base);
    font-weight: 500;
    color: var(--text-primary, var(--text-primary));
  }

  .call-time {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--text-sm);
    color: var(--text-secondary, var(--text-secondary));
  }
}

.history-table {
  margin-bottom: var(--spacing-xl);
}

.history-pagination {
  display: flex;
  justify-content: center;
}

// 响应式设计
@media (max-width: var(--breakpoint-xl)) {
  .statistics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: var(--breakpoint-md)) {
  .statistics-grid {
    grid-template-columns: 1fr;
  }

  .header-actions {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: stretch;
  }

  .active-call-item {
    flex-direction: column;
    gap: var(--text-sm);
    align-items: stretch;
  }

  .call-actions {
    display: flex;
    justify-content: center;
  }
}

// 暗黑主题
.dark {
  .statistics-card,
  .active-calls-card,
  .call-history-card {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(71, 85, 105, 0.3);
    box-shadow: 0 var(--spacing-xs) var(--text-lg) var(--shadow-heavy);
  }

  .statistics-header h3,
  .active-calls-header h3,
  .history-header h3 {
    color: var(--white-alpha-90);
  }

  .stat-item {
    background: rgba(71, 85, 105, 0.2);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .connection-rate {
    background: rgba(71, 85, 105, 0.2);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .rate-label,
  .rate-value {
    color: var(--white-alpha-90);
  }

  .active-call-item {
    background: rgba(71, 85, 105, 0.2);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .call-contact {
    color: var(--white-alpha-90);
  }
}

// html.dark 兼容性
html.dark {
  .statistics-card,
  .active-calls-card,
  .call-history-card {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(71, 85, 105, 0.3);
    box-shadow: 0 var(--spacing-xs) var(--text-lg) var(--shadow-heavy);
  }

  .statistics-header h3,
  .active-calls-header h3,
  .history-header h3 {
    color: var(--white-alpha-90);
  }

  .stat-item {
    background: rgba(71, 85, 105, 0.2);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .connection-rate {
    background: rgba(71, 85, 105, 0.2);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .rate-label,
  .rate-value {
    color: var(--white-alpha-90);
  }

  .active-call-item {
    background: rgba(71, 85, 105, 0.2);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .call-contact {
    color: var(--white-alpha-90);
  }
}
</style>