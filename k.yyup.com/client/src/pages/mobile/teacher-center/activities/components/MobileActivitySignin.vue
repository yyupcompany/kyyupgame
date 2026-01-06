<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '85%' }"
    round
    closeable
    @close="handleClose"
  >
    <div class="mobile-activity-signin" v-if="activity">
      <!-- 签到头部 -->
      <div class="signin-header">
        <div class="activity-info">
          <h3>{{ activity.title }}</h3>
          <div class="activity-meta">
            <van-tag type="primary" size="small">{{ getActivityTypeText(activity.activityType) }}</van-tag>
            <span class="activity-time">{{ formatDateTime(activity.startTime, activity.endTime) }}</span>
          </div>
        </div>

        <!-- 签到统计 -->
        <div class="signin-stats">
          <div class="stat-item">
            <div class="stat-number">{{ signinStats.total }}</div>
            <div class="stat-label">应到人数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number signed">{{ signinStats.signed }}</div>
            <div class="stat-label">已签到</div>
          </div>
          <div class="stat-item">
            <div class="stat-number unsigned">{{ signinStats.unsigned }}</div>
            <div class="stat-label">未签到</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ signinRate }}%</div>
            <div class="stat-label">签到率</div>
          </div>
        </div>
      </div>

      <!-- 签到操作区 -->
      <div class="signin-actions">
        <van-row gutter="12">
          <van-col span="8">
            <van-button
              type="primary"
              size="large"
              block
              icon="scan"
              @click="handleScanSignin"
            >
              扫码签到
            </van-button>
          </van-col>
          <van-col span="8">
            <van-button
              type="success"
              size="large"
              block
              icon="friends-o"
              @click="handleManualSignin"
            >
              手动签到
            </van-button>
          </van-col>
          <van-col span="8">
            <van-button
              type="warning"
              size="large"
              block
              icon="passed"
              @click="handleBatchSignin"
            >
              批量签到
            </van-button>
          </van-col>
        </van-row>
      </div>

      <!-- 搜索和筛选 -->
      <div class="signin-filters">
        <van-search
          v-model="searchKeyword"
          placeholder="搜索参与者姓名"
          @search="handleSearch"
        />

        <van-tabs v-model:active="activeFilter" sticky @change="handleFilterChange">
          <van-tab title="全部" name="all">
            <template #title>
              <span>全部 ({{ participants.length }})</span>
            </template>
          </van-tab>
          <van-tab title="已签到" name="signed">
            <template #title>
              <span>已签到 ({{ signedCount }})</span>
            </template>
          </van-tab>
          <van-tab title="未签到" name="unsigned">
            <template #title>
              <span>未签到 ({{ unsignedCount }})</span>
            </template>
          </van-tab>
        </van-tabs>
      </div>

      <!-- 参与者列表 -->
      <div class="participants-list">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
          >
            <van-cell
              v-for="participant in filteredParticipants"
              :key="participant.id"
              class="participant-item"
              :class="{ 'signed': participant.checkedIn }"
            >
              <template #title>
                <div class="participant-info">
                  <div class="participant-avatar">
                    <van-image
                      :src="participant.avatar || '/default-avatar.png'"
                      round
                      width="40"
                      height="40"
                    />
                  </div>
                  <div class="participant-details">
                    <div class="participant-name">{{ participant.name }}</div>
                    <div class="participant-meta">
                      <span class="class-info">{{ participant.class || participant.phone }}</span>
                      <van-tag
                        v-if="participant.checkedIn"
                        type="success"
                        size="mini"
                      >
                        已签到
                      </van-tag>
                    </div>
                  </div>
                </div>
              </template>

              <template #right-icon>
                <div class="participant-actions">
                  <span v-if="participant.checkedIn" class="signin-time">
                    {{ participant.signinTime }}
                  </span>
                  <van-button
                    v-if="!participant.checkedIn"
                    size="mini"
                    type="primary"
                    @click="handleSingleSignin(participant)"
                  >
                    签到
                  </van-button>
                  <van-button
                    v-if="participant.checkedIn"
                    size="mini"
                    type="warning"
                    plain
                    @click="handleCancelSignin(participant)"
                  >
                    取消
                  </van-button>
                </div>
              </template>
            </van-cell>
          </van-list>
        </van-pull-refresh>
      </div>

      <!-- 底部操作栏 -->
      <div class="signin-footer">
        <van-button
          type="primary"
          size="large"
          block
          icon="down"
          @click="handleExportSignin"
        >
          导出签到表
        </van-button>
      </div>
    </div>

    <!-- 手动签到弹窗 -->
    <van-dialog
      v-model:show="showManualSignin"
      title="手动签到"
      show-cancel-button
      @confirm="confirmManualSignin"
    >
      <div class="manual-signin-form">
        <van-field
          v-model="manualSigninForm.phone"
          label="手机号"
          placeholder="请输入参与者手机号"
          type="tel"
          :rules="[{ required: true, message: '请输入手机号' }]"
        />
        <van-field
          v-model="manualSigninForm.name"
          label="姓名"
          placeholder="请输入参与者姓名"
          :rules="[{ required: true, message: '请输入姓名' }]"
        />
      </div>
    </van-dialog>

    <!-- 批量签到选择弹窗 -->
    <van-popup v-model:show="showBatchSignin" position="bottom" :style="{ height: '60%' }">
      <div class="batch-signin-popup">
        <div class="batch-header">
          <h3>批量签到</h3>
          <van-button type="primary" size="small" @click="confirmBatchSignin">
            确认签到 ({{ selectedParticipants.length }}人)
          </van-button>
        </div>
        <div class="batch-content">
          <van-checkbox-group v-model="selectedParticipants">
            <van-cell
              v-for="participant in unsignedParticipants"
              :key="participant.id"
              clickable
              @click="toggleParticipantSelection(participant.id)"
            >
              <template #title>
                <van-checkbox :name="participant.id" :checked="selectedParticipants.includes(participant.id)">
                  {{ participant.name }} - {{ participant.class || participant.phone }}
                </van-checkbox>
              </template>
            </van-cell>
          </van-checkbox-group>
        </div>
      </div>
    </van-popup>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { showToast, showLoadingToast, closeToast, showConfirmDialog } from 'vant'
import dayjs from 'dayjs'

interface Participant {
  id: number
  name: string
  phone?: string
  class?: string
  avatar?: string
  checkedIn: boolean
  signinTime?: string
}

interface Activity {
  id: number
  title: string
  activityType: number
  startTime: string
  endTime: string
  location: string
}

interface Props {
  modelValue: boolean
  activity?: Activity | null
  participants?: Participant[]
}

const props = withDefaults(defineProps<Props>(), {
  activity: null,
  participants: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  signin: [participantId: number]
  cancelSignin: [participantId: number]
  batchSignin: [participantIds: number[]]
  exportSignin: [activity: Activity]
}>()

const searchKeyword = ref('')
const activeFilter = ref('all')
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const showManualSignin = ref(false)
const showBatchSignin = ref(false)
const selectedParticipants = ref<number[]>([])

const manualSigninForm = ref({
  phone: '',
  name: ''
})

// 弹窗显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 签到统计
const signinStats = computed(() => {
  const total = props.participants.length
  const signed = props.participants.filter(p => p.checkedIn).length
  const unsigned = total - signed

  return { total, signed, unsigned }
})

const signinRate = computed(() => {
  if (signinStats.value.total === 0) return 0
  return Math.round((signinStats.value.signed / signinStats.value.total) * 100)
})

// 筛选后的参与者列表
const filteredParticipants = computed(() => {
  let result = props.participants

  // 关键词搜索
  if (searchKeyword.value) {
    result = result.filter(participant =>
      participant.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      participant.phone?.includes(searchKeyword.value) ||
      participant.class?.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  // 签到状态筛选
  if (activeFilter.value === 'signed') {
    result = result.filter(p => p.checkedIn)
  } else if (activeFilter.value === 'unsigned') {
    result = result.filter(p => !p.checkedIn)
  }

  return result
})

const signedCount = computed(() => {
  return props.participants.filter(p => p.checkedIn).length
})

const unsignedCount = computed(() => {
  return props.participants.filter(p => !p.checkedIn).length
})

const unsignedParticipants = computed(() => {
  return props.participants.filter(p => !p.checkedIn)
})

const onRefresh = () => {
  refreshing.value = true
  setTimeout(() => {
    refreshing.value = false
  }, 1000)
}

const handleSearch = (keyword: string) => {
  searchKeyword.value = keyword
}

const handleFilterChange = (filterName: string) => {
  activeFilter.value = filterName
}

const handleScanSignin = () => {
  showToast('扫码签到功能开发中...')
}

const handleManualSignin = () => {
  manualSigninForm.value = { phone: '', name: '' }
  showManualSignin.value = true
}

const confirmManualSignin = () => {
  if (!manualSigninForm.value.phone || !manualSigninForm.value.name) {
    showToast('请填写完整信息')
    return
  }

  showLoadingToast({
    message: '签到中...',
    forbidClick: true
  })

  // 模拟签到
  setTimeout(() => {
    closeToast()
    showToast('签到成功')
    showManualSignin.value = false
  }, 1000)
}

const handleSingleSignin = (participant: Participant) => {
  emit('signin', participant.id)
  showToast(`${participant.name} 签到成功`)
}

const handleCancelSignin = async (participant: Participant) => {
  try {
    await showConfirmDialog({
      title: '确认取消',
      message: `确定要取消${participant.name}的签到吗？`
    })

    emit('cancelSignin', participant.id)
    showToast(`已取消${participant.name}的签到`)
  } catch {
    // 用户取消
  }
}

const handleBatchSignin = () => {
  selectedParticipants.value = []
  showBatchSignin.value = true
}

const toggleParticipantSelection = (participantId: number) => {
  const index = selectedParticipants.value.indexOf(participantId)
  if (index > -1) {
    selectedParticipants.value.splice(index, 1)
  } else {
    selectedParticipants.value.push(participantId)
  }
}

const confirmBatchSignin = () => {
  if (selectedParticipants.value.length === 0) {
    showToast('请选择要签到的参与者')
    return
  }

  showLoadingToast({
    message: '批量签到中...',
    forbidClick: true
  })

  emit('batchSignin', selectedParticipants.value)

  setTimeout(() => {
    closeToast()
    showToast(`成功签到${selectedParticipants.value.length}人`)
    showBatchSignin.value = false
    selectedParticipants.value = []
  }, 1000)
}

const handleExportSignin = () => {
  if (!props.activity) return

  emit('exportSignin', props.activity)
  showToast('签到表导出成功')
}

const handleClose = () => {
  visible.value = false
  searchKeyword.value = ''
  activeFilter.value = 'all'
  selectedParticipants.value = []
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
    return `${start.format('MM-DD HH:mm')} ~ ${end.format('HH:mm')}`
  } else {
    return `${start.format('MM-DD HH:mm')} ~ ${end.format('MM-DD HH:mm')}`
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.mobile-activity-signin {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--primary-color);

  .signin-header {
    background: var(--card-bg);
    padding: var(--spacing-md);
    border-bottom: 1px solid #eee;

    .activity-info {
      margin-bottom: 16px;

      h3 {
        margin: 0 0 8px 0;
        font-size: var(--text-lg);
        font-weight: 600;
      }

      .activity-meta {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);

        .activity-time {
          font-size: var(--text-sm);
          color: #666;
        }
      }
    }

    .signin-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--spacing-md);

      .stat-item {
        text-align: center;
        padding: var(--spacing-md) 8px;
        background: var(--primary-color);
        border-radius: 8px;

        .stat-number {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;

          &.signed {
            color: var(--text-primary);
          }

          &.unsigned {
            color: var(--text-primary);
          }
        }

        .stat-label {
          font-size: var(--text-xs);
          color: #666;
        }
      }
    }
  }

  .signin-actions {
    padding: var(--spacing-md);
    background: var(--card-bg);
    border-bottom: 1px solid #eee;
  }

  .signin-filters {
    background: var(--card-bg);
    border-bottom: 1px solid #eee;
  }

  .participants-list {
    flex: 1;
    overflow-y: auto;

    .participant-item {
      margin-bottom: 2px;
      background: var(--card-bg);

      &.signed {
        background: var(--primary-color);
      }

      .participant-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);

        .participant-details {
          flex: 1;

          .participant-name {
            font-size: var(--text-base);
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: 4px;
          }

          .participant-meta {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);

            .class-info {
              font-size: var(--text-sm);
              color: #666;
            }
          }
        }
      }

      .participant-actions {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: var(--spacing-xs);

        .signin-time {
          font-size: var(--text-xs);
          color: var(--text-primary);
        }
      }
    }
  }

  .signin-footer {
    padding: var(--spacing-md);
    background: var(--card-bg);
    border-top: 1px solid #eee;
  }
}

.manual-signin-form {
  padding: var(--spacing-md);
}

.batch-signin-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .batch-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    border-bottom: 1px solid #eee;

    h3 {
      margin: 0;
      font-size: var(--text-base);
      font-weight: 600;
    }
  }

  .batch-content {
    flex: 1;
    padding: var(--spacing-md);
    overflow-y: auto;
  }
}

:deep(.van-tabs__content) {
  background: var(--primary-color);
}

:deep(.van-checkbox) {
  .van-checkbox__label {
    color: var(--text-primary);
  }
}
</style>