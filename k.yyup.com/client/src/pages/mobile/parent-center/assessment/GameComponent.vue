<template>
  <div class="mobile-game-component">
    <!-- 游戏头部信息 -->
    <div class="game-header">
      <van-nav-bar
        :title="gameTitle"
        left-arrow
        @click-left="exitGame"
        :fixed="true"
        :placeholder="true"
      >
        <template #right>
          <div class="game-score">
            <van-icon name="star" color="#FFD700" />
            <span>{{ score }}</span>
          </div>
        </template>
      </van-nav-bar>
    </div>

    <!-- 游戏说明 -->
    <div class="game-instructions" v-if="gamePhase !== 'complete'">
      <van-notice-bar
        :text="instructionText"
        background="#e6f7ff"
        color="#1890ff"
      />
    </div>

    <!-- 游戏状态栏 -->
    <div class="game-status">
      <van-grid :column-num="3" :gutter="10">
        <van-grid-item>
          <div class="status-item">
            <div class="status-value">{{ gameTime }}</div>
            <div class="status-label">时间</div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="status-item">
            <div class="status-value">{{ moves }}</div>
            <div class="status-label">步数</div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="status-item">
            <div class="status-value">{{ accuracy }}%</div>
            <div class="status-label">准确率</div>
          </div>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- 游戏区域 -->
    <div class="game-container">
      <!-- 记忆游戏 -->
      <MemoryGame
        v-if="gameType === 'memory'"
        :difficulty="difficulty"
        @game-complete="onGameComplete"
        @score-update="onScoreUpdate"
      />

      <!-- 逻辑游戏 -->
      <LogicGame
        v-else-if="gameType === 'logic'"
        :difficulty="difficulty"
        @game-complete="onGameComplete"
        @score-update="onScoreUpdate"
      />

      <!-- 注意力游戏 -->
      <AttentionGame
        v-else-if="gameType === 'attention'"
        :difficulty="difficulty"
        @game-complete="onGameComplete"
        @score-update="onScoreUpdate"
      />

      <!-- 游戏完成界面 -->
      <div v-if="gamePhase === 'complete'" class="game-complete">
        <div class="complete-animation">
          <van-icon name="success" size="60" color="#67c23a" />
        </div>

        <div class="complete-content">
          <h2 class="complete-title">游戏完成！</h2>
          <p class="complete-message">{{ completeMessage }}</p>

          <div class="complete-stats">
            <van-cell-group inset>
              <van-cell title="最终得分" :value="`${score}分`" />
              <van-cell title="用时" :value="finalTime" />
              <van-cell title="步数" :value="`${moves}步`" />
              <van-cell title="准确率" :value="`${accuracy}%`" />
              <van-cell title="评级" :value="rating" />
            </van-cell-group>
          </div>

          <div class="complete-actions">
            <van-button
              type="primary"
              size="large"
              @click="restartGame"
              block
            >
              <van-icon name="replay" />
              再玩一次
            </van-button>

            <van-button
              size="large"
              @click="nextGame"
              block
              style="margin-top: 12px;"
            >
              <van-icon name="arrow" />
              下一个游戏
            </van-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏控制按钮 -->
    <div class="game-controls" v-if="gamePhase !== 'complete'">
      <van-grid :column-num="3" :gutter="10">
        <van-grid-item>
          <van-button
            size="small"
            @click="pauseGame"
            :disabled="gamePaused"
          >
            <van-icon name="pause" />
            暂停
          </van-button>
        </van-grid-item>
        <van-grid-item>
          <van-button
            size="small"
            @click="restartGame"
            type="warning"
          >
            <van-icon name="replay" />
            重置
          </van-button>
        </van-grid-item>
        <van-grid-item>
          <van-button
            size="small"
            @click="showHint"
            :disabled="hintsUsed >= maxHints"
          >
            <van-icon name="question" />
            提示({{ maxHints - hintsUsed }})
          </van-button>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- 暂停弹窗 -->
    <van-popup v-model:show="showPaused" position="center" :style="{ width: '80%' }">
      <div class="paused-content">
        <h3>游戏已暂停</h3>
        <p>您想继续游戏还是重新开始？</p>
        <div class="paused-actions">
          <van-button type="primary" @click="resumeGame">继续游戏</van-button>
          <van-button @click="restartGame">重新开始</van-button>
          <van-button @click="exitGame">退出游戏</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 游戏设置弹窗 -->
    <van-popup v-model:show="showSettings" position="bottom" :style="{ height: '60%' }">
      <van-nav-bar
        title="游戏设置"
        left-arrow
        @click-left="showSettings = false"
      />
      <div class="settings-content">
        <van-cell-group>
          <van-field label="游戏类型" readonly :value="gameTypeName" />
          <van-field label="难度等级" readonly :value="difficultyName" />
          <van-cell title="音效" :value="soundEnabled ? '开启' : '关闭'">
            <template #right-icon>
              <van-switch v-model="soundEnabled" />
            </template>
          </van-cell>
          <van-cell title="震动反馈" :value="vibrationEnabled ? '开启' : '关闭'">
            <template #right-icon>
              <van-switch v-model="vibrationEnabled" />
            </template>
          </van-cell>
        </van-cell-group>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'vant'
import MemoryGame from './games/MemoryGame.vue'
import LogicGame from './games/LogicGame.vue'
import AttentionGame from './games/AttentionGame.vue'

interface GameConfig {
  type: 'memory' | 'logic' | 'attention'
  difficulty: 'easy' | 'medium' | 'hard'
  title: string
}

const router = useRouter()
const gameConfig = ref<GameConfig>({
  type: 'memory',
  difficulty: 'medium',
  title: '记忆卡片游戏'
})

const gamePhase = ref<'playing' | 'paused' | 'complete'>('playing')
const score = ref(0)
const gameTime = ref('00:00')
const moves = ref(0)
const accuracy = ref(100)
const hintsUsed = ref(0)
const maxHints = 3

const gamePaused = ref(false)
const showPaused = ref(false)
const showSettings = ref(false)
const soundEnabled = ref(true)
const vibrationEnabled = ref(true)

let gameTimer: number | null = null
let startTime: number = 0

const gameType = computed(() => gameConfig.value.type)
const difficulty = computed(() => gameConfig.value.difficulty)
const gameTitle = computed(() => gameConfig.value.title)

const gameTypeName = computed(() => {
  const names = {
    memory: '记忆游戏',
    logic: '逻辑游戏',
    attention: '注意力游戏'
  }
  return names[gameConfig.value.type]
})

const difficultyName = computed(() => {
  const names = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return names[gameConfig.value.difficulty]
})

const instructionText = computed(() => {
  if (gamePhase.value === 'complete') return ''

  const instructions = {
    memory: '记住卡片位置，找出相同的卡片对',
    logic: '根据规律找出正确的答案',
    attention: '快速找出目标图案'
  }

  return instructions[gameConfig.value.type]
})

const completeMessage = computed(() => {
  const performance = getPerformanceRating(score.value)
  return `表现出色！您的${performance.label}能力很棒。`
})

const finalTime = computed(() => gameTime.value)

const rating = computed(() => {
  return getPerformanceRating(score.value).label
})

const getPerformanceRating = (score: number) => {
  if (score >= 90) return { label: '优秀', color: '#67c23a' }
  if (score >= 80) return { label: '良好', color: '#409eff' }
  if (score >= 70) return { label: '中等', color: '#e6a23c' }
  return { label: '需要提高', color: '#f56c6c' }
}

const startGameTimer = () => {
  startTime = Date.now()
  gameTimer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000)
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0')
    const seconds = (elapsed % 60).toString().padStart(2, '0')
    gameTime.value = `${minutes}:${seconds}`
  }, 1000)
}

const stopGameTimer = () => {
  if (gameTimer) {
    clearInterval(gameTimer)
    gameTimer = null
  }
}

const pauseGame = () => {
  if (gamePhase.value === 'playing') {
    gamePhase.value = 'paused'
    showPaused.value = true
    stopGameTimer()
    playSound('pause')
  }
}

const resumeGame = () => {
  if (gamePhase.value === 'paused') {
    gamePhase.value = 'playing'
    showPaused.value = false
    startGameTimer()
    playSound('resume')
  }
}

const restartGame = () => {
  stopGameTimer()

  // 重置游戏状态
  score.value = 0
  gameTime.value = '00:00'
  moves.value = 0
  accuracy.value = 100
  hintsUsed.value = 0
  gamePhase.value = 'playing'
  showPaused.value = false

  // 重新开始游戏
  startGameTimer()
  playSound('start')

  Toast('游戏已重新开始')
}

const exitGame = () => {
  stopGameTimer()

  if (gamePhase.value === 'playing' || gamePhase.value === 'paused') {
    // 确认退出
    if (moves.value > 0) {
      if (confirm('确定要退出游戏吗？当前进度将不会保存。')) {
        router.back()
      }
    } else {
      router.back()
    }
  } else {
    router.back()
  }
}

const showHint = () => {
  if (hintsUsed.value < maxHints) {
    hintsUsed.value++
    Toast.success(`使用了第${hintsUsed.value}个提示`)
    playSound('hint')
  }
}

const nextGame = () => {
  // 根据当前游戏类型切换到下一个游戏
  const gameTypes: Array<'memory' | 'logic' | 'attention'> = ['memory', 'logic', 'attention']
  const currentIndex = gameTypes.indexOf(gameConfig.value.type)
  const nextIndex = (currentIndex + 1) % gameTypes.length
  const nextType = gameTypes[nextIndex]

  // 更新游戏配置
  gameConfig.value.type = nextType
  gameConfig.value.title = `${gameTypeName.value} - ${difficultyName.value}`

  // 重置游戏状态
  restartGame()
}

const onGameComplete = (result: any) => {
  gamePhase.value = 'complete'
  stopGameTimer()

  // 计算最终得分
  score.value = Math.max(60, Math.min(100, result.score))

  playSound('complete')

  // 震动反馈
  if (vibrationEnabled.value && 'vibrate' in navigator) {
    navigator.vibrate(200)
  }
}

const onScoreUpdate = (data: any) => {
  score.value = data.score || score.value
  moves.value = data.moves || moves.value
  accuracy.value = data.accuracy || accuracy.value
}

const playSound = (type: string) => {
  if (!soundEnabled.value) return

  // 这里可以添加实际的音效播放逻辑
  console.log('Playing sound:', type)
}

// 初始化游戏
onMounted(() => {
  // 从路由参数获取游戏配置
  const route = useRoute()
  if (route.query.type) {
    gameConfig.value.type = route.query.type as 'memory' | 'logic' | 'attention'
  }
  if (route.query.difficulty) {
    gameConfig.value.difficulty = route.query.difficulty as 'easy' | 'medium' | 'hard'
  }

  // 更新游戏标题
  gameConfig.value.title = `${gameTypeName.value} - ${difficultyName.value}`

  // 开始游戏计时
  startGameTimer()
})

// 清理定时器
onUnmounted(() => {
  stopGameTimer()
})

// 监听游戏暂停状态
watch(gamePaused, (newVal) => {
  if (newVal) {
    stopGameTimer()
  } else {
    startGameTimer()
  }
})
</script>

<style scoped lang="scss">
.mobile-game-component {
  min-height: 100vh;
  background: var(--van-background-color);
  padding-bottom: var(--van-padding-md);
}

.game-header {
  .van-nav-bar {
    background: var(--van-primary-color);
    color: white;

    :deep(.van-nav-bar__title) {
      color: white;
      font-weight: 600;
    }

    :deep(.van-icon) {
      color: white;
    }
  }

  .game-score {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: white;
    font-weight: 600;

    .van-icon {
      color: #FFD700;
    }
  }
}

.game-instructions {
  padding: var(--van-padding-md);
  background: var(--van-background-color);
}

.game-status {
  margin: var(--van-padding-md);

  .status-item {
    text-align: center;

    .status-value {
      font-size: var(--van-font-size-lg);
      font-weight: 600;
      color: var(--van-primary-color);
      margin-bottom: 4px;
    }

    .status-label {
      font-size: var(--van-font-size-sm);
      color: var(--van-text-color-2);
    }
  }
}

.game-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 0 var(--van-padding-md);
}

.game-complete {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--van-padding-xl);
  text-align: center;

  .complete-animation {
    margin-bottom: var(--van-padding-lg);
    animation: bounce 1s ease-in-out infinite alternate;
  }

  .complete-content {
    width: 100%;

    .complete-title {
      font-size: var(--van-font-size-xl);
      font-weight: 600;
      color: var(--van-text-color);
      margin: 0 0 var(--van-padding-sm) 0;
    }

    .complete-message {
      font-size: var(--van-font-size-md);
      color: var(--van-text-color-2);
      margin: 0 0 var(--van-padding-lg) 0;
      line-height: 1.5;
    }

    .complete-stats {
      margin-bottom: var(--van-padding-lg);
    }

    .complete-actions {
      display: flex;
      flex-direction: column;
      gap: var(--van-padding-sm);
    }
  }
}

.game-controls {
  margin: var(--van-padding-md);

  :deep(.van-grid-item) {
    .van-button {
      width: 100%;
    }
  }
}

.paused-content {
  padding: var(--van-padding-xl);
  text-align: center;

  h3 {
    font-size: var(--van-font-size-lg);
    font-weight: 600;
    margin: 0 0 var(--van-padding-sm) 0;
    color: var(--van-text-color);
  }

  p {
    font-size: var(--van-font-size-md);
    color: var(--van-text-color-2);
    margin: 0 0 var(--van-padding-lg) 0;
    line-height: 1.5;
  }

  .paused-actions {
    display: flex;
    flex-direction: column;
    gap: var(--van-padding-sm);
  }
}

.settings-content {
  padding: var(--van-padding-lg);
  max-height: 50vh;
  overflow-y: auto;
}

@keyframes bounce {
  from {
    transform: translateY(0px);
  }
  to {
    transform: translateY(-10px);
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .game-complete {
    .complete-stats {
      :deep(.van-cell-group) {
        background: var(--van-background-color-dark);
      }
    }
  }
}

// 响应式设计
@media (min-width: 768px) {
  .game-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 var(--van-padding-lg);
  }

  .complete-content {
    max-width: 400px;
    margin: 0 auto;
  }
}
</style>