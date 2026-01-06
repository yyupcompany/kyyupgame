<template>
  <div class="mobile-robot-factory-game">
    <van-nav-bar
      title="机器人工厂"
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
        <van-cell class="game-content">
          <template #default>
            <div class="factory-container">
              <div class="assembly-line">
                <div class="robot-parts">
                  <div
                    v-for="(part, index) in robotParts"
                    :key="index"
                    class="robot-part"
                    :class="{ 'selected': selectedPart === index }"
                    @click="selectPart(index)"
                  >
                    <span class="part-emoji">{{ part.emoji }}</span>
                    <span class="part-name">{{ part.name }}</span>
                  </div>
                </div>

                <div class="robot-display">
                  <div class="robot">
                    <div class="robot-head">
                      <span class="robot-eyes">👀</span>
                    </div>
                    <div class="robot-body">
                      <div v-for="(component, index) in robotComponents" :key="index" class="component">
                        <span class="component-emoji">{{ component }}</span>
                      </div>
                    </div>
                    <div class="robot-arms">
                      <span class="arm">🦾</span>
                      <span class="arm">🦾</span>
                    </div>
                    <div class="robot-legs">
                      <span class="leg">🦿</span>
                      <span class="leg">🦿</span>
                    </div>
                  </div>
                </div>

                <div class="target-robot">
                  <h4>目标机器人</h4>
                  <div class="target-display">
                    <span class="target-component" v-for="(component, index) in targetComponents" :key="index">
                      {{ component }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 控制按钮 -->
              <div class="controls">
                <van-button
                  type="primary"
                  size="large"
                  @click="assembleRobot"
                  :disabled="robotComponents.length === 0"
                >
                  组装机器人
                </van-button>
                <van-button
                  plain
                  type="default"
                  size="large"
                  @click="clearRobot"
                >
                  清空
                </van-button>
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
                任务目标
              </h4>
              <div class="objectives-list">
                <div class="objective-item">
                  <span>组装 {{ targetCount }} 个目标机器人</span>
                </div>
              </div>
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
        <p>获得了 {{ score }} 分</p>
        <van-button type="primary" @click="nextLevel" size="large" block>
          下一关
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'

const router = useRouter()

// 游戏状态
const score = ref(0)
const level = ref(1)
const timeLeft = ref(60)
const targetCount = 3

// 机器人组件
const robotParts = ref([
  { emoji: '⚙️', name: '齿轮' },
  { emoji: '🔧', name: '扳手' },
  { emoji: '🔌', name: '插头' },
  { emoji: '🔋', name: '电池' },
  { emoji: '💡', name: '灯泡' },
  { emoji: '🎛️', name: '控制面板' }
])

const selectedPart = ref(-1)
const robotComponents = ref<string[]>([])
const targetComponents = ref<string[]>([])

// UI状态
const showSuccess = ref(false)

// 计时器
let gameTimer: NodeJS.Timeout | null = null

// 选择零件
const selectPart = (index: number) => {
  selectedPart.value = index
  const part = robotParts.value[index]
  robotComponents.value.push(part.emoji)
  showToast(`添加了${part.name}`)
}

// 组装机器人
const assembleRobot = () => {
  if (robotComponents.value.length === 0) return

  // 检查是否匹配目标
  const isMatch = checkRobotMatch()

  if (isMatch) {
    score.value += 100
    showSuccessToast('机器人组装成功！')
    completedRobots.value++

    // 检查是否完成关卡
    if (completedRobots.value >= targetCount) {
      levelComplete()
    } else {
      // 生成新的目标
      generateTargetRobot()
      clearRobot()
    }
  } else {
    score.value -= 20
    showToast('机器人不匹配，请重试')
    clearRobot()
  }
}

// 检查机器人匹配
const checkRobotMatch = () => {
  if (robotComponents.value.length !== targetComponents.value.length) {
    return false
  }

  return robotComponents.value.every((component, index) =>
    component === targetComponents.value[index]
  )
}

// 清空机器人
const clearRobot = () => {
  robotComponents.value = []
  selectedPart.value = -1
}

// 生成目标机器人
const generateTargetRobot = () => {
  const componentCount = Math.min(3 + level.value, 6)
  targetComponents.value = []

  for (let i = 0; i < componentCount; i++) {
    const randomPart = robotParts.value[Math.floor(Math.random() * robotParts.value.length)]
    targetComponents.value.push(randomPart.emoji)
  }
}

// 完成机器人数量
const completedRobots = ref(0)

// 关卡完成
const levelComplete = () => {
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
  completedRobots.value = 0
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
  timeLeft.value = 60 + level.value * 10
  completedRobots.value = 0
  clearRobot()
  generateTargetRobot()

  if (gameTimer) {
    clearInterval(gameTimer)
  }

  gameTimer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      gameOver()
    }
  }, 1000)
}

// 游戏结束
const gameOver = () => {
  if (gameTimer) {
    clearInterval(gameTimer)
  }
  showToast('时间到！')
  // 可以添加游戏结束逻辑
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
.mobile-robot-factory-game {
  min-height: 100vh;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%);
  padding-bottom: var(--van-padding-md);
}

.game-navbar {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
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
  color: #2196f3;
  font-size: var(--text-xl);
}

.status-value {
  font-size: var(--text-base);
  font-weight: 600;
  color: #333;
}

.game-area {
  margin-bottom: var(--van-padding-sm);
  min-height: 400px;
}

.factory-container {
  background: white;
  border-radius: var(--van-border-radius-lg);
  padding: var(--van-padding-lg);
}

.assembly-line {
  margin-bottom: var(--van-padding-lg);
}

.robot-parts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--van-padding-sm);
  margin-bottom: var(--van-padding-lg);
}

.robot-part {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--van-padding-xs);
  padding: var(--van-padding-sm);
  background: #f5f5f5;
  border-radius: var(--van-border-radius-md);
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.robot-part.selected {
  border-color: #2196f3;
  background: #e3f2fd;
}

.part-emoji {
  font-size: var(--text-2xl);
}

.part-name {
  font-size: var(--text-xs);
  color: #666;
}

.robot-display,
.target-robot {
  text-align: center;
  margin-bottom: var(--van-padding-lg);
}

.robot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--van-padding-xs);
  padding: var(--van-padding-md);
  background: #f8f8f8;
  border-radius: var(--van-border-radius-lg);
  min-height: 200px;
  justify-content: center;
}

.robot-head {
  font-size: var(--text-4xl);
  margin-bottom: var(--van-padding-xs);
}

.robot-eyes {
  font-size: var(--text-2xl);
}

.robot-body {
  display: flex;
  gap: var(--van-padding-xs);
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: var(--van-padding-xs);
}

.component {
  font-size: var(--text-xl);
  padding: var(--van-padding-xs);
  background: white;
  border-radius: var(--van-border-radius-sm);
  border: 1px solid #e0e0e0;
}

.robot-arms,
.robot-legs {
  display: flex;
  justify-content: space-around;
  width: 100%;
  gap: var(--van-padding-lg);
}

.arm,
.leg {
  font-size: var(--text-2xl);
}

.target-robot h4 {
  margin: 0 0 var(--van-padding-sm) 0;
  color: #333;
  font-size: var(--text-base);
}

.target-display {
  display: flex;
  justify-content: center;
  gap: var(--van-padding-xs);
  flex-wrap: wrap;
}

.target-component {
  font-size: var(--text-xl);
  padding: var(--van-padding-xs);
  background: #fff3e0;
  border-radius: var(--van-border-radius-sm);
  border: 1px solid #ffcc80;
}

.controls {
  display: flex;
  gap: var(--van-padding-sm);
  margin-top: var(--van-padding-lg);
}

.controls .van-button {
  flex: 1;
}

.game-objectives {
  margin-top: var(--van-padding-sm);
}

.objectives-title {
  display: flex;
  align-items: center;
  gap: var(--van-padding-xs);
  color: #333;
  margin: 0 0 var(--van-padding-sm) 0;
  font-size: var(--text-base);
}

.objective-item {
  display: flex;
  align-items: center;
  gap: var(--van-padding-xs);
  font-size: var(--text-sm);
  color: #666;
  padding: var(--van-padding-xs);
  background: #f8f8f8;
  border-radius: var(--van-border-radius-sm);
}

.success-popup {
  padding: var(--van-padding-xl);
  text-align: center;
  min-width: 240px;
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

/* 移动端适配 */
@media (max-width: var(--breakpoint-xs)) {
  .robot-parts {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--van-padding-xs);
  }

  .part-emoji {
    font-size: var(--text-xl);
  }

  .component,
  .target-component {
    font-size: var(--text-base);
  }

  .robot-body {
    gap: var(--van-padding-xs);
  }
}
</style>