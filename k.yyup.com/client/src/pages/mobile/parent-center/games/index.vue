<template>
  <MobileMainLayout
    title="游戏中心"
    :show-back="false"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <div class="mobile-games-center">
      <!-- 头部统计区域 -->
      <div class="header-stats">
        <van-cell-group inset>
          <van-cell center>
            <template #icon>
              <van-icon name="medal-o" size="20" color="#ff976a" />
            </template>
            <template #title>
              <span class="stat-number">{{ totalStars }}</span>
              <span class="stat-label">总星星数</span>
            </template>
          </van-cell>
          <van-cell center>
            <template #icon>
              <van-icon name="trophy-o" size="20" color="#07c160" />
            </template>
            <template #title>
              <span class="stat-number">{{ totalPlayCount }}</span>
              <span class="stat-label">游戏次数</span>
            </template>
          </van-cell>
          <van-cell center>
            <template #icon>
              <van-icon name="clock-o" size="20" color="#1989fa" />
            </template>
            <template #title>
              <span class="stat-number">{{ formatTime(totalPlayTime) }}</span>
              <span class="stat-label">游戏时长</span>
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <!-- 搜索和筛选 -->
      <div class="search-section">
        <van-search
          v-model="searchQuery"
          placeholder="搜索游戏名称"
          shape="round"
          background="transparent"
          @search="handleSearch"
          @clear="handleClearSearch"
        />

        <van-tabs v-model:active="activeCategory" sticky shrink @change="handleCategoryChange">
          <van-tab title="全部" name="all">
            <div class="game-list">
              <div
                v-for="game in filteredGames"
                :key="game.gameKey"
                class="game-item"
                @click="handlePlayGame(game.gameKey)"
              >
                <MobileGameCard :game="game" @play="handlePlayGame" />
              </div>
            </div>
          </van-tab>

          <van-tab title="专注力" name="attention">
            <div class="game-list">
              <div
                v-for="game in attentionGames"
                :key="game.gameKey"
                class="game-item"
                @click="handlePlayGame(game.gameKey)"
              >
                <MobileGameCard :game="game" @play="handlePlayGame" />
              </div>
            </div>
          </van-tab>

          <van-tab title="记忆力" name="memory">
            <div class="game-list">
              <div
                v-for="game in memoryGames"
                :key="game.gameKey"
                class="game-item"
                @click="handlePlayGame(game.gameKey)"
              >
                <MobileGameCard :game="game" @play="handlePlayGame" />
              </div>
            </div>
          </van-tab>

          <van-tab title="逻辑思维" name="logic">
            <div class="game-list">
              <div
                v-for="game in logicGames"
                :key="game.gameKey"
                class="game-item"
                @click="handlePlayGame(game.gameKey)"
              >
                <MobileGameCard :game="game" @play="handlePlayGame" />
              </div>
            </div>
          </van-tab>
        </van-tabs>
      </div>

      <!-- 加载状态 -->
      <van-loading v-if="loading" type="spinner" color="#1989fa" vertical>
        加载游戏列表...
      </van-loading>

      <!-- 空状态 -->
      <van-empty
        v-if="!loading && filteredGames.length === 0"
        image="search"
        description="暂无相关游戏"
      />
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'vant'
import { gamesApi } from '@/api/games'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import MobileGameCard from './components/MobileGameCard.vue'

const router = useRouter()
const games = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')
const activeCategory = ref('all')

// 统计数据
const totalStars = ref(0)
const totalPlayCount = ref(0)
const totalPlayTime = ref(0)

// 计算属性
const filteredGames = computed(() => {
  let filtered = games.value

  // 按分类筛选
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(g => g.gameType === activeCategory.value)
  }

  // 按搜索关键词筛选
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(g =>
      g.gameName.toLowerCase().includes(query) ||
      g.description.toLowerCase().includes(query)
    )
  }

  return filtered
})

const attentionGames = computed(() =>
  games.value.filter(g => g.gameType === 'attention')
)

const memoryGames = computed(() =>
  games.value.filter(g => g.gameType === 'memory')
)

const logicGames = computed(() =>
  games.value.filter(g => g.gameType === 'logic')
)

// 方法
const loadGames = async () => {
  try {
    loading.value = true
    const response = await gamesApi.getGameList()

    console.log('🔍 完整API响应:', response)
    console.log('🔍 response.data:', response.data)
    console.log('🔍 response.data?.success:', response.data?.success)
    console.log('🔍 response.data?.data:', response.data?.data)

    if (response.data?.success) {
      games.value = response.data.data
      console.log('✅ 设置games数组:', games.value)
      console.log('🎮 游戏数量:', games.value.length)

      // 计算统计数据
      calculateStatistics()
    } else {
      console.warn('⚠️ API响应success不为true')
      console.log('⚠️ 尝试直接使用response.data')
      if (Array.isArray(response.data)) {
        games.value = response.data
        console.log('✅ 直接使用data数组:', games.value.length)
        calculateStatistics()
      }
    }
  } catch (error: any) {
    console.error('❌ 加载游戏失败:', error)
    Toast.fail('加载游戏列表失败')
  } finally {
    loading.value = false
  }
}

const calculateStatistics = () => {
  let stars = 0
  let playCount = 0
  let playTime = 0

  games.value.forEach(game => {
    if (game.userProgress) {
      stars += game.userProgress.totalStars || 0
      playCount += game.userProgress.playCount || 0
      playTime += game.userProgress.totalPlayTime || 0
    }
  })

  totalStars.value = stars
  totalPlayCount.value = playCount
  totalPlayTime.value = playTime
}

const formatTime = (seconds: number): string => {
  if (!seconds) return '0分钟'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}

const handlePlayGame = (gameKey: string) => {
  router.push(`/mobile/parent-center/games/play/${gameKey}`)
}

const handleSearch = (query: string) => {
  searchQuery.value = query
}

const handleClearSearch = () => {
  searchQuery.value = ''
}

const handleCategoryChange = (name: string) => {
  activeCategory.value = name
}

onMounted(() => {
  loadGames()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.mobile-games-center {
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));
  background: var(--app-bg-color);
  padding-bottom: var(--van-tabbar-height);

  .header-stats {
    padding: var(--spacing-md) 16px 8px 16px;

    ::v-deep(.van-cell-group) {
      .van-cell {
        background: var(--primary-gradient);
        color: white;
        border-radius: 8px;
        margin-bottom: 8px;

        &:not(:last-child) {
          margin-bottom: 8px;
        }

        .van-cell__title {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);

          .stat-number {
            font-size: var(--text-lg);
            font-weight: 600;
          }

          .stat-label {
            font-size: var(--text-sm);
            opacity: 0.9;
          }
        }
      }
    }
  }

  .search-section {
    padding: var(--spacing-sm) 16px;

    ::v-deep(.van-tabs) {
      .van-tabs__nav {
        background: var(--card-bg);
        border-radius: 8px;
        padding: var(--spacing-xs);
        margin-bottom: 16px;
      }

      .van-tab {
        color: #666;

        &--active {
          color: #1989fa;
          font-weight: 600;
        }
      }

      .van-tabs__line {
        background: #1989fa;
        height: 2px;
        border-radius: 1px;
      }
    }

    .game-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);

      .game-item {
        cursor: pointer;
        transition: transform 0.2s ease;

        &:active {
          transform: scale(0.98);
        }
      }
    }
  }

  ::v-deep(.van-loading) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #1989fa;
  }

  ::v-deep(.van-empty) {
    padding: 60px 20px;
  }
}

// 游戏卡片渐变背景
.header-stats {
  ::v-deep(.van-cell:nth-child(1)) {
    background: linear-gradient(135deg, #ff976a 0%, #ff6b6b 100%);
  }

  ::v-deep(.van-cell:nth-child(2)) {
    background: linear-gradient(135deg, #07c160 0%, #06ae56 100%);
  }

  ::v-deep(.van-cell:nth-child(3)) {
    background: linear-gradient(135deg, #1989fa 0%, #1c7dd6 100%);
  }
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-games-center {
    max-width: 768px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);

    .game-list {
      .game-item {
        max-width: 100%;
      }
    }
  }
}
</style>
