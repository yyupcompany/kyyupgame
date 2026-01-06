<template>
  <div class="memory-game">
    <div class="game-instructions">
      <h3>记忆卡片游戏</h3>
      <p v-if="gamePhase === 'memorize'">请记住卡片的位置，稍后需要找出相同的卡片</p>
      <p v-else-if="gamePhase === 'recall'">请找出相同的卡片对</p>
      <p v-else-if="gamePhase === 'complete'">恭喜完成！</p>
    </div>

    <!-- 记忆阶段 -->
    <div v-if="gamePhase === 'memorize'" class="memorize-phase">
      <div class="countdown">
        <div class="countdown-text">{{ countdown }}秒</div>
        <div class="countdown-bar">
          <div class="countdown-fill" :style="{ width: `${(countdown / initialShowTime) * 100}%` }"></div>
        </div>
      </div>
      <div class="cards-grid memorize">
        <div
          v-for="(card, index) in cards"
          :key="index"
          class="card memorize-card"
        >
          <div class="card-front">{{ card.value }}</div>
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
          :class="{ flipped: card.flipped, matched: card.matched }"
          @click="flipCard(index)"
        >
          <div class="card-front">?</div>
          <div class="card-back">{{ card.value }}</div>
        </div>
      </div>
    </div>

    <!-- 完成阶段 -->
    <div v-if="gamePhase === 'complete'" class="complete-phase">
      <div class="success-message">
        <el-icon class="success-icon"><CircleCheck /></el-icon>
        <h2>恭喜完成！</h2>
        <p>您成功匹配了所有卡片对</p>
      </div>
    </div>

    <div class="game-stats">
      <div class="stat-item">
        <span class="stat-label">尝试次数:</span>
        <span class="stat-value">{{ attempts }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">匹配数:</span>
        <span class="stat-value">{{ matchedPairs }}/{{ totalPairs }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">准确率:</span>
        <span class="stat-value">{{ accuracyPercent }}%</span>
      </div>
    </div>

    <div class="game-controls">
      <el-button v-if="gamePhase === 'recall'" @click="resetGame">重新开始</el-button>
      <el-button v-if="gamePhase === 'recall'" type="primary" @click="submitAnswer" :disabled="matchedPairs < totalPairs">
        提交答案
      </el-button>
      <el-button v-if="gamePhase === 'complete'" type="success" @click="submitAnswer">
        完成游戏
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { CircleCheck } from '@element-plus/icons-vue'

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

const totalPairs = computed(() => cardCount.value / 2)
const accuracyPercent = computed(() => {
  if (attempts.value === 0) return 0
  return Math.round((matchedPairs.value / attempts.value) * 100)
})

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
    matched: false
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
      ElMessage.info('记忆时间结束，请找出相同的卡片')
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

  if (flippedCards.value.length === 2) {
    attempts.value++
    setTimeout(() => {
      checkMatch()
    }, 1000)
  }
}

// 检查匹配
const checkMatch = () => {
  const [index1, index2] = flippedCards.value
  const card1 = cards.value[index1]
  const card2 = cards.value[index2]

  if (card1.value === card2.value) {
    card1.matched = true
    card2.matched = true
    matchedPairs.value++
    ElMessage.success('匹配成功！')
    
    // 检查是否全部匹配完成
    if (matchedPairs.value === totalPairs.value) {
      setTimeout(() => {
        gamePhase.value = 'complete'
        ElMessage.success('恭喜！您完成了所有匹配！')
      }, 500)
    }
  } else {
    card1.flipped = false
    card2.flipped = false
    ElMessage.warning('不匹配，请再试试')
  }

  flippedCards.value = []
}

// 重置游戏
const resetGame = () => {
  initCards()
  flippedCards.value = []
  attempts.value = 0
  matchedPairs.value = 0
  startMemorizePhase()
}

// 提交答案
const submitAnswer = () => {
  const accuracy = matchedPairs.value / totalPairs.value
  emit('answer', {
    attempts: attempts.value,
    matchedPairs: matchedPairs.value,
    totalPairs: totalPairs.value,
    accuracy: accuracy,
    accuracyPercent: accuracyPercent.value
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

onMounted(() => {
  initCards()
  startMemorizePhase()
})
</script>

<style scoped lang="scss">
.memory-game {
  width: 100%;
  padding: var(--text-2xl);

  .game-instructions {
    text-align: center;
    margin-bottom: var(--spacing-8xl);

    h3 {
      margin-bottom: var(--spacing-2xl);
      font-size: var(--text-3xl);
      color: var(--text-primary);
    }

    p {
      margin: var(--spacing-base) 0;
      color: var(--text-regular);
      font-size: var(--text-lg);
    }
  }

  .memorize-phase {
    margin-bottom: var(--spacing-8xl);

    .countdown {
      max-width: 600px;
      margin: 0 auto var(--text-2xl);

      .countdown-text {
        text-align: center;
        font-size: var(--spacing-3xl);
        font-weight: bold;
        color: var(--primary-color);
        margin-bottom: var(--spacing-2xl);
      }

      .countdown-bar {
        width: 100%;
        height: var(--spacing-sm);
        background: var(--border-color-light);
        border-radius: var(--spacing-xs);
        overflow: hidden;

        .countdown-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-color) 0%, var(--success-color) 100%);
          transition: width 1s linear;
        }
      }
    }

    .cards-grid.memorize {
      .memorize-card {
        cursor: default;
        animation: pulse 1s ease-in-out infinite;

        .card-front {
          background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
          color: white;
          font-size: var(--spacing-3xl);
        }
      }
    }
  }

  .recall-phase {
    margin-bottom: var(--spacing-8xl);
  }

  .complete-phase {
    margin-bottom: var(--spacing-8xl);
    text-align: center;

    .success-message {
      padding: var(--spacing-10xl);

      .success-icon {
        font-size: 80px;
        color: var(--success-color);
        margin-bottom: var(--text-2xl);
      }

      h2 {
        color: var(--text-primary);
        margin-bottom: var(--spacing-2xl);
      }

      p {
        color: var(--text-regular);
        font-size: var(--text-lg);
      }
    }
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: var(--spacing-4xl);
    max-width: 800px;
    margin: 0 auto;

    .card {
      aspect-ratio: 1;
      position: relative;
      cursor: pointer;
      transform-style: preserve-3d;
      transition: transform 0.5s;

      &.flipped {
        transform: rotateY(180deg);
      }

      &.matched {
        opacity: 0.6;
        cursor: not-allowed;
        animation: matchSuccess 0.5s ease-in-out;
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
        border-radius: var(--text-sm);
        font-size: 2var(--spacing-sm);
        font-weight: bold;
        box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
      }

      .card-front {
        background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
        color: white;
      }

      .card-back {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        transform: rotateY(180deg);
      }

      &:hover:not(.matched) {
        transform: scale(1.05);
      }
    }
  }

  .game-stats {
    display: flex;
    justify-content: center;
    gap: var(--spacing-8xl);
    margin-bottom: var(--spacing-8xl);
    padding: var(--text-2xl);
    background: var(--bg-hover);
    border-radius: var(--spacing-sm);
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-base);

      .stat-label {
        font-size: var(--text-base);
        color: var(--info-color);
      }

      .stat-value {
        font-size: var(--text-3xl);
        font-weight: bold;
        color: var(--primary-color);
      }
    }
  }

  .game-controls {
    display: flex;
    justify-content: center;
    gap: var(--spacing-4xl);
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
</style>

