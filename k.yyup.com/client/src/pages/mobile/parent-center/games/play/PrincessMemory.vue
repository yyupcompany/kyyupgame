<template>
  <div class="mobile-princess-memory-game">
    <!-- 游戏头部 -->
    <van-nav-bar
      title="公主记忆宝盒"
      left-text="返回"
      left-arrow
      @click-left="handleBack"
      class="game-navbar"
    >
      <template #right>
        <van-icon name="pause-circle-o" @click="togglePause" />
      </template>
    </van-nav-bar>

    <!-- 游戏状态 -->
    <van-cell-group inset class="game-status">
      <van-cell class="status-info">
        <template #default>
          <div class="status-grid">
            <div class="status-item">
              <van-icon name="medal-o" class="status-icon" />
              <span class="status-value">第{{ currentLevel }}关</span>
            </div>
            <div class="status-item">
              <van-icon name="eye-o" class="status-icon" />
              <span class="status-value">{{ moves }}次</span>
            </div>
            <div class="status-item">
              <van-icon name="gem-o" class="status-icon" />
              <span class="status-value">{{ matchedPairs }}/{{ totalPairs }}</span>
            </div>
          </div>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 游戏区域 -->
    <van-cell-group inset class="game-area">
      <van-cell class="game-content">
        <template #default>
          <div class="game-instructions">
            <div class="instruction-card">
              <van-icon name="diamond-o" size="24" color="#FF69B4" />
              <h3 class="instruction-title">公主记忆宝盒</h3>
              <p class="instruction-desc">翻开卡片，找到相同的一对！</p>
            </div>
          </div>

          <!-- 卡片网格 -->
          <div class="cards-container">
            <div class="cards-grid" :class="`grid-${gridSize}`">
              <div
                v-for="card in cards"
                :key="card.id"
                class="card-wrapper"
                @click="handleCardClick(card)"
              >
                <div class="card" :class="{
                  flipped: card.isFlipped || card.isMatched,
                  matched: card.isMatched,
                  'shake-error': card.isUnmatched
                }">
                  <div class="card-front">
                    <van-icon name="diamond" size="28" color="#FF69B4" />
                  </div>
                  <div class="card-back">
                    <span class="card-content">{{ getCardContent(card.type) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 进度条 -->
          <div class="progress-section">
            <van-progress
              :percentage="progressPercentage"
              stroke-width="8"
              color="#FF69B4"
              track-color="#F0F8FF"
            />
            <div class="progress-text">
              完成进度：{{ Math.round(progressPercentage) }}%
            </div>
          </div>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 控制按钮 -->
    <van-cell-group inset class="game-controls">
      <van-cell class="controls">
        <template #default>
          <div class="control-buttons">
            <van-button
              plain
              type="default"
              size="small"
              @click="showHelp = true"
            >
              帮助
            </van-button>
            <van-button
              type="primary"
              size="small"
              @click="restartLevel"
            >
              重新开始
            </van-button>
          </div>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 帮助弹窗 -->
    <van-popup v-model:show="showHelp" position="bottom" :style="{ height: '60%' }">
      <div class="help-content">
        <div class="help-header">
          <h3>🎮 游戏说明</h3>
          <van-icon name="cross" @click="showHelp = false" class="close-icon" />
        </div>

        <div class="help-body">
          <div class="help-section">
            <h4>💎 公主记忆宝盒</h4>
            <p>经典的记忆配对游戏，找到所有相同的卡片对</p>
          </div>

          <div class="help-section">
            <h4>📖 游戏规则</h4>
            <ul>
              <li>点击卡片翻开查看内容</li>
              <li>每次可以翻开两张卡片</li>
              <li>找到相同的一对即可消除</li>
              <li>翻开的卡片会在短时间内显示后翻回</li>
            </ul>
          </div>

          <div class="help-section">
            <h4>🎯 游戏目标</h4>
            <p>用最少的步数找到所有配对</p>
          </div>

          <div class="help-section">
            <h4>💡 游戏技巧</h4>
            <ul>
              <li>记住已翻开卡片的位置</li>
              <li>先集中寻找容易配对的卡片</li>
              <li>形成记忆策略</li>
            </ul>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 成功弹窗 -->
    <van-popup v-model:show="showSuccess" position="center" round>
      <div class="success-popup">
        <van-icon name="success" size="64" color="#07c160" />
        <h3>关卡完成！</h3>
        <p>用了 {{ moves }} 次翻牌</p>
        <div class="stars">
          <van-icon
            v-for="i in 3"
            :key="i"
            name="star"
            size="24"
            :color="i <= stars ? '#FFD700' : '#CCCCCC'"
          />
        </div>
        <van-button type="primary" @click="nextLevel" size="large" block>
          下一关
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'

const router = useRouter()

// 游戏状态
const currentLevel = ref(1)
const moves = ref(0)
const matchedPairs = ref(0)
const cards = ref<Array<{
  id: string
  type: string
  isFlipped: boolean
  isMatched: boolean
  isUnmatched: boolean
}>>([])

const gridSize = ref(4) // 4x4 网格
const isPaused = ref(false)
const showHelp = ref(false)
const showSuccess = ref(false)

// 卡片类型
const cardTypes = ref([
  { type: 'crown', emoji: '👑', name: '皇冠' },
  { type: 'wand', emoji: '🪄', name: '魔杖' },
  { type: 'castle', emoji: '🏰', name: '城堡' },
  { type: 'carriage', emoji: '🚗', name: '马车' },
  { type: 'shoe', emoji: '👠', name: '水晶鞋' },
  { type: 'rose', emoji: '🌹', name: '玫瑰' },
  { type: 'mirror', emoji: '🪞', name: '魔镜' },
  { type: 'ring', emoji: '💍', name: '戒指' }
])

// 计算属性
const totalPairs = computed(() => cards.value.length / 2)
const progressPercentage = computed(() => {
  if (totalPairs.value === 0) return 0
  return (matchedPairs.value / totalPairs.value) * 100
})

const stars = computed(() => {
  const perfectMoves = totalPairs.value * 2
  if (moves.value <= perfectMoves) return 3
  if (moves.value <= perfectMoves * 1.5) return 2
  return 1
})

// 获取卡片内容
const getCardContent = (type: string) => {
  const card = cardTypes.value.find(c => c.type === type)
  return card ? card.emoji : '💎'
}

// 初始化游戏
const initGame = () => {
  const pairCount = Math.min(4 + currentLevel.value, 8)
  const selectedTypes = cardTypes.value.slice(0, pairCount)

  // 创建卡片对
  const cardPairs = []
  for (let i = 0; i < selectedTypes.length; i++) {
    cardPairs.push(selectedTypes[i], selectedTypes[i])
  }

  // 打乱顺序
  for (let i = cardPairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]]
  }

  // 创建卡片对象
  cards.value = cardPairs.map((type, index) => ({
    id: `card-${index}`,
    type: type.type,
    isFlipped: false,
    isMatched: false,
    isUnmatched: false
  }))

  moves.value = 0
  matchedPairs.value = 0
}

// 处理卡片点击
const handleCardClick = (card: any) => {
  if (isPaused.value) return
  if (card.isFlipped || card.isMatched) return

  const flippedCards = cards.value.filter(c => c.isFlipped && !c.isMatched)

  if (flippedCards.length >= 2) return

  card.isFlipped = true

  if (flippedCards.length === 1) {
    moves.value++
    checkMatch(flippedCards[0], card)
  }
}

// 检查匹配
const checkMatch = (card1: any, card2: any) => {
  setTimeout(() => {
    if (card1.type === card2.type) {
      // 匹配成功
      card1.isMatched = true
      card2.isMatched = true
      matchedPairs.value++
      showSuccessToast('配对成功！')

      // 检查是否完成
      if (matchedPairs.value === totalPairs.value) {
        setTimeout(() => {
          showSuccess.value = true
        }, 500)
      }
    } else {
      // 匹配失败
      card1.isUnmatched = true
      card2.isUnmatched = true

      setTimeout(() => {
        card1.isFlipped = false
        card2.isFlipped = false
        card1.isUnmatched = false
        card2.isUnmatched = false
      }, 1000)
    }
  }, 800)
}

// 暂停/继续
const togglePause = () => {
  isPaused.value = !isPaused.value
  showToast(isPaused.value ? '游戏已暂停' : '游戏继续')
}

// 重新开始关卡
const restartLevel = () => {
  initGame()
  showSuccessToast('游戏已重置')
}

// 下一关
const nextLevel = () => {
  currentLevel.value++
  showSuccess.value = false

  // 增加难度
  if (currentLevel.value > 4 && gridSize.value < 6) {
    gridSize.value = 6
  }

  initGame()
  showSuccessToast(`进入第${currentLevel.value}关`)
}

// 返回
const handleBack = () => {
  router.push('/mobile/parent-center/games')
}

onMounted(() => {
  initGame()
})
</script>

<style scoped>
.mobile-princess-memory-game {
  min-height: 100vh;
  background: linear-gradient(135deg, #FFE4E1 0%, #FFC0CB 50%, #FFB6C1 100%);
  padding-bottom: var(--van-padding-md);
}

.game-navbar {
  background: linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%);
  color: white;
}

.game-container {
  padding: var(--van-padding-sm);
}

.game-status {
  margin-bottom: var(--van-padding-sm);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--van-padding-md);
  text-align: center;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--van-padding-xs);
}

.status-icon {
  color: #FF69B4;
  font-size: var(--text-xl);
}

.status-value {
  font-size: var(--text-sm);
  font-weight: 600;
  color: #333;
}

.game-area {
  margin-bottom: var(--van-padding-sm);
  min-height: 400px;
}

.game-instructions {
  margin-bottom: var(--van-padding-lg);
}

.instruction-card {
  background: white;
  border-radius: var(--van-border-radius-lg);
  padding: var(--van-padding-md);
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.instruction-title {
  margin: var(--van-padding-sm) 0 var(--van-padding-xs) 0;
  color: #FF69B4;
  font-size: var(--text-lg);
  font-weight: 600;
}

.instruction-desc {
  margin: 0;
  color: #666;
  font-size: var(--text-sm);
}

.cards-container {
  margin-bottom: var(--van-padding-lg);
}

.cards-grid {
  display: grid;
  gap: var(--van-padding-sm);
  padding: var(--van-padding-sm);
  max-width: 320px;
  margin: 0 auto;
}

.cards-grid.grid-4 {
  grid-template-columns: repeat(4, 1fr);
}

.cards-grid.grid-6 {
  grid-template-columns: repeat(6, 1fr);
}

.card-wrapper {
  aspect-ratio: 1;
  cursor: pointer;
}

.card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.card.flipped {
  transform: rotateY(180deg);
}

.card.matched {
  opacity: 0.6;
  pointer-events: none;
}

.card.shake-error {
  animation: shake 0.5s ease;
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
  border-radius: var(--van-border-radius-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-front {
  background: linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%);
  color: white;
}

.card-back {
  background: white;
  transform: rotateY(180deg);
  border: 2px solid #FFB6C1;
}

.card-content {
  font-size: var(--text-2xl);
}

.progress-section {
  margin-top: var(--van-padding-lg);
  text-align: center;
}

.progress-text {
  margin-top: var(--van-padding-sm);
  font-size: var(--text-sm);
  color: #666;
  font-weight: 500;
}

.game-controls {
  margin-top: var(--van-padding-sm);
}

.control-buttons {
  display: flex;
  justify-content: space-around;
  gap: var(--van-padding-sm);
}

.control-buttons .van-button {
  flex: 1;
  max-width: 120px;
}

.help-content {
  height: 100%;
  background: white;
  border-radius: var(--van-border-radius-lg) var(--van-border-radius-lg) 0 0;
  padding: var(--van-padding-lg);
}

.help-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--van-padding-lg);
  padding-bottom: var(--van-padding-md);
  border-bottom: 1px solid #f0f0f0;
}

.help-header h3 {
  color: #FF69B4;
  margin: 0;
  font-size: var(--text-lg);
}

.close-icon {
  color: #999;
  font-size: var(--text-xl);
  cursor: pointer;
}

.help-body {
  overflow-y: auto;
  max-height: calc(100% - 60px);
}

.help-section {
  margin-bottom: var(--van-padding-lg);
}

.help-section h4 {
  color: #333;
  margin: 0 0 var(--van-padding-sm) 0;
  font-size: var(--text-base);
}

.help-section p,
.help-section ul {
  font-size: var(--text-sm);
  color: #666;
  line-height: 1.5;
  margin: var(--van-padding-xs) 0;
}

.help-section ul {
  padding-left: var(--van-padding-lg);
}

.success-popup {
  padding: var(--van-padding-xl);
  text-align: center;
  min-width: 280px;
}

.success-popup h3 {
  margin: var(--van-padding-md) 0 var(--van-padding-sm) 0;
  color: #333;
  font-size: var(--text-xl);
}

.success-popup p {
  margin: 0 0 var(--van-padding-md) 0;
  color: #666;
  font-size: var(--text-sm);
}

.stars {
  display: flex;
  justify-content: center;
  gap: var(--van-padding-xs);
  margin-bottom: var(--van-padding-lg);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* 移动端适配 */
@media (max-width: var(--breakpoint-xs)) {
  .cards-grid.grid-4 {
    gap: var(--van-padding-xs);
  }

  .card-content {
    font-size: var(--text-xl);
  }

  .status-value {
    font-size: var(--text-xs);
  }

  .instruction-title {
    font-size: var(--text-base);
  }
}
</style>