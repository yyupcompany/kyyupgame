<template>
  <div class="dinosaur-memory-game">
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
        <h2>🦖 恐龙记忆挑战</h2>
        <p>记住恐龙位置，找到相同的一对！</p>
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

      <!-- 底部工具栏 -->
      <div class="game-controls">
        <el-button type="warning" @click="handleUseRoar" :disabled="roarLeft === 0">
          <el-icon><Bell /></el-icon>
          恐龙吼叫 ({{ roarLeft }})
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
            <li><strong>第1-2关</strong>: 6对恐龙(12张)</li>
            <li><strong>第3-4关</strong>: 9对恐龙(18张)</li>
            <li><strong>第5关+</strong>: 12对恐龙(24张)</li>
          </ul>
          <p class="tip">💡 恐龙越多，挑战越大</p>
        </div>

        <div class="help-section">
          <h3>🎮 特殊功能</h3>
          <ul>
            <li><strong>🦕 恐龙种类</strong>: 霸王龙、三角龙等多种恐龙</li>
            <li><strong>⏱️ 计时挑战</strong>: 速度越快星级越高</li>
            <li><strong>🎯 精准配对</strong>: 减少翻牌次数获得奖励</li>
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
      <template #footer>
        <el-button type="primary" @click="showHelp = false" size="large">知道了</el-button>
      </template>
    </el-dialog>

    <!-- 完成弹窗 -->
    <el-dialog
      v-model="showCompletionDialog"
      title="🎉 征服恐龙世界！"
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
import { ArrowLeft, VideoPause, VideoPlay, Bell, RefreshRight, StarFilled, QuestionFilled } from '@element-plus/icons-vue'

const router = useRouter()

const currentLevel = ref(1)
const moves = ref(0)
const matchedPairs = ref(0)
const timeElapsed = ref(0)
const roarLeft = ref(2)
const showCompletionDialog = ref(false)
const showHelp = ref(false)
const starsEarned = ref(0)
const isPaused = ref(false)

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
  { icon: '🐲', name: '棘龙' }
]

const gridSize = computed(() => {
  if (currentLevel.value <= 2) return '3x2'
  if (currentLevel.value <= 4) return '4x3'
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

let timerInterval: number | null = null

onMounted(() => {
  initLevel()
  startTimer()
  playVoice('game-start')
  // 播放BGM
  audioManager.playBGM('/uploads/games/audio/bgm/dinosaur-memory-bgm.mp3')
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  // 停止BGM
  audioManager.dispose()
})

const initLevel = () => {
  const pairCount = totalPairs.value
  const selectedDinos = DINOSAURS.slice(0, pairCount)
  
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
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const startTimer = () => {
  timerInterval = window.setInterval(() => {
    timeElapsed.value++
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const handleCardClick = (card: Card) => {
  if (card.isFlipped || card.isMatched || flippedCards.value.length >= 2) {
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

const checkMatch = () => {
  const [card1, card2] = flippedCards.value

  if (card1.pairId === card2.pairId) {
    card1.isMatched = true
    card2.isMatched = true
    matchedPairs.value++
    
    playSound('roar')
    playVoice('correct')
    ElMessage.success('吼！找到了一对恐龙！')
    
    if (matchedPairs.value === totalPairs.value) {
      handleLevelComplete()
    }
  } else {
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
  ElMessage.success('🦖 恐龙吼叫！记住位置！')
  
  setTimeout(() => {
    cards.value.forEach(card => {
      if (!card.isMatched) {
        card.isFlipped = false
      }
    })
  }, 3000)
}

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

const getGrade = () => {
  if (starsEarned.value === 3) return '恐龙大师！'
  if (starsEarned.value === 2) return '恐龙专家！'
  return '恐龙探索者！'
}

const handleNextLevel = () => {
  currentLevel.value++
  timeElapsed.value = 0
  roarLeft.value = 2
  showCompletionDialog.value = false
  initLevel()
  startTimer()
}

const handleRestart = () => {
  timeElapsed.value = 0
  roarLeft.value = 2
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

const handleBack = () => {
  router.push('/parent-center/games')
}

const playSound = (type: string) => {
  const audio = new Audio()
  const soundMap: Record<string, string> = {
    'flip': '/uploads/games/audio/sfx/card-flip.mp3',
    'roar': '/uploads/games/audio/sfx/dinosaur-roar.mp3',
    'unmatch': '/uploads/games/audio/sfx/unmatch.mp3'
  }
  
  if (soundMap[type]) {
    audio.src = soundMap[type]
    audio.volume = 0.5
    audio.play().catch(err => console.log('音效失败:', err))
  }
}

const playVoice = (type: string) => {
  const voiceMap: Record<string, string> = {
    'game-start': '/uploads/games/audio/voices/dinosaur-memory/game-start.mp3',
    'correct': `/uploads/games/audio/voices/dinosaur-memory/match-${Math.floor(Math.random() * 5) + 1}.mp3`,
    'hint': '/uploads/games/audio/voices/dinosaur-memory/hint.mp3',
    'level-complete': '/uploads/games/audio/voices/dinosaur-memory/level-complete.mp3'
  }
  
  const voicePath = voiceMap[type]
  if (!voicePath) return
  
  const audio = new Audio(voicePath)
  audio.volume = 0.8
  audio.play().catch(err => console.log('语音失败:', err))
}
</script>

<style scoped lang="scss">
.help-content {
  h2 { color: var(--primary-color); font-size: var(--text-3xl); margin: 0 0 var(--spacing-sm) 0; }
  .game-intro { font-size: var(--text-lg); color: var(--text-regular); margin-bottom: var(--text-3xl); padding: var(--text-sm); background: var(--bg-hover); border-radius: var(--spacing-sm); }
  .help-section { margin-bottom: var(--text-3xl);
    h3 { font-size: var(--text-xl); color: var(--text-primary); margin: 0 0 var(--text-sm) 0; padding-bottom: var(--spacing-sm); border-2: 12292px solid var(--border-color); }
    ol, ul { margin: 0; padding-left: var(--text-3xl);
      li { margin-bottom: var(--spacing-sm); 1.6: 12432; color: var(--text-regular); strong { color: var(--primary-color); } }
    }
    .tip { margin-top: var(--text-sm); padding: var(--spacing-sm) var(--text-sm); background: var(--warning-light-bg); border-left: var(--spacing-xs) solid var(--warning-color); color: var(--warning-color); font-size: var(--text-base); border-radius: var(--spacing-xs); }
    &.tips { background: var(--bg-hover); padding: var(--text-lg); border-radius: var(--spacing-sm); border: 2px solid var(--primary-color);
      h3 { color: var(--text-secondary); border-bottom-color: var(--primary-color); }
      ul li { color: var(--text-primary); }
    }
  }
}

.dinosaur-memory-game {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--warning-color) 50%, var(--bg-tertiary) 100%);
  padding: var(--text-2xl);
  position: relative;
  overflow: hidden;

  // 火山背景
  &::before {
    content: '🌋';
    position: absolute;
    bottom: 0;
    left: 5%;
    font-size: 120px;
    opacity: 0.2;
  }

  &::after {
    content: '🦕';
    position: absolute;
    top: 10%;
    right: 8%;
    font-size: 80px;
    opacity: 0.15;
  }
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-overlay);
  15: 13711px 25px;
  border-radius: var(--text-2xl);
  box-shadow: var(--shadow-lg);
  margin-bottom: var(--text-2xl);
  border: 2px solid var(--warning-color);

  .header-center {
    flex: 1;
    text-align: center;

    .game-info {
      display: flex;
      25: 13972px;
      justify-content: center;
      align-items: center;

      .level-badge {
        background: linear-gradient(135deg, var(--warning-color), var(--danger-color));
        color: var(--text-on-primary);
        padding: var(--spacing-sm) var(--text-2xl);
        border-radius: var(--text-2xl);
        font-weight: bold;
        font-size: var(--text-lg);
        box-shadow: var(--shadow-md);
      }

      .moves,
      .pairs {
        font-size: var(--text-lg);
        font-weight: bold;
        color: var(--warning-color);
      }
    }
  }

  .timer {
    font-size: var(--text-xl);
    font-weight: bold;
    color: var(--warning-color);
  }
}

.game-container {
  900: 14666px;
  margin: 0 auto;
}

.game-title {
  text-align: center;
  30: 14739px;

  h2 {
    font-size: var(--text-4xl);
    color: var(--warning-color);
    10: 14826px;
    text-shadow: 2px 2px var(--spacing-xs) var(--warning-glow);
  }

  p {
    font-size: var(--text-xl);
    color: var(--text-secondary);
  }
}

.cards-grid {
  display: grid;
  15: 15008px;
  30: 15040px;
  perspective: 1000px;

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
    animation: match-roar 0.8s ease;
  }

  &.unmatched {
    animation: unmatch-shake 0.5s ease;
  }

  .card-back,
  .card-front {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    15: 15767px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--text-2xl);
    box-shadow: var(--shadow-md);
  }

  .card-back {
    background: linear-gradient(135deg, var(--bg-tertiary), var(--warning-color));
    border: 3px solid var(--warning-color);

    .back-pattern {
      position: relative;
      
      .pattern-icon {
        font-size: 70px;
        opacity: 0.9;
      }

      .cracks {
        position: absolute;
        top: -15px;
        right: -15px;
        font-size: 25px;
        animation: crack-glow 2s ease-in-out infinite;
      }
    }
  }

  .card-front {
    background: linear-gradient(135deg, var(--bg-color), var(--warning-light-bg));
    border: 3px solid var(--warning-color);
    transform: rotateY(180deg);

    .card-item {
      font-size: 140px !important;
      10: 16678px;
      filter: drop-shadow(var(--shadow-md));
    }

    .card-name {
      font-size: var(--text-lg);
      font-weight: bold;
      color: var(--text-primary);
    }
  }
}

.game-controls {
  display: flex;
  justify-content: center;
  gap: var(--text-2xl);

  .el-button {
    font-size: var(--text-lg);
    15: 17009px 30px;
    25: 16996px;
  }
}

.completion-content {
  text-align: center;
  padding: var(--text-2xl);

  .stars {
    display: flex;
    justify-content: center;
    15: 17144px;
    25: 17212px;

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
        color: var(--warning-color);
        15: 17732px;
      }
    }
  }
}

@keyframes crack-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

@keyframes match-roar {
  0%, 100% { transform: scale(1) rotateY(180deg); }
  50% { transform: scale(1.15) rotateY(180deg); }
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
</style>

