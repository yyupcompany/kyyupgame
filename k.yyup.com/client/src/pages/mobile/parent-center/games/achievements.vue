<template>
  <MobileMainLayout
    title="我的成就"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
    @back="handleBack"
  >
    <div class="mobile-game-achievements">
      <!-- 成就统计卡片 -->
      <div class="achievement-summary">
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item>
            <div class="summary-card">
              <div class="summary-icon total">
                <van-icon name="medal-o" size="24" />
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ totalAchievements }}</div>
                <div class="summary-label">总成就数</div>
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="summary-card">
              <div class="summary-icon unlocked">
                <van-icon name="passed" size="24" />
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ unlockedCount }}</div>
                <div class="summary-label">已解锁</div>
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="summary-card">
              <div class="summary-icon locked">
                <van-icon name="lock" size="24" />
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ lockedCount }}</div>
                <div class="summary-label">未解锁</div>
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="summary-card">
              <div class="summary-icon stars">
                <van-icon name="star" size="24" />
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ totalStars }}</div>
                <div class="summary-label">总星数</div>
              </div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 分类标签 -->
      <div class="category-tabs">
        <van-tabs v-model:active="activeCategory" @change="handleCategoryChange">
          <van-tab title="全部" name="all" />
          <van-tab title="专注力" name="attention" />
          <van-tab title="记忆力" name="memory" />
          <van-tab title="逻辑思维" name="logic" />
        </van-tabs>
      </div>

      <!-- 成就列表 -->
      <div class="achievements-list">
        <div v-if="loading" class="loading-container">
          <van-skeleton :row="4" animated />
          <van-skeleton :row="4" animated />
          <van-skeleton :row="4" animated />
        </div>

        <div v-else-if="filteredAchievements.length === 0" class="empty-container">
          <van-empty description="暂无成就数据" />
        </div>

        <div v-else class="achievements-grid">
          <div
            v-for="achievement in filteredAchievements"
            :key="achievement.id"
            class="achievement-card"
            :class="{ locked: !achievement.unlocked }"
            @click="showAchievementDetail(achievement)"
          >
            <!-- 成就图标 -->
            <div class="achievement-icon">
              <div class="icon-bg" :class="getIconClass(achievement)">
                <van-icon
                  :name="getAchievementIcon(achievement.icon)"
                  size="32"
                  :color="achievement.unlocked ? '#ffd21e' : '#c8c9cc'"
                />
              </div>
              <div v-if="!achievement.unlocked" class="lock-overlay">
                <van-icon name="lock" size="16" color="#c8c9cc" />
              </div>
            </div>

            <!-- 成就信息 -->
            <div class="achievement-info">
              <h4 class="achievement-name">{{ achievement.name }}</h4>
              <p class="achievement-desc">{{ achievement.description }}</p>

              <!-- 进度条 -->
              <div class="achievement-progress">
                <van-progress
                  :percentage="achievement.progress"
                  :color="achievement.unlocked ? '#07c160' : '#1989fa'"
                  :pivot-text="`${achievement.progress}%`"
                  stroke-width="6"
                />
                <div class="progress-text">
                  {{ achievement.current }}/{{ achievement.target }}
                </div>
              </div>

              <!-- 解锁状态 -->
              <div v-if="achievement.unlocked" class="unlock-info">
                <van-tag type="success" size="small">已解锁</van-tag>
                <span class="unlock-time">{{ achievement.unlockTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 成就详情弹窗 -->
      <van-popup
        v-model:show="showDetailPopup"
        position="bottom"
        :style="{ height: '60%' }"
        round
      >
        <div v-if="selectedAchievement" class="achievement-detail">
          <div class="detail-header">
            <h3>成就详情</h3>
            <van-icon name="cross" @click="showDetailPopup = false" />
          </div>

          <div class="detail-content">
            <div class="detail-icon">
              <div class="icon-bg large" :class="getIconClass(selectedAchievement)">
                <van-icon
                  :name="getAchievementIcon(selectedAchievement.icon)"
                  size="48"
                  :color="selectedAchievement.unlocked ? '#ffd21e' : '#c8c9cc'"
                />
              </div>
            </div>

            <div class="detail-info">
              <h4 class="detail-name">{{ selectedAchievement.name }}</h4>
              <p class="detail-desc">{{ selectedAchievement.description }}</p>

              <div class="detail-category">
                <van-tag :type="getCategoryType(selectedAchievement.category)">
                  {{ getCategoryName(selectedAchievement.category) }}
                </van-tag>
              </div>

              <div class="detail-progress">
                <div class="progress-header">
                  <span>完成进度</span>
                  <span class="progress-ratio">{{ selectedAchievement.current }}/{{ selectedAchievement.target }}</span>
                </div>
                <van-progress
                  :percentage="selectedAchievement.progress"
                  :color="selectedAchievement.unlocked ? '#07c160' : '#1989fa'"
                  stroke-width="8"
                />
              </div>

              <div v-if="selectedAchievement.unlocked" class="unlock-status">
                <div class="unlock-badge">
                  <van-icon name="passed" color="#07c160" />
                  <span>已解锁</span>
                </div>
                <div class="unlock-time-info">
                  <span>解锁时间：{{ selectedAchievement.unlockTime }}</span>
                </div>
              </div>
              <div v-else class="lock-status">
                <div class="lock-badge">
                  <van-icon name="lock" color="#c8c9cc" />
                  <span>未解锁</span>
                </div>
                <div class="lock-tips">
                  还需要完成 {{ selectedAchievement.target - selectedAchievement.current }} 个任务
                </div>
              </div>
            </div>
          </div>
        </div>
      </van-popup>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { showToast } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'

interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  category: 'attention' | 'memory' | 'logic' | 'other'
  unlocked: boolean
  progress: number
  current: number
  target: number
  unlockTime: string
}

// 响应式数据
const totalAchievements = ref(12)
const unlockedCount = ref(3)
const totalStars = ref(45)

const activeCategory = ref('all')
const loading = ref(false)
const showDetailPopup = ref(false)
const selectedAchievement = ref<Achievement | null>(null)

// 成就列表
const achievements = ref<Achievement[]>([
  {
    id: 1,
    name: '初次尝试',
    description: '完成第一个游戏',
    icon: 'star',
    category: 'memory',
    unlocked: true,
    progress: 100,
    current: 1,
    target: 1,
    unlockTime: '2024-10-30 10:00'
  },
  {
    id: 2,
    name: '记忆大师',
    description: '连续完成10次记忆游戏',
    icon: 'medal',
    category: 'memory',
    unlocked: true,
    progress: 100,
    current: 10,
    target: 10,
    unlockTime: '2024-10-31 14:00'
  },
  {
    id: 3,
    name: '完美记忆',
    description: '获得3星通关',
    icon: 'star',
    category: 'memory',
    unlocked: true,
    progress: 100,
    current: 3,
    target: 3,
    unlockTime: '2024-10-31 15:00'
  },
  {
    id: 4,
    name: '专注新手',
    description: '完成5次专注力游戏',
    icon: 'star',
    category: 'attention',
    unlocked: false,
    progress: 40,
    current: 2,
    target: 5,
    unlockTime: ''
  },
  {
    id: 5,
    name: '逻辑探索者',
    description: '完成所有逻辑游戏',
    icon: 'medal',
    category: 'logic',
    unlocked: false,
    progress: 0,
    current: 0,
    target: 10,
    unlockTime: ''
  },
  {
    id: 6,
    name: '游戏达人',
    description: '完成50个游戏关卡',
    icon: 'diamond',
    category: 'other',
    unlocked: false,
    progress: 30,
    current: 15,
    target: 50,
    unlockTime: ''
  },
  {
    id: 7,
    name: '速度之王',
    description: '30秒内完成游戏',
    icon: 'fire',
    category: 'attention',
    unlocked: false,
    progress: 0,
    current: 0,
    target: 1,
    unlockTime: ''
  },
  {
    id: 8,
    name: '坚持不懈',
    description: '连续7天玩游戏',
    icon: 'calendar',
    category: 'other',
    unlocked: false,
    progress: 57,
    current: 4,
    target: 7,
    unlockTime: ''
  }
])

// 计算属性
const lockedCount = computed(() => totalAchievements.value - unlockedCount.value)

const filteredAchievements = computed(() => {
  if (activeCategory.value === 'all') {
    return achievements.value
  }
  return achievements.value.filter(a => a.category === activeCategory.value)
})

// 方法
const handleCategoryChange = () => {
  // 筛选逻辑已通过computed实现
}

const getAchievementIcon = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    'star': 'star',
    'medal': 'medal',
    'diamond': 'diamond-o',
    'fire': 'fire-o',
    'calendar': 'calendar-o',
    'trophy': 'gold-coin'
  }
  return iconMap[iconName] || 'star'
}

const getIconClass = (achievement: Achievement): string => {
  if (!achievement.unlocked) return 'locked'

  const colorMap: Record<string, string> = {
    'attention': 'attention',
    'memory': 'memory',
    'logic': 'logic',
    'other': 'other'
  }
  return colorMap[achievement.category] || 'other'
}

const getCategoryType = (category: string): string => {
  const typeMap: Record<string, string> = {
    'attention': 'primary',
    'memory': 'success',
    'logic': 'warning',
    'other': 'default'
  }
  return typeMap[category] || 'default'
}

const getCategoryName = (category: string): string => {
  const nameMap: Record<string, string> = {
    'attention': '专注力',
    'memory': '记忆力',
    'logic': '逻辑思维',
    'other': '综合'
  }
  return nameMap[category] || '其他'
}

const showAchievementDetail = (achievement: Achievement) => {
  selectedAchievement.value = achievement
  showDetailPopup.value = true
}

const loadData = async () => {
  loading.value = true

  try {
    // TODO: 从API加载成就数据
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新统计数据
    const unlocked = achievements.value.filter(a => a.unlocked).length
    unlockedCount.value = unlocked
    totalAchievements.value = achievements.value.length

    // 计算总星数
    const stars = achievements.value
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + Math.floor(a.target / 3), 0)
    totalStars.value = stars + 45 // 加上基础星数
  } catch (error) {
    console.error('加载成就数据失败:', error)
    showToast('加载成就数据失败')
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.mobile-game-achievements {
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));
  background: var(--van-background-color-light);
}

.achievement-summary {
  padding: var(--spacing-md);

  .summary-card {
    display: flex;
    align-items: center;
    padding: var(--spacing-lg);
    background: var(--card-bg);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    height: 100%;

    .summary-icon {
      width: 48px;
      height: 48px;
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;

      &.total {
        background: var(--primary-gradient);
        color: white;
      }

      &.unlocked {
        background: linear-gradient(135deg, #07c160 0%, #38d9a9 100%);
        color: white;
      }

      &.locked {
        background: linear-gradient(135deg, #c8c9cc 0%, #ebedf0 100%);
        color: var(--info-color);
      }

      &.stars {
        background: linear-gradient(135deg, #ffd21e 0%, #ff9800 100%);
        color: white;
      }
    }

    .summary-content {
      .summary-value {
        font-size: var(--text-2xl);
        font-weight: bold;
        color: var(--van-text-color);
        line-height: 1.2;
        margin-bottom: 4px;
      }

      .summary-label {
        font-size: var(--text-xs);
        color: var(--van-text-color-2);
      }
    }
  }
}

.category-tabs {
  background: var(--card-bg);
  margin-bottom: 8px;

  :deep(.van-tabs__wrap) {
    border-radius: 0;
  }
}

.achievements-list {
  padding: 0 16px 20px;
}

.loading-container {
  padding: var(--spacing-md);
}

.empty-container {
  padding: 60px 20px;
  text-align: center;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-md);

  @media (max-width: var(--breakpoint-md)) {
    grid-template-columns: 1fr;
  }
}

.achievement-card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: var(--spacing-lg);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  &:active {
    transform: scale(0.98);
  }

  &.locked {
    opacity: 0.6;
    filter: grayscale(50%);
  }

  .achievement-icon {
    position: relative;
    display: flex;
    justify-content: center;
    margin-bottom: 16px;

    .icon-bg {
      width: 64px;
      height: 64px;
      border-radius: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      &.attention {
        background: var(--primary-gradient);
      }

      &.memory {
        background: linear-gradient(135deg, #07c160 0%, #38d9a9 100%);
      }

      &.logic {
        background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
      }

      &.other {
        background: linear-gradient(135deg, #c8c9cc 0%, #ebedf0 100%);
      }

      &.locked {
        background: #f5f5f5;
      }

      &.large {
        width: 80px;
        height: 80px;
        border-radius: 40px;
      }
    }

    .lock-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.6);
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .achievement-info {
    .achievement-name {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--van-text-color);
      margin: 0 0 8px 0;
      text-align: center;
    }

    .achievement-desc {
      font-size: var(--text-sm);
      color: var(--van-text-color-2);
      margin: 0 0 16px 0;
      text-align: center;
      min-height: 40px;
    }

    .achievement-progress {
      margin-bottom: 16px;

      .progress-text {
        font-size: var(--text-xs);
        color: var(--van-text-color-2);
        text-align: center;
        margin-top: 8px;
      }
    }

    .unlock-info {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .unlock-time {
        font-size: var(--text-xs);
        color: var(--van-text-color-2);
      }
    }
  }
}

.achievement-detail {
  height: 100%;
  display: flex;
  flex-direction: column;

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--van-border-color);

    h3 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
    }

    .van-icon {
      font-size: var(--text-xl);
      color: var(--van-text-color-2);
      cursor: pointer;
    }
  }

  .detail-content {
    flex: 1;
    padding: var(--spacing-lg);
    overflow-y: auto;

    .detail-icon {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }

    .detail-info {
      .detail-name {
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--van-text-color);
        text-align: center;
        margin: 0 0 12px 0;
      }

      .detail-desc {
        font-size: var(--text-sm);
        color: var(--van-text-color-2);
        text-align: center;
        margin: 0 0 20px 0;
        line-height: 1.6;
      }

      .detail-category {
        display: flex;
        justify-content: center;
        margin-bottom: 20px;
      }

      .detail-progress {
        margin-bottom: 20px;

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .progress-ratio {
            font-weight: 600;
            color: var(--van-primary-color);
          }
        }
      }

      .unlock-status {
        .unlock-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          margin-bottom: 8px;

          span {
            font-weight: 600;
            color: #07c160;
          }
        }

        .unlock-time-info {
          text-align: center;
          font-size: var(--text-xs);
          color: var(--van-text-color-2);
        }
      }

      .lock-status {
        .lock-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          margin-bottom: 8px;

          span {
            font-weight: 600;
            color: #c8c9cc;
          }
        }

        .lock-tips {
          text-align: center;
          font-size: var(--text-xs);
          color: var(--van-text-color-2);
        }
      }
    }
  }
}

:deep(.van-grid-item__content) {
  padding: 0;
}

:deep(.van-progress__pivot) {
  background-color: var(--van-primary-color);
  color: white;
  border-radius: 10px;
  font-size: 10px;
  min-width: 30px;
}
</style>