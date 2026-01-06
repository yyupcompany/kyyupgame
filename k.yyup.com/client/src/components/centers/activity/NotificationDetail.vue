<template>
  <el-drawer
    v-model="visible"
    title="通知详情"
    size="600px"
    direction="rtl"
  >
    <div v-if="notification" class="notification-detail">
      <!-- 基本信息 -->
      <div class="detail-section">
        <h3>基本信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>通知标题：</label>
            <span>{{ notification.title }}</span>
          </div>
          <div class="info-item">
            <label>通知类型：</label>
            <el-tag :type="getTypeColor(notification.type)">
              {{ getTypeLabel(notification.type) }}
            </el-tag>
          </div>
          <div class="info-item">
            <label>优先级：</label>
            <el-tag :type="getPriorityColor(notification.priority)">
              {{ getPriorityLabel(notification.priority) }}
            </el-tag>
          </div>
          <div class="info-item">
            <label>发送状态：</label>
            <el-tag :type="getStatusColor(notification.status)">
              {{ getStatusLabel(notification.status) }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 通知内容 -->
      <div class="detail-section">
        <h3>通知内容</h3>
        <div class="content-box">
          {{ notification.content }}
        </div>
      </div>

      <!-- 发送信息 -->
      <div class="detail-section">
        <h3>发送信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>发送方式：</label>
            <div class="send-methods">
              <el-tag
                v-for="method in notification.sendMethods"
                :key="method"
                size="small"
                style="margin-right: var(--spacing-sm)"
              >
                {{ getSendMethodLabel(method) }}
              </el-tag>
            </div>
          </div>
          <div class="info-item">
            <label>接收对象：</label>
            <div class="recipients">
              <el-tag
                v-for="recipient in notification.recipients"
                :key="recipient"
                size="small"
                type="info"
                style="margin-right: var(--spacing-sm)"
              >
                {{ getRecipientLabel(recipient) }}
              </el-tag>
            </div>
          </div>
          <div class="info-item">
            <label>发送时间：</label>
            <span>{{ formatDateTime(notification.sendTime) }}</span>
          </div>
          <div class="info-item">
            <label>创建时间：</label>
            <span>{{ formatDateTime(notification.createdAt) }}</span>
          </div>
        </div>
      </div>

      <!-- 发送统计 -->
      <div class="detail-section">
        <h3>发送统计</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ notification.stats?.totalSent || 0 }}</div>
            <div class="stat-label">总发送数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ notification.stats?.delivered || 0 }}</div>
            <div class="stat-label">成功送达</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ notification.stats?.failed || 0 }}</div>
            <div class="stat-label">发送失败</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ notification.stats?.read || 0 }}</div>
            <div class="stat-label">已读数量</div>
          </div>
        </div>
      </div>

      <!-- 操作记录 -->
      <div class="detail-section">
        <h3>操作记录</h3>
        <el-timeline>
          <el-timeline-item
            v-for="log in notification.logs"
            :key="log.id"
            :timestamp="formatDateTime(log.createdAt)"
            placement="top"
          >
            <div class="log-content">
              <div class="log-action">{{ log.action }}</div>
              <div class="log-details">{{ log.details }}</div>
              <div class="log-operator">操作人：{{ log.operator }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="visible = false">关闭</el-button>
        <el-button
          v-if="notification?.status === 'draft'"
          type="primary"
          @click="handleSend"
        >
          发送通知
        </el-button>
        <el-button
          v-if="notification?.status === 'sent'"
          type="warning"
          @click="handleResend"
        >
          重新发送
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

interface NotificationStats {
  totalSent: number
  delivered: number
  failed: number
  read: number
}

interface NotificationLog {
  id: string
  action: string
  details: string
  operator: string
  createdAt: string
}

interface NotificationDetail {
  id: string
  title: string
  type: string
  content: string
  priority: string
  status: string
  sendMethods: string[]
  recipients: string[]
  sendTime: string
  createdAt: string
  stats?: NotificationStats
  logs: NotificationLog[]
}

const props = defineProps<{
  modelValue: boolean
  data?: NotificationDetail
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'send': [id: string]
  'resend': [id: string]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const notification = computed(() => props.data)

const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    activity_reminder: '活动提醒',
    registration_notice: '报名通知',
    activity_cancel: '活动取消',
    activity_change: '活动变更',
    system_notice: '系统通知'
  }
  return typeMap[type] || type
}

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    activity_reminder: 'primary',
    registration_notice: 'success',
    activity_cancel: 'danger',
    activity_change: 'warning',
    system_notice: 'info'
  }
  return colorMap[type] || 'info'
}

const getPriorityLabel = (priority: string) => {
  const priorityMap: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return priorityMap[priority] || priority
}

const getPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    low: 'info',
    medium: 'primary',
    high: 'warning',
    urgent: 'danger'
  }
  return colorMap[priority] || 'info'
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    sending: '发送中',
    sent: '已发送',
    failed: '发送失败'
  }
  return statusMap[status] || status
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    draft: 'info',
    sending: 'warning',
    sent: 'success',
    failed: 'danger'
  }
  return colorMap[status] || 'info'
}

const getSendMethodLabel = (method: string) => {
  const methodMap: Record<string, string> = {
    system: '站内消息',
    sms: '短信通知',
    email: '邮件通知',
    wechat: '微信通知'
  }
  return methodMap[method] || method
}

const getRecipientLabel = (recipient: string) => {
  const recipientMap: Record<string, string> = {
    all_parents: '所有家长',
    registered_parents: '已报名家长',
    pending_parents: '待审核家长',
    all_teachers: '所有教师',
    admins: '管理员'
  }
  return recipientMap[recipient] || recipient
}

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString()
}

const handleSend = () => {
  if (notification.value?.id) {
    emit('send', notification.value.id)
  }
}

const handleResend = () => {
  if (notification.value?.id) {
    emit('resend', notification.value.id)
  }
}
</script>

<style scoped>
.notification-detail {
  padding: var(--spacing-xl);
}

.detail-section {
  margin-bottom: var(--spacing-8xl);
}

.detail-section h3 {
  margin: 0 0 var(--text-lg) 0;
  color: var(--text-primary);
  font-size: var(--text-lg);
  border-bottom: var(--z-index-dropdown) solid var(--border-color);
  padding-bottom: var(--spacing-sm);
}

.info-grid {
  display: grid;
  gap: var(--text-lg);
}

.info-item {
  display: flex;
  align-items: flex-start;
}

.info-item label {
  min-width: auto;
  color: var(--text-secondary);
  font-weight: 500;
}

.info-item span {
  color: var(--text-primary);
}

.content-box {
  background: var(--bg-hover);
  border-radius: var(--spacing-xs);
  padding: var(--text-lg);
  line-height: 1.6;
  color: var(--text-primary);
}

.send-methods,
.recipients {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--text-lg);
}

.stat-item {
  text-align: center;
  padding: var(--text-lg);
  background: var(--bg-hover);
  border-radius: var(--spacing-sm);
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

.stat-label {
  font-size: var(--text-base);
  color: var(--text-secondary);
}

.log-content {
  padding: var(--spacing-sm) 0;
}

.log-action {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.log-details {
  color: var(--text-secondary);
  font-size: var(--text-base);
  margin-bottom: var(--spacing-xs);
}

.log-operator {
  color: var(--info-color);
  font-size: var(--text-sm);
}

.drawer-footer {
  text-align: right;
  padding: var(--text-lg) var(--spacing-xl);
  border-top: var(--z-index-dropdown) solid var(--border-color);
}
</style>
