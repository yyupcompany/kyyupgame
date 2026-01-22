<template>
  <MobileCenterLayout title="报名审批" back-path="/mobile/activity/activity-index">
    <div class="activity-approval-mobile">
      <!-- 统计概览 -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stats-item" @click="filterStatus = 'pending'">
            <div class="stats-value pending">{{ stats.pending }}</div>
            <div class="stats-label">待审核</div>
          </div>
          <div class="stats-item" @click="filterStatus = 'approved'">
            <div class="stats-value success">{{ stats.approved }}</div>
            <div class="stats-label">已通过</div>
          </div>
          <div class="stats-item" @click="filterStatus = 'rejected'">
            <div class="stats-value danger">{{ stats.rejected }}</div>
            <div class="stats-label">已拒绝</div>
          </div>
          <div class="stats-item" @click="filterStatus = ''">
            <div class="stats-value">{{ stats.total }}</div>
            <div class="stats-label">全部</div>
          </div>
        </div>
      </div>

      <!-- 筛选栏 -->
      <van-sticky offset-top="46">
        <div class="filter-section">
          <van-search
            v-model="searchText"
            placeholder="搜索学生/家长姓名"
            @search="onSearch"
            @clear="onSearch"
          />
          <van-dropdown-menu>
            <van-dropdown-item v-model="filterActivity" :options="activityOptions" @change="onFilter" />
            <van-dropdown-item v-model="filterStatus" :options="statusOptions" @change="onFilter" />
          </van-dropdown-menu>
        </div>
      </van-sticky>

      <!-- 批量操作 -->
      <div class="batch-actions" v-if="selectedIds.length > 0">
        <div class="selected-info">已选择 {{ selectedIds.length }} 项</div>
        <div class="batch-buttons">
          <van-button type="success" size="small" @click="handleBatchApprove">批量通过</van-button>
          <van-button type="danger" size="small" @click="handleBatchReject">批量拒绝</van-button>
          <van-button size="small" @click="selectedIds = []">取消</van-button>
        </div>
      </div>

      <!-- 报名列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="listLoading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <van-checkbox-group v-model="selectedIds">
            <div class="registration-list">
              <div
                v-for="item in registrationList"
                :key="item.id"
                class="registration-card"
              >
                <div class="card-checkbox" v-if="item.status === 'pending'">
                  <van-checkbox :name="item.id" shape="square" />
                </div>
                <div class="card-content" @click="handleView(item)">
                  <div class="card-header">
                    <div class="activity-info">
                      <div class="activity-title">{{ item.activityTitle }}</div>
                      <div class="activity-time">{{ formatDate(item.activityStartTime) }}</div>
                    </div>
                    <van-tag :type="getStatusTagType(item.status)" size="medium">
                      {{ getStatusLabel(item.status) }}
                    </van-tag>
                  </div>
                  <div class="card-body">
                    <div class="info-row">
                      <van-icon name="user-o" />
                      <span class="label">学生:</span>
                      <span class="value">{{ item.studentName }} ({{ item.studentAge }}岁)</span>
                    </div>
                    <div class="info-row">
                      <van-icon name="friends-o" />
                      <span class="label">家长:</span>
                      <span class="value">{{ item.parentName }}</span>
                    </div>
                    <div class="info-row">
                      <van-icon name="phone-o" />
                      <span class="label">电话:</span>
                      <span class="value">{{ item.parentPhone }}</span>
                    </div>
                    <div class="info-row">
                      <van-icon name="clock-o" />
                      <span class="label">报名时间:</span>
                      <span class="value">{{ formatDate(item.registeredAt) }}</span>
                    </div>
                  </div>
                  <div class="card-actions" @click.stop v-if="item.status === 'pending'">
                    <van-button type="success" size="small" @click="handleApprove(item)">通过</van-button>
                    <van-button type="danger" size="small" @click="handleReject(item)">拒绝</van-button>
                  </div>
                </div>
              </div>
            </div>
          </van-checkbox-group>

          <van-empty v-if="registrationList.length === 0 && !listLoading" description="暂无报名数据" />
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 报名详情弹窗 -->
    <van-popup
      v-model:show="showDetailPopup"
      position="bottom"
      round
      :style="{ height: '70%' }"
      closeable
    >
      <div class="detail-popup" v-if="currentItem">
        <div class="popup-title">报名详情</div>
        <van-cell-group inset title="活动信息">
          <van-cell title="活动名称" :value="currentItem.activityTitle" />
          <van-cell title="活动时间" :value="formatDate(currentItem.activityStartTime)" />
        </van-cell-group>
        <van-cell-group inset title="学生信息">
          <van-cell title="学生姓名" :value="currentItem.studentName" />
          <van-cell title="学生年龄" :value="`${currentItem.studentAge}岁`" />
        </van-cell-group>
        <van-cell-group inset title="家长信息">
          <van-cell title="家长姓名" :value="currentItem.parentName" />
          <van-cell title="联系电话" :value="currentItem.parentPhone" />
        </van-cell-group>
        <van-cell-group inset title="报名信息">
          <van-cell title="报名时间" :value="formatDate(currentItem.registeredAt)" />
          <van-cell title="报名状态" :value="getStatusLabel(currentItem.status)" />
          <van-cell title="备注" :value="currentItem.remark || '-'" />
        </van-cell-group>
        <div class="detail-actions" v-if="currentItem.status === 'pending'">
          <van-button type="success" block @click="handleApprove(currentItem)">通过报名</van-button>
          <van-button type="danger" block @click="handleReject(currentItem)">拒绝报名</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 拒绝原因弹窗 -->
    <van-dialog
      v-model:show="showRejectDialog"
      title="拒绝原因"
      show-cancel-button
      @confirm="confirmReject"
    >
      <van-field
        v-model="rejectReason"
        type="textarea"
        rows="3"
        placeholder="请输入拒绝原因（可选）"
        class="reject-field"
      />
    </van-dialog>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { showToast, showSuccessToast, showConfirmDialog } from 'vant'
import type { TagType } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

// 统计数据
const stats = reactive({
  pending: 12,
  approved: 45,
  rejected: 8,
  total: 65
})

// 筛选
const searchText = ref('')
const filterActivity = ref('')
const filterStatus = ref('')

const activityOptions = [
  { text: '全部活动', value: '' },
  { text: '开放日活动', value: '1' },
  { text: '家长会', value: '2' },
  { text: '亲子运动会', value: '3' }
]

const statusOptions = [
  { text: '全部状态', value: '' },
  { text: '待审核', value: 'pending' },
  { text: '已通过', value: 'approved' },
  { text: '已拒绝', value: 'rejected' },
  { text: '已取消', value: 'cancelled' }
]

// 列表状态
const refreshing = ref(false)
const listLoading = ref(false)
const finished = ref(false)
const selectedIds = ref<number[]>([])

interface Registration {
  id: number
  activityId: number
  activityTitle: string
  activityStartTime: string
  studentName: string
  studentAge: number
  parentName: string
  parentPhone: string
  registeredAt: string
  status: string
  remark?: string
}

const registrationList = ref<Registration[]>([])

// 状态转换
const getStatusTagType = (status: string): TagType => {
  const map: Record<string, TagType> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    cancelled: 'default'
  }
  return map[status] || 'default'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    cancelled: '已取消'
  }
  return map[status] || '未知'
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 加载数据
const loadData = async () => {
  const mockData: Registration[] = [
    { id: 1, activityId: 1, activityTitle: '开放日活动', activityStartTime: '2025-02-01 09:00:00', studentName: '小明', studentAge: 5, parentName: '张家长', parentPhone: '13800138001', registeredAt: '2025-01-20 10:30:00', status: 'pending' },
    { id: 2, activityId: 1, activityTitle: '开放日活动', activityStartTime: '2025-02-01 09:00:00', studentName: '小红', studentAge: 4, parentName: '李家长', parentPhone: '13800138002', registeredAt: '2025-01-20 11:20:00', status: 'pending' },
    { id: 3, activityId: 2, activityTitle: '家长会', activityStartTime: '2025-01-25 14:00:00', studentName: '小刚', studentAge: 6, parentName: '王家长', parentPhone: '13800138003', registeredAt: '2025-01-18 09:15:00', status: 'approved' },
    { id: 4, activityId: 3, activityTitle: '亲子运动会', activityStartTime: '2025-02-15 08:30:00', studentName: '小媛', studentAge: 5, parentName: '赵家长', parentPhone: '13800138004', registeredAt: '2025-01-22 16:40:00', status: 'pending' },
    { id: 5, activityId: 1, activityTitle: '开放日活动', activityStartTime: '2025-02-01 09:00:00', studentName: '小强', studentAge: 4, parentName: '周家长', parentPhone: '13800138005', registeredAt: '2025-01-21 08:50:00', status: 'rejected', remark: '名额已满' }
  ]
  return mockData
}

const onLoad = async () => {
  listLoading.value = true
  try {
    const data = await loadData()
    registrationList.value = data
    finished.value = true
  } finally {
    listLoading.value = false
  }
}

const onRefresh = async () => {
  finished.value = false
  await onLoad()
  refreshing.value = false
}

const onSearch = () => {
  registrationList.value = []
  finished.value = false
  onLoad()
}

const onFilter = () => {
  onSearch()
}

// 详情
const showDetailPopup = ref(false)
const currentItem = ref<Registration | null>(null)

const handleView = (item: Registration) => {
  currentItem.value = item
  showDetailPopup.value = true
}

// 审批操作
const handleApprove = (item: Registration) => {
  showConfirmDialog({
    title: '确认通过',
    message: `确定通过 ${item.studentName} 的报名申请？`
  }).then(async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    item.status = 'approved'
    stats.pending--
    stats.approved++
    showSuccessToast('已通过')
    showDetailPopup.value = false
  }).catch(() => {})
}

// 拒绝
const showRejectDialog = ref(false)
const rejectReason = ref('')
const rejectingItem = ref<Registration | null>(null)

const handleReject = (item: Registration) => {
  rejectingItem.value = item
  rejectReason.value = ''
  showRejectDialog.value = true
}

const confirmReject = async () => {
  if (rejectingItem.value) {
    await new Promise(resolve => setTimeout(resolve, 500))
    rejectingItem.value.status = 'rejected'
    rejectingItem.value.remark = rejectReason.value || '未说明原因'
    stats.pending--
    stats.rejected++
    showSuccessToast('已拒绝')
    showDetailPopup.value = false
  }
}

// 批量操作
const handleBatchApprove = () => {
  showConfirmDialog({
    title: '批量通过',
    message: `确定通过选中的 ${selectedIds.value.length} 个报名申请？`
  }).then(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    registrationList.value.forEach(item => {
      if (selectedIds.value.includes(item.id) && item.status === 'pending') {
        item.status = 'approved'
        stats.pending--
        stats.approved++
      }
    })
    selectedIds.value = []
    showSuccessToast('批量通过成功')
  }).catch(() => {})
}

const handleBatchReject = () => {
  rejectingItem.value = null
  rejectReason.value = ''
  showRejectDialog.value = true
}

onMounted(() => {
  onLoad()
})
</script>

<style scoped lang="scss">
.activity-approval-mobile {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}

.stats-section {
  background: #fff;
  padding: 16px;
  margin: 12px;
  border-radius: 8px;

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .stats-item {
    text-align: center;
    cursor: pointer;

    .stats-value {
      font-size: 24px;
      font-weight: 600;
      color: #323233;

      &.pending { color: #ff9800; }
      &.success { color: #07c160; }
      &.danger { color: #ee0a24; }
    }

    .stats-label {
      font-size: 12px;
      color: #969799;
      margin-top: 4px;
    }
  }
}

.filter-section {
  background: #fff;
}

.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #e8f4ff;
  margin: 0 12px 12px;
  border-radius: 8px;

  .selected-info {
    font-size: 14px;
    color: #1989fa;
  }

  .batch-buttons {
    display: flex;
    gap: 8px;
  }
}

.registration-list {
  padding: 0 12px;
}

.registration-card {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  display: flex;

  .card-checkbox {
    padding: 12px 8px 12px 12px;
    display: flex;
    align-items: flex-start;
  }

  .card-content {
    flex: 1;
    padding: 12px;
    padding-left: 0;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;

      .activity-info {
        .activity-title {
          font-size: 15px;
          font-weight: 500;
          color: #323233;
        }

        .activity-time {
          font-size: 12px;
          color: #969799;
          margin-top: 2px;
        }
      }
    }

    .card-body {
      .info-row {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: #646566;
        margin-bottom: 4px;

        .label {
          color: #969799;
        }

        .value {
          color: #323233;
        }
      }
    }

    .card-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #ebedf0;
    }
  }
}

.detail-popup {
  padding: 16px;
  height: 100%;
  overflow-y: auto;

  .popup-title {
    font-size: 18px;
    font-weight: 500;
    text-align: center;
    margin-bottom: 16px;
  }

  .detail-actions {
    padding: 16px 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

.reject-field {
  margin: 16px;
}
</style>
