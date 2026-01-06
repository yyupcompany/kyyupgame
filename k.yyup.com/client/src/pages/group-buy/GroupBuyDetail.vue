<template>
  <div class="group-buy-detail-page">
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading"><Loading /></el-icon>
      <p>加载中...</p>
    </div>

    <div v-else-if="groupBuy" class="content-container">
      <!-- 活动信息卡片 -->
      <el-card class="activity-card" shadow="hover">
        <div class="activity-header">
          <img 
            v-if="groupBuy.activity?.coverImage" 
            :src="groupBuy.activity.coverImage" 
            class="cover-image"
            alt="活动封面"
          />
          <div class="activity-info">
            <h1 class="activity-title">{{ groupBuy.activity?.title }}</h1>
            <div class="activity-meta">
              <el-tag type="info" size="small">
                <el-icon><Calendar /></el-icon>
                {{ formatDateTime(groupBuy.activity?.startTime) }}
              </el-tag>
              <el-tag type="info" size="small">
                <el-icon><Location /></el-icon>
                {{ groupBuy.activity?.location }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 拼团优惠信息 -->
      <el-card class="price-card" shadow="hover">
        <div class="price-content">
          <div class="price-info">
            <div class="original-price">
              <span class="label">原价</span>
              <span class="value">¥{{ groupBuy.originalPrice }}</span>
            </div>
            <div class="group-price">
              <span class="label">团购价</span>
              <span class="value">¥{{ groupBuy.groupPrice }}</span>
            </div>
          </div>
          <div class="savings">
            <el-tag type="danger" size="large" effect="dark">
              立省 ¥{{ groupBuy.discountAmount }} ({{ groupBuy.savingsPercent }}折)
            </el-tag>
          </div>
        </div>
      </el-card>

      <!-- 拼团进度 -->
      <el-card class="progress-card" shadow="hover">
        <h3 class="card-title">拼团进度</h3>
        <div class="progress-info">
          <el-progress 
            :percentage="groupBuy.progress" 
            :color="progressColor"
            :stroke-width="20"
          >
            <template #default="{ percentage }">
              <span class="progress-text">{{ percentage }}%</span>
            </template>
          </el-progress>
          <div class="progress-numbers">
            <span class="current">{{ groupBuy.currentPeople }}</span>
            <span class="separator">/</span>
            <span class="target">{{ groupBuy.targetPeople }}人</span>
          </div>
          <p v-if="groupBuy.currentPeople < groupBuy.targetPeople" class="remaining-tip">
            还差 <strong>{{ groupBuy.targetPeople - groupBuy.currentPeople }}</strong> 人即可成团
          </p>
          <el-tag v-else type="success" size="large">
            🎉 已成团！
          </el-tag>
        </div>
      </el-card>

      <!-- 倒计时 -->
      <el-card v-if="groupBuy.status === 'in_progress'" class="countdown-card" shadow="hover">
        <h3 class="card-title">剩余时间</h3>
        <div class="countdown">
          <div v-if="countdown.hours > 0 || countdown.days > 0" class="time-box">
            <span class="time-value">{{ countdown.days }}</span>
            <span class="time-label">天</span>
          </div>
          <div class="time-box">
            <span class="time-value">{{ countdown.hours }}</span>
            <span class="time-label">时</span>
          </div>
          <div class="time-box">
            <span class="time-value">{{ countdown.minutes }}</span>
            <span class="time-label">分</span>
          </div>
          <div class="time-box">
            <span class="time-value">{{ countdown.seconds }}</span>
            <span class="time-label">秒</span>
          </div>
        </div>
        <p v-if="countdown.total < 3600000" class="urgency-tip">
          ⏰ 即将结束，把握机会！
        </p>
      </el-card>

      <!-- 团员列表 -->
      <el-card class="members-card" shadow="hover">
        <h3 class="card-title">
          已参团成员 ({{ groupBuy.currentPeople }}/{{ groupBuy.targetPeople }})
        </h3>
        <div class="members-list">
          <div 
            v-for="(member, index) in groupBuy.members" 
            :key="index"
            class="member-item"
          >
            <el-avatar :size="50">
              {{ member.name.charAt(0) }}
            </el-avatar>
            <div class="member-info">
              <div class="member-name">
                {{ member.name }}
                <el-tag v-if="member.isLeader" type="warning" size="small">团长</el-tag>
              </div>
              <div class="member-time">
                {{ formatDateTime(member.joinTime) }}
              </div>
            </div>
          </div>
          
          <!-- 空位占位符 -->
          <div 
            v-for="i in (groupBuy.targetPeople - groupBuy.currentPeople)" 
            :key="`empty-${i}`"
            class="member-item empty-slot"
            @click="handleShare"
          >
            <el-avatar :size="50" class="empty-avatar">
              <el-icon><Plus /></el-icon>
            </el-avatar>
            <div class="member-info">
              <div class="member-name">邀请好友</div>
              <div class="member-time">点击分享</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button 
          v-if="groupBuy.canJoin && !isLoggedIn"
          type="primary" 
          size="large"
          @click="handleJoin"
        >
          我要参团
        </el-button>
        <el-button 
          v-if="groupBuy.canJoin && isLoggedIn"
          type="primary" 
          size="large"
          @click="handleJoinDirect"
        >
          立即参团
        </el-button>
        <el-button 
          type="success" 
          size="large"
          @click="handleShare"
        >
          <el-icon><Share /></el-icon>
          分享给好友
        </el-button>
      </div>
    </div>

    <el-empty v-else description="团购不存在或已过期" />

    <!-- 快速注册弹窗 -->
    <QuickRegisterModal
      v-model="showRegisterModal"
      :group-buy-id="groupBuyId"
      @success="handleRegisterSuccess"
    />

    <!-- 分享弹窗 -->
    <ShareModal
      v-model="showShareModal"
      :group-buy-id="groupBuyId"
      :group-buy="groupBuy"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Calendar, Location, Loading, Plus, Share } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import QuickRegisterModal from '@/components/group-buy/QuickRegisterModal.vue'
import ShareModal from '@/components/group-buy/ShareModal.vue'
import { request } from '@/utils/request'

interface GroupBuy {
  id: number
  activity: {
    id: number
    title: string
    coverImage: string
    startTime: string
    endTime: string
    location: string
  }
  groupCode: string
  targetPeople: number
  currentPeople: number
  maxPeople: number
  groupPrice: number
  originalPrice: number
  deadline: string
  status: string
  remainingTime: number
  canJoin: boolean
  progress: number
  members: Array<{
    name: string
    joinTime: string
    isLeader: boolean
  }>
  discountAmount: number
  savingsPercent: number
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const groupBuyId = ref<number>(parseInt(route.params.id as string))
const groupBuy = ref<GroupBuy | null>(null)
const loading = ref(true)
const showRegisterModal = ref(false)
const showShareModal = ref(false)
const countdown = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  total: 0
})

let countdownTimer: number | null = null

const isLoggedIn = computed(() => userStore.isLoggedIn)

const progressColor = computed(() => {
  const progress = groupBuy.value?.progress || 0
  if (progress >= 100) return '#67c23a'
  if (progress >= 50) return '#409eff'
  return '#e6a23c'
})

// 加载团购详情
const loadGroupBuy = async () => {
  try {
    loading.value = true
    const response = await request.get(`/api/marketing/group-buy/${groupBuyId.value}/public`)
    
    if (response.success) {
      groupBuy.value = response.data
      startCountdown()
    } else {
      ElMessage.error(response.message || '获取团购详情失败')
    }
  } catch (error) {
    console.error('加载团购详情失败:', error)
    ElMessage.error('加载失败，请刷新重试')
  } finally {
    loading.value = false
  }
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 启动倒计时
const startCountdown = () => {
  if (!groupBuy.value) return
  
  const updateCountdown = () => {
    if (!groupBuy.value) return
    
    const remaining = groupBuy.value.remainingTime
    if (remaining <= 0) {
      countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
      if (countdownTimer) clearInterval(countdownTimer)
      return
    }
    
    countdown.value = {
      total: remaining,
      days: Math.floor(remaining / (1000 * 60 * 60 * 24)),
      hours: Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((remaining % (1000 * 60)) / 1000)
    }
    
    groupBuy.value.remainingTime -= 1000
  }
  
  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1000) as unknown as number
}

// 参团（未登录用户）
const handleJoin = () => {
  // 保存邀请信息
  const inviteCode = route.query.inviteCode as string
  const inviterId = route.query.from as string
  
  if (inviteCode) {
    sessionStorage.setItem('inviteCode', inviteCode)
  }
  if (inviterId) {
    sessionStorage.setItem('inviterId', inviterId)
  }
  
  showRegisterModal.value = true
}

// 参团（已登录用户）
const handleJoinDirect = async () => {
  try {
    const inviteCode = sessionStorage.getItem('inviteCode')
    const inviterId = sessionStorage.getItem('inviterId')
    
    const response = await request.post(`/api/marketing/group-buy/${groupBuyId.value}/join`, {
      inviteCode,
      inviterId: inviterId ? parseInt(inviterId) : undefined
    })
    
    if (response.success) {
      ElMessage.success('参团成功！')
      sessionStorage.removeItem('inviteCode')
      sessionStorage.removeItem('inviterId')
      await loadGroupBuy()
    } else {
      ElMessage.error(response.message || '参团失败')
    }
  } catch (error) {
    console.error('参团失败:', error)
    ElMessage.error('参团失败，请重试')
  }
}

// 注册成功回调
const handleRegisterSuccess = async () => {
  showRegisterModal.value = false
  ElMessage.success('注册成功，正在参团...')
  await handleJoinDirect()
}

// 分享
const handleShare = () => {
  showShareModal.value = true
}

onMounted(() => {
  loadGroupBuy()
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped lang="scss">
.group-buy-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: var(--spacing-lg);

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    color: white;
    
    .el-icon {
      font-size: var(--text-5xl);
      margin-bottom: 16px;
    }
  }

  .content-container {
    max-width: 800px;
    margin: 0 auto;
  }

  .activity-card,
  .price-card,
  .progress-card,
  .countdown-card,
  .members-card {
    margin-bottom: 20px;
    border-radius: 12px;
  }

  .activity-header {
    display: flex;
    gap: var(--spacing-lg);

    .cover-image {
      width: 200px;
      height: 150px;
      object-fit: cover;
      border-radius: 8px;
    }

    .activity-info {
      flex: 1;

      .activity-title {
        font-size: var(--text-2xl);
        margin: 0 0 12px 0;
        color: #303133;
      }

      .activity-meta {
        display: flex;
        gap: var(--spacing-md);
        flex-wrap: wrap;

        .el-tag {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }
      }
    }
  }

  .price-card {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;

    .price-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .price-info {
        display: flex;
        gap: 40px;

        .original-price,
        .group-price {
          display: flex;
          flex-direction: column;

          .label {
            font-size: var(--text-sm);
            opacity: 0.9;
            margin-bottom: 4px;
          }

          .value {
            font-size: var(--text-3xl);
            font-weight: bold;
          }
        }

        .original-price .value {
          text-decoration: line-through;
          opacity: 0.7;
        }
      }
    }
  }

  .card-title {
    font-size: var(--text-lg);
    font-weight: bold;
    margin: 0 0 16px 0;
    color: #303133;
  }

  .progress-info {
    text-align: center;

    .progress-numbers {
      margin-top: 16px;
      font-size: var(--text-2xl);
      font-weight: bold;

      .current {
        color: #409eff;
      }

      .separator {
        margin: 0 8px;
        color: #909399;
      }

      .target {
        color: #606266;
      }
    }

    .remaining-tip {
      margin-top: 12px;
      color: #e6a23c;
      font-size: var(--text-base);

      strong {
        color: #f56c6c;
        font-size: var(--text-xl);
      }
    }
  }

  .countdown {
    display: flex;
    justify-content: center;
    gap: var(--spacing-md);

    .time-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: var(--spacing-md) 20px;
      border-radius: 8px;
      min-width: 80px;

      .time-value {
        font-size: var(--text-4xl);
        font-weight: bold;
        line-height: 1;
      }

      .time-label {
        font-size: var(--text-sm);
        margin-top: 8px;
        opacity: 0.9;
      }
    }
  }

  .urgency-tip {
    margin-top: 16px;
    color: #f56c6c;
    font-size: var(--text-base);
    font-weight: bold;
    text-align: center;
  }

  .members-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--spacing-md);

    .member-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      border-radius: 8px;
      background: #f5f7fa;
      transition: all 0.3s;

      &:hover {
        background: #e4e7ed;
        transform: translateY(-2px);
      }

      &.empty-slot {
        border: 2px dashed #dcdfe6;
        background: transparent;
        cursor: pointer;

        &:hover {
          border-color: #409eff;
          background: #ecf5ff;
        }

        .empty-avatar {
          background: #dcdfe6;
          color: #909399;
        }

        .member-name {
          color: #909399;
        }
      }

      .member-info {
        flex: 1;

        .member-name {
          font-weight: 500;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .member-time {
          font-size: var(--text-xs);
          color: #909399;
        }
      }
    }
  }

  .action-buttons {
    position: sticky;
    bottom: 20px;
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: white;
    border-radius: 12px;
    box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);

    .el-button {
      flex: 1;
      height: 50px;
      font-size: var(--text-base);
      font-weight: bold;
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .group-buy-detail-page {
    padding: var(--spacing-md);

    .activity-header {
      flex-direction: column;

      .cover-image {
        width: 100%;
        height: 200px;
      }
    }

    .price-content {
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .countdown .time-box {
      min-width: 60px;
      padding: var(--spacing-md) 16px;

      .time-value {
        font-size: var(--text-2xl);
      }
    }

    .members-list {
      grid-template-columns: 1fr;
    }
  }
}
</style>
