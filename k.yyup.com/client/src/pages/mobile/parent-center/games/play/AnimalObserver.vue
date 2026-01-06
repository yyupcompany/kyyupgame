<template>
  <MobileLayout
    title="动物观察员"
    :show-back="true"
    :show-nav-bar="true"
    @back="handleBack"
  >
    <div class="mobile-animal-observer">
      <!-- 游戏状态栏 -->
      <div class="game-status-bar">
        <div class="level-info">
          <span class="level-badge">第{{ currentLevel }}关</span>
        </div>
        <div class="score-info">
          <span class="score">得分: {{ score }}</span>
        </div>
        <div class="lives-info">
          <span class="lives">❤️ × {{ lives }}</span>
        </div>
      </div>

      <!-- 任务提示区 -->
      <div class="mission-area">
        <div class="mission-icon">🎯</div>
        <div class="mission-text">
          <h3>{{ currentMission }}</h3>
          <p>点击所有{{ targetDescription }}的{{ targetAnimal }}！</p>
        </div>
      </div>

      <!-- 动物场景 -->
      <div class="animal-scene" ref="sceneRef">
        <div
          v-for="animal in visibleAnimals"
          :key="animal.id"
          class="animal"
          :class="{
            'correct-target': isCorrectAnimal(animal),
            'clicked': clickedAnimals.includes(animal.id),
            'wrong-click': wrongAnimals.includes(animal.id)
          }"
          :style="getAnimalStyle(animal)"
          @click="handleAnimalClick(animal)"
        >
          <div class="animal-sprite" :class="animal.action">
            {{ animal.emoji }}
          </div>
          <div class="click-feedback" v-if="clickedAnimals.includes(animal.id)">
            <UnifiedIcon name="Check" size="20" />
          </div>
          <div class="wrong-feedback" v-if="wrongAnimals.includes(animal.id)">
            <UnifiedIcon name="Close" size="20" />
          </div>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="progress-area">
        <div class="progress-text">
          完成进度: {{ correctClicks }}/{{ requiredClicks }}
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{
              width: progressPercentage + '%',
              backgroundColor: progressColor
            }"
          ></div>
        </div>
      </div>

      <!-- 连击提示 -->
      <div class="combo-indicator" v-if="combo > 1">
        <span class="combo-text">🔥 {{ combo }}连击!</span>
      </div>

      <!-- 控制按钮区 -->
      <div class="control-area">
        <button
          class="control-btn slow-motion-btn"
          @click="handleSlowMotion"
          :disabled="slowMotionLeft === 0"
          :class="{ disabled: slowMotionLeft === 0 }"
        >
          <UnifiedIcon name="Clock" size="16" />
          <span>慢动作 ({{ slowMotionLeft }})</span>
        </button>

        <button class="control-btn pause-btn" @click="handlePause">
          <UnifiedIcon :name="isPaused ? 'VideoPlay' : 'VideoPause'" size="16" />
          <span>{{ isPaused ? '继续' : '暂停' }}</span>
        </button>

        <button class="control-btn restart-btn" @click="handleRestart">
          <UnifiedIcon name="Refresh" size="16" />
          <span>重新开始</span>
        </button>
      </div>

      <!-- 帮助按钮 -->
      <div class="help-area">
        <button class="help-btn" @click="showHelp = true">
          <UnifiedIcon name="QuestionFilled" size="16" />
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
        <h2>🎉 关卡完成！</h2>
        <div class="score-info">
          <p>最终得分：{{ score }}</p>
          <p>正确点击：{{ correctClicks }}</p>
          <p>错误点击：{{ wrongClicks }}</p>
          <p>最高连击：{{ maxCombo }}</p>
          <p class="grade">{{ getGrade() }}</p>
        </div>
      </div>

      <div class="completion-actions">
        <van-button type="primary" block @click="handleNextLevel">下一关</van-button>
        <van-button @click="handleBack" block>返回大厅</van-button>
      </div>
    </van-popup>

    <!-- 游戏失败弹窗 -->
    <van-popup
      v-model:show="showGameOverDialog"
      position="center"
      round
      :style="{ width: '85%' }"
    >
      <div class="gameover-content">
        <h2>💔 游戏结束</h2>
        <p>生命值耗尽！</p>
        <div class="score-info">
          <p>最终得分：{{ score }}</p>
          <p>完成度：{{ correctClicks }}/{{ requiredClicks }}</p>
        </div>
      </div>

      <div class="gameover-actions">
        <van-button type="primary" block @click="handleRestart">再试一次</van-button>
        <van-button @click="handleBack" block>返回大厅</van-button>
      </div>
    </van-popup>
  </MobileLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showFailToast } from 'vant'
import MobileLayout from '@/pages/mobile/layouts/MobileLayout.vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import { audioManager } from '../../parent-center/games/utils/audioManager'
import { buildBGMUrl, buildSFXUrl, buildVoiceUrl } from '@/utils/oss-url-builder'

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
const sceneRef = ref<HTMLElement>()

// 当前任务
const targetAnimal = ref('兔子')
const targetAction = ref('跳')
const targetDescription = computed(() => `在${targetAction.value}`)

const currentMission = computed(() =>
  `找出所有${targetDescription.value}的${targetAnimal.value}！`
)

// 难度配置
const difficulty = computed(() => {
  if (currentLevel.value <= 2) return { animalTypes: 3, animalCount: 6, speed: 10 }
  if (currentLevel.value <= 4) return { animalTypes: 5, animalCount: 8, speed: 8 }
  return { animalTypes: 7, animalCount: 10, speed: 6 }
})

// 需要点击的正确动物数量
const requiredClicks = computed(() => {
  return visibleAnimals.value.filter(animal =>
    animal.type === targetAnimal.value && animal.action === targetAction.value
  ).length
})

// 进度百分比
const progressPercentage = computed(() => {
  if (requiredClicks.value === 0) return 0
  return Math.round((correctClicks.value / requiredClicks.value) * 100)
})

// 进度条颜色
const progressColor = computed(() => {
  if (progressPercentage.value < 33) return 'var(--van-danger-color)'
  if (progressPercentage.value < 66) return 'var(--van-warning-color)'
  return 'var(--van-success-color)'
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
  directionX: number
  directionY: number
}

const visibleAnimals = ref<Animal[]>([])
let nextAnimalId = 0
let animationFrameId: number | null = null

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

  playVoice('game-start')
}

// 生成动物
const spawnAnimals = () => {
  const availableAnimals = ANIMAL_TYPES.slice(0, difficulty.value.animalTypes)
  visibleAnimals.value = []

  // 目标动物数量（至少2个）
  const targetCount = Math.max(2, Math.floor(difficulty.value.animalCount * 0.4))

  // 先生成目标动物
  for (let i = 0; i < targetCount; i++) {
    visibleAnimals.value.push(createAnimal(targetAnimal.value, targetAction.value))
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

    visibleAnimals.value.push(createAnimal(animal.type, action))
  }

  // 打乱顺序
  visibleAnimals.value.sort(() => Math.random() - 0.5)
}

// 创建单个动物
const createAnimal = (type: string, action: string): Animal => {
  const animalType = ANIMAL_TYPES.find(a => a.type === type)
  return {
    id: nextAnimalId++,
    type,
    emoji: animalType?.emoji || '🐰',
    action,
    x: Math.random() * 80 + 10, // 留边距
    y: Math.random() * 70 + 15, // 留边距
    speed: difficulty.value.speed + Math.random() * 2,
    directionX: (Math.random() - 0.5) * 2,
    directionY: (Math.random() - 0.5) * 2
  }
}

// 获取动物样式
const getAnimalStyle = (animal: Animal) => {
  return {
    left: animal.x + '%',
    top: animal.y + '%',
    transform: 'translate(-50%, -50%)',
    transition: 'all 0.1s linear'
  }
}

// 动画循环
const animate = () => {
  if (!isPaused.value) {
    visibleAnimals.value.forEach(animal => {
      // 跳过已点击的动物
      if (clickedAnimals.value.includes(animal.id)) return

      // 更新位置
      animal.x += animal.directionX * (isSlowMotion.value ? 0.3 : 1)
      animal.y += animal.directionY * (isSlowMotion.value ? 0.3 : 1)

      // 边界检测和反弹
      if (animal.x <= 5 || animal.x >= 95) {
        animal.directionX *= -1
        animal.x = Math.max(5, Math.min(95, animal.x))
      }
      if (animal.y <= 5 || animal.y >= 85) {
        animal.directionY *= -1
        animal.y = Math.max(5, Math.min(85, animal.y))
      }
    })
  }

  animationFrameId = requestAnimationFrame(animate)
}

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

    showSuccessToast(`+${points}分！${combo.value > 1 ? combo.value + '连击！' : ''}`)

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

    showFailToast('哎呀，点错啦！')

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

  playSound('slow-motion')
  showToast('⏱️ 慢动作激活！持续10秒')

  // 10秒后恢复
  setTimeout(() => {
    isSlowMotion.value = false
    showToast('慢动作结束')
  }, 10000)
}

// 关卡完成
const handleLevelComplete = () => {
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

  showToast(`进入第${currentLevel.value}关！`)
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
    showToast('游戏已暂停')
    audioManager.pauseBGM?.()
  } else {
    showToast('游戏继续')
    audioManager.resumeBGM?.()
  }
}

// 返回
const handleBack = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  router.push('/mobile/parent-center/games')
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

onMounted(async () => {
  await nextTick()
  initLevel()
  animate()

  // 播放BGM
  try {
    audioManager.playBGM(buildBGMUrl('animal-observer-bgm.mp3'))
  } catch (error) {
    console.log('BGM播放失败:', error)
  }
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  audioManager.dispose()
})
</script>

<style scoped lang="scss">
.mobile-animal-observer {
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 50%, #a5d6a7 100%);
  padding: var(--van-padding-sm);
  position: relative;
  overflow: hidden;

  // 背景装饰
  &::before {
    content: '🌳';
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: var(--text-2xl);
    opacity: 0.3;
  }

  &::after {
    content: '☀️';
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: var(--text-xl);
    opacity: 0.4;
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
    background: linear-gradient(135deg, #4caf50, #66bb6a);
    color: white;
    padding: var(--spacing-xs) 12px;
    border-radius: var(--van-radius-md);
    font-size: var(--text-xs);
    font-weight: bold;
  }

  .score-info .score {
    font-size: var(--text-base);
    font-weight: bold;
    color: #4caf50;
  }

  .lives-info .lives {
    font-size: var(--text-base);
    font-weight: bold;
    color: #f44336;
  }
}

// 任务提示区
.mission-area {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--van-radius-lg);
  padding: var(--van-padding-sm);
  margin-bottom: var(--van-padding-sm);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .mission-icon {
    font-size: var(--text-4xl);
    margin-right: var(--van-padding-sm);
    flex-shrink: 0;
  }

  .mission-text {
    flex: 1;

    h3 {
      font-size: var(--text-lg);
      color: #4caf50;
      margin: 0 0 4px 0;
    }

    p {
      font-size: var(--text-sm);
      color: #666;
      margin: 0;
    }
  }
}

// 动物场景
.animal-scene {
  position: relative;
  width: 100%;
  height: 300px;
  background: linear-gradient(to bottom, #87ceeb 0%, #e8f5e8 100%);
  border-radius: var(--van-radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: var(--van-padding-sm);

  // 地面效果
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 40px;
    background: linear-gradient(to bottom, transparent, rgba(76, 175, 80, 0.3));
  }
}

.animal {
  position: absolute;
  cursor: pointer;
  transition: transform 0.2s ease;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;

  &.correct-target {
    .animal-sprite {
      filter: drop-shadow(0 0 10px #4caf50);
    }
  }

  &.clicked {
    pointer-events: none;
    opacity: 0.5;
  }

  &.wrong-click {
    animation: shake 0.5s ease;
  }

  .animal-sprite {
    font-size: var(--text-4xl);
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

  &:active:not(.clicked):not(.wrong-click) {
    transform: scale(1.1);
  }

  .click-feedback,
  .wrong-feedback {
    position: absolute;
    top: -10px;
    right: -10px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-sm);
    animation: feedback-pop 0.5s ease-out;
  }

  .click-feedback {
    background: #4caf50;
    color: white;
  }

  .wrong-feedback {
    background: #f44336;
    color: white;
  }
}

// 进度区域
.progress-area {
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--van-radius-lg);
  padding: var(--van-padding-sm);
  margin-bottom: var(--van-padding-sm);

  .progress-text {
    font-size: var(--text-sm);
    font-weight: bold;
    color: #4caf50;
    margin-bottom: 8px;
    text-align: center;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      transition: width 0.3s ease;
      border-radius: 4px;
    }
  }
}

// 连击指示器
.combo-indicator {
  text-align: center;
  margin-bottom: var(--van-padding-sm);

  .combo-text {
    display: inline-block;
    background: linear-gradient(135deg, #ff9800, #ffb74d);
    color: white;
    padding: 6px 16px;
    border-radius: var(--van-radius-md);
    font-size: var(--text-sm);
    font-weight: bold;
    animation: combo-pulse 0.5s ease-in-out infinite;
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
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 40px;
    border: none;
    border-radius: var(--van-radius-md);
    font-size: var(--text-xs);
    font-weight: 500;
    transition: all 0.2s ease;

    &.slow-motion-btn {
      background: linear-gradient(135deg, #2196f3, #42a5f5);
      color: white;

      &.disabled {
        background: #ccc;
        color: #999;
        cursor: not-allowed;
      }
    }

    &.pause-btn {
      background: linear-gradient(135deg, #ff9800, #ffb74d);
      color: white;
    }

    &.restart-btn {
      background: linear-gradient(135deg, #9c27b0, #ba68c8);
      color: white;
    }

    &:active {
      transform: scale(0.95);
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
  }
}

// 帮助内容样式
.help-content {
  padding: var(--van-padding-md);
  max-height: 70vh;
  overflow-y: auto;

  h2 {
    color: #4caf50;
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
          color: #4caf50;
        }
      }
    }

    &.tips {
      background: #e8f5e8;
      padding: var(--van-padding-sm);
      border-radius: var(--van-radius-sm);
      border: 1px solid #4caf50;

      h3 {
        color: #2196f3;
        border-bottom-color: #4caf50;
      }

      ul li {
        color: #2196f3;
      }
    }
  }
}

.help-actions,
.completion-actions,
.gameover-actions {
  padding: var(--van-padding-sm);
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: var(--van-padding-xs);
}

// 完成内容样式
.completion-content,
.gameover-content {
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
    color: #4caf50;
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
        color: #4caf50;
        margin-top: var(--van-padding-sm);
      }
    }
  }
}

// 动画定义
@keyframes jump {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes run {
  0%, 100% { transform: translateX(0) scaleX(1); }
  50% { transform: translateX(5px) scaleX(1.05); }
}

@keyframes walk {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(2px); }
}

@keyframes fly {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-5px) rotate(5deg); }
}

@keyframes idle {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(0.95); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
}

@keyframes combo-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes feedback-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
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
    transform: scale(1.1) rotate(180deg);
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
}

// 移动端适配
@media (max-width: var(--breakpoint-xs)) {
  .animal-scene {
    height: 250px;
  }

  .animal .animal-sprite {
    font-size: var(--text-3xl);
  }

  .control-area {
    .control-btn {
      font-size: 11px;
      height: 36px;
    }
  }
}

@media (max-width: 360px) {
  .game-status-bar {
    .level-info .level-badge,
    .score-info .score,
    .lives-info .lives {
      font-size: var(--text-sm);
    }
  }

  .mission-area {
    .mission-text {
      h3 {
        font-size: var(--text-base);
      }

      p {
        font-size: var(--text-xs);
      }
    }
  }
}
</style>