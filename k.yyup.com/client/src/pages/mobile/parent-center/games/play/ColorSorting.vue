<template>
  <MobileLayout
    title="颜色分类达人"
    :show-back="true"
    :show-nav-bar="true"
    @back="handleBack"
  >
    <div class="mobile-color-sorting">
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

      <!-- 游戏说明 -->
      <div class="game-intro">
        <h3>🎨 颜色分类达人</h3>
        <p>把物品拖到对应颜色的篮子里！</p>
      </div>

      <!-- 传送带区域 -->
      <div class="conveyor-area">
        <div class="conveyor-belt">
          <div class="belt-line"></div>
          <div
            v-for="item in conveyorItems"
            :key="item.id"
            class="conveyor-item"
            :class="{
              'grabbed': draggedItem?.id === item.id,
              'dragging': draggedItem?.id === item.id
            }"
            :style="{ left: item.position + '%' }"
            @touchstart="handleTouchStart(item, $event)"
            @touchmove="handleTouchMove($event)"
            @touchend="handleTouchEnd($event)"
            @mousedown="handleMouseDown(item)"
          >
            <div class="item-icon" :style="{ color: item.color }">
              {{ item.icon }}
            </div>
            <div class="item-glow" v-if="draggedItem?.id === item.id"></div>
          </div>
        </div>
      </div>

      <!-- 拖拽中的物品 -->
      <div
        v-if="draggedItem"
        class="dragging-item"
        :style="{
          left: dragPosition.x + 'px',
          top: dragPosition.y + 'px'
        }"
      >
        <div class="item-icon" :style="{ color: draggedItem.color }">
          {{ draggedItem.icon }}
        </div>
      </div>

      <!-- 分类篮子 -->
      <div class="baskets-area">
        <div
          v-for="basket in activeBaskets"
          :key="basket.colorKey"
          class="basket"
          :class="{
            'active': dragOverBasket === basket.colorKey,
            'highlight': dragOverBasket === basket.colorKey
          }"
          :style="{ borderColor: basket.color }"
          @touchmove="handleBasketTouchMove(basket, $event)"
          @touchend="handleBasketTouchEnd(basket)"
        >
          <div class="basket-icon" :style="{ color: basket.color }">🧺</div>
          <div class="basket-label" :style="{ color: basket.color }">{{ basket.name }}</div>
          <div class="basket-count">{{ basket.count }}</div>
          <div class="basket-target" v-if="basket.target > 0">
            目标: {{ basket.target }}
          </div>
        </div>
      </div>

      <!-- 连击提示 -->
      <div class="combo-indicator" v-if="combo > 1">
        <span class="combo-text">🔥 {{ combo }}连击!</span>
      </div>

      <!-- 控制按钮区 -->
      <div class="control-area">
        <button
          class="control-btn speed-btn"
          @click="handleSpeedControl"
          :disabled="slowDownLeft === 0"
          :class="{ disabled: slowDownLeft === 0 }"
        >
          <UnifiedIcon name="Clock" size="16" />
          <span>减速 ({{ slowDownLeft }})</span>
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

      <!-- 进度显示 -->
      <div class="progress-info">
        <div class="progress-text">
          正确分类: {{ correctSorts }} | 错误: {{ wrongSorts }}
        </div>
        <div class="accuracy" v-if="totalSorts > 0">
          准确率: {{ accuracy }}%
        </div>
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
        <h2>🎨 颜色分类达人</h2>
        <p class="game-intro">按颜色对传送带上的物品进行分类，培养分类思维和反应能力</p>

        <div class="help-section">
          <h3>📖 游戏规则</h3>
          <ol>
            <li>物品会在传送带上移动</li>
            <li>点击并拖动物品到对应颜色的收纳箱</li>
            <li>分类正确得分，分类错误扣生命</li>
            <li>达到目标分类数量即可过关</li>
          </ol>
        </div>

        <div class="help-section">
          <h3>🎯 游戏目标</h3>
          <ul>
            <li>正确识别物品颜色</li>
            <li>快速分类到对应箱子</li>
            <li>达到目标分类数量</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>📈 难度递增</h3>
          <ul>
            <li><strong>第1-2关</strong>: 3种颜色，速度慢</li>
            <li><strong>第3-4关</strong>: 4种颜色，速度中等</li>
            <li><strong>第5关+</strong>: 5种颜色，速度快</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>🎮 特殊机制</h3>
          <ul>
            <li><strong>⚡ 传送带</strong>: 速度随关卡递增</li>
            <li><strong>🎯 目标数</strong>: 每关需要分类的物品数</li>
            <li><strong>❤️ 生命值</strong>: 分类错误扣生命</li>
          </ul>
        </div>

        <div class="help-section tips">
          <h3>💡 游戏技巧</h3>
          <ul>
            <li>提前看好目标物品的颜色</li>
            <li>手指准备好对应的收纳箱位置</li>
            <li>不要等到最后一刻才拖拽</li>
            <li>多种颜色时先处理常见的</li>
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
        <h2>🎉 颜色大师！</h2>
        <div class="score-info">
          <p>最终得分：{{ score }}</p>
          <p>准确率：{{ accuracy }}%</p>
          <p>正确分类：{{ correctSorts }}</p>
          <p>错误分类：{{ wrongSorts }}</p>
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
          <p>正确分类：{{ correctSorts }}</p>
          <p>准确率：{{ accuracy }}%</p>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
const slowDownLeft = ref(2)
const correctSorts = ref(0)
const wrongSorts = ref(0)
const showCompletionDialog = ref(false)
const showGameOverDialog = ref(false)
const starsEarned = ref(0)
const isPaused = ref(false)
const showHelp = ref(false)

// 拖拽状态
const draggedItem = ref<any>(null)
const dragPosition = ref({ x: 0, y: 0 })
const dragOverBasket = ref('')

// 物品和篮子
interface ConveyorItem {
  id: number
  icon: string
  color: string
  colorName: string
  position: number
}

interface Basket {
  colorKey: string
  name: string
  color: string
  count: number
  target?: number
}

const conveyorItems = ref<ConveyorItem[]>([])
const baskets = ref<Basket[]>([])
let nextItemId = 0

// 颜色物品库
const COLOR_ITEMS = {
  red: [
    { icon: '🍎', name: '苹果' },
    { icon: '🚗', name: '汽车' },
    { icon: '❤️', name: '爱心' },
    { icon: '🌹', name: '玫瑰' }
  ],
  orange: [
    { icon: '🍊', name: '橙子' },
    { icon: '🎃', name: '南瓜' },
    { icon: '🦊', name: '狐狸' },
    { icon: '🥕', name: '胡萝卜' }
  ],
  yellow: [
    { icon: '🍌', name: '香蕉' },
    { icon: '☀️', name: '太阳' },
    { icon: '🐥', name: '小鸡' },
    { icon: '⭐', name: '星星' }
  ],
  green: [
    { icon: '🍀', name: '叶子' },
    { icon: '🐸', name: '青蛙' },
    { icon: '🥒', name: '黄瓜' },
    { icon: '🌳', name: '树' }
  ],
  blue: [
    { icon: '💙', name: '心' },
    { icon: '🌊', name: '海洋' },
    { icon: '🫐', name: '蓝莓' },
    { icon: '🐋', name: '鲸鱼' }
  ]
}

// 基础篮子配置
const BASE_BASKETS = [
  { colorKey: 'red', name: '红色', color: '#ff4444' },
  { colorKey: 'orange', name: '橙色', color: '#ff8800' },
  { colorKey: 'yellow', name: '黄色', color: '#ffdd00' },
  { colorKey: 'green', name: '绿色', color: '#00cc00' },
  { colorKey: 'blue', name: '蓝色', color: '#0088ff' }
]

// 计算属性
const activeBaskets = computed(() => {
  const basketCount = Math.min(3 + Math.floor(currentLevel.value / 2), 5)
  return BASE_BASKETS.slice(0, basketCount).map((basket, index) => ({
    ...basket,
    count: baskets.value[index]?.count || 0,
    target: Math.max(5, 10 - currentLevel.value)
  }))
})

const totalSorts = computed(() => correctSorts.value + wrongSorts.value)
const accuracy = computed(() => {
  return totalSorts.value > 0 ? Math.round((correctSorts.value / totalSorts.value) * 100) : 100
})

// 游戏配置
const getConveyorSpeed = () => {
  const baseSpeed = 0.8
  const speedIncrease = (currentLevel.value - 1) * 0.2
  return Math.max(baseSpeed + speedIncrease, 0.4)
}

const getTargetSorts = () => {
  return Math.max(10, 20 - currentLevel.value * 2)
}

// 定时器
let spawnInterval: number | null = null
let moveInterval: number | null = null

// 初始化游戏
const initLevel = () => {
  conveyorItems.value = []
  baskets.value = activeBaskets.value.map(basket => ({ ...basket, count: 0 }))

  correctSorts.value = 0
  wrongSorts.value = 0
  combo.value = 0

  startSpawning()
  startMoving()

  playVoice('game-start')
}

// 开始生成物品
const startSpawning = () => {
  spawnInterval = window.setInterval(() => {
    if (isPaused.value || conveyorItems.value.length >= 6) return
    spawnItem()
  }, 2000)
}

// 生成新物品
const spawnItem = () => {
  const basket = activeBaskets.value[Math.floor(Math.random() * activeBaskets.value.length)]
  const items = COLOR_ITEMS[basket.colorKey as keyof typeof COLOR_ITEMS]
  const item = items[Math.floor(Math.random() * items.length)]

  conveyorItems.value.push({
    id: nextItemId++,
    icon: item.icon,
    color: basket.color,
    colorName: basket.name,
    position: -10
  })
}

// 开始移动物品
const startMoving = () => {
  moveInterval = window.setInterval(() => {
    if (isPaused.value) return

    const speed = getConveyorSpeed()

    conveyorItems.value.forEach(item => {
      item.position += speed

      if (item.position > 110) {
        handleMissedItem(item)
      }
    })

    conveyorItems.value = conveyorItems.value.filter(item => item.position <= 110)
  }, 50)
}

// 处理错过的物品
const handleMissedItem = (item: ConveyorItem) => {
  lives.value--
  combo.value = 0

  if (lives.value <= 0) {
    handleGameOver()
  }

  showToast('物品错过了！')
}

// 触摸事件处理
const handleTouchStart = (item: ConveyorItem, event: TouchEvent) => {
  event.preventDefault()
  draggedItem.value = item

  const touch = event.touches[0]
  dragPosition.value = {
    x: touch.clientX,
    y: touch.clientY
  }
}

const handleTouchMove = (event: TouchEvent) => {
  if (!draggedItem.value) return

  event.preventDefault()
  const touch = event.touches[0]
  dragPosition.value = {
    x: touch.clientX,
    y: touch.clientY
  }
}

const handleTouchEnd = (event: TouchEvent) => {
  if (!draggedItem.value) return

  event.preventDefault()

  // 检查是否在篮子上
  const touch = event.changedTouches[0]
  const element = document.elementFromPoint(touch.clientX, touch.clientY)
  const basketElement = element?.closest('.basket')

  if (basketElement) {
    const basketKey = basketElement.getAttribute('data-basket-key')
    const basket = activeBaskets.value.find(b => b.colorKey === basketKey)
    if (basket) {
      handleDrop(basket)
    }
  } else {
    // 没有放到篮子里，物品继续移动
    draggedItem.value = null
  }

  dragOverBasket.value = ''
}

// 鼠标事件处理（桌面端）
const handleMouseDown = (item: ConveyorItem) => {
  draggedItem.value = item
}

// 篮子触摸事件
const handleBasketTouchMove = (basket: Basket, event: TouchEvent) => {
  if (draggedItem.value) {
    dragOverBasket.value = basket.colorKey
  }
}

const handleBasketTouchEnd = (basket: Basket) => {
  if (draggedItem.value && dragOverBasket.value === basket.colorKey) {
    handleDrop(basket)
  }
}

// 处理物品投放
const handleDrop = (basket: Basket) => {
  if (!draggedItem.value) return

  const item = draggedItem.value

  if (item.colorName === basket.name) {
    // 正确分类
    correctSorts.value++
    combo.value++
    score.value += 100 * combo.value

    const basketIndex = baskets.value.findIndex(b => b.colorKey === basket.colorKey)
    if (basketIndex >= 0) {
      baskets.value[basketIndex].count++
    }

    playSound('correct')
    playVoice('correct')

    showSuccessToast(`+${100 * combo.value}分！${combo.value > 1 ? combo.value + '连击！' : ''}`)

    // 检查是否完成
    if (correctSorts.value >= getTargetSorts()) {
      handleLevelComplete()
    }
  } else {
    // 错误分类
    wrongSorts.value++
    combo.value = 0
    lives.value--

    playSound('wrong')
    showFailToast('颜色不对哦！')

    if (lives.value <= 0) {
      handleGameOver()
    }
  }

  // 移除物品
  conveyorItems.value = conveyorItems.value.filter(i => i.id !== item.id)
  draggedItem.value = null
  dragOverBasket.value = ''
}

// 使用减速
const handleSpeedControl = () => {
  if (slowDownLeft.value === 0) return

  slowDownLeft.value--
  showToast('⏱️ 传送带减速10秒！')

  playSound('slow-motion')
}

// 关卡完成
const handleLevelComplete = () => {
  if (spawnInterval) clearInterval(spawnInterval)
  if (moveInterval) clearInterval(moveInterval)

  // 计算星级
  if (accuracy.value === 100 && lives.value === 3) {
    starsEarned.value = 3
  } else if (accuracy.value >= 80 && lives.value >= 2) {
    starsEarned.value = 2
  } else {
    starsEarned.value = 1
  }

  playVoice('level-complete')
  showCompletionDialog.value = true
}

// 游戏失败
const handleGameOver = () => {
  if (spawnInterval) clearInterval(spawnInterval)
  if (moveInterval) clearInterval(moveInterval)

  playVoice('gameover')
  showGameOverDialog.value = true
}

// 获取评级
const getGrade = () => {
  if (starsEarned.value === 3) return '完美色彩大师！'
  if (starsEarned.value === 2) return '优秀分类员！'
  return '努力分类员！'
}

// 下一关
const handleNextLevel = () => {
  currentLevel.value++
  lives.value = 3
  slowDownLeft.value = 2
  showCompletionDialog.value = false
  initLevel()

  showToast(`进入第${currentLevel.value}关！`)
}

// 重新开始
const handleRestart = () => {
  currentLevel.value = 1
  score.value = 0
  lives.value = 3
  slowDownLeft.value = 2
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
  if (spawnInterval) clearInterval(spawnInterval)
  if (moveInterval) clearInterval(moveInterval)
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
    voicePath = buildVoiceUrl(`correct-${randomNum}.mp3`, 'color-sorting')
  } else if (type === 'wrong') {
    const randomNum = Math.floor(Math.random() * 2) + 1
    voicePath = buildVoiceUrl(`wrong-${randomNum}.mp3`, 'color-sorting')
  } else {
    const voiceMap: Record<string, string> = {
      'game-start': 'game-start.mp3',
      'level-complete': 'level-complete.mp3',
      'gameover': 'gameover.mp3'
    }
    const fileName = voiceMap[type]
    if (fileName) {
      voicePath = buildVoiceUrl(fileName, 'color-sorting')
    }
  }

  if (!voicePath) return

  const audio = new Audio(voicePath)
  audio.volume = 0.8
  audio.play().catch(err => console.log('语音播放失败:', err))
}

onMounted(() => {
  initLevel()

  // 播放BGM
  try {
    audioManager.playBGM(buildBGMUrl('color-sorting-bgm.mp3'))
  } catch (error) {
    console.log('BGM播放失败:', error)
  }
})

onUnmounted(() => {
  if (spawnInterval) clearInterval(spawnInterval)
  if (moveInterval) clearInterval(moveInterval)
  audioManager.dispose()
})
</script>

<style scoped lang="scss">
.mobile-color-sorting {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5e6 0%, #ffe0b2 50%, #ffcc80 100%);
  padding: var(--van-padding-sm);
  position: relative;
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
    background: linear-gradient(135deg, #ff9800, #ffb74d);
    color: white;
    padding: var(--spacing-xs) 12px;
    border-radius: var(--van-radius-md);
    font-size: var(--text-xs);
    font-weight: bold;
  }

  .score-info .score {
    font-size: var(--text-base);
    font-weight: bold;
    color: #ff9800;
  }

  .lives-info .lives {
    font-size: var(--text-base);
    font-weight: bold;
    color: #f44336;
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
    color: #ff9800;
    margin: 0 0 4px 0;
  }

  p {
    font-size: var(--text-sm);
    color: #666;
    margin: 0;
  }
}

// 传送带区域
.conveyor-area {
  position: relative;
  height: 120px;
  margin-bottom: var(--van-padding-sm);
}

.conveyor-belt {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, #546e7a, #607d8b, #546e7a);
  border-radius: var(--van-radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  .belt-line {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 2px;
    background: repeating-linear-gradient(
      to right,
      #37474f 0px,
      #37474f 10px,
      transparent 10px,
      transparent 20px
    );
    animation: belt-move 1s linear infinite;
  }
}

.conveyor-item {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  transition: transform 0.2s ease;

  &.grabbed {
    opacity: 0.8;
    transform: translateY(-50%) scale(1.1);
  }

  &.dragging {
    cursor: grabbing;
  }

  .item-icon {
    font-size: var(--text-3xl);
    filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
  }

  .item-glow {
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border: 2px solid currentColor;
    border-radius: 50%;
    animation: glow-pulse 1s ease-in-out infinite;
  }
}

// 拖拽中的物品
.dragging-item {
  position: fixed;
  top: 0;
  left: 0;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1000;
  transform: translate(-50%, -50%);

  .item-icon {
    font-size: var(--text-4xl);
    filter: drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.4));
  }
}

// 篮子区域
.baskets-area {
  display: flex;
  justify-content: space-around;
  gap: var(--van-padding-xs);
  margin-bottom: var(--van-padding-sm);
}

.basket {
  flex: 1;
  position: relative;
  background: rgba(255, 255, 255, 0.9);
  border: 3px solid;
  border-radius: var(--van-radius-lg);
  padding: var(--van-padding-xs);
  text-align: center;
  transition: all 0.3s ease;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &.active,
  &.highlight {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    background: rgba(255, 255, 255, 1);
  }

  .basket-icon {
    font-size: var(--text-2xl);
    margin-bottom: 4px;
  }

  .basket-label {
    font-size: var(--text-xs);
    font-weight: bold;
    margin-bottom: 4px;
  }

  .basket-count {
    font-size: var(--text-sm);
    font-weight: bold;
    color: #333;
  }

  .basket-target {
    font-size: 10px;
    color: #666;
    margin-top: 2px;
  }
}

// 连击指示器
.combo-indicator {
  text-align: center;
  margin-bottom: var(--van-padding-sm);

  .combo-text {
    display: inline-block;
    background: linear-gradient(135deg, #ff5722, #ff7043);
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

    &.speed-btn {
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

// 进度信息
.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--van-radius-md);
  padding: var(--van-padding-xs) var(--van-padding-sm);
  margin-bottom: var(--van-padding-sm);

  .progress-text {
    font-size: var(--text-xs);
    color: #666;
  }

  .accuracy {
    font-size: var(--text-xs);
    font-weight: bold;
    color: #4caf50;
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
    color: #ff9800;
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
          color: #ff9800;
        }
      }
    }

    &.tips {
      background: #fff3e0;
      padding: var(--van-padding-sm);
      border-radius: var(--van-radius-sm);
      border: 1px solid #ff9800;

      h3 {
        color: #ff5722;
        border-bottom-color: #ff9800;
      }

      ul li {
        color: #ff5722;
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

// 完成和失败内容样式
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
    color: #ff9800;
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
        color: #ff9800;
        margin-top: var(--van-padding-sm);
      }
    }
  }
}

// 动画定义
@keyframes belt-move {
  0% { background-position: 0 0; }
  100% { background-position: 20px 0; }
}

@keyframes glow-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

@keyframes combo-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
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
  .conveyor-area {
    height: 100px;
  }

  .conveyor-item {
    width: 45px;
    height: 45px;

    .item-icon {
      font-size: var(--text-2xl);
    }
  }

  .basket {
    min-height: 70px;
    padding: var(--spacing-sm);

    .basket-icon {
      font-size: var(--text-xl);
    }

    .basket-label {
      font-size: 10px;
    }

    .basket-count {
      font-size: var(--text-xs);
    }
  }
}

@media (max-width: 360px) {
  .control-area {
    .control-btn {
      font-size: 11px;
      height: 36px;
      gap: var(--spacing-xs);
    }
  }
}
</style>