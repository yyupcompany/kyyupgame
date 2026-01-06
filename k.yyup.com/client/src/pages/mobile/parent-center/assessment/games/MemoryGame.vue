<template>
  <div class="mobile-memory-game">
    <!-- 游戏说明 -->
    <div class="game-instructions">
      <div class="instruction-card">
        <van-icon name="eye-o" size="24" color="#409EFF" />
        <h3 class="instruction-title">记忆卡片游戏</h3>
        <p v-if="gamePhase === 'memorize'" class="instruction-desc">请记住卡片的位置，稍后需要找出相同的卡片</p>
        <p v-else-if="gamePhase === 'recall'" class="instruction-desc">请找出相同的卡片对</p>
        <p v-else-if="gamePhase === 'complete'" class="instruction-desc">恭喜完成！</p>
        <van-tag type="primary" size="small">点击卡片进行翻牌</van-tag>
      </div>
    </div>

    <!-- 游戏进度 -->
    <div class="game-progress">
      <van-progress
        v-if="gamePhase === 'memorize'"
        :percentage="memoryProgressPercentage"
        stroke-width="6"
        color="#FFA500"
        track-color="#F0F2F5"
      />
      <div class="progress-text">
        <span v-if="gamePhase === 'memorize'">记忆时间：{{ countdown }}秒</span>
        <span v-else-if="gamePhase === 'recall'">已匹配 {{ matchedPairs }}/{{ totalPairs }} 对</span>
        <span v-else>游戏完成</span>
      </div>
    </div>

    <!-- 记忆阶段 -->
    <div v-if="gamePhase === 'memorize'" class="memorize-phase">
      <div class="countdown-display">
        <div class="countdown-number">{{ countdown }}</div>
        <div class="countdown-label">记住这些卡片！</div>
      </div>

      <div class="cards-grid memorize">
        <div
          v-for="(card, index) in cards"
          :key="index"
          class="card memorize-card"
        >
          <div class="card-content">
            <span class="card-value">{{ getCardDisplay(card.value) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 回忆阶段 -->
    <div v-if="gamePhase === 'recall'" class="recall-phase">
      <div class="cards-grid">
        <div
          v-for="(card, index) in cards"
          :key="index"
          class="card"
          :class="{
            flipped: card.flipped,
            matched: card.matched,
            'shake-error': card.shakeError
          }"
          @click="flipCard(index)"
        >
          <div class="card-front">
            <van-icon name="question" size="24" />
          </div>
          <div class="card-back">
            <span class="card-value">{{ getCardDisplay(card.value) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 完成阶段 -->
    <div v-if="gamePhase === 'complete'" class="complete-phase">
      <div class="success-message">
        <van-icon name="success" size="48" color="#67C23A" />
        <h3>恭喜完成！</h3>
        <p>您成功匹配了所有卡片对</p>
        <div class="final-stats">
          <div class="stat-item">
            <span class="stat-label">尝试次数</span>
            <span class="stat-value">{{ attempts }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">准确率</span>
            <span class="stat-value">{{ accuracyPercent }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏统计 -->
    <div v-if="gamePhase === 'recall'" class="game-stats">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ attempts }}</div>
          <div class="stat-label">尝试次数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ matchedPairs }}/{{ totalPairs }}</div>
          <div class="stat-label">匹配数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ accuracyPercent }}%</div>
          <div class="stat-label">准确率</div>
        </div>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="game-controls">
      <van-button
        v-if="gamePhase === 'recall'"
        plain
        type="default"
        size="large"
        block
        @click="resetGame"
      >
        重新开始
      </van-button>
      <van-button
        v-if="gamePhase === 'recall'"
        type="primary"
        size="large"
        block
        :disabled="matchedPairs < totalPairs"
        @click="submitAnswer"
      >
        提交答案 ({{ matchedPairs }}/{{ totalPairs }})
      </van-button>
      <van-button
        v-if="gamePhase === 'complete'"
        type="success"
        size="large"
        block
        @click="submitAnswer"
      >
        完成游戏
      </van-button>
    </div>

    <!-- 匹配成功提示 -->
    <van-popup
      v-model:show="showMatchSuccess"
      position="center"
      round
      :closeable="false"
      duration="1000"
    >
      <div class="match-success-popup">
        <van-icon name="success" size="32" color="#67C23A" />
        <span>匹配成功！</span>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { showToast, showSuccessToast } from 'vant'

const props = defineProps<{
  config?: any
}>()

const emit = defineEmits<{
  answer: [value: any]
}>()

const cardCount = ref(props.config?.cardCount || 8)
const showTime = ref(props.config?.showTime || 5000)
const initialShowTime = ref(showTime.value)
const gamePhase = ref<'memorize' | 'recall' | 'complete'>('memorize')
const countdown = ref(0)
const cards = ref<any[]>([])
const flippedCards = ref<number[]>([])
const attempts = ref(0)
const matchedPairs = ref(0)
const showMatchSuccess = ref(false)

const totalPairs = computed(() => cardCount.value / 2)
const memoryProgressPercentage = computed(() => {
  return Math.round((countdown.value / Math.floor(initialShowTime.value / 1000)) * 100)
})

const accuracyPercent = computed(() => {
  if (attempts.value === 0) return 100 // 还没有尝试时准确率为100%
  return Math.round((matchedPairs.value / attempts.value) * 100)
})

// 获取卡片显示内容
const getCardDisplay = (value: number) => {
  const displays = ['🍎', '🍌', '🍇', '🍓', '🍊', '🥝', '🍑', '🍒', '🍉', '🥭']
  return displays[value % displays.length] || value.toString()
}

// 初始化卡片
const initCards = () => {
  const values = Array.from({ length: totalPairs.value }, (_, i) => i + 1)
  const allCards = [...values, ...values]

  // 打乱顺序
  for (let i = allCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[allCards[i], allCards[j]] = [allCards[j], allCards[i]]
  }

  cards.value = allCards.map(value => ({
    value,
    flipped: false,
    matched: false,
    shakeError: false
  }))
}

// 开始记忆阶段
const startMemorizePhase = () => {
  gamePhase.value = 'memorize'
  countdown.value = Math.floor(showTime.value / 1000)

  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      gamePhase.value = 'recall'
      showToast({
        type: 'info',
        message: '记忆时间结束，请找出相同的卡片',
        position: 'top',
        duration: 2000
      })
    }
  }, 1000)
}

// 翻牌
const flipCard = (index: number) => {
  if (gamePhase.value !== 'recall') return

  const card = cards.value[index]
  if (card.flipped || card.matched) return
  if (flippedCards.value.length >= 2) return

  card.flipped = true
  flippedCards.value.push(index)

  // 移动端震动反馈（如果支持）
  if (navigator.vibrate) {
    navigator.vibrate(50)
  }

  if (flippedCards.value.length === 2) {
    attempts.value++
    setTimeout(() => {
      checkMatch()
    }, 800)
  }
}

// 检查匹配
const checkMatch = () => {
  const [index1, index2] = flippedCards.value
  const card1 = cards.value[index1]
  const card2 = cards.value[index2]

  if (card1.value === card2.value) {
    // 匹配成功
    card1.matched = true
    card2.matched = true
    matchedPairs.value++

    showMatchSuccess.value = true
    showToast({
      type: 'success',
      message: '匹配成功！',
      position: 'top'
    })

    // 检查是否全部匹配完成
    if (matchedPairs.value === totalPairs.value) {
      setTimeout(() => {
        gamePhase.value = 'complete'
        showSuccessToast('恭喜！您完成了所有匹配！')
      }, 800)
    }
  } else {
    // 匹配失败
    card1.shakeError = true
    card2.shakeError = true

    showToast({
      type: 'fail',
      message: '不匹配，请再试试',
      position: 'top'
    })

    setTimeout(() => {
      card1.flipped = false
      card2.flipped = false
      card1.shakeError = false
      card2.shakeError = false
    }, 800)
  }

  flippedCards.value = []
}

// 重置游戏
const resetGame = () => {
  initCards()
  flippedCards.value = []
  attempts.value = 0
  matchedPairs.value = 0
  showMatchSuccess.value = false
  startMemorizePhase()
  showToast({
    type: 'info',
    message: '游戏已重置',
    position: 'top'
  })
}

// 提交答案
const submitAnswer = () => {
  const accuracy = attempts.value > 0 ? matchedPairs.value / attempts.value : 1
  emit('answer', {
    attempts: attempts.value,
    matchedPairs: matchedPairs.value,
    totalPairs: totalPairs.value,
    accuracy: accuracy,
    accuracyPercent: accuracyPercent.value,
    gamePhase: gamePhase.value
  })
}

// 监听配置变化
watch(() => props.config, (newConfig) => {
  if (newConfig) {
    if (newConfig.cardCount) {
      cardCount.value = newConfig.cardCount
    }
    if (newConfig.showTime) {
      showTime.value = newConfig.showTime
      initialShowTime.value = newConfig.showTime
    }
    resetGame()
  }
}, { deep: true })

onMounted(async () => {
  await nextTick()
  initCards()
  startMemorizePhase()
})
</script>

<style scoped lang="scss">
.mobile-memory-game {
  width: 100%;
  min-height: 100vh;
  background: #F7F8FA;
  padding: var(--spacing-md);
  padding-bottom: 100px;

  .game-instructions {
    margin-bottom: 20px;

    .instruction-card {
      background: white;
      border-radius: 12px;
      padding: var(--spacing-lg);
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      .instruction-title {
        margin: var(--spacing-md) 0 8px;
        font-size: var(--text-lg);
        font-weight: 600;
        color: #323233;
      }

      .instruction-desc {
        margin: 0 0 12px;
        font-size: var(--text-sm);
        color: #646566;
        line-height: 1.5;
      }
    }
  }

  .game-progress {
    margin-bottom: 20px;

    .progress-text {
      text-align: center;
      font-size: var(--text-sm);
      color: #646566;
      margin-top: 8px;
      font-weight: 500;
    }
  }

  .memorize-phase {
    margin-bottom: 20px;

    .countdown-display {
      text-align: center;
      margin-bottom: 24px;

      .countdown-number {
        font-size: var(--text-5xl);
        font-weight: bold;
        color: #FFA500;
        margin-bottom: 8px;
        animation: pulse 1s infinite;
      }

      .countdown-label {
        font-size: var(--text-base);
        color: #646566;
      }
    }

    .cards-grid.memorize {
      .memorize-card {
        cursor: default;
        animation: pulse 1.5s ease-in-out infinite;

        .card-content {
          background: linear-gradient(135deg, #FFA500 0%, #FF8C00 100%);
          color: white;
          font-size: var(--text-2xl);
        }
      }
    }
  }

  .recall-phase {
    margin-bottom: 20px;
  }

  .complete-phase {
    margin-bottom: 20px;

    .success-message {
      text-align: center;
      padding: var(--spacing-xl) 20px;

      h3 {
        margin: var(--spacing-md) 0 8px;
        color: #323233;
        font-size: var(--text-xl);
      }

      p {
        margin: 0 0 24px;
        color: #646566;
        font-size: var(--text-sm);
      }

      .final-stats {
        display: flex;
        justify-content: center;
        gap: var(--spacing-xl);

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;

          .stat-label {
            font-size: var(--text-xs);
            color: #969799;
            margin-bottom: 4px;
          }

          .stat-value {
            font-size: var(--text-xl);
            font-weight: 600;
            color: #409EFF;
          }
        }
      }
    }
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
    gap: var(--spacing-md);
    max-width: 400px;
    margin: 0 auto;

    .card {
      aspect-ratio: 1;
      position: relative;
      cursor: pointer;
      transform-style: preserve-3d;
      transition: transform 0.6s;

      &.flipped {
        transform: rotateY(180deg);
      }

      &.matched {
        opacity: 0.6;
        cursor: not-allowed;
        animation: matchSuccess 0.6s ease-in-out;
      }

      &.shake-error {
        animation: shake 0.5s ease-in-out;
      }

      .card-front,
      .card-back {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .card-front {
        background: linear-gradient(135deg, #409EFF 0%, #337ECC 100%);
        color: white;
      }

      .card-back {
        background: white;
        color: #323233;
        transform: rotateY(180deg);
        border: 2px solid #E4E7ED;

        .card-value {
          font-size: var(--text-3xl);
        }
      }

      &:active:not(.matched) {
        transform: scale(0.95);
      }
    }
  }

  .game-stats {
    margin-bottom: 20px;

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-md);

      .stat-item {
        background: white;
        border-radius: 8px;
        padding: var(--spacing-md);
        text-align: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

        .stat-value {
          font-size: var(--text-xl);
          font-weight: 600;
          color: #409EFF;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: var(--text-xs);
          color: #969799;
        }
      }
    }
  }

  .game-controls {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);

    .van-button {
      height: 48px;
      border-radius: 8px;
      font-size: var(--text-base);
      font-weight: 500;
    }
  }

  .match-success-popup {
    padding: var(--spacing-lg);
    text-align: center;
    min-width: 160px;

    span {
      margin-left: 8px;
      font-size: var(--text-base);
      font-weight: 600;
      color: #67C23A;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes matchSuccess {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

// 移动端优化
@media (max-width: var(--breakpoint-md)) {
  .mobile-memory-game {
    padding: var(--spacing-md);

    .cards-grid {
      grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
      gap: var(--spacing-sm);

      .card {
        .card-back .card-value {
          font-size: var(--text-2xl);
        }
      }
    }

    .memorize-phase .countdown-display .countdown-number {
      font-size: var(--text-4xl);
    }

    .complete-phase .success-message .final-stats {
      gap: var(--spacing-lg);
    }
  }
}

@media (max-width: var(--breakpoint-xs)) {
  .mobile-memory-game {
    .cards-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;

      .card {
        .card-back .card-value {
          font-size: var(--text-xl);
        }
      }
    }
  }
}
</style>