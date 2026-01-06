<template>
  <MobileLayout
    title="娃娃屋整理大师"
    :show-back="true"
    :show-nav-bar="true"
    @back="handleBack"
  >
    <div class="mobile-dollhouse-tidy">
      <!-- 游戏状态栏 -->
      <div class="game-status-bar">
        <div class="level-info">
          <span class="level-badge">第{{ currentLevel }}关</span>
        </div>
        <div class="score-info">
          <span class="score">得分: {{ score }}</span>
        </div>
        <div class="timer-info">
          <span class="timer">⏱️ {{ formatTime(timeElapsed) }}</span>
        </div>
      </div>

      <!-- 游戏说明 -->
      <div class="game-intro">
        <h3>🏠 娃娃屋整理大师</h3>
        <p>把物品拖到正确的房间！</p>
      </div>

      <!-- 房间区域 -->
      <div class="rooms-container">
        <div
          v-for="room in activeRooms"
          :key="room.id"
          class="room"
          :class="{ over: room.isOver }"
          :style="{ borderColor: room.color }"
          @touchmove="handleRoomTouchMove(room)"
          @touchend="handleRoomTouchEnd(room)"
        >
          <div class="room-icon">{{ room.icon }}</div>
          <div class="room-name" :style="{ color: room.color }">{{ room.name }}</div>
          <div class="room-items">
            <div
              v-for="(item, index) in room.items"
              :key="index"
              class="placed-item"
            >
              {{ item }}
            </div>
          </div>
          <div class="room-count" v-if="room.items.length > 0">
            {{ room.items.length }}件
          </div>
        </div>
      </div>

      <!-- 待整理物品 -->
      <div class="items-area">
        <div class="items-label">待整理物品 ({{ unplacedItems.length }})</div>
        <div class="items-list">
          <div
            v-for="item in unplacedItems"
            :key="item.id"
            class="drag-item"
            :class="{ dragging: draggedItem?.id === item.id }"
            @touchstart="handleItemTouchStart(item, $event)"
            @touchmove="handleItemTouchMove($event)"
            @touchend="handleItemTouchEnd($event)"
            @mousedown="handleMouseDown(item)"
          >
            <span class="item-icon">{{ item.icon }}</span>
            <span class="item-name">{{ item.name }}</span>
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
        <span class="item-icon">{{ draggedItem.icon }}</span>
      </div>

      <!-- 准确率显示 -->
      <div class="accuracy-info" v-if="totalPlacements > 0">
        <span class="accuracy-text">准确率: {{ accuracy }}%</span>
      </div>

      <!-- 控制按钮区 -->
      <div class="control-area">
        <button class="control-btn pause-btn" @click="handlePause">
          <span class="btn-icon">{{ isPaused ? '▶️' : '⏸️' }}</span>
          <span>{{ isPaused ? '继续' : '暂停' }}</span>
        </button>

        <button class="control-btn restart-btn" @click="handleRestart">
          <span class="btn-icon">🔄</span>
          <span>重新开始</span>
        </button>
      </div>

      <!-- 帮助按钮 -->
      <div class="help-area">
        <button class="help-btn" @click="showHelp = true">
          <span class="btn-icon">❓</span>
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
            <li><strong>第1-2关</strong>: 2个房间，6个物品</li>
            <li><strong>第3-4关</strong>: 3个房间，9个物品</li>
            <li><strong>第5关+</strong>: 4个房间，12个物品</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>🎮 房间说明</h3>
          <ul>
            <li><strong>🛏️ 卧室</strong>: 睡觉用品、衣物、玩具</li>
            <li><strong>🍳 厨房</strong>: 厨具、餐具、食材</li>
            <li><strong>🛋️ 客厅</strong>: 娱乐用品、书籍</li>
            <li><strong>🛁 浴室</strong>: 洗漱用品、毛巾</li>
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
        <h2>🎉 整理完成！</h2>
        <div class="score-info">
          <p>用时：{{ formatTime(timeElapsed) }}</p>
          <p>准确率：{{ accuracy }}%</p>
          <p>正确放置：{{ correctPlacements }}</p>
          <p>错误放置：{{ wrongPlacements }}</p>
          <p class="grade">{{ getGrade() }}</p>
        </div>
      </div>

      <div class="completion-actions">
        <van-button type="primary" block @click="handleNextLevel">下一关</van-button>
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
import { audioManager } from '../../parent-center/games/utils/audioManager'
import { buildBGMUrl, buildSFXUrl, buildVoiceUrl } from '@/utils/oss-url-builder'

const router = useRouter()

// 游戏状态
const currentLevel = ref(1)
const score = ref(0)
const timeElapsed = ref(0)
const correctPlacements = ref(0)
const wrongPlacements = ref(0)
const showCompletionDialog = ref(false)
const showHelp = ref(false)
const starsEarned = ref(0)
const isPaused = ref(false)

// 拖拽状态
const draggedItem = ref<any>(null)
const dragPosition = ref({ x: 0, y: 0 })
const dragOverRoom = ref<any>(null)

// 房间配置
const ROOMS = [
  {
    id: 1,
    name: '卧室',
    icon: '🛏️',
    color: '#ff9800',
    items: [] as string[],
    isOver: false
  },
  {
    id: 2,
    name: '厨房',
    icon: '🍳',
    color: '#4caf50',
    items: [] as string[],
    isOver: false
  },
  {
    id: 3,
    name: '客厅',
    icon: '🛋️',
    color: '#2196f3',
    items: [] as string[],
    isOver: false
  },
  {
    id: 4,
    name: '浴室',
    icon: '🛁',
    color: '#9c27b0',
    items: [] as string[],
    isOver: false
  }
]

// 物品配置
const ALL_ITEMS = [
  { id: 1, icon: '🛏️', name: '床', room: '卧室' },
  { id: 2, icon: '👗', name: '衣服', room: '卧室' },
  { id: 3, icon: '🧸', name: '玩具熊', room: '卧室' },
  { id: 4, icon: '🍳', name: '锅', room: '厨房' },
  { id: 5, icon: '🥄', name: '勺子', room: '厨房' },
  { id: 6, icon: '🍎', name: '苹果', room: '厨房' },
  { id: 7, icon: '🛋️', name: '沙发', room: '客厅' },
  { id: 8, icon: '📺', name: '电视', room: '客厅' },
  { id: 9, icon: '📚', name: '书籍', room: '客厅' },
  { id: 10, icon: '🛁', name: '浴缸', room: '浴室' },
  { id: 11, icon: '🧴', name: '洗发水', room: '浴室' },
  { id: 12, icon: '🧖', name: '毛巾', room: '浴室' }
]

// 计算属性
const activeRooms = computed(() => {
  if (currentLevel.value <= 2) return ROOMS.slice(0, 2)
  if (currentLevel.value <= 4) return ROOMS.slice(0, 3)
  return ROOMS
})

const unplacedItems = ref<any[]>([])
const totalPlacements = computed(() => correctPlacements.value + wrongPlacements.value)
const accuracy = computed(() => {
  return totalPlacements.value > 0
    ? Math.round((correctPlacements.value / totalPlacements.value) * 100)
    : 100
})

// 定时器
let timerInterval: number | null = null

// 初始化游戏
const initLevel = () => {
  const itemCount = Math.min(6 + currentLevel.value * 2, 12)
  unplacedItems.value = ALL_ITEMS.slice(0, itemCount)

  // 清空房间物品
  ROOMS.forEach(room => {
    room.items = []
    room.isOver = false
  })

  correctPlacements.value = 0
  wrongPlacements.value = 0
  timeElapsed.value = 0

  playVoice('game-start')
}

// 开始计时
const startTimer = () => {
  timerInterval = window.setInterval(() => {
    if (!isPaused.value) {
      timeElapsed.value++
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

// 格式化时间
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 触摸事件处理
const handleItemTouchStart = (item: any, event: TouchEvent) => {
  event.preventDefault()
  draggedItem.value = item

  const touch = event.touches[0]
  dragPosition.value = {
    x: touch.clientX,
    y: touch.clientY
  }
}

const handleItemTouchMove = (event: TouchEvent) => {
  if (!draggedItem.value) return

  event.preventDefault()
  const touch = event.touches[0]
  dragPosition.value = {
    x: touch.clientX,
    y: touch.clientY
  }
}

const handleItemTouchEnd = (event: TouchEvent) => {
  if (!draggedItem.value) return

  event.preventDefault()

  // 检查是否在房间上
  const touch = event.changedTouches[0]
  const element = document.elementFromPoint(touch.clientX, touch.clientY)
  const roomElement = element?.closest('.room')

  if (roomElement) {
    const roomId = parseInt(roomElement.getAttribute('data-room-id') || '0')
    const room = activeRooms.value.find(r => r.id === roomId)
    if (room) {
      handleDrop(room)
    }
  } else {
    // 没有放到房间上，物品回到原位
    draggedItem.value = null
  }

  clearDragStates()
}

// 房间触摸事件
const handleRoomTouchMove = (room: any) => {
  if (draggedItem.value) {
    room.isOver = true
    dragOverRoom.value = room
  }
}

const handleRoomTouchEnd = (room: any) => {
  if (draggedItem.value && dragOverRoom.value?.id === room.id) {
    handleDrop(room)
  }
  clearDragStates()
}

// 鼠标事件（桌面端）
const handleMouseDown = (item: any) => {
  draggedItem.value = item
}

// 清除拖拽状态
const clearDragStates = () => {
  draggedItem.value = null
  dragPosition.value = { x: 0, y: 0 }
  dragOverRoom.value = null
  activeRooms.value.forEach(room => {
    room.isOver = false
  })
}

// 处理物品放置
const handleDrop = (room: any) => {
  if (!draggedItem.value) return

  const item = draggedItem.value

  if (item.room === room.name) {
    // 正确放置
    correctPlacements.value++
    score.value += 100
    room.items.push(item.icon)
    unplacedItems.value = unplacedItems.value.filter(i => i.id !== item.id)

    playSound('correct')
    playVoice('correct')
    showSuccessToast(`✅ ${item.name}应该放在${room.name}！`)

    // 检查是否完成
    if (unplacedItems.value.length === 0) {
      handleLevelComplete()
    }
  } else {
    // 错误放置
    wrongPlacements.value++

    playSound('wrong')
    showFailToast(`❌ ${item.name}不应该放在${room.name}！`)
  }

  clearDragStates()
}

// 关卡完成
const handleLevelComplete = () => {
  stopTimer()

  if (accuracy.value === 100) {
    starsEarned.value = 3
  } else if (accuracy.value >= 85) {
    starsEarned.value = 2
  } else {
    starsEarned.value = 1
  }

  playVoice('level-complete')
  showCompletionDialog.value = true
}

// 获取评级
const getGrade = () => {
  if (starsEarned.value === 3) return '整理大师！'
  if (starsEarned.value === 2) return '整理达人！'
  return '整理新手！'
}

// 下一关
const handleNextLevel = () => {
  currentLevel.value++
  showCompletionDialog.value = false
  initLevel()
  startTimer()

  showToast(`进入第${currentLevel.value}关！`)
}

// 重新开始
const handleRestart = () => {
  currentLevel.value = 1
  score.value = 0
  showCompletionDialog.value = false
  initLevel()
  startTimer()
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
  stopTimer()
  router.push('/mobile/parent-center/games')
}

// 音频
const playSound = (type: string) => {
  const soundMap: Record<string, string> = {
    'correct': buildSFXUrl('correct.mp3'),
    'wrong': buildSFXUrl('wrong.mp3'),
    'success': buildSFXUrl('success.mp3')
  }

  if (soundMap[type]) {
    const audio = new Audio(soundMap[type])
    audio.volume = 0.5
    audio.play().catch(err => console.log('音效播放失败:', err))
  }
}

const playVoice = (type: string) => {
  let voicePath = ''

  const voiceMap: Record<string, string> = {
    'game-start': 'game-start.mp3',
    'correct': 'correct.mp3',
    'level-complete': 'level-complete.mp3'
  }

  const fileName = voiceMap[type]
  if (fileName) {
    voicePath = buildVoiceUrl(fileName, 'dollhouse')
  }

  if (!voicePath) return

  const audio = new Audio(voicePath)
  audio.volume = 0.8
  audio.play().catch(err => console.log('语音播放失败:', err))
}

onMounted(() => {
  initLevel()
  startTimer()

  // 播放BGM
  try {
    audioManager.playBGM(buildBGMUrl('dollhouse-bgm.mp3'))
  } catch (error) {
    console.log('BGM播放失败:', error)
  }
})

onUnmounted(() => {
  stopTimer()
  audioManager.dispose()
})
</script>

<style scoped lang="scss">
.mobile-dollhouse-tidy {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 50%, #ffcc80 100%);
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

  .timer-info .timer {
    font-size: var(--text-sm);
    color: #666;
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

// 房间容器
.rooms-container {
  display: flex;
  justify-content: space-around;
  gap: var(--van-padding-xs);
  margin-bottom: var(--van-padding-sm);
  flex-wrap: wrap;
}

.room {
  flex: 1;
  min-width: calc(50% - var(--van-padding-xs));
  max-width: calc(50% - var(--van-padding-xs));
  background: rgba(255, 255, 255, 0.9);
  border: 3px solid;
  border-radius: var(--van-radius-lg);
  padding: var(--van-padding-sm);
  text-align: center;
  transition: all 0.3s ease;
  min-height: 100px;
  position: relative;

  &.over {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  .room-icon {
    font-size: var(--text-2xl);
    margin-bottom: 4px;
  }

  .room-name {
    font-size: var(--text-xs);
    font-weight: bold;
    margin-bottom: var(--van-padding-xs);
  }

  .room-items {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    justify-content: center;
    margin-bottom: var(--van-padding-xs);

    .placed-item {
      font-size: var(--text-base);
      background: rgba(255, 255, 255, 0.8);
      border-radius: var(--van-radius-sm);
      padding: 2px 4px;
    }
  }

  .room-count {
    position: absolute;
    top: var(--van-padding-xs);
    right: var(--van-padding-xs);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: var(--van-radius-sm);
  }
}

// 待整理物品区域
.items-area {
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--van-radius-lg);
  padding: var(--van-padding-sm);
  margin-bottom: var(--van-padding-sm);

  .items-label {
    font-size: var(--text-sm);
    font-weight: bold;
    color: #333;
    margin-bottom: var(--van-padding-xs);
    text-align: center;
  }

  .items-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--van-padding-xs);
    justify-content: center;
  }

  .drag-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: white;
    border: 2px solid #ddd;
    border-radius: var(--van-radius-md);
    padding: var(--van-padding-xs);
    cursor: grab;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    transition: all 0.2s ease;
    min-width: 60px;

    &.dragging {
      opacity: 0.5;
    }

    .item-icon {
      font-size: var(--text-2xl);
      margin-bottom: 2px;
    }

    .item-name {
      font-size: 10px;
      color: #666;
      text-align: center;
    }
  }
}

// 拖拽中的物品
.dragging-item {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  pointer-events: none;
  transform: translate(-50%, -50%);

  .item-icon {
    font-size: var(--text-4xl);
    filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
  }
}

// 准确率信息
.accuracy-info {
  text-align: center;
  margin-bottom: var(--van-padding-sm);

  .accuracy-text {
    display: inline-block;
    background: rgba(255, 255, 255, 0.9);
    padding: var(--spacing-xs) 12px;
    border-radius: var(--van-radius-md);
    font-size: var(--text-xs);
    font-weight: bold;
    color: #4caf50;
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
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 50px;
    border: none;
    border-radius: var(--van-radius-md);
    font-size: 11px;
    font-weight: 500;
    transition: all 0.2s ease;
    gap: var(--spacing-xs);

    &.pause-btn {
      background: linear-gradient(135deg, #9c27b0, #ba68c8);
      color: white;
    }

    &.restart-btn {
      background: linear-gradient(135deg, #607d8b, #78909c);
      color: white;
    }

    &:active {
      transform: scale(0.95);
    }

    .btn-icon {
      font-size: var(--text-base);
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

    .btn-icon {
      font-size: var(--text-sm);
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
        color: #e65100;
        border-bottom-color: #ff9800;
      }

      ul li {
        color: #e65100;
      }
    }
  }
}

.help-actions,
.completion-actions {
  padding: var(--van-padding-sm);
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: var(--van-padding-xs);
}

// 完成内容样式
.completion-content {
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
  .rooms-container {
    .room {
      min-height: 80px;
      padding: var(--van-padding-xs);

      .room-icon {
        font-size: var(--text-xl);
      }

      .room-name {
        font-size: 10px;
      }
    }
  }

  .items-area {
    .drag-item {
      min-width: 50px;
      padding: var(--spacing-xs);

      .item-icon {
        font-size: var(--text-xl);
      }

      .item-name {
        font-size: 8px;
      }
    }
  }

  .control-area .control-btn {
    height: 45px;
    font-size: 10px;

    .btn-icon {
      font-size: var(--text-sm);
    }
  }
}

@media (max-width: 360px) {
  .game-status-bar {
    .level-info .level-badge,
    .score-info .score,
    .timer-info .timer {
      font-size: var(--text-xs);
    }
  }

  .rooms-container .room {
    min-width: calc(50% - 2px);
  }
}
</style>