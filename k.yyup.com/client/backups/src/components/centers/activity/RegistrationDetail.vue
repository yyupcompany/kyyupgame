<template>
  <el-drawer
    v-model="visible"
    title="报名详情"
    size="600px"
    direction="rtl"
  >
    <div v-if="registration" class="registration-detail">
      <!-- 基本信息 -->
      <div class="detail-section">
        <h3>基本信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>报名编号：</label>
            <span>{{ registration.id }}</span>
          </div>
          <div class="info-item">
            <label>活动名称：</label>
            <span>{{ registration.activityName }}</span>
          </div>
          <div class="info-item">
            <label>学生姓名：</label>
            <span>{{ registration.studentName }}</span>
          </div>
          <div class="info-item">
            <label>家长姓名：</label>
            <span>{{ registration.parentName }}</span>
          </div>
          <div class="info-item">
            <label>联系电话：</label>
            <span>{{ registration.phone }}</span>
          </div>
          <div class="info-item">
            <label>报名状态：</label>
            <el-tag :type="getStatusColor(registration.status)">
              {{ getStatusLabel(registration.status) }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 活动信息 -->
      <div class="detail-section">
        <h3>活动信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>活动时间：</label>
            <span>{{ formatDateTime(registration.activityTime) }}</span>
          </div>
          <div class="info-item">
            <label>活动地点：</label>
            <span>{{ registration.location }}</span>
          </div>
          <div class="info-item">
            <label>活动类型：</label>
            <span>{{ registration.activityType }}</span>
          </div>
          <div class="info-item">
            <label>参与人数：</label>
            <span>{{ registration.participantCount }}人</span>
          </div>
          <div class="info-item">
            <label>费用：</label>
            <span class="fee">{{ registration.fee > 0 ? `¥${registration.fee}` : '免费' }}</span>
          </div>
        </div>
      </div>

      <!-- 报名信息 -->
      <div class="detail-section">
        <h3>报名信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>报名时间：</label>
            <span>{{ formatDateTime(registration.registrationTime) }}</span>
          </div>
          <div class="info-item">
            <label>报名方式：</label>
            <span>{{ getRegistrationMethodLabel(registration.method) }}</span>
          </div>
          <div class="info-item">
            <label>审核状态：</label>
            <el-tag :type="getAuditStatusColor(registration.auditStatus)">
              {{ getAuditStatusLabel(registration.auditStatus) }}
            </el-tag>
          </div>
          <div class="info-item" v-if="registration.auditTime">
            <label>审核时间：</label>
            <span>{{ formatDateTime(registration.auditTime) }}</span>
          </div>
          <div class="info-item" v-if="registration.auditor">
            <label>审核人：</label>
            <span>{{ registration.auditor }}</span>
          </div>
        </div>
      </div>

      <!-- 备注信息 -->
      <div class="detail-section" v-if="registration.remarks">
        <h3>备注信息</h3>
        <div class="remarks-content">
          {{ registration.remarks }}
        </div>
      </div>

      <!-- 审核记录 -->
      <div class="detail-section" v-if="registration.auditLogs && registration.auditLogs.length > 0">
        <h3>审核记录</h3>
        <el-timeline>
          <el-timeline-item
            v-for="log in registration.auditLogs"
            :key="log.id"
            :timestamp="formatDateTime(log.createdAt)"
            placement="top"
          >
            <div class="audit-log">
              <div class="log-action">
                <el-tag :type="getAuditActionColor(log.action)">
                  {{ getAuditActionLabel(log.action) }}
                </el-tag>
              </div>
              <div class="log-content">{{ log.content }}</div>
              <div class="log-operator">操作人：{{ log.operator }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 附件信息 -->
      <div class="detail-section" v-if="registration.attachments && registration.attachments.length > 0">
        <h3>附件信息</h3>
        <div class="attachments-list">
          <div 
            v-for="attachment in registration.attachments"
            :key="attachment.id"
            class="attachment-item"
          >
            <el-icon class="attachment-icon"><Document /></el-icon>
            <span class="attachment-name">{{ attachment.name }}</span>
            <span class="attachment-size">{{ formatFileSize(attachment.size) }}</span>
            <el-button 
              type="primary" 
              size="small" 
              @click="downloadAttachment(attachment)"
            >
              下载
            </el-button>
          </div>
        </div>
      </div>

      <!-- 支付信息 -->
      <div class="detail-section" v-if="registration.fee > 0">
        <h3>支付信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>支付状态：</label>
            <el-tag :type="getPaymentStatusColor(registration.paymentStatus)">
              {{ getPaymentStatusLabel(registration.paymentStatus) }}
            </el-tag>
          </div>
          <div class="info-item" v-if="registration.paymentTime">
            <label>支付时间：</label>
            <span>{{ formatDateTime(registration.paymentTime) }}</span>
          </div>
          <div class="info-item" v-if="registration.paymentMethod">
            <label>支付方式：</label>
            <span>{{ registration.paymentMethod }}</span>
          </div>
          <div class="info-item" v-if="registration.transactionId">
            <label>交易号：</label>
            <span>{{ registration.transactionId }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="visible = false">关闭</el-button>
        <el-button
          v-if="registration?.auditStatus === 'pending'"
          type="success"
          @click="handleApprove"
        >
          通过
        </el-button>
        <el-button
          v-if="registration?.auditStatus === 'pending'"
          type="danger"
          @click="handleReject"
        >
          拒绝
        </el-button>
        <el-button
          v-if="registration?.status === 'confirmed'"
          type="warning"
          @click="handleCancel"
        >
          取消报名
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document } from '@element-plus/icons-vue'

interface RegistrationDetail {
  id: string
  activityName: string
  studentName: string
  parentName: string
  phone: string
  status: string
  activityTime: string
  location: string
  activityType: string
  participantCount: number
  fee: number
  registrationTime: string
  method: string
  auditStatus: string
  auditTime?: string
  auditor?: string
  remarks?: string
  auditLogs?: Array<{
    id: string
    action: string
    content: string
    operator: string
    createdAt: string
  }>
  attachments?: Array<{
    id: string
    name: string
    size: number
    url: string
  }>
  paymentStatus?: string
  paymentTime?: string
  paymentMethod?: string
  transactionId?: string
}

const props = defineProps<{
  modelValue: boolean
  data?: RegistrationDetail
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'approve': [id: string]
  'reject': [id: string]
  'cancel': [id: string]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const registration = computed(() => props.data)

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待审核',
    confirmed: '已确认',
    cancelled: '已取消',
    completed: '已完成'
  }
  return statusMap[status] || status
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'danger',
    completed: 'info'
  }
  return colorMap[status] || 'info'
}

const getAuditStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return statusMap[status] || status
}

const getAuditStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return colorMap[status] || 'info'
}

const getRegistrationMethodLabel = (method: string) => {
  const methodMap: Record<string, string> = {
    online: '在线报名',
    phone: '电话报名',
    offline: '现场报名'
  }
  return methodMap[method] || method
}

const getAuditActionLabel = (action: string) => {
  const actionMap: Record<string, string> = {
    submit: '提交审核',
    approve: '审核通过',
    reject: '审核拒绝',
    modify: '修改信息'
  }
  return actionMap[action] || action
}

const getAuditActionColor = (action: string) => {
  const colorMap: Record<string, string> = {
    submit: 'info',
    approve: 'success',
    reject: 'danger',
    modify: 'warning'
  }
  return colorMap[action] || 'info'
}

const getPaymentStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    unpaid: '未支付',
    paid: '已支付',
    refunded: '已退款'
  }
  return statusMap[status] || status
}

const getPaymentStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    unpaid: 'warning',
    paid: 'success',
    refunded: 'info'
  }
  return colorMap[status] || 'info'
}

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString()
}

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size}B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`
  return `${(size / (1024 * 1024)).toFixed(1)}MB`
}

const downloadAttachment = (attachment: any) => {
  // 这里应该实现文件下载逻辑
  window.open(attachment.url, '_blank')
}

const handleApprove = async () => {
  try {
    await ElMessageBox.confirm('确定要通过这个报名申请吗？', '确认操作', {
      type: 'warning'
    })
    
    if (registration.value?.id) {
      emit('approve', registration.value.id)
    }
  } catch {
    // 用户取消操作
  }
}

const handleReject = async () => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝报名', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入拒绝原因'
    })
    
    if (registration.value?.id) {
      emit('reject', registration.value.id)
    }
  } catch {
    // 用户取消操作
  }
}

const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确定要取消这个报名吗？', '确认操作', {
      type: 'warning'
    })
    
    if (registration.value?.id) {
      emit('cancel', registration.value.id)
    }
  } catch {
    // 用户取消操作
  }
}
</script>

<style scoped>
.registration-detail {
  padding: var(--text-2xl);
}

.detail-section {
  margin-bottom: var(--spacing-8xl);
}

.detail-section h3 {
  margin: 0 0 var(--text-lg) 0;
  color: var(--text-primary);
  font-size: var(--text-lg);
  border-bottom: var(--border-width-base) solid var(--border-color);
  padding-bottom: var(--spacing-sm);
}

.info-grid {
  display: grid;
  gap: var(--text-lg);
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item label {
  min-width: 80px;
  color: var(--text-secondary);
  font-weight: 500;
}

.info-item span {
  color: var(--text-primary);
}

.fee {
  font-weight: 600;
  color: var(--danger-color);
}

.remarks-content {
  background: var(--bg-hover);
  border-radius: var(--spacing-xs);
  padding: var(--text-lg);
  line-height: 1.6;
  color: var(--text-primary);
}

.audit-log {
  padding: var(--spacing-sm) 0;
}

.log-action {
  margin-bottom: var(--spacing-sm);
}

.log-content {
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.log-operator {
  color: var(--info-color);
  font-size: var(--text-sm);
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: var(--text-sm);
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: var(--text-sm);
  padding: var(--text-sm);
  background: var(--bg-hover);
  border-radius: var(--spacing-xs);
}

.attachment-icon {
  color: var(--primary-color);
  font-size: var(--text-2xl);
}

.attachment-name {
  flex: 1;
  color: var(--text-primary);
}

.attachment-size {
  color: var(--info-color);
  font-size: var(--text-sm);
}

.drawer-footer {
  text-align: right;
  padding: var(--text-lg) var(--text-2xl);
  border-top: var(--border-width-base) solid var(--border-color);
}
</style>
