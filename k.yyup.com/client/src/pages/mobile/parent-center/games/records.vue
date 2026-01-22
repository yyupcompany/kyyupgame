<template>
  <MobileSubPageLayout title="游戏记录" back-path="/mobile/parent-center">
    <div class="mobile-game-records">
      <!-- 统计卡片 -->
      <div class="stats-section">
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item>
            <div class="stat-card">
              <div class="stat-icon">
                <van-icon name="medal-o" size="24" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalGames }}</div>
                <div class="stat-label">总游戏次数</div>
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-card">
              <div class="stat-icon">
                <van-icon name="success" size="24" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ winRate }}%</div>
                <div class="stat-label">胜率</div>
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-card">
              <div class="stat-icon">
                <van-icon name="star" size="24" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ avgStars }}</div>
                <div class="stat-label">平均星数</div>
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-card">
              <div class="stat-icon">
                <van-icon name="clock-o" size="24" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalTime }}分钟</div>
                <div class="stat-label">总游戏时长</div>
              </div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-section">
        <van-tabs v-model:active="filterGame" @change="loadRecords">
          <van-tab title="全部游戏" name="" />
          <van-tab title="水果记忆" name="fruit-sequence" />
          <van-tab title="专注力游戏" name="attention" />
          <van-tab title="逻辑游戏" name="logic" />
        </van-tabs>
      </div>

      <!-- 游戏记录列表 -->
      <div class="records-section">
        <div v-if="loading" class="loading-container">
          <van-pull-refresh>
            <van-list>
              <van-skeleton
                v-for="n in 3"
                :key="n"
                :row="3"
                animated
                class="record-skeleton"
              />
            </van-list>
          </van-pull-refresh>
        </div>

        <div v-else-if="records.length === 0" class="empty-container">
          <van-empty description="暂无游戏记录" />
        </div>

        <div v-else class="records-list">
          <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
            <van-list
              v-model:loading="loading"
              :finished="finished"
              finished-text="没有更多了"
              @load="onLoad"
            >
              <div
                v-for="record in records"
                :key="record.id"
                class="record-item"
                @click="viewDetail(record.id)"
              >
                <!-- 游戏头部信息 -->
                <div class="record-header">
                  <div class="game-info">
                    <h4 class="game-name">{{ record.gameName }}</h4>
                    <van-tag type="primary" size="small">第{{ record.level }}关</van-tag>
                  </div>
                  <div class="game-time">{{ record.playTime }}</div>
                </div>

                <!-- 游戏统计数据 -->
                <div class="record-stats">
                  <div class="stats-row">
                    <div class="stat-item">
                      <span class="stat-label">得分</span>
                      <span class="stat-value score">{{ record.score }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">星级</span>
                      <van-rate
                        v-model="record.stars"
                        :size="16"
                        color="#ffd21e"
                        void-icon="star"
                        void-color="#eee"
                        readonly
                      />
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">结果</span>
                      <van-tag
                        :type="record.result === 'win' ? 'success' : 'danger'"
                        size="small"
                      >
                        {{ record.result === 'win' ? '胜利' : '失败' }}
                      </van-tag>
                    </div>
                  </div>
                  <div class="stats-row">
                    <div class="stat-item">
                      <span class="stat-label">时长</span>
                      <span class="stat-value">{{ formatDuration(record.duration) }}</span>
                    </div>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="record-actions">
                  <van-button
                    size="small"
                    type="primary"
                    plain
                    @click.stop="viewDetail(record.id)"
                  >
                    查看详情
                  </van-button>
                  <van-button
                    size="small"
                    type="success"
                    plain
                    @click.stop="playAgain(record.gameKey)"
                  >
                    再玩一次
                  </van-button>
                </div>
              </div>
            </van-list>
          </van-pull-refresh>
        </div>
      </div>

      <!-- 游戏详情弹窗 -->
      <van-popup
        v-model:show="showDetailPopup"
        position="bottom"
        :style="{ height: '70%' }"
        round
      >
        <div v-if="selectedRecord" class="detail-content">
          <div class="detail-header">
            <h3>游戏详情</h3>
            <van-icon name="cross" @click="showDetailPopup = false" />
          </div>
          <div class="detail-body">
            <div class="detail-item">
              <span class="detail-label">游戏名称</span>
              <span class="detail-value">{{ selectedRecord.gameName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">关卡</span>
              <span class="detail-value">第{{ selectedRecord.level }}关</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">得分</span>
              <span class="detail-value score">{{ selectedRecord.score }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">星级</span>
              <van-rate
                v-model="selectedRecord.stars"
                :size="18"
                color="#ffd21e"
                void-icon="star"
                void-color="#eee"
                readonly
              />
            </div>
            <div class="detail-item">
              <span class="detail-label">结果</span>
              <van-tag
                :type="selectedRecord.result === 'win' ? 'success' : 'danger'"
              >
                {{ selectedRecord.result === 'win' ? '胜利' : '失败' }}
              </van-tag>
            </div>
            <div class="detail-item">
              <span class="detail-label">游戏时长</span>
              <span class="detail-value">{{ formatDuration(selectedRecord.duration) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">游戏时间</span>
              <span class="detail-value">{{ selectedRecord.playTime }}</span>
            </div>
            <!-- 可以添加更多详细信息 -->
          </div>
        </div>
      </van-popup>
    </div>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'

interface GameRecord {
  id: number
  gameName: string
  gameKey: string
  level: number
  score: number
  stars: number
  result: 'win' | 'lose'
  duration: number
  playTime: string
}

// 组合式API
const router = useRouter()

// 响应式数据
const totalGames = ref(156)
const winRate = ref(78)
const avgStars = ref(2.4)
const totalTime = ref(480)

const filterGame = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const records = ref<GameRecord[]>([])
const selectedRecord = ref<GameRecord | null>(null)
const showDetailPopup = ref(false)

// 方法
const loadRecords = async () => {
  loading.value = true

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟数据
    const mockRecords: GameRecord[] = [
      {
        id: 1,
        gameName: '水果记忆大师',
        gameKey: 'fruit-sequence',
        level: 5,
        score: 850,
        stars: 3,
        result: 'win',
        duration: 180,
        playTime: '2024-10-31 15:30'
      },
      {
        id: 2,
        gameName: '水果记忆大师',
        gameKey: 'fruit-sequence',
        level: 4,
        score: 720,
        stars: 2,
        result: 'win',
        duration: 165,
        playTime: '2024-10-31 14:20'
      },
      {
        id: 3,
        gameName: '水果记忆大师',
        gameKey: 'fruit-sequence',
        level: 3,
        score: 450,
        stars: 1,
        result: 'lose',
        duration: 120,
        playTime: '2024-10-30 16:45'
      },
      {
        id: 4,
        gameName: '专注力挑战',
        gameKey: 'attention',
        level: 2,
        score: 620,
        stars: 3,
        result: 'win',
        duration: 150,
        playTime: '2024-10-30 10:20'
      },
      {
        id: 5,
        gameName: '逻辑思维训练',
        gameKey: 'logic',
        level: 1,
        score: 380,
        stars: 2,
        result: 'win',
        duration: 200,
        playTime: '2024-10-29 15:15'
      }
    ]

    // 根据筛选条件过滤数据
    const filteredRecords = filterGame.value
      ? mockRecords.filter(record => record.gameKey === filterGame.value)
      : mockRecords

    // 分页处理
    const startIndex = (currentPage.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    const pageRecords = filteredRecords.slice(startIndex, endIndex)

    if (refreshing.value) {
      records.value = pageRecords
    } else {
      records.value.push(...pageRecords)
    }

    total.value = filteredRecords.length
    finished.value = records.value.length >= filteredRecords.length

    // 更新统计数据
    updateStats(filteredRecords)
  } catch (error) {
    console.error('加载游戏记录失败:', error)
    showToast('加载游戏记录失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const updateStats = (gameRecords: GameRecord[]) => {
  if (gameRecords.length === 0) return

  totalGames.value = gameRecords.length
  const winCount = gameRecords.filter(record => record.result === 'win').length
  winRate.value = Math.round((winCount / gameRecords.length) * 100)

  const totalStars = gameRecords.reduce((sum, record) => sum + record.stars, 0)
  avgStars.value = (totalStars / gameRecords.length).toFixed(1)

  const totalDuration = gameRecords.reduce((sum, record) => sum + record.duration, 0)
  totalTime.value = Math.round(totalDuration / 60)
}

const onRefresh = () => {
  refreshing.value = true
  currentPage.value = 1
  records.value = []
  loadRecords()
}

const onLoad = () => {
  if (refreshing.value) return

  currentPage.value++
  loadRecords()
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}分${secs}秒`
}

const viewDetail = (id: number) => {
  const record = records.value.find(r => r.id === id)
  if (record) {
    selectedRecord.value = record
    showDetailPopup.value = true
  }
}

const playAgain = (gameKey: string) => {
  router.push(`/mobile/parent-center/games/play/${gameKey}`)
}

const handleBack = () => {
  router.back()
}

// 生命周期
onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  loadRecords()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.mobile-game-records {
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));
  background: var(--van-background-color-light);
}

.stats-section {
  padding: var(--spacing-md);

  .stat-card {
    display: flex;
    align-items: center;
    padding: var(--spacing-lg);
    background: var(--card-bg);
    border-radius: var(--spacing-md);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    height: 100%;

    .stat-icon {
      margin-right: var(--spacing-lg);
      color: var(--van-primary-color);
    }

    .stat-content {
      .stat-value {
        font-size: var(--text-2xl);
        font-weight: bold;
        color: var(--van-text-color);
        line-height: 1.2;
        margin-bottom: var(--spacing-xs);
      }

      .stat-label {
        font-size: var(--text-xs);
        color: var(--van-text-color-2);
      }
    }
  }
}

.filter-section {
  background: var(--card-bg);
  margin-bottom: var(--spacing-sm);

  :deep(.van-tabs__wrap) {
    border-radius: 0;
  }

  :deep(.van-tab) {
    font-size: var(--text-sm);
  }
}

.records-section {
  flex: 1;
}

.loading-container {
  padding: var(--spacing-md);
}

.record-skeleton {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--card-bg);
  border-radius: var(--spacing-sm);
}

.empty-container {
  padding: 60px 20px;
  text-align: center;
}

.records-list {
  padding: 0 16px 20px;
}

.record-item {
  background: var(--card-bg);
  border-radius: var(--spacing-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-md);

    .game-info {
      flex: 1;

      .game-name {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--van-text-color);
        margin: 0 0 6px 0;
      }
    }

    .game-time {
      font-size: var(--text-xs);
      color: var(--van-text-color-2);
    }
  }

  .record-stats {
    margin-bottom: var(--spacing-lg);

    .stats-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-sm);

      &:last-child {
        margin-bottom: 0;
      }

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;

        .stat-label {
          font-size: var(--text-xs);
          color: var(--van-text-color-2);
          margin-bottom: var(--spacing-xs);
        }

        .stat-value {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--van-text-color);

          &.score {
            color: var(--van-primary-color);
            font-size: var(--text-lg);
          }
        }
      }
    }
  }

  .record-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: flex-end;
    border-top: 1px solid var(--van-border-color);
    padding-top: var(--spacing-md);
  }
}

.detail-content {
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

  .detail-body {
    flex: 1;
    padding: var(--spacing-md);
    overflow-y: auto;

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md) 0;
      border-bottom: 1px solid var(--van-border-color-light);

      &:last-child {
        border-bottom: none;
      }

      .detail-label {
        font-size: var(--text-sm);
        color: var(--van-text-color-2);
        width: 100px;
        flex-shrink: 0;
      }

      .detail-value {
        font-size: var(--text-sm);
        color: var(--van-text-color);
        font-weight: 500;
        text-align: right;

        &.score {
          color: var(--van-primary-color);
          font-weight: bold;
        }
      }
    }
  }
}

:deep(.van-grid-item__content) {
  padding: 0;
}

:deep(.van-rate__item) {
  margin-right: var(--spacing-xs);
}

/* ==================== 暗色模式支持 ==================== */
@media (prefers-color-scheme: dark) {
  :root {
    /* 设计令牌会自动适配暗色模式 */
  }
}
</style>