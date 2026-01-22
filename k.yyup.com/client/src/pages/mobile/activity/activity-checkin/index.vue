<template>
  <MobileCenterLayout title="活动签到" back-path="/mobile/activity/activity-index">
    <template #right>
      <van-icon name="scan" size="20" @click="showScanDialog" />
    </template>

    <div class="activity-checkin-mobile">
      <!-- 活动选择 -->
      <div class="activity-selector">
        <van-dropdown-menu>
          <van-dropdown-item v-model="selectedActivityId" :options="activityOptions" @change="handleActivityChange" />
        </van-dropdown-menu>
      </div>

      <!-- 签到统计 -->
      <div class="stats-section" v-if="selectedActivityId">
        <van-grid :column-num="4" :border="false">
          <van-grid-item>
            <div class="stat-content">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">总人数</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-content">
              <div class="stat-value success">{{ stats.checkedIn }}</div>
              <div class="stat-label">已签到</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-content">
              <div class="stat-value warning">{{ stats.notCheckedIn }}</div>
              <div class="stat-label">未签到</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-content">
              <div class="stat-value danger">{{ stats.late }}</div>
              <div class="stat-label">迟到</div>
            </div>
          </van-grid-item>
        </van-grid>

        <!-- 签到率进度条 -->
        <div class="checkin-rate">
          <span class="rate-label">签到率</span>
          <van-progress
            :percentage="stats.checkinRate"
            :stroke-width="8"
            color="linear-gradient(to right, #07c160, #1989fa)"
          />
        </div>
      </div>

      <!-- 搜索栏 -->
      <van-search
        v-model="searchKeyword"
        placeholder="搜索姓名或手机号"
        shape="round"
        @search="onSearch"
      />

      <!-- 签到状态筛选 -->
      <van-tabs v-model:active="statusTab" class="status-tabs">
        <van-tab title="全部" name="all" />
        <van-tab title="未签到" name="not_checked_in" />
        <van-tab title="已签到" name="checked_in" />
        <van-tab title="迟到" name="late" />
      </van-tabs>

      <!-- 参与者列表 -->
      <div class="participant-list">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="loadParticipants"
          >
            <van-empty v-if="filteredParticipants.length === 0 && !loading" description="暂无参与者" />
            
            <van-cell-group inset>
              <van-swipe-cell
                v-for="item in filteredParticipants"
                :key="item.id"
              >
                <van-cell center>
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
                    <div class="participant-info">
                      <span class="name">{{ item.userName }}</span>
                      <van-tag
                        :type="getCheckinStatusType(item.checkinStatus)"
                        size="medium"
                      >
                        {{ getCheckinStatusLabel(item.checkinStatus) }}
                      </van-tag>
                    </div>
                  </template>
                  <template #label>
                    <div class="participant-detail">
                      <span>{{ item.phone }}</span>
                      <span v-if="item.checkinTime">签到: {{ formatDate(item.checkinTime) }}</span>
                    </div>
                  </template>
                </van-cell>
                <template #right>
                  <van-button
                    v-if="!item.checkinStatus || item.checkinStatus === 'not_checked_in'"
                    square
                    type="primary"
                    text="签到"
                    class="swipe-btn"
                    @click="handleCheckin(item)"
                  />
                  <van-button
                    v-else
                    square
                    type="danger"
                    text="取消"
                    class="swipe-btn"
                    @click="handleCancelCheckin(item)"
                  />
                </template>
              </van-swipe-cell>
            </van-cell-group>
          </van-list>
        </van-pull-refresh>
      </div>

      <!-- 底部快捷签到 -->
      <div class="quick-checkin-bar">
        <van-button type="primary" block round @click="showScanDialog">
          <van-icon name="scan" />
          扫码签到
        </van-button>
      </div>

      <!-- 扫码签到弹窗 -->
      <van-popup
        v-model:show="scanDialogVisible"
        position="bottom"
        round
        closeable
        :style="{ height: '50%' }"
      >
        <div class="scan-dialog">
          <h3 class="dialog-title">扫码签到</h3>
          <div class="scan-area">
            <van-icon name="scan" size="64" color="#1989fa" />
            <p>请使用扫码枪扫描参与者二维码</p>
          </div>
          <van-field
            v-model="scanCode"
            label="签到码"
            placeholder="或手动输入签到码"
            center
            clearable
            @keyup.enter="handleScanCheckin"
          >
            <template #button>
              <van-button size="small" type="primary" @click="handleScanCheckin">
                确认
              </van-button>
            </template>
          </van-field>
        </div>
      </van-popup>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import type { TagType } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

const route = useRoute()

// 数据
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const searchKeyword = ref('')
const statusTab = ref('all')
const selectedActivityId = ref<string>(route.query.id as string || '')
const scanDialogVisible = ref(false)
const scanCode = ref('')

// 活动选项
const activityOptions = ref([
  { text: '春季亲子运动会', value: '1' },
  { text: '科学实验体验课', value: '2' },
  { text: '校园开放日活动', value: '3' }
])

// 统计数据
const stats = ref({
  total: 0,
  checkedIn: 0,
  notCheckedIn: 0,
  late: 0,
  checkinRate: 0
})

// 参与者列表
const participants = ref<any[]>([])

// 过滤后的参与者
const filteredParticipants = computed(() => {
  let result = participants.value
  
  // 状态筛选
  if (statusTab.value !== 'all') {
    result = result.filter(p => p.checkinStatus === statusTab.value)
  }
  
  // 关键词搜索
  if (searchKeyword.value) {
    result = result.filter(p =>
      p.userName?.includes(searchKeyword.value) ||
      p.phone?.includes(searchKeyword.value)
    )
  }
  
  return result
})

// 方法
const handleActivityChange = () => {
  participants.value = []
  finished.value = false
  loadParticipants()
}

const loadParticipants = async () => {
  if (!selectedActivityId.value) {
    finished.value = true
    return
  }
  
  loading.value = true
  try {
    // 模拟数据
    setTimeout(() => {
      const mockData = [
        { id: '1', userName: '张三', phone: '138****1234', avatar: '', checkinStatus: 'checked_in', checkinTime: '2025-03-15 08:35:00' },
        { id: '2', userName: '李四', phone: '139****5678', avatar: '', checkinStatus: 'not_checked_in', checkinTime: null },
        { id: '3', userName: '王五', phone: '137****9012', avatar: '', checkinStatus: 'late', checkinTime: '2025-03-15 09:15:00' },
        { id: '4', userName: '赵六', phone: '136****3456', avatar: '', checkinStatus: 'checked_in', checkinTime: '2025-03-15 08:28:00' },
        { id: '5', userName: '钱七', phone: '135****7890', avatar: '', checkinStatus: 'not_checked_in', checkinTime: null },
        { id: '6', userName: '孙八', phone: '134****2345', avatar: '', checkinStatus: 'checked_in', checkinTime: '2025-03-15 08:42:00' }
      ]
      participants.value = mockData
      calculateStats()
      loading.value = false
      finished.value = true
    }, 500)
  } catch (error) {
    console.error('加载参与者失败:', error)
    loading.value = false
  }
}

const calculateStats = () => {
  const total = participants.value.length
  const checkedIn = participants.value.filter(p => p.checkinStatus === 'checked_in').length
  const late = participants.value.filter(p => p.checkinStatus === 'late').length
  
  stats.value = {
    total,
    checkedIn,
    notCheckedIn: total - checkedIn - late,
    late,
    checkinRate: total > 0 ? Math.round(((checkedIn + late) / total) * 100) : 0
  }
}

const onSearch = () => {
  // computed会自动处理
}

const onRefresh = async () => {
  participants.value = []
  finished.value = false
  await loadParticipants()
  refreshing.value = false
}

const handleCheckin = async (participant: any) => {
  try {
    // TODO: 调用API
    participant.checkinStatus = 'checked_in'
    participant.checkinTime = new Date().toISOString()
    calculateStats()
    showToast('签到成功')
  } catch (error) {
    showToast('签到失败')
  }
}

const handleCancelCheckin = async (participant: any) => {
  try {
    await showConfirmDialog({
      title: '确认',
      message: '确定取消签到吗？'
    })
    // TODO: 调用API
    participant.checkinStatus = 'not_checked_in'
    participant.checkinTime = null
    calculateStats()
    showToast('已取消签到')
  } catch {
    // 用户取消
  }
}

const showScanDialog = () => {
  scanCode.value = ''
  scanDialogVisible.value = true
}

const handleScanCheckin = async () => {
  if (!scanCode.value) {
    showToast('请输入签到码')
    return
  }
  
  try {
    // TODO: 调用API
    showToast('签到成功')
    scanDialogVisible.value = false
    loadParticipants()
  } catch {
    showToast('签到失败')
  }
}

const getCheckinStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    'not_checked_in': '未签到',
    'checked_in': '已签到',
    'late': '迟到'
  }
  return statusMap[status] || '未签到'
}

const getCheckinStatusType = (status: string): TagType => {
  const typeMap: Record<string, TagType> = {
    'not_checked_in': 'default',
    'checked_in': 'success',
    'late': 'warning'
  }
  return typeMap[status] || 'default'
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
  if (selectedActivityId.value) {
    loadParticipants()
  }
})
</script>

<style scoped lang="scss">
.activity-checkin-mobile {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 80px;

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

    .checkin-rate {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 12px;
      padding: 8px 12px;
      background: #f7f8fa;
      border-radius: 8px;

      .rate-label {
        font-size: 12px;
        color: #666;
        white-space: nowrap;
      }

      .van-progress {
        flex: 1;
      }
    }
  }

  .status-tabs {
    margin-bottom: 12px;
  }

  .participant-list {
    padding: 0 12px;

    .participant-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .name {
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }
    }

    .participant-detail {
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

  .quick-checkin-bar {
    position: fixed;
    bottom: 60px;
    left: 0;
    right: 0;
    padding: 12px 16px;
    background: #fff;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  }

  .scan-dialog {
    padding: 20px;

    .dialog-title {
      text-align: center;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
    }

    .scan-area {
      text-align: center;
      padding: 30px;
      background: #f7f8fa;
      border-radius: 12px;
      margin-bottom: 20px;

      p {
        margin: 12px 0 0 0;
        color: #666;
        font-size: 14px;
      }
    }
  }
}
</style>
