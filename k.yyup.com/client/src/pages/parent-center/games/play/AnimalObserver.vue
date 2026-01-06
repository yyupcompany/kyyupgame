<template>
  <div class="animal-observer-game">
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
          <span class="score">得分：{{ score }}</span>
        </div>
      </div>
      
      <div class="header-right">
        <div class="lives">❤️ × {{ lives }}</div>
        <div class="combo" v-if="combo > 1">🔥 {{ combo }}连击</div>
      </div>
    </div>

    <!-- 游戏主区域 -->
    <div class="game-container">
      <!-- 任务提示 -->
      <div class="mission-banner">
        <h2>🎯 {{ currentMission }}</h2>
        <p>点击所有{{ targetDescription }}的{{ targetAnimal }}！</p>
      </div>

      <!-- 动物场景 -->
      <div class="animal-scene" ref="sceneRef">
        <!-- 移动的动物 -->
        <div
          v-for="animal in visibleAnimals"
          :key="animal.id"
          class="animal"
          :class="{ 
            correct: isCorrectAnimal(animal),
            clicked: clickedAnimals.includes(animal.id),
            wrong: wrongAnimals.includes(animal.id)
          }"
          :style="{
            left: animal.x + '%',
            top: animal.y + '%',
            animationDuration: animal.speed + 's'
          }"
          @click="handleAnimalClick(animal)"
        >
          <div class="animal-sprite" :class="animal.action">
            {{ animal.emoji }}
          </div>
          <div class="click-feedback" v-if="clickedAnimals.includes(animal.id)">
            <UnifiedIcon name="Check" />
          </div>
          <div class="wrong-feedback" v-if="wrongAnimals.includes(animal.id)">
            <UnifiedIcon name="Close" />
          </div>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="progress-panel">
        <div class="progress-label">完成进度：{{ correctClicks }}/{{ requiredClicks }}</div>
        <el-progress 
          :percentage="progressPercentage" 
          :color="progressColor"
          :stroke-width="20"
        />
      </div>

      <!-- 底部工具栏 -->
      <div class="game-controls">
        <el-button type="warning" @click="handleSlowMotion" :disabled="slowMotionLeft === 0">
          <UnifiedIcon name="default" />
          慢动作 ({{ slowMotionLeft }})
        </el-button>
        <el-button @click="handleRestart">
          <UnifiedIcon name="Refresh" />
          重新开始
        </el-button>
      </div>
    </div>

    <!-- 帮助说明 -->
    <el-dialog v-model="showHelp" title="🎮 游戏说明" class="responsive-dialog dialog-large">
      <div class="help-content">
        <h2>🦁 动物观察员</h2>
        <p class="game-intro">记住目标动物的特征，在一群移动的动物中快速识别并点击所有匹配的动物</p>
        
        <div class="help-section">
          <h3>📖 游戏规则</h3>
          <ol>
            <li>游戏开始会展示目标动物的特征（颜色、种类等）</li>
            <li>屏幕上会出现多个移动的动物</li>
            <li>点击所有符合条件的目标动物</li>
            <li>不要点击错误的动物，会扣生命值</li>
          </ol>
        </div>

        <div class="help-section">
          <h3>🎯 游戏目标</h3>
          <ul>
            <li>快速识别目标动物</li>
            <li>点击所有符合条件的动物</li>
            <li>避免误点，保持连击</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>📈 难度递增</h3>
          <ul>
            <li><strong>第1-2关</strong>: 5只动物，2只目标</li>
            <li><strong>第3-4关</strong>: 8只动物，3只目标</li>
            <li><strong>第5关+</strong>: 12只动物，4只目标</li>
          </ul>
          <p class="tip">💡 关卡越高，干扰动物越多，目标越难辨认</p>
        </div>

        <div class="help-section">
          <h3>🎮 特殊功能</h3>
          <ul>
            <li><strong>❤️ 生命值</strong>: 共3条生命，点错扣1条</li>
            <li><strong>🔥 连击</strong>: 连续点对可获得连击奖励</li>
            <li><strong>⏰ 慢动作</strong>: 特殊道具让动物短暂减速</li>
          </ul>
        </div>

        <div class="help-section tips">
          <h3>💡 游戏技巧</h3>
          <ul>
            <li>先记住目标特征再开始观察</li>
            <li>眼睛跟随目标动物移动</li>
            <li>不确定时宁可不点，避免失去生命</li>
            <li>合理使用慢动作道具</li>
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
      title="🎉 关卡完成！"
      class="responsive-dialog dialog-small"
      :close-on-click-modal="false"
    >
      <div class="completion-content">
        <div class="stars">
          <UnifiedIcon name="default" />
        </div>
        <div class="score-info">
          <p>最终得分：{{ score }}</p>
          <p>正确点击：{{ correctClicks }}</p>
          <p>错误点击：{{ wrongClicks }}</p>
          <p>最高连击：{{ maxCombo }}</p>
          <p class="grade">{{ getGrade() }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="handleNextLevel" type="primary">下一关</el-button>
        <el-button @click="handleBack">返回大厅</el-button>
      </template>
    </el-dialog>

    <!-- 游戏失败弹窗 -->
    <el-dialog
      v-model="showGameOverDialog"
      title="💔 游戏结束"
      class="responsive-dialog dialog-small"
      :close-on-click-modal="false"
    >
      <div class="gameover-content">
        <p>生命值耗尽！</p>
        <p>最终得分：{{ score }}</p>
        <p>完成度：{{ correctClicks }}/{{ requiredClicks }}</p>
      </div>
      <template #footer>
        <el-button @click="handleRestart" type="primary">再试一次</el-button>
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
import { buildBGMUrl, buildSFXUrl, buildVoiceUrl } from '@/utils/oss-url-builder'
import { ArrowLeft, VideoPause, VideoPlay, Check, Close, Clock, RefreshRight, StarFilled, QuestionFilled } from '@element-plus/icons-vue'

const router = useRouter()

// 游戏状态
const currentLevel = ref(1)
const score = ref(0)
const lives = ref(3)
const combo = ref(0)
const maxCombo = ref(0)
const correctClicks = ref(0)
const wrongClicks = ref(0)
const slowMotionLeft = ref(2)
const isSlowMotion = ref(false)
const clickedAnimals = ref<number[]>([])
const wrongAnimals = ref<number[]>([])
const showCompletionDialog = ref(false)
const showHelp = ref(false)
const showGameOverDialog = ref(false)
const starsEarned = ref(0)
const isPaused = ref(false)

// 当前任务
const targetAnimal = ref('兔子')
const targetAction = ref('跳')
const targetDescription = computed(() => `在${targetAction.value}`)

const currentMission = computed(() => 
  `找出所有${targetDescription.value}的${targetAnimal.value}！`
)

// 难度配置
const difficulty = computed(() => {
  if (currentLevel.value <= 2) return { animalTypes: 3, animalCount: 8, speed: 8 }
  if (currentLevel.value <= 4) return { animalTypes: 5, animalCount: 12, speed: 6 }
  return { animalTypes: 8, animalCount: 16, speed: 4 }
})

// 需要点击的正确动物数量（计算当前场景中符合条件的动物）
const requiredClicks = computed(() => {
  return visibleAnimals.value.filter(animal => 
    animal.type === targetAnimal.value && animal.action === targetAction.value
  ).length
})

// 进度百分比
const progressPercentage = computed(() => 
  Math.round((correctClicks.value / requiredClicks.value) * 100)
)

// 进度条颜色
const progressColor = computed(() => {
  if (progressPercentage.value < 33) return 'var(--danger-color)'
  if (progressPercentage.value < 66) return 'var(--warning-color)'
  return 'var(--success-color)'
})

// 动物数据库
interface Animal {
  id: number
  type: string
  emoji: string
  action: string
  x: number
  y: number
  speed: number
}

const visibleAnimals = ref<Animal[]>([])
let nextAnimalId = 0

// 动物类型库
const ANIMAL_TYPES = [
  { type: '兔子', emoji: '🐰', actions: ['跳', '跑', '吃'] },
  { type: '小熊', emoji: '🐻', actions: ['走', '跳', '坐'] },
  { type: '小鸟', emoji: '🐦', actions: ['飞', '跳', '站'] },
  { type: '小狗', emoji: '🐕', actions: ['跑', '跳', '坐'] },
  { type: '小猫', emoji: '🐱', actions: ['走', '跳', '睡'] },
  { type: '大象', emoji: '🐘', actions: ['走', '吃', '站'] },
  { type: '长颈鹿', emoji: '🦒', actions: ['走', '吃', '站'] },
  { type: '熊猫', emoji: '🐼', actions: ['吃', '坐', '爬'] }
]

// 初始化关卡
const initLevel = () => {
  // 随机选择任务目标
  const availableAnimals = ANIMAL_TYPES.slice(0, difficulty.value.animalTypes)
  const randomAnimal = availableAnimals[Math.floor(Math.random() * availableAnimals.length)]
  targetAnimal.value = randomAnimal.type
  targetAction.value = randomAnimal.actions[Math.floor(Math.random() * randomAnimal.actions.length)]
  
  // 重置状态
  correctClicks.value = 0
  wrongClicks.value = 0
  clickedAnimals.value = []
  wrongAnimals.value = []
  combo.value = 0
  
  // 生成动物
  spawnAnimals()
  // 不启动动态生成，保持固定数量
  // startSpawning()
  
  playVoice('game-start')
}

// 生成动物
const spawnAnimals = () => {
  const availableAnimals = ANIMAL_TYPES.slice(0, difficulty.value.animalTypes)
  visibleAnimals.value = []
  
  // 目标动物数量（至少3个）
  const targetCount = Math.max(3, Math.ceil(difficulty.value.animalCount * 0.4))
  
  // 先生成目标动物
  for (let i = 0; i < targetCount; i++) {
    visibleAnimals.value.push({
      id: nextAnimalId++,
      type: targetAnimal.value,
      emoji: ANIMAL_TYPES.find(a => a.type === targetAnimal.value)?.emoji || '🐰',
      action: targetAction.value,
      x: Math.random() * 90,
      y: Math.random() * 80,
      speed: difficulty.value.speed + Math.random() * 2
    })
  }
  
  // 再生成其他干扰动物
  const distractorCount = difficulty.value.animalCount - targetCount
  for (let i = 0; i < distractorCount; i++) {
    const animal = availableAnimals[Math.floor(Math.random() * availableAnimals.length)]
    const action = animal.actions[Math.floor(Math.random() * animal.actions.length)]
    
    // 确保不是目标动物
    if (animal.type === targetAnimal.value && action === targetAction.value) {
      continue
    }
    
    visibleAnimals.value.push({
      id: nextAnimalId++,
      type: animal.type,
      emoji: animal.emoji,
      action,
      x: Math.random() * 90,
      y: Math.random() * 80,
      speed: difficulty.value.speed + Math.random() * 2
    })
  }
  
  // 打乱顺序
  visibleAnimals.value.sort(() => Math.random() - 0.5)
}

// 定时补充动物
let spawnInterval: number | null = null

const startSpawning = () => {
  spawnInterval = window.setInterval(() => {
    if (isPaused.value || visibleAnimals.value.length >= 20) return
    
    // 随机添加一只动物
    const availableAnimals = ANIMAL_TYPES.slice(0, difficulty.value.animalTypes)
    const animal = availableAnimals[Math.floor(Math.random() * availableAnimals.length)]
    const action = animal.actions[Math.floor(Math.random() * animal.actions.length)]
    
    visibleAnimals.value.push({
      id: nextAnimalId++,
      type: animal.type,
      emoji: animal.emoji,
      action,
      x: Math.random() * 90,
      y: Math.random() * 80,
      speed: difficulty.value.speed + Math.random() * 2
    })
  }, 3000) // 每3秒补充一只
}

const stopSpawning = () => {
  if (spawnInterval) {
    clearInterval(spawnInterval)
    spawnInterval = null
  }
}

onMounted(() => {
  initLevel()
  // 播放BGM
  audioManager.playBGM(buildBGMUrl('animal-observer-bgm.mp3'))
})

onUnmounted(() => {
  stopSpawning()
  // 停止BGM
  audioManager.dispose()
})

// 判断是否正确动物
const isCorrectAnimal = (animal: Animal) => {
  return animal.type === targetAnimal.value && animal.action === targetAction.value
}

// 点击动物
const handleAnimalClick = (animal: Animal) => {
  if (clickedAnimals.value.includes(animal.id) || wrongAnimals.value.includes(animal.id)) {
    return // 已点击过
  }

  if (isCorrectAnimal(animal)) {
    // 正确！
    clickedAnimals.value.push(animal.id)
    correctClicks.value++
    combo.value++
    maxCombo.value = Math.max(maxCombo.value, combo.value)
    
    const points = 100 * combo.value
    score.value += points
    
    playSound('correct')
    playVoice('correct')
    
    ElMessage.success(`+${points}分！${combo.value > 1 ? combo.value + '连击！' : ''}`)
    
    // 检查是否完成
    if (correctClicks.value >= requiredClicks.value) {
      handleLevelComplete()
    }
  } else {
    // 错误！
    wrongAnimals.value.push(animal.id)
    wrongClicks.value++
    combo.value = 0
    lives.value--
    
    playSound('wrong')
    playVoice('wrong')
    
    ElMessage.error('哎呀，点错啦！')
    
    // 检查生命值
    if (lives.value <= 0) {
      handleGameOver()
    }
  }
}

// 使用慢动作
const handleSlowMotion = () => {
  if (slowMotionLeft.value === 0) return
  
  slowMotionLeft.value--
  isSlowMotion.value = true
  
  // 所有动物速度减半
  visibleAnimals.value.forEach(animal => {
    animal.speed *= 2
  })
  
  playSound('slow-motion')
  ElMessage.success('⏱️ 慢动作激活！持续10秒')
  
  // 10秒后恢复
  setTimeout(() => {
    isSlowMotion.value = false
    visibleAnimals.value.forEach(animal => {
      animal.speed /= 2
    })
    ElMessage.info('慢动作结束')
  }, 10000)
}

// 关卡完成
const handleLevelComplete = () => {
  stopSpawning()
  
  // 计算星级
  const accuracy = correctClicks.value / (correctClicks.value + wrongClicks.value)
  if (accuracy === 1 && lives.value === 3) {
    starsEarned.value = 3
  } else if (accuracy >= 0.8 && lives.value >= 2) {
    starsEarned.value = 2
  } else {
    starsEarned.value = 1
  }
  
  playVoice('level-complete')
  showCompletionDialog.value = true
}

// 游戏失败
const handleGameOver = () => {
  stopSpawning()
  playVoice('gameover')
  showGameOverDialog.value = true
}

// 获取评级
const getGrade = () => {
  if (starsEarned.value === 3) return '完美观察家！'
  if (starsEarned.value === 2) return '优秀观察员！'
  return '努力观察者！'
}

// 下一关
const handleNextLevel = () => {
  currentLevel.value++
  lives.value = 3
  slowMotionLeft.value = 2
  showCompletionDialog.value = false
  initLevel()
  
  ElMessage.success(`进入第${currentLevel.value}关！`)
}

// 重新开始
const handleRestart = () => {
  score.value = 0
  lives.value = 3
  slowMotionLeft.value = 2
  showGameOverDialog.value = false
  showCompletionDialog.value = false
  initLevel()
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

// 返回
const handleBack = () => {
  router.push('/parent-center/games')
}

// 音频
const playSound = (type: string) => {
  const soundMap: Record<string, string> = {
    'correct': buildSFXUrl('correct.mp3'),
    'wrong': buildSFXUrl('wrong.mp3'),
    'slow-motion': buildSFXUrl('slow-motion.mp3')
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
    voicePath = buildVoiceUrl(`correct-${randomNum}.mp3`, 'animal-observer')
  } else if (type === 'wrong') {
    const randomNum = Math.floor(Math.random() * 2) + 1
    voicePath = buildVoiceUrl(`wrong-${randomNum}.mp3`, 'animal-observer')
  } else {
    const voiceMap: Record<string, string> = {
      'game-start': 'game-start.mp3',
      'level-complete': 'level-complete.mp3',
      'gameover': 'gameover.mp3'
    }
    const fileName = voiceMap[type]
    if (fileName) {
      voicePath = buildVoiceUrl(fileName, 'animal-observer')
    }
  }

  if (!voicePath) return

  const audio = new Audio(voicePath)
  audio.volume = 0.8
  audio.play().catch(err => console.log('语音播放失败:', err))
}
</script>

<style scoped lang="scss">
.help-content {
  h2 { color: var(--success-color); font-size: var(--text-3xl); margin: 0 0 var(--spacing-sm) 0; }
  .game-intro { font-size: var(--text-lg); color: var(--text-regular); margin-bottom: var(--text-3xl); padding: var(--text-sm); background: var(--bg-hover); border-radius: var(--spacing-sm); }
  .help-section { margin-bottom: var(--text-3xl);
    h3 { font-size: var(--text-xl); color: var(--text-primary); margin: 0 0 var(--text-sm) 0; padding-bottom: var(--spacing-sm); border-2: 16311px solid var(--border-color); }
    ol, ul { margin: 0; padding-left: var(--text-3xl);
      li { margin-bottom: var(--spacing-sm); line-height: 1.6; color: var(--text-regular); strong { color: var(--success-color); } }
    }
    .tip { margin-top: var(--text-sm); padding: var(--spacing-sm) var(--text-sm); background: var(--bg-white)3e0; border-left: var(--spacing-xs) solid var(--color-primary-500); color: var(--color-primary-500); font-size: var(--text-base); border-radius: var(--spacing-xs); }
    &.tips { background: var(--success-light-bg); padding: var(--text-lg); border-radius: var(--spacing-sm); border: var(--spacing-xs) solid var(--success-color);
      h3 { color: var(--color-primary-500); border-bottom-color: var(--success-color); }
      ul li { color: var(--color-primary-500); }
    }
  }
}

.animal-observer-game {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--success-light-bg) 0%, var(--color-primary-500) 50%, var(--color-primary-500) 100%);
  padding: var(--text-2xl);
  position: relative;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;

  // 背景装饰
  &::before {
    content: '🌳';
    position: absolute;
    top: 5%;
    left: 3%;
    font-size: var(--text-6xl);
    opacity: 0.2;
  }

  &::after {
    content: '☀️';
    position: absolute;
    top: 8%;
    right: 5%;
    font-size: var(--text-5xl);
    opacity: 0.3;
  }
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-overlay);
  border-radius: var(--text-2xl);
  box-shadow: var(--shadow-lg);
  margin-bottom: var(--text-2xl);

  .header-left,
  .header-right {
    display: flex;
  // malformed CSS removed
    align-items: center;
  }

  .header-center {
    flex: 1;
    text-align: center;

    .game-info {
      display: flex;
  // malformed CSS removed
      justify-content: center;
      align-items: center;

      .level-badge {
        background: linear-gradient(135deg, var(--success-color), var(--success-color));
        color: white;
        padding: var(--spacing-sm) var(--text-2xl);
        border-radius: var(--text-2xl);
        font-weight: bold;
        font-size: var(--text-lg);
      }

      .score {
        font-size: var(--text-2xl);
        font-weight: bold;
        color: var(--success-color);
      }
    }
  }

  .lives {
    font-size: var(--text-2xl);
    font-weight: bold;
    color: var(--danger-color);
  }

  .combo {
    font-size: var(--text-xl);
    font-weight: bold;
    color: var(--warning-color);
    animation: combo-pulse 0.5s ease-in-out infinite;
  }
}

.game-container {
  // malformed CSS removed
  margin: 0 auto;
}

.mission-banner {
  text-align: center;
  background: var(--bg-overlay);
  padding: var(--text-2xl);
  margin-bottom: var(--text-2xl);
  box-shadow: var(--shadow-md);

  h2 {
    font-size: var(--text-3xl);
    color: var(--success-color);
  // malformed CSS removed
  }

  p {
    font-size: var(--text-xl);
    color: var(--text-regular);
  }
}

.animal-scene {
  position: relative;
  width: 100%;
  // malformed CSS removed
  background: linear-gradient(to bottom, var(--info-color) 0%, var(--success-light-bg) 100%);
  border-radius: var(--text-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  margin-bottom: var(--text-2xl);

  // 地面
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
  // malformed CSS removed
    background: linear-gradient(to bottom, transparent, var(--success-color-light));
  }
}

.animal {
  position: absolute;
  cursor: pointer;
  transition: transform 0.2s ease;
  z-index: var(--z-index-sticky);

  &.correct {
    .animal-sprite {
      filter: drop-shadow(0 0 var(--spacing-lg) var(--success-color-glow));
    }
  }

  &.clicked {
    pointer-events: none;
    opacity: var(--opacity-disabled);
  }

  &.wrong {
    animation: shake 0.5s ease;
  }

  .animal-sprite {
    font-size: var(--text-5xl);
    transition: all 0.3s ease;
    display: inline-block;

    &.跳 {
      animation: jump 1s ease-in-out infinite;
    }

    &.跑 {
      animation: run 0.8s linear infinite;
    }

    &.走 {
      animation: walk 1.5s ease-in-out infinite;
    }

    &.飞 {
      animation: fly 2s ease-in-out infinite;
    }

    &.吃,
    &.坐,
    &.睡,
    &.站,
    &.爬 {
      animation: idle 3s ease-in-out infinite;
    }
  }

  &:hover:not(.clicked):not(.wrong) {
    transform: scale(var(--scale-hover));
  }

  .click-feedback,
  .wrong-feedback {
    position: absolute;
    top: var(--position-negative-2xl);
    right: var(--position-negative-2xl);
  // malformed CSS removed
  // malformed CSS removed
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-2xl);
    animation: feedback-pop 0.5s ease-out;
  }

  .click-feedback {
    background: var(--success-color);
    color: white;
  }

  .wrong-feedback {
    background: var(--danger-color);
    color: white;
  }
}

.progress-panel {
  background: var(--bg-overlay);
  padding: var(--text-2xl);
  margin-bottom: var(--text-2xl);
  box-shadow: var(--shadow-md);

  .progress-label {
    font-size: var(--text-xl);
    font-weight: bold;
    color: var(--success-color);
  // malformed CSS removed
  }
}

.game-controls {
  display: flex;
  justify-content: center;
  gap: var(--text-2xl);

  .el-button {
    font-size: var(--text-lg);
  // malformed CSS removed
  // malformed CSS removed
  }
}

.completion-content,
.gameover-content {
  text-align: center;
  padding: var(--text-2xl);

  .stars {
    display: flex;
    justify-content: center;
    gap: var(--spacing-sm);

    .star {
      font-size: var(--text-5xl);
      color: var(--warning-color);
      animation: star-pop 0.5s ease-out;

      &.star-1 { animation-delay: 0s; }
      &.star-2 { animation-delay: 0.2s; }
      &.star-3 { animation-delay: 0.4s; }
    }
  }

  .score-info,
  p {
    font-size: var(--text-lg);
    margin: var(--spacing-sm) 0;
    color: var(--text-regular);

    &.grade {
      font-size: var(--text-3xl);
      font-weight: bold;
      color: var(--success-color);
  // malformed CSS removed
    }
  }
}

@keyframes jump {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(var(--spacing-3xl)); }
}

@keyframes run {
  0%, 100% { transform: translateX(0) scaleX(1); }
  50% { transform: translateX(var(--spacing-lg)) scaleX(1.05); }
}

@keyframes walk {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(var(--spacing-sm)); }
}

@keyframes fly {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(var(--spacing-lg)) rotate(5deg); }
}

@keyframes idle {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(var(--scale-small)); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(var(--spacing-lg)); }
  75% { transform: translateX(calc(var(--spacing-lg) * -1)); }
}

@keyframes combo-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(var(--scale-medium)); }
}

@keyframes feedback-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(var(--scale-hover));
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes star-pop {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(var(--scale-hover)) rotate(180deg);
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
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

