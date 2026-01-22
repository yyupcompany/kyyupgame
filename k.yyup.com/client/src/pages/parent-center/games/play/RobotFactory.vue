<template>
  <div class="robot-factory-game">
    <div class="game-header">
      <el-button circle @click="handleBack"><UnifiedIcon name="ArrowLeft" /></el-button>
      <el-button circle @click="handlePause" :type="isPaused ? 'warning' : 'default'">
        <UnifiedIcon name="default" />
        <UnifiedIcon name="default" />
      </el-button>
      <el-button circle @click="showHelp = true" type="info"><UnifiedIcon name="default" /></el-button>
      <div class="game-info">
        <span class="level">第{{ currentLevel }}关</span>
        <span class="progress">进度：{{ placedParts }}/{{ totalParts }}</span>
      </div>
      <div class="timer">⏱️ {{ formatTime(timeElapsed) }}</div>
    </div>

    <div class="game-container">
      <h2><UnifiedIcon name="robot" /> 机器人工厂</h2>
      <p>按照设计图组装机器人！</p>

      <!-- 设计图 -->
      <div class="blueprint">
        <h3><UnifiedIcon name="clipboard" /> 设计图</h3>
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
        <el-button @click="handleRestart"><UnifiedIcon name="Refresh" />重新开始</el-button>
      </div>
    </div>

    <!-- 帮助说明 -->
    <el-dialog v-model="showHelp" class="responsive-dialog dialog-large">
      <template #title>
        <span><UnifiedIcon name="game" /> 游戏说明</span>
      </template>
      <div class="help-content">
        <h2><UnifiedIcon name="robot" /> 机器人工厂</h2>
        <p class="game-intro">按照设计图纸组装机器人，培养逻辑思维和按序操作能力</p>
        
        <div class="help-section">
          <h3><UnifiedIcon name="book-open-alt" /> 游戏规则</h3>
          <ol>
            <li>查看设计图纸，了解机器人的正确组装顺序</li>
            <li>从零件区选择正确的零件</li>
            <li>按照从下到上、从大到小的顺序组装</li>
            <li>所有零件装对位置即可过关</li>
          </ol>
        </div>

        <div class="help-section">
          <h3><UnifiedIcon name="target" /> 游戏目标</h3>
          <ul>
            <li>理解组装顺序</li>
            <li>选择正确零件</li>
            <li>完成机器人组装</li>
          </ul>
        </div>

        <div class="help-section">
          <h3><UnifiedIcon name="trend-charts" /> 难度递增</h3>
          <ul>
            <li><strong>第1-2关</strong>: 3个零件，简单机器人</li>
            <li><strong>第3-4关</strong>: 5个零件，中等复杂度</li>
            <li><strong>第5关+</strong>: 7个零件，复杂机器人</li>
          </ul>
          <p class="tip"><UnifiedIcon name="lightbulb" /> 零件越多，组装越复杂</p>
        </div>

        <div class="help-section">
          <h3><UnifiedIcon name="game" /> 组装顺序</h3>
          <ul>
            <li><strong>1. 底座</strong>: 机器人的支撑部分</li>
            <li><strong>2. 身体</strong>: 机器人的主体</li>
            <li><strong>3. 手臂</strong>: 机器人的操作部分</li>
            <li><strong>4. 头部</strong>: 机器人的控制中心</li>
          </ul>
        </div>

        <div class="help-section tips">
          <h3><UnifiedIcon name="lightbulb" /> 游戏技巧</h3>
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

    <el-dialog v-model="showCompletionDialog" class="responsive-dialog dialog-small">
      <template #title>
        <span><UnifiedIcon name="celebration" /> 机器人组装完成！</span>
      </template>
      <div class="completion">
        <div class="stars">
          <UnifiedIcon name="default" />
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
import { buildBGMUrl, buildSFXUrl, buildVoiceUrl } from '@/utils/oss-url-builder'
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
  audioManager.playBGM(buildBGMUrl('robot-factory-bgm.mp3'))
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
    'game-start': 'game-start.mp3',
    'correct': 'correct.mp3',
    'level-complete': 'level-complete.mp3'
  }

  const fileName = voiceMap[type]
  if (fileName) {
    const voicePath = buildVoiceUrl(fileName, 'robot-factory')
    audio.src = voicePath
    audio.volume = 1.0
    audio.play().catch(() => {})
  }
}
</script>

<style scoped lang="scss">
.help-content {
  h2 { color: var(--info-color); font-size: var(--text-3xl); margin: 0 0 var(--spacing-sm) 0; }
  .game-intro { font-size: var(--text-lg); color: var(--text-regular); margin-bottom: var(--spacing-3xl); padding: var(--spacing-md); background: var(--bg-hover); border-radius: var(--radius-sm); }
  .help-section { margin-bottom: var(--spacing-3xl);
    h3 { font-size: var(--text-xl); color: var(--text-primary); margin: 0 0 var(--spacing-md) 0; padding-bottom: var(--spacing-sm); border-bottom: var(--border-width-base) solid var(--border-color); }
    ol, ul { margin: 0; padding-left: var(--spacing-3xl);
      li { margin-bottom: var(--spacing-sm); line-height: var(--leading-relaxed); color: var(--text-regular); strong { color: var(--info-color); } }
    }
    .tip { margin-top: var(--spacing-md); padding: var(--spacing-sm) var(--spacing-md); background: var(--warning-light-bg); border-left: var(--spacing-xs) solid var(--warning-color); color: var(--warning-color); font-size: var(--text-base); border-radius: var(--radius-xs); }
    &.tips { background: var(--info-light-bg); padding: var(--spacing-lg); border-radius: var(--radius-sm); border: var(--border-width-thick) solid var(--info-color);
      h3 { color: var(--text-secondary); border-bottom-color: var(--info-color); }
      ul li { color: var(--bg-page); }
    }
  }
}

.robot-factory-game {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-tertiary) 100%);
  padding: var(--spacing-2xl);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-color-overlay);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-2xl);
  margin-bottom: var(--spacing-2xl);
  border: var(--border-width-thick) solid var(--info-color);
  box-shadow: var(--shadow-md);

  .game-info {
    display: flex;
    gap: var(--spacing-2xl);

    .level {
      background: var(--gradient-info);
      color: var(--text-on-primary);
      padding: var(--spacing-sm) var(--spacing-2xl);
      border-radius: var(--radius-2xl);
      font-weight: var(--font-bold);
    }

    .progress {
      font-size: var(--text-xl);
      font-weight: var(--font-bold);
      color: var(--info-color);
    }
  }

  .timer {
    color: var(--info-color);
    font-weight: var(--font-bold);
    font-size: var(--text-lg);
  }
}

.game-container {
  max-width: var(--container-xl);
  margin: 0 auto;
  text-align: center;

  h2 {
    font-size: var(--text-4xl);
    color: var(--info-color);
    margin-bottom: var(--spacing-sm);
    text-shadow: 0 0 var(--spacing-2xl) var(--glow-info);
  }

  p {
    font-size: var(--text-xl);
    color: var(--text-placeholder);
    margin-bottom: var(--spacing-2xl);
  }
}

.blueprint {
  background: var(--info-light-bg);
  padding: var(--spacing-2xl);
  border-radius: var(--radius-2xl);
  border: var(--border-width-thick) dashed var(--info-color);
  margin-bottom: var(--spacing-2xl);

  h3 {
    color: var(--info-color);
    margin-bottom: var(--spacing-2xl);
    font-size: var(--text-2xl);
  }

  .blueprint-robot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg);

    .part-slot {
      width: var(--game-piece-medium);
      height: var(--game-piece-medium);
      display: flex;
      align-items: center;
      justify-content: center;
      border: var(--border-width-thick) dashed var(--border-color);
      border-radius: var(--radius-md);
      font-size: var(--text-5xl);
      transition: all var(--transition-base) ease;

      &.filled {
        border-color: var(--info-color);
        background: var(--info-light-bg);
        animation: part-glow var(--transition-slow) ease;
      }
    }
  }
}

.parts-area {
  background: var(--bg-color-overlay);
  padding: var(--spacing-2xl);
  border-radius: var(--radius-2xl);
  margin-bottom: var(--spacing-2xl);

  .parts-label {
    color: var(--info-color);
    font-size: var(--text-2xl);
    font-weight: var(--font-bold);
    margin-bottom: var(--spacing-2xl);
  }

  .parts-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: var(--spacing-md);
  }

  .part-item {
    background: linear-gradient(135deg, var(--bg-tertiary), var(--text-secondary));
    padding: var(--spacing-2xl);
    border-radius: var(--radius-lg);
    border: var(--border-width-thick) solid var(--info-color);
    cursor: pointer;
    transition: all var(--transition-base) ease;

    &:hover {
      transform: scale(1.05);
      box-shadow: var(--shadow-lg);
    }

    .part-icon {
      font-size: var(--text-5xl);
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
  0% { box-shadow: 0 0 0 transparent; }
  50% { box-shadow: 0 0 var(--spacing-3xl) var(--info-color); }
  100% { box-shadow: 0 0 var(--spacing-lg) var(--glow-info); }
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

