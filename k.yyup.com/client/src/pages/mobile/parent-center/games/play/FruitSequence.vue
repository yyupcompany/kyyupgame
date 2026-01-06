<template>
  <div class="mobile-fruit-sequence-game">
    <!-- 游戏头部 -->
    <van-nav-bar
      title="水果记忆大师"
      left-text="返回"
      left-arrow
      @click-left="handleBack"
      class="game-navbar"
    />

    <!-- 游戏主体 -->
    <div class="game-container">
      <!-- 状态栏 -->
      <van-cell-group inset class="status-bar">
        <van-cell class="game-stats">
          <template #default>
            <div class="stats-grid">
              <div class="stat-item">
                <van-icon name="fire-o" class="stat-icon" />
                <span class="stat-value">{{ score }}</span>
              </div>
              <div class="stat-item">
                <span class="lives">
                  <span v-for="i in 3" :key="i" class="life">
                    {{ i <= lives ? '❤️' : '🖤' }}
                  </span>
                </span>
              </div>
              <div class="stat-item">
                <van-icon name="medal-o" class="stat-icon" />
                <span class="stat-value">关卡 {{ currentLevel }}</span>
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 游戏区域 -->
      <van-cell-group inset class="game-area">
        <van-cell v-if="gameState === 'demo'" class="demo-phase">
          <template #default>
            <div class="instruction-section">
              <div class="instruction-title">
                <van-icon name="eye-o" class="title-icon" />
                <span>请记住顺序！</span>
              </div>
              <div class="sequence-info">
                序列长度：<span class="highlight">{{ currentSequence.length }}</span>
              </div>
            </div>

            <div class="fruits-grid">
              <div
                v-for="(fruit, index) in visibleFruits"
                :key="index"
                class="fruit-item"
                :class="{ 'active': activeFruitIndex === index }"
              >
                <div class="fruit-content">
                  <img :src="getFruitIcon(fruit)" :alt="getFruitName(fruit)" />
                  <div class="fruit-label">{{ getFruitName(fruit) }}</div>
                </div>
              </div>
            </div>
          </template>
        </van-cell>

        <van-cell v-else-if="gameState === 'playing'" class="playing-phase">
          <template #default>
            <div class="instruction-section">
              <div class="instruction-title">
                <van-icon name="pointer" class="title-icon" />
                <span>请按顺序点击水果</span>
              </div>
              <div class="progress-info">
                已完成：<span class="highlight">{{ selectedFruits.length }}</span> / {{ currentSequence.length }}
              </div>
            </div>

            <div class="fruits-grid">
              <div
                v-for="(fruit, index) in visibleFruits"
                :key="index"
                class="fruit-item"
                :class="{
                  'selected': selectedFruits.includes(index),
                  'correct': feedbackState === 'correct' && lastSelectedIndex === index,
                  'wrong': feedbackState === 'wrong' && lastSelectedIndex === index
                }"
                @click="handleFruitClick(index)"
              >
                <div class="fruit-content">
                  <img :src="getFruitIcon(fruit)" :alt="getFruitName(fruit)" />
                  <div class="fruit-label">{{ getFruitName(fruit) }}</div>
                </div>
              </div>
            </div>
          </template>
        </van-cell>

        <van-cell v-else-if="gameState === 'success'" class="success-phase">
          <template #default>
            <div class="success-section">
              <van-icon name="passed" class="success-icon" />
              <div class="success-message">
                <h3>🎉 太棒了！</h3>
                <p>进入下一关...</p>
              </div>
            </div>
          </template>
        </van-cell>

        <van-cell v-else-if="gameState === 'gameover'" class="gameover-phase">
          <template #default>
            <div class="gameover-section">
              <van-icon name="fail" class="gameover-icon" />
              <div class="gameover-message">
                <h3>游戏结束</h3>
                <p>最高关卡：{{ currentLevel }}</p>
                <van-button type="primary" @click="handleRestart" size="large" block>
                  再来一次
                </van-button>
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 控制按钮 -->
      <van-cell-group inset class="control-bar">
        <van-cell class="game-controls">
          <template #default>
            <div class="controls">
              <van-button
                plain
                type="default"
                size="small"
                @click="handlePause"
                :disabled="gameState === 'gameover'"
              >
                {{ isPaused ? '继续' : '暂停' }}
              </van-button>
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
                @click="handleRestart"
                :disabled="gameState === 'demo' || gameState === 'playing'"
              >
                重新开始
              </van-button>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 帮助弹窗 -->
    <van-popup v-model:show="showHelp" position="bottom" :style="{ height: '80%' }">
      <div class="help-content">
        <div class="help-header">
          <h3>🎮 游戏说明</h3>
          <van-icon name="cross" @click="showHelp = false" class="close-icon" />
        </div>

        <div class="help-body">
          <div class="help-section">
            <h4>🍎 水果记忆大师</h4>
            <p class="game-intro">这是一个锻炼记忆力的序列记忆游戏</p>
          </div>

          <div class="help-section">
            <h4>📖 游戏规则</h4>
            <ol>
              <li>观察水果亮起的顺序</li>
              <li>按照相同顺序点击水果</li>
              <li>错误会失去生命值</li>
              <li>失去3次生命值后游戏结束</li>
            </ol>
          </div>

          <div class="help-section">
            <h4>💡 游戏技巧</h4>
            <ul>
              <li>集中注意力观察演示</li>
              <li>可以小声重复水果名称</li>
              <li>序列长时可以分段记忆</li>
              <li>不要着急，想清楚再点击</li>
            </ul>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showFailToast } from 'vant'

const router = useRouter()

// 游戏状态
type GameState = 'demo' | 'playing' | 'success' | 'gameover'
const gameState = ref<GameState>('demo')

// 水果列表
const allFruits = ['apple', 'banana', 'strawberry', 'grape', 'orange', 'watermelon']

// 游戏数据
const score = ref(0)
const lives = ref(3)
const currentLevel = ref(1)
const visibleFruits = ref<string[]>([])
const currentSequence = ref<number[]>([])
const selectedFruits = ref<number[]>([])
const activeFruitIndex = ref<number>(-1)
const feedbackState = ref<'correct' | 'wrong' | null>(null)
const lastSelectedIndex = ref<number>(-1)
const isPaused = ref(false)

// UI状态
const showHelp = ref(false)

// 获取水果中文名
const getFruitName = (fruit: string): string => {
  const names: Record<string, string> = {
    apple: '苹果',
    banana: '香蕉',
    strawberry: '草莓',
    grape: '葡萄',
    orange: '橙子',
    watermelon: '西瓜'
  }
  return names[fruit] || fruit
}

// 获取水果图标（使用emoji代替图片）
const getFruitIcon = (fruit: string): string => {
  const icons: Record<string, string> = {
    apple: '🍎',
    banana: '🍌',
    strawberry: '🍓',
    grape: '🍇',
    orange: '🍊',
    watermelon: '🍉'
  }
  return icons[fruit] || '🍎'
}

// 初始化游戏
const initGame = () => {
  score.value = 0
  lives.value = 3
  currentLevel.value = 1

  // 根据关卡选择水果数量
  const fruitCount = Math.min(3 + currentLevel.value, 6)
  visibleFruits.value = [...allFruits].sort(() => Math.random() - 0.5).slice(0, fruitCount)

  startNewRound()
}

// 开始新一轮
const startNewRound = () => {
  selectedFruits.value = []
  feedbackState.value = null

  // 生成序列
  const sequenceLength = Math.min(2 + currentLevel.value, 8)
  currentSequence.value = []
  for (let i = 0; i < sequenceLength; i++) {
    currentSequence.value.push(Math.floor(Math.random() * visibleFruits.value.length))
  }

  playDemo()
}

// 播放演示
const playDemo = async () => {
  gameState.value = 'demo'
  showToast('请记住水果顺序！')

  // 依次高亮水果
  for (let i = 0; i < currentSequence.value.length; i++) {
    const fruitIndex = currentSequence.value[i]
    activeFruitIndex.value = fruitIndex

    await new Promise(resolve => setTimeout(resolve, 1000))
    activeFruitIndex.value = -1
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  gameState.value = 'playing'
  showToast('请按顺序点击水果')
}

// 处理水果点击
const handleFruitClick = (index: number) => {
  if (gameState.value !== 'playing' || isPaused.value) return
  if (selectedFruits.value.includes(index)) return

  selectedFruits.value.push(index)
  lastSelectedIndex.value = index

  const expectedIndex = currentSequence.value[selectedFruits.value.length - 1]

  if (index === expectedIndex) {
    // 正确
    feedbackState.value = 'correct'
    showSuccessToast('正确！')

    if (selectedFruits.value.length === currentSequence.value.length) {
      setTimeout(() => {
        handleLevelComplete()
      }, 1000)
    }

    setTimeout(() => {
      feedbackState.value = null
    }, 500)

  } else {
    // 错误
    feedbackState.value = 'wrong'
    lives.value--
    showFailToast('错误！')

    setTimeout(() => {
      feedbackState.value = null
    }, 500)

    if (lives.value <= 0) {
      handleGameOver()
    } else {
      setTimeout(() => {
        startNewRound()
      }, 1500)
    }
  }
}

// 关卡完成
const handleLevelComplete = async () => {
  gameState.value = 'success'
  score.value += currentLevel.value * 100
  showSuccessToast('关卡完成！')

  await new Promise(resolve => setTimeout(resolve, 2000))

  currentLevel.value++

  // 更新可见水果数量
  const fruitCount = Math.min(3 + currentLevel.value, 6)
  visibleFruits.value = [...allFruits].sort(() => Math.random() - 0.5).slice(0, fruitCount)

  startNewRound()
}

// 游戏结束
const handleGameOver = () => {
  gameState.value = 'gameover'
  showToast('游戏结束')
}

// 重新开始
const handleRestart = () => {
  initGame()
}

// 返回
const handleBack = () => {
  router.push('/mobile/parent-center/games')
}

// 暂停
const handlePause = () => {
  isPaused.value = !isPaused.value
  showToast(isPaused.value ? '游戏已暂停' : '游戏继续')
}

onMounted(() => {
  initGame()
})
</script>

<style scoped>
.mobile-fruit-sequence-game {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
  padding-bottom: var(--van-padding-md);
}

.game-navbar {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
  color: white;
}

.game-container {
  padding: var(--van-padding-sm);
}

.status-bar {
  margin-bottom: var(--van-padding-sm);
}

.game-stats {
  background: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--van-padding-md);
  text-align: center;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--van-padding-xs);
}

.stat-icon {
  color: #ff6b6b;
  font-size: var(--text-xl);
}

.stat-value {
  font-size: var(--text-base);
  font-weight: 600;
  color: #333;
}

.lives {
  font-size: var(--text-base);
}

.life {
  margin: 0 2px;
}

.game-area {
  margin-bottom: var(--van-padding-sm);
  min-height: 400px;
}

.instruction-section {
  text-align: center;
  margin-bottom: var(--van-padding-lg);
  padding: var(--van-padding-md);
}

.instruction-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--van-padding-xs);
  font-size: var(--text-lg);
  font-weight: 600;
  color: #333;
  margin-bottom: var(--van-padding-sm);
}

.title-icon {
  color: #ff6b6b;
  font-size: var(--text-2xl);
}

.sequence-info,
.progress-info {
  font-size: var(--text-base);
  color: #666;
}

.highlight {
  color: #ff6b6b;
  font-weight: 600;
  font-size: var(--text-lg);
}

.fruits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--van-padding-md);
  padding: var(--van-padding-md);
}

.fruit-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--van-border-radius-lg);
  background: white;
  border: 2px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.fruit-item.active {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
  border-color: #ff6b6b;
  transform: scale(1.1);
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.3);
}

.fruit-item.selected {
  opacity: 0.5;
  pointer-events: none;
}

.fruit-item.correct {
  background: linear-gradient(135deg, #07c160 0%, #07c160 100%);
  border-color: #07c160;
  animation: correctPulse 0.5s ease;
}

.fruit-item.wrong {
  background: linear-gradient(135deg, #ee0a24 0%, #ee0a24 100%);
  border-color: #ee0a24;
  animation: wrongShake 0.5s ease;
}

.fruit-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--van-padding-xs);
}

.fruit-content img {
  width: 48px;
  height: 48px;
  font-size: var(--text-5xl);
}

.fruit-label {
  font-size: var(--text-xs);
  color: #666;
  font-weight: 500;
}

.fruit-item.active .fruit-label,
.fruit-item.correct .fruit-label,
.fruit-item.wrong .fruit-label {
  color: white;
}

.success-section,
.gameover-section {
  text-align: center;
  padding: var(--van-padding-xl) 0;
}

.success-icon {
  font-size: 64px;
  color: #07c160;
  margin-bottom: var(--van-padding-md);
}

.gameover-icon {
  font-size: 64px;
  color: #ee0a24;
  margin-bottom: var(--van-padding-md);
}

.success-message h3,
.gameover-message h3 {
  color: #333;
  margin: 0 0 var(--van-padding-sm) 0;
  font-size: var(--text-xl);
}

.success-message p,
.gameover-message p {
  color: #666;
  margin: 0 0 var(--van-padding-lg) 0;
  font-size: var(--text-sm);
}

.control-bar {
  margin-top: var(--van-padding-sm);
}

.game-controls {
  background: white;
}

.controls {
  display: flex;
  justify-content: space-around;
  gap: var(--van-padding-sm);
}

.controls .van-button {
  flex: 1;
  max-width: 100px;
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
  color: #333;
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
  max-height: calc(100% - 80px);
}

.help-section {
  margin-bottom: var(--van-padding-lg);
}

.help-section h4 {
  color: #333;
  margin: 0 0 var(--van-padding-sm) 0;
  font-size: var(--text-base);
}

.game-intro {
  background: #f8f8f8;
  padding: var(--van-padding-sm);
  border-radius: var(--van-border-radius-md);
  margin-bottom: var(--van-padding-md);
  font-size: var(--text-sm);
  color: #666;
}

.help-section ol,
.help-section ul {
  margin: 0;
  padding-left: var(--van-padding-lg);
}

.help-section li {
  margin-bottom: var(--van-padding-xs);
  line-height: 1.5;
  color: #666;
  font-size: var(--text-sm);
}

@keyframes correctPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* 移动端适配 */
@media (max-width: var(--breakpoint-xs)) {
  .fruits-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--van-padding-sm);
  }

  .fruit-content img {
    width: 36px;
    height: 36px;
    font-size: var(--text-4xl);
  }

  .fruit-label {
    font-size: 11px;
  }

  .stats-grid {
    gap: var(--van-padding-sm);
  }

  .stat-value {
    font-size: var(--text-sm);
  }

  .instruction-title {
    font-size: var(--text-base);
  }

  .highlight {
    font-size: var(--text-base);
  }
}
</style>