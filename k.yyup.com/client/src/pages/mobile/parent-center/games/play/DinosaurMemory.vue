<template>
  <MobileLayout
    title="恐龙记忆挑战"
    :show-back="true"
    :show-nav-bar="true"
    @back="handleBack"
  >
    <div class="mobile-dinosaur-memory">
      <!-- 游戏状态栏 -->
      <div class="game-status-bar">
        <div class="level-info">
          <span class="level-badge">第{{ currentLevel }}关</span>
        </div>
        <div class="moves-info">
          <span class="moves">翻牌: {{ moves }}次</span>
        </div>
        <div class="pairs-info">
          <span class="pairs">配对: {{ matchedPairs }}/{{ totalPairs }}</span>
        </div>
      </div>

      <!-- 计时器 -->
      <div class="timer-bar">
        <div class="timer-icon">⏱️</div>
        <div class="timer-text">{{ formatTime(timeElapsed) }}</div>
        <div class="memory-rate" v-if="moves > 0">
          记忆率: {{ memoryRate }}%
        </div>
      </div>

      <!-- 游戏说明 -->
      <div class="game-intro">
        <h3>🦖 恐龙记忆挑战</h3>
        <p>记住恐龙位置，找到相同的一对！</p>
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
              unmatched: card.isUnmatched
            }">
              <!-- 卡片背面 -->
              <div class="card-back">
                <div class="back-pattern">
                  <span class="pattern-icon">🥚</span>
                  <div class="cracks">⚡</div>
                </div>
              </div>

              <!-- 卡片正面 -->
              <div class="card-front">
                <div class="card-item">
                  {{ card.icon }}
                </div>
                <div class="card-name">{{ card.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 控制按钮区 -->
      <div class="control-area">
        <button
          class="control-btn roar-btn"
          @click="handleUseRoar"
          :disabled="roarLeft === 0"
          :class="{ disabled: roarLeft === 0 }"
        >
          <span class="btn-icon">🦖</span>
          <span>恐龙吼叫 ({{ roarLeft }})</span>
        </button>

        <button class="control-btn pause-btn" @click="handlePause">
          <span class="btn-icon">{{ isPaused ? '▶️' : '⏸️' }}</span>
          <span>{{ isPaused ? '继续' : '暂停' }}</span>
        </button>

        <button class="control-btn restart-btn" @click="handleRestart">
          <span class="btn-icon">🔄</span>
          <span>重新开始</span>
        </button>
      </div>

      <!-- 帮助按钮 -->
      <div class="help-area">
        <button class="help-btn" @click="showHelp = true">
          <span class="btn-icon">❓</span>
          游戏说明
        </button>
      </div>
    </div>

    <!-- 帮助弹窗 -->
    <van-popup
      v-model:show="showHelp"
      position="center"
      round
      :style="{ width: '90%', maxHeight: '80vh', overflow: 'auto' }"
    >
      <div class="help-content">
        <h2>🦖 恐龙记忆挑战</h2>
        <p class="game-intro">恐龙主题的翻牌记忆游戏，在史前世界中寻找恐龙配对</p>

        <div class="help-section">
          <h3>📖 游戏规则</h3>
          <ol>
            <li>点击恐龙卡片翻开查看</li>
            <li>找到两张相同的恐龙卡片</li>
            <li>配对成功后卡片保持翻开</li>
            <li>失败会自动翻回，需要记住位置</li>
          </ol>
        </div>

        <div class="help-section">
          <h3>🎯 游戏目标</h3>
          <ul>
            <li>记住恐龙的位置</li>
            <li>完成所有配对</li>
            <li>挑战记忆极限</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>📈 难度递增</h3>
          <ul>
            <li><strong>第1-2关</strong>: 3对恐龙(6张)</li>
            <li><strong>第3-4关</strong>: 6对恐龙(12张)</li>
            <li><strong>第5关+</strong>: 8对恐龙(16张)</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>🎮 特殊功能</h3>
          <ul>
            <li><strong>🦕 恐龙种类</strong>: 霸王龙、三角龙等多种恐龙</li>
            <li><strong>⏱️ 计时挑战</strong>: 速度越快星级越高</li>
            <li><strong>🦖 恐龙吼叫</strong>: 短暂查看所有卡片</li>
          </ul>
        </div>

        <div class="help-section tips">
          <h3>💡 游戏技巧</h3>
          <ul>
            <li>先记住恐龙的大概位置分布</li>
            <li>优先配对印象深刻的恐龙</li>
            <li>翻开新卡时立即回忆是否见过</li>
            <li>保持冷静，不要慌乱点击</li>
          </ul>
        </div>
      </div>

      <div class="help-actions">
        <van-button type="primary" block @click="showHelp = false">知道了</van-button>
      </div>
    </van-popup>

    <!-- 完成弹窗 -->
    <van-popup
      v-model:show="showCompletionDialog"
      position="center"
      round
      :style="{ width: '85%' }"
    >
      <div class="completion-content">
        <div class="stars">
          <div
            v-for="i in 3"
            :key="i"
            class="star"
            :class="{ 'star-earned': i <= starsEarned }"
          >
            ⭐
          </div>
        </div>
        <h2>🎉 征服恐龙世界！</h2>
        <div class="score-info">
          <p>用时：{{ formatTime(timeElapsed) }}</p>
          <p>翻牌次数：{{ moves }}</p>
          <p>记忆率：{{ memoryRate }}%</p>
          <p class="grade">{{ getGrade() }}</p>
        </div>
      </div>

      <div class="completion-actions">
        <van-button type="primary" block @click="handleNextLevel">下一关</van-button>
        <van-button @click="handleBack" block>返回大厅</van-button>
      </div>
    </van-popup>
  </MobileLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import MobileLayout from '@/pages/mobile/layouts/MobileLayout.vue'
import { audioManager } from '../../parent-center/games/utils/audioManager'
import { buildBGMUrl, buildSFXUrl, buildVoiceUrl } from '@/utils/oss-url-builder'

const router = useRouter()

// 游戏状态
const currentLevel = ref(1)
const moves = ref(0)
const matchedPairs = ref(0)
const timeElapsed = ref(0)
const roarLeft = ref(2)
const showCompletionDialog = ref(false)
const showHelp = ref(false)
const starsEarned = ref(0)
const isPaused = ref(false)

// 卡片相关
interface Card {
  id: number
  pairId: number
  icon: string
  name: string
  isFlipped: boolean
  isMatched: boolean
  isUnmatched: boolean
}

const cards = ref<Card[]>([])
const flippedCards = ref<Card[]>([])

// 恐龙库
const DINOSAURS = [
  { icon: '🦖', name: '霸王龙' },
  { icon: '🦕', name: '雷龙' },
  { icon: '🐊', name: '鳄龙' },
  { icon: '🦴', name: '剑龙' },
  { icon: '🦎', name: '翼龙' },
  { icon: '🐢', name: '龟龙' },
  { icon: '🐉', name: '三角龙' },
  { icon: '🐲', name: '棘龙' },
  { icon: '🦣', name: '猛犸象' },
  { icon: '🐅', name: '剑齿虎' }
]

// 计算属性
const gridSize = computed(() => {
  if (currentLevel.value <= 2) return '2x3'
  if (currentLevel.value <= 4) return '3x4'
  return '4x4'
})

const totalPairs = computed(() => {
  if (currentLevel.value <= 2) return 3
  if (currentLevel.value <= 4) return 6
  return 8
})

const memoryRate = computed(() => {
  const perfectMoves = totalPairs.value * 2
  return Math.round((perfectMoves / Math.max(moves.value, 1)) * 100)
})

// 定时器
let timerInterval: number | null = null

// 初始化游戏
const initLevel = () => {
  const pairCount = totalPairs.value
  const selectedDinos = DINOSAURS.slice(0, Math.min(pairCount, DINOSAURS.length))

  const tempCards: Card[] = []
  selectedDinos.forEach((dino, index) => {
    tempCards.push({
      id: index * 2,
      pairId: index,
      icon: dino.icon,
      name: dino.name,
      isFlipped: false,
      isMatched: false,
      isUnmatched: false
    })
    tempCards.push({
      id: index * 2 + 1,
      pairId: index,
      icon: dino.icon,
      name: dino.name,
      isFlipped: false,
      isMatched: false,
      isUnmatched: false
    })
  })

  cards.value = shuffleArray(tempCards)
  moves.value = 0
  matchedPairs.value = 0
  flippedCards.value = []
  timeElapsed.value = 0
}

// 洗牌算法
const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// 开始计时
const startTimer = () => {
  timerInterval = window.setInterval(() => {
    if (!isPaused.value) {
      timeElapsed.value++
    }
  }, 1000)
}

// 停止计时
const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// 格式化时间
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 处理卡片点击
const handleCardClick = (card: Card) => {
  if (card.isFlipped || card.isMatched || flippedCards.value.length >= 2 || isPaused.value) {
    return
  }

  card.isFlipped = true
  flippedCards.value.push(card)
  moves.value++

  playSound('flip')

  if (flippedCards.value.length === 2) {
    setTimeout(() => checkMatch(), 800)
  }
}

// 检查匹配
const checkMatch = () => {
  const [card1, card2] = flippedCards.value

  if (card1.pairId === card2.pairId) {
    // 匹配成功
    card1.isMatched = true
    card2.isMatched = true
    matchedPairs.value++

    playSound('roar')
    playVoice('correct')
    showSuccessToast('吼！找到了一对恐龙！')

    if (matchedPairs.value === totalPairs.value) {
      handleLevelComplete()
    }
  } else {
    // 匹配失败
    card1.isUnmatched = true
    card2.isUnmatched = true

    playSound('unmatch')

    setTimeout(() => {
      card1.isFlipped = false
      card2.isFlipped = false
      card1.isUnmatched = false
      card2.isUnmatched = false
    }, 500)
  }

  flippedCards.value = []
}

// 使用恐龙吼叫
const handleUseRoar = () => {
  if (roarLeft.value === 0) return

  roarLeft.value--

  cards.value.forEach(card => {
    if (!card.isMatched) {
      card.isFlipped = true
    }
  })

  playSound('roar')
  playVoice('hint')
  showToast('🦖 恐龙吼叫！记住位置！')

  setTimeout(() => {
    cards.value.forEach(card => {
      if (!card.isMatched) {
        card.isFlipped = false
      }
    })
  }, 3000)
}

// 关卡完成
const handleLevelComplete = () => {
  stopTimer()

  const perfectMoves = totalPairs.value * 2
  if (moves.value === perfectMoves && timeElapsed.value < 60) {
    starsEarned.value = 3
  } else if (moves.value <= perfectMoves + 3 && timeElapsed.value < 120) {
    starsEarned.value = 2
  } else {
    starsEarned.value = 1
  }

  playVoice('level-complete')
  showCompletionDialog.value = true
}

// 获取评级
const getGrade = () => {
  if (starsEarned.value === 3) return '恐龙大师！'
  if (starsEarned.value === 2) return '恐龙专家！'
  return '恐龙探索者！'
}

// 下一关
const handleNextLevel = () => {
  currentLevel.value++
  roarLeft.value = 2
  showCompletionDialog.value = false
  initLevel()
  startTimer()

  showToast(`进入第${currentLevel.value}关！`)
}

// 重新开始
const handleRestart = () => {
  currentLevel.value = 1
  roarLeft.value = 2
  showCompletionDialog.value = false
  initLevel()
  startTimer()
}

// 暂停
const handlePause = () => {
  isPaused.value = !isPaused.value

  if (isPaused.value) {
    showToast('游戏已暂停')
    audioManager.pauseBGM?.()
  } else {
    showToast('游戏继续')
    audioManager.resumeBGM?.()
  }
}

// 返回
const handleBack = () => {
  stopTimer()
  router.push('/mobile/parent-center/games')
}

// 音频
const playSound = (type: string) => {
  const soundMap: Record<string, string> = {
    'flip': buildSFXUrl('card-flip.mp3'),
    'roar': buildSFXUrl('dinosaur-roar.mp3'),
    'unmatch': buildSFXUrl('wrong.mp3')
  }

  if (soundMap[type]) {
    const audio = new Audio(soundMap[type])
    audio.volume = 0.5
    audio.play().catch(err => console.log('音效播放失败:', err))
  }
}

const playVoice = (type: string) => {
  let voicePath = ''

  if (type === 'correct') {
    const randomNum = Math.floor(Math.random() * 5) + 1
    voicePath = buildVoiceUrl(`correct-${randomNum}.mp3`, 'dinosaur-memory')
  } else if (type === 'wrong') {
    const randomNum = Math.floor(Math.random() * 2) + 1
    voicePath = buildVoiceUrl(`wrong-${randomNum}.mp3`, 'dinosaur-memory')
  } else {
    const voiceMap: Record<string, string> = {
      'game-start': 'game-start.mp3',
      'level-complete': 'level-complete.mp3',
      'hint': 'hint.mp3'
    }
    const fileName = voiceMap[type]
    if (fileName) {
      voicePath = buildVoiceUrl(fileName, 'dinosaur-memory')
    }
  }

  if (!voicePath) return

  const audio = new Audio(voicePath)
  audio.volume = 0.8
  audio.play().catch(err => console.log('语音播放失败:', err))
}

onMounted(() => {
  initLevel()
  startTimer()

  // 播放BGM
  try {
    audioManager.playBGM(buildBGMUrl('dinosaur-memory-bgm.mp3'))
  } catch (error) {
    console.log('BGM播放失败:', error)
  }

  playVoice('game-start')
})

onUnmounted(() => {
  stopTimer()
  audioManager.dispose()
})
</script>

<style scoped lang="scss">
.mobile-dinosaur-memory {
  min-height: 100vh;
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 50%, #ce93d8 100%);
  padding: var(--van-padding-sm);
  position: relative;

  // 背景装饰
  &::before {
    content: '🌿';
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: var(--text-xl);
    opacity: 0.3;
  }

  &::after {
    content: '🦕';
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: var(--text-2xl);
    opacity: 0.3;
  }
}

// 游戏状态栏
.game-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--van-radius-lg);
  padding: var(--van-padding-xs) var(--van-padding-sm);
  margin-bottom: var(--van-padding-sm);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .level-info .level-badge {
    background: linear-gradient(135deg, #9c27b0, #ba68c8);
    color: white;
    padding: var(--spacing-xs) 12px;
    border-radius: var(--van-radius-md);
    font-size: var(--text-xs);
    font-weight: bold;
  }

  .moves-info .moves {
    font-size: var(--text-sm);
    font-weight: bold;
    color: #9c27b0;
  }

  .pairs-info .pairs {
    font-size: var(--text-sm);
    font-weight: bold;
    color: #4caf50;
  }
}

// 计时器栏
.timer-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--van-radius-md);
  padding: var(--van-padding-xs) var(--van-padding-sm);
  margin-bottom: var(--van-padding-sm);
  gap: var(--van-padding-sm);

  .timer-icon {
    font-size: var(--text-base);
  }

  .timer-text {
    font-size: var(--text-base);
    font-weight: bold;
    color: #9c27b0;
  }

  .memory-rate {
    font-size: var(--text-xs);
    color: #4caf50;
    font-weight: bold;
  }
}

// 游戏说明
.game-intro {
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--van-radius-lg);
  padding: var(--van-padding-sm);
  margin-bottom: var(--van-padding-sm);

  h3 {
    font-size: var(--text-lg);
    color: #9c27b0;
    margin: 0 0 4px 0;
  }

  p {
    font-size: var(--text-sm);
    color: #666;
    margin: 0;
  }
}

// 卡片容器
.cards-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--van-padding-sm);
}

.cards-grid {
  display: grid;
  gap: var(--van-padding-xs);
  padding: var(--van-padding-sm);
  width: 100%;
  max-width: 400px;

  &.grid-2x3 {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
  }

  &.grid-3x4 {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(3, 1fr);
  }

  &.grid-4x4 {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(4, 1fr);
  }
}

.card-wrapper {
  aspect-ratio: 1;
  cursor: pointer;
  perspective: 1000px;
}

.card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s ease;

  &.flipped {
    transform: rotateY(180deg);
  }

  &.matched {
    animation: match-success 0.5s ease;
  }

  &.unmatched {
    animation: shake 0.5s ease;
  }
}

.card-back,
.card-front {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: var(--van-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.card-back {
  background: linear-gradient(135deg, #8d6e63, #6d4c41);
  border: 2px solid #5d4037;

  .back-pattern {
    position: relative;
    text-align: center;

    .pattern-icon {
      font-size: var(--text-2xl);
      display: block;
      margin-bottom: 4px;
    }

    .cracks {
      font-size: var(--text-xs);
      opacity: 0.6;
    }
  }
}

.card-front {
  background: linear-gradient(135deg, #fff8e1, #ffecb3);
  border: 2px solid #ffd54f;
  transform: rotateY(180deg);

  .card-item {
    font-size: var(--text-3xl);
    margin-bottom: 4px;
  }

  .card-name {
    font-size: 10px;
    font-weight: bold;
    color: #5d4037;
    text-align: center;
    line-height: 1.2;
  }
}

// 控制区域
.control-area {
  display: flex;
  justify-content: space-between;
  gap: var(--van-padding-xs);
  margin-bottom: var(--van-padding-sm);

  .control-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 50px;
    border: none;
    border-radius: var(--van-radius-md);
    font-size: 11px;
    font-weight: 500;
    transition: all 0.2s ease;
    gap: var(--spacing-xs);

    &.roar-btn {
      background: linear-gradient(135deg, #ff5722, #ff7043);
      color: white;

      &.disabled {
        background: #ccc;
        color: #999;
        cursor: not-allowed;
      }
    }

    &.pause-btn {
      background: linear-gradient(135deg, #9c27b0, #ba68c8);
      color: white;
    }

    &.restart-btn {
      background: linear-gradient(135deg, #607d8b, #78909c);
      color: white;
    }

    &:active {
      transform: scale(0.95);
    }

    .btn-icon {
      font-size: var(--text-base);
    }
  }
}

// 帮助区域
.help-area {
  text-align: center;

  .help-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: var(--spacing-sm) 16px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #ddd;
    border-radius: var(--van-radius-md);
    color: #666;
    font-size: var(--text-xs);
    text-decoration: none;
    transition: all 0.2s ease;

    &:active {
      background: #f5f5f5;
    }

    .btn-icon {
      font-size: var(--text-sm);
    }
  }
}

// 帮助内容样式
.help-content {
  padding: var(--van-padding-md);
  max-height: 70vh;
  overflow-y: auto;

  h2 {
    color: #9c27b0;
    font-size: var(--text-2xl);
    text-align: center;
    margin: 0 0 var(--van-padding-sm) 0;
  }

  .game-intro {
    font-size: var(--text-sm);
    color: #666;
    text-align: center;
    margin-bottom: var(--van-padding-md);
    padding: var(--van-padding-sm);
    background: #f8f9fa;
    border-radius: var(--van-radius-sm);
  }

  .help-section {
    margin-bottom: var(--van-padding-md);

    h3 {
      font-size: var(--text-base);
      color: #333;
      margin: 0 0 var(--van-padding-xs) 0;
      padding-bottom: var(--van-padding-xs);
      border-bottom: 2px solid #e0e0e0;
    }

    ol, ul {
      margin: 0;
      padding-left: 20px;

      li {
        margin-bottom: 4px;
        line-height: 1.5;
        color: #666;
        font-size: var(--text-sm);

        strong {
          color: #9c27b0;
        }
      }
    }

    &.tips {
      background: #f3e5f5;
      padding: var(--van-padding-sm);
      border-radius: var(--van-radius-sm);
      border: 1px solid #9c27b0;

      h3 {
        color: #7b1fa2;
        border-bottom-color: #9c27b0;
      }

      ul li {
        color: #7b1fa2;
      }
    }
  }
}

.help-actions,
.completion-actions {
  padding: var(--van-padding-sm);
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: var(--van-padding-xs);
}

// 完成内容样式
.completion-content {
  text-align: center;
  padding: var(--van-padding-md);

  .stars {
    display: flex;
    justify-content: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--van-padding-md);

    .star {
      font-size: var(--text-4xl);
      color: #ddd;
      transition: all 0.3s ease;

      &.star-earned {
        color: #ffd700;
        animation: star-pop 0.5s ease-out;
      }
    }
  }

  h2 {
    font-size: var(--text-2xl);
    color: #9c27b0;
    margin: 0 0 var(--van-padding-md) 0;
  }

  .score-info {
    p {
      font-size: var(--text-sm);
      margin: var(--spacing-xs) 0;
      color: #666;

      &.grade {
        font-size: var(--text-lg);
        font-weight: bold;
        color: #9c27b0;
        margin-top: var(--van-padding-sm);
      }
    }
  }
}

// 动画定义
@keyframes match-success {
  0% { transform: scale(1) rotateY(180deg); }
  50% { transform: scale(1.1) rotateY(180deg); }
  100% { transform: scale(1) rotateY(180deg); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0) rotateY(180deg); }
  25% { transform: translateX(-5px) rotateY(180deg); }
  75% { transform: translateX(5px) rotateY(180deg); }
}

@keyframes star-pop {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(180deg);
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
}

// 移动端适配
@media (max-width: var(--breakpoint-xs)) {
  .cards-grid {
    max-width: 320px;
    gap: var(--van-padding-xs);

    &.grid-2x3 {
      .card-front .card-item {
        font-size: var(--text-2xl);
      }
    }

    &.grid-3x4,
    &.grid-4x4 {
      .card-front .card-item {
        font-size: var(--text-xl);
      }

      .card-front .card-name {
        font-size: 8px;
      }
    }
  }

  .control-area .control-btn {
    height: 45px;
    font-size: 10px;

    .btn-icon {
      font-size: var(--text-sm);
    }
  }
}

@media (max-width: 360px) {
  .game-status-bar {
    .level-info .level-badge,
    .moves-info .moves,
    .pairs-info .pairs {
      font-size: var(--text-xs);
    }
  }

  .cards-grid {
    gap: var(--spacing-xs);

    .card-front .card-item {
      font-size: var(--text-lg);
    }
  }
}
</style>