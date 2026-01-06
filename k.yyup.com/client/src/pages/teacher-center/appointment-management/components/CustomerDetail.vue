<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`客户详情 - ${appointment?.customerName}`"
    width="var(--dialog-width-lg)"
    destroy-on-close
  >
    <div v-if="appointment" class="customer-detail">
      <!-- 客户基本信息 -->
      <div class="basic-info">
        <el-card>
          <template #header>
            <div class="card-header">
              <span class="card-title">基本信息</span>
              <el-tag :type="getStatusColor(appointment.status)">
                {{ getStatusText(appointment.status) }}
              </el-tag>
            </div>
          </template>

          <el-row :gutter="20">
            <el-col :span="8">
              <div class="info-item">
                <div class="info-label">客户姓名</div>
                <div class="info-value">{{ appointment.customerName }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <div class="info-label">联系方式</div>
                <div class="info-value">
                  {{ appointment.contact }}
                  <el-button type="text" size="small" @click="handleCall">
                    <el-icon><Phone /></el-icon>
                  </el-button>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <div class="info-label">预约类型</div>
                <div class="info-value">
                  <el-tag :type="getTypeColor(appointment.type)" size="small">
                    {{ getTypeText(appointment.type) }}
                  </el-tag>
                </div>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20" style="margin-top: var(--spacing-xl, var(--spacing-lg));">
            <el-col :span="8">
              <div class="info-item">
                <div class="info-label">预约时间</div>
                <div class="info-value">{{ appointment.scheduledTime }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <div class="info-label">创建时间</div>
                <div class="info-value">{{ appointment.createTime }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <div class="info-label">紧急程度</div>
                <div class="info-value">
                  <el-tag v-if="appointment.urgent" type="danger" size="small">
                    <el-icon><Warning /></el-icon>
                    紧急
                  </el-tag>
                  <span v-else>一般</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </div>

      <!-- 需求描述 -->
      <div class="description">
        <el-card>
          <template #header>
            <span class="card-title">需求描述</span>
          </template>
          <div class="description-content">
            {{ appointment.description }}
          </div>
        </el-card>
      </div>

      <!-- 孩子信息 -->
      <div class="child-info" v-if="appointment.childInfo">
        <el-card>
          <template #header>
            <span class="card-title">孩子信息</span>
          </template>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="info-item">
                <div class="info-label">姓名</div>
                <div class="info-value">{{ appointment.childInfo.name }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <div class="info-label">年龄</div>
                <div class="info-value">{{ appointment.childInfo.age }}岁</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <div class="info-label">性别</div>
                <div class="info-value">{{ appointment.childInfo.gender === 'male' ? '男' : '女' }}</div>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20" style="margin-top: var(--spacing-xl, var(--spacing-lg));">
            <el-col :span="12">
              <div class="info-item">
                <div class="info-label">兴趣爱好</div>
                <div class="info-value">
                  <el-tag
                    v-for="interest in appointment.childInfo.interests"
                    :key="interest"
                    size="small"
                    style="margin-right: var(--spacing-xs, var(--radius-sm)); margin-bottom: var(--spacing-xs, var(--radius-sm));"
                  >
                    {{ interest }}
                  </el-tag>
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <div class="info-label">特殊需求</div>
                <div class="info-value">{{ appointment.childInfo.specialNeeds || '无' }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </div>

      <!-- 沟通历史 -->
      <div class="communication-history">
        <el-card>
          <template #header>
            <div class="card-header">
              <span class="card-title">沟通历史</span>
              <el-button type="primary" size="small" @click="handleAddFollowUp">
                添加跟进记录
              </el-button>
            </div>
          </template>

          <el-timeline>
            <el-timeline-item
              v-for="record in communicationHistory"
              :key="record.id"
              :timestamp="record.createTime"
              placement="top"
            >
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-type">{{ getFollowUpTypeText(record.type) }}</span>
                  <span class="timeline-status" :class="record.result">
                    {{ getFollowUpResultText(record.result) }}
                  </span>
                </div>
                <div class="timeline-content-text">{{ record.content }}</div>
                <div class="timeline-next" v-if="record.nextAction">
                  下一步: {{ record.nextAction }}
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>

          <div v-if="communicationHistory.length === 0" class="empty-history">
            <el-empty description="暂无沟通记录" />
          </div>
        </el-card>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" @click="handleAddFollowUp">添加跟进记录</el-button>
        <el-button @click="handleReschedule">重新预约</el-button>
        <el-button @click="handleConvert">标记转化</el-button>
        <el-button type="danger" @click="handleClose">关闭预约</el-button>
      </div>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>

  <!-- 跟进记录弹窗 -->
  <FollowUpRecord
    v-model="followUpVisible"
    :appointment="appointment"
    @refresh="loadCommunicationHistory"
  />
</template>

<script setup lang="ts">
/**
 * 客户详情对话框组件
 * 用于显示预约客户的详细信息、沟通历史和操作功能
 */
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Phone, Warning } from '@element-plus/icons-vue'
import FollowUpRecord from './FollowUpRecord.vue'

interface Props {
  modelValue: boolean
  appointment: any
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const followUpVisible = ref(false)

// 沟通记录接口定义
interface CommunicationRecord {
  id: number
  type: string
  content: string
  result: string
  nextAction?: string
  createTime: string
}

// 沟通历史记录列表
const communicationHistory = ref<CommunicationRecord[]>([])

// 监听预约变化，加载沟通历史
watch(() => props.appointment, (newAppointment) => {
  if (newAppointment) {
    loadCommunicationHistory()
  }
}, { immediate: true })

const getStatusColor = (status: string) => {
  const colorMap = {
    'pending': 'warning',
    'scheduled': 'primary',
    'visited': 'info',
    'converted': 'success',
    'closed': 'info'
  }
  return colorMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap = {
    'pending': '待联系',
    'scheduled': '已预约',
    'visited': '已到访',
    'converted': '已转化',
    'closed': '已关闭'
  }
  return textMap[status] || '未知'
}

const getTypeColor = (type: string) => {
  const colorMap = {
    'phone': 'primary',
    'trial': 'success',
    'visit': 'warning',
    'seminar': 'info'
  }
  return colorMap[type] || 'info'
}

const getTypeText = (type: string) => {
  const textMap = {
    'phone': '电话回访',
    'trial': '体验课',
    'visit': '园所参观',
    'seminar': '讲座活动'
  }
  return textMap[type] || '其他'
}

const getFollowUpTypeText = (type: string) => {
  const typeMap = {
    'phone': '电话沟通',
    'visit': '到访面谈',
    'message': '短信联系',
    'wechat': '微信沟通',
    'email': '邮件联系'
  }
  return typeMap[type] || type
}

const getFollowUpResultText = (result: string) => {
  const resultMap = {
    'interested': '意向强烈',
    'considering': '考虑中',
    'not_interested': '暂无意向',
    'scheduled': '已预约',
    'visited': '已到访',
    'converted': '已转化',
    'unreachable': '联系不上'
  }
  return resultMap[result] || result
}

const handleCall = () => {
  if (props.appointment?.contact) {
    ElMessage.info(`正在拨打 ${props.appointment.contact}`)
    // 实际拨打电话逻辑
  }
}

const handleAddFollowUp = () => {
  followUpVisible.value = true
}

const handleReschedule = async () => {
  try {
    await ElMessageBox.confirm('确定要重新预约这个客户吗？', '重新预约', {
      type: 'warning'
    })
    ElMessage.success('重新预约成功')
    emit('refresh')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleConvert = async () => {
  try {
    await ElMessageBox.confirm('确定这个客户已成功转化吗？', '标记转化', {
      type: 'success'
    })
    ElMessage.success('已标记为转化')
    emit('refresh')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleClose = async () => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入关闭原因', '关闭预约', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入关闭原因'
    })

    ElMessage.success('预约已关闭')
    emit('refresh')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const loadCommunicationHistory = async () => {
  if (!props.appointment) return

  try {
    // 模拟沟通历史数据
    communicationHistory.value = [
      {
        id: 1,
        type: 'phone',
        content: '与客户电话沟通，了解孩子3岁，对音乐课程感兴趣，希望预约体验课',
        result: 'interested',
        nextAction: '安排周三上午10点体验课',
        createTime: '2024-01-08 14:30'
      },
      {
        id: 2,
        type: 'message',
        content: '发送短信确认预约时间，提醒客户携带相关证件',
        result: 'scheduled',
        nextAction: '准备体验课材料',
        createTime: '2024-01-08 15:00'
      }
    ]
  } catch (error) {
    console.error('加载沟通历史失败:', error)
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

.customer-detail {
  .basic-info,
  .description,
  .child-info,
  .communication-history {
    margin-bottom: var(--spacing-lg);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      font-weight: 600;
    }
  }

  .info-item {
    .info-label {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin-bottom: var(--spacing-xs);
    }

    .info-value {
      font-weight: 500;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }
  }

  .description-content {
    line-height: var(--line-height-relaxed, 1.6);
    color: var(--text-primary);
  }

  .timeline-content {
    .timeline-header {
      display: flex;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-sm);

      .timeline-type {
        font-weight: 600;
        color: var(--text-primary);
      }

      .timeline-status {
        font-size: var(--text-sm);
        padding: var(--spacing-xs, var(--radius-xs)) var(--spacing-sm, var(--radius-md));
        border-radius: var(--radius-sm);

        &.interested {
          background: var(--success-light-bg);
          color: var(--el-color-success);
        }

        &.considering {
          background: var(--warning-light-bg);
          color: var(--el-color-warning);
        }

        &.not_interested {
          background: var(--info-light-bg);
          color: var(--el-color-info);
        }

        &.scheduled {
          background: var(--primary-light-bg);
          color: var(--el-color-primary);
        }
      }
    }

    .timeline-content-text {
      color: var(--text-primary);
      line-height: var(--line-height-normal, 1.5);
      margin-bottom: var(--spacing-xs);
    }

    .timeline-next {
      font-size: var(--text-sm);
      color: var(--el-color-primary);
      font-style: italic;
    }
  }

  .empty-history {
    padding: var(--spacing-xl) 0;
  }

  .action-buttons {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--border-color);
  }
}
</style>
