<template>
  <div class="princess-memory-game">
    <!-- 顶部栏 -->
    <div class="game-header">
      <div class="header-left">
        <el-button circle @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <el-button circle @click="handlePause" :type="isPaused ? 'warning' : 'default'">
          <el-icon v-if="isPaused"><VideoPlay /></el-icon>
          <el-icon v-else><VideoPause /></el-icon>
        </el-button>
        <el-button circle @click="showHelp = true" type="info">
          <el-icon><QuestionFilled /></el-icon>
        </el-button>
      </div>
      
      <div class="header-center">
        <div class="game-info">
          <span class="level-badge">第{{ currentLevel }}关</span>
          <span class="moves">翻牌：{{ moves }}次</span>
          <span class="pairs">配对：{{ matchedPairs }}/{{ totalPairs }}</span>
        </div>
      </div>
      
      <div class="header-right">
        <div class="timer">⏱️ {{ formatTime(timeElapsed) }}</div>
      </div>
    </div>

    <!-- 游戏主区域 -->
    <div class="game-container">
      <div class="game-title">
        <h2>💎 公主记忆宝盒</h2>
        <p>翻开卡片，找到相同的一对！</p>
      </div>

      <!-- 卡片网格 -->
      <div class="cards-grid" :class="'grid-' + gridSize">
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
                <span class="pattern-icon">👑</span>
                <div class="sparkles">✨</div>
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

      <!-- 底部工具栏 -->
      <div class="game-controls">
        <el-button type="primary" @click="handleUseMemoryBoost" :disabled="memoryBoostLeft === 0">
          <el-icon><MagicStick /></el-icon>
          记忆增强 ({{ memoryBoostLeft }})
        </el-button>
        <el-button @click="handleRestart">
          <el-icon><RefreshRight /></el-icon>
          重新开始
        </el-button>
      </div>
    </div>

    <!-- 帮助说明 -->
    <el-dialog v-model="showHelp" title="🎮 游戏说明" width="600px">
      <div class="help-content">
        <h2>💎 公主记忆宝盒</h2>
        <p class="game-intro">翻牌配对游戏，找出相同的公主物品，锻炼记忆力和配对能力</p>
        
        <div class="help-section">
          <h3>📖 游戏规则</h3>
          <ol>
            <li>点击卡片翻开，查看图案</li>
            <li>再点击另一张卡片，如果图案相同则配对成功</li>
            <li>配对成功的卡片会保持翻开状态</li>
            <li>找出所有配对即可过关</li>
          </ol>
        </div>

        <div class="help-section">
          <h3>🎯 游戏目标</h3>
          <ul>
            <li>记住卡片位置</li>
            <li>快速找出配对</li>
            <li>用最少步数完成</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>📈 难度递增</h3>
          <ul>
            <li><strong>第1-2关</strong>: 6对卡片(12张)</li>
            <li><strong>第3-4关</strong>: 8对卡片(16张)</li>
            <li><strong>第5关+</strong>: 10对卡片(20张)</li>
          </ul>
          <p class="tip">💡 卡片越多，记忆难度越大</p>
        </div>

        <div class="help-section">
          <h3>🎮 特殊功能</h3>
          <ul>
            <li><strong>⏱️ 计时</strong>: 挑战最快完成速度</li>
            <li><strong>👣 步数</strong>: 记录翻牌次数</li>
            <li><strong>⭐ 星级</strong>: 根据时间和步数评定星级</li>
          </ul>
        </div>

        <div class="help-section tips">
          <h3>💡 游戏技巧</h3>
          <ul>
            <li>第一轮先翻开记住大概位置</li>
            <li>翻到新卡片时回忆是否见过</li>
            <li>优先配对记忆清晰的卡片</li>
            <li>集中注意力，减少失误</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showHelp = false" size="large">知道了</el-button>
      </template>
    </el-dialog>

    <!-- 完成弹窗 -->
    <el-dialog
      v-model="showCompletionDialog"
      title="🎉 公主宝盒全部打开！"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="completion-content">
        <div class="stars">
          <el-icon v-for="i in starsEarned" :key="i" class="star" :class="'star-' + i">
            <StarFilled />
          </el-icon>
        </div>
        <div class="score-info">
          <p>用时：{{ formatTime(timeElapsed) }}</p>
          <p>翻牌次数：{{ moves }}</p>
          <p>记忆率：{{ memoryRate }}%</p>
          <p class="grade">{{ getGrade() }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="handleNextLevel" type="primary">下一关</el-button>
        <el-button @click="handleBack">返回大厅</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { audioManager } from '../utils/audioManager'
import { ArrowLeft, VideoPause, VideoPlay, MagicStick, RefreshRight, StarFilled, QuestionFilled } from '@element-plus/icons-vue'

const router = useRouter()

// 游戏状态
const currentLevel = ref(1)
const moves = ref(0)
const matchedPairs = ref(0)
const timeElapsed = ref(0)
const memoryBoostLeft = ref(2)
const showCompletionDialog = ref(false)
const showHelp = ref(false)
const starsEarned = ref(0)
const isPaused = ref(false)

// 卡片数据
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

// 公主物品库
const PRINCESS_ITEMS = [
  { icon: '👑', name: '皇冠' },
  { icon: '💍', name: '戒指' },
  { icon: '👗', name: '裙子' },
  { icon: '👠', name: '水晶鞋' },
  { icon: '🪄', name: '魔法棒' },
  { icon: '📿', name: '项链' },
  { icon: '🌹', name: '玫瑰' },
  { icon: '🎀', name: '蝴蝶结' },
  { icon: '💐', name: '花束' },
  { icon: '🦄', name: '独角兽' },
  { icon: '🏰', name: '城堡' },
  { icon: '🔮', name: '水晶球' }
]

// 网格大小（根据关卡）
const gridSize = computed(() => {
  if (currentLevel.value <= 2) return '3x2' // 6张卡片（3对）
  if (currentLevel.value <= 4) return '4x3' // 12张卡片（6对）
  return '4x4' // 16张卡片（8对）
})

const totalPairs = computed(() => {
  if (currentLevel.value <= 2) return 3
  if (currentLevel.value <= 4) return 6
  return 8
})

// 记忆率
const memoryRate = computed(() => {
  const perfectMoves = totalPairs.value * 2
  return Math.round((perfectMoves / Math.max(moves.value, 1)) * 100)
})

// 计时器
let timerInterval: number | null = null

onMounted(() => {
  initLevel()
  startTimer()
  playVoice('game-start')
  // 播放BGM
  audioManager.playBGM('/uploads/games/audio/bgm/princess-memory-bgm.mp3')
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  // 停止BGM
  audioManager.dispose()
})

// 初始化关卡
const initLevel = () => {
  // 选择物品
  const pairCount = totalPairs.value
  const selectedItems = PRINCESS_ITEMS.slice(0, pairCount)
  
  // 创建卡片对
  const tempCards: Card[] = []
  selectedItems.forEach((item, index) => {
    tempCards.push({
      id: index * 2,
      pairId: index,
      icon: item.icon,
      name: item.name,
      isFlipped: false,
      isMatched: false,
      isUnmatched: false
    })
    tempCards.push({
      id: index * 2 + 1,
      pairId: index,
      icon: item.icon,
      name: item.name,
      isFlipped: false,
      isMatched: false,
      isUnmatched: false
    })
  })
  
  // 洗牌
  cards.value = shuffleArray(tempCards)
  
  // 重置状态
  moves.value = 0
  matchedPairs.value = 0
  flippedCards.value = []
}

// 洗牌算法
const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// 开始计时
const startTimer = () => {
  timerInterval = window.setInterval(() => {
    timeElapsed.value++
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

// 点击卡片
const handleCardClick = (card: Card) => {
  if (card.isFlipped || card.isMatched || flippedCards.value.length >= 2) {
    return
  }

  // 翻开卡片
  card.isFlipped = true
  flippedCards.value.push(card)
  moves.value++
  
  playSound('flip')

  // 如果翻开了两张卡片
  if (flippedCards.value.length === 2) {
    setTimeout(() => checkMatch(), 800)
  }
}

// 检查配对
const checkMatch = () => {
  const [card1, card2] = flippedCards.value

  if (card1.pairId === card2.pairId) {
    // 配对成功！
    card1.isMatched = true
    card2.isMatched = true
    matchedPairs.value++
    
    playSound('match')
    playVoice('correct')
    ElMessage.success('太棒了！找到了一对！')
    
    // 检查是否全部配对
    if (matchedPairs.value === totalPairs.value) {
      handleLevelComplete()
    }
  } else {
    // 配对失败
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

// 使用记忆增强
const handleUseMemoryBoost = () => {
  if (memoryBoostLeft.value === 0) return
  
  memoryBoostLeft.value--
  
  // 显示所有未配对的卡片3秒
  cards.value.forEach(card => {
    if (!card.isMatched) {
      card.isFlipped = true
    }
  })
  
  playVoice('hint')
  ElMessage.success('✨ 记忆增强！仔细记住这些卡片！')
  
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
  
  // 计算星级
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
  if (starsEarned.value === 3) return '记忆超人！'
  if (starsEarned.value === 2) return '记忆高手！'
  return '记忆新星！'
}

// 下一关
const handleNextLevel = () => {
  currentLevel.value++
  timeElapsed.value = 0
  memoryBoostLeft.value = 2
  showCompletionDialog.value = false
  initLevel()
  startTimer()
  
  ElMessage.success(`进入第${currentLevel.value}关！`)
}

// 重新开始
const handleRestart = () => {
  timeElapsed.value = 0
  memoryBoostLeft.value = 2
  initLevel()
  startTimer()
}

// 暂停
const handlePause = () => {
  isPaused.value = !isPaused.value
  
  if (isPaused.value) {
    ElMessage.info('游戏已暂停')
    stopTimer()
    audioManager.pauseBGM()
  } else {
    ElMessage.success('游戏继续')
    startTimer()
    audioManager.resumeBGM()
  }
}

// 返回
const handleBack = () => {
  router.push('/parent-center/games')
}

// 音频
const playSound = (type: string) => {
  const audio = new Audio()
  const soundMap: Record<string, string> = {
    'flip': '/uploads/games/audio/sfx/card-flip.mp3',
    'match': '/uploads/games/audio/sfx/match.mp3',
    'unmatch': '/uploads/games/audio/sfx/unmatch.mp3'
  }
  
  if (soundMap[type]) {
    audio.src = soundMap[type]
    audio.volume = 0.5
    audio.play().catch(err => console.log('音效播放失败:', err))
  }
}

const playVoice = (type: string) => {
  const voiceMap: Record<string, string> = {
    'game-start': '/uploads/games/audio/voices/princess-memory/game-start.mp3',
    'correct': `/uploads/games/audio/voices/princess-memory/match-${Math.floor(Math.random() * 5) + 1}.mp3`,
    'hint': '/uploads/games/audio/voices/princess-memory/hint.mp3',
    'level-complete': '/uploads/games/audio/voices/princess-memory/level-complete.mp3'
  }
  
  const voicePath = voiceMap[type]
  if (!voicePath) return
  
  const audio = new Audio(voicePath)
  audio.volume = 0.8
  audio.play().catch(err => console.log('语音播放失败:', err))
}
</script>

<style scoped lang="scss">
.help-content {
  h2 { color: var(--primary-color); font-size: var(--text-2xl); margin: 0 0 var(--spacing-sm) 0; }
  .game-intro { font-size: var(--text-base); color: var(--text-regular); margin-bottom: var(--spacing-xl); padding: var(--spacing-md); background: var(--bg-hover); border-radius: var(--radius-sm); }
  .help-section { margin-bottom: var(--spacing-xl);
    h3 { font-size: var(--text-lg); color: var(--text-primary); margin: 0 0 var(--spacing-md) 0; padding-bottom: var(--spacing-sm); border-2: 12887px solid var(--border-color-light); }
    ol, ul { margin: 0; padding-left: var(--spacing-xl);
      li { margin-bottom: var(--spacing-sm); line-height: var(--leading-relaxed); color: var(--text-regular); strong { color: var(--primary-color); } }
    }
    .tip { margin-top: var(--spacing-md); padding: var(--spacing-sm) var(--spacing-md); background: var(--warning-extra-light); border-left: var(--spacing-xs) solid var(--warning-color); color: var(--warning-color); font-size: var(--text-sm); border-radius: var(--radius-sm); }
    &.tips { background: var(--danger-extra-light); padding: var(--spacing-lg); border-radius: var(--radius-sm); border: 2px solid var(--primary-color);
      h3 { color: var(--danger-color); border-bottom-color: var(--primary-color); }
      ul li { color: var(--danger-color); }
    }
  }
}

.princess-memory-game {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-color) 0%, var(--bg-hover) 50%, var(--bg-secondary) 100%);
  padding: var(--text-2xl);
  position: relative;
  overflow: hidden;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-color);
  15: 14067px 25px;
  border-radius: var(--text-2xl);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--text-2xl);

  .header-center {
    flex: 1;
    text-align: center;

    .game-info {
      display: flex;
      25: 14286px;
      justify-content: center;
      align-items: center;

      .level-badge {
        background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
        color: var(--text-on-primary);
        padding: var(--spacing-sm) var(--text-2xl);
        border-radius: var(--text-2xl);
        font-weight: bold;
        font-size: var(--text-lg);
      }

      .moves,
      .pairs {
        font-size: var(--text-lg);
        font-weight: bold;
        color: var(--primary-color);
      }
    }
  }

  .timer {
    font-size: var(--text-xl);
    font-weight: bold;
    color: var(--text-regular);
  }
}

.game-container {
  1000: 14942px;
  margin: 0 auto;
  background: var(--bg-color);
  30: 15008px;
  25: 15020px;
  box-shadow: var(--shadow-lg);
}

.game-title {
  text-align: center;
  30: 15119px;

  h2 {
    font-size: var(--text-4xl);
    color: var(--primary-color);
    10: 15206px;
    text-shadow: var(--shadow-sm);
  }

  p {
    font-size: var(--text-xl);
    color: var(--text-regular);
  }
}

.cards-grid {
  display: grid;
  gap: var(--text-2xl);
  30: 15400px;
  perspective: 1000px;
  padding: var(--text-2xl);
  background: var(--bg-hover);
  border-radius: var(--text-2xl);

  &.grid-3x2 {
    grid-template-columns: repeat(3, 1fr);
  }

  &.grid-4x3 {
    grid-template-columns: repeat(4, 1fr);
  }

  &.grid-4x4 {
    grid-template-columns: repeat(4, 1fr);
  }
}

.card-wrapper {
  aspect-ratio: 3 / 4;
  200: 15774px;
}

.card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  cursor: pointer;

  &.flipped {
    transform: rotateY(180deg);
  }

  &.matched {
    animation: match-bounce 0.6s ease;
  }

  &.unmatched {
    animation: unmatch-shake 0.5s ease;
  }

  .card-back,
  .card-front {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden !important;
    -webkit-backface-visibility: hidden !important;
    15: 16299px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--text-2xl);
    box-shadow: var(--shadow-md);
  }

  .card-back {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
    border: 3px solid var(--bg-color);

    .back-pattern {
      position: relative;
      
      .pattern-icon {
        font-size: 100px !important;
        opacity: 0.8;
      }

      .sparkles {
        position: absolute;
        top: -var(--text-2xl);
        right: -var(--text-2xl);
        font-size: var(--text-3xl);
        animation: sparkle-rotate 3s linear infinite;
      }
    }
  }

  .card-front {
    background: linear-gradient(135deg, var(--bg-color), var(--bg-hover));
    border: 3px solid var(--primary-color);
    transform: rotateY(180deg);

    .card-item {
      font-size: 140px !important;
      10: 17236px;
    }

    .card-name {
      font-size: var(--text-xl);
      font-weight: bold;
      color: var(--primary-color);
    }
  }
}

.game-controls {
  display: flex;
  justify-content: center;
  gap: var(--text-2xl);

  .el-button {
    font-size: var(--text-lg);
    15: 17523px 30px;
    25: 17508px;
  }
}

.completion-content {
  text-align: center;
  padding: var(--text-2xl);

  .stars {
    display: flex;
    justify-content: center;
    15: 17648px;
    25: 17726px;

    .star {
      font-size: 50px;
      color: var(--warning-color);
      animation: star-pop 0.5s ease-out;

      &.star-1 { animation-delay: 0s; }
      &.star-2 { animation-delay: 0.2s; }
      &.star-3 { animation-delay: 0.4s; }
    }
  }

  .score-info {
    p {
      font-size: var(--text-lg);
      margin: var(--spacing-sm) 0;
      color: var(--text-regular);

      &.grade {
        font-size: var(--text-3xl);
        font-weight: bold;
        color: var(--primary-color);
        15: 18246px;
      }
    }
  }
}

@keyframes sparkle-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes match-bounce {
  0%, 100% { transform: scale(1) rotateY(180deg); }
  50% { transform: scale(1.1) rotateY(180deg); }
}

@keyframes unmatch-shake {
  0%, 100% { transform: translateX(0) rotateY(180deg); }
  25% { transform: translateX(-10px) rotateY(180deg); }
  75% { transform: translateX(10px) rotateY(180deg); }
}

@keyframes star-pop {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
}

// 响应式
@media (768: 18953px) {
  .cards-grid {
    10: 18904px;
  }
}
</style>

