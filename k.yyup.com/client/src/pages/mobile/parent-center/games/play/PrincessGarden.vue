<template>
  <div class="mobile-princess-garden-game">
    <van-nav-bar
      title="公主花园"
      left-text="返回"
      left-arrow
      @click-left="handleBack"
      class="game-navbar"
    />

    <div class="game-container">
      <!-- 游戏状态 -->
      <van-cell-group inset class="game-status">
        <van-cell class="status-info">
          <template #default>
            <div class="status-grid">
              <div class="status-item">
                <van-icon name="flower-o" class="status-icon" />
                <span class="status-value">{{ score }}</span>
              </div>
              <div class="status-item">
                <van-icon name="clock-o" class="status-icon" />
                <span class="status-value">{{ timeLeft }}秒</span>
              </div>
              <div class="status-item">
                <van-icon name="medal-o" class="status-icon" />
                <span class="status-value">第{{ level }}关</span>
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 游戏区域 -->
      <van-cell-group inset class="game-area">
        <van-cell class="garden-section">
          <template #default>
            <div class="garden-container">
              <div class="garden-background">
                <!-- 花朵种植区域 -->
                <div class="flower-bed">
                  <div
                    v-for="(slot, index) in flowerSlots"
                    :key="index"
                    class="flower-slot"
                    :class="{
                      'planted': slot.planted,
                      'watered': slot.watered,
                      'growing': slot.growing,
                      'blooming': slot.blooming
                    }"
                    @click="plantFlower(index)"
                  >
                    <div v-if="slot.planted" class="flower">
                      <div class="flower-stem" :style="{ height: slot.growth + 'px' }"></div>
                      <div v-if="slot.blooming" class="flower-blossom">
                        <span class="flower-emoji">{{ getFlowerEmoji(slot.type) }}</span>
                      </div>
                    </div>
                    <div v-else class="empty-slot">
                      <van-icon name="plus" size="20" />
                      <span>种植</span>
                    </div>
                  </div>
                </div>

                <!-- 工具栏 -->
                <div class="toolbar">
                  <div class="tool-item" @click="selectTool('seed')">
                    <van-icon name="flower-o" size="24" />
                    <span>种子</span>
                  </div>
                  <div class="tool-item" @click="selectTool('water')">
                    <van-icon name="water-o" size="24" />
                    <span>浇水</span>
                  </div>
                  <div class="tool-item" @click="selectTool('fertilizer')">
                    <van-icon name="fire-o" size="24" />
                    <span>肥料</span>
                  </div>
                </div>

                <!-- 选择面板 -->
                <div v-if="showSeedPanel" class="seed-panel">
                  <h4>选择种子</h4>
                  <div class="seed-options">
                    <div
                      v-for="seed in availableSeeds"
                      :key="seed.type"
                      class="seed-option"
                      @click="selectSeed(seed)"
                    >
                      <span class="seed-emoji">{{ seed.emoji }}</span>
                      <span class="seed-name">{{ seed.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 游戏目标 -->
      <van-cell-group inset class="game-objectives">
        <van-cell class="objectives">
          <template #default>
            <div class="objectives-content">
              <h4 class="objectives-title">
                <van-icon name="flag-o" />
                游戏目标
              </h4>
              <div class="objectives-list">
                <div class="objective-item" :class="{ completed: objective.completed }">
                  <van-icon :name="objective.completed ? 'success' : 'circle'" />
                  <span>{{ objective.text }}</span>
                </div>
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 控制按钮 -->
      <van-cell-group inset class="game-controls">
        <van-cell class="controls">
          <template #default>
            <div class="control-buttons">
              <van-button
                plain
                type="default"
                size="small"
                @click="handlePause"
                :disabled="gameOver"
              >
                {{ isPaused ? '继续' : '暂停' }}
              </van-button>
              <van-button
                type="primary"
                size="small"
                @click="handleRestart"
              >
                重新开始
              </van-button>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 成功弹窗 -->
    <van-popup v-model:show="showSuccess" position="center" round>
      <div class="success-popup">
        <van-icon name="success" size="64" color="#07c160" />
        <h3>关卡完成！</h3>
        <p>获得 {{ score }} 分</p>
        <van-button type="primary" @click="nextLevel" size="large" block>
          下一关
        </van-button>
      </div>
    </van-popup>

    <!-- 失败弹窗 -->
    <van-popup v-model:show="showFailure" position="center" round>
      <div class="failure-popup">
        <van-icon name="fail" size="64" color="#ee0a24" />
        <h3>时间到！</h3>
        <p>再试一次吧</p>
        <van-button type="primary" @click="handleRestart" size="large" block>
          重新开始
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showFailToast } from 'vant'

const router = useRouter()

// 游戏状态
const score = ref(0)
const level = ref(1)
const timeLeft = ref(60)
const isPaused = ref(false)
const gameOver = ref(false)

// 花园状态
const flowerSlots = ref<Array<{
  planted: boolean
  type: string
  growth: number
  watered: boolean
  fertilized: boolean
  blooming: boolean
}>>(Array(6).fill(null).map(() => ({
  planted: false,
  type: '',
  growth: 0,
  watered: false,
  fertilized: false,
  blooming: false
})))

// 工具和种子
const selectedTool = ref('seed')
const showSeedPanel = ref(false)
const selectedSeedType = ref('')

// 可用种子
const availableSeeds = ref([
  { type: 'rose', name: '玫瑰', emoji: '🌹', growthTime: 3000 },
  { type: 'sunflower', name: '向日葵', emoji: '🌻', growthTime: 4000 },
  { type: 'tulip', name: '郁金香', emoji: '🌷', growthTime: 2500 },
  { type: 'daisy', name: '雏菊', emoji: '🌼', growthTime: 2000 }
])

// UI状态
const showSuccess = ref(false)
const showFailure = ref(false)

// 游戏目标
const objectives = computed(() => [
  {
    text: `种植 ${Math.min(3 + level.value, 6)} 朵花`,
    completed: flowerSlots.value.filter(slot => slot.blooming).length >= Math.min(3 + level.value, 6)
  },
  {
    text: '给所有花浇水',
    completed: flowerSlots.value.filter(slot => slot.watered).length === flowerSlots.value.filter(slot => slot.planted).length
  }
])

// 计时器
let gameTimer: NodeJS.Timeout | null = null

// 获取花朵emoji
const getFlowerEmoji = (type: string) => {
  const seed = availableSeeds.value.find(s => s.type === type)
  return seed ? seed.emoji : '🌸'
}

// 选择工具
const selectTool = (tool: string) => {
  selectedTool.value = tool
  if (tool === 'seed') {
    showSeedPanel.value = !showSeedPanel.value
  } else {
    showSeedPanel.value = false
  }
  showToast(`选择了${tool === 'seed' ? '种子' : tool === 'water' ? '浇水' : '肥料'}工具`)
}

// 选择种子
const selectSeed = (seed: any) => {
  selectedSeedType.value = seed.type
  showSeedPanel.value = false
  showSuccessToast(`选择了${seed.name}种子`)
}

// 种植花朵
const plantFlower = (index: number) => {
  if (gameOver.value || isPaused.value) return

  const slot = flowerSlots.value[index]

  if (selectedTool.value === 'seed') {
    if (!slot.planted && selectedSeedType.value) {
      slot.planted = true
      slot.type = selectedSeedType.value
      slot.growth = 10
      showSuccessToast('种植成功！')
      score.value += 10

      // 开始生长
      setTimeout(() => {
        growFlower(index)
      }, 1000)
    } else {
      showToast('请先选择种子')
    }
  } else if (selectedTool.value === 'water') {
    if (slot.planted && !slot.watered) {
      slot.watered = true
      showSuccessToast('浇水成功！')
      score.value += 5

      // 加速生长
      if (slot.growth < 60) {
        slot.growth = Math.min(slot.growth + 20, 60)
        if (slot.growth >= 60 && !slot.blooming) {
          bloomFlower(index)
        }
      }
    }
  } else if (selectedTool.value === 'fertilizer') {
    if (slot.planted && !slot.fertilized) {
      slot.fertilized = true
      showSuccessToast('施肥成功！')
      score.value += 8

      // 加速生长
      if (slot.growth < 60) {
        slot.growth = Math.min(slot.growth + 30, 60)
        if (slot.growth >= 60 && !slot.blooming) {
          bloomFlower(index)
        }
      }
    }
  }
}

// 花朵生长
const growFlower = (index: number) => {
  const slot = flowerSlots.value[index]
  if (!slot.planted || slot.blooming) return

  const growthInterval = setInterval(() => {
    if (gameOver.value || isPaused.value) {
      clearInterval(growthInterval)
      return
    }

    slot.growth += 2

    if (slot.growth >= 60) {
      clearInterval(growthInterval)
      bloomFlower(index)
    }
  }, 100)
}

// 花朵开花
const bloomFlower = (index: number) => {
  const slot = flowerSlots.value[index]
  slot.blooming = true
  score.value += 20
  showSuccessToast('花朵绽放了！')

  // 检查是否完成目标
  checkGameComplete()
}

// 检查游戏完成
const checkGameComplete = () => {
  const targetFlowers = Math.min(3 + level.value, 6)
  const bloomingCount = flowerSlots.value.filter(slot => slot.blooming).length

  if (bloomingCount >= targetFlowers) {
    gameSuccess()
  }
}

// 游戏成功
const gameSuccess = () => {
  gameOver.value = true
  showSuccess.value = true
  if (gameTimer) {
    clearInterval(gameTimer)
  }
}

// 下一关
const nextLevel = () => {
  level.value++
  score.value += timeLeft.value * 2 // 时间奖励
  showSuccess.value = false
  initGame()
}

// 暂停游戏
const handlePause = () => {
  isPaused.value = !isPaused.value
  showToast(isPaused.value ? '游戏已暂停' : '游戏继续')
}

// 重新开始
const handleRestart = () => {
  showSuccess.value = false
  showFailure.value = false
  initGame()
}

// 返回
const handleBack = () => {
  if (gameTimer) {
    clearInterval(gameTimer)
  }
  router.push('/mobile/parent-center/games')
}

// 初始化游戏
const initGame = () => {
  score.value = 0
  timeLeft.value = 60
  isPaused.value = false
  gameOver.value = false

  // 重置花园
  flowerSlots.value = Array(6).fill(null).map(() => ({
    planted: false,
    type: '',
    growth: 0,
    watered: false,
    fertilized: false,
    blooming: false
  }))

  selectedTool.value = 'seed'
  selectedSeedType.value = ''
  showSeedPanel.value = false

  // 启动计时器
  if (gameTimer) {
    clearInterval(gameTimer)
  }

  gameTimer = setInterval(() => {
    if (!isPaused.value && !gameOver.value) {
      timeLeft.value--
      if (timeLeft.value <= 0) {
        gameOverFunc()
      }
    }
  }, 1000)
}

// 游戏结束
const gameOverFunc = () => {
  gameOver.value = true
  showFailure.value = true
  if (gameTimer) {
    clearInterval(gameTimer)
  }
}

onMounted(() => {
  initGame()
})

onUnmounted(() => {
  if (gameTimer) {
    clearInterval(gameTimer)
  }
})
</script>

<style scoped>
.mobile-princess-garden-game {
  min-height: 100vh;
  background: linear-gradient(135deg, #ffe4e1 0%, #ffd700 50%, #98fb98 100%);
  padding-bottom: var(--van-padding-md);
}

.game-navbar {
  background: linear-gradient(135deg, #ff69b4 0%, #ffb6c1 100%);
  color: white;
}

.game-container {
  padding: var(--van-padding-sm);
}

.game-status {
  margin-bottom: var(--van-padding-sm);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--van-padding-md);
  text-align: center;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--van-padding-xs);
}

.status-icon {
  color: #ff69b4;
  font-size: var(--text-xl);
}

.status-value {
  font-size: var(--text-base);
  font-weight: 600;
  color: #333;
}

.game-area {
  margin-bottom: var(--van-padding-sm);
  min-height: 300px;
}

.garden-container {
  background: linear-gradient(to bottom, #87ceeb 0%, #98fb98 100%);
  border-radius: var(--van-border-radius-lg);
  padding: var(--van-padding-lg);
  min-height: 250px;
}

.flower-bed {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--van-padding-md);
  margin-bottom: var(--van-padding-lg);
}

.flower-slot {
  aspect-ratio: 1;
  background: #8b4513;
  border-radius: var(--van-border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  border: 3px solid #654321;
  transition: all 0.3s;
}

.flower-slot:hover {
  transform: scale(1.05);
  border-color: #ff69b4;
}

.flower-slot.planted {
  background: #6b3410;
}

.flower-slot.watered {
  box-shadow: 0 0 10px rgba(0, 100, 200, 0.5);
}

.flower-slot.blooming {
  background: #90ee90;
  border-color: #32cd32;
}

.empty-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--van-padding-xs);
  color: white;
  font-size: var(--text-xs);
}

.flower {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.flower-stem {
  width: 4px;
  background: linear-gradient(to top, #228b22, #32cd32);
  border-radius: 2px;
  transition: height 0.5s ease;
}

.flower-blossom {
  position: absolute;
  top: -20px;
  font-size: var(--text-2xl);
  animation: bloom 0.5s ease;
}

.toolbar {
  display: flex;
  justify-content: space-around;
  background: white;
  border-radius: var(--van-border-radius-md);
  padding: var(--van-padding-sm);
  margin-bottom: var(--van-padding-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--van-padding-xs);
  padding: var(--van-padding-sm);
  cursor: pointer;
  border-radius: var(--van-border-radius-sm);
  transition: all 0.2s;
}

.tool-item:hover,
.tool-item.active {
  background: #ff69b4;
  color: white;
}

.tool-item span {
  font-size: var(--text-xs);
}

.seed-panel {
  background: white;
  border-radius: var(--van-border-radius-md);
  padding: var(--van-padding-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.seed-panel h4 {
  margin: 0 0 var(--van-padding-sm) 0;
  text-align: center;
  color: #333;
}

.seed-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--van-padding-sm);
}

.seed-option {
  display: flex;
  align-items: center;
  gap: var(--van-padding-xs);
  padding: var(--van-padding-sm);
  background: #f8f8f8;
  border-radius: var(--van-border-radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.seed-option:hover {
  background: #ff69b4;
  color: white;
}

.seed-emoji {
  font-size: var(--text-xl);
}

.seed-name {
  font-size: var(--text-xs);
}

.game-objectives {
  margin-bottom: var(--van-padding-sm);
}

.objectives-title {
  display: flex;
  align-items: center;
  gap: var(--van-padding-xs);
  color: #333;
  margin: 0 0 var(--van-padding-sm) 0;
  font-size: var(--text-base);
}

.objectives-list {
  display: flex;
  flex-direction: column;
  gap: var(--van-padding-xs);
}

.objective-item {
  display: flex;
  align-items: center;
  gap: var(--van-padding-xs);
  font-size: var(--text-sm);
  color: #666;
  padding: var(--van-padding-xs);
  border-radius: var(--van-border-radius-sm);
}

.objective-item.completed {
  color: #07c160;
  background: #f0f9ff;
}

.game-controls {
  margin-top: var(--van-padding-sm);
}

.control-buttons {
  display: flex;
  justify-content: space-around;
  gap: var(--van-padding-sm);
}

.control-buttons .van-button {
  flex: 1;
  max-width: 120px;
}

.success-popup,
.failure-popup {
  padding: var(--van-padding-xl);
  text-align: center;
  min-width: 240px;
}

.success-popup h3,
.failure-popup h3 {
  margin: var(--van-padding-md) 0 var(--van-padding-sm) 0;
  color: #333;
  font-size: var(--text-xl);
}

.success-popup p,
.failure-popup p {
  margin: 0 0 var(--van-padding-lg) 0;
  color: #666;
  font-size: var(--text-sm);
}

@keyframes bloom {
  0% {
    transform: scale(0) rotate(0deg);
  }
  50% {
    transform: scale(1.2) rotate(180deg);
  }
  100% {
    transform: scale(1) rotate(360deg);
  }
}

/* 移动端适配 */
@media (max-width: var(--breakpoint-xs)) {
  .flower-bed {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--van-padding-sm);
  }

  .flower-blossom {
    font-size: var(--text-xl);
  }

  .seed-options {
    grid-template-columns: 1fr;
  }
}
</style>