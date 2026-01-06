<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '90%' }"
    round
    closeable
    @close="handleClose"
  >
    <div class="mobile-activity-detail" v-if="activity">
      <!-- 活动头部信息 -->
      <div class="detail-header">
        <div class="header-background" :style="{ backgroundImage: `url(${activity.coverImage || '/default-activity.jpg'})` }">
          <div class="header-overlay">
            <div class="activity-status">
              <van-tag :type="getActivityStatusType(activity.status)" size="large">
                {{ getActivityStatusText(activity.status) }}
              </van-tag>
            </div>
            <h2 class="activity-title">{{ activity.title }}</h2>
            <div class="activity-type">
              <van-tag type="primary" plain>{{ getActivityTypeText(activity.activityType) }}</van-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 活动内容 -->
      <div class="detail-content">
        <!-- 基本信息 -->
        <van-cell-group inset title="基本信息">
          <van-cell>
            <template #title>
              <div class="info-item">
                <van-icon name="clock-o" />
                <span class="info-label">时间</span>
              </div>
            </template>
            <template #value>
              <div class="info-value">
                {{ formatDateTime(activity.startTime, activity.endTime) }}
              </div>
            </template>
          </van-cell>

          <van-cell>
            <template #title>
              <div class="info-item">
                <van-icon name="location-o" />
                <span class="info-label">地点</span>
              </div>
            </template>
            <template #value>
              <div class="info-value">{{ activity.location }}</div>
            </template>
          </van-cell>

          <van-cell>
            <template #title>
              <div class="info-item">
                <van-icon name="friends-o" />
                <span class="info-label">参与情况</span>
              </div>
            </template>
            <template #value>
              <div class="info-value">
                {{ activity.registeredCount || 0 }}/{{ activity.capacity }}人
                <van-progress
                  :percentage="getProgressPercentage(activity)"
                  stroke-width="4"
                  color="#409EFF"
                  :show-pivot="false"
                />
              </div>
            </template>
          </van-cell>

          <van-cell v-if="activity.fee && activity.fee > 0">
            <template #title>
              <div class="info-item">
                <van-icon name="balance-o" />
                <span class="info-label">费用</span>
              </div>
            </template>
            <template #value>
              <div class="info-value price">￥{{ activity.fee }}</div>
            </template>
          </van-cell>
        </van-cell-group>

        <!-- 活动描述 -->
        <van-cell-group inset title="活动描述" v-if="activity.description">
          <van-cell>
            <div class="description">{{ activity.description }}</div>
          </van-cell>
        </van-cell-group>

        <!-- 活动议程 -->
        <van-cell-group inset title="活动议程" v-if="activity.agenda">
          <van-cell>
            <div class="agenda">{{ activity.agenda }}</div>
          </van-cell>
        </van-cell-group>

        <!-- 报名信息 -->
        <van-cell-group inset title="报名信息">
          <van-cell title="报名时间">
            <template #value>
              {{ formatDateTime(activity.registrationStartTime, activity.registrationEndTime) }}
            </template>
          </van-cell>

          <van-cell title="是否需要审核">
            <template #value>
              <van-tag :type="activity.needsApproval ? 'warning' : 'success'">
                {{ activity.needsApproval ? '需要审核' : '无需审核' }}
              </van-tag>
            </template>
          </van-cell>
        </van-cell-group>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <van-button
            v-if="canJoin"
            type="primary"
            size="large"
            block
            :loading="joining"
            @click="handleJoin"
          >
            立即报名
          </van-button>

          <van-button
            v-if="canCancel"
            type="warning"
            size="large"
            block
            :loading="cancelling"
            @click="handleCancel"
          >
            取消报名
          </van-button>

          <van-button
            v-if="canEdit"
            type="default"
            size="large"
            block
            @click="handleEdit"
          >
            编辑活动
          </van-button>

          <van-button
            v-if="canCheckin"
            type="success"
            size="large"
            block
            @click="handleCheckin"
          >
            活动签到
          </van-button>

          <van-button
            v-if="canDelete"
            type="danger"
            size="large"
            block
            :loading="deleting"
            @click="handleDelete"
          >
            删除活动
          </van-button>
        </div>

        <!-- 参与者列表 -->
        <van-cell-group inset title="参与者" v-if="participants.length > 0">
          <van-list>
            <van-cell
              v-for="participant in participants"
              :key="participant.id"
              :title="participant.name"
              :label="participant.class || participant.phone"
            >
              <template #right-icon>
                <van-tag
                  :type="participant.checkedIn ? 'success' : 'default'"
                  size="small"
                >
                  {{ participant.checkedIn ? '已签到' : '未签到' }}
                </van-tag>
              </template>
            </van-cell>
          </van-list>
        </van-cell-group>

        <!-- 备注信息 -->
        <van-cell-group inset title="备注信息" v-if="activity.remark">
          <van-cell>
            <div class="remark">{{ activity.remark }}</div>
          </van-cell>
        </van-cell-group>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { showToast, showConfirmDialog, showLoadingToast, closeToast } from 'vant'
import dayjs from 'dayjs'

interface Participant {
  id: number
  name: string
  class?: string
  phone?: string
  checkedIn: boolean
}

interface Activity {
  id: number
  title: string
  description?: string
  activityType: number
  coverImage?: string
  startTime: string
  endTime: string
  location: string
  capacity: number
  fee?: number
  agenda?: string
  registrationStartTime: string
  registrationEndTime: string
  needsApproval: number
  status: number
  registeredCount?: number
  isOrganizer?: boolean
  isParticipant?: boolean
  remark?: string
}

interface Props {
  modelValue: boolean
  activity?: Activity | null
}

const props = withDefaults(defineProps<Props>(), {
  activity: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  join: [activity: Activity]
  cancel: [activity: Activity]
  edit: [activity: Activity]
  delete: [activity: Activity]
  checkin: [activity: Activity]
}>()

const joining = ref(false)
const cancelling = ref(false)
const deleting = ref(false)
const participants = ref<Participant[]>([])

// 弹窗显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 权限控制
const canJoin = computed(() => {
  return props.activity &&
         !props.activity.isParticipant &&
         props.activity.status === 2 // 报名中
})

const canCancel = computed(() => {
  return props.activity &&
         props.activity.isParticipant &&
         props.activity.status <= 3 // 报名中或进行中
})

const canEdit = computed(() => {
  return props.activity &&
         props.activity.isOrganizer &&
         props.activity.status !== 4 && // 已结束的活动不能编辑
         props.activity.status !== 5    // 已取消的活动不能编辑
})

const canDelete = computed(() => {
  return props.activity &&
         props.activity.isOrganizer &&
         props.activity.status === 0 // 只有草稿状态可以删除
})

const canCheckin = computed(() => {
  return props.activity &&
         props.activity.isOrganizer &&
         props.activity.status === 3 // 进行中的活动可以签到
})

// 加载参与者数据
const loadParticipants = async () => {
  if (!props.activity) return

  try {
    // 模拟参与者数据
    participants.value = [
      { id: 1, name: '张小明', class: '大班A', checkedIn: true },
      { id: 2, name: '李小红', class: '大班A', checkedIn: false },
      { id: 3, name: '王小华', class: '大班B', checkedIn: true },
      { id: 4, name: '赵小丽', class: '大班B', checkedIn: false },
      { id: 5, name: '陈小强', class: '中班A', checkedIn: true }
    ]
  } catch (error) {
    console.error('加载参与者失败:', error)
  }
}

const handleClose = () => {
  visible.value = false
  participants.value = []
}

const handleJoin = async () => {
  if (!props.activity) return

  try {
    await showConfirmDialog({
      title: '确认报名',
      message: `确定要报名参加"${props.activity.title}"吗？`
    })

    joining.value = true
    showLoadingToast({
      message: '报名中...',
      forbidClick: true
    })

    emit('join', props.activity)

    closeToast()
    showToast('报名成功')
    visible.value = false
  } catch (error) {
    if (error !== 'cancel') {
      showToast('报名失败')
    }
  } finally {
    joining.value = false
  }
}

const handleCancel = async () => {
  if (!props.activity) return

  try {
    await showConfirmDialog({
      title: '确认取消',
      message: `确定要取消报名"${props.activity.title}"吗？`
    })

    cancelling.value = true
    showLoadingToast({
      message: '取消中...',
      forbidClick: true
    })

    emit('cancel', props.activity)

    closeToast()
    showToast('取消成功')
    visible.value = false
  } catch (error) {
    if (error !== 'cancel') {
      showToast('取消失败')
    }
  } finally {
    cancelling.value = false
  }
}

const handleEdit = () => {
  if (!props.activity) return
  emit('edit', props.activity)
}

const handleDelete = async () => {
  if (!props.activity) return

  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除活动"${props.activity.title}"吗？此操作不可恢复。`
    })

    deleting.value = true
    showLoadingToast({
      message: '删除中...',
      forbidClick: true
    })

    emit('delete', props.activity)

    closeToast()
    showToast('删除成功')
    visible.value = false
  } catch (error) {
    if (error !== 'cancel') {
      showToast('删除失败')
    }
  } finally {
    deleting.value = false
  }
}

const handleCheckin = () => {
  if (!props.activity) return
  emit('checkin', props.activity)
}

const getActivityStatusType = (status: number): string => {
  const typeMap: Record<number, string> = {
    0: 'default', // 草稿
    1: 'warning', // 未开始
    2: 'primary', // 报名中
    3: 'success', // 进行中
    4: 'default', // 已结束
    5: 'danger'   // 已取消
  }
  return typeMap[status] || 'default'
}

const getActivityStatusText = (status: number): string => {
  const textMap: Record<number, string> = {
    0: '草稿',
    1: '未开始',
    2: '报名中',
    3: '进行中',
    4: '已结束',
    5: '已取消'
  }
  return textMap[status] || '未知'
}

const getActivityTypeText = (type: number): string => {
  const typeMap: Record<number, string> = {
    1: '开放日',
    2: '体验课',
    3: '亲子活动',
    4: '招生说明会',
    5: '家长会',
    6: '节日活动',
    7: '其他'
  }
  return typeMap[type] || '未知'
}

const formatDateTime = (startTime: string, endTime: string): string => {
  const start = dayjs(startTime)
  const end = dayjs(endTime)

  if (start.isSame(end, 'day')) {
    return `${start.format('YYYY年MM月DD日 HH:mm')} ~ ${end.format('HH:mm')}`
  } else {
    return `${start.format('YYYY年MM月DD日 HH:mm')} ~ ${end.format('YYYY年MM月DD日 HH:mm')}`
  }
}

const getProgressPercentage = (activity: Activity): number => {
  if (!activity.capacity || activity.capacity === 0) return 0
  const registered = activity.registeredCount || 0
  return Math.round((registered / activity.capacity) * 100)
}

// 监听弹窗显示，加载参与者数据
watch(() => visible.value, (show) => {
  if (show && props.activity) {
    loadParticipants()
  }
})

onMounted(() => {
  if (visible.value && props.activity) {
    loadParticipants()
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.mobile-activity-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--primary-color);

  .detail-header {
    .header-background {
      height: 200px;
      background-size: cover;
      background-position: center;
      position: relative;

      .header-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6));
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: var(--spacing-lg);
        color: white;

        .activity-status {
          margin-bottom: 12px;
        }

        .activity-title {
          font-size: var(--text-2xl);
          font-weight: 600;
          margin: 0 0 12px 0;
          line-height: 1.2;
        }

        .activity-type {
          align-self: flex-start;
        }
      }
    }
  }

  .detail-content {
    flex: 1;
    padding: var(--spacing-md);
    overflow-y: auto;

    .info-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      .info-label {
        font-weight: 500;
        color: #666;
      }
    }

    .info-value {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
      align-items: flex-end;

      &.price {
        color: var(--text-primary);
        font-weight: 600;
        font-size: var(--text-lg);
      }

      .van-progress {
        width: 100px;
      }
    }

    .description,
    .agenda,
    .remark {
      line-height: 1.6;
      color: #333;
      white-space: pre-wrap;
    }

    .action-buttons {
      padding: var(--spacing-md) 0;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);

      .van-button {
        height: 50px;
        font-size: var(--text-base);
        border-radius: 8px;
      }
    }
  }
}

:deep(.van-cell-group) {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.van-progress) {
  .van-progress__portion {
    background: linear-gradient(90deg, #409EFF, #67C23A);
  }
}
</style>