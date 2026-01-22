<template>
  <MobileCenterLayout title="报名管理" back-path="/mobile/activity/activity-index">
    <template #right>
      <van-icon name="filter-o" size="20" @click="showFilterPopup = true" />
    </template>

    <div class="activity-registrations-mobile">
      <!-- 活动选择 -->
      <div class="activity-selector">
        <van-dropdown-menu>
          <van-dropdown-item v-model="selectedActivityId" :options="activityOptions" @change="handleActivityChange" />
        </van-dropdown-menu>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-section">
        <van-grid :column-num="4" :border="false">
          <van-grid-item>
            <div class="stat-content">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">总报名</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-content">
              <div class="stat-value warning">{{ stats.pending }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-content">
              <div class="stat-value success">{{ stats.approved }}</div>
              <div class="stat-label">已通过</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-content">
              <div class="stat-value danger">{{ stats.rejected }}</div>
              <div class="stat-label">已拒绝</div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 搜索栏 -->
      <van-search
        v-model="searchKeyword"
        placeholder="搜索姓名或手机号"
        shape="round"
        @search="onSearch"
      />

      <!-- 状态筛选 -->
      <van-tabs v-model:active="statusTab" class="status-tabs">
        <van-tab title="全部" name="all" />
        <van-tab title="待审核" name="pending" :badge="stats.pending > 0 ? stats.pending : ''" />
        <van-tab title="已通过" name="approved" />
        <van-tab title="已拒绝" name="rejected" />
      </van-tabs>

      <!-- 报名列表 -->
      <div class="registration-list">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="loadRegistrations"
          >
            <van-empty v-if="filteredRegistrations.length === 0 && !loading" description="暂无报名记录" />
            
            <van-cell-group inset>
              <van-swipe-cell
                v-for="item in filteredRegistrations"
                :key="item.id"
                :disabled="item.status !== 'pending'"
              >
                <van-cell center @click="showRegistrationDetail(item)">
                  <template #icon>
                    <van-image
                      round
                      width="40"
                      height="40"
                      :src="item.avatar"
                      fit="cover"
                    >
                      <template #error>
                        <van-icon name="user-o" size="24" />
                      </template>
                    </van-image>
                  </template>
                  <template #title>
                    <div class="registration-info">
                      <span class="name">{{ item.userName }}</span>
                      <van-tag
                        :type="getStatusType(item.status)"
                        size="medium"
                      >
                        {{ getStatusLabel(item.status) }}
                      </van-tag>
                    </div>
                  </template>
                  <template #label>
                    <div class="registration-detail">
                      <span>{{ item.phone }}</span>
                      <span>报名: {{ formatDate(item.registrationTime) }}</span>
                    </div>
                  </template>
                </van-cell>
                <template #right>
                  <van-button
                    square
                    type="primary"
                    text="通过"
                    class="swipe-btn"
                    @click="handleApprove(item)"
                  />
                  <van-button
                    square
                    type="danger"
                    text="拒绝"
                    class="swipe-btn"
                    @click="handleReject(item)"
                  />
                </template>
              </van-swipe-cell>
            </van-cell-group>
          </van-list>
        </van-pull-refresh>
      </div>

      <!-- 报名详情弹窗 -->
      <van-popup
        v-model:show="detailPopupVisible"
        position="bottom"
        round
        closeable
        :style="{ height: '60%' }"
      >
        <div class="detail-popup" v-if="selectedRegistration">
          <h3 class="popup-title">报名详情</h3>
          
          <div class="user-header">
            <van-image
              round
              width="60"
              height="60"
              :src="selectedRegistration.avatar"
            >
              <template #error>
                <van-icon name="user-o" size="36" />
              </template>
            </van-image>
            <div class="user-info">
              <h4>{{ selectedRegistration.userName }}</h4>
              <p>{{ selectedRegistration.phone }}</p>
            </div>
            <van-tag :type="getStatusType(selectedRegistration.status)">
              {{ getStatusLabel(selectedRegistration.status) }}
            </van-tag>
          </div>

          <van-cell-group inset>
            <van-cell title="报名时间" :value="formatDate(selectedRegistration.registrationTime)" />
            <van-cell title="参与人数" :value="selectedRegistration.participantCount + '人'" />
            <van-cell v-if="selectedRegistration.childName" title="孩子姓名" :value="selectedRegistration.childName" />
            <van-cell v-if="selectedRegistration.remark" title="备注" :value="selectedRegistration.remark" />
          </van-cell-group>

          <div class="action-buttons" v-if="selectedRegistration.status === 'pending'">
            <van-button type="danger" block plain @click="handleReject(selectedRegistration)">
              拒绝报名
            </van-button>
            <van-button type="primary" block @click="handleApprove(selectedRegistration)">
              通过报名
            </van-button>
          </div>
        </div>
      </van-popup>

      <!-- 筛选弹窗 -->
      <van-popup
        v-model:show="showFilterPopup"
        position="right"
        :style="{ width: '80%', height: '100%' }"
      >
        <div class="filter-popup">
          <h3>筛选条件</h3>
          <van-cell-group inset>
            <van-cell title="报名时间" is-link @click="showDateFilter = true" />
            <van-cell title="参与人数" is-link />
          </van-cell-group>
          <div class="filter-actions">
            <van-button type="default" block @click="resetFilter">重置</van-button>
            <van-button type="primary" block @click="applyFilter">应用</van-button>
          </div>
        </div>
      </van-popup>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { showToast, showConfirmDialog, showSuccessToast } from 'vant'
import type { TagType } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

// 数据
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const searchKeyword = ref('')
const statusTab = ref('all')
const selectedActivityId = ref('1')
const detailPopupVisible = ref(false)
const showFilterPopup = ref(false)
const showDateFilter = ref(false)
const selectedRegistration = ref<any>(null)

// 活动选项
const activityOptions = [
  { text: '春季亲子运动会', value: '1' },
  { text: '科学实验体验课', value: '2' },
  { text: '校园开放日活动', value: '3' }
]

// 统计数据
const stats = ref({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0
})

// 报名列表
const registrations = ref<any[]>([])

// 过滤后的报名
const filteredRegistrations = computed(() => {
  let result = registrations.value
  
  // 状态筛选
  if (statusTab.value !== 'all') {
    result = result.filter(r => r.status === statusTab.value)
  }
  
  // 关键词搜索
  if (searchKeyword.value) {
    result = result.filter(r =>
      r.userName?.includes(searchKeyword.value) ||
      r.phone?.includes(searchKeyword.value)
    )
  }
  
  return result
})

// 方法
const handleActivityChange = () => {
  registrations.value = []
  finished.value = false
  loadRegistrations()
}

const loadRegistrations = async () => {
  if (!selectedActivityId.value) {
    finished.value = true
    return
  }
  
  loading.value = true
  try {
    // 模拟数据
    setTimeout(() => {
      const mockData = [
        { id: '1', userName: '张三', phone: '138****1234', avatar: '', status: 'pending', registrationTime: '2025-03-10 10:30:00', participantCount: 2, childName: '张小明', remark: '' },
        { id: '2', userName: '李四', phone: '139****5678', avatar: '', status: 'approved', registrationTime: '2025-03-09 14:20:00', participantCount: 3, childName: '李小红', remark: '希望安排在前排' },
        { id: '3', userName: '王五', phone: '137****9012', avatar: '', status: 'rejected', registrationTime: '2025-03-08 09:15:00', participantCount: 1, childName: '王小华', remark: '' },
        { id: '4', userName: '赵六', phone: '136****3456', avatar: '', status: 'pending', registrationTime: '2025-03-10 16:45:00', participantCount: 2, childName: '赵小伟', remark: '孩子对花生过敏' },
        { id: '5', userName: '钱七', phone: '135****7890', avatar: '', status: 'approved', registrationTime: '2025-03-07 11:00:00', participantCount: 4, childName: '钱小芳', remark: '' }
      ]
      registrations.value = mockData
      calculateStats()
      loading.value = false
      finished.value = true
    }, 500)
  } catch (error) {
    console.error('加载报名失败:', error)
    loading.value = false
  }
}

const calculateStats = () => {
  const total = registrations.value.length
  const pending = registrations.value.filter(r => r.status === 'pending').length
  const approved = registrations.value.filter(r => r.status === 'approved').length
  const rejected = registrations.value.filter(r => r.status === 'rejected').length
  
  stats.value = { total, pending, approved, rejected }
}

const onSearch = () => {
  // computed会自动处理
}

const onRefresh = async () => {
  registrations.value = []
  finished.value = false
  await loadRegistrations()
  refreshing.value = false
}

const showRegistrationDetail = (item: any) => {
  selectedRegistration.value = item
  detailPopupVisible.value = true
}

const handleApprove = async (item: any) => {
  try {
    await showConfirmDialog({
      title: '确认',
      message: `确定通过 ${item.userName} 的报名？`
    })
    // TODO: 调用API
    item.status = 'approved'
    calculateStats()
    detailPopupVisible.value = false
    showSuccessToast('已通过')
  } catch {
    // 用户取消
  }
}

const handleReject = async (item: any) => {
  try {
    await showConfirmDialog({
      title: '确认',
      message: `确定拒绝 ${item.userName} 的报名？`
    })
    // TODO: 调用API
    item.status = 'rejected'
    calculateStats()
    detailPopupVisible.value = false
    showToast('已拒绝')
  } catch {
    // 用户取消
  }
}

const resetFilter = () => {
  showFilterPopup.value = false
}

const applyFilter = () => {
  showFilterPopup.value = false
}

const getStatusType = (status: string): TagType => {
  const typeMap: Record<string, TagType> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'default'
}

const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return labelMap[status] || status
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadRegistrations()
})
</script>

<style scoped lang="scss">
.activity-registrations-mobile {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;

  .activity-selector {
    background: #fff;
    margin-bottom: 12px;
  }

  .stats-section {
    background: #fff;
    padding: 12px;
    margin-bottom: 12px;

    .stat-content {
      text-align: center;

      .stat-value {
        font-size: 20px;
        font-weight: bold;
        color: #333;

        &.success { color: #07c160; }
        &.warning { color: #ff976a; }
        &.danger { color: #ee0a24; }
      }

      .stat-label {
        font-size: 12px;
        color: #999;
        margin-top: 4px;
      }
    }
  }

  .status-tabs {
    margin-bottom: 12px;
  }

  .registration-list {
    padding: 0 12px;

    .registration-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .name {
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }
    }

    .registration-detail {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 12px;
      color: #999;
    }

    .swipe-btn {
      height: 100%;
    }
  }

  .detail-popup {
    padding: 20px;

    .popup-title {
      text-align: center;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
    }

    .user-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f7f8fa;
      border-radius: 12px;
      margin-bottom: 16px;

      .user-info {
        flex: 1;

        h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          color: #333;
        }

        p {
          margin: 0;
          font-size: 13px;
          color: #999;
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      margin-top: 20px;
    }
  }

  .filter-popup {
    padding: 20px;

    h3 {
      font-size: 18px;
      margin-bottom: 20px;
    }

    .filter-actions {
      display: flex;
      gap: 12px;
      margin-top: 30px;
    }
  }
}
</style>
