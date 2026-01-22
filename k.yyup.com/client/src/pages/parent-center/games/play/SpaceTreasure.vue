<template>
  <div class="space-treasure-game">
    <!-- 顶部栏 -->
    <div class="game-header">
      <div class="header-left">
        <el-button circle @click="handleBack">
          <UnifiedIcon name="ArrowLeft" />
        </el-button>
        <el-button circle @click="handlePause" :type="isPaused ? 'warning' : 'default'">
          <UnifiedIcon name="default" />
          <UnifiedIcon name="default" />
        </el-button>
        <el-button circle @click="showHelp = true" type="info">
          <UnifiedIcon name="default" />
        </el-button>
      </div>
      
      <div class="header-center">
        <div class="game-info">
          <span class="level-badge">第{{ currentLevel }}关</span>
          <span class="found-count">已找到：{{ foundItems.length }}/{{ totalItems }}</span>
        </div>
      </div>
      
      <div class="header-right">
        <div class="timer" :class="{ warning: timeLeft < 10 }">
          ⏱️ {{ timeLeft }}秒
        </div>
        <div class="energy">⚡ {{ energyPoints }}</div>
      </div>
    </div>

    <!-- 游戏主区域 -->
    <div class="game-container">
      <div class="game-title">
        <h2>🚀 太空寻宝大冒险</h2>
        <p>在{{ timeLimit }}秒内找到{{ totalItems }}个隐藏的宝藏！</p>
      </div>

      <!-- 太空场景 -->
      <div class="space-scene" ref="sceneRef">
        <img :src="currentSceneImage" alt="太空场景" class="scene-background" @load="onSceneLoad">
        
        <!-- 隐藏的宝藏物品 -->
        <div
          v-for="(item, index) in treasureItems"
          :key="index"
          class="treasure-item"
          :class="{ found: foundItems.includes(index), pulsing: !foundItems.includes(index) }"
          :style="{
            left: item.x + '%',
            top: item.y + '%'
          }"
          @click="handleItemClick(index)"
        >
          <div class="item-icon" v-if="!foundItems.includes(index)">
            {{ item.icon }}
          </div>
          <div class="found-marker" v-else>
            <UnifiedIcon name="Check" />
          </div>
        </div>

        <!-- 视差星空背景 -->
        <div class="stars-layer layer-1"></div>
        <div class="stars-layer layer-2"></div>
        <div class="stars-layer layer-3"></div>
      </div>

      <!-- 任务提示栏 -->
      <div class="mission-panel">
        <h3>🎯 任务目标</h3>
        <div class="items-list">
          <div
            v-for="(item, index) in treasureItems"
            :key="index"
            class="item-badge"
            :class="{ found: foundItems.includes(index) }"
          >
            <span class="item-icon">{{ item.icon }}</span>
            <span class="item-name">{{ item.name }}</span>
          </div>
        </div>
      </div>

      <!-- 底部工具栏 -->
      <div class="game-controls">
        <el-button type="primary" @click="handleUseScan" :disabled="scansLeft === 0">
          <UnifiedIcon name="eye" />
          雷达扫描 ({{ scansLeft }})
        </el-button>
        <el-button @click="handleRestart">
          <UnifiedIcon name="Refresh" />
          重新开始
        </el-button>
      </div>
    </div>

    <!-- 发现宝藏特效 -->
    <div class="treasure-found-effect" v-if="showTreasureEffect">
      <div class="energy-burst"></div>
      <div class="energy-rings">      </div>
    </div>

    <!-- 帮助说明 -->
    <el-dialog v-model="showHelp" title="🎮 游戏说明" class="responsive-dialog dialog-large">
      <div class="help-content">
        <h2>🚀 太空寻宝大冒险</h2>
        <p class="game-intro">在神秘的太空场景中寻找隐藏的宝藏，考验你的观察力和速度</p>
        
        <div class="help-section">
          <h3>📖 游戏规则</h3>
          <ol>
            <li>每关会在太空场景中隐藏多个宝藏物品</li>
            <li>在限定时间内找出所有隐藏的宝藏</li>
            <li>点击宝藏物品即可收集</li>
            <li>时间耗尽前找到所有宝藏即可过关</li>
          </ol>
        </div>

        <div class="help-section">
          <h3>🎯 游戏目标</h3>
          <ul>
            <li>在倒计时结束前找到所有宝藏</li>
            <li>获得更多能量点数</li>
            <li>挑战更复杂的太空场景</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>📈 难度递增</h3>
          <ul>
            <li><strong>第1-2关</strong>: 3个宝藏，60秒，简单场景</li>
            <li><strong>第3-4关</strong>: 4个宝藏，50秒，中等难度</li>
            <li><strong>第5关+</strong>: 5个宝藏，45秒，复杂场景</li>
          </ul>
          <p class="tip">💡 关卡越高，宝藏越隐蔽，时间越紧张</p>
        </div>

        <div class="help-section">
          <h3>🎮 特殊机制</h3>
          <ul>
            <li><strong>⚡ 能量点</strong>: 找到宝藏获得能量，可用于兑换奖励</li>
            <li><strong>⏱️ 倒计时</strong>: 剩余10秒会变红警告</li>
            <li><strong>🔍 宝藏高亮</strong>: 找到后会显示闪烁效果</li>
          </ul>
        </div>

        <div class="help-section tips">
          <h3>💡 游戏技巧</h3>
          <ul>
            <li>先快速浏览整个场景</li>
            <li>注意颜色异常或突出的物品</li>
            <li>宝藏可能藏在星球、陨石、空间站等地方</li>
            <li>合理分配时间，不要在一处纠结太久</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showHelp = false" size="large">知道了</el-button>
      </template>
    </el-dialog>

    <!-- 游戏结束弹窗 -->
    <el-dialog
      v-model="showGameOverDialog"
      :title="isSuccess ? '🎉 任务完成！' : '⏰ 时间到！'"
      class="responsive-dialog dialog-medium"
      :close-on-click-modal="false"
    >
      <div class="game-over-content">
        <div v-if="isSuccess" class="success-panel">
          <div class="stars">
            <UnifiedIcon name="default" />
          </div>
          <div class="score-info">
            <p>找到：{{ foundItems.length }}/{{ totalItems }} 个宝藏</p>
            <p>剩余时间：{{ timeLeft }}秒</p>
            <p>雷达使用：{{ 3 - scansLeft }}次</p>
            <p>能量点：⚡ {{ energyPoints }}</p>
            <p class="grade">评分：{{ getGrade() }}</p>
          </div>
        </div>
        <div v-else class="fail-panel">
          <p>找到了 {{ foundItems.length }}/{{ totalItems }} 个宝藏</p>
          <p>再接再厉！</p>
        </div>
      </div>
      <template #footer>
        <el-button v-if="isSuccess" @click="handleNextLevel" type="primary">下一关</el-button>
        <el-button v-else @click="handleRestart" type="primary">再试一次</el-button>
        <el-button @click="handleBack">返回大厅</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, VideoPause, VideoPlay, Check, View, RefreshRight, StarFilled, QuestionFilled } from '@element-plus/icons-vue'
import { audioManager } from '../utils/audioManager'
import { buildBGMUrl, buildSFXUrl, buildVoiceUrl, buildSceneUrl } from '@/utils/oss-url-builder'

const router = useRouter()

// 游戏状态
const currentLevel = ref(1)
const timeLeft = ref(90) // 倒计时
const timeLimit = ref(90)
const scansLeft = ref(3) // 雷达扫描次数
const foundItems = ref<number[]>([])
const energyPoints = ref(0)
const showGameOverDialog = ref(false)
const showTreasureEffect = ref(false)
const starsEarned = ref(0)
const isSuccess = ref(false)
const isPaused = ref(false)
const showHelp = ref(false)

// 场景图片
const sceneRef = ref<HTMLElement>()
const currentSceneImage = ref(buildSceneUrl('space-treasure/space-station-1.png'))

// 宝藏物品配置（根据关卡难度）
const totalItems = computed(() => {
  if (currentLevel.value <= 2) return 5
  if (currentLevel.value <= 4) return 8
  return 12
})

// 宝藏物品数据
const treasureItems = ref([
  { x: 15, y: 20, icon: '💎', name: '能量宝石' },
  { x: 70, y: 15, icon: '👽', name: '外星生物' },
  { x: 45, y: 35, icon: '🛸', name: '飞碟' },
  { x: 25, y: 60, icon: '🌟', name: '星球' },
  { x: 80, y: 50, icon: '🔮', name: '水晶球' },
  { x: 35, y: 75, icon: '🎖️', name: '勋章' },
  { x: 60, y: 70, icon: '🚀', name: '火箭' },
  { x: 50, y: 45, icon: '⚙️', name: '机械零件' },
  { x: 20, y: 80, icon: '📡', name: '天线' },
  { x: 75, y: 65, icon: '🌌', name: '星云' },
  { x: 40, y: 55, icon: '🛰️', name: '卫星' },
  { x: 85, y: 30, icon: '🌠', name: '流星' }
])

// 计时器
let timerInterval: number | null = null

onMounted(() => {
  initLevel()
  playVoice('game-start')
  // 播放BGM
  audioManager.playBGM(buildBGMUrl('space-treasure-bgm.mp3'))
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
  // 根据难度设置时限
  if (currentLevel.value <= 2) {
    timeLimit.value = 90 // 简单：90秒
  } else if (currentLevel.value <= 4) {
    timeLimit.value = 60 // 中等：60秒
  } else {
    timeLimit.value = 45 // 困难：45秒
  }
  
  timeLeft.value = timeLimit.value
  startTimer()
}

// 开始计时
const startTimer = () => {
  timerInterval = window.setInterval(() => {
    if (isPaused.value) return
    
    timeLeft.value--
    
    // 时间提醒
    if (timeLeft.value === 30) {
      playVoice('time-warning-30')
    } else if (timeLeft.value === 10) {
      playVoice('time-warning-10')
    }
    
    // 时间到
    if (timeLeft.value <= 0) {
      handleTimeOut()
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

// 场景加载完成
const onSceneLoad = () => {
  console.log('太空场景加载完成')
}

// 点击宝藏物品
const handleItemClick = (index: number) => {
  if (foundItems.value.includes(index)) {
    return // 已找到，忽略
  }

  // 标记为已找到
  foundItems.value.push(index)
  
  // 增加能量点
  energyPoints.value += 100
  
  // 播放成功音效和语音
  playSound('treasure-found')
  playVoice('correct')
  
  // 显示能量爆发特效
  showTreasureEffect.value = true
  setTimeout(() => {
    showTreasureEffect.value = false
  }, 800)

  // 检查是否全部找到
  if (foundItems.value.length === totalItems.value) {
    handleMissionComplete()
  }
}

// 使用雷达扫描
const handleUseScan = () => {
  if (scansLeft.value === 0) {
    return
  }

  // 找到一个未发现的物品
  const unfound = treasureItems.value.findIndex((_, index) => !foundItems.value.includes(index))
  
  if (unfound !== -1) {
    scansLeft.value--
    
    // 短暂高亮提示位置
    const item = document.querySelectorAll('.treasure-item')[unfound] as HTMLElement
    if (item) {
      item.classList.add('scan-highlight')
      setTimeout(() => {
        item.classList.remove('scan-highlight')
      }, 3000)
    }
    
    playSound('scan')
    playVoice('hint')
    ElMessage.success(`🔍 雷达发现能量信号！`)
  }
}

// 任务完成
const handleMissionComplete = () => {
  stopTimer()
  isSuccess.value = true
  
  // 计算星级
  const timeUsed = timeLimit.value - timeLeft.value
  const scansUsed = 3 - scansLeft.value
  const timeRatio = timeUsed / timeLimit.value
  
  if (timeRatio < 0.5 && scansUsed === 0) {
    starsEarned.value = 3 // 完美
  } else if (timeRatio < 0.75 && scansUsed <= 1) {
    starsEarned.value = 2 // 很棒
  } else {
    starsEarned.value = 1 // 不错
  }
  
  playVoice('mission-complete')
  showGameOverDialog.value = true
}

// 时间到
const handleTimeOut = () => {
  stopTimer()
  isSuccess.value = false
  playVoice('time-up')
  showGameOverDialog.value = true
}

// 获取评级
const getGrade = () => {
  if (starsEarned.value === 3) return '完美宇航员！'
  if (starsEarned.value === 2) return '优秀探险家！'
  return '勇敢冒险者！'
}

// 下一关
const handleNextLevel = () => {
  currentLevel.value++
  foundItems.value = []
  energyPoints.value = 0
  scansLeft.value = 3
  showGameOverDialog.value = false
  initLevel()
  
  ElMessage.success(`进入第${currentLevel.value}关！`)
}

// 重新开始
const handleRestart = () => {
  foundItems.value = []
  energyPoints.value = 0
  scansLeft.value = 3
  showGameOverDialog.value = false
  initLevel()
}

// 暂停
const handlePause = () => {
  isPaused.value = !isPaused.value
  if (isPaused.value) {
    ElMessage.info('游戏已暂停')
    audioManager.pauseBGM()
  } else {
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
  const soundMap: Record<string, string> = {
    'treasure-found': buildSFXUrl('treasure-found.mp3'),
    'scan': buildSFXUrl('scan.mp3'),
    'click': buildSFXUrl('click.mp3')
  }

  if (soundMap[type]) {
    const audio = new Audio(soundMap[type])
    audio.volume = 0.5
    audio.play().catch(err => console.log('音效播放失败:', err))
  }
}

// 播放语音
const playVoice = (type: string) => {
  let voicePath = ''

  if (type === 'correct') {
    const randomNum = Math.floor(Math.random() * 5) + 1
    voicePath = buildVoiceUrl(`found-${randomNum}.mp3`, 'space-treasure')
  } else if (type === 'hint') {
    const randomNum = Math.floor(Math.random() * 3) + 1
    voicePath = buildVoiceUrl(`hint-${randomNum}.mp3`, 'space-treasure')
  } else {
    const voiceMap: Record<string, string> = {
      'game-start': 'game-start.mp3',
      'time-warning-30': 'time-30.mp3',
      'time-warning-10': 'time-10.mp3',
      'mission-complete': 'mission-complete.mp3',
      'time-up': 'time-up.mp3'
    }
    const fileName = voiceMap[type]
    if (fileName) {
      voicePath = buildVoiceUrl(fileName, 'space-treasure')
    }
  }

  if (!voicePath) return
  
  if (audioContext.value.voice) {
    audioContext.value.voice.pause()
  }
  
  const audio = new Audio(voicePath)
  audio.volume = 0.8
  audio.play().catch(err => console.log('语音播放失败:', err))
  audioContext.value.voice = audio
}
</script>

<style scoped lang="scss">
.help-content {
  h2 { color: var(--primary-color); font-size: var(--text-2xl); margin: 0 0 var(--spacing-sm) 0; }
  .game-intro { font-size: var(--text-base); color: var(--text-regular); margin-bottom: var(--spacing-xl); padding: var(--spacing-md); background: var(--bg-hover); border-radius: var(--radius-md); }
  .help-section { margin-bottom: var(--spacing-xl);
    h3 { font-size: var(--text-lg); color: var(--text-primary); margin: 0 0 var(--spacing-md) 0; padding-bottom: var(--spacing-sm); border-bottom: var(--border-width-base) solid var(--border-color-light); }
    ol, ul { margin: 0; padding-left: var(--spacing-xl);
      li { margin-bottom: var(--spacing-sm); line-height: var(--leading-relaxed); color: var(--text-regular); strong { color: var(--primary-color); } }
    }
    .tip { margin-top: var(--spacing-md); padding: var(--spacing-sm) var(--spacing-md); background: var(--warning-light-bg); border-left: var(--spacing-xs) solid var(--warning-color); color: var(--warning-color); font-size: var(--text-sm); border-radius: var(--radius-sm); }
    &.tips { background: var(--info-light-bg); padding: var(--spacing-md); border-radius: var(--radius-md); border: var(--border-width-thick) solid var(--primary-color);
      h3 { color: var(--info-color); border-bottom-color: var(--primary-color); }
      ul li { color: var(--primary-hover); }
    }
  }
}

.space-treasure-game {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-page) 50%, var(--bg-tertiary) 100%);
  padding: var(--spacing-lg);
  position: relative;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-primary-500);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  margin-bottom: var(--spacing-lg);
  border: var(--border-width-thick) solid var(--primary-color);

  .header-left,
  .header-right {
    display: flex;
    gap: var(--spacing-md);
    align-items: center;
  }

  .header-center {
    flex: 1;
    text-align: center;

    .game-info {
      display: flex;
      gap: var(--spacing-lg);
      justify-content: center;
      align-items: center;

      .level-badge {
        background: var(--gradient-primary);
        color: var(--text-on-primary);
        padding: var(--spacing-sm) var(--spacing-lg);
        border-radius: var(--radius-xl);
        font-weight: var(--font-bold);
        font-size: var(--text-base);
        box-shadow: var(--shadow-md);
      }

      .found-count {
        font-size: var(--text-lg);
        font-weight: var(--font-bold);
        color: var(--primary-color);
        text-shadow: 0 0 var(--spacing-md) var(--glow-primary);
      }
    }
  }

  .timer {
    font-size: var(--text-xl);
    font-weight: var(--font-bold);
    color: var(--primary-color);
    text-shadow: 0 0 var(--spacing-md) var(--glow-primary);

    &.warning {
      color: var(--danger-color);
      animation: timer-pulse var(--transition-slow) ease-in-out infinite;
    }
  }

  .energy {
    font-size: var(--text-lg);
    font-weight: var(--font-bold);
    color: var(--warning-color);
    text-shadow: 0 0 var(--spacing-md) var(--glow-warning);
  }
}

.game-container {
  max-width: var(--container-xl);
  margin: 0 auto;
}

.game-title {
  text-align: center;
  margin-bottom: var(--spacing-xl);

  h2 {
    font-size: var(--text-4xl);
    color: var(--primary-color);
    margin-bottom: var(--spacing-sm);
    text-shadow: 0 0 var(--spacing-2xl) var(--color-primary-500);
  }

  p {
    font-size: var(--text-xl);
    color: var(--text-secondary);
  }
}

.space-scene {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-2xl);
  overflow: hidden;
  background: var(--bg-page);
  box-shadow: 0 var(--spacing-sm) var(--spacing-3xl) var(--color-primary-500),
              inset 0 0 var(--spacing-5xl) var(--color-primary-500);
  margin-bottom: var(--spacing-xl);

  .scene-background {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
}

.treasure-item {
  position: absolute;
  width: var(--game-piece-small);
  height: var(--game-piece-small);
  cursor: pointer;
  transition: all var(--transition-base) ease;
  z-index: var(--z-sticky);

  &.pulsing {
    animation: item-pulse var(--transition-slower) ease-in-out infinite;
  }

  &.found {
    cursor: default;
    animation: none;
  }

  &.scan-highlight {
    animation: scan-glow var(--transition-slower) ease-in-out;
  }

  .item-icon {
    font-size: var(--text-5xl);
    filter: drop-shadow(0 0 var(--spacing-md) var(--color-primary-500));
    transition: all var(--transition-base) ease;
  }

  &:hover:not(.found) .item-icon {
    transform: scale(1.2);
    filter: drop-shadow(0 0 var(--spacing-2xl) var(--color-primary-500));
  }

  .found-marker {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle, var(--color-primary-500), transparent);
    border-radius: 50%;
    color: var(--success-color);
    font-size: var(--text-5xl);
    animation: found-pop var(--transition-base) ease-out;
  }
}

.stars-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20% 30%, white, transparent),
    radial-gradient(2px 2px at 60% 70%, white, transparent),
    radial-gradient(1px 1px at 50% 50%, white, transparent),
    radial-gradient(1px 1px at 80% 10%, white, transparent),
    radial-gradient(2px 2px at 90% 60%, white, transparent);
  background-size: 200% 200%;
  opacity: 0.6;

  &.layer-1 {
    animation: stars-twinkle 20s linear infinite;
  }

  &.layer-2 {
    animation: stars-twinkle 15s linear infinite reverse;
    opacity: 0.4;
  }

  &.layer-3 {
    animation: stars-twinkle 25s linear infinite;
    opacity: 0.3;
  }
}

.mission-panel {
  background: var(--color-primary-500);
  padding: var(--spacing-2xl);
  border-radius: var(--radius-xl);
  box-shadow: 0 var(--spacing-xs) var(--spacing-3xl) var(--color-primary-500);
  margin-bottom: var(--spacing-2xl);
  border: var(--border-width-thick) solid var(--color-primary-500);

  h3 {
    color: var(--primary-color);
    margin-bottom: var(--spacing-lg);
    font-size: var(--text-2xl);
  }

  .items-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--spacing-md);

    .item-badge {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      background: var(--color-primary-500);
      border: var(--border-width-thick) solid var(--color-primary-500);
      transition: all var(--transition-base) ease;

      &.found {
        background: var(--color-primary-500);
        border-color: var(--success-color);

        .item-icon {
          opacity: 0.5;
        }

        .item-name {
          text-decoration: line-through;
          color: var(--success-color);
        }
      }

      .item-icon {
        font-size: var(--text-3xl);
      }

      .item-name {
        color: var(--text-placeholder);
        font-size: var(--text-base);
      }
    }
  }
}

.game-controls {
  display: flex;
  justify-content: center;
  gap: var(--spacing-2xl);

  .el-button {
    font-size: var(--text-lg);
    padding: var(--spacing-md) var(--spacing-xl);
    border-radius: var(--radius-lg);
  }
}

.treasure-found-effect {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: var(--z-toast);

  .energy-burst {
    width: var(--spacing-5xl);
    height: var(--spacing-5xl);
    background: radial-gradient(circle, var(--color-primary-500), transparent);
    border-radius: 50%;
    animation: energy-burst var(--transition-slow) ease-out;
  }

  .energy-rings {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;

    &::before,
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border: var(--border-width-thick) solid var(--color-primary-500);
      border-radius: 50%;
      animation: ring-expand var(--transition-slow) ease-out;
    }

    &::after {
      animation-delay: var(--transition-fast);
    }
  }
}

.game-over-content {
  text-align: center;
  padding: var(--spacing-2xl);

  .success-panel {
    .stars {
      display: flex;
      justify-content: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);

      .star {
        font-size: var(--text-5xl);
        color: var(--warning-color);
        animation: star-pop var(--transition-base) ease-out;

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
          font-weight: var(--font-bold);
          color: var(--primary-color);
          margin-top: var(--spacing-md);
        }
      }
    }
  }

  .fail-panel {
    p {
      font-size: var(--text-xl);
      margin: var(--spacing-md) 0;
      color: var(--text-regular);
    }
  }
}

@keyframes item-pulse {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 var(--spacing-md) var(--color-primary-500));
  }
  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 var(--spacing-2xl) var(--color-primary-500));
  }
}

@keyframes scan-glow {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 var(--spacing-md) var(--color-primary-500));
  }
  50% {
    transform: scale(1.3);
    filter: drop-shadow(0 0 var(--spacing-4xl) var(--color-primary-500));
  }
}

@keyframes found-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes stars-twinkle {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 100% 100%;
  }
}

@keyframes timer-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes energy-burst {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}

@keyframes ring-expand {
  0% {
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    width: var(--spacing-5xl);
    height: var(--spacing-5xl);
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
@media (max-width: var(--breakpoint-lg)) {
  .space-scene {
    aspect-ratio: 4 / 3;
  }

  .space-treasure-game {
    padding: var(--spacing-md);
  }

  .treasure-item {
    width: var(--game-piece-small);
    height: var(--game-piece-small);
  }

  .mission-panel {
    padding: var(--spacing-lg);
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

