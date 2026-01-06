<template>
  <div class="robot-factory-game">
    <div class="game-header">
      <el-button circle @click="handleBack"><el-icon><ArrowLeft /></el-icon></el-button>
      <el-button circle @click="handlePause" :type="isPaused ? 'warning' : 'default'">
        <el-icon v-if="isPaused"><VideoPlay /></el-icon>
        <el-icon v-else><VideoPause /></el-icon>
      </el-button>
      <el-button circle @click="showHelp = true" type="info"><el-icon><QuestionFilled /></el-icon></el-button>
      <div class="game-info">
        <span class="level">第{{ currentLevel }}关</span>
        <span class="progress">进度：{{ placedParts }}/{{ totalParts }}</span>
      </div>
      <div class="timer">⏱️ {{ formatTime(timeElapsed) }}</div>
    </div>

    <div class="game-container">
      <h2>🤖 机器人工厂</h2>
      <p>按照设计图组装机器人！</p>

      <!-- 设计图 -->
      <div class="blueprint">
        <h3>📋 设计图</h3>
        <div class="blueprint-robot">
          <div class="part-slot head" :class="{ filled: parts.head.placed }">
            <span v-if="!parts.head.placed">🔘</span>
            <span v-else>{{ parts.head.icon }}</span>
          </div>
          <div class="part-slot body" :class="{ filled: parts.body.placed }">
            <span v-if="!parts.body.placed">🔲</span>
            <span v-else>{{ parts.body.icon }}</span>
          </div>
          <div class="part-slot arms" :class="{ filled: parts.arms.placed }">
            <span v-if="!parts.arms.placed">🔗</span>
            <span v-else>{{ parts.arms.icon }}</span>
          </div>
          <div class="part-slot legs" :class="{ filled: parts.legs.placed }">
            <span v-if="!parts.legs.placed">🔩</span>
            <span v-else>{{ parts.legs.icon }}</span>
          </div>
        </div>
      </div>

      <!-- 零件区 -->
      <div class="parts-area">
        <div class="parts-label">可用零件</div>
        <div class="parts-list">
          <div v-for="part in availableParts" :key="part.id" class="part-item" draggable="true"
            @dragstart="handleDragStart(part)" @click="handlePartClick(part)">
            <span class="part-icon">{{ part.icon }}</span>
            <span class="part-name">{{ part.name }}</span>
          </div>
        </div>
      </div>

      <div class="game-controls">
        <el-button @click="handleRestart"><el-icon><RefreshRight /></el-icon>重新开始</el-button>
      </div>
    </div>

    <!-- 帮助说明 -->
    <el-dialog v-model="showHelp" title="🎮 游戏说明" width="600px">
      <div class="help-content">
        <h2>🤖 机器人工厂</h2>
        <p class="game-intro">按照设计图纸组装机器人，培养逻辑思维和按序操作能力</p>
        
        <div class="help-section">
          <h3>📖 游戏规则</h3>
          <ol>
            <li>查看设计图纸，了解机器人的正确组装顺序</li>
            <li>从零件区选择正确的零件</li>
            <li>按照从下到上、从大到小的顺序组装</li>
            <li>所有零件装对位置即可过关</li>
          </ol>
        </div>

        <div class="help-section">
          <h3>🎯 游戏目标</h3>
          <ul>
            <li>理解组装顺序</li>
            <li>选择正确零件</li>
            <li>完成机器人组装</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>📈 难度递增</h3>
          <ul>
            <li><strong>第1-2关</strong>: 3个零件，简单机器人</li>
            <li><strong>第3-4关</strong>: 5个零件，中等复杂度</li>
            <li><strong>第5关+</strong>: 7个零件，复杂机器人</li>
          </ul>
          <p class="tip">💡 零件越多，组装越复杂</p>
        </div>

        <div class="help-section">
          <h3>🎮 组装顺序</h3>
          <ul>
            <li><strong>1. 底座</strong>: 机器人的支撑部分</li>
            <li><strong>2. 身体</strong>: 机器人的主体</li>
            <li><strong>3. 手臂</strong>: 机器人的操作部分</li>
            <li><strong>4. 头部</strong>: 机器人的控制中心</li>
          </ul>
        </div>

        <div class="help-section tips">
          <h3>💡 游戏技巧</h3>
          <ul>
            <li>仔细对比设计图和零件</li>
            <li>先从底部基座开始</li>
            <li>注意零件的形状和接口</li>
            <li>装错了可以重新选择</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showHelp = false" size="large">知道了</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showCompletionDialog" title="🎉 机器人组装完成！" width="400px">
      <div class="completion">
        <div class="stars">
          <el-icon v-for="i in starsEarned" :key="i" class="star"><StarFilled /></el-icon>
        </div>
        <p>用时：{{ formatTime(timeElapsed) }}</p>
        <p class="grade">{{ getGrade() }}</p>
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
import { audioManager } from '../utils/audioManager'
import { ArrowLeft, VideoPause, VideoPlay, RefreshRight, StarFilled, QuestionFilled } from '@element-plus/icons-vue'

const router = useRouter()
const currentLevel = ref(1)
const timeElapsed = ref(0)
const placedParts = ref(0)
const showCompletionDialog = ref(false)
const showHelp = ref(false)
const starsEarned = ref(0)
const isPaused = ref(false)
const selectedPart = ref<any>(null)

const parts = ref({
  head: { icon: '🔴', name: '头部', placed: false },
  body: { icon: '🟦', name: '躯干', placed: false },
  arms: { icon: '🔵', name: '手臂', placed: false },
  legs: { icon: '⬛', name: '腿部', placed: false }
})

const availableParts = computed(() => {
  return Object.entries(parts.value)
    .filter(([_, part]) => !part.placed)
    .map(([key, part], index) => ({ id: key, ...part }))
})

const totalParts = computed(() => Object.keys(parts.value).length)

let timerInterval: number | null = null

onMounted(() => {
  startTimer()
  // 播放BGM和开始语音
  audioManager.playBGM('/uploads/games/audio/bgm/robot-factory-bgm.mp3')
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
  return `${m}:${(s % 60).toString().padStart(2, '0')}`
}

const handleDragStart = (part: any) => {
  selectedPart.value = part
}

const handlePartClick = (part: any) => {
  const partKey = part.id as keyof typeof parts.value
  parts.value[partKey].placed = true
  placedParts.value++
  
  // 播放正确音效
  playSound('correct')
  ElMessage.success(`✅ ${part.name}安装成功！`)
  
  if (placedParts.value === totalParts.value) {
    handleLevelComplete()
  }
}

const handleLevelComplete = () => {
  if (timerInterval) clearInterval(timerInterval)
  starsEarned.value = timeElapsed.value < 30 ? 3 : (timeElapsed.value < 60 ? 2 : 1)
  showCompletionDialog.value = true
  
  // 播放完成语音
  playVoice('level-complete')
}

const getGrade = () => {
  if (starsEarned.value === 3) return '天才工程师！'
  if (starsEarned.value === 2) return '优秀工程师！'
  return '工程师！'
}

const handleNextLevel = () => {
  currentLevel.value++
  showCompletionDialog.value = false
  placedParts.value = 0
  Object.values(parts.value).forEach(p => p.placed = false)
  timeElapsed.value = 0
}

const handleRestart = () => {
  placedParts.value = 0
  Object.values(parts.value).forEach(p => p.placed = false)
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
    'correct': '/uploads/games/audio/sfx/correct.mp3',
    'wrong': '/uploads/games/audio/sfx/wrong.mp3',
    'success': '/uploads/games/audio/sfx/success.mp3'
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
    'game-start': '/uploads/games/audio/voices/robot-factory/game-start.mp3',
    'correct': '/uploads/games/audio/voices/robot-factory/correct.mp3',
    'level-complete': '/uploads/games/audio/voices/robot-factory/level-complete.mp3'
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
  h2 { color: var(--info-color); font-size: var(--text-3xl); margin: 0 0 var(--spacing-sm) 0; }
  .game-intro { font-size: var(--text-lg); color: var(--text-regular); margin-bottom: var(--text-3xl); padding: var(--text-sm); background: var(--bg-hover); border-radius: var(--spacing-sm); }
  .help-section { margin-bottom: var(--text-3xl);
    h3 { font-size: var(--text-xl); color: var(--text-primary); margin: 0 0 var(--text-sm) 0; padding-bottom: var(--spacing-sm); border-2: 9121px solid var(--border-color); }
    ol, ul { margin: 0; padding-left: var(--text-3xl);
      li { margin-bottom: var(--spacing-sm); 1.6: 9260; color: var(--text-regular); strong { color: var(--info-color); } }
    }
    .tip { margin-top: var(--text-sm); padding: var(--spacing-sm) var(--text-sm); background: var(--warning-light-bg); border-left: var(--spacing-xs) solid var(--warning-color); color: var(--warning-color); font-size: var(--text-base); border-radius: var(--spacing-xs); }
    &.tips { background: var(--info-light-bg); padding: var(--text-lg); border-radius: var(--spacing-sm); border: 2px solid var(--info-color);
      h3 { color: var(--text-secondary); border-bottom-color: var(--info-color); }
      ul li { color: var(--bg-primary); }
    }
  }
}

.robot-factory-game {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%);
  padding: var(--text-2xl);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-overlay);
  15: 10190px 25px;
  border-radius: var(--text-2xl);
  margin-bottom: var(--text-2xl);
  border: 2px solid var(--info-color);

  .game-info {
    display: flex;
    gap: var(--text-2xl);
    
    .level {
      background: linear-gradient(135deg, var(--info-color), var(--info-color));
      color: var(--text-on-primary);
      padding: var(--spacing-sm) var(--text-2xl);
      border-radius: var(--text-2xl);
      font-weight: bold;
    }

    .progress {
      font-size: var(--text-xl);
      font-weight: bold;
      color: var(--info-color);
    }
  }

  .timer {
    color: var(--info-color);
    font-weight: bold;
  }
}

.game-container {
  900: 10842px;
  margin: 0 auto;
  text-align: center;

  h2 {
    font-size: var(--text-4xl);
    color: var(--info-color);
    text-shadow: 0 0 var(--text-2xl) var(--info-glow);
  }

  p {
    font-size: var(--text-xl);
    color: var(--text-placeholder);
    30: 11092px;
  }
}

.blueprint {
  background: var(--info-light-bg);
  30: 11171px;
  border-radius: var(--text-2xl);
  border: 2px dashed var(--info-color);
  40: 11262px;

  h3 {
    color: var(--info-color);
    margin-bottom: var(--text-2xl);
  }

  .blueprint-robot {
    display: flex;
    flex-direction: column;
    align-items: center;
    10: 11437px;

    .part-slot {
      100: 11498px;
      100: 11518px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px dashed var(--border-color);
      15: 11637px;
      font-size: 60px;
      transition: all 0.3s ease;

      &.filled {
        border-color: var(--info-color);
        background: var(--info-light-bg);
        animation: part-glow 1s ease;
      }
    }
  }
}

.parts-area {
  background: var(--bg-overlay);
  30: 11945px;
  border-radius: var(--text-2xl);
  margin-bottom: var(--text-2xl);

  .parts-label {
    color: var(--info-color);
    font-size: var(--text-2xl);
    font-weight: bold;
    margin-bottom: var(--text-2xl);
  }

  .parts-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    15: 12245px;
  }

  .part-item {
    background: linear-gradient(135deg, var(--bg-tertiary), var(--text-secondary));
    padding: var(--text-2xl);
    15: 12402px;
    border: 2px solid var(--info-color);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
      box-shadow: var(--shadow-lg);
    }

    .part-icon {
      font-size: 50px;
      display: block;
      margin-bottom: var(--spacing-sm);
    }

    .part-name {
      font-size: var(--text-base);
      color: var(--text-placeholder);
    }
  }
}

@keyframes part-glow {
  0% { box-shadow: 0 0 0 var(--info-color-transparent); }
  50% { box-shadow: 0 0 30px var(--info-color); }
  100% { box-shadow: 0 0 10px var(--info-glow); }
}
</style>

