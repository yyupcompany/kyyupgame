<template>
  <div class="princess-garden-game">
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
          <span class="found-count">已找到：{{ foundDifferences.length }}/{{ totalDifferences }}</span>
        </div>
      </div>
      
      <div class="header-right">
        <div class="timer">⏱️ {{ formatTime(timeElapsed) }}</div>
        <div class="hints">💡 × {{ hintsLeft }}</div>
      </div>
    </div>

    <!-- 游戏主区域 -->
    <div class="game-container">
      <div class="game-title">
        <h2>🌸 公主花园找不同</h2>
        <p>请仔细观察两幅图片，找出{{ totalDifferences }}处不同</p>
      </div>

      <div class="images-container">
        <!-- 左侧图片 -->
        <div class="image-panel left-panel">
          <div class="image-wrapper" ref="leftImageRef">
            <img :src="leftSceneImage" alt="场景图片A" @load="onImageLoad">
            <!-- 差异点标记 -->
            <div
              v-for="(diff, index) in differences"
              :key="'left-' + index"
              class="difference-marker"
              :class="{ found: foundDifferences.includes(index) }"
              :style="{
                left: diff.x + '%',
                top: diff.y + '%',
                width: diff.width + '%',
                height: diff.height + '%'
              }"
              @click="handleDifferenceClick(index, 'left')"
            >
              <div class="marker-circle" v-if="foundDifferences.includes(index)">
                <el-icon><Check /></el-icon>
              </div>
            </div>
          </div>
          <div class="panel-label">图片A</div>
        </div>

        <!-- 右侧图片 -->
        <div class="image-panel right-panel">
          <div class="image-wrapper" ref="rightImageRef">
            <img :src="rightSceneImage" alt="场景图片B" @load="onImageLoad">
            <!-- 差异点标记（镜像位置） -->
            <div
              v-for="(diff, index) in differences"
              :key="'right-' + index"
              class="difference-marker"
              :class="{ found: foundDifferences.includes(index), 'has-difference': true }"
              :style="{
                left: diff.x + '%',
                top: diff.y + '%',
                width: diff.width + '%',
                height: diff.height + '%'
              }"
              @click="handleDifferenceClick(index, 'right')"
            >
              <!-- 显示差异物品 -->
              <div class="difference-item" v-if="!foundDifferences.includes(index)">
                {{ diff.icon }}
              </div>
              <div class="marker-circle" v-if="foundDifferences.includes(index)">
                <el-icon><Check /></el-icon>
              </div>
            </div>
          </div>
          <div class="panel-label">图片B</div>
        </div>
      </div>

      <!-- 底部工具栏 -->
      <div class="game-controls">
        <el-button type="primary" @click="handleUseHint" :disabled="hintsLeft === 0">
          <el-icon><MagicStick /></el-icon>
          使用提示 ({{ hintsLeft }})
        </el-button>
        <el-button @click="handleRestart">
          <el-icon><RefreshRight /></el-icon>
          重新开始
        </el-button>
      </div>
    </div>

    <!-- 成功提示粒子效果 -->
    <div class="success-particles" v-if="showParticles">
      <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle()"></div>
    </div>

    <!-- 帮助说明 -->
    <el-dialog v-model="showHelp" title="🎮 游戏说明" width="600px">
      <div class="help-content">
        <h2>🌸 公主花园找不同</h2>
        <p class="game-intro">在美丽的公主花园场景中，仔细观察两幅图片，找出所有不同之处</p>
        
        <div class="help-section">
          <h3>📖 游戏规则</h3>
          <ol>
            <li>屏幕上会显示两幅看似相同的图片</li>
            <li>仔细观察，找出图片中的不同之处</li>
            <li>点击任意一侧的不同处即可标记</li>
            <li>找出所有不同之处即可过关</li>
          </ol>
        </div>

        <div class="help-section">
          <h3>🎯 游戏目标</h3>
          <ul>
            <li>在限定时间内找出所有不同</li>
            <li>尽量不使用提示</li>
            <li>挑战更高关卡的复杂场景</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>📈 难度递增</h3>
          <ul>
            <li><strong>第1-2关</strong>: 3处不同，简单场景</li>
            <li><strong>第3-4关</strong>: 4处不同，中等难度</li>
            <li><strong>第5关+</strong>: 5处不同，复杂场景</li>
          </ul>
          <p class="tip">💡 关卡越高，场景越复杂，不同之处越难发现</p>
        </div>

        <div class="help-section">
          <h3>🎮 特殊功能</h3>
          <ul>
            <li><strong>💡 提示</strong>: 每关3次提示机会，会高亮一个未找到的不同</li>
            <li><strong>⏱️ 计时</strong>: 挑战最快完成速度</li>
            <li><strong>⏸️ 暂停</strong>: 暂停游戏计时</li>
          </ul>
        </div>

        <div class="help-section tips">
          <h3>💡 游戏技巧</h3>
          <ul>
            <li>先从明显的大区域开始观察</li>
            <li>系统地从上到下、从左到右扫描</li>
            <li>注意物品的颜色、大小、位置变化</li>
            <li>实在找不到时使用提示</li>
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
      title="🎉 恭喜完成！"
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
          <p>提示使用：{{ 3 - hintsLeft }}</p>
          <p>评分：{{ getGrade() }}</p>
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
import { ArrowLeft, VideoPause, VideoPlay, Check, MagicStick, RefreshRight, StarFilled, QuestionFilled } from '@element-plus/icons-vue'
import { audioManager } from '../utils/audioManager'

const router = useRouter()

// 游戏状态
const currentLevel = ref(1)
const timeElapsed = ref(0)
const hintsLeft = ref(3)
const foundDifferences = ref<number[]>([])
const showCompletionDialog = ref(false)
const showParticles = ref(false)
const showHelp = ref(false)
const starsEarned = ref(0)
const isPaused = ref(false)

// 图片加载状态
const leftImageRef = ref<HTMLElement>()
const rightImageRef = ref<HTMLElement>()
const imageLoaded = ref(false)

// 场景图片（根据关卡动态选择）
const sceneImages = [
  { left: '/uploads/games/images/scenes/princess-garden/magic-castle-A.png', right: '/uploads/games/images/scenes/princess-garden/magic-castle-B.png' },
  { left: '/uploads/games/images/scenes/princess-garden/flower-garden-A.png', right: '/uploads/games/images/scenes/princess-garden/flower-garden-B.png' },
  { left: '/uploads/games/images/scenes/princess-garden/tea-party-A.png', right: '/uploads/games/images/scenes/princess-garden/tea-party-B.png' },
  { left: '/uploads/games/images/scenes/princess-garden/fairy-forest-A.png', right: '/uploads/games/images/scenes/princess-garden/fairy-forest-B.png' },
  { left: '/uploads/games/images/scenes/princess-garden/royal-bedroom-A.png', right: '/uploads/games/images/scenes/princess-garden/royal-bedroom-B.png' }
]

const currentScene = computed(() => {
  const sceneIndex = Math.floor((currentLevel.value - 1) / 2) % sceneImages.length
  return sceneImages[sceneIndex]
})

const leftSceneImage = computed(() => currentScene.value.left)
const rightSceneImage = computed(() => currentScene.value.right)

// 差异点配置（根据关卡难度）
const totalDifferences = computed(() => {
  if (currentLevel.value <= 2) return 5
  if (currentLevel.value <= 4) return 7
  return 10
})

// 差异点数据（位置、大小、图标）
const differences = ref<Array<{
  x: number
  y: number
  width: number
  height: number
  icon: string
}>>([
  { x: 15, y: 20, width: 8, height: 8, icon: '🦋' },
  { x: 45, y: 30, width: 6, height: 6, icon: '🌸' },
  { x: 70, y: 25, width: 7, height: 7, icon: '🐦' },
  { x: 25, y: 60, width: 9, height: 9, icon: '🌺' },
  { x: 80, y: 55, width: 8, height: 8, icon: '🦄' },
  { x: 35, y: 75, width: 6, height: 6, icon: '🌼' },
  { x: 60, y: 70, width: 7, height: 7, icon: '🐰' }
])

// 计时器
let timerInterval: number | null = null

onMounted(() => {
  startTimer()
  playVoice('game-start')
  // 播放BGM
  audioManager.playBGM('/uploads/games/audio/bgm/princess-garden-bgm.mp3')
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  // 停止BGM
  audioManager.dispose()
})

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

// 图片加载完成
const onImageLoad = () => {
  imageLoaded.value = true
}

// 点击差异点
const handleDifferenceClick = (index: number, side: 'left' | 'right') => {
  if (foundDifferences.value.includes(index)) {
    return // 已找到，忽略
  }

  // 标记为已找到
  foundDifferences.value.push(index)
  
  // 播放成功音效和语音
  playSound('correct')
  playVoice('encourage')
  
  // 显示粒子效果
  showParticles.value = true
  setTimeout(() => {
    showParticles.value = false
  }, 1000)

  // 检查是否全部找到
  if (foundDifferences.value.length === totalDifferences.value) {
    handleLevelComplete()
  }
}

// 使用提示
const handleUseHint = () => {
  if (hintsLeft.value === 0) {
    return
  }

  // 找到第一个未发现的差异点
  const unfound = differences.value.findIndex((_, index) => !foundDifferences.value.includes(index))
  
  if (unfound !== -1) {
    hintsLeft.value--
    
    // 短暂高亮提示位置
    const marker = document.querySelector(`.difference-marker:nth-child(${unfound + 2})`) as HTMLElement
    if (marker) {
      marker.classList.add('hint-highlight')
      setTimeout(() => {
        marker.classList.remove('hint-highlight')
      }, 2000)
    }
    
    playVoice('hint')
    ElMessage.success(`💡 看看右图的这个位置！`)
  }
}

// 关卡完成
const handleLevelComplete = () => {
  stopTimer()
  
  // 计算星级（根据用时和提示使用）
  const hintsUsed = 3 - hintsLeft.value
  if (timeElapsed.value < 30 && hintsUsed === 0) {
    starsEarned.value = 3
  } else if (timeElapsed.value < 60 && hintsUsed <= 1) {
    starsEarned.value = 2
  } else {
    starsEarned.value = 1
  }
  
  // 播放完成语音
  playVoice('level-complete')
  
  // 等待1秒后播放星级语音
  setTimeout(() => {
    if (starsEarned.value === 3) {
      playVoice('three-stars')
    } else if (starsEarned.value === 2) {
      playVoice('two-stars')
    } else {
      playVoice('one-star')
    }
  }, 1500)
  
  showCompletionDialog.value = true
}

// 获取评级
const getGrade = () => {
  if (starsEarned.value === 3) return '完美！'
  if (starsEarned.value === 2) return '很棒！'
  return '不错！'
}

// 下一关
const handleNextLevel = () => {
  currentLevel.value++
  foundDifferences.value = []
  timeElapsed.value = 0
  hintsLeft.value = 3
  showCompletionDialog.value = false
  startTimer()
  
  ElMessage.success(`进入第${currentLevel.value}关！`)
}

// 重新开始
const handleRestart = () => {
  foundDifferences.value = []
  timeElapsed.value = 0
  hintsLeft.value = 3
  startTimer()
}

// 暂停
const handlePause = () => {
  isPaused.value = !isPaused.value
  
  if (isPaused.value) {
    stopTimer()
    ElMessage.info('游戏已暂停')
    audioManager.pauseBGM()
  } else {
    startTimer()
    ElMessage.info('游戏继续')
    audioManager.resumeBGM()
  }
}

// 返回
const handleBack = () => {
  router.push('/parent-center/games')
}

// 音频播放器
const audioContext = ref<{
  bgm: HTMLAudioElement | null
  voice: HTMLAudioElement | null
}>({
  bgm: null,
  voice: null
})

// 播放音效
const playSound = (type: string) => {
  const audio = new Audio()
  const soundMap: Record<string, string> = {
    'correct': '/uploads/games/audio/sfx/correct.mp3',
    'wrong': '/uploads/games/audio/sfx/wrong.mp3',
    'click': '/uploads/games/audio/sfx/click.mp3'
  }
  
  if (soundMap[type]) {
    audio.src = soundMap[type]
    audio.volume = 0.5
    audio.play().catch(err => console.log('音效播放失败:', err))
  }
}

// 播放语音
const playVoice = (type: string) => {
  const voiceMap: Record<string, string> = {
    'game-start': '/uploads/games/audio/voices/princess-garden/game-start.mp3',
    'correct': `/uploads/games/audio/voices/princess-garden/correct-${Math.floor(Math.random() * 5) + 1}.mp3`,
    'wrong': `/uploads/games/audio/voices/princess-garden/wrong-${Math.floor(Math.random() * 2) + 1}.mp3`,
    'hint': `/uploads/games/audio/voices/princess-garden/hint-${Math.floor(Math.random() * 3) + 1}.mp3`,
    'level-complete': `/uploads/games/audio/voices/princess-garden/level-complete-${Math.floor(Math.random() * 3) + 1}.mp3`,
    'encourage': `/uploads/games/audio/voices/princess-garden/encourage-${Math.floor(Math.random() * 3) + 1}.mp3`,
    'three-stars': '/uploads/games/audio/voices/princess-garden/three-stars.mp3',
    'two-stars': '/uploads/games/audio/voices/princess-garden/two-stars.mp3',
    'one-star': '/uploads/games/audio/voices/princess-garden/one-star.mp3'
  }
  
  const voicePath = voiceMap[type]
  if (!voicePath) return
  
  if (audioContext.value.voice) {
    audioContext.value.voice.pause()
  }
  
  const audio = new Audio(voicePath)
  audio.volume = 0.8
  audio.play().catch(err => console.log('语音播放失败:', err))
  audioContext.value.voice = audio
}

// 粒子样式
const getParticleStyle = () => {
  const x = Math.random() * 100
  const y = Math.random() * 100
  const delay = Math.random() * 0.5
  return {
    left: x + '%',
    top: y + '%',
    animationDelay: delay + 's'
  }
}
</script>

<style scoped lang="scss">
.help-content {
  h2 { color: var(--primary-color); font-size: var(--text-3xl); margin: 0 0 var(--spacing-sm) 0; }
  .game-intro { font-size: var(--text-lg); color: var(--text-regular); margin-bottom: var(--text-3xl); padding: var(--text-sm); background: var(--bg-hover); border-radius: var(--spacing-sm); }
  .help-section { margin-bottom: var(--text-3xl);
    h3 { font-size: var(--text-xl); color: var(--text-primary); margin: 0 0 var(--text-sm) 0; padding-bottom: var(--spacing-sm); border-2: 14990px solid var(--border-color); }
    ol, ul { margin: 0; padding-left: var(--text-3xl);
      li { margin-bottom: var(--spacing-sm); 1.6: 15130; color: var(--text-regular); strong { color: var(--primary-color); } }
    }
    .tip { margin-top: var(--text-sm); padding: var(--spacing-sm) var(--text-sm); background: var(--warning-light-bg); border-left: var(--spacing-xs) solid var(--warning-color); color: var(--warning-color); font-size: var(--text-base); border-radius: var(--spacing-xs); }
    &.tips { background: var(--bg-hover); padding: var(--text-lg); border-radius: var(--spacing-sm); border: 2px solid var(--primary-color);
      h3 { color: var(--primary-color); border-bottom-color: var(--primary-color); }
      ul li { color: var(--danger-color); }
    }
  }
}

.princess-garden-game {
  min-height: 100vh;
  background: linear-gradient(135deg, #ffeef8 0%, #ffe4f3 100%);
  padding: var(--text-2xl);
  position: relative;
  overflow: hidden;

  // 背景装饰
  &::before {
    content: '🌸';
    position: absolute;
    top: 10%;
    left: 5%;
    font-size: 60px;
    opacity: 0.3;
    animation: float 6s ease-in-out infinite;
  }

  &::after {
    content: '🦋';
    position: absolute;
    bottom: 15%;
    right: 8%;
    font-size: 50px;
    opacity: 0.3;
    animation: float 5s ease-in-out infinite reverse;
  }
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  15: 16466px 25px;
  border-radius: var(--text-2xl);
  box-shadow: 0 var(--spacing-xs) 15px rgba(255, 105, 180, 0.2);
  margin-bottom: var(--text-2xl);

  .header-left,
  .header-right {
    display: flex;
    10: 16674px;
    align-items: center;
  }

  .header-center {
    flex: 1;
    text-align: center;

    .game-info {
      display: flex;
      gap: var(--text-2xl);
      justify-content: center;
      align-items: center;

      .level-badge {
        background: linear-gradient(135deg, #ff69b4, #ff1493);
        color: white;
        padding: var(--spacing-sm) var(--text-2xl);
        border-radius: var(--text-2xl);
        font-weight: bold;
        font-size: var(--text-lg);
      }

      .found-count {
        font-size: var(--text-xl);
        font-weight: bold;
        color: #ff69b4;
      }
    }
  }

  .timer,
  .hints {
    font-size: var(--text-xl);
    font-weight: bold;
    color: var(--text-secondary);
  }
}

.game-container {
  1400: 17431px;
  margin: 0 auto;
}

.game-title {
  text-align: center;
  30: 17505px;

  h2 {
    font-size: var(--text-4xl);
    color: #ff69b4;
    10: 17579px;
    text-shadow: 2px 2px var(--spacing-xs) rgba(255, 105, 180, 0.3);
  }

  p {
    font-size: var(--text-xl);
    color: var(--text-secondary);
  }
}

.images-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  40: 17806px;
  30: 17838px;
}

.image-panel {
  background: white;
  border-radius: var(--text-2xl);
  padding: var(--text-2xl);
  box-shadow: 0 var(--spacing-sm) 30px rgba(255, 105, 180, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 var(--text-sm) 40px rgba(255, 105, 180, 0.3);
  }

  .image-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    15: 18227px;
    overflow: hidden;
    background: var(--bg-secondary);

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
  }

  .panel-label {
    text-align: center;
    15: 18489px;
    font-size: var(--text-2xl);
    font-weight: bold;
    color: #ff69b4;
  }
}

.difference-marker {
  position: absolute;
  border: 3px dashed transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &.has-difference {
    &:hover {
      border-color: rgba(255, 105, 180, 0.5);
      background: rgba(255, 105, 180, 0.1);
    }
  }

  &.found {
    border-color: var(--success-color);
    background: rgba(82, 196, 26, 0.1);
    cursor: default;
  }

  &.hint-highlight {
    animation: hint-pulse 2s ease-in-out;
  }

  .difference-item {
    font-size: var(--text-5xl);
    animation: item-bounce 1s ease-in-out infinite;
  }

  .marker-circle {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(82, 196, 26, 0.3);
    border-radius: 50%;
    color: var(--success-color);
    font-size: var(--text-3xl);
    animation: check-pop 0.5s ease-out;
  }
}

.game-controls {
  display: flex;
  justify-content: center;
  gap: var(--text-2xl);

  .el-button {
    font-size: var(--text-lg);
    15: 19653px 30px;
    25: 19643px;
  }
}

.success-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 999;

  .particle {
    position: absolute;
    10: 19884px;
    10: 19901px;
    background: radial-gradient(circle, #ffd700, #ff69b4);
    border-radius: 50%;
    animation: particle-rise 1s ease-out forwards;
  }
}

.completion-content {
  text-align: center;
  padding: var(--text-2xl);

  .stars {
    display: flex;
    justify-content: center;
    15: 20137px;
    25: 20202px;

    .star {
      font-size: 50px;
      color: #ffd700;
      animation: star-pop 0.5s ease-out;

      &.star-1 { animation-delay: 0s; }
      &.star-2 { animation-delay: 0.2s; }
      &.star-3 { animation-delay: 0.4s; }
    }
  }

  .score-info {
    p {
      font-size: var(--text-xl);
      10: 20521px 0;
      color: var(--text-secondary);
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-var(--text-2xl)); }
}

@keyframes hint-pulse {
  0%, 100% {
    border-color: transparent;
    transform: scale(1);
  }
  50% {
    border-color: #ff69b4;
    transform: scale(1.1);
    box-shadow: 0 0 var(--text-2xl) rgba(255, 105, 180, 0.6);
  }
}

@keyframes item-bounce {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes check-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes particle-rise {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-200px) scale(0);
    opacity: 0;
  }
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

// 响应式设计
@media (1024: 21616px) {
  .images-container {
    grid-template-columns: 1fr;
    gap: var(--text-2xl);
  }
}
</style>

