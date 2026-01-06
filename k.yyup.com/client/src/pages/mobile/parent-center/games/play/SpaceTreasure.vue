<template>
  <div class="mobile-space-treasure-game">
    <van-nav-bar
      title="太空宝藏"
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
                <van-icon name="fire-o" class="status-icon" />
                <span class="status-value">{{ score }}</span>
              </div>
              <div class="status-item">
                <van-icon name="gem-o" class="status-icon" />
                <span class="status-value">{{ collectedTreasures }}/{{ totalTreasures }}</span>
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
        <van-cell class="game-content">
          <template #default>
            <div class="space-container">
              <!-- 太空场景 -->
              <div class="space-scene">
                <div class="stars-background">
                  <div v-for="n in 50" :key="n" class="star" :style="getStarStyle()"></div>
                </div>

                <!-- 太空飞船 -->
                <div class="spaceship" :style="spaceshipStyle">
                  <div class="spaceship-body">🚀</div>
                  <div class="spaceship-flame">🔥</div>
                </div>

                <!-- 宝藏 -->
                <div
                  v-for="(treasure, index) in treasures"
                  :key="index"
                  class="treasure"
                  :class="{ 'collected': treasure.collected }"
                  :style="getTreasureStyle(treasure)"
                  @click="collectTreasure(index)"
                >
                  <span class="treasure-emoji">{{ treasure.emoji }}</span>
                </div>

                <!-- 障碍物 -->
                <div
                  v-for="(obstacle, index) in obstacles"
                  :key="'obs-' + index"
                  class="obstacle"
                  :style="getObstacleStyle(obstacle)"
                >
                  <span class="obstacle-emoji">{{ obstacle.emoji }}</span>
                </div>
              </div>

              <!-- 控制区域 -->
              <div class="controls">
                <div class="control-buttons">
                  <van-button
                    icon="arrow-up"
                    size="large"
                    @touchstart="startMove('up')"
                    @touchend="stopMove"
                    @mousedown="startMove('up')"
                    @mouseup="stopMove"
                  />
                </div>
                <div class="control-buttons">
                  <van-button
                    icon="arrow-left"
                    size="large"
                    @touchstart="startMove('left')"
                    @touchend="stopMove"
                    @mousedown="startMove('left')"
                    @mouseup="stopMove"
                  />
                  <van-button
                    icon="arrow-down"
                    size="large"
                    @touchstart="startMove('down')"
                    @touchend="stopMove"
                    @mousedown="startMove('down')"
                    @mouseup="stopMove"
                  />
                  <van-button
                    icon="arrow-right"
                    size="large"
                    @touchstart="startMove('right')"
                    @touchend="stopMove"
                    @mousedown="startMove('right')"
                    @mouseup="stopMove"
                  />
                </div>
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 游戏说明 -->
      <van-cell-group inset class="game-instructions">
        <van-cell class="instructions">
          <template #default>
            <div class="instructions-content">
              <h4 class="instructions-title">
                <van-icon name="info-o" />
                游戏说明
              </h4>
              <p>控制飞船收集所有宝藏，避开障碍物！</p>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 成功弹窗 -->
    <van-popup v-model:show="showSuccess" position="center" round>
      <div class="success-popup">
        <van-icon name="success" size="64" color="#07c160" />
        <h3>任务完成！</h3>
        <p>收集了所有宝藏！</p>
        <van-button type="primary" @click="nextLevel" size="large" block>
          下一关
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'

const router = useRouter()

// 游戏状态
const score = ref(0)
const level = ref(1)
const collectedTreasures = ref(0)

// 飞船位置
const spaceshipX = ref(50)
const spaceshipY = ref(50)

// 游戏元素
const treasures = ref<Array<{
  x: number
  y: number
  emoji: string
  collected: boolean
}>>([])

const obstacles = ref<Array<{
  x: number
  y: number
  emoji: string
}>>([])

// 移动状态
const moveDirection = ref('')
const isMoving = ref(false)

// UI状态
const showSuccess = ref(false)

// 游戏循环
let gameLoop: NodeJS.Timeout | null = null
let moveInterval: NodeJS.Timeout | null = null

// 计算属性
const totalTreasures = computed(() => treasures.value.length)

const spaceshipStyle = computed(() => ({
  left: `${spaceshipX.value}%`,
  top: `${spaceshipY.value}%`
}))

// 获取星星样式
const getStarStyle = () => {
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${2 + Math.random() * 2}s`
  }
}

// 获取宝藏样式
const getTreasureStyle = (treasure: any) => ({
  left: `${treasure.x}%`,
  top: `${treasure.y}%`
})

// 获取障碍物样式
const getObstacleStyle = (obstacle: any) => ({
  left: `${obstacle.x}%`,
  top: `${obstacle.y}%`
})

// 开始移动
const startMove = (direction: string) => {
  if (isMoving.value) return
  moveDirection.value = direction
  isMoving.value = true

  moveInterval = setInterval(() => {
    moveSpaceship(direction)
  }, 50)
}

// 停止移动
const stopMove = () => {
  isMoving.value = false
  if (moveInterval) {
    clearInterval(moveInterval)
    moveInterval = null
  }
}

// 移动飞船
const moveSpaceship = (direction: string) => {
  const speed = 2
  switch (direction) {
    case 'up':
      spaceshipY.value = Math.max(0, spaceshipY.value - speed)
      break
    case 'down':
      spaceshipY.value = Math.min(90, spaceshipY.value + speed)
      break
    case 'left':
      spaceshipX.value = Math.max(0, spaceshipX.value - speed)
      break
    case 'right':
      spaceshipX.value = Math.min(95, spaceshipX.value + speed)
      break
  }

  checkCollisions()
}

// 检查碰撞
const checkCollisions = () => {
  // 检查宝藏收集
  treasures.value.forEach((treasure, index) => {
    if (!treasure.collected) {
      const distance = Math.sqrt(
        Math.pow(spaceshipX.value - treasure.x, 2) +
        Math.pow(spaceshipY.value - treasure.y, 2)
      )

      if (distance < 5) {
        collectTreasure(index)
      }
    }
  })

  // 检查障碍物碰撞
  obstacles.value.forEach(obstacle => {
    const distance = Math.sqrt(
      Math.pow(spaceshipX.value - obstacle.x, 2) +
      Math.pow(spaceshipY.value - obstacle.y, 2)
    )

    if (distance < 5) {
      hitObstacle()
    }
  })
}

// 收集宝藏
const collectTreasure = (index: number) => {
  const treasure = treasures.value[index]
  if (!treasure.collected) {
    treasure.collected = true
    collectedTreasures.value++
    score.value += 50
    showSuccessToast('收集到宝藏！')

    // 检查是否完成关卡
    if (collectedTreasures.value >= totalTreasures.value) {
      levelComplete()
    }
  }
}

// 撞到障碍物
const hitObstacle = () => {
  score.value = Math.max(0, score.value - 20)
  showToast('撞到障碍物！')

  // 震动反馈
  if (navigator.vibrate) {
    navigator.vibrate(200)
  }
}

// 初始化游戏
const initGame = () => {
  spaceshipX.value = 50
  spaceshipY.value = 50
  collectedTreasures.value = 0

  // 生成宝藏
  const treasureCount = Math.min(3 + level.value, 8)
  treasures.value = []
  for (let i = 0; i < treasureCount; i++) {
    treasures.value.push({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      emoji: ['💎', '💰', '🏆', '👑', '⭐', '🔮', '💍', '🎁'][i % 8],
      collected: false
    })
  }

  // 生成障碍物
  const obstacleCount = Math.min(2 + Math.floor(level.value / 2), 6)
  obstacles.value = []
  for (let i = 0; i < obstacleCount; i++) {
    obstacles.value.push({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      emoji: ['☄️', '🌑', '🛸', '👾', '🌋'][i % 5]
    })
  }
}

// 关卡完成
const levelComplete = () => {
  showSuccess.value = true
  score.value += 100 * level.value // 关卡奖励
  if (gameLoop) {
    clearInterval(gameLoop)
  }
}

// 下一关
const nextLevel = () => {
  level.value++
  showSuccess.value = false
  initGame()
  showSuccessToast(`进入第${level.value}关`)
}

// 返回
const handleBack = () => {
  if (gameLoop) {
    clearInterval(gameLoop)
  }
  if (moveInterval) {
    clearInterval(moveInterval)
  }
  router.push('/mobile/parent-center/games')
}

onMounted(() => {
  initGame()
})

onUnmounted(() => {
  if (gameLoop) {
    clearInterval(gameLoop)
  }
  if (moveInterval) {
    clearInterval(moveInterval)
  }
})
</script>

<style scoped>
.mobile-space-treasure-game {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0e27 0%, #1a237e 50%, #283593 100%);
  padding-bottom: var(--van-padding-md);
  color: white;
}

.game-navbar {
  background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
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
  color: #64b5f6;
  font-size: var(--text-xl);
}

.status-value {
  font-size: var(--text-base);
  font-weight: 600;
  color: white;
}

.game-area {
  margin-bottom: var(--van-padding-sm);
  min-height: 400px;
}

.space-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--van-border-radius-lg);
  padding: var(--van-padding-md);
  backdrop-filter: blur(10px);
}

.space-scene {
  position: relative;
  width: 100%;
  height: 300px;
  background: radial-gradient(ellipse at center, #1a237e 0%, #0a0e27 100%);
  border-radius: var(--van-border-radius-md);
  overflow: hidden;
  margin-bottom: var(--van-padding-lg);
}

.stars-background {
  position: absolute;
  width: 100%;
  height: 100%;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  animation: twinkle linear infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.spaceship {
  position: absolute;
  font-size: var(--text-2xl);
  z-index: 10;
  transition: none;
  transform: translate(-50%, -50%);
}

.spaceship-body {
  position: relative;
  z-index: 2;
}

.spaceship-flame {
  position: absolute;
  font-size: var(--text-base);
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
}

.treasure {
  position: absolute;
  font-size: var(--text-xl);
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: all 0.3s;
  animation: float 3s ease-in-out infinite;
}

.treasure.collected {
  opacity: 0.3;
  pointer-events: none;
}

@keyframes float {
  0%, 100% { transform: translate(-50%, -50%) translateY(0); }
  50% { transform: translate(-50%, -50%) translateY(-5px); }
}

.obstacle {
  position: absolute;
  font-size: var(--text-lg);
  transform: translate(-50%, -50%);
  animation: rotate 4s linear infinite;
}

@keyframes rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--van-padding-sm);
}

.control-buttons {
  display: flex;
  gap: var(--van-padding-xs);
}

.control-buttons:first-child {
  margin-bottom: var(--van-padding-xs);
}

.control-buttons .van-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  min-width: 50px;
  height: 50px;
}

.control-buttons .van-button:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.95);
}

.game-instructions {
  margin-top: var(--van-padding-sm);
}

.instructions {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.instructions-title {
  display: flex;
  align-items: center;
  gap: var(--van-padding-xs);
  color: white;
  margin: 0 0 var(--van-padding-sm) 0;
  font-size: var(--text-base);
}

.instructions p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: var(--text-sm);
}

.success-popup {
  padding: var(--van-padding-xl);
  text-align: center;
  min-width: 240px;
  background: white;
  color: #333;
}

.success-popup h3 {
  margin: var(--van-padding-md) 0 var(--van-padding-sm) 0;
  color: #333;
  font-size: var(--text-xl);
}

.success-popup p {
  margin: 0 0 var(--van-padding-lg) 0;
  color: #666;
  font-size: var(--text-sm);
}

/* 移动端优化 */
@media (max-width: var(--breakpoint-xs)) {
  .space-scene {
    height: 250px;
  }

  .spaceship {
    font-size: var(--text-xl);
  }

  .treasure {
    font-size: var(--text-base);
  }

  .obstacle {
    font-size: var(--text-sm);
  }

  .control-buttons .van-button {
    min-width: 45px;
    height: 45px;
  }
}
</style>