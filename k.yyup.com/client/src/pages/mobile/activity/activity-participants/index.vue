<template>
  <MobileCenterLayout title="参与者管理" back-path="/mobile/activity/activity-index">
    <div class="activity-participants-mobile">
      <!-- 搜索筛选 -->
      <van-sticky offset-top="46">
        <van-search v-model="searchText" placeholder="搜索参与者姓名" @search="onSearch" @clear="onSearch" />
        <van-dropdown-menu>
          <van-dropdown-item v-model="filterActivity" :options="activityOptions" @change="onFilter" />
          <van-dropdown-item v-model="filterStatus" :options="statusOptions" @change="onFilter" />
        </van-dropdown-menu>
      </van-sticky>

      <!-- 统计概览 -->
      <div class="stats-bar">
        <div class="stat-item">
          <span class="value">{{ stats.total }}</span>
          <span class="label">总人数</span>
        </div>
        <div class="stat-item">
          <span class="value success">{{ stats.checkedIn }}</span>
          <span class="label">已签到</span>
        </div>
        <div class="stat-item">
          <span class="value warning">{{ stats.notCheckedIn }}</span>
          <span class="label">未签到</span>
        </div>
        <div class="stat-item">
          <span class="value danger">{{ stats.cancelled }}</span>
          <span class="label">已取消</span>
        </div>
      </div>

      <!-- 参与者列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
          <div class="participant-list">
            <van-swipe-cell v-for="item in participantList" :key="item.id">
              <div class="participant-card" @click="viewDetail(item)">
                <van-image :src="item.avatar || 'https://via.placeholder.com/48'" width="48" height="48" round />
                <div class="participant-info">
                  <div class="name-row">
                    <span class="name">{{ item.studentName }}</span>
                    <van-tag size="medium">{{ item.studentAge }}岁</van-tag>
                  </div>
                  <div class="parent-info">
                    <van-icon name="friends-o" />
                    {{ item.parentName }} {{ item.parentPhone }}
                  </div>
                  <div class="activity-info">
                    <van-icon name="calendar-o" />
                    {{ item.activityTitle }}
                  </div>
                </div>
                <div class="participant-status">
                  <van-tag :type="getStatusTagType(item.status)">{{ getStatusLabel(item.status) }}</van-tag>
                </div>
              </div>
              <template #right>
                <van-button square type="primary" text="签到" @click="handleCheckin(item)" v-if="item.status === 'registered'" />
                <van-button square type="warning" text="联系" @click="handleContact(item)" />
                <van-button square type="danger" text="取消" @click="handleCancel(item)" v-if="item.status !== 'cancelled'" />
              </template>
            </van-swipe-cell>
          </div>
          <van-empty v-if="participantList.length === 0 && !loading" description="暂无参与者" />
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 参与者详情 -->
    <van-popup v-model:show="showDetail" position="bottom" round :style="{ height: '60%' }" closeable>
      <div class="detail-popup" v-if="currentParticipant">
        <div class="popup-title">参与者详情</div>
        <van-cell-group inset>
          <van-cell title="学生姓名" :value="currentParticipant.studentName" />
          <van-cell title="学生年龄" :value="`${currentParticipant.studentAge}岁`" />
          <van-cell title="家长姓名" :value="currentParticipant.parentName" />
          <van-cell title="联系电话" :value="currentParticipant.parentPhone" is-link @click="callPhone(currentParticipant.parentPhone)" />
          <van-cell title="参与活动" :value="currentParticipant.activityTitle" />
          <van-cell title="报名时间" :value="currentParticipant.registeredAt" />
          <van-cell title="状态" :value="getStatusLabel(currentParticipant.status)" />
        </van-cell-group>
      </div>
    </van-popup>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { showToast, showSuccessToast, showConfirmDialog } from 'vant'
import type { TagType } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

const searchText = ref('')
const filterActivity = ref('')
const filterStatus = ref('')
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const stats = reactive({ total: 45, checkedIn: 32, notCheckedIn: 10, cancelled: 3 })

const activityOptions = [
  { text: '全部活动', value: '' },
  { text: '开放日活动', value: '1' },
  { text: '家长会', value: '2' }
]

const statusOptions = [
  { text: '全部状态', value: '' },
  { text: '已报名', value: 'registered' },
  { text: '已签到', value: 'checkedIn' },
  { text: '已取消', value: 'cancelled' }
]

interface Participant {
  id: number
  studentName: string
  studentAge: number
  parentName: string
  parentPhone: string
  activityId: number
  activityTitle: string
  status: string
  registeredAt: string
  avatar?: string
}

const participantList = ref<Participant[]>([])
const showDetail = ref(false)
const currentParticipant = ref<Participant | null>(null)

const getStatusTagType = (status: string): TagType => {
  const map: Record<string, TagType> = { registered: 'primary', checkedIn: 'success', cancelled: 'danger' }
  return map[status] || 'default'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = { registered: '已报名', checkedIn: '已签到', cancelled: '已取消' }
  return map[status] || '未知'
}

const loadData = async () => {
  const mockData: Participant[] = [
    { id: 1, studentName: '小明', studentAge: 5, parentName: '张家长', parentPhone: '13800138001', activityId: 1, activityTitle: '开放日活动', status: 'checkedIn', registeredAt: '2025-01-20 10:30' },
    { id: 2, studentName: '小红', studentAge: 4, parentName: '李家长', parentPhone: '13800138002', activityId: 1, activityTitle: '开放日活动', status: 'registered', registeredAt: '2025-01-20 11:20' },
    { id: 3, studentName: '小刚', studentAge: 6, parentName: '王家长', parentPhone: '13800138003', activityId: 2, activityTitle: '家长会', status: 'cancelled', registeredAt: '2025-01-18 09:15' }
  ]
  return mockData
}

const onLoad = async () => {
  loading.value = true
  const data = await loadData()
  participantList.value = data
  loading.value = false
  finished.value = true
}

const onRefresh = async () => {
  finished.value = false
  await onLoad()
  refreshing.value = false
}

const onSearch = () => { onRefresh() }
const onFilter = () => { onRefresh() }

const viewDetail = (item: Participant) => {
  currentParticipant.value = item
  showDetail.value = true
}

const handleCheckin = (item: Participant) => {
  showConfirmDialog({ title: '确认签到', message: `确定为 ${item.studentName} 签到？` }).then(() => {
    item.status = 'checkedIn'
    showSuccessToast('签到成功')
  }).catch(() => {})
}

const handleContact = (item: Participant) => {
  window.location.href = `tel:${item.parentPhone}`
}

const handleCancel = (item: Participant) => {
  showConfirmDialog({ title: '取消报名', message: `确定取消 ${item.studentName} 的报名？` }).then(() => {
    item.status = 'cancelled'
    showSuccessToast('已取消')
  }).catch(() => {})
}

const callPhone = (phone: string) => {
  window.location.href = `tel:${phone}`
}

onMounted(() => { onLoad() })
</script>

<style scoped lang="scss">
.activity-participants-mobile {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}

.stats-bar {
  display: flex;
  background: #fff;
  padding: 12px 16px;
  margin-bottom: 12px;

  .stat-item {
    flex: 1;
    text-align: center;

    .value {
      display: block;
      font-size: 20px;
      font-weight: 600;
      &.success { color: #07c160; }
      &.warning { color: #ff9800; }
      &.danger { color: #ee0a24; }
    }

    .label {
      font-size: 12px;
      color: #969799;
    }
  }
}

.participant-list {
  padding: 0 12px;
}

.participant-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;

  .participant-info {
    flex: 1;
    min-width: 0;

    .name-row {
      display: flex;
      align-items: center;
      gap: 8px;
      .name { font-size: 15px; font-weight: 500; }
    }

    .parent-info, .activity-info {
      font-size: 12px;
      color: #969799;
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

.detail-popup {
  padding: 16px;
  .popup-title { font-size: 18px; font-weight: 500; text-align: center; margin-bottom: 16px; }
}
</style>
