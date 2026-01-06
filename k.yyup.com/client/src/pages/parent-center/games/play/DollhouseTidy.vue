<template>
  <div class="dollhouse-tidy-game">
    <div class="game-header">
      <el-button circle @click="handleBack"><UnifiedIcon name="ArrowLeft" /></el-button>
      <el-button circle @click="handlePause" :type="isPaused ? 'warning' : 'default'">
        <UnifiedIcon name="default" />
        <UnifiedIcon name="default" />
      </el-button>
      <el-button circle @click="showHelp = true" type="info"><UnifiedIcon name="default" /></el-button>
      <div class="game-info">
        <span class="level">第{{ currentLevel }}关</span>
        <span class="score">得分：{{ score }}</span>
      </div>
      <div class="timer">⏱️ {{ formatTime(timeElapsed) }}</div>
    </div>

    <div class="game-container">
      <h2>🏠 娃娃屋整理大师</h2>
      <p>把物品拖到正确的房间！</p>

      <!-- 房间区域 -->
      <div class="rooms-container">
        <div v-for="room in activeRooms" :key="room.id" class="room" :style="{ borderColor: room.color }"
          @dragover.prevent @drop="handleDrop(room)" @dragenter="room.isOver = true" @dragleave="room.isOver = false"
          :class="{ over: room.isOver }">
          <div class="room-icon">{{ room.icon }}</div>
          <div class="room-name" :style="{ color: room.color }">{{ room.name }}</div>
          <div class="room-items">
            <span v-for="item in room.items" :key="item" class="placed-item">{{ item }}</span>
          </div>
        </div>
      </div>

      <!-- 待整理物品 -->
      <div class="items-area">
        <div class="items-label">待整理物品</div>
        <div class="items-list">
          <div v-for="item in unplacedItems" :key="item.id" class="drag-item" draggable="true"
            @dragstart="handleDragStart(item)">
            <span class="item-icon">{{ item.icon }}</span>
            <span class="item-name">{{ item.name }}</span>
          </div>
        </div>
      </div>

      <div class="game-controls">
        <el-button @click="handleRestart"><UnifiedIcon name="Refresh" />重新开始</el-button>
      </div>
    </div>

    <!-- 帮助说明 -->
    <el-dialog v-model="showHelp" title="🎮 游戏说明" class="responsive-dialog dialog-large">
      <div class="help-content">
        <h2>🏠 娃娃屋整理大师</h2>
        <p class="game-intro">将散乱的物品拖拽到正确的房间，培养分类思维和空间概念</p>
        
        <div class="help-section">
          <h3>📖 游戏规则</h3>
          <ol>
            <li>娃娃屋有多个房间（卧室、厨房、浴室等）</li>
            <li>屏幕下方有各种散乱的物品</li>
            <li>将每个物品拖拽到它应该在的房间</li>
            <li>所有物品放对位置即可过关</li>
          </ol>
        </div>

        <div class="help-section">
          <h3>🎯 游戏目标</h3>
          <ul>
            <li>识别物品用途</li>
            <li>正确分类到各个房间</li>
            <li>培养整理习惯</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>📈 难度递增</h3>
          <ul>
            <li><strong>第1-2关</strong>: 3个房间，9个物品</li>
            <li><strong>第3-4关</strong>: 4个房间，12个物品</li>
            <li><strong>第5关+</strong>: 5个房间，15个物品</li>
          </ul>
          <p class="tip">💡 房间和物品越多，分类越复杂</p>
        </div>

        <div class="help-section">
          <h3>🎮 房间说明</h3>
          <ul>
            <li><strong>🛏️ 卧室</strong>: 睡觉用品、衣物、玩具</li>
            <li><strong>🍳 厨房</strong>: 厨具、餐具、食材</li>
            <li><strong>🚿 浴室</strong>: 洗漱用品、毛巾</li>
            <li><strong>📺 客厅</strong>: 娱乐用品、书籍</li>
          </ul>
        </div>

        <div class="help-section tips">
          <h3>💡 游戏技巧</h3>
          <ul>
            <li>先观察有哪些房间</li>
            <li>思考每个物品通常在哪里使用</li>
            <li>卧室放睡觉用品，厨房放厨具</li>
            <li>不确定时仔细想想物品的用途</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showHelp = false" size="large">知道了</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showCompletionDialog" title="🎉 整理完成！" class="responsive-dialog dialog-small">
      <div class="completion">
        <div class="stars">
          <UnifiedIcon name="default" />
        </div>
        <p>用时：{{ formatTime(timeElapsed) }}</p>
        <p>准确率：{{ accuracy }}%</p>
      </div>
      <template #footer>
        <el-button @click="handleNextLevel" type="primary">下一关</el-button>
        <el-button @click="handleBack">返回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, VideoPause, VideoPlay, RefreshRight, StarFilled, QuestionFilled } from '@element-plus/icons-vue'
import { audioManager } from '../utils/audioManager'
import { buildBGMUrl, buildSFXUrl, buildVoiceUrl } from '@/utils/oss-url-builder'

const router = useRouter()
const currentLevel = ref(1)
const score = ref(0)
const timeElapsed = ref(0)
const correctPlacements = ref(0)
const wrongPlacements = ref(0)
const showCompletionDialog = ref(false)
const showHelp = ref(false)
const starsEarned = ref(0)
const isPaused = ref(false)
const draggedItem = ref<any>(null)

const ROOMS = [
  { id: 1, name: '卧室', icon: '🛏️', color: 'var(--game-bedroom-primary)', items: [] as string[], isOver: false },
  { id: 2, name: '厨房', icon: '🍳', color: 'var(--game-kitchen-primary)', items: [] as string[], isOver: false },
  { id: 3, name: '客厅', icon: '🛋️', color: 'var(--game-living-room-primary)', items: [] as string[], isOver: false },
  { id: 4, name: '浴室', icon: '🛁', color: 'var(--game-bathroom-primary)', items: [] as string[], isOver: false }
]

const ALL_ITEMS = [
  { id: 1, icon: '🛏️', name: '床', room: '卧室' },
  { id: 2, icon: '👗', name: '衣服', room: '卧室' },
  { id: 3, icon: '🍳', name: '锅', room: '厨房' },
  { id: 4, icon: '🥄', name: '勺子', room: '厨房' },
  { id: 5, icon: '🛋️', name: '沙发', room: '客厅' },
  { id: 6, icon: '📺', name: '电视', room: '客厅' },
  { id: 7, icon: '🛁', name: '浴缸', room: '浴室' },
  { id: 8, icon: '🧴', name: '洗发水', room: '浴室' }
]

const activeRooms = computed(() => {
  if (currentLevel.value <= 2) return ROOMS.slice(0, 2)
  if (currentLevel.value <= 4) return ROOMS.slice(0, 3)
  return ROOMS
})

const unplacedItems = ref(ALL_ITEMS.slice(0, 8))

const accuracy = computed(() => {
  const total = correctPlacements.value + wrongPlacements.value
  return total > 0 ? Math.round((correctPlacements.value / total) * 100) : 100
})

let timerInterval: number | null = null

onMounted(() => {
  startTimer()
  // 播放BGM和开始语音
  audioManager.playBGM(buildBGMUrl('dollhouse-bgm.mp3'))
  playVoice('game-start')
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  // 停止BGM
  audioManager.dispose()
})

const startTimer = () => {
  timerInterval = window.setInterval(() => timeElapsed.value++, 1000)
}

const formatTime = (s: number) => {
  const m = Math.floor(s / 60)
  return `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
}

const handleDragStart = (item: any) => {
  draggedItem.value = item
}

const handleDrop = (room: any) => {
  if (!draggedItem.value) return
  
  const item = draggedItem.value
  
  if (item.room === room.name) {
    correctPlacements.value++
    score.value += 100
    room.items.push(item.icon)
    unplacedItems.value = unplacedItems.value.filter(i => i.id !== item.id)
    
    // 播放正确音效
    playSound('correct')
    ElMessage.success(`✅ ${item.name}应该放在${room.name}！`)
    
    if (unplacedItems.value.length === 0) {
      handleLevelComplete()
    }
  } else {
    wrongPlacements.value++
    // 播放错误音效
    playSound('wrong')
    ElMessage.error('房间不对哦！')
  }
  
  draggedItem.value = null
  room.isOver = false
}

const handleLevelComplete = () => {
  if (timerInterval) clearInterval(timerInterval)
  starsEarned.value = accuracy.value === 100 ? 3 : (accuracy.value >= 85 ? 2 : 1)
  showCompletionDialog.value = true
  
  // 播放完成语音
  playVoice('level-complete')
}

const handleNextLevel = () => {
  currentLevel.value++
  showCompletionDialog.value = false
  unplacedItems.value = ALL_ITEMS.slice(0, 8)
  ROOMS.forEach(r => r.items = [])
  timeElapsed.value = 0
  startTimer()
}

const handleRestart = () => {
  score.value = 0
  correctPlacements.value = 0
  wrongPlacements.value = 0
  unplacedItems.value = ALL_ITEMS.slice(0, 8)
  ROOMS.forEach(r => r.items = [])
  timeElapsed.value = 0
}

// 暂停
const handlePause = () => {
  isPaused.value = !isPaused.value
  
  if (isPaused.value) {
    ElMessage.info('游戏已暂停')
    audioManager.pauseBGM()
  } else {
    ElMessage.success('游戏继续')
    audioManager.resumeBGM()
  }
}

const handleBack = () => router.push('/parent-center/games')

// 音效播放
const playSound = (type: string) => {
  const audio = new Audio()
  const soundMap: Record<string, string> = {
    'correct': buildSFXUrl('correct.mp3'),
    'wrong': buildSFXUrl('wrong.mp3'),
    'success': buildSFXUrl('success.mp3')
  }

  if (soundMap[type]) {
    audio.src = soundMap[type]
    audio.volume = 0.7
    audio.play().catch(() => {})
  }
}

// 语音播放
const playVoice = (type: string) => {
  const audio = new Audio()
  const voiceMap: Record<string, string> = {
    'game-start': buildVoiceUrl('game-start.mp3', 'dollhouse'),
    'correct': buildVoiceUrl('correct.mp3', 'dollhouse'),
    'level-complete': buildVoiceUrl('level-complete.mp3', 'dollhouse')
  }

  const voicePath = voiceMap[type]
  if (voicePath) {
    audio.src = voicePath
    audio.volume = 1.0
    audio.play().catch(() => {})
  }
}
</script>

<style scoped lang="scss">
.help-content {
  h2 { color: var(--game-text-accent); font-size: var(--text-3xl); margin: 0 0 var(--spacing-sm) 0; }
  .game-intro { font-size: var(--text-lg); color: var(--text-regular); margin-bottom: var(--text-3xl); padding: var(--text-sm); background: var(--bg-hover); border-radius: var(--spacing-sm); }
  .help-section { margin-bottom: var(--text-3xl);
    h3 { font-size: var(--text-xl); color: var(--text-primary); margin: 0 0 var(--text-sm) 0; padding-bottom: var(--spacing-sm); border-bottom: var(--spacing-xs) solid var(--border-color); }
    ol, ul { margin: 0; padding-left: var(--text-3xl);
      li { margin-bottom: var(--spacing-sm); line-height: 1.6; color: var(--text-regular); strong { color: var(--game-text-accent); } }
    }
    .tip { margin-top: var(--text-sm); padding: var(--spacing-sm) var(--text-sm); background: var(--warning-extra-light); border-left: var(--spacing-xs) solid var(--game-accent-orange); color: var(--game-accent-orange-dark); font-size: var(--text-base); border-radius: var(--spacing-xs); }
    &.tips { background: var(--game-bg-tip); padding: var(--text-lg); border-radius: var(--spacing-sm); border: var(--spacing-xs) solid var(--game-text-accent);
      h3 { color: var(--game-text-primary); border-bottom-color: var(--game-text-accent); }
      ul li { color: var(--game-text-secondary); }
    }
  }
}

.dollhouse-tidy-game {
  min-height: 100vh;
  background: var(--game-bg-primary);
  padding: var(--text-2xl);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  // malformed CSS removed
  border-radius: var(--text-2xl);
  margin-bottom: var(--text-2xl);

  .game-info {
    display: flex;
    gap: var(--text-2xl);

    .level {
      background: linear-gradient(135deg, var(--game-primary-pink), var(--game-primary-pink-dark));
      color: var(--text-on-primary);
      padding: var(--spacing-sm) var(--text-2xl);
      border-radius: var(--text-2xl);
      font-weight: bold;
    }

    .score {
      font-size: var(--text-xl);
      font-weight: bold;
      color: var(--game-primary-pink);
    }
  }
}

.game-container {
  // malformed CSS removed
  margin: 0 auto;
  text-align: center;

  h2 {
    font-size: var(--text-4xl);
    color: var(--game-primary-pink);
  // malformed CSS removed
  }

  p {
    font-size: var(--text-xl);
    color: var(--text-secondary);
  // malformed CSS removed
  }
}

.rooms-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--text-2xl);
  // malformed CSS removed
}

.room {
  background: white;
  // malformed CSS removed
  border-radius: var(--text-2xl);
  border: var(--spacing-xs) dashed var(--game-border-light);
  // malformed CSS removed
  transition: all var(--game-transition-normal) ease;

  &.over {
    transform: scale(1.05);
    box-shadow: 0 var(--spacing-sm) var(--text-2xl) var(--color-primary-500);
  }

  .room-icon {
    font-size: 60px;
  // malformed CSS removed
  }

  .room-name {
    font-size: var(--text-2xl);
    font-weight: bold;
  // malformed CSS removed
  }

  .room-items {
    display: flex;
    flex-wrap: wrap;
  // malformed CSS removed
    justify-content: center;

    .placed-item {
      font-size: var(--text-5xl);
    }
  }
}

.items-area {
  background: var(--color-primary-500);
  // malformed CSS removed
  border-radius: var(--text-2xl);
  margin-bottom: var(--text-2xl);

  .items-label {
    font-size: var(--text-2xl);
    font-weight: bold;
    color: var(--game-primary-pink);
    margin-bottom: var(--text-2xl);
  }

  .items-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  // malformed CSS removed
  }

  .drag-item {
    background: var(--game-bg-secondary);
    padding: var(--text-2xl);
  // malformed CSS removed
    border: var(--border-width-sm) solid var(--game-primary-pink);
    cursor: grab;
    transition: all var(--game-transition-normal) ease;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 var(--spacing-xs) 15px var(--color-primary-500);
    }

    .item-icon {
      font-size: 50px;
      display: block;
      margin-bottom: var(--spacing-sm);
    }

    .item-name {
      font-size: var(--text-base);
      color: var(--text-secondary);
    }
  }
}

.game-controls {
  display: flex;
  justify-content: center;
  gap: var(--text-2xl);
}

.completion {
  text-align: center;
  padding: var(--text-2xl);

  .stars {
    display: flex;
    justify-content: center;
  // malformed CSS removed
    margin-bottom: var(--text-2xl);

    .star {
      font-size: 50px;
      color: var(--game-star-gold);
    }
  }
}

/* 响应式对话框样式 */
.responsive-dialog {
  @media (max-width: var(--breakpoint-md)) {
    width: 95% !important;
    max-width: none !important;
    margin: 0 auto !important;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    &.dialog-large { width: 85% !important; max-width: 100%; max-width: 100%; max-width: 500px !important; }
    &.dialog-medium { width: 80% !important; max-width: 100%; max-width: 450px !important; }
    &.dialog-small { width: 75% !important; max-width: 100%; max-width: 380px !important; }
  }

  @media (min-width: 1025px) {
    &.dialog-large { width: 100%; max-width: 600px !important; }
    &.dialog-medium { width: 500px !important; }
    &.dialog-small { width: 100%; max-width: 400px !important; }
  }
}
</style>

